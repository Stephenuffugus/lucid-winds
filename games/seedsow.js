// ═══ LUCID WINDS — Seed Sow (Mancala / Kalah) ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr;


window._gameFns=window._gameFns||{};
window._gameFns.seedsow=function SS(a){
  // Board indices: 0-5 player pits, 6 player store, 7-12 AI pits, 13 AI store
  // Sow counterclockwise: 0->1->2->3->4->5->6->7->...->12->13->0
  // Player skips index 13 (AI store). AI skips index 6 (player store).
  var board=[];
  var turn=0; // 0=player, 1=AI
  var busy=false;
  var difficulty=1; // 0=easy random, 1=medium greedy

  ms(a,'Seed Sow · <span id="SWm">Your turn</span>');
  mm(a);
  var pan=document.createElement('div');pan.id='SWpan';
  // Bumped max-width for breathing room and switched padding to be
  // box-sizing safe so the right edge stops getting clipped.
  pan.style.cssText='max-width:min(96vw,460px);width:100%;margin:0 auto;padding:6px 6px 10px;box-sizing:border-box;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb" onclick="_SWD(0)" id="SWd0">EASY</button> <button class="gb" onclick="_SWD(1)" id="SWd1">MED</button> <button class="gb" onclick="_SWN()">🌱 NEW</button>';

  function newGame(){
    board=[4,4,4,4,4,4,0,4,4,4,4,4,4,0];
    turn=0;busy=false;
    sm('Your turn');render();
  }

  function validPits(side){
    var out=[];var start=side===0?0:7;
    for(var i=0;i<6;i++)if(board[start+i]>0)out.push(start+i);
    return out;
  }

  function opposite(idx){
    // pit 0 <-> 12, 1 <-> 11, ... 5 <-> 7
    if(idx>=0&&idx<=5)return 12-idx;
    if(idx>=7&&idx<=12)return 12-idx;
    return -1;
  }

  function nextIdx(i,side){
    i=(i+1)%14;
    // Skip opponent's store
    if(side===0&&i===13)i=0;
    if(side===1&&i===6)i=7;
    return i;
  }

  function sow(pit,side,cb){
    var seeds=board[pit];board[pit]=0;
    var idx=pit;
    var delay=180;
    function step(){
      if(seeds<=0){
        // Last seed settled at idx
        var myStore=side===0?6:13;
        var myStart=side===0?0:7,myEnd=side===0?5:12;
        var extraTurn=(idx===myStore);
        // Capture rule: last seed in own empty pit, opposite has seeds
        if(idx>=myStart&&idx<=myEnd&&board[idx]===1){
          var opp=opposite(idx);
          if(board[opp]>0){
            board[myStore]+=board[opp]+1;
            board[opp]=0;board[idx]=0;
            _e('progress');
          }
        }
        render();
        if(checkEnd()){cb(false);return;}
        cb(extraTurn);
        return;
      }
      idx=nextIdx(idx,side);
      board[idx]++;seeds--;
      render();
      setTimeout(step,delay);
    }
    setTimeout(step,delay);
  }

  function checkEnd(){
    var ps=0,as=0;
    for(var i=0;i<6;i++){ps+=board[i];as+=board[7+i];}
    if(ps===0||as===0){
      // Collect remaining
      for(i=0;i<6;i++){board[6]+=board[i];board[i]=0;board[13]+=board[7+i];board[7+i]=0;}
      render();
      var pp=board[6],ap=board[13];
      var won=pp>ap;
      if(won){_e('game_win');_playWin();sm('✓ You win! '+pp+' vs '+ap);}
      else if(pp<ap){_e('game_loss');_play('lose');sm('AI wins. '+pp+' vs '+ap);}
      else{sm('Tie. '+pp+' each');}
      _sr('seedsow',{w:won,s:pp});
      busy=true;
      return true;
    }
    return false;
  }

  function playerMove(pit){
    if(busy||turn!==0)return;
    if(pit<0||pit>5||board[pit]===0)return;
    busy=true;
    sow(pit,0,function(extra){
      if(!extra){turn=1;sm('AI thinking...');setTimeout(aiMove,700);}
      else{sm('Free turn!');busy=false;}
    });
  }

  function aiPick(){
    var moves=validPits(1);
    if(moves.length===0)return -1;
    if(difficulty===0)return moves[Math.floor(Math.random()*moves.length)];
    // Greedy: score each move
    var best=moves[0],bestScore=-Infinity;
    for(var i=0;i<moves.length;i++){
      var m=moves[i],seeds=board[m],idx=m;
      var s=0;
      // Simulate lightly
      for(var k=0;k<seeds;k++){idx=nextIdx(idx,1);}
      if(idx===13)s+=10; // free turn
      // Capture?
      if(idx>=7&&idx<=12&&board[idx]===0){
        var opp=opposite(idx);
        if(board[opp]>0)s+=board[opp]+1;
      }
      s+=(seeds===13-m?5:0);
      if(s>bestScore){bestScore=s;best=m;}
    }
    return best;
  }

  function aiMove(){
    if(turn!==1)return;
    var pit=aiPick();
    if(pit<0){turn=0;busy=false;sm('Your turn');return;}
    sow(pit,1,function(extra){
      if(!extra){turn=0;busy=false;sm('Your turn');}
      else{sm('AI gets another turn');setTimeout(aiMove,700);}
    });
  }

  function render(){
    var h='';
    h+='<div style="display:grid;grid-template-columns:52px repeat(6,1fr) 52px;gap:3px;align-items:center;margin:8px 0;width:100%;box-sizing:border-box;">';
    // AI store
    h+='<div style="grid-row:span 2;background:rgba(26,31,23,0.6);border:2px solid rgba(196,122,122,0.4);border-radius:30px;padding:14px 4px;text-align:center;font-family:Bebas Neue,sans-serif;color:var(--cream);min-height:120px;display:flex;flex-direction:column;justify-content:center;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.85rem;color:#e8a0a0;letter-spacing:0.1em;">AI</div><div style="font-size:1.5rem;color:var(--gold);">'+board[13]+'</div></div>';
    // AI pits row (right to left: board[12..7])
    for(var i=12;i>=7;i--){
      h+='<div style="background:rgba(26,31,23,0.5);border:2px solid rgba(196,122,122,0.25);border-radius:50%;aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-family:Bebas Neue,sans-serif;font-size:1.1rem;color:var(--cream);min-height:44px;">'+board[i]+'</div>';
    }
    // Player store (spans both rows, on right)
    h+='<div style="grid-row:span 2;background:rgba(26,31,23,0.6);border:2px solid rgba(122,179,86,0.4);border-radius:30px;padding:14px 4px;text-align:center;font-family:Bebas Neue,sans-serif;color:var(--cream);min-height:120px;display:flex;flex-direction:column;justify-content:center;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.85rem;color:var(--sage);letter-spacing:0.1em;">YOU</div><div style="font-size:1.5rem;color:var(--gold);">'+board[6]+'</div></div>';
    // Player pits row (0..5)
    for(i=0;i<6;i++){
      var canPlay=(turn===0&&!busy&&board[i]>0);
      var bc=canPlay?'#7ab356':'rgba(122,179,86,0.25)';
      var bg=canPlay?'rgba(122,179,86,0.15)':'rgba(26,31,23,0.5)';
      var cur=canPlay?'pointer':'default';
      h+='<div onclick="_SWP('+i+')" style="background:'+bg+';border:2px solid '+bc+';border-radius:50%;aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-family:Bebas Neue,sans-serif;font-size:1.1rem;color:var(--cream);cursor:'+cur+';min-height:44px;">'+board[i]+'</div>';
    }
    h+='</div>';
    pan.innerHTML=h;
    var d0=document.getElementById('SWd0'),d1=document.getElementById('SWd1');
    if(d0)d0.style.opacity=difficulty===0?'1':'0.5';
    if(d1)d1.style.opacity=difficulty===1?'1':'0.5';
  }

  window._SWP=function(i){playerMove(i);};
  window._SWN=function(){newGame();};
  window._SWD=function(d){difficulty=d;render();};

  newGame();
};
})();
