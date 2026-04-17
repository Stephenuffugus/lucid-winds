// ═══ JUNIPER — Gin Rummy ═══
// Draw/discard to form melds (sets of 3+ same rank, runs of 3+ same suit).
// Knock at ≤10 deadwood. Gin at 0. First to 100 wins.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

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
  var phase='',turnCount=0;

  ms(a,'🫐 You <strong id="JUy">0</strong> — AI <strong id="JUa">0</strong>');
  mm(a);
  var pan=document.createElement('div');pan.id='JUpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:6px;user-select:none;';
  a.appendChild(pan);
  function _pip(suitName){return (window._cdPipFor)?window._cdPipFor(suitName):SI[suitName];}
  var _juStyleLbl='🃏 Style';
  mc(a).innerHTML='<button class="gb-new" onclick="_JUN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button> <button class="gb" id="JUstyle" onclick="_JUToggleStyle()" style="font-size:0.7rem;">'+_juStyleLbl+'</button>';
  window._JUToggleStyle=function(){
    if(typeof window._cdToggleStyle!=='function'){if(window._toast)window._toast('Card styles loading — try again in a sec.');return;}
    var nxt=window._cdToggleStyle();
    var b=document.getElementById('JUstyle');
    if(b)b.textContent='🃏 Style';
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
    phase='aiTurn';sm('Juniper is thinking...');
    setTimeout(function(){
      var choice=aiDecideDraw();
      if(choice==='discard'&&discardPile.length>0)aiHand.push(discardPile.pop());
      else{if(stock.length===0){drawRound();return;}aiHand.push(stock.pop());}
      render();
      setTimeout(function(){
        var action=aiShouldKnock();
        if(action==='gin'){
          var di=aiDecideDiscard();var dc=aiHand.splice(di,1)[0];discardPile.push(dc);render();
          setTimeout(function(){endRound('ai','gin');},400);return;
        }
        if(action==='knock'&&turnCount>1){
          var di2=aiDecideDiscard();var dc2=aiHand.splice(di2,1)[0];discardPile.push(dc2);render();
          setTimeout(function(){endRound('ai','knock');},400);return;
        }
        var di3=aiDecideDiscard();var dc3=aiHand.splice(di3,1)[0];discardPile.push(dc3);
        sm('Your turn — draw a card');phase='draw';turnCount++;
        if(stock.length===0){drawRound();return;}
        render();
      },400);
    },500);
  }

  function deal(){
    var deck=shuffle(makeDeck());
    playerHand=[];aiHand=[];stock=[];discardPile=[];
    for(var i=0;i<10;i++){playerHand.push(deck[i*2]);aiHand.push(deck[i*2+1]);}
    stock=deck.slice(20);discardPile=[stock.pop()];
    sortBySuit(playerHand);turnCount=0;phase='draw';
  }
  function newHand(){deal();sm('Your turn — draw a card');render();}
  function drawRound(){
    sm('Stock empty — round is a draw');
    setTimeout(function(){
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
    var pts=0,winner='',msg='';
    if(type==='gin'){pts=ddw+25;winner=who;msg=(who==='player'?'GIN! +':'AI GIN! +')+pts;}
    else{
      if(ddw<=kdw){pts=(kdw-ddw)+25;winner=who==='player'?'ai':'player';msg='UNDERCUT! '+(winner==='player'?'You':'AI')+' +'+pts;}
      else{pts=ddw-kdw;winner=who;msg=(who==='player'?'You':'AI')+' knock +'+pts;}
    }
    if(winner==='player'){playerScore+=pts;playerWins++;_e('milestone');}
    else{aiScore+=pts;aiWins++;_e('progress');}
    sm(msg);
    render();
    setTimeout(function(){
      if(playerScore>=100||aiScore>=100){
        var won=playerScore>=100;
        if(won){_e('game_win');_playWin();sm('🫐 You win! '+playerScore+' vs '+aiScore);}
        else{_e('game_loss');_play('lose');sm('You lose. '+playerScore+' vs '+aiScore);}
        _sr('juniper',{w:won,s:playerScore,r:playerWins+aiWins});
        setTimeout(function(){playerScore=0;aiScore=0;playerWins=0;aiWins=0;newHand();},3000);
        return;
      }
      newHand();
    },2000);
  }

  function onDrawStock(){
    if(phase!=='draw')return;
    if(stock.length===0){drawRound();return;}
    playerHand.push(stock.pop());phase='discard';
    _play('snap');sm('Tap a card to discard');render();
  }
  function onDrawDiscard(){
    if(phase!=='draw'||discardPile.length===0)return;
    playerHand.push(discardPile.pop());phase='discard';
    _play('snap');sm('Tap a card to discard');render();
  }
  function onCardClick(idx){
    if(phase!=='discard')return;
    var card=playerHand.splice(idx,1)[0];discardPile.push(card);
    _play('snap');
    var dw=getDeadwood(playerHand);
    if(dw===0){endRound('player','gin');return;}
    phase='aiTurn';turnCount++;
    render();
    if(stock.length===0){drawRound();return;}
    setTimeout(aiTurn,300);
  }
  function onKnock(){
    if(phase!=='discard')return;
    if(playerHand.length!==10){sm('Discard first, then knock');return;}
    var dw=getDeadwood(playerHand);
    if(dw>10){sm('Deadwood too high');return;}
    endRound('player','knock');
  }

  function render(){
    var yscore=document.getElementById('JUy');if(yscore)yscore.textContent=playerScore;
    var ascore=document.getElementById('JUa');if(ascore)ascore.textContent=aiScore;
    var h='';
    // AI hand
    h+='<div style="display:flex;justify-content:center;padding:4px 8px;gap:1px;">';
    for(var i=0;i<aiHand.length;i++)h+='<div style="width:22px;height:32px;border-radius:3px;background:linear-gradient(135deg,#4A7C35,#3a6028);border:1px solid #2d4a1e;"></div>';
    h+='</div>';
    // Piles
    h+='<div style="display:flex;align-items:center;justify-content:center;gap:16px;padding:10px 20px;">';
    h+='<div style="text-align:center;"><div onclick="_JUDS()" style="width:64px;height:90px;border-radius:8px;background:linear-gradient(135deg,#2a3a22,#1a2416);border:2px solid rgba(122,179,86,0.4);display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;"><span style="font-size:1.6rem;opacity:0.5;">🂠</span><span style="font-family:Bebas Neue,sans-serif;font-size:0.95rem;color:var(--gold);position:absolute;bottom:4px;text-shadow:0 1px 4px #000;">'+stock.length+'</span></div><div style="font-family:Bebas Neue,sans-serif;font-size:0.78rem;letter-spacing:0.1em;color:var(--cream);margin-top:5px;">STOCK</div></div>';
    h+='<div style="text-align:center;">';
    if(discardPile.length>0){
      var top=discardPile[discardPile.length-1];
      var col=top.suit==='hearts'||top.suit==='diamonds'?'#c47a7a':'#1a1f17';
      h+='<div onclick="_JUDD()" style="width:64px;height:90px;border-radius:8px;background:#E8DCC8;border:2px solid #b8a878;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;color:'+col+';font-weight:700;"><div style="font-family:Bebas Neue,sans-serif;font-size:1.1rem;">'+top.rank+'</div><div style="font-size:1.3rem;">'+_pip(top.suit)+'</div></div>';
    }else{
      h+='<div style="width:64px;height:90px;border-radius:8px;background:rgba(26,36,22,0.3);border:2px dashed rgba(122,179,86,0.3);display:flex;align-items:center;justify-content:center;font-family:DM Mono,monospace;font-size:0.7rem;color:var(--muted);">empty</div>';
    }
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.78rem;letter-spacing:0.1em;color:var(--cream);margin-top:5px;">DISCARD</div></div>';
    h+='</div>';
    // Deadwood display — bumped from 0.65rem to readable
    var dw=playerHand.length<=11?getDeadwood(playerHand):'—';
    var dwColor=(typeof dw==='number'&&dw<=10)?'var(--gold)':'var(--cream)';
    h+='<div style="text-align:center;font-family:Bebas Neue,sans-serif;font-size:0.95rem;letter-spacing:0.1em;color:var(--cream);padding:6px;background:rgba(26,31,23,0.4);border-radius:6px;margin:4px 16px;">DEADWOOD: <strong style="color:'+dwColor+';font-size:1.3rem;">'+dw+'</strong></div>';
    // Controls
    h+='<div style="display:flex;justify-content:center;gap:8px;padding:6px 12px;">';
    var canKnock=phase==='discard'&&playerHand.length===10&&typeof dw==='number'&&dw<=10;
    var canGin=phase==='discard'&&playerHand.length===10&&dw===0;
    h+='<button onclick="_JUK()" '+(canKnock?'':'disabled')+' style="background:rgba(26,36,22,0.7);border:1px solid '+(canKnock?'#c8a84b':'rgba(122,179,86,0.3)')+';color:'+(canKnock?'#c8a84b':'#e8dcc8')+';padding:8px 16px;border-radius:8px;font-family:Bebas Neue,sans-serif;font-size:0.75rem;letter-spacing:1px;cursor:pointer;'+(canKnock?'':'opacity:0.35;')+'min-height:44px;">KNOCK</button>';
    if(canGin)h+='<button onclick="_JUG()" style="background:rgba(26,36,22,0.7);border:1px solid #7ab356;color:#7ab356;padding:8px 16px;border-radius:8px;font-family:Bebas Neue,sans-serif;font-size:0.75rem;letter-spacing:1px;cursor:pointer;min-height:44px;">GIN!</button>';
    h+='<button onclick="_JUS()" style="background:rgba(26,36,22,0.7);border:1px solid rgba(122,179,86,0.3);color:#e8dcc8;padding:8px 16px;border-radius:8px;font-family:Bebas Neue,sans-serif;font-size:0.75rem;letter-spacing:1px;cursor:pointer;min-height:44px;">SORT</button>';
    h+='</div>';
    // Player hand
    var result=playerHand.length<=11?bestMeldCombination(playerHand):null;
    var meldIdx={};
    if(result){for(var m=0;m<result.melds.length;m++)for(var mj=0;mj<result.melds[m].length;mj++)meldIdx[result.melds[m][mj]]=true;}
    h+='<div style="display:flex;justify-content:center;padding:6px 4px;flex-wrap:wrap;gap:1px;">';
    for(var k=0;k<playerHand.length;k++){
      var c=playerHand[k];var inMeld=!!meldIdx[k];
      var col=c.suit==='hearts'||c.suit==='diamonds'?'#c47a7a':'#1a1f17';
      var bg=inMeld?'#d8e0c8':'#E8DCC8';
      var bc=inMeld?'#7ab356':'#b8a878';
      h+='<div onclick="_JUCC('+k+')" style="width:40px;height:56px;border-radius:6px;background:'+bg+';border:2px solid '+bc+';display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;color:'+col+';font-weight:700;"><div style="font-family:Bebas Neue,sans-serif;font-size:1rem;line-height:1;">'+c.rank+'</div><div style="font-size:1rem;">'+_pip(c.suit)+'</div></div>';
    }
    h+='</div>';
    pan.innerHTML=h;
  }

  window._JUN=function(){playerScore=0;aiScore=0;playerWins=0;aiWins=0;newHand();};
  window._JUDS=function(){onDrawStock();};
  window._JUDD=function(){onDrawDiscard();};
  window._JUCC=function(i){onCardClick(i);};
  window._JUK=function(){onKnock();};
  window._JUG=function(){
    if(phase!=='discard')return;
    if(playerHand.length===10&&getDeadwood(playerHand)===0)endRound('player','gin');
  };
  window._JUS=function(){sortBySuit(playerHand);render();};

  _JUN();
};
})();
