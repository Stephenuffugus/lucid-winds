import re,sys
P='/workspaces/Litter_Bug/index.html'
s=open(P).read()
def rep(old,new,n=1):
    global s
    c=s.count(old)
    assert c==n, ('anchor count %d != %d for: %s'%(c,n,old[:70]))
    s=s.replace(old,new)

# ── CSS ───────────────────────────────────────────────────────────────────
rep(".btn.job.primary .bi{background:#123a1f;border-color:#2f8a4c}",
".btn.job.primary .bi{background:#123a1f;border-color:#2f8a4c}\n"
".btn.job{position:relative}\n"
"/* the featured block wears a chip at its shoulder; the strip is the week, one cell a day */\n"
".btn.job .fb{position:absolute;top:-9px;right:14px;font-size:10px;letter-spacing:2px;font-weight:800;color:var(--shine);\n"
"  background:#0b0d10;border:1px solid var(--shine);border-radius:999px;padding:3px 9px;line-height:1.2}\n"
".week{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;width:100%;max-width:430px;margin:0 auto}\n"
".week .wd{border:1px solid var(--line);border-radius:10px;background:#0c1218;padding:6px 0 6px;text-align:center}\n"
".week .wd .wl{font-size:10px;letter-spacing:1px;color:var(--dim);font-weight:800;line-height:1}\n"
".week .wd .wm{width:14px;height:14px;margin:5px auto 0;border-radius:50%;border:1px dashed #34404d;box-sizing:border-box}\n"
".week .wd.on .wm{background:var(--grub);border:0;box-shadow:0 0 9px #6fd08c99}\n"
".week .wd.today{border-color:var(--shine);background:#121a12}\n"
".week .wd.today .wl{color:var(--shine)}\n"
".weekhead{font-size:11px;letter-spacing:2px;color:var(--dim);font-weight:800;text-align:center;margin:16px 0 7px}\n"
".fladder{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:6px}\n"
".fladder .gcell .gn{font-size:16px}\n"
".fladder .gcell .gn small{font-size:10px;color:var(--dim);font-weight:800}\n"
".fladder .gcell .gl{font-size:9px}")

# ── HTML ──────────────────────────────────────────────────────────────────
rep('<div class="dtxt">SCAVENGE gives you a sixty second job on one of four blocks. Sort the recycling, hunt a grub out of a junk pile, untangle the wires, or pry the lids. Four shifts a day, and a clean shift is about one bug.</div>',
    '<div class="dtxt">SCAVENGE gives you a sixty second job on one of four blocks. Sort the recycling, hunt a grub out of a junk pile, untangle the wires, or pry the lids. Forty Shinies ends a shift early and stamps it clean, and then the clock is your score. Four shifts a day. One block is featured each day, and a clean shift there stamps the week.</div>')
rep('<div class="dim" style="margin-top:8px">Sixty seconds each.</div>',
    '<div class="dim" id="block-note" style="margin-top:8px">Sixty seconds each.</div>')
rep('<div class="dim" id="cap-note" style="margin-top:18px"></div>',
    '<div class="dim" id="cap-note" style="margin-top:18px"></div>\n      <div id="block-week"></div>')
rep('<div class="dim" id="d-prog" style="margin-top:16px"></div>',
    '<div class="dim" id="d-prog" style="margin-top:16px"></div>\n      <div id="d-week"></div>')
rep('<div class="gladder" id="x-ladder"></div>',
    '<div class="gladder" id="x-ladder"></div>\n      <div class="fladder" id="x-fam"></div>')

# ── loadSave: times, week, cleanWeeks ─────────────────────────────────────
rep("  SAVE.bests=bests;\n  var dex=[], i;",
"  SAVE.bests=bests;\n"
"  /* your fastest CLEAN shift on each block (forty Shinies, in seconds), the week strip and\n"
"     how many whole weeks you have stamped */\n"
"  var times={}, tk=(r.times&&typeof r.times==='object'&&!(r.times instanceof Array))?r.times:{};\n"
"  ['sort','grub','wire','pry'].forEach(function(k){ var v=_num(tk[k],0); if(v>0) times[k]=Math.min(60,Math.round(v*10)/10); });\n"
"  SAVE.times=times;\n"
"  var wk=r.week;\n"
"  SAVE.week=(wk&&typeof wk==='object'&&!(wk instanceof Array)&&wk.s instanceof Array&&wk.s.length===7)\n"
"    ? {w:Math.round(_num(wk.w,0)), s:wk.s.map(function(v){ return v?1:0; })} : null;\n"
"  SAVE.cleanWeeks=Math.round(_num(r.cleanWeeks,0));\n"
"  var dex=[], i;")

# ── day helpers: featured block + week ────────────────────────────────────
rep("function dayIndex(){ return Math.floor(Date.now()/864e5); }",
"function dayIndex(){ return Math.floor(Date.now()/864e5); }\n"
"/* ---------- the featured block and the week strip ----------\n"
"   Day two used to be day one again: the same four blocks, nothing pointing at any of them.\n"
"   Now one block is featured each day (it rotates, so a week walks every block), and a CLEAN\n"
"   shift on it (forty Shinies before the clock runs out) stamps that day on a Monday to\n"
"   Sunday strip. Seven stamps is a clean week. None of this pays Shinies: the cap is law. */\n"
"var BLOCKS=['sort','grub','wire','pry'];\n"
"function featuredBlock(){ return BLOCKS[dayIndex()%BLOCKS.length]; }\n"
"function weekIndex(){ return Math.floor((dayIndex()+3)/7); }   /* day 0 was a Thursday; +3 makes weeks start Monday */\n"
"function dow(){ return (dayIndex()+3)%7; }                      /* 0 Monday .. 6 Sunday */\n"
"function weekState(){\n"
"  var w=SAVE.week;\n"
"  if(!w||typeof w!=='object'||w.w!==weekIndex()){ w={w:weekIndex(), s:[0,0,0,0,0,0,0]}; SAVE.week=w; }\n"
"  return w;\n"
"}\n"
"function stampWeek(){\n"
"  var w=weekState(), d=dow();\n"
"  if(w.s[d]) return false;\n"
"  w.s[d]=1;\n"
"  var all=true, i; for(i=0;i<7;i++) if(!w.s[i]) all=false;\n"
"  if(all) SAVE.cleanWeeks=(SAVE.cleanWeeks||0)+1;\n"
"  save(); return true;\n"
"}\n"
"var WEEK_L=['M','T','W','T','F','S','S'];\n"
"function weekStrip(){\n"
"  var w=weekState(), d=dow(), s='', i;\n"
"  for(i=0;i<7;i++) s+='<div class=\"wd'+(w.s[i]?' on':'')+(i===d?' today':'')+'\"><div class=\"wl\">'+WEEK_L[i]+'</div><div class=\"wm\"></div></div>';\n"
"  return '<div class=\"week\">'+s+'</div>';\n"
"}\n"
"function fmtT(t){ return (Math.round(t*10)/10).toFixed(1).replace(/\\.0$/,'')+'s'; }")

# ── startJob: the stopwatch ───────────────────────────────────────────────
rep("  G={ kind:kind, t:60, score:0, over:false, items:[], sel:null };",
    "  G={ kind:kind, t:60, score:0, over:false, items:[], sel:null, t0:Date.now() };")

# ── bump: forty ends it ───────────────────────────────────────────────────
rep("function bump(n){ if(!G||G.over) return; G.score=Math.max(0,Math.min(SHIFT_CAP,G.score+n));\n  $('p-score').textContent=G.score; }",
"function bump(n){ if(!G||G.over) return; G.score=Math.max(0,Math.min(SHIFT_CAP,G.score+n));\n"
"  $('p-score').textContent=G.score;\n"
"  /* forty is the cap, so the shift is DONE at forty: before 2026-09-05 a fast thumb sat\n"
"     through twenty dead seconds with nothing left to earn. Ending here is what makes the\n"
"     clock a score. */\n"
"  if(G.score>=SHIFT_CAP) endJob(); }")

# ── the two round-advancers must not lay out a new round on a finished shift ─
rep("  if(isGrub){ bump(2); puff(el,'#6fd08c'); grubRound(); }",
    "  if(isGrub){ bump(2); puff(el,'#6fd08c'); if(!G.over) grubRound(); }")
rep("  if(wireCrossings()===0){ bump(6); toast('Clean run'); wireRound(); }",
    "  if(wireCrossings()===0){ bump(6); toast('Clean run'); if(!G.over) wireRound(); }")

# ── endJob ────────────────────────────────────────────────────────────────
rep("""  if(G.spawn){ clearInterval(G.spawn); G.spawn=null; }
  var paid=earnShinies(G.score);
  noteShift();
  SAVE.jobs=(SAVE.jobs||0)+1;
  var bests=SAVE.bests||(SAVE.bests={}), prevBest=bests[G.kind]||0, newBest=G.score>prevBest&&G.score>0;
  if(newBest) bests[G.kind]=G.score;
  save();
  $('d-shine').textContent='+'+paid;
  $('d-note').textContent = (paid<G.score
    ? 'You worked for '+G.score+', but the alley only had '+paid+' left today.'
    : 'Straight into the jar.')
    +(newBest ? (prevBest ? ' A new best on this block, up from '+prevBest+'.' : ' Your first shift on this block.') : '');
""",
"""  if(G.spawn){ clearInterval(G.spawn); G.spawn=null; }
  var clean=G.score>=SHIFT_CAP;
  G.used=Math.max(0.1, Math.min(60, Math.round((Date.now()-(G.t0||Date.now()))/100)/10));
  var paid=earnShinies(G.score);
  noteShift();
  SAVE.jobs=(SAVE.jobs||0)+1;
  var bests=SAVE.bests||(SAVE.bests={}), prevBest=bests[G.kind]||0, newBest=G.score>prevBest&&G.score>0;
  if(newBest) bests[G.kind]=G.score;
  /* a clean shift keeps its TIME, and the fastest one is the number on the picker */
  var times=SAVE.times||(SAVE.times={}), prevT=times[G.kind]||0, newTime=false;
  if(clean && (!prevT || G.used<prevT)){ times[G.kind]=G.used; newTime=true; }
  var feat=clean && G.kind===featuredBlock(), stamped=feat ? stampWeek() : false;
  save();
  $('d-head').textContent = clean ? 'CLEAN SHIFT' : 'SHIFT OVER';
  $('d-shine').textContent='+'+paid;
  var note = paid<G.score
    ? 'You worked for '+G.score+', but the alley only had '+paid+' left today.'
    : (clean ? 'Forty in '+fmtT(G.used).replace(/s$/,'')+' seconds.' : 'Straight into the jar.');
  if(clean) note += newTime ? (prevT ? ' Your fastest on this block, down from '+fmtT(prevT)+'.' : ' Your first clean shift on this block.') : ' Your best here is '+fmtT(prevT)+'.';
  else if(newBest) note += prevBest ? ' A new best on this block, up from '+prevBest+'.' : ' Your first shift on this block.';
  if(feat) note += stamped ? ' Today\\'s block, so the week is stamped.' : ' Today\\'s block, already stamped.';
  $('d-note').textContent=note;
  $('d-week').innerHTML = feat ? '<div class="weekhead">THE WEEK</div>'+weekStrip() : '';
""")

# ── paintBlocks ───────────────────────────────────────────────────────────
rep("""function paintBlocks(){
  var jb=document.querySelectorAll('[data-job]'), i;
  for(i=0;i<jb.length;i++){
    var k=jb[i].getAttribute('data-job'), best=(SAVE.bests||{})[k]||0;
    jb[i].classList.add('job');
    jb[i].innerHTML='<span class="bi">'+blockIcon(k)+'</span><span class="bn">'+(JOB_LABEL[k]||k)+'</span>'
      +'<span class="best">'+(best?'BEST<b>'+best+'</b>':'NOT YET<br>WORKED')+'</span>';
  }
}""",
"""function paintBlocks(){
  var jb=document.querySelectorAll('[data-job]'), i, feat=featuredBlock();
  for(i=0;i<jb.length;i++){
    var k=jb[i].getAttribute('data-job'), best=(SAVE.bests||{})[k]||0, t=(SAVE.times||{})[k]||0;
    jb[i].classList.add('job');
    /* the featured block is the green one and the first one; the rest keep their order */
    jb[i].classList.toggle('primary', k===feat);
    jb[i].innerHTML='<span class="bi">'+blockIcon(k)+'</span><span class="bn">'+(JOB_LABEL[k]||k)+'</span>'
      +'<span class="best">'+(t ? 'CLEAN<b>'+fmtT(t)+'</b>' : (best ? 'BEST<b>'+best+'</b>' : 'NOT YET<br>WORKED'))+'</span>'
      +(k===feat ? '<span class="fb">TODAY</span>' : '');
    var par=jb[i].parentNode;
    if(k===feat && par && par.firstElementChild!==jb[i]) par.insertBefore(jb[i], par.firstElementChild);
  }
  var bn=$('block-note');
  if(bn) bn.textContent='Sixty seconds each. Forty Shinies ends a shift early, and then the clock is your score. Today\\'s block is '
    +(JOB_LABEL[feat]||feat).toLowerCase()+'. A clean shift there stamps the week.';
  var bw=$('block-week');
  if(bw) bw.innerHTML='<div class="weekhead">THE WEEK'+((SAVE.cleanWeeks||0)>0 ? '  ·  '+SAVE.cleanWeeks+' CLEAN' : '')+'</div>'+weekStrip();
}""")

# ── the Bugdex families meter ─────────────────────────────────────────────
rep("""  if(!dex.length){
    g.innerHTML='<div class="empty">Nothing pinned yet. Work the alley for thirty Shinies and something will turn up.</div>';
    return;
  }""",
"""  /* the families: what the renderer can DRAW that you have not pinned yet. Grades are the
     ladder above; wings, heads and tails are the shapes. A cell goes green when it is full. */
  var fam=$('x-fam'); fam.innerHTML='';
  if(dex.length){
    var seenG={}, seenW={}, seenH={}, seenT={};
    dex.forEach(function(b){ seenG[b.grade]=1; var f=famOf(b.cb); if(f){ seenW[f.wing]=1; seenH[f.head]=1; seenT[f.tail]=1; } });
    var cnt=function(o){ var n=0, k; for(k in o) n++; return n; };
    [['GRADES',cnt(seenG),GRADES.length],['WINGS',cnt(seenW),FAM_WING.length],['HEADS',cnt(seenH),FAM_HEAD.length],['TAILS',cnt(seenT),FAM_TAIL.length]].forEach(function(r){
      var full=r[1]>=r[2];
      fam.innerHTML+='<div class="gcell'+(full?'':' none')+'" style="border-color:'+(full?'#6fd08c':'#28323d')+'">'
        +'<div class="gn" style="color:'+(full?'#6fd08c':'#e6ecf2')+'">'+r[1]+'<small> OF '+r[2]+'</small></div>'
        +'<div class="gl">'+r[0]+'</div></div>';
    });
  }
  if(!dex.length){
    g.innerHTML='<div class="empty">Nothing pinned yet. Work the alley for thirty Shinies and something will turn up.</div>';
    return;
  }""")
rep("var SPEC=-1;\nfunction _esc(t)",
"var FAM_WING=['MEMBRANE','FOUR WING','SHELL','WINGLESS'], FAM_HEAD=['ROUND','WEDGE','CREST','SNOUT'], FAM_TAIL=['NO TAIL','PLAIN','FORKED','STINGER'];\n"
"/* the family a bug belongs to, read off the SAME plan the renderer draws from */\n"
"function famOf(cb){\n"
"  var P=null; try{ P=BUG_ENGINE.bugPlan(cb); }catch(e){}\n"
"  if(!P||!P.plan) return null;\n"
"  var has=function(v){ return v!=null && v!==999; };\n"
"  return { wing: has(P.plan.wings) ? (P.wingKind||0) : 3, head: P.headKind||0, tail: has(P.plan.tail) ? 1+(P.tailKind||0) : 0 };\n"
"}\n"
"var SPEC=-1;\nfunction _esc(t)")

# ── LB_DEV ────────────────────────────────────────────────────────────────
rep("    ladder:ladderFor, dayIndex:dayIndex,",
    "    ladder:ladderFor, dayIndex:dayIndex, featured:featuredBlock, dow:dow, weekState:weekState, famOf:famOf,")
rep("    reset:function(){ SAVE={shinies:0,dex:[],jobs:0,lastDay:0,champ:null,king:null,bests:{}}; save();",
    "    reset:function(){ SAVE={shinies:0,dex:[],jobs:0,lastDay:0,champ:null,king:null,bests:{},times:{},week:null,cleanWeeks:0}; save();")

open(P,'w').write(s)
print('patched', len(s))
