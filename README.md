<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1BiP0yF_ZE6xgX5ujlEpVshfA3PCSS-_a

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Mobile (Capacitor)

Running `npm run cap:assets` and `npm run cap:prepare` generates or updates iOS scaffolding and assets (for example `ios/App/App/Base.lproj/*.storyboard`, `ios/App/CapApp-SPM/*`, and `resources/icon.png`). These files are expected and should be committed for iOS builds.
