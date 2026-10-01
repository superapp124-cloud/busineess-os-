const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

const ignoredPrefixes = [
  'node_modules', '.git', '.next', 'build', 'dist', 
  'data/', 'datasets/', 'migration/', 'scripts/',
  'git_ai_search', 'process_results'
];

function isIgnored(filePath) {
  return ignoredPrefixes.some(ig => filePath.startsWith(ig)) || filePath.endsWith('.jsonl') || filePath.endsWith('.csv');
}

const allFiles = execSync('git ls-files').toString().split('\n').filter(f => f.trim().length > 0);
let totalChangedFiles = 0;
let totalChanges = 0;

for (const file of allFiles) {
  if (isIgnored(file)) continue;

  let content;
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch (e) { continue; }

  let lines = content.split('\n');
  let fileChanged = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let originalLine = line;

    // Skip import lines, package declarations, and technical schema definitions if they just have "ai"
    if (line.trim().startsWith('import') || line.trim().startsWith('package ') || line.trim().startsWith('export ')) {
       // But wait, what if they import a component we renamed? The prompt says "Do not break existing APIs... Also search filenames".
       // If we don't rename files, we shouldn't change imports of those files.
       // The prompt says "Search filenames", implying we might need to rename files.
       // Let's do exact phrase replacement everywhere EXCEPT package names.
    }

    if (file.includes('android/') && line.includes('ai.chatr')) {
       // Do not touch package name
       continue;
    }

    // 1. Exact replacements
    for (const [key, value] of Object.entries(exactReplacements)) {
      if (line.includes(key)) {
        line = line.split(key).join(value);
      }
    }

    // 2. Standalone AI replacement
    // Avoid replacing AI inside technical identifiers like 'OpenAI', 'AI_provider'
    // Use a regex that replaces \bAI\b with SI, but let's exclude specific phrases
    const aiRegex = /\bAI\b/g;
    let match;
    let newLine = '';
    let lastIndex = 0;
    while ((match = aiRegex.exec(line)) !== null) {
       newLine += line.substring(lastIndex, match.index);
       // check context
       let before = line.substring(Math.max(0, match.index - 10), match.index);
       let after = line.substring(match.index + 2, Math.min(line.length, match.index + 12));
       
       if (before.includes('Open') || after.includes('Core')) {
          newLine += 'AI'; // keep
       } else {
          newLine += 'SI'; // change
       }
       lastIndex = match.index + 2;
    }
    newLine += line.substring(lastIndex);
    line = newLine;
    
    // Also lowercase standalone ai if needed?
    // The prompt says "Where: SI = Super Intelligence... Replace the user-facing concept... Do NOT blindly replace every occurrence of the letters 'AI'. Context matters."
    // Let's also do exact word replacements for ai_chat_started -> si_chat_started for analytics
    line = line.replace(/ai_chat_started/g, 'si_chat_started');
    line = line.replace(/ai_request/g, 'si_request');
    line = line.replace(/ai_agent_run/g, 'si_agent_run');
    line = line.replace(/ai_assistant_opened/g, 'si_assistant_opened');

    if (line !== originalLine) {
      lines[i] = line;
      fileChanged = true;
      totalChanges++;
    }
  }

  if (fileChanged) {
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    totalChangedFiles++;
    console.log(`Updated: ${file}`);
  }
}

console.log(`\nMigration complete. Changed ${totalChanges} occurrences across ${totalChangedFiles} files.`);
