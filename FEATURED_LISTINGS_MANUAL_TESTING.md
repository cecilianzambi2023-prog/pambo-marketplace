/**
 * FEATURED LISTINGS - MANUAL TESTING CHECKLIST
 * 
 * Use this checklist to manually verify all featured listings functionality
 * before deploying to production. Each section has specific steps to validate.
 */

# 🧪 Featured Listings Manual Testing Checklist

## ✅ PRE-TEST SETUP

- [ ] Ensure Supabase database migration has been applied: `add_featured_listings.sql`
- [ ] Verify `featured_listings` table exists with all 13 columns
- [ ] Confirm M-Pesa Daraja credentials are configured (sandbox)
- [ ] Test M-Pesa callback endpoint is accessible
- [ ] Clear browser cache and local storage
- [ ] Have 2 test accounts ready:
  - [ ] Seller account: seller@test.com
  - [ ] Buyer account: buyer@test.com
- [ ] Have 3-5 test products ready (various prices and categories)

---

## 📱 TESTING ENVIRONMENT

**Browser:** Chrome/Firefox (latest)
**Device:** Desktop + Mobile (if possible)
**Network:** Stable internet connection
**Time Required:** ~45 minutes total

---

## 🎯 TEST SECTION 1: DATABASE INTEGRITY

### Test 1.1: Table Structure Verification
```
SQL Query:
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'featured_listings';

Expected Results:
- id (uuid, not null)
- listing_id (uuid, not null)
- seller_id (uuid, not null)
- featured_start_date (timestamp, not null)
- featured_end_date (timestamp, not null)
- duration_days (integer, not null)
- amount_paid (numeric, not null)
- currency (varchar, not null)
- payment_method (varchar, not null)
- status (varchar, not null)
- mpesa_receipt_number (varchar, nullable)
- created_at (timestamp, not null)
- updated_at (timestamp, not null)
```
- [ ] All 13 columns present
- [ ] Data types match specification
- [ ] Nullability is correct
- [ ] Primary key is `id`

### Test 1.2: Indexes Verification
```
SQL Query:
SELECT indexname, indexdef FROM pg_indexes 
WHERE tablename = 'featured_listings';

Expected Indexes:
- idx_listing_id (on listing_id)
- idx_seller_id (on seller_id)
- idx_status (on status)
- idx_dates (on featured_start_date, featured_end_date)
```
- [ ] All required indexes exist
- [ ] Queries should use indexes (check EXPLAIN PLAN)

### Test 1.3: RLS Policies Verification
```
SQL Query:
SELECT policyname, permissive, cmd 
FROM pg_policies 
WHERE tablename = 'featured_listings';

Expected Policies:
- Sellers can SELECT own records (seller_id = auth.uid())
- Admin can SELECT all
- Only authorized users can INSERT
- Update/Delete restricted appropriately
```
- [ ] RLS is enabled on table
- [ ] At least 2 policies exist
- [ ] Sellers cannot see other sellers' records

### Test 1.4: Foreign Key Constraint
```
SQL Query:
INSERT INTO featured_listings (
  id, listing_id, seller_id, featured_start_date, 
  featured_end_date, duration_days, amount_paid, 
  currency, payment_method, status, created_at, updated_at
) VALUES (
  'test-id', 'invalid-listing-id', 'test-seller', 
  NOW(), NOW() + INTERVAL '7 days', 7, 500, 'KES', 
  'mpesa', 'active', NOW(), NOW()
);

Expected Result:
- [ ] Constraint violation error
- [ ] Record not created
- [ ] Error message mentions foreign key

---

## 🛍️ TEST SECTION 2: FEATURED LISTING MODAL (UI)

### Test 2.1: Modal Opens Correctly
1. [ ] Login as seller@test.com
2. [ ] Navigate to Dashboard → My Listings
3. [ ] Click "Feature for KES 500" on any product
   - [ ] Modal opens smoothly (no console errors)
   - [ ] Modal content is visible
   - [ ] Modal has dark overlay
   - [ ] Close button (X) is visible in top-right

### Test 2.2: Modal Content Display
1. [ ] Verify modal displays:
   - [ ] Star icon ⭐
   - [ ] Title: "Feature Your Listing"
   - [ ] Product name: (dynamic, matches selected product)
   - [ ] Product price: (dynamic, matches selected product)
   - [ ] 3 benefit items:
     - [ ] "More Visibility"
     - [ ] "Featured Badge"
     - [ ] "7 Days Promotion"
   - [ ] Pricing card: "KES 500 • 7 Days"
   - [ ] Phone input placeholder: "0712345678"
   - [ ] "Feature for KES 500" button
   - [ ] "Cancel" button

### Test 2.3: Phone Input Validation
1. [ ] Enter "0712345678"
   - [ ] Input accepts the value
   - [ ] No error message shown
   - [ ] Cursor behaves normally
2. [ ] Enter "254712345678"
   - [ ] Input accepts the value
   - [ ] No error message shown
3. [ ] Enter invalid input "abc"
   - [ ] Shows error: "Invalid phone number"
   - [ ] Button disabled
4. [ ] Leave empty, click "Feature"
   - [ ] Shows error: "Phone number required"
   - [ ] Button stays disabled

### Test 2.4: Loading State
1. [ ] Click "Feature for KES 500" with valid phone
   - [ ] Button shows spinner icon
   - [ ] Button text changes to "Processing..."
   - [ ] Phone input becomes disabled
   - [ ] Cancel button remains clickable
   - [ ] Wait 3-5 seconds (simulating M-Pesa delay)

### Test 2.5: Success Screen
1. After M-Pesa success callback:
   - [ ] Modal shows success message: "Featured! 🎉"
   - [ ] Success screen displays for ~2 seconds
   - [ ] Modal auto-closes after countdown
   - [ ] User returns to Dashboard

### Test 2.6: Error Handling
1. Test error scenarios:
   - [ ] Wrong phone number: Shows "Invalid phone"
   - [ ] Network timeout: Shows "Request timed out"
   - [ ] M-Pesa declined: Shows "Payment failed"
   - [ ] Retry button visible for all errors

### Test 2.7: Modal Close Behavior
1. [ ] Click Cancel button → Modal closes immediately
2. [ ] Click dark overlay → Modal closes
3. [ ] Press ESC key → Modal closes
4. [ ] Refresh page while modal open → Closes modal

---

## 💰 TEST SECTION 3: M-PESA PAYMENT INTEGRATION

### Test 3.1: STK Push Initiation
1. [ ] Feature a listing with phone "0712345678"
2. [ ] Check Daraja dashboard (sandbox)
   - [ ] CheckoutRequestID appears for amount 500
   - [ ] Transaction is "PENDING"
   - [ ] Phone number is correctly formatted
   - [ ] Amount is exactly 500 KES
   - [ ] Account reference contains listing ID

### Test 3.2: M-Pesa Callback Reception
1. [ ] Simulate M-Pesa payment completion
2. [ ] Callback endpoint receives data:
   - [ ] Result code: 0 (success)
   - [ ] M-Pesa receipt number: MVC[NUMBERS]
   - [ ] Amount: 500
   - [ ] Phone: 254712345678
3. [ ] Modal shows success screen
4. [ ] Featured listing appears in database

### Test 3.3: Receipt Number Recording
1. [ ] After payment success, query database:
```
SELECT mpesa_receipt_number, status, amount_paid 
FROM featured_listings 
WHERE listing_id = 'test-product-id';

Expected:
- mpesa_receipt_number: MVC[NUMBERS] (captured)
- status: active
- amount_paid: 500
```
- [ ] Receipt number matches callback data
- [ ] Status is "active"
- [ ] Amount paid is exactly 500

---

## 🏷️ TEST SECTION 4: FEATURED BADGE DISPLAY

### Test 4.1: Badge Appears on Dashboard
1. [ ] Feature a listing (complete M-Pesa payment)
2. [ ] Go to Dashboard → My Listings
   - [ ] ⭐ FEATURED badge visible on product card
   - [ ] Badge has gold/yellow gradient background
   - [ ] Badge text is white
   - [ ] Badge positioned top-left corner
   - [ ] Z-index places it above other elements

### Test 4.2: Badge Appears on Marketplace (Buyer View)
1. [ ] Log out or open private window
2. [ ] Navigate to Marketplace hub
   - [ ] Featured product card has ⭐ FEATURED badge
   - [ ] Badge styling consistent with dashboard
   - [ ] Badge visible on all screen sizes (desktop, tablet, mobile)

### Test 4.3: Badge Appears on Wholesale Hub
1. [ ] If listing is in wholesale category
2. [ ] Navigate to Marketplace → Wholesale tab
   - [ ] ⭐ FEATURED badge visible
   - [ ] Badge styled consistently

### Test 4.4: Badge Disappears After Expiration
1. [ ] Create featured listing (test: set featured_end_date to yesterday)
2. [ ] Trigger DB function: `SELECT auto_update_status()`
3. [ ] Refresh page
   - [ ] ⭐ FEATURED badge is gone
   - [ ] Product shows as regular (no badge)
   - [ ] "Feature for KES 500" button reappears

### Test 4.5: Badge on Product Detail Page
1. [ ] Click featured product from Marketplace
2. [ ] View product details page
   - [ ] ⭐ FEATURED badge visible somewhere prominent
   - [ ] "Featured for X more days" message (if available)
   - [ ] "Feature Your Copy (KES 500)" button for non-owners

---

## 🔍 TEST SECTION 5: FEATURED FILTER & SORTING

### Test 5.1: Filter Button Appearance
1. [ ] Navigate to Marketplace
2. Check featured filter button:
   - [ ] Button visible if any featured listings exist
   - [ ] Button text: "Show Featured" (or "Featured Only" if active)
   - [ ] Button has gold background
   - [ ] Button hover state works
   - [ ] Clear Filter link appears/disappears appropriately

### Test 5.2: Show Featured Filter
1. [ ] Click "Show Featured" button
   - [ ] Button changes to "Featured Only"
   - [ ] Button background turns gold/intense
   - [ ] Grid reloads
   - [ ] Only featured products visible
   - [ ] Featured products maintain correct sorting
   - [ ] "Clear Filter" link becomes visible

### Test 5.3: Clear Filter
1. [ ] With "Featured Only" active
2. [ ] Click "Clear Filter" link
   - [ ] Button returns to "Show Featured"
   - [ ] All products displayed (featured + regular)
   - [ ] Featured products appear first
   - [ ] Filter is cleared

### Test 5.4: Featured Sorting Order
1. [ ] Create 5 featured listings
2. [ ] Create 10 regular listings
3. [ ] View Marketplace
   - [ ] Featured listings appear first (positions 1-5)
   - [ ] Regular listings appear second (positions 6-15)
   - [ ] Within featured: sorted by creation date (newest first)
   - [ ] Within regular: sorted normally

### Test 5.5: Empty State
1. [ ] Select category with no featured listings
2. [ ] Click "Featured Only"
   - [ ] Empty state message: "No Featured Products"
   - [ ] Helpful text: "No featured listings match your search"
   - [ ] "View All Products" button available
   - [ ] Click button → Returns to all products

---

## 📊 TEST SECTION 6: ADMIN DASHBOARD ANALYTICS

### Test 6.1: Admin Access
1. [ ] Login as info@pambo.biz (super admin)
2. [ ] Navigate to Commander Centre
3. [ ] Check navigation tabs:
   - [ ] New "⭐ Featured Listings" tab visible
   - [ ] Tab has Sparkles icon
   - [ ] Tab is clickable

### Test 6.2: Analytics Data Load
1. [ ] Click "⭐ Featured Listings" tab
   - [ ] Page loads without errors
   - [ ] Spinner appears briefly
   - [ ] Analytics data displays after 2-3 seconds
   - [ ] No console errors

### Test 6.3: KPI Cards Display
1. Verify 4 KPI cards visible:
   - [ ] Card 1: Total Revenue (shows KES amount)
   - [ ] Card 2: Active Featured (shows count)
   - [ ] Card 3: Avg Revenue/Day (shows KES amount)
   - [ ] Card 4: Payment Mix (shows %)
2. Verify KPI values are reasonable:
   - [ ] Total Revenue > 0 if features exist
   - [ ] Active Featured <= Total Features
   - [ ] Avg/Day = Total Revenue / Days Active
   - [ ] Payment Mix adds to ~100%

### Test 6.4: Payment Breakdown
1. [ ] View payment method breakdown
   - [ ] M-Pesa section visible with % and bar
   - [ ] Bank Transfer section visible with % and bar
   - [ ] Bars fill proportionally
   - [ ] Total amounts match KPI card
   - [ ] Percentages add to 100%

### Test 6.5: Statistics Section
1. [ ] View statistics rows:
   - [ ] Featured Listings Count (total ever)
   - [ ] Currently Active (status = 'active')
   - [ ] Expired (status = 'expired')
   - [ ] Price per Feature (hardcoded 500)
   - [ ] Duration per Feature (hardcoded 7 days)
2. [ ] Values are accurate and reasonable

### Test 6.6: Featured Listings Table
1. [ ] Table displays all featured listings
2. [ ] Columns visible:
   - [ ] Listing ID/Name
   - [ ] Status (Active/Expired/Cancelled)
   - [ ] Started Date
   - [ ] Expires Date
   - [ ] Revenue (KES)
   - [ ] Payment Method (icon)
   - [ ] Receipt Number (last 8 chars)
3. [ ] Table is scrollable and responsive
4. [ ] Row count matches "Featured Listings Count"

### Test 6.7: Table Sorting
1. [ ] Click "Latest First" button
   - [ ] Table re-sorts by featured_start_date DESC
   - [ ] Newest features appear on top
2. [ ] Click "Highest Revenue" button
   - [ ] Table re-sorts by amount_paid DESC
   - [ ] All are 500, so likely stays in chronological order

### Test 6.8: Refresh Button
1. [ ] Create a new featured listing (from seller account)
2. [ ] In admin dashboard, click "Refresh"
   - [ ] Data reloads
   - [ ] New listing appears in table
   - [ ] Total count increases by 1
   - [ ] Total revenue increases by 500
   - [ ] Active count increases by 1

### Test 6.9: Responsive Design
1. [ ] Test on desktop (1920x1080)
   - [ ] 4-column KPI grid
   - [ ] Full table visible
   - [ ] No horizontal scrolling needed
2. [ ] Test on tablet (768px)
   - [ ] 2-column KPI grid
   - [ ] Table scrollable horizontally if needed
3. [ ] Test on mobile (375px)
   - [ ] 1-column KPI grid
   - [ ] Stacked layout
   - [ ] Table shows only key columns

---

## ⏰ TEST SECTION 7: EXPIRATION & AUTO-UPDATE

### Test 7.1: Manual Expiration Trigger (Testing)
1. [ ] Create featured listing: `featured_end_date = NOW()`
2. [ ] Query: Check status is "active"
3. [ ] Wait 1 minute
4. [ ] Trigger database function: `SELECT auto_update_status()`
5. [ ] Query again:
   - [ ] Status changed to "expired"
   - [ ] Badge removed from UI (refresh page)

### Test 7.2: Natural 7-Day Expiration
1. [ ] Create featured listing (record featured_end_date)
2. [ ] Document creation timestamp
3. [ ] Check DB after 7 days:
   - [ ] Status is still "active"
4. [ ] Check DB after 7 days + 1 hour:
   - [ ] Status changed to "expired"
   - [ ] On UI refresh: Badge disappears
   - [ ] Product no longer featured

### Test 7.3: Featured Filter After Expiration
1. [ ] Feature a product, then expire it
2. [ ] On Marketplace, click "Featured Only"
   - [ ] Expired product NOT in list
   - [ ] Only active featured products shown

---

## 🔐 TEST SECTION 8: RATE LIMITING

### Test 8.1: Max 5 Featured Per Seller
1. [ ] Create seller account with 5 active featured listings
2. [ ] Try to feature a 6th product
   - [ ] Modal opens
   - [ ] Click "Feature for KES 500"
   - [ ] Error message: "Maximum featured listings reached"
   - [ ] Payment NOT initiated
   - [ ] M-Pesa NOT charged

### Test 8.2: Rate Limit After Expiration
1. [ ] Seller has 5 active featured
2. [ ] Wait for 1 to expire (or update featured_end_date in DB)
3. [ ] Try to feature 6th product
   - [ ] Now allowed (count is 4 active)
   - [ ] Payment succeeds
   - [ ] 6th listing featured successfully

---

## 🔒 TEST SECTION 9: SECURITY & PERMISSIONS

### Test 9.1: RLS - Seller Cannot See Other Seller's Featured
1. [ ] Seller A features a product
2. [ ] Login as Seller B
3. [ ] Query API: `GET /api/featured-listings`
   - [ ] Response does NOT include Seller A's featured listing
   - [ ] Only shows own featured listings (if any)

### Test 9.2: RLS - Admin Can See All
1. [ ] Admin (info@pambo.biz) views admin dashboard
   - [ ] Can see ALL featured listings from ALL sellers
   - [ ] Analytics includes all sellers' revenue
   - [ ] No filtering by seller ID

### Test 9.3: Unauthorized User Cannot Feature
1. [ ] Create non-seller account (buyer only)
2. [ ] Try to access feature endpoint directly
   - [ ] Response: 401 Unauthorized or permission denied
   - [ ] Cannot feature listings without seller status

---

## 🚀 TEST SECTION 10: CROSS-HUB CONSISTENCY

### Test 10.1: Marketplace Hub
1. [ ] Feature a product
2. [ ] View Marketplace
   - [ ] ⭐ badge visible
   - [ ] Featured on top
   - [ ] Filter button works

### Test 10.2: Wholesale Hub (if applicable)
1. [ ] Feature a wholesale product
2. [ ] View Wholesale tab
   - [ ] ⭐ badge visible
   - [ ] Sorting works

### Test 10.3: Digital Products Hub (if applicable)
1. [ ] Feature a digital product
2. [ ] View Digital tab
   - [ ] ⭐ badge visible
   - [ ] Sorting works

### Test 10.4: Home Page Featured Carousel
1. [ ] View home page
2. Check featured carousel:
   - [ ] Shows featured products first
   - [ ] Newest featured appear
   - [ ] Carousel updates after new feature

---

## ✅ TEST SECTION 11: FINAL SMOKE TESTS

### Test 11.1: No Console Errors
1. [ ] Open DevTools Console
2. [ ] Perform all tests above
3. [ ] Verify console shows:
   - [ ] No red errors
   - [ ] Only informational logs
   - [ ] No 404 errors

### Test 11.2: No Build Errors
1. [ ] Run: `npm run build`
   - [ ] Build completes successfully
   - [ ] Output: "✓ built in X.XXs"
   - [ ] No TypeScript errors
   - [ ] No bundle warnings

### Test 11.3: Database Migration
1. [ ] Run: `supabase migration up`
   - [ ] No SQL errors
   - [ ] Migration applies successfully
   - [ ] featured_listings table created

---

## 📋 TEST SIGN-OFF

**Tested By:** ___________________
**Date:** ___________________
**Environment:** ___________________

### Overall Results
- [ ] All tests PASSED
- [ ] Some tests FAILED (see notes)
- [ ] Tests BLOCKED (see dependencies)

### Notes & Issues Found
```
[Document any issues, edge cases, or unexpected behavior here]
```

### Recommendation
- [ ] ✅ READY FOR PRODUCTION
- [ ] ⚠️ READY WITH MINOR FIXES
- [ ] ❌ NOT READY - NEEDS MAJOR FIXES

---

## 🎯 QUICK REFERENCE COMMANDS

### Database Queries
```sql
-- Check featured listings
SELECT * FROM featured_listings ORDER BY created_at DESC LIMIT 10;

-- Check active featured
SELECT * FROM active_featured_listings;

-- Test expiration
UPDATE featured_listings SET featured_end_date = NOW() WHERE id = 'test-id';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'featured_listings';

-- View analytics summary
SELECT 
  COUNT(*) as total,
  SUM(amount_paid) as revenue,
  COUNT(CASE WHEN payment_method='mpesa' THEN 1 END) as mpesa_count,
  COUNT(CASE WHEN payment_method='bank_transfer' THEN 1 END) as bank_count,
  COUNT(CASE WHEN status='active' THEN 1 END) as active_count,
  COUNT(CASE WHEN status='expired' THEN 1 END) as expired_count
FROM featured_listings;
```

### Test Data Setup
```javascript
// Create test featured listing (in browser console)
await createFeaturedListing({
  listingId: 'test-listing-id',
  sellerId: 'test-seller-id',
  phone: '0712345678',
  mpesaReceiptNumber: 'MVC123456',
  paymentMethod: 'mpesa'
});

// Check featured status
const isFeatured = await isListingFeatured('test-listing-id');
console.log('Is Featured:', isFeatured);

// Get analytics
const analytics = await getFeaturedListingsAnalytics();
console.log('Analytics:', analytics);
```

---

**END OF TESTING CHECKLIST**

Use this checklist for every release involving featured listings functionality.
