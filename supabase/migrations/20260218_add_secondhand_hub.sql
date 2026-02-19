-- =====================================================
-- SECONDHAND ITEMS HUB (LOCAL KENYA)
-- =====================================================
-- Purpose:
-- - C2C used / pre-owned listings with direct contact
-- - Seller pages, comments, favorites, moderation
-- - Category groups from small to very large items
-- =====================================================

BEGIN;

-- 1) SELLER PROFILES
CREATE TABLE IF NOT EXISTS public.secondhand_seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  seller_name TEXT NOT NULL,
  contact_phone TEXT,
  whatsapp_number TEXT,
  email TEXT,
  county TEXT,
  city TEXT,
  approval_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (approval_status IN ('pending', 'approved', 'suspended', 'rejected')),
  approval_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2) LISTINGS
CREATE TABLE IF NOT EXISTS public.secondhand_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  seller_name TEXT NOT NULL,
  seller_phone TEXT,
  seller_whatsapp TEXT,
  seller_email TEXT,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  condition TEXT NOT NULL
    CHECK (condition IN ('new', 'like_new', 'used', 'fair')),
  category TEXT,
  county TEXT,
  city TEXT,
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  videos JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'sold', 'inactive')),
  moderation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'suspended')),
  moderation_notes TEXT,
  views_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'secondhand_listings_photos_limit'
  ) THEN
    ALTER TABLE public.secondhand_listings
      ADD CONSTRAINT secondhand_listings_photos_limit
      CHECK (jsonb_typeof(photos) = 'array' AND jsonb_array_length(photos) <= 10);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'secondhand_listings_videos_limit'
  ) THEN
    ALTER TABLE public.secondhand_listings
      ADD CONSTRAINT secondhand_listings_videos_limit
      CHECK (jsonb_typeof(videos) = 'array' AND jsonb_array_length(videos) <= 2);
  END IF;
END $$;

-- 3) COMMENTS
CREATE TABLE IF NOT EXISTS public.secondhand_listing_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.secondhand_listings(id) ON DELETE CASCADE,
  commenter_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  moderation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'suspended')),
  moderation_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4) FAVORITES
CREATE TABLE IF NOT EXISTS public.secondhand_listing_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.secondhand_listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (listing_id, user_id)
);

-- 5) CATEGORIES
CREATE TABLE IF NOT EXISTS public.secondhand_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  group_name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_secondhand_profiles_seller_id ON public.secondhand_seller_profiles(seller_id);
CREATE INDEX IF NOT EXISTS idx_secondhand_profiles_status ON public.secondhand_seller_profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_secondhand_listings_seller_id ON public.secondhand_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_secondhand_listings_status ON public.secondhand_listings(status);
CREATE INDEX IF NOT EXISTS idx_secondhand_listings_moderation ON public.secondhand_listings(moderation_status);
CREATE INDEX IF NOT EXISTS idx_secondhand_listings_category ON public.secondhand_listings(category);
CREATE INDEX IF NOT EXISTS idx_secondhand_comments_listing_id ON public.secondhand_listing_comments(listing_id);
CREATE INDEX IF NOT EXISTS idx_secondhand_comments_status ON public.secondhand_listing_comments(moderation_status);
CREATE INDEX IF NOT EXISTS idx_secondhand_favorites_listing ON public.secondhand_listing_favorites(listing_id);
CREATE INDEX IF NOT EXISTS idx_secondhand_favorites_user ON public.secondhand_listing_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_secondhand_categories_group ON public.secondhand_categories(group_name);
CREATE INDEX IF NOT EXISTS idx_secondhand_categories_active ON public.secondhand_categories(is_active);

-- UPDATED AT TRIGGERS
CREATE OR REPLACE FUNCTION public.set_secondhand_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_secondhand_profiles_updated_at ON public.secondhand_seller_profiles;
CREATE TRIGGER trg_secondhand_profiles_updated_at
BEFORE UPDATE ON public.secondhand_seller_profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_secondhand_updated_at();

DROP TRIGGER IF EXISTS trg_secondhand_listings_updated_at ON public.secondhand_listings;
CREATE TRIGGER trg_secondhand_listings_updated_at
BEFORE UPDATE ON public.secondhand_listings
FOR EACH ROW
EXECUTE FUNCTION public.set_secondhand_updated_at();

DROP TRIGGER IF EXISTS trg_secondhand_comments_updated_at ON public.secondhand_listing_comments;
CREATE TRIGGER trg_secondhand_comments_updated_at
BEFORE UPDATE ON public.secondhand_listing_comments
FOR EACH ROW
EXECUTE FUNCTION public.set_secondhand_updated_at();

DROP TRIGGER IF EXISTS trg_secondhand_categories_updated_at ON public.secondhand_categories;
CREATE TRIGGER trg_secondhand_categories_updated_at
BEFORE UPDATE ON public.secondhand_categories
FOR EACH ROW
EXECUTE FUNCTION public.set_secondhand_updated_at();

-- COMMENTS COUNT
CREATE OR REPLACE FUNCTION public.refresh_secondhand_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  target_listing UUID;
BEGIN
  target_listing := COALESCE(NEW.listing_id, OLD.listing_id);

  UPDATE public.secondhand_listings sl
  SET comments_count = (
    SELECT COUNT(*)
    FROM public.secondhand_listing_comments c
    WHERE c.listing_id = target_listing
      AND c.moderation_status = 'approved'
  )
  WHERE sl.id = target_listing;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_secondhand_comments_count_ins ON public.secondhand_listing_comments;
CREATE TRIGGER trg_secondhand_comments_count_ins
AFTER INSERT ON public.secondhand_listing_comments
FOR EACH ROW
EXECUTE FUNCTION public.refresh_secondhand_comments_count();

DROP TRIGGER IF EXISTS trg_secondhand_comments_count_upd ON public.secondhand_listing_comments;
CREATE TRIGGER trg_secondhand_comments_count_upd
AFTER UPDATE ON public.secondhand_listing_comments
FOR EACH ROW
EXECUTE FUNCTION public.refresh_secondhand_comments_count();

DROP TRIGGER IF EXISTS trg_secondhand_comments_count_del ON public.secondhand_listing_comments;
CREATE TRIGGER trg_secondhand_comments_count_del
AFTER DELETE ON public.secondhand_listing_comments
FOR EACH ROW
EXECUTE FUNCTION public.refresh_secondhand_comments_count();

-- RLS
ALTER TABLE public.secondhand_seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secondhand_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secondhand_listing_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secondhand_listing_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secondhand_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS secondhand_profiles_public_read ON public.secondhand_seller_profiles;
CREATE POLICY secondhand_profiles_public_read
ON public.secondhand_seller_profiles FOR SELECT
USING (approval_status = 'approved');

DROP POLICY IF EXISTS secondhand_profiles_owner_manage ON public.secondhand_seller_profiles;
CREATE POLICY secondhand_profiles_owner_manage
ON public.secondhand_seller_profiles FOR ALL
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS secondhand_listings_public_read ON public.secondhand_listings;
CREATE POLICY secondhand_listings_public_read
ON public.secondhand_listings FOR SELECT
USING (status = 'active' AND moderation_status = 'approved');

DROP POLICY IF EXISTS secondhand_listings_owner_manage ON public.secondhand_listings;
CREATE POLICY secondhand_listings_owner_manage
ON public.secondhand_listings FOR ALL
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS secondhand_comments_public_read ON public.secondhand_listing_comments;
CREATE POLICY secondhand_comments_public_read
ON public.secondhand_listing_comments FOR SELECT
USING (moderation_status = 'approved');

DROP POLICY IF EXISTS secondhand_comments_buyer_insert ON public.secondhand_listing_comments;
CREATE POLICY secondhand_comments_buyer_insert
ON public.secondhand_listing_comments FOR INSERT
WITH CHECK (auth.uid() = commenter_user_id);

DROP POLICY IF EXISTS secondhand_favorites_owner_manage ON public.secondhand_listing_favorites;
CREATE POLICY secondhand_favorites_owner_manage
ON public.secondhand_listing_favorites FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS secondhand_categories_public_read ON public.secondhand_categories;
CREATE POLICY secondhand_categories_public_read
ON public.secondhand_categories FOR SELECT
USING (is_active = TRUE);

-- SEED CATEGORIES
INSERT INTO public.secondhand_categories (name, slug, group_name, sort_order, is_active)
SELECT * FROM (
  VALUES
    ('Phones & Accessories', 'phones-accessories', 'Small Items', 10, TRUE),
    ('Electronics', 'electronics', 'Small Items', 20, TRUE),
    ('Clothing & Shoes', 'clothing-shoes', 'Small Items', 30, TRUE),
    ('Watches & Jewelry', 'watches-jewelry', 'Small Items', 40, TRUE),
    ('Books & Office Items', 'books-office', 'Small Items', 50, TRUE),
    ('Gaming Consoles', 'gaming-consoles', 'Small Items', 60, TRUE),
    ('Cameras & Drones', 'cameras-drones', 'Small Items', 70, TRUE),
    ('Baby & Kids', 'baby-kids', 'Small Items', 80, TRUE),
    ('Sports & Fitness', 'sports-fitness', 'Small Items', 90, TRUE),
    ('Musical Instruments', 'musical-instruments', 'Small Items', 100, TRUE),
    ('Beauty & Personal Care', 'beauty-personal-care', 'Small Items', 110, TRUE),
    ('Pet Supplies', 'pet-supplies', 'Small Items', 120, TRUE),
    ('Furniture', 'furniture', 'Medium Items', 10, TRUE),
    ('Home Appliances', 'home-appliances', 'Medium Items', 20, TRUE),
    ('Tools & Equipment', 'tools-equipment', 'Medium Items', 30, TRUE),
    ('Motorbikes & Bicycles', 'motorbikes-bicycles', 'Medium Items', 40, TRUE),
    ('Kitchenware', 'kitchenware', 'Medium Items', 50, TRUE),
    ('Lighting & Decor', 'lighting-decor', 'Medium Items', 60, TRUE),
    ('Mattresses', 'mattresses', 'Medium Items', 70, TRUE),
    ('Office Furniture', 'office-furniture', 'Medium Items', 80, TRUE),
    ('Garden & Outdoor', 'garden-outdoor', 'Medium Items', 90, TRUE),
    ('Generators', 'generators', 'Medium Items', 100, TRUE),
    ('Solar & Inverters', 'solar-inverters', 'Medium Items', 110, TRUE),
    ('Cars & SUVs', 'cars-suvs', 'Large Items', 10, TRUE),
    ('Trucks & Buses', 'trucks-buses', 'Large Items', 20, TRUE),
    ('Construction Machinery', 'construction-machinery', 'Large Items', 30, TRUE),
    ('Farm Equipment', 'farm-equipment', 'Large Items', 40, TRUE),
    ('Car Parts & Accessories', 'car-parts-accessories', 'Large Items', 50, TRUE),
    ('Tires & Rims', 'tires-rims', 'Large Items', 60, TRUE),
    ('Caravans & Trailers', 'caravans-trailers', 'Large Items', 70, TRUE),
    ('Storage Containers', 'storage-containers', 'Large Items', 80, TRUE),
    ('Retail Fixtures', 'retail-fixtures', 'Large Items', 90, TRUE),
    ('Boats & Yachts', 'boats-yachts', 'Very Large Items', 10, TRUE),
    ('Aircraft & Helicopters', 'aircraft-helicopters', 'Very Large Items', 20, TRUE),
    ('Industrial Machines', 'industrial-machines', 'Very Large Items', 30, TRUE),
    ('Heavy Assets', 'heavy-assets', 'Very Large Items', 40, TRUE),
    ('Manufacturing Lines', 'manufacturing-lines', 'Very Large Items', 50, TRUE),
    ('Printing Presses', 'printing-presses', 'Very Large Items', 60, TRUE),
    ('Mining Equipment', 'mining-equipment', 'Very Large Items', 70, TRUE),
    ('Oil & Gas Equipment', 'oil-gas-equipment', 'Very Large Items', 80, TRUE)
) AS seed(name, slug, group_name, sort_order, is_active)
ON CONFLICT (slug) DO NOTHING;

COMMIT;

-- =====================================================
-- Notes:
-- - This hub is Kenya-only, contact-based (no checkout).
-- - Admin moderation should use service role via backend.
-- =====================================================
