const fs = require('fs');
const path = require('path');

/**
 * Creates a valid Windows ICO file wrapping a PNG image.
 * Uses the official ICO format (6-byte file header + 16-byte ICONDIRENTRY per image).
 * Windows supports PNG-inside-ICO since Vista, so no BMP conversion needed.
 */
function createValidIco(pngPath, icoPath) {
  const pngBuffer = fs.readFileSync(pngPath);

  // ICO File Header: 6 bytes
  //   idReserved  (2 bytes) = 0
  //   idType      (2 bytes) = 1 (ICO)
  //   idCount     (2 bytes) = 1 (number of images)
  const fileHeader = Buffer.alloc(6);
  fileHeader.writeUInt16LE(0, 0); // Reserved
  fileHeader.writeUInt16LE(1, 2); // Type = ICO
  fileHeader.writeUInt16LE(1, 4); // Count = 1

  // ICONDIRENTRY: 16 bytes
  //   bWidth        (1 byte)  = 0 means 256
  //   bHeight       (1 byte)  = 0 means 256
  //   bColorCount   (1 byte)  = 0 (no palette)
  //   bReserved     (1 byte)  = 0
  //   wPlanes       (2 bytes) = 1
  //   wBitCount     (2 bytes) = 32
  //   dwBytesInRes  (4 bytes) = size of PNG data
  //   dwImageOffset (4 bytes) = offset from file start = 6 (header) + 16 (entry) = 22
  const entry = Buffer.alloc(16);
  entry.writeUInt8(0,  0);  // Width  (0 = 256)
  entry.writeUInt8(0,  1);  // Height (0 = 256)
  entry.writeUInt8(0,  2);  // ColorCount
  entry.writeUInt8(0,  3);  // Reserved
  entry.writeUInt16LE(1, 4);  // Planes
  entry.writeUInt16LE(32, 6); // BitCount
  entry.writeUInt32LE(pngBuffer.length, 8);  // BytesInRes
  entry.writeUInt32LE(22, 12); // ImageOffset = 6 + 16

  const icoBuffer = Buffer.concat([fileHeader, entry, pngBuffer]);
  fs.writeFileSync(icoPath, icoBuffer);
  console.log(`[Icon] Successfully generated valid Windows ICO file: ${icoPath} (${icoBuffer.length} bytes)`);
}

// Use the HIGH-RES CHATR logo (chatr-icon-logo.png in /public) as the source.
// Fall back chain: public/chatr-icon-logo.png → src/assets/chatr-icon-logo.png → public/favicon.png
const candidates = [
  path.join(__dirname, '../public/chatr-icon-logo.png'),
  path.join(__dirname, '../src/assets/chatr-icon-logo.png'),
  path.join(__dirname, '../public/favicon.png'),
];

const inputPng = candidates.find(p => fs.existsSync(p));

if (inputPng) {
  const outputIco = path.join(__dirname, '../public/icon.ico');
  console.log(`[Icon] Using source PNG: ${inputPng}`);
  createValidIco(inputPng, outputIco);

  // Also regenerate favicon.ico from the same source for consistency
  const faviconIco = path.join(__dirname, '../public/favicon.ico');
  createValidIco(inputPng, faviconIco);
} else {
  console.error('[Icon] Could not find any valid source PNG. Please ensure public/chatr-icon-logo.png exists.');
  process.exit(1);
}
