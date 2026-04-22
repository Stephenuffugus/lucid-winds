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

  ms(a,'<span id="CBheader" style="font-family:Georgia,serif;letter-spacing:.06em;">🃏 <strong id="CBp" style="font-size:1.2em;color:#e8dcc8;">0</strong> vs AI <strong id="CBa" style="font-size:1.2em;color:#c47a7a;">0</strong></span>');
  mm(a);
  var pan=document.createElement('div');
  pan.id='CBpan';
  // Felt-table background — signature cribbage visual cue. Layered gradient
  // creates a subtle weave effect over the dark green base.
  pan.style.cssText='max-width:460px;margin:0 auto;padding:10px;user-select:none;'
    +'background:'
      +'radial-gradient(circle at 30% 20%,rgba(255,255,255,0.04) 0%,transparent 50%),'
      +'radial-gradient(circle at 70% 80%,rgba(0,0,0,0.18) 0%,transparent 55%),'
      +'linear-gradient(135deg,#0f5c35 0%,#0b4d2c 55%,#083d22 100%);'
    +'border-radius:14px;'
    +'border:1px solid rgba(180,140,70,0.35);'
    +'box-shadow:inset 0 0 28px rgba(0,0,0,0.35),0 4px 18px rgba(0,0,0,0.4);';
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
    G={pScore:0,aScore:0,pPrev:0,aPrev:0,dealer:'ai',phase:'deal',deck:[],
       pHand:[],aHand:[],crib:[],starter:null,
       pSelected:[],playArea:[],playCount:0,
       pPlayed:[],aPlayed:[],pPass:false,aPass:false,
       lastScoreBreakdown:'',roundNum:0};
    dealHand();
  }
  // Score helpers — capture the last score into pPrev/aPrev so the back peg
  // can leapfrog forward when the front peg advances. Every place that used
  // to do G.pScore+=X now goes through these.
  function addP(pts){ G.pPrev=G.pScore; G.pScore+=pts; }
  function addA(pts){ G.aPrev=G.aScore; G.aScore+=pts; }
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
      if(G.dealer==='player'){addP(2);sm('Nibs! +2');}
      else{addA(2);sm('AI nibs +2');}
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
    if(pts>0){addP(pts);sm('+'+pts);_e('progress');}
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
        if(lastWho==='ai')addA(1);else addP(1);
        sm((lastWho==='ai'?'AI':'You')+' +1 (Go)');
        G.playCount=0;G.playArea=[];G.pPass=false;G.aPass=false;
        if(checkWin())return;
        render();checkPegContinue();
      }else{
        // AI passes, player keeps playing
        sm('AI "Go" — +1 to you');addP(1);
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
    if(pts>0){addA(pts);sm('AI +'+pts);}
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
      if(lastWho==='player')addP(1);else addA(1);
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
    G.narration=null;
    render();
    var order=G.dealer==='player'?['ai','player','crib']:['player','ai','crib'];
    // Sequential narrator: scores one hand at a time, beats out each combo.
    function narrate(whoIdx){
      if(whoIdx>=order.length){
        // All three hands scored — brief pause, then next deal.
        setTimeout(function(){
          if(G.phase==='show'&&!checkWin()){
            G.narration=null;dealHand();
          }
        },1400);
        return;
      }
      var who=order[whoIdx];
      var hand,label,tag;
      if(who==='player'){hand=G.pHand;label='Your hand';tag='player';}
      else if(who==='ai'){hand=G.aHand;label='AI hand';tag='ai';}
      else{hand=G.crib;label=(G.dealer==='player'?'Your':'AI')+' crib';tag='crib';}
      var result=scoreHand(hand,G.starter,who==='crib');
      var scorer = (who==='player'||(who==='crib'&&G.dealer==='player')) ? 'player' : 'ai';
      // Start narration for this hand.
      G.narration={label:label,tag:tag,hand:hand,scorer:scorer,
                   combos:result.combos,step:-1,running:0,total:result.total};
      render();
      // If there are no combos, display '0 pts' beat then move on.
      if(result.combos.length===0){
        G.narration.step=0;
        render();
        setTimeout(function(){
          if(G.phase!=='show')return;
          narrate(whoIdx+1);
        },900);
        return;
      }
      function stepCombo(i){
        if(G.phase!=='show'||!G.narration)return;
        G.narration.step=i;
        G.narration.running += result.combos[i].points;
        // Credit this combo to the scoring side so the peg advances live.
        if(scorer==='player')addP(result.combos[i].points);
        else addA(result.combos[i].points);
        _play('tap');
        render();
        if(i+1<result.combos.length){
          setTimeout(function(){stepCombo(i+1)},720);
        }else{
          // Held-beat on the final combo so the total settles.
          if(result.total>=24)_e('progress');
          _e('milestone');
          if(checkWin())return;
          setTimeout(function(){narrate(whoIdx+1)},1200);
        }
      }
      setTimeout(function(){stepCombo(0)},600);
    }
    narrate(0);
  }
  function scoreHand(hand,starter,isCrib){
    // Returns {total, combos:[{type, points, label, indices:[...]}]} where
    // each combo's indices point into all[] = hand(0-3) + starter(4). The
    // show-phase narration walks this array one step at a time.
    var all=hand.concat([starter]);var pts=0,combos=[];
    // 15s — every subset summing to 15 scores 2.
    for(var mask=1;mask<32;mask++){
      var sum=0, ind=[];
      for(var i=0;i<5;i++)if(mask&(1<<i)){sum+=all[i].val;ind.push(i);}
      if(sum===15 && ind.length>=2){pts+=2;combos.push({type:'15',points:2,label:'Fifteen',indices:ind});}
    }
    // Pairs — 2 pts each, pairs of pairs naturally scored as 3 individual pairs.
    for(var i2=0;i2<5;i2++)for(var j=i2+1;j<5;j++){
      if(all[i2].rank===all[j].rank){pts+=2;combos.push({type:'pair',points:2,label:'Pair',indices:[i2,j]});}
    }
    // Runs — longest run wins; duplicates multiply. Only one run combo is scored
    // (the length × multiplier), representing the best run in the hand.
    var ranks=all.map(function(c){return c.rank;}).sort(function(a,b){return a-b;});
    var runFound=false;
    if(ranks[4]-ranks[0]===4){
      var uniq={};for(var ri=0;ri<5;ri++)uniq[ranks[ri]]=1;
      if(Object.keys(uniq).length===5){
        pts+=5;
        var allIdx=[0,1,2,3,4];
        combos.push({type:'run',points:5,label:'Run of five',indices:allIdx});
        runFound=true;
      }
    }
    if(!runFound){
      for(var len=4;len>=3&&!runFound;len--){
        for(var s=0;s<=5-len;s++){
          var sub=ranks.slice(s,s+len);
          var uq={};for(var ui=0;ui<sub.length;ui++)uq[sub[ui]]=1;
          if(sub[sub.length-1]-sub[0]===len-1&&Object.keys(uq).length===len){
            var mult=1;
            var runIdx=[];
            for(var rk=0;rk<len;rk++){
              var cnt=0;
              for(var rnk=0;rnk<ranks.length;rnk++)if(ranks[rnk]===sub[rk])cnt++;
              mult*=cnt;
            }
            // Collect the indices of the run cards in all[]
            for(var ai=0;ai<all.length;ai++){
              if(all[ai].rank>=sub[0]&&all[ai].rank<=sub[sub.length-1])runIdx.push(ai);
            }
            var runPts=len*mult;
            pts+=runPts;
            var runLabel = mult>1 ? ('Run of '+len+' × '+mult) : ('Run of '+len);
            combos.push({type:'run',points:runPts,label:runLabel,indices:runIdx});
            runFound=true;break;
          }
        }
      }
    }
    // Flush — 4 or 5 of same suit. In the crib, must be all 5 (hand+starter).
    var hs=hand.map(function(c){return c.suit;});
    if(hs[0]===hs[1]&&hs[1]===hs[2]&&hs[2]===hs[3]){
      if(starter.suit===hs[0]){pts+=5;combos.push({type:'flush',points:5,label:'Flush (five)',indices:[0,1,2,3,4]});}
      else if(!isCrib){pts+=4;combos.push({type:'flush',points:4,label:'Flush (four)',indices:[0,1,2,3]});}
    }
    // Nobs — Jack in hand of same suit as starter scores 1.
    for(var n=0;n<hand.length;n++){
      if(hand[n].rank===10&&hand[n].suit===starter.suit){
        pts+=1;combos.push({type:'nobs',points:1,label:'His Nobs',indices:[n,4]});
        break;
      }
    }
    return{total:pts,combos:combos};
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
    // ── PEG BOARD — two tracks stacked on a wood frame ──
    h+='<div style="background:linear-gradient(135deg,#6b4520 0%,#4a2e14 50%,#3a2210 100%);border:1.5px solid rgba(0,0,0,0.6);border-radius:10px;padding:8px 10px;margin-bottom:8px;box-shadow:inset 0 1px 0 rgba(255,220,140,0.15),inset 0 -2px 4px rgba(0,0,0,0.5),0 3px 10px rgba(0,0,0,0.45);">';
    h+=_pegBar('YOU',G.pScore,G.pPrev,'#7ab356');
    h+='<div style="height:4px;"></div>';
    h+=_pegBar('AI',G.aScore,G.aPrev,'#dc8a8a');
    h+='</div>';
    // ── STATUS ROW — phase + round + dealer ──
    var st='';
    if(G.phase==='discard')st='Select 2 for the crib';
    else if(G.phase==='peg')st='The play';
    else if(G.phase==='show')st='Scoring';
    else st='Game Over';
    h+='<div style="display:flex;gap:14px;justify-content:center;align-items:center;padding:4px 4px 8px;flex-wrap:wrap;font-family:DM Mono,monospace;font-size:0.58rem;letter-spacing:0.12em;text-transform:uppercase;">';
    h+='<span style="color:#d4b86a;">'+st+'</span>';
    h+='<span style="color:rgba(232,220,200,0.5);">Round <strong style="color:#e8dcc8;">'+G.roundNum+'</strong></span>';
    h+='<span style="color:rgba(232,220,200,0.5);">Dealer <strong style="color:#d4b86a;font-family:Georgia,serif;font-size:0.9rem;text-transform:none;">'+(G.dealer==='player'?'You':'AI')+'</strong></span>';
    h+='</div>';
    // ── AI HAND ──
    h+='<div style="background:rgba(8,35,22,0.45);border:1px solid rgba(220,138,138,0.25);border-radius:8px;padding:6px 8px;margin-bottom:6px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.04);">';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.55rem;color:rgba(220,138,138,0.85);letter-spacing:0.14em;margin-bottom:4px;text-transform:uppercase;">AI Hand</div>';
    h+='<div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap;min-height:64px;align-items:center;">';
    if(G.phase==='show'||G.phase==='gameover'){
      G.aHand.forEach(function(c){h+=_cardHtml(c,false,false,false,false);});
    }else{
      for(var i=0;i<G.aHand.length;i++){
        var played=G.aPlayed.indexOf(i)>=0;
        h+='<div style="width:46px;height:64px;border-radius:6px;background:'
          +'linear-gradient(135deg,#4A7C35,#2c4d1e);border:2px solid #1a2f12;'
          +'box-shadow:inset 0 1px 0 rgba(255,255,255,0.1),0 2px 4px rgba(0,0,0,0.4);'
          +(played?'opacity:.35;':'')+'"></div>';
      }
    }
    h+='</div></div>';
    // ── STARTER CARD + PEGGING COUNT ──
    if(G.starter){
      h+='<div style="display:flex;gap:8px;justify-content:center;align-items:center;padding:4px 0 6px;">';
      h+='<div style="display:flex;flex-direction:column;align-items:center;gap:2px;">';
      h+='<div style="font-family:DM Mono,monospace;font-size:0.48rem;color:rgba(232,220,200,0.65);letter-spacing:0.18em;text-transform:uppercase;">Starter</div>';
      h+=_cardHtml(G.starter,false,false,false,true);
      h+='</div>';
      // Giant centered count during peg phase
      if(G.phase==='peg'){
        var c=G.playCount;
        var countColor = c===15||c===31 ? '#ffdc70' : c>=21 ? '#ffb060' : '#f5ebd0';
        h+='<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 10px;">';
        h+='<div id="CBcount" style="font-family:Georgia,serif;font-weight:700;font-size:3.2rem;line-height:1;color:'+countColor+';text-shadow:0 2px 8px rgba(0,0,0,0.6),0 0 24px rgba(255,220,140,0.18);">'+c+'</div>';
        h+='<div style="font-family:DM Mono,monospace;font-size:0.5rem;letter-spacing:0.2em;color:rgba(232,220,200,0.55);margin-top:2px;text-transform:uppercase;">of 31</div>';
        h+='</div>';
      }
      h+='</div>';
    }
    // ── PLAY AREA — cards laid down during pegging ──
    if(G.phase==='peg'&&G.playArea.length>0){
      h+='<div style="min-height:52px;display:flex;gap:3px;justify-content:center;align-items:center;flex-wrap:wrap;padding:6px;background:rgba(0,0,0,0.22);border-radius:6px;margin:4px 0;border:1px solid rgba(180,140,70,0.15);">';
      G.playArea.forEach(function(p){h+=_cardHtml(p.card,false,false,false,false,p.who);});
      h+='</div>';
    }
    // ── NARRATION — show phase steps through combos one at a time with card highlights ──
    if(G.phase==='show'&&G.narration){
      h+=_narrationHtml();
    }
    // ── YOUR HAND ──
    h+='<div style="background:rgba(8,35,22,0.45);border:1px solid rgba(122,179,86,0.3);border-radius:8px;padding:6px 8px;margin-top:6px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.04);">';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.55rem;color:rgba(122,179,86,0.95);letter-spacing:0.14em;text-transform:uppercase;">Your Hand</div>';
    if(G.phase==='discard')h+='<div style="font-family:Georgia,serif;font-style:italic;font-size:0.65rem;color:rgba(232,220,200,0.7);">'+(2-G.pSelected.length)+' more for the crib</div>';
    h+='</div>';
    h+='<div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap;min-height:72px;align-items:center;">';
    G.pHand.forEach(function(c,i){
      var isSel=G.pSelected.indexOf(i)>=0;
      var isPlayed=G.pPlayed.indexOf(i)>=0;
      var canPlay=G.phase==='peg'&&!isPlayed&&G.playCount+c.val<=31;
      h+=_cardHtml(c,isSel,isPlayed,canPlay,false,null,i);
    });
    h+='</div></div>';
    // ── ACTION BUTTONS ──
    h+='<div style="display:flex;gap:6px;justify-content:center;padding:8px 0 2px;flex-wrap:wrap;">';
    if(G.phase==='discard'&&G.pSelected.length===2){
      h+='<button class="gb" onclick="_CBD()" style="min-height:44px;padding:10px 22px;font-size:0.8rem;background:rgba(122,179,86,0.2);border-color:rgba(122,179,86,0.6);color:#e8dcc8;">✓ Send to Crib</button>';
    }
    if(G.phase==='peg'){
      var canAny=false;
      for(var ci=0;ci<G.pHand.length;ci++){
        if(G.pPlayed.indexOf(ci)<0&&G.playCount+G.pHand[ci].val<=31){canAny=true;break;}
      }
      if(!canAny&&G.pPlayed.length<4){
        h+='<button class="gb" onclick="_CBGO()" style="min-height:44px;padding:10px 22px;font-size:0.8rem;background:rgba(200,168,75,0.2);border-color:rgba(200,168,75,0.6);color:#e8dcc8;font-family:Georgia,serif;font-style:italic;">Say "Go"</button>';
      }
    }
    h+='</div>';
    pan.innerHTML=h;
  }
  // Show-phase narration. Renders the hand + starter laid out, with the
  // currently-called combo's cards glowing, plus the running callout text.
  function _narrationHtml(){
    var n=G.narration;if(!n)return '';
    var step=n.step;
    var currentCombo = (step>=0 && step<n.combos.length) ? n.combos[step] : null;
    var highlight={};
    if(currentCombo)currentCombo.indices.forEach(function(i){highlight[i]=1;});
    var scorerColor = n.scorer==='player' ? '#7ab356' : '#dc8a8a';
    var h='';
    h+='<div style="background:rgba(0,0,0,0.4);border:1.5px solid '+scorerColor+';border-radius:10px;padding:12px 10px;margin:8px 0;box-shadow:0 2px 12px rgba(0,0,0,0.4);">';
    h+='<div style="text-align:center;font-family:DM Mono,monospace;font-size:0.55rem;letter-spacing:0.16em;color:'+scorerColor+';text-transform:uppercase;margin-bottom:6px;">'+n.label+'</div>';
    // Cards row (hand + starter). Highlight contributing cards.
    h+='<div style="display:flex;gap:5px;justify-content:center;margin-bottom:10px;">';
    var all=n.hand.concat([G.starter]);
    for(var i=0;i<all.length;i++){
      var hl=highlight[i]?1:0;
      var isStarter=(i===4);
      var card=all[i];
      var redCol='#b42a2a', blackCol='#1a1a1a';
      var color=isRed(card)?redCol:blackCol;
      var bdr = hl?'#ffdc70':(isStarter?'#d4b86a':'#c4b998');
      var shadow = hl
        ? 'box-shadow:0 0 0 2px #ffdc70,0 0 18px rgba(255,220,112,0.55);transform:translateY(-6px);'
        : 'box-shadow:inset 0 1px 0 rgba(255,255,255,0.5),0 2px 4px rgba(0,0,0,0.45);';
      h+='<div style="width:46px;height:64px;border-radius:6px;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;font-weight:700;border:2px solid '+bdr+';background:linear-gradient(180deg,#faf3dd,#f0e7c8);color:'+color+';position:relative;font-family:Georgia,serif;transition:transform .25s,box-shadow .25s;'+shadow+'">';
      h+='<span style="font-size:12px;position:absolute;top:2px;left:4px;line-height:1;font-weight:700;">'+RANKS[card.rank]+'</span>';
      h+='<span style="font-size:10px;position:absolute;top:13px;left:5px;line-height:1;">'+_pip(card.suit)+'</span>';
      h+='<span style="font-size:22px;line-height:1;">'+_pip(card.suit)+'</span>';
      h+='</div>';
    }
    h+='</div>';
    // Running callout text
    if(step<0){
      h+='<div style="text-align:center;font-family:Georgia,serif;font-style:italic;font-size:0.9rem;color:#f5ebd0;">Counting…</div>';
    }else if(currentCombo){
      h+='<div style="text-align:center;font-family:Georgia,serif;font-size:1.05rem;color:#f5ebd0;line-height:1.3;">';
      h+='<span style="color:#ffdc70;">'+currentCombo.label+'</span> for <strong style="font-size:1.3em;color:#ffdc70;">'+n.running+'</strong>';
      h+='</div>';
    }else{
      // No combos — 0 pts
      h+='<div style="text-align:center;font-family:Georgia,serif;font-style:italic;font-size:0.9rem;color:rgba(245,235,208,0.7);">No points</div>';
    }
    h+='</div>';
    return h;
  }
  // Horizontal peg bar for one player. Renders a wooden track with 121
  // hole markers, a back peg (outlined, at previous score) and a front peg
  // (solid, at current score). Back peg appears only when it differs from
  // the front — on first score, both share a spot.
  function _pegBar(label, score, prevScore, color){
    var pct = Math.min(100, score/121*100);
    var prevPct = Math.min(100, prevScore/121*100);
    var h='';
    h+='<div style="display:flex;align-items:center;gap:8px;">';
    h+='<div style="flex:0 0 auto;font-family:DM Mono,monospace;font-size:0.52rem;letter-spacing:0.18em;color:'+color+';width:24px;font-weight:700;">'+label+'</div>';
    // Track — subtle gradient on the exposed board surface
    h+='<div style="flex:1;position:relative;height:18px;background:linear-gradient(180deg,#2a1810,#1a0f08);border:1px solid rgba(0,0,0,0.65);border-radius:9px;box-shadow:inset 0 2px 4px rgba(0,0,0,0.65),inset 0 -1px 0 rgba(255,220,140,0.08);">';
    // Hole dots every ~5 points (121/5 ≈ 24 holes) for texture
    for(var m=5;m<=120;m+=5){
      var mpct = m/121*100;
      var isGroup = (m%10===0);
      h+='<div style="position:absolute;top:6px;left:'+mpct+'%;width:3px;height:6px;margin-left:-1.5px;background:rgba(0,0,0,0.55);border-radius:50%;box-shadow:inset 0 1px 1px rgba(0,0,0,0.8);'+(isGroup?'opacity:1;':'opacity:0.55;')+'"></div>';
    }
    // Back peg — hollow, sits at the previous score
    if(prevScore!==score){
      h+='<div style="position:absolute;top:2px;left:'+prevPct+'%;transform:translateX(-50%);width:12px;height:14px;border-radius:6px 6px 4px 4px;background:linear-gradient(180deg,'+color+' 0%,'+_darken(color)+' 100%);border:1px solid rgba(0,0,0,0.5);opacity:0.55;box-shadow:0 1px 2px rgba(0,0,0,0.4);"></div>';
    }
    // Front peg — filled, sits at the current score
    h+='<div style="position:absolute;top:2px;left:'+pct+'%;transform:translateX(-50%);width:12px;height:14px;border-radius:6px 6px 4px 4px;background:linear-gradient(180deg,'+color+' 0%,'+_darken(color)+' 100%);border:1px solid rgba(0,0,0,0.55);box-shadow:0 2px 4px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.35);transition:left .4s cubic-bezier(.2,.9,.35,1);"></div>';
    h+='</div>';
    h+='<div style="flex:0 0 auto;font-family:Georgia,serif;font-size:1rem;font-weight:700;color:#f5ebd0;min-width:32px;text-align:right;text-shadow:0 1px 2px rgba(0,0,0,0.5);">'+score+'</div>';
    h+='</div>';
    return h;
  }
  function _darken(hex){
    // Quick hex shader for the peg gradient foot. Drops ~35% brightness.
    var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    r=Math.max(0,Math.round(r*0.55));g=Math.max(0,Math.round(g*0.55));b=Math.max(0,Math.round(b*0.55));
    return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
  }

  function _cardHtml(c,sel,played,canPlay,isStarter,who,idx){
    var borderCol='#c4b998';
    if(who==='player')borderCol='#7ab356';
    else if(who==='ai')borderCol='#dc8a8a';
    if(sel)borderCol='#ffdc70';
    if(isStarter)borderCol='#d4b86a';
    var redCol='#b42a2a', blackCol='#1a1a1a';
    var color=isRed(c)?redCol:blackCol;
    var style='width:46px;height:64px;border-radius:6px;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;font-weight:700;'
      +'border:2px solid '+borderCol+';'
      +'background:linear-gradient(180deg,#faf3dd 0%,#f0e7c8 100%);'
      +'color:'+color+';position:relative;vertical-align:middle;'
      +'font-family:Georgia,serif;'
      +'box-shadow:inset 0 1px 0 rgba(255,255,255,0.5),0 2px 5px rgba(0,0,0,0.45);';
    if(sel)style+='transform:translateY(-10px);box-shadow:0 0 0 2px #ffdc70,0 6px 14px rgba(255,220,112,0.4);';
    if(played)style+='opacity:.45;';
    if(canPlay)style+='cursor:pointer;transition:transform .14s ease;';
    if(isStarter)style+='box-shadow:0 0 0 2px #d4b86a,0 3px 10px rgba(212,184,106,0.35);';
    var onclick='';
    if(G.phase==='discard'&&!played&&idx!==undefined)onclick='_CBTS('+idx+')';
    else if(G.phase==='peg'&&canPlay&&idx!==undefined)onclick='_CBPC('+idx+')';
    // Rank at top-left, big pip centered, rotated rank at bottom-right.
    return '<div style="'+style+'" '+(onclick?'onclick="'+onclick+'"':'')+'>'
      +'<span style="font-size:12px;position:absolute;top:2px;left:4px;line-height:1;font-weight:700;">'+RANKS[c.rank]+'</span>'
      +'<span style="font-size:10px;position:absolute;top:13px;left:5px;line-height:1;">'+_pip(c.suit)+'</span>'
      +'<span style="font-size:22px;line-height:1;">'+_pip(c.suit)+'</span>'
      +'<span style="font-size:12px;position:absolute;bottom:2px;right:4px;line-height:1;transform:rotate(180deg);transform-origin:center;font-weight:700;">'+RANKS[c.rank]+'</span>'
    +'</div>';
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
    if(aiHasCard){addA(1);sm('AI +1 (you said Go)');}
    else{
      // Both can't play — count resets, last-card point
      var lastWho=G.playArea.length>0?G.playArea[G.playArea.length-1].who:'player';
      if(lastWho==='ai')addA(1);else addP(1);
      sm((lastWho==='ai'?'AI':'You')+' +1 (last card)');
      G.playCount=0;G.playArea=[];G.pPass=false;G.aPass=false;
    }
    if(checkWin())return;
    render();checkPegContinue();
  };

  newGame();
};
})();
