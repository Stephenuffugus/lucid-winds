// ═══ LUCID WINDS — Root Rush (Rush Hour / Unblock Me variant) ═══
// Slide wooden blocks along their grain to clear a path for the
// sprouting seed (special piece) to reach the sunlit exit on the right.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,_setDiff=G.setDiff,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr;

var SZ=6;
var EXIT_ROW=2;

// Each level: 6 strings of 6 chars. X = sprouting seed (always horizontal, length 2, on row 2).
// Letters A-Z = other pieces. Same letter twice horizontally = horiz 2-cell, three times = horiz 3-cell.
// Same column = vertical. '.' = empty.
var LEVELS=[
  // ── Easy 1-3: hand-picked tutorials, each teaching a distinct concept ───
  { name:'Easy 1', diff:'easy', optimal:3, grid:[
    'CCC...',
    '....AB',
    '..XXAB',
    '......',
    'D..EEE',
    'DFF...'
  ]},
  { name:'Easy 2', diff:'easy', optimal:3, grid:[
    'JJ...C',
    '.....C',
    '..XX.A',
    '.....A',
    '....MM',
    '..KKK.'
  ]},
  { name:'Easy 3', diff:'easy', optimal:3, grid:[
    '..HHH.',
    '....A.',
    '..XXA.',
    '....B.',
    '....B.',
    '..GGGG'
  ]},
  // ── Easy 4-11: solver-verified 4-move puzzles, varied openings ──────────
  { name:'Easy 4', diff:'easy', optimal:4, grid:[
    'GBBEEF',
    'G....F',
    'AAXX.F',
    '...CCC',
    '......',
    '...DDD'
  ]},
  { name:'Easy 5', diff:'easy', optimal:4, grid:[
    'EE....',
    '....AC',
    '..XXAC',
    'D...A.',
    'D...BB',
    'D.....'
  ]},
  { name:'Easy 6', diff:'easy', optimal:4, grid:[
    '.F...C',
    'GFEEAC',
    'G.XXAC',
    '...DDD',
    '......',
    '...BB.'
  ]},
  { name:'Easy 7', diff:'easy', optimal:4, grid:[
    '......',
    '.A..CB',
    '.AXXCB',
    '.AEEEB',
    '......',
    '....DD'
  ]},
  { name:'Easy 8', diff:'easy', optimal:4, grid:[
    '.....D',
    '.BBB.D',
    '..XXCD',
    'AA..C.',
    '....C.',
    '...EE.'
  ]},
  { name:'Easy 9', diff:'easy', optimal:4, grid:[
    'C.....',
    'C...E.',
    '..XXEF',
    '.GGGEF',
    'A.BB..',
    'A..DDD'
  ]},
  { name:'Easy 10', diff:'easy', optimal:4, grid:[
    '......',
    '......',
    '..XXBD',
    'CC..BD',
    '.....D',
    '...AAA'
  ]},
  { name:'Easy 11', diff:'easy', optimal:4, grid:[
    '.C....',
    '.C.AAA',
    '.CXXDF',
    '.E..DF',
    '.E..DF',
    '..BBB.'
  ]},
  { name:'Easy 12', diff:'easy', optimal:4, grid:[
    'E.CIII',
    'E.C.A.',
    'EDXXAB',
    '.D...B',
    'H.GGG.',
    'HFFF..'
  ]},
  { name:'Easy 13', diff:'easy', optimal:4, grid:[
    'HHGG..',
    'FF...B',
    'KXXCAB',
    'KD.CAJ',
    'ID..AJ',
    'IDEE.J'
  ]},
  { name:'Easy 14', diff:'easy', optimal:4, grid:[
    '.FFFII',
    'HHJJA.',
    'KKXXAB',
    'DD..AB',
    'E.GG.B',
    'E..CC.'
  ]},
  { name:'Easy 15', diff:'easy', optimal:4, grid:[
    'J..CCC',
    'JGGGA.',
    'KKXXAB',
    '..DDDB',
    'HE..IB',
    'HEFFI.'
  ]},
  { name:'Easy 16', diff:'easy', optimal:4, grid:[
    'C.GGG.',
    'CHDD.B',
    '.HXXAB',
    'JJFFA.',
    '....AI',
    '...EEI'
  ]},
  { name:'Easy 17', diff:'easy', optimal:4, grid:[
    'GE.DDD',
    'GEKK.B',
    '.EXXAB',
    'CCJIAH',
    'F.JIAH',
    'F.JI..'
  ]},
  { name:'Easy 18', diff:'easy', optimal:4, grid:[
    'JJ..G.',
    'HH.CG.',
    'LXXCAB',
    'L.FFAB',
    'IKEE.B',
    'IK.DD.'
  ]},
  { name:'Easy 19', diff:'easy', optimal:4, grid:[
    '.I..EE',
    '.IHHB.',
    'JIXXBA',
    'JGGG.A',
    'FFCCC.',
    'DDD.KK'
  ]},
  { name:'Easy 20', diff:'easy', optimal:4, grid:[
    'EE.DD.',
    'CCC.JJ',
    'G.XXBA',
    'GF..BA',
    '.F.II.',
    '...HHH'
  ]},
  { name:'Medium 1', diff:'medium', optimal:5, grid:[
    'KKE...',
    'FFEB.A',
    'XXCBDA',
    '..C.DH',
    'GG.IDH',
    'JJJI.H'
  ]},
  { name:'Medium 2', diff:'medium', optimal:5, grid:[
    '.GGII.',
    'C...A.',
    'C.XXAB',
    '.DE..B',
    '.DEFFJ',
    '...HHJ'
  ]},
  { name:'Medium 3', diff:'medium', optimal:5, grid:[
    'CC..GG',
    'IIILLB',
    'KKXXAB',
    'DDD.A.',
    'MF.EEH',
    'MFJJ.H'
  ]},
  { name:'Medium 4', diff:'medium', optimal:5, grid:[
    'J.EEKK',
    'JFFFA.',
    'J.XXAB',
    'HCGIAB',
    'HCGI.B',
    '.CDDD.'
  ]},
  { name:'Medium 5', diff:'medium', optimal:5, grid:[
    'J..II.',
    'J.DDAC',
    '.XXBAC',
    '...BF.',
    'HH..FK',
    '.GGEEK'
  ]},
  { name:'Medium 6', diff:'medium', optimal:5, grid:[
    'KCHDD.',
    'KCHGGA',
    'KCXXBA',
    'FI.JB.',
    'FILJB.',
    'FIL.EE'
  ]},
  { name:'Medium 7', diff:'medium', optimal:5, grid:[
    '.C....',
    '.CHHGG',
    'E.XXAB',
    'ED..AB',
    '.DFFA.',
    '.IIJJ.'
  ]},
  { name:'Medium 8', diff:'medium', optimal:6, grid:[
    '.I.FF.',
    'EIGGB.',
    'EXXCBA',
    'JMLC.A',
    'JMLHH.',
    '.DDKKK'
  ]},
  { name:'Medium 9', diff:'medium', optimal:6, grid:[
    '..JJ..',
    'IIACGG',
    'XXACBF',
    '..EEBF',
    'H.KK.F',
    'H..DD.'
  ]},
  { name:'Medium 10', diff:'medium', optimal:6, grid:[
    '.GG.FF',
    '..DDDA',
    '.IXXBA',
    'CIEEBL',
    'C.KJJL',
    'C.KHH.'
  ]},
  { name:'Medium 11', diff:'medium', optimal:6, grid:[
    'H.IIIK',
    'HGGABK',
    'HXXABC',
    'D.JJ.C',
    'D.LL.C',
    'DEEFF.'
  ]},
  { name:'Medium 12', diff:'medium', optimal:6, grid:[
    '.DI.AG',
    'FDIBAG',
    'FXXBAC',
    'F....C',
    '.EEE.C',
    '.JJHH.'
  ]},
  { name:'Medium 13', diff:'medium', optimal:6, grid:[
    '.G.EEE',
    'CGFFAB',
    'C.XXAB',
    'CDJJKB',
    '.D..K.',
    'HH.III'
  ]},
  { name:'Medium 14', diff:'medium', optimal:6, grid:[
    '..GG..',
    'FFFIIB',
    '.XXCAB',
    'D.HCA.',
    'D.HC.J',
    'EEEKKJ'
  ]},
  { name:'Medium 15', diff:'medium', optimal:7, grid:[
    'FF.DD.',
    'IIIACB',
    'JXXACB',
    'J..AKK',
    '..LLHH',
    'EE.GG.'
  ]},
  { name:'Medium 16', diff:'medium', optimal:7, grid:[
    'MDDKK.',
    'MEEEHH',
    'M.XXAB',
    'ICJJAB',
    'ICFFFB',
    'I.GGLL'
  ]},
  { name:'Medium 17', diff:'medium', optimal:7, grid:[
    'G.JJH.',
    'GDD.H.',
    '.XXCBA',
    'IMMCBA',
    'IKKFBA',
    'EE.FLL'
  ]},
  { name:'Medium 18', diff:'medium', optimal:7, grid:[
    '..DDFF',
    'HH.LLC',
    '.XXABC',
    'EMIAB.',
    'EMI.GK',
    '..JJGK'
  ]},
  { name:'Medium 19', diff:'medium', optimal:7, grid:[
    'IG.HHJ',
    'IG.CCJ',
    '..XXBA',
    'ED..BA',
    'ED.KKA',
    'EDFFLL'
  ]},
  { name:'Medium 20', diff:'medium', optimal:7, grid:[
    'JJJ.II',
    'D.KKGG',
    'DXXABC',
    'LLLABC',
    '.FF.BH',
    'MMEE.H'
  ]},
  { name:'Medium 21', diff:'medium', optimal:7, grid:[
    'LEFHHA',
    'LEF.BA',
    'IIXXBA',
    '.DD.JJ',
    '...GG.',
    '.CC.KK'
  ]},
  { name:'Medium 22', diff:'medium', optimal:7, grid:[
    'JH.MM.',
    'JH..EE',
    'XXCBAD',
    'GFCBAD',
    'GF..KK',
    '.LLIII'
  ]},
  { name:'Medium 23', diff:'medium', optimal:9, grid:[
    '..HHGG',
    'DD...A',
    '.KXXBA',
    '.KIIB.',
    'CCCJB.',
    '.EEJFF'
  ]},
  { name:'Medium 24', diff:'medium', optimal:10, grid:[
    'DD....',
    'HHEE..',
    '.FXXAB',
    '.F..AB',
    'CG..AB',
    'CGJJII'
  ]},
  { name:'Medium 25', diff:'medium', optimal:10, grid:[
    'J.EE.F',
    'JGGG.F',
    '.DXXAB',
    '.DIKAB',
    '.DIKHH',
    '..ICCC'
  ]},
  { name:'Hard 1', diff:'hard', optimal:11, grid:[
    '.KKFF.',
    'GGCIII',
    'XXCABD',
    'LL.ABD',
    'JJJ.BH',
    '.EEMMH'
  ]},
  { name:'Hard 2', diff:'hard', optimal:11, grid:[
    '.DDD..',
    'FFJJJB',
    '.XXACB',
    'GG.ACB',
    '..HEEE',
    'KKHIII'
  ]},
  { name:'Hard 3', diff:'hard', optimal:11, grid:[
    'HHHII.',
    'K.DDCB',
    'KXXACB',
    'KLLA.B',
    'GEFFF.',
    'GE..JJ'
  ]},
  { name:'Hard 4', diff:'hard', optimal:11, grid:[
    'DDEE..',
    'J..AKK',
    'JXXABC',
    '...ABC',
    'HFFF.I',
    'H.GG.I'
  ]},
  { name:'Hard 5', diff:'hard', optimal:11, grid:[
    'KEEE.H',
    'KCC.AH',
    'K.XXAB',
    'JFIIAB',
    'JFDG.B',
    '.FDGLL'
  ]},
  { name:'Hard 6', diff:'hard', optimal:11, grid:[
    'E.DJJ.',
    'E.DBKK',
    'XXDBAC',
    '.LL.AC',
    'FF..H.',
    'GGIIH.'
  ]},
  { name:'Hard 7', diff:'hard', optimal:11, grid:[
    'HHH.BK',
    '.GGGBK',
    '.XXABC',
    'FLLA.C',
    'FIJJDD',
    '.IEE..'
  ]},
  { name:'Hard 8', diff:'hard', optimal:11, grid:[
    '...DDG',
    '.FFFCG',
    'XXABCE',
    'IIAB.E',
    'LLHHH.',
    'JJ.KKK'
  ]},
  { name:'Hard 9', diff:'hard', optimal:12, grid:[
    'HK.GG.',
    'HK.ACD',
    'XXBACD',
    'NEB.II',
    'NEFFMM',
    'LLLJJ.'
  ]},
  { name:'Hard 10', diff:'hard', optimal:12, grid:[
    '.LLLJJ',
    'DDD.B.',
    'IXXABC',
    'IGGABC',
    'F.HH.M',
    'FEEKKM'
  ]},
  { name:'Hard 11', diff:'hard', optimal:13, grid:[
    'GG.JFF',
    'CHHJA.',
    'C.XXAB',
    'C.IIIB',
    '.EEEDB',
    'KK..D.'
  ]},
  { name:'Hard 12', diff:'hard', optimal:14, grid:[
    'KKEE.A',
    '..B.CA',
    'XXB.CA',
    'ID.FLL',
    'ID.FJJ',
    'IDHHGG'
  ]},
  { name:'Hard 13', diff:'hard', optimal:14, grid:[
    '..EE..',
    'HH.ABC',
    'KXXABC',
    'K...B.',
    'GDJFF.',
    'GDJ.II'
  ]},
  { name:'Hard 14', diff:'hard', optimal:17, grid:[
    'FIIIB.',
    'FGG.BA',
    '.XXCBA',
    'JL.C.A',
    'JLH.EE',
    'KKHDD.'
  ]},
  { name:'Hard 15', diff:'hard', optimal:19, grid:[
    'HH.EE.',
    'JJJD..',
    'XXCDBA',
    '..C.BA',
    'GF.KKA',
    'GF.II.'
  ]}
];

// ── Styles ────────────────────────────────────────────────────────────────
(function injectStyle(){
  if(document.getElementById('rr-anim-style'))return;
  var s=document.createElement('style');s.id='rr-anim-style';
  s.textContent=[
    '@keyframes rrPanIn{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}',
    '@keyframes rrLineIn{0%{transform:translateY(8px);opacity:0}100%{transform:translateY(0);opacity:1}}',
    '@keyframes rrPop{0%{transform:scale(0.3);opacity:0}55%{transform:scale(1.2);opacity:1}100%{transform:scale(1);opacity:1}}',
    '@keyframes rrExitGlow{0%,100%{box-shadow:inset 0 0 24px rgba(255,220,112,0.25),inset 0 0 0 2px rgba(200,168,75,0.35)}50%{box-shadow:inset 0 0 36px rgba(255,220,112,0.45),inset 0 0 0 2px rgba(255,220,112,0.6)}}',
    '@keyframes rrSprout{0%,100%{filter:drop-shadow(0 0 6px rgba(122,179,86,0.5))}50%{filter:drop-shadow(0 0 14px rgba(122,179,86,0.85))}}',
    '#RRpan{max-width:min(96vw,480px);margin:0 auto;padding:12px;user-select:none;-webkit-user-select:none;touch-action:none;box-sizing:border-box;position:relative;animation:rrPanIn .4s ease}',
    '.RRboard{position:relative;width:100%;aspect-ratio:1;background:linear-gradient(135deg,#3a2410 0%,#2a1810 55%,#1a0c08 100%);border:2px solid #6b4520;border-radius:10px;box-shadow:inset 0 0 0 1px rgba(220,160,90,0.18),inset 0 0 40px rgba(0,0,0,0.6),0 6px 22px rgba(0,0,0,0.55);overflow:visible}',
    '.RRgrid{position:absolute;inset:4px;background-image:linear-gradient(rgba(255,220,160,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,220,160,0.06) 1px,transparent 1px);background-size:calc(100%/6) calc(100%/6);border-radius:6px}',
    '.RRexit{position:absolute;right:-6px;width:10px;background:radial-gradient(ellipse at 100% 50%,rgba(255,220,112,0.6) 0%,rgba(200,168,75,0.2) 60%,transparent 100%);pointer-events:none;animation:rrExitGlow 2.2s ease-in-out infinite}',
    '.RRblock{position:absolute;border-radius:8px;cursor:grab;transition:transform .18s cubic-bezier(.2,1.1,.3,1),box-shadow .18s ease;will-change:transform;box-shadow:inset 0 1px 0 rgba(255,220,160,0.22),inset 0 -1px 0 rgba(0,0,0,0.3),0 3px 7px rgba(0,0,0,0.45)}',
    '.RRblock.drag{cursor:grabbing;transition:none;transform:scale(1.02);box-shadow:inset 0 1px 0 rgba(255,220,160,0.3),0 6px 16px rgba(0,0,0,0.6);z-index:10}',
    '.RRblock::before{content:"";position:absolute;inset:2px;border-radius:6px;background:inherit;filter:brightness(1.15);opacity:.3;pointer-events:none}',
    '.RRblock.vert::after{content:"";position:absolute;inset:0;border-radius:8px;background:repeating-linear-gradient(180deg,transparent 0,transparent 6px,rgba(0,0,0,0.08) 6px,rgba(0,0,0,0.08) 7px);pointer-events:none}',
    '.RRblock.horiz::after{content:"";position:absolute;inset:0;border-radius:8px;background:repeating-linear-gradient(90deg,transparent 0,transparent 6px,rgba(0,0,0,0.08) 6px,rgba(0,0,0,0.08) 7px);pointer-events:none}',
    '.RRblock.special{background:linear-gradient(180deg,#a0d070 0%,#7ab356 55%,#5a9338 100%)!important;border:1.5px solid rgba(200,168,75,0.55);animation:rrSprout 2.6s ease-in-out infinite}',
    '.RRblock.special::before{background:radial-gradient(circle at 50% 40%,rgba(255,255,200,0.45) 0%,transparent 60%);filter:none;opacity:1}',
    '.RRblock.special .RRleaf{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:1.6rem;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.5))}',
    '.RRctrl{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:10px 4px 2px;flex-wrap:wrap}',
    '.RRinfo{display:flex;gap:10px;align-items:center;font-family:Georgia,serif;font-size:0.72rem;color:rgba(232,220,200,0.85);flex-wrap:wrap}',
    '.RRinfo strong{color:#c8a84b;font-weight:700}',
    '.RRbtn-row{display:flex;gap:6px;flex-wrap:wrap}',
    '.RRb{min-height:34px;padding:5px 12px;font-size:.68rem;font-family:Georgia,serif;font-weight:700;border-radius:6px;cursor:pointer;background:rgba(26,31,23,0.7);border:1.5px solid rgba(122,179,86,0.4);color:#e8dcc8;transition:all .15s}',
    '.RRb:active{background:rgba(122,179,86,0.2);transform:scale(.96)}',
    '.RRb.gold{border-color:#c8a84b;color:#c8a84b;background:linear-gradient(180deg,rgba(200,168,75,0.18),rgba(160,130,50,0.22))}',
    '.RRb[disabled]{opacity:.35;pointer-events:none}',
    '.RRlvl{font-family:Georgia,serif;font-style:italic;font-size:0.68rem;color:rgba(232,220,200,0.75);letter-spacing:0.04em}',
    '.RRlvl strong{color:#c8a84b;font-style:normal}'
  ].join('');
  document.head.appendChild(s);
})();

// ── State ─────────────────────────────────────────────────────────────────
var levelIdx=0;
var blocks=[];           // [{id,length,orient,row,col,special}]
var moves=0;
var history=[];          // snapshots of blocks state
var startTs=0;
var solvedTs=0;
var won=false;
var timerId=null;
var pan=null;
var board=null;

// Level progress persistence
function loadProgress(){try{return parseInt(localStorage.getItem('lw_rootrush_max')||'0',10)||0;}catch(e){return 0;}}
function saveProgress(n){try{localStorage.setItem('lw_rootrush_max',String(n));}catch(e){}}

function cloneBlocks(){
  return blocks.map(function(b){return{id:b.id,length:b.length,orient:b.orient,row:b.row,col:b.col,special:b.special};});
}

// Palette for non-special blocks — wooden warm tones
var WOOD_COLORS=['#7a5028','#8a5832','#6e4624','#94603a','#6b3c1e','#7f4a26','#8a6042','#9a5836','#654020','#8c5224'];
function blockColor(idx,special){
  if(special)return '#7ab356';
  return WOOD_COLORS[idx%WOOD_COLORS.length];
}

// ── BFS hint solver (browser-side) ─────────────────────────────────────────
// Serialize blocks into a canonical state key
function _serializeBlocks(blks){
  var parts=blks.map(function(b){return b.id+b.row+b.col;});
  parts.sort();
  return parts.join(',');
}
function _isWonState(blks){
  for(var i=0;i<blks.length;i++){
    var b=blks[i];
    if(b.special&&b.orient==='h'&&b.row===EXIT_ROW&&b.col+b.length>=SZ)return true;
  }
  return false;
}
function _genStateMoves(blks){
  // Build occupancy grid for this state, return array of {blockIdx, delta}
  var g=new Array(SZ*SZ).fill(null);
  for(var bi=0;bi<blks.length;bi++){
    var bb=blks[bi];
    for(var k=0;k<bb.length;k++){
      var cell=bb.orient==='h'?bb.row*SZ+bb.col+k:(bb.row+k)*SZ+bb.col;
      g[cell]=bb.id;
    }
  }
  var moves=[];
  for(var idx=0;idx<blks.length;idx++){
    var b=blks[idx];
    var bcells=[];
    for(var kk=0;kk<b.length;kk++){
      var c=b.orient==='h'?b.row*SZ+b.col+kk:(b.row+kk)*SZ+b.col;
      bcells.push(c);g[c]=null;
    }
    if(b.orient==='h'){
      for(var l=1;b.col-l>=0;l++){if(g[b.row*SZ+b.col-l]!==null)break;moves.push({idx:idx,delta:-l});}
      for(var rt=1;b.col+b.length-1+rt<SZ;rt++){if(g[b.row*SZ+b.col+b.length-1+rt]!==null)break;moves.push({idx:idx,delta:rt});}
    } else {
      for(var u=1;b.row-u>=0;u++){if(g[(b.row-u)*SZ+b.col]!==null)break;moves.push({idx:idx,delta:-u});}
      for(var d=1;b.row+b.length-1+d<SZ;d++){if(g[(b.row+b.length-1+d)*SZ+b.col]!==null)break;moves.push({idx:idx,delta:d});}
    }
    for(var ri=0;ri<bcells.length;ri++)g[bcells[ri]]=b.id;
  }
  return moves;
}
function _applyStateMove(blks,move){
  var out=blks.map(function(b){return{id:b.id,length:b.length,orient:b.orient,row:b.row,col:b.col,special:b.special};});
  var nb=out[move.idx];
  if(nb.orient==='h')nb.col+=move.delta;else nb.row+=move.delta;
  return out;
}
// BFS to find next optimal move from the current board state.
// Returns {blockId, delta} for the first move on a shortest path to win, or null.
// Time-capped so we never freeze on a pathological state.
function computeHint(){
  var start=cloneBlocks();
  if(_isWonState(start))return null;
  var t0=Date.now();
  var queue=[{blks:start,firstMove:null}];
  var visited={};
  visited[_serializeBlocks(start)]=true;
  while(queue.length){
    if(Date.now()-t0>1200)return null; // cap at ~1.2s
    var node=queue.shift();
    var nm=_genStateMoves(node.blks);
    for(var i=0;i<nm.length;i++){
      var mv=nm[i];
      var nb=_applyStateMove(node.blks,mv);
      var first=node.firstMove||{blockId:node.blks[mv.idx].id,delta:mv.delta};
      if(_isWonState(nb))return first;
      var key=_serializeBlocks(nb);
      if(!visited[key]){visited[key]=true;queue.push({blks:nb,firstMove:first});}
    }
  }
  return null;
}

// ── Parsing ───────────────────────────────────────────────────────────────
function parseLevel(grid){
  var cells=[];
  for(var r=0;r<SZ;r++){
    var row=grid[r];
    for(var c=0;c<SZ;c++)cells.push(row.charAt(c)==='.'?null:row.charAt(c));
  }
  var seen={};var blist=[];
  for(var i=0;i<SZ*SZ;i++){
    var v=cells[i];
    if(!v||seen[v])continue;
    seen[v]=true;
    var positions=[];
    for(var j=0;j<SZ*SZ;j++)if(cells[j]===v)positions.push(j);
    var rows=positions.map(function(p){return Math.floor(p/SZ);});
    var cols=positions.map(function(p){return p%SZ;});
    var orient=(rows[0]===rows[rows.length-1])?'h':'v';
    var minR=Math.min.apply(null,rows);
    var minC=Math.min.apply(null,cols);
    blist.push({id:v,length:positions.length,orient:orient,row:minR,col:minC,special:(v==='X')});
  }
  return blist;
}

// ── Collision / occupancy ─────────────────────────────────────────────────
function occupancyGrid(){
  var g=[];for(var i=0;i<SZ*SZ;i++)g.push(null);
  blocks.forEach(function(b){
    for(var k=0;k<b.length;k++){
      var cell=b.orient==='h'?(b.row*SZ+b.col+k):((b.row+k)*SZ+b.col);
      g[cell]=b.id;
    }
  });
  return g;
}

// Largest legal delta (cells) for a block — positive = right/down, negative = left/up
function legalRange(id){
  var b=blocks.filter(function(x){return x.id===id;})[0];
  if(!b)return{min:0,max:0};
  var g=occupancyGrid();
  // Clear this block's own cells
  for(var k=0;k<b.length;k++){
    var cell=b.orient==='h'?(b.row*SZ+b.col+k):((b.row+k)*SZ+b.col);
    g[cell]=null;
  }
  var max=0,min=0;
  if(b.orient==='h'){
    // try rightward
    for(var r=1;b.col+b.length-1+r<SZ;r++){
      var ci=b.row*SZ+b.col+b.length-1+r;
      if(g[ci]!==null)break;
      max=r;
    }
    // rightward may also include exit passage for special piece
    if(b.special&&b.row===EXIT_ROW){
      // If all cells to the right are clear, we can slide off the board
      var clearToExit=true;
      for(var r2=b.col+b.length;r2<SZ;r2++){
        if(g[b.row*SZ+r2]!==null){clearToExit=false;break;}
      }
      if(clearToExit)max=Math.max(max,SZ-(b.col+b.length-1));
    }
    for(var l=1;b.col-l>=0;l++){
      var ci2=b.row*SZ+b.col-l;
      if(g[ci2]!==null)break;
      min=-l;
    }
  } else {
    for(var d=1;b.row+b.length-1+d<SZ;d++){
      var ci3=(b.row+b.length-1+d)*SZ+b.col;
      if(g[ci3]!==null)break;
      max=d;
    }
    for(var u=1;b.row-u>=0;u++){
      var ci4=(b.row-u)*SZ+b.col;
      if(g[ci4]!==null)break;
      min=-u;
    }
  }
  return{min:min,max:max};
}

// ── Move execution ───────────────────────────────────────────────────────
function moveBlock(id,delta){
  if(won||delta===0)return false;
  var b=blocks.filter(function(x){return x.id===id;})[0];
  if(!b)return false;
  var range=legalRange(id);
  if(delta<range.min||delta>range.max)return false;
  var snap=cloneBlocks();
  if(b.orient==='h')b.col+=delta;else b.row+=delta;
  history.push(snap);
  moves++;
  _play('tap');
  updateStatus();
  checkWin();
  return true;
}

function undoMove(){
  if(!history.length||won)return;
  blocks=history.pop();
  moves=Math.max(0,moves-1);
  _play('tap');
  updateStatus();
  renderBlocks();
}

function resetLevel(){
  if(won)return;
  loadLevel(levelIdx,true);
}

function checkWin(){
  var special=blocks.filter(function(b){return b.special;})[0];
  if(!special)return;
  // Win when special block has slid off the right edge (col + length >= SZ + 1 after final move)
  // Practical check: if special's right edge reached the exit column (col + length >= SZ)
  if(special.orient==='h'&&special.row===EXIT_ROW&&special.col+special.length>=SZ){
    won=true;solvedTs=Date.now();
    if(timerId){clearInterval(timerId);timerId=null;}
    _e('game_win');if(_playWin)_playWin();_sr('rootrush',{w:true,s:moves,lvl:levelIdx+1});
    var prog=loadProgress();
    if(levelIdx+1>prog)saveProgress(levelIdx+1);
    setTimeout(function(){animateExit();},50);
  }
  renderBlocks();
}

// ── Rendering ─────────────────────────────────────────────────────────────
function updateStatus(){
  var m=document.getElementById('RRm');if(m)m.textContent=moves;
  var ub=document.getElementById('RRu');if(ub)ub.disabled=!history.length||won;
  var lvl=document.getElementById('RRlvl');if(lvl){
    var L=LEVELS[levelIdx];
    lvl.innerHTML='<strong>Level '+(levelIdx+1)+'/'+LEVELS.length+'</strong> · '+L.name+' · opt '+L.optimal;
  }
  var pb=document.getElementById('RRprev');if(pb)pb.disabled=(levelIdx<=0);
  var nb=document.getElementById('RRnext');if(nb){
    var prog=loadProgress();
    nb.disabled=(levelIdx>=LEVELS.length-1)||(levelIdx>=prog&&!won);
  }
}

function fmtTime(secs){
  var m=Math.floor(secs/60),s=secs%60;
  return m+':'+(s<10?'0':'')+s;
}

function tickTimer(){
  if(won||!startTs)return;
  var secs=Math.max(0,Math.round((Date.now()-startTs)/1000));
  var t=document.getElementById('RRt');if(t)t.textContent=fmtTime(secs);
}

function renderBlocks(){
  if(!board)return;
  // Remove existing block nodes (keep grid overlay + exit glow)
  var prev=board.querySelectorAll('.RRblock');
  for(var i=0;i<prev.length;i++)prev[i].remove();
  // Percentage positioning — cell size = (100% - 8px) / 6, inner pad 4px, gutter 3px each side.
  // Auto-scales with board width so blocks never shrink on re-render when layout shifts.
  blocks.forEach(function(b,idx){
    var el=document.createElement('div');
    el.className='RRblock '+(b.orient==='h'?'horiz':'vert')+(b.special?' special':'');
    el.setAttribute('data-id',b.id);
    var wLen=(b.orient==='h'?b.length:1);
    var hLen=(b.orient==='v'?b.length:1);
    el.style.width='calc('+wLen+' * (100% - 8px) / 6 - 6px)';
    el.style.height='calc('+hLen+' * (100% - 8px) / 6 - 6px)';
    el.style.left='calc(4px + '+b.col+' * (100% - 8px) / 6 + 3px)';
    el.style.top='calc(4px + '+b.row+' * (100% - 8px) / 6 + 3px)';
    var col=blockColor(idx,b.special);
    el.style.background='linear-gradient(180deg,'+col+' 0%,rgba(0,0,0,0.28) 100%)';
    if(b.special){
      var leaf=document.createElement('div');leaf.className='RRleaf';leaf.textContent='🌱';
      el.appendChild(leaf);
    }
    board.appendChild(el);
  });
  bindBlockDrag();
}

// ── Drag/swipe interaction ────────────────────────────────────────────────
var drag=null;

function bindBlockDrag(){
  var nodes=board.querySelectorAll('.RRblock');
  for(var i=0;i<nodes.length;i++){
    (function(el){
      el.onmousedown=function(e){startDrag(e.clientX,e.clientY,el);e.preventDefault();};
      el.ontouchstart=function(e){var t=e.touches&&e.touches[0];if(!t)return;startDrag(t.clientX,t.clientY,el);e.preventDefault();};
    })(nodes[i]);
  }
}

function startDrag(cx,cy,el){
  if(won)return;
  var id=el.getAttribute('data-id');
  var b=blocks.filter(function(x){return x.id===id;})[0];
  if(!b)return;
  var rect=board.getBoundingClientRect();
  var cellSize=(rect.width-8)/SZ;
  drag={id:id,el:el,block:b,startX:cx,startY:cy,cellSize:cellSize,origRow:b.row,origCol:b.col,range:legalRange(id)};
  el.classList.add('drag');
  document.addEventListener('mousemove',onDragMove);
  document.addEventListener('mouseup',onDragEnd);
  document.addEventListener('touchmove',onDragMove,{passive:false});
  document.addEventListener('touchend',onDragEnd);
}

function onDragMove(e){
  if(!drag)return;
  var cx,cy;
  if(e.touches&&e.touches[0]){cx=e.touches[0].clientX;cy=e.touches[0].clientY;e.preventDefault();}
  else{cx=e.clientX;cy=e.clientY;}
  var cs=drag.cellSize;
  var dx=cx-drag.startX,dy=cy-drag.startY;
  // transform now acts as a pure pixel delta on top of CSS left/top positioning.
  if(drag.block.orient==='h'){
    var deltaCells=Math.max(drag.range.min,Math.min(drag.range.max,dx/cs));
    drag.el.style.transform='translateX('+(deltaCells*cs)+'px)';
  } else {
    var deltaCellsV=Math.max(drag.range.min,Math.min(drag.range.max,dy/cs));
    drag.el.style.transform='translateY('+(deltaCellsV*cs)+'px)';
  }
}

function onDragEnd(e){
  if(!drag)return;
  document.removeEventListener('mousemove',onDragMove);
  document.removeEventListener('mouseup',onDragEnd);
  document.removeEventListener('touchmove',onDragMove);
  document.removeEventListener('touchend',onDragEnd);
  var cx=drag.startX,cy=drag.startY;
  if(e.changedTouches&&e.changedTouches[0]){cx=e.changedTouches[0].clientX;cy=e.changedTouches[0].clientY;}
  else if(typeof e.clientX==='number'){cx=e.clientX;cy=e.clientY;}
  var dx=cx-drag.startX,dy=cy-drag.startY;
  var deltaCells;
  if(drag.block.orient==='h'){deltaCells=dx/drag.cellSize;}
  else{deltaCells=dy/drag.cellSize;}
  deltaCells=Math.max(drag.range.min,Math.min(drag.range.max,deltaCells));
  var snappedDelta=Math.round(deltaCells);
  drag.el.classList.remove('drag');
  var id=drag.id;
  var dragEl=drag.el;
  drag=null;
  if(snappedDelta!==0){
    // Clear the drag transform so renderBlocks' fresh node starts from 0
    dragEl.style.transform='';
    moveBlock(id,snappedDelta);
  } else {
    // Snap back smoothly — transition is already on transform
    dragEl.style.transform='';
  }
}

// ── Victory / animation ───────────────────────────────────────────────────
function animateExit(){
  // Slide special block off the right edge. translateX(100%) moves by the block's
  // own width — with our length-2 X that's exactly one cell-width of overshoot,
  // plus a little extra to clear the board border.
  var el=board.querySelector('.RRblock.special');
  if(el){
    el.style.transition='transform .7s cubic-bezier(.3,0,.2,1),opacity .7s ease';
    el.style.transform='translateX(calc(100% + 20px))';
    el.style.opacity='0';
  }
  setTimeout(victoryOverlay,700);
}

function victoryOverlay(){
  var secs=Math.max(1,Math.round((solvedTs-startTs)/1000));
  var timeStr=fmtTime(secs);
  var L=LEVELS[levelIdx];
  var stars=moves===L.optimal?3:(moves<=Math.round(L.optimal*1.5)?2:1);
  var starRow='<div style="display:flex;gap:10px;margin:12px 0;">';
  for(var si=0;si<3;si++){
    var lit=si<stars;
    starRow+='<div style="font-size:2.4rem;line-height:1;filter:drop-shadow(0 0 '+(lit?'16px rgba(255,220,112,0.8)':'4px rgba(0,0,0,0.5)')+');color:'+(lit?'#ffdc70':'rgba(110,100,80,0.5)')+';animation:rrPop 0.6s cubic-bezier(.18,1.4,.3,1) '+(si*140)+'ms both;">★</div>';
  }
  starRow+='</div>';
  var next=levelIdx<LEVELS.length-1?'<button onclick="this.parentElement.parentElement.remove();_RRnext()" style="min-height:46px;padding:10px 22px;font-family:Georgia,serif;font-weight:700;font-size:0.85rem;background:linear-gradient(180deg,rgba(122,179,86,0.35),rgba(74,124,53,0.45));border:2px solid #7ab356;color:#f5ebd0;border-radius:8px;letter-spacing:0.05em;cursor:pointer;margin-right:8px;">Next Level →</button>':'<div style="font-family:Georgia,serif;font-style:italic;color:#c8a84b;font-size:0.9rem;margin-right:8px;">Last level complete</div>';
  var ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:9999;background:radial-gradient(ellipse at 50% 40%,rgba(200,168,75,0.32) 0%,rgba(13,16,12,0.94) 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;animation:rrPanIn .3s ease;font-family:Georgia,serif;';
  ov.innerHTML=
    '<div style="font-size:4.2rem;line-height:1;margin-bottom:6px;filter:drop-shadow(0 0 20px rgba(122,179,86,0.85));animation:rrPop .7s cubic-bezier(.18,1.4,.3,1);">🌱</div>'+
    starRow+
    '<div style="font-size:2rem;font-weight:700;color:#7ab356;letter-spacing:0.08em;text-shadow:0 0 18px rgba(122,179,86,0.7);animation:rrPop .7s cubic-bezier(.18,1.4,.3,1);">SPROUT FREE</div>'+
    '<div style="font-family:Georgia,serif;font-style:italic;font-size:0.82rem;color:#e8dcc8;margin-top:8px;animation:rrLineIn .5s ease-out .3s both;">'+L.name+'</div>'+
    '<div style="display:flex;gap:14px;margin-top:14px;font-family:DM Mono,monospace;font-size:0.7rem;color:#e8dcc8;animation:rrLineIn .5s ease-out .5s both;">'+
      '<div><span style="color:rgba(232,220,200,0.55);">Moves</span> <strong style="color:#c8a84b;">'+moves+'</strong><span style="color:rgba(232,220,200,0.4);">/'+L.optimal+'</span></div>'+
      '<div><span style="color:rgba(232,220,200,0.55);">Time</span> <strong style="color:#7ab356;">'+timeStr+'</strong></div>'+
    '</div>'+
    '<div style="display:flex;gap:8px;margin-top:22px;animation:rrLineIn .5s ease-out .7s both;">'+
      next+
      '<button onclick="this.parentElement.parentElement.remove();_RRreset()" style="min-height:46px;padding:10px 20px;font-family:Georgia,serif;font-weight:600;font-size:0.75rem;background:rgba(26,31,23,0.7);border:1.5px solid rgba(122,179,86,0.4);color:#e8dcc8;border-radius:8px;cursor:pointer;">↻ Replay</button>'+
    '</div>';
  ov.onclick=function(ev){if(ev.target===ov)ov.remove();};
  document.body.appendChild(ov);
}

// ── Lifecycle ─────────────────────────────────────────────────────────────
function loadLevel(idx,keepTimer){
  levelIdx=idx;
  blocks=parseLevel(LEVELS[idx].grid);
  moves=0;history=[];won=false;
  startTs=Date.now();solvedTs=0;
  if(!keepTimer){
    if(timerId)clearInterval(timerId);
    timerId=setInterval(tickTimer,500);
  }
  _setDiff(LEVELS[idx].diff||'medium');
  renderBoard();
}

function renderBoard(){
  if(!pan)return;
  pan.innerHTML='';
  board=document.createElement('div');board.className='RRboard';board.id='RRboard';
  // Grid overlay
  var grid=document.createElement('div');grid.className='RRgrid';board.appendChild(grid);
  // Exit glow on right edge at EXIT_ROW
  var exit=document.createElement('div');exit.className='RRexit';
  exit.style.top=((EXIT_ROW/SZ)*100)+'%';
  exit.style.height=((1/SZ)*100)+'%';
  board.appendChild(exit);
  pan.appendChild(board);
  // Controls
  var ctrl=document.createElement('div');ctrl.className='RRctrl';
  ctrl.innerHTML=
    '<div class="RRinfo">'+
      '<span>Moves: <strong id="RRm">0</strong></span>'+
      '<span>⏱ <strong id="RRt">0:00</strong></span>'+
    '</div>'+
    '<div class="RRbtn-row">'+
      '<button class="RRb" id="RRu" onclick="_RRundo()" disabled>↶ Undo</button>'+
      '<button class="RRb" id="RRh" onclick="_RRhint()">💡 Hint</button>'+
      '<button class="RRb" id="RRr" onmousedown="_RRresetStart()" onmouseup="_RRresetEnd()" onmouseleave="_RRresetEnd()" ontouchstart="_RRresetStart();event.preventDefault()" ontouchend="_RRresetEnd()" ontouchcancel="_RRresetEnd()">↻ Reset</button>'+
    '</div>';
  pan.appendChild(ctrl);
  var lvlRow=document.createElement('div');
  lvlRow.style.cssText='display:flex;justify-content:space-between;align-items:center;padding:6px 4px 0;gap:8px;flex-wrap:wrap;';
  lvlRow.innerHTML=
    '<div class="RRlvl" id="RRlvl"></div>'+
    '<div class="RRbtn-row">'+
      '<button class="RRb" id="RRprev" onclick="_RRprev()">‹ Prev</button>'+
      '<button class="RRb gold" id="RRnext" onclick="_RRnext()">Next ›</button>'+
    '</div>';
  pan.appendChild(lvlRow);
  setTimeout(function(){renderBlocks();updateStatus();},16);
}

function GRR(a){
  ms(a,'Root Rush');mm(a);
  pan=document.createElement('div');pan.id='RRpan';a.appendChild(pan);
  mc(a);
  var start=Math.min(loadProgress(),LEVELS.length-1);
  loadLevel(start,false);
}

window._RRundo=function(){undoMove();};
window._RRhint=function(){
  if(won)return;
  var btn=document.getElementById('RRh');
  if(btn)btn.textContent='…';
  setTimeout(function(){
    var hint=computeHint();
    if(btn)btn.textContent='💡 Hint';
    if(!hint){sm('No hint available');return;}
    var b=blocks.filter(function(x){return x.id===hint.blockId;})[0];
    if(!b)return;
    // Pulse the hinted block briefly so the player sees which to move
    var target=document.querySelector('.RRblock[data-id="'+hint.blockId+'"]');
    if(target){
      target.style.transition='box-shadow .2s ease,transform .2s ease';
      target.style.boxShadow='0 0 18px rgba(255,220,112,0.85),inset 0 1px 0 rgba(255,255,255,0.3)';
      target.style.transform+=' scale(1.05)';
      setTimeout(function(){target.style.boxShadow='';target.style.transform=target.style.transform.replace(' scale(1.05)','');},900);
    }
    var dir;
    if(b.orient==='h')dir=hint.delta>0?'right':'left';
    else dir=hint.delta>0?'down':'up';
    sm('Move '+b.id+' '+dir+(Math.abs(hint.delta)>1?' '+Math.abs(hint.delta):''));
    _play('tap');
  },40);
};

// Hold-to-reset — prevents accidental taps during fast play
var _rrResetT=null;
window._RRresetStart=function(){
  if(won)return;
  var btn=document.getElementById('RRr');
  if(btn){btn.textContent='HOLD…';btn.classList.add('gold');}
  _rrResetT=setTimeout(function(){
    _rrResetT=null;
    resetLevel();
    var b=document.getElementById('RRr');
    if(b){b.textContent='↻ Reset';b.classList.remove('gold');}
  },700);
};
window._RRresetEnd=function(){
  if(_rrResetT){clearTimeout(_rrResetT);_rrResetT=null;}
  var btn=document.getElementById('RRr');
  if(btn){btn.textContent='↻ Reset';btn.classList.remove('gold');}
};
window._RRreset=function(){resetLevel();};
window._RRprev=function(){if(levelIdx>0){if(timerId)clearInterval(timerId);loadLevel(levelIdx-1,false);}};
window._RRnext=function(){if(levelIdx<LEVELS.length-1){if(timerId)clearInterval(timerId);loadLevel(levelIdx+1,false);}};

window._gameFns.rootrush=GRR;
})();
