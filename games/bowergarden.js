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
    '@keyframes bgTurnRing{0%,100%{box-shadow:0 0 0 3px rgba(255,220,112,0.75),0 0 22px rgba(255,220,112,0.45)}50%{box-shadow:0 0 0 4px rgba(255,220,112,0.9),0 0 30px rgba(255,220,112,0.65)}}'+
    '@keyframes bgBidFlash{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.15);opacity:1}100%{transform:scale(1);opacity:1}}'+
    '@keyframes bgWinPulse{0%,100%{box-shadow:0 0 0 2px #ffdc70,0 0 18px rgba(255,220,112,0.6)}50%{box-shadow:0 0 0 3px #ffe896,0 0 28px rgba(255,232,150,0.85)}}'+
    '.bg-win-glow{animation:bgWinPulse 0.55s ease-in-out infinite;transform-origin:center;z-index:3;}'+
    '.bg-dealer-badge{display:inline-block;width:20px;height:20px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff4c2 0%,#d4b86a 40%,#8b6a20 100%);color:#3a2a08;font-family:Georgia,serif;font-size:0.75rem;font-weight:700;text-align:center;line-height:20px;margin-left:6px;vertical-align:middle;box-shadow:inset 0 1px 0 rgba(255,255,255,0.5),0 2px 4px rgba(0,0,0,0.5);border:1.5px solid #5a4010;text-shadow:0 1px 0 rgba(255,255,255,0.4);}'+
    '.bg-seat{transition:opacity .3s ease,filter .3s ease;border-radius:10px;}'+
    '.bg-seat.bg-inactive{opacity:0.55;}'+
    '.bg-seat.bg-sitting-out{opacity:0.3;filter:grayscale(0.7);}'+
    '.bg-active{animation:bgTurnRing 1.4s ease-in-out infinite;border-radius:10px;}'+
    '.bg-seat-caller{position:relative}'+
    '.bg-seat-caller::before{content:"";position:absolute;top:-4px;right:-4px;width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff4c2,#d4b86a 50%,#8b6a20);border:1.5px solid #5a4010;box-shadow:0 2px 4px rgba(0,0,0,0.5);z-index:2;}'+
    '.bg-team-us{color:#7ab356}'+
    '.bg-team-them{color:#dc8a8a}';
  document.head.appendChild(_bgs);
}

window._gameFns = window._gameFns || {};
window._gameFns.bowergarden = function BG(a){
  // Generation-guarded timers (2026-07-03 audit): New Game during a trick pause
  // used to let stale timers force phase='play' with no trump onto the fresh
  // deal (scoreHand then wrote teamScore[2]=NaN), and timers kept firing earns
  // after leaving the game entirely.
  var bwGen=0;
  function bwT(fn,ms){var g=bwGen;setTimeout(function(){if(g===bwGen)fn();},ms);}
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){bwGen++;var o=document.getElementById('BW-over');if(o)o.remove();});
  var SUITS=['hearts','diamonds','clubs','spades'];
  var SUIT_ICONS={hearts:'♥',diamonds:'♦',clubs:'♣',spades:'♠'};
  var RANKS=['9','10','J','Q','K','A'];
  var RANK_ORDER={9:0,10:1,J:2,Q:3,K:4,A:5};
  var SAME_COLOR={hearts:'diamonds',diamonds:'hearts',clubs:'spades',spades:'clubs'};
  var SOUTH=0,WEST=1,NORTH=2,EAST=3;
  var PLAYER_NAMES=['You','West','Partner','East'];

  var hands=[[],[],[],[]];
  var trick=[],trickCards=[null,null,null,null];
  var trumpSuit='',upcard=null,dealer=EAST,leader=0,currentPlayer=0,pickedUp=null;
  var teamScore=[0,0],teamTricks=[0,0];
  var callingTeam=-1,callingSeat=-1,phase='',roundNum=0;
  var loner=false,sittingOut=-1; // loner = caller went alone, sittingOut = partner who sits out
  // Bidding ticker — persistent tag per seat (null | 'pass' | {kind:'order'|'call', suit, alone})
  // So players can reconstruct who decided what without relying on a vanished toast.
  var bidDecisions=[null,null,null,null];
  var lastBidSeat=-1; // the most recent bidder (for a brief 'fresh' highlight)
  var trickWinner=-1; // during trick-complete pause, the seat whose card won

  ms(a,'<span style="font-family:Georgia,serif;letter-spacing:.06em;">🃏 <strong id="BGs" style="color:#7ab356;font-size:1.2em;">0</strong> <span style="color:rgba(232,220,200,0.5);font-size:0.8em;">vs</span> <strong id="BGo" style="color:#dc8a8a;font-size:1.2em;">0</strong></span>');
  mm(a);
  var pan=document.createElement('div');
  pan.id='BGpan';
  // Felt table background — signature card-game visual. Noise-textured green
  // with brass-gold edge binding. Matches cribbage's treatment for consistency.
  var _EU_FELT="data:image/svg+xml;utf8,"+encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">'
      +'<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7"/>'
      +'<feColorMatrix values="0 0 0 0 0.04  0 0 0 0 0.08  0 0 0 0 0.04  0 0 0 .08 0"/></filter>'
      +'<rect width="100%" height="100%" filter="url(#n)"/>'
    +'</svg>'
  );
  pan.style.cssText='max-width:min(96vw,760px);margin:0 auto;padding:6px 14px 14px;user-select:none;box-sizing:border-box;'
    +'background:'
      +'url("'+_EU_FELT+'"),'
      +'radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.06) 0%,transparent 50%),'
      +'radial-gradient(circle at 50% 100%,rgba(0,0,0,0.25) 0%,transparent 65%),'
      +'linear-gradient(135deg,#0f5c35 0%,#0b4d2c 55%,#083d22 100%);'
    +'background-size:180px 180px, auto, auto, auto;'
    +'border-radius:14px;'
    +'border:2px solid #6b4520;'
    +'box-shadow:'
      +'inset 0 0 0 1px rgba(180,140,70,0.25),'
      +'inset 0 0 38px rgba(0,0,0,0.4),'
      +'0 6px 22px rgba(0,0,0,0.55);';
  a.appendChild(pan);
  function _pip(suitName){return (window._cdPipFor)?window._cdPipFor(suitName):SUIT_ICONS[suitName];}
  // mc(a) still runs so downstream code finds the controls container, but
  // we leave it empty — NEW + Style now live inside the pan.
  mc(a);
  window._BGToggleStyle=function(){
    if(typeof window._cdToggleStyle!=='function'){
      if(window._toast)window._toast('Card styles loading, try again in a sec.');
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
    trumpSuit='';teamTricks=[0,0];callingTeam=-1;callingSeat=-1;trick=[];trickCards=[null,null,null,null];
    loner=false;sittingOut=-1;
    bidDecisions=[null,null,null,null];lastBidSeat=-1;
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
    if(currentPlayer!==SOUTH)bwT(aiCall1,600);
  }
  function aiCall1(){
    if(phase!=='call1')return;
    if(aiOrderUp(currentPlayer,upcard)){
      var alone=aiShouldGoAlone(currentPlayer,upcard.suit);
      bidDecisions[currentPlayer]={kind:'order',suit:upcard.suit,alone:alone};
      lastBidSeat=currentPlayer;
      orderUp(currentPlayer,alone);return;
    }
    bidDecisions[currentPlayer]='pass';lastBidSeat=currentPlayer;
    sm(PLAYER_NAMES[currentPlayer]+' passes');
    currentPlayer=(currentPlayer+1)%4;
    if(currentPlayer===leader){
      phase='call2';currentPlayer=leader;
      // Clear pass tags from round 1 so round-2 decisions don't pile up.
      bidDecisions=[null,null,null,null];lastBidSeat=-1;
      if(currentPlayer!==SOUTH)bwT(aiCall2,600);else render();return;
    }
    render();if(currentPlayer!==SOUTH)bwT(aiCall1,600);
  }
  function aiCall2(){
    if(phase!=='call2')return;
    var suit=aiPickTrump(currentPlayer);
    if(suit){
      var alone=aiShouldGoAlone(currentPlayer,suit);
      bidDecisions[currentPlayer]={kind:'call',suit:suit,alone:alone};
      lastBidSeat=currentPlayer;
      callTrump(currentPlayer,suit,alone);return;
    }
    if(currentPlayer===dealer){
      var fb=aiPickTrump(currentPlayer);
      if(!fb){var opts=SUITS.filter(function(x){return x!==upcard.suit;});fb=opts[Math.floor(Math.random()*opts.length)];}
      var alone2=aiShouldGoAlone(currentPlayer,fb);
      bidDecisions[currentPlayer]={kind:'call',suit:fb,alone:alone2};
      lastBidSeat=currentPlayer;
      callTrump(currentPlayer,fb,alone2);return;
    }
    bidDecisions[currentPlayer]='pass';lastBidSeat=currentPlayer;
    sm(PLAYER_NAMES[currentPlayer]+' passes');
    currentPlayer=(currentPlayer+1)%4;render();
    if(currentPlayer!==SOUTH)bwT(aiCall2,600);
  }
  function orderUp(p,goAlone){
    trumpSuit=upcard.suit;callingTeam=p%2;callingSeat=p;
    if(goAlone){loner=true;sittingOut=(p+2)%4;}
    sm(PLAYER_NAMES[p]+' calls '+SUIT_ICONS[trumpSuit]+' Strong'+(goAlone?' (alone)':''));
    var dh=hands[dealer];dh.push(upcard);
    // Human dealer picks up the turn card and chooses a discard by hand.
    // AI dealer keeps the previous auto-discard-lowest behavior.
    if(dealer===SOUTH){
      pickedUp=upcard; // remember which card was picked up for the NEW badge
      phase='discard';
      render();
      return;
    }
    dh.sort(function(x,y){return cardVal(x,trumpSuit,'x')-cardVal(y,trumpSuit,'x');});
    dh.shift();
    startPlay();
  }
  function completeDiscard(card){
    var dh=hands[SOUTH];
    for(var i=0;i<dh.length;i++){
      if(dh[i].rank===card.rank&&dh[i].suit===card.suit){
        dh.splice(i,1);
        sm('You discard '+card.rank+' '+SUIT_ICONS[card.suit]);
        pickedUp=null;
        startPlay();
        return;
      }
    }
  }
  function callTrump(p,suit,goAlone){
    trumpSuit=suit;callingTeam=p%2;callingSeat=p;
    if(goAlone){loner=true;sittingOut=(p+2)%4;}
    // SUIT_ICONS (plain ♥♦♣♠), not _pip() — the status line is textContent,
    // so _pip's floral <img> markup printed as raw HTML every hand.
    sm(PLAYER_NAMES[p]+' calls '+SUIT_ICONS[suit]+' Strong'+(goAlone?' (alone)':''));
    startPlay();
  }
  function startPlay(){
    phase='play';currentPlayer=leader;trick=[];trickCards=[null,null,null,null];
    // If loner is in effect and the leader IS the sit-out partner,
    // the lead passes to the next live seat instead.
    if(loner&&currentPlayer===sittingOut)currentPlayer=nextSeat(currentPlayer);
    render();
    if(currentPlayer!==SOUTH)bwT(aiPlay,700);
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
      // Beat 1: 400ms after the final card lands, declare the winner. The
      // winning card glows via trickWinner state and stays on the table.
      bwT(function(){
        trickWinner=winner;
        sm(winner===0?'You win the trick':PLAYER_NAMES[winner]+' wins the trick');
        render();
        // Beat 2: 1100ms hold on the winner glow, then sweep-out animation
        // via opacity fade, then clear and proceed.
        bwT(function(){
          trickWinner=-1;
          trick=[];trickCards=[null,null,null,null];lastPlayed=-1;
          if(teamTricks[0]+teamTricks[1]>=(loner?5:5)){scoreHand();return;}
          leader=winner;currentPlayer=leader;phase='play';render();
          if(currentPlayer!==SOUTH)bwT(aiPlay,700);
        },1100);
      },400);
      return;
    }
    currentPlayer=nextSeat(currentPlayer);render();
    if(currentPlayer!==SOUTH)bwT(aiPlay,550);
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
    sm(tn+' +'+pts);
    // Earn only when YOUR team scores the hand (incl. the march bonus) —
    // getting euchred shouldn't pay you.
    if(team===0){_e('milestone');if(ct===5||dt===0)_e('progress');}
    if(teamScore[0]>=10||teamScore[1]>=10){
      phase='gameOver';
      bwT(function(){
        var won=teamScore[0]>=10;
        if(won){_e('game_win');_playWin();sm('🃏 You win! '+teamScore[0]+'-'+teamScore[1]);}
        else{_e('game_loss');_play('lose');sm('Garden resting. '+teamScore[0]+'-'+teamScore[1]);}
        _sr('bowergarden',{w:won,s:teamScore[0],r:roundNum});
        var w=0,l=0;try{w=parseInt(localStorage.getItem('lw_euchre_w'),10)||0;l=parseInt(localStorage.getItem('lw_euchre_l'),10)||0;}catch(e){}
        if(won)w++;else l++;
        try{localStorage.setItem('lw_euchre_w',String(w));localStorage.setItem('lw_euchre_l',String(l));}catch(e){}
        var _o=document.getElementById('BW-over');if(_o)_o.remove();
        var ov=document.createElement('div');ov.id='BW-over';
        ov.style.cssText='position:fixed;inset:0;z-index:9999;background:radial-gradient(ellipse at 50% 40%,'+(won?'rgba(122,179,86,0.3)':'rgba(199,138,80,0.16)')+' 0%,rgba(13,16,12,0.92) 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;font-family:Georgia,serif;';
        ov.innerHTML='<div style="font-size:3rem;line-height:1;">'+(won?'\ud83c\udfc6':'\ud83c\udf42')+'</div>'
          +'<div style="font-size:1.7rem;font-weight:700;color:'+(won?'#7ab356':'#c78a50')+';letter-spacing:0.08em;margin-top:12px;">'+(won?'MATCH WON':'MATCH LOST')+'</div>'
          +'<div style="font-size:0.95rem;color:#e8dcc8;margin-top:10px;">You '+teamScore[0]+' \u00b7 Them '+teamScore[1]+' \u00b7 '+roundNum+' hands</div>'
          +'<div style="font-style:italic;font-size:0.8rem;color:#8a9178;margin-top:6px;">lifetime '+w+'W / '+l+'L</div>'
          +'<button id="BW-again" style="margin-top:22px;min-height:48px;padding:12px 28px;font-family:Georgia,serif;font-weight:700;font-size:0.9rem;background:linear-gradient(180deg,rgba(122,179,86,0.35),rgba(74,124,53,0.45));border:2px solid #7ab356;color:#f5ebd0;border-radius:10px;cursor:pointer;">\u21bb NEW MATCH</button>'
          +'<button id="BW-view" style="margin-top:10px;min-height:44px;padding:8px 20px;background:transparent;border:1px solid rgba(138,145,120,0.4);color:#8a9178;border-radius:10px;font-size:0.75rem;cursor:pointer;">view the last hand</button>';
        ov.querySelector('#BW-again').onclick=function(){ov.remove();window._BGN();};
        ov.querySelector('#BW-view').onclick=function(){ov.remove();};
        ov.onclick=function(ev){if(ev.target===ov)ov.remove();};
        document.body.appendChild(ov);
      },1000);
      return;
    }
    bwT(newHand,2000);
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
  // Bidding-ticker tag next to each seat's name. Shows the seat's most recent
  // decision during call1/call2 so players can reconstruct the round without
  // relying on a vanished toast.
  function _bidTag(seat){
    var d=bidDecisions[seat];if(!d)return '';
    var fresh = (seat===lastBidSeat) ? ';animation:bgBidFlash .6s ease-out' : '';
    if(d==='pass'){
      return '<span class="bg-bidtag" style="display:inline-block;padding:1px 6px;margin-left:5px;font-size:0.48rem;font-family:Georgia,serif;font-style:italic;color:rgba(232,220,200,0.55);background:rgba(0,0,0,0.3);border:1px solid rgba(232,220,200,0.2);border-radius:3px;vertical-align:middle'+fresh+'">passed</span>';
    }
    if(d.kind==='order'||d.kind==='call'){
      var red=(d.suit==='hearts'||d.suit==='diamonds');
      var col=red?'#e63946':'#f5ebd0';
      var label=d.kind==='order'?'ordered':'called';
      return '<span class="bg-bidtag" style="display:inline-flex;align-items:center;gap:3px;padding:1px 5px 1px 3px;margin-left:5px;font-size:0.5rem;font-family:Georgia,serif;color:#ffdc70;background:rgba(0,0,0,0.4);border:1px solid #ffdc70;border-radius:3px;vertical-align:middle'+fresh+'">'
        +'<span style="color:'+col+';font-size:0.7rem;line-height:1;">'+_pip(d.suit)+'</span>'
        +label+(d.alone?' alone':'')
      +'</span>';
    }
    return '';
  }
  // ── UI Helpers ──────────────────────────────────────────────
  function _scoreBarHtml(){
    var h='';
    var pCol='#7ab356', oCol='#dc8a8a';
    h+='<div style="display:flex;gap:6px;margin-bottom:8px;">';
    h+=_teamStrip('YOU + PARTNER', teamScore[0], teamTricks[0], pCol, callingTeam===0);
    h+=_teamStrip('OPPONENTS',     teamScore[1], teamTricks[1], oCol, callingTeam===1);
    h+='</div>';
    return h;
  }
  function _teamStrip(label, score, tricks, color, isCaller){
    // Always render 5 pip placeholders so the strip height stays stable
    // between hands. Pips are dim when trump hasn't been called yet.
    var showFilled = !!trumpSuit;
    var tricksHtml='';
    for(var i=0;i<5;i++){
      var on=showFilled&&i<tricks;
      var bg = showFilled ? (on?color:'rgba(0,0,0,0.35)') : 'rgba(0,0,0,0.25)';
      var bd = 'rgba(0,0,0,0.5)';
      var glow = on?'box-shadow:0 0 6px '+color+'aa;':'';
      tricksHtml+='<span style="display:inline-block;width:8px;height:8px;border-radius:50%;margin:0 1px;background:'+bg+';border:1px solid '+bd+';'+glow+'"></span>';
    }
    var callerTag = isCaller ? '<span style="display:inline-block;padding:1px 5px;margin-left:4px;font-size:0.45rem;font-family:Georgia,serif;font-style:italic;color:#ffdc70;border:1px solid #ffdc70;border-radius:3px;vertical-align:middle;">caller</span>' : '';
    return '<div style="flex:1;background:linear-gradient(180deg,rgba(0,0,0,0.35),rgba(0,0,0,0.5));border:1.5px solid '+color+';border-radius:8px;padding:6px 10px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.08),0 2px 6px rgba(0,0,0,0.35);">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;">'
        +'<div>'
          +'<div style="font-family:DM Mono,monospace;font-size:0.5rem;letter-spacing:0.12em;color:'+color+';text-transform:uppercase;">'+label+callerTag+'</div>'
          +'<div style="font-family:Georgia,serif;font-size:1.6rem;font-weight:700;color:#f5ebd0;line-height:1;margin-top:1px;text-shadow:0 2px 3px rgba(0,0,0,0.4);">'+score+'</div>'
        +'</div>'
        +'<div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;opacity:'+(showFilled?'1':'0.45')+';">'
          +'<div style="font-family:DM Mono,monospace;font-size:0.48rem;letter-spacing:0.1em;color:rgba(232,220,200,0.55);">tricks</div>'
          +'<div>'+tricksHtml+'</div>'
        +'</div>'
      +'</div>'
    +'</div>';
  }
  function _headerHtml(){
    // Persistent trump chip (center) + dealer name (left) + alone badge
    var h='<div style="display:flex;gap:8px;align-items:center;justify-content:space-between;padding:4px 2px 10px;">';
    // Dealer name
    h+='<div style="font-family:DM Mono,monospace;font-size:0.52rem;letter-spacing:0.12em;color:rgba(232,220,200,0.6);text-transform:uppercase;">Dealer<br/><span style="color:#f5ebd0;font-family:Georgia,serif;font-size:0.85rem;letter-spacing:0;text-transform:none;">'+PLAYER_NAMES[dealer]+'</span></div>';
    // Trump/prompt chip — same pill shape either way so the header height
    // stays stable between hands (no jumpy layout when the old trump clears).
    if(trumpSuit){
      var red=(trumpSuit==='hearts'||trumpSuit==='diamonds');
      var pipCol= red ? '#e63946' : '#f5ebd0';
      var borderCol = callingTeam===0 ? '#7ab356' : '#dc8a8a';
      var callerName = callingTeam>=0 ? (callingTeam===0?'Your team':'Opponents') : '';
      h+='<div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border:2px solid '+borderCol+';border-radius:999px;background:linear-gradient(180deg,rgba(0,0,0,0.4),rgba(0,0,0,0.65));box-shadow:0 0 14px '+borderCol+'55,inset 0 1px 0 rgba(255,255,255,0.1);">';
      h+='<span style="font-size:1.6rem;line-height:1;color:'+pipCol+';text-shadow:0 2px 4px rgba(0,0,0,0.6);">'+_pip(trumpSuit)+'</span>';
      h+='<div style="font-family:Georgia,serif;line-height:1.1;">';
      h+='<div style="font-size:0.52rem;font-style:italic;color:rgba(232,220,200,0.65);letter-spacing:0.06em;">Strong</div>';
      h+='<div style="font-size:0.85rem;color:#f5ebd0;text-transform:capitalize;">'+trumpSuit+'</div>';
      h+='</div>';
      if(callerName)h+='<div style="font-family:Georgia,serif;font-style:italic;font-size:0.6rem;color:'+borderCol+';padding-left:8px;border-left:1px solid rgba(255,255,255,0.15);">'+callerName+' called</div>';
      h+='</div>';
    }else{
      // Placeholder pill with identical dimensions to the trump chip.
      var uc=upcard?upcard.suit:null;
      var ucRed=(uc==='hearts'||uc==='diamonds');
      var ucCol=uc?(ucRed?'#e63946':'#f5ebd0'):'rgba(232,220,200,0.35)';
      var promptLine = phase==='call1' ? 'Order up?' : phase==='call2' ? 'Call a suit' : 'Awaiting call';
      h+='<div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border:2px dashed rgba(232,220,200,0.3);border-radius:999px;background:linear-gradient(180deg,rgba(0,0,0,0.3),rgba(0,0,0,0.45));">';
      h+='<span style="font-size:1.6rem;line-height:1;color:'+ucCol+';opacity:'+(uc?'0.85':'0.4')+';">'+(uc?_pip(uc):'♠')+'</span>';
      h+='<div style="font-family:Georgia,serif;line-height:1.1;">';
      h+='<div style="font-size:0.52rem;font-style:italic;color:rgba(232,220,200,0.55);letter-spacing:0.06em;">Strong</div>';
      h+='<div style="font-size:0.78rem;color:rgba(232,220,200,0.8);font-style:italic;">'+promptLine+'</div>';
      h+='</div>';
      h+='</div>';
    }
    // Alone badge
    if(loner){
      h+='<div style="display:inline-flex;align-items:center;gap:4px;padding:4px 9px;background:linear-gradient(180deg,#ffdc70,#c48f1f);border:1px solid #8b6a20;border-radius:5px;font-family:Georgia,serif;font-weight:700;font-size:0.65rem;color:#3a2a08;text-shadow:0 1px 0 rgba(255,255,255,0.4);box-shadow:0 2px 5px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.5);letter-spacing:0.06em;">⚡ ALONE</div>';
    }else{
      h+='<div style="min-width:40px;"></div>'; // spacer to balance dealer
    }
    h+='</div>';
    return h;
  }
  function render(){
    var ps=document.getElementById('BGs');if(ps)ps.textContent=teamScore[0];
    var os=document.getElementById('BGo');if(os)os.textContent=teamScore[1];
    var h='';
    // Helper for the dealer badge so it's consistent everywhere
    function dealerBadge(seat){return seat===dealer?'<span class="bg-dealer-badge" title="Dealer">D</span>':'';}
    function seatClasses(seat){
      var cls=' bg-seat';
      var isSittingOut = loner && sittingOut===seat;
      if(isSittingOut){cls+=' bg-sitting-out';return cls;}
      var isActive=(seat===currentPlayer&&(phase==='play'||phase==='call1'||phase==='call2'));
      if(isActive)cls+=' bg-active';
      else if(phase==='play'||phase==='call1'||phase==='call2')cls+=' bg-inactive';
      // Caller badge persists through the hand — marks whoever won the bid.
      var isCaller = trumpSuit && callingTeam===seat%2 && phase!=='call1' && phase!=='call2';
      if(isCaller && seat===callingSeat)cls+=' bg-seat-caller';
      return cls;
    }
    function sittingOutBadge(seat){
      return (loner && sittingOut===seat) ? ' <span style="display:inline-block;margin-left:4px;padding:1px 6px;font-size:0.5rem;font-family:Georgia,serif;font-style:italic;color:#c4b998;background:rgba(0,0,0,0.4);border:1px solid rgba(196,185,152,0.45);border-radius:3px;vertical-align:middle;">sitting out</span>' : '';
    }
    // Legacy name — keep activeClass working for any older code paths.
    var activeClass=seatClasses;
    // ── CONTROLS BAR — top right, unobtrusive ──
    var bgStyleName = (window._cdStyleLabel && typeof window._cdStyle==='function') ? window._cdStyleLabel(window._cdStyle()) : 'Floral';
    h+='<div style="display:flex;justify-content:flex-end;align-items:center;gap:6px;margin-bottom:6px;">';
    h+='<button class="gb" onclick="if(window._cdToggleStyle){window._cdToggleStyle();if(typeof render===\'function\')render();}" title="Cycle card style" style="display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:8px 14px;font-size:0.62rem;background:linear-gradient(180deg,rgba(180,140,70,0.25),rgba(120,90,40,0.35));border:1px solid rgba(220,180,120,0.45);color:#f5ebd0;font-family:Georgia,serif;font-style:italic;box-shadow:inset 0 1px 0 rgba(255,255,255,0.12),0 2px 5px rgba(0,0,0,0.5);">';
    h+='<img src="assets/decks/floral/suit-club.png" alt="" onerror="this.style.display=\'none\';" style="width:18px;height:18px;object-fit:contain;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.7));">';
    h+='<span style="color:rgba(232,220,200,0.6);font-style:normal;font-family:DM Mono,monospace;font-size:0.5rem;letter-spacing:0.12em;text-transform:uppercase;margin-right:2px;">Deck</span>';
    h+='<span>'+bgStyleName+'</span>';
    h+='</button>';
    h+='<button class="gb" onclick="_BGN()" title="New game" style="display:inline-flex;align-items:center;gap:5px;min-height:44px;padding:8px 14px;font-size:0.65rem;background:linear-gradient(180deg,rgba(122,179,86,0.3),rgba(74,124,53,0.4));border:1px solid rgba(122,179,86,0.55);color:#f5ebd0;font-family:Georgia,serif;box-shadow:inset 0 1px 0 rgba(255,255,255,0.12),0 2px 5px rgba(0,0,0,0.5);">↻ New Game</button>';
    h+='</div>';
    // ── SCORE BAR — twin team strips w/ color + score + 5-dot trick meter ──
    h+=_scoreBarHtml();
    // ── TRUMP CHIP + DEALER + CALLER — pinned top center throughout the hand ──
    h+=_headerHtml();
    // North (partner) hand - face down. Bumped to 38x52 (was 32x44).
    h+='<div style="text-align:center;padding:6px;" class="'+activeClass(NORTH).replace(/^\s+/,'')+'"><div style="font-family:Bebas Neue,sans-serif;font-size:0.8rem;color:#7ab356;letter-spacing:0.1em;margin-bottom:5px;">PARTNER'+dealerBadge(NORTH)+_bidTag(NORTH)+sittingOutBadge(NORTH)+'</div><div style="display:inline-flex;justify-content:center;">';
    for(var n=0;n<hands[NORTH].length;n++)h+='<div style="width:38px;height:52px;border-radius:5px;background:linear-gradient(135deg,#4A7C35,#3a6028);border:1.5px solid #2d4a1e;margin-left:'+(n===0?'0':'-22px')+';"></div>';
    h+='</div></div>';
    // Middle: West | Trick | East. Bumped min-height + side card sizes.
    h+='<div style="display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:6px 4px;min-height:160px;">';
    // West — bumped to 32x46 (was 28x40)
    h+='<div class="'+activeClass(WEST).replace(/^\s+/,'')+'" style="padding:4px;"><div style="font-family:Bebas Neue,sans-serif;font-size:0.8rem;color:#dc8a8a;text-align:center;letter-spacing:0.1em;margin-bottom:5px;">WEST'+dealerBadge(WEST)+_bidTag(WEST)+sittingOutBadge(WEST)+'</div><div style="display:inline-flex;flex-direction:column;align-items:center;">';
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
      var winCls = (pl===trickWinner) ? ' bg-win-glow' : '';
      var dim = (trickWinner>=0 && pl!==trickWinner) ? 'filter:saturate(.6) brightness(.75);' : '';
      h+='<div class="bg-pcard'+animCls+winCls+'" style="position:absolute;'+pos[pl]+dim+'background:#F5F0E1;color:'+col+';border:2px solid '+(pl%2===0?'#4A7C35':'#C47A7A')+';border-radius:6px;padding:6px 9px;font-weight:700;font-size:0.85rem;min-width:38px;">';
      h+='<div>'+c.rank+'</div><div style="font-size:1.1rem;text-align:center;">'+_pip(c.suit)+'</div></div>';
    }
    h+='</div>';
    // East — bumped to 32x46
    h+='<div class="'+activeClass(EAST).replace(/^\s+/,'')+'" style="padding:4px;"><div style="font-family:Bebas Neue,sans-serif;font-size:0.8rem;color:#dc8a8a;text-align:center;letter-spacing:0.1em;margin-bottom:5px;">EAST'+dealerBadge(EAST)+_bidTag(EAST)+sittingOutBadge(EAST)+'</div><div style="display:inline-flex;flex-direction:column;align-items:center;">';
    for(var e=0;e<hands[EAST].length;e++)h+='<div style="width:32px;height:46px;border-radius:5px;background:linear-gradient(135deg,#4A7C35,#3a6028);border:1.5px solid #2d4a1e;margin-top:'+(e===0?'0':'-32px')+';"></div>';
    h+='</div></div>';
    h+='</div>';
    // South (player) hand
    h+='<div class="'+activeClass(SOUTH).replace(/^\s+/,'')+'" style="padding:6px;"><div style="font-family:Bebas Neue,sans-serif;font-size:0.85rem;color:#7ab356;text-align:center;letter-spacing:0.1em;margin-bottom:6px;">YOUR HAND'+dealerBadge(SOUTH)+_bidTag(SOUTH)+sittingOutBadge(SOUTH)+'</div>';
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
    var isDiscardPhase=(phase==='discard');
    for(var k=0;k<sortedHand.length;k++){
      var cc=sortedHand[k];var canPlay=false;
      for(var m=0;m<pl2.length;m++)if(pl2[m].rank===cc.rank&&pl2[m].suit===cc.suit){canPlay=true;break;}
      // Left bower flag: a J whose suit matches the SAME-COLOR partner
      // of trump is functionally a trump card and we mark it.
      var isLeftBower=trumpSuit&&cc.rank==='J'&&cc.suit===SAME_COLOR[trumpSuit];
      var isRightBower=trumpSuit&&cc.rank==='J'&&cc.suit===trumpSuit;
      var ccol=cc.suit==='hearts'||cc.suit==='diamonds'?'#c47a7a':'#1a1f17';
      var isPickedUp=(isDiscardPhase&&pickedUp&&cc.rank===pickedUp.rank&&cc.suit===pickedUp.suit);
      var canDiscard=isDiscardPhase;
      var bc=canPlay?'#7AB956':'#C4B998';
      if(canDiscard)bc='#c8a84b';
      if(isPickedUp)bc='#ffdc70';
      if((isLeftBower||isRightBower)&&!canDiscard)bc='#c8a84b';
      var sty='width:50px;height:70px;border-radius:6px;background:#F5F0E1;color:'+ccol+';border:2.5px solid '+bc+';display:inline-flex;flex-direction:column;align-items:center;justify-content:center;font-weight:700;position:relative;';
      if(canPlay||canDiscard)sty+='cursor:pointer;';
      if(canPlay)sty+='box-shadow:0 2px 10px rgba(122,179,86,0.35);';
      if(canDiscard)sty+='box-shadow:0 2px 10px rgba(200,168,75,0.35);';
      if(isPickedUp)sty+='box-shadow:0 0 14px rgba(255,220,112,0.75);';
      if((isLeftBower||isRightBower)&&!canDiscard)sty+='box-shadow:0 0 12px rgba(200,168,75,0.45);';
      var oc='';
      if(canDiscard)oc=' onclick="_BGDC(\''+cc.rank+'\',\''+cc.suit+'\')"';
      else if(canPlay)oc=' onclick="_BGCC(\''+cc.rank+'\',\''+cc.suit+'\')"';
      h+='<div style="'+sty+'"'+oc+'><span style="font-size:0.78rem;position:absolute;top:2px;left:5px;">'+cc.rank+'</span>';
      if(isPickedUp)h+='<span style="font-size:0.42rem;color:#3a2a08;background:#ffdc70;position:absolute;top:-8px;right:-6px;padding:1px 4px;border-radius:3px;font-family:Bebas Neue,sans-serif;letter-spacing:0.06em;box-shadow:0 1px 3px rgba(0,0,0,0.5);">NEW</span>';
      if(isLeftBower)h+='<span style="font-size:0.42rem;color:#c8a84b;position:absolute;top:2px;right:4px;font-family:Bebas Neue,sans-serif;letter-spacing:0.06em;">L</span>';
      if(isRightBower)h+='<span style="font-size:0.42rem;color:#c8a84b;position:absolute;top:2px;right:4px;font-family:Bebas Neue,sans-serif;letter-spacing:0.06em;">R</span>';
      h+='<span style="font-size:1.2rem;">'+_pip(cc.suit)+'</span></div>';
    }
    h+='</div>';
    if(isDiscardPhase){
      h+='<div style="padding:8px 10px;margin-top:8px;text-align:center;background:rgba(200,168,75,0.12);border:1.5px solid rgba(200,168,75,0.4);border-radius:8px;">';
      h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.78rem;color:var(--gold);letter-spacing:0.1em;margin-bottom:3px;">PICK UP AND DISCARD</div>';
      h+='<div style="font-size:0.55rem;color:var(--muted);line-height:1.5;">You picked up <strong style="color:#ffdc70;">'+(pickedUp?pickedUp.rank+' '+_pip(pickedUp.suit):'')+'</strong>. Tap any card in your hand to discard it face-down.</div>';
      h+='</div>';
    }
    h+='</div>';
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
    // One-shot animation flags: clear AFTER paint so the next render (which
    // can fire for any reason — score change, turn advance, new card played)
    // doesn't re-trigger the bid-flash or slide-in on elements that already
    // animated. The CSS animation runs to completion on the already-mounted
    // DOM node; the next render produces a fresh node without the class.
    if(lastPlayed>=0||lastBidSeat>=0){
      bwT(function(){ lastPlayed=-1; lastBidSeat=-1; }, 50);
    }
  }

  // Two-step call flow when human calls: stash the pending call,
  // ask "go alone?", then commit.
  var _pendingCall=null;
  function askGoAlone(commitFn){
    _pendingCall=commitFn;
    // Render replaces the call UI with the alone prompt
    phase='goalone';render();
  }

  window._BGN=function(){bwGen++;var o=document.getElementById('BW-over');if(o)o.remove();teamScore=[0,0];roundNum=0;dealer=EAST;newHand();};
  window._BGCC=function(r,s){onCardClick({rank:r,suit:s});};
  window._BGORD=function(){
    if(phase!=='call1'||currentPlayer!==SOUTH)return;
    askGoAlone(function(alone){
      bidDecisions[SOUTH]={kind:'order',suit:upcard.suit,alone:alone};lastBidSeat=SOUTH;
      orderUp(SOUTH,alone);
    });
  };
  window._BGP1=function(){
    if(phase!=='call1'||currentPlayer!==SOUTH)return;
    bidDecisions[SOUTH]='pass';lastBidSeat=SOUTH;
    sm('You pass');
    currentPlayer=(currentPlayer+1)%4;
    if(currentPlayer===leader){
      phase='call2';currentPlayer=leader;
      bidDecisions=[null,null,null,null];lastBidSeat=-1;
    }
    render();
    if(currentPlayer!==SOUTH)bwT(phase==='call1'?aiCall1:aiCall2,600);
  };
  window._BGP2=function(){
    if(phase!=='call2'||currentPlayer!==SOUTH)return;
    bidDecisions[SOUTH]='pass';lastBidSeat=SOUTH;
    sm('You pass');
    currentPlayer=(currentPlayer+1)%4;render();
    if(currentPlayer!==SOUTH)bwT(aiCall2,600);
  };
  window._BGCT=function(suit){
    if(phase!=='call2'||currentPlayer!==SOUTH)return;
    askGoAlone(function(alone){
      bidDecisions[SOUTH]={kind:'call',suit:suit,alone:alone};lastBidSeat=SOUTH;
      callTrump(SOUTH,suit,alone);
    });
  };
  window._BGalone=function(yes){
    if(phase!=='goalone'||!_pendingCall)return;
    var fn=_pendingCall;_pendingCall=null;
    fn(!!yes);
  };
  window._BGDC=function(r,s){
    if(phase!=='discard'||dealer!==SOUTH)return;
    completeDiscard({rank:r,suit:s});
  };

  _BGN();
};
})();
