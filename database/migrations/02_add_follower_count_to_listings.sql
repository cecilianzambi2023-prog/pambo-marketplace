-- Add follower_count to listings table
-- This tracks how many users have saved/followed each service provider

ALTER TABLE listings ADD COLUMN follower_count INT DEFAULT 0;

-- Create index for sorting by popularity
CREATE INDEX idx_listings_follower_count ON listings(follower_count DESC) WHERE is_active = TRUE;

-- Add index for combined queries (category + followers)
CREATE INDEX idx_listings_category_followers ON listings(category_id, follower_count DESC) WHERE is_active = TRUE;

-- Verify the column was added
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'follower_count';
