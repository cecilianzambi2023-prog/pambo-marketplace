-- Followers table for tracking who follows which professional
CREATE TABLE followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_follower UNIQUE (follower_id, professional_id),
  CONSTRAINT no_self_follow CHECK (follower_id != professional_id)
);

-- Portfolio table for professional galleries (images + video)
CREATE TABLE professional_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,                    -- "Kitchen Renovation Project"
  description TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,                -- URL to S3/Supabase storage
  thumbnail_url TEXT,                     -- For videos
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT max_media_per_professional CHECK (
    (SELECT COUNT(*) FROM professional_portfolios WHERE professional_id = professional_id) <= 10
  )
);

-- Sub-category mapping (what specific services a professional offers)
CREATE TABLE professional_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  subcategory_name TEXT NOT NULL,        -- "Sofa Cleaning", "Gypsum Installation"
  description TEXT,
  price_estimate DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_prof_subcat UNIQUE (professional_id, category_id, subcategory_name)
);

-- Indexes for performance
CREATE INDEX idx_followers_professional_id ON followers(professional_id) WHERE follower_id IS NOT NULL;
CREATE INDEX idx_followers_follower_id ON followers(follower_id);
CREATE INDEX idx_followers_count ON followers(professional_id);

CREATE INDEX idx_portfolios_professional ON professional_portfolios(professional_id, display_order);
CREATE INDEX idx_portfolios_featured ON professional_portfolios(professional_id, is_featured) WHERE is_featured = TRUE;

CREATE INDEX idx_subcategories_professional ON professional_subcategories(professional_id);
CREATE INDEX idx_subcategories_category ON professional_subcategories(category_id, is_active);

-- Verified Pro badge logic: Check if subscription is active
-- SELECT 
--   p.id, p.full_name,
--   CASE 
--     WHEN s.subscription_tier IS NOT NULL AND s.status = 'active' THEN 'Verified Pro'
--     ELSE 'Unverified'
--   END as badge_status
-- FROM profiles p
-- LEFT JOIN subscription_tiers s ON p.id = s.user_id
-- WHERE p.id = $1;
