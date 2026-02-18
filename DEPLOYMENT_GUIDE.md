# Pambo SaaS Deployment & Integration Guide

## Overview

This guide walks through integrating the subscription system into your existing Pambo marketplace. Follow these steps to transform from demo mode to production revenue.

---

## Phase 1: Database Setup (5 minutes)

### Step 1: Execute Database Migration

1. Open Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy entire contents of `SUBSCRIPTION_MIGRATION.sql`
4. Paste into the SQL editor
5. Click "Run" button
6. Verify: All 7 tables created successfully

**Expected Output:**
```
CREATE TABLE "subscriptions" ...
CREATE TABLE "user_verification" ...
CREATE TABLE "seller_badges" ...
[+ 4 more tables]
RLS policies created
Indexes created
```

### Step 2: Verify Tables in Supabase

- Navigate to **Data/Editor** in Supabase
- Confirm you see:
  - `subscriptions`
  - `user_verification`
  - `seller_badges`
  - `feature_usage`
  - `commission_tracking`
  - `pricing_plans`
  - `admin_audit_log`

---

## Phase 2: Backend Integration (30 minutes)

### Step 1: Copy subscription-related files to backend

Files to ensure are in your backend:
- ✅ `src/routes/payments.ts` (already updated with subscription endpoints)
- ✅ `src/middleware/subscriptionMiddleware.ts` (NEW - just created)
- ✅ `src/services/subscriptionService.ts` (copy from services folder to backend/src/services/)

### Step 2: Update backend/src/index.ts to register routes

Find your main server initialization and add:

```typescript
import subscriptionMiddleware from './middleware/subscriptionMiddleware';

// Add this with your other route registrations
app.use('/api/payments', paymentsRouter);

// Add subscription middleware to listings creation
app.post('/api/listings', 
  subscriptionMiddleware.checkListingLimit,
  createListingHandler
);

// Add image upload limit checking
app.post('/api/upload',
  subscriptionMiddleware.checkImageLimit,
  uploadHandler
);
```

### Step 3: Update listings creation endpoint

**File**: `backend/src/handlers/listings.ts` or similar

Add at the top of your listing creation handler:

```typescript
import { trackUsage } from '../middleware/subscriptionMiddleware';

export const createListing = async (req: Request, res: Response) => {
  try {
    // ... your existing validation code ...

    const listing = await createNewListing(req.body);
    
    // NEW: Track feature usage
    await trackUsage(req.body.sellerId, 'listings_created', 1);

    res.json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

### Step 4: Test subscription endpoints

Using Postman or curl:

```bash
# 1. Initiate subscription
curl -X POST http://localhost:3000/api/payments/subscription/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "phone": "0712345678",
    "hub": "marketplace",
    "plan": "pro"
  }'

# Expected response:
# {
#   "success": true,
#   "subscriptionId": "sub-xxx",
#   "amount": 7000,
#   "phone": "254712345678",
#   "status": "pending"
# }

# 2. Get user subscriptions
curl http://localhost:3000/api/payments/subscription/user-123

# 3. Activate after M-Pesa payment
curl -X POST http://localhost:3000/api/payments/subscription/sub-xxx/activate \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "MPE-001"
  }'
```

---

## Phase 3: Frontend Integration (45 minutes)

### Step 1: Copy subscription components

Ensure these files are in your components folder:
- ✅ `components/SubscriptionComponents.tsx` (PricingPlans, SubscriptionModal, SubscriptionStatus)
- ✅ `services/subscriptionService.ts` (import in React)

### Step 2: Update Dashboard.tsx

**Location**: `components/Dashboard.tsx`

Add at the top:

```typescript
import { SubscriptionStatus, SubscriptionModal, PricingPlans } from './SubscriptionComponents';
import { subscriptionService } from '../services/subscriptionService';
import { useState, useEffect } from 'react';
```

Add state:

```typescript
const [subscription, setSubscription] = useState(null);
const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

useEffect(() => {
  fetchSubscription();
}, [userId]);

const fetchSubscription = async () => {
  const subs = await subscriptionService.getUserSubscriptions(userId);
  setSubscription(subs[0] || null);
};
```

Update the JSX to show pricing/status:

```tsx
// Show pricing if no subscription
{!subscription && hub !== 'farmer' && (
  <div className="mb-6">
    <PricingPlans 
      onSelectPlan={(plan) => {
        setShowSubscriptionModal(true);
      }}
    />
  </div>
)}

// Show status if subscribed
{subscription && (
  <SubscriptionStatus subscription={subscription} />
)}

// Show subscription modal
{showSubscriptionModal && (
  <SubscriptionModal 
    hub={hub}
    onClose={() => setShowSubscriptionModal(false)}
    onSuccess={() => {
      fetchSubscription();
      setShowSubscriptionModal(false);
    }}
  />
)}
```

### Step 3: Update Listings component

**Location**: `components/Listings.tsx` or `pages/ListingsPage.tsx`

Before showing listing creation form, add:

```typescript
import { premiumService } from '../services/subscriptionService';

const canCreateListing = await premiumService.canCreateListing(userId);

if (!canCreateListing) {
  return (
    <div className="alert alert-warning">
      <p>Listing limit reached for your plan.</p>
      <button onClick={() => showUpgradeModal()}>Upgrade Plan</button>
    </div>
  );
}
```

### Step 4: Update API client

**File**: `services/apiClient.ts` or wherever your API calls are

Verify these methods exist (already added in previous work):

```typescript
export const subscriptionApi = {
  initiateSubscription: async (userId: string, phone: string, hub: string, plan: string) => {
    return api.post('/payments/subscription/initiate', { userId, phone, hub, plan });
  },

  getUserSubscriptions: async (userId: string) => {
    return api.get(`/payments/subscription/${userId}`);
  },

  activateSubscription: async (subscriptionId: string, transactionId: string) => {
    return api.post(`/payments/subscription/${subscriptionId}/activate`, { transactionId });
  },

  cancelSubscription: async (subscriptionId: string) => {
    return api.post(`/payments/subscription/${subscriptionId}/cancel`);
  }
};
```

---

## Phase 4: Testing (30 minutes)

### Test 1: Subscription Flow without payment

**Steps:**
1. Open Dashboard
2. Click on non-Farmer hub (e.g., "Marketplace")
3. See PricingPlans component
4. Click "Choose Plan" on Pro
5. See SubscriptionModal
6. Enter phone: `0712345678`
7. See M-Pesa STK prompt (simulated)
8. Click "Confirm Payment"
9. **Verify**: New subscription created in Supabase `subscriptions` table with status `pending`

### Test 2: Listing limit enforcement

**Steps:**
1. User with Starter plan (10 listing limit)
2. Create 10 listings → All succeed
3. Try to create 11th listing → See error: "Listing limit reached (10 max)"
4. Upgrade to Pro plan
5. Try again → Now can create up to 50 listings

**Verify**: `feature_usage` table tracks `listings_created` count

### Test 3: M-Pesa callback

**For sandbox testing** (once you have M-Pesa dashboard access):
1. Go through subscription flow
2. Get `CheckoutRequestID` from response
3. Use M-Pesa Sandbox API to trigger callback
4. Verify: Subscription status changes to `active`

### Test 4: Farmer hub remains free

**Steps:**
1. Login as user
2. Select "Farmer" hub
3. **Verify**: No pricing modal, can create listings immediately
4. Check `subscriptions` table: No entry for farmer hub
5. Can create unlimited listings (no limit checking)

---

## Phase 5: M-Pesa Production Setup (30 minutes)

### Step 1: Get Production Credentials

1. Login to [Safaricom Daraja](https://developer.safaricom.co.ke)
2. Create an app for M-Pesa Sandbox
3. Get:
   - **Consumer Key**
   - **Consumer Secret**
   - **Business Shortcode**
   - **Passkey** (for STK push)

### Step 2: Update Environment Variables

**File**: `backend/.env`

```env
# M-Pesa (Production)
MPESA_CONSUMER_KEY=your_production_key
MPESA_CONSUMER_SECRET=your_production_secret
MPESA_BUSINESS_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_ENVIRONMENT=production

# Callback URLs
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
MPESA_TIMEOUT_URL=https://yourdomain.com/api/payments/mpesa/timeout

# Database
SUPABASE_SERVICE_KEY=your_supabase_key
```

### Step 3: Update backend payment routes

**File**: `backend/src/routes/payments.ts`

Change in constants:

```typescript
const ENVIRONMENT = process.env.MPESA_ENVIRONMENT || 'sandbox'; // Change to 'production'
const API_URL = ENVIRONMENT === 'production' 
  ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
  : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
```

### Step 4: Test with real phone number

1. Update user's phone to real number (starting with 254)
2. Go through subscription flow
3. You should see actual M-Pesa prompt on phone
4. Complete payment
5. Callback should trigger automatically
6. Subscription status changes to `active`

---

## Phase 6: Launch Checklist

### Before Going Live

- [ ] Database migration executed (7 tables created)
- [ ] Backend subscription routes tested
- [ ] Frontend components added to Dashboard
- [ ] Listing limit checking active
- [ ] Image upload limit checking active
- [ ] M-Pesa credentials configured
- [ ] Farmer hub FREE (no subscription required)
- [ ] Other hubs at 3,500 KES starting price
- [ ] Trust badge system active
- [ ] KYC verification available
- [ ] Email reminders set up (optional but recommended)

### Day 1 Post-Launch Monitoring

- [ ] Check Supabase dashboard for failed subscriptions
- [ ] Monitor M-Pesa callback success rate
- [ ] Watch for KYC verification requests
- [ ] Track MRR (Monthly Recurring Revenue)
- [ ] Monitor user signups and conversion rate

---

## Revenue Tracking

### View Real-time Metrics

Go to Supabase **SQL Editor** and run:

```sql
-- Total MRR
SELECT 
  MONTH(nextBillingDate) as month,
  SUM(
    CASE 
      WHEN plan = 'starter' THEN 3500
      WHEN plan = 'pro' THEN 7000
      WHEN plan = 'enterprise' THEN 14000
      ELSE 0
    END
  ) as monthly_revenue
FROM subscriptions
WHERE status = 'active'
GROUP BY MONTH(nextBillingDate);

-- Commission from transactions
SELECT 
  SUM(commission) as total_commission,
  COUNT(*) as transaction_count,
  AVG(commission) as avg_commission
FROM commission_tracking
WHERE status = 'paid';

-- Trust badges distribution
SELECT 
  trustLevel,
  COUNT(*) as seller_count,
  AVG(trustScore) as avg_score
FROM seller_badges
GROUP BY trustLevel;
```

### Create a Revenue Dashboard Component

Create `components/RevenueMetrics.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { subscriptionService } from '../services/subscriptionService';

export const RevenueMetrics = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
      
      const data = await subscriptionService.revenueService.getRevenueMetrics(
        thirtyDaysAgo,
        new Date()
      );
      setMetrics(data);
    };

    fetchMetrics();
  }, []);

  if (!metrics) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-green-100 p-4 rounded">
        <h3>MRR</h3>
        <p className="text-2xl font-bold">₹{metrics.mrr?.toLocaleString()}</p>
      </div>
      <div className="bg-blue-100 p-4 rounded">
        <h3>Commission Revenue</h3>
        <p className="text-2xl font-bold">₹{metrics.commissionRevenue?.toLocaleString()}</p>
      </div>
      <div className="bg-purple-100 p-4 rounded">
        <h3>Total Revenue</h3>
        <p className="text-2xl font-bold">₹{(metrics.mrr + metrics.commissionRevenue)?.toLocaleString()}</p>
      </div>
    </div>
  );
};
```

---

## Troubleshooting

### Issue: "Listing limit reached" but user should have higher limit

**Solution:**
1. Check user's subscription in Supabase
2. Verify subscription `status = 'active'`
3. Verify subscription `nextBillingDate` is in future
4. Check `feature_usage` table for incorrect counts
5. Reset count: `DELETE FROM feature_usage WHERE userId = 'xxx'`

### Issue: M-Pesa callback not triggering

**Solution:**
1. Check `MPESA_CALLBACK_URL` in environment variables
2. Verify domain is publicly accessible
3. Check backend logs for callback endpoint hits
4. Ensure `/api/payments/mpesa/callback` route exists
5. Test callback manually using Postman

### Issue: Users can't see subscription modal

**Solution:**
1. Verify `SubscriptionModal` is imported in parent component
2. Check state management (showSubscriptionModal state exists)
3. Verify API endpoint returns correct response
4. Check browser console for errors
5. Inspect network tab for 404s or 500s

### Issue: Trust badges not updating

**Solution:**
1. Run `updateTrustScore(sellerId)` function
2. Verify user has completed actions (listings, reviews)
3. Check RLS policies on `seller_badges` table
4. Ensure KYC verification is completed
5. Manual update in Supabase: `UPDATE seller_badges SET trustScore = 500 WHERE sellerId = 'xxx'`

---

## Growth Roadmap

### Week 1-2: Soft Launch
- **Target**: 10 active subscriptions
- **Focus**: Testing, feedback, bug fixes
- **Revenue**: 3,500 × 10 = 35,000 KES

### Month 1
- **Target**: 50 active subscriptions
- **Focus**: Marketing, word-of-mouth, seller testimonials
- **Revenue**: 50 × (3,500 + 3,500 + 7,000 + 7,000 + 14,000) / 5 = ~350K KES

### Month 3
- **Target**: 150 active subscriptions
- **Focus**: Premium features rollout, API access for Pro tier
- **Revenue**: ~1,050K KES

### Year 1
- **Target**: 1,000+ active subscriptions
- **Focus**: Feature parity with competitors, mobile app
- **Revenue**: ~10.5M KES (approaching $100K/year)

### Year 2
- **Target**: 5,000+ active subscriptions
- **Focus**: International expansion, payment methods
- **Revenue**: ~52.5M KES (~$500K/year)

---

## Key Success Metrics to Track

```typescript
// Monthly tracking
const metrics = {
  mrr: "Monthly Recurring Revenue (target: +20% MoM)",
  churnRate: "% of users cancelling (target: <5% MoM)",
  cac: "Customer Acquisition Cost (target: <500 KES)",
  ltv: "Lifetime Value per customer (target: >20K KES)",
  conversionRate: "Free → Paid conversion (target: >10%)",
  nps: "Net Promoter Score (target: >50)",
  paymentFailureRate: "M-Pesa failures (target: <2%)",
  newSignups: "New users per day (target: +10/day by Month 3)"
};
```

---

## Next Steps

1. ✅ **Execute database migration** (Phase 1)
2. ✅ **Copy backend files** (Phase 2)
3. ✅ **Update frontend components** (Phase 3)
4. ✅ **Run integration tests** (Phase 4)
5. ⏳ **Set M-Pesa production credentials** (Phase 5)
6. ⏳ **Go live!** (Phase 6)

**Estimated Total Time**: 2-3 hours from zero to production SaaS marketplace

---

## Production Checklist

- [ ] All 7 database tables created and RLS enabled
- [ ] Payment routes responding with correct responses
- [ ] Frontend shows pricing to non-subscribers
- [ ] Frontend shows subscription status to subscribers
- [ ] Listing creation blocked for non-subscribers (non-Farmer)
- [ ] Farmer hub works without subscription
- [ ] M-Pesa credentials loaded from environment
- [ ] M-Pesa callbacks trigger subscription activation
- [ ] Trust badge system active
- [ ] KYC verification available
- [ ] Revenue metrics calculating correctly
- [ ] Error emails configured (optional)
- [ ] Automated renewal scheduled for Day 30
- [ ] Admin dashboard can see all subscriptions
- [ ] Rate limiting enabled on payment endpoints
- [ ] Logging configured for finance audits
- [ ] HTTPS enabled on all payment endpoints
- [ ] PCI-DSS compliance review completed
- [ ] Terms of Service updated with billing terms
- [ ] Privacy Policy updated with payment data handling
- [ ] Support email configured for payment issues

**You're ready to make money! 🚀**

---

*Last Updated: 2024*
*For questions or issues, refer to SAAS_IMPLEMENTATION_GUIDE.md*
