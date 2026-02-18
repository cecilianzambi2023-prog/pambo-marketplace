-- Direct-Connect Marketplace Schema for Offspring Decor Limited
-- =========================================================
-- Migration: Add seller verification, reporting, and admin safety tools
-- 
-- This migration adds the infrastructure for:
-- 1. Seller verification (ID/Business Permit uploads)
-- 2. Badge assignment based on subscription tier
-- 3. Seller reporting system
-- 4. Admin actions & audit logs
-- 5. Banned sellers management

-- ========================================
-- 1. SELLER VERIFICATION DOCUMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS seller_verification_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'national_id', 'business_permit', 'tax_certificate', 'trade_license'
  document_url TEXT NOT NULL, -- S3/storage URL
  document_number VARCHAR(100) NOT NULL,
  issued_date TIMESTAMP WITH TIME ZONE NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE, -- NULL if doesn't expire
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'expired'
  admin_review_notes TEXT,
  reviewed_by_admin UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_seller_verification_seller_id ON seller_verification_documents(seller_id);
CREATE INDEX idx_seller_verification_status ON seller_verification_documents(status);
CREATE INDEX idx_seller_verification_document_type ON seller_verification_documents(document_type);

-- ========================================
-- 2. SELLER REPORTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS seller_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reported_seller_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  reported_by_user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL, -- 'fraud', 'fake_product', 'bad_condition', etc
  description TEXT NOT NULL,
  evidence_urls TEXT[], -- Array of image/evidence URLs
  status VARCHAR(50) DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'dismissed'
  admin_notes TEXT,
  action_taken VARCHAR(100), -- 'seller_banned', 'listing_removed', 'warning_issued'
  admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_seller_reports_reported_seller_id ON seller_reports(reported_seller_id);
CREATE INDEX idx_seller_reports_status ON seller_reports(status);
CREATE INDEX idx_seller_reports_reason ON seller_reports(reason);
CREATE INDEX idx_seller_reports_created_at ON seller_reports(created_at DESC);

-- ========================================
-- 3. ADMIN ACTIONS AUDIT LOG
-- ========================================
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action_type VARCHAR(50) NOT NULL, -- 'ban_seller', 'unban_seller', 'delete_listing', 'review_document', 'warn_seller'
  target_type VARCHAR(50) NOT NULL, -- 'seller', 'listing', 'report'
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details JSONB, -- Extra context
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_action_type ON admin_actions(action_type);
CREATE INDEX idx_admin_actions_target_id ON admin_actions(target_id);
CREATE INDEX idx_admin_actions_created_at ON admin_actions(created_at DESC);

-- ========================================
-- 4. BANNED SELLERS TABLE (Audit Trail)
-- ========================================
CREATE TABLE IF NOT EXISTS banned_sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL UNIQUE REFERENCES profiles(user_id) ON DELETE CASCADE,
  ban_reason TEXT NOT NULL,
  ban_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  banned_by_admin UUID NOT NULL REFERENCES auth.users(id),
  ap_notes TEXT,
  ban_lifted_date TIMESTAMP WITH TIME ZONE, -- NULL if still banned
  ban_lifted_by_admin UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true, -- false if ban was lifted
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_banned_sellers_seller_id ON banned_sellers(seller_id);
CREATE INDEX idx_banned_sellers_is_active ON banned_sellers(is_active);
CREATE INDEX idx_banned_sellers_ban_date ON banned_sellers(ban_date DESC);

-- ========================================
-- 5. SELLER DIRECTORY (Denormalized for Performance)
-- ========================================
CREATE TABLE IF NOT EXISTS seller_directory (
  id UUID PRIMARY KEY,
  seller_id UUID NOT NULL UNIQUE REFERENCES profiles(user_id) ON DELETE CASCADE,
  
  -- Subscription & Badge
  subscription_tier VARCHAR(50) NOT NULL, -- 'mkulima', 'starter', 'pro', 'enterprise'
  subscription_badge VARCHAR(50) NOT NULL, -- 'bronze', 'silver', 'gold', 'platinum'
  
  -- Business Info
  business_name VARCHAR(255) NOT NULL,
  business_category VARCHAR(100),
  business_description TEXT,
  
  -- Contact (Direct Connect)
  phone_number VARCHAR(20) NOT NULL,
  whatsapp_number VARCHAR(20),
  
  -- Location
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  city VARCHAR(100),
  county VARCHAR(100),
  
  -- Verification & Trust
  is_verified BOOLEAN DEFAULT false,
  verified_documents_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_ratings_count INTEGER DEFAULT 0,
  
  -- Listings & Engagement
  active_listings INTEGER DEFAULT 0,
  total_listings INTEGER DEFAULT 0,
  response_time_hours INTEGER,
  
  -- Status
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  last_active TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_seller_directory_subscription_badge ON seller_directory(subscription_badge);
CREATE INDEX idx_seller_directory_city ON seller_directory(city);
CREATE INDEX idx_seller_directory_is_verified ON seller_directory(is_verified);
CREATE INDEX idx_seller_directory_is_banned ON seller_directory(is_banned);
CREATE INDEX idx_seller_directory_average_rating ON seller_directory(average_rating DESC);
CREATE INDEX idx_seller_directory_business_category ON seller_directory(business_category);

-- ========================================
-- 6. BUYER CONTACT REQUESTS (Direct Connect)
-- ========================================
CREATE TABLE IF NOT EXISTS buyer_contact_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  contact_preference VARCHAR(20) DEFAULT 'whatsapp', -- 'phone', 'whatsapp', 'email'
  seller_responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_buyer_contact_requests_seller_id ON buyer_contact_requests(seller_id);
CREATE INDEX idx_buyer_contact_requests_buyer_id ON buyer_contact_requests(buyer_id);
CREATE INDEX idx_buyer_contact_requests_created_at ON buyer_contact_requests(created_at DESC);

-- ========================================
-- 7. SELLER ANALYTICS (Daily Snapshots)
-- ========================================
CREATE TABLE IF NOT EXISTS seller_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  
  -- Listing metrics
  active_listings INTEGER DEFAULT 0,
  total_listings INTEGER DEFAULT 0,
  
  -- Engagement
  total_views INTEGER DEFAULT 0,
  total_contact_requests INTEGER DEFAULT 0,
  average_response_time_hours DECIMAL(5, 2),
  
  -- Sales
  completed_orders INTEGER DEFAULT 0,
  total_revenue INTEGER DEFAULT 0, -- KES
  average_order_value DECIMAL(10, 2),
  
  -- Trust
  rating_average DECIMAL(3, 2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  ban_incidents INTEGER DEFAULT 0,
  report_incidents INTEGER DEFAULT 0,
  
  -- Subscription
  subscription_tier VARCHAR(50),
  subscription_expires_in_days INTEGER,
  
  analytics_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_seller_analytics_seller_id ON seller_analytics(seller_id);
CREATE INDEX idx_seller_analytics_analytics_date ON seller_analytics(analytics_date DESC);
CREATE UNIQUE INDEX idx_seller_analytics_seller_date ON seller_analytics(seller_id, analytics_date);

-- ========================================
-- 8. UPDATE PROFILES TABLE (ADD NEW COLUMNS)
-- ========================================
-- Run these ALTER TABLE commands if columns don't exist yet

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_badge VARCHAR(50) GENERATED ALWAYS AS (
  CASE 
    WHEN subscription_tier = 'mkulima' THEN 'bronze'
    WHEN subscription_tier = 'starter' THEN 'silver'
    WHEN subscription_tier = 'pro' THEN 'gold'
    WHEN subscription_tier = 'enterprise' THEN 'platinum'
    ELSE 'bronze'
  END
) STORED;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS business_name VARCHAR(255);

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS business_category VARCHAR(100);

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS business_description TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS city VARCHAR(100);

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS county VARCHAR(100);

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS verified_documents_count INTEGER DEFAULT 0;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS ban_reason TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_ratings_count INTEGER DEFAULT 0;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS active_listings INTEGER DEFAULT 0;

-- ========================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Seller Verification Documents: Only admins and the seller can view their own
ALTER TABLE seller_verification_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seller can view own documents" ON seller_verification_documents
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Admins can view all documents" ON seller_verification_documents
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  ));

-- Seller Reports: Only the reporter and admins can view
ALTER TABLE seller_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reporter can view own report" ON seller_reports
  FOR SELECT USING (auth.uid() = reported_by_user_id);

CREATE POLICY "Admins can view all reports" ON seller_reports
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  ));

-- Admin Actions: Only admins can access
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access admin actions" ON admin_actions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  ));

-- Banned Sellers: Everyone can view banned status for sellers
ALTER TABLE banned_sellers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view banned sellers" ON banned_sellers
  FOR SELECT USING (true);

-- Seller Directory: Public read, sellers can update own
ALTER TABLE seller_directory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view seller directory" ON seller_directory
  FOR SELECT USING (true);

CREATE POLICY "Sellers can update own directory entry" ON seller_directory
  FOR UPDATE USING (auth.uid() = seller_id);

-- Buyer Contact Requests: Purchaser and seller can view, buyer can insert
ALTER TABLE buyer_contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers and sellers can view contact requests" ON buyer_contact_requests
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can request contact" ON buyer_contact_requests
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Seller Analytics: Sellers can view own, admins can view all
ALTER TABLE seller_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view own analytics" ON seller_analytics
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Admins can view all analytics" ON seller_analytics
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  ));

-- ========================================
-- 10. FUNCTIONS & TRIGGERS
-- ========================================

-- Auto-update seller directory when profile changes
CREATE OR REPLACE FUNCTION update_seller_directory()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO seller_directory (
    seller_id,
    subscription_tier,
    subscription_badge,
    business_name,
    business_category,
    business_description,
    phone_number,
    whatsapp_number,
    latitude,
    longitude,
    city,
    county,
    is_verified,
    verified_documents_count,
    average_rating,
    total_ratings_count,
    is_banned
  ) VALUES (
    NEW.user_id,
    NEW.subscription_tier,
    CASE 
      WHEN NEW.subscription_tier = 'mkulima' THEN 'bronze'
      WHEN NEW.subscription_tier = 'starter' THEN 'silver'
      WHEN NEW.subscription_tier = 'pro' THEN 'gold'
      WHEN NEW.subscription_tier = 'enterprise' THEN 'platinum'
      ELSE 'bronze'
    END,
    NEW.business_name,
    NEW.business_category,
    NEW.business_description,
    NEW.phone_number,
    NEW.whatsapp_number,
    NEW.latitude,
    NEW.longitude,
    NEW.city,
    NEW.county,
    NEW.is_verified,
    NEW.verified_documents_count,
    NEW.average_rating,
    NEW.total_ratings_count,
    NEW.is_banned
  )
  ON CONFLICT (seller_id) DO UPDATE SET
    subscription_tier = NEW.subscription_tier,
    business_name = COALESCE(NEW.business_name, seller_directory.business_name),
    business_category = COALESCE(NEW.business_category, seller_directory.business_category),
    phone_number = COALESCE(NEW.phone_number, seller_directory.phone_number),
    whatsapp_number = COALESCE(NEW.whatsapp_number, seller_directory.whatsapp_number),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_seller_directory
AFTER UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_seller_directory();

-- Auto-ban seller when report resolves with ban action
CREATE OR REPLACE FUNCTION ban_seller_on_report_action()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.action_taken = 'seller_banned' AND OLD.action_taken IS DISTINCT FROM 'seller_banned' THEN
    INSERT INTO banned_sellers (seller_id, ban_reason, banned_by_admin)
    VALUES (NEW.reported_seller_id, NEW.admin_notes, COALESCE(NEW.admin_id, auth.uid()));
    
    UPDATE profiles
    SET is_banned = true,
        ban_reason = NEW.admin_notes,
        updated_at = now()
    WHERE user_id = NEW.reported_seller_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ban_seller_on_report
AFTER UPDATE ON seller_reports
FOR EACH ROW
EXECUTE FUNCTION ban_seller_on_report_action();

-- ========================================
-- 11. VIEWS FOR EASY QUERYING
-- ========================================

-- Active sellers view (not banned, verified)
CREATE OR REPLACE VIEW active_sellers AS
SELECT 
  sd.*,
  (sd.active_listings > 0) as has_active_listings,
  CASE 
    WHEN sd.average_rating >= 4.5 THEN 'Excellent'
    WHEN sd.average_rating >= 4 THEN 'Very Good'
    WHEN sd.average_rating >= 3.5 THEN 'Good'
    WHEN sd.average_rating >= 3 THEN 'Fair'
    ELSE 'New'
  END as rating_description
FROM seller_directory sd
WHERE sd.is_banned = false AND sd.active_listings > 0
ORDER BY sd.average_rating DESC, sd.subscription_tier DESC;

-- Verified sellers view
CREATE OR REPLACE VIEW verified_sellers AS
SELECT 
  sd.*,
  COUNT(DISTINCT svd.id) as verification_count
FROM seller_directory sd
LEFT JOIN seller_verification_documents svd ON sd.seller_id = svd.seller_id
WHERE sd.is_verified = true AND sd.is_banned = false
GROUP BY sd.id;

-- Reports requiring action view
CREATE OR REPLACE VIEW open_reports AS
SELECT 
  sr.*,
  p.business_name,
  p.email
FROM seller_reports sr
LEFT JOIN profiles p ON sr.reported_seller_id = p.user_id
WHERE sr.status IN ('open', 'investigating')
ORDER BY sr.created_at DESC;

-- ========================================
-- MIGRATION COMPLETED
-- ========================================
-- Run: supabase migration up
-- Then deploy Edge Functions
-- Finally, test the complete flow
