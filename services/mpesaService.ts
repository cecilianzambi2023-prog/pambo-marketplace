// services/mpesaService.ts
import { supabaseClient } from '../src/lib/supabaseClient';

export interface STKPushRequest {
  seller_id: string;
  seller_name: string;
  phone_number: string;
  amount: number;
  tier: string;
  user_id: string;
}

export interface STKPushResponse {
  success: boolean;
  message: string;
  data?: {
    merchantRequestId: string;
    checkoutRequestId: string;
    responseCode: string;
    customerMessage: string;
  };
  error?: string;
  details?: string;
}

/**
 * Subscription tier pricing and configuration
 * Production pricing for Offspring Decor Limited
 */
export const SUBSCRIPTION_TIERS = {
  mkulima: {
    name: 'Mkulima Starter',
    price: 1500,
    currency: 'KES',
    billing_period: 'YEARLY',
    hubs: ['mkulima'],
    description: 'Access to Mkulima hub for 1 year'
  },
  starter: {
    name: 'Starter',
    price: 3500,
    currency: 'KES',
    billing_period: 'MONTHLY',
    hubs: ['marketplace'],
    description: 'Monthly marketplace access'
  },
  pro: {
    name: 'Pro',
    price: 5000,
    currency: 'KES',
    billing_period: 'MONTHLY',
    hubs: ['marketplace', 'services'],
    description: 'Marketplace + Services access'
  },
  enterprise: {
    name: 'Enterprise',
    price: 9000,
    currency: 'KES',
    billing_period: 'MONTHLY',
    hubs: ['marketplace', 'services', 'mkulima'],
    description: 'Full platform access'
  },
};

/**
 * Initiate M-Pesa STK Push for subscription payment (NEW API)
 * Shows payment prompt on user's phone
 */
export async function initiateMPesaSTKPush(
  request: STKPushRequest
): Promise<STKPushResponse> {
  try {
    // Sending payment request to M-Pesa

    const { data, error } = await supabaseClient.functions.invoke(
      'mpesa-stk-push',
      {
        body: request,
      }
    );

    if (error) {
      console.error('M-Pesa STK Push error:', error);
      return {
        success: false,
        message: 'Failed to initiate payment',
        error: error.message,
      };
    }

    // M-Pesa response received
    
    // If payment succeeded and Enterprise tier, send admin alert
    if (data.success && request.tier === 'enterprise') {
      const sellerName = request.seller_name || 'Unknown';
      const phone = request.phone_number || '';
      sendEnterprisePaymentAlert(
        request.tier,
        SUBSCRIPTION_TIERS.enterprise.price,
        request.seller_id,
        sellerName,
        phone
      ).catch(err => console.error('Failed to send enterprise alert:', err));
    }
    
    return {
      success: data.success || false,
      message: data.message || 'Payment request processed',
      data: data.data,
      error: data.error,
    };
  } catch (err) {
    console.error('M-Pesa exception:', err);
    return {
      success: false,
      message: 'Failed to initiate payment',
      details: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Format phone number to M-Pesa format (254XXXXXXXXX)
 */
export function formatPhoneForMPesa(phone: string): string {
  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // If starts with 0, replace with 254
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  }
  // If doesn't start with 254, prepend it
  else if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned;
  }

  return cleaned;
}

/**
 * Validate phone number format (Kenya)
 */
export function isValidMPesaPhone(phone: string): boolean {
  const formatted = formatPhoneForMPesa(phone);
  // Must be 254 + 9 digits = 12 total
  return /^254\d{9}$/.test(formatted);
}

/**
 * Get subscription tier info by key
 */
export function getTierInfo(tier: string) {
  return SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
}

/**
 * Get tier price
 */
export function getTierPrice(tier: string): number {
  return SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]?.price || 0;
}

/**
 * Get tier name
 */
export function getTierName(tier: string): string {
  return SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]?.name || tier;
}

/**
 * Get hubs accessible for a tier
 */
export function getTierHubs(tier: string): string[] {
  return SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]?.hubs || [];
}

/**
 * Send admin alert for Enterprise (KES 9,000) payment success
 * Notifies info@pambo.biz of high-value transactions
 * @param tier - Subscription tier purchased
 * @param amount - Amount paid in KES
 * @param seller_id - Seller who made the purchase
 * @param seller_name - Seller's business name
 * @param phone - M-Pesa phone number used
 * @returns Success status
 */
export const sendEnterprisePaymentAlert = async (
  tier: string,
  amount: number,
  seller_id: string,
  seller_name: string,
  phone: string
): Promise<boolean> => {
  try {
    // Only alert for Enterprise tier (KES 9,000)
    if (tier !== 'enterprise' || amount !== 9000) {
      return false;
    }

    // Send internal notification to admin email
    const emailData = {
      to: 'info@pambo.biz',
      subject: `🎉 ENTERPRISE PAYMENT RECEIVED - KES ${amount}`,
      html: `
        <h2 style="color: #16a34a;">✅ Enterprise Subscription Payment Confirmed</h2>
        <hr/>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; font-weight: bold; background: #f3f4f6;">Seller Name:</td>
            <td style="padding: 8px;">${seller_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; background: #f3f4f6;">Seller ID:</td>
            <td style="padding: 8px;">${seller_id}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; background: #f3f4f6;">Subscription Tier:</td>
            <td style="padding: 8px;"><strong>${tier.toUpperCase()}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; background: #f3f4f6;">Amount Paid:</td>
            <td style="padding: 8px; color: #16a34a; font-weight: bold;">KES ${amount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; background: #f3f4f6;">Phone Number:</td>
            <td style="padding: 8px;">${phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; background: #f3f4f6;">Timestamp:</td>
            <td style="padding: 8px;">${new Date().toISOString()}</td>
          </tr>
        </table>
        <hr/>
        <p style="color: #666;">Access: Check <strong>Admin Analytics Dashboard</strong> for full revenue details.</p>
      `
    };

    // Log the alert (in production, this would send via email service)
    console.log('\ud83c\udf89 ENTERPRISE PAYMENT ALERT:', emailData);

    // Optional: Store alert in database for dashboard
    await supabaseClient
      .from('admin_alerts')
      .insert([
        {
          alert_type: 'enterprise_payment',
          seller_id,
          amount,
          tier,
          phone,
          message: `Enterprise payment of KES ${amount} received from ${seller_name}`,
          read: false,
          created_at: new Date().toISOString()
        }
      ]);

    return true;
  } catch (error) {
    console.error('Error sending enterprise payment alert:', error);
    return false;
  }
};

/**
 * Legacy function for backward compatibility
 * Initiates M-Pesa STK Push with simple parameters
 * @deprecated Use initiateMPesaSTKPush instead
 */
export async function initiateSTKPush(
  phoneNumber: string,
  amount: number,
  tier = 'mkulima',
  userId = 'demo-user'
) {
  const response = await initiateMPesaSTKPush({
    seller_id: userId,
    seller_name: '',
    phone_number: phoneNumber,
    amount: amount,
    tier: tier,
    user_id: userId,
  });

  // Convert to old response format for backward compatibility
  return {
    ResponseCode: response.success ? '0' : '1',
    ResponseDescription: response.message,
    CustomerMessage: response.data?.customerMessage || response.message,
    MerchantRequestID: response.data?.merchantRequestId,
    CheckoutRequestID: response.data?.checkoutRequestId,
  };
}