// ═══ LUCID WINDS — Shared Card Utilities ═══
// Loaded once when any card game (golf, klondike, spider, freecell, pyramid, tripeaks) is picked
(function(){
'use strict';
var G=window._G;

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

// Style: 'lw' (default Lucid Winds botanical) or 'classic' (standard pips)
function _cdStyle(){
  try{var s=localStorage.getItem('lw_card_style');return s==='classic'?'classic':'lw';}catch(e){return 'lw';}
}
function _cdSetStyle(s){
  try{localStorage.setItem('lw_card_style',s==='classic'?'classic':'lw');}catch(e){}
}

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
function _cdSuit(s){
  // Style-aware: returns the appropriate symbol set
  return _cdStyle()==='classic'?_CL_SYM[s]:_SUIT_SYM[s];
}
function _cdIsRed(s){return s===1||s===2}

function _cdBackStyle(el){
  if(_cdStyle()==='classic'){
    // Classic card back: navy diagonal weave pattern via CSS gradients
    el.style.backgroundImage='repeating-linear-gradient(45deg,#1a3a6a 0,#1a3a6a 8px,#244a7a 8px,#244a7a 16px),linear-gradient(135deg,#1a3a6a,#244a7a)';
    el.style.backgroundColor='#1a3a6a';
    el.style.backgroundSize='auto, auto';
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
    d.innerHTML='<div style="position:absolute;top:3px;left:4px;line-height:1;z-index:2;pointer-events:none">'
      +'<div style="color:'+clr+';font-size:clamp(.7rem,2.2vw,1rem);font-weight:700;text-shadow:0 1px 3px #000,0 0 8px #000">'+rnk+'</div>'
      +'</div>'
      +'<img src="'+pip+'" style="position:absolute;top:3px;right:4px;width:clamp(10px,3vw,18px);height:clamp(10px,3vw,18px);z-index:2;pointer-events:none;filter:drop-shadow(0 1px 3px #000)" alt="">';
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
    d.style.background='linear-gradient(180deg,#faf6ec,#ede5d0)';
    d.style.color=clr;
    d.style.border='1px solid rgba(0,0,0,0.18)';
    d.innerHTML=
      '<div style="position:absolute;top:3px;left:5px;line-height:1;text-align:center;color:'+clr+';font-family:Georgia,serif;pointer-events:none;">'
        +'<div style="font-size:clamp(.85rem,2.6vw,1.15rem);font-weight:700;">'+rnk+'</div>'
        +'<div style="font-size:clamp(.7rem,2vw,.95rem);line-height:1;margin-top:-1px;">'+sym+'</div>'
      +'</div>'
      +'<div style="position:absolute;bottom:3px;right:5px;line-height:1;text-align:center;color:'+clr+';font-family:Georgia,serif;transform:rotate(180deg);transform-origin:center;pointer-events:none;">'
        +'<div style="font-size:clamp(.85rem,2.6vw,1.15rem);font-weight:700;">'+rnk+'</div>'
        +'<div style="font-size:clamp(.7rem,2vw,.95rem);line-height:1;margin-top:-1px;">'+sym+'</div>'
      +'</div>'
      +'<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:'+clr+';font-size:clamp(1.4rem,5vw,2.2rem);opacity:0.85;pointer-events:none;">'+sym+'</div>';
  }else{
    d.className+=' gc-dn gc-classic';
    _cdBackStyle(d);
    d.style.color='';
    d.style.border='1px solid rgba(0,0,0,0.3)';
    d.innerHTML='';
  }
}

function _cdEl(card){
  var d=document.createElement('div');
  d.className='gc';
  if(_cdStyle()==='classic')_cdElClassic(d,card);
  else _cdElLW(d,card);
  d.setAttribute('data-s',card.s);
  d.setAttribute('data-r',card.r);
  return d;
}

// Toggle helper that any card game can wire into a button. Re-renders
// the current game by dispatching a custom event the game can listen
// for, OR by calling the game's New-Game handler if that's simpler.
function _cdToggleStyle(){
  var cur=_cdStyle();
  var nxt=cur==='classic'?'lw':'classic';
  _cdSetStyle(nxt);
  // Notify any listening game to re-render
  try{document.dispatchEvent(new CustomEvent('lw-card-style-change',{detail:{style:nxt}}));}catch(e){}
  return nxt;
}

// Expose on window for game scripts
window._cdMk=_cdMk;
window._cdSh=_cdSh;
window._cdRnk=_cdRnk;
window._cdSuit=_cdSuit;
window._cdIsRed=_cdIsRed;
window._cdBackStyle=_cdBackStyle;
window._cdEl=_cdEl;
window._cdArt=_cdArt;
window._cdStyle=_cdStyle;
window._cdSetStyle=_cdSetStyle;
window._cdToggleStyle=_cdToggleStyle;
window._SUIT_SYM=_SUIT_SYM;
window._SUIT_CLR=_SUIT_CLR;
window._SUIT_GRP=_SUIT_GRP;
window._RANK_SYM=_RANK_SYM;
window._SUIT_NAME=_SUIT_NAME;
window._CD_BASE=_CD_BASE;
window._CD_BACK=_CD_BACK;

console.log('[LW] Card utilities loaded — style:',_cdStyle());
})();
