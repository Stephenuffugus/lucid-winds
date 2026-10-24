// Fail-watch for Part E4 (the bosses): each group writes a copy of index.html with one rule taken out as index-fw.html, runs
// its slice against it and must go RED on the check named by `want`; the copy is removed whatever happens. One browser at a
// time. Run `node mkslices.js` first (row21.mjs).   node fwrun_e4.js [group ...]
const fs = require('fs'), cp = require('child_process');
const DIR = '/workspaces/lucid-winds/satellites/slice-3d/', SRC = DIR + 'index.html', TMP = DIR + 'index-fw.html', FIX = __dirname + '/';
const G = {
  LEVELS: { slice: 'row21.mjs', want: 'a boss closes levels', why: 'a boss on a dive that is not a world\'s last', muts: [ ['boss=BOSS_ON&&lvl%5===0;', 'boss=BOSS_ON&&(lvl%5===0||lvl===4);'] ] },
  SHAFT: { slice: 'row21.mjs', want: 'the very dive it was', why: 'the wall ledges drawn down the whole new depth (the shaft\'s own rng() moves)', muts: [ ['for(var wy=4;wy>-segDepth-2;wy-=9+rng()*6){', 'for(var wy=4;wy>-depth-2;wy-=9+rng()*6){'] ] },
  SEGS: { slice: 'row21.mjs', want: 'the very dive it was', why: 'the shaft\'s pieces run down into the chamber', muts: [ ['ffSegments(rng, lvl, SW, wsAt, -4, -segDepth+14, A, null,', 'ffSegments(rng, lvl, SW, wsAt, -4, floorY+14, A, null,'] ] },
  ONCE: { slice: 'row21.mjs', want: 'three hits|counts it once', why: 'a hit counted every step of one contact', muts: [ ['    else if(!b.inside){ b.inside=true;', '    else { b.inside=true;'] ] },
  HANDLE: { slice: 'row21.mjs', want: 'a handle down knife never hits', why: 'any contact a hit, the handle too', muts: [ ['      if((b.x-G.x)*bX+(b.y-G.y)*bY>0){ b.hits++;', '      if(true){ b.hits++;'] ] },
  GIVEWAY: { slice: 'row21.mjs', want: 'a handle down knife never hits', why: 'the net never gives way (a handle down knife lobbed for ever)', muts: [ ['if(b.lobs>BOSS_LOBS){', 'if(false){'] ] },
  CLEARNET: { slice: 'row21.mjs', want: 'three hits', why: 'the net kept up after the boss is down', muts: [ ["SFX.jackpot(); if(b.netOn)bossNetDrop(b); }", 'SFX.jackpot(); }'] ] },
  AIM: { slice: 'row21.mjs', want: 'three hits', why: 'the lob straight up (not aimed at the boss\'s lane)', muts: [ ['G.vx=(b.tx-nx)*Math.LN2/(1-Math.pow(0.5,T));', 'G.vx=0;'] ] },
  ROPE: { slice: 'row21.mjs', want: 'a hold toward either rope cuts it', why: 'a rope that cannot be cut', muts: [ ['ny>b.ropeBot&&(rx-G.x)*bX>0.2){', 'ny>b.ropeBot&&(rx-G.x)*bX>99){'] ] },
  FORFEIT: { slice: 'row21.mjs', want: 'a hold toward either rope cuts it', why: 'a cut rope keeps Clean Slice', muts: [ ['b.ropeCut=true; b.skipped=true; G.cleanForfeit=true;', 'b.ropeCut=true; b.skipped=true;'] ] },
  PADDED: { slice: 'row21.mjs', want: "the chamber's walls are padded", why: 'the chamber\'s walls stick like the shaft\'s', muts: [ ['var bw=G.world.boss; if(bw&&y<bw.y+14+KR)bladeIntoWall=false;', ''] ] },
  PANEL: { slice: 'row21.mjs', want: 'the end panel names the boss', why: 'the end panel silent about the boss', muts: [ ["if(ff&&G.world.boss&&G.bossDown)$('go-lab').textContent+=", "if(false)$('go-lab').textContent+="] ] },
  CRACK: { slice: 'row21.mjs', want: "the boss wears Astra's stages", why: 'no crack after the first hit', muts: [ ['b.crack.material.opacity=(b.hits===1)?0.9:0;', 'b.crack.material.opacity=0;'] ] },
  CELL: { slice: 'row21.mjs', want: "the boss wears Astra's stages", why: 'cell 2 shown from the first hit', muts: [ ['var c=b.hits>=3?2:(b.hits>=2?1:0)', 'var c=b.hits>=3?2:(b.hits>=1?1:0)'] ] },
  PANELFF: { slice: 'row21.mjs', want: 'a skipped boss forfeits Clean Slice', why: 'a skipped boss keeps Clean Slice on the end panel', muts: [ ['won=!!fin&&n>=C.M&&!G.cleanForfeit;', 'won=!!fin&&n>=C.M;'] ] },
  /* after the review */
  ROPEUP: { slice: 'row21.mjs', want: 'as played', why: 'a rope cut by a falling knife (a hit leaves it beside the rope)', muts: [ ['(b.lobs>0||b.hits>0)&&G.vy>0&&', '(b.lobs>0||b.hits>0)&&'] ] },
  ROPESIDE: { slice: 'row21.mjs', want: 'keeps its own rope', why: 'the rope on the boss\'s side live (a tap toward the boss cut it)', muts: [ ['&&(b.tx===0||(rx>0)!==(b.tx>0))&&', '&&'] ] },
  ROPEIN: { slice: 'row21.mjs', want: 'on its way in', why: 'a rope live before the fight', muts: [ ['(b.lobs>0||b.hits>0)&&G.vy>0&&', 'G.vy>0&&'] ] },
  POPMID: { slice: 'row21.mjs', want: "the review's trap", why: 'the handle pop thrown at the wall (the juggle)', muts: [ ['G.vx=G.vx*0.3+((b.x>0||(b.x===0&&dx<0))?-1.5:1.5);', 'G.vx=G.vx*0.3+((dx<0)?-1.5:1.5);'] ] },
  INERT: { slice: 'row21.mjs', want: 'the boss out of the fight', why: 'a skipped boss still hits and pops', muts: [ ['  if(!b.cleared&&!b.skipped){', '  if(!b.cleared){'] ] },
  PAY: { slice: 'row21.mjs', want: 'paid once', why: 'the reward scaled by the hits', muts: [ ['var pts=600; G.score+=pts;', 'var pts=600*b.hits; G.score+=pts;'] ] },
  LOBS: { slice: 'row21.mjs', want: 'fourth landing', why: 'the net gives way after one lob', muts: [ ['BOSS_LOBS=3;', 'BOSS_LOBS=1;'] ] },
  RESET: { slice: 'row21.mjs', want: 'resets the lob count', why: 'a hit leaves the lob count', muts: [ ['b.hits++; b.lobs=0; G.bossHits=b.hits;', 'b.hits++; G.bossHits=b.hits;'] ] },
  HOP: { slice: 'row21.mjs', want: 'one lane over', why: 'the boss hops two lanes', muts: [ ["b.tx=(b.tx===0)?(b.rng()<0.5?-4.8:4.8):0;", "b.tx=(b.tx===0)?(b.rng()<0.5?-4.8:4.8):-b.tx;"] ] },
  CRACK2: { slice: 'row21.mjs', want: "the boss wears Astra's stages", why: 'the crack kept after the second hit', muts: [ ['b.crack.material.opacity=(b.hits===1)?0.9:0;', 'b.crack.material.opacity=(b.hits>=1)?0.9:0;'] ] },
  NETFF: { slice: 'row21.mjs', want: 'forfeits Clean Slice', why: 'the net giving way keeps Clean Slice', muts: [ ['if(b.lobs>BOSS_LOBS){ b.skipped=true; G.cleanForfeit=true;', 'if(b.lobs>BOSS_LOBS){ b.skipped=true;'] ] },
  PADALL: { slice: 'row21.mjs', want: 'still sticks', why: 'a boss dive padded top to bottom', muts: [ ['if(bw&&y<bw.y+14+KR)bladeIntoWall=false;', 'if(bw)bladeIntoWall=false;'] ] },
  PAD12: { slice: 'row21.mjs', want: "padded from the old floor", why: "the padding short of the old floor's line (the review: the top 2 u killed)", muts: [ ['if(bw&&y<bw.y+14+KR)bladeIntoWall=false;', 'if(bw&&y<bw.y+12)bladeIntoWall=false;'] ] },
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
