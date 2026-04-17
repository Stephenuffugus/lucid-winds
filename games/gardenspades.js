// ═══ GARDEN SPADES — Partnership Spades card game ═══
// 4-player trick-taking, spades always trump. Bid your tricks, don't bag out.
// First team to 500 wins. -200 loses. 10 bags = -100 penalty.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;

window._gameFns = window._gameFns || {};
window._gameFns.gardenspades = function GardenSpades(a){
  var SUITS=['clubs','diamonds','hearts','spades'];
  var SI={clubs:'♣',diamonds:'♦',hearts:'♥',spades:'♠'};
  var RANKS=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  var RV={2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,J:11,Q:12,K:13,A:14};
  var S=0,W=1,N=2,E=3;
  var NAMES=['You','West','Partner','East'];

  var hands=[[],[],[],[]];
  var bids=[-1,-1,-1,-1];
  var tricksTaken=[0,0,0,0];
  var teamScore=[0,0];
  var teamBags=[0,0];
  var teamBids=[0,0];
  var trick=[],trickCards=[null,null,null,null];
  var leader=0,currentPlayer=0,phase='',spadesBroken=false,roundNum=0;

  ms(a,'♠ Round <strong id="GSr">1</strong>');
  mm(a);
  var pan=document.createElement('div');pan.id='GSpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:6px;user-select:none;';
  a.appendChild(pan);
  function _pip(suitName){return (window._cdPipFor)?window._cdPipFor(suitName):SI[suitName];}
  var _gsStyleLbl='🃏 Style';
  mc(a).innerHTML='<button class="gb-new" onclick="_GSN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button> <button class="gb" id="GSstyle" onclick="_GSToggleStyle()" style="font-size:0.7rem;">'+_gsStyleLbl+'</button>';
  window._GSToggleStyle=function(){
    if(typeof window._cdToggleStyle!=='function'){if(window._toast)window._toast('Card styles loading — try again in a sec.');return;}
    var nxt=window._cdToggleStyle();
    var b=document.getElementById('GSstyle');
    if(b)b.textContent='🃏 Style';
    if(typeof render==='function')render();
  };

  function makeDeck(){var d=[];for(var s=0;s<4;s++)for(var r=0;r<13;r++)d.push({rank:RANKS[r],suit:SUITS[s]});return d;}
  function shuffle(ar){for(var i=ar.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=ar[i];ar[i]=ar[j];ar[j]=t;}return ar;}
  function sortHand(h){var so={clubs:0,diamonds:1,hearts:2,spades:3};h.sort(function(a,b){return so[a.suit]!==so[b.suit]?so[a.suit]-so[b.suit]:RV[a.rank]-RV[b.rank];});}
  function removeCard(hand,card){for(var i=0;i<hand.length;i++){if(hand[i].rank===card.rank&&hand[i].suit===card.suit){hand.splice(i,1);return;}}}
  function cardValue(c,leadSuit){if(c.suit==='spades')return 100+RV[c.rank];if(c.suit===leadSuit)return 50+RV[c.rank];return RV[c.rank];}

  function getPlayable(hand,leadSuit){
    if(!leadSuit){
      if(!spadesBroken){var ns=hand.filter(function(c){return c.suit!=='spades';});if(ns.length)return ns;}
      return hand.slice();
    }
    var follow=hand.filter(function(c){return c.suit===leadSuit;});
    return follow.length?follow:hand.slice();
  }
  function trickWinner(plays){
    var lead=plays[0].card.suit;var best=0,bv=cardValue(plays[0].card,lead);
    for(var i=1;i<plays.length;i++){var v=cardValue(plays[i].card,lead);if(v>bv){bv=v;best=i;}}
    return plays[best].player;
  }

  function aiBid(player){
    var hand=hands[player];var tricks=0;
    var spades=hand.filter(function(c){return c.suit==='spades';});
    spades.sort(function(a,b){return RV[b.rank]-RV[a.rank];});
    for(var i=0;i<spades.length;i++){
      if(RV[spades[i].rank]>=12)tricks++;
      else if(i<2&&spades.length>=4)tricks+=0.5;
    }
    var offSuits={};
    for(var k=0;k<hand.length;k++){var c=hand[k];if(c.suit!=='spades'){if(!offSuits[c.suit])offSuits[c.suit]=[];offSuits[c.suit].push(c);}}
    for(var suit in offSuits){
      var cards=offSuits[suit];cards.sort(function(a,b){return RV[b.rank]-RV[a.rank];});
      if(RV[cards[0].rank]===14)tricks++;
      if(cards.length>=2&&RV[cards[0].rank]>=13&&RV[cards[1].rank]>=13)tricks+=0.5;
      if(cards.length<=1&&spades.length>=2)tricks+=0.5;
    }
    var bid=Math.max(1,Math.round(tricks));
    if(tricks<0.5&&spades.length<=1&&Math.random()<0.15)bid=0;
    return Math.min(13,bid);
  }

  function aiPlay(player){
    var hand=hands[player];var leadSuit=trick.length>0?trick[0].card.suit:'';
    var pl=getPlayable(hand,leadSuit);
    if(pl.length===1)return pl[0];
    var partner=(player+2)%4;
    var myBid=bids[player];var myTricks=tricksTaken[player];
    var needMore=myTricks<myBid;var isNil=myBid===0;
    if(isNil){pl.sort(function(a,b){return cardValue(a,leadSuit||'x')-cardValue(b,leadSuit||'x');});return pl[0];}
    if(!leadSuit){
      if(needMore){
        var aces=pl.filter(function(c){return c.rank==='A'&&c.suit!=='spades';});
        if(aces.length)return aces[0];
        var sp=pl.filter(function(c){return c.suit==='spades';});
        if(sp.length>=3){sp.sort(function(a,b){return RV[a.rank]-RV[b.rank];});return sp[0];}
      }
      pl.sort(function(a,b){return cardValue(a,'x')-cardValue(b,'x');});return pl[0];
    }
    var partnerWinning=false;
    if(trick.length>=2){var tw=trickWinner(trick);if(tw===partner)partnerWinning=true;}
    var teamTricks2=tricksTaken[player]+tricksTaken[partner];
    var teamBid=bids[player]+bids[partner];
    var overBid=teamTricks2>=teamBid&&!isNil;
    if(overBid||partnerWinning){pl.sort(function(a,b){return cardValue(a,leadSuit)-cardValue(b,leadSuit);});return pl[0];}
    var currentHigh=0;
    for(var t=0;t<trick.length;t++){var v=cardValue(trick[t].card,leadSuit);if(v>currentHigh)currentHigh=v;}
    var winners=pl.filter(function(c){return cardValue(c,leadSuit)>currentHigh;});
    if(winners.length&&needMore){winners.sort(function(a,b){return cardValue(a,leadSuit)-cardValue(b,leadSuit);});return winners[0];}
    pl.sort(function(a,b){return cardValue(a,leadSuit)-cardValue(b,leadSuit);});return pl[0];
  }

  function deal(){
    var deck=shuffle(makeDeck());hands=[[],[],[],[]];
    for(var i=0;i<52;i++)hands[i%4].push(deck[i]);
    for(i=0;i<4;i++)sortHand(hands[i]);
    bids=[-1,-1,-1,-1];tricksTaken=[0,0,0,0];trick=[];trickCards=[null,null,null,null];
    spadesBroken=false;teamBids=[0,0];
  }
  function newRound(){
    roundNum++;deal();phase='bidding';currentPlayer=S;
    var re=document.getElementById('GSr');if(re)re.textContent=roundNum;
    render();
  }
  function aiBidTurn(){
    if(currentPlayer===S){render();return;}
    var b=aiBid(currentPlayer);bids[currentPlayer]=b;
    sm(NAMES[currentPlayer]+' bids '+(b===0?'NIL':b));
    currentPlayer=(currentPlayer+1)%4;
    if(bids[S]!==-1&&bids[W]!==-1&&bids[N]!==-1&&bids[E]!==-1){finishBidding();return;}
    render();
    if(currentPlayer!==S)setTimeout(aiBidTurn,500);
  }
  function finishBidding(){
    phase='play';
    teamBids[0]=bids[S]+bids[N];teamBids[1]=bids[W]+bids[E];
    leader=S;currentPlayer=leader;trick=[];trickCards=[null,null,null,null];
    sm('Your lead');render();
  }
  function playCard(player,card){
    removeCard(hands[player],card);
    trick.push({player:player,card:card});trickCards[player]=card;
    if(card.suit==='spades')spadesBroken=true;
    render();
    if(trick.length===4){
      var winner=trickWinner(trick);tricksTaken[winner]++;phase='trickDone';
      setTimeout(function(){
        sm(NAMES[winner]+' takes the trick');
        _e('progress');
        setTimeout(function(){
          trick=[];trickCards=[null,null,null,null];
          if(hands[0].length===0){scoreRound();return;}
          leader=winner;currentPlayer=leader;phase='play';render();
          if(currentPlayer!==S)setTimeout(doAIPlay,400);
          else sm('Your lead');
        },600);
      },500);
      return;
    }
    currentPlayer=(currentPlayer+1)%4;render();
    if(currentPlayer!==S)setTimeout(doAIPlay,350);
  }
  function doAIPlay(){if(phase!=='play'||currentPlayer===S)return;var c=aiPlay(currentPlayer);playCard(currentPlayer,c);}
  function scoreRound(){
    phase='scoring';
    for(var team=0;team<2;team++){
      var p1=team===0?S:W,p2=team===0?N:E;
      for(var pi=0;pi<2;pi++){
        var p=pi===0?p1:p2;
        if(bids[p]===0){if(tricksTaken[p]===0)teamScore[team]+=100;else teamScore[team]-=100;}
      }
      var teamBid=0,teamTook=0;
      if(bids[p1]>0){teamBid+=bids[p1];teamTook+=tricksTaken[p1];}
      if(bids[p2]>0){teamBid+=bids[p2];teamTook+=tricksTaken[p2];}
      if(teamBid>0){
        if(teamTook>=teamBid){
          teamScore[team]+=teamBid*10;
          var bags=teamTook-teamBid;teamBags[team]+=bags;teamScore[team]+=bags;
          if(teamBags[team]>=10){teamScore[team]-=100;teamBags[team]-=10;}
        }else{teamScore[team]-=teamBid*10;}
      }
    }
    _e('milestone');
    render();
    sm('Round over — You '+teamScore[0]+' vs '+teamScore[1]);
    if(teamScore[0]>=500||teamScore[1]>=500||teamScore[0]<=-200||teamScore[1]<=-200){
      var won=(teamScore[0]>=500&&teamScore[0]>teamScore[1])||(teamScore[1]<=-200&&teamScore[0]>teamScore[1]);
      if(won){_e('game_win');_playWin();sm('♠ You win! '+teamScore[0]);}
      else{_e('game_loss');_play('lose');sm('You lose. '+teamScore[0]+' vs '+teamScore[1]);}
      _sr('gardenspades',{w:won,s:teamScore[0],r:roundNum});
      setTimeout(function(){teamScore=[0,0];teamBags=[0,0];roundNum=0;newRound();},3000);
      return;
    }
    setTimeout(newRound,2000);
  }
  function onCardClick(card){
    if(phase!=='play'||currentPlayer!==S)return;
    var leadSuit=trick.length>0?trick[0].card.suit:'';
    var pl=getPlayable(hands[S],leadSuit);
    var ok=pl.some(function(c){return c.rank===card.rank&&c.suit===card.suit;});
    if(!ok){sm("Can't play that card");return;}
    playCard(S,card);
  }

  function render(){
    var h='';
    // Score banner — readability pass to match Bower Garden
    h+='<div style="background:linear-gradient(135deg,rgba(26,31,23,0.9),rgba(13,16,12,0.95));border:1.5px solid rgba(122,179,86,0.3);border-radius:12px;padding:10px 14px;margin:6px 0;font-family:Bebas Neue,sans-serif;">';
    h+='<div style="display:flex;justify-content:space-around;align-items:baseline;">';
    h+='<div style="text-align:center;"><div style="color:#7ab356;font-size:0.7rem;letter-spacing:0.08em;">YOUR TEAM</div><div style="color:#c8a84b;font-size:1.8rem;line-height:1;margin-top:2px;">'+teamScore[0]+'</div></div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.55rem;color:var(--muted);letter-spacing:0.1em;align-self:center;">to 250</div>';
    h+='<div style="text-align:center;"><div style="color:#c47a7a;font-size:0.7rem;letter-spacing:0.08em;">OPPONENTS</div><div style="color:#c8a84b;font-size:1.8rem;line-height:1;margin-top:2px;">'+teamScore[1]+'</div></div>';
    h+='</div>';
    h+='<div style="display:flex;justify-content:space-around;margin-top:8px;padding-top:8px;border-top:1px solid rgba(122,179,86,0.2);font-family:DM Mono,monospace;font-size:0.8rem;letter-spacing:0.05em;">';
    h+='<div style="color:var(--cream);">Bid <strong style="color:#7ab356;font-size:1.05rem;">'+teamBids[0]+'</strong> · Bags <strong style="color:#e8dcc8;font-size:1.05rem;">'+teamBags[0]+'</strong></div>';
    h+='<div style="color:var(--cream);">Bid <strong style="color:#e8a0a0;font-size:1.05rem;">'+teamBids[1]+'</strong> · Bags <strong style="color:#e8dcc8;font-size:1.05rem;">'+teamBags[1]+'</strong></div>';
    h+='</div>';
    h+='</div>';
    if(spadesBroken)h+='<div style="text-align:center;font-family:Bebas Neue,sans-serif;font-size:0.85rem;color:#c8a84b;letter-spacing:0.12em;padding:4px;background:rgba(200,168,75,0.08);border-radius:6px;margin:4px 0;">♠ SPADES BROKEN</div>';
    // Per-player bid grid — bumped from 0.55rem to readable
    h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;padding:4px;">';
    for(var p=0;p<4;p++){
      var b=bids[p];
      h+='<div style="text-align:center;padding:5px;background:rgba(13,16,12,0.5);border-radius:6px;'+(p===currentPlayer&&phase!=='gameOver'?'border:1.5px solid #c8a84b;box-shadow:0 0 8px rgba(200,168,75,0.3);':p===S?'border:1px solid rgba(122,179,86,0.4);':'')+'">';
      h+='<div style="color:var(--cream);font-family:Bebas Neue,sans-serif;font-size:0.7rem;letter-spacing:0.06em;">'+NAMES[p]+'</div>';
      h+='<div style="color:#c8a84b;font-family:Bebas Neue,sans-serif;font-size:1.1rem;line-height:1.1;">'+(b<0?'—':b===0?'NIL':b)+' <span style="color:var(--muted);font-size:0.7rem;">('+tricksTaken[p]+')</span></div>';
      h+='</div>';
    }
    h+='</div>';
    // North (partner) — overlap horizontally
    h+='<div style="text-align:center;padding:6px;"><div style="font-family:Bebas Neue,sans-serif;font-size:0.8rem;color:var(--cream);letter-spacing:0.1em;margin-bottom:5px;">PARTNER</div><div style="display:inline-flex;justify-content:center;">';
    for(var n=0;n<hands[N].length;n++)h+='<div style="width:30px;height:42px;border-radius:5px;background:linear-gradient(135deg,#4A7C35,#3a6028);border:1.5px solid #2d4a1e;margin-left:'+(n===0?'0':'-18px')+';"></div>';
    h+='</div></div>';
    // West | Trick | East — overlap vertically for side hands
    h+='<div style="display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:6px 4px;min-height:160px;">';
    h+='<div style="padding:4px;"><div style="font-family:Bebas Neue,sans-serif;font-size:0.8rem;color:var(--cream);text-align:center;letter-spacing:0.1em;margin-bottom:5px;">WEST</div><div style="display:inline-flex;flex-direction:column;align-items:center;">';
    for(var w=0;w<hands[W].length;w++)h+='<div style="width:30px;height:42px;border-radius:5px;background:linear-gradient(135deg,#4A7C35,#3a6028);border:1.5px solid #2d4a1e;margin-top:'+(w===0?'0':'-28px')+';"></div>';
    h+='</div></div>';
    // Trick area
    h+='<div style="position:relative;min-height:160px;background:rgba(26,31,23,0.3);border-radius:8px;">';
    var pos={};pos[S]='bottom:8px;left:50%;transform:translateX(-50%);';pos[W]='left:8px;top:50%;transform:translateY(-50%);';pos[N]='top:8px;left:50%;transform:translateX(-50%);';pos[E]='right:8px;top:50%;transform:translateY(-50%);';
    for(var pl=0;pl<4;pl++){
      var c=trickCards[pl];if(!c)continue;
      var col=c.suit==='hearts'||c.suit==='diamonds'?'#c47a7a':'#1a1f17';
      h+='<div style="position:absolute;'+pos[pl]+'background:#F5F0E1;color:'+col+';border:2px solid '+(pl===S?'#7ab356':'#c8a84b')+';border-radius:6px;padding:6px 9px;font-weight:700;min-width:38px;text-align:center;">';
      h+='<div style="font-size:0.85rem;">'+c.rank+'</div><div style="font-size:1.1rem;">'+_pip(c.suit)+'</div></div>';
    }
    h+='</div>';
    h+='<div style="padding:4px;"><div style="font-family:Bebas Neue,sans-serif;font-size:0.8rem;color:var(--cream);text-align:center;letter-spacing:0.1em;margin-bottom:5px;">EAST</div><div style="display:inline-flex;flex-direction:column;align-items:center;">';
    for(var e=0;e<hands[E].length;e++)h+='<div style="width:30px;height:42px;border-radius:5px;background:linear-gradient(135deg,#4A7C35,#3a6028);border:1.5px solid #2d4a1e;margin-top:'+(e===0?'0':'-28px')+';"></div>';
    h+='</div></div>';
    h+='</div>';
    // Bid UI
    if(phase==='bidding'&&currentPlayer===S){
      h+='<div style="text-align:center;padding:8px;background:rgba(26,31,23,0.5);border-radius:8px;margin:6px 0;">';
      h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.75rem;color:#c8a84b;letter-spacing:0.1em;margin-bottom:6px;">YOUR BID</div>';
      h+='<div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap;">';
      h+='<div onclick="_GSB(0)" style="min-width:36px;min-height:44px;display:flex;align-items:center;justify-content:center;background:rgba(26,36,22,0.7);border:1px solid rgba(196,122,122,0.5);border-radius:6px;font-family:Bebas Neue,sans-serif;font-size:0.85rem;cursor:pointer;color:#c47a7a;padding:6px;letter-spacing:0.06em;">NIL</div>';
      for(var bi=1;bi<=13;bi++){
        h+='<div onclick="_GSB('+bi+')" style="min-width:36px;min-height:44px;display:flex;align-items:center;justify-content:center;background:rgba(26,36,22,0.7);border:1px solid rgba(122,179,86,0.3);border-radius:6px;font-family:Bebas Neue,sans-serif;font-size:0.85rem;cursor:pointer;color:#e8dcc8;">'+bi+'</div>';
      }
      h+='</div></div>';
    }
    // Player hand
    h+='<div style="padding:4px;"><div style="font-family:Bebas Neue,sans-serif;font-size:0.85rem;color:var(--cream);text-align:center;letter-spacing:0.1em;margin-bottom:6px;">YOUR HAND</div>';
    h+='<div style="display:flex;gap:3px;justify-content:center;flex-wrap:wrap;">';
    var leadS=trick.length>0?trick[0].card.suit:'';
    var playable=[];
    if(phase==='play'&&currentPlayer===S)playable=getPlayable(hands[S],leadS);
    for(var i=0;i<hands[S].length;i++){
      var cc=hands[S][i];
      var canP=playable.some(function(p){return p.rank===cc.rank&&p.suit===cc.suit;});
      var col=cc.suit==='hearts'||cc.suit==='diamonds'?'#c47a7a':'#1a1f17';
      var bc=canP?'#7ab356':'#b8a878';
      var sty='display:inline-flex;flex-direction:column;align-items:center;justify-content:center;width:clamp(48px,12vw,64px);height:clamp(68px,17vw,90px);border-radius:6px;background:#F5F0E1;border:2px solid '+bc+';box-shadow:inset 0 0 0 1px rgba(255,255,255,0.55),0 2px 5px rgba(0,0,0,0.35);color:'+col+';font-weight:700;position:relative;margin:2px 1px;';
      if(canP)sty+='cursor:pointer;';
      if(!canP&&phase==='play')sty+='opacity:0.5;';
      h+='<div style="'+sty+'" onclick="_GSCC(\''+cc.rank+'\',\''+cc.suit+'\')"><div style="font-size:0.8rem;position:absolute;top:3px;left:5px;">'+cc.rank+'</div><div style="font-size:1.35rem;">'+_pip(cc.suit)+'</div></div>';
    }
    h+='</div></div>';
    pan.innerHTML=h;
  }

  window._GSN=function(){teamScore=[0,0];teamBags=[0,0];roundNum=0;newRound();};
  window._GSCC=function(r,s){onCardClick({rank:r,suit:s});};
  window._GSB=function(n){
    if(phase!=='bidding'||currentPlayer!==S)return;
    bids[S]=n;sm('You bid '+(n===0?'NIL':n));
    currentPlayer=(currentPlayer+1)%4;
    render();
    if(currentPlayer!==S)setTimeout(aiBidTurn,400);
    else if(bids[W]!==-1&&bids[N]!==-1&&bids[E]!==-1)finishBidding();
  };

  _GSN();
};
})();
