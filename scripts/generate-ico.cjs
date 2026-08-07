const fs = require('fs');
const path = require('path');

function createValidIco(pngPath, icoPath) {
  const pngBuffer = fs.readFileSync(pngPath);
  
  // Create 22-byte ICO header wrapping PNG buffer
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Image type (1 = ICO)
  header.writeUInt16LE(1, 4); // Number of images (1)
  
  header.writeUInt8(0, 6);   // Width (0 = 256px)
  header.writeUInt8(0, 7);   // Height (0 = 256px)
  header.writeUInt8(0, 8);   // Palette
  header.writeUInt8(0, 9);   // Reserved
  header.writeUInt16LE(1, 10);  // Color planes
  header.writeUInt16LE(32, 12); // Bits per pixel
  header.writeUInt32LE(pngBuffer.length, 14); // Image size in bytes
  header.writeUInt32LE(22, 18); // Offset to image data (22 bytes)
  
  const icoBuffer = Buffer.concat([header, pngBuffer]);
  fs.writeFileSync(icoPath, icoBuffer);
  console.log(`[Icon] Successfully generated valid Windows ICO file: ${icoPath} (${icoBuffer.length} bytes)`);
}

const inputPng = path.join(__dirname, '../public/favicon.png');
const outputIco = path.join(__dirname, '../public/icon.ico');

if (fs.existsSync(inputPng)) {
  createValidIco(inputPng, outputIco);
} else {
  console.error('[Icon] Could not find input PNG at:', inputPng);
}
