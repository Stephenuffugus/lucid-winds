// THE PI RAIL (plans/pi/PI-GAMES-PLAN-OCT08.md): alive on tumble.lucidwinds.com, inert everywhere else.
//
// What Node can hold: which hostnames are the Pi rail, what is free (the ten pair Laundry Day Load, nothing
// else), that ownership opens everything, the price (8 Pi, once) on both sides of the wire, the copy law over
// every line of the ask, that the module is precached and hooked at the one choke point, and the whole flow
// (sign in, status, gate, approve, complete, grant) against a fake Pi and a fake server. The eye belongs to
// tools/gate-pi.mjs.
import { suite } from './lib.mjs';
import { readFileSync } from 'fs';
import {
  railFor, isFreePick, allowsPick, allowsShop, sandboxFor, gameIdFor, GAME_TEST, PiRail, COPY, PRICE, MEMO, GAME, SKU, PI_HOSTS, FN_BASE, OWNED_KEY, SANDBOX_KEY,
} from '../src/pi.js';

const { ok, done } = suite('pi');
const read = (f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const q = (s) => new URLSearchParams(s);

// ---------- the rail is the hostname ----------
ok(railFor('tumble.lucidwinds.com') === 'pi', 'tumble.lucidwinds.com is the Pi rail');
ok(railFor('TUMBLE.LUCIDWINDS.COM') === 'pi', 'in any case');
ok(railFor('lucidwinds.com') === 'web' && railFor('www.lucidwinds.com') === 'web', 'lucidwinds.com and www. are the web rail (the Play app)');
ok(railFor('127.0.0.1') === 'web' && railFor('') === 'web' && railFor(undefined) === 'web', 'a local host, an empty host and no host are the web rail');
ok(railFor('127.0.0.1', q('rail=pi')) === 'pi', '?rail=pi turns the Pi rail on for a gate');
ok(railFor('tumble.lucidwinds.com', q('rail=web')) === 'pi', 'no query turns the Pi rail OFF on the Pi host');
ok(railFor('lucidwinds.com', q('rail=pi&load=heavy')) === 'pi' && railFor('lucidwinds.com', q('load=heavy')) === 'web', 'only rail=pi flips it');
ok(PI_HOSTS.every((h) => !h.startsWith('pi')), 'no Pi host starts with "pi" (a Pi listing rule)');
ok(railFor('tumble-test.lucidwinds.com') === 'pi', 'the Testnet app\'s host is the Pi rail too (Pi verifies a URL for one app only, so there are two)');
ok(sandboxFor('tumble-test.lucidwinds.com', null) === true && sandboxFor('tumble.lucidwinds.com', null) === false, 'the test host runs the SDK in sandbox mode, the real one does not');
ok(sandboxFor('tumble.lucidwinds.com', '1') === true && sandboxFor('tumble-test.lucidwinds.com', '0') === false, 'and the device flag overrides either way');
ok(gameIdFor('tumble-test.lucidwinds.com') === GAME_TEST && gameIdFor('tumble.lucidwinds.com') === GAME && gameIdFor('127.0.0.1') === GAME, 'the test host talks to the Testnet app on the server, every other host to the real one');

// ---------- the one free thing ----------
ok(isFreePick({ mode: 'laundry', size: 'small' }), 'a Small Laundry Day Load is free');
ok(!isFreePick({ mode: 'laundry' }) && !isFreePick({ mode: 'laundry', size: 'regular' }), 'a Regular one is not (and no size means Regular, as start() reads it)');
ok(!isFreePick({ mode: 'laundry', size: 'heavy' }) && !isFreePick({ mode: 'laundry', size: 'mountain' }), 'nor Heavy or Mountain');
ok(!isFreePick({ mode: 'laundry', size: 'small', daily: true }) && !isFreePick({ mode: 'rush', sub: 'timed', daily: true, size: 'regular' }), 'the Dailies are not');
ok(!isFreePick({ mode: 'rush', size: 'small' }) && !isFreePick({ mode: 'rush', sub: 'endless', size: 'small' }) && !isFreePick({ mode: 'rush', sub: 'balance', size: 'small' }), 'no Rush is, at any size');
ok(!isFreePick(null) && !isFreePick({}) && !isFreePick({ size: 'small' }), 'nothing without a mode is');

const picks = [
  { mode: 'laundry', size: 'small' }, { mode: 'laundry', size: 'regular' }, { mode: 'laundry', size: 'mountain' },
  { mode: 'laundry', daily: true, size: 'regular' }, { mode: 'rush', sub: 'timed', size: 'small' }, { mode: 'rush', sub: 'endless', size: 'regular' },
  { mode: 'rush', sub: 'timed', daily: true, size: 'regular' },
];
ok(picks.every((p) => allowsPick('web', false, p)), 'the web rail allows every pick, owned or not');
ok(allowsPick('pi', false, picks[0]) && picks.slice(1).every((p) => !allowsPick('pi', false, p)), 'the Pi rail, unowned, allows the Small Laundry Day Load and nothing else');
ok(picks.every((p) => allowsPick('pi', true, p)), 'the Pi rail, owned, allows everything');
ok(allowsShop('web', false) && !allowsShop('pi', false) && allowsShop('pi', true), 'the shop: open on the web, asks on Pi until owned');

// ---------- the price, on both sides of the wire ----------
ok(PRICE === 8, `the price is 8 Pi (${PRICE})`);
ok(GAME === 'tumble' && SKU === 'full', 'the game is tumble and the one thing for sale is full');
ok(MEMO.includes('TUMBLE'), `the Pi dialog names the game (${MEMO})`);
const fn = readFileSync(new URL('../../../functions/piGames.js', import.meta.url), 'utf8');
ok(/tumble:\s*\{[^}]*skus:\s*\{\s*full:\s*8\s*\}/.test(fn), 'the server prices tumble full at 8 too');
ok(/ACTIVE = \[\s*'tumble'/.test(fn), 'tumble is an ACTIVE game on the server');
ok(['piGameApprove', 'piGameComplete', 'piGameStatus'].every((n) => fn.includes(`export const ${n} = onCall(`)), 'the three functions exist');
const idx = readFileSync(new URL('../../../functions/index.js', import.meta.url), 'utf8');
ok(idx.includes("export { piGameApprove, piGameComplete, piGameStatus } from './piGames.js'"), 'and index.js exports them');
ok(/'tumble-test': \{[^\n]*secret: 'PI_KEY_TUMBLE_TEST'[^\n]*testnet: true[^\n]*wallet: 'GBOUS3NQWHIG5FWAR2S6CP32ZUDLDHENMZRPL6XZBRAQUVVSXB3NXC6P'/.test(fn) && /ACTIVE = \[\s*'tumble',\s*'tumble-test'\s*\]/.test(fn), 'the server knows the Testnet app, its key, and the app wallet Pi generated');
ok(idx.includes("export { piGameTestPay } from './piGameTestPay.js'"), 'and exports the test Pi payout');
ok(FN_BASE === 'https://us-central1-focus-grove-fffa8.cloudfunctions.net', 'the client calls the studio project');
ok(fn.includes("const REGION = 'us-central1'"), 'in the region the client calls');

// ---------- the copy law over every line of the ask ----------
const lines = Object.values(COPY);
ok(lines.length >= 12 && lines.every((s) => typeof s === 'string' && s.length), `${lines.length} lines of copy`);
const dashed = lines.filter((s) => /[—–-]/.test(s));
const shouty = lines.filter((s) => /!/.test(s));
ok(!dashed.length, `no dash in any line${dashed.length ? ': ' + dashed.join(' | ') : ''}`);
ok(!shouty.length, `no exclamation point in any line${shouty.length ? ': ' + shouty.join(' | ') : ''}`);
ok(COPY.buy === 'Unlock for 8 Pi' && COPY.offer.includes('8 Pi') && COPY.door.includes('8 Pi'), 'the ask says 8 Pi where it counts');
ok(/ten pair/.test(COPY.free) && /ten pair/.test(COPY.door), 'and names the ten pair Load as the free one');

// ---------- precached and hooked ----------
const sw = read('sw.js');
ok(/const PRECACHE = \[[\s\S]*'src\/pi\.js'[\s\S]*?\];/.test(sw), 'src/pi.js is in the service worker PRECACHE');
const app = read('src/app.js');
ok(app.includes("import { PiRail } from './pi.js'"), 'app.js imports the rail');
ok(/this\.pi = new PiRail\(this, \{ hostname: location\.hostname, params, storage \}\)/.test(app), 'and builds it from the hostname in the constructor');
ok(/start\(pick\) \{\s*\n\s*const s = this\.save, g = this\.game;\s*\n[\s\S]{0,400}?if \(!this\.pi\.allows\(pick\)\) \{ this\.pi\.gate\(pick\); return null; \}/.test(app), 'start(pick) asks the rail before anything else happens');
ok((app.match(/this\.pi\.allows\(pick\)/g) || []).length === 1, 'one choke point, not several');
ok(app.includes('this.pi.boot();'), 'boot() starts the rail');
ok(app.includes("sizeHints: this.pi.doorHint() ||"), 'the dryer door takes the rail\'s line');
ok(app.includes('unlockedSizes: this.pi.askFirst() ? Object.keys(SIZES) : unlocked,') && app.includes('rushOpen: this.pi.askFirst() || s.stats.loads >= 1,'), 'before the unlock on Pi, every size and Rush answer a tap with the ask, not a progress line');
const scr = read('src/screens.js');
ok((scr.match(/\.pi\.allowsShop\(\)\) \{ [a-z.]*pi\.gate\('shop'\); return; \}/g) || []).length === 2, 'both shop buy paths ask the rail first');

// ---------- the module in Node: a fake app, a fake Pi, a fake server ----------
function fakeStorage(init = {}) {
  const m = new Map(Object.entries(init));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), map: m };
}
function fakeApp() {
  const calls = { sheets: [], hints: [], starts: [], closes: 0 };
  const els = {};
  const body = {
    querySelector: (sel) => {
      const id = sel.replace('#', '');
      if (!(id in els)) return null;
      return els[id];
    },
  };
  const app = {
    calls,
    start: (p) => calls.starts.push(p),
    ui: {
      openSheet: (title, html, opts) => {
        calls.sheets.push({ title, html, opts });
        for (const k of Object.keys(els)) delete els[k];
        for (const m of html.matchAll(/id="(\w+)"/g)) els[m[1]] = { handlers: {}, addEventListener(t, f) { this.handlers[t] = f; }, click() { return this.handlers.click && this.handlers.click(); } };
        return body;
      },
      closeSheet: (user) => { calls.closes++; const last = calls.sheets[calls.sheets.length - 1]; if (last && last.opts.onClose) last.opts.onClose(user); },
      hint: (t) => calls.hints.push(t),
    },
  };
  return app;
}

{
  const app = fakeApp();
  const web = new PiRail(app, { hostname: 'lucidwinds.com', params: q('load=heavy'), storage: fakeStorage({ [OWNED_KEY]: '1' }) });
  ok(web.rail === 'web' && !web.active && !web.owned, 'on the web rail the rail is off and the local hint is not even read');
  ok(picks.every((p) => web.allows(p)) && web.allowsShop() && web.doorHint() === null, 'it allows everything and the door keeps its own line');
  let threw = false;
  await web.boot().catch(() => { threw = true; });
  ok(!threw && !('Pi' in globalThis) && app.calls.sheets.length === 0, 'boot() on the web rail touches nothing (no DOM here and it did not need one)');
}

{
  const app = fakeApp();
  const st = fakeStorage({ [OWNED_KEY]: '1', [SANDBOX_KEY]: '1' });
  const pi = new PiRail(app, { hostname: 'tumble.lucidwinds.com', storage: st });
  ok(pi.active && pi.owned && pi.sandbox, 'on the Pi host the local hint opens the game at once and the sandbox flag is read');
  ok(new PiRail(app, { hostname: 'tumble-test.lucidwinds.com', storage: fakeStorage() }).sandbox === true && new PiRail(app, { hostname: 'tumble.lucidwinds.com', storage: fakeStorage() }).sandbox === false, 'the test host sandboxes on its own, the real host does not');
  ok(picks.every((p) => pi.allows(p)) && pi.allowsShop() && pi.doorHint() === null && pi.askFirst() === false, 'owned: everything allowed, no door line, no ask');
}

{
  const app = fakeApp();
  const pi = new PiRail(app, { hostname: 'tumble.lucidwinds.com', storage: fakeStorage() });
  ok(pi.active && !pi.owned && pi.doorHint() === COPY.door && pi.askFirst() === true, 'unowned: the door says the ten pair Load is free and the rest is 8 Pi, and asks first');
  pi.gate({ mode: 'laundry', size: 'regular' });
  const sh = app.calls.sheets[0];
  ok(sh && sh.title === COPY.title && sh.html.includes(COPY.free) && sh.html.includes(COPY.offer), 'the ask is a sheet with the title and both lines');
  ok(sh.html.includes(COPY.outside) && !sh.html.includes('id="piBuy"'), 'with no Pi SDK it says to open the game in Pi Browser, and offers no buy button');
  ok(sh.html.includes(COPY.later) && sh.opts.center === true, 'Not now is there, and the sheet is the centred paper');
  ok(pi.buy() === false && app.calls.hints[0] === COPY.outside, 'buy() with no SDK refuses with the same line');
  ok(pi.pending && pi.pending.size === 'regular', 'the pick that met the gate is remembered');
  pi.gate('shop');
  ok(pi.pending === null, 'the shop remembers no pick');
  app.ui.closeSheet(true);
  ok(pi._open === false, 'closing the sheet is noticed');
}

// the whole flow against a fake Pi Browser and a fake server
{
  const app = fakeApp();
  const st = fakeStorage();
  const pi = new PiRail(app, { hostname: 'tumble.lucidwinds.com', storage: st });
  const served = [];
  let owned = [];
  globalThis.fetch = async (url, init) => {
    const name = url.split('/').pop();
    const data = JSON.parse(init.body).data;
    served.push({ name, data });
    const result = name === 'piGameStatus' ? { ok: true, owned }
      : name === 'piGameApprove' ? { ok: true, paymentId: data.paymentId }
        : name === 'piGameComplete' ? ((owned = ['full']), { ok: true, paymentId: data.paymentId, owned })
          : null;
    return { ok: !!result, json: async () => (result ? { result } : { error: { message: 'no such function' } }) };
  };
  let payment = null;
  globalThis.Pi = {
    init: (o) => { globalThis.Pi.inited = o; },
    authenticate: async (scopes, onIncomplete) => { globalThis.Pi.scopes = scopes; globalThis.Pi.onIncomplete = onIncomplete; return { accessToken: 'tok-1', user: { uid: 'pi-u1', username: 'pioneer' } }; },
    createPayment: (data, cb) => {
      payment = data;
      setTimeout(() => cb.onReadyForServerApproval('pay-1'), 1);
      setTimeout(() => cb.onReadyForServerCompletion('pay-1', 'tx-1'), 5);
    },
  };
  pi.sdk = true;                      // boot() needs a document to load the SDK; the gate does that part
  Pi.init({ version: '2.0', sandbox: pi.sandbox });
  await pi.signIn();
  ok(pi.user && pi.user.uid === 'pi-u1' && pi.user.username === 'pioneer' && pi.user.token === 'tok-1', 'sign in keeps the Pi user');
  ok(Pi.scopes.join() === 'username,payments' && typeof Pi.onIncomplete === 'function', 'with the username and payments scopes and a handler for an incomplete payment');
  ok(served[0] && served[0].name === 'piGameStatus' && served[0].data.game === 'tumble' && served[0].data.accessToken === 'tok-1', 'then asks the server what she owns, with the token');
  ok(!pi.owned && st.getItem(OWNED_KEY) === '0', 'she owns nothing yet, and the hint says so');
  pi.gate({ mode: 'rush', sub: 'timed', size: 'regular' });
  const sh = app.calls.sheets[app.calls.sheets.length - 1];
  ok(sh.html.includes('id="piBuy"') && sh.html.includes(COPY.buy), 'signed in, the sheet offers Unlock for 8 Pi');
  const btn = sh && app.ui.openSheet === undefined ? null : null;
  void btn;
  ok(pi.buy() === true, 'buy() asks Pi for a payment');
  ok(payment && payment.amount === 8 && payment.memo === MEMO && payment.metadata.game === 'tumble' && payment.metadata.sku === 'full', `8 Pi, the memo, and the metadata the server checks (${JSON.stringify(payment)})`);
  ok(pi.buy() === false, 'a second tap while paying does nothing');
  await new Promise((r) => setTimeout(r, 40));
  const names = served.map((s) => s.name).join(',');
  ok(names === 'piGameStatus,piGameApprove,piGameComplete', `the server saw status, approve, complete in that order (${names})`);
  ok(served[1].data.paymentId === 'pay-1' && served[2].data.paymentId === 'pay-1' && served[2].data.txid === 'tx-1', 'with the payment id and the transaction id');
  {
    const piT = new PiRail(fakeApp(), { hostname: 'tumble-test.lucidwinds.com', storage: fakeStorage() });
    piT.sdk = true;
    const before = served.length;
    await piT.signIn();
    ok(served[before] && served[before].data.game === 'tumble-test', 'on the test host the same call names the Testnet app');
  }
  ok(pi.owned && st.getItem(OWNED_KEY) === '1', 'and the whole dryer is hers, with the hint written');
  ok(app.calls.closes >= 1 && app.calls.hints.includes(COPY.thanks), 'the sheet closed and she was thanked');
  ok(app.calls.starts.length === 1 && app.calls.starts[0].mode === 'rush' && app.calls.starts[0].size === 'regular', 'the Load she asked for starts on its own');
  ok(picks.every((p) => pi.allows(p)) && pi.allowsShop() && pi.doorHint() === null, 'everything is open now');
  // an incomplete payment found at a later sign in completes and counts (a new device, the hint is empty)
  const app2 = fakeApp();
  const pi2 = new PiRail(app2, { hostname: 'tumble.lucidwinds.com', storage: fakeStorage() });
  pi2.sdk = true;
  served.length = 0;
  owned = [];
  await pi2.signIn();
  ok(!pi2.owned, 'a new device starts unowned when the server says so');
  await Pi.onIncomplete({ identifier: 'pay-9', transaction: { txid: 'tx-9' } });
  ok(served.some((s) => s.name === 'piGameComplete' && s.data.paymentId === 'pay-9' && s.data.txid === 'tx-9') && pi2.owned, 'an incomplete payment handed over by Pi is completed through the server and then counts');
  // a server that says owned on sign in: no gate at all
  const app3 = fakeApp();
  const pi3 = new PiRail(app3, { hostname: 'tumble.lucidwinds.com', storage: fakeStorage() });
  pi3.sdk = true;
  await pi3.signIn();
  ok(pi3.owned && picks.every((p) => pi3.allows(p)), 'a buyer signing in on a new phone owns it at once');
  delete globalThis.Pi;
  delete globalThis.fetch;
}

done();
