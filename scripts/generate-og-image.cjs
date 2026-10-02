/**
 * generate-og-image.cjs
 * Generates a 1200x630 OG social banner for chatrchat.in
 * Uses 'sharp' (available) to composite an SVG over a background.
 *
 * Run: node scripts/generate-og-image.cjs
 * Output: public/og-image.jpg
 */

'use strict';

const path = require('path');
const fs   = require('fs');

const OUTPUT_PATH = path.resolve(__dirname, '../public/og-image.jpg');

// ─── SVG template ────────────────────────────────────────────────────────────
// 1200 × 630 px; dark teal #164E3F background with white/mint text.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <!-- Background -->
  <rect width="1200" height="630" fill="#164E3F"/>

  <!-- Subtle accent stripe -->
  <rect x="0" y="0" width="8" height="630" fill="#22C55E" opacity="0.6"/>

  <!-- Large logo-like wordmark -->
  <text
    x="80" y="260"
    font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-size="148"
    font-weight="900"
    letter-spacing="-4"
    fill="#FFFFFF">CHATR</text>

  <!-- Subtitle -->
  <text
    x="84" y="340"
    font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-size="36"
    font-weight="400"
    letter-spacing="1"
    fill="#A7D7C5">Chat · Call · SI Agents · Jobs · Travel · More</text>

  <!-- Separator line -->
  <line x1="80" y1="390" x2="560" y2="390" stroke="#A7D7C5" stroke-width="1.5" opacity="0.4"/>

  <!-- Bottom-left tagline -->
  <text
    x="80" y="445"
    font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-size="26"
    font-weight="300"
    fill="rgba(255,255,255,0.70)">Free. All-in-one. For everyone.</text>

  <!-- Bottom-right domain -->
  <text
    x="1120" y="445"
    font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-size="26"
    font-weight="500"
    text-anchor="end"
    fill="#FFFFFF">chatrchat.in</text>
</svg>`;

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (_) {
    // Fallback: write pure SVG and reference that instead.
    const svgOut = path.resolve(__dirname, '../public/og-image.svg');
    fs.mkdirSync(path.dirname(svgOut), { recursive: true });
    fs.writeFileSync(svgOut, svg, 'utf8');
    console.log('[og-image] sharp not available — SVG written to:', svgOut);
    console.log('[og-image] Update og:image in index.html to /og-image.svg');
    return;
  }

  // Ensure public/ exists
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

  await sharp(Buffer.from(svg))
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(OUTPUT_PATH);

  const stat = fs.statSync(OUTPUT_PATH);
  console.log(`[og-image] ✅ Generated: ${OUTPUT_PATH}`);
  console.log(`[og-image]    Size: ${(stat.size / 1024).toFixed(1)} KB`);
}

main().catch((err) => {
  console.error('[og-image] ❌ Error:', err.message);
  process.exit(1);
});
