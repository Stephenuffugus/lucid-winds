/* CORE, the DOM half (00-CORE-handoff section 2; plans/math/HANDOFF-CORE.md 3.2).
 *
 * A game imports this file and nothing else from core/:
 *   import { tokens, store, settings, COPY, parseConfig, rng } from '../math/core/core.js?v=<stamp>';
 * The pure half (pure.js) is re exported here so the handoff's names stay whole.
 *
 * Every string a person reads comes from COPY; tools/lint.mjs reads COPY for
 * dashes, exclamation points, the studio's name and the forbidden words, and it
 * fails any sentence written to the page from anywhere else.
 */
import { STAMP } from './STAMP.js?v=20260915a';
import { rng, migrate, parseConfig } from './pure.js?v=20260915a';
export { STAMP, rng, migrate, parseConfig };

/* ---- tokens (2.1) ---- */
export const TOKENS = Object.freeze({
  type: Object.freeze({
    family: 'var(--game-font, system-ui)',
    scale: Object.freeze([12, 14, 16, 20, 26, 34, 48, 64]),
    numeralFeatures: "'tnum' 1, 'lnum' 1"
  }),
  space: Object.freeze([0, 4, 8, 12, 16, 24, 32, 48, 64]),
  motion: Object.freeze({ instant: 0, quick: 160, settle: 320, reveal: 600, hero: 900 }),
  touch: Object.freeze({ min: 48, comfortable: 56, child: 64 })
});

export const tokens = {
  /* a game's palette as custom properties on :root, e.g. { paper: '#f6efe0', accent: '#8a5a2b' } */
  inject(palette, root) {
    const el = root || document.documentElement;
    for (const k of Object.keys(palette || {})) el.style.setProperty('--' + k, palette[k]);
  }
};

/* ---- the words ---- */
export const COPY = Object.freeze({
  settings: 'Settings',
  sound: 'Sound',
  motion: 'Less motion',
  allModes: 'Show every mode',
  contrast: 'High contrast',
  on: 'On',
  off: 'Off',
  clear: 'Clear this game',
  clearAgain: 'Tap again to clear',
  cleared: 'Cleared',
  close: 'Close',
  nearPrefix: 'close, '
});

/* ---- store (2.7) ---- */
/* Namespaced lw:<gameId>:<key>. Every write is read, modify, write through
   update(), so two tabs cannot lower what the other one saved, and a storage
   event from another tab reaches watch(). localStorage can be missing or throw
   (a private window, a locked down school profile): every call survives that and
   the game plays on without saving. */
const KEY = (gameId, key) => 'lw:' + gameId + ':' + key;
function ls() { try { return window.localStorage; } catch (e) { return null; } }
export const store = {
  get(gameId, key, fallback) {
    const s = ls();
    if (!s) return fallback;
    try {
      const raw = s.getItem(KEY(gameId, key));
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  },
  set(gameId, key, value) {
    const s = ls();
    if (!s) return false;
    try { s.setItem(KEY(gameId, key), JSON.stringify(value)); return true; } catch (e) { return false; }
  },
  clearGame(gameId) { return this._clear('lw:' + gameId + ':'); },
  clearAll() { return this._clear('lw:'); },
  _clear(prefix) {
    const s = ls();
    if (!s) return 0;
    const doomed = [];
    try {
      for (let i = 0; i < s.length; i++) { const k = s.key(i); if (k && k.indexOf(prefix) === 0) doomed.push(k); }
      doomed.forEach(k => s.removeItem(k));
    } catch (e) { return 0; }
    return doomed.length;
  },
  load(gameId, schema) { return migrate(this.get(gameId, 'save', null), schema); },
  update(gameId, schema, change) {
    const rec = this.load(gameId, schema);
    change(rec);
    this.set(gameId, 'save', rec);
    return rec;
  },
  watch(gameId, fn) {
    const prefix = 'lw:' + gameId + ':';
    const on = e => { if (!e.key || e.key.indexOf(prefix) === 0) fn(e); };
    window.addEventListener('storage', on);
    return () => window.removeEventListener('storage', on);
  }
};

/* ---- settings (2.8) ---- */
/* The shared panel. The defaults are the catalog's promises: muted on first load
   (G12), motion as the device asks, every mode locked until played unless a
   teacher says otherwise. A game adds its own switches through `extras`. */
export const SETTINGS_DEFAULTS = Object.freeze({ muted: true, reducedMotion: false, allModes: false, highContrast: false });

export const settings = {
  mount({ gameId, schema, host, extras, onChange }) {
    const parent = host || document.body;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lw-btn lw-settings-open';
    button.setAttribute('aria-label', COPY.settings);
    button.setAttribute('aria-haspopup', 'dialog');
    button.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm9 3.5-2.2.6a7 7 0 0 1-.7 1.7l1.1 2-1.9 1.9-2-1.1a7 7 0 0 1-1.7.7L13 21h-2l-.6-2.2a7 7 0 0 1-1.7-.7l-2 1.1-1.9-1.9 1.1-2a7 7 0 0 1-.7-1.7L3 13v-2l2.2-.6a7 7 0 0 1 .7-1.7l-1.1-2 1.9-1.9 2 1.1a7 7 0 0 1 1.7-.7L11 3h2l.6 2.2a7 7 0 0 1 1.7.7l2-1.1 1.9 1.9-1.1 2a7 7 0 0 1 .7 1.7L21 11z"/></svg>';

    const panel = document.createElement('div');
    panel.className = 'lw-settings';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', COPY.settings);
    panel.hidden = true;

    const read = () => store.load(gameId, schema).settings;
    const apply = s => {
      document.documentElement.classList.toggle('lw-reduced-motion', !!s.reducedMotion);
      document.documentElement.classList.toggle('lw-contrast', !!s.highContrast);
    };
    const rows = [
      { key: 'muted', label: COPY.sound, invert: true },
      { key: 'reducedMotion', label: COPY.motion },
      { key: 'allModes', label: COPY.allModes },
      { key: 'highContrast', label: COPY.contrast }
    ].concat(extras || []);

    const render = () => {
      const s = read();
      panel.textContent = '';
      for (const row of rows) {
        const on = row.invert ? !s[row.key] : !!s[row.key];
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'lw-btn lw-switch';
        b.setAttribute('role', 'switch');
        b.setAttribute('aria-checked', on ? 'true' : 'false');
        b.dataset.key = row.key;
        const name = document.createElement('span'); name.textContent = row.label;
        const state = document.createElement('span'); state.className = 'lw-state'; state.textContent = on ? COPY.on : COPY.off;
        b.append(name, state);
        b.addEventListener('click', () => {
          const next = store.update(gameId, schema, rec => { rec.settings[row.key] = !rec.settings[row.key]; }).settings;
          apply(next); render();
          const again = panel.querySelector('[data-key="' + row.key + '"]');
          if (again) again.focus();
          if (onChange) onChange(next);
        });
        panel.append(b);
      }
      const clear = document.createElement('button');
      clear.type = 'button';
      clear.className = 'lw-btn lw-clear';
      clear.textContent = COPY.clear;
      let armed = false;
      clear.addEventListener('click', () => {
        if (!armed) { armed = true; clear.textContent = COPY.clearAgain; return; }
        store.clearGame(gameId);
        clear.textContent = COPY.cleared;
        apply(read());
        if (onChange) onChange(read());
      });
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'lw-btn lw-settings-close';
      close.textContent = COPY.close;
      close.addEventListener('click', () => api.close());
      panel.append(clear, close);
    };

    const api = {
      open() { render(); panel.hidden = false; const first = panel.querySelector('button'); if (first) first.focus(); },
      close() { panel.hidden = true; button.focus(); },
      get: read,
      button, panel
    };
    button.addEventListener('click', () => (panel.hidden ? api.open() : api.close()));
    panel.addEventListener('keydown', e => { if (e.key === 'Escape') api.close(); });
    store.watch(gameId, () => { apply(read()); if (!panel.hidden) render(); });
    apply(read());
    parent.append(button, panel);
    return api;
  }
};
