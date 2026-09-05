p='/workspaces/Litter_Bug/index.html'; s=open(p).read()
def rep(old,new,cnt=1):
    global s
    n=s.count(old); assert n==cnt, ("count %d for %r"%(n,old[:80])); s=s.replace(old,new)

# ── CSS ──
rep('''/* ── dex ── */''','''/* ── the specimen card: a flip card like the plant cards. Front is the bug, back is the paperwork ── */
.spcard{position:relative;width:100%;max-width:430px;height:600px;perspective:1400px;margin:0 auto;cursor:pointer}
.spcard .spin{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .55s cubic-bezier(.2,.7,.3,1)}
.spcard.flipped .spin{transform:rotateY(180deg)}
.spface{position:absolute;inset:0;border-radius:20px;border:1.5px solid var(--line);background:linear-gradient(180deg,#161e28,#0e131a 60%,#0b0f14);
  -webkit-backface-visibility:hidden;backface-visibility:hidden;overflow:hidden;display:flex;flex-direction:column;align-items:center;padding:18px 16px 14px;box-shadow:0 18px 44px #000a}
.spface.back{transform:rotateY(180deg)}
.spface .cn{position:absolute;width:22px;height:22px;border:2px solid;opacity:.6}
.spface .cn.tl{left:10px;top:10px;border-right:0;border-bottom:0;border-top-left-radius:6px}
.spface .cn.tr{right:10px;top:10px;border-left:0;border-bottom:0;border-top-right-radius:6px}
.spface .cn.bl{left:10px;bottom:10px;border-right:0;border-top:0;border-bottom-left-radius:6px}
.spface .cn.br{right:10px;bottom:10px;border-left:0;border-top:0;border-bottom-right-radius:6px}
.spface .kick{font-size:12px;letter-spacing:3px;color:var(--dim)}
.spface .por{width:236px;height:236px;margin:4px 0 2px;display:flex;align-items:center;justify-content:center;
  background:radial-gradient(circle at 50% 58%,#26323f 0%,#1a232c 52%,transparent 74%)}
.spface .lore{font-size:14px;line-height:1.45;color:var(--ink);margin-top:8px;max-width:380px;text-align:center;
  display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.spledger{width:100%;margin-top:6px;font-size:13px;line-height:1.45}
.spledger .row{display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid #1f2833}
.spledger .k{color:var(--dim);letter-spacing:1.5px;font-size:11px;text-transform:uppercase;flex:none;width:104px;padding-top:2px}
.spledger .v{color:var(--ink);text-align:right;flex:1;min-width:0}
.sphead{display:flex;align-items:center;gap:12px;width:100%}
.sphead .nm{font-size:18px;font-weight:800;line-height:1.15}
.sphead .sp{font-size:13px;color:var(--dim);font-style:italic}
.sphash{font-family:ui-monospace,monospace;font-size:11px;color:#6a7684;word-break:break-all;text-align:center;margin-top:8px;line-height:1.5}
.spmark{margin-top:auto;padding-top:10px;text-align:center;font-size:11px;letter-spacing:3px;color:var(--shine)}
.spmark small{display:block;font-size:12px;letter-spacing:0;color:var(--dim);margin-top:4px}
.spflip{text-align:center;font-size:12px;letter-spacing:2px;color:#5a6470;margin-top:10px}
.spbtns{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;max-width:430px;margin:12px auto 0}
/* ── dex ── */''')

# ── HTML ──
rep('''  <!-- ══════════ SPECIMEN ══════════ -->
  <div class="screen" id="s-spec">
    <div class="pad center">
      <div class="mintwrap">
        <div id="sp-art"></div>
        <div class="gradepill" id="sp-grade">COMMON</div>
        <div class="marks" id="sp-marks"></div>
        <div class="specname" id="sp-name"></div>
        <div class="specsp" id="sp-species"></div>
        <div class="speclore" id="sp-lore"></div>
        <div class="dim" id="sp-meta" style="margin-top:12px;font-size:13px"></div>
      </div>
      <div class="stack" style="margin-top:20px">
        <button class="btn ghost" id="b-spec-back">Back</button>
      </div>
    </div>
  </div>''',
'''  <!-- ══════════ SPECIMEN ══════════
       A flip card, like the plant cards: the front is the bug and its grade, the back is
       the paperwork (parts, fighter sheet, palette, date, hash). SHARE and SAVE THE CARD
       render a 640x960 PNG on a canvas. 2026-09-05. -->
  <div class="screen" id="s-spec">
    <div class="pad" style="padding-top:14px">
      <div class="spcard" id="sp-card">
        <div class="spin">
          <div class="spface front" id="sp-front"></div>
          <div class="spface back" id="sp-back"></div>
        </div>
      </div>
      <div class="spflip">TAP THE CARD TO TURN IT OVER</div>
      <div class="spbtns">
        <button class="btn gold" id="b-spec-share">SHARE</button>
        <button class="btn" id="b-spec-save">SAVE THE CARD</button>
      </div>
      <div class="stack" style="margin-top:12px">
        <button class="btn ghost" id="b-spec-back">Back</button>
      </div>
    </div>
  </div>''')

# ── JS: openSpec builds the two faces; the card renderer; share and save ──
rep('''function openSpec(i){
  var b=(SAVE.dex||[])[i]; if(!b) return;
  var id=BUG_ENGINE.bugIdentity(b.cb);
  $('sp-art').innerHTML=bugSVG(b.cb,220,lvlOf(b));
  paintPill($('sp-grade'), b.grade);
  paintMarks($('sp-marks'),gradeOf(b.cb));
  $('sp-name').textContent=id.name;
  $('sp-species').textContent=id.species;
  $('sp-lore').textContent=id.lore;
  var d=new Date(b.at||Date.now());
  var f=null; try{ f=BATTLE_ENGINE.buildFighter(b.cb, lvlOf(b)); }catch(e){}
  $('sp-meta').innerHTML='Level '+lvlOf(b)+'  ·  '+(b.wins||0)+' win'+((b.wins||0)===1?'':'s')
    +(f?('<br>'+f.type+(f.type2?' and '+f.type2:'')+'  ·  '+f.cls+'  ·  '+f.maxhp+' HP  ·  ATK '+f.atk+'  ·  DEF '+f.def+'  ·  SPD '+f.spd):'')
    +'<br>Found '+d.toDateString()+'  ·  '+b.cb.slice(0,12);
  show('s-spec');
}''',
'''var SPEC=-1;
function _esc(t){ return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
function specData(b){
  var id=BUG_ENGINE.bugIdentity(b.cb), gr=gradeOf(b.cb), col=GRADE_COLOR[b.grade]||GRADE_COLOR.COMMON;
  var f=null; try{ f=BATTLE_ENGINE.buildFighter(b.cb, lvlOf(b)); }catch(e){}
  var pal=null; try{ pal=(BUG_ENGINE.PALETTES||[])[BUG_ENGINE.hashToBugTraits(b.cb).palette]||null; }catch(e){}
  return { id:id, gr:gr, col:col, f:f, pal:pal, d:new Date(b.at||Date.now()), lvl:lvlOf(b), wins:b.wins||0 };
}
function openSpec(i){
  var b=(SAVE.dex||[])[i]; if(!b) return; SPEC=i;
  var D=specData(b), id=D.id, col=D.col, f=D.f;
  var corners='<i class="cn tl" style="border-color:'+col+'"></i><i class="cn tr" style="border-color:'+col+'"></i><i class="cn bl" style="border-color:'+col+'"></i><i class="cn br" style="border-color:'+col+'"></i>';
  $('sp-front').innerHTML=corners
    +'<div class="kick">SPECIMEN '+(i+1)+' OF '+(SAVE.dex||[]).length+'</div>'
    +'<div class="por">'+bugSVG(b.cb,220,D.lvl)+'</div>'
    +'<div class="gradepill" id="sp-grade">'+b.grade+'</div>'
    +'<div class="specname" style="margin-top:8px">'+_esc(id.name)+'</div>'
    +'<div class="specsp">'+_esc(id.species)+'</div>'
    +'<div class="marks" id="sp-marks" style="margin-top:8px"></div>'
    +'<div class="lore">'+_esc(id.lore)+'</div>';
  paintPill($('sp-grade'), b.grade); paintMarks($('sp-marks'), D.gr);
  var rows='';
  function row(k,v){ rows+='<div class="row"><span class="k">'+k+'</span><span class="v">'+v+'</span></div>'; }
  row('GRADE', b.grade+' <span style="color:'+col+'">·</span> score '+D.gr.score);
  row('PARTS', D.gr.marks.length ? _esc(D.gr.marks.join(', ')) : 'a plain grub, nothing grown in');
  if(f){ row('TYPE', _esc(f.type+(f.type2?' and '+f.type2:''))+' · '+_esc(f.cls)); row('SHEET', f.maxhp+' HP · ATK '+f.atk+' · DEF '+f.def+' · SPD '+f.spd); }
  row('LEVEL', D.lvl+' · '+D.wins+' win'+(D.wins===1?'':'s')+' in the dumpster');
  if(D.pal) row('SCRAP', _esc(D.pal.name)+' <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:'+D.pal.primary+';vertical-align:-1px"></span>');
  row('FOUND', D.d.toDateString());
  $('sp-back').innerHTML=corners
    +'<div class="sphead">'+bugSVG(b.cb,64,D.lvl)+'<div><div class="nm">'+_esc(id.name)+'</div><div class="sp">'+_esc(id.species)+'</div></div></div>'
    +'<div class="spledger">'+rows+'</div>'
    +'<div class="sphash">'+b.cb+'</div>'
    +'<div class="spmark">ONE OF ONE<small>Nothing else came out of this codeblock and nothing else ever will.</small></div>';
  $('sp-card').classList.remove('flipped');
  show('s-spec');
}
/* ── the card you can hold: a 640x960 PNG, the way the plant cards are made ── */
function wrapText(ctx, text, maxW, maxLines){
  var words=String(text).split(/\\s+/), lines=[], cur='';
  for(var i=0;i<words.length;i++){ var t=cur?cur+' '+words[i]:words[i]; if(ctx.measureText(t).width>maxW && cur){ lines.push(cur); cur=words[i]; } else cur=t; }
  if(cur) lines.push(cur);
  if(lines.length>maxLines){ lines=lines.slice(0,maxLines); lines[maxLines-1]=lines[maxLines-1].replace(/[,.;:]?$/,'')+'\\u2026'; }
  return lines;
}
function renderBugCard(b, done){
  var W=640, H=960, D=specData(b), id=D.id, col=D.col;
  var cv=document.createElement('canvas'); cv.width=W; cv.height=H; var ctx=cv.getContext('2d');
  var bg=ctx.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#182029'); bg.addColorStop(0.55,'#0e131a'); bg.addColorStop(1,'#07090c');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle=col; ctx.globalAlpha=0.55; ctx.lineWidth=2; ctx.strokeRect(16,16,W-32,H-32);
  ctx.globalAlpha=0.22; ctx.lineWidth=1; ctx.strokeRect(26,26,W-52,H-52); ctx.globalAlpha=1;
  [[30,30,1,1],[W-30,30,-1,1],[30,H-30,1,-1],[W-30,H-30,-1,-1]].forEach(function(c){ ctx.beginPath(); ctx.moveTo(c[0]+c[2]*22,c[1]); ctx.lineTo(c[0],c[1]); ctx.lineTo(c[0],c[1]+c[3]*22); ctx.lineWidth=3; ctx.strokeStyle=col; ctx.stroke(); });
  ctx.textAlign='center';
  ctx.fillStyle='#8fa0b2'; ctx.font='700 15px "Trebuchet MS",sans-serif'; ctx.fillText('L I T T E R B U G S   \\u00b7   S P E C I M E N', W/2, 58);
  ctx.fillStyle='#e6ecf2'; ctx.font='800 32px "Trebuchet MS",sans-serif';
  var nameLines=wrapText(ctx, id.name, W-100, 2); nameLines.forEach(function(l,i){ ctx.fillText(l, W/2, 100+i*36); });
  var ny=100+nameLines.length*36;
  ctx.fillStyle='#8fa0b2'; ctx.font='italic 18px Georgia,serif'; ctx.fillText(id.species, W/2, ny+4);
  var svg=bugSVG(b.cb, 380, D.lvl), img=new Image(), url=null;
  try{ url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'})); }catch(e){}
  function finish(){
    var py=ny+20;
    var glow=ctx.createRadialGradient(W/2,py+190,20,W/2,py+190,230); glow.addColorStop(0,col+'33'); glow.addColorStop(1,col+'00'); ctx.fillStyle=glow; ctx.fillRect(0,py-20,W,420);
    var plate=ctx.createRadialGradient(W/2,py+210,10,W/2,py+210,190); plate.addColorStop(0,'#26323f'); plate.addColorStop(0.55,'#1a232c'); plate.addColorStop(1,'rgba(26,35,44,0)'); ctx.fillStyle=plate; ctx.fillRect(0,py,W,400);
    if(img.complete && img.naturalWidth) ctx.drawImage(img, (W-380)/2, py, 380, 380);
    if(url){ try{ URL.revokeObjectURL(url); }catch(e){} }
    var gy=py+400;
    ctx.font='800 16px "Trebuchet MS",sans-serif'; var gw=ctx.measureText(b.grade).width+44;
    ctx.fillStyle=col+'26'; ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.beginPath(); ctx.roundRect((W-gw)/2, gy-20, gw, 36, 18); ctx.fill(); ctx.stroke();
    ctx.fillStyle=col; ctx.fillText(b.grade.split('').join(' '), W/2, gy+5);
    var marks=D.gr.marks.length?D.gr.marks:['a plain grub'];
    ctx.font='700 13px "Trebuchet MS",sans-serif'; var cx=0, cy=gy+48, chips=[], lineW=0, line=[];
    marks.forEach(function(m){ var w=ctx.measureText(m.toUpperCase()).width+26; if(lineW+w+8>W-80&&line.length){ chips.push(line); line=[]; lineW=0; } line.push({t:m.toUpperCase(),w:w}); lineW+=w+8; }); if(line.length) chips.push(line);
    chips.slice(0,2).forEach(function(ln,li){ var tot=ln.reduce(function(a,c){return a+c.w+8;},0)-8, x=(W-tot)/2, y=cy+li*34; ln.forEach(function(c){ ctx.fillStyle='#0e141b'; ctx.strokeStyle=col+'66'; ctx.lineWidth=1; ctx.beginPath(); ctx.roundRect(x,y-14,c.w,28,14); ctx.fill(); ctx.stroke(); ctx.fillStyle=col; ctx.fillText(c.t, x+c.w/2, y+5); x+=c.w+8; }); });
    var ly=cy+Math.min(chips.length,2)*34+18;
    ctx.fillStyle='#e6ecf2'; ctx.font='19px Georgia,serif'; wrapText(ctx, id.lore, W-110, 4).forEach(function(l,i){ ctx.fillText(l, W/2, ly+i*28); });
    ctx.fillStyle='#8fa0b2'; ctx.font='700 13px "Trebuchet MS",sans-serif';
    ctx.fillText('LEVEL '+D.lvl+'   \\u00b7   '+D.wins+' WIN'+(D.wins===1?'':'S')+(D.pal?('   \\u00b7   '+D.pal.name.toUpperCase()):''), W/2, H-92);
    ctx.fillStyle='#5a6470'; ctx.font='12px ui-monospace,monospace'; ctx.fillText(b.cb.slice(0,32), W/2, H-66); ctx.fillText(b.cb.slice(32), W/2, H-50);
    ctx.fillStyle='#e8c46a'; ctx.font='700 13px "Trebuchet MS",sans-serif'; ctx.fillText('S K Y   W O L F   S T U D I O   \\u00b7   lucidwinds.com', W/2, H-26);
    done(cv);
  }
  img.onload=finish; img.onerror=finish;
  if(url) img.src=url; else finish();
}
function cardBlob(b, cb){ renderBugCard(b, function(cv){ try{ cv.toBlob(function(blob){ cb(blob, cv); },'image/png'); }catch(e){ cb(null, cv); } }); }
function shareSpec(){
  var b=(SAVE.dex||[])[SPEC]; if(!b) return;
  var name='litterbug-'+b.cb.slice(0,8)+'.png';
  cardBlob(b, function(blob, cv){
    if(!blob){ toast('Could not build the card'); return; }
    var file=null; try{ file=new File([blob], name, {type:'image/png'}); }catch(e){}
    if(file && navigator.canShare && navigator.canShare({files:[file]})){
      navigator.share({ files:[file], title:BUG_ENGINE.bugName(b.cb), text:BUG_ENGINE.bugName(b.cb)+', a one of one from Litterbugs' }).catch(function(){});
    } else { saveBlob(blob, name); }
  });
}
function saveBlob(blob, name){
  var url=URL.createObjectURL(blob), a=document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1500); toast('Card saved');
}
function saveSpec(){ var b=(SAVE.dex||[])[SPEC]; if(!b) return; cardBlob(b, function(blob){ if(blob) saveBlob(blob,'litterbug-'+b.cb.slice(0,8)+'.png'); else toast('Could not build the card'); }); }''')
rep('''$('b-spec-back').onclick=function(){ paintDex(); show('s-dex'); };''',
'''$('b-spec-back').onclick=function(){ paintDex(); show('s-dex'); };
$('sp-card').onclick=function(){ this.classList.toggle('flipped'); };
$('b-spec-share').onclick=shareSpec;
$('b-spec-save').onclick=saveSpec;''')
rep('''    plan:BUG_ENGINE.bugPlan, svg:bugSVG,''','''    plan:BUG_ENGINE.bugPlan, svg:bugSVG, openSpec:openSpec, renderCard:renderBugCard,''')
open(p,'w').write(s); print("specimen card pass written")
