// ═══ LUCID WINDS — Shared Card Utilities ═══
// Loaded once when any card game (golf, klondike, spider, freecell, pyramid, tripeaks) is picked
(function(){
'use strict';
var G=window._G;

// ── Shared end-of-game overlay + lifetime stats (2026-07-03 campaign) ────
// The quick solitaires (golf/tripeaks/pyramid) ended with one status-bar
// line and kept no stats. One consistent celebration + lw_<key>_w/_p/_streak.
window._lwCardEnd=function(o){
  var w=0,pl=0,st=0;
  try{w=parseInt(localStorage.getItem('lw_'+o.key+'_w'),10)||0;
      pl=parseInt(localStorage.getItem('lw_'+o.key+'_p'),10)||0;
      st=parseInt(localStorage.getItem('lw_'+o.key+'_streak'),10)||0;}catch(e){}
  pl++; if(o.won){w++;st++;}else{st=0;}
  try{localStorage.setItem('lw_'+o.key+'_w',String(w));
      localStorage.setItem('lw_'+o.key+'_p',String(pl));
      localStorage.setItem('lw_'+o.key+'_streak',String(st));}catch(e){}
  setTimeout(function(){
    var old=document.getElementById('LWCE');if(old)old.remove();
    var ovl=document.createElement('div');ovl.id='LWCE';
    ovl.style.cssText='position:fixed;inset:0;z-index:9999;background:radial-gradient(ellipse at 50% 40%,'+(o.won?'rgba(122,179,86,0.3)':'rgba(199,138,80,0.16)')+' 0%,rgba(13,16,12,0.92) 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;font-family:Georgia,serif;';
    ovl.innerHTML='<div style="font-size:3rem;line-height:1;">'+(o.won?'\ud83c\udfc6':'\ud83c\udf42')+'</div>'
      +'<div style="font-size:1.7rem;font-weight:700;color:'+(o.won?'#7ab356':'#c78a50')+';letter-spacing:0.08em;margin-top:12px;text-align:center;">'+o.title+'</div>'
      +'<div style="font-size:0.95rem;color:#e8dcc8;margin-top:10px;text-align:center;">'+(o.line||'')+'</div>'
      +'<div style="font-style:italic;font-size:0.8rem;color:#8a9178;margin-top:8px;">'+(st>1?'\ud83d\udd25 '+st+' win streak \u00b7 ':'')+w+' wins / '+pl+' games</div>'
      +'<button id="LWCE-again" style="margin-top:22px;min-height:48px;padding:12px 28px;font-family:Georgia,serif;font-weight:700;font-size:0.9rem;background:linear-gradient(180deg,rgba(122,179,86,0.35),rgba(74,124,53,0.45));border:2px solid #7ab356;color:#f5ebd0;border-radius:10px;cursor:pointer;">\u21bb NEW DEAL</button>'
      +'<button id="LWCE-view" style="margin-top:10px;min-height:48px;padding:8px 20px;background:transparent;border:1px solid rgba(138,145,120,0.4);color:#8a9178;border-radius:10px;font-size:0.75rem;cursor:pointer;">view the table</button>';
    ovl.querySelector('#LWCE-again').onclick=function(){ovl.remove();if(o.retry)o.retry();};
    ovl.querySelector('#LWCE-view').onclick=function(){ovl.remove();};
    ovl.onclick=function(ev){if(ev.target===ovl)ovl.remove();};
    document.body.appendChild(ovl);
  }, 380);
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){var x=document.getElementById('LWCE');if(x)x.remove();});
};


// Lucid Winds custom: mushroom/flower/bee/bird (Stephen's botanical reskin)
var _SUIT_SYM=['🍄','🌸','🐝','🐦'];
var _SUIT_CLR=['#6dbf4a','#daa520','#e8c94a','#48c9a4'];
var _SUIT_GRP=['green','gold','gold','green'];
// Classic standard playing-card suits (spades, hearts, diamonds, clubs).
// Same indices so all game logic for "is red" still works (1,2 = red).
// Stephen's call: many older players will only play with the universal
// pip set, plus we ship as a familiar option.
var _CL_SYM=['♠','♥','♦','♣'];
var _CL_CLR=['#1a1a1a','#c83434','#c83434','#1a1a1a'];

var _RANK_SYM=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
var _SUIT_NAME=['shroom','flower','bee','bird'];
var _CD_BASE='assets/games/cards/';
var _CD_BACK=_CD_BASE+'playing-card-backs.png';
// the same art with the baked-in photographic surround measured off, so it can
// sit edge to edge in a card div (see the kit at the bottom of this file)
var _CD_BACK_ART='assets/games/cards/card-back.png';

// ─── Floral deck (line-art: 4 suit pips + J/Q/K/A in red & black) ─
var _FL_BASE='assets/decks/floral/';
// Suit pip filenames by idx (0=spades, 1=hearts, 2=diamonds, 3=clubs)
var _FL_SUIT=['suit-spade.png','suit-heart.png','suit-diamond.png','suit-club.png'];

// Style: 'lw' (botanical) | 'classic' (standard pips) | 'floral' (line art)
// Default is FLORAL — the semi-traditional floral deck is our
// lead art. LW and Classic are unlockable alternate styles.
var _STYLE_CYCLE=['floral','classic','lw'];
var _DEFAULT_STYLE='floral';
function _cdStyle(){
  try{
    var s=localStorage.getItem('lw_card_style');
    if(s==='classic'||s==='floral'||s==='lw')return s;
    return _DEFAULT_STYLE;
  }catch(e){return _DEFAULT_STYLE;}
}
function _cdSetStyle(s){
  if(s!=='classic'&&s!=='floral'&&s!=='lw')s=_DEFAULT_STYLE;
  try{localStorage.setItem('lw_card_style',s);}catch(e){}
  if(s==='floral')_preloadFloral();
}
// Deck metadata used by the style picker.
var _DECKS=[
  {id:'floral', name:'Floral',  tag:'Semi-traditional · line art', unlocked:true},
  {id:'classic',name:'Classic', tag:'Standard pips · familiar',       unlocked:true},
  {id:'lw',     name:'Garden',  tag:'Botanical reskin', unlocked:true}
];

// Preload card images (only relevant for LW style — classic is pure CSS)
var files=['playing-card-backs'];
for(var s=0;s<4;s++){
  var n=_SUIT_NAME[s];
  files.push(n,n+'-ace',n+'-jack',n+'-queen',n+'-king');
}
for(var i=0;i<files.length;i++){
  var img=new Image();
  img.src=_CD_BASE+files[i]+'.png';
}
// Floral set filenames (4 suit pips + 8 face cards = 12 PNGs; full-res so
// they stay crisp when used as thumbnails elsewhere). 26MB total, so only
// preload when the user has actually selected Floral to avoid hammering
// mobile data for people on other styles.
var _FL_FILES=['suit-spade','suit-heart','suit-diamond','suit-club',
  'ace-red','jack-red','queen-red','king-red',
  'ace-black','jack-black','queen-black','king-black'];
var _flPreloaded=false;
function _preloadFloral(){
  if(_flPreloaded)return;_flPreloaded=true;
  for(var fi=0;fi<_FL_FILES.length;fi++){
    var fimg=new Image();
    fimg.src=_FL_BASE+_FL_FILES[fi]+'.png';
  }
}
// Fire at module load if the user is already on floral, otherwise defer
// until they toggle to it.
try{if(localStorage.getItem('lw_card_style')==='floral')_preloadFloral();}catch(e){}

function _cdArt(s,r){
  var sn=_SUIT_NAME[s];
  if(r===0)return _CD_BASE+sn+'-ace.png';
  if(r===10)return _CD_BASE+sn+'-jack.png';
  if(r===11)return _CD_BASE+sn+'-queen.png';
  if(r===12)return _CD_BASE+sn+'-king.png';
  return _CD_BASE+sn+'-num.png';
}

function _cdMk(){var d=[];for(var s=0;s<4;s++)for(var r=0;r<13;r++)d.push({s:s,r:r,up:false});return d}
function _cdSh(d){return G.sh(d)}
function _cdRnk(r){return _RANK_SYM[r]}
// Inline img tag sized to the surrounding font-size — works anywhere
// a caller concatenates _cdSuit(s) into innerHTML. object-fit:contain
// keeps the pip's aspect ratio inside the 1em square.
function _cdFloralPipImg(s,extra){
  return '<img src="'+_FL_BASE+_FL_SUIT[s]+'" alt="" '
    +'style="display:inline-block;height:1em;width:1em;vertical-align:-0.15em;object-fit:contain;'
    +(extra||'')+'">';
}
function _cdSuit(s){
  // Style-aware: returns the appropriate symbol set
  var style=_cdStyle();
  if(style==='classic')return _CL_SYM[s];
  if(style==='floral')return _cdFloralPipImg(s,'');
  return _SUIT_SYM[s];
}
// Trick games (Hearts/Bower/Cribbage/Spades/Juniper) use string suit names.
// Map name → numeric idx → style-aware symbol.
//   spades=0  hearts=1  diamonds=2  clubs=3   (_cdIsRed checks 1,2 = red)
var _SUIT_NAME_TO_IDX={spades:0,hearts:1,diamonds:2,clubs:3};
function _cdPipFor(suitName){
  var idx=_SUIT_NAME_TO_IDX[suitName];
  if(idx===undefined)return '?';
  return _cdSuit(idx);
}
function _cdIsRed(s){return s===1||s===2}

// Auto-fit card sizing for solitaire tableaus.
//
// Google-solitaire behavior: the card is as big as it can be while the
// whole row still fits on-screen. Each game calls this with its widest
// row's column count and gets a concrete {w,h,peek,font} it can apply
// directly to card elements.
//
//   cols      — widest row the game renders (Klondike=7, Spider=10, ...)
//   opts.maxW — hard cap so tablets don't get comical cards (default 96)
//   opts.minW — minimum readable width (default 38)
//   opts.gap  — between-column gap in px (default 4)
//   opts.pad  — total left+right padding of the container (default 16)
//   opts.container — if passed, reads its clientWidth; else window.innerWidth
//
// Returns every dimension as a string with 'px' so the caller can
// assign directly: el.style.width = fit.w.
function _cdFit(cols, opts){
  opts = opts || {};
  var maxW = opts.maxW || 96;
  var minW = opts.minW || 38;
  var gapPx = (opts.gap===0||opts.gap)?opts.gap:4;
  var padPx = (opts.pad===0||opts.pad)?opts.pad:16;
  var vw = (opts.container&&opts.container.clientWidth)||window.innerWidth||360;
  // For sol-fs mode the container goes to 100vw but the browser's
  // reported innerWidth is already correct, so no adjustment needed.
  var avail = vw - padPx - (cols - 1) * gapPx;
  var wFromWidth = Math.floor(avail / cols);
  var w = Math.min(maxW, wFromWidth);
  // opts.maxH (the lamp table's locked screen): the tallest a card may be so
  // the game's worst-case layout still fits the height it has. Unset = as before.
  if(opts.maxH>0) w = Math.min(w, Math.floor(opts.maxH/1.4));
  // minW protects readability, but honoring it must not overflow the
  // viewport: 10-col boards (Spider/TriPeaks) on 360-400px phones were
  // clipped ~7-22px per side with unreachable outer columns (#fg-ag is
  // overflow-x:hidden). Fit-on-screen wins, with a 30px hard floor.
  if(w<minW)w=Math.max(30,w);
  var h = Math.round(w * 1.4);           // standard 2.5:3.5 poker aspect
  var peek = Math.max(10, Math.round(h * 0.16));
  var font = Math.max(10, Math.round(w * 0.22));
  return {
    w: w+'px', h: h+'px',
    peek: peek+'px', font: font+'px',
    gap: gapPx+'px',
    raw: {w:w, h:h, peek:peek, font:font, gap:gapPx}
  };
}

// ⛔ LOCKED SCREEN for the solitaire tables (22 Nov 2026, Stephen about every
// card game: "Everything should just be locked on screen. It shouldn't be
// changing sizes. I shouldn't have to move anything."). play/shell.js locks
// the page (html.shell-locked-fill) and gives #fg-ag the exact space under the
// header. Two helpers keep a growing tableau inside it without a scrolling page:
//
//   _cdLockH(tabRow, curH, rowsAbove, dn, up)
//     the tallest card for THIS screen so a worst case column of dn face-down
//     and up face-up cards, under rowsAbove rows of full cards, fits the box at
//     the tightest overlap. Games ask once per screen size and keep the answer,
//     so a card never changes size during a game. 0 when the page is not locked.
//   _cdLockSqueeze(cols, floorUp)
//     after a render: if the table spills the box, every column whose last
//     card ends below the line tightens its overlap, face-down cards first,
//     then face-up cards down to floorUp of a card's height (the rank corner
//     stays readable), then past it rather than ever clip. The last card in
//     each column is always whole.
var _CD_LK_DN=0.07, _CD_LK_UP=0.2;
function _cdLocked(){return document.documentElement.classList.contains('shell-locked-fill');}
// the lowest a tableau card may reach: the box's bottom less what is laid out
// under the tableau in its own column (the controls, a stock row), i.e. the
// heights of the tableau's later siblings, level by level up to the box. A side
// column of controls in landscape does not count, and the empty space of a
// board that fills its slot is not "under" it.
function _cdLockLimit(tabRow){
  var ag=document.getElementById('fg-ag'); if(!ag||!tabRow)return 0;
  var agR=ag.getBoundingClientRect(), tr=tabRow.getBoundingClientRect();
  var reserved=parseFloat(getComputedStyle(ag).paddingBottom)||0, el=tabRow;
  while(el&&el!==ag){
    for(var sb=el.nextElementSibling;sb;sb=sb.nextElementSibling){
      var r=sb.getBoundingClientRect();
      if(!r.height||r.right<=tr.left+1||r.left>=tr.right-1)continue;
      var sc=getComputedStyle(sb);
      if(sc.position==='absolute'||sc.position==='fixed')continue;
      reserved+=r.height+(parseFloat(sc.marginTop)||0)+(parseFloat(sc.marginBottom)||0);
    }
    el=el.parentElement;
  }
  return agR.bottom-reserved;
}
function _cdLockH(tabRow, curH, rowsAbove, dn, up, upFrac){
  if(!_cdLocked()||!tabRow||!curH)return 0;
  var limit=_cdLockLimit(tabRow); if(!limit)return 0;
  var tr=tabRow.getBoundingClientRect();
  var col=1+dn*_CD_LK_DN+Math.max(0,up-1)*(upFrac||_CD_LK_UP);
  var h=Math.floor((limit-tr.top+rowsAbove*curH-4)/(rowsAbove+col));
  return h>0?h:0;
}
function _cdLockSqueeze(cols, floorUp){
  if(!_cdLocked()||!cols||!cols.length)return;
  var line=_cdLockLimit(cols[0].parentElement)-2; if(!line)return;
  var c,cards,i,all=[];
  for(c=0;c<cols.length;c++){
    cards=[].filter.call(cols[c].children,function(el){return el.classList&&el.classList.contains('gc');});
    all.push(cards);
  }
  for(c=0;c<all.length;c++){
    cards=all[c]; if(cards.length<2)continue;
    var over=cards[cards.length-1].getBoundingClientRect().bottom-line;
    if(over<=0.5)continue;
    var h=cards[0].offsetHeight, rev=[], dnF=[];
    for(i=1;i<cards.length;i++){
      rev[i]=cards[i].getBoundingClientRect().top-cards[i-1].getBoundingClientRect().top;
      dnF[i]=cards[i-1].classList.contains('gc-dn');
    }
    // three passes: the backs to their floor, the faces to floorUp (the rank
    // corner stays readable), then everything past it rather than ever clip
    var floors=[function(i){return dnF[i]?_CD_LK_DN*h:rev[i];},
                function(i){return dnF[i]?_CD_LK_DN*h:(floorUp||_CD_LK_UP)*h;},
                function(i){return 3;}];
    for(var p=0;p<3&&over>0.5;p++){
      var slack=0,m=[];
      for(i=1;i<cards.length;i++){m[i]=Math.min(rev[i],floors[p](i));slack+=rev[i]-m[i];}
      if(slack<=0)continue;
      var take=Math.min(over,slack);
      for(i=1;i<cards.length;i++)rev[i]-=(rev[i]-m[i])*take/slack;
      over-=take;
    }
    for(i=1;i<cards.length;i++)cards[i].style.marginTop=(Math.floor(rev[i])-h)+'px';
  }
}
window._cdLockH=_cdLockH; window._cdLockSqueeze=_cdLockSqueeze; window._cdLocked=_cdLocked;

// Foundation empty-slot art. Style-aware:
//   lw     → shroom/flower/bee/bird PNG (original behavior)
//   floral → the matching suit-pip PNG from Jessie's set
//   classic→ a large faded pip character, since the classic style has no image art
// Consumers: klondike.js foundations, freecell.js foundations.
function _cdFndEmpty(el, suitIdx){
  if(!el)return;
  el.innerHTML='';
  el.style.backgroundImage='';
  if(_lpState){ _cdFndEmptyLamp(el,suitIdx); return; }
  var style=_cdStyle();
  if(style==='classic'){
    var color=_cdIsRed(suitIdx)?'rgba(200,52,52,0.30)':'rgba(232,220,200,0.22)';
    el.innerHTML='<span style="font-size:2.6em;line-height:1;color:'+color+';pointer-events:none;">'+_CL_SYM[suitIdx]+'</span>';
  }else if(style==='floral'){
    el.style.backgroundImage="url('"+_FL_BASE+_FL_SUIT[suitIdx]+"')";
  }else{
    el.style.backgroundImage="url('"+_CD_BASE+_SUIT_NAME[suitIdx]+".png')";
  }
}

// ⛔ ONE BACK, ONE SOURCE. Three places used to decide what a face-down card
// looks like and they disagreed: the lw style pointed at the ORIGINAL
// playing-card-backs.png (which has the house frame baked in, so it drew the
// card photographed on a dark surface), floral synthesised a cross-hatch from
// gradients with a comment saying it was a stand-in "until there is dedicated
// card-back art", and the kit's deck stacks drew the real art. Spider ended up
// showing a knotwork stock above a cross-hatch tableau in the same frame.
// There IS dedicated card-back art now, so floral and lw both use it. Classic
// keeps its navy weave on purpose: that style exists to look like a standard
// shop-bought deck, and a standard deck's back is not botanical.
function _cdBackBg(){
  if(_lpState)return 'background-color:#1f2328;background-image:var(--cd-lp-back);background-size:100% 100%;';
  if(_cdStyle()==='classic'){
    return 'background-color:#1a3a6a;background-image:repeating-linear-gradient(45deg,#1a3a6a 0,#1a3a6a 8px,#244a7a 8px,#244a7a 16px),linear-gradient(135deg,#1a3a6a,#244a7a);';
  }
  return "background-image:url('"+_CD_BACK_ART+"');background-size:100% 100%;";
}
function _cdBackStyle(el){
  if(_lpState){ el.classList.add('cd-lp-dn'); el.style.backgroundColor=''; el.style.backgroundImage=''; el.style.backgroundSize=''; return; }
  var style=_cdStyle();
  if(style==='classic'){
    // Classic card back: navy diagonal weave pattern via CSS gradients
    el.style.backgroundImage='repeating-linear-gradient(45deg,#1a3a6a 0,#1a3a6a 8px,#244a7a 8px,#244a7a 16px),linear-gradient(135deg,#1a3a6a,#244a7a)';
    el.style.backgroundColor='#1a3a6a';
    el.style.backgroundSize='auto, auto';
  }else{
    // floral and lw: the real deck art, edge to edge
    el.style.backgroundColor='';
    el.style.backgroundImage="url('"+_CD_BACK_ART+"')";
    el.style.backgroundSize='100% 100%';
  }
}

function _cdElLW(d,card){
  if(card.up){
    d.className+=' gc-up';
    if(_cdIsRed(card.s))d.className+=' gc-red';
    var clr=_SUIT_CLR[card.s];
    var rnk=_cdRnk(card.r);
    var pip=_CD_BASE+_SUIT_NAME[card.s]+'.png';
    var art=_cdArt(card.s,card.r);
    d.style.backgroundImage="url('"+art+"')";
    // Rank + pip live inside .gc-corner-tl — the fan/peek CSS hides every
    // child EXCEPT that container, so without it buried cards rendered as
    // blank strips with this deck selected.
    d.innerHTML='<div class="gc-corner gc-corner-tl" style="position:absolute;top:3px;left:4px;line-height:1;z-index:2;pointer-events:none;display:flex;align-items:center;gap:3px">'
      +'<div style="color:'+clr+';font-size:clamp(.7rem,2.2vw,1rem);font-weight:700;text-shadow:0 1px 3px #000,0 0 8px #000">'+rnk+'</div>'
      +'<img src="'+pip+'" style="width:clamp(10px,3vw,16px);height:clamp(10px,3vw,16px);filter:drop-shadow(0 1px 3px #000)" alt="">'
      +'</div>';
  }else{
    d.className+=' gc-dn';
    _cdBackStyle(d);
  }
}

function _cdElClassic(d,card){
  if(card.up){
    d.className+=' gc-up gc-classic';
    if(_cdIsRed(card.s))d.className+=' gc-red';
    var clr=_CL_CLR[card.s];
    var sym=_CL_SYM[card.s];
    var rnk=_cdRnk(card.r);
    // Classic cream-white card with rank+suit corners and a big center suit
    d.style.backgroundImage='';
    // Pure white so inline suit PNGs (whose source also has a white bg)
    // merge cleanly with the card face — no cream halo.
    d.style.background='#ffffff';
    d.style.color=clr;
    d.style.border='1px solid rgba(0,0,0,0.18)';
    d.innerHTML=
      '<div class="gc-corner gc-corner-tl" style="position:absolute;top:3px;left:5px;line-height:1;text-align:center;color:'+clr+';font-family:Georgia,serif;pointer-events:none;">'
        +'<div style="font-size:clamp(.85rem,2.6vw,1.15rem);font-weight:700;">'+rnk+'</div>'
        +'<div style="font-size:clamp(.7rem,2vw,.95rem);line-height:1;margin-top:-1px;">'+sym+'</div>'
      +'</div>'
      +'<div class="gc-corner gc-corner-br" style="position:absolute;bottom:3px;right:5px;line-height:1;text-align:center;color:'+clr+';font-family:Georgia,serif;transform:rotate(180deg);transform-origin:center;pointer-events:none;">'
        +'<div style="font-size:clamp(.85rem,2.6vw,1.15rem);font-weight:700;">'+rnk+'</div>'
        +'<div style="font-size:clamp(.7rem,2vw,.95rem);line-height:1;margin-top:-1px;">'+sym+'</div>'
      +'</div>'
      +'<div class="gc-center" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:'+clr+';font-size:clamp(1.4rem,5vw,2.2rem);opacity:0.85;pointer-events:none;">'+sym+'</div>';
  }else{
    d.className+=' gc-dn gc-classic';
    _cdBackStyle(d);
    d.style.color='';
    d.style.border='1px solid rgba(0,0,0,0.3)';
    d.innerHTML='';
  }
}

// ═══ FLORAL DECK RENDERER ═══
// Cream card background like classic. Corner = rank + small suit pip PNG.
// Center:
//   • A  → colored Ace letter art (ace-red.png / ace-black.png)
//   • J/Q/K → face art (jack-red.png / queen-black.png / king-red.png / …)
//   • 2–10 → big centered suit pip (same PNG, larger)
// Face art has only 2 color variants (red vs black), matching the source set.
function _cdElFloral(d,card){
  if(card.up){
    d.className+=' gc-up gc-floral';
    var isRed=_cdIsRed(card.s);
    if(isRed)d.className+=' gc-red';
    var rnk=_cdRnk(card.r);
    var suitPng=_FL_BASE+_FL_SUIT[card.s];
    var rankClr=isRed?'#b42a2a':'#1a1a1a';
    d.style.backgroundImage='';
    // Pure white so the floral suit PNG and face-card PNG (both with
    // white backgrounds in the source art) blend seamlessly with the
    // card face — no cream halo, no harsh rectangle edges.
    d.style.background='#ffffff';
    d.style.color=rankClr;
    d.style.border='1px solid rgba(0,0,0,0.2)';
    // Center art: Ace/J/Q/K get the floral face art, 2-10 get a big pip.
    var centerHtml;
    var color=isRed?'red':'black';
    if(card.r===0){
      // Ace — decorative "A" art, color-matched
      centerHtml='<img class="gc-center" src="'+_FL_BASE+'ace-'+color+'.png" alt="" '
        +'style="position:absolute;inset:8% 10%;width:80%;height:84%;'
        +'object-fit:contain;pointer-events:none;">';
    }else if(card.r>=10){
      // Jack/Queen/King face art
      var face=card.r===10?'jack':(card.r===11?'queen':'king');
      centerHtml='<img class="gc-center" src="'+_FL_BASE+face+'-'+color+'.png" alt="" '
        +'style="position:absolute;inset:8% 10%;width:80%;height:84%;'
        +'object-fit:contain;pointer-events:none;">';
    }else{
      // 2–10: big centered suit pip
      centerHtml='<img class="gc-center" src="'+suitPng+'" alt="" '
        +'style="position:absolute;inset:18% 22%;width:56%;height:64%;'
        +'object-fit:contain;pointer-events:none;opacity:0.92;">';
    }
    // Small corner rank + pip (top-left upright, bottom-right inverted)
    var corner=function(pos){
      var rot=pos==='br'?'transform:rotate(180deg);transform-origin:center;':'';
      var loc=pos==='br'?'bottom:3px;right:5px;':'top:3px;left:5px;';
      var cls=pos==='br'?'gc-corner gc-corner-br':'gc-corner gc-corner-tl';
      return '<div class="'+cls+'" style="position:absolute;'+loc+'line-height:1;text-align:center;'
        +'font-family:Georgia,serif;color:'+rankClr+';pointer-events:none;z-index:2;'+rot+'">'
        +'<div style="font-size:clamp(.85rem,2.6vw,1.15rem);font-weight:700;">'+rnk+'</div>'
        +'<img src="'+suitPng+'" alt="" style="display:block;height:clamp(10px,2.6vw,16px);'
        +'width:clamp(10px,2.6vw,16px);object-fit:contain;margin:1px auto 0;"></div>';
    };
    d.innerHTML=centerHtml+corner('tl')+corner('br');
  }else{
    d.className+=' gc-dn gc-floral';
    _cdBackStyle(d);
    d.style.color='';
    d.style.border='1px solid rgba(0,0,0,0.3)';
    d.innerHTML='';
  }
}

function _cdEl(card){
  var d=document.createElement('div');
  d.className='gc';
  var style=_cdStyle();
  if(_lpState)_cdElLamp(d,card);            // the lamp table, only where a game turned it on
  else if(style==='classic')_cdElClassic(d,card);
  else if(style==='floral')_cdElFloral(d,card);
  else _cdElLW(d,card);
  d.setAttribute('data-s',card.s);
  d.setAttribute('data-r',card.r);
  return d;
}

// Legacy cycle helper kept for back-compat with games still wired to
// the old toggle — now just opens the picker so the UX is consistent.
function _cdToggleStyle(){
  _cdOpenStylePicker();
  return _cdStyle();
}
// Label for UI buttons — what the user sees on the style button.
function _cdStyleLabel(s){
  s=s||_cdStyle();
  for(var i=0;i<_DECKS.length;i++)if(_DECKS[i].id===s)return _DECKS[i].name;
  return 'Floral';
}
// Render a tiny preview card (used in the style picker).
function _cdDeckPreviewHTML(styleId){
  // A 3-row mini showing K♥, Q♠, J♦ as a visual taste.
  var samples=[{s:1,r:12},{s:0,r:11},{s:2,r:10}];
  var prev='';
  var cellStyle='display:inline-block;width:44px;height:64px;border-radius:6px;border:1px solid rgba(0,0,0,0.2);background:#ffffff;position:relative;margin-right:2px;overflow:hidden;vertical-align:top;';
  for(var i=0;i<samples.length;i++){
    var s=samples[i].s,r=samples[i].r;
    var isRed=(s===1||s===2);
    var clr=isRed?'#b42a2a':'#1a1a1a';
    var sym=_CL_SYM[s];
    var rnk=_RANK_SYM[r];
    var body='';
    if(styleId==='lw'){
      var pip=_CD_BASE+_SUIT_NAME[s]+'.png';
      var art=(r===0)?_CD_BASE+_SUIT_NAME[s]+'-ace.png'
                 :(r===10)?_CD_BASE+_SUIT_NAME[s]+'-jack.png'
                 :(r===11)?_CD_BASE+_SUIT_NAME[s]+'-queen.png'
                 :_CD_BASE+_SUIT_NAME[s]+'-king.png';
      body='<div style="'+cellStyle+'background:#0d100c url(\''+art+'\') center/cover;">'
        +'<img src="'+pip+'" style="position:absolute;top:2px;right:3px;width:10px;height:10px;">'
        +'<div style="position:absolute;top:2px;left:3px;color:'+_SUIT_CLR[s]+';font-size:9px;font-weight:700;">'+rnk+'</div>'
        +'</div>';
    } else if(styleId==='classic'){
      body='<div style="'+cellStyle+'">'
        +'<div style="position:absolute;top:2px;left:4px;color:'+clr+';font-family:Georgia,serif;font-size:10px;font-weight:700;text-align:center;">'+rnk+'<div style="font-size:8px;line-height:1;">'+sym+'</div></div>'
        +'<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:'+clr+';font-size:20px;opacity:0.85;">'+sym+'</div>'
        +'</div>';
    } else { // floral
      var face=(r===10?'jack':r===11?'queen':'king')+'-'+(isRed?'red':'black');
      var suitPng=_FL_BASE+_FL_SUIT[s];
      body='<div style="'+cellStyle+'">'
        +'<img src="'+_FL_BASE+face+'.png" style="position:absolute;inset:6% 10%;width:80%;height:84%;object-fit:contain;">'
        +'<div style="position:absolute;top:2px;left:3px;color:'+clr+';font-family:Georgia,serif;font-size:9px;font-weight:700;text-align:center;">'+rnk
        +'<img src="'+suitPng+'" style="display:block;width:9px;height:9px;margin:1px auto 0;object-fit:contain;"></div>'
        +'</div>';
    }
    prev+=body;
  }
  return prev;
}
// Open the picker modal with all unlocked decks as tappable cards.
function _cdOpenStylePicker(){
  var ov=document.getElementById('cdStyleOV');
  if(ov){ov.remove();return;}
  ov=document.createElement('div');
  ov.id='cdStyleOV';
  ov.style.cssText='position:fixed;inset:0;z-index:99994;display:flex;align-items:center;justify-content:center;background:rgba(5,8,4,0.92);backdrop-filter:blur(10px);padding:14px;';
  ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});
  var cur=_cdStyle();
  // 22 Nov 2026 (locked screen): in a landscape phone the decks run two or three
  // across so the sheet fits the screen instead of scrolling past CLOSE.
  var land=window.innerWidth>window.innerHeight&&window.innerHeight<=520;
  var h='<div style="max-width:'+(land?'760px':'460px')+';width:100%;max-height:92vh;overflow-y:auto;-webkit-overflow-scrolling:touch;background:rgba(15,20,12,0.96);border:1px solid rgba(200,168,75,0.45);border-radius:14px;padding:'+(land?'10px 14px':'18px 16px')+';font-family:DM Mono,monospace;">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">';
  h+='<div style="font-family:Bebas Neue,sans-serif;font-size:1.1rem;letter-spacing:0.14em;color:var(--gold);">CARD STYLE</div>';
  h+='<button class="gb" onclick="document.getElementById(\'cdStyleOV\').remove()" style="min-height:48px;padding:6px 14px;">CLOSE</button>';
  h+='</div>';
  h+='<div style="font-family:DM Mono,monospace;font-size:0.65rem;color:var(--muted);margin-bottom:'+(land?'8px':'12px')+';line-height:1.5;">Tap a deck to switch every card game to that style. More decks unlock as you play.</div>';
  h+='<div style="display:grid;grid-template-columns:'+(land?'repeat(auto-fill,minmax(220px,1fr))':'1fr')+';gap:0 8px;">';
  for(var i=0;i<_DECKS.length;i++){
    var d=_DECKS[i];
    var sel=(d.id===cur);
    var locked=!d.unlocked;
    h+='<button class="gb" onclick="_cdPickStyle(\''+d.id+'\')" '+(locked?'disabled':'')+' '
      +'style="display:flex;align-items:center;gap:12px;width:100%;padding:10px 12px;margin-bottom:8px;min-height:80px;text-align:left;font-family:inherit;'
      +(sel?'background:rgba(200,168,75,0.22);border-color:var(--gold);':locked?'opacity:0.45;':'')+'">';
    h+='<div style="flex-shrink:0;">'+_cdDeckPreviewHTML(d.id)+'</div>';
    h+='<div style="flex:1;min-width:0;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.95rem;letter-spacing:0.06em;color:var(--cream);">'+d.name+(sel?' <span style="color:var(--gold);font-size:0.65rem;letter-spacing:0.12em;">· ACTIVE</span>':'')+'</div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.7rem;color:var(--sage);opacity:0.85;margin-top:2px;overflow-wrap:anywhere;">'+d.tag+'</div>';
    if(locked)h+='<div style="font-family:DM Mono,monospace;font-size:0.62rem;color:var(--muted);margin-top:4px;">🔒 Locked</div>';
    h+='</div>';
    h+='</button>';
  }
  h+='</div>';
  h+='</div>';
  ov.innerHTML=h;
  document.body.appendChild(ov);
}
window._cdPickStyle=function(id){
  _cdSetStyle(id);
  try{document.dispatchEvent(new CustomEvent('lw-card-style-change',{detail:{style:id}}));}catch(e){}
  var ov=document.getElementById('cdStyleOV');if(ov)ov.remove();
  // Repaint the live table immediately — nothing listens for the event
  // above, so the new deck only appeared on the player's NEXT move.
  try{if(typeof window._cdActiveRn==='function')window._cdActiveRn();}catch(e){}
};

// Expose on window for game scripts
window._cdMk=_cdMk;
window._cdSh=_cdSh;
window._cdRnk=_cdRnk;
window._cdSuit=_cdSuit;
window._cdFndEmpty=_cdFndEmpty;
window._cdFit=_cdFit;

// Single debounced window-resize listener that re-renders whichever
// solitaire is active. Games set window._cdActiveRn = their rn fn
// during init; they can null it on teardown (optional).
//
// Mobile browsers fire resize when the address bar shows/hides on scroll —
// that only changes innerHeight, not innerWidth. Skipping those events
// avoids every tap triggering a full rerender and a visible screen jerk.
(function(){
  var t, lastW = window.innerWidth;
  function onResize(){
    if(window.innerWidth === lastW)return; // width unchanged → ignore
    lastW = window.innerWidth;
    clearTimeout(t);
    t = setTimeout(function(){
      try{ if(typeof window._cdActiveRn === 'function') window._cdActiveRn(); }catch(e){}
    }, 180);
  }
  window.addEventListener('resize', onResize);
})();
window._cdIsRed=_cdIsRed;
window._cdBackStyle=_cdBackStyle;
window._cdEl=_cdEl;
window._cdArt=_cdArt;
window._cdStyle=_cdStyle;
window._cdSetStyle=_cdSetStyle;
window._cdToggleStyle=_cdToggleStyle;
window._cdOpenStylePicker=_cdOpenStylePicker;
window._cdStyleLabel=_cdStyleLabel;
window._cdPipFor=_cdPipFor;
window._cdFloralPipImg=_cdFloralPipImg;
window._SUIT_SYM=_SUIT_SYM;
window._SUIT_CLR=_SUIT_CLR;
window._SUIT_GRP=_SUIT_GRP;
window._RANK_SYM=_RANK_SYM;
window._SUIT_NAME=_SUIT_NAME;
window._CD_BASE=_CD_BASE;
window._CD_BACK=_CD_BACK;

// ═══════════════════════════════════════════════════════════════════════════
// TANGIBILITY KIT (2026-08-21) — the shared card feel
//
// Director: Euchre "needs a card back", and "the rest of the games given that
// level of care with dealing, shuffling, all the CSS. It makes it a lot more
// tangible and involved for human players."
//
// Euchre (games/bowergarden.js) already had the deal; it just drew its
// face-down cards as a flat green gradient rectangle. Everything here exists so
// that the other ten card games get the same three things without ten people
// inventing them separately: a real back, a shuffle beat, and a staged deal.
//
// ⛔ THE BACK IS STEPHEN'S EXISTING ART, NOT A NEW DESIGN.
// assets/games/cards/playing-card-backs.png has been in the repo since July and
// the six solitaires already point at it. It could not sit edge to edge in a
// card div because the HOUSE FRAME WAS BAKED IN: the png is the card
// photographed on a dark surface, so about 22% of it is background and shadow.
// card-back.png is that same art with the surround measured off (art rows
// 30..237, cols 17..162 -> 146x208, which is ratio 1.425, the real playing card
// ratio). The original file is untouched.
//
// ⛔ THE DEAL DOES NOT FLY CARDS ACROSS THE TABLE. Every one of these games
// re-renders by rebuilding innerHTML, which destroys any in-flight transition.
// So the pattern euchre proved is the pattern here: stage the STATE, re-render,
// and let CSS pop in only the newest batch. It reads as dealing and it survives
// a full repaint.
var _CD_BACK_AR=208/146;               // the art's true aspect, for sizing helpers

// One face-down card. Pass width and height; height defaults to the real ratio
// so nobody has to remember it.
// ⛔ NOT _cdBackStyle: that name is already taken above by the DOM-element
// styler the solitaires use, and declaring it twice let function hoisting hand
// every solitaire's face-down card to this one instead. It rendered blank
// rectangles for a while before a screenshot caught it.
function _cdBackCss(w,h,r){
  h=h||Math.round(w*_CD_BACK_AR);
  r=(r==null)?Math.max(3,Math.round(w*0.085)):r;
  // ⛔ THE EDGE IS NOT DECORATION. Hands are drawn overlapping (euchre leaves
  // 14-16px of each card showing), and this back is dense knotwork, so without
  // a hard edge five overlapped cards photograph as ONE strip of texture
  // instead of as five cards. The old flat rectangles got this for free from
  // their 1.5px border. A dark ring separates card from card, and the inner
  // cream hairline keeps the top card from disappearing into the felt.
  return 'width:'+w+'px;height:'+h+'px;border-radius:'+r+'px;'+_cdBackBg()
    +'box-shadow:0 0 0 1px rgba(10,18,8,0.95),inset 0 0 0 1px rgba(232,220,200,0.20),'
    +'2px 2px 6px rgba(0,0,0,0.55);';
}
function _cdBackHtml(w,h,o){
  o=o||{};
  return '<div class="cd-back '+(o.cls||'')+'" style="'+_cdBackCss(w,h,o.radius)+(o.style||'')+'"'
    +(o.attrs||'')+'></div>';
}
// A stack of backs with the count on top: the deck while dealing, the stock
// pile, the kitty. `o.shuffling` adds the wiggle, `o.label` the caption.
function _cdDeckHtml(n,w,h,o){
  o=o||{}; w=w||52; h=h||Math.round(w*_CD_BACK_AR);
  var depth=Math.max(1,Math.min(4,Math.ceil((n||0)/6)));
  var s='<div class="cd-deck'+(o.shuffling?' cd-shuffling':'')+'" style="position:relative;width:'
    +(w+depth*2)+'px;height:'+(h+depth*2)+'px;margin:0 auto;'+(o.style||'')+'">';
  for(var i=0;i<depth;i++){
    s+='<div style="position:absolute;top:'+(i*2)+'px;left:'+(i*2)+'px;'+_cdBackCss(w,h,o.radius)+'"></div>';
  }
  if(o.count!==false){
    s+='<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;'
      +'font-family:Georgia,serif;font-weight:700;font-size:'+Math.max(11,Math.round(w*0.30))+'px;'
      +'color:rgba(245,240,225,0.95);text-shadow:0 1px 4px rgba(0,0,0,0.95),0 0 10px rgba(0,0,0,0.8);">'
      +(n||0)+'</div>';
  }
  s+='</div>';
  if(o.label)s+='<div class="cd-deck-label">'+o.label+'</div>';
  return s;
}

// The shared stylesheet. Injected once per page, guarded by its own id so a
// game can call it from render() without piling up <style> tags.
function _cdKitCss(){
  if(document.getElementById('cd-kit-css'))return;
  var st=document.createElement('style'); st.id='cd-kit-css';
  st.textContent=
   /* the newest batch of a deal pops in; everything else is already on the table */
   '@keyframes cdDealIn{0%{opacity:0;transform:translateY(-14px) scale(.82) rotate(-4deg)}'
   +'60%{opacity:1;transform:translateY(2px) scale(1.04) rotate(1deg)}'
   +'100%{opacity:1;transform:none}}'
   +'.cd-deal-in{animation:cdDealIn .34s cubic-bezier(.34,1.4,.5,1) both}'
   /* the shuffle: the deck riffles in place before anything goes out */
   +'@keyframes cdShuffle{0%,100%{transform:translate(0,0) rotate(0)}'
   +'20%{transform:translate(-3px,1px) rotate(-2.4deg)}'
   +'40%{transform:translate(3px,-1px) rotate(2.4deg)}'
   +'60%{transform:translate(-2px,-1px) rotate(-1.6deg)}'
   +'80%{transform:translate(2px,1px) rotate(1.6deg)}}'
   +'.cd-shuffling{animation:cdShuffle .26s ease-in-out infinite}'
   /* a card turning face up: the upcard, the cut, a tableau card unblocking */
   +'@keyframes cdFlip{0%{transform:rotateY(90deg) scale(.94);opacity:.25}'
   +'55%{transform:rotateY(-8deg) scale(1.03);opacity:1}100%{transform:none;opacity:1}}'
   +'.cd-flip{animation:cdFlip .30s ease-out both;backface-visibility:hidden}'
   /* cards you can actually pick up should say so under a finger */
   +'.cd-lift{transition:transform .12s ease,box-shadow .12s ease}'
   +'.cd-lift:hover{transform:translateY(-5px);box-shadow:0 8px 16px rgba(0,0,0,.6)}'
   +'.cd-deck-label{margin-top:7px;font-family:Georgia,serif;font-style:italic;font-size:0.6rem;'
   +'color:rgba(232,220,200,0.7);text-align:center;letter-spacing:.02em}'
   /* ⛔ a player who has asked the OS to stop animating gets a still table, not
      a four second wait staring at a deck that will not move */
   +'@media (prefers-reduced-motion:reduce){.cd-deal-in,.cd-shuffling,.cd-flip{animation:none!important}}';
  document.head.appendChild(st);
}

// The staged deal scheduler. The kit does not know or care what a "step" is:
// the game defines its own batches (Euchre 3-2-3-2, Hearts 13 each, Klondike a
// growing cascade of 7 columns) and just gets told when to advance one.
//
// ⛔ THE GENERATION GUARD IS NOT OPTIONAL. Every one of these games has a New
// Game button, and without it a deal already in flight keeps firing timers into
// a table that has been rebuilt underneath it.
var _cdDealGen=0;
function _cdDeal(o){
  o=o||{};
  var gen=++_cdDealGen, steps=o.steps||[], i=0;
  /* ⛔ THE CSS WAS NOT THE WHOLE FIX. The stylesheet disables cd-deal-in and
     cd-shuffling under prefers-reduced-motion, but the SCHEDULER kept running,
     so a player who has asked the OS to stop animating sat through three
     silent seconds of nothing moving before they could touch the table. Honour
     the preference where it actually costs time: deal it out in one go. */
  var _rm=false;
  try{ _rm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
  if(_rm){
    if(o.onShuffle)o.onShuffle();
    if(o.onShuffleEnd)o.onShuffleEnd();
    for(var q=0;q<steps.length;q++){ if(o.onStep)o.onStep(steps[q],q); }
    if(o.onDone)o.onDone();
    return { cancel:function(){}, live:function(){ return false; } };
  }
  function live(){ return gen===_cdDealGen && (!o.alive || o.alive()!==false); }
  function next(){
    if(!live())return;
    if(i>=steps.length){ if(o.onDone)o.onDone(); return; }
    var s=steps[i], at=i; i++;
    if(o.onStep)o.onStep(s,at);
    var ms=(typeof o.stepMs==='function')?o.stepMs(at,s):(o.stepMs==null?280:o.stepMs);
    setTimeout(next,ms);
  }
  var sh=(o.shuffleMs==null)?900:o.shuffleMs;
  if(o.onShuffle)o.onShuffle();
  if(sh<=0){ next(); }
  else setTimeout(function(){ if(!live())return; if(o.onShuffleEnd)o.onShuffleEnd(); next(); },sh);
  return { cancel:function(){ if(gen===_cdDealGen)_cdDealGen++; },
           live:function(){ return live(); } };
}
function _cdCancelDeal(){ _cdDealGen++; }

window._CD_BACK_ART=_CD_BACK_ART;
window._cdBackCss=_cdBackCss;
window._cdBackHtml=_cdBackHtml;
window._cdDeckHtml=_cdDeckHtml;
window._cdKitCss=_cdKitCss;
window._cdDeal=_cdDeal;
window._cdCancelDeal=_cdCancelDeal;
try{ _cdKitCss(); }catch(e){}
// ═══════════════════════════════════════════════════════════════════════════
// THE LAMP TABLE (pilot, 18 Nov 2026) — the card pack's table, cards and backs
//
// Owner: "take all of our card games and release them in a pack but make like
// the backgrounds and everything look a lot better." The rules are in
// docs/briefs/card-pack/STYLE.md; this is the code half of them.
//
// ⛔ OFF UNLESS BOTH: the address carries ?table=lamp AND the game calls
//   window._cdLamp({id:'<game id>', cloth:'<cloth key>'})
// A game that never calls it, or a page without the switch, gets exactly the
// old table. Not approved yet: the switch exists so the owner can judge it.
//
// One call per game, later: the other eleven add the call and are done; the
// card renderer (_cdEl, _cdBackStyle, _cdBackCss, _cdFndEmpty) already asks
// _cdLampOn() before it draws.
//
// Each material is ONE named file in assets/cards-pack/ so the owner's own
// scans replace them without a code change: walnut.webp, cloth.webp (neutral
// grey, dyed per game by the cloth colour), stock.webp (the card stock),
// rank.woff2 (the index face). The grain and the motes are drawn in code.
//
// Slow phones: textures are plain background images (decoded once, cached);
// the back and the re-inked pips are drawn once into data URLs; the motes are
// one small canvas at device pixel 1, 30 fps, stopped when the tab hides; the
// lamp flicker is an opacity animation (compositor only). Nothing reads layout
// per frame. Reduced motion: no motes, no flicker.
// ═══════════════════════════════════════════════════════════════════════════
var _LP_DIR='assets/cards-pack/';
var _LP_INK={iron:'#1f2328',madder:'#922b24'};   // the two inks
var _LP_STOCK='#efe6d0';                          // card stock, unprinted
// The pack's twelve cloths (STYLE.md). One per game; Klondike is moss.
var _LP_CLOTH={
  moss:'#34513b', slate:'#2f4151', loden:'#284a40', ochre:'#6c5329',
  heather:'#4b3649', fairway:'#3e5633', oxblood:'#5b2c28', forest:'#27412f',
  rose:'#6a3338', indigo:'#29334d', juniper:'#374b41', umber:'#5c4a31'
};
var _lpState=null;   // {id, cloth, backUrl, pips:{}, ...} once a game turns it on
function _cdLampWanted(){
  try{ return /[?&]table=lamp(&|$)/.test(location.search); }catch(e){ return false; }
}
function _cdLampOn(){ return !!_lpState; }
function _lpReduced(){
  try{ return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return false; }
}
function _lpRedraw(){ try{ if(typeof window._cdActiveRn==='function')window._cdActiveRn(); }catch(e){} }

// ── A small SHA-256 (sync), so a back is grown from the hash of the game's id
// the way the studio's plants are grown from theirs. 32 bytes out.
function _lpSha256(str){
  var K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  var H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  var b=[],i,j;
  str=unescape(encodeURIComponent(str));
  for(i=0;i<str.length;i++)b.push(str.charCodeAt(i));
  var bl=b.length*8; b.push(0x80); while(b.length%64!==56)b.push(0);
  for(i=7;i>=0;i--)b.push(i>3?0:(bl>>>(i*8))&255);
  function r(x,n){return (x>>>n)|(x<<(32-n));}
  var w=new Array(64);
  for(i=0;i<b.length;i+=64){
    for(j=0;j<16;j++)w[j]=(b[i+j*4]<<24)|(b[i+j*4+1]<<16)|(b[i+j*4+2]<<8)|b[i+j*4+3];
    for(j=16;j<64;j++){
      var s0=r(w[j-15],7)^r(w[j-15],18)^(w[j-15]>>>3), s1=r(w[j-2],17)^r(w[j-2],19)^(w[j-2]>>>10);
      w[j]=(w[j-16]+s0+w[j-7]+s1)|0;
    }
    var a=H[0],c=H[1],d=H[2],e=H[3],f=H[4],g=H[5],h=H[6],k=H[7];
    for(j=0;j<64;j++){
      var t1=(k+(r(f,6)^r(f,11)^r(f,25))+((f&g)^(~f&h))+K[j]+w[j])|0;
      var t2=((r(a,2)^r(a,13)^r(a,22))+((a&c)^(a&d)^(c&d)))|0;
      k=h;h=g;g=f;f=(e+t1)|0;e=d;d=c;c=a;a=(t1+t2)|0;
    }
    H[0]=(H[0]+a)|0;H[1]=(H[1]+c)|0;H[2]=(H[2]+d)|0;H[3]=(H[3]+e)|0;
    H[4]=(H[4]+f)|0;H[5]=(H[5]+g)|0;H[6]=(H[6]+h)|0;H[7]=(H[7]+k)|0;
  }
  var out=[]; for(i=0;i<8;i++)for(j=3;j>=0;j--)out.push((H[i]>>>(j*8))&255);
  return out;
}

// ── THE BACK: a botanical knot grown from sha256(game id), in the two inks.
// Iron-gall panel on cream stock; the knot is the paper left unprinted (cream
// lines reversed out of the panel); leaves and the bloom are holes in the
// panel with madder printed into them, the madder plate sitting a fixed
// step right and down so a sliver of bare paper shows on the lamp side of
// every leaf. Four-fold mirror, so the back reads the same either way up.
function _lpDrawBack(id,stockImg){
  var W=240,H=336,cv=document.createElement('canvas');cv.width=W;cv.height=H;
  var x=cv.getContext('2d'), hb=_lpSha256('lamp-table:'+id), hp=0;
  function byte(){ var v=hb[hp%32]; hp++; if(hp%32===0){ hb=_lpSha256(hb.join(',')); } return v; }
  function u(){ return byte()/255; }
  function rr(px,py,pw,ph,rad){x.beginPath();x.moveTo(px+rad,py);x.arcTo(px+pw,py,px+pw,py+ph,rad);
    x.arcTo(px+pw,py+ph,px,py+ph,rad);x.arcTo(px,py+ph,px,py,rad);x.arcTo(px,py,px+pw,py,rad);x.closePath();}
  // stock
  x.fillStyle=_LP_STOCK;x.fillRect(0,0,W,H);
  if(stockImg){ try{ x.globalAlpha=1; x.drawImage(stockImg,0,0,512,512,0,0,W,W*512/512); x.drawImage(stockImg,0,0,512,512,0,W,W,W); }catch(e){} }
  // iron panel (printed: multiply keeps the paper's fibre in the ink)
  var m=13; x.globalCompositeOperation='multiply'; x.fillStyle=_LP_INK.iron;
  rr(m,m,W-2*m,H-2*m,10); x.fill(); x.globalCompositeOperation='source-over';
  // everything below is drawn in panel space, centre origin, then mirrored
  var cx=W/2, cy=H/2, PW=W/2-m-10, PH=H/2-m-10;
  var nV=3+(byte()%3);              // 3..5 tendrils per quadrant
  var petals=5+(byte()%4);          // 5..8 petals in the bloom
  var vines=[];
  for(var v=0;v<nV;v++){
    var a0=(0.15+0.7*(v+u()*0.6)/nV)*Math.PI/2;      // leaving angle in the quadrant
    var len=0.66+u()*0.24, bend=(u()-0.5)*1.4, curl=0.5+u()*0.9;
    var ex=Math.cos(a0)*PW*len, ey=Math.sin(a0)*PH*len;
    vines.push({p:[18*Math.cos(a0),18*Math.sin(a0),
      ex*0.45-ey*bend*0.5, ey*0.45+ex*bend*0.5,
      ex*0.85+ey*bend*0.25, ey*0.85-ex*bend*0.25, ex, ey], curl:curl*(u()<0.5?-1:1),
      leaves:2+(byte()%3), lt:u()});
  }
  function bez(p,t){ var mt=1-t;
    return [mt*mt*mt*p[0]+3*mt*mt*t*p[2]+3*mt*t*t*p[4]+t*t*t*p[6],
            mt*mt*mt*p[1]+3*mt*mt*t*p[3]+3*mt*t*t*p[5]+t*t*t*p[7]]; }
  function each(fn){ // the four mirrored copies
    for(var q=0;q<4;q++){ x.save(); x.translate(cx,cy); x.scale(q&1?-1:1,q&2?-1:1); fn(q); x.restore(); }
  }
  function vinePath(vn){
    var p=vn.p; x.beginPath(); x.moveTo(p[0],p[1]); x.bezierCurveTo(p[2],p[3],p[4],p[5],p[6],p[7]);
    // the curl: a short spiral at the tip
    var a=Math.atan2(p[7]-p[5],p[6]-p[4]), rad=7, px=p[6], py=p[7];
    for(var s=1;s<=14;s++){ a+=vn.curl*0.42; rad*=0.9; px+=Math.cos(a)*rad*0.55; py+=Math.sin(a)*rad*0.55; x.lineTo(px,py); }
  }
  function leaf(px,py,ang,sz){
    x.save(); x.translate(px,py); x.rotate(ang); x.beginPath(); x.moveTo(0,0);
    x.quadraticCurveTo(sz*0.5,-sz*0.42,sz,0); x.quadraticCurveTo(sz*0.5,sz*0.42,0,0); x.restore();
  }
  // 1) the knot: each tendril is laid with a dark gap stroke and then the
  //    paper line, in turn, so later tendrils pass OVER earlier ones (interlace)
  x.lineCap='round'; x.lineJoin='round';
  // the motif stays inside the inner paper rule, like a printed panel
  x.save(); rr(m+10,m+10,W-2*m-20,H-2*m-20,4); x.clip();
  for(var vi=0;vi<vines.length;vi++){
    each(function(){ vinePath(vines[vi]); x.strokeStyle=_LP_INK.iron; x.lineWidth=12; x.stroke();
      vinePath(vines[vi]); x.strokeStyle=_LP_STOCK; x.lineWidth=4.8; x.stroke(); });
  }
  // 2) leaves: knock out of the panel, then madder printed into the hole off
  //    register by +2,+2 canvas px (about one device pixel at card size)
  var leafList=[];
  for(vi=0;vi<vines.length;vi++){
    var vn=vines[vi];
    for(var l=0;l<vn.leaves;l++){
      var t=0.25+0.6*((l+vn.lt)/vn.leaves), pt=bez(vn.p,t), pt2=bez(vn.p,Math.min(1,t+0.02));
      var ang=Math.atan2(pt2[1]-pt[1],pt2[0]-pt[0])+((l%2)?1:-1)*0.9;
      leafList.push([pt[0],pt[1],ang,19+u()*10]);
    }
  }
  each(function(){ x.fillStyle=_LP_STOCK; for(var i=0;i<leafList.length;i++){ var L=leafList[i]; leaf(L[0],L[1],L[2],L[3]); x.fill(); } });
  each(function(q){ x.translate((q&1?-1:1)*2,(q&2?-1:1)*2); x.globalCompositeOperation='multiply'; x.fillStyle=_LP_INK.madder;
    for(var i=0;i<leafList.length;i++){ var L=leafList[i]; leaf(L[0],L[1],L[2],L[3]*0.94); x.fill(); } });
  // 3) the bloom at the centre: paper ring, madder petals off register
  x.save(); x.translate(cx,cy);
  x.beginPath(); x.arc(0,0,31,0,Math.PI*2); x.fillStyle=_LP_INK.iron; x.fill();
  for(var pp=0;pp<petals;pp++){ var pa=pp/petals*Math.PI*2-Math.PI/2; x.fillStyle=_LP_STOCK; leaf(0,0,pa,29); x.fill(); }
  x.translate(2,2); x.globalCompositeOperation='multiply'; x.fillStyle=_LP_INK.madder;
  for(pp=0;pp<petals;pp++){ var pb=pp/petals*Math.PI*2-Math.PI/2; leaf(0,0,pb,27); x.fill(); }
  x.globalCompositeOperation='source-over'; x.beginPath(); x.arc(-2,-2,5.5,0,Math.PI*2); x.fillStyle=_LP_STOCK; x.fill();
  x.restore();
  x.restore();
  // 4) two paper rules inside the panel edge
  x.strokeStyle=_LP_STOCK; x.lineWidth=1.6; rr(m+5,m+5,W-2*m-10,H-2*m-10,6); x.stroke();
  x.lineWidth=0.8; rr(m+8.5,m+8.5,W-2*m-17,H-2*m-17,4); x.stroke();
  try{ return cv.toDataURL('image/png'); }catch(e){ return ''; }
}

// ── Re-ink a pip image (transparent PNG line art) into one ink, once, small.
function _lpInkPip(img,ink,size){
  var cv=document.createElement('canvas'); cv.width=cv.height=size;
  var x=cv.getContext('2d'), iw=img.naturalWidth||img.width, ih=img.naturalHeight||img.height;
  var sc=Math.min(size/iw,size/ih), dw=iw*sc, dh=ih*sc;
  x.drawImage(img,(size-dw)/2,(size-dh)/2,dw,dh);
  // the art's white is paper, not ink: coverage = how dark the line is
  try{
    var id=x.getImageData(0,0,size,size), dd=id.data;
    for(var i=0;i<dd.length;i+=4){
      // distance from white by the weakest channel: black and red line both
      // read as full ink, pale fills as a tint, white as bare paper
      var lo=Math.min(dd[i],dd[i+1],dd[i+2])/255;
      dd[i+3]=Math.round(dd[i+3]*Math.min(1,Math.max(0,(1-lo)*1.3)));
    }
    x.putImageData(id,0,0);
  }catch(e){}
  x.globalCompositeOperation='source-in'; x.fillStyle=ink; x.fillRect(0,0,size,size);
  try{ return cv.toDataURL('image/png'); }catch(e){ return ''; }
}
// The fine grain over everything: one 128 px tile of light and dark specks,
// plain alpha (no blend mode, so it costs the compositor nothing).
function _lpGrainUrl(){
  var n=128,cv=document.createElement('canvas');cv.width=cv.height=n;
  var x=cv.getContext('2d'),d=x.createImageData(n,n),s=0x2545F491;
  for(var i=0;i<n*n;i++){
    s^=s<<13;s^=s>>>17;s^=s<<5; var v=(s>>>0)/4294967296;
    var o=i*4, lt=v>0.5; d.data[o]=d.data[o+1]=d.data[o+2]=lt?255:0;
    d.data[o+3]=Math.round(Math.abs(v-0.5)*2*(lt?9:26));
  }
  x.putImageData(d,0,0);
  try{ return cv.toDataURL('image/png'); }catch(e){ return ''; }
}

function _lpCss(clothHex){
  var D=_LP_DIR, I=_LP_INK;
  return ''
  +'@font-face{font-family:"LampRank";src:url('+D+'rank.woff2) format("woff2");font-display:block}'
  // the page becomes one screen: no scroll, nothing to move
  +'html.cd-lamp,html.cd-lamp body{background:#0b0704!important;height:100%;overflow:hidden;overscroll-behavior:none}'
  +'html.cd-lamp body{height:100vh;height:100dvh;min-height:0}'
  +'html.cd-lamp .shell-footer,html.cd-lamp #shell-install-btn{display:none!important}'
  +'html.cd-lamp .shell-hdr{background:linear-gradient(180deg,rgba(14,8,4,.55),rgba(14,8,4,.25))!important;border-bottom:0!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;position:relative;flex:0 0 auto}'
  +'html.cd-lamp .shell-mount{position:relative;z-index:1;flex:1 1 0;min-height:0;overflow:hidden}'
  +'html.cd-lamp #fg-ag{padding:8px 12px 14px!important;min-height:0;overflow:hidden;background:none!important}'
  // the table: walnut, a cloth let into it, the lamp's pool and its far dark
  +'#cd-lamp-table{position:fixed;inset:0;z-index:0;pointer-events:none;background:#1c120a url('+D+'walnut.webp) 0 0/300px 300px repeat}'
  +'#cd-lamp-table .cl{position:absolute;left:7px;right:7px;bottom:7px;top:calc(var(--cd-hdr,60px) + 2px);border-radius:7px;'
  +'background-color:'+clothHex+';background-image:url('+D+'cloth.webp);background-size:240px 240px;background-blend-mode:overlay;'
  +'box-shadow:inset 3px 4px 7px rgba(0,0,0,.62),inset 0 0 0 1px rgba(0,0,0,.55),0 0 0 1px rgba(255,226,180,.07),1px 1px 0 1px rgba(255,226,180,.06)}'
  // the lamp on the cloth: warm pool at the upper left, true dark in the far corner
  +'#cd-lamp-table .lp{position:absolute;inset:0;border-radius:inherit;background:'
  +'radial-gradient(105% 72% at 12% 8%,rgba(255,206,138,.40) 0%,rgba(255,196,122,.22) 22%,rgba(255,190,110,.07) 42%,rgba(0,0,0,0) 56%)}'
  +'#cd-lamp-table .dk{position:absolute;inset:0;background:'
  +'radial-gradient(70% 50% at 10% 4%,rgba(255,196,130,.16) 0%,rgba(255,196,130,0) 100%),'
  +'radial-gradient(135% 100% at 10% 6%,rgba(0,0,0,0) 40%,rgba(0,0,0,.32) 64%,rgba(0,0,0,.64) 88%,rgba(0,0,0,.88) 118%)}'
  // over the game, quiet: a faint warmth near the lamp, a faint dusk away from it, the grain
  +'#cd-lamp-over{position:fixed;inset:0;z-index:60;pointer-events:none}'
  +'#cd-lamp-over .gl{position:absolute;inset:0;background:radial-gradient(120% 90% at 8% 4%,rgba(255,214,160,.06) 0%,rgba(0,0,0,0) 45%,rgba(0,0,0,.06) 80%,rgba(0,0,0,.12) 110%);animation:cdLpFlick 11s linear infinite}'
  +'@keyframes cdLpFlick{0%,61%,63.5%,100%{opacity:1}62%{opacity:.82}62.7%{opacity:.93}}'
  +'#cd-lamp-over .gr{position:absolute;inset:0;background-size:128px 128px;opacity:.9}'
  +'#cd-lamp-over canvas{position:absolute;left:0;top:0}'
  +'@media (prefers-reduced-motion:reduce){#cd-lamp-over .gl{animation:none!important}#cd-lamp-over canvas{display:none!important}}'
  // ── cards: cream stock, lit from the upper left, shadow to the lower right
  +'html.cd-lamp .gc.cd-lp{background:'+_LP_STOCK+'!important;border:0!important;border-radius:.42em!important;color:'+I.iron+'!important;text-shadow:none!important;'
  +'box-shadow:0 0 0 .5px rgba(48,32,16,.6),1px 1.5px 1.5px rgba(0,0,0,.38),2px 4px 7px rgba(0,0,0,.30)!important;position:relative;isolation:isolate;overflow:hidden}'
  +'html.cd-lamp .gc.cd-lp::before{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;pointer-events:none;'
  +'background:linear-gradient(140deg,rgba(255,252,240,.38) 0%,rgba(255,250,235,0) 42%,rgba(70,48,24,.10) 100%),url('+D+'stock.webp) var(--sx,0) var(--sy,0)/180px 180px}'
  +'html.cd-lamp .gc.cd-lp .cd-rk{font-family:"LampRank",Georgia,serif!important;font-weight:400!important;font-size:1.62em!important;line-height:.86!important;letter-spacing:-.04em;text-shadow:1px 1px 0 var(--mis)}'
  +'html.cd-lamp .gc.cd-lp .cd-pp{display:block;width:1.05em;height:1.05em;margin:.12em auto 0;background:center/contain no-repeat;filter:drop-shadow(1px 1px 0 var(--mis))}'
  +'html.cd-lamp .cd-s0{background-image:var(--cd-pip0)!important}html.cd-lamp .cd-s1{background-image:var(--cd-pip1)!important}'
  +'html.cd-lamp .cd-s2{background-image:var(--cd-pip2)!important}html.cd-lamp .cd-s3{background-image:var(--cd-pip3)!important}'
  +'html.cd-lamp .gc.cd-lp .cd-gl{font-family:Georgia,serif;font-size:1.05em;line-height:1;text-shadow:1px 1px 0 var(--mis)}'
  +'html.cd-lamp .gc-peek.cd-lp .gc-corner-tl>.cd-pp{width:.95em;height:.95em;margin:0}'
  +'html.cd-lamp .gc.cd-lp .gc-corner-tl{position:absolute;top:.28em;left:.3em;text-align:center;z-index:2;pointer-events:none}'
  +'html.cd-lamp .gc.cd-lp .gc-corner-br{position:absolute;bottom:.28em;right:.3em;text-align:center;transform:rotate(180deg);z-index:2;pointer-events:none}'
  +'html.cd-lamp .gc-peek.cd-lp .gc-corner-tl{gap:.18em!important;top:.2em!important;left:.3em!important}'
  +'html.cd-lamp .gc.cd-lp .cd-mid{position:absolute;left:24%;right:24%;top:24%;bottom:24%;pointer-events:none;display:flex;align-items:center;justify-content:center}'
  +'html.cd-lamp .gc.cd-lp .cd-big{display:block;width:100%;height:100%;background:center/contain no-repeat;filter:drop-shadow(1px 1px 0 var(--mis))}'
  +'html.cd-lamp .gc.cd-lp .cd-mid .cd-gl{font-size:2.7em}'
  +'html.cd-lamp .gc.cd-lp .cd-face{position:absolute;left:13%;right:13%;top:11%;bottom:11%;pointer-events:none}'
  +'html.cd-lamp .gc.cd-lp .cd-face img{width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply}'
  // a picked-up card and a legal place still say so, in the lamp's gold
  +'html.cd-lamp .gc.gc-sel{box-shadow:0 0 0 2px rgba(224,178,76,.98),0 0 14px 2px rgba(224,178,76,.55),2px 4px 7px rgba(0,0,0,.30)!important}'
  +'html.cd-lamp .gc.gc-sel.cd-lp::before{background:linear-gradient(rgba(240,196,96,.20),rgba(240,196,96,.20)),url('+D+'stock.webp) var(--sx,0) var(--sy,0)/180px 180px}'
  +'html.cd-lamp .gc.gc-legal{box-shadow:0 0 0 2px rgba(150,206,104,.95),0 0 16px 2px rgba(150,206,104,.50),2px 4px 7px rgba(0,0,0,.30)!important}'
  // backs
  +'html.cd-lamp .gc.gc-dn.cd-lp-dn{background-color:'+I.iron+'!important;background-image:var(--cd-lp-back)!important;background-size:100% 100%!important;border:0!important;border-radius:.42em!important;'
  +'box-shadow:0 0 0 .5px rgba(20,12,6,.8),1px 1.5px 1.5px rgba(0,0,0,.40),2px 4px 7px rgba(0,0,0,.30)!important}'
  // a count on a back sits on its own ink chip so the knot never fights it
  +'html.cd-lamp .cd-lp-dn>span{background:rgba(24,27,31,.88);border-radius:1em;padding:.12em .5em;box-shadow:0 0 0 1px rgba(239,230,208,.35)}'
  // empty places: pressed into the cloth, not drawn on it
  +'html.cd-lamp .gc-empty,html.cd-lamp .gc-fnd:not(.cd-lp){background-color:rgba(0,0,0,.13)!important;border:0!important;border-radius:.42em!important;'
  +'box-shadow:inset 1.5px 2px 3px rgba(0,0,0,.45),inset 0 0 0 1px rgba(0,0,0,.22),.5px .5px 0 1px rgba(255,232,196,.07)!important}'
  +'html.cd-lamp .gc-fnd:not(.cd-lp){background-size:44% auto!important;background-position:center!important;background-repeat:no-repeat!important;opacity:1}'
  // the controls: quiet, under the cards in weight
  +'html.cd-lamp #fg-ag .gu-bar{background:none!important;min-height:22px!important;padding:0 2px 2px!important;font-family:Georgia,serif;font-style:italic;color:rgba(232,220,200,.62)!important;font-size:13px!important}'
  +'html.cd-lamp #fg-ag .gu-bar strong{color:rgba(240,230,210,.9)!important;font-style:normal}'
  +'html.cd-lamp #fg-ag .gm{font-family:Georgia,serif;font-size:13px!important;color:rgba(232,220,200,.8)!important;min-height:18px;line-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
  +'html.cd-lamp #fg-ag .gcr .gb,html.cd-lamp #fg-ag .gcr .gsl{font-family:Georgia,serif!important;font-size:14px!important;letter-spacing:.01em!important;font-weight:400!important;color:#eadfc9!important;'
  +'background-color:rgba(16,10,6,.50)!important;border:1px solid rgba(234,223,201,.16)!important;border-radius:10px!important;min-height:48px!important;padding:6px 8px!important;'
  +'box-shadow:inset 0 1px 0 rgba(255,240,214,.06),1px 2px 4px rgba(0,0,0,.35)!important;white-space:nowrap;margin:0!important;width:100%;box-sizing:border-box}'
  +'html.cd-lamp #fg-ag .gcr .gsl{padding-right:26px!important;background-position:right 10px center!important}'
  +'html.cd-lamp #fg-ag .gcr .gb:disabled{opacity:.45!important}';
}

// The dust in the beam: about twenty motes on one small canvas over the lamp's
// side of the screen. Device pixel 1, 30 fps, paused while hidden.
function _lpMotes(host){
  var cv=document.createElement('canvas'), x=cv.getContext('2d');
  var W=0,H=0,motes=[],raf=0,last=0,alive=true;
  var spr=document.createElement('canvas'); spr.width=spr.height=16;
  var sx=spr.getContext('2d'), g=sx.createRadialGradient(8,8,0,8,8,8);
  g.addColorStop(0,'rgba(255,236,200,0.95)'); g.addColorStop(0.35,'rgba(255,226,180,0.45)'); g.addColorStop(1,'rgba(255,220,170,0)');
  sx.fillStyle=g; sx.fillRect(0,0,16,16);
  var seed=7; function rnd(){ seed=(seed*16807)%2147483647; return seed/2147483647; }
  function size(){
    W=Math.round(Math.min(window.innerWidth,560)*0.8); H=Math.round(window.innerHeight*0.62);
    cv.width=W; cv.height=H; cv.style.width=W+'px'; cv.style.height=H+'px';
  }
  size();
  for(var i=0;i<20;i++)motes.push({x:rnd()*W,y:rnd()*H,r:0.5+rnd()*1.3,vx:0.05+rnd()*0.12,vy:-0.03-rnd()*0.08,ph:rnd()*6.28,w:0.004+rnd()*0.01});
  function frame(t){
    if(!alive)return;
    raf=requestAnimationFrame(frame);
    if(t-last<33)return; last=t;
    x.clearRect(0,0,W,H);
    for(var i=0;i<motes.length;i++){
      var m=motes[i]; m.ph+=m.w; m.x+=m.vx+Math.sin(m.ph)*0.06; m.y+=m.vy+Math.cos(m.ph*0.7)*0.04;
      if(m.x>W+8)m.x=-8; if(m.y<-8)m.y=H+8; if(m.x<-8)m.x=W+8;
      // brightest in the beam near the lamp, gone by the edge of the pool
      var dx=m.x/W, dy=m.y/H, beam=Math.max(0,1-Math.sqrt(dx*dx*0.8+dy*dy*1.1)*1.05);
      var a=beam*(0.35+0.45*(0.5+0.5*Math.sin(m.ph*1.7)));
      if(a<0.02)continue;
      x.globalAlpha=a; var s=m.r*6; x.drawImage(spr,m.x-s/2,m.y-s/2,s,s);
    }
  }
  function vis(){ if(document.hidden){ cancelAnimationFrame(raf); raf=0; } else if(!raf&&alive){ raf=requestAnimationFrame(frame); } }
  document.addEventListener('visibilitychange',vis);
  host.appendChild(cv); raf=requestAnimationFrame(frame);
  return { resize:size, stop:function(){ alive=false; cancelAnimationFrame(raf); document.removeEventListener('visibilitychange',vis); if(cv.parentNode)cv.parentNode.removeChild(cv); } };
}

// THE ONE CALL. o.id = the game's id (grows its back), o.cloth = a key of
// _LP_CLOTH. Returns true when the lamp table is on.
function _cdLamp(o){
  o=o||{};
  if(!_cdLampWanted())return false;
  if(_lpState){ _lpState.id=o.id||_lpState.id; return true; }
  var cloth=_LP_CLOTH[o.cloth]||_LP_CLOTH.moss;
  var st={id:o.id||'deck', pips:{}};
  _lpState=st;
  var root=document.documentElement; root.classList.add('cd-lamp');
  var css=document.createElement('style'); css.id='cd-lamp-css'; css.textContent=_lpCss(cloth); document.head.appendChild(css);
  var tb=document.createElement('div'); tb.id='cd-lamp-table'; tb.setAttribute('aria-hidden','true');
  tb.innerHTML='<div class="cl"><div class="lp"></div></div><div class="dk"></div>';
  document.body.insertBefore(tb,document.body.firstChild);
  var ov=document.createElement('div'); ov.id='cd-lamp-over'; ov.setAttribute('aria-hidden','true');
  ov.innerHTML='<div class="gl"></div><div class="gr"></div>';
  document.body.appendChild(ov);
  var gu=_lpGrainUrl(); if(gu)ov.querySelector('.gr').style.backgroundImage='url('+gu+')';
  var motes=_lpReduced()?null:_lpMotes(ov);
  // the cloth starts under the header; measured on resize only
  var hdr=document.querySelector('.shell-hdr'), lastSz='';
  function measure(){
    var sz=window.innerWidth+'x'+window.innerHeight; if(sz===lastSz)return false; lastSz=sz;
    root.style.setProperty('--cd-hdr',(hdr?hdr.offsetHeight:0)+'px');
    if(motes)motes.resize();
    return true;
  }
  measure();
  var rt=0;
  function onRs(){ clearTimeout(rt); rt=setTimeout(function(){ if(measure())_lpRedraw(); },120); }
  window.addEventListener('resize',onRs);
  // the back: drawn at once on flat stock, then again with the stock's fibre
  // Images live in CSS variables on the root, set once: cards carry a class,
  // never a copy of the picture, so a re-render moves no image data.
  function setVar(k,u){ if(u)root.style.setProperty(k,"url('"+u+"')"); }
  setVar('--cd-lp-back',_lpDrawBack(st.id,null));
  var si=new Image(); si.onload=function(){ setVar('--cd-lp-back',_lpDrawBack(st.id,si)); }; si.src=_LP_DIR+'stock.webp';
  // the pips, re-inked once from the floral line art (128 px, two inks)
  var files=['suit-spade.png','suit-heart.png','suit-diamond.png','suit-club.png'];
  for(var s=0;s<4;s++)(function(s){
    var im=new Image();
    im.onload=function(){
      setVar('--cd-pip'+s,_lpInkPip(im,_cdIsRed(s)?_LP_INK.madder:_LP_INK.iron,128));
      setVar('--cd-fpip'+s,_lpInkPip(im,'rgba(0,0,0,0.30)',96));
      st.pips[s]=true;
    };
    im.src=_FL_BASE+files[s];
  })(s);
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){
    window.removeEventListener('resize',onRs);
    if(motes)motes.stop();
    if(tb.parentNode)tb.parentNode.removeChild(tb);
    if(ov.parentNode)ov.parentNode.removeChild(ov);
    if(css.parentNode)css.parentNode.removeChild(css);
    root.classList.remove('cd-lamp');
    var vs=['--cd-hdr','--cd-lp-back','--cd-pip0','--cd-pip1','--cd-pip2','--cd-pip3','--cd-fpip0','--cd-fpip1','--cd-fpip2','--cd-fpip3'];
    for(var i=0;i<vs.length;i++)root.style.removeProperty(vs[i]);
    _lpState=null;
  });
  return true;
}

// The lamp card face. Same DOM contract as the other styles: .gc-corner-tl is
// the only child a buried (peek) card keeps.
function _cdElLamp(d,card){
  var st=_lpState;
  if(!card.up){
    d.className+=' gc-dn cd-lp-dn';
    d.innerHTML='';
    return;
  }
  var red=_cdIsRed(card.s), ink=red?_LP_INK.madder:_LP_INK.iron;
  d.className+=' gc-up cd-lp'+(red?' gc-red':'');
  d.style.color=ink;
  // the second plate: the other ink, faint, one pixel right and down
  d.style.setProperty('--mis',red?'rgba(31,35,40,.22)':'rgba(156,47,39,.42)');
  // the stock's fibre sits differently on every card
  var k=card.s*13+card.r; d.style.setProperty('--sx',((k*37)%180)+'px'); d.style.setProperty('--sy',((k*71)%180)+'px');
  var classic=_cdStyle()==='classic', rnk=_cdRnk(card.r);
  var pip=classic?'<span class="cd-gl">'+_CL_SYM[card.s]+'</span>':'<i class="cd-pp cd-s'+card.s+'"></i>';
  function corner(cls){ return '<div class="gc-corner '+cls+'"><div class="cd-rk">'+rnk+'</div>'+pip+'</div>'; }
  var mid;
  if(card.r===0||card.r>=10){
    if(classic){ mid='<div class="cd-mid"><span class="cd-gl">'+_CL_SYM[card.s]+'</span></div>'; }
    else{
      var face=card.r===0?'ace':(card.r===10?'jack':(card.r===11?'queen':'king'));
      mid='<div class="cd-face"><img src="'+_FL_BASE+face+'-'+(red?'red':'black')+'.png" alt=""></div>';
    }
  }else{
    mid='<div class="cd-mid">'+(classic?'<span class="cd-gl">'+_CL_SYM[card.s]+'</span>':'<i class="cd-big cd-s'+card.s+'"></i>')+'</div>';
  }
  d.innerHTML=mid+corner('gc-corner-tl')+corner('gc-corner-br');
}
function _cdFndEmptyLamp(el,suitIdx){
  el.innerHTML='';
  el.style.backgroundImage='var(--cd-fpip'+suitIdx+')';
}
window._cdLamp=_cdLamp;
window._cdLampOn=_cdLampOn;
window._cdLampBack=function(id){ return _lpDrawBack(id,null); };   // preview sheets
window._LP_CLOTH=_LP_CLOTH;
window._LP_INK=_LP_INK;


console.log('[LW] Card utilities loaded, style:',_cdStyle());
})();
