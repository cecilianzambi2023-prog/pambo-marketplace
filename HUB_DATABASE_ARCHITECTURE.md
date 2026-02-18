/**
 * HUB_DATABASE_ARCHITECTURE.md
 * =============================
 * 
 * Database Schema showing hub segregation with shared users
 */

# Hub Database Architecture

## Schema Overview

```sql
╔════════════════════════════════════════════════════════════════════╗
║                    PAMBO CORE PLATFORM                             ║
║                 (One database, multiple hubs)                      ║
╚════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────┐
│  SHARED ACROSS ALL HUBS (Users & Subscriptions)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  profiles (users)                                                   │
│  ├── id (UUID, PK)                                                  │
│  ├── email (unique)                                                 │
│  ├── subscription_tier (mkulima|starter|pro|enterprise) ← SHARED    │
│  ├── verification_badge (none|bronze|silver|gold|platinum)         │
│  ├── created_at                                                     │
│  └── [rest of user fields]                                          │
│                                                                     │
│  subscription_plans (reference table)                               │
│  ├── tier_id (PK)                                                   │
│  ├── name                                                           │
│  ├── price_ksh                                                      │
│  └── features (JSONB)                                               │
│                                                                     │
│  KEY POINTS:                                                        │
│  ✅ ONE user record per person                                      │
│  ✅ ONE subscription per person (applies to ALL hubs)               │
│  ✅ ONE verification badge per person (applies to ALL hubs)         │
│  ❌ NO hub_id column (not hub-specific)                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  HUB-SEGREGATED (Each hub has its own data)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  listings                                                           │
│  ├── id (UUID, PK)                                                  │
│  ├── hub_id (marketplace|wholesale|digital|mkulima|services|live)   │
│  │       ← KEY SEGREGATION FIELD                                    │
│  ├── created_by (UUID, FK → profiles.id)                            │
│  ├── title                                                          │
│  ├── description                                                    │
│  ├── category                                                       │
│  ├── price                                                          │
│  ├── status (active|sold|removed)                                   │
│  ├── hub_specific_data (JSONB)                                      │
│  │   For marketplace: { condition, shipping_available }             │
│  │   For wholesale: { min_order_qty, bulk_tiers }                   │
│  │   For digital: { license_type, download_url }                    │
│  │   For mkulima: { harvest_date, certification, quantity, unit }   │
│  │   For services: { duration, availability, skills }               │
│  │   For live_commerce: { stream_schedule, duration }               │
│  ├── created_at                                                     │
│  └── updated_at                                                     │
│                                                                     │
│  INDEXES (for performance):                                         │
│  - INDEX: hub_id                                                    │
│  - INDEX: hub_id, created_by                                        │
│  - INDEX: hub_id, status                                            │
│  - CONSTRAINT: hub_id must be valid hub                             │
│                                                                     │
│  seller_analytics (per hub)                                         │
│  ├── id (UUID, PK)                                                  │
│  ├── hub_id ← SEGREGATION                                           │
│  ├── seller_id (FK → profiles.id)                                   │
│  ├── date                                                           │
│  ├── listings_created                                               │
│  ├── listings_sold                                                  │
│  ├── total_gmv                                                      │
│  └── visitor_count                                                  │
│                                                                     │
│  buyer_contact_requests                                             │
│  ├── id (UUID, PK)                                                  │
│  ├── hub_id ← SEGREGATION                                           │
│  ├── buyer_id (FK → profiles.id)                                    │
│  ├── listing_id (FK → listings.id)                                  │
│  ├── message                                                        │
│  └── created_at                                                     │
│                                                                     │
│  KEY POINTS:                                                        │
│  ✅ EVERY row has hub_id (enables segregation)                      │
│  ✅ created_by links to shared profiles table                       │
│  ✅ hub_specific_data stores different JSON per hub                 │
│  ✅ Indexes on hub_id for fast queries                              │
│  ✅ Constraint ensures valid hub_id values                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  OPERATIONAL EXAMPLES                                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  SCENARIO 1: User creates listing in multiple hubs                 │
│  ───────────────────────────────────────────────────────────────   │
│  Alice (user_id: 123) with tier: "starter"                         │
│                                                                     │
│  INSERT INTO listings (hub_id, created_by, ...)                    │
│  VALUES                                                             │
│  ('marketplace', 123, ...),   ← Marketplace listing                 │
│  ('mkulima', 123, ...),        ← Mkulima listing                    │
│  ('services', 123, ...);       ← Services listing                   │
│                                                                     │
│  Same user_id, THREE different hubs, different rules applied       │
│                                                                     │
│  SCENARIO 2: List all of Alice's marketplace listings              │
│  ───────────────────────────────────────────────────────────────   │
│  SELECT * FROM listings                                            │
│  WHERE hub_id = 'marketplace' AND created_by = 123;                │
│                                                                     │
│  Returns: Only marketplace listings (not wholesale, digital, etc.)  │
│                                                                     │
│  SCENARIO 3: Get Alice's subscription (shared across all hubs)     │
│  ───────────────────────────────────────────────────────────────   │
│  SELECT subscription_tier FROM profiles WHERE id = 123;            │
│                                                                     │
│  Returns: 'starter' (applies to ALL hubs where Alice lists)        │
│                                                                     │
│  SCENARIO 4: Analytics per hub                                     │
│  ───────────────────────────────────────────────────────────────   │
│  SELECT SUM(price) as gmv FROM listings                            │
│  WHERE hub_id = 'mkulima' AND date >= '2026-02-01';                │
│                                                                     │
│  Marketplace GMV: 15B KES  ← Different totals per hub               │
│  Mkulima GMV: 2B KES                                                │
│  Wholesale GMV: 5B KES                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## SQL Schema

```sql
-- ============================================================
-- SHARED TABLES (across all hubs)
-- ============================================================

-- Users (shared across all hubs)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  subscription_tier VARCHAR(50) NOT NULL 
    CHECK (subscription_tier IN ('mkulima', 'starter', 'pro', 'enterprise')),
  verification_badge VARCHAR(50) DEFAULT 'none'
    CHECK (verification_badge IN ('none', 'bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- NO hub_id column - user exists in ONE place
  -- but can list in MULTIPLE hubs
);

-- Subscription tier reference
CREATE TABLE subscription_tiers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price_ksh DECIMAL(10, 2),
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HUB-SEGREGATED TABLES (hub_id in each row)
-- ============================================================

-- Listings (hub-segregated)
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- SEGREGATION: This column determines which hub the listing belongs to
  hub_id VARCHAR(50) NOT NULL 
    CHECK (hub_id IN ('marketplace', 'wholesale', 'digital', 'mkulima', 'services', 'live_commerce')),
  
  -- Reference to shared users table
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Common fields
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'removed')),
  
  -- Hub-specific flexible data
  -- Different structure per hub type
  hub_specific_data JSONB DEFAULT '{}',
  
  -- Common metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES profiles(id)
);

-- ⚡ CRITICAL INDEXES for performance
CREATE INDEX idx_listings_hub_id ON listings(hub_id);
CREATE INDEX idx_listings_hub_created_by ON listings(hub_id, created_by);
CREATE INDEX idx_listings_hub_status ON listings(hub_id, status);
CREATE INDEX idx_listings_category_hub ON listings(hub_id, category);

-- Seller analytics (hub-segregated)
CREATE TABLE seller_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id VARCHAR(50) NOT NULL 
    CHECK (hub_id IN ('marketplace', 'wholesale', 'digital', 'mkulima', 'services', 'live_commerce')),
  seller_id UUID NOT NULL REFERENCES profiles(id),
  analytics_date DATE NOT NULL,
  listings_created INT DEFAULT 0,
  listings_sold INT DEFAULT 0,
  total_gmv DECIMAL(15, 2) DEFAULT 0,
  visitor_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hub_id, seller_id, analytics_date)
);

CREATE INDEX idx_analytics_hub ON seller_analytics(hub_id);
CREATE INDEX idx_analytics_hub_seller ON seller_analytics(hub_id, seller_id);

-- Buyer contact requests (hub-segregated)
CREATE TABLE buyer_contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id VARCHAR(50) NOT NULL 
    CHECK (hub_id IN ('marketplace', 'wholesale', 'digital', 'mkulima', 'services', 'live_commerce')),
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  listing_id UUID NOT NULL REFERENCES listings(id),
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (buyer_id) REFERENCES profiles(id),
  FOREIGN KEY (listing_id) REFERENCES listings(id)
);

CREATE INDEX idx_contact_hub ON buyer_contact_requests(hub_id);
CREATE INDEX idx_contact_listing ON buyer_contact_requests(listing_id);
```

## Key Architectural Patterns

### Pattern 1: Hub Segregation Query
```sql
-- Get all listings for a SPECIFIC hub
SELECT * FROM listings 
WHERE hub_id = 'marketplace'
ORDER BY created_at DESC;

-- Get listings from MULTIPLE hubs
SELECT * FROM listings 
WHERE hub_id IN ('marketplace', 'wholesale')
ORDER BY created_at DESC;

-- WRONG - Gets mixed hubs (don't do this)
SELECT * FROM listings;
```

### Pattern 2: User's Listings Across All Hubs
```sql
-- User's listings in specific hub
SELECT * FROM listings 
WHERE created_by = user_id AND hub_id = 'marketplace';

-- User's listings ACROSS all hubs
SELECT hub_id, COUNT(*) as count 
FROM listings 
WHERE created_by = user_id 
GROUP BY hub_id;

-- User has:
-- - 5 marketplace listings
-- - 2 mkulima listings  
-- - 1 services listing
```

### Pattern 3: User Data (Shared, No hub_id)
```sql
-- Get user's subscription (same everywhere)
SELECT subscription_tier FROM profiles WHERE id = user_id;
-- Returns: 'starter' (applies to ALL hubs)

-- Get user's verification (same everywhere)
SELECT verification_badge FROM profiles WHERE id = user_id;
-- Returns: 'silver' (applies to ALL hubs)

-- These don't change per hub - one profile per user
```

### Pattern 4: Hub-Specific Analytics
```sql
-- Mkulima hub statistics
SELECT COUNT(*) as total_listings FROM listings 
WHERE hub_id = 'mkulima';

-- Marketplace hub statistics
SELECT COUNT(*) as total_listings FROM listings 
WHERE hub_id = 'marketplace';

-- Different totals per hub
```

## RLS (Row-Level Security) Policies

```sql
-- Users can see all listings in any hub
CREATE POLICY "Anyone can view listings"
  ON listings FOR SELECT
  USING (true);

-- Users can create listings (hub-specific)
CREATE POLICY "Users can create listings in any hub"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Users can update own listings
CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Sellers can see their own analytics
CREATE POLICY "Sellers see their own analytics"
  ON seller_analytics FOR SELECT
  USING (auth.uid() = seller_id);
```

## Integration with Hub System

```tsx
// In HubContext.tsx
export function useHubListings() {
  const { hubId } = useHub();
  const [listings, setListings] = useState([]);

  useEffect(() => {
    // Query ONLY listings for current hub
    const query = supabaseClient
      .from('listings')
      .select('*')
      .eq('hub_id', hubId)  // ← HUB SEGREGATION
      .order('created_at', { ascending: false });
    
    // Hub-specific analytics
    query.execute().then(data => setListings(data));
  }, [hubId]);

  return listings;
}

// User subscription is SHARED
export function useUserSubscription() {
  const { user } = useAuth(); // Shared auth
  
  useEffect(() => {
    // Query user profile (no hub_id needed)
    const query = supabaseClient
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();
    
    // Returns same subscription for ALL hubs
    query.execute().then(data => setTier(data.subscription_tier));
  }, [user.id]);

  return subscriptionTier; // Same for all hubs
}
```

## Summary

| Aspect | Shared (Users/Subs) | Hub-Segregated (Listings) |
|--------|---------------------|--------------------------|
| **Table Column** | No `hub_id` | Has `hub_id` |
| **User Records** | ONE per person | Can have listing in MULTIPLE hubs |
| **Query Filter** | `WHERE id = user_id` | `WHERE hub_id = 'X' AND created_by = user_id` |
| **Subscription** | Apply to ALL hubs | Apply to ALL hubs (via shared tier) |
| **Analytics** | N/A | Per-hub metrics |
| **Data Isolation** | None (shared) | Complete (hub_id enforced) |

This architecture ensures:
- ✅ Users can operate in multiple hubs with single account
- ✅ Each hub maintains data isolation (via hub_id)
- ✅ Subscriptions apply universally (from shared profile)
- ✅ Analytics are hub-specific
- ✅ One database, scalable to millions of users
