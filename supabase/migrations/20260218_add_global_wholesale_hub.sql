-- =====================================================
-- GLOBAL WHOLESALE HUB (7TH HUB) - MVP SCHEMA
-- =====================================================
-- Purpose:
-- - Add Kenya-first, cross-border B2B wholesale entities
-- - Support supplier verification, listings, RFQ, quotes,
--   orders, staged payments, and disputes
-- =====================================================

BEGIN;

-- 1) SUPPLIERS
CREATE TABLE IF NOT EXISTS public.wholesale_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (verification_status IN ('pending_review', 'verified', 'rejected')),
  verification_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- 2) WHOLESALE LISTINGS
CREATE TABLE IF NOT EXISTS public.wholesale_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.wholesale_suppliers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  country_of_origin TEXT NOT NULL,
  moq INTEGER NOT NULL CHECK (moq > 0),
  unit TEXT NOT NULL DEFAULT 'pcs',
  price_tiers JSONB NOT NULL DEFAULT '[]'::jsonb,
  lead_time_days_min INTEGER CHECK (lead_time_days_min >= 0),
  lead_time_days_max INTEGER CHECK (lead_time_days_max >= 0),
  incoterm TEXT CHECK (incoterm IN ('EXW', 'FOB', 'CIF')),
  port_of_loading TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3) RFQ
CREATE TABLE IF NOT EXISTS public.wholesale_rfqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.wholesale_listings(id) ON DELETE SET NULL,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  target_price NUMERIC,
  destination_country TEXT NOT NULL,
  destination_city TEXT,
  requirements TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'negotiating', 'closed', 'converted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4) QUOTES
CREATE TABLE IF NOT EXISTS public.wholesale_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES public.wholesale_rfqs(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.wholesale_suppliers(id) ON DELETE CASCADE,
  quoted_quantity NUMERIC NOT NULL CHECK (quoted_quantity > 0),
  unit_price NUMERIC NOT NULL CHECK (unit_price > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  incoterm TEXT CHECK (incoterm IN ('EXW', 'FOB', 'CIF')),
  lead_time_days INTEGER CHECK (lead_time_days >= 0),
  valid_until TIMESTAMPTZ,
  terms_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'sent'
    CHECK (status IN ('sent', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5) ORDERS
CREATE TABLE IF NOT EXISTS public.wholesale_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.wholesale_suppliers(id) ON DELETE CASCADE,
  quote_id UUID NOT NULL REFERENCES public.wholesale_quotes(id) ON DELETE RESTRICT,
  order_status TEXT NOT NULL DEFAULT 'pending_deposit'
    CHECK (order_status IN (
      'pending_deposit',
      'in_production',
      'shipped',
      'delivered',
      'completed',
      'cancelled',
      'disputed'
    )),
  total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  deposit_amount NUMERIC NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0),
  balance_amount NUMERIC NOT NULL DEFAULT 0 CHECK (balance_amount >= 0),
  shipping_terms_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6) PAYMENTS
CREATE TABLE IF NOT EXISTS public.wholesale_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.wholesale_orders(id) ON DELETE CASCADE,
  payment_stage TEXT NOT NULL CHECK (payment_stage IN ('deposit', 'balance', 'refund')),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  provider TEXT,
  provider_ref TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7) DISPUTES
CREATE TABLE IF NOT EXISTS public.wholesale_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.wholesale_orders(id) ON DELETE CASCADE,
  opened_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason_code TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'opened'
    CHECK (status IN ('opened', 'under_review', 'resolved_release', 'resolved_refund')),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8) REVIEWS (BUYER -> LISTING)
CREATE TABLE IF NOT EXISTS public.wholesale_listing_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.wholesale_listings(id) ON DELETE CASCADE,
  reviewer_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  moderation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  moderation_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9) COMMENTS (BUYER -> LISTING)
CREATE TABLE IF NOT EXISTS public.wholesale_listing_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.wholesale_listings(id) ON DELETE CASCADE,
  commenter_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  moderation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  moderation_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10) CATEGORIES
CREATE TABLE IF NOT EXISTS public.wholesale_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11) HUB SETTINGS
CREATE TABLE IF NOT EXISTS public.wholesale_hub_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_wholesale_suppliers_user_id ON public.wholesale_suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_suppliers_status ON public.wholesale_suppliers(verification_status);
CREATE INDEX IF NOT EXISTS idx_wholesale_listings_supplier_id ON public.wholesale_listings(supplier_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_listings_status ON public.wholesale_listings(status);
CREATE INDEX IF NOT EXISTS idx_wholesale_listings_category ON public.wholesale_listings(category);
CREATE INDEX IF NOT EXISTS idx_wholesale_rfqs_buyer_id ON public.wholesale_rfqs(buyer_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_rfqs_status ON public.wholesale_rfqs(status);
CREATE INDEX IF NOT EXISTS idx_wholesale_quotes_rfq_id ON public.wholesale_quotes(rfq_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_quotes_supplier_id ON public.wholesale_quotes(supplier_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_orders_buyer_id ON public.wholesale_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_orders_supplier_id ON public.wholesale_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_orders_status ON public.wholesale_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_wholesale_payments_order_id ON public.wholesale_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_disputes_order_id ON public.wholesale_disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_disputes_status ON public.wholesale_disputes(status);
CREATE INDEX IF NOT EXISTS idx_wholesale_reviews_listing_id ON public.wholesale_listing_reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_reviews_status ON public.wholesale_listing_reviews(moderation_status);
CREATE INDEX IF NOT EXISTS idx_wholesale_comments_listing_id ON public.wholesale_listing_comments(listing_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_comments_status ON public.wholesale_listing_comments(moderation_status);
CREATE INDEX IF NOT EXISTS idx_wholesale_categories_active ON public.wholesale_categories(is_active);

-- UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_wholesale_suppliers_updated_at ON public.wholesale_suppliers;
CREATE TRIGGER trg_wholesale_suppliers_updated_at
BEFORE UPDATE ON public.wholesale_suppliers
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_wholesale_listings_updated_at ON public.wholesale_listings;
CREATE TRIGGER trg_wholesale_listings_updated_at
BEFORE UPDATE ON public.wholesale_listings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_wholesale_rfqs_updated_at ON public.wholesale_rfqs;
CREATE TRIGGER trg_wholesale_rfqs_updated_at
BEFORE UPDATE ON public.wholesale_rfqs
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_wholesale_orders_updated_at ON public.wholesale_orders;
CREATE TRIGGER trg_wholesale_orders_updated_at
BEFORE UPDATE ON public.wholesale_orders
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_wholesale_reviews_updated_at ON public.wholesale_listing_reviews;
CREATE TRIGGER trg_wholesale_reviews_updated_at
BEFORE UPDATE ON public.wholesale_listing_reviews
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_wholesale_comments_updated_at ON public.wholesale_listing_comments;
CREATE TRIGGER trg_wholesale_comments_updated_at
BEFORE UPDATE ON public.wholesale_listing_comments
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_wholesale_categories_updated_at ON public.wholesale_categories;
CREATE TRIGGER trg_wholesale_categories_updated_at
BEFORE UPDATE ON public.wholesale_categories
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.wholesale_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesale_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesale_rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesale_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesale_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesale_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesale_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesale_listing_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesale_listing_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesale_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesale_hub_settings ENABLE ROW LEVEL SECURITY;

-- Basic policies (MVP-safe defaults)
DROP POLICY IF EXISTS wholesale_listings_public_read ON public.wholesale_listings;
CREATE POLICY wholesale_listings_public_read
ON public.wholesale_listings FOR SELECT
USING (status = 'active');

DROP POLICY IF EXISTS wholesale_suppliers_owner_manage ON public.wholesale_suppliers;
CREATE POLICY wholesale_suppliers_owner_manage
ON public.wholesale_suppliers FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS wholesale_listings_supplier_manage ON public.wholesale_listings;
CREATE POLICY wholesale_listings_supplier_manage
ON public.wholesale_listings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.wholesale_suppliers ws
    WHERE ws.id = wholesale_listings.supplier_id
      AND ws.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.wholesale_suppliers ws
    WHERE ws.id = wholesale_listings.supplier_id
      AND ws.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS wholesale_rfqs_buyer_manage ON public.wholesale_rfqs;
CREATE POLICY wholesale_rfqs_buyer_manage
ON public.wholesale_rfqs FOR ALL
USING (auth.uid() = buyer_id)
WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS wholesale_quotes_supplier_manage ON public.wholesale_quotes;
CREATE POLICY wholesale_quotes_supplier_manage
ON public.wholesale_quotes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.wholesale_suppliers ws
    WHERE ws.id = wholesale_quotes.supplier_id
      AND ws.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.wholesale_suppliers ws
    WHERE ws.id = wholesale_quotes.supplier_id
      AND ws.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS wholesale_orders_buyer_read ON public.wholesale_orders;
CREATE POLICY wholesale_orders_buyer_read
ON public.wholesale_orders FOR SELECT
USING (auth.uid() = buyer_id);

DROP POLICY IF EXISTS wholesale_orders_supplier_read ON public.wholesale_orders;
CREATE POLICY wholesale_orders_supplier_read
ON public.wholesale_orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.wholesale_suppliers ws
    WHERE ws.id = wholesale_orders.supplier_id
      AND ws.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS wholesale_disputes_buyer_insert ON public.wholesale_disputes;
CREATE POLICY wholesale_disputes_buyer_insert
ON public.wholesale_disputes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.wholesale_orders wo
    WHERE wo.id = wholesale_disputes.order_id
      AND wo.buyer_id = auth.uid()
  )
  AND auth.uid() = opened_by_user_id
);

DROP POLICY IF EXISTS wholesale_reviews_public_read ON public.wholesale_listing_reviews;
CREATE POLICY wholesale_reviews_public_read
ON public.wholesale_listing_reviews FOR SELECT
USING (moderation_status = 'approved');

DROP POLICY IF EXISTS wholesale_reviews_buyer_insert ON public.wholesale_listing_reviews;
CREATE POLICY wholesale_reviews_buyer_insert
ON public.wholesale_listing_reviews FOR INSERT
WITH CHECK (auth.uid() = reviewer_user_id);

DROP POLICY IF EXISTS wholesale_comments_public_read ON public.wholesale_listing_comments;
CREATE POLICY wholesale_comments_public_read
ON public.wholesale_listing_comments FOR SELECT
USING (moderation_status = 'approved');

DROP POLICY IF EXISTS wholesale_comments_buyer_insert ON public.wholesale_listing_comments;
CREATE POLICY wholesale_comments_buyer_insert
ON public.wholesale_listing_comments FOR INSERT
WITH CHECK (auth.uid() = commenter_user_id);

DROP POLICY IF EXISTS wholesale_categories_public_read ON public.wholesale_categories;
CREATE POLICY wholesale_categories_public_read
ON public.wholesale_categories FOR SELECT
USING (is_active = TRUE);

DROP POLICY IF EXISTS wholesale_hub_settings_public_read ON public.wholesale_hub_settings;
CREATE POLICY wholesale_hub_settings_public_read
ON public.wholesale_hub_settings FOR SELECT
USING (TRUE);

-- Seed default categories if empty
INSERT INTO public.wholesale_categories (name, slug, is_active)
SELECT * FROM (
  VALUES
    ('Electronics', 'electronics', TRUE),
    ('Textiles', 'textiles', TRUE),
    ('Furniture', 'furniture', TRUE),
    ('Food & Beverages', 'food-beverages', TRUE),
    ('Cosmetics', 'cosmetics', TRUE),
    ('Hardware', 'hardware', TRUE),
    ('Auto Parts', 'auto-parts', TRUE),
    ('Machinery', 'machinery', TRUE)
) AS seed(name, slug, is_active)
ON CONFLICT (slug) DO NOTHING;

COMMIT;

-- =====================================================
-- Notes:
-- - Admin/service-role workflows (payment release, dispute resolution)
--   should be executed by backend with service key.
-- - Extend policies per your production auth model as needed.
-- =====================================================
