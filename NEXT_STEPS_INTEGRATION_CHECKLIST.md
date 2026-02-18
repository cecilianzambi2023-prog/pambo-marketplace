/**
 * NEXT_STEPS_INTEGRATION_CHECKLIST.md
 * ===================================
 * 
 * Step-by-step checklist to integrate the Hub System into Pambo
 * and make it fully operational for production deployment
 */

# Hub System Integration Checklist

## 📋 Overview

This checklist guides you through integrating the complete hub routing system that was just built. Follow these steps in order to get Pambo's 6-hub super-app architecture live and operational.

**Estimated Time**: 8-16 hours for full implementation  
**Complexity**: Medium  
**Priority**: HIGH - This is the foundation for billion-dollar scale

---

## Phase 1: Core Setup (2-3 hours)

### ✅ Pre-Integration Verification

- [ ] Verify all 8 new files created:
  - [ ] `types/HubArchitecture.ts` (380+ lines)
  - [ ] `config/HubConfig.ts` (600+ lines)
  - [ ] `contexts/HubContext.tsx` (320+ lines)
  - [ ] `components/HubRouter.tsx` (400+ lines)
  - [ ] `components/HubSwitcherNav.tsx` (480+ lines)
  - [ ] `components/HubListingForm.tsx` (550+ lines)
  - [ ] `components/HubDashboard.tsx` (450+ lines)
  - [ ] `HUB_INTEGRATION_GUIDE.md` (integration guide)

- [ ] Verify no compilation errors in TypeScript
  ```bash
  npx tsc --noEmit
  ```

- [ ] Check that all imports are resolvable in your project structure

### ✅ Install / Verify Dependencies

- [ ] Verify React 18+ installed (for Context hooks)
- [ ] Verify TypeScript 5+ installed
- [ ] Verify Lucide icons package installed (`npm install lucide-react`)
- [ ] Verify Tailwind CSS configured (used in all components)

### ✅ Create Missing Context Files (if needed)

If your project doesn't have these, create placeholder files:

- [ ] `contexts/AuthContext.tsx` (if not exists)
  ```tsx
  export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => children;
  ```

- [ ] `contexts/SubscriptionContext.tsx` (if not exists)
  ```tsx
  export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => children;
  ```

### ✅ Update App.tsx (Core Integration)

- [ ] Backup current `App.tsx`
  ```bash
  cp src/App.tsx src/App.tsx.backup
  ```

- [ ] Copy structure from `App.example.tsx` to your real `App.tsx`

- [ ] Wrap the entire app with `HubProvider`:
  ```tsx
  <HubProvider>
    {/* Existing app structure */}
  </HubProvider>
  ```

- [ ] Add `HubSwitcherNav` to your header
  ```tsx
  <header>
    <HubSwitcherNav />
  </header>
  ```

- [ ] Test app still compiles:
  ```bash
  npm run dev  # or your dev command
  ```

---

## Phase 2: Database Setup (1-2 hours)

### ✅ Run Database Migration

Execute this SQL in your Supabase console or via migrations:

```sql
-- Add hub support to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS hub_id VARCHAR(50);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS hub_specific_data JSONB DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_hub_id ON listings(hub_id);
CREATE INDEX IF NOT EXISTS idx_listings_hub_created_by ON listings(hub_id, created_by);
CREATE INDEX IF NOT EXISTS idx_listings_hub_status ON listings(hub_id, status);

-- Add constraint to ensure valid hub IDs
ALTER TABLE listings ADD CONSTRAINT listings_hub_id_check
  CHECK (hub_id IN ('marketplace', 'wholesale', 'digital', 'mkulima', 'services', 'live_commerce'));

-- Verify migration
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'listings' AND column_name IN ('hub_id', 'hub_specific_data');
```

- [ ] Migration runs without errors
- [ ] Verify new columns appear in table
- [ ] Verify indexes created:
  ```bash
  SELECT * FROM pg_indexes WHERE tablename = 'listings';
  ```

### ✅ Migrate Existing Listings (if any)

If you have existing listings, assign them to marketplace hub:

```sql
UPDATE listings SET hub_id = 'marketplace' WHERE hub_id IS NULL;
UPDATE listings SET status = 'active' WHERE status IS NULL;  -- If needed
```

- [ ] Verify all listings have hub_id assigned
  ```sql
  SELECT COUNT(*) FROM listings WHERE hub_id IS NULL;  -- Should be 0
  ```

### ✅ Enable RLS Policies for Hub-Specific Queries

- [ ] Add RLS policy for hub-specific reads:
  ```sql
  CREATE POLICY "Users can read listings in any hub"
    ON listings FOR SELECT
    USING (true);
  ```

- [ ] Add RLS policy for hub-specific writes:
  ```sql
  CREATE POLICY "Users can create listings in any hub"
    ON listings FOR INSERT
    WITH CHECK (auth.uid() = created_by);
  ```

---

## Phase 3: Service Layer Updates (2-3 hours)

### ✅ Update listingsService.ts

Modify `services/listingsService.ts` to support hub-specific data:

- [ ] Add `hubId` parameter to `createListing()` function
- [ ] Extract hub-specific fields based on hub type
- [ ] Save to `hub_specific_data` JSONB column
- [ ] Example:
  ```ts
  export async function createListing(params: CreateListingParams) {
    const hubSpecificData = extractHubSpecificData(params.hubId, params);
    
    return await supabaseClient.from('listings').insert({
      hub_id: params.hubId,
      title: params.title,
      hub_specific_data: hubSpecificData,
      // ... other fields
    });
  }
  ```

- [ ] Add `getListingsByHub()` function:
  ```ts
  export async function getListingsByHub(hubId: string) {
    return await supabaseClient
      .from('listings')
      .select('*')
      .eq('hub_id', hubId)
      .order('created_at', { ascending: false });
  }
  ```

- [ ] Test both functions with different hub types

### ✅ Create Hub Search Service

Create `services/hubSearchService.ts`:

- [ ] Add `searchHub()` function that accepts hubId and search filters
- [ ] Build dynamic query based on hub type
- [ ] Return filtered listings with pagination
- [ ] Support hub-specific filters (e.g., condition for marketplace, MOQ for wholesale)
- [ ] Example:
  ```ts
  export async function searchHub(
    hubId: string, 
    searchTerm: string, 
    filters: Record<string, any> = {}
  ) {
    let query = supabaseClient
      .from('listings')
      .select('*')
      .eq('hub_id', hubId)
      .ilike('title', `%${searchTerm}%`);

    // Apply hub-specific filters...
    
    return await query.order('created_at', { ascending: false }).limit(20);
  }
  ```

- [ ] Test with different search terms and filter combinations

### ✅ Update API Routes (if using Express backend)

If you have a custom backend, add these routes:

- [ ] `POST /api/listings` - Create listing with hub_id
- [ ] `GET /api/hubs/:hubId/listings` - Get hub listings
- [ ] `GET /api/hubs/:hubId/stats` - Get hub statistics
- [ ] `GET /api/hubs/search` - Search across hubs

---

## Phase 4: Component Integration (3-4 hours)

### ✅ Create Hub Page Components

Create separate page components for each hub:

- [ ] `pages/HubMarketplacePage.tsx`:
  ```tsx
  export function HubMarketplacePage() {
    return <HubRouter><HubDashboard /></HubRouter>;
  }
  ```

- [ ] `pages/HubWholesalePage.tsx`
- [ ] `pages/HubDigitalPage.tsx`
- [ ] `pages/HubMkulimaPage.tsx`
- [ ] `pages/HubServicesPage.tsx`
- [ ] `pages/HubLiveCommercePage.tsx`

- [ ] Test each page individually

### ✅ Implement Hub Routing

Update your router setup:

- [ ] Add routes for each hub:
  ```tsx
  <Route path="/hub/marketplace" element={<HubMarketplacePage />} />
  <Route path="/hub/wholesale" element={<HubWholesalePage />} />
  // ... etc for all 6 hubs
  ```

- [ ] Add route for creating listings:
  ```tsx
  <Route path="/listing/create" element={<CreateListingPage />} />
  ```

- [ ] Test navigation between hubs (check URL changes)
- [ ] Test context updates on navigation (check hub colors change)

### ✅ Connect HubListingForm to API

Update `CreateListingPage` to submit to your API:

- [ ] Hook up form submission to your listing service
- [ ] Pass hub_id from context to form data
- [ ] Handle file upload for listing image
- [ ] Redirect to hub page on success
- [ ] Show error message on failure

- [ ] Test creating a listing in Marketplace hub
- [ ] Test creating a listing in Mkulima hub
- [ ] Verify listings saved with correct hub_id to database

### ✅ Connect HubDashboard to Real Data

Update `HubDashboard` to show real metrics:

- [ ] Replace mock data with real API calls
- [ ] Fetch hub statistics on component mount
- [ ] Show actual active listings count
- [ ] Show actual GMV (sum of listing prices)
- [ ] Show actual user count for hub

- [ ] Test each hub shows different metrics
- [ ] Test metrics update when new listings created

---

## Phase 5: Testing & Validation (2-3 hours)

### ✅ Manual Testing

- [ ] **Hub Switching**: 
  - [ ] Click through each hub in switcher
  - [ ] Verify colors change correctly
  - [ ] Verify hub name updates in header
  - [ ] Verify search results are hub-specific

- [ ] **Form Validation**:
  - [ ] Marketplace form shows condition field
  - [ ] Wholesale form shows MOQ field
  - [ ] Digital form shows download URL field
  - [ ] Mkulima form shows harvest date field
  - [ ] Services form shows duration field
  - [ ] Live Commerce form shows stream schedule field

- [ ] **Feature Flags**:
  - [ ] Only Marketplace/Wholesale show bulk options
  - [ ] Only Digital hub shows license type
  - [ ] Only Live Commerce requires Pro subscription
  - [ ] Only Services hub shows booking field

- [ ] **Navigation**:
  - [ ] All hub navigation buttons work
  - [ ] Keyboard shortcuts work (Arrow keys, Cmd+K)
  - [ ] Sidebar switcher shows all hubs
  - [ ] Mobile responsive

### ✅ Browser Testing

- [ ] Test on Chrome/Firefox/Safari
- [ ] Test on mobile (iPhone/Android)
- [ ] Test on tablet
- [ ] Test with slow network (DevTools throttle)

### ✅ Performance Testing

- [ ] Hub switch time < 500ms
- [ ] Form load time < 1000ms
- [ ] List rendering < 2000ms
- [ ] Measure with DevTools Performance tab

```bash
# Run Lighthouse audit
npx lighthouse https://yoursite.com/hub/marketplace --view
```

### ✅ TypeScript Compilation

- [ ] No TypeScript errors:
  ```bash
  npx tsc --noEmit
  ```

- [ ] No unused imports or variables
- [ ] All types properly defined

### ✅ Linting

- [ ] No ESLint errors:
  ```bash
  npm run lint
  ```

---

## Phase 6: Data Validation (1 hour)

### ✅ Verify Hub Data

```sql
-- Check hub_id distribution
SELECT hub_id, COUNT(*) as count FROM listings GROUP BY hub_id;

-- Check for missing hub_id
SELECT COUNT(*) FROM listings WHERE hub_id IS NULL;

-- Check hub_specific_data is being saved
SELECT hub_id, COUNT(*) as count 
FROM listings 
WHERE hub_specific_data != '{}' 
GROUP BY hub_id;
```

- [ ] All listings have hub_id assigned
- [ ] Hub_specific_data properly saved for each hub type
- [ ] Data distribution looks reasonable (check against config metrics)

### ✅ Verify Search Indexes

```sql
-- Check indexes are being used efficiently
EXPLAIN ANALYZE 
SELECT * FROM listings 
WHERE hub_id = 'marketplace' 
ORDER BY created_at DESC 
LIMIT 20;

-- Should show "Seq Scan on listings" (index is being used)
```

---

## Phase 7: User-Facing Features (2-3 hours)

### ✅ Implement Hub Quick Actions

- [ ] "Create Listing" button point to correct form
- [ ] "Browse Listings" button show hub listings
- [ ] "View Analytics" button show hub analytics
- [ ] Link colors match hub brand color

### ✅ Add Hub Features Showcase

- [ ] Show enabled features per hub
- [ ] Show feature descriptions
- [ ] Enable/disable based on subscription tier

### ✅ Add Hub Info Cards

For displaying hubs in marketing/discovery:

- [ ] Create `<HubInfoCard hubId="marketplace" />` component
- [ ] Show hub statistics on cards
- [ ] Show enabled features on hover
- [ ] Link to hub on click

### ✅ Implement Hub Analytics View

- [ ] Create analytics dashboard per hub
- [ ] Show daily activity chart
- [ ] Show top categories
- [ ] Show key metrics (listings created, sales, users)

---

## Phase 8: Security & Optimization (2 hours)

### ✅ Add Access Control

Verify hub access based on subscription tier:

```tsx
const { isHubAccessible } = require('./config/HubConfig');

if (!isHubAccessible(hubId, userSubscriptionTier)) {
  return <UpgradeRequired hubId={hubId} />;
}
```

- [ ] Non-Pro users cannot access Live Commerce hub
- [ ] Non-Starter users cannot access Wholesale hub
- [ ] Verification requirements enforced (check badges)
- [ ] Test with different user tiers

### ✅ Add Rate Limiting

If using Supabase Edge Functions:

```ts
// In your Edge Function, add rate limiting
const rateLimit = await checkRateLimit(userId, 'listing_create', 10); // 10 per minute
if (!rateLimit.success) return error(429, 'Too many requests');
```

- [ ] Prevent listing creation spam
- [ ] Add rate limit headers to responses

### ✅ Optimize Database Queries

- [ ] Use indexes for all queries
- [ ] Batch queries where possible
- [ ] Add result caching for hub metrics
- [ ] Test query performance

### ✅ Add Error Handling

- [ ] Add error boundary for hub components
- [ ] Handle missing hub gracefully
- [ ] Show user-friendly error messages
- [ ] Log errors for debugging

---

## Phase 9: Documentation & Deployment (2 hours)

### ✅ Update Documentation

- [ ] Update README.md with 6-hub architecture overview
- [ ] Document new environment variables (if any)
- [ ] Create troubleshooting guide
- [ ] Document API changes

### ✅ Environment Setup

- [ ] Set all required environment variables
- [ ] Update `.env.example` with hub-related vars
- [ ] Document configuration process

### ✅ Deployment Preparation

- [ ] Review database migrations for production safety
- [ ] Test deployment procedure
- [ ] Create rollback plan if issues
- [ ] Notify team of changes

- [ ] Deploy to staging environment first
- [ ] Test all hubs on staging
- [ ] Get stakeholder approval
- [ ] Deploy to production

### ✅ Post-Deployment Verification

- [ ] All hubs accessible in production
- [ ] Hub switching works smoothly
- [ ] Listing creation functional
- [ ] Analytics showing correct data
- [ ] No console errors
- [ ] Performance metrics acceptable

---

## Phase 10: Monitoring & Optimization (Ongoing)

### ✅ Set Up Monitoring

- [ ] Monitor hub switching latency
- [ ] Monitor listing creation success rate
- [ ] Monitor database query performance
- [ ] Monitor user errors

### ✅ Analytics Tracking

- [ ] Track hub usage (which hubs most popular)
- [ ] Track feature usage per hub
- [ ] Track conversion rates per hub
- [ ] Track user retention per hub

### ✅ Business Metrics

- [ ] Track GMV per hub
- [ ] Track listing counts per hub
- [ ] Track user acquisition per hub
- [ ] Track subscription tier distribution

---

## Common Issues & Solutions

### Issue: "useHubContext must be used within HubProvider"

**Solution**: 
Ensure component is wrapped:
```tsx
// ❌ WRONG - HubProvider not wrapping
<YourComponent /> 

// ✅ RIGHT - HubProvider wrapping
<HubProvider>
  <YourComponent />
</HubProvider>
```

### Issue: Hub colors not applying

**Solution**:
Check hex color values in HubConfig:
```ts
color: {
  primary: '#3b82f6',   // Must be valid hex
  secondary: '#1e40af',
  accent: '#dbeafe',
}
```

### Issue: Form validation failing

**Solution**:
Check hub-specific field validation in HubListingForm - ensure you're filling required fields for each hub.

### Issue: Database migration fails

**Solution**:
- Ensure table exists before running migration
- Check Supabase connection
- Run migration in correct database/schema

### Issue: Search results empty

**Solution**:
- Verify listings have hub_id assigned
- Check search index is being used
- Try simpler search term

---

## Success Criteria

You'll know integration is complete when:

- ✅ All 6 hubs accessible from hub switcher
- ✅ Hub switching updates all UI elements (colors, name, features)
- ✅ Creating listings saves with correct hub_id
- ✅ Hub-specific form fields appear correctly
- ✅ Search filters work per hub
- ✅ Analytics show hub-specific metrics
- ✅ No console errors or warnings
- ✅ Performance acceptable (< 1s page load)
- ✅ Mobile responsive
- ✅ Production ready

---

## Timeline Summary

| Phase | Tasks | Time |
|-------|-------|------|
| Phase 1 | Core Setup | 2-3 hrs |
| Phase 2 | Database | 1-2 hrs |
| Phase 3 | Services | 2-3 hrs |
| Phase 4 | Components | 3-4 hrs |
| Phase 5 | Testing | 2-3 hrs |
| Phase 6 | Validation | 1 hr |
| Phase 7 | Features | 2-3 hrs |
| Phase 8 | Security | 2 hrs |
| Phase 9 | Deployment | 2 hrs |
| **TOTAL** | **All Phases** | **18-25 hrs** |

**Realistic estimate**: 2-3 days with 8 hours work per day

---

## Support Resources

- **Integration Guide**: `HUB_INTEGRATION_GUIDE.md`
- **Component Examples**: `App.example.tsx`
- **Type Definitions**: `types/HubArchitecture.ts`
- **Configuration**: `config/HubConfig.ts`
- **Implementation Summary**: `HUB_SYSTEM_IMPLEMENTATION_SUMMARY.md`

---

## Questions to Ask

Before starting integration:

1. **Deployment Strategy**: Will you deploy all hubs at once or staggered?
2. **Data Migration**: Do you have existing listings to migrate?
3. **Subscription Tiers**: Are your subscription tiers matching the 4-tier model?
4. **Payment System**: Is M-Pesa integration complete?
5. **Analytics**: Do you have analytics tracking in place?
6. **CDN**: Are you using a CDN for image uploads?
7. **Performance SLA**: What's your target page load time target?
8. **Geographic Expansion**: Will you expand to other countries after launch?

---

## 🎯 Next Actions

1. **Today**: Run through Phase 1 & 2 (Core setup + Database)
2. **Tomorrow**: Run through Phase 3 & 4 (Services + Components)
3. **Day 3**: Run through Phase 5-9 (Testing, validation, deployment)
4. **Day 4+**: Phase 10 - Monitoring & ongoing optimization

**Start here**: Open `App.example.tsx` and begin integrating into your main `App.tsx`

Good luck! You're building a billion-dollar super-app! 🚀
