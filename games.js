// ═══ LUCID WINDS — games.js ═══
// Game engine: 28+ mini-games, _e() hash earning, growth strip
// ════════════════════════════════════════════

(function(){
'use strict';
// ═══ GAME CATEGORIES + THUMBNAILS (set-39) ═══
// Each game has: id, name, icon (fallback), rules, category, thumb (image path)
// Categories: card, puzzle, board, pattern, creative
// Thumbnails: assets/games/thumbs/{id}.png — 240x240 PNG, dark bg, single iconic element
var G_CATS=[
  {key:'card',    label:'CARD GAMES',     icon:'\ud83c\udca1'},
  {key:'puzzle',  label:'PUZZLES',        icon:'\ud83e\udde9'},
  {key:'board',   label:'BOARD GAMES',    icon:'\u265f'},
  {key:'pattern', label:'PATTERN & MEMORY',icon:'\ud83e\udde0'},
  {key:'dice',    label:'DICE GAMES',     icon:'\ud83c\udfb2'},
  {key:'creative',label:'CREATIVE',       icon:'\ud83c\udfb5'}
];
var G=[
{id:'set',n:'SET Match',i:'\ud83c\udccf',r:'Tap 3 cards where each trait is ALL same or ALL different.',cat:'card',thumb:'assets/games/thumbs/set.png'},
{id:'memory',n:'Memory',i:'\ud83e\udde0',r:'Flip 2 cards per turn. Match all pairs to clear the board.',cat:'pattern',thumb:'assets/games/thumbs/memory.png'},
{id:'merge',n:'2048',i:'\ud83c\udf3f',r:'Swipe or tap arrows to merge same-number tiles. Reach 2048!',cat:'puzzle',thumb:'assets/games/thumbs/merge.png'},
{id:'simon',n:'Echo',i:'\ud83d\udd04',r:'Watch the pattern flash, then repeat it in order. How far can you go?',cat:'pattern',thumb:'assets/games/thumbs/simon.png'},
{id:'lights',n:'Lights Out',i:'\ud83c\udf44',r:'Tap a light to toggle it AND its 4 neighbors. Turn all dark!',cat:'puzzle',thumb:'assets/games/thumbs/lights.png'},
{id:'mines',n:'Minesweeper',i:'\ud83e\udda0',r:'Tap to dig. Numbers show adjacent mines. Flag with \ud83d\udea9 mode.',cat:'board',thumb:'assets/games/thumbs/mines.png'},
{id:'sudoku',n:'Sudoku',i:'\ud83d\udd22',r:'Fill every row, column and 3\u00d73 box with digits 1-9.',cat:'puzzle',thumb:'assets/games/thumbs/sudoku.png'},
{id:'wordsearch',n:'Word Search',i:'\ud83d\udd24',r:'Tap letters in sequence to find hidden botanical words.',cat:'puzzle',thumb:'assets/games/thumbs/wordsearch.png'},
{id:'hanoi',n:'Tower of Hanoi',i:'\ud83d\uddfc',r:'Move all discs to the right peg. Never place big on small.',cat:'puzzle',thumb:'assets/games/thumbs/hanoi.png'},
{id:'slider',n:'15 Puzzle',i:'\ud83e\udde9',r:'Slide tiles into the empty space. Arrange them 1-15 in order.',cat:'puzzle',thumb:'assets/games/thumbs/slider.png'},
{id:'picross',n:'Picross',i:'\ud83d\udd33',r:'Fill or cross squares from row/column clues to reveal a hidden picture.',cat:'puzzle',thumb:'assets/games/thumbs/picross.png'},
{id:'colorsort',n:'Color Sort',i:'\ud83e\uddea',r:'Pour colors between tubes until each holds a single color. Match tops to pour.',cat:'puzzle',thumb:'assets/games/thumbs/colorsort.png'},
{id:'battleship',n:'Battleship',i:'\ud83c\udf0a',r:'Hunt hidden vessels on a 10\u00d710 grid. Sink them all in as few shots as you can.',cat:'board',thumb:'assets/games/thumbs/battleship.png'},
{id:'flood',n:'Flood Fill',i:'\ud83c\udf42',r:'Tap a color to flood from the top-left. Fill the whole board in one color!',cat:'puzzle',thumb:'assets/games/flood/leaf-crimson.png'},
{id:'pipe',n:'Pipe Puzzle',i:'\ud83c\udf3f',r:'Rotate pipe tiles to connect the flow from source to end!',cat:'puzzle',thumb:'assets/games/thumbs/pipe.png'},
{id:'chess',n:'Chess',i:'\u265f',r:'Classic chess against AI. Tap a piece, tap where to move.',cat:'board',thumb:'assets/games/thumbs/chess.png'},
{id:'c4',n:'Connect Four',i:'\ud83c\udf38',r:'Drop pieces to connect 4 in a row \u2014 horizontal, vertical, or diagonal!',cat:'board',thumb:'assets/games/thumbs/c4.png'},
{id:'song',n:'Music Studio',i:'\ud83c\udfb5',r:'Full music production studio. Layer drums, bass, keys and leads \u2014 make beats, earn dew.',cat:'creative',thumb:'assets/games/thumbs/song.png'},
{id:'golf',n:'Golf Solitaire',i:'\u26f3',r:'Move cards one rank up or down to the waste pile. Clear the tableau!',cat:'card',thumb:'assets/games/thumbs/golf.png'},
{id:'klondike',n:'Klondike',i:'\ud83c\udca1',r:'The classic. Build 4 foundation piles Ace to King by suit.',cat:'card',thumb:'assets/games/thumbs/klondike.png'},
{id:'spider',n:'Spider',i:'\ud83d\udd77',r:'Build complete King-to-Ace runs by suit. 1, 2, or 4 suit variants.',cat:'card',thumb:'assets/games/thumbs/spider.png'},
{id:'freecell',n:'FreeCell',i:'\ud83c\udfd7',r:'All cards visible. Use 4 free cells to maneuver. Pure strategy!',cat:'card',thumb:'assets/games/thumbs/freecell.png'},
{id:'pyramid',n:'Pyramid',i:'\ud83d\udd3a',r:'Remove pairs that sum to 13. Kings remove alone. Clear the pyramid!',cat:'card',thumb:'assets/games/thumbs/pyramid.png'},
{id:'tripeaks',n:'TriPeaks',i:'\u26f0',r:'Build up or down on the waste pile to clear three peaks.',cat:'card',thumb:'assets/games/thumbs/tripeaks.png'},
{id:'mastermind',n:'Mastermind',i:'\ud83c\udf31',r:'Crack the hidden 4-element code. Green = right pick, right spot. Gold = right pick, wrong spot.',cat:'board',thumb:'assets/games/thumbs/mastermind.png'},
{id:'checkers',n:'Checkers',i:'\u265f',r:'Jump over opponent pieces to capture. Reach the far side to crown a King.',cat:'board',thumb:'assets/games/thumbs/checkers.png'},
{id:'reversi',n:'Reversi',i:'\u25cf',r:'Place your moss to surround and flip lichen. Control the most territory to win.',cat:'board',thumb:'assets/games/thumbs/reversi.png'},
{id:'yahtzee',n:'Seed Toss',i:'\ud83c\udfb2',r:'Roll 5 seed dice up to 3 times. Hold keepers, score in 13 categories. Aim high!',cat:'dice',thumb:'assets/games/thumbs/yahtzee.png'},
{id:'farkle',n:'Farkle',i:'\ud83c\udfb2',r:'Roll 6 dice. Keep 1s, 5s, and three-of-a-kinds. Roll again or bank — zero scorers and you bust!',cat:'dice',thumb:'assets/games/thumbs/farkle.png'},
{id:'doubleshutter',n:'Double Shutter',i:'\ud83c\udfb2',r:'Shut the box twice! Roll 2 dice and flip any open tiles that sum to your roll. Both rows shut = perfect game.',cat:'dice',thumb:'assets/dice/d6.png'},
{id:'sokoban',n:'Sokoban',i:'\ud83d\udc31',r:'Push boxes onto the targets. Watch your step — boxes only push, never pull!',cat:'puzzle',thumb:'assets/games/thumbs/sokoban.png'},
{id:'backgammon',n:'Backgammon',i:'\ud83c\udfb2',r:'Roll dice, move pieces around the board. Bear off all 15 first to win!',cat:'board',thumb:'assets/games/thumbs/backgammon.png'},
{id:'bloomwheel',n:'Bloom Wheel',i:'\ud83c\udf38',r:'Draw botanical mandalas on a spinning canvas synced to a generative beat.',cat:'creative',thumb:'assets/games/thumbs/bloomwheel.png'},
{id:'petalfall',n:'Block Drop',i:'\ud83c\udf38',r:'Arrange falling blocks to clear rows. Speed increases every 10 lines!',cat:'puzzle',thumb:'assets/games/thumbs/petalfall.png'}
];
var _a='set',_m=0,_mTotal=0,_t=null,_s=0,RK='sws_fg_gr3',_dm=1.0;
// ═══ HASH ACCUMULATION BUFFER ═══
// 32 bytes = 64 hex chars. Buffer starts random-seeded so rarity distribution
// is correct from byte 0. Each hash earned XORs additional entropy on top.
// At 30 filled blocks, buffer converts to plant hash → mint → reseed.
var _hashBuf=new Uint8Array(32);
var _hashFilled=0;
// First mint costs 10 hashes, all subsequent mints cost 30
function _getMintCost(){
  var gh=[];try{gh=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');}catch(e){}
  // Gift plant doesn't count — check for player-earned mints
  var earned=gh.filter(function(p){return p.origin!=='gift'&&p.origin!=='onboarding';});
  return earned.length===0?10:30;
}
window._getMintCost=_getMintCost;
function _seedHashBuf(){_hashBuf=new Uint8Array(32);crypto.getRandomValues(_hashBuf);_hashFilled=0;_persistHashBuf();}
// Restore state from localStorage
try{
  _mTotal=parseInt(localStorage.getItem('pw_mTotal')||'0',10)||0;
  _hashFilled=parseInt(localStorage.getItem('pw_hashFilled')||'0',10)||0;
  _m=_hashFilled;
  var _savedBuf=localStorage.getItem('pw_hashBuf')||'';
  if(_savedBuf.length===64){
    for(var _bi=0;_bi<32;_bi++){_hashBuf[_bi]=parseInt(_savedBuf.substr(_bi*2,2),16)||0;}
  }else{crypto.getRandomValues(_hashBuf);}
  // Migration: old _mTotal progress with no buffer → seed buffer
  if(_mTotal>0&&!localStorage.getItem('pw_hashBuf')){
    _hashFilled=_mTotal%30;
    if(_mTotal>0&&_hashFilled===0)_hashFilled=0;
    if(_hashFilled>0){
      crypto.getRandomValues(_hashBuf);
      var _mHex='';for(var _mi=0;_mi<32;_mi++)_mHex+=('0'+_hashBuf[_mi].toString(16)).slice(-2);
      localStorage.setItem('pw_hashBuf',_mHex);
      localStorage.setItem('pw_hashFilled',String(_hashFilled));
    }
  }
  // Pending mint recovery
  var _pendingMint=localStorage.getItem('pw_pendingMint');
  if(_pendingMint&&_pendingMint.length===64){
    if(window.mintPlant)window.mintPlant(_pendingMint);
    localStorage.removeItem('pw_pendingMint');
  }
}catch(e){_mTotal=0;_hashFilled=0;_hashBuf=new Uint8Array(32);crypto.getRandomValues(_hashBuf);}
// ═══ HASH BUFFER PERSISTENCE ═══
function _persistHashBuf(){
  var hex='';for(var j=0;j<32;j++)hex+=('0'+_hashBuf[j].toString(16)).slice(-2);
  try{localStorage.setItem('pw_hashBuf',hex);}catch(e){}
  try{localStorage.setItem('pw_hashFilled',String(_hashFilled));}catch(e){}
}
// ═══ ACCUMULATE HASH ENTROPY ═══
function _accumulateHash(amt){
  var rnd=new Uint8Array(amt);
  crypto.getRandomValues(rnd);
  var posBytes=new Uint8Array(amt);
  crypto.getRandomValues(posBytes);
  for(var i=0;i<amt;i++){
    var pos=posBytes[i]%32;
    _hashBuf[pos]^=rnd[i];
  }
  _hashFilled+=amt;
  _persistHashBuf();
}
// ═══ ANTI-FARM GUARD SYSTEM ═══
// Prevents speed-farming via: min play time, progress caps, completion cooldown
var _afSessionProg=0;     // progress events earned this session
var _afLastComplete=0;    // timestamp of last game_win/game_loss reward
var _afCompleteCd=45;     // seconds between completion rewards
// Per-game-class limits
var _afClass={
  // class → { minTime (sec), progCap (per session), tier }
  sprint:   {minTime:20,progCap:3},
  standard: {minTime:45,progCap:4},
  marathon: {minTime:90,progCap:6}
};
// Game → class mapping
var _afGameClass={
  memory:'sprint',lights:'sprint',simon:'sprint',flood:'sprint',c4:'standard',song:'free',
  pipe:'standard',hanoi:'standard',
  set:'marathon',merge:'marathon',mines:'marathon',wordsearch:'marathon',sudoku:'marathon',chess:'marathon',
  golf:'standard',klondike:'marathon',spider:'marathon',freecell:'marathon',pyramid:'standard',tripeaks:'standard',
  mastermind:'standard',
  checkers:'standard',
  reversi:'standard',
  yahtzee:'marathon'
};
// Reset guards on game switch (called from _sg)
function _afReset(){_afSessionProg=0;}

// ═══ ATTENTION WEIGHT TABLE v2.0 — Anti-Farm Economy ═══
// game_win: completion reward for winning
// game_loss: completion reward for losing (flat 1, acknowledge effort)
// progress/milestone: capped per session by _afClass
// _dm (difficulty multiplier) applied: Easy=1.0, Med=1.5, Hard=2.0, Expert=2.5
var _aw={
  memory:    {progress:1,game_win:2,game_loss:1,default:0},
  lights:    {puzzle_solved:1,game_win:2,game_loss:0,default:0},
  simon:     {round:1,game_win:2,game_loss:0,default:0},
  flood:     {game_win:2,game_loss:0,default:0},
  pipe:      {progress:1,game_win:3,game_loss:0,default:0},
  hanoi:     {milestone:1,game_win:3,game_loss:0,default:0},
  set:       {pheno:1,game_win:5,game_loss:0,default:0},
  merge:     {reached:1,game_win:4,game_loss:1,default:0},
  mines:     {cleared:1,game_win:5,game_loss:0,default:0},
  wordsearch:{milestone:1,game_win:5,game_loss:0,default:0},
  sudoku:    {progress:1,milestone:1,game_win:5,game_loss:0,default:0},
  chess:     {game_win:8,game_loss:1,default:0},
  c4:        {game_win:4,game_loss:0,default:0},
  song:      {default:0},
  golf:      {progress:1,game_win:4,game_loss:1,default:0},
  klondike:  {progress:1,milestone:1,game_win:6,game_loss:1,default:0},
  spider:    {progress:1,milestone:1,game_win:8,game_loss:1,default:0},
  freecell:  {progress:1,milestone:1,game_win:6,game_loss:1,default:0},
  pyramid:   {progress:1,game_win:5,game_loss:1,default:0},
  tripeaks:  {progress:1,game_win:4,game_loss:1,default:0},
  mastermind:{progress:1,game_win:5,game_loss:1,default:0},
  checkers:{capture:1,game_win:5,game_loss:1,default:0},
  reversi:{flip:1,game_win:5,game_loss:1,default:0},
  yahtzee:{progress:1,milestone:1,game_win:5,default:0},
  sokoban:{progress:1,game_win:3,default:0},
  colorsort:{progress:1,game_win:4,default:0},
  battleship:{hit:1,game_win:5,game_loss:1,default:0},
  picross:{progress:1,game_win:4,default:0},
  slider:{milestone:1,game_win:3,default:0},
  farkle:{progress:1,milestone:1,game_win:5,game_loss:0,default:0},
  backgammon:{progress:1,milestone:1,game_win:6,game_loss:1,default:0},
  bloomwheel:{progress:1,milestone:2,default:0},
  petalfall:{milestone:2,game_win:3,game_loss:0,default:0}
};
function _setDiff(lv){switch(lv){case 'easy':_dm=1.0;break;case 'medium':_dm=1.5;break;case 'hard':_dm=2.0;break;case 'expert':_dm=2.5;break;default:_dm=1.0}}
function _gr(){try{return JSON.parse(localStorage.getItem(RK))||{}}catch(e){return{}}}
function _sr(g,r){var c=_gr();if(!c[g])c[g]={p:0,w:0,b:0};c[g].p++;if(r.w)c[g].w++;if(r.s>c[g].b)c[g].b=r.s;try{localStorage.setItem(RK,JSON.stringify(c))}catch(e){}}
function sh(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
// ═══ WEIGHTED _e() — Core attention hash engine + anti-farm guards ═══
var _justMinted=false;
function _e(v){
  var w=_aw[_a]||{};
  var base=w[v]||w[v.replace(/_\d+$/,'')]||w['default']||0;
  // ── ANTI-FARM GUARD 1: Progress/milestone cap per session ──
  var isProgress=(v==='progress'||v==='milestone'||v==='cleared'||v==='capture'||v==='flip'||v==='hit'||v==='sequence'||v==='pheno'||v==='puzzle_solved');
  if(isProgress){
    var gc=_afClass[_afGameClass[_a]||'standard']||_afClass.standard;
    if(_afSessionProg>=gc.progCap){base=0;}
    else{_afSessionProg++;}
  }
  // ── ANTI-FARM GUARD 2: Min play time for completion events ──
  var isComplete=(v==='game_win'||v==='game_loss');
  if(isComplete&&_s>0){
    var elapsed=Math.floor((Date.now()-_s)/1000);
    var gc2=_afClass[_afGameClass[_a]||'standard']||_afClass.standard;
    if(elapsed<gc2.minTime){
      console.log('[_e] BLOCKED — played '+elapsed+'s, need '+gc2.minTime+'s min');
      if(v==='game_win')_guardToast('Play '+(gc2.minTime-elapsed)+'s more to earn');
      base=0;
    }
  }
  // ── ANTI-FARM GUARD 3: Completion cooldown ──
  if(isComplete&&base>0){
    var now=Date.now();
    if(_afLastComplete>0&&(now-_afLastComplete)/1000<_afCompleteCd){
      console.log('[_e] BLOCKED — completion cooldown ('+Math.round(_afCompleteCd-(now-_afLastComplete)/1000)+'s left)');
      base=0;
    }else{
      _afLastComplete=now;
    }
  }
  var amt=Math.round(base*_dm);
  if(amt>0){
    if(window.earnHashes)window.earnHashes(amt);
    _mTotal+=amt;
    try{localStorage.setItem('pw_mTotal',String(_mTotal));}catch(e){}
    // Accumulate entropy into hash buffer
    var prevFilled=_hashFilled;
    _accumulateHash(amt);
    // UI feedback
    _m=Math.min(_hashFilled,30);
    var hEl=document.getElementById('_h');if(hEl)hEl.textContent=_m;
    _hashToast(amt);_play('hash');
    _checkDailyWelcome();
    // Milestone pings
    if(prevFilled<10&&_hashFilled>=10&&_hashFilled<30){
      var _mc=(_getMintCost?_getMintCost():30);
      _milestoneToast('Sprout','10/'+_mc+' \u2014 your seed is growing');
    }else if(prevFilled<20&&_hashFilled>=20){
      var _mc2=(_getMintCost?_getMintCost():30);
      if(_hashFilled<_mc2)_milestoneToast('Growing','20/'+_mc2+' \u2014 leaves are forming');
    }else if(prevFilled<25&&_hashFilled>=25){
      var _mc3=(_getMintCost?_getMintCost():30);
      if(_hashFilled<_mc3){_milestoneToast('Almost!',(_mc3-_hashFilled)+' more to Full Bloom');if(window._haptic)_haptic('tab');}
    }
    // MINT when buffer reaches target (10 for first plant, 30 thereafter)
    var _mintCost=(_getMintCost?_getMintCost():30);
    if(_hashFilled>=_mintCost){
      var overflow=_hashFilled-_mintCost;
      // Extract the accumulated hash
      var hex='';for(var bi=0;bi<32;bi++)hex+=('0'+_hashBuf[bi].toString(16)).slice(-2);
      // Save pending mint for crash recovery
      try{localStorage.setItem('pw_pendingMint',hex);}catch(e){}
      // Reseed buffer BEFORE minting (prevents double-mint, fresh random base)
      _hashBuf=new Uint8Array(32);crypto.getRandomValues(_hashBuf);
      _hashFilled=0;_m=0;
      // Re-accumulate overflow into fresh seeded buffer
      if(overflow>0){
        var extraRnd=new Uint8Array(overflow);crypto.getRandomValues(extraRnd);
        var extraPos=new Uint8Array(overflow);crypto.getRandomValues(extraPos);
        for(var oi=0;oi<overflow;oi++){_hashBuf[extraPos[oi]%32]^=extraRnd[oi];}
        _hashFilled=overflow;_m=overflow;
      }
      _persistHashBuf();
      // Mint the plant
      console.log('[_e] MINT triggered, hash:',hex);
      try{
        if(window.mintPlant)window.mintPlant(hex);
      }catch(err){console.error('[_e] mintPlant error:',err);}
      // Clear pending on success
      try{localStorage.removeItem('pw_pendingMint');}catch(e){}
      if(window.syncVaultToCloud)setTimeout(syncVaultToCloud,800);
      // Celebration
      _justMinted=true;
      _showMintCelebration(hex);
    }
  }
  _updateGP();
  if(window.updateFocusPlant)window.updateFocusPlant();
  // Win celebration for game_complete (skipped if mint celebration showing)
  if(v==='game_win'&&_a!=='sokoban')_showWinCelebration();
}
window._e=_e;
window._getHashProgress=function(){return _hashFilled;};
// ═══ MINT CELEBRATION — epic reveal when plant blooms ═══
function _showMintCelebration(fullHash){
  _playWin();
  if(window._haptic)_haptic('bloom');
  var old=document.getElementById('pw-win-overlay');if(old)old.remove();
  var gh=[];try{gh=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');}catch(ex){gh=[];}
  var svg='<div style="font-size:3rem;color:var(--sage);">&#10047;</div>';
  if(typeof window._generatePlantSVG==='function'){try{svg=window._generatePlantSVG(fullHash,200,1.0);}catch(e){}}
  var _plantName='';try{if(window.getPlantName)_plantName=window.getPlantName(fullHash);}catch(e){}
  var _haiku=null;try{if(window.getHaiku)_haiku=window.getHaiku(fullHash);}catch(e){}
  var tip='Your first plant! Visit your Greenhouse to see it.';
  if(gh.length>=20)tip='Botanist status. Your greenhouse is filling up.';
  else if(gh.length>=10)tip='Serious collector. Drop a plant in the Wild to claim territory.';
  else if(gh.length>=5)tip='Collection growing! Check your Terra Grade scores.';
  else if(gh.length>=2)tip='Two plants! Try cross-breeding in the Nursery.';
  var ov=document.createElement('div');ov.id='pw-win-overlay';
  ov.style.cssText='position:fixed;inset:0;z-index:99997;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(5,8,4,0.95);backdrop-filter:blur(16px);animation:panelFadeIn 0.4s ease;padding:1.5rem;';
  var h='<div style="text-align:center;max-width:340px;">';
  // Phase 1: "FULL BLOOM" header
  h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.55rem;color:var(--sage);letter-spacing:0.22em;margin-bottom:0.2rem;opacity:0;animation:tierFadeIn 0.5s ease 0.2s forwards;">FULL BLOOM</div>';
  // Phase 2: Plant silhouette → revealed (no rarity — save for inspect)
  h+='<div id="mint-plant-reveal" style="margin:0.2rem auto;opacity:0;transform:scale(0.3);filter:brightness(0) blur(6px);transition:all 1.4s cubic-bezier(0.16,1,0.3,1);">'+svg+'</div>';
  // Phase 3: Plant name only — rarity hidden until greenhouse inspect
  h+='<div style="font-family:Playfair Display,serif;font-size:0.8rem;font-weight:700;color:var(--cream);margin-bottom:0.1rem;opacity:0;animation:tierFadeIn 0.5s ease 2.0s forwards;">'+(_plantName||'Unknown Specimen')+'</div>';
  // Phase 4: Mystery hint instead of tier reveal
  h+='<div style="font-family:DM Mono,monospace;font-size:0.4rem;color:var(--gold);letter-spacing:0.06em;opacity:0;animation:tierFadeIn 0.5s ease 2.6s forwards;">Inspect in your Greenhouse to discover its grade</div>';
  // Phase 5: Haiku
  if(_haiku){
    h+='<div style="font-family:Playfair Display,serif;font-size:0.42rem;font-style:italic;color:rgba(232,220,200,0.7);line-height:1.8;margin:0.2rem 0 0.3rem;opacity:0;animation:tierFadeIn 0.5s ease 3.2s forwards;">';
    h+=_haiku.line1+'<br>'+_haiku.line2+'<br>'+_haiku.line3+'</div>';
  }
  // Phase 6: Tip
  h+='<div style="font-family:DM Mono,monospace;font-size:0.35rem;color:var(--cream);opacity:0;margin-bottom:0.4rem;animation:tierFadeIn 0.5s ease '+((_haiku?3.8:3.2))+'s forwards;">'+tip+'</div>';
  // Phase 7: Buttons
  var btnDelay=_haiku?4.2:3.6;
  h+='<div style="opacity:0;animation:tierFadeIn 0.4s ease '+btnDelay+'s forwards;">';
  h+='<button onclick="_dismissWin();switchTab(\'greenhouse\');" style="width:100%;padding:0.55rem;margin-bottom:0.3rem;border:1.5px solid rgba(200,168,75,0.4);border-radius:8px;background:linear-gradient(180deg,rgba(200,168,75,0.2),rgba(120,100,40,0.3));color:var(--gold);font-family:Bebas Neue,sans-serif;font-size:0.85rem;letter-spacing:0.1em;cursor:pointer;min-height:48px;">VIEW IN GREENHOUSE</button>';
  h+='<button onclick="_dismissWin();_restartCurrentGame();" style="width:100%;padding:0.45rem;border:1.5px solid rgba(122,179,86,0.25);border-radius:8px;background:rgba(46,60,38,0.3);color:var(--sage);font-family:Bebas Neue,sans-serif;font-size:0.65rem;letter-spacing:0.08em;cursor:pointer;min-height:44px;">KEEP PLAYING</button>';
  h+='</div></div>';
  ov.innerHTML=h;document.body.appendChild(ov);
  // Phase 2 trigger: plant grows from silhouette
  setTimeout(function(){var rv=document.getElementById('mint-plant-reveal');if(rv){rv.style.opacity='1';rv.style.transform='scale(1)';rv.style.filter='brightness(1) blur(0px)';}},600);
  // Haptic + sound at name reveal
  setTimeout(function(){if(window._haptic)_haptic('bloom');if(window._play)_play('match');},2000);
  // Gold radial flash
  var flash=document.createElement('div');flash.style.cssText='position:absolute;inset:0;background:radial-gradient(circle,rgba(200,168,75,0.6),rgba(200,168,75,0) 70%);pointer-events:none;opacity:0;animation:mintFlash 1.2s ease forwards;';ov.appendChild(flash);
  // SVG leaf/petal particle burst (no emojis)
  var _leafColors=['#7ab356','#5a9a3a','#c8a84b','#8a9178','#4a7c35','#9ab87a'];
  for(var si=0;si<20;si++){(function(i){
    var angle=(i/20)*Math.PI*2+Math.random()*0.3;
    var dist=80+Math.random()*120;
    var dx=Math.cos(angle)*dist;
    var dy=Math.sin(angle)*dist;
    var rot=Math.floor(Math.random()*360);
    var sz=6+Math.floor(Math.random()*8);
    var col=_leafColors[i%_leafColors.length];
    var sp=document.createElement('div');
    // Inline SVG leaf shape — no emojis
    sp.innerHTML='<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 12 12"><path d="M6,1 C8,3 10,5 10,8 C10,10 8,11 6,11 C4,11 2,10 2,8 C2,5 4,3 6,1Z" fill="'+col+'" opacity="0.85"/><path d="M6,2 L6,10" stroke="rgba(255,255,255,0.3)" stroke-width="0.4" fill="none"/></svg>';
    sp.style.cssText='position:absolute;left:50%;top:40%;pointer-events:none;opacity:0;transform:rotate('+rot+'deg);animation:sparkBurst 2s ease forwards;animation-delay:'+(i*30)+'ms;--sdx:'+dx+'px;--sdy:'+dy+'px;';
    ov.appendChild(sp);
  })(si);}
  // Floating petal drift (gentle, slow — replaces _spawnLeafParticles)
  for(var pi=0;pi<10;pi++){(function(i){
    var x=10+Math.random()*80;
    var delay=i*400+Math.random()*600;
    var dur=3+Math.random()*3;
    var sz=4+Math.floor(Math.random()*5);
    var col=_leafColors[i%_leafColors.length];
    var drift=document.createElement('div');
    drift.innerHTML='<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 10 10"><ellipse cx="5" cy="5" rx="4" ry="2.5" fill="'+col+'" opacity="0.5" transform="rotate('+(Math.random()*60-30)+' 5 5)"/></svg>';
    drift.style.cssText='position:absolute;left:'+x+'%;top:-5%;pointer-events:none;opacity:0;animation:petalDrift '+dur+'s ease-in '+delay+'ms forwards;';
    ov.appendChild(drift);
  })(pi);}
  // Auto-dismiss after 20 seconds
  setTimeout(function(){if(document.getElementById('pw-win-overlay'))_dismissWin();},20000);
}
// ═══ WIN CELEBRATION — game complete (non-mint) ═══
function _showWinCelebration(){
  // Skip if mint celebration is already showing
  if(_justMinted){_justMinted=false;return;}
  _playWin();
  var inPlant=Math.min(_hashFilled,30);
  var ov=document.createElement('div');ov.id='pw-win-overlay';
  ov.style.cssText='position:fixed;inset:0;z-index:99997;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(5,8,4,0.92);backdrop-filter:blur(14px);animation:panelFadeIn 0.4s ease;padding:1.5rem;';
  var h='<div style="text-align:center;max-width:340px;">';
  var pct=Math.round((inPlant/30)*100);
  var _winNear=inPlant>=25;var _winRemain=30-inPlant;
  h+='<div style="font-family:Bebas Neue,sans-serif;font-size:1.2rem;color:var(--cream);letter-spacing:0.1em;margin-bottom:0.15rem;">WELL PLAYED</div>';
  h+='<div style="font-family:DM Mono,monospace;font-size:0.5rem;color:var(--gold);margin-bottom:0.4rem;">'+inPlant+' / 30 Sunbeams</div>';
  h+='<div style="width:100%;height:10px;background:rgba(42,48,37,0.6);border-radius:5px;overflow:hidden;margin-bottom:0.15rem;"><div class="'+(_winNear?'near-bloom':'')+'" style="width:'+pct+'%;height:100%;background:linear-gradient(90deg,var(--leaf),var(--sage)'+(_winNear?',var(--gold)':'')+');border-radius:5px;transition:width 0.8s ease;"></div></div>';
  if(_winNear){h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.6rem;color:var(--gold);margin-bottom:0.4rem;animation:nearBloomPulse 1.5s ease infinite;">'+_winRemain+' MORE TO FULL BLOOM</div>';}
  else{h+='<div style="font-family:DM Mono,monospace;font-size:0.4rem;color:var(--muted);margin-bottom:0.5rem;">'+inPlant+' / 30 to next plant</div>';}
  h+='<button onclick="_dismissWin();_restartCurrentGame();" style="width:100%;padding:'+(_winNear?'0.65rem':'0.55rem')+';margin-bottom:0.3rem;border:1.5px solid '+(_winNear?'rgba(200,168,75,0.5)':'rgba(122,179,86,0.35)')+';border-radius:8px;background:linear-gradient(180deg,'+(_winNear?'rgba(200,168,75,0.25),rgba(120,100,40,0.35)':'rgba(74,124,53,0.3),rgba(26,60,22,0.4)')+');color:'+(_winNear?'var(--gold)':'var(--sage)')+';font-family:Bebas Neue,sans-serif;font-size:'+(_winNear?'0.95rem':'0.85rem')+';letter-spacing:0.1em;cursor:pointer;min-height:48px;">'+(_winNear?'ONE MORE GAME':'PLAY AGAIN')+'</button>';
  h+='<button onclick="_dismissWin();_openGamePicker();" style="width:100%;padding:0.45rem;margin-bottom:0.3rem;border:1px solid rgba(200,188,160,0.12);border-radius:8px;background:rgba(46,40,32,0.3);color:var(--cream);font-family:Bebas Neue,sans-serif;font-size:0.6rem;letter-spacing:0.06em;cursor:pointer;min-height:44px;">TRY ANOTHER GAME</button>';
  h+='<button onclick="_dismissWin();switchTab(\'greenhouse\');" style="width:100%;padding:0.35rem;border:none;border-radius:8px;background:none;color:var(--muted);font-family:DM Mono,monospace;font-size:0.4rem;cursor:pointer;min-height:38px;">view greenhouse →</button>';
  h+='</div>';ov.innerHTML=h;document.body.appendChild(ov);
  setTimeout(function(){if(document.getElementById('pw-win-overlay'))_dismissWin();},15000);
}
function _dismissWin(){var o=document.getElementById('pw-win-overlay');if(o)o.remove();}
window._dismissWin=_dismissWin;
function _restartCurrentGame(){
  _xt();_m=_mTotal%30;
  if(_a==='set'){_st();return}
  var ag=document.getElementById('fg-ag');if(!ag)return;
  ag.innerHTML='';
  var _solG2={golf:1,klondike:1,spider:1,freecell:1,pyramid:1,tripeaks:1};
  ag.classList.toggle('sol',!!_solG2[_a]);
  var gi=null;for(var i=0;i<G.length;i++)if(G[i].id===_a){gi=G[i];break}
  if(gi){var r=document.createElement('div');r.className='gr';r.textContent='📖 '+gi.r;ag.appendChild(r)}
  var fn=window._gameFns||{};
  try{if(fn[_a])fn[_a](ag);else{ag.innerHTML='<div style="padding:2rem;text-align:center;color:var(--muted);font-family:DM Mono,monospace;font-size:0.5rem;">Game not loaded yet. Tap another game.</div>';}}catch(e){console.error('[Game '+_a+']',e);ag.innerHTML+='<div style="padding:2rem;text-align:center;color:#c75050">Game error — tap 🔄 New to retry</div>'}
  var gps=document.getElementById('gp-strip');if(gps&&gps.classList.contains('on')){try{_updateGP()}catch(e){}}
  _st();
}
window._restartCurrentGame=_restartCurrentGame;
function _openGamePicker(){
  _op();
}
window._openGamePicker=_openGamePicker;
function _spawnLeafParticles(container){
  var leaves=['🍃','🌿','🍂','🌱','☘️'];
  for(var i=0;i<15;i++){
    (function(idx){
      setTimeout(function(){
        var p=document.createElement('div');
        p.textContent=leaves[idx%leaves.length];
        p.style.cssText='position:absolute;font-size:'+(0.6+Math.random()*0.8)+'rem;left:'+(10+Math.random()*80)+'%;top:'+(20+Math.random()*40)+'%;opacity:0;pointer-events:none;animation:leafFloat '+(3+Math.random()*3)+'s ease forwards;animation-delay:'+Math.random()*0.5+'s;';
        container.appendChild(p);
        setTimeout(function(){if(p.parentNode)p.remove();},7000);
      },idx*120);
    })(i);
  }
}
// ═══ Hash toast — floating "+N ⚡" feedback ═══
function _hashToast(n){
  var s=document.getElementById('gp-strip');if(!s)return;
  var t=document.createElement('div');t.className='hash-toast';t.textContent='+'+n+' \u26a1';
  s.appendChild(t);setTimeout(function(){if(t.parentNode)t.remove()},1300);
}
function _guardToast(msg){
  var s=document.getElementById('gp-strip');if(!s)return;
  var t=document.createElement('div');t.className='hash-toast';t.style.color='var(--muted)';t.style.fontSize='0.5rem';t.textContent=msg;
  s.appendChild(t);setTimeout(function(){if(t.parentNode)t.remove()},2200);
}
// ═══ DAILY WELCOME — first hash earn of the day ═══
var _dailyWelcomed = false;
function _checkDailyWelcome(){
  if(_dailyWelcomed) return;
  var today = new Date().toISOString().slice(0,10);
  var lastDay = '';
  try { lastDay = localStorage.getItem('lw_last_play_day')||''; } catch(e){}
  if(lastDay !== today){
    _dailyWelcomed = true;
    try { localStorage.setItem('lw_last_play_day', today); } catch(e){}
    // Count days played
    var daysPlayed = 1;
    try { daysPlayed = parseInt(localStorage.getItem('lw_days_played')||'0',10) + 1; localStorage.setItem('lw_days_played', String(daysPlayed)); } catch(e){}
    // Count plants
    var plantCount = 0;
    try { plantCount = JSON.parse(localStorage.getItem('sws_greenhouse')||'[]').length; } catch(e){}
    var welcomeTitle = daysPlayed <= 1 ? 'Welcome, Keeper' : 'Day ' + daysPlayed;
    var welcomeSub = plantCount > 0 ? plantCount + ' plant' + (plantCount>1?'s':'') + ' in your greenhouse' : 'Play games to grow your first plant';
    _milestoneToast(welcomeTitle, welcomeSub);
  } else {
    _dailyWelcomed = true;
  }
}

function _milestoneToast(title, sub){
  var t=document.createElement('div');
  t.style.cssText='position:fixed;top:4.5rem;left:50%;transform:translateX(-50%);z-index:99998;background:rgba(26,36,22,0.92);border:1.5px solid rgba(200,168,75,0.3);border-radius:10px;padding:0.4rem 1rem;text-align:center;pointer-events:none;backdrop-filter:blur(8px);animation:tierFadeIn 0.4s ease;';
  t.innerHTML='<div style="font-family:Bebas Neue,sans-serif;font-size:0.65rem;color:var(--gold);letter-spacing:0.1em;">'+title+'</div><div style="font-family:DM Mono,monospace;font-size:0.35rem;color:var(--cream);opacity:0.7;">'+sub+'</div>';
  document.body.appendChild(t);
  setTimeout(function(){t.style.transition='opacity 0.5s';t.style.opacity='0';setTimeout(function(){if(t.parentNode)t.remove()},600)},2200);
}
// ═══ Universal Growth Strip — plant + progress bar ═══
function _updateGP(){
  var el=document.getElementById('gp-strip');if(!el)return;
  var inPlant=Math.min(_hashFilled,30);
  var prog=Math.min(inPlant/30,1.0);
  var lbl=prog<=0.1?'Seed':prog<=0.3?'Sprout':prog<=0.6?'Seedling':prog<=0.9?'Growing':'Full Bloom';
  // Preview plant from actual hash buffer — player sees REAL plant forming
  var pvh='';
  for(var pi=0;pi<32;pi++)pvh+=('0'+_hashBuf[pi].toString(16)).slice(-2);
  var svg=(typeof window._generatePlantSVG==='function'&&inPlant>0)?window._generatePlantSVG(pvh,48,prog):'<div style="font-size:1.5rem;text-align:center">\ud83c\udf31</div>';
  var pct=Math.round(prog*100);
  var remain=30-inPlant;
  var _nearCls=prog>=0.83&&prog<1?' near-bloom':'';
  var _urgentLabel=prog>=0.83&&prog<1?' \u2014 <span style="color:var(--gold);">'+remain+' to bloom!</span>':'';
  var _gpTxt='<span class="gp-count">'+inPlant+'/30</span>DEW<span class="gp-stage">· '+lbl+(prog>=0.83&&prog<1?' · '+remain+' TO BLOOM':'')+'</span>';
  el.innerHTML='<div class="gp-lbl">'+_gpTxt+'</div><div style="flex:1;min-width:0"><div class="gp-bar"><div class="gp-fill'+_nearCls+'" style="width:'+pct+'%;transition:none"></div></div></div>';
  setTimeout(function(){var f=el.querySelector('.gp-fill');if(f)f.style.transition='';},60);
  // Sync Trios dashboard hash bar
  var thc=document.getElementById('th-count');if(thc)thc.textContent=inPlant;
  var thf=document.getElementById('th-fill');if(thf)thf.style.width=pct+'%';
  var ths=document.getElementById('th-stage');if(ths)ths.textContent=lbl;
}
// ═══ GAME SOUND SYSTEM — botanical synth, premium feel ═══
var _sctx=null;
function _getACtx(){if(!_sctx){try{_sctx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}return _sctx;}
// Play a single tone with envelope
function _tone(freq,dur,type,vol,delay){
  var ctx=_getACtx();if(!ctx)return;
  var t=ctx.currentTime+(delay||0);
  var o=ctx.createOscillator(),g=ctx.createGain();
  o.type=type||'sine';o.frequency.value=freq;
  g.gain.setValueAtTime(vol||0.06,t);
  g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  o.connect(g);g.connect(ctx.destination);
  o.start(t);o.stop(t+dur+0.01);
}
// Play a chord (multiple frequencies)
function _chord(freqs,dur,type,vol){
  for(var i=0;i<freqs.length;i++)_tone(freqs[i],dur,type,(vol||0.04),0);
}
// Named sound profiles — each is a small composition
var _sfxDef={
  // UI
  tap:    function(){_tone(520,0.04,'sine',0.05);},
  click:  function(){_tone(680,0.03,'square',0.03);},
  flip:   function(){_tone(400,0.06,'triangle',0.04);_tone(600,0.06,'triangle',0.03,0.04);},
  slide:  function(){_tone(350,0.08,'triangle',0.04);},
  // Game
  match:  function(){_tone(523,0.1,'sine',0.05);_tone(659,0.1,'sine',0.04,0.06);_tone(784,0.15,'sine',0.05,0.12);}, // C-E-G arpeggio
  hash:   function(){_tone(880,0.05,'sine',0.04);_tone(1108,0.08,'sine',0.03,0.03);}, // bright ping + shimmer
  snap:   function(){_tone(580,0.03,'square',0.04);},
  buzz:   function(){_tone(160,0.15,'sawtooth',0.04);_tone(140,0.1,'sawtooth',0.03,0.08);}, // low warning
  lose:   function(){_tone(330,0.2,'triangle',0.04);_tone(260,0.3,'triangle',0.04,0.15);}, // descending
  dice:   function(){_tone(220,0.12,'sawtooth',0.03);_tone(280,0.08,'sawtooth',0.02,0.06);},
  // Wild
  drop:   function(){_tone(440,0.08,'sine',0.04);_tone(554,0.1,'sine',0.04,0.05);_tone(659,0.15,'sine',0.04,0.1);}, // A-C#-E plant-down arpeggio
  dig:    function(){_tone(280,0.05,'triangle',0.04);_tone(350,0.04,'triangle',0.03,0.03);},
  // Discovery/reward
  discover:function(){_tone(659,0.08,'sine',0.04);_tone(784,0.08,'sine',0.04,0.06);_tone(988,0.15,'sine',0.05,0.12);}, // E-G-B discovery sparkle
  collect: function(){_chord([523,659,784],0.2,'sine',0.03);_tone(1047,0.3,'sine',0.04,0.15);}, // C major + high C
  water:   function(){_tone(600,0.1,'sine',0.03);_tone(800,0.08,'sine',0.02,0.06);_tone(700,0.12,'sine',0.03,0.1);}, // water droplet cascade
};

function _play(id){
  if(!window.FG_Audio||!FG_Audio.enabled)return;
  var fn=_sfxDef[id];if(fn)try{fn();}catch(e){}
}

window._play=_play;

function _playWin(){
  if(!window.FG_Audio||!FG_Audio.enabled)return;
  try{
    // Victory fanfare: C major 7th arpeggio → resolve
    _tone(523,0.12,'sine',0.05);      // C5
    _tone(659,0.12,'sine',0.05,0.08); // E5
    _tone(784,0.12,'sine',0.05,0.16); // G5
    _tone(988,0.2,'sine',0.05,0.24);  // B5
    _tone(1047,0.4,'sine',0.06,0.36); // C6 — resolve
    // Soft pad underneath
    _chord([262,330,392],0.6,'triangle',0.02);
  }catch(e){}
}
window._playWin=_playWin;
function _st(){_s=Date.now();if(_t)clearInterval(_t);_t=setInterval(function(){var e=document.getElementById('_tt');if(!e)return;var s=Math.floor((Date.now()-_s)/1000);e.textContent=Math.floor(s/60)+':'+(s%60<10?'0':'')+(s%60)},500)}
function _xt(){if(_t){clearInterval(_t);_t=null}}
function sm(t){var m=document.getElementById('_gm');if(m)m.textContent=t}
function _solEnterFS(){
  var ag=document.getElementById('fg-ag');
  if(ag){ag.classList.add('sol-fs')}
  document.body.classList.add('sol-fs');
}
function _solClearFS(){
  var ag=document.getElementById('fg-ag');
  if(ag){ag.classList.remove('sol-fs')}
  document.body.classList.remove('sol-fs');
}
function _solExitFS(){
  _solClearFS();
  window._sg('set');
}
window._solExitFS=_solExitFS;
function ms(a,x){
  var isSol=document.body.classList.contains('sol-fs');
  var tb=document.createElement('div');
  tb.className='gu-bar';
  tb.innerHTML=(isSol?'<button onclick="_solExitFS()" style="background:rgba(74,124,53,.2);border:1px solid rgba(74,124,53,.35);border-radius:6px;color:var(--sage);font-family:DM Sans,sans-serif;font-size:clamp(.5rem,1.4vw,.65rem);font-weight:700;padding:4px 10px;cursor:pointer;display:flex;align-items:center;gap:4px;min-height:32px;-webkit-tap-highlight-color:transparent">&#9664; GAMES</button>':'')
    +'<div class="gu-left">'+(x||'')+'</div>'
    +'<div class="gu-right">'
    +'<span class="gh">\u26A1<strong id="_h">'+_m+'</strong></span>'
    +' \u00B7 \u23F1<span id="_tt">0:00</span>'
    +' <button class="gu-btn" onclick="triggerTutorialDemo()" title="How to play">\u2753</button>'
    +' <button class="gu-btn" onclick="if(window._toggleCB)window._toggleCB()" title="Color blind mode">\uD83C\uDFA8</button>'
    +' <button class="gu-btn" onclick="if(window.openShop)window.openShop()" title="Shop">\uD83D\uDC8E</button>'
    +'</div>';
  a.appendChild(tb);
  _updateGP();
}
function mm(a,t){var d=document.createElement('div');d.className='gm';d.id='_gm';d.textContent=t||'';a.appendChild(d)}
function mc(a){var d=document.createElement('div');d.className='gcr';a.appendChild(d);return d}

// ═══ PICKER ═══
function _bp(){var p=document.getElementById('fg-pk');if(!p)return;p.innerHTML='';
  // ALL GAMES button
  var allBtn=document.createElement('div');allBtn.className='fg-c';allBtn.style.cssText='background:linear-gradient(145deg,rgba(200,168,75,0.12),rgba(200,168,75,0.04));border-color:rgba(200,168,75,0.2);';
  allBtn.innerHTML='<span class="fi">\ud83c\udfae</span><span class="fn" style="color:var(--gold);">ALL GAMES</span>';
  allBtn.addEventListener('click',_op);p.appendChild(allBtn);
  // Category chips — quick-filter by type
  G_CATS.forEach(function(cat){
    var count=G.filter(function(g){return g.cat===cat.key}).length;
    if(!count)return;
    var c=document.createElement('div');c.className='fg-c';
    c.innerHTML='<span class="fi">'+cat.icon+'</span><span class="fn">'+cat.label+'</span>';
    c.addEventListener('click',function(){_opCat(cat.key)});p.appendChild(c);
  });
  // Science button
  var sciBtn=document.createElement('div');sciBtn.className='fg-c';sciBtn.innerHTML='<span class="fi">\ud83d\udd2c</span><span class="fn">SCIENCE</span>';
  sciBtn.addEventListener('click',_os);p.appendChild(sciBtn);}
// Open picker filtered to one category
function _opCat(catKey){
  _op();
  // Auto-open the matching category, close others
  setTimeout(function(){
    document.querySelectorAll('.gp-cat').forEach(function(el){
      if(el.getAttribute('data-cat')===catKey){el.classList.add('open');el.querySelector('.gp-chev').classList.add('open');}
      else{el.classList.remove('open');el.querySelector('.gp-chev').classList.remove('open');}
    });
  },50);
}
function _op(){var _bnav2=document.querySelector('.fg-bottomnav');if(_bnav2)_bnav2.style.display='flex';var o=document.getElementById('fg-ov'),rc=_gr();
  // Build categorized accordion picker with thumbnails
  var h='<div style="max-width:460px;margin:0 auto;padding:0.5rem">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">';
  h+='<div style="font-family:Bebas Neue,sans-serif;font-size:1.2rem;color:var(--gold);letter-spacing:.1em">CHOOSE YOUR GAME</div>';
  h+='<button class="gb" onclick="_cp()" style="min-height:44px;padding:0.4rem 0.8rem;">CLOSE</button></div>';
  // Category accordions
  var gi=0;
  G_CATS.forEach(function(cat){
    var games=G.filter(function(g){return g.cat===cat.key});
    if(!games.length)return;
    var catId='gcat-'+cat.key;
    var curCat=false;for(var ci=0;ci<games.length;ci++)if(games[ci].id===_a){curCat=true;break}
    h+='<div class="gp-cat'+(curCat?' open':'')+'" data-cat="'+cat.key+'">';
    h+='<button class="gp-cat-hdr" onclick="this.parentElement.classList.toggle(\'open\');this.querySelector(\'.gp-chev\').classList.toggle(\'open\')">';
    h+='<span class="gp-cat-icon">'+cat.icon+'</span>';
    h+='<span class="gp-cat-label">'+cat.label+'</span>';
    h+='<span class="gp-cat-count">'+games.length+'</span>';
    h+='<span class="gp-chev'+(curCat?' open':'')+'">\u25bc</span>';
    h+='</button>';
    h+='<div class="gp-cat-body"><div class="fk2-grid">';
    games.forEach(function(g){
      var r=rc[g.id]||{};var isNew=!r.p;
      h+='<div class="fk2" onclick="_sg(\''+g.id+'\');_cp()" style="animation-delay:'+(gi*20)+'ms;'+(isNew?'border-color:rgba(200,168,75,0.25);':'')+'">';
      // Thumbnail or emoji fallback
      if(g.thumb){
        h+='<div class="fk2-thumb"><img src="'+g.thumb+'" alt="" onerror="this.parentElement.innerHTML=\'<span style=font-size:1.6rem>'+g.i+'</span>\'"></div>';
      }else{
        h+='<div style="font-size:1.6rem;margin-bottom:4px;position:relative;">'+g.i+'</div>';
      }
      if(isNew)h+='<span class="fk2-new">NEW</span>';
      h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.6rem;color:var(--gold);letter-spacing:0.06em;line-height:1.2;">'+g.n+'</div>';
      h+=(r.p?'<div style="font-size:0.3rem;color:var(--muted);margin-top:3px;">'+r.p+' played'+(r.w?' \u00b7 '+r.w+' won':'')+'</div>':'<div style="font-size:0.28rem;color:var(--gold);margin-top:3px;opacity:0.6;">Try it!</div>');
      h+='</div>';
      gi++;
    });
    h+='</div></div></div>';
  });
  h+='</div>';o.innerHTML=h;o.classList.add('open')}
window._cp=function(){document.getElementById('fg-ov').classList.remove('open')};
function _os(){var o=document.getElementById('fg-sc');
  var S=[['Card Games & Executive Function','PMC 2023 RCT, n=68','Card games improve flexibility, inhibition & working memory in 18 sessions.'],['Memory & Visual Processing','PLOS ONE 2013, 5 groups','Memory games improve spatial working memory and visual search.'],['Game-Based Learning','Frontiers 2024, 136 studies','Moderate-to-large effects on cognitive, social & emotional outcomes.'],['Solitaire Biomarkers','PMC 2021, n=46','Solitaire produces 23 cognitive biomarkers; 12 differentiate MCI.'],['Pattern Recognition','Frontiers 2024','Pattern games develop logical thinking & spatial reasoning.'],['Cards & Verbal Fluency','PubMed 2020 RCT, 65+','Card games maintain verbal fluency and impulsivity control in seniors.']];
  var h='<div style="max-width:420px;margin:0 auto"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px"><div style="font-family:Bebas Neue,sans-serif;font-size:1rem;color:var(--gold)">🔬 THE SCIENCE</div><button class="gb" onclick="_cs()">CLOSE</button></div>';
  S.forEach(function(s){h+='<div style="background:rgba(26,31,23,.85);border:1px solid rgba(74,124,53,.12);border-radius:8px;padding:10px;margin-bottom:6px"><div style="font-family:Bebas Neue,sans-serif;font-size:.6rem;color:var(--gold)">'+s[0]+'</div><div style="font-size:.36rem;color:rgba(122,179,86,.6);margin-top:2px">'+s[1]+'</div><div style="font-size:.42rem;color:var(--cream);margin-top:4px;line-height:1.5">'+s[2]+'</div></div>'});
  h+='</div>';o.innerHTML=h;o.classList.add('open')}
window._cs=function(){document.getElementById('fg-sc').classList.remove('open')};

// ═══ GAME SHARED API — exposed for lazy-loaded game scripts ═══
window._gameFns={};
window._G={
  e:_e, play:_play, playWin:_playWin, st:_st, xt:_xt, sm:sm,
  ms:ms, mm:mm, mc:mc, sh:sh, sr:_sr, gr:_gr, setDiff:_setDiff,
  solEnterFS:_solEnterFS, solClearFS:_solClearFS, solExitFS:_solExitFS,
  getM:function(){return _m}, setM:function(v){_m=v}
};
var _gameLoading={};
// ═══ GAME SWITCH ═══
window._sg=function(id){_cp();if(id===_a)return;_xt();_afReset();_a=id;_m=Math.min(_hashFilled,30);_dm=1.0;
  document.querySelectorAll('.fg-c').forEach(function(c){c.classList.toggle('on',c.getAttribute('data-g')===id)});
  var sw=document.getElementById('sw'),ag=document.getElementById('fg-ag'),gps=document.getElementById('gp-strip'),ssb=document.getElementById('set-status');
  var _solGames={golf:1,klondike:1,spider:1,freecell:1,pyramid:1,tripeaks:1};
  _solClearFS();
  var _bnav=document.querySelector('.fg-bottomnav');
  var _td=document.getElementById('trios-dash');var _tw=document.getElementById('trios-wrap');
  if(id==='set'){sw.style.display='';if(_td)_td.style.display='';if(_tw)_tw.style.display='';if(ssb)ssb.style.display='';ag.classList.remove('on');ag.classList.remove('sol');ag.innerHTML='';if(_bnav)_bnav.style.display='flex';if(gps){gps.classList.remove('on');}try{_updateGP()}catch(e){}return}
  sw.style.display='none';if(_td)_td.style.display='none';if(_tw)_tw.style.display='none';if(ssb)ssb.style.display='none';ag.classList.add('on');ag.classList.toggle('sol',!!_solGames[id]);ag.innerHTML='';
  if(_bnav)_bnav.style.display='none';
  if(_solGames[id]){_solEnterFS()}
  if(gps){gps.classList.add('on');try{_updateGP()}catch(e){console.warn('[GP]',e)}}
  var gi=null;for(var i=0;i<G.length;i++)if(G[i].id===id){gi=G[i];break}
  if(gi){var r=document.createElement('div');r.className='gr';r.textContent='📖 '+gi.r;ag.appendChild(r)}
  // ── Try: 1) already-loaded external, 2) lazy-load from games/ ──
  var gameFn=window._gameFns[id];
  if(gameFn){
    try{gameFn(ag)}catch(e){console.error('[Game '+id+']',e);ag.innerHTML='<div style="padding:2rem;text-align:center;color:#c75050;font-size:16px">ERROR in '+id+': '+e.message+'</div>'}
  }else if(!_gameLoading[id]){
    _gameLoading[id]=true;
    ag.innerHTML+='<div id="_gl" style="padding:3rem;text-align:center;color:var(--muted);font-family:DM Sans,sans-serif"><div style="font-size:1.4rem;margin-bottom:8px">🌱</div>Loading game...</div>';
    // Card games need shared card utilities loaded first
    var needCards=!!_solGames[id];
    var loadGame=function(){
      var s=document.createElement('script');
      s.src='games/'+id+'.js?v='+LW_VERSION;
      s.onload=function(){
        _gameLoading[id]=false;
        if(window._gameFns[id]&&_a===id){
          ag.innerHTML='';
          if(gi){var r2=document.createElement('div');r2.className='gr';r2.textContent='📖 '+gi.r;ag.appendChild(r2)}
          try{window._gameFns[id](ag)}catch(e){console.error('[Game '+id+']',e);ag.innerHTML='<div style="padding:2rem;text-align:center;color:#c75050;font-size:16px">ERROR in '+id+': '+e.message+'</div>'}
        }
      };
      s.onerror=function(){_gameLoading[id]=false;ag.innerHTML='<div style="padding:2rem;text-align:center;color:#c75050">Failed to load game. Check connection.</div>'};
      document.head.appendChild(s);
    };
    if(needCards&&!window._cdMk){
      var cs=document.createElement('script');
      cs.src='games/_cards.js?v='+LW_VERSION;
      cs.onload=loadGame;
      cs.onerror=function(){ag.innerHTML='<div style="padding:2rem;text-align:center;color:#c75050">Failed to load card utilities.</div>'};
      document.head.appendChild(cs);
    }else{loadGame()}
  }
  _st();
  };

// ═══ INIT ═══
// ── Colorblind toggle stub ──
window._toggleCB=function(){
  document.body.classList.toggle('cb-mode');
  var isOn=document.body.classList.contains('cb-mode');
  sm(isOn?'Color blind mode ON':'Color blind mode OFF');
};
// ── Shop stub ──
window.openShop=function(){sm('Shop coming soon!');};


// ═══ SKINNED MINI-GAMES (restored from 8b5a5dc — final polished versions) ═══
function GM(a){var IC=[
'<img src="assets/games/memory/01-moonflower-card.png" width="56" height="56" alt="Moonflower" style="border-radius:6px;">',
'<img src="assets/games/memory/02-bird-of-paradise-card.png" width="56" height="56" alt="Bird of Paradise" style="border-radius:6px;">',
'<img src="assets/games/memory/03-lotus-card.png" width="56" height="56" alt="Lotus" style="border-radius:6px;">',
'<img src="assets/games/memory/04-sunflower-card.png" width="56" height="56" alt="Sunflower" style="border-radius:6px;">',
'<img src="assets/games/memory/05-foxglove-card.png" width="56" height="56" alt="Foxglove" style="border-radius:6px;">',
'<img src="assets/games/memory/06-passion-flower-card.png" width="56" height="56" alt="Passion Flower" style="border-radius:6px;">',
'<img src="assets/games/memory/07-bleeding-heart-card.png" width="56" height="56" alt="Bleeding Heart" style="border-radius:6px;">',
'<img src="assets/games/memory/08-protea-card.png" width="56" height="56" alt="Protea" style="border-radius:6px;">',
'<img src="assets/games/memory/09-dahlia-card.png" width="56" height="56" alt="Dahlia" style="border-radius:6px;">',
'<img src="assets/games/memory/10-orchid-card.png" width="56" height="56" alt="Orchid" style="border-radius:6px;">',
'<img src="assets/games/memory/11-cherry-blossom-card.png" width="56" height="56" alt="Cherry Blossom" style="border-radius:6px;">',
'<img src="assets/games/memory/12-rafflesia-card.png" width="56" height="56" alt="Rafflesia" style="border-radius:6px;">',
'<img src="assets/games/memory/13-lavender-card.png" width="56" height="56" alt="Lavender" style="border-radius:6px;">',
'<img src="assets/games/memory/14-heliconia-card.png" width="56" height="56" alt="Heliconia" style="border-radius:6px;">',
'<img src="assets/games/memory/15-ghost-orchid-card.png" width="56" height="56" alt="Ghost Orchid" style="border-radius:6px;">',
'<img src="assets/games/memory/16-venus-flytrap-card.png" width="56" height="56" alt="Venus Flytrap" style="border-radius:6px;">',
'<img src="assets/games/memory/17-titan-arum-card.png" width="56" height="56" alt="Titan Arum" style="border-radius:6px;">',
'<img src="assets/games/memory/18-night-blooming-cereus-card.png" width="56" height="56" alt="Night Cereus" style="border-radius:6px;">'
];var pr=8,cd=[],fl=[],mt=0,mv=0,lk=false;
  ms(a,'🎴 <strong id="Mm">0</strong>/<strong id="Mt">8</strong> · 👆 <strong id="Mv">0</strong>');mm(a);
  var g=document.createElement('div');g.className='mg';g.id='Mg';g.style.gridTemplateColumns='repeat(4,1fr)';a.appendChild(g);
  mc(a).innerHTML='<select class="gsl" id="Md" onchange="_MN()"><option value="6">Easy 3×4</option><option value="8" selected>Medium 4×4</option><option value="10">Hard 5×4</option><option value="12">Expert 6×4</option></select> <button class="gb-new" onclick="_MN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';
  window._MN=function(){pr=parseInt(document.getElementById('Md').value);_setDiff(pr<=6?'easy':pr<=8?'medium':pr<=10?'hard':'expert');var p=sh(IC.slice()).slice(0,pr);cd=sh(p.concat(p.slice()));fl=[];mt=0;mv=0;lk=false;document.getElementById('Mm').textContent='0';document.getElementById('Mt').textContent=pr;document.getElementById('Mv').textContent='0';g.style.gridTemplateColumns='repeat('+(pr<=6?3:pr<=8?4:pr<=10?5:6)+',1fr)';sm('');rn()};
  function rn(){g.innerHTML='';cd.forEach(function(ic,i){var e=document.createElement('div');e.className='mw';e.innerHTML='<div class="mi" id="M'+i+'"><div class="mx mb"></div><div class="mx mf"><div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">'+ic+'</div></div></div>';e.onclick=function(){if(lk)return;var n=document.getElementById('M'+i);if(!n||n.classList.contains('fl')||n.classList.contains('mt'))return;if(fl.length>=2)return;n.classList.add('fl');_play('flip');fl.push(i);if(fl.length===2){mv++;document.getElementById('Mv').textContent=mv;lk=true;if(cd[fl[0]]===cd[fl[1]]){setTimeout(function(){_play('match');document.getElementById('M'+fl[0]).classList.add('mt');document.getElementById('M'+fl[1]).classList.add('mt');mt++;_e('progress');document.getElementById('Mm').textContent=mt;if(mt%Math.max(2,Math.floor(pr/3))===0&&mt<pr)_e('milestone');if(mt>=pr){_e('game_win');_playWin();sm('🌿 Complete! '+mv+' moves');_sr('memory',{w:true,s:mt})}else sm((pr-mt)+' left');fl=[];lk=false},350)}else{setTimeout(function(){var x=document.getElementById('M'+fl[0]),y=document.getElementById('M'+fl[1]);if(x)x.classList.add('wr');if(y)y.classList.add('wr');_play('buzz');setTimeout(function(){if(x)x.classList.remove('fl','wr');if(y)y.classList.remove('fl','wr');fl=[];lk=false},400)},550);sm('Not a match')}}};g.appendChild(e)})}_MN();}

// ═══ MERGE 2048 ═══
function GR(a){
  // Plant tile hashes — progression from bare seed to cosmic specimen
  var _TH={
    2:'0000000111000000000000000000000000000000000000000000000000000000',
    4:'0112011151000000000000000000000000000000000000000000000000000000',
    8:'0224022015000000000000000000000000000000000000000000000000000000',
    16:'0336033010000000000000000000000000000000000000000000000000000000',
    32:'0548044051000000000000000000000000000000000000000000000000000000',
    64:'06d5033105805100000000000000000000000000000000000000000000000000',
    128:'07d8043015801300000000000000000000000000000000000000000000000000',
    256:'0bd9044015804400000008000000000000000000000000000000000000000000',
    512:'08da04401a80a400500009000000000000000000000000000000000000000000',
    1024:'09dc044fb081240090f80f000000000000000000000000000000000000000000',
    2048:'0fdf044fbff16400f0ff0f000000000000000000000000000000000000000000'
  };
  var ST={};
  (function(){
    var gen=window._generatePlantSVG;
    if(!gen)return;
    var vals=[2,4,8,16,32,64,128,256,512,1024,2048];
    for(var i=0;i<vals.length;i++){
      try{ST[vals[i]]=gen(_TH[vals[i]],56);}catch(e){ST[vals[i]]='🌱';}
    }
  })();
  var g=new Array(16).fill(0),sc=0,bt=2,ov=false,busy=false;
  ms(a,'🏆 <strong id="Rs">0</strong> · Best: <strong id="Rb">2</strong>');mm(a);

  // Grid container — CSS grid provides the cell positions
  var bd=document.createElement('div');bd.className='tb';bd.id='Rb2';
  bd.style.position='relative';
  a.appendChild(bd);

  // 16 static background cells (empty squares that never move)
  for(var ci=0;ci<16;ci++){
    var cell=document.createElement('div');
    cell.className='tc t0';
    bd.appendChild(cell);
  }

  // Direction buttons
  var db=document.createElement('div');
  db.style.cssText='display:flex;justify-content:center;gap:clamp(8px,3vw,14px);padding:clamp(10px,3vw,16px)';
  db.innerHTML='<button class="gb" style="min-width:64px;min-height:64px;font-size:1.5rem;padding:12px 18px" onclick="_Rm(\'left\')">⬅</button><button class="gb" style="min-width:64px;min-height:64px;font-size:1.5rem;padding:12px 18px" onclick="_Rm(\'up\')">⬆</button><button class="gb" style="min-width:64px;min-height:64px;font-size:1.5rem;padding:12px 18px" onclick="_Rm(\'down\')">⬇</button><button class="gb" style="min-width:64px;min-height:64px;font-size:1.5rem;padding:12px 18px" onclick="_Rm(\'right\')">➡</button>';
  a.appendChild(db);
  mc(a).innerHTML='<button class="gb-new" onclick="_RN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  // Tile tracking — each active tile is an object {el, val, idx}
  var tiles=[];
  var tileId=0;

  // Get pixel position for a grid index (0-15)
  function posOf(idx){
    var gap=parseFloat(getComputedStyle(bd).gap)||6;
    var cellW=(bd.clientWidth-gap*3-parseFloat(getComputedStyle(bd).paddingLeft)*2)/4;
    if(cellW<=0) cellW=60;
    var pad=parseFloat(getComputedStyle(bd).paddingLeft)||8;
    var col=idx%4, row=Math.floor(idx/4);
    return {x:pad+col*(cellW+gap), y:pad+row*(cellW+gap), w:cellW};
  }

  // Create a tile DOM element at grid index with value
  function mkTile(idx,val,animate){
    var p=posOf(idx);
    var el=document.createElement('div');
    el.className='tc t'+Math.min(val,2048);
    el.style.cssText='position:absolute;left:'+p.x+'px;top:'+p.y+'px;width:'+p.w+'px;height:'+p.w+'px;'
      +'transition:left 150ms ease,top 150ms ease,transform 150ms ease,opacity 100ms ease;'
      +'z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;';
    el.innerHTML='<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2px">'+'<div class="ti" style="flex:1;width:100%;display:flex;align-items:center;justify-content:center">'+(ST[Math.min(val,2048)]||'🔥')+'</div>'+'<div style="font-size:clamp(.9rem,3vw,1.3rem);color:rgba(232,220,200,0.95);font-weight:800;font-family:DM Mono,monospace;text-shadow:0 1px 3px rgba(0,0,0,0.4);line-height:1;padding-bottom:4px">'+val+'</div></div>';
    if(animate){
      el.style.transform='scale(0)';
      setTimeout(function(){el.style.transform='scale(1)'},20);
    }
    bd.appendChild(el);
    var t={el:el,val:val,idx:idx,id:++tileId};
    tiles.push(t);
    return t;
  }

  // Remove a tile from DOM and tracking
  function rmTile(t){
    if(t.el&&t.el.parentNode)t.el.parentNode.removeChild(t.el);
    var i=tiles.indexOf(t);
    if(i>-1)tiles.splice(i,1);
  }

  // Move a tile element to a new grid index (animates via CSS transition)
  function mvTile(t,newIdx){
    var p=posOf(newIdx);
    t.el.style.left=p.x+'px';
    t.el.style.top=p.y+'px';
    t.idx=newIdx;
  }

  // Full redraw (no animation — used for new game and resize)
  function fullRedraw(){
    for(var i=tiles.length-1;i>=0;i--)rmTile(tiles[i]);
    tiles=[];
    for(var i=0;i<16;i++){
      if(g[i])mkTile(i,g[i],false);
    }
    document.getElementById('Rs').textContent=sc;
  }

  // Spawn a new tile in a random empty cell
  function sp(animate){
    var e=[];
    for(var i=0;i<16;i++)if(g[i]===0)e.push(i);
    if(!e.length)return;
    var idx=e[Math.floor(Math.random()*e.length)];
    var val=Math.random()<.9?2:4;
    g[idx]=val;
    mkTile(idx,val,animate!==false);
  }

  // Slide and merge one row/col array, return {result, moves}
  function sl(arr,indices){
    var moves=[];
    var x=[];
    var xi=[];
    for(var i=0;i<arr.length;i++){
      if(arr[i]){x.push(arr[i]);xi.push(indices[i]);}
    }
    var res=new Array(4).fill(0);
    var ri=0;
    for(var i=0;i<x.length;i++){
      if(i+1<x.length&&x[i]===x[i+1]){
        var nv=x[i]*2;
        res[ri]=nv;
        moves.push({from:xi[i],to:indices[ri],val:x[i],merge:true});
        moves.push({from:xi[i+1],to:indices[ri],val:x[i+1],merge:true,remove:true});
        sc+=nv;
        if(nv>bt){bt=nv;document.getElementById('Rb').textContent=bt;
          if([64,128,256,512,1024,2048].indexOf(nv)>-1)_e('reached_'+nv);
        }
        ri++;i++;
      } else {
        res[ri]=x[i];
        moves.push({from:xi[i],to:indices[ri],val:x[i],merge:false});
        ri++;
      }
    }
    return {result:res,moves:moves};
  }

  // Main move function
  window._Rm=function(d){
    if(ov||busy)return;
    var o=g.slice();
    var allMoves=[];

    if(d==='left'){
      for(var r=0;r<4;r++){
        var idx=[r*4,r*4+1,r*4+2,r*4+3];
        var row=[g[idx[0]],g[idx[1]],g[idx[2]],g[idx[3]]];
        var res=sl(row,idx);
        for(var c=0;c<4;c++)g[r*4+c]=res.result[c];
        allMoves=allMoves.concat(res.moves);
      }
    } else if(d==='right'){
      for(var r=0;r<4;r++){
        var idx=[r*4+3,r*4+2,r*4+1,r*4];
        var row=[g[idx[0]],g[idx[1]],g[idx[2]],g[idx[3]]];
        var res=sl(row,idx);
        for(var c=0;c<4;c++){g[idx[c]]=res.result[c];}
        allMoves=allMoves.concat(res.moves);
      }
    } else if(d==='up'){
      for(var c=0;c<4;c++){
        var idx=[c,c+4,c+8,c+12];
        var col=[g[idx[0]],g[idx[1]],g[idx[2]],g[idx[3]]];
        var res=sl(col,idx);
        for(var r=0;r<4;r++)g[idx[r]]=res.result[r];
        allMoves=allMoves.concat(res.moves);
      }
    } else if(d==='down'){
      for(var c=0;c<4;c++){
        var idx=[c+12,c+8,c+4,c];
        var col=[g[idx[0]],g[idx[1]],g[idx[2]],g[idx[3]]];
        var res=sl(col,idx);
        for(var r=0;r<4;r++)g[idx[r]]=res.result[r];
        allMoves=allMoves.concat(res.moves);
      }
    }

    // Check if anything changed
    var ch=false;
    for(var i=0;i<16;i++)if(g[i]!==o[i]){ch=true;break;}
    if(!ch)return;

    busy=true;

    // Animate existing tiles to new positions
    for(var m=0;m<allMoves.length;m++){
      var mv=allMoves[m];
      // Find the tile at the source position
      for(var t=0;t<tiles.length;t++){
        if(tiles[t].idx===mv.from&&tiles[t].val===mv.val){
          mvTile(tiles[t],mv.to);
          if(mv.remove)tiles[t]._remove=true;
          break;
        }
      }
    }

    // After animation completes, clean up merges, spawn new, check game over
    setTimeout(function(){
      // Remove merged-away tiles
      for(var t=tiles.length-1;t>=0;t--){
        if(tiles[t]._remove)rmTile(tiles[t]);
      }
      // Update surviving tiles: sync value with g[] and refresh visuals
      for(var t=0;t<tiles.length;t++){
        var ti=tiles[t];
        var nv=g[ti.idx];
        if(nv&&nv!==ti.val){
          ti.val=nv;
          ti.el.className='tc t'+Math.min(nv,2048);
          ti.el.querySelector('.ti').innerHTML=ST[Math.min(nv,2048)]||'🔥';
          ti.el.querySelector('.ti').parentNode.lastElementChild.textContent=nv;
          ti.el.classList.add('pop');setTimeout((function(e){return function(){e.classList.remove('pop')}})(ti.el),200);
        }
      }
      var _rsEl=document.getElementById('Rs');if(_rsEl)_rsEl.textContent=sc;

      sp(true);

      // Check game over
      var go=true;
      for(var i=0;i<16;i++){
        if(!g[i]||i%4<3&&g[i]===g[i+1]||i<12&&g[i]===g[i+4]){go=false;break;}
      }
      if(go){ov=true;_e('game_loss');_play('lose');sm('🍂 No moves! '+sc);_sr('merge',{w:false,s:sc});}
      busy=false;
    },160);
  };

  // Swipe handling
  bd.addEventListener('touchstart',function(e){bd._sx=e.touches[0].clientX;bd._sy=e.touches[0].clientY;},{passive:true});
  bd.addEventListener('touchend',function(e){if(bd._sx===undefined)return;var dx=e.changedTouches[0].clientX-bd._sx,dy=e.changedTouches[0].clientY-bd._sy;if(Math.max(Math.abs(dx),Math.abs(dy))<25)return;if(Math.abs(dx)>Math.abs(dy))_Rm(dx>0?'right':'left');else _Rm(dy>0?'down':'up');bd._sx=bd._sy=undefined;},{passive:true});

  // Keyboard handling
  document.addEventListener('keydown',function(e){var m={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};if(m[e.key]&&_a==='merge'){e.preventDefault();_Rm(m[e.key]);}});

  // New game
  window._RN=function(){g=new Array(16).fill(0);sc=0;bt=2;ov=false;busy=false;
    document.getElementById('Rb').textContent='2';
    for(var t=tiles.length-1;t>=0;t--)rmTile(tiles[t]);
    tiles=[];
    sp(false);sp(false);
    document.getElementById('Rs').textContent='0';
  };
  _RN();
}

// ═══ SIMON ═══
function GS(a){var sq=[],pi=0,rd=0,br=0,pl=false,pt=false,ac=null;

  // ── Chord definitions: semitone intervals from root ──
  var CHORDS={
    'Maj7':[0,4,7,11],
    'min7':[0,3,7,10],
    'Maj9':[0,4,7,14],
    'min9':[0,3,7,14],
    'sus4':[0,5,7,12],
    'sus2':[0,2,7,12],
    '6th':[0,4,7,9],
    'dim7':[0,3,6,9],
    'add9':[0,4,7,14]
  };
  // Octave root frequencies (C note)
  var OCTAVES={'Low (C3)':130.81,'Mid (C4)':261.63,'High (C5)':523.25,'Bright (C6)':1046.50};
  var _chord='Maj7',_oct=261.63;

  function _buildFR(){
    var semi=CHORDS[_chord]||CHORDS['Maj7'];
    // Sort so winter (index 3) is always highest
    var sorted=semi.slice().sort(function(a,b){return a-b});
    var fr=[];
    for(var i=0;i<4;i++)fr.push(_oct*Math.pow(2,sorted[i]/12));
    return fr;
  }
  var FR=_buildFR();

  ms(a,'Round: <strong id="Sr">0</strong> · Best: <strong id="Sb">0</strong>');mm(a);

  // ── Season tiles with artwork ──
  var bd=document.createElement('div');bd.className='sb';
  bd.innerHTML=''
    +'<div class="st" id="s0" onclick="_SP(0)"><span class="sl">SPRING</span></div>'
    +'<div class="st" id="s1" onclick="_SP(1)"><span class="sl">SUMMER</span></div>'
    +'<div class="st" id="s2" onclick="_SP(2)"><span class="sl">AUTUMN</span></div>'
    +'<div class="st" id="s3" onclick="_SP(3)"><span class="sl">WINTER</span></div>';
  a.appendChild(bd);

  // ── Chord & octave: compact tap-to-cycle below tiles ──
  var chKeys=Object.keys(CHORDS);
  var ocKeys=Object.keys(OCTAVES);var ocVals=[];for(var ok=0;ok<ocKeys.length;ok++)ocVals.push(OCTAVES[ocKeys[ok]]);
  var _chIdx=0,_ocIdx=1;
  var cr=mc(a);
  // Build chord dropdown options
  var chOpts='';for(var ci=0;ci<chKeys.length;ci++)chOpts+='<div onclick="_SPC('+ci+')" style="padding:10px 16px;cursor:pointer;font-family:DM Mono,monospace;font-size:14px;color:#fff;border-bottom:1px solid rgba(122,179,86,.12);min-height:44px;display:flex;align-items:center'+(ci===_chIdx?';background:rgba(122,179,86,.15);color:var(--gold)':'')+'">'+chKeys[ci]+'</div>';
  // Build octave dropdown options
  var ocOpts='';for(var oi=0;oi<ocKeys.length;oi++)ocOpts+='<div onclick="_SPO('+oi+')" style="padding:10px 16px;cursor:pointer;font-family:DM Mono,monospace;font-size:14px;color:#fff;border-bottom:1px solid rgba(122,179,86,.12);min-height:44px;display:flex;align-items:center'+(oi===_ocIdx?';background:rgba(122,179,86,.15);color:var(--gold)':'')+'">'+ocKeys[oi]+'</div>';
  cr.innerHTML=''
    +'<div style="position:relative">'
    +'<div id="Sch" onclick="_SCH()" class="gb" style="min-width:90px;text-align:center"><span style="font-size:11px;color:#C8A84B;letter-spacing:.06em;font-family:Bebas Neue,sans-serif">CHORD ▾</span><br><span style="color:#fff;font-family:DM Mono,monospace;font-size:14px">'+_chord+'</span></div>'
    +'<div id="SchDD" style="display:none;position:absolute;bottom:100%;left:0;right:0;min-width:130px;background:#1a1f17;border:2px solid #7ab356;border-radius:10px;margin-bottom:6px;z-index:999;max-height:260px;overflow-y:auto;box-shadow:0 -4px 20px rgba(0,0,0,.5)">'+chOpts+'</div>'
    +'</div>'
    +'<div style="position:relative">'
    +'<div id="Soc" onclick="_SOC()" class="gb" style="min-width:90px;text-align:center"><span style="font-size:11px;color:#C8A84B;letter-spacing:.06em;font-family:Bebas Neue,sans-serif">OCTAVE ▾</span><br><span style="color:#fff;font-family:DM Mono,monospace;font-size:14px">'+ocKeys[_ocIdx]+'</span></div>'
    +'<div id="SocDD" style="display:none;position:absolute;bottom:100%;left:0;right:0;min-width:130px;background:#1a1f17;border:2px solid #7ab356;border-radius:10px;margin-bottom:6px;z-index:999;max-height:260px;overflow-y:auto;box-shadow:0 -4px 20px rgba(0,0,0,.5)">'+ocOpts+'</div>'
    +'</div>'
    +'<button class="gb-new" onclick="_SN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';
  function _updSchDD(){var h='';for(var ci=0;ci<chKeys.length;ci++)h+='<div onclick="_SPC('+ci+')" style="padding:10px 16px;cursor:pointer;font-family:DM Mono,monospace;font-size:14px;color:'+(ci===_chIdx?'var(--gold)':'#fff')+';border-bottom:1px solid rgba(122,179,86,.12);min-height:44px;display:flex;align-items:center;background:'+(ci===_chIdx?'rgba(122,179,86,.15)':'transparent')+'">'+chKeys[ci]+'</div>';document.getElementById('SchDD').innerHTML=h}
  function _updSocDD(){var h='';for(var oi=0;oi<ocKeys.length;oi++)h+='<div onclick="_SPO('+oi+')" style="padding:10px 16px;cursor:pointer;font-family:DM Mono,monospace;font-size:14px;color:'+(oi===_ocIdx?'var(--gold)':'#fff')+';border-bottom:1px solid rgba(122,179,86,.12);min-height:44px;display:flex;align-items:center;background:'+(oi===_ocIdx?'rgba(122,179,86,.15)':'transparent')+'">'+ocKeys[oi]+'</div>';document.getElementById('SocDD').innerHTML=h}
  // Toggle chord dropdown
  window._SCH=function(){var dd=document.getElementById('SchDD');var od=document.getElementById('SocDD');if(od)od.style.display='none';dd.style.display=dd.style.display==='none'?'block':'none'};
  // Toggle octave dropdown
  window._SOC=function(){var dd=document.getElementById('SocDD');var od=document.getElementById('SchDD');if(od)od.style.display='none';dd.style.display=dd.style.display==='none'?'block':'none'};
  // Pick chord
  window._SPC=function(i){_chIdx=i;_chord=chKeys[i];FR=_buildFR();document.getElementById('Sch').querySelector('span:last-child').textContent=_chord;document.getElementById('SchDD').style.display='none';_updSchDD()};
  // Pick octave
  window._SPO=function(i){_ocIdx=i;_oct=ocVals[i];FR=_buildFR();document.getElementById('Soc').querySelector('span:last-child').textContent=ocKeys[i];document.getElementById('SocDD').style.display='none';_updSocDD()};

  // ── Tone: warm triangle wave with gentle decay ──
  function tn(f,d){
    if(!ac)try{ac=new(window.AudioContext||window.webkitAudioContext);}catch(e){}
    if(!ac)return;
    var t=ac.currentTime;
    var o=ac.createOscillator(),gn=ac.createGain();
    o.type='triangle';
    o.frequency.value=f;
    gn.gain.setValueAtTime(0,t);
    gn.gain.linearRampToValueAtTime(0.18,t+0.02);
    gn.gain.exponentialRampToValueAtTime(0.001,t+d/1000);
    o.connect(gn);gn.connect(ac.destination);
    o.start(t);o.stop(t+d/1000);
  }

  function fl(i,d){var e=document.getElementById('s'+i);if(!e)return;e.classList.add('lt');tn(FR[i],d);setTimeout(function(){e.classList.remove('lt')},d)}
  function ps(){pl=true;pt=false;sm('Watch...');var i=0,sp=Math.max(220,480-rd*12);var iv=setInterval(function(){if(i>=sq.length){clearInterval(iv);pl=false;pt=true;pi=0;sm('Your turn!');return}fl(sq[i],sp*.7);i++},sp)}
  function nr(){rd++;var _sr2=document.getElementById('Sr');if(_sr2)_sr2.textContent=rd;sq.push(Math.floor(Math.random()*4));if(rd>1&&(rd-1)%5===0)_e('round_'+(rd-1));setTimeout(ps,500)}
  window._SP=function(i){if(!pt||pl)return;fl(i,180);if(i===sq[pi]){pi++;if(pi>=sq.length){pt=false;sm('✓ Round '+rd+'!');setTimeout(nr,700)}}else{pt=false;if(rd>br){br=rd;var _sb2=document.getElementById('Sb');if(_sb2)_sb2.textContent=br}_e('game_loss');_play('lose');sm('🍂 Round '+rd+'! Best: '+br);_sr('simon',{w:false,s:rd})}};
  window._SN=function(){sq=[];pi=0;rd=0;pl=false;pt=false;var _sr3=document.getElementById('Sr');if(_sr3)_sr3.textContent='0';sm('Watch...');setTimeout(nr,600)};_SN();}

// ═══ LIGHTS OUT ═══
function GL(a){var SZ=5,gr=[],ini=[],mv=0,sl=0,pz=0;
  ms(a,'#<strong id="Lp">1</strong> · 👆<strong id="Lm">0</strong> · ✅<strong id="Ls">0</strong>');mm(a);
  var bw=document.createElement('div');bw.style.cssText='position:relative;width:clamp(300px,92vw,420px);margin:0 auto';
  var bg=document.createElement('img');bg.src='assets/games/lights/grid.png';bg.style.cssText='width:100%;display:block;border-radius:8px';bw.appendChild(bg);
  var gd=document.createElement('div');gd.className='lg';gd.id='Lg';gd.style.cssText='position:absolute;top:7%;left:7%;right:7%;bottom:7%;grid-template-columns:repeat(5,1fr);gap:clamp(2px,1vw,5px)';bw.appendChild(gd);a.appendChild(bw);mc(a).innerHTML='<button class="gb-new" onclick="_LN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button><button class="gb" onclick="_LR()">↩️ Reset</button>';
  function tg(r,c){if(r>=0&&r<SZ&&c>=0&&c<SZ)gr[r*SZ+c]=gr[r*SZ+c]?0:1}function ok(){for(var i=0;i<SZ*SZ;i++)if(gr[i])return false;return true}
  var _lampOn='assets/games/lights/shroom-on.png';
  var _lampOff='assets/games/lights/shroom-off.png';
  function anim(i,wasOn){var el=gd.children[i];if(!el)return;var cls=wasOn?'l-off':'l-on';el.classList.add(cls);setTimeout(function(){if(el)el.classList.remove(cls)},450)}
  function rn(changed){gd.innerHTML='';for(var i=0;i<SZ*SZ;i++){var d=document.createElement('div');d.className='lc';d.style.cssText='background:url('+(gr[i]?_lampOn:_lampOff)+') center/cover !important;border:none !important;box-shadow:none !important;border-radius:clamp(4px,1.2vw,8px)';d.setAttribute('data-i',i);d.onclick=function(){var el=this;var x=parseInt(el.getAttribute('data-i'));var r=Math.floor(x/SZ),c=x%SZ;el.classList.add('ltap');setTimeout(function(){el.classList.remove('ltap')},260);_play("click");var af=[];var pairs=[[r,c],[r-1,c],[r+1,c],[r,c-1],[r,c+1]];for(var p=0;p<pairs.length;p++){var pr=pairs[p][0],pc=pairs[p][1];if(pr>=0&&pr<SZ&&pc>=0&&pc<SZ)af.push({idx:pr*SZ+pc,was:gr[pr*SZ+pc]})}tg(r,c);tg(r-1,c);tg(r+1,c);tg(r,c-1);tg(r,c+1);mv++;document.getElementById('Lm').textContent=mv;rn(af);if(ok()){sl++;document.getElementById('Ls').textContent=sl;_e('puzzle_solved');_e('game_win');_playWin();sm('🌿 Done! '+mv+' moves');_sr('lights',{w:true,s:mv})}};gd.appendChild(d)}if(changed){for(var j=0;j<changed.length;j++)anim(changed[j].idx,changed[j].was)}}
  function gn(){gr=[];for(var i=0;i<SZ*SZ;i++)gr.push(0);var n=5+Math.floor(Math.random()*8);for(var t=0;t<n;t++){var ri=Math.floor(Math.random()*SZ),ci=Math.floor(Math.random()*SZ);tg(ri,ci);tg(ri-1,ci);tg(ri+1,ci);tg(ri,ci-1);tg(ri,ci+1)}if(ok()){tg(2,2);tg(1,2);tg(3,2);tg(2,1);tg(2,3)}ini=gr.slice()}
  window._LN=function(){pz++;mv=0;document.getElementById('Lp').textContent=pz;document.getElementById('Lm').textContent='0';sm('');gn();rn()};window._LR=function(){gr=ini.slice();mv=0;document.getElementById('Lm').textContent='0';sm('Reset');rn()};_LN();}

// ═══ MINESWEEPER ═══
function GN(a){var rw=10,cl=10,mn=15,bd=[],ov=false,fi=true,fm=false,rv=0,fg=0,sf=0;
  ms(a,'🦠<strong id="Nn">15</strong> · 🚩<strong id="Nf">0</strong> · 🌿<strong id="Nr">0</strong>/<strong id="Ns">85</strong>');mm(a);
  var gd=document.createElement('div');gd.className='ng';gd.id='Ng';gd.style.gridTemplateColumns='repeat('+cl+',1fr)';a.appendChild(gd);
  mc(a).innerHTML='<select class="gsl" id="Nd" onchange="_NN()"><option value="8-10">Easy</option><option value="10-15" selected>Medium</option><option value="12-25">Hard</option></select> <button class="gb" id="Nfb" onclick="_NF()">🚩 Flag</button> <button class="gb-new" onclick="_NN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';
  function ix(r,c){return r*cl+c}function pl(sr,sc){var p=0;while(p<mn){var r=Math.floor(Math.random()*rw),c=Math.floor(Math.random()*cl);if(Math.abs(r-sr)<=1&&Math.abs(c-sc)<=1||bd[ix(r,c)].m)continue;bd[ix(r,c)].m=true;p++}for(var r=0;r<rw;r++)for(var c=0;c<cl;c++){if(bd[ix(r,c)].m)continue;var n=0;for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){var nr=r+dr,nc=c+dc;if(nr>=0&&nr<rw&&nc>=0&&nc<cl&&bd[ix(nr,nc)].m)n++}bd[ix(r,c)].a=n}}
  function re(r,c){if(r<0||r>=rw||c<0||c>=cl)return;var x=bd[ix(r,c)];if(x.rv||x.fl)return;_play('dig');x.rv=true;rv++;if(x.m){ov=true;bd.forEach(function(c){if(c.m)c.sm=true});x.ht=true;_e('game_loss');_play('lose');sm('🦠 Root rot!');_sr('mines',{w:false,s:rv});rn();return}if(rv%Math.max(8,Math.floor(sf/5))===0)_e('cleared');if(x.a===0)for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++)re(r+dr,c+dc)}
  function cw(){document.getElementById('Nr').textContent=rv;if(rv===sf&&!ov){ov=true;_e('game_win');sm('🌿 Clean!');_sr('mines',{w:true,s:rv})}}
  function rn(){gd.innerHTML='';gd.style.gridTemplateColumns='repeat('+cl+',1fr)';for(var r=0;r<rw;r++)for(var c=0;c<cl;c++){var x=bd[ix(r,c)];var d=document.createElement('div');d.setAttribute('data-r',r);d.setAttribute('data-c',c);if(x.rv){d.className='nc '+(x.ht?'nb':x.sm?'nb':'nr'+(x.a?' x'+x.a:''));d.textContent=x.ht?'':x.sm?'':(x.a||'')}else if(x.sm){d.className='nc nb';d.textContent=''}else if(x.fl){d.className='nc nf';d.textContent='';d.setAttribute('data-r',r);d.setAttribute('data-c',c);d.onclick=function(){if(ov)return;var cr=parseInt(this.getAttribute('data-r')),cc=parseInt(this.getAttribute('data-c'));var z=bd[ix(cr,cc)];_play('snap');z.fl=false;fg--;document.getElementById('Nf').textContent=fg;rn()}}else{d.className='nc nh';d.onclick=function(){if(ov)return;var cr=parseInt(this.getAttribute('data-r')),cc=parseInt(this.getAttribute('data-c'));if(fm){var z=bd[ix(cr,cc)];if(!z.rv){_play('snap');z.fl=!z.fl;fg+=z.fl?1:-1;document.getElementById('Nf').textContent=fg;rn()}return}if(bd[ix(cr,cc)].fl)return;if(fi){pl(cr,cc);fi=false}re(cr,cc);rn();cw()}}gd.appendChild(d)}}
  window._NF=function(){fm=!fm;document.getElementById('Nfb').className='gb'+(fm?' gon':'')};
  window._NN=function(){var p=document.getElementById('Nd').value.split('-');rw=cl=parseInt(p[0]);mn=parseInt(p[1]);_setDiff(rw<=8?'easy':rw<=10?'medium':'hard');sf=rw*cl-mn;bd=[];for(var i=0;i<rw*cl;i++)bd.push({m:false,rv:false,fl:false,a:0,ht:false,sm:false});ov=false;fi=true;rv=0;fg=0;fm=false;document.getElementById('Nn').textContent=mn;document.getElementById('Nf').textContent='0';document.getElementById('Nr').textContent='0';document.getElementById('Ns').textContent=sf;sm('');rn()};_NN();}

// ═══ SUDOKU ═══
function GU(a){var bd=new Array(81).fill(0),sol=new Array(81).fill(0),fix=new Array(81).fill(false),sel=-1,_fc=0;_setDiff('medium');ms(a);mm(a);
  var gd=document.createElement('div');gd.className='ug';gd.id='Ug';a.appendChild(gd);
  var pd=document.createElement('div');pd.className='up';for(var n=1;n<=9;n++)pd.innerHTML+='<div class="upb" onclick="_UN('+n+')">'+n+'</div>';pd.innerHTML+='<div class="upb" onclick="_UN(0)" style="color:var(--muted)">✕</div>';a.appendChild(pd);mc(a).innerHTML='<select class="gsl" id="Ud" onchange="_UG()"><option value="35">Easy</option><option value="45" selected>Medium</option><option value="52">Hard</option></select> <button class="gb-new" onclick="_UG()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';
  function gen(){var b=new Array(81).fill(0);function vl(p,n){var r=Math.floor(p/9),c=p%9,br=Math.floor(r/3)*3,bc=Math.floor(c/3)*3;for(var i=0;i<9;i++)if(b[r*9+i]===n||b[i*9+c]===n)return false;for(var dr=0;dr<3;dr++)for(var dc=0;dc<3;dc++)if(b[(br+dr)*9+(bc+dc)]===n)return false;return true}function s(p){if(p>=81)return true;var nums=sh([1,2,3,4,5,6,7,8,9]);for(var i=0;i<9;i++){if(vl(p,nums[i])){b[p]=nums[i];if(s(p+1))return true;b[p]=0}}return false}s(0);sol=b.slice();bd=b.slice();var rm=parseInt((document.getElementById('Ud')||{}).value)||45;_setDiff(rm<=35?'easy':rm<=45?'medium':'hard');while(rm>0){var i=Math.floor(Math.random()*81);if(bd[i]){bd[i]=0;rm--}}for(var i=0;i<81;i++)fix[i]=bd[i]!==0;_fc=0}
  function rn(){gd.innerHTML='';for(var i=0;i<81;i++){var d=document.createElement('div');d.className='uc'+(fix[i]?' uf':'')+(i===sel?' us':'')+(bd[i]&&!fix[i]&&bd[i]!==sol[i]?' ue':'');d.textContent=bd[i]||'';d.setAttribute('data-i',i);if(!fix[i])d.onclick=function(){sel=parseInt(this.getAttribute('data-i'));rn()};gd.appendChild(d)}var done=true;for(var i=0;i<81;i++)if(bd[i]!==sol[i]){done=false;break}if(done&&bd[0]){_e('game_win');_playWin();sm('🌿 Complete!');_sr('sudoku',{w:true,s:81})}}
  window._UN=function(n){if(sel<0||fix[sel])return;_play('tap');var prev=bd[sel];bd[sel]=n;if(n&&n===sol[sel]&&prev!==sol[sel]){_fc++;if(_fc%9===0)_e('progress')}rn()};window._UG=function(){sel=-1;_fc=0;gen();sm('');rn()};_UG();}

// ═══ WORD SEARCH ═══
function GW(a){var SZ=10,grid=[],words=[],found=[],sel=[];
  var BANK=[['FERN','MOSS','SAGE','BLOOM','PETAL','ROOT'],['LEAF','THORN','MAPLE','TULIP','DAISY','CEDAR'],['SOIL','WATER','MULCH','PRUNE','SPORE','FLORA']];
  ms(a,'Found: <strong id="Wf">0</strong>/<strong id="Wt">6</strong>');mm(a);
  var gd=document.createElement('div');gd.className='wg';gd.id='Wg';gd.style.gridTemplateColumns='repeat('+SZ+',1fr)';a.appendChild(gd);
  var wl=document.createElement('div');wl.id='Wl';wl.style.cssText='display:flex;flex-wrap:wrap;gap:8px;justify-content:center;padding:8px;font-size:.55rem';a.appendChild(wl);mc(a).innerHTML='<select class="gsl" id="Wd" onchange="_WN()"><option value="8-5">Easy</option><option value="10-6" selected>Medium</option><option value="13-8">Hard</option></select> <button class="gb-new" onclick="_WN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';
  function gen(){var dv=((document.getElementById('Wd')||{}).value||'10-6').split('-');SZ=parseInt(dv[0])||10;var wc=parseInt(dv[1])||6;gd.style.gridTemplateColumns='repeat('+SZ+',1fr)';grid=[];for(var i=0;i<SZ*SZ;i++)grid.push('');var pool=[];BANK.forEach(function(b){b.forEach(function(w){if(w.length<=SZ)pool.push(w)})});words=sh(pool).slice(0,wc);found=[];
    words.forEach(function(w){for(var att=0;att<60;att++){var dir=Math.random()<.5?'h':'v';var r=Math.floor(Math.random()*(dir==='v'?SZ-w.length:SZ));var c=Math.floor(Math.random()*(dir==='h'?SZ-w.length:SZ));var ok=true;for(var k=0;k<w.length;k++){var gi=dir==='h'?r*SZ+c+k:(r+k)*SZ+c;if(grid[gi]&&grid[gi]!==w[k]){ok=false;break}}if(ok){for(var k=0;k<w.length;k++){var gi=dir==='h'?r*SZ+c+k:(r+k)*SZ+c;grid[gi]=w[k]}break}}});
    var A='ABCDEFGHIJKLMNOPQRSTUVWXYZ';for(var i=0;i<SZ*SZ;i++)if(!grid[i])grid[i]=A[Math.floor(Math.random()*26)]}
  function rn(){gd.innerHTML='';for(var i=0;i<SZ*SZ;i++){var d=document.createElement('div');d.className='wc';d.textContent=grid[i];d.setAttribute('data-i',i);d.onclick=function(){var idx=parseInt(this.getAttribute('data-i'));sel.push(idx);this.classList.add('ws');chk()};gd.appendChild(d)}rnW()}
  function chk(){words.forEach(function(w){if(found.indexOf(w)>-1)return;for(var dir=0;dir<2;dir++){for(var r=0;r<SZ;r++)for(var c=0;c<=(dir?SZ-w.length:SZ-w.length);c++){var ids=[];for(var k=0;k<w.length;k++)ids.push(dir?(r+k)*SZ+c:r*SZ+c+k);if(dir&&r+w.length>SZ)continue;var m=true;for(var k=0;k<w.length;k++)if(grid[ids[k]]!==w[k]){m=false;break}if(m){var all=true;for(var k=0;k<ids.length;k++)if(sel.indexOf(ids[k])<0){all=false;break}if(all){found.push(w);_play('snap');ids.forEach(function(x){if(gd.children[x]){gd.children[x].classList.add('wf','wf-flash');setTimeout(function(){if(gd.children[x])gd.children[x].classList.remove('wf-flash')},420)}});sel=[];document.getElementById('Wf').textContent=found.length;rnW();if(found.length>=words.length){_e('game_win');_playWin();sm('🌿 All found!');_sr('wordsearch',{w:true,s:found.length})}else if(found.length%2===0)_e('milestone');return}}}}})}
  function rnW(){wl.innerHTML='';words.forEach(function(w){wl.innerHTML+='<span style="'+(found.indexOf(w)>-1?'text-decoration:line-through;opacity:0.4;color:var(--sage)':'color:var(--cream)')+'">'+w+'</span>'})}
  window._WN=function(){sel=[];gen();document.getElementById('Wf').textContent='0';document.getElementById('Wt').textContent=words.length;sm('');rn()};_WN();}

// ═══ HANOI ═══
function GH(a){var pegs=[[],[],[]],discs=5,moves=0,sp=-1;var COLS=['#4a7c35','#7ab356','#C8A84B','#c76a30','#4a7aaa','#9b59b6','#c75050'];
  ms(a,'👆<strong id="Hm">0</strong> · Opt:<strong id="Ho">31</strong>');mm(a);
  var pd=document.createElement('div');pd.className='hp';pd.id='Hp';a.appendChild(pd);mc(a).innerHTML='<select class="gsl" id="Hd" onchange="_HN()"><option value="4">4</option><option value="5" selected>5</option><option value="6">6</option><option value="7">7</option></select> discs <button class="gb-new" onclick="_HN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';
  function rn(){pd.innerHTML='';for(var p=0;p<3;p++){var pg=document.createElement('div');pg.className='hpeg';pg.setAttribute('data-p',p);pg.onclick=function(){var pi=parseInt(this.getAttribute('data-p'));if(sp<0){if(pegs[pi].length)sp=pi;rn()}else{if(sp===pi){sp=-1;rn();return}if(pegs[pi].length&&pegs[pi][pegs[pi].length-1]<pegs[sp][pegs[sp].length-1]){sm('Too big!');sp=-1;rn();return}_play('snap');pegs[pi].push(pegs[sp].pop());moves++;if(moves%(discs*2)===0&&pegs[2].length<discs)_e('milestone');document.getElementById('Hm').textContent=moves;sp=-1;if(pegs[2].length===discs){_e('game_win');sm('🌿 '+moves+' moves!');_sr('hanoi',{w:true,s:moves})}rn()}};
    if(sp===p)pg.style.background='rgba(200,168,78,.08)';
    var rod=document.createElement('div');rod.style.cssText='width:4px;height:'+(discs*16+20)+'px;background:rgba(74,124,53,.3);border-radius:2px;position:absolute;bottom:0;left:50%;transform:translateX(-50%)';pg.appendChild(rod);
    pegs[p].forEach(function(d){var dk=document.createElement('div');dk.className='hdk';dk.style.width=(30+d*14)+'px';dk.style.background=COLS[d%7];pg.appendChild(dk)});pd.appendChild(pg)}}
  window._HN=function(){discs=parseInt(document.getElementById('Hd').value);_setDiff(discs<=4?'easy':discs<=5?'medium':discs<=6?'hard':'expert');pegs=[[],[],[]];for(var i=discs-1;i>=0;i--)pegs[0].push(i);moves=0;sp=-1;document.getElementById('Hm').textContent='0';document.getElementById('Ho').textContent=(Math.pow(2,discs)-1);sm('');rn()};_HN();}

// ═══ AUTUMN LEAVES (FLOOD FILL) ═══
function GFL(a){var SZ=8,grid=[],moves=0,maxMoves=22;
  var LF=['assets/games/flood/leaf-sage.png','assets/games/flood/leaf-gold.png','assets/games/flood/leaf-slate.png','assets/games/flood/leaf-copper.png','assets/games/flood/leaf-plum.png','assets/games/flood/leaf-crimson.png'];
  var CC=['#4a7c35','#C8A84B','#4a7aaa','#c76a30','#9b59b6','#c75050'];
  ms(a,'Moves: <strong id="FFm">0</strong>/'+maxMoves);mm(a);
  var gd=document.createElement('div');gd.className='lg';gd.id='FFg';gd.style.gridTemplateColumns='repeat('+SZ+',1fr)';gd.style.gap='2px';gd.style.width='clamp(300px,92vw,420px)';a.appendChild(gd);
  var pb=document.createElement('div');pb.className='lg';pb.style.gridTemplateColumns='repeat(6,1fr)';pb.style.gap='8px';pb.style.padding='12px';pb.style.width='clamp(300px,92vw,420px)';a.appendChild(pb);
  mc(a).innerHTML='<button class="gb-new" onclick="_FFN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';
  function gen(){grid=[];for(var i=0;i<SZ*SZ;i++)grid.push(Math.floor(Math.random()*6));moves=0}
  function flood(oc,nc){if(oc===nc)return;var vis=[];for(var x=0;x<SZ*SZ;x++)vis.push(false);var q=[0];while(q.length){var i=q.shift();if(i<0||i>=SZ*SZ||vis[i])continue;if(grid[i]!==oc&&grid[i]!==nc)continue;vis[i]=true;if(grid[i]===oc)grid[i]=nc;var r=Math.floor(i/SZ),c=i%SZ;if(r>0)q.push(i-SZ);if(r<SZ-1)q.push(i+SZ);if(c>0)q.push(i-1);if(c<SZ-1)q.push(i+1)}}
  function rn(){gd.innerHTML='';for(var i=0;i<SZ*SZ;i++){var d=document.createElement('div');d.className='lc';d.style.background='url('+LF[grid[i]]+') center/cover '+CC[grid[i]];d.setAttribute('data-i',i);gd.appendChild(d)}
    pb.innerHTML='';for(var j=0;j<6;j++){var b=document.createElement('div');b.className='lc'+(grid[0]===j?' lo':'');b.style.background='url('+LF[j]+') center/cover '+CC[j];b.setAttribute('data-c',j);b.onclick=function(){_FFC(parseInt(this.getAttribute('data-c')))};pb.appendChild(b)}}
  window._FFC=function(c){if(grid[0]===c)return;_play('tap');flood(grid[0],c);moves++;document.getElementById('FFm').textContent=moves;rn();if(grid.every(function(v){return v===grid[0]})){_e('game_win');_playWin();sm('🍂 Flooded in '+moves+'!');_sr('flood',{w:true,s:moves})}else if(moves>=maxMoves){_e('game_loss');_play('lose');sm('Out of moves!');_sr('flood',{w:false,s:moves})}};
  window._FFN=function(){gen();sm('');rn()};_FFN();}

// ═══ VINE FLOW ═══
function GPP(a){var SZ=6,grid=[],_rc=0,srcI=0,endI=0;
  var VI='assets/games/pipe/';
  var IMG_ST=VI+'vine-straight.png',IMG_CR=VI+'vine-corner.png',IMG_SR=VI+'vine-source.png',IMG_EN=VI+'vine-end.png';
  var EX_ST=[1,0,1,0],EX_CR=[1,1,0,0],EX_EN=[0,0,0,1];
  ms(a,'<span id="PPc">0</span>/'+SZ*SZ+' vines');mm(a);
  var gd=document.createElement('div');gd.className='lg';gd.id='PP';gd.style.gridTemplateColumns='repeat('+SZ+',1fr)';gd.style.gap='2px';gd.style.width='clamp(300px,92vw,420px)';a.appendChild(gd);
  mc(a).innerHTML='<button class="gb-new" onclick="_PPN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';
  function dirOf(f,t){var d=t-f;return d===-SZ?0:d===1?1:d===SZ?2:d===-1?3:-1}
  function adjCnt(ci,vis){var cy=Math.floor(ci/SZ),cx=ci%SZ,c=0;if(cy>0&&!vis[ci-SZ])c++;if(cx<SZ-1&&!vis[ci+1])c++;if(cy<SZ-1&&!vis[ci+SZ])c++;if(cx>0&&!vis[ci-1])c++;return c}
  function makePath(){
    var vis=[];for(var i=0;i<SZ*SZ;i++)vis.push(false);
    var path=[0];vis[0]=true;
    while(path.length<SZ*SZ){
      var cur=path[path.length-1],cy=Math.floor(cur/SZ),cx=cur%SZ,nb=[];
      if(cy>0&&!vis[cur-SZ])nb.push(cur-SZ);if(cx<SZ-1&&!vis[cur+1])nb.push(cur+1);
      if(cy<SZ-1&&!vis[cur+SZ])nb.push(cur+SZ);if(cx>0&&!vis[cur-1])nb.push(cur-1);
      if(!nb.length)break;
      nb.sort(function(x,y){return adjCnt(x,vis)-adjCnt(y,vis)});
      var mn=adjCnt(nb[0],vis),ties=[];
      for(var t=0;t<nb.length;t++){if(adjCnt(nb[t],vis)===mn)ties.push(nb[t])}
      var pick=ties[Math.floor(Math.random()*ties.length)];
      path.push(pick);vis[pick]=true;
    }
    return path;
  }
  function gen(){
    grid=[];_rc=0;
    var path=makePath(),tries=0;
    while(path.length<SZ*SZ&&tries<200){path=makePath();tries++}
    srcI=path[0];endI=path[path.length-1];
    for(var i=0;i<SZ*SZ;i++)grid.push(null);
    for(var p=0;p<path.length;p++){
      var ci=path[p];
      if(p===0){
        var d=dirOf(ci,path[1]);var erm=[1,2,3,0];
        grid[ci]={img:IMG_SR,ex:EX_EN,rot:erm[d],fixed:true};
      }else if(p===path.length-1){
        var d=dirOf(ci,path[p-1]);var erm=[1,2,3,0];
        grid[ci]={img:IMG_EN,ex:EX_EN,rot:erm[d],fixed:true};
      }else{
        var d1=dirOf(ci,path[p-1]),d2=dirOf(ci,path[p+1]);
        var lo=Math.min(d1,d2),hi=Math.max(d1,d2);
        if((lo===0&&hi===2)||(lo===1&&hi===3)){
          grid[ci]={img:IMG_ST,ex:EX_ST,rot:lo===0?0:1,fixed:false};
        }else{
          var cm={1:0,6:1,11:2,3:3};
          grid[ci]={img:IMG_CR,ex:EX_CR,rot:cm[lo*4+hi],fixed:false};
        }
      }
    }
    for(var i=0;i<SZ*SZ;i++){if(!grid[i])grid[i]={img:IMG_ST,ex:EX_ST,rot:0,fixed:false}}
    for(var i=0;i<SZ*SZ;i++){if(!grid[i].fixed){var s=Math.floor(Math.random()*3)+1;grid[i].rot=(grid[i].rot+s)%4}}
  }
  function pExit(i){var g=grid[i],r=g.rot%4,e=g.ex.slice();for(var rr=0;rr<r;rr++){e=[e[3],e[0],e[1],e[2]];}return e}
  function _ppCheck(){
    var vis=[];for(var x=0;x<SZ*SZ;x++)vis.push(false);
    var q=[srcI];vis[srcI]=true;var cnt=1;
    while(q.length){var ci=q.shift();var e=pExit(ci);var cy=Math.floor(ci/SZ),cx=ci%SZ;
      var nb=[cy>0?ci-SZ:-1,cx<SZ-1?ci+1:-1,cy<SZ-1?ci+SZ:-1,cx>0?ci-1:-1];
      var op=[2,3,0,1];
      for(var d=0;d<4;d++){var ni=nb[d];if(ni<0||vis[ni])continue;if(e[d]){var ne=pExit(ni);if(ne[op[d]]){vis[ni]=true;q.push(ni);cnt++}}}}
    return {won:vis[endI],count:cnt,vis:vis}}
  function rn(){gd.innerHTML='';var st=_ppCheck();var el=document.getElementById('PPc');if(el)el.textContent=st.count;
    for(var i=0;i<SZ*SZ;i++){var d=document.createElement('div');d.className='lc';var g=grid[i];
      d.style.background='url('+g.img+') center/cover #1a1e16';d.style.transform='rotate('+(g.rot*90)+'deg)';d.style.transition='transform 0.15s ease';
      if(st.vis[i])d.style.boxShadow='inset 0 0 12px rgba(122,179,86,.4)';
      if(i===srcI)d.style.boxShadow='0 0 10px rgba(122,179,86,.6),inset 0 0 12px rgba(122,179,86,.4)';
      else if(i===endI)d.style.boxShadow='0 0 10px rgba(200,168,75,.6)'+(st.vis[i]?',inset 0 0 12px rgba(122,179,86,.4)':'');
      if(!g.fixed){d.setAttribute('data-i',i);d.onclick=function(){var idx=parseInt(this.getAttribute('data-i'));_play('click');grid[idx].rot=(grid[idx].rot+1)%4;_rc++;rn();
        var res=_ppCheck();if(res.won){_e('game_win');_playWin();sm('🌿 Root to bloom! '+_rc+' rotations');_sr('pipe',{w:true,s:_rc})}}}
      gd.appendChild(d)}}
  window._PPN=function(){gen();sm('Connect root to bloom');rn()};_PPN();}

// ═══ GROVE CHESS ═══
function GCH(a){
  var _chArt='assets/games/chess/';
  var _skinChess={
    lightSq:'rgba(42,48,37,.5)',darkSq:'rgba(74,124,53,.25)',
    selectGlow:'rgba(200,168,75,.4)',moveIndicator:'rgba(122,179,86,.5)',
    lastMoveHighlight:'rgba(200,168,75,.12)',checkHighlight:'rgba(180,60,60,.35)',
    playerPieces:{
      K:'<img src="'+_chArt+'p-king-green.png" style="width:90%;height:90%;object-fit:contain;pointer-events:none">',
      Q:'<img src="'+_chArt+'p-queen-green.png" style="width:90%;height:90%;object-fit:contain;pointer-events:none">',
      R:'<img src="'+_chArt+'p-rook-green.png" style="width:90%;height:90%;object-fit:contain;pointer-events:none">',
      B:'<img src="'+_chArt+'p-bishop-green.png" style="width:90%;height:90%;object-fit:contain;pointer-events:none">',
      N:'<img src="'+_chArt+'p-knight-green.png" style="width:90%;height:90%;object-fit:contain;pointer-events:none">',
      P:'<img src="'+_chArt+'p-pawn-green.png" style="width:85%;height:85%;object-fit:contain;pointer-events:none">'
    },
    aiPieces:{
      K:'<img src="'+_chArt+'p-king-gold.png" style="width:90%;height:90%;object-fit:contain;pointer-events:none">',
      Q:'<img src="'+_chArt+'p-queen-gold.png" style="width:90%;height:90%;object-fit:contain;pointer-events:none">',
      R:'<img src="'+_chArt+'p-rook-gold.png" style="width:90%;height:90%;object-fit:contain;pointer-events:none">',
      B:'<img src="'+_chArt+'p-bishop-gold.png" style="width:90%;height:90%;object-fit:contain;pointer-events:none">',
      N:'<img src="'+_chArt+'p-knight-gold.png" style="width:90%;height:90%;object-fit:contain;pointer-events:none">',
      P:'<img src="'+_chArt+'p-pawn-gold.png" style="width:85%;height:85%;object-fit:contain;pointer-events:none">'
    }
  };
  // ── Constants ──
  var W='w',B='b',EMPTY=null;
  var PAWN='P',ROOK='R',KNIGHT='N',BISHOP='B',QUEEN='Q',KING='K';
  var PIECE_VAL={P:100,N:320,B:330,R:500,Q:900,K:20000};
  // position bonus tables (8x8, from white's perspective)
  var PST={};
  PST[PAWN]=[0,0,0,0,0,0,0,0,50,50,50,50,50,50,50,50,10,10,20,30,30,20,10,10,5,5,10,25,25,10,5,5,0,0,0,20,20,0,0,0,5,-5,-10,0,0,-10,-5,5,5,10,10,-20,-20,10,10,5,0,0,0,0,0,0,0,0];
  PST[KNIGHT]=[-50,-40,-30,-30,-30,-30,-40,-50,-40,-20,0,0,0,0,-20,-40,-30,0,10,15,15,10,0,-30,-30,5,15,20,20,15,5,-30,-30,0,15,20,20,15,0,-30,-30,5,10,15,15,10,5,-30,-40,-20,0,5,5,0,-20,-40,-50,-40,-30,-30,-30,-30,-40,-50];
  PST[BISHOP]=[-20,-10,-10,-10,-10,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,10,10,5,0,-10,-10,5,5,10,10,5,5,-10,-10,0,10,10,10,10,0,-10,-10,10,10,10,10,10,10,-10,-10,5,0,0,0,0,5,-10,-20,-10,-10,-10,-10,-10,-10,-20];
  PST[ROOK]=[0,0,0,0,0,0,0,0,5,10,10,10,10,10,10,5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,0,0,0,5,5,0,0,0];
  PST[QUEEN]=[-20,-10,-10,-5,-5,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,5,5,5,0,-10,-5,0,5,5,5,5,0,-5,0,0,5,5,5,5,0,-5,-10,5,5,5,5,5,0,-10,-10,0,5,0,0,0,0,-10,-20,-10,-10,-5,-5,-10,-10,-20];
  PST[KING]=[-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-20,-30,-30,-40,-40,-30,-30,-20,-10,-20,-20,-20,-20,-20,-20,-10,20,20,0,0,0,0,20,20,20,30,10,0,0,10,30,20];

  // ── Board state ──
  var board=[];   // board[r][c] = {type, color} or null (r=0 is rank 8)
  var turn=W;
  var castling={wK:true,wQ:true,bK:true,bQ:true};
  var epSquare=null; // [r,c] or null
  var moveCount=0;
  var halfmove=0;
  var lastMove=null; // {fr,fc,tr,tc}
  var selSq=null;    // [r,c] or null
  var legalMoves=[];
  var capturedW=[];  // pieces captured from white
  var capturedB=[];  // pieces captured from black
  var gameOver=false;
  var history=[];    // for undo: {board,turn,castling,epSquare,moveCount,halfmove,capturedW,capturedB,lastMove}
  var moveLog=[];    // sequence of moves as "frfctrtc" strings for opening book
  var posHistory={};  // position key → count for threefold repetition

  function initBoard(){
    board=[];
    var back=[ROOK,KNIGHT,BISHOP,QUEEN,KING,BISHOP,KNIGHT,ROOK];
    for(var r=0;r<8;r++){
      board[r]=[];
      for(var c=0;c<8;c++){
        if(r===0) board[r][c]={type:back[c],color:B};
        else if(r===1) board[r][c]={type:PAWN,color:B};
        else if(r===6) board[r][c]={type:PAWN,color:W};
        else if(r===7) board[r][c]={type:back[c],color:W};
        else board[r][c]=EMPTY;
      }
    }
    turn=W;castling={wK:true,wQ:true,bK:true,bQ:true};
    epSquare=null;moveCount=0;halfmove=0;lastMove=null;
    selSq=null;legalMoves=[];capturedW=[];capturedB=[];
    gameOver=false;history=[];moveLog=[];posHistory={};
  }

  function cloneBoard(b){
    var nb=[];
    for(var r=0;r<8;r++){nb[r]=[];for(var c=0;c<8;c++){var p=b[r][c];nb[r][c]=p?{type:p.type,color:p.color}:EMPTY;}}
    return nb;
  }

  function findKing(b,col){
    for(var r=0;r<8;r++)for(var c=0;c<8;c++){var p=b[r][c];if(p&&p.type===KING&&p.color===col)return [r,c];}
    return null;
  }

  // Is square (r,c) attacked by color 'by' on board b?
  function isAttacked(b,r,c,by){
    var dr,dc,i,p,tr,tc;
    // Knight attacks
    var kd=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    for(i=0;i<kd.length;i++){tr=r+kd[i][0];tc=c+kd[i][1];if(tr>=0&&tr<8&&tc>=0&&tc<8){p=b[tr][tc];if(p&&p.color===by&&p.type===KNIGHT)return true;}}
    // Rook/Queen (straight lines)
    var sd=[[0,1],[0,-1],[1,0],[-1,0]];
    for(i=0;i<sd.length;i++){dr=sd[i][0];dc=sd[i][1];tr=r+dr;tc=c+dc;while(tr>=0&&tr<8&&tc>=0&&tc<8){p=b[tr][tc];if(p){if(p.color===by&&(p.type===ROOK||p.type===QUEEN))return true;break;}tr+=dr;tc+=dc;}}
    // Bishop/Queen (diagonals)
    var bd=[[1,1],[1,-1],[-1,1],[-1,-1]];
    for(i=0;i<bd.length;i++){dr=bd[i][0];dc=bd[i][1];tr=r+dr;tc=c+dc;while(tr>=0&&tr<8&&tc>=0&&tc<8){p=b[tr][tc];if(p){if(p.color===by&&(p.type===BISHOP||p.type===QUEEN))return true;break;}tr+=dr;tc+=dc;}}
    // Pawn attacks
    var pd=by===W?-1:1;
    if(r+pd>=0&&r+pd<8){if(c-1>=0){p=b[r+pd][c-1];if(p&&p.color===by&&p.type===PAWN)return true;}if(c+1<8){p=b[r+pd][c+1];if(p&&p.color===by&&p.type===PAWN)return true;}}
    // King attacks
    for(dr=-1;dr<=1;dr++)for(dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;tr=r+dr;tc=c+dc;if(tr>=0&&tr<8&&tc>=0&&tc<8){p=b[tr][tc];if(p&&p.color===by&&p.type===KING)return true;}}
    return false;
  }

  function inCheck(b,col){
    var kp=findKing(b,col);
    if(!kp)return false;
    return isAttacked(b,kp[0],kp[1],col===W?B:W);
  }

  // Generate pseudo-legal moves for color on board b with given state
  function genMoves(b,col,cas,ep){
    var moves=[];
    var dir=col===W?-1:1;
    var startRow=col===W?6:1;
    var promoRow=col===W?0:7;
    for(var r=0;r<8;r++)for(var c=0;c<8;c++){
      var p=b[r][c];if(!p||p.color!==col)continue;
      var t=p.type;
      if(t===PAWN){
        // Forward 1
        if(r+dir>=0&&r+dir<8&&!b[r+dir][c]){
          if(r+dir===promoRow)moves.push({fr:r,fc:c,tr:r+dir,tc:c,promo:QUEEN});
          else moves.push({fr:r,fc:c,tr:r+dir,tc:c});
          // Forward 2 from start
          if(r===startRow&&!b[r+dir*2][c])moves.push({fr:r,fc:c,tr:r+dir*2,tc:c});
        }
        // Captures
        var pc;
        if(c-1>=0&&r+dir>=0&&r+dir<8){pc=b[r+dir][c-1];if(pc&&pc.color!==col){if(r+dir===promoRow)moves.push({fr:r,fc:c,tr:r+dir,tc:c-1,promo:QUEEN});else moves.push({fr:r,fc:c,tr:r+dir,tc:c-1});}
          if(ep&&ep[0]===r+dir&&ep[1]===c-1)moves.push({fr:r,fc:c,tr:r+dir,tc:c-1,ep:true});}
        if(c+1<8&&r+dir>=0&&r+dir<8){pc=b[r+dir][c+1];if(pc&&pc.color!==col){if(r+dir===promoRow)moves.push({fr:r,fc:c,tr:r+dir,tc:c+1,promo:QUEEN});else moves.push({fr:r,fc:c,tr:r+dir,tc:c+1});}
          if(ep&&ep[0]===r+dir&&ep[1]===c+1)moves.push({fr:r,fc:c,tr:r+dir,tc:c+1,ep:true});}
      }else if(t===KNIGHT){
        var kd2=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
        for(var i=0;i<kd2.length;i++){var tr2=r+kd2[i][0],tc2=c+kd2[i][1];if(tr2>=0&&tr2<8&&tc2>=0&&tc2<8){var dp=b[tr2][tc2];if(!dp||dp.color!==col)moves.push({fr:r,fc:c,tr:tr2,tc:tc2});}}
      }else{
        var dirs=[];
        if(t===ROOK||t===QUEEN)dirs=dirs.concat([[0,1],[0,-1],[1,0],[-1,0]]);
        if(t===BISHOP||t===QUEEN)dirs=dirs.concat([[1,1],[1,-1],[-1,1],[-1,-1]]);
        if(t===KING)dirs=[[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
        for(var d=0;d<dirs.length;d++){
          var dr3=dirs[d][0],dc3=dirs[d][1],tr3=r+dr3,tc3=c+dc3;
          if(t===KING){
            if(tr3>=0&&tr3<8&&tc3>=0&&tc3<8){var kp2=b[tr3][tc3];if(!kp2||kp2.color!==col)moves.push({fr:r,fc:c,tr:tr3,tc:tc3});}
          }else{
            while(tr3>=0&&tr3<8&&tc3>=0&&tc3<8){
              var sp=b[tr3][tc3];
              if(sp){if(sp.color!==col)moves.push({fr:r,fc:c,tr:tr3,tc:tc3});break;}
              moves.push({fr:r,fc:c,tr:tr3,tc:tc3});tr3+=dr3;tc3+=dc3;
            }
          }
        }
        // Castling
        if(t===KING){
          var row=col===W?7:0;
          var opp=col===W?B:W;
          if(r===row&&c===4){
            // King side
            if((col===W?cas.wK:cas.bK)&&!b[row][5]&&!b[row][6]&&b[row][7]&&b[row][7].type===ROOK&&b[row][7].color===col){
              if(!isAttacked(b,row,4,opp)&&!isAttacked(b,row,5,opp)&&!isAttacked(b,row,6,opp))
                moves.push({fr:row,fc:4,tr:row,tc:6,castle:'K'});
            }
            // Queen side
            if((col===W?cas.wQ:cas.bQ)&&!b[row][3]&&!b[row][2]&&!b[row][1]&&b[row][0]&&b[row][0].type===ROOK&&b[row][0].color===col){
              if(!isAttacked(b,row,4,opp)&&!isAttacked(b,row,3,opp)&&!isAttacked(b,row,2,opp))
                moves.push({fr:row,fc:4,tr:row,tc:2,castle:'Q'});
            }
          }
        }
      }
    }
    return moves;
  }

  // Apply move on board b, returns captured piece or null
  function applyMove(b,m,cas,ep){
    var piece=b[m.fr][m.fc];
    var captured=b[m.tr][m.tc];
    b[m.tr][m.tc]={type:piece.type,color:piece.color};
    b[m.fr][m.fc]=EMPTY;
    // En passant capture
    if(m.ep){captured=b[m.fr][m.tc];b[m.fr][m.tc]=EMPTY;}
    // Promotion
    if(m.promo)b[m.tr][m.tc].type=m.promo;
    // Castling rook move
    if(m.castle){
      var row=m.fr;
      if(m.castle==='K'){b[row][5]={type:ROOK,color:piece.color};b[row][7]=EMPTY;}
      else{b[row][3]={type:ROOK,color:piece.color};b[row][0]=EMPTY;}
    }
    return captured;
  }

  // Get legal moves (filters pseudo-legal for check)
  function getLegalMoves(b,col,cas,ep){
    var pseudo=genMoves(b,col,cas,ep);
    var legal=[];
    for(var i=0;i<pseudo.length;i++){
      var m=pseudo[i];
      var nb=cloneBoard(b);
      var ncas={wK:cas.wK,wQ:cas.wQ,bK:cas.bK,bQ:cas.bQ};
      applyMove(nb,m,ncas,ep);
      if(!inCheck(nb,col))legal.push(m);
    }
    return legal;
  }

  function updateCastlingRights(m){
    if(m.fr===7&&m.fc===4){castling.wK=false;castling.wQ=false;}
    if(m.fr===0&&m.fc===4){castling.bK=false;castling.bQ=false;}
    if(m.fr===7&&m.fc===7)castling.wK=false;
    if(m.fr===7&&m.fc===0)castling.wQ=false;
    if(m.fr===0&&m.fc===7)castling.bK=false;
    if(m.fr===0&&m.fc===0)castling.bQ=false;
    if(m.tr===7&&m.tc===7)castling.wK=false;
    if(m.tr===7&&m.tc===0)castling.wQ=false;
    if(m.tr===0&&m.tc===7)castling.bK=false;
    if(m.tr===0&&m.tc===0)castling.bQ=false;
  }

  // Make a move on the real game board
  function makeMove(m){
    // Save state for undo
    history.push({
      board:cloneBoard(board),turn:turn,
      castling:{wK:castling.wK,wQ:castling.wQ,bK:castling.bK,bQ:castling.bQ},
      epSquare:epSquare?[epSquare[0],epSquare[1]]:null,
      moveCount:moveCount,halfmove:halfmove,
      capturedW:capturedW.slice(),capturedB:capturedB.slice(),
      lastMove:lastMove
    });
    var piece=board[m.fr][m.fc];
    var cap=applyMove(board,m,castling,epSquare);
    board._lastCap=!!cap;
    if(cap){
      if(cap.color===W)capturedW.push(cap.type);
      else capturedB.push(cap.type);
      halfmove=0;
    }else if(piece.type===PAWN){halfmove=0;}
    else{halfmove++;}
    // En passant square
    if(piece.type===PAWN&&Math.abs(m.tr-m.fr)===2)epSquare=[(m.fr+m.tr)/2,m.fc];
    else epSquare=null;
    updateCastlingRights(m);
    lastMove={fr:m.fr,fc:m.fc,tr:m.tr,tc:m.tc};
    moveLog.push(''+m.fr+m.fc+m.tr+m.tc);
    if(turn===B)moveCount++;
    turn=turn===W?B:W;
    // Track position for threefold repetition
    var pk=posKey(board,turn,castling,epSquare);
    posHistory[pk]=(posHistory[pk]||0)+1;
  }

  function undoMove(){
    if(!history.length)return false;
    // Remove position before undo
    var pk=posKey(board,turn,castling,epSquare);
    if(posHistory[pk])posHistory[pk]--;
    var s=history.pop();
    board=s.board;turn=s.turn;castling=s.castling;
    epSquare=s.epSquare;moveCount=s.moveCount;halfmove=s.halfmove;
    capturedW=s.capturedW;capturedB=s.capturedB;lastMove=s.lastMove;
    moveLog.pop();
    return true;
  }

  // Position key for repetition detection
  function posKey(b,t,cas,ep){
    var k='';
    for(var r=0;r<8;r++)for(var c=0;c<8;c++){var p=b[r][c];k+=p?(p.color+p.type):'.';}
    k+=t+(cas.wK?1:0)+(cas.wQ?1:0)+(cas.bK?1:0)+(cas.bQ?1:0);
    if(ep)k+=ep[0]+''+ep[1];
    return k;
  }

  // Insufficient material detection
  function insufficientMaterial(b){
    var wPieces=[],bPieces=[];
    for(var r=0;r<8;r++)for(var c=0;c<8;c++){
      var p=b[r][c];if(!p)continue;
      if(p.color===W)wPieces.push(p.type);else bPieces.push(p.type);
    }
    // K vs K
    if(wPieces.length===1&&bPieces.length===1)return true;
    // K+B vs K or K+N vs K
    if(wPieces.length===1&&bPieces.length===2){
      if(bPieces.indexOf(BISHOP)>=0||bPieces.indexOf(KNIGHT)>=0)return true;
    }
    if(bPieces.length===1&&wPieces.length===2){
      if(wPieces.indexOf(BISHOP)>=0||wPieces.indexOf(KNIGHT)>=0)return true;
    }
    return false;
  }

  // ── AI (Enhanced — positional eval, quiescence, opening book, iterative deepening) ──

  // Opening book: maps move sequence to AI response (AI plays black)
  // Coordinates: row0=rank8, col0=a-file. Move = "frfctrtc"
  var _chBook={};
  // Response to 1.e4
  _chBook['6444']={fr:1,fc:2,tr:3,tc:2};           // 1...c5 (Sicilian)
  // Response to 1.d4
  _chBook['6343']={fr:0,fc:6,tr:2,tc:5};           // 1...Nf6 (Indian)
  // Response to 1.c4
  _chBook['6242']={fr:1,fc:4,tr:3,tc:4};           // 1...e5
  // Response to 1.Nf3
  _chBook['7655']={fr:1,fc:3,tr:3,tc:3};           // 1...d5
  // Response to 1.b3
  _chBook['6151']={fr:1,fc:4,tr:3,tc:4};           // 1...e5
  // Response to 1.g3
  _chBook['6656']={fr:1,fc:3,tr:3,tc:3};           // 1...d5
  // Sicilian: 1.e4 c5 2.Nf3 → d6
  _chBook['6444 1232 7655']={fr:1,fc:3,tr:2,tc:3};
  // Sicilian: 1.e4 c5 2.Nc3 → Nc6
  _chBook['6444 1232 7152']={fr:0,fc:1,tr:2,tc:2};
  // Sicilian: 1.e4 c5 2.d4 → cxd4
  _chBook['6444 1232 6343']={fr:3,fc:2,tr:4,tc:3};
  // Sicilian Najdorf: 1.e4 c5 2.Nf3 d6 3.d4 → cxd4
  _chBook['6444 1232 7655 1323 6343']={fr:3,fc:2,tr:4,tc:3};
  // Open Sicilian: ...cxd4 4.Nxd4 → Nf6
  _chBook['6444 1232 7655 1323 6343 3243 5543']={fr:0,fc:6,tr:2,tc:5};
  // Najdorf: ...Nf6 5.Nc3 → a6
  _chBook['6444 1232 7655 1323 6343 3243 5543 0625 7152']={fr:1,fc:0,tr:2,tc:0};
  // Indian: 1.d4 Nf6 2.c4 → e6
  _chBook['6343 0625 6242']={fr:1,fc:4,tr:2,tc:4};
  // Indian: 1.d4 Nf6 2.Nf3 → d5
  _chBook['6343 0625 7655']={fr:1,fc:3,tr:3,tc:3};
  // Nimzo: 1.d4 Nf6 2.c4 e6 3.Nc3 → Bb4
  _chBook['6343 0625 6242 1424 7152']={fr:0,fc:5,tr:3,tc:1};
  // QGD: 1.d4 Nf6 2.c4 e6 3.Nf3 → d5
  _chBook['6343 0625 6242 1424 7655']={fr:1,fc:3,tr:3,tc:3};
  // QGD: 1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 → O-O
  _chBook['6343 0625 6242 1424 7152 0531 6454']={fr:0,fc:4,tr:0,tc:6,castle:'K'};
  // KID: 1.d4 Nf6 2.c4 g6
  _chBook['6343 0625 6242']={fr:1,fc:4,tr:2,tc:4}; // e6 (flexible)
  // English: 1.c4 e5 2.Nc3 → Nf6
  _chBook['6242 1434 7152']={fr:0,fc:6,tr:2,tc:5};
  // Ruy Lopez defense: 1.e4 e5 2.Nf3 → Nc6 (if AI played e5)
  _chBook['6444 1434 7655']={fr:0,fc:1,tr:2,tc:2};

  // Endgame king PST (centralize king in endgame)
  var PST_KING_END=[-50,-40,-30,-20,-20,-30,-40,-50,-30,-20,-10,0,0,-10,-20,-30,-30,-10,20,30,30,20,-10,-30,-30,-10,30,40,40,30,-10,-30,-30,-10,30,40,40,30,-10,-30,-30,-10,20,30,30,20,-10,-30,-30,-30,0,0,0,0,-30,-30,-50,-30,-30,-30,-30,-30,-30,-50];

  // Castling update helper (avoids duplicate code)
  function _updateCas(m,cas){
    if(m.fr===7&&m.fc===4){cas.wK=false;cas.wQ=false;}
    if(m.fr===0&&m.fc===4){cas.bK=false;cas.bQ=false;}
    if(m.fr===7&&m.fc===7||m.tr===7&&m.tc===7)cas.wK=false;
    if(m.fr===7&&m.fc===0||m.tr===7&&m.tc===0)cas.wQ=false;
    if(m.fr===0&&m.fc===7||m.tr===0&&m.tc===7)cas.bK=false;
    if(m.fr===0&&m.fc===0||m.tr===0&&m.tc===0)cas.bQ=false;
  }

  function evaluate(b){
    var score=0;
    var wPawns=[],bPawns=[];
    var wBishops=0,bBishops=0;
    var wMaterial=0,bMaterial=0;
    var wMobility=0,bMobility=0;
    // Material + PST + piece stats
    for(var r=0;r<8;r++)for(var c=0;c<8;c++){
      var p=b[r][c];if(!p)continue;
      var val=PIECE_VAL[p.type]||0;
      var pstIdx=p.color===W?r*8+c:(7-r)*8+c;
      var pst=PST[p.type]?PST[p.type][pstIdx]:0;
      if(p.color===W){
        score+=val+pst;wMaterial+=val;
        if(p.type===PAWN)wPawns.push({r:r,c:c});
        if(p.type===BISHOP)wBishops++;
      }else{
        score-=val+pst;bMaterial+=val;
        if(p.type===PAWN)bPawns.push({r:r,c:c});
        if(p.type===BISHOP)bBishops++;
      }
    }
    // Endgame: use centralized king PST
    var totalMat=wMaterial+bMaterial-40000;
    if(totalMat<2600){
      var wk=findKing(b,W),bk=findKing(b,B);
      if(wk)score+=PST_KING_END[wk[0]*8+wk[1]]-PST[KING][wk[0]*8+wk[1]];
      if(bk)score-=PST_KING_END[(7-bk[0])*8+bk[1]]-PST[KING][(7-bk[0])*8+bk[1]];
    }
    // Bishop pair
    if(wBishops>=2)score+=35;
    if(bBishops>=2)score-=35;
    // Pawn structure
    score+=_evalPawns(wPawns,bPawns,b);
    // King safety (middlegame only)
    if(totalMat>2600)score+=_evalKingSafety(b,W)-_evalKingSafety(b,B);
    // Rook bonuses
    score+=_evalRooks(b,wPawns,bPawns);
    // Tempo bonus (small bonus for side to move — helps break ties)
    return score;
  }

  function _evalPawns(wP,bP,b){
    var s=0;
    var wF=[0,0,0,0,0,0,0,0],bF=[0,0,0,0,0,0,0,0];
    var i,c,f;
    for(i=0;i<wP.length;i++)wF[wP[i].c]++;
    for(i=0;i<bP.length;i++)bF[bP[i].c]++;
    // White pawns
    for(i=0;i<wP.length;i++){
      c=wP[i].c;
      // Doubled
      if(wF[c]>1)s-=10;
      // Isolated
      if((c===0||wF[c-1]===0)&&(c===7||wF[c+1]===0))s-=15;
      // Passed pawn (no enemy pawns ahead on same or adjacent files)
      var passed=true;
      for(var rr=wP[i].r-1;rr>=0;rr--){
        for(var cc=c-1;cc<=c+1;cc++){
          if(cc>=0&&cc<8&&b[rr][cc]&&b[rr][cc].type===PAWN&&b[rr][cc].color===B){passed=false;break;}
        }
        if(!passed)break;
      }
      if(passed)s+=15+(6-wP[i].r)*8;
      // Connected (pawn on adjacent file at same/±1 rank)
      var connected=false;
      for(var dc=-1;dc<=1;dc+=2){
        var nc=c+dc;if(nc<0||nc>7)continue;
        for(var dr=-1;dr<=1;dr++){
          var nr=wP[i].r+dr;if(nr<0||nr>7)continue;
          if(b[nr][nc]&&b[nr][nc].type===PAWN&&b[nr][nc].color===W){connected=true;break;}
        }
        if(connected)break;
      }
      if(connected)s+=5;
    }
    // Black pawns
    for(i=0;i<bP.length;i++){
      c=bP[i].c;
      if(bF[c]>1)s+=10;
      if((c===0||bF[c-1]===0)&&(c===7||bF[c+1]===0))s+=15;
      var passed2=true;
      for(var rr2=bP[i].r+1;rr2<8;rr2++){
        for(var cc2=c-1;cc2<=c+1;cc2++){
          if(cc2>=0&&cc2<8&&b[rr2][cc2]&&b[rr2][cc2].type===PAWN&&b[rr2][cc2].color===W){passed2=false;break;}
        }
        if(!passed2)break;
      }
      if(passed2)s-=15+(bP[i].r-1)*8;
      var connected2=false;
      for(var dc2=-1;dc2<=1;dc2+=2){
        var nc2=c+dc2;if(nc2<0||nc2>7)continue;
        for(var dr2=-1;dr2<=1;dr2++){
          var nr2=bP[i].r+dr2;if(nr2<0||nr2>7)continue;
          if(b[nr2][nc2]&&b[nr2][nc2].type===PAWN&&b[nr2][nc2].color===B){connected2=true;break;}
        }
        if(connected2)break;
      }
      if(connected2)s-=5;
    }
    return s;
  }

  function _evalKingSafety(b,col){
    var kp=findKing(b,col);if(!kp)return 0;
    var safety=0,kr=kp[0],kc=kp[1];
    var dir=col===W?-1:1;
    // Pawn shield
    for(var dc=-1;dc<=1;dc++){
      var sc=kc+dc;if(sc<0||sc>7)continue;
      var sr=kr+dir;
      if(sr>=0&&sr<8&&b[sr][sc]&&b[sr][sc].type===PAWN&&b[sr][sc].color===col){
        safety+=12;
      }else{
        safety-=15; // open lane near king
        // Check if file is fully open (very dangerous)
        var fileOpen=true;
        for(var rr=0;rr<8;rr++){if(b[rr][sc]&&b[rr][sc].type===PAWN){fileOpen=false;break;}}
        if(fileOpen)safety-=10;
      }
    }
    // Penalty for king in center during middlegame
    if(kc>=2&&kc<=5&&kr!==(col===W?7:0))safety-=20;
    return safety;
  }

  function _evalRooks(b,wP,bP){
    var s=0;
    var wF=[0,0,0,0,0,0,0,0],bF=[0,0,0,0,0,0,0,0];
    for(var i=0;i<wP.length;i++)wF[wP[i].c]++;
    for(var j=0;j<bP.length;j++)bF[bP[j].c]++;
    for(var r=0;r<8;r++)for(var c=0;c<8;c++){
      var p=b[r][c];if(!p||p.type!==ROOK)continue;
      var sign=p.color===W?1:-1;
      // Open file
      if(wF[c]===0&&bF[c]===0)s+=sign*20;
      // Semi-open
      else if((p.color===W&&wF[c]===0)||(p.color===B&&bF[c]===0))s+=sign*12;
      // Rook on 7th rank (trapping king on 8th)
      if((p.color===W&&r===1)||(p.color===B&&r===6))s+=sign*25;
    }
    return s;
  }

  function orderMoves(b,moves){
    var scored=[];
    for(var i=0;i<moves.length;i++){
      var m=moves[i];
      var s=0;
      var target=b[m.tr][m.tc];
      // MVV-LVA: Most Valuable Victim - Least Valuable Attacker
      if(target)s+=10*(PIECE_VAL[target.type]||0)-(PIECE_VAL[b[m.fr][m.fc].type]||0);
      if(m.promo)s+=880;
      if(m.castle)s+=60;
      // Bonus for moves toward center
      var centerDist=Math.abs(m.tr-3.5)+Math.abs(m.tc-3.5);
      s-=centerDist*2;
      // Penalty for moving king in middlegame (unless castling)
      if(b[m.fr][m.fc].type===KING&&!m.castle)s-=30;
      scored.push({m:m,s:s});
    }
    scored.sort(function(a2,b2){return b2.s-a2.s;});
    var out=[];for(var k=0;k<scored.length;k++)out.push(scored[k].m);
    return out;
  }

  // Quiescence search — extends captures/promotions to avoid horizon effect
  function quiesce(b,alpha,beta,isMax,cas,ep,qdepth){
    var standPat=evaluate(b);
    if(qdepth<=0)return standPat;
    if(isMax){
      if(standPat>=beta)return beta;
      if(standPat>alpha)alpha=standPat;
    }else{
      if(standPat<=alpha)return alpha;
      if(standPat<beta)beta=standPat;
    }
    var col=isMax?W:B;
    var moves=getLegalMoves(b,col,cas,ep);
    var captures=[];
    for(var i=0;i<moves.length;i++){
      if(b[moves[i].tr][moves[i].tc]||moves[i].ep||moves[i].promo)captures.push(moves[i]);
    }
    if(!captures.length)return isMax?alpha:beta;
    captures=orderMoves(b,captures);
    for(var j=0;j<captures.length;j++){
      var nb=cloneBoard(b);
      var ncas={wK:cas.wK,wQ:cas.wQ,bK:cas.bK,bQ:cas.bQ};
      var piece=nb[captures[j].fr][captures[j].fc];
      applyMove(nb,captures[j],ncas,ep);
      _updateCas(captures[j],ncas);
      var nep=null;
      if(piece.type===PAWN&&Math.abs(captures[j].tr-captures[j].fr)===2)
        nep=[(captures[j].fr+captures[j].tr)/2,captures[j].fc];
      var val=quiesce(nb,alpha,beta,!isMax,ncas,nep,qdepth-1);
      if(isMax){
        if(val>alpha)alpha=val;
        if(alpha>=beta)return beta;
      }else{
        if(val<beta)beta=val;
        if(alpha>=beta)return alpha;
      }
    }
    return isMax?alpha:beta;
  }

  function minimax(b,depth,alpha,beta,isMax,cas,ep){
    if(depth===0)return quiesce(b,alpha,beta,isMax,cas,ep,4);
    var col=isMax?W:B;
    var moves=getLegalMoves(b,col,cas,ep);
    if(!moves.length){
      if(inCheck(b,col))return isMax?-99999+(4-depth):99999-(4-depth);
      return 0;
    }
    moves=orderMoves(b,moves);
    var best,i;
    if(isMax){
      best=-100000;
      for(i=0;i<moves.length;i++){
        var nb=cloneBoard(b);var ncas={wK:cas.wK,wQ:cas.wQ,bK:cas.bK,bQ:cas.bQ};
        var piece=nb[moves[i].fr][moves[i].fc];
        applyMove(nb,moves[i],ncas,ep);_updateCas(moves[i],ncas);
        var nep=null;
        if(piece.type===PAWN&&Math.abs(moves[i].tr-moves[i].fr)===2)nep=[(moves[i].fr+moves[i].tr)/2,moves[i].fc];
        var val=minimax(nb,depth-1,alpha,beta,false,ncas,nep);
        if(val>best)best=val;
        if(best>alpha)alpha=best;
        if(beta<=alpha)break;
      }
    }else{
      best=100000;
      for(i=0;i<moves.length;i++){
        var nb2=cloneBoard(b);var ncas2={wK:cas.wK,wQ:cas.wQ,bK:cas.bK,bQ:cas.bQ};
        var piece2=nb2[moves[i].fr][moves[i].fc];
        applyMove(nb2,moves[i],ncas2,ep);_updateCas(moves[i],ncas2);
        var nep2=null;
        if(piece2.type===PAWN&&Math.abs(moves[i].tr-moves[i].fr)===2)nep2=[(moves[i].fr+moves[i].tr)/2,moves[i].fc];
        var val2=minimax(nb2,depth-1,alpha,beta,true,ncas2,nep2);
        if(val2<best)best=val2;
        if(best<beta)beta=best;
        if(beta<=alpha)break;
      }
    }
    return best;
  }

  function aiMove(){
    if(gameOver||turn!==B)return;
    // Opening book lookup
    var bookKey=moveLog.join(' ');
    if(_chBook[bookKey]){
      var bm=_chBook[bookKey];
      // Verify book move is legal
      var legal=getLegalMoves(board,B,castling,epSquare);
      for(var bi=0;bi<legal.length;bi++){
        if(legal[bi].fr===bm.fr&&legal[bi].fc===bm.fc&&legal[bi].tr===bm.tr&&legal[bi].tc===bm.tc){
          makeMove(legal[bi]);checkGameState();render();return;
        }
      }
    }
    var moves=getLegalMoves(board,B,castling,epSquare);
    if(!moves.length)return;
    moves=orderMoves(board,moves);
    var bestMove=moves[0];
    var bestVal=100000;
    // Iterative deepening with time limit (1.5s for mobile safety)
    var t0=Date.now();
    var maxTime=1500;
    var pieceCount=0;
    for(var r=0;r<8;r++)for(var c=0;c<8;c++)if(board[r][c])pieceCount++;
    var _chDepMap={1:2,2:3,3:4,4:5};
    var _chDep=_chDepMap[parseInt((document.getElementById('CHd')||{}).value)]||3;
    var maxDepth=_chDep+(pieceCount<14?1:0);
    for(var depth=1;depth<=maxDepth;depth++){
      var depthBest=moves[0];
      var depthVal=100000;
      var timedOut=false;
      for(var i=0;i<moves.length;i++){
        if(Date.now()-t0>maxTime){timedOut=true;break;}
        var nb=cloneBoard(board);
        var ncas={wK:castling.wK,wQ:castling.wQ,bK:castling.bK,bQ:castling.bQ};
        var piece=nb[moves[i].fr][moves[i].fc];
        applyMove(nb,moves[i],ncas,epSquare);_updateCas(moves[i],ncas);
        var nep=null;
        if(piece.type===PAWN&&Math.abs(moves[i].tr-moves[i].fr)===2)nep=[(moves[i].fr+moves[i].tr)/2,moves[i].fc];
        var val=minimax(nb,depth-1,-100000,100000,true,ncas,nep);
        if(val<depthVal){depthVal=val;depthBest=moves[i];}
      }
      if(!timedOut){
        bestMove=depthBest;bestVal=depthVal;
      }
      if(Date.now()-t0>maxTime)break;
    }
    makeMove(bestMove);
    checkGameState();
    render();
  }

  function checkGameState(){
    var moves=getLegalMoves(board,turn,castling,epSquare);
    if(!moves.length){
      gameOver=true;
      if(inCheck(board,turn)){
        if(turn===W){sm('Checkmate \u2014 AI wins!');_sr('chess',{w:false,s:moveCount});}
        else{sm('Checkmate \u2014 You win!');_e('game_win');_playWin();_sr('chess',{w:true,s:moveCount});}
      }else{
        sm('Stalemate \u2014 Draw!');_sr('chess',{w:false,s:moveCount});
      }
    }else if(halfmove>=100){
      gameOver=true;sm('Draw \u2014 50-move rule');_sr('chess',{w:false,s:moveCount});
    }else if(insufficientMaterial(board)){
      gameOver=true;sm('Draw \u2014 Insufficient material');_sr('chess',{w:false,s:moveCount});
    }else{
      // Threefold repetition
      var pk=posKey(board,turn,castling,epSquare);
      if(posHistory[pk]&&posHistory[pk]>=3){
        gameOver=true;sm('Draw \u2014 Threefold repetition');_sr('chess',{w:false,s:moveCount});
      }else if(inCheck(board,turn)){
        sm(turn===W?'Check!':'AI is in check');
      }else{
        sm(turn===W?'Your move':'AI thinking...');
      }
    }
  }

  function getPieceSVG(piece){
    if(piece.color===W)return _skinChess.playerPieces[piece.type]||'';
    return _skinChess.aiPieces[piece.type]||'';
  }

  function render(){
    var sk=_skinChess;
    var kingPos=findKing(board,turn);
    var isInCheck=inCheck(board,turn);
    var legal=[];
    if(selSq){
      var allLegal=getLegalMoves(board,W,castling,epSquare);
      for(var i=0;i<allLegal.length;i++){
        if(allLegal[i].fr===selSq[0]&&allLegal[i].fc===selSq[1])legal.push(allLegal[i]);
      }
    }
    // Build captured rows
    var capBHtml='<div class="ch-cap-row">';
    for(var ci=0;ci<capturedW.length;ci++)capBHtml+=_skinChess.aiPieces[capturedW[ci]]||'';
    capBHtml+='</div>';
    var capWHtml='<div class="ch-cap-row">';
    for(var cj=0;cj<capturedB.length;cj++)capWHtml+=_skinChess.playerPieces[capturedB[cj]]||'';
    capWHtml+='</div>';
    // Board
    var bHtml='<div class="ch-wrap"><img class="ch-bg" src="'+_chArt+'chess-board.png"><div class="chb">';
    for(var r=0;r<8;r++)for(var c=0;c<8;c++){
      var isDark=(r+c)%2===1;
      var bg=isDark?'rgba(0,0,0,.12)':'rgba(255,255,255,.08)';
      var cls='chs';
      if(selSq&&selSq[0]===r&&selSq[1]===c)cls+=' ch-sel';
      if(lastMove&&((lastMove.fr===r&&lastMove.fc===c)||(lastMove.tr===r&&lastMove.tc===c)))cls+=' ch-last';
      // Placed piece animation on destination
      if(lastMove&&lastMove.tr===r&&lastMove.tc===c)cls+=' ch-placed';
      // Check highlight on king
      if(isInCheck&&kingPos&&kingPos[0]===r&&kingPos[1]===c)cls+=' ch-check';
      // Legal move indicator
      var isLegalTarget=false;
      var isCapture=false;
      for(var li=0;li<legal.length;li++){if(legal[li].tr===r&&legal[li].tc===c){isLegalTarget=true;if(board[r][c]||legal[li].ep)isCapture=true;break;}}
      if(isLegalTarget&&isCapture)cls+=' ch-cap';
      else if(isLegalTarget)cls+=' ch-move';
      var piece=board[r][c];
      var content=piece?getPieceSVG(piece):'';
      bHtml+='<div class="'+cls+'" style="background:'+bg+'" onclick="_CHClick('+r+','+c+')">'+content+'</div>';
    }
    bHtml+='</div></div>';
    var statusText='';
    var gm=document.getElementById('_gm');
    if(gm)statusText=gm.textContent;
    var mvHtml='<div class="ch-status">Move '+moveCount+'</div>';
    var _scrollY=window.scrollY;
    boardEl.innerHTML=capBHtml+bHtml+capWHtml+mvHtml;
    window.scrollTo(0,_scrollY);
  }

  var _chPendingPromo=null;
  function _chDoMove(m){
    var wasCapture=!!board[m.tr][m.tc]||m.ep;
    var wasCastle=!!m.castle;
    selSq=null;_chPendingPromo=null;
    makeMove(m);
    var isCheck=inCheck(board,turn);
    checkGameState();
    if(wasCapture)_play('dig');
    else if(wasCastle)_play('click');
    else _play('tap');
    if(isCheck)setTimeout(function(){_play('lose')},200);
    render();
    if(!gameOver&&turn===B)setTimeout(function(){sm('AI thinking...');render();setTimeout(function(){
      aiMove();
      var aiCheck=inCheck(board,W);
      if(board._lastCap)_play('dig');else _play('tap');
      if(aiCheck)setTimeout(function(){_play('lose')},200);
    },50);},350);
  }
  window._CHPromo=function(type){
    if(!_chPendingPromo)return;
    _chPendingPromo.promo=type;
    _chDoMove(_chPendingPromo);
  };
  window._CHClick=function(r,c){
    if(gameOver||turn!==W||_chPendingPromo)return;
    var piece=board[r][c];
    if(selSq){
      var allLegal=getLegalMoves(board,W,castling,epSquare);
      for(var i=0;i<allLegal.length;i++){
        var m=allLegal[i];
        if(m.fr===selSq[0]&&m.fc===selSq[1]&&m.tr===r&&m.tc===c){
          if(m.promo){
            _chPendingPromo=m;_play('tap');
            var promoHtml='<div class="ch-promo">';
            var pts=[QUEEN,ROOK,BISHOP,KNIGHT];
            for(var pi=0;pi<pts.length;pi++)promoHtml+='<img src="'+_chArt+'p-'+{Q:'queen',R:'rook',B:'bishop',N:'knight'}[pts[pi]]+'-green.png" onclick="_CHPromo(\''+pts[pi]+'\')">';
            promoHtml+='</div>';
            var wrap=document.querySelector('.ch-wrap');
            if(wrap){var pd=document.createElement('div');pd.innerHTML=promoHtml;wrap.appendChild(pd.firstChild)}
            return;
          }
          _chDoMove(m);return;
        }
      }
    }
    if(piece&&piece.color===W){_play('click');selSq=[r,c];}
    else{selSq=null;}
    render();
  };

  window._CHNew=function(){
    initBoard();
    sm('Your move');
    render();
  };

  window._CHUndo=function(){
    if(gameOver||history.length<2)return;
    // Undo AI move + player move
    undoMove();undoMove();
    gameOver=false;
    selSq=null;
    checkGameState();
    if(!gameOver)sm('Your move');
    render();
  };

  // ── Init ──
  var boardEl;
  ms(a,'Move:<strong id="CHm">0</strong>');
  mm(a,'Your move');
  boardEl=document.createElement('div');boardEl.id='CHboard';
  boardEl.style.cssText='padding:4px 0';a.appendChild(boardEl);
  mc(a).innerHTML='<select class="gsl" id="CHd" style="max-width:130px" onchange="var v=this.value;_setDiff(v===\'1\'?\'easy\':v===\'2\'?\'medium\':v===\'3\'?\'hard\':\'expert\')"><option value="1">Seedling</option><option value="2" selected>Sapling</option><option value="3">Old Growth</option><option value="4">Ancient</option></select><button class="gb-new" onclick="_CHNew()"><img src="assets/games/new-game-btn.png" alt="New Game"></button><button class="gb" onclick="_CHUndo()">↩ Undo</button>';
  _setDiff('medium');
  initBoard();render();
}

// ═══ CONNECT FLEUR ═══
function G4(a){var ROWS=6,COLS=7,bd=[],turn=1,over=false,mv=0;
  var IMG_P='assets/games/c4/zinnia.png',IMG_A='assets/games/c4/calendula.png';
  ms(a,'Moves: <strong id="C4m">0</strong>');mm(a);
  // Pure CSS board — no image overlay alignment needed
  var gd=document.createElement('div');gd.id='C4g';
  gd.style.cssText='display:grid;grid-template-columns:repeat(7,1fr);grid-template-rows:repeat(6,1fr);gap:clamp(3px,1vw,6px);width:clamp(280px,88vw,420px);margin:0 auto;padding:clamp(6px,2vw,10px);background:linear-gradient(180deg,rgba(48,36,20,.95),rgba(32,24,14,.98));border-radius:clamp(8px,2.5vw,14px);border:2px solid rgba(80,60,30,.4);box-shadow:0 4px 20px rgba(0,0,0,.5),inset 0 1px 0 rgba(120,90,40,.15)';
  a.appendChild(gd);
  var obDiv=document.createElement('div');obDiv.id='C4ob';obDiv.style.cssText='text-align:center;min-height:40px;padding:4px 0';a.appendChild(obDiv);
  mc(a).innerHTML='<select class="gsl" id="C4d"><option value="1">Seedling</option><option value="2" selected>Sapling</option><option value="3">Old Growth</option></select><button class="gb-new" onclick="_C4N()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';
  function init(){bd=[];for(var i=0;i<ROWS*COLS;i++)bd.push(0);turn=1;over=false;mv=0;var _cm=document.getElementById('C4m');if(_cm)_cm.textContent='0'}
  function drop(col){for(var r=ROWS-1;r>=0;r--){if(bd[r*COLS+col]===0){bd[r*COLS+col]=turn;return r;}}}
  function check(p){
    for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
      if(c+3<COLS&&bd[r*COLS+c]===p&&bd[r*COLS+c+1]===p&&bd[r*COLS+c+2]===p&&bd[r*COLS+c+3]===p)return true;
      if(r+3<ROWS&&bd[r*COLS+c]===p&&bd[(r+1)*COLS+c]===p&&bd[(r+2)*COLS+c]===p&&bd[(r+3)*COLS+c]===p)return true;
      if(r+3<ROWS&&c+3<COLS&&bd[r*COLS+c]===p&&bd[(r+1)*COLS+c+1]===p&&bd[(r+2)*COLS+c+2]===p&&bd[(r+3)*COLS+c+3]===p)return true;
      if(r+3<ROWS&&c-3>=0&&bd[r*COLS+c]===p&&bd[(r+1)*COLS+c-1]===p&&bd[(r+2)*COLS+c-2]===p&&bd[(r+3)*COLS+c-3]===p)return true;
    }return false}
  function isFull(){for(var c=0;c<COLS;c++)if(bd[c]===0)return false;return true}
  // AI — minimax with alpha-beta
  function score(b){
    function sc4(r,c,dr,dc){var ct=[0,0,0];for(var i=0;i<4;i++){var nr=r+dr*i,nc=c+dc*i;if(nr<0||nr>=ROWS||nc<0||nc>=COLS)return 0;ct[b[nr*COLS+nc]]++;}
      if(ct[2]===4)return 1000;if(ct[1]===4)return -1000;if(ct[2]===3&&ct[0]===1)return 50;if(ct[1]===3&&ct[0]===1)return -50;if(ct[2]===2&&ct[0]===2)return 5;if(ct[1]===2&&ct[0]===2)return -5;return 0}
    var s=0;for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){s+=sc4(r,c,0,1)+sc4(r,c,1,0)+sc4(r,c,1,1)+sc4(r,c,1,-1)}
    for(var c=0;c<COLS;c++){var cc=Math.abs(c-3);s-=cc;}return s}
  function minimax(b,depth,alpha,beta,isMax){
    if(check(2))return {s:10000+depth};if(check(1))return {s:-10000-depth};if(isFull())return {s:0};if(depth===0)return {s:score(b)};
    var best={s:isMax?-Infinity:Infinity,c:-1};var order=[3,2,4,1,5,0,6];
    for(var oi=0;oi<order.length;oi++){var c=order[oi];if(b[c]!==0)continue;
      var r=-1;for(var rr=ROWS-1;rr>=0;rr--){if(b[rr*COLS+c]===0){r=rr;break;}}if(r<0)continue;
      b[r*COLS+c]=isMax?2:1;var val=minimax(b,depth-1,alpha,beta,!isMax);b[r*COLS+c]=0;
      if(isMax){if(val.s>best.s){best={s:val.s,c:c}}alpha=Math.max(alpha,val.s)}
      else{if(val.s<best.s){best={s:val.s,c:c}}beta=Math.min(beta,val.s)}
      if(beta<=alpha)break}return best}
  var _c4Enc=['Nice try! Go again 🌱','Almost had it! One more? 🌿','The garden grows through practice 🌻','Every loss plants a seed of wisdom 🍃','You learn more from losses \u2014 rematch? 🌸'];
  var _c4Win=['Brilliant! You bloomed! 🌸','Your garden flourishes! 🌺','Masterful placement! 🌻','The grove is proud! 🌿','Connect Fleur champion! 🏆'];
  function aiMove(){
    var depMap={1:3,2:5,3:7};var dep=depMap[parseInt((document.getElementById('C4d')||{}).value)]||5;
    var res=minimax(bd.slice(),dep,-Infinity,Infinity,true);
    if(res.c<0){for(var c=0;c<COLS;c++)if(bd[c]===0){res.c=c;break;}}
    drop(res.c);_play('drop');mv++;document.getElementById('C4m').textContent=mv;
    if(check(2)){over=true;_e('game_loss');_play('lose');sm(_c4Enc[Math.floor(Math.random()*_c4Enc.length)]);_sr('c4',{w:false,s:mv})}
    else if(isFull()){over=true;sm('A draw! Well matched \u2014 try again? 🌿');_sr('c4',{w:false,s:mv})}
    else{turn=1;sm('Your turn')}rn()}
  function rn(){var _scrollY=window.scrollY;
    var cells=gd.children;
    if(cells.length!==ROWS*COLS){
      gd.innerHTML='';
      for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
        var d=document.createElement('div');
        d.style.cssText='aspect-ratio:1;border-radius:50%;cursor:pointer;overflow:hidden;-webkit-tap-highlight-color:transparent;transition:background .2s ease,box-shadow .2s ease;background:rgba(10,8,4,.7);box-shadow:inset 0 2px 6px rgba(0,0,0,.6)';
        d.setAttribute('data-c',c);
        d.onclick=function(){if(over||turn!==1)return;var col=parseInt(this.getAttribute('data-c'));if(bd[col]!==0)return;
          _play('tap');drop(col);mv++;var _cm=document.getElementById('C4m');if(_cm)_cm.textContent=mv;
          if(check(1)){over=true;_e('game_win');_playWin();sm(_c4Win[Math.floor(Math.random()*_c4Win.length)]);rn();_sr('c4',{w:true,s:mv});return}
          if(isFull()){over=true;sm('A draw! Well matched \u2014 try again? 🌿');rn();_sr('c4',{w:false,s:mv});return}
          turn=2;sm('AI thinking...');rn();setTimeout(aiMove,300)};
        gd.appendChild(d)}
      cells=gd.children;
    }
    for(var i=0;i<ROWS*COLS;i++){
      var d=cells[i],v=bd[i];
      if(v===1){d.style.background='url('+IMG_P+') center/cover';d.style.boxShadow='inset 0 0 4px rgba(0,0,0,.3),0 2px 6px rgba(0,0,0,.25)';}
      else if(v===2){d.style.background='url('+IMG_A+') center/cover';d.style.boxShadow='inset 0 0 4px rgba(0,0,0,.3),0 2px 6px rgba(0,0,0,.25)';}
      else{d.style.background='rgba(10,8,4,.7)';d.style.boxShadow='inset 0 2px 6px rgba(0,0,0,.6)';}
    }
    var ob=document.getElementById('C4ob');
    if(ob){
      if(!over){ob.innerHTML='';}
      else if(check(1)){
        // Player won — the global _showWinCelebration handles this
        ob.innerHTML='';
      }else{
        // Loss or draw — show result + try again
        var isLoss=check(2);
        var msg=isLoss?_c4Enc[Math.floor(Math.random()*_c4Enc.length)]:'A draw! Well matched.';
        ob.innerHTML='<div style="text-align:center;padding:clamp(8px,3vw,16px);background:rgba(26,31,23,.85);border:1px solid rgba(74,124,53,.15);border-radius:12px;margin:8px auto;max-width:320px">'
          +'<div style="font-family:Bebas Neue,sans-serif;font-size:clamp(.8rem,2.5vw,1.1rem);color:'+(isLoss?'var(--cream)':'var(--gold)')+';letter-spacing:.08em;margin-bottom:6px">'+(isLoss?'GAME OVER':'DRAW')+'</div>'
          +'<div style="font-size:clamp(.45rem,1.3vw,.6rem);color:var(--muted);margin-bottom:10px">'+msg+'</div>'
          +'<button class="gb" onclick="_C4N()" style="font-size:clamp(.6rem,1.8vw,.8rem);padding:8px 20px;width:100%;min-height:44px">TRY AGAIN</button>'
          +'</div>';
      }
    }
    window.scrollTo(0,_scrollY)}
  window._C4N=function(){init();gd.innerHTML='';sm('Your turn');rn()};_C4N();}

// ═══ SEED SONG — Step Sequencer ═══
function GSG(a){
  // Load Grove Studio in fullscreen iframe
  var fr=document.createElement('iframe');
  fr.src='/studio.html';
  fr.style.cssText='width:100%;height:calc(100vh - 40px);border:none;border-radius:8px;background:#060610';
  fr.allow='autoplay';
  a.appendChild(fr);
}

// ═══ SHARED CARD UTILITIES ═══
// Two color families for solitaire alternating:
// GREEN: 🍄 Mushroom (sage), 🐦 Bird (teal)
// GOLD:  🌸 Flower (gold), 🐝 Bee (amber)
var _SUIT_SYM=['🍄','🌸','🐝','🐦'];
var _SUIT_CLR=['#6dbf4a','#daa520','#e8c94a','#48c9a4'];
var _SUIT_GRP=['green','gold','gold','green']; // alternating groups
var _RANK_SYM=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
var _SUIT_NAME=['shroom','flower','bee','bird'];
var _CD_BASE='assets/games/cards/';
var _CD_BACK=_CD_BASE+'playing-card-backs.png';

// Preload all card images (tiny files now — ~300KB total)
(function(){
  var files=['playing-card-backs'];
  for(var s=0;s<4;s++){
    var n=_SUIT_NAME[s];
    files.push(n,n+'-ace',n+'-jack',n+'-queen',n+'-king');
  }
  for(var i=0;i<files.length;i++){
    var img=new Image();
    img.src=_CD_BASE+files[i]+'.png';
  }
})();

function _cdArt(s,r){
  var sn=_SUIT_NAME[s];
  if(r===0)return _CD_BASE+sn+'-ace.png';
  if(r===10)return _CD_BASE+sn+'-jack.png';
  if(r===11)return _CD_BASE+sn+'-queen.png';
  if(r===12)return _CD_BASE+sn+'-king.png';
  return _CD_BASE+sn+'-num.png';
}

function _cdMk(){var d=[];for(var s=0;s<4;s++)for(var r=0;r<13;r++)d.push({s:s,r:r,up:false});return d}
function _cdSh(d){return sh(d)}
function _cdRnk(r){return _RANK_SYM[r]}
function _cdSuit(s){return _SUIT_SYM[s]}
function _cdIsRed(s){return s===1||s===2} // "gold" suits = Flower + Bee

function _cdBackStyle(el){
  el.style.backgroundImage="url('"+_CD_BACK+"')";
}

function _cdEl(card){
  var d=document.createElement('div');
  d.className='gc';
  if(card.up){
    d.className+=' gc-up';
    if(_cdIsRed(card.s))d.className+=' gc-red';
    var clr=_SUIT_CLR[card.s];
    var rnk=_cdRnk(card.r);
    var pip=_CD_BASE+_SUIT_NAME[card.s]+'.png';
    var art=_cdArt(card.s,card.r);
    d.style.backgroundImage="url('"+art+"')";
    d.innerHTML='<div style="position:absolute;top:3px;left:4px;line-height:1;z-index:2;pointer-events:none">'
      +'<div style="color:'+clr+';font-size:clamp(.7rem,2.2vw,1rem);font-weight:700;text-shadow:0 1px 3px #000,0 0 8px #000">'+rnk+'</div>'
      +'</div>'
      +'<img src="'+pip+'" style="position:absolute;top:3px;right:4px;width:clamp(10px,3vw,18px);height:clamp(10px,3vw,18px);z-index:2;pointer-events:none;filter:drop-shadow(0 1px 3px #000)" alt="">';
  }else{
    d.className+=' gc-dn';
    _cdBackStyle(d);
  }
  d.setAttribute('data-s',card.s);
  d.setAttribute('data-r',card.r);
  return d;
}

// ═══ GOLF SOLITAIRE ═══
function GGO(a){
  var cols=[],stock=[],waste=[],deck,gameOver=false,score=35;
  ms(a,'Left: <strong id="GFsc">35</strong>');mm(a);
  var gd=document.createElement('div');gd.id='GFgd';a.appendChild(gd);
  mc(a).innerHTML='<button class="gb-new" onclick="_GFN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  function init(){
    deck=_cdSh(_cdMk());
    cols=[];stock=[];waste=[];gameOver=false;score=35;
    for(var c=0;c<7;c++){
      cols[c]=[];
      for(var i=0;i<5;i++){
        var card=deck.pop();card.up=true;
        cols[c].push(card);
      }
    }
    var first=deck.pop();first.up=true;
    waste=[first];
    stock=deck.slice();
    for(var si=0;si<stock.length;si++)stock[si].up=false;
    rn();
  }

  function countLeft(){
    var n=0;
    for(var c=0;c<7;c++)n+=cols[c].length;
    return n;
  }

  function canPlay(card){
    if(waste.length===0)return false;
    var top=waste[waste.length-1];
    var diff=Math.abs(card.r-top.r);
    return diff===1;
  }

  function checkEnd(){
    if(countLeft()===0){
      gameOver=true;score=0;
      mm_up('🏆 Cleared!');
      _play('win');_playWin();
      _e('game_win');_sr('golf',{w:true,s:35});
      return;
    }
    if(stock.length>0)return;
    for(var c=0;c<7;c++){
      if(cols[c].length>0&&canPlay(cols[c][cols[c].length-1]))return;
    }
    gameOver=true;
    var left=countLeft();score=left;
    mm_up(left+' left — no moves');
    _e('game_loss');_sr('golf',{w:false,s:35-left});
  }

  function mm_up(txt){
    var el=document.getElementById('_gm');
    if(el)el.textContent=txt;
  }

  function tapCol(ci){
    if(gameOver)return;
    var col=cols[ci];
    if(col.length===0)return;
    var card=col[col.length-1];
    if(!canPlay(card)){sm('Need ±1 rank');return}
    col.pop();
    waste.push(card);
    _play('tap');
    _e('progress');
    score=countLeft();
    rn();
    checkEnd();
  }

  function tapStock(){
    if(gameOver)return;
    if(stock.length===0){sm('Stock empty');return}
    var card=stock.pop();card.up=true;
    waste.push(card);
    _play('tap');
    rn();
    checkEnd();
  }

  function rn(){
    gd.innerHTML='';
    var sc=document.getElementById('GFsc');
    if(sc)sc.textContent=countLeft();

    // Top row: stock, waste, score
    var gfW='clamp(46px,12.5vw,80px)',gfH='clamp(64px,17.5vw,112px)',gfF='clamp(.6rem,1.8vw,.85rem)';
    var topRow=document.createElement('div');
    topRow.style.cssText='display:flex;gap:clamp(2px,.8vw,4px);justify-content:center;padding:clamp(2px,1vw,4px) 0;width:clamp(320px,100vw,680px);margin:0 auto;align-items:center';

    // Stock
    var stEl=document.createElement('div');
    if(stock.length>0){
      stEl.className='gc gc-dn';
      _cdBackStyle(stEl);
      stEl.innerHTML='<span style="color:rgba(200,168,78,.6);font-size:clamp(.55rem,1.8vw,.75rem);font-weight:700;text-shadow:0 1px 4px rgba(0,0,0,.9)">'+stock.length+'</span>';
      stEl.style.cursor='pointer';
      stEl.onclick=function(){tapStock()};
    }else{
      stEl.className='gc gc-empty';
      stEl.innerHTML='<span style="color:var(--muted);font-size:clamp(.5rem,1.5vw,.7rem)">empty</span>';
    }
    stEl.style.width=gfW;stEl.style.height=gfH;
    topRow.appendChild(stEl);

    // Waste
    var wEl=document.createElement('div');
    if(waste.length>0){
      var wc=waste[waste.length-1];
      wEl=_cdEl(wc);
      wEl.style.boxShadow='0 0 8px rgba(200,168,78,.3)';
    }else{
      wEl.className='gc gc-empty';
    }
    wEl.style.width=gfW;wEl.style.height=gfH;
    topRow.appendChild(wEl);

    // Spacer
    var sp=document.createElement('div');sp.style.cssText='flex:1';
    topRow.appendChild(sp);

    // Score label
    var lbl=document.createElement('div');
    lbl.style.cssText='color:var(--gold);font-family:DM Mono,monospace;font-size:clamp(.65rem,2vw,.85rem)';
    lbl.textContent=countLeft()+' left';
    topRow.appendChild(lbl);
    gd.appendChild(topRow);

    // Tableau
    var tabRow=document.createElement('div');
    tabRow.style.cssText='display:flex;gap:clamp(2px,.8vw,4px);justify-content:center;padding:clamp(2px,.8vw,3px) 0;width:clamp(320px,100vw,680px);margin:0 auto';

    for(var c=0;c<7;c++){
      var colDiv=document.createElement('div');
      colDiv.className='gc-stk';colDiv.style.minWidth=gfW;

      if(cols[c].length===0){
        var em=document.createElement('div');
        em.className='gc gc-empty';em.style.width=gfW;em.style.height=gfH;
        colDiv.appendChild(em);
      }else{
        for(var i=0;i<cols[c].length;i++){
          var cd=_cdEl(cols[c][i]);
          cd.style.width=gfW;cd.style.height=gfH;cd.style.fontSize=gfF;
          if(i===cols[c].length-1){
            cd.style.cursor='pointer';
            (function(ci){cd.onclick=function(){tapCol(ci)}})(c);
          }
          colDiv.appendChild(cd);
        }
      }
      tabRow.appendChild(colDiv);
    }
    gd.appendChild(tabRow);
  }

  window._GFN=function(){init()};
  init();
}

// ═══ KLONDIKE SOLITAIRE ═══
function GK(a){
  var tableau=[],stock=[],waste=[],fnd=[],sel=null,gameOver=false,moves=0,drawCount=1,lastTap=0,lastTapCard=null;
  // sel = {src:'tab'|'waste', col:N, idx:N} or null
  ms(a,'Moves: <strong id="KLmv">0</strong>');mm(a);
  var gd=document.createElement('div');gd.id='KLgd';a.appendChild(gd);
  mc(a).innerHTML='<select class="gsl" id="KLdraw" onchange="_KLDraw(this.value)"><option value="1" selected>Draw 1</option><option value="3">Draw 3</option></select> <button class="gb-new" onclick="_KLN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  function init(){
    var deck=_cdSh(_cdMk());
    tableau=[];stock=[];waste=[];sel=null;gameOver=false;moves=0;lastTap=0;lastTapCard=null;
    fnd=[[],[],[],[]];
    for(var c=0;c<7;c++){
      tableau[c]=[];
      for(var i=0;i<=c;i++){
        var card=deck.pop();
        card.up=(i===c);
        tableau[c].push(card);
      }
    }
    stock=deck.slice();
    for(var si=0;si<stock.length;si++)stock[si].up=false;
    var el=document.getElementById('KLmv');if(el)el.textContent='0';
    rn();
  }

  function mm_up(txt){
    var el=document.getElementById('_gm');
    if(el)el.textContent=txt;
  }

  function checkWin(){
    for(var f=0;f<4;f++)if(fnd[f].length<13)return false;
    return true;
  }

  function canPlaceOnFnd(card,fi){
    var pile=fnd[fi];
    if(pile.length===0)return card.r===0;
    var top=pile[pile.length-1];
    return top.s===card.s&&card.r===top.r+1;
  }

  function canPlaceOnTab(card,ci){
    var col=tableau[ci];
    if(col.length===0)return card.r===12;
    var top=col[col.length-1];
    if(!top.up)return false;
    var topRed=_cdIsRed(top.s);
    var cardRed=_cdIsRed(card.s);
    return topRed!==cardRed&&card.r===top.r-1;
  }

  function autoToFnd(card){
    for(var f=0;f<4;f++){
      if(canPlaceOnFnd(card,f))return f;
    }
    return -1;
  }

  function doMove(){
    moves++;
    var el=document.getElementById('KLmv');if(el)el.textContent=moves;
    _play('tap');
    _e('progress');
  }

  function tapStock(){
    sel=null;
    if(stock.length===0){
      if(waste.length===0)return;
      stock=waste.reverse();
      waste=[];
      for(var i=0;i<stock.length;i++)stock[i].up=false;
      rn();return;
    }
    var cnt=Math.min(drawCount,stock.length);
    for(var i=0;i<cnt;i++){
      var card=stock.pop();card.up=true;
      waste.push(card);
    }
    _play('tap');
    rn();
  }

  function tapWaste(){
    if(waste.length===0)return;
    var now=Date.now();
    var topCard=waste[waste.length-1];
    // Double-tap auto-foundation
    if(lastTapCard&&lastTapCard.s===topCard.s&&lastTapCard.r===topCard.r&&now-lastTap<400){
      var fi=autoToFnd(topCard);
      if(fi>=0){
        waste.pop();
        fnd[fi].push(topCard);
        sel=null;doMove();
        if(checkWin()){gameOver=true;mm_up('🏆 You win!');_play('win');_playWin();_e('game_win');_sr('klondike',{w:true,s:moves});}
        rn();lastTap=0;lastTapCard=null;return;
      }
    }
    lastTap=now;lastTapCard={s:topCard.s,r:topCard.r};
    if(sel&&sel.src==='waste'){sel=null;rn();return}
    sel={src:'waste',col:-1,idx:waste.length-1};
    rn();
  }

  function tapFnd(fi){
    if(!sel){return}
    var card=null;
    if(sel.src==='waste'){
      card=waste[waste.length-1];
      if(canPlaceOnFnd(card,fi)){
        waste.pop();fnd[fi].push(card);sel=null;doMove();
        if(checkWin()){gameOver=true;mm_up('🏆 You win!');_play('win');_playWin();_e('game_win');_sr('klondike',{w:true,s:moves});}
        rn();return;
      }
    }else if(sel.src==='tab'){
      var col=tableau[sel.col];
      if(sel.idx===col.length-1){
        card=col[col.length-1];
        if(canPlaceOnFnd(card,fi)){
          col.pop();fnd[fi].push(card);
          if(col.length>0&&!col[col.length-1].up)col[col.length-1].up=true;
          sel=null;doMove();
          if(checkWin()){gameOver=true;mm_up('🏆 You win!');_play('win');_playWin();_e('game_win');_sr('klondike',{w:true,s:moves});}
          rn();return;
        }
      }
    }
    sm('Can\'t place there');
  }

  function tapTab(ci,cardIdx){
    if(gameOver)return;
    var col=tableau[ci];

    // Tap on empty column
    if(col.length===0){
      if(!sel)return;
      // Move selected cards to empty column (only Kings)
      if(sel.src==='waste'){
        var wc=waste[waste.length-1];
        if(wc.r===12){waste.pop();col.push(wc);sel=null;doMove();rn();return;}
        sm('Only Kings on empty');sel=null;rn();return;
      }
      if(sel.src==='tab'){
        var srcCol=tableau[sel.col];
        var card=srcCol[sel.idx];
        if(card.r===12){
          var run=srcCol.splice(sel.idx);
          for(var ri=0;ri<run.length;ri++)col.push(run[ri]);
          if(srcCol.length>0&&!srcCol[srcCol.length-1].up)srcCol[srcCol.length-1].up=true;
          sel=null;doMove();rn();return;
        }
        sm('Only Kings on empty');sel=null;rn();return;
      }
      return;
    }

    var tappedCard=col[cardIdx];

    // Tap face-down card — flip it if it's the last
    if(!tappedCard.up){
      if(cardIdx===col.length-1){tappedCard.up=true;rn();}
      return;
    }

    var now=Date.now();
    // Double-tap auto-foundation (only for top card)
    if(cardIdx===col.length-1&&lastTapCard&&lastTapCard.s===tappedCard.s&&lastTapCard.r===tappedCard.r&&now-lastTap<400){
      var fi=autoToFnd(tappedCard);
      if(fi>=0){
        col.pop();fnd[fi].push(tappedCard);
        if(col.length>0&&!col[col.length-1].up)col[col.length-1].up=true;
        sel=null;doMove();
        if(checkWin()){gameOver=true;mm_up('🏆 You win!');_play('win');_playWin();_e('game_win');_sr('klondike',{w:true,s:moves});}
        rn();lastTap=0;lastTapCard=null;return;
      }
    }
    lastTap=now;lastTapCard={s:tappedCard.s,r:tappedCard.r};

    // If nothing selected, select this card (and everything below it)
    if(!sel){
      sel={src:'tab',col:ci,idx:cardIdx};
      rn();return;
    }

    // If tapping same selection, deselect
    if(sel.src==='tab'&&sel.col===ci&&sel.idx===cardIdx){
      sel=null;rn();return;
    }

    // Try to place selected cards on this column
    var srcCard=null;
    if(sel.src==='waste'){
      srcCard=waste[waste.length-1];
      if(canPlaceOnTab(srcCard,ci)){
        waste.pop();col.push(srcCard);sel=null;doMove();rn();return;
      }
    }else if(sel.src==='tab'){
      var srcCol=tableau[sel.col];
      srcCard=srcCol[sel.idx];
      if(canPlaceOnTab(srcCard,ci)){
        var run=srcCol.splice(sel.idx);
        for(var ri=0;ri<run.length;ri++)col.push(run[ri]);
        if(srcCol.length>0&&!srcCol[srcCol.length-1].up)srcCol[srcCol.length-1].up=true;
        sel=null;doMove();rn();return;
      }
    }
    // Invalid move — reselect to tapped card
    sel={src:'tab',col:ci,idx:cardIdx};
    rn();
  }

  function rn(){
    gd.innerHTML='';

    // Top row: stock, waste, spacer, 4 foundations
    var topRow=document.createElement('div');
    var klW='clamp(46px,12.5vw,80px)',klH='clamp(64px,17.5vw,112px)',klF='clamp(.6rem,1.8vw,.85rem)';
    topRow.style.cssText='display:flex;gap:clamp(2px,.8vw,4px);justify-content:center;padding:clamp(2px,1vw,4px) 0;width:clamp(320px,100vw,680px);margin:0 auto;align-items:flex-start;flex-wrap:nowrap';

    // Stock
    var stEl=document.createElement('div');
    if(stock.length>0){
      stEl.className='gc gc-dn';
      _cdBackStyle(stEl);
      stEl.innerHTML='<span style="color:rgba(200,168,78,.6);font-size:clamp(.55rem,1.8vw,.75rem);font-weight:700;text-shadow:0 1px 4px rgba(0,0,0,.9)">'+stock.length+'</span>';
      stEl.style.cursor='pointer';
    }else{
      stEl.className='gc gc-empty';
      if(waste.length>0)stEl.innerHTML='<span style="color:var(--muted);font-size:clamp(.6rem,1.8vw,.8rem)">↺</span>';
    }
    stEl.style.width=klW;stEl.style.height=klH;stEl.style.fontSize=klF;
    stEl.onclick=function(){tapStock()};
    topRow.appendChild(stEl);

    // Waste (show top card only for draw-1; top 3 fanned for draw-3)
    var wasteWrap=document.createElement('div');
    wasteWrap.style.cssText='position:relative;width:'+klW+';height:'+klH;
    if(waste.length>0){
      var showCount=drawCount===3?Math.min(3,waste.length):1;
      for(var wi=0;wi<showCount;wi++){
        var wIdx=waste.length-showCount+wi;
        var wc=waste[wIdx];
        var wEl=_cdEl(wc);
        wEl.style.width=klW;wEl.style.height=klH;wEl.style.fontSize=klF;
        wEl.style.position='absolute';
        wEl.style.left=(wi*8)+'px';wEl.style.top='0';
        if(wi===showCount-1){
          if(sel&&sel.src==='waste')wEl.className+=' gc-sel';
          wEl.style.cursor='pointer';
          wEl.onclick=function(){tapWaste()};
        }
        wasteWrap.appendChild(wEl);
      }
    }else{
      var emW=document.createElement('div');emW.className='gc gc-empty';
      emW.style.width=klW;emW.style.height=klH;
      wasteWrap.appendChild(emW);
    }
    topRow.appendChild(wasteWrap);

    // Spacer
    var sp=document.createElement('div');
    sp.style.cssText='width:clamp(4px,1.5vw,10px);flex-shrink:0';
    topRow.appendChild(sp);

    // 4 Foundations
    for(var f=0;f<4;f++){
      var fEl=document.createElement('div');
      if(fnd[f].length>0){
        var topC=fnd[f][fnd[f].length-1];
        fEl=_cdEl(topC);
        fEl.className+=' gc-fnd';
      }else{
        fEl.className='gc gc-fnd';
        fEl.style.backgroundImage="url('"+_CD_BASE+_SUIT_NAME[f]+".png')";
      }
      fEl.style.width=klW;fEl.style.height=klH;fEl.style.fontSize=klF;
      fEl.style.cursor='pointer';
      (function(fi){fEl.onclick=function(){tapFnd(fi)}})(f);
      topRow.appendChild(fEl);
    }
    gd.appendChild(topRow);

    // Tableau
    var tabRow=document.createElement('div');
    tabRow.style.cssText='display:flex;gap:clamp(2px,.8vw,4px);justify-content:center;padding:clamp(2px,.8vw,3px) 0;width:clamp(320px,100vw,680px);margin:0 auto;align-items:flex-start';

    for(var c=0;c<7;c++){
      var colDiv=document.createElement('div');
      colDiv.style.cssText='display:flex;flex-direction:column;min-width:'+klW+';align-items:center';

      if(tableau[c].length===0){
        var em=document.createElement('div');
        em.className='gc gc-empty';
        em.style.width=klW;em.style.height=klH;
        em.style.cursor='pointer';
        (function(ci){em.onclick=function(){tapTab(ci,0)}})(c);
        colDiv.appendChild(em);
      }else{
        var depth=tableau[c].length;
        for(var i=0;i<depth;i++){
          var card=tableau[c][i];
          var cdEl=_cdEl(card);
          cdEl.style.width=klW;cdEl.style.height=klH;cdEl.style.fontSize=klF;

          // Stacked cards: show peek only, last card full height
          if(i<depth-1){
            // Compress peek when stack is deep
            var peekUp=depth>10?'clamp(12px,3.5vw,16px)':depth>7?'clamp(14px,4vw,18px)':'clamp(16px,4.5vw,22px)';
            var peekDn=depth>10?'clamp(8px,2.5vw,12px)':depth>7?'clamp(10px,3vw,14px)':'clamp(12px,3.5vw,16px)';
            cdEl.style.height=card.up?peekUp:peekDn;
            cdEl.style.overflow='hidden';
            cdEl.style.alignItems='flex-start';
            cdEl.style.paddingTop='2px';
            cdEl.style.fontSize=klF;
          }
          // Selection highlight
          if(sel&&sel.src==='tab'&&sel.col===c&&i>=sel.idx&&card.up){
            cdEl.className+=' gc-sel';
          }
          if(card.up){
            cdEl.style.cursor='pointer';
            cdEl.style.position='relative';
            cdEl.style.zIndex=i;
            (function(ci,idx){cdEl.onclick=function(ev){ev.stopPropagation();tapTab(ci,idx)}})(c,i);
          }
          colDiv.appendChild(cdEl);
        }
      }
      tabRow.appendChild(colDiv);
    }
    gd.appendChild(tabRow);
  }

  window._KLN=function(){init()};
  window._KLDraw=function(v){drawCount=parseInt(v)||1;init()};
  init();
}

// ═══ SPIDER SOLITAIRE ═══
function GSP(a){
  var tab=[],stock=[],completed=0,sel=null,gameOver=false,moves=0,suits=1;
  ms(a,'Runs: <strong id="SPrn">0</strong>/8 · Moves: <strong id="SPmv">0</strong>');mm(a);
  var gd=document.createElement('div');gd.id='SPgd';a.appendChild(gd);
  mc(a).innerHTML='<div style="display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap;"><div style="position:relative;display:inline-block;" id="sp-suit-wrap"><button onclick="var m=document.getElementById(\'sp-suit-menu\');m.style.display=m.style.display===\'flex\'?\'none\':\'flex\'" style="width:clamp(56px,16vw,72px);height:clamp(72px,20vw,92px);border-radius:8px;border:2px solid rgba(200,168,75,0.3);cursor:pointer;background:url(\'assets/games/cards/playing-card-backs.png\') center/cover;box-shadow:0 3px 12px rgba(0,0,0,0.4);position:relative;overflow:hidden;"><span style="position:absolute;bottom:3px;left:0;right:0;font-family:Bebas Neue,sans-serif;font-size:clamp(0.5rem,1.5vw,0.65rem);color:var(--gold);text-shadow:0 1px 4px #000,0 0 8px #000;letter-spacing:0.08em;">SUITS</span></button><div id="sp-suit-menu" style="display:none;flex-direction:column;position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);background:rgba(18,24,16,0.95);border:1.5px solid rgba(200,168,75,0.25);border-radius:10px;padding:6px;gap:4px;z-index:200;box-shadow:0 4px 20px rgba(0,0,0,0.5);backdrop-filter:blur(8px);min-width:120px;"><button onclick="_SPS(1);document.getElementById(\'sp-suit-menu\').style.display=\'none\'" style="padding:10px 16px;border:none;border-radius:6px;background:rgba(74,124,53,0.15);color:var(--cream);font-family:Bebas Neue,sans-serif;font-size:0.75rem;cursor:pointer;text-align:left;min-height:44px;">🍄 1 Suit</button><button onclick="_SPS(2);document.getElementById(\'sp-suit-menu\').style.display=\'none\'" style="padding:10px 16px;border:none;border-radius:6px;background:rgba(74,124,53,0.15);color:var(--cream);font-family:Bebas Neue,sans-serif;font-size:0.75rem;cursor:pointer;text-align:left;min-height:44px;">🍄🌸 2 Suits</button><button onclick="_SPS(4);document.getElementById(\'sp-suit-menu\').style.display=\'none\'" style="padding:10px 16px;border:none;border-radius:6px;background:rgba(74,124,53,0.15);color:var(--cream);font-family:Bebas Neue,sans-serif;font-size:0.75rem;cursor:pointer;text-align:left;min-height:44px;">🍄🌸🐝🐦 4 Suits</button></div></div><button class="gb-new" onclick="_SPN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button></div>';

  function mkDeck(){
    var d=[];
    if(suits===1){for(var i=0;i<8;i++)for(var r=0;r<13;r++)d.push({s:0,r:r,up:false});}
    else if(suits===2){for(var i=0;i<4;i++)for(var s=0;s<2;s++)for(var r=0;r<13;r++)d.push({s:s,r:r,up:false});}
    else{for(var i=0;i<2;i++)for(var s=0;s<4;s++)for(var r=0;r<13;r++)d.push({s:s,r:r,up:false});}
    return _cdSh(d);
  }
  function init(){
    var deck=mkDeck();
    tab=[];stock=[];completed=0;sel=null;gameOver=false;moves=0;
    for(var c=0;c<10;c++){
      tab[c]=[];
      var cnt=c<4?6:5;
      for(var i=0;i<cnt;i++){var cd=deck.pop();cd.up=(i===cnt-1);tab[c].push(cd);}
    }
    stock=deck.slice();
    upd();rn();
  }
  function upd(){
    var el=document.getElementById('SPrn');if(el)el.textContent=completed;
    var el2=document.getElementById('SPmv');if(el2)el2.textContent=moves;
  }
  function mm_up(t){var el=document.getElementById('_gm');if(el)el.textContent=t;}
  function flipTops(){for(var c=0;c<10;c++){var col=tab[c];if(col.length>0&&!col[col.length-1].up)col[col.length-1].up=true;}}
  function checkRun(ci){
    var col=tab[ci];if(col.length<13)return false;
    var st=col.length-13;var s=col[st].s;
    for(var i=0;i<13;i++){if(col[st+i].r!==12-i||col[st+i].s!==s||!col[st+i].up)return false;}
    col.splice(st,13);completed++;_e('milestone');
    flipTops();
    if(completed>=8){gameOver=true;mm_up('🏆 All 8 runs!');_play('win');_playWin();_e('game_win');_sr('spider',{w:true,s:moves});}
    return true;
  }
  function getRunLen(ci,idx){
    var col=tab[ci];if(idx>=col.length||!col[idx].up)return 0;
    var len=1;
    for(var i=idx+1;i<col.length;i++){
      if(!col[i].up||col[i].s!==col[i-1].s||col[i].r!==col[i-1].r-1)break;
      len++;
    }
    return len;
  }
  function tapCol(ci,idx){
    if(gameOver)return;
    var col=tab[ci];
    if(sel){
      // Try to place
      if(ci===sel.col){sel=null;rn();return;}
      var cards=tab[sel.col].slice(sel.idx);
      var bot=cards[0];
      if(col.length===0||bot.r===col[col.length-1].r-1){
        tab[sel.col].splice(sel.idx);
        for(var i=0;i<cards.length;i++)col.push(cards[i]);
        moves++;flipTops();
        while(checkRun(ci)){}
        sel=null;upd();rn();
      }else{sel=null;rn();}
    }else{
      if(idx===undefined)idx=col.length-1;
      if(idx<0||idx>=col.length||!col[idx].up)return;
      var runLen=getRunLen(ci,idx);
      if(idx+runLen!==col.length){sm('Same suit run only');return;}
      sel={col:ci,idx:idx};rn();
    }
  }
  function dealStock(){
    if(gameOver||stock.length===0)return;
    for(var c=0;c<10;c++){if(tab[c].length===0){sm('Fill empty columns first');return;}}
    for(var c=0;c<10;c++){
      if(stock.length===0)break;
      var cd=stock.pop();cd.up=true;tab[c].push(cd);
    }
    moves++;_play('tap');
    for(var c=0;c<10;c++)while(checkRun(c)){}
    flipTops();upd();rn();
  }
  function rn(){
    gd.innerHTML='';
    var topRow=document.createElement('div');
    topRow.style.cssText='display:flex;gap:clamp(4px,1.2vw,6px);justify-content:center;padding:clamp(2px,1vw,4px) 0;width:clamp(320px,100vw,700px);margin:0 auto;align-items:center';
    var stEl=document.createElement('div');
    if(stock.length>0){stEl.className='gc gc-dn';_cdBackStyle(stEl);stEl.style.cursor='pointer';stEl.innerHTML='<span style="color:rgba(200,168,78,.6);font-size:clamp(.55rem,1.8vw,.75rem);font-weight:700;text-shadow:0 1px 4px rgba(0,0,0,.9)">'+Math.ceil(stock.length/10)+'</span>';stEl.onclick=function(){dealStock()};}
    else{stEl.className='gc gc-empty';}
    topRow.appendChild(stEl);
    var sp=document.createElement('div');sp.style.flex='1';topRow.appendChild(sp);
    var info=document.createElement('div');info.style.cssText='color:var(--gold);font-family:DM Mono,monospace;font-size:clamp(.55rem,1.8vw,.75rem)';
    info.textContent=completed+'/8 runs';topRow.appendChild(info);
    gd.appendChild(topRow);
    var tabRow=document.createElement('div');
    var spW='clamp(34px,9vw,60px)',spH='clamp(48px,12.6vw,84px)',spF='clamp(.5rem,1.4vw,.65rem)';
    tabRow.style.cssText='display:flex;gap:clamp(1px,.3vw,2px);justify-content:center;padding:clamp(2px,1vw,4px) 0;width:clamp(320px,99vw,700px);margin:0 auto';
    for(var c=0;c<10;c++){
      var colDiv=document.createElement('div');colDiv.className='gc-stk';
      colDiv.style.minWidth=spW;
      if(tab[c].length===0){
        var em=document.createElement('div');em.className='gc gc-empty';em.style.width=spW;em.style.height=spH;
        (function(ci){em.onclick=function(){tapCol(ci)}})(c);
        colDiv.appendChild(em);
      }else{
        for(var i=0;i<tab[c].length;i++){
          var cd=_cdEl(tab[c][i]);
          cd.style.width=spW;cd.style.height=spH;cd.style.fontSize=spF;
          if(sel&&sel.col===c&&i>=sel.idx)cd.className+=' gc-sel';
          (function(ci,ii){cd.onclick=function(){tapCol(ci,ii)}})(c,i);
          colDiv.appendChild(cd);
        }
      }
      tabRow.appendChild(colDiv);
    }
    gd.appendChild(tabRow);
  }
  window._SPN=function(){init()};
  window._SPS=function(v){suits=parseInt(v)||1;_setDiff(suits<=1?'easy':suits<=2?'medium':'hard');init()};
  init();
}

// ═══ FREECELL ═══
function GFC(a){
  var tab=[],free=[null,null,null,null],fnd=[[],[],[],[]],sel=null,gameOver=false,moves=0;
  ms(a,'Moves: <strong id="FCmv">0</strong>');mm(a);
  var gd=document.createElement('div');gd.id='FCgd';a.appendChild(gd);
  mc(a).innerHTML='<button class="gb-new" onclick="_FCN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  function init(){
    var deck=_cdSh(_cdMk());
    tab=[];free=[null,null,null,null];fnd=[[],[],[],[]];sel=null;gameOver=false;moves=0;
    for(var c=0;c<8;c++){tab[c]=[];var cnt=c<4?7:6;for(var i=0;i<cnt;i++){var cd=deck.pop();cd.up=true;tab[c].push(cd);}}
    upd();rn();
  }
  function upd(){var el=document.getElementById('FCmv');if(el)el.textContent=moves;}
  function mm_up(t){var el=document.getElementById('_gm');if(el)el.textContent=t;}
  function checkWin(){for(var f=0;f<4;f++)if(fnd[f].length<13)return false;return true;}
  function emptyFree(){var n=0;for(var i=0;i<4;i++)if(!free[i])n++;return n;}
  function emptyCols(){var n=0;for(var c=0;c<8;c++)if(tab[c].length===0)n++;return n;}
  function maxMove(){return (1+emptyFree())*Math.pow(2,emptyCols());}
  function canFnd(card,fi){
    var pile=fnd[fi];if(pile.length===0)return card.r===0;
    return pile[pile.length-1].s===card.s&&card.r===pile[pile.length-1].r+1;
  }
  function canTab(card,ci){
    var col=tab[ci];if(col.length===0)return true;
    var top=col[col.length-1];
    return _cdIsRed(top.s)!==_cdIsRed(card.s)&&card.r===top.r-1;
  }
  function tryAutoFnd(card,src){
    for(var f=0;f<4;f++){
      if(canFnd(card,f)){
        fnd[f].push(card);
        if(src.type==='free')free[src.idx]=null;
        else if(src.type==='tab')tab[src.idx].pop();
        else if(src.type==='waste'){}
        moves++;_e('progress');
        if(checkWin()){gameOver=true;mm_up('🏆 You win!');_play('win');_playWin();_e('game_win');_sr('freecell',{w:true,s:moves});}
        upd();rn();return true;
      }
    }
    return false;
  }
  function doSelect(type,idx,cardIdx){
    if(gameOver)return;
    if(sel){
      // Try to place
      if(type==='fnd'){
        // Place on foundation
        var cards=getSel();
        if(cards.length===1&&canFnd(cards[0],idx)){
          removeSel();fnd[idx].push(cards[0]);moves++;_e('progress');
          if(checkWin()){gameOver=true;mm_up('🏆 You win!');_play('win');_playWin();_e('game_win');_sr('freecell',{w:true,s:moves});}
          sel=null;upd();rn();return;
        }
        sel=null;rn();return;
      }
      if(type==='free'){
        var cards=getSel();
        if(cards.length===1&&!free[idx]){
          removeSel();free[idx]=cards[0];moves++;sel=null;upd();rn();return;
        }
        if(free[idx]&&sel.type==='free'&&sel.idx===idx){sel=null;rn();return;}
        sel=null;rn();return;
      }
      if(type==='tab'){
        var cards=getSel();
        if(cards.length<=maxMove()&&canTab(cards[0],idx)){
          removeSel();for(var i=0;i<cards.length;i++)tab[idx].push(cards[i]);moves++;
          sel=null;upd();rn();return;
        }
        // Maybe selecting new source
        if(tab[idx].length>0&&tab[idx][cardIdx]&&tab[idx][cardIdx].up){
          sel={type:'tab',idx:idx,cardIdx:cardIdx};rn();return;
        }
        sel=null;rn();return;
      }
    }else{
      // Select
      if(type==='free'&&free[idx]){sel={type:'free',idx:idx};rn();return;}
      if(type==='tab'&&tab[idx].length>0){
        if(cardIdx===undefined)cardIdx=tab[idx].length-1;
        if(!tab[idx][cardIdx].up)return;
        sel={type:'tab',idx:idx,cardIdx:cardIdx};rn();return;
      }
    }
  }
  function getSel(){
    if(!sel)return [];
    if(sel.type==='free')return free[sel.idx]?[free[sel.idx]]:[];
    if(sel.type==='tab')return tab[sel.idx].slice(sel.cardIdx);
    return [];
  }
  function removeSel(){
    if(!sel)return;
    if(sel.type==='free')free[sel.idx]=null;
    if(sel.type==='tab')tab[sel.idx].splice(sel.cardIdx);
  }
  function rn(){
    gd.innerHTML='';
    var topRow=document.createElement('div');
    var fcW='clamp(42px,11.5vw,72px)',fcH='clamp(59px,16vw,100px)',fcF='clamp(.55rem,1.6vw,.75rem)';
    topRow.style.cssText='display:flex;gap:clamp(2px,.6vw,4px);justify-content:center;padding:clamp(2px,1vw,4px) 0;width:clamp(320px,100vw,680px);margin:0 auto;align-items:flex-start';
    // Free cells
    for(var i=0;i<4;i++){
      var el;
      if(free[i]){el=_cdEl(free[i]);if(sel&&sel.type==='free'&&sel.idx===i)el.className+=' gc-sel';}
      else{el=document.createElement('div');el.className='gc gc-empty';}
      el.style.width=fcW;el.style.height=fcH;el.style.fontSize=fcF;
      (function(ii){el.onclick=function(){doSelect('free',ii)}})(i);
      el.style.cursor='pointer';topRow.appendChild(el);
    }
    var sp=document.createElement('div');sp.style.cssText='width:clamp(4px,1.5vw,10px)';topRow.appendChild(sp);
    // Foundations
    for(var f=0;f<4;f++){
      var el;
      if(fnd[f].length>0){el=_cdEl(fnd[f][fnd[f].length-1]);}
      else{el=document.createElement('div');el.className='gc gc-fnd';el.style.backgroundImage="url('"+_CD_BASE+_SUIT_NAME[f]+".png')";}
      el.style.width=fcW;el.style.height=fcH;el.style.fontSize=fcF;
      (function(fi){el.onclick=function(){doSelect('fnd',fi)}})(f);
      el.style.cursor='pointer';topRow.appendChild(el);
    }
    gd.appendChild(topRow);
    // Tableau
    var tabRow=document.createElement('div');
    tabRow.style.cssText='display:flex;gap:clamp(2px,.6vw,3px);justify-content:center;padding:clamp(2px,.8vw,3px) 0;width:clamp(320px,100vw,680px);margin:0 auto';
    for(var c=0;c<8;c++){
      var colDiv=document.createElement('div');colDiv.className='gc-stk';colDiv.style.minWidth=fcW;
      if(tab[c].length===0){
        var em=document.createElement('div');em.className='gc gc-empty';em.style.width=fcW;em.style.height=fcH;
        (function(ci){em.onclick=function(){doSelect('tab',ci)}})(c);
        colDiv.appendChild(em);
      }else{
        for(var i=0;i<tab[c].length;i++){
          var cd=_cdEl(tab[c][i]);
          cd.style.width=fcW;cd.style.height=fcH;cd.style.fontSize=fcF;
          if(sel&&sel.type==='tab'&&sel.idx===c&&i>=sel.cardIdx)cd.className+=' gc-sel';
          (function(ci,ii){cd.onclick=function(){doSelect('tab',ci,ii)}})(c,i);
          cd.style.cursor='pointer';colDiv.appendChild(cd);
        }
      }
      tabRow.appendChild(colDiv);
    }
    gd.appendChild(tabRow);
  }
  window._FCN=function(){init()};
  init();
}

// ═══ PYRAMID SOLITAIRE ═══
function GP(a){
  var pyr=[],stock=[],waste=[],sel=null,gameOver=false,moves=0,removed={};
  ms(a,'Cleared: <strong id="PYcl">0</strong>/28 · Moves: <strong id="PYmv">0</strong>');mm(a);
  var gd=document.createElement('div');gd.id='PYgd';a.appendChild(gd);
  mc(a).innerHTML='<button class="gb-new" onclick="_PYN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  function init(){
    var deck=_cdSh(_cdMk());
    pyr=[];stock=[];waste=[];sel=null;gameOver=false;moves=0;removed={};
    for(var i=0;i<28;i++){var cd=deck.pop();cd.up=true;pyr.push(cd);}
    stock=deck.slice();for(var i=0;i<stock.length;i++)stock[i].up=false;
    upd();rn();
  }
  function upd(){
    var cl=0;for(var k in removed)cl++;
    var e1=document.getElementById('PYcl');if(e1)e1.textContent=cl;
    var e2=document.getElementById('PYmv');if(e2)e2.textContent=moves;
  }
  function mm_up(t){var el=document.getElementById('_gm');if(el)el.textContent=t;}
  // Pyramid indexing: row r starts at index r*(r+1)/2, has r+1 cards
  function pyrRow(idx){var r=0;while((r+1)*(r+2)/2<=idx)r++;return r;}
  function pyrCol(idx){var r=pyrRow(idx);return idx-r*(r+1)/2;}
  function isExposed(idx){
    if(removed[idx])return false;
    var r=pyrRow(idx),c=pyrCol(idx);
    if(r===6)return true;
    var leftChild=((r+1)*(r+2)/2)+c;
    var rightChild=leftChild+1;
    return !!removed[leftChild]&&!!removed[rightChild];
  }
  function cardVal(card){return card.r+1;} // A=1..K=13
  function canPair(c1,c2){return cardVal(c1)+cardVal(c2)===13;}
  function isKing(card){return card.r===12;}
  function removePyr(idx){removed[idx]=true;}
  function checkWin(){var cl=0;for(var k in removed)cl++;return cl>=28;}
  function checkLoss(){
    if(stock.length>0)return false;
    // Check waste top against exposed pyramid
    var wTop=waste.length>0?waste[waste.length-1]:null;
    for(var i=0;i<28;i++){
      if(removed[i])continue;
      if(!isExposed(i))continue;
      if(isKing(pyr[i]))return false;
      if(wTop&&canPair(pyr[i],wTop))return false;
      // Check against other exposed
      for(var j=i+1;j<28;j++){
        if(removed[j]||!isExposed(j))continue;
        if(canPair(pyr[i],pyr[j]))return false;
      }
    }
    return true;
  }
  function tapPyr(idx){
    if(gameOver||removed[idx]||!isExposed(idx))return;
    var card=pyr[idx];
    if(isKing(card)){removePyr(idx);moves++;_play('tap');_e('progress');
      if(checkWin()){gameOver=true;mm_up('🏆 Cleared!');_play('win');_playWin();_e('game_win');_sr('pyramid',{w:true,s:moves});}
      sel=null;upd();rn();return;
    }
    if(sel){
      if(sel.type==='pyr'&&sel.idx===idx){sel=null;rn();return;}
      var other=sel.type==='pyr'?pyr[sel.idx]:waste[waste.length-1];
      if(canPair(card,other)){
        removePyr(idx);
        if(sel.type==='pyr')removePyr(sel.idx);else waste.pop();
        moves++;_play('tap');_e('progress');
        if(checkWin()){gameOver=true;mm_up('🏆 Cleared!');_play('win');_playWin();_e('game_win');_sr('pyramid',{w:true,s:moves});}
        sel=null;upd();rn();
        if(!gameOver&&checkLoss()){gameOver=true;mm_up('No moves left');_e('game_loss');_sr('pyramid',{w:false,s:moves});}
        return;
      }
      sel={type:'pyr',idx:idx};rn();return;
    }
    sel={type:'pyr',idx:idx};rn();
  }
  function tapWaste(){
    if(gameOver||waste.length===0)return;
    var card=waste[waste.length-1];
    if(isKing(card)){waste.pop();moves++;_play('tap');_e('progress');sel=null;upd();rn();return;}
    if(sel&&sel.type==='pyr'){
      if(canPair(pyr[sel.idx],card)){
        removePyr(sel.idx);waste.pop();moves++;_play('tap');_e('progress');
        if(checkWin()){gameOver=true;mm_up('🏆 Cleared!');_play('win');_playWin();_e('game_win');_sr('pyramid',{w:true,s:moves});}
        sel=null;upd();rn();return;
      }
    }
    sel={type:'waste'};rn();
  }
  function tapStock(){
    if(gameOver||stock.length===0)return;
    var cd=stock.pop();cd.up=true;waste.push(cd);_play('tap');sel=null;rn();
    if(checkLoss()){gameOver=true;mm_up('No moves left');_e('game_loss');_sr('pyramid',{w:false,s:moves});}
  }
  function rn(){
    gd.innerHTML='';
    // Pyramid
    var pyrDiv=document.createElement('div');
    pyrDiv.style.cssText='display:flex;flex-direction:column;align-items:center;padding:clamp(2px,1vw,4px) 0';
    var idx=0;
    for(var r=0;r<7;r++){
      var rowDiv=document.createElement('div');
      rowDiv.style.cssText='display:flex;gap:clamp(2px,.6vw,4px);justify-content:center';
      if(r>0)rowDiv.style.marginTop='clamp(-18px,-5vw,-26px)';
      for(var c=0;c<=r;c++){
        var pi=idx;
        if(removed[pi]){
          var em=document.createElement('div');em.style.cssText='width:clamp(48px,11.5vw,72px);height:clamp(67px,16vw,100px)';
          rowDiv.appendChild(em);
        }else{
          var cd=_cdEl(pyr[pi]);
          cd.style.width='clamp(48px,11.5vw,72px)';cd.style.height='clamp(67px,16vw,100px)';cd.style.fontSize='clamp(.6rem,1.6vw,.8rem)';
          if(!isExposed(pi))cd.style.opacity='.5';
          else cd.style.cursor='pointer';
          if(sel&&sel.type==='pyr'&&sel.idx===pi)cd.className+=' gc-sel';
          (function(ii){cd.onclick=function(){tapPyr(ii)}})(pi);
          rowDiv.appendChild(cd);
        }
        idx++;
      }
      pyrDiv.appendChild(rowDiv);
    }
    gd.appendChild(pyrDiv);
    // Stock + Waste row
    var botRow=document.createElement('div');
    botRow.style.cssText='display:flex;gap:clamp(4px,1.2vw,6px);justify-content:center;padding:clamp(3px,1vw,6px) 0;align-items:center';
    var stEl=document.createElement('div');
    if(stock.length>0){stEl.className='gc gc-dn';_cdBackStyle(stEl);stEl.innerHTML='<span style="color:rgba(200,168,78,.6);font-size:clamp(.55rem,1.8vw,.75rem);font-weight:700;text-shadow:0 1px 4px rgba(0,0,0,.9)">'+stock.length+'</span>';stEl.style.cursor='pointer';stEl.onclick=function(){tapStock()};}
    else{stEl.className='gc gc-empty';}
    botRow.appendChild(stEl);
    var wEl;
    if(waste.length>0){wEl=_cdEl(waste[waste.length-1]);if(sel&&sel.type==='waste')wEl.className+=' gc-sel';wEl.style.cursor='pointer';wEl.onclick=function(){tapWaste()};}
    else{wEl=document.createElement('div');wEl.className='gc gc-empty';}
    botRow.appendChild(wEl);
    gd.appendChild(botRow);
  }
  window._PYN=function(){init()};
  init();
}

// ═══ TRIPEAKS SOLITAIRE ═══
function GT(a){
  var peaks=[],stock=[],waste=[],gameOver=false,moves=0,streak=0;
  // peaks: 28 slots. Rows 0-2 are face-down peaks, row 3 is 10 face-up cards
  // Layout: 3 mini-pyramids of 3 rows each (1+2+3=6 cards each = 18), plus 10 base cards
  ms(a,'Streak: <strong id="TPst">0</strong> · Left: <strong id="TPlf">28</strong>');mm(a);
  var gd=document.createElement('div');gd.id='TPgd';a.appendChild(gd);
  mc(a).innerHTML='<button class="gb-new" onclick="_TPN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  // Peak structure: 3 peaks, each has rows of 1,2,3 cards
  // Peak 0: indices 0, 1,2, 3,4,5
  // Peak 1: indices 6, 7,8, 9,10,11
  // Peak 2: indices 12, 13,14, 15,16,17
  // Base row: indices 18-27 (10 cards)
  var removed={};

  function init(){
    var deck=_cdSh(_cdMk());
    peaks=[];stock=[];waste=[];gameOver=false;moves=0;streak=0;removed={};
    for(var i=0;i<28;i++){
      var cd=deck.pop();
      // Base row (18-27) is face-up, peak tops (0,6,12) face-down, etc.
      cd.up=(i>=18);
      // Second row of each peak face-down, third row face-up
      if(i<18){
        var pk=Math.floor(i/6);
        var pi=i%6;
        cd.up=(pi>=3); // row 2 (indices 3,4,5 within each peak) face-up
      }
      peaks.push(cd);
    }
    var first=deck.pop();first.up=true;
    waste=[first];stock=deck.slice();
    for(var i=0;i<stock.length;i++)stock[i].up=false;
    upd();rn();
  }
  function upd(){
    var left=0;for(var i=0;i<28;i++)if(!removed[i])left++;
    var e1=document.getElementById('TPst');if(e1)e1.textContent=streak;
    var e2=document.getElementById('TPlf');if(e2)e2.textContent=left;
  }
  function mm_up(t){var el=document.getElementById('_gm');if(el)el.textContent=t;}
  function isExposed(idx){
    if(removed[idx])return false;
    if(idx>=18)return true; // base row always exposed
    var pk=Math.floor(idx/6);var pi=idx%6;
    if(pi>=3)return true; // bottom row of peak — check if base cards below are removed
    // Actually, let's use parent-child: row 0 (pi=0) covered by row 1 (pi=1,2), row 1 covered by row 2 (pi=3,4,5)
    if(pi===0){return !!removed[pk*6+1]&&!!removed[pk*6+2];}
    if(pi===1){return !!removed[pk*6+3]&&!!removed[pk*6+4];}
    if(pi===2){return !!removed[pk*6+4]&&!!removed[pk*6+5];}
    return true;
  }
  function flipParents(){
    for(var i=0;i<18;i++){
      if(!removed[i]&&!peaks[i].up&&isExposed(i))peaks[i].up=true;
    }
  }
  function canPlay(card){
    if(waste.length===0)return true;
    var top=waste[waste.length-1];
    var diff=Math.abs(card.r-top.r);
    return diff===1||(card.r===0&&top.r===12)||(card.r===12&&top.r===0); // wrapping
  }
  function checkWin(){for(var i=0;i<28;i++)if(!removed[i])return false;return true;}
  function checkLoss(){
    if(stock.length>0)return false;
    for(var i=0;i<28;i++){if(!removed[i]&&isExposed(i)&&peaks[i].up&&canPlay(peaks[i]))return false;}
    return true;
  }
  function tapPeak(idx){
    if(gameOver||removed[idx]||!isExposed(idx)||!peaks[idx].up)return;
    if(!canPlay(peaks[idx])){sm('Need ±1 from waste');return;}
    waste.push(peaks[idx]);removed[idx]=true;streak++;moves++;_play('tap');_e('progress');
    flipParents();
    if(checkWin()){gameOver=true;mm_up('🏆 Cleared!');_play('win');_playWin();_e('game_win');_sr('tripeaks',{w:true,s:moves});}
    upd();rn();
    if(!gameOver&&checkLoss()){gameOver=true;var left=0;for(var i=0;i<28;i++)if(!removed[i])left++;mm_up(left+' left — stuck');_e('game_loss');_sr('tripeaks',{w:false,s:28-left});}
  }
  function tapStock(){
    if(gameOver||stock.length===0)return;
    var cd=stock.pop();cd.up=true;waste.push(cd);streak=0;_play('tap');upd();rn();
    if(checkLoss()){gameOver=true;var left=0;for(var i=0;i<28;i++)if(!removed[i])left++;mm_up(left+' left — stuck');_e('game_loss');_sr('tripeaks',{w:false,s:28-left});}
  }
  function rn(){
    gd.innerHTML='';
    // Peaks
    var peakDiv=document.createElement('div');
    peakDiv.style.cssText='display:flex;flex-direction:column;align-items:center;padding:clamp(2px,1vw,4px) 0';
    // Row 0: 3 peak tops (indices 0,6,12) with gaps
    var rows=[[0,6,12],[1,2,7,8,13,14],[3,4,5,9,10,11,15,16,17],[18,19,20,21,22,23,24,25,26,27]];
    for(var ri=0;ri<4;ri++){
      var rowDiv=document.createElement('div');
      rowDiv.style.cssText='display:flex;gap:clamp(2px,.5vw,3px);justify-content:center';
      if(ri>0)rowDiv.style.marginTop='clamp(-14px,-4vw,-20px)';
      // Add spacers between peaks for alignment
      for(var ci=0;ci<rows[ri].length;ci++){
        var pi=rows[ri][ci];
        // Add gap between peaks
        if(ri<3&&ci>0&&Math.floor(rows[ri][ci]/6)!==Math.floor(rows[ri][ci-1]/6)){
          var gap=document.createElement('div');
          var gapW=ri===0?'clamp(60px,18vw,84px)':ri===1?'clamp(20px,5.5vw,28px)':'clamp(2px,.5vw,3px)';
          gap.style.cssText='width:'+gapW;
          rowDiv.appendChild(gap);
        }
        if(removed[pi]){
          var em=document.createElement('div');em.style.cssText='width:clamp(42px,9.5vw,62px);height:clamp(59px,13.3vw,87px)';
          rowDiv.appendChild(em);
        }else{
          var cd=_cdEl(peaks[pi]);
          cd.style.width='clamp(42px,9.5vw,62px)';cd.style.height='clamp(59px,13.3vw,87px)';cd.style.fontSize='clamp(.55rem,1.5vw,.7rem)';
          if(!peaks[pi].up){cd.className='gc gc-dn';_cdBackStyle(cd);cd.style.width='clamp(42px,9.5vw,62px)';cd.style.height='clamp(59px,13.3vw,87px)';cd.innerHTML='';}
          else if(isExposed(pi)){cd.style.cursor='pointer';(function(ii){cd.onclick=function(){tapPeak(ii)}})(pi);}
          else{cd.style.opacity='.5';}
          rowDiv.appendChild(cd);
        }
      }
      peakDiv.appendChild(rowDiv);
    }
    gd.appendChild(peakDiv);
    // Stock + Waste
    var botRow=document.createElement('div');
    botRow.style.cssText='display:flex;gap:clamp(4px,1.2vw,6px);justify-content:center;padding:clamp(3px,1vw,6px) 0;align-items:center';
    var stEl=document.createElement('div');
    if(stock.length>0){stEl.className='gc gc-dn';_cdBackStyle(stEl);stEl.innerHTML='<span style="color:rgba(200,168,78,.6);font-size:clamp(.55rem,1.8vw,.75rem);font-weight:700;text-shadow:0 1px 4px rgba(0,0,0,.9)">'+stock.length+'</span>';stEl.style.cursor='pointer';stEl.onclick=function(){tapStock()};}
    else{stEl.className='gc gc-empty';}
    botRow.appendChild(stEl);
    var wEl;
    if(waste.length>0){wEl=_cdEl(waste[waste.length-1]);wEl.style.boxShadow='0 0 8px rgba(200,168,78,.3)';}
    else{wEl=document.createElement('div');wEl.className='gc gc-empty';}
    botRow.appendChild(wEl);
    var sp=document.createElement('div');sp.style.flex='1';botRow.appendChild(sp);
    var info=document.createElement('div');info.style.cssText='color:var(--gold);font-family:DM Mono,monospace;font-size:clamp(.55rem,1.8vw,.75rem)';
    var left=0;for(var i=0;i<28;i++)if(!removed[i])left++;
    info.textContent='Streak: '+streak;botRow.appendChild(info);
    gd.appendChild(botRow);
  }
  window._TPN=function(){init()};
  init();
}

function GD(a){var tl=[],mv=0;ms(a,'👆<strong id="Dm">0</strong>');mm(a);var gd=document.createElement('div');gd.className='dg';gd.id='Dg';a.appendChild(gd);mc(a).innerHTML='<button class="gb-new" onclick="_DN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';
  function sv(ar){var inv=0;for(var i=0;i<ar.length;i++)for(var j=i+1;j<ar.length;j++)if(ar[i]&&ar[j]&&ar[i]>ar[j])inv++;return(Math.floor(ar.indexOf(0)/4)%2===0)!==(inv%2===0)}function wn(){for(var i=0;i<15;i++)if(tl[i]!==i+1)return false;return true}
  function rn(){gd.innerHTML='';tl.forEach(function(v,i){var d=document.createElement('div');if(!v){d.className='dc de'}else{d.className='dc df'+(v===i+1?' dk':'');d.textContent=v;d.onclick=function(){var vi=tl.indexOf(v),ei=tl.indexOf(0);if((Math.abs(Math.floor(vi/4)-Math.floor(ei/4))+Math.abs(vi%4-ei%4))!==1)return;_play('slide');tl[ei]=v;tl[vi]=0;mv++;document.getElementById('Dm').textContent=mv;if(mv%20===0)_e('milestone');if(wn()){_e('game_win');sm('🌿 '+mv+' moves!');_sr('slider',{w:true,s:mv})}rn()}}gd.appendChild(d)})}
  window._DN=function(){mv=0;document.getElementById('Dm').textContent='0';sm('');tl=[];for(var i=1;i<=15;i++)tl.push(i);tl.push(0);do{sh(tl)}while(!sv(tl)||wn());rn()};_DN();}
// ═══ SUDOKU ═══
function GF(a){var dice=[0,0,0,0,0,0],kept=new Array(6).fill(false),turn=0,rolling=false,busted=false;
  var numPlayers=1,curP=0,players=[{banked:0}],target=10000,gameOver=false,finalRound=false,finalStart=-1;
  ms(a,'<span id="Fp">P1</span> · <strong id="Fs">0</strong> / '+target);mm(a);
  var pp=document.createElement('div');pp.id='Fpp';pp.style.cssText='display:flex;gap:8px;justify-content:center;align-items:center;padding:8px 10px;font-size:.8rem;color:var(--muted);flex-wrap:wrap';
  pp.innerHTML='<span>Players:</span>';
  for(var _n=1;_n<=4;_n++){var _b=document.createElement('button');_b.textContent=_n;_b.setAttribute('data-n',_n);_b.className='fppb';_b.style.cssText='min-width:38px;min-height:38px;border-radius:8px;border:1.5px solid rgba(74,124,53,.3);background:rgba(18,24,16,.6);color:var(--cream);font-weight:700;font-size:.85rem;cursor:pointer;transition:all .15s';_b.onclick=function(){numPlayers=parseInt(this.getAttribute('data-n'));_play('tap');_FN()};pp.appendChild(_b)}
  a.appendChild(pp);
  var dd=document.createElement('div');dd.id='Fd';dd.style.cssText='display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(10px,3vw,16px);max-width:clamp(280px,84vw,420px);margin:0 auto;padding:clamp(10px,3vw,16px);animation:boardFadeIn .4s ease';a.appendChild(dd);
  var si=document.createElement('div');si.style.cssText='text-align:center;font-size:.85rem;color:var(--muted);padding:8px 10px;line-height:1.7;font-weight:500';si.id='Fi';a.appendChild(si);
  mc(a).innerHTML='<button class="gb-new" onclick="_FR()"><img src="assets/games/roll-btn.png" alt="Roll"></button><button class="gb-new" onclick="_FB()"><img src="assets/games/bank-points-btn.png" alt="Bank Points"></button><button class="gb-new" onclick="_FN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';
  function highlightPick(){var bs=pp.querySelectorAll('.fppb');for(var i=0;i<bs.length;i++){var on=parseInt(bs[i].getAttribute('data-n'))===numPlayers;bs[i].style.borderColor=on?'var(--gold)':'rgba(74,124,53,.3)';bs[i].style.background=on?'rgba(200,168,78,.15)':'rgba(18,24,16,.6)';bs[i].style.color=on?'var(--gold)':'var(--cream)'}}
  function rn(){dd.innerHTML='';for(var i=0;i<6;i++){var d=document.createElement('div');d.className='fdie'+(kept[i]?' fk':'');d.style.cssText='width:100%;aspect-ratio:1;min-height:88px';if(dice[i])d.innerHTML='<img src="assets/dice/d'+dice[i]+'.png" alt="'+dice[i]+'" style="width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;-webkit-user-drag:none;border-radius:clamp(6px,2vw,12px)" draggable="false"/>';else d.innerHTML='<span style="font-size:2rem;color:var(--muted);opacity:.3">·</span>';d.setAttribute('data-i',i);d.onclick=function(){var x=parseInt(this.getAttribute('data-i'));if(dice[x]&&!gameOver&&!busted){_play('tap');kept[x]=!kept[x];rn()}};dd.appendChild(d)}updInfo()}
  function updInfo(){var parts=[];for(var p=0;p<players.length;p++){var on=p===curP&&!gameOver;parts.push('<span style="'+(on?'color:var(--gold);font-weight:700':'')+'">P'+(p+1)+': '+players[p].banked+'</span>')}var live=turn+score();document.getElementById('Fi').innerHTML=parts.join(' · ')+'<br/>This turn: '+live;document.getElementById('Fp').textContent='P'+(curP+1);document.getElementById('Fs').textContent=players[curP].banked;highlightPick()}
  function score(){var ct=new Array(7).fill(0);for(var i=0;i<6;i++)if(kept[i])ct[dice[i]]++;var s=0;for(var v=1;v<=6;v++){if(ct[v]>=3){s+=(v===1)?1000:v*100;var extra=ct[v]-3;s+=extra*100;ct[v]=0}else{if(v===1)s+=ct[v]*100;if(v===5)s+=ct[v]*50}}return s}
  function nextPlayer(){turn=0;kept=new Array(6).fill(false);dice=new Array(6).fill(0);busted=false;rolling=false;if(finalRound){curP=(curP+1)%players.length;if(curP===finalStart){endGame();return}}else{curP=(curP+1)%players.length}rn();sm('P'+(curP+1)+"'s turn — 🎲 Roll!")}
  function endGame(){gameOver=true;var best=-1,winner=0;for(var i=0;i<players.length;i++)if(players[i].banked>best){best=players[i].banked;winner=i}sm('🏆 P'+(winner+1)+' wins with '+best+'! Tap 🔄 New');_play('win');try{_playWin()}catch(e){}if(winner===0){_e('game_win');_sr('farkle',{w:true,s:best})}else{_e('game_loss');_sr('farkle',{w:false,s:players[0].banked})}rn()}
  window._FR=function(){if(rolling||busted||gameOver)return;rolling=true;var any=false;for(var i=0;i<6;i++)if(!kept[i]){_play('dice');dice[i]=Math.floor(Math.random()*6)+1;any=true}if(!any){turn+=score();kept=new Array(6).fill(false);for(var i=0;i<6;i++)dice[i]=Math.floor(Math.random()*6)+1;sm('🔥 Hot dice! +'+turn+' locked — rolling all 6')}var ct=new Array(7).fill(0);for(var i=0;i<6;i++)if(!kept[i])ct[dice[i]]++;var hct=new Array(7).fill(0);for(var i=0;i<6;i++)if(kept[i])hct[dice[i]]++;var has=ct[1]>0||ct[5]>0;for(var v=1;v<=6;v++){if(ct[v]>=3)has=true;if(ct[v]>0&&hct[v]>=3)has=true;}if(!has){busted=true;_play('lose');sm('🍂 Farkle! P'+(curP+1)+' loses '+turn+' — passing…');rn();setTimeout(function(){if(players.length>1)nextPlayer();else{turn=0;rolling=false;rn()}},1400);return}rn();rolling=false;if(any)sm('Keep Dice, Roll, or Bank')};
  window._FB=function(){if(busted||gameOver)return;var ts=score();if(ts+turn<=0){sm('Tap dice to keep them first!');return}var gained=ts+turn;players[curP].banked+=gained;_e('progress');if(players[curP].banked>=1000)_e('milestone');document.getElementById('Fs').textContent=players[curP].banked;sm('P'+(curP+1)+' banked '+gained+' (total '+players[curP].banked+')');if(players[curP].banked>=target&&!finalRound){finalRound=true;finalStart=curP;if(players.length===1){endGame();return}sm('P'+(curP+1)+' hit '+target+'! Final round — others get one more turn');_play('win')}if(players.length>1)setTimeout(function(){nextPlayer()},900);else{turn=0;kept=new Array(6).fill(false);dice=new Array(6).fill(0);if(players[curP].banked>=target)endGame();else rn()}};
  window._FN=function(){dice=new Array(6).fill(0);kept=new Array(6).fill(false);turn=0;rolling=false;busted=false;curP=0;gameOver=false;finalRound=false;finalStart=-1;players=[];for(var i=0;i<numPlayers;i++)players.push({banked:0});document.getElementById('Fs').textContent='0';sm(numPlayers>1?('P1 starts — 🎲 Roll! (First to '+target+')'):'🎲 Roll!');rn()};_FN();}
// ═══ TRIPEAKS ═══
function GY(a){var dice=[0,0,0,0,0],kept=new Array(5).fill(false),rolls=0,turn=1,scores={},justRolled=new Array(5).fill(false);
  // Botanical dice — paper-card PNGs (seed/dew/clover/sun/flower/moon)
  function seedDie(n){
    return '<img src="assets/dice/d'+n+'.png" alt="'+n+'" style="width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;-webkit-user-drag:none;border-radius:clamp(6px,2vw,12px)" draggable="false"/>';
  }
  var CATS=[
    {name:'Ones',sub:'Sprouts',icon:'&#x1F331;',desc:'Sum of 1s'},
    {name:'Twos',sub:'Twin Leaf',icon:'&#x1F33F;',desc:'Sum of 2s'},
    {name:'Threes',sub:'Trillium',icon:'&#x2618;',desc:'Sum of 3s'},
    {name:'Fours',sub:'Clover',icon:'&#x1F340;',desc:'Sum of 4s'},
    {name:'Fives',sub:'Star Bloom',icon:'&#x2B50;',desc:'Sum of 5s'},
    {name:'Sixes',sub:'Hex Petal',icon:'&#x1F33A;',desc:'Sum of 6s'},
    {name:'3 of a Kind',sub:'Cluster',icon:'&#x1F33E;',desc:'Sum of all dice'},
    {name:'4 of a Kind',sub:'Grove',icon:'&#x1F332;',desc:'Sum of all dice'},
    {name:'Full House',sub:'Full Canopy',icon:'&#x1F333;',desc:'Three + a pair = 25'},
    {name:'Small Straight',sub:'Trail',icon:'&#x1F6A4;',desc:'4 in a row = 30'},
    {name:'Large Straight',sub:'River',icon:'&#x1F30A;',desc:'5 in a row = 40'},
    {name:'Yahtzee',sub:'Bloom',icon:'&#x2728;',desc:'All 5 match = 50'},
    {name:'Chance',sub:'Wild Growth',icon:'&#x1F3B2;',desc:'Sum of all dice'}
  ];
  ms(a,'Turn: <strong id="Yt">1</strong>/13 &middot; Rolls: <strong id="Yr">0</strong>/3');mm(a);
  // Directions
  var dir=document.createElement('div');
  dir.style.cssText='text-align:center;padding:0.4rem 0.8rem;margin:0.2rem auto;max-width:400px;font-family:DM Sans,sans-serif;font-size:clamp(0.6rem,1.8vw,0.75rem);color:var(--cream);line-height:1.4;opacity:0.8';
  dir.innerHTML='<strong style="color:var(--gold)">Roll</strong> up to 3 times. <strong>Tap dice</strong> to hold. Then <strong>score</strong> in a category.';
  a.appendChild(dir);
  var dd=document.createElement('div');dd.className='fd';dd.id='Yd';dd.style.cssText='display:flex;gap:clamp(10px,3vw,18px);justify-content:center;flex-wrap:wrap;max-width:clamp(340px,92vw,460px);margin:0 auto;padding:clamp(10px,3vw,16px)';a.appendChild(dd);
  // Buttons
  var _bbs='min-height:52px;padding:0.5rem 1.2rem;font-size:clamp(.6rem,1.8vw,.75rem);flex:1';
  mc(a).innerHTML='<div style="display:flex;gap:8px;padding:4px 0"><button class="gb-new" onclick="_YR()"><img src="assets/games/roll-btn.png" alt="Roll"></button><button class="gb-new" onclick="_YN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button></div>';
  // Scorecard
  var sc=document.createElement('div');sc.id='Ysc';sc.style.cssText='padding:4px 0';a.appendChild(sc);
  // Scoring logic
  function cs(cat){
    var c=new Array(7).fill(0);dice.forEach(function(d){c[d]++});
    var sum=dice.reduce(function(a,b){return a+b},0);
    if(cat<6)return c[cat+1]*(cat+1);
    if(cat===6){for(var v=1;v<=6;v++)if(c[v]>=3)return sum;return 0}
    if(cat===7){for(var v=1;v<=6;v++)if(c[v]>=4)return sum;return 0}
    if(cat===8){var h3=false,h2=false;for(var v=1;v<=6;v++){if(c[v]===3)h3=true;if(c[v]===2)h2=true}return h3&&h2?25:0}
    if(cat===9){var s=[];for(var v=1;v<=6;v++)if(c[v])s.push(v);s.sort(function(a,b){return a-b});var str=s.join('');return str.indexOf('1234')>-1||str.indexOf('2345')>-1||str.indexOf('3456')>-1?30:0}
    if(cat===10){var s=[];for(var v=1;v<=6;v++)if(c[v])s.push(v);return s.length===5&&s[4]-s[0]===4?40:0}
    if(cat===11){for(var v=1;v<=6;v++)if(c[v]===5)return 50;return 0}
    return sum;
  }
  function rn(){
    dd.innerHTML='';
    for(var i=0;i<5;i++){
      var d=document.createElement('div');d.className='fdie'+(kept[i]?' fk':'')+(justRolled[i]?' diceRoll':'');
      d.style.cssText='width:clamp(100px,28vw,140px);height:clamp(100px,28vw,140px);display:flex;align-items:center;justify-content:center;border-radius:clamp(14px,4vw,20px);background:transparent;border:3px solid transparent;box-shadow:none;box-sizing:border-box;cursor:pointer'+(kept[i]?';border-color:var(--gold);box-shadow:0 0 20px rgba(200,168,78,0.3),inset 0 0 12px rgba(200,168,78,0.08);background:rgba(200,168,78,0.05)':'');
      if(dice[i]){d.innerHTML=seedDie(dice[i])}else{d.innerHTML='<span style="font-size:2.5rem;color:var(--muted);opacity:0.3">&middot;</span>'}
      d.setAttribute('data-i',i);
      d.addEventListener('click',function(){var x=parseInt(this.getAttribute('data-i'));if(dice[x]){_play('tap');kept[x]=!kept[x];rn()}});
      dd.appendChild(d);
    }
    rnS();
  }
  function rnS(){
    var h='<table class="ysc">';
    function row(i){
      var done=scores[i]!==undefined;
      var val=done?scores[i]:(rolls>0?cs(i):null);
      var canScore=!done&&rolls>0;
      var ptsCell;
      if(done){ptsCell='<td style="color:var(--muted);font-weight:700;text-align:right">'+val+'</td>';}
      else if(canScore){
        var good=val>0;
        ptsCell='<td onclick="_YS('+i+')" style="text-align:right;cursor:pointer;padding:0 8px"><span class="yscBtn'+(good?' yscBtnOn':'')+'">'+(good?val:'0')+'</span></td>';
      }
      else{ptsCell='<td style="color:var(--muted);text-align:right">&mdash;</td>';}
      return '<tr class="'+(done?'yd':'')+'"><td class="yscName"><span class="yscIcon">'+CATS[i].icon+'</span><div class="yscNames"><div class="yscMain">'+CATS[i].name+'</div><div class="yscSub">'+CATS[i].sub+' &middot; '+CATS[i].desc+'</div></div></td>'+ptsCell+'</tr>';
    }
    h+='<tr><th colspan="2" class="yscHdr">UPPER SECTION</th></tr>';
    for(var i=0;i<6;i++)h+=row(i);
    var upperSum=0;for(var i=0;i<6;i++)if(scores[i]!==undefined)upperSum+=scores[i];
    var bonus=upperSum>=63?35:0;
    h+='<tr class="yscBonus"><td><div class="yscMain" style="color:var(--gold)">Upper Bonus</div><div class="yscSub">Reach 63 for +35</div></td><td style="text-align:right;color:var(--gold);font-weight:700">'+(upperSum>=63?'+35':upperSum+' / 63')+'</td></tr>';
    h+='<tr><th colspan="2" class="yscHdr">LOWER SECTION</th></tr>';
    for(var i=6;i<13;i++)h+=row(i);
    var total=bonus;for(var k in scores)total+=scores[k];
    h+='<tr class="yscTotal"><td><strong>TOTAL</strong></td><td style="text-align:right"><strong style="color:var(--gold);font-size:clamp(1.1rem,3.2vw,1.4rem)">'+total+'</strong></td></tr>';
    h+='</table>';
    document.getElementById('Ysc').innerHTML=h;
  }
  window._YR=function(){
    if(rolls>=3){sm('Pick a category to score');return}
    _play('dice');rolls++;document.getElementById('Yr').textContent=rolls;
    justRolled=new Array(5).fill(false);
    // On first roll, always re-roll all dice (ignore any pre-holds on the display dice)
    if(rolls===1){kept=new Array(5).fill(false);for(var i=0;i<5;i++){dice[i]=Math.floor(Math.random()*6)+1;justRolled[i]=true}}
    else{for(var i=0;i<5;i++)if(!kept[i]){dice[i]=Math.floor(Math.random()*6)+1;justRolled[i]=true}}
    rn();
    setTimeout(function(){justRolled=new Array(5).fill(false)},420);
  };
  window._YS=function(cat){
    if(!rolls||scores[cat]!==undefined)return;
    _play('snap');var v=cs(cat);scores[cat]=v;
    sm(CATS[cat].name+': +'+v+' pts');
    if(v>=25)_e('progress');
    turn++;document.getElementById('Yt').textContent=Math.min(turn,13);
    rolls=0;kept=new Array(5).fill(false);
    for(var _i=0;_i<5;_i++)dice[_i]=Math.floor(Math.random()*6)+1;
    document.getElementById('Yr').textContent='0';
    if(turn>13){
      var tot=0;for(var k in scores)tot+=scores[k];
      var upperSum=0;for(var i=0;i<6;i++)if(scores[i]!==undefined)upperSum+=scores[i];
      if(upperSum>=63)tot+=35;
      _e('game_win');_playWin();sm('Final score: '+tot);_sr('yahtzee',{w:true,s:tot});
    }else if(turn%3===0)_e('milestone');
    rn();
  };
  window._YN=function(){dice=[];for(var _i=0;_i<5;_i++)dice.push(Math.floor(Math.random()*6)+1);kept=new Array(5).fill(false);rolls=0;turn=1;scores={};document.getElementById('Yt').textContent='1';document.getElementById('Yr').textContent='0';sm('Tap ROLL to begin!');rn()};_YN();
}
// ═══ HANOI ═══
function GX(a){var SZ=5,sol=[],bd=[],rowC=[],colC=[];ms(a);mm(a);
  var w=document.createElement('div');w.id='Xw';w.style.cssText='padding:8px';a.appendChild(w);mc(a).innerHTML='<select class="gsl" id="Xd" onchange="_XN()"><option value="5" selected>5×5</option><option value="7">7×7</option><option value="10">10×10</option></select> <button class="gb-new" onclick="_XN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';
  function gen(){sol=[];for(var i=0;i<SZ*SZ;i++)sol.push(Math.random()<.55?1:0);bd=new Array(SZ*SZ).fill(0);
    rowC=[];for(var r=0;r<SZ;r++){var s=[],c=0;for(var j=0;j<SZ;j++){if(sol[r*SZ+j])c++;else{if(c)s.push(c);c=0}}if(c)s.push(c);if(!s.length)s=[0];rowC.push(s)}
    colC=[];for(var c=0;c<SZ;c++){var s=[],n=0;for(var r=0;r<SZ;r++){if(sol[r*SZ+c])n++;else{if(n)s.push(n);n=0}}if(n)s.push(n);if(!s.length)s=[0];colC.push(s)}}
  function rn(){var h='<table style="border-collapse:collapse;margin:0 auto"><tr><td></td>';
    for(var c=0;c<SZ;c++)h+='<td style="text-align:center;font-size:.44rem;color:var(--sage);padding:2px;vertical-align:bottom;line-height:1.3">'+colC[c].join('<br>')+'</td>';h+='</tr>';
    for(var r=0;r<SZ;r++){h+='<tr><td style="text-align:right;font-size:.44rem;color:var(--sage);padding:0 6px">'+rowC[r].join(' ')+'</td>';
      for(var c=0;c<SZ;c++){var i=r*SZ+c;h+='<td style="width:52px;height:52px;border:1px solid rgba(74,124,53,.18);text-align:center;cursor:pointer;background:'+(bd[i]===1?'rgba(74,124,53,.4)':bd[i]===2?'rgba(199,80,80,.08)':'rgba(26,31,23,.6)')+';border-radius:3px;font-size:.7rem" onclick="_XT('+i+')">'+(bd[i]===2?'✕':'')+'</td>'}h+='</tr>'}h+='</table>';w.innerHTML=h;
    var win=true;for(var i=0;i<SZ*SZ;i++){if(sol[i]===1&&bd[i]!==1||sol[i]===0&&bd[i]===1){win=false;break}}if(win&&bd.some(function(v){return v===1})){_e('game_win');_playWin();sm('🌿 Revealed!');_sr('picross',{w:true,s:SZ*SZ})}}
  window._XT=function(i){bd[i]=bd[i]===0?1:bd[i]===1?2:0;var correct=0;for(var j=0;j<SZ*SZ;j++){if(sol[j]===1&&bd[j]===1)correct++;}if(correct>0&&correct%5===0)_e('progress');rn()};window._XN=function(){SZ=parseInt((document.getElementById('Xd')||{}).value)||5;gen();sm('');rn()};_XN();}
// ═══ CHECKERS ═══
function GCK(a){var bd=new Array(64).fill(0),sel=-1,tn=1,mv=0,lastFrom=-1,lastTo=-1,mustJump=-1,gameOver=false;
  // SVG pieces — Player: sage seedling, AI: gold seed pod
  var SVG_P='<svg viewBox="0 0 40 40"><circle cx="20" cy="24" r="12" fill="#3a5a2a" stroke="#5a8a3a" stroke-width="1.5"/><circle cx="20" cy="24" r="8" fill="#4a7c35"/><ellipse cx="20" cy="22" rx="5" ry="3" fill="#7ab356" opacity="0.5"/><path d="M20 12 Q18 16 20 20 Q22 16 20 12Z" fill="#7ab356"/><path d="M16 15 Q18 18 20 18" stroke="#7ab356" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M24 15 Q22 18 20 18" stroke="#7ab356" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>';
  var SVG_A='<svg viewBox="0 0 40 40"><circle cx="20" cy="24" r="12" fill="#6B4F2D" stroke="#8a7040" stroke-width="1.5"/><circle cx="20" cy="24" r="8" fill="#8a6a30"/><ellipse cx="20" cy="22" rx="5" ry="3" fill="#C8A84B" opacity="0.4"/><ellipse cx="20" cy="16" rx="6" ry="8" fill="#C8A84B" opacity="0.85"/><ellipse cx="20" cy="16" rx="4" ry="5.5" fill="#a08030"/><line x1="20" y1="8" x2="20" y2="5" stroke="#6B4F2D" stroke-width="1.5" stroke-linecap="round"/></svg>';
  // Kings — crowned versions
  var SVG_PK='<svg viewBox="0 0 40 40"><circle cx="20" cy="24" r="12" fill="#3a5a2a" stroke="#7ab356" stroke-width="2"/><circle cx="20" cy="24" r="8" fill="#4a7c35"/><ellipse cx="20" cy="22" rx="5" ry="3" fill="#7ab356" opacity="0.5"/><path d="M10 16 L15 10 L20 14 L25 10 L30 16" stroke="#7ab356" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="15" cy="10" r="2" fill="#7ab356"/><circle cx="20" cy="14" r="2" fill="#7ab356"/><circle cx="25" cy="10" r="2" fill="#7ab356"/></svg>';
  var SVG_AK='<svg viewBox="0 0 40 40"><circle cx="20" cy="24" r="12" fill="#6B4F2D" stroke="#C8A84B" stroke-width="2"/><circle cx="20" cy="24" r="8" fill="#8a6a30"/><ellipse cx="20" cy="22" rx="5" ry="3" fill="#C8A84B" opacity="0.4"/><path d="M10 16 L15 10 L20 14 L25 10 L30 16" stroke="#C8A84B" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="15" cy="10" r="2" fill="#C8A84B"/><circle cx="20" cy="14" r="2" fill="#C8A84B"/><circle cx="25" cy="10" r="2" fill="#C8A84B"/></svg>';
  var PIECE=[null,SVG_P,SVG_A,SVG_PK,SVG_AK];
  ms(a,'<span style="color:#7ab356">&#9679;</span> You &nbsp; <span style="color:#C8A84B">&#9679;</span> AI');mm(a);
  // Directions
  var dir=document.createElement('div');
  dir.style.cssText='text-align:center;padding:0.4rem 0.8rem;margin:0.2rem auto;max-width:400px;font-family:DM Sans,sans-serif;font-size:clamp(0.6rem,1.8vw,0.75rem);color:var(--cream);line-height:1.4;opacity:0.8';
  dir.innerHTML='Tap your <strong style="color:#7ab356">seedling</strong>, then tap where to move. Jump over <strong style="color:#C8A84B">pods</strong> to capture. Reach the far side to become a <strong style="color:var(--gold)">King</strong>.';
  a.appendChild(dir);
  var gd=document.createElement('div');gd.className='ckb';gd.id='CK';a.appendChild(gd);
  var _bbs='min-height:52px;padding:0.5rem 1.2rem;font-size:clamp(.6rem,1.8vw,.75rem);flex:1';
  mc(a).innerHTML='<div style="display:flex;gap:8px;padding:4px 0"><button class="gb-new" onclick="_CKN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button></div>';
  function setup(){bd=new Array(64).fill(0);for(var r=0;r<3;r++)for(var c=0;c<8;c++)if((r+c)%2===1)bd[r*8+c]=2;for(var r=5;r<8;r++)for(var c=0;c<8;c++)if((r+c)%2===1)bd[r*8+c]=1;sel=-1;tn=1;mv=0;lastFrom=-1;lastTo=-1;mustJump=-1;gameOver=false}
  // Get valid moves for a piece
  function getMoves(pos,player){
    var r=Math.floor(pos/8),c=pos%8,p=bd[pos],moves=[],jumps=[];
    var dirs=p===3?[[-1,-1],[-1,1],[1,-1],[1,1]]:p===4?[[-1,-1],[-1,1],[1,-1],[1,1]]:player===1?[[-1,-1],[-1,1]]:[[1,-1],[1,1]];
    dirs.forEach(function(d){
      var nr=r+d[0],nc=c+d[1];
      if(nr>=0&&nr<8&&nc>=0&&nc<8){
        if(bd[nr*8+nc]===0)moves.push({f:pos,t:nr*8+nc,j:false});
        var jr=r+d[0]*2,jc=c+d[1]*2,opp=bd[nr*8+nc];
        if(jr>=0&&jr<8&&jc>=0&&jc<8&&bd[jr*8+jc]===0&&opp>0&&((player===1&&(opp===2||opp===4))||(player===2&&(opp===1||opp===3))))
          jumps.push({f:pos,t:jr*8+jc,j:true,cap:nr*8+nc});
      }
    });
    return{moves:moves,jumps:jumps};
  }
  // All moves for a player — forced jumps rule
  function allMoves(player){
    var allJ=[],allM=[];
    for(var i=0;i<64;i++){
      if((player===1&&(bd[i]===1||bd[i]===3))||(player===2&&(bd[i]===2||bd[i]===4))){
        var m=getMoves(i,player);
        allJ=allJ.concat(m.jumps);allM=allM.concat(m.moves);
      }
    }
    return allJ.length>0?allJ:allM;
  }
  function rn(){
    gd.innerHTML='';
    var validMoves=gameOver?[]:allMoves(tn);
    var selMoves=[];
    if(sel>=0)selMoves=validMoves.filter(function(m){return m.f===sel});
    var targetSquares={};selMoves.forEach(function(m){targetSquares[m.t]=m});
    for(var i=0;i<64;i++){
      var r=Math.floor(i/8),c=i%8;
      var d=document.createElement('div');
      var dark=(r+c)%2===1;
      d.className='ckc '+(dark?'ckd':'ckl')+(i===sel?' cks':'')+(targetSquares[i]?' ck-move':'')+(i===lastFrom||i===lastTo?' ck-last':'');
      d.setAttribute('data-i',i);
      if(bd[i]>0)d.innerHTML=PIECE[bd[i]];
      if(dark&&!gameOver)d.addEventListener('click',function(){onClick(parseInt(this.getAttribute('data-i')))});
      gd.appendChild(d);
    }
    checkWin();
  }
  function onClick(idx){
    if(tn!==1||gameOver)return;
    if(mustJump>=0){
      // Must continue jumping with same piece
      var jmoves=getMoves(mustJump,1).jumps;
      var hit=null;jmoves.forEach(function(m){if(m.t===idx)hit=m});
      if(hit){doMove(hit);var more=getMoves(idx,1).jumps;if(more.length>0){mustJump=idx;sel=idx;rn()}else{mustJump=-1;sel=-1;crown(idx);tn=2;rn();setTimeout(aiTurn,400)}}
      return;
    }
    if(sel<0){
      if(bd[idx]===1||bd[idx]===3){
        var vm=allMoves(1).filter(function(m){return m.f===idx});
        if(vm.length>0){sel=idx;_play('tap');rn()}
      }
    }else{
      var vm2=allMoves(1).filter(function(m){return m.f===sel});
      var hit2=null;vm2.forEach(function(m){if(m.t===idx)hit2=m});
      if(hit2){
        doMove(hit2);
        if(hit2.j){var more2=getMoves(idx,1).jumps;if(more2.length>0){mustJump=idx;sel=idx;rn();return}}
        mustJump=-1;sel=-1;crown(idx);tn=2;rn();setTimeout(aiTurn,400);
      }else if(bd[idx]===1||bd[idx]===3){sel=idx;_play('tap');rn()}
      else{sel=-1;rn()}
    }
  }
  function doMove(m){
    _play('snap');bd[m.t]=bd[m.f];bd[m.f]=0;
    lastFrom=m.f;lastTo=m.t;mv++;
    if(m.j){bd[m.cap]=0;_e('capture')}
  }
  function crown(pos){var r=Math.floor(pos/8);if(bd[pos]===1&&r===0)bd[pos]=3;if(bd[pos]===2&&r===7)bd[pos]=4}
  // AI — prefers jumps, then kings advancing, then random
  function aiTurn(){
    if(tn!==2||gameOver)return;
    var moves=allMoves(2);if(!moves.length){tn=1;rn();return}
    // Multi-jump
    var pick=moves[0];
    // Prefer jumps, then king moves, then advancing
    var jumps=moves.filter(function(m){return m.j});
    if(jumps.length){pick=jumps[Math.floor(Math.random()*jumps.length)]}
    else{
      // Score moves: prefer advancing, center, king threats
      var best=-99,candidates=[];
      moves.forEach(function(m){
        var sc=0;var tr=Math.floor(m.t/8),tc=m.t%8;
        sc+=tr;// Advance toward player side
        if(tc>1&&tc<6)sc+=1;// Center control
        if(bd[m.f]===4)sc+=2;// King mobility
        if(sc>best){best=sc;candidates=[m]}else if(sc===best)candidates.push(m);
      });
      pick=candidates[Math.floor(Math.random()*candidates.length)];
    }
    doMove(pick);crown(pick.t);
    // Multi-jump for AI
    if(pick.j){var more=getMoves(pick.t,2).jumps;if(more.length>0){setTimeout(function(){
      var pick2=more[Math.floor(Math.random()*more.length)];doMove(pick2);crown(pick2.t);tn=1;rn();
    },300);return}}
    tn=1;rn();
  }
  function checkWin(){
    if(gameOver)return;
    var p1=0,p2=0;for(var i=0;i<64;i++){if(bd[i]===1||bd[i]===3)p1++;if(bd[i]===2||bd[i]===4)p2++}
    var p1m=allMoves(1).length,p2m=allMoves(2).length;
    if(p2===0||p2m===0){gameOver=true;_e('game_win');_playWin();sm('You win! '+Math.ceil(mv/2)+' rounds');_sr('checkers',{w:true,s:mv})}
    else if(p1===0||p1m===0){gameOver=true;_e('game_loss');_play('lose');sm('AI wins');_sr('checkers',{w:false,s:0})}
  }
  window._CKN=function(){setup();sm('');rn()};_CKN();
}
// ═══ REVERSI ═══
function GRV(a){var bd=new Array(64).fill(0),tn=1,ov=false,lastMove=-1,flipCells=[];
  // SVG pieces — Player: moss (green), AI: lichen (gold)
  var SVG_MOSS='<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="#2a4a1e"/><circle cx="20" cy="20" r="13" fill="#3a6a2a"/><circle cx="20" cy="20" r="10" fill="#4a8a35"/><circle cx="16" cy="16" r="3" fill="#6ab356" opacity="0.6"/><circle cx="24" cy="18" r="2.5" fill="#7ab356" opacity="0.5"/><circle cx="20" cy="24" r="2" fill="#5a9a40" opacity="0.5"/><circle cx="14" cy="22" r="1.5" fill="#7ab356" opacity="0.4"/><circle cx="26" cy="23" r="1.8" fill="#6ab356" opacity="0.35"/></svg>';
  var SVG_LICHEN='<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="#5a4520"/><circle cx="20" cy="20" r="13" fill="#7a6530"/><circle cx="20" cy="20" r="10" fill="#9a8040"/><circle cx="17" cy="17" r="3.5" fill="#C8A84B" opacity="0.5"/><circle cx="24" cy="19" r="2.5" fill="#b8984a" opacity="0.45"/><circle cx="20" cy="25" r="2" fill="#C8A84B" opacity="0.4"/><path d="M14 20 Q16 18 18 20 Q16 22 14 20Z" fill="#C8A84B" opacity="0.3"/><path d="M24 24 Q26 22 27 24 Q25 26 24 24Z" fill="#b8984a" opacity="0.3"/></svg>';
  var SVGS=[null,SVG_MOSS,SVG_LICHEN];
  ms(a,'');mm(a);
  // Score bar
  var sb=document.createElement('div');sb.className='rv-score';sb.id='RVs';a.appendChild(sb);
  // Directions
  var dir=document.createElement('div');
  dir.style.cssText='text-align:center;padding:0.4rem 0.8rem;margin:0.2rem auto;max-width:400px;font-family:DM Sans,sans-serif;font-size:clamp(0.6rem,1.8vw,0.75rem);color:var(--cream);line-height:1.4;opacity:0.8';
  dir.innerHTML='Place <strong style="color:#7ab356">moss</strong> to surround and flip <strong style="color:#C8A84B">lichen</strong>. Outgrow the board to win.';
  a.appendChild(dir);
  var gd=document.createElement('div');gd.className='rvb';gd.id='RV';a.appendChild(gd);
  var _bbs='min-height:52px;padding:0.5rem 1.2rem;font-size:clamp(.6rem,1.8vw,.75rem);flex:1';
  mc(a).innerHTML='<div style="display:flex;gap:8px;padding:4px 0"><button class="gb-new" onclick="_RVN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button></div>';
  function setup(){bd=new Array(64).fill(0);bd[27]=2;bd[28]=1;bd[35]=1;bd[36]=2;tn=1;ov=false;lastMove=-1;flipCells=[]}
  function flips(p,pos){
    var r=Math.floor(pos/8),c=pos%8,o=p===1?2:1,all=[];
    [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(function(d){
      var f=[],nr=r+d[0],nc=c+d[1];
      while(nr>=0&&nr<8&&nc>=0&&nc<8&&bd[nr*8+nc]===o){f.push(nr*8+nc);nr+=d[0];nc+=d[1]}
      if(nr>=0&&nr<8&&nc>=0&&nc<8&&bd[nr*8+nc]===p&&f.length)all=all.concat(f);
    });
    return all;
  }
  function valid(p){var m=[];for(var i=0;i<64;i++)if(!bd[i]&&flips(p,i).length)m.push(i);return m}
  function updateScore(){
    var p1=0,p2=0;for(var i=0;i<64;i++){if(bd[i]===1)p1++;if(bd[i]===2)p2++}
    var el=document.getElementById('RVs');if(!el)return;
    el.innerHTML='<span style="color:#7ab356">&#9679; Moss: <strong>'+p1+'</strong></span>'
      +'<span style="color:var(--muted)">'+(tn===1&&!ov?'Your turn':'')+(tn===2&&!ov?'AI thinking...':'')+(ov?'Game over':'')+'</span>'
      +'<span style="color:#C8A84B">Lichen: <strong>'+p2+'</strong> &#9679;</span>';
  }
  function rn(){
    var vm=ov?[]:valid(tn);
    gd.innerHTML='';
    for(var i=0;i<64;i++){
      var d=document.createElement('div');
      d.className='rvc'+(vm.indexOf(i)>-1&&tn===1?' rvv':'')+(i===lastMove?' rv-last':'')+(flipCells.indexOf(i)>-1?' rv-flip':'');
      d.setAttribute('data-i',i);
      if(bd[i]>0)d.innerHTML=SVGS[bd[i]];
      if(tn===1&&vm.indexOf(i)>-1)d.addEventListener('click',function(){doPlay(1,parseInt(this.getAttribute('data-i')))});
      gd.appendChild(d);
    }
    updateScore();
    if(!ov&&!vm.length&&tn===1){sm('No moves — passing');tn=2;setTimeout(aiRV,500)}
    checkEnd();
  }
  function doPlay(p,pos){
    var f=flips(p,pos);if(!f.length)return;
    _play('flip');bd[pos]=p;flipCells=f.slice();f.forEach(function(i){bd[i]=p});
    lastMove=pos;
    if(p===1){
      if(f.length>=3)_e('flip');
      tn=2;rn();setTimeout(aiRV,400);
    }else{
      tn=1;rn();
    }
  }
  // AI — positional strategy: corners > edges > avoid X/C squares > maximize flips
  var CORNER=[0,7,56,63];
  var X_SQ=[9,14,49,54]; // diagonal to corners — dangerous
  var C_SQ=[1,6,8,15,48,55,57,62]; // adjacent to corners
  var EDGE=[];for(var _ei=0;_ei<64;_ei++){var _er=Math.floor(_ei/8),_ec=_ei%8;if(_er===0||_er===7||_ec===0||_ec===7)EDGE.push(_ei)}
  function aiRV(){
    if(tn!==2||ov)return;
    var vm=valid(2);
    if(!vm.length){sm('AI passes');tn=1;rn();return}
    // Score each move
    var best=-9999,pick=vm[0];
    vm.forEach(function(pos){
      var sc=flips(2,pos).length;
      if(CORNER.indexOf(pos)>-1)sc+=50;
      else if(X_SQ.indexOf(pos)>-1)sc-=25;
      else if(C_SQ.indexOf(pos)>-1)sc-=10;
      else if(EDGE.indexOf(pos)>-1)sc+=5;
      // Avoid giving corners
      var r=Math.floor(pos/8),c=pos%8;
      if(r>1&&r<6&&c>1&&c<6)sc+=2; // interior slightly preferred
      if(sc>best){best=sc;pick=pos}
    });
    doPlay(2,pick);
  }
  function checkEnd(){
    if(valid(1).length||valid(2).length)return;
    ov=true;var p1=0,p2=0;for(var i=0;i<64;i++){if(bd[i]===1)p1++;if(bd[i]===2)p2++}
    updateScore();
    if(p1>p2){_e('game_win');_playWin();sm('You win! '+p1+' \u2013 '+p2);_sr('reversi',{w:true,s:p1})}
    else if(p2>p1){_e('game_loss');_play('lose');sm('AI wins '+p2+' \u2013 '+p1);_sr('reversi',{w:false,s:p1})}
    else{sm('Draw! '+p1+' \u2013 '+p2);_sr('reversi',{w:false,s:p1})}
  }
  window._RVN=function(){setup();sm('');rn()};_RVN();
}
// ═══ MASTERMIND ═══
function GMM(a){var code=[],guesses=[],cur=[],_mmMode='color';
  var LETTERS=['A','B','C','D','E','F'];
  var NUMBERS=['1','2','3','4','5','6'];
  // 6 botanical pegs — each a unique plant element
  var PEGS=[
    {name:'Rose',fill:'#c07070',accent:'#e8a0a0',svg:'<svg viewBox="0 0 40 40"><circle cx="20" cy="18" r="11" fill="PAL" opacity="0.9"/><circle cx="20" cy="18" r="7" fill="ACC"/><circle cx="20" cy="18" r="3.5" fill="PAL"/><path d="M20 29 L20 36" stroke="#5a8a3a" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="24" cy="32" rx="4" ry="2.5" fill="#5a8a3a" opacity="0.7" transform="rotate(-20 24 32)"/></svg>'},
    {name:'Fern',fill:'#4a7c35',accent:'#7ab356',svg:'<svg viewBox="0 0 40 40"><path d="M20 36 L20 8" stroke="PAL" stroke-width="2.5" stroke-linecap="round"/><path d="M20 12 Q12 14 10 10" stroke="ACC" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M20 12 Q28 14 30 10" stroke="ACC" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M20 18 Q13 20 11 16" stroke="ACC" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M20 18 Q27 20 29 16" stroke="ACC" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M20 24 Q14 26 12 22" stroke="ACC" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M20 24 Q26 26 28 22" stroke="ACC" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M20 29 Q16 31 14 28" stroke="ACC" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M20 29 Q24 31 26 28" stroke="ACC" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>'},
    {name:'Sunflower',fill:'#C8A84B',accent:'#e8d080',svg:'<svg viewBox="0 0 40 40"><g transform="translate(20,17)"><ellipse rx="5" ry="10" fill="ACC" opacity="0.8" transform="rotate(0)"/><ellipse rx="5" ry="10" fill="ACC" opacity="0.8" transform="rotate(45)"/><ellipse rx="5" ry="10" fill="ACC" opacity="0.8" transform="rotate(90)"/><ellipse rx="5" ry="10" fill="ACC" opacity="0.8" transform="rotate(135)"/></g><circle cx="20" cy="17" r="6" fill="#6B4F2D"/><circle cx="20" cy="17" r="4" fill="PAL"/><path d="M20 27 L20 36" stroke="#5a8a3a" stroke-width="2.5" stroke-linecap="round"/></svg>'},
    {name:'Bluebell',fill:'#4a7aaa',accent:'#80b8e0',svg:'<svg viewBox="0 0 40 40"><path d="M20 8 L20 36" stroke="#5a8a3a" stroke-width="2" stroke-linecap="round"/><path d="M14 12 Q14 18 20 18" fill="PAL" opacity="0.85"/><path d="M26 12 Q26 18 20 18" fill="ACC" opacity="0.85"/><path d="M12 19 Q12 25 20 25" fill="PAL" opacity="0.7"/><path d="M28 19 Q28 25 20 25" fill="ACC" opacity="0.7"/><path d="M14 26 Q14 31 20 31" fill="PAL" opacity="0.55"/><path d="M26 26 Q26 31 20 31" fill="ACC" opacity="0.55"/></svg>'},
    {name:'Mushroom',fill:'#9b59b6',accent:'#c48de0',svg:'<svg viewBox="0 0 40 40"><rect x="16" y="22" width="8" height="14" rx="3" fill="#e8dcc8" opacity="0.8"/><ellipse cx="20" cy="22" rx="14" ry="10" fill="PAL"/><ellipse cx="20" cy="22" rx="14" ry="10" fill="ACC" opacity="0.3"/><circle cx="14" cy="18" r="2.5" fill="#e8dcc8" opacity="0.4"/><circle cx="24" cy="16" r="3" fill="#e8dcc8" opacity="0.35"/><circle cx="19" cy="14" r="1.5" fill="#e8dcc8" opacity="0.3"/></svg>'},
    {name:'Ember',fill:'#c76a30',accent:'#e8a060',svg:'<svg viewBox="0 0 40 40"><path d="M20 6 Q28 16 24 24 Q28 20 26 14 Q30 22 24 30 Q22 34 20 36 Q18 34 16 30 Q10 22 14 14 Q12 20 16 24 Q12 16 20 6Z" fill="PAL" opacity="0.9"/><path d="M20 14 Q24 20 22 26 Q20 30 20 32 Q20 30 18 26 Q16 20 20 14Z" fill="ACC" opacity="0.8"/><circle cx="20" cy="24" r="3" fill="#e8dcc8" opacity="0.5"/></svg>'}
  ];
  function pegSvg(idx){var p=PEGS[idx];
    if(_mmMode==='letter')return '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:Bebas Neue,sans-serif;font-size:clamp(1.2rem,4vw,1.6rem);font-weight:700;color:'+p.fill+';text-shadow:0 1px 3px rgba(0,0,0,0.5)">'+LETTERS[idx]+'</div>';
    if(_mmMode==='number')return '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:Bebas Neue,sans-serif;font-size:clamp(1.2rem,4vw,1.6rem);font-weight:700;color:'+p.fill+';text-shadow:0 1px 3px rgba(0,0,0,0.5)">'+NUMBERS[idx]+'</div>';
    return p.svg.replace(/PAL/g,p.fill).replace(/ACC/g,p.accent)}
  ms(a,'Guesses: <strong id="MMg">0</strong>/10');mm(a);
  // Directions
  var dir=document.createElement('div');
  dir.style.cssText='text-align:center;padding:0.5rem 0.8rem;margin:0.3rem auto;max-width:380px;font-family:DM Sans,sans-serif;font-size:clamp(0.65rem,2vw,0.8rem);color:var(--cream);line-height:1.5;opacity:0.85';
  dir.innerHTML='Crack the hidden <strong style="color:var(--gold)">4-seed code</strong>. Pick seeds below, then tap <strong>GUESS</strong>.<br><span style="display:inline-flex;align-items:center;gap:4px;margin-top:4px"><span class="mm-fb-dot exact" style="display:inline-block;width:12px;height:12px"></span> = right seed, right spot</span> &nbsp; <span style="display:inline-flex;align-items:center;gap:4px"><span class="mm-fb-dot close" style="display:inline-block;width:12px;height:12px"></span> = right seed, wrong spot</span>';
  a.appendChild(dir);
  var bd=document.createElement('div');bd.className='mm-board';bd.id='MMb';a.appendChild(bd);
  var cur_d=document.createElement('div');cur_d.className='mm-cur';cur_d.id='MMc';a.appendChild(cur_d);
  var pal=document.createElement('div');pal.className='mm-pal';
  PEGS.forEach(function(p,i){
    var d=document.createElement('div');d.className='mmp';
    d.style.cssText='background:rgba(26,36,22,.8);border-color:'+p.fill;
    d.innerHTML=pegSvg(i);
    d.addEventListener('click',function(){_MMA(i)});
    pal.appendChild(d);
  });
  a.appendChild(pal);
  var _bbs='min-height:52px;padding:0.5rem 1.2rem;font-size:clamp(.6rem,1.8vw,.75rem);flex:1';
  mc(a).innerHTML='<div style="display:flex;gap:8px;padding:4px 0;flex-wrap:wrap;justify-content:center"><button class="gb" style="'+_bbs+';background:rgba(74,124,53,.2);border-color:rgba(122,179,86,.35);color:var(--sage)" onclick="_MMG()">&#10003; GUESS</button><button class="gb" style="'+_bbs+'" onclick="_MMU()">&#9003; UNDO</button><button class="gb" style="'+_bbs+'" onclick="_MMMode()" id="MMmode">MODE: COLOR</button><button class="gb-new" onclick="_MMN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button></div>';
  function rn(){
    bd.innerHTML='';
    guesses.forEach(function(g){
      var row=document.createElement('div');row.className='mmr';
      g.guess.forEach(function(c){
        var d=document.createElement('div');d.className='mmp';
        d.style.cssText='background:rgba(26,36,22,.8);border-color:'+PEGS[c].fill;
        d.innerHTML=pegSvg(c);row.appendChild(d);
      });
      // Feedback dots
      var fb=document.createElement('div');fb.className='mm-fb';
      for(var i=0;i<g.exact;i++){var dot=document.createElement('div');dot.className='mm-fb-dot exact';fb.appendChild(dot)}
      for(var i=0;i<g.close;i++){var dot=document.createElement('div');dot.className='mm-fb-dot close';fb.appendChild(dot)}
      for(var i=0;i<4-g.exact-g.close;i++){var dot=document.createElement('div');dot.className='mm-fb-dot miss';fb.appendChild(dot)}
      row.appendChild(fb);
      bd.appendChild(row);
    });
    bd.scrollTop=bd.scrollHeight;
    rnC();
  }
  function rnC(){
    cur_d.innerHTML='';
    for(var i=0;i<4;i++){
      var d=document.createElement('div');d.className='mmp';
      if(cur[i]!==undefined){
        d.style.cssText='background:rgba(26,36,22,.8);border-color:'+PEGS[cur[i]].fill+';cursor:pointer';
        d.innerHTML=pegSvg(cur[i]);
      }else{
        d.style.cssText='background:rgba(26,36,22,.6);border-color:rgba(74,124,53,.2);cursor:pointer';
        d.innerHTML='<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="4" fill="rgba(200,188,160,.15)"/></svg>';
      }
      d.setAttribute('data-i',i);
      d.addEventListener('click',function(){_MMT(parseInt(this.getAttribute('data-i')))});
      cur_d.appendChild(d);
    }
  }
  window._MMA=function(c){_play('tap');if(cur.length<4)cur.push(c);rnC()};
  window._MMT=function(i){if(cur[i]!==undefined){_play('tap');cur[i]=(cur[i]+1)%6;rnC()}};
  window._MMU=function(){if(cur.length>0){_play('tap');cur.pop();rnC()}};
  window._MMG=function(){if(cur.length!==4){sm('Place 4 seeds first');return}
    _play('snap');
    var exact=0,close=0,cc=code.slice(),gc=cur.slice();
    for(var i=0;i<4;i++)if(gc[i]===cc[i]){exact++;cc[i]=-1;gc[i]=-2}
    for(var i=0;i<4;i++){if(gc[i]<0)continue;var j=cc.indexOf(gc[i]);if(j>-1){close++;cc[j]=-1}}
    guesses.push({guess:cur.slice(),exact:exact,close:close});cur=[];
    document.getElementById('MMg').textContent=guesses.length;
    if(exact>0)_e('progress');
    if(exact===4){_e('game_win');_playWin();sm('Cracked in '+guesses.length+'!');_sr('mastermind',{w:true,s:guesses.length})}
    else if(guesses.length>=10){_e('game_loss');sm('The code was: '+code.map(function(c){return PEGS[c].name}).join(' \u2022 '));_sr('mastermind',{w:false,s:0})}
    rn();
  };
  window._MMMode=function(){_mmMode=_mmMode==='color'?'letter':_mmMode==='letter'?'number':'color';var btn=document.getElementById('MMmode');if(btn)btn.textContent='MODE: '+_mmMode.toUpperCase();_play('tap');pal.innerHTML='';PEGS.forEach(function(p,i){var d=document.createElement('div');d.className='mmp';d.style.cssText='background:rgba(26,36,22,.8);border-color:'+p.fill;d.innerHTML=pegSvg(i);d.addEventListener('click',function(){_MMA(i)});pal.appendChild(d)});rn()};
  window._MMN=function(){code=[];for(var i=0;i<4;i++)code.push(Math.floor(Math.random()*6));guesses=[];cur=[];document.getElementById('MMg').textContent='0';sm('');rn()};_MMN();
}
// ═══ FLOOD FILL ═══
function GCS(a){var tubes=[],numT=7,cap=4,sel=-1;var COLS=['#4a7c35','#C8A84B','#4a7aaa','#c76a30','#9b59b6'];
  ms(a,'');mm(a);var tw=document.createElement('div');tw.className='csw';tw.id='CS';a.appendChild(tw);mc(a).innerHTML='<button class="gb-new" onclick="_CSN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';
  function gen(){var colors=[];for(var c=0;c<5;c++)for(var i=0;i<cap;i++)colors.push(c);sh(colors);tubes=[];for(var t=0;t<5;t++){tubes[t]=[];for(var i=0;i<cap;i++)tubes[t].push(colors[t*cap+i])}tubes.push([]);tubes.push([]);sel=-1}
  function rn(){tw.innerHTML='';tubes.forEach(function(tube,ti){var t=document.createElement('div');t.className='cst'+(ti===sel?' cssel':'');t.setAttribute('data-t',ti);t.onclick=function(){var idx=parseInt(this.getAttribute('data-t'));
    if(sel<0){if(tubes[idx].length)sel=idx;rn()}else{if(sel===idx){sel=-1;rn();return}if(tubes[idx].length>=cap){sel=-1;rn();return}if(tubes[idx].length&&tubes[idx][tubes[idx].length-1]!==tubes[sel][tubes[sel].length-1]){sel=-1;rn();return}tubes[idx].push(tubes[sel].pop());sel=-1;rn();chk()}};
    for(var i=0;i<tube.length;i++){var l=document.createElement('div');l.className='csl';l.style.background=COLS[tube[i]];t.appendChild(l)}tw.appendChild(t)})}
  function chk(){var complete=0;tubes.forEach(function(t){if(t.length===cap&&t.every(function(c){return c===t[0]}))complete++;});var done=tubes.every(function(t){return t.length===0||t.length===cap&&t.every(function(c){return c===t[0]})});if(complete>0&&!done)_e('progress');if(done){_e('game_win');_playWin();sm('🌿 Sorted!');_sr('colorsort',{w:true,s:1})}}
  window._CSN=function(){gen();sm('');rn()};_CSN();}
// ═══ BATTLESHIP — Deep Water ═══
function GBS(a){
  var SZ=8,SHIPS=[4,3,3,2,2],SHIP_NAMES=['Vine','Root','Branch','Sprout','Seed'];
  var pGrid,eGrid,phase,selShip,placements,shipDirs,gameOver,turn,aiStack,aiHits;
  ms(a,'<span id="BSph">Place your fleet</span>');mm(a);
  var wrap=document.createElement('div');wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:8px;padding:4px';a.appendChild(wrap);
  var lbl=document.createElement('div');lbl.id='BSlbl';lbl.style.cssText='font-family:DM Mono,monospace;font-size:0.75rem;color:var(--muted);text-align:center;min-height:1.4em;width:100%';wrap.appendChild(lbl);
  var grids=document.createElement('div');grids.style.cssText='display:flex;gap:clamp(8px,3vw,16px);justify-content:center;flex-wrap:wrap';wrap.appendChild(grids);
  mc(a).innerHTML='<button class="gb" id="BSdir" onclick="_BSR()" style="min-width:86px">↻ Rotate</button> <button class="gb" id="BSready" onclick="_BSready()" style="min-width:104px;background:rgba(74,124,53,0.28);opacity:0.4" disabled>✓ I\'M READY</button> <button class="gb-new" onclick="_BSN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  function mkGrid(){return new Array(SZ*SZ).fill(0)}
  function idx(r,c){return r*SZ+c}
  function canPlace(grid,r,c,len,dir){
    for(var k=0;k<len;k++){var cr=dir==='h'?r:r+k;var cc=dir==='h'?c+k:c;if(cr>=SZ||cc>=SZ||grid[idx(cr,cc)]!==0)return false}return true
  }
  function placeShip(grid,r,c,len,dir,id){
    for(var k=0;k<len;k++){var cr=dir==='h'?r:r+k;var cc=dir==='h'?c+k:c;grid[idx(cr,cc)]=id}
  }
  function clearShip(grid,r,c,len,dir){
    for(var k=0;k<len;k++){var cr=dir==='h'?r:r+k;var cc=dir==='h'?c+k:c;grid[idx(cr,cc)]=0}
  }
  function autoPlace(grid){
    for(var si=0;si<SHIPS.length;si++){
      for(var att=0;att<200;att++){var dir=Math.random()<.5?'h':'v';var r=Math.floor(Math.random()*SZ);var c=Math.floor(Math.random()*SZ);
        if(canPlace(grid,r,c,SHIPS[si],dir)){placeShip(grid,r,c,SHIPS[si],dir,si+1);break}}
    }
  }
  function countAlive(grid,id){var n=0;for(var i=0;i<SZ*SZ;i++)if(grid[i]===id)n++;return n}
  function allSunk(grid,shipList){for(var si=0;si<shipList.length;si++)if(countAlive(grid,si+1)>0)return false;return true}
  function allPlaced(){for(var si=0;si<SHIPS.length;si++)if(!placements[si])return false;return true}

  function renderGrid(grid,target,isEnemy,onClick){
    var g=document.createElement('div');
    g.style.cssText='display:inline-block;text-align:center';
    var title=document.createElement('div');title.style.cssText='font-family:Bebas Neue,sans-serif;font-size:0.7rem;color:'+(isEnemy?'var(--gold)':'var(--sage)')+';letter-spacing:0.1em;margin-bottom:4px';
    title.textContent=isEnemy?'ENEMY WATERS':'YOUR FLEET';g.appendChild(title);
    var gridW=phase==='place'?'clamp(260px,80vw,360px)':'clamp(160px,42vw,220px)';
    var tbl=document.createElement('div');tbl.style.cssText='display:grid;grid-template-columns:repeat('+SZ+',1fr);gap:1px;background:rgba(74,124,53,0.08);border:1.5px solid rgba(74,124,53,0.15);border-radius:6px;overflow:hidden;width:'+gridW;
    for(var i=0;i<SZ*SZ;i++){
      var d=document.createElement('div');var v=grid[i];
      d.style.cssText='aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:clamp(0.55rem,1.6vw,0.75rem);cursor:'+(onClick?'pointer':'default')+';transition:background 0.15s;';
      if(v===-2){d.style.background='rgba(199,80,80,0.5)';d.textContent='💥';}
      else if(v===-1){d.style.background='rgba(40,50,38,0.6)';d.textContent='·';d.style.color='rgba(122,179,86,0.3)';}
      else if(!isEnemy&&v>0){d.style.background='rgba(74,124,53,0.45)';d.style.borderRadius='2px';d.style.border='1px solid rgba(122,179,86,0.5)';d.textContent='■';d.style.color='rgba(122,179,86,0.7)';d.style.fontSize='clamp(0.4rem,1.2vw,0.55rem)';}
      else{d.style.background='rgba(18,24,16,0.7)';}
      if(onClick){d.setAttribute('data-i',String(i));d.onclick=onClick;}
      tbl.appendChild(d);
    }
    g.appendChild(tbl);target.appendChild(g);
  }

  // Pick a placed ship back up (remove from grid, set as selected)
  function pickUp(si){
    var pl=placements[si];if(!pl)return;
    clearShip(pGrid,pl.r,pl.c,SHIPS[si],pl.dir);
    delete placements[si];
    selShip=si;
  }

  function renderFleetTray(){
    var h='<div style="font-family:Bebas Neue,sans-serif;font-size:0.75rem;color:var(--gold);letter-spacing:0.1em;margin-bottom:6px;text-align:center">FLEET</div>';
    h+='<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:6px">';
    for(var si=0;si<SHIPS.length;si++){
      var isPlaced=!!placements[si];
      var isSel=selShip===si;
      var dir=shipDirs[si];
      var len=SHIPS[si];
      var bg=isSel?'rgba(200,168,75,0.28)':isPlaced?'rgba(74,124,53,0.12)':'rgba(122,179,86,0.18)';
      var border=isSel?'2px solid #c8a84b':isPlaced?'1.5px solid rgba(74,124,53,0.4)':'1.5px solid rgba(122,179,86,0.5)';
      var op=(isPlaced&&!isSel)?'0.6':'1';
      h+='<div onclick="_BSsel('+si+')" style="background:'+bg+';border:'+border+';border-radius:8px;padding:5px 8px;opacity:'+op+';cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:50px;-webkit-tap-highlight-color:transparent">';
      h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.62rem;color:var(--cream);letter-spacing:0.05em">'+SHIP_NAMES[si]+'</div>';
      h+='<div style="display:flex;'+(dir==='v'?'flex-direction:column;':'')+'gap:1px">';
      for(var k=0;k<len;k++)h+='<div style="width:9px;height:9px;background:'+(isPlaced&&!isSel?'rgba(74,124,53,0.45)':'rgba(122,179,86,0.7)')+';border:1px solid rgba(122,179,86,0.85);border-radius:1px"></div>';
      h+='</div>';
      h+='<div style="font-size:0.42rem;color:'+(isPlaced?'var(--sage)':'var(--muted)')+';letter-spacing:0.04em">'+(isPlaced?'✓ placed':isSel?'selected':'tap')+'</div>';
      h+='</div>';
    }
    h+='</div>';
    return h;
  }

  function rn(){
    grids.innerHTML='';
    var dirBtn=document.getElementById('BSdir');
    var readyBtn=document.getElementById('BSready');
    if(phase==='place'){
      if(dirBtn)dirBtn.style.display='';
      if(readyBtn)readyBtn.style.display='';
      var tray=renderFleetTray();
      var instr='';
      if(selShip>=0){
        instr='<div style="font-family:DM Sans,sans-serif;font-size:0.6rem;color:var(--cream);line-height:1.4">Tap the grid to place <strong style="color:var(--gold)">'+SHIP_NAMES[selShip]+'</strong> — direction <strong style="color:var(--sage)">'+(shipDirs[selShip]==='h'?'→ Horizontal':'↓ Vertical')+'</strong></div>';
      } else if(allPlaced()){
        instr='<div style="font-family:Bebas Neue,sans-serif;font-size:0.75rem;color:var(--sage);letter-spacing:0.08em">ALL PLACED — TAP "I\'M READY" TO BATTLE</div>';
      } else {
        instr='<div style="font-family:DM Sans,sans-serif;font-size:0.55rem;color:var(--muted);line-height:1.4">Tap a ship above to pick it up, then tap the grid. Tap a placed ship to move it.</div>';
      }
      lbl.innerHTML=tray+instr;
      lbl.style.minHeight='';
      if(readyBtn){
        if(allPlaced()){readyBtn.disabled=false;readyBtn.style.opacity='1';}
        else{readyBtn.disabled=true;readyBtn.style.opacity='0.4';}
      }
      renderGrid(pGrid,grids,false,function(){
        var i=parseInt(this.getAttribute('data-i'));
        var r=Math.floor(i/SZ),c=i%SZ;
        var cellVal=pGrid[i];
        // Clicked a placed ship cell → pick it up
        if(cellVal>0){
          pickUp(cellVal-1);
          _play('tap');
          rn();
          return;
        }
        // Empty cell + a ship selected → place there
        if(selShip>=0){
          var len=SHIPS[selShip];
          var dir=shipDirs[selShip];
          if(!canPlace(pGrid,r,c,len,dir)){sm('No room — rotate or pick another spot');return;}
          placeShip(pGrid,r,c,len,dir,selShip+1);
          placements[selShip]={r:r,c:c,dir:dir};
          _play('tap');
          selShip=-1;
          rn();
          return;
        }
        // Empty cell, nothing selected
        sm('Pick a ship from the fleet first');
      });
    }else{
      if(dirBtn)dirBtn.style.display='none';
      if(readyBtn)readyBtn.style.display='none';
      lbl.innerHTML='';
      lbl.style.minHeight='';
      // Enemy grid — player shoots here
      renderGrid(eGrid,grids,true,turn==='player'&&!gameOver?function(){
        var i=parseInt(this.getAttribute('data-i'));if(eGrid[i]<0)return;
        if(eGrid[i]>0){eGrid[i]=-2;_play('snap');sm('💥 Hit!');
          if(allSunk(eGrid,SHIPS)){gameOver=true;sm('🌿 All sunk! You win!');_e('game_win');_playWin();_sr('battleship',{w:true,s:1});rn();return}
        }else{eGrid[i]=-1;_play('tap');sm('· Miss');}
        turn='ai';rn();setTimeout(aiTurn,600);
      }:null);
      // Player grid — shows AI shots
      renderGrid(pGrid,grids,false,null);
    }
  }

  function aiTurn(){
    if(gameOver)return;
    var target=-1;
    // Hunt mode — follow up on hits
    if(aiStack.length>0){
      while(aiStack.length>0){var t=aiStack.pop();if(pGrid[t]>=0){target=t;break}}
    }
    if(target<0){
      var open=[];for(var i=0;i<SZ*SZ;i++)if(pGrid[i]>=0)open.push(i);
      if(!open.length){turn='player';rn();return}
      // Checkerboard pattern for smarter random shots
      var checks=open.filter(function(i){return(Math.floor(i/SZ)+i%SZ)%2===0});
      var pool=checks.length>0?checks:open;
      target=pool[Math.floor(Math.random()*pool.length)];
    }
    var r=Math.floor(target/SZ),c=target%SZ;
    if(pGrid[target]>0){
      pGrid[target]=-2;sm('💥 Enemy hit your '+SHIP_NAMES[0]+'!');
      aiHits.push(target);
      // Add adjacent cells to hunt stack
      var adj=[[r-1,c],[r+1,c],[r,c-1],[r,c+1]];
      for(var j=0;j<adj.length;j++){var ar=adj[j][0],ac=adj[j][1];if(ar>=0&&ar<SZ&&ac>=0&&ac<SZ){var ai=idx(ar,ac);if(pGrid[ai]>=0)aiStack.push(ai)}}
      if(allSunk(pGrid,SHIPS)){gameOver=true;sm('🍂 Fleet sunk — you lose');_e('game_loss');_sr('battleship',{w:false,s:0});rn();return}
    }else{pGrid[target]=-1;}
    turn='player';document.getElementById('BSph').innerHTML='Your turn';rn();
  }

  window._BSR=function(){
    if(selShip<0){sm('Pick a ship to rotate');return;}
    var newDir=shipDirs[selShip]==='h'?'v':'h';
    shipDirs[selShip]=newDir;
    sm('Rotated: '+(newDir==='h'?'Horizontal →':'Vertical ↓'));
    rn();
  };
  window._BSsel=function(si){
    if(phase!=='place')return;
    if(placements[si]){pickUp(si);_play('tap');rn();return;}
    selShip=(selShip===si)?-1:si;
    _play('tap');
    rn();
  };
  window._BSready=function(){
    if(phase!=='place')return;
    if(!allPlaced()){sm('Place all ships first');return;}
    phase='battle';turn='player';selShip=-1;
    document.getElementById('BSph').innerHTML='Your turn — tap enemy grid';
    _play('win');
    rn();
  };
  window._BSN=function(){
    pGrid=mkGrid();eGrid=mkGrid();phase='place';
    selShip=-1;placements={};shipDirs=['h','h','h','h','h'];
    gameOver=false;turn='player';aiStack=[];aiHits=[];
    autoPlace(eGrid);
    document.getElementById('BSph').innerHTML='Place your fleet';sm('');rn();
  };_BSN();
}
// ═══ SOKOBAN — GARDEN PATH ═══
function GSK(a){
  // ── TILE ART (PNG preferred, SVG fallback) ──
  // Drop PNGs in assets/games/sokoban/ to auto-reskin. See README.txt in that folder.
  var SVG={
    player:'<svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="4" fill="#8B6B3D"/><ellipse cx="24" cy="22" rx="10" ry="9" fill="#e8a050"/><ellipse cx="24" cy="30" rx="8" ry="7" fill="#d4903a"/><polygon points="15,16 12,6 18,13" fill="#e8a050"/><polygon points="33,16 36,6 30,13" fill="#e8a050"/><polygon points="15,16 13,8 17,14" fill="#f0b870" opacity="0.6"/><polygon points="33,16 35,8 31,14" fill="#f0b870" opacity="0.6"/><circle cx="20" cy="20" r="2.5" fill="#2a1a0a"/><circle cx="28" cy="20" r="2.5" fill="#2a1a0a"/><circle cx="21" cy="19.5" r="0.8" fill="#fff"/><circle cx="29" cy="19.5" r="0.8" fill="#fff"/><ellipse cx="24" cy="24" rx="2" ry="1.2" fill="#d47a7a"/><line x1="10" y1="22" x2="4" y2="20" stroke="#e8a050" stroke-width="1" opacity="0.6"/><line x1="10" y1="24" x2="4" y2="25" stroke="#e8a050" stroke-width="1" opacity="0.6"/><line x1="38" y1="22" x2="44" y2="20" stroke="#e8a050" stroke-width="1" opacity="0.6"/><line x1="38" y1="24" x2="44" y2="25" stroke="#e8a050" stroke-width="1" opacity="0.6"/><ellipse cx="24" cy="40" rx="6" ry="2" fill="rgba(0,0,0,0.15)"/></svg>',
    crate:'<svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="4" fill="#8B6B3D"/><circle cx="24" cy="24" r="12" fill="#7ab356"/><circle cx="24" cy="24" r="9" fill="#5a9a36"/><path d="M24 15 Q20 20 24 24 Q28 20 24 15Z" fill="#4a8a26"/><path d="M24 24 Q18 22 15 24 Q18 26 24 24Z" fill="#4a8a26"/><path d="M24 24 Q30 22 33 24 Q30 26 24 24Z" fill="#4a8a26"/><circle cx="24" cy="24" r="3" fill="#8BC34A" opacity="0.5"/></svg>',
    planted:'<svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="4" fill="#c8a84b" opacity="0.25"/><rect x="4" y="4" width="40" height="40" rx="4" fill="none" stroke="#c8a84b" stroke-width="2.5"/><circle cx="24" cy="24" r="12" fill="#7ab356"/><circle cx="24" cy="24" r="9" fill="#5a9a36"/><path d="M24 15 Q20 20 24 24 Q28 20 24 15Z" fill="#4a8a26"/><circle cx="24" cy="24" r="3" fill="#c8a84b"/><circle cx="24" cy="24" r="14" fill="#c8a84b" opacity="0.08"/></svg>',
    target:'<svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="4" fill="#2A2018"/><ellipse cx="24" cy="26" rx="14" ry="10" fill="#3a2a1a"/><ellipse cx="24" cy="25" rx="12" ry="8" fill="#5C4033"/><ellipse cx="24" cy="24" rx="8" ry="5" fill="#6B4F2D"/><ellipse cx="24" cy="23.5" rx="4" ry="2.5" fill="#8B6B3D" opacity="0.5"/></svg>',
    wall:'<svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="4" fill="#2f4a24"/><rect x="6" y="6" width="36" height="36" rx="3" fill="#4a7c35" stroke="#5a8a3a" stroke-width="2"/></svg>',
    floor:'<svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="4" fill="#6B4F2D"/><rect x="6" y="6" width="36" height="36" rx="3" fill="#8B6B3D"/></svg>',
    playerOnTarget:'<svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="4" fill="#2A2018"/><ellipse cx="24" cy="26" rx="14" ry="10" fill="#3a2a1a"/><ellipse cx="24" cy="25" rx="12" ry="8" fill="#5C4033"/><ellipse cx="24" cy="22" rx="10" ry="9" fill="#e8a050"/><ellipse cx="24" cy="30" rx="8" ry="7" fill="#d4903a"/><polygon points="15,16 12,6 18,13" fill="#e8a050"/><polygon points="33,16 36,6 30,13" fill="#e8a050"/><circle cx="20" cy="20" r="2.5" fill="#2a1a0a"/><circle cx="28" cy="20" r="2.5" fill="#2a1a0a"/><ellipse cx="24" cy="24" rx="2" ry="1.2" fill="#d47a7a"/></svg>'
  };
  window._SKSVG=SVG;
  // Map logical tile key → PNG filename (kebab-case)
  var PNG={player:'player',crate:'crate',planted:'planted',target:'target',wall:'wall',floor:'floor',playerOnTarget:'player-on-target'};
  function tile(k){
    return '<img src="assets/games/sokoban/'+PNG[k]+'.png" alt="" draggable="false" '
      +'style="width:100%;height:100%;object-fit:contain;display:block;pointer-events:none;-webkit-user-drag:none" '
      +'onerror="this.onerror=null;this.outerHTML=window._SKSVG.'+k+'"/>';
  }
  var ART={
    player:tile('player'),crate:tile('crate'),planted:tile('planted'),
    target:tile('target'),wall:tile('wall'),floor:tile('floor'),
    playerOnTarget:tile('playerOnTarget')
  };
  // ── 170 LEVELS — Classic Microban + curated collections, all verified solvable ──
  var LEVELS=[
    /* 1. Microban */ {w:5,h:3,map:'#####'+'#@OX#'+'#####'},
    /* 2. ExtremelyEasy */ {w:5,h:3,map:'#####'+'#XO@#'+'#####'},
    /* 3. ExtremelyEasy */ {w:7,h:3,map:'#######'+'#XO@OX#'+'#######'},
    /* 4. Illustrative */ {w:6,h:6,map:'..####'+'..#..#'+'###..#'+'#+*O.#'+'#...##'+'#####.'},
    /* 5. Illustrative */ {w:7,h:8,map:'#####..'+'#...###'+'#.....#'+'#.#.#.#'+'#.#.#.#'+'#+O.#.#'+'#.....#'+'#######'},
    /* 6. Illustrative */ {w:8,h:7,map:'########'+'########'+'##.+O.##'+'##.##.##'+'##....##'+'########'+'########'},
    /* 7. Microban */ {w:6,h:7,map:'####..'+'#.X#..'+'#..###'+'#*@..#'+'#..O.#'+'#..###'+'####..'},
    /* 8. Microban */ {w:6,h:7,map:'#####.'+'#X..##'+'#@OO.#'+'##...#'+'.##..#'+'..##X#'+'...###'},
    /* 9. Microban */ {w:7,h:6,map:'#######'+'#.....#'+'#.#.#.#'+'#X.O*@#'+'#...###'+'#####..'},
    /* 10. Microban */ {w:7,h:6,map:'####...'+'#..####'+'#.X.X.#'+'#.OO#@#'+'##....#'+'.######'},
    /* 11. Microban */ {w:7,h:6,map:'#####..'+'#...###'+'#..O..#'+'##*.X.#'+'.#...@#'+'.######'},
    /* 12. Microban */ {w:7,h:7,map:'#######'+'#..*..#'+'#.....#'+'##.#.##'+'.#O@X#.'+'.#...#.'+'.#####.'},
    /* 13. Microban */ {w:7,h:7,map:'#.#####'+'..#...#'+'###OO@#'+'#...###'+'#.....#'+'#.X.X.#'+'#######'},
    /* 14. Microban */ {w:7,h:7,map:'######.'+'#...X#.'+'#.##.##'+'#..OO@#'+'#.#...#'+'#X..###'+'#####..'},
    /* 15. Microban */ {w:7,h:7,map:'#####..'+'#...#..'+'#.@.#..'+'#.OO###'+'##X.X.#'+'.#....#'+'.######'},
    /* 16. ExtremelyEasy */ {w:7,h:5,map:'..###..'+'..#X#..'+'###O###'+'#XO@OX#'+'#######'},
    /* 17. Illustrative */ {w:6,h:6,map:'######'+'#X+O.#'+'#O*..#'+'#....#'+'##..##'+'.####.'},
    /* 18. Microban */ {w:9,h:6,map:'..####...'+'###..####'+'#.....O.#'+'#.#..#O.#'+'#.X.X#@.#'+'#########'},
    /* 19. Microban */ {w:7,h:8,map:'.######'+'##....#'+'#..##.#'+'#.#.O.#'+'#..*.X#'+'##.#@##'+'.#...#.'+'.#####.'},
    /* 20. Microban */ {w:8,h:7,map:'####....'+'#..###..'+'#....###'+'#..O*@.#'+'###.X#.#'+'..#....#'+'..######'},
    /* 21. Microban */ {w:6,h:7,map:'######'+'#....#'+'#.#@.#'+'#.O*.#'+'#.X*.#'+'#....#'+'######'},
    /* 22. Microban */ {w:6,h:7,map:'#####.'+'#.@.#.'+'#XXX#.'+'#OOO##'+'#....#'+'#....#'+'######'},
    /* 23. Microban */ {w:6,h:7,map:'####..'+'#..###'+'#.OO.#'+'#XXX.#'+'#.@O.#'+'#...##'+'#####.'},
    /* 24. Microban */ {w:7,h:6,map:'.#####.'+'.#...#.'+'##...##'+'#.OOO.#'+'#.X+X.#'+'#######'},
    /* 25. Microban */ {w:6,h:7,map:'######'+'#XXX.#'+'#..O.#'+'#.#O##'+'#..O.#'+'#..@.#'+'######'},
    /* 26. Microban */ {w:8,h:6,map:'########'+'#......#'+'#.X**O@#'+'#......#'+'#####..#'+'....####'},
    /* 27. Microban */ {w:9,h:7,map:'.....###.'+'######@##'+'#....X*.#'+'#...#...#'+'#####O#.#'+'....#...#'+'....#####'},
    /* 28. Microban */ {w:7,h:9,map:'#######'+'#.....#'+'#X.X..#'+'#.##.##'+'#..O.#.'+'###O.#.'+'..#@.#.'+'..#..#.'+'..####.'},
    /* 29. Microban */ {w:7,h:9,map:'#####..'+'#...###'+'#X.X..#'+'#...#.#'+'##.#..#'+'.#@OO.#'+'.#....#'+'.#..###'+'.####..'},
    /* 30. Microban */ {w:6,h:8,map:'.#####'+'.#.@.#'+'.#...#'+'###O.#'+'#.XXX#'+'#.OO.#'+'###..#'+'..####'},
    /* 31. Microban */ {w:8,h:6,map:'#######.'+'#.....#.'+'#@OOO.##'+'#..#XXX#'+'##....##'+'.######.'},
    /* 32. Microban */ {w:8,h:8,map:'########'+'#...XX.#'+'#..@OO.#'+'#####.##'+'...#..#.'+'...#..#.'+'...#..#.'+'...####.'},
    /* 33. Microban */ {w:7,h:7,map:'.####..'+'.#..###'+'.#.OO.#'+'##XXX.#'+'#..@O.#'+'#...###'+'#####..'},
    /* 34. Microban */ {w:7,h:7,map:'..####.'+'.##..#.'+'##@OX##'+'#.OO..#'+'#.X.X.#'+'###...#'+'..#####'},
    /* 35. Microban */ {w:7,h:7,map:'.####..'+'##..###'+'#.....#'+'#X**O@#'+'#...###'+'##..#..'+'.####..'},
    /* 36. Microban */ {w:7,h:7,map:'#######'+'#X.#..#'+'#..O..#'+'#X.O#@#'+'#..O..#'+'#X.#..#'+'#######'},
    /* 37. Microban */ {w:7,h:7,map:'####...'+'#..####'+'#X*O..#'+'#.XO#.#'+'##.@..#'+'.#...##'+'.#####.'},
    /* 38. Microban */ {w:6,h:9,map:'.#####'+'.#...#'+'.#.X.#'+'##.*.#'+'#..*##'+'#..@##'+'##.O.#'+'.#...#'+'.#####'},
    /* 39. Microban */ {w:10,h:7,map:'..####....'+'###..#####'+'#..O..@XX#'+'#.O....#.#'+'###.####.#'+'..#......#'+'..########'},
    /* 40. Microban */ {w:7,h:8,map:'...####'+'...#..#'+'...#@.#'+'####OX#'+'#...OX#'+'#.#.OX#'+'#....##'+'######.'},
    /* 41. Microban */ {w:7,h:8,map:'#####..'+'#...##.'+'#.#..#.'+'#@O*X##'+'##..X.#'+'.#.O#.#'+'.##...#'+'..#####'},
    /* 42. Microban */ {w:9,h:8,map:'..######.'+'..#....#.'+'..#.##@##'+'###.#.O.#'+'#.XX#.O.#'+'#.......#'+'#..######'+'####.....'},
    /* 43. Microban */ {w:9,h:8,map:'#####....'+'#...##...'+'#.O..#...'+'##.O.####'+'.###@X..#'+'..#..X#.#'+'..#.....#'+'..#######'},
    /* 44. Microban */ {w:9,h:8,map:'#######..'+'#.....###'+'#..@OOXX#'+'####.##.#'+'..#.....#'+'..#..####'+'..#..#...'+'..####...'},
    /* 45. Microban */ {w:8,h:9,map:'..####..'+'..#..#..'+'..#@.#..'+'..#..#..'+'###.####'+'#....*.#'+'#..O...#'+'#####X.#'+'....####'},
    /* 46. Microban */ {w:10,h:6,map:'.#########'+'.#....#..#'+'##.O#O#..#'+'#..XOX@..#'+'#..X#....#'+'##########'},
    /* 47. Microban */ {w:11,h:7,map:'..#######..'+'###.....#..'+'#.O.O...#..'+'#.###.#####'+'#.@.X.X...#'+'#...###...#'+'#####.#####'},
    /* 48. Microban */ {w:7,h:9,map:'####...'+'#X.##..'+'#X@.#..'+'#X.O#..'+'##O.###'+'.#.O..#'+'.#....#'+'.#..###'+'.####..'},
    /* 49. Microban */ {w:6,h:8,map:'..####'+'###.@#'+'#..O.#'+'#..*X#'+'#..*X#'+'#..O.#'+'###..#'+'..####'},
    /* 50. Microban */ {w:8,h:8,map:'######..'+'#..@.#..'+'#..#.##.'+'#.X#..##'+'#.XOOO.#'+'#.X#...#'+'####...#'+'...#####'},
    /* 51. Microban */ {w:7,h:7,map:'.#####.'+'##X.X##'+'#.*.*.#'+'#..#..#'+'#.O.O.#'+'##.@.##'+'.#####.'},
    /* 52. Microban */ {w:8,h:8,map:'#####...'+'#...###.'+'#.X...##'+'##*#O..#'+'#.X#.O.#'+'#.@##.##'+'#.....#.'+'#######.'},
    /* 53. ExtremelyEasy */ {w:7,h:7,map:'..###..'+'..#X#..'+'###O###'+'#XO@OX#'+'###O###'+'..#X#..'+'..###..'},
    /* 54. Microban */ {w:10,h:8,map:'########..'+'#.@.#..#..'+'#......#..'+'#####O.#..'+'....#..###'+'.##.#O.XX#'+'.##.#..###'+'....####..'},
    /* 55. Microban */ {w:9,h:6,map:'..####...'+'###..####'+'#.......#'+'#@O***X.#'+'#.......#'+'#########'},
    /* 56. Microban */ {w:10,h:7,map:'##########'+'#........#'+'#.##X###.#'+'#.#.OO.X.#'+'#.X.@O##.#'+'#####....#'+'....######'},
    /* 57. Microban */ {w:10,h:7,map:'.####.....'+'.#..######'+'##....O..#'+'#.X#.O...#'+'#.X#O#####'+'#.X@.#....'+'######....'},
    /* 58. Microban */ {w:11,h:5,map:'###########'+'#....X##..#'+'#.OO@XXOO.#'+'#...##X...#'+'###########'},
    /* 59. Microban */ {w:8,h:7,map:'.#######'+'.#.....#'+'.#.XOX.#'+'##.O@O.#'+'#..XOX.#'+'#......#'+'########'},
    /* 60. Microban */ {w:12,h:6,map:'######.#####'+'#....###...#'+'#.OO.....#@#'+'#.O.#XXX...#'+'#...########'+'#####.......'},
    /* 61. Microban */ {w:9,h:8,map:'......###'+'#####.#X#'+'#...###X#'+'#...O.#X#'+'#.O..O..#'+'#####@#.#'+'....#...#'+'....#####'},
    /* 62. Microban */ {w:9,h:8,map:'#########'+'#.@.#...#'+'#.O.O...#'+'##O###.##'+'#..XXX..#'+'#...#...#'+'######..#'+'.....####'},
    /* 63. Microban */ {w:10,h:9,map:'#####.....'+'#...####..'+'#.#.#.X#..'+'#....O.###'+'###.#OX..#'+'#...#@...#'+'#.#.######'+'#...#.....'+'#####.....'},
    /* 64. Microban */ {w:8,h:8,map:'#######.'+'#.@#..#.'+'#XO...#.'+'#X.#.O##'+'#XO#...#'+'#X.#.O.#'+'#..#...#'+'########'},
    /* 65. Microban */ {w:8,h:8,map:'..#####.'+'..#.X.##'+'###.O..#'+'#.X.O#@#'+'#.#O.X.#'+'#..O.###'+'##.X.#..'+'.#####..'},
    /* 66. ExtremelyEasy */ {w:7,h:7,map:'.###...'+'.#X###.'+'##O#X#.'+'#XO@O##'+'###OOX#'+'..#X###'+'..###..'},
    /* 67. Microban */ {w:10,h:8,map:'.####.....'+'.#..####..'+'.#.....##.'+'##.##...#.'+'#X.X#.@O##'+'#...#.OO.#'+'#..X#....#'+'##########'},
    /* 68. Microban */ {w:8,h:10,map:'######..'+'#.@..#..'+'#.O#.#..'+'#.O..#..'+'#.O.##..'+'###.####'+'.#..#..#'+'.#XXX..#'+'.#.....#'+'.#######'},
    /* 69. Microban */ {w:8,h:10,map:'####....'+'#..#####'+'#.OO.O.#'+'#......#'+'##.##.##'+'#XXX#@#.'+'#.###.##'+'#......#'+'#..#...#'+'########'},
    /* 70. Microban */ {w:8,h:12,map:'..######'+'..#.XX@#'+'..#.OO.#'+'..##.###'+'...#.#..'+'...#.#..'+'####.#..'+'#....##.'+'#.#...#.'+'#...#.#.'+'###...#.'+'..#####.'},
    /* 71. Microban */ {w:9,h:9,map:'.....####'+'.....#.@#'+'.....#..#'+'######.X#'+'#...O..X#'+'#..OO#.X#'+'#....####'+'###..#...'+'..####...'},
    /* 72. Microban */ {w:9,h:9,map:'....#####'+'#####...#'+'#....O..#'+'#..O#O#@#'+'###.#...#'+'..#.XXX.#'+'..###..##'+'....#..#.'+'....####.'},
    /* 73. Microban */ {w:11,h:9,map:'.....#####.'+'.....#...##'+'.....#....#'+'.######...#'+'##.....#X.#'+'#.O.O.@..##'+'#.######X#.'+'#........#.'+'##########.'},
    /* 74. Microban */ {w:10,h:7,map:'.#######..'+'##.XXXX##.'+'#...######'+'#...O.O.@#'+'###..O.O.#'+'..###....#'+'....######'},
    /* 75. Microban */ {w:10,h:7,map:'.########.'+'.#..@...#.'+'.#.O..O.#.'+'###.##.###'+'#..OXXO..#'+'#...XX...#'+'##########'},
    /* 76. Microban */ {w:9,h:8,map:'....####.'+'..###..##'+'.##.O...#'+'##.O..#.#'+'#.@#OO..#'+'#.XX..###'+'#.XX###..'+'#####....'},
    /* 77. Microban */ {w:9,h:8,map:'.#######.'+'.#.....#.'+'##.###O##'+'#XO...@.#'+'#.XX.#O.#'+'#X##..O.#'+'#....####'+'######...'},
    /* 78. SeeminglyHard */ {w:13,h:9,map:'.###..####...'+'.#.####..#...'+'.#.O.....#...'+'.#.###...#...'+'##...###.####'+'#......@....#'+'#...##.#.##.#'+'#X####......#'+'###..########'},
    /* 79. Microban */ {w:11,h:8,map:'......#####'+'......#X..#'+'......#X#.#'+'#######X#.#'+'#.@.O.O.O.#'+'#.#.#.#.###'+'#.......#..'+'#########..'},
    /* 80. Microban */ {w:11,h:8,map:'####..####.'+'#..####..#.'+'#..#..#..#.'+'#..#....O##'+'#..X.X#O..#'+'#@.##.#.O.#'+'#...X.#...#'+'###########'},
    /* 81. Microban */ {w:6,h:10,map:'.####.'+'##..#.'+'#X.O#.'+'#XO.#.'+'#XO.#.'+'#XO.#.'+'#X.O##'+'#...@#'+'##...#'+'.#####'},
    /* 82. Microban */ {w:9,h:10,map:'..######.'+'..#....##'+'.##.##..#'+'.#.OO.#.#'+'.#.@O.#.#'+'.#....#.#'+'####.#..#'+'#..XXX.##'+'#.....##.'+'#######..'},
    /* 83. Microban */ {w:11,h:7,map:'##########.'+'#.@.XXXX.#.'+'#...####O##'+'##.#..O.O.#'+'.#.O......#'+'.#...######'+'.#####.....'},
    /* 84. Microban */ {w:7,h:11,map:'#####..'+'#...#..'+'#.X.#..'+'#X@X###'+'##X#..#'+'#..O..#'+'#.O...#'+'##OO..#'+'.#..###'+'.#..#..'+'.####..'},
    /* 85. Microban */ {w:11,h:7,map:'#######....'+'#.....#####'+'#.OO#@##XX#'+'#.#.......#'+'#..O.#.#..#'+'####.O..XX#'+'...########'},
    /* 86. Microban */ {w:13,h:6,map:'...##########'+'####....##..#'+'#..OOOXXXXO@#'+'#......###..#'+'#...####.####'+'#####........'},
    /* 87. ExtremelyEasy */ {w:7,h:7,map:'#####..'+'#@OX##.'+'##OOX##'+'.#XOOX#'+'.##XO##'+'..##X#.'+'...###.'},
    /* 88. Microban */ {w:8,h:10,map:'#####...'+'#.@.####'+'#......#'+'#.O.OO.#'+'##O##..#'+'#...####'+'#.XX..#.'+'##XX..#.'+'.###..#.'+'...####.'},
    /* 89. Microban */ {w:8,h:10,map:'######..'+'#....##.'+'#.O.O.##'+'##.OO..#'+'.#.#...#'+'.#.##.##'+'.#..X.X#'+'.#.@X.X#'+'.#..####'+'.####...'},
    /* 90. Microban */ {w:10,h:8,map:'####......'+'#.@###....'+'#X*..#####'+'#XX#OO.O.#'+'##.......#'+'.#.#.##..#'+'.#...#####'+'.#####....'},
    /* 91. Microban */ {w:9,h:9,map:'..######.'+'..#....#.'+'..#..O.#.'+'.####O.#.'+'##.O.O.#.'+'#XXXX#.##'+'#.....@.#'+'##..#...#'+'.########'},
    /* 92. Microban */ {w:9,h:9,map:'..####...'+'..#..#...'+'..#.O####'+'###X.X..#'+'#.O.#.O.#'+'#..X.X###'+'####O.#..'+'...#.@#..'+'...####..'},
    /* 93. Microban */ {w:9,h:9,map:'..####...'+'..#..#...'+'..#..####'+'###OXO..#'+'#..X@X..#'+'#..OXO###'+'####..#..'+'...#..#..'+'...####..'},
    /* 94. Microban */ {w:12,h:7,map:'#####..#####'+'#...####XX.#'+'#.OOO......#'+'#...O#..XX.#'+'###.@#..##.#'+'..#..##....#'+'..##########'},
    /* 95. Microban */ {w:10,h:7,map:'.....#####'+'...###...#'+'####XXXXX#'+'#.@OOOOO.#'+'#.....#.##'+'#####...#.'+'....#####.'},
    /* 96. Microban */ {w:7,h:8,map:'#######'+'#.....#'+'#.XOX.#'+'#.OXO.#'+'#.XOX.#'+'#.OXO.#'+'#..@..#'+'#######'},
    /* 97. Microban */ {w:13,h:9,map:'###########..'+'#.....#...###'+'#.O@O.#.X..X#'+'#.##.###.##.#'+'#.#.......#.#'+'#.#...#...#.#'+'#.#########.#'+'#...........#'+'#############'},
    /* 98. Microban */ {w:11,h:8,map:'.####......'+'.#..#######'+'.#O.@#...X#'+'##.#OO...X#'+'#..O..##XX#'+'#...#.#####'+'###...#....'+'..#####....'},
    /* 99. Microban */ {w:11,h:8,map:'###########'+'#XXXX#....#'+'#..#...OO.#'+'#..@..##..#'+'#.....##O.#'+'######..O.#'+'.....#....#'+'.....######'},
    /* 100. Microban */ {w:11,h:8,map:'..#########'+'###...#...#'+'#.*.O.X.X.#'+'#...O.##.##'+'####*#...#.'+'.#..@..###.'+'.#...###...'+'.#####.....'},
    /* 101. Microban */ {w:9,h:10,map:'########.'+'#......#.'+'#.####.#.'+'#.#XXX@#.'+'#.###O###'+'#.#.....#'+'#..OO.O.#'+'####...##'+'...#X###.'+'...###...'},
    /* 102. Microban */ {w:10,h:9,map:'.######...'+'##....#...'+'#...O.#...'+'#..OO.#...'+'###.X#####'+'..##X#.@.#'+'...#X..O.#'+'...#X.####'+'...####...'},
    /* 103. Microban */ {w:9,h:10,map:'.....####'+'######..#'+'#.......#'+'#..XXX.X#'+'##O######'+'#.O..#...'+'#...O###.'+'##..O..#.'+'.##.@..#.'+'..######.'},
    /* 104. Microban */ {w:10,h:9,map:'##########'+'#...##...#'+'#.O..O@#.#'+'####.#.O.#'+'...#X#..##'+'.#.#X#.O#.'+'.#.#X...#.'+'.#.#X...#.'+'...######.'},
    /* 105. Microban */ {w:10,h:9,map:'##.####...'+'####..####'+'.#.O.OX..#'+'##.#..XO.#'+'#...##X###'+'#..O..X.#.'+'#.@.#...#.'+'#..######.'+'####......'},
    /* 106. Microban */ {w:10,h:11,map:'..####....'+'.##..#####'+'.#..O..@.#'+'.#..O#...#'+'####.#####'+'#..#...#..'+'#....O.#..'+'#.XX#..#..'+'#..X####..'+'#..##.....'+'####......'},
    /* 107. Microban */ {w:10,h:11,map:'.#####....'+'##...#....'+'#....#####'+'#..#X#...#'+'#@.#X#.O.#'+'#..#X#..##'+'#....#..#.'+'##..##OO#.'+'.##.....#.'+'..#..####.'+'..####....'},
    /* 108. Microban */ {w:10,h:8,map:'.#######..'+'.#..X.X###'+'.#.X.X.X.#'+'###.####.#'+'#..@O..O.#'+'#..OO..O.#'+'####...###'+'...#####..'},
    /* 109. Microban */ {w:12,h:8,map:'......######'+'......#....#'+'..#####.X..#'+'###..###X..#'+'#.O..O..X.##'+'#.@OO.#.X.#.'+'##....#####.'+'.######.....'},
    /* 110. Illustrative */ {w:14,h:7,map:'.......####...'+'########..##..'+'#..........###'+'#.@OO.##...XX#'+'#.OO...##..XX#'+'#.........####'+'###########...'},
    /* 111. Microban */ {w:10,h:10,map:'.#########'+'.#.......#'+'##@#####.#'+'#..#...#.#'+'#..#...OX#'+'#..##O##X#'+'##O##..#X#'+'#...O..#X#'+'#...#..###'+'########..'},
    /* 112. Microban */ {w:10,h:10,map:'.#####....'+'##...##...'+'#..O..##..'+'#.O.O..##.'+'###O#.X.##'+'..#.#.X..#'+'.##.##X..#'+'.#.@..X.##'+'.#...#..#.'+'.########.'},
    /* 113. SeeminglyHard */ {w:13,h:10,map:'.#########...'+'.#..#....#...'+'.#.......#...'+'.#.##...####.'+'.#X#.O@O.#X#.'+'##.#....##.#.'+'#..######..##'+'#...........#'+'##.######..##'+'.###....####.'},
    /* 114. Microban */ {w:13,h:9,map:'############.'+'#..........#.'+'#.#######.@##'+'#.#.........#'+'#.#..O...#..#'+'#.OO.#####..#'+'###..#.#.XXX#'+'..####.#....#'+'.......######'},
    /* 115. Microban */ {w:11,h:8,map:'.#######...'+'##.....##..'+'#..O.O..#..'+'#.O.O.O.#..'+'##.###.####'+'.#@..XXXXX#'+'.##.....###'+'..#######..'},
    /* 116. Microban */ {w:11,h:8,map:'..#########'+'###.@.#...#'+'#.*.O.*XX.#'+'#...O.#...#'+'####*#..###'+'.#.....##..'+'.#...###...'+'.#####.....'},
    /* 117. Microban */ {w:13,h:8,map:'......#####..'+'......#...##.'+'......#.O..#.'+'########.#@##'+'#.X..#.O.O..#'+'#........O#.#'+'#XXX#####...#'+'#####...#####'},
    /* 118. Microban */ {w:12,h:10,map:'########....'+'#..XXX.#....'+'#..###.##...'+'#..#.O..#...'+'##.#@O..#...'+'.#.#.O..#...'+'.#.###.#####'+'.#.........#'+'.#...###...#'+'.#####.#####'},
    /* 119. Microban */ {w:10,h:9,map:'.########.'+'.#......#.'+'.#@...O.#.'+'##.###O.#.'+'#.XXXXX###'+'#.O.O.O..#'+'######.#.#'+'.....#...#'+'.....#####'},
    /* 120. Microban */ {w:12,h:10,map:'.......#####'+'########...#'+'#X...X..@#X#'+'#..###.....#'+'##.O..#....#'+'.#.O...#####'+'.#.O#..#....'+'.##.#..#....'+'..#...##....'+'..#####.....'},
    /* 121. Microban */ {w:11,h:11,map:'.......####'+'.#######..#'+'.#.O......#'+'.#...O.O..#'+'.#.########'+'##.#.X..#..'+'#..#.#..#..'+'#..@.X.##..'+'##.#.#.#...'+'.#...X.#...'+'.#######...'},
    /* 122. Microban */ {w:11,h:11,map:'..######...'+'..#....#...'+'..#....#...'+'#####..#...'+'#...#X#####'+'#...O@O...#'+'#####X#...#'+'...##.##.##'+'...#...OX#.'+'...#...###.'+'...#####...'},
    /* 123. Microban */ {w:10,h:11,map:'####......'+'#..#######'+'#..X.##.X#'+'#.O#....X#'+'##.##.#.X#'+'.#....#..#'+'.####.#..#'+'..#.@O.###'+'..#.OO.#..'+'..#....#..'+'..######..'},
    /* 124. Microban */ {w:9,h:14,map:'...###...'+'...#@#...'+'.###O###.'+'##..X..##'+'#..#.#..#'+'#.#...#.#'+'#.#...#.#'+'#.#...#.#'+'#..#.#..#'+'##.O.O.##'+'.##X.X##.'+'..#...#..'+'..#...#..'+'..#####..'},
    /* 125. Microban */ {w:12,h:8,map:'....#####...'+'#####...####'+'#.....#....#'+'#..#XXXXX..#'+'##..##.#.###'+'.#OO@OOO.#..'+'.#.....###..'+'.#######....'},
    /* 126. Microban */ {w:14,h:9,map:'##############'+'#......#.....#'+'#.O@OO.#.X.XX#'+'##.##.###.##.#'+'.#.#.......#.#'+'.#.#...#...#.#'+'.#.#########.#'+'.#...........#'+'.#############'},
    /* 127. SeeminglyHard */ {w:13,h:10,map:'.#########...'+'.#..#....#...'+'.#.......#...'+'.#.##.O.####.'+'.#X#.O@O.#X#.'+'##.#....##.#.'+'#..######..##'+'#.........X.#'+'##.######..##'+'.###....####.'},
    /* 128. Microban */ {w:11,h:12,map:'.....####..'+'.#.###..#..'+'.#.#....#..'+'.#.#..#.#..'+'.#.#O.#X#..'+'.#.#..#.#.#'+'.#.#O.#X#.#'+'...#..#.#.#'+'####O.#X#.#'+'#.@.....#.#'+'#...#..##.#'+'########...'},
    /* 129. Microban */ {w:12,h:10,map:'........####'+'#########..#'+'#...##.O...#'+'#..O...##..#'+'###.#X.X#.##'+'..#.#X.X#O##'+'..#.#...#..#'+'..#.@.O....#'+'..#..#######'+'..####......'},
    /* 130. Microban */ {w:10,h:9,map:'..########'+'..#..#.X.#'+'..#...X*X#'+'..#..#.*.#'+'####O##X##'+'#......O.#'+'#.O.##.O.#'+'#...@#...#'+'##########'},
    /* 131. Microban */ {w:10,h:12,map:'.####.....'+'##..###...'+'#@O...#...'+'###.O.#...'+'.#..######'+'.#..OXXXX#'+'.#..#.####'+'.##.#.#...'+'.#.O#.#...'+'.#....#...'+'.#..###...'+'.####.....'},
    /* 132. Microban */ {w:12,h:10,map:'...####.....'+'...#..#.....'+'.###..#.....'+'##..O.#.....'+'#...#.#.....'+'#.#OO.######'+'#.#...#...X#'+'#..O..@...X#'+'###..####XX#'+'..####..####'},
    /* 133. Laborious */ {w:9,h:10,map:'######...'+'######...'+'#....#...'+'#....##..'+'#..O*X##.'+'##.*@*.##'+'.##X*O..#'+'..##....#'+'...#....#'+'...######'},
    /* 134. Microban */ {w:11,h:11,map:'......####.'+'#######..#.'+'#.O......##'+'#.O#####..#'+'#..@#..#..#'+'##.##XX...#'+'#..#.XX####'+'#.O..###...'+'#.O###.....'+'#..#.......'+'####.......'},
    /* 135. Microban */ {w:8,h:8,map:'########'+'#@.....#'+'#.XOOX.#'+'#.OXXO.#'+'#.OXXO.#'+'#.XOOX.#'+'#......#'+'########'},
    /* 136. Microban */ {w:11,h:10,map:'.####.####.'+'.#..###..##'+'.#......@.#'+'##XX###...#'+'#......#..#'+'#XXX#O..#.#'+'#.##.OO.O.#'+'#..O....###'+'####..###..'+'...####....'},
    /* 137. Microban */ {w:14,h:9,map:'########.#####'+'#..#...###...#'+'#......##.O..#'+'#X#.@.##.O..##'+'#X#...#.O..##.'+'#X#....O..##..'+'#X.##.#####...'+'##....#.......'+'.######.......'},
    /* 138. ExtremelyEasy */ {w:9,h:9,map:'###......'+'#X##.....'+'#OX###...'+'#.O#X####'+'#XO.O.OX#'+'####@#O.#'+'...###XO#'+'.....##X#'+'......###'},
    /* 139. Microban */ {w:11,h:9,map:'######.....'+'#....###...'+'#..#.O.#...'+'#..O.@.#...'+'##.##.#####'+'#..#XXXXXX#'+'#.O.O.O.O.#'+'##...######'+'.#####.....'},
    /* 140. Microban */ {w:12,h:7,map:'.###########'+'##XXXXXXX..#'+'#.OOOOOOO@.#'+'#...#.#.#.##'+'#.#.#.....#.'+'#...#######.'+'#####.......'},
    /* 141. Microban */ {w:13,h:10,map:'.......####..'+'......##..###'+'####..#..O..#'+'#..####.O.O.#'+'#...XX#.#O..#'+'#..#...@..###'+'##.#XX#.###..'+'.#.##.#.#....'+'.#......#....'+'.########....'},
    /* 142. Illustrative */ {w:10,h:10,map:'#########.'+'#.......##'+'#........#'+'#.+*.#...#'+'#..**...##'+'#...**O.#.'+'#.....#.#.'+'#....#..#.'+'####...##.'+'...#####..'},
    /* 143. Microban */ {w:9,h:13,map:'..#######'+'#.#.....#'+'#.#.#.#.#'+'..#.@.O.#'+'###.###.#'+'#...###.#'+'#.O..##X#'+'##.O..#X#'+'.##.O..X#'+'#.##.O#X#'+'##.##.#X#'+'###.#...#'+'###.#####'},
    /* 144. Microban */ {w:11,h:11,map:'.######....'+'.#.X..#....'+'##OX#.#....'+'#..*..#....'+'#.XX###....'+'##O.#.#####'+'##.##.#...#'+'#..####.#.#'+'#...@.O.O.#'+'##..#.....#'+'.##########'},
    /* 145. Microban */ {w:9,h:12,map:'######...'+'#....####'+'#....XXX#'+'#....XXX#'+'######..#'+'..#..#..#'+'..#.OO.##'+'..#.@O..#'+'..#.OO..#'+'..##.O#.#'+'...#....#'+'...######'},
    /* 146. Microban */ {w:10,h:13,map:'.#####....'+'##...####.'+'#..OOO..#.'+'#.#...O.#.'+'#...O##.##'+'###..#X..#'+'..#..#...#'+'.#####.###'+'.#...#.##.'+'.#.@XXXX#.'+'.#......#.'+'.#...#..#.'+'.########.'},
    /* 147. Microban */ {w:11,h:12,map:'#####......'+'#...###....'+'#.#O..#....'+'#.O...#....'+'#.O.O.#....'+'#.O#..#....'+'#..@###....'+'##.########'+'#......XXX#'+'#.........#'+'########XX#'+'.......####'},
    /* 148. Microban */ {w:12,h:11,map:'..####......'+'###..#......'+'#....###....'+'#.#.X.X#....'+'#.@.XXX####.'+'#.#.#.#...##'+'#...#.OO...#'+'#####..O.O.#'+'....##O.#.##'+'.....#....#.'+'.....######.'},
    /* 149. ExtremelyEasy */ {w:9,h:10,map:'....###..'+'...##@#..'+'..##.O###'+'.##.OX#X#'+'##.OX#XO#'+'#.OX#XO.#'+'#.X#XO.##'+'#.##O.##.'+'#....##..'+'######...'},
    /* 150. Microban */ {w:14,h:10,map:'...####.......'+'...#..########'+'####.O.OXXXXX#'+'#...O...######'+'#@###.###.....'+'#..O..#.......'+'#.O.#.#.......'+'##.#..#.......'+'.#....#.......'+'.######.......'},
    /* 151. SeeminglyHard */ {w:14,h:12,map:'....#########.'+'...##.......##'+'..##..#####..#'+'..#..##...##.#'+'###.##..O..#.#'+'#......*+*X#.#'+'#.......#..#.#'+'#########.##.#'+'.....#...O...#'+'.....####.#.##'+'........#...#.'+'........#####.'},
    /* 152. Microban */ {w:8,h:8,map:'########'+'#......#'+'#.O***.#'+'#.*..*.#'+'#.*..*.#'+'#.***X.#'+'#.....@#'+'########'},
    /* 153. Microban */ {w:11,h:11,map:'.#########.'+'##...#...##'+'#....#....#'+'#..O.#.O..#'+'#...*X*...#'+'####X@X####'+'#...*X*...#'+'#..O.#.O..#'+'#....#....#'+'##...#...##'+'.#########.'},
    /* 154. Microban */ {w:11,h:11,map:'.####.####.'+'##..###..##'+'#...#.#...#'+'#..*X.X*..#'+'###O...O###'+'.#...@...#.'+'###O...O###'+'#..*X.X*..#'+'#...#.#...#'+'##..###..##'+'.####.####.'},
    /* 155. Microban */ {w:14,h:13,map:'...#####......'+'..##...#......'+'###..#.#......'+'#....X.#......'+'#..##.#####...'+'#..X.X.#..##..'+'#..#.@.O...###'+'#####X.#..O..#'+'....####..O..#'+'.......##.O.##'+'........#..##.'+'........#..#..'+'........####..'},
    /* 156. Microban */ {w:13,h:13,map:'..#####......'+'..#...#......'+'..#.#.#######'+'..#..*..#...#'+'..##.##...#.#'+'..#.....#*..#'+'###.#.#.#.###'+'#..*#O+...#..'+'#.#...##.##..'+'#...#..*..#..'+'#######.#.#..'+'......#...#..'+'......#####..'},
    /* 157. Microban */ {w:9,h:9,map:'.#######.'+'##..X..##'+'#.XOOOX.#'+'#.OX.XO.#'+'#XO.@.OX#'+'#.OX.XO.#'+'#.XOOOX.#'+'##..X..##'+'.#######.'},
    /* 158. Illustrative */ {w:13,h:12,map:'.######.#####'+'##X...###...#'+'#+*.....*...#'+'##..####**.##'+'.####..O.*..#'+'....#.##....#'+'....#..##...#'+'....#.#.O.###'+'....#...#.#..'+'....##....#..'+'.....###..#..'+'.......####..'},
    /* 159. Illustrative */ {w:12,h:12,map:'..######....'+'.##....#####'+'.#.....#...#'+'.#.****....#'+'.#....##..##'+'.#.....#.##.'+'.#.#####.#..'+'.#.....#.##.'+'##.....#..#.'+'#..***+#O.#.'+'#......#..#.'+'###########.'},
    /* 160. Illustrative */ {w:9,h:9,map:'#########'+'#.......#'+'#.OX.XO.#'+'#.**O*X.#'+'#..O+O..#'+'#..*O*X.#'+'#.*X.XO.#'+'#.......#'+'#########'},
    /* 161. ExtremelyEasy */ {w:12,h:12,map:'.......###..'+'......##@#..'+'#######.O#..'+'#....#.OX#..'+'#.##..OX####'+'#O.###X###X#'+'#XO.#####XO#'+'##XO...#XO.#'+'.##X##.#O.##'+'..####.#.##.'+'.....#...#..'+'.....#####..'},
    /* 162. Microban */ {w:13,h:10,map:'#############'+'#X#.@#..#...#'+'#X#OO...#.O.#'+'#X#..#.O#...#'+'#X#.O#..#.O##'+'#X#..#.O#..#.'+'#X#.O#..#.O#.'+'#XX..#.O...#.'+'#XX..#..#..#.'+'############.'},
    /* 163. Laborious */ {w:13,h:14,map:'#########....'+'.########....'+'.#......#....'+'.#.####.####.'+'.#.#..#.#..##'+'##.#...*....#'+'#..#....*...#'+'#.####.*+*..#'+'#.#.....*...#'+'#.#......*.##'+'#.#..####.##.'+'#.####...O#..'+'#......#..#..'+'###########..'},
    /* 164. Illustrative */ {w:10,h:13,map:'######....'+'#....#....'+'#.##.###..'+'#..#...##.'+'#..O*.X.##'+'#..X*O@X.#'+'#....OO..#'+'#..X*OXX.#'+'#..O*.*.##'+'#..#...##.'+'#.##.###..'+'#....#....'+'######....'},
    /* 165. Microban */ {w:11,h:11,map:'...#####...'+'...#.@.#...'+'..##...##..'+'###XOOOX###'+'#..OXXXO..#'+'#..OX#XO..#'+'#..OXXXO..#'+'###XOOOX###'+'..##...##..'+'...#...#...'+'...#####...'},
    /* 166. Illustrative */ {w:12,h:14,map:'....#####...'+'..###...####'+'..#...O....#'+'..#.##.###.#'+'..#.#.X..#.#'+'###.#....#.#'+'#...*...*#.#'+'#...**.**..#'+'####*...*#.#'+'..#......#.#'+'..#...+..#.#'+'..#..#O###.#'+'..#..#.....#'+'..##########'},
    /* 167. Laborious */ {w:12,h:14,map:'###########.'+'...########.'+'...#......#.'+'#####..##.#.'+'#....OO...#.'+'#..X**..#.#.'+'##.**..##.##'+'.#.....#...#'+'#####..#...#'+'#.....##.#.#'+'#..**......#'+'#.*+*.######'+'#.....#.....'+'#######.....'},
    /* 168. Illustrative */ {w:13,h:11,map:'...########..'+'####......##.'+'#..#.......#.'+'#..OOO.....#.'+'#...OX**...#.'+'###XXX@XXX###'+'.#...**XO...#'+'.#.....OOO..#'+'.#.......#..#'+'.##......####'+'..########...'},
    /* 169. Illustrative */ {w:12,h:13,map:'..########..'+'.##......#..'+'.#.......###'+'##.........#'+'#...#OO....#'+'#.OO..OO...#'+'##.OO..OO.##'+'.#..OO..OO#.'+'.##.X#X#X.##'+'.#.X.X.X.X.#'+'.#..X.+.X..#'+'.##X.X.X.X##'+'..#########.'},
    /* 170. Microban */ {w:12,h:12,map:'...####.....'+'.###..#####.'+'.#.OO.#...#.'+'.#.O.X.XOO##'+'.#.XX.#X.O.#'+'###.#**.X..#'+'#..X.**#.###'+'#.O.X#.XX.#.'+'##OOX@X.O.#.'+'.#...#.OO.#.'+'.#####..###.'+'.....####...'}
  ];
  function _skSparkle(){
    var rect=gd.getBoundingClientRect();var cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
    var colors=['#c8a84b','#7ab356','#e8a050','#f0b870','#fff','#d4903a'];
    for(var i=0;i<24;i++){
      var sp=document.createElement('div');
      var angle=Math.random()*Math.PI*2,dist=40+Math.random()*80,sz=4+Math.random()*6;
      var dx=Math.cos(angle)*dist,dy=Math.sin(angle)*dist;
      sp.style.cssText='position:fixed;left:'+(cx-sz/2)+'px;top:'+(cy-sz/2)+'px;width:'+sz+'px;height:'+sz+'px;border-radius:50%;background:'+colors[i%colors.length]+';pointer-events:none;z-index:9999;opacity:1;transition:all 0.8s cubic-bezier(0.25,0.46,0.45,0.94);box-shadow:0 0 6px '+colors[i%colors.length];
      sp.setAttribute('data-sk-fx','1');document.body.appendChild(sp);
      setTimeout(function(s,x,y){s.style.transform='translate('+x+'px,'+y+'px) scale(0)';s.style.opacity='0'}.bind(null,sp,dx,dy),20);
      setTimeout(function(s){if(s.parentNode)s.remove()}.bind(null,sp),900);
    }
    var cat=document.createElement('div');
    cat.style.cssText='position:fixed;left:50%;top:'+cy+'px;transform:translate(-50%,-50%) scale(0);width:clamp(160px,45vw,220px);height:clamp(160px,45vw,220px);z-index:9998;pointer-events:none;transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1),opacity 0.4s;opacity:0';
    cat.innerHTML='<img src="assets/games/sokoban/player-on-target.png" style="width:100%;height:100%;object-fit:contain" alt="">';
    cat.setAttribute('data-sk-fx','1');document.body.appendChild(cat);
    setTimeout(function(){cat.style.transform='translate(-50%,-50%) scale(1)';cat.style.opacity='1'},30);
    // Second sparkle burst around the cat
    setTimeout(function(){
      for(var j=0;j<16;j++){var sp2=document.createElement('div');var a2=Math.random()*Math.PI*2,d2=60+Math.random()*100,sz2=3+Math.random()*5;sp2.style.cssText='position:fixed;left:'+((window.innerWidth/2)-sz2/2)+'px;top:'+(cy-sz2/2)+'px;width:'+sz2+'px;height:'+sz2+'px;border-radius:50%;background:'+colors[j%colors.length]+';pointer-events:none;z-index:9999;opacity:1;transition:all 1s ease-out;box-shadow:0 0 8px '+colors[j%colors.length];sp2.setAttribute('data-sk-fx','1');document.body.appendChild(sp2);setTimeout(function(s,x,y){s.style.transform='translate('+x+'px,'+y+'px) scale(0)';s.style.opacity='0'}.bind(null,sp2,Math.cos(a2)*d2,Math.sin(a2)*d2),20);setTimeout(function(s){if(s.parentNode)s.remove()}.bind(null,sp2),1100)}
    },400);
    setTimeout(function(){cat.style.transform='translate(-50%,-50%) scale(1.1) rotate(3deg)';},800);
    setTimeout(function(){cat.style.transform='translate(-50%,-50%) scale(0)';cat.style.opacity='0'},3600);
    setTimeout(function(){if(cat.parentNode)cat.remove()},4200);
  }
  function _skWinScreen(levelNum,mv){
    var old=document.getElementById('sk-win');if(old)old.remove();
    var ov=document.createElement('div');ov.id='sk-win';
    ov.style.cssText='position:fixed;inset:0;z-index:10000;background:rgba(8,10,6,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);animation:boardFadeIn 0.4s ease';
    // Happy cat
    var catImg=document.createElement('img');
    catImg.src='assets/games/sokoban/player-on-target.png';
    catImg.style.cssText='width:clamp(180px,50vw,260px);height:clamp(180px,50vw,260px);object-fit:contain;animation:tierRevealPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;filter:drop-shadow(0 0 20px rgba(200,168,75,0.3))';
    ov.appendChild(catImg);
    // Text
    var txt=document.createElement('div');
    txt.style.cssText='font-family:Bebas Neue,sans-serif;font-size:clamp(1.4rem,5vw,2rem);color:var(--gold);letter-spacing:0.1em;text-align:center;text-shadow:0 2px 8px rgba(0,0,0,0.5)';
    txt.textContent=levelNum==='ALL'?'ALL LEVELS COMPLETE!':'LEVEL '+levelNum+' COMPLETE!';
    ov.appendChild(txt);
    var sub=document.createElement('div');
    sub.style.cssText='font-family:DM Mono,monospace;font-size:clamp(0.5rem,1.5vw,0.7rem);color:var(--cream);opacity:0.7';
    sub.textContent=mv+' moves';
    ov.appendChild(sub);
    // Buttons
    var btns=document.createElement('div');
    btns.style.cssText='display:flex;gap:12px;margin-top:12px;flex-wrap:wrap;justify-content:center';
    var nextBtn=document.createElement('button');
    nextBtn.className='gb';
    nextBtn.style.cssText='min-height:52px;min-width:140px;font-size:0.85rem;background:rgba(74,124,53,0.25);border-color:rgba(122,179,86,0.4);color:var(--sage)';
    nextBtn.textContent=levelNum==='ALL'?'⟳ PLAY AGAIN':'⏭️ NEXT LEVEL';
    nextBtn.onclick=function(){ov.remove();document.querySelectorAll('[data-sk-fx]').forEach(function(el){el.remove()});if(levelNum==='ALL'){lvl=0;localStorage.setItem('sk_lvl','0')}load();rn()};
    btns.appendChild(nextBtn);
    var pickBtn=document.createElement('button');
    pickBtn.className='gb';
    pickBtn.style.cssText='min-height:52px;min-width:140px;font-size:0.85rem';
    pickBtn.textContent='🎮 DIFFERENT GAME';
    pickBtn.onclick=function(){ov.remove();document.querySelectorAll('[data-sk-fx]').forEach(function(el){el.remove()});_openGamePicker()};
    btns.appendChild(pickBtn);
    ov.appendChild(btns);
    document.body.appendChild(ov);
    // Sparkles around the cat
    _skSparkle();
    setTimeout(_skSparkle,600);
  }
  var grid=[],origGrid=[],w=7,h=5,px=0,py=0,moves=0,lvl=parseInt(localStorage.getItem('sk_lvl')||'0',10);
  ms(a,'Level <strong id="SKl">1</strong> · Moves <strong id="SKm">0</strong>');mm(a);
  var gd=document.createElement('div');gd.className='skg';gd.id='SK';a.appendChild(gd);
  var _arsz='clamp(90px,26vw,130px)';
  var db=document.createElement('div');db.style.cssText='display:grid;grid-template-columns:auto auto auto;grid-template-rows:auto auto auto;width:fit-content;margin:-10px auto 0';
  var _abs='background:none;border:none;padding:0;margin:-15px;cursor:pointer;-webkit-tap-highlight-color:transparent;display:flex;align-items:center;justify-content:center;width:'+_arsz+';height:'+_arsz+';position:relative;z-index:1';
  var _ais='width:100%;height:100%;object-fit:contain;pointer-events:none;-webkit-user-drag:none';
  db.innerHTML='<div></div><button style="'+_abs+'" onclick="_SKM(0,-1)"><img src="assets/games/arrow-up.png" style="'+_ais+'" alt="Up"></button><div></div>'
    +'<button style="'+_abs+'" onclick="_SKM(-1,0)"><img src="assets/games/arrow-left.png" style="'+_ais+'" alt="Left"></button><div></div>'
    +'<button style="'+_abs+'" onclick="_SKM(1,0)"><img src="assets/games/arrow-right.png" style="'+_ais+'" alt="Right"></button><div></div>'
    +'<button style="'+_abs+'" onclick="_SKM(0,1)"><img src="assets/games/arrow-down.png" style="'+_ais+'" alt="Down"></button><div></div>';
  a.appendChild(db);mc(a).innerHTML='<button class="gb" onclick="_SKR()">↩️ Reset</button><button class="gb" onclick="_SKN()">⏭️ Next Level</button>';
  // 0=floor,1=wall,2=crate,3=target,4=crate-on-target
  function load(){var L=LEVELS[lvl%LEVELS.length];w=L.w;h=L.h;grid=[];
    for(var i=0;i<L.map.length;i++){var c=L.map[i];if(c==='@'){grid.push(0);px=i%w;py=Math.floor(i/w)}else if(c==='+'){grid.push(3);px=i%w;py=Math.floor(i/w)}else if(c==='O'){grid.push(2)}else if(c==='*'){grid.push(4)}else if(c==='X'){grid.push(3)}else if(c==='#'){grid.push(1)}else grid.push(0)}
    origGrid=grid.slice();moves=0;document.getElementById('SKl').textContent=lvl+1;document.getElementById('SKm').textContent='0'}
  function rn(){gd.style.gridTemplateColumns='repeat('+w+',1fr)';gd.innerHTML='';
    for(var y=0;y<h;y++)for(var x=0;x<w;x++){var d=document.createElement('div');d.className='skc';d.style.overflow='hidden';
      var v=grid[y*w+x],isTarget=(v===3||v===4),isCrate=(v===2||v===4),isPlayer=(x===px&&y===py);
      if(v===1){d.innerHTML=ART.wall}
      else if(isPlayer&&isTarget){d.innerHTML=ART.target+ART.player;d.style.position='relative';d.querySelectorAll('img').forEach(function(im,idx){if(idx===0)im.style.cssText+='position:absolute;inset:0;opacity:0.4;';if(idx===1)im.style.cssText+='position:relative;z-index:2;'})}
      else if(isPlayer){d.style.background='rgba(26,31,23,.4)';d.innerHTML=ART.player}
      else if(isCrate&&isTarget){d.innerHTML=ART.planted}
      else if(isCrate){d.style.background='rgba(26,31,23,.4)';d.innerHTML=ART.crate}
      else if(isTarget){d.innerHTML=ART.target}
      else{d.innerHTML=ART.floor}
      gd.appendChild(d)}
    document.getElementById('SKm').textContent=moves;
    var won=true;for(var i=0;i<grid.length;i++)if(grid[i]===3)won=false;
    if(won&&grid.some(function(v){return v===4})){
      _e('game_win');_sr('sokoban',{w:true,s:moves});
      if(lvl<LEVELS.length-1){_play('win');_skWinScreen(lvl+1,moves);lvl++;localStorage.setItem('sk_lvl',String(lvl))}
      else{_play('win');_skWinScreen('ALL',moves)}}}
  window._SKM=function(dx,dy){var nx=px+dx,ny=py+dy;if(nx<0||nx>=w||ny<0||ny>=h)return;var ni=ny*w+nx,nv=grid[ni];if(nv===1)return;
    if(nv===2||nv===4){var bx=nx+dx,by=ny+dy;if(bx<0||bx>=w||by<0||by>=h)return;var bi=by*w+bx,bv=grid[bi];if(bv===1||bv===2||bv===4)return;
      _play('drop');grid[ni]=(nv===4)?3:0;grid[bi]=(bv===3)?4:2;if(bv===3)_e('progress')}else{_play('tap')}
    px=nx;py=ny;moves++;rn()};
  window._SKR=function(){load();sm('Reset');rn()};
  window._SKN=function(){lvl=(lvl+1)%LEVELS.length;load();sm('Level '+(lvl+1));rn()};
  document.addEventListener('keydown',function(e){var m={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(m[e.key]&&_a==='sokoban'){e.preventDefault();_SKM(m[e.key][0],m[e.key][1])}});
  load();rn()}
// ═══ PETAL FALL — Falling Block Puzzle ═══
function GPF(a){
  var COLS=10,ROWS=20,CELL,boardCanvas,boardCtx,nextCanvas,nextCtx,dpr;
  var PIECES=[
    {shape:[[1,1,1,1]],color:'#5BAFD4',name:'I'},
    {shape:[[1,1],[1,1]],color:'#D4A843',name:'O'},
    {shape:[[0,1,0],[1,1,1]],color:'#9B6BA3',name:'T'},
    {shape:[[0,1,1],[1,1,0]],color:'#4A7C35',name:'S'},
    {shape:[[1,1,0],[0,1,1]],color:'#C47A7A',name:'Z'},
    {shape:[[1,0,0],[1,1,1]],color:'#5B8FB9',name:'J'},
    {shape:[[0,0,1],[1,1,1]],color:'#C76A30',name:'L'}
  ];
  var grid=[],current=null,nextPc=null,holdPc=null,canHold=true;
  var score=0,lines=0,level=1,dropTimer=0,dropInterval=1000;
  var pfOver=false,lastTime=0,particles=[],bag=[];

  ms(a,'Score <strong id="PFs">0</strong> · Lines <strong id="PFl">0</strong> · Level <strong id="PFlv">1</strong>');mm(a);

  // Canvas setup — vertical stack, centered
  var wrap=document.createElement('div');wrap.style.cssText='display:flex;flex-direction:column;align-items:center;width:100%';
  boardCanvas=document.createElement('canvas');boardCanvas.style.cssText='display:block;border-radius:8px;border:2px solid rgba(74,124,53,0.2);box-shadow:0 4px 16px rgba(0,0,0,0.4)';
  boardCtx=boardCanvas.getContext('2d');
  wrap.appendChild(boardCanvas);
  var side=document.createElement('div');side.style.cssText='display:flex;gap:12px;align-items:center;justify-content:center;padding:6px 0';
  side.innerHTML='<span style="font-family:Bebas Neue,sans-serif;font-size:0.65rem;color:#4A7C35;letter-spacing:1px;opacity:0.6">NEXT</span>';
  nextCanvas=document.createElement('canvas');nextCanvas.style.cssText='border-radius:4px;border:1px solid rgba(74,124,53,0.15)';
  nextCtx=nextCanvas.getContext('2d');
  side.appendChild(nextCanvas);
  var spdEl=document.createElement('span');spdEl.id='PFspd';spdEl.style.cssText='font-family:Bebas Neue,sans-serif;font-size:0.65rem;color:#D4A843;letter-spacing:1px';spdEl.textContent='SPEED 1';
  side.appendChild(spdEl);
  wrap.appendChild(side);a.appendChild(wrap);

  // Controls
  var _cbs='min-height:56px;min-width:56px;padding:0.4rem;font-size:1.3rem;border-radius:12px;background:rgba(26,36,22,0.85);border:1.5px solid rgba(74,124,53,0.25);box-shadow:0 2px 8px rgba(0,0,0,0.3)';
  var cDiv=document.createElement('div');cDiv.style.cssText='display:flex;gap:8px;padding:8px 12px;justify-content:center';
  cDiv.innerHTML='<button class="gb" style="'+_cbs+'" ontouchstart="_PFM(-1);event.preventDefault()" onclick="_PFM(-1)">←</button>'
    +'<button class="gb" style="'+_cbs+'" ontouchstart="_PFRot();event.preventDefault()" onclick="_PFRot()">↻</button>'
    +'<button class="gb" style="'+_cbs+'" ontouchstart="_PFSoft();event.preventDefault()" onclick="_PFSoft()">↓</button>'
    +'<button class="gb" style="'+_cbs+';border-color:rgba(200,168,75,0.3);color:var(--gold)" ontouchstart="_PFHard();event.preventDefault()" onclick="_PFHard()">⏬</button>'
    +'<button class="gb" style="'+_cbs+';min-width:70px;font-size:0.7rem" ontouchstart="_PFHold();event.preventDefault()" onclick="_PFHold()">HOLD</button>'
    +'<button class="gb" style="'+_cbs+'" ontouchstart="_PFM(1);event.preventDefault()" onclick="_PFM(1)">→</button>';
  a.appendChild(cDiv);
  mc(a).innerHTML='<button class="gb-new" onclick="_PFN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  function initCanvas(){
    dpr=window.devicePixelRatio||1;
    var maxH=window.innerHeight-320;
    var maxW=window.innerWidth-24;
    CELL=Math.floor(Math.min(maxW/COLS,maxH/ROWS));CELL=Math.max(14,Math.min(CELL,28));
    boardCanvas.width=COLS*CELL*dpr;boardCanvas.height=ROWS*CELL*dpr;
    boardCanvas.style.width=(COLS*CELL)+'px';boardCanvas.style.height=(ROWS*CELL)+'px';
    boardCtx.setTransform(dpr,0,0,dpr,0,0);
    nextCanvas.width=4*CELL*dpr;nextCanvas.height=4*CELL*dpr;
    nextCanvas.style.width=(4*CELL)+'px';nextCanvas.style.height=(4*CELL)+'px';
    nextCtx.setTransform(dpr,0,0,dpr,0,0);
  }
  function initGrid(){grid=[];for(var r=0;r<ROWS;r++){grid[r]=[];for(var c=0;c<COLS;c++)grid[r][c]=null}}
  function fillBag(){bag=[];for(var i=0;i<PIECES.length;i++)bag.push(i);for(var j=bag.length-1;j>0;j--){var k=Math.floor(Math.random()*(j+1));var t=bag[j];bag[j]=bag[k];bag[k]=t}}
  function getNext(){if(!bag.length)fillBag();return bag.pop()}
  function getShape(piece,rot){var s=piece.shape;for(var r=0;r<rot;r++){var rows=s.length,cols=s[0].length;var ns=[];for(var c=0;c<cols;c++){ns[c]=[];for(var rr=rows-1;rr>=0;rr--)ns[c].push(s[rr][c])}s=ns}return s}
  function spawn(idx){var p=PIECES[idx];var shape=p.shape;var x=Math.floor((COLS-shape[0].length)/2);current={pieceIdx:idx,piece:p,rotation:0,x:x,y:0,shape:shape};canHold=true;if(collides(current.shape,current.x,current.y)){pfOver=true;_e('game_loss');sm('Garden Full! Score: '+score);_sr('petalfall',{w:false,s:score})}}
  function collides(shape,px,py){for(var r=0;r<shape.length;r++)for(var c=0;c<shape[r].length;c++){if(!shape[r][c])continue;var gx=px+c,gy=py+r;if(gx<0||gx>=COLS||gy>=ROWS)return true;if(gy>=0&&grid[gy][gx])return true}return false}
  function lock(){var s=current.shape;for(var r=0;r<s.length;r++)for(var c=0;c<s[r].length;c++){if(!s[r][c])continue;var gy=current.y+r,gx=current.x+c;if(gy<0){pfOver=true;_e('game_loss');sm('Garden Full!');_sr('petalfall',{w:false,s:score});return}grid[gy][gx]=current.piece.color}_play('tap');clearLines();var ni=nextPc;nextPc=getNext();spawn(ni)}
  function clearLines(){
    var cleared=[];for(var r=ROWS-1;r>=0;r--){var full=true;for(var c=0;c<COLS;c++)if(!grid[r][c]){full=false;break}if(full)cleared.push(r)}
    if(!cleared.length)return;
    // Particles
    for(var i=0;i<cleared.length;i++)for(var c=0;c<COLS;c++){var col=grid[cleared[i]][c]||'#4A7C35';for(var p=0;p<3;p++)particles.push({x:c*CELL+CELL/2,y:cleared[i]*CELL+CELL/2,vx:(Math.random()-0.5)*120,vy:-40-Math.random()*80,life:0.5+Math.random()*0.4,maxLife:0.5+Math.random()*0.4,size:2+Math.random()*3,color:col})}
    for(i=0;i<cleared.length;i++){grid.splice(cleared[i],1);grid.unshift(new Array(COLS).fill(null))}
    var pts=[0,100,300,500,800];score+=pts[cleared.length]*level;lines+=cleared.length;
    var nl=Math.floor(lines/10)+1;if(nl>level){level=nl;dropInterval=Math.max(50,1000-((level-1)*80));var sp=document.getElementById('PFspd');if(sp)sp.textContent='SPEED '+level}
    _e('milestone');if(cleared.length>=4)_e('game_win');
    _play('snap');updHUD();
  }
  function updHUD(){var s=document.getElementById('PFs');if(s)s.textContent=score;var l=document.getElementById('PFl');if(l)l.textContent=lines;var v=document.getElementById('PFlv');if(v)v.textContent=level}
  function drawCell(ctx,x,y,sz,color){var p=1;ctx.fillStyle=color;ctx.fillRect(x+p,y+p,sz-p*2,sz-p*2);ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(x+p,y+p,sz-p*2,3);ctx.fillRect(x+p,y+p,3,sz-p*2);ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(x+p,y+sz-p-2,sz-p*2,2)}
  function render(){
    var w=COLS*CELL,h=ROWS*CELL;boardCtx.fillStyle='#0d100c';boardCtx.fillRect(0,0,w,h);
    boardCtx.strokeStyle='rgba(74,124,53,0.05)';boardCtx.lineWidth=0.5;
    for(var r=0;r<ROWS;r++){boardCtx.beginPath();boardCtx.moveTo(0,r*CELL);boardCtx.lineTo(w,r*CELL);boardCtx.stroke()}
    for(var c=0;c<=COLS;c++){boardCtx.beginPath();boardCtx.moveTo(c*CELL,0);boardCtx.lineTo(c*CELL,h);boardCtx.stroke()}
    for(r=0;r<ROWS;r++)for(c=0;c<COLS;c++)if(grid[r][c])drawCell(boardCtx,c*CELL,r*CELL,CELL,grid[r][c]);
    // Ghost + current
    if(current&&!pfOver){
      var gy=current.y;while(!collides(current.shape,current.x,gy+1))gy++;
      if(gy!==current.y){boardCtx.globalAlpha=0.15;var s=current.shape;for(r=0;r<s.length;r++)for(c=0;c<s[r].length;c++)if(s[r][c])drawCell(boardCtx,(current.x+c)*CELL,(gy+r)*CELL,CELL,current.piece.color);boardCtx.globalAlpha=1}
      s=current.shape;for(r=0;r<s.length;r++)for(c=0;c<s[r].length;c++)if(s[r][c])drawCell(boardCtx,(current.x+c)*CELL,(current.y+r)*CELL,CELL,current.piece.color);
    }
    // Particles
    for(var i=0;i<particles.length;i++){var pp=particles[i];var al=pp.life/pp.maxLife;boardCtx.globalAlpha=al;boardCtx.fillStyle=pp.color;boardCtx.beginPath();boardCtx.arc(pp.x,pp.y,pp.size*al,0,Math.PI*2);boardCtx.fill()}
    boardCtx.globalAlpha=1;
    // Next preview
    var nw=4*CELL;nextCtx.fillStyle='#0d100c';nextCtx.fillRect(0,0,nw,nw);
    if(nextPc!==null){var np=PIECES[nextPc];var ns=np.shape;var ox=Math.floor((4-ns[0].length)/2);var oy=Math.floor((4-ns.length)/2);for(r=0;r<ns.length;r++)for(c=0;c<ns[r].length;c++)if(ns[r][c])drawCell(nextCtx,(ox+c)*CELL,(oy+r)*CELL,CELL,np.color)}
  }
  function gameLoop(ts){
    if(pfOver||_a!=='petalfall')return;
    var dt=lastTime?(ts-lastTime)/1000:0.016;lastTime=ts;
    dropTimer+=dt*1000;
    if(dropTimer>=dropInterval){dropTimer=0;if(current&&!collides(current.shape,current.x,current.y+1))current.y++;else if(current)lock()}
    for(var i=particles.length-1;i>=0;i--){var pp=particles[i];pp.x+=pp.vx*dt;pp.y+=pp.vy*dt;pp.vy+=200*dt;pp.life-=dt;if(pp.life<=0)particles.splice(i,1)}
    render();updHUD();requestAnimationFrame(gameLoop);
  }

  // Controls
  window._PFM=function(dir){if(pfOver||!current)return;if(!collides(current.shape,current.x+dir,current.y)){current.x+=dir;_play('tap');render()}};
  window._PFRot=function(){if(pfOver||!current)return;var nr=(current.rotation+1)%4;var ns=getShape(current.piece,nr);var kicks=[0,-1,1,-2,2];for(var i=0;i<kicks.length;i++){if(!collides(ns,current.x+kicks[i],current.y)){current.rotation=nr;current.shape=ns;current.x+=kicks[i];_play('tap');render();return}}};
  window._PFSoft=function(){if(pfOver||!current)return;if(!collides(current.shape,current.x,current.y+1)){current.y++;score++;dropTimer=0;render()}};
  window._PFHard=function(){if(pfOver||!current)return;var dy=0;while(!collides(current.shape,current.x,current.y+dy+1))dy++;current.y+=dy;score+=dy*2;_play('drop');lock();dropTimer=0;render()};
  window._PFHold=function(){if(pfOver||!current||!canHold)return;canHold=false;if(holdPc===null){holdPc=current.pieceIdx;var ni=nextPc;nextPc=getNext();spawn(ni)}else{var tmp=holdPc;holdPc=current.pieceIdx;spawn(tmp)}_play('tap');render()};
  window._PFN=function(){initCanvas();initGrid();score=0;lines=0;level=1;dropInterval=1000;dropTimer=0;pfOver=false;holdPc=null;particles=[];bag=[];fillBag();nextPc=getNext();spawn(getNext());updHUD();var sp=document.getElementById('PFspd');if(sp)sp.textContent='SPEED 1';lastTime=0;requestAnimationFrame(gameLoop)};

  // Keyboard
  document.addEventListener('keydown',function(e){if(_a!=='petalfall')return;var m={ArrowLeft:function(){_PFM(-1)},ArrowRight:function(){_PFM(1)},ArrowDown:function(){_PFSoft()},ArrowUp:function(){_PFRot()},' ':function(){_PFHard()}};if(m[e.key]){e.preventDefault();m[e.key]()}});

  _PFN();
}
// ═══ BLOOM WHEEL — Spinning Mandala Drawing Tool ═══
function GBW(a){
  var canvas,ctx,bufC,bufX,W,H,cx,cy,radius,dpr;
  var symmetry=8,bpm=90,spinOn=true,musicOn=false;
  var rotAngle=0,brushSize=3,brushSizes=[1,2,3,5,8,12,18,25],brushIdx=2;
  var drawing=false,lastX=0,lastY=0,strokes=0,startT=Date.now(),colorPh=0;
  var beatCount=0,activeBeat=0,aCtx=null,mGain=null,nextBT=0,beatInt=60/bpm,schTimer=null;
  var PAL=[{r:74,g:124,b:53},{r:122,g:179,b:86},{r:212,g:168,b:67},{r:232,g:220,b:200},{r:196,g:122,b:122},{r:91,g:155,b:213},{r:160,g:120,b:180},{r:74,g:124,b:53}];

  ms(a,'<span id="BWbpm">90 BPM</span> · <span id="BWsym">8</span>-fold');mm(a);

  // Canvas
  canvas=document.createElement('canvas');canvas.style.cssText='display:block;width:100%;aspect-ratio:1;max-width:420px;margin:0 auto;border-radius:12px;touch-action:none;background:#0d100c';
  a.appendChild(canvas);ctx=canvas.getContext('2d');
  bufC=document.createElement('canvas');bufX=bufC.getContext('2d');

  function resize(){
    dpr=window.devicePixelRatio||1;var r=canvas.getBoundingClientRect();W=r.width;H=r.height;
    canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    var old=null;if(bufC.width>0&&bufC.height>0){try{old=bufX.getImageData(0,0,bufC.width,bufC.height)}catch(e){}}
    bufC.width=W*dpr;bufC.height=H*dpr;bufX.setTransform(dpr,0,0,dpr,0,0);
    if(old){try{bufX.putImageData(old,0,0)}catch(e){}}
    cx=W/2;cy=H/2;radius=Math.min(cx,cy)-10;
  }

  function getColor(ph,dist){
    if(_bwUserColor){
      // Parse hex to rgba with slight alpha variation
      var r2=parseInt(_bwUserColor.slice(1,3),16),g2=parseInt(_bwUserColor.slice(3,5),16),b2=parseInt(_bwUserColor.slice(5,7),16);
      var bright=0.7+dist/radius*0.3;
      return 'rgba('+Math.min(255,Math.round(r2*bright))+','+Math.min(255,Math.round(g2*bright))+','+Math.min(255,Math.round(b2*bright))+',0.75)';
    }
    var t=(ph+dist*0.003)%1;if(t<0)t+=1;var idx=t*(PAL.length-1),i=Math.floor(idx),f=idx-i;
    var aa=PAL[i],b=PAL[Math.min(i+1,PAL.length-1)];
    return 'rgba('+Math.round(aa.r+(b.r-aa.r)*f)+','+Math.round(aa.g+(b.g-aa.g)*f)+','+Math.round(aa.b+(b.b-aa.b)*f)+',0.7)';
  }

  // Audio
  function initAudio(){
    aCtx=new(window.AudioContext||window.webkitAudioContext)();
    mGain=aCtx.createGain();mGain.gain.value=0.3;mGain.connect(aCtx.destination);
    var p1=aCtx.createOscillator();p1.type='sine';p1.frequency.value=110;
    var p2=aCtx.createOscillator();p2.type='sine';p2.frequency.value=165;
    var p3=aCtx.createOscillator();p3.type='triangle';p3.frequency.value=220;
    var pG=aCtx.createGain();pG.gain.value=0.04;
    p1.connect(pG);p2.connect(pG);p3.connect(pG);pG.connect(mGain);
    var lfo=aCtx.createOscillator();lfo.type='sine';lfo.frequency.value=0.15;
    var lfG=aCtx.createGain();lfG.gain.value=0.02;lfo.connect(lfG);lfG.connect(pG.gain);
    lfo.start();p1.start();p2.start();p3.start();
    beatInt=60/bpm;nextBT=aCtx.currentTime+0.1;scheduleBeat();
  }
  function scheduleBeat(){
    if(!aCtx||!musicOn)return;var now=aCtx.currentTime;
    while(nextBT<now+0.1){
      var bib=beatCount%4;
      if(bib===0||bib===2)playKick(nextBT);
      playHH(nextBT,bib===0?0.15:0.08);
      if(bib===0&&(beatCount%8)<4)playNote(nextBT);
      beatCount++;nextBT+=beatInt;
    }
    schTimer=setTimeout(scheduleBeat,25);
  }
  function playKick(t){var o=aCtx.createOscillator();o.type='sine';o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(40,t+0.12);var g=aCtx.createGain();g.gain.setValueAtTime(0.5,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.25);o.connect(g);g.connect(mGain);o.start(t);o.stop(t+0.3)}
  function playHH(t,v){var bs=aCtx.sampleRate*0.05,buf=aCtx.createBuffer(1,bs,aCtx.sampleRate),d=buf.getChannelData(0);for(var i=0;i<bs;i++)d[i]=Math.random()*2-1;var s=aCtx.createBufferSource();s.buffer=buf;var hp=aCtx.createBiquadFilter();hp.type='highpass';hp.frequency.value=7000;var g=aCtx.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.06);s.connect(hp);hp.connect(g);g.connect(mGain);s.start(t);s.stop(t+0.08)}
  function playNote(t){var notes=[220,261.6,293.7,329.6,392];var o=aCtx.createOscillator();o.type='triangle';o.frequency.value=notes[Math.floor(Math.random()*notes.length)];var g=aCtx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.1,t+0.05);g.gain.exponentialRampToValueAtTime(0.001,t+0.6);o.connect(g);g.connect(mGain);o.start(t);o.stop(t+0.7)}

  // Drawing
  function toLocal(px2,py2){var r=canvas.getBoundingClientRect();var x=px2-r.left,y=py2-r.top;var dx=x-cx,dy=y-cy;var c=Math.cos(-rotAngle),s=Math.sin(-rotAngle);return{x:dx*c-dy*s+cx,y:dx*s+dy*c+cy}}
  function _drawLine(ax,ay,bx,by){bufX.beginPath();bufX.moveTo(ax,ay);bufX.lineTo(bx,by);bufX.stroke()}
  function _rot(px2,py2,a){var co=Math.cos(a),sn=Math.sin(a);return{x:(px2-cx)*co-(py2-cy)*sn+cx,y:(px2-cx)*sn+(py2-cy)*co+cy}}
  function _mirX(px2,py2){return{x:-(px2-cx)+cx,y:py2}}
  function _mirY(px2,py2){return{x:px2,y:-(py2-cy)+cy}}
  function drawSym(x1,y1,x2,y2){
    var dist=Math.sqrt((x1-cx)*(x1-cx)+(y1-cy)*(y1-cy));var color=getColor(colorPh,dist);var sz=brushSize*(0.5+dist/radius*0.8);
    bufX.lineWidth=sz;bufX.lineCap='round';bufX.lineJoin='round';bufX.strokeStyle=color;
    var mode=_bwMirrors[_bwMirrorIdx];
    var step=(Math.PI*2)/symmetry;
    if(mode==='freehand'){
      _drawLine(x1,y1,x2,y2);
    }else if(mode==='radial'){
      for(var i=0;i<symmetry;i++){var r1=_rot(x1,y1,step*i),r2=_rot(x2,y2,step*i);_drawLine(r1.x,r1.y,r2.x,r2.y)}
    }else if(mode==='kaleidoscope'){
      for(var i=0;i<symmetry;i++){var r1=_rot(x1,y1,step*i),r2=_rot(x2,y2,step*i);_drawLine(r1.x,r1.y,r2.x,r2.y);
        var m1=_mirX(x1,y1),m2=_mirX(x2,y2);var rm1=_rot(m1.x,m1.y,step*i),rm2=_rot(m2.x,m2.y,step*i);_drawLine(rm1.x,rm1.y,rm2.x,rm2.y)}
    }else if(mode==='horizontal'){
      _drawLine(x1,y1,x2,y2);var m1=_mirX(x1,y1),m2=_mirX(x2,y2);_drawLine(m1.x,m1.y,m2.x,m2.y);
    }else if(mode==='quad'){
      _drawLine(x1,y1,x2,y2);
      var mx1=_mirX(x1,y1),mx2=_mirX(x2,y2);_drawLine(mx1.x,mx1.y,mx2.x,mx2.y);
      var my1=_mirY(x1,y1),my2=_mirY(x2,y2);_drawLine(my1.x,my1.y,my2.x,my2.y);
      var mb1=_mirY(mx1.x,mx1.y),mb2=_mirY(mx2.x,mx2.y);_drawLine(mb1.x,mb1.y,mb2.x,mb2.y);
    }else{
      // mandala — radial + alternating reflection (original)
      for(var i=0;i<symmetry;i++){var aa=step*i,co=Math.cos(aa),sn=Math.sin(aa);
        var rx1=(x1-cx)*co-(y1-cy)*sn+cx,ry1=(x1-cx)*sn+(y1-cy)*co+cy;
        var rx2=(x2-cx)*co-(y2-cy)*sn+cx,ry2=(x2-cx)*sn+(y2-cy)*co+cy;
        _drawLine(rx1,ry1,rx2,ry2);
        if(i%2===0){var mmx1=-(x1-cx)*co-(y1-cy)*sn+cx,mmy1=-(x1-cx)*sn+(y1-cy)*co+cy;var mmx2=-(x2-cx)*co-(y2-cy)*sn+cx,mmy2=-(x2-cx)*sn+(y2-cy)*co+cy;_drawLine(mmx1,mmy1,mmx2,mmy2)}}
    }
  }
  function gtp(e){return e.touches&&e.touches.length?{x:e.touches[0].clientX,y:e.touches[0].clientY}:{x:e.clientX,y:e.clientY}}
  function onD(e){e.preventDefault();var p=gtp(e);
    if(_bwDrawingPath){var r=canvas.getBoundingClientRect();_bwCustomPath=[{x:(p.x-r.left)/W,y:(p.y-r.top)/H}];return}
    var l=toLocal(p.x,p.y);drawing=true;lastX=l.x;lastY=l.y;strokes++;if(!aCtx)initAudio()}
  function onM(e){e.preventDefault();var p=gtp(e);
    if(_bwDrawingPath){var r=canvas.getBoundingClientRect();_bwCustomPath.push({x:(p.x-r.left)/W,y:(p.y-r.top)/H});return}
    if(!drawing)return;var l=toLocal(p.x,p.y);drawSym(lastX,lastY,l.x,l.y);lastX=l.x;lastY=l.y}
  function onU(e){e.preventDefault();
    if(_bwDrawingPath&&_bwCustomPath.length>2){_bwDrawingPath=false;sm('Custom path set! ('+_bwCustomPath.length+' points)');return}
    drawing=false}
  canvas.addEventListener('mousedown',onD);canvas.addEventListener('mousemove',onM);
  canvas.addEventListener('mouseup',onU);canvas.addEventListener('mouseleave',onU);
  canvas.addEventListener('touchstart',onD,{passive:false});
  canvas.addEventListener('touchmove',onM,{passive:false});
  canvas.addEventListener('touchend',onU,{passive:false});

  // Render loop
  var lt=0,_bwRaf=0;
  function _bwKillAudio(){
    if(schTimer){clearTimeout(schTimer);schTimer=null;}
    if(aCtx){try{aCtx.close();}catch(e){}aCtx=null;mGain=null;}
    musicOn=false;
  }
  // Kill audio when browser tab is hidden/minimized
  document.addEventListener('visibilitychange',function(){
    if(document.hidden&&aCtx&&_a==='bloomwheel'){aCtx.suspend();}
    else if(!document.hidden&&aCtx&&_a==='bloomwheel'){aCtx.resume();}
  });
  function render(ts){
    if(_a!=='bloomwheel'){_bwKillAudio();return}
    var dt=lt?(ts-lt)/1000:0.016;lt=ts;
    if(spinOn){
      var speed=(Math.PI*2)/(beatInt*16);
      var mode=_bwPaths[_bwPathIdx];
      _bwPathT+=dt*speed;
      rotAngle+=speed*dt;
      if(mode==='custom'&&_bwCustomPath.length>2){var ci=(_bwPathT*2)%_bwCustomPath.length;var fi=Math.floor(ci);var ff=ci-fi;var p0=_bwCustomPath[fi%_bwCustomPath.length];var p1=_bwCustomPath[(fi+1)%_bwCustomPath.length];cx=W*(p0.x+(p1.x-p0.x)*ff);cy=H*(p0.y+(p1.y-p0.y)*ff)}
    }
    colorPh+=dt*0.02;if(colorPh>1)colorPh-=1;
    ctx.fillStyle='#0d100c';ctx.fillRect(0,0,W,H);
    ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.strokeStyle='rgba(74,124,53,0.06)';ctx.lineWidth=1;ctx.stroke();
    ctx.strokeStyle='rgba(74,124,53,0.03)';ctx.lineWidth=0.5;
    var step=(Math.PI*2)/symmetry;
    for(var i=0;i<symmetry;i++){var ga=step*i+rotAngle;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(ga)*radius,cy+Math.sin(ga)*radius);ctx.stroke()}
    ctx.beginPath();ctx.arc(cx,cy,3,0,Math.PI*2);ctx.fillStyle='rgba(212,168,67,0.15)';ctx.fill();
    ctx.save();ctx.translate(cx,cy);ctx.rotate(rotAngle);ctx.translate(-cx,-cy);ctx.drawImage(bufC,0,0,W,H);ctx.restore();
    // Draw custom path preview
    if(_bwDrawingPath&&_bwCustomPath.length>1){ctx.beginPath();ctx.moveTo(_bwCustomPath[0].x*W,_bwCustomPath[0].y*H);for(var pi=1;pi<_bwCustomPath.length;pi++)ctx.lineTo(_bwCustomPath[pi].x*W,_bwCustomPath[pi].y*H);ctx.strokeStyle='rgba(200,168,75,0.5)';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.stroke();ctx.setLineDash([])}
    _bwRaf=requestAnimationFrame(render);
  }

  // Controls
  // Movement patterns — circle + custom path only
  var _bwPaths=['circle','custom'];
  var _bwPathIdx=0,_bwCustomPath=[],_bwDrawingPath=false,_bwPathT=0;
  var _bwUserColor=null; // null = auto palette
  // Mirror modes
  var _bwMirrors=['freehand','mandala','radial','kaleidoscope','horizontal','quad'];
  var _bwMirrorIdx=0;

  var _bbs='min-height:56px;min-width:clamp(72px,20vw,96px);padding:0.5rem 0.4rem;font-size:clamp(.55rem,1.6vw,.7rem);background:rgba(26,31,23,.9);border:1.5px solid rgba(74,124,53,.25);border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.03);text-align:center';
  // Color palette
  var _bwPalette=['#7ab356','#4a7c35','#c8a84b','#e8dcc8','#c07070','#5bafd4','#9b59b6','#c76a30','#e8a050','#3B5323','#D4A843','#fff'];
  var palDiv=document.createElement('div');palDiv.style.cssText='display:flex;gap:4px;justify-content:center;flex-wrap:wrap;padding:6px 4px';
  _bwPalette.forEach(function(c){
    var sw=document.createElement('div');
    sw.style.cssText='width:clamp(28px,8vw,36px);height:clamp(28px,8vw,36px);border-radius:50%;background:'+c+';cursor:pointer;border:3px solid rgba(0,0,0,0.3);box-shadow:0 1px 4px rgba(0,0,0,0.3);transition:transform .12s,border-color .12s';
    sw.onclick=function(){_BWColor(c);palDiv.querySelectorAll('div').forEach(function(d){d.style.borderColor='rgba(0,0,0,0.3)';d.style.transform='scale(1)'});sw.style.borderColor='var(--gold)';sw.style.transform='scale(1.2)'};
    palDiv.appendChild(sw);
  });
  // Auto color rainbow button
  var autoSw=document.createElement('div');
  autoSw.id='BWautoSw';
  autoSw.style.cssText='width:clamp(28px,8vw,36px);height:clamp(28px,8vw,36px);border-radius:50%;background:conic-gradient(#c07070,#e8a050,#c8a84b,#7ab356,#5bafd4,#9b59b6,#c07070);cursor:pointer;border:3px solid var(--gold);box-shadow:0 1px 4px rgba(0,0,0,0.3);transition:transform .12s;transform:scale(1.2)';
  autoSw.onclick=function(){_bwUserColor=null;palDiv.querySelectorAll('div').forEach(function(d){d.style.borderColor='rgba(0,0,0,0.3)';d.style.transform='scale(1)'});autoSw.style.borderColor='var(--gold)';autoSw.style.transform='scale(1.2)'};
  palDiv.appendChild(autoSw);
  a.appendChild(palDiv);

  var ctrlDiv=mc(a);
  ctrlDiv.innerHTML='<div style="display:flex;gap:6px;padding:6px 0;flex-wrap:wrap;justify-content:center">'
    +'<button class="gb" style="'+_bbs+'" onclick="_BWS(4)" id="BWs4">4</button>'
    +'<button class="gb gon" style="'+_bbs+'" onclick="_BWS(8)" id="BWs8">8</button>'
    +'<button class="gb" style="'+_bbs+'" onclick="_BWS(12)" id="BWs12">12</button>'
    +'<button class="gb" style="'+_bbs+';min-width:clamp(100px,28vw,130px)" onclick="_BWMirror()" id="BWmir">✎ FREEHAND</button>'
    +'<button class="gb" style="'+_bbs+'" onclick="_BWBrush()" id="BWbr">● 3</button>'
    +'<button class="gb" style="'+_bbs+';min-width:clamp(88px,24vw,110px)" onclick="_BWPath()" id="BWpath">◯ SPIN</button>'
    +'<button class="gb" style="'+_bbs+'" onclick="_BWBpm(-10)">BPM−</button>'
    +'<button class="gb" style="'+_bbs+'" onclick="_BWBpm(10)">BPM+</button>'
    +'<button class="gb" style="'+_bbs+'" onclick="_BWMusic()" id="BWmus">♫ OFF</button>'
    +'<button class="gb" style="'+_bbs+';min-width:clamp(88px,24vw,110px)" onclick="_BWFreeze()" id="BWfrz">❄ FREEZE</button>'
    +'<button class="gb" style="'+_bbs+'" onclick="_BWClear()">✕ CLEAR</button>'
    +'<button class="gb" style="'+_bbs+';border-color:rgba(200,168,75,0.3);color:var(--gold)" onclick="_BWSave()">💾 SAVE</button>'
    +'</div>';

  window._BWS=function(n){symmetry=n;document.getElementById('BWsym').textContent=n;
    document.getElementById('BWs4').className='gb'+(n===4?' gon':'');
    document.getElementById('BWs8').className='gb'+(n===8?' gon':'');
    document.getElementById('BWs12').className='gb'+(n===12?' gon':'')};
  window._BWBpm=function(d){bpm=Math.max(50,Math.min(160,bpm+d));beatInt=60/bpm;document.getElementById('BWbpm').textContent=bpm+' BPM'};
  window._BWMusic=function(){musicOn=!musicOn;var btn=document.getElementById('BWmus');if(btn){btn.textContent=musicOn?'♫ ON':'♫ OFF';btn.className='gb'+(musicOn?' gon':'')}
    if(musicOn){if(!aCtx)initAudio();else{nextBT=aCtx.currentTime+0.1;scheduleBeat()}}
    if(!musicOn&&schTimer)clearTimeout(schTimer);if(mGain)mGain.gain.value=musicOn?0.3:0};
  window._BWBrush=function(){brushIdx=(brushIdx+1)%brushSizes.length;brushSize=brushSizes[brushIdx];var btn=document.getElementById('BWbr');if(btn)btn.textContent='● '+Math.round(brushSize)};
  window._BWColor=function(c){_bwUserColor=c;var as=document.getElementById('BWautoSw');if(as){as.style.borderColor='rgba(0,0,0,0.3)';as.style.transform='scale(1)'}};
  window._BWMirror=function(){
    _bwMirrorIdx=(_bwMirrorIdx+1)%_bwMirrors.length;
    var names={freehand:'✎ FREEHAND',mandala:'✿ MANDALA',radial:'❋ RADIAL',kaleidoscope:'◆ KALEIDOSCOPE',horizontal:'↔ MIRROR',quad:'✦ QUAD'};
    var btn=document.getElementById('BWmir');if(btn){btn.textContent=names[_bwMirrors[_bwMirrorIdx]];btn.className='gb gon'}
  };
  window._BWPath=function(){
    _bwPathIdx=(_bwPathIdx+1)%_bwPaths.length;_bwPathT=0;
    var p=_bwPaths[_bwPathIdx];
    var btn=document.getElementById('BWpath');if(btn){btn.textContent=p==='circle'?'◯ SPIN':'✏ DRAW PATH';btn.className='gb'+(p==='custom'?' gon':'')}
    if(p==='custom'){_bwCustomPath=[];_bwDrawingPath=true;sm('Draw a path on canvas, then tap DRAW PATH again')}
    else{_bwDrawingPath=false;cx=W/2;cy=H/2}
  };
  window._BWFreeze=function(){spinOn=!spinOn;var btn=document.getElementById('BWfrz');if(btn){btn.textContent=spinOn?'❄ FREEZE':'▶ RESUME';btn.className='gb'+(spinOn?'':' gon')}sm(spinOn?'Spinning':'Frozen — screenshot or save!')};
  window._BWClear=function(){bufX.clearRect(0,0,bufC.width,bufC.height);rotAngle=0;strokes=0;_bwCustomPath=[];_bwDrawingPath=false;_bwPathIdx=0;_bwPathT=0;cx=W/2;cy=H/2;var pb=document.getElementById('BWpath');if(pb)pb.textContent='◯ SPIN';sm('Canvas cleared')};
  window._BWSave=function(){
    var sc=document.createElement('canvas');sc.width=W*dpr;sc.height=H*dpr;var sx=sc.getContext('2d');sx.setTransform(dpr,0,0,dpr,0,0);
    sx.fillStyle='#0d100c';sx.fillRect(0,0,W,H);sx.save();sx.beginPath();sx.arc(cx,cy,radius,0,Math.PI*2);sx.clip();sx.drawImage(bufC,0,0,W,H);sx.restore();
    sx.beginPath();sx.arc(cx,cy,radius,0,Math.PI*2);sx.strokeStyle='rgba(74,124,53,0.3)';sx.lineWidth=2;sx.stroke();
    sx.fillStyle='rgba(232,220,200,0.2)';sx.font='10px Bebas Neue,sans-serif';sx.textAlign='center';sx.fillText('BLOOM WHEEL — LUCID WINDS',cx,H-10);
    var lk=document.createElement('a');lk.download='bloom-wheel-'+Date.now()+'.png';lk.href=sc.toDataURL('image/png');lk.click();
    _e('milestone');_sr('bloomwheel',{w:true,s:Math.round((Date.now()-startT)/1000)});sm('Mandala saved!')};

  // Hash earning — 1 per 60 seconds of active drawing
  setInterval(function(){if(_a==='bloomwheel'&&strokes>0)_e('progress')},60000);

  resize();window.addEventListener('resize',resize);
  requestAnimationFrame(render);
}
// ═══ BACKGAMMON — Garden Gate ═══
function GBG(a){
  var B,DICE,DICE_USED,TURN,SEL,VALID_DESTS,PHASE,MOVES_LEFT,BO_H,BO_A;
  ms(a,'<span class="gp-you" style="color:#7AB956">You: <strong id="BGh">0</strong></span> · <span class="gp-ai" style="color:#C47A7A">AI: <strong id="BGa">0</strong></span>');mm(a);
  var wrap=document.createElement('div');wrap.id='BGwrap';wrap.className='bg-outer';wrap.style.cssText='user-select:none;-webkit-user-select:none';a.appendChild(wrap);
  mc(a).innerHTML='<button class="gb-new" onclick="_BGN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  function init(){
    B=new Array(26);for(var i=0;i<26;i++)B[i]=0;
    B[24]=2;B[13]=5;B[8]=3;B[6]=5;
    B[1]=-2;B[12]=-5;B[17]=-3;B[19]=-5;
    DICE=[0,0];DICE_USED=[false,false];TURN='human';SEL=-1;VALID_DESTS=[];
    PHASE='roll';MOVES_LEFT=[];BO_H=0;BO_A=0;rn();
  }
  function rollDice(){
    var d1=Math.floor(Math.random()*6)+1,d2=Math.floor(Math.random()*6)+1;
    DICE=[d1,d2];MOVES_LEFT=d1===d2?[d1,d1,d1,d1]:[d1,d2];DICE_USED=[false,false];PHASE='move';SEL=-1;VALID_DESTS=[];
  }
  function getBar(w){return w==='human'?B[25]:B[0]}
  function setBar(w,v){if(w==='human')B[25]=v;else B[0]=v}
  function myCheckers(p,w){return w==='human'?Math.max(0,B[p]):Math.max(0,-B[p])}
  function canLand(p,w){if(p<1||p>24)return false;return w==='human'?B[p]>=-1:B[p]<=1}
  function allInHome(w){
    if(getBar(w)>0)return false;
    if(w==='human'){for(var i=7;i<=25;i++)if(B[i]>0)return false;return true}
    for(var i=0;i<=18;i++)if(B[i]<0)return false;if(B[0]<0)return false;return true;
  }
  function getValidMoves(w){
    var moves=[],bar=getBar(w);
    if(bar>0){MOVES_LEFT.forEach(function(d,idx){var dest=w==='human'?(25-d):d;if(dest>=1&&dest<=24&&canLand(dest,w))moves.push({from:'bar',to:dest,die:d,dieIdx:idx})});return moves}
    var bo=allInHome(w);
    MOVES_LEFT.forEach(function(d,idx){
      var dir=w==='human'?-1:1;
      for(var p=w==='human'?24:1;w==='human'?p>=1:p<=24;p+=dir){
        if(myCheckers(p,w)<=0)continue;var dest=p+(d*dir);
        if(dest>=1&&dest<=24&&canLand(dest,w)){moves.push({from:p,to:dest,die:d,dieIdx:idx})}
        else if(bo){
          if(w==='human'&&dest<=0){if(dest===0)moves.push({from:p,to:'off',die:d,dieIdx:idx});else{var hx=false;for(var h=p+1;h<=6;h++)if(B[h]>0){hx=true;break}if(!hx)moves.push({from:p,to:'off',die:d,dieIdx:idx})}}
          else if(w==='ai'&&dest>=25){if(dest===25)moves.push({from:p,to:'off',die:d,dieIdx:idx});else{var hx2=false;for(var h2=p-1;h2>=19;h2--)if(B[h2]<0){hx2=true;break}if(!hx2)moves.push({from:p,to:'off',die:d,dieIdx:idx})}}
        }
      }
    });return moves;
  }
  function applyMove(mv,w){
    if(mv.from==='bar'){setBar(w,getBar(w)-1)}else{B[mv.from]+=(w==='human'?-1:1)}
    if(mv.to==='off'){if(w==='human')BO_H++;else BO_A++}
    else{
      if(w==='human'&&B[mv.to]===-1){B[mv.to]=0;B[0]=(B[0]||0)-1;sm('Hit! Sent to bar')}
      else if(w==='ai'&&B[mv.to]===1){B[mv.to]=0;B[25]=(B[25]||0)+1;sm('AI hits your seed!')}
      B[mv.to]+=(w==='human'?1:-1);
    }
    for(var i=0;i<MOVES_LEFT.length;i++){if(MOVES_LEFT[i]===mv.die){MOVES_LEFT.splice(i,1);break}}
  }
  function selectPt(p){
    if(PHASE!=='move'||TURN!=='human')return;
    if(SEL===-1){
      var bar=getBar('human');
      if(bar>0){if(p!=='bar'){sm('Must enter from bar first');return}SEL='bar'}
      else{if(p==='bar'||B[p]<=0)return;SEL=p}
      var moves=getValidMoves('human');VALID_DESTS=[];
      moves.forEach(function(mv){if(mv.from===SEL)VALID_DESTS.push(mv)});
      if(VALID_DESTS.length===0){SEL=-1;sm('No moves from here');return}
      rn();
    }else{
      var chosen=null;VALID_DESTS.forEach(function(mv){if(mv.to===p||(mv.to==='off'&&p==='off'))chosen=mv});
      if(!chosen){SEL=-1;VALID_DESTS=[];selectPt(p);return}
      applyMove(chosen,'human');_play('tap');SEL=-1;VALID_DESTS=[];
      if(BO_H>=15){_e('game_win');_playWin();sm('All seeds home!');_sr('backgammon',{w:true,s:1});rn();return}
      if(MOVES_LEFT.length>0){var rem=getValidMoves('human');if(rem.length===0){sm('No more moves');MOVES_LEFT=[];endTurn()}else rn()}
      else endTurn();
    }
  }
  function endTurn(){TURN=TURN==='human'?'ai':'human';PHASE='roll';SEL=-1;VALID_DESTS=[];rn();
    if(TURN==='ai')setTimeout(function(){rollDice();rn();setTimeout(aiPlay,500)},400);
  }
  // ═══ GNUBG-INSPIRED POSITION EVALUATION ═══
  function evalPos(board,boH,boA){
    var s=0;
    // 1. Pip count (race) — lower is better for AI
    var aiPips=0,huPips=0;
    for(var i=1;i<=24;i++){if(board[i]<0)aiPips+=Math.abs(board[i])*(25-i);if(board[i]>0)huPips+=board[i]*i}
    aiPips+=Math.abs(board[0]||0)*25;huPips+=(board[25]||0)*25;
    s+=(huPips-aiPips)*0.5;
    // 2. Blot exposure — penalize AI blots
    for(var i=1;i<=24;i++){if(board[i]===-1){s-=12;if(i<=6)s-=8;}}// extra penalty in human home
    // 3. Prime detection — reward consecutive AI-held points
    var run=0,bestRun=0;
    for(var i=1;i<=24;i++){if(board[i]<=-2){run++;if(run>bestRun)bestRun=run}else run=0}
    s+=bestRun*bestRun*6;
    // 4. Anchors in human home (points 1-6 held by AI)
    for(var i=1;i<=6;i++)if(board[i]<=-2){s+=10;if(i>=4)s+=5}
    // 5. Home board strength (AI home = 19-24)
    for(var i=19;i<=24;i++)if(board[i]<=-2)s+=8;
    // 6. Stack penalty
    for(var i=1;i<=24;i++)if(board[i]<-5)s-=(Math.abs(board[i])-5)*4;
    // 7. Bar penalty
    s-=(board[25]||0)*(-8);// human on bar is good for AI
    s-=Math.abs(board[0]||0)*35;// AI on bar is terrible
    // 8. Bearing off progress
    s+=boA*18;s-=boH*18;
    return s;
  }
  function aiPlay(){
    if(MOVES_LEFT.length===0){endTurn();return}
    var moves=getValidMoves('ai');if(moves.length===0){MOVES_LEFT=[];endTurn();return}
    // Evaluate full position after each candidate move
    var best=null,bs=-999999;
    moves.forEach(function(mv){
      // Save state
      var savedB=B.slice(),savedML=MOVES_LEFT.slice(),savedBoH=BO_H,savedBoA=BO_A;
      applyMove(mv,'ai');
      var sc=evalPos(B,BO_H,BO_A);
      // Restore state
      B=savedB;MOVES_LEFT=savedML;BO_H=savedBoH;BO_A=savedBoA;
      if(sc>bs){bs=sc;best=mv}
    });
    if(best){applyMove(best,'ai');if(BO_A>=15){_e('game_loss');sm('AI wins!');_sr('backgammon',{w:false,s:0});rn();return}}
    if(MOVES_LEFT.length>0)setTimeout(aiPlay,250);else setTimeout(endTurn,250);rn();
  }
  function rPt(p,side){
    var count=B[p],who=count>0?'human':count<0?'ai':'',abs=Math.abs(count);
    var isVD=false;VALID_DESTS.forEach(function(mv){if(mv.to===p)isVD=true});
    var isSel=SEL===p,triCls=p%2===0?'dark':'light';
    var isHome=(p>=1&&p<=6)||(p>=19&&p<=24);
    var h='<div class="point '+side+(isVD?' valid-dest':'')+(isHome?' home':'')+'" onclick="_BGS('+p+')">';
    h+='<div class="tri '+triCls+'"></div><div class="checkers">';
    var show=Math.min(abs,5);
    for(var i=0;i<show;i++){var sc=who&&isSel&&i===show-1?' selected':'';h+='<div class="checker '+who+sc+'">';if(i===show-1&&abs>5)h+='<span class="checker-count">'+abs+'</span>';h+='</div>'}
    h+='</div><div class="pnum">'+p+'</div></div>';
    return h;
  }
  function rn(){
    var h='';
    document.getElementById('BGh').textContent=BO_H;document.getElementById('BGa').textContent=BO_A;
    var st=PHASE==='roll'?(TURN==='human'?'Tap Roll':'AI rolling...'):PHASE==='move'?(TURN==='human'?(SEL!==-1?'Tap where to move':'Tap a seed to move'):'AI thinking...'):'Game Over';
    sm(st);
    // Full board
    h+='<div class="bg-wrap">';
    h+='<div class="bg-board"><div class="bg-inner">';
    // Top half: points 13-18, bar, 19-24 (AI home on right)
    h+='<div class="bg-half"><div class="bg-quad">';
    for(var p=13;p<=18;p++)h+=rPt(p,'top');
    h+='</div><div class="bg-bar">';
    if(B[0]<0){var ab=Math.abs(B[0]);for(var i=0;i<Math.min(ab,4);i++)h+='<div class="checker ai"></div>';if(ab>4)h+='<div style="font-size:9px;color:#C47A7A">+'+(ab-4)+'</div>'}
    h+='</div><div class="bg-quad">';
    for(var p2=19;p2<=24;p2++)h+=rPt(p2,'top');
    h+='</div></div>';
    h+='<div class="bg-sep"></div>';
    // Bottom half: 12-7, bar, 6-1 (Player home on right)
    h+='<div class="bg-half"><div class="bg-quad">';
    for(var p3=12;p3>=7;p3--)h+=rPt(p3,'bot');
    h+='</div><div class="bg-bar">';
    if(B[25]>0){for(var i2=0;i2<Math.min(B[25],4);i2++)h+='<div class="checker human"></div>';if(B[25]>4)h+='<div style="font-size:9px;color:#7AB956">+'+(B[25]-4)+'</div>'}
    h+='</div><div class="bg-quad">';
    for(var p4=6;p4>=1;p4--)h+=rPt(p4,'bot');
    h+='</div></div>';
    // Dice overlay (floats over the center bar)
    h+='<div class="bg-dice">';
    if(PHASE==='roll'&&TURN==='human'){
      h+='<button class="gb bg-roll-btn" onclick="_BGR()">🎲 ROLL</button>';
    }else if(PHASE==='move'||PHASE==='gameover'){
      DICE.forEach(function(d){var used=MOVES_LEFT.indexOf(d)===-1;h+='<div class="bg-die'+(used?' used':'')+'">'+d+'</div>'});
      if(DICE[0]===DICE[1])h+='<span class="bg-doubles">×'+MOVES_LEFT.length+'</span>';
    }
    h+='</div>';
    h+='</div></div>';
    // Bearing off display
    h+='<div class="bg-bo">';
    h+='<div class="bg-bo-sec"><span class="bg-bo-lbl" style="color:#7AB956">YOU: '+BO_H+'/15</span>';
    for(var bi2=0;bi2<Math.min(BO_H,15);bi2++)h+='<div class="bg-bo-pip human"></div>';
    h+='</div>';
    h+='<div class="bg-bo-sec"><span class="bg-bo-lbl" style="color:#C47A7A">AI: '+BO_A+'/15</span>';
    for(var bi=0;bi<Math.min(BO_A,15);bi++)h+='<div class="bg-bo-pip ai"></div>';
    h+='</div></div>';
    // Bar info
    if(B[25]>0||B[0]<0){h+='<div class="bg-info">';if(B[25]>0)h+='🌿 You: '+B[25]+' on bar ';if(B[0]<0)h+='🌸 AI: '+Math.abs(B[0])+' on bar';h+='</div>'}
    // Bar entry button
    if(PHASE==='move'&&TURN==='human'&&getBar('human')>0){h+='<div style="text-align:center;padding:6px"><button class="gb" onclick="_BGS(\'bar\')" style="min-height:52px;font-size:0.8rem;min-width:160px">↩ ENTER FROM BAR</button></div>'}
    // Bear off buttons
    if(PHASE==='move'&&TURN==='human'&&allInHome('human')&&MOVES_LEFT.length>0){
      var bom=getValidMoves('human').filter(function(m){return m.to==='off'});
      if(bom.length>0){h+='<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;padding:6px">';bom.forEach(function(m){h+='<button class="gb" onclick="_BGB('+m.from+','+m.die+')" style="min-height:52px;font-size:0.7rem">BEAR OFF PT.'+m.from+'</button>'});h+='</div>'}
    }
    h+='</div>';
    wrap.innerHTML=h;
  }
  window._BGR=function(){if(PHASE!=='roll'||TURN!=='human')return;rollDice();_play('dice');var moves=getValidMoves('human');if(moves.length===0){sm('No valid moves — turn forfeited');MOVES_LEFT=[];rn();setTimeout(endTurn,1000);return}rn()};
  window._BGS=function(p){selectPt(p)};
  window._BGB=function(from,die){var moves=getValidMoves('human');var mv=null;moves.forEach(function(m){if(m.from===from&&m.die===die&&m.to==='off')mv=m});if(!mv)return;applyMove(mv,'human');_play('tap');SEL=-1;VALID_DESTS=[];if(BO_H>=15){_e('game_win');_playWin();sm('All seeds home!');_sr('backgammon',{w:true,s:1});rn();return}if(MOVES_LEFT.length>0){var rem=getValidMoves('human');if(rem.length===0){MOVES_LEFT=[];endTurn()}else rn()}else endTurn()};
  window._BGN=function(){init()};
  init();
}
// ═══ DOUBLE SHUTTER — Strategy Shut the Box (two rows) ═══
function GDS(a){
  var rows,sel,d1,d2,phase,rolls,gameOver,_row1Celebrated;
  ms(a,'Rolls: <strong id="DSr">0</strong> · Open: <strong id="DSo">90</strong>');mm(a);
  var dir=document.createElement('div');
  dir.style.cssText='text-align:center;padding:0.4rem 0.8rem;margin:0.2rem auto;max-width:400px;font-family:DM Sans,sans-serif;font-size:clamp(0.6rem,1.7vw,0.75rem);color:var(--cream);line-height:1.5;opacity:0.85';
  dir.innerHTML='Shut <strong style="color:var(--gold)">Row 1 first</strong>, then Row 2 unlocks. Roll <strong>2 dice</strong>, tap any open tiles that <strong>add up to your roll</strong>.<br>If your remaining tiles total <strong>6 or less</strong>, you can roll just <strong>1 die</strong>. Shut both rows = perfect game!';
  a.appendChild(dir);
  var wrap=document.createElement('div');wrap.className='ds-wrap';a.appendChild(wrap);
  var r1Lbl=document.createElement('div');r1Lbl.className='ds-rowlbl';r1Lbl.textContent='ROW 1';wrap.appendChild(r1Lbl);
  var r1=document.createElement('div');r1.className='ds-row';r1.id='DSr1';wrap.appendChild(r1);
  var r2Lbl=document.createElement('div');r2Lbl.className='ds-rowlbl';r2Lbl.textContent='ROW 2';wrap.appendChild(r2Lbl);
  var r2=document.createElement('div');r2.className='ds-row';r2.id='DSr2';wrap.appendChild(r2);
  var dz=document.createElement('div');dz.className='ds-dice';dz.id='DSdz';wrap.appendChild(dz);
  var info=document.createElement('div');info.className='ds-info';info.id='DSinfo';wrap.appendChild(info);
  mc(a).innerHTML='<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;padding:6px"><button class="gb" id="DSroll2" style="min-height:52px;min-width:120px;font-size:0.85rem;font-family:Bebas Neue,sans-serif;letter-spacing:0.08em" onclick="_DSRoll(2)">🎲 ROLL 2</button><button class="gb" id="DSroll1" style="min-height:52px;min-width:120px;font-size:0.85rem;font-family:Bebas Neue,sans-serif;letter-spacing:0.08em;display:none" onclick="_DSRoll(1)">🎲 ROLL 1</button><button class="gb" id="DSshut" style="min-height:52px;min-width:120px;font-size:0.85rem;font-family:Bebas Neue,sans-serif;letter-spacing:0.08em;background:rgba(200,168,75,0.15);border-color:var(--gold);color:var(--gold);display:none" onclick="_DSShut()">✓ SHUT</button><button class="gb-new" onclick="_DSN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button></div>';
  function row1Done(){for(var i=0;i<9;i++)if(!rows[0][i])return false;return true}
  function row2Done(){for(var i=0;i<9;i++)if(!rows[1][i])return false;return true}
  function bothDone(){return row1Done()&&row2Done()}
  function activeRow(){return row1Done()?1:0}
  function openSum(){var ar=activeRow(),s=0;for(var i=0;i<9;i++)if(!rows[ar][i])s+=(i+1);return s}
  function openCount(){var ar=activeRow(),n=0;for(var i=0;i<9;i++)if(!rows[ar][i])n++;return n}
  function selSum(){var s=0;sel.forEach(function(t){s+=(t.n)});return s}
  function canMakeSum(target){
    var ar=activeRow();
    var open=[];for(var i=0;i<9;i++)if(!rows[ar][i])open.push(i+1);
    function find(idx,rem){if(rem===0)return true;if(rem<0||idx>=open.length)return false;return find(idx+1,rem-open[idx])||find(idx+1,rem)}
    return find(0,target);
  }
  function rn(){
    var ar=activeRow();
    r2Lbl.textContent=ar===1?'ROW 2 — UNLOCKED':'ROW 2 — locked until Row 1 is shut';
    r2Lbl.style.color=ar===1?'var(--gold)':'var(--muted)';
    r2.style.opacity=ar===1?'1':'0.4';
    r2.style.filter=ar===1?'none':'grayscale(0.6)';
    [r1,r2].forEach(function(rowEl,ri){
      rowEl.innerHTML='';
      for(var i=0;i<9;i++){
        var t=document.createElement('div');t.className='ds-tile';
        if(rows[ri][i])t.className+=' shut';
        var isSel=sel.some(function(s){return s.row===ri&&s.idx===i});
        if(isSel)t.className+=' sel';
        t.textContent=(i+1);
        t.setAttribute('data-r',ri);t.setAttribute('data-i',i);
        if(!rows[ri][i]&&phase==='select'&&!gameOver&&ri===ar){
          t.onclick=function(){
            var r=parseInt(this.getAttribute('data-r')),idx=parseInt(this.getAttribute('data-i'));
            var existing=sel.findIndex(function(s){return s.row===r&&s.idx===idx});
            if(existing>=0)sel.splice(existing,1);
            else sel.push({row:r,idx:idx,n:idx+1});
            _play('tap');rn();
          };
        }
        rowEl.appendChild(t);
      }
    });
    dz.innerHTML='';
    if(d1){var dd1=document.createElement('div');dd1.className='ds-die';dd1.innerHTML='<img src="assets/dice/d'+d1+'.png" alt="'+d1+'"/>';dz.appendChild(dd1);}
    if(d2){var dd2=document.createElement('div');dd2.className='ds-die';dd2.innerHTML='<img src="assets/dice/d'+d2+'.png" alt="'+d2+'"/>';dz.appendChild(dd2);}
    var target=(d1||0)+(d2||0);
    var ss=selSum();
    if(phase==='roll'){info.textContent='Open: '+openSum()+' — tap ROLL to play';}
    else if(phase==='select'){info.innerHTML='Roll: <strong>'+target+'</strong> · Selected: <strong>'+ss+'</strong> / '+target;}
    var b2=document.getElementById('DSroll2'),b1=document.getElementById('DSroll1'),bs=document.getElementById('DSshut');
    if(phase==='roll'&&!gameOver){
      b2.style.display='';
      b1.style.display=openSum()<=6?'':'none';
      bs.style.display='none';
    }else if(phase==='select'){
      b2.style.display='none';b1.style.display='none';
      bs.style.display=(ss===target&&ss>0)?'':'none';
    }else{b2.style.display='none';b1.style.display='none';bs.style.display='none';}
    document.getElementById('DSr').textContent=rolls;
    document.getElementById('DSo').textContent=openSum();
  }
  window._DSRoll=function(n){
    if(phase!=='roll'||gameOver)return;
    if(n===1&&openSum()>6){sm('Need ≤6 remaining to roll 1');return}
    _play('snap');
    d1=Math.floor(Math.random()*6)+1;
    d2=n===2?Math.floor(Math.random()*6)+1:0;
    rolls++;phase='select';sel=[];
    var target=d1+d2;
    rn();
    if(!canMakeSum(target)){
      gameOver=true;
      var finalScore=openSum();
      sm('🍂 Stuck on '+target+'! Score: '+finalScore+' (lower is better)');
      _play('lose');_e('game_loss');_sr('doubleshutter',{w:false,s:finalScore});
      rn();
    }
  };
  window._DSShut=function(){
    if(phase!=='select')return;
    var target=d1+d2,ss=selSum();
    if(ss!==target){sm('Selected sum must equal '+target);return}
    _play('drop');
    sel.forEach(function(s){rows[s.row][s.idx]=true});
    sel=[];_e('progress');
    if(bothDone()){
      gameOver=true;
      sm('🌿 PERFECT! Both rows shut!');_e('game_win');_playWin();_sr('doubleshutter',{w:true,s:0});
      phase='done';rn();return;
    }
    if(row1Done()&&!_row1Celebrated){
      _row1Celebrated=true;
      sm('🌿 Row 1 shut! Row 2 unlocked.');_e('milestone');
    }
    if(openCount()%6===0)_e('milestone');
    phase='roll';rn();
  };
  window._DSN=function(){
    rows=[new Array(9).fill(false),new Array(9).fill(false)];
    sel=[];d1=0;d2=0;phase='roll';rolls=0;gameOver=false;_row1Celebrated=false;
    sm('Tap ROLL to begin! Shut Row 1 first.');rn();
  };
  _DSN();
}

try{window._gameFns.memory=GM}catch(e){}    // Memory Garden
try{window._gameFns.merge=GR}catch(e){}     // Merge 2048
try{window._gameFns.simon=GS}catch(e){}     // Seasonal Cycle
try{window._gameFns.lights=GL}catch(e){}    // Glow Shrooms
try{window._gameFns.mines=GN}catch(e){}     // Root Rot
try{window._gameFns.sudoku=GU}catch(e){}    // Soil Grid
try{window._gameFns.wordsearch=GW}catch(e){}// Root Words
try{window._gameFns.hanoi=GH}catch(e){}     // Root Stack
try{window._gameFns.flood=GFL}catch(e){}    // Autumn Leaves
try{window._gameFns.pipe=GPP}catch(e){}     // Vine Flow
try{window._gameFns.chess=GCH}catch(e){}    // Grove Chess
try{window._gameFns.c4=G4}catch(e){}        // Connect Fleur
try{window._gameFns.song=GSG}catch(e){}     // Seed Song
try{window._gameFns.slider=GD}catch(e){}    // 15 Puzzle
try{window._gameFns.farkle=GF}catch(e){}    // Farkle
try{window._gameFns.golf=GGO}catch(e){}     // Golf Solitaire
try{window._gameFns.klondike=GK}catch(e){}  // Klondike
try{window._gameFns.spider=GSP}catch(e){}   // Spider
try{window._gameFns.freecell=GFC}catch(e){} // Freecell
try{window._gameFns.pyramid=GP}catch(e){}   // Pyramid
try{window._gameFns.tripeaks=GT}catch(e){}  // TriPeaks
try{window._gameFns.yahtzee=GY}catch(e){}   // Yahtzee
try{window._gameFns.picross=GX}catch(e){}   // Picross
try{window._gameFns.checkers=GCK}catch(e){} // Checkers
try{window._gameFns.reversi=GRV}catch(e){}  // Reversi
try{window._gameFns.mastermind=GMM}catch(e){}// Mastermind
try{window._gameFns.colorsort=GCS}catch(e){}// Color Sort
try{window._gameFns.battleship=GBS}catch(e){}// Battleship
try{window._gameFns.sokoban=GSK}catch(e){}  // Sokoban
try{window._gameFns.backgammon=GBG}catch(e){} // Backgammon
try{window._gameFns.bloomwheel=GBW}catch(e){} // Bloom Wheel
try{window._gameFns.petalfall=GPF}catch(e){} // Petal Fall
try{window._gameFns.doubleshutter=GDS}catch(e){} // Double Shutter


_bp();console.log('[FG] Hub v4 — '+G.length+' games');
})();
