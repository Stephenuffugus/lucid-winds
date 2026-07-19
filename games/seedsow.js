// ═══ LUCID WINDS — Seed Sow (Kalah-style Mancala) ═══
//
// Researched from top Mancala/Kalah apps (Mancala Classic, Real
// Mancala, Mancala Ultimate):
// - Minimax AI with alpha-beta pruning (4 tiered difficulty levels)
// - Seed-dot visualisation inside each pit (up to 14 dots, stacked
//   in a subtle cluster; overflow pile shows a count chip)
// - Last-move glow and captured-pit flash
// - Free-turn + capture banners for satisfying feedback
// - Stats: played / won% / streak / best
// - Undo the last full pair of moves
// - Hint pulses the best move for 3.5s
// - Rules book explains sowing, captures, free turns, ending
// - Warm wood board with soft inner shadow + radial vignette
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr;

window._gameFns=window._gameFns||{};
window._gameFns.seedsow=function SS(a){
  // Indices: 0-5 player pits, 6 player store, 7-12 AI pits, 13 AI store.
  // Sow counterclockwise: 0→1→…→5→6(store)→7→…→12→13(skip if player)→0
  var board=[];
  var turn=0; // 0=player, 1=AI
  var busy=false;
  var gameOver=false; // end latch: undo could replay the winning move and re-earn
  var bestStoreEarn=0; // store high-water mark for capture earns (anti undo-refarm)
  var difficulty=2; // 1-4 tier
  try{var _d=parseInt(localStorage.getItem('lw_ss_diff'));if(_d>=1&&_d<=4)difficulty=_d;}catch(e){}
  var stats={w:0,l:0,d:0,streak:0,best:0};
  try{var _s=localStorage.getItem('lw_ss_stats');if(_s){var _p=JSON.parse(_s);for(var _k in _p)stats[_k]=_p[_k];}}catch(e){}
  var undoStack=[]; // snapshots of {board, turn}
  var hintPit=-1;   // highlighted suggestion
  var lastMovePit=-1; // last-sown source for glow
  var capturedIdx=-1; // pit flashed after capture
  var floatBanner=''; // ephemeral "+7 capture!", "free turn!" etc

  // ── CSS injection (once) ──
  if(!document.getElementById('SSstyle')){
    var ss=document.createElement('style');ss.id='SSstyle';
    ss.textContent=[
      '#SSpan{padding-top:6px;}',
      // Wood board
      '.ss-board{display:grid;grid-template-columns:minmax(40px,58px) repeat(6,minmax(0,1fr)) minmax(40px,58px);gap:4px;align-items:center;margin:8px auto;padding:10px 8px;background:linear-gradient(135deg,#5a3f22,#7a5c3a,#5a3f22);border-radius:18px;box-shadow:0 10px 28px rgba(0,0,0,0.5),inset 0 2px 6px rgba(255,220,140,0.08),inset 0 -2px 8px rgba(0,0,0,0.4);border:2px solid #3b2a14;max-width:min(96vw,480px);width:100%;box-sizing:border-box;position:relative;overflow:hidden;}',
      '.ss-board::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 50%,transparent 40%,rgba(0,0,0,0.25) 100%);border-radius:18px;}',
      '.ss-store{grid-row:span 2;background:radial-gradient(ellipse at 50% 30%,rgba(32,22,10,0.6),rgba(16,10,4,0.8));border:2px solid rgba(200,168,75,0.3);border-radius:30px;padding:14px 4px;text-align:center;font-family:Bebas Neue,sans-serif;color:var(--cream);min-height:140px;display:flex;flex-direction:column;justify-content:center;align-items:center;box-shadow:inset 0 4px 12px rgba(0,0,0,0.5);position:relative;z-index:2;}',
      '.ss-store .lbl{font-size:0.7rem;letter-spacing:0.14em;margin-bottom:4px;opacity:0.9}',
      '.ss-store .cnt{font-size:1.8rem;color:var(--gold);line-height:1;font-weight:600;}',
      '.ss-store.mine{border-color:rgba(122,179,86,0.5)}',
      '.ss-store.mine .lbl{color:#8fc57a}',
      '.ss-store.opp{border-color:rgba(196,122,122,0.45)}',
      '.ss-store.opp .lbl{color:#e89a9a}',
      // Pits
      '.ss-pit{aspect-ratio:1;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:Bebas Neue,sans-serif;font-size:1.05rem;color:var(--cream);min-height:46px;cursor:default;position:relative;z-index:2;transition:transform .15s ease, box-shadow .18s ease, background .18s ease, border-color .18s ease;background:radial-gradient(ellipse at 50% 30%,rgba(32,22,10,0.6),rgba(12,8,4,0.85));border:2px solid rgba(90,70,40,0.5);box-shadow:inset 0 3px 10px rgba(0,0,0,0.55),inset 0 -1px 2px rgba(255,220,140,0.05);}',
      '.ss-pit .cnt{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-shadow:0 1px 3px rgba(0,0,0,0.8);font-weight:500;z-index:3;}',
      '.ss-pit.playable{border-color:#7ab356;background:radial-gradient(ellipse at 50% 30%,rgba(42,70,28,0.7),rgba(18,28,12,0.85));cursor:pointer;box-shadow:inset 0 3px 10px rgba(0,0,0,0.45),0 0 10px rgba(122,179,86,0.25);}',
      '.ss-pit.playable:hover{transform:translateY(-2px);box-shadow:inset 0 3px 10px rgba(0,0,0,0.35),0 6px 14px rgba(122,179,86,0.35);}',
      '.ss-pit.playable:active{transform:scale(0.96);}',
      '.ss-pit.last{box-shadow:inset 0 3px 10px rgba(0,0,0,0.45),0 0 12px rgba(200,168,75,0.5);border-color:rgba(200,168,75,0.7);}',
      '.ss-pit.captured{animation:ssCaptureFlash .8s ease;}',
      '.ss-pit.hint{box-shadow:inset 0 3px 10px rgba(0,0,0,0.45),0 0 16px rgba(200,168,75,0.75);border-color:#c8a84b;animation:ssHintPulse 1s ease-in-out infinite;}',
      '@keyframes ssCaptureFlash{0%,100%{background:radial-gradient(ellipse at 50% 30%,rgba(32,22,10,0.6),rgba(12,8,4,0.85))}50%{background:radial-gradient(ellipse at 50% 30%,rgba(200,168,75,0.7),rgba(110,80,20,0.7))}}',
      '@keyframes ssHintPulse{0%,100%{box-shadow:inset 0 3px 10px rgba(0,0,0,0.45),0 0 12px rgba(200,168,75,0.5)}50%{box-shadow:inset 0 3px 10px rgba(0,0,0,0.45),0 0 22px rgba(200,168,75,0.9)}}',
      '@keyframes ssSeedIn{from{transform:scale(0.3);opacity:0}to{transform:scale(1);opacity:0.85}}',
      // Seed dots inside the pit (positioned cluster)
      '.ss-seeds{position:absolute;inset:0;pointer-events:none;z-index:1;}',
      '.ss-seed{position:absolute;width:6px;height:6px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff5a8,#c8a84b 60%,#6b4f2d 100%);box-shadow:0 1px 1px rgba(0,0,0,0.5);animation:ssSeedIn .2s ease-out both;}',
      // Stats strip
      '.ss-stats{display:flex;justify-content:center;gap:14px;padding:2px 0;font-family:DM Mono,monospace;font-size:0.62rem;color:rgba(232,220,200,0.72);letter-spacing:0.06em;}',
      '.ss-stats strong{color:var(--gold);}',
      // Tools row
      '.ss-tools{display:flex;gap:6px;justify-content:center;padding:4px 0;flex-wrap:wrap;}',
      '.ss-tools .gb{min-height:48px;padding:6px 14px;font-size:0.68rem;letter-spacing:0.06em;}',
      // Float banner
      '.ss-banner{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(13,16,12,0.9);border:1.5px solid var(--gold);color:var(--gold);padding:8px 18px;border-radius:20px;font-family:Bebas Neue,sans-serif;font-size:0.95rem;letter-spacing:0.14em;z-index:100;animation:ssBanner 1.6s ease both;pointer-events:none;box-shadow:0 6px 18px rgba(0,0,0,0.6);}',
      '@keyframes ssBanner{0%{opacity:0;transform:translate(-50%,-50%) scale(0.7)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.12)}30%,70%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-80%) scale(1)}}',
      // Rules modal
      '#SSrulesOV{position:fixed;inset:0;z-index:200000;background:rgba(5,8,4,0.88);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:16px;animation:ssFade .25s ease;}',
      '#SSrulesOV .card{max-width:420px;width:100%;max-height:84vh;overflow-y:auto;padding:22px 20px;background:linear-gradient(180deg,rgba(18,22,14,0.98),rgba(10,12,8,0.98));border:1.5px solid rgba(200,168,75,0.35);border-radius:14px;box-shadow:0 32px 64px rgba(0,0,0,0.7);font-family:DM Mono,monospace;color:var(--cream);font-size:0.72rem;line-height:1.6;}',
      '@keyframes ssFade{from{opacity:0}to{opacity:1}}',
      '#SSrulesOV h2{font-family:Bebas Neue,sans-serif;font-size:1rem;letter-spacing:0.14em;color:var(--gold);border-bottom:1px solid rgba(200,168,75,0.3);margin:14px 0 8px;padding-bottom:4px;}'
    ].join('');
    document.head.appendChild(ss);
  }

  ms(a,'Mancala · <span id="SSm">Your turn</span>');
  mm(a);
  var statsRow=document.createElement('div');statsRow.className='ss-stats';statsRow.id='SSstats';a.appendChild(statsRow);
  var pan=document.createElement('div');pan.id='SSpan';
  pan.style.cssText='max-width:min(96vw,480px);width:100%;margin:0 auto;padding:6px;box-sizing:border-box;';
  a.appendChild(pan);
  mc(a).innerHTML='<select class="gsl" id="SSd" onchange="_SSD(this.value)" style="min-width:140px">'
    +'<option value="1">Seedling</option>'
    +'<option value="2">Sapling</option>'
    +'<option value="3">Grove</option>'
    +'<option value="4">Old Growth</option>'
    +'</select><button class="gb" onclick="_SSN()">↻ New Game</button>';

  function renderStats(){
    var p=stats.w+stats.l+stats.d;
    var pct=p?Math.round(stats.w/p*100):0;
    statsRow.innerHTML='played <strong>'+p+'</strong> · won <strong>'+pct+'%</strong> · streak <strong>'+stats.streak+'</strong> · best <strong>'+stats.best+'</strong>';
  }
  function saveStats(){try{localStorage.setItem('lw_ss_stats',JSON.stringify(stats));}catch(e){}}

  var ssGen=0;
  function ssT(fn,ms){var g=ssGen;setTimeout(function(){if(g===ssGen)fn();},ms);}
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){ssGen++;var o=document.getElementById('SSrulesOV');if(o)o.remove();});
  function newGame(){
    ssGen++; // kill any in-flight sow/AI chain (NEW GAME mid-sow corrupted state)
    gameOver=false;
    board=[4,4,4,4,4,4,0,4,4,4,4,4,4,0];
    turn=0;busy=false;bestStoreEarn=0;
    undoStack=[];hintPit=-1;lastMovePit=-1;capturedIdx=-1;floatBanner='';
    var dsel=document.getElementById('SSd');if(dsel)dsel.value=String(difficulty);
    sm('Your turn');render();renderStats();
  }

  function validPits(b,side){
    var out=[],start=side===0?0:7;
    for(var i=0;i<6;i++)if(b[start+i]>0)out.push(start+i);
    return out;
  }
  function opposite(idx){
    if(idx>=0&&idx<=5)return 12-idx;
    if(idx>=7&&idx<=12)return 12-idx;
    return -1;
  }
  function nextIdx(i,side){
    i=(i+1)%14;
    if(side===0&&i===13)i=0;
    if(side===1&&i===6)i=7;
    return i;
  }

  // Animated sow for UX. cb(extraTurn, captureAmount)
  function sow(pit,side,cb){
    var seeds=board[pit];board[pit]=0;
    lastMovePit=pit;
    var idx=pit;
    var delay=150;
    function step(){
      if(seeds<=0){
        var myStore=side===0?6:13;
        var myStart=side===0?0:7,myEnd=side===0?5:12;
        var extraTurn=(idx===myStore);
        var captureAmt=0;
        if(idx>=myStart&&idx<=myEnd&&board[idx]===1){
          var opp=opposite(idx);
          if(board[opp]>0){
            captureAmt=board[opp]+1;
            board[myStore]+=captureAmt;
            board[opp]=0;board[idx]=0;
            capturedIdx=opp;
            // Earn only on PLAYER captures, and only past the previous store
            // high-water mark — undo+recapture can't re-earn the same seeds.
            if(side===0&&board[myStore]>bestStoreEarn){bestStoreEarn=board[myStore];_e('progress');}
          }
        }
        render();
        if(captureAmt>0)ssT(function(){capturedIdx=-1;render();},900);
        if(checkEnd()){cb(false,captureAmt,true);return;}
        cb(extraTurn,captureAmt);
        return;
      }
      idx=nextIdx(idx,side);
      board[idx]++;seeds--;
      _play('tap');
      render();
      ssT(step,delay);
    }
    ssT(step,delay);
  }

  function checkEnd(){
    var ps=0,as=0;
    for(var i=0;i<6;i++){ps+=board[i];as+=board[7+i];}
    if(ps===0||as===0){
      for(i=0;i<6;i++){board[6]+=board[i];board[i]=0;board[13]+=board[7+i];board[7+i]=0;}
      render();
      var pp=board[6],ap=board[13];
      var won=pp>ap;
      if(won){_e('game_win');_playWin();sm('✓ You win! '+pp+' vs '+ap);stats.w++;stats.streak++;if(stats.streak>stats.best)stats.best=stats.streak;}
      else if(pp<ap){_e('game_loss');_play('lose');sm('Computer wins. '+pp+' vs '+ap);stats.l++;stats.streak=0;}
      else{sm('Tie. '+pp+' each');stats.d++;stats.streak=0;}
      saveStats();renderStats();
      _sr('seedsow',{w:won,s:pp});
      busy=true;gameOver=true;
      if(window._lwGameEnd)window._lwGameEnd({won:won,
        title:won?'You win!':(pp<ap?'Computer wins':'A tie'),
        line:pp+' \u2014 '+ap+' \u00b7 lifetime '+stats.w+'W-'+stats.l+'L-'+stats.d+'D'+(stats.streak>1?' \u00b7 \ud83d\udd25 '+stats.streak+' streak':''),
        retry:function(){if(window._SSN)window._SSN();},
        retryLabel:'\u21bb NEW GAME',viewLabel:'view the board'});
      return true;
    }
    return false;
  }

  // ── Minimax engine (operates on cloned board + simple rules) ──
  // Returns {extra:bool, captures:n} and mutates board for each step.
  function simulateMove(b,pit,side){
    var seeds=b[pit];b[pit]=0;
    var idx=pit;
    while(seeds>0){
      idx=(idx+1)%14;
      if(side===0&&idx===13){idx=0;}
      if(side===1&&idx===6){idx=7;}
      b[idx]++;seeds--;
    }
    var myStore=side===0?6:13;
    var myStart=side===0?0:7,myEnd=side===0?5:12;
    var extra=(idx===myStore);
    var captured=0;
    if(idx>=myStart&&idx<=myEnd&&b[idx]===1){
      var opp=12-idx;
      if(b[opp]>0){
        captured=b[opp]+1;
        b[myStore]+=captured;b[opp]=0;b[idx]=0;
      }
    }
    // End conditions on one side empty
    var ps=0,as=0;
    for(var i=0;i<6;i++){ps+=b[i];as+=b[7+i];}
    if(ps===0||as===0){
      for(i=0;i<6;i++){b[6]+=b[i];b[i]=0;b[13]+=b[7+i];b[7+i]=0;}
      return {extra:false,captured:captured,ended:true};
    }
    return {extra:extra,captured:captured,ended:false};
  }
  function evaluateBoard(b,aiSide){
    // Simple: AI store − player store, plus a weak mobility proxy.
    var aiStore=b[aiSide===1?13:6];
    var plStore=b[aiSide===1?6:13];
    var score=(aiStore-plStore)*10;
    // Prefer pits with more seeds near our store (approx mobility)
    for(var i=0;i<6;i++){
      if(b[aiSide===1?7+i:i]>0)score+=1;
      if(b[aiSide===1?i:7+i]>0)score-=1;
    }
    return score;
  }
  function minimax(b,depth,alpha,beta,isMax,aiSide){
    // Terminal
    var ps=0,as=0;
    for(var i=0;i<6;i++){ps+=b[i];as+=b[7+i];}
    if(ps===0||as===0||depth===0)return evaluateBoard(b,aiSide);
    var side=isMax?aiSide:(aiSide===1?0:1);
    var moves=validPits(b,side);
    if(!moves.length)return evaluateBoard(b,aiSide);
    // Order: prefer moves that land in own store (extra turn)
    moves.sort(function(x,y){
      var xs=b[x],ys=b[y];
      var xStore=side===0?6:13;
      var ax=(x+xs)%14===xStore?1:0;
      var ay=(y+ys)%14===xStore?1:0;
      return ay-ax;
    });
    if(isMax){
      var best=-Infinity;
      for(var i=0;i<moves.length;i++){
        var nb=b.slice();
        var res=simulateMove(nb,moves[i],side);
        var val;
        if(res.ended)val=evaluateBoard(nb,aiSide);
        else val=minimax(nb,depth-1,alpha,beta,res.extra?isMax:!isMax,aiSide);
        if(val>best)best=val;
        if(best>alpha)alpha=best;
        if(beta<=alpha)break;
      }
      return best;
    }
    var worst=Infinity;
    for(var j=0;j<moves.length;j++){
      var nb2=b.slice();
      var res2=simulateMove(nb2,moves[j],side);
      var val2;
      if(res2.ended)val2=evaluateBoard(nb2,aiSide);
      else val2=minimax(nb2,depth-1,alpha,beta,res2.extra?isMax:!isMax,aiSide);
      if(val2<worst)worst=val2;
      if(worst<beta)beta=worst;
      if(beta<=alpha)break;
    }
    return worst;
  }
  function bestMoveFor(side){
    var moves=validPits(board,side);
    if(!moves.length)return -1;
    if(difficulty===1&&side===1){
      return moves[Math.floor(Math.random()*moves.length)];
    }
    var depth={1:2,2:4,3:6,4:8}[difficulty]||4;
    var aiSide=side;
    var best=-Infinity,pick=moves[0];
    for(var i=0;i<moves.length;i++){
      var nb=board.slice();
      var res=simulateMove(nb,moves[i],side);
      var val;
      if(res.ended)val=evaluateBoard(nb,aiSide);
      else val=minimax(nb,depth-1,-Infinity,Infinity,res.extra,aiSide);
      // Small tiebreak random for tier 2 (sapling) to vary play
      if(difficulty===2)val+=Math.random()*0.5;
      if(val>best){best=val;pick=moves[i];}
    }
    return pick;
  }

  // ── Interactions ──
  function playerMove(pit){
    if(busy||turn!==0||gameOver)return;
    if(pit<0||pit>5||board[pit]===0)return;
    undoStack.push({board:board.slice(),turn:turn});
    hintPit=-1;
    busy=true;
    sow(pit,0,function(extra,cap,ended){
      if(ended)return; // game just ended — no turn flip, no AI, undo stays locked
      if(cap>0)showBanner('+'+cap+' capture!');
      if(!extra){turn=1;sm('Computer thinking...');ssT(aiMove,550);}
      else{showBanner('Free turn');sm('Free turn');busy=false;render();}
    });
  }
  function aiMove(){
    if(turn!==1||gameOver)return;
    var pit=bestMoveFor(1);
    if(pit<0){if(!gameOver){turn=0;busy=false;sm('Your turn');}return;}
    sow(pit,1,function(extra,cap,ended){
      if(ended)return;
      if(cap>0)showBanner('Computer captures '+cap);
      if(!extra){turn=0;busy=false;sm('Your turn');render();}
      else{showBanner('Computer free turn');sm('Computer gets another turn');ssT(aiMove,700);}
    });
  }
  function showBanner(text){
    floatBanner=text;
    render();
    ssT(function(){floatBanner='';render();},1400);
  }

  // Render seed dots inside a pit. Positions cluster around center.
  function renderSeeds(count){
    if(count<=0)return '';
    var max=Math.min(count,10);
    var out='<div class="ss-seeds">';
    // Concentric ring-ish positions
    var positions=[
      [50,50],[35,36],[65,36],[36,62],[64,62],
      [50,28],[50,72],[28,50],[72,50],[50,50]
    ];
    for(var i=0;i<max;i++){
      var p=positions[i%positions.length];
      var x=p[0]+(Math.random()*6-3),y=p[1]+(Math.random()*6-3);
      out+='<div class="ss-seed" style="left:'+x+'%;top:'+y+'%;animation-delay:'+(i*20)+'ms"></div>';
    }
    out+='</div>';
    return out;
  }

  function render(){
    var h='<div class="ss-board">';
    // AI store (left column, spans 2 rows)
    h+='<div class="ss-store opp"><div class="lbl">AI</div><div class="cnt">'+board[13]+'</div></div>';
    // AI pits (right to left: 12..7)
    for(var i=12;i>=7;i--){
      var isLast=(i===lastMovePit),isCap=(i===capturedIdx),isHint=(i===hintPit);
      var cls='ss-pit';
      if(isLast)cls+=' last';
      if(isCap)cls+=' captured';
      if(isHint)cls+=' hint';
      h+='<div class="'+cls+'">'+renderSeeds(board[i])+'<span class="cnt">'+board[i]+'</span></div>';
    }
    // Player store (right column, spans 2 rows)
    h+='<div class="ss-store mine"><div class="lbl">YOU</div><div class="cnt">'+board[6]+'</div></div>';
    // Player pits (0..5)
    for(i=0;i<6;i++){
      var canPlay=(turn===0&&!busy&&board[i]>0);
      var cls2='ss-pit';
      if(canPlay)cls2+=' playable';
      if(i===lastMovePit)cls2+=' last';
      if(i===capturedIdx)cls2+=' captured';
      if(i===hintPit)cls2+=' hint';
      h+='<div class="'+cls2+'" onclick="_SSP('+i+')">'+renderSeeds(board[i])+'<span class="cnt">'+board[i]+'</span></div>';
    }
    if(floatBanner)h+='<div class="ss-banner">'+floatBanner+'</div>';
    h+='</div>';
    // Tools
    h+='<div class="ss-tools">';
    var canUndo=undoStack.length>0&&turn===0&&!busy;
    var canHint=turn===0&&!busy&&hintPit<0;
    h+='<button class="gb" onclick="_SSU()" '+(canUndo?'':'disabled style="opacity:0.4"')+'>↩ UNDO</button>';
    h+='<button class="gb" onclick="_SSH()" '+(canHint?'':'disabled style="opacity:0.4"')+'>💡 HINT</button>';
    h+='<button class="gb" onclick="_SSR()">📖 RULES</button>';
    h+='</div>';
    pan.innerHTML=h;
  }

  window._SSP=function(i){playerMove(i);};
  window._SSN=function(){newGame();};
  window._SSD=function(d){
    var n=parseInt(d,10);if(isNaN(n)||n<1||n>4)return;
    difficulty=n;try{localStorage.setItem('lw_ss_diff',String(n));}catch(e){}
  };
  window._SSU=function(){
    if(undoStack.length===0||busy||turn!==0||gameOver)return;
    var s=undoStack.pop();
    board=s.board.slice();turn=s.turn;
    hintPit=-1;lastMovePit=-1;capturedIdx=-1;
    _play('tap');sm('Undone');render();
  };
  window._SSH=function(){
    if(busy||turn!==0||gameOver)return;
    var saved=difficulty;difficulty=4;
    var pick=bestMoveFor(0);
    difficulty=saved;
    if(pick<0)return;
    hintPit=pick;
    _play('tap');
    render();
    ssT(function(){hintPit=-1;render();},3500);
  };
  window._SSR=function(){
    var existing=document.getElementById('SSrulesOV');
    if(existing){existing.remove();return;}
    var ov=document.createElement('div');ov.id='SSrulesOV';
    ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});
    var h='<div class="card">';
    h+='<h2>🌱 Mancala — How to Play</h2>';
    h+='<p>A classic Kalah-style Mancala. You control the <strong style="color:#8fc57a">bottom row</strong> and the <strong>green store</strong> on the right. The AI owns the top row and the coral store on the left.</p>';
    h+='<h2>Your turn</h2>';
    h+='<p>Tap one of your pits. The seeds inside sow counterclockwise, one per pit: into your row, into your store, into the computer\'s row, past the computer\'s store (skipped!), back to yours.</p>';
    h+='<h2>Free turn</h2>';
    h+='<p>If your last seed lands in <strong style="color:var(--gold)">your store</strong>, you play again.</p>';
    h+='<h2>Capture</h2>';
    h+='<p>If your last seed lands in an <strong>empty pit on your side</strong>, and the pit directly opposite (the computer\'s) has seeds, you capture BOTH that seed AND all opposite seeds into your store.</p>';
    h+='<h2>Game end</h2>';
    h+='<p>When one side\'s row is completely empty, the other side sweeps all remaining seeds on its own side into its store. Most seeds in store wins.</p>';
    h+='<h2>Strategy</h2>';
    h+='<p>• Plan for the free-turn landing in your store — double and triple turns dominate.<br>• Empty pits on your side are capture opportunities; leaving a pit empty with seeds across the way is a gift for the computer.<br>• Your last pit (pit 6, nearest the store) with exactly 1 seed and you sow it → bonus turn.</p>';
    h+='<div style="text-align:center;margin-top:14px;"><button class="gb" onclick="document.getElementById(\'SSrulesOV\').remove()" style="min-height:48px;padding:10px 22px;">CLOSE</button></div>';
    h+='</div>';
    ov.innerHTML=h;
    document.body.appendChild(ov);
    try{localStorage.setItem('lw_ss_rules_seen','1');}catch(e){}
  };

  newGame();
  // First-time rules auto-open — AFTER newGame, whose ssGen bump silently
  // cancelled the old pre-newGame timer (rules never auto-opened).
  try{
    if(!localStorage.getItem('lw_ss_rules_seen')){
      ssT(function(){if(window._SSR)window._SSR();},700);
    }
  }catch(e){}
};
})();
