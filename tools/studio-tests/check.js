'use strict';
/* The one node-only check for the Music Studio (studio.html), seconds, no browser. THE TESTING LAW (LOAF_BUILD_PLAN.md):
 * this runs after every step; a browser shot is taken once per visual step with tools/studio-tests/shoot.mjs.
 *
 *   node tools/studio-tests/check.js            studio.html at the repo root
 *   node tools/studio-tests/check.js <file>     another copy of the page
 *
 * What it proves: every <script> block parses (vm, so a stray brace in a data URI cannot fool it); the one style block's
 * braces balance; every local asset the page names (assets/games/song/...) exists on disk and no raster has a side over
 * 1600 px (the host's optimiser resizes bigger ones, except the frames the plan exempts); no emoji is left in a
 * button, option or label (the reskin's whole point); no dash of any kind in player facing copy inside the markup
 * (the studio's copy law: the STARTERS names and the markup's text; code strings are not scanned); and the viewport
 * allows zoom. Prints the FAILING lines in full, never a tail, and ends STUDIO CHECK OK or STUDIO CHECK FAILED. */
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ROOT = path.resolve(__dirname, '..', '..');
const PAGE = path.resolve(process.argv[2] || path.join(ROOT, 'studio.html'));
const html = fs.readFileSync(PAGE, 'utf8');
const fails = [];
const fail = m => fails.push(m);

/* 1. every script block parses */
const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
let parsed = 0;
for (const m of scripts) {
  if (/\bsrc=/.test(m[1]) || /type\s*=\s*["'](?!(text|application)\/javascript)/.test(m[1])) continue;
  try { new vm.Script(m[2], { filename: 'studio-block-' + (parsed + 1) }); parsed++; }
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

/* 3. the local assets the page names exist, and rasters stay under 1600 px a side (frames exempt) */
const EXEMPT = /\/(frames|store)\//;
const named = new Set([...html.matchAll(/["'(](assets\/games\/song\/[^"')?#\s]+)/g)].map(m => m[1]));
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
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) { fail('the page names a missing file: ' + rel); continue; }
  if (/\.(png|webp|jpe?g)$/i.test(rel) && !EXEMPT.test(rel)) { const d = dims(p); if (d && Math.max(d[0], d[1]) > 1600) fail('raster over 1600 px a side: ' + rel + ' ' + d.join('x')); }
}

/* 4. no emoji in a button, option or label; no dash in the markup's player copy */
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{23E9}-\u{23FA}\u{25A0}-\u{25FF}\u{2190}-\u{21FF}]/u;
const bodyStart = html.indexOf('<body'), scriptStart = html.indexOf('<script', bodyStart);
const markup = html.slice(bodyStart, scriptStart < 0 ? undefined : scriptStart);
let ln = html.slice(0, bodyStart).split('\n').length;
for (const line of markup.split('\n')) {
  const text = line.replace(/<[^>]*>/g, ' ');
  if (/<(button|option|label|h[1-4]|span class="st-|div class="st-)/.test(line) && EMOJI.test(line)) fail('emoji left in a control at line ' + ln + ': ' + line.trim().slice(0, 120));
  if (/[—–]|\s-\s/.test(text)) fail('a dash in player copy at line ' + ln + ': ' + text.trim().slice(0, 120));
  ln++;
}
/* the STARTERS names and descs are player copy too */
for (const m of html.matchAll(/\{name:'([^']*)',\s*(?:emoji|art):'[^']*',\s*desc:'([^']*)'/g)) if (/[—–-]/.test(m[1] + ' ' + m[2])) fail('a dash in a starter name or desc: ' + m[1] + ' / ' + m[2]);

/* 5. zoom allowed */
const vp = (html.match(/<meta name="viewport" content="([^"]*)"/) || [])[1] || '';
if (/maximum-scale=1|user-scalable=no/.test(vp)) fail('the viewport disables zoom: ' + vp);

console.log('studio check: ' + parsed + ' script blocks parse, ' + named.size + ' local assets named');
if (fails.length) { for (const f of fails) console.log('  FAIL ' + f); console.log('STUDIO CHECK FAILED (' + fails.length + ')'); process.exit(1); }
console.log('STUDIO CHECK OK');
