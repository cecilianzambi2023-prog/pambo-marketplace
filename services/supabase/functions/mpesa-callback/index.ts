import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase configuration" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const body = (await req.json()) as CallbackBody;
    const stkCallback = body.Body.stkCallback;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Result codes:
    // 0 = Success
    // 1 = Insufficient Funds
    // 2 = Less Amount = The initiating customer requested an amount less than the minimum required balance.
    // etc.

    if (stkCallback.ResultCode === 0) {
      // Payment successful - extract M-Pesa receipt and amount
      let mpesaReceiptNumber = "";
      let transactionAmount = 0;

      if (stkCallback.CallbackMetadata?.Item) {
        for (const item of stkCallback.CallbackMetadata.Item) {
          if (item.Name === "MpesaReceiptNumber") {
            mpesaReceiptNumber = String(item.Value);
          }
          if (item.Name === "Amount") {
            transactionAmount = Number(item.Value);
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
        `Payment successful for user ${payment.user_id} (${userName}), tier: ${payment.tier}, receipt: ${mpesaReceiptNumber}`
      );

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
        `Payment failed for user ${failedPayment?.user_id} (${failedUserName}): ${stkCallback.ResultDesc} (Code: ${stkCallback.ResultCode})`
      );

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
