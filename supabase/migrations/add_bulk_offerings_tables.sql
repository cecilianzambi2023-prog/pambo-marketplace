-- Migration: Add Bulk Offerings Tables
-- Purpose: Enable sellers to post bulk product offerings in Wholesale Hub
-- Date: 2024
-- Status: Ready for deployment

-- Table 1: bulk_offerings
-- Stores all bulk product offerings posted by sellers
CREATE TABLE IF NOT EXISTS bulk_offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Seller information
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  seller_name VARCHAR(255),
  seller_phone VARCHAR(20),
  seller_email VARCHAR(255),
  
  -- Product details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- furniture, decor, textiles, electronics, machinery, raw-materials, other
  
  -- Quantity & Pricing
  quantity_available INTEGER NOT NULL,
  unit VARCHAR(50), -- units, kg, meters, liters, sets, pieces, boxes, tons
  price_per_unit DECIMAL(10,2) NOT NULL,
  min_order_quantity INTEGER DEFAULT 1,
  total_value DECIMAL(15,2), -- Auto-calculated: quantity * price_per_unit
  
  -- Marketplace details
  hub VARCHAR(50) NOT NULL, -- wholesale, digital, services
  verified_seller BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'active', -- active, sold_out, inactive, paused
  
  -- Engagement tracking
  responses_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Timestamps
  posted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Auth reference (for RLS)
  created_by_auth UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT price_positive CHECK (price_per_unit > 0),
  CONSTRAINT quantity_positive CHECK (quantity_available > 0),
  CONSTRAINT min_order_valid CHECK (min_order_quantity > 0 AND min_order_quantity <= quantity_available)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bulk_offerings_seller_id ON bulk_offerings(seller_id);
CREATE INDEX IF NOT EXISTS idx_bulk_offerings_category ON bulk_offerings(category);
CREATE INDEX IF NOT EXISTS idx_bulk_offerings_hub ON bulk_offerings(hub);
CREATE INDEX IF NOT EXISTS idx_bulk_offerings_status ON bulk_offerings(status);
CREATE INDEX IF NOT EXISTS idx_bulk_offerings_posted_date ON bulk_offerings(posted_date DESC);
CREATE INDEX IF NOT EXISTS idx_bulk_offerings_active ON bulk_offerings(status, posted_date DESC) WHERE status = 'active';

-- Table 2: bulk_inquiries
-- Tracks buyer inquiries/responses to bulk offerings
CREATE TABLE IF NOT EXISTS bulk_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Offering reference
  offering_id UUID NOT NULL REFERENCES bulk_offerings(id) ON DELETE CASCADE,
  
  -- Buyer information
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  buyer_name VARCHAR(255),
  buyer_email VARCHAR(255),
  buyer_phone VARCHAR(20),
  
  -- Inquiry details
  message TEXT,
  requested_quantity INTEGER,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'new', -- new, replied, converted, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Auth reference
  created_by_auth UUID REFERENCES auth.users(id)
);

-- Create indexes for inquiries
CREATE INDEX IF NOT EXISTS idx_bulk_inquiries_offering_id ON bulk_inquiries(offering_id);
CREATE INDEX IF NOT EXISTS idx_bulk_inquiries_buyer_id ON bulk_inquiries(buyer_id);
CREATE INDEX IF NOT EXISTS idx_bulk_inquiries_seller_id ON bulk_inquiries(
  SELECT seller_id FROM bulk_offerings WHERE bulk_offerings.id = bulk_inquiries.offering_id
);
CREATE INDEX IF NOT EXISTS idx_bulk_inquiries_status ON bulk_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_bulk_inquiries_created_at ON bulk_inquiries(created_at DESC);

-- Table 3: bulk_offering_analytics (Optional - for tracking metrics)
CREATE TABLE IF NOT EXISTS bulk_offering_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  offering_id UUID NOT NULL REFERENCES bulk_offerings(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Metrics
  total_views INTEGER DEFAULT 0,
  total_inquiries INTEGER DEFAULT 0,
  total_converted INTEGER DEFAULT 0,
  total_revenue DECIMAL(15,2) DEFAULT 0,
  
  -- Calculated fields
  conversion_rate DECIMAL(5,2), -- percentage
  avg_inquiry_response_time INTERVAL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bulk_analytics_seller_id ON bulk_offering_analytics(seller_id);

-- ===============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===============================================

-- Enable RLS
ALTER TABLE bulk_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_offering_analytics ENABLE ROW LEVEL SECURITY;

-- ===== BULK OFFERINGS POLICIES =====

-- Policy 1: Anyone can SELECT active offerings
CREATE POLICY "bulk_offerings_select_active"
ON bulk_offerings FOR SELECT
USING (status = 'active');

-- Policy 2: Sellers can see their own offerings (even if inactive)
CREATE POLICY "bulk_offerings_select_own"
ON bulk_offerings FOR SELECT
USING (auth.uid() = seller_id);

-- Policy 3: Admins can see all offerings
CREATE POLICY "bulk_offerings_select_admin"
ON bulk_offerings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'super_admin')
  )
);

-- Policy 4: Only Pro/Enterprise sellers can INSERT
CREATE POLICY "bulk_offerings_insert_pro_sellers"
ON bulk_offerings FOR INSERT
WITH CHECK (
  auth.uid() = seller_id AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND subscription_tier IN ('pro', 'enterprise', 'vip')
  )
);

-- Policy 5: Sellers can UPDATE only their own offerings
CREATE POLICY "bulk_offerings_update_own"
ON bulk_offerings FOR UPDATE
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

-- Policy 6: Sellers can DELETE only their own offerings
CREATE POLICY "bulk_offerings_delete_own"
ON bulk_offerings FOR DELETE
USING (auth.uid() = seller_id);

-- ===== BULK INQUIRIES POLICIES =====

-- Policy 1: Buyers can see their own inquiries
CREATE POLICY "bulk_inquiries_select_own"
ON bulk_inquiries FOR SELECT
USING (auth.uid() = buyer_id);

-- Policy 2: Sellers can see inquiries on their offerings
CREATE POLICY "bulk_inquiries_select_seller"
ON bulk_inquiries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM bulk_offerings
    WHERE bulk_offerings.id = bulk_inquiries.offering_id
    AND bulk_offerings.seller_id = auth.uid()
  )
);

-- Policy 3: Buyers can INSERT inquiries
CREATE POLICY "bulk_inquiries_insert_buyers"
ON bulk_inquiries FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

-- Policy 4: Buyers can UPDATE their own inquiries
CREATE POLICY "bulk_inquiries_update_own"
ON bulk_inquiries FOR UPDATE
USING (auth.uid() = buyer_id)
WITH CHECK (auth.uid() = buyer_id);

-- ===============================================
-- TRIGGERS & FUNCTIONS
-- ===============================================

-- Function 1: Auto-calculate total_value on INSERT/UPDATE
CREATE OR REPLACE FUNCTION update_bulk_offering_total_value()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_value := NEW.quantity_available * NEW.price_per_unit;
  NEW.updated_date := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bulk_offerings_calculate_total
BEFORE INSERT OR UPDATE ON bulk_offerings
FOR EACH ROW
EXECUTE FUNCTION update_bulk_offering_total_value();

-- Function 2: Auto-increment inquiry response count
CREATE OR REPLACE FUNCTION increment_inquiry_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE bulk_offerings
  SET responses_count = responses_count + 1,
      updated_date = NOW()
  WHERE id = NEW.offering_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bulk_inquiries_increment_count
AFTER INSERT ON bulk_inquiries
FOR EACH ROW
EXECUTE FUNCTION increment_inquiry_count();

-- Function 3: Update timestamp on row update
CREATE OR REPLACE FUNCTION update_bulk_inquiries_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bulk_inquiries_update_timestamp
BEFORE UPDATE ON bulk_inquiries
FOR EACH ROW
EXECUTE FUNCTION update_bulk_inquiries_timestamp();

-- ===============================================
-- SEED DATA (OPTIONAL - For Testing)
-- ===============================================

-- Insert 5 test bulk offerings
INSERT INTO bulk_offerings (
  seller_id, seller_name, seller_phone, seller_email,
  title, description, category,
  quantity_available, unit, price_per_unit, min_order_quantity,
  hub, status
) VALUES
(
  'b22dcbcf-b76e-4b01-a1b9-cd365b36f7dc',
  'Premium Decor Limited',
  '+254712345678',
  'sales@premiumdecor.biz',
  'Bulk Office Chairs - Executive',
  'Premium leather office chairs with ergonomic design. Available in black, brown, and grey. Ideal for corporate offices and call centers.',
  'furniture',
  500,
  'units',
  5000,
  10,
  'wholesale',
  'active'
),
(
  'b22dcbcf-b76e-4b01-a1b9-cd365b36f7dc',
  'Premium Decor Limited',
  '+254712345678',
  'sales@premiumdecor.biz',
  'Decorative Wall Tiles - Ceramic',
  'High-quality ceramic wall tiles. Perfect for hotels, restaurants, and home renovations. Multiple colors and patterns available.',
  'decor',
  1000,
  'pieces',
  850,
  50,
  'wholesale',
  'active'
),
(
  'b22dcbcf-b76e-4b01-a1b9-cd365b36f7dc',
  'Premium Decor Limited',
  '+254712345678',
  'sales@premiumdecor.biz',
  'Bulk Fabric Rolls - Cotton Premium',
  'Premium cotton fabric for furniture manufacturing and textiles. 50 rolls available. Standard width 140cm.',
  'textiles',
  50,
  'rolls',
  25000,
  5,
  'wholesale',
  'active'
),
(
  'b22dcbcf-b76e-4b01-a1b9-cd365b36f7dc',
  'Premium Decor Limited',
  '+254712345678',
  'sales@premiumdecor.biz',
  'LED Lighting Fixtures - Commercial',
  'Energy-efficient LED lights for commercial spaces. Dimmable, 5000K daylight color. Perfect for offices and retail.',
  'electronics',
  200,
  'units',
  3500,
  5,
  'wholesale',
  'active'
),
(
  'b22dcbcf-b76e-4b01-a1b9-cd365b36f7dc',
  'Premium Decor Limited',
  '+254712345678',
  'sales@premiumdecor.biz',
  'Industrial Paint - Interior Matte',
  'Professional grade interior paint. Low VOC, durable finish. Available in 20L containers. Multiple colors in stock.',
  'raw-materials',
  100,
  'liters',
  450,
  10,
  'wholesale',
  'active'
);

-- ===============================================
-- COMMENTS & DOCUMENTATION
-- ===============================================

COMMENT ON TABLE bulk_offerings IS 'Stores bulk product offerings posted by Pro+ sellers. Users must have Pro or Enterprise subscription to insert.';
COMMENT ON COLUMN bulk_offerings.price_per_unit IS 'Price in KES per unit. Cannot be zero or negative.';
COMMENT ON COLUMN bulk_offerings.quantity_available IS 'Total quantity available for sale. Must be > 0.';
COMMENT ON COLUMN bulk_offerings.min_order_quantity IS 'Minimum order size for buyers. Must be > 0 and <= quantity_available.';
COMMENT ON COLUMN bulk_offerings.total_value IS 'Auto-calculated: quantity_available * price_per_unit. Updated on every change.';
COMMENT ON COLUMN bulk_offerings.hub IS 'Marketplace section: wholesale, digital, or services.';
COMMENT ON COLUMN bulk_offerings.responses_count IS 'Incremented automatically when new inquiry is created.';

COMMENT ON TABLE bulk_inquiries IS 'Tracks buyer inquiries/responses to bulk offerings. Used for lead management.';
COMMENT ON COLUMN bulk_inquiries.status IS 'Inquiry status: new (not replied), replied (seller responded), converted (sale made), rejected (seller declined).';

-- ===============================================
-- VERIFICATION QUERY
-- ===============================================

-- Run after migration to verify tables created successfully
-- SELECT
--   table_name,
--   (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name LIKE 'bulk_%'
-- ORDER BY table_name;
