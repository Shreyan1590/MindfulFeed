# MindfulFeed APK Build Instructions

Follow these steps to generate a production-ready Android APK for MindfulFeed.

## 1. Environment Setup

Ensure you have the following installed:

- **Node.js**: v18+
- **Android Studio**: Latest version with SDK
- **Capacitor CLI**: `npm install -g @capacitor/cli`

## 2. Web Build

First, compile the React frontend into the `dist` folder:

```powershell
npm run build
```

## 3. Sync with Capacitor

Update the Android project with the latest assets:

```powershell
npx cap copy android
npx cap sync android
```

## 4. Android Studio Build

1. Open the Android project in Android Studio:
   ```powershell
   npx cap open android
   ```
2. Wait for Gradle sync to complete.
3. In the top menu, go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
4. Once finished, a notification will appear. Click **Locate** to find your `app-debug.apk`.

## 5. Production Release (Signed APK)

To create a signed release APK:

1. Go to **Build** > **Generate Signed Bundle / APK...**.
2. Select **APK** and click **Next**.
3. Create or select your Key Store.
4. Select **release** build variant.
5. Click **Finish**. Your production APK will be in `android/app/release/`.

---

**App Branding**: MindfulFeed
**Logo Tag**: @beautifulMentionfor app
**Developer**: Dhilip K
