# ✅ DEPLOYMENT CHECKLIST - Offspring Decor Limited Pricing Update

**Date**: February 13, 2026  
**Version**: 2.0  
**Company**: Offspring Decor Limited

---

## 📋 Files Modified

### Core Configuration
- ✅ **constants.ts** - Updated SUBSCRIPTION_PRICING object with 4 tiers
- ✅ **subscriptionService.ts** - Updated planPricing and planPeriods
- ✅ **supabase/migrations/add_subscription_tier_to_profiles.sql** - Added subscription_period_days column

### Backend (Deno Functions)
- ✅ **services/supabase/functions/mpesa-payment/index.ts** - Tier detection for amounts 1500/3500/5000/9000

### Frontend Components
- ✅ **components/Dashboard.tsx** - Changed renewal window from 1 day to 3 days
- ✅ **components/SubscriptionComponents.tsx** - Added Mkulima tier with green highlight and special offer badge

### Documentation
- ✅ **OFFSPRING_DECOR_SUBSCRIPTION_MODEL.md** - Complete implementation guide
- ✅ **PRICING_QUICK_REFERENCE.md** - Quick reference for developers
- ✅ **DEPLOYMENT_CHECKLIST.md** - This file

---

## 🔍 What Changed

### Pricing
```javascript
BEFORE:                          AFTER (Offspring Decor Limited):
- Starter: 3,500 KES/month  →    - Mkulima: 1,500 KES/YEAR ← NEW!
- Pro: 7,000 KES/month      →    - Starter: 3,500 KES/month (same)
- Enterprise: 14,000/month  →    - Pro: 5,000 KES/month ← REDUCED
                                 - Enterprise: 9,000 KES/month ← REDUCED
```

### Commission Model
```javascript
BEFORE: Subscriptions + 5% commission cuts
AFTER:  Subscriptions ONLY (100% to sellers)
```

### Renewal Window
```javascript
BEFORE: Show "Renew Now" when <= 1 day remaining
AFTER:  Show "Renew Now" when <= 3 days remaining
```

### UI Highlight
```javascript
BEFORE: No special Mkulima highlighting
AFTER:  Green badge "🎁 SPECIAL OFFER - 1 YEAR!"
        Green button "Choose Mkulima"
        Subtitle "✅ Safe & Supported"
        Slightly scaled larger
```

---

## 🧪 Pre-Deployment Testing

### Test 1: Database Migration
```bash
# Step 1: Run migration
supabase db push

# Step 2: Verify columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN (
  'subscription_tier', 
  'subscription_expiry', 
  'subscription_start_date',
  'subscription_period_days'
);

# Expected: 4 rows returned
```

### Test 2: Payment Amount Mapping (Local)
```typescript
// Test Deno function locally
const testAmounts = [1500, 3500, 5000, 9000, 999]; // 999 = should default to starter

testAmounts.forEach(amount => {
  let tier = 'starter', days = 30;
  
  if (amount === 1500) { tier = 'mkulima'; days = 365; }
  else if (amount === 5000) { tier = 'pro'; days = 30; }
  else if (amount === 9000) { tier = 'enterprise'; days = 30; }
  
  console.log(`${amount} KES → ${tier} (${days} days)`);
});
```

### Test 3: UI Component Rendering
```bash
# Step 1: Run dev server
npm run dev

# Step 2: Navigate to subscription page
# Check that:
- ✅ Mkulima shows green badge
- ✅ Mkulima shows "✅ Safe & Supported"
- ✅ Mkulima shows "KES 1,500 /1 YEAR"
- ✅ Pro shows "KES 5,000 /Monthly"
- ✅ Enterprise shows "KES 9,000 /Monthly"
- ✅ Mkulima button is green
- ✅ Pro button is blue (highlighted)
```

### Test 4: Payment Callback Simulation (Staging)
```bash
# Trigger test payment with each amount
curl -X POST http://localhost:54321/functions/v1/mpesa-payment \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "254708374149",
    "amount": 1500,
    "orderId": "test_1500",
    "description": "Mkulima Test",
    "buyerId": "test_user"
  }'

# Verify response:
# {
#   "success": true,
#   "message": "Payment initiated",
#   "amount": 1500
# }
```

### Test 5: Dashboard Renewal Logic
```typescript
// Test renewal calculations
const now = Date.now();

// Scenario 1: 3 days remaining
const expiry3Days = new Date(now + 3 * 24 * 60 * 60 * 1000);
const daysRemaining3 = Math.ceil((expiry3Days - now) / (1000 * 60 * 60 * 24));
console.log(`3 days: ${daysRemaining3} days remaining, show banner: ${daysRemaining3 <= 3}`); // true

// Scenario 2: 5 days remaining
const expiry5Days = new Date(now + 5 * 24 * 60 * 60 * 1000);
const daysRemaining5 = Math.ceil((expiry5Days - now) / (1000 * 60 * 60 * 24));
console.log(`5 days: ${daysRemaining5} days remaining, show banner: ${daysRemaining5 <= 3}`); // false

// Scenario 3: Expired
const expiredDate = new Date(now - 1 * 24 * 60 * 60 * 1000);
const daysRemainingExp = Math.ceil((expiredDate - now) / (1000 * 60 * 60 * 24));
console.log(`Expired: ${daysRemainingExp} days remaining, show banner: ${daysRemainingExp <= 3}`); // true
```

---

## 🚀 Deployment Steps (Sequential)

### Phase 1: Database (Staging First)
```bash
# 1.1 Backup production database
# Contact Supabase support or use pg_dump

# 1.2 Apply migration to STAGING environment
supabase db push --linked  # for staging

# 1.3 Test queries on staging
# Run the verification queries above

# 1.4 If all good, apply to PRODUCTION
supabase db push --linked --db-url postgresql://user:pass@prod.db.io
```

### Phase 2: Backend Functions
```bash
# 2.1 Deploy updated Deno function to staging
supabase functions deploy mpesa-payment --project-ref staging

# 2.2 Test with staging credentials
# Use staging M-Pesa test keys

# 2.3 Deploy to production
supabase functions deploy mpesa-payment --project-ref production
```

### Phase 3: Frontend
```bash
# 3.1 Build and test locally
npm run build
npm run preview

# 3.2 Deploy to staging environment
npm run build
# scp dist/* staging-server:/var/www/app

# 3.3 Test on staging
# Visit https://staging-app.offspring-decor.com
# Check all 4 pricing tiers display correctly

# 3.4 Deploy to production
# npm run build && deploy to Vercel/Netlify
vercel deploy --prod
```

### Phase 4: Configuration
```bash
# 4.1 Verify Supabase secrets are set
# Check: MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY, MPESA_SHORTCODE

# 4.2 Test 3 payments (one of each new tier) on production
# 1,500 KES → Mkulima (watch profile updates)
# 5,000 KES → Pro (watch tier assignment)
# 9,000 KES → Enterprise (watch features unlock)

# 4.3 Monitor logs for errors
# Supabase Dashboard → Logs → mpesa-payment function
```

---

## ✅ Post-Deployment Verification

### Checklist
- [ ] Database migration applied successfully
- [ ] All 4 columns exist in profiles table
- [ ] Deno function deployed without errors
- [ ] Frontend shows all 4 pricing tiers
- [ ] Mkulima displays green badge and "✅ Safe & Supported"
- [ ] Test payment with 1,500 KES → profile shows tier='mkulima', period=365
- [ ] Test payment with 5,000 KES → profile shows tier='pro', period=30
- [ ] Test payment with 9,000 KES → profile shows tier='enterprise', period=30
- [ ] Dashboard shows 3-day renewal window (not 1 day)
- [ ] Renewal banner appears correctly when daysRemaining <= 3
- [ ] "Renew Now" button functional
- [ ] M-Pesa receipts saved to transactions table
- [ ] No console errors in browser
- [ ] No function errors in Supabase logs

---

## 🔄 Rollback Plan (If Needed)

### Quick Rollback
```bash
# 1. Revert database columns (create new migration to DROP columns)
# 2. Redeploy old Deno function version
# 3. Redeploy old frontend (from git tags)

# Simple revert:
git tag # list previous versions
git checkout v1.9.0  # checkout previous version
npm run build
vercel deploy --prod
```

### Data Recovery
```sql
-- If data was corrupted, restore from backup
-- Contact Supabase support for point-in-time recovery
-- Typical RPO: 1 hour, RTO: 30 minutes
```

---

## 📞 Support Contacts

- **M-Pesa Integration**: Check mpesaService.ts
- **Database Issues**: Supabase Dashboard → Logs
- **Function Errors**: Supabase Dashboard → Functions → mpesa-payment
- **UI/Frontend**: Browser console (F12 → Console tab)

---

## 🎉 Success Criteria

✅ **All prices are correct**
- Mkulima: 1,500 KES for 1 YEAR
- Starter: 3,500 KES/month
- Pro: 5,000 KES/month
- Enterprise: 9,000 KES/month

✅ **Mkulima is highlighted**
- Green badge visible
- "✅ Safe & Supported" text shown
- Scaled slightly larger than other tiers

✅ **Renewal window is 3 days**
- Banner shows at day 27, 28, 29, 30+
- "Renew Now" button always visible

✅ **No commissions**
- Sellers keep 100%
- No commission tables queried
- Clean transaction flow

✅ **Database updated**
- subscription_period_days column exists
- Values are 30 or 365 depending on tier

---

## 📊 Rollout Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Database Testing | 2 hours | Ready |
| Staging Deploy | 15 min | Ready |
| Staging Testing | 2 hours | Ready |
| Production Deploy | 15 min | Ready |
| Production Testing | 1 hour | Ready |
| Monitor (24h) | 24 hours | Ready |

**Total time to full production**: ~6 hours

---

## ✨ What's Live

When all steps complete:

✅ Users can subscribe to Mkulima for 1,500 KES/year  
✅ Users get 3-day renewal warning (not 1 day)  
✅ Mkulima has special green highlighting  
✅ Pro and Enterprise have new lower prices  
✅ Profile table tracks subscription period (30 or 365 days)  
✅ M-Pesa payment amounts: 1500, 3500, 5000, 9000 KES only  
✅ Sellers keep 100% with NO commissions  

**Offspring Decor Limited is live!** 🚀
