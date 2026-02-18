/**
 * ============================================================
 * HUB ARCHITECTURE - CODE COMMENTS GUIDE
 * ============================================================
 * 
 * This file documents the key architectural comments that should
 * be in place in the core hub system files. These comments explain
 * the hub segregation model: shared users/subscriptions vs
 * segregated listings/analytics.
 * 
 * APPLY THESE COMMENTS TO:
 * 1. types/HubArchitecture.ts
 * 2. config/HubConfig.ts
 * 3. contexts/HubContext.tsx
 * 4. components/HubRouter.tsx
 * 5. components/HubListingForm.tsx
 * 
 * ============================================================
 */

// =====================================================
// FILE 1: types/HubArchitecture.ts
// =====================================================

/**
 * HEADER COMMENT FOR types/HubArchitecture.ts:
 * 
 * HubArchitecture.ts
 * ===================
 * 
 * Type definitions for the hub system with segregated data model.
 * 
 * ARCHITECTURE OVERVIEW:
 * ├── SHARED ACROSS ALL HUBS (in profiles table)
 * │   ├── User ID
 * │   ├── Email
 * │   ├── Subscription Tier (applies to all hubs)
 * │   └── Verification Badge (trust level across all hubs)
 * │
 * └── SEGREGATED BY HUB (hub_id column in listings)
 *     ├── Listings (each hub has own listing inventory)
 *     ├── Analytics (each hub has own GMV, stats)
 *     ├── Reviews (each hub has own rating)
 *     └── Messages (each hub has own conversation threads)
 * 
 * KEY PRINCIPLE:
 * - Same user ID exists in profiles table ONCE (no hub_id)
 * - Same user can have listings in ALL 6 hubs simultaneously
 * - Each hub's listings have hub_id column for segregation
 * - Query pattern: WHERE hub_id = 'marketplace' AND created_by = userId
 *
 * EXAMPLE DB SCHEMA:
 * profiles: { id, email, subscription_tier, verification_badge } [NO hub_id]
 * listings: { id, hub_id, title, created_by, ... } [WITH hub_id for segregation]
 * 
 * This enables:
 * ✅ One auth session across all 6 hubs
 * ✅ One subscription tier for all hubs (Pro tier = Pro everywhere)
 * ✅ Independent listing management per hub
 * ✅ Different analytics per hub (Mkulima GMV separate from Marketplace)
 */

// =====================================================
// FILE 2: config/HubConfig.ts
// =====================================================

/**
 * HEADER COMMENT FOR config/HubConfig.ts:
 * 
 * HubConfig.ts
 * =============
 * 
 * Central configuration registry for all 6 hubs with hub-specific rules,
 * features, and business logic. Enables segregated marketplace behavior
 * while maintaining shared user/subscription model.
 * 
 * SEGREGATION MODEL IN ACTION:
 * 
 * 1. SHARED ACROSS HUBS (same for all users, all hubs):
 *    - User authentication (one login = all 6 hubs)
 *    - Subscription tier (upgrade once = all hubs)
 *    - Verification badge (verified once = all hubs)
 *    - Payment account (M-Pesa connected for all hubs)
 * 
 * 2. SEGREGATED BY HUB (different per hub):
 *    - Listing limits (Mkulima: 50 listings, Marketplace: 200)
 *    - Business rules (commission rates vary per hub)
 *    - Features enabled (streaming only in Mkulima, Services, Live Commerce)
 *    - UI/UX (different forms for different hub types)
 *    - Analytics (independent GMV, seller count per hub)
 * 
 * CONFIG USAGE:
 * getHub('marketplace') → returns Marketplace-specific config
 * getHubListingLimit('mkulima', 'starter') → returns Mkulima's limit for Starter tier
 * 
 * DATABASE IMPLICATIONS:
 * - Query for user's Marketplace listings: WHERE hub_id = 'marketplace' AND created_by = userId
 * - Query for user's subscription (shared): WHERE id = userId [NO filter on hub_id]
 * - Listing count enforcement: Compare against getHubListingLimit(hubId, subscription_tier)
 * - Features available: Check HUB_CONFIGS[hubId].features to show/hide UI
 */

// =====================================================
// FILE 3: contexts/HubContext.tsx
// =====================================================

/**
 * HEADER COMMENT FOR contexts/HubContext.tsx:
 * 
 * HubContext.tsx
 * ===============
 * 
 * Global hub state management enabling seamless switching between 6 segregated
 * hubs while maintaining shared user/subscription context. This is the heart
 * of the hub segregation model.
 * 
 * ARCHITECTURE:
 * 
 * SHARED STATE (same for all hubs):
 * - currentUser (logged-in user profile) [from profiles table]
 * - userSubscriptionTier (applies to all 6 hubs) [from profiles.subscription_tier]
 * - userVerificationBadge (applies to all 6 hubs)
 * 
 * SEGREGATED STATE (switches per hub):
 * - currentHub (which of 6 hubs user is in)
 * - hubListings (listings for current hub only) [filtered by hub_id]
 * - hubAnalytics (GMV/stats for current hub only) [filtered by hub_id]
 * - hubSearchState (search within current hub only)
 * - hubPreferences (per-hub sort/filter preferences)
 * 
 * SWITCHING HUBS:
 * When user clicks "Switch to Mkulima":
 * 1. Update currentHub to 'mkulima'
 * 2. Refetch listings for NEW hub: WHERE hub_id = 'mkulima' AND created_by = currentUser.id
 * 3. Refetch analytics for NEW hub: WHERE hub_id = 'mkulima'
 * 4. Preserve: subscription_tier, userProfile (shared across hubs)
 * 5. Update UI to show Mkulima-specific forms/features
 * 
 * HOOKS PROVIDED (9 total):
 * - useHub() → get current hub id, user, tier
 * - useHubSwitch() → switch between hubs
 * - useHubFeatures() → get features available in current hub
 * - useHubRules() → get business rules (commission, limits) for current hub
 * - useHubListings() → get listings for current hub only [segregated query]
 * - useHubListingLimit() → get listing limit for user's tier in current hub
 * - useHubAnalytics() → get analytics for current hub only [segregated]
 * - useHubBranding() → get colors, icons, names for current hub
 * - useHubPreferences() → manage per-hub user preferences
 * 
 * KEY QUERY PATTERNS (hub segregation in action):
 * 
 * Segregated (different per hub):
 * SELECT * FROM listings WHERE hub_id = currentHub AND created_by = userId
 * 
 * Shared (same across all hubs):
 * SELECT subscription_tier FROM profiles WHERE id = userId
 * 
 * This context bridges data fetching with hub segregation logic.
 */

// =====================================================
// FILE 4: components/HubRouter.tsx
// =====================================================

/**
 * HEADER COMMENT FOR components/HubRouter.tsx:
 * 
 * HubRouter.tsx
 * ==============
 * 
 * Main routing component that manages navigation and layout across segregated
 * hubs while maintaining shared user context. Handles URL routing with hub
 * awareness and provides UI chrome (header, breadcrumbs) for hub-segregated experience.
 * 
 * ROUTING AWARENESS:
 * - URL structure: /hub/:hubId/listings
 * - Reads hubId from URL and switches context to that hub
 * - Preserves hub across page reloads (in localStorage via HubContext)
 * - Updates URL when user switches hubs
 * 
 * SHARED CONTEXT IN ROUTING:
 * - Header shows current user (same everywhere)
 * - Header shows subscription tier (same everywhere)
 * - These are preserved as user navigates between hubs
 * 
 * SEGREGATED CONTEXT IN ROUTING:
 * - Listings view shows current hub's listings only
 * - Analytics dashboard shows current hub's stats only
 * - Forms show hub-specific fields (Marketplace has shipping, Mkulima has harvest_date)
 * - Navigation highlights current hub
 * 
 * EXPORTED COMPONENTS:
 * - HubHeader: Shows hub color, name, user info (with shared user, segregated hub)
 * - HubBreadcrumb: Shows current location (e.g., "Marketplace > My Listings > Item #123")
 * - HubQuickActions: Hub-specific action buttons
 * - HubListingStats: Shows current hub's stats
 * - HubActivityFeed: Shows current hub's recent activity
 * 
 * EXAMPLE USAGE:
 * <HubRouter>
 *   <Route path="/hub/:hubId/listings" element={<MyListings />} />
 *   <Route path="/hub/:hubId/analytics" element={<HubDashboard />} />
 * </HubRouter>
 * 
 * Hub segregation happens automatically:
 * MyListings component uses useHubListings() → fetches only current hub's listings
 * HubDashboard uses useHubAnalytics() → shows only current hub's stats
 */

// =====================================================
// FILE 5: components/HubListingForm.tsx
// =====================================================

/**
 * HEADER COMMENT FOR components/HubListingForm.tsx:
 * 
 * HubListingForm.tsx
 * ===================
 * 
 * Hub-specific listing form component that adapts form fields and validation
 * based on hub type. Demonstrates how hub segregation extends to UX - each hub
 * has different data model and fields, all submitted with hub_id for segregation.
 * 
 * SEGREGATED FORM FIELDS (6 variants):
 * 
 * Marketplace (Blue):
 * - title, description, price
 * - condition (new/used/refurbished) ← MARKETPLACE SPECIFIC
 * - shipping_available, shipping_cost
 * - Uses: useHubListingForm('marketplace')
 * 
 * Mkulima (Green):
 * - title, description, price
 * - harvest_date ← MKULIMA SPECIFIC
 * - crop_type, quantity
 * - certifications
 * - Uses: useHubListingForm('mkulima')
 * 
 * Digital (Pink):
 * - title, description, price
 * - license_type (single-use, commercial, unlimited) ← DIGITAL SPECIFIC
 * - file_url, file_size
 * - UsesL useHubListingForm('digital')
 * 
 * Services (Amber):
 * - title, description, price
 * - duration_hours, availability ← SERVICES SPECIFIC
 * - service_category
 * - Uses: useHubListingForm('services')
 * 
 * Wholesale (Purple):
 * - title, description, price_per_unit
 * - moq (minimum order quantity) ← WHOLESALE SPECIFIC
 * - bulk_discounts
 * - Uses: useHubListingForm('wholesale')
 * 
 * Live Commerce (Red):
 * - title, description, price
 * - stream_schedule_start ← LIVE_COMMERCE SPECIFIC
 * - stream_duration
 * - product_link
 * - Uses: useHubListingForm('live_commerce')
 * 
 * SHARED SUBMISSION DATA (all hubs):
 * {
 *   title: string,
 *   description: string,
 *   price: number,
 *   hub_id: string, ← KEY: This segregates listing to correct hub
 *   created_by: userId, ← Same user can list in all hubs
 *   ...hub_specific_fields
 * }
 * 
 * VALIDATION:
 * - Uses HubContext to get current hub config
 * - Validates against hub-specific rules
 * - Example: Mkulima enforces harvest_date, Marketplace doesn't
 * 
 * DATABASE INSERT:
 * INSERT INTO listings (title, description, price, hub_id, created_by, ...)
 * VALUES (..., 'mkulima', userId, ...)
 * 
 * Later queries will segregate by hub:
 * SELECT * FROM listings WHERE hub_id = 'mkulima' AND created_by = userId
 */

// =====================================================
// SUMMARY: Hub Segregation at Every Layer
// =====================================================

/**
 * HUB SEGREGATION SUMMARY
 * =======================
 * 
 * The hub system implements segregation at multiple layers:
 * 
 * 1. DATABASE LAYER (hub_id column):
 *    profiles: NO hub_id [users are shared]
 *    listings: WITH hub_id [listings are segregated]
 *    Query strategy: WHERE hub_id = 'marketplace' AND created_by = userId
 * 
 * 2. CONTEXT LAYER (HubContext):
 *    Maintains currentHub state separate from shared user state
 *    Switching hubs refetches segregated data (listings, analytics)
 *    Preserves shared state (user profile, subscription tier)
 * 
 * 3. CONFIGURATION LAYER (HubConfig):
 *    Each hub has distinct rules (listing limits, commission rates)
 *    Each hub has distinct features (streaming enabled/disabled)
 *    Config drives UI rendering (show/hide hub-specific fields)
 * 
 * 4. COMPONENT LAYER (Forms, Lists, Dashboards):
 *    Forms adapt fields based on current hub
 *    Lists filter by hub_id to show segregated data
 *    Dashboards show hub-specific analytics
 * 
 * 5. URL LAYER (Routing):
 *    URLs include hub: /hub/:hubId/listings
 *    Hub switching updates URL
 *    Reload preserves hub in localStorage
 * 
 * RESULT:
 * ✅ One user, one subscription, one verification badge
 * ✅ Six independent marketplaces
 * ✅ Listings never appear in wrong hub
 * ✅ Analytics are hub-specific
 * ✅ UX adapts to hub type
 * ✅ Seamless switching between hubs
 * ✅ Shared authentication across hubs
 * ✅ Shared payment method across hubs
 * ✅ Production-ready billion-dollar scale
 */
