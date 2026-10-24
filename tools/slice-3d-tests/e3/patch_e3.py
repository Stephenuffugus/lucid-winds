# Part E3 (the Daily, SS22) as one patch over the E2 build. Run: python3 -I patch_e3.py
import sys
p='/workspaces/lucid-winds/satellites/slice-3d/index.html'
s=open(p,encoding='utf-8').read()
def rep(old,new,cnt=1):
    global s
    n=s.count(old)
    if n!=cnt: sys.exit('expected %d, found %d: %r'%(cnt,n,old[:100]))
    s=s.replace(old,new)
# --- CSS
rep("""#go-find{display:none; margin-top:6px; font-size:17px; font-weight:700; color:#8de8ff}
#go-find.on{display:block}""","""#go-find{display:none; margin-top:6px; font-size:17px; font-weight:700; color:#8de8ff}
#go-find.on{display:block}
/* ---- Part E3 (2026-10-24): the Daily (SS22) ---- */
.dly-day{font-size:20px; font-weight:800; color:#ece8f6}
.dly-what{font-size:17px; font-weight:700; color:#8de8ff; margin-top:4px}
.dly-res{font-size:17px; font-weight:700; color:#ffd76a; min-height:22px}
#dly-go[aria-disabled="true"]{background:transparent; border:2px solid rgba(255,215,106,0.6); color:#ffd76a; box-shadow:none; cursor:default; transform:none; filter:none}
#go-daily{display:none; align-items:center; justify-content:center; gap:10px; margin-top:8px; font-size:15px; font-weight:700; letter-spacing:1px; color:#bdb8d4}
#go-daily.on{display:flex} #go-daily.won{color:#ffd76a; font-size:17px; font-weight:800; letter-spacing:2px; text-transform:uppercase}
#go-daily img{width:52px; height:52px; object-fit:contain; display:none} #go-daily.won img.ok{display:block}""")
# --- title button, the Daily card, the end panel line
rep("""        <button class="btn sm" id="b-forge">&#9874; Forge</button>""","""        <button class="btn sm" id="b-forge">&#9874; Forge</button>
        <button class="btn sm" id="b-daily">Daily</button>""")
rep("""  <!-- HOW -->
  <!-- Stephen 7/28:""","""  <!-- DAILY (Part E3, SS22): one seeded Freefall dive each UTC day. Practice as often as you like; one scored dive a day,
       counted the moment it starts (opening this card never spends it). Results stay on this phone. -->
  <div class="screen center" id="s-daily"><div class="pad center">
    <div class="stack">
      <h2 class="sc-h">Daily Dive</h2>
      <div class="dly-day" id="dly-day"></div>
      <div class="dly-what" id="dly-what"></div>
      <div class="dly-res" id="dly-res"></div>
      <button class="btn primary" id="dly-go">Scored dive</button>
      <button class="btn sm" id="dly-practice">Practice</button>
      <div class="set-note">One scored dive a day. It counts the moment it starts, and leaving it ends it. Practice as often as you like. Your results stay on this phone.</div>
      <div class="set-note" id="dly-clock"></div>
      <button class="btn sm" id="dly-back">Back</button>
    </div>
  </div></div>

  <!-- HOW -->
  <!-- Stephen 7/28:""")
rep("""    <div id="go-find"></div>""","""    <div id="go-find"></div>
    <div id="go-daily"><img id="go-daily-img" alt=""><span id="go-daily-t"></span></div>""")
# --- the badge art
rep("""  if(U.badge_clean_slice)uiPreload(U.badge_clean_slice, function(u){ var ci=$('go-clean-img'); if(ci){ ci.src=u.slice(4,-1); ci.classList.add('ok'); } });   /* Part E2 */""",
"""  if(U.badge_clean_slice)uiPreload(U.badge_clean_slice, function(u){ var ci=$('go-clean-img'); if(ci){ ci.src=u.slice(4,-1); ci.classList.add('ok'); } });   /* Part E2 */
  if(U.badge_daily)uiPreload(U.badge_daily, function(u){ var di=$('go-daily-img'); if(di){ di.src=u.slice(4,-1); di.classList.add('ok'); } });   /* Part E3 */""")
# --- the Daily's code
D=r'''/* =====================================================================
   THE DAILY (Part E3, 2026-10-24: SS22)
   One seeded Freefall dive each UTC day, the same for everyone on the same build: {utcDate, seed, generatorVersion,
   physicsVersion, mode, level, world}, the seed and the level drawn from the date alone. Practice is unlimited and
   unscored; the one scored dive a day is spent on its first simulation tick (opening the card or a run that never starts
   spends nothing), so leaving it ends it; a refresh finds it spent. The countdown is to the common UTC midnight, shown in
   the player's own time. Results are personal: kept on this phone (s3d_daily), no server. badge_daily when the day's scored
   dive reaches the floor. A Daily dive pays like any dive but never moves the Freefall level or its bests.
   ===================================================================== */
var DAILY_GEN=1, DAILY_PHYS=1;   /* bump GEN when the shaft builder changes what a seed builds, PHYS when the fall changes */
function utcDay(t){ var d=new Date(t); return d.getUTCFullYear()+'-'+('0'+(d.getUTCMonth()+1)).slice(-2)+'-'+('0'+d.getUTCDate()).slice(-2); }
function dailySpec(t){
  var day=utcDay(t), n=Math.floor(t/86400000), key=day+':g'+DAILY_GEN+':p'+DAILY_PHYS, h=0x811c9dc5, i;
  for(i=0;i<key.length;i++){ h^=key.charCodeAt(i); h=Math.imul(h,16777619)>>>0; }
  var lvl=5+(((n*13)%31)+31)%31;   /* levels 5 to 35: every world but the last, a fresh one most days */
  return { utcDate:day, seed:h>>>0, generatorVersion:DAILY_GEN, physicsVersion:DAILY_PHYS, mode:'ff', level:lvl, world:WORLD_IDS[Math.floor((lvl-1)/5)%WORLD_IDS.length] };
}
function okDly(d, day){ return okObj(d)&&d.day===day&&d.gen===DAILY_GEN&&typeof d.used==='boolean'&&typeof d.done==='boolean'&&typeof d.score==='number'&&d.score>=0; }
var DLY=null;
/* today's record: a new day (or a broken or older record) starts fresh */
function dlyToday(){ var sp=dailySpec(Date.now()); if(!okDly(DLY, sp.utcDate)){ var disk=readObj('s3d_daily'); DLY=okDly(disk, sp.utcDate)?disk:{ day:sp.utcDate, gen:DAILY_GEN, used:false, done:false, score:0 }; } return sp; }
/* a set of facts about one day: spent and done only ever go on, the score only up (two tabs, a refresh) */
function saveDaily(){ var disk=readObj('s3d_daily');
  if(okDly(disk, DLY.day)){ DLY.used=DLY.used||disk.used; DLY.done=DLY.done||disk.done; if(disk.score>DLY.score)DLY.score=disk.score; }
  LS.s('s3d_daily', JSON.stringify(DLY)); }
var DLY_TICK=null;
function dlyClock(){ var el=$('dly-clock'); if(!el)return; var t=Date.now(), next=(Math.floor(t/86400000)+1)*86400000, s2=Math.max(0,Math.ceil((next-t)/1000));
  var hh=Math.floor(s2/3600), mm=Math.floor((s2%3600)/60), ss=s2%60;
  var parts=[]; if(hh)parts.push(hh+'h'); if(hh||mm)parts.push(mm+'m'); if(!hh)parts.push(ss+'s'); el.textContent='A new dive in '+parts.join(' ');
  if(dailySpec(t).utcDate!==$('s-daily').getAttribute('data-day'))paintDaily(); }
function paintDaily(){
  var sp=dlyToday(), dd=new Date(sp.utcDate+'T12:00:00Z'), nm=sp.world.replace(/_/g,' ');
  warmWorld(sp.world);   /* its paintings ahead of the dive */
  $('s-daily').setAttribute('data-day', sp.utcDate);
  $('dly-day').textContent=dd.toLocaleDateString(undefined,{weekday:'long', day:'numeric', month:'long', timeZone:'UTC'});
  $('dly-what').textContent='Freefall '+sp.level+' in '+nm.replace(/\b\w/g,function(c){ return c.toUpperCase(); });
  var go=$('dly-go'), res=$('dly-res');
  if(DLY.used){ go.setAttribute('aria-disabled','true'); go.textContent=DLY.done?'Scored dive done':'Scored dive spent';
    res.textContent=DLY.done?('Today: '+DLY.score.toLocaleString()+' points, the floor reached'):('Today: '+DLY.score.toLocaleString()+' points'); }
  else { go.removeAttribute('aria-disabled'); go.textContent='Scored dive'; res.textContent=''; }
}
function showDaily(){ paintDaily(); show('s-daily'); dlyClock(); if(DLY_TICK)clearInterval(DLY_TICK);
  DLY_TICK=setInterval(function(){ if(curScreen!=='s-daily'){ clearInterval(DLY_TICK); DLY_TICK=null; return; } dlyClock(); }, 1000); }
function newDaily(scored){
  var sp=dlyToday();
  if(scored){ var dk=readObj('s3d_daily'); if(okDly(dk, sp.utcDate)&&dk.used)DLY.used=true; }   /* another tab may have spent it */
  if(scored&&DLY.used){ paintDaily(); return; }
  newFF(sp.level, false, sp.seed);
  if(!G)return;
  G.daily=scored?'scored':'practice'; G.dailyDay=sp.utcDate;
  var lb=scored?'DAILY':'DAILY PRACTICE'; $('h-lvl').textContent=lb; var bn=$('lvlbanner'); if(bn)bn.textContent=lb;
}
/* the end panel's Daily line: personal, the badge when the scored dive reached the floor */
function dailyHide(){ var el=$('go-daily'); if(el)el.classList.remove('on','won'); $('go-retry').textContent='Replay'; }
function dailyResults(fin){
  dailyHide(); if(!G||!G.daily)return;
  var el=$('go-daily'), t=$('go-daily-t'), first=false;
  if(G.daily==='scored'){   /* the day it began, even if it lands after the UTC midnight */
    if(!DLY||DLY.day!==G.dailyDay){ var dk=readObj('s3d_daily'); DLY=okDly(dk, G.dailyDay)?dk:{ day:G.dailyDay, gen:DAILY_GEN, used:true, done:false, score:0 }; }
    if(fin&&!DLY.done){ DLY.done=true; first=true; } if(G.score>DLY.score)DLY.score=G.score; saveDaily(); }
  t.textContent=first?'Daily done':(G.daily==='scored'?'Daily, your personal result':'Daily practice, not scored');
  el.classList.add('on'); if(first)el.classList.add('won');
  $('go-next').textContent='Daily'; $('go-retry').textContent='Practice';
}
'''
rep("function buildFreefall(lvl){\n", D+"function buildFreefall(lvl){\n")
# --- a fixed salt for the Daily
rep("""function newFF(lvl, endless){""","""function newFF(lvl, endless, salt){   /* salt: the Daily's seed (Part E3) */""")
rep("""  G_FFSALT=(FFSALT_FORCE!=null)?FFSALT_FORCE:((Math.random()*4294967295)>>>0);""",
    """  G_FFSALT=(salt!=null)?(salt>>>0):(FFSALT_FORCE!=null)?FFSALT_FORCE:((Math.random()*4294967295)>>>0);""")
# --- spent on the first simulation tick
rep("""  G.t+=dt; G.stepK=(G.stepK||0)+1;            // stepK: the step's number, for contacts that last (a stack's, Part E1)""",
    """  G.t+=dt; G.stepK=(G.stepK||0)+1;            // stepK: the step's number, for contacts that last (a stack's, Part E1)
  if(G.daily==='scored'&&!G.dailyLive){ G.dailyLive=true; dlyToday(); if(DLY.day===G.dailyDay){ DLY.used=true; saveDaily(); } }   /* Part E3: spent as it starts */""")
# --- the end panel: never the Freefall level or its bests; the Daily line
rep("""  var bkey=(ff?'f':'l')+lvl;
  var best=PROG.best[bkey]||0, nb=G.score>best;
  if(nb){ PROG.best[bkey]=G.score; }
  if(ff){ if(lvl>=PROG.ffLevel)PROG.ffLevel=lvl+1; }""","""  var bkey=(ff?'f':'l')+lvl;
  var best=PROG.best[bkey]||0, nb=!G.daily&&G.score>best;   /* Part E3: a Daily dive never moves a level or a best */
  if(nb){ PROG.best[bkey]=G.score; }
  if(ff){ if(!G.daily&&lvl>=PROG.ffLevel)PROG.ffLevel=lvl+1; }   /* (the review: the first cut let a Daily fall through to Journey's level) */""")
rep("""  $('go-title').textContent=(ff?'FREEFALL ':'LEVEL ')+lvl+' CLEAR';""","""  $('go-title').textContent=G.daily?'DAILY CLEAR':((ff?'FREEFALL ':'LEVEL ')+lvl+' CLEAR');   /* Part E3 */""")
rep("""  if(ff)cleanResults(true);   /* Part E2: the line's count, the badge, the find */""",
    """  if(ff)cleanResults(true);   /* Part E2: the line's count, the badge, the find */
  if(ff)dailyResults(true);   /* Part E3 */""")
rep("""  G.ended=true;
  cleanHide();""","""  G.ended=true;
  cleanHide(); dailyHide();""")
rep("""  cleanHide(); if(G.mode==='ff'&&!G.endless)cleanResults(false);   /* Part E2: the line's count and the find on a failed dive too */""",
    """  cleanHide(); if(G.mode==='ff'&&!G.endless)cleanResults(false);   /* Part E2: the line's count and the find on a failed dive too */
  dailyHide();""")
rep("""  $('go-next').textContent=G.endless?'Dive Again':'Try Again';""","""  $('go-next').textContent=G.endless?'Dive Again':'Try Again';
  if(G.daily)dailyResults(false);   /* Part E3 */""")
# --- buttons
rep("""tap('go-next',function(){ if(G&&G.climbWall)newClimb(PROG.climbLevel||1);
  else if(G&&G.endless)newEndless();""","""tap('go-next',function(){ if(G&&G.daily){ showDaily(); return; }   /* Part E3: back to the Daily card */
  if(G&&G.climbWall)newClimb(PROG.climbLevel||1);
  else if(G&&G.endless)newEndless();""")
rep("""tap('go-retry',function(){ if(G&&G.climbWall)newClimb(G.lvl);""","""tap('go-retry',function(){ if(G&&G.daily){ newDaily(false); return; }   /* Part E3: practise the day's dive */
  if(G&&G.climbWall)newClimb(G.lvl);""")
rep("""tap('how-back',function(){ show('s-title'); });""","""tap('how-back',function(){ show('s-title'); });
tap('b-daily',function(){ showDaily(); });   /* Part E3 */
tap('dly-go',function(){ if($('dly-go').getAttribute('aria-disabled')==='true')return; newDaily(true); });
tap('dly-practice',function(){ newDaily(false); });
tap('dly-back',function(){ show('s-title'); });""")
# --- dev hooks
rep("""    gpuTex:function(){ return renderer?renderer.info.memory.textures:0; },""","""    gpuTex:function(){ return renderer?renderer.info.memory.textures:0; },
    /* Part E3: the Daily */
    daily:function(t){ return dailySpec(t==null?Date.now():t); }, dly:function(){ dlyToday(); return DLY; }, newDaily:newDaily, showDaily:showDaily,""")
open(p,'w',encoding='utf-8').write(s); print('E3 patch applied')
