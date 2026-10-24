// Fail-watch for Part E1 (the stack bonk, SS27 settlement) after its review: for each group, a copy of index.html with one
// rule taken back out (or put back the way the review's first cut had it) is written next to the real page as
// index-fw.html (same folder, so every relative URL resolves), the slice runs against it, and the group must go RED on the
// check named by `want`. The copy is removed whatever happens. One browser at a time: groups run in sequence.
// Run `node mkslices.js` first (it cuts row1.mjs and row18.mjs from the suite).   node fwrun_e1.js [group ...]
const fs = require('fs'), cp = require('child_process');
const DIR = '/workspaces/lucid-winds/satellites/slice-3d/', SRC = DIR + 'index.html', TMP = DIR + 'index-fw.html';
const FIX = __dirname + '/';
const CONTACT = 'var pshs=(G.x<sl.x)?-1:1, tgt=sl.x+pshs*(sl.w/2+KR); nx=Math.max(-SW+rchW, Math.min(SW-rchW, tgt)); stk.inside=(nx!==tgt);';
const G = {
  L: { slice: 'row18.mjs', want: 'in the lane by a wall side stack', why: 'the v6.4 slab contact (a bonk every step, no clamp)', muts: [
    ['var stk=sl.stk||sl; if(!(stk.k>=G.stepK-1))stk.inside=false; stk.k=G.stepK;   /* untouched last step: a new contact */', ''],
    ['else if(!stk.inside){ // handle hit: deflect off the stack, keep sinking, lose combo', 'else { // handle hit'],
    [CONTACT, 'var pshs=(G.x<sl.x)?-1:1; nx=sl.x+pshs*(sl.w/2+KR);'] ] },
  L2: { slice: 'row18.mjs', want: 'in the lane by a wall side stack', why: 'the wall clamp taken out (the contact rule kept)', muts: [
    ['nx=Math.max(-SW+rchW, Math.min(SW-rchW, tgt));', 'nx=tgt;'] ] },
  L3: { slice: 'row18.mjs', want: 'in the lane by a wall side stack', why: 'once per SLAB instead of once per stack', muts: [ ['var stk=sl.stk||sl;', 'var stk=sl;'] ] },
  K: { slice: 'row18.mjs', want: 'tilted knife', why: 'the clamp written with the upright reach (KHH)', muts: [
    ['nx=Math.max(-SW+rchW, Math.min(SW-rchW, tgt));', 'nx=Math.max(-SW+KHH, Math.min(SW-KHH, tgt));'] ] },
  E: { slice: 'row18.mjs', want: 'holds its contact', why: 'a contact that never ends', muts: [ ['if(!(stk.k>=G.stepK-1))stk.inside=false; ', ''] ] },
  S: { slice: 'row18.mjs', want: 'drifting into a stack', why: 'a cut opens the contact', muts: [
    ['if((sl.x-G.x)*bXs+(sl.y-G.y)*bYs > 0) sliceSlab(sl);', 'if((sl.x-G.x)*bXs+(sl.y-G.y)*bYs > 0){ sliceSlab(sl); stk.inside=true; }'] ] },
  GT: { slice: 'row18.mjs', want: 'between two gate slabs', why: "the review's first cut: every bonk holds the contact open", muts: [ ['stk.inside=(nx!==tgt);', 'stk.inside=true;'] ] },
  T: { slice: 'row18.mjs', want: 'replaying a settled id|after a reload a settled', why: 'the settled list is not consulted (the run ends once guard kept)', muts: [
    ['if(PROG.settled.indexOf(G.runId)>=0)return G.slivPaid||0;', ''] ] },
  U: { slice: 'row18.mjs', want: 'finish twice', why: 'the run ends once guard taken out (settlement kept)', muts: [ ["if(G.ended){ show('s-go'); return; }", ''] ] },
  U2: { slice: 'row18.mjs', want: 'finish twice', why: 'the guard returns without showing the panel', muts: [ ["if(G.ended){ show('s-go'); return; }", 'if(G.ended){ return; }'] ] },
  W: { slice: 'row18.mjs', want: 'before its slivers', why: 'the slivers written before the ledger', muts: [
    ['  PROG.settled.push(G.runId); STL_NEW.push(G.runId); saveProg();\n  SLIV+=n; saveSliv(); G.slivPaid=n;', '  SLIV+=n; saveSliv(); G.slivPaid=n;\n  PROG.settled.push(G.runId); STL_NEW.push(G.runId); saveProg();'] ] },
  X: { slice: 'row18.mjs', want: 'two tabs', why: "the other tab's settled list not joined", muts: [ ['if(okArr(disk.settled)){ var L=[];', 'if(false){ var L=[];'] ] },
  Y: { slice: 'row18.mjs', want: 'last twenty', why: 'the list never trimmed', muts: [ ['  PROG.settled=PROG.settled.slice(-20);', ''] ] },
  O: { slice: 'row18.mjs', want: 'last twenty', why: "the review's first cut: the twenty newest START times", muts: [ ['  PROG.settled=PROG.settled.slice(-20);', '  PROG.settled=PROG.settled.sort().slice(-20);'] ] },
  Z: { slice: 'row18.mjs', want: 'replaying a settled id', why: 'Sunbeams paid for a settled run', muts: [ ['if(fresh&&sbSession<12)', 'if(sbSession<12)'] ] },
  CD: { slice: 'row18.mjs', want: 'replaying a settled id', why: 'a clean dive counted for a settled run', muts: [ ['    if(fresh){ PROG.cleanDives=(PROG.cleanDives||0)+1;', '    if(true){ PROG.cleanDives=(PROG.cleanDives||0)+1;'] ] },
  R: { slice: 'row18.mjs', want: 'after a reload a settled', why: 'the settled list dropped at boot', muts: [ ['if(!okArr(PROG.settled))PROG.settled=[];', 'PROG.settled=[];'] ] },
  F: { slice: 'row18.mjs', want: 'still pays', why: 'a failed dive paid nothing', muts: [ ['  var svf=awardSlivers();', '  var svf=0;'] ] },
  BK: { slice: 'row18.mjs', want: 'end wobble', why: 'the v6.4 back button (a decided run thrown away)', muts: [
    ['  if(running&&G&&G.done&&!G.ended){ for(var n=0;running&&!G.ended&&n<1200;n++)stepWorld(STEP); if(G.ended)return; }\n', ''] ] },
  BD: { slice: 'row18.mjs', want: 'broken settled list', why: 'the merge trusts any settled value on disk', muts: [ ['if(okArr(disk.settled)){ var L=[];', 'if(disk.settled!==undefined){ var L=[];'] ] },
  P: { slice: 'row1.mjs', want: 'settled', why: 'the boot filter on settled taken out', muts: [ ['PROG.settled=PROG.settled.filter(okId).slice(-20);', ''] ] },
  P2: { slice: 'row1.mjs', want: 'settled":"abc|settled":null|"length"', why: 'the boot array guard taken out', muts: [ ['if(!okArr(PROG.settled))PROG.settled=[];', ''] ] }
};
const which = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(G);
let bad = 0;
for (const k of which) {
  const g = G[k]; let html = fs.readFileSync(SRC, 'utf8');
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
