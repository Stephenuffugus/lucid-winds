// ═══ JADE GARDEN — Mahjong Solitaire rebuild ═══
//
// Tap two matching free tiles to remove them. Clear all 144 tiles.
// A tile is FREE when it has no tile directly on top and at least one
// of its left-or-right neighbor slots at the same layer is empty.
//
// Design goals:
//  - 5 classic layouts (Turtle / Dragon / Pyramid / Fortress / Bamboo)
//  - Guaranteed solvable via reverse-play generation
//  - Delta render — DOM built once, taps update only touched tiles
//  - Multi-step undo, match animation, both-tile hint, per-layout stats
//
// Tile set: 144 tiles total, canonical Mahjong structure mapped to
// botanical names:
//   36 Bloom (B1-9 × 4)     ~ bamboo suit
//   36 Leaf  (L1-9 × 4)     ~ character suit
//   36 Seed  (D1-9 × 4)     ~ circle suit
//   16 Companion (C0-3 × 4) ~ winds (4 insect types)
//   12 Root  (R0-2 × 4)     ~ dragons (3 root types)
//    4 Season (S0-3 ×1)     ~ flowers (any season matches any season)
//    4 Element (E0-3 ×1)    ~ seasons (any element matches any element)
(function(){
'use strict';
var LWG=window._G;
var _e=LWG.e,_play=LWG.play,_playWin=LWG.playWin,_setDiff=LWG.setDiff,sm=LWG.sm,_sr=LWG.sr;

// ── Faces ───────────────────────────────────────────────────────────────
function buildFaces(){
  var faces=[];
  for(var i=1;i<=9;i++) faces.push({kind:'B',n:i,color:'#6bad4a',icon:'🌸',label:i});
  for(i=1;i<=9;i++) faces.push({kind:'L',n:i,color:'#4a7c35',icon:'🍃',label:i});
  for(i=1;i<=9;i++) faces.push({kind:'D',n:i,color:'#c8a84b',icon:'●',label:i});
  faces.push({kind:'C',n:0,color:'#a96bb8',icon:'🦋',label:''});
  faces.push({kind:'C',n:1,color:'#c8a84b',icon:'🐝',label:''});
  faces.push({kind:'C',n:2,color:'#8b6914',icon:'🐛',label:''});
  faces.push({kind:'C',n:3,color:'#c47a7a',icon:'🐞',label:''});
  faces.push({kind:'R',n:0,color:'#6bad4a',icon:'⋎',label:''});
  faces.push({kind:'R',n:1,color:'#8b6914',icon:'⋏',label:''});
  faces.push({kind:'R',n:2,color:'#c8a84b',icon:'✦',label:''});
  return faces;
}
var FACES=buildFaces();
var WILD_SEASONS=[
  {kind:'S',n:0,color:'#e8a0bf',icon:'🌸',label:'春'},
  {kind:'S',n:1,color:'#c8a84b',icon:'☀',label:'夏'},
  {kind:'S',n:2,color:'#c47a7a',icon:'🍁',label:'秋'},
  {kind:'S',n:3,color:'#5b9bd5',icon:'❄',label:'冬'}
];
var WILD_ELEMENTS=[
  {kind:'E',n:0,color:'#5b9bd5',icon:'💧',label:'雨'},
  {kind:'E',n:1,color:'#c8a84b',icon:'☀',label:'陽'},
  {kind:'E',n:2,color:'#8b6914',icon:'⛰',label:'土'},
  {kind:'E',n:3,color:'#b8c0c0',icon:'〜',label:'風'}
];
function facesMatch(a,b){
  if(a.kind==='S' && b.kind==='S') return true;
  if(a.kind==='E' && b.kind==='E') return true;
  return a.kind===b.kind && a.n===b.n;
}

// ── Layouts ─────────────────────────────────────────────────────────────
// Each layout is a function returning an array of [layer, col, row]
// positions. Columns and rows are in half-tile units so L-above-edge
// stacking works cleanly.
function turtleLayout(){
  // Symmetric shell — exactly 144 positions:
  // L0 base 80 + L1 36 + L2 16 + L3 8 + L4 4 = 144
  var p=[];
  // L0 base (80): 8 rows, widths 8/10/10/12/12/10/10/8 centered
  var rows0=[
    {s:3,e:11}, {s:2,e:12}, {s:2,e:12}, {s:1,e:13},
    {s:1,e:13}, {s:2,e:12}, {s:2,e:12}, {s:3,e:11}
  ];
  for(var r=0;r<rows0.length;r++)
    for(var c=rows0[r].s;c<rows0[r].e;c++) p.push([0,c,r]);
  // L1 (36): 6×6 ridge, rows 1-6 cols 3-8
  for(r=1;r<7;r++) for(c=3;c<9;c++) p.push([1,c,r]);
  // L2 (16): 4×4 rows 2-5 cols 4-7
  for(r=2;r<6;r++) for(c=4;c<8;c++) p.push([2,c,r]);
  // L3 (8): 4×2 rows 3-4 cols 4-7
  for(r=3;r<5;r++) for(c=4;c<8;c++) p.push([3,c,r]);
  // L4 cap (4): single row cols 4-7 at row 4
  for(c=4;c<8;c++) p.push([4,c,4]);
  return p;
}

// Dragon: three rectangular body sections forming a broad horizontal
// shape with a raised central ridge. Exactly 144 positions, no padding.
//   L0: 3 body blocks (left 4×5, mid 6×7, right 4×5) = 20+42+20 = 82
//   L1: mid ridge 6×4 = 24 on top of the middle block
//   L2: spine 4×2 = 8
//   L3 cap row: 1 wide × 2 = 2... adjust to make 144
// Recount: 82+24+8=114, need 30 more. Bump L0 + more.
// Simpler: fully rectangular with stepped pyramid on top, dragon name purely flavor.
function dragonLayout(){
  var p=[];
  // L0 82: left 4×5 + middle 6×7 + right 4×5
  for(var r=1;r<6;r++) for(var c=0;c<4;c++) p.push([0,c,r]);      // 20
  for(r=0;r<7;r++) for(c=5;c<11;c++) p.push([0,c,r]);              // 42
  for(r=1;r<6;r++) for(c=12;c<16;c++) p.push([0,c,r]);             // 20
  // L1 on central block: 4×6 = 24
  for(r=1;r<7;r++) for(c=6;c<10;c++) p.push([1,c,r]);
  // L2: 2×6 = 12
  for(r=1;r<7;r++) for(c=7;c<9;c++) p.push([2,c,r]);
  // L3: 6 tiles (1×6 spine)
  for(r=1;r<7;r++) p.push([3,7,r]);                                 // 6
  // L4 cap: ... 82+24+12+6 = 124. Need 20 more.
  // Add wing rows at L0 to left and right (row 6 of mids)
  for(c=0;c<4;c++) p.push([0,c,0]);                                 // 4 (left top row)
  for(c=0;c<4;c++) p.push([0,c,6]);                                 // 4 (left bottom)
  for(c=12;c<16;c++) p.push([0,c,0]);                               // 4 (right top)
  for(c=12;c<16;c++) p.push([0,c,6]);                               // 4 (right bottom)
  // 124+16=140, need 4. Add L0 top+bottom flanks on middle block
  for(c=5;c<7;c++) p.push([0,c,7]);
  for(c=9;c<11;c++) p.push([0,c,7]);                                // 4
  return p;  // 140+4 = 144 ✓
}

// Pyramid: stepped rectangular pyramid. Exact 144.
//   L0 6×10 = 60, L1 5×8 = 40, L2 4×5 = 20 wait tune to 144
//   60+40+20+ L3 + L4 = 144 → L3+L4 = 24
//   L3 3×4 = 12, L4 4×3 = 12 ✓
function pyramidLayout(){
  var p=[];
  for(var r=0;r<10;r++) for(var c=0;c<6;c++) p.push([0,c+2,r]);    // L0: 6 wide × 10 tall, cols 2-7 = 60
  for(r=1;r<9;r++) for(c=3;c<8;c++) p.push([1,c,r]);                // L1: 5×8 = 40
  for(r=2;r<6;r++) for(c=4;c<9;c++) p.push([2,c,r]);                // L2: 5×4 = 20
  for(r=3;r<7;r++) for(c=5;c<8;c++) p.push([3,c,r]);                // L3: 3×4 = 12
  for(r=4;r<8;r++) for(c=6;c<9;c++) p.push([4,c,r]);                // L4: 3×4 = 12
  return p;  // 60+40+20+12+12 = 144 ✓
}

// Fortress: outer ring of walls + inner courtyard + central pillar.
//   L0 outer ring (12×10 outer minus 8×6 inner) + inner courtyard filled = 120
//   L1 top/bottom walls only: ... keep adjusting for 144
// Simpler: 10×10 L0 (100) + 6×6 L1 (36) + 4×2 L2 (8) = 144.
function fortressLayout(){
  var p=[];
  for(var r=0;r<10;r++) for(var c=0;c<10;c++) p.push([0,c+1,r]);   // L0: 100 (cols 1-10)
  for(r=2;r<8;r++) for(c=3;c<9;c++) p.push([1,c,r]);                // L1: 6×6 = 36
  for(r=4;r<6;r++) for(c=5;c<9;c++) p.push([2,c,r]);                // L2: 4×2 = 8
  return p;  // 100+36+8 = 144 ✓
}

// Bamboo: long and thin. Exact 144.
//   L0: 16 wide × 6 tall = 96, L1: 12×4 = 48. 96+48 = 144 ✓
function bambooLayout(){
  var p=[];
  for(var r=0;r<6;r++) for(var c=0;c<16;c++) p.push([0,c,r]);      // 96
  for(r=1;r<5;r++) for(c=2;c<14;c++) p.push([1,c,r]);               // 48
  return p;  // 144 ✓
}

// ── Layout validator (dev aid) ─────────────────────────────────────────
function validateLayouts(){
  var msgs=[];
  for(var k in LAYOUTS){
    var p=LAYOUTS[k].build();
    if(p.length!==144) msgs.push(k+': '+p.length+' positions (expected 144)');
    var seen={};
    for(var i=0;i<p.length;i++){
      var key=p[i][0]+','+p[i][1]+','+p[i][2];
      if(seen[key]) msgs.push(k+': duplicate position '+key);
      seen[key]=true;
    }
  }
  if(msgs.length && typeof console!=='undefined' && console.warn){
    msgs.forEach(function(m){console.warn('[jade] '+m);});
  }
  return msgs;
}

var LAYOUTS={
  turtle:  {label:'TURTLE',  sub:'classic 144-tile shell', build:turtleLayout},
  dragon:  {label:'DRAGON',  sub:'long sinuous spine',      build:dragonLayout},
  pyramid: {label:'PYRAMID', sub:'wide base, single peak',  build:pyramidLayout},
  fortress:{label:'FORTRESS',sub:'walled ring with pillar', build:fortressLayout},
  bamboo:  {label:'BAMBOO',  sub:'long and narrow grove',   build:bambooLayout}
};

// ── Styles ──────────────────────────────────────────────────────────────
(function injectStyle(){
  if(document.getElementById('jg-style'))return;
  var s=document.createElement('style');s.id='jg-style';
  s.textContent=[
    '@keyframes jgFade{0%{opacity:0;transform:translateY(4px)}100%{opacity:1;transform:translateY(0)}}',
    '@keyframes jgPop{0%{transform:scale(0.5);opacity:0}55%{transform:scale(1.15);opacity:1}100%{transform:scale(1);opacity:1}}',
    '@keyframes jgRemove{0%{transform:scale(1);opacity:1}100%{transform:scale(0.4);opacity:0}}',
    '@keyframes jgHint{0%,100%{box-shadow:0 0 10px rgba(255,216,106,0.4),2px 2px 0 0 #b8a87a,3px 3px 0 0 #a89868}50%{box-shadow:0 0 22px rgba(255,216,106,0.9),2px 2px 0 0 #b8a87a,3px 3px 0 0 #a89868}}',
    '#JGpan{max-width:min(100vw,580px);margin:0 auto;padding:6px;user-select:none;-webkit-user-select:none;box-sizing:border-box;font-family:Georgia,serif;animation:jgFade .3s ease}',
    // Layout picker
    '.JGpick{display:flex;flex-direction:column;align-items:center;gap:12px;padding:24px 12px 12px;animation:jgFade .3s ease}',
    '.JGpickTitle{font-family:Bebas Neue,sans-serif;font-size:1.7rem;letter-spacing:0.22em;color:#c8a84b}',
    '.JGpickSub{font-family:Georgia,serif;font-size:0.78rem;color:rgba(232,220,200,0.72);text-align:center;max-width:340px;line-height:1.5}',
    '.JGpickBtns{display:flex;flex-direction:column;gap:8px;width:100%;max-width:300px;margin-top:6px}',
    '.JGpickBtn{min-height:58px;padding:10px 14px;border-radius:12px;background:rgba(26,36,22,0.85);border:1.5px solid rgba(122,179,86,0.35);color:#e8dcc8;font-family:Georgia,serif;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;display:flex;flex-direction:column;align-items:flex-start;gap:2px}',
    '.JGpickBtn:active{transform:scale(0.98);background:rgba(122,179,86,0.22)}',
    '.JGpickBtn .lbl{font-family:Bebas Neue,sans-serif;font-size:1rem;letter-spacing:0.18em;color:#c8a84b;display:flex;justify-content:space-between;width:100%}',
    '.JGpickBtn .sub{font-size:0.68rem;color:rgba(232,220,200,0.72)}',
    '.JGpickBest{font-family:DM Mono,monospace;font-size:0.62rem;color:#8fc57a;letter-spacing:0.04em}',
    // Top bar
    '.JGtop{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;padding:6px 8px;margin:2px 0 6px;background:linear-gradient(135deg,rgba(26,31,23,0.85),rgba(13,16,12,0.92));border:1.5px solid rgba(122,179,86,0.25);border-radius:10px;font-family:Bebas Neue,sans-serif}',
    '.JGtopCell{text-align:center}',
    '.JGtopLbl{font-size:0.56rem;letter-spacing:0.16em;color:rgba(232,220,200,0.55)}',
    '.JGtopVal{font-family:DM Mono,monospace;font-size:0.82rem;color:#c8a84b;font-weight:700;margin-top:1px}',
    // Board scroll area
    '.JGboardWrap{overflow:auto;-webkit-overflow-scrolling:touch;padding:6px 2px;background:rgba(12,16,10,0.4);border:1.5px solid rgba(74,124,53,0.22);border-radius:10px;touch-action:pan-x pan-y}',
    '.JGboard{position:relative;margin:0 auto}',
    // Tile
    '.JGtile{position:absolute;background:linear-gradient(180deg,#f5f0e1,#e8dcc0);border:1.5px solid #b8a87a;border-radius:5px;box-shadow:2px 2px 0 0 #b8a87a,3px 3px 0 0 #a89868,4px 4px 6px rgba(0,0,0,0.45);display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:700;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;transition:transform .1s ease,opacity .18s ease,filter .15s ease}',
    '.JGtile.blocked{opacity:0.38;filter:saturate(0.6);cursor:default}',
    '.JGtile.free{box-shadow:0 0 6px rgba(200,168,75,0.25),2px 2px 0 0 #b8a87a,3px 3px 0 0 #a89868,4px 4px 6px rgba(0,0,0,0.45)}',
    '.JGtile.preview{outline:2px solid rgba(200,168,75,0.7);outline-offset:-2px;z-index:500}',
    '.JGtile.sel{background:linear-gradient(180deg,#e8f0d6,#c4d9a0);border-color:#8fc57a;transform:translateY(-4px);box-shadow:0 0 14px rgba(122,179,86,0.6),2px 2px 0 0 #b8a87a,3px 3px 0 0 #a89868,4px 4px 6px rgba(0,0,0,0.45)}',
    '.JGtile.hint{animation:jgHint 0.9s ease-in-out infinite;border-color:#c8a84b}',
    '.JGtile.removing{animation:jgRemove 0.32s cubic-bezier(.5,-0.4,.7,1) both;pointer-events:none}',
    '.JGtileIcon{font-size:1.05rem;line-height:1}',
    '.JGtileLabel{font-family:Bebas Neue,sans-serif;font-size:0.58rem;color:#4a3728;margin-top:2px;letter-spacing:0.02em}',
    // Controls
    '.JGctrls{display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:6px;padding:8px 2px 4px}',
    '.JGbtn{min-height:44px;padding:8px 10px;font-family:Georgia,serif;font-size:0.72rem;letter-spacing:0.1em;border-radius:9px;background:rgba(26,31,23,0.8);border:1.5px solid rgba(220,180,120,0.32);color:#e8dcc8;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;display:flex;align-items:center;justify-content:center;gap:4px}',
    '.JGbtn:active{transform:scale(0.96);background:rgba(200,168,75,0.22)}',
    '.JGbtn.primary{background:linear-gradient(180deg,rgba(122,179,86,0.32),rgba(74,124,53,0.4));border-color:rgba(122,179,86,0.55);color:#8fc57a;font-weight:700}',
    '.JGbtn[disabled]{opacity:0.4;pointer-events:none}',
    '.JGbtn .cnt{font-family:DM Mono,monospace;font-size:0.66rem;color:#c8a84b;margin-left:4px}',
    // Win card
    '.JGwin{margin:14px auto;max-width:340px;padding:18px;background:linear-gradient(180deg,rgba(20,28,18,0.97),rgba(13,16,12,0.98));border:2px solid rgba(200,168,75,0.55);border-radius:14px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.6);animation:jgPop .32s cubic-bezier(.2,1.2,.3,1) both}',
    '.JGwinTitle{font-family:Bebas Neue,sans-serif;font-size:1.55rem;letter-spacing:0.14em;color:#ffdc70;margin-bottom:6px}',
    '.JGwinStats{font-family:DM Mono,monospace;font-size:0.82rem;color:#e8dcc8;margin-bottom:14px;line-height:1.6}'
  ].join('');
  document.head.appendChild(s);
})();

// ── State ───────────────────────────────────────────────────────────────
var S=null;
var hostEl=null, pan=null, topBar=null, boardWrap=null, boardEl=null, ctrlRow=null, winCard=null;
var topEls={matched:null, timer:null, hints:null, shuffles:null};
var tileEls={};  // id → DOM node
var timerInt=null;
var TILE_W=44, TILE_H=60;  // set in sizeForLayout

function todayKey(){
  var d=new Date();
  return d.getUTCFullYear()+'-'+(d.getUTCMonth()+1)+'-'+d.getUTCDate();
}

// ── Generation (reverse-solve) ──────────────────────────────────────────
// Build a bag of exactly |positions| faces, then pair them out in
// valid-play order. Guarantees solvability.
function shuf(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}

function buildBag(posCount){
  // Non-wild: 4 copies of each of 34 faces = 136
  // Plus 4 seasons + 4 elements = 144
  var bag=[];
  for(var i=0;i<FACES.length;i++) for(var k=0;k<4;k++) bag.push(FACES[i]);
  for(i=0;i<WILD_SEASONS.length;i++) bag.push(WILD_SEASONS[i]);
  for(i=0;i<WILD_ELEMENTS.length;i++) bag.push(WILD_ELEMENTS[i]);
  while(bag.length>posCount) bag.pop();
  while(bag.length<posCount) bag.push(FACES[0]);
  return bag;
}

// Group bag into pair lists — identical kind+n for non-wild, wild groups
// for seasons/elements. Returns [[face, face], ...].
function buildPairs(bag){
  var groups={};
  for(var i=0;i<bag.length;i++){
    var f=bag[i];
    var key = (f.kind==='S' || f.kind==='E') ? f.kind+'-W' : f.kind+'-'+f.n;
    if(!groups[key]) groups[key]=[];
    groups[key].push(f);
  }
  var pairs=[];
  for(var k in groups){
    var g=groups[k];
    for(var j=0;j<g.length-1;j+=2) pairs.push([g[j], g[j+1]]);
  }
  return pairs;
}

// Compute free positions among a "remaining" set (posIdx -> true)
function getFreeAmong(posList, remaining){
  var byKey={};
  for(var k in remaining){
    var p=posList[k];
    byKey[p[0]+','+p[1]+','+p[2]] = k;
  }
  var free=[];
  for(var kk in remaining){
    var i=kk, p2=posList[i];
    var L=p2[0], C=p2[1], R=p2[2];
    // Above: any remaining on L+1 with col ∈ {C-1..C+1} and row ∈ {R-1..R+1}
    var above=false;
    for(var dc=-1;dc<=1 && !above;dc++) for(var dr=-1;dr<=1 && !above;dr++){
      if(byKey[(L+1)+','+(C+dc)+','+(R+dr)]) above=true;
    }
    if(above) continue;
    var leftBlock = !!byKey[L+','+(C-1)+','+R] || !!byKey[L+','+(C-2)+','+R];
    var rightBlock = !!byKey[L+','+(C+1)+','+R] || !!byKey[L+','+(C+2)+','+R];
    // Half-tile spacing: block by adjacent col (1 unit) only
    leftBlock = !!byKey[L+','+(C-1)+','+R];
    rightBlock = !!byKey[L+','+(C+1)+','+R];
    if(leftBlock && rightBlock) continue;
    free.push(i);
  }
  return free;
}

// Reverse-play: start with all filled, peel in valid-play order, assign pairs.
function tryGenerate(posList, pairs){
  var remaining={};
  for(var i=0;i<posList.length;i++) remaining[i]=true;
  var placedFace=new Array(posList.length);
  pairs=pairs.slice();
  shuf(pairs);
  var pi=0;
  while(pi<pairs.length){
    var freeList=getFreeAmong(posList, remaining);
    if(freeList.length<2) return null;
    shuf(freeList);
    var a=freeList[0], b=freeList[1];
    var pair=pairs[pi++];
    placedFace[a]=pair[0]; placedFace[b]=pair[1];
    delete remaining[a]; delete remaining[b];
  }
  if(Object.keys(remaining).length!==0) return null;
  var tiles=[];
  for(i=0;i<posList.length;i++){
    tiles.push({id:i, layer:posList[i][0], col:posList[i][1], row:posList[i][2], face:placedFace[i], removed:false});
  }
  return tiles;
}

function generate(positions){
  // Safety: generate only works with even position counts. If a layout
  // produces an odd count, trim one off (edge tile).
  if(positions.length % 2 !== 0) positions = positions.slice(0, -1);
  // Up to 30 attempts to produce a solvable layout. In practice the
  // first 2-3 usually succeed; the retries are cheap.
  var bag=buildBag(positions.length);
  for(var attempt=0;attempt<30;attempt++){
    shuf(bag);
    var pairs=buildPairs(bag);
    // If positions.length is odd or pairs don't cover all positions, pad
    if(pairs.length*2 !== positions.length){
      // Adjust by pairing off extras with fillers
      while(pairs.length*2 < positions.length) pairs.push([FACES[0], FACES[0]]);
      while(pairs.length*2 > positions.length) pairs.pop();
    }
    var tiles=tryGenerate(positions, pairs);
    if(tiles) return tiles;
  }
  return null;
}

// ── Runtime free-tile check ─────────────────────────────────────────────
function isFree(id){
  var t=S.tiles[id];
  if(t.removed) return false;
  var L=t.layer, C=t.col, R=t.row;
  for(var i=0;i<S.tiles.length;i++){
    if(i===id) continue;
    var o=S.tiles[i];
    if(o.removed) continue;
    if(o.layer===L+1 && Math.abs(o.col-C)<=1 && Math.abs(o.row-R)<=1) return false;
  }
  var leftBlock=false, rightBlock=false;
  for(i=0;i<S.tiles.length;i++){
    if(i===id) continue;
    var o2=S.tiles[i];
    if(o2.removed) continue;
    if(o2.layer===L && o2.row===R){
      if(o2.col===C-1) leftBlock=true;
      if(o2.col===C+1) rightBlock=true;
    }
  }
  return !(leftBlock && rightBlock);
}

function findAnyMatch(){
  var free=[];
  for(var i=0;i<S.tiles.length;i++){
    if(!S.tiles[i].removed && isFree(i)) free.push(i);
  }
  for(var a=0;a<free.length;a++){
    for(var b=a+1;b<free.length;b++){
      if(facesMatch(S.tiles[free[a]].face, S.tiles[free[b]].face)) return [free[a], free[b]];
    }
  }
  return null;
}

// ── Rendering ───────────────────────────────────────────────────────────
function sizeForLayout(){
  // Fit tile sizes to the actual layout and available viewport.
  // tilePos formula: x = col * TILE_W*0.6 - layer*5, so the layout's
  // pixel width is (maxCol*0.6 + 1)*TILE_W. Same for height with *0.55.
  // We derive TILE_W such that the layout fills available space.
  var maxCol=0,maxRow=0,maxLayer=0;
  if(S&&S.tiles&&S.tiles.length){
    for(var i=0;i<S.tiles.length;i++){
      var t=S.tiles[i];
      if(t.col>maxCol)maxCol=t.col;
      if(t.row>maxRow)maxRow=t.row;
      if(t.layer>maxLayer)maxLayer=t.layer;
    }
  } else {
    // Fallback for first call before tiles exist (shouldn't happen post-refactor)
    maxCol=15;maxRow=8;maxLayer=4;
  }
  var colSpan=maxCol*0.6+1;         // in TILE_W units
  var rowSpan=maxRow*0.55+1;        // in TILE_H units; TILE_H = 1.35*TILE_W
  // Available space: subtract top HUD (~80px) + controls (~120px) + padding
  var availW=Math.min(window.innerWidth-24, 720);
  var availH=Math.min(Math.max(window.innerHeight-210, 360), 760);
  // Solve for TILE_W under width constraint and height constraint, pick smaller
  var byW=availW/colSpan;
  var byH=availH/(rowSpan*1.35);
  TILE_W=Math.floor(Math.min(byW,byH));
  if(TILE_W<36)TILE_W=36;        // touch target floor
  if(TILE_W>72)TILE_W=72;        // don't let tiles balloon on wide screens
  TILE_H=Math.floor(TILE_W*1.35);
}

function tilePos(t){
  var offset=5;  // Z-depth per layer
  return {x: t.col*(TILE_W*0.6) - t.layer*offset, y: t.row*(TILE_H*0.55) - t.layer*offset};
}

function buildBoardDOM(){
  tileEls={};
  // Find bounds
  var minX=9999,minY=9999,maxX=-9999,maxY=-9999;
  for(var i=0;i<S.tiles.length;i++){
    var p=tilePos(S.tiles[i]);
    if(p.x<minX)minX=p.x; if(p.y<minY)minY=p.y;
    if(p.x+TILE_W>maxX)maxX=p.x+TILE_W; if(p.y+TILE_H>maxY)maxY=p.y+TILE_H;
  }
  var W=maxX-minX+12, H=maxY-minY+12;
  boardEl.style.width=W+'px';
  boardEl.style.height=H+'px';
  boardEl.innerHTML='';
  // Sort by render order: lower layer first, then row, then col
  var order=[];
  for(i=0;i<S.tiles.length;i++) order.push(i);
  order.sort(function(a,b){
    var A=S.tiles[a], B=S.tiles[b];
    if(A.layer!==B.layer) return A.layer-B.layer;
    if(A.row!==B.row) return A.row-B.row;
    return A.col-B.col;
  });
  for(var k=0;k<order.length;k++){
    var id=order[k];
    var t=S.tiles[id];
    var pp=tilePos(t);
    var el=document.createElement('div');
    el.className='JGtile';
    el.style.left=(pp.x-minX+6)+'px';
    el.style.top=(pp.y-minY+6)+'px';
    el.style.width=TILE_W+'px';
    el.style.height=TILE_H+'px';
    el.style.color=t.face.color;
    el.style.zIndex=(t.layer*100 + t.row*10 + t.col + 50);
    el.setAttribute('data-id', id);
    var icon=document.createElement('div');
    icon.className='JGtileIcon';
    icon.textContent=t.face.icon;
    icon.style.fontSize=Math.round(TILE_W*0.42)+'px';
    el.appendChild(icon);
    if(t.face.label!==''){
      var lbl=document.createElement('div');
      lbl.className='JGtileLabel';
      lbl.textContent=t.face.label;
      lbl.style.fontSize=Math.round(TILE_W*0.28)+'px';
      el.appendChild(lbl);
    }
    tileEls[id]=el;
    boardEl.appendChild(el);
  }
  boardEl.addEventListener('click', onBoardClick);
  refreshAllTileStates();
}

function onBoardClick(e){
  var el=e.target.closest('[data-id]');
  if(!el)return;
  var id=parseInt(el.getAttribute('data-id'),10);
  if(S.tiles[id].removed)return;
  tapTile(id);
}

// Update all tiles' class state. Called after any meaningful change
// (place/remove/undo/shuffle/select). Handles:
//   - removed (display:none)
//   - blocked (dim)
//   - free (subtle warm glow so players can scan playable tiles fast)
//   - preview (matching-face free tiles highlighted when one is selected)
//   - sel (the actively-picked tile)
function refreshAllTileStates(){
  var selTile = S.selected!==null ? S.tiles[S.selected] : null;
  for(var i=0;i<S.tiles.length;i++){
    var el=tileEls[i];
    if(!el)continue;
    var t=S.tiles[i];
    if(t.removed){ el.style.display='none'; continue; }
    el.style.display='';
    var free=isFree(i);
    var classes='JGtile';
    if(free) classes+=' free';
    else classes+=' blocked';
    if(S.selected===i) classes+=' sel';
    else if(free && selTile && facesMatch(t.face, selTile.face)) classes+=' preview';
    el.className=classes;
  }
}

function tapTile(id){
  if(S.phase!=='play')return;
  // Block input during the 320ms match-remove animation so rapid taps
  // can't select tiles that are about to be marked removed.
  if(S.locked)return;
  var t=S.tiles[id];
  if(t.removed || !isFree(id))return;
  if(S.selected===id){
    S.selected=null;
    refreshAllTileStates();
    return;
  }
  if(S.selected===null){
    S.selected=id;
    try{_play('tap');}catch(e){}
    refreshAllTileStates();
    return;
  }
  var other=S.tiles[S.selected];
  if(facesMatch(t.face, other.face)){
    var firstId=S.selected;
    S.undoStack.push([firstId, id]);
    S.selected=null;
    S.moves++;
    S.locked=true;
    // Mark removed logically IMMEDIATELY so isFree computes correctly
    // for any re-entry. The DOM hide waits for the animation to finish.
    S.tiles[firstId].removed=true;
    S.tiles[id].removed=true;
    var el1=tileEls[firstId], el2=tileEls[id];
    if(el1)el1.classList.add('removing');
    if(el2)el2.classList.add('removing');
    try{_play('match');}catch(e){}
    try{navigator.vibrate&&navigator.vibrate(12);}catch(e){}
    setTimeout(function(){
      S.locked=false;
      refreshAllTileStates();
      updateHUD();
      if(checkWin())return;
      checkStuck();
    }, 320);
  } else {
    S.selected=null;
    try{_play('lose');}catch(e){}
    refreshAllTileStates();
  }
}

// ── HUD + controls ─────────────────────────────────────────────────────
function updateHUD(){
  if(!topEls.matched)return;
  var remain=countRemaining();
  var matched=Math.floor((S.tiles.length-remain)/2);
  var total=Math.floor(S.tiles.length/2);
  topEls.matched.textContent=matched+'/'+total;
  topEls.hints.textContent=S.hintsLeft;
  topEls.shuffles.textContent=S.shufflesLeft;
}
function countRemaining(){var n=0;for(var i=0;i<S.tiles.length;i++)if(!S.tiles[i].removed)n++;return n;}
function tickTimer(){
  if(!topEls.timer)return;
  var s=Math.floor((Date.now()-S.startTime)/1000);
  topEls.timer.textContent=Math.floor(s/60)+':'+(s%60<10?'0':'')+(s%60);
}

function buildControls(){
  ctrlRow.innerHTML='';
  var hintBtn=mkBtn('💡 HINT','default',useHint);
  var hintCnt=document.createElement('span'); hintCnt.className='cnt'; hintCnt.id='JGhCnt'; hintCnt.textContent=S.hintsLeft;
  hintBtn.appendChild(hintCnt);
  ctrlRow.appendChild(hintBtn);
  var undoBtn=mkBtn('↩ UNDO','default',undo);
  ctrlRow.appendChild(undoBtn);
  var shBtn=mkBtn('♻ SHUFFLE','default',shuffleRemaining);
  var shCnt=document.createElement('span'); shCnt.className='cnt'; shCnt.id='JGsCnt'; shCnt.textContent=S.shufflesLeft;
  shBtn.appendChild(shCnt);
  ctrlRow.appendChild(shBtn);
  ctrlRow.appendChild(mkBtn('← LAYOUTS','default',function(){ requestNewGame(); }));
}
function mkBtn(label, style, onClick){
  var b=document.createElement('button'); b.className='JGbtn';
  if(style==='primary')b.className+=' primary';
  b.textContent=label;
  b.addEventListener('click', function(e){ e.preventDefault(); onClick(); });
  return b;
}
topEls.hints={textContent:''};  // placeholder until real
topEls.shuffles={textContent:''};

// ── Actions ─────────────────────────────────────────────────────────────
function undo(){
  if(S.undoStack.length===0){ sm('Nothing to undo'); return; }
  var last=S.undoStack.pop();
  S.tiles[last[0]].removed=false;
  S.tiles[last[1]].removed=false;
  S.selected=null;
  S.moves--;
  try{_play('tap');}catch(e){}
  refreshAllTileStates();
  updateHUD();
}

function useHint(){
  if(S.hintsLeft<=0){ sm('No hints left'); return; }
  var m=findAnyMatch();
  if(!m){ sm('No matches — try shuffling'); return; }
  S.hintsLeft--;
  // Light 15s time penalty so hints aren't free speed
  S.startTime -= 15000;
  S.selected=null;
  refreshAllTileStates();
  // Briefly highlight BOTH tiles
  var a=tileEls[m[0]], b=tileEls[m[1]];
  if(a)a.classList.add('hint');
  if(b)b.classList.add('hint');
  // Scroll the first tile into view so hints on tiles outside the
  // current viewport don't feel like a wasted turn.
  if(a && a.scrollIntoView){
    try{a.scrollIntoView({block:'center', inline:'center', behavior:'smooth'});}catch(ev){}
  }
  setTimeout(function(){
    if(a)a.classList.remove('hint');
    if(b)b.classList.remove('hint');
  }, 1800);
  updateHUD();
  var hc=document.getElementById('JGhCnt'); if(hc) hc.textContent=S.hintsLeft;
}

function shuffleRemaining(){
  if(S.shufflesLeft<=0){ sm('No shuffles left'); return; }
  S.shufflesLeft--;
  S.startTime -= 30000;
  var remainIds=[], remainFaces=[];
  for(var i=0;i<S.tiles.length;i++){
    if(!S.tiles[i].removed){ remainIds.push(i); remainFaces.push(S.tiles[i].face); }
  }
  shuf(remainFaces);
  for(i=0;i<remainIds.length;i++) S.tiles[remainIds[i]].face=remainFaces[i];
  S.selected=null;
  // Rebuild tile contents (face/icon/label changed)
  remainIds.forEach(function(id){
    var el=tileEls[id]; if(!el)return;
    var t=S.tiles[id];
    el.style.color=t.face.color;
    el.innerHTML='';
    var ic=document.createElement('div'); ic.className='JGtileIcon'; ic.textContent=t.face.icon; ic.style.fontSize=Math.round(TILE_W*0.42)+'px';
    el.appendChild(ic);
    if(t.face.label!==''){
      var lbl=document.createElement('div'); lbl.className='JGtileLabel'; lbl.textContent=t.face.label; lbl.style.fontSize=Math.round(TILE_W*0.28)+'px';
      el.appendChild(lbl);
    }
  });
  refreshAllTileStates();
  updateHUD();
  var sc=document.getElementById('JGsCnt'); if(sc) sc.textContent=S.shufflesLeft;
  sm('Shuffled · +30s penalty');
}

function checkWin(){
  if(countRemaining()!==0)return false;
  S.phase='won';
  if(timerInt){clearInterval(timerInt);timerInt=null;}
  var secs=Math.round((Date.now()-S.startTime)/1000);
  try{_playWin();}catch(e){}
  _e('game_win');
  _sr('jade',{w:true,s:secs,h:5-S.hintsLeft});
  sm('Garden cleared! '+fmtTime(secs));
  // Save best time per layout
  try{
    var bestKey='lw_jade_best_'+S.layout;
    var prev=parseInt(localStorage.getItem(bestKey)||'9999',10);
    var isNewBest=secs<prev;
    if(isNewBest) localStorage.setItem(bestKey, String(secs));
    var winsKey='lw_jade_wins_'+S.layout;
    var wins=parseInt(localStorage.getItem(winsKey)||'0',10);
    localStorage.setItem(winsKey, String(wins+1));
    showWinCard(secs, isNewBest);
  }catch(e){ showWinCard(secs, false); }
  return true;
}
function checkStuck(){
  if(findAnyMatch())return;
  if(S.shufflesLeft>0){
    sm('No matches — use ♻ SHUFFLE ('+S.shufflesLeft+' left)');
  } else {
    sm('No matches and no shuffles left. Tap ← LAYOUTS to try again.');
  }
}

function fmtTime(s){ return Math.floor(s/60)+':'+(s%60<10?'0':'')+(s%60); }

function showWinCard(secs, isNewBest){
  if(winCard){winCard.remove();}
  winCard=document.createElement('div'); winCard.className='JGwin';
  var bestKey='lw_jade_best_'+S.layout;
  var best=parseInt(localStorage.getItem(bestKey)||'9999',10);
  var bestStr=(best>=9999)?'—':fmtTime(best);
  var winsKey='lw_jade_wins_'+S.layout;
  var wins=parseInt(localStorage.getItem(winsKey)||'0',10);
  var layoutLabel=LAYOUTS[S.layout].label;
  winCard.innerHTML=
    '<div class="JGwinTitle">GARDEN CLEARED</div>'+
    '<div class="JGwinStats">'+layoutLabel+' · '+fmtTime(secs)+(isNewBest?'  <span style="color:#ffdc70">★ new best</span>':'  ·  best '+bestStr)+'<br>'+
    'Hints '+(5-S.hintsLeft)+'/5  ·  Shuffles '+(3-S.shufflesLeft)+'/3  ·  '+wins+' clears</div>';
  var ly=S.layout;
  winCard.appendChild(mkBtn('↻ NEW GAME · '+layoutLabel,'primary',function(){ if(winCard){winCard.remove();winCard=null;} startGame(ly); }));
  winCard.appendChild(document.createElement('br'));
  winCard.appendChild(mkBtn('← PICK LAYOUT','default',function(){ requestNewGame(); }));
  pan.appendChild(winCard);
}

// ── DOM build ───────────────────────────────────────────────────────────
function buildDOM(host){
  pan=document.createElement('div'); pan.id='JGpan'; host.appendChild(pan);
  topBar=document.createElement('div'); topBar.className='JGtop'; pan.appendChild(topBar);
  topBar.innerHTML=
    '<div class="JGtopCell"><div class="JGtopLbl">PAIRS</div><div class="JGtopVal" id="JGmatch">0/72</div></div>'+
    '<div class="JGtopCell"><div class="JGtopLbl">TIME</div><div class="JGtopVal" id="JGtime">0:00</div></div>'+
    '<div class="JGtopCell"><div class="JGtopLbl">HINTS</div><div class="JGtopVal" id="JGhint">5</div></div>'+
    '<div class="JGtopCell"><div class="JGtopLbl">SHUFFLES</div><div class="JGtopVal" id="JGshuf">3</div></div>';
  topEls.matched=topBar.querySelector('#JGmatch');
  topEls.timer=topBar.querySelector('#JGtime');
  topEls.hints=topBar.querySelector('#JGhint');
  topEls.shuffles=topBar.querySelector('#JGshuf');
  boardWrap=document.createElement('div'); boardWrap.className='JGboardWrap'; pan.appendChild(boardWrap);
  boardEl=document.createElement('div'); boardEl.className='JGboard'; boardWrap.appendChild(boardEl);
  ctrlRow=document.createElement('div'); ctrlRow.className='JGctrls'; pan.appendChild(ctrlRow);
}

// ── Layout picker ───────────────────────────────────────────────────────
function showLayoutPicker(){
  if(pan){pan.innerHTML='';}
  else {pan=document.createElement('div'); pan.id='JGpan'; hostEl.appendChild(pan);}
  var ov=document.createElement('div'); ov.className='JGpick'; pan.appendChild(ov);
  var btnHtml='';
  Object.keys(LAYOUTS).forEach(function(key){
    var m=LAYOUTS[key];
    var best=parseInt(localStorage.getItem('lw_jade_best_'+key)||'9999',10);
    var wins=parseInt(localStorage.getItem('lw_jade_wins_'+key)||'0',10);
    var right=(best<9999)?fmtTime(best)+' · '+wins+' wins':(wins>0?wins+' wins':'');
    btnHtml+='<button class="JGpickBtn" data-l="'+key+'"><div class="lbl"><span>'+m.label+'</span><span class="JGpickBest">'+right+'</span></div><div class="sub">'+m.sub+'</div></button>';
  });
  ov.innerHTML=
    '<div class="JGpickTitle">JADE GARDEN</div>'+
    '<div class="JGpickSub">Mahjong Solitaire. Match two free tiles of the same face to remove them. A tile is free when nothing sits on top AND at least one side is open. Clear all 144.</div>'+
    '<div class="JGpickBtns">'+btnHtml+'</div>';
  ov.addEventListener('click', function(e){
    var b=e.target.closest('[data-l]');
    if(!b)return;
    startGame(b.getAttribute('data-l'));
  });
}

// ── Lifecycle ───────────────────────────────────────────────────────────
function requestNewGame(){
  if(timerInt){clearInterval(timerInt);timerInt=null;}
  if(winCard){winCard.remove();winCard=null;}
  showLayoutPicker();
}

function startGame(layoutKey){
  var meta=LAYOUTS[layoutKey];
  if(!meta){ sm('Unknown layout'); return; }
  var positions=meta.build();
  var tiles=generate(positions);
  if(!tiles){ sm('Generator failed — try a different layout'); return; }
  S={
    layout:layoutKey,
    tiles:tiles,
    selected:null,
    undoStack:[],
    hintsLeft:5,
    shufflesLeft:3,
    moves:0,
    startTime:Date.now(),
    phase:'play',
    locked:false
  };
  if(pan)pan.innerHTML='';
  buildDOM(hostEl);
  sizeForLayout();
  buildBoardDOM();
  buildControls();
  updateHUD();
  if(timerInt)clearInterval(timerInt);
  timerInt=setInterval(tickTimer, 500);
  sm('Tap matching free tiles');
}

// Run layout validator at module load — warns to console if any layout
// has the wrong position count or duplicates.
try{ validateLayouts(); }catch(e){}

window._gameFns = window._gameFns || {};
window._gameFns.jade = function(a){
  pan=null; topBar=null; boardWrap=null; boardEl=null; ctrlRow=null; winCard=null;
  topEls={matched:null,timer:null,hints:null,shuffles:null};
  tileEls={};
  if(timerInt){clearInterval(timerInt);timerInt=null;}
  hostEl=a;
  showLayoutPicker();
};
})();
