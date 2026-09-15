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
import { rng, migrate, parseConfig, adaptTier, adaptStaircase, lineGeometry, toNormalized, fromNormalized, hideNow,
  collectOnce, sessionStep, adaptClassify, buildQuery } from './pure.js?v=20260915a';
export { STAMP, rng, migrate, parseConfig, adaptTier, adaptStaircase, lineGeometry, toNormalized, fromNormalized, hideNow,
  collectOnce, sessionStep, adaptClassify, buildQuery };

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
  nearPrefix: 'close, ',
  isHere: ' is here',
  stone: 'Stone'
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

const make = (tag, cls) => { const e = document.createElement(tag); e.className = cls; return e; };
const clamp01 = x => Math.min(1, Math.max(0, x));
const reducedMotion = () => document.documentElement.classList.contains('lw-reduced-motion')
  || !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

/* ---- numberline (2.4) ---- */
/* An unmarked line drawn at the geometry pure.js chose for this round (N1), a
   stone a thumb drags or a keyboard moves, and a loupe floating above a TOUCH
   drag, because a thumb covers exactly the spot the child is judging. A mouse
   covers nothing, so it gets no loupe. The stone is a rounded square, never a
   circle (YONDER's Y1 rides on this renderer). */
export const numberline = {
  create({ container, geom, onCommit, keyStep = 0.01 }) {
    container.classList.add('lw-stage');
    const line = make('div', 'lw-line');
    line.style.left = (geom.offsetPct * 100) + '%';
    line.style.width = (geom.widthPct * 100) + '%';
    const end0 = make('span', 'lw-end lw-end-0'), end1 = make('span', 'lw-end lw-end-1');
    end0.textContent = '0'; end1.textContent = '1';
    line.append(end0, end1);
    const stone = make('div', 'lw-stone');
    stone.tabIndex = 0;
    stone.setAttribute('role', 'slider');
    stone.setAttribute('aria-label', COPY.stone);
    stone.setAttribute('aria-valuemin', '0');
    stone.setAttribute('aria-valuemax', '1');
    const loupe = make('div', 'lw-loupe'), lens = make('div', 'lw-lens'), lensLine = make('div', 'lw-lens-line'), lensDot = make('div', 'lw-lens-dot');
    loupe.hidden = true;
    lens.append(lensLine); loupe.append(lens, lensDot);
    container.append(line, stone, loupe);

    let value = 0, locked = false, drag = null;
    const LOUPE_W = 120, ZOOM = 2.5;
    const width = () => container.getBoundingClientRect().width;
    const place = () => {
      const W = width(), px = fromNormalized(value, geom, W);
      stone.style.left = px + 'px';
      stone.setAttribute('aria-valuenow', value.toFixed(2));
      if (!loupe.hidden) {
        loupe.style.left = Math.min(W - LOUPE_W / 2, Math.max(LOUPE_W / 2, px)) + 'px';
        lens.style.width = (W * ZOOM) + 'px';
        lensLine.style.left = (geom.offsetPct * W * ZOOM) + 'px';
        lensLine.style.width = (geom.widthPct * W * ZOOM) + 'px';
        lens.style.transform = 'translateX(' + (LOUPE_W / 2 - px * ZOOM + (parseFloat(loupe.style.left) - px)) + 'px)';
      }
    };
    const valueAt = clientX => {
      const r = container.getBoundingClientRect();
      return clamp01(toNormalized(clientX - r.left, geom, r.width));
    };
    const commit = () => {
      if (locked) return;
      locked = true;
      stone.classList.add('lw-locked');
      stone.setAttribute('aria-disabled', 'true');
      if (onCommit) onCommit(value);
    };
    stone.addEventListener('pointerdown', e => {
      if (locked) return;
      e.preventDefault();
      drag = { id: e.pointerId, touch: e.pointerType === 'touch' };
      try { stone.setPointerCapture(e.pointerId); } catch (err) { /* a synthetic pointer has nothing to capture */ }
      loupe.hidden = !drag.touch;
      place();
    });
    stone.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      value = valueAt(e.clientX);
      place();
    });
    const release = e => {
      if (!drag || e.pointerId !== drag.id) return;
      value = valueAt(e.clientX);
      drag = null;
      loupe.hidden = true;
      place();
      commit();
    };
    stone.addEventListener('pointerup', release);
    stone.addEventListener('pointercancel', e => { if (drag && e.pointerId === drag.id) { drag = null; loupe.hidden = true; } });
    stone.addEventListener('keydown', e => {
      if (locked) return;
      const step = e.shiftKey ? keyStep * 5 : keyStep;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') value = clamp01(value + step);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') value = clamp01(value - step);
      else if (e.key === 'Home') value = 0;
      else if (e.key === 'End') value = 1;
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); commit(); return; }
      else return;
      e.preventDefault();
      place();
    });
    place();
    return {
      line, stone,
      value: () => value,
      commit,
      destroy() { line.remove(); stone.remove(); loupe.remove(); }
    };
  }
};

/* ---- reveal (2.2) ---- */
/* The contract, all six rules:
   1. the child's mark goes down first and is never taken away;
   2. the truth comes second, beside it, never instead of it;
   3. the caption is a fact the game hands in (`3/4 is here`), never a verdict;
   4. the SAME animation on every path: `correct` and `near` are accepted and change
      nothing on the screen, only the caption the game wrote differs;
   5. a near miss is the game's to count, captioned with COPY.nearPrefix;
   6. no colour means right or wrong: every mark has one colour on every path.
   The truth's fade is a straight line in time from `truthAt`, which the returned
   state carries, so a gate can lay two rounds over each other. */
export const reveal = {
  show({ container, geom, learner, truth, caption, onTruth, onDone }) {
    const reduced = reducedMotion();
    const SETTLE = reduced ? 160 : TOKENS.motion.settle, REVEAL = reduced ? 240 : TOKENS.motion.reveal, HOLD = 400;
    const W = container.getBoundingClientRect().width;
    const lx = fromNormalized(learner, geom, W), tx = fromNormalized(truth, geom, W);
    const mine = make('div', 'lw-mark-learner');
    mine.style.left = lx + 'px';
    container.append(mine);
    const gap = make('div', 'lw-gap'), mark = make('div', 'lw-mark-truth'), cap = make('div', 'lw-caption');
    gap.style.left = Math.min(lx, tx) + 'px';
    gap.style.width = Math.abs(tx - lx) + 'px';
    for (const e of [gap, mark, cap]) e.style.opacity = '0';
    mark.style.left = tx + 'px';
    container.append(gap, mark, cap);
    const t0 = performance.now(), state = { truthAt: null, done: false };
    const step = now => {
      if (now - t0 >= SETTLE) {
        if (state.truthAt === null) {
          state.truthAt = t0 + SETTLE;
          cap.textContent = caption;
          const cw = cap.getBoundingClientRect().width;
          cap.style.left = Math.min(W - cw / 2, Math.max(cw / 2, tx)) + 'px';
          /* once, on the frame the truth begins: the one place a game hangs the reveal's single sound (A1) */
          if (onTruth) onTruth(state);
        }
        const p = Math.min(1, (now - state.truthAt) / REVEAL);
        gap.style.opacity = mark.style.opacity = cap.style.opacity = String(p);
        mark.style.transform = 'translateY(' + ((1 - p) * -12).toFixed(2) + 'px)';
      }
      if (now - t0 >= SETTLE + REVEAL + HOLD) {
        state.done = true;
        if (onDone) onDone(state);
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    return state;
  }
};

/* ---- audio (2.6, written fresh: RESONARC does not exist, plan 3.6) ---- */
/* A voice is { build(ac, out, t, rand) }: it makes its own nodes against the
   context it is handed, connects them to `out` (the master bus) and starts them
   at `t`. ⛔ A fresh GainNode's gain is ONE: every voice sets every gain it makes.
   ⛔ A1: one play is one sound. A game plays a voice once per EVENT and never once
   per thing counted, or a child counts by ear and the task is gone. Put that
   comment at every call site.
   Muted until the settings say otherwise (G12); fully playable muted (A2). */
function ear(buf) {
  const d = buf.getChannelData(0), sr = buf.sampleRate, n = d.length;
  const w0 = 2 * Math.PI * 3000 / sr, cw = Math.cos(w0), sw = Math.sin(w0), al = sw / (2 * 0.7071);
  const b0 = (1 + cw) / 2, b1 = -(1 + cw), b2 = (1 + cw) / 2, a0 = 1 + al, a1 = -2 * cw, a2 = 1 - al;
  let peak = 0, tot = 0, hi = 0, x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < n; i++) {
    const x = d[i], y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    const ax = Math.abs(x);
    if (ax > peak) peak = ax;
    tot += x * x; hi += y * y;
  }
  return { peak, rms: Math.sqrt(tot / n), highFraction: tot > 0 ? hi / tot : 0, seconds: n / sr };
}

export const audio = {
  voices: {},
  MASTER: 0.8,
  muted: true,
  log: [],
  ctx: null,
  bus: null,
  define(map) { Object.assign(this.voices, map); },
  setMuted(m) { this.muted = !!m; },
  isMuted() { return this.muted; },
  play(name) {
    if (this.muted) return false;
    const v = this.voices[name];
    if (!v) return false;
    if (!this.ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return false;
      this.ctx = new C();
    }
    const ac = this.ctx;
    if (ac.state === 'suspended') ac.resume();
    if (!this.bus) { this.bus = ac.createGain(); this.bus.gain.value = this.MASTER; this.bus.connect(ac.destination); }
    this.log.push(name);
    v.build(ac, this.bus, ac.currentTime + 0.01, Math.random);
    return true;
  },
  /* The loudest pattern a game can make, rendered offline through the SAME builders
     into a buffer, and measured: peak, rms, and the share of energy above 3 kHz.
     `pattern` is [[seconds, voice], ...]; `master` scales the bus so a gate can prove
     every voice goes through it. ⛔ The noise is seeded, so two renders hear the same
     noise and a differential between them means something (the Wardian scar). */
  renderLoud(pattern, seconds, master = 1) {
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OAC) return Promise.reject(new Error('no OfflineAudioContext'));
    const sr = 22050, octx = new OAC(1, Math.ceil(sr * seconds), sr);
    const bus = octx.createGain();
    bus.gain.value = this.MASTER * master;
    bus.connect(octx.destination);
    const noise = rng(97);
    for (const [t, name] of pattern) {
      const v = this.voices[name];
      if (v && t < seconds) v.build(octx, bus, t, noise);
    }
    return octx.startRendering().then(ear);
  }
};

/* ---- schedule (2.5) ---- */
/* S1: a flash runs on animation frames against a measured deadline, never a timer,
   because a 400 ms flash that shows for 900 ms on a slow Chromebook turns a
   subitizing game into a counting game. The stimulus goes up in `onShow` on one
   frame and the paint is stamped on the NEXT frame; each later frame asks `hideNow`
   whether hiding now paints nearer the deadline than hiding a frame later would,
   judged by where that paint will land (this frame plus one interval).
   S2: `shownAt` is the paint stamp, so reaction time measured from it does not
   include a slow render. `onPainted(shownAt, requestedAt)` hands it over the moment
   it is known.
   S3: a timed presentation is followed by a mask; `onMasked` runs on the same frame
   as `onHide`, and a flash without one says so on the console. */
export const schedule = {
  now: () => performance.now(),
  flash({ durationMs, onShow, onHide, onMasked, onPainted }) {
    if (!onMasked) console.warn('schedule.flash called without onMasked: a timed presentation is followed by a mask (S3)');
    const requestedAt = performance.now(), deltas = [];
    const interval = () => {
      if (!deltas.length) return 16.7;
      const d = deltas.slice().sort((a, b) => a - b);
      return d[Math.floor(d.length / 2)];
    };
    return new Promise(resolve => {
      let phase = 'show', last = null, shownAt = null, deadline = 0;
      const frame = t => {
        if (last !== null) deltas.push(t - last);
        last = t;
        if (phase === 'show') {
          if (onShow) onShow();
          phase = 'painting';
        } else if (phase === 'painting') {
          shownAt = t; deadline = t + durationMs; phase = 'showing';
          if (onPainted) onPainted(shownAt, requestedAt);
        } else if (phase === 'showing') {
          const iv = interval();
          if (hideNow(t + iv, deadline, iv)) {
            if (onHide) onHide();
            if (onMasked) onMasked();
            phase = 'hiding';
          }
        } else {
          resolve({ requestedAt, shownAt, hiddenAt: t, maskedAt: onMasked ? t : null, interval: interval() });
          return;
        }
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });
  }
};

/* ---- sprite (plan 3.9; CATALOG-PLAN section 5) ---- */
/* A sprite is an array of strings, one character per pixel: a hex digit naming a colour in
   the game's palette (16 at most) or `.` for clear. It is drawn at a WHOLE number scale on
   whole pixels with smoothing off, because a fractional scale or position shimmers and blurs,
   which is how pixel art stops being pixel art. The whole grid is checked before anything is
   drawn, so a malformed sprite throws and leaves the canvas as it was. */
export const sprite = {
  draw(ctx, grid, palette, x, y, scale) {
    if (!Number.isInteger(scale) || scale < 1) throw new Error('sprite.draw needs a whole number scale, not ' + scale);
    const width = grid.length ? grid[0].length : 0;
    for (const row of grid) {
      if (row.length !== width) throw new Error('sprite.draw needs every row of a sprite the same length');
    }
    const colours = grid.map(row => Array.from(row).map(ch => {
      if (ch === '.') return null;
      const i = parseInt(ch, 16);
      if (!(i >= 0) || i >= palette.length) throw new Error('sprite.draw has no colour ' + ch + ' in a palette of ' + palette.length);
      return palette[i];
    }));
    ctx.imageSmoothingEnabled = false;
    const ox = Math.round(x), oy = Math.round(y);
    colours.forEach((row, ry) => row.forEach((c, rx) => {
      if (c === null) return;
      ctx.fillStyle = c;
      ctx.fillRect(ox + rx * scale, oy + ry * scale, scale, scale);
    }));
  }
};
