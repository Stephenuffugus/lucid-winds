// Fail watch for Pop N Lock: each group writes index.html with ONE fix undone as index-fw.html beside it (every relative
// URL keeps working), runs the gate on it, must go RED on the check it names, then deletes it. node fwrun.mjs p0 [group ...]
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const DIR = '/workspaces/lucid-winds/satellites/chaff-wars/', TMP = DIR + 'index-fw.html', [part, ...only] = process.argv.slice(2);
const G = {
  p0: {
    HYPEDT: { want: 'HYPE 80 after 16 ms', muts: [['f.hype=Math.max(0,f.hype-dt/1000*1.3);', 'f.hype=Math.max(0,f.hype-dt*1.3);']] },
    GLOWDT: { want: 'chain glow 1 after 16 ms', muts: [['f.chainGlow=Math.max(0,f.chainGlow-dt/1000*1.1);', 'f.chainGlow=Math.max(0,f.chainGlow-dt*1.1);']] },
    ALLBONUS: { want: 'All Clear bonus survives', muts: [['if(f.allBonus&&R.chain>0){', 'if(f.allBonus){']] },
    CANCEL: { want: 'cancelled 10 px, 100 ms touch', muts: [["cv.addEventListener('pointercancel',dragCancel,{passive:false});", "cv.addEventListener('pointercancel',dragEnd,{passive:false});"]] },
    LOCKDRAG: { want: 'lock in the middle of a soft drop', muts: [['  if(f===MATCH.pf&&dragSt){ if(dragSt.soft)f.softHold=false; dragSt=null; }', '']] },
    REPEAT: { want: 'held arrow moves at once', muts: [['var REP_FAST={first:105, every:33}', 'var REP_FAST={first:138, every:33}']] },   /* v1.9: the one scheduler (v1.7 mutated hold()) */
    BACKLOG: { want: 'starting a soft drop drops at most one row', muts: [['      if(f.gravAcc>g)f.gravAcc=g;', '']] },
    CLAMPAFTER: { want: 'falls a row every 40 ms', muts: [['      if(f.gravAcc>g)f.gravAcc=g;', '      f.gravAcc+=dt; if(f.gravAcc>g)f.gravAcc=g; f.gravAcc-=dt;'], ['      f.gravAcc+=dt;\n      while(f.gravAcc>=g)', '      f.gravAcc+=dt; if(f.gravAcc>g)f.gravAcc=g;\n      while(f.gravAcc>=g)']] },
    FLOATFIT: { want: 'banner fits the board', muts: [["var punch=Math.min(1,Math.max(0,fl.life-0.82)/0.18);", "var punch=Math.max(0,fl.life-0.82)/0.18;"], ["if(mw>lim){ fs=Math.max(10,Math.floor(fs*lim/mw)); ctx.font='italic 800 '+fs+'px system-ui'; }", ""]] },
  },
  p1: {
    JOINANY: { want: 'joins are exactly', muts: [['if(r2>=ROWS||c2>=COLS||f.grid[r2][c2]!==v)continue;', 'if(r2>=ROWS||c2>=COLS||!f.grid[r2][c2])continue;']] },
    JOINDIAG: { want: 'joins are exactly', muts: [['for(k=0;k<2;k++){ var r2=r+k, c2=c+(1-k);', 'for(k=0;k<2;k++){ var r2=r+k, c2=c+1;']] },
    NORELEASE: { want: 'holds only those', muts: [["for(k in A2.im)if(A2.im.hasOwnProperty(k)&&/^(dance|react)\\//.test(k)&&!keep[k]){ A2.im[k].src=''; delete A2.im[k]; }", '']] },
    ASKALL: { want: 'exactly the Aphid Swarm', muts: [['  a2Im(J.board.frame.file); a2Im(J.board.rival.file); a2Im(J.board.next.file); if(A2.who)a2Char(A2.who); }', '  a2Im(J.board.frame.file); a2Im(J.board.rival.file); a2Im(J.board.next.file); for(k in J.dance)if(J.dance.hasOwnProperty(k))a2Im(J.dance[k].frames[0]); if(A2.who)a2Char(A2.who); }']] },
    NODANCE: { want: 'six dance frames, once', muts: [['  if(n===2){ RAIL.danceT=t; RAIL.frozen=0; RAIL.freezeT=-9; }', '  if(n===9){ RAIL.danceT=t; RAIL.frozen=0; RAIL.freezeT=-9; }']] },
    HITLONG: { want: 'hit frame for 180 ms', muts: [['if(R&&R.hit&&t-RAIL.hitT<0.18)return R.hit;', 'if(R&&R.hit&&t-RAIL.hitT<0.5)return R.hit;']] },
    DANGER12: { want: 'danger holds while', muts: [['if(!RAIL.danger&&h>=10)RAIL.danger=true;', 'if(!RAIL.danger&&h>=12)RAIL.danger=true;']] },
    RAILREPLAY: { want: 'chain of 5 plays the dance once', muts: [['  else if(n===3||n===4)RAIL.beatT=t;', '  else if(n===3||n===4){ RAIL.beatT=t; if(t-RAIL.danceT>0.6)RAIL.danceT=t; }']] },
    RAILIDLE: { want: 'chain of 5 plays the dance once', muts: [['    else if(RAIL.chain)return RAIL_RM?D.frames[0]:D.frames[5]; }', '    }']] },
    NEXTCLEAR: { want: 'opening is near black', muts: [["var apw=nw.aperture[2]*nws, aph=nw.aperture[3]*nws; ctx.fillStyle='#161207'; rr(ncx-apw/2, ncy-aph/2, apw, aph, 6); ctx.fill();", '']] },
    METER369: { want: 'right neon line shows', muts: [['    var mx=374, mw=6, mh=VISROWS*PF.cell, my=PF.y;', '    var mx=369, mw=7, mh=VISROWS*PF.cell, my=PF.y;']] },
    PENDTOP: { want: 'incoming Chaff rows sit above', muts: [['var bx=mini?440:206; var by=mini?F.y-51:66;', 'var bx=F.x; var by=F.y-(mini?16:26);']] },
    SLICE: { want: 'corner speaker draws at one scale', muts: [['F===PF?0.4:0.5, fr.slice);', 'F===PF?0.4:0.5);']] },
    NORELEASE2: { want: 'only the Gnat King Cole', muts: [["function cwRelease(keepId){ var k; for(k in _cwCache)", "function cwRelease(keepId){ return; var k; for(k in _cwCache)"]] },
  },
  p2a: {
    FIRST138: { want: 'held arrow moves at once, then at 105', muts: [['var REP_FAST={first:105, every:33}', 'var REP_FAST={first:138, every:33}']] },
    RELAXEDSAME: { want: 'Relaxed held moves', muts: [['REP_RELAXED={first:160, every:50}', 'REP_RELAXED={first:105, every:33}']] },
    NOHANDBACK: { want: 'last pressed side wins', muts: [['if(INP.dir===side){ INP.dir=INP.l?-1:(INP.r?1:0); INP.t=0; INP.n=0; }', 'if(INP.dir===side){ INP.dir=0; }']] },
    NOBUF: { want: 'turns the next pair if it spawns within 120', muts: [['function rotBuffered(f){ var b=INP.buf; INP.buf=null; if(b&&INP.clock-b.t<=ROT_BUF_MS)tryRotate(f,b.dir); }', 'function rotBuffered(f){ INP.buf=null; }']] },
    CLIMB: { want: 'the kick table', muts: [['var KICKS=[ [[0,0]], [[0,0],[-1,0]], [[0,0],[0,-1]], [[0,0],[1,0]] ];', 'var KICKS=[ [[0,0]], [[0,0],[-1,0],[0,-1]], [[0,0],[0,-1]], [[0,0],[1,0],[0,-1]] ];']] },
    NOFLOORKICK: { want: 'the kick table', muts: [['[[0,0],[0,-1]], [[0,0],[1,0]] ];', '[[0,0]], [[0,0],[1,0]] ];']] },
    LOCKNOW: { want: 'locks 300 ms later', muts: [['var LAND_MS=300, LAND_RESETS=2,', 'var LAND_MS=0, LAND_RESETS=2,']] },
    NORESET: { want: 'two moves while it is down', muts: [['function landReset(f){ var L=f.land; if(L&&L.on&&L.resets<LAND_RESETS){ L.t=0; L.resets++; } }', 'function landReset(f){ }']] },
    NOCAP: { want: 'however it is moved it locks 650', muts: [['LAND_CAP=650,', 'LAND_CAP=99999,']] },
    FRESHEVERY: { want: 'never buys a fresh window', muts: [['if(L.age<0||low>L.low){ L.age=0; L.t=0; L.low=low; }', 'if(!L.on){ L.age=0; L.t=0; L.low=low; }']] },
    NOINTENT: { want: 'a 40 px drag down with 24 px of wobble moves no column', muts: [["if(ax>=ay*DRAG_RATIO)d.axis='h'; else if(ay>=ax*DRAG_RATIO)d.axis='v';", "d.axis='h';"]] },
    FLICKON: { want: 'a flick up drops nothing by default', muts: [['relaxed:false, flick:false, mirror:false };', 'relaxed:false, flick:true, mirror:false };']] },
    BLURKEEP: { want: 'stops when the window loses focus', muts: [["window.addEventListener('blur',clearHolds); ", '']] },
    SMALLTRAY: { want: 'all six tray buttons are at least 56', muts: [['--sab:env(safe-area-inset-bottom,0px); --th:56px; }\nbody.bigctrl{ --th:64px; }', '--sab:env(safe-area-inset-bottom,0px); --th:44px; }\nbody.bigctrl{ --th:44px; }']] },
    FITOLD: { want: "board's frame foot is above the tray", muts: [["  if(curScreen==='s-play'&&tr){", "  if(false&&tr){"]] },
    NOGUARD: { want: 'ticks without a throw', muts: [['    else if(f.cur){ var g=f.softHold?', '    else { var g=f.softHold?']] },
    NOSOFT: { want: 'a held SOFT drops the pair fast', muts: [["holdBtn('c-down',function(){ hap(6); softSet('btn',true); },function(){ softSet('btn',false); });", '']] },
  },
};
let bad = 0;
for (const [k, g] of Object.entries(G[part])) {
  if (only.length && !only.includes(k)) continue;
  let html = fs.readFileSync(DIR + 'index.html', 'utf8');
  for (const [a, b] of g.muts) { const n = html.split(a).length - 1; if (n !== 1) { console.log(k, 'MUTATION DOES NOT BIND (' + n + '):', a.slice(0, 80)); process.exit(2); } html = html.replace(a, b); }
  if (fs.existsSync(TMP)) { console.log('refusing: ' + TMP + ' exists'); process.exit(3); }
  fs.writeFileSync(TMP, html); let out = '';
  try { out = execSync('timeout 900 node /workspaces/lucid-winds/tools/chaff-wars-tests/' + part + '_gate.mjs index-fw.html /tmp/claude-1000/pnl/fw x', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 24 }); }
  catch (e) { out = (e.stdout || '') + (e.stderr || ''); }
  finally { fs.unlinkSync(TMP); }
  const fails = out.split('\n').filter(l => /FAIL/.test(l)), hit = fails.some(l => new RegExp(g.want).test(l));
  if (!hit) bad++;
  console.log(`=== ${part} ${k}: ${hit ? 'RED as wanted' : 'NOT RED on /' + g.want + '/'}`); console.log(fails.map(l => '   ' + l.slice(0, 180)).join('\n'));
}
console.log(bad ? bad + ' group(s) did NOT go red' : 'every group went red where wanted');
