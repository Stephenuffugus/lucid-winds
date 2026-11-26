// ═══════════════════════════════════════════════════════════════════════════
// THE CARD TABLE (round two, 22 Nov 2026) — one table for the twelve card games
//
// Owner, 18 Nov: a card pack with better tables, art that is "cheap, unique,
// not AI looking". 20 Nov: "if we have some ideas to make something look
// gorgeous and unique lets do it". Rules: docs/briefs/card-pack/STYLE.md.
//
// This file is the TABLE and the LIGHT only: walnut, a woven cloth let into it,
// one lamp, the maker's mark woven into the cloth, the rails, the dust, the
// grain, the toast's seat on the rail. The cards (stock, inks, backs) are the
// card kit's half: games/_cards.js listens here and skins its cards.
//
// ⛔ A CHOICE, NOT A DEFAULT. Plain (the old table) until the owner says
// otherwise. The player picks it in the Style sheet; it is remembered per
// device in localStorage lw_card_table ('lamp' | 'plain'). ?table=lamp or
// ?table=plain in the address wins for that visit (the pilot's switch).
//
// ⛔ LAYOUT IS NOT OURS. Every game keeps its own locked-screen layout
// (play/shell.js LOCK_BOX); the table is painted UNDER it and the light OVER it
// with pointer-events:none. The cloth follows the game's rails (the score line
// on top, the control strip below or beside), measured, never the reverse.
//
// One call per game:  LW_TABLE.register({id, cloth, redraw})
//   (the card games make it through window._cdLamp in _cards.js).
// Slow phones: textures are background images drawn once; the light is
// gradients; the flicker is opacity (compositor only); the motes are one small
// canvas at 30 fps, paused when hidden; the shadow pass reads layout once per
// game render (never per frame). Reduced motion: no motes, no flicker.
// ES5 only.
// ═══════════════════════════════════════════════════════════════════════════
(function(global){
'use strict';
var KEY='lw_card_table';
var D='assets/cards-pack/';
// The pack's twelve cloths (STYLE.md). The table never changes, only the cloth.
var CLOTH={
  moss:'#34513b', slate:'#2f4151', loden:'#284a40', ochre:'#6c5329',
  heather:'#4b3649', fairway:'#3e5633', oxblood:'#5b2c28', forest:'#27412f',
  rose:'#6a3338', indigo:'#29334d', juniper:'#374b41', umber:'#5c4a31'
};
// THE LAMP: one warm lamp just off the top left of the screen. Everything that
// is lit or shadowed asks this point.
var LAMP_X=0.16, LAMP_Y=-0.06;

function urlPref(){
  try{ var m=/[?&]table=(lamp|plain)(&|$)/.exec(location.search); return m?m[1]:''; }catch(e){ return ''; }
}
function pref(){
  var u=urlPref(); if(u)return u;
  try{ return localStorage.getItem(KEY)==='lamp'?'lamp':'plain'; }catch(e){ return 'plain'; }
}
function reduced(){
  try{ return !!(global.matchMedia&&global.matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return false; }
}
function hash32(s){ var h=2166136261; for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul?Math.imul(h,16777619):(h*16777619)|0; } return h>>>0; }

var reg=null, on=null, listeners=[];

// ── THE WEAVE: a plain-weave linen drawn once (see the size below). Threads are
// 3 css px apart (6 device px on a 2x phone: you can count them). Each thread has
// its own slub (thickness and tone); where a thread goes over, its top-left
// edge catches the lamp and its lower-right edge sinks. 96 px drawn, shown at
// 48 css px: threads 3 px apart, crisp on a 2x phone. Mid grey, laid on the
// cloth colour with soft-light, so one tile dyes to all twelve cloths.
function weaveUrl(){
  var S=96, T=6, n=S/T, cv=document.createElement('canvas'); cv.width=cv.height=S;
  var x=cv.getContext('2d'), seed=0x9e3779b9;
  function rnd(){ seed^=seed<<13; seed^=seed>>>17; seed^=seed<<5; return ((seed>>>0)%10000)/10000; }
  var warp=[], weft=[], i, j;
  for(i=0;i<n;i++){ warp.push(0.93+rnd()*0.14); weft.push(0.93+rnd()*0.14); }
  x.fillStyle='rgb(104,104,104)'; x.fillRect(0,0,S,S);            // the gaps between threads
  for(j=0;j<n;j++)for(i=0;i<n;i++){
    var over=(i+j)%2===0, px=i*T, py=j*T;
    // the thread on top in this cell, and the one under it showing at its sides
    var vert=over, tone=vert?warp[i]:weft[j];
    var base=Math.round(128*tone);
    var g=vert?x.createLinearGradient(px,0,px+T,0):x.createLinearGradient(0,py,0,py+T);
    g.addColorStop(0,'rgb('+(base+18)+','+(base+18)+','+(base+18)+')');
    g.addColorStop(0.45,'rgb('+(base+5)+','+(base+5)+','+(base+5)+')');
    g.addColorStop(1,'rgb('+(base-20)+','+(base-20)+','+(base-20)+')');
    x.fillStyle=g;
    if(vert)x.fillRect(px+1,py,T-2,T); else x.fillRect(px,py+1,T,T-2);
    // where the thread dives under the crossing one, it darkens
    x.fillStyle='rgba(0,0,0,0.13)';
    if(vert){ x.fillRect(px+1,py,T-2,1); x.fillRect(px+1,py+T-1,T-2,1); }
    else{ x.fillRect(px,py+1,1,T-2); x.fillRect(px+T-1,py+1,1,T-2); }
  }
  // a few long slubs: real linen is uneven along a thread
  for(var k=0;k<8;k++){
    var a=Math.floor(rnd()*n), l=18+Math.floor(rnd()*44), s0=Math.floor(rnd()*S);
    x.fillStyle=rnd()<0.5?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.09)';
    if(k%2)x.fillRect(a*T+1,s0,T-2,l); else x.fillRect(s0,a*T+1,l,T-2);
  }
  try{ return cv.toDataURL('image/png'); }catch(e){ return ''; }
}
// Large, soft unevenness in the dye: a cloth is never one flat colour.
function mottleUrl(){
  var S=96, cv=document.createElement('canvas'); cv.width=cv.height=S;
  var x=cv.getContext('2d'), seed=1234567;
  function rnd(){ seed=(seed*16807)%2147483647; return seed/2147483647; }
  x.fillStyle='rgb(128,128,128)'; x.fillRect(0,0,S,S);
  for(var i=0;i<46;i++){
    var cx=rnd()*S, cy=rnd()*S, r=8+rnd()*26, lt=rnd()<0.5;
    for(var dx=-1;dx<=1;dx++)for(var dy=-1;dy<=1;dy++){   // wraps, so the tile has no seam
      var g=x.createRadialGradient(cx+dx*S,cy+dy*S,0,cx+dx*S,cy+dy*S,r);
      g.addColorStop(0,lt?'rgba(255,255,255,0.09)':'rgba(0,0,0,0.11)'); g.addColorStop(1,'rgba(128,128,128,0)');
      x.fillStyle=g; x.fillRect(0,0,S,S);
    }
  }
  try{ return cv.toDataURL('image/png'); }catch(e){ return ''; }
}
// The fine grain over everything: one 128 px tile of light and dark specks,
// plain alpha (no blend mode, so it costs the compositor nothing).
function grainUrl(){
  var n=128,cv=document.createElement('canvas');cv.width=cv.height=n;
  var x=cv.getContext('2d'),d=x.createImageData(n,n),s=0x2545F491;
  for(var i=0;i<n*n;i++){
    s^=s<<13;s^=s>>>17;s^=s<<5; var v=(s>>>0)/4294967296;
    var o=i*4, lt=v>0.5; d.data[o]=d.data[o+1]=d.data[o+2]=lt?255:0;
    d.data[o+3]=Math.round(Math.abs(v-0.5)*2*(lt?8:22));
  }
  x.putImageData(d,0,0);
  try{ return cv.toDataURL('image/png'); }catch(e){ return ''; }
}

// ── THE MAKER'S MARK, woven into the cloth where the table is quiet: a wreath
// of leaves grown from the game's id, the game's name inside it, and the
// studio's name under that. Embroidered, not printed: each stitch is a lighter
// thread with its shadow to the lower right of it, so it reads raised, and it
// sits low enough in value that a card laid over it wins at once.
function drawMark(cv,name,id,px){
  var R=Math.round(px/2), W=px+40, H=px+40, dpr=2;
  cv.width=W*dpr; cv.height=H*dpr; cv.style.width=W+'px'; cv.style.height=H+'px';
  var x=cv.getContext('2d'); x.setTransform(dpr,0,0,dpr,0,0); x.clearRect(0,0,W,H);
  var cx=W/2, cy=H/2, h=hash32('mark:'+id);
  function rb(){ h^=h<<13; h^=h>>>17; h^=h<<5; return (h>>>0)/4294967296; }
  var nLeaf=16+Math.floor(rb()*8), tilt=0.5+rb()*0.5;
  function shapes(){
    x.lineWidth=1.6; x.beginPath(); x.arc(cx,cy,R,0,Math.PI*2); x.stroke();
    x.lineWidth=0.9; x.beginPath(); x.arc(cx,cy,R-6,0,Math.PI*2); x.stroke();
    // the wreath: leaves along the outer ring, a gap at the foot for the bloom
    for(var i=0;i<nLeaf;i++){
      var a=Math.PI/2+0.5+(i/(nLeaf-1))*(Math.PI*2-1.0);
      var lx=cx+Math.cos(a)*(R+7), ly=cy+Math.sin(a)*(R+7), out=(i%2?1:-1);
      x.save(); x.translate(lx,ly); x.rotate(a+Math.PI/2+out*tilt);
      x.beginPath(); x.moveTo(0,0); x.quadraticCurveTo(5,-4,11,0); x.quadraticCurveTo(5,4,0,0); x.fill(); x.restore();
    }
    // the bloom at the foot
    for(var p=0;p<5;p++){
      var pa=p/5*Math.PI*2-Math.PI/2;
      x.save(); x.translate(cx,cy+R+2); x.rotate(pa);
      x.beginPath(); x.moveTo(0,0); x.quadraticCurveTo(3,-3,7,0); x.quadraticCurveTo(3,3,0,0); x.fill(); x.restore();
    }
    x.textAlign='center'; x.textBaseline='middle';
    var fs=Math.max(13,Math.round(R*0.25));
    x.font='600 '+fs+'px Georgia,"Times New Roman",serif';
    spaced(String(name||'').toUpperCase(),cx,cy-fs*0.35,fs*0.22);
    x.font='italic '+Math.max(11,Math.round(fs*0.62))+'px Georgia,serif';
    x.fillText('Sky Wolf Studio',cx,cy+fs*0.75);
    x.lineWidth=0.9; x.beginPath(); x.moveTo(cx-R*0.38,cy+fs*0.25); x.lineTo(cx+R*0.38,cy+fs*0.25); x.stroke();
  }
  function spaced(t,mx,my,sp){
    var w=0,i; for(i=0;i<t.length;i++)w+=x.measureText(t[i]).width+(i?sp:0);
    // a long name tightens to fit inside the ring
    var maxW=R*1.5; if(w>maxW){ var k=maxW/w; x.font=x.font.replace(/(\d+)px/,function(m,n){return Math.max(11,Math.floor(n*k))+'px';}); w=0; for(i=0;i<t.length;i++)w+=x.measureText(t[i]).width+(i?sp*k:0); sp*=k; }
    var px0=mx-w/2;
    x.textAlign='left';
    for(i=0;i<t.length;i++){ x.fillText(t[i],px0,my); px0+=x.measureText(t[i]).width+sp; }
    x.textAlign='center';
  }
  // shadow of the stitches (lower right, away from the lamp), then the thread
  x.save(); x.translate(0.9,1.3); x.fillStyle=x.strokeStyle='rgba(0,0,0,0.30)'; shapes(); x.restore();
  x.fillStyle=x.strokeStyle='rgba(236,226,196,0.15)'; shapes();
}

// ── The dust in the beam: about twenty motes on one small canvas over the
// lamp's side of the screen. Device pixel 1, 30 fps, paused while hidden.
function motes(host){
  var cv=document.createElement('canvas'), x=cv.getContext('2d');
  var W=0,H=0,ms=[],raf=0,last=0,alive=true;
  var spr=document.createElement('canvas'); spr.width=spr.height=16;
  var sx=spr.getContext('2d'), g=sx.createRadialGradient(8,8,0,8,8,8);
  g.addColorStop(0,'rgba(255,236,200,0.95)'); g.addColorStop(0.35,'rgba(255,226,180,0.45)'); g.addColorStop(1,'rgba(255,220,170,0)');
  sx.fillStyle=g; sx.fillRect(0,0,16,16);
  var seed=7; function rnd(){ seed=(seed*16807)%2147483647; return seed/2147483647; }
  function size(){
    W=Math.round(Math.min(global.innerWidth,620)*0.8); H=Math.round(global.innerHeight*0.6);
    cv.width=W; cv.height=H; cv.style.width=W+'px'; cv.style.height=H+'px';
  }
  size();
  for(var i=0;i<20;i++)ms.push({x:rnd()*W,y:rnd()*H,r:0.5+rnd()*1.3,vx:0.05+rnd()*0.12,vy:-0.03-rnd()*0.08,ph:rnd()*6.28,w:0.004+rnd()*0.01});
  function frame(t){
    if(!alive)return;
    raf=requestAnimationFrame(frame);
    if(t-last<33)return; last=t;
    x.clearRect(0,0,W,H);
    for(var i=0;i<ms.length;i++){
      var m=ms[i]; m.ph+=m.w; m.x+=m.vx+Math.sin(m.ph)*0.06; m.y+=m.vy+Math.cos(m.ph*0.7)*0.04;
      if(m.x>W+8)m.x=-8; if(m.y<-8)m.y=H+8; if(m.x<-8)m.x=W+8;
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

function css(cloth){
  return ''
  // the page under the table is the dark of the room
  +'html.cd-lamp,html.cd-lamp body{background:#0b0704!important}'
  +'html.cd-lamp .shell-footer,html.cd-lamp #shell-install-btn{display:none!important}'
  // the header is the table's top rail: the walnut shows through it
  +'html.cd-lamp .shell-hdr{background:linear-gradient(180deg,rgba(12,7,3,.62),rgba(12,7,3,.30))!important;border-bottom:0!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;position:relative}'
  +'html.cd-lamp .shell-mount{position:relative;z-index:1}'
  +'html.cd-lamp #fg-ag{background:none!important}'
  // a game's own felt panel steps aside: the cloth is the table now
  +'html.cd-lamp .lt-pan{background:none!important;border-color:transparent!important;box-shadow:none!important}'
  // ── the table: walnut, and the cloth let into it between the rails
  +'#lt-table{position:fixed;inset:0;z-index:0;pointer-events:none;background:#1c120a url('+D+'walnut.webp) 0 0/300px 300px repeat;overflow:hidden}'
  +'#lt-table .lt-cl{position:absolute;left:var(--lt-l,7px);top:var(--lt-t,62px);right:var(--lt-r,7px);bottom:var(--lt-b,7px);border-radius:6px;overflow:hidden;'
  +'background-color:'+cloth+';background-image:var(--lt-weave),var(--lt-mottle);background-size:48px 48px,300px 300px;background-blend-mode:soft-light,soft-light;'
  // the walnut lip on the lamp side throws its shadow down and right onto the cloth
  +'box-shadow:inset 4px 6px 9px rgba(0,0,0,.66),inset 1px 1px 0 rgba(0,0,0,.6),inset -1px -1px 0 rgba(0,0,0,.35)}'
  // the pool: a warm ellipse with a soft but definite edge, centred where the lamp falls
  +'#lt-table .lt-lp{position:absolute;inset:0;background:radial-gradient(ellipse 78% 62% at 24% 16%,rgba(255,206,140,.36) 0%,rgba(255,200,130,.30) 34%,rgba(255,192,120,.16) 58%,rgba(255,186,110,.04) 74%,rgba(0,0,0,0) 82%)}'
  +'#lt-table .lt-mk{position:absolute;left:50%;top:var(--lt-my,60%);transform:translate(-50%,-50%);opacity:1}'
  // the rim: the walnut faces on the far sides of the cloth catch the lamp, brightest nearest it
  +'#lt-table .lt-rb{position:absolute;left:var(--lt-l,7px);right:var(--lt-r,7px);bottom:calc(var(--lt-b,7px) - 2px);height:2px;background:linear-gradient(90deg,rgba(255,206,150,.42),rgba(255,206,150,.16) 45%,rgba(255,206,150,0) 85%)}'
  +'#lt-table .lt-rr{position:absolute;top:var(--lt-t,62px);bottom:var(--lt-b,7px);right:calc(var(--lt-r,7px) - 2px);width:2px;background:linear-gradient(180deg,rgba(255,206,150,.42),rgba(255,206,150,.14) 45%,rgba(255,206,150,0) 85%)}'
  // the room's dark: falls off from the lamp to true black in the far corner, walnut included
  +'#lt-table .lt-dk{position:absolute;inset:0;background:'
  +'radial-gradient(ellipse 60% 44% at 12% 2%,rgba(255,200,140,.14) 0%,rgba(255,200,140,0) 100%),'
  +'radial-gradient(ellipse 150% 118% at 16% -6%,rgba(0,0,0,0) 34%,rgba(0,0,0,.30) 56%,rgba(0,0,0,.62) 78%,rgba(0,0,0,.90) 100%)}'
  // ── over the game, quiet: the cards stay the brightest thing on the table
  +'#lt-over{position:fixed;inset:0;z-index:60;pointer-events:none}'
  +'#lt-over .lt-gl{position:absolute;inset:0;background:radial-gradient(ellipse 150% 118% at 16% -6%,rgba(255,214,160,.07) 0%,rgba(0,0,0,0) 40%,rgba(0,0,0,.05) 70%,rgba(0,0,0,.14) 100%);animation:ltFlick 11s linear infinite}'
  +'@keyframes ltFlick{0%,61%,63.5%,100%{opacity:1}62%{opacity:.8}62.7%{opacity:.92}}'
  +'#lt-over .lt-gr{position:absolute;inset:0;background-size:128px 128px}'
  +'#lt-over canvas{position:absolute;left:0;top:0}'
  +'@media (prefers-reduced-motion:reduce){#lt-over .lt-gl{animation:none!important}#lt-over canvas{display:none!important}}'
  // ── the rails: the score is chalked on the top rail, the controls are brass-edged plates on the wood
  +'html.cd-lamp #fg-ag>.gu-bar{background:none!important;font-family:Georgia,serif!important;font-style:italic;color:rgba(236,226,206,.78)!important;text-shadow:0 0 1px rgba(236,226,206,.35),1px 1px 0 rgba(0,0,0,.55)}'
  +'html.cd-lamp #fg-ag>.gu-bar strong{color:#f1e7d2!important;font-style:normal;letter-spacing:.04em}'
  +'html.cd-lamp #fg-ag .gm{font-family:Georgia,serif!important;color:rgba(236,226,206,.86)!important}'
  +'html.cd-lamp #fg-ag .gcr .gb,html.cd-lamp #fg-ag .gcr .gsl{font-family:Georgia,serif!important;font-weight:400!important;letter-spacing:.01em!important;color:#efe3cb!important;'
  +'background-color:rgba(26,15,7,.72)!important;border:1px solid rgba(214,170,98,.34)!important;border-radius:9px!important;'
  +'box-shadow:inset 0 1px 0 rgba(255,232,190,.10),inset 0 -1px 0 rgba(0,0,0,.4),1px 2px 3px rgba(0,0,0,.5)!important}'
  +'html.cd-lamp #fg-ag .gcr .gb:disabled{opacity:.5!important}'
  // ── the toast's seat: a brass plate let into the top rail, where the title is
  +'#lt-plate{position:absolute;top:50%;z-index:3;transform:translate(-50%,-50%) scale(.96);opacity:0;pointer-events:none;transition:opacity .22s,transform .22s;'
  +'padding:5px 12px;border-radius:5px;font:600 14px/1.15 Georgia,"Times New Roman",serif;letter-spacing:.03em;color:#2b1d08;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-sizing:border-box;'
  +'background:linear-gradient(160deg,#e9cd86 0%,#c9a24f 42%,#a37e32 100%);text-shadow:0 1px 0 rgba(255,236,190,.55);'
  +'box-shadow:inset 0 1px 0 rgba(255,244,210,.6),inset 0 -1px 0 rgba(80,52,12,.5),1px 2px 3px rgba(0,0,0,.55)}'
  +'#lt-plate.show{opacity:1;transform:translate(-50%,-50%) scale(1)}'
  +'html.cd-lamp .shell-title{transition:opacity .1s}'
  +'html.cd-lamp .shell-hdr.lt-plating .shell-title{opacity:0}'
  +'@media (prefers-reduced-motion:reduce){#lt-plate,html.cd-lamp .shell-title{transition:none!important}}'
  // the shell's own toast never shows under the lamp: it covered the buttons
  +'html.cd-lamp #shell-toast{display:none!important}';
}

// ── where the cloth goes: between the rails the game already has.
// Top rail = the header, plus the score line if the game shows one first.
// Bottom rail = a control strip across the foot. Side rail = a control column
// at the right (a landscape phone). Measured on render and resize only.
function measure(){
  if(!on)return;
  var W=global.innerWidth, H=global.innerHeight, ag=document.getElementById('fg-ag');
  var hdr=document.querySelector('.shell-hdr');
  var t=hdr?Math.round(hdr.getBoundingClientRect().bottom):0, b=4, r=4, l=4, z=1;
  if(ag){
    z=parseFloat(ag.style.zoom)||1;
    var kids=ag.children, i, el, rc;
    for(i=0;i<kids.length;i++){
      el=kids[i]; if(!el.classList)continue;
      if(el.classList.contains('gu-bar')||el.classList.contains('gm')){
        rc=el.getBoundingClientRect();
        // only a score line on top, not one between the table and its controls
        if(rc.height>2&&rc.top<t+40&&rc.bottom>t)t=Math.max(t,Math.round(rc.bottom));
        continue;
      }
      break;
    }
    var rail=reg&&reg.rail?ag.querySelector(reg.rail):null;
    if(!rail){ for(i=0;i<kids.length;i++)if(kids[i].classList&&kids[i].classList.contains('gcr')){ rail=kids[i]; break; } }
    if(rail){
      rc=rail.getBoundingClientRect();
      if(rc.height>8&&rc.width>8){
        if(rc.left>W*0.5&&rc.height>H*0.3)r=Math.max(4,Math.round(W-rc.left+6));       // a column at the right
        else if(rc.top>H*0.5&&rc.width>W*0.4)b=Math.max(4,Math.round(H-rc.top+6));     // a strip at the foot
      }
    }
  }
  var tb=on.tb.style;
  tb.setProperty('--lt-t',(t+2)+'px'); tb.setProperty('--lt-b',b+'px'); tb.setProperty('--lt-r',r+'px'); tb.setProperty('--lt-l',l+'px');
  // the mark sits in the middle of the lower cloth, where the table is quiet
  var ch=H-b-(t+2), cw=W-r-l, mk=Math.round(Math.max(120,Math.min(cw*0.5,ch*0.42,240)));
  var key=mk+'|'+cw+'x'+ch;
  if(on.markKey!==key){ on.markKey=key; drawMark(on.mk,reg.name||(global.LW_PLAY&&global.LW_PLAY.name)||'',reg.id,mk); }
  tb.setProperty('--lt-my',Math.round(ch*0.66)+'px');
  on.zoom=z;
}

// ── shadows that know where the lamp is: every card's shadow falls straight
// away from it, longer and softer the farther the card lies from the lamp.
// One read of each card's box per render, written as three variables.
function shadows(){
  if(!on)return;
  var ag=document.getElementById('fg-ag'); if(!ag)return;
  var W=global.innerWidth, H=global.innerHeight, Lx=W*LAMP_X, Ly=H*LAMP_Y, diag=Math.sqrt(W*W+H*H);
  var cards=ag.querySelectorAll('.cd-lp,.cd-lp-dn,.cd-lpt'+(reg&&reg.cards?','+reg.cards:'')), z=on.zoom||1;
  // ALL the reads first, then all the writes: a write between two reads would
  // make the browser lay the page out again for every card (measured: 2.5 s a
  // render on a slow phone instead of a few ms)
  var rs=[], i;
  for(i=0;i<cards.length;i++)rs.push(cards[i].getBoundingClientRect());
  for(i=0;i<cards.length;i++){
    var c=cards[i], r=rs[i]; if(!r.width)continue;
    var vx=r.left+r.width/2-Lx, vy=r.top+r.height/2-Ly, d=Math.sqrt(vx*vx+vy*vy)||1, f=d/diag;
    var len=(2+7*f)/z, ux=vx/d, uy=vy/d;
    // one string, one write; unchanged cards are left alone
    var v='--shx:'+(ux*len).toFixed(1)+'px;--shy:'+(uy*len).toFixed(1)+'px;--shb:'+((4+9*f)/z).toFixed(1)+'px;--sha:'+(0.42-0.16*f).toFixed(2);
    if(c._ltSh===v)continue; c._ltSh=v;
    c.style.setProperty('--shx',(ux*len).toFixed(1)+'px');
    c.style.setProperty('--shy',(uy*len).toFixed(1)+'px');
    c.style.setProperty('--shb',((4+9*f)/z).toFixed(1)+'px');
    c.style.setProperty('--sha',(0.42-0.16*f).toFixed(2));
  }
}
var pend=0;
function later(){ if(pend||!on)return; pend=requestAnimationFrame(function(){ pend=0; measure(); shadows(); }); }

function mount(){
  if(on||!reg)return;
  var root=document.documentElement;
  root.classList.add('cd-lamp');
  var st=document.createElement('style'); st.id='lt-css'; st.textContent=css(CLOTH[reg.cloth]||CLOTH.moss); document.head.appendChild(st);
  var tb=document.createElement('div'); tb.id='lt-table'; tb.setAttribute('aria-hidden','true');
  tb.innerHTML='<div class="lt-cl"><div class="lt-lp"></div></div><div class="lt-rb"></div><div class="lt-rr"></div><div class="lt-dk"></div>';
  var mk=document.createElement('canvas'); mk.className='lt-mk'; tb.firstChild.appendChild(mk);
  document.body.insertBefore(tb,document.body.firstChild);
  var ov=document.createElement('div'); ov.id='lt-over'; ov.setAttribute('aria-hidden','true');
  ov.innerHTML='<div class="lt-gl"></div><div class="lt-gr"></div>';
  document.body.appendChild(ov);
  var gu=grainUrl(); if(gu)ov.querySelector('.lt-gr').style.backgroundImage='url('+gu+')';
  var wv=weaveUrl(), mt=mottleUrl();
  tb.style.setProperty('--lt-weave',wv?'url('+wv+')':'none');
  tb.style.setProperty('--lt-mottle',mt?'url('+mt+')':'none');
  on={tb:tb,ov:ov,st:st,mk:mk,motes:reduced()?null:motes(ov),markKey:''};
  var hdr=document.querySelector('.shell-hdr');
  if(hdr){ var pl=document.createElement('div'); pl.id='lt-plate'; pl.setAttribute('aria-hidden','true'); hdr.appendChild(pl); on.plate=pl; on.hdr=hdr; }
  var rt=0;
  on.onRs=function(){ clearTimeout(rt); rt=setTimeout(function(){ if(on&&on.motes)on.motes.resize(); later(); },120); };
  global.addEventListener('resize',on.onRs);
  global.addEventListener('lw-lock-resize',on.onRs);
  var ag=document.getElementById('fg-ag');
  if(ag&&global.MutationObserver){ on.mo=new MutationObserver(later); on.mo.observe(ag,{childList:true,subtree:true}); }
  if(ag&&global.ResizeObserver){ on.ro=new ResizeObserver(later); on.ro.observe(ag); }
  later();
}
function unmount(){
  if(!on)return;
  if(pend){ cancelAnimationFrame(pend); pend=0; }
  global.removeEventListener('resize',on.onRs);
  global.removeEventListener('lw-lock-resize',on.onRs);
  if(on.mo)on.mo.disconnect(); if(on.ro)on.ro.disconnect();
  if(on.motes)on.motes.stop();
  var ns=[on.tb,on.ov,on.st,on.plate];
  for(var i=0;i<ns.length;i++)if(ns[i]&&ns[i].parentNode)ns[i].parentNode.removeChild(ns[i]);
  if(on.hdr)on.hdr.classList.remove('lt-plating');
  document.documentElement.classList.remove('cd-lamp');
  on=null;
}
function apply(want){
  var was=!!on;
  if(want)mount(); else unmount();
  if(was===!!on)return;
  for(var i=0;i<listeners.length;i++){ try{ listeners[i](!!on); }catch(e){} }
  if(reg&&typeof reg.redraw==='function'){ try{ reg.redraw(); }catch(e){} }
  later();
}

// The toast on the rail: a brass plate where the title was, gone in 1.5 s.
// It covers no control. Returns false when the table is off (the shell then
// shows its own toast).
var plT=0;
function toast(msg){
  if(!on||!on.plate||!on.hdr)return false;
  var t=document.getElementById('shell-title'), hr=on.hdr.getBoundingClientRect(), pl=on.plate;
  var tr=t?t.getBoundingClientRect():null;
  // the free span of the rail is the title's own box (it is the one item in
  // the header that yields); the plate never leaves it, so it covers no control
  var cx=tr&&tr.width>30?tr.left+tr.width/2-hr.left:hr.width/2;
  var maxW=tr&&tr.width>30?Math.floor(tr.width):120, txtW=0;
  try{ if(t&&t.firstChild){ var rg=document.createRange(); rg.selectNodeContents(t); txtW=rg.getBoundingClientRect().width; } }catch(e){}
  // ...and is wide enough to hide the title's letters while the title fades
  pl.style.left=cx+'px'; pl.style.maxWidth=maxW+'px'; pl.style.minWidth=Math.min(maxW,Math.ceil(txtW)+20)+'px';
  pl.textContent=msg;
  pl.style.fontSize=String(msg).length>12?'12px':'14px';
  pl.style.whiteSpace=String(msg).length>12?'normal':'nowrap';
  on.hdr.classList.add('lt-plating'); pl.classList.add('show');
  clearTimeout(plT);
  plT=setTimeout(function(){ if(!on)return; pl.classList.remove('show'); on.hdr.classList.remove('lt-plating'); },1500);
  return true;
}

global.LW_TABLE={
  CLOTH:CLOTH,
  LAMP:{x:LAMP_X,y:LAMP_Y},
  pref:pref,
  isOn:function(){ return !!on; },
  // a game's one call. o = {id, cloth, name, redraw, rail, pan, cards}
  //   cards = a selector for a game's own card faces, so they take the lamp's shadows too
  //   pan = the game's own felt panel, if it paints one (it is cleared under the lamp)
  register:function(o){
    reg=o||{};
    if(reg.pan&&reg.pan.classList)reg.pan.classList.add('lt-pan');
    if(global._lwRegisterGameCleanup)global._lwRegisterGameCleanup(function(){ unmount(); reg=null; });
    if(pref()==='lamp'){ mount(); for(var i=0;i<listeners.length;i++){ try{ listeners[i](true); }catch(e){} } }
    return !!on;
  },
  // the Style sheet's choice, remembered per device; the address no longer wins once the player chooses
  set:function(v){
    v=v==='lamp'?'lamp':'plain';
    try{ localStorage.setItem(KEY,v); }catch(e){}
    try{ if(urlPref()&&global.history&&history.replaceState){ history.replaceState(null,'',location.pathname+location.search.replace(/([?&])table=(lamp|plain)(&|$)/,function(m,a,b,c){ return c?a:''; }).replace(/[?&]$/,'')+location.hash); } }catch(e){}
    apply(v==='lamp');
  },
  onChange:function(fn){ if(listeners.indexOf(fn)<0)listeners.push(fn); },
  relayout:later,
  toast:toast
};
})(window);
