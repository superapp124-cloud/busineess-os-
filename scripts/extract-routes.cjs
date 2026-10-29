const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');
const regex = /path=["']([^"']+)["']/g;
let match;
const paths = new Set();
while ((match = regex.exec(content)) !== null) {
  paths.add(match[1]);
}
console.log('Total unique paths:', paths.size);
const sorted = Array.from(paths).sort();
console.log('Sample paths:', JSON.stringify(sorted.slice(0, 50), null, 2));

// Check dynamic routes (containing :)
const dynamicRoutes = sorted.filter(p => p.includes(':'));
console.log('Dynamic routes:', JSON.stringify(dynamicRoutes, null, 2));
