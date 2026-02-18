# Production SaaS Setup: Final Checklist & Scheduler Configuration

## Overview

You now have a complete premium SaaS subscription system for Pambo. This file provides the final setup steps to make it production-ready, including the critical **automatic renewal scheduler**.

---

## Critical Files & What They Do

### 1. **subscriptionMiddleware.ts** (Backend)
- **Purpose**: Validates subscriptions before key actions
- **Key Functions**:
  - `requireSubscription()` - Blocks non-subscribers from accessing hub features
  - `checkListingLimit()` - Enforces plan-based listing limits (Starter: 10, Pro: 50, Enterprise: 500)
  - `checkImageLimit()` - Enforces daily image upload limits
  - `trackUsage()` - Records feature usage for analytics
  - `verifySellerKYC()` - Confirms seller identity is verified
  - `updateTrustScore()` - Calculates seller trust badges

**Where to use it:**
```typescript
// In backend/src/index.ts
app.post('/api/listings', subscriptionMiddleware.checkListingLimit, createListing);
app.post('/api/upload', subscriptionMiddleware.checkImageLimit, uploadFile);
```

### 2. **subscriptionRenewalScheduler.ts** (Backend)
- **Purpose**: Automatically charges subscribers on Day 30
- **Key Functions**:
  - `renewSubscriptions()` - Main function, runs daily via cron
  - `cancelOverdueSubscriptions()` - Cancels after 3+ days overdue
  - `sendExpiryWarnings()` - Emails 7 days before expiry
  - `sendRenewalReminder()` - SMS one day before billing

**Usage:**
```typescript
// Run daily at 2 AM UTC
import { renewSubscriptions } from './jobs/subscriptionRenewalScheduler';

// Via cron job (see below)
export const runDailyRenewal = async () => {
  await renewSubscriptions();
};
```

### 3. **DEPLOYMENT_GUIDE.md**
- **Purpose**: Step-by-step integration instructions
- **Covers**: Database setup, backend integration, frontend integration, testing, M-Pesa production

### 4. **SUBSCRIPTION_MIGRATION.sql**
- **Purpose**: Database schema for subscriptions
- **Creates**: 7 tables + RLS policies + indexes
- **Run once**: In Supabase SQL Editor

---

## Final Setup Steps

### Step 1: Execute Database Migration

**Time**: 5 minutes

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Create new query
5. Copy the entire `SUBSCRIPTION_MIGRATION.sql` file
6. Paste into SQL editor
7. Click **Run**

✅ **Verify**: All 7 tables in Data/Editor

---

### Step 2: Set Up Daily Renewal Scheduler

**Time**: 10 minutes

Choose your deployment platform and follow the corresponding setup:

#### Option A: Node.js with node-cron (Local/Self-hosted)

**File**: `backend/src/jobs/scheduleJobs.ts` (create new file)

```typescript
import cron from 'node-cron';
import { renewSubscriptions, cancelOverdueSubscriptions, sendExpiryWarnings } from './subscriptionRenewalScheduler';

export const initializeScheduledJobs = () => {
  // Run renewal check daily at 2 AM UTC (0200)
  cron.schedule('0 2 * * *', async () => {
    console.log('Running subscription renewal scheduler...');
    try {
      const results = await renewSubscriptions();
      console.log(`Renewal complete: ${JSON.stringify(results)}`);
    } catch (error) {
      console.error('Renewal scheduler error:', error);
    }
  });

  // Cancel overdue subscriptions daily at 3 AM UTC
  cron.schedule('0 3 * * *', async () => {
    console.log('Running overdue cancellation check...');
    try {
      await cancelOverdueSubscriptions();
      console.log('Overdue cancellation complete');
    } catch (error) {
      console.error('Overdue cancellation error:', error);
    }
  });

  // Send expiry warnings daily at 4 AM UTC
  cron.schedule('0 4 * * *', async () => {
    console.log('Sending expiry warnings...');
    try {
      await sendExpiryWarnings();
      console.log('Expiry warnings sent');
    } catch (error) {
      console.error('Expiry warning error:', error);
    }
  });

  console.log('✓ Scheduled jobs initialized');
};
```

**In `backend/src/index.ts`**, add at startup:

```typescript
import { initializeScheduledJobs } from './jobs/scheduleJobs';

// After Express app initialization
initializeScheduledJobs();
console.log('🚀 Server started with scheduled renewal jobs');
```

**Install cron package:**
```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

#### Option B: AWS Lambda (Recommended for Scalability)

**File**: `backend/src/jobs/lambdaRenewal.ts`

```typescript
import { renewSubscriptions, cancelOverdueSubscriptions, sendExpiryWarnings } from './subscriptionRenewalScheduler';

exports.handler = async (event: any) => {
  try {
    const action = event.action || 'renew';

    if (action === 'renew') {
      const results = await renewSubscriptions();
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, results })
      };
    }

    if (action === 'cancel-overdue') {
      await cancelOverdueSubscriptions();
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    }

    if (action === 'send-warnings') {
      await sendExpiryWarnings();
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid action' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

**Create EventBridge rules:**
- Renewal: `cron(0 2 * * ? *)` → trigger Lambda
- Overdue: `cron(0 3 * * ? *)` → trigger Lambda
- Warnings: `cron(0 4 * * ? *)` → trigger Lambda

#### Option C: Vercel Functions (For Hosted Frontend)

**File**: `api/cron/renewals.ts`

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { renewSubscriptions } from '../../backend/jobs/subscriptionRenewalScheduler';

export default async (req: VercelRequest, res: VercelResponse) => {
  // Verify cron secret
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const results = await renewSubscriptions();
    res.status(200).json({ success: true, results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
```

**Add to `vercel.json`:**
```json
{
  "crons": [
    {
      "path": "/api/cron/renewals",
      "schedule": "0 2 * * *"
    }
  ]
}
```

#### Option D: Manual Trigger via Admin Dashboard

If you want manual control, create an endpoint:

```typescript
// In backend/src/routes/admin.ts

app.post('/api/admin/run-renewal', authenticateAdmin, async (req, res) => {
  try {
    const results = await renewSubscriptions();
    res.json({ success: true, results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

---

### Step 3: Configure Environment Variables

**File**: `backend/.env` or `.env.production`

```env
# Database
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here

# M-Pesa
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_BUSINESS_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
MPESA_TIMEOUT_URL=https://yourdomain.com/api/payments/mpesa/timeout
MPESA_ENVIRONMENT=sandbox  # Change to 'production' when ready

# Email (for reminders & notifications)
EMAIL_SERVICE=sendgrid  # or aws-ses, mailgun, etc
SENDGRID_API_KEY=your_key
SENDER_EMAIL=noreply@pambo.com

# SMS (for renewal reminders)
SMS_SERVICE=twilio  # or african-talk, etc
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Admin
ADMIN_EMAIL=admin@pambo.com
CRON_SECRET=your_random_secret_key_for_verification
```

---

### Step 4: Deploy & Test

**Local Testing:**

```bash
# Install dependencies
npm install node-cron

# Test scheduler manually
node -e "
  const { renewSubscriptions } = require('./dist/jobs/subscriptionRenewalScheduler');
  renewSubscriptions().then(r => console.log(r));
"

# Or create test file: backend/test/renewal.test.ts
```

**Production Deployment:**

```bash
# Build
npm run build

# Deploy to production
npm run deploy

# Verify logs
# For AWS Lambda: CloudWatch logs
# For Vercel: Vercel dashboard
# For local: Console output
```

---

### Step 5: Integrate Middleware into Routes

**File**: `backend/src/index.ts` or `backend/src/routes/listings.ts`

```typescript
import {
  checkListingLimit,
  checkImageLimit,
  trackUsage,
  updateTrustScore
} from './middleware/subscriptionMiddleware';

// Listing creation route
app.post('/api/listings', 
  authenticateUser,
  checkListingLimit,  // ← Add this
  async (req, res) => {
    try {
      const listing = await createListing(req.body);
      
      // Track usage
      await trackUsage(req.body.sellerId, 'listings_created', 1);  // ← Add this
      
      // Update trust score
      await updateTrustScore(req.body.sellerId);  // ← Add this
      
      res.json({ success: true, listing });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Image upload route
app.post('/api/upload',
  authenticateUser,
  checkImageLimit,  // ← Add this
  handleImageUpload
);

// File upload route could also track
app.post('/api/files/upload',
  authenticateUser,
  checkImageLimit,
  async (req, res) => {
    const file = await uploadFile(req.files.file);
    await trackUsage(req.body.userId, 'images_uploaded', 1);
    res.json({ success: true, file });
  }
);
```

---

## Verify Production Setup

### Checklist

- [ ] Database migration executed (7 tables created)
- [ ] `.env` variables configured
- [ ] Scheduler initialized (cron / Lambda / Vercel)
- [ ] Middleware added to listing/upload routes
- [ ] M-Pesa production credentials ready
- [ ] Email service configured
- [ ] SMS service configured (optional)
- [ ] Admin dashboard updated to show metrics
- [ ] HTTPS enabled on all endpoints
- [ ] Rate limiting enabled on payment endpoints
- [ ] Error notifications configured
- [ ] Logs being tracked
- [ ] Backup strategy in place

### Test Renewal Flow (Sandbox)

```bash
# 1. Create test subscription with tomorrow's billing date
curl -X POST http://localhost:3000/api/payments/subscription/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "phone": "0712345678",
    "hub": "marketplace",
    "plan": "pro"
  }'

# Get subscription ID from response

# 2. Manually trigger renewal tomorrow
node -e "
  const { renewSubscriptions } = require('./dist/jobs/subscriptionRenewalScheduler');
  renewSubscriptions().then(r => {
    console.log('Results:', r);
    process.exit(0);
  });
"

# 3. Check Supabase:
# - subscriptions table: renewalStatus should be 'initiated'
# - admin_audit_log: should have 'renewal_initiated' action
# - M-Pesa should have received callback
```

---

## Monitor Production

### Daily Checks

Run this query in Supabase SQL Editor:

```sql
-- Dashboard metrics
SELECT 
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
  COUNT(CASE WHEN status = 'past_due' THEN 1 END) as overdue_subscriptions,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_today,
  SUM(CASE WHEN plan = 'starter' THEN 3500
           WHEN plan = 'pro' THEN 7000
           WHEN plan = 'enterprise' THEN 14000 END) as monthly_revenue
FROM subscriptions
WHERE createdAt >= NOW() - INTERVAL '1 day';
```

### Alert on Issues

Set up alerts for:
- Renewal failures > 10% daily
- M-Pesa callback timeout
- Database errors
- High payment decline rate

```typescript
// Example: backend/src/jobs/monitoringJob.ts
import nodemailer from 'nodemailer';

const checkRenewalHealth = async () => {
  // Get renewal stats from last 24 hours
  const { data } = await supabase
    .from('admin_audit_log')
    .select('*')
    .eq('action', 'renewal_initiated')
    .gte('createdAt', new Date(Date.now() - 24*60*60*1000).toISOString());

  const { count: failures } = await supabase
    .from('admin_audit_log')
    .select('*', { count: 'exact' })
    .eq('action', 'renewal_failed');

  const failureRate = failures / data.length;

  if (failureRate > 0.1) {
    // Send alert email
    await mailer.send({
      to: process.env.ADMIN_EMAIL,
      subject: '⚠️ High Renewal Failure Rate',
      body: `${(failureRate*100).toFixed(2)}% of renewals failed today`
    });
  }
};
```

---

## Revenue Tracking

### Query: Real-time MRR

```sql
-- Monthly Recurring Revenue
SELECT 
  DATE_TRUNC('month', NOW())::date as month,
  COUNT(*) as subscriber_count,
  SUM(
    CASE 
      WHEN plan = 'starter' THEN 3500
      WHEN plan = 'pro' THEN 7000
      WHEN plan = 'enterprise' THEN 14000
      ELSE 0
    END
  ) as mrr
FROM subscriptions
WHERE status = 'active'
  AND nextBillingDate > NOW();
```

### Query: Commission Revenue

```sql
-- Last 30 days commission
SELECT 
  SUM(commission) as total_commission,
  COUNT(*) as transactions,
  AVG(commission) as avg_commission,
  MAX(commission) as highest_commission
FROM commission_tracking
WHERE status = 'paid'
  AND paidAt >= NOW() - INTERVAL '30 days';
```

### Query: Churn Analysis

```sql
-- Cancellation rate
SELECT 
  DATE_TRUNC('week', cancelledAt)::date as week,
  COUNT(*) as cancellations,
  (
    SELECT COUNT(*) FROM subscriptions 
    WHERE status = 'active'
      AND nextBillingDate > NOW()
  ) as active_subs,
  ROUND(100.0 * COUNT(*) / (
    SELECT COUNT(*) FROM subscriptions 
    WHERE status = 'active'
      AND nextBillingDate > NOW()
  ), 2) as churn_rate_pct
FROM subscriptions
WHERE status = 'cancelled'
  AND cancelledAt >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('week', cancelledAt);
```

---

## Troubleshooting

### Issue: Scheduler not running

**Check:**
1. Is cron job in node_cron actually running? → Add `console.log()` to see
2. Lambda function has permissions? → Check IAM role
3. Vercel cron configured? → Check `vercel.json`
4. Server crashed? → Check error logs

**Solution:**
```bash
# Local: Check if process is running
ps aux | grep node

# Restart if needed
npm run dev

# For production logs
tail -f /var/log/application.log
```

### Issue: "Listing limit reached" but user has valid subscription

**Check:**
1. Subscription `status = 'active'`
2. `nextBillingDate` is in future
3. `feature_usage` table isn't corrupted

**Fix:**
```sql
-- Check user's actual subscription
SELECT * FROM subscriptions WHERE userId = 'xxx';

-- Reset feature usage if needed
DELETE FROM feature_usage WHERE userId = 'xxx';

-- Manually verify subscription
UPDATE subscriptions 
SET status = 'active' 
WHERE userId = 'xxx' AND status != 'cancelled';
```

### Issue: M-Pesa callback not triggering renewal

**Check:**
1. `MPESA_CALLBACK_URL` is correct and accessible
2. Callback endpoint exists: `/api/payments/mpesa/callback`
3. M-Pesa credentials valid
4. Network firewall isn't blocking callbacks

**Test callback manually:**
```bash
curl -X POST http://localhost:3000/api/payments/mpesa/callback \
  -H "Content-Type: application/json" \
  -d '{
    "Body": {
      "stkCallback": {
        "MerchantRequestID": "test",
        "CheckoutRequestID": "test",
        "ResultCode": 0,
        "ResultDesc": "The service request has been processed successfully.",
        "CallbackMetadata": {
          "Item": [
            {"Name": "Amount", "Value": 7000},
            {"Name": "MpesaReceiptNumber", "Value": "TEST123"},
            {"Name": "PhoneNumber", "Value": "254712345678"}
          ]
        }
      }
    }
  }'
```

---

## Launch Timeline

- **Day 1**: Database migration + environment setup (1 hour)
- **Day 2**: Backend integration + testing (2 hours)
- **Day 3**: Frontend integration (1 hour)
- **Day 4**: Scheduler setup + end-to-end testing (1 hour)
- **Day 5**: M-Pesa production credentials (30 min)
- **Day 6**: Final QA + launch prep (30 min)
- **Day 7**: 🚀 **LAUNCH** with Farmer hub FREE

**Total Time**: ~2-3 days to full production

---

## Post-Launch Tasks (Week 1)

- [ ] Monitor MRR growth (target: 3-5 subscriptions)
- [ ] Check renewal success rate (target: >90%)
- [ ] Verify M-Pesa callbacks arriving
- [ ] Monitor server performance
- [ ] Track user signups
- [ ] Respond to support emails
- [ ] Collect feedback from early users
- [ ] Plan Week 2 improvements

---

## Success Metrics (After 1 Month)

| Metric | Target | Formula |
|--------|--------|---------|
| **MRR** | 50,000 KES | Active subs × avg plan price |
| **Churn Rate** | <5% | Cancelled subs / total subs |
| **Conversion** | >10% | Paid subs / total signups |
| **Renewal Rate** | >90% | Successful renewals / due renewals |
| **Uptime** | >99.9% | (Total time - downtime) / total time |

---

## You're Ready! 🚀

Everything is built, tested, and documented. Follow this checklist and you'll be making money within a week.

**Key files to have ready:**
1. ✅ `SUBSCRIPTION_MIGRATION.sql` - Database
2. ✅ `subscriptionMiddleware.ts` - Route protection
3. ✅ `subscriptionRenewalScheduler.ts` - Automatic charging
4. ✅ `DEPLOYMENT_GUIDE.md` - Setup steps
5. ✅ `subscriptionService.ts` - Business logic
6. ✅ `SubscriptionComponents.tsx` - UI

**Quick start:**
```bash
# 1. Run migration in Supabase SQL Editor
# 2. npm install node-cron
# 3. Add middleware to routes
# 4. Configure .env
# 5. Start server
# 6. Test subscription flow
# 7. Go live!
```

**Support**: All code is documented with comments. Check SAAS_IMPLEMENTATION_GUIDE.md for detailed explanations.

Good luck! You're about to make serious money. 💰

---

*Last Updated: 2024*
*Pambo SaaS Platform*
