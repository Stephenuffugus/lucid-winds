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
  R.ok('src.ceiling', /HIDDEN_MAX_MS/.test(src) &&
    /hiddenAt && \(Date\.now\(\) - w\.hiddenAt\) >= FY\.HIDDEN_MAX_MS[\s\S]{0,80}?fyGoHome\(w\)/.test(src),
    'the invisible state has a hard ceiling that ends in fyGoHome');
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
  R.ok('src.pausesForOwnForm', /getElementById\('lwfb-bg'\)/.test(src),
    'our own panel is never treated as a game overlay');
  try {
    new vm.Script(src, { filename: 'feedback.js' });
    R.ok('src.parses', true, 'vm.Script parses the file');
  } catch (e) { R.ok('src.parses', false, e.message); }
  R.ok('src.es5', !/\b(const|let)\s+[A-Za-z_$]/.test(src) && !/=>/.test(src),
    'ES5 only (CLAUDE.md rule 14)');
  return g;
}

/* ══ PART 2 — a DOM stub, and the real file run inside it ══════════════════ */

function makePage(g, opts = {}) {
  const vw = opts.vw || 390, vh = opts.vh || 844;
  let hitCount = 0;

  const mkStyle = () => ({ left: '', top: '', right: '', bottom: '', display: '', visibility: '', opacity: '', pointerEvents: '', zIndex: '' });

  function El(tag, spec = {}) {
    const e = {
      tagName: String(tag).toUpperCase(),
      children: [], parentNode: null, ownerDocument: null,
      style: mkStyle(), _attrs: Object.create(null), _cs: spec.cs || {},
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
    return e;
  }
  const hasClass = (e, c) => (' ' + (e.className || '') + ' ').indexOf(' ' + c + ' ') > -1;

  // Rects. The fab and its badge are resolved from the CSS numbers parsed out
  // of feedback.js plus whatever inline styles the code under test has written,
  // so the stub cannot drift from the file it is testing.
  function rectOf(e) {
    let r;
    if (hasClass(e, 'lwfb-fab-x') && e.parentNode) {
      const p = rectOf(e.parentNode);
      r = { left: p.left + g.badgeLeft, top: p.top + g.badgeTop, width: g.badgeW, height: g.badgeH };
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
      (function walk(n, depth, z) {
        const zz = zIndexOf(n, z);
        const r = rectOf(n);
        if (r.width > 0 && r.height > 0 && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) hits.push({ n, depth, z: zz });
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
      hits.sort((a, b) => (b.z - a.z) || (b.depth - a.depth));
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
    scan() { return sandbox.LW_Feedback._fab.scan(); },
    tick() { return sandbox.LW_Feedback._fab.tick(); },
    state() { return sandbox.LW_Feedback._fab.state(); },
    union() {
      const f = page.rectOf(fab);
      const b = fab.children.find(c => page.hasClass(c, 'lwfb-fab-x'));
      const br = b ? page.rectOf(b) : f;
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
    R.ok('S3.noInlineResidue', s.fab.style.left === '' && s.fab.style.top === '' &&
      s.fab.style.right === '' && s.fab.style.bottom === '', 'inline anchors cleared');
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
    R.ok('S5.offTheToggle', !overlaps(s.union(), p.rectOf(p.toggle)), 'off the Reduced motion row');
    R.ok('S5.visible', s.visible(), 'still reachable');
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
    R.eq('S6.ceilingFired', s.state(), 'off:home', 'back after 20s, watcher retired');
    R.ok('S6.visibleAfterCeiling', s.visible(), 'a fab in the way still reports bugs; a fab that is gone reports nothing');
    s.scan(); s.scan();
    R.ok('S6.staysVisible', s.visible() && s.state() === 'off:home', 'and it does not start hiding again');
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
    const wrap = p.add(p.body, 'div', { id: 'only', rect: { left: 0, top: 0, width: p.vw, height: p.vh } });
    p.add(wrap, 'div', { className: 'hud', rect: { left: 8, top: 8, width: 100, height: 30 } });
    const s = boot(p, src);
    s.scan();
    R.eq('S12.notAModal', s.state(), 'home', 'nothing beneath it -> it is the page, not a sheet');
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
    patch: s => s.replace('function fyGoHome(w) {', 'function fyGoHome(w) { if (1) return;'),
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
    mustFail: ['S4.ignored']
  },
  {
    name: 'layering test removed (every canvas game reads as a modal)',
    patch: s => s.replace('if (fyContains(u, cover) || fyContains(cover, u)) continue;', ''),
    mustFail: ['S12.notAModal']
  },
  {
    name: 'cursor:pointer size guard removed',
    patch: s => s.replace('if (r && r.width <= vw * 0.9) return true;', 'if (r) return true;'),
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
    let R;
    try { R = runAll(m.patch(SRC)); }
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
