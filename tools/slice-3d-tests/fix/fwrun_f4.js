// Fail-watch for Part F4 (24 Oct, Slivers by the square root, the price ladder): each group writes a copy of index.html with
// one rule taken out as index-fw.html, runs its slice and must go RED on the check named by `want`. node fwrun_f4.js [group ...]
const fs = require('fs'), cp = require('child_process');
const DIR = '/workspaces/lucid-winds/satellites/slice-3d/', SRC = DIR + 'index.html', TMP = DIR + 'index-fw.html', FIX = __dirname + '/';
const G = {
  LINEAR: { slice: 'row24.mjs', want: 'square root of its final score', why: 'score/45 back (v7.1)', muts: [ ['var base=Math.round(Math.sqrt(Math.max(0,G.score||0))*SLIV_K);', 'var base=Math.round(G.score/45);'] ] },
  DEPTH4: { slice: 'row24.mjs', want: 'one per 8 m', why: 'Endless one per 4 m again', muts: [ ['if(G.endless) base+=Math.round((G.depth||0)/8);', 'if(G.endless) base+=Math.round((G.depth||0)/4);'] ] },
  CHEAP: { slice: 'row24.mjs', want: 'more than ten good', why: 'the Iron Cleaver back at 150', muts: [ ["cleaver:{name:'Iron Cleaver',tier:'common',price:2000,", "cleaver:{name:'Iron Cleaver',tier:'common',price:150,"] ] },
  OLDPRICE: { slice: 'row16.mjs', want: 'the F4 ladder', why: 'one price off the ladder', muts: [ ["scythe:{name:'Moonlit Scythe',tier:'epic',price:22000,", "scythe:{name:'Moonlit Scythe',tier:'epic',price:2200,"] ] },
  HIDE6: { slice: 'row16.mjs', want: 'six F4 priced knives', why: 'the six kept off the shelf', muts: [ ["'quill','socktopus','butterbuddy','katana'", "'quill','katana'"] ] },
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
