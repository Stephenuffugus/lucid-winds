// ═══ GARDEN SPADES — Partnership Spades card game ═══
// 4-player trick-taking, spades always trump. Bid your tricks, don't bag out.
// First team to 500 wins. -200 loses. 10 bags = -100 penalty.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;

// Inject Spades-specific keyframes once.
if(!document.getElementById('gs-anim-style')){
  var _gss=document.createElement('style');_gss.id='gs-anim-style';
  _gss.textContent=
    '@keyframes gsTurnRing{0%,100%{box-shadow:0 0 0 2px rgba(255,220,112,0.7),0 0 16px rgba(255,220,112,0.4)}50%{box-shadow:0 0 0 3px rgba(255,220,112,0.95),0 0 26px rgba(255,220,112,0.6)}}'+
    '@keyframes gsBrokenFlash{0%{transform:scale(1);box-shadow:0 0 0 0 rgba(255,220,112,0.9)}30%{transform:scale(1.15);box-shadow:0 0 0 12px rgba(255,220,112,0.4),0 0 28px rgba(255,220,112,0.7)}100%{transform:scale(1);box-shadow:0 0 10px rgba(255,220,112,0.25)}}'+
    '@keyframes gsBagPulse{0%,100%{box-shadow:inset 0 0 0 1px rgba(255,180,80,0.4)}50%{box-shadow:inset 0 0 0 2px rgba(255,180,80,0.9),0 0 12px rgba(255,180,80,0.6)}}'+
    '@keyframes gsBagDanger{0%,100%{box-shadow:inset 0 0 0 1px rgba(230,57,70,0.55),0 0 8px rgba(230,57,70,0.4)}50%{box-shadow:inset 0 0 0 2px rgba(230,57,70,1),0 0 18px rgba(230,57,70,0.8)}}'+
    '.gs-seat{transition:opacity .3s ease,filter .3s ease;border-radius:10px;}'+
    '.gs-seat.gs-active{animation:gsTurnRing 1.4s ease-in-out infinite;}'+
    '.gs-seat.gs-inactive{opacity:0.55;}';
  document.head.appendChild(_gss);
}

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
  // One-shot flag — fires the spades-broken animation only on the render
  // immediately after the break, not on every subsequent render.
  var spadesJustBroke=false;

  ms(a,'<span style="font-family:Georgia,serif;letter-spacing:.06em;">♠ Round <strong id="GSr" style="color:#5b9bd1;font-size:1.2em;">1</strong></span>');
  mm(a);
  var pan=document.createElement('div');pan.id='GSpan';
  // Felt table — deep teal/navy for spades, signature partnership-game palette.
  var _GS_FELT="data:image/svg+xml;utf8,"+encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">'
      +'<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11"/>'
      +'<feColorMatrix values="0 0 0 0 0.04  0 0 0 0 0.06  0 0 0 0 0.08  0 0 0 .08 0"/></filter>'
      +'<rect width="100%" height="100%" filter="url(#n)"/>'
    +'</svg>'
  );
  pan.style.cssText='max-width:min(96vw,760px);margin:0 auto;padding:12px 14px;user-select:none;box-sizing:border-box;'
    +'background:'
      +'url("'+_GS_FELT+'"),'
      +'radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.05) 0%,transparent 50%),'
      +'radial-gradient(circle at 50% 100%,rgba(0,0,0,0.3) 0%,transparent 65%),'
      +'linear-gradient(135deg,#0e3a5c 0%,#0a2c46 55%,#062035 100%);'
    +'background-size:180px 180px, auto, auto, auto;'
    +'border-radius:14px;'
    +'border:2px solid #6b4520;'
    +'box-shadow:'
      +'inset 0 0 0 1px rgba(180,140,70,0.25),'
      +'inset 0 0 40px rgba(0,0,0,0.45),'
      +'0 6px 22px rgba(0,0,0,0.55);';
  a.appendChild(pan);
  function _pip(suitName){return (window._cdPipFor)?window._cdPipFor(suitName):SI[suitName];}
  // Per-team identity colors — spades is partnership so team-color, not seat.
  var TEAM_COLORS=['#5b9bd1','#dc8a8a']; // us=blue, them=red
  function _teamColor(p){return TEAM_COLORS[p%2];}
  // mc(a) empty — controls go inside the pan via render().
  mc(a);
  window._GSToggleStyle=function(){
    if(typeof window._cdToggleStyle!=='function'){if(window._toast)window._toast('Card styles loading — try again in a sec.');return;}
    window._cdToggleStyle();
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
    spadesBroken=false;spadesJustBroke=false;teamBids=[0,0];
  }
  function newRound(){
    roundNum++;deal();phase='bidding';
    // Bidding now starts at WEST so all three AIs bid before SOUTH. The player
    // sees every other bid land before deciding — matches real-life flow and
    // gives the partner-pre-echo the research called for.
    currentPlayer=W;
    var re=document.getElementById('GSr');if(re)re.textContent=roundNum;
    render();
    setTimeout(aiBidTurn,800);
  }
  function aiBidTurn(){
    if(currentPlayer===S){render();return;}
    var b=aiBid(currentPlayer);bids[currentPlayer]=b;
    sm(NAMES[currentPlayer]+' bids '+(b===0?'NIL':b));
    currentPlayer=(currentPlayer+1)%4;
    if(bids[S]!==-1&&bids[W]!==-1&&bids[N]!==-1&&bids[E]!==-1){finishBidding();return;}
    render();
    // Slower AI bid pacing — each bid pill should land with weight, not flicker.
    if(currentPlayer!==S)setTimeout(aiBidTurn,800);
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
    if(card.suit==='spades' && !spadesBroken){
      spadesBroken=true; spadesJustBroke=true;
      setTimeout(function(){spadesJustBroke=false;render();},900);
    }
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

  // Team strip helper — shows team score + bid/taken progress + bag pips.
  function _teamStrip(label, teamIdx){
    var color = TEAM_COLORS[teamIdx];
    var p1=teamIdx===0?S:W, p2=teamIdx===0?N:E;
    var teamBid = teamBids[teamIdx];
    var teamTaken = tricksTaken[p1] + tricksTaken[p2];
    var contractMet = teamBid>0 && teamTaken>=teamBid;
    var bags = teamBags[teamIdx];
    // Bag pips — first 7 grey/empty, 8/9 amber pulse, 10 = red danger
    var bagPips='';
    for(var i=0;i<10;i++){
      var on=i<bags;
      var bgPip='rgba(0,0,0,0.4)';
      if(on){
        if(bags>=10)bgPip='#e63946';
        else if(bags>=8)bgPip='#ffa040';
        else if(bags>=7)bgPip='#ffdc70';
        else bgPip='rgba(232,220,200,0.5)';
      }
      bagPips+='<span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:'+bgPip+';margin:0 1px;border:1px solid rgba(0,0,0,0.5);"></span>';
    }
    var bagAnim = bags>=9?'animation:gsBagDanger 1s ease-in-out infinite;':bags>=7?'animation:gsBagPulse 1.6s ease-in-out infinite;':'';
    var bidLine = teamBid>0
      ? '<span style="font-family:Georgia,serif;font-size:0.95rem;font-weight:700;color:'+(contractMet?'#7ab356':'#f5ebd0')+';">'+teamTaken+'</span><span style="font-family:DM Mono,monospace;font-size:0.55rem;color:rgba(232,220,200,0.55);"> / '+teamBid+'</span>'
      : '<span style="font-family:Georgia,serif;font-style:italic;font-size:0.6rem;color:rgba(232,220,200,0.45);">awaiting bid</span>';
    return '<div style="flex:1;background:linear-gradient(180deg,rgba(0,0,0,0.4),rgba(0,0,0,0.55));border:1.5px solid '+color+';border-radius:8px;padding:6px 10px;'+bagAnim+'box-shadow:inset 0 1px 0 rgba(255,255,255,0.06),0 2px 6px rgba(0,0,0,0.4);">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;">'
        +'<div>'
          +'<div style="font-family:DM Mono,monospace;font-size:0.5rem;letter-spacing:0.12em;color:'+color+';text-transform:uppercase;line-height:1;">'+label+'</div>'
          +'<div style="font-family:Georgia,serif;font-size:1.5rem;font-weight:700;color:#f5ebd0;line-height:1;margin-top:2px;text-shadow:0 2px 3px rgba(0,0,0,0.5);">'+teamScore[teamIdx]+'</div>'
        +'</div>'
        +'<div style="text-align:right;">'
          +'<div style="line-height:1;">'+bidLine+'</div>'
          +'<div style="margin-top:4px;line-height:1;">'+bagPips+'</div>'
          +'<div style="font-family:DM Mono,monospace;font-size:0.42rem;letter-spacing:0.1em;color:rgba(232,220,200,0.4);margin-top:2px;">'+(bags>=10?'-100':(bags>=8?(10-bags)+' to penalty':'bags'))+'</div>'
        +'</div>'
      +'</div>'
    +'</div>';
  }
  // Bid pill that floats next to each seat's name. NIL gets a distinct
  // red-bordered treatment. Once trick play starts, the pill shows
  // taken/bid (e.g. 4/3) so the player can see contract progress per seat.
  function _bidPill(seat){
    var b=bids[seat];
    if(b<0){
      // Pre-bid placeholder — only show when bidding is in progress.
      if(phase!=='bidding')return '';
      return '<span style="display:inline-block;padding:1px 5px;margin-left:5px;font-size:0.48rem;font-family:Georgia,serif;font-style:italic;color:rgba(232,220,200,0.4);background:rgba(0,0,0,0.3);border:1px dashed rgba(232,220,200,0.25);border-radius:3px;vertical-align:middle;">…</span>';
    }
    if(b===0){
      var taken=tricksTaken[seat];
      var nilBroken = taken>0;
      return '<span style="display:inline-block;padding:1px 6px;margin-left:5px;font-size:0.48rem;font-family:Georgia,serif;font-weight:700;color:'+(nilBroken?'#e63946':'#ffdc70')+';background:rgba(0,0,0,0.45);border:1px solid '+(nilBroken?'#e63946':'#ffdc70')+';border-radius:3px;vertical-align:middle;letter-spacing:0.05em;">NIL'+(nilBroken?' BROKEN':'')+'</span>';
    }
    var t=tricksTaken[seat];
    var contractMet = t>=b;
    return '<span style="display:inline-block;padding:1px 6px;margin-left:5px;font-size:0.5rem;font-family:Georgia,serif;color:'+(contractMet?'#7ab356':'#f5ebd0')+';background:rgba(0,0,0,0.45);border:1px solid '+(contractMet?'#7ab356':'rgba(232,220,200,0.4)')+';border-radius:3px;vertical-align:middle;font-weight:700;">'+t+'/'+b+'</span>';
  }
  // Seat class — pulsing turn ring on active, dim on inactive during live phases.
  function _seatCls(seat){
    var isActive = (seat===currentPlayer && (phase==='play'||phase==='bidding'));
    if(isActive)return 'gs-seat gs-active';
    if(phase==='play'||phase==='bidding')return 'gs-seat gs-inactive';
    return 'gs-seat';
  }

  function render(){
    var h='';
    // ── CONTROLS BAR — top right, matching the other card games ──
    var gsStyleName = (window._cdStyleLabel && typeof window._cdStyle==='function') ? window._cdStyleLabel(window._cdStyle()) : 'Floral';
    h+='<div style="display:flex;justify-content:flex-end;align-items:center;gap:6px;margin-bottom:6px;">';
    h+='<button class="gb" onclick="if(window._cdToggleStyle){window._cdToggleStyle();if(typeof render===\'function\')render();}" title="Cycle card style" style="display:inline-flex;align-items:center;gap:6px;min-height:34px;padding:5px 12px;font-size:0.62rem;background:linear-gradient(180deg,rgba(180,140,70,0.25),rgba(120,90,40,0.35));border:1px solid rgba(220,180,120,0.45);color:#f5ebd0;font-family:Georgia,serif;font-style:italic;box-shadow:inset 0 1px 0 rgba(255,255,255,0.12),0 2px 5px rgba(0,0,0,0.5);">';
    h+='<img src="assets/decks/floral/suit-spade.png" alt="" onerror="this.style.display=\'none\';" style="width:18px;height:18px;object-fit:contain;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.7));">';
    h+='<span style="color:rgba(232,220,200,0.6);font-style:normal;font-family:DM Mono,monospace;font-size:0.5rem;letter-spacing:0.12em;text-transform:uppercase;margin-right:2px;">Deck</span>';
    h+='<span>'+gsStyleName+'</span>';
    h+='</button>';
    h+='<button class="gb" onclick="_GSN()" title="New game" style="display:inline-flex;align-items:center;gap:5px;min-height:34px;padding:5px 14px;font-size:0.65rem;background:linear-gradient(180deg,rgba(122,179,86,0.3),rgba(74,124,53,0.4));border:1px solid rgba(122,179,86,0.55);color:#f5ebd0;font-family:Georgia,serif;box-shadow:inset 0 1px 0 rgba(255,255,255,0.12),0 2px 5px rgba(0,0,0,0.5);">↻ New Game</button>';
    h+='</div>';
    // ── SCORE STRIP — twin team strips with bid/taken big numerals + bag pips ──
    h+='<div style="display:flex;gap:6px;margin-bottom:8px;">';
    h+=_teamStrip('YOUR TEAM',0);
    h+=_teamStrip('OPPONENTS',1);
    h+='</div>';
    // ── SPADES-BROKEN PERSISTENT BADGE ──
    h+='<div style="text-align:center;padding:3px 0 8px;">';
    if(spadesBroken){
      var brokenAnim = spadesJustBroke ? 'animation:gsBrokenFlash 0.9s ease-out;' : '';
      h+='<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:linear-gradient(180deg,rgba(0,0,0,0.5),rgba(0,0,0,0.7));border:1px solid #ffdc70;border-radius:999px;font-family:Georgia,serif;font-size:0.68rem;color:#f5ebd0;letter-spacing:0.05em;box-shadow:0 0 10px rgba(255,220,112,0.3);'+brokenAnim+'">';
      h+='<span style="color:#1a1a1a;font-size:0.95rem;line-height:1;background:#f5ebd0;border-radius:50%;width:14px;height:14px;display:inline-flex;align-items:center;justify-content:center;font-size:0.7rem;">♠</span>Spades broken</span>';
    }else{
      h+='<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:rgba(0,0,0,0.3);border:1px dashed rgba(232,220,200,0.25);border-radius:999px;font-family:Georgia,serif;font-style:italic;font-size:0.62rem;color:rgba(232,220,200,0.55);letter-spacing:0.05em;">';
      h+='<span style="opacity:0.5;font-size:0.85rem;line-height:1;">♠</span>Spades unbroken</span>';
    }
    h+='</div>';
    // ── PARTNER (NORTH) ─────────────────────────────────────────
    h+='<div class="'+_seatCls(N)+'" style="text-align:center;padding:6px;">'
      +'<div style="font-family:DM Mono,monospace;font-size:0.6rem;color:'+_teamColor(N)+';letter-spacing:0.14em;margin-bottom:5px;text-transform:uppercase;font-weight:700;">'
        +'PARTNER <span style="color:rgba(232,220,200,0.5);font-size:0.52rem;margin-left:4px;">×'+hands[N].length+'</span>'
        +_bidPill(N)
      +'</div>'
      +'<div style="display:inline-flex;justify-content:center;">';
    for(var n=0;n<hands[N].length;n++)h+='<div style="width:30px;height:42px;border-radius:5px;background:linear-gradient(135deg,#1a4a2e,#0c2a18);border:1.5px solid #051208;margin-left:'+(n===0?'0':'-22px')+';box-shadow:inset 0 1px 0 rgba(255,255,255,0.06);"></div>';
    h+='</div></div>';
    // ── MIDDLE ROW: WEST | TRICK | EAST ─────────────────────────
    h+='<div style="display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:6px 4px;min-height:160px;">';
    h+='<div class="'+_seatCls(W)+'" style="padding:4px;">'
      +'<div style="font-family:DM Mono,monospace;font-size:0.6rem;color:'+_teamColor(W)+';text-align:center;letter-spacing:0.14em;margin-bottom:5px;text-transform:uppercase;font-weight:700;">'
        +'WEST <span style="color:rgba(232,220,200,0.5);font-size:0.52rem;margin-left:2px;">×'+hands[W].length+'</span>'+_bidPill(W)
      +'</div>'
      +'<div style="display:inline-flex;flex-direction:column;align-items:center;">';
    for(var w=0;w<hands[W].length;w++)h+='<div style="width:30px;height:42px;border-radius:5px;background:linear-gradient(135deg,#1a4a2e,#0c2a18);border:1.5px solid #051208;margin-top:'+(w===0?'0':'-34px')+';box-shadow:inset 0 1px 0 rgba(255,255,255,0.06);"></div>';
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
    h+='<div class="'+_seatCls(E)+'" style="padding:4px;">'
      +'<div style="font-family:DM Mono,monospace;font-size:0.6rem;color:'+_teamColor(E)+';text-align:center;letter-spacing:0.14em;margin-bottom:5px;text-transform:uppercase;font-weight:700;">'
        +'EAST <span style="color:rgba(232,220,200,0.5);font-size:0.52rem;margin-left:2px;">×'+hands[E].length+'</span>'+_bidPill(E)
      +'</div>'
      +'<div style="display:inline-flex;flex-direction:column;align-items:center;">';
    for(var e=0;e<hands[E].length;e++)h+='<div style="width:30px;height:42px;border-radius:5px;background:linear-gradient(135deg,#1a4a2e,#0c2a18);border:1.5px solid #051208;margin-top:'+(e===0?'0':'-34px')+';box-shadow:inset 0 1px 0 rgba(255,255,255,0.06);"></div>';
    h+='</div></div>';
    h+='</div>';
    // ── BID UI ──────────────────────────────────────────────────
    if(phase==='bidding'&&currentPlayer===S){
      var partnerBid = bids[N];
      var partnerStr = partnerBid<0 ? 'still thinking' : partnerBid===0 ? 'NIL' : (''+partnerBid);
      // Auto-suggest based on the same heuristic the AI uses.
      var suggested = aiBid(S);
      h+='<div style="text-align:center;padding:10px 8px;background:radial-gradient(ellipse at 50% 50%,rgba(255,220,112,0.06) 0%,rgba(0,0,0,0.5) 70%);border:1.5px solid rgba(180,140,70,0.35);border-radius:12px;margin:6px 0;box-shadow:inset 0 0 18px rgba(0,0,0,0.4);">';
      h+='<div style="font-family:DM Mono,monospace;font-size:0.52rem;letter-spacing:0.22em;color:rgba(232,220,200,0.6);text-transform:uppercase;margin-bottom:4px;">Your bid</div>';
      h+='<div style="font-family:Georgia,serif;font-style:italic;font-size:0.65rem;color:'+_teamColor(N)+';margin-bottom:8px;">Partner bid <strong style="color:#f5ebd0;font-style:normal;">'+partnerStr+'</strong></div>';
      // 2-row grid: 0-6 and 7-13. 0 cell is the NIL button (distinct).
      h+='<div style="display:flex;flex-direction:column;gap:5px;align-items:center;">';
      // Top row: NIL + 1-6
      h+='<div style="display:flex;gap:4px;justify-content:center;">';
      h+='<button class="gb" onclick="_GSBN()" style="min-width:50px;min-height:42px;padding:4px 8px;background:linear-gradient(180deg,rgba(180,42,42,0.35),rgba(120,20,20,0.5));border:1.5px solid #e63946;border-radius:6px;font-family:Georgia,serif;font-weight:700;font-size:0.72rem;color:#ffdc70;letter-spacing:0.04em;display:flex;flex-direction:column;align-items:center;line-height:1;">';
      h+='NIL<span style="font-size:0.42rem;font-weight:400;color:rgba(245,235,208,0.65);margin-top:2px;">+100/-100</span></button>';
      for(var bi=1;bi<=6;bi++){
        var isS = (bi===suggested);
        h+='<button class="gb" onclick="_GSB('+bi+')" style="min-width:38px;min-height:42px;padding:4px;background:'+(isS?'linear-gradient(180deg,rgba(255,220,112,0.25),rgba(200,168,75,0.35))':'rgba(0,0,0,0.4)')+';border:'+(isS?'2':'1.5')+'px solid '+(isS?'#ffdc70':'rgba(232,220,200,0.3)')+';border-radius:6px;font-family:Georgia,serif;font-weight:700;font-size:0.95rem;color:#f5ebd0;'+(isS?'box-shadow:0 0 12px rgba(255,220,112,0.4);':'')+'">'+bi+'</button>';
      }
      h+='</div>';
      // Bottom row: 7-13
      h+='<div style="display:flex;gap:4px;justify-content:center;">';
      for(var bj=7;bj<=13;bj++){
        var isSj = (bj===suggested);
        h+='<button class="gb" onclick="_GSB('+bj+')" style="min-width:38px;min-height:42px;padding:4px;background:'+(isSj?'linear-gradient(180deg,rgba(255,220,112,0.25),rgba(200,168,75,0.35))':'rgba(0,0,0,0.4)')+';border:'+(isSj?'2':'1.5')+'px solid '+(isSj?'#ffdc70':'rgba(232,220,200,0.3)')+';border-radius:6px;font-family:Georgia,serif;font-weight:700;font-size:0.95rem;color:#f5ebd0;'+(isSj?'box-shadow:0 0 12px rgba(255,220,112,0.4);':'')+'">'+bj+'</button>';
      }
      h+='</div>';
      h+='<div style="margin-top:6px;font-family:DM Mono,monospace;font-size:0.5rem;letter-spacing:0.1em;color:rgba(232,220,200,0.4);">'+(suggested>0?'Suggested: '+suggested:'')+'</div>';
      h+='</div>';
      h+='</div>';
    }
    // NIL CONFIRM modal
    if(phase==='nilConfirm'){
      h+='<div onclick="_GSBNcancel()" style="position:fixed;inset:0;background:rgba(0,0,0,0.82);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;cursor:pointer;backdrop-filter:blur(4px);">';
      h+='<div style="font-family:Georgia,serif;font-size:2.2rem;color:#ffdc70;letter-spacing:0.04em;text-shadow:0 0 24px rgba(255,220,112,0.5);margin-bottom:8px;">BID NIL?</div>';
      h+='<div style="font-family:Georgia,serif;font-style:italic;font-size:0.85rem;color:#f5ebd0;text-align:center;max-width:340px;line-height:1.5;margin-bottom:18px;">Pledge to take <strong>zero tricks</strong>. Take none = <span style="color:#7ab356;">+100</span>. Take any = <span style="color:#e63946;">-100</span>.</div>';
      h+='<div style="display:flex;gap:10px;">';
      h+='<button class="gb" onclick="event.stopPropagation();_GSBNconfirm()" style="min-height:48px;padding:10px 22px;font-family:Georgia,serif;font-weight:700;font-size:0.9rem;background:linear-gradient(180deg,rgba(180,42,42,0.4),rgba(100,20,20,0.55));border:2px solid #e63946;color:#ffdc70;letter-spacing:0.06em;">CALL NIL</button>';
      h+='<button class="gb" onclick="event.stopPropagation();_GSBNcancel()" style="min-height:48px;padding:10px 22px;font-family:Georgia,serif;font-size:0.85rem;background:rgba(0,0,0,0.5);border:1px solid rgba(232,220,200,0.4);color:#f5ebd0;">Cancel</button>';
      h+='</div></div>';
    }
    // ── YOUR HAND (SOUTH) ───────────────────────────────────────
    h+='<div class="'+_seatCls(S)+'" style="padding:4px;">'
      +'<div style="font-family:DM Mono,monospace;font-size:0.62rem;color:'+_teamColor(S)+';text-align:center;letter-spacing:0.14em;margin-bottom:6px;text-transform:uppercase;font-weight:700;">'
        +'Your Hand'+_bidPill(S)
      +'</div>';
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

  // Track the bidding phase we'll resume after the NIL confirm modal closes.
  var _phaseBeforeNil='';
  window._GSN=function(){teamScore=[0,0];teamBags=[0,0];roundNum=0;newRound();};
  window._GSCC=function(r,s){onCardClick({rank:r,suit:s});};
  function commitBid(n){
    bids[S]=n;sm('You bid '+(n===0?'NIL':n));
    currentPlayer=(currentPlayer+1)%4;
    render();
    if(bids[S]!==-1&&bids[W]!==-1&&bids[N]!==-1&&bids[E]!==-1){finishBidding();return;}
    if(currentPlayer!==S)setTimeout(aiBidTurn,800);
  }
  window._GSB=function(n){
    if(phase!=='bidding'||currentPlayer!==S)return;
    commitBid(n);
  };
  // Two-step NIL flow — gate behind a confirmation modal so accidental taps
  // don't cost 100 points.
  window._GSBN=function(){
    if(phase!=='bidding'||currentPlayer!==S)return;
    _phaseBeforeNil=phase;phase='nilConfirm';render();
  };
  window._GSBNconfirm=function(){
    if(phase!=='nilConfirm')return;
    phase=_phaseBeforeNil;_phaseBeforeNil='';
    commitBid(0);
  };
  window._GSBNcancel=function(){
    if(phase!=='nilConfirm')return;
    phase=_phaseBeforeNil;_phaseBeforeNil='';render();
  };

  _GSN();
};
})();
