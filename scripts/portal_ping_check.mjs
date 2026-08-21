import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
let pinged = null;
await p.setRequestInterception(true);
p.on('request', r => {
  if (r.url().includes('portalPing')) { pinged = r.url(); r.respond({ status: 204, body: '' }); }
  else r.continue();
});
await p.goto('http://127.0.0.1:8777/portal/index.html?from=sticker', { waitUntil: 'domcontentloaded' });
await new Promise(r => setTimeout(r, 1500));
console.log('ping 1:', pinged);
const first = pinged; pinged = null;
await p.reload({ waitUntil: 'domcontentloaded' });
await new Promise(r => setTimeout(r, 1200));
console.log('ping 2 (same session, should be null):', pinged);
if (!first || !first.includes('src=sticker') || pinged !== null) { console.error('PING WIRING WRONG'); process.exit(1); }
await b.close();
console.log('PING PASS: fires once per session, carries the sticker source');
