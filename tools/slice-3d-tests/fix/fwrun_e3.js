// Fail-watch for Part E3 (the Daily): each group writes a copy of index.html with one rule taken out as index-fw.html, runs
// its slice against it and must go RED on the check named by `want`; the copy is removed whatever happens. One browser at a
// time. Run `node mkslices.js` first (row20.mjs, row8.mjs).   node fwrun_e3.js [group ...]
const fs = require('fs'), cp = require('child_process');
const DIR = '/workspaces/lucid-winds/satellites/slice-3d/', SRC = DIR + 'index.html', TMP = DIR + 'index-fw.html', FIX = __dirname + '/';
const G = {
  SPEC: { slice: 'row20.mjs', want: 'fixed by the UTC date', why: 'the seed drawn from the moment, not the day', muts: [ ["key=day+':g'+DAILY_GEN+':p'+DAILY_PHYS", "key=String(t)+':g'+DAILY_GEN+':p'+DAILY_PHYS"] ] },
  STABLE: { slice: 'row20.mjs', want: 'the same day builds the same dive', why: "the Daily dive not built from the day's seed", muts: [ ['  newFF(sp.level, false, sp.seed);', '  newFF(sp.level, false);'] ] },
  OPEN: { slice: 'row20.mjs', want: 'opening the Daily card', why: 'opening the card spends the scored dive', muts: [ ["function showDaily(){ paintDaily();", "function showDaily(){ dlyToday(); DLY.used=true; paintDaily();"] ] },
  PRACTICE: { slice: 'row20.mjs', want: 'practising spend nothing', why: 'practice spends the scored dive', muts: [ ["if(G.daily==='scored'&&!G.dailyLive){", "if(G.daily&&!G.dailyLive){"] ] },
  TICK: { slice: 'row20.mjs', want: 'first simulation tick', why: 'spent when the run is built, not when it starts', muts: [ ["  G.daily=scored?'scored':'practice'; G.dailyDay=sp.utcDate;", "  G.daily=scored?'scored':'practice'; G.dailyDay=sp.utcDate; if(scored){ DLY.used=true; saveDaily(); }"] ] },
  SECOND: { slice: 'row20.mjs', want: 'no second scored dive', why: 'a second scored dive the same day', muts: [ ["  if(scored&&DLY.used){ paintDaily(); return; }", "  if(false){ paintDaily(); return; }"] ] },
  BADGEFAIL: { slice: 'row20.mjs', want: 'a failed scored dive', why: 'the badge on a failed scored dive', muts: [ ['if(fin&&!DLY.done){ DLY.done=true; first=true; }', 'if(!DLY.done){ DLY.done=true; first=true; }'] ] },
  PRACBADGE: { slice: 'row20.mjs', want: 'practice reaching the floor', why: 'practice scored like the day\'s dive', muts: [ ["  if(G.daily==='scored'){   /* the day it began", "  if(G.daily){   /* the day it began"] ] },
  LEVEL: { slice: 'row20.mjs', want: 'no level .Freefall or Journey', why: 'a Daily dive moves the Freefall level', muts: [ ['if(ff){ if(!G.daily&&lvl>=PROG.ffLevel)PROG.ffLevel=lvl+1; }', 'if(ff){ if(lvl>=PROG.ffLevel)PROG.ffLevel=lvl+1; }'] ] },
  JOURNEY: { slice: 'row20.mjs', want: 'no level .Freefall or Journey|moves no level', why: "the review's find: a Daily falling through to Journey's level", muts: [ ['if(ff){ if(!G.daily&&lvl>=PROG.ffLevel)PROG.ffLevel=lvl+1; }', 'if(ff&&!G.daily){ if(lvl>=PROG.ffLevel)PROG.ffLevel=lvl+1; }'] ] },
  TABS2: { slice: 'row20.mjs', want: 'another tab already spent', why: 'the disk not read before a scored dive', muts: [ ["  if(scored){ var dk=readObj('s3d_daily'); if(okDly(dk, sp.utcDate)&&dk.used)DLY.used=true; }   /* another tab may have spent it */", ''] ] },
  TZ: { slice: 'row20.mjs', want: 'UTC.14', why: 'the day read from the phone\'s own date', muts: [ ["return d.getUTCFullYear()+'-'+('0'+(d.getUTCMonth()+1)).slice(-2)+'-'+('0'+d.getUTCDate()).slice(-2); }", "return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }"] ] },
  NULLSCORE: { slice: 'row20.mjs', want: 'null score', why: 'a non number score let through', muts: [ ["typeof d.score==='number'&&d.score>=0; }", "(d.score>=0); }"] ] },
  DEXSTR: { slice: 'row1.mjs', want: 's3d_dex=.abc', why: 'the dex read without its shape check (a string at boot)', muts: [ ["var DEX=readObj('s3d_dex')||{};", "var DEX=JSON.parse(LS.g('s3d_dex'))||{};"] ] },
  DLY1: { slice: 'row1.mjs', want: 's3d_daily=.*opens the Daily card', why: 'a record for today with a null score let through', muts: [ ["typeof d.score==='number'&&d.score>=0; }", "(d.score>=0); }"] ] },
  MIDNIGHT: { slice: 'row20.mjs', want: 'after the UTC midnight', why: 'the result filed under the new day', muts: [ ["    if(!DLY||DLY.day!==G.dailyDay){ var dk=readObj('s3d_daily');", "    dlyToday(); if(DLY.day!==G.dailyDay)return; if(!DLY||DLY.day!==G.dailyDay){ var dk=readObj('s3d_daily');"] ] },
  CLOCK: { slice: 'row20.mjs', want: 'the countdown runs to the UTC midnight', why: 'a countdown to an hour from now', muts: [ ['next=(Math.floor(t/86400000)+1)*86400000', 'next=t+3600000'] ] },
  REFRESH: { slice: 'row20.mjs', want: 'a refresh the same day', why: "the day's record not read back from disk", muts: [ ["DLY=okDly(disk, sp.utcDate)?disk:{", "DLY=false?disk:{"] ] },
  NEXTDAY: { slice: 'row20.mjs', want: 'the next UTC day', why: "yesterday's record taken for today", muts: [ ['okObj(d)&&d.day===day&&d.gen===DAILY_GEN', 'okObj(d)&&d.gen===DAILY_GEN'] ] },
  SHAPE: { slice: 'row20.mjs', want: 'broken Daily record', why: 'the record read without its shape check', muts: [ ["typeof d.used==='boolean'&&typeof d.done==='boolean'&&typeof d.score==='number'&&d.score>=0; }", "true; }"] ] },
  BUTTON: { slice: 'row20.mjs', want: 'Daily button opens', why: 'the title button does nothing', muts: [ ["tap('b-daily',function(){ showDaily(); });", ''] ] },
  LAYOUT: { slice: 'row8.mjs', want: 'Daily', why: 'the Daily button pushed under the song card', muts: [ ['#go-daily{display:none;', '#b-daily{position:relative; top:300px} #go-daily{display:none;'] ] }
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
