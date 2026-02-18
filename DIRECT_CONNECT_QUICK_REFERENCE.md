#!/usr/bin/env node

/**
 * OFFSPRING DECOR LIMITED - DIRECT-CONNECT MARKETPLACE
 * ===================================================
 * QUICK REFERENCE GUIDE
 * 
 * Copy this file. Keep it handy. Refer to it before making decisions.
 */

// ============================================
// RULE #1: NO ESCROW, NO REFUNDS, NO COMMISSIONS
// ============================================
console.log(`
╔═══════════════════════════════════════════════════════════════╗
║ CORE PHILOSOPHY                                               ║
║                                                               ║
║ We are a DIRECT-CONNECT MARKETPLACE (like Jiji/Alibaba)      ║
║                                                               ║
║ ❌ Do NOT suggest escrow systems                              ║
║ ❌ Do NOT suggest refund processing                           ║
║ ❌ Do NOT suggest commission from sales                       ║
║ ❌ Do NOT suggest payment holds                               ║
║                                                               ║
║ ✅ Buyers pay sellers directly (via M-Pesa/Cash)             ║
║ ✅ We earn from SUBSCRIPTIONS ONLY                            ║
║ ✅ We provide VERIFICATION for trust                          ║
║ ✅ We provide SAFETY TOOLS for protection                     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

// ============================================
// RULE #2: REVENUE IS SUBSCRIPTION ONLY
// ============================================
const REVENUE_MODEL = {
  type: 'SUBSCRIPTION-ONLY',
  tiers: {
    mkulima: {
      name: '🎁 Mkulima Mdogo',
      amount: '1,500 KES',
      period: '1 YEAR (365 days)',
      badge: '🏷️ Bronze',
      listings: '50 max',
      description: 'Safe & Supported for farmers',
      targetAudience: 'Small traders & farmers',
    },
    starter: {
      name: '🚀 Starter',
      amount: '3,500 KES',
      period: '1 MONTH (30 days)',
      badge: '🏷️ Silver',
      listings: '200 max',
      description: 'For growing businesses',
      targetAudience: 'Small businesses',
    },
    pro: {
      name: '⭐ Pro',
      amount: '5,000 KES',
      period: '1 MONTH (30 days)',
      badge: '🏷️ Gold',
      listings: 'Unlimited',
      description: 'For established sellers',
      targetAudience: 'Established sellers',
    },
    enterprise: {
      name: '👑 Enterprise',
      amount: '9,000 KES',
      period: '1 MONTH (30 days)',
      badge: '🏷️ Platinum',
      listings: 'Unlimited',
      description: 'For large-scale operations',
      targetAudience: 'Wholesalers & enterprises',
    },
  },
};

// ============================================
// RULE #3: VERIFICATION = TRUST
// ============================================
const VERIFICATION_SYSTEM = {
  documents: [
    '📄 National ID (Required)',
    '📄 Business Permit (Optional)',
    '📄 Tax Certificate (Optional)',
    '📄 Trade License (Optional)',
  ],
  processFlow: [
    '1️⃣  Seller uploads document during signup',
    '2️⃣  Admin reviews (24-48 hours)',
    '3️⃣  Approved = Badge assigned',
    '4️⃣  Rejected = Re-upload allowed',
    '5️⃣  Verified status displays on profile',
  ],
  badgeLogic: {
    'mkulima subscription': '🏷️ Bronze Badge',
    'starter subscription': '🏷️ Silver Badge',
    'pro subscription': '🏷️ Gold Badge',
    'enterprise subscription': '🏷️ Platinum Badge',
  },
  trustIndicators: [
    '✅ Verified badge (document approved)',
    '⭐ Star rating (buyer reviews)',
    '⏱️  Response time (how fast they reply)',
    '🟢 Active status (online now?)',
    '📍 Location (where they\'re based)',
  ],
};

// ============================================
// RULE #4: SAFETY TOOLS (NOT REFUNDS)
// ============================================
const SAFETY_TOOLS = {
  forBuyers: {
    'Report Seller Button': {
      location: 'On seller profile & listing',
      reasons: [
        'Fraud/Scam',
        'Fake product',
        'Bad condition',
        'Unsafe behavior',
        'Harassment',
        'Spam',
        'Prohibited items',
      ],
      timeline: 'Admin reviews within 24-48 hours',
      actions: [
        'Issue warning',
        'Remove listing',
        'Ban seller',
      ],
    },
  },
  forAdmins: {
    'Kill Switch (Ban Seller)': {
      triggers: [
        'Multiple fraud reports',
        'Prohibited items detected',
        'Unsafe behavior',
      ],
      action: 'INSTANT ACCOUNT BAN',
      whatHappens: [
        '🚫 All listings deleted immediately',
        '🚫 Cannot log in',
        '🚫 Cannot sell',
        '📋 Audit logged',
      ],
      appeal: 'Seller can appeal → Admin reviews',
    },
    'Partial Actions': [
      'Delete specific listing (prohibited item)',
      'Suspend for 30 days (pending investigation)',
      'Issue public warning on profile',
      'Require document re-verification',
    ],
  },
  notAViableOption: [
    '❌ NO refunds (money never touches us)',
    '❌ NO escrow (direct P2P)',
    '❌ NO chargeback processing',
    '❌ NO buyer insurance',
  ],
};

// ============================================
// RULE #5: DIRECTORY FEATURES
// ============================================
const DIRECTORY_FEATURES = {
  whatWeShow: {
    'Phone': '+254701234567',
    'WhatsApp': 'Click to open chat',
    'Map Location': 'Nairobi, Kenya',
    'Response Time': '⏱️  Responds in 30 mins',
    'Star Rating': '⭐ 4.8/5 (127 reviews)',
    'Subscript Tier': '🏷️ Gold Seller (Pro)',
    'Active Listings': '🟢 12 listings | Last active 2 hours ago',
  },
  howBuyersUsIt: [
    '1️⃣  Browse marketplace or search',
    '2️⃣  See seller card with all info',
    '3️⃣  Click "Contact Seller"',
    '4️⃣  Choose: Phone call OR WhatsApp',
    '5️⃣  Negotiate DIRECTLY with seller',
    '6️⃣  Buyer pays seller DIRECTLY',
  ],
  mapFeatures: [
    '📍 Show all sellers in area/category',
    '📍 Filter by badge, rating, response time',
    '📍 "Nearby sellers" feature',
  ],
};

// ============================================
// DATABASE SCHEMA QUICK MAP
// ============================================
const SCHEMA_MAP = {
  profiles: {
    coreFields: [
      'user_id',
      'email',
      'full_name',
      'avatar_url',
    ],
    subscriptionFields: [
      'subscription_tier (mkulima|starter|pro|enterprise)',
      'subscription_badge (bronze|silver|gold|platinum) ← AUTO-GENERATED',
      'subscription_expiry (timestamp)',
      'subscription_start_date (timestamp)',
      'subscription_period_days (30 or 365)',
    ],
    directConnectFields: [
      'phone_number',
      'whatsapp_number',
      'business_name',
      'business_category',
      'business_description',
      'latitude/longitude',
      'city, county',
    ],
    trustFields: [
      'is_verified (boolean)',
      'verified_documents_count',
      'average_rating (0-5)',
      'total_ratings_count',
    ],
    safetyFields: [
      'is_banned (boolean)',
      'ban_reason',
      'ban_date',
    ],
  },
  seller_verification_documents: [
    'id, seller_id, document_type, document_url',
    'status (pending|approved|rejected|expired)',
    'reviewed_by_admin, reviewed_at',
  ],
  seller_reports: [
    'id, reported_seller_id, reported_by_user_id',
    'reason, description, evidence_urls[]',
    'status (open|investigating|resolved|dismissed)',
    'action_taken (warning|listing_removed|seller_banned)',
  ],
  admin_actions: [
    'id, admin_id, action_type',
    'target_type (seller|listing|report)',
    'reason, details, created_at',
  ],
  seller_directory: [
    'seller_id, subscription_tier, subscription_badge',
    'business_name, category, phone, whatsapp',
    'latitude, longitude, city, county',
    'is_verified, is_banned, average_rating, active_listings',
  ],
};

// ============================================
// PAYMENT FLOW (STRICTLY DIRECT P2P)
// ============================================
const PAYMENT_FLOW = {
  step1: {
    description: 'Buyer sees seller on Pambo',
    pamboRole: 'Display seller info',
  },
  step2: {
    description: 'Buyer clicks "Contact Seller"',
    pamboRole: 'Open WhatsApp/Phone',
  },
  step3: {
    description: 'Buyer & seller negotiate OUTSIDE Pambo',
    pamboRole: 'NONE - they use direct channels',
  },
  step4: {
    description: 'Buyer pays seller directly',
    paymentMethods: [
      'M-Pesa (254XXXXXXXXX to 254XXXXXXXXX)',
      'Cash (in-person meeting)',
      'Bank transfer (for B2B)',
    ],
    pamboRole: 'NONE - money never touches us',
  },
  step5: {
    description: 'Seller delivers/ships item',
    pamboRole: 'NOT INVOLVED - seller responsibility',
  },
  step6: {
    description: 'Dispute? Use "Report Seller"',
    pamboRole: 'Admin reviews, may ban seller',
    notes: 'NO REFUNDS - buyer disputes with seller directly',
  },
  pamboRevenue: {
    description: 'Pambo earns from seller subscription',
    notFrom: 'NOT from transaction amounts',
  },
};

// ============================================
// HOW TO CODE FOR THIS MODEL
// ============================================
const CODING_PRINCIPLES = {
  payments: {
    do: [
      'Record subscription payments only',
      'Store seller/buyer contact requests',
      'Track seller verification status',
      'Log all admin actions',
    ],
    dont: [
      '❌ Process refunds',
      '❌ Hold buyer money',
      '❌ Calculate commissions from sales',
      '❌ Generate invoices',
      '❌ Track product delivery status',
    ],
  },
  database: {
    do: [
      'Store verification documents',
      'Track seller reports',
      'Log admin bans/unbans',
      'Denormalize directory for fast lookups',
    ],
    dont: [
      '❌ Create escrow tables',
      '❌ Create dispute resolution flows',
      '❌ Create commission calculation tables',
      '❌ Create refund transaction tables',
    ],
  },
  ui: {
    do: [
      'Show seller verification badge',
      'Show star rating',
      'Show "Contact Seller" button',
      'Show "Report Seller" button',
      'Show phone/WhatsApp',
    ],
    dont: [
      '❌ Show refund status',
      '❌ Show escrow hold countdown',
      '❌ Show commission breakdown',
      '❌ Show payment settlement date',
    ],
  },
};

// ============================================
// DECISION TREE
// ============================================
const DECISION_TREE = {
  question: 'A feature request came in. Should we build it?',
  flowchart: `
User Request
    ↓
Does it involve holding buyer's money?
    ├─ YES → ❌ REJECT (escrow not allowed)
    └─ NO → ↓
         
Does it involve refunds/disputes?
    ├─ YES → ❌ REJECT (buyer/seller solve directly)
    └─ NO → ↓
         
Does it involve commissions from sales?
    ├─ YES → ❌ REJECT (subscription model only)
    └─ NO → ↓
         
Does it help with seller verification/trust?
    ├─ YES → ✅ BUILD (safety first)
    └─ NO → ↓
         
Does it help direct buyer-seller connection?
    ├─ YES → ✅ BUILD (enable commerce)
    └─ NO → ↓
         
Does it help identify/punish fraudsters?
    ├─ YES → ✅ BUILD (safety tools)
    └─ NO → ↓
         
Is it a core marketplace feature (listings, search, etc)?
    ├─ YES → ✅ BUILD (need it)
    └─ NO → ❓ MAYBE (low priority)
  `,
};

// ============================================
// QUICK CHECKLIST FOR DEVELOPERS
// ============================================
const DEV_CHECKLIST = {
  beforeWritingCode: [
    '[ ] Is this feature about payments? → If yes, it\'s subscription-only',
    '[ ] Does it involve holding money? → If yes, STOP and ask',
    '[ ] Does it involve commissions? → If yes, DELETE that logic',
    '[ ] Does it involve refunds? → If yes, RECONSIDER the approach',
  ],
  directConnectFeatures: [
    '✅ Phone display',
    '✅ WhatsApp integration',
    '✅ Location map',
    '✅ Seller badge/verification',
    '✅ Star rating',
    '✅ Response time tracker',
    '✅ Contact request form',
    '✅ Report seller button',
  ],
  notOurRespibility: [
    '❌ Payment processing (M-Pesa handles it)',
    '❌ Dispute resolution (they sort directly)',
    '❌ Shipping/delivery (seller responsibility)',
    '❌ Returns (seller decides)',
    '❌ Invoice generation (seller generates own)',
  ],
};

// ============================================
// TESTING: VERIFY IT WORKS
// ============================================
const TESTING_GUIDE = {
  subscriptionPayment: [
    '1. Go to /pricing',
    '2. Click "Buy Now" on Starter (3,500 KES)',
    '3. Enter phone: 0712345678',
    '4. M-Pesa STK should appear',
    '5. Complete on phone',
    '6. DB check: profiles.subscription_tier = "starter"',
    '7. Dashboard should show "Renew in 30 days"',
  ],
  sellerVerification: [
    '1. Go to /settings/documents',
    '2. Upload national ID photo',
    '3. As admin, go to /admin and approve',
    '4. Seller\'s profile should show "✅ Verified"',
    '5. Listing should show seller badge',
  ],
  reportSeller: [
    '1. Go to seller profile',
    '2. Click "Report Seller"',
    '3. Choose reason: "Fraud"',
    '4. Add description + screenshot',
    '5. Submit',
    '6. Admin should see report in queue',
    '7. Admin clicks "Ban Seller"',
    '8. Seller\'s listings should disappear',
  ],
  directContact: [
    '1. View listing',
    '2. Click "Contact Seller"',
    '3. See WhatsApp option',
    '4. Click WhatsApp → Opens WhatsApp with message',
    '5. Buyer and seller message directly',
    '6. Payment happens externally',
    '7. No Pambo involvement after contact',
  ],
};

// ============================================
// FINAL CHECKLIST
// ============================================
console.log(`
╔═══════════════════════════════════════════════════════════════╗
║ REMEMBER: DIRECT-CONNECT MARKETPLACE RULES                   ║
║                                                               ║
║ ✅ Subscription revenue (1,500/3,500/5,000/9,000 KES)        ║
║ ✅ NO escrow, NO refunds, NO commissions                     ║
║ ✅ Seller verification = TRUST                               ║
║ ✅ Phone/WhatsApp/Map = DIRECT CONTACT                       ║
║ ✅ Reports + Ban = SAFETY TOOLS                              ║
║                                                               ║
║ ❌ Stop building escrow features                              ║
║ ❌ Stop suggestion refund systems                             ║
║ ❌ Stop calculating commissions                               ║
║ ❌ Stop building payment settlement                           ║
║                                                               ║
║ Ask yourself: "Does this help buyers find & verify sellers?" ║
║ If YES → Build it                                            ║
║ If NO → Skip it                                              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

export { REVENUE_MODEL, VERIFICATION_SYSTEM, SAFETY_TOOLS, DIRECTORY_FEATURES };
