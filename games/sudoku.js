// ═══ LUCID WINDS — Sudoku (Soil Grid) ═══
// Real-quality generator with uniqueness guarantee:
//   1. Build a full valid solution via randomized backtracking
//   2. Remove cells one at a time; after each removal run a solver
//      that COUNTS solutions. If count != 1, restore the cell.
//   3. Continue until target clue count reached or no more safe
//      removals remain.
// This guarantees every puzzle has exactly one correct answer,
// matching the standard set by Sudoku.com / NYT Sudoku.
//
// Difficulty grading uses a basic technique cascade: if naked
// singles alone solve the puzzle it's Easy; needing hidden singles
// = Medium; needing real backtracking = Hard.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,_setDiff=G.setDiff,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;

// ── Solver: counts solutions, stops at 2 (we only care unique vs. not) ──
function solveCount(b,limit){
  var board=b.slice();
  var count=0;
  function rec(){
    if(count>=limit)return;
    var pos=-1;
    for(var i=0;i<81;i++){if(!board[i]){pos=i;break;}}
    if(pos===-1){count++;return;}
    var r=Math.floor(pos/9),c=pos%9,br=Math.floor(r/3)*3,bc=Math.floor(c/3)*3;
    var used=0;
    for(var i=0;i<9;i++){
      if(board[r*9+i])used|=1<<board[r*9+i];
      if(board[i*9+c])used|=1<<board[i*9+c];
    }
    for(var dr=0;dr<3;dr++)for(var dc=0;dc<3;dc++){
      var v=board[(br+dr)*9+(bc+dc)];if(v)used|=1<<v;
    }
    for(var n=1;n<=9;n++){
      if(used&(1<<n))continue;
      board[pos]=n;
      rec();
      if(count>=limit){board[pos]=0;return;}
      board[pos]=0;
    }
  }
  rec();
  return count;
}

// ── Generate a complete valid solved board ──
function genSolved(){
  var b=new Array(81).fill(0);
  function vl(p,n){
    var r=Math.floor(p/9),c=p%9,br=Math.floor(r/3)*3,bc=Math.floor(c/3)*3;
    for(var i=0;i<9;i++)if(b[r*9+i]===n||b[i*9+c]===n)return false;
    for(var dr=0;dr<3;dr++)for(var dc=0;dc<3;dc++)if(b[(br+dr)*9+(bc+dc)]===n)return false;
    return true;
  }
  function rec(p){
    if(p>=81)return true;
    var nums=sh([1,2,3,4,5,6,7,8,9]);
    for(var i=0;i<9;i++){
      if(vl(p,nums[i])){
        b[p]=nums[i];
        if(rec(p+1))return true;
        b[p]=0;
      }
    }
    return false;
  }
  rec(0);
  return b;
}

// ── Try to solve with naked singles only. Returns true if fully solved. ──
function solveByNakedSingles(b){
  var board=b.slice();
  var changed=true;
  while(changed){
    changed=false;
    for(var i=0;i<81;i++){
      if(board[i])continue;
      var r=Math.floor(i/9),c=i%9,br=Math.floor(r/3)*3,bc=Math.floor(c/3)*3;
      var used=0;
      for(var j=0;j<9;j++){
        if(board[r*9+j])used|=1<<board[r*9+j];
        if(board[j*9+c])used|=1<<board[j*9+c];
      }
      for(var dr=0;dr<3;dr++)for(var dc=0;dc<3;dc++){
        var v=board[(br+dr)*9+(bc+dc)];if(v)used|=1<<v;
      }
      var only=0,cnt=0;
      for(var n=1;n<=9;n++){
        if(!(used&(1<<n))){only=n;cnt++;}
      }
      if(cnt===1){board[i]=only;changed=true;}
    }
  }
  for(var i=0;i<81;i++)if(!board[i])return false;
  return true;
}

// ── Try with naked + hidden singles. ──
function solveByHiddenSingles(b){
  var board=b.slice();
  var changed=true;
  while(changed){
    changed=false;
    // First do naked singles pass
    for(var i=0;i<81;i++){
      if(board[i])continue;
      var r=Math.floor(i/9),c=i%9,br=Math.floor(r/3)*3,bc=Math.floor(c/3)*3;
      var used=0;
      for(var j=0;j<9;j++){
        if(board[r*9+j])used|=1<<board[r*9+j];
        if(board[j*9+c])used|=1<<board[j*9+c];
      }
      for(var dr=0;dr<3;dr++)for(var dc=0;dc<3;dc++){
        var v=board[(br+dr)*9+(bc+dc)];if(v)used|=1<<v;
      }
      var only=0,cnt=0;
      for(var n=1;n<=9;n++){if(!(used&(1<<n))){only=n;cnt++;}}
      if(cnt===1){board[i]=only;changed=true;}
    }
    // Hidden singles: for each unit, find numbers with exactly one valid cell
    if(changed)continue;
    for(var unit=0;unit<27;unit++){
      var cells=[];
      if(unit<9){for(var k=0;k<9;k++)cells.push(unit*9+k);}
      else if(unit<18){var col=unit-9;for(var k=0;k<9;k++)cells.push(k*9+col);}
      else {var box=unit-18,br=Math.floor(box/3)*3,bc=(box%3)*3;for(var dr=0;dr<3;dr++)for(var dc=0;dc<3;dc++)cells.push((br+dr)*9+(bc+dc));}
      for(var n=1;n<=9;n++){
        var spot=-1,count=0,already=false;
        for(var ci=0;ci<9;ci++){
          if(board[cells[ci]]===n){already=true;break;}
        }
        if(already)continue;
        for(var ci=0;ci<9;ci++){
          var p=cells[ci];if(board[p])continue;
          var r=Math.floor(p/9),c=p%9,br2=Math.floor(r/3)*3,bc2=Math.floor(c/3)*3;
          var used=0;
          for(var j=0;j<9;j++){
            if(board[r*9+j])used|=1<<board[r*9+j];
            if(board[j*9+c])used|=1<<board[j*9+c];
          }
          for(var dr=0;dr<3;dr++)for(var dc=0;dc<3;dc++){
            var v=board[(br2+dr)*9+(bc2+dc)];if(v)used|=1<<v;
          }
          if(!(used&(1<<n))){spot=p;count++;if(count>1)break;}
        }
        if(count===1){board[spot]=n;changed=true;}
      }
    }
  }
  for(var i=0;i<81;i++)if(!board[i])return false;
  return true;
}

// ── Grade puzzle by minimum technique needed ──
function gradePuzzle(b){
  if(solveByNakedSingles(b))return 'easy';
  if(solveByHiddenSingles(b))return 'medium';
  return 'hard';
}

// ── Generate a puzzle for the requested target clue count ──
// Returns {puzzle, solution, grade}. Iterates until we land in the
// target band, or returns whatever we got after maxAttempts.
function genPuzzle(targetClues){
  var solution=genSolved();
  var puzzle=solution.slice();
  // Symmetric removal: remove cell pairs (i, 80-i) when possible.
  // Improves visual balance and typically keeps uniqueness longer.
  var positions=[];
  for(var i=0;i<81;i++)positions.push(i);
  positions=sh(positions);
  var clueCount=81;
  for(var pi=0;pi<positions.length&&clueCount>targetClues;pi++){
    var p=positions[pi];
    if(!puzzle[p])continue;
    var saved=puzzle[p];
    puzzle[p]=0;
    if(solveCount(puzzle,2)!==1){
      puzzle[p]=saved; // restore — would lose uniqueness
    } else {
      clueCount--;
    }
  }
  return {puzzle:puzzle,solution:solution,grade:gradePuzzle(puzzle),clues:clueCount};
}

function GU(a){
  var bd=new Array(81).fill(0),sol=new Array(81).fill(0),fix=new Array(81).fill(false),sel=-1,_fc=0;
  var _grade='medium',_startTs=0,_solvedTs=0,_won=false;
  // 2026-07-03 table-stakes pass: pencil marks, visible timer, best time per
  // difficulty, and the always-on mistake reveal became a toggle.
  var notes=new Array(81).fill(0),noteMode=false,timerIv=0,_lastWipe=null;
  var showErr=true;try{showErr=localStorage.getItem('lw_sudoku_err')!=='off';}catch(e){}
  _setDiff('medium');ms(a);mm(a);
  if(!document.getElementById('u-notes-style')){var _us=document.createElement('style');_us.id='u-notes-style';
    _us.textContent='.unwrap{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);width:100%;height:100%;font-size:clamp(7px,1.9vw,10px);line-height:1;color:var(--sage);opacity:.9;font-family:"DM Mono",monospace;place-items:center;padding:1px;box-sizing:border-box}'
      +'.utb{display:flex;gap:10px;justify-content:center;width:min(calc(100vw - 32px),400px);margin:4px auto 0}'
      +'.utbb{flex:1;min-height:48px;border-radius:12px;border:1.5px solid rgba(74,124,53,.25);background:rgba(26,31,23,.65);color:var(--cream);font-family:"DM Mono",monospace;font-size:.72rem;letter-spacing:.05em;cursor:pointer;-webkit-tap-highlight-color:transparent}'
      +'.utbb.on{border-color:#C8A84B;background:rgba(200,168,75,.16);color:#f0e2c0}'
      // portal parity: shared.css lacks these app-side rules (highlights + done chips)
      +'.uc.uh{background:rgba(74,124,53,.08)}'
      +'.uc.un{background:rgba(200,168,75,.16);color:var(--gold);text-shadow:0 0 10px rgba(200,168,75,.25)}'
      +'.upb.ud{opacity:.3}'
      +'.upb.ud::after{content:"\u2713";position:absolute;top:2px;right:4px;font-size:.5rem;color:var(--sage);font-family:"DM Mono",monospace}'
      // done chips stay TAPPABLE (the app rule sets pointer-events:none, which
      // silently killed penciling a completed digit and gave no feedback when
      // a 9th copy was wrong with MISTAKES off)
      +'.up .upb.ud{pointer-events:auto}';
    document.head.appendChild(_us);}
  var gd=document.createElement('div');gd.className='ug';gd.id='Ug';a.appendChild(gd);
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){if(timerIv){clearInterval(timerIv);timerIv=0;}});
  var tb=document.createElement('div');tb.className='utb';
  tb.innerHTML='<div class="utbb" style="flex:0 0 auto;min-width:82px;display:flex;align-items:center;justify-content:center;pointer-events:none;border-color:rgba(74,124,53,.18);">\u23f1\ufe0f&nbsp;<span id="Ut">0:00</span></div><button class="utbb" id="Upen" onclick="_UP()">\u270f\ufe0f NOTES</button><button class="utbb" id="Uerr" onclick="_UE()">\ud83d\udc41 MISTAKES</button>';
  a.appendChild(tb);
  var pd=document.createElement('div');pd.className='up';pd.id='Upad';a.appendChild(pd);
  mc(a).innerHTML='<select class="gsl" id="Ud" onchange="_UG()"><option value="40">Easy</option><option value="32" selected>Medium</option><option value="26">Hard</option></select> <button class="gb" onclick="_UG()">↻ New Game</button>';
  function fmtT(ms2){var t=Math.max(0,Math.floor(ms2/1000)),m=Math.floor(t/60),sx=t%60;return m+':'+(sx<10?'0':'')+sx;}
  // guard on gd (created per-mount, actually disconnected on game switch —
  // `a` is the app's permanent mount div, so a.isConnected never goes false)
  function tick(){if(!gd.isConnected){clearInterval(timerIv);timerIv=0;return;}if(_won||!_startTs)return;var el=document.getElementById('Ut');if(el)el.textContent=fmtT(Date.now()-_startTs);}
  function toolbar(){var pe=document.getElementById('Upen');if(pe)pe.className='utbb'+(noteMode?' on':'');var ee=document.getElementById('Uerr');if(ee){ee.className='utbb'+(showErr?' on':'');ee.innerHTML='\ud83d\udc41 MISTAKES: '+(showErr?'ON':'OFF');}}
  function gen(){
    var target=parseInt((document.getElementById('Ud')||{}).value,10)||32;
    _grade=target>=40?'easy':target>=32?'medium':'hard';
    _setDiff(_grade);
    var result=genPuzzle(target);
    bd=result.puzzle.slice();
    sol=result.solution.slice();
    for(var i=0;i<81;i++)fix[i]=bd[i]!==0;
    notes=new Array(81).fill(0);
    _fc=0;_won=false;_startTs=Date.now();_solvedTs=0;
    if(timerIv)clearInterval(timerIv);timerIv=setInterval(tick,500);tick();
  }
  // Count how many of each digit 1-9 are placed (placement count, not
  // correctness — a correctness count would leak errors with MISTAKES off)
  function digitCounts(){
    var c=[0,0,0,0,0,0,0,0,0,0];
    for(var i=0;i<81;i++){if(bd[i])c[bd[i]]++;}
    return c;
  }
  // True if cell j shares row, column, or 3x3 box with cell i
  function related(i,j){
    if(i===j)return false;
    var r1=Math.floor(i/9),c1=i%9,b1r=Math.floor(r1/3),b1c=Math.floor(c1/3);
    var r2=Math.floor(j/9),c2=j%9,b2r=Math.floor(r2/3),b2c=Math.floor(c2/3);
    return r1===r2||c1===c2||(b1r===b2r&&b1c===b2c);
  }
  function renderPad(){
    var counts=digitCounts();
    var h='';
    for(var n=1;n<=9;n++){
      var done=counts[n]>=9;
      h+='<div class="upb'+(done?' ud':'')+'" onclick="_UN('+n+')">'+n+'</div>';
    }
    h+='<div class="upb" onclick="_UN(0)" style="color:var(--muted)">✕</div>';
    pd.innerHTML=h;
  }
  function rn(){
    gd.innerHTML='';
    var selVal=sel>=0?bd[sel]:0;
    for(var i=0;i<81;i++){
      var d=document.createElement('div');
      var cls='uc';
      if(fix[i])cls+=' uf';
      // Highlight order matters: row/col/box tint first, then same-number, then selected
      if(sel>=0&&related(sel,i))cls+=' uh';
      if(selVal&&bd[i]===selVal)cls+=' un';
      if(i===sel)cls+=' us';
      if(showErr&&bd[i]&&!fix[i]&&bd[i]!==sol[i])cls+=' ue';
      d.className=cls;
      if(!bd[i]&&notes[i]){
        var nh='<div class="unwrap">';
        for(var nn=1;nn<=9;nn++)nh+='<span>'+((notes[i]&(1<<nn))?nn:'')+'</span>';
        d.innerHTML=nh+'</div>';
      } else d.textContent=bd[i]||'';
      d.setAttribute('data-i',i);
      if(!fix[i])d.onclick=function(){sel=parseInt(this.getAttribute('data-i'),10);rn();};
      else d.onclick=function(){sel=parseInt(this.getAttribute('data-i'),10);rn();}; // fixed cells also select for same-number highlight
      gd.appendChild(d);
    }
    renderPad();toolbar();
    if(_won)return;
    var done=true;
    for(var i=0;i<81;i++)if(bd[i]!==sol[i]){done=false;break;}
    if(done&&bd[0]){
      _won=true;_solvedTs=Date.now();
      _e('game_win');if(_playWin)_playWin();_sr('sudoku',{w:true,s:81});
      _sudokuVictory();
    }
  }
  function _sudokuVictory(){
    var secs=Math.max(1,Math.round((_solvedTs-_startTs)/1000));
    var mm=Math.floor(secs/60),ss=secs%60;
    var timeStr=mm+':'+(ss<10?'0':'')+ss;
    var gradeLbl=_grade.charAt(0).toUpperCase()+_grade.slice(1);
    // best time per difficulty, persisted
    var bk='lw_sudoku_bt_'+_grade,prevBest=0;
    try{prevBest=parseInt(localStorage.getItem(bk),10)||0;}catch(e){}
    var isRecord=!prevBest||secs<prevBest;
    if(isRecord){try{localStorage.setItem(bk,String(secs));}catch(e){}}
    var bestStr=(function(v){var m2=Math.floor(v/60),s2=v%60;return m2+':'+(s2<10?'0':'')+s2;})(isRecord?secs:prevBest);
    // Wave-light the board once
    var cells=gd.querySelectorAll('.uc');
    for(var ci=0;ci<cells.length;ci++){
      (function(cell,idx){setTimeout(function(){cell.style.background='rgba(122,179,86,0.55)';cell.style.color='#fff0d6';cell.style.transition='all .25s ease';setTimeout(function(){cell.style.background='';cell.style.color='';},700);},idx*8);})(cells[ci],ci);
    }
    setTimeout(function(){
      var ov=document.createElement('div');
      ov.style.cssText='position:fixed;inset:0;z-index:9999;background:radial-gradient(ellipse at 50% 40%,rgba(122,179,86,0.32) 0%,rgba(13,16,12,0.94) 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;animation:uSolveLine .3s ease;font-family:Georgia,serif;';
      ov.innerHTML=
        '<div style="font-size:5rem;line-height:1;margin-bottom:14px;animation:uSolvePop .7s cubic-bezier(.18,1.5,.3,1);filter:drop-shadow(0 0 24px rgba(122,179,86,0.8));">🌿</div>'+
        '<div style="font-size:2.4rem;font-weight:700;color:#7ab356;letter-spacing:0.06em;text-shadow:0 0 22px rgba(122,179,86,0.7);animation:uSolvePop .7s cubic-bezier(.18,1.5,.3,1);">SOLVED</div>'+
        '<div style="font-style:italic;font-size:0.9rem;color:#e8dcc8;margin-top:10px;animation:uSolveLine .5s ease-out .4s both;">'+gradeLbl+' · '+timeStr+(isRecord?'  ·  <span style="color:#c8a84b;font-style:normal;">\u2605 NEW BEST</span>':'  ·  best '+bestStr)+'</div>'+
        '<button onclick="this.parentElement.remove();_UG()" style="margin-top:26px;min-height:46px;padding:10px 26px;font-family:Georgia,serif;font-weight:700;font-size:0.85rem;background:linear-gradient(180deg,rgba(122,179,86,0.35),rgba(74,124,53,0.45));border:2px solid #7ab356;color:#f5ebd0;border-radius:8px;letter-spacing:0.05em;cursor:pointer;animation:uSolveLine .5s ease-out .7s both;">↻ Next Puzzle</button>';
      ov.onclick=function(ev){if(ev.target===ov)ov.remove();};
      document.body.appendChild(ov);
    }, cells.length*8 + 200);
  }
  window._UN=function(n){
    if(_won)return;
    if(sel<0||fix[sel])return;
    _play('tap');
    if(noteMode&&n){                      // pencil in / rub out a candidate
      if(!bd[sel])notes[sel]^=(1<<n);
      rn();return;
    }
    var prev=bd[sel];bd[sel]=n;
    if(n){
      // auto-erase the digit from related pencil marks, but keep a one-step
      // snapshot: erasing this same placement restores the wiped notes
      var wiped=[];
      if(notes[sel])wiped.push([sel,notes[sel]]);
      notes[sel]=0;
      for(var j=0;j<81;j++)if(related(sel,j)&&(notes[j]&(1<<n))){wiped.push([j,1<<n]);notes[j]&=~(1<<n);}
      _lastWipe={cell:sel,digit:n,wiped:wiped};
    } else {
      if(_lastWipe&&_lastWipe.cell===sel&&prev===_lastWipe.digit){
        for(var w=0;w<_lastWipe.wiped.length;w++)notes[_lastWipe.wiped[w][0]]|=_lastWipe.wiped[w][1];
      } else notes[sel]=0;
      _lastWipe=null;
    }
    if(n&&n===sol[sel]&&prev!==sol[sel]){_fc++;if(_fc%9===0)_e('progress');}
    rn();
  };
  window._UP=function(){noteMode=!noteMode;_play('tap');toolbar();};
  window._UE=function(){showErr=!showErr;try{localStorage.setItem('lw_sudoku_err',showErr?'on':'off');}catch(e){}_play('tap');rn();};
  window._UG=function(){
    sel=-1;_fc=0;_won=false;
    sm('Generating…');
    setTimeout(function(){gen();sm('');rn();},20);
  };
  _UG();
}

window._gameFns.sudoku=GU;
})();
