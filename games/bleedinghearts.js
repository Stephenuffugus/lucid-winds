// ═══ BLEEDING HEARTS — classic Hearts card game ═══
// 4-player trick-taking, avoid hearts (1pt each) and Queen of Spades (13pts).
// Shoot the moon = take all 26 pts = opponents each get 26. First to 100 loses.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

// Inject Hearts-specific keyframes once (turn ring + Q♠ tension etc.)
if(!document.getElementById('bh-anim-style')){
  var _bhs=document.createElement('style');_bhs.id='bh-anim-style';
  _bhs.textContent=
    '@keyframes bhTurnRing{0%,100%{box-shadow:0 0 0 2px rgba(255,220,112,0.7),0 0 18px rgba(255,220,112,0.4)}50%{box-shadow:0 0 0 3px rgba(255,220,112,0.95),0 0 26px rgba(255,220,112,0.6)}}'+
    '@keyframes bhArrowNudge{0%,100%{transform:translateX(0);opacity:1}50%{transform:translateX(6px);opacity:.6}}'+
    '@keyframes bhBreakFlash{0%{transform:scale(1);box-shadow:0 0 0 0 rgba(230,57,70,0.9)}30%{transform:scale(1.15);box-shadow:0 0 0 12px rgba(230,57,70,0.45),0 0 30px rgba(230,57,70,0.75)}100%{transform:scale(1);box-shadow:0 0 10px rgba(220,138,138,0.25)}}'+
    '@keyframes bhMoonIn{0%{opacity:0}100%{opacity:1}}'+
    '@keyframes bhMoonRise{0%{transform:translateY(60px) scale(0.4);opacity:0}60%{transform:translateY(-8px) scale(1.1);opacity:1}100%{transform:translateY(0) scale(1);opacity:1}}'+
    '@keyframes bhQSFlash{0%{transform:translate(-50%,0) scale(1)}25%{transform:translate(-50%,-4px) scale(1.35);filter:drop-shadow(0 0 14px rgba(230,57,70,0.9))}100%{transform:translate(-50%,0) scale(1.2);filter:drop-shadow(0 0 8px rgba(139,0,0,0.7))}}'+
    '@keyframes bhWinGlow{0%,100%{box-shadow:0 0 0 2px #ffdc70,0 0 16px rgba(255,220,112,0.55)}50%{box-shadow:0 0 0 3px #ffe896,0 0 24px rgba(255,232,150,0.8)}}'+
    '.bh-seat{transition:opacity .3s ease,filter .3s ease;}'+
    '.bh-seat.bh-active{animation:bhTurnRing 1.4s ease-in-out infinite;}'+
    '.bh-seat.bh-inactive{opacity:0.55;}'+
    '.bh-qs-flash{animation:bhQSFlash 0.8s cubic-bezier(.2,1.4,.3,1) forwards;z-index:5;border-color:#8b0000!important;}'+
    '.bh-win-glow{animation:bhWinGlow 0.55s ease-in-out infinite;z-index:4;}'+
    '.bh-void-tag{display:inline-block;padding:0 3px;margin:0 1px;font-size:0.62rem;color:rgba(232,220,200,0.45);text-decoration:line-through;text-decoration-color:#e63946;text-decoration-thickness:1.5px;}';
  document.head.appendChild(_bhs);
}

window._gameFns = window._gameFns || {};
window._gameFns.bleedinghearts = function BH(a){
  var SUITS=['clubs','diamonds','spades','hearts'];
  var SI={clubs:'♣',diamonds:'♦',spades:'♠',hearts:'♥'};
  var RANKS=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  var RV={2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,J:11,Q:12,K:13,A:14};
  var S=0,W=1,N=2,E=3;
  var NAMES=['You','West','North','East'];

  var hands=[[],[],[],[]],scores=[0,0,0,0],roundPts=[0,0,0,0];
  var gen=0; // bumped by _BHN so stale AI/round timers can't touch a fresh game
  var trick=[],trickCards=[null,null,null,null];
  var leader=0,currentPlayer=0,phase='',heartsBroken=false;
  // ── THE DEAL (2026-08-21) ─────────────────────────────────────────────────
  // Hearts used to go from "New Game" to thirteen cards already in your hand,
  // in one frame. The cards were the same cards; it just never looked like a
  // game had started. phase='dealing' holds the table while the deck riffles
  // and the hands fill up a round at a time.
  //
  // ⛔ A ROUND AT A TIME, NOT A CARD AT A TIME. A real dealer goes one player
  // at a time, which here would be 52 steps, and render() rebuilds the whole
  // table's innerHTML on every one of them. Thirteen rebuilds reads exactly as
  // clearly and costs a quarter of the work on a phone.
  var dealt=[0,0,0,0],shuffling=false,dealHandle=null;
  function seatCount(p){return phase==='dealing'?dealt[p]:hands[p].length;}
  function dealtCards(p){return phase==='dealing'?hands[p].slice(0,dealt[p]):hands[p];}
  function isNewlyDealt(p,i){return phase==='dealing'&&i===dealt[p]-1;}
  var passDir=0,passSelection=[],roundNum=0,trickNum=0;
  // Per-seat void tracking. Populated when a seat can't follow lead suit —
  // subsequent tricks use voids[p][suit] to put a struck-through suit glyph
  // under that player. Critical info for card-counting. Reset per hand.
  var voids=[{},{},{},{}];
  // Trick-end drama state. lastWinnerSeat keeps the winning seat glow on
  // during the hold beat. qsInTrick flips true when the Queen of Spades
  // lands in the current trick and lets the UI flash her.
  // (Named lastWinnerSeat to avoid shadowing the trickWinner() function below.)
  var lastWinnerSeat=-1, qsInTrick=false;
  // One-shot flag — hearts-broken moment animation fires only on the render
  // right after the break.
  var heartsJustBroke=false;
  // Last-trick history — the full 4-card stack from the trick that just
  // closed. Tapping the 🕐 button near the player hand opens it in an
  // overlay for review. Cleared at the top of each new hand.
  var lastTrick=null, showingHistory=false;
  // Shoot-the-moon takeover state. Set in scoreRound if someone collected
  // all 26 points; render draws a full-screen dramatic reveal for ~2.5s.
  var moonShot=null; // {seat, color}
  // Per-player identity colors. Hearts is a free-for-all so each seat has its
  // own distinct accent (you=sage, west=sky, north=rose, east=gold).
  var PLAYER_COLORS=['#7ab356','#5b9bd1','#dc8a8a','#d4b86a'];

  // Style-aware pip lookup — Garden swaps ♠♥♦♣ for 🍄🌸🐝🐦
  function _pip(suitName){return (window._cdPipFor)?window._cdPipFor(suitName):SI[suitName];}
  ms(a,'<span style="font-family:Georgia,serif;letter-spacing:.06em;">♥ Round <strong id="BHr" style="color:#dc8a8a;font-size:1.2em;">1</strong></span>');
  mm(a);
  var pan=document.createElement('div');pan.id='BHpan';
  var _BH_FELT="data:image/svg+xml;utf8,"+encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">'
      +'<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="9"/>'
      +'<feColorMatrix values="0 0 0 0 0.05  0 0 0 0 0.06  0 0 0 0 0.04  0 0 0 .08 0"/></filter>'
      +'<rect width="100%" height="100%" filter="url(#n)"/>'
    +'</svg>'
  );
  pan.style.cssText='max-width:min(96vw,760px);margin:0 auto;padding:6px 14px 14px;user-select:none;'
    +'box-sizing:border-box;'
    +'background:'
      +'url("'+_BH_FELT+'"),'
      +'radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.04) 0%,transparent 50%),'
      +'radial-gradient(circle at 50% 100%,rgba(0,0,0,0.3) 0%,transparent 65%),'
      +'linear-gradient(135deg,#3a1020 0%,#2a0a18 55%,#1a0510 100%);'
    +'background-size:180px 180px, auto, auto, auto;'
    +'border-radius:14px;'
    +'border:2px solid #6b4520;'
    +'box-shadow:'
      +'inset 0 0 0 1px rgba(180,140,70,0.25),'
      +'inset 0 0 40px rgba(0,0,0,0.5),'
      +'0 6px 22px rgba(0,0,0,0.6);';
  a.appendChild(pan);
  // mc(a) still runs so downstream code finds the controls container, but
  // we leave it empty — NEW + Style now live inside the pan so the bottom
  // controls row never overlaps the player's hand.
  mc(a);
  window._BHToggleStyle=function(){
    if(typeof window._cdToggleStyle!=='function'){if(window._toast)window._toast('Card styles loading, try again in a sec.');return;}
    var nxt=window._cdToggleStyle();
    var b=document.getElementById('BHstyle');
    if(b)b.textContent='🃏 Style';
    render();
  };

  function makeDeck(){var d=[];for(var s=0;s<4;s++)for(var r=0;r<13;r++)d.push({rank:RANKS[r],suit:SUITS[s]});return d;}
  function shuf(ar){for(var i=ar.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=ar[i];ar[i]=ar[j];ar[j]=t;}return ar;}
  function sortHand(h){var so={clubs:0,diamonds:1,spades:2,hearts:3};h.sort(function(a,b){return so[a.suit]!==so[b.suit]?so[a.suit]-so[b.suit]:RV[a.rank]-RV[b.rank];});}
  function removeCard(hand,card){for(var i=0;i<hand.length;i++){if(hand[i].rank===card.rank&&hand[i].suit===card.suit){hand.splice(i,1);return;}}}

  function getPlayable(hand,leadSuit,isFirst){
    if(!leadSuit){
      if(isFirst){var two=hand.filter(function(c){return c.rank==='2'&&c.suit==='clubs';});if(two.length)return two;}
      if(!heartsBroken){var nh=hand.filter(function(c){return c.suit!=='hearts';});if(nh.length)return nh;}
      return hand.slice();
    }
    var follow=hand.filter(function(c){return c.suit===leadSuit;});
    if(follow.length)return follow;
    if(isFirst){var safe=hand.filter(function(c){return c.suit!=='hearts'&&!(c.rank==='Q'&&c.suit==='spades');});if(safe.length)return safe;}
    return hand.slice();
  }
  function trickWinner(plays){
    var lead=plays[0].card.suit;var best=0,bv=RV[plays[0].card.rank];
    for(var i=1;i<plays.length;i++){if(plays[i].card.suit===lead&&RV[plays[i].card.rank]>bv){bv=RV[plays[i].card.rank];best=i;}}
    return plays[best].player;
  }
  function trickPoints(plays){
    var pts=0;
    for(var i=0;i<plays.length;i++){
      if(plays[i].card.suit==='hearts')pts++;
      if(plays[i].card.rank==='Q'&&plays[i].card.suit==='spades')pts+=13;
    }
    return pts;
  }
  function aiPass(player){
    var hand=hands[player].slice();
    hand.sort(function(a,b){
      var va=0,vb=0;
      if(a.rank==='Q'&&a.suit==='spades')va=100;
      else if(a.suit==='hearts')va=50+RV[a.rank];
      else if(a.suit==='spades')va=30+RV[a.rank];
      else va=RV[a.rank];
      if(b.rank==='Q'&&b.suit==='spades')vb=100;
      else if(b.suit==='hearts')vb=50+RV[b.rank];
      else if(b.suit==='spades')vb=30+RV[b.rank];
      else vb=RV[b.rank];
      return vb-va;
    });
    return[hand[0],hand[1],hand[2]];
  }
  function aiPlay(player,isFirstTrick){
    var hand=hands[player];var leadSuit=trick.length>0?trick[0].card.suit:'';
    var pl=getPlayable(hand,leadSuit,isFirstTrick);
    if(pl.length===1)return pl[0];
    if(!leadSuit){
      var nonH=pl.filter(function(c){return c.suit!=='hearts';});
      var pool=nonH.length?nonH:pl;
      pool.sort(function(a,b){return RV[a.rank]-RV[b.rank];});return pool[0];
    }
    var hasP=trick.some(function(p){return p.card.suit==='hearts'||(p.card.rank==='Q'&&p.card.suit==='spades');});
    if(leadSuit==='hearts'||hasP){pl.sort(function(a,b){return RV[a.rank]-RV[b.rank];});return pl[0];}
    if(!pl.some(function(c){return c.suit===leadSuit;})){
      var qs=pl.filter(function(c){return c.rank==='Q'&&c.suit==='spades';});if(qs.length)return qs[0];
      var hs=pl.filter(function(c){return c.suit==='hearts';});
      if(hs.length){hs.sort(function(a,b){return RV[b.rank]-RV[a.rank];});return hs[0];}
      pl.sort(function(a,b){return RV[b.rank]-RV[a.rank];});return pl[0];
    }
    var cH=0;for(var t=0;t<trick.length;t++)if(trick[t].card.suit===leadSuit&&RV[trick[t].card.rank]>cH)cH=RV[trick[t].card.rank];
    var under=pl.filter(function(c){return c.suit===leadSuit&&RV[c.rank]<cH;});
    if(under.length){under.sort(function(a,b){return RV[b.rank]-RV[a.rank];});return under[0];}
    pl.sort(function(a,b){return RV[a.rank]-RV[b.rank];});return pl[0];
  }
  function deal(){
    var deck=shuf(makeDeck());hands=[[],[],[],[]];
    for(var i=0;i<52;i++)hands[i%4].push(deck[i]);
    for(i=0;i<4;i++)sortHand(hands[i]);
    roundPts=[0,0,0,0];heartsBroken=false;trick=[];trickCards=[null,null,null,null];
    voids=[{},{},{},{}];lastWinnerSeat=-1;qsInTrick=false;heartsJustBroke=false;
    lastTrick=null;showingHistory=false;moonShot=null;
    // Reset per-hand trick counter — without this, every round after the
    // first skipped the 2♣-lead and no-points-on-first-trick rules.
    trickNum=0;
  }
  function newRound(){
    roundNum++;deal();passDir=(roundNum-1)%4;
    var re=document.getElementById('BHr');if(re)re.textContent=roundNum;
    // hold everything behind the deal; afterDeal() picks up where this used to
    dealt=[0,0,0,0];shuffling=true;phase='dealing';render();
    if(dealHandle)dealHandle.cancel();
    var rounds=[];for(var k=0;k<13;k++)rounds.push(k);
    dealHandle=_cdDeal({
      steps:rounds, shuffleMs:850, stepMs:145,
      alive:function(){return phase==='dealing';},
      onShuffleEnd:function(){shuffling=false;render();},
      onStep:function(){ for(var q=0;q<4;q++)dealt[q]++; render(); },
      onDone:afterDeal
    });
  }
  function afterDeal(){
    if(passDir<3){
      phase='passing';passSelection=[];
      for(var p=1;p<4;p++){
        var toPass=aiPass(p);
        var target=passDir===0?(p+1)%4:passDir===1?(p+3)%4:(p+2)%4;
        hands[p]._passTo=target;hands[p]._passing=toPass;
      }
      render();
    }else{phase='play';startTricks();}
  }
  function executePass(){
    var playerTarget=passDir===0?1:passDir===1?3:2;
    var playerPassing=passSelection.slice();
    var passes=[[],[],[],[]];
    for(var i=0;i<playerPassing.length;i++){passes[playerTarget].push(playerPassing[i]);removeCard(hands[S],playerPassing[i]);}
    for(var p=1;p<4;p++){
      var target=hands[p]._passTo;var cards=hands[p]._passing;
      for(i=0;i<cards.length;i++){passes[target].push(cards[i]);removeCard(hands[p],cards[i]);}
      delete hands[p]._passTo;delete hands[p]._passing;
    }
    for(p=0;p<4;p++){for(i=0;i<passes[p].length;i++)hands[p].push(passes[p][i]);sortHand(hands[p]);}
    phase='play';startTricks();
  }
  function startTricks(){
    leader=-1;
    for(var p=0;p<4;p++){for(var i=0;i<hands[p].length;i++){if(hands[p][i].rank==='2'&&hands[p][i].suit==='clubs'){leader=p;break;}}if(leader>=0)break;}
    if(leader<0)leader=0;
    currentPlayer=leader;trick=[];trickCards=[null,null,null,null];
    sm(leader===S?'Lead the 2♣':NAMES[leader]+' leads');
    render();
    var g=gen;
    if(currentPlayer!==S)setTimeout(function(){if(g===gen)doAIPlay(true);},900);
  }
  function playCard(player,card){
    removeCard(hands[player],card);
    // Void detection — did this player fail to follow the lead suit?
    var leadSuit = trick.length>0 ? trick[0].card.suit : '';
    if(leadSuit && card.suit!==leadSuit){
      voids[player][leadSuit]=true;
    }
    trick.push({player:player,card:card});trickCards[player]=card;
    // Track the Q♠ for trick-end flash.
    if(card.rank==='Q'&&card.suit==='spades')qsInTrick=true;
    // Hearts-broken moment — one-shot flag so the badge flashes once.
    if(card.suit==='hearts' && !heartsBroken){
      heartsBroken=true;
      heartsJustBroke=true;
      setTimeout(function(){heartsJustBroke=false;render();},900);
    }
    render();
    if(trick.length===4){
      var winner=trickWinner(trick);var pts=trickPoints(trick);
      roundPts[winner]+=pts;phase='trickDone';
      var g=gen;
      // Beat 1: hold on the trick with winner glow + optional Q♠ flash.
      setTimeout(function(){
        if(g!==gen)return;
        lastWinnerSeat=winner;
        sm((winner===S?'You take':NAMES[winner]+' takes')+(pts>0?' ('+pts+' pts)':''));
        // Earn when an OPPONENT eats points — that's the favorable outcome.
        if(pts>0&&winner!==S)_e('progress');
        render();
        // Beat 2: clear after 1100ms. Longer than before so the drama lands.
        setTimeout(function(){
          if(g!==gen)return;
          // Snapshot the trick so the player can review it via the 🕐 button.
          lastTrick={cards:trick.slice(),winner:winner,pts:pts};
          lastWinnerSeat=-1;qsInTrick=false;
          trick=[];trickCards=[null,null,null,null];trickNum++;
          if(hands[0].length===0){scoreRound();return;}
          leader=winner;currentPlayer=leader;phase='play';render();
          if(currentPlayer!==S)setTimeout(function(){if(g===gen)doAIPlay(false);},750);
        },1100);
      },450);
      return;
    }
    currentPlayer=(currentPlayer+1)%4;render();
    var g2=gen;
    // AI pacing bumped 350→800ms so plays read as deliberate.
    if(currentPlayer!==S)setTimeout(function(){if(g2===gen)doAIPlay(trickNum===0&&trick.length<4);},800);
  }
  function doAIPlay(isFirst){
    if(phase!=='play'||currentPlayer===S)return;
    var card=aiPlay(currentPlayer,isFirst&&trickNum===0);
    playCard(currentPlayer,card);
  }
  function scoreRound(){
    phase='scoring';
    // Detect shoot-the-moon BEFORE applying the flip, so we can drive a
    // full-screen reveal first.
    var moonSeat=-1;
    for(var p=0;p<4;p++){
      if(roundPts[p]===26){moonSeat=p;break;}
    }
    function finalize(){
      if(moonSeat>=0){
        for(var j=0;j<4;j++)if(j!==moonSeat)roundPts[j]=26;
        roundPts[moonSeat]=0;
        sm(NAMES[moonSeat]+' shot the moon!');
        if(moonSeat===S)_e('milestone');
      }
      for(var pp=0;pp<4;pp++)scores[pp]+=roundPts[pp];
      var maxScore=Math.max.apply(null,scores);
      if(maxScore>=100){
        var minScore=Math.min.apply(null,scores);var won=scores[S]===minScore;
        if(won){_e('game_win');_playWin();sm('♥ You win! '+scores[S]+' pts');}
        else{_e('game_loss');_play('lose');sm('You lose. '+scores[S]+' pts');}
        _sr('bleedinghearts',{w:won,s:scores[S],r:roundNum,lo:1});
        var gr=gen;
        setTimeout(function(){if(gr!==gen)return;scores=[0,0,0,0];roundNum=0;trickNum=0;newRound();},3000);
        return;
      }
      var gn=gen;
      setTimeout(function(){if(gn===gen)newRound();},2000);
    }
    if(moonSeat>=0){
      // Full-screen moon takeover — 2.6s of drama before the score posts.
      moonShot={seat:moonSeat,color:PLAYER_COLORS[moonSeat]};
      render();
      if(moonSeat===S)_e('progress');
      var gm=gen;
      setTimeout(function(){
        if(gm!==gen)return;
        moonShot=null;
        finalize();
      },2600);
    }else{
      finalize();
    }
  }
  function onCardClick(card){
    if(phase==='passing'){togglePassSel(card);return;}
    if(phase!=='play'||currentPlayer!==S)return;
    var leadSuit=trick.length>0?trick[0].card.suit:'';
    var pl=getPlayable(hands[S],leadSuit,trickNum===0);
    var ok=pl.some(function(c){return c.rank===card.rank&&c.suit===card.suit;});
    if(!ok){sm('Can\'t play that card');return;}
    playCard(S,card);
  }
  function togglePassSel(card){
    var idx=-1;
    for(var i=0;i<passSelection.length;i++)if(passSelection[i].rank===card.rank&&passSelection[i].suit===card.suit){idx=i;break;}
    if(idx>=0)passSelection.splice(idx,1);
    else if(passSelection.length<3)passSelection.push(card);
    render();
  }
  function confirmPass(){if(passSelection.length!==3)return;executePass();}

  // Helper — true if any player has picked up points this hand (hides the —
  // placeholder on everyone once the first trick scores).
  function trumpRoundPts(p){return roundPts[p]>0;}
  // Seat class — pulsing turn ring on active, dim on inactive during live phases.
  function _seatCls(seat){
    var isActive=(seat===currentPlayer&&(phase==='play'||phase==='passing'));
    if(isActive)return 'bh-seat bh-active';
    // ⛔ never dim the player's own hand: bh-inactive is 55% opacity, which is
    // the right cue for the three seats that are only card backs and the wrong
    // one for the cards you are reading the whole time. Same call as euchre.
    if(seat!==S&&(phase==='play'||phase==='passing'))return 'bh-seat bh-inactive';
    return 'bh-seat';
  }
  // Void tags for a seat — struck-through suit glyphs under the seat label.
  // The player can see their own hand so we skip south.
  function _voidTags(seat){
    if(seat===S)return '';
    var v=voids[seat];
    var tags='';
    if(v.clubs)tags+='<span class="bh-void-tag">♣</span>';
    if(v.diamonds)tags+='<span class="bh-void-tag" style="color:rgba(180,42,42,0.5);">♦</span>';
    if(v.spades)tags+='<span class="bh-void-tag">♠</span>';
    if(v.hearts)tags+='<span class="bh-void-tag" style="color:rgba(180,42,42,0.5);">♥</span>';
    if(!tags)return '';
    return '<div style="display:inline-flex;align-items:center;gap:1px;margin-left:6px;line-height:1;vertical-align:middle;">'+tags+'</div>';
  }

  function _cardHtml(c,faceDown,isPlayer,extraClass){
    // the real back, shared with every other card game (games/_cards.js)
    if(faceDown){return '<div style="'+_cdBackStyle(28,40,4)+'display:inline-block;"></div>';}
    var col=c.suit==='hearts'||c.suit==='diamonds'?'#c47a7a':'#1a1f17';
    var bc=extraClass==='sel'?'var(--gold)':extraClass==='play'?'#7AB956':'#C4B998';
    return '<div style="display:inline-flex;flex-direction:column;align-items:center;justify-content:center;width:42px;height:58px;border-radius:6px;background:#F5F0E1;border:2px solid '+bc+';color:'+col+';font-weight:700;position:relative;'+(extraClass==='play'?'cursor:pointer;':'')+(extraClass==='sel'?'transform:translateY(-6px);box-shadow:0 4px 12px rgba(200,168,75,0.4);cursor:pointer;':'')+'"><div style="font-size:0.75rem;position:absolute;top:2px;left:4px;">'+c.rank+'</div><div style="font-size:1.2rem;">'+_pip(c.suit)+'</div></div>';
  }

  function render(){
    var h='';
    // ── CONTROLS BAR — floats above the score strip, small + unobtrusive ──
    var styleName = (window._cdStyleLabel && typeof window._cdStyle==='function') ? window._cdStyleLabel(window._cdStyle()) : 'Floral';
    h+='<div style="display:flex;justify-content:flex-end;align-items:center;gap:6px;margin-bottom:6px;">';
    h+='<button class="gb" onclick="_BHToggleStyle()" title="Cycle card style" style="display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:8px 14px;font-size:0.62rem;background:linear-gradient(180deg,rgba(180,140,70,0.25),rgba(120,90,40,0.35));border:1px solid rgba(220,180,120,0.45);color:#f5ebd0;font-family:Georgia,serif;font-style:italic;box-shadow:inset 0 1px 0 rgba(255,255,255,0.12),0 2px 5px rgba(0,0,0,0.5);">';
    h+='<img src="assets/decks/floral/suit-heart.png" alt="" onerror="this.style.display=\'none\';" style="width:18px;height:18px;object-fit:contain;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.7));">';
    h+='<span style="color:rgba(232,220,200,0.6);font-style:normal;font-family:DM Mono,monospace;font-size:0.5rem;letter-spacing:0.12em;text-transform:uppercase;margin-right:2px;">Deck</span>';
    h+='<span>'+styleName+'</span>';
    h+='</button>';
    h+='<button class="gb" onclick="_BHN()" title="New game" style="display:inline-flex;align-items:center;gap:5px;min-height:44px;padding:8px 14px;font-size:0.65rem;background:linear-gradient(180deg,rgba(122,179,86,0.3),rgba(74,124,53,0.4));border:1px solid rgba(122,179,86,0.55);color:#f5ebd0;font-family:Georgia,serif;box-shadow:inset 0 1px 0 rgba(255,255,255,0.12),0 2px 5px rgba(0,0,0,0.5);">↻ New Game</button>';
    h+='</div>';
    // ── SCORE STRIP — 4 columns, each with player's identity color ──
    // Lowest running score is 'winning' (Hearts is a lose-to-highest game).
    // Players at 90+ get a red warning pulse — they're about to lose.
    var minScore = Math.min.apply(null, scores);
    h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;padding:6px;background:linear-gradient(180deg,rgba(0,0,0,0.45),rgba(0,0,0,0.6));border:1.5px solid rgba(180,140,70,0.3);border-radius:10px;margin-bottom:8px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05),0 2px 8px rgba(0,0,0,0.5);">';
    for(var p=0;p<4;p++){
      var you=p===S;
      var isCur=(p===currentPlayer&&(phase==='play'||phase==='passing'));
      var color=PLAYER_COLORS[p];
      var winning = scores[p]===minScore && roundNum>1;
      var danger = scores[p]>=90;
      var borderStyle = isCur ? '2px solid #ffdc70'
                      : danger ? '2px solid #e63946'
                      : '2px solid '+color;
      var boxShadow = isCur ? '0 0 10px rgba(255,220,112,0.35)'
                    : danger ? '0 0 10px rgba(230,57,70,0.5)'
                    : '0 0 6px '+color+'33';
      h+='<div style="text-align:center;padding:5px 3px;background:rgba(0,0,0,0.35);border-radius:6px;border:'+borderStyle+';box-shadow:'+boxShadow+';'+(danger?'animation:bhDanger 1.4s ease-in-out infinite;':'')+'">';
      h+='<div style="font-family:DM Mono,monospace;font-size:0.5rem;letter-spacing:0.12em;color:'+color+';text-transform:uppercase;line-height:1;">'+NAMES[p]+(you?' ·':'')+(winning?' <span style="color:#ffdc70;">♔</span>':'')+'</div>';
      h+='<div style="font-family:Georgia,serif;font-size:1.45rem;font-weight:700;color:#f5ebd0;line-height:1;margin-top:2px;text-shadow:0 2px 3px rgba(0,0,0,0.5);">'+scores[p]+'</div>';
      if(trumpRoundPts(p)){
        h+='<div style="font-family:Georgia,serif;font-style:italic;font-size:0.58rem;color:#dc8a8a;margin-top:2px;line-height:1;">+'+roundPts[p]+'</div>';
      }else{
        h+='<div style="font-family:DM Mono,monospace;font-size:0.5rem;color:rgba(232,220,200,0.35);margin-top:2px;line-height:1;">, </div>';
      }
      h+='</div>';
    }
    h+='</div>';
    // Persistent hearts-broken badge — styled, not just a coloured bar
    h+='<div style="text-align:center;padding:3px 0 8px;">';
    if(heartsBroken){
      var brokenAnim = heartsJustBroke ? 'animation:bhBreakFlash 0.9s ease-out;' : '';
      h+='<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:linear-gradient(180deg,rgba(180,42,42,0.3),rgba(100,20,20,0.4));border:1px solid #dc8a8a;border-radius:999px;font-family:Georgia,serif;font-size:0.68rem;color:#f5d0d0;letter-spacing:0.05em;box-shadow:0 0 10px rgba(220,138,138,0.25);'+brokenAnim+'">';
      h+='<span style="color:#e63946;font-size:0.95rem;line-height:1;">♥</span>Hearts broken</span>';
    }else{
      h+='<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:rgba(0,0,0,0.3);border:1px dashed rgba(232,220,200,0.25);border-radius:999px;font-family:Georgia,serif;font-style:italic;font-size:0.62rem;color:rgba(232,220,200,0.55);letter-spacing:0.05em;">';
      h+='<span style="opacity:0.5;font-size:0.85rem;line-height:1;">♥</span>Hearts unbroken</span>';
    }
    h+='</div>';
    // North — face-down cards with horizontal overlap for compactness
    h+='<div class="'+_seatCls(N)+'" style="text-align:center;padding:6px;border-radius:10px;"><div style="font-family:DM Mono,monospace;font-size:0.6rem;color:'+PLAYER_COLORS[N]+';letter-spacing:0.14em;margin-bottom:5px;text-transform:uppercase;font-weight:700;">NORTH <span style="color:rgba(232,220,200,0.5);font-size:0.52rem;margin-left:4px;">×'+seatCount(N)+'</span>'+_voidTags(N)+'</div><div style="display:inline-flex;justify-content:center;">';
    // Tight overlap — 13 backs fanning horizontally shouldn't eat the whole row.
    for(var n=0;n<seatCount(N);n++)h+='<span class="'+(isNewlyDealt(N,n)?'cd-deal-in':'')+'" style="display:inline-block;margin-left:'+(n===0?'0':'-22px')+';">'+_cardHtml(null,true)+'</span>';
    h+='</div></div>';
    // West | Trick | East — vertical-overlap for side hands
    h+='<div style="display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:6px 4px;min-height:160px;">';
    h+='<div class="'+_seatCls(W)+'" style="padding:4px;border-radius:10px;"><div style="font-family:DM Mono,monospace;font-size:0.6rem;color:'+PLAYER_COLORS[W]+';text-align:center;letter-spacing:0.14em;margin-bottom:5px;text-transform:uppercase;font-weight:700;">WEST <span style="color:rgba(232,220,200,0.5);font-size:0.52rem;margin-left:2px;">×'+seatCount(W)+'</span>'+_voidTags(W)+'</div><div style="display:inline-flex;flex-direction:column;align-items:center;">';
    // Aggressive overlap — 13 card backs show as a slim stack, not a tower.
    for(var w=0;w<seatCount(W);w++)h+='<span class="'+(isNewlyDealt(W,w)?'cd-deal-in':'')+'" style="display:block;margin-top:'+(w===0?'0':'-34px')+';">'+_cardHtml(null,true)+'</span>';
    h+='</div></div>';
    // Trick
    h+='<div style="position:relative;min-height:160px;background:rgba(26,31,23,0.3);border-radius:8px;">';
    if(phase==='dealing'){
      var left=52-(dealt[0]+dealt[1]+dealt[2]+dealt[3]);
      h+='<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">'
        +_cdDeckHtml(left,48,68,{shuffling:shuffling,label:shuffling?'shuffling\u2026':'dealing\u2026'})+'</div>';
    }
    var pos={};pos[S]='bottom:8px;left:50%;transform:translateX(-50%);';pos[W]='left:8px;top:50%;transform:translateY(-50%);';pos[N]='top:8px;left:50%;transform:translateX(-50%);';pos[E]='right:8px;top:50%;transform:translateY(-50%);';
    for(var pl=0;pl<4;pl++){
      var c=trickCards[pl];if(!c)continue;
      var col=c.suit==='hearts'||c.suit==='diamonds'?'#b42a2a':'#1a1a1a';
      var isQS=(c.rank==='Q'&&c.suit==='spades');
      var isWin=(pl===lastWinnerSeat);
      var extraCls='';
      if(isQS)extraCls+=' bh-qs-flash';
      if(isWin)extraCls+=' bh-win-glow';
      var dim=(lastWinnerSeat>=0 && pl!==lastWinnerSeat)?'filter:saturate(.55) brightness(.75);':'';
      var seatColor = PLAYER_COLORS[pl];
      h+='<div class="'+extraCls+'" style="position:absolute;'+pos[pl]+dim+'background:linear-gradient(180deg,#faf3dd,#f0e7c8);color:'+col+';border:2px solid '+seatColor+';border-radius:6px;padding:6px 9px;font-weight:700;min-width:40px;text-align:center;font-family:Georgia,serif;box-shadow:inset 0 1px 0 rgba(255,255,255,0.5),0 3px 6px rgba(0,0,0,0.55);">';
      h+='<div style="font-size:0.9rem;">'+c.rank+'</div><div style="font-size:1.2rem;line-height:1;">'+_pip(c.suit)+'</div></div>';
    }
    h+='</div>';
    h+='<div class="'+_seatCls(E)+'" style="padding:4px;border-radius:10px;"><div style="font-family:DM Mono,monospace;font-size:0.6rem;color:'+PLAYER_COLORS[E]+';text-align:center;letter-spacing:0.14em;margin-bottom:5px;text-transform:uppercase;font-weight:700;">EAST <span style="color:rgba(232,220,200,0.5);font-size:0.52rem;margin-left:2px;">×'+seatCount(E)+'</span>'+_voidTags(E)+'</div><div style="display:inline-flex;flex-direction:column;align-items:center;">';
    for(var e=0;e<seatCount(E);e++)h+='<span class="'+(isNewlyDealt(E,e)?'cd-deal-in':'')+'" style="display:block;margin-top:'+(e===0?'0':'-34px')+';">'+_cardHtml(null,true)+'</span>';
    h+='</div></div>';
    h+='</div>';
    // Pass UI — dedicated screen with giant directional arrow + 3 ghost
    // slots. When 3 are selected, the slots fill and the PASS button
    // becomes active. Matches the Trickster / Hearts+ convention.
    if(phase==='passing'){
      var dirs=['LEFT','RIGHT','ACROSS'];
      var arrows={LEFT:'◀',RIGHT:'▶',ACROSS:'▲'};
      var dirLabel=dirs[passDir];
      var arrow=arrows[dirLabel];
      var targetName = dirLabel==='LEFT'?NAMES[W] : dirLabel==='RIGHT'?NAMES[E] : NAMES[N];
      var targetColor = dirLabel==='LEFT'?PLAYER_COLORS[W] : dirLabel==='RIGHT'?PLAYER_COLORS[E] : PLAYER_COLORS[N];
      h+='<div style="text-align:center;padding:12px 10px;background:radial-gradient(ellipse at 50% 50%,rgba(255,220,112,0.08) 0%,rgba(0,0,0,0.5) 70%);border:1.5px solid rgba(180,140,70,0.35);border-radius:12px;margin:6px 0;box-shadow:inset 0 0 18px rgba(0,0,0,0.4);">';
      h+='<div style="font-family:DM Mono,monospace;font-size:0.52rem;letter-spacing:0.22em;color:rgba(232,220,200,0.6);text-transform:uppercase;margin-bottom:4px;">Pass 3 cards</div>';
      h+='<div style="display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:10px;">';
      h+='<span style="font-size:2rem;line-height:1;color:#ffdc70;text-shadow:0 0 12px rgba(255,220,112,0.5);animation:bhArrowNudge 1.6s ease-in-out infinite;">'+arrow+'</span>';
      h+='<div style="font-family:Georgia,serif;">';
      h+='<div style="font-size:1.2rem;font-weight:700;color:#f5ebd0;letter-spacing:0.06em;">'+dirLabel+'</div>';
      h+='<div style="font-size:0.65rem;font-style:italic;color:'+targetColor+';margin-top:1px;">to '+targetName+'</div>';
      h+='</div>';
      h+='<span style="font-size:2rem;line-height:1;color:#ffdc70;text-shadow:0 0 12px rgba(255,220,112,0.5);animation:bhArrowNudge 1.6s ease-in-out infinite;">'+arrow+'</span>';
      h+='</div>';
      // Ghost slots — fill as cards are selected
      h+='<div style="display:flex;justify-content:center;gap:8px;margin-bottom:10px;">';
      for(var ps=0;ps<3;ps++){
        var card=passSelection[ps];
        if(card){
          var cCol=card.suit==='hearts'||card.suit==='diamonds'?'#b42a2a':'#1a1a1a';
          h+='<div style="width:36px;height:52px;border-radius:5px;background:linear-gradient(180deg,#faf3dd,#f0e7c8);border:2px solid #ffdc70;color:'+cCol+';font-family:Georgia,serif;font-weight:700;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(255,220,112,0.4);font-size:0.7rem;">';
          h+=card.rank+'<span style="font-size:0.9rem;">'+_pip(card.suit)+'</span></div>';
        }else{
          h+='<div style="width:36px;height:52px;border-radius:5px;border:2px dashed rgba(232,220,200,0.35);background:rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-style:italic;font-size:0.6rem;color:rgba(232,220,200,0.35);">·</div>';
        }
      }
      h+='</div>';
      var ready=passSelection.length===3;
      h+='<button class="gb" onclick="_BHPASS()" '+(ready?'':'disabled')+' style="min-height:44px;padding:10px 22px;font-family:Georgia,serif;font-size:0.85rem;'+(ready?'background:linear-gradient(180deg,rgba(255,220,112,0.25),rgba(200,168,75,0.3));border:2px solid #ffdc70;color:#f5ebd0;box-shadow:0 0 14px rgba(255,220,112,0.35);':'opacity:0.5;')+'">';
      h+=ready ? 'Pass '+dirLabel.toLowerCase() : 'Tap '+(3-passSelection.length)+' more';
      h+='</button>';
      h+='</div>';
    }
    // Player hand
    h+='<div class="'+_seatCls(S)+'" style="padding:6px;border-radius:10px;"><div style="font-family:DM Mono,monospace;font-size:0.62rem;color:'+PLAYER_COLORS[S]+';text-align:center;letter-spacing:0.14em;margin-bottom:6px;text-transform:uppercase;font-weight:700;">Your Hand</div>';
    h+='<div style="display:flex;gap:3px;justify-content:center;flex-wrap:wrap;">';
    var leadS=trick.length>0?trick[0].card.suit:'';
    var playable=[];
    if(phase==='play'&&currentPlayer===S)playable=getPlayable(hands[S],leadS,trickNum===0);
    else if(phase==='passing')playable=hands[S].slice();
    var myCards=dealtCards(S);
    for(var i=0;i<myCards.length;i++){
      var cc=myCards[i];
      var canP=playable.some(function(p){return p.rank===cc.rank&&p.suit===cc.suit;});
      var isSel=passSelection.some(function(p){return p.rank===cc.rank&&p.suit===cc.suit;});
      var isQS=(cc.rank==='Q'&&cc.suit==='spades');
      var isHeart=(cc.suit==='hearts');
      var col=cc.suit==='hearts'||cc.suit==='diamonds'?'#b42a2a':'#1a1a1a';
      var bc=isSel?'#ffdc70':canP?'#7ab356':'#c4b998';
      if(isQS&&!isSel)bc='#8b0000';
      var sty='display:inline-flex;flex-direction:column;align-items:center;justify-content:center;width:42px;height:60px;border-radius:6px;background:linear-gradient(180deg,#faf3dd,#f0e7c8);border:2px solid '+bc+';color:'+col+';font-weight:700;position:relative;font-family:Georgia,serif;transition:transform .15s ease;box-shadow:inset 0 1px 0 rgba(255,255,255,0.5),0 2px 5px rgba(0,0,0,0.4);';
      if(canP||phase==='passing')sty+='cursor:pointer;';
      if(isSel)sty+='transform:translateY(-10px);box-shadow:0 0 0 2px #ffdc70,0 8px 16px rgba(255,220,112,0.4);';
      if(!canP&&phase==='play')sty+='opacity:0.45;filter:saturate(0.6);';
      // Q♠ aura — the signature poison card always reminds you it's in your hand.
      if(isQS&&!isSel)sty+='box-shadow:0 0 0 1px rgba(139,0,0,0.4),0 0 10px rgba(139,0,0,0.35),0 2px 5px rgba(0,0,0,0.5);';
      h+='<div style="'+sty+'" onclick="_BHCC(\''+cc.rank+'\',\''+cc.suit+'\')">';
      h+='<span style="font-size:0.78rem;position:absolute;top:2px;left:5px;line-height:1;">'+cc.rank+'</span>';
      h+='<span style="font-size:0.58rem;position:absolute;top:14px;left:6px;line-height:1;">'+_pip(cc.suit)+'</span>';
      h+='<span style="font-size:1.4rem;line-height:1;">'+_pip(cc.suit)+'</span>';
      h+='<span style="font-size:0.78rem;position:absolute;bottom:2px;right:5px;line-height:1;transform:rotate(180deg);">'+cc.rank+'</span>';
      h+='</div>';
    }
    h+='</div></div>';
    // History button — small 🕐 pinned at the bottom-right of the pan so the
    // player can review the previous trick. Disabled until there is one.
    if(lastTrick){
      h+='<div style="text-align:right;padding:0 4px 4px;"><button class="gb" onclick="_BHhist()" style="min-height:44px;padding:8px 12px;font-size:0.6rem;background:rgba(0,0,0,0.4);border:1px solid rgba(232,220,200,0.25);color:rgba(232,220,200,0.75);font-family:Georgia,serif;font-style:italic;">🕐 Last trick</button></div>';
    }
    // Last-trick overlay — a translucent scrim with all four cards laid out.
    if(showingHistory && lastTrick){
      h+='<div onclick="_BHhistClose()" style="position:fixed;inset:0;background:rgba(0,0,0,0.82);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;cursor:pointer;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);">';
      h+='<div style="font-family:DM Mono,monospace;font-size:0.6rem;letter-spacing:0.2em;color:rgba(232,220,200,0.65);text-transform:uppercase;margin-bottom:12px;">Previous trick</div>';
      h+='<div style="display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;max-width:90vw;">';
      for(var ht=0;ht<lastTrick.cards.length;ht++){
        var ltc=lastTrick.cards[ht];
        var ltRed=(ltc.card.suit==='hearts'||ltc.card.suit==='diamonds');
        var ltCol=ltRed?'#b42a2a':'#1a1a1a';
        var ltSeatCol=PLAYER_COLORS[ltc.player];
        var ltWin=(ltc.player===lastTrick.winner);
        h+='<div style="text-align:center;">';
        h+='<div style="font-family:DM Mono,monospace;font-size:0.55rem;letter-spacing:0.14em;color:'+ltSeatCol+';text-transform:uppercase;margin-bottom:4px;font-weight:700;">'+NAMES[ltc.player]+(ltWin?' <span style="color:#ffdc70;">✦</span>':'')+'</div>';
        h+='<div style="width:60px;height:84px;border-radius:8px;background:linear-gradient(180deg,#faf3dd,#f0e7c8);border:2px solid '+(ltWin?'#ffdc70':ltSeatCol)+';color:'+ltCol+';display:inline-flex;flex-direction:column;align-items:center;justify-content:center;font-family:Georgia,serif;font-weight:700;font-size:0.9rem;box-shadow:'+(ltWin?'0 0 18px rgba(255,220,112,0.5),':'')+'0 3px 8px rgba(0,0,0,0.6);">';
        h+='<span>'+ltc.card.rank+'</span><span style="font-size:1.6rem;line-height:1;">'+_pip(ltc.card.suit)+'</span>';
        h+='</div></div>';
      }
      h+='</div>';
      h+='<div style="font-family:Georgia,serif;font-style:italic;font-size:0.85rem;color:#f5ebd0;margin-top:16px;">'+NAMES[lastTrick.winner]+' won'+(lastTrick.pts>0?' · +'+lastTrick.pts+' pts':'')+'</div>';
      h+='<div style="font-family:DM Mono,monospace;font-size:0.5rem;letter-spacing:0.15em;color:rgba(232,220,200,0.4);margin-top:20px;">Tap anywhere to close</div>';
      h+='</div>';
    }
    // Shoot-the-moon full-screen takeover. 2.6s of drama per scoreRound.
    if(moonShot){
      var mColor=moonShot.color, mName=NAMES[moonShot.seat];
      var mIsYou = moonShot.seat===S;
      h+='<div style="position:fixed;inset:0;background:radial-gradient(ellipse at 50% 40%,rgba(60,40,100,0.5) 0%,rgba(10,5,20,0.95) 70%);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;animation:bhMoonIn 0.6s ease-out;">';
      h+='<div style="font-size:5rem;line-height:1;margin-bottom:16px;animation:bhMoonRise 1.2s cubic-bezier(.2,1.3,.3,1);filter:drop-shadow(0 0 32px rgba(255,230,160,0.7));">🌕</div>';
      h+='<div style="font-family:DM Mono,monospace;font-size:0.62rem;letter-spacing:0.28em;color:rgba(232,220,200,0.55);text-transform:uppercase;margin-bottom:10px;">'+(mIsYou?'You':'They')+'</div>';
      h+='<div style="font-family:Georgia,serif;font-size:2rem;font-weight:700;color:'+mColor+';letter-spacing:0.04em;text-shadow:0 0 24px '+mColor+'aa;text-align:center;">'+(mIsYou?'SHOT THE MOON':mName.toUpperCase()+' SHOT THE MOON')+'</div>';
      h+='<div style="font-family:Georgia,serif;font-style:italic;font-size:0.85rem;color:'+(mIsYou?'#7ab356':'#dc8a8a')+';margin-top:12px;">'+(mIsYou?'+26 to everyone else':'+26 to you')+'</div>';
      h+='</div>';
    }
    pan.innerHTML=h;
  }

  window._BHhist=function(){showingHistory=true;render();};
  window._BHhistClose=function(){showingHistory=false;render();};
  window._BHN=function(){
    // Reset full state. Was missing phase/passSelection — pressing NEW
    // mid-pass left stale selections that bled into the new round.
    gen++;
    scores=[0,0,0,0];roundNum=0;trickNum=0;
    phase='';passSelection=[];trick=[];trickCards=[null,null,null,null];
    heartsBroken=false;currentPlayer=0;
    newRound();
  };
  window._BHCC=function(r,s){onCardClick({rank:r,suit:s});};
  window._BHPASS=function(){confirmPass();};

  _BHN();
};
})();
