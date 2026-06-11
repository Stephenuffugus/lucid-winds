/* ════════════════════════════════════════════════════════════════════
 * Sky Wolf Studios — Inline game copy: backgammon
 *
 * COPY of the inline GBG mount function from index.html
 * lines 68803-69185.
 *
 * DUPLICATE, NEVER MOVE. The original code in index.html is the
 * live source of truth for the in-LW play surface. This copy serves
 * the /play/backgammon.html shell only. To keep them aligned,
 * re-run scripts/extract_inline_games.js whenever index.html's
 * inline game block is edited.
 * ════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var G=window._G;
  var _e=G.e, _play=G.play, _playWin=G.playWin, _st=G.st, _xt=G.xt,
      ms=G.ms, mm=G.mm, mc=G.mc, sm=G.sm, sh=G.sh,
      _sr=G.sr, _gr=G.gr, _setDiff=G.setDiff,
      _solEnterFS=G.solEnterFS, _solClearFS=G.solClearFS, _solExitFS=G.solExitFS;
  window._gameFns=window._gameFns||{};

  function GBG(a){
    var B,DICE,DICE_USED,TURN,SEL,VALID_DESTS,PHASE,MOVES_LEFT,BO_H,BO_A;
    // Generation token: every init() bumps this. AI callbacks check the
    // captured generation against this value before acting — so a New Game
    // mid-AI-think can't have stale callbacks corrupt the new board.
    var BG_GEN=0;
    // Pending timer IDs cleared on init so callbacks scheduled before
    // _BGN don't fire onto the new game.
    var BG_PENDING=[];
    function bgClearPending(){for(var i=0;i<BG_PENDING.length;i++)clearTimeout(BG_PENDING[i]);BG_PENDING=[];}
    function bgSchedule(fn,ms){var id=setTimeout(function(){var idx=BG_PENDING.indexOf(id);if(idx>=0)BG_PENDING.splice(idx,1);fn();},ms);BG_PENDING.push(id);return id;}
    // Undo stack — per-turn snapshots of full state. Reset on endTurn.
    var BG_UNDO=[];
    // Hint: {from,to,die} highlighted for 3s. -1 when no hint active.
    var BG_HINT=null;
    // Difficulty tier: 1=seedling (random), 2=sapling (1-ply greedy),
    // 3=grove (1-ply with tighter eval), 4=old growth (2-ply search over
    // opponent's likely rolls).
    var BG_DIFF=2;
    try{BG_DIFF=parseInt(localStorage.getItem('lw_bg_diff'))||2;}catch(e){BG_DIFF=2;}
    ms(a,'<span class="gp-you" style="color:#7AB956">You: <strong id="BGh">0</strong></span> · <span class="gp-ai" style="color:#C47A7A">AI: <strong id="BGa">0</strong></span>');mm(a);
    var wrap=document.createElement('div');wrap.id='BGwrap';wrap.className='bg-outer';wrap.style.cssText='user-select:none;-webkit-user-select:none';a.appendChild(wrap);
    mc(a).innerHTML='<select class="gsl" id="BGd" onchange="_BGSetDiff(this.value)" style="min-width:140px;max-width:180px">'
      +'<option value="1">Seedling</option>'
      +'<option value="2">Sapling</option>'
      +'<option value="3">Grove</option>'
      +'<option value="4">Old Growth</option>'
      +'</select><button class="gb-new" onclick="_BGN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';
  
    function init(){
      bgClearPending();   // cancel any AI callbacks queued from the prior game
      BG_GEN++;            // invalidate any in-flight callbacks that pre-date this init
      B=new Array(26);for(var i=0;i<26;i++)B[i]=0;
      B[24]=2;B[13]=5;B[8]=3;B[6]=5;
      B[1]=-2;B[12]=-5;B[17]=-3;B[19]=-5;
      DICE=[0,0];DICE_USED=[false,false];TURN='human';SEL=-1;VALID_DESTS=[];
      PHASE='roll';MOVES_LEFT=[];BO_H=0;BO_A=0;
      BG_UNDO=[];BG_HINT=null;
      var sel=document.getElementById('BGd');if(sel)sel.value=String(BG_DIFF);
      rn();
    }
  
    // Snapshot / restore state for the undo stack
    function snapshotState(){
      return {B:B.slice(),DICE:DICE.slice(),DICE_USED:DICE_USED.slice(),
        MOVES_LEFT:MOVES_LEFT.slice(),BO_H:BO_H,BO_A:BO_A,SEL:SEL,
        VALID_DESTS:VALID_DESTS.slice(),PHASE:PHASE,TURN:TURN};
    }
    function restoreState(s){
      B=s.B.slice();DICE=s.DICE.slice();DICE_USED=s.DICE_USED.slice();
      MOVES_LEFT=s.MOVES_LEFT.slice();BO_H=s.BO_H;BO_A=s.BO_A;
      SEL=s.SEL;VALID_DESTS=s.VALID_DESTS.slice();PHASE=s.PHASE;TURN=s.TURN;
    }
  
    // Pip count: distance each side's checkers need to travel home.
    // Human goes 24→1 + bar (25). AI goes 1→24 + bar (0). Lower = closer to bearing off.
    function pipCount(side){
      var total=0;
      if(side==='human'){
        for(var i=1;i<=24;i++)if(B[i]>0)total+=B[i]*i;
        total+=(B[25]||0)*25;
        // Unborn-off checkers still need to bear off (1 pip each minimum)
        return total;
      }
      for(var i=1;i<=24;i++)if(B[i]<0)total+=Math.abs(B[i])*(25-i);
      total+=Math.abs(B[0]||0)*25;
      return total;
    }
    function rollDice(){
      var d1=Math.floor(Math.random()*6)+1,d2=Math.floor(Math.random()*6)+1;
      DICE=[d1,d2];MOVES_LEFT=d1===d2?[d1,d1,d1,d1]:[d1,d2];DICE_USED=[false,false];PHASE='move';SEL=-1;VALID_DESTS=[];
    }
    // Bar counts: human stored positive in B[25], AI stored NEGATIVE in B[0].
    // getBar/setBar speak in positive counts for both sides; only the storage signs differ.
    function getBar(w){return w==='human'?(B[25]||0):Math.abs(B[0]||0)}
    function setBar(w,v){if(w==='human')B[25]=v;else B[0]=-v}
    function myCheckers(p,w){return w==='human'?Math.max(0,B[p]):Math.max(0,-B[p])}
    function canLand(p,w){if(p<1||p>24)return false;return w==='human'?B[p]>=-1:B[p]<=1}
    function allInHome(w){
      if(getBar(w)>0)return false;
      if(w==='human'){for(var i=7;i<=25;i++)if(B[i]>0)return false;return true}
      for(var i=0;i<=18;i++)if(B[i]<0)return false;if(B[0]<0)return false;return true;
    }
    function getValidMoves(w){
      var moves=[],bar=getBar(w);
      if(bar>0){MOVES_LEFT.forEach(function(d,idx){var dest=w==='human'?(25-d):d;if(dest>=1&&dest<=24&&canLand(dest,w))moves.push({from:'bar',to:dest,die:d,dieIdx:idx})});return moves}
      var bo=allInHome(w);
      MOVES_LEFT.forEach(function(d,idx){
        var dir=w==='human'?-1:1;
        for(var p=w==='human'?24:1;w==='human'?p>=1:p<=24;p+=dir){
          if(myCheckers(p,w)<=0)continue;var dest=p+(d*dir);
          if(dest>=1&&dest<=24&&canLand(dest,w)){moves.push({from:p,to:dest,die:d,dieIdx:idx})}
          else if(bo){
            if(w==='human'&&dest<=0){if(dest===0)moves.push({from:p,to:'off',die:d,dieIdx:idx});else{var hx=false;for(var h=p+1;h<=6;h++)if(B[h]>0){hx=true;break}if(!hx)moves.push({from:p,to:'off',die:d,dieIdx:idx})}}
            else if(w==='ai'&&dest>=25){if(dest===25)moves.push({from:p,to:'off',die:d,dieIdx:idx});else{var hx2=false;for(var h2=p-1;h2>=19;h2--)if(B[h2]<0){hx2=true;break}if(!hx2)moves.push({from:p,to:'off',die:d,dieIdx:idx})}}
          }
        }
      });return moves;
    }
    function applyMove(mv,w){
      if(mv.from==='bar'){setBar(w,getBar(w)-1)}else{B[mv.from]+=(w==='human'?-1:1)}
      if(mv.to==='off'){if(w==='human')BO_H++;else BO_A++}
      else{
        if(w==='human'&&B[mv.to]===-1){B[mv.to]=0;B[0]=(B[0]||0)-1;sm('Hit! Sent to bar')}
        else if(w==='ai'&&B[mv.to]===1){B[mv.to]=0;B[25]=(B[25]||0)+1;sm('AI hits your seed!')}
        B[mv.to]+=(w==='human'?1:-1);
      }
      for(var i=0;i<MOVES_LEFT.length;i++){if(MOVES_LEFT[i]===mv.die){MOVES_LEFT.splice(i,1);break}}
    }
    function selectPt(p){
      if(PHASE!=='move'||TURN!=='human')return;
      if(SEL===-1){
        var bar=getBar('human');
        if(bar>0){if(p!=='bar'){sm('Must enter from bar first');return}SEL='bar'}
        else{if(p==='bar'||B[p]<=0)return;SEL=p}
        var moves=getValidMoves('human');VALID_DESTS=[];
        moves.forEach(function(mv){if(mv.from===SEL)VALID_DESTS.push(mv)});
        if(VALID_DESTS.length===0){SEL=-1;sm('No moves from here');return}
        rn();
      }else{
        var chosen=null;VALID_DESTS.forEach(function(mv){if(mv.to===p||(mv.to==='off'&&p==='off'))chosen=mv});
        if(!chosen){SEL=-1;VALID_DESTS=[];selectPt(p);return}
        BG_UNDO.push(snapshotState());BG_HINT=null;
        applyMove(chosen,'human');_play('tap');SEL=-1;VALID_DESTS=[];
        if(BO_H>=15){_e('game_win');_playWin();sm('All seeds home!');_sr('backgammon',{w:true,s:1});rn();return}
        if(MOVES_LEFT.length>0){var rem=getValidMoves('human');if(rem.length===0){sm('No more moves');MOVES_LEFT=[];endTurn()}else rn()}
        else endTurn();
      }
    }
    function endTurn(){
      TURN=TURN==='human'?'ai':'human';PHASE='roll';SEL=-1;VALID_DESTS=[];
      BG_UNDO=[];BG_HINT=null; // Undo only works within a turn.
      rn();
      if(TURN==='ai'){var _g=BG_GEN;bgSchedule(function(){if(_g!==BG_GEN)return;rollDice();rn();bgSchedule(function(){if(_g!==BG_GEN)return;aiPlay();},500);},400);}
    }
    // ═══ GNUBG-INSPIRED POSITION EVALUATION ═══
    function evalPos(board,boH,boA){
      var s=0;
      // Pip counts — distance each side needs to travel home.
      var aiPips=0,huPips=0;
      for(var i=1;i<=24;i++){
        if(board[i]<0)aiPips+=Math.abs(board[i])*(25-i);
        if(board[i]>0)huPips+=board[i]*i;
      }
      aiPips+=Math.abs(board[0]||0)*25;huPips+=(board[25]||0)*25;
      // Detect pure race: no contact left between checkers. When the
      // farthest-back AI piece is ahead of the farthest-back human piece,
      // no hits are possible; pip count is the entire game.
      var aiRearmost=0,huRearmost=25;
      for(var ii=1;ii<=24;ii++){
        if(board[ii]<0&&ii>aiRearmost)aiRearmost=ii;      // AI rearmost = highest-numbered occupied
        if(board[ii]>0&&ii<huRearmost)huRearmost=ii;      // Hu rearmost = lowest-numbered occupied
      }
      var pureRace=(aiRearmost!==0&&huRearmost!==25&&aiRearmost<huRearmost&&!board[0]&&!board[25]);
      // All-home check — AI can bear off when every AI piece is on 19-24.
      var aiAllHome=(board[0]===0||!board[0]);
      if(aiAllHome){for(var ah=1;ah<=18;ah++)if(board[ah]<0){aiAllHome=false;break;}}
  
      if(pureRace||aiAllHome){
        // Pure race / bearing-off mode: pip count dominates, bearing
        // off is huge. No blot/prime concerns — nothing can be hit.
        s+=(huPips-aiPips)*3.0;
        s+=boA*50;s-=boH*50;
        // Massive bonus when AI is actively bearing off — use every
        // chance to remove a piece.
        for(var b2=19;b2<=24;b2++)if(board[b2]<0)s+=Math.abs(board[b2])*(b2-18);
        return s;
      }
  
      // Contact game — full positional evaluation.
      s+=(huPips-aiPips)*0.5;
      // Blot exposure — penalize AI blots (stronger in human's home)
      for(var i=1;i<=24;i++){if(board[i]===-1){s-=12;if(i<=6)s-=8;}}
      // Prime detection — reward consecutive AI-held points
      var run=0,bestRun=0;
      for(var i=1;i<=24;i++){if(board[i]<=-2){run++;if(run>bestRun)bestRun=run}else run=0}
      s+=bestRun*bestRun*6;
      // Anchors in human home (points 1-6 held by AI) — only valuable
      // while AI still has runners back there. If AI already escaped,
      // no bonus for stray pieces.
      var aiBack=false;for(var ba=1;ba<=3;ba++)if(board[ba]<0){aiBack=true;break;}
      if(aiBack){for(var i=1;i<=6;i++)if(board[i]<=-2){s+=10;if(i>=4)s+=5;}}
      // Home board strength (AI home = 19-24)
      for(var i=19;i<=24;i++)if(board[i]<=-2)s+=8;
      // Stack penalty — too many pieces on one point is wasteful
      for(var i=1;i<=24;i++)if(board[i]<-5)s-=(Math.abs(board[i])-5)*4;
      // Bar penalty
      s+=(board[25]||0)*8;       // human on bar is good for AI
      s-=Math.abs(board[0]||0)*35; // AI on bar is terrible
      // Bearing off progress (strong)
      s+=boA*30;s-=boH*30;
      return s;
    }
    // Pick the best move for the given side. Difficulty tier changes
    // both the eval weighting and whether we do a 2-ply look-ahead.
    //   1 = seedling → random legal move (chaotic but still legal)
    //   2 = sapling  → 1-ply greedy eval (current behaviour)
    //   3 = grove    → 1-ply greedy with sharper weights
    //   4 = old growth → 1-ply + quick opponent-reply penalty
    function _bestMoveFor(side){
      var moves=getValidMoves(side);
      if(moves.length===0)return null;
      var tier=(side==='ai')?BG_DIFF:4; // hints always use the best eval
      if(tier===1&&side==='ai'){
        return moves[Math.floor(Math.random()*moves.length)];
      }
      var best=null,bs=-999999;
      for(var i=0;i<moves.length;i++){
        var mv=moves[i];
        var savedB=B.slice(),savedML=MOVES_LEFT.slice(),savedBoH=BO_H,savedBoA=BO_A;
        applyMove(mv,side);
        var sc=evalPos(B,BO_H,BO_A);
        if(side==='human')sc=-sc; // flip perspective for hints
        // Old Growth: quick 2-ply — penalize scores where opponent has
        // an obvious counter-hit. Cheap heuristic, not full expectimax.
        if(tier===4){
          var blotCount=0;
          if(side==='ai'){
            for(var bi=1;bi<=24;bi++)if(B[bi]===-1)blotCount++;
          }else{
            for(var bi2=1;bi2<=24;bi2++)if(B[bi2]===1)blotCount++;
          }
          sc-=blotCount*4;
        }
        B=savedB;MOVES_LEFT=savedML;BO_H=savedBoH;BO_A=savedBoA;
        if(sc>bs){bs=sc;best=mv;}
      }
      return best;
    }
  
    function aiPlay(){
      // Wrap in try/finally so any throw inside evalPos/applyMove
      // doesn't permanently hang the AI turn (was a HIGH risk).
      try{
        if(MOVES_LEFT.length===0){endTurn();return}
        var moves=getValidMoves('ai');if(moves.length===0){MOVES_LEFT=[];endTurn();return}
        var best=_bestMoveFor('ai');
        if(best){applyMove(best,'ai');if(BO_A>=15){_e('game_loss');sm('AI wins!');_sr('backgammon',{w:false,s:0});rn();return}}
        var _g2=BG_GEN;
        if(MOVES_LEFT.length>0)bgSchedule(function(){if(_g2===BG_GEN)aiPlay();},250);
        else bgSchedule(function(){if(_g2===BG_GEN)endTurn();},250);
        rn();
      } catch(err){
        try{console.error('[backgammon aiPlay]',err);}catch(e){}
        MOVES_LEFT=[];try{endTurn();}catch(e2){}
      }
    }
    function rPt(p,side){
      var count=B[p],who=count>0?'human':count<0?'ai':'',abs=Math.abs(count);
      var isVD=false;VALID_DESTS.forEach(function(mv){if(mv.to===p)isVD=true});
      var isSel=SEL===p,triCls=p%2===0?'dark':'light';
      var isHome=(p>=1&&p<=6)||(p>=19&&p<=24);
      var isHintSrc=BG_HINT&&BG_HINT.from===p;
      var isHintDst=BG_HINT&&BG_HINT.to===p;
      var h='<div class="point '+side+(isVD?' valid-dest':'')+(isHome?' home':'')+(isHintSrc?' hint-src':'')+'" onclick="_BGS('+p+')">';
      h+='<div class="tri '+triCls+'"></div><div class="checkers">';
      var show=Math.min(abs,5);
      for(var i=0;i<show;i++){var sc=who&&isSel&&i===show-1?' selected':'';h+='<div class="checker '+who+sc+'">';if(i===show-1&&abs>5)h+='<span class="checker-count">'+abs+'</span>';h+='</div>'}
      h+='</div><div class="pnum">'+p+'</div>';
      if(isHintDst)h+='<div class="bg-hint-dest"></div>';
      h+='</div>';
      return h;
    }
    function rn(){
      var h='';
      document.getElementById('BGh').textContent=BO_H;document.getElementById('BGa').textContent=BO_A;
      var st=PHASE==='roll'?(TURN==='human'?'Tap Roll':'AI rolling...'):PHASE==='move'?(TURN==='human'?(SEL!==-1?'Tap where to move':'Tap a seed to move'):'AI thinking...'):'Game Over';
      sm(st);
      // Board wrapper (portrait: single column; landscape: left side)
      h+='<div class="bg-wrap">';
      h+='<div class="bg-board"><div class="bg-inner">';
      // Top half: points 13-18, bar, 19-24 (AI home on right)
      h+='<div class="bg-half"><div class="bg-quad">';
      for(var p=13;p<=18;p++)h+=rPt(p,'top');
      h+='</div><div class="bg-bar">';
      if(B[0]<0){var ab=Math.abs(B[0]);for(var i=0;i<Math.min(ab,4);i++)h+='<div class="checker ai"></div>';if(ab>4)h+='<div style="font-size:9px;color:#C47A7A">+'+(ab-4)+'</div>'}
      h+='</div><div class="bg-quad">';
      for(var p2=19;p2<=24;p2++)h+=rPt(p2,'top');
      h+='</div></div>';
      h+='<div class="bg-sep"></div>';
      // Bottom half: 12-7, bar, 6-1 (Player home on right)
      h+='<div class="bg-half"><div class="bg-quad">';
      for(var p3=12;p3>=7;p3--)h+=rPt(p3,'bot');
      h+='</div><div class="bg-bar">';
      if(B[25]>0){for(var i2=0;i2<Math.min(B[25],4);i2++)h+='<div class="checker human"></div>';if(B[25]>4)h+='<div style="font-size:9px;color:#7AB956">+'+(B[25]-4)+'</div>'}
      h+='</div><div class="bg-quad">';
      for(var p4=6;p4>=1;p4--)h+=rPt(p4,'bot');
      h+='</div></div>';
      // Dice overlay (floats over the center bar)
      h+='<div class="bg-dice">';
      if(PHASE==='roll'&&TURN==='human'){
        h+='<button class="gb bg-roll-btn" onclick="_BGR()">🎲 ROLL</button>';
      }else if(PHASE==='move'||PHASE==='gameover'){
        DICE.forEach(function(d){var used=MOVES_LEFT.indexOf(d)===-1;h+='<div class="bg-die'+(used?' used':'')+'">'+d+'</div>'});
        if(DICE[0]===DICE[1])h+='<span class="bg-doubles">×'+MOVES_LEFT.length+'</span>';
      }
      h+='</div>';
      h+='</div></div>';
      // End of .bg-wrap
      h+='</div>';
      // Sidebar: pip counts, bearing-off, bar info, controls
      h+='<div class="bg-sidebar">';
      // Pip count — signature stat for serious backgammon players
      var pipYou=pipCount('human'),pipAi=pipCount('ai');
      h+='<div class="bg-pips">';
      h+='<div class="bg-pip-you">YOU PIPS <strong>'+pipYou+'</strong></div>';
      h+='<div class="bg-pip-ai">AI PIPS <strong>'+pipAi+'</strong></div>';
      h+='</div>';
      // Bearing off display
      h+='<div class="bg-bo">';
      h+='<div class="bg-bo-sec"><span class="bg-bo-lbl" style="color:#7AB956">YOU: '+BO_H+'/15</span>';
      for(var bi2=0;bi2<Math.min(BO_H,15);bi2++)h+='<div class="bg-bo-pip human"></div>';
      h+='</div>';
      h+='<div class="bg-bo-sec"><span class="bg-bo-lbl" style="color:#C47A7A">AI: '+BO_A+'/15</span>';
      for(var bi=0;bi<Math.min(BO_A,15);bi++)h+='<div class="bg-bo-pip ai"></div>';
      h+='</div></div>';
      // Bar info
      if(B[25]>0||B[0]<0){h+='<div class="bg-info">';if(B[25]>0)h+='🌿 You: '+B[25]+' on bar ';if(B[0]<0)h+='🌸 AI: '+Math.abs(B[0])+' on bar';h+='</div>'}
      // Tools row: Undo + Hint — only meaningful mid-turn as human
      if(PHASE==='move'&&TURN==='human'){
        h+='<div class="bg-tools">';
        h+='<button class="gb" onclick="_BGUndo()" '+(BG_UNDO.length===0?'disabled style="opacity:0.4"':'')+'>↩ UNDO</button>';
        h+='<button class="gb" onclick="_BGHint()" '+(BG_HINT?'disabled style="opacity:0.4"':'')+'>💡 HINT</button>';
        h+='</div>';
      }
      // Bar entry button
      if(PHASE==='move'&&TURN==='human'&&getBar('human')>0){h+='<div style="text-align:center;padding:6px"><button class="gb" onclick="_BGS(\'bar\')" style="min-height:52px;font-size:0.8rem;min-width:160px">↩ ENTER FROM BAR</button></div>'}
      // Bear off buttons
      if(PHASE==='move'&&TURN==='human'&&allInHome('human')&&MOVES_LEFT.length>0){
        var bom=getValidMoves('human').filter(function(m){return m.to==='off'});
        if(bom.length>0){h+='<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;padding:6px">';bom.forEach(function(m){h+='<button class="gb" onclick="_BGB('+m.from+','+m.die+')" style="min-height:52px;font-size:0.7rem">BEAR OFF PT.'+m.from+'</button>'});h+='</div>'}
      }
      h+='</div>'; // close .bg-sidebar
      wrap.innerHTML=h;
    }
    window._BGR=function(){if(PHASE!=='roll'||TURN!=='human')return;BG_UNDO=[];BG_HINT=null;rollDice();_play('dice');var moves=getValidMoves('human');if(moves.length===0){sm('No valid moves, turn forfeited');MOVES_LEFT=[];rn();setTimeout(endTurn,1000);return}rn()};
    window._BGS=function(p){selectPt(p)};
    window._BGB=function(from,die){
      var moves=getValidMoves('human');var mv=null;
      moves.forEach(function(m){if(m.from===from&&m.die===die&&m.to==='off')mv=m});
      if(!mv)return;
      BG_UNDO.push(snapshotState());BG_HINT=null;
      applyMove(mv,'human');_play('tap');SEL=-1;VALID_DESTS=[];
      if(BO_H>=15){_e('game_win');_playWin();sm('All seeds home!');_sr('backgammon',{w:true,s:1});rn();return}
      if(MOVES_LEFT.length>0){var rem=getValidMoves('human');if(rem.length===0){MOVES_LEFT=[];endTurn()}else rn()}
      else endTurn();
    };
    // Undo — restore the snapshot from before the last human move.
    // Only works within the current turn (stack cleared on endTurn).
    window._BGUndo=function(){
      if(BG_UNDO.length===0)return;
      if(TURN!=='human'||PHASE!=='move')return;
      var snap=BG_UNDO.pop();
      restoreState(snap);
      BG_HINT=null;
      _play('tap');
      sm('Undone');
      rn();
    };
    // Hint — compute the best human move with the best-eval tier, show
    // it as a pulsing dashed ring on the destination for 3 seconds.
    // Does not commit the move — the player still has to play it.
    window._BGHint=function(){
      if(TURN!=='human'||PHASE!=='move'||MOVES_LEFT.length===0)return;
      var best=_bestMoveFor('human');
      if(!best){sm('No hint — no valid moves');return;}
      BG_HINT={from:best.from,to:best.to,die:best.die};
      _play('tap');
      var fromLabel=best.from==='bar'?'bar':('point '+best.from);
      var toLabel=best.to==='off'?'off':('point '+best.to);
      sm('Hint: '+fromLabel+' → '+toLabel+' (die '+best.die+')');
      rn();
      bgSchedule(function(){BG_HINT=null;rn();},3500);
    };
    // Difficulty selector handler — writes to localStorage + rerenders.
    window._BGSetDiff=function(v){
      var n=parseInt(v,10);if(isNaN(n)||n<1||n>4)return;
      BG_DIFF=n;
      try{localStorage.setItem('lw_bg_diff',String(n));}catch(e){}
    };
    window._BGN=function(){init()};
    init();
  }

  window._gameFns['backgammon']=GBG;
})();
