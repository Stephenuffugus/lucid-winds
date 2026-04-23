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

// Dragon: long S-shaped spine across 10×14 with small ridge layers
function dragonLayout(){
  var p=[];
  // Layer 0 — spine
  var row0=[
    {s:0,e:10,r:0},
    {s:0,e:10,r:1},
    {s:2,e:12,r:2},
    {s:2,e:12,r:3},
    {s:4,e:14,r:4},
    {s:4,e:14,r:5},
    {s:2,e:12,r:6},
    {s:2,e:12,r:7},
    {s:0,e:10,r:8},
    {s:0,e:10,r:9}
  ];
  row0.forEach(function(w){
    for(var c=w.s;c<w.e;c++) p.push([0,c,w.r]);
  });
  // Layer 1 — narrower ridge
  for(var r=1;r<9;r++){
    var start=r<2?1:r<4?3:r<6?5:r<8?3:1;
    var end=r<2?9:r<4?11:r<6?13:r<8?11:9;
    for(var c=start;c<end;c++) p.push([1,c,r]);
  }
  // Layer 2 — small spine
  for(r=2;r<8;r++) for(c=5;c<10;c++) p.push([2,c,r]);
  // Layer 3
  for(r=3;r<7;r++) for(c=6;c<9;c++) p.push([3,c,r]);
  // Trim to 144
  while(p.length>144) p.pop();
  while(p.length<144) p.push([0,p.length%10,10]); // pad
  return p;
}

// Pyramid: wide base, step up to small peak
function pyramidLayout(){
  var p=[];
  // Base 12×12 minus corners
  for(var r=0;r<10;r++){
    var w=12-r;
    var start=r;
    for(var c=start;c<start+w;c++) p.push([0,c,r]);
  }
  // Layer 1
  for(r=1;r<8;r++){
    var w2=9-r;
    var start2=r+1;
    for(c=start2;c<start2+w2;c++) p.push([1,c,r]);
  }
  // Layer 2
  for(r=2;r<7;r++){
    var w3=6-r;
    var start3=r+2;
    for(c=start3;c<start3+w3;c++) p.push([2,c,r]);
  }
  // Layer 3
  for(r=3;r<6;r++){
    for(c=r+3;c<r+6;c++) p.push([3,c,r]);
  }
  // Peak
  p.push([4,6,4]);
  while(p.length>144) p.pop();
  while(p.length<144) p.push([0,p.length%12,11]);
  return p;
}

// Fortress: outer ring of 2-deep walls, inner courtyard with a small pillar
function fortressLayout(){
  var p=[];
  // Layer 0 outer ring (12 wide × 10 tall)
  for(var r=0;r<10;r++){
    for(var c=0;c<12;c++){
      if(r<2 || r>=8 || c<2 || c>=10) p.push([0,c,r]);
    }
  }
  // Layer 0 inner courtyard (4×4 inside, leaving some open space)
  for(r=3;r<7;r++) for(c=3;c<9;c++) p.push([0,c,r]);
  // Layer 1 wall caps (top+bottom edges)
  for(c=1;c<11;c++){ p.push([1,c,0]); p.push([1,c,9]); }
  // Layer 1 side walls
  for(r=2;r<8;r++){ p.push([1,0,r]); p.push([1,11,r]); }
  // Layer 1 corners strengthening
  for(r=0;r<3;r++){ p.push([1,0,r]); p.push([1,11,r]); }
  for(r=7;r<10;r++){ p.push([1,0,r]); p.push([1,11,r]); }
  // Layer 2 courtyard pillar
  for(r=4;r<7;r++) for(c=4;c<8;c++) p.push([2,c,r]);
  // Layer 3 cap
  for(r=4;r<6;r++) for(c=5;c<7;c++) p.push([3,c,r]);
  // Layer 4 pinnacle
  p.push([4,5,4]); p.push([4,6,4]);
  while(p.length>144) p.pop();
  while(p.length<144) p.push([0,p.length%12,10]);
  return p;
}

// Bamboo: long and thin — 16 wide × 5 tall with layered spine
function bambooLayout(){
  var p=[];
  // Base 16×6
  for(var r=0;r<6;r++) for(var c=0;c<16;c++) p.push([0,c,r]);
  // Layer 1 — 14 × 4
  for(r=1;r<5;r++) for(c=1;c<15;c++) p.push([1,c,r]);
  // Layer 2 — 12 × 2
  for(r=2;r<4;r++) for(c=2;c<14;c++) p.push([2,c,r]);
  // Layer 3 cap — 10 × 1
  for(c=3;c<13;c++) p.push([3,c,2]);
  // Trim
  while(p.length>144) p.pop();
  while(p.length<144) p.push([0,p.length%16,6]);
  return p;
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
    '.JGboardWrap{overflow:auto;-webkit-overflow-scrolling:touch;padding:8px 4px;background:rgba(12,16,10,0.4);border:1.5px solid rgba(74,124,53,0.22);border-radius:10px;max-height:62vh;touch-action:pan-x pan-y}',
    '.JGboard{position:relative;margin:0 auto}',
    // Tile
    '.JGtile{position:absolute;background:linear-gradient(180deg,#f5f0e1,#e8dcc0);border:1.5px solid #b8a87a;border-radius:5px;box-shadow:2px 2px 0 0 #b8a87a,3px 3px 0 0 #a89868,4px 4px 6px rgba(0,0,0,0.45);display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:700;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;transition:transform .1s ease,opacity .18s ease,filter .15s ease}',
    '.JGtile.blocked{opacity:0.38;filter:saturate(0.6);cursor:default}',
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
  // Fit tile sizes to viewport. Smaller grids fit larger tiles.
  var vw=Math.min(window.innerWidth-24, 640);
  // Estimate board width: max col offset × 0.6 × TW + TW + some padding
  TILE_W=vw<360?36:vw<480?40:vw<620?44:48;
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

// Update all tiles' "blocked / free" classes. Called after any change to
// the board state (place, remove, undo, shuffle).
function refreshAllTileStates(){
  for(var i=0;i<S.tiles.length;i++){
    var el=tileEls[i];
    if(!el)continue;
    var t=S.tiles[i];
    if(t.removed){ el.style.display='none'; continue; }
    el.style.display='';
    var free=isFree(i);
    var classes='JGtile';
    if(!free) classes+=' blocked';
    if(S.selected===i) classes+=' sel';
    el.className=classes;
  }
}

function tapTile(id){
  if(S.phase!=='play')return;
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
    // Animate remove
    var el1=tileEls[firstId], el2=tileEls[id];
    if(el1)el1.classList.add('removing');
    if(el2)el2.classList.add('removing');
    try{_play('match');}catch(e){}
    try{navigator.vibrate&&navigator.vibrate(12);}catch(e){}
    // Mark removed after animation
    setTimeout(function(){
      S.tiles[firstId].removed=true;
      S.tiles[id].removed=true;
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
    phase:'play'
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
