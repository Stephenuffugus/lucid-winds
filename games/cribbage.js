// ═══ GARDEN CRIB — Cribbage vs AI ═══
// Wired into Lucid Winds game system. Uses ms/mm/mc helpers and _e() for hash rewards.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

window._gameFns = window._gameFns || {};
window._gameFns.cribbage = function CRIB(a){
  var RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  var SUITS=['♠','♥','♦','♣'];
  var VALS=[1,2,3,4,5,6,7,8,9,10,10,10,10];
  var G;

  ms(a,'🃏 <strong id="CBp">0</strong> vs AI <strong id="CBa">0</strong>');
  mm(a);
  var pan=document.createElement('div');
  pan.id='CBpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:6px;user-select:none';
  a.appendChild(pan);
  // Style-aware pip — Garden swaps ♠♥♦♣ for 🍄🌸🐝🐦
  function _pip(idx){return (window._cdSuit)?window._cdSuit(idx):SUITS[idx];}
  var _cbStyleLbl='🃏 Style';
  mc(a).innerHTML='<button class="gb-new" onclick="_CBN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button> <button class="gb" id="CBstyle" onclick="_CBToggleStyle()" style="font-size:0.7rem;">'+_cbStyleLbl+'</button>';
  window._CBToggleStyle=function(){
    if(typeof window._cdToggleStyle!=='function'){if(window._toast)window._toast('Card styles loading — try again in a sec.');return;}
    var nxt=window._cdToggleStyle();
    var b=document.getElementById('CBstyle');
    if(b)b.textContent='🃏 Style';
    if(typeof render==='function')render();
  };

  function makeDeck(){var d=[];for(var s=0;s<4;s++)for(var r=0;r<13;r++)d.push({rank:r,suit:s,val:VALS[r]});return sh(d);}
  function cstr(c){return RANKS[c.rank]+_pip(c.suit);}
  function isRed(c){return c.suit===1||c.suit===2;}

  function newGame(){
    G={pScore:0,aScore:0,dealer:'ai',phase:'deal',deck:[],
       pHand:[],aHand:[],crib:[],starter:null,
       pSelected:[],playArea:[],playCount:0,
       pPlayed:[],aPlayed:[],pPass:false,aPass:false,
       lastScoreBreakdown:'',roundNum:0};
    dealHand();
  }
  function dealHand(){
    G.roundNum++;
    G.deck=makeDeck();
    G.pHand=G.deck.splice(0,6);
    G.aHand=G.deck.splice(0,6);
    G.crib=[];G.starter=null;G.pSelected=[];
    G.playArea=[];G.playCount=0;G.pPlayed=[];G.aPlayed=[];
    G.pPass=false;G.aPass=false;G.lastScoreBreakdown='';
    G.dealer=G.dealer==='ai'?'player':'ai';
    G.phase='discard';
    render();
  }
  function toggleSelect(idx){
    if(G.phase!=='discard')return;
    var pos=G.pSelected.indexOf(idx);
    if(pos>=0)G.pSelected.splice(pos,1);
    else if(G.pSelected.length<2)G.pSelected.push(idx);
    render();
  }
  function confirmDiscard(){
    if(G.pSelected.length!==2)return;
    G.pSelected.sort(function(a,b){return b-a;});
    G.pSelected.forEach(function(idx){G.crib.push(G.pHand.splice(idx,1)[0]);});
    G.pSelected=[];
    var aiDiscards=aiChooseDiscard();
    aiDiscards.sort(function(a,b){return b-a;});
    aiDiscards.forEach(function(idx){G.crib.push(G.aHand.splice(idx,1)[0]);});
    G.starter=G.deck.pop();
    if(G.starter.rank===10){
      if(G.dealer==='player'){G.pScore+=2;sm('Nibs! +2');}
      else{G.aScore+=2;sm('AI nibs +2');}
      if(checkWin())return;
    }
    G.phase='peg';G.playArea=[];G.playCount=0;
    if(G.dealer==='player')setTimeout(aiPeg,600);
    render();
  }
  function aiChooseDiscard(){
    var best=null,bestVal=-1;
    for(var i=0;i<6;i++)for(var j=i+1;j<6;j++){
      var hand=[];
      for(var k=0;k<6;k++)if(k!==i&&k!==j)hand.push(G.aHand[k]);
      var val=estimateHand(hand);
      if(G.dealer==='player'){
        val-=G.aHand[i].val*.3+G.aHand[j].val*.3;
        if(G.aHand[i].val===5)val-=3;if(G.aHand[j].val===5)val-=3;
      }
      if(val>bestVal){bestVal=val;best=[i,j];}
    }
    return best||[4,5];
  }
  function estimateHand(hand){
    var sc=0;
    for(var i=0;i<hand.length;i++)for(var j=i+1;j<hand.length;j++){
      if(hand[i].val+hand[j].val===15)sc+=2;
      for(var k=j+1;k<hand.length;k++)if(hand[i].val+hand[j].val+hand[k].val===15)sc+=2;
    }
    for(var i2=0;i2<hand.length;i2++)for(var j2=i2+1;j2<hand.length;j2++)
      if(hand[i2].rank===hand[j2].rank)sc+=2;
    return sc;
  }
  function playCard(idx){
    if(G.phase!=='peg')return;
    var card=G.pHand[idx];
    if(G.pPlayed.indexOf(idx)>=0)return;
    if(G.playCount+card.val>31)return;
    G.pPlayed.push(idx);
    G.playArea.push({card:card,who:'player'});
    G.playCount+=card.val;
    var pts=scorePeg(G.playArea,G.playCount);
    if(pts>0){G.pScore+=pts;sm('+'+pts);_e('progress');}
    if(checkWin())return;
    G.pPass=false;G.aPass=false;
    render();
    if(G.playCount===31){
      setTimeout(function(){G.playCount=0;G.playArea=[];render();checkPegContinue();},800);
      return;
    }
    checkPegContinue();
  }
  function aiPeg(){
    if(G.phase!=='peg')return;
    var avail=[];
    for(var i=0;i<G.aHand.length;i++){
      if(G.aPlayed.indexOf(i)>=0)continue;
      if(G.playCount+G.aHand[i].val<=31)avail.push(i);
    }
    if(avail.length===0){
      // AI can't play — say "Go"
      G.aPass=true;
      // Check if player also can't play
      var pCanPlay=false;
      for(var i2=0;i2<G.pHand.length;i2++){
        if(G.pPlayed.indexOf(i2)>=0)continue;
        if(G.playCount+G.pHand[i2].val<=31){pCanPlay=true;break;}
      }
      if(!pCanPlay){
        // Both passed — award last-card point, reset count
        var lastWho=G.playArea.length>0?G.playArea[G.playArea.length-1].who:'player';
        if(lastWho==='ai')G.aScore+=1;else G.pScore+=1;
        sm((lastWho==='ai'?'AI':'You')+' +1 (Go)');
        G.playCount=0;G.playArea=[];G.pPass=false;G.aPass=false;
        if(checkWin())return;
        render();checkPegContinue();
      }else{
        // AI passes, player keeps playing
        sm('AI "Go" — +1 to you');G.pScore+=1;
        if(checkWin())return;
        render();
        // Player's turn (no auto-advance — wait for player card tap)
      }
      return;
    }
    var bestIdx=avail[0],bestScore=-99;
    avail.forEach(function(idx){
      var c=G.aHand[idx];var nc=G.playCount+c.val;var sc=0;
      if(nc===15)sc+=10;if(nc===31)sc+=10;
      if(G.playArea.length>0&&G.playArea[G.playArea.length-1].card.rank===c.rank)sc+=6;
      if(nc===5||nc===21)sc-=5;
      sc+=Math.random()*2;
      if(sc>bestScore){bestScore=sc;bestIdx=idx;}
    });
    var card=G.aHand[bestIdx];
    G.aPlayed.push(bestIdx);
    G.playArea.push({card:card,who:'ai'});
    G.playCount+=card.val;
    var pts=scorePeg(G.playArea,G.playCount);
    if(pts>0){G.aScore+=pts;sm('AI +'+pts);}
    if(checkWin())return;
    if(G.playCount===31){
      setTimeout(function(){G.playCount=0;G.playArea=[];render();checkPegContinue();},800);
      return;
    }
    render();checkPegContinue();
  }
  function checkPegContinue(){
    if(G.pPlayed.length>=4&&G.aPlayed.length>=4){
      var lastWho=G.playArea.length>0?G.playArea[G.playArea.length-1].who:'player';
      if(lastWho==='player')G.pScore+=1;else G.aScore+=1;
      if(checkWin())return;
      setTimeout(showPhase,800);return;
    }
    // Turn order based on last card + passes, not brittle parity math
    var lastWho=G.playArea.length>0?G.playArea[G.playArea.length-1].who:null;
    var isPlayerNext;
    if(G.aPass&&!G.pPass)isPlayerNext=true;       // AI passed, player continues
    else if(G.pPass&&!G.aPass)isPlayerNext=false; // player passed, AI continues
    else if(lastWho==='player')isPlayerNext=false; // player just played, AI's turn
    else if(lastWho==='ai')isPlayerNext=true;     // AI just played, player's turn
    else isPlayerNext=(G.dealer==='ai');            // fresh sequence: non-dealer leads
    if(!isPlayerNext)setTimeout(aiPeg,500);
  }
  function scorePeg(area,count){
    var pts=0;
    if(count===15)pts+=2;if(count===31)pts+=2;
    if(area.length>=2){
      var last=area[area.length-1].card;var prev=area[area.length-2].card;
      if(last.rank===prev.rank){
        pts+=2;
        if(area.length>=3&&area[area.length-3].card.rank===last.rank)pts+=4;
      }
    }
    return pts;
  }
  function showPhase(){
    G.phase='show';
    var order=G.dealer==='player'?['ai','player','crib']:['player','ai','crib'];
    var delays=[0,1500,3000];
    order.forEach(function(who,i){
      setTimeout(function(){
        var hand,label;
        if(who==='player'){hand=G.pHand;label='Your hand';}
        else if(who==='ai'){hand=G.aHand;label='AI hand';}
        else{hand=G.crib;label=(G.dealer==='player'?'Your':'AI')+' crib';}
        var result=scoreHand(hand,G.starter,who==='crib');
        if(who==='player'||(who==='crib'&&G.dealer==='player'))G.pScore+=result.total;
        else G.aScore+=result.total;
        G.lastScoreBreakdown=label+': '+result.total+' pts — '+result.breakdown;
        _e('milestone');
        if(result.total>=24)_e('progress');
        if(checkWin())return;
        render();sm(label+' +'+result.total);
      },delays[i]);
    });
    setTimeout(function(){
      if(G.phase==='show'&&!checkWin())dealHand();
    },4500);
  }
  function scoreHand(hand,starter,isCrib){
    var all=hand.concat([starter]);var pts=0,bd=[];
    for(var mask=1;mask<32;mask++){
      var sum=0;
      for(var i=0;i<5;i++)if(mask&(1<<i))sum+=all[i].val;
      if(sum===15){pts+=2;bd.push('15=2');}
    }
    for(var i2=0;i2<5;i2++)for(var j=i2+1;j<5;j++){
      if(all[i2].rank===all[j].rank){pts+=2;bd.push('Pair=2');}
    }
    var ranks=all.map(function(c){return c.rank;}).sort(function(a,b){return a-b;});
    var runFound=false;
    if(ranks[4]-ranks[0]===4){
      var uniq={};for(var ri=0;ri<5;ri++)uniq[ranks[ri]]=1;
      if(Object.keys(uniq).length===5){pts+=5;bd.push('Run5=5');runFound=true;}
    }
    if(!runFound){
      for(var len=4;len>=3&&!runFound;len--){
        for(var s=0;s<=5-len;s++){
          var sub=ranks.slice(s,s+len);
          var uq={};for(var ui=0;ui<sub.length;ui++)uq[sub[ui]]=1;
          if(sub[sub.length-1]-sub[0]===len-1&&Object.keys(uq).length===len){
            var mult=1;
            for(var rk=0;rk<len;rk++){
              var cnt=0;for(var rnk=0;rnk<ranks.length;rnk++)if(ranks[rnk]===sub[rk])cnt++;
              mult*=cnt;
            }
            pts+=len*mult;bd.push('Run'+len+'x'+mult+'='+(len*mult));
            runFound=true;break;
          }
        }
      }
    }
    var hs=hand.map(function(c){return c.suit;});
    if(hs[0]===hs[1]&&hs[1]===hs[2]&&hs[2]===hs[3]){
      if(starter.suit===hs[0]){pts+=5;bd.push('Flush5=5');}
      else if(!isCrib){pts+=4;bd.push('Flush4=4');}
    }
    for(var n=0;n<hand.length;n++){
      if(hand[n].rank===10&&hand[n].suit===starter.suit){pts+=1;bd.push('Nobs=1');break;}
    }
    return{total:pts,breakdown:bd.join(' | ')};
  }
  function checkWin(){
    if(G.pScore>=121){G.phase='gameover';render();_e('game_win');_playWin();_sr('cribbage',{w:true,s:G.pScore});var skunk=G.aScore<91;if(skunk)_e('milestone');sm(skunk?'🃏 SKUNK WIN!':'🃏 You win!');return true;}
    if(G.aScore>=121){G.phase='gameover';render();_e('game_loss');_play('lose');_sr('cribbage',{w:false,s:G.pScore});sm('Garden resting...');return true;}
    return false;
  }
  function render(){
    var ps=document.getElementById('CBp');if(ps)ps.textContent=G.pScore;
    var as=document.getElementById('CBa');if(as)as.textContent=G.aScore;
    var h='';
    h+='<div style="background:linear-gradient(135deg,rgba(139,105,20,.4),rgba(107,80,16,.5));border:1px solid rgba(200,168,75,0.3);border-radius:10px;padding:8px 12px;margin:4px 0;display:flex;justify-content:space-between;align-items:center;">';
    h+='<span style="font-family:Bebas Neue,sans-serif;font-size:0.9rem;color:var(--sage);">YOU '+G.pScore+'</span>';
    h+='<div style="flex:1;height:10px;background:rgba(0,0,0,.4);border-radius:5px;margin:0 10px;position:relative;overflow:hidden;">';
    h+='<div style="height:100%;width:'+Math.min(100,(G.pScore/121)*100)+'%;background:linear-gradient(90deg,rgba(122,179,86,.5),rgba(122,179,86,.9));border-radius:5px;transition:width .4s;"></div>';
    h+='<div style="position:absolute;top:0;left:0;height:100%;width:'+Math.min(100,(G.aScore/121)*100)+'%;background:rgba(199,80,80,.4);border-radius:5px;"></div>';
    h+='</div>';
    h+='<span style="font-family:Bebas Neue,sans-serif;font-size:0.9rem;color:#c47a7a;">AI '+G.aScore+'</span></div>';
    var st='';
    if(G.phase==='discard')st='Select 2 cards → crib';
    else if(G.phase==='peg')st='Pegging — Count: '+G.playCount+'/31';
    else if(G.phase==='show')st='Scoring hands...';
    else st='Game Over';
    h+='<div style="display:flex;gap:14px;justify-content:center;align-items:center;padding:6px 4px;flex-wrap:wrap;font-family:DM Mono,monospace;font-size:0.85rem;letter-spacing:0.06em;">';
    h+='<div style="color:var(--sage);">'+st+'</div>';
    h+='<div style="color:var(--muted);">Round <strong style="color:var(--cream);">'+G.roundNum+'</strong></div>';
    h+='<div style="color:var(--muted);">Dealer: <strong style="color:var(--gold);font-family:Bebas Neue,sans-serif;font-size:1rem;">'+(G.dealer==='player'?'YOU':'AI')+'</strong></div>';
    h+='</div>';
    h+='<div style="background:rgba(26,31,23,.4);border:1px solid rgba(74,124,53,.12);border-radius:8px;padding:8px;margin:4px 0;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.8rem;color:var(--cream);letter-spacing:0.1em;margin-bottom:5px;">AI HAND</div>';
    h+='<div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap;min-height:64px;align-items:center;">';
    if(G.phase==='show'||G.phase==='gameover'){
      G.aHand.forEach(function(c){h+=_cardHtml(c,false,false,false,false);});
    }else{
      for(var i=0;i<G.aHand.length;i++){
        var played=G.aPlayed.indexOf(i)>=0;
        h+='<div style="width:46px;height:64px;border-radius:6px;background:linear-gradient(135deg,#4A7C35,#3a6028);border:2px solid #2d4a1e;'+(played?'opacity:.4;':'')+'"></div>';
      }
    }
    h+='</div></div>';
    if(G.starter){
      h+='<div style="text-align:center;padding:5px 0;"><span style="font-family:Bebas Neue,sans-serif;font-size:0.8rem;color:var(--cream);letter-spacing:0.1em;">STARTER:&nbsp;</span>';
      h+=_cardHtml(G.starter,false,false,false,true);
      h+='</div>';
    }
    if(G.phase==='peg'&&G.playArea.length>0){
      h+='<div style="text-align:center;font-size:1.1rem;font-weight:700;color:var(--gold);padding:2px 0;">Count: '+G.playCount+'</div>';
      h+='<div style="min-height:50px;display:flex;gap:3px;justify-content:center;align-items:center;flex-wrap:wrap;padding:4px;background:rgba(26,31,23,.3);border-radius:6px;margin:4px 0;">';
      G.playArea.forEach(function(p){h+=_cardHtml(p.card,false,false,false,false,p.who);});
      h+='</div>';
    }
    if(G.lastScoreBreakdown){
      h+='<div style="font-size:0.78rem;color:var(--cream);text-align:center;padding:8px;background:rgba(26,31,23,.5);border:1px solid rgba(122,179,86,0.2);border-radius:6px;margin:4px 0;line-height:1.5;">'+G.lastScoreBreakdown+'</div>';
    }
    h+='<div style="background:rgba(26,31,23,.4);border:1px solid rgba(74,124,53,.12);border-radius:8px;padding:8px;margin:4px 0;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.85rem;color:var(--cream);letter-spacing:0.1em;margin-bottom:5px;">YOUR HAND</div>';
    h+='<div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap;min-height:64px;align-items:center;">';
    G.pHand.forEach(function(c,i){
      var isSel=G.pSelected.indexOf(i)>=0;
      var isPlayed=G.pPlayed.indexOf(i)>=0;
      var canPlay=G.phase==='peg'&&!isPlayed&&G.playCount+c.val<=31;
      h+=_cardHtml(c,isSel,isPlayed,canPlay,false,null,i);
    });
    h+='</div></div>';
    h+='<div style="display:flex;gap:6px;justify-content:center;padding:6px 0;flex-wrap:wrap;">';
    if(G.phase==='discard'&&G.pSelected.length===2){
      h+='<button class="gb" onclick="_CBD()" style="min-height:44px;padding:10px 20px;font-size:0.8rem;">✓ DISCARD TO CRIB</button>';
    }
    if(G.phase==='peg'){
      var canAny=false;
      for(var ci=0;ci<G.pHand.length;ci++){
        if(G.pPlayed.indexOf(ci)<0&&G.playCount+G.pHand[ci].val<=31){canAny=true;break;}
      }
      if(!canAny&&G.pPlayed.length<4){
        h+='<button class="gb" onclick="_CBGO()" style="min-height:44px;padding:10px 20px;font-size:0.8rem;">Say "GO"</button>';
      }
    }
    h+='</div>';
    pan.innerHTML=h;
  }
  function _cardHtml(c,sel,played,canPlay,isStarter,who,idx){
    var borderCol='#C4B998';
    if(who==='player')borderCol='#4A7C35';
    else if(who==='ai')borderCol='#C47A7A';
    if(sel)borderCol='#7AB956';
    var style='width:46px;height:64px;border-radius:6px;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;font-size:15px;font-weight:700;border:2px solid '+borderCol+';background:#F5F0E1;color:'+(isRed(c)?'#C47A7A':'#1a1f17')+';position:relative;vertical-align:middle;';
    if(sel)style+='transform:translateY(-8px);box-shadow:0 4px 12px rgba(122,185,86,.4);';
    if(played)style+='opacity:.5;';
    if(canPlay)style+='cursor:pointer;';
    var onclick='';
    if(G.phase==='discard'&&!played&&idx!==undefined)onclick='_CBTS('+idx+')';
    else if(G.phase==='peg'&&canPlay&&idx!==undefined)onclick='_CBPC('+idx+')';
    return '<div style="'+style+'" '+(onclick?'onclick="'+onclick+'"':'')+'><span style="font-size:13px;position:absolute;top:2px;left:4px;">'+RANKS[c.rank]+'</span><span style="font-size:18px;">'+_pip(c.suit)+'</span></div>';
  }

  window._CBN=newGame;
  window._CBTS=toggleSelect;
  window._CBD=confirmDiscard;
  window._CBPC=playCard;
  window._CBGO=function(){
    // Check if AI still has cards to play
    var aiHasCard=false;
    for(var i=0;i<G.aHand.length;i++){
      if(G.aPlayed.indexOf(i)>=0)continue;
      if(G.playCount+G.aHand[i].val<=31){aiHasCard=true;break;}
    }
    G.pPass=true;
    if(aiHasCard){G.aScore+=1;sm('AI +1 (you said Go)');}
    else{
      // Both can't play — count resets, last-card point
      var lastWho=G.playArea.length>0?G.playArea[G.playArea.length-1].who:'player';
      if(lastWho==='ai')G.aScore+=1;else G.pScore+=1;
      sm((lastWho==='ai'?'AI':'You')+' +1 (last card)');
      G.playCount=0;G.playArea=[];G.pPass=false;G.aPass=false;
    }
    if(checkWin())return;
    render();checkPegContinue();
  };

  newGame();
};
})();
