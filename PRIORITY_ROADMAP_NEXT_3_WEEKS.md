# Priority Roadmap - Next 3 Weeks

**After Liquidity Engine Deployment**

This roadmap focuses on **production readiness**, **backend security**, and **conversion optimization**.

---

## ⏰ Week 1: Backend Security & Reliability

**Focus:** Lock down backend authentication, authorization, and payment integrity.

### 1. Backend Auth/Authorization Hardening
- [ ] **Supabase RLS policies audit**: Review all tables, ensure proper row-level security
  - Verify users can only access their own data
  - Ensure sellers can only edit their own listings
  - Check admin-only access controls
- [ ] **API route protection**: Add middleware to verify authenticated requests
- [ ] **Role-based access control (RBAC)**: Enforce buyer/seller/admin permissions
- [ ] **Session management**: Configure secure session timeouts and refresh tokens
- [ ] **CORS configuration**: Restrict API access to approved domains only

**Files to update:**
- `supabase/migrations/` - Add missing RLS policies
- Backend API routes (if using Express/Next.js API)
- Supabase Edge Functions (if applicable)

**Validation:**
- [ ] Test unauthorized access attempts (should fail)
- [ ] Test cross-user data access (should block)
- [ ] Test admin operations from non-admin accounts (should reject)

---

### 2. Payment Callback Verification
- [ ] **M-Pesa STK callback validation**:
  - Verify callback signatures/checksums
  - Reject tampered/spoofed callbacks
  - Log all callback attempts (success + suspicious)
- [ ] **Idempotency handling**: Prevent duplicate payment processing
- [ ] **Webhook secret rotation**: Implement secure webhook secret management
- [ ] **Payment status reconciliation**: Auto-reconcile with M-Pesa API daily
- [ ] **Failed payment retry logic**: Implement exponential backoff for retries

**Files to update:**
- `services/mpesaService.ts` - Add signature verification
- Backend payment webhooks
- Database: Add `payment_attempts` table for audit trail

**Validation:**
- [ ] Test with forged callback (should reject)
- [ ] Test duplicate callback (should de-duplicate)
- [ ] Test payment reconciliation (should match M-Pesa records)

---

### 3. Backend Build Isolation
- [ ] **Fix VITE_* vs NEXT_PUBLIC_* env vars**: Standardize on one framework
  - Decision: Are you using Vite (React) or Next.js?
  - Update all env vars to match framework convention
- [ ] **Separate frontend/backend builds**:
  - Frontend: `npm run build` (client-side bundle)
  - Backend: `npm run build:backend` (server functions)
- [ ] **Environment variable management**:
  - Create `.env.local` for development
  - Create `.env.production` for production (DO NOT COMMIT)
  - Use Vercel/Netlify env var UI for deployment secrets
- [ ] **TypeScript config separation** (if applicable):
  - `tsconfig.json` for frontend
  - `tsconfig.server.json` for backend

**Files to create/update:**
- `package.json` - Add `build:backend` script
- `.env.example` - Document all required env vars
- `vite.config.ts` or `next.config.js` - Configure build properly

**Validation:**
- [ ] `npm run build` succeeds with no frontend/backend conflicts
- [ ] Deployment to staging succeeds
- [ ] All env vars load correctly in production

---

## 🔧 Week 2: DevOps & Observability

**Focus:** Automate quality checks, monitor production health, and prevent abuse.

### 1. CI Pipeline (GitHub Actions)
- [ ] **Build pipeline**:
  - Run on every PR
  - Build frontend + backend
  - Fail if build errors
- [ ] **Test pipeline**:
  - Run unit tests (if any exist)
  - Run integration tests for critical flows (auth, payment)
- [ ] **Lint pipeline**:
  - ESLint for code quality
  - TypeScript type checking
  - Prettier for formatting (optional)

**Files to create:**
- `.github/workflows/ci.yml`

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test
```

**Validation:**
- [ ] Push a commit with a lint error (pipeline should fail)
- [ ] Fix and push (pipeline should pass)

---

### 2. Error Monitoring
- [ ] **Sentry integration** (or similar):
  - Track frontend errors (crashes, API failures)
  - Track backend errors (database errors, payment failures)
  - Set up Slack/email alerts for critical errors
- [ ] **Error categorization**:
  - User errors (404, validation) - low priority
  - System errors (500, DB timeouts) - high priority
  - Payment errors - URGENT
- [ ] **Source maps**: Upload to Sentry for readable stack traces

**Files to update:**
- `main.tsx` or `App.tsx` - Wrap app in Sentry ErrorBoundary
- `vite.config.ts` - Configure source map uploads

**Validation:**
- [ ] Trigger a test error (should appear in Sentry dashboard)
- [ ] Verify stack trace is readable (not minified)

---

### 3. Structured Logging
- [ ] **Replace `console.log` with structured logger**:
  - Use Winston, Pino, or Supabase Edge Function logs
  - Log format: JSON with `timestamp`, `level`, `userId`, `action`, `metadata`
- [ ] **Log levels**:
  - `DEBUG`: Development-only details
  - `INFO`: Normal operations (user logged in, listing created)
  - `WARN`: Recoverable issues (slow API response, cache miss)
  - `ERROR`: Failures requiring attention (payment failed, DB error)
- [ ] **Centralized logging**: Send to CloudWatch, Datadog, or Supabase Logs

**Example:**
```typescript
logger.info('User created listing', { userId, listingId, category });
logger.error('Payment failed', { userId, amount, error: err.message });
```

**Validation:**
- [ ] Create a listing (should see structured log)
- [ ] Query logs by userId or action

---

### 4. Rate Limiting
- [ ] **API rate limits**:
  - Supabase: Enable built-in rate limiting (or use Upstash Redis)
  - Custom APIs: Use `express-rate-limit` or Vercel Edge Config
- [ ] **Limits by endpoint**:
  - Auth endpoints: 5 requests/min (prevent brute force)
  - Listing creation: 10 listings/hour (prevent spam)
  - Payments: 3 attempts/hour (prevent abuse)
  - Search/browse: 100 requests/min (allow normal use)
- [ ] **User feedback**: Return 429 with "Too many requests, try again in X seconds"

**Files to update:**
- Backend API routes
- Supabase Edge Functions

**Validation:**
- [ ] Make 6 rapid login attempts (6th should fail with 429)
- [ ] Wait 1 minute, try again (should succeed)

---

## 🚀 Week 3: Performance & Conversion Optimization

**Focus:** Make app faster and increase buyer-to-seller contact rate.

### 1. Code Splitting
- [ ] **Lazy load heavy components**:
  ```typescript
  const AdminPanel = lazy(() => import('./components/AdminPanel'));
  const LiquidityDashboard = lazy(() => import('./components/LiquidityDashboard'));
  ```
- [ ] **Route-based splitting**: Split by page (home, listings, dashboard)
- [ ] **Vendor chunk optimization**: Separate React, Supabase, Google Maps into separate bundles
- [ ] **Preload critical routes**: Preload on hover/focus

**Files to update:**
- `App.tsx` - Wrap lazy components in `<Suspense>`
- `vite.config.ts` - Configure chunk splitting

**Validation:**
- [ ] Check bundle size (should be <200KB initial load)
- [ ] Lighthouse score improvement (target 90+)

---

### 2. Image Optimization
- [ ] **Serve WebP/AVIF formats**: Use `<picture>` with fallback
- [ ] **Lazy load images**: Use `loading="lazy"` or Intersection Observer
- [ ] **Responsive images**: Serve different sizes for mobile/desktop
- [ ] **CDN for product images**: Upload to Cloudinary/Imgix/Supabase Storage
- [ ] **Image compression pipeline**: Auto-compress uploads to 80% quality

**Files to update:**
- `ProductCard.tsx` - Replace `<img>` with optimized component
- Upload flow - Add compression before upload

**Validation:**
- [ ] Check image sizes (should be <100KB for thumbnails)
- [ ] Test on slow 3G (images should load fast)

---

### 3. Caching Strategy
- [ ] **Browser caching**:
  - Static assets: `Cache-Control: public, max-age=31536000, immutable`
  - API data: `Cache-Control: private, max-age=300` (5 min)
- [ ] **React Query/SWR**: Cache API responses client-side
- [ ] **Service Worker**: Cache critical pages for offline access (optional)
- [ ] **Supabase realtime subscriptions**: Reduce polling, use subscriptions

**Files to update:**
- `vite.config.ts` - Configure HTTP headers
- React Query setup for API calls

**Validation:**
- [ ] Revisit page (data should load from cache)
- [ ] Network tab shows 304 responses

---

### 4. Review Prominence (Conversion Boost)
- [ ] **Show reviews prominently**:
  - Display seller rating on every listing card (⭐ 4.8)
  - Show review count ("23 reviews")
  - Add "Top Rated" badge for 4.5+ stars
- [ ] **Review filtering**: Filter sellers by rating (4+ stars only)
- [ ] **Review modal**: Click to see full review details
- [ ] **Verified buyer badge**: Mark reviews from actual buyers

**Files to update:**
- `ProductCard.tsx` - Add rating display
- `ProductDetailsModal.tsx` - Show reviews section
- Search/filter UI

**Validation:**
- [ ] Check if top-rated sellers get more clicks
- [ ] A/B test if conversion rate improves

---

### 5. Better Quote Flows (Reduce Friction)
- [ ] **Pre-fill quote form**: Auto-populate from listing details
- [ ] **Quick inquiry templates**:
  - "When can you deliver?"
  - "Do you offer bulk discounts?"
  - "Is this still available?"
- [ ] **WhatsApp integration**: One-click to open WhatsApp with pre-filled message
- [ ] **Quote status tracking**: Show "Pending", "Responded", "Accepted"
- [ ] **Follow-up automation**: Send reminder if seller doesn't respond in 2 hours

**Files to update:**
- `ProductDetailsModal.tsx` - Add quick templates
- `services/liquidityEngine.ts` - Already tracks inquiries (expand this)

**Validation:**
- [ ] Check if inquiry-to-response time decreases
- [ ] Check if buyers send more inquiries

---

### 6. Service Filtering
- [ ] **Service type filters**:
  - Delivery available (Yes/No)
  - Location (County/Sub-county)
  - Price range slider
  - Availability (In stock/Made to order)
- [ ] **Multi-select filters**: Allow combining filters (price + delivery)
- [ ] **Filter persistence**: Save filters in URL query params
- [ ] **Filter counts**: Show "Dairy Cows (23)" to indicate availability

**Files to update:**
- Search/browse components
- URL state management

**Validation:**
- [ ] Filter by price range (should work)
- [ ] Combine filters (should narrow results)
- [ ] Share URL with filters (should maintain state)

---

## 📊 Success Metrics (Track Weekly)

### Week 1 (Security)
- [ ] Zero unauthorized data access incidents
- [ ] 100% payment callbacks verified
- [ ] Production build succeeds with no errors

### Week 2 (DevOps)
- [ ] CI pipeline passing on all commits
- [ ] Error rate <1% (monitored via Sentry)
- [ ] No rate limit abuse detected

### Week 3 (Performance)
- [ ] Initial load time <2 seconds (Lighthouse)
- [ ] Conversion rate improvement (baseline vs. new)
- [ ] Bounce rate decrease on listing pages

---

## 🛠️ Tools & Resources

**Week 1:**
- Supabase RLS Policies: https://supabase.com/docs/guides/auth/row-level-security
- M-Pesa Callback Verification: https://developer.safaricom.co.ke/APIs/MobileMoney

**Week 2:**
- Sentry Setup: https://docs.sentry.io/platforms/javascript/guides/react/
- GitHub Actions: https://docs.github.com/en/actions

**Week 3:**
- React Lazy Loading: https://react.dev/reference/react/lazy
- Vite Code Splitting: https://vitejs.dev/guide/build.html#chunking-strategy

---

## Next Steps After Week 3

Once these priorities are complete, revisit [BILLION_DOLLAR_APP_GUIDE.md](BILLION_DOLLAR_APP_GUIDE.md) and choose the next highest-impact feature:
- **Mobile app** (React Native for iOS/Android)
- **Advanced search** (Elasticsearch/Algolia)
- **Seller analytics dashboard**
- **Bulk upload tools** (CSV import)
- **Multi-language support** (Swahili/English toggle)

**Remember:** Build → Measure → Learn → Iterate 🚀
