// ═══ COLOR GARDEN — real line-art coloring book ═══
// Tap a region to flood-fill with the selected color. 50 hand-drawn pages.
// Preset palette + native color picker for unlimited colors. Undo, clear, save.
(function(){
'use strict';
var G=window._G||{};
var _e=G.e||function(){},_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm||function(){},_sr=G.sr||function(){};

// Base path for coloring pages. Swap to 'https://cdn.lucidwinds.com/coloring/'
// once the subdomain is configured.
var BASE='assets/coloring/';
var MANIFEST_URL=BASE+'manifest.json';

// 23 botanical palette. First row earthy, greens, golds, sky, purples, creams.
var PAL=[
  '#2d1810','#4A2C18','#8B4513','#c76a30','#e8a050','#f4c88a',
  '#c8a84b','#e8cc70','#f0e0a0','#2d5020','#4A7C35','#7ab356',
  '#a0cc80','#d8e8a0','#2a4a6a','#5bafd4','#90c0e8','#9b59b6',
  '#c4a0d0','#8a3030','#c07070','#e8a0a0','#e8dcc8'
];

window._gameFns=window._gameFns||{};
window._gameFns.colorgarden=function CG(a){
  var pages=[],currentIdx=0,currentColor='#7ab356';
  var canvas,ctx,imgW=0,imgH=0;
  var history=[];
  var activeSw=null;

  if(ms)ms(a,'<span id="CGidx">Loading pages…</span>');
  if(mm)mm(a);

  var loadingDiv=document.createElement('div');
  loadingDiv.id='CGload';
  loadingDiv.style.cssText='text-align:center;padding:2rem;color:var(--muted);font-family:DM Sans,sans-serif;';
  loadingDiv.textContent='Loading coloring pages…';
  a.appendChild(loadingDiv);

  var cWrap=document.createElement('div');
  cWrap.style.cssText='max-width:480px;margin:0 auto;padding:4px;text-align:center;display:none;user-select:none;-webkit-user-select:none;';
  a.appendChild(cWrap);

  canvas=document.createElement('canvas');
  canvas.style.cssText='display:block;width:100%;aspect-ratio:1;max-width:480px;margin:0 auto;background:#faf5ee;border-radius:8px;border:1px solid rgba(122,179,86,0.15);cursor:crosshair;touch-action:manipulation;';
  cWrap.appendChild(canvas);
  ctx=canvas.getContext('2d',{willReadFrequently:true});

  // ─── Palette + color picker ─────────────────────────────────────────
  var palWrap=document.createElement('div');
  palWrap.style.cssText='display:flex;flex-wrap:wrap;gap:5px;justify-content:center;padding:8px 4px;max-width:480px;margin:0 auto;';
  a.appendChild(palWrap);

  function makeSwatch(c){
    var sw=document.createElement('div');
    sw.className='cg-sw';
    sw.style.cssText='width:clamp(26px,7vw,32px);height:clamp(26px,7vw,32px);border-radius:50%;background:'+c+';cursor:pointer;border:2.5px solid transparent;transition:transform .12s,border-color .12s;box-shadow:0 1px 3px rgba(0,0,0,0.3);';
    sw.onclick=function(){selectColor(c,sw);};
    return sw;
  }

  for(var i=0;i<PAL.length;i++){
    palWrap.appendChild(makeSwatch(PAL[i]));
  }

  // HTML5 native color picker — wrap in a label so the rainbow puck is tappable
  var pkLabel=document.createElement('label');
  pkLabel.style.cssText='position:relative;width:clamp(26px,7vw,32px);height:clamp(26px,7vw,32px);border-radius:50%;background:conic-gradient(#c07070,#e8a050,#c8a84b,#7ab356,#5bafd4,#9b59b6,#c07070);cursor:pointer;border:2.5px solid transparent;box-shadow:0 1px 3px rgba(0,0,0,0.3);display:block;';
  pkLabel.title='Pick any color';
  var pk=document.createElement('input');
  pk.type='color';
  pk.value='#7ab356';
  pk.style.cssText='position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;';
  pk.onchange=function(){currentColor=pk.value;pkLabel.style.background=pk.value;clearActive();pkLabel.style.borderColor='var(--gold,#c8a84b)';pkLabel.style.transform='scale(1.15)';activeSw=pkLabel;};
  pkLabel.appendChild(pk);
  palWrap.appendChild(pkLabel);

  function clearActive(){
    var els=palWrap.querySelectorAll('.cg-sw');
    for(var k=0;k<els.length;k++){els[k].style.borderColor='transparent';els[k].style.transform='scale(1)';}
    pkLabel.style.borderColor='transparent';
    pkLabel.style.transform='scale(1)';
    pkLabel.style.background='conic-gradient(#c07070,#e8a050,#c8a84b,#7ab356,#5bafd4,#9b59b6,#c07070)';
  }
  function selectColor(c,el){
    currentColor=c;
    clearActive();
    if(el){el.style.borderColor='var(--gold,#c8a84b)';el.style.transform='scale(1.15)';activeSw=el;}
  }
  // Default-select the first leaf-green swatch
  selectColor('#7ab356',palWrap.children[11]);

  // ─── Controls ─────────────────────────────────────────────
  if(mc){
    var ctrl=mc(a);
    ctrl.innerHTML=
      '<button class="gb" onclick="_CGprev()">◀ PREV</button>'+
      '<button class="gb" onclick="_CGundo()" id="CGundo" disabled style="opacity:.4">↶ UNDO</button>'+
      '<button class="gb" onclick="_CGclear()" style="border-color:rgba(217,107,75,0.35);color:#e8a090">✕ CLEAR</button>'+
      '<button class="gb" onclick="_CGsave()" style="border-color:rgba(200,168,75,0.4);color:var(--gold,#c8a84b)">💾 SAVE</button>'+
      '<button class="gb" onclick="_CGnext()">NEXT ▶</button>';
  }

  // ─── Load manifest ─────────────────────────────────────────────
  fetch(MANIFEST_URL,{cache:'default'})
    .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
    .then(function(j){
      pages=(j&&j.pages)||[];
      if(!pages.length)throw new Error('Empty manifest');
      loadingDiv.style.display='none';
      cWrap.style.display='block';
      loadPage(0);
    })
    .catch(function(err){
      loadingDiv.textContent='Failed to load pages: '+err.message;
      loadingDiv.style.color='#c75050';
    });

  function loadPage(idx){
    currentIdx=((idx%pages.length)+pages.length)%pages.length;
    var p=pages[currentIdx];
    var indic=document.getElementById('CGidx');
    if(indic)indic.textContent='Page '+(currentIdx+1)+' / '+pages.length;
    history=[];
    updateUndoBtn();
    var img=new Image();
    img.onload=function(){
      imgW=img.naturalWidth;
      imgH=img.naturalHeight;
      canvas.width=imgW;
      canvas.height=imgH;
      ctx.fillStyle='#faf5ee';
      ctx.fillRect(0,0,imgW,imgH);
      ctx.drawImage(img,0,0);
    };
    img.onerror=function(){sm('Failed to load '+p.file);};
    img.src=BASE+p.file;
  }

  // ─── Flood fill (scanline, in-place on canvas ImageData) ──────────
  function hexToRgb(h){
    var n=parseInt(h.slice(1),16);
    return [(n>>16)&255,(n>>8)&255,n&255];
  }
  function isLine(r,g,b){ return (r+g+b) < 180; } // tight threshold: only near-black is line
  function matchesStart(r,g,b,sr,sg,sb){
    return Math.abs(r-sr)<28 && Math.abs(g-sg)<28 && Math.abs(b-sb)<28;
  }

  function floodFill(sx,sy,fillHex){
    if(sx<0||sy<0||sx>=imgW||sy>=imgH)return 0;
    var imd=ctx.getImageData(0,0,imgW,imgH);
    var d=imd.data;
    var sIdx=(sy*imgW+sx)*4;
    var sR=d[sIdx],sG=d[sIdx+1],sB=d[sIdx+2];
    if(isLine(sR,sG,sB))return 0; // tapped a line — skip
    var fill=hexToRgb(fillHex);
    if(sR===fill[0]&&sG===fill[1]&&sB===fill[2])return 0; // already that color

    // Scanline fill: faster than naive pixel-queue BFS.
    var stack=[[sx,sy]];
    var painted=0;
    while(stack.length){
      var pt=stack.pop();
      var x=pt[0],y=pt[1];
      var ii=(y*imgW+x)*4;
      if(!matchesStart(d[ii],d[ii+1],d[ii+2],sR,sG,sB))continue;
      // Scan left to edge of matching run
      var lx=x;
      while(lx>=0){
        var li=(y*imgW+lx)*4;
        if(!matchesStart(d[li],d[li+1],d[li+2],sR,sG,sB))break;
        lx--;
      }
      lx++;
      // Scan right, fill the run, push new spans above/below
      var topSpan=false,botSpan=false;
      for(var rx=lx;rx<imgW;rx++){
        var ri=(y*imgW+rx)*4;
        if(!matchesStart(d[ri],d[ri+1],d[ri+2],sR,sG,sB))break;
        d[ri]=fill[0];d[ri+1]=fill[1];d[ri+2]=fill[2];d[ri+3]=255;
        painted++;
        if(y>0){
          var ti=((y-1)*imgW+rx)*4;
          var tmatch=matchesStart(d[ti],d[ti+1],d[ti+2],sR,sG,sB);
          if(tmatch&&!topSpan){stack.push([rx,y-1]);topSpan=true;}
          else if(!tmatch)topSpan=false;
        }
        if(y<imgH-1){
          var bi=((y+1)*imgW+rx)*4;
          var bmatch=matchesStart(d[bi],d[bi+1],d[bi+2],sR,sG,sB);
          if(bmatch&&!botSpan){stack.push([rx,y+1]);botSpan=true;}
          else if(!bmatch)botSpan=false;
        }
      }
      // Safety: runaway stack on huge images
      if(painted>imgW*imgH)break;
    }
    ctx.putImageData(imd,0,0);
    return painted;
  }

  // ─── Tap handling ─────────────────────────────────────────────
  function onTap(clientX,clientY){
    if(!imgW||!imgH)return;
    var rect=canvas.getBoundingClientRect();
    var x=Math.floor((clientX-rect.left)*(imgW/rect.width));
    var y=Math.floor((clientY-rect.top)*(imgH/rect.height));
    if(x<0||y<0||x>=imgW||y>=imgH)return;
    // Snapshot BEFORE fill so undo can restore.
    var snap=ctx.getImageData(0,0,imgW,imgH);
    var filled=floodFill(x,y,currentColor);
    if(filled>0){
      history.push(snap);
      if(history.length>15)history.shift();
      updateUndoBtn();
      try{if(navigator.vibrate)navigator.vibrate(8);}catch(e){}
      if(_play)try{_play('tap');}catch(e){}
    }
  }
  canvas.addEventListener('click',function(e){onTap(e.clientX,e.clientY);});
  canvas.addEventListener('touchstart',function(e){
    e.preventDefault();
    if(!e.touches||!e.touches.length)return;
    var t=e.touches[0];
    onTap(t.clientX,t.clientY);
  },{passive:false});

  function updateUndoBtn(){
    var b=document.getElementById('CGundo');
    if(!b)return;
    b.disabled=history.length===0;
    b.style.opacity=history.length===0?'0.4':'1';
  }

  // ─── Window-exposed control handlers ──────────────────────────
  window._CGprev=function(){if(pages.length)loadPage(currentIdx-1);};
  window._CGnext=function(){if(pages.length)loadPage(currentIdx+1);};
  window._CGundo=function(){
    if(!history.length)return;
    var snap=history.pop();
    ctx.putImageData(snap,0,0);
    updateUndoBtn();
  };
  window._CGclear=function(){if(pages.length)loadPage(currentIdx);};
  window._CGsave=function(){
    try{
      var link=document.createElement('a');
      link.download='color-garden-page'+(currentIdx+1)+'-'+Date.now()+'.png';
      link.href=canvas.toDataURL('image/png');
      link.click();
      if(_e)try{_e('milestone');}catch(e){}
      if(_playWin)try{_playWin();}catch(e){}
      sm('💾 Saved.');
      _sr('colorgarden',{w:true,s:currentIdx+1});
    }catch(e){sm('Save failed.');}
  };
};
})();
