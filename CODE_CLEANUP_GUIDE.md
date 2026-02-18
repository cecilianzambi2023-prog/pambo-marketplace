#!/usr/bin/env node

/**
 * 🗑️  CODE CLEANUP GUIDE: DELETE OLD ESCROW/REFUND/COMMISSION LOGIC
 * ==================================================================
 * 
 * Since we're pivoting to Direct-Connect Marketplace (NO escrow, NO refunds, NO commissions),
 * you need to DELETE any code related to these systems.
 * 
 * This guide helps you identify what to remove.
 */

// ============================================
// STEP 1: IDENTIFY FILES TO DELETE
// ============================================

const PACKAGES_TO_DELETE = {
  npm_packages: [
    // Only delete if NOT used elsewhere
    '❓ stripe (if you were using Stripe for escrow)',
    '❓ razorpay (if using for payment holds)',
    '❓ paystack (if using for refunds)',
    '❓ payment-dispute-sdk (any library for disputes)',
  ],
  notes: 'Check package.json and node_modules',
};

const COMPONENTS_TO_DELETE = [
  'components/EscrowPaymentFlow.tsx (if exists)',
  'components/DisputeWindow.tsx (if exists)',
  'components/RefundStatus.tsx (if exists)',
  'components/CommissionBreakdown.tsx (if exists)',
  'components/PaymentHold.tsx (if exists)',
  'components/SettlementStatus.tsx (if exists)',
  'Any component with "escrow", "refund", "dispute", "commission" in name',
];

// ============================================
// STEP 2: IDENTIFY FUNCTIONS TO DELETE
// ============================================

const FUNCTIONS_TO_DELETE = {
  payments: [
    'processRefund()',
    'initiateDisputeResolution()',
    'createEscrowAccount()',
    'releaseEscrowFunds()',
    'holdBuyerPayment()',
    'processCashoutFromEscrow()',
    'calculateSellerPayableAmount()',
  ],
  subscriptions: [
    'trackCommission()',  // Already tried to delete in previous work
    'calculateCommission()',
    'deductCommissionFromSale()',
    'getCommissionBreakdown()',
    'getTotalRevenueWithCommission()',
  ],
  orders: [
    'holdPaymentUntilConfirmation()',
    'lockFundsForDispute()',
    'processOrderRefund()',
    'syncRefundStatus()',
    'checkEscrowReleaseDate()',
  ],
};

// ============================================
// STEP 3: IDENTIFY DB TABLES TO DELETE
// ============================================

const TABLES_TO_DELETE = [
  'escrow_accounts (entire table)',
  'refund_requests (entire table)',
  'disputes (entire table)',
  'dispute_resolutions (entire table)',
  'payment_holds (entire table)',
  'commission_records (entire table)',
  'seller_payouts (entire table - replaced by subscriptions)',
];

const COLUMNS_TO_DELETE = [
  'orders.escrow_id (foreign key)',
  'orders.dispute_status',
  'orders.holds_until (refund window)',
  'orders.refund_requested_at',
  'orders.dispute_opened_at',
  'payments.commission_amount',
  'payments.fee',
  'payments.is_held',
  'payments.hold_until_date',
  'profiles.commission_account',
  'profiles.payout_status',
  'profiles.pending_payout',
  'Any column related to "escrow", "refund", "dispute", "hold"',
];

// ============================================
// STEP 4: IDENTIFY API ROUTES TO DELETE
// ============================================

const API_ROUTES_TO_DELETE = [
  'POST /api/orders/:id/refund',
  'GET /api/orders/:id/refund-status',
  'POST /api/disputes/open',
  'POST /api/disputes/:id/resolve',
  'POST /api/disputes/:id/evidence',
  'GET /api/disputes/me',
  'POST /api/escrow/:id/release',
  'GET /api/escrow/:id/status',
  'POST /api/commission/calculate',
  'GET /api/seller/payouts',
  'POST /api/seller/request-payout',
];

const API_ROUTES_TO_KEEP = [
  'POST /mpesa-payment (✅ subscription payments)',
  'GET /seller/:id (✅ seller info)',
  'GET /listings (✅ product listings)',
  'POST /contact-seller (✅ direct contact)',
  'POST /report-seller (✅ safety)',
];

// ============================================
// STEP 5: IDENTIFY EDGE FUNCTIONS TO DELETE
// ============================================

const EDGE_FUNCTIONS_TO_DELETE = [
  'supabase/functions/process-refund.ts (if exists)',
  'supabase/functions/handle-dispute.ts (if exists)',
  'supabase/functions/release-escrow.ts (if exists)',
  'supabase/functions/calculate-commission.ts (if exists)',
  'supabase/functions/initiate-payout.ts (if exists)',
  'services/supabase/functions/escrow-payment/ (entire folder)',
  'services/supabase/functions/refund-handler/ (entire folder)',
  'services/supabase/functions/dispute-resolution/ (entire folder)',
];

const EDGE_FUNCTIONS_TO_KEEP = [
  'services/supabase/functions/mpesa-payment/ (✅ subscription)',
  'services/supabase/functions/verify-seller-document/ (to build - Phase 1)',
];

// ============================================
// STEP 6: SEARCH FOR HARDCODED VALUES TO DELETE
// ============================================

const SEARCH_PATTERNS = {
  // Search your codebase for these patterns
  toDelete: [
    'escrow', 'ESCROW',
    'refund', 'REFUND',
    'dispute', 'DISPUTE',
    'commission', 'COMMISSION', '0.05', '5%',
    'payout', 'PAYOUT',
    'hold', 'HOLD',
    'escrowAccount', 'escrowId',
    'disputeStatus', 'refundWindow',
    'commissionAmount', 'commissionRate',
  ],
  commands: [
    'grep -r "escrow" --include="*.ts" --include="*.tsx"',
    'grep -r "refund" --include="*.ts" --include="*.tsx"',
    'grep -r "dispute" --include="*.ts" --include="*.tsx"',
    'grep -r "commission" --include="*.ts" --include="*.tsx"',
    'grep -r "0.05" --include="*.ts" --include="*.tsx"',
    'grep -r "5%" --include="*.ts" --include="*.tsx"',
    'grep -r "payout" --include="*.ts" --include="*.tsx"',
  ],
};

// ============================================
// STEP 7: CLEANUP CHECKLIST
// ============================================

const CLEANUP_CHECKLIST = [
  // Components
  '[ ] Delete EscrowPaymentFlow.tsx',
  '[ ] Delete DisputeWindow.tsx',
  '[ ] Delete RefundStatus.tsx',
  '[ ] Delete CommissionBreakdown.tsx',
  '[ ] Delete PaymentHold.tsx',
  '[ ] Delete SettlementStatus.tsx',
  
  // Services
  '[ ] Delete escrowService.ts',
  '[ ] Delete refundService.ts',
  '[ ] Delete disputeService.ts',
  '[ ] Delete commissionService.ts',
  '[ ] Delete payoutService.ts',
  
  // Edge Functions
  '[ ] Delete services/supabase/functions/escrow-payment/',
  '[ ] Delete services/supabase/functions/refund-handler/',
  '[ ] Delete services/supabase/functions/dispute-resolution/',
  
  // Database
  '[ ] Create migration to drop old tables (escrow_accounts, refunds, disputes, etc)',
  '[ ] Run migration: supabase migration up',
  
  // Code Cleanup
  '[ ] Remove all imports of deleted components/services',
  '[ ] Delete function calls to refund/escrow/dispute/commission functions',
  '[ ] Delete commission percentage constants (0.05, 5%, etc)',
  '[ ] Delete payment hold logic',
  
  // Testing
  '[ ] Remove tests for escrow/refund/dispute/commission',
  '[ ] Update API documentation',
  
  // Environment Variables
  '[ ] Remove any STRIPE_KEY, RAZORPAY_KEY, etc (if added for escrow)',
];

// ============================================
// STEP 8: SAFE DELETION PROCESS
// ============================================

const SAFE_DELETION_STEPS = `
1. GIT BACKUP
   git checkout -b cleanup/remove-escrow-refund-commission
   (Create a branch first!)

2. IDENTIFY
   grep -r "escrow\|refund\|dispute\|commission\|payout\|hold" src/ --include="*.ts" --include="*.tsx"
   (List all occurrences)

3. DELETE COMPONENTS
   rm src/components/EscrowPaymentFlow.tsx
   rm src/components/DisputeWindow.tsx
   etc.

4. DELETE SERVICES
   rm src/services/escrowService.ts
   rm src/services/refundService.ts
   etc.

5. DELETE FUNCTIONS
   rm services/supabase/functions/escrow-payment/ -r
   rm services/supabase/functions/refund-handler/ -r
   etc.

6. FIX IMPORTS
   Find all files with import statements to deleted files
   Delete or comment out those imports

7. DELETE DATABASE TABLES (Careful!)
   Create new migration file:
   supabase migration new drop_old_escrow_tables
   
   Add SQL:
   DROP TABLE IF EXISTS escrow_accounts;
   DROP TABLE IF EXISTS refund_requests;
   DROP TABLE IF EXISTS disputes;
   DROP TABLE IF EXISTS dispute_resolutions;
   DROP TABLE IF EXISTS payment_holds;
   DROP TABLE IF EXISTS commission_records;
   DROP TABLE IF EXISTS seller_payouts;

8. RUN MIGRATION
   supabase migration up

9. TEST
   npm run dev
   Check for errors
   Test subscription payment flow

10. GIT COMMIT
    git add .
    git commit -m "refactor: Remove escrow/refund/commission system (Direct-Connect model)"
    git push origin cleanup/remove-escrow-refund-commission
    Create PR for review

11. MERGE
    Get code review
    Merge to main
`;

// ============================================
// STEP 9: WHAT STAYS (DIRECT-CONNECT ONLY)
// ============================================

const WHAT_STAYS = {
  components: [
    'PricingTable.tsx (✅)',
    'PricingPaymentModal.tsx (✅)',
    'PricingPage.tsx (✅)',
    'Dashboard.tsx (✅)',
    'SellerProfileCard.tsx (new - Phase 1)',
    'SellerVerificationUploadForm.tsx (new - Phase 1)',
    'AdminVerificationDashboard.tsx (new - Phase 1)',
    'ReportSellerModal.tsx (new - Phase 3)',
  ],
  services: [
    'subscriptionService.ts (✅)',
    'authService.ts (✅)',
    'listingsService.ts (✅)',
    'supabaseClient.ts (✅)',
  ],
  functions: [
    'services/supabase/functions/mpesa-payment/ (✅)',
    'services/supabase/functions/verify-seller-document/ (new - Phase 1)',
    'services/supabase/functions/report-seller/ (new - Phase 3)',
    'services/supabase/functions/ban-seller/ (new - Phase 3)',
  ],
  database: [
    'profiles (✅)',
    'listings (✅)',
    'payments (✅)',
    'transactions (✅)',
    'seller_verification_documents (✅)',
    'seller_reports (✅)',
    'admin_actions (✅)',
    'seller_directory (✅)',
  ],
};

// ============================================
// STEP 10: VERIFY DELETION
// ============================================

const VERIFICATION_TESTS = [
  '1. npm run build',
  '   ↓ Should compile without errors',
  '',
  '2. npm run dev',
  '   ↓ Should start dev server',
  '',
  '3. Test /pricing page',
  '   ↓ Should show PricingTable',
  '',
  '4. Test payment flow',
  '   ↓ Should work through mpesa-payment function',
  '',
  '5. Check database',
  '   SELECT * FROM information_schema.tables WHERE table_schema = \'public\'',
  '   ↓ Old escrow/refund tables should be gone',
  '',
  '6. Search codebase',
  '   grep -r "escrow\\|refund\\|dispute\\|commission\\|payout" src/',
  '   ↓ Should return NOTHING (or only in comments/documentation)',
];

// ============================================
// IMPORTANT NOTES
// ============================================

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║ ⚠️  CLEANUP WARNING                                           ║
║                                                               ║
║ This is a MAJOR refactor. Follow these rules:                ║
║                                                               ║
║ 1. CREATE A BRANCH FIRST                                      ║
║    git checkout -b cleanup/remove-old-systems                ║
║                                                               ║
║ 2. COMMIT FREQUENTLY                                          ║
║    Each deleted component = 1 commit                          ║
║                                                               ║
║ 3. TEST AFTER EACH SECTION                                    ║
║    npm run build && npm run dev                               ║
║                                                               ║
║ 4. GET CODE REVIEW                                            ║
║    Don't merge to main without review                         ║
║                                                               ║
║ 5. BACKUP DATABASE                                            ║
║    supabase db export backup.sql                              ║
║    Before running migration                                   ║
║                                                               ║
║ 6. HAVE ROLLBACK PLAN                                         ║
║    Know how to restore if something breaks                    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

// ============================================
// EXAMPLE: WHAT GETS DELETED
// ============================================

const EXAMPLE_FUNCTION_TO_DELETE = `
// ❌ DELETE THIS ENTIRE FILE: src/services/commissionService.ts

export function trackCommission(orderAmount: number): number {
  return orderAmount * 0.05; // 5% commission
}

export function calculateSellerPayment(orderAmount: number): number {
  const commission = trackCommission(orderAmount);
  return orderAmount - commission;
}

export function getTotalRevenue(orders: Order[]): {
  totalSales: number;
  totalCommission: number;
  sellerPayable: number;
} {
  // ... complex calculation
}
`;

const EXAMPLE_WHAT_STAYS = `
// ✅ KEEP: src/services/subscriptionService.ts

export function getSubscriptionPrice(tier: SubscriptionTier): number {
  const prices = {
    mkulima: 1500,    // Per YEAR
    starter: 3500,    // Per MONTH
    pro: 5000,        // Per MONTH
    enterprise: 9000, // Per MONTH
  };
  return prices[tier];
}

export function calculateSubscriptionExpiry(tier: SubscriptionTier): Date {
  const days = tier === 'mkulima' ? 365 : 30;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
}
`;

console.log('Example function to delete:');
console.log(EXAMPLE_FUNCTION_TO_DELETE);
console.log('\nExample function to keep:');
console.log(EXAMPLE_WHAT_STAYS);

// ============================================
// GIT COMMANDS FOR CLEANUP
// ============================================

const GIT_COMMANDS = `
# 1. Start a new cleanup branch
git checkout main
git pull origin main
git checkout -b cleanup/remove-escrow-refund-commission

# 2. Find all files to delete
grep -r "escrow\\|refund\\|dispute\\|commission\\|payout" src/ --include="*.ts" --include="*.tsx" | cut -d: -f1 | sort -u

# 3. Delete components (example)
git rm src/components/EscrowPaymentFlow.tsx
git commit -m "remove: Delete EscrowPaymentFlow component (no longer needed)"

git rm src/components/DisputeWindow.tsx
git commit -m "remove: Delete DisputeWindow component (Direct-Connect model)"

# 4. Delete services (example)
git rm src/services/commissionService.ts
git commit -m "remove: Delete commissionService (subscription-only model)"

# 5. Delete Deno functions (example)
git rm -r services/supabase/functions/escrow-payment
git commit -m "remove: Delete escrow-payment Edge Function"

# 6. Create database migration
supabase migration new drop_old_payment_tables

# 7. Edit the migration file with DROP TABLE statements

# 8. Apply migration
supabase migration up

# 9. Test
npm run build
npm run dev

# 10. Create PR
git push origin cleanup/remove-escrow-refund-commission

# 11. Get review, then merge
`;

export { CLEANUP_CHECKLIST, SAFE_DELETION_STEPS, WHAT_STAYS, VERIFICATION_TESTS };
