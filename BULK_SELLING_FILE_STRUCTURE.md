# 🗂️ BULK SELLING - FILE STRUCTURE & DEPENDENCIES

## Complete File Tree

```
📦 pambo (9)
├── 📄 BULK_SELLING_GUIDE.md                    🆕 Feature overview & architecture
├── 📄 BULK_SELLING_INTEGRATION.md              🆕 Step-by-step integration guide
├── 📄 BULK_SELLING_COMPLETE_SUMMARY.md         🆕 What was built
│
├── 📂 components/
│   ├── 📄 BulkSellingModal.tsx                 🆕 Seller form to post offerings
│   ├── 📄 BulkOfferingsPanel.tsx               🆕 Buyer display component
│   └── ... (existing components)
│
├── 📂 services/
│   ├── 📄 bulkOfferingService.ts               🆕 CRUD + utility functions
│   └── ... (existing services)
│
├── 📂 supabase/
│   └── 📂 migrations/
│       └── 📄 add_bulk_offerings_tables.sql    🆕 Database schema
│
├── 📄 types.ts                                  ✏️ UPDATED (BulkOffering interface)
├── 📄 constants.ts                              ✅ Already has pricing
└── ... (existing files)
```

---

## 🔗 DEPENDENCY FLOW

### Components Dependency

```
BulkSellingModal.tsx
├─ Imports:
│  ├─ React (useState, useEffect)
│  ├─ types.ts (BulkOffering interface)
│  ├─ Lucide icons (Package, DollarSign, etc)
│  ├─ toast notifications (react-hot-toast)
│  └─ Tailwind CSS for styling
├─ Props: isOpen, onClose, onSubmit
└─ Returns: Modal form for sellers


BulkOfferingsPanel.tsx
├─ Imports:
│  ├─ React (useState, useEffect)
│  ├─ types.ts (BulkOffering interface)
│  ├─ Lucide icons (Phone, MessageCircle, MapPin, etc)
│  ├─ Tailwind CSS for styling
│  └─ Date formatting library
├─ Props: offerings[], onContact(), isLoading
└─ Returns: Grid display of offerings with contact buttons
```

### Service Dependency

```
bulkOfferingService.ts
├─ Imports:
│  ├─ supabase.ts (supabase client)
│  ├─ types.ts (BulkOffering, BulkInquiry interfaces)
│  └─ Console for logging
├─ Functions (10 main + 4 utility):
│  1. fetchBulkOfferings() ──┐
│  2. fetchBulkOfferingById()├─→ Queries bulk_offerings table
│  3. searchBulkOfferings() ─┘
│  4. createBulkOffering() ──┐
│  5. updateBulkOffering() ──├─→ Modifies bulk_offerings table
│  6. deleteBulkOffering() ──┘
│  7. respondToBulkOffering() ──→ Inserts into bulk_inquiries
│  8. getSellerBulkOfferings() ──→ Queries that seller's offerings
│  9. getBulkOfferingAnalytics() ──→ Aggregates stats
│  10. getBulkOfferingInquiries() ──→ Gets responses to offering
│  + getBulkOfferingCategories() ──→ Returns category list
│  + getBulkOfferingUnits() ──────→ Returns unit list
│  + getTopBulkOfferings() ────────→ Popular offerings
│  + updateInquiryStatus() ────────→ Updates inquiry
└─ Returns: { data, error } objects
```

### Database Dependency

```
Supabase PostgreSQL
├── bulk_offerings table
│   ├─ Columns (15):
│   │  ├─ id, seller_id, title, description, category
│   │  ├─ quantity_available, unit, price_per_unit
│   │  ├─ min_order_quantity, total_value
│   │  ├─ hub, verified_seller, status
│   │  ├─ responses_count, posted_date
│   │  └─ + 4 metadata columns
│   ├─ Indexes (5): seller_id, category, hub, status, posted_date
│   ├─ RLS Policies (6):
│   │  ├─ SELECT active (public)
│   │  ├─ SELECT own (sellers)
│   │  ├─ INSERT pro_sellers only
│   │  ├─ UPDATE own
│   │  ├─ DELETE own
│   │  └─ SELECT admin override
│   └─ Triggers (1): auto-calculate total_value
│
├── bulk_inquiries table
│   ├─ Columns (11):
│   │  └─ id, offering_id, buyer_id, buyer_name, buyer_email, buyer_phone, message, requested_quantity, status, created_at, updated_at
│   ├─ Indexes (4): offering_id, buyer_id, status, created_at
│   ├─ RLS Policies (4):
│   │  ├─ SELECT own (buyers)
│   │  ├─ SELECT seller's offers
│   │  ├─ INSERT buyers
│   │  └─ UPDATE own
│   └─ Triggers (2): increment count, update timestamp
│
└── bulk_offering_analytics table
    ├─ Columns (9)
    └─ For tracking conversion metrics per offering
```

### Type Dependency

```
types.ts
├── BulkOffering interface
│   ├─ Used by: BulkSellingModal, BulkOfferingsPanel, bulkOfferingService
│   └─ Properties (15): id, sellerId, title, description, category, quantityAvailable, unit, pricePerUnit, minOrderQuantity, totalValue, hub, verifiedSeller, status, postedDate, responses
│
└── BulkInquiry interface
    ├─ Used by: bulkOfferingService
    └─ Properties (10): id, offeringId, buyerId, buyerName, buyerEmail, buyerPhone, message, requestedQuantity, status, createdAt
```

---

## 🔀 DATA FLOW DIAGRAM

### Seller Posts Bulk Offering

```
┌──────────────────────────────────┐
│   BulkSellingModal.tsx           │  Form displayed to seller
│   (onSubmit handler called)      │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ bulkOfferingService.createBulkOffering() │  Validates subscription
│                                          │  Prepares data object
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│     Supabase Auth Check                  │  RLS: seller_id = auth.uid()
│     Subscription Check                   │  RLS: subscription_tier IN ('pro', 'enterprise')
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│  INSERT into bulk_offerings               │  Trigger fires:
│  ├─ Calculates total_value               │  - Auto-calculates total_value
│  └─ Sets posted_date = NOW()             │  - Sets timestamps
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│  Success response back to Modal          │
│  ├─ Toast: "Offering posted!"            │
│  ├─ Close modal                          │
│  └─ Refresh BulkOfferingsPanel           │
└──────────────────────────────────────────┘
```

### Buyer Browses & Inquires

```
┌──────────────────────────────────┐
│   BulkOfferingsPanel.tsx         │  Display offerings
│   (Load on mount)                │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ bulkOfferingService.fetchBulkOfferings() │  Query all active offerings
│ ├─ Filter by hub: 'wholesale'            │
│ ├─ Apply category filter if selected     │
│ ├─ Order by posted_date DESC             │
│ └─ RLS: Only sees status='active'        │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│  SELECT from bulk_offerings               │
│  WHERE status='active' AND hub='wholesale'│
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│  Response returned with [offerings]      │
│  Render BulkOfferingsPanel with data     │
│  Display: Title, Price, Stock, Seller    │
└────────────┬─────────────────────────────┘
             │
    ┌────────┴─────────┬─────────────┐
    ▼                  ▼             ▼
[Call Button]   [WhatsApp Button]  [More Info]
    │                  │             │
    └──────┬───────────┴─────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│  Buyer clicks Contact → Opens inquiry    │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────┐
│ bulkOfferingService.respondToBulkOffering()  │
│ ├─ Get buyer details from profiles          │
│ ├─ Prepare inquiry object                   │
│ └─ RLS: buyer_id = auth.uid()               │
└────────────┬─────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│  INSERT into bulk_inquiries               │  Trigger fires:
│  ├─ offering_id, buyer_id, message       │  - Increments responses_count
│  ├─ requested_quantity                   │  - Updates offering record
│  └─ status='new'                         │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│  Success response                        │
│  ├─ Toast: "Inquiry sent!"               │
│  ├─ Seller gets notification             │
│  └─ Inquiry count incremented on offering│
└──────────────────────────────────────────┘
```

---

## 📋 COMPONENT PROPS

### BulkSellingModal Props
```typescript
interface BulkSellingModalProps {
  isOpen: boolean;                          // Modal visibility
  onClose: () => void;                      // Close handler
  onSubmit: (data: BulkOfferingFormData) => Promise<void>;
}

interface BulkOfferingFormData {
  title: string;                            // Product name
  category: 'furniture' | 'decor' | ...;
  description: string;
  quantity: number;
  unit: 'units' | 'kg' | 'meters' | ...;
  pricePerUnit: number;
  minOrderQuantity: number;
}
```

### BulkOfferingsPanel Props
```typescript
interface BulkOfferingsPanelProps {
  offerings: BulkOffering[];                // Array of offerings to display
  onContact: (offering: BulkOffering) => void;  // Contact handler
  isLoading: boolean;                       // Loading state
  searchTerm?: string;                      // Optional search filter
  selectedCategory?: string;                // Optional category filter
}
```

---

## 🔄 State Management

### WholesaleHub Page State
```typescript
const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
// Toggle for BulkSellingModal visibility

const [bulkOfferings, setBulkOfferings] = useState<BulkOffering[]>([]);
// Loaded from fetchBulkOfferings()

const [isLoadingOfferings, setIsLoadingOfferings] = useState(true);
// Fetching status for skeleton loading

const [searchQuery, setSearchQuery] = useState('');
// User search input

const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
// Category filter selection
```

---

## 🎯 Integration Checklist

### Database Setup
- [ ] Run migration SQL: `add_bulk_offerings_tables.sql`
- [ ] Verify 3 tables created: bulk_offerings, bulk_inquiries, bulk_offering_analytics
- [ ] Verify indexes created (5 for offerings, 4 for inquiries)
- [ ] Verify RLS policies active
- [ ] Verify triggers created

### Frontend Setup
- [ ] Copy BulkSellingModal.tsx to components/
- [ ] Copy BulkOfferingsPanel.tsx to components/
- [ ] Copy bulkOfferingService.ts to services/
- [ ] Update types.ts with BulkOffering, BulkInquiry interfaces
- [ ] Update constants.ts (already has SUBSCRIPTION_TIERS)

### Page Setup
- [ ] Create pages/WholesaleHub.tsx (copy from BULK_SELLING_INTEGRATION.md)
- [ ] Add route in App.tsx: /wholesale
- [ ] Add navigation link in header

### Testing
- [ ] Test seller posts offering (Pro/Enterprise subscription required)
- [ ] Test buyer views offerings
- [ ] Test search & filter
- [ ] Test contact buttons (WhatsApp, Email, Phone)
- [ ] Test inquiry tracking
- [ ] Check inquiries appear in seller dashboard

---

## 📊 File Dependencies Summary

```
App.tsx
├─ Imports: WholesaleHub page
├─ Routes: /wholesale → WholesaleHub
└─ Navigation: "Wholesale Hub" link

WholesaleHub.tsx (NEW)
├─ Imports:
│  ├─ BulkSellingModal
│  ├─ BulkOfferingsPanel
│  ├─ bulkOfferingService functions
│  ├─ AuthContext (current user)
│  └─ type: BulkOffering
├─ Manages: modal state, offerings list, search/filter
└─ Handles: post new offering, contact seller

BulkSellingModal.tsx
├─ Imports: types.ts (BulkOffering)
├─ Props: isOpen, onClose, onSubmit
└─ Used by: WholesaleHub

BulkOfferingsPanel.tsx
├─ Imports: types.ts (BulkOffering)
├─ Props: offerings[], onContact, isLoading
└─ Used by: WholesaleHub

bulkOfferingService.ts
├─ Imports: types.ts (BulkOffering, BulkInquiry)
├─ Queries: bulk_offerings, bulk_inquiries tables
└─ Used by: WholesaleHub, any page needing bulk data

types.ts
├─ Exports: BulkOffering, BulkInquiry interfaces
└─ Used by: All components + services

Database
├─ Tables: bulk_offerings, bulk_inquiries, bulk_offering_analytics
├─ RLS: Secure access based on user role
├─ Triggers: Auto-calculations
└─ Used by: All bulkOfferingService functions
```

---

## 🚀 Deployment Order

1. **Database** (1 min)
   - Deploy migration: `add_bulk_offerings_tables.sql`
   - Verify tables exist

2. **Backend Services** (immediate)
   - Copy `bulkOfferingService.ts` to services/
   - Copy to types.ts update

3. **Frontend Components** (immediate)
   - Copy `BulkSellingModal.tsx` to components/
   - Copy `BulkOfferingsPanel.tsx` to components/

4. **Page & Routes** (5 min)
   - Create `WholesaleHub.tsx` from template
   - Update App.tsx routes
   - Add navigation link

5. **Test** (15 min)
   - Seller posts offering
   - Buyer browses & inquires
   - Verify data in database

6. **Launch** ✅

---

## 🎯 Quick File Reference

| What You Need | File | Status |
|---------------|------|--------|
| Seller form | `components/BulkSellingModal.tsx` | ✅ CREATED |
| Buyer display | `components/BulkOfferingsPanel.tsx` | ✅ CREATED |
| CRUD functions | `services/bulkOfferingService.ts` | ✅ CREATED |
| Database schema | `supabase/migrations/add_bulk_offerings_tables.sql` | ✅ CREATED |
| Type definitions | `types.ts` | ✅ UPDATED |
| Wholesale page | `pages/WholesaleHub.tsx` | 📋 Template provided |
| Integration guide | `BULK_SELLING_INTEGRATION.md` | ✅ CREATED |
| Feature guide | `BULK_SELLING_GUIDE.md` | ✅ CREATED |
| Summary | `BULK_SELLING_COMPLETE_SUMMARY.md` | ✅ CREATED |

All files ready for deployment! 🚀
