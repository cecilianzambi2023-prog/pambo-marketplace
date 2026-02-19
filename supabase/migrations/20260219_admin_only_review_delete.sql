-- Enforce admin-only review deletion (buyers/sellers cannot delete reviews)
-- Date: 2026-02-19

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Remove permissive/legacy delete policies if they exist
DROP POLICY IF EXISTS "reviews_delete_author_only" ON reviews;
DROP POLICY IF EXISTS "Buyers can delete own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
DROP POLICY IF EXISTS "Review owners can delete reviews" ON reviews;
DROP POLICY IF EXISTS "Admin can delete reviews" ON reviews;

-- Admin-only delete policy
CREATE POLICY "Admin can delete reviews"
ON reviews
FOR DELETE
USING (
  auth.uid() IN (
    SELECT id
    FROM users
    WHERE role = 'admin'
  )
);
