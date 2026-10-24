// Fail-watch for Part F2 (24 Oct, the knife over the ground): each group writes a copy of index.html with one rule taken
// out as index-fw.html, runs row22.mjs against it and must go RED on the check named by `want`. node fwrun_f2.js [group ...]
const fs = require('fs'), cp = require('child_process');
const DIR = '/workspaces/lucid-winds/satellites/slice-3d/', SRC = DIR + 'index.html', TMP = DIR + 'index-fw.html', FIX = __dirname + '/';
const G = {
  NOLIFT: { slice: 'row22.mjs', want: 'never dips below', why: 'the lift taken out (v6.9)', muts: [ ['if(low<sY){ KDRAW.lift=sY-low; knife.position.y+=KDRAW.lift; }', 'if(false){}'] ] },
  NOSTUMP: { slice: 'row22.mjs', want: 'never dips below', why: 'the surface is always the ground (stump tops ignored)', muts: [ ['if(!b.gone&&x>b.x-0.5&&x<b.x+b.w+0.5&&b.y+b.h<=y+0.4&&b.y+b.h>gY)gY=b.y+b.h;', ''] ] },
  ALWAYS: { slice: 'row22.mjs', want: 'drawn on its stepped pose', why: 'the knife always drawn high', muts: [ ['KDRAW.surf=sY; if(low<sY){', 'KDRAW.surf=sY; knife.position.y+=0.8; if(low<sY){'] ] },
  ENDS: { slice: 'row22.mjs', want: 'never dips below', why: 'one reach for both ends taken as the shorter end', muts: [ ['var low=knife.position.y+Math.min(KHI*sn, -KLO*sn)-KHH*Math.abs(Math.cos(rz));', 'var low=knife.position.y-Math.min(KHI,KLO)*Math.abs(sn)*0.6-KHH*Math.abs(Math.cos(rz));'] ] },
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
