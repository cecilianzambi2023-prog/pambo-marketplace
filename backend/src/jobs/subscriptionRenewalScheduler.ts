/**
 * Subscription Renewal Scheduler
 * Runs daily to check for subscriptions due for renewal
 * Automatically charges M-Pesa and sends reminders
 */

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

interface SubscriptionRenewal {
  id: string;
  userId: string;
  phone: string;
  plan: string;
  amount: number;
  nextBillingDate: string;
  hub: string;
}

interface RenewalResult {
  success: boolean;
  subscriptionId: string;
  message: string;
  timestamp: string;
}

/**
 * Get M-Pesa access token
 */
const getMpesaToken = async (): Promise<string> => {
  try {
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`
        }
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Failed to get M-Pesa token:', error);
    throw error;
  }
};

/**
 * Get all subscriptions due for renewal (within 2 days)
 */
const getSubscriptionsDueForRenewal = async (): Promise<SubscriptionRenewal[]> => {
  try {
    const today = new Date();
    const twoDaysFromNow = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);

    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        id,
        userId,
        plan,
        hub,
        nextBillingDate,
        users:userId (phone_number)
      `)
      .eq('status', 'active')
      .lte('nextBillingDate', twoDaysFromNow.toISOString())
      .gte('nextBillingDate', today.toISOString())
      .is('renewalAttempted', null);

    if (error) throw error;

    // Get phone numbers
    const planPrices: { [key: string]: number } = {
      'starter': 3500,
      'pro': 7000,
      'enterprise': 14000
    };

    return subscriptions.map((sub: any) => ({
      id: sub.id,
      userId: sub.userId,
      phone: sub.users?.[0]?.phone_number || '',
      plan: sub.plan,
      amount: planPrices[sub.plan],
      nextBillingDate: sub.nextBillingDate,
      hub: sub.hub
    }));
  } catch (error) {
    console.error('Failed to fetch subscriptions due for renewal:', error);
    throw error;
  }
};

/**
 * Send SMS reminder before billing date
 */
const sendRenewalReminder = async (phone: string, plan: string, amount: number): Promise<boolean> => {
  try {
    // Format phone number
    let formattedPhone = phone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    }

    const message = `Your ${plan.toUpperCase()} Pambo subscription (₹${amount}) renews tomorrow. Reply STOP to cancel. Support: help@pambo.com`;

    // Using HTTP API (you would integrate with Twilio/AWS SNS/Africa's Talking)
    // This is a placeholder for SMS notification
    console.log(`SMS to ${formattedPhone}: ${message}`);

    return true;
  } catch (error) {
    console.error('Failed to send SMS reminder:', error);
    return false;
  }
};

/**
 * Initiate M-Pesa STK push for renewal
 */
const initiateRenewalPayment = async (
  subscription: SubscriptionRenewal,
  token: string
): Promise<string | null> => {
  try {
    // Format phone number
    let formattedPhone = subscription.phone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    }

    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(
      `${process.env.MPESA_BUSINESS_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.MPESA_BUSINESS_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: subscription.amount,
        PartyA: formattedPhone,
        PartyB: process.env.MPESA_BUSINESS_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: `${process.env.MPESA_CALLBACK_URL}?subscriptionId=${subscription.id}&type=renewal`,
        AccountReference: `RENEWAL-${subscription.id}`,
        TransactionDesc: `${subscription.plan.toUpperCase()} subscription renewal - ${subscription.hub}`
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.CheckoutRequestID;
  } catch (error) {
    console.error(`Failed to initiate renewal payment for ${subscription.id}:`, error);
    return null;
  }
};

/**
 * Record renewal attempt
 */
const recordRenewalAttempt = async (
  subscriptionId: string,
  checkoutRequestId: string | null,
  status: 'initiated' | 'failed' | 'pending'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        renewalAttempted: new Date().toISOString(),
        renewalCheckoutId: checkoutRequestId,
        renewalStatus: status
      })
      .eq('id', subscriptionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to record renewal attempt:', error);
    return false;
  }
};

/**
 * Handle renewal success
 */
const completeRenewal = async (
  subscriptionId: string,
  transactionId: string
): Promise<boolean> => {
  try {
    // Calculate next billing date (30 days from now)
    const nextBillingDate = new Date();
    nextBillingDate.setDate(nextBillingDate.getDate() + 30);

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        transactionId,
        renewalStatus: 'completed',
        nextBillingDate: nextBillingDate.toISOString(),
        renewalAttempted: null // Reset for next cycle
      })
      .eq('id', subscriptionId);

    if (error) throw error;

    // Log in audit trail
    await supabase
      .from('admin_audit_log')
      .insert({
        action: 'subscription_renewed',
        targetType: 'subscription',
        targetId: subscriptionId,
        details: `Subscription renewed with transaction ${transactionId}`,
        changedBy: 'system'
      });

    return true;
  } catch (error) {
    console.error('Failed to complete renewal:', error);
    return false;
  }
};

/**
 * Handle renewal failure (send email, log attempt)
 */
const handleRenewalFailure = async (
  subscriptionId: string,
  reason: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        renewalStatus: 'failed',
        failureReason: reason
      })
      .eq('id', subscriptionId);

    if (error) throw error;

    // Get subscription details for email
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (subscription) {
      // Send failure email (implement with your email service)
      console.log(`Email: Payment failed for subscription ${subscriptionId}`);
      console.log(`Reason: ${reason}`);
    }

    // Log in audit trail
    await supabase
      .from('admin_audit_log')
      .insert({
        action: 'renewal_failed',
        targetType: 'subscription',
        targetId: subscriptionId,
        details: reason,
        changedBy: 'system'
      });

    return true;
  } catch (error) {
    console.error('Failed to handle renewal failure:', error);
    return false;
  }
};

/**
 * Main scheduler function - run daily via cron job
 */
export const renewSubscriptions = async (): Promise<RenewalResult[]> => {
  const results: RenewalResult[] = [];

  try {
    console.log(`[${new Date().toISOString()}] Starting subscription renewal scheduler...`);

    // Get M-Pesa token
    const token = await getMpesaToken();

    // Get subscriptions due for renewal
    const dueSubscriptions = await getSubscriptionsDueForRenewal();
    console.log(`Found ${dueSubscriptions.length} subscriptions due for renewal`);

    for (const subscription of dueSubscriptions) {
      try {
        // Send reminder SMS (day before)
        const dayBeforeBilling = new Date(subscription.nextBillingDate);
        const today = new Date();
        const daysUntilBilling = Math.ceil(
          (dayBeforeBilling.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilBilling === 1) {
          await sendRenewalReminder(subscription.phone, subscription.plan, subscription.amount);
        }

        // Initiate payment on billing date
        if (daysUntilBilling <= 0) {
          console.log(`Initiating renewal for subscription ${subscription.id}...`);

          const checkoutRequestId = await initiateRenewalPayment(subscription, token);

          if (checkoutRequestId) {
            await recordRenewalAttempt(subscription.id, checkoutRequestId, 'initiated');

            results.push({
              success: true,
              subscriptionId: subscription.id,
              message: `Renewal STK push sent (${checkoutRequestId})`,
              timestamp: new Date().toISOString()
            });

            console.log(`✓ Renewal initiated for ${subscription.id}`);
          } else {
            await recordRenewalAttempt(subscription.id, null, 'failed');
            await handleRenewalFailure(subscription.id, 'Failed to initiate M-Pesa STK push');

            results.push({
              success: false,
              subscriptionId: subscription.id,
              message: 'Failed to initiate M-Pesa payment',
              timestamp: new Date().toISOString()
            });

            console.log(`✗ Failed to renew ${subscription.id}`);
          }
        }
      } catch (error: any) {
        console.error(`Error processing subscription ${subscription.id}:`, error);

        results.push({
          success: false,
          subscriptionId: subscription.id,
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    console.log(
      `[${new Date().toISOString()}] Renewal scheduler completed. ` +
      `${results.filter(r => r.success).length}/${results.length} succeeded`
    );

    return results;
  } catch (error: any) {
    console.error('Renewal scheduler failed:', error);
    throw error;
  }
};

/**
 * Cancel overdue subscriptions (after 3 failed attempts)
 */
export const cancelOverdueSubscriptions = async (): Promise<void> => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Find subscriptions that are past due for 3+ days
    const { data: overdueSubscriptions, error } = await supabase
      .from('subscriptions')
      .select('id, userId')
      .eq('status', 'past_due')
      .lte('nextBillingDate', threeDaysAgo.toISOString());

    if (error) throw error;

    for (const subscription of overdueSubscriptions || []) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
          cancellationReason: 'Automatic cancellation due to payment failure'
        })
        .eq('id', subscription.id);

      // Log
      await supabase
        .from('admin_audit_log')
        .insert({
          action: 'subscription_cancelled',
          targetType: 'subscription',
          targetId: subscription.id,
          details: 'Automatic cancellation due to 3+ days overdue',
          changedBy: 'system'
        });

      console.log(`✓ Cancelled overdue subscription ${subscription.id}`);
    }
  } catch (error) {
    console.error('Failed to cancel overdue subscriptions:', error);
  }
};

/**
 * Send subscription expiry warnings
 */
export const sendExpiryWarnings = async (): Promise<void> => {
  try {
    // Get subscriptions expiring in 7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { data: expiringSubscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        id,
        userId,
        plan,
        nextBillingDate,
        users:userId (email)
      `)
      .eq('status', 'active')
      .gte('nextBillingDate', new Date().toISOString())
      .lte('nextBillingDate', sevenDaysFromNow.toISOString())
      .is('expiryWarningSent', null);

    if (error) throw error;

    for (const subscription of expiringSubscriptions || []) {
      // Send email warning (implement with your email service)
      console.log(
        `Email: Subscription expiry warning to ${subscription.users?.[0]?.email} - ` +
        `${subscription.plan} plan expires on ${subscription.nextBillingDate}`
      );

      // Mark as sent
      await supabase
        .from('subscriptions')
        .update({
          expiryWarningSent: new Date().toISOString()
        })
        .eq('id', subscription.id);
    }
  } catch (error) {
    console.error('Failed to send expiry warnings:', error);
  }
};

// Export for cron job scheduling
export default {
  renewSubscriptions,
  cancelOverdueSubscriptions,
  sendExpiryWarnings
};
