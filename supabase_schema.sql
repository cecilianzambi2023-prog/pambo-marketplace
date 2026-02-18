-- Pambo 6-in-1 Marketplace - Complete Database Schema
-- Run this in Supabase SQL Editor

-- =====================================
-- 1. USERS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  phone VARCHAR(20),
  avatar VARCHAR(500),
  role VARCHAR(50) NOT NULL DEFAULT 'buyer',
  verified BOOLEAN DEFAULT FALSE,
  accountStatus VARCHAR(50) DEFAULT 'active',
  joinDate TIMESTAMP DEFAULT NOW(),
  bio TEXT,
  following UUID[],
  followers UUID[],
  acceptedTermsTimestamp BIGINT,
  nationalId VARCHAR(50),
  businessName VARCHAR(255),
  businessCategory VARCHAR(100),
  businessType VARCHAR(50),
  isSeller BOOLEAN DEFAULT FALSE,
  subscriptionExpiry BIGINT,
  contactPhone VARCHAR(20),
  workingHours VARCHAR(255),
  lastActiveDate TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- 2. LISTINGS TABLE (All 6 Hubs)
-- =====================================
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'KES',
  sellerId UUID NOT NULL REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'draft',
  location VARCHAR(255),
  images VARCHAR(500)[],
  thumbnail VARCHAR(500),
  videoUrl VARCHAR(500),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  publishedAt TIMESTAMP,
  rating DECIMAL(2, 1) DEFAULT 0,
  reviewCount INTEGER DEFAULT 0,
  viewCount INTEGER DEFAULT 0,
  favoritedBy UUID[],
  category VARCHAR(100),
  subcategory VARCHAR(100),
  tags VARCHAR(100)[],
  
  -- MARKETPLACE
  shipping JSONB,
  stock INTEGER,
  
  -- WHOLESALE
  moq INTEGER,
  bulkPricing JSONB,
  dimensions JSONB,
  
  -- DIGITAL
  downloadLink VARCHAR(500),
  fileSize INTEGER,
  fileType VARCHAR(50),
  licenseType VARCHAR(50),
  accessDuration INTEGER,
  
  -- FARMER
  isFarmerVerified BOOLEAN,
  farmName VARCHAR(255),
  farmCoordinates JSONB,
  harvestSeason VARCHAR(100),
  farmCertifications VARCHAR(100)[],
  
  -- SERVICE
  hourlyRate DECIMAL(10, 2),
  serviceType VARCHAR(100),
  experienceLevel VARCHAR(50),
  availability JSONB,
  portfolio VARCHAR(500)[],
  certifications VARCHAR(100)[],
  
  -- LIVE COMMERCE
  isLiveNow BOOLEAN DEFAULT FALSE,
  streamUrl VARCHAR(500),
  streamStartTime TIMESTAMP,
  streamEndTime TIMESTAMP,
  liveViewerCount INTEGER DEFAULT 0,
  liveChannelId VARCHAR(255),
  scheduleNextLive TIMESTAMP,
  
  -- SELLER CONTACT
  sellerPhone VARCHAR(20),
  sellerEmail VARCHAR(255),
  whatsappNumber VARCHAR(20),
  
  -- METADATA
  boost JSONB,
  isVerified BOOLEAN DEFAULT FALSE,
  flags VARCHAR(100)[],
  
  CONSTRAINT valid_hub CHECK (hub IN ('marketplace', 'wholesale', 'digital', 'farmer', 'service', 'live'))
);

CREATE INDEX listings_hub_idx ON listings(hub);
CREATE INDEX listings_sellerId_idx ON listings(sellerId);
CREATE INDEX listings_status_idx ON listings(status);
CREATE INDEX listings_category_idx ON listings(category);
CREATE INDEX listings_location_idx ON listings(location);

-- =====================================
-- 3. ORDERS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyerId UUID NOT NULL REFERENCES users(id),
  sellerId UUID NOT NULL REFERENCES users(id),
  listings JSONB NOT NULL,
  totalAmount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'KES',
  status VARCHAR(50) DEFAULT 'pending',
  paymentMethod VARCHAR(50),
  transactionId VARCHAR(255),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  shippingAddress TEXT,
  tracking JSONB
);

CREATE INDEX orders_buyerId_idx ON orders(buyerId);
CREATE INDEX orders_sellerId_idx ON orders(sellerId);
CREATE INDEX orders_status_idx ON orders(status);

-- =====================================
-- 4. REVIEWS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listingId UUID NOT NULL REFERENCES listings(id),
  buyerId UUID NOT NULL REFERENCES users(id),
  sellerId UUID NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  images VARCHAR(500)[],
  helpfulCount INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE INDEX reviews_listingId_idx ON reviews(listingId);
CREATE INDEX reviews_sellerId_idx ON reviews(sellerId);
CREATE INDEX reviews_buyerId_idx ON reviews(buyerId);

-- =====================================
-- 5. PAYMENTS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orderId UUID NOT NULL REFERENCES orders(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'KES',
  paymentMethod VARCHAR(50),
  phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'pending',
  description TEXT,
  transactionId VARCHAR(255),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE INDEX payments_orderId_idx ON payments(orderId);
CREATE INDEX payments_status_idx ON payments(status);

-- =====================================
-- 6. REFUNDS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paymentId UUID NOT NULL REFERENCES payments(id),
  orderId UUID NOT NULL REFERENCES orders(id),
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT NOW(),
  processedAt TIMESTAMP
);

-- =====================================
-- 7. PAYOUTS TABLE (Seller Earnings)
-- =====================================
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sellerId UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  mpesaNumber VARCHAR(20),
  status VARCHAR(50) DEFAULT 'pending',
  transactionId VARCHAR(255),
  createdAt TIMESTAMP DEFAULT NOW(),
  processedAt TIMESTAMP
);

CREATE INDEX payouts_sellerId_idx ON payouts(sellerId);

-- =====================================
-- 8. SOCIAL FEED (Posts)
-- =====================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  authorId UUID NOT NULL REFERENCES users(id),
  text TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  imageUrl VARCHAR(500),
  productId UUID REFERENCES listings(id),
  likes UUID[],
  comments JSONB[]
);

CREATE INDEX posts_authorId_idx ON posts(authorId);
CREATE INDEX posts_timestamp_idx ON posts(timestamp);

-- =====================================
-- 9. BUYING REQUESTS (B2B)
-- =====================================
CREATE TABLE IF NOT EXISTS buyingRequests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyerId UUID NOT NULL REFERENCES users(id),
  buyerName VARCHAR(255),
  timestamp TIMESTAMP DEFAULT NOW(),
  title VARCHAR(255),
  category VARCHAR(100),
  quantity VARCHAR(100),
  description TEXT,
  status VARCHAR(50) DEFAULT 'open'
);

CREATE INDEX buyingRequests_buyerId_idx ON buyingRequests(buyerId);
CREATE INDEX buyingRequests_status_idx ON buyingRequests(status);

-- =====================================
-- 10. FARMER PROFILES
-- =====================================
CREATE TABLE IF NOT EXISTS farmerProfiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL UNIQUE REFERENCES users(id),
  phone VARCHAR(20),
  location VARCHAR(255),
  crop VARCHAR(255),
  coordinates JSONB,
  county VARCHAR(100),
  distance DECIMAL(10, 2),
  pricePerUnit DECIMAL(10, 2),
  unit VARCHAR(50),
  deliveryInsight TEXT,
  subscriptionEnd TIMESTAMP,
  isVerified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- 11. LIVE STREAMS
-- =====================================
CREATE TABLE IF NOT EXISTS liveStreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sellerId UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255),
  description TEXT,
  featuredProductId UUID REFERENCES listings(id),
  status VARCHAR(50) DEFAULT 'upcoming',
  viewerCount INTEGER DEFAULT 0,
  startTime TIMESTAMP,
  endTime TIMESTAMP,
  thumbnailUrl VARCHAR(500),
  violationReason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX liveStreams_sellerId_idx ON liveStreams(sellerId);
CREATE INDEX liveStreams_status_idx ON liveStreams(status);

-- =====================================
-- 12. CART (Temporary)
-- =====================================
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id),
  items JSONB NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- 13. FAVORITES
-- =====================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id),
  listingId UUID NOT NULL REFERENCES listings(id),
  createdAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(userId, listingId)
);

CREATE INDEX favorites_userId_idx ON favorites(userId);

-- =====================================
-- 14. ADMIN LOGS
-- =====================================
CREATE TABLE IF NOT EXISTS adminLogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adminId UUID NOT NULL REFERENCES users(id),
  action VARCHAR(255),
  targetId UUID,
  details JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- 15. DISPUTE/SUPPORT TICKETS
-- =====================================
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id),
  orderId UUID REFERENCES orders(id),
  subject VARCHAR(255),
  description TEXT,
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(50) DEFAULT 'normal',
  createdAt TIMESTAMP DEFAULT NOW(),
  resolvedAt TIMESTAMP,
  resolution TEXT
);

-- Enable RLS (Row Level Security) for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (you can expand these)
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Storage buckets (create via Supabase UI or use this):
-- INSERT INTO storage.buckets (id, name) VALUES ('listings', 'listings');
-- INSERT INTO storage.buckets (id, name) VALUES ('avatars', 'avatars');
-- INSERT INTO storage.buckets (id, name) VALUES ('reviews', 'reviews');
