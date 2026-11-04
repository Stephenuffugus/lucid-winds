'use strict';
/* The one node-only check for Flatulence Fighter (satellites/flatulence-fighter/index.html), seconds, no browser.
 * THE TESTING LAW (FLATULENCE_FIGHTER_BUILD_PLAN.md): this runs after every step; a browser shot is taken once per
 * visual step with tools/ff-tests/shoot.mjs.
 *
 *   node tools/ff-tests/check.js            the live page
 *   node tools/ff-tests/check.js <file>     another copy of the page
 *
 * What it proves: every <script> block parses (vm); the style block's braces balance; every local asset the page names
 * (satellites/flatulence-fighter/assets/...) exists on disk and no raster has a side over 1600 px (the host resizes
 * bigger ones; the store, sharing and launch frames are exempt); no emoji anywhere in the file except inside comments
 * (the reskin's whole point: the game's glyphs were emoji); no dash of any kind and no exclamation mark in player
 * copy, in the markup's text AND in the script's quoted strings that read as prose (the fleet's copy law); the
 * viewport allows zoom; manifest.json beside the page parses when it exists. Prints the FAILING lines in full and
 * ends FF CHECK OK or FF CHECK FAILED. */
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ROOT = path.resolve(__dirname, '..', '..');
const PAGE = path.resolve(process.argv[2] || path.join(ROOT, 'satellites', 'flatulence-fighter', 'index.html'));
const html = fs.readFileSync(PAGE, 'utf8');
const fails = [];
const fail = m => fails.push(m);

/* 1. every script block parses */
const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
let parsed = 0;
for (const m of scripts) {
  if (/\bsrc=/.test(m[1]) || /type\s*=\s*["'](?!(text|application)\/javascript)/.test(m[1])) continue;
  if (!m[2].trim()) continue;
  try { new vm.Script(m[2], { filename: 'ff-block-' + (parsed + 1) }); parsed++; }
  catch (e) { fail('script block ' + (parsed + 1) + ' does not parse: ' + e.message); }
}
if (!parsed) fail('no inline script block found');

/* 2. the style block's braces balance (strings and url() stripped first) */
for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)) {
  const css = m[1].replace(/url\([^)]*\)/g, 'url()').replace(/"[^"]*"|'[^']*'/g, '""');
  let depth = 0, line = 1, bad = 0;
  for (const ch of css) { if (ch === '\n') line++; if (ch === '{') depth++; else if (ch === '}') { depth--; if (depth < 0) { bad = line; break; } } }
  if (bad || depth !== 0) fail('style block braces do not balance (depth ' + depth + (bad ? ', closes too early at line ' + bad : '') + ')');
}

/* 3. the local assets the page names exist, and rasters stay under 1600 px a side (store, sharing, launch exempt) */
const EXEMPT = /\/(store|sharing)\/|launch_first_frame/;
const named = new Set([...html.matchAll(/["'(]((?:\.\/)?assets\/[^"')?#\s]+)/g)].map(m => m[1].replace(/^\.\//, '')));
const DIR = path.dirname(PAGE);
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
for (const rel of named) {
  const p = path.join(DIR, rel);
  if (!fs.existsSync(p)) { fail('the page names a missing file: ' + rel); continue; }
  if (/\.(png|webp|jpe?g)$/i.test(rel) && !EXEMPT.test(rel)) { const d = dims(p); if (d && Math.max(d[0], d[1]) > 1600) fail('raster over 1600 px a side: ' + rel + ' ' + d.join('x')); }
}

/* 4. no emoji anywhere but comments; no dash or exclamation mark in player copy */
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{23E9}-\u{23FA}\u{25A0}-\u{25FF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{FE0F}]/u;
const lines = html.split('\n');
let inBlockComment = false;
const bodyStart = html.indexOf('<body'), scriptStart = html.indexOf('<script', bodyStart);
const bodyLine = html.slice(0, bodyStart).split('\n').length, scriptLine = scriptStart < 0 ? Infinity : html.slice(0, scriptStart).split('\n').length;
lines.forEach((line, i) => {
  const ln = i + 1;
  const t = line.trim();
  if (inBlockComment) { if (t.indexOf('*/') >= 0) inBlockComment = false; return; }
  if (t.startsWith('/*') && t.indexOf('*/') < 0) { inBlockComment = true; return; }
  if (t.startsWith('//') || t.startsWith('/*') || t.startsWith('*') || t.startsWith('<!--')) return;
  const code = line.replace(/\/\/.*$/, '');
  if (EMOJI.test(code)) fail('emoji at line ' + ln + ': ' + t.slice(0, 120));
  if (ln >= bodyLine && ln < scriptLine) {
    const text = line.replace(/<[^>]*>/g, ' ');
    if (/[—–]|\s-\s|![\s<"]|!$/.test(text)) fail('a dash or an exclamation mark in player copy at line ' + ln + ': ' + text.trim().slice(0, 120));
  } else if (ln >= scriptLine) {
    /* quoted strings that read as prose: letters and a space, no code characters */
    for (const m of code.matchAll(/(["'])((?:(?!\1)[^\\\n]|\\.)*)\1/g)) {
      const s = m[2];
      if (!/[A-Za-z]/.test(s) || s.indexOf(' ') < 0 || /[=<>(){}\[\]\/\\;|]/.test(s)) continue;
      if (/[—–]|\s-\s|!/.test(s)) fail('a dash or an exclamation mark in a player string at line ' + ln + ': ' + s.slice(0, 100));
    }
  }
});

/* 5. zoom allowed */
const vp = (html.match(/<meta name="viewport" content="([^"]*)"/) || [])[1] || '';
if (/maximum-scale=1|user-scalable=no/.test(vp)) fail('the viewport disables zoom: ' + vp);

/* 6. a manifest beside the page parses */
const mf = path.join(DIR, 'manifest.json');
if (fs.existsSync(mf)) { try { JSON.parse(fs.readFileSync(mf, 'utf8')); } catch (e) { fail('manifest.json does not parse: ' + e.message); } }

console.log('ff check: ' + parsed + ' script blocks parse, ' + named.size + ' local assets named');
if (fails.length) { for (const f of fails) console.log('  FAIL ' + f); console.log('FF CHECK FAILED (' + fails.length + ')'); process.exit(1); }
console.log('FF CHECK OK');
