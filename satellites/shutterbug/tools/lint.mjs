/* The static law over index.html (BUILD-PLAN.md T0.2, section 1.2, section 1.6).
 *
 *   node tools/lint.mjs                 lint satellites/shutterbug/index.html
 *   node tools/lint.mjs --page <file>   lint another copy (what tools/redwatch.js and the deploy check use)
 *
 * Prints every failing rule with the block id and line, a warning block (bare numerals in the core outside TUNING),
 * and LINT OK only when nothing failed. Every token scan over a script runs on the block with its comments and the
 * contents of its string, template and regex literals blanked first (a state machine below), so the words parent,
 * self, Date or Image in a comment never fail the build; `vm.Script` proves each block parses before any scan. */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const GAME = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const pi = args.indexOf('--page');
const PAGE = pi >= 0 ? args[pi + 1] : join(GAME, 'index.html');
const html = readFileSync(PAGE, 'utf8');

const fails = [], warns = [];
const fail = (rule, msg) => fails.push(rule + ': ' + msg);
const lineOf = (idx) => html.slice(0, idx).split('\n').length;

/* ---------- the stripper: comments out, literal contents blanked, newlines kept (line numbers survive) ---------- */
function strip(src) {
  let out = '', i = 0, last = '', word = '';
  const n = src.length;
  const blank = s => s.replace(/[^\n]/g, ' ');
  const regexOk = () => last === '' || '(,=:[!&|?{};+-*%<>~^'.includes(last) ||
    ['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw'].includes(word);
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { let j = i; while (j < n && src[j] !== '\n') j++; out += blank(src.slice(i, j)); i = j; continue; }
    if (c === '/' && d === '*') { const e = src.indexOf('*/', i + 2); const j = e < 0 ? n : e + 2; out += blank(src.slice(i, j)); i = j; continue; }
    if (c === "'" || c === '"') {
      let j = i + 1; while (j < n && src[j] !== c && src[j] !== '\n') { if (src[j] === '\\') j++; j++; }
      out += c + blank(src.slice(i + 1, j)) + (src[j] === c ? c : ''); i = j + 1; last = c; word = ''; continue;
    }
    if (c === '`') {
      let j = i + 1; while (j < n && src[j] !== '`') { if (src[j] === '\\') j++; j++; }
      out += '`' + blank(src.slice(i + 1, j)) + '`'; i = j + 1; last = '`'; word = ''; continue;
    }
    if (c === '/' && regexOk()) {
      let j = i + 1, cls = false;
      while (j < n && src[j] !== '\n') { if (src[j] === '\\') { j += 2; continue; } if (src[j] === '[') cls = true; else if (src[j] === ']') cls = false; else if (src[j] === '/' && !cls) break; j++; }
      j++; while (j < n && /[a-z]/.test(src[j])) j++;
      out += '/' + blank(src.slice(i + 1, j - 1)) + '/'; i = j; last = '/'; word = ''; continue;
    }
    out += c;
    if (/[A-Za-z0-9_$]/.test(c)) { word = /[A-Za-z0-9_$]/.test(src[i - 1] || '') ? word + c : c; last = 'w'; }
    else if (!/\s/.test(c)) { last = c; word = ''; }
    i++;
  }
  return out;
}

/* ---------- script blocks the way the browser's tokenizer sees them ---------- */
const SCRIPT_RE = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
const blocks = []; let m;
while ((m = SCRIPT_RE.exec(html))) {
  const attrs = m[1], idm = attrs.match(/\bid="([^"]+)"/);
  const srcStart = m.index + m[0].indexOf('>') + 1;
  blocks.push({ id: idm ? idm[1] : null, attrs, src: m[2], index: m.index, line: lineOf(srcStart), external: /\bsrc=/.test(attrs) });
}
const inline = blocks.filter(b => !b.external);

/* rule: the page bytes */
if (html.includes('\r')) fail('LF', 'the page holds a carriage return (LF line endings only)');
if (html.charCodeAt(0) === 0xfeff) fail('BOM', 'the page starts with a byte order mark');

/* rule: every inline script parses */
for (const b of inline) {
  try { new vm.Script(b.src, { filename: 'index.html#' + (b.id || 'anon'), lineOffset: b.line - 1 }); }
  catch (e) { fail('PARSE', (b.id || 'anon block at line ' + b.line) + ': ' + e.message + ' ' + ((e.stack || '').split('\n')[0])); }
  if (/<!--/.test(b.src)) fail('HTML-IN-SCRIPT', (b.id || 'anon') + ' holds "<!--"');
  if (/<script/i.test(b.src)) fail('HTML-IN-SCRIPT', (b.id || 'anon') + ' holds "<script"');
}

/* rule: the seventeen blocks of section 1.1 in order */
const ORDER = ['shell-fleet', 'core-ns', 'core-rng', 'core-palette', 'core-record', 'core-pipeline', 'core-reach', 'core-features',
  'core-sim', 'shell-capture', 'shell-render', 'shell-input', 'shell-audio', 'shell-save', 'shell-ui', 'shell-pwa', 'shell-boot'];
const ids = inline.map(b => b.id);
if (ids.join() !== ORDER.join()) fail('ORDER', 'inline script ids are [' + ids.join(', ') + '], want [' + ORDER.join(', ') + ']');
const fleet = blocks.find(b => b.id === 'shell-fleet');
if (!fleet || blocks.indexOf(fleet) !== 0 || fleet.index > html.indexOf('</head>')) fail('ORDER', 'shell-fleet must be the first script, in <head>');

/* rule: the core blocks, extracted exactly the way harness.js extracts them (CORE_RE, section 1.3) */
const CORE_RE = /^<script id="(core-[a-z]+)" data-core>\n([\s\S]*?)\n<\/script>/gm;
const CORE_ORDER = ['core-ns', 'core-rng', 'core-palette', 'core-record', 'core-pipeline', 'core-reach', 'core-features', 'core-sim'];
const core = []; CORE_RE.lastIndex = 0;
while ((m = CORE_RE.exec(html))) core.push({ id: m[1], src: m[2], index: m.index, line: lineOf(m.index) + 1 });
const looseCore = (html.match(/<script[^>]*\bdata-core\b/gi) || []).length;
if (core.length === 0) fail('CORE', 'no core block matched: LF line endings and column zero tags required');
if (core.map(b => b.id).join() !== CORE_ORDER.join()) fail('CORE', 'CORE_RE finds [' + core.map(b => b.id).join(', ') + '], want [' + CORE_ORDER.join(', ') + ']');
if (looseCore !== core.length) fail('CORE', looseCore + ' data-core tags in the page but CORE_RE extracts ' + core.length + ' (a tag not at column zero, or not alone on its line)');

const PREFIX = "(function (SB) { 'use strict';";
const TAIL = '})(globalThis.SB || (globalThis.SB = {}));';
const FORBIDDEN = ['window', 'document', 'navigator', 'location', 'self', 'parent', 'postMessage', 'localStorage', 'sessionStorage',
  'indexedDB', 'fetch', 'XMLHttpRequest', 'setTimeout', 'setInterval', 'requestAnimationFrame', 'queueMicrotask', 'performance',
  'Date', 'Intl', 'console', 'alert', 'eval', 'Function', 'Image', 'ImageData', 'ImageBitmap', 'createImageBitmap', 'OffscreenCanvas',
  'AudioContext', 'crypto', 'btoa', 'atob', 'TextEncoder', 'TextDecoder', 'import', 'require', 'process', 'Promise', 'async', 'await',
  'instanceof', 'localeCompare', 'normalize', 'globalThis', 'Reflect', 'Proxy', 'WeakRef'];
const MATH_OK = new Set(['floor', 'ceil', 'round', 'trunc', 'abs', 'min', 'max', 'sign', 'sqrt', 'clz32', 'imul', 'fround']);
for (const b of core) {
  const s = strip(b.src);
  const where = (idx) => b.id + ' line ' + (b.line + s.slice(0, idx).split('\n').length - 1);
  if (b.src.toLowerCase().includes('</script')) fail('CORE', b.id + ' contains "</script" (the browser would end the block there)');
  /* the IIFE shape, and nothing at top level outside it */
  const t = s.trim();
  if (!t.startsWith(strip(PREFIX))) fail('IIFE', b.id + ' must begin with ' + PREFIX);
  else if (!t.endsWith(TAIL)) fail('IIFE', b.id + ' must end with ' + TAIL);
  else {
    const open = t.indexOf('{');
    let depth = 0, close = -1;
    for (let k = open; k < t.length; k++) { if (t[k] === '{') depth++; else if (t[k] === '}') { depth--; if (depth === 0) { close = k; break; } } }
    if (close !== t.length - TAIL.length) fail('IIFE', b.id + ': code outside the IIFE (the function body closes before the tail)');
  }
  /* the forbidden tokens, on the stripped text up to the tail: globalThis is legal in the tail and nowhere else */
  const tailAt = s.lastIndexOf(TAIL);
  const body = tailAt >= 0 ? s.slice(0, tailAt) : s;
  for (const w of FORBIDDEN) {
    const re = new RegExp('(^|[^A-Za-z0-9_$])' + w + '(?![A-Za-z0-9_$])', 'g'); let mm;
    while ((mm = re.exec(body))) fail('PURITY', where(mm.index + mm[1].length) + ': forbidden token "' + w + '"');
  }
  let mm;
  const mre = /\bMath\s*(\.\s*([A-Za-z_$][\w$]*)|\[)/g;
  while ((mm = mre.exec(body))) if (!mm[2] || !MATH_OK.has(mm[2])) fail('PURITY', where(mm.index) + ': Math' + (mm[2] ? '.' + mm[2] : '[...]') + ' is not allowed in the core (not correctly rounded across engines, or random)');
  if (/\*\*/.test(body)) fail('PURITY', where(body.indexOf('**')) + ': the ** operator (Math.pow by another name)');
  if (/\btoLocale/.test(body)) fail('PURITY', where(body.search(/\btoLocale/)) + ': toLocale*');
  /* bare grid derived sizes: legal only inside GRID_PRESETS and the TUNING literal (DESIGN's own 768, the 2x width) */
  let gridScan = body;
  if (b.id === 'core-ns') {
    for (const lit of ['SB.TUNING = deepFreeze(', 'SB.GRID_PRESETS = deepFreeze(']) {
      const at = gridScan.indexOf(lit);
      if (at < 0) continue;
      let depth = 0, k = at + lit.length - 1;
      for (; k < gridScan.length; k++) { if (gridScan[k] === '(') depth++; else if (gridScan[k] === ')') { depth--; if (depth === 0) break; } }
      gridScan = gridScan.slice(0, at) + gridScan.slice(at, k + 1).replace(/[^\n]/g, ' ') + gridScan.slice(k + 1);
    }
  }
  const g = /(^|[^\w$.])(1152|384|768)(?![\w$.])/g;
  while ((mm = g.exec(gridScan))) fail('GRID', where(mm.index) + ': bare ' + mm[2] + ' in a core block (derive it from SB.GRID)');
  if (['core-sim', 'core-pipeline', 'core-reach', 'core-features'].includes(b.id)) {
    const nre = /(^|[^\w$.])(\d+(?:\.\d+)?)(?![\w$.x])/g; const big = [];
    while ((mm = nre.exec(body))) { const v = Number(mm[2]); if (v > 16 && v !== 256) big.push(mm[2] + ' (' + where(mm.index) + ')'); }
    if (big.length) warns.push(b.id + ': ' + big.length + ' bare numeral' + (big.length > 1 ? 's' : '') + ' over 16 outside TUNING: ' + big.slice(0, 12).join(', ') + (big.length > 12 ? ' ...' : ''));
  }
}

/* rule: the fleet include, exactly once, on its own line immediately before </head> (section 1.1) */
const INCLUDE = '<script src="/music-unlocks.js" defer></script>';
const inc = html.split(INCLUDE).length - 1;
if (inc !== 1) fail('INCLUDE', 'the fleet include appears ' + inc + ' times, want exactly 1: ' + INCLUDE);
else if (!html.includes('\n' + INCLUDE + '\n</head>')) fail('INCLUDE', 'the fleet include must sit on its own line immediately before </head>');

/* rule: the fleet protocol strings deploy.sh greps */
if (!html.includes('SWS_EMBED')) fail('FLEET', 'no SWS_EMBED');
if (!html.includes('window.SWS_EXIT')) fail('FLEET', 'SWS_EXIT is not assigned on window');

/* rule: per <style> block, every comment closes and none opens inside another (_EXIT-AUDIT.md batch B) */
const STYLE_RE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
let si = 0;
while ((m = STYLE_RE.exec(html))) {
  si++;
  const css = m[1];
  const opens = css.split('/*').length - 1, closes = css.split('*/').length - 1;
  if (opens !== closes) fail('STYLE', 'style block ' + si + ' (line ' + lineOf(m.index) + '): ' + opens + ' "/*" against ' + closes + ' "*/"');
  let inC = false;
  for (let k = 0; k < css.length - 1; k++) {
    if (!inC && css[k] === '/' && css[k + 1] === '*') { inC = true; k++; }
    else if (inC && css[k] === '/' && css[k + 1] === '*') { fail('STYLE', 'style block ' + si + ': a comment opens inside a comment at line ' + lineOf(m.index + k)); break; }
    else if (inC && css[k] === '*' && css[k + 1] === '/') { inC = false; k++; }
  }
}

/* rule: the copy law over SB.ui.COPY and over every text the markup shows (section 0 law 6) */
function copyLaw(where, s) {
  if (typeof s !== 'string') return;
  if (/[-‐-―−﹘﹣－]/.test(s)) fail('COPY', where + ': a dash in player copy: "' + s + '"');
  if (/!/.test(s)) fail('COPY', where + ': an exclamation mark in player copy: "' + s + '"');
  if (/Sky Wolf Studios/i.test(s)) fail('COPY', where + ': "Sky Wolf Studio" is singular: "' + s + '"');
}
const ui = inline.find(b => b.id === 'shell-ui');
const cm = ui && ui.src.match(/ui\.COPY\s*=\s*Object\.freeze\(/);
if (!cm) fail('COPY', 'shell-ui holds no "ui.COPY = Object.freeze(" (every player string lives in one object)');
else {
  const st = strip(ui.src);
  let k = cm.index + cm[0].length, depth = 0, end = -1;
  for (; k < st.length; k++) { if (st[k] === '{') depth++; else if (st[k] === '}') { depth--; if (depth === 0) { end = k + 1; break; } } }
  let COPY = null;
  try { COPY = vm.runInNewContext('(' + ui.src.slice(cm.index + cm[0].length, end) + ')'); } catch (e) { fail('COPY', 'COPY does not evaluate as a plain literal: ' + e.message); }
  if (COPY) {
    const walk = (o, path) => { for (const key of Object.keys(o)) { const v = o[key]; if (v && typeof v === 'object') walk(v, path + '.' + key); else if (typeof v !== 'string') fail('COPY', path + '.' + key + ' is not a string'); else copyLaw(path + '.' + key, v); } };
    walk(COPY, 'COPY');
    const keys = new Set(Object.keys(COPY));
    for (const dm of html.matchAll(/data-copy="([^"]+)"/g)) if (!keys.has(dm[1])) fail('COPY', 'data-copy="' + dm[1] + '" has no COPY entry');
  }
}
const bodyStart = html.indexOf('<body'), firstScript = html.indexOf('<script', bodyStart);
const markup = html.slice(bodyStart, firstScript < 0 ? html.length : firstScript);
for (const t of markup.replace(/<[^>]*>/g, '\n').split('\n').map(x => x.trim()).filter(Boolean)) copyLaw('markup text', t);
for (const am of markup.matchAll(/\b(aria-label|title|alt|placeholder)="([^"]*)"/g)) copyLaw('markup ' + am[1], am[2]);
const tm = html.match(/<title>([^<]*)<\/title>/); if (tm) copyLaw('<title>', tm[1]);
const dm = html.match(/<meta name="description" content="([^"]*)"/); if (dm) copyLaw('meta description', dm[1]);

/* rule: no text under 0.7rem (11.2 px) */
for (const fm of html.matchAll(/font-size\s*:\s*([0-9.]+)\s*(rem|em|px)|fontSize\s*=\s*['"]([0-9.]+)(rem|em|px)|\bfont\s*:\s*(?:[a-z0-9-]+\s+)*?([0-9.]+)(rem|em|px)/gi)) {
  const v = Number(fm[1] || fm[3] || fm[5]), u = (fm[2] || fm[4] || fm[6]).toLowerCase();
  const px = u === 'px' ? v : v * 16;
  if (px < 11.2 - 1e-9) fail('FONT', 'line ' + lineOf(fm.index) + ': "' + fm[0] + '" is under 0.7rem');
}

/* rule: the build stamp deploy.sh greps */
const bm = html.match(/SB\.BUILD\s*=\s*'([^']*)'/);
if (!bm) fail('BUILD', 'no SB.BUILD = \'...\' in the page');
else if (!/^sb-[a-z0-9-]+$/.test(bm[1])) fail('BUILD', 'SB.BUILD "' + bm[1] + '" does not match sb-[a-z0-9-]+');

/* rule: one localStorage key, shutterbug.v1 (section 2.4) */
for (const b of inline) {
  for (const km of b.src.matchAll(/localStorage\s*(?:\.\s*(?:getItem|setItem|removeItem)\s*\(\s*|\[\s*)(['"`])([^'"`]*)\1/g))
    if (km[2] !== 'shutterbug.v1') fail('STORAGE', (b.id || 'anon') + ': localStorage key "' + km[2] + '" (only shutterbug.v1)');
  if (/controllerchange/.test(b.src) && /location\s*\.\s*reload|reload\s*\(/.test(b.src)) fail('RELOAD', (b.id || 'anon') + ' pairs controllerchange with a reload');
}

if (warns.length) console.log('warnings (bare numerals over 16 outside TUNING; 256, shifts and masks are legitimate):\n  ' + warns.join('\n  '));
if (fails.length) { console.log('LINT FAILED: ' + fails.length + '\n' + fails.map(f => '  FAIL ' + f).join('\n')); process.exit(1); }
console.log('lint: ' + inline.length + ' inline blocks parse, ' + core.length + ' core blocks pure and in order, ' + si + ' style block' + (si === 1 ? '' : 's') + ' balanced, the include once, the copy law');
console.log('LINT OK');
