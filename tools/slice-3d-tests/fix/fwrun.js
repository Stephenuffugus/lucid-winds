// Fail-watch for the Part D review fixes: for each group, a copy of index.html with those fixes taken back out is written
// next to the real page as index-fw.html (same folder, so every relative URL resolves), the slice runs against it, the
// FAIL lines are kept, and the copy is removed again whatever happens. One browser at a time: groups run in sequence.
const fs = require('fs'), cp = require('child_process');
const DIR = '/workspaces/lucid-winds/satellites/slice-3d/', SRC = DIR + 'index.html', TMP = DIR + 'index-fw.html';
const FIX = __dirname + '/';
const G = {
  A: { slice: 'row17.mjs', why: 'lantern timing, loaf wall clamp, loaf ellipse, Endless band rule, gravity lookup, banner strip, strip settings', muts: [
    ['var LANTERN_DELAY=0.12;', 'var LANTERN_DELAY=0.45;'],
    ['if(age>=L.burstT){', 'if(age>LANTERN_DELAY+0.85+L.ord*0.08){'],
    ['var push=(G.x<e.x)?-1:1, lim=G.world.SW-kReachX(G.ang);', 'e.inside=false; var push=(G.x<e.x)?-1:1, lim=G.world.SW-kReachX(G.ang);'],
    ['return Math.max(-lim, Math.min(lim, e.x+push*ea));', 'return e.x+push*ea;'],
    ['if(loaf){ var eu=(nx-e.x)/ea, ev=(ny-e.y)/(e.h/2+KR); touch=eu*eu+ev*ev<1; }', 'if(false){}'],
    ['if(vkE&&k>=1&&(vK[band]==null||vK[band]===k))vbE={kind:vkE, minY:top-4, done:false};', 'if(vkE&&k%3===1)vbE={kind:vkE, minY:top-12, done:false};'],
    ["id=W.end?WORLD_IDS[(W.end.fwi+Math.max(0,Math.floor((4-G.y)/ENDLESS_BAND)))%WORLD_IDS.length]:(W.ws&&W.ws.id);", 'id=W.ws&&W.ws.id;'],
    ["V.push({kind:'banner', x0:wallX-w-0.1, x1:wallX, y:y, h:h, mesh:m}); fxPre('banner');", "V.push({kind:'banner', x0:wallX-w-0.1, x1:wallX, y:y, h:h, mesh:m});"],
    ['if(SET.rp&&FXB.length)return;', ''],
    ['still=!!SET.rm, tx=t.clone();', 'still=false, tx=t.clone();'] ] },
  B: { slice: 'row17.mjs', why: 'the bumper throws any landing back up (back to handle landings only)', muts: [
    ['if(pad.up&&pad.ice&&pad.ice.stage===1){', 'if(pad.up&&pad.ice&&pad.ice.stage===1&&!(toB>0)){'] ] },
  C: { slice: 'row17.mjs', why: 'cracked ice gives at any touch (taken out)', muts: [
    ["if(e.kind==='ice'&&e.stage===1){ iceStage(e); return nx; }", ''] ] },
  D: { slice: 'row17.mjs', why: 'the bumper breaks with the ice, and the shattered cell (both taken out)', muts: [
    ['for(q=0;q<P.length;q++)if(P[q].ice===e&&!P[q].gone){ P[q].gone=true;', 'for(q=0;q<P.length;q++)if(false){ P[q].gone=true;'],
    ["fxHold('ice_crack', 2, e.x, e.y, e.w*1.08, e.h*1.08, 0.4);", ''] ] },
  E1: { slice: 'late.mjs', why: 'a lantern built before art.json wears the shared stand-in again', muts: [
    ['sp?ws.lnC:ws.lnK', 'ws.lnC'], ['sp?ws.lnC2:ws.lnK2', 'ws.lnC2'] ] },
  E2: { slice: 'late.mjs', why: 'fxPre asks only if art.json is already in', muts: [
    ['artJson(function(j){ for(var i=0;i<L.length;i++){ var F=j.fx&&j.fx[L[i]]; if(F)artTex(F.file, artUp); } }); }', '(function(j){ if(!j)return; for(var i=0;i<L.length;i++){ var F=j.fx&&j.fx[L[i]]; if(F)artTex(F.file, artUp); } })(ART.j); }'] ] }
};
const which = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(G);
for (const k of which) {
  const g = G[k]; let html = fs.readFileSync(SRC, 'utf8');
  for (const [a, b] of g.muts) { const n = html.split(a).length - 1; if (n !== 1) { console.log(k, 'MUTATION DOES NOT BIND (' + n + '):', a.slice(0, 80)); process.exit(2); } html = html.replace(a, b); }
  if (fs.existsSync(TMP)) { console.log('refusing: ' + TMP + ' already exists'); process.exit(3); }
  fs.writeFileSync(TMP, html);
  let out = '';
  try { out = cp.execSync('timeout 900 node ' + FIX + g.slice + ' http://127.0.0.1:8777', { env: Object.assign({}, process.env, { PAGE: '/satellites/slice-3d/index-fw.html' }), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 24 }); }
  catch (e) { out = (e.stdout || '') + (e.stderr || ''); }
  finally { fs.unlinkSync(TMP); }
  console.log('=== group ' + k + ': ' + g.why);
  console.log(out.split('\n').filter(l => /FAIL|passed|Error/.test(l)).map(l => l.slice(0, 260)).join('\n'));
}
