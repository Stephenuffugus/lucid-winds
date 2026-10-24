// Fail-watch for Part F3 (24 Oct, the boss lob and pay, the Daily without practice): each group writes a copy of index.html
// with one rule taken out as index-fw.html, runs its slice and must go RED on the check named by `want`. node fwrun_f3.js [group ...]
const fs = require('fs'), cp = require('child_process');
const DIR = '/workspaces/lucid-winds/satellites/slice-3d/', SRC = DIR + 'index.html', TMP = DIR + 'index-fw.html', FIX = __dirname + '/';
const G = {
  AIM0: { slice: 'row23.mjs', want: 'still clears the fight', why: 'the aim cap taken out (v6.8 steering)', muts: [ ['function lobAim(hd){ var b=lobOn(); if(!b)return;', 'function lobAim(hd){ return;'] ] },
  PAYMULT: { slice: 'row23.mjs', want: "never the boss's pay", why: 'the landing multiplies the boss pay again', muts: [ ['G.score=(G.score-(G.bossPts||0))*G.mult+(G.bossPts||0);', 'G.score=G.score*G.mult;'] ] },
  GRADE5: { slice: 'row23.mjs', want: 'pays by the misses', why: 'every fight graded x5', muts: [ ['gx=bm===0?5:(bm===1?3:2)', 'gx=5'] ] },
  NOMISS: { slice: 'row23.mjs', want: 'pays by the misses', why: 'a net landing never counted as a miss', muts: [ ['if(b.mc)b.mc=false; else if(b.lobs>0||b.hits===0)b.miss=(b.miss||0)+1;', 'if(b.mc)b.mc=false;'] ] },
  PRACTICE: { slice: 'row20.mjs', want: 'offers no practice', why: 'the Practice button back on the card', muts: [ ['<button class="btn primary" id="dly-go">', '<button class="btn sm" id="dly-practice">Practice</button><button class="btn primary" id="dly-go">'] ] },
  REPLAY: { slice: 'row20.mjs', want: 'no Replay', why: 'a Daily end panel shows Replay', muts: [ ["$('go-retry').style.display='none';", ''] ] },
  PHYS1: { slice: 'row20.mjs', want: 'fixed by the UTC date', why: "the Daily's physics stamp left at 1", muts: [ ['var DAILY_GEN=1, DAILY_PHYS=2;', 'var DAILY_GEN=1, DAILY_PHYS=1;'] ] },
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
