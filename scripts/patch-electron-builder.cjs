const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'node_modules', 'app-builder-lib', 'out', 'util', 'electronGet.js');

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  if (!content.includes('falling back to copyDir')) {
    const searchTarget = `await fs.rm(dir, { recursive: true, force: true });\n        await fs.rename(tmpDir, dir);`;
    const replacement = `await fs.rm(dir, { recursive: true, force: true });
        try {
            await fs.rename(tmpDir, dir);
        } catch (renameErr) {
            if (renameErr.code === 'EPERM' || renameErr.code === 'EBUSY' || renameErr.code === 'EACCES') {
                await new Promise(r => setTimeout(r, 1000));
                try {
                    await fs.rename(tmpDir, dir);
                } catch (retryErr) {
                    builder_util_1.log.warn({ extractDir: dir }, "fs.rename failed with EPERM, falling back to copyDir");
                    await (0, builder_util_1.copyDir)(tmpDir, dir);
                    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
                }
            } else {
                throw renameErr;
            }
        }`;

    if (content.includes(searchTarget)) {
      content = content.replace(searchTarget, replacement);
      fs.writeFileSync(targetFile, content, 'utf8');
      console.log('[Patch] Successfully patched electron-builder Windows EPERM handler in node_modules.');
    }
  } else {
    console.log('[Patch] electron-builder EPERM handler already patched.');
  }
}
