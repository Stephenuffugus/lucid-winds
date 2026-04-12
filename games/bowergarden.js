// ═══ BOWER GARDEN — Euchre (trick-taking partnership) ═══
// 4-player partnership card game: you + partner vs 2 AI opponents.
// 24-card deck, bowers, trump calling, first team to 10 wins.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

window._gameFns = window._gameFns || {};
window._gameFns.bowergarden = function BG(a){
  var SUITS=['hearts','diamonds','clubs','spades'];
  var SUIT_ICONS={hearts:'♥',diamonds:'♦',clubs:'♣',spades:'♠'};
  var RANKS=['9','10','J','Q','K','A'];
  var RANK_ORDER={9:0,10:1,J:2,Q:3,K:4,A:5};
  var SAME_COLOR={hearts:'diamonds',diamonds:'hearts',clubs:'spades',spades:'clubs'};
  var SOUTH=0,WEST=1,NORTH=2,EAST=3;
  var PLAYER_NAMES=['You','West','Partner','East'];

  var hands=[[],[],[],[]];
  var trick=[],trickCards=[null,null,null,null];
  var trumpSuit='',upcard=null,dealer=EAST,leader=0,currentPlayer=0;
  var teamScore=[0,0],teamTricks=[0,0];
  var callingTeam=-1,phase='',roundNum=0;

  ms(a,'🃏 <strong id="BGs">0</strong> - <strong id="BGo">0</strong>');
  mm(a);
  var pan=document.createElement('div');
  pan.id='BGpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:6px;user-select:none;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb-new" onclick="_BGN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  function makeDeck(){var d=[];for(var si=0;si<SUITS.length;si++)for(var ri=0;ri<RANKS.length;ri++)d.push({rank:RANKS[ri],suit:SUITS[si]});return d;}
  function shuf(ar){for(var i=ar.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=ar[i];ar[i]=ar[j];ar[j]=t;}return ar;}
  function deal(){
    var deck=shuf(makeDeck());
    hands=[[],[],[],[]];
    for(var i=0;i<20;i++)hands[i%4].push(deck[i]);
    upcard=deck[20];
    trumpSuit='';teamTricks=[0,0];callingTeam=-1;trick=[];trickCards=[null,null,null,null];
  }
  function effSuit(c,t){if(c.rank==='J'&&c.suit===SAME_COLOR[t])return t;return c.suit;}
  function cardVal(c,t,ls){
    var es=effSuit(c,t);
    if(c.rank==='J'&&c.suit===t)return 100;
    if(c.rank==='J'&&c.suit===SAME_COLOR[t])return 99;
    if(es===t)return 50+RANK_ORDER[c.rank];
    if(es===ls)return 20+RANK_ORDER[c.rank];
    return RANK_ORDER[c.rank];
  }
  function playable(hand,t,ls){
    if(!ls)return hand.slice();
    var f=hand.filter(function(c){return effSuit(c,t)===ls;});
    return f.length>0?f:hand.slice();
  }
  function trickWin(tp,t){
    var ls=effSuit(tp[0].card,t);var best=0;var bv=cardVal(tp[0].card,t,ls);
    for(var i=1;i<tp.length;i++){var v=cardVal(tp[i].card,t,ls);if(v>bv){bv=v;best=i;}}
    return tp[best].player;
  }
  function aiOrderUp(p,uc){
    var hand=hands[p];var t=uc.suit;var s=0;
    for(var i=0;i<hand.length;i++){
      var es=effSuit(hand[i],t);
      if(es===t){
        if(hand[i].rank==='J'&&hand[i].suit===t)s+=4;
        else if(hand[i].rank==='J'&&hand[i].suit===SAME_COLOR[t])s+=3.5;
        else if(hand[i].rank==='A')s+=2;
        else if(hand[i].rank==='K')s+=1.5;
        else s+=0.5;
      }else if(hand[i].rank==='A')s+=1;
    }
    if(p===dealer)s+=1;
    if((p+2)%4===dealer)s+=0.5;
    return s>=4;
  }
  function aiPickTrump(p){
    var hand=hands[p];var bs='',bv=0;
    for(var si=0;si<SUITS.length;si++){
      var suit=SUITS[si];if(suit===upcard.suit)continue;
      var s=0;
      for(var i=0;i<hand.length;i++){
        var es=effSuit(hand[i],suit);
        if(es===suit){
          if(hand[i].rank==='J')s+=4;
          else if(hand[i].rank==='A')s+=2;
          else if(hand[i].rank==='K')s+=1.5;
          else s+=0.5;
        }else if(hand[i].rank==='A')s+=0.8;
      }
      if(s>bv){bv=s;bs=suit;}
    }
    return bv>=3.5?bs:'';
  }
  function aiPlayCard(p){
    var hand=hands[p];
    var ls=trick.length>0?effSuit(trick[0].card,trumpSuit):'';
    var pl=playable(hand,trumpSuit,ls);
    if(pl.length===1)return pl[0];
    var partner=(p+2)%4,isLead=trick.length===0,isLast=trick.length===3;
    if(isLead){
      var tc=pl.filter(function(c){return effSuit(c,trumpSuit)===trumpSuit;});
      var oa=pl.filter(function(c){return c.rank==='A'&&effSuit(c,trumpSuit)!==trumpSuit;});
      if(tc.length>=3){tc.sort(function(x,y){return cardVal(y,trumpSuit,trumpSuit)-cardVal(x,trumpSuit,trumpSuit);});return tc[0];}
      if(oa.length>0)return oa[0];
      pl.sort(function(x,y){return cardVal(x,trumpSuit,ls||'x')-cardVal(y,trumpSuit,ls||'x');});
      return pl[0];
    }
    var wSoFar=trick.length>0?trickWin(trick,trumpSuit):-1;
    var pWin=(wSoFar===partner);
    if(pWin){pl.sort(function(x,y){return cardVal(x,trumpSuit,ls)-cardVal(y,trumpSuit,ls);});return pl[0];}
    if(isLast){
      var ch=0;for(var t=0;t<trick.length;t++){var v=cardVal(trick[t].card,trumpSuit,ls);if(v>ch)ch=v;}
      var w=pl.filter(function(c){return cardVal(c,trumpSuit,ls)>ch;});
      if(w.length>0){w.sort(function(x,y){return cardVal(x,trumpSuit,ls)-cardVal(y,trumpSuit,ls);});return w[0];}
      pl.sort(function(x,y){return cardVal(x,trumpSuit,ls)-cardVal(y,trumpSuit,ls);});return pl[0];
    }
    var ch2=0;for(var t2=0;t2<trick.length;t2++){var v2=cardVal(trick[t2].card,trumpSuit,ls);if(v2>ch2)ch2=v2;}
    var w2=pl.filter(function(c){return cardVal(c,trumpSuit,ls)>ch2;});
    if(w2.length>0){w2.sort(function(x,y){return cardVal(x,trumpSuit,ls)-cardVal(y,trumpSuit,ls);});return w2[0];}
    pl.sort(function(x,y){return cardVal(x,trumpSuit,ls)-cardVal(y,trumpSuit,ls);});return pl[0];
  }
  function newHand(){
    roundNum++;dealer=(dealer+1)%4;deal();
    leader=(dealer+1)%4;currentPlayer=leader;phase='call1';render();
    if(currentPlayer!==SOUTH)setTimeout(aiCall1,600);
  }
  function aiCall1(){
    if(phase!=='call1')return;
    if(aiOrderUp(currentPlayer,upcard)){orderUp(currentPlayer);return;}
    sm(PLAYER_NAMES[currentPlayer]+' passes');
    currentPlayer=(currentPlayer+1)%4;
    if(currentPlayer===leader){phase='call2';currentPlayer=leader;
      if(currentPlayer!==SOUTH)setTimeout(aiCall2,600);else render();return;}
    render();if(currentPlayer!==SOUTH)setTimeout(aiCall1,600);
  }
  function aiCall2(){
    if(phase!=='call2')return;
    var suit=aiPickTrump(currentPlayer);
    if(suit){callTrump(currentPlayer,suit);return;}
    if(currentPlayer===dealer){
      var fb=aiPickTrump(currentPlayer);
      if(!fb){var opts=SUITS.filter(function(x){return x!==upcard.suit;});fb=opts[Math.floor(Math.random()*opts.length)];}
      callTrump(currentPlayer,fb);return;
    }
    sm(PLAYER_NAMES[currentPlayer]+' passes');
    currentPlayer=(currentPlayer+1)%4;render();
    if(currentPlayer!==SOUTH)setTimeout(aiCall2,600);
  }
  function orderUp(p){
    trumpSuit=upcard.suit;callingTeam=p%2;
    sm(PLAYER_NAMES[p]+' orders up '+SUIT_ICONS[trumpSuit]);
    var dh=hands[dealer];dh.push(upcard);
    dh.sort(function(x,y){return cardVal(x,trumpSuit,'x')-cardVal(y,trumpSuit,'x');});
    dh.shift();
    startPlay();
  }
  function callTrump(p,suit){
    trumpSuit=suit;callingTeam=p%2;
    sm(PLAYER_NAMES[p]+' calls '+SUIT_ICONS[suit]);
    startPlay();
  }
  function startPlay(){
    phase='play';currentPlayer=leader;trick=[];trickCards=[null,null,null,null];
    render();
    if(currentPlayer!==SOUTH)setTimeout(aiPlay,700);
  }
  function aiPlay(){
    if(phase!=='play'||currentPlayer===SOUTH)return;
    playCard(currentPlayer,aiPlayCard(currentPlayer));
  }
  function playCard(p,card){
    var hand=hands[p];var idx=-1;
    for(var i=0;i<hand.length;i++)if(hand[i].rank===card.rank&&hand[i].suit===card.suit){idx=i;break;}
    if(idx<0)return;
    hand.splice(idx,1);
    trick.push({player:p,card:card});trickCards[p]=card;render();
    if(trick.length===4){
      phase='trickDone';
      var winner=trickWin(trick,trumpSuit);var wt=winner%2;teamTricks[wt]++;
      setTimeout(function(){
        sm(PLAYER_NAMES[winner]+' wins the trick');
        setTimeout(function(){
          trick=[];trickCards=[null,null,null,null];
          if(teamTricks[0]+teamTricks[1]>=5){scoreHand();return;}
          leader=winner;currentPlayer=leader;phase='play';render();
          if(currentPlayer!==SOUTH)setTimeout(aiPlay,600);
        },800);
      },600);
      return;
    }
    currentPlayer=(currentPlayer+1)%4;render();
    if(currentPlayer!==SOUTH)setTimeout(aiPlay,500);
  }
  function scoreHand(){
    phase='handDone';
    var ct=teamTricks[callingTeam],dt=teamTricks[1-callingTeam];
    var pts=0,team=-1;
    if(ct>=3){team=callingTeam;pts=ct===5?2:1;}
    else{team=1-callingTeam;pts=2;}
    teamScore[team]+=pts;
    var tn=team===0?'Your team':'Opponents';
    sm(tn+' +'+pts);_e('milestone');
    if(ct===5||dt===0)_e('progress');
    if(teamScore[0]>=10||teamScore[1]>=10){
      phase='gameOver';
      setTimeout(function(){
        var won=teamScore[0]>=10;
        if(won){_e('game_win');_playWin();sm('🃏 You win! '+teamScore[0]+'-'+teamScore[1]);}
        else{_e('game_loss');_play('lose');sm('Garden resting. '+teamScore[0]+'-'+teamScore[1]);}
        _sr('bowergarden',{w:won,s:teamScore[0],r:roundNum});
      },1000);
      return;
    }
    setTimeout(newHand,2000);
  }
  function onCardClick(card){
    if(phase!=='play'||currentPlayer!==SOUTH)return;
    var ls=trick.length>0?effSuit(trick[0].card,trumpSuit):'';
    var pl=playable(hands[SOUTH],trumpSuit,ls);
    var ok=false;
    for(var i=0;i<pl.length;i++)if(pl[i].rank===card.rank&&pl[i].suit===card.suit){ok=true;break;}
    if(!ok)return;
    playCard(SOUTH,card);
  }
  function render(){
    var ps=document.getElementById('BGs');if(ps)ps.textContent=teamScore[0];
    var os=document.getElementById('BGo');if(os)os.textContent=teamScore[1];
    var h='';
    // Score banner
    h+='<div style="background:linear-gradient(135deg,rgba(26,31,23,0.85),rgba(13,16,12,0.9));border:1.5px solid rgba(122,179,86,0.25);border-radius:10px;padding:8px 12px;margin:4px 0;display:flex;justify-content:space-around;align-items:center;font-family:Bebas Neue,sans-serif;font-size:0.85rem;">';
    h+='<div><span style="color:var(--sage);">YOU + PARTNER</span> <strong style="color:var(--gold);font-size:1.1rem;">'+teamScore[0]+'</strong> <span style="color:var(--muted);font-size:0.55rem;">Tricks:'+teamTricks[0]+'</span></div>';
    h+='<div><span style="color:#c47a7a;">OPPONENTS</span> <strong style="color:var(--gold);font-size:1.1rem;">'+teamScore[1]+'</strong> <span style="color:var(--muted);font-size:0.55rem;">Tricks:'+teamTricks[1]+'</span></div>';
    h+='</div>';
    // Trump indicator
    if(trumpSuit){
      h+='<div style="text-align:center;padding:4px;font-family:DM Mono,monospace;font-size:0.7rem;color:var(--gold);">TRUMP: <span style="font-size:1.2rem;vertical-align:middle;color:'+(trumpSuit==='hearts'||trumpSuit==='diamonds'?'#c47a7a':'var(--cream)')+';">'+SUIT_ICONS[trumpSuit]+'</span></div>';
    }
    // North (partner) hand - face down
    h+='<div style="text-align:center;padding:4px;"><div style="font-size:0.5rem;color:var(--muted);margin-bottom:3px;">PARTNER</div><div style="display:flex;gap:2px;justify-content:center;">';
    for(var n=0;n<hands[NORTH].length;n++)h+='<div style="width:32px;height:44px;border-radius:5px;background:linear-gradient(135deg,#4A7C35,#3a6028);border:1.5px solid #2d4a1e;"></div>';
    h+='</div></div>';
    // Middle: West | Trick | East
    h+='<div style="display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;padding:6px 4px;min-height:120px;">';
    // West
    h+='<div><div style="font-size:0.5rem;color:var(--muted);text-align:center;margin-bottom:3px;">WEST</div><div style="display:flex;flex-direction:column;gap:2px;">';
    for(var w=0;w<hands[WEST].length;w++)h+='<div style="width:28px;height:40px;border-radius:5px;background:linear-gradient(135deg,#4A7C35,#3a6028);border:1.5px solid #2d4a1e;"></div>';
    h+='</div></div>';
    // Trick area
    h+='<div style="position:relative;min-height:120px;background:rgba(26,31,23,0.3);border-radius:8px;">';
    if(upcard&&phase==='call1'){
      var ucol=upcard.suit==='hearts'||upcard.suit==='diamonds'?'#c47a7a':'#1a1f17';
      h+='<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#F5F0E1;color:'+ucol+';border:2px solid #C4B998;border-radius:6px;padding:6px;font-weight:700;">';
      h+='<div style="font-size:0.8rem;">'+upcard.rank+'</div><div style="font-size:1.1rem;text-align:center;">'+SUIT_ICONS[upcard.suit]+'</div></div>';
    }
    // Played cards positioned
    var pos={};pos[SOUTH]='bottom:6px;left:50%;transform:translateX(-50%);';pos[WEST]='left:6px;top:50%;transform:translateY(-50%);';pos[NORTH]='top:6px;left:50%;transform:translateX(-50%);';pos[EAST]='right:6px;top:50%;transform:translateY(-50%);';
    for(var pl=0;pl<4;pl++){
      var c=trickCards[pl];if(!c)continue;
      var col=c.suit==='hearts'||c.suit==='diamonds'?'#c47a7a':'#1a1f17';
      h+='<div style="position:absolute;'+pos[pl]+'background:#F5F0E1;color:'+col+';border:2px solid '+(pl%2===0?'#4A7C35':'#C47A7A')+';border-radius:6px;padding:4px 6px;font-weight:700;font-size:0.7rem;">';
      h+='<div>'+c.rank+'</div><div style="font-size:0.9rem;text-align:center;">'+SUIT_ICONS[c.suit]+'</div></div>';
    }
    h+='</div>';
    // East
    h+='<div><div style="font-size:0.5rem;color:var(--muted);text-align:center;margin-bottom:3px;">EAST</div><div style="display:flex;flex-direction:column;gap:2px;">';
    for(var e=0;e<hands[EAST].length;e++)h+='<div style="width:28px;height:40px;border-radius:5px;background:linear-gradient(135deg,#4A7C35,#3a6028);border:1.5px solid #2d4a1e;"></div>';
    h+='</div></div>';
    h+='</div>';
    // South (player) hand
    h+='<div style="padding:4px;"><div style="font-size:0.5rem;color:var(--muted);text-align:center;margin-bottom:3px;">YOUR HAND</div>';
    h+='<div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap;">';
    var ls=trick.length>0?effSuit(trick[0].card,trumpSuit):'';
    var pl2=phase==='play'&&currentPlayer===SOUTH?playable(hands[SOUTH],trumpSuit,ls):[];
    for(var k=0;k<hands[SOUTH].length;k++){
      var cc=hands[SOUTH][k];var canPlay=false;
      for(var m=0;m<pl2.length;m++)if(pl2[m].rank===cc.rank&&pl2[m].suit===cc.suit){canPlay=true;break;}
      var ccol=cc.suit==='hearts'||cc.suit==='diamonds'?'#c47a7a':'#1a1f17';
      var bc=canPlay?'#7AB956':'#C4B998';
      var sty='width:46px;height:64px;border-radius:6px;background:#F5F0E1;color:'+ccol+';border:2px solid '+bc+';display:inline-flex;flex-direction:column;align-items:center;justify-content:center;font-weight:700;position:relative;';
      if(canPlay)sty+='cursor:pointer;box-shadow:0 2px 8px rgba(122,179,86,0.3);';
      var oc=canPlay?' onclick="_BGCC(\''+cc.rank+'\',\''+cc.suit+'\')"':'';
      h+='<div style="'+sty+'"'+oc+'><span style="font-size:0.75rem;position:absolute;top:2px;left:4px;">'+cc.rank+'</span><span style="font-size:1.1rem;">'+SUIT_ICONS[cc.suit]+'</span></div>';
    }
    h+='</div></div>';
    // Call UI
    if(phase==='call1'&&currentPlayer===SOUTH){
      h+='<div style="padding:8px;text-align:center;background:rgba(26,31,23,0.5);border-radius:8px;margin:6px 0;">';
      h+='<div style="font-size:0.6rem;color:var(--muted);margin-bottom:6px;">Order up '+SUIT_ICONS[upcard.suit]+' as trump?</div>';
      h+='<div style="display:flex;gap:6px;justify-content:center;">';
      h+='<button class="gb" onclick="_BGORD()" style="min-height:44px;padding:8px 16px;background:rgba(200,168,75,0.15);border-color:rgba(200,168,75,0.4);color:var(--gold);">ORDER UP '+SUIT_ICONS[upcard.suit]+'</button>';
      h+='<button class="gb" onclick="_BGP1()" style="min-height:44px;padding:8px 16px;">PASS</button>';
      h+='</div></div>';
    }
    if(phase==='call2'&&currentPlayer===SOUTH){
      h+='<div style="padding:8px;text-align:center;background:rgba(26,31,23,0.5);border-radius:8px;margin:6px 0;">';
      h+='<div style="font-size:0.6rem;color:var(--muted);margin-bottom:6px;">Name trump (not '+SUIT_ICONS[upcard.suit]+'):</div>';
      h+='<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">';
      for(var si=0;si<SUITS.length;si++){
        if(SUITS[si]===upcard.suit)continue;
        var icol=SUITS[si]==='hearts'||SUITS[si]==='diamonds'?'#c47a7a':'var(--cream)';
        h+='<button class="gb" onclick="_BGCT(\''+SUITS[si]+'\')" style="min-height:48px;min-width:48px;padding:6px 14px;font-size:1.4rem;color:'+icol+';">'+SUIT_ICONS[SUITS[si]]+'</button>';
      }
      if(currentPlayer!==dealer)h+='<button class="gb" onclick="_BGP2()" style="min-height:44px;padding:8px 16px;">PASS</button>';
      h+='</div></div>';
    }
    pan.innerHTML=h;
  }

  window._BGN=function(){teamScore=[0,0];roundNum=0;dealer=EAST;newHand();};
  window._BGCC=function(r,s){onCardClick({rank:r,suit:s});};
  window._BGORD=function(){
    if(phase!=='call1'||currentPlayer!==SOUTH)return;
    orderUp(SOUTH);
  };
  window._BGP1=function(){
    if(phase!=='call1'||currentPlayer!==SOUTH)return;
    sm('You pass');
    currentPlayer=(currentPlayer+1)%4;
    if(currentPlayer===leader){phase='call2';currentPlayer=leader;}
    render();
    if(currentPlayer!==SOUTH)setTimeout(phase==='call1'?aiCall1:aiCall2,600);
  };
  window._BGP2=function(){
    if(phase!=='call2'||currentPlayer!==SOUTH)return;
    sm('You pass');
    currentPlayer=(currentPlayer+1)%4;render();
    if(currentPlayer!==SOUTH)setTimeout(aiCall2,600);
  };
  window._BGCT=function(suit){
    if(phase!=='call2'||currentPlayer!==SOUTH)return;
    callTrump(SOUTH,suit);
  };

  _BGN();
};
})();
