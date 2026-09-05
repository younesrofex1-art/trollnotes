#!/usr/bin/env bash
set -e

echo "=========================================="
echo "  Building TrollNotes IPA for TrollStore  "
echo "=========================================="

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
  echo "❌ Error: Native iOS compilation requires macOS with Xcode installed."
  echo "💡 Since you are on Linux, use the included GitHub Actions workflow (.github/workflows/build-ipa.yml)"
  echo "   or Expo EAS Cloud Build to compile your .ipa for free!"
  exit 1
fi

echo "1. Installing Node dependencies..."
npm install

echo "2. Installing CocoaPods..."
cd ios
pod install
cd ..

echo "3. Building iOS App (Unsigned)..."
rm -rf build Payload TrollNotes.ipa
xcodebuild build \
  -workspace ios/TrollNotes.xcworkspace \
  -scheme TrollNotes \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -derivedDataPath build \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGN_ENTITLEMENTS=""

echo "4. Packaging Payload into TrollNotes.ipa..."
mkdir -p Payload
APP_PATH=$(find build -name "TrollNotes.app" -type d | head -n 1)
if [ -z "$APP_PATH" ]; then
  echo "❌ Error: TrollNotes.app not found in build directory"
  exit 1
fi
echo "Found app bundle at: $APP_PATH"
cp -r "$APP_PATH" Payload/
zip -r -9 TrollNotes.ipa Payload
rm -rf Payload

echo "=========================================="
echo "  ✅ TrollNotes.ipa successfully created! "
echo "=========================================="
echo "You can now install TrollNotes.ipa directly via TrollStore on iOS 15."
