-- ============================================
-- SUBSCRIPTION SYSTEM MIGRATION
-- For: Million Dollar SaaS Marketplace
-- ============================================

-- 1. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hub VARCHAR(50) NOT NULL, -- marketplace, wholesale, digital, service, live
  plan VARCHAR(20) NOT NULL, -- starter, pro, enterprise
  monthlyPrice INTEGER NOT NULL, -- in KES
  status VARCHAR(20) NOT NULL, -- pending_payment, active, cancelled, expired
  billingCycle VARCHAR(20) NOT NULL DEFAULT 'monthly', 
  startDate TIMESTAMP DEFAULT NOW(),
  nextBillingDate TIMESTAMP NOT NULL,
  cancelledAt TIMESTAMP,
  activatedAt TIMESTAMP,
  transactionId VARCHAR(100),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),

  CONSTRAINT unique_active_subscription UNIQUE (userId, hub, status)
    WHERE status = 'active'
);

-- 2. USER VERIFICATION TABLE (KYC)
CREATE TABLE IF NOT EXISTS user_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  idType VARCHAR(50) NOT NULL, -- national_id, passport, drivers_license
  idNumber VARCHAR(20) NOT NULL, -- last 4 digits only
  fullName VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, verified, rejected
  phoneVerified BOOLEAN DEFAULT FALSE,
  phone VARCHAR(20),
  phoneVerifiedAt TIMESTAMP,
  bank JSONB, -- {name, account, verified}
  verifiedAt TIMESTAMP,
  rejectedReason VARCHAR(255),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- 3. SELLER BADGES TABLE (Trust & Safety)
CREATE TABLE IF NOT EXISTS seller_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sellerId UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Verification badges
  identityVerified BOOLEAN DEFAULT FALSE,
  phoneVerified BOOLEAN DEFAULT FALSE,
  bankVerified BOOLEAN DEFAULT FALSE,
  
  -- Performance badges
  responseTime FLOAT, -- average hours
  completionRate FLOAT, -- percentage
  returnRate FLOAT, -- percentage
  
  -- Rating badges
  averageRating FLOAT,
  totalReviews INTEGER DEFAULT 0,
  
  -- Trust level
  trustLevel VARCHAR(20), -- bronze, silver, gold, platinum
  trustScore INTEGER DEFAULT 0, -- 0-1000
  
  -- Premium status
  isPremiumSeller BOOLEAN DEFAULT FALSE,
  premiumSince TIMESTAMP,
  
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- 4. FEATURE USAGE TABLE
CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature VARCHAR(100) NOT NULL, -- listings_created, images_uploaded, etc
  count INTEGER DEFAULT 1,
  date DATE DEFAULT CURRENT_DATE,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- 5. COMMISSION TRACKING TABLE
CREATE TABLE IF NOT EXISTS commission_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orderId UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sellerId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  grossAmount DECIMAL(10, 2) NOT NULL,
  commissionRate FLOAT NOT NULL DEFAULT 0.05, -- 5%
  commission DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, paid, refunded
  paidAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- 6. PRICING PLANS TABLE
CREATE TABLE IF NOT EXISTS pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL, -- starter, pro, enterprise
  monthlyPrice INTEGER NOT NULL,
  listings INTEGER NOT NULL,
  images INTEGER NOT NULL,
  featured INTEGER NOT NULL,
  analytics VARCHAR(50) NOT NULL, -- basic, advanced, full
  apiAccess BOOLEAN DEFAULT FALSE,
  supportPriority VARCHAR(20),
  badge BOOLEAN DEFAULT TRUE,
  automations INTEGER DEFAULT 0,
  customBranding BOOLEAN DEFAULT FALSE,
  dedicatedAccount BOOLEAN DEFAULT FALSE
);

-- 7. ADMIN AUDIT LOG TABLE (Improved)
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adminId UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  targetType VARCHAR(50), -- user, listing, subscription, etc
  targetId VARCHAR(100),
  details JSONB,
  reason VARCHAR(255),
  createdAt TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_subscriptions_userId ON subscriptions(userId);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_hub ON subscriptions(hub);
CREATE INDEX idx_user_verification_userId ON user_verification(userId);
CREATE INDEX idx_seller_badges_trustLevel ON seller_badges(trustLevel);
CREATE INDEX idx_feature_usage_userId ON feature_usage(userId);
CREATE INDEX idx_commission_tracking_sellerId ON commission_tracking(sellerId);
CREATE INDEX idx_admin_audit_log_adminId ON admin_audit_log(adminId);
CREATE INDEX idx_admin_audit_log_createdAt ON admin_audit_log(createdAt);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_tracking ENABLE ROW LEVEL SECURITY;

-- Subscriptions - users can only see their own
CREATE POLICY "users_can_see_own_subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = userId);

-- User Verification - users can only see their own
CREATE POLICY "users_can_see_own_verification" ON user_verification
  FOR SELECT USING (auth.uid() = userId);

-- Seller Badges - public read (to show badges), users can update own
CREATE POLICY "public_can_read_badges" ON seller_badges
  FOR SELECT USING (TRUE);

CREATE POLICY "sellers_can_update_own_badge" ON seller_badges
  FOR UPDATE USING (auth.uid() = sellerId);

-- Feature Usage - users can only see their own
CREATE POLICY "users_can_see_own_usage" ON feature_usage
  FOR SELECT USING (auth.uid() = userId);

-- ============================================
-- SAMPLE PRICING PLANS
-- ============================================

INSERT INTO pricing_plans (name, monthlyPrice, listings, images, featured, analytics, apiAccess, supportPriority, badge, automations, customBranding, dedicatedAccount)
VALUES
  ('Starter', 3500, 10, 5, 0, 'basic', FALSE, 'standard', TRUE, 0, FALSE, FALSE),
  ('Pro', 7000, 50, 20, 5, 'advanced', TRUE, 'priority', TRUE, 5, FALSE, FALSE),
  ('Enterprise', 14000, 500, 100, 50, 'full', TRUE, 'dedicated', TRUE, 50, TRUE, TRUE)
ON CONFLICT DO NOTHING;
