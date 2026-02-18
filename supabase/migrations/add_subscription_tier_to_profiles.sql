-- Migration: Add subscription tier and expiry columns to profiles table
-- Purpose: Track user subscription tier (mkulima, starter, pro, enterprise) and subscription expiry date
-- Company: Offspring Decor Limited
-- Updated: 2026-02-13

BEGIN;

-- Add subscription_tier column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'starter';

-- Add subscription_expiry column to track when subscription renews
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMP WITH TIME ZONE;

-- Add subscription_start_date to track when subscription was activated
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE;

-- Add subscription_period_days to track duration (30 for monthly, 365 for Mkulima)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_period_days INTEGER DEFAULT 30;

-- Create index on subscription_expiry for efficient renewal queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_expiry 
ON profiles(subscription_expiry);

-- Create index on subscription_tier for filtering by tier
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier 
ON profiles(subscription_tier);

-- Add comment explaining subscription tiers
COMMENT ON COLUMN profiles.subscription_tier IS 
'User subscription tier: mkulima (1,500 KES for 1 YEAR - Special Offer), starter (3,500 KES/month), pro (5,000 KES/month), enterprise (9,000 KES/month). Free tier is null. SELLERS KEEP 100% - NO COMMISSIONS.';

COMMENT ON COLUMN profiles.subscription_expiry IS 
'Date and time when active subscription expires. After this date, user reverts to free tier. Renewal prompt shows 3 days before expiry.';

COMMENT ON COLUMN profiles.subscription_start_date IS 
'Date and time when current subscription was activated.';

COMMENT ON COLUMN profiles.subscription_period_days IS 
'Duration of subscription in days: 30 for monthly tiers, 365 for Mkulima special offer.';

-- Verify the updates
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND column_name IN ('subscription_tier', 'subscription_expiry', 'subscription_start_date', 'subscription_period_days');

COMMIT;
