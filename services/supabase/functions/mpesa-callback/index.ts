import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://pambo.biz",
  "https://www.pambo.biz",
];

function getAllowedOrigins(): string[] {
  const configured = Deno.env.get("CORS_ALLOWED_ORIGINS");
  if (!configured) return defaultAllowedOrigins;

  return configured
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function buildCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = getAllowedOrigins();
  const isAllowedOrigin = !!origin && allowedOrigins.includes(origin);

  return {
    "Access-Control-Allow-Origin": isAllowedOrigin ? origin : allowedOrigins[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function isRequestOriginAllowed(origin: string | null): boolean {
  if (!origin) return true;
  return getAllowedOrigins().includes(origin);
}

interface CallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

/**
 * SECURITY: Verify M-Pesa callback signature
 * Prevents spoofed/tampered callbacks
 */
async function verifyMPesaSignature(
  bodyText: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) {
    // No signature provided (legacy behavior)
    console.warn("⚠️ No signature provided in callback - consider this insecure");
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(bodyText);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBytes = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));

    return expectedSignature === signature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = buildCorsHeaders(origin);

  if (!isRequestOriginAllowed(origin)) {
    return new Response(
      JSON.stringify({ error: "Origin not allowed" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();
  let callbackLogId: string | null = null;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const callbackSecret = Deno.env.get("MPESA_CALLBACK_SECRET");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase configuration" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get raw body text for signature verification
    const bodyText = await req.text();
    const body = JSON.parse(bodyText) as CallbackBody;
    const stkCallback = body.Body.stkCallback;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // SECURITY: Verify signature if secret is configured
    const signature = req.headers.get("X-Mpesa-Signature");
    let signatureValid: boolean | null = null;

    if (callbackSecret) {
      signatureValid = await verifyMPesaSignature(bodyText, signature, callbackSecret);
      
      if (!signatureValid && signature) {
        console.error("🚨 INVALID SIGNATURE - Possible spoofed callback!");
        
        // Log the invalid attempt
        await supabase.from("mpesa_callback_log").insert({
          merchant_request_id: stkCallback.MerchantRequestID,
          checkout_request_id: stkCallback.CheckoutRequestID,
          result_code: stkCallback.ResultCode,
          result_desc: stkCallback.ResultDesc,
          raw_callback: body,
          ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip"),
          signature_valid: false,
          signature_header: signature,
          processing_status: "failed",
          processing_error: "Invalid signature",
        });

        return new Response(
          JSON.stringify({
            ResultCode: 1,
            ResultDesc: "Invalid signature",
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    // Check for duplicate callback
    const { data: isDuplicate } = await supabase.rpc("check_duplicate_callback", {
      p_checkout_request_id: stkCallback.CheckoutRequestID,
      p_result_code: stkCallback.ResultCode,
    });

    if (isDuplicate) {
      console.log("ℹ️ Duplicate callback detected - ignoring");
      
      await supabase.from("mpesa_callback_log").insert({
        merchant_request_id: stkCallback.MerchantRequestID,
        checkout_request_id: stkCallback.CheckoutRequestID,
        result_code: stkCallback.ResultCode,
        result_desc: stkCallback.ResultDesc,
        raw_callback: body,
        signature_valid: signatureValid,
        processing_status: "duplicate",
      });

      return new Response(
        JSON.stringify({
          ResultCode: 0,
          ResultDesc: "Callback already processed (duplicate)",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Result codes:
    // 0 = Success
    // 1 = Insufficient Funds
    // 1032 = Cancelled by User
    // etc.

    if (stkCallback.ResultCode === 0) {
      // Payment successful - extract M-Pesa receipt and amount
      let mpesaReceiptNumber = "";
      let transactionAmount = 0;
      let phoneNumber = "";

      if (stkCallback.CallbackMetadata?.Item) {
        for (const item of stkCallback.CallbackMetadata.Item) {
          if (item.Name === "MpesaReceiptNumber") {
            mpesaReceiptNumber = String(item.Value);
          }
          if (item.Name === "Amount") {
            transactionAmount = Number(item.Value);
          }
          if (item.Name === "PhoneNumber") {
            phoneNumber = String(item.Value);
          }
        }
      }

      // Update subscription_payments table
      const { data: payment, error: fetchError } = await supabase
        .from("subscription_payments")
        .select("id, user_id, tier")
        .eq("merchant_request_id", stkCallback.MerchantRequestID)
        .eq("checkout_request_id", stkCallback.CheckoutRequestID)
        .single();

      if (fetchError || !payment) {
        console.error("Payment record not found:", fetchError);
        
        // Log failed lookup
        await supabase.from("mpesa_callback_log").insert({
          merchant_request_id: stkCallback.MerchantRequestID,
          checkout_request_id: stkCallback.CheckoutRequestID,
          result_code: stkCallback.ResultCode,
          result_desc: stkCallback.ResultDesc,
          mpesa_receipt_number: mpesaReceiptNumber,
          transaction_amount: transactionAmount,
          phone_number: phoneNumber,
          raw_callback: body,
          signature_valid: signatureValid,
          processing_status: "failed",
          processing_error: "Payment record not found in database",
        });
        
        return new Response(
          JSON.stringify({
            ResultCode: 1,
            ResultDesc: "Payment record not found",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Get username from profiles table
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, username")
        .eq("id", payment.user_id)
        .single();

      const userName = userProfile?.full_name || userProfile?.username || userProfile?.email || "Unknown User";

      // Mark payment as completed
      const { error: updateError } = await supabase
        .from("subscription_payments")
        .update({
          status: "completed",
          mpesa_receipt_number: mpesaReceiptNumber,
          transaction_amount: transactionAmount,
          completed_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      if (updateError) {
        console.error("Failed to update payment status:", updateError);
        
        // Log processing error
        await supabase.from("mpesa_callback_log").insert({
          merchant_request_id: stkCallback.MerchantRequestID,
          checkout_request_id: stkCallback.CheckoutRequestID,
          result_code: stkCallback.ResultCode,
          result_desc: stkCallback.ResultDesc,
          mpesa_receipt_number: mpesaReceiptNumber,
          transaction_amount: transactionAmount,
          phone_number: phoneNumber,
          raw_callback: body,
          user_id: payment.user_id,
          subscription_tier: payment.tier,
          signature_valid: signatureValid,
          processing_status: "failed",
          processing_error: `DB update failed: ${updateError.message}`,
        });
        
        return new Response(
          JSON.stringify({
            ResultCode: 1,
            ResultDesc: "Failed to update payment status",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Update user subscription tier in profiles table
      const { error: tierError } = await supabase
        .from("profiles")
        .update({
          subscription_tier: payment.tier,
          subscription_activated_at: new Date().toISOString(),
        })
        .eq("id", payment.user_id);

      if (tierError) {
        console.error("Failed to activate subscription tier:", tierError);
      }

      console.log(
        `✅ Payment successful for user ${payment.user_id} (${userName}), tier: ${payment.tier}, receipt: ${mpesaReceiptNumber}`
      );

      // Log successful callback to audit table
      await supabase.from("mpesa_callback_log").insert({
        merchant_request_id: stkCallback.MerchantRequestID,
        checkout_request_id: stkCallback.CheckoutRequestID,
        result_code: stkCallback.ResultCode,
        result_desc: stkCallback.ResultDesc,
        mpesa_receipt_number: mpesaReceiptNumber,
        transaction_amount: transactionAmount,
        phone_number: phoneNumber,
        raw_callback: body,
        user_id: payment.user_id,
        subscription_tier: payment.tier,
        signature_valid: signatureValid,
        processing_status: "processed",
        processed_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          ResultCode: 0,
          ResultDesc: "Payment received and processed",
          userId: payment.user_id,
          userName: userName,
          tier: payment.tier,
          receipt: mpesaReceiptNumber,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else {
      // Payment failed - get user info for logging
      const { data: failedPayment } = await supabase
        .from("subscription_payments")
        .select("id, user_id, tier")
        .eq("merchant_request_id", stkCallback.MerchantRequestID)
        .eq("checkout_request_id", stkCallback.CheckoutRequestID)
        .single();

      const { data: failedUserProfile } = await supabase
        .from("profiles")
        .select("full_name, username, email")
        .eq("id", failedPayment?.user_id)
        .single();

      const failedUserName = failedUserProfile?.full_name || failedUserProfile?.username || failedUserProfile?.email || "Unknown User";

      // Mark payment as failed
      const { error: updateError } = await supabase
        .from("subscription_payments")
        .update({
          status: "failed",
          failure_reason: stkCallback.ResultDesc,
          completed_at: new Date().toISOString(),
        })
        .eq("merchant_request_id", stkCallback.MerchantRequestID)
        .eq("checkout_request_id", stkCallback.CheckoutRequestID);

      if (updateError) {
        console.error("Failed to update failed payment:", updateError);
      }

      console.log(
        `❌ Payment failed for user ${failedPayment?.user_id} (${failedUserName}): ${stkCallback.ResultDesc} (Code: ${stkCallback.ResultCode})`
      );

      // Log failed callback to audit table
      await supabase.from("mpesa_callback_log").insert({
        merchant_request_id: stkCallback.MerchantRequestID,
        checkout_request_id: stkCallback.CheckoutRequestID,
        result_code: stkCallback.ResultCode,
        result_desc: stkCallback.ResultDesc,
        raw_callback: body,
        user_id: failedPayment?.user_id,
        subscription_tier: failedPayment?.tier,
        signature_valid: signatureValid,
        processing_status: "processed",
        processed_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          ResultCode: 0,
          ResultDesc: "Failure notification received",
          userId: failedPayment?.user_id,
          userName: failedUserName,
          failureReason: stkCallback.ResultDesc,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  } catch (error) {
    console.error("Callback error:", error);

    return new Response(
      JSON.stringify({
        ResultCode: 1,
        ResultDesc:
          error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
