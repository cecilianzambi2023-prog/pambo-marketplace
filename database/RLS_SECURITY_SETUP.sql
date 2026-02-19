/**
 * SECURITY CONFIGURATION & ROW LEVEL SECURITY (RLS) GUIDE
 * 
 * This file contains all RLS policies needed for Pambo.com
 * RUN ALL THESE QUERIES IN YOUR SUPABASE SQL EDITOR
 * 
 * CRITICAL: These policies ensure:
 * 1. Users can only see their own data
 * 2. Sellers can only modify their own listings
 * 3. PaymentIntents are never exposed to the frontend
 * 4. Admin operations are properly restricted
 */

/**
 * =====================================================
 * 1. ENABLE RLS ON ALL TABLES (CRITICAL)
 * =====================================================
 */

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE liveStreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmerProfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyingRequests ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

/**
 * =====================================================
 * 2. USERS TABLE POLICIES
 * =====================================================
 */

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Allow users to read public seller profiles
CREATE POLICY "Users can read seller profiles"
ON users FOR SELECT
USING (isSeller = true AND accountStatus = 'active');

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Allow authenticated users to insert their profile during signup
CREATE POLICY "Users can create own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

/**
 * =====================================================
 * 3. LISTINGS TABLE POLICIES
 * =====================================================
 */

-- Allow anyone to read active listings
CREATE POLICY "Anyone can read active listings"
ON listings FOR SELECT
USING (status = 'active');

-- Allow sellers to read their own draft listings
CREATE POLICY "Sellers can read own listings"
ON listings FOR SELECT
USING (sellerId = auth.uid());

-- Allow sellers to create listings
CREATE POLICY "Sellers can create listings"
ON listings FOR INSERT
WITH CHECK (sellerId = auth.uid());

-- Allow sellers to update their own listings
CREATE POLICY "Sellers can update own listings"
ON listings FOR UPDATE
USING (sellerId = auth.uid());

-- Allow sellers to delete their own listings
CREATE POLICY "Sellers can delete own listings"
ON listings FOR DELETE
USING (sellerId = auth.uid());

-- Allow admins to manage any listing
CREATE POLICY "Admins can manage listings"
ON listings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

/**
 * =====================================================
 * 4. ORDERS TABLE POLICIES
 * =====================================================
 */

-- Allow buyers to read their own orders
CREATE POLICY "Buyers can read own orders"
ON orders FOR SELECT
USING (buyerId = auth.uid());

-- Allow sellers to read orders they received
CREATE POLICY "Sellers can read received orders"
ON orders FOR SELECT
USING (sellerId = auth.uid());

-- Allow buyers to create orders
CREATE POLICY "Buyers can create orders"
ON orders FOR INSERT
WITH CHECK (buyerId = auth.uid());

-- Allow admins to view all orders
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

/**
 * =====================================================
 * 5. REVIEWS TABLE POLICIES
 * =====================================================
 */

-- Allow anyone to read reviews
CREATE POLICY "Anyone can read reviews"
ON reviews FOR SELECT
USING (true);

-- Allow buyers to create reviews
CREATE POLICY "Buyers can create reviews"
ON reviews FOR INSERT
WITH CHECK (buyerId = auth.uid());

-- Allow buyers to update their own reviews
CREATE POLICY "Buyers can update own reviews"
ON reviews FOR UPDATE
USING (buyerId = auth.uid());

-- Only admins can delete reviews (sellers/buyers cannot delete)
CREATE POLICY "Admins can delete reviews"
ON reviews FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

/**
 * =====================================================
 * 6. PAYMENTS TABLE POLICIES (CRITICAL - NEVER EXPOSE TO FRONTEND)
 * =====================================================
 */

-- NEVER allow frontend to read payments directly
-- Payments are handled via Edge Functions only

-- Edge Function service role can access (via RLS bypass)
-- Frontend MUST NEVER have access to raw payment data

/**
 * =====================================================
 * 7. POSTS TABLE POLICIES (Social Feed)
 * =====================================================
 */

-- Allow anyone to read posts
CREATE POLICY "Anyone can read posts"
ON posts FOR SELECT
USING (true);

-- Allow users to create posts
CREATE POLICY "Users can create posts"
ON posts FOR INSERT
WITH CHECK (authorId = auth.uid());

-- Allow users to update own posts
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
USING (authorId = auth.uid());

/**
 * =====================================================
 * 8. LIVE STREAMS TABLE POLICIES
 * =====================================================
 */

-- Allow anyone to read live streams
CREATE POLICY "Anyone can read live streams"
ON liveStreams FOR SELECT
USING (true);

-- Allow sellers to create live streams
CREATE POLICY "Sellers can create live streams"
ON liveStreams FOR INSERT
WITH CHECK (sellerId = auth.uid());

-- Allow sellers to update own streams
CREATE POLICY "Sellers can update own streams"
ON liveStreams FOR UPDATE
USING (sellerId = auth.uid());

/**
 * =====================================================
 * 9. FAVORITES TABLE POLICIES
 * =====================================================
 */

-- Allow users to read own favorites
CREATE POLICY "Users can read own favorites"
ON favorites FOR SELECT
USING (userId = auth.uid());

-- Allow users to create favorites
CREATE POLICY "Users can create favorites"
ON favorites FOR INSERT
WITH CHECK (userId = auth.uid());

-- Allow users to delete own favorites
CREATE POLICY "Users can delete own favorites"
ON favorites FOR DELETE
USING (userId = auth.uid());

/**
 * =====================================================
 * 10. CARTS TABLE POLICIES
 * =====================================================
 */

-- Allow users to read own cart
CREATE POLICY "Users can read own cart"
ON carts FOR SELECT
USING (userId = auth.uid());

-- Allow users to create cart
CREATE POLICY "Users can create cart"
ON carts FOR INSERT
WITH CHECK (userId = auth.uid());

-- Allow users to update own cart
CREATE POLICY "Users can update own cart"
ON carts FOR UPDATE
USING (userId = auth.uid());

/**
 * =====================================================
 * 11. BUYING REQUESTS TABLE POLICIES
 * =====================================================
 */

-- Allow anyone to read buying requests
CREATE POLICY "Anyone can read buying requests"
ON buyingRequests FOR SELECT
USING (true);

-- Allow buyers to create buying requests
CREATE POLICY "Buyers can create requests"
ON buyingRequests FOR INSERT
WITH CHECK (buyerId = auth.uid());

/**
 * =====================================================
 * 12. FARMER PROFILES TABLE POLICIES
 * =====================================================
 */

-- Allow anyone to read verified farmer profiles
CREATE POLICY "Anyone can read farmer profiles"
ON farmerProfiles FOR SELECT
USING (isVerified = true);

-- Allow farmers to read own profile
CREATE POLICY "Farmers can read own profile"
ON farmerProfiles FOR SELECT
USING (userId = auth.uid());

-- Allow farmers to create own profile
CREATE POLICY "Farmers can create profile"
ON farmerProfiles FOR INSERT
WITH CHECK (userId = auth.uid());

-- Allow farmers to update own profile
CREATE POLICY "Farmers can update own profile"
ON farmerProfiles FOR UPDATE
USING (userId = auth.uid());

/**
 * =====================================================
 * FRONTEND ENVIRONMENT VARIABLES (NEVER EXPOSE SERVICE_ROLE)
 * =====================================================
 * 
 * .env.local (SAFE - Public anon key only):
 * VITE_SUPABASE_URL=https://your-project.supabase.co
 * VITE_SUPABASE_ANON_KEY=eyJ... (public key only)
 * 
 * .env (Server-side only - NEVER in frontend):
 * SUPABASE_SERVICE_ROLE_KEY=eyJ... (NEVER expose to browser)
 * 
 */

/**
 * =====================================================
 * STORAGE POLICIES (For image uploads)
 * =====================================================
 */

-- Create public bucket for listing images
-- INSERT INTO storage.buckets (id, name, public) VALUES ('listings', 'listings', true);

-- Create policy to allow anyone to read listing images
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'listings');

-- Create policy to allow authenticated users to upload
-- CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'listings' AND auth.role() = 'authenticated');

/**
 * =====================================================
 * IMPORTANT SECURITY NOTES
 * =====================================================
 * 
 * 1. PAYMENT HANDLING:
 *    - NEVER fetch payment data through RLS policies
 *    - ALWAYS use Edge Functions (service role key on backend only)
 *    - Edge Functions NEVER expose sensitive data to client
 * 
 * 2. SERVICE ROLE KEY:
 *    - Keep ONLY on server/Edge Functions
 *    - NEVER commit to git
 *    - NEVER send to browser
 *    - Use separate .env files: .env.local (public), .env (private)
 * 
 * 3. AUTHENTICATION:
 *    - Use Supabase Auth with secure cookies (HTTP-only)
 *    - Implement session refresh before expiry
 *    - Clear session on logout
 * 
 * 4. RATE LIMITING:
 *    - Enable on Edge Functions
 *    - Implement in RLS for high-traffic tables
 * 
 * 5. AUDIT LOGGING:
 *    - Log all admin actions to adminLogs table
 *    - Log all payment transactions (server-side only)
 *    - Implement with Edge Functions
 */
