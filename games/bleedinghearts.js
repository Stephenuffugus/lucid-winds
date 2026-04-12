// ═══ BLEEDING HEARTS — classic Hearts card game ═══
// 4-player trick-taking, avoid hearts (1pt each) and Queen of Spades (13pts).
// Shoot the moon = take all 26 pts = opponents each get 26. First to 100 loses.
(function(){
'use strict';

window._gameFns = window._gameFns || {};
window._gameFns.bleedinghearts = function BH(a){
  var SUITS=['clubs','diamonds','spades','hearts'];
  var SI={clubs:'♣',diamonds:'♦',spades:'♠',hearts:'♥'};
  var RANKS=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  var RV={2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,J:11,Q:12,K:13,A:14};
  var S=0,W=1,N=2,E=3;
  var NAMES=['You','West','North','East'];

  var hands=[[],[],[],[]],scores=[0,0,0,0],roundPts=[0,0,0,0];
  var trick=[],trickCards=[null,null,null,null];
  var leader=0,currentPlayer=0,phase='',heartsBroken=false;
  var passDir=0,passSelection=[],roundNum=0,trickNum=0;

  ms(a,'♥ Round <strong id="BHr">1</strong>');
  mm(a);
  var pan=document.createElement('div');pan.id='BHpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:6px;user-select:none;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb-new" onclick="_BHN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

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
  }
  function newRound(){
    roundNum++;deal();passDir=(roundNum-1)%4;
    var re=document.getElementById('BHr');if(re)re.textContent=roundNum;
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
    if(currentPlayer!==S)setTimeout(function(){doAIPlay(true);},500);
  }
  function playCard(player,card){
    removeCard(hands[player],card);
    trick.push({player:player,card:card});trickCards[player]=card;
    if(card.suit==='hearts')heartsBroken=true;
    render();
    if(trick.length===4){
      var winner=trickWinner(trick);var pts=trickPoints(trick);
      roundPts[winner]+=pts;phase='trickDone';
      setTimeout(function(){
        sm(NAMES[winner]+' takes'+(pts>0?' ('+pts+' pts)':''));
        if(pts>0)_e('progress');
        setTimeout(function(){
          trick=[];trickCards=[null,null,null,null];trickNum++;
          if(hands[0].length===0){scoreRound();return;}
          leader=winner;currentPlayer=leader;phase='play';render();
          if(currentPlayer!==S)setTimeout(function(){doAIPlay(false);},400);
        },600);
      },500);
      return;
    }
    currentPlayer=(currentPlayer+1)%4;render();
    if(currentPlayer!==S)setTimeout(function(){doAIPlay(trickNum===0&&trick.length<4);},350);
  }
  function doAIPlay(isFirst){
    if(phase!=='play'||currentPlayer===S)return;
    var card=aiPlay(currentPlayer,isFirst&&trickNum===0);
    playCard(currentPlayer,card);
  }
  function scoreRound(){
    phase='scoring';
    for(var p=0;p<4;p++){
      if(roundPts[p]===26){
        for(var j=0;j<4;j++)if(j!==p)roundPts[j]=26;
        roundPts[p]=0;sm(NAMES[p]+' shot the moon!');_e('milestone');
        break;
      }
    }
    for(p=0;p<4;p++)scores[p]+=roundPts[p];
    var maxScore=Math.max.apply(null,scores);
    if(maxScore>=100){
      var minScore=Math.min.apply(null,scores);var won=scores[S]===minScore;
      if(won){_e('game_win');_playWin();sm('♥ You win! '+scores[S]+' pts');}
      else{_e('game_loss');_play('lose');sm('You lose. '+scores[S]+' pts');}
      _sr('bleedinghearts',{w:won,s:scores[S],r:roundNum});
      setTimeout(function(){scores=[0,0,0,0];roundNum=0;trickNum=0;newRound();},3000);
      return;
    }
    setTimeout(newRound,2000);
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

  function _cardHtml(c,faceDown,isPlayer,extraClass){
    if(faceDown){return '<div style="width:28px;height:40px;border-radius:4px;background:linear-gradient(135deg,#4A7C35,#3a6028);border:1.5px solid #2d4a1e;display:inline-block;"></div>';}
    var col=c.suit==='hearts'||c.suit==='diamonds'?'#c47a7a':'#1a1f17';
    var bc=extraClass==='sel'?'var(--gold)':extraClass==='play'?'#7AB956':'#C4B998';
    return '<div style="display:inline-flex;flex-direction:column;align-items:center;justify-content:center;width:42px;height:58px;border-radius:6px;background:#F5F0E1;border:2px solid '+bc+';color:'+col+';font-weight:700;position:relative;'+(extraClass==='play'?'cursor:pointer;':'')+(extraClass==='sel'?'transform:translateY(-6px);box-shadow:0 4px 12px rgba(200,168,75,0.4);cursor:pointer;':'')+'"><div style="font-size:0.75rem;position:absolute;top:2px;left:4px;">'+c.rank+'</div><div style="font-size:1.2rem;">'+SI[c.suit]+'</div></div>';
  }

  function render(){
    var h='';
    // Score banner
    h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;padding:6px;background:rgba(26,31,23,0.5);border-radius:8px;margin:4px 0;">';
    for(var p=0;p<4;p++){
      var you=p===S;
      h+='<div style="text-align:center;padding:4px;background:rgba(13,16,12,0.4);border-radius:6px;'+(you?'border:1px solid rgba(122,179,86,0.4);':'')+'">';
      h+='<div style="font-family:DM Mono,monospace;font-size:0.5rem;color:'+(you?'var(--sage)':'var(--muted)')+';">'+NAMES[p]+'</div>';
      h+='<div style="font-family:Bebas Neue,sans-serif;font-size:1.1rem;color:var(--gold);">'+scores[p]+'</div>';
      h+='<div style="font-family:DM Mono,monospace;font-size:0.5rem;color:#c47a7a;">+'+roundPts[p]+'</div>';
      h+='</div>';
    }
    h+='</div>';
    if(heartsBroken)h+='<div style="text-align:center;font-family:Bebas Neue,sans-serif;font-size:0.7rem;color:#c47a7a;letter-spacing:0.1em;padding:4px;">♥ HEARTS BROKEN</div>';
    // North
    h+='<div style="text-align:center;padding:4px;"><div style="font-size:0.5rem;color:var(--muted);margin-bottom:3px;">NORTH</div><div>';
    for(var n=0;n<hands[N].length;n++)h+=_cardHtml(null,true);
    h+='</div></div>';
    // West | Trick | East
    h+='<div style="display:grid;grid-template-columns:auto 1fr auto;gap:6px;align-items:center;padding:4px;min-height:120px;">';
    h+='<div><div style="font-size:0.5rem;color:var(--muted);text-align:center;margin-bottom:3px;">WEST</div><div style="display:flex;flex-direction:column;gap:1px;align-items:center;">';
    for(var w=0;w<hands[W].length;w++)h+=_cardHtml(null,true);
    h+='</div></div>';
    // Trick
    h+='<div style="position:relative;min-height:120px;background:rgba(26,31,23,0.3);border-radius:8px;">';
    var pos={};pos[S]='bottom:4px;left:50%;transform:translateX(-50%);';pos[W]='left:4px;top:50%;transform:translateY(-50%);';pos[N]='top:4px;left:50%;transform:translateX(-50%);';pos[E]='right:4px;top:50%;transform:translateY(-50%);';
    for(var pl=0;pl<4;pl++){
      var c=trickCards[pl];if(!c)continue;
      var col=c.suit==='hearts'||c.suit==='diamonds'?'#c47a7a':'#1a1f17';
      h+='<div style="position:absolute;'+pos[pl]+'background:#F5F0E1;color:'+col+';border:2px solid '+(pl===S?'#7AB956':'#C47A7A')+';border-radius:6px;padding:3px 6px;font-weight:700;min-width:36px;text-align:center;">';
      h+='<div style="font-size:0.7rem;">'+c.rank+'</div><div style="font-size:1rem;">'+SI[c.suit]+'</div></div>';
    }
    h+='</div>';
    h+='<div><div style="font-size:0.5rem;color:var(--muted);text-align:center;margin-bottom:3px;">EAST</div><div style="display:flex;flex-direction:column;gap:1px;align-items:center;">';
    for(var e=0;e<hands[E].length;e++)h+=_cardHtml(null,true);
    h+='</div></div>';
    h+='</div>';
    // Pass UI
    if(phase==='passing'){
      var dirs=['LEFT','RIGHT','ACROSS'];
      h+='<div style="text-align:center;padding:8px;background:rgba(26,31,23,0.5);border-radius:8px;margin:6px 0;">';
      h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.75rem;color:var(--gold);letter-spacing:0.1em;margin-bottom:6px;">PASS 3 CARDS '+dirs[passDir]+'</div>';
      h+='<button class="gb" onclick="_BHPASS()" '+(passSelection.length!==3?'disabled':'')+' style="min-height:44px;padding:10px 20px;'+(passSelection.length===3?'background:rgba(200,168,75,0.2);border-color:rgba(200,168,75,0.5);color:var(--gold);':'')+'">PASS ('+passSelection.length+'/3)</button>';
      h+='</div>';
    }
    // Player hand
    h+='<div style="padding:4px;"><div style="font-size:0.5rem;color:var(--muted);text-align:center;margin-bottom:3px;">YOUR HAND</div>';
    h+='<div style="display:flex;gap:3px;justify-content:center;flex-wrap:wrap;">';
    var leadS=trick.length>0?trick[0].card.suit:'';
    var playable=[];
    if(phase==='play'&&currentPlayer===S)playable=getPlayable(hands[S],leadS,trickNum===0);
    else if(phase==='passing')playable=hands[S].slice();
    for(var i=0;i<hands[S].length;i++){
      var cc=hands[S][i];
      var canP=playable.some(function(p){return p.rank===cc.rank&&p.suit===cc.suit;});
      var isSel=passSelection.some(function(p){return p.rank===cc.rank&&p.suit===cc.suit;});
      var col=cc.suit==='hearts'||cc.suit==='diamonds'?'#c47a7a':'#1a1f17';
      var bc=isSel?'var(--gold)':canP?'#7AB956':'#C4B998';
      var sty='display:inline-flex;flex-direction:column;align-items:center;justify-content:center;width:40px;height:56px;border-radius:6px;background:#F5F0E1;border:2px solid '+bc+';color:'+col+';font-weight:700;position:relative;';
      if(canP||phase==='passing')sty+='cursor:pointer;';
      if(isSel)sty+='transform:translateY(-6px);box-shadow:0 4px 12px rgba(200,168,75,0.4);';
      if(!canP&&phase==='play')sty+='opacity:0.5;';
      h+='<div style="'+sty+'" onclick="_BHCC(\''+cc.rank+'\',\''+cc.suit+'\')"><div style="font-size:0.7rem;position:absolute;top:2px;left:4px;">'+cc.rank+'</div><div style="font-size:1.1rem;">'+SI[cc.suit]+'</div></div>';
    }
    h+='</div></div>';
    pan.innerHTML=h;
  }

  window._BHN=function(){scores=[0,0,0,0];roundNum=0;trickNum=0;newRound();};
  window._BHCC=function(r,s){onCardClick({rank:r,suit:s});};
  window._BHPASS=function(){confirmPass();};

  _BHN();
};
})();
