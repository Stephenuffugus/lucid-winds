'use strict';
/* The one node only check for Sunforge (satellites/ring-stacker/index.html), seconds, no browser.
 * THE TESTING LAW (SUNFORGE_BUILD_PLAN.md): this runs after every step; a browser shot is taken once per visual step
 * with tools/sunforge-tests/shoot.mjs.
 *
 *   node tools/sunforge-tests/check.js            the game page
 *   node tools/sunforge-tests/check.js <file>     another copy of the page
 *
 * What it proves: every <script> block parses (vm); the style block's braces balance; every local asset the page names
 * (assets/..., icons/..., og/...) exists on disk and no raster has a side over 1600 px (the sharing frames are exempt,
 * they are store sized by request); nothing under assets/store is named (store art never ships); no emoji anywhere
 * outside comments, HTML entities decoded first (the game wrote its arrows and stars as entities); no dash of any kind
 * and no exclamation mark in player copy, in the markup's text AND in the script's quoted prose strings; the old name
 * Ring Stacker appears in no player string; the saved keys and the Sunbeam ids survive; the viewport allows zoom; the
 * web manifest beside the page parses. Prints the FAILING lines in full and ends SF CHECK OK or SF CHECK FAILED. */
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ROOT = path.resolve(__dirname, '..', '..');
const PAGE = path.resolve(process.argv[2] || path.join(ROOT, 'satellites', 'ring-stacker', 'index.html'));
const html = fs.readFileSync(PAGE, 'utf8');
const DIR = path.dirname(PAGE);
const fails = [];
const fail = m => fails.push(m);
const decode = s => s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)));

/* 1. every script block parses */
const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
let parsed = 0;
for (const m of scripts) {
  if (/\bsrc=/.test(m[1]) || /type\s*=\s*["'](?!(text|application)\/javascript)/.test(m[1])) continue;
  if (!m[2].trim()) continue;
  try { new vm.Script(m[2], { filename: 'sf-block-' + (parsed + 1) }); parsed++; }
  catch (e) { fail('script block ' + (parsed + 1) + ' does not parse: ' + e.message); }
}
if (!parsed) fail('no inline script block found');

/* 2. the style blocks' braces balance (strings and url() stripped first) */
for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)) {
  const css = m[1].replace(/url\([^)]*\)/g, 'url()').replace(/"[^"]*"|'[^']*'/g, '""');
  let depth = 0, line = 1, bad = 0;
  for (const ch of css) { if (ch === '\n') line++; if (ch === '{') depth++; else if (ch === '}') { depth--; if (depth < 0) { bad = line; break; } } }
  if (bad || depth !== 0) fail('style block braces do not balance (depth ' + depth + (bad ? ', closes too early at line ' + bad : '') + ')');
}

/* 3. the local files the page names exist; rasters stay under 1600 px a side; no store art is named */
function dims(p) {
  const b = fs.readFileSync(p);
  if (b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP') {
    const k = b.slice(12, 16).toString();
    if (k === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (k === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    if (k === 'VP8L') { const x = b.readUInt32LE(21); return [1 + (x & 0x3fff), 1 + ((x >> 14) & 0x3fff)]; }
  }
  if (b[0] === 0xff && b[1] === 0xd8) { let i = 2; while (i < b.length) { if (b[i] !== 0xff) { i++; continue; } const mk = b[i + 1]; if (mk >= 0xc0 && mk <= 0xcf && mk !== 0xc4 && mk !== 0xc8 && mk !== 0xcc) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]; i += 2 + b.readUInt16BE(i + 2); } }
  return null;
}
const named = new Set([...html.matchAll(/["'(]((?:\.\/)?(?:assets|icons|og)\/[^"')?#\s]+)/g)].map(m => m[1].replace(/^\.\//, '')));
for (const rel of named) {
  if (/(^|\/)store\//.test(rel)) { fail('store art named by the page (it never ships): ' + rel); continue; }
  const p = path.join(DIR, rel);
  if (!fs.existsSync(p)) { fail('the page names a missing file: ' + rel); continue; }
  if (/\.(png|webp|jpe?g)$/i.test(rel) && !/\/sharing\//.test(rel)) { const d = dims(p); if (d && Math.max(d[0], d[1]) > 1600) fail('raster over 1600 px a side: ' + rel + ' ' + d.join('x')); }
}

/* 4. no emoji but in comments; no dash or exclamation mark in player copy; no old name in player strings */
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{27C0}-\u{27FF}\u{2B00}-\u{2BFF}\u{23E9}-\u{23FA}\u{25A0}-\u{25FF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{FE0F}]/u;
const lines = html.split('\n');
let inBlockComment = false, inHtmlComment = false;
const bodyStart = html.indexOf('<body'), scriptStart = html.indexOf('<script', bodyStart);
const bodyLine = html.slice(0, bodyStart).split('\n').length, scriptLine = scriptStart < 0 ? Infinity : html.slice(0, scriptStart).split('\n').length;
lines.forEach((raw, i) => {
  const ln = i + 1;
  const line = decode(raw);
  const t = line.trim();
  if (inHtmlComment) { if (t.indexOf('-->') >= 0) inHtmlComment = false; return; }
  if (t.startsWith('<!--') && t.indexOf('-->') < 0) { inHtmlComment = true; return; }
  if (inBlockComment) { if (t.indexOf('*/') >= 0) inBlockComment = false; return; }
  if (t.startsWith('/*') && t.indexOf('*/') < 0) { inBlockComment = true; return; }
  if (t.startsWith('//') || t.startsWith('/*') || t.startsWith('*') || t.startsWith('<!--')) return;
  const code = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '').replace(/<!--.*?-->/g, '');
  if (EMOJI.test(code)) fail('emoji at line ' + ln + ': ' + t.slice(0, 120));
  if (ln >= bodyLine && ln < scriptLine) {
    const text = code.replace(/<[^>]*>/g, ' ');
    if (/[—–]|\s-\s|![\s<"]|!$/.test(text)) fail('a dash or an exclamation mark in player copy at line ' + ln + ': ' + text.trim().slice(0, 120));
    if (/Ring Stacker/.test(text)) fail('the old name in player copy at line ' + ln);
  } else if (ln >= scriptLine) {
    for (const m of code.matchAll(/(["'])((?:(?!\1)[^\\\n]|\\.)*)\1/g)) {
      const s = m[2];
      if (/Ring Stacker/.test(s)) fail('the old name in a player string at line ' + ln + ': ' + s.slice(0, 100));
      if (!/[A-Za-z]/.test(s) || s.indexOf(' ') < 0 || /[=<>(){}\[\]\/\;|]/.test(s)) continue;
      if (/[—–]|\s-\s|!/.test(s)) fail('a dash or an exclamation mark in a player string at line ' + ln + ': ' + s.slice(0, 100));
    }
  }
});

/* 5. the saved keys and the Sunbeam ids survive (law 5) */
for (const k of ["'rs_set'", "'rs_prog'", "'rs_daily'", "'rs_ziphint'", "'sw_sb_ringstacker'", 'gameId:"ringstacker"', "'ringstacker:level'", "'ringstacker:daily'"]) {
  if (html.indexOf(k) < 0) fail('a saved key or Sunbeam id is gone: ' + k);
}

/* 6. zoom allowed */
const vp = (html.match(/<meta name="viewport" content="([^"]*)"/) || [])[1] || '';
if (/maximum-scale=1|user-scalable=no/.test(vp)) fail('the viewport disables zoom: ' + vp);

/* 7. the web manifest beside the page parses */
for (const mf of ['manifest.webmanifest', 'manifest.json']) {
  const p = path.join(DIR, mf);
  if (fs.existsSync(p)) { try { JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { fail(mf + ' does not parse: ' + e.message); } }
}

console.log('sf check: ' + parsed + ' script blocks parse, ' + named.size + ' local files named');
if (fails.length) { for (const f of fails) console.log('  FAIL ' + f); console.log('SF CHECK FAILED (' + fails.length + ')'); process.exit(1); }
console.log('SF CHECK OK');
