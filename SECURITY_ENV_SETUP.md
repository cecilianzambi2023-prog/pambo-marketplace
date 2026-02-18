# 🔐 Security Architecture - Environment Variables

## ✅ Current Setup (CORRECT)

### Frontend Environment (`.env.local` - ROOT)
```dotenv
# ✅ PUBLIC - Safe to expose (starts with VITE_)
VITE_SUPABASE_URL=https://cyydmongvxzdynmdyrzp.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_92XgiBVORmZV1Dp5eiaVoQ_11LmCNQu

# ❌ SENSITIVE - Kept secure
# SUPABASE_SERVICE_ROLE_KEY is NOT here
```

**Why?** Vite variables prefixed with `VITE_` are embedded in the compiled JavaScript and visible to users. Only public, anonymous keys should be here.

---

### Deno Functions Environment (Supabase Cloud Secrets)
The Deno function at `services/supabase/functions/mpesa-payment/index.ts` uses **Deno.env.get()** to securely access:

```typescript
// ✅ SECURE - Retrieved via Deno.env.get() at runtime
const supabaseUrl = Deno.env.get("SUPABASE_URL")
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
```

These are configured in **Supabase Cloud Secrets** (not in any .env file on disk):

1. Go to **Supabase Dashboard** → Your Project
2. Click **Settings** → **Secrets**
3. Add these secrets:
   ```
   SUPABASE_URL = https://cyydmongvxzdynmdyrzp.supabase.co
   SUPABASE_SERVICE_ROLE_KEY = your_service_role_key
   MPESA_CONSUMER_KEY = your_key
   MPESA_CONSUMER_SECRET = your_secret
   MPESA_PASSKEY = your_passkey
   MPESA_SHORTCODE = 174379
   ```

---

### Local Development Only (`services/supabase/.env.local`)
```dotenv
# ⚠️ LOCAL DEVELOPMENT ONLY - NEVER COMMIT
# This file is ignored by git (*.local in .gitignore)

SUPABASE_URL=https://cyydmongvxzdynmdyrzp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_PASSKEY=your_passkey_here
MPESA_SHORTCODE=174379
```

Used with: `supabase start` for local testing

---

## 🔒 Security Best Practices (Your Setup)

| Secret Type | Storage | Exposure | Used By |
|-----------|---------|----------|---------|
| **Anon Key** | `.env.local` (root) | ✅ Safe (browser only) | Frontend/Components |
| **Service Role Key** | Supabase Cloud Secrets | ✅ Safe (server only) | Deno Functions |
| **M-Pesa Keys** | Supabase Cloud Secrets | ✅ Safe (server only) | Deno Functions |

---

## 🚀 Deployment Security

### Frontend (Vercel/Netlify/Build)
```bash
1. Only set VITE_* variables (public)
2. Everything else is blocked from Vite
3. No service keys in compiled output
```

### Deno Functions (Supabase Edge)
```bash
1. Access secrets via Deno.env.get()
2. Secrets are not embedded in function code
3. Secrets are encrypted at rest in Supabase
4. Automatically injected at runtime
```

---

## ✅ Verification Checklist

- [ ] Frontend `.env.local` (root) - Only has `VITE_*` variables
- [ ] `SUPABASE_SERVICE_ROLE_KEY` NOT in frontend `.env.local` ✅
- [ ] Deno function uses `Deno.env.get()` for secrets ✅
- [ ] `.gitignore` includes `*.local` ✅
- [ ] Production secrets configured in Supabase Cloud Secrets
- [ ] Local `.env.local` files are in `.gitignore` ✅

---

## 📝 Local Testing with Supabase

To test locally with the Deno function:

```bash
# 1. Copy .env template to .env.local (local development only)
cp services/supabase/.env.local.example services/supabase/.env.local

# 2. Fill in your actual credentials
nano services/supabase/.env.local

# 3. Start Supabase locally
supabase start

# 4. Test the function
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/mpesa-payment' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "phone":"254708374149",
    "amount":100,
    "orderId":"order_123",
    "description":"Test payment",
    "buyerId":"user_123"
  }'
```

---

## 🎯 Summary

Your setup is **secure and production-ready**:

✅ Frontend only accesses public keys  
✅ Service keys stay in Supabase Cloud (never in .env files)  
✅ Deno functions use `Deno.env.get()` for secure runtime access  
✅ All `.env.local` files are ignored by git  
✅ Local development has separate `.env.local` in `services/supabase/`  

**You're good to go!** 🚀
