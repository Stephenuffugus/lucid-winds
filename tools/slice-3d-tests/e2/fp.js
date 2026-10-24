// a dive's layout fingerprint: every piece's position (rounded) in a fixed order, FNV-1a 32 bit. The same function is
// pasted into the suite's row [19]; here it runs on the source named by SRCF (v6.5) and on the working tree.
function fp(W){ var L=['blocks','items','crystals','pads','slabs','wasps','planks','thorns','verbs'], parts=[W.floorY];
  L.forEach(function(n){ (W[n]||[]).forEach(function(e){ parts.push(n[0], Math.round((e.x!=null?e.x:e.cx||0)*1000), Math.round((e.y||0)*1000), Math.round((e.w||e.r||0)*1000)); }); });
  var s=parts.join(','), h=0x811c9dc5; for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0; } return h.toString(16)+':'+s.length; }
var W=require('./world.js'), out={};
[1,6,11,21,26,31,36].forEach(function(l){ var g=W.dive(l,77); out[l]=fp(g.world); });
console.log(JSON.stringify(out));
