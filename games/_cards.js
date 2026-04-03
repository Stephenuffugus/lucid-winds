// ═══ LUCID WINDS — Shared Card Utilities ═══
// Loaded once when any card game (golf, klondike, spider, freecell, pyramid, tripeaks) is picked
(function(){
'use strict';
var G=window._G;

var _SUIT_SYM=['🍄','🌸','🐝','🐦'];
var _SUIT_CLR=['#6dbf4a','#daa520','#e8c94a','#48c9a4'];
var _SUIT_GRP=['green','gold','gold','green'];
var _RANK_SYM=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
var _SUIT_NAME=['shroom','flower','bee','bird'];
var _CD_BASE='assets/games/cards/';
var _CD_BACK=_CD_BASE+'playing-card-backs.png';

// Preload card images
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
function _cdSuit(s){return _SUIT_SYM[s]}
function _cdIsRed(s){return s===1||s===2}

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

// Expose on window for game scripts
window._cdMk=_cdMk;
window._cdSh=_cdSh;
window._cdRnk=_cdRnk;
window._cdSuit=_cdSuit;
window._cdIsRed=_cdIsRed;
window._cdBackStyle=_cdBackStyle;
window._cdEl=_cdEl;
window._cdArt=_cdArt;
window._SUIT_SYM=_SUIT_SYM;
window._SUIT_CLR=_SUIT_CLR;
window._SUIT_GRP=_SUIT_GRP;
window._RANK_SYM=_RANK_SYM;
window._SUIT_NAME=_SUIT_NAME;
window._CD_BASE=_CD_BASE;
window._CD_BACK=_CD_BACK;

console.log('[LW] Card utilities loaded');
})();
