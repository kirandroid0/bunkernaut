# Bunkernaut

Pixel-styled college attendance tracker — L/T/P components, bunk counts, and frog mascots.

## Web (PWA)

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # dist/ with service worker (PWA)
npm test
```

## Android app (Capacitor)

Bunkernaut ships as a native Android shell around the Vite build. The PWA service worker is **disabled** for Android builds to avoid stale cached UI in WebView.

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Android Studio](https://developer.android.com/studio) with SDK **API 34+**
- JDK 17 (bundled with Android Studio)

### Build and run on device

```bash
npm install
npm run build:android    # tsc + vite (capacitor mode) + cap sync
npm run android:open     # opens Android Studio
```

In Android Studio: select your phone or emulator → **Run** (green play).

USB debugging: enable **Developer options → USB debugging** on your Pixel.

### Regenerate launcher icons

Place a square PNG at [`assets/icon.png`](assets/icon.png) (1024×1024 recommended), then:

```bash
npm run android:icons
npm run build:android
```

### Release AAB for Google Play

1. **Create a upload keystore** (once, store safely — never commit):

   ```bash
   keytool -genkeypair -alias bunkernaut -keyalg RSA -keysize 2048 -validity 10000 -keystore bunkernaut-upload.keystore
   ```

2. Copy [`android/keystore.properties.example`](android/keystore.properties.example) to `android/keystore.properties` and fill in passwords. Point `storeFile` at your keystore path.

3. Build the bundle:

   ```bash
   npm run build:android
   cd android
   ./gradlew bundleRelease
   ```

   Output: `android/app/build/outputs/bundle/release/app-release.aab`

4. Upload the `.aab` in [Google Play Console](https://play.google.com/console).

### Google Play Console checklist

You need a **Google Play Developer account** ($25 one-time) before publishing.

| Step | Notes |
|------|--------|
| Create app | Name: **Bunkernaut**, type: App |
| Store listing | Short + full description, 512×512 icon, feature graphic 1024×500, ≥2 phone screenshots |
| Privacy policy | Required URL — state that data stays on-device, no account, optional notifications |
| Content rating | Complete questionnaire (no ads/UGC) |
| Data safety | Local storage only; no data shared with third parties |
| Upload AAB | Start with **Internal testing**, then Production |

### App ID

`com.bunkernaut.attendance`

## Project layout

| Path | Purpose |
|------|---------|
| `src/` | React app |
| `capacitor.config.ts` | Capacitor app id + web dir |
| `assets/` | Source icon/splash for `@capacitor/assets` |
| `android/` | Native Android project (commit source, not build outputs) |
