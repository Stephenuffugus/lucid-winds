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
  var hashTimer=0;
  var COLORS=[
    '#2d5020','#7ab356','#6aaa4a','#a0cc80',
    '#3d2a18','#6b4a2a','#8b6a3a','#b8a060',
    '#c47a7a','#d4566a','#e8a0a0','#f0c8c8',
    '#8a6a20','#c8a84b','#e8cc70','#f0e0a0',
    '#2a4a6a','#5b9bd5','#90c0e8','#c0ddf0',
    '#0d100c','#2a2a2a','#808080','#e8dcc8'
  ];

  ms(a,'PIXEL GARDEN · <span id="PGsz">16×16</span>');
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
  canvas.style.cssText='display:block;border-radius:4px;border:1px solid rgba(122,179,86,0.2);margin:6px auto;touch-action:none;image-rendering:pixelated;';
  pan.appendChild(canvas);

  // Palette
  var palEl=document.createElement('div');
  palEl.style.cssText='display:flex;flex-wrap:wrap;gap:3px;justify-content:center;padding:6px 0;';
  pan.appendChild(palEl);

  // Tools
  var toolEl=document.createElement('div');
  toolEl.style.cssText='display:flex;gap:4px;justify-content:center;padding:4px 0;flex-wrap:wrap;';
  pan.appendChild(toolEl);

  mc(a).innerHTML='<button class="gb" onclick="_PGCLR()">CLEAR</button><button class="gb" onclick="_PGUN()">UNDO</button><button class="gb" onclick="_PGSV()">SAVE</button>';

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
      h+='<div onclick="_PGCOL(\''+COLORS[i]+'\')" style="width:26px;height:26px;border-radius:6px;background:'+COLORS[i]+';border:2px solid '+(active?'#e8dcc8':'transparent')+';cursor:pointer;'+(active?'transform:scale(1.1);':'')+'"></div>';
    }
    palEl.innerHTML=h;
  }
  function buildTools(){
    var tools=[['draw','DRAW'],['erase','ERASE'],['fill','FILL'],['pick','PICK']];
    var h='';
    for(var i=0;i<tools.length;i++){
      var active=tool===tools[i][0];
      h+='<button class="gb" onclick="_PGT(\''+tools[i][0]+'\')" style="padding:5px 10px;font-size:0.78rem;letter-spacing:0.05em;'+(active?'background:rgba(122,179,86,0.2);border-color:#7ab356;color:#7ab356;':'')+'">'+tools[i][1]+'</button>';
    }
    h+='<button class="gb" onclick="_PGMIR()" style="padding:5px 10px;font-size:0.78rem;letter-spacing:0.05em;'+(mirrorMode?'background:rgba(200,168,75,0.2);border-color:#c8a84b;color:#c8a84b;':'')+'">MIRROR</button>';
    h+='<button class="gb" onclick="_PGGR()" style="padding:5px 10px;font-size:0.78rem;letter-spacing:0.05em;">GRID</button>';
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
  function setPixel(r,c,color){if(r<0||r>=GRID||c<0||c>=GRID)return;pixels[r][c]=color;}
  function floodFill(sr,sc,fc){
    var target=pixels[sr][sc];if(target===fc)return;
    var stack=[[sr,sc]],visited={};
    while(stack.length>0){
      var p=stack.pop(),pr=p[0],pc=p[1],key=pr+','+pc;
      if(visited[key])continue;visited[key]=true;
      if(pr<0||pr>=GRID||pc<0||pc>=GRID)continue;
      if(pixels[pr][pc]!==target)continue;
      pixels[pr][pc]=fc;
      stack.push([pr-1,pc],[pr+1,pc],[pr,pc-1],[pr,pc+1]);
    }
  }
  function applyTool(r,c){
    if(r<0||r>=GRID||c<0||c>=GRID)return;
    if(tool==='draw'){
      setPixel(r,c,currentColor);
      if(mirrorMode)setPixel(r,GRID-1-c,currentColor);
      totalPixels++;
    } else if(tool==='erase'){
      setPixel(r,c,null);
      if(mirrorMode)setPixel(r,GRID-1-c,null);
    } else if(tool==='fill'){
      floodFill(r,c,currentColor);
      if(mirrorMode)floodFill(r,GRID-1-c,currentColor);
    } else if(tool==='pick'){
      if(pixels[r][c]){currentColor=pixels[r][c];buildPalette();}
    }
    render();
    hashTimer++;
    if(hashTimer>=40){hashTimer=0;_e('progress');}
  }
  function saveUndo(){
    var state=[];for(var r=0;r<GRID;r++)state[r]=pixels[r].slice();
    undoStack.push(state);
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
  window._PGCLR=function(){saveUndo();for(var r=0;r<GRID;r++)for(var c=0;c<GRID;c++)pixels[r][c]=null;render();sm('Cleared');};
  window._PGUN=function(){if(undoStack.length===0){sm('Nothing to undo');return;}pixels=undoStack.pop();render();_play('tap');};
  window._PGSV=function(){
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
    var link=document.createElement('a');
    link.download='pixel-garden-'+GRID+'x'+GRID+'-'+Date.now()+'.png';
    link.href=sc.toDataURL('image/png');
    link.click();
    sm('Saved ('+totalPixels+' strokes)');
    _playWin();_e('milestone');
    _sr('pixelgarden',{w:true,s:totalPixels,sz:GRID});
  };
  window._PGSZ=function(s){
    GRID=s;
    var szEl=document.getElementById('PGsz');if(szEl)szEl.textContent=GRID+'×'+GRID;
    initGrid();initCanvas();buildPalette();buildTools();render();
    sm('Canvas: '+GRID+'×'+GRID);
  };

  _PGSZ(16);
};
})();
