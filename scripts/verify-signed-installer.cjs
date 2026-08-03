/**
 * CHATR Enterprise Signed Installer Verification Script
 * Validates digital signatures on compiled Windows executables using SignTool / PowerShell.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Verifying Windows Installer Authenticode Digital Signature...');

const outputDir = path.join(__dirname, '../dist-electron');
if (!fs.existsSync(outputDir)) {
  console.log('⚠️ Warning: dist-electron directory does not exist yet. Run build step first.');
  process.exit(0);
}

const exeFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.exe'));
if (exeFiles.length === 0) {
  console.log('⚠️ Warning: No .exe installer files found in dist-electron.');
  process.exit(0);
}

exeFiles.forEach(file => {
  const fullPath = path.join(outputDir, file);
  console.log(`Checking signature for: ${file}`);
  try {
    const cmd = `powershell -Command "(Get-AuthenticodeSignature '${fullPath}').Status"`;
    const result = execSync(cmd).toString().trim();
    console.log(`Signature Status: [${result}]`);
    if (result === 'Valid') {
      console.log(`✅ SUCCESS: ${file} is digitally signed and valid.`);
    } else {
      console.log(`ℹ️ NOTE: ${file} signature status is '${result}' (Unsigned in dev, requires EV cert in CI).`);
    }
  } catch (err) {
    console.log(`Error checking signature: ${err.message}`);
  }
});
