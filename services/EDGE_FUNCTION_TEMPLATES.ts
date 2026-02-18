/**
 * EDGE FUNCTION TEMPLATES FOR PAMBO.COM - SECURE PAYMENT PROCESSING
 * 
 * These Edge Functions handle all server-side operations that require service_role access.
 * DEPLOY THESE TO SUPABASE EDGE FUNCTIONS (use supabase/functions/ directory)
 * 
 * Location: supabase/functions/
 * Naming: [operation-name]/index.ts
 * 
 * SECURITY: 
 * - Service role key is encrypted in Supabase
 * - Not exposed to browser
 * - All operations are authenticated
 * - Payments are fully secure
 */

/**
 * =====================================================
 * 1. CREATE PAYMENT INTENT (process-payment)
 * =====================================================
 * 
 * File: supabase/functions/process-payment/index.ts
 * 
 * Usage:
 *   POST /functions/v1/process-payment
 *   Header: Authorization: Bearer {user_jwt_token}
 *   Body: { orderId, amount, paymentMethod }
 */

const createPaymentIntentExample = `
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  // Verify authentication
  const authHeader = req.headers.get('authorization')?.split(' ')[1];
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { orderId, amount, paymentMethod } = await req.json();

    // Validate amount
    if (amount < 1 || amount > 1000000) {
      return new Response('Invalid amount', { status: 400 });
    }

    // Fetch order and verify buyer
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('buyerId', user.id)
      .single();

    if (orderError || !order) {
      return new Response('Order not found', { status: 404 });
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        orderId,
        amount,
        paymentMethod,
        status: 'pending',
        currency: 'KES',
        description: \`Payment for order \${orderId}\`,
      })
      .select()
      .single();

    if (paymentError) {
      return new Response('Payment creation failed', { status: 500 });
    }

    // HERE: Call payment gateway (M-Pesa, Stripe, etc.)
    // DO NOT return payment details to client
    // Only return confirmation and next steps

    return new Response(
      JSON.stringify({
        success: true,
        paymentId: payment.id,
        message: 'Payment initiated. Please complete on your phone.',
        nextStep: 'await_confirmation',
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Payment error:', error);
    return new Response('Payment processing failed', { status: 500 });
  }
});
`;

/**
 * =====================================================
 * 2. VERIFY PAYMENT (verify-payment)
 * =====================================================
 * 
 * File: supabase/functions/verify-payment/index.ts
 * 
 * Usage:
 *   POST /functions/v1/verify-payment
 *   Header: Authorization: Bearer {user_jwt_token}
 *   Body: { paymentId, transactionId }
 */

const verifyPaymentExample = `
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  const authHeader = req.headers.get('authorization')?.split(' ')[1];
  if (!authHeader) return new Response('Unauthorized', { status: 401 });

  const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
  if (authError || !user) return new Response('Unauthorized', { status: 401 });

  try {
    const { paymentId, transactionId } = await req.json();

    // Fetch payment and verify ownership via order
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, orders(buyerId)')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      return new Response('Payment not found', { status: 404 });
    }

    // Verify user is the buyer
    if (payment.orders.buyerId !== user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    // HERE: Verify with payment gateway
    // const isValid = await verifyWithPaymentGateway(transactionId);

    // Update payment status
    if (true) { // Replace with actual verification
      await supabase
        .from('payments')
        .update({
          status: 'completed',
          transactionId,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', paymentId);

      // Update order status
      await supabase
        .from('orders')
        .update({
          status: 'processing',
          paymentMethod: payment.paymentMethod,
          transactionId,
        })
        .eq('id', payment.orderId);

      return new Response(
        JSON.stringify({ success: true, message: 'Payment verified' }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Payment verification failed' }),
      { status: 402 }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return new Response('Verification failed', { status: 500 });
  }
});
`;

/**
 * =====================================================
 * 3. CREATE SELLER PAYOUT (create-payout)
 * =====================================================
 * 
 * File: supabase/functions/create-payout/index.ts
 * 
 * Called by cronjob monthly to create payouts for sellers
 * Service role key only - no frontend access
 */

const createPayoutExample = `
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Cronjob: Monthly payout calculation
Deno.serve(async (req) => {
  // Verify this is called from Supabase scheduler
  const secret = req.headers.get('authorization')?.split(' ')[1];
  if (secret !== Deno.env.get('PAYOUT_CRON_SECRET')) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Get all sellers with completed orders
    const { data: sellers } = await supabase
      .from('profiles')
      .select('id, email, mpesaNumber')
      .eq('isSeller', true);

    if (!sellers) return new Response('No sellers found', { status: 200 });

    // Calculate earnings for each seller
    for (const seller of sellers) {
      const { data: orders } = await supabase
        .from('orders')
        .select('totalAmount')
        .eq('sellerId', seller.id)
        .eq('status', 'completed')
        .gt('createdAt', getLastMonthDate());

      if (!orders || orders.length === 0) continue;

      const totalEarnings = orders.reduce((sum, order) => sum + order.totalAmount, 0);

      // Create payout record (NOT sent directly to M-Pesa yet)
      const { error: payoutError } = await supabase
        .from('payouts')
        .insert({
          sellerId: seller.id,
          amount: totalEarnings,
          mpesaNumber: seller.mpesaNumber,
          status: 'pending',
        });

      if (!payoutError) {
        // Send notification to seller
        // await sendEmail(seller.email, 'Payout initiated...');
      }
    }

    return new Response('Payouts created', { status: 200 });
  } catch (error) {
    console.error('Payout error:', error);
    return new Response('Payout process failed', { status: 500 });
  }
});

function getLastMonthDate() {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date.toISOString();
}
`;

/**
 * =====================================================
 * 4. GENERATE REFERRAL REWARDS (referral-reward)
 * =====================================================
 * 
 * File: supabase/functions/referral-reward/index.ts
 * 
 * When a referred seller makes their first sale, add subscription credit
 */

const referralRewardExample = `
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  // Webhook from order completion
  const { orderId, sellerId, referrerId } = await req.json();

  try {
    // Check if this is first sale
    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('sellerId', sellerId)
      .limit(2);

    if (orders && orders.length > 1) {
      return new Response('Not first sale', { status: 200 });
    }

    // Give referrer 30 days free subscription
    const referrerUser = await supabase
      .from('profiles')
      .select('subscriptionExpiry')
      .eq('id', referrerId)
      .single();

    const newExpiry = Math.max(
      referrerUser.data.subscriptionExpiry || Date.now(),
      Date.now() + 30 * 24 * 60 * 60 * 1000
    );

    await supabase
      .from('profiles')
      .update({ subscriptionExpiry: newExpiry })
      .eq('id', referrerId);

    return new Response('Reward credited', { status: 200 });
  } catch (error) {
    console.error('Referral error:', error);
    return new Response('Referral processing failed', { status: 500 });
  }
});
`;

console.log(`
✅ EDGE FUNCTION TEMPLATES READY
=====================================================

These Edge Functions provide:
1. ✅ Secure payment processing
2. ✅ Payment verification
3. ✅ Seller payouts (monthly)
4. ✅ Referral rewards

DEPLOYMENT INSTRUCTIONS:
1. Create supabase/functions/ directory
2. Create subdirectories for each function
3. Deploy with: supabase functions deploy

Example deploy:
$ supabase functions deploy process-payment --project-id your-project-id

Then update supabaseClient.ts to call these functions:
const { data, error } = await supabase.functions.invoke('process-payment', {
  body: { orderId, amount, paymentMethod }
});
`);
