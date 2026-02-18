CREATE TABLE IF NOT EXISTS listing_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listingId UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  sellerId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyerId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  authorName TEXT,
  comment TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS listing_comments_listing_idx ON listing_comments(listingId);
CREATE INDEX IF NOT EXISTS listing_comments_seller_idx ON listing_comments(sellerId);
CREATE INDEX IF NOT EXISTS listing_comments_created_idx ON listing_comments(createdAt DESC);

ALTER TABLE listing_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read listing comments" ON listing_comments;
CREATE POLICY "Public can read listing comments"
ON listing_comments
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert listing comments" ON listing_comments;
CREATE POLICY "Authenticated users can insert listing comments"
ON listing_comments
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can moderate listing comments" ON listing_comments;
CREATE POLICY "Admin can moderate listing comments"
ON listing_comments
FOR UPDATE
USING (true)
WITH CHECK (true);
