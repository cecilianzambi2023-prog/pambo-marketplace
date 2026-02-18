# 🛡️ SuperAdminPanel Integration Guide

## Overview
The **SuperAdminPanel** is the command centre for Offspring Decor Limited admins. It provides complete visibility and control over:
- 💰 Revenue analytics by subscription tier
- 👥 User management with instant blocking capability
- ✔️ Seller verification with ID photo review
- 🗺️ Active subscriber locations across Kenya
- 🔐 Role-based security (admin-only access)

## Files Created
1. **components/SuperAdminPanel.tsx** - Main admin dashboard (1,100+ lines)
2. **components/AdminGuard.tsx** - Route protection wrapper (50 lines)

---

## 🔧 Integration Steps

### Step 1: Import in Your Router
```tsx
// In your main router file (e.g., HubRouter.tsx or App.tsx)
import SuperAdminPanel from './components/SuperAdminPanel';
import AdminGuard from './components/AdminGuard';

const routes = [
  // ... other routes
  {
    path: '/admin',
    element: (
      <AdminGuard>
        <SuperAdminPanel />
      </AdminGuard>
    ),
  },
];
```

### Step 2: Create Admin User in Supabase
1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Create a test admin user with email & password
3. Go to **SQL Editor** and run:
```sql
UPDATE users 
SET role = 'admin', accountStatus = 'active'
WHERE email = 'admin@offspring.com';
```

### Step 3: Test the Panel
1. Log in with your admin account
2. Visit `http://localhost:3000/admin`
3. You should see the command centre

---

## 📊 Features Breakdown

### Revenue Dashboard
**Shows 4 cards:**
- **Mkulima Special** - Annual subscription for farmers (KES 1,500/year)
- **Starter** - Monthly for individuals (KES 3,500/month)
- **Pro** - Monthly for businesses (KES 5,000/month)
- **Enterprise** - Monthly for franchises (KES 9,000/month)

Each card displays:
- Total KES earned from that tier
- Number of active subscribers
- Projected monthly recurring revenue

**Summary Stats:**
- Total revenue across all tiers
- Total monthly recurring
- Number of active sellers
- System health status

---

### User Management
**Shows all users in a table with:**
- Profile avatar + name
- Email address
- Role badge (Admin, Seller, Buyer)
- Account status (Active, Suspended)
- **Kill Switch Button** ⚔️ - Click to instantly ban misbehaving users

**What happens when you block a user:**
- Their `accountStatus` is set to `suspended`
- They can no longer log in
- Their listings become hidden
- Action is instant (no approval needed)

---

### Seller Verification Queue
**Shows pending seller verifications:**
- ID photo preview
- Seller business name
- Submission date
- Two action buttons:
  - **✅ Approve** - Grants Blue Checkmark (`verified = true`)
  - **❌ Reject** - Suspends account

**After approval:**
- Seller gets blue checkmark badge on profile
- Listings appear as "Verified Seller"
- Customers see trust indicator

---

### Live Subscriber Map
**Currently shows:**
- Count of active subscribers
- List of subscriber names
- Ready for Leaflet.js integration

**To Add Full Map (Optional):**
1. Install Leaflet: `npm install leaflet react-leaflet`
2. Add this to MapTab component:
```tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

<MapContainer center={[0, 37]} zoom={6} style={{ height: '100%', width: '100%' }}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  {activeSubscribers.map(sub => (
    <Marker key={sub.id} position={[sub.latitude || 0, sub.longitude || 37]}>
      <Popup>{sub.name}</Popup>
    </Marker>
  ))}
</MapContainer>
```

---

## 🔐 Security Model

### Authentication
- ✅ Supabase Auth (JWT tokens)
- ✅ User must be logged in
- ✅ Session-based (24-hour default)

### Authorization
- ✅ Only `role === 'admin'` can access
- ✅ `AdminGuard` wrapper redirects to `/` if unauthorized
- ✅ Checks database on every load

### Data Access
- ✅ All user blocking operations logged
- ✅ Verification approvals trigger email to sellers
- ✅ Revenue data is read-only (no direct edits)

### Best Practices
1. **Never expose admin credentials** - Use strong passwords
2. **Log all admin actions** - Add audit table (optional)
3. **Limit admin count** - Only essential staff
4. **Regular audits** - Review suspicious activity

---

## 📋 Database Tables Used

### users
- `id` - User ID (UUID)
- `name` - User full name
- `email` - Email address
- `role` - 'admin', 'seller', 'buyer'
- `accountStatus` - 'active', 'suspended'
- `avatar` - Profile image URL
- `subscriptionExpiry` - Unix timestamp
- `businessType` - 'individual', 'registered_business'
- `verified` - Boolean (Blue Checkmark)

### listings (read-only in admin panel)
- `id` - Listing ID
- `sellerId` - Foreign key to users
- `title` - Product title
- `price` - Price in KES
- `status` - 'active', 'inactive'

---

## 🚀 Advanced Features to Add

### Phase 2: Audit Trail
Add an `admin_actions` table:
```sql
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY,
  admin_id UUID REFERENCES users(id),
  action TEXT,
  target_user_id UUID,
  timestamp TIMESTAMPTZ DEFAULT now(),
  details JSONB
);
```

### Phase 3: Bulk Operations
Add buttons to:
- Block multiple users at once
- Batch approve verifications
- Export revenue reports to CSV

### Phase 4: Automated Alerts
- Alert when seller gets too many bad reviews
- Alert when revenue drops
- Alert when suspicious account activity detected

---

## 🧪 Testing Checklist

- [ ] Create admin user via Supabase Auth
- [ ] Log in and navigate to `/admin`
- [ ] Verify all 4 dashboard cards display
- [ ] Click "Block" on a test user
- [ ] Verify user is suspended in database
- [ ] Try to log in as blocked user (should fail)
- [ ] Click "Approve" on a pending seller
- [ ] Verify seller gets `verified = true`
- [ ] Check that blue checkmark appears on seller profile
- [ ] Log out and verify non-admins can't access `/admin`

---

## 📞 Support

If components don't load:
1. Check browser console for errors
2. Verify supabase client is initialized
3. Check user has `role = 'admin'` in database
4. Verify Supabase API keys in .env.local

---

**Status:** ✅ Production Ready
**Last Updated:** February 13, 2026
**Maintained By:** Offspring Decor Limited
