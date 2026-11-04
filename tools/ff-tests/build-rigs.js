'use strict';
/* Writes Astra's five bust rigs into satellites/flatulence-fighter/index.html (FLATULENCE_FIGHTER_BUILD_PLAN.md step 3).
 * Rerun it when a new pack arrives; it replaces everything between the two rig markers inside <svg id="face"> and
 * touches nothing else.
 *
 *   node tools/ff-tests/build-rigs.js [packdir]
 *
 * Each <name>_rig.svg (720 box, one <g transform="scale(2)"> of 360 logical units) becomes <g class="rig"
 * data-rig="<name>"> in the page's 360 viewBox. The rig's ids become classes so five rigs (and the menu's copy) can
 * live in one document: body -> rig-body, expression_<state> -> x x-<state> (its inline display style dropped; the
 * page's CSS shows exactly one by data-tier), accessories_front -> rig-front. The CSS variables (coat, paper, ink)
 * stay as Astra wrote them. */
const fs = require('node:fs'), path = require('node:path');
const ROOT = path.resolve(__dirname, '..', '..');
const PAGE = path.join(ROOT, 'satellites', 'flatulence-fighter', 'index.html');
const PACK = path.resolve(process.argv[2] || '/workspaces/flatulence-fighter-astra-v1/pack/flatulence-fighter-astra-pack-v1');
const DIR = path.join(PACK, 'assets', 'c_player');
const START = '<!-- ff-rigs start (tools/ff-tests/build-rigs.js writes this block) -->';
const END = '<!-- ff-rigs end -->';
const NAMES = ['everyman', 'gentleman', 'grandma', 'mime', 'bulldog'];
const STATES = ['calm', 'nervous', 'strain', 'critical', 'blowout', 'relief'];

let out = '';
for (const n of NAMES) {
  const src = fs.readFileSync(path.join(DIR, n + '_rig.svg'), 'utf8');
  const open = src.match(/<svg\b[^>]*>\s*<g transform="scale\(2\)">/);
  if (!open) { console.error(n + ': no scale(2) group under the root'); process.exit(1); }
  let body = src.slice(open.index + open[0].length, src.lastIndexOf('</g>', src.lastIndexOf('</svg>'))).trim();
  if (/<(script|style|foreignObject|image)\b|\bon[a-z]+=|href=/i.test(body)) { console.error('refusing ' + n + ': it carries script, style, an image or a link'); process.exit(1); }
  for (const s of STATES) {
    const re = new RegExp('<g id="expression_' + s + '" style="display:(inline|none)">');
    if (!re.test(body)) { console.error(n + ': no expression_' + s + ' group'); process.exit(1); }
    body = body.replace(re, '<g class="x x-' + s + '">');
  }
  body = body.replace('<g id="body">', '<g class="rig-body">').replace('<g id="accessories_front">', '<g class="rig-front">');
  if (/\bid="/.test(body)) { console.error(n + ': an id is left: ' + body.match(/\bid="[^"]*"/)[0]); process.exit(1); }
  out += '<g class="rig" data-rig="' + n + '">' + body + '</g>\n';
}

let html = fs.readFileSync(PAGE, 'utf8');
const s = html.indexOf(START), e = html.indexOf(END);
if (s < 0 || e < s) { console.error('the rig markers are not in the page'); process.exit(1); }
html = html.slice(0, s) + START + '\n' + out + END + html.slice(e + END.length);
fs.writeFileSync(PAGE, html);
console.log('rigs: ' + NAMES.length + ' busts, ' + out.length + ' bytes written into satellites/flatulence-fighter/index.html');
