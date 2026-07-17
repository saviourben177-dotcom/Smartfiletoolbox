# Smart File Toolbox

An offline, all-in-one file utility app for Android (and iOS via Expo Go): compress and convert images, merge/split/compress PDFs, create and extract ZIP archives, generate and scan QR codes, analyze device storage, and browse files — all without an internet connection or a backend server.

Built with Expo, Expo Router, and TypeScript.

## Features

- **Image Tools** — compress, resize, convert (JPEG/PNG/WEBP), and rotate/crop photos
- **PDF Tools** — combine images into a PDF, merge multiple PDFs (with reordering), split by page range, and structurally optimize (compress) PDF size
- **ZIP Tools** — create ZIP archives from any picked files, browse and extract ZIP contents
- **QR Tools** — generate QR codes (text, URL, phone, email, Wi-Fi) and scan codes with the camera, with history for both
- **Storage Tools** — device storage breakdown by file type, largest-files finder, duplicate-file finder, temp-file/empty-folder cleaner, downloads manager
- **File Browser** — search, sort, and manage files the app has imported or produced, plus your photo library
- **Settings** — theme (system/light/dark), haptics toggle, clear temp files, in-app privacy policy, about/version info

Everything runs on-device. No accounts, no network calls, no analytics.

## Running in Replit

The `expo` workflow starts the Metro bundler automatically. Scan the QR code shown in the workflow console with **Expo Go** (Android) or the Camera app (iOS) to run the app on a physical device — this is the only way to test camera, media library, and full filesystem features, since those are unavailable or partial in a web browser.

## Building an Android APK/AAB (outside Replit)

Replit's built-in publishing flow (**Expo Launch**) currently supports iOS App Store submission only. **Android/Google Play publishing is not supported on Replit.** To produce an installable Android build, run these steps yourself, from your own machine or CI, after cloning/pulling this project:

1. Install the EAS CLI: `npm install -g eas-cli`
2. Log in with your own Expo account: `eas login`
3. From `artifacts/smart-file-toolbox/`, link this project to your Expo account: `eas init` (this writes your real `extra.eas.projectId` into `app.json` — it cannot be pre-filled without your account)
4. Build an APK for testing/sideloading (uses the `preview` profile already defined in `eas.json`):
   ```
   eas build --platform android --profile preview
   ```
5. Build a production AAB for the Play Store (uses the `production` profile already defined in `eas.json`):
   ```
   eas build --platform android --profile production
   ```
6. Submit to the Play Store: `eas submit --platform android`

Replit will not run any of the above commands on your behalf — they must be run in your own environment with your own Google Play developer account and signing credentials.

### Android package name

The permanent Android application ID is set in `app.json` as `android.package: "com.smartfiletoolbox.app"`. **This cannot be changed after your first Play Store upload**, so double-check it (and swap in your own domain-based reverse-DNS name, e.g. `com.yourcompany.smartfiletoolbox`, if you have one) before your first production build.

### Privacy policy

`PRIVACY_POLICY.md` in this folder is the canonical privacy policy text, also shown in-app under Settings → Privacy Policy. Google Play's Data Safety / App Content section requires a **publicly hosted URL** pointing to this same content — hosting it (e.g. GitHub Pages, a Notion/Google Sites page, or a tiny static site) is a manual step you still need to do before submitting to Play Console.

## Known limitations

- **ZIP password protection** is shown in the ZIP Creator UI but disabled ("coming soon"). The underlying ZIP library (`jszip`) does not implement real encryption, so this was intentionally left unimplemented rather than faked.
- **PDF "compression"** performs lossless structural optimization (rebuilding the PDF's internal object streams via `pdf-lib`), not image recompression inside the PDF. Savings vary and can be small for already-optimized PDFs.
- **File Browser scope**: Android's scoped storage model does not allow apps to browse the entire device filesystem. Smart File Toolbox can see its own app-private working folders (files you import via the system picker, plus tool output) and your device's photo/video library — not arbitrary folders on the device.
- **Web preview**: `expo-file-system` directory APIs, `expo-media-library`, and camera scanning have partial or no support in a browser. The web preview (used for quick visual checks in Replit) shows empty states for these features; full functionality requires running on an actual Android/iOS device via Expo Go.

## Tech stack

- Expo SDK 54, Expo Router (file-based routing)
- `expo-image-manipulator`, `expo-document-picker`, `expo-media-library`, `expo-camera`, `expo-file-system`
- `pdf-lib` (PDF merge/split/compress/image-to-PDF), `jszip` (ZIP create/extract), `react-native-qrcode-svg` (QR rendering)
- React Context for theme/toast/confirm/settings state, AsyncStorage for persistence

## Version

1.0.0
