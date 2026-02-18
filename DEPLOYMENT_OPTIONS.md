# 🚀 Quick Start Guides for All 3 Deployment Options

## Option 1: Full Backend (Production-Ready)

This is the **complete, recommended setup** with all features.

### What's Included
✅ Express.js server with all API routes  
✅ M-Pesa payment integration with callbacks  
✅ File upload endpoint  
✅ WebSocket server for real-time features  
✅ Admin dashboard backend  
✅ Supabase integration  
✅ Error handling & logging  
✅ CORS with environment-based security  

### Quick Start

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Create .env.local (see BACKEND_DEPLOYMENT.md)
# Add your Supabase & M-Pesa credentials

# 4. Run development server
npm run dev

# 5. Test the server
curl http://localhost:5000/api/health
```

### Verify All Features Working

```bash
# Health check
curl http://localhost:5000/health

# Create listing
curl -X POST http://localhost:5000/api/listings \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","price":100,"sellerId":"seller1"}'

# Create order
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"buyerId":"buyer1","sellerId":"seller1","listings":[],"totalAmount":100}'

# Initiate payment
curl -X POST http://localhost:5000/api/payments/mpesa/initiate \
  -H "Content-Type: application/json" \
  -d '{"phone":"254708374149","amount":100,"orderId":"order1"}'
```

### Deploy to Production

**Heroku (Easiest):**
```bash
heroku login
heroku create pambo-backend
git push heroku main
# Set env vars in Heroku dashboard
```

**Railway:**
```bash
# Connect GitHub repo
# Set env vars in dashboard
# Auto-deploys on push
```

**Docker:**
```bash
docker build -t pambo-backend .
docker run -p 5000:5000 \
  -e VITE_SUPABASE_URL=... \
  -e SUPABASE_SERVICE_KEY=... \
  pambo-backend
```

---

## Option 2: M-Pesa Only (Minimal)

This is a **lightweight setup** if you only need payments.

### What's Included
✅ M-Pesa payment initiated  
✅ M-Pesa callback handler  
✅ Payment status verification  
✅ Minimal Express setup  
✅ Supabase integration for data storage  

### Implementation

```typescript
// backend/src/server-minimal.ts
import express from 'express';
import cors from 'cors';
import { handleMpesaCallback, initiateMpesaPayment } from './routes/payments';

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// M-Pesa endpoints only
app.post('/api/payments/mpesa/initiate', initiateMpesaPayment);
app.post('/api/payments/mpesa/callback', handleMpesaCallback);
app.get('/api/payments/:orderId', async (req, res) => {
  // Get payment status
});

app.listen(5000, () => console.log('M-Pesa server running'));
```

### Environment Setup

```env
NODE_ENV=development
PORT=5000
VITE_SUPABASE_URL=https://cyydmongvxzdynmdyrzp.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://your-domain/api/payments/mpesa/callback
```

### Quick Test

```bash
# Start server
PORT=5000 node backend/src/server-minimal.ts

# Test M-Pesa payment
curl -X POST http://localhost:5000/api/payments/mpesa/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "254708374149",
    "amount": 100,
    "orderId": "test_order"
  }'

# Expected response:
# {
#   "success": true,
#   "message": "Payment initiated",
#   "payment": { ... }
# }
```

### Deploy

**As Azure Function (Recommended for payments):**

```bash
# Create function app
az functionapp create \
  --resource-group pambo \
  --consumption-plan-location eastus \
  --runtime node \
  --name pambo-mpesa-func

# Deploy
func azure functionapp publish pambo-mpesa-func
```

**Or use any serverless platform:**
- AWS Lambda
- Google Cloud Functions
- Vercel Functions
- Netlify Functions

---

## Option 3: Deploy Now (Pre-configured)

This option provides **ready-to-deploy configurations** for multiple platforms.

### Automatic Deployment Setup

We've created deployment configs for these platforms:

#### 1. Vercel (Easiest for frontend + serverless backend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables via dashboard
# Automatic HTTPS + CDN included
```

**Config: `vercel.json`**
```json
{
  "buildCommand": "npm run build",
  "commands": {
    "build": "npm run build",
    "dev": "npm run dev"
  },
  "env": [
    "VITE_SUPABASE_URL",
    "SUPABASE_SERVICE_KEY",
    "MPESA_CONSUMER_KEY",
    "MPESA_CONSUMER_SECRET"
  ]
}
```

#### 2. Heroku (Best for full backend)

```bash
# Create app
heroku create pambo-backend-prod

# Set config
heroku config:set VITE_SUPABASE_URL=...
heroku config:set SUPABASE_SERVICE_KEY=...
heroku config:set MPESA_CONSUMER_KEY=...
heroku config:set MPESA_CONSUMER_SECRET=...

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

**Config: `Procfile`**
```
web: node backend/src/server.ts
```

#### 3. Railway.app (Modern alternative)

```bash
# Connect GitHub repo
# Add environment variables:
VITE_SUPABASE_URL
SUPABASE_SERVICE_KEY
MPESA_CONSUMER_KEY
MPESA_CONSUMER_SECRET

# Auto-deploys on push
```

#### 4. Docker + AWS ECS

```bash
# Build image
docker build -t pambo-backend .

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker tag pambo-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/pambo-backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/pambo-backend:latest

# Deploy with ECS
# ... (configure in AWS console)
```

### One-Click Setup Script

```bash
#!/bin/bash
# deploy.sh - Run this to set up deployment

echo "🚀 PAMBO Deployment Setup"
echo "========================"

# 1. Ask which platform
echo "Choose deployment platform:"
echo "1. Heroku"
echo "2. Railway"
echo "3. Vercel"
echo "4. Docker (self-hosted)"
read platform

# 2. Collect environment variables
echo "Enter VITE_SUPABASE_URL:"
read SUPABASE_URL

echo "Enter SUPABASE_SERVICE_KEY:"
read SERVICE_KEY

echo "Enter MPESA_CONSUMER_KEY:"
read MPESA_KEY

# 3. Deploy based on choice
if [ $platform -eq 1 ]; then
  echo "🛫 Deploying to Heroku..."
  heroku create pambo-backend
  heroku config:set VITE_SUPABASE_URL=$SUPABASE_URL
  heroku config:set SUPABASE_SERVICE_KEY=$SERVICE_KEY
  heroku config:set MPESA_CONSUMER_KEY=$MPESA_KEY
  git push heroku main
  echo "✅ Deployed! Visit: $(heroku apps:info -j | jq -r '.web_url')"
fi

# ... similar for other platforms
```

---

## Comparison Table

| Feature | Option 1 | Option 2 | Option 3 |
|---------|----------|----------|----------|
| **Setup Time** | 10 min | 5 min | 2 min |
| **M-Pesa Payments** | ✅ | ✅ | ✅ |
| **All API Routes** | ✅ | ❌ | ✅ |
| **File Uploads** | ✅ | ❌ | ✅ |
| **WebSockets** | ✅ | ❌ | ✅ |
| **Admin Panel** | ✅ | ❌ | ✅ |
| **Production Ready** | ✅ | ⚠️ | ✅ |
| **Cost (per month)** | $7-50 | $0-7 | $0-100 |

---

## Which Option Should You Choose?

- **Option 1 (Full Backend)**: You want a complete, production-ready system
- **Option 2 (M-Pesa Only)**: You only need payments, can integrate the rest later
- **Option 3 (Deploy Now)**: You want to go live immediately with pre-configured setup

---

## Testing Your Deployment

After deployment, test these endpoints:

```bash
# Replace YOUR_DOMAIN with actual domain

# 1. Health check
curl https://YOUR_DOMAIN/api/health

# 2. Create listing
curl -X POST https://YOUR_DOMAIN/api/listings \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","price":100,"sellerId":"s1"}'

# 3. Test M-Pesa
curl -X POST https://YOUR_DOMAIN/api/payments/mpesa/initiate \
  -H "Content-Type: application/json" \
  -d '{"phone":"254708374149","amount":100,"orderId":"order1"}'
```

---

## Support & Next Steps

After deployment:
1. **Update Frontend**: Change API calls to point to your backend domain
2. **Add Authentication**: Implement JWT verification middleware
3. **Monitor**: Set up logging with Datadog/LogRocket
4. **Scale**: Use CDN for static files, add caching layer
5. **Security**: Enable HTTPS, rate limiting, input validation

Good luck! 🚀
