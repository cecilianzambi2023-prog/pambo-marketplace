-- =====================================================
-- LIQUIDITY ENGINE - DATABASE SCHEMA
-- =====================================================
-- Adds tables and columns to track marketplace liquidity:
-- 1. Buyer inquiries with response tracking
-- 2. Seller response metrics
-- 3. Category liquidity snapshots
-- 4. Matching algorithm support

-- =====================================================
-- 1. BUYER INQUIRIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS buyer_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Participants
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  
  -- Inquiry content
  message TEXT NOT NULL,
  contact_preference VARCHAR(20) DEFAULT 'whatsapp', -- 'phone', 'whatsapp', 'email'
  
  -- Response tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  response_time_hours DECIMAL(10, 2),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'responded', 'converted', 'abandoned'
  
  -- Conversion tracking
  converted_to_sale BOOLEAN DEFAULT FALSE,
  conversion_amount DECIMAL(10, 2),
  converted_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  inquiry_source VARCHAR(50), -- 'listing_page', 'search', 'recommended', 'category_browse'
  buyer_location VARCHAR(100),
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'responded', 'converted', 'abandoned'))
);

-- Indexes for performance
CREATE INDEX idx_buyer_inquiries_seller_id ON buyer_inquiries(seller_id);
CREATE INDEX idx_buyer_inquiries_listing_id ON buyer_inquiries(listing_id);
CREATE INDEX idx_buyer_inquiries_status ON buyer_inquiries(status);
CREATE INDEX idx_buyer_inquiries_created_at ON buyer_inquiries(created_at DESC);
CREATE INDEX idx_buyer_inquiries_pending ON buyer_inquiries(seller_id, status) WHERE status = 'pending';

-- =====================================================
-- 2. ADD SELLER METRICS TO PROFILES
-- =====================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avg_response_time_hours DECIMAL(10, 2);

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS response_rate DECIMAL(5, 2); -- Percentage (0-100)

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS response_tier VARCHAR(50); -- 'excellent', 'good', 'needs_improvement', 'poor'

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_online_at TIMESTAMP WITH TIME ZONE;

-- Index for matching algorithm
CREATE INDEX IF NOT EXISTS idx_profiles_response_metrics 
ON profiles(avg_response_time_hours, response_rate) 
WHERE avg_response_time_hours IS NOT NULL;

-- =====================================================
-- 3. CATEGORY LIQUIDITY SNAPSHOTS (Daily)
-- =====================================================

CREATE TABLE IF NOT EXISTS category_liquidity_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Category info
  category VARCHAR(100) NOT NULL,
  hub VARCHAR(50), -- 'marketplace', 'wholesale', etc.
  
  -- Supply metrics
  active_listings INTEGER DEFAULT 0,
  active_sellers INTEGER DEFAULT 0,
  
  -- Demand metrics
  inquiries_7d INTEGER DEFAULT 0, -- Last 7 days
  contacts_7d INTEGER DEFAULT 0,  -- Inquiries that got responses
  conversions_7d INTEGER DEFAULT 0,
  
  -- Calculated metrics
  demand_supply_ratio DECIMAL(10, 2), -- inquiries per listing
  liquidity_score INTEGER, -- 0-100
  status VARCHAR(50), -- 'oversupplied', 'balanced', 'undersupplied', 'critical'
  
  -- Seller performance in category
  avg_response_time_hours DECIMAL(10, 2),
  avg_response_rate DECIMAL(5, 2),
  
  -- Snapshot timestamp
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one snapshot per category per day
  UNIQUE(category, hub, snapshot_date)
);

-- Indexes
CREATE INDEX idx_category_liquidity_category ON category_liquidity_snapshots(category);
CREATE INDEX idx_category_liquidity_date ON category_liquidity_snapshots(snapshot_date DESC);
CREATE INDEX idx_category_liquidity_status ON category_liquidity_snapshots(status);

-- =====================================================
-- 4. SELLER AVAILABILITY LOG
-- =====================================================

CREATE TABLE IF NOT EXISTS seller_availability_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  came_online_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  went_offline_at TIMESTAMP WITH TIME ZONE,
  session_duration_minutes INTEGER,
  inquiries_received INTEGER DEFAULT 0,
  inquiries_responded INTEGER DEFAULT 0
);

CREATE INDEX idx_seller_availability_seller ON seller_availability_log(seller_id);
CREATE INDEX idx_seller_availability_date ON seller_availability_log(came_online_at DESC);

-- =====================================================
-- 5. RLS POLICIES
-- =====================================================

-- Buyer inquiries: Buyers see their own, sellers see inquiries to them
ALTER TABLE buyer_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view their own inquiries"
ON buyer_inquiries FOR SELECT
USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view inquiries to them"
ON buyer_inquiries FOR SELECT
USING (auth.uid() = seller_id);

CREATE POLICY "Buyers can create inquiries"
ON buyer_inquiries FOR INSERT
WITH CHECK (auth.uid() = buyer_id OR buyer_id IS NULL); -- Allow guest inquiries

CREATE POLICY "Sellers can update inquiries (respond)"
ON buyer_inquiries FOR UPDATE
USING (auth.uid() = seller_id);

-- Category liquidity: Public read
ALTER TABLE category_liquidity_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view category liquidity"
ON category_liquidity_snapshots FOR SELECT
USING (true);

CREATE POLICY "System can insert snapshots"
ON category_liquidity_snapshots FOR INSERT
WITH CHECK (true); -- Managed by cron job

-- =====================================================
-- 6. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function: Auto-calculate response time when seller responds
CREATE OR REPLACE FUNCTION calculate_inquiry_response_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.responded_at IS NOT NULL AND OLD.responded_at IS NULL THEN
    NEW.response_time_hours := EXTRACT(EPOCH FROM (NEW.responded_at - NEW.created_at)) / 3600;
    NEW.status := 'responded';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_inquiry_response_time
BEFORE UPDATE ON buyer_inquiries
FOR EACH ROW
EXECUTE FUNCTION calculate_inquiry_response_time();

-- Function: Update seller online status
CREATE OR REPLACE FUNCTION update_seller_online_status(seller_user_id UUID, is_now_online BOOLEAN)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET 
    is_online = is_now_online,
    last_online_at = NOW()
  WHERE id = seller_user_id;

  -- Log availability session
  IF is_now_online THEN
    INSERT INTO seller_availability_log (seller_id, came_online_at)
    VALUES (seller_user_id, NOW());
  ELSE
    -- Close most recent session
    UPDATE seller_availability_log
    SET 
      went_offline_at = NOW(),
      session_duration_minutes = EXTRACT(EPOCH FROM (NOW() - came_online_at)) / 60
    WHERE seller_id = seller_user_id
      AND went_offline_at IS NULL
    ORDER BY came_online_at DESC
    LIMIT 1;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Get critical liquidity alerts (categories needing intervention)
CREATE OR REPLACE FUNCTION get_critical_liquidity_categories()
RETURNS TABLE (
  category VARCHAR(100),
  liquidity_score INTEGER,
  status VARCHAR(50),
  active_listings INTEGER,
  inquiries_7d INTEGER,
  demand_supply_ratio DECIMAL(10, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cls.category,
    cls.liquidity_score,
    cls.status,
    cls.active_listings,
    cls.inquiries_7d,
    cls.demand_supply_ratio
  FROM category_liquidity_snapshots cls
  WHERE cls.snapshot_date = CURRENT_DATE
    AND (cls.liquidity_score < 60 OR cls.status IN ('critical', 'undersupplied'))
  ORDER BY cls.liquidity_score ASC, cls.demand_supply_ratio DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. VIEWS FOR REPORTING
-- =====================================================

-- View: Seller response performance leaderboard
CREATE OR REPLACE VIEW seller_response_leaderboard AS
SELECT 
  p.id,
  p.full_name,
  p.avg_response_time_hours,
  p.response_rate,
  p.response_tier,
  p.average_rating,
  COUNT(DISTINCT bi.id) as total_inquiries_7d,
  COUNT(DISTINCT CASE WHEN bi.status = 'responded' THEN bi.id END) as responded_7d,
  COUNT(DISTINCT CASE WHEN bi.converted_to_sale THEN bi.id END) as conversions_7d
FROM profiles p
LEFT JOIN buyer_inquiries bi ON bi.seller_id = p.id 
  AND bi.created_at >= NOW() - INTERVAL '7 days'
WHERE p.avg_response_time_hours IS NOT NULL
GROUP BY p.id, p.full_name, p.avg_response_time_hours, p.response_rate, p.response_tier, p.average_rating
ORDER BY p.avg_response_time_hours ASC, p.response_rate DESC;

-- View: Category health dashboard
CREATE OR REPLACE VIEW category_health_dashboard AS
SELECT 
  cls.category,
  cls.hub,
  cls.liquidity_score,
  cls.status,
  cls.active_listings,
  cls.active_sellers,
  cls.inquiries_7d,
  cls.contacts_7d,
  cls.conversions_7d,
  cls.demand_supply_ratio,
  CASE 
    WHEN cls.inquiries_7d > 0 THEN (cls.contacts_7d::DECIMAL / cls.inquiries_7d * 100)
    ELSE 0
  END as response_rate_pct,
  CASE 
    WHEN cls.contacts_7d > 0 THEN (cls.conversions_7d::DECIMAL / cls.contacts_7d * 100)
    ELSE 0
  END as conversion_rate_pct,
  cls.avg_response_time_hours,
  cls.snapshot_date
FROM category_liquidity_snapshots cls
WHERE cls.snapshot_date = CURRENT_DATE
ORDER BY cls.liquidity_score ASC;

-- =====================================================
-- 8. SEED DATA / COMMENTS
-- =====================================================

COMMENT ON TABLE buyer_inquiries IS 'Tracks all buyer inquiries to sellers with response time SLA monitoring';
COMMENT ON COLUMN buyer_inquiries.response_time_hours IS 'SLA target: 2 hours. Auto-calculated on response.';
COMMENT ON TABLE category_liquidity_snapshots IS 'Daily snapshots of category supply/demand balance for liquidity monitoring';
COMMENT ON COLUMN category_liquidity_snapshots.liquidity_score IS 'Health score 0-100. Target: 70+. Optimal demand/supply ratio is 2-5 inquiries per listing per week.';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
