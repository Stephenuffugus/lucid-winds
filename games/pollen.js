// ═══ POLLEN — Splendor-like engine builder ═══
// Collect pollen tokens, buy plant cards that produce permanent pollen, attract pollinators.
// First to 15 Growth Points wins.
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
  var ALL_POLLINATORS=[
    {name:'Monarch',icon:'🦋',req:{green:3,blue:3},gp:3},
    {name:'Honeybee',icon:'🐝',req:{rose:3,amber:3},gp:3},
    {name:'Hummingbird',icon:'🐦',req:{blue:3,spore:3},gp:3},
    {name:'Luna Moth',icon:'🌙',req:{green:3,rose:3},gp:3},
    {name:'Bumblebee',icon:'🐝',req:{amber:3,spore:3},gp:3},
    {name:'Dragonfly',icon:'🜸',req:{green:4,blue:2},gp:3},
    {name:'Firefly',icon:'✨',req:{amber:4,green:2},gp:3},
    {name:'Scarab',icon:'🪲',req:{spore:4,rose:2},gp:3}
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
  function checkPollinators(who,label){
    GS.pollinators.forEach(function(p){
      if(p.claimedBy)return;
      var ok=true;
      for(var c in p.req)if((who.production[c]||0)<p.req[c]){ok=false;break;}
      if(ok){p.claimedBy=label;who.gp+=p.gp;sm(p.icon+' '+p.name+' visits '+(label==='player'?'you':'AI')+'!');}
    });
  }

  function newGame(){
    var all=generateCards();
    var pls=shuffle(ALL_POLLINATORS.slice()).slice(0,5).map(function(p){return{name:p.name,icon:p.icon,req:p.req,gp:p.gp,claimedBy:null};});
    // Bug fix: was assigning to `G` (which is the shared window._G,
    // not this game's state). Result was GS stayed null and the very
    // next line crashed reading GS.player.production. Now correctly
    // initializes the GS state object the rest of the file uses.
    GS={
      turn:0,phase:'player',
      deck1:shuffle(all.tier1.slice()),deck2:shuffle(all.tier2.slice()),deck3:shuffle(all.tier3.slice()),
      market1:[],market2:[],market3:[],
      supply:{green:5,rose:5,blue:5,amber:5,spore:5,gold:5},
      pollinators:pls,
      player:{gp:0,tokens:{green:0,rose:0,blue:0,amber:0,spore:0,gold:0},cards:[],reserved:[],production:{}},
      ai:{gp:0,tokens:{green:0,rose:0,blue:0,amber:0,spore:0,gold:0},cards:[],reserved:[],production:{}},
      selectedTokens:[],action:null
    };
    COLORS.forEach(function(c){GS.player.production[c]=0;GS.ai.production[c]=0;});
    for(var i=0;i<4;i++){
      if(GS.deck1.length)GS.market1.push(GS.deck1.pop());
      if(GS.deck2.length)GS.market2.push(GS.deck2.pop());
      if(GS.deck3.length)GS.market3.push(GS.deck3.pop());
    }
    render();
  }

  function collectTokens(cs){
    cs.forEach(function(c){if(GS.supply[c]>0){GS.supply[c]--;GS.player.tokens[c]++;}});
    while(totalTok(GS.player.tokens)>10){
      var mc=null,mv=0;
      COLORS.forEach(function(c){if(GS.player.tokens[c]>mv){mv=GS.player.tokens[c];mc=c;}});
      if(mc&&GS.player.tokens[mc]>0){GS.player.tokens[mc]--;GS.supply[mc]++;}else break;
    }
    endPlayerTurn();
  }
  function buyCard(card,mkt,deck){
    payForCard(GS.player,card);
    for(var i=0;i<mkt.length;i++)if(mkt[i]&&mkt[i].id===card.id){if(deck.length)mkt[i]=deck.pop();else mkt.splice(i,1);break;}
    checkPollinators(GS.player,'player');
    _play('snap');_e('progress');
    endPlayerTurn();
  }
  function buyReserved(card){
    payForCard(GS.player,card);
    for(var i=0;i<GS.player.reserved.length;i++)if(GS.player.reserved[i].id===card.id){GS.player.reserved.splice(i,1);break;}
    checkPollinators(GS.player,'player');
    _play('snap');_e('progress');
    endPlayerTurn();
  }
  function reserveCard(card,mkt,deck){
    if(GS.player.reserved.length>=3){sm('Max 3 reserved');return;}
    for(var i=0;i<mkt.length;i++)if(mkt[i]&&mkt[i].id===card.id){GS.player.reserved.push(card);if(deck.length)mkt[i]=deck.pop();else mkt.splice(i,1);break;}
    if(GS.supply.gold>0){GS.supply.gold--;GS.player.tokens.gold++;}
    _play('tap');
    endPlayerTurn();
  }

  function endPlayerTurn(){
    GS.turn++;GS.selectedTokens=[];GS.action=null;
    if(GS.player.gp>=15){GS.phase='gameover';_e('game_win');_playWin();sm('🌸 Garden blooms!');_sr('pollen',{w:true,s:GS.player.gp,t:GS.turn});showEndCard(true);return;}
    GS.phase='ai';render();
    setTimeout(aiTurn,700);
  }
  function aiNeeded(){
    var n={};COLORS.forEach(function(c){n[c]=0;});
    GS.market1.concat(GS.market2).forEach(function(card){
      if(!card)return;
      for(var c in card.cost){var gap=Math.max(0,(card.cost[c]||0)-(GS.ai.production[c]||0)-(GS.ai.tokens[c]||0));n[c]+=gap;}
    });
    return n;
  }
  function aiTurn(){
    var best=null,bestGP=-1,bm=null,bd=null;
    [[GS.market3,GS.deck3],[GS.market2,GS.deck2],[GS.market1,GS.deck1]].forEach(function(pr){
      pr[0].forEach(function(c){
        if(!c)return;
        var af=canAfford(GS.ai,c);
        if(af.affordable&&c.gp>bestGP){bestGP=c.gp;best=c;bm=pr[0];bd=pr[1];}
      });
    });
    if(best&&bestGP>=0){
      payForCard(GS.ai,best);
      for(var i=0;i<bm.length;i++)if(bm[i]&&bm[i].id===best.id){if(bd.length)bm[i]=bd.pop();else bm.splice(i,1);break;}
      checkPollinators(GS.ai,'ai');
      sm('AI grew '+TIER_NAMES[best.tier-1]+' (+'+best.gp+')');
    }else{
      var needed=aiNeeded();
      var avail=COLORS.filter(function(c){return GS.supply[c]>0;});
      avail.sort(function(a,b){return(needed[b]||0)-(needed[a]||0);});
      var got=0;
      for(var i=0;i<avail.length&&got<3;i++){if(GS.supply[avail[i]]>0){GS.supply[avail[i]]--;GS.ai.tokens[avail[i]]++;got++;}}
      while(totalTok(GS.ai.tokens)>10){
        var mc=null,mv=0;COLORS.forEach(function(c){if(GS.ai.tokens[c]>mv){mv=GS.ai.tokens[c];mc=c;}});
        if(mc){GS.ai.tokens[mc]--;GS.supply[mc]++;}else break;
      }
      sm('AI gathered pollen');
    }
    GS.turn++;
    if(GS.ai.gp>=15){GS.phase='gameover';_e('game_loss');_play('lose');sm('AI wins');_sr('pollen',{w:false,s:GS.player.gp,t:GS.turn});showEndCard(false);return;}
    GS.phase='player';render();
  }

  ms(a,'<strong id="PNt">Pollen</strong>');
  mm(a);
  var pan=document.createElement('div');pan.id='PNpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:4px;user-select:none;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb-new" onclick="_PNnew()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  function tokDot(c,sz){return '<span style="display:inline-block;width:'+sz+'px;height:'+sz+'px;border-radius:50%;background:'+COLOR_HEX[c]+';border:1px solid rgba(0,0,0,0.2);vertical-align:middle;"></span>';}

  function renderCard(card,isReserved){
    var aff=canAfford(GS.player,card);
    var border=aff.affordable?'2px solid #7ab356':'2px solid #6a6051';
    var bgShade=card.tier===1?'#4a7c35':card.tier===2?'#c8a84b':'#ffd700';
    var h='<div style="width:70px;height:96px;background:#f5f0e1;border-radius:6px;padding:4px;border:'+border+';border-left:3px solid '+bgShade+';display:inline-block;vertical-align:top;margin:2px;position:relative;cursor:pointer;color:#1a1f17;" onclick="_PNtap('+card.id+','+(isReserved?'true':'false')+')">';
    h+='<div style="position:absolute;top:2px;left:4px;font-size:12px;font-weight:800;">'+(card.gp>0?card.gp:'')+'</div>';
    h+='<div style="position:absolute;top:3px;right:4px;">'+tokDot(card.produces,12)+'</div>';
    h+='<div style="text-align:center;font-size:18px;margin-top:20px;">'+TIER_ICONS[card.tier-1]+'</div>';
    h+='<div style="position:absolute;bottom:3px;left:3px;right:3px;display:flex;gap:1px;flex-wrap:wrap;">';
    for(var c in card.cost){for(var i=0;i<card.cost[c];i++)h+=tokDot(c,9);}
    h+='</div></div>';
    return h;
  }

  function showEndCard(won){
    render();
    var pan=document.querySelector('#fg-ag [data-pn]');
    // Append celebration card
    var card=document.createElement('div');
    card.style.cssText='position:fixed;inset:0;background:rgba(8,10,6,0.88);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:200000;display:flex;align-items:center;justify-content:center;padding:1rem;';
    var pollCnt=GS.player.pollinators.length;
    card.innerHTML='<div style="background:linear-gradient(160deg,#1a1f17,#0d100c);border:2px solid '+(won?'rgba(200,168,75,0.5)':'rgba(199,80,80,0.35)')+';border-radius:16px;padding:2rem 1.5rem;max-width:360px;text-align:center;box-shadow:0 12px 48px rgba(0,0,0,0.8),0 0 32px '+(won?'rgba(200,168,75,0.25)':'rgba(0,0,0,0.3)')+';">'+
      '<div style="font-size:3rem;margin-bottom:0.5rem;">'+(won?'🌸':'🐝')+'</div>'+
      '<div style="font-family:Bebas Neue,sans-serif;font-size:1.5rem;color:'+(won?'var(--gold)':'var(--cream)')+';letter-spacing:0.12em;margin-bottom:0.6rem;">'+(won?'GARDEN BLOOMS':'HIVE RESTS')+'</div>'+
      '<div style="font-family:DM Mono,monospace;font-size:0.75rem;color:var(--cream);margin-bottom:1rem;line-height:1.7;">'+
        'You: <strong style="color:var(--gold);">'+GS.player.gp+'</strong> GP<br>'+
        'AI: <strong style="color:#c47a7a;">'+GS.ai.gp+'</strong> GP<br>'+
        'Turn: '+GS.turn+' · Pollinators: '+pollCnt+
      '</div>'+
      '<button onclick="this.parentNode.parentNode.remove();_PNnew();" style="padding:12px 28px;font-family:Bebas Neue,sans-serif;font-size:1rem;letter-spacing:0.1em;background:rgba(122,179,86,0.2);border:1.5px solid var(--sage);color:var(--sage);border-radius:10px;cursor:pointer;min-height:48px;">PLAY AGAIN</button>'+
      '</div>';
    document.body.appendChild(card);
  }

  function render(){
    var h='';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:rgba(26,31,23,0.6);border-radius:8px;margin-bottom:4px;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;color:var(--gold);letter-spacing:2px;">🐝 POLLEN <span style="font-size:0.7rem;color:var(--muted);">T'+GS.turn+'</span></div>';
    h+='<div style="display:flex;gap:10px;font-weight:700;"><span style="color:var(--sage);">You:'+GS.player.gp+'</span><span style="color:#c47a7a;">AI:'+GS.ai.gp+'</span></div></div>';
    if(GS.phase==='player')h+='<div style="text-align:center;color:var(--sage);font-size:0.7rem;padding:2px;">— Your Turn —</div>';
    else if(GS.phase==='ai')h+='<div style="text-align:center;color:#c47a7a;font-size:0.7rem;padding:2px;">— AI thinking —</div>';
    // Pollinators
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.85rem;color:var(--cream);letter-spacing:0.1em;margin:8px 0 4px;">POLLINATORS</div>';
    h+='<div style="display:flex;gap:4px;overflow-x:auto;padding-bottom:3px;">';
    GS.pollinators.forEach(function(p){
      var bg=p.claimedBy==='player'?'rgba(122,179,86,0.15);border-color:#7ab356':p.claimedBy==='ai'?'rgba(196,122,122,0.15);border-color:#c47a7a':'rgba(26,31,23,0.5);border-color:rgba(122,179,86,0.2)';
      h+='<div style="min-width:70px;padding:4px;background:'+bg+';border:1px solid;border-radius:6px;text-align:center;font-size:10px;flex-shrink:0;">';
      h+='<div style="font-size:16px;">'+p.icon+'</div><div style="font-weight:700;">'+p.name+'</div>';
      h+='<div style="color:var(--muted);">';
      for(var c in p.req)h+='<span style="color:'+COLOR_HEX[c]+'">'+p.req[c]+'</span> ';
      h+='</div></div>';
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
      var sty='padding:4px 8px;background:'+(sel?'rgba(122,179,86,0.2)':'rgba(26,31,23,0.5)')+';border:1px solid '+(sel?'#7ab356':'rgba(122,179,86,0.2)')+';border-radius:6px;font-size:12px;min-height:36px;display:inline-flex;align-items:center;gap:3px;cursor:pointer;';
      h+='<div style="'+sty+'" onclick="_PNsup(\''+c+'\')">'+tokDot(c,12)+' '+GS.supply[c]+'</div>';
    });
    h+='</div>';
    // Player area
    h+='<div style="background:rgba(26,31,23,0.4);border-radius:8px;padding:6px;margin:6px 0;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.85rem;color:var(--cream);letter-spacing:0.1em;">YOUR POLLEN ('+totalTok(GS.player.tokens)+'/10)</div>';
    h+='<div style="display:flex;gap:4px;flex-wrap:wrap;margin:3px 0;">';
    COLORS.concat(['gold']).forEach(function(c){if(GS.player.tokens[c]>0)h+='<span style="font-size:12px;">'+tokDot(c,12)+' '+GS.player.tokens[c]+'</span>';});
    h+='</div>';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.85rem;color:var(--cream);letter-spacing:0.1em;">PLANTS</div>';
    h+='<div style="display:flex;gap:2px;flex-wrap:wrap;">';
    COLORS.forEach(function(c){for(var i=0;i<(GS.player.production[c]||0);i++)h+=tokDot(c,14);});
    if(GS.player.cards.length===0)h+='<span style="font-size:10px;color:var(--muted);">None yet</span>';
    h+='</div>';
    if(GS.player.reserved.length>0){
      h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.78rem;color:var(--gold);letter-spacing:0.1em;margin-top:6px;">RESERVED</div>';
      h+='<div>';GS.player.reserved.forEach(function(c){h+=renderCard(c,true);});h+='</div>';
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
    var all=GS.market1.concat(GS.market2).concat(GS.market3).concat(GS.player.reserved);
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
    var card=findCard(id);if(!card)return;
    var aff=canAfford(GS.player,card);
    if(aff.affordable){
      if(isRes)buyReserved(card);
      else{var md=findMD(id);if(md)buyCard(card,md.market,md.deck);}
    }else if(!isRes&&GS.player.reserved.length<3){
      var md2=findMD(id);if(md2)reserveCard(card,md2.market,md2.deck);
      sm('Reserved (can\'t afford yet) +1 gold');
    }else sm('Can\'t afford that');
  };
  window._PNact=function(act){if(GS.phase!=='player')return;GS.action=act;GS.selectedTokens=[];render();};
  window._PNsup=function(c){
    if(GS.phase!=='player'||!GS.action){sm('Pick action first');return;}
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
