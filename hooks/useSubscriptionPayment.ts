import { useState } from 'react';
import { supabase } from '../supabaseClient';

interface PaymentRequest {
  tier: 'mkulima' | 'starter' | 'pro' | 'enterprise';
  amount: number;
  phone: string;
  userId: string;
  email?: string;
}

interface PaymentResponse {
  success: boolean;
  message: string;
  paymentId?: string;
  orderId?: string;
  error?: string;
}

/**
 * Hook to handle subscription payments via M-Pesa
 * Integrates with the mpesa-payment Deno Edge Function
 */
export const useSubscriptionPayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Initiate a subscription payment
   * @param request - Payment details
   * @returns Payment response with status and details
   */
  const initiatePayment = async (request: PaymentRequest): Promise<PaymentResponse> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate phone number
      if (!request.phone || !request.phone.startsWith('254')) {
        throw new Error('Please enter a valid M-Pesa phone number (starting with 254)');
      }

      // Validate amount matches tier
      const validAmounts: { [key: string]: number } = {
        mkulima: 1500,
        starter: 3500,
        pro: 5000,
        enterprise: 9000,
      };

      if (validAmounts[request.tier] !== request.amount) {
        throw new Error(`Invalid amount for ${request.tier} tier`);
      }

      // Get auth token
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session) {
        throw new Error('Please log in to proceed with payment');
      }

      // Call the M-Pesa payment Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('mpesa-payment', {
        body: {
          phone: request.phone,
          amount: request.amount,
          orderId: `sub_${request.tier}_${Date.now()}`,
          description: `${request.tier.charAt(0).toUpperCase() + request.tier.slice(1)} Subscription - Offspring Decor Limited`,
          buyerId: request.userId,
          userEmail: request.email,
          subscriptionType: request.tier,
        },
      });

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message || 'Payment initiation failed');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Payment failed. Please try again.');
      }

      setSuccess(true);
      return {
        success: true,
        message: 'Payment initiated. Please check your M-Pesa phone for the prompt.',
        paymentId: data.paymentId,
        orderId: data.orderId,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get the tier name for display
   */
  const getTierName = (tier: string): string => {
    const names: { [key: string]: string } = {
      mkulima: 'Mkulima Mdogo',
      starter: 'Starter',
      pro: 'Pro',
      enterprise: 'Enterprise',
    };
    return names[tier] || tier;
  };

  /**
   * Get the period for display
   */
  const getPeriod = (tier: string): string => {
    return tier === 'mkulima' ? '1 Year' : 'Monthly';
  };

  return {
    loading,
    error,
    success,
    initiatePayment,
    getTierName,
    getPeriod,
  };
};

/**
 * Verify payment status
 */
export const checkPaymentStatus = async (paymentId: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error checking payment status:', err);
    return null;
  }
};

/**
 * Get user's current subscription
 */
export const getUserSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_expiry, subscription_start_date, subscription_period_days')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching subscription:', err);
    return null;
  }
};
