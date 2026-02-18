ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

ALTER TABLE listing_comments
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

UPDATE reviews
SET status = 'approved'
WHERE status IS NULL;

UPDATE listing_comments
SET status = 'approved'
WHERE status IS NULL;

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read reviews" ON reviews;
CREATE POLICY "Public can read reviews"
ON reviews
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert reviews" ON reviews;
CREATE POLICY "Users can insert reviews"
ON reviews
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can moderate reviews" ON reviews;
CREATE POLICY "Admin can moderate reviews"
ON reviews
FOR UPDATE
USING (true)
WITH CHECK (true);
