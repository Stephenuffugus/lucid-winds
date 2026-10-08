// The Pi Network rail (plans/pi/PI-GAMES-PLAN-OCT08.md). TUMBLE on tumble.lucidwinds.com is a Pi app: Pi sign in,
// the ten pair Load free for as long as she likes, one unlock of 8 Pi for the whole dryer (Stephen, 8 Oct 2026:
// "if you want to do anything more than play a ten pair load it asks for ... 8 pi cuz asia likes the number 8").
// On every other host this module does NOTHING: no SDK, no sign in, no gate, no new copy, no new request. The Play
// app loads lucidwinds.com and never meets any of it. `?rail=pi` turns the rail on for the gates on 127.0.0.1; it
// only adds the gate and the sign in, it can never unlock anything.
//
// Ownership lives on the Pi account (the server, functions/piGames.js) with a local hint so a bought game opens at
// once, offline too. Nothing in the save changes. Pure over its arguments where Node can test it
// (tests/pi.test.mjs); the DOM, fetch and the SDK are touched only inside PiRail's methods, never at import.

export const GAME = 'tumble';
export const GAME_TEST = 'tumble-test';          // the Testnet app's name on the server (its own key, test Pi)
export const SKU = 'full';
export const PRICE = 8;                           // Pi, once
export const MEMO = 'TUMBLE, the whole game';     // what the Pi payment dialog shows
// the Mainnet app's host and the Testnet app's: Pi verifies a URL for one app only, so the portal wants two (8 Oct)
export const PI_HOSTS = ['tumble.lucidwinds.com', 'tumble-test.lucidwinds.com'];
export const TEST_HOST_SUFFIX = '-test.lucidwinds.com';
export const SDK_URL = 'https://sdk.minepi.com/pi-sdk.js';
export const FN_BASE = 'https://us-central1-focus-grove-fffa8.cloudfunctions.net';
export const OWNED_KEY = 'tumble-pi-owned';       // the local hint ('1' owned); the server answer overwrites it
export const SANDBOX_KEY = 'tumble-pi-sandbox';   // '1' = Pi's sandbox with test Pi, '0' = real Pi; unset: the test host sandboxes, the real one does not
export const SCOPES = ['username', 'payments'];

// every line a player reads (law 11: no dashes, no exclamation points; tests/pi.test.mjs holds it to that)
export const COPY = {
  title: 'The whole dryer',
  free: 'The ten pair Load is free for as long as you like.',
  offer: `One unlock opens the whole dryer: every Load size, Rush, the Daily and the shop. ${PRICE} Pi, once, on your Pi account.`,
  buy: `Unlock for ${PRICE} Pi`,
  later: 'Not now',
  checking: 'One moment, checking your Pi account.',
  outside: 'Open TUMBLE in Pi Browser to unlock it.',
  signIn: 'Sign in with Pi',
  signInFirst: 'Sign in with Pi first.',
  thanks: 'The whole dryer is yours.',
  cancelled: 'No Pi was taken.',
  trouble: 'Pi could not finish that. Try again in a moment.',
  door: `The ten pair Load is free. Everything else opens with the whole dryer, ${PRICE} Pi.`,
};

// 'pi' on the Pi subdomain (or ?rail=pi for a gate), 'web' everywhere else
export function railFor(hostname, params) {
  if (params && typeof params.get === 'function' && params.get('rail') === 'pi') return 'pi';
  return PI_HOSTS.includes(String(hostname || '').toLowerCase()) ? 'pi' : 'web';
}

// the one free thing: a Small (ten pair) Laundry Day Load, not the Daily
export function isFreePick(pick) {
  return !!pick && pick.mode === 'laundry' && !pick.daily && pick.sub !== 'endless' && (pick.size || 'regular') === 'small';
}

// the Testnet app's host runs the SDK in sandbox mode (test Pi) unless the device says otherwise
export function sandboxFor(hostname, flag) {
  if (flag === '1') return true;
  if (flag === '0') return false;
  return String(hostname || '').toLowerCase().endsWith(TEST_HOST_SUFFIX);
}

// which Pi app the server should talk to: the Testnet one on the test host, else the real one
export function gameIdFor(hostname) {
  return String(hostname || '').toLowerCase().endsWith(TEST_HOST_SUFFIX) ? GAME_TEST : GAME;
}

export function allowsPick(rail, owned, pick) { return rail !== 'pi' || !!owned || isFreePick(pick); }
export function allowsShop(rail, owned) { return rail !== 'pi' || !!owned; }

export class PiRail {
  constructor(app, { hostname = '', params = null, storage = null } = {}) {
    this.app = app;
    this.rail = railFor(hostname, params);
    this.game = gameIdFor(hostname);
    this.storage = storage;
    this.owned = false;       // the whole dryer is hers
    this.user = null;         // { uid, username, token } after Pi sign in
    this.sdk = false;         // Pi.init ran
    this.checking = false;    // sign in or the status call in flight
    this.pending = null;      // the pick that met the gate; it starts the moment the unlock lands
    this.sandbox = false;
    this._open = false;
    this._paying = false;
    if (this.rail === 'pi') {
      this.owned = this._read(OWNED_KEY) === '1';
      this.sandbox = sandboxFor(hostname, this._read(SANDBOX_KEY));
    }
  }

  get active() { return this.rail === 'pi'; }
  allows(pick) { return allowsPick(this.rail, this.owned, pick); }
  allowsShop() { return allowsShop(this.rail, this.owned); }
  // the dryer door's line under the sizes, on the Pi rail until she owns it; null elsewhere (the door keeps its own)
  doorHint() { return this.active && !this.owned ? COPY.door : null; }

  _read(k) { try { return this.storage ? this.storage.getItem(k) : null; } catch (e) { return null; } }
  _write(k, v) { try { if (this.storage) this.storage.setItem(k, v); } catch (e) { /* no storage */ } }

  // ---------- boot: the SDK, sign in, what she owns ----------
  async boot() {
    if (!this.active) return;
    try { document.documentElement.classList.add('pi-rail'); } catch (e) { /* no DOM */ }
    this.checking = true;
    try {
      await this._loadSdk();
      const Pi = globalThis.Pi;
      if (!Pi || typeof Pi.init !== 'function') return;
      Pi.init({ version: '2.0', sandbox: this.sandbox });
      this.sdk = true;
      await this.signIn();
    } catch (e) {
      console.warn('TUMBLE: Pi rail', e && e.message);
    } finally {
      this.checking = false;
      this._refresh();
    }
  }

  _loadSdk() {
    if (globalThis.Pi) return Promise.resolve();
    return new Promise((res) => {
      let settled = false;
      const done = () => { if (!settled) { settled = true; res(); } };
      try {
        const s = document.createElement('script');
        s.src = SDK_URL;
        s.async = true;
        s.onload = done;
        s.onerror = done;
        document.head.appendChild(s);
      } catch (e) { done(); }
      setTimeout(done, 8000);   // a slow CDN never holds the room
    });
  }

  async signIn() {
    const Pi = globalThis.Pi;
    if (!Pi || !this.sdk) return null;
    try {
      const auth = await Pi.authenticate(SCOPES, (payment) => this._recover(payment));
      this.user = { uid: auth.user.uid, username: auth.user.username, token: auth.accessToken };
    } catch (e) {
      this.user = null;   // outside Pi Browser, or she said no
      return null;
    }
    await this.refreshOwned();
    return this.user;
  }

  async refreshOwned() {
    if (!this.user) return this.owned;
    try {
      const r = await this._call('piGameStatus', { game: this.game, accessToken: this.user.token });
      this._setOwned(Array.isArray(r.owned) && r.owned.includes(SKU));
    } catch (e) { /* the local hint stands until the server answers */ }
    return this.owned;
  }

  _setOwned(v) {
    this.owned = !!v;
    this._write(OWNED_KEY, v ? '1' : '0');
    this._refresh();
  }

  // an approved payment the phone never completed (Pi hands it over at sign in): finish it, and it counts
  async _recover(payment) {
    try {
      const txid = payment && payment.transaction ? payment.transaction.txid : '';
      const r = await this._call('piGameComplete', { game: this.game, paymentId: payment.identifier, txid });
      if (r && r.ok) this._granted();
    } catch (e) { console.warn('TUMBLE: Pi recover', e && e.message); }
  }

  // the onCall protocol by hand (the game carries no Firebase): { data } in, { result } or { error } out
  async _call(name, data) {
    const ctl = typeof AbortController === 'function' ? new AbortController() : null;
    const t = ctl ? setTimeout(() => ctl.abort(), 15000) : 0;
    try {
      const res = await fetch(`${FN_BASE}/${name}`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ data }), signal: ctl ? ctl.signal : undefined,
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j.error) throw new Error((j.error && j.error.message) || `HTTP ${res.status}`);
      return j.result || {};
    } finally { clearTimeout(t); }
  }

  // ---------- the ask ----------
  gate(pick) {
    this.pending = pick && typeof pick === 'object' && pick.mode ? pick : null;
    this._render();
  }

  _refresh() { if (this._open) this._render(); }

  _render() {
    const ui = this.app && this.app.ui;
    if (!ui || typeof ui.openSheet !== 'function') return;
    const Pi = globalThis.Pi;
    const middle = this.checking ? `<p class="lead">${COPY.checking}</p>`
      : this.user ? `<div class="btnrow"><button class="btn warm" id="piBuy">${COPY.buy}</button></div>`
        : (this.sdk && Pi) ? `<div class="btnrow"><button class="btn warm" id="piSign">${COPY.signIn}</button></div>`
          : `<p class="lead">${COPY.outside}</p>`;
    const body = ui.openSheet(COPY.title, `
      <p class="lead">${COPY.free}</p>
      <p class="lead">${COPY.offer}</p>
      ${middle}
      <div class="btnrow"><button class="btn soft" id="piLater">${COPY.later}</button></div>`,
    { center: true, onClose: () => { this._open = false; } });
    this._open = true;
    body.querySelector('#piLater').addEventListener('click', () => ui.closeSheet(true));
    const buy = body.querySelector('#piBuy');
    if (buy) buy.addEventListener('click', () => this.buy());
    const sign = body.querySelector('#piSign');
    if (sign) sign.addEventListener('click', async () => { this.checking = true; this._render(); await this.signIn(); this.checking = false; this._render(); });
  }

  // Pi's three phases: the dialog opens, our server says yes (approve), she signs, our server finishes
  // (complete) and only then is it hers
  buy() {
    const Pi = globalThis.Pi, ui = this.app && this.app.ui;
    const say = (t) => { if (ui && ui.hint) ui.hint(t, 4000); };
    if (!Pi || !this.sdk) { say(COPY.outside); return false; }
    if (!this.user) { say(COPY.signInFirst); return false; }
    if (this._paying) return false;
    this._paying = true;
    try {
      Pi.createPayment({ amount: PRICE, memo: MEMO, metadata: { game: this.game, sku: SKU } }, {
        onReadyForServerApproval: (paymentId) => this._call('piGameApprove', { game: this.game, paymentId })
          .catch((e) => console.warn('TUMBLE: Pi approve', e && e.message)),
        onReadyForServerCompletion: (paymentId, txid) => this._call('piGameComplete', { game: this.game, paymentId, txid })
          .then((r) => { this._paying = false; if (r && r.ok) this._granted(); else say(COPY.trouble); })
          .catch((e) => { this._paying = false; console.warn('TUMBLE: Pi complete', e && e.message); say(COPY.trouble); }),
        onCancel: () => { this._paying = false; say(COPY.cancelled); },
        onError: (err) => { this._paying = false; console.warn('TUMBLE: Pi payment', err && err.message); say(COPY.trouble); },
      });
    } catch (e) {
      this._paying = false;
      say(COPY.trouble);
      return false;
    }
    return true;
  }

  _granted() {
    if (this.owned) { this._setOwned(true); return; }
    this._setOwned(true);
    const ui = this.app && this.app.ui;
    if (ui) {
      if (this._open) ui.closeSheet();
      if (ui.hint) ui.hint(COPY.thanks, 4000);
    }
    const p = this.pending;
    this.pending = null;
    if (p && this.app && typeof this.app.start === 'function') this.app.start(p);
  }
}
