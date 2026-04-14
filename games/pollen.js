// ═══ MASTER POLLINATOR — Splendor-style engine builder ═══
// Collect pollen tokens, grow plant cards that produce permanent pollen,
// attract pollinators. First to 15 Growth Points wins. Rebranded from
// "Queen Bee" / "Pollen" since the game stands on its own and we're
// building toward full custom art + expansions.
//
// Art roadmap: assets/games/masterpollinator/ holds per-card art.
// Names/requirements are stable so art can drop in without code changes.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr,sh=G.sh,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

window._gameFns = window._gameFns || {};
window._gameFns.pollen = function PN(a){
  var COLORS=['green','rose','blue','amber','spore'];
  var COLOR_HEX={green:'#7ab356',rose:'#c47a7a',blue:'#5b9bd5',amber:'#c8a84b',spore:'#e8dcc8',gold:'#ffd700'};
  var TIER_ICONS=['🌱','🌿','🌳'];
  var TIER_NAMES=['Seedling','Sapling','Ancient'];
  // Expanded pollinator pool — 14 total; 5 show each game so the mix
  // varies noticeably between runs. Each pollinator rewards 3 GP and
  // requires production (not tokens) to attract.
  var ALL_POLLINATORS=[
    {name:'Monarch',     icon:'🦋', req:{green:3,blue:3},   gp:3},
    {name:'Honeybee',    icon:'🐝', req:{rose:3,amber:3},   gp:3},
    {name:'Hummingbird', icon:'🐦', req:{blue:3,spore:3},   gp:3},
    {name:'Luna Moth',   icon:'🌙', req:{green:3,rose:3},   gp:3},
    {name:'Bumblebee',   icon:'🐝', req:{amber:3,spore:3},  gp:3},
    {name:'Dragonfly',   icon:'🜸', req:{green:4,blue:2},   gp:3},
    {name:'Firefly',     icon:'✨', req:{amber:4,green:2},  gp:3},
    {name:'Scarab',      icon:'🪲', req:{spore:4,rose:2},   gp:3},
    {name:'Swallowtail', icon:'🦋', req:{rose:4,blue:2},    gp:3},
    {name:'Orchid Bee',  icon:'🐝', req:{green:2,rose:2,blue:2}, gp:3},
    {name:'Sphinx Moth', icon:'🌙', req:{blue:4,amber:2},   gp:3},
    {name:'Sunbird',     icon:'🐦', req:{amber:3,green:3},  gp:3},
    {name:'Painted Lady',icon:'🦋', req:{rose:3,spore:3},   gp:3},
    {name:'Jewel Wasp',  icon:'🪲', req:{blue:3,amber:3},   gp:3}
  ];

  var GS=null;

  function shuffle(ar){for(var i=ar.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=ar[i];ar[i]=ar[j];ar[j]=t;}return ar;}
  function totalTok(t){var s=0;for(var i=0;i<COLORS.length;i++)s+=t[COLORS[i]];s+=t.gold||0;return s;}

  function makeCost(avail,total,num){
    var c={},cs=shuffle(avail.slice()).slice(0,num),rem=total;
    for(var i=0;i<cs.length;i++){
      if(i===cs.length-1)c[cs[i]]=rem;
      else{var amt=Math.max(1,Math.floor(Math.random()*(rem-(cs.length-i-1)))+1);
        if(amt>rem-(cs.length-i-1))amt=rem-(cs.length-i-1);
        c[cs[i]]=amt;rem-=amt;}
    }
    return c;
  }
  function generateCards(){
    var cards={tier1:[],tier2:[],tier3:[]},id=0;
    COLORS.forEach(function(col){
      var oth=COLORS.filter(function(c){return c!==col;});
      cards.tier1.push({id:id++,tier:1,gp:0,produces:col,cost:makeCost(oth,2,1)});
      cards.tier1.push({id:id++,tier:1,gp:0,produces:col,cost:makeCost(oth,3,2)});
      cards.tier1.push({id:id++,tier:1,gp:0,produces:col,cost:makeCost(oth,3,1)});
      cards.tier1.push({id:id++,tier:1,gp:0,produces:col,cost:makeCost(oth,4,2)});
      cards.tier1.push({id:id++,tier:1,gp:1,produces:col,cost:makeCost(oth,4,2)});
      cards.tier1.push({id:id++,tier:1,gp:1,produces:col,cost:makeCost(oth,3,2)});
    });
    COLORS.forEach(function(col){
      var oth=COLORS.filter(function(c){return c!==col;});
      cards.tier2.push({id:id++,tier:2,gp:1,produces:col,cost:makeCost(oth,5,2)});
      cards.tier2.push({id:id++,tier:2,gp:2,produces:col,cost:makeCost(oth,5,3)});
      cards.tier2.push({id:id++,tier:2,gp:2,produces:col,cost:makeCost(oth,6,3)});
      cards.tier2.push({id:id++,tier:2,gp:3,produces:col,cost:makeCost(oth,6,3)});
    });
    COLORS.forEach(function(col){
      var oth=COLORS.filter(function(c){return c!==col;});
      cards.tier3.push({id:id++,tier:3,gp:3,produces:col,cost:makeCost(oth,7,2)});
      cards.tier3.push({id:id++,tier:3,gp:4,produces:col,cost:makeCost(oth,8,3)});
      cards.tier3.push({id:id++,tier:3,gp:5,produces:col,cost:makeCost(oth,10,3)});
    });
    return cards;
  }

  function canAfford(who,card){
    var need=0;
    for(var i=0;i<COLORS.length;i++){
      var c=COLORS[i],cc=card.cost[c]||0;
      if(!cc)continue;
      var prod=who.production[c]||0,ft=Math.max(0,cc-prod);
      var have=who.tokens[c]||0,sh=Math.max(0,ft-have);
      need+=sh;
    }
    return{affordable:need<=(who.tokens.gold||0),goldNeeded:need};
  }
  function payForCard(who,card){
    COLORS.forEach(function(c){
      var cc=card.cost[c]||0;if(!cc)return;
      var prod=who.production[c]||0,ft=Math.max(0,cc-prod);
      var fh=Math.min(ft,who.tokens[c]);
      who.tokens[c]-=fh;GS.supply[c]+=fh;
      var rem=ft-fh;
      if(rem>0){who.tokens.gold-=rem;GS.supply.gold+=rem;}
    });
    who.cards.push(card);
    who.production[card.produces]=(who.production[card.produces]||0)+1;
    who.gp+=card.gp;
  }
  function checkPollinators(who){
    GS.pollinators.forEach(function(p){
      if(p.claimedBy)return;
      var ok=true;
      for(var c in p.req)if((who.production[c]||0)<p.req[c]){ok=false;break;}
      if(ok){p.claimedBy=who.id;who.gp+=p.gp;sm(p.icon+' '+p.name+' visits '+who.name+'!');}
    });
  }

  // ─── TOKEN-POOL SCALING BY PLAYER COUNT ──────────────────────────────
  // Traditional Splendor math. Gold is always 5.
  //   2p → 4 of each color
  //   3p → 5 of each color
  //   4p → 7 of each color
  // 1p (solo vs AI) keeps 5 of each for a decent supply-side fight.
  function poolSize(numPlayers){
    if(numPlayers<=1)return 5;
    if(numPlayers===2)return 4;
    if(numPlayers===3)return 5;
    return 7; // 4p
  }
  // Build a fresh seat record.
  function mkSeat(id,name,isAI){
    var s={id:id,name:name,isAI:!!isAI,gp:0,
      tokens:{green:0,rose:0,blue:0,amber:0,spore:0,gold:0},
      cards:[],reserved:[],production:{}};
    COLORS.forEach(function(c){s.production[c]=0;});
    return s;
  }
  // Live alias for code that still reads GS.player — always points to
  // the active seat. Updated whenever activeIdx rotates.
  function setActive(idx){GS.activeIdx=idx;GS.player=GS.players[idx];}

  // ─── SETUP SCREEN ────────────────────────────────────────────────────
  // Shown at game start (and via _PNnew). Pick 1–4 seats, mark each
  // human or AI. Persisted in localStorage so Stephen's preferred
  // config comes back next session.
  function defaultSetup(){
    try{
      var raw=localStorage.getItem('lw_pn_setup');
      if(raw){var s=JSON.parse(raw);if(s&&s.seats&&s.seats.length>=1&&s.seats.length<=4)return s;}
    }catch(e){}
    return{seats:[{name:'You',isAI:false},{name:'AI',isAI:true}]};
  }
  function persistSetup(s){try{localStorage.setItem('lw_pn_setup',JSON.stringify(s));}catch(e){}}
  function showSetup(){
    var cur=defaultSetup();
    var ov=document.getElementById('PNsetupOV');if(ov)ov.remove();
    ov=document.createElement('div');ov.id='PNsetupOV';
    ov.style.cssText='position:fixed;inset:0;z-index:200002;display:flex;align-items:center;justify-content:center;background:rgba(5,8,4,0.92);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);padding:16px;animation:pnFadeIn 0.25s ease;';
    document.body.appendChild(ov);
    _renderSetup(cur);
  }
  function _renderSetup(st){
    var ov=document.getElementById('PNsetupOV');if(!ov)return;
    var h='<div style="max-width:420px;width:100%;background:rgba(15,20,12,0.97);border:1px solid rgba(200,168,75,0.45);border-radius:14px;padding:20px;font-family:DM Mono,monospace;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:1.2rem;letter-spacing:0.16em;color:var(--gold);margin-bottom:4px;">MASTER POLLINATOR</div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.62rem;color:var(--muted);margin-bottom:16px;">1–4 players. Pass-and-play. First to 15 GP wins.</div>';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.6rem;letter-spacing:0.12em;color:var(--sage);margin-bottom:8px;">SEATS</div>';
    for(var i=0;i<st.seats.length;i++){
      var s=st.seats[i];
      h+='<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;background:rgba(26,31,23,0.5);border:1px solid rgba(122,179,86,0.15);border-radius:10px;padding:8px 10px;">';
      h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.85rem;color:var(--cream);width:40px;">P'+(i+1)+'</div>';
      h+='<input type="text" value="'+(s.name||'')+'" oninput="_PNsetName('+i+',this.value)" maxlength="12" style="flex:1;min-width:0;background:rgba(13,16,12,0.7);border:1px solid rgba(122,179,86,0.2);border-radius:6px;color:var(--cream);font-family:DM Mono,monospace;font-size:0.7rem;padding:6px 8px;min-height:40px;">';
      h+='<button class="gb" onclick="_PNsetAI('+i+',false)" style="min-height:40px;padding:6px 10px;font-size:0.58rem;'+(!s.isAI?'background:rgba(122,179,86,0.25);border-color:var(--sage);color:var(--sage);':'')+'">HUMAN</button>';
      h+='<button class="gb" onclick="_PNsetAI('+i+',true)" style="min-height:40px;padding:6px 10px;font-size:0.58rem;'+(s.isAI?'background:rgba(196,122,122,0.22);border-color:#c47a7a;color:#c47a7a;':'')+'">AI</button>';
      if(st.seats.length>1)h+='<button class="gb" onclick="_PNdropSeat('+i+')" style="min-height:40px;padding:6px 8px;font-size:0.55rem;color:var(--muted);">✕</button>';
      h+='</div>';
    }
    if(st.seats.length<4){
      h+='<button class="gb" onclick="_PNaddSeat()" style="width:100%;margin:4px 0 14px;min-height:44px;font-size:0.65rem;letter-spacing:0.08em;">+ ADD SEAT</button>';
    }
    // Pool preview
    var pool=poolSize(st.seats.length);
    h+='<div style="background:rgba(26,31,23,0.5);border-radius:10px;padding:10px 12px;margin:8px 0 14px;font-family:DM Mono,monospace;font-size:0.6rem;line-height:1.7;color:var(--cream);">';
    h+='<div style="color:var(--sage);letter-spacing:0.08em;margin-bottom:2px;">TOKEN POOL · '+st.seats.length+' player'+(st.seats.length===1?'':'s')+'</div>';
    h+='<div>'+pool+' × each color &nbsp;·&nbsp; <span style="color:#ffd700;">5</span> gold</div>';
    h+='</div>';
    h+='<button class="gb" onclick="_PNstartFromSetup()" style="width:100%;min-height:52px;padding:14px;font-size:0.85rem;letter-spacing:0.12em;color:var(--gold);border-color:var(--gold);background:rgba(200,168,75,0.18);">BEGIN</button>';
    h+='</div>';
    ov.innerHTML=h;
    ov.__setup=st;
  }
  window._PNsetName=function(i,v){var ov=document.getElementById('PNsetupOV');if(!ov)return;ov.__setup.seats[i].name=v;};
  window._PNsetAI=function(i,v){var ov=document.getElementById('PNsetupOV');if(!ov)return;ov.__setup.seats[i].isAI=v;_renderSetup(ov.__setup);};
  window._PNaddSeat=function(){var ov=document.getElementById('PNsetupOV');if(!ov)return;if(ov.__setup.seats.length>=4)return;ov.__setup.seats.push({name:'Player '+(ov.__setup.seats.length+1),isAI:false});_renderSetup(ov.__setup);};
  window._PNdropSeat=function(i){var ov=document.getElementById('PNsetupOV');if(!ov)return;if(ov.__setup.seats.length<=1)return;ov.__setup.seats.splice(i,1);_renderSetup(ov.__setup);};
  window._PNstartFromSetup=function(){
    var ov=document.getElementById('PNsetupOV');if(!ov)return;
    var setup=ov.__setup;persistSetup(setup);ov.remove();
    startGame(setup);
  };

  function startGame(setup){
    var all=generateCards();
    var pls=shuffle(ALL_POLLINATORS.slice()).slice(0,5).map(function(p){return{name:p.name,icon:p.icon,req:p.req,gp:p.gp,claimedBy:null};});
    var n=setup.seats.length;
    var pool=poolSize(n);
    var players=[];
    for(var i=0;i<n;i++){
      var s=setup.seats[i];
      players.push(mkSeat(i,s.name||('P'+(i+1)),s.isAI));
    }
    GS={
      turn:0,phase:'player',
      deck1:shuffle(all.tier1.slice()),deck2:shuffle(all.tier2.slice()),deck3:shuffle(all.tier3.slice()),
      market1:[],market2:[],market3:[],
      supply:{green:pool,rose:pool,blue:pool,amber:pool,spore:pool,gold:5},
      pollinators:pls,
      players:players,activeIdx:0,numPlayers:n,
      selectedTokens:[],action:null,
      pendingReturn:null // set when someone needs to return tokens before ending turn
    };
    setActive(0);
    for(var k=0;k<4;k++){
      if(GS.deck1.length)GS.market1.push(GS.deck1.pop());
      if(GS.deck2.length)GS.market2.push(GS.deck2.pop());
      if(GS.deck3.length)GS.market3.push(GS.deck3.pop());
    }
    render();
    // If first seat is AI, kick it off after a beat.
    if(me().isAI)setTimeout(aiTurn,600);
  }
  function me(){return GS.players[GS.activeIdx];}
  function newGame(){showSetup();}

  function collectTokens(cs){
    var who=me();
    cs.forEach(function(c){if(GS.supply[c]>0){GS.supply[c]--;who.tokens[c]++;}});
    // Over-cap? Route through return modal (human) or auto-trim (AI).
    if(totalTok(who.tokens)>10){
      if(who.isAI){autoTrim(who);endTurn();}
      else{showReturnModal(who);return;}
    }else endTurn();
  }
  // Auto-trim for AI: drop highest count first.
  function autoTrim(who){
    while(totalTok(who.tokens)>10){
      var mc=null,mv=0;
      COLORS.forEach(function(c){if(who.tokens[c]>mv){mv=who.tokens[c];mc=c;}});
      if(mc&&who.tokens[mc]>0){who.tokens[mc]--;GS.supply[mc]++;}else break;
    }
  }
  function buyCard(card,mkt,deck){
    var who=me();
    payForCard(who,card);
    for(var i=0;i<mkt.length;i++)if(mkt[i]&&mkt[i].id===card.id){if(deck.length)mkt[i]=deck.pop();else mkt.splice(i,1);break;}
    checkPollinators(who);
    _play('snap');_e('progress');
    endTurn();
  }
  function buyReserved(card){
    var who=me();
    payForCard(who,card);
    for(var i=0;i<who.reserved.length;i++)if(who.reserved[i].id===card.id){who.reserved.splice(i,1);break;}
    checkPollinators(who);
    _play('snap');_e('progress');
    endTurn();
  }
  function reserveCard(card,mkt,deck){
    var who=me();
    if(who.reserved.length>=3){sm('Max 3 reserved');return;}
    for(var i=0;i<mkt.length;i++)if(mkt[i]&&mkt[i].id===card.id){who.reserved.push(card);if(deck.length)mkt[i]=deck.pop();else mkt.splice(i,1);break;}
    if(GS.supply.gold>0){GS.supply.gold--;who.tokens.gold++;}
    _play('tap');
    // Reserving can push you over the cap.
    if(totalTok(who.tokens)>10){
      if(who.isAI){autoTrim(who);endTurn();}
      else{showReturnModal(who);return;}
    }else endTurn();
  }

  // Rotate to next seat. Checks for winners at the end of a FULL round
  // — traditional Splendor rule: once any player hits 15, finish the
  // round so all seats have equal turns, then whoever has the most
  // points wins (ties broken by fewest cards bought).
  function endTurn(){
    GS.turn++;GS.selectedTokens=[];GS.action=null;
    // Mark this seat's "has hit 15" for end-of-round check.
    var current=GS.activeIdx;
    var nextIdx=(current+1)%GS.numPlayers;
    // If we're wrapping back to seat 0, check winners.
    if(nextIdx===0&&GS.players.some(function(p){return p.gp>=15;})){
      return finishGame();
    }
    setActive(nextIdx);
    render();
    var nxt=me();
    if(nxt.isAI){
      GS.phase='ai';render();
      setTimeout(aiTurn,700);
    } else {
      GS.phase='player';
      // Pass-the-phone curtain only when there's more than one human seat.
      if(GS.numPlayers>1&&countHumans()>1)showPassCurtain(nxt);
      render();
    }
  }
  function countHumans(){var n=0;for(var i=0;i<GS.players.length;i++)if(!GS.players[i].isAI)n++;return n;}
  function finishGame(){
    GS.phase='gameover';
    // Winner = highest gp, tie-break on fewer cards.
    var winner=GS.players[0];
    for(var i=1;i<GS.players.length;i++){
      var p=GS.players[i];
      if(p.gp>winner.gp||(p.gp===winner.gp&&p.cards.length<winner.cards.length))winner=p;
    }
    var won=!winner.isAI&&countHumans()>0;
    if(won){_e('game_win');_playWin();}else{_e('game_loss');_play('lose');}
    sm(winner.name+' wins — '+winner.gp+' GP');
    _sr('pollen',{w:won,s:winner.gp,t:GS.turn,n:GS.numPlayers});
    showEndCard(winner,won);
  }
  function aiNeeded(who){
    var n={};COLORS.forEach(function(c){n[c]=0;});
    GS.market1.concat(GS.market2).forEach(function(card){
      if(!card)return;
      for(var c in card.cost){var gap=Math.max(0,(card.cost[c]||0)-(who.production[c]||0)-(who.tokens[c]||0));n[c]+=gap;}
    });
    return n;
  }
  function aiTurn(){
    var who=me();if(!who||!who.isAI)return;
    var best=null,bestGP=-1,bm=null,bd=null;
    [[GS.market3,GS.deck3],[GS.market2,GS.deck2],[GS.market1,GS.deck1]].forEach(function(pr){
      pr[0].forEach(function(c){
        if(!c)return;
        var af=canAfford(who,c);
        if(af.affordable&&c.gp>bestGP){bestGP=c.gp;best=c;bm=pr[0];bd=pr[1];}
      });
    });
    if(best&&bestGP>=0){
      payForCard(who,best);
      for(var i=0;i<bm.length;i++)if(bm[i]&&bm[i].id===best.id){if(bd.length)bm[i]=bd.pop();else bm.splice(i,1);break;}
      checkPollinators(who);
      sm(who.name+' grew '+TIER_NAMES[best.tier-1]+' (+'+best.gp+')');
    }else{
      var needed=aiNeeded(who);
      var avail=COLORS.filter(function(c){return GS.supply[c]>0;});
      avail.sort(function(a,b){return(needed[b]||0)-(needed[a]||0);});
      var got=0;
      for(var i=0;i<avail.length&&got<3;i++){if(GS.supply[avail[i]]>0){GS.supply[avail[i]]--;who.tokens[avail[i]]++;got++;}}
      autoTrim(who);
      sm(who.name+' gathered pollen');
    }
    endTurn();
  }

  // ─── 10-CHIP EXCHANGE MODAL ──────────────────────────────────────────
  // Traditional rule: you can pick up tokens even if it pushes you
  // over 10, but you must finish your turn at ≤10 and the sequence
  // must be legal. Instead of auto-trimming (which strips tactical
  // depth), surface a picker so the player decides which excess to
  // return.
  function showReturnModal(who){
    GS.pendingReturn=who.id;
    var ov=document.getElementById('PNreturnOV');if(ov)ov.remove();
    ov=document.createElement('div');ov.id='PNreturnOV';
    ov.style.cssText='position:fixed;inset:0;z-index:200001;display:flex;align-items:center;justify-content:center;background:rgba(5,8,4,0.88);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);padding:16px;animation:pnFadeIn 0.2s ease;';
    document.body.appendChild(ov);
    _renderReturnModal();
  }
  function _renderReturnModal(){
    var ov=document.getElementById('PNreturnOV');if(!ov)return;
    var who=me();
    var excess=totalTok(who.tokens)-10;
    var h='<div style="max-width:360px;width:100%;background:rgba(15,20,12,0.97);border:1px solid rgba(200,168,75,0.45);border-radius:14px;padding:20px;font-family:DM Mono,monospace;text-align:center;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.75rem;letter-spacing:0.18em;color:var(--muted);">RETURN '+excess+' TOKEN'+(excess===1?'':'S')+'</div>';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:1.4rem;letter-spacing:0.08em;color:var(--gold);margin:4px 0 6px;">'+who.name+'</div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.58rem;color:var(--cream);opacity:0.8;margin-bottom:16px;line-height:1.5;">You\'re at '+totalTok(who.tokens)+'/10. Tap tokens in your pool to return them to supply until you\'re at 10.</div>';
    h+='<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:14px;">';
    COLORS.concat(['gold']).forEach(function(c){
      if((who.tokens[c]||0)<=0)return;
      h+='<button class="gb" onclick="_PNreturnOne(\''+c+'\')" style="min-height:52px;padding:10px 14px;display:inline-flex;align-items:center;gap:6px;">'
        +tokDot(c,18)+' <span style="font-size:0.75rem;">'+who.tokens[c]+'</span></button>';
    });
    h+='</div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.56rem;color:var(--sage);">Total: '+totalTok(who.tokens)+' / 10</div>';
    h+='</div>';
    ov.innerHTML=h;
  }
  window._PNreturnOne=function(c){
    var who=me();
    if((who.tokens[c]||0)<=0)return;
    who.tokens[c]--;GS.supply[c]++;_play('tap');
    if(totalTok(who.tokens)<=10){
      var ov=document.getElementById('PNreturnOV');if(ov)ov.remove();
      GS.pendingReturn=null;
      endTurn();
    } else _renderReturnModal();
  };

  // ─── PASS-THE-PHONE CURTAIN ──────────────────────────────────────────
  // In multi-human games, drop a curtain between turns so the next
  // seat doesn't see the previous player's reserved cards / hand at
  // a glance. Tap to continue.
  function showPassCurtain(nextSeat){
    var ov=document.getElementById('PNpassOV');if(ov)ov.remove();
    ov=document.createElement('div');ov.id='PNpassOV';
    ov.style.cssText='position:fixed;inset:0;z-index:200000;display:flex;align-items:center;justify-content:center;background:rgba(5,8,4,0.96);padding:16px;animation:pnFadeIn 0.25s ease;cursor:pointer;';
    ov.innerHTML=
      '<div style="text-align:center;font-family:DM Mono,monospace;">'
      +'<div style="font-family:Bebas Neue,sans-serif;font-size:0.75rem;letter-spacing:0.18em;color:var(--muted);">PASS TO</div>'
      +'<div style="font-family:Bebas Neue,sans-serif;font-size:2rem;letter-spacing:0.1em;color:var(--gold);margin:8px 0;">'+nextSeat.name+'</div>'
      +'<div style="font-family:DM Mono,monospace;font-size:0.65rem;color:var(--cream);opacity:0.7;margin-bottom:16px;">tap to continue</div>'
      +'<div style="font-size:2.5rem;opacity:0.6;">👆</div>'
      +'</div>';
    ov.addEventListener('click',function(){ov.remove();});
    document.body.appendChild(ov);
  }

  ms(a,'<strong id="PNt">Master Pollinator</strong>');
  mm(a);
  // One-time stylesheet — keeps the animations + card polish scoped
  // to this game without bloating the main stylesheet.
  if(!document.getElementById('pn-style')){
    var st=document.createElement('style');
    st.id='pn-style';
    st.textContent=
      '@keyframes pnFadeIn{from{opacity:0}to{opacity:1}}'
      +'@keyframes pnLift{0%{transform:translateY(40px) scale(0.8);opacity:0;box-shadow:0 4px 12px rgba(0,0,0,0.2)}60%{transform:translateY(-8px) scale(1.04);opacity:1}100%{transform:translateY(0) scale(1)}}'
      +'@keyframes pnCardHover{from{transform:translateY(0)}to{transform:translateY(-3px)}}'
      +'.pn-card{transition:transform 0.18s cubic-bezier(.25,.46,.45,.94), box-shadow 0.18s ease, filter 0.18s ease;}'
      +'.pn-card:hover,.pn-card:active{transform:translateY(-2px) scale(1.03);box-shadow:0 10px 18px rgba(0,0,0,0.45),0 2px 4px rgba(0,0,0,0.25);filter:brightness(1.05);z-index:5;}'
      +'.pn-card.aff{border-color:#7ab356!important;box-shadow:0 0 0 1px rgba(122,179,86,0.45),0 3px 6px rgba(0,0,0,0.25);}'
      +'.pn-card.aff:hover{box-shadow:0 0 0 1px rgba(122,179,86,0.7),0 10px 20px rgba(122,179,86,0.25),0 4px 8px rgba(0,0,0,0.3);}'
      +'.pn-tok{transition:transform 0.15s ease, background 0.15s ease;min-height:40px;}'
      +'.pn-tok:hover{transform:scale(1.08);}'
      +'.pn-tok.sel{box-shadow:inset 0 0 0 2px #7ab356,0 0 10px rgba(122,179,86,0.4);}'
      +'.pn-poll{transition:border-color 0.2s ease, background 0.2s ease;}';
    document.head.appendChild(st);
  }
  var pan=document.createElement('div');pan.id='PNpan';
  pan.style.cssText='max-width:440px;margin:0 auto;padding:6px;user-select:none;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb-new" onclick="_PNnew()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  function tokDot(c,sz){return '<span style="display:inline-block;width:'+sz+'px;height:'+sz+'px;border-radius:50%;background:'+COLOR_HEX[c]+';border:1px solid rgba(0,0,0,0.2);vertical-align:middle;"></span>';}

  function renderCard(card,isReserved){
    var aff=canAfford(me(),card);
    var border=aff.affordable?'2px solid #7ab356':'2px solid #6a6051';
    var bgShade=card.tier===1?'#4a7c35':card.tier===2?'#c8a84b':'#ffd700';
    var h='<div class="pn-card'+(aff.affordable?' aff':'')+'" style="width:72px;height:100px;background:#faf5e4;border-radius:8px;padding:4px;border:'+border+';border-left:4px solid '+bgShade+';display:inline-block;vertical-align:top;margin:3px;position:relative;cursor:pointer;color:#1a1f17;box-shadow:0 2px 4px rgba(0,0,0,0.25);" onclick="_PNtap('+card.id+','+(isReserved?'true':'false')+')">';
    h+='<div style="position:absolute;top:2px;left:4px;font-size:12px;font-weight:800;">'+(card.gp>0?card.gp:'')+'</div>';
    h+='<div style="position:absolute;top:3px;right:4px;">'+tokDot(card.produces,12)+'</div>';
    h+='<div style="text-align:center;font-size:18px;margin-top:20px;">'+TIER_ICONS[card.tier-1]+'</div>';
    h+='<div style="position:absolute;bottom:3px;left:3px;right:3px;display:flex;gap:1px;flex-wrap:wrap;">';
    for(var c in card.cost){for(var i=0;i<card.cost[c];i++)h+=tokDot(c,9);}
    h+='</div></div>';
    return h;
  }

  function showEndCard(winner,humanWon){
    render();
    var card=document.createElement('div');
    card.style.cssText='position:fixed;inset:0;background:rgba(8,10,6,0.88);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:200000;display:flex;align-items:center;justify-content:center;padding:1rem;';
    // Build standings
    var standings=GS.players.slice().sort(function(a,b){if(b.gp!==a.gp)return b.gp-a.gp;return a.cards.length-b.cards.length;});
    var rows='';
    for(var i=0;i<standings.length;i++){
      var p=standings[i];
      var isWin=(p.id===winner.id);
      rows+='<div style="display:flex;justify-content:space-between;padding:6px 8px;background:'+(isWin?'rgba(200,168,75,0.18)':'rgba(26,31,23,0.5)')+';border:1px solid '+(isWin?'rgba(200,168,75,0.45)':'rgba(122,179,86,0.1)')+';border-radius:6px;margin-bottom:4px;font-family:DM Mono,monospace;font-size:0.68rem;">'
        +'<span style="color:'+(isWin?'var(--gold)':'var(--cream)')+';">'+(isWin?'🏆 ':'')+(i+1)+'. '+p.name+(p.isAI?' <span style="color:var(--muted);font-size:0.55rem;">AI</span>':'')+'</span>'
        +'<span style="color:'+(isWin?'var(--gold)':'var(--sage)')+';font-weight:700;">'+p.gp+' GP</span>'
        +'</div>';
    }
    card.innerHTML='<div style="background:linear-gradient(160deg,#1a1f17,#0d100c);border:2px solid '+(humanWon?'rgba(200,168,75,0.5)':'rgba(199,80,80,0.35)')+';border-radius:16px;padding:2rem 1.5rem;max-width:360px;width:100%;text-align:center;box-shadow:0 12px 48px rgba(0,0,0,0.8),0 0 32px '+(humanWon?'rgba(200,168,75,0.25)':'rgba(0,0,0,0.3)')+';">'+
      '<div style="font-size:3rem;margin-bottom:0.5rem;">'+(humanWon?'🌸':'🐝')+'</div>'+
      '<div style="font-family:Bebas Neue,sans-serif;font-size:1.5rem;color:'+(humanWon?'var(--gold)':'var(--cream)')+';letter-spacing:0.12em;margin-bottom:0.6rem;">'+winner.name.toUpperCase()+' WINS</div>'+
      '<div style="text-align:left;margin:14px 0;">'+rows+'</div>'+
      '<div style="font-family:DM Mono,monospace;font-size:0.58rem;color:var(--muted);margin-bottom:14px;">'+GS.turn+' turns played</div>'+
      '<button onclick="this.parentNode.parentNode.remove();_PNnew();" style="padding:12px 28px;font-family:Bebas Neue,sans-serif;font-size:1rem;letter-spacing:0.1em;background:rgba(122,179,86,0.2);border:1.5px solid var(--sage);color:var(--sage);border-radius:10px;cursor:pointer;min-height:48px;">PLAY AGAIN</button>'+
      '</div>';
    document.body.appendChild(card);
  }

  function render(){
    if(!GS||!GS.players)return;
    var h='';
    // Header + scoreboard row
    h+='<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:rgba(26,31,23,0.6);border-radius:8px;margin-bottom:4px;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;color:var(--gold);letter-spacing:2px;">🐝 MASTER POLLINATOR <span style="font-size:0.65rem;color:var(--muted);">T'+GS.turn+'</span></div>';
    h+='</div>';
    // Per-seat scorebar so every player sees their standing at all times.
    h+='<div style="display:grid;grid-template-columns:repeat('+GS.numPlayers+',1fr);gap:3px;margin-bottom:4px;">';
    for(var pi=0;pi<GS.players.length;pi++){
      var p=GS.players[pi];var isActive=(pi===GS.activeIdx);
      var bg=isActive?'rgba(200,168,75,0.22)':'rgba(26,31,23,0.5)';
      var bd=isActive?'var(--gold)':'rgba(122,179,86,0.15)';
      var nameClr=isActive?'var(--gold)':'var(--cream)';
      h+='<div style="background:'+bg+';border:1px solid '+bd+';border-radius:6px;padding:4px 6px;text-align:center;font-family:DM Mono,monospace;">'
        +'<div style="font-size:0.55rem;color:'+nameClr+';letter-spacing:0.05em;word-break:break-word;">'+p.name+(p.isAI?' 🤖':'')+'</div>'
        +'<div style="font-family:Bebas Neue,sans-serif;font-size:0.95rem;color:'+nameClr+';">'+p.gp+'</div>'
        +'</div>';
    }
    h+='</div>';
    var active=me();
    if(GS.phase==='player')h+='<div style="text-align:center;color:var(--sage);font-size:0.7rem;padding:2px;">— '+active.name+"'s turn —</div>";
    else if(GS.phase==='ai')h+='<div style="text-align:center;color:#c47a7a;font-size:0.7rem;padding:2px;">— '+active.name+' thinking —</div>';
    // Pollinators
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.85rem;color:var(--cream);letter-spacing:0.1em;margin:8px 0 4px;">POLLINATORS</div>';
    h+='<div style="display:flex;gap:4px;overflow-x:auto;padding-bottom:3px;">';
    GS.pollinators.forEach(function(p){
      var claimedBy=null;
      if(p.claimedBy!==null&&p.claimedBy!==undefined){
        for(var ci=0;ci<GS.players.length;ci++)if(GS.players[ci].id===p.claimedBy){claimedBy=GS.players[ci];break;}
      }
      var bg,tag='';
      if(claimedBy){
        bg='rgba(200,168,75,0.18);border-color:var(--gold)';
        tag='<div style="font-size:0.45rem;color:var(--gold);margin-top:2px;">'+claimedBy.name+'</div>';
      } else {
        bg='rgba(26,31,23,0.5);border-color:rgba(122,179,86,0.2)';
      }
      h+='<div class="pn-poll" style="min-width:78px;padding:6px;background:'+bg+';border:1px solid;border-radius:8px;text-align:center;font-size:10px;flex-shrink:0;">';
      h+='<div style="font-size:16px;">'+p.icon+'</div><div style="font-weight:700;">'+p.name+'</div>';
      h+='<div style="color:var(--muted);">';
      for(var c in p.req)h+='<span style="color:'+COLOR_HEX[c]+'">'+p.req[c]+'</span> ';
      h+='</div>'+tag+'</div>';
    });
    h+='</div>';
    // Market
    [[3,GS.market3,GS.deck3],[2,GS.market2,GS.deck2],[1,GS.market1,GS.deck1]].forEach(function(t){
      h+='<div style="display:flex;align-items:center;gap:3px;margin:3px 0;">';
      h+='<div style="width:16px;font-family:Bebas Neue,sans-serif;color:var(--muted);text-align:center;font-size:9px;">T'+t[0]+'</div>';
      h+='<div style="flex:1;">';
      t[1].forEach(function(c){if(c)h+=renderCard(c,false);});
      h+='</div>';
      h+='<div style="width:30px;height:44px;background:rgba(26,31,23,0.6);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--muted);">'+t[2].length+'</div>';
      h+='</div>';
    });
    // Supply
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.85rem;color:var(--cream);letter-spacing:0.1em;margin:8px 0 4px;">SUPPLY</div>';
    h+='<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">';
    COLORS.concat(['gold']).forEach(function(c){
      var sel=GS.selectedTokens.indexOf(c)>=0;
      var sty='padding:6px 10px;background:'+(sel?'rgba(122,179,86,0.2)':'rgba(26,31,23,0.6)')+';border:1px solid '+(sel?'#7ab356':'rgba(122,179,86,0.2)')+';border-radius:8px;font-size:12px;min-height:40px;display:inline-flex;align-items:center;gap:4px;cursor:pointer;';
      h+='<div class="pn-tok'+(sel?' sel':'')+'" style="'+sty+'" onclick="_PNsup(\''+c+'\')">'+tokDot(c,14)+' '+GS.supply[c]+'</div>';
    });
    h+='</div>';
    // Active player area — shows whoever's turn it is (hides others'
    // reserved cards, which the pass-curtain also reinforces).
    var meRef=me();
    h+='<div style="background:rgba(26,31,23,0.4);border:1px solid rgba(200,168,75,0.12);border-radius:8px;padding:6px;margin:6px 0;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.85rem;color:var(--gold);letter-spacing:0.1em;">'+meRef.name.toUpperCase()+' · POLLEN ('+totalTok(meRef.tokens)+'/10)</div>';
    h+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin:3px 0;">';
    COLORS.concat(['gold']).forEach(function(c){if(meRef.tokens[c]>0)h+='<span style="font-size:12px;">'+tokDot(c,12)+' '+meRef.tokens[c]+'</span>';});
    h+='</div>';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.8rem;color:var(--cream);letter-spacing:0.1em;">PLANTS</div>';
    h+='<div style="display:flex;gap:2px;flex-wrap:wrap;">';
    COLORS.forEach(function(c){for(var i=0;i<(meRef.production[c]||0);i++)h+=tokDot(c,14);});
    if(meRef.cards.length===0)h+='<span style="font-size:10px;color:var(--muted);">None yet</span>';
    h+='</div>';
    if(meRef.reserved.length>0){
      h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.78rem;color:var(--gold);letter-spacing:0.1em;margin-top:6px;">RESERVED</div>';
      h+='<div>';meRef.reserved.forEach(function(c){h+=renderCard(c,true);});h+='</div>';
    }
    h+='</div>';
    // Actions
    if(GS.phase==='player'){
      h+='<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:4px 0;">';
      h+='<button class="gb" onclick="_PNact(\'collect3\')" style="min-height:44px;padding:8px;background:'+(GS.action==='collect3'?'rgba(122,179,86,0.3)':'')+';">3 DIFF</button>';
      h+='<button class="gb" onclick="_PNact(\'collect2\')" style="min-height:44px;padding:8px;background:'+(GS.action==='collect2'?'rgba(122,179,86,0.3)':'')+';">2 SAME</button>';
      if(GS.selectedTokens.length>0)h+='<button class="gb" onclick="_PNconfirm()" style="min-height:44px;padding:8px;background:rgba(200,168,75,0.2);color:var(--gold);border-color:rgba(200,168,75,0.5);">✓ CONFIRM</button>';
      if(GS.action)h+='<button class="gb" onclick="_PNcancel()" style="min-height:44px;padding:8px;">✕</button>';
      h+='</div>';
    }
    pan.innerHTML=h;
  }

  function findCard(id){
    var all=GS.market1.concat(GS.market2).concat(GS.market3).concat(me().reserved);
    for(var i=0;i<all.length;i++)if(all[i]&&all[i].id===id)return all[i];
    return null;
  }
  function findMD(id){
    for(var i=0;i<GS.market1.length;i++)if(GS.market1[i]&&GS.market1[i].id===id)return{market:GS.market1,deck:GS.deck1};
    for(i=0;i<GS.market2.length;i++)if(GS.market2[i]&&GS.market2[i].id===id)return{market:GS.market2,deck:GS.deck2};
    for(i=0;i<GS.market3.length;i++)if(GS.market3[i]&&GS.market3[i].id===id)return{market:GS.market3,deck:GS.deck3};
    return null;
  }

  window._PNnew=function(){newGame();};
  window._PNtap=function(id,isRes){
    isRes=(isRes===true||isRes==='true');
    if(GS.phase!=='player')return;
    if(me().isAI)return; // safety: don't let UI interrupt AI turn
    var card=findCard(id);if(!card)return;
    var aff=canAfford(me(),card);
    if(aff.affordable){
      if(isRes)buyReserved(card);
      else{var md=findMD(id);if(md)buyCard(card,md.market,md.deck);}
    }else if(!isRes&&me().reserved.length<3){
      // Show a confirm overlay with the card enlarged — the "pick it up
      // and look at it" feel Stephen asked for. Nothing happens until
      // the player taps RESERVE or BACK.
      _showReserveConfirm(id);
    }else sm('Can\'t afford that');
  };
  // Enlarged inspect + confirm reserve. Lifts the card, adds a soft
  // drop-shadow so it reads as held, and shows YES / BACK buttons.
  function _showReserveConfirm(id){
    var card=findCard(id);if(!card)return;
    var existing=document.getElementById('PNreserveOV');
    if(existing)existing.remove();
    var ov=document.createElement('div');
    ov.id='PNreserveOV';
    ov.style.cssText='position:fixed;inset:0;z-index:200000;display:flex;align-items:center;justify-content:center;background:rgba(5,8,4,0.84);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);padding:20px;animation:pnFadeIn 0.25s ease;';
    ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});
    // Build the big card using the same renderer logic, scaled 3×.
    var bgShade=card.tier===1?'#4a7c35':card.tier===2?'#c8a84b':'#ffd700';
    var h='<div style="display:flex;flex-direction:column;align-items:center;gap:16px;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.8rem;letter-spacing:0.18em;color:var(--muted);">RESERVE THIS CARD?</div>';
    h+='<div class="pn-big-card" style="width:220px;height:300px;background:#f5f0e1;border-radius:12px;padding:14px;border:2px solid #7ab356;border-left:10px solid '+bgShade+';position:relative;color:#1a1f17;box-shadow:0 24px 48px rgba(0,0,0,0.6),0 4px 12px rgba(0,0,0,0.3);animation:pnLift 0.35s cubic-bezier(.34,1.56,.64,1);">';
    h+='<div style="position:absolute;top:8px;left:14px;font-size:40px;font-weight:800;">'+(card.gp>0?card.gp:'')+'</div>';
    h+='<div style="position:absolute;top:14px;right:14px;">'+tokDot(card.produces,32)+'</div>';
    h+='<div style="text-align:center;font-size:80px;margin-top:70px;">'+TIER_ICONS[card.tier-1]+'</div>';
    h+='<div style="position:absolute;bottom:56px;left:14px;right:14px;text-align:center;font-family:Bebas Neue,sans-serif;font-size:0.65rem;letter-spacing:0.18em;color:#4a7c35;">'+TIER_NAMES[card.tier-1].toUpperCase()+'</div>';
    h+='<div style="position:absolute;bottom:14px;left:14px;right:14px;display:flex;gap:4px;flex-wrap:wrap;justify-content:center;">';
    for(var c in card.cost){for(var i=0;i<card.cost[c];i++)h+=tokDot(c,18);}
    h+='</div></div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.6rem;color:var(--cream);opacity:0.8;max-width:260px;text-align:center;line-height:1.5;">Reserving holds this card and grants <span style="color:#ffd700;">1 gold</span>. Max 3 reserved at a time.</div>';
    h+='<div style="display:flex;gap:12px;">';
    h+='<button class="gb" onclick="_PNconfirmReserve('+id+')" style="min-height:52px;padding:12px 22px;font-size:0.8rem;letter-spacing:0.1em;color:var(--sage);border-color:var(--sage);background:rgba(122,179,86,0.18);">RESERVE</button>';
    h+='<button class="gb" onclick="document.getElementById(\'PNreserveOV\').remove()" style="min-height:52px;padding:12px 22px;font-size:0.8rem;letter-spacing:0.1em;color:var(--muted);border-color:rgba(138,145,120,0.3);">BACK</button>';
    h+='</div>';
    h+='</div>';
    ov.innerHTML=h;
    document.body.appendChild(ov);
  }
  window._PNconfirmReserve=function(id){
    var ov=document.getElementById('PNreserveOV');if(ov)ov.remove();
    var md=findMD(id);if(!md)return;
    var card=findCard(id);if(!card)return;
    reserveCard(card,md.market,md.deck);
    sm('Reserved · +1 gold');
  };
  window._PNact=function(act){if(GS.phase!=='player'||me().isAI)return;GS.action=act;GS.selectedTokens=[];render();};
  window._PNsup=function(c){
    if(GS.phase!=='player'||me().isAI){return;}
    if(!GS.action){sm('Pick action first');return;}
    if(GS.supply[c]<=0){sm('Supply empty');return;}
    if(c==='gold'){sm('Gold: reserve a card');return;}
    if(GS.action==='collect3'){
      var idx=GS.selectedTokens.indexOf(c);
      if(idx>=0)GS.selectedTokens.splice(idx,1);
      else if(GS.selectedTokens.length<3)GS.selectedTokens.push(c);
    }else if(GS.action==='collect2'){
      if(GS.selectedTokens.length===0){if(GS.supply[c]<4){sm('Need 4+ in supply');return;}GS.selectedTokens=[c,c];}
      else GS.selectedTokens=[];
    }
    render();
  };
  window._PNconfirm=function(){
    if(GS.action==='collect3'&&GS.selectedTokens.length>=1){
      var seen={},ok=true;for(var i=0;i<GS.selectedTokens.length;i++){if(seen[GS.selectedTokens[i]]){ok=false;break;}seen[GS.selectedTokens[i]]=true;}
      if(!ok){sm('Must be different colors');return;}
      collectTokens(GS.selectedTokens);
    }else if(GS.action==='collect2'&&GS.selectedTokens.length===2)collectTokens(GS.selectedTokens);
    else sm('Pick tokens first');
  };
  window._PNcancel=function(){GS.action=null;GS.selectedTokens=[];render();};

  newGame();
};
})();
