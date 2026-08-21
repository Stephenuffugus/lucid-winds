import puppeteer from 'puppeteer';
const URL = 'http://127.0.0.1:8777/portal/index.html';
async function visit(opts) {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  let pinged = null;
  await p.setRequestInterception(true);
  p.on('request', r => {
    if (r.url().includes('portalPing')) { pinged = r.url(); r.respond({ status: 204, body: '' }); }
    else r.continue();
  });
  if (opts.seedSeen || opts.standalone || opts.referer) {
    await p.evaluateOnNewDocument((seed, sa, ref) => {
      if (seed) try { localStorage.setItem('sws_seen', '1'); } catch (e) {}
      if (sa) {
        const orig = window.matchMedia;
        window.matchMedia = q => q.includes('display-mode: standalone')
          ? { matches: true, addListener() {}, removeListener() {} } : orig.call(window, q);
      }
      if (ref) Object.defineProperty(document, 'referrer', { get: () => ref });
    }, !!opts.seedSeen, !!opts.standalone, opts.referer || '');
  }
  await p.goto(opts.url || URL, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));
  await b.close();
  return pinged ? decodeURIComponent(pinged.split('src=')[1]) : null;
}
const cases = [
  [{ }, 'new-direct'],
  [{ seedSeen: true }, 'return-direct'],
  [{ standalone: true }, 'app'],
  [{ seedSeen: true, referer: 'https://reddit.com/r/webgames' }, 'referred'],
  [{ url: URL + '?from=sticker' }, 'sticker'],
  [{ url: 'http://127.0.0.1:8777/index.html' }, 'lw-new-direct'],
];
let fail = false;
for (const [opts, want] of cases) {
  const got = await visit(opts);
  const ok = got === want;
  console.log((ok ? 'ok  ' : 'FAIL'), JSON.stringify(opts), '->', got, ok ? '' : ('wanted ' + want));
  if (!ok) fail = true;
}
process.exit(fail ? 1 : 0);
