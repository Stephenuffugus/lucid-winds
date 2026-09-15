#!/usr/bin/env node
/* The studio's laws and the catalog's, checked against the files a browser
 * loads from satellites/math/ (everything but test/, tools/, docs/ and
 * package.json).
 *
 *   node tools/lint.mjs
 *
 * What it asserts (plans/math/HANDOFF-CORE.md 0.3, 3.2, 3.7, P0 step 2), each
 * watched to fail on a planted line:
 *   1. every runtime module parses as an ES module (`node --check`, which reads
 *      it as a module because satellites/math/package.json says so)
 *   2. nothing a browser loads is a .mjs (this host serves .mjs as text/plain)
 *   3. every relative import, and every local script and stylesheet a page
 *      loads, carries exactly ?v= plus a stamp: the string in config/STAMP.js
 *      when it lands in config/ (the link builder's own, plans/crease/
 *      HANDOFF-CREASE.md 3.11), the string in core/STAMP.js everywhere else. An
 *      ES module import is its own URL; a stamp on the entry point never
 *      reaches it (satellites/aura-off/tools/stamp.js, 2026-08-29)
 *   4. pure.js never names document, window, Date, performance, Math.random,
 *      setTimeout, setInterval or requestAnimationFrame (comments aside): the
 *      pure half is what Node imports for the gates
 *   5. getUserMedia appears nowhere a browser loads (CORE G4)
 *   6. the forbidden strings appear nowhere a browser loads (CORE G13 and the
 *      catalog plan's `brain power`); IQ only as a whole word
 *   7. player copy: every string in core.js's COPY and every text node of a
 *      page has no dash and no exclamation point, the studio is Sky Wolf Studio
 *      singular, and no sentence is written straight into textContent,
 *      innerText, innerHTML or an aria-label outside COPY, where this rule
 *      could not see it (Wardian's pouch: a BUY lived for a fortnight in a
 *      string no copy scan read)
 *   8. no object literal declares the same key twice (tools/dupkeys.mjs)
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, relative, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dupKeys } from '../../../../tools/dupkeys.mjs';

const CORE = join(dirname(fileURLToPath(import.meta.url)), '..');
const MATH = join(CORE, '..');
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };

/* ---- what a browser loads ---- */
const SKIP_DIRS = new Set(['test', 'tools', 'docs', 'node_modules']);
function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name), st = statSync(p);
    if (st.isDirectory()) { if (!SKIP_DIRS.has(name)) walk(p, out); }
    else if (name !== 'package.json') out.push(p);
  }
  return out;
}
const files = walk(MATH, []);
const rel = p => relative(MATH, p);
const JS = files.filter(p => extname(p) === '.js');
const HTML = files.filter(p => extname(p) === '.html');
const RUNTIME_TEXT = files.filter(p => ['.js', '.html', '.css', '.mjs', '.json', '.webmanifest'].includes(extname(p)));
const read = p => readFileSync(p, 'utf8');

/* comments out, strings kept, so a word in a comment is not a finding and a word in code is */
function stripComments(src) {
  let out = '', i = 0, q = null;
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (q) {
      out += c;
      if (c === '\\') { out += n || ''; i += 2; continue; }
      if (c === q) q = null;
      i++; continue;
    }
    if (c === '"' || c === "'" || c === '`') { q = c; out += c; i++; continue; }
    if (c === '/' && n === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '/' && n === '*') { i += 2; while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; continue; }
    out += c; i++;
  }
  return out;
}
const inlineModules = html => [...html.matchAll(/<script\b[^>]*type=["']module["'][^>]*>([\s\S]*?)<\/script>/gi)]
  .map(m => m[1]).filter(s => s.trim());

/* ---- 1. parses ---- */
{
  const bad = [];
  for (const p of JS) {
    const r = spawnSync(process.execPath, ['--check', p], { encoding: 'utf8' });
    if (r.status !== 0) bad.push(rel(p) + ': ' + (r.stderr.split('\n').find(l => /Error/.test(l)) || 'does not parse'));
  }
  say(bad.length === 0, 'every runtime module parses as an ES module'
    + (bad.length ? ': ' + bad.join(' | ') : ' (' + JS.length + ' of them)'));
}

/* ---- 2. no .mjs at runtime ---- */
{
  const bad = files.filter(p => extname(p) === '.mjs').map(rel);
  for (const p of JS.concat(HTML)) {
    for (const m of read(p).matchAll(/['"]([^'"\s]+\.mjs(\?[^'"]*)?)['"]/g)) bad.push(rel(p) + ' names ' + m[1]);
  }
  say(bad.length === 0, 'nothing a browser loads is a .mjs' + (bad.length ? ': ' + bad.join(', ') : ''));
}

/* ---- 3. one stamp on every import and asset ---- */
const readStamp = f => existsSync(f) ? (read(f).match(/export const STAMP = '([0-9]{8}[a-z])'/) || [])[1] : null;
const STAMP = readStamp(join(CORE, 'STAMP.js'));
const BUILDER = join(MATH, 'config');
const BUILDER_STAMP = readStamp(join(BUILDER, 'STAMP.js'));
say(!!STAMP, 'core/STAMP.js names CORE\'s stamp' + (STAMP ? ': ' + STAMP : ''));
say(!!BUILDER_STAMP, 'config/STAMP.js names the link builder\'s own stamp' + (BUILDER_STAMP ? ': ' + BUILDER_STAMP : ''));
{
  const specs = [];
  const fromJs = (src, where, file) => {
    const s = stripComments(src);
    for (const re of [/\bimport\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]/g,
      /\bexport\s+[\w*{}\s,]+\s+from\s+['"]([^'"]+)['"]/g, /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g]) {
      for (const m of s.matchAll(re)) specs.push([where, m[1], file]);
    }
  };
  for (const p of JS) fromJs(read(p), rel(p), p);
  for (const p of HTML) {
    const h = read(p);
    for (const code of inlineModules(h)) fromJs(code, rel(p) + ' (inline module)', p);
    for (const m of h.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)) specs.push([rel(p), m[1], p]);
    for (const m of h.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["']/gi)) specs.push([rel(p), m[1], p]);
  }
  const local = specs.filter(([, u]) => !/^(https?:|\/\/|data:|#|mailto:)/.test(u));
  /* the stamp a reference owes is the stamp of the folder it lands in, whoever makes it */
  const owed = (u, file) => relative(BUILDER, join(dirname(file), u.split('?')[0])).startsWith('..') ? STAMP : BUILDER_STAMP;
  const bad = local.filter(([, u, f]) => { const w = owed(u, f); return !w || !u.endsWith('?v=' + w); })
    .map(([w, u, f]) => w + ' loads ' + u + ' (owes ?v=' + owed(u, f) + ')');
  const toBuilder = local.filter(([, u, f]) => owed(u, f) === BUILDER_STAMP).length;
  say(bad.length === 0, 'every relative import and local asset carries ?v=' + STAMP + ', or ?v=' + BUILDER_STAMP + ' when it lands in config/'
    + (bad.length ? ': ' + bad.join(', ') : ' (' + local.length + ' of them, ' + toBuilder + ' into config/)'));
}

/* ---- 4. the pure half is pure ---- */
{
  const p = join(CORE, 'pure.js');
  if (!existsSync(p)) say(false, 'core/pure.js exists');
  else {
    const code = stripComments(read(p));
    const banned = ['document', 'window', 'Date', 'performance', 'setTimeout', 'setInterval', 'requestAnimationFrame']
      .filter(w => new RegExp('\\b' + w + '\\b').test(code));
    if (/Math\.random/.test(code)) banned.push('Math.random');
    say(banned.length === 0, 'pure.js touches no screen, clock or unseeded die'
      + (banned.length ? ': it names ' + banned.join(', ') : ''));
  }
}

/* ---- 5 and 6. never in the bundle ---- */
{
  const gum = RUNTIME_TEXT.filter(p => /getUserMedia/.test(read(p))).map(rel);
  say(gum.length === 0, 'getUserMedia appears nowhere a browser loads' + (gum.length ? ': ' + gum.join(', ') : ''));
  const FORBIDDEN = [[/\bIQ\b/, 'IQ'], [/brain[\s-]?train/i, 'brain train'], [/smarter/i, 'smarter'],
    [/cognitive enhance/i, 'cognitive enhance'], [/brain power/i, 'brain power']];
  const hits = [];
  for (const p of RUNTIME_TEXT) {
    const t = read(p);
    for (const [re, word] of FORBIDDEN) if (re.test(t)) hits.push(rel(p) + ' says ' + word);
  }
  say(hits.length === 0, 'none of the forbidden strings appears anywhere a browser loads'
    + (hits.length ? ': ' + hits.join(', ') : ''));
}

/* ---- 7. player copy ---- */
{
  const copy = [];
  const coreJs = join(CORE, 'core.js');
  if (existsSync(coreJs)) {
    const src = read(coreJs), at = src.search(/export const COPY\s*=/);
    if (at >= 0) {
      let i = src.indexOf('{', at), depth = 0, end = i;
      for (; end < src.length; end++) {
        if (src[end] === '{') depth++;
        else if (src[end] === '}' && --depth === 0) break;
      }
      for (const m of src.slice(i, end + 1).matchAll(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g)) copy.push(['COPY', m[2]]);
    }
  }
  for (const p of HTML) {
    const text = read(p).replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, '\n');
    for (const line of text.split('\n').map(s => s.trim()).filter(Boolean)) copy.push([rel(p), line]);
  }
  const words = copy.filter(([, t]) => /[A-Za-z]{2}/.test(t));
  const dashed = words.filter(([, t]) => /[-‐-―−]|&mdash;|&ndash;/.test(t));
  const banged = words.filter(([, t]) => t.indexOf('!') >= 0);
  const brand = words.filter(([, t]) => /Sky Walk|Sky Wolf Studios|Skywolf/i.test(t));
  say(dashed.length === 0, 'no dash in anything a player reads'
    + (dashed.length ? ': ' + dashed.map(d => JSON.stringify(d[1])).join(', ') : ' (' + words.length + ' strings)'));
  say(banged.length === 0, 'and no exclamation point' + (banged.length ? ': ' + banged.map(d => JSON.stringify(d[1])).join(', ') : ''));
  say(brand.length === 0, 'and the studio is Sky Wolf Studio, singular' + (brand.length ? ': ' + brand.map(d => JSON.stringify(d[1])).join(', ') : ''));
  const stray = [];
  for (const p of JS) {
    const s = stripComments(read(p));
    const re = /\.(textContent|innerText|innerHTML)\s*=\s*(['"`])((?:\\.|(?!\2)[^\\])*)\2|setAttribute\(\s*['"]aria-label['"]\s*,\s*(['"`])((?:\\.|(?!\4)[^\\])*)\4/g;
    for (const m of s.matchAll(re)) {
      const lit = (m[3] !== undefined ? m[3] : m[5]).replace(/<[^>]*>/g, ' ');
      if (/[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(lit)) stray.push(rel(p) + ': ' + JSON.stringify(lit.trim()));
    }
  }
  say(stray.length === 0, 'and no sentence is written to the page from outside COPY'
    + (stray.length ? ': ' + stray.join(', ') : ''));
}

/* ---- 8. duplicate keys ---- */
{
  let lits = 0, unclosed = 0;
  const dups = [];
  for (const p of JS) {
    /* ⛔ tools/dupkeys.mjs opens a literal only on a line that starts `var|let|const NAME = {`, the twelve's shape.
       A module writes `export const NAME = Object.freeze({`, which it never opened: the first planted duplicate
       here went green with "0 literals read". Both prefixes are blanked to spaces of the same length, so the
       sweep sees the literal and its line numbers still point at the file. */
    const src = read(p).replace(/^([ \t]*)export /gm, (m, s) => s + '       ')
      .replace(/Object\.freeze\(/g, '              ');
    const dk = dupKeys(src);
    lits += dk.literals; unclosed += dk.unclosed;
    for (const d of dk.dups) dups.push(basename(p) + ' ' + d.name + '.' + d.key + ' on lines ' + d.lines.join(' and '));
  }
  say(dups.length === 0, 'no object literal declares the same key twice'
    + (dups.length ? ': ' + dups.join('; ') : ' (' + lits + ' literals read)'));
  say(unclosed === 0, 'and every literal the sweep opened it could close' + (unclosed ? ' (' + unclosed + ' unclosed)' : ''));
}

console.log('');
if (fails.length) { console.log(fails.length + ' LINT FAILURE(S)'); process.exit(1); }
console.log('LINT OK');
