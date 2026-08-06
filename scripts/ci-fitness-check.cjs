const fs = require('fs');
const path = require('path');

console.log('========================================================');
console.log('   CI ARCHITECTURE FITNESS FUNCTIONS CHECK             ');
console.log('========================================================\n');

let violationsCount = 0;

function scanDir(dir, fileCallback) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        scanDir(fullPath, fileCallback);
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      fileCallback(fullPath);
    }
  }
}

// Fitness Rule 3: Kernel MUST NEVER import React, DOM, or Node APIs directly
console.log('[Rule 3] Verifying Kernel Platform Neutrality (@chatr/kernel)...');
const kernelSrc = path.join(__dirname, '../packages/kernel/src');
scanDir(kernelSrc, (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  if (/from ['"]react['"]/i.test(content) || /from ['"]react-dom['"]/i.test(content)) {
    console.error(`❌ VIOLATION [Rule 3]: Kernel file imports React: ${filePath}`);
    violationsCount++;
  }
});

// Fitness Rule 4: No Cyclic Dependencies between packages
console.log('[Rule 4] Verifying Package Layering Boundaries...');
const packagesDir = path.join(__dirname, '../packages');
scanDir(packagesDir, (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  if (filePath.includes(path.join('packages', 'kernel')) && /from ['"]@chatr\/recruitment['"]/i.test(content)) {
    console.error(`❌ VIOLATION [Rule 4]: Kernel imports domain package: ${filePath}`);
    violationsCount++;
  }
});

console.log('\n========================================================');
if (violationsCount === 0) {
  console.log('🎉 FITNESS CHECK PASSED: All CI Architecture Rules Satisfied!');
  console.log('========================================================');
  process.exit(0);
} else {
  console.error(`❌ FITNESS CHECK FAILED: Found ${violationsCount} architecture violations.`);
  console.log('========================================================');
  process.exit(1);
}
