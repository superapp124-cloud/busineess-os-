const fs = require('fs');
const path = require('path');

const appTsx = fs.readFileSync('src/App.tsx', 'utf8');
const routes = [...appTsx.matchAll(/path=["'](.*?)["']/g)].map(m => m[1]);

console.log(`Total registered routes in App.tsx: ${routes.length}`);

const footerTsx = fs.readFileSync('src/components/Footer.tsx', 'utf8');
const footerLinks = [...footerTsx.matchAll(/to=["'](.*?)["']/g)].map(m => m[1]);

console.log('\n--- FOOTER LINKS VERIFICATION ---');
let missingCount = 0;
footerLinks.forEach(link => {
  const match = routes.some(r => {
    if (r === link) return true;
    if (r.includes(':')) {
      const pattern = new RegExp('^' + r.replace(/:[^\/]+/g, '[^/]+') + '$');
      return pattern.test(link);
    }
    return false;
  });
  if (match) {
    console.log(`✅ MATCHED: ${link}`);
  } else {
    console.log(`❌ MISSING ROUTE IN APP.TSX: ${link}`);
    missingCount++;
  }
});

console.log(`\nVerification Complete. Missing routes: ${missingCount}`);
