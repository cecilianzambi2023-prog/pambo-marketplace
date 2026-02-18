import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

Deno.serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      })
    }
S
    // Securely retrieve credentials from Deno.env.get
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing Supabase environment variables")
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    // Initialize Supabase admin client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    const bodyText = await req.text()
    const body = JSON.parse(bodyText)

    // ROUTE 1: STK PUSH CALLBACK from M-Pesa (successful payment)
    if (body.ResultCode !== undefined) {
      return handleMpesaCallback(supabase, body)
    }

    // ROUTE 2: INITIATE PAYMENT (initial request)
    const { phone, amount, orderId, description, buyerId, productType } = body

    // Validate required fields
    if (!phone || !amount || !orderId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: phone, amount, orderId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Store payment request in database (with admin privileges)
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        order_id: orderId,
        user_id: buyerId,
        phone_number: phone,
        amount: amount,
        status: "pending",
        description: description || "M-Pesa Payment",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (paymentError) {
      console.error("Payment creation error:", paymentError)
      return new Response(
        JSON.stringify({ error: "Failed to create payment record" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    // TODO: Call actual M-Pesa STK Push API
    // For now, return success response with payment ID
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment initiated - awaiting customer input",
        paymentId: payment.id,
        orderId: orderId,
        amount: amount,
        phone: phone,
      }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("Deno Function Error:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})

// ===================================
// HANDLE M-PESA STK PUSH CALLBACK
// ===================================
async function handleMpesaCallback(supabase: any, body: any) {
  try {
    const { ResultCode, ResultDesc, CheckoutRequestID, MerchantRequestID, CallbackMetadata } = body

    console.log(`M-Pesa Callback: ResultCode=${ResultCode}, CheckoutRequestID=${CheckoutRequestID}`)

    // SUCCESSFUL PAYMENT (ResultCode = 0)
    if (ResultCode === 0 && CallbackMetadata) {
      const metadata = CallbackMetadata.Item.reduce((acc: any, item: any) => {
        acc[item.Name] = item.Value
        return acc
      }, {})

      const mpesaReceiptNumber = metadata.MpesaReceiptNumber || ""
      const phoneNumber = metadata.PhoneNumber || ""
      const transactionAmount = metadata.Amount || 0
      const transactionDate = metadata.TransactionDate || ""

      console.log(`✅ Payment Successful - Receipt: ${mpesaReceiptNumber}, Amount: ${transactionAmount}`)

      // Step 1: Find the payment record by CheckoutRequestID
      const { data: payment, error: findError } = await supabase
        .from("payments")
        .select("id, order_id, user_id, amount, description")
        .eq("checkout_request_id", CheckoutRequestID)
        .single()

      if (findError || !payment) {
        console.error("Payment not found for callback:", findError)
        return new Response(JSON.stringify({ error: "Payment not found" }), { 
          status: 404, 
          headers: { "Content-Type": "application/json" } 
        })
      }

      // Step 2: Record transaction with M-Pesa receipt number
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          payment_id: payment.id,
          user_id: payment.user_id,
          mpesa_receipt_number: mpesaReceiptNumber,
          phone_number: phoneNumber,
          amount: transactionAmount,
          transaction_date: transactionDate,
          status: "completed",
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (transactionError) {
        console.error("Transaction record error:", transactionError)
        return new Response(JSON.stringify({ error: "Failed to record transaction" }), { 
          status: 500, 
          headers: { "Content-Type": "application/json" } 
        })
      }

      // Step 3: Update payment status to completed
      const { error: paymentUpdateError } = await supabase
        .from("payments")
        .update({
          status: "completed",
          mpesa_receipt_number: mpesaReceiptNumber,
          transaction_id: transaction.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id)

      if (paymentUpdateError) {
        console.error("Payment update error:", paymentUpdateError)
        return new Response(JSON.stringify({ error: "Failed to update payment" }), { 
          status: 500, 
          headers: { "Content-Type": "application/json" } 
        })
      }

      // Step 3.5: Determine subscription tier based on amount and calculate expiry
      let subscriptionTier: 'mkulima' | 'starter' | 'pro' | 'enterprise' = 'starter'
      let subscriptionExpiryDays = 30 // Default to 30 days
      
      if (transactionAmount === 1500) {
        subscriptionTier = 'mkulima'
        subscriptionExpiryDays = 365 // 1 YEAR for Mkulima special offer
      } else if (transactionAmount === 3500) {
        subscriptionTier = 'starter'
        subscriptionExpiryDays = 30
      } else if (transactionAmount === 5000) {
        subscriptionTier = 'pro'
        subscriptionExpiryDays = 30
      } else if (transactionAmount === 9000) {
        subscriptionTier = 'enterprise'
        subscriptionExpiryDays = 30
      }

      const subscriptionExpiry = new Date()
      subscriptionExpiry.setDate(subscriptionExpiry.getDate() + subscriptionExpiryDays)

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          subscription_tier: subscriptionTier,
          subscription_expiry: subscriptionExpiry.toISOString(),
          subscription_start_date: new Date().toISOString(),
          subscription_period_days: subscriptionExpiryDays,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", payment.user_id)

      if (profileUpdateError) {
        console.error("Profile update error:", profileUpdateError)
        // Log but don't fail - subscription was paid
        await supabase.from("admin_audit_log").insert({
          action: "profile_update_failed",
          targetType: "subscription",
          targetId: payment.user_id,
          details: {
            error: profileUpdateError.message,
            transaction_id: transaction.id,
            mpesa_receipt: mpesaReceiptNumber,
            tier: subscriptionTier,
            expiryDays: subscriptionExpiryDays,
          },
        })
      }

      // Step 4: Check if this is a farmer subscription purchase and activate 1-year Mkulima
      if (payment.description?.includes("Mkulima") || payment.description?.includes("farmer") || subscriptionTier === 'mkulima') {
        const { error: subscriptionError } = await supabase.rpc(
          "activate_farmer_subscription",
          {
            p_user_id: payment.user_id,
            p_months: 12, // 1 year
            p_transaction_id: transaction.id,
            p_mpesa_receipt: mpesaReceiptNumber,
          }
        )

        if (subscriptionError) {
          console.error("Subscription activation error:", subscriptionError)
          // Don't fail the callback - payment was successful
          // Log this for manual intervention
          await supabase.from("admin_audit_log").insert({
            action: "subscription_activation_failed",
            targetType: "subscription",
            targetId: payment.user_id,
            details: {
              error: subscriptionError.message,
              transaction_id: transaction.id,
              mpesa_receipt: mpesaReceiptNumber,
            },
          })
        } else {
          console.log(`✅ Farmer subscription activated for user ${payment.user_id}`)
        }
      }

      // Step 5: Update order status to paid
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          status: "paid",
          payment_method: "mpesa",
          transaction_id: transaction.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.order_id)

      if (orderError) {
        console.error("Order update error:", orderError)
      }

      return new Response(JSON.stringify({ 
        success: true,
        message: "Payment processed successfully",
        mpesaReceipt: mpesaReceiptNumber,
        transactionId: transaction.id,
      }), { 
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    } 
    // FAILED OR CANCELLED PAYMENT
    else {
      console.log(`❌ Payment Failed - ResultDesc: ${ResultDesc}`)

      // Find and update payment status to failed
      const { error: updateError } = await supabase
        .from("payments")
        .update({
          status: "failed",
          description: ResultDesc,
          updated_at: new Date().toISOString(),
        })
        .eq("checkout_request_id", CheckoutRequestID)

      if (updateError) {
        console.error("Payment failure update error:", updateError)
      }

      return new Response(JSON.stringify({ 
        success: false,
        message: `Payment failed: ${ResultDesc}`,
        resultCode: ResultCode,
      }), { 
        status: 200, // Return 200 to M-Pesa even for failures (callback received)
        headers: { "Content-Type": "application/json" },
      })
    }
  } catch (error) {
    console.error("Callback Processing Error:", error)
    return new Response(JSON.stringify({ 
      error: "Callback processing failed", 
      details: String(error) 
    }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    })
  }
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Set secrets in supabase/.env.local:
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
     MPESA_CONSUMER_KEY=your_consumer_key
     MPESA_CONSUMER_SECRET=your_consumer_secret
     MPESA_PASSKEY=your_passkey
     MPESA_SHORTCODE=your_shortcode

  3. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/mpesa-payment' \
    --header 'Authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjIwODYyODU5MjJ9.QOjIw2jaKMLF5oE7Z-x0x63HsuxroYq1l7LgP2roaT3-RIoLpk-DEIcGl5RI4Nxm_sWKfPZhF8gDiy7EO6Qbcw' \
    --header 'Content-Type: application/json' \
    --data '{"phone":"254708374149","amount":100,"orderId":"order_123","description":"Test payment","buyerId":"user_123"}'

*/
