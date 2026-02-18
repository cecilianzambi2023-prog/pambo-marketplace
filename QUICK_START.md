# ⚡ PAMBO Quick Commands & Cheatsheet

## 🚀 Start Everything

### Start Frontend (Port 3000)
```bash
cd /path/to/pambo
npm run dev
```

### Start Backend (Port 5000)
```bash
cd backend
npm run dev
```

### Start Both (in separate terminals)
```bash
# Terminal 1
npm run dev

# Terminal 2
cd backend && npm run dev
```

---

## 🧪 API Testing

### Test Backend Health
```bash
# Is the server running?
curl http://localhost:5000/api/health

# Expected response:
# {"status":"API running","database":"connected","timestamp":"..."}
```

### Test Listings Endpoint
```bash
# Get all marketplace listings
curl http://localhost:5000/api/listings/hub/marketplace

# Create a new listing
curl -X POST http://localhost:5000/api/listings \
  -H "Content-Type: application/json" \
  -d '{
    "title":"My Product",
    "price":5000,
    "sellerId":"user123",
    "description":"Good product",
    "hub":"marketplace"
  }'
```

### Test M-Pesa Payment
```bash
# Initiate payment
curl -X POST http://localhost:5000/api/payments/mpesa/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "phone":"254708374149",
    "amount":100,
    "orderId":"order_abc123",
    "description":"Purchase order"
  }'

# Get payment status
curl http://localhost:5000/api/payments/order_abc123
```

### Test Orders
```bash
# Create order
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "buyerId":"buyer1",
    "sellerId":"seller1",
    "listings":[{"id":"list1","qty":1}],
    "totalAmount":5000,
    "currency":"KES"
  }'

# Get buyer orders
curl http://localhost:5000/api/orders/buyer/buyer1

# Update order status
curl -X PATCH http://localhost:5000/api/orders/order_id/status \
  -H "Content-Type: application/json" \
  -d '{"status":"shipped"}'
```

---

## 🗄️ Database Access

### Connect to Supabase
1. Visit: https://app.supabase.com
2. Select your project
3. Go to SQL Editor
4. Run queries:
```sql
-- See all users
SELECT * FROM users LIMIT 10;

-- See all listings
SELECT * FROM listings LIMIT 10;

-- See all orders
SELECT * FROM orders;

-- See payments
SELECT * FROM payments;

-- Count users
SELECT COUNT(*) FROM users;
```

---

## 🔧 Environment Setup

### Update Frontend Env
Edit `.env.local`:
```env
VITE_SUPABASE_URL=https://cyydmongvxzdynmdyrzp.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_92XgiBVORmZV1Dp5eiaVoQ_11LmCNQu
VITE_API_URL=http://localhost:5000/api
GEMINI_API_KEY=your_api_key
```

### Update Backend Env
Edit `backend/.env.local`:
```env
PORT=5000
NODE_ENV=development
VITE_SUPABASE_URL=https://cyydmongvxzdynmdyrzp.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=http://localhost:5000/api/payments/mpesa/callback
```

---

## 📦 NPM Commands

### Install Dependencies
```bash
# Frontend
npm install

# Backend
cd backend && npm install
```

### Build
```bash
# Frontend
npm run build

# Backend
cd backend && npm run build
```

### TypeScript Check
```bash
# Frontend
npx tsc --noEmit

# Backend
cd backend && npx tsc --noEmit
```

### Format Code
```bash
# Frontend
npx prettier --write "src/**/*.{ts,tsx}"

# Backend
cd backend && npx prettier --write "src/**/*.ts"
```

---

## 🐳 Docker Commands

### Build Docker Image
```bash
docker build -t pambo-backend:latest .
```

### Run Docker Container
```bash
docker run -p 5000:5000 \
  -e VITE_SUPABASE_URL=... \
  -e SUPABASE_SERVICE_KEY=... \
  -e MPESA_CONSUMER_KEY=... \
  pambo-backend:latest
```

### Check Running Containers
```bash
docker ps
```

### Stop Container
```bash
docker stop container_id
```

---

## 🚀 Deployment Commands

### Deploy to Heroku
```bash
# Login
heroku login

# Create app
heroku create pambo-backend

# Set environment vars
heroku config:set VITE_SUPABASE_URL=https://...
heroku config:set SUPABASE_SERVICE_KEY=...

# Deploy
git push heroku main

# View logs
heroku logs --tail

# Check status
heroku apps:info pambo-backend
```

### Deploy to Railway
```bash
# Connect GitHub repo
# Railway will auto-deploy on push

# View logs
railway logs

# Shell into container
railway shell
```

### Deploy to Vercel
```bash
# Install CLI
npm i -g vercel

# Deploy
vercel

# Set production environment
vercel env add VITE_SUPABASE_URL
vercel env add SUPABASE_SERVICE_KEY
```

---

## 🔍 Debugging

### Check Port Usage
```bash
# Check what's running on port 5000
lsof -i:5000

# Kill process on port
lsof -ti:5000 | xargs kill -9

# Use different port
PORT=5001 npm run dev
```

### Check Logs
```bash
# Frontend console (browser DevTools)
F12 → Console tab

# Backend console
ctrl+c to stop
npm run dev  # restart to see new logs

# Supabase logs
https://app.supabase.com → Logs
```

### Test Database Connection
```bash
# Frontend service
curl http://localhost:5000/api/health

# Should show database: "connected"
```

### Clear Cache
```bash
# npm cache
npm cache clean --force

# node_modules
rm -rf node_modules
npm install
```

---

## 📝 Common Edits

### Add New API Endpoint
1. Create in `backend/src/routes/[feature].ts`
2. Add route to `backend/src/server.ts`
3. Update API client in `services/apiClient.ts`
4. Update types in `types.ts`

### Update Component
```typescript
// services/apiClient.ts
import apiClient from '@/services/apiClient';

// In component
const { data, loading, error } = await apiClient.getListing(id);
```

### Add New Database Table
1. Create migration in Supabase
2. Update `types.ts` with new type
3. Update `services/` with new functions
4. Update React hooks if needed

---

## 🔐 Security Quick Checks

### Verify No Secrets in Code
```bash
git log --all --source --diff-filter=D -S "SUPABASE_SERVICE_KEY" -- . | head -10
```

### Check Environment Variables
```bash
# Frontend (public keys only)
cat .env.local | grep VITE_

# Backend (all keys, but file ignored in git)
cat backend/.env.local | wc -l
```

### Rotate Keys
1. Go to Supabase → Settings → API Keys
2. Regenerate service key
3. Update backend `.env.local`
4. Restart backend server

---

## 📊 Project Statistics

### Count Lines of Code
```bash
# Frontend
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1

# Backend
find backend/src -name "*.ts" | xargs wc -l | tail -1

# Total
echo "Frontend:"; find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs wc -l | tail -1
echo "Backend:"; find backend/src -type f -name "*.ts" | xargs wc -l | tail -1
```

### Count Components
```bash
ls -1 components/*.tsx | wc -l
```

### Count API Endpoints
```bash
grep -r "router\.\(get\|post\|put\|patch\|delete\)" backend/src/routes/ | wc -l
```

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# macOS/Linux
lsof -i:5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
Solution:
1. Make sure backend is running
2. Check FRONTEND_URL in `backend/.env.local`
3. Restart backend server

### Supabase Connection Failed
```
Failed to resolve import '@supabase/supabase-js'
```
Solution:
```bash
cd backend
npm install @supabase/supabase-js
```

### M-Pesa Error
```
M-Pesa payment failed
```
Solution:
1. Check credentials at https://developer.safaricom.co.ke
2. Verify callback URL is accessible
3. Use ngrok for local testing:
```bash
ngrok http 5000
# Update MPESA_CALLBACK_URL with ngrok URL
```

### Database Not Connected
```
Supabase connection: Error
```
Solution:
1. Verify database URL in `.env.local`
2. Check credentials are correct
3. Test connection:
```bash
curl http://localhost:5000/api/health
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| PROJECT_SUMMARY.md | Complete project overview |
| DEPLOYMENT_OPTIONS.md | All 3 deployment options |
| BACKEND_DEPLOYMENT.md | Full backend setup |
| IMPLEMENTATION_ROADMAP.md | Multi-phase roadmap |
| BACKEND_API_REFERENCE.md | API documentation |
| INTEGRATION_GUIDE.md | Component examples |
| STATUS_REPORT.md | Current status |

---

## 🎯 Quick Checklist

Before deploying:
- [ ] Frontend `.env.local` configured
- [ ] Backend `.env.local` configured
- [ ] Backend server running: `npm run dev` (backend folder)
- [ ] All API endpoints tested: `curl http://localhost:5000/api/health`
- [ ] Database connected
- [ ] M-Pesa credentials set (test keys)
- [ ] User can signup/login
- [ ] Components showing real data
- [ ] No console errors
- [ ] No TypeScript errors

---

## 🚀 Launch Command

When ready to deploy:

```bash
# Backend
cd backend
npm run build
npm start

# Or with deployment platform
vercel  # or 'heroku' or 'railway'
```

---

## 💡 Pro Tips

1. **Use Postman** - Test all API endpoints
2. **Enable DevTools** - F12 in browser for logs
3. **Watch Supabase logs** - Track database operations
4. **Use ngrok** - Expose local server for webhooks
5. **Keep .env.local** - Never commit to Git
6. **Document changes** - Keep team updated
7. **Test before deploy** - Use staging environment
8. **Monitor in production** - Set up error tracking

---

**Need help?** Check the documentation files listed above.  
**Ready to go live?** Follow DEPLOYMENT_OPTIONS.md

Good luck! 🎉
