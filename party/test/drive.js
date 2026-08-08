/* WHACK BOX end to end driver.

   Runs ONE game module start to podium with real phones in real tabs, taps with
   a real mouse at each control's centre (never el.click, which skips hit
   testing entirely and is how a control buried under another element passes a
   gate forever), screenshots every phase on the host and on a phone, reloads a
   phone mid game to prove rejoin, and asserts zero console errors anywhere.

   Usage:  node test/drive.js <slug> [playerCount]
   Env:    SHOTS=<dir>   where screenshots land

   ⛔ The three backgrounding flags are load bearing. Chrome throttles timers in
   hidden tabs, and every one of these games is driven by a host side countdown,
   so without them the phones look alive while the host clock crawls and the run
   times out looking like a game bug. */
const path = require('path');
const http = require('http');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..', '..');   /* repo root, so /party/... resolves */
const PORT = 8231;
const SLUG = process.argv[2] || 'mothlight';
const PLAYERS = parseInt(process.argv[3] || '3', 10);
const SHOTS = process.env.SHOTS || path.join('/tmp', 'wb-shots', SLUG);
const puppeteer = require(path.join(ROOT, 'node_modules', 'puppeteer'));

const FAST = { mothlight:'ml_fast=1', firefly:'ff_fast=1', liftingfog:'lf_fast=1', firstfrost:'fr_fast=1' };

const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png',
  '.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(ROOT, p);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, {'content-type': MIME[path.extname(file)] || 'application/octet-stream'});
    res.end(data);
  });
});

const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
function watch(page, tag) {
  page.on('console', m => { if (m.type() === 'error') errors.push(tag + ': ' + m.text()); });
  page.on('pageerror', e => errors.push(tag + ' PAGEERROR: ' + e.message));
  page.on('requestfailed', r => {
    /* a missing content.js is tolerated by the shell on purpose; anything else is real */
    const u = r.url();
    if (!/favicon/.test(u)) errors.push(tag + ' REQFAIL: ' + u);
  });
}

/* tap a real control by its centre point, and refuse if something else is on top */
async function tapCentre(page, handle) {
  const box = await handle.boundingBox();
  if (!box || box.width < 1 || box.height < 1) return false;
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  const onTop = await page.evaluate((x, y, el) => {
    const at = document.elementFromPoint(x, y);
    return !!(at && (at === el || el.contains(at) || at.contains(el)));
  }, cx, cy, handle);
  if (!onTop) return false;
  await page.mouse.click(cx, cy);
  return true;
}

/* one random live control on a phone. Phones never carry a destructive button,
   which is why this can be blind; the host is driven explicitly instead. */
async function tapSomething(page) {
  const btns = await page.$$('#game-root .screen.on button:not([disabled])');
  if (!btns.length) return null;
  const pick = btns[Math.floor(Math.random() * btns.length)];
  const label = await page.evaluate(el => (el.textContent || '').trim().slice(0, 18), pick);
  const ok = await tapCentre(page, pick);
  return ok ? label : null;
}

async function hostPhase(page) {
  return page.evaluate(() => {
    const on = document.querySelector('#game-root .on');
    return on ? on.id : (document.querySelector('#ps-lobby.on') ? 'lobby' : 'none');
  });
}

(async () => {
  await new Promise(r => server.listen(PORT, r));
  fs.mkdirSync(SHOTS, { recursive: true });
  const base = `http://localhost:${PORT}/party`;
  /* protocolTimeout raised off its 30s default: this box has 2 cores and a
     devtools call can genuinely sit that long under load, which shows up as a
     "Runtime.callFunctionOn timed out" and reads exactly like a game hang. */
  const browser = await puppeteer.launch({
    protocolTimeout: 180000,
    args: ['--no-sandbox','--disable-dev-shm-usage',
           '--disable-backgrounding-occluded-windows',
           '--disable-renderer-backgrounding',
           '--disable-background-timer-throttling']
  });
  const log = [];
  const seenHost = new Set(), seenPhone = new Set();

  /* ---- host ---- */
  const host = await browser.newPage();
  watch(host, 'host');
  await host.setViewport({ width: 1920, height: 1080 });
  await host.goto(`${base}/host.html?game=${SLUG}&${FAST[SLUG] || ''}`, { waitUntil: 'networkidle2' });
  await sleep(700);
  const code = await host.$eval('#ps-code', el => el.textContent.trim());
  log.push(`room code: ${code}`);
  if (!/^[A-Z0-9]{4}$/.test(code)) throw new Error('bad room code: ' + code);

  /* ---- phones ---- */
  const phones = [];
  for (let i = 0; i < PLAYERS; i++) {
    const p = await browser.newPage();
    watch(p, 'phone' + (i + 1));
    await p.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    await p.goto(`${base}/play.html`, { waitUntil: 'networkidle2' });
    await p.type('#pj-code', code);
    await p.click('#pj-name', { clickCount: 3 });
    await p.type('#pj-name', ['Ada','Bo','Cy','Del','Eve','Fin','Gus','Hal'][i]);
    await p.click('#pj-go');
    await sleep(500);
    phones.push(p);
  }
  await sleep(900);
  const roster = await host.$$eval('.ps-prow', els => els.map(e => e.textContent.trim()));
  log.push(`roster: ${roster.join(', ')}`);
  if (roster.length !== PLAYERS) throw new Error(`roster ${roster.length}, expected ${PLAYERS}`);

  /* the module the phones actually loaded must be the one the host is running */
  const phoneSlug = await phones[0].evaluate(() => window.PartyShell.gameSlug);
  log.push(`phone loaded module: ${phoneSlug}`);
  if (phoneSlug !== SLUG) throw new Error(`phone loaded "${phoneSlug}" for host game "${SLUG}"`);

  await host.click('#ps-start');
  await sleep(600);

  /* ---- drive to podium ---- */
  let reloaded = false, ticks = 0;
  const DEADLINE = Date.now() + 240000;
  while (Date.now() < DEADLINE) {
    ticks++;
    const phase = await hostPhase(host);

    if (!seenHost.has(phase) && phase !== 'none') {
      seenHost.add(phase);
      await host.screenshot({ path: path.join(SHOTS, `host-${phase}.png`) });
      log.push(`host phase seen: ${phase}`);
    }

    /* host side NEXT buttons only, never the podium's destructive controls */
    for (const id of ['#ml-next','#ff-next','#lf-next','#fr-next']) {
      const el = await host.$(`${id}`);
      if (el) { const vis = await el.boundingBox(); if (vis) { await tapCentre(host, el); } }
    }

    for (let i = 0; i < phones.length; i++) {
      const p = phones[i];
      const ph = await p.evaluate(() => {
        const on = document.querySelector('#game-root .screen.on');
        return on ? on.id : 'none';
      });
      if (!seenPhone.has(ph) && ph !== 'none') {
        seenPhone.add(ph);
        await p.screenshot({ path: path.join(SHOTS, `phone-${ph}.png`) });
      }
      await tapSomething(p);
    }

    /* rejoin proof: reload one phone mid game and require it back in the live phase */
    if (!reloaded && seenHost.size >= 3) {
      reloaded = true;
      const p = phones[0];
      const before = Date.now();
      await p.reload({ waitUntil: 'networkidle2' });
      await p.type('#pj-code', code);
      await p.click('#pj-name', { clickCount: 3 });
      await p.type('#pj-name', 'Ada');
      await p.click('#pj-go');
      let back = false;
      while (Date.now() - before < 8000) {
        const live = await p.evaluate(() => {
          const on = document.querySelector('#game-root .screen.on');
          return !!on && getComputedStyle(document.getElementById('ps-join')).display === 'none';
        }).catch(() => false);
        if (live) { back = true; break; }
        await sleep(300);
      }
      const secs = ((Date.now() - before) / 1000).toFixed(1);
      log.push(back ? `REJOIN: phone back in the live phase in ${secs}s` : `REJOIN FAILED after ${secs}s`);
      if (!back) throw new Error('rejoin failed');
    }

    if (phase.indexOf('pod') >= 0) { log.push(`podium reached after ${ticks} ticks`); break; }
    await sleep(650);
  }

  const finalPhase = await hostPhase(host);
  if (finalPhase.indexOf('pod') < 0) throw new Error('never reached podium, stuck at ' + finalPhase);

  /* podium must carry every participant */
  const podRows = await host.$$eval('#game-root .on [class$="-row"], #game-root .on .ml-standrow',
    els => els.length);
  log.push(`podium rows: ${podRows}`);
  if (podRows < PLAYERS) throw new Error(`podium listed ${podRows} of ${PLAYERS}`);

  /* ---- 48px touch audit on a phone, at 375x667, RENDERED px ---- */
  const small = await phones[1].evaluate(() => {
    const out = [];
    document.querySelectorAll('#game-root .screen.on button, #ps-join button, #ps-join input')
      .forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width && r.height && (r.width < 48 || r.height < 48))
          out.push((el.id || el.className) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
      });
    return out;
  });
  log.push(small.length ? `TOUCH FAILURES: ${small.join(' | ')}` : 'touch audit: every live control is 48px or bigger');

  await sleep(400);
  await host.screenshot({ path: path.join(SHOTS, 'host-podium-final.png') });
  await phones[0].screenshot({ path: path.join(SHOTS, 'phone-podium-final.png') });

  await browser.close();
  server.close();

  console.log(log.join('\n'));
  console.log('host phases: ' + [...seenHost].join(', '));
  console.log('phone phases: ' + [...seenPhone].join(', '));
  console.log(errors.length ? 'CONSOLE ERRORS:\n' + errors.join('\n') : 'console: clean on all pages');
  if (small.length) { console.log('RESULT: FAIL (touch)'); process.exit(2); }
  if (errors.length) { console.log('RESULT: FAIL (console)'); process.exit(3); }
  console.log('RESULT: PASS');
})().catch(e => { console.error('DRIVE FAILED: ' + e.message); process.exit(1); });
