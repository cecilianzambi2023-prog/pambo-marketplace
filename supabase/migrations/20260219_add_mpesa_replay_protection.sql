-- Add replay-protection metadata to callback audit log
ALTER TABLE IF EXISTS mpesa_callback_log
  ADD COLUMN IF NOT EXISTS request_nonce TEXT,
  ADD COLUMN IF NOT EXISTS request_timestamp TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_callback_log_request_nonce
  ON mpesa_callback_log(request_nonce)
  WHERE request_nonce IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_callback_log_request_timestamp
  ON mpesa_callback_log(request_timestamp DESC)
  WHERE request_timestamp IS NOT NULL;

CREATE OR REPLACE FUNCTION check_recent_callback_nonce(
  p_nonce TEXT,
  p_window_seconds INTEGER DEFAULT 300
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  IF p_nonce IS NULL OR length(trim(p_nonce)) = 0 THEN
    RETURN FALSE;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM mpesa_callback_log
    WHERE request_nonce = p_nonce
      AND created_at >= NOW() - (GREATEST(p_window_seconds, 30) || ' seconds')::INTERVAL
  ) INTO v_exists;

  RETURN v_exists;
END;
$$;

GRANT EXECUTE ON FUNCTION check_recent_callback_nonce(TEXT, INTEGER) TO service_role;
