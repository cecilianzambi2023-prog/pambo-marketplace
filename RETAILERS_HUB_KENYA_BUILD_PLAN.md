# 🏪 Retailers Hub Kenya: Jiji-Style Build Plan

**Goal:** Build Retailers Hub Kenya as a trust-first, transaction-ready marketplace (Jiji model) where every button works and every paid feature delivers value.

---

## ✅ Step 1: Listings + Categories Foundation (CURRENT)

### What We're Building
- **Post Ad**: Clean form with category-driven validation, required fields, image limits by tier
- **Edit Ad**: Same form, pre-populated with existing data
- **Category Structure**: Kenya-optimized categories (aligned with Jiji/PigiaMe standards)
- **Publish Rules**: Quality gates to block low-quality/fake ads before they go live

### Acceptance Criteria
- [ ] Every new ad requires: title (max 70 chars), price, category, location (county + town), 1+ photo, seller phone
- [ ] Free tier: max 4 photos per listing
- [ ] Paid tier (Starter+): max 8-20 photos per listing
- [ ] Category dropdown grouped by main category (Apparel, Electronics, Home, etc.)
- [ ] Location is Kenya-specific (47 counties + major towns)
- [ ] Ad states: `draft`, `pending` (first-time sellers), `approved`, `rejected`, `paused`, `sold`
- [ ] Seller phone shown on every listing for direct contact (Jiji-style)
- [ ] Payment arrangement selector: Jiji Direct (default), M-Pesa, Cash on Delivery, Bank Transfer

### Files to Update
- ✅ `components/AddListingModal.tsx` — already has most features, needs quality enforcement
- ✅ `constants.ts` — category structure already solid
- ✅ `types.ts` — Product interface supports all required fields
- ✅ `services/supabaseService.ts` — createListing/updateListing working

### What's Missing (To Add)
1. **Duplicate detection** — warn if similar title + category + seller exists
2. **Minimum description length** — enforce 20+ chars for quality
3. **Price validation** — block unrealistic prices (e.g., iPhone for KES 50)
4. **Auto-moderation feedback** — show rejection reason to seller immediately
5. **Ad preview before publish** — show seller how listing will appear

---

## ✅ Step 2: Seller Profile Pages ✓ COMPLETED

### What We Built
Every seller now gets a dedicated public page (`/seller/{sellerId}`) showing:
- Seller name, join date, verification badge, response time
- Active listings grid
- Reviews/ratings from buyers
- Contact buttons (Call, WhatsApp, Chat)
- Follow/Unfollow button
- Report seller button

### Implementation Summary ✓
- ✅ Added 'seller' to ViewState type in types.ts
- ✅ Updated route parsing to support `/seller/:sellerId` and `#/seller/:sellerId` patterns
- ✅ Added extractSellerIdFromPath() and extractSellerIdFromHash() helpers
- ✅ Updated syncFromPath() to auto-load seller profile when URL contains seller ID
- ✅ Modified handleOpenSellerProfile() to update URL with seller ID
- ✅ Updated onClose handler to navigate back to marketplace when seller profile closes
- ✅ Integrated with existing SellerProfilePage.tsx component

### Acceptance Criteria ✓
- ✅ URL format: `/seller/{sellerId}` or `#/seller/{sellerId}`
- ✅ Shows only `active` + `approved` listings
- ✅ Reviews show only `approved` status
- ✅ Seller can't review themselves
- ✅ Phone/WhatsApp click-to-call/message
- ✅ Follow count visible, updates in real-time
- ✅ Admin can suspend seller from this page

### Test It
1. Navigate to any product listing
2. Click seller name → should open seller profile modal
3. Check URL → should now be `#/seller/{sellerId}`
4. Copy URL and paste in new tab → should open same seller profile
5. Click X to close → should return to marketplace

### Files Updated
- ✅ `types.ts` — Added 'seller' to ViewState type
- ✅ `App.tsx` — Added seller profile routing logic, URL parsing, state management
- ✅ `components/SellerProfilePage.tsx` — Already existed, now properly integrated with routing

---

## 💬 Step 3: Buyer Contact Actions (Call, Chat, Save, Share) — NEXT

### What We're Building
- **Call**: Click phone → opens dialer with seller's number
- **Chat/Message**: Opens WhatsApp with pre-filled message (Jiji-style)
- **Save/Favorite**: Buyer saves listing to dashboard, persists in DB
- **Share**: Share listing via WhatsApp, SMS, or copy link

### Acceptance Criteria
- [ ] Call button triggers `tel:` link (mobile) or displays number (desktop)
- [ ] Chat button opens `https://wa.me/{sellerPhone}?text={message}`
- [ ] Save/Favorite persists to `favorites` table, shows heart icon filled
- [ ] Share shows modal with WhatsApp/SMS/Copy Link options
- [ ] All actions work for guest users (except Save, which requires login)

### Files to Update
- `components/ProductCard.tsx` — add action buttons
- `components/ProductDetailsModal.tsx` — add action buttons
- `services/favoritesService.ts` — create/delete favorites
- `database/schema.sql` — ensure `favorites` table exists

---

## 💰 Step 4: Transaction Intent (Buy + Make Offer)

### What We're Building
- **Buy Now**: Buyer expresses intent, seller gets notification, both exchange contact
- **Make Offer**: Buyer suggests price, seller can accept/reject/counter
- **Offer Flow**: Statuses = `pending`, `accepted`, `rejected`, `expired`, `completed`

### Acceptance Criteria
- [ ] "Buy Now" requires login, creates `inquiry` record with buyer/seller IDs
- [ ] Seller sees inquiry in dashboard with buyer contact
- [ ] "Make Offer" shows input field, validates price (must be < listing price)
- [ ] Offers expire after 48 hours if no response
- [ ] Seller can accept (locks price) or reject (with reason)
- [ ] Both parties get WhatsApp notification on offer status change

### Files to Create
- `components/MakeOfferModal.tsx`
- `services/offersService.ts`
- `services/inquiriesService.ts`
- `database/migrations/create_offers_table.sql`

---

## 🛡️ Step 5: Trust System (Reviews, Comments, Reports)

### What We're Building
- **Reviews**: Buyers rate sellers (1-5 stars) + text review
- **Comments**: Public questions on listings (auto-moderated)
- **Reports**: Flag fake/scam listings, admin review queue

### Acceptance Criteria
- [ ] Reviews require completed transaction (or bypass for testing)
- [ ] Reviews pending admin approval (status: `pending` → `approved`)
- [ ] Comments auto-moderated by AI, suspicious ones flagged
- [ ] Reports create admin task with priority (high for scam/fraud)
- [ ] Seller can respond to reviews (public response)
- [ ] Average rating updates on seller profile when review approved

### Files Already Exist
- ✅ `services/reviewsService.ts`
- ✅ `services/listingCommentsService.ts`
- `components/ReportModal.tsx` — needs creation

---

## 💎 Step 6: Monetization (Boost + Subscribe)

### What We're Building
- **Boost/Promote**: Pay KES 150-1200 to pin listing to top for 24h-30 days
- **Subscribe**: Monthly plans (Starter KES 3,500, Pro KES 5,000, Enterprise KES 9,000)
- **Subscription Benefits**: More images, more listings, priority support, analytics

### Acceptance Criteria
- [ ] Boost button on listing → M-Pesa payment → listing gets `isBoosted: true` + expiry timestamp
- [ ] Boosted listings show "BOOSTED" badge and appear first in search/browse
- [ ] Subscribe modal shows 3 tiers with feature comparison
- [ ] Free tier: 4 images, 10 listings max
- [ ] Paid tier unlocks based on subscription level
- [ ] Subscription status checked before posting new ad

### Files Already Exist
- ✅ `constants.ts` — BOOST_TIERS, SUBSCRIPTION_TIERS defined
- ✅ `components/SubscriptionModal.tsx`
- `components/BoostModal.tsx` — needs creation
- `services/boostService.ts` — needs creation

---

## 📊 Weekly KPI Targets (Hub 1 Success Metrics)

### Week 1-2: Foundation
- [ ] 50+ active listings (real sellers)
- [ ] 10+ categories covered
- [ ] 0 duplicate/spam listings visible
- [ ] 100% of ads have contact info

### Week 3-4: Engagement
- [ ] 20+ inquiries/offers per week
- [ ] 10+ reviews submitted
- [ ] 5+ sellers boosted listings
- [ ] 3+ paid subscriptions

### Week 5-8: Transaction Scale
- [ ] 100+ weekly buyer visits
- [ ] 50+ contact actions (call/chat)
- [ ] 10+ completed deals (tracked via seller confirmation)
- [ ] <5% dispute/report rate

### Unlock Condition for Hub 2 (Kenya Wholesale)
- ✅ Consistent 100+ listings
- ✅ 50+ active sellers
- ✅ 20+ weekly transactions
- ✅ <2% refund/dispute rate
- ✅ Positive seller retention (70%+ post 30 days)

---

## 🚀 Implementation Order (Next 30 Days)

### Days 1-5: Step 1 (Listings Foundation)
- Strengthen Post/Edit Ad validation
- Add duplicate detection
- Add ad preview before publish
- Test with 10 real listings

### Days 6-10: Step 2 (Seller Pages)
- Route seller profile pages
- Show active listings + reviews
- Add follow/contact buttons
- Test with 5 seller profiles

### Days 11-15: Step 3 (Contact Actions)
- Implement Call/Chat/Save/Share
- Persist favorites to DB
- Test on mobile + desktop

### Days 16-20: Step 4 (Buy + Offer)
- Build Make Offer flow
- Build Buy Now inquiry
- Seller dashboard for managing offers
- Test end-to-end offer flow

### Days 21-25: Step 5 (Trust)
- Reviews with moderation queue
- Comments with AI moderation
- Report flow with admin queue
- Test with real reviews/reports

### Days 26-30: Step 6 (Monetization)
- Boost payment flow (M-Pesa)
- Subscription enforcement
- Analytics for boosted listings
- Test boost visibility + payments

---

## ✅ Done Criteria (Retailers Hub Kenya = Production-Ready)

- [ ] 100+ real listings across 15+ categories
- [ ] Every listing has working Call/Chat/Share buttons
- [ ] Boost feature tested with 5+ paid listings
- [ ] 3+ paid subscriptions active
- [ ] Reviews + comments functional
- [ ] Admin moderation queue working
- [ ] <2% spam/fake listing rate
- [ ] Mobile + desktop UX tested
- [ ] Zero broken buttons or "coming soon" features

**Only then → move to Hub 2 (Kenya Wholesale).**

---

## Current Status
- ✅ Step 1: 80% complete (form exists, needs quality gates)
- ⏳ Step 2: 40% complete (component exists, routing needed)
- ⏳ Step 3: 60% complete (Call/Chat exist, Save/Share need DB)
- ❌ Step 4: 0% (needs full build)
- ⏳ Step 5: 50% (reviews exist, reports missing)
- ⏳ Step 6: 70% (subscriptions work, boost needs payment)
