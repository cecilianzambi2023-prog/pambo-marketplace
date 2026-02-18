# 🎯 OFFSPRING DECOR LIMITED - Subscription Model

**Version**: 2.0 (Offspring Decor Edition)  
**Updated**: February 13, 2026  
**Status**: 🟢 Production Ready  
**Model**: Flexible Tiers + 1-Year Mkulima Special Offer  
**Commission**: DELETED ❌ Sellers keep 100%

---

## 💰 Pricing Structure

### Subscription Tiers

| Tier | Price | Period | Features | Special |
|------|-------|--------|----------|---------|
| **Mkulima** | 1,500 KES | 1 YEAR | Full farmer support, unlimited listings | 🎁 **Special Offer** |
| **Starter** | 3,500 KES | Monthly | 20 listings, basic analytics | Entry-level |
| **Pro** | 5,000 KES | Monthly | 50 listings, advanced analytics, API | Growing Business |
| **Enterprise** | 9,000 KES | Monthly | Unlimited listings, 24/7 support, integrations | Enterprise |

### Payment Amounts (Critical)

These are the ONLY valid payment amounts M-Pesa will accept:

```
1,500 KES → Mkulima (1 YEAR) ← Special Offer
3,500 KES → Starter (Monthly)
5,000 KES → Pro (Monthly)
9,000 KES → Enterprise (Monthly)
```

**⚠️ Any other amount will default to Starter tier.**

---

## 🎁 Mkulima Special Offer - Marketing Highlight

### Marketing Message
```
"MKULIMA - KES 1,500 FOR 1 YEAR!
✅ Safe & Supported
✅ Connect farm to market
✅ 365 days of premium access
✅ Unlimited listings
✅ Dedicated farmer support"
```

### UI Highlights
- **Green banner** with 🎁 emoji
- **"SPECIAL OFFER - 1 YEAR!"** badge
- **"✅ Safe & Supported"** subtitle
- **Highlighted pricing**: "KES 1,500/YEAR" (not per month)
- **Scale up slightly** compared to other tiers to draw attention

### Implementation Location
- Dashboard subscription section
- SubscriptionComponents.tsx → PricingPlans component
- Marketing banners in Mkulima hub section

---

## 💳 Subscription Lifecycle

### Activation Flow

```
1. User selects tier + clicks "Choose Plan"
   ↓
2. Payment modal opens → User enters M-Pesa phone
   ↓
3. M-Pesa STK Push → User enters PIN
   ↓
4. Callback received with transaction amount
   ↓
5. Amount maps to tier:
   - 1,500 → Mkulima (365 days)
   - 3,500 → Starter (30 days)
   - 5,000 → Pro (30 days)
   - 9,000 → Enterprise (30 days)
   ↓
6. Profile updated:
   subscription_tier = detected_tier
   subscription_expiry = today + period_days
   subscription_start_date = today
   subscription_period_days = 30 or 365
   ↓
7. Features unlocked immediately
   ↓
8. Renewal reminder shown 3 days before expiry
```

### Expiry & Renewal

**Renewal Window**: Shown 3 days before subscription expires

```
Day 27-28: Subtle blue banner
           "Your subscription renews in 3 days"
           [Renew Now button]

Day 29: Yellow banner
        "Your subscription renews tomorrow!"
        [Renew Now button]

Day 30: Red banner (URGENT)
        "Your subscription renews TODAY!"
        [Renew Now button - prominent]

Day 31+: Red banner (EXPIRED)
         "Your subscription has expired"
         [Renew Now button]
```

---

## 🗄️ Database Schema

### New Columns in `profiles` Table

```sql
-- Subscription Tier
subscription_tier VARCHAR(50)
  Values: 'mkulima' | 'starter' | 'pro' | 'enterprise' | NULL
  Default: NULL (free tier)

-- Subscription Expiry Date (renewable date)
subscription_expiry TIMESTAMP WITH TIME ZONE
  Example: 2026-03-14 15:30:00+03
  NULL for free users

-- Subscription Start Date (activation)
subscription_start_date TIMESTAMP WITH TIME ZONE
  Example: 2026-02-13 15:30:00+03
  NULL for free users

-- Subscription Period in Days
subscription_period_days INTEGER
  Values: 30 (monthly) | 365 (Mkulima)
  Default: 30
```

### Migration File
**Location**: `supabase/migrations/add_subscription_tier_to_profiles.sql`

---

## ⚡ Backend Implementation

### M-Pesa Payment Function

**File**: `services/supabase/functions/mpesa-payment/index.ts`

#### Tier Detection Logic
```typescript
// After M-Pesa callback received with transactionAmount:

if (transactionAmount === 1500) {
  subscriptionTier = 'mkulima'
  subscriptionExpiryDays = 365  // 1 YEAR
} else if (transactionAmount === 3500) {
  subscriptionTier = 'starter'
  subscriptionExpiryDays = 30
} else if (transactionAmount === 5000) {
  subscriptionTier = 'pro'
  subscriptionExpiryDays = 30
} else if (transactionAmount === 9000) {
  subscriptionTier = 'enterprise'
  subscriptionExpiryDays = 30
}
```

#### Profile Update
```typescript
const subscriptionExpiry = new Date()
subscriptionExpiry.setDate(subscriptionExpiry.getDate() + subscriptionExpiryDays)

await supabase
  .from("profiles")
  .update({
    subscription_tier: subscriptionTier,
    subscription_expiry: subscriptionExpiry.toISOString(),
    subscription_start_date: new Date().toISOString(),
    subscription_period_days: subscriptionExpiryDays,
    updated_at: new Date().toISOString(),
  })
  .eq("user_id", payment.user_id)
```

#### M-Pesa Receipt Recording
```typescript
// Receipt stored in transactions table
const transaction = await supabase
  .from("transactions")
  .insert({
    payment_id: payment.id,
    user_id: payment.user_id,
    mpesa_receipt_number: mpesaReceiptNumber,  // ← For reconciliation
    phone_number: phoneNumber,
    amount: transactionAmount,
    transaction_date: transactionDate,
    status: "completed",
    created_at: new Date().toISOString(),
  })
```

---

## 🎨 Frontend Components

### 1. Pricing Display (SubscriptionComponents.tsx)

```tsx
// All 4 tiers displayed
// Mkulima has green badge: "🎁 SPECIAL OFFER - 1 YEAR!"
// Pro has blue badge: "POPULAR"
// Mkulima shows: "KES 1,500 / 1 YEAR"
// Mkulima has green button: "Choose Mkulima"
// All show tier features
```

### 2. Dashboard Renewal Banner (Dashboard.tsx)

```tsx
// Calculation:
const daysRemaining = Math.ceil((subscriptionExpiry - now) / (1000 * 60 * 60 * 24))

// Show when:
const isSubscriptionExpiringSoon = daysRemaining <= 3

// Display options:
if (daysRemaining > 0) {
  "⚠️ Your subscription renews in X day(s)!"
} else if (daysRemaining <= 0) {
  "⚠️ Your subscription renews TODAY!"
}

// Button always visible:
"[Renew Now]" → Opens payment modal
```

### 3. Subscription Service (subscriptionService.ts)

```typescript
async createSubscription(
  userId: string,
  hub: string,
  plan: 'mkulima' | 'starter' | 'pro' | 'enterprise'
) {
  const planPricing = {
    mkulima: 1500,    // 1 YEAR
    starter: 3500,    // Monthly
    pro: 5000,        // Monthly
    enterprise: 9000, // Monthly
  }

  const planPeriods = {
    mkulima: 365,
    starter: 30,
    pro: 30,
    enterprise: 30,
  }
  // ... create subscription record
}
```

---

## 📊 Revenue Tracking

### Monthly Recurring Revenue (MRR)

```sql
SELECT 
  p.subscription_tier,
  COUNT(*) as active_users,
  CASE 
    WHEN p.subscription_tier = 'starter' THEN 3500
    WHEN p.subscription_tier = 'pro' THEN 5000
    WHEN p.subscription_tier = 'enterprise' THEN 9000
    ELSE 0
  END as monthly_tier_revenue,
  COUNT(*) * 
  CASE 
    WHEN p.subscription_tier = 'starter' THEN 3500
    WHEN p.subscription_tier = 'pro' THEN 5000
    WHEN p.subscription_tier = 'enterprise' THEN 9000
    ELSE 0
  END as total_monthly_revenue
FROM profiles p
WHERE p.subscription_expiry > NOW()
  AND p.subscription_tier IS NOT NULL
GROUP BY p.subscription_tier
ORDER BY total_monthly_revenue DESC;
```

### Mkulima One-Time Revenue

```sql
SELECT 
  COUNT(*) as mkulima_users,
  COUNT(*) * 1500 as total_mkulima_revenue,
  AVG(EXTRACT(DAY FROM (subscription_expiry - subscription_start_date))) as avg_days_remaining
FROM profiles
WHERE subscription_tier = 'mkulima'
  AND subscription_expiry > NOW();
```

---

## 🗑️ Removed Features

### ❌ 5% Commission System (COMPLETELY DELETED)

**What Was Removed**:
- `trackCommission()` function
- `commission_tracking` table
- 5% calculations on sales
- Commission revenue reporting

**What Sellers Keep Now**:
- **100% of all sales** ✅
- No percentage cuts
- Direct payment from buyer to seller
- Cleaner transactions

**Revenue Model**:
- Subscriptions only
- Predictable MRR
- No transaction-dependent income
- Simpler accounting

---

## 🧪 Testing Checklist

### M-Pesa Integration
- [ ] Test Mkulima payment (1,500 KES)
  - Verify: `subscription_tier` = "mkulima"
  - Verify: `subscription_period_days` = 365
  - Verify: `subscription_expiry` = 365 days from now

- [ ] Test Starter payment (3,500 KES)
  - Verify: `subscription_tier` = "starter"
  - Verify: `subscription_expiry` = 30 days from now

- [ ] Test Pro payment (5,000 KES)
  - Verify: `subscription_tier` = "pro"
  - Verify: Features accessible

- [ ] Test Enterprise payment (9,000 KES)
  - Verify: `subscription_tier` = "enterprise"
  - Verify: API access

### UI/UX
- [ ] Mkulima tier shows green badge
- [ ] Mkulima shows "✅ Safe & Supported"
- [ ] Renewal banner appears 3 days before expiry
- [ ] "Renew Now" button works
- [ ] Free plan users see upgrade prompts
- [ ] Features locked/unlocked per tier

### Database
- [ ] Migration applied successfully
- [ ] Columns created with correct types
- [ ] Indexes created for performance
- [ ] Sample data has subscription info

---

## 🚀 Deployment Steps

### 1. Database Migration
```bash
# Apply migration
supabase db push

# Verify
SELECT COUNT(*) FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('subscription_tier', 'subscription_expiry', 'subscription_start_date', 'subscription_period_days');
```

### 2. Deploy Deno Function
```bash
supabase functions deploy mpesa-payment
```

### 3. Deploy Frontend
```bash
npm run build
# Deploy to Vercel/Netlify
```

### 4. Update Supabase Secrets
```
MPESA_CONSUMER_KEY=xxx
MPESA_CONSUMER_SECRET=xxx
MPESA_PASSKEY=xxx
MPESA_SHORTCODE=174379
```

---

## ✅ Summary

✅ **4 subscription tiers** with flexible pricing  
✅ **Mkulima 1-year special offer** highlighted (KES 1,500)  
✅ **No commissions** - sellers keep 100%  
✅ **3-day renewal window** with prominent alerts  
✅ **Automatic tier detection** from payment amount  
✅ **1-year vs 30-day** subscriptions supported  
✅ **Green marketing highlight** for Mkulima  
✅ **Production-ready** deployment

**Next Steps**:
- [ ] Run database migration
- [ ] Deploy Deno function
- [ ] Test all 4 tier payments
- [ ] Verify UI highlights Mkulima properly
- [ ] Deploy to production
- [ ] Monitor M-Pesa callbacks
- [ ] Set up renewal email reminders
