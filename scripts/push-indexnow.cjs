/**
 * IndexNow Batch Submitter for CHATR+
 * Immediately informs participating search engines (Bing, Copilot, Yandex, Seznam)
 * of all 3,543 URLs across all 19 sitemaps.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const HOST = 'www.chatrchat.in';
const KEY = '39b7f5e82a1d48c08ef1a742c0d51028';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const publicDir = path.resolve(__dirname, '../public');
const sitemapsDir = path.join(publicDir, 'sitemaps');

function getAllUrls() {
  const urls = new Set();
  const files = fs.readdirSync(sitemapsDir).filter(f => f.endsWith('.xml'));
  for (const f of files) {
    const content = fs.readFileSync(path.join(sitemapsDir, f), 'utf8');
    const matches = content.match(/<loc>(.*?)<\/loc>/g) || [];
    matches.forEach(m => {
      const u = m.replace(/<\/?loc>/g, '').trim();
      if (u.startsWith('https://www.chatrchat.in')) {
        urls.add(u);
      }
    });
  }
  return Array.from(urls);
}

function submitBatch(endpoint, urlList) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: urlList
    });

    const u = new URL(endpoint);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          endpoint,
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          body: data
        });
      });
    });

    req.on('error', (err) => {
      resolve({ endpoint, error: err.message });
    });

    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('===========================================================');
  console.log('         INDEXNOW SEARCH ENGINE PROTOCOL SUBMISSION        ');
  console.log('===========================================================\n');

  const allUrls = getAllUrls();
  console.log(`Discovered ${allUrls.length} unique production URLs across 19 sitemaps.`);

  const endpoints = [
    'https://api.indexnow.org/IndexNow',
    'https://www.bing.com/IndexNow'
  ];

  for (const ep of endpoints) {
    console.log(`\nSubmitting ${allUrls.length} URLs to: ${ep} ...`);
    const res = await submitBatch(ep, allUrls);
    console.log(`Response Code: ${res.statusCode} (${res.statusMessage || res.error || 'OK'})`);
    if (res.body) {
      console.log(`Response Body: ${res.body.slice(0, 200)}`);
    }
  }

  console.log('\n===========================================================');
  console.log('                 SUBMISSION DISPATCHED                     ');
  console.log('===========================================================\n');
}

run();
