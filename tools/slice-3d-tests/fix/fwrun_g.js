// Fail-watch for Part G (24 Oct: G1 the resting knife on the grass, G2 the shelf as a price ladder): each group writes a copy of index.html with one rule taken
// out as index-fw.html, runs its row slice against it and must go RED on the check named by `want`. node fwrun_g.js [group ...]
const fs = require('fs'), cp = require('child_process');
const DIR = '/workspaces/lucid-winds/satellites/slice-3d/', SRC = DIR + 'index.html', TMP = DIR + 'index-fw.html', FIX = __dirname + '/';
const G = {
  NOSINK: { slice: 'row22.mjs', want: 'lies ON the surface you see', why: 'the G1 lowering taken out (v7.2)', muts: [ ['knife.position.y-=KDRAW.drawn;', ''] ] },
  CAP: { slice: 'row22.mjs', want: 'lies ON the surface you see', why: 'the lowering capped short of the gap', muts: [ ['Math.min(gap, KR-KDHH-KDRAW.vt)', 'Math.min(gap, 0.3)'] ] },
  HALF: { slice: 'row22.mjs', want: 'lies ON the surface you see', why: 'only half the gap lowered', muts: [ ['KDRAW.drawn=Math.max(0,Math.min(KDRAW.sink, gap));', 'KDRAW.drawn=Math.max(0,Math.min(KDRAW.sink, gap))*0.5;'] ] },
  BOX: { slice: 'row22.mjs', want: 'lies ON the surface you see', why: 'the review: the recipe box (KHH) taken for the drawn height', muts: [ ['-KDHH*Math.abs(Math.cos(rz));   /* the knife as DRAWN', '-KHH*Math.abs(Math.cos(rz));   /* the knife as DRAWN'], ['Math.min(gap, KR-KDHH-KDRAW.vt)', 'Math.min(gap, KR-KHH-KDRAW.vt)'] ] },
  ARTH: { slice: 'row22.mjs', want: 'lies ON the surface you see', why: 'the painting\'s height never taken', muts: [ ['    KDHH=h/2*KSCALE;', '    KDHH=KDHH;'] ] },
  NOVT: { slice: 'row22.mjs', want: 'lies ON the surface you see', why: 'the review: lowered onto the collider (y 0), into the drawn grass lip', muts: [ ['var gap=low-(sY+KDRAW.vt);', 'var gap=low-sY;'], ['Math.min(gap, KR-KDHH-KDRAW.vt)', 'Math.min(gap, KR-KDHH)'] ] },
  JUMPUP: { slice: 'row22.mjs', want: 'never draws the knife going up', why: 'the review: the lowering let go while falling from rest (v7.3 first cut)', muts: [ ['      else KDRAW.rise=false;\n', '      else { KDRAW.rise=false; KDRAW.sink-=KDRAW.sink*Math.min(1,dt*KSINK_OUT); }\n'] ] },
  SHAKE: { slice: 'row22.mjs', want: 'lies still on it', why: 'the review: a flickering contact lets go and takes the lowering every other step', muts: [ ['      else KDRAW.rise=false;\n', '      else { KDRAW.rise=false; KDRAW.sink=0; }\n'], ['var onIt=G.grounded||(Math.abs(G.vy)<1.5&&Math.abs(G.y-KR-sY)<0.05);', 'var onIt=G.grounded;'] ] },
  AIR: { slice: 'row22.mjs', want: 'let go over the first metre of a take off', why: 'the lowering kept through a whole rise', muts: [ ['KDRAW.sink=KDRAW.s0*Math.max(0, 1-(yP-KDRAW.y0)/KSINK_RISE);', 'KDRAW.sink=KDRAW.s0;'] ] },
  FF: { slice: 'row22.mjs', want: 'let go over the first metre of a take off', why: 'Freefall lowered too', muts: [ ['  else KDRAW.sink=0;\n', '  else { KDRAW.sink=0.5; KDRAW.drawn=0.5; }\n'] ] },
  NOLIFT: { slice: 'row22.mjs', want: 'never dips below', why: 'F2: the lift taken out (the measured drawn meshes must still catch it)', muts: [ ['if(low<sY){ KDRAW.lift=sY-low; knife.position.y+=KDRAW.lift; low=sY; }', 'if(false){}'] ] },
  ORDER: { slice: 'row16.mjs', want: 'reads as a price ladder', why: 'the v7.2 shelf (the six slotted after their tier)', muts: [ ["var SKIN_ORDER=['classic','cleaver','socktopus','bamboo','butterbuddy','trowel','paintbrush','quill','katana','pencil','obsidian','spatulot','icicle','crystal','tuningfork','gold','emberfang','discopickle','prism','croissant','scythe',", "var SKIN_ORDER=['classic','cleaver','paintbrush','bamboo','trowel','quill','socktopus','butterbuddy','katana','crystal','obsidian','icicle','tuningfork','spatulot','pencil','gold','emberfang','prism','scythe','discopickle','croissant',"] ] },
  SWAP: { slice: 'row16.mjs', want: 'reads as a price ladder', why: 'two neighbours swapped (bamboo before socktopus)', muts: [ ["'cleaver','socktopus','bamboo',", "'cleaver','bamboo','socktopus',"] ] },
  TROPHY: { slice: 'row16.mjs', want: 'reads as a price ladder', why: 'a trophy in the middle of the priced knives', muts: [ ["'katana','pencil',", "'katana','cosmicedge','pencil',"], ["'scythe','cosmicedge',", "'scythe',"] ] },
};
const which = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(G);
let bad = 0;
for (const k of which) {
  const g = G[k]; if (!g) continue; let html = fs.readFileSync(SRC, 'utf8');
  for (const [a, b] of g.muts) { const n = html.split(a).length - 1; if (n !== 1) { console.log(k, 'MUTATION DOES NOT BIND (' + n + '):', a.slice(0, 80)); process.exit(2); } html = html.replace(a, b); }
  if (fs.existsSync(TMP)) { console.log('refusing: ' + TMP + ' already exists'); process.exit(3); }
  fs.writeFileSync(TMP, html);
  let out = '';
  try { out = cp.execSync('timeout 900 node ' + FIX + g.slice + ' http://127.0.0.1:8777', { env: Object.assign({}, process.env, { PAGE: '/satellites/slice-3d/index-fw.html' }), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 24 }); }
  catch (e) { out = (e.stdout || '') + (e.stderr || ''); }
  finally { fs.unlinkSync(TMP); }
  const fails = out.split('\n').filter(l => /FAIL/.test(l)), hit = fails.some(l => new RegExp(g.want).test(l));
  if (!hit) bad++;
  console.log('=== group ' + k + ' (' + g.why + '): ' + (hit ? 'RED as wanted' : 'NOT RED on /' + g.want + '/'));
  console.log(fails.map(l => '   ' + l.slice(0, 170)).join('\n'));
}
console.log(bad ? bad + ' group(s) did NOT go red' : 'every group went red where wanted');
