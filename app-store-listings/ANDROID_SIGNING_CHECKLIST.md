# Android Signing & Play Store Upload Checklist

## 1) Generate Upload Keystore (one-time)
Run in terminal:

```bash
keytool -genkeypair -v -keystore pambo-upload-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias pambo-upload
```

Store this file safely (never lose it).

## 2) Configure Gradle Signing
In `android/`, create `keystore.properties`:

```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=pambo-upload
storeFile=../pambo-upload-key.jks
```

Update `android/app/build.gradle` to read signing config from `keystore.properties`.

## 3) Build Signed AAB
From `android/` folder:

```bash
./gradlew bundleRelease
```

Output:
- `android/app/build/outputs/bundle/release/app-release.aab`

## 4) Upload to Play Console
- [ ] Create app in Play Console
- [ ] Complete app content + Data Safety
- [ ] Upload `app-release.aab`
- [ ] Add listing assets/screenshots
- [ ] Add privacy policy URL
- [ ] Submit production release

## 5) Common Issues
- Wrong package ID: must match `biz.pambo.marketplace`
- Keystore path wrong in `keystore.properties`
- Version code not incremented before new upload

## 6) Release Hygiene
- [ ] `npm run cap:prepare` before every release build
- [ ] Verify API URLs are production-safe
- [ ] Smoke test auth, listing, payment, contact flows
