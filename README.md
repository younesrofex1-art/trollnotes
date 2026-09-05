# 📝 TrollNotes – iOS 15 Sample App for TrollStore

A sleek, native iOS 15 Notes application built with **React Native** and **Expo**, specifically tailored for packaging into an `.ipa` and installing permanently via **TrollStore**.

---

## ✨ Features

- **iOS 15 Native Cupertino Feel**: Rounded frosted cards, large title navigation, smooth transitions, and tactile haptic feedback (`expo-haptics`).
- **Full Note Management**: Create, edit, search, pin, tag, and delete notes.
- **Offline Storage**: Persistent local storage using `@react-native-async-storage/async-storage`.
- **Preloaded TrollStore Notes**: Comes pre-loaded with TrollStore cheatsheets and iOS 15 tips.
- **Tagging & Filtering**: Categorize notes under `TrollStore`, `Jailbreak`, `Personal`, `Work`, `Ideas`, and `General`.
- **Dynamic Dark / Light Themes**: Automatically respects iOS system appearance with manual toggle support.
- **TrollStore Diagnostic Sheet**: Tap the **iOS 15** badge in the header to view app bundle information, export your notes as JSON, or reset sample data.

---

## 🎯 Target Specifications

| Parameter | Value |
| :--- | :--- |
| **App Name** | TrollNotes |
| **Bundle ID** | `com.trollstore.trollnotes` |
| **Target OS** | **iOS 16.4+** (`IPHONEOS_DEPLOYMENT_TARGET = 16.4`) |
| **Framework** | Expo SDK 57 / React Native 0.86 (Hermes Engine) |
| **Installation** | TrollStore 2.x (CoreTrust permanent install on iOS 16.4 - 16.6.1 / 17.0) |

---

## 📦 How to Build the `.ipa` for TrollStore

Because iOS native Mach-O binaries must be compiled with the Apple SDK/Xcode, you can generate your `.ipa` using any of the methods below:

### Method 1: Free GitHub Actions (Recommended – No Mac or Apple Account Needed!)

A fully configured CI/CD workflow is included in [`.github/workflows/build-ipa.yml`](.github/workflows/build-ipa.yml). It uses GitHub's free macOS runners to compile and package an unsigned `.ipa` that TrollStore installs directly:

1. Create a repository on GitHub and push this project:
   ```bash
   git add .
   git commit -m "feat: setup TrollNotes for iOS 15"
   git branch -M main
   git remote add origin https://github.com/<your-username>/trollnotes.git
   git push -u origin main
   ```
2. Go to your GitHub repository in your browser.
3. Click on the **Actions** tab.
4. Select **"Build TrollNotes IPA for TrollStore"** from the left sidebar and click **"Run workflow"**.
5. Once the run completes (~3–5 minutes), click on the run and download **`TrollNotes-TrollStore-IPA`** from the **Artifacts** section.
6. Extract the zip to get `TrollNotes.ipa`.

---

### Method 2: Local Build on macOS

If you or a friend have a Mac with Xcode and CocoaPods:

1. Open a terminal in the project directory.
2. Run the included build script:
   ```bash
   ./build-ipa.sh
   ```
3. The script will automatically:
   - Install dependencies (`npm install` & `pod install`).
   - Run `xcodebuild archive` without code signing (`CODE_SIGNING_ALLOWED=NO`).
   - Package the resulting `.app` into a clean `TrollNotes.ipa`.

---

### Method 3: Expo EAS Cloud Build

You can also use Expo Application Services:

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Run:
   ```bash
   eas build --platform ios --profile trollstore
   ```

---

## 📲 How to Install via TrollStore on iOS 15

1. **Transfer the IPA to your iPhone**:
   - **Local Web Server**: On your Linux machine, run:
     ```bash
     python3 -m http.server 8080
     ```
     On your iPhone (connected to the same Wi-Fi), open Safari and go to `http://<your-pc-ip>:8080/TrollNotes.ipa` and download it.
   - **Cloud / AirDrop**: You can also upload `TrollNotes.ipa` to iCloud Drive, Google Drive, or AirDrop from a Mac.
2. **Install in TrollStore**:
   - In the iOS Files app or Safari Downloads, tap `TrollNotes.ipa` -> **Share** -> **TrollStore**.
   - Alternatively, open the **TrollStore** app, tap the **`+`** icon in the top right corner, and select `TrollNotes.ipa`.
3. Tap **Install**. TrollStore will fakesign the app using CoreTrust and install it to `/Applications/`.
4. Launch **TrollNotes** from your Home Screen! It will stay permanently installed without 7-day revokes.

---

## 🛠️ Project Structure

```
trollnotes/
├── .github/workflows/
│   └── build-ipa.yml            # Automated GitHub Actions workflow to build .ipa
├── assets/                      # Icons and splash screen
├── ios/
│   ├── TrollNotes.xcodeproj     # Xcode project (Deployment Target: iOS 16.4)
│   ├── Podfile                  # CocoaPods specification for iOS 15
│   └── TrollNotes/
│       ├── Info.plist           # iOS bundle metadata & permissions
│       └── TrollNotes.entitlements # Entitlements (get-task-allow for JIT)
├── src/
│   ├── components/
│   │   ├── Header.tsx           # Large title, search bar, tag filters, dark mode toggle
│   │   ├── NoteCard.tsx         # Note item with pin indicator, tags, delete confirmation
│   │   ├── NoteEditorModal.tsx  # Full-featured editor with formatting snippets
│   │   └── TrollStoreModal.tsx  # System diagnostics & TrollStore tips sheet
│   ├── storage.ts               # AsyncStorage local persistence & sample notes
│   ├── types.ts                 # TypeScript models & iOS tag color mappings
│   └── utils.ts                 # Haptics feedback and relative date formatting
├── App.tsx                      # Main application container
├── app.json                     # Expo configuration (bundle ID: com.trollstore.trollnotes)
├── eas.json                     # EAS Build configuration
├── build-ipa.sh                 # macOS one-click build script
└── package.json                 # Project dependencies
```
