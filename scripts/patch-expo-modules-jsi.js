const fs = require('fs');
const path = require('path');

// 1. Patch RuntimeScheduler.h (C++ interop ordering and constructor annotations for Swift 6.2+)
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
} else {
  console.log('[patch] RuntimeScheduler.h not found, skipping patch.');
}

// 2. Patch Package.swift (disable upcoming feature NonisolatedNonsendingByDefault in Swift 6 mode)
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
  let changed = false;

  if (
    content.includes('.enableUpcomingFeature("NonisolatedNonsendingByDefault"),') &&
    !content.includes('// .enableUpcomingFeature("NonisolatedNonsendingByDefault"),')
  ) {
    console.log('[patch] Disabling NonisolatedNonsendingByDefault in Package.swift...');
    content = content.replace(
      '.enableUpcomingFeature("NonisolatedNonsendingByDefault"),',
      '// .enableUpcomingFeature("NonisolatedNonsendingByDefault"),'
    );
    changed = true;
  }

  // Ensure Swift 6 mode is preserved
  if (content.includes('swiftLanguageModes: [.v5],')) {
    console.log('[patch] Ensuring swiftLanguageModes: [.v6]...');
    content = content.replace(
      'swiftLanguageModes: [.v5],',
      'swiftLanguageModes: [.v6],'
    );
    changed = true;
  }

  if (content.includes('"-strict-concurrency=minimal",\n          ')) {
    content = content.replace('"-strict-concurrency=minimal",\n          ', '');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(packageSwiftPath, content, 'utf8');
    console.log('[patch] Successfully patched Package.swift');
  } else {
    console.log('[patch] Package.swift is already up-to-date.');
  }
}

// 3. Patch JavaScriptRuntime.swift (passing non-Sendable raw pointers across actor boundary)
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

  // Block 1: SyncFunctionClosure (HostFunctionContext)
  const oldBlock1 = `    nonisolated(unsafe) let thisPtr = thisPtr
    nonisolated(unsafe) let argumentsPtr = argumentsPtr
    nonisolated(unsafe) let resultPtr = resultPtr

    // See \`withGuaranteedContext\` for why neither the context nor the runtime is retained here, and
    // why the result is written to the caller\'s slot instead of being returned.
    withGuaranteedContext(context) { (context: HostFunctionContext, runtime) in
      resultPtr.pointee = JavaScriptActor.assumeIsolated {
        return forwardingSwiftErrorsToJS(runtime: runtime) {
          let this = UnsafeMutablePointer(mutating: thisPtr).move()
          let arguments = JavaScriptValuesBuffer(runtime, start: argumentsPtr, count: argumentsCount)
          let thisValue = JavaScriptValue(runtime, this)
          return try context.call(thisValue, consume arguments).asJSIValue()
        }
      }
    }`;

  const newBlock1 = `    let thisPtrAddress = UInt(bitPattern: thisPtr)
    let argumentsPtrAddress = UInt(bitPattern: argumentsPtr)
    nonisolated(unsafe) let resultPtr = resultPtr

    // See \`withGuaranteedContext\` for why neither the context nor the runtime is retained here, and
    // why the result is written to the caller\'s slot instead of being returned.
    withGuaranteedContext(context) { (context: HostFunctionContext, runtime) in
      resultPtr.pointee = JavaScriptActor.assumeIsolated {
        return forwardingSwiftErrorsToJS(runtime: runtime) {
          let innerThisPtr = UnsafeMutablePointer<facebook.jsi.Value>(bitPattern: thisPtrAddress)!
          let innerArgumentsPtr = UnsafePointer<facebook.jsi.Value>(bitPattern: argumentsPtrAddress)
          let this = innerThisPtr.move()
          let arguments = JavaScriptValuesBuffer(runtime, start: innerArgumentsPtr, count: argumentsCount)
          let thisValue = JavaScriptValue(runtime, this)
          return try context.call(thisValue, consume arguments).asJSIValue()
        }
      }
    }`;

  // Block 2: UnownedThisSyncFunctionClosure (UnownedThisHostFunctionContext)
  const oldBlock2 = `    nonisolated(unsafe) let thisPtr = thisPtr
    nonisolated(unsafe) let argumentsPtr = argumentsPtr
    nonisolated(unsafe) let resultPtr = resultPtr

    // See \`withGuaranteedContext\` for why neither the context nor the runtime is retained here, and
    // why the result is written to the caller\'s slot instead of being returned.
    withGuaranteedContext(context) { (context: UnownedThisHostFunctionContext, runtime) in
      resultPtr.pointee = JavaScriptActor.assumeIsolated {
        return forwardingSwiftErrorsToJS(runtime: runtime) {
          let arguments = JavaScriptValuesBuffer(runtime, start: argumentsPtr, count: argumentsCount)
          let thisValue = JavaScriptUnownedValue(runtime.pointee, thisPtr)
          return try context.call(thisValue, consume arguments).asJSIValue()
        }
      }
    }`;

  const newBlock2 = `    let thisPtrAddress = UInt(bitPattern: thisPtr)
    let argumentsPtrAddress = UInt(bitPattern: argumentsPtr)
    nonisolated(unsafe) let resultPtr = resultPtr

    // See \`withGuaranteedContext\` for why neither the context nor the runtime is retained here, and
    // why the result is written to the caller\'s slot instead of being returned.
    withGuaranteedContext(context) { (context: UnownedThisHostFunctionContext, runtime) in
      resultPtr.pointee = JavaScriptActor.assumeIsolated {
        return forwardingSwiftErrorsToJS(runtime: runtime) {
          let innerThisPtr = UnsafePointer<facebook.jsi.Value>(bitPattern: thisPtrAddress)!
          let innerArgumentsPtr = UnsafePointer<facebook.jsi.Value>(bitPattern: argumentsPtrAddress)
          let arguments = JavaScriptValuesBuffer(runtime, start: innerArgumentsPtr, count: argumentsCount)
          let thisValue = JavaScriptUnownedValue(runtime.pointee, innerThisPtr)
          return try context.call(thisValue, consume arguments).asJSIValue()
        }
      }
    }`;

  let patched = false;
  if (content.includes(oldBlock1)) {
    console.log('[patch] Patching JavaScriptRuntime.swift Block 1 (HostFunctionContext)...');
    content = content.replace(oldBlock1, newBlock1);
    patched = true;
  }

  if (content.includes(oldBlock2)) {
    console.log('[patch] Patching JavaScriptRuntime.swift Block 2 (UnownedThisHostFunctionContext)...');
    content = content.replace(oldBlock2, newBlock2);
    patched = true;
  }

  if (patched) {
    fs.writeFileSync(jsRuntimePath, content, 'utf8');
    console.log('[patch] Successfully patched JavaScriptRuntime.swift');
  } else if (content.includes('let innerThisPtr = UnsafeMutablePointer<facebook.jsi.Value>(bitPattern: thisPtrAddress)!')) {
    console.log('[patch] JavaScriptRuntime.swift is already up-to-date.');
  } else {
    console.warn('[patch] Warning: Could not find target patterns in JavaScriptRuntime.swift');
  }
}
