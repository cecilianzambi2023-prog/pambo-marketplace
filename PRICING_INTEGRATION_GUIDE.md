// PRICING PAGE INTEGRATION GUIDE
// ================================

// 1. ADD TO APP.TSX ROUTES
// ========================
// Add this import at the top of App.tsx:
import { PricingPage } from './components/PricingPage';

// Then add a route in your routing configuration:
// For React Router (if using):
<Route path="/pricing" element={<PricingPage />} />

// For Vite + React Navigation, add to your main app router


// 2. ADD NAVIGATION LINK
// =======================
// Add to your main navigation (Header/Navbar component):
<a 
  href="/pricing" 
  className="text-gray-600 hover:text-green-600 font-medium transition"
>
  Pricing
</a>

// Or update your navigation menu:
<nav>
  <a href="/dashboard">Dashboard</a>
  <a href="/marketplace">Marketplace</a>
  <a href="/pricing">Pricing</a>  {/* ADD THIS */}
  <a href="/help">Help</a>
</nav>


// 3. ADD SUBSCRIPTION RENEWAL BUTTON
// ===================================
// In your Dashboard.tsx, update the subscription renewal section:
import { PricingPaymentModal } from './components/PricingPaymentModal';

// In Dashboard component:
const [renewalModalOpen, setRenewalModalOpen] = useState(false);
const [currentTier, setCurrentTier] = useState<string>('starter');

// Replace existing "Renew Now" button logic with:
<PricingPaymentModal
  isOpen={renewalModalOpen}
  tier={currentTier as any}
  amount={getPriceForTier(currentTier)}
  userId={userId}
  onClose={() => setRenewalModalOpen(false)}
  onSuccess={() => {
    // Refresh subscription
    fetchUserSubscription();
    setRenewalModalOpen(false);
  }}
/>

<button
  onClick={() => setRenewalModalOpen(true)}
  className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition"
>
  Renew Now
</button>


// 4. SUBSCRIPTION TIER PRICING MAP
// =================================
export const TIER_AMOUNTS = {
  mkulima: 1500,
  starter: 3500,
  pro: 5000,
  enterprise: 9000,
} as const;

export const TIER_PERIODS = {
  mkulima: 365,        // 1 year
  starter: 30,         // 1 month
  pro: 30,             // 1 month
  enterprise: 30,      // 1 month
} as const;

export const getPriceForTier = (tier: string | undefined): number => {
  return TIER_AMOUNTS[tier as keyof typeof TIER_AMOUNTS] || TIER_AMOUNTS.starter;
};


// 5. ENVIRONMENT CHECK
// ====================
// Ensure your .env has these (NO KEYS - keys stay in Supabase Cloud Secrets):
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
# Service role key stays ONLY in Supabase Cloud Secrets, NOT in .env


// 6. DATABASE VERIFICATION
// =========================
// Run this query in Supabase to verify your profiles table:
/*
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

Expected columns:
- user_id (uuid, primary key)
- subscription_tier (varchar: 'mkulima', 'starter', 'pro', 'enterprise')
- subscription_expiry (timestamp with time zone)
- subscription_start_date (timestamp with time zone)
- subscription_period_days (integer: 30 or 365)
- is_banned (boolean)
- is_admin (boolean)
*/


// 7. DENO EDGE FUNCTION VERIFICATION
// ===================================
// Ensure your mpesa-payment function at services/supabase/functions/mpesa-payment/index.ts:
/*
✅ Has tier detection:
   if (amount === 1500) { tier = 'mkulima'; periodDays = 365; }
   if (amount === 3500) { tier = 'starter'; periodDays = 30; }
   if (amount === 5000) { tier = 'pro'; periodDays = 30; }
   if (amount === 9000) { tier = 'enterprise'; periodDays = 30; }

✅ Updates profile with:
   subscription_tier = tier
   subscription_start_date = now()
   subscription_expiry = now() + interval '${periodDays} days'
   subscription_period_days = periodDays

✅ Uses Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') for admin client
✅ Only accepts exact amounts: 1500, 3500, 5000, 9000
*/


// 8. TESTING CHECKLIST
// ====================
Key Tests Before Going Live:

□ Phone validation works (auto-formats 0712xxx to 254712xxx)
□ "Buy Now" button opens modal with correct tier/amount
□ Payment modal shows correct amount and period (365 for Mkulima, 30 for others)
□ M-Pesa STK prompt appears on phone
□ After successful payment, profile.subscription_tier updates
□ After successful payment, Dashboard shows active subscription
□ 3-day renewal window works (isSubscriptionExpiringSoon = daysRemaining <= 3)
□ "Renew Now" button appears when subscription expiring in <= 3 days
□ No commission logic anywhere (sellers keep 100%)
□ Green banner on PricingTable says "Sellers keep 100% of their sales — No Commissions!"
□ Mkulima tier shows green badge "🎁 SPECIAL OFFER"
□ Mkulima tier shows "✅ Safe & Supported"
□ Only amounts 1500/3500/5000/9000 are accepted; anything else defaults to Starter


// 9. TROUBLESHOOTING
// ===================
Issue: Modal opens but phone validation doesn't work
Fix: Ensure useSubscriptionPayment hook is imported correctly and supabase client is initialized

Issue: Payment fails with "Invalid amount"
Fix: Check mpesa-payment function - only 1500/3500/5000/9000 are valid

Issue: Profile doesn't update after payment
Fix: Check mpesa-payment function has access to SUPABASE_SERVICE_ROLE_KEY via Deno.env.get()

Issue: Wrong tier assigned after payment
Fix: Verify tier detection logic in mpesa-payment matches amounts exactly

Issue: "Renew Now" button not showing
Fix: Check Dashboard.tsx has daysRemaining <= 3 condition (not <= 1)


// 10. FILE STRUCTURE SUMMARY
// ===========================
components/
  ├─ PricingTable.tsx          (Display all 4 tiers)
  ├─ PricingPaymentModal.tsx   (Phone input + payment processing)
  ├─ PricingPage.tsx           (Integration page - combines both)
  └─ Dashboard.tsx             (Update to include "Renew Now" button)

hooks/
  └─ useSubscriptionPayment.ts (M-Pesa integration)

services/
  └─ supabase/
     └─ functions/
        └─ mpesa-payment/
           └─ index.ts         (Tier detection + profile update)

constants.ts
  └─ SUBSCRIPTION_PRICING      (4 tiers with amounts + features)


// 11. API ENDPOINT REFERENCE
// ===========================
M-Pesa Payment Function Call:
supabase.functions.invoke('mpesa-payment', {
  body: {
    phone: '254712345678',     // With 254 prefix
    amount: 3500,              // Only 1500/3500/5000/9000
    tier: 'starter',           // Optional - derived from amount
  }
})

Response:
{
  success: true,
  message: 'M-Pesa payment initiated',
  paymentId: 'uuid',
  orderId: 'uuid'
}


// 12. SUCCESS INDICATORS
// ======================
After integration, you should see:
✅ PricingPage accessible at /pricing
✅ All 4 tiers display with correct amounts and features
✅ Mkulima shows special green branding with "Safe & Supported" message
✅ "Sellers keep 100%—No Commissions!" banner on every tier
✅ Phone input auto-formats M-Pesa numbers
✅ Payment modal closes on success and refreshes profile
✅ Dashboard shows "Renew Now" button 3 days before expiry
✅ No commission system anywhere in codebase
✅ Company name "Offspring Decor Limited" visible on all pricing copy
