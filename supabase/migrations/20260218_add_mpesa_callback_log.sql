-- =====================================================
-- M-PESA CALLBACK AUDIT LOG MIGRATION
-- =====================================================
-- 
-- PURPOSE: Create permanent audit trail for all M-Pesa callbacks
-- 
-- CRITICAL SECURITY FEATURE:
-- - Logs ALL callback attempts (successful and failed)
-- - Detects duplicate callbacks
-- - Tracks signature validation
-- - Enables payment reconciliation
-- - Provides forensic evidence of payment attempts
--
-- RUN THIS: Supabase Dashboard → SQL Editor → New Query
--
-- =====================================================

-- 1. CREATE CALLBACK LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS mpesa_callback_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- M-Pesa callback identifiers
  merchant_request_id TEXT NOT NULL,
  checkout_request_id TEXT NOT NULL,
  
  -- Callback result
  result_code INTEGER NOT NULL,  -- 0=success, 1=insufficient funds, etc.
  result_desc TEXT,
  
  -- Transaction details (only present on success)
  mpesa_receipt_number TEXT,
  transaction_amount NUMERIC(10,2),
  phone_number TEXT,
  
  -- Full callback payload (for debugging)
  raw_callback JSONB NOT NULL,
  
  -- Security metadata
  ip_address TEXT,
  signature_valid BOOLEAN DEFAULT NULL,  -- NULL = no signature provided
  signature_header TEXT,
  
  -- User context (if payment record found)
  user_id UUID,
  subscription_tier TEXT,
  
  -- Processing status
  processing_status TEXT DEFAULT 'received' CHECK (
    processing_status IN ('received', 'processed', 'failed', 'duplicate')
  ),
  processing_error TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- 2. CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_callback_log_checkout 
  ON mpesa_callback_log(checkout_request_id);

CREATE INDEX IF NOT EXISTS idx_callback_log_merchant 
  ON mpesa_callback_log(merchant_request_id);

CREATE INDEX IF NOT EXISTS idx_callback_log_created 
  ON mpesa_callback_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_callback_log_result_code 
  ON mpesa_callback_log(result_code);

CREATE INDEX IF NOT EXISTS idx_callback_log_user 
  ON mpesa_callback_log(user_id) 
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_callback_log_receipt 
  ON mpesa_callback_log(mpesa_receipt_number) 
  WHERE mpesa_receipt_number IS NOT NULL;

-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE mpesa_callback_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view callback logs (sensitive payment data)
CREATE POLICY "Only admins can view callback logs"
  ON mpesa_callback_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.email = 'info@pambo.biz')
    )
  );

-- Service role can insert (Edge Functions use service_role)
CREATE POLICY "Service role can insert callback logs"
  ON mpesa_callback_log
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- 4. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to check for duplicate callbacks
CREATE OR REPLACE FUNCTION check_duplicate_callback(
  p_checkout_request_id TEXT,
  p_result_code INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM mpesa_callback_log
    WHERE checkout_request_id = p_checkout_request_id
    AND result_code = p_result_code
    AND processing_status = 'processed'
  ) INTO v_exists;
  
  RETURN v_exists;
END;
$$;

-- Function to get callback stats (for admin dashboard)
CREATE OR REPLACE FUNCTION get_callback_stats(
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  total_callbacks BIGINT,
  successful_payments BIGINT,
  failed_payments BIGINT,
  duplicate_attempts BIGINT,
  invalid_signatures BIGINT,
  total_amount NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_callbacks,
    COUNT(*) FILTER (WHERE result_code = 0)::BIGINT as successful_payments,
    COUNT(*) FILTER (WHERE result_code != 0)::BIGINT as failed_payments,
    COUNT(*) FILTER (WHERE processing_status = 'duplicate')::BIGINT as duplicate_attempts,
    COUNT(*) FILTER (WHERE signature_valid = false)::BIGINT as invalid_signatures,
    COALESCE(SUM(transaction_amount) FILTER (WHERE result_code = 0), 0) as total_amount
  FROM mpesa_callback_log
  WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$;

-- 5. CREATE VIEW FOR ADMIN DASHBOARD
-- =====================================================

CREATE OR REPLACE VIEW mpesa_callback_summary AS
SELECT
  id,
  checkout_request_id,
  result_code,
  CASE 
    WHEN result_code = 0 THEN 'Success'
    WHEN result_code = 1 THEN 'Insufficient Funds'
    WHEN result_code = 1032 THEN 'Cancelled by User'
    ELSE 'Failed (' || result_code || ')'
  END as status,
  mpesa_receipt_number,
  transaction_amount,
  phone_number,
  user_id,
  subscription_tier,
  signature_valid,
  processing_status,
  created_at
FROM mpesa_callback_log
ORDER BY created_at DESC;

-- 6. GRANT PERMISSIONS
-- =====================================================

-- Allow service role full access (for Edge Functions)
GRANT ALL ON mpesa_callback_log TO service_role;
GRANT EXECUTE ON FUNCTION check_duplicate_callback TO service_role;
GRANT EXECUTE ON FUNCTION get_callback_stats TO service_role;

-- 7. ADD COMMENTS
-- =====================================================

COMMENT ON TABLE mpesa_callback_log IS 
  'Audit trail for all M-Pesa payment callbacks. Used for security, reconciliation, and fraud detection.';

COMMENT ON COLUMN mpesa_callback_log.signature_valid IS 
  'Whether the callback signature was valid. NULL = no signature provided (legacy).';

COMMENT ON COLUMN mpesa_callback_log.processing_status IS 
  'received = just logged | processed = payment updated | failed = error | duplicate = already processed';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- 
-- NEXT STEPS:
-- 1. Update mpesa-callback Edge Function to use this table
-- 2. Implement signature validation in callback handler
-- 3. Set MPESA_CALLBACK_SECRET in Edge Function secrets
-- 4. Monitor mpesa_callback_summary view for issues
--
-- TESTING:
-- SELECT * FROM get_callback_stats(7);
-- SELECT * FROM mpesa_callback_summary LIMIT 20;
--
-- =====================================================
