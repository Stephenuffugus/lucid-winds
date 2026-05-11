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
  // 10-pollinator pool (matches user's "100 pieces total" design).
  // Draw scales by player count: N+1, min 3. Each pollinator rewards
  // 3 GP and requires production (not tokens) to attract.
  // Pollinators — wired to Stephen's 2026-04-14 art drop (11 PNGs in
  // assets/games/masterpollinator/pollinators/<slug>.png).
  // Production-threshold reqs preserved from earlier balance pass.
  var ALL_POLLINATORS=[
    {slug:'monarch-butterfly',     name:'Monarch Butterfly',  icon:'🦋', req:{green:3,blue:3},        gp:3},
    {slug:'honey-bee',             name:'Honey Bee',           icon:'🐝', req:{rose:3,amber:3},        gp:3},
    {slug:'bumblebee',             name:'Bumblebee',           icon:'🐝', req:{amber:3,spore:3},       gp:3},
    {slug:'hummingbird',           name:'Hummingbird',         icon:'🐦', req:{blue:3,spore:3},        gp:3},
    {slug:'sphinx-moth',           name:'Sphinx Moth',         icon:'🌙', req:{green:3,rose:3},        gp:3},
    {slug:'hoverfly',              name:'Hoverfly',            icon:'🪰', req:{green:4,blue:2},        gp:3},
    {slug:'fig-wasp',              name:'Fig Wasp',            icon:'🐝', req:{amber:4,green:2},       gp:3},
    {slug:'blue-tailed-damselfly', name:'Blue-Tailed Damselfly',icon:'🜸', req:{blue:4,amber:2},        gp:3},
    {slug:'fruit-bat',             name:'Fruit Bat',           icon:'🦇', req:{spore:4,rose:2},        gp:3},
    {slug:'honey-possum',          name:'Honey Possum',        icon:'🐭', req:{green:2,rose:2,blue:2}, gp:3},
    {slug:'ruffled-lemur',         name:'Ruffled Lemur',       icon:'🐒', req:{rose:2,amber:2,spore:2}, gp:3}
  ];
  // Pollinators visible this game.
  function pollinatorCount(numPlayers){
    return Math.max(3,Math.min(5,(numPlayers||1)+1));
  }

  var GS=null;

  function shuffle(ar){for(var i=ar.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=ar[i];ar[i]=ar[j];ar[j]=t;}return ar;}
  // HTML/attr escape for player-typed names — prevents a name like
  // `O"Malley` or `Bob<3` from breaking the setup input or scoreboard.
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
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
  // ═══ 100-FLOWER CATALOG ═══════════════════════════════════════════════
  // 40 common · 30 uncommon · 20 rare real-flower plants. Each entry is
  // [slug, name, {cost}, gp]. Tier is implied by the list it's in;
  // produces color is implied by which inner array it sits in.
  // Costs are hand-tuned to mirror Splendor's base-game distribution
  // (tier 1 totals 2-4, tier 2 totals 5-7 with 1-3 GP, tier 3 totals
  // 7-10 with 3-5 GP). Costs use the other four colors (g=green,
  // r=rose, b=blue, a=amber, s=spore), a card never requires its own
  // produces color.
  //
  // Art hook: the slug is the filename under assets/games/masterpollinator/.
  //   <slug>.png  (e.g. dandelion.png, wild-rose.png, black-bat-flower.png)
  // If the PNG is missing the card falls back to emoji + tier icon so
  // the game plays cleanly while art is still being drawn.
  // Catalog wired to Stephen's 2026-04-14 art drop. Slugs match exactly
  // the filenames Jessie painted (40 + 30 + 20 PNGs in the tier1/tier2/
  // tier3 folders). Costs/GP per slot preserved from the previous
  // Splendor-balanced distribution. 5th element = optional flag object;
  // {hideName:true} hides the common name in the inspect modal (used
  // for hookers-lips since the slang name isn't kid-safe).
  var CATALOG={
    tier1:{
      green:[
        ['bleeding-heart',  'Bleeding Heart',   {a:2},0],
        ['columbine',       'Columbine',        {r:2},0],
        ['echinacea',       'Echinacea',        {b:3},0],
        ['foxglove',        'Foxglove',         {r:1,a:1},0],
        ['geranium',        'Geranium',         {a:2,s:1},0],
        ['impatiens',       'Impatiens',        {r:1,b:1,s:1},0],
        ['petunia',         'Petunia',          {b:2,a:2},1],
        ['snapdragon',      'Snapdragon',       {r:2,a:1,s:1},1]
      ],
      rose:[
        ['rose',            'Rose',             {g:2},0],
        ['peony',           'Peony',            {a:2},0],
        ['dahlia',          'Dahlia',           {s:3},0],
        ['hibiscus',        'Hibiscus',         {g:1,b:1},0],
        ['cosmos',          'Cosmos',           {g:2,a:1},0],
        ['gladiolus',       'Gladiolus',        {g:1,b:1,s:1},0],
        ['ranunculus',      'Ranunculus',       {g:2,b:2},1],
        ['begonia',         'Begonia',          {g:2,a:1,s:1},1]
      ],
      blue:[
        ['bluebell',        'Bluebell',         {g:2},0],
        ['hyacinth',        'Hyacinth',         {s:2},0],
        ['forget-me-not',   'Forget-Me-Not',    {r:3},0],
        ['delphinium',      'Delphinium',       {g:1,s:1},0],
        ['iris',            'Iris',             {g:1,r:1,a:1},0],
        ['morning-glory',   'Morning Glory',    {r:2,a:1},0],
        ['lupine',          'Lupine',           {g:3,r:1},1],
        ['lilac',           'Lilac',            {r:2,a:1,s:1},1]
      ],
      amber:[
        ['dandelion',       'Dandelion',        {g:2},0],
        ['sunflower',       'Sunflower',        {r:2},0],
        ['marigold',        'Marigold',         {b:3},0],
        ['daffodil',        'Daffodil',         {g:1,r:1},0],
        ['freesia',         'Freesia',          {g:1,b:1,s:1},0],
        ['coreopsis',       'Coreopsis',        {r:1,b:2},0],
        ['zinnia',          'Zinnia',           {g:2,s:2},1],
        ['crocus',          'Crocus',           {g:1,b:2,s:1},1]
      ],
      spore:[
        ['orchid',          'Orchid',           {g:2},0],
        ['lily',            'Lily',             {b:2},0],
        ['snowdrop',        'Snowdrop',         {r:3},0],
        ['pansy',           'Pansy',            {g:1,a:1},0],
        ['chrysanthemum',   'Chrysanthemum',    {g:1,r:1,b:1},0],
        ['aster',           'Aster',            {b:2,a:1},0],
        ['hydrangea',       'Hydrangea',        {r:1,a:3},1],
        ['poppy',           'Poppy',            {g:2,b:1,a:1},1]
      ]
    },
    tier2:{
      green:[
        ['pitcher-plant',   'Pitcher Plant',    {a:3,s:2},1],
        ['venus-flytrap',   'Venus Flytrap',    {r:2,b:2,s:1},2],
        ['sundew',          'Sundew',           {r:3,a:2},2],
        ['trillium',        'Trillium',         {b:3,a:2,s:1},2],
        ['spider-lily',     'Spider Lily',      {r:2,b:2,s:2},3],
        ['sea-holly',       'Sea Holly',        {r:3,a:3,s:1},3]
      ],
      rose:[
        ['camellia',        'Camellia',         {g:3,s:2},1],
        ['plumeria',        'Plumeria',         {g:2,b:2,a:1},2],
        ['fuchsia',         'Fuchsia',          {g:3,b:2},2],
        ['bougainvillea',   'Bougainvillea',    {g:2,b:2,s:2},2],
        ['tuberose',        'Tuberose',         {g:2,a:2,s:2},3],
        ['gardenia',        'Gardenia',         {g:3,b:3,s:1},3]
      ],
      blue:[
        ['agapanthus',      'Agapanthus',       {g:3,s:2},1],
        ['fringed-gentian', 'Fringed Gentian',  {g:2,r:2,s:1},2],
        ['lotus',           'Lotus',            {g:3,r:2},2],
        ['meconopsis',      'Meconopsis',       {g:2,r:2,a:2},2],
        ['wisteria',        'Wisteria',         {g:2,a:2,s:2},3],
        ['allium',          'Allium',           {g:3,r:3,s:1},3]
      ],
      amber:[
        ['bird-of-paradise','Bird of Paradise', {g:3,b:2},1],
        ['blazing-star',    'Blazing Star',     {g:2,r:2,s:1},2],
        ['eremurus-foxtail-lily','Eremurus',    {r:3,s:2},2],
        ['kniphofia',       'Kniphofia',        {g:2,r:2,b:2},2],
        ['anthurium',       'Anthurium',        {g:2,r:2,s:2},3],
        ['lady-slipper-orchid','Lady Slipper Orchid',{g:3,r:3,s:1},3]
      ],
      spore:[
        ['calla-lily',      'Calla Lily',       {g:3,r:2},1],
        ['clematis',        'Clematis',         {g:2,b:2,a:1},2],
        ['fritillaria',     'Fritillaria',      {g:3,a:2},2],
        ['globe-thistle',   'Globe Thistle',    {r:2,b:2,a:2},2],
        ['passionflower',   'Passionflower',    {g:2,r:2,a:2},3],
        ['bee-balm',        'Bee Balm',         {g:3,b:3,a:1},3]
      ]
    },
    tier3:{
      green:[
        ['jade-vine',       'Jade Vine',        {r:5,b:3},3],
        ['welwitschia',     'Welwitschia',      {r:3,b:3,a:3},4],
        ['ghost-orchid',    'Ghost Orchid',     {r:3,b:3,s:3},4],
        ['kokia-cookei',    'Kokia Cookei',     {r:3,b:7},5]
      ],
      rose:[
        ['black-bat-flower','Black Bat Flower', {g:5,a:3},3],
        ['pelican-flower',  'Pelican Flower',   {g:3,b:3,a:3},4],
        ['hookers-lips',    'Mystery Bloom',    {g:3,b:3,s:3},4, {hideName:true}],
        ['queen-of-the-andes','Queen of the Andes',{g:7,s:3},5]
      ],
      blue:[
        ['draculas-orchid', "Dracula's Orchid", {g:5,r:3},3],
        ['darwins-orchid',  "Darwin's Orchid",  {g:3,r:3,a:3},4],
        ['pelican-flower-2','Pelican Flower',   {g:3,r:3,s:3},4],
        ['welwitschia-2',   'Welwitschia',      {g:7,r:3},5]
      ],
      amber:[
        ['titan-arum',      'Titan Arum',       {g:3,r:5},3],
        ['kadupul',         'Kadupul',          {g:3,r:3,b:3},4],
        ['stinking-corpse-lily','Stinking Corpse Lily',{r:3,b:3,s:3},4],
        ['pelican-flower-3','Pelican Flower',   {r:7,s:3},5]
      ],
      spore:[
        ['franklin-tree',   'Franklin Tree',    {g:3,b:5},3],
        ['night-blooming-cereus','Night-Blooming Cereus',{g:3,r:3,a:3},4],
        ['rafflesia',       'Rafflesia',        {g:3,b:3,a:3},4],
        ['welwitschia-3',   'Welwitschia',      {b:7,a:3},5]
      ]
    }
  };
  // Translate short cost keys (g/r/b/a/s) to full color names.
  var _COST_KEY={g:'green',r:'rose',b:'blue',a:'amber',s:'spore'};
  function _expandCost(short){var out={};for(var k in short)if(short.hasOwnProperty(k))out[_COST_KEY[k]||k]=short[k];return out;}

  function generateCards(){
    var cards={tier1:[],tier2:[],tier3:[]},id=0;
    function pushTier(tierKey, tierNum){
      var tier=CATALOG[tierKey];
      for(var col in tier)if(tier.hasOwnProperty(col)){
        tier[col].forEach(function(row){
          cards[tierKey].push({
            id:id++, tier:tierNum,
            gp:row[3], produces:col,
            cost:_expandCost(row[2]),
            slug:row[0], name:row[1],
            // Optional 5th element: a flag object. Currently used only
            // for {hideName:true} on real flowers whose common names
            // aren't kid-safe (e.g. Hookers Lips / Psychotria elata).
            // Inspect modal shows "Mystery Bloom" instead of the real
            // name when this is set.
            hideName: !!(row[4]&&row[4].hideName)
          });
        });
      }
    }
    pushTier('tier1',1);
    pushTier('tier2',2);
    pushTier('tier3',3);
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
  // Live alias for code that still reads GS.player, always points to
  // the active seat. Updated whenever activeIdx rotates.
  function setActive(idx){GS.activeIdx=idx;GS.player=GS.players[idx];}

  // ─── SETUP SCREEN ────────────────────────────────────────────────────
  // Shown at game start (and via _PNnew). Pick 1, 4 seats, mark each
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
    var h='<div class="pn-modal" style="max-width:420px;width:100%;padding:22px 20px;font-family:DM Mono,monospace;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:1.2rem;letter-spacing:0.16em;color:var(--gold);margin-bottom:4px;">MASTER POLLINATOR</div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.62rem;color:var(--muted);margin-bottom:16px;">1, 4 players. Pass-and-play. First to 15 GP wins.</div>';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.6rem;letter-spacing:0.12em;color:var(--sage);margin-bottom:8px;">SEATS</div>';
    for(var i=0;i<st.seats.length;i++){
      var s=st.seats[i];
      h+='<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;background:rgba(26,31,23,0.5);border:1px solid rgba(122,179,86,0.15);border-radius:10px;padding:8px 10px;">';
      h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.85rem;color:var(--cream);width:40px;">P'+(i+1)+'</div>';
      h+='<input type="text" value="'+esc(s.name||'')+'" oninput="_PNsetName('+i+',this.value)" maxlength="12" style="flex:1;min-width:0;background:rgba(13,16,12,0.7);border:1px solid rgba(122,179,86,0.2);border-radius:6px;color:var(--cream);font-family:DM Mono,monospace;font-size:0.7rem;padding:8px 10px;min-height:44px;">';
      h+='<button class="gb" onclick="_PNsetAI('+i+',false)" style="min-height:44px;padding:8px 10px;font-size:0.58rem;'+(!s.isAI?'background:rgba(122,179,86,0.25);border-color:var(--sage);color:var(--sage);':'')+'">HUMAN</button>';
      h+='<button class="gb" onclick="_PNsetAI('+i+',true)" style="min-height:44px;padding:8px 10px;font-size:0.58rem;'+(s.isAI?'background:rgba(196,122,122,0.22);border-color:#c47a7a;color:#c47a7a;':'')+'">AI</button>';
      if(st.seats.length>1)h+='<button class="gb" onclick="_PNdropSeat('+i+')" style="min-height:44px;min-width:36px;padding:8px;font-size:0.55rem;color:var(--muted);">✕</button>';
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
    var n=setup.seats.length;
    var pool=poolSize(n);
    // Multiplayer-guard for companion boosts: if 2+ humans are seated
    // in this run, lock out every companion boost for its duration so
    // no seat has asymmetric advantage. Solo and vs-AI runs leave the
    // flag false, the human IS the only human.
    var humanCount=0;for(var si=0;si<setup.seats.length;si++)if(!setup.seats[si].isAI)humanCount++;
    try{window._LW_inMultiplayer=(humanCount>=2);}catch(e){}
    // Draw N+1 pollinators from the 10-card pool, matches Splendor's
    // nobles rule (2p → 3, 3p → 4, 4p → 5). Solo falls to 3.
    var pcount=pollinatorCount(n);
    var pls=shuffle(ALL_POLLINATORS.slice()).slice(0,pcount).map(function(p){return{slug:p.slug,name:p.name,icon:p.icon,req:p.req,gp:p.gp,claimedBy:null};});
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
      pendingReturn:null, // set when someone needs to return tokens before ending turn
      // Stephen 2026-05-11: tabbed market — show one tier at a time so
      // cards stay full-size on phones. T1 default. Tap a tab to switch.
      activeTier:1
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
  function newGame(){
    // Clear the multiplayer lock on any exit back to setup, covers
    // tapping NEW GAME or MENU mid-run. The flag re-arms in startGame
    // if the player picks another multi-human config.
    try{window._LW_inMultiplayer=false;}catch(e){}
    showSetup();
  }

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
  //, traditional Splendor rule: once any player hits 15, finish the
  // round so all seats have equal turns, then whoever has the most
  // points wins (ties broken by fewest cards bought).
  function endTurn(){
    GS.turn++;GS.selectedTokens=[];GS.action=null;
    // Stalemate safety: absolute hard cap. Shouldn't ever hit in real
    // play, but prevents a locked game where e.g. supply is empty and
    // every AI keeps passing.
    if(GS.turn>300*GS.numPlayers){
      sm('Stalemate, ending game');
      return finishGame();
    }
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
    // Clear the multiplayer lock so companion boosts re-enable in the
    // next solo / vs-AI game the player starts.
    try{window._LW_inMultiplayer=false;}catch(e){}
    // Winner = highest gp, tie-break on fewer cards.
    var winner=GS.players[0];
    for(var i=1;i<GS.players.length;i++){
      var p=GS.players[i];
      if(p.gp>winner.gp||(p.gp===winner.gp&&p.cards.length<winner.cards.length))winner=p;
    }
    var won=!winner.isAI&&countHumans()>0;
    if(won){_e('game_win');_playWin();}else{_e('game_loss');_play('lose');}
    sm(winner.name+' wins, '+winner.gp+' GP');
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
    var h='<div class="pn-modal" style="max-width:360px;width:100%;padding:22px 20px;font-family:DM Mono,monospace;text-align:center;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.75rem;letter-spacing:0.18em;color:var(--muted);">RETURN '+excess+' TOKEN'+(excess===1?'':'S')+'</div>';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:1.4rem;letter-spacing:0.08em;color:var(--gold);margin:4px 0 6px;">'+esc(who.name)+'</div>';
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
      +'<div style="font-family:Bebas Neue,sans-serif;font-size:2rem;letter-spacing:0.1em;color:var(--gold);margin:8px 0;">'+esc(nextSeat.name)+'</div>'
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
    // Paper-texture SVG encoded as a data URI so the card face gets a
    // subtle warm grain instead of flat fill. Small enough to inline.
    var paper="url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.18 0 0 0 0 0.15 0 0 0 0 0.1 0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
    st.textContent=''
      // ─── keyframes ────────────────────────────────────────────────────
      +'@keyframes pnFadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}'
      +'@keyframes pnLift{0%{transform:translateY(40px) scale(0.82);opacity:0;box-shadow:0 4px 12px rgba(0,0,0,0.2)}60%{transform:translateY(-10px) scale(1.05);opacity:1}100%{transform:translateY(0) scale(1)}}'
      +'@keyframes pnSeatGlow{0%,100%{box-shadow:0 0 0 1px rgba(200,168,75,0.45),0 0 14px rgba(200,168,75,0.18)}50%{box-shadow:0 0 0 1px rgba(200,168,75,0.7),0 0 22px rgba(200,168,75,0.35)}}'
      +'@keyframes pnTokIn{0%{transform:scale(0.7);opacity:0}100%{transform:scale(1);opacity:1}}'
      +'@keyframes pnPollClaim{0%{box-shadow:0 0 0 2px rgba(200,168,75,0.6),0 0 16px rgba(200,168,75,0.45)}100%{box-shadow:0 0 0 1px rgba(200,168,75,0.3),0 0 0 rgba(200,168,75,0)}}'
      +'@keyframes pnAmbient{0%{background-position:0% 0%}100%{background-position:200px 200px}}'
      // ─── panel ambience ───────────────────────────────────────────────
      +'#PNpan{position:relative;border-radius:14px;padding:10px 8px 14px;background:'
      +'radial-gradient(ellipse at top left,rgba(122,179,86,0.07),transparent 60%),'
      +'radial-gradient(ellipse at bottom right,rgba(200,168,75,0.05),transparent 60%),'
      +'linear-gradient(180deg,rgba(14,18,12,0.85),rgba(8,10,6,0.92));'
      +'box-shadow:inset 0 1px 0 rgba(255,220,140,0.04),0 4px 24px rgba(0,0,0,0.35);}'
      +'#PNpan::before{content:"";position:absolute;inset:0;border-radius:14px;pointer-events:none;background:'+paper+';opacity:0.35;mix-blend-mode:overlay;}'
      // ─── cards ────────────────────────────────────────────────────────
      +'.pn-card{transition:transform 0.22s cubic-bezier(.25,.46,.45,.94),box-shadow 0.22s ease,filter 0.22s ease;will-change:transform;'
      +'background-image:'+paper+',linear-gradient(178deg,#fbf6e6,#f0e8ce)!important;background-blend-mode:overlay,normal;}'
      +'.pn-card:hover,.pn-card:active{transform:translateY(-3px) scale(1.04);box-shadow:0 12px 22px rgba(0,0,0,0.5),0 2px 4px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.5);filter:brightness(1.06);z-index:5;}'
      +'.pn-card.aff{border-color:#7ab356!important;box-shadow:0 0 0 1px rgba(122,179,86,0.55),0 3px 8px rgba(122,179,86,0.18),0 2px 4px rgba(0,0,0,0.3);}'
      +'.pn-card.aff:hover{box-shadow:0 0 0 1px rgba(122,179,86,0.8),0 14px 28px rgba(122,179,86,0.3),0 4px 10px rgba(0,0,0,0.35);}'
      // ─── tokens (supply pills + in-hand pips) ─────────────────────────
      +'.pn-tok{transition:transform 0.16s cubic-bezier(.34,1.56,.64,1),background 0.16s ease,box-shadow 0.16s ease;min-height:40px;'
      +'background:linear-gradient(180deg,rgba(36,42,30,0.65),rgba(20,24,18,0.65))!important;'
      +'box-shadow:inset 0 1px 0 rgba(255,220,140,0.06),inset 0 -2px 4px rgba(0,0,0,0.35),0 1px 2px rgba(0,0,0,0.25);}'
      +'.pn-tok:hover{transform:translateY(-1px) scale(1.08);background:linear-gradient(180deg,rgba(46,54,38,0.8),rgba(26,32,22,0.8))!important;}'
      +'.pn-tok:active{transform:translateY(0) scale(0.97);}'
      +'.pn-tok.sel{box-shadow:inset 0 0 0 2px #7ab356,0 0 12px rgba(122,179,86,0.55),inset 0 1px 0 rgba(255,255,255,0.1)!important;}'
      // ─── pollinators ──────────────────────────────────────────────────
      +'.pn-poll{transition:border-color 0.24s ease,background 0.24s ease,box-shadow 0.24s ease;'
      +'background-image:linear-gradient(180deg,rgba(36,42,30,0.6),rgba(20,24,18,0.6));'
      +'box-shadow:inset 0 1px 0 rgba(255,220,140,0.05),0 2px 4px rgba(0,0,0,0.25);}'
      +'.pn-poll.claimed{animation:pnPollClaim 0.6s ease-out;}'
      // ─── seats ────────────────────────────────────────────────────────
      +'.pn-seat{transition:background 0.3s ease,border-color 0.3s ease;border-radius:8px;}'
      +'.pn-seat.active{animation:pnSeatGlow 2.4s ease-in-out infinite;}'
      // ─── setup / modal shells ─────────────────────────────────────────
      +'.pn-modal{background:'
      +'radial-gradient(ellipse at top,rgba(200,168,75,0.08),transparent 60%),'
      +'linear-gradient(180deg,rgba(18,22,14,0.98),rgba(10,12,8,0.98));'
      +'box-shadow:0 32px 64px rgba(0,0,0,0.7),0 0 0 1px rgba(200,168,75,0.18),inset 0 1px 0 rgba(255,220,140,0.08);'
      +'border-radius:16px;position:relative;overflow:hidden;}'
      +'.pn-modal::before{content:"";position:absolute;inset:0;border-radius:16px;pointer-events:none;background:'+paper+';opacity:0.3;mix-blend-mode:overlay;}'
      +'.pn-modal>*{position:relative;z-index:1;}'
      // ─── buttons inside game (play nicely with .gb) ──────────────────
      +'#PNpan .gb,#PNsetupOV .gb,#PNreserveOV .gb,#PNreturnOV .gb,#PNpassOV .gb{transition:all 0.16s cubic-bezier(.25,.46,.45,.94);letter-spacing:0.06em;}'
      +'#PNpan .gb:active,#PNsetupOV .gb:active,#PNreserveOV .gb:active,#PNreturnOV .gb:active{transform:translateY(1px) scale(0.98);}'
      // ─── setup input focus ───────────────────────────────────────────
      +'#PNsetupOV input:focus{outline:none;border-color:var(--gold)!important;box-shadow:0 0 0 2px rgba(200,168,75,0.2);}'
      // ─── reserved card band ──────────────────────────────────────────
      +'.pn-reserved-band{background:linear-gradient(90deg,rgba(200,168,75,0.08),rgba(200,168,75,0.02));border:1px solid rgba(200,168,75,0.15);border-radius:8px;padding:6px;}'
      // ─── end-card row animation ──────────────────────────────────────
      +'.pn-standing{animation:pnFadeIn 0.4s ease backwards;}'
      +'.pn-standing:nth-child(1){animation-delay:0.05s}.pn-standing:nth-child(2){animation-delay:0.1s}.pn-standing:nth-child(3){animation-delay:0.15s}.pn-standing:nth-child(4){animation-delay:0.2s}'
      // ─── pass curtain feel ───────────────────────────────────────────
      +'#PNpassOV{background:radial-gradient(ellipse at center,rgba(8,10,6,0.96),rgba(3,4,2,1))!important;}'
      +'#PNpassOV:active{background:radial-gradient(ellipse at center,rgba(18,22,14,0.98),rgba(8,10,6,1))!important;}'
      // ─── rules-modal scrollbar styling ──────────────────────────────
      +'#PNrulesOV .pn-modal{scrollbar-width:thin;scrollbar-color:rgba(200,168,75,0.4) transparent;}'
      +'#PNrulesOV .pn-modal::-webkit-scrollbar{width:6px}'
      +'#PNrulesOV .pn-modal::-webkit-scrollbar-track{background:transparent}'
      +'#PNrulesOV .pn-modal::-webkit-scrollbar-thumb{background:rgba(200,168,75,0.3);border-radius:4px}'
      // ─── header subtle shimmer for the main panel title ──────────────
      +'@keyframes pnHeaderShine{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}'
      // ─── subtle hover lift on pollinators ───────────────────────────
      +'.pn-poll:hover{transform:translateY(-2px);box-shadow:inset 0 1px 0 rgba(255,220,140,0.06),0 6px 14px rgba(0,0,0,0.35)!important;}'
      // ─── respect reduced-motion preference ──────────────────────────
      +'@media (prefers-reduced-motion:reduce){.pn-card,.pn-tok,.pn-poll,.pn-seat{transition:none!important;animation:none!important}.pn-seat.active{animation:none!important;box-shadow:0 0 0 1px var(--gold)!important}}';
    document.head.appendChild(st);
  }
  var pan=document.createElement('div');pan.id='PNpan';
  // Panel grows to use available real estate. On landscape / tablet
  // viewports we let it stretch to 760px so the 4-card tier rows lay
  // out comfortably without horizontal scroll. Portrait phones still
  // get the tighter 440px to keep cards thumb-tappable.
  pan.style.cssText='max-width:min(760px,calc(100vw - 16px));margin:0 auto;padding:6px;user-select:none;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb" onclick="_PNrules()" style="min-height:52px;padding:0.5rem 1rem;font-size:0.72rem;letter-spacing:.1em">📖 RULES</button>'
    +'<button class="gb-new" onclick="_PNnew()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  // ═══ RULES BOOK ═══
  // Structured explainer covering objective, setup, turn actions,
  // production vs tokens, pollinators, winning. First-time players
  // auto-see this once; returning players can reopen anytime.
  window._PNrules=function(){
    var existing=document.getElementById('PNrulesOV');
    if(existing){existing.remove();return;}
    var ov=document.createElement('div');
    ov.id='PNrulesOV';
    ov.style.cssText='position:fixed;inset:0;z-index:200000;display:flex;align-items:center;justify-content:center;background:rgba(5,8,4,0.88);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);padding:16px;animation:pnFadeIn 0.25s ease;';
    ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});
    // Token legend row reused across sections
    var legend=''
      +'<span style="display:inline-flex;align-items:center;gap:3px">'+tokDot('green',16)+'<span style="font-size:0.55rem;color:var(--muted)">GREEN</span></span>'
      +'<span style="display:inline-flex;align-items:center;gap:3px">'+tokDot('rose',16)+'<span style="font-size:0.55rem;color:var(--muted)">ROSE</span></span>'
      +'<span style="display:inline-flex;align-items:center;gap:3px">'+tokDot('blue',16)+'<span style="font-size:0.55rem;color:var(--muted)">BLUE</span></span>'
      +'<span style="display:inline-flex;align-items:center;gap:3px">'+tokDot('amber',16)+'<span style="font-size:0.55rem;color:var(--muted)">AMBER</span></span>'
      +'<span style="display:inline-flex;align-items:center;gap:3px">'+tokDot('spore',16)+'<span style="font-size:0.55rem;color:var(--muted)">SPORE</span></span>'
      +'<span style="display:inline-flex;align-items:center;gap:3px">'+tokDot('gold',16)+'<span style="font-size:0.55rem;color:var(--gold)">GOLD · wild</span></span>';
    // Section builder
    function sec(title,body){
      return '<div style="margin:14px 0 8px;font-family:Bebas Neue,sans-serif;font-size:0.9rem;letter-spacing:0.14em;color:var(--gold);border-bottom:1px solid rgba(200,168,75,0.2);padding-bottom:4px;">'+title+'</div>'
        +'<div style="font-family:DM Mono,monospace;font-size:0.68rem;line-height:1.6;color:var(--cream);">'+body+'</div>';
    }
    function b(text){return '<strong style="color:var(--gold);font-weight:700">'+text+'</strong>';}
    function tip(text){return '<div style="margin-top:6px;padding:6px 10px;background:rgba(122,179,86,0.08);border-left:3px solid var(--sage);font-size:0.62rem;color:rgba(232,220,200,0.85);border-radius:4px;">💡 '+text+'</div>';}
    var h='<div class="pn-modal" style="max-width:440px;width:100%;max-height:86vh;overflow-y:auto;padding:20px 18px;">'
      +'<div style="text-align:center;margin-bottom:6px;">'
      +'<div style="font-family:Playfair Display,serif;font-style:italic;font-size:1.3rem;color:var(--cream);">Master Pollinator</div>'
      +'<div style="font-family:DM Mono,monospace;font-size:0.55rem;color:var(--muted);letter-spacing:0.1em;text-transform:uppercase;">An engine-builder for 1-4 players</div>'
      +'</div>'
      // Tokens legend at the very top — players need this to parse everything below
      +'<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;padding:10px;background:rgba(26,31,23,0.55);border-radius:8px;margin:10px 0 4px;">'+legend+'</div>'
      // 1. GOAL
      +sec('🎯 Goal',
        'First player to <strong>15 Growth Points (GP)</strong> triggers the final round. '
        +'When the active seat comes back around, the game ends and the highest GP wins.<br><br>'
        +'Gain GP by <strong>buying plant cards</strong> (some have GP in the top-left badge) and '
        +'<strong>attracting pollinators</strong> (3 GP each).'
      )
      // 2. SETUP
      +sec('🌱 Setup',
        'Three tiers of plant cards face up:<br>'
        +'&nbsp;&nbsp;• <strong>🌱 Tier 1</strong> — Seedlings. Cheap. Mostly 0 GP, some 1 GP.<br>'
        +'&nbsp;&nbsp;• <strong>🌿 Tier 2</strong> — Saplings. Medium cost. 1–3 GP.<br>'
        +'&nbsp;&nbsp;• <strong>🌳 Tier 3</strong> — Ancients. Expensive. 3–5 GP.<br><br>'
        +'A row of <strong>Pollinators</strong> (3–5 based on player count, 3 GP each).<br>'
        +'A <strong>Supply</strong> of pollen tokens in 5 colors + gold.'
      )
      // 3. ON YOUR TURN
      +sec('🎴 Your Turn — Pick ONE',
        '<div style="margin:4px 0 2px"><strong style="color:var(--sage)">① Take 3 different tokens</strong> — one each of three different colors.</div>'
        +'<div style="margin:2px 0"><strong style="color:var(--sage)">② Take 2 same-color tokens</strong> — both the same color (must be 4+ of that color in supply).</div>'
        +'<div style="margin:2px 0"><strong style="color:var(--sage)">③ Reserve a card</strong> — tap any card, confirm <strong>RESERVE</strong>. Holds it for you, adds <strong>1 gold</strong> (wild) to your pile. Max 3 reserved at a time.</div>'
        +'<div style="margin:2px 0"><strong style="color:var(--sage)">④ Buy a card</strong> — any visible or reserved card you can afford.</div>'
        +tip('You can only do ONE of those four actions per turn.')
      )
      // 4. PRODUCTION vs TOKENS
      +sec('🌾 Production vs Tokens',
        'This is the engine-builder twist:<br><br>'
        +b('Tokens')+' in your pile are currency — spent when you buy.<br>'
        +b('Plants you\'ve bought')+' grant <strong>permanent production</strong> in their '
        +'color (shown on the card\'s top-right chip). Production <strong>discounts</strong> future costs of that color.<br><br>'
        +'Example: you own two cards producing '+tokDot('green',14)+' green. A card that costs 3 green + 1 rose '
        +'effectively costs only <strong>1 green + 1 rose</strong> from your pile. If you own 3 greens, the '
        +'green cost is free.'
      )
      // 5. GOLD
      +sec('🟡 Gold Tokens',
        b('Gold')+' is wild — it substitutes for any color when paying. '
        +'You get 1 gold each time you reserve a card. Use it to buy something you couldn\'t quite afford.'
      )
      // 6. POLLINATORS
      +sec('🦋 Pollinators',
        'Pollinators are attracted <strong>automatically</strong> when your production meets their requirement.<br><br>'
        +'Each pollinator shows production requirements at the bottom (e.g. 3 '+tokDot('green',14)+' + 3 '+tokDot('blue',14)+'). '
        +'Tokens don\'t count — only <strong>plants you\'ve bought</strong>. At the end of any turn where '
        +'your production meets a pollinator\'s requirement, it flies to your garden for <strong>3 GP</strong>.<br><br>'
        +'You can\'t plan for more than one at once — the game picks the first matching pollinator if multiple qualify.'
      )
      // 7. TOKEN LIMIT
      +sec('🪴 Token Limit',
        'If you end your turn holding more than <strong>10 tokens</strong>, return extras to the supply '
        +'until you\'re at 10. Gold counts toward the 10.'
      )
      // 8. END & WINNING
      +sec('🏆 Winning',
        'The moment any player reaches <strong>15 GP</strong>, play continues until the round finishes '
        +'(every player gets the same number of turns). Then the highest GP total wins.<br><br>'
        +'Ties are broken by <strong>fewest plant cards</strong> — efficient play wins.'
      )
      // 9. SHORT TIP SECTION
      +sec('💡 Strategy Tips',
        '• Buying a Tier 1 card is often better than hoarding tokens — production compounds.<br>'
        +'• Watch the pollinators. Picking colors that match their requirements doubles your progress.<br>'
        +'• Reserving gives you gold AND blocks an opponent\'s plan — the strongest Tier 3 cards are worth the slot.<br>'
        +'• The token cap of 10 punishes greed. Take 2 of a color only when you\'ll spend it next turn.'
      )
      +'<div style="display:flex;gap:8px;justify-content:center;margin-top:16px;">'
      +'<button class="gb" onclick="document.getElementById(\'PNrulesOV\').remove()" style="min-height:52px;padding:12px 24px;font-family:Bebas Neue,sans-serif;font-size:0.85rem;letter-spacing:0.12em;color:var(--cream);">CLOSE</button>'
      +'</div>'
      +'</div>';
    ov.innerHTML=h;
    document.body.appendChild(ov);
    try{localStorage.setItem('lw_pn_rules_seen','1');}catch(e){}
  };
  // First-time trigger — auto-open the rules book the first time a
  // new player opens Master Pollinator. After that, they use the
  // RULES button whenever they want a refresher.
  try{
    if(!localStorage.getItem('lw_pn_rules_seen')){
      setTimeout(function(){window._PNrules&&window._PNrules();},700);
    }
  }catch(e){}

  // Token chip — pure CSS opaque circle. Seed PNGs were too painterly
  // to read at game-time sizes (per Stephen). Vivid hex with a small
  // gradient + inset shadow so chips look tactile and never blend into
  // card art behind them.
  var TOK_PALETTE = {
    green: {top:'#7ae07a', mid:'#3da643', edge:'#1e6b25'},
    rose:  {top:'#ff7892', mid:'#d8345b', edge:'#891e36'},
    blue:  {top:'#74b9ff', mid:'#2a78d8', edge:'#10416f'},
    amber: {top:'#ffd770', mid:'#e89a1c', edge:'#7e4a0a'},
    spore: {top:'#fbf6e6', mid:'#d8c9a8', edge:'#6f6448'},
    gold:  {top:'#fff2a8', mid:'#e0b830', edge:'#8a5a0c'}
  };
  function tokDot(c,sz){
    var p = TOK_PALETTE[c] || TOK_PALETTE.spore;
    var rim = sz >= 22 ? 2 : 1;
    return '<span style="display:inline-block;width:'+sz+'px;height:'+sz+'px;border-radius:50%;'
      +'background:radial-gradient(circle at 35% 28%, '+p.top+' 0%, '+p.mid+' 60%, '+p.edge+' 100%);'
      +'border:'+rim+'px solid '+p.edge+';'
      +'box-shadow:inset 0 -1px 2px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.45), 0 1px 2px rgba(0,0,0,0.4);'
      +'vertical-align:middle;flex-shrink:0;"></span>';
  }

  // Art-first renderer: if assets/games/masterpollinator/<slug>.png loads,
  // it fills the centre of the card. On 404 the img element is removed
  // and the emoji tier icon shows through underneath. Flower name sits
  // under the art in small caps so players can read it at a glance.
  // Card layout — art is the focal point. Three layers sit on a cream
  // card face:
  //   • Top-left badge = GP value (only if >0). Filled gold pill, dark
  //     numeral, drop-shadow so it lifts off the art beneath.
  //   • Top-right badge = "use" indicator = the produces-color token,
  //     the same chip you'll spend on future buys.
  //   • Center (~70% of card height) = ART. <img> with object-fit:
  //     contain so any aspect ratio renders without distortion. PNG
  //     missing? Tier-icon emoji shows behind it as a graceful fallback.
  //   • Bottom strip = the COST BAR. Solid translucent band across the
  //     full width, costs rendered as colored chips. Always pinned to
  //     the bottom edge so the bar reads as a foundation under the art.
  //   • Flower name in the cost bar in tiny caps so it's legible without
  //     fighting the art for attention.
  //
  // Tier-aware art path: assets/games/masterpollinator/tier{N}/<slug>.png
  // matches the folder structure Stephen ships art in. Fallback to flat
  // assets/games/masterpollinator/<slug>.png is checked too via two img
  // tags chained by onerror.
  function renderCard(card,isReserved){
    var aff=canAfford(me(),card);
    var border=aff.affordable?'2px solid #7ab356':'2px solid rgba(110,96,81,0.55)';
    var bgShade=card.tier===1?'#4a7c35':card.tier===2?'#c8a84b':'#ffd700';
    var W=96, H=120;
    // CSS chips read clean at small sizes (no painted seed art any
    // more) so the cost bar can be tighter than the seed-era 30-42px
    // range. Cards stay shorter; art gets more vertical space.
    var costCount=0;for(var ck in card.cost)costCount+=card.cost[ck];
    var CHIP=costCount<=4?14:costCount<=6?12:10;
    var BARH=costCount<=4?22:costCount<=6?26:30;
    var GP_PILL=card.gp>0?
      '<div style="position:absolute;top:3px;left:4px;width:24px;height:24px;border-radius:50%;background:linear-gradient(180deg,#fff5d4,#e8c860);color:#2a1f0a;font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center;z-index:3;box-shadow:0 2px 5px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.5);border:1px solid rgba(120,90,20,0.6);">'+card.gp+'</div>'
      :'';
    // Use indicator now actually shows the seed art (token chip),
    // not just a flat color circle — much more obvious which color
    // this card produces. tokDot already uses Stephen's seed PNG.
    var USE_PILL=
      '<div style="position:absolute;top:3px;right:4px;z-index:3;box-shadow:0 2px 5px rgba(0,0,0,0.5);border-radius:50%;">'+tokDot(card.produces,24)+'</div>';
    // Two-stage art lookup: tier folder first, then flat fallback.
    var artTier='assets/games/masterpollinator/tier'+card.tier+'/'+card.slug+'.png';
    var artFlat='assets/games/masterpollinator/'+card.slug+'.png';
    var artImg=card.slug?(
      '<img src="'+artTier+'" alt="" '
      +'onerror="if(this.src.indexOf(\'/tier\')>=0){this.src=\''+artFlat+'\';}else{this.style.display=\'none\';}" '
      +'style="position:absolute;left:2px;right:2px;top:2px;bottom:'+BARH+'px;width:calc(100% - 4px);height:calc(100% - '+(BARH+2)+'px);object-fit:contain;z-index:1;pointer-events:none;">'
    ):'';
    // Cost bar — solid band pinned to bottom, full width, with chips.
    var costChips='';
    for(var c in card.cost){for(var i=0;i<card.cost[c];i++)costChips+=tokDot(c,CHIP);}
    // No name strip on the card — cards stay art-only per Stephen's
    // direction. Name + flower facts live behind the inspect button.
    var costBar=
      '<div style="position:absolute;left:0;right:0;bottom:0;height:'+BARH+'px;background:linear-gradient(180deg,rgba(248,242,224,0.94),rgba(232,222,188,0.96));border-top:1px solid rgba(120,100,60,0.4);display:flex;align-items:center;justify-content:center;gap:2px;flex-wrap:wrap;padding:2px 3px;z-index:2;box-shadow:inset 0 1px 0 rgba(255,255,255,0.5);">'+costChips+'</div>';
    // No (i) icon — long-press the card to inspect (handler attached
    // via _PNlongPress on touchstart/mousedown). Cleaner card face.
    var infoBtn='';
    var fallbackEmoji=
      '<div style="position:absolute;left:0;right:0;top:14px;bottom:'+(BARH+4)+'px;display:flex;align-items:center;justify-content:center;font-size:24px;opacity:0.55;z-index:0;">'+TIER_ICONS[card.tier-1]+'</div>';
    // Tap any card -> opens inspect modal with action buttons (BUY /
    // RESERVE / BACK). No more insta-buy on affordable cards. Stephen
    // explicitly wants the zoom-in moment first so you can read the
    // flower name + see the art big before committing.
    var h='<div class="pn-card'+(aff.affordable?' aff':'')+'" style="width:'+W+'px;height:'+H+'px;border-radius:8px;border:'+border+';border-left:4px solid '+bgShade+';display:inline-block;vertical-align:top;margin:3px;position:relative;cursor:pointer;color:#1a1f17;box-shadow:0 2px 6px rgba(0,0,0,0.32);overflow:hidden;background:linear-gradient(180deg,#fbf6e6,#f0e8ce);" '
      +'onclick="_PNinspect('+card.id+','+(isReserved?'true':'false')+')">';
    h+=fallbackEmoji+artImg+GP_PILL+USE_PILL+infoBtn+costBar+'</div>';
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
      rows+='<div class="pn-standing" style="display:flex;justify-content:space-between;padding:8px 10px;background:'+(isWin?'rgba(200,168,75,0.18)':'rgba(26,31,23,0.5)')+';border:1px solid '+(isWin?'rgba(200,168,75,0.45)':'rgba(122,179,86,0.1)')+';border-radius:8px;margin-bottom:4px;font-family:DM Mono,monospace;font-size:0.68rem;">'
        +'<span style="color:'+(isWin?'var(--gold)':'var(--cream)')+';">'+(isWin?'🏆 ':'')+(i+1)+'. '+esc(p.name)+(p.isAI?' <span style="color:var(--muted);font-size:0.55rem;">AI</span>':'')+'</span>'
        +'<span style="color:'+(isWin?'var(--gold)':'var(--sage)')+';font-weight:700;">'+p.gp+' GP</span>'
        +'</div>';
    }
    card.innerHTML='<div class="pn-modal" style="padding:2rem 1.5rem;max-width:360px;width:100%;text-align:center;'+(humanWon?'box-shadow:0 32px 64px rgba(0,0,0,0.7),0 0 0 1px rgba(200,168,75,0.45),0 0 40px rgba(200,168,75,0.25),inset 0 1px 0 rgba(255,220,140,0.1);':'')+'">'+
      '<div style="font-size:3rem;margin-bottom:0.5rem;">'+(humanWon?'🌸':'🐝')+'</div>'+
      '<div style="font-family:Bebas Neue,sans-serif;font-size:1.5rem;color:'+(humanWon?'var(--gold)':'var(--cream)')+';letter-spacing:0.12em;margin-bottom:0.6rem;">'+esc(winner.name.toUpperCase())+' WINS</div>'+
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
      h+='<div class="pn-seat'+(isActive?' active':'')+'" style="background:'+bg+';border:1px solid '+bd+';padding:4px 6px;text-align:center;font-family:DM Mono,monospace;">'
        +'<div style="font-size:0.55rem;color:'+nameClr+';letter-spacing:0.05em;word-break:break-word;">'+esc(p.name)+(p.isAI?' 🤖':'')+'</div>'
        +'<div style="font-family:Bebas Neue,sans-serif;font-size:0.95rem;color:'+nameClr+';">'+p.gp+'</div>'
        +'</div>';
    }
    h+='</div>';
    var active=me();
    if(GS.phase==='player')h+='<div style="text-align:center;color:var(--sage);font-size:0.7rem;padding:2px;">, '+esc(active.name)+"'s turn,</div>";
    else if(GS.phase==='ai')h+='<div style="text-align:center;color:#c47a7a;font-size:0.7rem;padding:2px;">, '+esc(active.name)+' thinking,</div>';
    // Pollinators
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.85rem;color:var(--cream);letter-spacing:0.1em;margin:8px 0 4px;text-align:center;">POLLINATORS</div>';
    h+='<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:3px;justify-content:center;">';
    GS.pollinators.forEach(function(p){
      var claimedBy=null;
      if(p.claimedBy!==null&&p.claimedBy!==undefined){
        for(var ci=0;ci<GS.players.length;ci++)if(GS.players[ci].id===p.claimedBy){claimedBy=GS.players[ci];break;}
      }
      var bg,tag='';
      if(claimedBy){
        bg='rgba(200,168,75,0.18);border-color:var(--gold)';
        tag='<div style="font-size:0.45rem;color:var(--gold);margin-top:2px;">'+esc(claimedBy.name)+'</div>';
      } else {
        bg='rgba(26,31,23,0.5);border-color:rgba(122,179,86,0.2)';
      }
      // Pollinator card — same art-first treatment as plant cards.
      // Tier-aware path: assets/games/masterpollinator/pollinators/<slug>.png
      // Falls back to flat pollinator-<slug>.png, then to emoji on miss.
      var pTier='assets/games/masterpollinator/pollinators/'+(p.slug||'')+'.png';
      var pFlat='assets/games/masterpollinator/pollinator-'+(p.slug||'')+'.png';
      var pArt=p.slug?(
        '<img src="'+pTier+'" alt="" '
        +'onerror="if(this.src.indexOf(\'/pollinators/\')>=0){this.src=\''+pFlat+'\';}else{this.style.display=\'none\';}" '
        +'style="position:absolute;left:2px;right:2px;top:2px;bottom:36px;width:calc(100% - 4px);height:calc(100% - 38px);object-fit:contain;z-index:1;pointer-events:none;">'
      ):'';
      var pEmoji='<div style="position:absolute;inset:6px 0 38px;display:flex;align-items:center;justify-content:center;font-size:24px;opacity:0.55;z-index:0;">'+p.icon+'</div>';
      h+='<div class="pn-poll" style="position:relative;width:88px;height:108px;background:'+bg+';border:1px solid;border-radius:8px;text-align:center;font-size:10px;flex-shrink:0;overflow:hidden;">';
      h+=pEmoji+pArt;
      // GP badge top-right
      h+='<div style="position:absolute;top:2px;right:3px;width:18px;height:18px;border-radius:50%;background:linear-gradient(180deg,#fff5d4,#e8c860);color:#2a1f0a;font-weight:800;font-size:10px;display:flex;align-items:center;justify-content:center;z-index:3;border:1px solid rgba(120,90,20,0.6);box-shadow:0 1px 3px rgba(0,0,0,0.4);">'+p.gp+'</div>';
      // Name strip
      h+='<div style="position:absolute;left:0;right:0;bottom:18px;font-family:DM Mono,monospace;font-size:6.5px;letter-spacing:0.04em;color:var(--cream);text-transform:uppercase;text-shadow:0 1px 2px rgba(0,0,0,0.8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 3px;z-index:3;">'+esc(p.name)+'</div>';
      // Requirement bar at bottom — bigger so seeds read.
      h+='<div style="position:absolute;left:0;right:0;bottom:0;height:30px;background:linear-gradient(180deg,rgba(13,16,12,0.6),rgba(13,16,12,0.88));display:flex;align-items:center;justify-content:center;gap:6px;z-index:3;border-top:1px solid rgba(122,179,86,0.2);">';
      for(var c in p.req)h+='<span style="display:inline-flex;align-items:center;gap:3px;color:'+COLOR_HEX[c]+';font-weight:800;font-size:13px;">'+tokDot(c,20)+p.req[c]+'</span>';
      h+='</div>';
      if(tag){h+='<div style="position:absolute;top:2px;left:3px;font-size:0.5rem;color:var(--gold);background:rgba(13,16,12,0.7);border-radius:4px;padding:1px 4px;z-index:3;">'+esc(claimedBy.name)+'</div>';}
      h+='</div>';
    });
    h+='</div>';
    // Market — tabbed by tier so each tier's full-size cards fit one
    // screen without horizontal scroll on phone. Stephen 2026-05-11:
    // restructure was "see board + cards + chips + actions all on one
    // screen, don't lose image size." Tabs cut market height by ~2/3.
    var _tiers=[
      {n:1,name:'SEEDLING',icon:'🌱',mkt:GS.market1,deck:GS.deck1},
      {n:2,name:'SAPLING', icon:'🌿',mkt:GS.market2,deck:GS.deck2},
      {n:3,name:'ANCIENT', icon:'🌳',mkt:GS.market3,deck:GS.deck3}
    ];
    var _at=GS.activeTier||1;
    // Tab strip — small chips with tier name + remaining deck count.
    // Active tier has gold border.
    h+='<div style="display:flex;gap:4px;justify-content:center;margin:6px 0 4px;">';
    _tiers.forEach(function(t){
      var act=(t.n===_at);
      var bg=act?'rgba(200,168,75,0.18)':'rgba(26,31,23,0.55)';
      var bd=act?'var(--gold)':'rgba(122,179,86,0.15)';
      var clr=act?'var(--gold)':'var(--cream)';
      h+='<button onclick="_PNtier('+t.n+')" '
        +'style="flex:1;max-width:130px;min-height:42px;padding:6px 4px;background:'+bg+';border:1.5px solid '+bd+';border-radius:8px;color:'+clr+';cursor:pointer;font-family:Bebas Neue,sans-serif;letter-spacing:0.06em;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.1;-webkit-tap-highlight-color:transparent;">'
        +'<div style="font-size:0.62rem;">T'+t.n+' '+t.icon+' '+t.name+'</div>'
        +'<div style="font-size:0.5rem;color:var(--muted);margin-top:1px;">'+t.deck.length+' left</div>'
        +'</button>';
    });
    h+='</div>';
    // Active tier's card row.
    var _activeT=_tiers[_at-1];
    h+='<div style="display:flex;align-items:center;gap:6px;margin:4px 0;">';
    h+='<div style="flex:1;overflow-x:auto;-webkit-overflow-scrolling:touch;display:flex;gap:6px;align-items:flex-start;justify-content:flex-start;padding-bottom:2px;min-height:160px;">';
    _activeT.mkt.forEach(function(c){if(c)h+=renderCard(c,false);});
    if(_activeT.mkt.length===0)h+='<div style="flex:1;text-align:center;color:var(--muted);font-size:0.7rem;padding:30px 0;">Tier exhausted</div>';
    h+='</div>';
    h+='</div>';
    // Supply
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.85rem;color:var(--cream);letter-spacing:0.1em;margin:8px 0 4px;">SUPPLY</div>';
    h+='<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">';
    COLORS.concat(['gold']).forEach(function(c){
      var sel=GS.selectedTokens.indexOf(c)>=0;
      // Supply pills — primary view of currency. Big enough that the
      // painted seed art actually shows. Stacks chip ABOVE count so
      // both read clearly without a horizontal squeeze.
      var sty='padding:10px 14px;background:'+(sel?'rgba(122,179,86,0.22)':'rgba(26,31,23,0.65)')+';border:2px solid '+(sel?'#7ab356':'rgba(122,179,86,0.22)')+';border-radius:14px;min-height:78px;min-width:74px;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:pointer;';
      h+='<div class="pn-tok'+(sel?' sel':'')+'" style="'+sty+'" onclick="_PNsup(\''+c+'\')">'+tokDot(c,46)+'<span style="font-family:Bebas Neue,sans-serif;font-size:1.1rem;color:var(--cream);line-height:1;font-weight:800;">'+GS.supply[c]+'</span></div>';
    });
    h+='</div>';
    // Active player area — shows whoever's turn it is (hides others'
    // reserved cards, which the pass-curtain also reinforces).
    var meRef=me();
    h+='<div style="background:rgba(26,31,23,0.4);border:1px solid rgba(200,168,75,0.12);border-radius:8px;padding:6px;margin:6px 0;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.85rem;color:var(--gold);letter-spacing:0.1em;">'+esc(meRef.name.toUpperCase())+' · POLLEN ('+totalTok(meRef.tokens)+'/10)</div>';
    h+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin:3px 0;">';
    COLORS.concat(['gold']).forEach(function(c){if(meRef.tokens[c]>0)h+='<span style="font-size:12px;">'+tokDot(c,12)+' '+meRef.tokens[c]+'</span>';});
    h+='</div>';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.8rem;color:var(--cream);letter-spacing:0.1em;">PLANTS</div>';
    h+='<div style="display:flex;gap:2px;flex-wrap:wrap;">';
    COLORS.forEach(function(c){for(var i=0;i<(meRef.production[c]||0);i++)h+=tokDot(c,22);});
    if(meRef.cards.length===0)h+='<span style="font-size:10px;color:var(--muted);">None yet</span>';
    h+='</div>';
    if(meRef.reserved.length>0){
      h+='<div class="pn-reserved-band" style="margin-top:8px;">';
      h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.72rem;color:var(--gold);letter-spacing:0.12em;margin-bottom:4px;">HAND · '+meRef.reserved.length+'/3</div>';
      h+='<div>';meRef.reserved.forEach(function(c){h+=renderCard(c,true);});h+='</div>';
      h+='</div>';
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
  // Stephen 2026-05-11: switch which tier the market displays.
  window._PNtier=function(n){
    n=parseInt(n,10);
    if(!GS||n<1||n>3)return;
    GS.activeTier=n;
    render();
  };
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
    var h='<div class="pn-modal" style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:22px 20px;max-width:300px;width:100%;">';
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

  // ─── INSPECT MODAL ──────────────────────────────────────────────────
  // Tap the (i) on any card → opens a zoomed-art modal with the
  // flower's name (educational moment). Cards with hideName:true in the
  // catalog show "Mystery Bloom" instead — used for real flowers whose
  // common names aren't kid-safe (e.g. Hookers Lips / Psychotria elata).
  // No buy/reserve action here — pure information. Tap outside or the
  // CLOSE button to dismiss.
  window._PNinspect=function(id, isReserved){
    var card=findCard(id);if(!card)return;
    isReserved=(isReserved===true||isReserved==='true');
    var existing=document.getElementById('PNinspectOV');if(existing)existing.remove();
    var ov=document.createElement('div');ov.id='PNinspectOV';
    ov.style.cssText='position:fixed;inset:0;z-index:200000;display:flex;align-items:center;justify-content:center;background:rgba(5,8,4,0.86);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);padding:16px;animation:pnFadeIn 0.22s ease;';
    ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});
    var bgShade=card.tier===1?'#4a7c35':card.tier===2?'#c8a84b':'#ffd700';
    var artTier='assets/games/masterpollinator/tier'+card.tier+'/'+card.slug+'.png';
    var artFlat='assets/games/masterpollinator/'+card.slug+'.png';
    var displayName=card.hideName?'Mystery Bloom':esc(card.name||'');
    var tierName=TIER_NAMES[card.tier-1]||'';
    var aff = me() && !me().isAI ? canAfford(me(),card) : {affordable:false};
    var canRes = me() && !me().isAI && me().reserved.length<3 && !isReserved && GS.phase==='player';
    var canAct = me() && !me().isAI && GS.phase==='player';
    // Cost row uses LARGE chips so the seeds are clearly visible.
    var costRow='';
    for(var c in card.cost){for(var i=0;i<card.cost[c];i++)costRow+=tokDot(c,28);}
    var h='<div class="pn-modal" style="max-width:380px;width:100%;padding:18px 16px;font-family:DM Mono,monospace;text-align:center;">';
    // Tier ribbon at top
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.7rem;letter-spacing:0.18em;color:'+bgShade+';margin-bottom:8px;">'+tierName.toUpperCase()+'</div>';
    // Big art (or emoji fallback if PNG missing)
    h+='<div style="position:relative;width:100%;height:280px;background:linear-gradient(180deg,#fbf6e6,#f0e8ce);border-radius:10px;border:2px solid '+bgShade+';overflow:hidden;margin-bottom:12px;">';
    // Emoji fallback — only visible if the art img fails to load.
    // Was always visible at 45% opacity behind the art and fighting
    // for attention. Now it's hidden by default and only the onerror
    // path reveals it.
    h+='<div class="pn-fallback-emoji" style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;font-size:120px;opacity:0.5;">'+TIER_ICONS[card.tier-1]+'</div>';
    if(card.slug){
      var fbShow="this.style.display='none';var fb=this.parentNode.querySelector('.pn-fallback-emoji');if(fb)fb.style.display='flex';";
      h+='<img src="'+artTier+'" alt="" '
        +'onerror="if(this.src.indexOf(\'/tier\')>=0){this.src=\''+artFlat+'\';}else{'+fbShow+'}" '
        +'style="position:absolute;inset:6px;width:calc(100% - 12px);height:calc(100% - 12px);object-fit:contain;">';
    } else {
      // No slug at all — show emoji directly
      h+='<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:120px;opacity:0.5;">'+TIER_ICONS[card.tier-1]+'</div>';
    }
    h+='</div>';
    // Flower name (educational)
    h+='<div style="font-family:Playfair Display,serif;font-style:italic;font-size:1.4rem;color:var(--cream);margin-bottom:4px;">'+displayName+'</div>';
    if(card.hideName){
      h+='<div style="font-family:DM Mono,monospace;font-size:0.5rem;color:var(--muted);margin-bottom:8px;">, scientific name kept hidden,</div>';
    }
    // Stats row: GP + produces (large)
    h+='<div style="display:flex;gap:18px;justify-content:center;align-items:center;margin:10px 0;font-family:DM Mono,monospace;color:var(--cream);">';
    if(card.gp>0)h+='<span style="display:inline-flex;align-items:center;gap:4px;"><span style="color:var(--gold);font-size:1.4rem;font-weight:800;">'+card.gp+'</span><span style="color:var(--muted);font-size:0.6rem;">GP</span></span>';
    h+='<span style="display:inline-flex;align-items:center;gap:6px;">'+tokDot(card.produces,28)+'<span style="color:var(--muted);font-size:0.6rem;">produces</span></span>';
    h+='</div>';
    // Cost row — big chips
    if(costRow){
      h+='<div style="background:linear-gradient(180deg,rgba(248,242,224,0.18),rgba(232,222,188,0.12));border:1px solid rgba(200,168,75,0.3);border-radius:10px;padding:10px;margin:10px 0;">';
      h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.65rem;letter-spacing:0.14em;color:var(--muted);margin-bottom:6px;">COST</div>';
      h+='<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">'+costRow+'</div>';
      h+='</div>';
    }
    // Action buttons — buy / reserve / back
    h+='<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:12px;">';
    if(canAct && aff.affordable){
      var buyAction=isReserved?'_PNinspectBuyReserved('+card.id+')':'_PNinspectBuy('+card.id+')';
      h+='<button class="gb" onclick="'+buyAction+'" style="flex:1 1 120px;min-height:54px;padding:12px;font-size:0.85rem;letter-spacing:0.1em;color:var(--sage);border-color:var(--sage);background:rgba(122,179,86,0.18);">🌱 BUY</button>';
    }
    if(canAct && canRes){
      h+='<button class="gb" onclick="_PNinspectReserve('+card.id+')" style="flex:1 1 120px;min-height:54px;padding:12px;font-size:0.8rem;letter-spacing:0.1em;color:var(--gold);border-color:var(--gold);background:rgba(200,168,75,0.18);">🔒 RESERVE</button>';
    }
    if(canAct && !aff.affordable && !canRes && !isReserved && me().reserved.length>=3){
      h+='<div style="flex:1;color:var(--muted);font-size:0.6rem;padding:14px;">Hand is full · buy a reserved card first</div>';
    }
    h+='<button class="gb" onclick="document.getElementById(\'PNinspectOV\').remove()" style="flex:1 1 100px;min-height:54px;padding:12px;font-size:0.7rem;letter-spacing:0.1em;color:var(--cream);">BACK</button>';
    h+='</div>';
    h+='</div>';
    ov.innerHTML=h;
    document.body.appendChild(ov);
  };
  // Inspect-modal action handlers — close modal, then run the action.
  window._PNinspectBuy=function(id){
    var card=findCard(id);if(!card)return;
    var md=findMD(id);if(!md)return;
    document.getElementById('PNinspectOV').remove();
    buyCard(card, md.market, md.deck);
  };
  window._PNinspectBuyReserved=function(id){
    var card=findCard(id);if(!card)return;
    document.getElementById('PNinspectOV').remove();
    buyReserved(card);
  };
  window._PNinspectReserve=function(id){
    var card=findCard(id);if(!card)return;
    var md=findMD(id);if(!md)return;
    document.getElementById('PNinspectOV').remove();
    reserveCard(card, md.market, md.deck);
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
