p='/workspaces/Litter_Bug/index.html'; s=open(p).read()
def rep(old,new,count=1):
    global s
    n=s.count(old); assert n==count, ("match count %d for %r"%(n,old[:80]))
    s=s.replace(old,new)

# ── HTML ─────────────────────────────────────────────────────────────────
rep('''<div id="wrap"><div id="stage" data-scr="s-home">''',
'''<div id="wrap"><div id="wrap-bg"><svg id="wrap-svg" viewBox="0 0 500 280" preserveAspectRatio="xMidYMid slice"></svg></div><div id="stage" data-scr="s-home">''')
rep('''      <div class="dim" id="k-note" style="text-align:center"></div>
      <div class="champbar" id="k-champ"></div>''',
'''      <div class="dim" id="k-note" style="text-align:center"></div>
      <div id="k-lock" style="display:none"></div>
      <div class="champbar" id="k-champ"></div>''')
# the grub's antenna twitch
rep('''.stamp{position:absolute;right:12px;bottom:14px;z-index:60;font-size:12px;color:#3d4956}''',
'''.stamp{position:absolute;right:12px;bottom:14px;z-index:60;font-size:12px;color:#3d4956}
/* the grub is alive: its antennae twitch once every couple of seconds. On a still heap that is the
   one thing that moves, so a patient eye finds it even when its tone has walked into the junk. */
@keyframes lbtw{0%,78%,100%{transform:rotate(0)}84%{transform:rotate(-9deg)}91%{transform:rotate(6deg)}}''')

# ── SAVE: per block bests ─────────────────────────────────────────────────
rep('''var SAVE={ shinies:0, dex:[], jobs:0, lastDay:0, champ:null, king:null };''',
'''var SAVE={ shinies:0, dex:[], jobs:0, lastDay:0, champ:null, king:null, bests:{} };''')
rep('''  SAVE.lastDay=Math.round(_num(r.lastDay,0));
  var dex=[], i;''',
'''  SAVE.lastDay=Math.round(_num(r.lastDay,0));
  /* your best shift on each block, shown on the picker. A number to beat is the cheapest
     reason to come back to a block you have already worked. */
  var bests={}, bk=(r.bests&&typeof r.bests==='object'&&!(r.bests instanceof Array))?r.bests:{};
  ['sort','grub','wire','pry'].forEach(function(k){ var v=Math.round(_num(bk[k],0)); if(v>0) bests[k]=Math.min(SHIFT_CAP,v); });
  SAVE.bests=bests;
  var dex=[], i;''')
rep('''    reset:function(){ SAVE={shinies:0,dex:[],jobs:0,lastDay:0,champ:null,king:null}; save();''',
'''    reset:function(){ SAVE={shinies:0,dex:[],jobs:0,lastDay:0,champ:null,king:null,bests:{}}; save();''')

# ── the alley, drawn properly ─────────────────────────────────────────────
start=s.index('/* ---------- the alley backdrop, drawn ---------- */')
end=s.index('/* ---------- render a bug ---------- */')
alley=r'''/* ---------- the alley backdrop, drawn ---------- */
/* One alley, drawn three times with three id prefixes (the home card, the stage backdrop, the
   band outside the stage), because gradient ids must be unique in the document or a fill
   resolves into a hidden copy and paints nothing. Until 2026-09-05 this was nine flat window
   rectangles and a triangle; now it is brick, a dumpster with the lid up, a chain fence, a
   fire escape, a puddle under the lamp, the junk from the trials lying about, and a cat. */
function alleyMarkup(p){
  var s=[];
  s.push('<defs>'
   +'<linearGradient id="'+p+'-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070a0e"/><stop offset="1" stop-color="#1a2430"/></linearGradient>'
   +'<linearGradient id="'+p+'-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>'
   +'<radialGradient id="'+p+'-lamp" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe6a0" stop-opacity=".95"/><stop offset=".3" stop-color="#e8c46a" stop-opacity=".4"/><stop offset="1" stop-color="#e8c46a" stop-opacity="0"/></radialGradient>'
   +'<linearGradient id="'+p+'-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8c46a" stop-opacity=".26"/><stop offset="1" stop-color="#e8c46a" stop-opacity="0"/></linearGradient>'
   +'<linearGradient id="'+p+'-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f2a36"/><stop offset="1" stop-color="#0b1015"/></linearGradient>'
   +'<pattern id="'+p+'-brick" width="26" height="12" patternUnits="userSpaceOnUse"><rect width="26" height="12" fill="#1c242e"/><path d="M0 6h26M13 0v6M0 6v6M26 6v6" stroke="#141b23" stroke-width="1.3"/></pattern>'
   +'<pattern id="'+p+'-fence" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 6h12M6 0v12" stroke="#4a5868" stroke-width="1.1"/></pattern>'
   +'<linearGradient id="'+p+'-fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fa0b2" stop-opacity="0"/><stop offset="1" stop-color="#8fa0b2" stop-opacity=".14"/></linearGradient>'
   +'<linearGradient id="'+p+'-dump" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e5237"/><stop offset="1" stop-color="#16281b"/></linearGradient>'
   +'</defs>');
  s.push('<rect width="500" height="280" fill="url(#'+p+'-sky)"/>');
  /* rooftops, far */
  s.push('<path d="M0 62h40v-18h30v10h26v-22h54v14h20v-8h38v18h44v-12h30v8h60v-20h36v26h48v-10h74v80H0z" fill="#0d131a"/>');
  s.push('<rect x="118" y="40" width="4" height="6" fill="#e8c46a" opacity=".5"/><rect x="330" y="46" width="3" height="5" fill="#e8c46a" opacity=".35"/>');
  /* the wall */
  s.push('<rect x="0" y="72" width="500" height="138" fill="url(#'+p+'-brick)"/>');
  s.push('<rect x="0" y="72" width="500" height="138" fill="url(#'+p+'-wall)"/>');
  /* windows, two lit */
  var i;
  for(i=0;i<5;i++){
    var wx=88+i*66, wy=86+(i%2)*12, lit=(i===1||i===4);
    s.push('<rect x="'+wx+'" y="'+wy+'" width="30" height="40" rx="2" fill="'+(lit?'#3a3320':'#11171f')+'"/>');
    if(lit) s.push('<rect x="'+(wx+3)+'" y="'+(wy+3)+'" width="24" height="34" fill="#e8c46a" opacity=".28"/>');
    s.push('<path d="M'+(wx+15)+' '+wy+'v40M'+wx+' '+(wy+20)+'h30" stroke="#0b0d10" stroke-width="2" opacity=".8"/>');
    s.push('<rect x="'+(wx-3)+'" y="'+(wy+40)+'" width="36" height="4" fill="#2c3743"/>');
  }
  /* fire escape, left */
  s.push('<path d="M14 72v130M40 72v130M14 100h26M14 128h26M14 156h26M14 184h26" stroke="#2c3744" stroke-width="3" fill="none"/>');
  s.push('<path d="M12 116h30l6 14H6z" fill="#243040"/><path d="M12 172h30l6 14H6z" fill="#243040"/>');
  /* downpipe, right edge */
  s.push('<rect x="482" y="60" width="7" height="150" fill="#26303c"/><rect x="480" y="120" width="11" height="6" fill="#2f3a48"/>');
  /* chain fence panel */
  s.push('<rect x="296" y="122" width="100" height="86" fill="url(#'+p+'-fence)" opacity=".9"/>');
  s.push('<rect x="296" y="122" width="100" height="86" fill="none" stroke="#4a5868" stroke-width="2"/><rect x="294" y="120" width="4" height="90" fill="#3a4757"/><rect x="394" y="120" width="4" height="90" fill="#3a4757"/>');
  /* the lamp */
  s.push('<rect x="404" y="60" width="6" height="152" fill="#2a3440"/>');
  s.push('<path d="M407 84h28v10" stroke="#2f3a48" stroke-width="5" fill="none" stroke-linecap="round"/>');
  s.push('<rect x="424" y="92" width="22" height="10" rx="3" fill="#3a4454"/>');
  s.push('<ellipse cx="435" cy="104" rx="10" ry="4" fill="#ffe6a0"/>');
  s.push('<circle cx="435" cy="104" r="48" fill="url(#'+p+'-lamp)"/>');
  s.push('<path d="M424 106L366 212H500V180Z" fill="url(#'+p+'-cone)"/>');
  /* ground */
  s.push('<rect x="0" y="208" width="500" height="72" fill="url(#'+p+'-ground)"/>');
  s.push('<path d="M0 208Q250 202 500 208" stroke="#2c3744" stroke-width="2.5" fill="none"/>');
  s.push('<ellipse cx="432" cy="244" rx="54" ry="9" fill="#1c2836"/><ellipse cx="434" cy="244" rx="20" ry="3" fill="#e8c46a" opacity=".22"/>');
  /* the dumpster, lid up */
  s.push('<rect x="40" y="134" width="112" height="74" rx="4" fill="url(#'+p+'-dump)"/>');
  s.push('<rect x="40" y="134" width="112" height="74" rx="4" fill="none" stroke="#0b0d10" stroke-width="1.5"/>');
  s.push('<path d="M64 140v64M100 140v64M136 140v64" stroke="#0b0d10" stroke-width="1.5" opacity=".35"/>');
  s.push('<rect x="34" y="126" width="124" height="12" rx="3" fill="#3a6444" transform="rotate(-9 34 138)"/>');
  s.push('<rect x="50" y="152" width="34" height="16" rx="2" fill="#e8c46a" opacity=".14"/>');
  s.push('<path d="M124 140v58" stroke="#4a3220" stroke-width="3" opacity=".55"/>');
  s.push('<circle cx="56" cy="210" r="6" fill="#0b0d10"/><circle cx="136" cy="210" r="6" fill="#0b0d10"/>');
  /* bags, a box, the junk from the trials */
  s.push('<ellipse cx="174" cy="200" rx="18" ry="12" fill="#151c25"/><ellipse cx="194" cy="204" rx="14" ry="9" fill="#182029"/><path d="M170 190l4-8 4 8" stroke="#1f2833" stroke-width="3" fill="none"/>');
  s.push('<rect x="216" y="182" width="34" height="26" fill="#3b2f22"/><path d="M216 182l17-8 17 8z" fill="#4a3c2c"/><path d="M233 182v26" stroke="#0b0d10" stroke-width="1.5" opacity=".4"/>');
  var junk=[['can',256,214,'#5d6b7a'],['bottle',286,206,'#3f6f8f'],['cap',318,220,'#6b7686'],['flyer',336,208,'#8a7a4a'],['tin',372,218,'#5d6b7a'],['stub',452,222,'#7a6a48'],['carton',162,222,'#8a7a4a']];
  for(i=0;i<junk.length;i++) s.push('<g transform="translate('+junk[i][1]+' '+junk[i][2]+') scale(.42) rotate('+((i*37)%50-25)+' 32 32)" opacity=".9">'+junkBody(junk[i][0],junk[i][3])+'</g>');
  /* the cat on the lid */
  s.push('<g transform="translate(98 116) rotate(-9)"><ellipse cx="0" cy="8" rx="14" ry="7" fill="#07090c"/><circle cx="12" cy="0" r="6" fill="#07090c"/><path d="M8-4l-1-7 4 4M16-4l1-7-4 4" fill="#07090c"/><path d="M-13 8q-10-3-8-14" stroke="#07090c" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="10" cy="-1" r="1.3" fill="#e8c46a"/><circle cx="14.5" cy="-1" r="1.3" fill="#e8c46a"/></g>');
  /* fog low */
  s.push('<rect x="0" y="176" width="500" height="70" fill="url(#'+p+'-fog)"/>');
  return s.join('');
}
function drawAlley(){
  $('alley-svg').innerHTML=alleyMarkup('a');
  var bg=$('bg-svg'); if(bg) bg.innerHTML=alleyMarkup('b');
  var wb=$('wrap-svg'); if(wb) wb.innerHTML=alleyMarkup('w');
}

'''
s=s[:start]+alley+s[end:]

# ── junk art: body + wrapper, grub with a twitch ─────────────────────────
rep('''function junkSVG(thing,accent,size){
  var A=accent||'#8fa0b2', D='#232c38', L='#0b0d10';''',
'''function junkBody(thing,accent){
  var A=accent||'#8fa0b2', D='#232c38', L='#0b0d10';''')
rep('''  var body=b[thing]||b.nub;
  return '<svg viewBox="0 0 64 64" width="'+size+'" height="'+size+'" style="display:block">'+body+'</svg>';
}''',
'''  return b[thing]||b.nub;
}
function junkSVG(thing,accent,size,shadow){
  return '<svg viewBox="0 0 64 64" width="'+size+'" height="'+size+'" style="display:block">'
    +(shadow?'<ellipse cx="33" cy="59" rx="19" ry="4" fill="#000" opacity=".5"/>':'')
    +junkBody(thing,accent)+'</svg>';
}''')
rep('''function grubSVG(fill,size){
  return '<svg viewBox="0 0 64 64" width="'+size+'" height="'+size+'" style="display:block">'
   +'<g stroke="'+fill+'" stroke-width="3" stroke-linecap="round">'
   +'<path d="M18 44l-6 8"/><path d="M26 48l-3 9"/><path d="M36 48l2 9"/><path d="M44 44l6 8"/></g>'
   +'<ellipse cx="22" cy="38" rx="10" ry="9" fill="'+fill+'"/>'
   +'<ellipse cx="34" cy="36" rx="11" ry="10" fill="'+fill+'"/>'
   +'<circle cx="46" cy="30" r="9" fill="'+fill+'"/>'
   +'<g stroke="'+fill+'" stroke-width="2.5" stroke-linecap="round"><path d="M50 22l5-7"/><path d="M53 26l8-3"/></g>'
   +'<circle cx="49" cy="28" r="2" fill="#0b0d10"/>'
   +'</svg>';
}''',
'''function grubBody(fill,twitch){
  return '<g stroke="'+fill+'" stroke-width="3" stroke-linecap="round">'
   +'<path d="M18 44l-6 8"/><path d="M26 48l-3 9"/><path d="M36 48l2 9"/><path d="M44 44l6 8"/></g>'
   +'<ellipse cx="22" cy="38" rx="10" ry="9" fill="'+fill+'"/>'
   +'<ellipse cx="34" cy="36" rx="11" ry="10" fill="'+fill+'"/>'
   +'<circle cx="46" cy="30" r="9" fill="'+fill+'"/>'
   +'<g stroke="'+fill+'" stroke-width="2.5" stroke-linecap="round"'+(twitch?' style="transform-box:view-box;transform-origin:49px 27px;animation:lbtw 2.6s ease-in-out infinite;animation-delay:'+(-(Math.random()*2.6)).toFixed(2)+'s"':'')+'><path d="M50 22l5-7"/><path d="M53 26l8-3"/></g>'
   +'<circle cx="49" cy="28" r="2" fill="#0b0d10"/>';
}
function grubSVG(fill,size,shadow){
  return '<svg viewBox="0 0 64 64" width="'+size+'" height="'+size+'" style="display:block">'
   +(shadow?'<ellipse cx="33" cy="59" rx="19" ry="4" fill="#000" opacity=".5"/>':'')
   +grubBody(fill,true)+'</svg>';
}
/* ============ THE PLACES, 2026-09-05 ============
   Stephen, Sep 05: "needs built a lot more, not playable". Every job used to run in a bare
   dark box: one tile falling through a thousand pixels of nothing, grey glyphs on grey tiles,
   dots and lines on black, a bar in a void. Each job now has a place drawn under it at the
   real field size: a sorting chute in the alley, the inside of a dumpster with a heap, a wall
   with a live junction box, a shelf of jars with a tin lid to lever. All flat SVG in the alley
   palette, no ids reused across scenes (the dex gate checks the whole document for duplicates). */
function chuteScene(W,H,L,R){
  var p='sc';
  return '<svg class="scene" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none"><defs>'
   +'<pattern id="'+p+'-brick" width="26" height="12" patternUnits="userSpaceOnUse"><rect width="26" height="12" fill="#161d25"/><path d="M0 6h26M13 0v6M0 6v6M26 6v6" stroke="#10161d" stroke-width="1.2"/></pattern>'
   +'<linearGradient id="'+p+'-steel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a3440"/><stop offset=".5" stop-color="#4f5d6e"/><stop offset="1" stop-color="#232c37"/></linearGradient>'
   +'<pattern id="'+p+'-belt" width="40" height="30" patternUnits="userSpaceOnUse"><rect width="40" height="30" fill="#0c1116"/><rect width="40" height="3" fill="#1c2631"/><rect y="15" width="40" height="2" fill="#141c25"/></pattern>'
   +'<radialGradient id="'+p+'-lamp" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#e8c46a" stop-opacity=".32"/><stop offset="1" stop-color="#e8c46a" stop-opacity="0"/></radialGradient>'
   +'<linearGradient id="'+p+'-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>'
   +'</defs>'
   +'<rect width="'+W+'" height="'+H+'" fill="url(#'+p+'-brick)"/>'
   +'<circle cx="'+(W-30)+'" cy="20" r="180" fill="url(#'+p+'-lamp)"/>'
   +'<rect x="'+(L-58)+'" y="0" width="10" height="'+H+'" fill="#1f2833"/><rect x="'+(R+48)+'" y="0" width="10" height="'+H+'" fill="#1f2833"/>'
   +'<rect x="'+L+'" y="0" width="'+(R-L)+'" height="'+H+'" fill="url(#'+p+'-belt)"/>'
   +'<rect x="'+(L-16)+'" y="0" width="16" height="'+H+'" fill="url(#'+p+'-steel)"/><rect x="'+R+'" y="0" width="16" height="'+H+'" fill="url(#'+p+'-steel)"/>'
   +'<rect x="'+(L-13)+'" y="0" width="3" height="'+H+'" fill="#fff" opacity=".12"/><rect x="'+(R+3)+'" y="0" width="3" height="'+H+'" fill="#fff" opacity=".12"/>'
   +'<path d="M'+(L-62)+' 0L'+(R+62)+' 0L'+(R+16)+' 76L'+(L-16)+' 76Z" fill="#2c3744"/><path d="M'+(L-62)+' 0L'+(R+62)+' 0L'+(R+16)+' 76L'+(L-16)+' 76Z" fill="url(#'+p+'-steel)" opacity=".55"/>'
   +'<rect x="'+(L-16)+'" y="72" width="'+(R-L+32)+'" height="9" fill="#0b0d10" opacity=".75"/>'
   +'<text x="'+(W/2)+'" y="48" text-anchor="middle" font-size="19" font-weight="800" letter-spacing="5" fill="#e8c46a" opacity=".8">RECYCLING</text>'
   +'<rect x="0" y="'+(H-76)+'" width="'+W+'" height="76" fill="url(#'+p+'-fade)"/>'
   +'<rect x="'+(L-16)+'" y="'+(H-10)+'" width="'+(R-L+32)+'" height="10" fill="#0b0d10"/>'
   +'</svg>';
}
function heapScene(W,H){
  var p='gh', i, s='<svg class="scene" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none"><defs>'
   +'<linearGradient id="'+p+'-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2c21"/><stop offset="1" stop-color="#0e1912"/></linearGradient>'
   +'<linearGradient id="'+p+'-light" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8c46a" stop-opacity=".24"/><stop offset="1" stop-color="#e8c46a" stop-opacity="0"/></linearGradient>'
   +'<linearGradient id="'+p+'-heap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c3846"/><stop offset="1" stop-color="#141b24"/></linearGradient>'
   +'<linearGradient id="'+p+'-heap2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f2935"/><stop offset="1" stop-color="#0f151c"/></linearGradient>'
   +'</defs>'
   +'<rect width="'+W+'" height="'+H+'" fill="url(#'+p+'-wall)"/>';
  for(i=1;i<5;i++) s+='<path d="M'+Math.round(W*i/5)+' 0v'+H+'" stroke="#233828" stroke-width="3"/>';
  s+='<path d="M'+Math.round(W*.3)+' 26v90" stroke="#4a3220" stroke-width="5" opacity=".45" stroke-linecap="round"/><path d="M'+Math.round(W*.72)+' 26v140" stroke="#4a3220" stroke-width="4" opacity=".4" stroke-linecap="round"/>'
   +'<rect x="0" y="0" width="'+W+'" height="26" fill="#2c4a35"/><rect x="0" y="22" width="'+W+'" height="6" fill="#0b0d10" opacity=".6"/>'
   +'<rect x="0" y="28" width="'+W+'" height="170" fill="url(#'+p+'-light)"/>'
   +'<path d="M0 '+(H*.42)+'C'+(W*.2)+' '+(H*.30)+' '+(W*.45)+' '+(H*.40)+' '+(W*.6)+' '+(H*.33)+'S'+(W*.9)+' '+(H*.36)+' '+W+' '+(H*.30)+'V'+H+'H0Z" fill="url(#'+p+'-heap2)"/>'
   +'<circle cx="'+(W*.78)+'" cy="'+(H*.40)+'" r="42" fill="none" stroke="#0d1218" stroke-width="16"/><circle cx="'+(W*.78)+'" cy="'+(H*.40)+'" r="42" fill="none" stroke="#1a2230" stroke-width="5"/>'
   +'<g transform="rotate(-6 '+(W*.12)+' '+(H*.36)+')"><rect x="'+(W*.12)+'" y="'+(H*.36)+'" width="90" height="60" fill="#2a2119"/><path d="M'+(W*.12)+' '+(H*.36)+'l45-10 45 10z" fill="#3a2e22"/></g>'
   +'<path d="M0 '+(H*.62)+'C'+(W*.15)+' '+(H*.52)+' '+(W*.35)+' '+(H*.60)+' '+(W*.5)+' '+(H*.55)+'S'+(W*.85)+' '+(H*.60)+' '+W+' '+(H*.52)+'V'+H+'H0Z" fill="url(#'+p+'-heap)"/>'
   +'<ellipse cx="'+(W*.3)+'" cy="'+(H*.9)+'" rx="70" ry="34" fill="#0f151c" opacity=".7"/><ellipse cx="'+(W*.75)+'" cy="'+(H*.94)+'" rx="80" ry="30" fill="#0f151c" opacity=".7"/>'
   +'</svg>';
  return s;
}
function wallScene(W,H){
  var p='ws', cx=W/2;
  return '<svg class="scene" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none"><defs>'
   +'<pattern id="'+p+'-brick" width="26" height="12" patternUnits="userSpaceOnUse"><rect width="26" height="12" fill="#141b23"/><path d="M0 6h26M13 0v6M0 6v6M26 6v6" stroke="#0e141a" stroke-width="1.2"/></pattern>'
   +'<linearGradient id="'+p+'-steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f5d6e"/><stop offset="1" stop-color="#232c37"/></linearGradient>'
   +'<pattern id="'+p+'-hazard" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="16" fill="#e8c46a"/><rect x="8" width="8" height="16" fill="#0b0d10"/></pattern>'
   +'<radialGradient id="'+p+'-vig" cx="50%" cy="45%" r="72%"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>'
   +'</defs>'
   +'<rect width="'+W+'" height="'+H+'" fill="url(#'+p+'-brick)"/>'
   +'<rect x="0" y="64" width="'+W+'" height="10" fill="#26303c"/><rect x="0" y="64" width="'+W+'" height="3" fill="#fff" opacity=".08"/>'
   +'<rect x="22" y="64" width="10" height="'+H+'" fill="#26303c"/><rect x="'+(W-32)+'" y="64" width="10" height="'+H+'" fill="#26303c"/>'
   +'<rect x="'+(cx-58)+'" y="8" width="116" height="66" rx="6" fill="url(#'+p+'-steel)"/><rect x="'+(cx-58)+'" y="8" width="116" height="66" rx="6" fill="none" stroke="#0b0d10" stroke-width="2"/>'
   +'<rect x="'+(cx-46)+'" y="18" width="92" height="12" fill="url(#'+p+'-hazard)"/>'
   +'<circle cx="'+(cx-40)+'" cy="58" r="4" fill="#0b0d10"/><circle cx="'+(cx+40)+'" cy="58" r="4" fill="#0b0d10"/>'
   +'<text x="'+cx+'" y="61" text-anchor="middle" font-size="12" font-weight="800" letter-spacing="3" fill="#e8c46a" opacity=".85">LIVE</text>'
   +'<path d="M60 '+(H*.3)+'a8 8 0 0 1 16 0M'+(W-76)+' '+(H*.45)+'a8 8 0 0 1 16 0M80 '+(H*.8)+'a8 8 0 0 1 16 0M'+(W-90)+' '+(H*.85)+'a8 8 0 0 1 16 0" stroke="#3a4757" stroke-width="3" fill="none"/>'
   +'<rect width="'+W+'" height="'+H+'" fill="url(#'+p+'-vig)"/>'
   +'</svg>';
}
function shelfScene(W,H){
  var p='sh';
  return '<svg class="scene" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none"><defs>'
   +'<pattern id="'+p+'-brick" width="26" height="12" patternUnits="userSpaceOnUse"><rect width="26" height="12" fill="#171e27"/><path d="M0 6h26M13 0v6M0 6v6M26 6v6" stroke="#10161d" stroke-width="1.2"/></pattern>'
   +'<linearGradient id="'+p+'-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a4230"/><stop offset=".2" stop-color="#3e2c1e"/><stop offset="1" stop-color="#241a12"/></linearGradient>'
   +'<radialGradient id="'+p+'-lamp" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#e8c46a" stop-opacity=".3"/><stop offset="1" stop-color="#e8c46a" stop-opacity="0"/></radialGradient>'
   +'</defs>'
   +'<rect width="'+W+'" height="'+H+'" fill="url(#'+p+'-brick)"/>'
   +'<circle cx="'+(W*.5)+'" cy="60" r="220" fill="url(#'+p+'-lamp)"/>'
   +'<rect x="0" y="'+(H-36)+'" width="'+W+'" height="36" fill="url(#'+p+'-wood)"/><rect x="0" y="'+(H-36)+'" width="'+W+'" height="5" fill="#7a5a3e"/>'
   +'<path d="M40 '+(H-31)+'l-24 30M'+(W-40)+' '+(H-31)+'l24 30" stroke="#2a1e14" stroke-width="6"/>'
   +'</svg>';
}
function binIcon(col){
  return '<svg viewBox="0 0 64 64"><path d="M14 22h36l-4 34a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4z" fill="#1a222c" stroke="'+col+'" stroke-width="2.5"/>'
   +'<rect x="10" y="14" width="44" height="10" rx="3" fill="'+col+'"/><rect x="26" y="9" width="12" height="6" rx="2" fill="'+col+'"/>'
   +'<path d="M24 30v22M32 30v22M40 30v22" stroke="'+col+'" stroke-width="2" opacity=".45"/></svg>';
}
function blockIcon(kind){
  var s='<svg viewBox="0 0 64 64">';
  if(kind==='sort') s+='<rect x="5" y="28" width="16" height="26" rx="2" fill="#1a222c" stroke="#5aa9e6" stroke-width="2"/><rect x="24" y="28" width="16" height="26" rx="2" fill="#1a222c" stroke="#b9c4d0" stroke-width="2"/><rect x="43" y="28" width="16" height="26" rx="2" fill="#1a222c" stroke="#e8c46a" stroke-width="2"/><rect x="3" y="22" width="20" height="6" rx="2" fill="#5aa9e6"/><rect x="22" y="22" width="20" height="6" rx="2" fill="#b9c4d0"/><rect x="41" y="22" width="20" height="6" rx="2" fill="#e8c46a"/><g transform="translate(20 -2) scale(.4)">'+junkBody('bottle','#5aa9e6')+'</g>';
  else if(kind==='grub') s+='<path d="M2 40C14 26 28 38 36 28S56 32 62 26V64H2z" fill="#2a3644"/><g transform="translate(4 30) scale(.34)">'+junkBody('nut','#7b8a9c')+'</g><g transform="translate(40 34) scale(.34)">'+junkBody('cap','#7b8a9c')+'</g><g transform="translate(18 12) scale(.5)">'+grubBody('#6fd08c',false)+'</g>';
  else if(kind==='wire') s+='<path d="M10 50L54 14M10 14L54 50M32 8v48" stroke="#0b0d10" stroke-width="8" stroke-linecap="round"/><path d="M10 50L54 14" stroke="#e07b39" stroke-width="4.5" stroke-linecap="round"/><path d="M10 14L54 50" stroke="#5aa9e6" stroke-width="4.5" stroke-linecap="round"/><path d="M32 8v48" stroke="#e8c46a" stroke-width="4.5" stroke-linecap="round"/><g fill="#e8c46a" stroke="#0b0d10" stroke-width="2"><circle cx="10" cy="14" r="6"/><circle cx="54" cy="14" r="6"/><circle cx="10" cy="50" r="6"/><circle cx="54" cy="50" r="6"/><circle cx="32" cy="8" r="6"/><circle cx="32" cy="56" r="6"/></g>';
  else s+='<circle cx="28" cy="36" r="22" fill="#4f5d6e" stroke="#0b0d10" stroke-width="2"/><circle cx="28" cy="36" r="15" fill="#2a3440"/><path d="M40 20a20 20 0 0 1 9 12" stroke="#e8c46a" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M44 24l14-14" stroke="#c9d3de" stroke-width="7" stroke-linecap="round"/><path d="M44 24l14-14" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".5"/>';
  return s+'</svg>';
}
function jarSVG(){
  return '<svg viewBox="0 0 40 56"><rect x="6" y="16" width="28" height="38" rx="6" fill="#5aa9e6" opacity=".5"/><rect x="6" y="16" width="28" height="38" rx="6" fill="none" stroke="#8fc4ea" stroke-width="1.5" opacity=".6"/>'
   +'<rect x="4" y="12" width="32" height="6" rx="2" fill="#8fa0b2"/><rect x="11" y="22" width="5" height="26" rx="2.5" fill="#fff" opacity=".28"/>'
   +'<rect x="0" y="0" width="22" height="7" rx="2" fill="#4f5d6e" transform="rotate(-22 4 7)"/></svg>';
}
function lidSVG(){
  var p='pl';
  return '<svg viewBox="0 0 320 320"><defs>'
   +'<radialGradient id="'+p+'-tin" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#8f9cad"/><stop offset=".6" stop-color="#4c5868"/><stop offset="1" stop-color="#232b36"/></radialGradient>'
   +'<radialGradient id="'+p+'-inner" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#3b4553"/><stop offset="1" stop-color="#171d26"/></radialGradient>'
   +'</defs>'
   +'<ellipse cx="160" cy="172" rx="126" ry="120" fill="#000" opacity=".45"/>'
   +'<circle cx="160" cy="160" r="120" fill="url(#'+p+'-tin)"/><circle cx="160" cy="160" r="120" fill="none" stroke="#0b0d10" stroke-width="3"/>'
   +'<circle cx="160" cy="160" r="100" fill="none" stroke="#0b0d10" stroke-width="5" opacity=".7"/>'
   +'<circle cx="160" cy="160" r="84" fill="url(#'+p+'-inner)"/><circle cx="160" cy="160" r="84" fill="none" stroke="#fff" stroke-width="2" opacity=".08"/>'
   +'<text x="160" y="154" text-anchor="middle" font-size="16" font-weight="800" letter-spacing="4" fill="#e8c46a" opacity=".6">ALLEY</text><text x="160" y="178" text-anchor="middle" font-size="12" font-weight="800" letter-spacing="3" fill="#8fa0b2" opacity=".65">PRESERVES</text>'
   +'<path id="pry-seam-glow" d="" fill="none" stroke="#e8c46a" stroke-width="30" stroke-linecap="round" opacity=".22"/>'
   +'<path id="pry-seam" d="" fill="none" stroke="#e8c46a" stroke-width="13" stroke-linecap="round" opacity=".95"/>'
   +'<g id="pry-bar"><rect x="256" y="153" width="62" height="14" rx="6" fill="#c9d3de"/><rect x="256" y="153" width="62" height="5" rx="3" fill="#fff" opacity=".55"/><path d="M258 160l-16-10v20z" fill="#e6ecf2"/></g>'
   +'</svg>';
}
function arcPath(cx,cy,r,a0,a1){
  var s=a0*Math.PI/180, e=a1*Math.PI/180;
  return 'M'+(cx+r*Math.cos(s)).toFixed(1)+' '+(cy+r*Math.sin(s)).toFixed(1)+'A'+r+' '+r+' 0 '+((a1-a0)>180?1:0)+' 1 '+(cx+r*Math.cos(e)).toFixed(1)+' '+(cy+r*Math.sin(e)).toFixed(1);
}
function dumpsterLockSVG(){
  var p='dl';
  return '<svg viewBox="0 0 260 180"><defs><linearGradient id="'+p+'-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f5238"/><stop offset="1" stop-color="#16281b"/></linearGradient>'
   +'<radialGradient id="'+p+'-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#e8c46a" stop-opacity=".35"/><stop offset="1" stop-color="#e8c46a" stop-opacity="0"/></radialGradient></defs>'
   +'<circle cx="220" cy="26" r="72" fill="url(#'+p+'-glow)"/>'
   +'<rect x="0" y="150" width="260" height="30" fill="#141b24"/>'
   +'<rect x="30" y="70" width="200" height="82" rx="6" fill="url(#'+p+'-body)"/><rect x="30" y="70" width="200" height="82" rx="6" fill="none" stroke="#0b0d10" stroke-width="2"/>'
   +'<rect x="24" y="56" width="212" height="18" rx="4" fill="#3a6444"/><rect x="24" y="70" width="212" height="4" fill="#0b0d10" opacity=".6"/>'
   +'<path d="M62 78v66M130 78v66M198 78v66" stroke="#0b0d10" stroke-width="2" opacity=".35"/>'
   +'<rect x="72" y="98" width="116" height="30" rx="3" fill="#e8c46a" opacity=".12"/><text x="130" y="118" text-anchor="middle" font-size="15" font-weight="800" letter-spacing="3" fill="#e8c46a" opacity=".85">BUGS ONLY</text>'
   +'<circle cx="52" cy="156" r="8" fill="#0b0d10"/><circle cx="208" cy="156" r="8" fill="#0b0d10"/>'
   +'<path d="M96 60q34 22 68 0" stroke="#8fa0b2" stroke-width="5" fill="none" stroke-dasharray="7 5"/>'
   +'<rect x="118" y="66" width="24" height="20" rx="4" fill="#e8c46a"/><path d="M123 66v-6a7 7 0 0 1 14 0v6" stroke="#e8c46a" stroke-width="4" fill="none"/><circle cx="130" cy="76" r="3" fill="#1a1405"/>'
   +'<ellipse cx="18" cy="150" rx="16" ry="10" fill="#0f151c"/><ellipse cx="244" cy="152" rx="12" ry="8" fill="#0f151c"/>'
   +'</svg>';
}
var JOB_LABEL={ sort:'SORT THE RECYCLING', grub:'GRUB HUNT', wire:'WIRE UNTANGLE', pry:'PRY THE LIDS' };
function paintBlocks(){
  var jb=document.querySelectorAll('[data-job]'), i;
  for(i=0;i<jb.length;i++){
    var k=jb[i].getAttribute('data-job'), best=(SAVE.bests||{})[k]||0;
    jb[i].classList.add('job');
    jb[i].innerHTML='<span class="bi">'+blockIcon(k)+'</span><span class="bn">'+(JOB_LABEL[k]||k)+'</span>'
      +'<span class="best">'+(best?'BEST<b>'+best+'</b>':'NOT YET<br>WORKED')+'</span>';
  }
}''')

# ── SORT: the chute ───────────────────────────────────────────────────────
rep('''function initSort(){
  var f=$('p-field');
  G.pieces=[];
  var bins=document.createElement('div'); bins.className='bins';
  MATS.forEach(function(m){
    var b=document.createElement('div'); b.className='bin';
    b.style.borderColor=m.col;
    b.innerHTML='<div style="color:'+m.col+'">'+m.label+'</div><div class="bl">bin</div>';''',
'''function initSort(){
  var f=$('p-field');
  G.pieces=[];
  /* the belt lane: pieces ride the chute, not the whole wall */
  G.lane=[Math.round(G.fw*0.17), Math.round(G.fw*0.83)];
  f.innerHTML=chuteScene(G.fw,G.fh,G.lane[0],G.lane[1]);
  var bins=document.createElement('div'); bins.className='bins';
  MATS.forEach(function(m){
    var b=document.createElement('div'); b.className='bin';
    b.style.borderColor=m.col;
    b.innerHTML=binIcon(m.col)+'<div style="color:'+m.col+'">'+m.label+'</div>';''')
rep('''  el.innerHTML=junkSVG(thing,m.col,44)+'<div class="flab" style="color:'+m.col+'">'+thing+'</div>';
  /* ⛔ clamp with Math.max: a zero width field used to make this negative */
  el.style.left=Math.round(12+Math.random()*Math.max(1,G.fw-90))+'px';''',
'''  el.innerHTML=junkSVG(thing,m.col,66,true)+'<div class="flab" style="color:'+m.col+'">'+thing+'</div>';
  /* ⛔ clamp with Math.max: a zero width field used to make this negative */
  var L=(G.lane&&G.lane[0])||12, R=(G.lane&&G.lane[1])||G.fw;
  el.style.left=Math.round(L+4+Math.random()*Math.max(1,(R-L)-100))+'px';''')

# ── GRUB: the heap ────────────────────────────────────────────────────────
rep('''function grubRound(){
  var f=$('p-field'); f.innerHTML='';
  G.round++;
  var W=G.fw, H=G.fh, CELL=54;''',
'''var HEAP_TONES=['#7b8a9c','#6b7a8c','#8a97a8','#6f7e92'];
function grubRound(){
  var f=$('p-field'); f.innerHTML=heapScene(G.fw,G.fh);
  G.round++;
  /* ⛔ 68, not 54: the cell is the touch target, and 54 CSS px at the 0.763 stage scale of a
     412 phone is 41 REAL px. 68 lands at 52. The grid still leaves a gap between neighbours. */
  var W=G.fw, H=G.fh, CELL=68;''')
rep('''    var tint=Math.min(0.95, 0.10+G.round*0.09);
    if(isGrub){ el.innerHTML=grubSVG(mixHex('#6fd08c','#8fa0b2',tint),38); }
    else { el.innerHTML=junkSVG(JUNK[Math.floor(Math.random()*JUNK.length)],'#8fa0b2',38); }
    el.style.left=Math.round(padX+cx*CELL+4+Math.random()*6)+'px';
    el.style.top=Math.round(padY+cy*CELL+4+Math.random()*6)+'px';
    el.style.transform='rotate('+(Math.random()*40-20)+'deg)';''',
'''    /* the junk is not one grey any more: four heap tones, so "the odd colour" stops being the
       tell and the grub has to be found by its legs. Its own tone walks into the heap's. */
    var tint=Math.min(0.95, 0.10+G.round*0.09);
    var tone=HEAP_TONES[Math.floor(Math.random()*HEAP_TONES.length)];
    if(isGrub){ el.innerHTML=grubSVG(mixHex('#6fd08c',tone,tint),56,true); }
    else { el.innerHTML=junkSVG(JUNK[Math.floor(Math.random()*JUNK.length)],tone,56,true); }
    el.style.left=Math.round(padX+cx*CELL+Math.random()*4)+'px';
    el.style.top=Math.round(padY+cy*CELL+Math.random()*4)+'px';
    el.style.transform='rotate('+(Math.random()*40-20)+'deg)';''')

# ── PRY: the lid ──────────────────────────────────────────────────────────
rep('''function initPry(){
  var f=$('p-field');
  f.innerHTML='<div class="prywrap">'
    +'<div class="pryhint" id="pry-hint">Tap when the marker is on the seam</div>'
    +'<div class="prybar" id="pry-bar"><div class="pryzone" id="pry-zone"></div>'
    +'<div class="prymark" id="pry-mark"></div></div>'
    +'<div class="pryjars" id="pry-jars"></div></div>';
  var btn=document.createElement('button'); btn.className='btn gold'; btn.textContent='PRY';
  btn.onclick=pryTap; $('p-controls').appendChild(btn);
  G.lids=0; G.zone=0.34; G.pos=0; G.dir=1;
  pryPlace();
  var last=performance.now();
  (function loop(now){
    if(!G||G.over) return;
    var dt=Math.min(60,now-last); last=now;
    G.pos+=G.dir*(0.55+G.lids*0.05)*dt/1000;
    if(G.pos>1){ G.pos=1; G.dir=-1; } if(G.pos<0){ G.pos=0; G.dir=1; }
    var m=$('pry-mark'); if(m) m.style.left=(G.pos*100)+'%';
    G.raf=requestAnimationFrame(loop);
  })(last);
}
function pryPlace(){
  G.zoneAt=0.08+Math.random()*(0.84-G.zone);
  var z=$('pry-zone');
  if(z){ z.style.left=(G.zoneAt*100)+'%'; z.style.width=(G.zone*100)+'%'; }
}''',
'''/* the bar was a strip in a void. It is a tin lid now, seen from above on a shelf: the seam is
   a gold arc on the rim, the marker is a pry bar riding round the rim, and every lid you lever
   off becomes an open jar on the shelf below. Same numbers underneath (pos, zone, zoneAt). */
function pryAngle(pos){ return -120+pos*300; }
function initPry(){
  var f=$('p-field');
  f.innerHTML=shelfScene(G.fw,G.fh)+'<div class="prywrap">'
    +'<div class="pryhint" id="pry-hint">Tap PRY when the bar is on the gold seam</div>'
    +'<div class="prylid" id="pry-lid">'+lidSVG()+'</div></div>'
    +'<div class="pryshelf" id="pry-jars"></div>';
  var btn=document.createElement('button'); btn.className='btn gold'; btn.textContent='PRY';
  btn.onclick=pryTap; $('p-controls').appendChild(btn);
  G.lids=0; G.zone=0.34; G.pos=0; G.dir=1;
  pryPlace();
  var last=performance.now();
  (function loop(now){
    if(!G||G.over) return;
    var dt=Math.min(60,now-last); last=now;
    G.pos+=G.dir*(0.55+G.lids*0.05)*dt/1000;
    if(G.pos>1){ G.pos=1; G.dir=-1; } if(G.pos<0){ G.pos=0; G.dir=1; }
    var m=$('pry-bar'); if(m) m.setAttribute('transform','rotate('+pryAngle(G.pos).toFixed(1)+' 160 160)');
    G.raf=requestAnimationFrame(loop);
  })(last);
}
function pryPlace(){
  G.zoneAt=0.08+Math.random()*(0.84-G.zone);
  var d=arcPath(160,160,100,pryAngle(G.zoneAt),pryAngle(G.zoneAt+G.zone));
  var z=$('pry-seam'), g=$('pry-seam-glow');
  if(z) z.setAttribute('d',d); if(g) g.setAttribute('d',d);
}''')
rep('''  var bar=$('pry-bar');
  if(hit){
    G.lids++; bump(3);
    G.zone=Math.max(0.09, G.zone*0.86);
    if(bar){ bar.classList.add('good'); setTimeout(function(){ bar.classList.remove('good'); },220); }
    var jars=$('pry-jars'); if(jars) jars.innerHTML+='<span class="jar">◍</span>';
    $('pry-hint').textContent='Lid '+G.lids+'. The seam is tighter now.';
  } else {
    bump(-1);
    G.zone=Math.min(0.34, G.zone*1.10);
    if(bar){ bar.classList.add('bad'); setTimeout(function(){ bar.classList.remove('bad'); },220); }
    $('pry-hint').textContent='The lid held. Try again.';
  }
  pryPlace();''',
'''  var lid=$('pry-lid');
  if(hit){
    G.lids++; bump(3);
    G.zone=Math.max(0.09, G.zone*0.86);
    if(lid){ lid.style.filter='drop-shadow(0 0 18px #6fd08c)'; setTimeout(function(){ lid.style.filter=''; },220); }
    var jars=$('pry-jars');
    if(jars){ var n=Math.min(G.lids,11), j='', q; for(q=0;q<n;q++) j+=jarSVG(); jars.innerHTML=j+(G.lids>11?'<div style="color:#e8c46a;font-size:13px;font-weight:800;padding:0 4px 20px">+'+(G.lids-11)+'</div>':''); }
    $('pry-hint').textContent='Lid '+G.lids+'. The seam is tighter now.';
  } else {
    bump(-1);
    G.zone=Math.min(0.34, G.zone*1.10);
    if(lid){ lid.style.filter='drop-shadow(0 0 18px #c4543e)'; setTimeout(function(){ lid.style.filter=''; },220); }
    $('pry-hint').textContent='The lid held. Try again.';
  }
  pryPlace();''')

# ── WIRE: the wall ────────────────────────────────────────────────────────
rep('''function wireRound(){
  var f=$('p-field'); f.innerHTML='';
  G.level++;''',
'''var WIRE_COL=['#e07b39','#e8c46a','#c4543e','#5aa9e6','#d8dee6','#6fd08c','#b57de0','#8fd05a'];
function wireRound(){
  var f=$('p-field'); f.innerHTML=wallScene(G.fw,G.fh)+'<div class="fieldchip" id="wire-chip"></div>';
  G.level++;''')
rep('''  /* a layout that is already solved would pay for nothing. Reseat until it is knotted. */
  if(wireCrossings()===0 && count>3){
    var s0=G.pins[0]; G.pins[0]=G.pins[Math.floor(count/2)]; G.pins[Math.floor(count/2)]=s0;
  }''',
'''  /* ⛔ a layout that is already solved pays for nothing, and worse, it looks finished: the
     player sees a clean board and nothing tells them to touch it. The old fix swapped pins 0
     and 2, which in a four pin cycle with one chord is the SAME picture, so round one spawned
     solved 32% of the time (300 spawns measured, 2026-09-05). Now the seats are reshuffled
     until the board is knotted. */
  var tries=0;
  while(wireCrossings()===0 && count>3 && tries<60){
    tries++;
    for(i=seats.length-1;i>0;i--){ var j2=Math.floor(Math.random()*(i+1)), t2=seats[i]; seats[i]=seats[j2]; seats[j2]=t2; }
    for(i=0;i<count;i++){ G.pins[i].x=Math.max(44,Math.min(W-44,seats[i].x)); G.pins[i].y=Math.max(44,Math.min(H-44,seats[i].y)); }
  }''')
rep('''      d.style.cssText='position:absolute;width:72px;height:72px;margin:-36px 0 0 -36px;border-radius:50%;'
        +'background:#1d2733;display:flex;align-items:center;justify-content:center;touch-action:none;cursor:grab';
      d.innerHTML='<div style="width:30px;height:30px;border-radius:50%;background:#e8c46a;border:2px solid #f4dd9a"></div>';
      d.addEventListener('pointerdown',function(ev){ G.drag=idx; d.setPointerCapture(ev.pointerId); });
      d.addEventListener('pointermove',function(ev){
        if(G.drag!==idx) return;
        var r=f.getBoundingClientRect(), sc=r.width/f.clientWidth;
        G.pins[idx].x=(ev.clientX-r.left)/sc; G.pins[idx].y=(ev.clientY-r.top)/sc;
        wirePaint();
      });''',
'''      d.style.cssText='position:absolute;width:72px;height:72px;margin:-36px 0 0 -36px;border-radius:50%;'
        +'background:transparent;display:flex;align-items:center;justify-content:center;touch-action:none;cursor:grab';
      /* a socket plate with a live terminal, not a dot */
      d.innerHTML='<div style="width:42px;height:42px;border-radius:9px;background:linear-gradient(180deg,#4f5d6e,#232c37);border:1.5px solid #0b0d10;box-shadow:0 4px 8px #000a;display:flex;align-items:center;justify-content:center">'
        +'<div style="width:20px;height:20px;border-radius:50%;background:#e8c46a;border:2px solid #f4dd9a;box-shadow:0 0 10px #e8c46a99"></div></div>';
      d.addEventListener('pointerdown',function(ev){ G.drag=idx; d.setPointerCapture(ev.pointerId); });
      d.addEventListener('pointermove',function(ev){
        if(G.drag!==idx) return;
        var r=f.getBoundingClientRect(), sc=r.width/f.clientWidth;
        /* ⛔ clamped to the field: a pin dragged under the rail or off the edge used to stay
           there, out of reach, with its wires still counted */
        G.pins[idx].x=Math.max(30,Math.min(f.clientWidth-30,(ev.clientX-r.left)/sc));
        G.pins[idx].y=Math.max(30,Math.min(f.clientHeight-30,(ev.clientY-r.top)/sc));
        wirePaint();
      });''')
rep('''function wirePaint(){
  var svg=$('wire-svg'); if(!svg) return;
  var s='',i;
  for(i=0;i<G.edges.length;i++){
    var a=G.pins[G.edges[i][0]], b=G.pins[G.edges[i][1]];
    s+='<line x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'" stroke="#4a5f76" stroke-width="4" stroke-linecap="round"/>';
  }
  svg.innerHTML=s;
  for(i=0;i<G.pinEls.length;i++){ G.pinEls[i].style.left=G.pins[i].x+'px'; G.pinEls[i].style.top=G.pins[i].y+'px'; }
}''',
'''function wirePaint(){
  var svg=$('wire-svg'); if(!svg) return;
  /* cables, each its own colour, and the ones that still cross carry a hot red halo so the
     puzzle tells you what is left instead of making you count */
  var cross={}, i, j, pairs=0;
  for(i=0;i<G.edges.length;i++) for(j=i+1;j<G.edges.length;j++){
    var e=G.edges[i], f=G.edges[j];
    if(e[0]===f[0]||e[0]===f[1]||e[1]===f[0]||e[1]===f[1]) continue;
    if(segsCross(G.pins[e[0]],G.pins[e[1]],G.pins[f[0]],G.pins[f[1]])){ cross[i]=1; cross[j]=1; pairs++; }
  }
  var s='';
  for(i=0;i<G.edges.length;i++){
    var a=G.pins[G.edges[i][0]], b=G.pins[G.edges[i][1]], c=WIRE_COL[i%WIRE_COL.length];
    var d='x1="'+a.x.toFixed(1)+'" y1="'+a.y.toFixed(1)+'" x2="'+b.x.toFixed(1)+'" y2="'+b.y.toFixed(1)+'"';
    if(cross[i]) s+='<line '+d+' stroke="#ff5a3c" stroke-width="18" stroke-linecap="round" opacity=".3"/>';
    s+='<line '+d+' stroke="#0b0d10" stroke-width="10" stroke-linecap="round"/>'
      +'<line '+d+' stroke="'+c+'" stroke-width="6" stroke-linecap="round"/>'
      +'<line '+d+' stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".28"/>';
  }
  svg.innerHTML=s;
  for(i=0;i<G.pinEls.length;i++){ G.pinEls[i].style.left=G.pins[i].x+'px'; G.pinEls[i].style.top=G.pins[i].y+'px'; }
  var chip=$('wire-chip'); if(chip) chip.textContent = pairs ? (pairs+' CROSSING'+(pairs===1?'':'S')) : 'CLEAN, LET GO';
}''')

# ── bests on the shift over screen ───────────────────────────────────────
rep('''  var paid=earnShinies(G.score);
  noteShift();
  SAVE.jobs=(SAVE.jobs||0)+1; save();
  $('d-shine').textContent='+'+paid;
  $('d-note').textContent = paid<G.score
    ? 'You worked for '+G.score+', but the alley only had '+paid+' left today.'
    : 'Straight into the jar.';''',
'''  var paid=earnShinies(G.score);
  noteShift();
  SAVE.jobs=(SAVE.jobs||0)+1;
  var bests=SAVE.bests||(SAVE.bests={}), prevBest=bests[G.kind]||0, newBest=G.score>prevBest&&G.score>0;
  if(newBest) bests[G.kind]=G.score;
  save();
  $('d-shine').textContent='+'+paid;
  $('d-note').textContent = (paid<G.score
    ? 'You worked for '+G.score+', but the alley only had '+paid+' left today.'
    : 'Straight into the jar.')
    +(newBest ? (prevBest ? ' A new best on this block, up from '+prevBest+'.' : ' Your first shift on this block.') : '');''')

# ── the dumpster before your first bug, and ghost cards ──────────────────
rep('''  if(!mine.length){ $('k-note').textContent='You need a bug of your own before anybody will let you in.'; return; }
  $('k-note').innerHTML=''',
'''  if(!mine.length){
    $('k-note').textContent='';
    $('k-champ').style.display='none'; $('k-strip').style.display='none';
    var lock=$('k-lock'); lock.style.display='';
    lock.innerHTML='<div class="lockpanel">'+dumpsterLockSVG()
      +'<div class="lk">You need a bug of your own before anybody will let you in.</div>'
      +'<div class="lk2">Thirty Shinies from the alley hatches one, and a clean shift is about thirty.</div></div>'
      +'<div class="stack" style="margin-top:14px"><button class="btn primary" id="b-lock-go">'+(canWork()?'WORK THE ALLEY':'THE ALLEY IS PICKED CLEAN')+'</button></div>';
    $('b-lock-go').onclick=function(){ if(!canWork()){ toast('Nothing left out there today'); return; } capNote(); show('s-block'); };
    return;
  }
  $('k-lock').style.display='none'; $('k-champ').style.display=''; $('k-strip').style.display='';
  $('k-note').innerHTML=''')
rep('''    c.onclick=function(){ SAVE.champ=i; save(); paintDump(); };
    $('k-strip').appendChild(c);
  });''',
'''    c.onclick=function(){ SAVE.champ=i; save(); paintDump(); };
    $('k-strip').appendChild(c);
  });
  /* the strip reserved 124px of nothing beside a lone bug; the empty seats are drawn now */
  for(var gi=mine.length; gi<3; gi++){
    var gc=document.createElement('div'); gc.className='cs ghost';
    gc.innerHTML='<div style="font-size:30px;line-height:1;color:#28323d">+</div><div class="l">NEXT BUG</div>';
    $('k-strip').appendChild(gc);
  }''')

# ── the picker paints its icons and bests whenever it opens ───────────────
rep('''function capNote(){
  $('cap-note').textContent=shiftsLeft()+' shift'+(shiftsLeft()===1?'':'s')+' and '
    +capLeft()+' Shinies still out there today.';
}''',
'''function capNote(){
  paintBlocks();
  $('cap-note').textContent=shiftsLeft()+' shift'+(shiftsLeft()===1?'':'s')+' and '
    +capLeft()+' Shinies still out there today.';
}''')
rep('''  loadSave();
  drawAlley(); paintHome();''',
'''  loadSave();
  drawAlley(); paintHome(); paintBlocks();''')
rep("var VW=540, VH=960, BUILD='v1.0';", "var VW=540, VH=960, BUILD='v1.1';")
open(p,'w').write(s); print("js patched")
