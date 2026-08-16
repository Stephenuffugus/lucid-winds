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
    const nameMatch = /\bnm\s*:\s*["']([^"']+)["']/.exec(m[0]);
    const nm = nameMatch ? nameMatch[1] : id;
    if (!out.has(id)) out.set(id, []);
    if (!out.get(id).includes(nm)) out.get(id).push(nm);
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
      if (e.name.startsWith('.') || e.name === 'node_modules' ||
          e.name === 'assets' || e.name === 'art' || e.name === 'og' ||
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

// Is there a referrer-driven fallback for the top level (unframed) case, and a
// hard destination when history has nowhere to go?
function hasReferrerFallback(src) {
  const at = src.search(RE_ASSIGN);
  if (at < 0) return false;
  const body = src.slice(at, at + 1200);       // the exit function is short
  const referrer = /document\s*\.\s*referrer/.test(body);
  const back = /history\s*\.\s*back\s*\(/.test(body);
  const hard = /location\s*\.\s*(replace|assign|href)/.test(body);
  return referrer && back && hard;
}

// Somebody has to call it. Ignore the assignment itself and bare feature tests.
function callSites(src) {
  const hits = [];
  const re = /SWS_EXIT/g;
  let m;
  while ((m = re.exec(src))) {
    const before = src.slice(Math.max(0, m.index - 40), m.index);
    const after = src.slice(m.index + 8, m.index + 40);
    if (/^\s*=[^=]/.test(after)) continue;                 // this is the assignment
    if (!/^\s*\(/.test(after)) continue;                   // not a call
    if (/\b(if|typeof|&&|\|\|)\s*[^)]*$/.test(before) && /^\s*\)\s*$/.test(after)) continue;
    const line = src.slice(0, m.index).split('\n').length;
    hits.push({ line, snippet: src.slice(Math.max(0, m.index - 90), m.index + 40).replace(/\s+/g, ' ').trim() });
  }
  return hits;
}

// Informational only: does it still announce itself for the day a card moves to
// a framed url?
function hasReady(src) {
  return /postMessage\s*\(\s*\{\s*sws\s*:\s*["']ready["']/.test(src);
}

function auditOne(id, names) {
  const parts = readSatellite(id);
  if (!parts) return { id, names, missing: true, pass: false, fails: ['no source found on disk'] };

  const all = parts.map(p => p.src).join('\n/*__FILE_BREAK__*/\n');
  const fails = [];
  if (!RE_ASSIGN.test(all)) fails.push('window.SWS_EXIT is never assigned');
  if (!hasReferrerFallback(all)) fails.push('no referrer based fallback (needs document.referrer + history.back + a hard location)');
  const calls = callSites(all);
  if (!calls.length) fails.push('nothing calls SWS_EXIT (no button, no handler, no hit test)');

  return { id, names, pass: fails.length === 0, fails, calls, ready: hasReady(all) };
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
  const cases = [
    ['canonical block passes', good, true],
    ['local const does not count', good.replace('window.SWS_EXIT=', 'const SWS_EXIT='), false],
    ['framed only exit fails', good.replace(/if\(document[\s\S]*?\}\n/, ''), false],
    ['uncalled exit fails', good.replace("document.getElementById('x').addEventListener('click',function(){ window.SWS_EXIT(); });", ''), false],
  ];
  let bad = 0;
  for (const [label, src, want] of cases) {
    const got = RE_ASSIGN.test(src) && hasReferrerFallback(src) && callSites(src).length > 0;
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
const failed = results.filter(r => !r.pass);
const passed = results.filter(r => r.pass);

for (const r of results) {
  const tag = r.pass ? 'PASS' : 'FAIL';
  console.log(`${tag}  ${r.id}${r.names[0] === r.id ? '' : `  (${r.names.join(', ')})`}`);
  for (const f of r.fails || []) console.log(`        ${f}`);
  if (verbose && r.pass) {
    for (const c of r.calls.slice(0, 3)) console.log(`        line ${c.line}: ${c.snippet}`);
    if (!r.ready) console.log('        note: no {sws:"ready"} post (harmless today, wrong the day this card moves to a framed url)');
  }
}

console.log(`\n${passed.length} pass, ${failed.length} fail, ${results.length} audited.`);
if (failed.length) console.log(`STILL BROKEN: ${failed.map(r => r.id).join(', ')}`);
process.exit(failed.length ? 1 : 0);
