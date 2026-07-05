// ═══ LUCID WINDS — Word Search (Root Words) ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr;

(function injectWSStyle(){
  if(document.getElementById('ws-feedback-style'))return;
  var s=document.createElement('style');s.id='ws-feedback-style';
  s.textContent=[
    '@keyframes wsFlash{0%{background:rgba(122,179,86,.15);transform:scale(1)}40%{background:rgba(122,179,86,.85);box-shadow:0 0 14px rgba(122,179,86,.8);transform:scale(1.15)}100%{background:rgba(122,179,86,.35);transform:scale(1)}}',
    '@keyframes wsShine{0%{background-position:-120% 0}100%{background-position:220% 0}}',
    '@keyframes wsMiss{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}',
    '@keyframes wsWin{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}',
    '@keyframes wsPop{0%{transform:scale(0.3);opacity:0}55%{transform:scale(1.18);opacity:1}100%{transform:scale(1);opacity:1}}',
    '.wg{touch-action:none;user-select:none;-webkit-user-select:none;cursor:pointer;}',
    '.wc.wf-flash{animation:wsFlash .55s ease-out;color:#0d100c!important;font-weight:700;position:relative;z-index:2}',
    '.wc.wf-shine{position:relative;overflow:hidden}',
    '.wc.wf-shine::after{content:"";position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(100deg,transparent 20%,rgba(232,220,200,.75) 50%,transparent 80%);background-size:200% 100%;animation:wsShine .7s ease-out;pointer-events:none;z-index:3}',
    '.wc.wd{background:rgba(200,168,75,.32)!important;border-color:rgba(200,168,75,.65)!important;color:var(--gold)!important;text-shadow:0 0 8px rgba(200,168,75,.4);box-shadow:inset 0 0 10px rgba(200,168,75,.18)}',
    '.wc.wm{animation:wsMiss .32s ease-out}',
    '.ws-word{padding:3px 8px;border-radius:4px;font-family:DM Mono,monospace;font-weight:600;transition:all .3s ease}',
    '.ws-word.done{text-decoration:line-through;opacity:.45;color:var(--sage);border:1px solid rgba(122,179,86,0.35);background:rgba(122,179,86,0.06)}',
    '.ws-word.pending{color:var(--cream);border:1px solid rgba(200,168,75,0.25);background:rgba(200,168,75,0.04)}'
  ].join('');
  document.head.appendChild(s);
})();

// ── Module state — single active game at a time ────────────────────────────
var SZ=10,grid=[],words=[],wordPaths={},found=[];
var boardGen=0; // bumped per gen() — guards the delayed victory overlay
var dragging=false,startI=-1,endI=-1,currentPath=[];
var gd=null,wl=null;

// Themed word packs — each puzzle draws from ONE theme for coherence.
// Keep words 3-13 letters so they fit Easy (8x8) through Hard (13x13).
// Each theme should have 15+ words with at least 5 that are <=8 chars so Easy
// mode never fails to find enough fitting words.
var THEMES=[
  {name:'Flora',         words:['FERN','MOSS','SAGE','BLOOM','PETAL','ROOT','SPORE','LEAF','FLORA','POLLEN','STEM','BUD','SHOOT','VINE','TENDRIL','FROND','BRACT','HUSK','POD','GRAIN','BERRY','SEED','SPROUT']},
  {name:'Trees',         words:['MAPLE','CEDAR','OAK','PINE','BIRCH','WILLOW','ALDER','ELM','BEECH','ASH','ASPEN','ELDER','SPRUCE','FIR','WALNUT','HEMLOCK','SYCAMORE','MAGNOLIA','POPLAR','HAZEL','ROWAN','YEW','LINDEN','CHESTNUT']},
  {name:'Flowers',       words:['TULIP','DAISY','ROSE','LILY','IRIS','ASTER','POPPY','PEONY','ORCHID','DAHLIA','LUPINE','VIOLET','ZINNIA','FOXGLOVE','JASMINE','MARIGOLD','PHLOX','CROCUS','HYACINTH','GARDENIA','CAMELLIA','AZALEA','BEGONIA']},
  {name:'Garden',        words:['SOIL','WATER','MULCH','PRUNE','WEED','COMPOST','TROWEL','HOE','SPADE','RAKE','SHEARS','BED','DIG','PLOT','FENCE','TRELLIS','ARBOR','PATH','GATE','POND','SHED','POT','STAKE']},
  {name:'Weather',       words:['SUN','RAIN','MIST','DEW','FROST','STORM','CLOUD','BREEZE','HAIL','SLEET','FOG','DRIZZLE','WIND','SNOW','THUNDER','RAINBOW','HUMID','CRISP','DRY','WET','GALE','SQUALL','HAZE']},
  {name:'Seasons',       words:['SPRING','SUMMER','AUTUMN','WINTER','BLOOM','FADE','HARVEST','RENEW','THAW','EQUINOX','SOLSTICE','WARM','CHILL','GROWTH','DORMANCY','YIELD','TURN','RIPEN','BUDDING','CROP']},
  {name:'Herbs',         words:['BASIL','THYME','MINT','SAGE','OREGANO','DILL','PARSLEY','CHIVE','ROSEMARY','TARRAGON','LAVENDER','BAY','CORIANDER','CUMIN','FENNEL','MARJORAM','SORREL','VERBENA','BORAGE','ANISE','CHERVIL']},
  {name:'Wild',          words:['THORN','BRAMBLE','VINE','NETTLE','CLOVER','HEATHER','FERN','GORSE','RUSH','REED','BOG','MEADOW','MARSH','FEN','THICKET','HEATH','SCRUB','COPSE','GLEN','MOOR','HOLLOW','BRIAR']},
  {name:'Keeper',        words:['PLANT','GROW','BLOOM','TEND','PRUNE','SOW','HARVEST','NURTURE','BREED','WATER','WEED','MEND','TILL','GRAFT','GUARD','PROTECT','LISTEN','COAX','GATHER','REST','OBSERVE','SHIELD','WITNESS']},
  {name:'Lucid Winds',   words:['KEEPER','SEED','POLLEN','DEW','SUNBEAM','BREED','NURSERY','WILD','COMPOST','HEX','BLOOM','FERAL','TEND','GREENHOUSE','CHIMERA','MUTATION','AURA','COMPANION','MINT','HAIKU','GRADE']},
  {name:'Fruits',        words:['APPLE','PEAR','PEACH','PLUM','CHERRY','GRAPE','BERRY','MELON','FIG','QUINCE','LEMON','LIME','GUAVA','MANGO','PAPAYA','KIWI','DATE','OLIVE','APRICOT','PERSIMMON','POMEGRANATE','CURRANT','LYCHEE']},
  {name:'Birds',         words:['ROBIN','WREN','FINCH','SPARROW','JAY','CROW','OWL','HERON','RAVEN','GOOSE','DOVE','MARTIN','HAWK','SWALLOW','SWIFT','STARLING','BLACKBIRD','THRUSH','MAGPIE','FALCON','EAGLE','KESTREL','NUTHATCH']},
  {name:'Mushrooms',     words:['MOREL','TRUFFLE','OYSTER','PORCINI','ENOKI','PUFFBALL','INKCAP','MILKCAP','BOLETE','MAITAKE','SHIITAKE','CHANTERELLE','CAP','STEM','GILLS','SPORE','FUNGUS','TOADSTOOL','AGARIC']},
  {name:'Insects',       words:['BEE','ANT','WASP','MOTH','BEETLE','APHID','CRICKET','MANTIS','FIREFLY','CICADA','LADYBUG','GNAT','WEEVIL','HORNET','TERMITE','DRAGONFLY','MAYFLY','FLEA','MIDGE','BUTTERFLY']},
  {name:'Bees',          words:['HONEY','HIVE','NECTAR','POLLEN','QUEEN','DRONE','WORKER','COMB','WAX','SWARM','ROYAL','LARVA','PUPA','FORAGE','WAGGLE','BROOD','APIARY','BUZZ','STING']},
  {name:'Soil',          words:['LOAM','SILT','CLAY','SAND','PEAT','HUMUS','MINERAL','ORGANIC','TILTH','COMPOST','WORM','ROOT','LITTER','TOPSOIL','SUBSOIL','DUFF','FERTILE','ACIDIC','ALKALINE','MULCH']},
  {name:'Roots',         words:['TAPROOT','TUBER','BULB','RHIZOME','CORM','RUNNER','SUCKER','STOLON','CROWN','NODE','LATERAL','FIBROUS','ANCHOR','PRIMARY','FEEDER','HAIR','RADICLE']},
  {name:'Mythic',        words:['PHOENIX','DRAGON','GRIFFIN','UNICORN','KRAKEN','SPHINX','CENTAUR','CHIMERA','NYMPH','SPRITE','FAUN','DRYAD','SYLPH','PEGASUS','BASILISK','KIRIN','SELKIE','NAGA']},
  {name:'Biomes',        words:['FOREST','DESERT','TUNDRA','PRAIRIE','MARSH','JUNGLE','SAVANNA','MEADOW','WETLAND','REEF','CANOPY','GROVE','GLEN','HEATH','MOOR','STEPPE','TAIGA','BOG']},
  {name:'Astronomy',     words:['STAR','MOON','COMET','NEBULA','GALAXY','ORBIT','PLANET','SUN','ECLIPSE','AURORA','METEOR','COSMIC','LUNAR','SOLAR','ZENITH','DUSK','DAWN','NIGHT','CONSTELLATION']},
  {name:'Stones',        words:['GRANITE','QUARTZ','SHALE','BASALT','SLATE','FLINT','AGATE','JADE','OPAL','ONYX','MARBLE','OBSIDIAN','LIMESTONE','SANDSTONE','PUMICE','GEODE','AMBER','CORAL']},
  {name:'Butterflies',   words:['MONARCH','SWALLOWTAIL','FRITILLARY','SKIPPER','HAIRSTREAK','SULPHUR','ADMIRAL','PAINTED','LUNA','EMPEROR','BLUE','WHITE','COPPER','COMMA','RINGLET']},
  {name:'Water',         words:['RIVER','LAKE','POND','STREAM','CREEK','BROOK','RAPIDS','DELTA','BAY','LAGOON','FJORD','TIDE','ESTUARY','OASIS','OCEAN','WAVE','CURRENT','SPRING','EDDY','BASIN']},
  {name:'Festival',      words:['HARVEST','EQUINOX','SOLSTICE','LANTERN','LUNAR','BONFIRE','WREATH','GARLAND','FEAST','RITUAL','MASK','DANCE','GATHER','TOAST','CHIME','VIGIL','CAROL']}
];
var _curTheme=null;
// 8 placement directions — horizontal, vertical, both diagonals, all reversible
var DIRS=[[0,1],[0,-1],[1,0],[-1,0],[1,1],[-1,-1],[1,-1],[-1,1]];

function computePath(from,to){
  if(from<0||to<0)return [];
  if(from===to)return [from];
  var r1=Math.floor(from/SZ),c1=from%SZ;
  var r2=Math.floor(to/SZ),c2=to%SZ;
  var dr=r2-r1,dc=c2-c1;
  var ar=Math.abs(dr),ac=Math.abs(dc);
  // Must be a straight line: horizontal, vertical, or 45-degree diagonal
  if(!(dr===0||dc===0||ar===ac))return [];
  var steps=Math.max(ar,ac);
  var sr=dr===0?0:dr/ar;
  var sc=dc===0?0:dc/ac;
  var path=[];
  for(var k=0;k<=steps;k++)path.push((r1+k*sr)*SZ+(c1+k*sc));
  return path;
}

function cellAt(cx,cy){
  var el=document.elementFromPoint(cx,cy);
  if(el&&el.classList&&el.classList.contains('wc')){
    var a=el.getAttribute('data-i');
    if(a!==null)return parseInt(a,10);
  }
  // Forgiving hit test — cells shrink below 48px on Medium/Hard, so a
  // fat-finger drag endpoint can land just outside every .wc. Snap to the
  // nearest cell center within ~24px instead of dropping the touch (2026-07-04).
  if(gd){
    var kids=gd.children,best=-1,bestD=24*24;
    for(var i=0;i<kids.length;i++){
      var r=kids[i].getBoundingClientRect();
      var dx=cx-(r.left+r.width/2),dy=cy-(r.top+r.height/2);
      var d=dx*dx+dy*dy;
      if(d<bestD){bestD=d;best=i;}
    }
    return best;
  }
  return -1;
}

function highlightDrag(){
  if(!gd)return;
  // Clear old drag highlights but preserve .wf (found)
  var prev=gd.querySelectorAll('.wc.wd');
  for(var ci=0;ci<prev.length;ci++)prev[ci].classList.remove('wd');
  currentPath.forEach(function(x){
    if(gd.children[x])gd.children[x].classList.add('wd');
  });
}

function dragStart(i){
  if(i<0)return;
  dragging=true;startI=i;endI=i;
  currentPath=computePath(startI,endI);
  highlightDrag();
}

function dragMove(i){
  if(!dragging||i<0||i===endI)return;
  endI=i;
  currentPath=computePath(startI,endI);
  highlightDrag();
}

function dragEnd(){
  if(!dragging)return;
  dragging=false;
  if(currentPath.length<2){
    currentPath=[];highlightDrag();return;
  }
  // Read letters along drag path
  var s='';
  currentPath.forEach(function(x){s+=grid[x]||'';});
  var sRev=s.split('').reverse().join('');
  var matched=null;
  for(var wi=0;wi<words.length;wi++){
    var w=words[wi];
    if(found.indexOf(w)>=0)continue;
    if(w===s||w===sRev){matched=w;break;}
  }
  if(matched){
    found.push(matched);
    _play('snap');
    var pathCopy=currentPath.slice();
    pathCopy.forEach(function(x,ii){
      if(gd.children[x]){
        (function(cell,delay){
          setTimeout(function(){
            cell.classList.remove('wd');
            cell.classList.add('wf-flash','wf-shine','wf');
            setTimeout(function(){cell.classList.remove('wf-flash','wf-shine');},720);
          },delay);
        })(gd.children[x],ii*45);
      }
    });
    currentPath=[];
    var wf=document.getElementById('Wf');if(wf)wf.textContent=found.length;
    rnW();
    if(found.length>=words.length){
      // Earn + stat fire synchronously — a legitimately completed puzzle must
      // never lose its reward just because New Game/difficulty was tapped
      // during the delayed victory beat below (2026-07-04).
      _e('game_win');_sr('wordsearch',{w:true,s:found.length});
      // Generation guard: New Game inside this ~1s delay used to pop
      // "ALL FOUND · 0 words" over the fresh board.
      var bg=boardGen;
      setTimeout(function(){
        if(bg!==boardGen)return;
        if(_playWin)_playWin();
        _wordSearchVictory();
      },pathCopy.length*45+600);
    } else if(found.length%2===0) _e('milestone');
  } else {
    // Miss — shake + clear
    currentPath.forEach(function(x){if(gd.children[x])gd.children[x].classList.add('wm');});
    setTimeout(function(){
      var shaken=gd.querySelectorAll('.wc.wm');
      for(var si=0;si<shaken.length;si++)shaken[si].classList.remove('wm','wd');
    },340);
    currentPath=[];
  }
}

function _wordSearchVictory(){
  var _old=document.getElementById('WS-over');if(_old)_old.remove();
  var ov=document.createElement('div');ov.id='WS-over';
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){var o=document.getElementById('WS-over');if(o)o.remove();});
  ov.style.cssText='position:fixed;inset:0;z-index:9999;background:radial-gradient(ellipse at 50% 40%,rgba(122,179,86,0.35) 0%,rgba(13,16,12,0.94) 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;animation:wsWin .3s ease;font-family:Georgia,serif;';
  ov.innerHTML=
    '<div style="font-size:4.6rem;line-height:1;margin-bottom:12px;filter:drop-shadow(0 0 24px rgba(122,179,86,0.8));animation:wsPop .7s cubic-bezier(.18,1.5,.3,1);">🌿</div>'+
    '<div style="font-size:2.2rem;font-weight:700;color:#7ab356;letter-spacing:0.08em;text-shadow:0 0 22px rgba(122,179,86,0.7);animation:wsPop .7s cubic-bezier(.18,1.5,.3,1);">ALL FOUND</div>'+
    '<div style="font-style:italic;font-size:0.9rem;color:#e8dcc8;margin-top:10px;animation:wsWin .5s ease-out .4s both;">'+found.length+' words &middot; '+SZ+'×'+SZ+' grid</div>'+
    '<button onclick="this.parentElement.remove();_WN()" style="margin-top:26px;min-height:46px;padding:10px 26px;font-family:Georgia,serif;font-weight:700;font-size:0.85rem;background:linear-gradient(180deg,rgba(122,179,86,0.35),rgba(74,124,53,0.45));border:2px solid #7ab356;color:#f5ebd0;border-radius:8px;letter-spacing:0.05em;cursor:pointer;animation:wsWin .5s ease-out .7s both;">↻ New Grid</button>';
  ov.onclick=function(ev){if(ev.target===ov)ov.remove();};
  document.body.appendChild(ov);
}

function gen(){
  boardGen++;
  var dv=((document.getElementById('Wd')||{}).value||'10-6').split('-');
  SZ=parseInt(dv[0])||10;
  var wc=parseInt(dv[1])||6;
  grid=[];for(var i=0;i<SZ*SZ;i++)grid.push('');
  // Pick a theme whose pool can support the requested word count at this size.
  // Avoid repeating the previous theme twice in a row when alternatives exist.
  var viable=[];
  for(var ti=0;ti<THEMES.length;ti++){
    var t=THEMES[ti];
    var fits=0;
    for(var wi=0;wi<t.words.length;wi++){
      if(t.words[wi].length<=SZ)fits++;
      if(fits>=wc)break;
    }
    if(fits>=wc)viable.push(t);
  }
  if(!viable.length)viable=THEMES;
  var choice=null;
  if(_curTheme&&viable.length>1){
    var rotated=viable.filter(function(t){return t.name!==_curTheme.name;});
    choice=rotated[Math.floor(Math.random()*rotated.length)];
  } else {
    choice=viable[Math.floor(Math.random()*viable.length)];
  }
  _curTheme=choice;
  var pool=[];
  // Dedupe within the theme — some packs have a repeat for poetic reasons
  var seen={};
  choice.words.forEach(function(w){if(w.length<=SZ&&!seen[w]){seen[w]=1;pool.push(w);}});
  words=sh(pool).slice(0,wc);
  found=[];wordPaths={};
  words.forEach(function(w){
    for(var att=0;att<150;att++){
      var dir=DIRS[Math.floor(Math.random()*DIRS.length)];
      var dr=dir[0],dc=dir[1];
      var rSpan=(w.length-1)*Math.abs(dr);
      var cSpan=(w.length-1)*Math.abs(dc);
      var minR=dr<0?rSpan:0;
      var maxR=dr>0?SZ-1-rSpan:SZ-1;
      var minC=dc<0?cSpan:0;
      var maxC=dc>0?SZ-1-cSpan:SZ-1;
      if(maxR<minR||maxC<minC)continue;
      var r=minR+Math.floor(Math.random()*(maxR-minR+1));
      var c=minC+Math.floor(Math.random()*(maxC-minC+1));
      var path=[];var ok=true;
      for(var k=0;k<w.length;k++){
        var rr=r+k*dr,cc=c+k*dc;
        var gi=rr*SZ+cc;
        if(grid[gi]&&grid[gi]!==w[k]){ok=false;break;}
        path.push(gi);
      }
      if(ok){
        for(var k2=0;k2<w.length;k2++)grid[path[k2]]=w[k2];
        wordPaths[w]=path.slice();
        break;
      }
    }
  });
  // A word that failed all 150 placement attempts has no path on the grid —
  // leaving it in words[] made the puzzle silently unwinnable (most likely
  // on Hard 13×13 with 13-letter words like CONSTELLATION).
  words=words.filter(function(w){return !!wordPaths[w];});
  var A='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for(var i=0;i<SZ*SZ;i++)if(!grid[i])grid[i]=A[Math.floor(Math.random()*26)];
}

function rn(){
  if(!gd)return;
  gd.innerHTML='';
  gd.style.gridTemplateColumns='repeat('+SZ+',1fr)';
  for(var i=0;i<SZ*SZ;i++){
    var d=document.createElement('div');
    d.className='wc';
    d.textContent=grid[i];
    d.setAttribute('data-i',i);
    gd.appendChild(d);
  }
  // Re-apply .wf to cells in any found word's path
  found.forEach(function(w){
    var p=wordPaths[w]||[];
    p.forEach(function(x){if(gd.children[x])gd.children[x].classList.add('wf');});
  });
  rnW();
}

function rnW(){
  if(!wl)return;
  var h='';
  words.forEach(function(w){
    h+='<span class="ws-word '+(found.indexOf(w)>=0?'done':'pending')+'">'+w+'</span>';
  });
  wl.innerHTML=h;
}

function bindGrid(){
  if(!gd)return;
  gd.onmousedown=function(e){var i=cellAt(e.clientX,e.clientY);if(i>=0){e.preventDefault();dragStart(i);}};
  gd.onmousemove=function(e){if(dragging){var i=cellAt(e.clientX,e.clientY);if(i>=0)dragMove(i);}};
  gd.ontouchstart=function(e){var t=e.touches&&e.touches[0];if(!t)return;var i=cellAt(t.clientX,t.clientY);if(i>=0){e.preventDefault();dragStart(i);}};
  gd.ontouchmove=function(e){if(!dragging)return;var t=e.touches&&e.touches[0];if(!t)return;var i=cellAt(t.clientX,t.clientY);if(i>=0)dragMove(i);e.preventDefault();};
}

// Global release handlers — registered once per module load.
// Handle the case where the drag ends outside the grid.
document.addEventListener('mouseup',function(){if(dragging)dragEnd();});
document.addEventListener('touchend',function(){if(dragging)dragEnd();});
document.addEventListener('touchcancel',function(){if(dragging)dragEnd();});

function GW(a){
  // Re-registered every mount (not once at module scope) — the in-app runner
  // clears cleanups on every game exit, so a module-scope registration went
  // dead after the 1st play of the session (2026-07-04).
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){boardGen++;});
  ms(a,'<span id="Wtheme" style="color:var(--gold);font-family:Georgia,serif;font-style:italic;letter-spacing:.06em;">Flora</span> &middot; Found: <strong id="Wf">0</strong>/<strong id="Wt">6</strong>');mm(a);
  gd=document.createElement('div');gd.className='wg';gd.id='Wg';a.appendChild(gd);
  wl=document.createElement('div');wl.id='Wl';
  wl.style.cssText='display:flex;flex-wrap:wrap;gap:6px;justify-content:center;padding:10px 8px;font-size:.72rem;max-width:min(calc(100vw - 24px),460px);margin:0 auto;';
  a.appendChild(wl);
  mc(a).innerHTML='<select class="gsl" id="Wd" onchange="_WN()"><option value="8-5">Easy</option><option value="10-6" selected>Medium</option><option value="13-8">Hard</option></select> <button class="gb-new" onclick="_WN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';
  window._WN();
}

window._WN=function(){
  dragging=false;startI=-1;endI=-1;currentPath=[];found=[];
  gen();
  var wt=document.getElementById('Wt');if(wt)wt.textContent=words.length;
  var wf=document.getElementById('Wf');if(wf)wf.textContent='0';
  var wth=document.getElementById('Wtheme');if(wth&&_curTheme)wth.textContent=_curTheme.name;
  sm('');rn();bindGrid();
};

window._gameFns.wordsearch=GW;
})();
