-- Marketplace query index pack for scale
-- Date: 2026-02-19

-- Core listings feed/search indexes
CREATE INDEX IF NOT EXISTS idx_listings_status_createdat
ON public.listings (status, "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_listings_hub_status_createdat
ON public.listings (hub, status, "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_listings_category_status_createdat
ON public.listings (category, status, "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_listings_sellerid_createdat
ON public.listings ("sellerId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_listings_viewcount_status
ON public.listings ("viewCount" DESC, status);

CREATE INDEX IF NOT EXISTS idx_listings_price_status
ON public.listings (price, status);

-- Optional partial index for boosted/featured browsing
CREATE INDEX IF NOT EXISTS idx_listings_active_boosted_rating
ON public.listings (rating DESC, "createdAt" DESC)
WHERE status = 'active';

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_listingid_status_createdat
ON public.reviews ("listingId", status, "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_sellerid_status_createdat
ON public.reviews ("sellerId", status, "createdAt" DESC);

-- Listing comments indexes
CREATE INDEX IF NOT EXISTS idx_listing_comments_listingid_status_createdat
ON public.listing_comments ("listingId", status, "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_listing_comments_sellerid_status_createdat
ON public.listing_comments ("sellerId", status, "createdAt" DESC);
