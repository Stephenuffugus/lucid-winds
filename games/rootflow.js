// ═══ ROOT FLOW — Numberlink (connect colored pairs without crossing) ═══
// Original was strict Flow Free (fill every cell) which made Root #1
// effectively unsolvable. Switched to standard Numberlink rules: connect
// each color pair without crossing other paths or other-color dots.
// Cells can be left empty.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

window._gameFns = window._gameFns || {};
window._gameFns.rootflow = function RF(a){
  // Color palette: red, green, blue, gold, orange, purple, cyan, pink, white, brown
  var COLORS=['#C47A7A','#4A7C35','#5B9BD5','#D4A843','#E88A4A','#9B59B6','#5BAFD4','#E8A0BF','#E8DCC8','#8B5A2B'];
  // Hand-designed puzzles. Each verified solvable by drawing the
  // intended solution before placing dots.
  // Format: {size, dots:[[r,c,color], ...], name}
  var PUZZLES=[
    // 4x4 starter — three short paths
    {size:4,name:'Root #1',dots:[
      [0,0,0],[3,3,0],     // red corners
      [0,3,1],[3,0,1],     // green corners
      [1,1,2],[2,2,2]      // blue middle pair
    ]},
    // 5x5 — corner-to-corner
    {size:5,name:'Root #2',dots:[
      [0,0,0],[4,4,0],     // red diagonal
      [0,4,1],[4,0,1],     // green other diagonal
      [2,2,2],[1,3,2]      // blue short
    ]},
    // 5x5 — four pairs
    {size:5,name:'Root #3',dots:[
      [0,1,0],[4,1,0],     // red column
      [0,3,1],[4,3,1],     // green column
      [1,0,2],[1,4,2],     // blue row
      [3,0,3],[3,4,3]      // gold row
    ]},
    // 6x6 — five pairs
    {size:6,name:'Root #4',dots:[
      [0,0,0],[5,5,0],
      [0,5,1],[5,0,1],
      [1,2,2],[4,3,2],
      [2,1,3],[3,4,3],
      [0,3,4],[5,2,4]
    ]},
    // 7x7 — six pairs, corners + scattered
    {size:7,name:'Root #5',dots:[
      [0,0,0],[6,6,0],
      [0,6,1],[6,0,1],
      [2,2,2],[4,4,2],
      [1,4,3],[5,2,3],
      [3,0,4],[3,6,4],
      [2,5,5],[4,1,5]
    ]}
  ];

  var ST; // game state — local var (not the shared window._G API)
  ms(a,'🔗 <strong id="RFn">1</strong>/'+PUZZLES.length+' · <strong id="RFc">0</strong>/<strong id="RFt">0</strong> connected');
  mm(a);
  var pan=document.createElement('div');pan.id='RFpan';
  pan.style.cssText='max-width:480px;margin:0 auto;padding:6px;user-select:none;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb" onclick="_RFR()">🔄 Reset</button> <button class="gb" onclick="_RFnext()">▶ Next</button>';

  function loadPuzzle(idx){
    if(idx<0)idx=0;if(idx>=PUZZLES.length)idx=PUZZLES.length-1;
    var p=PUZZLES[idx];
    ST={pi:idx,size:p.size,name:p.name,
        grid:[], paths:{}, drawing:null, startTime:Date.now(), solved:false};
    for(var r=0;r<p.size;r++){ST.grid[r]=[];for(var c=0;c<p.size;c++)ST.grid[r][c]={color:null,isDot:false};}
    p.dots.forEach(function(d){ST.grid[d[0]][d[1]]={color:d[2],isDot:true};});
    // Track required pair count (number of distinct colors)
    var colorSet={};p.dots.forEach(function(d){colorSet[d[2]]=true;});
    ST.totalPairs=Object.keys(colorSet).length;
    for(var k in colorSet)ST.paths[k]=[];
    var te=document.getElementById('RFt');if(te)te.textContent=ST.totalPairs;
    render();
  }

  function connectedCount(){
    var n=0;
    for(var k in ST.paths){
      var path=ST.paths[k];
      if(path.length<2)continue;
      var first=path[0],last=path[path.length-1];
      if(ST.grid[first[0]][first[1]].isDot&&ST.grid[last[0]][last[1]].isDot)n++;
    }
    return n;
  }

  function checkWin(){
    return connectedCount()===ST.totalPairs;
  }

  function clearColor(color){
    for(var r=0;r<ST.size;r++)for(var c=0;c<ST.size;c++){
      if(ST.grid[r][c].color===color&&!ST.grid[r][c].isDot)ST.grid[r][c].color=null;
    }
    PUZZLES[ST.pi].dots.forEach(function(d){if(d[2]===color)ST.grid[d[0]][d[1]]={color:d[2],isDot:true};});
    ST.paths[color]=[];
  }

  function startPath(r,c){
    var cell=ST.grid[r][c];
    if(!cell.isDot)return;
    clearColor(cell.color);
    ST.drawing={color:cell.color,points:[[r,c]]};
    ST.grid[r][c].color=cell.color;
    render();
  }

  function extendPath(r,c){
    if(!ST.drawing)return;
    if(r<0||r>=ST.size||c<0||c>=ST.size)return;
    var last=ST.drawing.points[ST.drawing.points.length-1];
    if(Math.abs(r-last[0])+Math.abs(c-last[1])!==1)return;
    // Backtrack: revisiting a previous cell in this path truncates it
    for(var i=0;i<ST.drawing.points.length;i++){
      if(ST.drawing.points[i][0]===r&&ST.drawing.points[i][1]===c){
        for(var j=i+1;j<ST.drawing.points.length;j++){
          var p=ST.drawing.points[j];
          ST.grid[p[0]][p[1]].color=null;
        }
        ST.drawing.points.length=i+1;
        render();return;
      }
    }
    var target=ST.grid[r][c];
    // Refuse: cell already painted by another color, or another color's dot
    if(target.color!==null&&target.color!==ST.drawing.color)return;
    if(target.isDot&&target.color!==ST.drawing.color)return;
    ST.drawing.points.push([r,c]);
    ST.grid[r][c].color=ST.drawing.color;
    if(target.isDot&&ST.drawing.points.length>1){
      ST.paths[ST.drawing.color]=ST.drawing.points.slice();
      ST.drawing=null;
      render();
      if(checkWin()&&!ST.solved){
        ST.solved=true;
        var elapsed=((Date.now()-ST.startTime)/1000).toFixed(0);
        _e('game_win');_playWin();sm('🔗 Solved in '+elapsed+'s!');
        _sr('rootflow',{w:true,s:Math.max(100,500-parseInt(elapsed,10)),lv:ST.pi+1});
        // Render result card with auto-advance prompt
        setTimeout(function(){
          if(!document.body.contains(pan))return;
          var card=document.createElement('div');
          card.style.cssText='margin:14px auto;max-width:340px;padding:18px;background:linear-gradient(180deg,rgba(20,28,18,0.97),rgba(13,16,12,0.98));border:2px solid rgba(200,168,75,0.5);border-radius:14px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.6);';
          var nextBtn=ST.pi<PUZZLES.length-1?'<button class="gb" onclick="_RFnext()" style="min-height:48px;padding:10px 20px;background:rgba(122,179,86,0.25);border-color:rgba(122,179,86,0.5);color:var(--sage);">▶ NEXT PUZZLE</button>':'<button class="gb" onclick="_RFR()" style="min-height:48px;padding:10px 20px;">↻ AGAIN</button>';
          card.innerHTML='<div style="font-family:Bebas Neue,sans-serif;font-size:1.5rem;color:var(--gold);letter-spacing:0.12em;margin-bottom:8px;">🌿 SOLVED</div>'
            +'<div style="font-family:DM Mono,monospace;font-size:0.85rem;color:var(--cream);margin-bottom:14px;">'+ST.name+' · '+elapsed+'s</div>'
            +nextBtn;
          pan.appendChild(card);
        },400);
      }
      return;
    }
    render();
  }

  function endPath(){ST.drawing=null;render();}

  function render(){
    var ne=document.getElementById('RFn');if(ne)ne.textContent=ST.pi+1;
    var ce=document.getElementById('RFc');if(ce)ce.textContent=connectedCount();
    var h='';
    h+='<div style="text-align:center;font-family:DM Mono,monospace;font-size:0.85rem;color:var(--cream);padding:6px 0;letter-spacing:0.04em;">'+ST.name+' · Drag from dot to dot</div>';
    h+='<div style="text-align:center;margin:6px 0;">';
    var cellSize=ST.size<=5?54:ST.size<=6?46:40;
    h+='<div style="display:inline-grid;grid-template-columns:repeat('+ST.size+','+cellSize+'px);gap:3px;background:rgba(26,31,23,0.6);border:2px solid rgba(74,124,53,0.3);border-radius:10px;padding:6px;touch-action:none;" id="RFgrid">';
    for(var r=0;r<ST.size;r++){
      for(var c=0;c<ST.size;c++){
        var cell=ST.grid[r][c];
        // Path color uses 8-digit hex (#RRGGBBAA) for translucency
        var bg=cell.color!==null?(COLORS[cell.color]+(cell.isDot?'':'aa')):'rgba(13,16,12,0.55)';
        var radius=cell.isDot?'50%':'5px';
        var style='width:'+cellSize+'px;height:'+cellSize+'px;border-radius:'+radius+';background:'+bg+';display:flex;align-items:center;justify-content:center;cursor:pointer;';
        if(cell.isDot){
          style+='box-shadow:0 0 12px '+COLORS[cell.color]+';border:2.5px solid rgba(0,0,0,0.4);';
          // Highlight which dot is currently being drawn from
          if(ST.drawing&&ST.drawing.color===cell.color&&ST.drawing.points.length>0){
            var p0=ST.drawing.points[0];
            if(p0[0]===r&&p0[1]===c)style+='outline:3px solid var(--gold);outline-offset:2px;';
          }
        }
        h+='<div style="'+style+'" data-r="'+r+'" data-c="'+c+'" onmousedown="_RFMD('+r+','+c+')" onmouseenter="_RFME('+r+','+c+')" onmouseup="_RFMU()" ontouchstart="_RFTS(event,'+r+','+c+')" ontouchmove="_RFTM(event)" ontouchend="_RFMU()"></div>';
      }
    }
    h+='</div></div>';
    h+='<div style="text-align:center;color:var(--muted);font-family:DM Mono,monospace;font-size:0.78rem;padding:6px;letter-spacing:0.04em;">Connect every color pair. No crossings.</div>';
    pan.innerHTML=h;
  }

  window._RFR=function(){loadPuzzle(ST.pi);};
  window._RFnext=function(){loadPuzzle(ST.pi+1);};
  window._RFMD=function(r,c){startPath(r,c);};
  window._RFME=function(r,c){if(ST.drawing)extendPath(r,c);};
  window._RFMU=function(){endPath();};
  window._RFTS=function(e,r,c){e.preventDefault();startPath(r,c);};
  window._RFTM=function(e){
    if(!ST.drawing)return;
    e.preventDefault();
    var t=e.touches[0];
    var el=document.elementFromPoint(t.clientX,t.clientY);
    if(el&&el.getAttribute){
      var r=parseInt(el.getAttribute('data-r'),10),c=parseInt(el.getAttribute('data-c'),10);
      if(!isNaN(r)&&!isNaN(c))extendPath(r,c);
    }
  };

  loadPuzzle(0);
};
})();
