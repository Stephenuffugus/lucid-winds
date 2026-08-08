/* WHACK BOX end to end driver.

   Runs ONE game module start to podium with real phones in real tabs, proves
   every tap actually reaches its control, reloads a phone mid game to prove
   rejoin, screenshots every phase, and asserts zero console errors anywhere.

   Usage:  node test/drive.js <slug> [playerCount]
   Env:    SHOTS=<dir>  where screenshots land.  VERBOSE=1  step trace.

   ⛔ THE PHONES DRIVE THEMSELVES, FROM INSIDE THE PAGE. Driving four pages from
   node meant a boundingBox, an evaluate and an input dispatch per phone per
   tick, and on this two core box that volume of devtools traffic stalls: one
   call sits for minutes and surfaces as "Runtime.callFunctionOn timed out",
   which reads exactly like a game hang and is not one. An autopilot injected
   into each phone taps locally and node only polls.

   ⛔ THE AUTOPILOT STILL HIT TESTS, and that is the whole point. For every tap
   it asks document.elementFromPoint what is really at the control's centre and
   dispatches to THAT, never to the element it wanted. A control buried under an
   overlay therefore does nothing, exactly as it would for a player, and the run
   reports it as blocked. Never prove a control works with el.click().

   ⛔ The three backgrounding flags are load bearing. Chrome throttles timers in
   hidden tabs and every one of these games runs on a host side countdown.

   ⛔ The party pages are dev gated. Without seeding sws_dev_ok the whole run is
   a lie in slow motion: the lobby renders under a full screen overlay and reads
   fine while every real tap lands on the gate. It is also why puppeteer's
   page.click HUNG rather than failed, since it waits for an element to become
   clickable and this one never did. */
const path = require('path');
const http = require('http');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..', '..');
const PORT = 8231;
const SLUG = process.argv[2] || 'mothlight';
const PLAYERS = parseInt(process.argv[3] || '3', 10);
const SHOTS = process.env.SHOTS || path.join('/tmp', 'wb-shots', SLUG);
const puppeteer = require(path.join(ROOT, 'node_modules', 'puppeteer'));

const FAST = { mothlight:'ml_fast=1', firefly:'ff_fast=1', liftingfog:'lf_fast=1', firstfrost:'fr_fast=1' };
const NAMES = ['Ada','Bo','Cy','Del','Eve','Fin','Gus','Hal'];
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
const T0 = Date.now();
let LAST = 'boot';
const step = m => { LAST = m; if (process.env.VERBOSE) console.error(((Date.now()-T0)/1000).toFixed(1)+'s  '+m); };
process.on('exit', c => { if (c > 1) console.error('LAST STEP: ' + LAST); });

const errors = [];
function watch(page, tag) {
  page.on('console', m => { if (m.type() === 'error') errors.push(tag + ': ' + m.text()); });
  page.on('pageerror', e => errors.push(tag + ' PAGEERROR: ' + e.message));
  page.on('requestfailed', r => { if (!/favicon/.test(r.url())) errors.push(tag + ' REQFAIL: ' + r.url()); });
}

function autopilot() {
  try { localStorage.setItem('sws_dev_ok','1'); } catch(e) {}
  window.__auto = { taps:0, blocked:[], phases:{} };
  function hitTap(el){
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return 'nosize';
    var x = r.left + r.width/2, y = r.top + r.height/2;
    var at = document.elementFromPoint(x, y);
    if (!at) return 'nothing at point';
    var reaches = (at === el) || el.contains(at) || at.contains(el);
    var o = { bubbles:true, cancelable:true, clientX:x, clientY:y };
    at.dispatchEvent(new MouseEvent('mousedown', o));
    at.dispatchEvent(new MouseEvent('mouseup', o));
    at.dispatchEvent(new MouseEvent('click', o));
    return reaches ? null : 'covered by ' + (at.id || at.className || at.tagName);
  }
  setInterval(function(){
    if (window.__auto.pause) return;
    var on = document.querySelector('#game-root .screen.on');
    if (on && on.id) window.__auto.phases[on.id] = (window.__auto.phases[on.id]||0) + 1;
    var btns = document.querySelectorAll('#game-root .screen.on button:not([disabled])');
    if (!btns.length) return;
    var why = hitTap(btns[Math.floor(Math.random()*btns.length)]);
    if (why) { if (window.__auto.blocked.length < 10) window.__auto.blocked.push(why); }
    else window.__auto.taps++;
  }, 550);
}

async function joinPhone(page, base, code, name) {
  await page.goto(base + '/play.html', { waitUntil: 'domcontentloaded' });
  await page.type('#pj-code', code);
  /* the name field prefills from a shared store, so clear it rather than trust a
     triple click: the first run produced players called PP10 and PPP210 */
  await page.evaluate(() => { document.getElementById('pj-name').value = ''; });
  await page.type('#pj-name', name);
  await page.evaluate(() => {
    var b = document.getElementById('pj-go');
    var r = b.getBoundingClientRect();
    var at = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
    (at || b).dispatchEvent(new MouseEvent('click', { bubbles:true, cancelable:true }));
  });
}

(async () => {
  await new Promise(r => server.listen(PORT, r));
  fs.mkdirSync(SHOTS, { recursive: true });
  const base = 'http://localhost:' + PORT + '/party';
  const browser = await puppeteer.launch({
    protocolTimeout: 90000,
    args: ['--no-sandbox','--disable-dev-shm-usage',
           '--disable-backgrounding-occluded-windows',
           '--disable-renderer-backgrounding',
           '--disable-background-timer-throttling']
  });
  const log = [];
  const seenHost = new Set();
  const shotFails = [];
  const phones = [];

  /* ⛔ SHOOT WITH THE OTHER BROWSERS HELD STILL. Three phones tapping on a two
     core box starve the compositor and Page.captureScreenshot times out, which
     took a run down after it had already reached the podium. Pause every
     autopilot, shoot, resume. A shot that still fails is recorded, never fatal:
     a screenshot is a deliverable, not a gate. */
  async function shoot(pages, label) {
    /* the host goes FIRST and unpaused: a short phase is over before the pause
       and resume round trip finishes, which is how a reveal screenshot ended up
       showing the poll screen that came after it */
    const [first, ...rest] = pages;
    try { await first[0].screenshot({ path: path.join(SHOTS, first[1] + '.png') }); }
    catch (e) { shotFails.push(first[1]); }
    if (!rest.length) return;
    for (const p of phones) await p.evaluate(() => { if (window.__auto) window.__auto.pause = true; }).catch(()=>{});
    await sleep(120);
    for (const [pg, name] of rest) {
      try { await pg.screenshot({ path: path.join(SHOTS, name + '.png') }); }
      catch (e) { shotFails.push(name); }
    }
    for (const p of phones) await p.evaluate(() => { if (window.__auto) window.__auto.pause = false; }).catch(()=>{});
  }

  step('host boot');
  const host = await browser.newPage();
  watch(host, 'host');
  await host.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok','1'); } catch(e) {} });
  await host.setViewport({ width: 1920, height: 1080 });
  await host.goto(base + '/host.html?game=' + SLUG + '&' + (FAST[SLUG]||''), { waitUntil: 'networkidle2' });
  await sleep(700);
  const code = await host.$eval('#ps-code', el => el.textContent.trim());
  log.push('room code: ' + code);
  if (!/^[A-Z0-9]{4}$/.test(code)) throw new Error('bad room code: ' + code);

  step('phones join');
  for (let i = 0; i < PLAYERS; i++) {
    const p = await browser.newPage();
    watch(p, 'phone' + (i + 1));
    await p.evaluateOnNewDocument(autopilot);
    await p.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    await joinPhone(p, base, code, NAMES[i]);
    await sleep(450);
    phones.push(p);
  }
  await sleep(1100);

  const roster = await host.$$eval('.ps-prow', els => els.map(e => e.textContent.trim()));
  log.push('roster: ' + roster.join(', '));
  if (roster.length !== PLAYERS) throw new Error('roster ' + roster.length + ', expected ' + PLAYERS);

  const phoneSlug = await phones[0].evaluate(() => window.PartyShell && window.PartyShell.gameSlug);
  log.push('phone loaded module: ' + phoneSlug);
  if (phoneSlug !== SLUG) throw new Error('phone loaded "' + phoneSlug + '" for host game "' + SLUG + '"');

  step('start');
  const started = await host.evaluate(() => {
    var b = document.getElementById('ps-start');
    var r = b.getBoundingClientRect();
    var at = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
    var reaches = at === b || b.contains(at);
    (at || b).dispatchEvent(new MouseEvent('click', { bubbles:true, cancelable:true }));
    return { reaches: reaches, disabled: b.disabled, at: at ? (at.id || at.className) : 'nothing' };
  });
  log.push('start button: reachable=' + started.reaches + ' disabled=' + started.disabled + ' topmost=' + started.at);
  if (!started.reaches) throw new Error('start button is covered by ' + started.at);
  await sleep(800);

  step('drive');
  let reloaded = false, ticks = 0;
  const DEADLINE = Date.now() + 280000;
  while (Date.now() < DEADLINE) {
    ticks++;
    const phase = await host.evaluate(() => {
      /* a screen always carries an id; anything else wearing .on is a module's
         own state class and must not be mistaken for the active screen */
      const on = [...document.querySelectorAll('#game-root .on')].find(e => e.id);
      return on ? on.id : (document.querySelector('#ps-lobby.on') ? 'lobby' : 'none');
    });

    if (phase !== 'none' && !seenHost.has(phase)) {
      seenHost.add(phase);
      step('shot ' + phase);
      await shoot([[host, 'host-' + phase], [phones[0], 'phone-at-' + phase]], phase);
    }

    /* host side NEXT only; the podium's other controls are destructive */
    await host.evaluate(() => {
      ['ml-next','ff-next','lf-next','fr-next'].forEach(function(id){
        var b = document.getElementById(id);
        if (!b) return;
        var r = b.getBoundingClientRect();
        if (!r.width || !r.height) return;
        var at = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
        (at || b).dispatchEvent(new MouseEvent('click', { bubbles:true, cancelable:true }));
      });
    });

    if (!reloaded && seenHost.size >= 3) {
      reloaded = true;
      step('rejoin');
      const t = Date.now();
      await phones[0].reload({ waitUntil: 'domcontentloaded' });
      await joinPhone(phones[0], base, code, NAMES[0]);
      let back = false;
      while (Date.now() - t < 9000) {
        const live = await phones[0].evaluate(() =>
          !!document.querySelector('#game-root .screen.on') &&
          getComputedStyle(document.getElementById('ps-join')).display === 'none'
        ).catch(() => false);
        if (live) { back = true; break; }
        await sleep(400);
      }
      log.push(back ? 'REJOIN: phone back in the live phase in ' + ((Date.now()-t)/1000).toFixed(1) + 's'
                    : 'REJOIN FAILED');
      if (!back) throw new Error('rejoin failed');
    }

    if (phase.indexOf('pod') >= 0) { log.push('podium reached, ' + ticks + ' polls'); break; }
    await sleep(1100);
  }

  const finalPhase = await host.evaluate(() => {
    const on = [...document.querySelectorAll('#game-root .on')].find(e => e.id);
    return on ? on.id : 'none';
  });
  if (finalPhase.indexOf('pod') < 0) throw new Error('never reached podium, stuck at ' + finalPhase);

  /* match a CLASS TOKEN, not the whole className: a frozen player's row is
     "fr-row out" and testing the full string counted only the survivor */
  const podRows = await host.$$eval('#game-root .on div', els =>
    els.filter(e => [...e.classList].some(c => /-(row|standrow)$/.test(c))).length);
  log.push('podium rows: ' + podRows);
  if (podRows < PLAYERS) throw new Error('podium listed ' + podRows + ' of ' + PLAYERS + ' players');

  let totalTaps = 0; const blocked = []; const phasesSeen = new Set();
  for (let i = 0; i < phones.length; i++) {
    const a = await phones[i].evaluate(() => window.__auto).catch(() => null);
    if (!a) continue;
    totalTaps += a.taps;
    a.blocked.forEach(b => blocked.push('phone' + (i+1) + ': ' + b));
    Object.keys(a.phases).forEach(p => phasesSeen.add(p));
  }
  log.push('phone taps that reached their control: ' + totalTaps);
  log.push(blocked.length ? 'BLOCKED TAPS: ' + [...new Set(blocked)].join(' | ')
                          : 'no tap was ever blocked by an overlay');

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

  await shoot([[host, 'host-podium-final'], [phones[0], 'phone-podium-final']], 'final');
  if (shotFails.length) log.push('screenshots that would not capture: ' + shotFails.join(', '));
  await browser.close();
  server.close();

  console.log(log.join('\n'));
  console.log('host phases: ' + [...seenHost].join(', '));
  console.log('phone phases: ' + [...phasesSeen].join(', '));
  console.log(small.length ? 'TOUCH FAILURES: ' + small.join(' | ')
                           : 'touch audit: every live control is 48px or bigger');
  console.log(errors.length ? 'CONSOLE ERRORS:\n' + errors.join('\n') : 'console: clean on all pages');
  const fail = small.length || errors.length || blocked.length || totalTaps === 0;
  console.log('RESULT: ' + (fail ? 'FAIL' : 'PASS'));
  process.exit(fail ? 2 : 0);
})().catch(e => { console.error('DRIVE FAILED: ' + e.message); process.exit(3); });
