-- =====================================================
-- RESTORE KENYA WHOLESALE HUB (LOCAL KENYA MODULE)
-- =====================================================
-- Purpose:
-- - Restore Kenya -> Kenya wholesale as a separate module
-- - Keep ImportLink Global separate for international trade
-- - Add seller pages, followers, product comments, and moderation
-- =====================================================

BEGIN;

-- 1) SELLER PROFILES (PUBLIC SELLER PAGE DATA)
CREATE TABLE IF NOT EXISTS public.bulk_seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  seller_name TEXT NOT NULL,
  contact_phone TEXT,
  whatsapp_number TEXT,
  business_location TEXT,
  approval_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (approval_status IN ('pending', 'approved', 'suspended', 'rejected')),
  approval_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2) ENHANCE LOCAL WHOLESALE LISTINGS
ALTER TABLE public.bulk_offerings
  ADD COLUMN IF NOT EXISTS photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS videos JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS moderation_notes TEXT,
  ADD COLUMN IF NOT EXISTS comments_count INTEGER NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bulk_offerings_photos_limit'
  ) THEN
    ALTER TABLE public.bulk_offerings
      ADD CONSTRAINT bulk_offerings_photos_limit
      CHECK (jsonb_typeof(photos) = 'array' AND jsonb_array_length(photos) <= 10);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bulk_offerings_videos_limit'
  ) THEN
    ALTER TABLE public.bulk_offerings
      ADD CONSTRAINT bulk_offerings_videos_limit
      CHECK (jsonb_typeof(videos) = 'array' AND jsonb_array_length(videos) <= 2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bulk_offerings_moderation_status_check'
  ) THEN
    ALTER TABLE public.bulk_offerings
      ADD CONSTRAINT bulk_offerings_moderation_status_check
      CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'suspended'));
  END IF;
END $$;

-- 3) SELLER FOLLOWERS (BUYERS FOLLOW SELLERS)
CREATE TABLE IF NOT EXISTS public.bulk_seller_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  follower_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (seller_id, follower_user_id)
);

-- 4) PRODUCT COMMENTS
CREATE TABLE IF NOT EXISTS public.bulk_offering_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offering_id UUID NOT NULL REFERENCES public.bulk_offerings(id) ON DELETE CASCADE,
  commenter_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  moderation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'suspended')),
  moderation_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_bulk_seller_profiles_seller_id ON public.bulk_seller_profiles(seller_id);
CREATE INDEX IF NOT EXISTS idx_bulk_seller_profiles_status ON public.bulk_seller_profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_bulk_offerings_moderation_status ON public.bulk_offerings(moderation_status);
CREATE INDEX IF NOT EXISTS idx_bulk_followers_seller_id ON public.bulk_seller_followers(seller_id);
CREATE INDEX IF NOT EXISTS idx_bulk_followers_follower_id ON public.bulk_seller_followers(follower_user_id);
CREATE INDEX IF NOT EXISTS idx_bulk_comments_offering_id ON public.bulk_offering_comments(offering_id);
CREATE INDEX IF NOT EXISTS idx_bulk_comments_status ON public.bulk_offering_comments(moderation_status);

-- UPDATED AT
CREATE OR REPLACE FUNCTION public.set_kenya_wholesale_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bulk_seller_profiles_updated_at ON public.bulk_seller_profiles;
CREATE TRIGGER trg_bulk_seller_profiles_updated_at
BEFORE UPDATE ON public.bulk_seller_profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_kenya_wholesale_updated_at();

DROP TRIGGER IF EXISTS trg_bulk_offering_comments_updated_at ON public.bulk_offering_comments;
CREATE TRIGGER trg_bulk_offering_comments_updated_at
BEFORE UPDATE ON public.bulk_offering_comments
FOR EACH ROW
EXECUTE FUNCTION public.set_kenya_wholesale_updated_at();

-- COUNTER HELPERS
CREATE OR REPLACE FUNCTION public.refresh_bulk_offering_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  target_offering UUID;
BEGIN
  target_offering := COALESCE(NEW.offering_id, OLD.offering_id);

  UPDATE public.bulk_offerings bo
  SET comments_count = (
    SELECT COUNT(*)
    FROM public.bulk_offering_comments c
    WHERE c.offering_id = target_offering
      AND c.moderation_status = 'approved'
  )
  WHERE bo.id = target_offering;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_bulk_comments_count_ins ON public.bulk_offering_comments;
CREATE TRIGGER trg_bulk_comments_count_ins
AFTER INSERT ON public.bulk_offering_comments
FOR EACH ROW
EXECUTE FUNCTION public.refresh_bulk_offering_comments_count();

DROP TRIGGER IF EXISTS trg_bulk_comments_count_upd ON public.bulk_offering_comments;
CREATE TRIGGER trg_bulk_comments_count_upd
AFTER UPDATE ON public.bulk_offering_comments
FOR EACH ROW
EXECUTE FUNCTION public.refresh_bulk_offering_comments_count();

DROP TRIGGER IF EXISTS trg_bulk_comments_count_del ON public.bulk_offering_comments;
CREATE TRIGGER trg_bulk_comments_count_del
AFTER DELETE ON public.bulk_offering_comments
FOR EACH ROW
EXECUTE FUNCTION public.refresh_bulk_offering_comments_count();

CREATE OR REPLACE FUNCTION public.refresh_bulk_seller_followers_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  target_seller UUID;
BEGIN
  target_seller := COALESCE(NEW.seller_id, OLD.seller_id);

  UPDATE public.users u
  SET followers = (
    SELECT COALESCE(array_agg(f.follower_user_id::text ORDER BY f.created_at), ARRAY[]::text[])
    FROM public.bulk_seller_followers f
    WHERE f.seller_id = target_seller
  )
  WHERE u.id = target_seller;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_bulk_followers_count_ins ON public.bulk_seller_followers;
CREATE TRIGGER trg_bulk_followers_count_ins
AFTER INSERT ON public.bulk_seller_followers
FOR EACH ROW
EXECUTE FUNCTION public.refresh_bulk_seller_followers_count();

DROP TRIGGER IF EXISTS trg_bulk_followers_count_del ON public.bulk_seller_followers;
CREATE TRIGGER trg_bulk_followers_count_del
AFTER DELETE ON public.bulk_seller_followers
FOR EACH ROW
EXECUTE FUNCTION public.refresh_bulk_seller_followers_count();

-- RLS
ALTER TABLE public.bulk_seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_seller_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_offering_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bulk_seller_profiles_public_read ON public.bulk_seller_profiles;
CREATE POLICY bulk_seller_profiles_public_read
ON public.bulk_seller_profiles FOR SELECT
USING (approval_status = 'approved');

DROP POLICY IF EXISTS bulk_seller_profiles_owner_manage ON public.bulk_seller_profiles;
CREATE POLICY bulk_seller_profiles_owner_manage
ON public.bulk_seller_profiles FOR ALL
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS bulk_offerings_public_approved_read ON public.bulk_offerings;
CREATE POLICY bulk_offerings_public_approved_read
ON public.bulk_offerings FOR SELECT
USING (status = 'active' AND moderation_status = 'approved');

DROP POLICY IF EXISTS bulk_followers_public_read ON public.bulk_seller_followers;
CREATE POLICY bulk_followers_public_read
ON public.bulk_seller_followers FOR SELECT
USING (TRUE);

DROP POLICY IF EXISTS bulk_followers_buyer_manage ON public.bulk_seller_followers;
CREATE POLICY bulk_followers_buyer_manage
ON public.bulk_seller_followers FOR ALL
USING (auth.uid() = follower_user_id)
WITH CHECK (auth.uid() = follower_user_id);

DROP POLICY IF EXISTS bulk_comments_public_read ON public.bulk_offering_comments;
CREATE POLICY bulk_comments_public_read
ON public.bulk_offering_comments FOR SELECT
USING (moderation_status = 'approved');

DROP POLICY IF EXISTS bulk_comments_buyer_insert ON public.bulk_offering_comments;
CREATE POLICY bulk_comments_buyer_insert
ON public.bulk_offering_comments FOR INSERT
WITH CHECK (auth.uid() = commenter_user_id);

COMMIT;

-- =====================================================
-- Notes:
-- - This migration restores Kenya Wholesale Hub as local module.
-- - ImportLink Global remains separate under wholesale_* tables.
-- - Admin moderation should run with service role via backend routes.
-- =====================================================
