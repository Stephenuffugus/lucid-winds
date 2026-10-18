/* MOONGRAFT, the ONE renderer (W3, 18 Oct 2026, Astra MOONGRAFT-D01 and D02).

   The TV, every phone, the host's own seat and the saved PNG card all paint the plant through THIS file. It used to be
   two hand copies (host.js paintPlant and player.js paintComposite) that "had to stay identical"; now there is nothing
   to keep in step. Loaded by host.js and player.js before they boot (same ?v= as the module that asked for it).

   A card is plain data, so it can travel over the transport and be repainted anywhere:
     { v, palette, widths, layers:[{key, zone:[x,y,w,h], z, st:[{i,c,w,p:[x0,y0,x1,y1,...]}]}], name, haiku }
   Stroke points are 0..1000 inside the layer's own zone. Paint order is z, then key (so equal z can never swap).

   ⭐ THE CONNECTOR (D01). When no stem is drawn (a room of three has pot, bloom and leaves; or the stem player left
   their part blank) a thin neutral stem is painted BEHIND the player art, from the pot's rim up to the bloom, so the
   plant reads as assembled on purpose instead of three floating shapes. It is part of the canonical picture, so the
   TV, the phones and the saved card all show it. */
(function(){
'use strict';
var VERSION='mgr-1';
var BG_TOP='#0f1826', BG_BOT='#05070a', CONNECTOR='#8a9178';
var SPINE_X=0.5, SPINE_TOP=0.30, SPINE_BOT=0.62;   /* card space: just inside the bloom zone down to the pot rim */
var PART={pot:'pot', bloom:'flower', leaves:'leaves', stem:'stem', companion:'little creature', aura:'glow', roots:'roots', sky:'sky'};
var PLURAL={leaves:1, roots:1};

function needsConnector(layers){
  for(var i=0;i<layers.length;i++){
    var L=layers[i];
    if(String(L.key).split('_r')[0]==='stem' && L.st && L.st.length) return false;
  }
  return true;
}
function ordered(layers){
  return (layers||[]).slice().sort(function(a,b){ return (a.z-b.z) || (a.key<b.key?-1:a.key>b.key?1:0); });
}
function paintConnector(ctx,W,H){
  var x=SPINE_X*W, y0=SPINE_BOT*H, y1=SPINE_TOP*H;
  ctx.save();
  ctx.strokeStyle=CONNECTOR; ctx.globalAlpha=0.85;
  ctx.lineCap='round'; ctx.lineWidth=Math.max(2,W*0.012);
  ctx.beginPath();
  ctx.moveTo(x,y0);
  /* a gentle S, so it reads as a stem and not a ruler */
  ctx.bezierCurveTo(x-W*0.035,y0-(y0-y1)*0.35, x+W*0.035,y0-(y0-y1)*0.65, x,y1);
  ctx.stroke();
  ctx.restore();
}
function paintLayer(ctx,L,palette,widths,W,H){
  var st=L.st; if(!st||!st.length) return;
  var z=L.zone, ox=z[0]*W, oy=z[1]*H, zw=z[2]*W, zh=z[3]*H;
  ctx.lineCap='round'; ctx.lineJoin='round';
  for(var i=0;i<st.length;i++){
    var s=st[i], p=s.p;
    if(!p||p.length<2) continue;
    ctx.strokeStyle=palette[s.c%palette.length];
    ctx.lineWidth=Math.max(1,(widths[s.w%widths.length]/320)*zw);
    ctx.beginPath();
    ctx.moveTo(ox+(p[0]/1000)*zw, oy+(p[1]/1000)*zh);
    for(var j=2;j<p.length;j+=2) ctx.lineTo(ox+(p[j]/1000)*zw, oy+(p[j+1]/1000)*zh);
    if(p.length===2) ctx.lineTo(ox+(p[0]/1000)*zw+0.6, oy+(p[1]/1000)*zh+0.6);
    ctx.stroke();
  }
}
/* steps(card): the reveal order, one entry per painted thing, the connector included. The grow animation shows the
   first n of these, on the TV and on every phone, so the plant assembles in the same order everywhere. */
function steps(card){
  var arr=ordered(card.layers), out=[], conn=needsConnector(card.layers), placed=!conn;
  for(var i=0;i<arr.length;i++){
    if(!placed && arr[i].z>35){ out.push({conn:true}); placed=true; }
    out.push({layer:arr[i]});
  }
  if(!placed) out.push({conn:true});
  return out;
}
/* paint(ctx, card, W, H, upTo): the whole plant, or only its first upTo steps */
function paint(ctx,card,W,H,upTo){
  var pal=card.palette||['#e8dcc8'], wid=card.widths||[3,7,14];
  ctx.clearRect(0,0,W,H);
  var g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,BG_TOP); g.addColorStop(1,BG_BOT);
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  var s=steps(card), n=(upTo===undefined||upTo===null)?s.length:upTo;
  for(var i=0;i<n&&i<s.length;i++){
    if(s[i].conn) paintConnector(ctx,W,H);
    else paintLayer(ctx,s[i].layer,pal,wid,W,H);
  }
}

/* ---------- the saved card: a clean 1200 x 1600 PNG (D04) ----------
   The plant (3:4), its name and poem when there is one, and the growers' names ONLY when the player turns on
   "Include our names". No room code, no device, no place: nothing on it but what the room made. */
function wrapLines(ctx,text,maxW){
  var words=String(text).split(' '), lines=[], cur='';
  for(var i=0;i<words.length;i++){
    var t=cur?cur+' '+words[i]:words[i];
    if(ctx.measureText(t).width>maxW&&cur){ lines.push(cur); cur=words[i]; } else cur=t;
  }
  if(cur) lines.push(cur);
  return lines;
}
function cardCanvas(card,opts){
  opts=opts||{};
  var W=1200, H=1600, cv=document.createElement('canvas');
  cv.width=W; cv.height=H;
  var c=cv.getContext('2d');
  c.fillStyle='#07090d'; c.fillRect(0,0,W,H);
  var aw=900, ah=1200, ax=(W-aw)/2, ay=56;
  var art=document.createElement('canvas'); art.width=aw; art.height=ah;
  paint(art.getContext('2d'),card,aw,ah);
  c.drawImage(art,ax,ay);
  c.strokeStyle='rgba(200,168,75,.55)'; c.lineWidth=3;
  c.strokeRect(ax-1.5,ay-1.5,aw+3,ah+3);
  c.textAlign='center'; c.textBaseline='top';
  var y=ay+ah+30;
  var name=card.name||'Our moon plant';
  c.fillStyle='#ffd77a'; c.font='600 52px Georgia, "DejaVu Serif", serif';
  var nl=wrapLines(c,name,W-160);
  for(var i=0;i<nl.length&&i<2;i++){ c.fillText(nl[i],W/2,y); y+=62; }
  if(card.haiku){
    y+=8; c.fillStyle='#e8dcc8'; c.font='italic 30px Georgia, "DejaVu Serif", serif';
    var hk=[card.haiku.line1,card.haiku.line2,card.haiku.line3];
    for(var h=0;h<3;h++){ if(hk[h]){ c.fillText(hk[h],W/2,y); y+=40; } }
  }
  if(opts.names&&opts.names.length){
    y+=8; c.fillStyle='#a8ad98'; c.font='24px "DejaVu Sans", Arial, sans-serif';
    var bl=wrapLines(c,'Grown together by '+opts.names.join(', '),W-200);
    for(var b=0;b<bl.length&&b<2;b++){ c.fillText(bl[b],W/2,y); y+=32; }
  }
  c.fillStyle='rgba(168,173,152,.7)'; c.font='20px "DejaVu Sans", Arial, sans-serif';
  c.textBaseline='bottom'; c.fillText('Moongraft',W/2,H-18);
  return cv;
}

/* the words for a layer: "Your leaves meet the pot at this edge." / "Your pot meets the flower at this edge." */
function partName(key){ var b=String(key).split('_r')[0]; return PART[b]||b; }
function meets(key){ return PLURAL[String(key).split('_r')[0]]?'meet':'meets'; }

window.MoongraftRender={VERSION:VERSION, paint:paint, steps:steps, needsConnector:needsConnector, ordered:ordered,
  cardCanvas:cardCanvas, partName:partName, meets:meets, SPINE_X:SPINE_X, SPINE_TOP:SPINE_TOP, SPINE_BOT:SPINE_BOT};
})();
