// ═══ POLLEN — Splendor-like engine builder ═══
// Collect pollen tokens, buy plant cards that produce permanent pollen, attract pollinators.
// First to 15 Growth Points wins.
(function(){
'use strict';

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

  var G=null;

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
      who.tokens[c]-=fh;G.supply[c]+=fh;
      var rem=ft-fh;
      if(rem>0){who.tokens.gold-=rem;G.supply.gold+=rem;}
    });
    who.cards.push(card);
    who.production[card.produces]=(who.production[card.produces]||0)+1;
    who.gp+=card.gp;
  }
  function checkPollinators(who,label){
    G.pollinators.forEach(function(p){
      if(p.claimedBy)return;
      var ok=true;
      for(var c in p.req)if((who.production[c]||0)<p.req[c]){ok=false;break;}
      if(ok){p.claimedBy=label;who.gp+=p.gp;sm(p.icon+' '+p.name+' visits '+(label==='player'?'you':'AI')+'!');}
    });
  }

  function newGame(){
    var all=generateCards();
    var pls=shuffle(ALL_POLLINATORS.slice()).slice(0,5).map(function(p){return{name:p.name,icon:p.icon,req:p.req,gp:p.gp,claimedBy:null};});
    G={
      turn:0,phase:'player',
      deck1:shuffle(all.tier1.slice()),deck2:shuffle(all.tier2.slice()),deck3:shuffle(all.tier3.slice()),
      market1:[],market2:[],market3:[],
      supply:{green:5,rose:5,blue:5,amber:5,spore:5,gold:5},
      pollinators:pls,
      player:{gp:0,tokens:{green:0,rose:0,blue:0,amber:0,spore:0,gold:0},cards:[],reserved:[],production:{}},
      ai:{gp:0,tokens:{green:0,rose:0,blue:0,amber:0,spore:0,gold:0},cards:[],reserved:[],production:{}},
      selectedTokens:[],action:null
    };
    COLORS.forEach(function(c){G.player.production[c]=0;G.ai.production[c]=0;});
    for(var i=0;i<4;i++){
      if(G.deck1.length)G.market1.push(G.deck1.pop());
      if(G.deck2.length)G.market2.push(G.deck2.pop());
      if(G.deck3.length)G.market3.push(G.deck3.pop());
    }
    render();
  }

  function collectTokens(cs){
    cs.forEach(function(c){if(G.supply[c]>0){G.supply[c]--;G.player.tokens[c]++;}});
    while(totalTok(G.player.tokens)>10){
      var mc=null,mv=0;
      COLORS.forEach(function(c){if(G.player.tokens[c]>mv){mv=G.player.tokens[c];mc=c;}});
      if(mc&&G.player.tokens[mc]>0){G.player.tokens[mc]--;G.supply[mc]++;}else break;
    }
    endPlayerTurn();
  }
  function buyCard(card,mkt,deck){
    payForCard(G.player,card);
    for(var i=0;i<mkt.length;i++)if(mkt[i]&&mkt[i].id===card.id){if(deck.length)mkt[i]=deck.pop();else mkt.splice(i,1);break;}
    checkPollinators(G.player,'player');
    _play('snap');_e('progress');
    endPlayerTurn();
  }
  function buyReserved(card){
    payForCard(G.player,card);
    for(var i=0;i<G.player.reserved.length;i++)if(G.player.reserved[i].id===card.id){G.player.reserved.splice(i,1);break;}
    checkPollinators(G.player,'player');
    _play('snap');_e('progress');
    endPlayerTurn();
  }
  function reserveCard(card,mkt,deck){
    if(G.player.reserved.length>=3){sm('Max 3 reserved');return;}
    for(var i=0;i<mkt.length;i++)if(mkt[i]&&mkt[i].id===card.id){G.player.reserved.push(card);if(deck.length)mkt[i]=deck.pop();else mkt.splice(i,1);break;}
    if(G.supply.gold>0){G.supply.gold--;G.player.tokens.gold++;}
    _play('tap');
    endPlayerTurn();
  }

  function endPlayerTurn(){
    G.turn++;G.selectedTokens=[];G.action=null;
    if(G.player.gp>=15){G.phase='gameover';_e('game_win');_playWin();sm('🌸 Garden blooms! '+G.player.gp+' GP');_sr('pollen',{w:true,s:G.player.gp,t:G.turn});render();return;}
    G.phase='ai';render();
    setTimeout(aiTurn,700);
  }
  function aiNeeded(){
    var n={};COLORS.forEach(function(c){n[c]=0;});
    G.market1.concat(G.market2).forEach(function(card){
      if(!card)return;
      for(var c in card.cost){var gap=Math.max(0,(card.cost[c]||0)-(G.ai.production[c]||0)-(G.ai.tokens[c]||0));n[c]+=gap;}
    });
    return n;
  }
  function aiTurn(){
    var best=null,bestGP=-1,bm=null,bd=null;
    [[G.market3,G.deck3],[G.market2,G.deck2],[G.market1,G.deck1]].forEach(function(pr){
      pr[0].forEach(function(c){
        if(!c)return;
        var af=canAfford(G.ai,c);
        if(af.affordable&&c.gp>bestGP){bestGP=c.gp;best=c;bm=pr[0];bd=pr[1];}
      });
    });
    if(best&&bestGP>=0){
      payForCard(G.ai,best);
      for(var i=0;i<bm.length;i++)if(bm[i]&&bm[i].id===best.id){if(bd.length)bm[i]=bd.pop();else bm.splice(i,1);break;}
      checkPollinators(G.ai,'ai');
      sm('AI grew '+TIER_NAMES[best.tier-1]+' (+'+best.gp+')');
    }else{
      var needed=aiNeeded();
      var avail=COLORS.filter(function(c){return G.supply[c]>0;});
      avail.sort(function(a,b){return(needed[b]||0)-(needed[a]||0);});
      var got=0;
      for(var i=0;i<avail.length&&got<3;i++){if(G.supply[avail[i]]>0){G.supply[avail[i]]--;G.ai.tokens[avail[i]]++;got++;}}
      while(totalTok(G.ai.tokens)>10){
        var mc=null,mv=0;COLORS.forEach(function(c){if(G.ai.tokens[c]>mv){mv=G.ai.tokens[c];mc=c;}});
        if(mc){G.ai.tokens[mc]--;G.supply[mc]++;}else break;
      }
      sm('AI gathered pollen');
    }
    G.turn++;
    if(G.ai.gp>=15){G.phase='gameover';_e('game_loss');_play('lose');sm('AI wins! '+G.ai.gp+' GP');_sr('pollen',{w:false,s:G.player.gp,t:G.turn});render();return;}
    G.phase='player';render();
  }

  ms(a,'<strong id="PNt">Pollen</strong>');
  mm(a);
  var pan=document.createElement('div');pan.id='PNpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:4px;user-select:none;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb-new" onclick="_PNnew()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  function tokDot(c,sz){return '<span style="display:inline-block;width:'+sz+'px;height:'+sz+'px;border-radius:50%;background:'+COLOR_HEX[c]+';border:1px solid rgba(0,0,0,0.2);vertical-align:middle;"></span>';}

  function renderCard(card,isReserved){
    var aff=canAfford(G.player,card);
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

  function render(){
    var h='';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:rgba(26,31,23,0.6);border-radius:8px;margin-bottom:4px;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;color:var(--gold);letter-spacing:2px;">🐝 POLLEN <span style="font-size:0.7rem;color:var(--muted);">T'+G.turn+'</span></div>';
    h+='<div style="display:flex;gap:10px;font-weight:700;"><span style="color:var(--sage);">You:'+G.player.gp+'</span><span style="color:#c47a7a;">AI:'+G.ai.gp+'</span></div></div>';
    if(G.phase==='player')h+='<div style="text-align:center;color:var(--sage);font-size:0.7rem;padding:2px;">— Your Turn —</div>';
    else if(G.phase==='ai')h+='<div style="text-align:center;color:#c47a7a;font-size:0.7rem;padding:2px;">— AI thinking —</div>';
    // Pollinators
    h+='<div style="font-size:0.6rem;color:var(--muted);margin:4px 0 2px;">POLLINATORS</div>';
    h+='<div style="display:flex;gap:4px;overflow-x:auto;padding-bottom:3px;">';
    G.pollinators.forEach(function(p){
      var bg=p.claimedBy==='player'?'rgba(122,179,86,0.15);border-color:#7ab356':p.claimedBy==='ai'?'rgba(196,122,122,0.15);border-color:#c47a7a':'rgba(26,31,23,0.5);border-color:rgba(122,179,86,0.2)';
      h+='<div style="min-width:70px;padding:4px;background:'+bg+';border:1px solid;border-radius:6px;text-align:center;font-size:10px;flex-shrink:0;">';
      h+='<div style="font-size:16px;">'+p.icon+'</div><div style="font-weight:700;">'+p.name+'</div>';
      h+='<div style="color:var(--muted);">';
      for(var c in p.req)h+='<span style="color:'+COLOR_HEX[c]+'">'+p.req[c]+'</span> ';
      h+='</div></div>';
    });
    h+='</div>';
    // Market
    [[3,G.market3,G.deck3],[2,G.market2,G.deck2],[1,G.market1,G.deck1]].forEach(function(t){
      h+='<div style="display:flex;align-items:center;gap:3px;margin:3px 0;">';
      h+='<div style="width:16px;font-family:Bebas Neue,sans-serif;color:var(--muted);text-align:center;font-size:9px;">T'+t[0]+'</div>';
      h+='<div style="flex:1;">';
      t[1].forEach(function(c){if(c)h+=renderCard(c,false);});
      h+='</div>';
      h+='<div style="width:30px;height:44px;background:rgba(26,31,23,0.6);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--muted);">'+t[2].length+'</div>';
      h+='</div>';
    });
    // Supply
    h+='<div style="font-size:0.6rem;color:var(--muted);margin:6px 0 2px;">SUPPLY</div>';
    h+='<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">';
    COLORS.concat(['gold']).forEach(function(c){
      var sel=G.selectedTokens.indexOf(c)>=0;
      var sty='padding:4px 8px;background:'+(sel?'rgba(122,179,86,0.2)':'rgba(26,31,23,0.5)')+';border:1px solid '+(sel?'#7ab356':'rgba(122,179,86,0.2)')+';border-radius:6px;font-size:12px;min-height:36px;display:inline-flex;align-items:center;gap:3px;cursor:pointer;';
      h+='<div style="'+sty+'" onclick="_PNsup(\''+c+'\')">'+tokDot(c,12)+' '+G.supply[c]+'</div>';
    });
    h+='</div>';
    // Player area
    h+='<div style="background:rgba(26,31,23,0.4);border-radius:8px;padding:6px;margin:6px 0;">';
    h+='<div style="font-size:0.6rem;color:var(--muted);">YOUR POLLEN ('+totalTok(G.player.tokens)+'/10)</div>';
    h+='<div style="display:flex;gap:4px;flex-wrap:wrap;margin:3px 0;">';
    COLORS.concat(['gold']).forEach(function(c){if(G.player.tokens[c]>0)h+='<span style="font-size:12px;">'+tokDot(c,12)+' '+G.player.tokens[c]+'</span>';});
    h+='</div>';
    h+='<div style="font-size:0.6rem;color:var(--muted);">PLANTS</div>';
    h+='<div style="display:flex;gap:2px;flex-wrap:wrap;">';
    COLORS.forEach(function(c){for(var i=0;i<(G.player.production[c]||0);i++)h+=tokDot(c,14);});
    if(G.player.cards.length===0)h+='<span style="font-size:10px;color:var(--muted);">None yet</span>';
    h+='</div>';
    if(G.player.reserved.length>0){
      h+='<div style="font-size:0.6rem;color:var(--muted);margin-top:4px;">RESERVED</div>';
      h+='<div>';G.player.reserved.forEach(function(c){h+=renderCard(c,true);});h+='</div>';
    }
    h+='</div>';
    // Actions
    if(G.phase==='player'){
      h+='<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:4px 0;">';
      h+='<button class="gb" onclick="_PNact(\'collect3\')" style="min-height:44px;padding:8px;background:'+(G.action==='collect3'?'rgba(122,179,86,0.3)':'')+';">3 DIFF</button>';
      h+='<button class="gb" onclick="_PNact(\'collect2\')" style="min-height:44px;padding:8px;background:'+(G.action==='collect2'?'rgba(122,179,86,0.3)':'')+';">2 SAME</button>';
      if(G.selectedTokens.length>0)h+='<button class="gb" onclick="_PNconfirm()" style="min-height:44px;padding:8px;background:rgba(200,168,75,0.2);color:var(--gold);border-color:rgba(200,168,75,0.5);">✓ CONFIRM</button>';
      if(G.action)h+='<button class="gb" onclick="_PNcancel()" style="min-height:44px;padding:8px;">✕</button>';
      h+='</div>';
    }
    pan.innerHTML=h;
  }

  function findCard(id){
    var all=G.market1.concat(G.market2).concat(G.market3).concat(G.player.reserved);
    for(var i=0;i<all.length;i++)if(all[i]&&all[i].id===id)return all[i];
    return null;
  }
  function findMD(id){
    for(var i=0;i<G.market1.length;i++)if(G.market1[i]&&G.market1[i].id===id)return{market:G.market1,deck:G.deck1};
    for(i=0;i<G.market2.length;i++)if(G.market2[i]&&G.market2[i].id===id)return{market:G.market2,deck:G.deck2};
    for(i=0;i<G.market3.length;i++)if(G.market3[i]&&G.market3[i].id===id)return{market:G.market3,deck:G.deck3};
    return null;
  }

  window._PNnew=function(){newGame();};
  window._PNtap=function(id,isRes){
    isRes=(isRes===true||isRes==='true');
    if(G.phase!=='player')return;
    var card=findCard(id);if(!card)return;
    var aff=canAfford(G.player,card);
    if(aff.affordable){
      if(isRes)buyReserved(card);
      else{var md=findMD(id);if(md)buyCard(card,md.market,md.deck);}
    }else if(!isRes&&G.player.reserved.length<3){
      var md2=findMD(id);if(md2)reserveCard(card,md2.market,md2.deck);
      sm('Reserved (can\'t afford yet) +1 gold');
    }else sm('Can\'t afford that');
  };
  window._PNact=function(act){if(G.phase!=='player')return;G.action=act;G.selectedTokens=[];render();};
  window._PNsup=function(c){
    if(G.phase!=='player'||!G.action){sm('Pick action first');return;}
    if(G.supply[c]<=0){sm('Supply empty');return;}
    if(c==='gold'){sm('Gold: reserve a card');return;}
    if(G.action==='collect3'){
      var idx=G.selectedTokens.indexOf(c);
      if(idx>=0)G.selectedTokens.splice(idx,1);
      else if(G.selectedTokens.length<3)G.selectedTokens.push(c);
    }else if(G.action==='collect2'){
      if(G.selectedTokens.length===0){if(G.supply[c]<4){sm('Need 4+ in supply');return;}G.selectedTokens=[c,c];}
      else G.selectedTokens=[];
    }
    render();
  };
  window._PNconfirm=function(){
    if(G.action==='collect3'&&G.selectedTokens.length>=1){
      var seen={},ok=true;for(var i=0;i<G.selectedTokens.length;i++){if(seen[G.selectedTokens[i]]){ok=false;break;}seen[G.selectedTokens[i]]=true;}
      if(!ok){sm('Must be different colors');return;}
      collectTokens(G.selectedTokens);
    }else if(G.action==='collect2'&&G.selectedTokens.length===2)collectTokens(G.selectedTokens);
    else sm('Pick tokens first');
  };
  window._PNcancel=function(){G.action=null;G.selectedTokens=[];render();};

  newGame();
};
})();
