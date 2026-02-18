# OFFSPRING DECOR LIMITED - DIRECT-CONNECT MARKETPLACE ROADMAP
## Pambo.com: A Jiji/Alibaba-Style Platform for African Traders

**Last Updated:** February 2026  
**Platform:** React 18 + TypeScript + Supabase + Deno Edge Functions  
**Business Model:** Subscription-Only (NO escrow, NO refunds, NO commissions)  
**Core Architecture:** Direct-Connect Marketplace (Buyer ↔ Seller)

---

## 🎯 CORE RULES (NON-NEGOTIABLE)

### ❌ WHAT WE DON'T DO
- **NO ESCROW SYSTEM** - We do not hold buyer's money
- **NO REFUND PROCESSING** - Money goes directly from buyer to seller
- **NO COMMISSION SYSTEM** - Sellers keep 100% of their sales
- **NO PAYMENT SETTLEMENT** - No waiting periods, no holds, no disputes
- **NO CASHBACK/DISCOUNTS** - Simple subscription model only

### ✅ WHAT WE DO
- **SUBSCRIPTIONS ONLY** - Revenue from seller subscription tiers
- **DIRECT CONNECT** - Buyers contact sellers directly via Phone/WhatsApp
- **VERIFICATION = TRUST** - ID/permit uploads + seller badges
- **SAFETY TOOLS** - Report sellers + Admin kill switch for bans
- **DIRECTORY FEATURES** - Phone, WhatsApp, Map location for easy discovery

---

## 💰 REVENUE MODEL (SUBSCRIPTION ONLY)

### Tier Structure
```
Mkulima MDogo:   1,500 KES/YEAR   → 365 days → Bronze Badge
Starter:         3,500 KES/Month  → 30 days  → Silver Badge
Pro:             5,000 KES/Month  → 30 days  → Gold Badge
Enterprise:      9,000 KES/Month  → 30 days  → Platinum Badge
```

### What Each Tier Gets
| Feature | Mkulima | Starter | Pro | Enterprise |
|---------|---------|---------|-----|------------|
| Product listings | 50 | 200 | Unlimited | Unlimited |
| Seller profile | Basic | Enhanced | Premium | Dedicated Mgr |
| Buyer contact access | ✓ | ✓ | ✓ | ✓ |
| Seller badge | Bronze | Silver | Gold | Platinum |
| Phone display | ✓ | ✓ | ✓ | ✓ |
| WhatsApp display | ✓ | ✓ | ✓ | ✓ |
| Map location | ✓ | ✓ | ✓ | ✓ |
| Support | Community | Email | Priority | Dedicated |
| **Price/Month** | **125** | **3,500** | **5,000** | **9,000** |

### Payment Flow (Direct Connect)
```
1. Buyer navigates to seller's listing on Pambo
2. Buyer clicks "Contact Seller" → Phone + WhatsApp options
3. Buyer & seller negotiate DIRECTLY (not on Pambo)
4. Buyer pays seller DIRECTLY via:
   - M-Pesa (phone-to-phone)
   - Cash (in-person)
   - Bank transfer (for B2B)
5. Pambo earns: Seller's subscription fee (not involved in transaction)
6. Dispute? → Use "Report Seller" tool → Admin reviews
```

---

## 🏷️ VERIFICATION & TRUST SYSTEM

### Why Verification Matters
Since we don't hold money/process payments, **seller trust is everything**. We verify sellers with:

### What Sellers Upload (On Signup)
1. **National ID** (Required) - Person identification
2. **Business Permit** (Optional) - For businesses
3. **Tax Certificate** (Optional) - For tax compliance
4. **Trade License** (Optional) - For specific trades

### Verification Status Indicators
- ✅ **Verified** - At least 1 document approved
- ⏳ **Pending** - Documents under review (admin reviews daily)
- ❌ **Unverified** - No documents submitted
- 🚫 **Document Expired** - Certificate/permit expired (auto-flagged)

### Badge Assignment (Automatic, Based on Subscription)
```
Subscription Tier    ↓    Badge Type    ↓    Display
Mkulima           →    Bronze         →    "🏷️ Bronze Seller (Mkulima Mdogo)"
Starter           →    Silver         →    "🏷️ Silver Seller (Starter)"
Pro               →    Gold           →    "🏷️ Gold Seller (Pro)"
Enterprise        →    Platinum       →    "🏷️ Platinum Seller (Enterprise)"
```

### Trust Indicators (On Seller Card)
```
┌─────────────────────────────────────┐
│ John Trader - Mkulima Mdogo         │
│ 🏷️ Bronze Seller ✅ Verified        │
│                                     │
│ Category: Wholesale Vegetables      │
│ ⭐ 4.8/5 (127 ratings)              │
│ 📍 Nairobi, Kenya                   │
│ 📱 +254701234567                    │
│ 💬 WhatsApp                         │
│ ⏱️ Responds in <1 hour              │
│                                     │
│ 🟢 ACTIVELY SELLING (12 listings)   │
│ Last active: 2 hours ago            │
└─────────────────────────────────────┘
```

---

## 🛡️ SAFETY TOOLS (NOT REFUNDS)

### For Buyers
1. **Report Seller Button**
   - Where: On seller profile & listing
   - Why: Flag fraud, fake products, bad condition, unsafe behavior, etc.
   - Result: Admin investigates within 24-48 hours
   - Action: Warning, listing removal, or full account ban

2. **Buyer Protection**
   - Read verified badges before buying
   - Check response time & ratings
   - Direct contact with seller (no middleman)
   - Screenshot evidence for disputes

### For Admins (Kill Switch)
1. **Ban Sellers** (Instant Account Kill)
   - All listings deleted immediately
   - Cannot log in
   - Cannot sell
   - Payment: No refunds to buyers (buyer dispute with seller directly)
   - Audit trail: All actions logged

2. **Partial Actions**
   - Delete specific listing (if prohibited item)
   - Suspend for 30 days (pending investigation)
   - Issue public warning (appears on profile)
   - Require document re-verification

3. **Unban Process**
   - Seller can appeal
   - Admin reviews case
   - If approved: Account reinstated, can reactivate
   - Audit logged (who unbanned, when, why)

### Reporting Flow
```
Buyer Reports Seller
       ↓
Admin Reviews Report (24-48h)
       ↓
   ┌─────────────────────┐
   │ Decision            │
   └─────────────────────┘
        ↙      ↓      ↘
   Approved  Pending   Denied
      ↓         ↓        ↓
   Ban      Investigate  Close
  Seller     More Info   Report
```

---

## 📱 DIRECTORY FEATURES (Direct Connect)

### Seller Directory Components
1. **Phone Display**
   - Public phone number (seller chooses to show)
   - One-click call button on mobile
   - Copy-to-clipboard on desktop

2. **WhatsApp Direct Link**
   - Instant WhatsApp chat button
   - Pre-filled message: "Hi, interested in your product"
   - Seller can set auto-reply

3. **Map Integration**
   - Shows seller's location (city/county level initially)
   - Specific address (if they provide)
   - "Find Nearby Sellers" feature
   - Map view of all sellers in a category/area

4. **Response Time**
   - AI tracks: How long seller takes to reply to contact
   - Displays: "⏱️ Responds in <1 hour" or "Responds in 2-4 hours"
   - Incentivizes sellers to reply fast

### How Buyers Find Sellers
```
SEARCH                CATEGORY          LOCATION
 ↓                        ↓                 ↓
 Keyword         →    Wholesale      →   Nairobi
 (e.g. "Tomato")      Electronics        County
      ↓                    ↓                 ↓
      
  Results Page (5 Sellers Shown)
  ┌─────────────────────────────────┐
  │ 1. John Farmer - Mkulima Bronze ✅│
  │    Location: Limuru, Kiambu      │
  │    📱 +254701234567              │
  │    💬 WhatsApp                   │
  │    ⏱️ Responds in 30 mins         │
  │    ⭐ 4.9/5 (203 ratings)        │
  │    🟢 5 listings                 │
  └─────────────────────────────────┘
```

---

## 🗺️ PRODUCT ROADMAP (PHASED APPROACH)

### PHASE 0: CORE FOUNDATION (✅ COMPLETED)
- ✅ PricingTable component (4 tiers)
- ✅ PricingPaymentModal (M-Pesa integration)
- ✅ useSubscriptionPayment hook
- ✅ mpesa-payment Deno function
- ✅ Subscription tier assignment
- ✅ 3-day renewal window
- ✅ TypeScript types (DirectConnectMarketplace.ts)

### PHASE 1: VERIFICATION & BADGES (PRIORITY 1)
**Timeline:** 2-3 weeks  
**Why:** Foundation for trust

**Components to Build:**
- [ ] Seller ID verification upload form
- [ ] Document upload UI (dropzone)
- [ ] Admin verification dashboard
- [ ] Auto-calculate subscription badge
- [ ] Display badge on seller profile

**Database:**
- ✅ seller_verification_documents table
- ✅ banned_sellers table
- ✅ RLS policies for admins

**Features:**
- [ ] Sellers upload documents on signup/settings
- [ ] Admin reviews (approve/reject) with notes
- [ ] Auto-verification for trusted users
- [ ] Notification when document approved/rejected
- [ ] Re-upload expired documents

**Success Metrics:**
- 80%+ of active sellers verified
- Average review time < 2 hours
- 0 false rejections (quality)

---

### PHASE 2: DIRECTORY & DIRECT CONTACT (PRIORITY 2)
**Timeline:** 3-4 weeks  
**Why:** Enable actual commerce

**Components to Build:**
- [ ] Seller directory page (/directory)
- [ ] Seller profile card (phone, location, badge, rating)
- [ ] Contact seller form (WhatsApp/Phone/Email)
- [ ] Map view (show sellers in area)
- [ ] Response time tracker (AI)

**Database:**
- ✅ seller_directory table (denormalized)
- ✅ buyer_contact_requests table
- ✅ Triggers to auto-update directory

**Features:**
- [ ] "Contact Seller" modal on listing
- [ ] Auto format: "message_template" for WhatsApp
- [ ] Track contact request (for analytics)
- [ ] Seller notification: "New contact from buyer"
- [ ] WhatsApp pre-fill: "Hi, interested in [product name]"

**Success Metrics:**
- 100+ contact requests/day
- 70%+ response rate within 2 hours
- 4.2+ average response time rating

---

### PHASE 3: REPORTING & SAFETY TOOLS (PRIORITY 3)
**Timeline:** 2 weeks  
**Why:** Protect buyers (trust!)

**Components to Build:**
- [ ] Report seller modal
- [ ] Admin report dashboard
- [ ] Auto-ban functionality
- [ ] Appeal process form
- [ ] Audit log viewer (admin only)

**Database:**
- ✅ seller_reports table
- ✅ admin_actions table
- ✅ Functions for ban/unban

**Features:**
- [ ] Report options: Fraud, Fake product, Bad condition, Unsafe, Spam, Prohibited items
- [ ] Evidence upload (screenshots)
- [ ] Admin review queue (priority by report_count)
- [ ] One-click ban (Admin Dashboard)
- [ ] Auto-delete all listings when banned
- [ ] Ban appeal form → Admin decision

**Reporting Reasons (with weights):**
- 🔴 **CRITICAL** (Auto-ban on 2 reports):
  - Fraud / Prohibited items
  - Multiple identity theft reports
  
- 🟠 **HIGH** (Ban on 5+ reports):
  - Fake products
  - Unsafe behavior / Harassment
  
- 🟡 **MEDIUM** (Warning, then ban):
  - Bad condition
  - Spam / Spammy behavior

**Success Metrics:**
- 95%+ of reports resolved within 48 hours
- 0 wrongful bans (high appeal rate = audit required)
- 99%+ false positive detection rate

---

### PHASE 4: ANALYTICS & INSIGHTS (PRIORITY 4)
**Timeline:** 3 weeks  
**Why:** Business intelligence

**Components to Build:**
- [ ] Seller analytics dashboard
- [ ] Sales metrics (orders, revenue, tier)
- [ ] Engagement (views, contacts, response time)
- [ ] Trust score (ratings, bans, reports)
- [ ] Admin analytics (platform health)

**Database:**
- ✅ seller_analytics table
- ✅ Views for easy querying

**Features:**
- [ ] Daily snapshot: views, contacts, orders, revenue
- [ ] Trend graphs: Last 30 days
- [ ] Heatmap: When do buyers contact you?
- [ ] Seller tier upgrade recommendation
- [ ] Platform health dashboard (admins only)

**Success Metrics:**
- 80%+ sellers check analytics weekly
- Analytics influence 30% of tier upgrades
- Admin can identify problem areas in < 2 minutes

---

### PHASE 5: LISTINGS & PRODUCT MANAGEMENT (PRIORITY 5)
**Timeline:** 4 weeks  
**Why:** Core marketplace feature

**Components to Build:**
- [ ] Create listing page
- [ ] Edit/delete listing
- [ ] Listing approval queue (if needed)
- [ ] Category management
- [ ] Featured listings (admin)

**Database:**
- ✅ listings table (already exists)
- [ ] Add fields: seller_badge_at_publish, is_flagged, flagged_reason

**Features:**
- [ ] Drag-drop image upload
- [ ] Category selector
- [ ] Price input (KES)
- [ ] Description editor (rich text)
- [ ] Auto-pull seller phone/location
- [ ] Listing limit based on tier:
  - Mkulima: 50 listings max
  - Starter: 200 listings max
  - Pro/Enterprise: Unlimited

**Success Metrics:**
- 10,000+ active listings
- 95%+ approval rate (minimal moderation)
- Average listing lifetime: 45 days

---

## 📊 TECHNICAL IMPLEMENTATION DETAILS

### Database Schema (Completed)
```
profiles (existing) → enhanced with:
  ├─ subscription_tier (mkulima|starter|pro|enterprise)
  ├─ subscription_badge (auto-generated)
  ├─ phone_number
  ├─ whatsapp_number
  ├─ business_name, category, description
  ├─ latitude, longitude, city, county
  ├─ is_verified, verified_documents_count
  ├─ is_banned, ban_reason
  └─ average_rating, total_ratings_count

seller_verification_documents
  └─ id, seller_id, document_type, document_url, status

seller_reports
  └─ id, reported_seller_id, reason, description, status

admin_actions
  └─ id, admin_id, action_type, target_type, reason

seller_directory (denormalized view)
  └─ Fast lookups for discovery

buyer_contact_requests
  └─ Track buyer-seller interactions

seller_analytics (daily snapshots)
  └─ Engagement, sales, trust metrics
```

### API Endpoints (Edge Functions)
```
POST /mpesa-payment               ✅ (Exists)
     Initiates subscription payment

POST /verify-seller-document      (To build)
     Admin approves/rejects document

POST /report-seller              (To build)
     Buyer reports fraudulent seller

DELETE /ban-seller               (To build)
     Admin bans account instantly

POST /unban-seller               (To build)
     Admin lifts ban (after appeal)

GET /seller-directory/:id        (To build)
GET /seller-directory/nearby/:lat/:lng  (To build)
    Fetch seller info + map data

POST /contact-seller             (To build)
    Record buyer-seller contact request
```

### Frontend Routes (Current → Planned)
```
✅ /pricing                → PricingPage
✅ /dashboard              → Dashboard

(To build)
/directory                 → SellerDirectoryPage
/:seller_id               → SellerProfilePage (public)
/admin/reports            → ReportsDashboard (admin)
/admin/sellers            → SellerManagementDashboard (admin)
/settings/documents       → DocumentVerification (seller)
/analytics                → SellerAnalytics (seller)
```

---

## 🚫 WHAT WE EXPLICITLY DON'T BUILD

| Feature | Why Not | Alternative |
|---------|---------|-------------|
| **Escrow/Dispute** | Money never touches us | Buyer & seller resolve directly |
| **Refund System** | Payment is direct P2P | Seller refund to buyer directly |
| **Commission from sales** | Adds complexity | Subscription model is cleaner |
| **Trust Score Algorithm** | Too complex for MVP | Star rating + badges |
| **Chat/Messaging** | Use WhatsApp instead | Native WhatsApp integration |
| **Shipping Label** | Out of scope | Sellers arrange own shipping |
| **Insurance/Warranty** | Seller responsibility | Buyers evaluate trust before buying |
| **Taxes/Invoicing** | Seller pays own taxes | Seller generates their receipt |
| **KYC/AML for buyers** | Not needed (no money) | KYC only for sellers (verification) |

---

## 🎯 SUCCESS METRICS (BY PHASE)

### Phase 1: Verification
- [ ] ≥80% of sellers verified
- [ ] ≤2 hour avg review time
- [ ] ≤5% rejection rate (quality check)

### Phase 2: Directory
- [ ] ≥100 contact requests/day
- [ ] ≥70% response rate
- [ ] 4.2+ avg response time rating

### Phase 3: Safety
- [ ] ≤2% seller ban rate
- [ ] ≤5% wrongful ban appeals
- [ ] ≤48 hour resolution time

### Phase 4: Analytics
- [ ] ≥80% seller dashboard usage
- [ ] 30% upgrade rate influenced by analytics
- [ ] ≥4.5/5 admin satisfaction

### Phase 5: Listings
- [ ] ≥10,000 active listings
- [ ] 45 day avg listing lifetime
- [ ] ≥95% auto-approval rate

---

## 📝 DEPLOYMENT CHECKLIST

### Pre-Launch
- [ ] All TypeScript types finalized
- [ ] Database migration tested on staging
- [ ] RLS policies reviewed by security team
- [ ] Edge Functions tested with sandbox M-Pesa
- [ ] Admin dashboard tested for kill switch

### Go-Live
- [ ] Seller verification docs live
- [ ] Buyer contact working
- [ ] Admin ban/unban working
- [ ] Analytics collecting data
- [ ] Customer support trained

### Post-Launch
- [ ] Monitor seller ban appeals
- [ ] Track verification completion rate
- [ ] Measure buyer-seller contact success
- [ ] Gather feedback from top 10 sellers

---

## 📞 CONTACT & SUPPORT

**Bugs/Issues:** Create ticket in admin dashboard  
**Seller Appeal:** sellers@offspring.co.ke  
**Payment Issues:** payments@offspring.co.ke  
**Community Violations:** report@offspring.co.ke  

---

## 🔐 SECURITY NOTES

- ✅ M-Pesa credentials in Deno.env only (NOT in .env)
- ✅ RLS policies prevent unauthorized data access
- ✅ Admin actions logged with IP, timestamp, user
- ✅ Document uploads to secure S3 bucket
- ✅ Phone numbers hashed in database (optional)
- ✅ No PII in audit logs (de-identified)

---

**Version:** 2.0.0 (Direct-Connect Model)  
**Last Updated:** Feb 13, 2026  
**Status:** Ready for Phase 1 Implementation
