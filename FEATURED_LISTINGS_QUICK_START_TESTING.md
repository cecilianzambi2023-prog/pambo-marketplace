/**
 * FEATURED LISTINGS - QUICK START TESTING GUIDE
 * 
 * Complete guide to test all featured listings features in under 30 minutes.
 * Use this for quick validation before deployment.
 */

# 🚀 Featured Listings - Quick Start Testing (30 Minutes)

## ⏱️ Timeline Overview
- Setup: 5 minutes
- Core Flow Test: 10 minutes
- Visual Verification: 5 minutes
- Admin Check: 5 minutes
- Cleanup: 5 minutes

---

## 🔧 SETUP (5 minutes)

### Step 1: Verify Database
```bash
# Run this in terminal:
npm run build

# Expected output:
# ✓ 1834 modules transformed
# ✓ built in ~4.5s
# No TypeScript errors
```
- [ ] Build succeeds with zero errors

### Step 2: Prepare Test Accounts
```
Seller Account:
- Email: seller@test.com
- Password: test123456
- Has: 3-5 products ready to feature

Buyer Account:
- Email: buyer@test.com
- Password: test123456
- For: Viewing featured products

Admin Account:
- Email: info@pambo.biz
- Password: [your admin password]
- For: Analytics dashboard
```
- [ ] Can login to all 3 accounts
- [ ] Accounts have appropriate permissions

### Step 3: Clear Browser Cache
```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
// Then refresh page
```
- [ ] Page loads fresh (no cached data)

---

## ✨ CORE FLOW TEST (10 minutes)

### Flow 1: Seller Features a Product (5 min)

**Step 1: Login**
1. [ ] Go to: http://localhost:5173
2. [ ] Click "Login"
3. [ ] Enter: seller@test.com / test123456
4. [ ] Click "Sign In"
   - **Expected:** Dashboard loads with "My Listings" section

**Step 2: Access Product**
1. [ ] Click "Dashboard" in sidebar
2. [ ] Find any product in "My Listings"
3. [ ] Click "Manage" button
   - **Expected:** Product edit view opens
   - **Should see:** Original product details, images, etc.

**Step 3: Open Feature Modal**
1. [ ] Scroll down or look for "⭐ Feature for KES 500" button
2. [ ] Click the button
   - **Expected:** FeaturedListingModal opens with:
     - ⭐ and "Feature Your Listing" title
     - Product name (dynamic)
     - Product price (dynamic)
     - 3 benefit bullets
     - "KES 500 • 7 Days" pricing card
     - Phone input field
     - Feature button

**Step 4: Enter Phone & Submit**
1. [ ] Click phone input field
2. [ ] Type: `0712345678`
3. [ ] Verify: Field accepts input (no error)
4. [ ] Click "Feature for KES 500" button
   - **Expected:** 
     - Button shows spinner
     - Button text changes to "Processing..."
     - Input becomes disabled
     - Modal stays open

**Step 5: Simulate M-Pesa Payment**
*Option A: Real M-Pesa (Sandbox)*
1. [ ] Check phone for M-Pesa STK prompt
2. [ ] Enter your M-Pesa PIN
3. [ ] Transaction completes (3-5 seconds)

*Option B: Mock Payment (For Testing)*
1. [ ] In browser console, trigger payment success manually:
```javascript
// Simulates successful callback
await createFeaturedListing({
  listingId: 'your-product-id',
  sellerId: 'your-seller-id',
  phone: '0712345678',
  mpesaReceiptNumber: 'MVC123456',
  paymentMethod: 'mpesa'
});
```

**Step 6: Verify Success**
1. [ ] Modal shows "Featured! 🎉" message
2. [ ] Countdown displays (2 seconds)
3. [ ] Modal closes automatically
   - **Expected:** Return to Dashboard, product list view

**Step 7: Verify Badge**
1. [ ] Go back to product
2. [ ] Look for ⭐ FEATURED badge
   - **Expected:** 
     - Badge visible top-left of product
     - Gold/yellow color
     - White "FEATURED" text
     - Sparkles icon

- [ ] **✅ Flow 1 PASSED**

### Flow 2: Buyer Sees Featured Product (5 min)

**Step 1: Logout & Login as Buyer**
1. [ ] Click user icon → Logout
2. [ ] Wait 2 seconds
3. [ ] Login as: buyer@test.com / test123456
   - **Expected:** Homepage loads

**Step 2: Navigate to Marketplace**
1. [ ] Click "Marketplace" hub (or in sidebar)
2. [ ] Grid of products appears
   - **Expected:** 
     - Grid loads with products
     - Featured products appear FIRST
     - Regular products appear AFTER

**Step 3: Verify Featured Product**
1. [ ] Scroll to top of grid
2. [ ] Find the product you featured
   - **Look for:** ⭐ FEATURED badge on the card
   - **Position:** Should be in top-left area of grid
   - **Badge:** Gold background, white text, sparkles icon
   - **Product info:** Title, price, images all intact

**Step 4: Test Featured Filter (Optional)**
1. [ ] Look for "Show Featured" button (gold color)
2. [ ] Click it
   - **Expected:** 
     - Button text changes to "Featured Only"
     - Grid updates to show ONLY featured products
     - Your featured product still visible
     - Regular products hidden
3. [ ] Click "Clear Filter"
   - **Expected:** Button returns to "Show Featured", all products shown again

- [ ] **✅ Flow 2 PASSED**

---

## 👁️ VISUAL VERIFICATION (5 minutes)

### Badge Display Across Views

**Test on Desktop (1920px)**
1. [ ] Marketplace → Featured product has clear badge
2. [ ] Product detail page → Badge visible (if in detail view)
3. [ ] My Listings (Dashboard) → Badge visible on featured product
4. [ ] Badge text readable, colors correct

**Test on Mobile (375px)**
1. [ ] Open on mobile device or DevTools mobile view
2. [ ] Marketplace grid → Product cards stack vertically
3. [ ] Featured badge still visible and readable
4. [ ] No text overflow or styling issues

**Test on Tablet (768px)**
1. [ ] DevTools tablet view
2. [ ] Grid shows 2 columns
3. [ ] Badges properly positioned on cards
4. [ ] Filter button responsive

- [ ] **✅ Visual Verification PASSED**

---

## 🎯 ADMIN DASHBOARD CHECK (5 minutes)

### Access Admin Dashboard
1. [ ] Logout from buyer account
2. [ ] Login as: info@pambo.biz / [admin password]
3. [ ] Click "Commander Centre" (admin panel)
   - **Expected:** Admin dashboard opens

### Navigate to Featured Tab
1. [ ] Look for tab bar at top
2. [ ] Find "⭐ Featured Listings" tab
3. [ ] Click it
   - **Expected:**
     - Analytics data loads
     - KPI cards display
     - Table shows featured listings

### Verify Analytics
1. [ ] **Total Revenue Card:**
   - [ ] Shows "KES 500" (if 1 feature) or more
   - [ ] Amount is correct (500 × number of features)

2. [ ] **Active Featured Card:**
   - [ ] Shows count (should be at least 1)
   - [ ] Count matches products you featured

3. [ ] **Avg Revenue/Day Card:**
   - [ ] Shows calculated value
   - [ ] Formula: Total Revenue ÷ Days Active

4. [ ] **Payment Mix Card:**
   - [ ] Shows M-Pesa % and Bank %
   - [ ] Percentages add up to 100%

### Verify Featured Listings Table
1. [ ] Table displays all featured listings
2. [ ] Your featured product appears in table
3. [ ] Columns visible:
   - [ ] Status (should show "Active")
   - [ ] Started date (today's date)
   - [ ] Expires date (~7 days from today)
   - [ ] Revenue (500)
   - [ ] Payment method indicator
   - [ ] Receipt number (partial)

### Test Refresh Button
1. [ ] Click "Refresh" button (if visible)
   - **Expected:** Data reloads, no errors

- [ ] **✅ Admin Check PASSED**

---

## 🧹 CLEANUP (5 minutes)

### Database Cleanup
```sql
-- If doing test again, reset test data:
DELETE FROM featured_listings 
WHERE seller_id = 'test-seller-id-used-in-test';
```
- [ ] Test data removed (optional, for next test)

### Browser Cleanup
```javascript
// In console:
localStorage.clear();
sessionStorage.clear();
```
- [ ] Cache cleared

### Build Verification
```bash
npm run build
```
- [ ] Final build succeeds
- [ ] Zero TypeScript errors
- [ ] Ready for deployment

- [ ] **✅ Cleanup COMPLETE**

---

## ✅ FINAL CHECKLIST

### Must Pass (Blocking Issues)
- [ ] Build runs with zero errors
- [ ] Seller can feature a product (complete flow)
- [ ] Badge displays on buyer view
- [ ] Admin dashboard shows analytics
- [ ] No console errors or warnings
- [ ] Database updates correctly

### Nice to Have (Optional)
- [ ] Test on mobile view
- [ ] Verify featured filter works
- [ ] Check expired product scenario
- [ ] Test rate limiting (5 features max)

### Sign-Off

**Tester Name:** ________________________

**Date:** ________________________

**Result:**
- [ ] ✅ **PASS** - All tests passed, ready for production
- [ ] ⚠️ **PASS WITH NOTES** - Works but has minor issues (list below)
- [ ] ❌ **FAIL** - Major issues found (list below)

**Notes/Issues:**
```
[Any issues found go here]
```

---

## 🆘 TROUBLESHOOTING

### Badge Not Showing
1. [ ] Refresh page with Ctrl+Shift+R (hard refresh)
2. [ ] Verify product exists in featured_listings table:
```sql
SELECT COUNT(*) FROM featured_listings 
WHERE status = 'active' AND featured_end_date > NOW();
```
3. [ ] Check if featured_end_date has passed (if so, expired)

### Modal Won't Open
1. [ ] Check console for JavaScript errors
2. [ ] Verify you're logged in as seller
3. [ ] Verify product exists in listings table
4. [ ] Try different product

### M-Pesa Payment Fails
1. [ ] Check phone number format (0xxxxxxxxx or 254xxxxxxxxx)
2. [ ] Verify Daraja credentials are configured
3. [ ] Check Daraja sandbox balance
4. [ ] Try mock payment method instead

### Analytics Not Loading
1. [ ] Refresh page
2. [ ] Clear browser cache: Ctrl+Shift+Delete
3. [ ] Check database connection
4. [ ] Verify you're logged in as admin (info@pambo.biz)

### Still Stuck?
1. [ ] Check `/src/services/featuredListingsService.ts` for errors
2. [ ] Look at browser DevTools → Network tab for API failures
3. [ ] Check Supabase logs for database issues
4. [ ] Verify featured_listings table exists and has data

---

## 📊 Success Metrics

| Metric | Target | Result |
|--------|--------|--------|
| Feature Flow Completion Time | < 3 min | _ min |
| Badge Display Time | < 500ms | _ ms |
| Admin Dashboard Load Time | < 2 sec | _ sec |
| No Console Errors | 0 | _ |
| Payment Success Rate | 100% | ___% |
| Build Success | Yes | Yes / No |

---

**🎉 Celebrate! Featured Listings is working!**

Next Steps:
1. Deploy to staging environment
2. Run full manual testing checklist
3. Get stakeholder approval
4. Deploy to production
5. Monitor analytics for 24 hours

