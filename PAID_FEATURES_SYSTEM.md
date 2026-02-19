# Retailers Hub Kenya - Paid Features System
## Boosts, Ads, and Badges Monetization

**Status**: Implementation Plan  
**Date Created**: February 19, 2026  
**Phase**: Monetization System Design

---

## 1. Overview

Optional paid features enable sellers to increase visibility and build credibility on Retailers Hub Kenya while maintaining the free listing model. No payment processing by platform - sellers manage payments via M-Pesa.

### Core Principles
- **Optional**: All features are opt-in; basic listing is free forever
- **Affordable**: Micro-pricing (KES 100-500) targets small retailers
- **Self-Service**: Sellers can activate/manage via dashboard
- **Transparent**: Clear ROI communication (reach, visibility, etc.)

---

## 2. Paid Features Breakdown

### 2.1 BOOSTS (Feature Package)
**Purpose**: Increase listing visibility temporarily

#### Boost Tiers
| Tier | Duration | Reach | Price | Best For |
|------|----------|-------|-------|----------|
| **Quick Boost** | 24 hours | 2,000-3,000 views | KES 150 | New sellers testing market |
| **Standard Boost** | 3 days | 5,000-8,000 views | KES 350 | Regular visibility push |
| **Premium Boost** | 7 days | 15,000-20,000 views | KES 500 | Launch campaigns |
| **Power Bundle** | 30 days | 50,000+ views | KES 1,200 | Sustained growth |

#### Boost Features
- Pin listing to top of search results for duration
- Add "BOOSTED" badge to product card
- Appear in featured section rotation
- +200% engagement multiplier
- Get performance analytics during boost period
- Automatic renewal options (optional)

#### Implementation
```typescript
// In types.ts
export interface Boost {
  id: string;
  listingId: string;
  sellerId: string;
  boostTier: 'quick' | 'standard' | 'premium' | 'power_bundle';
  activatedAt: string;
  expiresAt: string;
  amountPaid: number;
  currency: string;
  paymentMethod: string;
  status: 'active' | 'expired' | 'cancelled';
  impressions: number; // Tracked metric
  clicks: number; // Tracked metric
  mpesaReceiptNumber?: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

// In Product interface - add:
isBoosted?: boolean;
boostExpiresAt?: string;
boostTier?: 'quick' | 'standard' | 'premium' | 'power_bundle';
```

---

### 2.2 ADS (Sponsored Placement)
**Purpose**: Reach more buyers through targeted advertising

#### Ad Placements
1. **Category Tag Ads** (KES 200/day)
   - Appear above organic results in category
   - Example: "Sponsored • Budget Electronics"
   - Targeted by category + location
   
2. **Search Result Ads** (KES 250/day)
   - Show in top 3 when searching specific keywords
   - Example: "Sponsored • Samsung Galaxy S23"
   - Bid-based system on high-value keywords
   
3. **Hub Banner Ads** (KES 500/week)
   - Large banner at top of hub sections
   - 1-3 slots rotated throughout day
   - Appears 5,000+ times/week

4. **Promotion Carousel Ads** (KES 300/day)
   - Rotation in homepage/hub carousel
   - Swiping banner with product image + CTA
   - High engagement placement

#### Ad Management
```typescript
// In types.ts
export interface Advertisement {
  id: string;
  sellerId: string;
  listingId?: string; // Optional, for category/search ads
  adType: 'category_tag' | 'search_result' | 'hub_banner' | 'carousel';
  targetCategory?: string;
  targetKeyword?: string;
  targetLocation?: string;
  displayName: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  dailyBudget: number;
  totalSpent: number;
  impressions: number;
  clicks: number;
  ctr: number; // Click-through rate
  currency: string;
  status: 'active' | 'paused' | 'expired' | 'cancelled';
  paymentSchedule: 'daily' | 'weekly' | 'monthly';
  mpesaPayments?: MPesaPayment[];
  createdAt: string;
  updatedAt: string;
}

export interface MPesaPayment {
  id: string;
  transactionId: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  receipt?: string;
}
```

---

### 2.3 BADGES (Credibility/Trust)
**Purpose**: Build seller credibility and buyer confidence

#### Badge Types

| Badge | Cost | Duration | Requirements | Display |
|-------|------|----------|--------------|---------|
| **Verified Seller** | Free | Permanent | ID verification + good history | Gold checkmark ✓ |
| **Premium Member** | KES 500/month | Monthly | Active seller tier (pro+) | Gold star ★ |
| **Trusted Seller** | Free | 3 months | 4.5+ rating, 50+ sales | Green shield badge |
| **Super Seller** | KES 1,000/month | Monthly | 4.8+ rating, 200+ sales | Platinum medal 🏆 |
| **Exclusive Partner** | KES 2,000/month | Monthly | Professional account tier | Diamond ◆ |
| **Speed Shipper** | KES 300/month | Monthly | <2hr response time average | Lightning bolt ⚡ |
| **Eco-Seller** | Free | Permanent | Sustainability certification | Green leaf 🌿 |
| **Best Value** | Custom | Variable | Editor's choice (admin assigned) | Flame 🔥 |

#### Badge Display Strategy
- Primary badge on product card (most impactful one)
- All badges in seller profile
- Icons + tooltips explaining benefits
- Search filter by badge type available

#### Implementation
```typescript
// In types.ts
export interface SellerBadge {
  id: string;
  sellerId: string;
  badgeType: 'verified' | 'premium_member' | 'trusted_seller' | 
            'super_seller' | 'exclusive_partner' | 'speed_shipper' | 
            'eco_seller' | 'best_value';
  isActive: boolean;
  earnedDate: string;
  expiresAt?: string; // Null if permanent
  autoRenew: boolean;
  amountPaid?: number; // Null if earned (free)
  currency?: string;
  paymentMethod?: string;
  mpesaReceiptNumber?: string;
  displayOrder: number; // Which badge shows on product card
  createdAt: string;
  updatedAt: string;
}

// In User interface - add:
badges?: SellerBadge[];
topBadge?: SellerBadge; // Most prominent badge
badgeCount?: number;
```

---

## 3. Pricing Strategy

### Tiered by Seller Level

#### Free Sellers
- Basic boost: KES 150-500 (24h-7d)
- Single ad placement: KES 200-500/day
- Earned badges only (verified, trusted, eco)

#### Starter Tier ($3,500/month subscribers)
- Discounted boost: -10% (KES 135-450)
- Ad packages: -15% (KES 170-425/day)
- Paid badges: Premium Member (KES 450/month)

#### Pro Tier ($5,000/month subscribers)
- Discounted boost: -20% (KES 120-400)
- Unlimited ads tier: KES 3,000/month for all placements
- Paid badges: -30% off (Super Seller KES 700/month)
- Ad analytics dashboard included

#### Enterprise ($9,000/month subscribers)
- All boosts: -30% (KES 100-350)
- Premium ad packages: KES 2,000/month unlimited
- All badge types: -50% off or included
- Dedicated account manager
- Custom campaigns

### Revenue Model
- **Boost Revenue**: ~KES 3-5 per seller per month (adoption 10%)
- **Ad Revenue**: ~KES 5-8 per seller per month (adoption 15%)
- **Badge Revenue**: ~KES 2-4 per seller per month (adoption 5%)
- **Total Potential**: ~KES 10-17 million/month at 50,000 sellers

---

## 4. Database Schema (Supabase)

### New Tables

```sql
-- BOOSTS TABLE
CREATE TABLE boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  boost_tier VARCHAR(50) NOT NULL CHECK (boost_tier IN ('quick', 'standard', 'premium', 'power_bundle')),
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  amount_paid INT NOT NULL, -- In KES
  currency VARCHAR(3) DEFAULT 'KES',
  payment_method VARCHAR(50) DEFAULT 'mpesa_manual',
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  mpesa_receipt_number VARCHAR(50),
  auto_renew BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(listing_id, id) -- One active boost per listing
);

-- ADVERTISEMENTS TABLE
CREATE TABLE advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES products(id) ON DELETE SET NULL,
  ad_type VARCHAR(50) NOT NULL CHECK (ad_type IN ('category_tag', 'search_result', 'hub_banner', 'carousel')),
  target_category VARCHAR(100),
  target_keyword VARCHAR(100),
  target_location VARCHAR(100),
  display_name VARCHAR(200) NOT NULL,
  image_url VARCHAR(500),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  daily_budget INT NOT NULL, -- In KES
  total_spent INT DEFAULT 0,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'KES',
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired', 'cancelled')),
  payment_schedule VARCHAR(50) DEFAULT 'daily',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  INDEX idx_seller_id (seller_id),
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date)
);

-- SELLER BADGES TABLE
CREATE TABLE seller_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL CHECK (badge_type IN (
    'verified', 'premium_member', 'trusted_seller', 'super_seller', 
    'exclusive_partner', 'speed_shipper', 'eco_seller', 'best_value'
  )),
  is_active BOOLEAN DEFAULT TRUE,
  earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT FALSE,
  amount_paid INT, -- In KES, NULL if earned for free
  currency VARCHAR(3) DEFAULT 'KES',
  payment_method VARCHAR(50),
  mpesa_receipt_number VARCHAR(50),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(seller_id, badge_type) -- One badge type per seller
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_boosts_seller ON boosts(seller_id);
CREATE INDEX idx_boosts_status ON boosts(status);
CREATE INDEX idx_ads_seller ON advertisements(seller_id);
CREATE INDEX idx_ads_status ON advertisements(status);
CREATE INDEX idx_badges_seller ON seller_badges(seller_id);
CREATE INDEX idx_badges_active ON seller_badges(is_active);
```

---

## 5. Dashboard UI Components

### Seller Dashboard Additions

#### 1. Paid Features Overview Card
```
┌─────────────────────────────────┐
│ 📊 Visibility Boosts & Ads       │
├─────────────────────────────────┤
│ Active Boosts: 2 (Expires in 4d) │
│ Active Ads: 1 (50 clicks today)  │
│ Badges: 3 (Verified + Trusted)   │
│ Monthly Spend: KES 850           │
│ [View Analytics] [Manage Boosts] │
└─────────────────────────────────┘
```

#### 2. Boost Management
- List all active/past boosts with performance
- One-click renewal button
- Performance metrics: impressions, clicks, conversion
- Easy purchase interface for new boosts

#### 3. Ad Campaign Management
- Campaign creation wizard (4 steps)
- Daily budget dashboard
- Real-time performance metrics
- Pause/resume/edit campaigns
- Payment history

#### 4. Badge Management
- Available badges to purchase
- Currently active badges with expiry
- Earn requirements for free badges
- One-click renewal for expiring badges

---

## 6. Implementation Phases

### Phase 1: Foundation (2 days)
- [ ] Update types.ts with Boost, Advertisement, SellerBadge interfaces
- [ ] Add paid feature constants to constants.ts
- [ ] Update Product type to include boost fields
- [ ] Create database schema and migrations
- [ ] Create API endpoints (GET, POST, DELETE operations)

### Phase 2: Product Card Display (1 day)
- [ ] Update ProductCard.tsx to show boost badges
- [ ] Add badge display to seller profile
- [ ] Update sorting/filtering to prioritize boosted listings
- [ ] Implement "Boosted" tag styling

### Phase 3: Admin/Dashboard UI (2 days)
- [ ] Create BoostManager.tsx component
- [ ] Create AdCampaignManager.tsx component
- [ ] Create BadgeManager.tsx component
- [ ] Integrate into seller dashboard

### Phase 4: Payment Integration (1 day)
- [ ] M-Pesa integration for paid features
- [ ] Auto-receipt generation
- [ ] Payment history tracking via database
- [ ] Email notifications for transactions

### Phase 5: Analytics & Monitoring (1 day)
- [ ] Create analytics dashboard
- [ ] Implement impression/click tracking
- [ ] ROI calculation per seller
- [ ] Performance email reports

**Total Timeline**: ~1 week for full rollout

---

## 7. Cross-Hub Applicability

Same paid features work across all 8 hubs:

| Hub | Boost | Ads | Badges | Notes |
|-----|-------|-----|--------|-------|
| Retailers Hub Kenya | ✅ | ✅ | ✅ | Primary use |
| Wholesale | ✅ | ✅ | ✅ | High-value boosts |
| Services | ✅ | ✅ | ✅ | Provider badges |
| Digital Products | ✅ | ✅ | ✅ | Course promotions |
| Farmers | ✅ | ✅ | ✅ | Harvest season boosts |
| Live Commerce | ✅ | ✅ | ✅ | Stream promotions |
| Secondhand | ✅ | ✅ | ✅ | Urgent sale boosts |
| ImportLink | ✅ | ✅ | ✅ | Bulk order boosts |

---

## 8. Customer Communication

### In-App Messaging
- Suggest boosts when seller has low activity
- Recommend badges based on seller stats
- Show ROI for past boosts ("Your last boost generated 25 sales!")
- Limited-time promotion banners (10% off boost weekends)

### Email Campaigns
- Monthly paid features newsletter
- "Boost your sales" promotional emails
- Badge achievement notifications
- Performance insights reports

### Landing Page
- "Why Boost?" explainer video (60 seconds)
- ROI calculator tool
- Seller testimonials with proof
- FAQ section

---

## 9. Fraud Prevention & Safety

### Safeguards
1. **Fake Engagement Prevention**
   - Cap impressions/clicks by real browsing patterns
   - Detect and flag suspicious click patterns
   - Implement CAPTCHA for high-click campaigns

2. **Quality Control**
   - Approve all ads before activation
   - Flag illegal/counterfeit products
   - Auto-pause ads with high bounce rates

3. **Payment Protection**
   - Verify M-Pesa receipts
   - Mark as "pending" until payment confirmed
   - Refund invalid transactions within 48hrs

4. **Seller Accountability**
   - Suspension for boost/ad abuse
   - Reporting system for fake engagement
   - Manual review for high-spend sellers

---

## 10. Success Metrics

### KPIs to Track

| Metric | Target | Timeline |
|--------|--------|----------|
| Boost Adoption Rate | 15-20% of sellers | Month 1 |
| Average Monthly Spend/Seller | KES 200-300 | Month 1 |
| Platform Revenue (Paid Features) | KES 5-10M | Month 3 |
| Seller ROI (Sales vs Spend) | 3:1 minimum | Month 2 |
| Feature Satisfaction | 4.5+ stars | Ongoing |
| Churn Rate | <5% | Month 3 |

---

## 11. FAQ & Objection Handling

### Q: Do sellers have to use paid features?
**A**: No! Free listings are forever. Boosts, ads, and badges are 100% optional to increase visibility.

### Q: How do I pay for boosts?
**A**: M-Pesa manual payment. Sellers send money to Pambo's M-Pesa account and provide receipt. No platform charges.

### Q: Can I get a refund if my boost doesn't work?
**A**: Yes! If you don't get at least 50% of promised impressions, we refund 50%. Full transparency.

### Q: How do I earn badges for free?
**A**: Verified Seller (ID check), Trusted Seller (4.5+ rating, 50+ sales), Eco-Seller (sustainability cert).

### Q: What if I can't afford boosts?
**A**: Basic visibility is free and unlimited. Boosts are optional for sellers who want extra reach.

---

## 12. Competitor Analysis

### vs OLX/Jiji
- **Simpler pricing**: Fixed KES 500 for 7-day boost (not confusing)
- **Better ROI communication**: Show actual metrics
- **Badge system**: More transparent credibility

### vs Alibaba
- **Affordable micro-pricing**: Start at KES 150 (not thousands)
- **No algorithm penalty**: Free listings never suppressed
- **Direct payments**: No escrow, seller retention

---

## Next Steps

1. Review monetization strategy with leadership
2. Finalize pricing based on seller feedback
3. Code Phase 1 implementation (types + database)
4. Launch beta with 100 sellers
5. Gather feedback and iterate
6. Full rollout to all 50,000+ sellers

---

**Document Version**: 1.0  
**Last Updated**: February 19, 2026  
**Status**: ✅ Ready for Implementation Approval
