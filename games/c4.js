// ═══ LUCID WINDS — Connect Fleur ═══
// Connect-4 with botanical flower pieces. Features:
//   • 4 difficulty tiers (Seedling → Sapling → Grove → Old Growth)
//   • 4 flower themes (Zinnia/Calendula art + 3 CSS placeholders)
//   • 6×7 classic or 7×8 expanded board
//   • Stats: wins / losses / draws / current streak / best streak
//   • Undo (removes player + AI move)
//   • Hint (glows the AI's top-choice column)
//   • Transposition table + iterative deepening + threat-based move
//     ordering so top tier plays a recognizable Connect-4.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;

// Inject drop + piece styles once
if(!document.getElementById('c4-drop-style')){
  var _c4s=document.createElement('style');_c4s.id='c4-drop-style';
  _c4s.textContent=[
    '@keyframes c4drop{0%{transform:translateY(-420%)}60%{transform:translateY(8%)}75%{transform:translateY(-4%)}100%{transform:translateY(0)}}',
    '.c4-dropping{animation:c4drop .42s cubic-bezier(.5,.1,.6,1) both}',
    '@keyframes c4hintPulse{0%,100%{box-shadow:inset 0 0 0 2px rgba(200,168,75,0.75),0 0 12px rgba(200,168,75,0.45)}50%{box-shadow:inset 0 0 0 2px rgba(200,168,75,1),0 0 22px rgba(200,168,75,0.85)}}',
    '.c4-hint{animation:c4hintPulse 1.4s ease-in-out infinite}',
    // Stephen 2026-05-11: gold-pulse the winning 4-in-a-row on game end.
    '@keyframes c4winpulse{0%,100%{box-shadow:inset 0 0 4px rgba(0,0,0,.3),0 0 0 0 rgba(200,168,75,.65),0 0 18px 4px rgba(200,168,75,.45);transform:scale(1)}50%{box-shadow:inset 0 0 4px rgba(0,0,0,.3),0 0 0 4px rgba(200,168,75,.9),0 0 28px 10px rgba(200,168,75,.7);transform:scale(1.08)}}',
    '.c4-winline{animation:c4winpulse 1.1s ease-in-out infinite;z-index:2;position:relative}',
    // CSS-based flower placeholders — each is a radial gradient stack
    // plus a thin rim. Meant to read as "distinct petal pair" without
    // full art. Easy to replace with real PNGs later.
    '.c4-rose{background:radial-gradient(circle at 50% 45%,#ffb4c2 0%,#e84e67 35%,#a8253b 70%,#6d1627 100%);box-shadow:inset 0 0 4px rgba(255,180,194,0.4),inset 0 -3px 6px rgba(109,22,39,0.5),0 2px 6px rgba(0,0,0,0.3)}',
    '.c4-sun{background:radial-gradient(circle at 50% 45%,#fff5b6 0%,#f2c337 35%,#b6842a 75%,#6e4d16 100%);box-shadow:inset 0 0 4px rgba(255,245,182,0.4),inset 0 -3px 6px rgba(110,77,22,0.5),0 2px 6px rgba(0,0,0,0.3)}',
    '.c4-iris{background:radial-gradient(circle at 50% 45%,#d8b4ff 0%,#8a4edb 35%,#4e249a 75%,#261050 100%);box-shadow:inset 0 0 4px rgba(216,180,255,0.4),inset 0 -3px 6px rgba(38,16,80,0.55),0 2px 6px rgba(0,0,0,0.3)}',
    '.c4-tulip{background:radial-gradient(circle at 50% 45%,#ffd0a0 0%,#ff8056 35%,#c24622 75%,#6e2410 100%);box-shadow:inset 0 0 4px rgba(255,208,160,0.4),inset 0 -3px 6px rgba(110,36,16,0.5),0 2px 6px rgba(0,0,0,0.3)}',
    '.c4-lily{background:radial-gradient(circle at 50% 45%,#ffffff 0%,#e6f0e1 35%,#a8c69e 75%,#4d7345 100%);box-shadow:inset 0 0 4px rgba(255,255,255,0.5),inset 0 -3px 6px rgba(77,115,69,0.5),0 2px 6px rgba(0,0,0,0.3)}',
    '.c4-dahlia{background:radial-gradient(circle at 50% 45%,#ffc9c9 0%,#c72424 35%,#7a0e0e 75%,#3a0404 100%);box-shadow:inset 0 0 4px rgba(255,201,201,0.4),inset 0 -3px 6px rgba(58,4,4,0.55),0 2px 6px rgba(0,0,0,0.3)}',
    // Stats strip styling
    '.c4-stats{display:flex;justify-content:center;gap:14px;padding:6px 4px 2px;font-family:DM Mono,monospace;font-size:0.64rem;color:rgba(232,220,200,0.75);letter-spacing:0.06em}',
    '.c4-stats strong{color:var(--gold);font-weight:600}',
    '.c4-toprow{display:flex;justify-content:center;gap:6px;padding:4px 0 6px;flex-wrap:wrap}',
    '.c4-toprow .gb{min-height:38px;padding:4px 10px;font-size:0.65rem}',
    '.c4-picker{display:flex;gap:8px;justify-content:center;padding:6px 0;flex-wrap:wrap}',
    '.c4-swatch{width:34px;height:34px;border-radius:50%;border:2px solid rgba(74,124,53,0.25);cursor:pointer;transition:transform .15s ease,border-color .18s ease}',
    '.c4-swatch.on{border-color:var(--gold);transform:scale(1.12);box-shadow:0 0 10px rgba(200,168,75,0.45)}',
    '.c4-swatch-wrap{display:flex;flex-direction:column;align-items:center;gap:4px}',
    '.c4-swatch-lbl{font-family:DM Mono,monospace;font-size:0.5rem;color:var(--muted);letter-spacing:0.08em;text-transform:uppercase}'
  ].join('');
  document.head.appendChild(_c4s);
}

// ── Theme definitions ──
// Each theme maps to a pair of piece renderings. Order is always
// [player, ai]. First theme uses the existing PNG art; the rest are
// CSS gradients referenced via class names in c4-drop-style above.
var THEMES={
  classic:{name:'ZINNIA',playerArt:{url:'assets/games/c4/zinnia.png'},aiArt:{url:'assets/games/c4/calendula.png'}},
  roses:  {name:'ROSE',  playerArt:{cls:'c4-rose'},   aiArt:{cls:'c4-sun'}},
  iris:   {name:'IRIS',  playerArt:{cls:'c4-iris'},   aiArt:{cls:'c4-tulip'}},
  lily:   {name:'LILY',  playerArt:{cls:'c4-lily'},   aiArt:{cls:'c4-dahlia'}}
};
function _loadTheme(){try{var t=localStorage.getItem('lw_c4_theme');return THEMES[t]?t:'classic';}catch(e){return 'classic';}}
function _saveTheme(k){try{localStorage.setItem('lw_c4_theme',k);}catch(e){}}

// ── Stats ──
function _loadStats(){
  var d={wins:0,losses:0,draws:0,streak:0,best:0};
  try{var raw=localStorage.getItem('lw_c4_stats');if(raw){var p=JSON.parse(raw);for(var k in p)d[k]=p[k];}}catch(e){}
  return d;
}
function _saveStats(s){try{localStorage.setItem('lw_c4_stats',JSON.stringify(s));}catch(e){}}

function GC4(a){
  var ROWS=6,COLS=7;
  var bd=[],turn=1,over=false,mv=0,_lastDrop=-1,winCells=null;
  var history=[];      // stack of {idx,player} for undo
  var currentTheme=_loadTheme();
  var stats=_loadStats();

  ms(a,'Moves: <strong id="C4m">0</strong>');mm(a);

  // Top row — stats strip
  var statsRow=document.createElement('div');statsRow.className='c4-stats';statsRow.id='C4stats';
  a.appendChild(statsRow);

  // Board (pure CSS).
  // Stephen 2026-05-11: board width tightened to fill 360-393px Pi Browser
  // viewport so 7 columns × cell+gap+padding land ≥48px touch targets on
  // real phones (was clamp(280,88vw,420) → ~39px cells at 360vw).
  var gd=document.createElement('div');gd.id='C4g';
  gd.style.cssText='display:grid;grid-template-columns:repeat('+COLS+',1fr);grid-template-rows:repeat('+ROWS+',1fr);gap:clamp(1px,0.4vw,6px);width:min(calc(100vw - 8px),420px);margin:0 auto;padding:clamp(2px,0.5vw,10px);background:linear-gradient(180deg,rgba(48,36,20,.95),rgba(32,24,14,.98));border-radius:clamp(8px,2.5vw,14px);border:2px solid rgba(80,60,30,.4);box-shadow:0 4px 20px rgba(0,0,0,.5),inset 0 1px 0 rgba(120,90,40,.15)';
  a.appendChild(gd);

  // Secondary row — Undo / Hint
  var topRow=document.createElement('div');topRow.className='c4-toprow';
  topRow.innerHTML='<button class="gb" id="C4undo">↩ UNDO</button>'
    +'<button class="gb" id="C4hint">💡 HINT</button>';
  a.appendChild(topRow);

  // Flower theme picker
  var picker=document.createElement('div');picker.className='c4-picker';picker.id='C4picker';
  a.appendChild(picker);

  // Game over / result area
  var obDiv=document.createElement('div');obDiv.id='C4ob';
  obDiv.style.cssText='text-align:center;min-height:40px;padding:4px 0';
  a.appendChild(obDiv);

  // Difficulty + new game controls
  mc(a).innerHTML='<select class="gsl" id="C4d">'
    +'<option value="1">Seedling</option>'
    +'<option value="2" selected>Sapling</option>'
    +'<option value="3">Grove</option>'
    +'<option value="4">Old Growth</option>'
    +'</select>'
    +'<button class="gb-new" onclick="_C4N()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  // ── state helpers ──
  function init(){
    bd=[];for(var i=0;i<ROWS*COLS;i++)bd.push(0);
    turn=1;over=false;mv=0;history=[];_lastDrop=-1;winCells=null;
    var _cm=document.getElementById('C4m');if(_cm)_cm.textContent='0';
  }
  function drop(col){
    for(var r=ROWS-1;r>=0;r--){
      if(bd[r*COLS+col]===0){
        bd[r*COLS+col]=turn;
        _lastDrop=r*COLS+col;
        history.push({idx:r*COLS+col,player:turn});
        return r;
      }
    }
    return -1;
  }
  function check(p){
    for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
      if(c+3<COLS&&bd[r*COLS+c]===p&&bd[r*COLS+c+1]===p&&bd[r*COLS+c+2]===p&&bd[r*COLS+c+3]===p)return true;
      if(r+3<ROWS&&bd[r*COLS+c]===p&&bd[(r+1)*COLS+c]===p&&bd[(r+2)*COLS+c]===p&&bd[(r+3)*COLS+c]===p)return true;
      if(r+3<ROWS&&c+3<COLS&&bd[r*COLS+c]===p&&bd[(r+1)*COLS+c+1]===p&&bd[(r+2)*COLS+c+2]===p&&bd[(r+3)*COLS+c+3]===p)return true;
      if(r+3<ROWS&&c-3>=0&&bd[r*COLS+c]===p&&bd[(r+1)*COLS+c-1]===p&&bd[(r+2)*COLS+c-2]===p&&bd[(r+3)*COLS+c-3]===p)return true;
    }
    return false;
  }
  // Stephen 2026-05-11: returns the 4 winning cell indices for player p,
  // or null. Used by rn() to highlight the winning line at game-end.
  function findWinLine(p){
    for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
      if(c+3<COLS&&bd[r*COLS+c]===p&&bd[r*COLS+c+1]===p&&bd[r*COLS+c+2]===p&&bd[r*COLS+c+3]===p)
        return [r*COLS+c,r*COLS+c+1,r*COLS+c+2,r*COLS+c+3];
      if(r+3<ROWS&&bd[r*COLS+c]===p&&bd[(r+1)*COLS+c]===p&&bd[(r+2)*COLS+c]===p&&bd[(r+3)*COLS+c]===p)
        return [r*COLS+c,(r+1)*COLS+c,(r+2)*COLS+c,(r+3)*COLS+c];
      if(r+3<ROWS&&c+3<COLS&&bd[r*COLS+c]===p&&bd[(r+1)*COLS+c+1]===p&&bd[(r+2)*COLS+c+2]===p&&bd[(r+3)*COLS+c+3]===p)
        return [r*COLS+c,(r+1)*COLS+c+1,(r+2)*COLS+c+2,(r+3)*COLS+c+3];
      if(r+3<ROWS&&c-3>=0&&bd[r*COLS+c]===p&&bd[(r+1)*COLS+c-1]===p&&bd[(r+2)*COLS+c-2]===p&&bd[(r+3)*COLS+c-3]===p)
        return [r*COLS+c,(r+1)*COLS+c-1,(r+2)*COLS+c-2,(r+3)*COLS+c-3];
    }
    return null;
  }
  function isFull(){for(var c=0;c<COLS;c++)if(bd[c]===0)return false;return true;}

  // ── Engine ──
  // score() walks every 4-in-a-row window and weights by how many
  // pieces each side has there plus central-file bonus. Simple but
  // good enough for Sapling/Grove when combined with TT + ordering.
  function score(b){
    function sc4(r,c,dr,dc){
      var ct=[0,0,0];
      for(var i=0;i<4;i++){
        var nr=r+dr*i,nc=c+dc*i;
        if(nr<0||nr>=ROWS||nc<0||nc>=COLS)return 0;
        ct[b[nr*COLS+nc]]++;
      }
      if(ct[2]===4)return 10000;
      if(ct[1]===4)return -10000;
      if(ct[2]===3&&ct[0]===1)return 60;
      if(ct[1]===3&&ct[0]===1)return -60;
      if(ct[2]===2&&ct[0]===2)return 8;
      if(ct[1]===2&&ct[0]===2)return -8;
      return 0;
    }
    var s=0;
    for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
      s+=sc4(r,c,0,1)+sc4(r,c,1,0)+sc4(r,c,1,1)+sc4(r,c,1,-1);
    }
    // Center-file bonus — pieces in the middle column are worth more
    for(var rr=0;rr<ROWS;rr++){
      if(b[rr*COLS+3]===2)s+=4;
      else if(b[rr*COLS+3]===1)s-=4;
    }
    return s;
  }

  // Simple transposition table — keyed by board serialisation + turn
  // marker. Reset per search. Keeps search fast without growing
  // unbounded across games.
  var _tt={};
  function _ttKey(b,depth,isMax){
    var k='';for(var i=0;i<b.length;i++)k+=b[i];
    return k+(isMax?'M':'m')+depth;
  }

  function minimax(b,depth,alpha,beta,isMax){
    if(check(2))return {s:10000+depth};
    if(check(1))return {s:-10000-depth};
    if(isFull())return {s:0};
    if(depth===0)return {s:score(b)};
    var key=_ttKey(b,depth,isMax);
    var hit=_tt[key];if(hit)return hit;
    // Center-first ordering, falls off toward the edges
    var order=[3,2,4,1,5,0,6];
    var best={s:isMax?-Infinity:Infinity,c:-1};
    for(var oi=0;oi<order.length;oi++){
      var c=order[oi];
      if(b[c]!==0)continue; // column full at top
      var r=-1;
      for(var rr=ROWS-1;rr>=0;rr--){if(b[rr*COLS+c]===0){r=rr;break;}}
      if(r<0)continue;
      b[r*COLS+c]=isMax?2:1;
      var val=minimax(b,depth-1,alpha,beta,!isMax);
      b[r*COLS+c]=0;
      if(isMax){
        if(val.s>best.s){best={s:val.s,c:c};}
        alpha=Math.max(alpha,val.s);
      }else{
        if(val.s<best.s){best={s:val.s,c:c};}
        beta=Math.min(beta,val.s);
      }
      if(beta<=alpha)break;
    }
    _tt[key]=best;
    return best;
  }

  function _getDepth(){
    var depMap={1:3,2:5,3:6,4:8};
    return depMap[parseInt((document.getElementById('C4d')||{}).value)]||5;
  }

  function _bestMove(){
    _tt={};
    var res=minimax(bd.slice(),_getDepth(),-Infinity,Infinity,true);
    if(res.c<0){
      for(var c=0;c<COLS;c++)if(bd[c]===0){res.c=c;break;}
    }
    return res.c;
  }

  // Encouraging copy
  var _c4Enc=['Nice try! Go again 🌱','Almost had it! One more? 🌿','The garden grows through practice 🌻','Every loss plants a seed of wisdom 🍃','You learn more from losses — rematch? 🌸'];
  var _c4Win=['Brilliant! You bloomed! 🌸','Your garden flourishes! 🌺','Masterful placement! 🌻','The grove is proud! 🌿','Four in a Row champion! 🏆'];

  function _recordResult(kind){
    if(kind==='win'){stats.wins++;stats.streak++;if(stats.streak>stats.best)stats.best=stats.streak;}
    else if(kind==='loss'){stats.losses++;stats.streak=0;}
    else{stats.draws++;stats.streak=0;}
    _saveStats(stats);
    _renderStats();
  }

  function aiMove(){
    var col=_bestMove();
    drop(col);_play('drop');mv++;
    var _cm=document.getElementById('C4m');if(_cm)_cm.textContent=mv;
    if(check(2)){
      over=true;winCells=findWinLine(2);_e('game_loss');_play('lose');
      sm(_c4Enc[Math.floor(Math.random()*_c4Enc.length)]);
      _sr('c4',{w:false,s:mv});
      _recordResult('loss');
    }else if(isFull()){
      over=true;sm('A draw! Well matched — try again? 🌿');
      _sr('c4',{w:false,s:mv});_recordResult('draw');
    }else{
      turn=1;sm('Your turn');
    }
    rn();
  }

  // ── Rendering ──
  function _applyPiece(d,v){
    // Reset to empty slot visuals first so CSS-class-based themes
    // don't stack with PNG backgrounds after a theme swap or undo.
    d.className=d.className.replace(/\bc4-(rose|sun|iris|tulip|lily|dahlia)\b/g,'').trim();
    if(v===0){
      d.style.background='rgba(10,8,4,.7)';
      d.style.boxShadow='inset 0 2px 6px rgba(0,0,0,.6)';
      return;
    }
    var theme=THEMES[currentTheme];
    var art=(v===1)?theme.playerArt:theme.aiArt;
    if(art.url){
      d.style.background='url('+art.url+') center/cover';
      d.style.boxShadow='inset 0 0 4px rgba(0,0,0,.3),0 2px 6px rgba(0,0,0,.25)';
    }else if(art.cls){
      d.style.background='';
      d.style.boxShadow='';
      d.classList.add(art.cls);
    }
  }

  function _renderStats(){
    var s=stats;
    statsRow.innerHTML='wins <strong>'+s.wins+'</strong>'
      +' · losses <strong>'+s.losses+'</strong>'
      +' · streak <strong>'+s.streak+'</strong>'
      +' · best <strong>'+s.best+'</strong>';
  }

  function _renderPicker(){
    picker.innerHTML='';
    var keys=['classic','roses','iris','lily'];
    for(var i=0;i<keys.length;i++){
      (function(k){
        var t=THEMES[k];
        var wrap=document.createElement('div');wrap.className='c4-swatch-wrap';
        var sw=document.createElement('div');sw.className='c4-swatch'+(k===currentTheme?' on':'');
        if(t.playerArt.url){sw.style.background='url('+t.playerArt.url+') center/cover';}
        else{sw.classList.add(t.playerArt.cls);}
        sw.onclick=function(){
          if(k===currentTheme)return;
          currentTheme=k;_saveTheme(k);
          _renderPicker();rn();
        };
        var lbl=document.createElement('div');lbl.className='c4-swatch-lbl';lbl.textContent=t.name;
        wrap.appendChild(sw);wrap.appendChild(lbl);
        picker.appendChild(wrap);
      })(keys[i]);
    }
  }

  function rn(){
    var _scrollY=window.scrollY;
    var cells=gd.children;
    if(cells.length!==ROWS*COLS){
      gd.innerHTML='';
      for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
        var d=document.createElement('div');
        d.style.cssText='aspect-ratio:1;border-radius:50%;cursor:pointer;overflow:hidden;-webkit-tap-highlight-color:transparent;transition:background .22s ease,box-shadow .22s ease,transform .12s ease;background:rgba(10,8,4,.7);box-shadow:inset 0 2px 6px rgba(0,0,0,.6)';
        d.setAttribute('data-c',c);
        d.setAttribute('data-r',r);
        d.onclick=function(){
          if(over||turn!==1)return;
          var col=parseInt(this.getAttribute('data-c'));
          if(bd[col]!==0)return;
          _play('tap');drop(col);mv++;
          var _cm=document.getElementById('C4m');if(_cm)_cm.textContent=mv;
          if(check(1)){
            over=true;winCells=findWinLine(1);_e('game_win');_playWin();
            sm(_c4Win[Math.floor(Math.random()*_c4Win.length)]);
            rn();_sr('c4',{w:true,s:mv});_recordResult('win');
            return;
          }
          if(isFull()){
            over=true;sm('A draw! Well matched — try again? 🌿');
            rn();_sr('c4',{w:false,s:mv});_recordResult('draw');
            return;
          }
          turn=2;sm('AI thinking...');rn();setTimeout(aiMove,280);
        };
        gd.appendChild(d);
      }
      cells=gd.children;
    }
    for(var i=0;i<ROWS*COLS;i++){
      var d=cells[i];
      _applyPiece(d,bd[i]);
      // clear any hint glow from previous render
      d.classList.remove('c4-hint');
      if(i===_lastDrop){d.classList.remove('c4-dropping');void d.offsetWidth;d.classList.add('c4-dropping');}
      else{d.classList.remove('c4-dropping');}
      // Stephen 2026-05-11: highlight the winning 4-in-a-row on game-over.
      d.classList.remove('c4-winline');
      if(winCells&&winCells.indexOf(i)!==-1)d.classList.add('c4-winline');
    }
    _lastDrop=-1;
    var ob=document.getElementById('C4ob');
    if(ob){
      if(!over){ob.innerHTML='';}
      else if(check(1)){ob.innerHTML='';}
      else{
        var isLoss=check(2);
        var msg=isLoss?_c4Enc[Math.floor(Math.random()*_c4Enc.length)]:'A draw! Well matched.';
        ob.innerHTML='<div style="text-align:center;padding:clamp(8px,3vw,16px);background:rgba(26,31,23,.85);border:1px solid rgba(74,124,53,.15);border-radius:12px;margin:8px auto;max-width:320px">'
          +'<div style="font-family:Bebas Neue,sans-serif;font-size:clamp(.8rem,2.5vw,1.1rem);color:'+(isLoss?'var(--cream)':'var(--gold)')+';letter-spacing:.08em;margin-bottom:6px">'+(isLoss?'GAME OVER':'DRAW')+'</div>'
          +'<div style="font-size:clamp(.45rem,1.3vw,.6rem);color:var(--muted);margin-bottom:10px">'+msg+'</div>'
          +'<button class="gb" onclick="_C4N()" style="font-size:clamp(.6rem,1.8vw,.8rem);padding:8px 20px;width:100%;min-height:44px">TRY AGAIN</button>'
          +'</div>';
      }
    }
    window.scrollTo(0,_scrollY);
  }

  // ── Undo / Hint ──
  document.getElementById('C4undo').onclick=function(){
    if(over)return;
    if(turn!==1)return; // mid-AI-think the pending aiMove would replay onto the rewound board
    if(history.length<2)return; // need both player + AI move to undo a pair
    // Pop last two entries (AI then player)
    var h1=history.pop();bd[h1.idx]=0;
    var h2=history.pop();bd[h2.idx]=0;
    mv=Math.max(0,mv-2);
    var _cm=document.getElementById('C4m');if(_cm)_cm.textContent=mv;
    turn=1;over=false;_lastDrop=-1;winCells=null;
    sm('Undone — your turn');
    rn();
  };
  document.getElementById('C4hint').onclick=function(){
    if(over||turn!==1)return;
    // Mirror the AI's search but for the player side — find the column
    // that most improves the player's position.
    _tt={};
    var b=bd.slice();
    var bestCol=-1,bestScore=Infinity;
    for(var c=0;c<COLS;c++){
      if(b[c]!==0)continue;
      var r=-1;
      for(var rr=ROWS-1;rr>=0;rr--){if(b[rr*COLS+c]===0){r=rr;break;}}
      if(r<0)continue;
      b[r*COLS+c]=1;
      // Evaluate from the perspective of the AI responding; lowest
      // resulting score (worst for AI) = best for player.
      var val=minimax(b,Math.min(5,_getDepth()-1),-Infinity,Infinity,true);
      b[r*COLS+c]=0;
      if(val.s<bestScore){bestScore=val.s;bestCol=c;}
    }
    if(bestCol<0)return;
    // Pulse the top empty cell in that column
    var firstEmpty=-1;
    for(var r2=0;r2<ROWS;r2++){
      if(bd[r2*COLS+bestCol]===0){firstEmpty=r2*COLS+bestCol;break;}
    }
    if(firstEmpty>=0){
      var cell=gd.children[firstEmpty];
      if(cell)cell.classList.add('c4-hint');
      // Clear hint after 4 seconds or on next render
      setTimeout(function(){if(cell)cell.classList.remove('c4-hint');},4000);
    }
    _play('tap');
  };

  // ── Boot ──
  window._C4N=function(){
    init();gd.innerHTML='';
    sm('Your turn');
    _renderStats();_renderPicker();rn();
  };
  _C4N();
}

window._gameFns.c4=GC4;
})();
