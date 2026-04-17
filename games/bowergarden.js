// ═══ BOWER GARDEN — Euchre (trick-taking partnership) ═══
// 4-player partnership card game: you + partner vs 2 AI opponents.
// 24-card deck, bowers, leading suit ("Tall") called each hand,
// first team to 10 wins.
//
// Internal variable names use "trump" (the standard Euchre term)
// for code-readability; all user-facing copy says "Strong" — the
// player picks a suit as their strength each hand.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

// Inject card-play slide animation once
if(!document.getElementById('bg-anim-style')){
  var _bgs=document.createElement('style');_bgs.id='bg-anim-style';
  _bgs.textContent=
    '@keyframes bgSlideS{0%{transform:translate(-50%,80px) scale(0.7);opacity:0}100%{transform:translate(-50%,0) scale(1);opacity:1}}'+
    '@keyframes bgSlideN{0%{transform:translate(-50%,-80px) scale(0.7);opacity:0}100%{transform:translate(-50%,0) scale(1);opacity:1}}'+
    '@keyframes bgSlideW{0%{transform:translate(-80px,-50%) scale(0.7);opacity:0}100%{transform:translate(0,-50%) scale(1);opacity:1}}'+
    '@keyframes bgSlideE{0%{transform:translate(80px,-50%) scale(0.7);opacity:0}100%{transform:translate(0,-50%) scale(1);opacity:1}}'+
    '.bg-played-S{animation:bgSlideS .32s cubic-bezier(.4,1.4,.5,1) both}'+
    '.bg-played-N{animation:bgSlideN .32s cubic-bezier(.4,1.4,.5,1) both}'+
    '.bg-played-W{animation:bgSlideW .32s cubic-bezier(.4,1.4,.5,1) both}'+
    '.bg-played-E{animation:bgSlideE .32s cubic-bezier(.4,1.4,.5,1) both}'+
    '@keyframes bgPulse{0%{box-shadow:0 0 0 0 rgba(200,168,75,.6)}70%{box-shadow:0 0 0 8px rgba(200,168,75,0)}100%{box-shadow:0 0 0 0 rgba(200,168,75,0)}}'+
    '.bg-dealer-badge{display:inline-block;width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#c8a84b,#8a6a30);color:#0d100c;font-family:Bebas Neue,sans-serif;font-size:0.95rem;font-weight:700;text-align:center;line-height:24px;margin-left:6px;animation:bgPulse 2s ease-in-out infinite;vertical-align:middle;box-shadow:0 0 8px rgba(200,168,75,0.5);}'+
    '.bg-active{outline:2px solid var(--gold,#c8a84b);outline-offset:2px;border-radius:8px;animation:bgPulse 1.4s ease-in-out infinite}';
  document.head.appendChild(_bgs);
}

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
  var loner=false,sittingOut=-1; // loner = caller went alone, sittingOut = partner who sits out

  ms(a,'🃏 <strong id="BGs">0</strong> - <strong id="BGo">0</strong>');
  mm(a);
  var pan=document.createElement('div');
  pan.id='BGpan';
  // Wider playfield — bumped from 420 to 540 so cards have room to breathe.
  pan.style.cssText='max-width:540px;margin:0 auto;padding:6px;user-select:none;';
  a.appendChild(pan);
  function _pip(suitName){return (window._cdPipFor)?window._cdPipFor(suitName):SUIT_ICONS[suitName];}
  var _bgStyleLbl='🃏 Style';
  mc(a).innerHTML='<button class="gb-new" onclick="_BGN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button> <button class="gb" id="BGstyle" onclick="_BGToggleStyle()" style="font-size:0.7rem;">'+_bgStyleLbl+'</button>';
  window._BGToggleStyle=function(){
    if(typeof window._cdToggleStyle!=='function'){
      if(window._toast)window._toast('Card styles loading — try again in a sec.');
      return;
    }
    window._cdToggleStyle();
    var b=document.getElementById('BGstyle');
    if(b)b.textContent='🃏 Style';
    if(typeof render==='function')render();
  };

  // Track the most-recently-played card so we can apply the slide
  // animation only to that one when render() repaints the trick.
  var lastPlayed=-1;

  function makeDeck(){var d=[];for(var si=0;si<SUITS.length;si++)for(var ri=0;ri<RANKS.length;ri++)d.push({rank:RANKS[ri],suit:SUITS[si]});return d;}
  function shuf(ar){for(var i=ar.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=ar[i];ar[i]=ar[j];ar[j]=t;}return ar;}
  function deal(){
    var deck=shuf(makeDeck());
    hands=[[],[],[],[]];
    for(var i=0;i<20;i++)hands[i%4].push(deck[i]);
    upcard=deck[20];
    trumpSuit='';teamTricks=[0,0];callingTeam=-1;trick=[];trickCards=[null,null,null,null];
    loner=false;sittingOut=-1;
  }
  // Heuristic: should THIS hand go alone?
  // Strong indicators: both bowers + ace of trump, OR right bower + 3 more trumps.
  function aiShouldGoAlone(p,t){
    var hand=hands[p];
    var rb=false,lb=false,acet=false,trumps=0,offAce=0;
    for(var i=0;i<hand.length;i++){
      var c=hand[i];var es=effSuit(c,t);
      if(es===t){trumps++;
        if(c.rank==='J'&&c.suit===t)rb=true;
        else if(c.rank==='J'&&c.suit===SAME_COLOR[t])lb=true;
        else if(c.rank==='A')acet=true;
      } else if(c.rank==='A')offAce++;
    }
    // Both bowers + ace = near-lock for sweep
    if(rb&&lb&&acet)return true;
    // Both bowers + 4 trumps total + at least 1 off ace = good odds
    if(rb&&lb&&trumps>=4&&offAce>=1)return true;
    return false;
  }
  // Skip the sit-out partner during turn rotation when loner is in effect.
  function nextSeat(p){
    var n=(p+1)%4;
    if(loner&&n===sittingOut)n=(n+1)%4;
    return n;
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
    var amCaller=(p%2===callingTeam);
    if(isLead){
      var tc=pl.filter(function(c){return effSuit(c,trumpSuit)===trumpSuit;});
      var oa=pl.filter(function(c){return c.rank==='A'&&effSuit(c,trumpSuit)!==trumpSuit;});
      // Lead-trump-after-call strategy: if AI's team called, lead a
      // high trump on the FIRST trick to draw out opponents' trump.
      // Without this, AI was hoarding trump and getting overrun on
      // off-suit aces in late tricks.
      var tricksDone=teamTricks[0]+teamTricks[1];
      if(amCaller&&tricksDone===0&&tc.length>=2){
        tc.sort(function(x,y){return cardVal(y,trumpSuit,trumpSuit)-cardVal(x,trumpSuit,trumpSuit);});
        return tc[0]; // highest trump
      }
      if(tc.length>=3){tc.sort(function(x,y){return cardVal(y,trumpSuit,trumpSuit)-cardVal(x,trumpSuit,trumpSuit);});return tc[0];}
      if(oa.length>0)return oa[0]; // off-suit ace is a likely trick winner
      // Otherwise lead the lowest non-trump to conserve big cards
      var nonTrump=pl.filter(function(c){return effSuit(c,trumpSuit)!==trumpSuit;});
      var lead=nonTrump.length>0?nonTrump:pl;
      lead.sort(function(x,y){return cardVal(x,trumpSuit,'x')-cardVal(y,trumpSuit,'x');});
      return lead[0];
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
    if(aiOrderUp(currentPlayer,upcard)){
      var alone=aiShouldGoAlone(currentPlayer,upcard.suit);
      orderUp(currentPlayer,alone);return;
    }
    sm(PLAYER_NAMES[currentPlayer]+' passes');
    currentPlayer=(currentPlayer+1)%4;
    if(currentPlayer===leader){phase='call2';currentPlayer=leader;
      if(currentPlayer!==SOUTH)setTimeout(aiCall2,600);else render();return;}
    render();if(currentPlayer!==SOUTH)setTimeout(aiCall1,600);
  }
  function aiCall2(){
    if(phase!=='call2')return;
    var suit=aiPickTrump(currentPlayer);
    if(suit){
      var alone=aiShouldGoAlone(currentPlayer,suit);
      callTrump(currentPlayer,suit,alone);return;
    }
    if(currentPlayer===dealer){
      var fb=aiPickTrump(currentPlayer);
      if(!fb){var opts=SUITS.filter(function(x){return x!==upcard.suit;});fb=opts[Math.floor(Math.random()*opts.length)];}
      var alone2=aiShouldGoAlone(currentPlayer,fb);
      callTrump(currentPlayer,fb,alone2);return;
    }
    sm(PLAYER_NAMES[currentPlayer]+' passes');
    currentPlayer=(currentPlayer+1)%4;render();
    if(currentPlayer!==SOUTH)setTimeout(aiCall2,600);
  }
  function orderUp(p,goAlone){
    trumpSuit=upcard.suit;callingTeam=p%2;
    if(goAlone){loner=true;sittingOut=(p+2)%4;}
    sm(PLAYER_NAMES[p]+' calls '+_pip(trumpSuit)+' Strong'+(goAlone?' (alone)':''));
    var dh=hands[dealer];dh.push(upcard);
    dh.sort(function(x,y){return cardVal(x,trumpSuit,'x')-cardVal(y,trumpSuit,'x');});
    dh.shift();
    startPlay();
  }
  function callTrump(p,suit,goAlone){
    trumpSuit=suit;callingTeam=p%2;
    if(goAlone){loner=true;sittingOut=(p+2)%4;}
    sm(PLAYER_NAMES[p]+' calls '+_pip(suit)+' Strong'+(goAlone?' (alone)':''));
    startPlay();
  }
  function startPlay(){
    phase='play';currentPlayer=leader;trick=[];trickCards=[null,null,null,null];
    // If loner is in effect and the leader IS the sit-out partner,
    // the lead passes to the next live seat instead.
    if(loner&&currentPlayer===sittingOut)currentPlayer=nextSeat(currentPlayer);
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
    trick.push({player:p,card:card});trickCards[p]=card;
    lastPlayed=p; // mark so render() applies the slide animation
    render();
    // Loner mode = 3 cards per trick instead of 4
    var trickFull=trick.length>=(loner?3:4);
    if(trickFull){
      phase='trickDone';
      var winner=trickWin(trick,trumpSuit);var wt=winner%2;teamTricks[wt]++;
      setTimeout(function(){
        sm(PLAYER_NAMES[winner]+' wins the trick');
        setTimeout(function(){
          trick=[];trickCards=[null,null,null,null];lastPlayed=-1;
          if(teamTricks[0]+teamTricks[1]>=5){scoreHand();return;}
          leader=winner;currentPlayer=leader;phase='play';render();
          if(currentPlayer!==SOUTH)setTimeout(aiPlay,600);
        },1100); // longer pause so player can read the trick before clear
      },650);
      return;
    }
    currentPlayer=nextSeat(currentPlayer);render();
    if(currentPlayer!==SOUTH)setTimeout(aiPlay,500);
  }
  function scoreHand(){
    phase='handDone';
    var ct=teamTricks[callingTeam],dt=teamTricks[1-callingTeam];
    var pts=0,team=-1;
    if(ct>=3){
      team=callingTeam;
      // Standard Euchre scoring:
      //   normal call, 3-4 tricks       = 1
      //   normal call, all 5 (march)    = 2
      //   loner call, 3-4 tricks         = 1
      //   loner call, all 5 alone        = 4
      if(ct===5){pts=loner?4:2;}else{pts=1;}
    } else {
      // Defenders euchred the makers — always 2 points
      team=1-callingTeam;pts=2;
    }
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
    // Helper for the dealer badge so it's consistent everywhere
    function dealerBadge(seat){return seat===dealer?'<span class="bg-dealer-badge" title="Dealer">D</span>':'';}
    function activeClass(seat){return (seat===currentPlayer&&(phase==='play'||phase==='call1'||phase==='call2'))?' bg-active':'';}
    // Score banner — readability pass: scores are big, but tricks
    // counters were 0.55rem and unreadable mid-game. Bumped to a
    // dedicated row with its own visual weight.
    h+='<div style="background:linear-gradient(135deg,rgba(26,31,23,0.9),rgba(13,16,12,0.95));border:1.5px solid rgba(122,179,86,0.3);border-radius:12px;padding:10px 14px;margin:6px 0;font-family:Bebas Neue,sans-serif;">';
    h+='<div style="display:flex;justify-content:space-around;align-items:baseline;font-size:0.95rem;">';
    h+='<div style="text-align:center;"><div style="color:var(--sage);font-size:0.7rem;letter-spacing:0.08em;">YOU + PARTNER</div><div style="color:var(--gold);font-size:1.8rem;line-height:1;margin-top:2px;">'+teamScore[0]+'</div></div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.55rem;color:var(--muted);letter-spacing:0.1em;align-self:center;">to 10</div>';
    h+='<div style="text-align:center;"><div style="color:#c47a7a;font-size:0.7rem;letter-spacing:0.08em;">OPPONENTS</div><div style="color:var(--gold);font-size:1.8rem;line-height:1;margin-top:2px;">'+teamScore[1]+'</div></div>';
    h+='</div>';
    // Dedicated tricks row — visible without squinting
    if(trumpSuit){
      h+='<div style="display:flex;justify-content:space-around;margin-top:8px;padding-top:8px;border-top:1px solid rgba(122,179,86,0.2);font-family:DM Mono,monospace;font-size:0.85rem;letter-spacing:0.06em;">';
      h+='<div style="color:var(--cream);">Tricks: <strong style="color:var(--sage);font-size:1.2rem;">'+teamTricks[0]+'</strong></div>';
      h+='<div style="color:var(--cream);">Tricks: <strong style="color:#e8a0a0;font-size:1.2rem;">'+teamTricks[1]+'</strong></div>';
      h+='</div>';
    }
    h+='</div>';
    // Strong (called suit) + dealer name — bumped from 0.55/0.7 to 0.75/0.95
    h+='<div style="display:flex;gap:14px;justify-content:center;align-items:center;padding:6px 4px;flex-wrap:wrap;">';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.75rem;color:var(--muted);letter-spacing:0.08em;">DEALER: <span style="color:var(--gold);font-family:Bebas Neue,sans-serif;font-size:0.95rem;letter-spacing:0.06em;">'+PLAYER_NAMES[dealer]+'</span></div>';
    if(trumpSuit){
      h+='<div style="font-family:DM Mono,monospace;font-size:0.85rem;color:var(--gold);letter-spacing:0.08em;">STRONG: <span style="font-size:1.6rem;vertical-align:middle;color:'+(trumpSuit==='hearts'||trumpSuit==='diamonds'?'#c47a7a':'var(--cream)')+';">'+_pip(trumpSuit)+'</span></div>';
    }
    if(loner)h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.85rem;color:var(--gold);letter-spacing:0.1em;background:rgba(200,168,75,0.15);padding:3px 10px;border-radius:6px;border:1px solid rgba(200,168,75,0.4);">⚡ LONER</div>';
    h+='</div>';
    // North (partner) hand - face down. Bumped to 38x52 (was 32x44).
    var northSittingOut=(loner&&sittingOut===NORTH);
    h+='<div style="text-align:center;padding:6px;'+(northSittingOut?'opacity:0.35;':'')+'" class="bg-seat'+activeClass(NORTH)+'"><div style="font-family:Bebas Neue,sans-serif;font-size:0.8rem;color:var(--cream);letter-spacing:0.1em;margin-bottom:5px;">PARTNER'+dealerBadge(NORTH)+(northSittingOut?' <span style="color:var(--gold);font-size:0.65rem;">(SITTING OUT)</span>':'')+'</div><div style="display:inline-flex;justify-content:center;">';
    for(var n=0;n<hands[NORTH].length;n++)h+='<div style="width:38px;height:52px;border-radius:5px;background:linear-gradient(135deg,#4A7C35,#3a6028);border:1.5px solid #2d4a1e;margin-left:'+(n===0?'0':'-22px')+';"></div>';
    h+='</div></div>';
    // Middle: West | Trick | East. Bumped min-height + side card sizes.
    h+='<div style="display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:6px 4px;min-height:160px;">';
    // West — bumped to 32x46 (was 28x40)
    h+='<div class="bg-seat'+activeClass(WEST)+'" style="padding:4px;"><div style="font-family:Bebas Neue,sans-serif;font-size:0.8rem;color:var(--cream);text-align:center;letter-spacing:0.1em;margin-bottom:5px;">WEST'+dealerBadge(WEST)+'</div><div style="display:inline-flex;flex-direction:column;align-items:center;">';
    for(var w=0;w<hands[WEST].length;w++)h+='<div style="width:32px;height:46px;border-radius:5px;background:linear-gradient(135deg,#4A7C35,#3a6028);border:1.5px solid #2d4a1e;margin-top:'+(w===0?'0':'-32px')+';"></div>';
    h+='</div></div>';
    // Trick area — bumped min-height
    h+='<div style="position:relative;min-height:160px;background:rgba(26,31,23,0.3);border-radius:8px;">';
    if(upcard&&phase==='call1'){
      var ucol=upcard.suit==='hearts'||upcard.suit==='diamonds'?'#c47a7a':'#1a1f17';
      h+='<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#F5F0E1;color:'+ucol+';border:2px solid #C4B998;border-radius:6px;padding:6px;font-weight:700;">';
      h+='<div style="font-size:0.95rem;">'+upcard.rank+'</div><div style="font-size:1.4rem;text-align:center;">'+_pip(upcard.suit)+'</div></div>';
    }
    // Played cards positioned. Now bigger (was font-size 0.7rem) and
    // animated in via .bg-played-{seat} class on the most recent play.
    var pos={};pos[SOUTH]='bottom:8px;left:50%;transform:translateX(-50%);';pos[WEST]='left:8px;top:50%;transform:translateY(-50%);';pos[NORTH]='top:8px;left:50%;transform:translateX(-50%);';pos[EAST]='right:8px;top:50%;transform:translateY(-50%);';
    var SEAT_LETTER={};SEAT_LETTER[SOUTH]='S';SEAT_LETTER[WEST]='W';SEAT_LETTER[NORTH]='N';SEAT_LETTER[EAST]='E';
    for(var pl=0;pl<4;pl++){
      var c=trickCards[pl];if(!c)continue;
      var col=c.suit==='hearts'||c.suit==='diamonds'?'#c47a7a':'#1a1f17';
      var animCls=(pl===lastPlayed)?(' bg-played-'+SEAT_LETTER[pl]):'';
      h+='<div class="bg-pcard'+animCls+'" style="position:absolute;'+pos[pl]+'background:#F5F0E1;color:'+col+';border:2px solid '+(pl%2===0?'#4A7C35':'#C47A7A')+';border-radius:6px;padding:6px 9px;font-weight:700;font-size:0.85rem;min-width:38px;">';
      h+='<div>'+c.rank+'</div><div style="font-size:1.1rem;text-align:center;">'+_pip(c.suit)+'</div></div>';
    }
    h+='</div>';
    // East — bumped to 32x46
    h+='<div class="bg-seat'+activeClass(EAST)+'" style="padding:4px;"><div style="font-family:Bebas Neue,sans-serif;font-size:0.8rem;color:var(--cream);text-align:center;letter-spacing:0.1em;margin-bottom:5px;">EAST'+dealerBadge(EAST)+'</div><div style="display:inline-flex;flex-direction:column;align-items:center;">';
    for(var e=0;e<hands[EAST].length;e++)h+='<div style="width:32px;height:46px;border-radius:5px;background:linear-gradient(135deg,#4A7C35,#3a6028);border:1.5px solid #2d4a1e;margin-top:'+(e===0?'0':'-32px')+';"></div>';
    h+='</div></div>';
    h+='</div>';
    // South (player) hand
    h+='<div class="bg-seat'+activeClass(SOUTH)+'" style="padding:6px;"><div style="font-family:Bebas Neue,sans-serif;font-size:0.85rem;color:var(--cream);text-align:center;letter-spacing:0.1em;margin-bottom:6px;">YOUR HAND'+dealerBadge(SOUTH)+'</div>';
    h+='<div style="display:flex;gap:5px;justify-content:center;flex-wrap:wrap;">';
    var ls=trick.length>0?effSuit(trick[0].card,trumpSuit):'';
    var pl2=phase==='play'&&currentPlayer===SOUTH?playable(hands[SOUTH],trumpSuit,ls):[];
    // Sort hand for display: when trump is set, group by effective
    // suit then by trump-aware value (high to low). This puts the
    // right bower → left bower → other trumps together so the player
    // doesn't have to hunt for what's actually trump.
    var sortedHand=hands[SOUTH].slice();
    if(trumpSuit){
      sortedHand.sort(function(a,b){
        var ea=effSuit(a,trumpSuit),eb=effSuit(b,trumpSuit);
        if(ea!==eb){
          // trump first, then alphabetical for stable ordering
          if(ea===trumpSuit)return -1;
          if(eb===trumpSuit)return 1;
          return ea<eb?-1:1;
        }
        return cardVal(b,trumpSuit,trumpSuit)-cardVal(a,trumpSuit,trumpSuit);
      });
    }
    for(var k=0;k<sortedHand.length;k++){
      var cc=sortedHand[k];var canPlay=false;
      for(var m=0;m<pl2.length;m++)if(pl2[m].rank===cc.rank&&pl2[m].suit===cc.suit){canPlay=true;break;}
      // Left bower flag: a J whose suit matches the SAME-COLOR partner
      // of trump is functionally a trump card and we mark it.
      var isLeftBower=trumpSuit&&cc.rank==='J'&&cc.suit===SAME_COLOR[trumpSuit];
      var isRightBower=trumpSuit&&cc.rank==='J'&&cc.suit===trumpSuit;
      var ccol=cc.suit==='hearts'||cc.suit==='diamonds'?'#c47a7a':'#1a1f17';
      var bc=canPlay?'#7AB956':'#C4B998';
      if(isLeftBower||isRightBower)bc='#c8a84b'; // gold border for bowers
      var sty='width:50px;height:70px;border-radius:6px;background:#F5F0E1;color:'+ccol+';border:2.5px solid '+bc+';display:inline-flex;flex-direction:column;align-items:center;justify-content:center;font-weight:700;position:relative;';
      if(canPlay)sty+='cursor:pointer;box-shadow:0 2px 10px rgba(122,179,86,0.35);';
      if(isLeftBower||isRightBower)sty+='box-shadow:0 0 12px rgba(200,168,75,0.45);';
      var oc=canPlay?' onclick="_BGCC(\''+cc.rank+'\',\''+cc.suit+'\')"':'';
      h+='<div style="'+sty+'"'+oc+'><span style="font-size:0.78rem;position:absolute;top:2px;left:5px;">'+cc.rank+'</span>';
      if(isLeftBower)h+='<span style="font-size:0.42rem;color:#c8a84b;position:absolute;top:2px;right:4px;font-family:Bebas Neue,sans-serif;letter-spacing:0.06em;">L</span>';
      if(isRightBower)h+='<span style="font-size:0.42rem;color:#c8a84b;position:absolute;top:2px;right:4px;font-family:Bebas Neue,sans-serif;letter-spacing:0.06em;">R</span>';
      h+='<span style="font-size:1.2rem;">'+_pip(cc.suit)+'</span></div>';
    }
    h+='</div></div>';
    // Go-alone prompt — shown after player commits to a call
    if(phase==='goalone'){
      h+='<div style="padding:10px;text-align:center;background:rgba(26,31,23,0.6);border:1.5px solid rgba(200,168,75,0.3);border-radius:8px;margin:6px 0;">';
      h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.85rem;color:var(--gold);letter-spacing:0.1em;margin-bottom:4px;">GO ALONE?</div>';
      h+='<div style="font-size:0.55rem;color:var(--muted);margin-bottom:8px;line-height:1.5;">Play this hand without your partner. Sweep all 5 alone = <strong style="color:var(--gold);">+4 points</strong>.</div>';
      h+='<div style="display:flex;gap:6px;justify-content:center;">';
      h+='<button class="gb" onclick="_BGalone(true)" style="min-height:48px;padding:8px 18px;background:rgba(200,168,75,0.2);border-color:rgba(200,168,75,0.5);color:var(--gold);">⚡ ALONE</button>';
      h+='<button class="gb" onclick="_BGalone(false)" style="min-height:48px;padding:8px 18px;">WITH PARTNER</button>';
      h+='</div></div>';
    }
    // Call UI
    if(phase==='call1'&&currentPlayer===SOUTH){
      h+='<div style="padding:8px;text-align:center;background:rgba(26,31,23,0.5);border-radius:8px;margin:6px 0;">';
      h+='<div style="font-size:0.6rem;color:var(--muted);margin-bottom:6px;">Make '+_pip(upcard.suit)+' your Strong suit?</div>';
      h+='<div style="display:flex;gap:6px;justify-content:center;">';
      h+='<button class="gb" onclick="_BGORD()" style="min-height:44px;padding:8px 16px;background:rgba(200,168,75,0.15);border-color:rgba(200,168,75,0.4);color:var(--gold);">CALL '+_pip(upcard.suit)+' STRONG</button>';
      h+='<button class="gb" onclick="_BGP1()" style="min-height:44px;padding:8px 16px;">PASS</button>';
      h+='</div></div>';
    }
    if(phase==='call2'&&currentPlayer===SOUTH){
      h+='<div style="padding:8px;text-align:center;background:rgba(26,31,23,0.5);border-radius:8px;margin:6px 0;">';
      h+='<div style="font-size:0.6rem;color:var(--muted);margin-bottom:6px;">Pick your Strong suit (not '+_pip(upcard.suit)+'):</div>';
      h+='<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">';
      for(var si=0;si<SUITS.length;si++){
        if(SUITS[si]===upcard.suit)continue;
        var icol=SUITS[si]==='hearts'||SUITS[si]==='diamonds'?'#c47a7a':'var(--cream)';
        h+='<button class="gb" onclick="_BGCT(\''+SUITS[si]+'\')" style="min-height:48px;min-width:48px;padding:6px 14px;font-size:1.4rem;color:'+icol+';">'+_pip(SUITS[si])+'</button>';
      }
      if(currentPlayer!==dealer)h+='<button class="gb" onclick="_BGP2()" style="min-height:44px;padding:8px 16px;">PASS</button>';
      h+='</div></div>';
    }
    pan.innerHTML=h;
  }

  // Two-step call flow when human calls: stash the pending call,
  // ask "go alone?", then commit.
  var _pendingCall=null;
  function askGoAlone(commitFn){
    _pendingCall=commitFn;
    // Render replaces the call UI with the alone prompt
    phase='goalone';render();
  }

  window._BGN=function(){teamScore=[0,0];roundNum=0;dealer=EAST;newHand();};
  window._BGCC=function(r,s){onCardClick({rank:r,suit:s});};
  window._BGORD=function(){
    if(phase!=='call1'||currentPlayer!==SOUTH)return;
    askGoAlone(function(alone){orderUp(SOUTH,alone);});
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
    askGoAlone(function(alone){callTrump(SOUTH,suit,alone);});
  };
  window._BGalone=function(yes){
    if(phase!=='goalone'||!_pendingCall)return;
    var fn=_pendingCall;_pendingCall=null;
    fn(!!yes);
  };

  _BGN();
};
})();
