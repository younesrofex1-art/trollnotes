const fs = require('fs');
const path = require('path');

// 1. Patch RuntimeScheduler.h (C++ interop ordering and constructor annotations)
const targetHeader = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-modules-jsi',
  'apple',
  'Sources',
  'ExpoModulesJSI-Cxx',
  'include',
  'RuntimeScheduler.h'
);

if (fs.existsSync(targetHeader)) {
  let content = fs.readFileSync(targetHeader, 'utf8');

  // Check if SWIFT_SHARED_REFERENCE is at the end of class definition
  if (content.includes('} SWIFT_SHARED_REFERENCE(retainRuntimeScheduler, releaseRuntimeScheduler);')) {
    console.log('[patch] Patching RuntimeScheduler.h for Swift C++ interop...');

    // 1. Add forward declarations before namespace expo definition
    const forwardDecls = `
namespace expo {
class RuntimeScheduler;
}

void retainRuntimeScheduler(expo::RuntimeScheduler *scheduler);
void releaseRuntimeScheduler(expo::RuntimeScheduler *scheduler);

namespace expo {`;

    content = content.replace('namespace expo {', forwardDecls);

    // 2. Add SWIFT_SHARED_REFERENCE attribute directly onto the class declaration
    content = content.replace(
      'class RuntimeScheduler {',
      'class SWIFT_SHARED_REFERENCE(retainRuntimeScheduler, releaseRuntimeScheduler) RuntimeScheduler {'
    );

    // 3. Remove SWIFT_SHARED_REFERENCE attribute from the closing brace
    content = content.replace(
      '} SWIFT_SHARED_REFERENCE(retainRuntimeScheduler, releaseRuntimeScheduler);',
      '};'
    );

    // 4. Remove invalid SWIFT_RETURNS_RETAINED from constructors (rejected in Swift 6.2+)
    content = content.replace(/SWIFT_RETURNS_RETAINED\s+RuntimeScheduler/g, 'RuntimeScheduler');

    fs.writeFileSync(targetHeader, content, 'utf8');
    console.log('[patch] Successfully patched RuntimeScheduler.h');
  } else if (content.includes('SWIFT_RETURNS_RETAINED RuntimeScheduler')) {
    console.log('[patch] Stripping SWIFT_RETURNS_RETAINED from RuntimeScheduler constructors...');
    content = content.replace(/SWIFT_RETURNS_RETAINED\s+RuntimeScheduler/g, 'RuntimeScheduler');
    fs.writeFileSync(targetHeader, content, 'utf8');
    console.log('[patch] Successfully updated RuntimeScheduler.h constructors');
  } else {
    console.log('[patch] RuntimeScheduler.h is already patched or up-to-date.');
  }
}

// 2. Patch JavaScriptRuntime.swift (sending thisPtr across boundary in Swift 6.3)
const jsRuntimePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-modules-jsi',
  'apple',
  'Sources',
  'ExpoModulesJSI',
  'Runtime',
  'JavaScriptRuntime.swift'
);

if (fs.existsSync(jsRuntimePath)) {
  let content = fs.readFileSync(jsRuntimePath, 'utf8');
  if (content.includes('let this = UnsafeMutablePointer(mutating: thisPtr).move()')) {
    console.log('[patch] Patching JavaScriptRuntime.swift thisPtr capture...');
    content = content.replace(
      'nonisolated(unsafe) let thisPtr = thisPtr',
      'let thisPtrAddress = UInt(bitPattern: thisPtr)'
    );
    content = content.replace(
      'let this = UnsafeMutablePointer(mutating: thisPtr).move()',
      'let this = UnsafeMutablePointer<facebook.jsi.Value>(bitPattern: thisPtrAddress)!.move()'
    );
    fs.writeFileSync(jsRuntimePath, content, 'utf8');
    console.log('[patch] Successfully patched JavaScriptRuntime.swift');
  } else {
    console.log('[patch] JavaScriptRuntime.swift is already patched or up-to-date.');
  }
}

// 3. Patch Package.swift (disable upcoming feature NonisolatedNonsendingByDefault)
const packageSwiftPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-modules-jsi',
  'apple',
  'Package.swift'
);

if (fs.existsSync(packageSwiftPath)) {
  let content = fs.readFileSync(packageSwiftPath, 'utf8');
  if (content.includes('.enableUpcomingFeature("NonisolatedNonsendingByDefault"),')) {
    console.log('[patch] Disabling NonisolatedNonsendingByDefault in Package.swift...');
    content = content.replace(
      '.enableUpcomingFeature("NonisolatedNonsendingByDefault"),',
      '// .enableUpcomingFeature("NonisolatedNonsendingByDefault"),'
    );
    fs.writeFileSync(packageSwiftPath, content, 'utf8');
    console.log('[patch] Successfully patched Package.swift');
  } else {
    console.log('[patch] Package.swift is already patched or up-to-date.');
  }
}
