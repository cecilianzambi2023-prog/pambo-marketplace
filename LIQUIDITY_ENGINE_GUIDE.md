# Liquidity Engine - Implementation Guide

## 🎯 What This Solves

**The Problem:** Marketplaces die when buyers can't find sellers or sellers don't respond fast enough.

**The Solution:** Active liquidity management that:
- Monitors seller response times (SLA: <2 hours)
- Tracks supply/demand balance per category
- Routes buyers to best-matching, fastest-responding sellers
- Alerts ops team to categories needing intervention

---

## 🏗️ Architecture

### Core Components

1. **`liquidityEngine.ts`** - Core tracking & matching logic
2. **`20260218_add_liquidity_engine.sql`** - Database schema
3. **`LiquidityDashboard.tsx`** - Admin monitoring UI
4. **`liquidityCron.ts`** - Daily snapshot job

### Data Flow

```
Buyer Inquiry
    ↓
Tracked in buyer_inquiries table
    ↓
Seller Response
    ↓
Auto-calculate response_time_hours
    ↓
Update seller metrics (avg_response_time, response_rate, tier)
    ↓
Daily Cron: Calculate category liquidity scores
    ↓
Alerts generated for low-liquidity categories
```

---

## 📊 Key Metrics

### Seller Response SLA
- **Target:** <2 hours for first response
- **Tiers:**
  - **Excellent:** <1h avg, 90%+ response rate
  - **Good:** <2h avg, 75%+ response rate
  - **Needs Improvement:** <4h avg, 50%+ response rate
  - **Poor:** >4h avg or <50% response rate

### Category Liquidity Score (0-100)
**Target:** 70+

**Formula:**
- Optimal demand/supply ratio: 2-5 inquiries per listing per week
- If ratio is 2-5 → score = 100
- If ratio < 2 → score = (ratio / 2) × 100 (oversupplied)
- If ratio > 5 → score = 100 - ((ratio - 5) × 10) (undersupplied)

**Status:**
- **Balanced:** Score 70-100, ratio 2-5
- **Undersupplied:** High demand, low supply (ratio >5)
- **Oversupplied:** Low demand, high supply (ratio <2)
- **Critical:** Score <40, ratio >10 (urgent intervention needed)

---

## 🚀 Quick Start

### 1. Run Database Migration

```sql
-- Apply migration
psql -U postgres -d pambo -f supabase/migrations/20260218_add_liquidity_engine.sql
```

Or via Supabase CLI:
```bash
supabase db push
```

### 2. Track Buyer Inquiries

When a buyer contacts a seller:

```typescript
import { supabase } from './lib/supabaseClient';

// Create inquiry
const { data: inquiry } = await supabase
  .from('buyer_inquiries')
  .insert({
    buyer_id: buyerId, // or null for guest
    seller_id: sellerId,
    listing_id: listingId,
    message: 'Interested in this product...',
    contact_preference: 'whatsapp',
    inquiry_source: 'listing_page',
  })
  .select()
  .single();
```

### 3. Track Seller Response

When seller responds:

```typescript
import { trackSellerResponse } from './services/liquidityEngine';

const result = await trackSellerResponse(inquiryId, sellerId);

if (result.metSLA) {
  console.log('✓ Seller responded within 2-hour SLA!');
} else {
  console.log(`⚠ SLA violation: ${result.responseTimeHours.toFixed(1)}h response time`);
}
```

### 4. Get Smart Seller Matches

Route buyer to best sellers:

```typescript
import { matchBuyerToSellers } from './services/liquidityEngine';

const topSellers = await matchBuyerToSellers(
  'Electronics', // category
  'Nairobi',     // county (optional)
  5              // top N sellers
);

// Returns sellers ranked by:
// - Response time (30% weight)
// - Response rate (25% weight)
// - Rating (25% weight)
// - Online status (20% boost)
// - Category expertise (boost)

topSellers.forEach(seller => {
  console.log(`${seller.sellerName}: ${seller.matchScore}/100`);
  console.log(`  Reasons: ${seller.matchReasons.join(', ')}`);
});
```

### 5. View Liquidity Dashboard

Add to admin panel:

```typescript
import { LiquidityDashboard } from './components/LiquidityDashboard';

// In your admin component
const [showLiquidityDash, setShowLiquidityDash] = useState(false);

// Render
{showLiquidityDash && (
  <LiquidityDashboard onClose={() => setShowLiquidityDash(false)} />
)}
```

### 6. Set Up Daily Cron

**Option A: Supabase Edge Function + pg_cron**

Create `supabase/functions/liquidity-cron/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { liquidityCronHandler } from '../../services/liquidityCron.ts';

serve(async (req) => {
  const result = await liquidityCronHandler();
  
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

Schedule in Supabase:
```sql
SELECT cron.schedule(
  'daily-liquidity-snapshot',
  '0 2 * * *', -- 2 AM daily
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/liquidity-cron',
    headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  ) AS request_id;
  $$
);
```

**Option B: Node.js Cron (if self-hosted)**

```bash
# Install node-cron
npm install node-cron

# Create cron.js
node cron.js
```

```javascript
// cron.js
const cron = require('node-cron');
const { liquidityCronHandler } = require('./services/liquidityCron');

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running daily liquidity snapshot...');
  await liquidityCronHandler();
});

console.log('Liquidity cron job scheduled (2 AM daily)');
```

---

## 📈 Using the Data

### 1. Get Low-Liquidity Alerts

```typescript
import { getLowLiquidityAlerts } from './services/liquidityEngine';

const alerts = await getLowLiquidityAlerts();

alerts.forEach(alert => {
  console.log(`[${alert.urgency}] ${alert.category}`);
  console.log(`  Issue: ${alert.issue}`);
  console.log(`  Action: ${alert.recommendation}`);
});

// Example output:
// [high] Electronics
//   Issue: Critical demand (12.3 inquiries per listing) | Slow seller response (4.2h avg)
//   Action: URGENT: Recruit sellers or pause marketing for this category | Coach sellers on faster response times
```

### 2. Monitor Seller Performance

```typescript
import { getSellerResponseMetrics } from './services/liquidityEngine';

const metrics = await getSellerResponseMetrics(sellerId);

console.log(`Seller: ${metrics.sellerName}`);
console.log(`Tier: ${metrics.tier}`);
console.log(`Avg Response: ${metrics.averageResponseTimeHours}h`);
console.log(`Response Rate: ${metrics.responseRate}%`);
console.log(`SLA Violations: ${metrics.slaViolations}`);
```

### 3. Category Health Check

```typescript
import { getCategoryLiquidity } from './services/liquidityEngine';

const health = await getCategoryLiquidity('Furniture');

console.log(`Category: ${health.category}`);
console.log(`Health Score: ${health.liquidityScore}/100`);
console.log(`Status: ${health.status}`);
console.log(`Supply: ${health.activeListings} listings from ${health.activeSellers} sellers`);
console.log(`Demand: ${health.last7DaysInquiries} inquiries (${health.last7DaysContacts} responded to)`);
console.log(`Demand/Supply Ratio: ${health.demandSupplyRatio.toFixed(2)} (target: 2-5)`);
```

---

## 🎬 Real-World Scenarios

### Scenario 1: Critical Category
**Alert:** "Furniture" category has 200 inquiries but only 15 listings (13.3 ratio)

**Action:**
1. Pause Facebook ads for furniture
2. Recruit 10 new furniture sellers
3. Offer free featured placement to existing furniture sellers
4. Monitor ratio daily until it drops to 3-5

### Scenario 2: Slow Seller
**Alert:** SellerX has 6h avg response time, 50% response rate

**Action:**
1. Send email: "Your response time affects your visibility"
2. Show notification in seller dashboard: "Respond within 2h to rank higher"
3. If no improvement in 7 days: demote in search results
4. If improvement: promote to "Fast Responder" badge

### Scenario 3: Undersupplied Category
**Alert:** "Wedding Services" has 80 inquiries, 8 listings (10:1 ratio)

**Action:**
1. Launch targeted seller recruitment campaign
2. Waive listing fees for wedding vendors (limited time)
3. Partner with wedding industry associations
4. Create "Wedding Hub" landing page

---

## 🔧 Configuration

### Adjust SLA Target

In `liquidityEngine.ts`:

```typescript
const metSLA = responseTimeHours <= 2; // Change to 1 or 4 as needed
```

### Change Optimal Demand/Supply Ratio

In `getCategoryLiquidity()`:

```typescript
// Current: 2-5 inquiries per listing
if (demandSupplyRatio >= 2 && demandSupplyRatio <= 5) {
  liquidityScore = 100;
  status = 'balanced';
}

// Adjust to 3-7 for higher-ticket categories:
if (demandSupplyRatio >= 3 && demandSupplyRatio <= 7) {
  // ...
}
```

### Matching Algorithm Weights

In `matchBuyerToSellers()`:

```typescript
const matchScore =
  responseTimeScore * 0.3  +  // 30% weight
  responseRateScore * 0.25 +  // 25% weight
  ratingScore * 0.25       +  // 25% weight
  availabilityBoost        +  // +20 if online
  categoryExpertiseBoost;     // +up to 20

// Adjust weights as needed
```

---

## 📊 Database Queries

### Top Performing Sellers (Last 7 Days)

```sql
SELECT * FROM seller_response_leaderboard
LIMIT 20;
```

### Category Health Overview

```sql
SELECT * FROM category_health_dashboard
ORDER BY liquidity_score ASC;
```

### Get Critical Categories

```sql
SELECT * FROM get_critical_liquidity_categories();
```

### Seller Activity Trend

```sql
WITH daily_activity AS (
  SELECT 
    DATE(created_at) as day,
    COUNT(DISTINCT seller_id) as active_sellers,
    COUNT(*) as total_inquiries,
    AVG(response_time_hours) as avg_response_time
  FROM buyer_inquiries
  WHERE created_at >= NOW() - INTERVAL '30 days'
    AND responded_at IS NOT NULL
  GROUP BY DATE(created_at)
)
SELECT * FROM daily_activity
ORDER BY day DESC;
```

---

## ⚡ Performance Tips

1. **Index Coverage:** Migration includes all needed indexes
2. **Batch Processing:** Cron processes all categories in parallel
3. **Cache Results:** Cache category liquidity for 1 hour on frontend
4. **Lazy Load Dashboard:** Use React.lazy() (already implemented)

---

## 🚨 Alerts Integration

### Email Alerts (SendGrid / Postmark)

```typescript
// In liquidityCron.ts
import { sendEmail } from './emailService';

const alerts = await getLowLiquidityAlerts();
const criticalAlerts = alerts.filter(a => a.urgency === 'high');

if (criticalAlerts.length > 0) {
  await sendEmail({
    to: 'ops@pambo.biz',
    subject: `🚨 ${criticalAlerts.length} Critical Liquidity Alerts`,
    body: criticalAlerts.map(a => 
      `${a.category}: ${a.issue}\nAction: ${a.recommendation}`
    ).join('\n\n')
  });
}
```

### Slack Notifications

```typescript
import { postToSlack } from './slackService';

await postToSlack({
  channel: '#marketplace-ops',
  text: `⚠️ Liquidity Alert: ${alert.category} needs ${alert.recommendation}`
});
```

---

## 🎯 Success Metrics

**Track these weekly:**

1. **Overall Health:** Avg category liquidity score (target: 75+)
2. **Seller Performance:** % sellers meeting 2h SLA (target: 80%+)
3. **Buyer Experience:** % inquiries getting response <2h (target: 85%+)
4. **Conversion:** Inquiry-to-contact rate (target: 70%+)
5. **Critical Categories:** Count (target: 0)

---

## 🔮 Next Steps

1. **AI-Powered Routing:** Use ML to predict best seller match
2. **Auto-Pricing Alerts:** Suggest price adjustments for low-demand categories
3. **Seller Coaching:** Auto-send tips to sellers with poor metrics
4. **Buyer Follow-Up:** Auto-message buyers if seller doesn't respond in 30 min
5. **Dynamic Listings Limits:** Auto-adjust based on category demand

---

## 📞 Support

Questions? Check:
- Code comments in `liquidityEngine.ts`
- Database schema comments in migration file
- This README

**Built for billion-dollar scale. Ship it. 🚀**
