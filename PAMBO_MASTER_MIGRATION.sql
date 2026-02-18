-- ============================================
-- PAMBO 6-IN-1 COMPLETE MASTER MIGRATION (FIXED)
-- ============================================

-- UUID support
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- GLOBAL UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PHASE 1: USER PROFILES
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone_number TEXT UNIQUE,
  role TEXT DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'farmer', 'admin')),
  subscription_status TEXT DEFAULT 'inactive',
  subscription_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER trg_profiles_updated
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Farmer activation
CREATE OR REPLACE FUNCTION activate_farmer_subscription(user_id UUID)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE profiles
  SET role = 'farmer',
      subscription_status = 'active',
      subscription_expiry = now() + interval '1 year'
  WHERE id = user_id;
END;
$$;

-- ============================================
-- PHASE 2: SUBSCRIPTIONS & PAYMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  hub TEXT NOT NULL,
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'KES',
  transaction_id TEXT,
  next_billing_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT
);

CREATE TRIGGER trg_subscriptions_updated
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own"
ON subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_insert_own"
ON subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_update_own"
ON subscriptions FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- USER VERIFICATION (KYC)
-- ============================================

CREATE TABLE IF NOT EXISTS user_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  id_type TEXT,
  id_last4 TEXT,
  status TEXT DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER trg_verification_updated
BEFORE UPDATE ON user_verification
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE user_verification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verification_select_own"
ON user_verification FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "verification_insert_own"
ON user_verification FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- SELLER BADGES
-- ============================================

CREATE TABLE IF NOT EXISTS seller_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  trust_score INTEGER DEFAULT 0,
  trust_level TEXT DEFAULT 'bronze',
  total_reviews INTEGER DEFAULT 0,
  average_rating NUMERIC DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  badges TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE seller_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seller_badges_public"
ON seller_badges FOR SELECT
USING (true);

-- ============================================
-- COMMISSION TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS commission_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID,
  seller_id UUID REFERENCES profiles(id),
  gross_amount NUMERIC NOT NULL,
  commission_rate NUMERIC DEFAULT 5,
  commission_amount NUMERIC,
  net_amount NUMERIC,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE commission_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "commission_select_own"
ON commission_tracking FOR SELECT
USING (auth.uid() = seller_id);

-- ============================================
-- PRICING PLANS
-- ============================================

CREATE TABLE IF NOT EXISTS pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT UNIQUE,
  monthly_price NUMERIC,
  yearly_price NUMERIC,
  max_listings INTEGER,
  max_images INTEGER,
  has_api BOOLEAN DEFAULT false,
  has_analytics BOOLEAN DEFAULT true,
  features TEXT[]
);

ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pricing_public"
ON pricing_plans FOR SELECT
USING (true);

INSERT INTO pricing_plans
(plan_name, monthly_price, yearly_price, max_listings, max_images, has_api, features)
VALUES
('starter', 3500, 35000, 10, 50, false, ARRAY['Basic analytics']),
('pro', 7000, 70000, 50, 200, true, ARRAY['Advanced analytics','API access']),
('enterprise', 14000, 140000, 500, 1000, true, ARRAY['White-label','Dedicated support'])
ON CONFLICT DO NOTHING;

-- ============================================
-- LIVE COMMERCE
-- ============================================

CREATE TABLE IF NOT EXISTS live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id),
  title TEXT,
  stream_url TEXT,
  status TEXT DEFAULT 'upcoming',
  start_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "live_sessions_public"
ON live_sessions FOR SELECT
USING (true);

CREATE POLICY "live_sessions_insert"
ON live_sessions FOR INSERT
WITH CHECK (auth.uid() = seller_id);

-- ============================================
-- DONE 🚀
-- ============================================
