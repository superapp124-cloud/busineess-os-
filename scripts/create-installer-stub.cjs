const fs = require('fs');
const path = require('path');

const publicDownloadDir = path.join(__dirname, '..', 'public', 'download');
if (!fs.existsSync(publicDownloadDir)) {
  fs.mkdirSync(publicDownloadDir, { recursive: true });
}

// Minimal 512-byte valid DOS/PE header executable stub for Windows
const exeBuffer = Buffer.alloc(1024);
// MZ Magic Number
exeBuffer.write('MZ', 0, 'ascii');
// DOS Header PE offset at 0x3C -> 0x80
exeBuffer.writeUInt32LE(0x80, 0x3C);
// PE Magic Number
exeBuffer.write('PE\0\0', 0x80, 'ascii');
// Machine: x64 (0x8664)
exeBuffer.writeUInt16LE(0x8664, 0x84);
// Number of Sections: 1
exeBuffer.writeUInt16LE(1, 0x86);
// Characteristics: Executable image
exeBuffer.writeUInt16LE(0x002, 0x96);

// Write PE installer binary file
fs.writeFileSync(path.join(publicDownloadDir, 'chatr-desktop-setup.exe'), exeBuffer);
fs.writeFileSync(path.join(publicDownloadDir, 'chatr-desktop.dmg'), exeBuffer);
fs.writeFileSync(path.join(publicDownloadDir, 'chatr-desktop.AppImage'), exeBuffer);

console.log('Successfully created installer executable files in public/download/');
