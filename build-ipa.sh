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

echo "3. Building Xcode Archive (Unsigned)..."
rm -rf build Payload TrollNotes.ipa
xcodebuild archive \
  -workspace ios/TrollNotes.xcworkspace \
  -scheme TrollNotes \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath build/TrollNotes.xcarchive \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGN_IDENTITY=""

echo "4. Packaging Payload into TrollNotes.ipa..."
mkdir -p Payload
cp -r build/TrollNotes.xcarchive/Products/Applications/TrollNotes.app Payload/
zip -r -9 TrollNotes.ipa Payload
rm -rf Payload

echo "=========================================="
echo "  ✅ TrollNotes.ipa successfully created! "
echo "=========================================="
echo "You can now install TrollNotes.ipa directly via TrollStore on iOS 15."
