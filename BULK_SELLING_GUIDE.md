# 🏭 BULK SELLING FEATURE GUIDE

## Overview
**Bulk Selling** enables sellers to post wholesale offerings in the **Wholesale Hub**. Instead of individual product listings, sellers can post bulk quantities with volume pricing - perfect for reaching buyers who need large quantities.

Example: "I have 500 office chairs available at KES 5,000 per unit, minimum order 10 units"

---

## KEY FEATURES

### For Sellers (RIGHT SIDE - SUPPLY)
✅ Post bulk offerings with:
- Product title & detailed description
- Category (Furniture, Decor, Electronics, etc.)
- Total quantity available
- Unit type (units, kg, meters, sets, boxes, tons)
- Price per unit
- Minimum order quantity
- Total value if sold out

✅ Manage:
- View inquiries count
- Track responses from buyers
- Update availability status
- Pause/reactivate offerings

✅ Sell to:
- Wholesale buyers across Africa
- Resellers & retailers
- Corporate buyers

### For Buyers (LEFT SIDE - DEMAND)
✅ Browse:
- Filter by category
- Search bulk offerings
- View seller details
- Check quantity & pricing

✅ Contact:
- Click "Call" → WhatsApp direct message
- "WhatsApp" → Opens WhatsApp chat with pre-filled message
- "More Info" → Email inquiry form

---

## DATABASE STRUCTURE

### bulk_offerings Table (New)
```sql
CREATE TABLE bulk_offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.users(id),
  seller_name VARCHAR(255),
  seller_phone VARCHAR(20),
  seller_email VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  quantity_available INTEGER NOT NULL,
  unit VARCHAR(50), -- units, kg, meters, liters, sets, pieces, boxes, tons
  price_per_unit DECIMAL(10,2) NOT NULL,
  min_order_quantity INTEGER DEFAULT 1,
  total_value DECIMAL(15,2),
  hub VARCHAR(50), -- wholesale, services, digital
  verified_seller BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'active', -- active, sold_out, inactive
  responses_count INTEGER DEFAULT 0,
  posted_date TIMESTAMP DEFAULT NOW(),
  updated_date TIMESTAMP DEFAULT NOW(),
  
  -- RLS
  created_by UUID REFERENCES auth.users(id),
  
  -- Indexes
  INDEX idx_seller_id ON seller_id,
  INDEX idx_category ON category,
  INDEX idx_hub ON hub,
  INDEX idx_status ON status,
  INDEX idx_posted_date ON posted_date DESC
);
```

### bulk_inquiries Table (For tracking responses)
```sql
CREATE TABLE bulk_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offering_id UUID REFERENCES bulk_offerings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.users(id),
  buyer_name VARCHAR(255),
  buyer_email VARCHAR(255),
  buyer_phone VARCHAR(20),
  message TEXT,
  requested_quantity INTEGER,
  status VARCHAR(50) DEFAULT 'new', -- new, replied, converted, rejected
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## COMPONENT INTEGRATION

### 1️⃣ **BulkSellingModal.tsx** (Seller View)
Location: `components/BulkSellingModal.tsx`
- Form for sellers to post bulk offerings
- Fields: title, category, description, quantity, unit, price, min_order
- Triggers when seller clicks "Post Bulk Offering" in Wholesale dashboard

### 2️⃣ **BulkOfferingsPanel.tsx** (Wholesale Hub Display)
Location: `components/BulkOfferingsPanel.tsx`
- Displays all active bulk offerings
- Features: search, category filter, stock info cards
- Contact buttons: Call, WhatsApp, More Info
- Shows verified badges, inquiry counts, posted dates

### 3️⃣ **Integration Points**
```typescript
// In App.tsx or WholesaleView.tsx
import { BulkSellingModal } from './components/BulkSellingModal';
import { BulkOfferingsPanel } from './components/BulkOfferingsPanel';

// Seller posts offering
const handlePostBulkOffering = async (data) => {
  const offering: BulkOffering = {
    id: uuid(),
    sellerId: user.id,
    sellerName: user.name,
    sellerPhone: user.phone,
    ...data,
    totalValue: data.quantity * data.pricePerUnit,
    postedDate: new Date().toISOString(),
  };
  
  // Save to bulk_offerings table
  await supabase.from('bulk_offerings').insert([offering]);
  
  // Show success
  toast.success('Bulk offering posted!');
};

// Buyers browse offerings
const [bulkOfferings, setBulkOfferings] = useState<BulkOffering[]>([]);

useEffect(() => {
  fetchBulkOfferings();
}, []);

const fetchBulkOfferings = async () => {
  const { data } = await supabase
    .from('bulk_offerings')
    .select('*')
    .eq('status', 'active')
    .order('posted_date', { ascending: false });
  
  setBulkOfferings(data);
};
```

---

## USER FLOWS

### 🛍️ BUYER: Browse & Inquire
```
1. Log in as Buyer
2. Navigate to Wholesale Hub
3. View "Latest Bulk Offerings" section
4. Search/filter offerings
5. Click product card
6. Choose contact method:
   - "Call" → Phone call (for urgent inquiries)
   - "WhatsApp" → Pre-filled message with product details
   - "More Info" → Email form with bulk inquiry template
7. Seller receives inquiry → Can reply with custom pricing/terms
```

### 📦 SELLER: Post & Manage Bulk Offering
```
1. Log in as Seller (must have Pro/Enterprise subscription)
2. Go to Wholesale Dashboard
3. Click "Post Bulk Offering"
4. Fill form:
   - Product name: "Premium Leather Office Chairs"
   - Category: Furniture
   - Description: Material, colors, features
   - Quantity: 500 units
   - Unit: units
   - Price: KES 5,000/unit
   - Min Order: 10 units
5. Click "Post Bulk Offering"
6. Offering appears in Wholesale Hub
7. Track inquiries dashboard
8. Respond to buyers directly (WhatsApp/Email)
```

---

## PRICING & ACCESS

### Subscription Requirements
| Tier | Bulk Selling | Max Offerings | Featured |
|------|-------------|---------------|----------|
| **Free** | ❌ No | - | - |
| **Starter (KES 3,500/mo)** | ❌ No | - | - |
| **Pro (KES 5,000/mo)** | ✅ Yes | 20 | Optional: KES 500/week |
| **Enterprise (KES 9,000/mo)** | ✅ Yes | Unlimited | Optional: KES 500/week |

### Optional: Featured Bulk Offerings
- Similar to Featured Listings
- Cost: KES 500 for 7 days
- Moves offering to top of Wholesale Hub
- Shows special badge: ⭐ FEATURED BULK OFFER

---

## RLS (ROW LEVEL SECURITY) POLICIES

```sql
-- Buyers can see all active offerings
CREATE POLICY "bulk_offerings_select_buyers"
ON bulk_offerings FOR SELECT
USING (status = 'active' OR auth.uid() = seller_id);

-- Sellers can only post if they have Pro/Enterprise subscription
CREATE POLICY "bulk_offerings_insert_pro_sellers"
ON bulk_offerings FOR INSERT
WITH CHECK (
  auth.uid() = seller_id AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND subscription_tier IN ('pro', 'enterprise')
  )
);

-- Sellers can only edit/delete their own offerings
CREATE POLICY "bulk_offerings_update_own"
ON bulk_offerings FOR UPDATE
USING (auth.uid() = seller_id);

CREATE POLICY "bulk_offerings_delete_own"
ON bulk_offerings FOR DELETE
USING (auth.uid() = seller_id);
```

---

## MESSAGING TEMPLATES

### WhatsApp Pre-Filled Message
```
Hi {seller_name}, I'm interested in your bulk offering:

📦 {title}
Quantity Available: {qty} {unit}
Price: KES {price}/unit
Minimum Order: {min_qty} {unit}

Can you provide more details about:
- Delivery timeline
- Payment terms
- Bulk discounts for larger orders

Looking forward to hearing from you!
```

### Email Inquiry Form
```
Subject: Inquiry - {offering_title}

Dear {seller_name},

I'm interested in purchasing bulk quantities of your {offering_title}.

Offering Details:
- Quantity Available: {qty} {unit}
- Unit Price: KES {price}
- Minimum Order: {min_qty} {unit}

Could you provide:
1. Detailed product specifications
2. Available payment methods
3. Delivery options & timeline
4. Volume discounts (if buying more than {qty})
5. Lead time for next available stock

Best regards,
{buyer_name}
{buyer_email}
{buyer_phone}
```

---

## ANALYTICS (Admin Dashboard)

Track:
- Total bulk offerings posted this month
- Total bulk demand value (KES)
- Most popular categories
- Most successful sellers (by response rate)
- Conversion rate (inquiries → sales)
- Average bulk order size

```typescript
// Admin Dashboard Widget
<div className="grid grid-cols-4 gap-4">
  <StatCard
    label="Active Bulk Offerings"
    value={bulkStats.activeOfferings}
    icon={<Package />}
  />
  <StatCard
    label="Total Bulk Value"
    value={`KES ${(bulkStats.totalValue / 1000000).toFixed(1)}M`}
    icon={<TrendingUp />}
  />
  <StatCard
    label="Total Inquiries"
    value={bulkStats.totalInquiries}
    icon={<MessageCircle />}
  />
  <StatCard
    label="Avg Unit Price"
    value={`KES ${bulkStats.avgPrice.toLocaleString()}`}
    icon={<DollarSign />}
  />
</div>
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Backend (Database)
- [ ] Create `bulk_offerings` table
- [ ] Create `bulk_inquiries` table
- [ ] Add RLS policies
- [ ] Create indexes for performance
- [ ] Seed some test data (5-10 offerings)

### Phase 2: Frontend - Seller Side
- [ ] Build `BulkSellingModal.tsx` ✅ DONE
- [ ] Add "Post Bulk Offering" button to Seller Dashboard
- [ ] Add validation: Check seller has Pro/Enterprise subscription
- [ ] Show success/error messages
- [ ] Add seller dashboard view to see own offerings
- [ ] Add response tracking widget

### Phase 3: Frontend - Buyer Side
- [ ] Build `BulkOfferingsPanel.tsx` ✅ DONE
- [ ] Integrate into Wholesale Hub
- [ ] Add search & filter functionality
- [ ] Add contact buttons (Call, WhatsApp, Email)
- [ ] Show inquiry count on each offering
- [ ] Load offerings on tab switch

### Phase 4: Integration
- [ ] Update App.tsx routing
- [ ] Link navigation buttons
- [ ] Test full flow: Post → Browse → Contact
- [ ] Add to Featured Listings validation

### Phase 5: Admin Features
- [ ] Dashboard stats widgets
- [ ] Moderation board (flag inappropriate offerings)
- [ ] Analytics reports

---

## CODE EXAMPLE: Full Integration

```typescript
// In App.tsx or WholesaleHub.tsx

import { BulkSellingModal } from './components/BulkSellingModal';
import { BulkOfferingsPanel, BulkOffering } from './components/BulkOfferingsPanel';

const WholesaleView = () => {
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkOfferings, setBulkOfferings] = useState<BulkOffering[]>([]);
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(false);

  useEffect(() => {
    // Fetch bulk offerings when component mounts
    fetchBulkOfferings();
  }, []);

  const fetchBulkOfferings = async () => {
    setIsLoadingOfferings(true);
    try {
      const { data } = await supabase
        .from('bulk_offerings')
        .select('*')
        .eq('status', 'active')
        .order('posted_date', { ascending: false })
        .limit(100);
      
      setBulkOfferings(data || []);
    } catch (error) {
      console.error('Error fetching bulk offerings:', error);
    } finally {
      setIsLoadingOfferings(false);
    }
  };

  const handlePostBulkOffering = async (formData) => {
    try {
      // Validate subscription
      if (user.subscription_tier !== 'pro' && user.subscription_tier !== 'enterprise') {
        toast.error('Upgrade to Pro to post bulk offerings');
        return;
      }

      const newOffering: BulkOffering = {
        id: crypto.randomUUID(),
        sellerId: user.id,
        sellerName: user.name,
        sellerPhone: user.phone,
        sellerEmail: user.email,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        quantityAvailable: formData.quantity,
        unit: formData.unit,
        pricePerUnit: formData.pricePerUnit,
        minOrderQuantity: formData.minOrderQuantity,
        totalValue: formData.quantity * formData.pricePerUnit,
        hub: 'wholesale',
        postedDate: new Date().toISOString(),
        verifiedSeller: user.verified,
        status: 'active',
      };

      const { error } = await supabase
        .from('bulk_offerings')
        .insert([newOffering]);

      if (error) throw error;

      toast.success('Bulk offering posted! 🎉');
      setIsBulkModalOpen(false);
      
      // Refresh offerings
      await fetchBulkOfferings();
    } catch (error) {
      toast.error('Failed to post bulk offering');
    }
  };

  const handleContactOffering = (offering: BulkOffering) => {
    // Open email form or WhatsApp inquiry
    console.log('Contact offering:', offering);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Wholesale Hub</h1>
        {user.subscription_tier && user.subscription_tier !== 'free' && (
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
          >
            + Post Bulk Offering
          </button>
        )}
      </div>

      {/* Bulk Offerings Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">📦 Latest Bulk Offerings</h2>
        <BulkOfferingsPanel
          offerings={bulkOfferings}
          onContact={handleContactOffering}
          isLoading={isLoadingOfferings}
        />
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

export default WholesaleView;
```

---

## NEXT STEPS

1. ✅ Create database tables (bulk_offerings, bulk_inquiries)
2. ✅ Add RLS policies
3. ✅ Build UI components (BulkSellingModal, BulkOfferingsPanel)
4. ⏳ Integrate into App.tsx
5. ⏳ Test end-to-end flow
6. ⏳ Add to subscription tier gates
7. ⏳ Launch with admin dashboard

---

**Status**: 🚀 Ready to integrate into Wholesale Hub
