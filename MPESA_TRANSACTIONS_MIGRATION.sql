S-- ============================================
-- M-PESA TRANSACTIONS & FARMER SUBSCRIPTION
-- ============================================

-- ============================================
-- 1. TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mpesa_receipt_number VARCHAR(100) UNIQUE NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'KES',
  transaction_date VARCHAR(50), -- From M-Pesa: YYYYMMDDHHmmss
  mpesa_reference VARCHAR(100),
  status VARCHAR(50) DEFAULT 'completed', -- completed, failed, refunded
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_mpesa_receipt ON transactions(mpesa_receipt_number);
CREATE INDEX idx_transactions_payment_id ON transactions(payment_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- ============================================
-- 2. UPDATE PAYMENTS TABLE (add missing columns)
-- ============================================
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS checkout_request_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS mpesa_receipt_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- ============================================
-- 3. FARMER SUBSCRIPTION FUNCTION
-- ============================================
-- This is an RPC function that automatically grants
-- a 1-year Mkulima subscription on successful M-Pesa payment

CREATE OR REPLACE FUNCTION activate_farmer_subscription(
  p_user_id UUID,
  p_months INTEGER DEFAULT 12,
  p_transaction_id UUID,
  p_mpesa_receipt VARCHAR(100)
)
RETURNS JSON AS $$
DECLARE
  v_subscription_record RECORD;
  v_result JSON;
  v_next_billing_date TIMESTAMP;
BEGIN
  -- Calculate next billing date
  v_next_billing_date := NOW() + (p_months || ' months')::INTERVAL;

  -- Insert or update subscription record
  INSERT INTO subscriptions (
    userId,
    hub,
    plan,
    monthlyPrice,
    status,
    billingCycle,
    startDate,
    nextBillingDate,
    activatedAt,
    transactionId,
    createdAt,
    updatedAt
  ) VALUES (
    p_user_id,
    'farmer',
    'mkulima',
    0, -- Free for 1 year as promotional offer
    'active',
    'monthly',
    NOW(),
    v_next_billing_date,
    NOW(),
    p_transaction_id::TEXT,
    NOW(),
    NOW()
  )
  ON CONFLICT (userId, hub, status) 
  WHERE status = 'active'
  DO UPDATE SET
    nextBillingDate = v_next_billing_date,
    updatedAt = NOW()
  RETURNING * INTO v_subscription_record;

  -- Update farmer profile with subscription end date
  UPDATE farmerProfiles
  SET subscriptionEnd = v_next_billing_date,
      isVerified = TRUE,
      updated_at = NOW()
  WHERE userId = p_user_id;

  -- Log this action in audit log
  INSERT INTO admin_audit_log (
    action,
    targetType,
    targetId,
    details
  ) VALUES (
    'farmer_subscription_activated',
    'subscription',
    p_user_id::TEXT,
    jsonb_build_object(
      'transaction_id', p_transaction_id,
      'mpesa_receipt', p_mpesa_receipt,
      'months', p_months,
      'expiry_date', v_next_billing_date,
      'plan', 'mkulima_promotional'
    )
  );

  -- Return success response
  v_result := jsonb_build_object(
    'success', TRUE,
    'subscription_id', v_subscription_record.id,
    'user_id', p_user_id,
    'plan', 'mkulima',
    'duration_months', p_months,
    'active_until', v_next_billing_date,
    'message', 'Mkulima subscription activated for ' || p_months || ' months'
  );

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  -- Return error response
  v_result := jsonb_build_object(
    'success', FALSE,
    'error', SQLERRM,
    'user_id', p_user_id,
    'message', 'Failed to activate subscription'
  );
  
  -- Log error
  INSERT INTO admin_audit_log (
    action,
    targetType,
    targetId,
    details
  ) VALUES (
    'farmer_subscription_activation_error',
    'subscription_error',
    p_user_id::TEXT,
    jsonb_build_object(
      'error_message', SQLERRM,
      'transaction_id', p_transaction_id,
      'mpesa_receipt', p_mpesa_receipt
    )
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. ENABLE RLS FOR TRANSACTIONS TABLE
-- ============================================
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own transactions
CREATE POLICY "users_can_see_own_transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Only admin/service role can insert transactions (from functions)
CREATE POLICY "service_can_insert_transactions" ON transactions
  FOR INSERT WITH CHECK (TRUE);

-- ============================================
-- 5. HELPER FUNCTION: GET USER'S ACTIVE MKULIMA SUBSCRIPTION
-- ============================================
CREATE OR REPLACE FUNCTION get_user_mkulima_status(p_user_id UUID)
RETURNS TABLE(
  is_active BOOLEAN,
  plan VARCHAR,
  expires_at TIMESTAMP,
  days_remaining BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (s.status = 'active' AND s.nextBillingDate > NOW())::BOOLEAN,
    s.plan,
    s.nextBillingDate,
    EXTRACT(DAY FROM (s.nextBillingDate - NOW()))::BIGINT
  FROM subscriptions s
  WHERE s.userId = p_user_id 
    AND s.hub = 'farmer'
    AND s.status = 'active'
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. TRIGGER: Auto-update Mkulima farmers on subscription change
-- ============================================
CREATE OR REPLACE FUNCTION update_farmer_subscription_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.hub = 'farmer' AND NEW.status = 'active' THEN
    UPDATE farmerProfiles
    SET isVerified = TRUE,
        updated_at = NOW()
    WHERE userId = NEW.userId;
  ELSIF NEW.hub = 'farmer' AND NEW.status != 'active' THEN
    UPDATE farmerProfiles
    SET isVerified = FALSE,
        updated_at = NOW()
    WHERE userId = NEW.userId;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER farmer_subscription_status_trigger
AFTER INSERT OR UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_farmer_subscription_trigger();

-- ============================================
-- 7. SAMPLE AUDIT ENTRY
-- ============================================
-- Verify the function works with:
-- SELECT * FROM activate_farmer_subscription(
--   p_user_id := uuid_column_value,
--   p_months := 12,
--   p_transaction_id := transaction_uuid,
--   p_mpesa_receipt := 'QI75QWI7K8'
-- );
