-- PAMBO 6-IN-1 HUB ECOSYSTEM SCHEMA
-- Run this AFTER SUBSCRIPTION_MIGRATION.sql in Supabase SQL Editor
-- This adds hub-specific tables for: Wholesale, Digital, Services, Marketplace, Live Commerce

-- ============================================
-- 1. WHOLESALE HUB (Alibaba Style)
-- ============================================
CREATE TABLE IF NOT EXISTS wholesale_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  moq INTEGER DEFAULT 10, -- Minimum Order Quantity
  bulk_price NUMERIC NOT NULL, -- Price per unit (at MOQ)
  unit_type TEXT DEFAULT 'pieces', -- pieces, kg, tonnes, bags, etc
  currency TEXT DEFAULT 'KES',
  images TEXT[] DEFAULT '{}',
  specifications JSONB, -- e.g., {"material": "cotton", "colors": ["red", "blue"]}
  lead_time_days INTEGER DEFAULT 7,
  available_stock INTEGER,
  moq_discount NUMERIC DEFAULT 0, -- Percentage discount at MOQ
  weight_per_unit NUMERIC, -- For shipping calculation
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'active' -- active, inactive, out_of_stock
);

CREATE INDEX idx_wholesale_seller ON wholesale_products(seller_id);
CREATE INDEX idx_wholesale_category ON wholesale_products(category);
CREATE INDEX idx_wholesale_status ON wholesale_products(status);

ALTER TABLE wholesale_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create wholesale products" ON wholesale_products
  FOR INSERT WITH CHECK (auth.uid()::text = seller_id::text);

CREATE POLICY "Users can view active wholesale products" ON wholesale_products
  FOR SELECT USING (status = 'active' OR auth.uid()::text = seller_id::text);

CREATE POLICY "Users can update own wholesale products" ON wholesale_products
  FOR UPDATE USING (auth.uid()::text = seller_id::text);

CREATE POLICY "Users can delete own wholesale products" ON wholesale_products
  FOR DELETE USING (auth.uid()::text = seller_id::text);


-- ============================================
-- 2. DIGITAL PRODUCTS HUB
-- ============================================
CREATE TABLE IF NOT EXISTS digital_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- e-book, software, template, course, etc
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'KES',
  file_urls TEXT[] NOT NULL, -- Array of secure download links (should be encrypted)
  file_types TEXT[], -- e.g., ['pdf', 'zip', 'mp4']
  file_size_mb NUMERIC,
  preview_image TEXT,
  preview_video_url TEXT,
  licenses_sold INTEGER DEFAULT 0, -- Track purchases
  license_type TEXT DEFAULT 'single', -- single, team, unlimited
  drm_protected BOOLEAN DEFAULT FALSE, -- Digital Rights Management
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);

CREATE INDEX idx_digital_seller ON digital_products(seller_id);
CREATE INDEX idx_digital_category ON digital_products(category);
CREATE INDEX idx_digital_status ON digital_products(status);

ALTER TABLE digital_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create digital products" ON digital_products
  FOR INSERT WITH CHECK (auth.uid()::text = seller_id::text);

CREATE POLICY "Users can view digital products" ON digital_products
  FOR SELECT USING (true); -- Digital products are public

CREATE POLICY "Users can update own digital products" ON digital_products
  FOR UPDATE USING (auth.uid()::text = seller_id::text);

CREATE POLICY "Users can delete own digital products" ON digital_products
  FOR DELETE USING (auth.uid()::text = seller_id::text);


-- ============================================
-- 3. SERVICES HUB (Pros/Handymen)
-- ============================================
CREATE TABLE IF NOT EXISTS professional_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL, -- e.g., "Interior Design", "Plumbing"
  category TEXT NOT NULL, -- design, plumbing, electrical, tutoring, etc
  description TEXT,
  hourly_rate NUMERIC, -- NULL if using fixed rates only
  fixed_rate NUMERIC, -- For specific projects
  currency TEXT DEFAULT 'KES',
  service_area TEXT[], -- Locations served e.g., ['Nairobi', 'Mombasa']
  portfolio_images TEXT[] DEFAULT '{}',
  portfolio_videos TEXT[] DEFAULT '{}',
  experience_years INTEGER,
  certifications JSONB, -- e.g., [{"name": "ISO 9001", "year": 2022}]
  availability_status TEXT DEFAULT 'available', -- available, booked, unavailable
  response_time_hours INTEGER DEFAULT 24,
  min_project_duration TEXT, -- e.g., "2 hours"
  max_concurrent_projects INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);

CREATE INDEX idx_services_provider ON professional_services(provider_id);
CREATE INDEX idx_services_category ON professional_services(category);
CREATE INDEX idx_services_status ON professional_services(status);

ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create services" ON professional_services
  FOR INSERT WITH CHECK (auth.uid()::text = provider_id::text);

CREATE POLICY "Users can view active services" ON professional_services
  FOR SELECT USING (status = 'active' OR auth.uid()::text = provider_id::text);

CREATE POLICY "Users can update own services" ON professional_services
  FOR UPDATE USING (auth.uid()::text = provider_id::text);

CREATE POLICY "Users can delete own services" ON professional_services
  FOR DELETE USING (auth.uid()::text = provider_id::text);


-- ============================================
-- 4. MARKETPLACE HUB (Jiji Style - Quick Buy/Sell)
-- ============================================
-- Using existing 'listings' table, but adding this for inventory tracking
CREATE TABLE IF NOT EXISTS marketplace_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL, -- Reference to listings table (managed at app level)
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quantity_available INTEGER NOT NULL,
  quantity_sold INTEGER DEFAULT 0,
  reorder_level INTEGER, -- Alert when stock falls below this
  warehouse_location TEXT, -- For seller's own tracking
  batch_number TEXT, -- For tracking purposes
  expiry_date DATE, -- For perishables
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_marketplace_listing ON marketplace_inventory(listing_id);
CREATE INDEX idx_marketplace_seller ON marketplace_inventory(seller_id);

ALTER TABLE marketplace_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own inventory" ON marketplace_inventory
  FOR ALL USING (auth.uid()::text = seller_id::text);

CREATE POLICY "Users can view active inventory" ON marketplace_inventory
  FOR SELECT USING (quantity_available > 0);


-- ============================================
-- 5. LIVE COMMERCE HUB
-- ============================================
CREATE TABLE IF NOT EXISTS live_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  stream_url TEXT NOT NULL, -- e.g., YouTube/Twitch link
  thumbnail_url TEXT,
  status TEXT DEFAULT 'upcoming', -- upcoming, live, ended, cancelled
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  viewer_count INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  products_featured UUID[] DEFAULT '{}', -- References to listing, wholesale, digital, service IDs
  duration_minutes INTEGER,
  platform TEXT DEFAULT 'youtube', -- youtube, twitch, facebook, custom
  stream_key TEXT, -- Secret key for stream (encrypted)
  is_scheduled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS live_session_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL, -- Refers to the product being sold live
  featured_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS live_session_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_live_sessions_seller ON live_sessions(seller_id);
CREATE INDEX idx_live_sessions_status ON live_sessions(status);
CREATE INDEX idx_live_sessions_start ON live_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_live_products_session ON live_session_products(session_id);
CREATE INDEX idx_live_comments_session ON live_session_comments(session_id);

ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_session_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_session_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create live sessions" ON live_sessions
  FOR INSERT WITH CHECK (auth.uid()::text = seller_id::text);

CREATE POLICY "Anyone can view live sessions" ON live_sessions
  FOR SELECT USING (true);

CREATE POLICY "Sellers can update own sessions" ON live_sessions
  FOR UPDATE USING (auth.uid()::text = seller_id::text);

CREATE POLICY "Users can add products to live sessions" ON live_session_products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM live_sessions 
      WHERE id = session_id AND seller_id = auth.uid()::uuid
    )
  );

CREATE POLICY "Anyone can view live products" ON live_session_products
  FOR SELECT USING (true);

CREATE POLICY "Anyone can comment on live sessions" ON live_session_comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view live comments" ON live_session_comments
  FOR SELECT USING (true);


-- ============================================
-- 6. HUB SUBSCRIPTION TRACKING
-- ============================================
-- Link subscriptions to specific features available in each hub
CREATE TABLE IF NOT EXISTS hub_feature_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  hub TEXT NOT NULL, -- 'farmer', 'marketplace', 'wholesale', 'digital', 'services', 'live_commerce'
  feature TEXT, -- nullable if entire hub is featured
  access_level TEXT DEFAULT 'basic', -- basic, pro, enterprise
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_hub_feature_subscription ON hub_feature_access(subscription_id);
CREATE INDEX idx_hub_feature_hub ON hub_feature_access(hub);

ALTER TABLE hub_feature_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hub features" ON hub_feature_access
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.id = subscription_id 
        AND s.userId = auth.uid()::uuid
    )
  );


-- ============================================
-- 7. HUB STATISTICS & ANALYTICS
-- ============================================
CREATE TABLE IF NOT EXISTS hub_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hub TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  total_listings INTEGER DEFAULT 0,
  total_sellers INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  new_sellers_today INTEGER DEFAULT 0,
  new_listings_today INTEGER DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  avg_transaction_value NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_hub_analytics_hub ON hub_analytics(hub);
CREATE INDEX idx_hub_analytics_date ON hub_analytics(date);

-- ============================================
-- READY TO USE!
-- ============================================
-- These tables are now ready for:
-- 1. Wholesale products (B2B bulk selling)
-- 2. Digital downloads (e-books, software)
-- 3. Professional services (consultants, handymen)
-- 4. Marketplace (quick buy/sell)
-- 5. Live shopping streams
-- All with proper security policies (RLS) and subscription-aware access
