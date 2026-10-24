// Fail-watch for Part E2 (Clean Slice, the finds, the end panel, the budget): each group writes a copy of index.html with
// one rule taken out as index-fw.html, runs row [19] against it and must go RED on the check named by `want`; the copy is
// removed whatever happens. One browser at a time. Run `node mkslices.js` first.   node fwrun_e2.js [group ...]
const fs = require('fs'), cp = require('child_process');
const DIR = '/workspaces/lucid-winds/satellites/slice-3d/', SRC = DIR + 'index.html', TMP = DIR + 'index-fw.html', FIX = __dirname + '/';
const G = {
  FP: { want: 'laid out exactly as v6.5', why: 'a stray rng() draw in the stack builder (the class of change the fingerprint guards)', muts: [
    ['    var stk={};   /* Part E1', '    rng(); var stk={};   /* Part E1'] ] },
  LW: { want: 'whole stacks of two or more', why: 'only a line stack\'s top slab counted', muts: [
    ['for(cj=0;cj<CL[ci].slabs.length;cj++){ CL[ci].slabs[cj].req=true; clM++; }', 'CL[ci].slabs[0].req=true; clM++;'] ] },
  BAND: { want: 'whole stacks of two or more', why: 'no gold band', muts: [ [' clBand(CL[ci].top); }', ' }'] ] },
  SINGLE: { want: 'across levels', why: "a gate's one slab stacks allowed on the line", muts: [ ['    if(a.length>=2)C.push({x:a[0].x, top:a[0], last:a[a.length-1], slabs:a}); }', '    if(a.length>=1)C.push({x:a[0].x, top:a[0], last:a[a.length-1], slabs:a}); }'] ] },
  END: { want: 'Endless has no line', why: 'Endless given a line', muts: [ ['  var W={ ff:true, ws:WS, bandFog:bf, len:1e9,', '  var W={ clean:{M:1,stacks:1}, ff:true, ws:WS, bandFog:bf, len:1e9,'] ] },
  COUNT: { want: 'carving every line stack', why: 'a cut target not counted', muts: [ ['  if(sl.req)G.cleanN=(G.cleanN||0)+1;\n', ''] ] },
  FIN: { want: 'no floor', why: 'the badge without the floor', muts: [ ['n=G.cleanN||0, won=!!fin&&n>=C.M;', 'n=G.cleanN||0, won=n>=C.M;'] ] },
  HIDE: { want: 'never show Clean Slice', why: 'the panel line not hidden for other modes', muts: [ ['  G.ended=true;\n  cleanHide();\n', '  G.ended=true;\n'] ] },
  POP: { want: 'pops when cut', why: 'the find never pops', muts: [ ['  if(sl.disc){ G.found=sl.disc; findPop(sl.x, sl.y, sl.disc); }', '  if(sl.disc){ G.found=sl.disc; }'] ] },
  GONE: { want: 'floats away', why: 'a find never leaves', muts: [ ['  if(f.t>1.8){ findDrop(f); FINDS.splice(i,1); } } }', '  if(false){ findDrop(f); FINDS.splice(i,1); } } }'] ] },
  ONCE: { want: 'the first time', why: 'a find told every time', muts: [ ['if(G.found&&FIND[G.found]&&DEX[G.found]!==1){', 'if(G.found&&FIND[G.found]){'] ] },
  TABS: { want: "the other tab's finds", why: "the other tab's finds not joined", muts: [ ["var d=readObj('s3d_dex'), k; if(d)for(k in d)", "var d=readObj('s3d_dex'), k; if(false)for(k in d)"] ] },
  DEX: { want: 'broken s3d_dex', why: 'the dex read without its shape check', muts: [ ["var DEX=readObj('s3d_dex')||{};", "var DEX=JSON.parse(LS.g('s3d_dex'))||{};"] ] },
  CAPC: { want: 'the budget', why: 'the debris cap taken out', muts: [ ['while(chunks.length>CHUNK_CAP){', 'while(false){'] ] },
  CAPS: { want: 'the budget', why: 'the particle budget back at 160', muts: [ ['var SPARK_CAP=120;', 'var SPARK_CAP=160;'] ] },
  EVICT: { want: 'leave the GPU', why: 'no world leaves the GPU', muts: [ ['function worldEvict(keep){\n', 'function worldEvict(keep){ return 0;\n'] ] },
  CALLS: { want: 'draw calls are counted', why: 'draw calls not counted', muts: [ [' LAST_CALLS=renderer.info.render.calls;', ''] ] }
};
const which = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(G);
let bad = 0;
for (const k of which) {
  const g = G[k]; let html = fs.readFileSync(SRC, 'utf8');
  for (const [a, b] of g.muts) { const n = html.split(a).length - 1; if (n !== 1) { console.log(k, 'MUTATION DOES NOT BIND (' + n + '):', a.slice(0, 80)); process.exit(2); } html = html.replace(a, b); }
  if (fs.existsSync(TMP)) { console.log('refusing: ' + TMP + ' already exists'); process.exit(3); }
  fs.writeFileSync(TMP, html);
  let out = '';
  try { out = cp.execSync('timeout 900 node ' + FIX + 'row19.mjs http://127.0.0.1:8777', { env: Object.assign({}, process.env, { PAGE: '/satellites/slice-3d/index-fw.html' }), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 24 }); }
  catch (e) { out = (e.stdout || '') + (e.stderr || ''); }
  finally { fs.unlinkSync(TMP); }
  const fails = out.split('\n').filter(l => /FAIL/.test(l)), hit = fails.some(l => new RegExp(g.want).test(l));
  if (!hit) bad++;
  console.log('=== group ' + k + ' (' + g.why + '): ' + (hit ? 'RED as wanted' : 'NOT RED on /' + g.want + '/'));
  console.log(fails.map(l => '   ' + l.slice(0, 170)).join('\n'));
}
console.log(bad ? bad + ' group(s) did NOT go red' : 'every group went red where wanted');
