# App Store Release Checklist

## Live Progress Tracker

Update the **Done** counts as you tick items below.

| Section | Done | Total | Progress |
|---|---:|---:|---:|
| 1.1 Generate Mobile Assets | 4 | 4 | 100% |
| 2 Before Submission | 1 | 6 | 17% |
| 3 Google Play Console | 0 | 8 | 0% |
| 4 App Store Connect | 0 | 7 | 0% |
| 5 Post-Launch | 0 | 4 | 0% |
| **Overall** | **5** | **29** | **17%** |

Quick links:
- Asset scaffold: `resources/README.md`
- Android signing: `app-store-listings/ANDROID_SIGNING_CHECKLIST.md`
- iOS signing: `app-store-listings/IOS_SIGNING_CHECKLIST.md`
- Listing copy + legal URLs: `app-store-listings/APP_STORE_LISTING.md`
- Production env checks: `app-store-listings/PRODUCTION_ENV_CHECKLIST.md`
- Smoke QA (web + mobile): `app-store-listings/WEB_MOBILE_SMOKE_QA.md`

## 1) Technical Prerequisite (Must Have)
You must have installable mobile binaries:
- Android: `.aab` for Play Store
- iOS: archive build for App Store Connect

Current repo status: web app only (no native wrapper present).

Update: Capacitor Android/iOS projects are now scaffolded.

## 1.1) Generate Mobile Assets
- [x] Put app icon source at `resources/icon.png` (1024x1024)
- [x] Put splash source at `resources/splash.png` (2732x2732 recommended)
- [x] Run `npm run cap:assets`
- [x] Run `npm run cap:prepare`

Tip: place files first, then run `npm run cap:prepare`.

## 2) Before Submission
- [x] App version and build numbers set
- [ ] Production API endpoints configured
- [ ] Crash reporting enabled
- [ ] Privacy policy URL public
- [ ] Terms URL public
- [ ] Contact/support working

### Section 2 Prefill (Concrete values)

| Item | Current | Target / Value to Use | Where to set or verify |
|---|---|---|---|
| App version and build numbers | `package.json` `1.0.0`, Android `versionName` `1.0.0`, iOS `MARKETING_VERSION` `1.0.0` | Keep release version and increment native build numbers per release | `package.json`, `android/app/build.gradle`, `ios/App/App.xcodeproj/project.pbxproj` |
| Production API endpoints configured | Dev defaults still present in env examples | Confirm no localhost URLs in release build; use production Supabase + production payment endpoints | `.env.local`, `services/supabase/.env.local`, production env in hosting |
| Crash reporting enabled | Sentry starter integrated (needs DSN) | Set `VITE_SENTRY_DSN` to activate error reporting in web + mobile webview | `.env.local`, `index.tsx` |
| Privacy policy URL public | URL already drafted | `https://pambo.biz/privacy` | `app-store-listings/APP_STORE_LISTING.md` |
| Terms URL public | Terms component exists | Use `https://pambo.biz/terms` (or your final public terms page URL) | publish page + add in store forms |
| Contact/support working | URL already drafted | `https://pambo.biz/contact` | `app-store-listings/APP_STORE_LISTING.md` |

### Section 2 Quick Verification

- Version/build: release version is not `0.0.0` and both Android+iOS build numbers increased.
- API endpoints: release app has no `localhost` references.
- Crash reporting: startup errors appear in your crash dashboard.
- Legal/support links: `privacy`, `terms`, and `contact` pages load publicly without login.

## 3) Google Play Console
- [ ] Create app in Play Console
- [ ] Complete store listing fields
- [ ] Upload graphics/screenshots
- [ ] Upload `.aab`
- [ ] Complete content rating questionnaire
- [ ] Declare data safety
- [ ] Set pricing/distribution countries
- [ ] Submit for review

Reference: `app-store-listings/ANDROID_SIGNING_CHECKLIST.md`

## 4) App Store Connect
- [ ] Create app record
- [ ] Fill metadata and keywords
- [ ] Upload screenshots by device size
- [ ] Upload build from Xcode/Transporter
- [ ] Complete App Privacy nutrition labels
- [ ] Set age rating
- [ ] Submit for review

Reference: `app-store-listings/IOS_SIGNING_CHECKLIST.md`

## 5) Post-Launch
- [ ] Monitor crashes and ANRs
- [ ] Monitor reviews/ratings
- [ ] Respond to support requests quickly
- [ ] Plan first update within 7-14 days

## Fast Next Step
1. Complete **Before Submission** items (Section 2)
2. Build and upload Android `.aab` (Section 3)
3. Upload iOS build in App Store Connect (Section 4)
