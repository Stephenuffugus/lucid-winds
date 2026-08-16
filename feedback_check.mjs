#!/usr/bin/env node
/* ============================================================================
   FEEDBACK FAB CHECK  —  feedback_check.mjs
   ----------------------------------------------------------------------------
   WHY THIS EXISTS
   feedback.js is loaded by every game on lucidwinds.com. On 2026-08-16 its fab
   was caught, in screenshots, sitting on top of three different games' own
   controls: Vine Runner's primary RUN button (on a full-screen sheet), Sprout
   Dice's "All Sky Wolf games" (on a title screen), and Bramblewick's "Reduced
   motion" toggle (ordinary page content in a scrolling list — no overlay at
   all). One cause, three page shapes. The fix is a detector inside feedback.js
   that moves the fab off whatever is underneath it.

   There is no browser on this box (ten agents, two cores; the main loop owns
   browser work), so this file does the two things source CAN prove:

     PART 1  SOURCE — the geometry the CSS declares, that the detector is
             wrapped, that failure restores the fab, that the invisible state
             has a hard ceiling.

     PART 2  BEHAVIOUR — a stub DOM, and the REAL feedback.js executed inside it
             with node:vm. Not a mirror of the logic — the file itself. (The
             rarity sim drifted from live code twice by being hand-mirrored;
             that is not happening here.) Synthetic pages are driven through it
             and the fab's state asserted.

   THE STUB'S HIT TEST IS DELIBERATELY GENEROUS: document.elementsFromPoint here
   returns every element whose rect contains the point, with NO visibility
   filtering, ordered by z then depth. A real browser filters display:none,
   opacity:0 and pointer-events:none for you. Making the stub generous means the
   visibility decisions under test belong to feedback.js and not to this file —
   a display:none sheet is handed to the detector with a full-viewport rect, and
   the detector still has to reject it on its own.

   WHAT THIS CANNOT PROVE: what it LOOKS like. Whether the parked chip reads as
   deliberate or as a bug, whether the fade is the right length, and whether a
   canvas-PAINTED button (which has no DOM node and cannot be hit-tested) is
   under the fab. Those need eyes on a device.

   USAGE
     node feedback_check.mjs              # run every check
     node feedback_check.mjs --verbose    # show each check
     node feedback_check.mjs --self-test  # break the code on purpose, prove red
   Exit 0 only when every check passes.
   ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC_PATH = path.join(HERE, 'feedback.js');
const SRC = fs.readFileSync(SRC_PATH, 'utf8');
const VERBOSE = process.argv.includes('--verbose');
const SELFTEST = process.argv.includes('--self-test');

/* ══ check collector ═══════════════════════════════════════════════════════ */
function Runner() {
  const rows = [];
  return {
    rows,
    ok(id, cond, detail) { rows.push({ id, pass: !!cond, detail: detail || '' }); return !!cond; },
    eq(id, got, want, detail) {
      const pass = String(got) === String(want);
      rows.push({ id, pass, detail: pass ? (detail || `= ${want}`) : `got ${got}, want ${want}${detail ? ' — ' + detail : ''}` });
      return pass;
    },
    failed() { return rows.filter(r => !r.pass); }
  };
}

/* ══ PART 1 — the geometry the source declares ═════════════════════════════ */
// Everything the stub assumes about size and position is READ OUT OF THE CSS in
// feedback.js. If someone retunes the fab, this parse moves with it or dies.
function geometry(src) {
  const g = {};
  const pick = (re, name, unit = true) => {
    const m = re.exec(src);
    if (!m) throw new Error(`geometry: could not read ${name} from feedback.js`);
    return parseFloat(m[1]);
  };
  const fabRule = /\.lwfb-fab\{([^}]*)\}/.exec(src);
  if (!fabRule) throw new Error('geometry: no .lwfb-fab rule');
  g.fabRight = parseFloat(/right:(-?\d+)px/.exec(fabRule[1])[1]);
  g.fabMinH = parseFloat(/min-height:(\d+)px/.exec(fabRule[1])[1]);
  g.fabZ = parseFloat(/z-index:(\d+)/.exec(fabRule[1])[1]);
  const miniRule = /\.lwfb-fab\.lwfb-mini\{([^}]*)\}/.exec(src);
  if (!miniRule) throw new Error('geometry: no .lwfb-fab.lwfb-mini rule');
  g.miniW = parseFloat(/width:(\d+)px/.exec(miniRule[1])[1]);
  g.miniBottom = parseFloat(/bottom:calc\((\d+)px/.exec(miniRule[1])[1]);
  const badgeRule = /\.lwfb-fab-x\{([^}]*)\}/.exec(src);
  if (!badgeRule) throw new Error('geometry: no .lwfb-fab-x rule');
  g.badgeTop = parseFloat(/top:(-?\d+)px/.exec(badgeRule[1])[1]);
  g.badgeLeft = parseFloat(/left:(-?\d+)px/.exec(badgeRule[1])[1]);
  g.badgeW = parseFloat(/width:(\d+)px/.exec(badgeRule[1])[1]);
  g.badgeH = parseFloat(/height:(\d+)px/.exec(badgeRule[1])[1]);
  const dotRule = /\.lwfb-fab-x span\{([^}]*)\}/.exec(src);
  g.dotW = dotRule ? parseFloat(/width:(\d+)px/.exec(dotRule[1])[1]) : 0;
  // union footprint of the mini fab + its badge, in px
  g.unionW = Math.max(g.miniW, g.miniW + Math.max(0, -g.badgeLeft));
  g.unionH = Math.max(g.miniW, g.miniW + Math.max(0, -g.badgeTop));
  return g;
}

function sourceChecks(R, src) {
  let g = null;
  try { g = geometry(src); } catch (e) { R.ok('geom.parse', false, e.message); return null; }
  R.ok('geom.parse', true, `fab ${g.miniW}px @right:${g.fabRight} bottom:${g.miniBottom}, badge ${g.badgeW}px @${g.badgeLeft}/${g.badgeTop}, dot ${g.dotW}px`);

  // Rule 11 of CLAUDE.md: 48px minimum touch targets. The dismiss badge is a
  // real target and must not be shrunk below it to solve the footprint.
  R.ok('geom.badge48', g.badgeW >= 48 && g.badgeH >= 48,
    `badge tap zone ${g.badgeW}x${g.badgeH} (must stay >= 48)`);
  R.ok('geom.fab48', g.miniW >= 48 && g.fabMinH >= 48, `fab ${g.miniW}x${g.fabMinH}`);
  // The old geometry: 48px badge at -30 (mini) / -34 (pill) => 78x78 / 82x82.
  R.ok('geom.footprintShrunk', g.unionW <= 74 && g.unionH <= 74,
    `footprint ${g.unionW}x${g.unionH} (was 78x78 mini / 82x82 pill)`);
  // Phantom reach = how far the tap zone extends past the thing the eye sees.
  const phantom = Math.max(0, -g.badgeLeft) - (g.dotW - g.badgeW / 2 > 0 ? 0 : (g.badgeW - g.dotW) / 2);
  const reachPastDot = Math.max(0, -g.badgeLeft) - (g.badgeW - g.dotW) / 2;
  R.ok('geom.phantomReach', reachPastDot <= 16,
    `tap zone reaches ${reachPastDot}px past the visible dot (was 30px)`);
  R.ok('geom.oneBadgeRule', !/lwfb-mini \.lwfb-fab-x/.test(src),
    'one badge rule for every surface (the mini override is gone)');

  // The detector itself.
  R.ok('src.tryCatch', /function fyTick\(\)[\s\S]{0,300}?try \{[\s\S]{0,120}?catch \(e\) \{ fyOnError\(e\); \}/.test(src),
    'the scan runs inside try/catch');
  R.ok('src.failOpenRestores', /function fyOnError[\s\S]{0,420}?fyGoHome\(w\)/.test(src),
    'a throw restores the fab before anything else');
  R.ok('src.failOpenRetires', /function fyOnError[\s\S]{0,600}?errRun >= FY\.ERR_MAX[\s\S]{0,120}?w\.off = true/.test(src),
    'repeated throws retire the watcher (degrades to the old behaviour)');
  R.ok('src.killSwitch', /window\.LW_FB_NO_YIELD === true/.test(src),
    'window.LW_FB_NO_YIELD turns the whole thing off');
  const ceilM = /HIDDEN_MAX_MS:\s*(\d+)/.exec(src);
  R.ok('src.ceiling', !!ceilM && Number(ceilM[1]) <= 30000 &&
    /hiddenAt && \(Date\.now\(\) - w\.hiddenAt\) >= FY\.HIDDEN_MAX_MS[\s\S]{0,80}?fyGoHome\(w\)/.test(src),
    `the invisible state has a hard ceiling that ends in fyGoHome (${ceilM ? ceilM[1] : '?'}ms, must be <= 30000 — ` +
    'a ceiling nobody lives to see is not a ceiling)');
  R.ok('src.noDisplayNone', !/style\.display = 'none'/.test(src),
    'yielding never writes display:none (the box stays measurable, and if the ' +
    'stylesheet never landed the fab simply stays visible)');
  R.ok('src.hideRuleExists', /\.lwfb-fab\[data-lwfb-yield="1"\]\{[^}]*opacity:0/.test(src),
    'the data-lwfb-yield attribute is what the CSS hides');
  R.ok('src.noMutationObserver', !/new MutationObserver/.test(src),
    'no MutationObserver (a game mutating its HUD every frame would storm it)');
  R.ok('src.noDocWideQuery', !/document\.querySelectorAll/.test(src),
    'no document-wide query in the scan (cost must not scale with page size)');
  R.ok('src.idleBackoff', /IDLE_MS:\s*2000/.test(src) && /ACTIVE_MS:\s*600/.test(src),
    'idle pages back off to a 2s heartbeat');
  R.ok('src.scrollWakes', /'scroll'/.test(src) && /passive: true/.test(src),
    'scroll wakes the scanner, passively — the Bramblewick shape has no overlay ' +
    'and nothing but a scroll to notice');
  R.ok('src.pausesWhenHidden', /document\.hidden === true/.test(src),
    'a hidden tab is not scanned');
  // Specifically the scan's stand-down, not just any mention of the id —
  // close() greps the same string, so a loose match here stayed green when the
  // stand-down was deleted outright.
  R.ok('src.pausesForOwnForm', /getElementById\('lwfb-bg'\)\) return \{ skip: 'form-open' \}/.test(src),
    'our own panel is never treated as a game overlay');
  try {
    new vm.Script(src, { filename: 'feedback.js' });
    R.ok('src.parses', true, 'vm.Script parses the file');
  } catch (e) { R.ok('src.parses', false, e.message); }
  // Strip comments first. A block comment reading "6 stops per edge => 24
  // candidates" is not an arrow function, and a checker that says it is gets
  // ignored — the same lesson the service-worker audit learned when workers
  // that EXPLAINED a bug in their header were reported as having it.
  const code = src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  R.ok('src.es5', !/\b(const|let)\s+[A-Za-z_$]/.test(code) && !/=>/.test(code),
    'ES5 only (CLAUDE.md rule 14), comments stripped before looking');
  return g;
}

/* ══ PART 2 — a DOM stub, and the real file run inside it ══════════════════ */

function makePage(g, opts = {}) {
  const vw = opts.vw || 390, vh = opts.vh || 844;
  let hitCount = 0;

  // A style object that REMEMBERS ITS WRITES. Needed because the difference
  // between a move and a teleport is not the final value — it is whether the
  // start value was pinned in px first, and after the fact both look identical.
  // The order of writes is the only evidence.
  const mkStyle = (log) => {
    const back = { left: '', top: '', right: '', bottom: '', display: '', visibility: '', opacity: '', pointerEvents: '', zIndex: '', transition: '' };
    const o = {};
    for (const k of Object.keys(back)) {
      Object.defineProperty(o, k, {
        enumerable: true,
        get() { return back[k]; },
        set(v) { back[k] = v; log.push({ prop: k, value: v }); }
      });
    }
    return o;
  };

  function El(tag, spec = {}) {
    const e = {
      tagName: String(tag).toUpperCase(),
      children: [], parentNode: null, ownerDocument: null,
      _writes: [], _attrs: Object.create(null), _cs: spec.cs || {},
      _rect: spec.rect || null, _lis: Object.create(null),
      id: spec.id || '', className: spec.className || '',
      textContent: '', onclick: spec.onclick || null,
      set innerHTML(_v) { /* the form is not under test */ },
      get innerHTML() { return ''; },
      appendChild(c) { c.parentNode = e; e.children.push(c); return c; },
      removeChild(c) { const i = e.children.indexOf(c); if (i >= 0) e.children.splice(i, 1); c.parentNode = null; return c; },
      setAttribute(n, v) { e._attrs[n] = String(v); },
      getAttribute(n) { return n in e._attrs ? e._attrs[n] : null; },
      removeAttribute(n) { delete e._attrs[n]; },
      hasAttribute(n) { return n in e._attrs; },
      addEventListener(t, fn) { (e._lis[t] = e._lis[t] || []).push(fn); },
      removeEventListener(t, fn) { const a = e._lis[t] || []; const i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); },
      contains(o) { let n = o; while (n) { if (n === e) return true; n = n.parentNode; } return false; },
      getBoundingClientRect() { return rectOf(e); },
      get offsetWidth() { return rectOf(e).width; },
      get offsetHeight() { return rectOf(e).height; },
      classList: {
        add(c) { if (!hasClass(e, c)) e.className = (e.className + ' ' + c).trim(); },
        remove(c) { e.className = e.className.split(/\s+/).filter(x => x && x !== c).join(' '); },
        contains(c) { return hasClass(e, c); },
        toggle(c) { hasClass(e, c) ? e.classList.remove(c) : e.classList.add(c); }
      }
    };
    e.style = mkStyle(e._writes);
    return e;
  }
  const hasClass = (e, c) => (' ' + (e.className || '') + ' ').indexOf(' ' + c + ' ') > -1;

  // Rects. The fab and its badge are resolved from the CSS numbers parsed out
  // of feedback.js plus whatever inline styles the code under test has written,
  // so the stub cannot drift from the file it is testing.
  function rectOf(e) {
    let r;
    if (hasClass(e, 'lwfb-fab-x') && e.parentNode) {
      // parked => the stylesheet hides the badge, so it has no footprint
      if (e.parentNode.getAttribute('data-lwfb-parked') === '1') return { left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 };
      const p = rectOf(e.parentNode);
      r = { left: p.left + g.badgeLeft, top: p.top + g.badgeTop, width: g.badgeW, height: g.badgeH };
    } else if (e.tagName === 'SPAN' && e.parentNode && hasClass(e.parentNode, 'lwfb-fab-x')) {
      // The visible dot. A bare <span> with NO CLASS — which is exactly why a
      // self-exclusion filter that tests the returned node's className misses
      // it. It must be in the hit test for S14 to mean anything.
      const b = rectOf(e.parentNode);
      if (!b.width) return { left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 };
      r = { left: b.left + (g.badgeW - g.dotW) / 2, top: b.top + (g.badgeH - g.dotW) / 2, width: g.dotW, height: g.dotW };
    } else if (hasClass(e, 'lwfb-fab')) {
      const w = g.miniW, h = g.miniW;
      const num = v => (v === '' || v == null || v === 'auto') ? null : parseFloat(v);
      let left = num(e.style.left), top = num(e.style.top);
      const right = num(e.style.right), bottom = num(e.style.bottom);
      if (left == null) left = right != null ? vw - right - w : vw - g.fabRight - w;
      if (top == null) top = bottom != null ? vh - bottom - h : vh - g.miniBottom - h;
      r = { left, top, width: w, height: h };
    } else if (e._rect) {
      r = e._rect;
    } else {
      r = { left: 0, top: 0, width: 0, height: 0 };
    }
    return { left: r.left, top: r.top, width: r.width, height: r.height, right: r.left + r.width, bottom: r.top + r.height };
  }

  const doc = {
    hidden: false,
    _lis: Object.create(null),
    createElement: (t) => El(t),
    addEventListener(t, fn) { (doc._lis[t] = doc._lis[t] || []).push(fn); },
    removeEventListener() {},
    getElementById(id) { return find(n => n.id === id); },
    querySelector(sel) {
      if (sel.charAt(0) === '.') return find(n => hasClass(n, sel.slice(1)));
      if (sel.charAt(0) === '#') return find(n => n.id === sel.slice(1));
      return find(n => n.tagName === sel.toUpperCase());
    },
    elementsFromPoint(x, y) {
      hitCount++;
      const hits = [];
      let order = 0;
      (function walk(n, depth, z) {
        const zz = zIndexOf(n, z);
        const seq = order++;
        const r = rectOf(n);
        if (r.width > 0 && r.height > 0 && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) hits.push({ n, seq, z: zz });
        // Generous, but not dishonest: a hidden element is still handed to the
        // detector with its full rect (harsher than any browser, so the
        // detector's own visibility gate has to do the work) — but we do NOT
        // descend into a hidden subtree and invent a visible button inside it,
        // because no browser has ever done that and no code should have to
        // defend against it.
        const st = cs(n);
        if (st.display === 'none' || st.visibility === 'hidden') return;
        for (const c of n.children) walk(c, depth + 1, zz);
      })(html, 0, 0);
      // Paint order, topmost first: higher z-index wins, and within the same z
      // the LATER element in document order paints on top — which is also true
      // of a child versus its parent, since pre-order numbering puts the child
      // after. Sorting by depth instead (the first version of this file) makes
      // two full-bleed siblings come back in the wrong order and had the
      // detector reading a game wrapper as the thing on top of a settings list.
      hits.sort((a, b) => (b.z - a.z) || (b.seq - a.seq));
      return hits.map(h => h.n);
    }
  };
  function zIndexOf(n, inherited) {
    const v = parseInt(n.style.zIndex || (n._cs && n._cs.zIndex), 10);
    return Number.isFinite(v) ? v : inherited;
  }
  function find(pred) {
    let hit = null;
    (function walk(n) { if (hit) return; if (pred(n)) { hit = n; return; } for (const c of n.children) walk(c); })(html);
    return hit;
  }

  const html = El('html', { rect: { left: 0, top: 0, width: vw, height: vh } });
  const head = El('head');
  const body = El('body', { rect: { left: 0, top: 0, width: vw, height: vh } });
  html.appendChild(head); html.appendChild(body);
  doc.documentElement = html; doc.head = head; doc.body = body;

  const cs = (el) => Object.assign(
    { display: 'block', visibility: 'visible', opacity: '1', pointerEvents: 'auto', cursor: 'auto' },
    el._cs || {},
    Object.fromEntries(Object.entries(el.style || {}).filter(([, v]) => v !== ''))
  );

  return {
    vw, vh, doc, body, El, hasClass, rectOf,
    getComputedStyle: cs,
    hits: () => hitCount,
    resetHits: () => { hitCount = 0; },
    add(parent, tag, spec) { const e = El(tag, spec); parent.appendChild(e); return e; }
  };
}

function boot(page, src = SRC, extra = {}) {
  const timers = new Map();
  let tid = 0;
  const clock = { t: 1700000000000 };
  const winLis = Object.create(null);
  const store = () => {
    const m = new Map();
    return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) };
  };
  const sandbox = {
    document: page.doc,
    innerWidth: page.vw, innerHeight: page.vh,
    getComputedStyle: page.getComputedStyle,
    localStorage: store(), sessionStorage: store(),
    setTimeout: (fn, ms) => { const id = ++tid; timers.set(id, { fn, ms }); return id; },
    clearTimeout: (id) => { timers.delete(id); },
    addEventListener: (t, fn) => { (winLis[t] = winLis[t] || []).push(fn); },
    removeEventListener: () => {},
    XMLHttpRequest: function () {},
    console
  };
  Object.assign(sandbox, extra);
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  vm.createContext(sandbox);
  sandbox.__nowFn = () => clock.t;
  vm.runInContext('Date.now = function(){ return __nowFn(); };', sandbox);
  new vm.Script(src, { filename: 'feedback.js' }).runInContext(sandbox);
  sandbox.LW_Feedback.mountFab({ game: 'check', surface: 'satellite' });
  const fab = page.doc.querySelector('.lwfb-fab');
  return {
    sandbox, fab, clock, timers, winLis,
    api: sandbox.LW_Feedback._fab,
    fire(type, ev) { for (const fn of (winLis[type] || [])) fn(Object.assign({ type }, ev)); },
    fireEl(el, type, ev) { for (const fn of (el._lis[type] || [])) fn(Object.assign({ type }, ev)); },
    // Run pending timers shorter than `maxMs` — the settle hand-back (260ms)
    // without also firing the scan reschedule (600ms+).
    flush(maxMs) {
      for (const [id, t] of [...timers]) {
        if (t.ms <= maxMs) { timers.delete(id); t.fn(); }
      }
    },
    scan() { return sandbox.LW_Feedback._fab.scan(); },
    tick() { return sandbox.LW_Feedback._fab.tick(); },
    state() { return sandbox.LW_Feedback._fab.state(); },
    union() {
      const f = page.rectOf(fab);
      const b = fab.children.find(c => page.hasClass(c, 'lwfb-fab-x'));
      const br = (b && page.rectOf(b).width > 0) ? page.rectOf(b) : f;
      return {
        left: Math.min(f.left, br.left), top: Math.min(f.top, br.top),
        right: Math.max(f.right, br.right), bottom: Math.max(f.bottom, br.bottom)
      };
    },
    visible() { return fab.getAttribute('data-lwfb-yield') !== '1' && !!fab.parentNode; }
  };
}

const overlaps = (a, b) => !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);

/* ── page shapes, drawn from the three games actually seen on screen ─────── */

// A canvas game with nothing over it. Nothing may happen here, ever.
function pagePlain(g) {
  const p = makePage(g);
  const wrap = p.add(p.body, 'div', { id: 'wrap', rect: { left: 0, top: 0, width: p.vw, height: p.vh } });
  p.add(wrap, 'canvas', { rect: { left: 0, top: 0, width: p.vw, height: p.vh } });
  return p;
}

// Vine Runner / Sprout Dice: a full-screen sheet layered over the game, with a
// primary button across the bottom — right where the fab lives.
function pageSheet(g, { display = 'block' } = {}) {
  const p = pagePlain(g);
  const sheet = p.add(p.body, 'div', {
    id: 'how', cs: { zIndex: '120', display },
    rect: { left: 0, top: 0, width: p.vw, height: p.vh }
  });
  const card = p.add(sheet, 'div', { rect: { left: 16, top: 80, width: p.vw - 32, height: p.vh - 200 } });
  p.add(card, 'button', { id: 'close', className: 'x', rect: { left: p.vw - 60, top: 90, width: 44, height: 44 } });
  const run = p.add(sheet, 'button', {
    id: 'run', className: 'primary',
    rect: { left: 24, top: p.vh - 150, width: p.vw - 48, height: 62 }
  });
  return Object.assign(p, { sheet, run });
}

// Bramblewick: NO overlay. A settings row in a long scrolling list has simply
// scrolled into the bottom-right corner and landed under the fab.
function pageScrolledControl(g) {
  const p = pagePlain(g);
  const list = p.add(p.body, 'div', { id: 'settings', rect: { left: 0, top: 0, width: p.vw, height: p.vh * 3 } });
  for (let i = 0; i < 8; i++) {
    p.add(list, 'div', { className: 'row', rect: { left: 12, top: 60 + i * 84, width: p.vw - 24, height: 64 } });
  }
  // the one that scrolled into the corner
  const toggle = p.add(list, 'div', {
    className: 'row toggle', cs: { cursor: 'pointer' },
    rect: { left: 12, top: p.vh - 140, width: p.vw - 24, height: 56 }
  });
  return Object.assign(p, { toggle });
}

function scenarioChecks(R, g, src = SRC) {
  /* S1 — a plain canvas game. The fab must not move, fade, or think. */
  {
    const p = pagePlain(g);
    const s = boot(p, src);
    const before = { ...p.rectOf(s.fab) };
    p.resetHits();
    s.scan(); s.scan();
    const after = p.rectOf(s.fab);
    R.eq('S1.state', s.state(), 'home', 'no overlay, no controls');
    R.ok('S1.stillThere', s.visible(), 'fab visible');
    R.ok('S1.didNotMove', before.left === after.left && before.top === after.top,
      `${before.left},${before.top} -> ${after.left},${after.top}`);
    R.ok('S1.cheap', p.hits() <= 10, `${p.hits()} hit tests for 2 scans (<=5 each)`);
  }

  /* S1b — a full-bleed wrapper with cursor:pointer (a tap-anywhere game). The
     size guard must stop that reading as a button, or the fab hides on the
     whole page. This is the false positive that would break the fab's job. */
  {
    const p = makePage(g);
    p.add(p.body, 'div', { id: 'tapzone', cs: { cursor: 'pointer' }, rect: { left: 0, top: 0, width: p.vw, height: p.vh } });
    const s = boot(p, src);
    s.scan();
    R.eq('S1b.fullBleedPointerIsNotAButton', s.state(), 'home', 'cursor:pointer on a full-width element is a background');
  }

  /* S2 — Vine Runner. Sheet open, primary button under the fab. */
  {
    const p = pageSheet(g);
    const s = boot(p, src);
    const homeUnion = s.union();
    R.ok('S2.setupIsReal', overlaps(homeUnion, p.rectOf(p.run)),
      'the fab really does overlap RUN before the fix runs (if this is false the ' +
      'whole scenario proves nothing)');
    s.scan();
    R.ok('S2.yielded', s.state() !== 'home', `state ${s.state()}`);
    R.ok('S2.offTheButton', !overlaps(s.union(), p.rectOf(p.run)),
      `parked union ${JSON.stringify(s.union())} vs RUN ${JSON.stringify(p.rectOf(p.run))}`);
    R.ok('S2.offEveryControl',
      !overlaps(s.union(), p.rectOf(p.doc.getElementById('close'))), 'and off the sheet close ✕');
    R.ok('S2.stillReportable', s.visible() && s.state() === 'parked',
      'a tester can still report a bug: it parked, it did not vanish');
  }

  /* S2b — the search is bounded. It sifts a whole ring with one probe each and
     then spends the 5-probe test on the best few, so it must stay in the low
     hundreds of hit tests for ONE yield, and drop back to 5 per scan once it
     has settled. A search that costs more the busier the page gets would be a
     frame-rate bug hiding inside a cosmetic fix. */
  {
    const p = pageSheet(g);
    const s = boot(p, src);
    p.resetHits();
    s.scan();
    const yieldCost = p.hits();
    R.ok('S2b.searchBounded', yieldCost <= 250, `${yieldCost} hit tests for the whole search`);
    p.resetHits();
    s.scan();
    R.ok('S2b.settledIsCheap', p.hits() <= 10,
      `${p.hits()} hit tests on the next scan once parked (no re-search while nothing changes)`);
  }

  /* S3 — the sheet closes. Everything must come back exactly as it was. */
  {
    const p = pageSheet(g);
    const s = boot(p, src);
    const homeRect = { ...p.rectOf(s.fab) };
    s.scan();
    R.ok('S3.yieldedFirst', s.state() === 'parked', `state ${s.state()}`);
    p.sheet._cs.display = 'none';
    s.scan();
    R.eq('S3.hysteresis', s.state(), 'parked', 'one clear scan is not enough (anti-flicker)');
    s.scan();
    R.eq('S3.cameHome', s.state(), 'home');
    const back = p.rectOf(s.fab);
    R.ok('S3.exactPosition', back.left === homeRect.left && back.top === homeRect.top,
      `${back.left},${back.top} vs ${homeRect.left},${homeRect.top}`);
    // The return is animated too, so it lands on px coords first and hands the
    // position back to the stylesheet once the move has played. Same pixels
    // either way — but if that hand-back never ran, safe-area insets and
    // rotation would stop working, so it is worth proving it happens.
    R.ok('S3.animatedReturn', /px$/.test(s.fab.style.left), 'returns in px so the move can be seen');
    s.flush(400);
    R.ok('S3.noInlineResidue', s.fab.style.left === '' && s.fab.style.top === '' &&
      s.fab.style.right === '' && s.fab.style.bottom === '', 'then the stylesheet takes back over');
    const settled = p.rectOf(s.fab);
    R.ok('S3.settleIsInvisible', settled.left === homeRect.left && settled.top === homeRect.top,
      'and the hand-back does not move it by a pixel');
    R.ok('S3.visibleAgain', s.visible(), 'not left faded');
  }

  /* S4 — a sheet that exists but is display:none. The stub hands it over with a
     full-viewport rect on purpose, so rejecting it is feedback.js's own work. */
  {
    const p = pageSheet(g, { display: 'none' });
    const s = boot(p, src);
    R.ok('S4.stubIsGenerous', p.rectOf(p.sheet).width === p.vw,
      'the hidden sheet still measures full-viewport in the stub');
    s.scan(); s.scan();
    R.eq('S4.ignored', s.state(), 'home', 'display:none is not in anybody\'s way');
    R.ok('S4.stillThere', s.visible(), 'fab visible');
  }

  /* S4c — a hidden modal with NO controls in it. S4 above cannot see the
     visibility gate do its work: the stub refuses to hand over buttons inside a
     display:none subtree (no browser does), so the sheet's own children never
     reach the detector and S4 passes even with the gate ripped out. This one
     puts the hidden element itself in the firing line — it is the only thing
     that could block, so rejecting it has to be feedback.js's own decision. */
  {
    const p = pagePlain(g);
    p.add(p.body, 'div', {
      id: 'ghost', cs: { zIndex: '99', display: 'none' },
      rect: { left: 0, top: 0, width: p.vw, height: p.vh }
    });
    const s = boot(p, src);
    s.scan(); s.scan();
    R.eq('S4c.hiddenModalIgnored', s.state(), 'home', 'display:none, no children — nothing to yield to');
  }

  /* S4b — the hues/budburst shape: an inactive .screen that is still painted,
     at opacity 0 with pointer-events:none. Also not in the way. */
  {
    const p = pagePlain(g);
    p.add(p.body, 'div', {
      id: 'screen', cs: { zIndex: '30', opacity: '0', pointerEvents: 'none' },
      rect: { left: 0, top: 0, width: p.vw, height: p.vh }
    });
    const s = boot(p, src);
    s.scan(); s.scan();
    R.eq('S4b.inertScreenIgnored', s.state(), 'home', 'opacity:0 + pointer-events:none is inert');
  }

  /* S4d — a full-bleed HUD layer, pointer-events:none, fully opaque. Extremely
     common (score/vignette layers sit over the canvas exactly like this) and it
     is layered over real content, so the cover rule WOULD fire on it. It cannot
     receive a tap, so the fab is not stealing anything and must stay put.
     Separate from S4b because S4b's screen is inert two ways (opacity AND
     pointer-events) and so cannot tell which gate is doing the work. */
  {
    const p = pagePlain(g);
    p.add(p.body, 'div', {
      id: 'hudlayer', cs: { zIndex: '40', pointerEvents: 'none' },
      rect: { left: 0, top: 0, width: p.vw, height: p.vh }
    });
    const s = boot(p, src);
    s.scan(); s.scan();
    R.eq('S4d.untappableLayerIgnored', s.state(), 'home', 'pointer-events:none cannot take a tap from us');
  }

  /* S4e — THE SHOT THE COORDINATOR TOOK. Bramblewick's real shape: a narrow
     centred panel with dark page either side of it, and body text inside it.
     The first version of this fix parked mid-left and STRADDLED the panel's
     left edge — half the circle on the panel, half on the page behind, across a
     line of body text. Not on a control, so it obeyed the rule, and it looked
     like a rendering fault. The parked chip must now end up wholly inside the
     panel or wholly outside it, and never on the text. */
  {
    const p = makePage(g);
    const page = p.add(p.body, 'div', { id: 'page', rect: { left: 0, top: 0, width: p.vw, height: p.vh } });
    const panel = p.add(page, 'div', {
      id: 'panel', cs: { zIndex: '10' },
      rect: { left: 60, top: 40, width: p.vw - 120, height: p.vh - 80 }
    });
    // body copy filling most of the panel, and the control that started it all
    const copy = p.add(panel, 'p', { id: 'copy', rect: { left: 76, top: 300, width: p.vw - 152, height: 220 } });
    const toggle = p.add(panel, 'div', {
      className: 'row', cs: { cursor: 'pointer' },
      rect: { left: 76, top: p.vh - 190, width: p.vw - 152, height: 56 }
    });
    const s = boot(p, src);
    R.ok('S4e.setupIsReal', overlaps(s.union(), p.rectOf(toggle)), 'fab starts on the toggle');
    s.scan();
    R.ok('S4e.yielded', s.state() !== 'home', `state ${s.state()}`);
    // THE VERDICT THAT CHANGED. This layout has nowhere good: the gutters are
    // narrower than the chip and everything inside the panel is a word. Round 3
    // parked dead centre on a label because a "best available" fallback took the
    // least-bad spot. There is no fallback now — fading is the honest answer,
    // and the 20s ceiling means it is never gone for long.
    R.eq('S4e.fadedNotCamped', s.state(), 'hidden',
      'nowhere good on the rim -> get out of the way rather than sit on a sentence');
    const u = s.union(), pr = p.rectOf(panel);
    const straddles = overlaps(u, pr) && !(u.left >= pr.left && u.right <= pr.right && u.top >= pr.top && u.bottom <= pr.bottom);
    R.ok('S4e.noStraddle', s.state() === 'hidden' || !straddles,
      `${JSON.stringify(u)} vs panel ${JSON.stringify(pr)} — wholly in, wholly out, or gone`);
    R.ok('S4e.notOnBodyText', s.state() === 'hidden' || !overlaps(u, p.rectOf(copy)), 'never across the body copy');
    // Unit-level, so the surface rule is tested directly rather than through
    // whichever spot the search happened to pick: a box wholly inside a
    // paragraph is CLEAR (nothing tappable) but must never be EMPTY.
    const cr = p.rectOf(copy);
    const inText = { left: cr.left + 10, top: cr.top + 10, right: cr.left + 84, bottom: cr.top + 84, width: 74, height: 74 };
    R.eq('S4e.textIsNotEmptySpace', s.api.spotClass(inText, s.fab, p.vw, p.vh), 'busy',
      'a paragraph is BUSY, never empty space');
  }

  /* S4e2 — the same shape with WIDE gutters, which is the page as described:
     "a clear centred panel with dark space either side". When the dark space is
     actually wider than the chip, that is where it should end up. */
  {
    const p = makePage(g);
    const page = p.add(p.body, 'div', { id: 'page', rect: { left: 0, top: 0, width: p.vw, height: p.vh } });
    const panel = p.add(page, 'div', {
      id: 'panel', cs: { zIndex: '10' },
      rect: { left: 95, top: 40, width: p.vw - 190, height: p.vh - 80 }
    });
    // a full-width row, like the settings list, sitting under the fab's corner
    p.add(page, 'div', {
      className: 'row', cs: { cursor: 'pointer', zIndex: '11' },
      rect: { left: 12, top: p.vh - 190, width: p.vw - 24, height: 56 }
    });
    const s = boot(p, src);
    s.scan();
    const u = s.union(), pr = p.rectOf(panel);
    R.ok('S4e2.inTheGutter', s.state() === 'parked' && (u.right <= pr.left || u.left >= pr.right),
      `parked ${JSON.stringify(u)} — must be in the dark space beside the panel ${JSON.stringify(pr)}`);
  }

  /* S4f — a control fyIsControl CANNOT SEE: a plain div with its click handler
     bound in JS. No role, no class, no pointer cursor. A stage selector is
     exactly this, and a park landed on one. The parking test must reject it for
     being CONTENT, not for being tappable — which is the whole reason the test
     changed from "nothing tappable here" to "nothing here at all". */
  {
    const p = makePage(g);
    const page = p.add(p.body, 'div', { id: 'page', rect: { left: 0, top: 0, width: p.vw, height: p.vh } });
    const blocker = p.add(p.body, 'button', { id: 'why', rect: { left: 0, top: p.vh - 200, width: p.vw, height: 200 } });
    // invisible-to-us "control" occupying the whole right gutter
    const stage = p.add(page, 'div', {
      id: 'stagesel', rect: { left: p.vw - 90, top: 120, width: 84, height: p.vh - 400 }
    });
    const s = boot(p, src);
    s.scan();
    R.ok('S4f.yielded', s.state() === 'parked', `state ${s.state()}`);
    R.ok('S4f.avoidedUnknownControl', !overlaps(s.union(), p.rectOf(stage)),
      `parked ${JSON.stringify(s.union())} vs an element we cannot identify as a control ` +
      `${JSON.stringify(p.rectOf(stage))}`);
  }

  /* S4g — the move is a MOVE. A chip that is bottom-right one frame and
     mid-left the next tells the player nothing. Transitioning left/top only
     animates if the start value is in px, and at home it is `auto`. */
  {
    const p = pageSheet(g);
    const s = boot(p, src);
    const homeLeft = p.rectOf(s.fab).left;
    R.ok('S4g.startsUnpinned', s.fab.style.left === '', 'home is anchored by the stylesheet');
    s.fab._writes.length = 0;
    s.scan();
    R.ok('S4g.endsInPx', /px$/.test(s.fab.style.left) && /px$/.test(s.fab.style.top),
      `left=${s.fab.style.left} top=${s.fab.style.top}`);
    // The proof that this is a MOVE and not a teleport: `left` was written
    // twice — once to pin the current position in px, once to the target. A
    // transition out of `auto` does not animate, so without the first write the
    // chip just appears somewhere else.
    const lefts = s.fab._writes.filter(w => w.prop === 'left').map(w => w.value);
    const tops = s.fab._writes.filter(w => w.prop === 'top').map(w => w.value);
    const moved = lefts[lefts.length - 1] !== lefts[0] || tops[tops.length - 1] !== tops[0];
    R.ok('S4g.pinnedBeforeMove', lefts.length >= 2 && lefts[0] === Math.round(homeLeft) + 'px' && moved,
      `left writes ${JSON.stringify(lefts)}, top writes ${JSON.stringify(tops)} — ` +
      `first left must pin home (${Math.round(homeLeft)}px) and the chip must end up somewhere else`);
    R.ok('S4g.transitionDeclared', /\.lwfb-fab\{transition:[^}]*left \.18s/.test(src),
      'and the stylesheet actually animates left/top at 180ms');
    R.ok('S4g.dragKillsTransition', /b\.style\.transition = 'none'/.test(src),
      'a finger drag turns the easing off so it does not lag the finger');
  }

  /* S5 — Bramblewick. No overlay at all; a settings toggle scrolled under it. */
  {
    const p = pageScrolledControl(g);
    const s = boot(p, src);
    R.ok('S5.setupIsReal', overlaps(s.union(), p.rectOf(p.toggle)), 'fab really is on the toggle');
    const r5 = s.scan();
    R.ok('S5.yielded', s.state() !== 'home', `state ${s.state()} (no overlay to detect — this ` +
      'is the case that overlay-only detection would have missed)');
    // Caught this passing for the WRONG reason once: the cover rule was firing
    // on the settings list while the width-only size guard threw the row out.
    // The row is the point of the whole scenario, so name the reason.
    R.eq('S5.becauseControl', r5 && r5.why, 'control', 'a full-width settings row IS a control');
    R.ok('S5.offTheToggle', s.state() === 'hidden' || !overlaps(s.union(), p.rectOf(p.toggle)),
      'off the Reduced motion row, or gone from it');
    R.ok('S5.notCamped', s.state() !== 'parked' || s.api.watcher().tier === 'empty',
      'if it parked at all, it parked on genuinely empty space');
    // and it comes back when the list scrolls on
    p.toggle._rect.top = 200;
    s.scan(); s.scan();
    R.eq('S5.returns', s.state(), 'home', 'scrolls away -> fab returns');
  }

  /* S6 — every anchor blocked. It may fade, but not for longer than the
     ceiling, and when the ceiling fires it must be visible and stay visible. */
  {
    const p = makePage(g);
    // A page that is one giant button — home and all five anchors blocked.
    p.add(p.body, 'div', { id: 'wall', rect: { left: 0, top: 0, width: p.vw, height: p.vh } });
    p.add(p.body, 'button', { id: 'everything', cs: { zIndex: '5' }, rect: { left: 0, top: 0, width: p.vw, height: p.vh } });
    const s = boot(p, src);
    s.scan();
    R.eq('S6.faded', s.state(), 'hidden', 'nowhere to park');
    R.ok('S6.notRemoved', !!s.fab.parentNode, 'still in the DOM, never removed');
    s.clock.t += 5000; s.scan();
    R.eq('S6.stillHiddenBeforeCeiling', s.state(), 'hidden', 'ceiling has not fired yet');
    s.clock.t += 16000; s.scan();
    R.eq('S6.ceilingFired', s.state(), 'home', 'back after 20s');
    R.ok('S6.visibleAfterCeiling', s.visible(), 'a fab in the way still reports bugs; a fab that is gone reports nothing');
    // It SNOOZES rather than retiring: fading is common now, so retiring on the
    // first long fade would strand the chip on a control for the whole session.
    s.scan(); s.scan();
    R.ok('S6.staysVisibleThroughSnooze', s.visible() && s.state() === 'home',
      'it does not start hiding again the moment it reappears');
    s.clock.t += 61000; s.scan();
    R.ok('S6.behavesAgainAfterSnooze', s.state() === 'hidden' || s.state() === 'parked',
      `after the snooze it yields again (state ${s.state()}) rather than being retired for the session`);
  }

  /* S7 — detection throws. The fab must behave exactly as it did yesterday. */
  {
    const p = pageSheet(g);
    const poison = { getComputedStyle: () => { throw new Error('boom'); } };
    // getComputedStyle is wrapped in feedback.js, so poison the hit test instead
    p.doc.elementsFromPoint = () => { throw new Error('hit test exploded'); };
    const s = boot(p, src);
    const home = { ...p.rectOf(s.fab) };
    s.tick();
    R.ok('S7.survivedOnce', s.visible() && !!s.fab.parentNode, 'still visible after a throw');
    const after = p.rectOf(s.fab);
    R.ok('S7.unmoved', after.left === home.left && after.top === home.top, 'and unmoved');
    s.tick(); s.tick();
    R.ok('S7.retired', s.api.watcher().off === true, 'watcher retired itself after 3 throws');
    R.ok('S7.stillVisible', s.visible(), 'fab is exactly what it was before this change');
    R.ok('S7.noTimerLeft', s.api.watcher().timer === null, 'and it stopped scheduling');
  }

  /* S8 — our own feedback panel is full-screen. Never yield to ourselves. */
  {
    const p = pagePlain(g);
    const s = boot(p, src);
    const bg = p.add(p.body, 'div', { id: 'lwfb-bg', className: 'lwfb-bg', cs: { zIndex: '2147483000' }, rect: { left: 0, top: 0, width: p.vw, height: p.vh } });
    p.add(bg, 'button', { className: 'lwfb-go', rect: { left: 20, top: p.vh - 200, width: p.vw - 40, height: 60 } });
    const r = s.scan();
    R.eq('S8.skipped', r && r.skip, 'form-open', 'the scanner stands down while the form is open');
    R.eq('S8.state', s.state(), 'home');
  }

  /* S9 — a hidden tab costs nothing. */
  {
    const p = pageSheet(g);
    const s = boot(p, src);
    p.doc.hidden = true;
    p.resetHits();
    const r = s.scan();
    R.eq('S9.skipped', r && r.skip, 'doc-hidden');
    R.eq('S9.zeroCost', p.hits(), 0, 'no hit tests in a background tab');
  }

  /* S10 — the player drags it somewhere. That IS home now. */
  {
    const p = pageSheet(g);
    const s = boot(p, src);
    // drag it to the middle-left, over nothing
    s.fireEl(s.fab, 'pointerdown', { clientX: 350, clientY: 780 });
    s.fire('pointermove', { clientX: 60, clientY: 420, preventDefault() {} });
    s.fire('pointerup', {});
    const parked = { ...p.rectOf(s.fab) };
    R.ok('S10.dragMoved', parked.left < 200, `dragged to ${parked.left},${parked.top}`);
    R.eq('S10.homeIsNowHere', s.state(), 'home', 'the dragged spot is home');
    // now put a control under the dragged spot
    const boulder = p.add(p.body, 'button', {
      cs: { zIndex: '200' },
      rect: { left: parked.left - 30, top: parked.top - 30, width: 140, height: 140 }
    });
    s.scan();
    R.ok('S10.yieldsFromDragged', s.state() !== 'home', `state ${s.state()}`);
    boulder._rect.top = 40;
    s.scan(); s.scan();
    const back = p.rectOf(s.fab);
    R.ok('S10.returnsToDragged', back.left === parked.left && back.top === parked.top,
      `back to ${back.left},${back.top} (dragged spot was ${parked.left},${parked.top}), not the corner`);
  }

  /* S11 — the cover rule, on its own terms: a layered full-screen sheet with no
     DOM control anywhere near the fab still counts as an overlay. */
  {
    const p = pagePlain(g);
    p.add(p.body, 'div', {
      id: 'modal', cs: { zIndex: '99' },
      rect: { left: 0, top: 0, width: p.vw, height: p.vh }
    });
    const s = boot(p, src);
    const r = s.scan();
    R.eq('S11.coverDetected', r && r.why, 'cover', 'a layered full-viewport element is an overlay');
    R.ok('S11.yielded', s.state() !== 'home', `state ${s.state()}`);
  }

  /* S12 — the same shape WITHOUT layering: one full-screen wrapper and nothing
     painted beneath it. Must not read as a modal. */
  {
    const p = makePage(g);
    // Nested full-bleed containers, which is how a game shell is actually
    // built. The stack under the fab is [only, app, body, html] — every entry
    // an ANCESTOR. If the layering test stopped excluding ancestors, this shape
    // would read as a modal stacked over content and the fab would flee on
    // every canvas game in the fleet, forever. That is the false positive this
    // scenario exists to catch.
    const app = p.add(p.body, 'div', { id: 'app', rect: { left: 0, top: 0, width: p.vw, height: p.vh } });
    const only = p.add(app, 'div', { id: 'only', rect: { left: 0, top: 0, width: p.vw, height: p.vh } });
    p.add(only, 'div', { className: 'hud', rect: { left: 8, top: 8, width: 100, height: 30 } });
    const s = boot(p, src);
    s.scan();
    R.eq('S12.notAModal', s.state(), 'home', 'only ancestors beneath it -> it is the page, not a sheet');
  }

  /* S14 — OUR OWN CHROME MUST NOT MAKE A SPOT LOOK EMPTY.
     The badge's visible dot is a bare <span> with NO class. A self-exclusion
     filter that tests the returned node's className (the obvious way to write
     it, and what the coordinator's probe does) keeps that span, reads it as the
     topmost thing at the point, and an occupied spot looks like a clean one.
     fyIsOurs walks ancestors instead. This proves it: a control hiding under the
     BADGE's corner — not under the chip's body — must still block. */
  {
    const p = pagePlain(g);
    const s = boot(p, src);
    const badge = s.fab.children.find(c => p.hasClass(c, 'lwfb-fab-x'));
    const br = p.rectOf(badge);
    R.ok('S14.dotIsInTheHitTest', p.doc.elementsFromPoint(br.left + 24, br.top + 24)
      .some(e => e.tagName === 'SPAN' && !e.className),
      'the classless dot really is returned by the hit test (or this proves nothing)');
    // a control occupying only the badge's area, nowhere near the chip's body
    const sneaky = p.add(p.body, 'button', {
      id: 'underbadge', cs: { zIndex: '9' },
      rect: { left: br.left - 4, top: br.top - 4, width: 30, height: 30 }
    });
    const r = s.scan();
    R.eq('S14.ourOwnDotDoesNotMask', r && r.why, 'control',
      `a control under the badge must still register (got ${JSON.stringify(r)})`);
  }

  /* S15 — THE COORDINATOR'S PROBE, folded in (scripts/_fabprobe.mjs).
     It prints the topmost element under the chip's five corners and centre, and
     whether they are all the same. On the shot that started this pass the answer
     was four different elements, two of them .toggle rows. Whatever the chip
     ends up doing on a dense panel, this must never be the state it settles in:
     if it is visible at all, `same` has to be TRUE. */
  {
    const p = makePage(g);
    const page = p.add(p.body, 'div', { id: 'page', rect: { left: 0, top: 0, width: p.vw, height: p.vh } });
    const panel = p.add(page, 'div', { id: 'panel', cs: { zIndex: '10' }, rect: { left: 45, top: 30, width: p.vw - 90, height: p.vh - 60 } });
    const labels = ['Reduced motion', 'Manual aim (advanced routing)', 'High contrast', 'Haptics', 'Show timer', 'Auto save'];
    labels.forEach((t, i) => {
      const row = p.add(panel, 'div', {
        className: 'toggle', cs: { cursor: 'pointer' },
        rect: { left: 45, top: 90 + i * 120, width: 301, height: 51 }
      });
      p.add(row, 'span', { rect: { left: 60, top: 105 + i * 120, width: 226, height: 16 } });
    });
    const s = boot(p, src);
    s.scan(); s.scan();
    const fr = p.rectOf(s.fab);
    const pts = [[fr.left + 6, fr.top + 6], [fr.right - 6, fr.top + 6], [fr.left + 6, fr.bottom - 6],
                 [fr.right - 6, fr.bottom - 6], [fr.left + fr.width / 2, fr.top + fr.height / 2]];
    const under = pts.map(([x, y]) => {
      // the coordinator's filter, verbatim — className-based, so it KEEPS our
      // classless dot. That is the point: even read through a filter as naive
      // as the one that produced the field report, the answer must be sane.
      const els = p.doc.elementsFromPoint(x, y).filter(e => !e.className || !String(e.className).includes('lwfb'));
      const e = els[0];
      if (!e) return 'nothing';
      const r2 = p.rectOf(e);
      return e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') +
        (e.className ? '.' + e.className.trim().split(/\s+/)[0] : '') + ` [${Math.round(r2.width)}x${Math.round(r2.height)}]`;
    });
    const same = new Set(under).size === 1;
    if (VERBOSE) {
      console.log('  -- fabprobe --');
      console.log(`     rect  x ${Math.round(fr.left)}, y ${Math.round(fr.top)}, ${Math.round(fr.width)} x ${Math.round(fr.height)}`);
      under.forEach((u, i) => console.log(`     under[${i}]  ${u}`));
      console.log(`     same  ${String(same).toUpperCase()}   state ${s.state()}`);
    }
    R.eq('S15.denseSettingsPanel', s.state(), 'hidden',
      'six toggle rows and no gutter wide enough: the chip gets out of the way');
    R.ok('S15.neverSettlesOnMixedGround', s.state() === 'hidden' || same,
      `if it is visible it must sit on ONE thing. under = ${JSON.stringify(under)}`);
  }

  /* S16 — the centre of the screen is content, not chrome. Unit-level on the
     candidate generator, because a park in the middle band is the single
     complaint that came back three rounds running. */
  {
    const p = makePage(g);
    const s = boot(p, src);
    const cands = s.api.candidates(p.vw, p.vh, 48, 48);
    R.ok('S16.someCandidates', cands.length >= 8, `${cands.length} candidate spots`);
    const strays = cands.filter(c => {
      const cx = c.x + 24, cy = c.y + 24;
      return cx > p.vw * 0.25 && cx < p.vw * 0.75 && cy > p.vh * 0.25 && cy < p.vh * 0.75;
    });
    R.eq('S16.noneInTheMiddleBand', strays.length, 0,
      `every spot must be on the rim; strays: ${JSON.stringify(strays)}`);
  }

  /* S17 — a page where parking IS the right answer, with two traps between the
     chip and the good spot. Needed because the dense-panel scenarios now end in
     a fade, and a fade cannot show whether the straddle test, the clearance
     padding or the verify budget still work. Here the chip must walk PAST:
       trap 1, nearer: a spot straddling the panel's right edge (354px)
       trap 2, next:   a spot whose last 2px clip a button
     and land on clean panel surface further along the rim. */
  {
    const p = makePage(g);
    p.add(p.body, 'div', { id: 'page', rect: { left: 0, top: 0, width: p.vw, height: p.vh } });
    p.add(p.body, 'div', { id: 'panel', cs: { zIndex: '5' }, rect: { left: 0, top: 0, width: 354, height: p.vh } });
    // the control under home that starts the whole thing
    p.add(p.body, 'button', { id: 'homeblock', cs: { zIndex: '9' }, rect: { left: 330, top: 700, width: 48, height: 48 } });
    // trap 2: only its top 2px fall inside the (330,784) / (266,784) boxes
    const clip = p.add(p.body, 'button', { id: 'clip', cs: { zIndex: '9' }, rect: { left: 250, top: 830, width: 130, height: 40 } });
    const s = boot(p, src);
    s.scan();
    R.ok('S17.parkedSomewhere', s.state() === 'parked', `state ${s.state()} — this page has clean rim`);
    const u = s.union();
    R.ok('S17.noStraddleOfPanelEdge', u.right <= 354 || u.left >= 354,
      `parked ${JSON.stringify(u)} must not cross the panel edge at x=354`);
    R.ok('S17.clearedTheClippedButton', !overlaps(u, p.rectOf(clip)),
      `parked ${JSON.stringify(u)} vs a button it would clip by 2px ${JSON.stringify(p.rectOf(clip))}`);
    // and once parked, content drifting underneath must move it on — the old
    // check only reacted to controls, so the chip sat on whatever arrived
    const drift = p.add(p.body, 'div', {
      id: 'drift', cs: { zIndex: '20' },
      rect: { left: u.left - 5, top: u.top - 5, width: 90, height: 40 }
    });
    s.scan();
    R.ok('S17.movesWhenContentDriftsUnder', s.state() !== 'parked' || !overlaps(s.union(), p.rectOf(drift)),
      `state ${s.state()} — a parked chip must not sit under content that arrives later`);
  }

  /* S13 — the kill switch. */
  {
    const p = pageSheet(g);
    const s = boot(p, src, { LW_FB_NO_YIELD: true });
    s.scan();
    R.eq('S13.killSwitch', s.state(), 'unmounted', 'LW_FB_NO_YIELD leaves yesterday\'s fab');
    R.ok('S13.fabStillMounted', !!s.fab && !!s.fab.parentNode, 'and the fab still mounts');
  }
}

/* ══ self-test — break it on purpose, prove the checks go red ══════════════ */
const MUTANTS = [
  {
    name: 'yield disabled (fab never moves)',
    patch: s => s.replace('function fyYield(w, vw, vh) {', 'function fyYield(w, vw, vh) { if (1) return;'),
    mustFail: ['S2.yielded', 'S2.offTheButton', 'S5.yielded', 'S5.offTheToggle', 'S11.yielded']
  },
  {
    name: 'come-home disabled (fab parks forever)',
    patch: s => s.replace('function fyGoHome(w, animate) {', 'function fyGoHome(w, animate) { if (1) return;'),
    mustFail: ['S3.cameHome', 'S3.exactPosition', 'S6.ceilingFired', 'S10.returnsToDragged']
  },
  {
    name: 'no ceiling on the hidden state',
    patch: s => s.replace('HIDDEN_MAX_MS: 20000', 'HIDDEN_MAX_MS: 999999999'),
    mustFail: ['src.ceiling', 'S6.ceilingFired', 'S6.visibleAfterCeiling']
  },
  {
    name: 'errors swallowed without restoring',
    patch: s => s.replace('catch (e) { fyOnError(e); }\n    fySchedule();', 'catch (e) { }\n    fySchedule();'),
    mustFail: ['src.tryCatch', 'S7.retired']
  },
  {
    name: 'visibility gate removed (display:none reads as an overlay)',
    patch: s => s.replace("if (cs.display === 'none' || cs.visibility === 'hidden') return false;", ''),
    mustFail: ['S4c.hiddenModalIgnored']
  },
  {
    name: 'inert-screen gate removed (opacity:0 / pointer-events:none)',
    patch: s => s.replace("if (cs.pointerEvents === 'none') return false;", ''),
    mustFail: ['S4d.untappableLayerIgnored']
  },
  {
    name: 'layering test removed (every canvas game reads as a modal)',
    patch: s => s.replace('if (fyContains(u, cover) || fyContains(cover, u)) continue;', ''),
    mustFail: ['S12.notAModal']
  },
  {
    name: 'cursor:pointer full-bleed guard removed',
    patch: s => s.replace('if (r && !(r.width >= vw * 0.9 && r.height >= vh * 0.4)) return true;', 'if (r) return true;'),
    mustFail: ['S1b.fullBleedPointerIsNotAButton']
  },
  {
    name: 'badge back at the old -30 offset',
    patch: s => s.replace('.lwfb-fab-x{position:absolute;top:-26px;left:-26px;', '.lwfb-fab-x{position:absolute;top:-34px;left:-34px;'),
    mustFail: ['geom.footprintShrunk', 'geom.phantomReach']
  },
  {
    name: 'badge shrunk below the 48px touch rule',
    patch: s => s.replace('.lwfb-fab-x{position:absolute;top:-26px;left:-26px;width:48px;height:48px;',
      '.lwfb-fab-x{position:absolute;top:-26px;left:-26px;width:30px;height:30px;'),
    mustFail: ['geom.badge48']
  },
  {
    // the exact bug the checker caught mid-build, kept as a regression
    name: 'control guard back to width-only (full-width list rows stop counting)',
    patch: s => s.replace('if (r && !(r.width >= vw * 0.9 && r.height >= vh * 0.4)) return true;',
      'if (r && r.width <= vw * 0.9) return true;'),
    mustFail: ['S5.becauseControl']
  },
  {
    name: 'cover rule no longer defers to visible controls (parks forever on a menu)',
    patch: s => s.replace('if (cover && fyHasControls(cover, vw, vh)) cover = null;', ''),
    mustFail: ['S5.returns']
  },
  {
    // the coordinator's screenshot, as a permanent regression
    name: 'straddle test removed (park half on, half off a panel edge)',
    patch: s => s.replace('else if (sig !== top) empty = false;', 'else if (sig !== top) empty = empty;'),
    mustFail: ['S17.noStraddleOfPanelEdge']
  },
  {
    name: 'surface test relaxed (a paragraph counts as empty space)',
    patch: s => s.replace('if (!(tr.width >= vw * FY.SURF_W && tr.height >= vh * FY.SURF_H)) empty = false;', ''),
    mustFail: ['S4e.textIsNotEmptySpace']
  },
  {
    name: 'clearance padding removed (park clipping a control)',
    patch: s => s.replace('CLEAR_PAD:     8,', 'CLEAR_PAD:     0,'),
    mustFail: ['S17.clearedTheClippedButton']
  },
  {
    name: 'the move is a teleport again (no px pin before the transition)',
    patch: s => s.replace('function fyPin(el) {', 'function fyPin(el) { if (1) return;'),
    mustFail: ['S4g.pinnedBeforeMove']
  },
  {
    name: 'verify budget too small to reach a clean spot (fab fades instead)',
    patch: s => s.replace('MAX_VERIFY:   12,', 'MAX_VERIFY:    2,'),
    mustFail: ['S17.parkedSomewhere']
  },
  {
    // round 3's actual bug, kept forever
    name: 'best-available fallback restored (parks on a settings label)',
    patch: s => s.replace("if (cls === 'empty') { fyMoveTo(w, c2.x, c2.y, size, 'empty'); return; }",
      "if (cls === 'empty' || cls === 'busy') { fyMoveTo(w, c2.x, c2.y, size, cls); return; }"),
    mustFail: ['S4e.fadedNotCamped', 'S15.denseSettingsPanel']
  },
  {
    name: 'centre of the screen allowed as a parking spot',
    patch: s => s
      .replace('var out = [], seen = {}, keep = [], i;',
        'var out = [], seen = {}, keep = [], i; out.push({ x: Math.round(vw / 2 - w / 2), y: Math.round(vh / 2 - h / 2) });')
      .replace('if (fyInEdgeBand(out[i].x + w / 2, out[i].y + h / 2, vw, vh)) keep.push(out[i]);',
        'keep.push(out[i]);'),
    mustFail: ['S16.noneInTheMiddleBand']
  },
  {
    name: 'parked spot only re-checked for controls, not for staying empty',
    patch: s => s.replace("if (fySpotClass(cur, w.el, vw, vh) !== 'empty') fyYield(w, vw, vh);",
      "if (fySpotClass(cur, w.el, vw, vh) === 'blocked') fyYield(w, vw, vh);"),
    mustFail: ['S17.movesWhenContentDriftsUnder']
  },
  {
    name: 'ceiling retires the watcher for the whole session (strands the chip)',
    patch: s => s.replace('fyGoHome(w); w.snoozeUntil = Date.now() + FY.SNOOZE_MS; w.forced = true;',
      'fyGoHome(w); w.off = true; w.forced = true;'),
    mustFail: ['S6.behavesAgainAfterSnooze']
  },
  {
    name: 'no snooze after the ceiling (fades again the instant it reappears)',
    patch: s => s.replace("if (w.snoozeUntil && Date.now() < w.snoozeUntil) return { skip: 'snoozed' };", ''),
    mustFail: ['S6.staysVisibleThroughSnooze']
  },
  {
    name: 'scan never stands down for our own form',
    patch: s => s.replace("if (document.getElementById && document.getElementById('lwfb-bg')) return { skip: 'form-open' };", ''),
    mustFail: ['src.pausesForOwnForm', 'S8.skipped']
  }
];

function runAll(src) {
  const R = Runner();
  const g = sourceChecks(R, src);
  if (g) {
    try { scenarioChecks(R, g, src); }
    catch (e) { R.ok('scenarios.ran', false, `threw: ${e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e}`); }
  }
  return R;
}

/* ══ main ═════════════════════════════════════════════════════════════════ */
let exitCode = 0;

if (SELFTEST) {
  console.log('SELF-TEST — every check below is watched FAILING on a deliberately broken build.\n');
  let bad = 0;
  for (const m of MUTANTS) {
    let R, mutated;
    // A patch whose search string has drifted silently does nothing, the build
    // stays healthy, and the mutant "passes" by testing the real file. That
    // happened here once. Never again.
    try { mutated = m.patch(SRC); } catch (e) { mutated = SRC; }
    if (mutated === SRC) {
      bad++;
      console.log(`  ✗ ${m.name}: PATCH DID NOTHING — its search string no longer exists in feedback.js`);
      continue;
    }
    try { R = runAll(mutated); }
    catch (e) { console.log(`  ✗ ${m.name}: mutant would not even run — ${e.message}`); bad++; continue; }
    const failed = new Set(R.failed().map(r => r.id));
    const missed = m.mustFail.filter(id => !failed.has(id));
    const unknown = m.mustFail.filter(id => !R.rows.some(r => r.id === id));
    if (missed.length || unknown.length) {
      bad++;
      console.log(`  ✗ ${m.name}`);
      if (unknown.length) console.log(`      no such check: ${unknown.join(', ')}`);
      if (missed.length) console.log(`      stayed GREEN on a broken build: ${missed.join(', ')}`);
    } else {
      console.log(`  ✓ ${m.name} — went red: ${m.mustFail.join(', ')}`);
    }
  }
  console.log(`\n${MUTANTS.length - bad}/${MUTANTS.length} mutants correctly detected.`);
  exitCode = bad ? 1 : 0;
} else {
  const R = runAll(SRC);
  const failed = R.failed();
  for (const r of R.rows) {
    if (!r.pass || VERBOSE) console.log(`${r.pass ? '  ok  ' : '  FAIL'} ${r.id.padEnd(34)} ${r.detail}`);
  }
  console.log(`\n${R.rows.length - failed.length}/${R.rows.length} checks pass.`);
  if (failed.length) console.log(`FAILED: ${failed.map(f => f.id).join(', ')}`);
  else console.log('Run --self-test to watch every one of them fail on purpose.');
  exitCode = failed.length ? 1 : 0;
}
process.exit(exitCode);
