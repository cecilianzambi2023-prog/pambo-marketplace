/**
 * HUB_INTEGRATION_GUIDE.md
 * ========================
 * Complete Integration Guide for Hub Router System
 * 
 * This guide shows how to integrate the hub system into your Pambo app.
 */

# Hub System Integration Guide

## Overview

The hub system consists of:
1. **HubArchitecture.ts** - Type definitions
2. **HubConfig.ts** - Configuration for all 6 hubs
3. **HubContext.tsx** - React Context for global state
4. **HubRouter.tsx** - Main routing and layout component
5. **HubSwitcherNav.tsx** - Navigation switcher components
6. **HubListingForm.tsx** - Hub-specific listing creation
7. **HubDashboard.tsx** - Hub analytics and overview

## Step 1: Wrap App with HubProvider

In your **App.tsx**:

```tsx
import { HubProvider } from './contexts/HubContext';
import { HubRouter } from './components/HubRouter';
import { HubSwitcherNav } from './components/HubSwitcherNav';

function App() {
  return (
    <HubProvider>
      {/* Your existing layout */}
      <div className="flex flex-col min-h-screen">
        {/* Top Navigation */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <HubSwitcherNav />
          </div>
        </header>

        {/* Main Content */}
        <HubRouter>
          <YourPageContent />
        </HubRouter>
      </div>
    </HubProvider>
  );
}
```

## Step 2: Create Hub Pages

Create pages for each hub view:

### pages/HubMarketplace.tsx
```tsx
import { HubDashboard } from '../components/HubDashboard';

export function HubMarketplacePage() {
  return <HubDashboard />;
}
```

### pages/HubWholesale.tsx
```tsx
import { HubDashboard } from '../components/HubDashboard';

export function HubWholesalePage() {
  return <HubDashboard />;
}
```

## Step 3: Implement Hub Routing

In your main **router.tsx** or **main routing logic**:

```tsx
import { useHub } from './contexts/HubContext';

function PageRouter() {
  const { hubId } = useHub();

  switch (hubId) {
    case 'marketplace':
      return <HubMarketplacePage />;
    case 'wholesale':
      return <HubWholesalePage />;
    case 'digital':
      return <HubDigitalPage />;
    case 'mkulima':
      return <HubMkulimaPage />;
    case 'services':
      return <HubServicesPage />;
    case 'live_commerce':
      return <HubLiveCommercePage />;
    default:
      return <HubMarketplacePage />;
  }
}
```

## Step 4: Use Hub Hooks in Components

### Check Hub Features
```tsx
import { useHubFeatures } from './contexts/HubContext';

function MyComponent() {
  const { hasFeature } = useHubFeatures();

  if (hasFeature('liveStreaming')) {
    return <LiveStreamingFeature />;
  }

  return null;
}
```

### Get Hub Business Rules
```tsx
import { useHubRules } from './contexts/HubContext';

function CreateListingForm() {
  const { getListingLimit, requiresVerification } = useHubRules();
  const userTier = 'starter'; // Get from subscription

  const limit = getListingLimit(userTier);
  const needsVerification = requiresVerification();

  return (
    <form>
      <p>You can create up to {limit} listings</p>
      {needsVerification && <VerificationRequired />}
    </form>
  );
}
```

### Switch Hubs Programmatically
```tsx
import { useHubSwitch } from './contexts/HubContext';

function HubSwitchButton() {
  const { switchHub } = useHubSwitch();

  const goToWholesale = async () => {
    await switchHub('wholesale');
    // Hub context and all hooks will automatically update
  };

  return <button onClick={goToWholesale}>Go to Wholesale</button>;
}
```

### Get Hub Branding
```tsx
import { useHubBranding } from './contexts/HubContext';

function HubHeader() {
  const { primary, secondary, accent, displayName } = useHubBranding();

  return (
    <div style={{ backgroundColor: primary }}>
      <h1 className="text-white">{displayName}</h1>
    </div>
  );
}
```

## Step 5: Create Hub-Specific Listing Form

```tsx
import { HubListingForm } from './components/HubListingForm';
import { useHub } from './contexts/HubContext';

function CreateListingPage() {
  const { hub } = useHub();

  const handleSubmit = async (data) => {
    // Save listing with hub_id and hub-specific fields
    const response = await fetch('/api/listings', {
      method: 'POST',
      body: JSON.stringify({
        hub_id: hub.id,
        ...data,
        // Hub-specific fields will vary
      }),
    });
    // Handle response
  };

  return <HubListingForm onSubmit={handleSubmit} onCancel={() => window.history.back()} />;
}
```

## Step 6: Database Migration

Run this migration to add hub support to listings table:

```sql
-- Add hub_id to listings table
ALTER TABLE listings ADD COLUMN hub_id VARCHAR(50);

-- Add hub-specific data field
ALTER TABLE listings ADD COLUMN hub_specific_data JSONB DEFAULT '{}';

-- Add indexes for hub queries
CREATE INDEX idx_listings_hub_id ON listings(hub_id);
CREATE INDEX idx_listings_hub_user ON listings(hub_id, created_by);

-- Add hub filter by subscription tier requirement
CREATE INDEX idx_listings_hub_tier ON listings(hub_id, user_subscription_tier);

-- Add constraint to ensure valid hub_ids
ALTER TABLE listings ADD CONSTRAINT listings_hub_id_check
  CHECK (hub_id IN ('marketplace', 'wholesale', 'digital', 'mkulima', 'services', 'live_commerce'));
```

## Step 7: Update Listing-Related Services

In **services/listingsService.ts**:

```ts
interface CreateListingParams {
  hubId: string;
  title: string;
  description: string;
  category: string;
  price: number;
  image: File;
  // Hub-specific data
  [key: string]: any;
}

export async function createListing(params: CreateListingParams) {
  // Extract hub-specific fields based on hubId
  const hubSpecificData = extractHubSpecificData(params.hubId, params);

  const response = await supabaseClient.from('listings').insert({
    hub_id: params.hubId,
    title: params.title,
    description: params.description,
    category: params.category,
    price: params.price,
    hub_specific_data: hubSpecificData,
    created_by: getCurrentUserId(),
    // other common fields
  });

  return response;
}

function extractHubSpecificData(hubId: string, params: any) {
  const hubData: Record<string, any> = {};

  switch (hubId) {
    case 'marketplace':
      hubData.condition = params.condition;
      hubData.shippingAvailable = params.shippingAvailable;
      break;

    case 'wholesale':
      hubData.minOrderQuantity = params.minOrderQuantity;
      hubData.bulkPricingTiers = params.bulkPricingTiers;
      break;

    case 'digital':
      hubData.licenseType = params.licenseType;
      hubData.downloadUrl = params.downloadUrl;
      break;

    case 'mkulima':
      hubData.harvestDate = params.harvestDate;
      hubData.certification = params.certification;
      hubData.quantity = params.quantity;
      hubData.unit = params.unit;
      break;

    case 'services':
      hubData.duration = params.duration;
      hubData.durationUnit = params.durationUnit;
      hubData.availability = params.availability;
      break;

    case 'live_commerce':
      hubData.streamSchedule = params.streamSchedule;
      hubData.streamDuration = params.streamDuration;
      break;
  }

  return hubData;
}
```

## Step 8: Implement Hub Search/Filtering

Create **hooks/useHubSearch.ts**:

```ts
import { useHub } from '../contexts/HubContext';

export function useHubSearch(searchTerm: string, filters: any = {}) {
  const { hub, hubId } = useHub();
  const [results, setResults] = useState([]);

  useEffect(() => {
    const searchQuery = buildSearchQuery(hubId, searchTerm, filters);
    executeSearch(searchQuery);
  }, [searchTerm, filters, hubId]);

  function buildSearchQuery(hubId: string, term: string, filters: any) {
    let query = supabaseClient
      .from('listings')
      .select('*')
      .eq('hub_id', hubId)
      .ilike('title', `%${term}%`);

    // Hub-specific filters
    switch (hubId) {
      case 'marketplace':
        if (filters.condition) query = query.eq('hub_specific_data->>condition', filters.condition);
        if (filters.priceMin) query = query.gte('price', filters.priceMin);
        if (filters.priceMax) query = query.lte('price', filters.priceMax);
        break;

      case 'wholesale':
        if (filters.minOrderQuantity)
          query = query.lte('hub_specific_data->>minOrderQuantity', filters.minOrderQuantity);
        break;

      case 'digital':
        if (filters.licenseType)
          query = query.eq('hub_specific_data->>licenseType', filters.licenseType);
        break;

      case 'mkulima':
        if (filters.certification)
          query = query.eq('hub_specific_data->>certification', filters.certification);
        break;

      case 'services':
        if (filters.duration)
          query = query.eq('hub_specific_data->>duration', filters.duration);
        break;
    }

    return query;
  }

  async function executeSearch(query: any) {
    const { data, error } = await query.order('created_at', { ascending: false }).limit(20);
    if (!error) setResults(data || []);
  }

  return results;
}
```

## Step 9: UI Integration Examples

### Example 1: Hub Switcher in Header
```tsx
import { HubSwitcherNav, HubSearchSwitcher } from './components/HubSwitcherNav';

export function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1>Pambo</h1>
        <HubSwitcherNav className="flex-1" />
        <HubSearchSwitcher />
      </div>
    </header>
  );
}
```

### Example 2: Hub Sidebar
```tsx
import { HubSidebarSwitcher } from './components/HubSwitcherNav';

export function Sidebar({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <aside className="w-64 bg-gray-100 p-4">
      <HubSidebarSwitcher isCollapsed={isCollapsed} />
      {/* Other sidebar content */}
    </aside>
  );
}
```

### Example 3: Featured Hubs
```tsx
import { HubInfoCard } from './components/HubSwitcherNav';

export function FeaturedHubsSection() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <HubInfoCard hubId="marketplace" />
      <HubInfoCard hubId="mkulima" />
      <HubInfoCard hubId="digital" />
    </div>
  );
}
```

## Step 10: Add Hub Analytics

Create **components/HubAnalytics.tsx**:

```tsx
export function HubAnalytics() {
  const { hubId } = useHub();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const { data } = await supabaseClient
        .from('listings')
        .select('*')
        .eq('hub_id', hubId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

      setMetrics({
        totalListings: data?.length || 0,
        activeListings: data?.filter((l: any) => l.status === 'active').length || 0,
        // More metrics...
      });
    };

    fetchMetrics();
  }, [hubId]);

  return (
    <div className="grid md:grid-cols-4 gap-4">
      <AnalyticsCard label="Total Listings" value={metrics?.totalListings} />
      <AnalyticsCard label="Active Listings" value={metrics?.activeListings} />
      {/* More cards */}
    </div>
  );
}
```

## Key Features

### ✅ Hub Context System
- Global hub state management
- Specialized hooks for different use cases
- Automatic context updates on hub switch

### ✅ Type-Safe Hub System
- Discriminated unions for hub IDs
- Complete hub configuration interface
- Hub-specific data types

### ✅ Flexible Listing Forms
- Dynamic fields based on hub type
- Hub validation
- Image upload support

### ✅ Hub-Aware Components
- Feature checking (hasLiveStreaming, etc.)
- Business rule enforcement
- Hub branding integration

### ✅ Performance Optimized
- Per-hub search state caching
- Hub preferences persistence
- Optimized database queries with indexes

## Usage Patterns

### Pattern 1: Conditional Rendering
```tsx
const { hasFeature } = useHubFeatures();
if (hasFeature('liveStreaming')) <LiveStreamingUI />;
```

### Pattern 2: Tier-Based Access
```tsx
const { getListingLimit } = useHubRules();
const limit = getListingLimit(userTier);
```

### Pattern 3: Hub Switching with State Preservation
```tsx
const { switchHub } = useHubSwitch();
await switchHub('wholesale'); // Preserves all hub preferences
```

### Pattern 4: Hub-Specific Navigation
```tsx
const { hubs } = useHubNavigation();
hubs.forEach(hub => {
  // hub.primary, hub.displayName, hub.slug, etc.
});
```

## Error Handling

### Missing HubProvider Wrapper
```
Error: useHubContext must be used within <HubProvider>
Solution: Ensure HubProvider wraps your app
```

### Invalid Hub ID
```tsx
const { hubId } = useHub();
if (!HUB_IDS.includes(hubId)) {
  // Handle invalid hub
}
```

### User Tier Restrictions
```tsx
if (!isHubAccessible(hubId, userTier)) {
  return <UpgradeTierRequired />;
}
```

## Testing

### Mock Hub Context
```tsx
import { HubProvider } from './contexts/HubContext';

function MockHubProvider({ hubId = 'marketplace', children }) {
  return (
    <HubProvider initialHubId={hubId}>
      {children}
    </HubProvider>
  );
}

// Usage in tests
render(
  <MockHubProvider hubId="wholesale">
    <MyComponent />
  </MockHubProvider>
);
```

## Performance Considerations

1. **Hub Switching**: Async operation to prevent UI blocking
2. **Search State Caching**: Per-hub search state preserved during hub switches
3. **Feature Checks**: Memoized for performance
4. **Database Indexes**: Add indexes on `hub_id` and `hub_id, user_id` for fast queries

## Next Steps

1. ✅ Create hub-specific pages (HubMarketplacePage, etc.)
2. ✅ Implement hub routing in App.tsx
3. ✅ Run database migration
4. ✅ Update listing creation service
5. ✅ Implement hub search/filtering
6. ✅ Add hub analytics
7. ⏳ Implement live streaming for Live Commerce hub
8. ⏳ Create hub admin dashboard
9. ⏳ Add hub-specific analytics reporting

## Support

For questions about implementing the hub system, refer to:
- HubContext.tsx for hook documentation
- HubConfig.ts for hub configuration details
- HubArchitecture.ts for type definitions
