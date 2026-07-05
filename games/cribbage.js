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
  var gen=0; // bumped by newGame so stale timers can't touch a fresh deal
  // …and bumped on game EXIT too — the show-phase narration chain kept firing
  // earns into whatever game came next (2026-07-03 fleet audit)
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){gen++;});

  ms(a,'<span id="CBheader" style="font-family:Georgia,serif;letter-spacing:.06em;">🃏 <strong id="CBp" style="font-size:1.2em;color:#e8dcc8;">0</strong> vs AI <strong id="CBa" style="font-size:1.2em;color:#c47a7a;">0</strong></span>');
  mm(a);
  var pan=document.createElement('div');
  pan.id='CBpan';
  // Felt-table background — signature cribbage visual cue. Layered gradient
  // creates a subtle weave effect over the dark green base.
  // Felt texture: an inline SVG of tiny random dots repeats under the gradient
  // to give the green surface a real-world fabric graininess.
  var _FELT_NOISE="data:image/svg+xml;utf8,"+encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">'
      +'<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3"/>'
      +'<feColorMatrix values="0 0 0 0 0.04  0 0 0 0 0.08  0 0 0 0 0.04  0 0 0 .08 0"/></filter>'
      +'<rect width="100%" height="100%" filter="url(#n)"/>'
    +'</svg>'
  );
  pan.style.cssText='max-width:460px;margin:0 auto;padding:6px 12px 14px;user-select:none;box-sizing:border-box;'
    +'background:'
      +'url("'+_FELT_NOISE+'"),'
      +'radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.06) 0%,transparent 55%),'
      +'radial-gradient(circle at 30% 100%,rgba(0,0,0,0.22) 0%,transparent 60%),'
      +'linear-gradient(135deg,#0f5c35 0%,#0b4d2c 55%,#083d22 100%);'
    +'background-size:180px 180px, auto, auto, auto;'
    +'border-radius:16px;'
    +'border:2px solid #6b4520;'
    +'box-shadow:'
      +'inset 0 0 0 1px rgba(180,140,70,0.25),'
      +'inset 0 0 32px rgba(0,0,0,0.4),'
      +'0 6px 24px rgba(0,0,0,0.55),'
      +'0 1px 0 rgba(255,220,140,0.08);';
  a.appendChild(pan);
  // Style-aware pip — Garden swaps ♠♥♦♣ for 🍄🌸🐝🐦
  function _pip(idx){return (window._cdSuit)?window._cdSuit(idx):SUITS[idx];}
  // mc(a) still runs so downstream code finds the controls container, but
  // we leave it empty — NEW + Style now live inside the pan.
  mc(a);
  // Style-picker repaint hook — _cdPickStyle calls this after a deck switch
  // so the felt repaints with the new pips immediately (2026-07-04).
  window._cdActiveRn=function(){try{render()}catch(e){}};
  window._CBToggleStyle=function(){
    if(typeof window._cdToggleStyle!=='function'){if(window._toast)window._toast('Card styles loading, try again in a sec.');return;}
    var nxt=window._cdToggleStyle();
    var b=document.getElementById('CBstyle');
    if(b)b.textContent='🃏 Style';
    if(typeof render==='function')render();
  };

  function makeDeck(){var d=[];for(var s=0;s<4;s++)for(var r=0;r<13;r++)d.push({rank:r,suit:s,val:VALS[r]});return sh(d);}
  function cstr(c){return RANKS[c.rank]+_pip(c.suit);}
  function isRed(c){return c.suit===1||c.suit===2;}

  function newGame(){
    gen++;
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
  // Pegging banner — pops up briefly announcing FIFTEEN / PAIR / RUN etc.
  var _bannerTimer=null;
  function _showBanner(callouts, pts, color){
    if(!callouts||callouts.length===0)return;
    G.banner={text:callouts.join(' · '),pts:pts,color:color};
    render();
    if(_bannerTimer)clearTimeout(_bannerTimer);
    var _bg=gen;
    _bannerTimer=setTimeout(function(){if(_bg!==gen)return;G.banner=null;render();},1100);
  }
  function dealHand(){
    G.roundNum++;
    G.deck=makeDeck();
    G.pHand=G.deck.splice(0,6);
    G.aHand=G.deck.splice(0,6);
    G.crib=[];G.starter=null;G.pSelected=[];
    G.playArea=[];G.playCount=0;G.pPlayed=[];G.aPlayed=[];
    G.pPass=false;G.aPass=false;G.seqLead=null;G.lastScoreBreakdown='';
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
    if(G.dealer==='player'){
      G.aiThinking=true;render();
      var g=gen;setTimeout(function(){if(g!==gen)return;G.aiThinking=false;aiPeg();},900);
    }else{
      render();
    }
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
    if(G.aiThinking)return; // AI's beat is pending — no out-of-turn dumps
    // Turn gate (2026-07-04 exploit fix): if we played the last card, we may
    // only continue once the AI has said "Go" — fast double-taps were letting
    // players peg PAIR/RUN/FIFTEEN off their own consecutive cards.
    var lw=G.playArea.length>0?G.playArea[G.playArea.length-1].who:null;
    if(lw==='player'&&!G.aPass)return;
    var card=G.pHand[idx];
    if(G.pPlayed.indexOf(idx)>=0)return;
    if(G.playCount+card.val>31)return;
    G.pPlayed.push(idx);
    G.playArea.push({card:card,who:'player'});
    G.playCount+=card.val;
    var r=scorePeg(G.playArea,G.playCount);
    if(r.pts>0){addP(r.pts);sm('+'+r.pts);_e('progress');_showBanner(r.callouts,r.pts,'#7ab356');}
    if(checkWin())return;
    // Own pass clears (we just played); the AI's "Go" persists for the rest
    // of this sequence — the count only rises, so it stays unable anyway.
    G.pPass=false;
    render();
    if(G.playCount===31){
      var g=gen;
      setTimeout(function(){if(g!==gen)return;G.playCount=0;G.playArea=[];G.pPass=false;G.aPass=false;G.seqLead='ai';render();checkPegContinue();},800);
      return;
    }
    checkPegContinue();
  }
  function canPlaySide(hand,played){
    for(var i=0;i<hand.length;i++){
      if(played.indexOf(i)>=0)continue;
      if(G.playCount+hand[i].val<=31)return true;
    }
    return false;
  }
  function seqEnd(){
    // Both sides stuck under 31 — whoever played the LAST card pegs 1 for the Go.
    var lastWho=G.playArea.length>0?G.playArea[G.playArea.length-1].who:'player';
    if(lastWho==='ai')addA(1);else addP(1);
    sm((lastWho==='ai'?'AI':'You')+' +1 (Go)');
    G.seqLead=lastWho==='ai'?'player':'ai';
    G.playCount=0;G.playArea=[];G.pPass=false;G.aPass=false;
    if(checkWin())return;
    render();checkPegContinue();
  }
  function aiPeg(){
    if(G.phase!=='peg')return;
    var avail=[];
    for(var i=0;i<G.aHand.length;i++){
      if(G.aPlayed.indexOf(i)>=0)continue;
      if(G.playCount+G.aHand[i].val<=31)avail.push(i);
    }
    if(avail.length===0){
      // AI can't play — say "Go". No point yet: the go point goes to whoever
      // plays the LAST card of the sequence, once both sides are stuck.
      G.aPass=true;
      if(canPlaySide(G.pHand,G.pPlayed)){
        sm('AI says "Go" — keep playing');
        render();
        // Player's turn (no auto-advance — wait for player card tap)
      }else{
        seqEnd();
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
    var r=scorePeg(G.playArea,G.playCount);
    if(r.pts>0){addA(r.pts);sm('AI +'+r.pts);_showBanner(r.callouts,r.pts,'#dc8a8a');}
    if(checkWin())return;
    G.aPass=false;
    if(G.playCount===31){
      var g31=gen;
      setTimeout(function(){if(g31!==gen)return;G.playCount=0;G.playArea=[];G.pPass=false;G.aPass=false;G.seqLead='player';render();checkPegContinue();},800);
      return;
    }
    render();checkPegContinue();
  }
  function checkPegContinue(){
    if(G.pPlayed.length>=4&&G.aPlayed.length>=4){
      // Last card of the hand pegs 1 — unless the sequence already settled
      // via 31 or a Go (playArea was reset, the point is already awarded).
      if(G.playArea.length>0){
        var lastWho=G.playArea[G.playArea.length-1].who;
        if(lastWho==='player')addP(1);else addA(1);
        sm((lastWho==='player'?'You':'AI')+' +1 (last card)');
        if(checkWin())return;
      }
      var gs=gen;setTimeout(function(){if(gs===gen)showPhase();},900);return;
    }
    // If neither side can add a card under 31, settle the sequence now.
    if(!canPlaySide(G.pHand,G.pPlayed)&&!canPlaySide(G.aHand,G.aPlayed)){seqEnd();return;}
    // Turn order based on last card + passes, not brittle parity math
    var lastWho=G.playArea.length>0?G.playArea[G.playArea.length-1].who:null;
    var isPlayerNext;
    if(G.aPass&&!G.pPass)isPlayerNext=true;       // AI passed, player continues
    else if(G.pPass&&!G.aPass)isPlayerNext=false; // player passed, AI continues
    else if(lastWho==='player')isPlayerNext=false; // player just played, AI's turn
    else if(lastWho==='ai')isPlayerNext=true;     // AI just played, player's turn
    else if(G.seqLead)isPlayerNext=(G.seqLead==='player'); // fresh sequence after a Go/31: opponent of last-card player leads
    else isPlayerNext=(G.dealer==='ai');            // first sequence: non-dealer leads
    if(!isPlayerNext){
      if(G.aiThinking)return; // an AI beat is already scheduled
      // AI "thinking" beat — 800-1200ms random so it feels like a human deciding
      // rather than an instant robot. Indicator shows in the render.
      G.aiThinking=true;render();
      var delay=850+Math.floor(Math.random()*350);
      var g=gen;
      setTimeout(function(){if(g!==gen)return;G.aiThinking=false;aiPeg();},delay);
    }
  }
  function scorePeg(area,count){
    // Returns {pts, callouts:[]} so the banner can name what happened.
    var pts=0, callouts=[];
    if(count===15){pts+=2;callouts.push('FIFTEEN');}
    if(count===31){pts+=2;callouts.push('THIRTY-ONE');}
    // Pairs / pair royal / double pair royal — tail match counts.
    if(area.length>=2){
      var last=area[area.length-1].card, prev=area[area.length-2].card;
      if(last.rank===prev.rank){
        if(area.length>=4 && area[area.length-3].card.rank===last.rank && area[area.length-4].card.rank===last.rank){
          pts+=12;callouts.push('DOUBLE PAIR ROYAL');
        }else if(area.length>=3 && area[area.length-3].card.rank===last.rank){
          pts+=6;callouts.push('PAIR ROYAL');
        }else{
          pts+=2;callouts.push('PAIR');
        }
      }
    }
    // Runs — longest tail that forms a consecutive run when sorted, min 3.
    var cards=area.map(function(p){return p.card;});
    for(var n=Math.min(cards.length,7);n>=3;n--){
      var tail=cards.slice(cards.length-n);
      var ranks=tail.map(function(c){return c.rank;}).sort(function(a,b){return a-b;});
      var ok=true;
      for(var i=1;i<ranks.length;i++){
        if(ranks[i]!==ranks[i-1]+1){ok=false;break;}
      }
      if(ok){pts+=n;callouts.push('RUN OF '+n);break;}
    }
    return {pts:pts,callouts:callouts};
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
        var _dg=gen;
        setTimeout(function(){
          if(_dg!==gen)return; // exited mid-pause — don't deal into a dead pan
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
        var _zg=gen;
        setTimeout(function(){
          // Gen guard, not just phase — exit leaves phase as 'show', and an
          // unguarded narrate() here re-captured a FRESH gen so the whole
          // chain (incl. _e earns) kept firing post-exit (2026-07-04)
          if(_zg!==gen)return;
          if(G.phase!=='show')return;
          narrate(whoIdx+1);
        },900);
        return;
      }
      var _ng=gen;
      function stepCombo(i){
        if(_ng!==gen)return; // exit/new-game killed this narration chain (2026-07-04)
        if(G.phase!=='show'||!G.narration)return;
        G.narration.step=i;
        G.narration.running += result.combos[i].points;
        // Credit this combo to the scoring side so the peg advances live.
        if(scorer==='player')addP(result.combos[i].points);
        else addA(result.combos[i].points);
        _play('tap');
        render();
        if(i+1<result.combos.length){
          setTimeout(function(){if(_ng!==gen)return;stepCombo(i+1)},720);
        }else{
          // Held-beat on the final combo so the total settles.
          // Earn only on the PLAYER's scored hands (incl. their crib) —
          // the AI's big hands shouldn't pay the player.
          if(scorer==='player'){
            if(result.total>=24)_e('progress');
            _e('milestone');
          }
          if(checkWin())return;
          setTimeout(function(){if(_ng!==gen)return;narrate(whoIdx+1)},1200);
        }
      }
      setTimeout(function(){if(_ng!==gen)return;stepCombo(0)},600);
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
    // Runs — find the consecutive stretch of UNIQUE ranks (min 3) and multiply
    // by duplicate counts: double run of 4 = 8, double-double run = 12,
    // triple run = 9. The old sliding-window-with-duplicates approach scored
    // 2-3-3-4-5 as 6 (should be 8) and 3-3-4-4-5 as 0 (should be 12).
    var cntByRank={},uniqRanks=[];
    for(var ri=0;ri<5;ri++){
      if(cntByRank[ranks[ri]])cntByRank[ranks[ri]]++;
      else{cntByRank[ranks[ri]]=1;uniqRanks.push(ranks[ri]);}
    }
    for(var s=0;s<uniqRanks.length;s++){
      var e=s;
      while(e+1<uniqRanks.length&&uniqRanks[e+1]===uniqRanks[e]+1)e++;
      var runLen=e-s+1;
      if(runLen>=3){
        var mult=1,runIdx=[];
        for(var rk=s;rk<=e;rk++)mult*=cntByRank[uniqRanks[rk]];
        for(var ai=0;ai<all.length;ai++){
          if(all[ai].rank>=uniqRanks[s]&&all[ai].rank<=uniqRanks[e])runIdx.push(ai);
        }
        var runPts=runLen*mult;
        pts+=runPts;
        var runLabel=runLen===5?'Run of five':(mult>1?('Run of '+runLen+' × '+mult):('Run of '+runLen));
        combos.push({type:'run',points:runPts,label:runLabel,indices:runIdx});
        break; // two disjoint runs of 3+ can't fit in five cards
      }
      s=e;
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
    if(G.pScore>=121){
      G.phase='gameover';render();_e('game_win');_playWin();_sr('cribbage',{w:true,s:G.pScore});
      var skunk=G.aScore<91;if(skunk)_e('milestone');
      sm(skunk?'🃏 SKUNK WIN!':'🃏 You win!');
      if(window._lwGameEnd)window._lwGameEnd({won:true,
        title:skunk?'🃏 SKUNK WIN!':'You pegged out!',
        line:G.pScore+' to '+G.aScore+' · '+G.roundNum+' rounds',
        sub:skunk?'the AI never crossed 91':null,
        retry:function(){if(window._CBN)window._CBN();},retryLabel:'↻ NEW MATCH',viewLabel:'view the table',delay:900});
      return true;
    }
    if(G.aScore>=121){
      G.phase='gameover';render();_e('game_loss');_play('lose');_sr('cribbage',{w:false,s:G.pScore});
      sm('Garden resting...');
      var pskunk=G.pScore<91;
      if(window._lwGameEnd)window._lwGameEnd({won:false,
        title:pskunk?'Skunked...':'AI pegged out',
        line:G.pScore+' to '+G.aScore+' · '+G.roundNum+' rounds',
        sub:pskunk?'you never crossed 91':(121-G.pScore)+' short of the finish',
        retry:function(){if(window._CBN)window._CBN();},retryLabel:'↻ NEW MATCH',viewLabel:'view the table',delay:900});
      return true;
    }
    return false;
  }
  function render(){
    var ps=document.getElementById('CBp');if(ps)ps.textContent=G.pScore;
    var as=document.getElementById('CBa');if(as)as.textContent=G.aScore;
    var h='';
    // ── CONTROLS BAR — top right, unobtrusive ──
    var cbStyleName = (window._cdStyleLabel && typeof window._cdStyle==='function') ? window._cdStyleLabel(window._cdStyle()) : 'Floral';
    h+='<div style="display:flex;justify-content:flex-end;align-items:center;gap:6px;margin-bottom:6px;">';
    h+='<button class="gb" onclick="_CBToggleStyle()" title="Cycle card style" style="display:inline-flex;align-items:center;gap:6px;min-height:48px;padding:8px 14px;font-size:0.7rem;background:linear-gradient(180deg,rgba(180,140,70,0.25),rgba(120,90,40,0.35));border:1px solid rgba(220,180,120,0.45);color:#f5ebd0;font-family:Georgia,serif;font-style:italic;box-shadow:inset 0 1px 0 rgba(255,255,255,0.12),0 2px 5px rgba(0,0,0,0.5);">';
    h+='<img src="assets/decks/floral/suit-spade.png" alt="" onerror="this.style.display=\'none\';" style="width:18px;height:18px;object-fit:contain;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.7));">';
    h+='<span style="color:rgba(232,220,200,0.6);font-style:normal;font-family:DM Mono,monospace;font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;margin-right:2px;">Deck</span>';
    h+='<span>'+cbStyleName+'</span>';
    h+='</button>';
    h+='<button class="gb" onclick="_CBN()" title="New game" style="display:inline-flex;align-items:center;gap:5px;min-height:48px;padding:8px 14px;font-size:0.7rem;background:linear-gradient(180deg,rgba(122,179,86,0.3),rgba(74,124,53,0.4));border:1px solid rgba(122,179,86,0.55);color:#f5ebd0;font-family:Georgia,serif;box-shadow:inset 0 1px 0 rgba(255,255,255,0.12),0 2px 5px rgba(0,0,0,0.5);">↻ New Game</button>';
    h+='</div>';
    // ── PEG BOARD — wood frame with two felt tracks ──
    h+='<div style="position:relative;background:'
      +'repeating-linear-gradient(92deg,rgba(0,0,0,0.12) 0 1px,transparent 1px 7px),'
      +'repeating-linear-gradient(88deg,rgba(255,220,140,0.05) 0 2px,transparent 2px 11px),'
      +'linear-gradient(135deg,#7a4f25 0%,#5a3818 50%,#3e2410 100%);'
      +'border:2px solid #2a1808;border-radius:12px;padding:9px 10px;margin-bottom:10px;'
      +'box-shadow:'
        +'inset 0 0 0 1px rgba(180,140,70,0.35),'
        +'inset 0 1px 0 rgba(255,220,140,0.22),'
        +'inset 0 -2px 6px rgba(0,0,0,0.55),'
        +'0 4px 14px rgba(0,0,0,0.5);">';
    h+=_pegBar('YOU',G.pScore,G.pPrev,'#7ab356');
    h+='<div style="height:5px;"></div>';
    h+=_pegBar('AI',G.aScore,G.aPrev,'#dc8a8a');
    h+='</div>';
    // ── STATUS ROW — phase + round + dealer chip ──
    var st='';
    if(G.phase==='discard')st='Select 2 for the crib';
    else if(G.phase==='peg')st='The play';
    else if(G.phase==='show')st='Scoring';
    else st='Game Over';
    h+='<div style="display:flex;gap:12px;justify-content:center;align-items:center;padding:4px 4px 10px;flex-wrap:wrap;font-family:DM Mono,monospace;font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;">';
    h+='<span style="color:#ffdc70;">'+st+'</span>';
    h+='<span style="color:rgba(232,220,200,0.5);">Round <strong style="color:#e8dcc8;">'+G.roundNum+'</strong></span>';
    // Dealer chip — the classic brass "D" token
    h+='<span style="display:inline-flex;align-items:center;gap:6px;color:rgba(232,220,200,0.5);">Dealer'
      +'<span title="Dealer" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;'
        +'background:radial-gradient(circle at 35% 30%,#fff4c2 0%,#d4b86a 40%,#8b6a20 100%);'
        +'border:1.5px solid #5a4010;'
        +'font-family:Georgia,serif;font-size:0.78rem;font-weight:700;color:#3a2a08;'
        +'text-shadow:0 1px 0 rgba(255,255,255,0.4);'
        +'box-shadow:inset 0 1px 0 rgba(255,255,255,0.5),0 2px 4px rgba(0,0,0,0.5);letter-spacing:0;">'
        +(G.dealer==='player'?'Y':'A')
      +'</span>'
    +'</span>';
    h+='</div>';
    // ── AI HAND ──
    h+='<div style="background:rgba(8,35,22,0.45);border:1px solid rgba(220,138,138,0.25);border-radius:8px;padding:6px 8px;margin-bottom:6px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.04);">';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.7rem;color:rgba(220,138,138,0.85);letter-spacing:0.14em;text-transform:uppercase;">AI Hand</div>';
    if(G.aiThinking){
      h+='<div style="font-family:Georgia,serif;font-style:italic;font-size:0.7rem;color:#ffdc70;animation:cbThink 1.2s ease-in-out infinite;">Thinking…</div>';
    }
    h+='</div>';
    h+='<div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap;min-height:64px;align-items:center;">';
    if(G.phase==='show'||G.phase==='gameover'){
      G.aHand.forEach(function(c){h+=_cardHtml(c,false,false,false,false);});
    }else{
      for(var i=0;i<G.aHand.length;i++){
        var played=G.aPlayed.indexOf(i)>=0;
        h+='<div style="width:48px;height:66px;border-radius:6px;background:'
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
      h+='<div style="font-family:DM Mono,monospace;font-size:0.7rem;color:rgba(232,220,200,0.65);letter-spacing:0.18em;text-transform:uppercase;">Starter</div>';
      h+=_cardHtml(G.starter,false,false,false,true);
      h+='</div>';
      // Giant centered count during peg phase
      if(G.phase==='peg'){
        var c=G.playCount;
        var countColor = c===15||c===31 ? '#ffdc70' : c>=21 ? '#ffb060' : '#f5ebd0';
        h+='<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 10px;">';
        h+='<div id="CBcount" style="font-family:Georgia,serif;font-weight:700;font-size:3.2rem;line-height:1;color:'+countColor+';text-shadow:0 2px 8px rgba(0,0,0,0.6),0 0 24px rgba(255,220,140,0.18);">'+c+'</div>';
        h+='<div style="font-family:DM Mono,monospace;font-size:0.7rem;letter-spacing:0.2em;color:rgba(232,220,200,0.55);margin-top:2px;text-transform:uppercase;">of 31</div>';
        h+='</div>';
      }
      h+='</div>';
    }
    // ── PLAY AREA — cards laid down during pegging ──
    if(G.phase==='peg'&&G.playArea.length>0){
      h+='<div style="min-height:72px;display:flex;gap:2px;justify-content:center;align-items:center;flex-wrap:wrap;padding:10px 8px;'
        +'background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.4) 100%);'
        +'border-radius:8px;margin:6px 0;'
        +'border:1px solid rgba(0,0,0,0.5);'
        +'box-shadow:inset 0 2px 8px rgba(0,0,0,0.55);position:relative;">';
      G.playArea.forEach(function(p,i){
        // Lay played cards with a tiny alternating tilt so the pile reads as
        // physical cards dropped on a table, not sterile grid cells.
        var tilt = ((i*53)%9 - 4) * 0.8; // pseudo-random -3.2° to +3.2°
        h+='<div style="display:inline-block;transform:rotate('+tilt.toFixed(2)+'deg);margin:0 -2px;">';
        h+=_cardHtml(p.card,false,false,false,false,p.who);
        h+='</div>';
      });
      // Floating banner announcing FIFTEEN / PAIR / RUN etc when a peg score fires.
      if(G.banner){
        h+='<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);padding:6px 16px;background:linear-gradient(180deg,'+G.banner.color+',#0a0a0a);border:1.5px solid '+G.banner.color+';border-radius:6px;font-family:Georgia,serif;font-weight:700;font-size:0.85rem;color:#fff8e0;letter-spacing:0.1em;text-shadow:0 1px 2px rgba(0,0,0,0.7);box-shadow:0 4px 14px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.2);white-space:nowrap;animation:cbBanner .3s cubic-bezier(.2,1.6,.3,1) both;z-index:4;">'
          +G.banner.text+' <span style="color:#ffdc70;">+'+G.banner.pts+'</span>'
        +'</div>';
      }
      h+='</div>';
    }
    // ── NARRATION — show phase steps through combos one at a time with card highlights ──
    if(G.phase==='show'&&G.narration){
      h+=_narrationHtml();
    }
    // ── YOUR HAND ──
    h+='<div style="background:rgba(8,35,22,0.45);border:1px solid rgba(122,179,86,0.3);border-radius:8px;padding:6px 8px;margin-top:6px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.04);">';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.7rem;color:rgba(122,179,86,0.95);letter-spacing:0.14em;text-transform:uppercase;">Your Hand</div>';
    if(G.phase==='discard')h+='<div style="font-family:Georgia,serif;font-style:italic;font-size:0.7rem;color:rgba(232,220,200,0.7);">'+(2-G.pSelected.length)+' more for the crib</div>';
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
      h+='<button class="gb" onclick="_CBD()" style="min-height:48px;padding:10px 22px;font-size:0.8rem;background:rgba(122,179,86,0.2);border-color:rgba(122,179,86,0.6);color:#e8dcc8;">✓ Send to Crib</button>';
    }
    if(G.phase==='peg'){
      var canAny=false;
      for(var ci=0;ci<G.pHand.length;ci++){
        if(G.pPlayed.indexOf(ci)<0&&G.playCount+G.pHand[ci].val<=31){canAny=true;break;}
      }
      if(!canAny&&!G.pPass&&G.pPlayed.length<4){
        h+='<button class="gb" onclick="_CBGO()" style="min-height:48px;padding:10px 22px;font-size:0.8rem;background:rgba(200,168,75,0.2);border-color:rgba(200,168,75,0.6);color:#e8dcc8;font-family:Georgia,serif;font-style:italic;">Say "Go"</button>';
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
    h+='<div style="text-align:center;font-family:DM Mono,monospace;font-size:0.7rem;letter-spacing:0.16em;color:'+scorerColor+';text-transform:uppercase;margin-bottom:6px;">'+n.label+'</div>';
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
      h+='<div style="width:48px;height:66px;border-radius:6px;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;font-weight:700;border:2px solid '+bdr+';background:linear-gradient(180deg,#faf3dd,#f0e7c8);color:'+color+';position:relative;font-family:Georgia,serif;transition:transform .25s,box-shadow .25s;'+shadow+'">';
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
    h+='<div style="flex:0 0 auto;font-family:DM Mono,monospace;font-size:0.7rem;letter-spacing:0.18em;color:'+color+';width:34px;font-weight:700;">'+label+'</div>';
    // Track — subtle gradient on the exposed board surface
    h+='<div style="flex:1;position:relative;height:18px;background:linear-gradient(180deg,#2a1810,#1a0f08);border:1px solid rgba(0,0,0,0.65);border-radius:9px;box-shadow:inset 0 2px 4px rgba(0,0,0,0.65),inset 0 -1px 0 rgba(255,220,140,0.08);">';
    // Hole dots every ~5 points (121/5 ≈ 24 holes) for texture
    for(var m=5;m<=120;m+=5){
      var mpct = m/121*100;
      var isGroup = (m%10===0);
      h+='<div style="position:absolute;top:6px;left:'+mpct+'%;width:3px;height:6px;margin-left:-1.5px;background:rgba(0,0,0,0.55);border-radius:50%;box-shadow:inset 0 1px 1px rgba(0,0,0,0.8);'+(isGroup?'opacity:1;':'opacity:0.55;')+'"></div>';
    }
    // Back peg — at previous score, dimmer and slightly smaller so the front
    // peg reads as the leader visually.
    if(prevScore!==score){
      h+='<div style="position:absolute;top:2px;left:'+prevPct+'%;transform:translateX(-50%);width:11px;height:13px;border-radius:50% 50% 4px 4px;background:linear-gradient(180deg,'+color+' 0%,'+_darken(color)+' 100%);border:1px solid rgba(0,0,0,0.45);opacity:0.5;box-shadow:0 2px 3px rgba(0,0,0,0.35);"></div>';
    }
    // Front peg — filled, gradient, brass-like top highlight. Sits at current score.
    h+='<div class="cb-peg" style="position:absolute;top:1px;left:'+pct+'%;transform:translateX(-50%);width:13px;height:15px;border-radius:50% 50% 4px 4px;background:'
      +'radial-gradient(ellipse at 50% 20%,rgba(255,255,255,0.6) 0%,rgba(255,255,255,0) 40%),'
      +'linear-gradient(180deg,'+color+' 0%,'+_darken(color)+' 100%);'
      +'border:1px solid rgba(0,0,0,0.6);'
      +'box-shadow:0 3px 5px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.5),0 0 10px '+color+'55;'
      +'transition:left .45s cubic-bezier(.2,.9,.35,1);"></div>';
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
    var style='width:48px;height:66px;border-radius:6px;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;font-weight:700;'
      +'border:2px solid '+borderCol+';'
      +'background:linear-gradient(180deg,#faf3dd 0%,#f0e7c8 100%);'
      +'color:'+color+';position:relative;vertical-align:middle;'
      +'font-family:Georgia,serif;'
      +'box-shadow:inset 0 1px 0 rgba(255,255,255,0.6),0 3px 6px rgba(0,0,0,0.5),0 1px 0 rgba(0,0,0,0.3);'
      +'transition:transform .16s cubic-bezier(.2,1.4,.3,1),box-shadow .16s ease;';
    if(sel)style+='transform:translateY(-12px) rotate(-2deg);box-shadow:0 0 0 2px #ffdc70,0 10px 18px rgba(255,220,112,0.45),0 0 22px rgba(255,220,112,0.25);';
    if(played)style+='opacity:.4;filter:saturate(0.5);';
    if(canPlay)style+='cursor:pointer;';
    if(isStarter)style+='box-shadow:0 0 0 2px #d4b86a,0 4px 12px rgba(212,184,106,0.4),inset 0 1px 0 rgba(255,255,255,0.55);';
    var onclick='';
    if(G.phase==='discard'&&!played&&idx!==undefined)onclick='_CBTS('+idx+')';
    else if(G.phase==='peg'&&canPlay&&idx!==undefined)onclick='_CBPC('+idx+')';
    // Who-chip on pile cards — colorblind-safe Y/A tag so border tint isn't
    // the only signal for who played what (2026-07-04 fleet standard).
    var whoTag='';
    if(who==='player')whoTag='<span title="You" style="position:absolute;bottom:2px;left:3px;font-size:10px;line-height:1;font-weight:700;font-family:DM Mono,monospace;color:#fff8e0;background:#4a7c35;border-radius:3px;padding:1px 3px;">Y</span>';
    else if(who==='ai')whoTag='<span title="AI" style="position:absolute;bottom:2px;left:3px;font-size:10px;line-height:1;font-weight:700;font-family:DM Mono,monospace;color:#fff8e0;background:#a04848;border-radius:3px;padding:1px 3px;">A</span>';
    // Rank at top-left, big pip centered, rotated rank at bottom-right.
    return '<div style="'+style+'" '+(onclick?'onclick="'+onclick+'"':'')+'>'
      +'<span style="font-size:12px;position:absolute;top:2px;left:4px;line-height:1;font-weight:700;">'+RANKS[c.rank]+'</span>'
      +'<span style="font-size:10px;position:absolute;top:13px;left:5px;line-height:1;">'+_pip(c.suit)+'</span>'
      +'<span style="font-size:22px;line-height:1;">'+_pip(c.suit)+'</span>'
      +'<span style="font-size:12px;position:absolute;bottom:2px;right:4px;line-height:1;transform:rotate(180deg);transform-origin:center;font-weight:700;">'+RANKS[c.rank]+'</span>'
      +whoTag
    +'</div>';
  }

  window._CBN=newGame;
  window._CBTS=toggleSelect;
  window._CBD=confirmDiscard;
  window._CBPC=playCard;
  window._CBGO=function(){
    if(G.phase!=='peg'||G.pPass)return;
    // Saying Go is only legal when you truly can't play (must play if able).
    if(canPlaySide(G.pHand,G.pPlayed)){sm('You have a playable card');return;}
    G.pPass=true;
    if(canPlaySide(G.aHand,G.aPlayed)){
      // AI keeps playing; the go point lands at sequence end via seqEnd().
      sm('You say "Go" — AI plays on');
      render();checkPegContinue();
    }else{
      seqEnd();
    }
  };

  newGame();
};
})();
