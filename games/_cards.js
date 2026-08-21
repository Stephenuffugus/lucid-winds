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
      +'<button id="LWCE-view" style="margin-top:10px;min-height:44px;padding:8px 20px;background:transparent;border:1px solid rgba(138,145,120,0.4);color:#8a9178;border-radius:10px;font-size:0.75rem;cursor:pointer;">view the table</button>';
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
  {id:'lw',     name:'Garden',  tag:'Botanical reskin · mushroom·bee·flower·bird', unlocked:true}
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

// Foundation empty-slot art. Style-aware:
//   lw     → shroom/flower/bee/bird PNG (original behavior)
//   floral → the matching suit-pip PNG from Jessie's set
//   classic→ a large faded pip character, since the classic style has no image art
// Consumers: klondike.js foundations, freecell.js foundations.
function _cdFndEmpty(el, suitIdx){
  if(!el)return;
  el.innerHTML='';
  el.style.backgroundImage='';
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

function _cdBackStyle(el){
  var style=_cdStyle();
  if(style==='classic'){
    // Classic card back: navy diagonal weave pattern via CSS gradients
    el.style.backgroundImage='repeating-linear-gradient(45deg,#1a3a6a 0,#1a3a6a 8px,#244a7a 8px,#244a7a 16px),linear-gradient(135deg,#1a3a6a,#244a7a)';
    el.style.backgroundColor='#1a3a6a';
    el.style.backgroundSize='auto, auto';
  }else if(style==='floral'){
    // Floral card back: cream with a soft botanical cross-hatch, echoing
    // the line-art set. No dedicated card-back art in the floral pack yet,
    // so we synthesise one from layered gradients tinted with burgundy.
    el.style.backgroundColor='#efe5cf';
    el.style.backgroundImage='repeating-linear-gradient(45deg,rgba(180,42,42,0.12) 0,rgba(180,42,42,0.12) 2px,transparent 2px,transparent 8px),'
      +'repeating-linear-gradient(-45deg,rgba(180,42,42,0.10) 0,rgba(180,42,42,0.10) 2px,transparent 2px,transparent 8px),'
      +'linear-gradient(135deg,#f4ead2,#e8ddbd)';
    el.style.backgroundSize='auto, auto, auto';
  }else{
    el.style.backgroundImage="url('"+_CD_BACK+"')";
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
  if(style==='classic')_cdElClassic(d,card);
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
  var h='<div style="max-width:460px;width:100%;max-height:92vh;overflow-y:auto;-webkit-overflow-scrolling:touch;background:rgba(15,20,12,0.96);border:1px solid rgba(200,168,75,0.45);border-radius:14px;padding:18px 16px;font-family:DM Mono,monospace;">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">';
  h+='<div style="font-family:Bebas Neue,sans-serif;font-size:1.1rem;letter-spacing:0.14em;color:var(--gold);">CARD STYLE</div>';
  h+='<button class="gb" onclick="document.getElementById(\'cdStyleOV\').remove()" style="min-height:44px;padding:6px 14px;">CLOSE</button>';
  h+='</div>';
  h+='<div style="font-family:DM Mono,monospace;font-size:0.58rem;color:var(--muted);margin-bottom:12px;line-height:1.5;">Tap a deck to switch every card game to that style. More decks unlock as you play.</div>';
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
    h+='<div style="font-family:DM Mono,monospace;font-size:0.55rem;color:var(--sage);opacity:0.85;margin-top:2px;">'+d.tag+'</div>';
    if(locked)h+='<div style="font-family:DM Mono,monospace;font-size:0.5rem;color:var(--muted);margin-top:4px;">🔒 Locked</div>';
    h+='</div>';
    h+='</button>';
  }
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
var _CD_BACK_ART='assets/games/cards/card-back.png';
var _CD_BACK_AR=208/146;               // the art's true aspect, for sizing helpers

// One face-down card. Pass width and height; height defaults to the real ratio
// so nobody has to remember it.
function _cdBackStyle(w,h,r){
  h=h||Math.round(w*_CD_BACK_AR);
  r=(r==null)?Math.max(3,Math.round(w*0.085)):r;
  // ⛔ THE EDGE IS NOT DECORATION. Hands are drawn overlapping (euchre leaves
  // 14-16px of each card showing), and this back is dense knotwork, so without
  // a hard edge five overlapped cards photograph as ONE strip of texture
  // instead of as five cards. The old flat rectangles got this for free from
  // their 1.5px border. A dark ring separates card from card, and the inner
  // cream hairline keeps the top card from disappearing into the felt.
  return 'width:'+w+'px;height:'+h+'px;border-radius:'+r+'px;'
    +"background-image:url('"+_CD_BACK_ART+"');background-size:100% 100%;"
    +'box-shadow:0 0 0 1px rgba(10,18,8,0.95),inset 0 0 0 1px rgba(232,220,200,0.20),'
    +'2px 2px 6px rgba(0,0,0,0.55);';
}
function _cdBackHtml(w,h,o){
  o=o||{};
  return '<div class="cd-back '+(o.cls||'')+'" style="'+_cdBackStyle(w,h,o.radius)+(o.style||'')+'"'
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
    s+='<div style="position:absolute;top:'+(i*2)+'px;left:'+(i*2)+'px;'+_cdBackStyle(w,h,o.radius)+'"></div>';
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
window._cdBackStyle=_cdBackStyle;
window._cdBackHtml=_cdBackHtml;
window._cdDeckHtml=_cdDeckHtml;
window._cdKitCss=_cdKitCss;
window._cdDeal=_cdDeal;
window._cdCancelDeal=_cdCancelDeal;
try{ _cdKitCss(); }catch(e){}


console.log('[LW] Card utilities loaded, style:',_cdStyle());
})();
