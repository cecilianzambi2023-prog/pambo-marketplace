# ⚡ Offspring Decor Limited - Pricing Quick Reference

**Company**: Offspring Decor Limited  
**Payment Model**: Subscription Only (No Commissions)  
**Updated**: February 13, 2026

---

## 💰 The 4 Tiers

| Tier | Amount | Period | Use Case |
|------|--------|--------|----------|
| 🎁 **Mkulima** | **1,500 KES** | **1 YEAR** | Farmers - Special Offer |
| **Starter** | 3,500 KES | Monthly | New sellers |
| **Pro** | 5,000 KES | Monthly | Growing businesses |
| **Enterprise** | 9,000 KES | Monthly | Large operations |

---

## 🎯 Exact Payment Amounts

M-Pesa will ONLY accept:

```
1500 KES
3500 KES
5000 KES
9000 KES
```

**⚠️ Any other amount defaults to Starter (3,500 KES)**

---

## 🎁 Mkulima Highlighting

### Marketing Copy
```
🌾 MKULIMA - SPECIAL OFFER 🌾
1,500 KES FOR 1 FULL YEAR!
✅ Safe & Supported
✅ Your income is 100% yours
✅ Unlimited farm listings
✅ Direct market access
```

### Visual Design
- **Green badge**: "🎁 SPECIAL OFFER - 1 YEAR!"
- **Green button**: "Choose Mkulima"
- **Scaled slightly larger** than other tiers
- **Subtitle**: "✅ Safe & Supported"

---

## ⏰ Renewal Reminder Timeline

```
Day 27-28: Blue banner - "Your subscription renews in 3 days"
Day 29:    Yellow banner - "Your subscription renews in 1 day"
Day 30:    RED URGENT banner - "Your subscription renews TODAY!"
Day 31+:   RED EXPIRED banner - "Your subscription has expired"

All show: [Renew Now] button → Opens payment modal
```

---

## 💾 Database Tracking

Simple queries to check subscription status:

### Check User's Subscription
```sql
SELECT user_id, subscription_tier, subscription_expiry, subscription_period_days
FROM profiles
WHERE user_id = 'user_id_here';
```

### Get All Active Subscriptions
```sql
SELECT COUNT(*) as active_count,
       subscription_tier,
       COUNT(*) * CASE 
         WHEN subscription_tier = 'starter' THEN 3500
         WHEN subscription_tier = 'pro' THEN 5000
         WHEN subscription_tier = 'enterprise' THEN 9000
         WHEN subscription_tier = 'mkulima' THEN 1500
         ELSE 0
       END as monthly_revenue
FROM profiles
WHERE subscription_expiry > NOW()
GROUP BY subscription_tier;
```

### Users Expiring in 3 Days
```sql
SELECT user_id, subscription_tier, subscription_expiry
FROM profiles
WHERE subscription_expiry >= NOW()
  AND subscription_expiry <= NOW() + INTERVAL '3 days'
ORDER BY subscription_expiry ASC;
```

---

## 🔧 Payment Mapping

**When M-Pesa callback arrives with amount:**

```typescript
if (amount === 1500) → tier = 'mkulima', days = 365
if (amount === 3500) → tier = 'starter', days = 30
if (amount === 5000) → tier = 'pro', days = 30
if (amount === 9000) → tier = 'enterprise', days = 30
else                 → tier = 'starter', days = 30 (default)
```

---

## ✅ What's Different

### ✅ New
- Mkulima 1-year option (1,500 KES)
- Pro now 5,000 KES (was 7,000)
- Enterprise now 9,000 KES (was 14,000)
- 3-day renewal window (was 1 day)
- Mkulima gets green special offer badge
- Different pricing supports different markets

### ❌ Deleted
- NO commission tracking
- NO 5% from sales
- Sellers keep 100%
- Clean, simple business model

---

## 🚀 For Developers

### Checking Subscription Status
```typescript
import { supabase } from './supabaseClient'

const { data: profile } = await supabase
  .from('profiles')
  .select('subscription_tier, subscription_expiry')
  .eq('user_id', userId)
  .single()

const daysRemaining = Math.ceil(
  (new Date(profile.subscription_expiry) - Date.now()) / (1000 * 60 * 60 * 24)
)

if (daysRemaining <= 3) {
  // Show renewal prompt
}
```

### Feature Gates by Tier
```typescript
const features = {
  mkulima: { listings: Infinity, images: 10, featured: 5, analytics: true },
  starter: { listings: 20, images: 5, featured: 2, analytics: false },
  pro:     { listings: 50, images: 10, featured: 5, analytics: true },
  enterprise: { listings: Infinity, images: 20, featured: 10, analytics: true },
}

const userFeatures = features[profile.subscription_tier]
```

---

## 📞 Support Quick Links

- **Pricing details**: See OFFSPRING_DECOR_SUBSCRIPTION_MODEL.md
- **M-Pesa setup**: Check mpesaService.ts
- **Database schema**: See add_subscription_tier_to_profiles.sql migration
- **UI components**: Check SubscriptionComponents.tsx
- **Test tiering**: Run test payment with exact amounts above

---

## 🎉 Key Selling Points

> "**Offspring Decor Limited Marketplace**"
> 
> ✅ Choose your plan - Mkulima (1 year), Starter (monthly), Pro, or Enterprise
> 
> ✅ Transparent pricing - No hidden commissions
> 
> ✅ Fast payments - Sellers keep 100%
> 
> ✅ Farmers first - Mkulima at just 1,500 KES/year
