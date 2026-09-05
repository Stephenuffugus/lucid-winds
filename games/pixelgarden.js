// ═══ PIXEL GARDEN — creative pixel-art painter ═══
// Not a win/loss game. Hash rewards for sustained painting sessions + save.
// Tools: draw, erase, fill, pick, mirror, grid, clear, undo, save.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

window._gameFns = window._gameFns || {};
window._gameFns.pixelgarden = function PG(a){
  var GRID=16,CELL=18,dpr=1;
  var canvas,ctx;
  var pixels=[],currentColor='#7ab356',tool='draw';
  var mirrorMode=false,showGrid=true;
  var undoStack=[],maxUndo=30;
  var drawing=false,totalPixels=0;
  var pixelsSinceSave=0; // fresh strokes since the last paid save — earn gate
  var uniqueChanges=0;        // pixels that actually changed color
  var lastProgressAt=0;       // ms timestamp of last XP award
  var COLORS=[
    '#2d5020','#7ab356','#6aaa4a','#a0cc80',
    '#3d2a18','#6b4a2a','#8b6a3a','#b8a060',
    '#c47a7a','#d4566a','#e8a0a0','#f0c8c8',
    '#8a6a20','#c8a84b','#e8cc70','#f0e0a0',
    '#2a4a6a','#5b9bd5','#90c0e8','#c0ddf0',
    '#0d100c','#2a2a2a','#808080','#e8dcc8'
  ];

  // Overlay hygiene: gallery/compose modals live on document.body, so a
  // remount (or exit to the in-app picker) must sweep any stale copies —
  // their handlers reference a dead instance's state.
  function killOverlays(){var ids=['PGgalOV','PGcmpOV'],i,x;for(i=0;i<ids.length;i++){x=document.getElementById(ids[i]);if(x)x.remove();}}
  killOverlays();
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(killOverlays);

  ms(a,'')  // the size is already the Canvas line below; the title is the header;
  mm(a);
  var pan=document.createElement('div');
  pan.style.cssText='max-width:420px;margin:0 auto;padding:6px;user-select:none;text-align:center;';
  a.appendChild(pan);

  // Size picker
  var sizeRow=document.createElement('div');
  sizeRow.style.cssText='display:flex;gap:6px;justify-content:center;padding:6px;flex-wrap:wrap;';
  sizeRow.innerHTML=
    '<button class="gb" onclick="_PGSZ(16)" style="padding:6px 14px;">16×16</button>'+
    '<button class="gb" onclick="_PGSZ(24)" style="padding:6px 14px;">24×24</button>'+
    '<button class="gb" onclick="_PGSZ(32)" style="padding:6px 14px;">32×32</button>';
  pan.appendChild(sizeRow);

  canvas=document.createElement('canvas');
  canvas.style.cssText='display:block;border-radius:4px;border:2px solid rgba(200,168,75,0.35);box-shadow:0 6px 22px rgba(0,0,0,.6),0 0 0 6px rgba(13,16,12,.9);margin:10px auto;touch-action:none;image-rendering:pixelated;';
  pan.appendChild(canvas);

  // Palette
  var palEl=document.createElement('div');
  palEl.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,48px);gap:6px;justify-content:center;max-width:min(100%,318px);margin:0 auto;padding:10px 0 6px;';
  pan.appendChild(palEl);

  // Tools
  var toolEl=document.createElement('div');
  toolEl.style.cssText='display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:6px 0;max-width:340px;margin:0 auto;';
  pan.appendChild(toolEl);

  // two rows of three, so no button is ever stranded alone on a row (GRID and PNG were)
  var act=document.createElement('div');
  act.style.cssText='display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-width:340px;margin:10px auto 0;padding:0 6px;';
  act.innerHTML='<button class="gb" onclick="_PGCLR()" style="min-height:48px">CLEAR</button>'
    +'<button class="gb" onclick="_PGUN()" style="min-height:48px">UNDO</button>'
    +'<button class="gb" onclick="_PGSV()" style="min-height:48px">SAVE</button>'
    +'<button class="gb" onclick="_PGGal()" style="min-height:48px">📂 GALLERY</button>'
    +'<button class="gb" onclick="_PGCompose()" style="min-height:48px">🧩 COMPOSE</button>'
    +'<button class="gb" onclick="_PGExport()" style="min-height:48px">⬇ PNG</button>';
  a.appendChild(act);

  function initGrid(){
    pixels=[];
    for(var r=0;r<GRID;r++){pixels[r]=[];for(var c=0;c<GRID;c++)pixels[r][c]=null;}
    undoStack=[];totalPixels=0;
  }
  function initCanvas(){
    ctx=canvas.getContext('2d');
    dpr=window.devicePixelRatio||1;
    var maxSize=Math.min((a.clientWidth||360)-24,340);
    CELL=Math.floor(maxSize/GRID);
    var total=GRID*CELL;
    canvas.width=total*dpr;canvas.height=total*dpr;
    canvas.style.width=total+'px';canvas.style.height=total+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.imageSmoothingEnabled=false;
  }
  function buildPalette(){
    var h='';
    for(var i=0;i<COLORS.length;i++){
      var active=COLORS[i]===currentColor;
      // 48px hit box (border-box) with a 40px visible swatch (2px border + 2px padding per side)
      h+='<div onclick="_PGCOL(\''+COLORS[i]+'\')" style="width:48px;height:48px;padding:2px;background-clip:content-box;border-radius:8px;background:'+COLORS[i]+';border:2px solid '+(active?'#e8dcc8':'transparent')+';cursor:pointer;'+(active?'transform:scale(1.08);':'')+'"></div>';
    }
    palEl.innerHTML=h;
  }
  function buildTools(){
    var tools=[['draw','DRAW'],['erase','ERASE'],['fill','FILL'],['pick','PICK']];
    var h='';
    for(var i=0;i<tools.length;i++){
      var active=tool===tools[i][0];
      h+='<button class="gb" onclick="_PGT(\''+tools[i][0]+'\')" style="min-height:48px;padding:5px 10px;font-size:0.78rem;letter-spacing:0.05em;'+(active?'background:rgba(122,179,86,0.2);border-color:#7ab356;color:#7ab356;':'')+'">'+tools[i][1]+'</button>';
    }
    h+='<button class="gb" onclick="_PGMIR()" style="min-height:48px;padding:5px 10px;font-size:0.78rem;letter-spacing:0.05em;'+(mirrorMode?'background:rgba(200,168,75,0.2);border-color:#c8a84b;color:#c8a84b;':'')+'">MIRROR</button>';
    h+='<button class="gb" onclick="_PGGR()" style="min-height:48px;padding:5px 10px;font-size:0.78rem;letter-spacing:0.05em;">GRID</button>';
    toolEl.innerHTML=h;
  }
  function render(){
    if(!ctx)return;
    var total=GRID*CELL;
    ctx.fillStyle='#1a1a1a';ctx.fillRect(0,0,total,total);
    for(var r=0;r<GRID;r++){
      for(var c=0;c<GRID;c++){
        if(!pixels[r][c]){
          ctx.fillStyle=(r+c)%2===0?'#1a1a1a':'#222222';
          ctx.fillRect(c*CELL,r*CELL,CELL,CELL);
        } else {
          ctx.fillStyle=pixels[r][c];
          ctx.fillRect(c*CELL,r*CELL,CELL,CELL);
        }
      }
    }
    if(showGrid&&CELL>=8){
      ctx.strokeStyle='rgba(122,179,86,0.12)';ctx.lineWidth=0.5;
      for(var i=0;i<=GRID;i++){
        ctx.beginPath();ctx.moveTo(i*CELL,0);ctx.lineTo(i*CELL,total);ctx.stroke();
        ctx.beginPath();ctx.moveTo(0,i*CELL);ctx.lineTo(total,i*CELL);ctx.stroke();
      }
    }
    if(mirrorMode){
      ctx.strokeStyle='rgba(200,168,75,0.3)';ctx.setLineDash([4,4]);ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(total/2,0);ctx.lineTo(total/2,total);ctx.stroke();
      ctx.setLineDash([]);
    }
  }
  function setPixel(r,c,color){
    if(r<0||r>=GRID||c<0||c>=GRID)return;
    // Only count genuine color changes toward XP — repainting an
    // already-that-color pixel doesn't count. Prevents swipe-farming.
    if(pixels[r][c]!==color)uniqueChanges++;
    pixels[r][c]=color;
  }
  function floodFill(sr,sc,fc){
    var target=pixels[sr][sc];if(target===fc)return 0;
    var stack=[[sr,sc]],visited={},changed=0;
    while(stack.length>0){
      var p=stack.pop(),pr=p[0],pc=p[1],key=pr+','+pc;
      if(visited[key])continue;visited[key]=true;
      if(pr<0||pr>=GRID||pc<0||pc>=GRID)continue;
      if(pixels[pr][pc]!==target)continue;
      pixels[pr][pc]=fc;changed++;
      stack.push([pr-1,pc],[pr+1,pc],[pr,pc-1],[pr,pc+1]);
    }
    return changed;
  }
  function applyTool(r,c){
    if(r<0||r>=GRID||c<0||c>=GRID)return;
    if(tool==='draw'){
      setPixel(r,c,currentColor);
      if(mirrorMode)setPixel(r,GRID-1-c,currentColor);
      totalPixels++;pixelsSinceSave++;
    } else if(tool==='erase'){
      setPixel(r,c,null);
      if(mirrorMode)setPixel(r,GRID-1-c,null);
    } else if(tool==='fill'){
      // Count filled cells so the canvas registers as painted — a filled
      // board used to have totalPixels===0 and SAVE rejected it as blank.
      var fn=floodFill(r,c,currentColor);
      if(mirrorMode)fn+=floodFill(r,GRID-1-c,currentColor);
      totalPixels+=fn;pixelsSinceSave+=fn;
    } else if(tool==='pick'){
      if(pixels[r][c]){currentColor=pixels[r][c];buildPalette();}
    }
    render();
    // XP gate: require 120 unique color changes AND at least 30s
    // since the last award. Large-grid swipe-farming used to hit the
    // old (hashTimer>=40, any tap) threshold every couple seconds.
    if(uniqueChanges>=120){
      var now=Date.now();
      if(now-lastProgressAt>=30000){
        lastProgressAt=now;
        uniqueChanges=0;
        _e('progress');
      }
    }
  }
  function saveUndo(){
    // Snapshot carries its grid size — loading a painting can change GRID,
    // and popping a mismatched-size pixel array used to brick render().
    var state=[];for(var r=0;r<GRID;r++)state[r]=pixels[r].slice();
    undoStack.push({grid:GRID,state:state,tp:totalPixels});
    if(undoStack.length>maxUndo)undoStack.shift();
  }
  function getCell(e){
    var rect=canvas.getBoundingClientRect();
    var x,y;
    if(e.touches&&e.touches.length>0){x=e.touches[0].clientX-rect.left;y=e.touches[0].clientY-rect.top;}
    else{x=e.clientX-rect.left;y=e.clientY-rect.top;}
    return{r:Math.floor(y/CELL),c:Math.floor(x/CELL)};
  }
  canvas.addEventListener('touchstart',function(e){e.preventDefault();drawing=true;saveUndo();var cell=getCell(e);applyTool(cell.r,cell.c);},{passive:false});
  canvas.addEventListener('touchmove',function(e){e.preventDefault();if(!drawing)return;var cell=getCell(e);if(tool==='draw'||tool==='erase')applyTool(cell.r,cell.c);},{passive:false});
  canvas.addEventListener('touchend',function(e){e.preventDefault();drawing=false;},{passive:false});
  canvas.addEventListener('mousedown',function(e){drawing=true;saveUndo();var cell=getCell(e);applyTool(cell.r,cell.c);});
  canvas.addEventListener('mousemove',function(e){if(!drawing)return;var cell=getCell(e);if(tool==='draw'||tool==='erase')applyTool(cell.r,cell.c);});
  canvas.addEventListener('mouseup',function(){drawing=false;});
  canvas.addEventListener('mouseleave',function(){drawing=false;});

  window._PGCOL=function(c){currentColor=c;buildPalette();_play('tap');};
  window._PGT=function(t){tool=t;buildTools();_play('tap');};
  window._PGMIR=function(){mirrorMode=!mirrorMode;buildTools();render();};
  window._PGGR=function(){showGrid=!showGrid;render();};
  window._PGCLR=function(){saveUndo();for(var r=0;r<GRID;r++)for(var c=0;c<GRID;c++)pixels[r][c]=null;totalPixels=0;pixelsSinceSave=0;uniqueChanges=0;render();sm('Cleared');};
  window._PGUN=function(){
    if(undoStack.length===0){sm('Nothing to undo');return;}
    var snap=undoStack.pop();
    if(snap.grid!==GRID){
      GRID=snap.grid;
      var szEl=(document.getElementById('PGsz')||{});if(szEl)szEl.textContent=GRID+'×'+GRID;
      initCanvas();
    }
    pixels=snap.state;totalPixels=snap.tp;render();_play('tap');
  };
  // ─── IN-APP GALLERY (save + load) ──────────────────────────────────
  // Paintings live in localStorage under GAL_KEY as an array of
  // {id, name, grid, pixels (rows of color strings or null), created}.
  // Capped at GAL_MAX to stay under localStorage quota.
  var GAL_KEY='lw_pixelgarden_gallery', GAL_MAX=24;
  // User-entered names go into overlay innerHTML — escape them.
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function galLoad(){
    try{return JSON.parse(localStorage.getItem(GAL_KEY)||'[]');}catch(e){return [];}
  }
  function galWrite(arr){
    try{localStorage.setItem(GAL_KEY,JSON.stringify(arr));}catch(e){
      // Quota hit — shed oldest entries until it fits.
      while(arr.length>0){arr.shift();try{localStorage.setItem(GAL_KEY,JSON.stringify(arr));return;}catch(e2){}}
    }
  }
  function galSaveCurrent(name){
    var gal=galLoad();
    var entry={
      id:'pg_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),
      name:name||('Untitled '+(gal.length+1)),
      grid:GRID,
      pixels:pixels.map(function(row){return row.slice();}),
      created:Date.now()
    };
    gal.push(entry);
    // Keep newest-first so oldest falls off on overflow.
    if(gal.length>GAL_MAX)gal.splice(0,gal.length-GAL_MAX);
    galWrite(gal);
    return entry;
  }
  function galDelete(id){
    var gal=galLoad().filter(function(e){return e.id!==id;});
    galWrite(gal);
  }
  // Paint an entry into a tiny canvas for thumbnail display in the
  // gallery modal. Returns a data URL.
  function thumbDataURL(entry,size){
    size=size||96;
    var sc=document.createElement('canvas');
    sc.width=size;sc.height=size;
    var sx=sc.getContext('2d');
    sx.imageSmoothingEnabled=false;
    sx.fillStyle='#0d100c';sx.fillRect(0,0,size,size);
    var cell=size/entry.grid;
    for(var r=0;r<entry.grid;r++){
      for(var c=0;c<entry.grid;c++){
        var col=entry.pixels[r]&&entry.pixels[r][c];
        if(col){sx.fillStyle=col;sx.fillRect(Math.floor(c*cell),Math.floor(r*cell),Math.ceil(cell),Math.ceil(cell));}
      }
    }
    return sc.toDataURL('image/png');
  }
  function renderPNG(){
    var scale=GRID<=16?16:8;
    var sc=document.createElement('canvas');
    sc.width=GRID*scale;sc.height=GRID*scale;
    var sx=sc.getContext('2d');
    sx.imageSmoothingEnabled=false;
    sx.fillStyle='#0d100c';sx.fillRect(0,0,sc.width,sc.height);
    for(var r=0;r<GRID;r++)for(var c=0;c<GRID;c++){if(pixels[r][c]){sx.fillStyle=pixels[r][c];sx.fillRect(c*scale,r*scale,scale,scale);}}
    sx.fillStyle='rgba(232,220,200,0.2)';
    sx.font=(scale*0.7)+'px sans-serif';
    sx.textAlign='right';
    sx.fillText('Lucid Winds',sc.width-4,sc.height-4);
    return sc.toDataURL('image/png');
  }

  window._PGSV=function(){
    // SAVE = commit current work to the in-app gallery (not a file).
    if(totalPixels<=0){sm('Paint something first');return;}
    // Prompt BEFORE the gate: _lwArtSaveGate consumes the cooldown + the
    // one-time firstWin flag on allow, so a cancelled prompt must not burn them.
    var defName='Garden '+(new Date()).toLocaleDateString();
    var name=window.prompt?window.prompt('Name this piece:',defName):defName;
    if(name===null)return; // cancelled — abort the save
    name=String(name).slice(0,40)||defName;
    var g=window._lwArtSaveGate&&window._lwArtSaveGate('pixelgarden');
    if(g&&!g.allow){sm('Save again in '+g.secs+'s');return;}
    var entry=galSaveCurrent(name);
    sm('Saved to Gallery: '+entry.name);
    _playWin();
    // Earn requires fresh work since the last paid save — re-saving the same
    // single pixel every 30s was a 2-sunbeam/30s trickle farm.
    if(pixelsSinceSave>=20){
      pixelsSinceSave=0;
      if(g&&g.firstWin){_e('game_win');_sr('pixelgarden',{w:true,s:totalPixels,sz:GRID});}
      else _e('milestone');
    }
  };
  window._PGExport=function(){
    var link=document.createElement('a');
    link.download='pixel-garden-'+GRID+'x'+GRID+'-'+Date.now()+'.png';
    link.href=renderPNG();
    link.click();
    sm('PNG exported');
  };

  // ─── GALLERY MODAL ─────────────────────────────────────────────────
  window._PGGal=function(){
    var ov=document.getElementById('PGgalOV');
    if(ov){ov.remove();return;}
    ov=document.createElement('div');
    ov.id='PGgalOV';
    ov.style.cssText='position:fixed;inset:0;z-index:99993;display:flex;align-items:center;justify-content:center;background:rgba(5,8,4,0.92);backdrop-filter:blur(10px);padding:12px;animation:panelFadeIn 0.3s ease;';
    ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});
    document.body.appendChild(ov);
    _renderGallery();
  };
  function _renderGallery(){
    var ov=document.getElementById('PGgalOV');if(!ov)return;
    var gal=galLoad();
    var h='<div style="max-width:440px;width:100%;max-height:90vh;overflow-y:auto;-webkit-overflow-scrolling:touch;background:rgba(15,20,12,0.96);border:1px solid rgba(200,168,75,0.35);border-radius:12px;padding:16px;font-family:DM Mono,monospace;">';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:1.1rem;letter-spacing:0.12em;color:var(--gold);">📂 GALLERY</div>';
    h+='<button class="gb" onclick="document.getElementById(\'PGgalOV\').remove()" style="min-height:48px;padding:6px 14px;">CLOSE</button>';
    h+='</div>';
    if(gal.length===0){
      h+='<div style="text-align:center;padding:40px 10px;color:var(--muted);font-style:italic;font-size:0.75rem;line-height:1.5;">No saved paintings yet.<br>Create something, then hit SAVE to stash it here.</div>';
    } else {
      h+='<div style="font-family:DM Mono,monospace;font-size:0.7rem;color:var(--muted);margin-bottom:8px;">'+gal.length+' / '+GAL_MAX+' saved</div>';
      h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
      // Newest first for display
      for(var i=gal.length-1;i>=0;i--){
        var e=gal[i];
        var thumb=thumbDataURL(e,96);
        h+='<div style="background:rgba(26,31,23,0.7);border:1px solid rgba(74,124,53,0.2);border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:4px;">';
        h+='<img src="'+thumb+'" alt="" style="width:100%;aspect-ratio:1;border-radius:4px;image-rendering:pixelated;background:#0d100c;">';
        h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.7rem;color:var(--cream);letter-spacing:0.04em;word-break:break-word;">'+esc(e.name)+'</div>';
        h+='<div style="font-family:DM Mono,monospace;font-size:0.7rem;color:var(--muted);">'+e.grid+'×'+e.grid+'</div>';
        h+='<div style="display:flex;gap:4px;margin-top:2px;">';
        h+='<button class="gb" onclick="_PGLoad(\''+e.id+'\')" style="flex:1;min-height:48px;padding:6px;font-size:0.7rem;color:var(--sage);border-color:rgba(122,179,86,0.4);">LOAD</button>';
        h+='<button class="gb" onclick="_PGDel(\''+e.id+'\')" style="min-height:48px;padding:6px 10px;font-size:0.7rem;color:var(--muted);border-color:rgba(138,145,120,0.25);">🗑</button>';
        h+='</div>';
        h+='</div>';
      }
      h+='</div>';
    }
    h+='</div>';
    ov.innerHTML=h;
  }
  window._PGLoad=function(id){
    var gal=galLoad();
    var entry=null;
    for(var i=0;i<gal.length;i++)if(gal[i].id===id){entry=gal[i];break;}
    if(!entry)return;
    saveUndo(); // allow UNDO to recover pre-load state (snapshot keeps its grid)
    GRID=entry.grid;
    var szEl=(document.getElementById('PGsz')||{});if(szEl)szEl.textContent=GRID+'×'+GRID;
    // Reinit with loaded data. totalPixels recounts from the loaded art;
    // pixelsSinceSave resets — loading isn't fresh work, so load+SAVE
    // can't cash in strokes painted before the load.
    pixels=[];totalPixels=0;pixelsSinceSave=0;
    for(var r=0;r<GRID;r++){
      pixels[r]=[];
      for(var c=0;c<GRID;c++){pixels[r][c]=(entry.pixels[r]&&entry.pixels[r][c])||null;if(pixels[r][c])totalPixels++;}
    }
    initCanvas();buildPalette();buildTools();render();
    sm('Loaded: '+entry.name);
    var ov=document.getElementById('PGgalOV');if(ov)ov.remove();
    _play('tap');
  };
  window._PGDel=function(id){
    if(!window.confirm||!window.confirm('Delete this painting? This cannot be undone.'))return;
    galDelete(id);
    _renderGallery();
  };
  window._PGSZ=function(s){
    // Switching size wipes the canvas AND the undo stack — confirm when
    // there's unsaved work (one mis-tap used to destroy a painting).
    if(totalPixels>0&&window.confirm&&!window.confirm('Switch to '+s+'×'+s+'? Your current canvas will be cleared.'))return;
    GRID=s;
    var szEl=(document.getElementById('PGsz')||{});if(szEl)szEl.textContent=GRID+'×'+GRID;
    pixelsSinceSave=0;
    initGrid();initCanvas();buildPalette();buildTools();render();
    sm('Canvas: '+GRID+'×'+GRID);
  };

  // ─── COMPOSE: stitch saved squares into a bigger canvas ─────────────
  // State lives on the overlay while it's open. Slots is a 2D array of
  // gallery entries (or null). All squares in a composition must share
  // the same grid size — enforced at assign time with a friendly nudge.
  var cmpRows=2,cmpCols=2,cmpSlots=null,cmpUnit=null;
  var cmpDirty=false; // slot changed since the last paid compose-save — earn gate
  function _cmpInitSlots(){
    cmpSlots=[];
    for(var r=0;r<cmpRows;r++){cmpSlots[r]=[];for(var c=0;c<cmpCols;c++)cmpSlots[r][c]=null;}
  }
  function _cmpAnyAssigned(){
    if(!cmpSlots)return false;
    for(var r=0;r<cmpRows;r++)for(var c=0;c<cmpCols;c++)if(cmpSlots[r][c])return true;
    return false;
  }
  // Build a pixel grid from the assigned slots. Empty slots render as
  // checkerboard dark-gray. Returns {grid, pixels} for saving/export.
  function _cmpBuildPixels(){
    var unit=cmpUnit||16;
    var W=unit*cmpCols,H=unit*cmpRows;
    var out=[];
    for(var y=0;y<H;y++){out[y]=[];for(var x=0;x<W;x++)out[y][x]=null;}
    for(var r=0;r<cmpRows;r++){
      for(var c=0;c<cmpCols;c++){
        var e=cmpSlots[r][c];if(!e)continue;
        for(var yr=0;yr<unit;yr++){
          for(var xc=0;xc<unit;xc++){
            var src=e.pixels[yr]&&e.pixels[yr][xc];
            if(src)out[r*unit+yr][c*unit+xc]=src;
          }
        }
      }
    }
    return{grid:Math.max(W,H),pixels:out,w:W,h:H};
  }
  function _cmpThumb(){
    var unit=cmpUnit||16;
    var tileSize=Math.floor(200/Math.max(cmpRows,cmpCols));
    var W=tileSize*cmpCols,H=tileSize*cmpRows;
    var sc=document.createElement('canvas');sc.width=W;sc.height=H;
    var sx=sc.getContext('2d');sx.imageSmoothingEnabled=false;
    sx.fillStyle='#0d100c';sx.fillRect(0,0,W,H);
    for(var r=0;r<cmpRows;r++){
      for(var c=0;c<cmpCols;c++){
        var e=cmpSlots[r][c];
        var x0=c*tileSize,y0=r*tileSize;
        if(!e){
          // empty slot — checker pattern
          for(var yy=0;yy<tileSize;yy+=6){
            for(var xx=0;xx<tileSize;xx+=6){
              sx.fillStyle=((xx+yy)%12===0)?'#1a1a1a':'#222222';
              sx.fillRect(x0+xx,y0+yy,6,6);
            }
          }
          sx.strokeStyle='rgba(200,168,75,0.25)';sx.lineWidth=1;
          sx.strokeRect(x0+0.5,y0+0.5,tileSize-1,tileSize-1);
          continue;
        }
        var cell=tileSize/unit;
        for(var yr=0;yr<unit;yr++){
          for(var xc=0;xc<unit;xc++){
            var col=e.pixels[yr]&&e.pixels[yr][xc];
            if(col){sx.fillStyle=col;sx.fillRect(x0+Math.floor(xc*cell),y0+Math.floor(yr*cell),Math.ceil(cell),Math.ceil(cell));}
          }
        }
      }
    }
    // Slot separators for clarity
    sx.strokeStyle='rgba(13,16,12,0.75)';sx.lineWidth=2;
    for(var rr=1;rr<cmpRows;rr++){sx.beginPath();sx.moveTo(0,rr*tileSize);sx.lineTo(W,rr*tileSize);sx.stroke();}
    for(var cc=1;cc<cmpCols;cc++){sx.beginPath();sx.moveTo(cc*tileSize,0);sx.lineTo(cc*tileSize,H);sx.stroke();}
    return sc.toDataURL('image/png');
  }
  window._PGCompose=function(){
    var ov=document.getElementById('PGcmpOV');
    if(ov){ov.remove();return;}
    cmpUnit=null;_cmpInitSlots();
    ov=document.createElement('div');
    ov.id='PGcmpOV';
    ov.style.cssText='position:fixed;inset:0;z-index:99993;display:flex;align-items:center;justify-content:center;background:rgba(5,8,4,0.94);backdrop-filter:blur(10px);padding:12px;animation:panelFadeIn 0.3s ease;overflow-y:auto;';
    ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});
    document.body.appendChild(ov);
    _renderCompose();
  };
  function _renderCompose(){
    var ov=document.getElementById('PGcmpOV');if(!ov)return;
    var h='<div style="max-width:440px;width:100%;background:rgba(15,20,12,0.96);border:1px solid rgba(200,168,75,0.35);border-radius:12px;padding:16px;font-family:DM Mono,monospace;max-height:92vh;overflow-y:auto;-webkit-overflow-scrolling:touch;">';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:1.1rem;letter-spacing:0.12em;color:var(--gold);">🧩 COMPOSE</div>';
    h+='<button class="gb" onclick="document.getElementById(\'PGcmpOV\').remove()" style="min-height:48px;padding:6px 14px;">CLOSE</button>';
    h+='</div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.7rem;color:var(--muted);line-height:1.5;margin-bottom:10px;">Stitch saved squares into a bigger canvas. All slots must share the same grid size, the first one you drop in locks the size.</div>';
    // Layout picker
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.7rem;letter-spacing:0.1em;color:var(--sage);margin-bottom:4px;">LAYOUT</div>';
    var layouts=[[2,2],[3,2],[2,3],[3,3],[4,4]];
    h+='<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px;">';
    for(var i=0;i<layouts.length;i++){
      var L=layouts[i],sel=(L[0]===cmpCols&&L[1]===cmpRows);
      h+='<button class="gb" onclick="_PGCmpLay('+L[0]+','+L[1]+')" style="min-height:48px;padding:6px 10px;font-size:0.7rem;letter-spacing:0.05em;'
        +(sel?'background:rgba(200,168,75,0.25);border-color:var(--gold);color:var(--gold);':'')+'">'+L[0]+'×'+L[1]+'</button>';
    }
    h+='</div>';
    // Slot grid preview — tap any slot to assign
    var tileSize=Math.max(48,Math.floor(320/Math.max(cmpCols,cmpRows)));
    h+='<div style="display:grid;grid-template-columns:repeat('+cmpCols+',1fr);gap:2px;margin:0 auto 12px;max-width:'+(tileSize*cmpCols+12)+'px;">';
    for(var r=0;r<cmpRows;r++){
      for(var c=0;c<cmpCols;c++){
        var entry=cmpSlots[r][c];
        var thumb=entry?thumbDataURL(entry,tileSize):'';
        h+='<button class="gb" onclick="_PGCmpSlot('+r+','+c+')" '
          +'style="padding:0;min-height:0;height:'+tileSize+'px;width:'+tileSize+'px;background:'+(entry?'transparent':'rgba(18,22,14,0.6)')+';border:1px dashed rgba(200,168,75,0.35);overflow:hidden;position:relative;">';
        if(entry){
          h+='<img src="'+thumb+'" style="width:100%;height:100%;image-rendering:pixelated;display:block;">';
        } else {
          h+='<div style="color:var(--muted);font-family:Bebas Neue,sans-serif;font-size:0.8rem;">+</div>';
        }
        h+='</button>';
      }
    }
    h+='</div>';
    // Preview render (full composition)
    if(_cmpAnyAssigned()){
      h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.7rem;letter-spacing:0.1em;color:var(--sage);margin-bottom:6px;">PREVIEW '+(cmpUnit?'('+(cmpUnit*cmpCols)+'×'+(cmpUnit*cmpRows)+')':'')+'</div>';
      h+='<img src="'+_cmpThumb()+'" style="display:block;max-width:100%;margin:0 auto 12px;image-rendering:pixelated;border:1px solid rgba(200,168,75,0.2);border-radius:4px;">';
    }
    // Actions
    h+='<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;">';
    h+='<button class="gb" onclick="_PGCmpSave()" style="min-height:48px;padding:10px 14px;color:var(--sage);border-color:var(--sage);" '+(_cmpAnyAssigned()?'':'disabled')+'>SAVE COMPOSITION</button>';
    h+='<button class="gb" onclick="_PGCmpExport()" style="min-height:48px;padding:10px 14px;" '+(_cmpAnyAssigned()?'':'disabled')+'>⬇ PNG</button>';
    h+='<button class="gb" onclick="_PGCmpReset()" style="min-height:48px;padding:10px 14px;color:var(--muted);border-color:rgba(138,145,120,0.25);">RESET</button>';
    h+='</div>';
    h+='</div>';
    ov.innerHTML=h;
  }
  window._PGCmpLay=function(cols,rows){cmpCols=cols;cmpRows=rows;cmpUnit=null;_cmpInitSlots();_renderCompose();};
  window._PGCmpReset=function(){cmpUnit=null;_cmpInitSlots();_renderCompose();};
  window._PGCmpSlot=function(r,c){
    // Open a mini gallery picker inside the compose overlay
    var ov=document.getElementById('PGcmpOV');if(!ov)return;
    var gal=galLoad();
    var h='<div style="max-width:440px;width:100%;background:rgba(15,20,12,0.96);border:1px solid rgba(200,168,75,0.35);border-radius:12px;padding:16px;max-height:92vh;overflow-y:auto;-webkit-overflow-scrolling:touch;font-family:DM Mono,monospace;">';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.9rem;letter-spacing:0.08em;color:var(--gold);">Pick a square for slot ('+(r+1)+','+(c+1)+')</div>';
    h+='<button class="gb" onclick="_renderComposeBack()" style="min-height:48px;padding:6px 14px;">BACK</button>';
    h+='</div>';
    if(gal.length===0){
      h+='<div style="color:var(--muted);text-align:center;font-style:italic;padding:30px 0;font-size:0.72rem;">No saved squares yet. Paint something, hit SAVE, then come back.</div>';
    } else {
      var locked=cmpUnit; // only allow squares of matching grid once one is picked
      h+='<div style="font-family:DM Mono,monospace;font-size:0.7rem;color:var(--muted);margin-bottom:6px;">'+(locked?'Must match '+locked+'×'+locked:'First pick locks the grid size')+'</div>';
      h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
      for(var i=gal.length-1;i>=0;i--){
        var e=gal[i];
        var compatible=!locked||e.grid===locked;
        var thumb=thumbDataURL(e,80);
        h+='<div style="background:rgba(26,31,23,0.7);border:1px solid rgba(74,124,53,0.2);border-radius:8px;padding:6px;display:flex;flex-direction:column;gap:3px;'+(compatible?'':'opacity:0.35;')+'">';
        h+='<img src="'+thumb+'" style="width:100%;aspect-ratio:1;border-radius:4px;image-rendering:pixelated;background:#0d100c;">';
        h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.7rem;color:var(--cream);word-break:break-word;">'+esc(e.name)+'</div>';
        h+='<div style="font-family:DM Mono,monospace;font-size:0.7rem;color:var(--muted);">'+e.grid+'×'+e.grid+'</div>';
        if(compatible){
          h+='<button class="gb" onclick="_PGCmpAssign('+r+','+c+',\''+e.id+'\')" style="min-height:48px;padding:8px;font-size:0.7rem;color:var(--sage);border-color:rgba(122,179,86,0.35);">USE</button>';
        } else {
          h+='<div style="font-family:DM Mono,monospace;font-size:0.7rem;color:var(--muted);text-align:center;padding:6px;">different size</div>';
        }
        h+='</div>';
      }
      h+='</div>';
      if(locked){
        h+='<div style="text-align:center;margin-top:10px;"><button class="gb" onclick="_PGCmpClearSlot('+r+','+c+')" style="min-height:48px;color:var(--muted);border-color:rgba(138,145,120,0.25);">CLEAR SLOT</button></div>';
      }
    }
    h+='</div>';
    ov.innerHTML=h;
  };
  window._renderComposeBack=function(){_renderCompose();};
  window._PGCmpAssign=function(r,c,id){
    var gal=galLoad();
    var e=null;for(var i=0;i<gal.length;i++)if(gal[i].id===id){e=gal[i];break;}
    if(!e)return;
    if(cmpUnit&&e.grid!==cmpUnit)return;
    if(!cmpUnit)cmpUnit=e.grid;
    cmpSlots[r][c]=e;
    cmpDirty=true;
    _renderCompose();
  };
  window._PGCmpClearSlot=function(r,c){
    cmpSlots[r][c]=null;
    cmpDirty=true;
    // If no slots remain, unlock the grid size.
    if(!_cmpAnyAssigned())cmpUnit=null;
    _renderCompose();
  };
  window._PGCmpSave=function(){
    if(!_cmpAnyAssigned())return;
    // Prompt BEFORE the gate — see _PGSV; a cancelled prompt must not
    // burn the shared cooldown or the one-time firstWin flag.
    var defName='Composition '+(new Date()).toLocaleDateString();
    var name=window.prompt?window.prompt('Name this composition:',defName):defName;
    if(name===null)return; // cancelled — abort the save
    name=String(name).slice(0,40)||defName;
    // Same gate key as the regular save — the separate 'pixelgarden_cmp'
    // key let alternating save/composition-save double the earn rate.
    var g=window._lwArtSaveGate&&window._lwArtSaveGate('pixelgarden');
    if(g&&!g.allow){sm('Save again in '+g.secs+'s');return;}
    var built=_cmpBuildPixels();
    // Save with a rectangular grid (width!=height). Store pixels as
    // rows of length w. Existing gallery code treats entry.grid as both
    // rows and cols, so we save with grid = max(w,h) and the pixels
    // extend only to the actual w/h. Load will clip to available data.
    var gal=galLoad();
    gal.push({
      id:'pg_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),
      name:name,
      grid:Math.max(built.w,built.h),
      w:built.w,h:built.h,
      pixels:built.pixels,
      created:Date.now(),
      composition:true
    });
    if(gal.length>GAL_MAX)gal.splice(0,gal.length-GAL_MAX);
    galWrite(gal);
    sm('Composition saved: '+name);
    _playWin();
    // Earn requires a slot change since the last paid compose-save —
    // re-saving the identical composition was a 2-sunbeam/30s trickle farm
    // (same exploit shape the pixelsSinceSave gate closed for _PGSV).
    if(cmpDirty){
      cmpDirty=false;
      if(g&&g.firstWin)_e('game_win');else _e('milestone');
    }
  };
  window._PGCmpExport=function(){
    if(!_cmpAnyAssigned())return;
    var built=_cmpBuildPixels();
    var scale=built.w<=32?16:built.w<=64?8:4;
    var sc=document.createElement('canvas');
    sc.width=built.w*scale;sc.height=built.h*scale;
    var sx=sc.getContext('2d');sx.imageSmoothingEnabled=false;
    sx.fillStyle='#0d100c';sx.fillRect(0,0,sc.width,sc.height);
    for(var y=0;y<built.h;y++){
      for(var x=0;x<built.w;x++){
        var col=built.pixels[y]&&built.pixels[y][x];
        if(col){sx.fillStyle=col;sx.fillRect(x*scale,y*scale,scale,scale);}
      }
    }
    sx.fillStyle='rgba(232,220,200,0.25)';sx.font=(scale*0.8)+'px sans-serif';sx.textAlign='right';
    sx.fillText('Lucid Winds',sc.width-6,sc.height-6);
    var link=document.createElement('a');
    link.download='pixel-compose-'+built.w+'x'+built.h+'-'+Date.now()+'.png';
    link.href=sc.toDataURL('image/png');
    link.click();
    sm('Composition PNG exported');
  };

  _PGSZ(16);
};
})();
