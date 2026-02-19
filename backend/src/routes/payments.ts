import express, { Request, Response, Router } from 'express';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const router = Router();

// ============================================
// SUPABASE CLIENT
// ============================================

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

// ============================================
// M-PESA CONFIGURATION
// ============================================

const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY || '',
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
  businessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE || '174379',
  passkey: process.env.MPESA_PASSKEY || '',
  baseUrl: process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke',
  callbackUrl: process.env.MPESA_CALLBACK_URL || '',
};

// ============================================
// HELPER: Get M-Pesa Access Token
// ============================================

const getMpesaAccessToken = async (): Promise<string> => {
  try {
    const auth = Buffer.from(
      `${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`
    ).toString('base64');

    const response = await axios.get(
      `${MPESA_CONFIG.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting M-Pesa access token:', error);
    throw new Error('Failed to get M-Pesa access token');
  }
};

// ============================================
// HELPER: Format Phone Number (To 254...)
// ============================================

const formatPhoneNumber = (phone: string): string => {
  // Remove any non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // If starts with 07, replace with 254
  if (cleaned.startsWith('7')) {
    return `254${cleaned.substring(1)}`;
  }

  // If starts with 7, add 254
  if (cleaned === '7' || cleaned.length === 9) {
    return `254${cleaned}`;
  }

  // If already starts with 254, return as is
  if (cleaned.startsWith('254')) {
    return cleaned;
  }

  // Otherwise try to normalize
  return `254${cleaned}`;
};

// ============================================
// 1. INITIATE STK PUSH (Show prompt on phone)
// ============================================

router.post('/stk-push', async (req: Request, res: Response) => {
  try {
    const { phone, amount, orderId, description } = req.body;

    if (!MPESA_CONFIG.callbackUrl) {
      return res.status(500).json({
        success: false,
        error: 'MPESA_CALLBACK_URL is not configured'
      });
    }

    // Validate input
    if (!phone || !amount || !orderId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: phone, amount, orderId'
      });
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phone);

    // Get access token
    const accessToken = await getMpesaAccessToken();

    // Generate timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .substring(0, 14);

    // Generate password (base64 encoded: BusinessCode + Passkey + Timestamp)
    const password = Buffer.from(
      `${MPESA_CONFIG.businessShortCode}${MPESA_CONFIG.passkey}${timestamp}`
    ).toString('base64');

    // STK Push payload
    const payload = {
      BusinessShortCode: MPESA_CONFIG.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.businessShortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CONFIG.callbackUrl,
      AccountReference: orderId,
      TransactionDesc: description || 'Pambo Payment',
    };

    // Call M-Pesa API
    const response = await axios.post(
      `${MPESA_CONFIG.baseUrl}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.ResponseCode === '0') {
      // Success - Store payment request in database
      const { error: dbError } = await supabase
        .from('payments')
        .insert({
          orderId,
          amount,
          currency: 'KES',
          paymentMethod: 'mpesa',
          phone: formattedPhone,
          status: 'pending',
          description: description || 'STK Push initiated',
          checkoutRequestId: response.data.CheckoutRequestID,
          merchantRequestId: response.data.MerchantRequestID,
          createdAt: new Date().toISOString(),
        });

      if (dbError) {
        console.error('Database error:', dbError);
      }

      res.json({
        success: true,
        message: 'STK Push sent to phone successfully',
        data: {
          checkoutRequestId: response.data.CheckoutRequestID,
          customerMessage: response.data.CustomerMessage,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        error: response.data.ResponseDescription || 'STK Push failed',
      });
    }
  } catch (error: any) {
    console.error('STK Push error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to initiate payment',
    });
  }
});

// ============================================
// 2. M-PESA CALLBACK HANDLER
// ============================================

router.post('/mpesa/callback', async (req: Request, res: Response) => {
  try {
    const callbackData = req.body;

    console.log('M-Pesa Callback received:', JSON.stringify(callbackData, null, 2));

    // Acknowledge receipt immediately
    res.json({
      ResultCode: 0,
      ResultDesc: 'Received'
    });

    // Process callback asynchronously
    processPaymentCallback(callbackData);
  } catch (error) {
    console.error('Callback error:', error);
    res.json({
      ResultCode: 1,
      ResultDesc: 'Error received'
    });
  }
});

// ============================================
// HELPER: Process Payment Callback
// ============================================

const processPaymentCallback = async (callbackData: any) => {
  try {
    const body = callbackData.Body;

    if (!body || !body.stkCallback) {
      console.error('Invalid callback structure');
      return;
    }

    const stkCallback = body.stkCallback;
    const resultCode = stkCallback.ResultCode;

    // Extract metadata
    const callbackMetadata = stkCallback.CallbackMetadata?.CallbackMetadataItem || [];
    const metadata: any = {};

    callbackMetadata.forEach((item: any) => {
      metadata[item.Name] = item.Value;
    });

    if (resultCode === 0) {
      // ✅ Payment successful
      const transactionId = metadata.MpesaReceiptNumber;
      const amount = metadata.Amount;
      const phone = metadata.PhoneNumber;
      const checkoutRequestId = stkCallback.CheckoutRequestID;
      const orderId = stkCallback.MerchantRequestID;

      console.log('✅ Payment successful:', {
        transactionId,
        amount,
        phone,
        orderId
      });

      // Update payment in database
      await supabase
        .from('payments')
        .update({
          status: 'completed',
          transactionId,
          amount,
          updatedAt: new Date().toISOString(),
        })
        .eq('checkoutRequestId', checkoutRequestId);

      // Update order to "paid"
      await supabase
        .from('orders')
        .update({
          status: 'paid',
          paymentMethod: 'mpesa',
          transactionId,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', orderId);

      console.log('✅ Order updated to paid');
    } else {
      // ❌ Payment failed
      const resultDescription = stkCallback.ResultDesc;
      const checkoutRequestId = stkCallback.CheckoutRequestID;

      console.log('❌ Payment failed:', resultDescription);

      // Update payment status to failed
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          updatedAt: new Date().toISOString(),
        })
        .eq('checkoutRequestId', checkoutRequestId);
    }
  } catch (error) {
    console.error('Error processing callback:', error);
  }
};

// ============================================
// 3. M-PESA BALANCE CHECK
// ============================================

router.post('/balance', async (req: Request, res: Response) => {
  try {
    const accessToken = await getMpesaAccessToken();

    const payload = {
      CommandID: 'GetAccount',
      PartyA: MPESA_CONFIG.businessShortCode,
      IdentifierType: '4',
      Remarks: 'Balance Check',
      QueueTimeOutURL: MPESA_CONFIG.callbackUrl,
      ResultURL: MPESA_CONFIG.callbackUrl,
    };

    const response = await axios.post(
      `${MPESA_CONFIG.baseUrl}/mpesa/accountbalance/v1/query`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({
      success: true,
      data: response.data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// 4. M-PESA B2C (Send Money to Customer)
// ============================================

router.post('/b2c-send', async (req: Request, res: Response) => {
  try {
    const { phone, amount, description } = req.body;

    const formattedPhone = formatPhoneNumber(phone);
    const accessToken = await getMpesaAccessToken();

    const payload = {
      OriginatorConversationID: `${Date.now()}`,
      InitiatorName: process.env.MPESA_INITIATOR_NAME || 'pambo',
      InitiatorPassword: process.env.MPESA_INITIATOR_PASSWORD || '',
      CommandID: 'BusinessPayment',
      Amount: Math.round(amount),
      PartyA: MPESA_CONFIG.businessShortCode,
      PartyB: formattedPhone,
      Remarks: description || 'Pambo Payout',
      QueueTimeOutURL: MPESA_CONFIG.callbackUrl,
      ResultURL: MPESA_CONFIG.callbackUrl,
    };

    const response = await axios.post(
      `${MPESA_CONFIG.baseUrl}/mpesa/b2c/v1/paymentrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({
      success: true,
      message: 'Payment sent successfully',
      data: response.data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// 5. GET PAYMENT STATUS
// ============================================

router.get('/status/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('orderId', orderId)
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
      });
    }

    res.json({
      success: true,
      payment: data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// SUBSCRIPTION PAYMENTS
// ============================================

/**
 * POST /api/payments/subscription/initiate
 * Initiate subscription payment for premium hub access
 */
router.post('/subscription/initiate', async (req: Request, res: Response) => {
  try {
    const { userId, phone, hub, plan } = req.body;

    if (!userId || !phone || !hub || !plan) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, phone, hub, plan'
      });
    }

    const planPricing: { [key: string]: number } = {
      starter: 3500,
      pro: 7000,
      enterprise: 14000,
    };

    const amount = planPricing[plan];

    if (!amount) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan. Use: starter, pro, or enterprise'
      });
    }

    // Create subscription record
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        userId,
        hub,
        plan,
        monthlyPrice: amount,
        status: 'pending_payment',
        billingCycle: 'monthly',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date().toISOString(),
      })
      .select();

    if (subError) throw subError;

    console.log(`✓ [Subscription] ${plan} for ${hub}: ${amount}KES`);

    res.status(201).json({
      success: true,
      message: 'Subscription initiated. Awaiting M-Pesa payment.',
      subscriptionId: subscription?.[0]?.id,
      amount,
      plan,
      hub
    });
  } catch (error: any) {
    console.error('[Subscription Error]:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to initiate subscription'
    });
  }
});

/**
 * GET /api/payments/subscription/:userId
 * Get user's subscription status
 */
router.get('/subscription/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    // Group by hub
    const grouped: { [key: string]: any } = {};
    subscriptions?.forEach(sub => {
      if (!grouped[sub.hub]) {
        grouped[sub.hub] = [];
      }
      grouped[sub.hub].push(sub);
    });

    res.json({
      success: true,
      subscriptions: grouped
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error?.message
    });
  }
});

/**
 * POST /api/payments/subscription/:subscriptionId/activate
 * Activate subscription after M-Pesa payment confirmed
 */
router.post('/subscription/:subscriptionId/activate', async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.params;
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        error: 'Transaction ID required'
      });
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        transactionId,
        activatedAt: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .select();

    if (error) throw error;

    console.log(`✓ [Subscription Activated] ${subscriptionId}`);

    res.json({
      success: true,
      message: 'Subscription activated successfully',
      subscription: subscription?.[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error?.message
    });
  }
});

export default router;
