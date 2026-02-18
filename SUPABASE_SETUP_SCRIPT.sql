-- ============================================
-- SUPABASE SETUP: Pambo.com 6-Hub Database
-- ============================================
-- Run this entire script in Supabase SQL Editor
-- It creates all tables + sample data

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
  verified BOOLEAN DEFAULT FALSE,
  accountStatus TEXT DEFAULT 'active' CHECK (accountStatus IN ('active', 'suspended', 'pending')),
  joinDate TIMESTAMPTZ DEFAULT now(),
  bio TEXT,
  following TEXT[] DEFAULT ARRAY[]::TEXT[],
  followers TEXT[] DEFAULT ARRAY[]::TEXT[],
  acceptedTermsTimestamp BIGINT,
  nationalId TEXT,
  businessName TEXT,
  businessCategory TEXT,
  businessType TEXT DEFAULT 'individual' CHECK (businessType IN ('individual', 'registered_business')),
  isSeller BOOLEAN DEFAULT FALSE,
  subscriptionExpiry BIGINT,
  contactPhone TEXT,
  workingHours TEXT,
  lastActiveDate TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. LISTINGS TABLE (All 6 Hubs)
-- ============================================
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub TEXT NOT NULL CHECK (hub IN ('marketplace', 'wholesale', 'digital', 'farmer', 'service', 'live')),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT 'KES',
  sellerId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'rejected')),
  location TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  thumbnail TEXT,
  videoUrl TEXT,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now(),
  publishedAt TIMESTAMPTZ,
  rating NUMERIC(3, 2) DEFAULT 0,
  reviewCount INTEGER DEFAULT 0,
  viewCount INTEGER DEFAULT 0,
  favoritedBy TEXT[] DEFAULT ARRAY[]::TEXT[],
  category TEXT,
  subcategory TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Marketplace
  shipping JSONB,
  stock INTEGER,
  
  -- Wholesale
  moq INTEGER,
  bulkPricing JSONB,
  dimensions JSONB,
  
  -- Digital
  downloadLink TEXT,
  fileSize INTEGER,
  fileType TEXT,
  licenseType TEXT,
  accessDuration INTEGER,
  
  -- Farmer
  isFarmerVerified BOOLEAN,
  farmName TEXT,
  farmCoordinates JSONB,
  harvestSeason TEXT,
  farmCertifications TEXT[],
  
  -- Service
  hourlyRate NUMERIC(8, 2),
  serviceType TEXT,
  experienceLevel TEXT,
  availability JSONB,
  portfolio TEXT[],
  certifications TEXT[],
  
  -- Live
  isLiveNow BOOLEAN DEFAULT FALSE,
  streamUrl TEXT,
  streamStartTime TIMESTAMPTZ,
  streamEndTime TIMESTAMPTZ,
  liveViewerCount INTEGER DEFAULT 0,
  liveChannelId TEXT,
  scheduleNextLive TIMESTAMPTZ
);

-- ============================================
-- 3. ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyerId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sellerId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  totalAmount NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT 'KES',
  items JSONB NOT NULL,
  shippingAddress TEXT,
  paymentMethod TEXT,
  notes TEXT,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now(),
  deliveryDate TIMESTAMPTZ
);

-- ============================================
-- 4. PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orderId UUID REFERENCES orders(id) ON DELETE CASCADE,
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT 'KES',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  paymentMethod TEXT,
  transactionId TEXT,
  description TEXT,
  metadata JSONB,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 5. REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listingId UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  sellerId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyerId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  verifiedPurchase BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- NO SAMPLE DATA - SCHEMA ONLY
-- ============================================
-- Schema tables created above. Add your own data via:
-- 1. App sign-up (creates users in auth + users table)
-- 2. Seller onboarding (creates listings)
-- 3. Customer purchases (creates orders + payments)

-- ============================================
-- CREATE INDEXES (Performance)
-- ============================================
CREATE INDEX idx_listings_sellerId ON listings(sellerId);
CREATE INDEX idx_listings_hub ON listings(hub);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_orders_buyerId ON orders(buyerId);
CREATE INDEX idx_orders_sellerId ON orders(sellerId);
CREATE INDEX idx_payments_userId ON payments(userId);
CREATE INDEX idx_reviews_listingId ON reviews(listingId);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- ENABLE ROW LEVEL SECURITY (Optional)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Done! Your Pambo database is ready.
