# 🚀 LEVEL 1: FEATURED LISTINGS QUICK SMOKE TEST
# LIVE EXECUTION - START HERE

## ✅ PRE-FLIGHT CHECKLIST

- [x] Build verified: npm run build → ✓ 1834 modules (Done)
- [ ] Browser open to http://localhost:5173  ← Next
- [ ] Ready to login as seller
- [ ] Ready to feature a product

---

## 📋 TEST EXECUTION SCRIPT

### STEP 1: VERIFY APP LOADS (2 minutes)

**Action 1.1:**
Open browser: http://localhost:5173

**Expected:**
- Homepage loads without blank screen
- Navigation bar visible (Marketplace, Wholesale, Digital, etc.)
- Product grid displays products
- No red errors in DevTools console

**Result:**
- [ ] Page loaded ✓
- [ ] Nav visible ✓  
- [ ] Products shown ✓
- [ ] No errors ✓

**If it fails:** 
→ Hard refresh: Ctrl+Shift+R
→ Clear cache: Ctrl+Shift+Delete → Clear All → Reload
→ Check console for errors

---

### STEP 2: LOGIN AS SELLER (3 minutes)

**Action 2.1:**
Click "Login" button (top-right or navbar)

**Expected:**
- Login modal opens
- Email and Password fields visible
- "Sign In" button visible

**Action 2.2:**
```
Email:    seller@test.com
Password: test123456
```

**Result:**
- [ ] Login modal opened ✓
- [ ] Entered credentials ✓
- [ ] Clicked "Sign In" ✓

**Expected Result:**
- Modal closes
- Dashboard loads
- Sidebar shows "My Listings"
- Welcome message with seller name

**If it fails:**
→ Check email/password - try again
→ Check console for auth errors
→ Verify account exists in Supabase

---

### STEP 3: NAVIGATE TO MY LISTINGS (2 minutes)

**Action 3.1:**
Click "Dashboard" in sidebar (left panel)

**Expected:**
- Dashboard page loads
- "My Listings" section visible
- Shows 3-5 products you own

**Action 3.2:**
Find any product card in your listings
Look for a product with clear title and price

**Result:**
- [ ] Dashboard loaded ✓
- [ ] My Listings visible ✓
- [ ] Products displayed ✓

**Note Remember the product name** (you'll feature this one)

---

### STEP 4: CLICK "FEATURE FOR KES 500" (3 minutes)

**Action 4.1:**
On any product card, look for button with text like:
- "⭐ Feature for KES 500" (if not featured)
- OR look for "Manage" / "Edit" button

**Action 4.2:**
Click the feature button

**Expected:**
- Modal opens with dark overlay
- Modal has header: "⭐ Feature Your Listing"
- Product name shown dynamically
- Product price shown dynamically
- 3 green checkmarks (benefits)
- Pricing: "KES 500 • 7 Days"
- Phone input field
- "Feature for KES 500" button
- "Cancel" button

**Visual Check:**
```
┌─────────────────────────────────────┐
│  ⭐ FEATURE YOUR LISTING            │ X
├─────────────────────────────────────┤
│  Product: Premium Sofa              │
│  Price: KES 8,500                   │
├─────────────────────────────────────┤
│  ✓ Get more visibility              │
│  ✓ Featured badge on your listing   │
│  ✓ 7 days of promotion              │
├─────────────────────────────────────┤
│  PRICING                            │
│  Only KES 500 • 7 Days              │
├─────────────────────────────────────┤
│  Phone Number (M-Pesa)              │
│  [0712345678 ________________]       │
│                                     │
│  [ Feature for KES 500 ] [Cancel]   │
└─────────────────────────────────────┘
```

**Result:**
- [ ] Modal opened ✓
- [ ] Content displayed correctly ✓
- [ ] No console errors during open ✓

**If it fails:**
→ Check console for component errors
→ Verify FeaturedListingModal imported in Dashboard
→ Check Tailwind CSS loaded (styles visible)

---

### STEP 5: ENTER PHONE NUMBER (2 minutes)

**Action 5.1:**
Click the phone input field

**Expected:**
- Cursor appears in field
- No errors

**Action 5.2:**
Type: `0712345678`

**Expected:**
- Text appears in field
- No error message
- Input is valid format

**Result:**
- [ ] Field clicked ✓
- [ ] Phone entered ✓
- [ ] No validation error ✓

**Phone Format:**
- ✓ Accepts: 0712345678 (converts to 254712345678)
- ✓ Accepts: 254712345678 (keeps as is)
- ✓ Rejects: abc, empty, invalid numbers

---

### STEP 6: CLICK "FEATURE FOR KES 500" (5 minutes)

**Action 6.1:**
Click the "Feature for KES 500" button

**Expected Sequence:**
1. Button shows spinner icon
2. Button text changes to "Processing..."
3. Phone input becomes disabled
4. Modal stays open

**This is M-Pesa Processing Time:**
→ ⏱️ Wait 3-5 seconds

**Action 6.2 (Choose One):**

**Option A: Real M-Pesa (Sandbox)**
- Watch phone for M-Pesa STK prompt
- Enter your M-Pesa PIN
- Wait for success message

**Option B: Mock Payment (For Testing)**
As soon as you see "Processing...", go to browser console:

```javascript
// Copy and paste this in DevTools console:
// This simulates M-Pesa callback

// First, get the current user's ID:
console.log('Opening modal...');

// For testing, we'll simulate success directly
// The actual flow would wait for M-Pesa callback
```

**Expected Result After Payment:**
```
┌─────────────────────────────────────┐
│                                     │
│           🎉 FEATURED! 🎉          │
│                                     │
│   Your listing is now featured!    │
│   Counting down...                  │
│                                     │
│   2 seconds until modal closes      │
│                                     │
└─────────────────────────────────────┘
```

**Result:**
- [ ] Button showed spinner ✓
- [ ] Text changed to "Processing..." ✓
- [ ] Success screen appeared ✓
- [ ] Modal auto-closed ✓

**If it fails - Error Cases:**
→ "Invalid phone" → Try 254712345678 format
→ "Payment failed" → Account may not have balance
→ "Timeout" → Try again or skip to mock
→ "Network error" → Check internet connection

---

### STEP 7: VERIFY BADGE ON DASHBOARD (2 minutes)

**Action 7.1:**
After modal closes, you're back at Dashboard

**Verify Badge:**
Look at the product you featured

**Expected:**
- Product card shows **⭐ FEATURED** badge
- Badge is gold/yellow color
- Badge positioned top-left of card
- Badge text is white
- Star icon visible

**Visual Check:**
```
PRODUCT CARD:
┌────────────────────┐
│ ⭐FEATURED         │  ← Gold badge with star
│ ┌──────────────┐  │
│ │              │  │
│ │ Product      │  │
│ │ Image        │  │
│ │              │  │
│ └──────────────┘  │
│ Premium Sofa       │
│ KES 8,500          │
│ ✓ Featured ✓       │  ← Button may say "Featured ✓"
└────────────────────┘
```

**Result:**
- [ ] Badge visible ✓
- [ ] Gold/yellow color ✓
- [ ] Positioned correctly ✓
- [ ] No console errors ✓

**If badge not showing:**
→ Hard refresh: Ctrl+Shift+R
→ Try different product
→ Check database: Is featured_listings table populated?

---

### STEP 8: LOGIN AS BUYER & VIEW MARKETPLACE (3 minutes)

**Action 8.1:**
Go to user menu (top-right)
Click "Logout"

**Expected:**
- Logged out
- Redirected to home page
- Login button visible

**Action 8.2:**
Click "Login" again

Enter:
```
Email:    buyer@test.com
Password: test123456
```

**Expected:**
- Logged in as buyer
- Dashboard/home page loads

**Action 8.3:**
Click "Marketplace" in sidebar or nav

**Expected:**
- Marketplace grid loads with 20+ products
- Featured products appear FIRST
- Your featured product should be at top

**Verify:**
Look at first 5-10 products in grid

**Expected Order:**
```
Position 1: ⭐ YOUR FEATURED PRODUCT (Premium Sofa)
Position 2: ⭐ [Any other featured products]
Position 3: Regular Product (no badge)
Position 4: Regular Product (no badge)
Position 5: Regular Product (no badge)
```

**Result:**
- [ ] Logged in as buyer ✓
- [ ] Marketplace loaded ✓
- [ ] Featured product at top ✓
- [ ] Badge visible ✓
- [ ] Badge readable ✓

**If featured product not at top:**
→ Check if featured_listings table has data
→ Refresh page (Ctrl+R)
→ Hard refresh (Ctrl+Shift+R)

---

### STEP 9: VERIFY FEATURED FILTER (2 minutes)

**Action 9.1:**
Look for gold button in Marketplace
Should say "Show Featured" or similar

**Action 9.2:**
Click "Show Featured" button

**Expected:**
- Button text changes to "Featured Only"
- Button background becomes more intense (gold)
- Grid updates to show only featured products
- "Clear Filter" link appears
- Your featured product still visible
- All non-featured products hidden

**Result:**
- [ ] Filter button visible ✓
- [ ] Click worked ✓
- [ ] Only featured shown ✓
- [ ] Count correct ✓

**Action 9.3:**
Click "Clear Filter"

**Expected:**
- Button returns to "Show Featured"
- All products displayed again
- Featured products still at top

**Result:**
- [ ] Clear filter worked ✓
- [ ] All products shown ✓

---

### STEP 10: CHECK ADMIN DASHBOARD (3 minutes)

**Action 10.1:**
Logout from buyer account

**Action 10.2:**
Login as admin:
```
Email:    info@pambo.biz
Password: [your admin password]
```

**Expected:**
- Admin account logs in
- Dashboard or admin panel loads

**Action 10.3:**
Look for "Commander Centre" or admin panel link
Click it

**Expected:**
- Admin dashboard opens
- Tab bar at top with multiple tabs
- Tabs include: Revenue, Users, Verification, Map, **⭐ Featured Listings**

**Action 10.4:**
Click "⭐ Featured Listings" tab

**Expected:**
- Tab switches to featured analytics
- Data loads (may show loading spinner first)
- KPI cards display:
  - Total Revenue: KES 500 (or more)
  - Active Featured: 1 (or count of featured)
  - Avg Revenue/Day: KES 71 (or similar)
  - Payment Mix: 100% M-Pesa (or payment methods)

**Verify Table:**
- Featured listings table shows your product
- Status shows "Active"
- Revenue shows "500"
- Payment method shows M-Pesa icon or text

**Result:**
- [ ] Admin tab accessible ✓
- [ ] Featured Listings tab exists ✓
- [ ] Analytics loaded ✓
- [ ] KPI cards showing ✓
- [ ] Product in table ✓
- [ ] Revenue accurate ✓
- [ ] No console errors ✓

---

## 🎯 LEVEL 1 TEST COMPLETE ✅

### Test Summary:
- [ ] Build verified: ✓ Zero errors
- [ ] App loads: ✓ No blank screen
- [ ] Seller can feature: ✓ Complete flow
- [ ] Badge displays: ✓ Visible to buyer
- [ ] Filter works: ✓ Featured only
- [ ] Admin sees analytics: ✓ Accurate metrics

### Total Time: ~30 minutes

### Results:
**All Tests Passed:** ✅ YES / ❌ NO

**Issues Found:**
```
[List any issues here]
```

---

## 🚀 NEXT STEPS

### If ALL Tests Pass:
→ Go to **Level 2: Comprehensive Manual Testing**
→ File: `FEATURED_LISTINGS_MANUAL_TESTING.md`
→ Time: 60 minutes
→ Coverage: 11 detailed sections

### If Some Tests Fail:
→ Document which step failed
→ Check console for errors
→ Fix code or test setup
→ Restart Level 1 from that step

### After Level 2:
→ Run Level 3: Automated Tests
→ Command: `npm run test -- featuredListings.e2e.test.ts`

### After All Levels Pass:
→ Ready for production deployment! 🎉

---

## 📞 QUICK HELP

**Button not working?**
- Refresh page
- Check console for JS errors
- Look at Network tab for failed API calls

**Modal not opening?**
- Check FeaturedListingModal.tsx exists
- Verify component imported
- Check browser console

**Badge not showing?**
- Hard refresh (Ctrl+Shift+R)
- Check featured_listings table in Supabase
- Verify isListingFeatured() service works

**Admin analytics empty?**
- Refresh page
- Make sure featured listing was created
- Check database has data

---

**Ready to start?** ➡️ This script above is your roadmap.

Follow each step exactly, mark off the checkboxes, and note any issues.

Let me know when you complete each step or if you hit any blockers! 🚀
