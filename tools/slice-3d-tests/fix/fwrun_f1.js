// Fail-watch for Part F1 (24 Oct, the Endless ramp): each group writes a copy of index.html with one rule taken out as
// index-fw.html, runs its slice against it and must go RED on the check named by `want`; the copy is removed whatever
// happens. One browser at a time. Run `node mkslices.js` first (row10.mjs).   node fwrun_f1.js [group ...]
const fs = require('fs'), cp = require('child_process');
const DIR = '/workspaces/lucid-winds/satellites/slice-3d/', SRC = DIR + 'index.html', TMP = DIR + 'index-fw.html', FIX = __dirname + '/';
const G = {
  LVL1: { slice: 'row10.mjs', want: "level's own pieces", why: 'every chunk back at level 1 (v6.8)', muts: [ ['return END_LVL_PIN||Math.min(ENDLESS_LVL_MAX, 1+Math.max(0,k));', 'return END_LVL_PIN||1;'] ] },
  LVLFLAT: { slice: 'row10.mjs', want: 'first chunk has no crystal', why: 'every chunk at the full bag from the top', muts: [ ['return END_LVL_PIN||Math.min(ENDLESS_LVL_MAX, 1+Math.max(0,k));', 'return END_LVL_PIN||ENDLESS_LVL_MAX;'] ] },
  CAP30: { slice: 'row10.mjs', want: 'keeps speeding up past 900', why: 'the fall capped at 30 again (v6.8)', muts: [ ['      var term = G.endless ? endlessTerm(G.depth) : FF_TERM;', '      var term = G.endless ? Math.min(30, FF_TERM + (G.depth||0)*0.012) : FF_TERM;'] ] },
  NOMAX: { slice: 'row10.mjs', want: 'never passes 60', why: 'no cap on the fall', muts: [ ['  return Math.min(END_TERM_MAX, FF_TERM+', '  return (FF_TERM+'] ] },
  TOP: { slice: 'row10.mjs', want: '29.8 at 900 m', why: 'the ramp steepened from the top', muts: [ ['FF_TERM+Math.min(d,END_TERM_KNEE)*END_TERM_SLOPE+', 'FF_TERM+Math.min(d,END_TERM_KNEE)*END_TERM_SLOPE*1.3+'] ] },
  EXTRA0: { slice: 'row10.mjs', want: 'holds more of them', why: 'no extra hazards past the full bag', muts: [ ["n=END_LVL_PIN?0:(k<6?0:Math.min(4, 1+Math.floor((k-6)/4)))", 'n=0'] ] },
  FIRST: { slice: 'row17.mjs', want: 'a band whose middle chunk has no host', why: "the band's verb host no longer drawn first", muts: [ ['first:vbE?VERB_HOST[vbE.kind]:null', 'first:null'] ] },
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
