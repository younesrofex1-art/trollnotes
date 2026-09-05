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

    const forwardDecls = `
namespace expo {
class RuntimeScheduler;
}

void retainRuntimeScheduler(expo::RuntimeScheduler *scheduler);
void releaseRuntimeScheduler(expo::RuntimeScheduler *scheduler);

namespace expo {`;

    content = content.replace('namespace expo {', forwardDecls);

    content = content.replace(
      'class RuntimeScheduler {',
      'class SWIFT_SHARED_REFERENCE(retainRuntimeScheduler, releaseRuntimeScheduler) RuntimeScheduler {'
    );

    content = content.replace(
      '} SWIFT_SHARED_REFERENCE(retainRuntimeScheduler, releaseRuntimeScheduler);',
      '};'
    );

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

// 2. Patch Package.swift (Swift 5 mode + minimal concurrency + disable upcoming features)
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
  console.log('[patch] Patching Package.swift concurrency settings...');

  content = content.replace(
    '.enableUpcomingFeature("NonisolatedNonsendingByDefault"),',
    '// .enableUpcomingFeature("NonisolatedNonsendingByDefault"),'
  );
  content = content.replace(
    '.enableUpcomingFeature("InferIsolatedConformances"),',
    '// .enableUpcomingFeature("InferIsolatedConformances"),'
  );
  content = content.replace(
    'swiftLanguageModes: [.v6],',
    'swiftLanguageModes: [.v5],'
  );
  if (!content.includes('"-strict-concurrency=minimal"')) {
    content = content.replace(
      '"-enable-library-evolution",',
      '"-enable-library-evolution",\n          "-strict-concurrency=minimal",'
    );
  }

  fs.writeFileSync(packageSwiftPath, content, 'utf8');
  console.log('[patch] Successfully patched Package.swift');
}

// 3. Patch JavaScriptRuntime.swift (passing pointers safely across actor boundaries)
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
  console.log('[patch] Patching JavaScriptRuntime.swift pointer captures...');

  // Pattern 1: line 760-778
  const oldBlock1 = `    withGuaranteedContext(context) { (context: HostFunctionContext, runtime) in
      resultPtr.pointee = JavaScriptActor.assumeIsolated {
        return forwardingSwiftErrorsToJS(runtime: runtime) {
          let this = UnsafeMutablePointer<facebook.jsi.Value>(bitPattern: thisPtrAddress)!.move()
          let arguments = JavaScriptValuesBuffer(runtime, start: argumentsPtr, count: argumentsCount)
          let thisValue = JavaScriptValue(runtime, this)
          return try context.call(thisValue, consume arguments).asJSIValue()
        }
      }
    }`;

  const newBlock1 = `    let argumentsPtrAddress = UInt(bitPattern: argumentsPtr)
    let resultPtrAddress = UInt(bitPattern: resultPtr)
    withGuaranteedContext(context) { (context: HostFunctionContext, runtime) in
      let innerResultPtr = UnsafeMutablePointer<facebook.jsi.Value>(bitPattern: resultPtrAddress)!
      innerResultPtr.pointee = JavaScriptActor.assumeIsolated {
        return forwardingSwiftErrorsToJS(runtime: runtime) {
          let innerThisPtr = UnsafeMutablePointer<facebook.jsi.Value>(bitPattern: thisPtrAddress)!
          let innerArgumentsPtr = UnsafePointer<facebook.jsi.Value>(bitPattern: argumentsPtrAddress)!
          let this = innerThisPtr.move()
          let arguments = JavaScriptValuesBuffer(runtime, start: innerArgumentsPtr, count: argumentsCount)
          let thisValue = JavaScriptValue(runtime, this)
          return try context.call(thisValue, consume arguments).asJSIValue()
        }
      }
    }`;

  if (content.includes(oldBlock1)) {
    content = content.replace(oldBlock1, newBlock1);
  }

  // Pattern 2: line 805-825
  const oldBlock2 = `    nonisolated(unsafe) let thisPtr = thisPtr
    nonisolated(unsafe) let argumentsPtr = argumentsPtr
    nonisolated(unsafe) let resultPtr = resultPtr

    // See \`withGuaranteedContext\` for why neither the context nor the runtime is retained here, and
    // why the result is written to the caller's slot instead of being returned.
    withGuaranteedContext(context) { (context: HostFunctionContext, runtime) in
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
    let resultPtrAddress = UInt(bitPattern: resultPtr)

    withGuaranteedContext(context) { (context: HostFunctionContext, runtime) in
      let innerResultPtr = UnsafeMutablePointer<facebook.jsi.Value>(bitPattern: resultPtrAddress)!
      innerResultPtr.pointee = JavaScriptActor.assumeIsolated {
        return forwardingSwiftErrorsToJS(runtime: runtime) {
          let innerThisPtr = UnsafePointer<facebook.jsi.Value>(bitPattern: thisPtrAddress)!
          let innerArgumentsPtr = UnsafePointer<facebook.jsi.Value>(bitPattern: argumentsPtrAddress)!
          let arguments = JavaScriptValuesBuffer(runtime, start: innerArgumentsPtr, count: argumentsCount)
          let thisValue = JavaScriptUnownedValue(runtime.pointee, innerThisPtr)
          return try context.call(thisValue, consume arguments).asJSIValue()
        }
      }
    }`;

  if (content.includes(oldBlock2)) {
    content = content.replace(oldBlock2, newBlock2);
  }

  // Pattern 3: line 185-195
  const oldBlock3 = `      nonisolated(unsafe) let resultPtr = resultPtr
      withGuaranteedContext(context) { (context: HostFunctionContext, runtime) in
        resultPtr.pointee = JavaScriptActor.assumeIsolated {`;
  const newBlock3 = `      let resultPtrAddress = UInt(bitPattern: resultPtr)
      withGuaranteedContext(context) { (context: HostFunctionContext, runtime) in
        let innerResultPtr = UnsafeMutablePointer<facebook.jsi.Value>(bitPattern: resultPtrAddress)!
        innerResultPtr.pointee = JavaScriptActor.assumeIsolated {`;
  if (content.includes(oldBlock3)) {
    content = content.replace(oldBlock3, newBlock3);
  }

  fs.writeFileSync(jsRuntimePath, content, 'utf8');
  console.log('[patch] Successfully patched JavaScriptRuntime.swift');
}
