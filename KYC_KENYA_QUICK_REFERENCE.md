# KYC Kenya Localization - Quick Reference Card

## 📋 Document Types Changed

### BEFORE (Generic)
```
national_id        → National ID
business_permit    → Business Permit  
tax_certificate    → Tax Certificate
trade_license      → Trade License
```

### AFTER (Kenya-Specific)
```
national_id        → Kenyan National ID ✅
kra_pin            → KRA PIN Certificate (new)
cr_certificate     → CR Certificate (new)
business_license   → County Business License
```

---

## 🔐 Import Changes

### Service Import
```typescript
// OLD
import { uploadKYCDocument, getSellerKYCStatus } from '../services/kycService';

// NEW - Also import Kenya document types
import { 
  uploadKYCDocument, 
  getSellerKYCStatus, 
  KENYA_DOCUMENT_TYPES  // ✅ New constant
} from '../services/kycService';
```

### Using Kenya Document Types
```typescript
// OLD - Local definition
const DOCUMENT_TYPES = {
  national_id: { label: 'National ID', ... },
  // ...
};

// NEW - Use service constant
const DOCUMENT_TYPES = KENYA_DOCUMENT_TYPES;
```

---

## 🇰🇪 Kenya Messaging Examples

### Form Headers
```
❌ BEFORE: "Seller Verification"
✅ AFTER:  "Kenya Seller Verification"

❌ BEFORE: "Upload documents to build trust"
✅ AFTER:  "Verify your identity as a Kenyan seller"
```

### Document Labels
```
❌ BEFORE: "National ID"
✅ AFTER:  "Kenyan National ID"

❌ BEFORE: "Tax Certificate"
✅ AFTER:  "KRA PIN Certificate"

❌ BEFORE: "Business Permit"
✅ AFTER:  "CR Certificate" 
           (Kenya Corporate Registry)
```

### Status Messages
```
❌ BEFORE: "Admin will review..."
✅ AFTER:  "Kenya admin team will review..."

❌ BEFORE: "Verified"
✅ AFTER:  "Verified Kenya"

❌ BEFORE: "Trust Score: 75"
✅ AFTER:  "Trust Score: 75%"
```

---

## 📊 Trust Score Calculation - Kenya Focus

```
BEFORE (Generic):
- Verified identity         = 30 points
- business_permit approved  = 20 points
- tax_certificate approved  = 15 points

AFTER (Kenya-Optimized):
- National ID approved      = 40 points ⬆️ (primary)
- KRA PIN approved          = 20 points (tax)
- CR Certificate approved   = 20 points (business)
- Business License approved = 10 points (local)

+ Profile completion        = 20 points (name, phone, avatar, bio)
+ Ratings average           = 25 points (5-star rating × 5)
─────────────────────────────────────────
Maximum Score              = 100 points
```

---

## 🔧 Code Examples

### Getting Document Type Label (Kenya)
```typescript
// Use imported constant
const docType = 'national_id';
const label = KENYA_DOCUMENT_TYPES[docType].label;
// Output: "Kenyan National ID"

const description = KENYA_DOCUMENT_TYPES[docType].description;
// Output: "Government-issued Kenyan National Identity Card (required)"
```

### Displaying Document Type in UI
```tsx
// OLD
<span>{doc.document_type.replace('_', ' ').toUpperCase()}</span>

// NEW - Use Kenya constant
<span>
  {KENYA_DOCUMENT_TYPES[doc.document_type as keyof typeof KENYA_DOCUMENT_TYPES]?.label 
   || doc.document_type}
</span>
```

### Conditional ID Field Label
```tsx
<label className="text-sm font-semibold">
  {selectedDocType === 'national_id' ? 'Kenya ID Number *' : 'Document Number *'}
</label>

<input
  placeholder={selectedDocType === 'national_id' ? 'e.g., 12345678-0001-01' : 'e.g., 12345678'}
/>
```

---

## 📱 Kenya Phone Format (if needed)

```javascript
// Phone validation for Kenya
const KENYA_PHONE_REGEX = /^(\+254|0)[1-7]\d{8}$/;

// Valid formats:
// +254712345678
// 0712345678
// 0101234567
```

---

## 🏦 Kenya Institutions Referenced in Code

| Institution | Context | Reference |
|---|---|---|
| KRA | Kenya Revenue Authority | KRA PIN Certificate |
| Corporate Registry | Business Registration | CR Certificate |
| County Government | Local Licensing | Business License |
| Govt. ID | National Identification | National ID |

---

## ✅ Files Updated

| File | Status | Key Changes |
|---|---|---|
| `services/kycService.ts` | ✅ | Document types, trust score, messaging |
| `components/SellerKYCForm.tsx` | ✅ | Kenya title, label, form messaging |
| `components/AdminKYCQueue.tsx` | ✅ | Kenya queue title, filter options, badges |
| `components/SellerVerificationBadge.tsx` | ✅ | No changes needed (generic) |

---

## 🚀 Next Steps After Localization

1. [ ] Test seller upload with Kenya context
2. [ ] Test admin review with Kenya document types
3. [ ] Verify Kenya messaging displays correctly
4. [ ] Test trust score calculation with Kenya docs
5. [ ] Integration with Dashboard/Onboarding
6. [ ] Create admin training materials
7. [ ] Set up Kenya-specific email templates

---

## 💡 Quick Tips

**When adding new features to KYC:**
- Always use `KENYA_DOCUMENT_TYPES` for labels
- Reference "Kenyan" in titles and headers
- Mention KRA, Corporate Registry, or County context
- Use KES for currency if needed
- Always validate against Kenya phone format

**When reviewing KYC UI:**
- Look for generic phrases → replace with Kenya context
- Check `business_permit` → should be removed (now `kra_pin`, `cr_certificate`, `business_license`)
- Check `tax_certificate` → should be `kra_pin`
- Ensure all doc types match KENYA_DOCUMENT_TYPES keys

---

**Last Updated:** 2024  
**Market:** Kenya Only 🇰🇪  
**Version:** 1.0 (Complete Localization)
