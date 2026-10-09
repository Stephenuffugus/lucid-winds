// The Pi Network rail (lucid-winds plans/pi/PI-GAMES-PLAN-OCT08.md). Pixel Petri on petri.lucidwinds.com is a Pi app:
// Pi sign in, a TASTER tray (src/data/tray.json `pi.free`: a few lands, animals, a house, a fence, a fire; his call,
// 8 Oct 2026: "only give a few things to play with, a coupel lands, a couple animals and if they want to unlock the
// rest it costs the pi"), one unlock of 8 Pi for everything else, New world and the whole Scrapbook. The first world
// still opens alive as the starter makes it, and the simulation is never cut: what she can PUT DOWN is the taster.
// On every other host (lucidwinds.com, so the Play app) this module does nothing: no SDK, no sign in, no lock, no
// request. `?rail=pi` turns the rail on for a look on localhost; it only adds the locks and the sign in.
// Ownership lives on the Pi account (the server, lucid-winds functions/piGames.js) with a local hint so a bought game
// opens at once. DOM, fetch and the SDK are touched only inside createPi; the rules above the line are pure
// (tools/pi-check.mjs).

export const GAME = 'petri';
export const GAME_TEST = 'petri-test';            // the Testnet app's name on the server (its own key, test Pi)
export const PRICE = 8;                           // Pi, once
export const MEMO = 'Pixel Petri, the whole world';
export const PI_HOSTS = ['petri.lucidwinds.com', 'petri-test.lucidwinds.com']; // never "pixelpetri": a Pi host must not start with "pi"
export const TEST_HOST_SUFFIX = '-test.lucidwinds.com';
export const SDK_URL = 'https://sdk.minepi.com/pi-sdk.js';
export const FN_BASE = 'https://us-central1-focus-grove-fffa8.cloudfunctions.net';
export const OWNED_KEY = 'tw_pi_owned';
export const SANDBOX_KEY = 'tw_pi_sandbox';       // '1' sandbox (test Pi), '0' real; unset: the test host sandboxes
export const SCOPES = ['username', 'payments'];
export const FREE_ALWAYS = new Set(['hand', 'power:erase']); // the Hand and Erase are tools, never content

export function railFor(hostname, params) {
  if (params && typeof params.get === 'function' && params.get('rail') === 'pi') return 'pi';
  return PI_HOSTS.includes(String(hostname || '').toLowerCase()) ? 'pi' : 'web';
}
export function gameIdFor(hostname) {
  return String(hostname || '').toLowerCase().endsWith(TEST_HOST_SUFFIX) ? GAME_TEST : GAME;
}
export function sandboxFor(hostname, flag) {
  if (flag === '1') return true;
  if (flag === '0') return false;
  return String(hostname || '').toLowerCase().endsWith(TEST_HOST_SUFFIX);
}
// tray.json `pi.free`: { tab: [ids] } → Map tab → Set(ids)
export function freeSet(tray) {
  const free = (tray && tray.pi && tray.pi.free) || {};
  return new Map(Object.entries(free).map(([tab, ids]) => [tab, new Set(ids)]));
}
// Locked = on the Pi rail, not owned, and not in the taster. Tools (the Hand, Erase, the village's two) are never locked.
export function isLocked(rail, owned, free, cat, id) {
  if (rail !== 'pi' || owned) return false;
  if (cat === 'hand' || FREE_ALWAYS.has(cat + ':' + id)) return false;
  const set = free.get(cat);
  return !(set && set.has(id));
}

export function createPi({ data, str, hostname = '', params = null, storage = null, say = () => {}, onChange = () => {} }) {
  const rail = railFor(hostname, params), game = gameIdFor(hostname), free = freeSet(data.tray);
  const read = (k) => { try { return storage ? storage.getItem(k) : null; } catch (e) { return null; } };
  const write = (k, v) => { try { if (storage) storage.setItem(k, v); } catch (e) { /* private mode */ } };
  const P = {
    rail, game, free,
    owned: rail === 'pi' && read(OWNED_KEY) === '1',
    user: null, sdk: false, checking: false, sandbox: rail === 'pi' && sandboxFor(hostname, read(SANDBOX_KEY)),
    get active() { return rail === 'pi'; },
    askFirst: () => rail === 'pi' && !P.owned,
    locked: (cat, id) => isLocked(rail, P.owned, free, cat, id),
  };
  let open = false, paying = false, el = null;

  // ---------- boot: the SDK, sign in, what she owns ----------
  P.boot = async () => {
    if (!P.active) return;
    try { document.documentElement.classList.add('pi-rail'); } catch (e) { /* no DOM */ }
    P.checking = true;
    try {
      await loadSdk();
      const Pi = globalThis.Pi;
      if (!Pi || typeof Pi.init !== 'function') return;
      Pi.init({ version: '2.0', sandbox: P.sandbox });
      P.sdk = true;
      await P.signIn();
    } catch (e) { console.warn('Pixel Petri: Pi rail', e && e.message); } finally { P.checking = false; render(); }
  };
  function loadSdk() {
    if (globalThis.Pi) return Promise.resolve();
    return new Promise((res) => {
      let done = false;
      const fin = () => { if (!done) { done = true; res(); } };
      try { const s = document.createElement('script'); s.src = SDK_URL; s.async = true; s.onload = fin; s.onerror = fin; document.head.appendChild(s); } catch (e) { fin(); }
      setTimeout(fin, 8000);
    });
  }
  P.signIn = async () => {
    const Pi = globalThis.Pi;
    if (!Pi || !P.sdk) return null;
    try {
      const auth = await Pi.authenticate(SCOPES, (payment) => recover(payment));
      P.user = { uid: auth.user.uid, username: auth.user.username, token: auth.accessToken };
    } catch (e) { P.user = null; return null; }
    await P.refreshOwned();
    return P.user;
  };
  P.refreshOwned = async () => {
    if (!P.user) return P.owned;
    try {
      const r = await call('piGameStatus', { game, accessToken: P.user.token });
      setOwned(Array.isArray(r.owned) && r.owned.includes('full'));
    } catch (e) { /* the local hint stands until the server answers */ }
    return P.owned;
  };
  function setOwned(v) {
    const was = P.owned;
    P.owned = !!v;
    write(OWNED_KEY, v ? '1' : '0');
    render();
    if (was !== P.owned) onChange(P.owned);
  }
  async function recover(payment) {
    try {
      const txid = payment && payment.transaction ? payment.transaction.txid : '';
      const r = await call('piGameComplete', { game, paymentId: payment.identifier, txid });
      if (r && r.ok) granted();
    } catch (e) { console.warn('Pixel Petri: Pi recover', e && e.message); }
  }
  async function call(name, body) {
    const ctl = typeof AbortController === 'function' ? new AbortController() : null;
    const t = ctl ? setTimeout(() => ctl.abort(), 15000) : 0;
    try {
      const res = await fetch(`${FN_BASE}/${name}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ data: body }), signal: ctl ? ctl.signal : undefined });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j.error) throw new Error((j.error && j.error.message) || `HTTP ${res.status}`);
      return j.result || {};
    } finally { clearTimeout(t); }
  }

  // ---------- the ask: a dialog in the game's own panel style (index.html #piAsk) ----------
  function ensure() {
    if (el) return el;
    el = document.createElement('div');
    el.id = 'piAsk';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.addEventListener('click', (ev) => { if (ev.target === el) close(); });
    document.body.appendChild(el);
    return el;
  }
  function render() {
    if (!open) return;
    const box = ensure();
    const Pi = globalThis.Pi;
    const middle = P.checking ? `<p>${str('pi.checking')}</p>`
      : P.user ? `<div class="row"><button class="buy" id="piBuy">${str('pi.buy')}</button></div>`
        : (P.sdk && Pi) ? `<div class="row"><button class="buy" id="piSign">${str('pi.signIn')}</button></div>`
          : `<p>${str('pi.outside')}</p>`;
    box.innerHTML = `<div class="box"><button class="x" id="piX" aria-label="${str('ui.close') || 'Close'}"></button><h2>${str('pi.title')}</h2><p>${str('pi.free')}</p><p>${str('pi.offer')}</p>${middle}<div class="row"><button id="piLater">${str('pi.later')}</button></div></div>`;
    box.classList.add('on');
    box.querySelector('#piLater').onclick = close;
    box.querySelector('#piX').onclick = close;
    const buy = box.querySelector('#piBuy'); if (buy) buy.onclick = () => P.buy();
    const sign = box.querySelector('#piSign'); if (sign) sign.onclick = async () => { P.checking = true; render(); await P.signIn(); P.checking = false; render(); };
  }
  function close() { open = false; if (el) el.classList.remove('on'); }
  P.ask = () => { open = true; render(); };
  P.buy = () => {
    const Pi = globalThis.Pi;
    if (!Pi || !P.sdk) { say(str('pi.outside')); return false; }
    if (!P.user) { say(str('pi.signInFirst')); return false; }
    if (paying) return false;
    paying = true;
    try {
      Pi.createPayment({ amount: PRICE, memo: MEMO, metadata: { game, sku: 'full' } }, {
        onReadyForServerApproval: (paymentId) => call('piGameApprove', { game, paymentId }).catch((e) => console.warn('Pixel Petri: Pi approve', e && e.message)),
        onReadyForServerCompletion: (paymentId, txid) => call('piGameComplete', { game, paymentId, txid })
          .then((r) => { paying = false; if (r && r.ok) granted(); else say(str('pi.trouble')); })
          .catch((e) => { paying = false; console.warn('Pixel Petri: Pi complete', e && e.message); say(str('pi.trouble')); }),
        onCancel: () => { paying = false; say(str('pi.cancelled')); },
        onError: (err) => { paying = false; console.warn('Pixel Petri: Pi payment', err && err.message); say(str('pi.trouble')); },
      });
    } catch (e) { paying = false; say(str('pi.trouble')); return false; }
    return true;
  };
  function granted() {
    if (P.owned) { setOwned(true); return; }
    close();
    setOwned(true);
    say(str('pi.thanks'));
  }
  return P;
}
