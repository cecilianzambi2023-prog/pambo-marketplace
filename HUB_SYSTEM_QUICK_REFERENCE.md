/**
 * HUB_SYSTEM_QUICK_REFERENCE.md
 * =============================
 * 
 * Quick reference guide for the Hub System files and how to use them
 */

# Hub System - Quick Reference Guide

## 📦 What Was Built

A production-ready **6-hub marketplace routing system** for Pambo super-app supporting millions of users across:
- **Marketplace** (Blue) - General commerce
- **Wholesale** (Purple) - B2B bulk commerce  
- **Digital** (Pink) - Digital goods & downloads
- **Mkulima** (Green) - Farmer-focused 🌾 PRIORITY
- **Services** (Amber) - Freelance & professional services
- **Live Commerce** (Red) - Real-time streaming sales

---

## 📁 File Structure

```
pambo/
├── types/
│   └── HubArchitecture.ts ............ Hub type definitions (380 lines)
│
├── config/
│   └── HubConfig.ts ................. Hub configuration registry (600 lines)
│
├── contexts/
│   └── HubContext.tsx ............... Global hub state (320 lines)
│
├── components/
│   ├── HubRouter.tsx ................ Main routing component (400 lines)
│   ├── HubSwitcherNav.tsx ........... Navigation switchers (480 lines)
│   ├── HubListingForm.tsx ........... Hub-specific forms (550 lines)
│   ├── HubDashboard.tsx ............ Hub analytics dashboard (450 lines)
│
├── App.example.tsx .................. Example App.tsx integration
├── HUB_INTEGRATION_GUIDE.md ......... Step-by-step integration guide
├── HUB_SYSTEM_IMPLEMENTATION_SUMMARY.md .. Architecture & design
└── NEXT_STEPS_INTEGRATION_CHECKLIST.md ... Implementation checklist
```

---

## 🚀 Quick Start (5 minutes)

### Step 1: Wrap Your App
```tsx
import { HubProvider } from './contexts/HubContext';

<HubProvider>
  <YourApp />
</HubProvider>
```

### Step 2: Add Hub Navigator
```tsx
import { HubSwitcherNav } from './components/HubSwitcherNav';

<header>
  <HubSwitcherNav />
</header>
```

### Step 3: Use Hub in Components
```tsx
import { useHub, useHubFeatures } from './contexts/HubContext';

const { hub, hubId } = useHub();
const { hasFeature } = useHubFeatures();
```

That's it! Your app now has 6-hub routing.

---

## 📚 File Reference

### types/HubArchitecture.ts
**Purpose**: TypeScript definitions for hub system

**Key Types**:
- `HubId` - Discriminated union of 6 hub identifiers
- `HubConfig` - Complete hub configuration
- `HubFeatures` - Feature flags (9 total)
- `HubRules` - Business rules (listing limits, verification, etc.)
- `HubListing` - Listing type with hub extensions
- `HubContextValue` - Global state type

**Key Constants**:
- `HUB_IDS` - Array of valid hub IDs (for type safety)
- `HUB_METADATA` - Hub display information
- `HUB_QUICK_ACTIONS` - Per-hub quick action buttons

**Usage**:
```tsx
import type { HubId, HubConfig } from './types/HubArchitecture';
```

---

### config/HubConfig.ts
**Purpose**: Configuration registry for all 6 hubs (SOURCE OF TRUTH)

**Key Exports**:
- `HUB_CONFIGS` - Map of hubId → HubConfig
- `getHub(hubId)` - Get hub config safely
- `getAllHubs()` - Get all hubs
- `getActiveHubs()` - Get only active hubs
- `getHubBySlug(slug)` - Lookup by URL slug
- `getHubListingLimit(hubId, tier)` - Get listing capacity
- `isHubAccessible(hubId, userTier)` - Check tier access

**Hub Configurations** (all 6):
- MARKETPLACE_CONFIG: Blue, general commerce
- WHOLESALE_CONFIG: Purple, B2B bulk
- DIGITAL_CONFIG: Pink, digital goods
- MKULIMA_CONFIG: Green, farmer-focused 🌾
- SERVICES_CONFIG: Amber, freelance services
- LIVE_COMMERCE_CONFIG: Red, streaming sales

**Usage**:
```tsx
import { HUB_CONFIGS, getHub, getHubListingLimit } from './config/HubConfig';

const hubConfig = getHub('marketplace');
const limit = getHubListingLimit('marketplace', 'starter'); // Returns 50 or 200
```

---

### contexts/HubContext.tsx
**Purpose**: Global hub state management with 9 specialized hooks

**Key Exports**:
1. `HubProvider` - Wrapper component
2. `useHubContext()` - Raw context access
3. `useHub()` - Get current hub info
4. `useHubSwitch()` - Switch hubs
5. `useHubFeatures()` - Check features
6. `useHubRules()` - Get business rules
7. `useHubNavigation()` - Nav structure
8. `useHubSearch()` - Search state per hub
9. `useHubBranding()` - Hub colors and styling
10. `useAllHubs()` - All active hubs

**Usage Examples**:
```tsx
// Get current hub
const { hub, hubId } = useHub();

// Check features
const { hasFeature } = useHubFeatures();
if (hasFeature('liveStreaming')) { ... }

// Get business rules
const { getListingLimit } = useHubRules();
const limit = getListingLimit('starter');

// Switch hubs
const { switchHub } = useHubSwitch();
await switchHub('wholesale');

// Get hub colors
const { primary, accent } = useHubBranding();

// Get all hubs for navigation
const { availableHubs } = useAllHubs();
```

---

### components/HubRouter.tsx
**Purpose**: Main routing and layout with hub-specific rendering

**Key Exports**:
- `HubRouter` - Main wrapper (gradient background, hub header)
- `HubHeader` - Hub branding header with switcher
- `HubBreadcrumb` - Navigation breadcrumbs
- `HubFeatureBanner` - Promotional banner
- `HubSwitcher` - Compact hub selector
- `HubQuickActions` - Quick action buttons
- `HubFeatureShowcase` - Feature cards
- `HubLoadingState` - Loading skeleton
- `HubEmptyState` - Empty state display
- `HubAnalyticsCard` - Analytics metric card

**Features**:
- Sticky header with hub branding
- Hub-specific gradient background
- Suspense boundary for async content
- Color theming throughout

**Usage**:
```tsx
<HubRouter>
  <YourPageContent />
</HubRouter>
```

---

### components/HubSwitcherNav.tsx
**Purpose**: Multiple hub navigation components for different layouts

**Key Exports**:
- `HubSwitcherNav` - Top navigation bar with keyboard shortcuts
- `HubSearchSwitcher` - Command palette search (Cmd+K)
- `HubSidebarSwitcher` - Vertical sidebar switcher
- `HubSwitcherBadges` - Badge-style indicators
- `HubInfoCard` - Hub information card

**Features**:
- Keyboard navigation (Arrow keys, Enter, Escape)
- Command palette (Cmd+K / Ctrl+K)
- Mobile responsive
- Hub color integration

**Usage**:
```tsx
// Top nav
<HubSwitcherNav className="flex-1" />

// Search
<HubSearchSwitcher />

// Sidebar
<HubSidebarSwitcher isCollapsed={sidebarCollapsed} />

// Badges
<HubSwitcherBadges />

// Info card
<HubInfoCard hubId="marketplace" />
```

---

### components/HubListingForm.tsx
**Purpose**: Hub-specific listing creation with dynamic fields

**Key Exports**:
- `HubListingForm` - Main form component
- `HubListingFormData` - Type for form data

**Hub-Specific Fields**:
- Marketplace: condition, shipping
- Wholesale: MOQ, bulk pricing
- Digital: license type, download URL
- Mkulima: harvest date, certification, quantity
- Services: duration, availability
- Live Commerce: stream schedule, duration

**Features**:
- Dynamic form validation per hub
- Image upload with preview
- Character counters
- Hub-specific error messages

**Usage**:
```tsx
import { HubListingForm } from './components/HubListingForm';

<HubListingForm 
  onSubmit={async (data) => {
    await submitListing(data);
  }}
  onCancel={() => goBack()}
/>
```

---

### components/HubDashboard.tsx
**Purpose**: Hub-specific analytics and overview

**Key Exports**:
- `HubDashboard` - Main dashboard component

**Sections**:
- Hero section with hub branding
- Stats overview (4 metrics)
- Quick actions grid
- Features showcase
- Analytics charts
- Recent activity feed

**Usage**:
```tsx
<HubDashboard />
```

---

## 🎯 Common Use Cases

### Use Case 1: Show feature only if available in hub
```tsx
const { hasFeature } = useHubFeatures();

if (hasFeature('liveStreaming')) {
  return <LiveStreamingUI />;
}
```

### Use Case 2: Enforce listing limits per tier
```tsx
const { getListingLimit } = useHubRules();
const userTier = 'starter';
const limit = getListingLimit(userTier);

if (currentListingCount >= limit) {
  return <UpgradeTierPrompt />;
}
```

### Use Case 3: Check if user can access hub
```tsx
import { isHubAccessible } from './config/HubConfig';

if (!isHubAccessible('live_commerce', userSubscriptionTier)) {
  return <UpgradeRequired hubName="Live Commerce" />;
}
```

### Use Case 4: Hub-specific styling
```tsx
const { primary, secondary, accent } = useHubBranding();

return (
  <div style={{ 
    backgroundColor: accent,
    borderLeftColor: primary,
    color: secondary
  }}>
    {/* Content */}
  </div>
);
```

### Use Case 5: Switch hubs programmatically
```tsx
const { switchHub } = useHubSwitch();

const promoteListing = async () => {
  // Create listing in wholesale hub
  await createListing(data);
  
  // Switch to wholesale hub
  await switchHub('wholesale');
};
```

---

## 🔍 Hub Details

### Marketplace (Blue #3b82f6)
- **Features**: listings, directContact, shippingIntegration, analytics
- **Listing Limits**: 50/200/∞/∞ (Mkulima/Starter/Pro/Enterprise)
- **Verification**: Not required
- **Min Tier**: None
- **Use Case**: General commerce marketplace

### Wholesale (Purple #8b5cf6)
- **Features**: listings, directContact, bulkPricing, analytics, api
- **Listing Limits**: 10/50/∞/∞
- **Verification**: Yes (ID + business permit)
- **Min Tier**: Starter
- **Use Case**: B2B bulk commerce

### Digital (Pink #ec4899)
- **Features**: listings, digitalDownload, analytics, api
- **Listing Limits**: 20/100/∞/∞
- **Verification**: Not required
- **Min Tier**: None
- **Use Case**: Digital goods, e-books, templates

### Mkulima (Green #10b981) 🌾 PRIORITY
- **Features**: listings, directContact, liveStreaming, bulkPricing, shippingIntegration, analytics
- **Listing Limits**: 50/200/∞/∞
- **Verification**: Not required (lowest barrier)
- **Min Tier**: None
- **Use Case**: Farmer-focused marketplace
- **Special**: Subsidized pricing (Mkulima tier 1.5K/year)

### Services (Amber #f59e0b)
- **Features**: listings, directContact, servicesBooking, analytics, api
- **Listing Limits**: 5/20/∞/∞
- **Verification**: Yes (ID required)
- **Min Tier**: None
- **Use Case**: Freelance & professional services

### Live Commerce (Red #ef4444)
- **Features**: listings, liveStreaming, directContact, shippingIntegration, analytics, api
- **Listing Limits**: 0/0/5/∞ concurrent streams
- **Verification**: Not required
- **Min Tier**: Pro (5,000 KES/month minimum)
- **Use Case**: Real-time streaming sales

---

## 🧪 Testing Hub System

### Test Hub Switching
```tsx
// Click hub switcher and verify:
- URL changes
- Colors change
- Hub name changes
- Features update
```

### Test Features
```tsx
// In Wholesale hub:
- Should see bulk pricing option
- Should NOT see digital download
- Should require verification

// In Live Commerce hub:
- Should see stream schedule
- Should require Pro tier
- Should limit to 5 concurrent
```

### Test Listing Limits
```tsx
// Create 50 listings in Marketplace (Mkulima tier)
- Should succeed
- 51st should fail
- Starter tier should allow 200
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| "useHubContext must be used within HubProvider" | Wrap app with `<HubProvider>` |
| Hub colors not showing | Check hex values in HubConfig (must be valid) |
| Features not appearing | Verify `features[featureName].enabled = true` |
| Listing form shows wrong fields | Check hubId is passed correctly to form |
| Search results empty | Verify listings have `hub_id` in database |
| Hub switching slow | Check network tab, optimize API calls |

---

## 📊 Architecture Overview

```
User Action
    ↓
HubSwitcherNav Button Click
    ↓
useHubSwitch().switchHub('wholesale')
    ↓
HubProvider updates state
    ↓
All useHub* hooks update
    ↓
Components re-render with new hub data
    ↓
UI shows wholesale colors, features, rules
```

---

## 🎓 Learning Path

1. **Day 1**: Read `HUB_SYSTEM_IMPLEMENTATION_SUMMARY.md` (architecture overview)
2. **Day 2**: Review `types/HubArchitecture.ts` and `config/HubConfig.ts` (data structures)
3. **Day 3**: Study `contexts/HubContext.tsx` (hook system)
4. **Day 4**: Examine component examples (HubRouter, HubSwitcherNav, etc.)
5. **Day 5**: Follow `HUB_INTEGRATION_GUIDE.md` (integration steps)
6. **Day 6+**: Use `NEXT_STEPS_INTEGRATION_CHECKLIST.md` (implementation)

---

## 💡 Pro Tips

1. **Use `useHub()` first** - Most common need
2. **Check features before rendering** - Don't show Live Commerce UI in Marketplace
3. **Enforce tier requirements** - Check subscription tier before access
4. **Cache hub config** - Load once, use everywhere via context
5. **Test each hub separately** - Create listing in each hub type
6. **Monitor hub metrics** - Track which hubs popular

---

## 🚀 Production Checklist

Before going live:
- [ ] All 6 hubs accessible
- [ ] Hub colors display correctly
- [ ] Form fields correct per hub
- [ ] Features enabled/disabled correctly
- [ ] Tier requirements enforced
- [ ] Database migration completed
- [ ] Search works per hub
- [ ] Analytics showing data
- [ ] Performance < 1s page load
- [ ] Mobile responsive
- [ ] No console errors

---

## 📞 Support Files

| File | Purpose |
|------|---------|
| `HUB_INTEGRATION_GUIDE.md` | Step-by-step integration instructions |
| `HUB_SYSTEM_IMPLEMENTATION_SUMMARY.md` | Architecture & design details |
| `NEXT_STEPS_INTEGRATION_CHECKLIST.md` | Implementation checklist |
| `App.example.tsx` | Example App.tsx integration |
| `types/HubArchitecture.ts` | Type definitions |
| `config/HubConfig.ts` | Hub configurations |
| `contexts/HubContext.tsx` | Context & hooks |

---

## 🏁 You're Ready!

Everything you need to build a billion-dollar super-app with 6 marketplace hubs is ready:

✅ Complete type system  
✅ Hub configuration registry  
✅ Global state management  
✅ Navigation components  
✅ Hub-specific forms  
✅ Analytics dashboard  
✅ Comprehensive documentation  

**Next Step**: Start with Phase 1 in `NEXT_STEPS_INTEGRATION_CHECKLIST.md`

Good luck! 🚀
