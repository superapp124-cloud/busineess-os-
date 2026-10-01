const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// The terms mapping
const exactReplacements = {
  'SI Assistant': 'SI Assistant',
  'si assistant': 'si assistant',
  'Si Assistant': 'Si Assistant',
  'SI Agent': 'SI Agent',
  'si agent': 'si agent',
  'Si Agent': 'Si Agent',
  'SI Hub': 'SI Hub',
  'si hub': 'si hub',
  'Si Hub': 'Si Hub',
  'SI OS': 'SI OS',
  'si os': 'si os',
  'Si OS': 'Si OS',
  'SI Engine': 'SI Engine',
  'si engine': 'si engine',
  'Si Engine': 'Si Engine',
  'SI Search': 'SI Search',
  'si search': 'si search',
  'Si Search': 'Si Search',
  'SI Coach': 'SI Coach',
  'si coach': 'si coach',
  'Si Coach': 'Si Coach',
  'SI Tools': 'SI Tools',
  'si tools': 'si tools',
  'Si Tools': 'Si Tools',
  'SI features': 'SI features',
  'si features': 'si features',
  'Si features': 'Si features',
  'SI model': 'SI model',
  'si model': 'si model',
  'Si model': 'Si model',
  'AI provider': 'SI provider',
  'ai provider': 'si provider',
  'Ai provider': 'Si provider',
  'SI response': 'SI response',
  'si response': 'si response',
  'Si response': 'Si response',
  'SI chat': 'SI chat',
  'si chat': 'si chat',
  'Si chat': 'Si chat',
  'SI settings': 'SI settings',
  'si settings': 'si settings',
  'Si settings': 'Si settings',
  'SI configuration': 'SI configuration',
  'si configuration': 'si configuration',
  'Si configuration': 'Si configuration',
  'SI status': 'SI status',
  'si status': 'si status',
  'Si status': 'Si status',
  'SI fallback': 'SI fallback',
  'si fallback': 'si fallback',
  'Si fallback': 'Si fallback',
  'SI processing': 'SI processing',
  'si processing': 'si processing',
  'Si processing': 'Si processing',
  'SI inference': 'SI inference',
  'si inference': 'si inference',
  'Si inference': 'Si inference',
  'SI-powered': 'SI-powered',
  'si-powered': 'si-powered',
  'Si-powered': 'Si-powered',
  'SI powered': 'SI powered',
  'si powered': 'si powered',
  'Si powered': 'Si powered',
  'Super Intelligence': 'Super Intelligence',
  'super intelligence': 'super intelligence',
  'Super intelligence': 'Super intelligence',
  'Powered by SI': 'Powered by SI',
  'powered by si': 'powered by si',
  'Ask SI': 'Ask SI',
  'ask si': 'ask si',
  'SI is working': 'SI is working',
  'si is working': 'si is working'
};

const regexReplacements = [
  { regex: /\bAI\b/g, replace: 'SI' },
  { regex: /\bAi\b/g, replace: 'Si' },
  // Exclude 'ai' in lowercase from global standalone replacement because it's too risky for false positives (like inside other texts or codes), 
  // but wait, we need to handle "chatr ai". Let's use word boundaries but only in text content.
];

// Helper to ignore certain paths
function isIgnoredPath(filePath) {
  const ignores = [
    'node_modules', '.git', '.next', 'build', 'dist', 
    'ai_search_results', 'package-lock.json', 'yarn.lock',
    // data datasets that might just be historical text
    'data/', 'datasets/', 'migration/SOURCE_RAW_CALLS.json'
  ];
  return ignores.some(ig => filePath.includes(ig));
}

// Ignore Android package names (e.g. ai/chatr)
function isAndroidPackagePath(filePath) {
  return filePath.includes('android/') && filePath.includes('ai/chatr');
}

// Find all files
const files = execSync('git ls-files').toString().split('\n').filter(Boolean);

let inventory = {
  changedToSi: [],
  keepAsAi: [],
  needsReview: []
};

files.forEach(file => {
  if (isIgnoredPath(file)) return;
  
  // Try reading file
  let content;
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch (e) {
    return;
  }

  // Skip binary/non-utf8
  if (content.includes('\0')) return;

  let newContent = content;
  let changed = false;

  // We need to categorize carefully.
  // We'll just do a dry run first to build inventory.
  
  // Example categorization (simplified for now):
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    let originalLine = line;
    let modifiedLine = line;
    
    // Check specific phrases
    for (const [key, value] of Object.entries(exactReplacements)) {
      if (modifiedLine.includes(key)) {
        // Decide if we should change or keep
        if (file.includes('schema.prisma') || file.includes('database')) {
          inventory.keepAsAi.push({ file, line: i+1, text: originalLine, reason: 'database/schema' });
        } else if (file.includes('analytics') || originalLine.includes('trackEvent')) {
           // We might still change analytics strings depending on instruction #14: 
           // "If changing event names: create a migration strategy... Preserve historical reporting."
           // Let's flag for review
           inventory.needsReview.push({ file, line: i+1, text: originalLine, reason: 'analytics' });
        } else {
           inventory.changedToSi.push({ file, line: i+1, text: originalLine, target: value });
           modifiedLine = modifiedLine.split(key).join(value);
        }
      }
    }
    
    // Check standalone AI
    const standaloneMatch = modifiedLine.match(/\bAI\b/g);
    if (standaloneMatch) {
       if (isAndroidPackagePath(file)) {
          inventory.keepAsAi.push({ file, line: i+1, text: originalLine, reason: 'android package' });
       } else if (originalLine.includes('OpenAI') || originalLine.includes('AICore') || originalLine.includes('AI provider')) {
          inventory.keepAsAi.push({ file, line: i+1, text: originalLine, reason: 'technical provider' });
       } else {
          inventory.changedToSi.push({ file, line: i+1, text: originalLine, target: 'SI' });
       }
    }
  });
});

fs.writeFileSync('migration_inventory.json', JSON.stringify(inventory, null, 2));
console.log(`Inventory created. Changed: ${inventory.changedToSi.length}, Kept: ${inventory.keepAsAi.length}, Review: ${inventory.needsReview.length}`);
