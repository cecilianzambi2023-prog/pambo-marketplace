# iOS Signing & App Store Connect Upload Checklist

## Prerequisites
- macOS machine with Xcode installed
- Apple Developer Program membership

## 1) Open iOS Project
```bash
npm run cap:open:ios
```

## 2) Configure Signing in Xcode
- Select `App` target
- Set Bundle Identifier: `biz.pambo.marketplace`
- Choose Team (Apple Developer account)
- Enable automatic signing

## 3) Archive Build
- Product -> Archive
- In Organizer, validate and distribute app
- Upload to App Store Connect

## 4) App Store Connect Setup
- [ ] Create app record with same bundle ID
- [ ] Fill metadata and keywords
- [ ] Upload screenshots by required device size
- [ ] Complete App Privacy details
- [ ] Add support URL + privacy URL
- [ ] Submit for review

## 5) Common Issues
- Bundle ID mismatch between Xcode and App Store Connect
- Missing privacy declarations
- Missing required screenshot sizes

## 6) Release Hygiene
- [ ] `npm run cap:prepare` before archiving
- [ ] Test app on real iPhone
- [ ] Confirm login, browse, seller contact, and payments flow
