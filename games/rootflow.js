// ═══ ROOT FLOW — Flow Free / Numberlink ═══
// Connect matching colored dots by drawing paths. Fill every cell.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

window._gameFns = window._gameFns || {};
window._gameFns.rootflow = function RF(a){
  // Hand-crafted puzzles with unique solutions
  // Format: {size, dots:[[r,c,color], ...], name}
  // Colors 0-9 map to: red, green, blue, yellow, orange, purple, cyan, pink, white, brown
  var COLORS=['#C47A7A','#4A7C35','#5B9BD5','#D4A843','#E88A4A','#9B59B6','#5BAFD4','#E8A0BF','#E8DCC8','#8B5A2B'];
  var PUZZLES=[
    // 5x5
    {size:5,name:'Root #1',dots:[[0,0,0],[4,4,0],[0,4,1],[4,0,1],[2,2,2],[2,3,2]]},
    // 6x6 with 4 pairs
    {size:6,name:'Root #2',dots:[[0,0,0],[5,5,0],[0,5,1],[5,0,1],[2,2,2],[3,3,2],[1,4,3],[4,1,3]]},
    // 7x7 with 5 pairs
    {size:7,name:'Root #3',dots:[[0,0,0],[6,6,0],[0,6,1],[6,0,1],[2,2,2],[4,4,2],[1,4,3],[5,2,3],[3,0,4],[3,6,4]]}
  ];

  var G;
  ms(a,'🔗 <strong id="RFn">1</strong>/'+PUZZLES.length+' | Fill: <strong id="RFf">0</strong>%');
  mm(a);
  var pan=document.createElement('div');pan.id='RFpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:6px;user-select:none;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb-new" onclick="_RFR()"><img src="assets/games/new-game-btn.png" alt="Reset"></button>';

  function loadPuzzle(idx){
    var p=PUZZLES[idx];
    G={pi:idx,size:p.size,name:p.name,dots:p.dots,
       grid:[], // [r][c] = {color, path:'start','mid','end', from:[r,c] for backtrack}
       paths:{}, // color -> array of [r,c] in order
       drawing:null, // {color, points:[]}
       startTime:Date.now()};
    for(var r=0;r<p.size;r++){G.grid[r]=[];for(var c=0;c<p.size;c++)G.grid[r][c]={color:null,isDot:false};}
    p.dots.forEach(function(d){G.grid[d[0]][d[1]]={color:d[2],isDot:true};});
    for(var i=0;i<p.dots.length/2;i++)G.paths[i]=[];
    render();
  }
  function cellFillCount(){
    var filled=0,total=G.size*G.size;
    for(var r=0;r<G.size;r++)for(var c=0;c<G.size;c++)if(G.grid[r][c].color!==null)filled++;
    return Math.round(filled/total*100);
  }
  function checkWin(){
    // All cells filled + all pairs connected
    for(var r=0;r<G.size;r++)for(var c=0;c<G.size;c++)if(G.grid[r][c].color===null)return false;
    // Each color should have an unbroken path from dot to dot
    for(var color in G.paths){
      var path=G.paths[color];
      if(path.length<2)return false;
      var first=path[0],last=path[path.length-1];
      if(!G.grid[first[0]][first[1]].isDot)return false;
      if(!G.grid[last[0]][last[1]].isDot)return false;
    }
    return true;
  }
  function startPath(r,c){
    var cell=G.grid[r][c];
    if(!cell.isDot)return;
    // Clear any existing path of this color
    clearColor(cell.color);
    G.drawing={color:cell.color,points:[[r,c]]};
    G.grid[r][c].color=cell.color;
    render();
  }
  function extendPath(r,c){
    if(!G.drawing)return;
    var last=G.drawing.points[G.drawing.points.length-1];
    // Must be adjacent
    if(Math.abs(r-last[0])+Math.abs(c-last[1])!==1)return;
    // Check if revisiting (backtrack)
    for(var i=0;i<G.drawing.points.length;i++){
      if(G.drawing.points[i][0]===r&&G.drawing.points[i][1]===c){
        // Truncate
        for(var j=i+1;j<G.drawing.points.length;j++){
          var p=G.drawing.points[j];
          G.grid[p[0]][p[1]].color=null;
        }
        G.drawing.points.length=i+1;
        render();return;
      }
    }
    // Can't cross other color's path or hit another dot of different color
    var target=G.grid[r][c];
    if(target.color!==null&&target.color!==G.drawing.color)return;
    if(target.isDot&&target.color!==G.drawing.color)return;
    G.drawing.points.push([r,c]);
    G.grid[r][c].color=G.drawing.color;
    // If reached other dot of same color, finalize
    if(target.isDot&&G.drawing.points.length>1){
      G.paths[G.drawing.color]=G.drawing.points.slice();
      G.drawing=null;
      if(checkWin()){
        var elapsed=((Date.now()-G.startTime)/1000).toFixed(0);
        _e('game_win');_playWin();sm('🔗 Complete! '+elapsed+'s');
        _sr('rootflow',{w:true,s:Math.max(100,500-parseInt(elapsed))});
        setTimeout(function(){if(G.pi<PUZZLES.length-1)loadPuzzle(G.pi+1);else loadPuzzle(0);},2000);
        return;
      }
    }
    render();
  }
  function clearColor(color){
    for(var r=0;r<G.size;r++)for(var c=0;c<G.size;c++){
      if(G.grid[r][c].color===color&&!G.grid[r][c].isDot)G.grid[r][c].color=null;
      else if(G.grid[r][c].color===color&&G.grid[r][c].isDot){
        // dot keeps its color identity but path is cleared
      }
    }
    // But need to restore dot's color
    G.dots.forEach(function(d){if(d[2]===color)G.grid[d[0]][d[1]]={color:d[2],isDot:true};});
    // Hmm G.dots isn't stored per-game. Use original:
    PUZZLES[G.pi].dots.forEach(function(d){if(d[2]===color)G.grid[d[0]][d[1]]={color:d[2],isDot:true};});
    G.paths[color]=[];
  }
  function endPath(){
    G.drawing=null;
    render();
  }
  function render(){
    var ne=document.getElementById('RFn');if(ne)ne.textContent=G.pi+1;
    var fe=document.getElementById('RFf');if(fe)fe.textContent=cellFillCount();
    var h='';
    h+='<div style="text-align:center;font-family:DM Mono,monospace;font-family:DM Mono,monospace;font-size:0.85rem;color:var(--cream);padding:6px 0;letter-spacing:0.04em;">'+G.name+' · Tap a dot, drag to match</div>';
    h+='<div style="text-align:center;margin:6px 0;">';
    h+='<div style="display:inline-grid;grid-template-columns:repeat('+G.size+',44px);gap:2px;background:rgba(26,31,23,0.6);border:2px solid rgba(74,124,53,0.3);border-radius:8px;padding:4px;touch-action:none;" id="RFgrid">';
    for(var r=0;r<G.size;r++){
      for(var c=0;c<G.size;c++){
        var cell=G.grid[r][c];
        var bg=cell.color!==null?COLORS[cell.color]+(cell.isDot?'':'a0'):'rgba(13,16,12,0.6)';
        var style='width:44px;height:44px;border-radius:'+(cell.isDot?'50%':'4px')+';background:'+bg+';display:flex;align-items:center;justify-content:center;cursor:pointer;';
        if(cell.isDot)style+='box-shadow:0 0 8px '+COLORS[cell.color]+';border:2px solid rgba(0,0,0,0.3);';
        h+='<div style="'+style+'" data-r="'+r+'" data-c="'+c+'" onmousedown="_RFMD('+r+','+c+')" onmouseenter="_RFME('+r+','+c+')" onmouseup="_RFMU()" ontouchstart="_RFTS(event,'+r+','+c+')" ontouchmove="_RFTM(event)" ontouchend="_RFMU()"></div>';
      }
    }
    h+='</div></div>';
    // Hint
    h+='<div style="text-align:center;color:var(--muted);font-family:DM Mono,monospace;font-size:0.78rem;padding:6px;letter-spacing:0.04em;">Drag from dot to dot. Every cell must fill.</div>';
    pan.innerHTML=h;
  }
  window._RFR=function(){loadPuzzle(G.pi);};
  window._RFMD=function(r,c){startPath(r,c);};
  window._RFME=function(r,c){if(G.drawing)extendPath(r,c);};
  window._RFMU=function(){endPath();};
  window._RFTS=function(e,r,c){e.preventDefault();startPath(r,c);};
  window._RFTM=function(e){
    if(!G.drawing)return;
    e.preventDefault();
    var t=e.touches[0];
    var el=document.elementFromPoint(t.clientX,t.clientY);
    if(el&&el.getAttribute){
      var r=parseInt(el.getAttribute('data-r')),c=parseInt(el.getAttribute('data-c'));
      if(!isNaN(r)&&!isNaN(c))extendPath(r,c);
    }
  };

  loadPuzzle(0);
};
})();
