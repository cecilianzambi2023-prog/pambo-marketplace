# ⚡ Subscription System - Quick Reference

## 🔧 For Developers

### 1. Check User's Subscription Tier

```typescript
// In any component or service:
import { supabase } from './supabaseClient'

const { data: profile } = await supabase
  .from('profiles')
  .select('subscription_tier, subscription_expiry')
  .eq('user_id', userId)
  .single()

console.log(profile.subscription_tier)  // 'starter' | 'pro' | 'enterprise' | null
```

### 2. Calculate Days Until Renewal

```typescript
const expiryDate = new Date(profile.subscription_expiry)
const daysUntilRenewal = Math.ceil((expiryDate - Date.now()) / (1000 * 60 * 60 * 24))

if (daysUntilRenewal <= 1) {
  // Show renewal warning
}

if (daysUntilRenewal <= 0) {
  // Subscription expired
}
```

### 3. Feature Gating by Tier

```typescript
const getFeatureLimits = (tier: string) => {
  const limits = {
    starter: { listings: 20, images: 5, featured: 2, analytics: false, api: false },
    pro: { listings: 50, images: 10, featured: 5, analytics: true, api: false },
    enterprise: { listings: Infinity, images: 20, featured: 10, analytics: true, api: true },
  }
  return limits[tier] || limits.starter  // Default to starter
}

const userLimits = getFeatureLimits(profile.subscription_tier)
if (userListings.length >= userLimits.listings) {
  // Show "Upgrade to post more" button
}
```

### 4. Recording a Payment

```typescript
// When payment is successful:
const { data: payment } = await supabase
  .from('payments')
  .insert({
    order_id: orderId,
    user_id: userId,
    phone_number: mpesaPhone,
    amount: 3500,  // Must be 3500, 7000, or 14000
    status: 'completed',
    description: 'Monthly Subscription - Starter',
    mpesa_receipt_number: receiptNumber,
    created_at: new Date().toISOString(),
  })
  .select()
  .single()

// Deno function automatically:
// 1. Detects tier from amount
// 2. Updates profiles table
// 3. Sets 30-day expiry
```

### 5. Get Monthly Recurring Revenue (MRR)

```typescript
import { subscriptionService } from './services/subscriptionService'

const { totalRevenue } = await subscriptionService.getTotalRevenue('month')
console.log(`Monthly Revenue: ${totalRevenue.toLocaleString()} KES`)
```

---

## 📱 For End Users

### Subscription Status in Dashboard

```
Subscription: Pro Plan
Days Remaining: 15

[Analytics available] [Priority support] [Renew in 15 days]
```

### When Subscription Expires

```
⚠️ Your subscription expires in 1 day!
[Renew Now button]

Click to select tier and pay via M-Pesa
```

### Pricing Display

```
Starter: 3,500 KES/month
Pro: 7,000 KES/month (Most Popular)
Enterprise: 14,000 KES/month
```

---

## 🗄️ Database Queries

### Get All Active Subscriptions

```sql
SELECT u.id, u.name, p.subscription_tier, p.subscription_expiry
FROM profiles p
JOIN users u ON p.user_id = u.id
WHERE p.subscription_tier IS NOT NULL
  AND p.subscription_expiry > NOW()
ORDER BY subscription_tier DESC;
```

### Get Expiring Soon (Next 3 Days)

```sql
SELECT user_id, subscription_tier, subscription_expiry
FROM profiles
WHERE subscription_expiry >= NOW()
  AND subscription_expiry <= NOW() + INTERVAL '3 days'
ORDER BY subscription_expiry ASC;
```

### Revenue by Tier (Last Month)

```sql
SELECT 
  p.subscription_tier,
  COUNT(*) as users,
  COUNT(*) * (
    CASE 
      WHEN p.subscription_tier = 'starter' THEN 3500
      WHEN p.subscription_tier = 'pro' THEN 7000
      WHEN p.subscription_tier = 'enterprise' THEN 14000
      ELSE 0
    END
  ) as total_revenue
FROM profiles p
WHERE p.subscription_start_date >= NOW() - INTERVAL '1 month'
  AND p.subscription_tier IS NOT NULL
GROUP BY p.subscription_tier;
```

---

## 🚨 Payment Amounts (IMPORTANT)

Only these amounts are recognized:

| Amount | Tier | Code Path |
|--------|------|-----------|
| **3,500** | Starter | `if (amount !== 7000 && amount !== 14000) -> starter` |
| **7,000** | Pro | `if (amount === 7000) -> pro` |
| **14,000** | Enterprise | `if (amount === 14000) -> enterprise` |

⚠️ Any other amount will default to **Starter**

---

## 🔍 Troubleshooting

### Issue: Subscription tier not updating after payment

**Solution**:
1. Check payment status in `payments` table (should be 'completed')
2. Check `transactions` table has mpesa_receipt_number
3. Verify `profiles` table has subscription_tier column
4. Check function logs in Supabase dashboard

```sql
-- Debug query
SELECT p.*, 
       pa.status, 
       pa.mpesa_receipt_number
FROM profiles p
LEFT JOIN payments pa ON p.user_id = pa.user_id
WHERE p.user_id = 'user_id_here'
ORDER BY pa.created_at DESC;
```

### Issue: "Renew Now" button doesn't appear

**Check**:
1. Is `subscription_expiry` set? (Should be a date)
2. Is `daysRemaining = 1` or less?
3. Is user a seller? (`role = 'seller'`)
4. Is account active? (`accountStatus = 'active'`)

```typescript
// Debug in console
const user = getCurrentUser()
console.log('subscription_expiry:', user.subscriptionExpiry)
console.log('role:', user.role)
console.log('accountStatus:', user.accountStatus)
```

### Issue: Wrong tier assigned to user

**Solution**:
1. Check payment `amount` in M-Pesa callback
2. Verify Deno function logic (lines 180-196)
3. Manually update profile if needed:

```sql
UPDATE profiles
SET subscription_tier = 'pro',
    subscription_expiry = NOW() + INTERVAL '30 days'
WHERE user_id = 'user_id_here';
```

---

## 📞 Support

For issues with:
- **M-Pesa integration**: Check MPESA credentials in Supabase Secrets
- **Database schema**: Run migration: `supabase/migrations/add_subscription_tier_to_profiles.sql`
- **Deno function**: Check function logs at Supabase > Functions > mpesa-payment
- **Frontend UI**: Check Dashboard.tsx for subscription_expiry prop
