const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('========================================================');
console.log('   @chatr/platform-scanner — PLATFORM ASSET REGISTER  ');
console.log('========================================================\n');

const rootDir = path.join(__dirname, '..');
const srcPagesDir = path.join(rootDir, 'src/pages');
const srcComponentsDir = path.join(rootDir, 'src/components');

// 1. Get Versioned Snapshot Metadata
let gitCommit = 'UNCOMMITTED_DEV_BUILD';
let gitBranch = 'main';
try {
  gitCommit = execSync('git rev-parse --short HEAD', { cwd: rootDir }).toString().trim();
  gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: rootDir }).toString().trim();
} catch (e) {
  // Fallback for dev environment
}

function getFilesInDir(dir, extFilter = /\.(tsx|jsx|ts|js)$/) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isFile() && extFilter.test(file)) {
      results.push({ name: file, relPath: path.relative(rootDir, filePath).replace(/\\/g, '/') });
    }
  }
  return results;
}

const EmpiricalPages = getFilesInDir(srcPagesDir);
const EmpiricalComponents = getFilesInDir(srcComponentsDir);

// 2. Machine-Readable Asset Manifest (JSON for CI comparison)
const machineManifest = {
  metadata: {
    gitCommit,
    gitBranch,
    buildVersion: '1.0.0-rc1',
    generationDate: new Date().toISOString(),
    generator: '@chatr/platform-scanner v1.0.0',
    packages: ['@chatr/kernel', '@chatr/conformance', '@chatr/recruitment', '@chatr/crm', '@chatr/hr']
  },
  viewports: ['chatr.chat', 'chatchat.in', 'Desktop', 'Android', 'iOS'],
  pages: EmpiricalPages.map(p => ({
    name: p.name,
    path: p.relPath,
    status: 'Active',
    protected: true
  })),
  componentsCount: EmpiricalComponents.length,
  protectedAssets: [
    'src/pages/Dashboard.tsx',
    'src/pages/Candidates.tsx',
    'src/pages/Jobs.tsx',
    'src/pages/CRM.tsx',
    'src/pages/Settings.tsx',
    'packages/kernel/src/index.ts'
  ]
};

// Write machine-readable JSON
fs.writeFileSync(path.join(rootDir, 'PLATFORM_ASSET_REGISTER.json'), JSON.stringify(machineManifest, null, 2), 'utf8');

// 3. Human-Readable Governance Document (Markdown)
const markdownContent = `# CHATR Platform Asset Register 1.0 (PLATFORM_ASSET_REGISTER.md)

> **Status**: Mandatory Baseline Inventory & Governance Artifact  
> **Mandatory Rule**: **No engineer, AI agent, or contributor may modify navigation, routes, menus, or desktop/mobile layouts until this register is referenced.**

---

## 1. Versioned Snapshot Metadata

- **Git Commit SHA**: \`${gitCommit}\`
- **Branch**: \`${gitBranch}\`
- **Build Version**: \`1.0.0-rc1\`
- **Generated On**: \`${machineManifest.metadata.generationDate}\`
- **Generator**: \`@chatr/platform-scanner v1.0.0\`
- **Workspace Packages**: \`@chatr/kernel\`, \`@chatr/conformance\`, \`@chatr/recruitment\`, \`@chatr/crm\`, \`@chatr/hr\`

---

## 2. Viewport Inventory

- **\`chatr.chat\`**: Web 1 Primary Portal (Vite React Client)
- **\`chatchat.in\`**: Web 2 Secondary Portal (Vite React Client)
- **Desktop**: Electron / Tauri Desktop Client (\`src/main.desktop.tsx\`)
- **Android / iOS**: Native Mobile Shell (\`src/main.mobile.tsx\` + Capacitor)

---

## 3. Empirical Pages Inventory (\`src/pages/\`)

| Page Component | Repository Relative Path | Lifecycle Status | Protected? |
| :--- | :--- | :--- | :--- |
${EmpiricalPages.map(p => `| **\`${p.name}\`** | \`${p.relPath}\` | \`Active\` | ✅ **Protected** |`).join('\n')}

---

## 4. Protected Assets Inventory (Do Not Break Contract)

\`\`\`
DO NOT DELETE / DO NOT RENAME / DO NOT MERGE WITHOUT ADR:
  ├── src/pages/Dashboard.tsx (Executive Dashboard)
  ├── src/pages/Candidates.tsx (Candidate Intelligence & ATS)
  ├── src/pages/Jobs.tsx (Job Management)
  ├── src/pages/CRM.tsx (Lead & Pipeline Management)
  ├── src/pages/Settings.tsx (Workspace Administration)
  └── packages/kernel/src/index.ts (@chatr/kernel Platform Binary)
\`\`\`

---

## 5. CI Pipeline Fail Gates

The CI pipeline will fail automatically if:
1. A protected route or page component disappears.
2. A protected capability interface is renamed.
3. A protected table or database policy is deleted.
4. Navigation changes occur without a completed Change Impact Analysis.
`;

fs.writeFileSync(path.join(rootDir, 'PLATFORM_ASSET_REGISTER.md'), markdownContent, 'utf8');

console.log('[Scanner] Generated PLATFORM_ASSET_REGISTER.json (machine manifest)');
console.log('[Scanner] Generated PLATFORM_ASSET_REGISTER.md (human governance doc)');
console.log('\n========================================================');
console.log('🎉 SUCCESS: @chatr/platform-scanner execution complete!');
console.log('========================================================');
