#!/usr/bin/env node
/* ============================================================================
   FLEET EXIT AUDIT  —  satellites/_exit_audit.mjs
   ----------------------------------------------------------------------------
   WHY THIS EXISTS
   The portal's delegated click handler frames ONLY two url shapes:
     /play/<id>.html          (srcdoc shell)
     https://stephenuffugus.github.io/...   (iframe src)
   Every other card url, including a relative /satellites/<id>/ url, FALLS
   THROUGH the handler and NAVIGATES TOP LEVEL. Verified live, written down in
   incoming/PORTAL-CONTRACT.md.

   Consequence: any exit affordance that only renders when window.parent!==window
   never appears for those games, and a game with no exit at all strands the
   player on the browser back button. The Jessie rule says the way home has to be
   findable on the game's own surface.

   WHAT THIS CHECKS, per satellite that the portal cards with a relative
   /satellites/ url:
     1. window.SWS_EXIT is ASSIGNED (a top level const in a classic script is
        NOT a window property, so the assignment has to be explicit).
     2. The exit has a REFERRER BASED FALLBACK for the unframed case, plus a
        hard destination when there is no history to go back to.
     3. Something actually CALLS SWS_EXIT — a click handler, an onclick, or a
        canvas hit test. A function nobody calls is not an exit.

   WHAT IT CANNOT CHECK: whether the control is visible, big enough, or sitting
   on top of something. No browser here. Placement was done by reading each
   layout; see satellites/_EXIT-AUDIT.md.

   USAGE
     node satellites/_exit_audit.mjs            # audit the carded fleet
     node satellites/_exit_audit.mjs --all      # audit every satellite folder
     node satellites/_exit_audit.mjs --verbose  # show the call sites it found
     node satellites/_exit_audit.mjs --self-test  # prove the checks can fail
   Exit code 0 when every audited game passes, 1 otherwise.
   ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..');
const PORTAL = path.join(REPO, 'portal', 'index.html');

/* ---------- 1. which satellites does the portal card with a relative url? --- */

function cardedSatellites() {
  const src = fs.readFileSync(PORTAL, 'utf8');
  const out = new Map();                       // id -> [display names]
  // {nm:"Name", ... url:"/satellites/<id>/?v=..." ...}
  const re = /\{[^{}]*?url\s*:\s*["'](\/satellites\/([a-z0-9._-]+)\/[^"']*)["'][^{}]*\}/gi;
  let m;
  while ((m = re.exec(src))) {
    const id = m[2];
    // match the CLOSING quote to the opening one, or "Bandit's Box" truncates to
    // "Bandit" and the report names a game that does not exist
    const nameMatch = /\bnm\s*:\s*(["'])((?:(?!\1).)*)\1/.exec(m[0]);
    const nm2 = nameMatch ? nameMatch[2] : id;
    if (!out.has(id)) out.set(id, []);
    if (!out.get(id).includes(nm2)) out.get(id).push(nm2);
  }
  return out;
}

/* ---------- 2. read a satellite's source (html + its own js) --------------- */

function readSatellite(id) {
  const dir = path.join(HERE, id);
  if (!fs.statSync(dir, { throwIfNoEntry: false })?.isDirectory()) return null;
  const files = [];
  const walk = (d, depth) => {
    if (depth > 2) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      /* ⛔ `assets` used to be skipped here with the art directories, which was
         fine while every satellite was hand written HTML. It stopped being fine
         the day a BUILT game joined the fleet: Vite emits the whole bundle to
         assets/index-<hash>.js, so skipping it meant reading Tally's index.html,
         seeing the exit defined and never seeing the bundle that calls it. The
         audit reported it STRANDED when the exit works. The extension filter
         below already keeps art out, so the directory name does not need to. */
      if (e.name.startsWith('.') || e.name === 'node_modules' ||
          e.name === 'art' || e.name === 'og' ||
          e.name === 'icons' || e.name === 'art-drop') continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p, depth + 1);
      else if (/\.(html|js|mjs)$/i.test(e.name) && e.name !== 'sw.js') files.push(p);
    }
  };
  walk(dir, 0);
  if (!files.length) return null;
  return files.map(f => ({ file: path.relative(REPO, f), src: fs.readFileSync(f, 'utf8') }));
}

/* ---------- 3. the three checks ------------------------------------------- */

// An assignment that really lands on window (not `var SWS_EXIT = ...`).
const RE_ASSIGN = /(?:window|self|globalThis)\s*(?:\.\s*SWS_EXIT|\[\s*["']SWS_EXIT["']\s*\])\s*=/;

/* ⛔⛔ THREE FALSE POSITIVES FIXED 2026-08-16 — read this before "simplifying".
   The first version of this file anchored every check at the offset of
   `window.SWS_EXIT =` and read forward 1200 chars. That is wrong three ways,
   and it reported 62 of 100 games broken, most of them fine:

     1. Bandit's Box HOISTS the referrer test into the enclosing IIFE:
          var fromPortal = document.referrer.indexOf('/portal')>=0;
          window.SWS_EXIT=function(){ ... if(fromPortal&&history.length>1) ... }
        Reading forward from the assignment never sees `document.referrer`.

     2. Parallel DECLARES the function first and exports it after:
          function SWS_EXIT(){ ...the whole correct body... }
          self.SWS_EXIT = SWS_EXIT;
        The assignment is the LAST line, so reading forward sees nothing at all.

     3. Aura Farm names its working exit `swsExit` and never binds SWS_EXIT.
        That breaks the contract, but the player is NOT stranded, and saying
        so would be crying wolf.

   So: anchor on the EXIT BODY, not the assignment. An exit body is identifiable
   by what it does — it posts {sws:'close'} and/or navigates to the portal — and
   the checks run in a window around THAT. Naming is then a separate, softer
   finding. A checker that cries wolf on most of the fleet gets ignored, which
   is worse than having no checker. */

// Every place in the source that looks like the body of an exit.
function exitBodies(src) {
  const out = [];
  const anchors = [
    /sws\s*:\s*["']close["']/g,                       // the framed branch
    /location\s*\.\s*(?:replace|assign|href)\s*=?\s*\(?\s*["'][^"']*\/portal/g,  // the unframed branch
  ];
  for (const re of anchors) {
    let m;
    while ((m = re.exec(src))) {
      const start = Math.max(0, m.index - 900);
      // ⛔ record where the anchor actually sits INSIDE the window. Deriving it
      // from win.length/2 breaks whenever the window is truncated, which is
      // exactly what happens when the exit is the last thing in the file — and
      // it is, in most of these games. That bug made ownerName read the text
      // BEFORE the exit and miss the enclosing function (Aura Farm, 4th false
      // positive of the day).
      out.push({ at: m.index, off: m.index - start, win: src.slice(start, m.index + 900) });
    }
  }
  return out;
}

// Name of the function that body lives in, so we can tell whether anything calls
// it even when it is not called SWS_EXIT.
function ownerName(win, off) {
  const pats = [
    /function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/g,
    /(?:window|self|globalThis)\s*\.\s*([A-Za-z_$][\w$]*)\s*=\s*function/g,
    /\b(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:function|\([^)]*\)\s*=>)/g,
  ];
  const head = win.slice(0, off + 120);          // everything up to just past the anchor
  let best = null, bestAt = -1;
  for (const p of pats) {
    const all = new RegExp(p.source, 'g');
    let m;
    while ((m = all.exec(head))) {
      if (m.index > bestAt) { bestAt = m.index; best = m[1]; }   // closest declaration above the exit
    }
  }
  return best;
}

// Does ANY exit body carry the full unframed fallback?
function hasReferrerFallback(src) {
  const bodies = exitBodies(src);
  if (!bodies.length) return { ok: false, missing: ['any recognisable exit body'], via: null, owner: null };

  let best = { ok: false, missing: ['document.referrer', 'history.back()', 'a hard location fallback'], via: null, owner: null };
  for (const b of bodies) {
    const win = b.win;
    const back = /history\s*\.\s*back\s*\(/.test(win);
    const hard = /location\s*\.\s*(replace|assign|href)/.test(win);
    let referrer = /document\s*\.\s*referrer/.test(win);
    let via = null;
    if (!referrer) {
      // one level of indirection: var X = ...document.referrer..., X used nearby
      const decl = /\b(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*[^;\n]*document\s*\.\s*referrer/g;
      let d;
      while ((d = decl.exec(win))) {
        if (new RegExp(`\\b${d[1]}\\b`).test(win.slice(d.index + d[0].length))) { referrer = true; via = d[1]; break; }
      }
    }
    const missing = [];
    if (!referrer) missing.push('document.referrer');
    if (!back) missing.push('history.back()');
    if (!hard) missing.push('a hard location fallback');
    const cand = { ok: referrer && back && hard, missing, via, owner: ownerName(win, b.off) };
    if (cand.ok) return cand;
    if (cand.missing.length < best.missing.length) best = cand;
  }
  return best;
}

// Does this game pull in the shared runtime injector (/arcade-exit.js)? That
// script grafts an exit onto games that have none — it defines SWS_EXIT with a
// referrer fallback and appends a button to #s-title (or a bare corner chip when
// there is no usable title screen). A game that loads it is NOT stranded, so
// calling it "broken" would be crying wolf. It is still weaker than an exit the
// game owns: the graft is generic, it bails if #s-title is missing AND the
// corner chip is an unlabelled arrow, and it can only ever be as good as its
// guess about where the layout has room.
function loadsSharedInjector(src) {
  return /arcade-exit\.js/.test(src);
}

// Somebody has to call it. Ignore the assignment itself and bare feature tests.
function callSites(src, name = 'SWS_EXIT') {
  const hits = [];
  const re = new RegExp(`\\b${name}\\b`, 'g');
  const L = name.length;
  let m;
  while ((m = re.exec(src))) {
    const after0 = src.slice(m.index + L, m.index + L + 40);
    const before0 = src.slice(Math.max(0, m.index - 40), m.index);
    if (/^\s*=[^=]/.test(after0)) continue;
    if (!/^\s*\(/.test(after0)) continue;
    if (/function\s+$/.test(before0)) continue;          // the declaration, not a call
    const line = src.slice(0, m.index).split('\n').length;
    hits.push({ line, snippet: src.slice(Math.max(0, m.index - 90), m.index + 40).replace(/\s+/g, ' ').trim() });
  }
  return hits;
}

/* ---- advisory scan: the fab-over-a-modal hazard (--fab) -------------------
   Found 2026-08-16 by LOOKING at Vine Runner's how to play screen: the fleet
   feedback fab (/feedback.js) is fixed bottom right at z-index 2147482000 and
   floats over ANY overlay a game owns, because no game's z-index can beat two
   billion. On satellites it renders as .lwfb-fab.lwfb-mini — a 48px circle
   parked 96px off the bottom, plus a 48px dismiss badge hung 30px up and left —
   so it occupies roughly x = W-90..W-12, y = H-174..H-96, and lands on whatever
   a full screen sheet puts near its bottom right. On Vine Runner that was the
   RUN button and the "tap the ? in the corner" hint.

   This flags CANDIDATES only. It cannot know where a sheet's controls actually
   sit — that needs a screenshot. It is here because this is reportedly the most
   common visual defect on this fleet, and a cheap list beats no list. */
const FAB_Z = 2147482000;
function fabHazard(src) {
  if (!/feedback\.js|mountFab/.test(src)) return null;      // no fab, no hazard
  const sheets = [];
  // a full screen fixed overlay: position:fixed with inset:0 (or all four sides)
  const re = /([#.][\w-]+)\s*\{([^}]*position\s*:\s*fixed[^}]*)\}/g;
  let m;
  while ((m = re.exec(src))) {
    const body = m[2];
    const full = /inset\s*:\s*0/.test(body) ||
      (/top\s*:\s*0/.test(body) && /bottom\s*:\s*0/.test(body) && /left\s*:\s*0/.test(body));
    if (!full) continue;
    // ⛔ It must be a MODAL, not the game's root container. Requiring
    // display:none in the same rule is what separates a sheet you open from
    // #wrap, which every game has and which is never "covered by" anything.
    // Without this the scan named 79 of 100 games and was pure noise — the same
    // crying wolf the exit checks had to be cured of.
    if (!/display\s*:\s*none/.test(body)) continue;
    const z = /z-index\s*:\s*(\d+)/.exec(body);
    const zi = z ? +z[1] : 0;
    if (zi < FAB_Z) sheets.push({ sel: m[1], z: zi });
  }
  if (!sheets.length) return null;
  const guarded = /\.lwfb-fab\s*\{[^}]*display\s*:\s*none/.test(src) ||
                  /lwfb-fab[^{]*\{[^}]*display\s*:\s*none/.test(src);
  return { sheets, guarded };
}

// Informational only: does it still announce itself for the day a card moves to
// a framed url?
function hasReady(src) {
  return /postMessage\s*\(\s*\{\s*sws\s*:\s*["']ready["']/.test(src);
}

function auditOne(id, names) {
  const parts = readSatellite(id);
  if (!parts) return { id, names, state: 'FAIL', fails: ['no source found on disk'], calls: [] };

  const all = parts.map(p => p.src).join('\n/*__FILE_BREAK__*/\n');
  const fails = [];
  const notes = [];

  const assigned = RE_ASSIGN.test(all);
  const ref = hasReferrerFallback(all);

  // Something must CALL the exit. Prefer the canonical name; if the game named
  // its exit something else, accept calls to that name and flag the naming.
  let calls = callSites(all);
  let calledAs = 'SWS_EXIT';
  if (!calls.length && ref.owner && ref.owner !== 'SWS_EXIT') {
    const alt = callSites(all, ref.owner);
    if (alt.length) { calls = alt; calledAs = ref.owner; }
  }
  // ...or the exit is not a named function at all, it IS the handler:
  //     $('b-back1').onclick = function(){ location.href='/portal/'; };
  // Fox & Basket does exactly this. It is a real, tappable way home, so calling
  // that player "stranded" would be the same crying wolf in a new costume.
  // (5th false positive class found while validating this file.)
  let inlineHandler = false;
  if (!calls.length) {
    // TIGHT window on purpose. At 900 chars this matched any unrelated
    // addEventListener that happened to sit near the exit, and it waved
    // Tempo Grove through — a game whose SWS_EXIT is defined and never called.
    // A false negative is as bad as a false positive; 200 chars is about the
    // span of one handler.
    inlineHandler = exitBodies(all).some(b =>
      /onclick|addEventListener|\.on[a-z]+\s*=|\bwire\s*\(|\btap\s*\(|\bbind\s*\(/i
        .test(b.win.slice(Math.max(0, b.off - 200), b.off + 120)));
  }
  const reachable = calls.length > 0 || inlineHandler;

  const noExitAtAll = ref.missing[0] === 'any recognisable exit body';
  const injector = loadsSharedInjector(all);

  // STRANDED is the only thing that actually hurts a player: no reachable way
  // home in the source AND no runtime injector.
  if (noExitAtAll) fails.push('no exit anywhere in the source (nothing posts sws:close, nothing navigates to /portal)');
  else if (!reachable) fails.push('an exit is defined but NOTHING calls it (no button, no handler, no hit test)');

  // Everything below is a contract gap, not a stranding.
  if (!noExitAtAll && reachable) {
    if (!ref.ok) notes.push('exit reaches the portal but skips the referrer path, missing: ' + ref.missing.join(', '));
    if (!assigned) notes.push('not bound to window.SWS_EXIT' + (calledAs !== 'SWS_EXIT' ? ` (it is "${calledAs}")` : ''));
  }

  let state;
  if (fails.length) state = injector ? 'GRAFT' : 'FAIL';
  else if (notes.length) state = 'PARTIAL';
  else state = 'PASS';

  return { id, names, state, fails, notes, calls, calledAs, ready: hasReady(all), injector, via: ref.via };
}

/* ---------- 4. self test: prove the checks can go red ---------------------- */

function selfTest() {
  const good = `
    (function(){
      var framed=false; try{ framed = window.parent!==window; }catch(e){ framed=true; }
      window.SWS_EXIT=function(){
        if(framed){ try{ parent.postMessage({sws:'close'},'*'); }catch(e){} return; }
        if(document.referrer.indexOf('/portal')>=0&&history.length>1){ history.back(); }
        else{ location.replace('https://lucidwinds.com/portal/'); }
      };
    })();
    document.getElementById('x').addEventListener('click',function(){ window.SWS_EXIT(); });`;
  // the shape that USED to be reported broken: the referrer test is hoisted into
  // the enclosing IIFE instead of written inline. This is Bandit's Box, verbatim
  // in shape, and it is correct code. Regression case, do not delete.
  const hoisted = `
    (function(){
      var framed=false; try{ framed = window.parent!==window; }catch(e){ framed=true; }
      var fromPortal = document.referrer.indexOf('/portal')>=0;
      window.SWS_EXIT=function(){
        if(framed){ try{ parent.postMessage({sws:'close'},'*'); }catch(e){} return; }
        if(fromPortal&&history.length>1){ history.back(); }
        else{ location.replace('https://lucidwinds.com/portal/'); }
      };
      var b=document.getElementById('swsBack');
      if(b){ b.addEventListener('click',function(){ window.SWS_EXIT(); }); }
    })();`;
  // ...but an unrelated mention of the referrer must NOT rescue a broken exit
  const decoy = `
    var ref = document.referrer; track(ref);
    window.SWS_EXIT=function(){ parent.postMessage({sws:'close'},'*'); };
    btn.onclick=function(){ SWS_EXIT(); };`;

  const cases = [
    ['canonical block passes', good, true],
    ['hoisted referrer var passes (the Bandit’s Box false positive)', hoisted, true],
    ['unrelated referrer mention does NOT rescue a framed only exit', decoy, false],
    ['local const does not count', good.replace('window.SWS_EXIT=', 'const SWS_EXIT='), false],
    ['framed only exit fails', good.replace(/if\(document[\s\S]*?\}\n/, ''), false],
    ['uncalled exit fails', good.replace("document.getElementById('x').addEventListener('click',function(){ window.SWS_EXIT(); });", ''), false],
  ];
  let bad = 0;
  for (const [label, src, want] of cases) {
    const got = RE_ASSIGN.test(src) && hasReferrerFallback(src).ok && callSites(src).length > 0;
    const ok = got === want;
    if (!ok) bad++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label} (expected ${want ? 'pass' : 'fail'}, got ${got ? 'pass' : 'fail'})`);
  }
  return bad;
}

/* ---------- 5. run --------------------------------------------------------- */

const argv = process.argv.slice(2);
const verbose = argv.includes('--verbose');

if (argv.includes('--self-test')) {
  console.log('SELF TEST — the checks must be able to fail, or this audit is decoration.');
  const bad = selfTest();
  console.log(bad ? `\n${bad} self test case(s) wrong. The audit is not trustworthy.` : '\nSelf test clean.');
  process.exit(bad ? 2 : 0);
}

if (argv.includes('--fab')) {
  console.log('FAB OVER A MODAL — candidates, not confirmed defects.\n');
  console.log('The feedback fab is fixed bottom right at z-index ' + FAB_Z + ' and floats');
  console.log('over any overlay a game owns. It occupies about x = W-90..W-12,');
  console.log('y = H-174..H-96. Anything a full screen sheet puts in that corner is');
  console.log('covered. Confirm each with a screenshot; this list only narrows it.\n');
  const ids0 = [...cardedSatellites().keys()].sort();
  let n = 0;
  for (const id of ids0) {
    const parts = readSatellite(id);
    if (!parts) continue;
    const h = fabHazard(parts.map(p => p.src).join('\n'));
    if (!h) continue;
    n++;
    console.log(`${h.guarded ? 'guarded' : 'AT RISK '}  ${id}  — ${h.sheets.map(s => `${s.sel} (z${s.z})`).join(', ')}`);
  }
  console.log(`\n${n} carded satellites mount the fab AND own a full screen sheet under it.`);
  process.exit(0);
}

const carded = cardedSatellites();
let ids = [...carded.keys()].sort();
if (argv.includes('--all')) {
  for (const e of fs.readdirSync(HERE, { withFileTypes: true })) {
    if (e.isDirectory() && !e.name.startsWith('_') && !ids.includes(e.name)) ids.push(e.name);
  }
  ids.sort();
}
const only = argv.filter(a => !a.startsWith('--'));
if (only.length) ids = ids.filter(id => only.includes(id));

console.log('FLEET EXIT AUDIT — satellites the portal cards with a RELATIVE /satellites/ url.');
console.log('These load TOP LEVEL, never framed, so a framed-only exit is invisible.\n');

const results = ids.map(id => auditOne(id, carded.get(id) || ['(not carded)']));
const by = s => results.filter(r => r.state === s);
const passed = by('PASS'), partial = by('PARTIAL'), grafted = by('GRAFT'), failed = by('FAIL');

console.log('PASS    = a reachable exit on window.SWS_EXIT with the full referrer path.');
console.log('PARTIAL = a reachable way home, but off contract (wrong name, or it skips');
console.log('          the referrer path and so throws away the back stack).');
console.log('GRAFT   = nothing of its own, but it loads /arcade-exit.js, which injects');
console.log('          an exit at runtime. Not stranded; generic and placed by guess.');
console.log('FAIL    = STRANDED. No reachable exit and no injector. The browser back');
console.log('          button is the only way out, and an installed PWA has none.\n');

for (const r of results) {
  console.log(`${r.state.padEnd(6)} ${r.id}${r.names[0] === r.id ? '' : `  (${r.names.join(', ')})`}`);
  for (const f of r.fails || []) console.log(`         ${f}`);
  for (const n of r.notes || []) console.log(`         ${n}`);
  if (r.state === 'GRAFT') console.log('         mitigated by /arcade-exit.js at runtime');
  if (verbose && (r.state === 'PASS' || r.state === 'PARTIAL')) {
    if (r.via) console.log(`         referrer test reached through the var "${r.via}"`);
    if (r.calledAs !== 'SWS_EXIT') console.log(`         called as "${r.calledAs}"`);
    for (const c of r.calls.slice(0, 2)) console.log(`         line ${c.line}: ${c.snippet}`);
    if (!r.ready) console.log('         note: no {sws:"ready"} post (harmless today, wrong the day this card moves to a framed url)');
  }
}

console.log(`\n${results.length} audited: ${passed.length} PASS, ${partial.length} PARTIAL, ${grafted.length} GRAFT, ${failed.length} STRANDED.`);
console.log(`Players can get home from ${results.length - failed.length} of ${results.length}.`);
if (failed.length) console.log(`\nSTRANDED (no reachable exit, no injector) — ${failed.length}:\n  ${failed.map(r => r.id).join(', ')}`);
if (partial.length) console.log(`\nOFF CONTRACT (works, but not to spec) — ${partial.length}:\n  ${partial.map(r => r.id).join(', ')}`);
if (grafted.length) console.log(`\nINJECTOR ONLY — ${grafted.length}:\n  ${grafted.map(r => r.id).join(', ')}`);
process.exit(failed.length ? 1 : 0);
