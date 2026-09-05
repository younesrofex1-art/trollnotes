const fs = require('fs');
const path = require('path');

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

    fs.writeFileSync(targetHeader, content, 'utf8');
    console.log('[patch] Successfully patched RuntimeScheduler.h');
  } else {
    console.log('[patch] RuntimeScheduler.h is already patched or up-to-date.');
  }
} else {
  console.log('[patch] expo-modules-jsi not found, skipping patch.');
}
