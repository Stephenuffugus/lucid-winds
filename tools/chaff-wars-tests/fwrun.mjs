// Fail watch for Pop N Lock: each group writes index.html with ONE fix undone as index-fw.html beside it (every relative
// URL keeps working), runs the gate on it, must go RED on the check it names, then deletes it. node fwrun.mjs p0 [group ...]
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import vm from 'node:vm';
const DIR = '/workspaces/lucid-winds/satellites/chaff-wars/', TMP = DIR + 'index-fw.html', [part, ...only] = process.argv.slice(2);
const G = {
  p0: {
    HYPEDT: { want: 'HYPE 80 after 16 ms', muts: [['f.hype=Math.max(0,f.hype-dt/1000*1.3);', 'f.hype=Math.max(0,f.hype-dt*1.3);']] },
    GLOWDT: { want: 'chain glow 1 after 16 ms', muts: [['f.chainGlow=Math.max(0,f.chainGlow-dt/1000*1.1);', 'f.chainGlow=Math.max(0,f.chainGlow-dt*1.1);']] },
    ALLBONUS: { want: 'All Clear bonus survives', muts: [['if(f.allBonus&&R.chain>0){', 'if(f.allBonus){']] },
    CANCEL: { want: 'cancelled 10 px, 100 ms touch', muts: [["cv.addEventListener('pointercancel',dragCancel,{passive:false});", "cv.addEventListener('pointercancel',dragEnd,{passive:false});"]] },
    LOCKDRAG: { want: 'lock in the middle of a soft drop', muts: [["  if(f===MATCH.pf){ dragSt=null; softSet('drag',false); }", '']] },   /* v1.9's lock line */
    REPEAT: { want: 'held arrow moves at once', muts: [['var REP_FAST={first:105, every:33}', 'var REP_FAST={first:138, every:33}']] },   /* v1.9: the one scheduler (v1.7 mutated hold()) */
    BACKLOG: { want: 'starting a soft drop drops at most one row', muts: [['      if(f.gravAcc>g)f.gravAcc=g;', '']] },
    CLAMPAFTER: { want: 'falls a row every 40 ms', muts: [['      if(f.gravAcc>g)f.gravAcc=g;', '      f.gravAcc+=dt; if(f.gravAcc>g)f.gravAcc=g; f.gravAcc-=dt;'], ['      f.gravAcc+=dt;\n      while(f.gravAcc>=g)', '      f.gravAcc+=dt; if(f.gravAcc>g)f.gravAcc=g;\n      while(f.gravAcc>=g)']] },
    FLOATFIT: { want: 'banner fits the board', muts: [["var punch=CALM?0:Math.min(1,Math.max(0,fl.life-0.82)/0.18);", "var punch=CALM?0:Math.max(0,fl.life-0.82)/0.18;"], ["if(mw>lim){ fs=Math.max(lab(10),Math.floor(fs*lim/mw)); ctx.font='italic 800 '+fs+'px system-ui'; }", ""]] },
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
    RAILIDLE: { want: 'chain of 5 plays the dance once', muts: [['    else if(RAIL.chain)return CALM?D.frames[0]:D.frames[5]; }', '    }']] },   /* v1.11: RAIL_RM became CALM */
    NEXTCLEAR: { want: 'opening is near black', muts: [["var apw=nw.aperture[2]*nws, aph=nw.aperture[3]*nws; ctx.fillStyle='#161207'; rr(ncx-apw/2, ncy-aph/2, apw, aph, 6); ctx.fill();", '']] },
    METER369: { want: 'right neon line shows', muts: [['    var mx=374, mw=6, mh=VISROWS*PF.cell, my=PF.y;', '    var mx=369, mw=7, mh=VISROWS*PF.cell, my=PF.y;']] },
    PENDTOP: { want: 'incoming Chaff rows sit above', muts: [['  var fs=mini?lab(10):lab(18), bx=mini?388:Math.max(206, 66+HUD.w+16), base=mini?280+Math.round(lab(10)*0.95)+Math.round(lab(10)*1.25):82, pw=f.pending;', '  var fs=mini?lab(10):lab(18), bx=F.x, base=F.y+(mini?8:20), pw=f.pending;']] },   /* v1.11's queue line: onto the frames */
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
    NOINTENT: { want: 'a 50 px drag down with 30 px of wobble moves no column', muts: [["if(ax>=ay*DRAG_RATIO)d.axis='h'; else if(ay>=ax*DRAG_RATIO)d.axis='v';", "if(true)d.axis='h'; else if(ay>=ax*DRAG_RATIO)d.axis='v';"]] },   /* a parsing copy: every drag commits sideways */
    FLICKON: { want: 'a flick up drops nothing by default', muts: [['relaxed:false, flick:false, mirror:false,', 'relaxed:false, flick:true, mirror:false,']] },
    BLURKEEP: { want: 'stops when the window loses focus', muts: [["window.addEventListener('blur',clearHolds); ", '']] },
    SMALLTRAY: { want: 'all six tray buttons are at least 56', muts: [['--sab:env(safe-area-inset-bottom,0px); --th:56px; }\nbody.bigctrl{ --th:64px; }', '--sab:env(safe-area-inset-bottom,0px); --th:44px; }\nbody.bigctrl{ --th:44px; }']] },
    FITOLD: { want: "board's frame foot is above the tray", muts: [["  if(curScreen==='s-play'&&tr){", "  if(false&&tr){"]] },
    NOGUARD: { want: 'ticks without a throw', muts: [['    else if(f.cur){ var g=f.softHold?', '    else { var g=f.softHold?']] },
    DROPCLICK: { want: 'DROP tapped while LEFT is held drops', muts: [["(function(){ var el=$('dropbtn'), pid=null, pair=null; if(!el)return;", "tap('dropbtn',function(){ if(playable()){ hap(16); hardDrop(pf()); } }); (function(){ var el=null, pid=null, pair=null; if(!el)return;"]] },
    DROPANY: { want: 'never slams the next pair', muts: [['if(near&&pair&&playable()&&pf().cur===pair){ hap(16); hardDrop(pf()); }', 'if(near&&playable()){ hap(16); hardDrop(pf()); }']] },
    KEEPCAPTURE: { want: 'a thumb that slides off SOFT lets go', muts: [['pid=e.pointerId; if(roll)TRAY_TOUCH[e.pointerId]=1; try{ el.releasePointerCapture(e.pointerId); }catch(err){} down(); }', 'pid=e.pointerId; if(roll)TRAY_TOUCH[e.pointerId]=1; down(); }']] },
    NOROLL: { want: 'one rolled from LEFT onto SOFT', muts: [["if(roll)el.addEventListener('pointerenter',", "if(false)el.addEventListener('pointerenter',"]] },
    DOUBLEPRESS: { want: 'LEFT and RIGHT taps move exactly one column', muts: [['if(pid===null&&TRAY_TOUCH[e.pointerId])press(e);', 'if(pid===null&&e.buttons)press(e);']] },
    FLAT300: { want: 'on a slow stage', muts: [['  var w=Math.max(LAND_MS,f.gravMs);', '  var w=LAND_MS;']] },
    KEYREPEAT: { want: 'an arrow key held through the count', muts: [["document.addEventListener('keydown',function(e){ if(curScreen!=='s-play')return; var k=e.key;", "document.addEventListener('keydown',function(e){ if(curScreen!=='s-play'||MATCH.phase!=='fight')return; var k=e.key;"], ['if(!(sd<0?INP.l:INP.r))repPress(sd);', 'if(!e.repeat)repPress(sd);']] },
    BIG64: { want: 'the tray rows are 56 px by default', muts: [['var SET={ sound:true, ghost:true, bigTray:false,', 'var SET={ sound:true, ghost:true, bigTray:true,']] },
    OLDKEY: { want: 'a v1.8 player\'s saved settings', muts: [["wireToggle('tg-big','bigTray',applyBig);", "wireToggle('tg-big','bigTray',applyBig); SET.bigTray=(function(){ try{ return JSON.parse(LS.g('cw_set')||'{}').big!==false; }catch(e){ return false; } })(); applyBig();"]] },
    ROTROLL: { want: 'a ROTATE tap that drifts up onto SOFT', muts: [['pid=e.pointerId; if(roll)TRAY_TOUCH[e.pointerId]=1;', 'pid=e.pointerId; TRAY_TOUCH[e.pointerId]=1;']] },
    DROPSLIP: { want: 'a DROP that slips 10 px past its edge', muts: [['var b=el.getBoundingClientRect(), near=e.clientX>=b.left-16&&e.clientX<=b.right+16&&e.clientY>=b.top-16&&e.clientY<=b.bottom+16;', 'var b=el.getBoundingClientRect(), near=e.clientX>=b.left&&e.clientX<=b.right&&e.clientY>=b.top&&e.clientY<=b.bottom;']] },
    NOSOFT: { want: 'a held SOFT drops the pair fast', muts: [["holdBtn('c-down',function(){ hap(6); softSet('btn',true); },function(){ softSet('btn',false); },true);", '']] },
  },
  p2b: {
    GUIDEUNIT: { want: 'the landing guide marks exactly', muts: [['  return [{r:colTop(f.grid,cur.c),c:cur.c,col:cur.c1,pivot:true},{r:colTop(f.grid,p.c),c:p.c,col:cur.c2}]; }', '  t=Math.min(colTop(f.grid,cur.c),colTop(f.grid,p.c)); return [{r:t,c:cur.c,col:cur.c1,pivot:true},{r:t,c:p.c,col:cur.c2}]; }']] },
    CAPALL: { want: '31 queued Chaff', muts: [['  var drop=Math.min(f.pending,GARBAGE_CAP); f.pending-=drop;', '  var drop=f.pending; f.pending-=drop;']] },
    JUDGEFIRST: { want: 'topping out on one tick is a draw', muts: [["  if(f.dead||!spawnPiece(f)){ f.dead=true; MATCH.judge=MATCH.judge||{}; MATCH.judge[f===MATCH.pf?'pf':'of']=true; }", "  if(f.dead||!spawnPiece(f)){ endMatch(f===MATCH.pf?'lose':'win'); }"]] },
    FRAMEDECAY: { want: 'a fall runs on time', muts: [["f.fall[r][c]=f.fall0[r][c]*(1-(fd<0?p:p*p)); any=true;", 'f.fall[r][c]*=(1-Math.max(0.14,dt/90)); any=true;']] },
    LIVECURVE: { want: 'a fall in flight when the match ends', muts: [["f.fall[r][c]=f.fall0[r][c]*(1-(fd<0?p:p*p)); any=true;", "f.fall[r][c]=f.fall0[r][c]*(1-(MATCH.phase==='done'?p:p*p)); any=true;"]] },
    CLIPALL: { want: 'a settled board draws no well clip', muts: [['    if(off>0){ ctx.save(); ctx.beginPath(); ctx.rect(', '    if(true){ ctx.save(); ctx.beginPath(); ctx.rect('], ['    if(off>0)ctx.restore(); }', '    if(true)ctx.restore(); }']] },
    POWERPAUSE: { want: 'Powers mode: the power is not ready', muts: [['function powerReady(f){ return !!(MATCH.powers && !MATCH.paused && f', 'function powerReady(f){ return !!(MATCH.powers && f']] },
    NOSQUASH: { want: 'a fall runs on time', muts: [['      if(p>=1){ f.fall[r][c]=0; f.squash[r][c]=SQUASH_MS; } }', '      if(p>=1){ f.fall[r][c]=0; } }']] },
    NOPAUSE: { want: 'a hidden Campaign match stays exactly', muts: [["function pauseMatch(){ if(MATCH.mode==='versus'||MATCH.phase!=='fight')return;", "function pauseMatch(){ return; if(MATCH.mode==='versus'||MATCH.phase!=='fight')return;"]] },
    PAUSEINPUT: { want: 'during the three count a real Space', muts: [["function playable(){ return MATCH.phase==='fight' && !MATCH.paused && pf()", "function playable(){ return MATCH.phase==='fight' && pf()"]] },
    REPAUSE: { want: 'during the three count a real Space', muts: [["function pauseMatch(){ if(MATCH.mode==='versus'||MATCH.phase!=='fight')return;", "function pauseMatch(){ if(MATCH.mode==='versus'||MATCH.phase!=='fight'||MATCH.paused)return;"]] },
    DRAINEASE: { want: "the outro's drain", muts: [["d=MATCH.phase==='done'?90:fallDur(rows);", 'd=fallDur(rows);'], ["(1-(fd<0?p:p*p))", '(1-p*p)']] },
    GUIDEROW: { want: 'the Landing guide row', muts: [['background:#161309; min-height:var(--row); cursor:pointer}', 'background:#161309; cursor:pointer}']] },   /* v1.11: the shared row rule */
    NOCOUNT: { want: 'a hidden Campaign match stays exactly', muts: [['    if(MATCH.resumeT>=700){ MATCH.resumeT=0; MATCH.count--;', '    if(MATCH.resumeT>=0){ MATCH.resumeT=0; MATCH.count=0;']] },
  },
  p3a: {
    FONTSMALL: { want: 'every line of copy on every screen', muts: [['  #stage{--fs:calc(max(18px, calc(12px * var(--k))) * var(--tx));', '  #stage{--fs:calc(15px * var(--tx));']] },
    HITSMALL: { want: 'every line of copy on every screen', muts: [[' --hit:max(72px, calc(48px * var(--k)));', ' --hit:60px;']] },
    ROWSMALL: { want: 'every line of copy on every screen', muts: [[' --row:max(84px, calc(56px * var(--k)))}', ' --row:66px}']] },
    ROWNOTTARGET: { want: 'a real tap on a settings row', muts: [["  row.addEventListener('click',function(e){ e.preventDefault(); SET[key]=!SET[key];", "  el.addEventListener('click',function(e){ e.preventDefault(); SET[key]=!SET[key];"]] },
    CALMSHAKE: { want: 'the screen shakes by default', muts: [['function shake(a,ms){ if(CALM||!SET.shake)return;', 'function shake(a,ms){ if(false)return;']] },
    NOHAPGATE: { want: 'Vibration off stops every buzz', muts: [['function hap(ms){ if(SET.haptics&&navigator.vibrate){', 'function hap(ms){ if(navigator.vibrate){']] },
    NOMUSICHIDE: { want: 'a match hides the fleet', muts: [['body.playing #sws-music-card, body.playing #sws-music-pill, body.playing #sws-music-toast, body.playing #sws-music-chip{display:none !important}', '']] },
    BANG: { want: 'no quoted player string', muts: [["txt:'DENIED',", "txt:'DENIED!',"]] },
    SAFEAREA: { want: 'a 40 px top safe area', muts: [['var iw=_vvW(), ih=_vvH(), sat=safeTop(),', 'var iw=_vvW(), ih=_vvH(), sat=0,']] },
    BOOTAPPLY: { want: 'applied on the first load', muts: [['applyBig(); fit(); paintTitle(); requestAnimationFrame(loop);', 'fit(); paintTitle(); requestAnimationFrame(loop);']] },
    HOMEZONE: { want: 'at 360 wide the back button answers', muts: [['#b-home::after{left:-10px; top:-10px; right:auto; bottom:auto; width:max(82px, calc(52px * var(--k))); height:min(max(82px, calc(52px * var(--k))), 100px)}', '']] },
    ZONEWELL: { want: 'the back zone stops above the well', muts: [['height:min(max(82px, calc(52px * var(--k))), 100px)}', 'height:max(82px, calc(52px * var(--k)))}']] },
    LOGOCLEAR: { want: 'the title\'s logo starts below the back button', muts: [['#s-title>.pad{padding-top:calc(var(--hit) + 22px)}', '']] },
    ROWROLE: { want: 'a settings row is a switch', muts: [["var row=el.parentNode; row.setAttribute('role','switch'); rowKeys(row);", 'var row=el.parentNode;']] },
    BEATWORDS: { want: 'real taps on it play and stop it', muts: [["b.textContent=B.on?'\\u266B Stop beat':'\\u266B Play beat'; ", '']] },
    BEATSTALE: { want: 'sees Play beat before anything plays', muts: [['  if(B.on){ B.on=false; paint(); var k=', '  if(B.on){ B.on=false; var k=']] },
    BEATFIRST: { want: 'real taps on it play and stop it', muts: [["if(e&&e.target&&e.target.closest&&e.target.closest('#b-bgm'))return; start(); };", 'start(); };']] },
    BEATLABEL: { want: 'those words are its name', muts: [['<button class="btn sm" id="b-bgm" title="80s beat" onclick=', '<button class="btn sm" id="b-bgm" title="80s beat" aria-label="Toggle 80s background beat" onclick=']] },
    CALMCLASS: { want: 'Reduce motion cycles to On', muts: [["if(CALM)B.add('calm'); else B.remove('calm');", '']] },
    BIGTEXTVAR: { want: 'Larger text grows the copy', muts: [['body.bigtext #stage{--tx:1.25; --fs:22.5px}', 'body.bigtext #stage{--fs:22.5px}']] },
  },
  p4: {
    RECNONE: { want: 'a won stage writes its record', muts: [['PROG.recs[st.id]=recMeta(MATCH.pf?MATCH.pf.score:0);', '']] },
    RECSOLO: { want: 'a solo best writes its record', muts: [['PROG.recs.solo=recMeta(MATCH.pf.score); ', '']] },
    RECINPUT: { want: 'a won stage writes its record', muts: [["input:{ rep:SET.relaxed?'relaxed':'fast',", "input:{ rep:'fast',"]] },
    LESSONINTRO: { want: 'sees the lesson on stage 1, 2 and 3', muts: [["iles=lessonFor(ist); if(iles)tag+=' · LESSON';", 'iles=null;']] },
    LESSONCOUNT: { want: 'the count before stage 1 shows the lesson', muts: [['var cles=lessonFor(ROSTER[MATCH.stage]);', 'var cles=null;']] },
    LESSONTIP: { want: 'says Try this', muts: [["var gl=(result!=='win')?lessonFor(st):null;", 'var gl=null;']] },
    LESSONSEEN: { want: 'each mark their lesson', muts: [["if(f===MATCH.pf){ lessonSeen('pop'); if(R.chain>=2)lessonSeen('chain'); } ", '']] },
    LESSONCANCEL: { want: 'each mark their lesson', muts: [["if(f===MATCH.pf)lessonSeen('cancel'); ", '']] },
    LESSONSTOP: { want: 'the lessons stop', muts: [['return (L&&!PROG.lessons[L.k])?L:null;', 'return L||null;']] },
    LESSONLONG: { want: 'leaves the intro.s hint above the tray', muts: [["t:'Join four or more pods of one colour and they pop.'", "t:'Join four or more pods of one colour and they pop, and keep the stack low on the left so a pair can always land somewhere and the Chaff from your rival never reaches the top of your board.'"]] },
    RESULTPAINT: { want: 'paint above the banner art', muts: [['#go-lab, #go-line{position:relative; z-index:1; text-shadow:0 1px 2px #000, 0 0 10px rgba(0,0,0,.9)}', '']] },
    FALLCHANGE: { want: 'matches its stored baseline|keep their speeds', muts: [["colors:4, fall:0.80, q:0.08,", "colors:4, fall:0.95, q:0.08,"]] },
  },
  p3b: {
    LABFLOOR: { env: { P3B_BLOCKS: 'A', P3B_SWEEP: '360x780' }, want: 'every canvas text in a live match', muts: [['function lab(d){ return Math.round(Math.max(d, Math.ceil(12/STAGE_S))*(SET.bigText?1.25:1)); }', 'function lab(d){ return d; }']] },
    LOCKX: { env: { P3B_BLOCKS: 'A', P3B_SWEEP: '360x780b' }, want: 'no two HUD labels overlap', muts: [["var lockX=66+ctx.measureText('POP N ').width;", 'var lockX=122;']] },
    HEADERFIXED: { env: { P3B_BLOCKS: 'A', P3B_SWEEP: '412x915' }, want: 'no two HUD labels overlap', muts: [["ctx.fillText('YOUR PLOT', 66, ypY);", "ctx.fillText('YOUR PLOT', 66, 72);"]] },
    SCORESHRINK: { env: { P3B_BLOCKS: 'A', P3B_SWEEP: '375x548b' }, want: 'the score is never smaller than its label', muts: [['  if(ypY+0.2*ypS+2+0.78*scS>84){ for(;;){', '  scS=Math.max(hFlo, Math.min(scS, Math.floor((84-(ypY+0.2*ypS)-1)/0.78))); if(false){ for(;;){']] },
    CANCELWIDE: { env: { P3B_BLOCKS: 'A', P3B_SWEEP: '375x548' }, want: 'the header ends left of the rival card', muts: [["while(ctx.measureText(cTxt).width>376-cX&&cfs>Math.ceil(12/STAGE_S)){ cfs--; ctx.font='800 '+cfs+'px system-ui'; }", ''], ['ctx.fillText(cTxt, cX, cY, 376-cX);', 'ctx.fillText(cTxt, cX, cY);']] },
    CANCELWM: { env: { P3B_BLOCKS: 'A', P3B_SWEEP: '375x548b' }, want: 'no two HUD labels overlap', muts: [['if(cY-0.78*cfs<HUD.wmY+0.2*HUD.wmS+2)cX=Math.max(cX, HUD.wmR+12);', '']] },
    RIVALPILE: { env: { P3B_BLOCKS: 'A', P3B_SWEEP: '412x915' }, want: 'no two HUD labels overlap|names its rival beside', muts: [['ctx.fillText(rsc,rTall?388:530,rys,142);', 'ctx.fillText(rsc,400,ry1);']] },
    RIVALTALL: { env: { P3B_BLOCKS: 'A', P3B_SWEEP: '390x664' }, want: 'names its rival beside or over', muts: [['var rTall=388+rwL+8>530-rwS;', 'var rTall=false;']] },
    RIVALHIDE: { env: { P3B_BLOCKS: 'A', P3B_SWEEP: '412x915' }, want: 'a rival score too long to sit beside RIVAL never prints over it', muts: [['rFit(rsc); if(!rTall&&388+rwL+8>530-rwS)rShow=false;', 'rFit(rsc);']] },
    OFFIXED: { env: { P3B_BLOCKS: 'A', P3B_SWEEP: '390x664' }, want: 'the rival plate.s lines end above', muts: [['    OF.y=Math.max(352, Math.ceil(ry2+rl0*0.2+18)); HUD.ofY=OF.y;', '    HUD.ofY=OF.y;']] },
    NAMEFIT: { env: { P3B_BLOCKS: 'A', P3B_SWEEP: '360x780b' }, want: 'every rival name fits its card', muts: [['fit(); while((L.length>2||w>ow-10)&&f>flo){ f--; fit(); }', 'fit(); while(L.length>2&&f>flo){ f--; fit(); }']] },
    NAMETHREE: { env: { P3B_BLOCKS: 'A', P3B_SWEEP: '375x548' }, want: 'every rival name fits its card', muts: [["  if(L.length>2){ var wd=nm.split(' ')", "  if(false){ var wd=nm.split(' ')"]] },
    HYPETEXT: { env: { P3B_BLOCKS: 'A', P3B_SWEEP: '412x915' }, want: 'the HYPE readout names its tier', muts: [['    ctx.fillStyle=(ht===0?\'#9a9078\':htc); ctx.fillText(HYPE_TIERS[ht][1], 390, hpY+hpH-22);', '']] },
    NOX: { env: { P3B_BLOCKS: 'A', P3B_SWEEP: '412x915' }, want: 'the HYPE readout names its tier', muts: [['    dangerX(F,mini); }', '    }']] },
    XUNDER: { env: { P3B_BLOCKS: 'A', P3B_SWEEP: '412x915' }, want: 'the danger X shows over the pair', muts: [['    dangerX(F,mini); }', '    }'], ['function drawField(f,F,mini){ if(!f)return; var r,c;', 'function drawField(f,F,mini){ if(!f)return; var r,c; if(f.flashDanger>0)dangerX(F,mini);']] },
    FLOATSMALL: { env: { P3B_BLOCKS: 'A', P3B_SWEEP: '360x780' }, want: 'every canvas text in a live match', muts: [['  var fs=(F===PF?Math.max(28,lab(16)+8):lab(14));', '  var fs=(F===PF?Math.max(28,lab(16)+8):14);'], ['fs=Math.max(lab(10),Math.floor(fs*lim/mw));', 'fs=Math.max(10,Math.floor(fs*lim/mw));']] },
    OVERLAYSMALL: { env: { P3B_BLOCKS: 'B' }, want: 'the intro card, the countdown and the outro', muts: [["ctx.font='italic '+lab(16)+'px system-ui'; var itn=wrapText(", "ctx.font='italic 16px system-ui'; var itn=wrapText("]] },
    HINTFIXED: { env: { P3B_BLOCKS: 'B' }, want: 'Larger text: the intro.s hint sits clear', muts: [["ctx.fillText('tap to start', VW/2, Math.max(VH/2+210, VH/2+144+(itn-1)*itl+Math.round(itl*1.2)));", "ctx.fillText('tap to start', VW/2, VH/2+210);"]] },
    OUTHINTFIXED: { env: { P3B_BLOCKS: 'B' }, want: '375x548 Larger text: the outro.s hint sits clear', muts: [["ctx.fillText('tap to continue', VW/2, O.hintY||800);", "ctx.fillText('tap to continue', VW/2, 800);"]] },
    ROWWRAP: { env: { P3B_BLOCKS: 'C' }, want: 'at 200 percent text no menu row', muts: [['.row{display:flex; flex-wrap:wrap; gap:12px; width:100%}', '.row{display:flex; gap:12px; width:100%}'], ['.row>.btn{flex:1 1 0; min-width:-webkit-fit-content; min-width:-moz-fit-content; min-width:fit-content}', '.row>.btn{flex:1}']] },
    ROWSTACK: { env: { P3B_BLOCKS: 'C' }, want: 'keep their button rows side by side', muts: [['.row>.btn{flex:1 1 0; min-width:-webkit-fit-content; min-width:-moz-fit-content; min-width:fit-content}', '.row>.btn{flex:1 1 auto}']] },
  },
};
let bad = 0;
for (const [k, g] of Object.entries(G[part])) {
  if (only.length && !only.includes(k)) continue;
  let html = fs.readFileSync(DIR + 'index.html', 'utf8');
  for (const [a, b] of g.muts) { const n = html.split(a).length - 1; if (n !== 1) { console.log(k, 'MUTATION DOES NOT BIND (' + n + '):', a.slice(0, 80)); process.exit(2); } html = html.replace(a, b); }
  /* a copy that does not parse kills the whole game and proves nothing about the check it names */
  { const re = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g; let m2; while ((m2 = re.exec(html))) { try { new vm.Script(m2[1]); } catch (e) { console.log(k, 'MUTATION DOES NOT PARSE:', String(e).slice(0, 120)); process.exit(4); } } }
  if (fs.existsSync(TMP)) { console.log('refusing: ' + TMP + ' exists'); process.exit(3); }
  fs.writeFileSync(TMP, html); let out = '';
  try { out = execSync('timeout 900 node /workspaces/lucid-winds/tools/chaff-wars-tests/' + part + '_gate.mjs index-fw.html /tmp/claude-1000/pnl/fw x', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 24, env: Object.assign({}, process.env, g.env || {}) }); }   /* g.env: the one block and size the check can fail at */
  catch (e) { out = (e.stdout || '') + (e.stderr || ''); }
  finally { fs.unlinkSync(TMP); }
  const fails = out.split('\n').filter(l => /FAIL/.test(l)), hit = fails.some(l => new RegExp(g.want).test(l));
  if (!hit) bad++;
  console.log(`=== ${part} ${k}: ${hit ? 'RED as wanted' : 'NOT RED on /' + g.want + '/'}`); console.log(fails.map(l => '   ' + l.slice(0, 180)).join('\n'));
}
console.log(bad ? bad + ' group(s) did NOT go red' : 'every group went red where wanted');
