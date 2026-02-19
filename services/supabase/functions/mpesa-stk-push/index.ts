import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const productionAllowedOrigins = ["https://pambo.biz", "https://www.pambo.biz"];

const developmentAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  ...productionAllowedOrigins,
];

function isProductionRuntime(): boolean {
  const runtimeHints = [
    Deno.env.get("ENVIRONMENT"),
    Deno.env.get("NODE_ENV"),
    Deno.env.get("SUPABASE_ENV"),
    Deno.env.get("DENO_ENV"),
  ];

  return runtimeHints.some((value) => value?.trim().toLowerCase() === "production");
}

function getAllowedOrigins(): string[] {
  const configured = Deno.env.get("CORS_ALLOWED_ORIGINS");
  if (!configured) {
    return isProductionRuntime() ? productionAllowedOrigins : developmentAllowedOrigins;
  }

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

interface STKPushRequest {
  phone_number: string;
  amount: number;
  tier: string;
  user_id: string;
  business_short_code?: string;
  account_reference?: string;
}

interface DarajaTokenResponse {
  access_token: string;
  expires_in: number;
}

interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

// Generate password for M-Pesa STK Push
function generatePassword(
  businessShortCode: string,
  passkey: string,
  timestamp: string
): string {
  const data = businessShortCode + passkey + timestamp;
  return btoa(data);
}

// Generate current timestamp in YYYYMMDDHHMMSS format
function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Get Daraja OAuth Token
async function getDarajaToken(
  consumerKey: string,
  consumerSecret: string
): Promise<string> {
  const auth =
    "Basic " +
    btoa(consumerKey + ":" + consumerSecret);

  const response = await fetch(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      method: "GET",
      headers: {
        Authorization: auth,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get Daraja token: ${response.statusText}`);
  }

  const data = (await response.json()) as DarajaTokenResponse;
  return data.access_token;
}

// Format phone number to 254XXXXXXXXX format
function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // If starts with 0, replace with 254
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.substring(1);
  }
  // If doesn't start with 254, prepend it
  else if (!cleaned.startsWith("254")) {
    cleaned = "254" + cleaned;
  }

  return cleaned;
}

// Initiate STK Push
async function initiateSTKPush(
  token: string,
  req: STKPushRequest,
  shortCode: string,
  passkey: string,
  callbackUrl: string
): Promise<STKPushResponse> {
  const timestamp = generateTimestamp();
  const password = generatePassword(shortCode, passkey, timestamp);
  const formattedPhone = formatPhoneNumber(req.phone_number);

  const payload = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.floor(req.amount), // M-Pesa requires integer amounts
    PartyA: formattedPhone,
    PartyB: shortCode,
    PhoneNumber: formattedPhone,
    CallBackURL: callbackUrl,
    AccountReference: req.account_reference || "OffspringDecor",
    TransactionDesc: `${req.tier} Subscription Payment`,
  };

  const response = await fetch(
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(`STK Push failed: ${response.statusText}`);
  }

  const data = (await response.json()) as STKPushResponse;
  return data;
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

  try {
    // Get environment variables
    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");
    const shortCode = Deno.env.get("MPESA_SHORTCODE");
    const passkey = Deno.env.get("MPESA_PASSKEY");
    const callbackUrl = Deno.env.get("MPESA_CALLBACK_URL");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (
      !consumerKey ||
      !consumerSecret ||
      !shortCode ||
      !passkey ||
      !callbackUrl
    ) {
      return new Response(
        JSON.stringify({ error: "Missing M-Pesa configuration" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Parse request body
    const body = (await req.json()) as STKPushRequest;

    // Validate input
    if (!body.phone_number || !body.amount || !body.tier || !body.user_id) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: phone_number, amount, tier, user_id",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get Daraja token
    const token = await getDarajaToken(consumerKey, consumerSecret);

    // Initiate STK Push
    const stkResponse = await initiateSTKPush(
      token,
      body,
      shortCode,
      passkey,
      callbackUrl
    );

    // Save transaction to Supabase
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { error: dbError } = await supabase
        .from("subscription_payments")
        .insert({
          user_id: body.user_id,
          tier: body.tier,
          amount: body.amount,
          phone_number: body.phone_number,
          merchant_request_id: stkResponse.MerchantRequestID,
          checkout_request_id: stkResponse.CheckoutRequestID,
          status: "pending",
          payment_method: "mpesa",
          created_at: new Date().toISOString(),
        });

      if (dbError) {
        console.error("Database error:", dbError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "STK Push initiated successfully",
        data: {
          merchantRequestId: stkResponse.MerchantRequestID,
          checkoutRequestId: stkResponse.CheckoutRequestID,
          responseCode: stkResponse.ResponseCode,
          customerMessage: stkResponse.CustomerMessage,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to initiate STK Push",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
