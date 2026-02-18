# 🛠️ Reseller Product Posting - Technical Implementation Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │ App.tsx - Main Router & State Management           │    │
│  │  • handleSaveProduct() - Database integration      │    │
│  │  • handleAddListing() - Opens AddListingModal      │    │
│  │  • productToEdit - State for edit mode             │    │
│  └────────────────────────────────────────────────────┘    │
│                         ↓                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │ AddListingModal.tsx - Product Upload Form          │    │
│  │  • Image/Gallery/Video upload with drag & drop     │    │
│  │  • Form validation                                  │    │
│  │  • AI description generation                       │    │
│  │  • Content moderation                              │    │
│  └────────────────────────────────────────────────────┘    │
│                         ↓                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Services Layer                                      │    │
│  │  • supabaseService.ts - Database operations        │    │
│  │  • geminiService.ts - AI features                  │    │
│  │  • uploadService.ts - Image/video uploads          │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE BACKEND                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │ PostgreSQL Database                                │    │
│  │  • listings table - Product records                │    │
│  │  • listing_images table - Product images           │    │
│  │  • listing_videos table - Product videos           │    │
│  │  • RLS Policies - Security rules                   │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Storage Buckets                                    │    │
│  │  • product-images - Product photos                 │    │
│  │  • product-videos - Demo videos                    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
src/
├── App.tsx                              [1,315 lines - Main app]
│   └── handleSaveProduct()              [NEW - Database integration]
│
├── components/
│   └── AddListingModal.tsx              [576 lines - Upload form]
│       ├── handleImageUpload()          [Gallery management]
│       ├── handleVideoUpload()          [Video upload]
│       ├── generateDescription()        [AI generation]
│       └── validateAndSubmit()          [Form validation]
│
├── services/
│   ├── supabaseService.ts               [488 lines - Database]
│   │   ├── createListing()              [NEW - Save new product]
│   │   ├── updateListing()              [NEW - Edit existing]
│   │   ├── getListing()                 [Fetch single product]
│   │   └── getListings()                [Fetch all products]
│   │
│   ├── geminiService.ts                 [AI features]
│   │   ├── generateProductDescription() [Auto description]
│   │   └── moderateContent()            [Content check]
│   │
│   └── uploadService.ts                 [File uploads]
│       ├── uploadProductImage()         [Image to Storage]
│       └── uploadProductVideo()         [Video to Storage]
│
├── types.ts                             [398 lines - Type definitions]
│   ├── DatabaseListing                  [Product record]
│   ├── NewListing                       [Form data]
│   └── ListingImage, ListingVideo       [Media records]
│
└── hooks/
    └── useUploadProgress.ts             [Upload status tracking]
```

---

## Data Flow: Product Creation

### 1️⃣ User Opens "Start Selling"

**File:** `src/App.tsx`

```typescript
// Line 450-460
const handleAddListing = () => {
  setProductToEdit(null);
  setShowAddListing(true);      // Opens AddListingModal
};

// In JSX (Line 800):
<button 
  onClick={handleAddListing}
  className="btn-primary"
>
  Start Selling
</button>
```

**Result:** AddListingModal component renders

---

### 2️⃣ AddListingModal Opens

**File:** `src/components/AddListingModal.tsx`

```typescript
// Line 50-80
type ListingFormData = {
  title: string;
  price: number;
  category: string;
  description: string;
  coverImage: File | null;
  images: File[];
  videos: File[];
  minOrderQty?: number;
  location: {
    county: string;
    town: string;
  };
  type: 'product' | 'service' | 'wholesale' | 'digital';
};

const [formData, setFormData] = useState<ListingFormData>({
  title: '',
  price: 0,
  category: '',
  description: '',
  coverImage: null,
  images: [],
  videos: [],
  location: { county: '', town: '' },
  type: 'product'
});
```

**User Actions Captured:**
1. Enter product title
2. Select category
3. Set price (KES)
4. Upload cover image
5. Add gallery photos
6. Upload videos
7. Write description
8. Select location
9. Choose type (Product/Wholesale/Digital)

---

### 3️⃣ User Submits Form

**File:** `src/components/AddListingModal.tsx`

```typescript
// Line 300-330
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validation
  if (!formData.title.trim()) {
    showError('Title is required');
    return;
  }
  
  if (formData.price <= 0) {
    showError('Price must be greater than 0');
    return;
  }
  
  if (!formData.coverImage) {
    showError('Cover image is required');
    return;
  }
  
  if (!formData.category) {
    showError('Please select a category');
    return;
  }
  
  // Call parent handler (App.tsx)
  onSave(formData);
};
```

**Result:** Calls `App.tsx` → `handleSaveProduct()`

---

### 4️⃣ App.tsx Processes & Saves to Database

**File:** `src/App.tsx` [NEWLY INTEGRATED]

```typescript
// Line 500-560
const handleSaveProduct = async (formData: NewListing) => {
  try {
    setIsLoading(true);
    
    // Step 1: Upload images & videos to Supabase Storage
    const coverImageUrl = await uploadProductImage(formData.coverImage);
    
    const galleryUrls = await Promise.all(
      formData.images.map(img => uploadProductImage(img))
    );
    
    const videoUrls = await Promise.all(
      formData.videos.map(vid => uploadProductVideo(vid))
    );
    
    // Step 2: Prepare database record
    const listingData = {
      seller_id: currentUser.id,
      title: formData.title,
      description: formData.description,
      price: formData.price,
      category: formData.category,
      type: formData.type,
      status: 'active',
      cover_image_url: coverImageUrl,
      location: {
        county: formData.location.county,
        town: formData.location.town
      },
      metadata: {
        images: galleryUrls,
        videos: videoUrls,
        minOrderQty: formData.minOrderQty,
        uploadedAt: new Date().toISOString()
      }
    };
    
    // Step 3: Save to Supabase database
    const dbResult = productToEdit
      ? await updateListing(productToEdit.id, listingData)
      : await createListing(listingData);
    
    if (!dbResult) {
      throw new Error('Database save failed');
    }
    
    // Step 4: Update React state for instant UI feedback
    setProducts([...products, dbResult]);
    
    // Step 5: Close modal & show success
    setShowAddListing(false);
    showSuccess('✅ Product listing published successfully!');
    
  } catch (error) {
    showError(`Failed to publish listing: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};
```

**Key Points:**
- Async/await for sequential operations
- Uploads handled in parallel with `Promise.all()`
- Database call via `supabaseService.ts`
- Error handling with user feedback
- React state updated for instant UI

---

### 5️⃣ supabaseService.ts Saves to Database

**File:** `src/services/supabaseService.ts`

```typescript
// Lines 320-380 - CREATE NEW LISTING
export async function createListing(
  listing: DatabaseListing
): Promise<DatabaseListing | null> {
  try {
    const { data, error } = await supabase
      .from('listings')
      .insert([
        {
          seller_id: listing.seller_id,
          title: listing.title,
          description: listing.description,
          price: listing.price,
          category: listing.category,
          type: listing.type,
          status: listing.status || 'pending',
          cover_image_url: listing.cover_image_url,
          location: listing.location,
          metadata: listing.metadata,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return data as DatabaseListing;
  } catch (error) {
    console.error('❌ Create listing error:', error);
    return null;
  }
}

// Lines 381-430 - UPDATE EXISTING LISTING
export async function updateListing(
  id: string,
  updates: Partial<DatabaseListing>
): Promise<DatabaseListing | null> {
  try {
    const { data, error } = await supabase
      .from('listings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('seller_id', currentUserId) // Security: Only seller can edit
      .select()
      .single();
    
    if (error) throw error;
    return data as DatabaseListing;
  } catch (error) {
    console.error('❌ Update listing error:', error);
    return null;
  }
}
```

**Database Insert:**
```sql
INSERT INTO public.listings (
  seller_id,
  title,
  description,
  price,
  category,
  type,
  status,
  cover_image_url,
  location,
  metadata,
  created_at,
  updated_at
) VALUES (
  'user-uuid-123',
  'Samsung Galaxy A12 128GB',
  'Excellent condition, sealed box',
  15000,
  'Electronics > Phones',
  'product',
  'active',
  'https://supabase.../product_123.jpg',
  '{"county": "Nairobi", "town": "Westlands"}',
  '{"images": [...], "videos": [...]}',
  '2026-02-15T10:30:00Z',
  '2026-02-15T10:30:00Z'
)
RETURNING *;
```

---

## Database Schema

### listings Table

```sql
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Seller Info
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Product Details
  title VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  category VARCHAR(100),
  type VARCHAR(50) DEFAULT 'product',  -- product|service|wholesale|digital
  status VARCHAR(50) DEFAULT 'active',  -- active|draft|sold|archived
  
  -- Media
  cover_image_url TEXT,                -- Main product image URL
  metadata JSONB,                       -- {images: [...], videos: [...], minOrderQty: ...}
  
  -- Location
  location JSONB,                       -- {county: "Nairobi", town: "Westlands"}
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  -- Search & Analytics
  view_count INT DEFAULT 0,
  contact_count INT DEFAULT 0,
  conversion_count INT DEFAULT 0,
  rating DECIMAL(3, 2),
  
  -- Indexes
  CONSTRAINT price_positive CHECK (price > 0)
);

-- Indexes for performance
CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE UNIQUE INDEX idx_listings_seller_type ON listings(seller_id, type);

-- Row-Level Security (RLS)
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Anyone can view active listings
CREATE POLICY "View active listings"
  ON listings FOR SELECT
  USING (status = 'active');

-- Only seller can edit own listings
CREATE POLICY "Update own listings"
  ON listings FOR UPDATE
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

-- Only seller can delete own listings
CREATE POLICY "Delete own listings"
  ON listings FOR DELETE
  USING (seller_id = auth.uid());
```

---

## Type Definitions

**File:** `src/types.ts`

```typescript
// Database record from Supabase
export interface DatabaseListing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  type: 'product' | 'service' | 'wholesale' | 'digital';
  status: 'active' | 'draft' | 'sold' | 'archived';
  cover_image_url: string;
  metadata: {
    images?: string[];           // Gallery image URLs
    videos?: string[];           // Video URLs
    minOrderQty?: number;        // For wholesale
    accessDuration?: number;    // For digital (days)
    licenseType?: string;       // For digital
    fileType?: string;          // For digital
  };
  location: {
    county: string;
    town: string;
  };
  created_at: string;
  updated_at: string;
  view_count?: number;
  contact_count?: number;
  conversion_count?: number;
  rating?: number;
}

// Form data from AddListingModal
export interface NewListing {
  title: string;
  description: string;
  price: number;
  category: string;
  type: 'product' | 'service' | 'wholesale' | 'digital';
  coverImage: File;
  images: File[];
  videos: File[];
  location: {
    county: string;
    town: string;
  };
  minOrderQty?: number;
  accessDuration?: number;
  licenseType?: string;
}
```

---

## Image Upload Flow

**File:** `src/services/uploadService.ts`

```typescript
export async function uploadProductImage(
  file: File,
  listingId?: string
): Promise<string> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}-${random}-${file.name}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('product-images')
      .upload(`listings/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Generate public URL
    const { data: urlData } = supabase
      .storage
      .from('product-images')
      .getPublicUrl(`listings/${fileName}`);
    
    return urlData.publicUrl;
    
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
}

// Similar for videos with larger file size limit (20MB vs 5MB)
export async function uploadProductVideo(file: File): Promise<string> {
  // Same flow, different bucket: 'product-videos'
  // Max size: 20MB
  // Formats: MP4, WebM, MOV
}
```

---

## AI Features Integration

### Auto-Generate Description

**File:** `src/services/geminiService.ts`

```typescript
export async function generateProductDescription(
  title: string,
  category: string
): Promise<string> {
  try {
    const prompt = `You are a professional product description writer for an e-commerce marketplace.
    
Product Title: ${title}
Category: ${category}

Write a compelling, concise product description (max 500 characters) that:
1. Highlights key features
2. Uses natural language
3. Includes call-to-action
4. Is optimized for SEO
5. Mentions quality/condition assumptions`;

    const result = await model.generateContent(prompt);
    const description = result.response.text();
    
    return description;
    
  } catch (error) {
    console.error('❌ Description generation failed:', error);
    throw error;
  }
}
```

### Content Moderation

```typescript
export async function moderateContent(
  title: string,
  description: string,
  category: string
): Promise<{ approved: boolean; reason?: string }> {
  try {
    const prompt = `Review this product listing for policy compliance:
    
Title: ${title}
Description: ${description}
Category: ${category}

Check for:
1. Illegal items (weapons, counterfeit, stolen goods)
2. Hate speech or discrimination
3. Misleading claims
4. Spam or low quality
5. Adult content

Respond with JSON: { "approved": boolean, "reason": "explanation if rejected" }`;

    const result = await model.generateContent(prompt);
    const response = JSON.parse(result.response.text());
    
    return response;
    
  } catch (error) {
    console.error('Moderation error:', error);
    return { approved: false, reason: 'Moderation check failed' };
  }
}
```

---

## Error Handling

```typescript
// In App.tsx handleSaveProduct()
try {
  // ... upload and save logic
} catch (error) {
  if (error instanceof StorageError) {
    showError('❌ Image upload failed. File too large?');
  } else if (error instanceof DatabaseError) {
    showError('❌ Failed to save product. Please try again.');
  } else if (error instanceof NetworkError) {
    showError('❌ Connection lost. Check your internet.');
  } else {
    showError(`❌ Error: ${error.message}`);
  }
} finally {
  setIsLoading(false);
}
```

---

## Performance Optimizations

### 1. Image Compression
```typescript
// Compress images before upload
const compressed = await compressImage(file, {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8
});
```

### 2. Parallel Uploads
```typescript
// Upload gallery images in parallel (not sequential)
const galleryUrls = await Promise.all(
  formData.images.map(img => uploadProductImage(img))
);
```

### 3. Database Indexing
```sql
-- Speeds up seller's products query
CREATE INDEX idx_listings_seller_created 
ON listings(seller_id, created_at DESC);
```

### 4. Lazy Loading
```typescript
// Only load visible products
const [visibleProducts, setVisibleProducts] = useState(10);
const handleLoadMore = () => setVisibleProducts(prev => prev + 10);
```

---

## Monitoring & Analytics

**Track Product Posting Success:**

```typescript
// Log successful upload
analytics.track('product_listed', {
  productId: dbResult.id,
  sellerId: currentUser.id,
  category: formData.category,
  type: formData.type,
  uploadTime: Date.now() - startTime,
  imageCount: formData.images.length,
  videoCount: formData.videos.length
});

// Track failures
analytics.track('product_upload_failed', {
  reason: error.message,
  stage: 'database' // or 'image_upload' or 'validation'
});
```

---

## Testing

### Unit Tests - AddListingModal

```typescript
// __tests__/AddListingModal.test.ts
describe('AddListingModal', () => {
  test('Should validate required fields', () => {
    const { getByText } = render(<AddListingModal />);
    fireEvent.click(getByText('Publish'));
    expect(screen.getByText('Title is required')).toBeInTheDocument();
  });
  
  test('Should handle image upload', async () => {
    const file = new File(['test'], 'image.png');
    const input = screen.getByLabelText('Cover Image');
    fireEvent.change(input, { target: { files: [file] } });
    expect(input.files[0]).toEqual(file);
  });
});
```

### Integration Tests - Database

```typescript
// __tests__/createListing.integration.test.ts
describe('supabaseService.createListing', () => {
  test('Should create listing in database', async () => {
    const listing = {
      seller_id: testUser.id,
      title: 'Test Phone',
      price: 15000,
      ...
    };
    
    const result = await createListing(listing);
    expect(result.id).toBeDefined();
    expect(result.title).toBe('Test Phone');
  });
});
```

---

## Deployment Checklist

- [ ] Database schema migrated to Supabase
- [ ] RLS policies enabled
- [ ] Storage buckets created (product-images, product-videos)
- [ ] CORS configured for storage
- [ ] Gemini API credentials configured
- [ ] Image compression library installed
- [ ] Error boundaries added to AddListingModal
- [ ] Loading states implemented
- [ ] Success/error messages tested
- [ ] Mobile responsive tested
- [ ] Image optimization pipeline verified
- [ ] Analytics tracking implemented

---

## Migration SQL

**File:** `supabase/migrations/add_listings_table.sql`

```sql
-- Create listings table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL CHECK (price > 0),
  category VARCHAR(100),
  type VARCHAR(50) DEFAULT 'product',
  status VARCHAR(50) DEFAULT 'active',
  cover_image_url TEXT,
  metadata JSONB DEFAULT '{}',
  location JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  view_count INT DEFAULT 0,
  contact_count INT DEFAULT 0,
  conversion_count INT DEFAULT 0,
  rating DECIMAL(3, 2)
);

-- Enable RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "View active listings" ON listings
  FOR SELECT USING (status = 'active');

CREATE POLICY "Update own listings" ON listings
  FOR UPDATE USING (seller_id = auth.uid());

CREATE POLICY "Delete own listings" ON listings
  FOR DELETE USING (seller_id = auth.uid());

-- Indexes
CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Next Steps

1. **Deploy Database:** Run migration SQL to Supabase
2. **Test Upload:** Use AddListingModal to post test product
3. **Verify Database:** Check listings table in Supabase Dashboard
4. **Run Tests:** `npm run test` to verify all functionality
5. **Manual Testing:** Full user flow end-to-end
6. **Monitor:** Track analytics and error rates

---

**Built with ❤️ for Pambo Marketplace**

*Last updated: February 15, 2026*
