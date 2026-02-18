# 🚀 PAMBO Backend - Complete Setup & Deployment Guide

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Environment Configuration](#environment-configuration)
3. [Running the Server](#running-the-server)
4. [API Documentation](#api-documentation)
5. [M-Pesa Integration](#m-pesa-integration)
6. [Deployment Options](#deployment-options)
7. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites
- Node.js 16+ and npm/yarn
- Supabase account with credentials
- M-Pesa Daraja API credentials (for payments)
- Postman or similar API testing tool

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Create Environment File

Create `.env.local` in the backend directory:

```env
# ============ SERVER ============
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# ============ SUPABASE ============
VITE_SUPABASE_URL=https://cyydmongvxzdynmdyrzp.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============ M-PESA ============
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASSKEY=your_passkey
MPESA_BASE_URL=https://sandbox.safaricom.co.ke
MPESA_CALLBACK_URL=http://localhost:5000/api/payments/mpesa/callback

# ============ AWS/STORAGE (Optional) ============
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=pambo-uploads
AWS_REGION=us-east-1
```

---

## Environment Configuration

### Supabase Keys
- **VITE_SUPABASE_URL**: From Supabase project settings
- **SUPABASE_SERVICE_KEY**: Service role key (use in backend only!)

### M-Pesa Credentials
Get these from [Safaricom Daraja Portal](https://developer.safaricom.co.ke):

1. Register your app
2. Get Consumer Key & Secret
3. Generate passkey
4. Set callback URL to your server endpoint

### Frontend URL
Update `FRONTEND_URL` to allow CORS from your frontend.

---

## Running the Server

### Development Mode (with hot reload)

```bash
npm run dev
```

Output:
```
╔═══════════════════════════════════════════╗
║     PAMBO BACKEND SERVER RUNNING          ║
╠═══════════════════════════════════════════╣
║ 🚀 Port: 5000
║ 🌍 URL: http://localhost:5000
║ 📊 Health: http://localhost:5000/health
║ 🔌 API: http://localhost:5000/api/health
║ 🗄️  Database: https://cyydmongvxzdynmdyrzp.supabase.co
║ ⚙️  Mode: development
╚═══════════════════════════════════════════╝
```

### Production Build

```bash
npm run build
npm start
```

---

## API Documentation

### Health Check
```bash
GET /health
GET /api/health
```

### Authentication Endpoints
```
POST   /api/auth/verify-token          - Verify JWT token
POST   /api/auth/get-user              - Get user profile
POST   /api/auth/update-profile        - Update user info
POST   /api/auth/seller-profile        - Get seller profile
```

### Listings Endpoints
```
POST   /api/listings                   - Create listing
GET    /api/listings/:id               - Get single listing
GET    /api/listings/hub/:hub          - Get listings by hub
GET    /api/listings/seller/:sellerId  - Get seller's listings
PUT    /api/listings/:id               - Update listing
DELETE /api/listings/:id               - Delete listing
GET    /api/listings/search/:query     - Search listings
```

### Orders Endpoints
```
POST   /api/orders                     - Create order
GET    /api/orders/:id                 - Get order details
GET    /api/orders/buyer/:buyerId      - Get buyer's orders
GET    /api/orders/seller/:sellerId    - Get seller's orders
PATCH  /api/orders/:id/status          - Update order status
PUT    /api/orders/:id                 - Update order
DELETE /api/orders/:id                 - Cancel order
```

### Payments Endpoints
```
POST   /api/payments/mpesa/initiate           - Start M-Pesa payment
POST   /api/payments/mpesa/callback           - M-Pesa webhook
GET    /api/payments/:orderId                 - Get payment status
POST   /api/payments/mpesa/verify             - Verify payment
GET    /api/payments/seller/:sellerId/payouts - Get seller payouts
```

### Reviews Endpoints
```
POST   /api/reviews                           - Create review
GET    /api/reviews/listing/:listingId        - Get listing reviews
GET    /api/reviews/seller/:sellerId          - Get seller reviews
POST   /api/reviews/:id/helpful               - Mark as helpful
PUT    /api/reviews/:id                       - Update review
DELETE /api/reviews/:id                       - Delete review
```

### Admin Endpoints
```
GET    /api/admin/dashboard           - Dashboard stats
GET    /api/admin/users               - List all users
PATCH  /api/admin/users/:userId/ban   - Ban user
PATCH  /api/admin/users/:userId/unban - Unban user
PATCH  /api/admin/listings/:id/remove - Remove listing
GET    /api/admin/activity-logs       - Admin logs
GET    /api/admin/reports             - View reports
```

---

## M-Pesa Integration

### 1. Get Test Credentials
Visit [Safaricom Daraja Sandbox](https://developer.safaricom.co.ke/Sandbox):
- Consumer Key
- Consumer Secret
- Test phone number: 254708374149

### 2. Initiate Payment

```bash
curl -X POST http://localhost:5000/api/payments/mpesa/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "254708374149",
    "amount": 100,
    "orderId": "order_123",
    "description": "Purchase order"
  }'
```

### 3. Handle Callback
M-Pesa will POST to `/api/payments/mpesa/callback` with payment status:
- ✅ ResultCode 0 = Success
- ❌ ResultCode 1 = Failure

The backend automatically:
1. Updates payment status in database
2. Updates order status to "paid"
3. Logs the transaction

---

## Deployment Options

### Option 1: Heroku (Recommended)

#### Setup
```bash
heroku login
heroku create pambo-backend
git push heroku main
```

#### Set Environment Variables
```bash
heroku config:set VITE_SUPABASE_URL=...
heroku config:set SUPABASE_SERVICE_KEY=...
heroku config:set MPESA_CONSUMER_KEY=...
heroku config:set MPESA_CONSUMER_SECRET=...
heroku config:set MPESA_BUSINESS_SHORT_CODE=174379
heroku config:set MPESA_PASSKEY=...
heroku config:set MPESA_CALLBACK_URL=https://pambo-backend.herokuapp.com/api/payments/mpesa/callback
```

#### View Logs
```bash
heroku logs --tail
```

---

### Option 2: Railway.app

#### Setup
1. Create account at [railway.app](https://railway.app)
2. Connect GitHub repository
3. Set environment variables in dashboard
4. Deploy

#### Environment Variables
Same as Heroku setup above

---

### Option 3: Render.com

#### Setup
1. Create account at [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub
4. Set environment variables
5. Deploy

---

### Option 4: Docker (Self-hosted)

#### Create `Dockerfile`
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

#### Build & Run
```bash
docker build -t pambo-backend .
docker run -p 5000:5000 \
  -e VITE_SUPABASE_URL=... \
  -e SUPABASE_SERVICE_KEY=... \
  pambo-backend
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use a different port
PORT=5001 npm run dev
```

### CORS Errors
Update `FRONTEND_URL` in `.env.local` to match your frontend domain:
```env
FRONTEND_URL=https://your-domain.com
```

### M-Pesa Not Working
1. Verify credentials in Safaricom Daraja
2. Check callback URL is accessible
3. Review M-Pesa logs in dashboard
4. Test with sandbox credentials first

### Database Connection Issues
1. Verify Supabase credentials
2. Check service key is from backend (not anon key)
3. Ensure RLS policies allow your service key

### Payment Callback Not Received
1. Ensure callback URL is publicly accessible (ngrok for local):
   ```bash
   ngrok http 5000
   # Then update MPESA_CALLBACK_URL=https://your-ngrok-url/api/payments/mpesa/callback
   ```
2. Check Safaricom webhook logs
3. Verify firewall allows POST requests

---

## Next Steps

1. **Frontend Integration**: Update API calls to use backend endpoints
2. **File Uploads**: Add multer middleware for image uploads
3. **WebSockets**: Implement real-time order updates
4. **Authentication**: Add JWT verification middleware
5. **Rate Limiting**: Implement rate limiting for security
6. **Logging**: Add Winston/Pino for better logging

---

## Support

For issues:
1. Check logs: `npm run dev` (dev mode)
2. Verify environment variables
3. Test endpoints with Postman
4. Check Supabase dashboard for data
5. Review M-Pesa transaction logs
