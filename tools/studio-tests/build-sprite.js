'use strict';
/* Writes Astra's SVG set into studio.html as ONE inline sprite (MUSIC_STUDIO_BUILD_PLAN.md step 1). Rerun it when a new
 * pack arrives; it replaces everything between the two sprite markers and touches nothing else.
 *
 *   node tools/studio-tests/build-sprite.js [packdir]
 *
 * packdir defaults to /workspaces/music-studio-astra-v1/pack/music-studio-astra-pack-v1 (the masters stay there).
 * Each file becomes <symbol id="i-<name>"> with the file's own viewBox; icon_ is dropped from the name (icon_play.svg
 * is i-play), every other file keeps its name (lane_drums.svg is i-lane_drums). Ids inside a file get the symbol's
 * name as a prefix so two symbols can never clash. Use it in the page through ic('<name>'). */
const fs = require('node:fs'), path = require('node:path');
const ROOT = path.resolve(__dirname, '..', '..');
const PAGE = path.join(ROOT, 'studio.html');
const PACK = path.resolve(process.argv[2] || '/workspaces/music-studio-astra-v1/pack/music-studio-astra-pack-v1');
const A = path.join(PACK, 'assets');
const START = '<!-- gs-sprite start (tools/studio-tests/build-sprite.js writes this block) -->';
const END = '<!-- gs-sprite end -->';

const files = [];
const add = (dir, re) => fs.readdirSync(path.join(A, dir)).filter(f => re.test(f)).sort().forEach(f => files.push(path.join(dir, f)));
add('c_icons', /^(icon|family)_.*\.svg$/);
add('b_grid_lanes', /^(lane|kit)_.*\.svg$/);
add('e_tools', /^(listening_dots|rhythm_necklace|rhythm_hit|circle_of_fifths_ring|circle_key_cell_\d\d)\.svg$/);
files.push(path.join('a_identity', 'wordmark_music_studio_on_dark.svg'));

const want = { icon: 66, family: 12, lane: 4, kit: 8, circle_key_cell: 12 };
const count = k => files.filter(f => path.basename(f).startsWith(k + '_')).length;
for (const k in want) if (count(k) !== want[k]) { console.error('expected ' + want[k] + ' ' + k + '_ files, found ' + count(k)); process.exit(1); }

let out = '<svg id="gs-sprite" aria-hidden="true" style="display:none" xmlns="http://www.w3.org/2000/svg">\n';
for (const rel of files) {
  const src = fs.readFileSync(path.join(A, rel), 'utf8');
  const base = path.basename(rel, '.svg');
  const name = base.replace(/^icon_/, '').replace(/_on_dark$/, '');
  const open = src.match(/<svg\b[^>]*>/);
  const vb = open && open[0].match(/viewBox="([^"]+)"/);
  if (!vb) { console.error('no viewBox in ' + rel); process.exit(1); }
  let body = src.slice(open.index + open[0].length, src.lastIndexOf('</svg>')).trim();
  if (/<(script|style|foreignObject|image)\b|\bon[a-z]+=|href=/i.test(body)) { console.error('refusing ' + rel + ': it carries script, style, an image or a link'); process.exit(1); }
  body = body.replace(/\bid="([^"]+)"/g, (m, id) => 'id="' + name + '-' + id + '"').replace(/url\(#([^)]+)\)/g, (m, id) => 'url(#' + name + '-' + id + ')');
  out += '<symbol id="i-' + name + '" viewBox="' + vb[1] + '">' + body + '</symbol>\n';
}
/* Icons the pack lacks, drawn in Astra's grammar (24 box, 1.8 stroke, round ends, currentColor). */
const EXTRA = {
  pause: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5v14M15 5v14"/></g>'
};
for (const k in EXTRA) out += '<symbol id="i-' + k + '" viewBox="0 0 24 24">' + EXTRA[k] + '</symbol>\n';
out += '</svg>';

let html = fs.readFileSync(PAGE, 'utf8');
const block = START + '\n' + out + '\n' + END;
const s = html.indexOf(START), e = html.indexOf(END);
if (s >= 0 && e > s) html = html.slice(0, s) + block + html.slice(e + END.length);
else { const b = html.indexOf('<body>'); if (b < 0) { console.error('no <body> in studio.html'); process.exit(1); } html = html.slice(0, b + 6) + '\n' + block + html.slice(b + 6); }
fs.writeFileSync(PAGE, html);
console.log('sprite: ' + (files.length + Object.keys(EXTRA).length) + ' symbols, ' + out.length + ' bytes written into studio.html');
