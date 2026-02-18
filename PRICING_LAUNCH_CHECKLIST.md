#!/usr/bin/env node

/**
 * PRICING & PAYMENT LAUNCH CHECKLIST
 * ==================================
 * 
 * CRITICAL: Complete ALL checks before deploying to production
 * Use this checklist to verify the entire pricing/subscription flow
 */

// SECTION 1: CODE DEPLOYMENT
// ===========================
// [ ] Commit all new files:
//     - components/PricingTable.tsx ✅ Created
//     - components/PricingPaymentModal.tsx ✅ Created
//     - components/PricingPage.tsx ✅ Created
//     - hooks/useSubscriptionPayment.ts ✅ Created

// [ ] Verify mpesa-payment Deno function is deployed:
//     git log services/supabase/functions/mpesa-payment/index.ts
//     Check for: tier detection logic (1500/3500/5000/9000)
//     Check for: subscription profile updates with correct columns

// [ ] Deploy database migrations (if not already done):
//     Run: supabase migration up
//     Verify: profiles table has subscription_period_days column

// [ ] Update App.tsx with PricingPage route:
//     Import PricingPage from './components/PricingPage'
//     Add Route: <Route path="/pricing" element={<PricingPage />} />


// SECTION 2: CONFIGURATION VERIFICATION
// =======================================
// [ ] Environment variables in .env.local:
//     VITE_SUPABASE_URL=<your_url>
//     VITE_SUPABASE_ANON_KEY=<your_anon_key>
//     (NO SERVICE_ROLE_KEY in frontend .env)

// [ ] Supabase Edge Function secrets set in Supabase Dashboard:
//     SUPABASE_SERVICE_ROLE_KEY ✅ (Not in .env, only in Cloud Secrets)
//     MPESA_CONSUMER_KEY
//     MPESA_CONSUMER_SECRET
//     MPESA_SHORTCODE
//     MPESA_PASSKEY

// [ ] M-Pesa credentials verified:
//     Go to: https://developer.safaricom.co.ke/
//     Verify: Consumer Key, Consumer Secret, Shortcode, Passkey
//     Verify: STK Push callback URL points to your Deno function


// SECTION 3: DATABASE SCHEMA VALIDATION
// =======================================
// [ ] Profiles table has all required columns:
//     Run this query in Supabase SQL Editor:

const dbValidationQuery = `
SELECT 
  column_name, 
  data_type,
  is_nullable 
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
`;

/* Expected results:
┌────────────────┬──────────────────────┬───────────────┐
│ user_id        │ uuid                 │ NO            │ (primary key)
│ full_name      │ character varying    │ YES           │
│ avatar_url     │ character varying    │ YES           │
│ subscription_tier    │ character varying    │ YES      │ ('mkulima'|'starter'|'pro'|'enterprise')
│ subscription_expiry  │ timestamp with tz    │ YES      │
│ subscription_start_date │ timestamp with tz  │ YES    │
│ subscription_period_days │ integer           │ YES    │ (30 or 365)
│ is_banned      │ boolean              │ YES           │
│ is_admin       │ boolean              │ YES           │
│ created_at     │ timestamp with tz    │ NO            │
│ updated_at     │ timestamp with tz    │ NO            │
└────────────────┴──────────────────────┴───────────────┘
*/

// [ ] Verify Row Level Security (RLS) on profiles table:
//     Users can read/update only their own row
//     Admin can read/update all rows (if needed)


// SECTION 4: DENO FUNCTION VALIDATION
// =====================================
// [ ] Test mpesa-payment function with cURL:

const testPaymentFunction = `
# Test with curl:
curl -X POST https://<your-project>.supabase.co/functions/v1/mpesa-payment \\
  -H "Authorization: Bearer <ANON_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone": "254700123456",
    "amount": 3500,
    "userId": "<test_user_uuid>"
  }'

# Expected response:
{
  "success": true,
  "message": "M-Pesa payment initiated",
  "paymentId": "<uuid>",
  "orderId": "<uuid>"
}
`;

// [ ] Test with all 4 amounts:
const testAmounts = {
  mkulima: 1500,      // Should set period_days to 365
  starter: 3500,      // Should set period_days to 30
  pro: 5000,          // Should set period_days to 30
  enterprise: 9000,   // Should set period_days to 30
};

// [ ] Verify tier detection in function works:
// Use cURL to test each amount and check:
// - Correct tier assigned
// - Correct period_days set (365 for mkulima, 30 for others)
// - Profile updated when payment completes


// SECTION 5: COMPONENT VERIFICATION
// ==================================
// [ ] Test PricingTable.tsx:
//     Run: npm run dev
//     Navigate to: /pricing
//     Verify: All 4 tiers display
//     Verify: Mkulima shows green badge "🎁 SPECIAL OFFER"
//     Verify: Mkulima shows "✅ Safe & Supported"
//     Verify: Monthly tiers show "/MONTHLY"
//     Verify: Mkulima shows "/ 1 YEAR"
//     Verify: "Sellers keep 100%—No Commissions!" banner visible
//     Verify: "Buy Now" buttons are clickable

// [ ] Test PricingPaymentModal.tsx:
//     Click "Buy Now" on any tier
//     Verify: Modal opens with correct tier name
//     Verify: Modal shows correct amount (1500/3500/5000/9000)
//     Verify: Phone input shows placeholder
//     Verify: Entering "0712345678" auto-formats to "254712345678"
//     Verify: Valid phone shows green border
//     Verify: Invalid phone shows red border
//     Verify: "Pay with M-Pesa" button disabled until phone valid
//     Verify: Success state shows after successful payment
//     Verify: Error state shows with retry option if payment fails

// [ ] Test phone auto-formatting:
const phoneTestCases = {
  '0712345678': '254712345678',     // ✅ Should format
  '712345678': '254712345678',       // ✅ Should format (no leading 0)
  '254712345678': '254712345678',    // ✅ Should remain unchanged
  '101234567': '254101234567',       // ✅ Safaricom 101
  '0732345678': '254732345678',      // ✅ Safaricom 073
  '0704345678': '254704345678',      // ✅ Airtel/Equitel
};


// SECTION 6: PAYMENT FLOW END-TO-END TEST
// ========================================
// [ ] STAGING TEST (use M-Pesa sandbox first):
//     1. Login as test user
//     2. Navigate to /pricing
//     3. Click "Buy Now" on Starter tier (KES 3,500)
//     4. Enter valid Safaricom test number
//     5. Verify M-Pesa STK prompt appears
//     6. Enter test M-Pesa PIN (sandbox: 1234)
//     7. Wait for callback success
//     8. Check profile updated: subscription_tier = 'starter', subscription_period_days = 30
//     9. Check payments table has new record with status 'completed'
//     10. Dashboard should show subscription expiry date (30 days from now)

// [ ] REPEAT TEST with each tier:
//     - Mkulima: 1500, verify period_days = 365
//     - Pro: 5000, verify period_days = 30
//     - Enterprise: 9000, verify period_days = 30

// [ ] Test renewal flow (3-day window):
//     Dashboard should show "Renew Now" button when <= 3 days until expiry
//     Click "Renew Now" should open same payment modal
//     Successful renewal should extend subscription_expiry by tier's period_days


// SECTION 7: DASHBOARD INTEGRATION
// =================================
// [ ] Dashboard.tsx updated with renewal logic:
//     Verify import: useSubscriptionPayment hook
//     Verify: "Renew Now" button appears when daysRemaining <= 3
//     Verify: Button hidden when daysRemaining > 3
//     Verify: Button opens PricingPaymentModal
//     Verify: Modal shows current tier as default selection

// [ ] Verify no old subscription modals interfere:
//     Search Dashboard.tsx for "SubscriptionModal" (old component)
//     If found, remove or replace with PricingPaymentModal
//     Search for "MPesaModal" or "PaymentModal" duplicates
//     Delete any old payment components


// SECTION 8: DATABASE RECORDS TEST
// =================================
// [ ] After successful payment, verify database:

const verifyPaymentRecord = `
-- Check payments table
SELECT id, user_id, amount, status, tier, created_at 
FROM payments 
WHERE user_id = '<test_user_uuid>'
ORDER BY created_at DESC 
LIMIT 1;

-- Check profile subscription
SELECT user_id, subscription_tier, subscription_start_date, subscription_expiry, subscription_period_days
FROM profiles
WHERE user_id = '<test_user_uuid>';

-- Check transactions table (if you have one)
SELECT id, user_id, type, description, amount, status, created_at
FROM transactions
WHERE user_id = '<test_user_uuid>'
ORDER BY created_at DESC
LIMIT 1;
`;

// [ ] Verify exactly these columns are populated:
const expectedProfileUpdate = {
  subscription_tier: 'starter',                        // Exact value based on amount
  subscription_start_date: 'current_timestamp',        // Now
  subscription_expiry: 'current_timestamp + 30 days',  // For mkulima: + 365 days
  subscription_period_days: 30,                        // For mkulima: 365
  is_banned: false,
};


// SECTION 9: SECURITY AUDIT
// ===========================
// [ ] CRITICAL: Service role key protection
//     Open .env file - should NOT contain SUPABASE_SERVICE_ROLE_KEY
//     Open .env.local - should NOT contain SUPABASE_SERVICE_ROLE_KEY
//     Check git history: git log --all -S "SUPABASE_SERVICE_ROLE_KEY" --

// [ ] CRITICAL: Phone number validation
//     Users can only enter valid Kenyan M-Pesa numbers (254xxxxxxxxx)
//     Invalid phone should not submit payment

// [ ] CRITICAL: Amount validation
//     Only accept exact amounts: 1500, 3500, 5000, 9000
//     Anything else should trigger error or default to Starter

// [ ] Verify no commission logic remains:
//     Search codebase: grep -r "commission\|0.05\|5%\|trackCommission" --include="*.ts" --include="*.tsx"
//     Search: grep -r "subtractCommission\|calculateCommission\|getCommission"
//     Result should be EMPTY (no commission logic anywhere)

// [ ] Check CORS settings:
//     M-Pesa callback URL must be whitelisted
//     Supabase Edge Function must accept callback from Safaricom


// SECTION 10: PERFORMANCE CHECKS
// ===============================
// [ ] Page load time:
//     /pricing should load in < 2 seconds
//     PricingTable should render without layout shift
//     Payment modal should open instantly

// [ ] API response time:
//     mpesa-payment function should respond in < 5 seconds
//     Payments table query should be < 1 second
//     Profile query should be < 1 second

// [ ] Database query performance:
//     Create index on profiles(subscription_tier) if not exists
//     Create index on payments(user_id, created_at) if not exists
//     Create index on profiles(subscription_expiry) if not exists


// SECTION 11: MONITORING & ANALYTICS
// ===================================
// [ ] Setup monitoring for:
//     - Payment success rate (should be > 95%)
//     - Payment failure rate and reasons
//     - Average response time for mpesa-payment function
//     - Number of active subscriptions per tier
//     - Renewal success rate

// [ ] Create Supabase alerts for:
//     - mpesa-payment function errors
//     - Any SQL errors in profile/payment updates
//     - Unusual payment patterns (multiple failed attempts)

// [ ] Setup logging:
//     console.log payment requests/responses
//     Log all database updates related to subscriptions
//     Log phone validation failures


// SECTION 12: GO-LIVE DEPLOYMENT
// ===============================
// [ ] Final code review:
//     Pull request approved by at least 1 other developer
//     All components tested in staging
//     No console errors or warnings

// [ ] Production deployment:
//     Deploy to production environment
//     Verify mpesa-payment function deployed
//     Run database migrations on production
//     Enable monitoring/alerts
//     Have rollback plan ready

// [ ] Post-deployment smoke tests:
//     Test payment with real M-Pesa in production
//     Verify email notifications sent (if configured)
//     Monitor error logs for first 24 hours
//     Check payment success rate remains > 95%

// [ ] Communicate to users:
//     Send announcement about new pricing page
//     Highlight Mkulima special offer to farmers
//     Provide customer support contact for payment issues
//     Create FAQ about new subscription system


// SECTION 13: TROUBLESHOOTING REFERENCE
// =======================================
const troubleshootingGuide = {
  "Payment modal doesn't open": [
    "✓ Check PricingPaymentModal imported in PricingPage",
    "✓ Verify userId is populated (user must be logged in)",
    "✓ Check selectedTier is not null when 'Buy Now' clicked",
  ],
  "Phone auto-format not working": [
    "✓ Check usePhoneFormatter hook is used in PricingPaymentModal",
    "✓ Verify regex pattern: /^(?:0|254)?(.{9})$/",
    "✓ Test with: 0712345678, 712345678, 254712345678",
  ],
  "M-Pesa STK doesn't appear": [
    "✓ Verify phone number is correct Kenyan format",
    "✓ Check M-Pesa sandbox enabled in Dashboard (if staging)",
    "✓ Verify amount is exactly one of: 1500, 3500, 5000, 9000",
    "✓ Check edge function has correct MPESA_CONSUMER_KEY etc",
  ],
  "Profile doesn't update after payment": [
    "✓ Check mpesa-payment function has access to SUPABASE_SERVICE_ROLE_KEY",
    "✓ Verify tier detection matches amount (1500→mkulima, etc)",
    "✓ Check profile RLS policy allows service role updates",
    "✓ Review function logs: supabase functions logs",
  ],
  "Wrong tier assigned": [
    "✓ Verify amount matches tier exactly (no off-by-1 errors)",
    "✓ Check mpesa-payment function tier detection logic",
    "✓ Test each amount: 1500, 3500, 5000, 9000 separately",
  ],
};


// HOW TO USE THIS CHECKLIST
// =========================
/*
1. Copy this file to your project root
2. Before launch, systematically go through each section
3. Check off items as completed
4. Do NOT deploy if any critical item is unchecked
5. Re-run checklist after any code changes
6. Keep a copy for future reference

CRITICAL SECTIONS (must pass before production deploy):
  ✗ Section 1: Code Deployment
  ✗ Section 2: Configuration Verification
  ✗ Section 4: Deno Function Validation
  ✗ Section 6: Payment Flow End-to-End Test (on STAGING first)
  ✗ Section 9: Security Audit (especially commission logic check)
  ✗ Section 13: All troubleshooting resolved

TIMELINE ESTIMATE:
  - Staging deployment & testing: 2-4 hours
  - Security audit & fixes: 1-2 hours
  - Production deployment: 30 mins
  - Post-deployment monitoring: 24 hours

POINT OF CONTACT:
  Payment Issues: Check Safaricom M-Pesa docs
  Database Issues: Check Supabase docs & logs
  Code Issues: Review github.com/supabase/supabase for sdk examples
*/

export const LAUNCH_CHECKLIST_VERSION = "1.0.0";
export const OFFSPRING_DECOR_PRICING_READY = true;
