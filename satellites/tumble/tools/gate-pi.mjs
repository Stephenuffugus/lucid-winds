// THE PI RAIL, SEEN (plans/pi/PI-GAMES-PLAN-OCT08.md §8). Headless Chrome on 127.0.0.1 with the harness, both rails.
//
//   node tools/gate-pi.mjs                 every scene, shots in dev/out/pi-*.png
//   node tools/gate-pi.mjs --plant nogate  src/pi.js served with allowsPick() always true: the Pi scenes must go RED
//   node tools/gate-pi.mjs --plant webleak src/pi.js served with railFor() always 'pi': the web scene must go RED
//
// Pi's SDK is never fetched (sdk.minepi.com is answered here, empty) and the server is answered here too, so the
// gate needs nothing outside the box and never touches a real Pi app. window.Pi is a stub that behaves like Pi
// Browser: authenticate resolves a user, createPayment calls the four callbacks the way Pi does.
import { harness, sleep } from './harness.mjs';
import { readFileSync } from 'fs';

const plant = process.argv.includes('--plant') ? process.argv[process.argv.indexOf('--plant') + 1] : null;
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1].split(',') : null;
const runs = (k) => !only || only.includes(k);
const FN = 'https://us-central1-focus-grove-fffa8.cloudfunctions.net/';
const fails = [];
let n = 0;
const ok = (c, m) => { n++; console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };

const piSrc = readFileSync(new URL('../src/pi.js', import.meta.url), 'utf8');
function planted(src) {
  if (plant === 'nogate') return src.replace('export function allowsPick(rail, owned, pick) {', 'export function allowsPick(rail, owned, pick) { return true;');
  if (plant === 'webleak') return src.replace('export function railFor(hostname, params) {', "export function railFor(hostname, params) { return 'pi';");
  return src;
}

const PI_STUB = (owned) => `
  window.__piCalls = [];
  window.Pi = {
    init(o) { window.__piCalls.push(['init', o]); },
    authenticate(scopes, onIncomplete) { window.__piCalls.push(['auth', scopes]); window.__piIncomplete = onIncomplete;
      return Promise.resolve({ accessToken: 'tok-1', user: { uid: 'pi-u1', username: 'pioneer' } }); },
    createPayment(data, cb) { window.__piCalls.push(['pay', data]); window.__piPay = data;
      setTimeout(() => cb.onReadyForServerApproval('pay-1'), 50);
      setTimeout(() => cb.onReadyForServerCompletion('pay-1', 'tx-1'), 400); },
  };
  window.__ownedAtStart = ${JSON.stringify(owned)};`;

// one scene = one fresh browser (its own storage), the SDK and the server answered here
async function scene(name, { w = 412, h = 915, stub = null, owned = [], query, wait = null }) {
  const H = await harness({ w, h, outDir: 'dev/out' });
  const seen = { sdk: 0, fn: [] };
  let ownedNow = owned.slice();
  await H.page.setRequestInterception(true);
  H.page.on('request', (r) => {
    const u = r.url();
    if (u.startsWith('https://sdk.minepi.com/')) { seen.sdk++; return r.respond({ status: 200, contentType: 'text/javascript', body: '/* stub */' }); }
    if (u.startsWith(FN)) {
      const fn = u.slice(FN.length);
      let data = {};
      try { data = JSON.parse(r.postData() || '{}').data || {}; } catch (e) { /* no body */ }
      seen.fn.push({ fn, data });
      const result = fn === 'piGameStatus' ? { ok: true, owned: ownedNow }
        : fn === 'piGameApprove' ? { ok: true, paymentId: data.paymentId }
          : fn === 'piGameComplete' ? ((ownedNow = ['full']), { ok: true, paymentId: data.paymentId, owned: ownedNow })
            : null;
      return r.respond({ status: result ? 200 : 404, contentType: 'application/json', body: JSON.stringify(result ? { result } : { error: { message: 'no such function', status: 'NOT_FOUND' } }) });
    }
    if (plant && /\/src\/pi\.js(\?|$)/.test(u)) return r.respond({ status: 200, contentType: 'text/javascript', body: planted(piSrc) });
    return r.continue();
  });
  if (stub) await H.page.evaluateOnNewDocument(stub);
  console.log(`── ${name}`);
  const t0 = Date.now();
  try { await H.open(query, wait); } catch (e) {
    const st = await H.page.evaluate(() => (window.TUMBLE_DEV && window.TUMBLE_DEV.state) || (window.TUMBLE ? 'booted' : 'no app')).catch(() => '?');
    console.log(`  open() failed after ${Date.now() - t0} ms: ${e.message.split('\n')[0]}; state ${st}; errors: ${H.errors.join(' | ') || 'none'}; sdk ${seen.sdk}, fn ${seen.fn.length}`);
    await H.shot('pi-fail-' + name.replace(/[^a-z0-9]+/gi, '-') + '.png').catch(() => {});
  }
  return { H, seen };
}

// a Load has BEGUN when the dryer starts its pre simulation ('dump'): only startLoad() enters it. Waiting on for the
// pile to settle to 'play' costs three minutes of SwiftShader a scene on this box and proves nothing more about the rail.
const began = (H, ms = 240000) => H.page.waitForFunction(() => window.TUMBLE_DEV && (window.TUMBLE_DEV.state === 'dump' || window.TUMBLE_DEV.state === 'play'), { timeout: ms, polling: 250 }).then(() => true).catch(() => false);
const sheet = (H) => H.page.evaluate(() => {
  const s = document.getElementById('sheet');
  return { on: !!(s && s.classList.contains('on')), title: (document.getElementById('sheetTitle') || {}).textContent || '', text: (document.getElementById('sheetBody') || {}).textContent || '',
    buy: !!document.getElementById('piBuy'), later: !!document.getElementById('piLater') };
});
const state = (H) => H.page.evaluate(() => ({ s: window.TUMBLE_DEV && window.TUMBLE_DEV.state, rail: window.TUMBLE.pi.rail, owned: window.TUMBLE.pi.owned, cls: document.documentElement.classList.contains('pi-rail'),
  hint: (() => { try { return localStorage.getItem('tumble-pi-owned'); } catch (e) { return 'err'; } })() }));

// ---------- 1. the web rail: a Heavy Load starts, nothing of Pi exists ----------
if (runs('1')) {
  const { H, seen } = await scene('web rail, ?load=regular', { query: '?load=regular&nosw&turbo=1', wait: null });
  const went = await began(H);
  const st = await state(H), sh = await sheet(H);
  ok(went && st.rail === 'web', `the Regular Load began on the web rail (state ${st.s}, rail ${st.rail})`);
  ok(seen.sdk === 0 && seen.fn.length === 0, `no request to Pi or to the server (${seen.sdk}, ${seen.fn.length})`);
  ok(!st.cls && !sh.on && !sh.title.includes('dryer'), 'no pi-rail class, no sheet');
  ok(H.errors.length === 0, `no page errors${H.errors.length ? ': ' + H.errors.join(' | ') : ''}`);
  await H.shot('pi-web-heavy.png');
  await H.close();
}

// ---------- 2. the Pi rail outside Pi Browser (a link opened in Chrome): the ask says open it in Pi Browser ----------
if (runs('2')) for (const [w, h] of [[412, 915], [360, 740]]) {
  const { H, seen } = await scene(`Pi rail, no Pi Browser, ${w}x${h}`, { w, h, query: '?rail=pi&load=regular&nosw&turbo=1', wait: null });
  await H.page.waitForFunction(() => { const s = document.getElementById('sheet'); return s && s.classList.contains('on'); }, { timeout: 120000, polling: 250 }).catch(() => {});
  await H.frames(6);
  const st = await state(H), sh = await sheet(H);
  ok(st.rail === 'pi' && st.cls, `the Pi rail is on (rail ${st.rail}, class ${st.cls})`);
  ok(seen.sdk === 1, `the SDK was asked for once (${seen.sdk})`);
  ok(sh.on && sh.title === 'The whole dryer', `the ask opened instead of the Load (title "${sh.title}")`);
  ok(sh.text.includes('Open TUMBLE in Pi Browser') && !sh.buy && sh.later, 'it says to open the game in Pi Browser, offers Not now and no buy button');
  ok(st.s !== 'play' && st.s !== 'dump', `the Regular Load did not begin (state ${st.s})`);
  ok(seen.fn.length === 0, 'and the server was never called (no sign in to ask with)');
  ok(H.errors.length === 0, `no page errors${H.errors.length ? ': ' + H.errors.join(' | ') : ''}`);
  await H.shot(`pi-outside-${w}.png`);
  await H.close();
}

// ---------- 3. the Pi rail in Pi Browser, unowned: the ask, then the buy, then the Load ----------
if (runs('3')) {
  const { H, seen } = await scene('Pi rail, Pi Browser, unowned, buys', { stub: PI_STUB([]), query: '?rail=pi&load=regular&nosw&turbo=1', wait: null });
  await H.page.waitForFunction(() => document.getElementById('piBuy') || document.getElementById('piSign'), { timeout: 120000, polling: 250 }).catch(() => {});
  await H.frames(6);
  let st = await state(H), sh = await sheet(H);
  ok(sh.on && sh.title === 'The whole dryer' && sh.buy, `signed in, the ask offers the buy button (title "${sh.title}", buy ${sh.buy})`);
  ok(sh.text.includes('Unlock for 8 Pi') && sh.text.includes('ten pair'), 'it says Unlock for 8 Pi and names the ten pair Load as free');
  ok(seen.fn.length === 1 && seen.fn[0].fn === 'piGameStatus' && seen.fn[0].data.game === 'tumble' && seen.fn[0].data.accessToken === 'tok-1', 'the server was asked what she owns, with her token');
  ok(!st.owned && st.hint === '0', `she owns nothing (hint ${st.hint})`);
  await H.shot('pi-ask-412.png');
  const notYet = await state(H);
  ok(notYet.s !== 'dump' && notYet.s !== 'play', `and the Regular Load did not begin behind it (state ${notYet.s})`);
  await H.page.click('#piBuy');
  const went = await began(H);
  st = await state(H); sh = await sheet(H);
  const pay = await H.page.evaluate(() => window.__piPay);
  ok(pay && pay.amount === 8 && pay.memo === 'TUMBLE, the whole game' && pay.metadata.game === 'tumble' && pay.metadata.sku === 'full', `Pi was asked for 8 Pi with the memo and metadata (${JSON.stringify(pay)})`);
  const names = seen.fn.map((f) => f.fn).join(',');
  ok(names === 'piGameStatus,piGameApprove,piGameComplete', `status, approve, complete (${names})`);
  ok(st.owned && st.hint === '1', `the whole dryer is hers (owned ${st.owned}, hint ${st.hint})`);
  ok(went && !sh.on, `the Regular Load she asked for began on its own (state ${st.s}, sheet ${sh.on})`);
  ok(H.errors.length === 0, `no page errors${H.errors.length ? ': ' + H.errors.join(' | ') : ''}`);
  await H.shot('pi-unlocked-began.png');
  await H.close();
}

// ---------- 4. the Pi rail in Pi Browser, a buyer on a new phone: no ask at all ----------
if (runs('4')) {
  const { H, seen } = await scene('Pi rail, Pi Browser, owned on the server', { stub: PI_STUB(['full']), owned: ['full'], query: '?rail=pi&nosw&turbo=1', wait: 'room' });
  await H.page.waitForFunction(() => window.TUMBLE && window.TUMBLE.pi.owned === true, { timeout: 60000, polling: 250 }).catch(() => {});
  await H.page.evaluate(() => window.TUMBLE.start({ mode: 'laundry', size: 'heavy' }));
  const went = await began(H);
  const st = await state(H), sh = await sheet(H);
  ok(st.owned && st.hint === '1', `the server's answer opened the game (owned ${st.owned})`);
  ok(went && !sh.on, `a Heavy Load begins with no ask (state ${st.s}, sheet ${sh.on})`);
  ok(seen.fn.length === 1 && seen.fn[0].fn === 'piGameStatus', 'one status call, no payment');
  ok(H.errors.length === 0, `no page errors${H.errors.length ? ': ' + H.errors.join(' | ') : ''}`);
  await H.close();
}

// ---------- 5. the shop on the Pi rail, unowned: a buy tap opens the ask ----------
if (runs('5')) {
  const { H } = await scene('Pi rail, Pi Browser, the shop', { stub: PI_STUB([]), query: '?rail=pi&nosw&turbo=1', wait: 'room' });
  await H.page.waitForFunction(() => window.TUMBLE && window.TUMBLE.pi.user, { timeout: 60000, polling: 250 }).catch(() => {});
  await H.page.evaluate(() => { window.TUMBLE.screens.door('basket'); });
  await sleep(600);
  const before = await sheet(H);
  const tapped = await H.page.evaluate(() => { const b = document.querySelector('#shopList .price:not(.owned):not(.equipped)'); if (!b) return null; b.click(); return b.textContent; });
  await sleep(600);
  const after = await sheet(H);
  ok(before.on && before.title !== 'The whole dryer', `the shop opened first ("${before.title}")`);
  ok(tapped !== null, `a shop price was tapped (${tapped})`);
  ok(after.on && after.title === 'The whole dryer' && after.buy, `and the ask took its place ("${after.title}")`);
  ok(H.errors.length === 0, `no page errors${H.errors.length ? ': ' + H.errors.join(' | ') : ''}`);
  await H.shot('pi-shop-ask.png');
  await H.close();
}

console.log(`gate-pi${plant ? ' (plant ' + plant + ')' : ''}: ${n - fails.length}/${n} passed`);
if (fails.length) { console.log('FAILED:\n  ' + fails.join('\n  ')); process.exitCode = 1; }
