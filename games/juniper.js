// ═══ JUNIPER — Gin Rummy ═══
// Draw/discard to form melds (sets of 3+ same rank, runs of 3+ same suit).
// Knock at ≤10 deadwood. Gin at 0. First to 100 wins.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

// Inject Juniper keyframes once.
if(!document.getElementById('ju-anim-style')){
  var _jus=document.createElement('style');_jus.id='ju-anim-style';
  _jus.textContent=
    '@keyframes juKnockPulse{0%,100%{box-shadow:0 0 14px rgba(255,220,112,0.45),inset 0 1px 0 rgba(255,255,255,0.15)}50%{box-shadow:0 0 22px rgba(255,220,112,0.75),inset 0 1px 0 rgba(255,255,255,0.2)}}'+
    '@keyframes juGinPulse{0%,100%{box-shadow:0 0 22px rgba(255,220,112,0.7),inset 0 1px 0 rgba(255,255,255,0.5);transform:scale(1)}50%{box-shadow:0 0 36px rgba(255,232,150,1),inset 0 1px 0 rgba(255,255,255,0.5);transform:scale(1.06)}}'+
    '@keyframes juThink{0%,100%{opacity:0.4}50%{opacity:1}}'+
    '@keyframes juWinIn{0%{opacity:0}100%{opacity:1}}'+
    '@keyframes juWinPop{0%{transform:translateY(40px) scale(0.5);opacity:0}55%{transform:translateY(-6px) scale(1.15);opacity:1}100%{transform:translateY(0) scale(1);opacity:1}}'+
    '@keyframes juLineIn{0%{transform:translateX(-12px);opacity:0}100%{transform:translateX(0);opacity:1}}';
  document.head.appendChild(_jus);
}

window._gameFns = window._gameFns || {};
window._gameFns.juniper = function Juniper(a){
  var SUITS=['clubs','diamonds','hearts','spades'];
  var SI={clubs:'♣',diamonds:'♦',hearts:'♥',spades:'♠'};
  var RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  var RV={A:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,J:10,Q:10,K:10};
  var RORD={A:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,J:11,Q:12,K:13};

  var playerHand=[],aiHand=[];
  var stock=[],discardPile=[];
  var playerScore=0,aiScore=0,playerWins=0,aiWins=0;
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){var o=document.getElementById('JU-over');if(o)o.remove();});
  var phase='',turnCount=0;
  // ── THE DEAL ── Gin is dealt one card at a time, alternating, ten each, and
  // then the top of the stock is turned to start the discard pile. That last
  // turn is the moment the hand becomes playable, so it gets its own beat and
  // a flip rather than just appearing. Twenty steps is fine here because this
  // table is much smaller than the four seat games; see games/_cards.js.
  var dealtP=0,dealtA=0,shuffling=false,dealHandle=null,dealFlip=false;
  function pCount(){return phase==='dealing'?dealtP:playerHand.length;}
  function aCount(){return phase==='dealing'?dealtA:aiHand.length;}
  // Generation token: bumped by New Game so stale AI/overlay timers from the
  // previous hand can't mutate a fresh deal.
  var gen=0;
  // Gin rule: you may not discard the card you just took from the discard pile.
  var lastDrawnFromDiscard=null;
  // AI feedback state — shown in render so the player sees the AI deciding.
  var aiThinking=false, aiHoverDiscard=false;
  // GIN/knock takeover overlay state. {kind:'gin'|'knock'|'undercut', winner, pts, lines:[]}
  // lines is a sequence of {label, value, color?} that staged-reveal one at a
  // time so scoring narration feels like a tabletop count-up.
  var winOverlay=null, winLineIdx=0;

  ms(a,'<span style="font-family:Georgia,serif;letter-spacing:.06em;">🫐 <strong id="JUy" style="color:#7ab356;font-size:1.2em;">0</strong> <span style="color:rgba(232,220,200,0.5);font-size:0.8em;">vs</span> <strong id="JUa" style="color:#dc8a8a;font-size:1.2em;">0</strong></span>');
  mm(a);
  var pan=document.createElement('div');pan.id='JUpan';
  // Felt — deep berry/juniper tones for the gin rummy table.
  var _JU_FELT="data:image/svg+xml;utf8,"+encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">'
      +'<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="13"/>'
      +'<feColorMatrix values="0 0 0 0 0.05  0 0 0 0 0.04  0 0 0 0 0.08  0 0 0 .08 0"/></filter>'
      +'<rect width="100%" height="100%" filter="url(#n)"/>'
    +'</svg>'
  );
  pan.style.cssText='max-width:min(96vw,560px);margin:0 auto;padding:6px 14px 14px;user-select:none;box-sizing:border-box;'
    +'background:'
      +'url("'+_JU_FELT+'"),'
      +'radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.05) 0%,transparent 50%),'
      +'radial-gradient(circle at 50% 100%,rgba(0,0,0,0.3) 0%,transparent 65%),'
      +'linear-gradient(135deg,#2a1f48 0%,#1f1838 55%,#15102a 100%);'
    +'background-size:180px 180px, auto, auto, auto;'
    +'border-radius:14px;'
    +'border:2px solid #6b4520;'
    +'box-shadow:'
      +'inset 0 0 0 1px rgba(180,140,70,0.25),'
      +'inset 0 0 40px rgba(0,0,0,0.5),'
      +'0 6px 22px rgba(0,0,0,0.6);';
  a.appendChild(pan);
  function _pip(suitName){return (window._cdPipFor)?window._cdPipFor(suitName):SI[suitName];}
  // mc(a) empty — controls render inside the pan.
  mc(a);
  window._JUToggleStyle=function(){
    if(typeof window._cdToggleStyle!=='function'){if(window._toast)window._toast('Card styles loading, try again in a sec.');return;}
    window._cdToggleStyle();
    if(typeof render==='function')render();
  };

  function makeDeck(){var d=[];for(var s=0;s<4;s++)for(var r=0;r<13;r++)d.push({rank:RANKS[r],suit:SUITS[s]});return d;}
  function shuffle(ar){for(var i=ar.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=ar[i];ar[i]=ar[j];ar[j]=t;}return ar;}
  function sortBySuit(hand){var so={clubs:0,diamonds:1,hearts:2,spades:3};hand.sort(function(a,b){return so[a.suit]!==so[b.suit]?so[a.suit]-so[b.suit]:RORD[a.rank]-RORD[b.rank];});}

  function findAllMelds(hand){
    var melds=[];
    var byRank={};for(var i=0;i<hand.length;i++){var c=hand[i];if(!byRank[c.rank])byRank[c.rank]=[];byRank[c.rank].push(i);}
    for(var rank in byRank){
      var ix=byRank[rank];
      if(ix.length>=3){
        for(var a1=0;a1<ix.length;a1++)for(var b1=a1+1;b1<ix.length;b1++)for(var c1=b1+1;c1<ix.length;c1++)melds.push([ix[a1],ix[b1],ix[c1]]);
        if(ix.length>=4)melds.push(ix.slice());
      }
    }
    var bySuit={};
    for(var k=0;k<hand.length;k++){var cc=hand[k];if(!bySuit[cc.suit])bySuit[cc.suit]=[];bySuit[cc.suit].push({idx:k,ord:RORD[cc.rank]});}
    for(var suit in bySuit){
      var cards=bySuit[suit];cards.sort(function(a,b){return a.ord-b.ord;});
      for(var start=0;start<cards.length;start++){
        var run=[cards[start].idx];var lastOrd=cards[start].ord;
        for(var next=start+1;next<cards.length;next++){
          if(cards[next].ord===lastOrd+1){run.push(cards[next].idx);lastOrd=cards[next].ord;if(run.length>=3)melds.push(run.slice());}
          else break;
        }
      }
    }
    return melds;
  }
  function calcDeadwood(hand,combo){
    var used={};for(var i=0;i<combo.length;i++)for(var j=0;j<combo[i].length;j++)used[combo[i][j]]=true;
    var dw=0;for(var k=0;k<hand.length;k++){if(!used[k])dw+=RV[hand[k].rank];}return dw;
  }
  function bestMeldCombination(hand){
    var all=findAllMelds(hand);
    if(all.length===0)return{melds:[],deadwood:calcDeadwood(hand,[])};
    var bestDW=Infinity,bestCombo=[];
    var limit=0;
    function search(idx,used,combo){
      if(++limit>5000)return;
      var dw=calcDeadwood(hand,combo);
      if(dw<bestDW){bestDW=dw;bestCombo=combo.slice();}
      if(dw===0)return;
      for(var i=idx;i<all.length;i++){
        var meld=all[i];var conflict=false;
        for(var j=0;j<meld.length;j++){if(used[meld[j]]){conflict=true;break;}}
        if(conflict)continue;
        var nu={};for(var kk in used)nu[kk]=true;
        for(j=0;j<meld.length;j++)nu[meld[j]]=true;
        combo.push(meld);search(i+1,nu,combo);combo.pop();
      }
    }
    search(0,{},[]);
    return{melds:bestCombo,deadwood:bestDW};
  }
  function getDeadwood(hand){return bestMeldCombination(hand).deadwood;}
  // Layoff eligibility — can `card` extend `meldCards` (an array of card objs)?
  // Sets: same rank as the meld. Runs: same suit and adjacent rank to either end.
  function _layoffEligible(card, meldCards){
    if(!meldCards || meldCards.length<2) return false;
    var isSet = meldCards[0].rank === meldCards[1].rank;
    if(isSet){
      return card.rank === meldCards[0].rank;
    }
    // Run
    if(card.suit !== meldCards[0].suit) return false;
    var minOrd=Infinity, maxOrd=-Infinity;
    for(var i=0;i<meldCards.length;i++){
      var o = RORD[meldCards[i].rank];
      if(o < minOrd) minOrd = o;
      if(o > maxOrd) maxOrd = o;
    }
    var co = RORD[card.rank];
    return co === minOrd - 1 || co === maxOrd + 1;
  }
  // Auto-lay-off: greedy multiple-pass pruning of defender's deadwood onto
  // the knocker's melds. Returns the final deadwood point total.
  function _autoLayoff(defenderHand, knockerHand, knockerMelds){
    var meldCardLists = knockerMelds.map(function(meldIdxArr){
      return meldIdxArr.map(function(idx){return knockerHand[idx];});
    });
    var defResult = bestMeldCombination(defenderHand);
    var inMeld = {};
    for(var m=0;m<defResult.melds.length;m++)
      for(var j=0;j<defResult.melds[m].length;j++)
        inMeld[defResult.melds[m][j]] = true;
    var deadwoodCards = [];
    for(var i=0;i<defenderHand.length;i++)
      if(!inMeld[i]) deadwoodCards.push(defenderHand[i]);
    var changed = true, laidOffCount = 0;
    while(changed){
      changed = false;
      for(var di=deadwoodCards.length-1;di>=0;di--){
        var card = deadwoodCards[di];
        for(var mi=0;mi<meldCardLists.length;mi++){
          if(_layoffEligible(card, meldCardLists[mi])){
            meldCardLists[mi].push(card);
            deadwoodCards.splice(di,1);
            laidOffCount++;
            changed = true;
            break;
          }
        }
      }
    }
    var newDw = 0;
    for(var k=0;k<deadwoodCards.length;k++) newDw += RV[deadwoodCards[k].rank];
    return {newDeadwood:newDw, laidOff:laidOffCount};
  }
  // Inspect a meld to label it 'set' (same rank) or 'run' (same suit consecutive).
  function _meldKind(hand,meld){
    var ranks={};for(var i=0;i<meld.length;i++)ranks[hand[meld[i]].rank]=true;
    return Object.keys(ranks).length===1 ? 'set' : 'run';
  }
  // Build a per-card index map: returns {meldOf, kindOf, deadwood}.
  function _handMeldMap(hand){
    var r=bestMeldCombination(hand);
    var meldOf={}, kindOf={};
    for(var m=0;m<r.melds.length;m++){
      var k=_meldKind(hand,r.melds[m]);
      for(var j=0;j<r.melds[m].length;j++){meldOf[r.melds[m][j]]=m;kindOf[r.melds[m][j]]=k;}
    }
    return {meldOf:meldOf,kindOf:kindOf,deadwood:r.deadwood,melds:r.melds};
  }

  function aiDecideDraw(){
    if(discardPile.length===0)return 'stock';
    var top=discardPile[discardPile.length-1];
    var test=aiHand.concat([top]);
    var bestDW=Infinity;
    for(var i=0;i<test.length;i++){var t2=test.slice();t2.splice(i,1);var dw=getDeadwood(t2);if(dw<bestDW)bestDW=dw;}
    var cur=getDeadwood(aiHand);
    return bestDW<cur-1?'discard':'stock';
  }
  function aiDecideDiscard(){
    var bestIdx=0,bestDW=Infinity;
    for(var i=0;i<aiHand.length;i++){var t=aiHand.slice();t.splice(i,1);var dw=getDeadwood(t);if(dw<bestDW){bestDW=dw;bestIdx=i;}}
    return bestIdx;
  }
  function aiShouldKnock(){var dw=getDeadwood(aiHand);if(dw===0)return 'gin';if(dw<=10)return 'knock';return 'none';}

  function aiTurn(){
    phase='aiTurn';sm('Juniper is thinking…');
    aiThinking=true;render();
    var g=gen;
    // Pre-decide so we can stage a discard-pile hover tell when AI considers it.
    var choice=aiDecideDraw();
    var faking = choice==='stock' && Math.random()<0.3 && discardPile.length>0;
    if(faking){
      aiHoverDiscard=true;render();
      setTimeout(function(){if(g!==gen)return;aiHoverDiscard=false;render();},700);
    }
    // Thinking pause: 1200-2000ms before drawing so the AI feels deliberate.
    var thinkMs = 1200 + Math.floor(Math.random()*800);
    setTimeout(function(){
      if(g!==gen)return;
      aiThinking=false;
      if(choice==='discard'&&discardPile.length>0)aiHand.push(discardPile.pop());
      else{if(stock.length===0){drawRound();return;}aiHand.push(stock.pop());}
      render();
      // Discard pause: 700-1100ms before tossing so the player can read.
      setTimeout(function(){
        if(g!==gen)return;
        var action=aiShouldKnock();
        if(action==='gin'){
          var di=aiDecideDiscard();var dc=aiHand.splice(di,1)[0];discardPile.push(dc);render();
          setTimeout(function(){if(g!==gen)return;endRound('ai','gin');},600);return;
        }
        if(action==='knock'&&turnCount>1){
          var di2=aiDecideDiscard();var dc2=aiHand.splice(di2,1)[0];discardPile.push(dc2);render();
          setTimeout(function(){if(g!==gen)return;endRound('ai','knock');},600);return;
        }
        var di3=aiDecideDiscard();var dc3=aiHand.splice(di3,1)[0];discardPile.push(dc3);
        sm('Your turn, draw a card');phase='draw';turnCount++;
        if(stock.length===0){drawRound();return;}
        render();
      },700+Math.floor(Math.random()*400));
    },thinkMs);
  }

  function deal(){
    var deck=shuffle(makeDeck());
    playerHand=[];aiHand=[];stock=[];discardPile=[];
    for(var i=0;i<10;i++){playerHand.push(deck[i*2]);aiHand.push(deck[i*2+1]);}
    stock=deck.slice(20);discardPile=[stock.pop()];
    sortBySuit(playerHand);turnCount=0;phase='draw';
  }
  function newHand(){
    deal();lastDrawnFromDiscard=null;
    dealtP=0;dealtA=0;dealFlip=false;shuffling=true;phase='dealing';
    sm('Shuffling…');render();
    if(dealHandle)dealHandle.cancel();
    var seq=[];for(var k=0;k<10;k++){seq.push('p');seq.push('a');}
    seq.push('flip');                                   // the turn-up that starts the discard
    dealHandle=_cdDeal({
      steps:seq, shuffleMs:850, stepMs:function(i,st){return st==='flip'?420:95;},
      alive:function(){return phase==='dealing';},
      onShuffleEnd:function(){shuffling=false;sm('Dealing…');render();},
      onStep:function(st){ if(st==='p')dealtP++; else if(st==='a')dealtA++; else dealFlip=true; render(); },
      onDone:function(){ phase='draw'; sm('Your turn, draw a card'); render(); }
    });
  }
  function drawRound(){
    sm('Stock empty, round is a draw');
    var g=gen;
    setTimeout(function(){
      if(g!==gen)return;
      if(playerScore>=100||aiScore>=100)return;
      newHand();
    },1500);
  }
  function endRound(who,type){
    phase='roundOver';
    var knockerHand=who==='player'?playerHand:aiHand;
    var defenderHand=who==='player'?aiHand:playerHand;
    var kr=bestMeldCombination(knockerHand);var dr=bestMeldCombination(defenderHand);
    var kdw=kr.deadwood,ddw=dr.deadwood;
    var laidOff=0, ddwBefore=ddw;
    // Layoff happens on knock only. GIN forbids layoff (rules).
    if(type==='knock'){
      var lo = _autoLayoff(defenderHand, knockerHand, kr.melds);
      ddw = lo.newDeadwood;
      laidOff = lo.laidOff;
    }
    var pts=0,winner='',msg='',kind=type;
    if(type==='gin'){pts=ddw+25;winner=who;msg=(who==='player'?'GIN! +':'Computer gin, +')+pts;}
    else{
      if(ddw<=kdw){pts=(kdw-ddw)+25;winner=who==='player'?'ai':'player';kind='undercut';msg='Undercut, '+(winner==='player'?'You':'Computer')+' +'+pts;}
      else{pts=ddw-kdw;winner=who;msg=(who==='player'?'You':'Computer')+' knock +'+pts;}
    }
    if(winner==='player'){playerScore+=pts;playerWins++;_e('milestone');}
    else{aiScore+=pts;aiWins++;_e('progress');}
    sm(msg);
    // Build staged scoring lines for the overlay narration.
    var lines = [];
    if(type==='gin'){
      lines.push({label:'Defender deadwood', value:ddw, color:'#dc8a8a'});
      lines.push({label:'GIN bonus', value:'+25', color:'#ffdc70'});
      lines.push({label:'TOTAL', value:'+'+pts, color:'#ffdc70', big:true});
    } else if(kind==='undercut'){
      lines.push({label:'Knocker deadwood', value:kdw, color:'#dc8a8a'});
      lines.push({label:'Defender deadwood', value:ddw+(laidOff?' (after '+laidOff+' layoff)':''), color:'#7ab356'});
      lines.push({label:'Difference', value:'+'+(kdw-ddw), color:'#f5ebd0'});
      lines.push({label:'UNDERCUT bonus', value:'+25', color:'#ffdc70'});
      lines.push({label:'TOTAL', value:'+'+pts, color:'#ffdc70', big:true});
    } else { // knock
      lines.push({label:'Your deadwood', value:kdw, color:'#7ab356'});
      lines.push({label:'Defender deadwood', value:ddw+(laidOff?' (after '+laidOff+' layoff)':''), color:'#dc8a8a'});
      lines.push({label:'TOTAL', value:'+'+pts, color:'#ffdc70', big:true});
    }
    winOverlay={kind:kind,winner:winner,pts:pts,kdw:kdw,ddw:ddw,laidOff:laidOff,ddwBefore:ddwBefore,lines:lines};
    winLineIdx=0;
    render();
    // Stage each line in at 750ms intervals for the count-up rhythm.
    var g=gen;
    function revealNext(){
      if(g!==gen||!winOverlay)return;
      winLineIdx++;
      if(winLineIdx<=lines.length){
        _play('tap');
        render();
        setTimeout(revealNext, 750);
      } else {
        // All lines shown — hold 1.6s then advance.
        setTimeout(function(){
          if(g!==gen)return;
          winOverlay=null;
          if(playerScore>=100||aiScore>=100){
            var won=playerScore>=100;
            if(won){_e('game_win');_playWin();sm('🫐 You win! '+playerScore+' vs '+aiScore);}
            else{_e('game_loss');_play('lose');sm('You lose. '+playerScore+' vs '+aiScore);}
            _sr('juniper',{w:won,s:playerScore,r:playerWins+aiWins});
            // Match-end screen (2026-07-03): the result used to auto-wipe after
            // 2.2s. It now stays until the player chooses a new match.
            var mw=0,ml=0;try{mw=parseInt(localStorage.getItem('lw_rummy_w'),10)||0;ml=parseInt(localStorage.getItem('lw_rummy_l'),10)||0;}catch(e){}
            if(won)mw++;else ml++;
            try{localStorage.setItem('lw_rummy_w',String(mw));localStorage.setItem('lw_rummy_l',String(ml));}catch(e){}
            var _o=document.getElementById('JU-over');if(_o)_o.remove();
            var ov=document.createElement('div');ov.id='JU-over';
            ov.style.cssText='position:fixed;inset:0;z-index:9999;background:radial-gradient(ellipse at 50% 40%,'+(won?'rgba(122,179,86,0.3)':'rgba(199,138,80,0.16)')+' 0%,rgba(13,16,12,0.92) 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;font-family:Georgia,serif;';
            ov.innerHTML='<div style="font-size:3rem;line-height:1;">'+(won?'\ud83c\udfc6':'\ud83c\udf42')+'</div>'
              +'<div style="font-size:1.7rem;font-weight:700;color:'+(won?'#7ab356':'#c78a50')+';letter-spacing:0.08em;margin-top:12px;">'+(won?'MATCH WON':'MATCH LOST')+'</div>'
              +'<div style="font-size:1rem;color:#e8dcc8;margin-top:10px;">You <b style="color:#c8a84b">'+playerScore+'</b> \u00b7 Juniper <b style="color:#c8a84b">'+aiScore+'</b> \u00b7 hands '+playerWins+' to '+aiWins+'</div>'
              +'<div style="font-style:italic;font-size:0.8rem;color:#8a9178;margin-top:6px;">lifetime '+mw+'W / '+ml+'L</div>'
              +'<button id="JU-again" style="margin-top:22px;min-height:48px;padding:12px 28px;font-family:Georgia,serif;font-weight:700;font-size:0.9rem;background:linear-gradient(180deg,rgba(122,179,86,0.35),rgba(74,124,53,0.45));border:2px solid #7ab356;color:#f5ebd0;border-radius:10px;cursor:pointer;">\u21bb NEW MATCH</button>'
              +'<button id="JU-view" style="margin-top:10px;min-height:44px;padding:8px 20px;background:transparent;border:1px solid rgba(138,145,120,0.4);color:#8a9178;border-radius:10px;font-size:0.75rem;cursor:pointer;">view the last hand</button>';
            ov.querySelector('#JU-again').onclick=function(){ov.remove();window._JUN();};
            ov.querySelector('#JU-view').onclick=function(){ov.remove();};
            ov.onclick=function(ev){if(ev.target===ov)ov.remove();};
            document.body.appendChild(ov);
            return;
          }
          newHand();
        },1600);
      }
    }
    setTimeout(revealNext, 800);
  }

  function onDrawStock(){
    if(phase!=='draw')return;
    if(stock.length===0){drawRound();return;}
    playerHand.push(stock.pop());phase='discard';lastDrawnFromDiscard=null;
    _play('snap');sm('Tap a card to discard');render();
  }
  function onDrawDiscard(){
    if(phase!=='draw'||discardPile.length===0)return;
    var taken=discardPile.pop();
    playerHand.push(taken);phase='discard';lastDrawnFromDiscard=taken;
    _play('snap');sm('Tap a card to discard');render();
  }
  function onCardClick(idx){
    if(phase!=='discard')return;
    if(lastDrawnFromDiscard&&playerHand[idx]===lastDrawnFromDiscard){sm('Can’t discard the card you just picked up');return;}
    var card=playerHand.splice(idx,1)[0];discardPile.push(card);
    lastDrawnFromDiscard=null;
    _play('snap');
    var dw=getDeadwood(playerHand);
    if(dw===0){endRound('player','gin');return;}
    // Deadwood low enough to knock: pause for the player's call instead of
    // rushing into the AI turn (this is the whole decision of gin rummy).
    if(dw<=10){phase='knockChoice';sm('Deadwood '+dw+', knock or pass?');render();return;}
    continueToAI();
  }
  function continueToAI(){
    phase='aiTurn';turnCount++;
    render();
    if(stock.length===0){drawRound();return;}
    var g=gen;
    setTimeout(function(){if(g===gen)aiTurn();},300);
  }
  function onKnock(){
    if(phase!=='knockChoice')return;
    endRound('player','knock');
  }
  function onPass(){
    if(phase!=='knockChoice')return;
    continueToAI();
  }

  function render(){
    var yscore=document.getElementById('JUy');if(yscore)yscore.textContent=playerScore;
    var ascore=document.getElementById('JUa');if(ascore)ascore.textContent=aiScore;
    var h='';
    // ── CONTROLS BAR ────────────────────────────────────────────
    var juStyleName = (window._cdStyleLabel && typeof window._cdStyle==='function') ? window._cdStyleLabel(window._cdStyle()) : 'Floral';
    h+='<div style="display:flex;justify-content:flex-end;align-items:center;gap:6px;margin-bottom:6px;">';
    h+='<button class="gb" onclick="if(window._cdToggleStyle){window._cdToggleStyle();if(typeof render===\'function\')render();}" title="Cycle card style" style="display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:8px 14px;font-size:0.62rem;background:linear-gradient(180deg,rgba(180,140,70,0.25),rgba(120,90,40,0.35));border:1px solid rgba(220,180,120,0.45);color:#f5ebd0;font-family:Georgia,serif;font-style:italic;box-shadow:inset 0 1px 0 rgba(255,255,255,0.12),0 2px 5px rgba(0,0,0,0.5);">';
    h+='<img src="assets/decks/floral/suit-diamond.png" alt="" onerror="this.style.display=\'none\';" style="width:18px;height:18px;object-fit:contain;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.7));">';
    h+='<span style="color:rgba(232,220,200,0.6);font-style:normal;font-family:DM Mono,monospace;font-size:0.5rem;letter-spacing:0.12em;text-transform:uppercase;margin-right:2px;">Deck</span>';
    h+='<span>'+juStyleName+'</span>';
    h+='</button>';
    h+='<button class="gb" onclick="_JUN()" title="New game" style="display:inline-flex;align-items:center;gap:5px;min-height:44px;padding:8px 14px;font-size:0.65rem;background:linear-gradient(180deg,rgba(122,179,86,0.3),rgba(74,124,53,0.4));border:1px solid rgba(122,179,86,0.55);color:#f5ebd0;font-family:Georgia,serif;box-shadow:inset 0 1px 0 rgba(255,255,255,0.12),0 2px 5px rgba(0,0,0,0.5);">↻ New Game</button>';
    h+='</div>';
    // ── SCORE STRIP — twin player rows w/ wins ──────────────────
    h+='<div style="display:flex;gap:6px;margin-bottom:8px;">';
    h+=_scoreStrip('YOU',playerScore,playerWins,'#7ab356');
    h+=_scoreStrip('JUNIPER',aiScore,aiWins,'#dc8a8a');
    h+='</div>';
    // ── AI HAND (face-down fan) ─────────────────────────────────
    h+='<div style="text-align:center;padding:4px 6px 8px;">';
    var thinkBadge = aiThinking ? ' <span style="margin-left:8px;font-family:Georgia,serif;font-style:italic;font-size:0.62rem;color:#ffdc70;animation:juThink 1.2s ease-in-out infinite;">thinking…</span>' : '';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.55rem;color:#dc8a8a;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;margin-bottom:5px;">JUNIPER <span style="color:rgba(232,220,200,0.5);font-size:0.52rem;">×'+aCount()+'</span>'+thinkBadge+'</div>';
    h+='<div style="display:inline-flex;justify-content:center;">';
    for(var i=0;i<aCount();i++)h+='<div class="'+(phase==='dealing'&&i===dealtA-1?'cd-deal-in':'')+'" style="'+_cdBackCss(28,40,4)+'margin-left:'+(i===0?'0':'-18px')+';"></div>';
    h+='</div></div>';
    // ── STOCK + DISCARD ─────────────────────────────────────────
    var canPickup = phase==='draw';
    h+='<div style="display:flex;align-items:center;justify-content:center;gap:18px;padding:6px 8px 10px;">';
    // Stock
    h+='<div style="text-align:center;">';
    // the stock was a flat gradient with a 🂠 glyph on it; it is the deck, so it
    // shows the deck art, and it riffles while the hand is being dealt
    h+='<div onclick="_JUDS()" class="'+(shuffling?'cd-shuffling':'')+'" style="'+_cdBackCss(72,100,8)
      +'display:flex;align-items:center;justify-content:center;position:relative;'
      +(canPickup?'cursor:pointer;outline:2px solid #ffdc70;outline-offset:-2px;':'cursor:default;opacity:0.85;')+'">';
    h+='<span style="font-family:DM Mono,monospace;font-size:0.55rem;color:#ffdc70;position:absolute;bottom:4px;left:0;right:0;text-shadow:0 1px 3px #000;letter-spacing:0.05em;">'+(phase==='dealing'?(52-dealtP-dealtA):stock.length)+' left</span></div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.5rem;letter-spacing:0.18em;color:rgba(232,220,200,0.6);margin-top:5px;text-transform:uppercase;">Stock</div></div>';
    // Discard
    h+='<div style="text-align:center;">';
    // ⛔ the discard exists in the model from the instant deal() runs, so
    // without this gate the turn-up card was already sitting face up on the
    // table while the hands were still going out. It only appears when it is
    // actually turned, on the last step of the deal.
    if(phase==='dealing'&&!dealFlip){
      h+='<div style="'+_cdBackCss(72,100,8)+'opacity:.35;"></div>';
    } else if(discardPile.length>0){
      var top=discardPile[discardPile.length-1];
      var col=top.suit==='hearts'||top.suit==='diamonds'?'#b42a2a':'#1a1a1a';
      var hoverGlow = aiHoverDiscard ? 'box-shadow:0 0 18px rgba(220,138,138,0.7),inset 0 1px 0 rgba(255,255,255,0.5);transform:translateY(-4px);' : '';
      var flipCls = (phase==='dealing'&&dealFlip)?'cd-flip':'';
      h+='<div onclick="_JUDD()" style="width:72px;height:100px;border-radius:8px;background:linear-gradient(180deg,#faf3dd,#f0e7c8);border:2px solid '+(canPickup?'#ffdc70':aiHoverDiscard?'#dc8a8a':'#c4b998')+';display:flex;flex-direction:column;align-items:center;justify-content:center;'+(canPickup?'cursor:pointer;box-shadow:0 0 14px rgba(255,220,112,0.35),inset 0 1px 0 rgba(255,255,255,0.5);':'cursor:default;box-shadow:inset 0 1px 0 rgba(255,255,255,0.5),0 3px 6px rgba(0,0,0,0.5);')+hoverGlow+'transition:transform .2s,box-shadow .2s;color:'+col+';font-weight:700;font-family:Georgia,serif;position:relative;">';
      h+='<span style="font-size:0.78rem;position:absolute;top:3px;left:5px;line-height:1;">'+top.rank+'</span>';
      h+='<span style="font-size:1.7rem;line-height:1;">'+_pip(top.suit)+'</span>';
      h+='<span style="font-size:0.78rem;position:absolute;bottom:3px;right:5px;line-height:1;transform:rotate(180deg);">'+top.rank+'</span>';
      h+='</div>';
    }else{
      h+='<div style="width:72px;height:100px;border-radius:8px;background:rgba(0,0,0,0.3);border:2px dashed rgba(232,220,200,0.25);display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-style:italic;font-size:0.6rem;color:rgba(232,220,200,0.4);">empty</div>';
    }
    h+='<div style="font-family:DM Mono,monospace;font-size:0.5rem;letter-spacing:0.18em;color:rgba(232,220,200,0.6);margin-top:5px;text-transform:uppercase;">Discard</div></div>';
    h+='</div>';
    // ── DEADWOOD + KNOCK BUTTON ─────────────────────────────────
    var dw = playerHand.length<=11 ? getDeadwood(playerHand) : null;
    var dwIsNum = typeof dw === 'number';
    var dwColor = !dwIsNum ? '#f5ebd0'
                : dw===0 ? '#ffdc70'
                : dw<=3 ? '#7ab356'
                : dw<=10 ? '#ffa040'
                : '#e63946';
    var canKnock = phase==='knockChoice' && dwIsNum && dw<=10;
    var isGin = canKnock && dw===0;
    h+='<div style="display:flex;justify-content:center;align-items:center;gap:10px;padding:4px 8px 8px;flex-wrap:wrap;">';
    h+='<div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;background:rgba(0,0,0,0.4);border:1px solid rgba(180,140,70,0.3);border-radius:999px;font-family:Georgia,serif;">';
    h+='<span style="font-family:DM Mono,monospace;font-size:0.5rem;color:rgba(232,220,200,0.55);letter-spacing:0.14em;text-transform:uppercase;">Deadwood</span>';
    h+='<span style="font-size:1.4rem;font-weight:700;color:'+dwColor+';line-height:1;text-shadow:0 1px 3px rgba(0,0,0,0.5);">'+(dwIsNum?dw:'·')+'</span>';
    h+='</div>';
    if(isGin){
      h+='<button onclick="_JUG()" class="ju-gin-btn" style="min-height:48px;padding:8px 20px;font-family:Georgia,serif;font-weight:700;font-size:0.95rem;background:linear-gradient(180deg,#ffdc70,#c48f1f);border:2px solid #ffdc70;color:#3a2a08;letter-spacing:0.06em;border-radius:8px;text-shadow:0 1px 0 rgba(255,255,255,0.5);box-shadow:0 0 22px rgba(255,220,112,0.7),inset 0 1px 0 rgba(255,255,255,0.5);cursor:pointer;animation:juGinPulse 0.9s ease-in-out infinite;">GIN!</button>';
    }else{
      h+='<button onclick="_JUK()" '+(canKnock?'':'disabled')+' style="min-height:48px;padding:8px 18px;font-family:Georgia,serif;font-weight:700;font-size:0.85rem;background:'+(canKnock?'linear-gradient(180deg,rgba(255,220,112,0.3),rgba(200,168,75,0.4))':'rgba(0,0,0,0.4)')+';border:'+(canKnock?'2':'1.5')+'px solid '+(canKnock?'#ffdc70':'rgba(232,220,200,0.25)')+';color:'+(canKnock?'#f5ebd0':'rgba(232,220,200,0.4)')+';letter-spacing:0.06em;border-radius:8px;cursor:'+(canKnock?'pointer':'not-allowed')+';'+(canKnock?'box-shadow:0 0 14px rgba(255,220,112,0.45),inset 0 1px 0 rgba(255,255,255,0.15);animation:juKnockPulse 1.4s ease-in-out infinite;':'')+'">KNOCK'+(canKnock&&dwIsNum?' &middot; '+dw:'')+'</button>';
    }
    if(phase==='knockChoice'){
      h+='<button onclick="_JUP()" style="min-height:48px;padding:8px 18px;font-family:Georgia,serif;font-weight:700;font-size:0.85rem;background:rgba(0,0,0,0.45);border:1.5px solid rgba(232,220,200,0.45);color:#f5ebd0;letter-spacing:0.06em;border-radius:8px;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,0.1);">PASS</button>';
    }
    h+='<button onclick="_JUS()" title="Sort hand" style="min-height:44px;padding:8px 14px;font-family:Georgia,serif;font-style:italic;font-size:0.7rem;background:rgba(0,0,0,0.4);border:1px solid rgba(232,220,200,0.3);color:rgba(232,220,200,0.85);border-radius:8px;cursor:pointer;">↕ Sort</button>';
    h+='</div>';
    // ── PLAYER HAND with auto-meld tints ────────────────────────
    var info = playerHand.length<=11 ? _handMeldMap(playerHand) : null;
    h+='<div style="display:flex;justify-content:center;padding:6px 2px;flex-wrap:wrap;gap:3px;">';
    for(var k=0;k<pCount();k++){
      var c=playerHand[k];
      var meldIdxNum = info ? info.meldOf[k] : undefined;
      var meldKind = info ? info.kindOf[k] : null;
      var inMeld = (meldIdxNum !== undefined);
      var redCol = c.suit==='hearts'||c.suit==='diamonds';
      var col = redCol ? '#b42a2a' : '#1a1a1a';
      // Background tint: warm (set) / cool (run) / cream (deadwood)
      var bgTop, bgBot, bdr;
      if(meldKind==='set'){ bgTop='#fff0d0'; bgBot='#f3deaa'; bdr='#c48f3a'; }
      else if(meldKind==='run'){ bgTop='#d6e6f5'; bgBot='#b9d4ec'; bdr='#5b9bd1'; }
      else { bgTop='#faf3dd'; bgBot='#f0e7c8'; bdr='#b8a878'; }
      var sty='width:46px;height:64px;border-radius:6px;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;font-weight:700;font-family:Georgia,serif;border:2px solid '+bdr+';background:linear-gradient(180deg,'+bgTop+','+bgBot+');color:'+col+';position:relative;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,0.55),0 2px 5px rgba(0,0,0,0.5);transition:transform .15s;';
      h+='<div onclick="_JUCC('+k+')" style="'+sty+'">';
      h+='<span style="font-size:0.78rem;position:absolute;top:2px;left:5px;line-height:1;">'+c.rank+'</span>';
      h+='<span style="font-size:0.58rem;position:absolute;top:14px;left:6px;line-height:1;">'+_pip(c.suit)+'</span>';
      h+='<span style="font-size:1.4rem;line-height:1;">'+_pip(c.suit)+'</span>';
      h+='<span style="font-size:0.78rem;position:absolute;bottom:2px;right:5px;line-height:1;transform:rotate(180deg);">'+c.rank+'</span>';
      h+='</div>';
    }
    h+='</div>';
    // ── WIN OVERLAY (staged scoring reveal) ─────────────────────
    if(winOverlay){
      var w=winOverlay;
      var isYou = w.winner==='player';
      var titleColor = isYou ? '#7ab356' : '#dc8a8a';
      var bigText;
      if(w.kind==='gin') bigText = isYou ? 'GIN!' : 'JUNIPER GINS';
      else if(w.kind==='undercut') bigText = 'UNDERCUT';
      else bigText = isYou ? 'KNOCK' : 'JUNIPER KNOCKS';
      var bgGrad = w.kind==='gin'
        ? 'radial-gradient(ellipse at 50% 40%,rgba(255,220,112,0.35) 0%,rgba(10,5,20,0.95) 70%)'
        : w.kind==='undercut'
        ? 'radial-gradient(ellipse at 50% 40%,rgba(230,57,70,0.3) 0%,rgba(10,5,20,0.95) 70%)'
        : 'radial-gradient(ellipse at 50% 40%,rgba(60,40,100,0.5) 0%,rgba(10,5,20,0.95) 70%)';
      h+='<div style="position:fixed;inset:0;background:'+bgGrad+';z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;animation:juWinIn 0.5s ease-out;">';
      h+='<div style="font-size:'+(w.kind==='gin'?'4.5rem':'2.6rem')+';line-height:1;margin-bottom:10px;animation:juWinPop 0.9s cubic-bezier(.2,1.4,.3,1);filter:drop-shadow(0 0 24px '+titleColor+'aa);">'+(w.kind==='gin'?'🎉':w.kind==='undercut'?'⚔️':'🪶')+'</div>';
      h+='<div style="font-family:Georgia,serif;font-size:2.2rem;font-weight:700;color:'+titleColor+';letter-spacing:0.06em;text-shadow:0 0 26px '+titleColor+'aa;text-align:center;margin-bottom:14px;">'+bigText+'</div>';
      // Staged scoring lines — revealed one at a time as winLineIdx advances.
      h+='<div style="display:flex;flex-direction:column;gap:8px;max-width:340px;width:90%;">';
      for(var li=0;li<w.lines.length;li++){
        var line = w.lines[li];
        var visible = li < winLineIdx;
        if(!visible){
          h+='<div style="height:36px;"></div>'; // placeholder so layout doesn't jump
          continue;
        }
        var size = line.big ? '1.5rem' : '0.95rem';
        var weight = line.big ? '700' : '400';
        var bg = line.big ? 'linear-gradient(180deg,rgba(255,220,112,0.18),rgba(255,220,112,0.05))' : 'rgba(0,0,0,0.4)';
        var bdr = line.big ? '#ffdc70' : 'rgba(232,220,200,0.25)';
        h+='<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 14px;background:'+bg+';border:1px solid '+bdr+';border-radius:8px;font-family:Georgia,serif;animation:juLineIn 0.45s cubic-bezier(.2,1.4,.3,1);">';
        h+='<span style="font-style:italic;font-size:0.78rem;color:#f5ebd0;letter-spacing:0.04em;">'+line.label+'</span>';
        h+='<span style="font-weight:'+weight+';font-size:'+size+';color:'+(line.color||'#f5ebd0')+';text-shadow:0 1px 2px rgba(0,0,0,0.6);">'+line.value+'</span>';
        h+='</div>';
      }
      h+='</div>';
      h+='</div>';
    }
    if(pan)pan.innerHTML=h;
  }
  // ── Per-player score strip ──────────────────────────────────
  function _scoreStrip(label, score, wins, color){
    return '<div style="flex:1;background:linear-gradient(180deg,rgba(0,0,0,0.4),rgba(0,0,0,0.55));border:1.5px solid '+color+';border-radius:8px;padding:6px 10px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.06),0 2px 6px rgba(0,0,0,0.4);">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;">'
        +'<div>'
          +'<div style="font-family:DM Mono,monospace;font-size:0.5rem;letter-spacing:0.12em;color:'+color+';text-transform:uppercase;line-height:1;">'+label+'</div>'
          +'<div style="font-family:Georgia,serif;font-size:1.5rem;font-weight:700;color:#f5ebd0;line-height:1;margin-top:2px;text-shadow:0 2px 3px rgba(0,0,0,0.5);">'+score+'</div>'
        +'</div>'
        +'<div style="text-align:right;font-family:DM Mono,monospace;font-size:0.5rem;letter-spacing:0.12em;color:rgba(232,220,200,0.55);">'
          +'<div style="text-transform:uppercase;">hands won</div>'
          +'<div style="font-family:Georgia,serif;font-size:1rem;font-weight:700;color:#f5ebd0;margin-top:2px;">'+wins+'</div>'
        +'</div>'
      +'</div>'
    +'</div>';
  }

  window._JUN=function(){var _jo=document.getElementById('JU-over');if(_jo)_jo.remove();gen++;winOverlay=null;winLineIdx=0;aiThinking=false;aiHoverDiscard=false;playerScore=0;aiScore=0;playerWins=0;aiWins=0;newHand();};
  window._JUDS=function(){onDrawStock();};
  window._JUDD=function(){onDrawDiscard();};
  window._JUCC=function(i){onCardClick(i);};
  window._JUK=function(){onKnock();};
  window._JUP=function(){onPass();};
  window._JUG=function(){
    if(phase!=='knockChoice')return;
    if(playerHand.length===10&&getDeadwood(playerHand)===0)endRound('player','gin');
  };
  window._JUS=function(){sortBySuit(playerHand);render();};

  _JUN();
};
})();
