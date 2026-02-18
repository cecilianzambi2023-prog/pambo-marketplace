-- Create featured_listings table
-- Tracks which listings are paying for featured promotion

CREATE TABLE featured_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Featured details
  featured_start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  featured_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 7,
  
  -- Payment info
  amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 500.00,
  currency VARCHAR(3) DEFAULT 'KES',
  payment_method VARCHAR(50) DEFAULT 'mpesa',
  
  -- Status tracking
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, expired, cancelled
  mpesa_receipt_number VARCHAR(100),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (featured_end_date > featured_start_date),
  CONSTRAINT valid_status CHECK (status IN ('active', 'expired', 'cancelled'))
);

-- Indexes for performance
CREATE INDEX idx_featured_listings_seller ON featured_listings(seller_id);
CREATE INDEX idx_featured_listings_listing ON featured_listings(listing_id);
CREATE INDEX idx_featured_listings_status ON featured_listings(status);
CREATE INDEX idx_featured_listings_dates ON featured_listings(featured_start_date, featured_end_date);

-- Row Level Security (RLS) Policies
ALTER TABLE featured_listings ENABLE ROW LEVEL SECURITY;

-- Sellers can view their own featured listings
CREATE POLICY "Users can view their own featured listings"
  ON featured_listings
  FOR SELECT
  USING (seller_id = auth.uid());

-- Admin can view all featured listings
CREATE POLICY "Admin can view all featured listings"
  ON featured_listings
  FOR SELECT
  USING (auth.jwt()->>'email' = 'info@pambo.biz');

-- Sellers can insert their own featured listings
CREATE POLICY "Users can create featured listings for their listings"
  ON featured_listings
  FOR INSERT
  WITH CHECK (seller_id = auth.uid());

-- Sellers can update their own (status only)
CREATE POLICY "Users can update their own featured listings status"
  ON featured_listings
  FOR UPDATE
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

-- Create a view for active featured listings
CREATE VIEW active_featured_listings AS
SELECT 
  fl.id,
  fl.listing_id,
  fl.seller_id,
  fl.featured_start_date,
  fl.featured_end_date,
  fl.duration_days,
  l.title,
  l.price,
  p.name as seller_name,
  p.email as seller_email
FROM featured_listings fl
JOIN listings l ON fl.listing_id = l.id
JOIN profiles p ON fl.seller_id = p.id
WHERE fl.status = 'active' 
  AND NOW() >= fl.featured_start_date 
  AND NOW() <= fl.featured_end_date;

-- Trigger to auto-update featured listing status
CREATE OR REPLACE FUNCTION update_featured_listing_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.featured_end_date < NOW() AND NEW.status = 'active' THEN
    NEW.status = 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER featured_listing_status_update
BEFORE UPDATE ON featured_listings
FOR EACH ROW
EXECUTE FUNCTION update_featured_listing_status();
