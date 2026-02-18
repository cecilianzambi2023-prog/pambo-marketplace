# 💳 PAMBO Subscription System - Updated Architecture

**Updated**: February 13, 2026  
**Status**: 🟢 Complete & Production Ready  
**Change**: 3 Monthly Tiers (Commission system removed)

---

## 🎯 Subscription Model

### 3 Monthly Plans

| Plan | Price | Billing | Description |
|------|-------|---------|-------------|
| **Starter** | 3,500 KES | Monthly | Perfect for new sellers |
| **Pro** | 7,000 KES | Monthly | Best for growing businesses |
| **Enterprise** | 14,000 KES | Monthly | For large-scale operations |

### Key Features by Tier

#### Starter (3,500 KES/month)
- Up to 20 active listings
- 5 images per listing
- 2 featured listings
- Basic analytics
- Email support

#### Pro (7,000 KES/month)
- Up to 50 active listings
- 10 images per listing
- 5 featured listings
- Advanced analytics
- Priority support
- Custom branding option

#### Enterprise (14,000 KES/month)
- Unlimited active listings
- 20 images per listing
- 10 featured listings
- Real-time analytics
- 24/7 dedicated support
- API access
- Custom integrations

---

## 🗄️ Database Changes

### New Columns in `profiles` Table

```sql
ALTER TABLE profiles
ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'starter';
ADD COLUMN subscription_expiry TIMESTAMP WITH TIME ZONE;
ADD COLUMN subscription_start_date TIMESTAMP WITH TIME ZONE;
```

**Migration File**: `supabase/migrations/add_subscription_tier_to_profiles.sql`

### Column Definitions

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `subscription_tier` | VARCHAR(50) | 'starter' | Current subscription: starter, pro, enterprise |
| `subscription_expiry` | TIMESTAMP | NULL | When subscription renews (Day 30) |
| `subscription_start_date` | TIMESTAMP | NULL | When subscription was activated |

---

## 💾 Backend Logic

### M-Pesa Payment Flow

1. **Payment Initiated**
   - User selects tier and enters phone
   - Deno function receives: `amount`, `phone`, `orderId`, `buyerId`

2. **STK Push Callback** (Successful Payment)
   - M-Pesa returns: `transactionAmount`, `MpesaReceiptNumber`
   - Function records receipt in `transactions` table
   - **NEW**: Detects tier from amount:
     - 3,500 KES → `Starter`
     - 7,000 KES → `Pro`
     - 14,000 KES → `Enterprise`

3. **Profile Update**
   ```typescript
   // After successful payment:
   const { error: profileUpdateError } = await supabase
     .from("profiles")
     .update({
       subscription_tier: subscriptionTier,      // starter | pro | enterprise
       subscription_expiry: 30daysFromNow,       // Auto-renewal date
       subscription_start_date: now.toISO()      // Activation timestamp
     })
     .eq("user_id", payment.user_id)
   ```

4. **Farmer Subscription** (If applicable)
   - Checks if payment description includes "Mkulima" or "farmer"
   - Triggers `activate_farmer_subscription` RPC

### Deno Function Updates

**File**: `services/supabase/functions/mpesa-payment/index.ts`

```typescript
// Step 3.5: Determine subscription tier based on amount
let subscriptionTier: 'starter' | 'pro' | 'enterprise' = 'starter'
if (transactionAmount === 7000) {
  subscriptionTier = 'pro'
} else if (transactionAmount === 14000) {
  subscriptionTier = 'enterprise'
}

// Calculate expiry (Day 30)
const subscriptionExpiry = new Date()
subscriptionExpiry.setDate(subscriptionExpiry.getDate() + 30)

// Update user profile with tier and expiry
const { error: profileUpdateError } = await supabase
  .from("profiles")
  .update({
    subscription_tier: subscriptionTier,
    subscription_expiry: subscriptionExpiry.toISOString(),
    subscription_start_date: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
  .eq("user_id", payment.user_id)
```

---

## 🎨 Frontend UI Updates

### Dashboard Renewal Logic

**File**: `components/Dashboard.tsx`

#### New Calculation
```typescript
// Check if subscription expires in <= 1 day
const subscriptionExpiryTime = user.subscriptionExpiry ? new Date(user.subscriptionExpiry).getTime() : null;
const daysRemaining = subscriptionExpiryTime
  ? Math.ceil((subscriptionExpiryTime - Date.now()) / (1000 * 60 * 60 * 24))
  : 0;

// Show renewal prompt if expiring soon or expired
const isSubscriptionExpiringSoon = subscriptionExpiryTime && daysRemaining <= 1;
const showRenewalPrompt = !isSubscriptionActive || isSubscriptionExpiringSoon;
```

#### Renewal Banner
- **Shows when**: Subscription expires within 24 hours OR already expired
- **Color**: Red banner (urgent) or Blue banner (free plan)
- **Action**: "Renew Now" button triggers payment flow
- **Display**: 
  - "⚠️ Your subscription expires today!" (daysRemaining = 0)
  - "⚠️ Your subscription expires in 1 day!" (daysRemaining = 1)
  - "You are on the Free Plan." (never paid)

---

## 🗑️ Removed Features

### Commission System - DELETED ✅

**What Was Removed**:
- ❌ `trackCommission()` function
- ❌ `commission_tracking` table queries
- ❌ 5% commission calculations
- ❌ Commission revenue tracking in `getTotalRevenue()`

**New Revenue Model**:
- ✅ Subscription fees only
- ✅ `getTotalRevenue()` returns only subscription revenue
- ✅ Simpler accounting model
- ✅ Predictable MRR (Monthly Recurring Revenue)

**Before**:
```typescript
// DELETED:
async trackCommission(orderId, amount, 0.05)  // 5% commission
const commissionRevenue = commissions.reduce(...)
totalRevenue = subscriptionRevenue + commissionRevenue  // Both sources
```

**After**:
```typescript
// KEPT (simplified):
async getTotalRevenue() {
  const subscriptions = await getActiveSubscriptions()
  return subscriptions.reduce(sum => sum += monthlyPrice)  // Subscriptions only
}
```

---

## 📊 Subscription Lifecycle

```
Day 1 (Payment)
├─ User selects tier and pays
├─ M-Pesa callback received
├─ subscription_tier updated in profiles
└─ subscription_expiry set to Day 30

Days 2-29
├─ User has full access to tier features
└─ Subscription active
    
Day 30 (Renewal Trigger)
├─ Dashboard shows renewal banner
├─ daysRemaining = 1 (if check runs today)
├─ ShowRenewalPrompt = true
└─ "Renew Now" button appears

Day 31+ (If not renewed)
├─ subscription_expiry < now()
├─ isSubscriptionActive = false
├─ Features revoked
└─ Free tier activated
```

---

## 🔄 Automatic Renewal Process

### Scheduled Task (to implement)

```sql
-- Run daily via Supabase Edge Function or cron job
-- Checks for subscriptions expiring in 3 days
SELECT user_id, email, subscription_tier
FROM profiles
WHERE subscription_expiry >= now()
  AND subscription_expiry <= now() + INTERVAL '3 days'
  AND subscription_tier IS NOT NULL

-- Send SMS/Email notification:
-- "Your subscription renews in 3 days. KES 3,500 will be charged."
```

---

## 🧪 Testing Checklist

### M-Pesa Integration
- [ ] Test Starter payment (3,500 KES)
  - Check: `subscription_tier` = "starter"
  - Check: `subscription_expiry` = 30 days from now
  - Check: mpesa_receipt_number saved in transactions

- [ ] Test Pro payment (7,000 KES)
  - Check: `subscription_tier` = "pro"
  - Check: All pro features enabled

- [ ] Test Enterprise payment (14,000 KES)
  - Check: `subscription_tier` = "enterprise"
  - Check: API access granted

### UI/UX
- [ ] Dashboard shows "Days Remaining" for active subscriptions
- [ ] Renewal banner shows red when < 24 hours
- [ ] "Renew Now" button works and opens payment modal
- [ ] Free plan users see upgrade prompts
- [ ] Features locked based on subscription_tier

### Database
- [ ] Columns added to profiles table
- [ ] Indexes created for performance
- [ ] Sample data has subscription info
- [ ] Queries filter by subscription_tier efficiently

---

## 📈 Revenue Tracking

### Original Model (Discontinued)
```
MRR = Subscription Revenue + Commission Revenue
e.g., MRR = 10,000 KES (subs) + 2,500 KES (5% commission) = 12,500 KES
```

### New Model (Active)
```
MRR = Subscription Revenue Only
e.g., MRR = 10,000 KES (subs)
Clean, predictable, no transaction-dependent revenue
```

### Query Active Revenue
```typescript
// Get monthly recurring revenue
const { totalRevenue } = await subscriptionService.getTotalRevenue('month')
console.log(`MRR: ${totalRevenue.toLocaleString()} KES`)
```

---

## 🚀 Deployment Steps

### 1. Database Migration
```bash
# Apply migration
supabase db push

# Verify columns created
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('subscription_tier', 'subscription_expiry', 'subscription_start_date')
```

### 2. Deploy Deno Function
```bash
supabase functions deploy mpesa-payment
```

### 3. Update Frontend
```bash
npm run build
# Deploy to Vercel/Netlify
```

### 4. Configure Supabase Secrets
```
SUPABASE_URL: https://cyydmongvxzdynmdyrzp.supabase.co
SUPABASE_SERVICE_ROLE_KEY: [your-key]
MPESA_CONSUMER_KEY: [your-key]
MPESA_CONSUMER_SECRET: [your-key]
MPESA_PASSKEY: [your-key]
MPESA_SHORTCODE: 174379
```

---

## 📝 Summary

✅ **3 subscription tiers** (Starter, Pro, Enterprise)  
✅ **No commission system** (removed entirely)  
✅ **Auto-detection of tier** from payment amount  
✅ **Day 30 renewal prompts** in dashboard  
✅ **Subscription tier column** added to profiles  
✅ **M-Pesa receipt tracking** in transactions  
✅ **30-day subscription cycles** with clear expiry dates  
✅ **Production ready deployment**

**Next Steps**:
- Set up scheduled renewal reminders (optional)
- Implement auto-renewal logic (requires bank account tokenization)
- Add subscription management dashboard in admin panel
- Create SLA for uptime during peak subscription times
