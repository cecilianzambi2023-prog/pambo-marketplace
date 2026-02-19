# Production Environment Checklist (Web + Mobile)

Use this to complete Section 2 in `app-store-listings/RELEASE_CHECKLIST.md`.

## A) Required Production Values

- [ ] `VITE_SUPABASE_URL` points to production project
- [ ] `VITE_SUPABASE_ANON_KEY` is production anon key
- [ ] `VITE_API_URL` is production API URL (or app uses same-origin `/api` proxy)
- [ ] `VITE_MPESA_API_BASE_URL` set to intended environment (`sandbox` for final tests, `production` for live)
- [ ] `VITE_SENTRY_DSN` is set (to enable crash reporting)
- [ ] `FRONTEND_URL` is set to production frontend domain
- [ ] `CORS_ALLOWED_ORIGINS` includes only allowed production domains
- [ ] `MPESA_CALLBACK_URL` is set (required by backend payment route)

## B) Local Verification (Before Build)

- [ ] `package.json` version is `1.0.0` (or current release)
- [ ] Android `versionName` and iOS `MARKETING_VERSION` match release version
- [ ] Search code/env for `localhost` and remove release-time references
- [ ] `npm run build` completes successfully
- [ ] `npm run cap:prepare` completes successfully

## C) Crash Reporting Verification

- [ ] Build and run app with `VITE_SENTRY_DSN` configured
- [ ] Trigger a test frontend error in development/staging
- [ ] Confirm event appears in Sentry project
- [ ] Confirm environment tag is correct (`development`/`production`)

## D) Legal & Support URLs (Store Required)

- [ ] Privacy URL live: `https://pambo.biz/privacy`
- [ ] Terms URL live: `https://pambo.biz/terms`
- [ ] Support URL live: `https://pambo.biz/contact`
- [ ] All three pages open without login and render correctly on mobile

## E) Section 2 Completion Mapping

Mark these as done in `RELEASE_CHECKLIST.md` when verified:

1. App version and build numbers set
2. Production API endpoints configured
3. Crash reporting enabled
4. Privacy policy URL public
5. Terms URL public
6. Contact/support working

## Quick Commands

```bash
npm run build
npm run cap:prepare
```
