import { supabase } from '../src/lib/supabaseClient';

export interface MpesaPaymentRequest {
  phone: string;           // Customer phone number
  amount: number;          // Amount in KES
  orderId: string;         // Pambo order ID
  description: string;     // Payment description
  callbackUrl?: string;    // URL for M-Pesa callbacks
}

export interface MpesaPaymentResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

/**
 * Initiate M-Pesa payment (STK Push)
 */
export const initiateMpesaPayment = async (paymentRequest: MpesaPaymentRequest) => {
  try {
    // In production, call your backend API which calls Safaricom's M-Pesa API
    // For now, we're creating a payment record in Supabase
    
    const { data, error } = await supabase
      .from('payments')
      .insert({
        orderId: paymentRequest.orderId,
        amount: paymentRequest.amount,
        currency: 'KES',
        paymentMethod: 'mpesa',
        phone: paymentRequest.phone,
        status: 'pending',
        description: paymentRequest.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select();

    if (error) throw error;

    // TODO: In production, call your backend to initiate actual M-Pesa request
    // const response = await fetch('/api/payments/mpesa/initiate', {
    //   method: 'POST',
    //   body: JSON.stringify(paymentRequest)
    // });

    return {
      success: true,
      payment: data?.[0],
      message: 'Payment initiated. Please check your phone for M-Pesa prompt.',
    };
  } catch (error) {
    console.error('M-Pesa payment initiation error:', error);
    return { success: false, error };
  }
};

/**
 * Verify M-Pesa payment
 */
export const verifyMpesaPayment = async (orderId: string) => {
  try {
    // Check payment status in Supabase
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*')
      .eq('orderId', orderId)
      .eq('paymentMethod', 'mpesa')
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    return {
      success: true,
      payment,
      isPaid: payment?.status === 'completed',
    };
  } catch (error) {
    console.error('M-Pesa payment verification error:', error);
    return { success: false, error };
  }
};

/**
 * Handle M-Pesa callback (called by M-Pesa API)
 * In production, put this in your backend API
 */
export const handleMpesaCallback = async (callbackData: any) => {
  try {
    const { Body } = callbackData;
    const { stkCallback } = Body;

    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata?.CallbackMetadataItem || [];
      const transactionData = Object.fromEntries(
        callbackMetadata.map((item: any) => [item.Name, item.Value])
      );

      const orderId = transactionData['Checkout ID'] || stkCallback.MerchantRequestID;
      const transactionId = transactionData['MpesaReceiptNumber'];
      const amount = transactionData['Amount'];

      // Update payment status
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          transactionId,
          amount,
          updatedAt: new Date().toISOString(),
        })
        .eq('orderId', orderId);

      if (error) throw error;

      // Update order status to 'paid'
      await supabase
        .from('orders')
        .update({
          status: 'paid',
          paymentMethod: 'mpesa',
          transactionId,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', orderId);

      return { success: true, message: 'Payment recorded successfully' };
    } else {
      // Payment failed
      const orderId = stkCallback.MerchantRequestID;
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          updatedAt: new Date().toISOString(),
        })
        .eq('orderId', orderId);

      return { success: false, message: 'Payment failed' };
    }
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    return { success: false, error };
  }
};

/**
 * Get payment history for user
 */
export const getPaymentHistory = async (orderId?: string) => {
  try {
    let query = supabase.from('payments').select('*');

    if (orderId) {
      query = query.eq('orderId', orderId);
    }

    const { data, error } = await query.order('createdAt', { ascending: false });

    if (error) throw error;

    return { success: true, payments: data || [] };
  } catch (error) {
    console.error('Get payment history error:', error);
    return { success: false, error };
  }
};

/**
 * Refund a payment
 */
export const refundPayment = async (paymentId: string, refundAmount?: number) => {
  try {
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (fetchError) throw fetchError;

    const amount = refundAmount || payment.amount;

    // Create refund record
    const { data, error } = await supabase
      .from('refunds')
      .insert({
        paymentId,
        orderId: payment.orderId,
        amount,
        status: 'pending',
        createdAt: new Date().toISOString(),
      })
      .select();

    if (error) throw error;

    // TODO: In production, call M-Pesa refund API
    // Update payment status
    await supabase
      .from('payments')
      .update({ status: 'refunded' })
      .eq('id', paymentId);

    return {
      success: true,
      refund: data?.[0],
      message: 'Refund initiated. Please wait 24-48 hours for processing.',
    };
  } catch (error) {
    console.error('Refund payment error:', error);
    return { success: false, error };
  }
};

/**
 * Get payment statistics for seller
 */
export const getSellerPaymentStats = async (sellerId: string) => {
  try {
    const { data: orders } = await supabase
      .from('orders')
      .select('totalAmount, status')
      .eq('sellerId', sellerId);

    if (!orders) {
      return {
        success: true,
        stats: {
          totalRevenue: 0,
          pendingPayouts: 0,
          completedPayouts: 0,
        },
      };
    }

    const stats = {
      totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      pendingPayouts: orders
        .filter((o) => o.status === 'processing' || o.status === 'shipped')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      completedPayouts: orders
        .filter((o) => o.status === 'delivered')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    };

    return { success: true, stats };
  } catch (error) {
    console.error('Get seller payment stats error:', error);
    return { success: false, error };
  }
};

/**
 * Request payout to seller's M-Pesa account
 */
export const requestSellerPayout = async (
  sellerId: string,
  amount: number,
  mpesaNumber: string
) => {
  try {
    const { data, error } = await supabase
      .from('payouts')
      .insert({
        sellerId,
        amount,
        mpesaNumber,
        status: 'pending',
        createdAt: new Date().toISOString(),
      })
      .select();

    if (error) throw error;

    // TODO: In production, call M-Pesa B2C API to send money

    return {
      success: true,
      payout: data?.[0],
      message: 'Payout request submitted. Processing will take 24-48 hours.',
    };
  } catch (error) {
    console.error('Request payout error:', error);
    return { success: false, error };
  }
};

/**
 * Get seller payout history
 */
export const getSellerPayouts = async (sellerId: string) => {
  try {
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .eq('sellerId', sellerId)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    return { success: true, payouts: data || [] };
  } catch (error) {
    console.error('Get seller payouts error:', error);
    return { success: false, error };
  }
};
