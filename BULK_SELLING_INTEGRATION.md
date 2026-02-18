# 🚀 BULK SELLING INTEGRATION GUIDE

## Step-by-Step Integration into Wholesale Hub

### Prerequisites
✅ Database tables created: `bulk_offerings`, `bulk_inquiries` (from migration)
✅ Service functions ready: `bulkOfferingService.ts`
✅ Components ready: `BulkSellingModal.tsx`, `BulkOfferingsPanel.tsx`
✅ Types updated: `types.ts` (BulkOffering interface)

---

## STEP 1: Update App.tsx Routes

If using React Router, add a new route for Wholesale Hub with Bulk Selling:

```typescript
// In App.tsx or Router configuration

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WholesaleHub from './pages/WholesaleHub';

<Routes>
  {/* ... other routes ... */}
  <Route path="/wholesale" element={<WholesaleHub />} />
</Routes>
```

---

## STEP 2: Create WholesaleHub Page Component

Create a new file: `pages/WholesaleHub.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, MessageCircle } from 'lucide-react';
import { BulkSellingModal } from '../components/BulkSellingModal';
import { BulkOfferingsPanel } from '../components/BulkOfferingsPanel';
import { useAuth } from '../contexts/AuthContext'; // Or your auth context
import { fetchBulkOfferings, createBulkOffering } from '../services/bulkOfferingService';
import type { BulkOffering } from '../types';
import toast from 'react-hot-toast'; // Or your toast library

const WholesaleHub: React.FC = () => {
  const { user } = useAuth();
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkOfferings, setBulkOfferings] = useState<BulkOffering[]>([]);
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Load bulk offerings on mount
  useEffect(() => {
    loadBulkOfferings();
  }, []);

  const loadBulkOfferings = async () => {
    setIsLoadingOfferings(true);
    try {
      const result = await fetchBulkOfferings('wholesale', selectedCategory);
      setBulkOfferings(result.data);
      if (result.error) {
        console.error('Error loading offerings:', result.error);
      }
    } catch (error) {
      console.error('Failed to load offerings:', error);
    } finally {
      setIsLoadingOfferings(false);
    }
  };

  const handlePostBulkOffering = async (formData: any) => {
    try {
      // Check subscription tier
      if (!user || !['pro', 'enterprise'].includes(user.subscription_tier)) {
        toast.error('Upgrade to Pro or Enterprise to post bulk offerings');
        return;
      }

      const offering: Omit<BulkOffering, 'id' | 'postedDate' | 'updatedDate' | 'responses'> = {
        sellerId: user.id,
        sellerName: user.name || 'Anonymous',
        sellerPhone: user.phone,
        sellerEmail: user.email,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        quantityAvailable: parseInt(formData.quantity),
        unit: formData.unit,
        pricePerUnit: parseFloat(formData.pricePerUnit),
        minOrderQuantity: parseInt(formData.minOrderQuantity),
        totalValue: parseInt(formData.quantity) * parseFloat(formData.pricePerUnit),
        hub: 'wholesale',
        verifiedSeller: user.verified || false,
        status: 'active',
      };

      const result = await createBulkOffering(offering);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('✅ Bulk offering posted successfully!');
      setIsBulkModalOpen(false);

      // Reload offerings
      await loadBulkOfferings();
    } catch (error) {
      console.error('Error posting offering:', error);
      toast.error('Failed to post bulk offering');
    }
  };

  const handleContactOffering = (offering: BulkOffering) => {
    // Open WhatsApp inquiry form or email
    const message = `Hi ${offering.sellerName}, I'm interested in your bulk offering: ${offering.title}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${offering.sellerPhone}?text=${encodedMessage}`, '_blank');
  };

  // Filter offerings based on search
  const filteredOfferings = bulkOfferings.filter(offering =>
    offering.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    offering.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-gray-900">
              📦 Wholesale Hub
            </h1>
            {user && ['pro', 'enterprise'].includes(user.subscription_tier) && (
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Package size={20} />
                Post Bulk Offering
              </button>
            )}
          </div>

          {/* Search & Filter */}
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Search offerings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedCategory ?? ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="furniture">Furniture</option>
              <option value="decor">Decor</option>
              <option value="textiles">Textiles</option>
              <option value="electronics">Electronics</option>
              <option value="machinery">Machinery</option>
              <option value="raw-materials">Raw Materials</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Offerings</p>
                <p className="text-2xl font-bold text-gray-900">{bulkOfferings.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {(bulkOfferings.reduce((sum, o) => sum + o.totalValue, 0) / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageCircle size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Inquiries</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bulkOfferings.reduce((sum, o) => sum + o.responses, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Offerings Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Latest Bulk Offerings
          </h2>
          <BulkOfferingsPanel
            offerings={filteredOfferings}
            onContact={handleContactOffering}
            isLoading={isLoadingOfferings}
          />
        </div>
      </div>

      {/* Modal */}
      <BulkSellingModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSubmit={handlePostBulkOffering}
      />
    </div>
  );
};

export default WholesaleHub;
```

---

## STEP 3: Add Navigation Link to Main App

In your main navigation/header component:

```typescript
// In components/Navigation.tsx or equivalent

<nav className="flex gap-6">
  <a href="/marketplace" className="hover:text-blue-600">Marketplace</a>
  <a href="/wholesale" className="hover:text-blue-600">📦 Wholesale</a>
  <a href="/profile" className="hover:text-blue-600">Profile</a>
</nav>
```

---

## STEP 4: Add Seller Dashboard Integration

In your Seller Dashboard, add a section to manage bulk offerings:

```typescript
// In pages/SellerDashboard.tsx

const [activeTab, setActiveTab] = useState('listings');

{activeTab === 'bulk-offerings' && (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold">My Bulk Offerings</h2>
      <button
        onClick={() => setShowBulkModal(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        New Bulk Offering
      </button>
    </div>

    {sellerBulkOfferings.length === 0 ? (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Package size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No bulk offerings yet</h3>
        <p className="text-gray-600 mb-4">Post your first bulk offering to reach wholesale buyers</p>
        <button
          onClick={() => setShowBulkModal(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          Post Bulk Offering
        </button>
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-4">
        {sellerBulkOfferings.map(offering => (
          <div key={offering.id} className="bg-white p-6 rounded-lg border">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{offering.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{offering.category}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                offering.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {offering.status}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-xs text-gray-600">Available Qty</p>
                <p className="text-lg font-semibold">{offering.quantityAvailable} {offering.unit}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Price/Unit</p>
                <p className="text-lg font-semibold">KES {offering.pricePerUnit.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Value</p>
                <p className="text-lg font-semibold">KES {(offering.totalValue / 1000).toFixed(0)}K</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Inquiries</p>
                <p className="text-lg font-semibold">{offering.responses}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Edit
              </button>
              <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                View Inquiries
              </button>
              <button className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
```

---

## STEP 5: Update Types (if not already done)

Ensure `types.ts` has the `BulkOffering` interface:

```typescript
export interface BulkOffering {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
  title: string;
  description: string;
  category: string;
  quantityAvailable: number;
  unit: string;
  pricePerUnit: number;
  minOrderQuantity: number;
  totalValue: number;
  hub: string;
  verifiedSeller: boolean;
  postedDate: string;
  updatedDate?: string;
  responses: number;
  status: 'active' | 'sold_out' | 'inactive' | 'paused';
}

export interface BulkInquiry {
  id: string;
  offeringId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  message: string;
  requestedQuantity: number;
  status: 'new' | 'replied' | 'converted' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}
```

---

## STEP 6: Run Database Migration

Deploy the migration to Supabase:

```bash
# Push migration to Supabase
supabase migration up

# Or manually run the SQL in Supabase dashboard:
# 1. Go to Supabase → SQL Editor
# 2. Copy contents of: supabase/migrations/add_bulk_offerings_tables.sql
# 3. Run the query
```

Verify tables created:

```sql
-- Run in Supabase SQL Editor
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'bulk_%';

-- Expected output:
-- bulk_offering_analytics
-- bulk_inquiries
-- bulk_offerings
```

---

## STEP 7: Test the Integration

### 1️⃣ Test Seller Flow
```
1. Log in as seller (Pro/Enterprise subscription)
2. Go to /wholesale
3. Click "Post Bulk Offering"
4. Fill form with test data
5. Submit → Should create offering in database
6. Check offering appears on BulkOfferingsPanel
```

### 2️⃣ Test Buyer Flow
```
1. Log in as buyer
2. Go to /wholesale
3. Browse bulk offerings
4. Search/filter offerings
5. Click "Call" → Opens WhatsApp
6. Click "More Info" → Opens email form
7. Submit inquiry → Creates row in bulk_inquiries table
```

### 3️⃣ Test Seller Inquiry Management
```
1. Log in as seller
2. Go to SellerDashboard
3. Click on bulk offering
4. View inquiries from buyers
5. Reply to inquiry
6. Update inquiry status
```

---

## STEP 8: Connect to M-Pesa (Optional)

Add Featured Bulk Offering Payment (KES 500 for 7 days):

```typescript
// In BulkSellingModal or Wholesale Hub

const handleFeatureBulkOffering = async (offeringId: string) => {
  try {
    // Initiate M-Pesa payment for featured bulk offering
    const phoneNumber = user.phone.replace(/^0/, '254'); // 0712345678 → 254712345678

    const response = await supabase.functions.invoke('initiate-mpesa', {
      body: {
        phone_number: phoneNumber,
        amount: 500, // KES
        description: 'Feature Bulk Offering (7 days)',
        reference: `FEATURE-BULK-${offeringId}`,
      },
    });

    if (response.error) {
      toast.error('Payment failed');
      return;
    }

    toast.success('Payment initiated. Check your phone for M-Pesa prompt');
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to initiate payment');
  }
};
```

---

## STEP 9: Add Analytics Dashboard (Admin)

Create admin analytics for bulk offerings:

```typescript
// In AdminDashboard.tsx

const [bulkStats, setBulkStats] = useState({
  activeOfferings: 0,
  totalValue: 0,
  totalInquiries: 0,
  conversionRate: 0,
});

useEffect(() => {
  loadBulkAnalytics();
}, []);

const loadBulkAnalytics = async () => {
  const { data: offerings } = await supabase
    .from('bulk_offerings')
    .select('*')
    .eq('status', 'active');

  const { data: inquiries } = await supabase
    .from('bulk_inquiries')
    .select('*');

  const { data: converted } = await supabase
    .from('bulk_inquiries')
    .select('*')
    .eq('status', 'converted');

  const stats = {
    activeOfferings: offerings?.length || 0,
    totalValue: offerings?.reduce((sum, o) => sum + o.total_value, 0) || 0,
    totalInquiries: inquiries?.length || 0,
    conversionRate: inquiries?.length ? (converted?.length / inquiries.length) * 100 : 0,
  };

  setBulkStats(stats);
};
```

---

## CHECKLIST

- [ ] Database migration deployed
- [ ] Service functions created (`bulkOfferingService.ts`)
- [ ] Components created (`BulkSellingModal.tsx`, `BulkOfferingsPanel.tsx`)
- [ ] Types updated (`types.ts`)
- [ ] WholesaleHub page created
- [ ] Routes configured
- [ ] Navigation links added
- [ ] Seller dashboard integrated
- [ ] Bulk offerings appearing on wholesale hub ✅
- [ ] Search/filter working ✅
- [ ] Contact buttons working (WhatsApp, Email) ✅
- [ ] Create offering flow tested ✅
- [ ] Inquiries being saved to database ✅
- [ ] Admin dashboard updated (optional)
- [ ] M-Pesa featured offering payment added (optional)

---

## NEXT STEPS

1. ✅ Run feature test suite
2. ✅ Invite test sellers to post offerings
3. ✅ Invite test buyers to make inquiries
4. ✅ Monitor performance metrics
5. 🚀 Launch Bulk Selling to production

