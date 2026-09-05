// ═══ COLOR GARDEN — real line-art coloring book ═══
// 50 pages, HSV color wheel with brightness slider, pinch
// to zoom, drag to pan. Flood-fill stays sharp at every zoom level
// because fills run on a full-resolution source canvas; the view is
// just a window into that source.
(function(){
'use strict';
var G=window._G||{};
var _e=G.e||function(){},_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm||function(){},_sr=G.sr||function(){};

var BASE='assets/coloring/';   // swap to 'https://cdn.lucidwinds.com/coloring/' once subdomain lives
var MANIFEST_URL=BASE+'manifest.json';

// Quick-access palette: 12 common botanical colors. Secondary to the wheel.
var QUICK_PAL=[
  '#2d1810','#8B4513','#c76a30','#e8a050',
  '#c8a84b','#e8cc70','#4A7C35','#7ab356',
  '#2a4a6a','#5bafd4','#9b59b6','#e8dcc8'
];

window._gameFns=window._gameFns||{};
window._gameFns.colorgarden=function CG(a){
  // ─── STATE ────────────────────────────────────────────────────
  var pages=[],currentIdx=0;
  var hue=120,sat=0.55,val=0.70;       // current HSV (0-360, 0-1, 0-1)
  var currentColor=hsvToHex(hue,sat,val);

  var viewCanvas,viewCtx;
  var srcCanvas,srcCtx;                  // full-res colored state (hidden)
  var imgW=0,imgH=0;                     // source dims
  var zoom=1,panX=0,panY=0;              // pan is source-space center when zoomed
  var history=[];                        // undo snapshots (raw Uint8ClampedArray pixel buffers)
  var HISTORY_CAP=8;                     // capped from 20 — full-res pages are ~5.8MB/snapshot
  var savesCount=0;                      // pages saved this session — the _sr stat, not the page number
  var dragging=false,dragStart=null,dragMoved=false;
  var pinchStart=null;                   // {d, zoom, panX, panY} at pinch begin

  var wheelCanvas,wheelCtx,wheelSize=170;
  var sliderCanvas,sliderCtx,sliderW=170,sliderH=26;
  var swatchEl,colorDisplay;
  var quickPalWrap;

  // ─── UI BUILD ─────────────────────────────────────────────────
  if(ms)ms(a,'<span id="CGidx">Loading pages…</span>');
  if(mm)mm(a);

  var loadingDiv=document.createElement('div');
  loadingDiv.style.cssText='text-align:center;padding:2rem;color:var(--muted);font-family:DM Sans,sans-serif;';
  loadingDiv.textContent='Loading coloring pages…';
  a.appendChild(loadingDiv);

  // Image wrapper — holds canvas, clipped to container
  var imgWrap=document.createElement('div');
  imgWrap.style.cssText='position:relative;max-width:480px;margin:0 auto;padding:0;display:none;user-select:none;-webkit-user-select:none;overflow:hidden;border-radius:8px;border:1px solid rgba(122,179,86,0.15);background:#faf5ee;aspect-ratio:1;touch-action:none;';
  a.appendChild(imgWrap);

  viewCanvas=document.createElement('canvas');
  viewCanvas.style.cssText='display:block;width:100%;height:100%;touch-action:none;image-rendering:auto;';
  imgWrap.appendChild(viewCanvas);
  viewCtx=viewCanvas.getContext('2d');

  srcCanvas=document.createElement('canvas');   // offscreen, full-res colored state
  srcCtx=srcCanvas.getContext('2d',{willReadFrequently:true});

  // Top-right tiny overlay button: reset zoom
  var resetBtn=document.createElement('button');
  resetBtn.textContent='⤢';
  resetBtn.title='Reset zoom';
  resetBtn.style.cssText='position:absolute;top:6px;right:6px;width:48px;height:48px;border-radius:10px;background:rgba(13,16,12,0.78);border:1px solid rgba(200,168,75,0.4);color:var(--cream,#e8dcc8);font-size:1.1rem;cursor:pointer;display:none;z-index:2;-webkit-tap-highlight-color:transparent;box-shadow:0 2px 6px rgba(0,0,0,0.4);';
  resetBtn.onclick=function(){
    zoom=1;panX=imgW/2;panY=imgH/2;
    renderView();
    updateResetBtn();
  };
  imgWrap.appendChild(resetBtn);

  // Top-LEFT floating UNDO button — always accessible on canvas so
  // player doesn't need to scroll down to reach the tool row
  var floatUndoBtn=document.createElement('button');
  floatUndoBtn.innerHTML='↶';
  floatUndoBtn.title='Undo last fill';
  floatUndoBtn.style.cssText='position:absolute;top:6px;left:6px;width:48px;height:48px;border-radius:10px;background:rgba(13,16,12,0.78);border:1px solid rgba(200,168,75,0.4);color:var(--gold,#c8a84b);font-size:1.6rem;cursor:pointer;z-index:2;-webkit-tap-highlight-color:transparent;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;padding:0;line-height:1;opacity:0.45;transition:opacity .15s;';
  floatUndoBtn.onclick=function(e){
    e.stopPropagation();
    if(window._CGundo)window._CGundo();
  };
  imgWrap.appendChild(floatUndoBtn);

  function updateResetBtn(){resetBtn.style.display=(zoom>1.02?'block':'none');}

  // Tool buttons row
  var toolRow=document.createElement('div');
  toolRow.style.cssText='display:flex;gap:4px;padding:8px 4px;max-width:480px;margin:0 auto;flex-wrap:wrap;justify-content:center;';
  toolRow.innerHTML=
    '<button class="gb" onclick="_CGprev()">◀ PREV</button>'+
    '<button class="gb" onclick="_CGundo()" id="CGundo" disabled style="opacity:.4">↶ UNDO</button>'+
    '<button class="gb" onclick="_CGclear()" style="border-color:rgba(217,107,75,0.35);color:#e8a090">✕ CLEAR</button>'+
    '<button class="gb" onclick="_CGsave()" style="border-color:rgba(200,168,75,0.4);color:var(--gold,#c8a84b)">💾 SAVE</button>'+
    '<button class="gb" onclick="_CGnext()">NEXT ▶</button>';
  a.appendChild(toolRow);

  // Color panel — wheel + slider + current color + quick palette
  var colorPanel=document.createElement('div');
  colorPanel.style.cssText='display:flex;gap:12px;padding:8px 8px 12px;max-width:480px;margin:0 auto;align-items:flex-start;justify-content:center;flex-wrap:wrap;';
  a.appendChild(colorPanel);

  // LEFT: wheel
  var wheelWrap=document.createElement('div');
  wheelWrap.style.cssText='position:relative;width:'+wheelSize+'px;height:'+wheelSize+'px;flex-shrink:0;';
  wheelCanvas=document.createElement('canvas');
  wheelCanvas.width=wheelSize;
  wheelCanvas.height=wheelSize;
  wheelCanvas.style.cssText='display:block;touch-action:none;cursor:crosshair;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);';
  wheelWrap.appendChild(wheelCanvas);
  wheelCtx=wheelCanvas.getContext('2d');
  // Cursor indicator
  var wheelCursor=document.createElement('div');
  wheelCursor.style.cssText='position:absolute;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,0.6);pointer-events:none;transform:translate(-50%,-50%);';
  wheelWrap.appendChild(wheelCursor);
  colorPanel.appendChild(wheelWrap);

  // RIGHT: current color + slider + quick swatches
  var rightCol=document.createElement('div');
  rightCol.style.cssText='display:flex;flex-direction:column;gap:8px;align-items:stretch;min-width:180px;flex:1;';
  colorPanel.appendChild(rightCol);

  colorDisplay=document.createElement('div');
  colorDisplay.style.cssText='width:100%;height:28px;border-radius:8px;background:'+currentColor+';border:2px solid rgba(232,220,200,0.25);box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-family:DM Mono,monospace;font-size:0.7rem;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.6);letter-spacing:0.05em;';
  colorDisplay.textContent=currentColor.toUpperCase();
  rightCol.appendChild(colorDisplay);

  // Slider label
  var slLbl=document.createElement('div');
  slLbl.textContent='BRIGHTNESS';
  slLbl.style.cssText='font-family:DM Mono,monospace;font-size:0.7rem;letter-spacing:0.08em;color:var(--muted,#8a9178);text-align:center;';
  rightCol.appendChild(slLbl);

  // Brightness slider (value/darkness)
  var sliderWrap=document.createElement('div');
  sliderWrap.style.cssText='position:relative;width:100%;height:'+sliderH+'px;';
  sliderCanvas=document.createElement('canvas');
  sliderCanvas.width=sliderW;
  sliderCanvas.height=sliderH;
  sliderCanvas.style.cssText='display:block;width:100%;height:100%;border-radius:6px;cursor:pointer;touch-action:none;';
  sliderWrap.appendChild(sliderCanvas);
  sliderCtx=sliderCanvas.getContext('2d');
  // Slider indicator
  var sliderCursor=document.createElement('div');
  sliderCursor.style.cssText='position:absolute;width:4px;height:'+(sliderH+4)+'px;top:-2px;background:#fff;border:1px solid rgba(0,0,0,0.7);border-radius:2px;pointer-events:none;box-shadow:0 0 0 1px rgba(0,0,0,0.4);transform:translateX(-50%);';
  sliderWrap.appendChild(sliderCursor);
  rightCol.appendChild(sliderWrap);

  // Quick palette
  quickPalWrap=document.createElement('div');
  quickPalWrap.style.cssText='display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin-top:2px;';
  for(var i=0;i<QUICK_PAL.length;i++){
    (function(c){
      var hit=document.createElement('div');            // 48px hit area (touch target min)
      hit.style.cssText='width:48px;height:48px;display:flex;align-items:center;justify-content:center;cursor:pointer;';
      var sw=document.createElement('div');
      sw.className='cg-quick';
      sw.style.cssText='width:clamp(22px,5.5vw,26px);height:clamp(22px,5.5vw,26px);border-radius:50%;background:'+c+';border:2px solid rgba(255,255,255,0.2);transition:transform .12s;box-shadow:0 1px 3px rgba(0,0,0,0.3);pointer-events:none;';
      hit.appendChild(sw);
      hit.onclick=function(){setColorFromHex(c);};
      quickPalWrap.appendChild(hit);
    })(QUICK_PAL[i]);
  }
  rightCol.appendChild(quickPalWrap);

  // ─── COLOR MATH ───────────────────────────────────────────────
  function hsvToRgb(h,s,v){
    var c=v*s,hp=h/60;
    var x=c*(1-Math.abs((hp%2)-1));
    var r=0,g=0,b=0;
    if(hp<1){r=c;g=x;}
    else if(hp<2){r=x;g=c;}
    else if(hp<3){g=c;b=x;}
    else if(hp<4){g=x;b=c;}
    else if(hp<5){r=x;b=c;}
    else {r=c;b=x;}
    var m=v-c;
    return[Math.round((r+m)*255),Math.round((g+m)*255),Math.round((b+m)*255)];
  }
  function rgbToHsv(r,g,b){
    r/=255;g/=255;b/=255;
    var max=Math.max(r,g,b),min=Math.min(r,g,b);
    var d=max-min,h=0,s=max===0?0:d/max,v=max;
    if(d!==0){
      if(max===r)h=((g-b)/d)%6;
      else if(max===g)h=(b-r)/d+2;
      else h=(r-g)/d+4;
      h*=60;if(h<0)h+=360;
    }
    return{h:h,s:s,v:v};
  }
  function hsvToHex(h,s,v){
    var rgb=hsvToRgb(h,s,v);
    return '#'+((1<<24)+(rgb[0]<<16)+(rgb[1]<<8)+rgb[2]).toString(16).slice(1);
  }
  function hexToRgb(hex){
    var n=parseInt(hex.slice(1),16);
    return[(n>>16)&255,(n>>8)&255,n&255];
  }

  // ─── WHEEL DRAWING ────────────────────────────────────────────
  function drawWheel(v){
    var c=wheelSize/2,radius=c-2;
    var imd=wheelCtx.createImageData(wheelSize,wheelSize);
    var d=imd.data;
    for(var y=0;y<wheelSize;y++){
      for(var x=0;x<wheelSize;x++){
        var dx=x-c,dy=y-c;
        var dist=Math.sqrt(dx*dx+dy*dy);
        var i=(y*wheelSize+x)*4;
        if(dist>radius){d[i+3]=0;continue;}
        var ang=Math.atan2(dy,dx)*180/Math.PI;
        if(ang<0)ang+=360;
        var sv=Math.min(1,dist/radius);
        var rgb=hsvToRgb(ang,sv,v);
        d[i]=rgb[0];d[i+1]=rgb[1];d[i+2]=rgb[2];d[i+3]=255;
      }
    }
    wheelCtx.putImageData(imd,0,0);
  }

  function drawSlider(h,s){
    // Left = black (v=0), right = full color (v=1)
    var imd=sliderCtx.createImageData(sliderW,sliderH);
    var d=imd.data;
    for(var x=0;x<sliderW;x++){
      var v=x/(sliderW-1);
      var rgb=hsvToRgb(h,s,v);
      for(var y=0;y<sliderH;y++){
        var i=(y*sliderW+x)*4;
        d[i]=rgb[0];d[i+1]=rgb[1];d[i+2]=rgb[2];d[i+3]=255;
      }
    }
    sliderCtx.putImageData(imd,0,0);
  }

  function updateCursors(){
    // Wheel cursor position
    var c=wheelSize/2,radius=c-2;
    var angRad=hue*Math.PI/180;
    var r=sat*radius;
    var wx=c+Math.cos(angRad)*r;
    var wy=c+Math.sin(angRad)*r;
    wheelCursor.style.left=wx+'px';
    wheelCursor.style.top=wy+'px';
    // Slider cursor position (as % of width)
    var pct=val*100;
    sliderCursor.style.left=pct+'%';
  }

  function updateColor(){
    currentColor=hsvToHex(hue,sat,val);
    colorDisplay.style.background=currentColor;
    colorDisplay.textContent=currentColor.toUpperCase();
    drawSlider(hue,sat);
    updateCursors();
  }

  function setColorFromHex(hex){
    var rgb=hexToRgb(hex);
    var h=rgbToHsv(rgb[0],rgb[1],rgb[2]);
    hue=h.h;sat=h.s;val=h.v;
    drawWheel(val);
    updateColor();
  }

  // Initial draw
  drawWheel(val);
  drawSlider(hue,sat);
  updateColor();

  // ─── WHEEL + SLIDER INPUT ─────────────────────────────────────
  function onWheelTouch(clientX,clientY){
    var rect=wheelCanvas.getBoundingClientRect();
    var x=(clientX-rect.left)*(wheelSize/rect.width)-wheelSize/2;
    var y=(clientY-rect.top)*(wheelSize/rect.height)-wheelSize/2;
    var radius=wheelSize/2-2;
    var dist=Math.sqrt(x*x+y*y);
    if(dist>radius){
      // Clamp to edge
      var k=radius/dist;x*=k;y*=k;dist=radius;
    }
    hue=Math.atan2(y,x)*180/Math.PI;
    if(hue<0)hue+=360;
    sat=Math.min(1,dist/radius);
    updateColor();
  }
  function wheelDown(e){
    var t=e.touches?e.touches[0]:e;
    e.preventDefault();
    onWheelTouch(t.clientX,t.clientY);
    var wheelDragging=true;
    function mv(ev){
      if(!wheelDragging)return;
      ev.preventDefault();
      var tt=ev.touches?ev.touches[0]:ev;
      onWheelTouch(tt.clientX,tt.clientY);
    }
    function up(){
      wheelDragging=false;
      window.removeEventListener('mousemove',mv);
      window.removeEventListener('mouseup',up);
      window.removeEventListener('touchmove',mv);
      window.removeEventListener('touchend',up);
      window.removeEventListener('touchcancel',up);
    }
    window.addEventListener('mousemove',mv);
    window.addEventListener('mouseup',up);
    window.addEventListener('touchmove',mv,{passive:false});
    window.addEventListener('touchend',up);
    window.addEventListener('touchcancel',up);
  }
  wheelCanvas.addEventListener('mousedown',wheelDown);
  wheelCanvas.addEventListener('touchstart',wheelDown,{passive:false});

  function onSliderTouch(clientX){
    var rect=sliderCanvas.getBoundingClientRect();
    var x=(clientX-rect.left)/rect.width;
    val=Math.max(0,Math.min(1,x));
    drawWheel(val);
    updateColor();
  }
  function sliderDown(e){
    var t=e.touches?e.touches[0]:e;
    e.preventDefault();
    onSliderTouch(t.clientX);
    var sliderDragging=true;
    function mv(ev){
      if(!sliderDragging)return;
      ev.preventDefault();
      var tt=ev.touches?ev.touches[0]:ev;
      onSliderTouch(tt.clientX);
    }
    function up(){
      sliderDragging=false;
      window.removeEventListener('mousemove',mv);
      window.removeEventListener('mouseup',up);
      window.removeEventListener('touchmove',mv);
      window.removeEventListener('touchend',up);
      window.removeEventListener('touchcancel',up);
    }
    window.addEventListener('mousemove',mv);
    window.addEventListener('mouseup',up);
    window.addEventListener('touchmove',mv,{passive:false});
    window.addEventListener('touchend',up);
    window.addEventListener('touchcancel',up);
  }
  sliderCanvas.addEventListener('mousedown',sliderDown);
  sliderCanvas.addEventListener('touchstart',sliderDown,{passive:false});

  // ─── MANIFEST + PAGE LOADING ──────────────────────────────────
  fetch(MANIFEST_URL,{cache:'default'})
    .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
    .then(function(j){
      pages=(j&&j.pages)||[];
      if(!pages.length)throw new Error('Empty manifest');
      loadingDiv.style.display='none';
      imgWrap.style.display='block';
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
    history=[];updateUndoBtn();
    var img=new Image();
    img.onload=function(){
      imgW=img.naturalWidth;imgH=img.naturalHeight;
      // Source canvas holds the full-resolution colored state
      srcCanvas.width=imgW;srcCanvas.height=imgH;
      srcCtx.fillStyle='#faf5ee';
      srcCtx.fillRect(0,0,imgW,imgH);
      srcCtx.drawImage(img,0,0);
      // View canvas matches container size at device pixel ratio
      sizeViewToContainer();
      zoom=1;panX=imgW/2;panY=imgH/2;
      renderView();
      updateResetBtn();
    };
    img.onerror=function(){sm('Failed to load '+p.file);};
    img.src=BASE+p.file;
  }

  function sizeViewToContainer(){
    var rect=imgWrap.getBoundingClientRect();
    var dpr=Math.min(2,window.devicePixelRatio||1);
    viewCanvas.width=Math.round(rect.width*dpr);
    viewCanvas.height=Math.round(rect.height*dpr);
    viewCtx.imageSmoothingEnabled=true;
    viewCtx.imageSmoothingQuality='high';
  }
  var _cgResize=function(){ if(imgW){sizeViewToContainer();renderView();} };
  window.addEventListener('resize',_cgResize);
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){
    window.removeEventListener('resize',_cgResize);
    // Undo history + the offscreen full-res source canvas are the bulk of
    // this game's memory (up to HISTORY_CAP snapshots at ~5.8MB each for a
    // 1200x1200 page). Drop them and the window-exposed handlers so the
    // whole CG() closure is free to GC once the mount is torn down.
    history.length=0;
    if(srcCanvas){srcCanvas.width=0;srcCanvas.height=0;}
    delete window._CGprev;delete window._CGnext;delete window._CGundo;
    delete window._CGclear;delete window._CGsave;
  });

  function clampPan(){
    if(!imgW)return;
    var srcRegionW=imgW/zoom,srcRegionH=imgH/zoom;
    panX=Math.max(srcRegionW/2,Math.min(imgW-srcRegionW/2,panX));
    panY=Math.max(srcRegionH/2,Math.min(imgH-srcRegionH/2,panY));
  }

  function renderView(){
    if(!imgW)return;
    clampPan();
    var srcRegionW=imgW/zoom,srcRegionH=imgH/zoom;
    var srcX=panX-srcRegionW/2,srcY=panY-srcRegionH/2;
    viewCtx.fillStyle='#faf5ee';
    viewCtx.fillRect(0,0,viewCanvas.width,viewCanvas.height);
    viewCtx.drawImage(srcCanvas,srcX,srcY,srcRegionW,srcRegionH,0,0,viewCanvas.width,viewCanvas.height);
  }

  // ─── FLOOD FILL (on source canvas) ─────────────────────────────
  function isLine(r,g,b){return(r+g+b)<180;}
  function matchesStart(r,g,b,sr,sg,sb){
    return Math.abs(r-sr)<28&&Math.abs(g-sg)<28&&Math.abs(b-sb)<28;
  }

  // Returns null for a no-op tap (off-canvas / on a line / already-filled),
  // or {painted, snap} where snap is the pre-paint pixel data for undo.
  // Only one getImageData pass per tap (was two: a snapshot read here plus
  // this same read again) and the snapshot clone only happens once we know
  // the tap will actually paint something.
  function floodFill(sx,sy){
    if(sx<0||sy<0||sx>=imgW||sy>=imgH)return null;
    var imd=srcCtx.getImageData(0,0,imgW,imgH);
    var d=imd.data;
    var sIdx=(sy*imgW+sx)*4;
    var sR=d[sIdx],sG=d[sIdx+1],sB=d[sIdx+2];
    if(isLine(sR,sG,sB))return null;
    var fill=hexToRgb(currentColor);
    if(sR===fill[0]&&sG===fill[1]&&sB===fill[2])return null;
    var snap=new Uint8ClampedArray(d);   // pre-paint snapshot, for undo

    var stack=[[sx,sy]];
    var painted=0;
    while(stack.length){
      var pt=stack.pop(),x=pt[0],y=pt[1];
      var ii=(y*imgW+x)*4;
      if(!matchesStart(d[ii],d[ii+1],d[ii+2],sR,sG,sB))continue;
      var lx=x;
      while(lx>=0){
        var li=(y*imgW+lx)*4;
        if(!matchesStart(d[li],d[li+1],d[li+2],sR,sG,sB))break;
        lx--;
      }
      lx++;
      var topSpan=false,botSpan=false;
      for(var rx=lx;rx<imgW;rx++){
        var ri=(y*imgW+rx)*4;
        if(!matchesStart(d[ri],d[ri+1],d[ri+2],sR,sG,sB))break;
        d[ri]=fill[0];d[ri+1]=fill[1];d[ri+2]=fill[2];d[ri+3]=255;
        painted++;
        if(y>0){
          var ti=((y-1)*imgW+rx)*4;
          var tm=matchesStart(d[ti],d[ti+1],d[ti+2],sR,sG,sB);
          if(tm&&!topSpan){stack.push([rx,y-1]);topSpan=true;}
          else if(!tm)topSpan=false;
        }
        if(y<imgH-1){
          var bi=((y+1)*imgW+rx)*4;
          var bm=matchesStart(d[bi],d[bi+1],d[bi+2],sR,sG,sB);
          if(bm&&!botSpan){stack.push([rx,y+1]);botSpan=true;}
          else if(!bm)botSpan=false;
        }
      }
      if(painted>imgW*imgH)break;
    }
    srcCtx.putImageData(imd,0,0);
    return{painted:painted,snap:snap};
  }

  // Convert view coords → source coords
  function viewToSrc(viewX,viewY){
    var rect=viewCanvas.getBoundingClientRect();
    var vx=(viewX-rect.left)/rect.width;      // 0-1
    var vy=(viewY-rect.top)/rect.height;      // 0-1
    var srcRegionW=imgW/zoom,srcRegionH=imgH/zoom;
    var srcX=(panX-srcRegionW/2)+vx*srcRegionW;
    var srcY=(panY-srcRegionH/2)+vy*srcRegionH;
    return{x:Math.floor(srcX),y:Math.floor(srcY)};
  }

  // ─── PAN / ZOOM / TAP ─────────────────────────────────────────
  function pinchDistance(t1,t2){
    var dx=t2.clientX-t1.clientX,dy=t2.clientY-t1.clientY;
    return Math.sqrt(dx*dx+dy*dy);
  }
  function pinchCenter(t1,t2){
    return{x:(t1.clientX+t2.clientX)/2,y:(t1.clientY+t2.clientY)/2};
  }

  function onCanvasTouchStart(e){
    if(!imgW)return;
    e.preventDefault();
    if(e.touches.length===2){
      var t1=e.touches[0],t2=e.touches[1];
      pinchStart={d:pinchDistance(t1,t2),zoom:zoom,panX:panX,panY:panY,center:pinchCenter(t1,t2)};
      dragging=false;
    } else if(e.touches.length===1){
      var t=e.touches[0];
      dragStart={x:t.clientX,y:t.clientY,time:Date.now()};
      dragMoved=false;
      dragging=true;
    }
  }
  function onCanvasTouchMove(e){
    if(!imgW)return;
    e.preventDefault();
    if(e.touches.length===2&&pinchStart){
      var t1=e.touches[0],t2=e.touches[1];
      var d=pinchDistance(t1,t2);
      var factor=d/pinchStart.d;
      zoom=Math.max(1,Math.min(6,pinchStart.zoom*factor));
      // Keep pinch center stable in source space
      var rect=viewCanvas.getBoundingClientRect();
      var cx=pinchCenter(t1,t2);
      var srcRegionW=imgW/zoom,srcRegionH=imgH/zoom;
      var origSrcRegionW=imgW/pinchStart.zoom;
      var origSrcRegionH=imgH/pinchStart.zoom;
      // Source point under pinch center at pinchStart
      var vxStart=(pinchStart.center.x-rect.left)/rect.width;
      var vyStart=(pinchStart.center.y-rect.top)/rect.height;
      var anchorSrcX=(pinchStart.panX-origSrcRegionW/2)+vxStart*origSrcRegionW;
      var anchorSrcY=(pinchStart.panY-origSrcRegionH/2)+vyStart*origSrcRegionH;
      // Keep that anchor under the current pinch center
      var vxNow=(cx.x-rect.left)/rect.width;
      var vyNow=(cx.y-rect.top)/rect.height;
      panX=anchorSrcX-(vxNow-0.5)*srcRegionW;
      panY=anchorSrcY-(vyNow-0.5)*srcRegionH;
      renderView();
      updateResetBtn();
    } else if(e.touches.length===1&&dragging&&dragStart){
      var t=e.touches[0];
      var dx=t.clientX-dragStart.x,dy=t.clientY-dragStart.y;
      if(!dragMoved&&Math.sqrt(dx*dx+dy*dy)>6)dragMoved=true;
      if(dragMoved&&zoom>1.02){
        var rect=viewCanvas.getBoundingClientRect();
        var srcRegionW=imgW/zoom,srcRegionH=imgH/zoom;
        panX-=dx/rect.width*srcRegionW;
        panY-=dy/rect.height*srcRegionH;
        dragStart.x=t.clientX;dragStart.y=t.clientY;
        renderView();
      }
    }
  }
  function onCanvasTouchEnd(e){
    if(!imgW)return;
    e.preventDefault();
    if(pinchStart&&e.touches.length<2){pinchStart=null;}
    if(dragging&&dragStart&&!dragMoved&&e.touches.length===0){
      // Single tap — flood fill at the source coordinate
      var src=viewToSrc(dragStart.x,dragStart.y);
      var res=floodFill(src.x,src.y);
      if(res&&res.painted>0){
        history.push(res.snap);
        if(history.length>HISTORY_CAP)history.shift();
        updateUndoBtn();
        try{if(navigator.vibrate)navigator.vibrate(8);}catch(e2){}
        if(_play)try{_play('tap');}catch(e2){}
        renderView();
      }
    }
    if(e.touches.length===0){dragging=false;dragStart=null;dragMoved=false;}
  }
  viewCanvas.addEventListener('touchstart',onCanvasTouchStart,{passive:false});
  viewCanvas.addEventListener('touchmove',onCanvasTouchMove,{passive:false});
  viewCanvas.addEventListener('touchend',onCanvasTouchEnd,{passive:false});
  viewCanvas.addEventListener('touchcancel',onCanvasTouchEnd,{passive:false});

  // Desktop mouse support — click to fill, scroll-wheel to zoom
  viewCanvas.addEventListener('click',function(e){
    if(!imgW)return;
    var src=viewToSrc(e.clientX,e.clientY);
    var res=floodFill(src.x,src.y);
    if(res&&res.painted>0){
      history.push(res.snap);
      if(history.length>HISTORY_CAP)history.shift();
      updateUndoBtn();
      if(_play)try{_play('tap');}catch(e2){}
      renderView();
    }
  });
  viewCanvas.addEventListener('wheel',function(e){
    if(!imgW)return;
    e.preventDefault();
    var rect=viewCanvas.getBoundingClientRect();
    var vx=(e.clientX-rect.left)/rect.width;
    var vy=(e.clientY-rect.top)/rect.height;
    var srcRegionW=imgW/zoom,srcRegionH=imgH/zoom;
    var anchorX=(panX-srcRegionW/2)+vx*srcRegionW;
    var anchorY=(panY-srcRegionH/2)+vy*srcRegionH;
    var factor=e.deltaY<0?1.15:1/1.15;
    zoom=Math.max(1,Math.min(6,zoom*factor));
    var newSrcW=imgW/zoom,newSrcH=imgH/zoom;
    panX=anchorX-(vx-0.5)*newSrcW;
    panY=anchorY-(vy-0.5)*newSrcH;
    renderView();
    updateResetBtn();
  },{passive:false});

  function updateUndoBtn(){
    var b=document.getElementById('CGundo');
    if(b){
      b.disabled=history.length===0;
      b.style.opacity=history.length===0?'0.4':'1';
    }
    if(floatUndoBtn){
      floatUndoBtn.style.opacity=history.length===0?'0.45':'1';
    }
  }

  // ─── CONTROL HANDLERS ─────────────────────────────────────────
  // PREV/NEXT/CLEAR all wipe uncolored/unsaved work with no way back
  // (history is per-page and loadPage resets it) — confirm if there's
  // anything to lose, same pattern pixelgarden.js uses for its CLEAR.
  window._CGprev=function(){
    if(pages.length&&(!history.length||!window.confirm||window.confirm('Leave this page? Unsaved coloring will be lost.')))loadPage(currentIdx-1);
  };
  window._CGnext=function(){
    if(pages.length&&(!history.length||!window.confirm||window.confirm('Leave this page? Unsaved coloring will be lost.')))loadPage(currentIdx+1);
  };
  window._CGundo=function(){
    if(!history.length)return;
    var snap=history.pop();
    srcCtx.putImageData(new ImageData(snap,imgW,imgH),0,0);
    renderView();
    updateUndoBtn();
  };
  window._CGclear=function(){
    if(!pages.length)return;
    if(history.length&&window.confirm&&!window.confirm('Clear all coloring on this page? This cannot be undone.'))return;
    loadPage(currentIdx);
  };
  window._CGsave=function(){
    var g=window._lwArtSaveGate&&window._lwArtSaveGate('colorgarden');
    if(g&&!g.allow){sm('Save again in '+g.secs+'s');return;}
    try{
      // Save the full-resolution source canvas, not the zoomed view
      var link=document.createElement('a');
      link.download='color-garden-page'+(currentIdx+1)+'-'+Date.now()+'.png';
      link.href=srcCanvas.toDataURL('image/png');
      link.click();
      if(_e){
        try{
          if(g&&g.firstWin)_e('game_win');else _e('milestone');
        }catch(e){}
      }
      if(_playWin)try{_playWin();}catch(e){}
      sm('💾 Saved.');
      savesCount++;
      _sr('colorgarden',{w:true,s:savesCount});
    }catch(e){sm('Save failed.');}
  };
};
})();
