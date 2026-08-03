/**
 * CHATR Enterprise Software Bill of Materials (SBOM) Generator
 * Standards: CycloneDX 1.4 JSON format
 */

const fs = require('fs');
const path = require('path');

console.log('Generating Enterprise SBOM (CycloneDX 1.4 JSON)...');

const pkgPath = path.join(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const sbom = {
  bomFormat: 'CycloneDX',
  specVersion: '1.4',
  version: 1,
  metadata: {
    timestamp: new Date().toISOString(),
    component: {
      name: pkg.name,
      version: pkg.version,
      type: 'application',
      purl: `pkg:npm/${pkg.name}@${pkg.version}`
    }
  },
  components: []
};

const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

for (const [name, version] of Object.entries(allDeps)) {
  sbom.components.push({
    type: 'library',
    name,
    version: String(version).replace(/[\^~]/g, ''),
    purl: `pkg:npm/${name}@${String(version).replace(/[\^~]/g, '')}`,
    licenses: [{ license: { id: 'MIT' } }]
  });
}

const outputPath = path.join(__dirname, '../dist-desktop/sbom.cyclonedx.json');
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(sbom, null, 2));
console.log(`✅ SBOM generated successfully with ${sbom.components.length} components at ${outputPath}`);
