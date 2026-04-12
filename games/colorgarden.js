// ═══ COLOR GARDEN — botanical tap-to-fill coloring ═══
// Pick a color, tap regions. 3 pages. Milestone each save.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;
window._gameFns=window._gameFns||{};
window._gameFns.colorgarden=function CG(a){
  var canvas,ctx,W=340,H=340;
  var currentColor='#7ab356';
  var currentPage=0;
  var regions=[],regionColors={};

  var COLORS=[
    '#2d5020','#4A7C35','#7ab356','#a0cc80',
    '#3d2a18','#6b4a2a','#8b6a3a','#b8a060',
    '#8a3030','#c47a7a','#e8a0a0','#f0c8c8',
    '#8a6a20','#c8a84b','#e8cc70','#f0e0a0',
    '#2a4a6a','#5b9bd5','#90c0e8',
    '#9b6ba3','#c4a0d0',
    '#e8dcc8','#ffffff'
  ];

  function fPage(){
    var rg=[],id=0;var cx=170,cy=170;
    rg.push({id:id++,type:'rect',x:120,y:270,w:100,h:60,rx:8});
    rg.push({id:id++,type:'rect',x:110,y:260,w:120,h:18,rx:4});
    rg.push({id:id++,type:'rect',x:165,y:130,w:10,h:135,rx:2});
    rg.push({id:id++,type:'ellipse',cx:140,cy:210,rx:28,ry:11,rot:-0.5});
    rg.push({id:id++,type:'ellipse',cx:200,cy:180,rx:26,ry:10,rot:0.4});
    for(var i=0;i<8;i++){
      var ang=(Math.PI*2/8)*i-Math.PI/2;
      rg.push({id:id++,type:'ellipse',cx:cx+Math.cos(ang)*48,cy:cy-60+Math.sin(ang)*48,rx:24,ry:13,rot:ang});
    }
    rg.push({id:id++,type:'circle',cx:cx,cy:cy-60,r:18});
    return rg;
  }
  function tPage(){
    var rg=[],id=0;
    rg.push({id:id++,type:'rect',x:150,y:190,w:40,h:135,rx:4});
    rg.push({id:id++,type:'ellipse',cx:130,cy:325,rx:28,ry:8,rot:-0.3});
    rg.push({id:id++,type:'ellipse',cx:210,cy:325,rx:28,ry:8,rot:0.3});
    var cl=[[170,115,52],[130,145,38],[210,135,40],[150,75,33],[190,85,36],[170,160,28]];
    for(var i=0;i<cl.length;i++)rg.push({id:id++,type:'circle',cx:cl[i][0],cy:cl[i][1],r:cl[i][2]});
    var fruits=[[145,95],[185,110],[175,140],[210,95],[130,120]];
    for(i=0;i<fruits.length;i++)rg.push({id:id++,type:'circle',cx:fruits[i][0],cy:fruits[i][1],r:7});
    return rg;
  }
  function sPage(){
    var rg=[],id=0;
    rg.push({id:id++,type:'rect',x:90,y:250,w:160,h:75,rx:10});
    rg.push({id:id++,type:'rect',x:80,y:240,w:180,h:18,rx:6});
    for(var layer=0;layer<3;layer++){
      var petals=layer===0?5:layer===1?7:9;
      var r=layer===0?18:layer===1?42:66;
      for(var i=0;i<petals;i++){
        var ang=(Math.PI*2/petals)*i-Math.PI/2+layer*0.3;
        rg.push({id:id++,type:'ellipse',cx:170+Math.cos(ang)*r,cy:190+Math.sin(ang)*r*0.6,rx:21-layer*3,ry:12-layer*2,rot:ang});
      }
    }
    rg.push({id:id++,type:'circle',cx:170,cy:190,r:11});
    return rg;
  }
  var PAGES=[fPage,tPage,sPage];
  var PAGE_NAMES=['Flower','Tree','Succulent'];

  ms(a,'🎨 Color Garden — <strong id="CGp">Flower</strong>');
  mm(a);
  var pan=document.createElement('div');pan.id='CGpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:6px;user-select:none;text-align:center;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb" onclick="_CGP(-1)">← PREV</button> <button class="gb" onclick="_CGC()">✕ CLEAR</button> <button class="gb" onclick="_CGS()">💾 SAVE</button> <button class="gb" onclick="_CGP(1)">NEXT →</button>';

  function build(){
    var h='<canvas id="CGcv" width="'+W+'" height="'+H+'" style="display:block;margin:6px auto;border-radius:6px;border:1px solid rgba(122,179,86,0.15);background:#faf5ee;max-width:100%;touch-action:manipulation;"></canvas>';
    h+='<div id="CGpal" style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;padding:6px 4px;"></div>';
    pan.innerHTML=h;
    canvas=document.getElementById('CGcv');ctx=canvas.getContext('2d');
    canvas.addEventListener('click',onTap);
    canvas.addEventListener('touchstart',function(e){e.preventDefault();var t=e.touches[0];onTap({clientX:t.clientX,clientY:t.clientY});},{passive:false});
    buildPal();
  }
  function buildPal(){
    var el=document.getElementById('CGpal');var h='';
    for(var i=0;i<COLORS.length;i++){
      var act=COLORS[i]===currentColor;
      h+='<div data-c="'+COLORS[i]+'" onclick="_CGK(\''+COLORS[i]+'\')" style="width:28px;height:28px;border-radius:50%;background:'+COLORS[i]+';cursor:pointer;border:2.5px solid '+(act?'#e8dcc8':'transparent')+';'+(act?'box-shadow:0 0 6px rgba(232,220,200,0.4);transform:scale(1.12);':'')+'"></div>';
    }
    el.innerHTML=h;
  }
  function loadPage(idx){
    currentPage=((idx%PAGES.length)+PAGES.length)%PAGES.length;
    regions=PAGES[currentPage]();regionColors={};
    var p=document.getElementById('CGp');if(p)p.textContent=PAGE_NAMES[currentPage];
    render();
  }
  function drawRegion(r,fill,strokeOnly){
    ctx.save();
    if(r.type==='rect'){
      var rx=r.rx||0;
      ctx.beginPath();
      ctx.moveTo(r.x+rx,r.y);
      ctx.lineTo(r.x+r.w-rx,r.y);
      ctx.quadraticCurveTo(r.x+r.w,r.y,r.x+r.w,r.y+rx);
      ctx.lineTo(r.x+r.w,r.y+r.h-rx);
      ctx.quadraticCurveTo(r.x+r.w,r.y+r.h,r.x+r.w-rx,r.y+r.h);
      ctx.lineTo(r.x+rx,r.y+r.h);
      ctx.quadraticCurveTo(r.x,r.y+r.h,r.x,r.y+r.h-rx);
      ctx.lineTo(r.x,r.y+rx);
      ctx.quadraticCurveTo(r.x,r.y,r.x+rx,r.y);
      ctx.closePath();
    } else if(r.type==='circle'){
      ctx.beginPath();ctx.arc(r.cx,r.cy,r.r,0,Math.PI*2);ctx.closePath();
    } else if(r.type==='ellipse'){
      ctx.beginPath();ctx.ellipse(r.cx,r.cy,r.rx,r.ry,r.rot||0,0,Math.PI*2);ctx.closePath();
    }
    if(!strokeOnly&&fill){ctx.fillStyle=fill;ctx.fill();}
    ctx.strokeStyle='rgba(80,60,30,0.7)';ctx.lineWidth=1.5;ctx.stroke();
    ctx.restore();
  }
  function render(){
    ctx.fillStyle='#faf5ee';ctx.fillRect(0,0,W,H);
    for(var i=0;i<regions.length;i++){
      var col=regionColors[regions[i].id]||null;
      drawRegion(regions[i],col,false);
    }
    for(i=0;i<regions.length;i++)drawRegion(regions[i],null,true);
  }
  function hitTest(x,y){
    for(var i=regions.length-1;i>=0;i--){
      drawRegion(regions[i],null,true);
      if(ctx.isPointInPath(x,y))return i;
    }
    return -1;
  }
  function onTap(e){
    var rect=canvas.getBoundingClientRect();
    var scale=canvas.width/rect.width;
    var x=(e.clientX-rect.left)*scale;var y=(e.clientY-rect.top)*scale;
    var idx=hitTest(x,y);
    if(idx>=0){
      regionColors[regions[idx].id]=currentColor;
      render();
      try{navigator.vibrate&&navigator.vibrate(8);}catch(e2){}
      try{if(window._play)_play('tap');}catch(e2){}
      if(Object.keys(regionColors).length===regions.length){
        _e('milestone');sm('🌸 Page complete!');
        _sr('colorgarden',{w:true,s:regions.length});
      }
    }
  }

  window._CGP=function(d){loadPage(currentPage+d);sm('');};
  window._CGC=function(){regionColors={};render();sm('Cleared.');};
  window._CGS=function(){
    try{
      var link=document.createElement('a');
      link.download='color-garden-'+(currentPage+1)+'-'+Date.now()+'.png';
      link.href=canvas.toDataURL('image/png');link.click();
      _e('milestone');sm('💾 Saved.');
    }catch(e){sm('Save failed.');}
  };
  window._CGK=function(c){currentColor=c;buildPal();};

  build();loadPage(0);
};
})();
