// ═══ GARDEN SUMS — Kakuro (number-logic puzzle) ═══
// White cells hold 1-9. Each run must sum to its clue with no repeats.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

window._gameFns = window._gameFns || {};
window._gameFns.kakuro = function KK(a){

  // Validated puzzles. Format:
  //   0 = black, {a:N,d:N} = clue, -1 = white cell
  // Solutions verified: every run sums correctly with unique digits.
  var PUZZLES=[
    {name:'Beginner #1',size:5,
      grid:[
        [0,        {d:11},   {d:4},   0,       0],
        [{a:6},   -1,       -1,       0,       0],
        [{a:14},  -1,       -1,       {d:3},   0],
        [0,        {a:3,d:4},-1,     -1,       0],
        [0,        {a:4},   -1,      -1,       0]
      ],
      // 6 across: 2+4=6 ✓
      // 14 across: 8+6=14 ✓
      // 3 across (row3 col2-3): 1+2=3 ✓
      // 4 across (row4 col2-3): 3+1=4 ✓
      // 11 down: 2+8+1=11 ✓  (col1, rows 1-3)
      // 4 down: 4+6+... wait let me recheck
      // Actually simpler: I'll build a validated tiny puzzle below.
      solution:[
        [0,0,0,0,0],
        [0,2,4,0,0],
        [0,8,6,0,0],
        [0,0,1,2,0],
        [0,0,3,1,0]
      ]
    }
  ];

  // Rebuild with clean validated puzzle:
  PUZZLES=[
    // Puzzle 1: Simple 5x5
    //   · | 11d 4d | · | ·
    //   6a | _   _  | · | ·
    //   14a| _   _  |3d | ·
    //   ·  |3a/4d _ |_  | ·
    //   ·  |4a   _  |_  | ·
    {name:'Beginner #1',size:5,
      grid:[
        [0,        {d:11},   {d:4},   0,       0],
        [{a:6},   -1,       -1,       0,       0],
        [{a:14},  -1,       -1,       {d:3},   0],
        [0,        {a:3,d:4},-1,     -1,       0],
        [0,        {a:4},   -1,      -1,       0]
      ],
      solution:[
        [0,0,0,0,0],
        [0,2,4,0,0],
        [0,8,6,0,0],
        [0,1,2,0,0],
        [0,3,1,0,0]
      ]
    },
    // Puzzle 2: Simple symmetric 5x5 using smaller runs
    // col1 run rows1-4: 11d = 2+8+1+? nope. Let me design.
    // 6 across rows1: cells(1,1)(1,2)=2+4
    // 14 across rows2: cells(2,1)(2,2)=8+6
    // 3 across rows3 col1+col2: 1+2
    // 4 across rows4 col1+col2: 3+1
    // 11 down col1: 2+8+1=11 ✓
    // 4 down col2: but 4+6+2+1=13 ✗
    // Let me just keep puzzle 1 and add a new one fresh.
    {name:'Beginner #2',size:5,
      grid:[
        [0,       {d:16},   {d:10},   0,       0],
        [{a:17},  -1,       -1,       0,       0],
        [{a:9},   -1,       -1,       {d:4},   0],
        [0,       {a:6,d:5},-1,      -1,       0],
        [0,       {a:7},    -1,      -1,       0]
      ],
      // Row1: 17a = 9+8
      // Row2: 9a = 6+3 → but col2 down: 8+3=... check
      // Try: Row1 [9,8], Row2 [6,3]
      // col1 down 16: 9+6+1=16 ✓ (with row3(col1)=1? no row3(col1)={a:6,d:5})
      // Hmm let me just validate a simpler design
      // Actually scrap — design fresh.
      solution:[
        [0,0,0,0,0],
        [0,9,8,0,0],
        [0,6,3,0,0],
        [0,1,4,0,0],
        [0,0,2,0,0]
      ]
    }
  ];

  // Replace with a single genuinely validated puzzle set:
  PUZZLES=[
    {
      name:'Garden #1', size:5,
      // Layout:
      //   [ 0 ][d11][d3 ][ 0 ][ 0 ]
      //   [a4 ][ _ ][ _ ][ 0 ][ 0 ]
      //   [a10][ _ ][ _ ][d3 ][ 0 ]
      //   [ 0 ][a3/d4][_][ _ ][ 0 ]
      //   [ 0 ][a4 ][ _ ][ _ ][ 0 ]
      // Runs:
      //   4a (row1 c1+c2): 1+3=4, unique ✓
      //   10a (row2 c1+c2): 7+3=10, unique ✓  → wait dup 3 with row1? different runs, OK
      //   3a (row3 c1+c2): 1+2=3 ✓
      //   4a (row4 c1+c2): 3+1=4 ✓
      //   11d (col1 r1-4): 1+7+1+3 = 12 ✗
      // Ugh.
      grid:[
        [0,       {d:9},    {d:7},    0,  0],
        [{a:4},  -1,       -1,        0,  0],
        [{a:8},  -1,       -1,        0,  0],
        [0,       {a:3},   -1,       -1,  0],
        [0,        0,      {a:3},    -1,  0]
      ],
      // 4a: 1+3=4 (digits 1,3)
      // 8a: 3+5=8 (digits 3,5) — but col1 dup with above? col1 is 1,3
      // Actually I keep confusing myself. Let me just hardcode a known valid puzzle.
      solution:[
        [0,0,0,0,0],
        [0,1,3,0,0],
        [0,3,5,0,0],
        [0,0,1,2,0],
        [0,0,0,3,0]
      ]
    }
  ];

  // OK — let me stop fighting this and just use ONE clean validated puzzle.
  // Hand-verified: runs sum correctly, no duplicates in runs.
  PUZZLES=[
    {
      name:'Garden Sums #1', size:4,
      // 4x4 mini kakuro
      //   [ 0  ][d11][d4 ][ 0 ]
      //   [a7  ][ _ ][ _ ][ 0 ]
      //   [a10 ][ _ ][ _ ][ 0 ]
      //   [ 0  ][ 0 ][ 0 ][ 0 ]
      // 7a: row1 c1+c2 sums to 7, unique
      // 10a: row2 c1+c2 sums to 10, unique
      // 11d: col1 r1+r2 sums to 11, unique
      // 4d: col2 r1+r2 sums to 4, unique
      // Solution: r1=[4,3], r2=[7,1]? 4+3=7 ✓, 7+1=8 ✗
      // Try r1=[4,3], r2=[7,3]: dup 3 in col2
      // Try r1=[5,2], r2=[6,? ] for 10: need sum 10 and col2 sums to 4 so c2 r2 = 4-2 = 2. dup 2
      // Try r1=[2,5], r2=[? ,?]: col2 r2 = 4-5 = -1 ✗
      // Try 7a and 10a and 11d/5d:
      // r1=[2,5], r2=[9,?], 9+?=10 so ?=1. col1: 2+9=11 ✓, col2: 5+1=6 (need 5d=6). Adjusting.
      grid:[
        [0,       {d:11},  {d:6},    0],
        [{a:7},  -1,      -1,        0],
        [{a:10}, -1,      -1,        0],
        [0,       0,       0,        0]
      ],
      // r1: 2+5=7 ✓, r2: 9+1=10 ✓, col1: 2+9=11 ✓, col2: 5+1=6 ✓, no dupes in runs ✓
      solution:[
        [0,0,0,0],
        [0,2,5,0],
        [0,9,1,0],
        [0,0,0,0]
      ]
    },
    {
      name:'Garden Sums #2', size:4,
      //   [ 0 ][d3 ][d7 ][d6 ][ 0 ]
      //   [a11][ _ ][ _ ][ _ ][ 0 ]
      //   [a9 ][ _ ][ _ ][ _ ][ 0 ]
      //   [ 0 ][ 0 ][ 0 ][ 0 ][ 0 ]
      //   [ 0 ][ 0 ][ 0 ][ 0 ][ 0 ]
      // 11a: sum 11 with 3 unique digits
      // 9a: sum 9 with 3 unique digits
      // 3d (col1, 2 cells): sum 3 → {1,2}
      // 7d (col2, 2 cells): sum 7
      // 6d (col3, 2 cells): sum 6
      // Try: r1=[1,4,6]=11? yes, r2=[2,3,4]=9? yes. col1: 1+2=3 ✓, col2: 4+3=7 ✓, col3: 6+4=10 ✗
      // Try r1=[1,4,6], r2=[2,3,?] need col3 sum=6 so ?=0. Invalid.
      // Try r1=[2,3,6]=11, r2=[1,4,?]: col3 sum=6 ?=0. no.
      // Try r1=[2,4,5]=11, r2=[1,3,?]: sum9 ?=5, col3: 5+5=10 ✗
      // Try r1=[6,4,1]=11, r2=[?,?,?]=9: col1 3: r2c1=3-6=-3 ✗
      // Let me reduce 11 to something easier. Try 9a and 6a:
      // 9a=9 with 3 uniques: {1,3,5},{1,2,6},{2,3,4}
      // 6a=6 with 3 uniques: {1,2,3}
      // 3d: r1+r2 col1 = 3 → {1,2}
      // Try r1=[1,3,5], r2=[2,? ,?]=6: ?+?=4 with col2=7 so r2c2=7-3=4. Then col3: 5+?=6 so r2c3=1. r2=[2,4,0]? No 0.
      // Trying: r2=[2,1,3]? col2: 3+1=4 not 7. Abandon.
      // Simpler: use different clue set.
      grid:[
        [0,       {d:4},   {d:6},    0],
        [{a:3},  -1,      -1,        0],
        [{a:7},  -1,      -1,        0],
        [0,       0,       0,        0]
      ],
      // 3a: sum 3 with 2 uniques → {1,2}
      // 7a: sum 7 with 2 uniques → many options
      // 4d: sum 4 → {1,3}
      // 6d: sum 6 → {1,5},{2,4}
      // Try r1=[1,2], r2=[3,4]: 1+3=4 ✓ 2+4=6 ✓ no dupes ✓
      solution:[
        [0,0,0,0],
        [0,1,2,0],
        [0,3,4,0],
        [0,0,0,0]
      ]
    },
    {
      name:'Garden Sums #3', size:4,
      grid:[
        [0,       {d:10}, {d:17},   0],
        [{a:16}, -1,     -1,        0],
        [{a:11}, -1,     -1,        0],
        [0,       0,      0,        0]
      ],
      // 16a: 2 uniques sum 16 → {7,9}
      // 11a: 2 uniques sum 11 → {2,9},{3,8},{4,7},{5,6}
      // 10d col1: 2 uniques sum 10 → {1,9},{2,8},{3,7},{4,6}
      // 17d col2: {8,9}
      // Try r1=[7,9], r2=[3,8]: col1 7+3=10 ✓, col2 9+8=17 ✓, runs: {7,9} unique ✓ {3,8} unique ✓
      solution:[
        [0,0,0,0],
        [0,7,9,0],
        [0,3,8,0],
        [0,0,0,0]
      ]
    }
  ];

  var G,SEL,PI,hints,errors,startTime,pencils;

  ms(a,'➕ Puzzle <strong id="KKn">1</strong>/'+PUZZLES.length+' | Errors: <strong id="KKe">0</strong>');
  mm(a);
  var pan=document.createElement('div');
  pan.id='KKpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:6px;user-select:none;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb-new" onclick="_KKN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  function loadPuzzle(idx){
    PI=idx;var p=PUZZLES[idx];
    G={grid:p.grid,sol:p.solution,size:p.size,name:p.name,player:[]};
    pencils=[];
    for(var r=0;r<p.size;r++){
      G.player[r]=[];pencils[r]=[];
      for(var c=0;c<p.size;c++){
        G.player[r][c]=0;
        pencils[r][c]=[false,false,false,false,false,false,false,false,false];
      }
    }
    SEL=null;hints=3;errors=0;startTime=Date.now();
    render();
  }
  function getHRun(r,c){
    var cells=[],sc=c;
    while(sc>0&&G.grid[r][sc-1]===-1)sc--;
    for(var cc=sc;cc<G.size&&G.grid[r][cc]===-1;cc++)cells.push([r,cc]);
    return cells;
  }
  function getVRun(r,c){
    var cells=[],sr=r;
    while(sr>0&&G.grid[sr-1][c]===-1)sr--;
    for(var rr=sr;rr<G.size&&G.grid[rr][c]===-1;rr++)cells.push([rr,c]);
    return cells;
  }
  function checkConflict(r,c,val){
    var hR=getHRun(r,c),vR=getVRun(r,c);
    var hV=[],vV=[];
    hR.forEach(function(p){if(!(p[0]===r&&p[1]===c)&&G.player[p[0]][p[1]]>0)hV.push(G.player[p[0]][p[1]]);});
    if(hV.indexOf(val)>=0)return true;
    vR.forEach(function(p){if(!(p[0]===r&&p[1]===c)&&G.player[p[0]][p[1]]>0)vV.push(G.player[p[0]][p[1]]);});
    if(vV.indexOf(val)>=0)return true;
    return false;
  }
  function autoEliminate(r,c,n){
    var runCells=getHRun(r,c).concat(getVRun(r,c));
    runCells.forEach(function(pos){
      if(pos[0]===r&&pos[1]===c)return;
      pencils[pos[0]][pos[1]][n-1]=false;
    });
  }
  function checkWin(){
    for(var r=0;r<G.size;r++)for(var c=0;c<G.size;c++){
      if(G.grid[r][c]===-1){if(G.player[r][c]!==G.sol[r][c])return;}
    }
    var elapsed=((Date.now()-startTime)/1000).toFixed(1);
    _e('game_win');_playWin();
    var stars=hints===3&&errors===0?3:hints>0&&errors===0?2:1;
    sm('🌿 Solved! '+elapsed+'s · '+stars+'⭐');
    _sr('kakuro',{w:true,s:hints*10+Math.max(0,300-parseInt(elapsed)),stars:stars});
    setTimeout(function(){if(PI<PUZZLES.length-1)loadPuzzle(PI+1);else loadPuzzle(0);},2500);
  }
  function render(){
    var ne=document.getElementById('KKn');if(ne)ne.textContent=PI+1;
    var ee=document.getElementById('KKe');if(ee)ee.textContent=errors;
    var h='';
    h+='<div style="text-align:center;font-family:DM Mono,monospace;font-family:DM Mono,monospace;font-size:0.85rem;color:var(--cream);padding:6px 0;letter-spacing:0.04em;">'+G.name+' · Tap cell, then a number</div>';
    // Grid
    h+='<div style="text-align:center;">';
    h+='<div style="display:inline-grid;gap:1px;background:rgba(74,124,53,0.2);border:2px solid rgba(74,124,53,0.3);border-radius:6px;padding:2px;grid-template-columns:repeat('+G.size+',44px);">';
    for(var r=0;r<G.size;r++){
      for(var c=0;c<G.size;c++){
        var cell=G.grid[r][c];
        if(cell===0){
          h+='<div style="width:44px;height:44px;background:#1a1510;"></div>';
        }else if(typeof cell==='object'&&cell!==null&&(cell.a!==undefined||cell.d!==undefined)){
          h+='<div style="width:44px;height:44px;background:#2C1810;position:relative;overflow:hidden;">';
          h+='<div style="position:absolute;top:-2px;left:-2px;right:-2px;bottom:-2px;border-top:45px solid transparent;border-left:45px solid rgba(200,168,75,0.08);"></div>';
          if(cell.a!==undefined)h+='<div style="position:absolute;top:2px;right:4px;font-size:0.7rem;color:var(--gold);font-weight:700;">'+cell.a+'</div>';
          if(cell.d!==undefined)h+='<div style="position:absolute;bottom:2px;left:4px;font-size:0.7rem;color:var(--gold);font-weight:700;">'+cell.d+'</div>';
          h+='</div>';
        }else{
          var val=G.player[r][c];
          var isSel=SEL&&SEL[0]===r&&SEL[1]===c;
          var hasErr=val>0&&checkConflict(r,c,val);
          var bgcol=hasErr?'rgba(199,80,80,0.3)':(isSel?'rgba(122,179,86,0.35)':'rgba(245,240,225,0.92)');
          var bcol=hasErr?'#C47A7A':(isSel?'#4A7C35':'transparent');
          var txtCol=val>0?(hasErr?'#C47A7A':'#1a1f17'):'#1a1f17';
          var style='width:44px;height:44px;background:'+bgcol+';display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:700;cursor:pointer;border:2px solid '+bcol+';color:'+txtCol+';position:relative;box-sizing:border-box;';
          h+='<div style="'+style+'" onclick="_KKSEL('+r+','+c+')">';
          if(val>0){
            h+=val;
          }else{
            var hasPM=false;for(var pp=0;pp<9;pp++)if(pencils[r][c][pp]){hasPM=true;break;}
            if(hasPM){
              h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);width:100%;height:100%;position:absolute;inset:0;font-size:0.45rem;color:rgba(74,124,53,0.8);">';
              for(var pp2=0;pp2<9;pp2++){
                h+='<div style="display:flex;align-items:center;justify-content:center;">'+(pencils[r][c][pp2]?(pp2+1):'')+'</div>';
              }
              h+='</div>';
            }
          }
          h+='</div>';
        }
      }
    }
    h+='</div></div>';
    h+='<div style="text-align:center;font-family:DM Mono,monospace;font-size:0.7rem;color:var(--muted);padding:6px 0;letter-spacing:0.04em;">Tap = answer · Long-press = pencil mark</div>';
    // Number pad
    h+='<div style="display:flex;gap:5px;justify-content:center;padding:6px 0;flex-wrap:wrap;">';
    for(var n=1;n<=9;n++){
      h+='<div style="width:44px;height:48px;background:rgba(26,31,23,0.6);border:1.5px solid rgba(74,124,53,0.25);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:700;cursor:pointer;color:var(--cream);-webkit-tap-highlight-color:transparent;" onclick="_KKP('+n+')" ontouchstart="_KKSL(event,'+n+')" ontouchend="_KKEL(event,'+n+')">'+n+'</div>';
    }
    h+='<div style="width:44px;height:48px;background:rgba(199,80,80,0.1);border:1.5px solid rgba(199,80,80,0.3);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1rem;cursor:pointer;color:#C47A7A;" onclick="_KKER()">✕</div>';
    h+='</div>';
    // Controls
    h+='<div style="display:flex;gap:6px;justify-content:center;padding:6px 0;flex-wrap:wrap;">';
    h+='<button class="gb" onclick="_KKH()" style="min-height:44px;">💡 Hint ('+hints+')</button>';
    h+='<button class="gb" onclick="_KKN()" style="min-height:44px;">↻ Reset</button>';
    h+='</div>';
    // Puzzle picker
    h+='<div style="display:flex;gap:4px;justify-content:center;padding:4px 0;flex-wrap:wrap;">';
    for(var pi=0;pi<PUZZLES.length;pi++){
      var sel=PI===pi;
      h+='<button class="gb" onclick="_KKL('+pi+')" style="min-height:36px;padding:4px 10px;font-size:0.78rem;letter-spacing:0.06em;'+(sel?'background:rgba(200,168,75,0.2);border-color:rgba(200,168,75,0.5);color:var(--gold);':'')+'">#'+(pi+1)+'</button>';
    }
    h+='</div>';
    pan.innerHTML=h;
  }

  var longTimer=null,isLong=false;
  window._KKN=function(){loadPuzzle(PI||0);};
  window._KKL=function(i){loadPuzzle(i);};
  window._KKSEL=function(r,c){if(G.grid[r][c]!==-1)return;SEL=[r,c];render();};
  window._KKP=function(n){
    if(!SEL)return;var r=SEL[0],c=SEL[1];
    if(G.grid[r][c]!==-1)return;
    if(G.player[r][c]>0&&G.player[r][c]!==n)errors++;
    G.player[r][c]=n;
    pencils[r][c]=[false,false,false,false,false,false,false,false,false];
    autoEliminate(r,c,n);
    _e('progress');
    render();checkWin();
  };
  window._KKTP=function(n){
    if(!SEL)return;var r=SEL[0],c=SEL[1];
    if(G.grid[r][c]!==-1||G.player[r][c]>0)return;
    pencils[r][c][n-1]=!pencils[r][c][n-1];
    render();
  };
  window._KKER=function(){
    if(!SEL)return;var r=SEL[0],c=SEL[1];
    G.player[r][c]=0;
    pencils[r][c]=[false,false,false,false,false,false,false,false,false];
    render();
  };
  window._KKSL=function(e,n){isLong=false;longTimer=setTimeout(function(){isLong=true;window._KKTP(n);},400);};
  window._KKEL=function(e,n){clearTimeout(longTimer);if(!isLong){window._KKP(n);}isLong=false;};
  window._KKH=function(){
    if(hints<=0){sm('No hints left');return;}
    for(var r=0;r<G.size;r++)for(var c=0;c<G.size;c++){
      if(G.grid[r][c]===-1&&G.player[r][c]!==G.sol[r][c]){
        G.player[r][c]=G.sol[r][c];
        pencils[r][c]=[false,false,false,false,false,false,false,false,false];
        autoEliminate(r,c,G.sol[r][c]);
        hints--;render();checkWin();return;
      }
    }
  };

  loadPuzzle(0);
};
})();
