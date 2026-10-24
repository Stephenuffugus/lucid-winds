// Which arrival states carve a whole 10 slab column with no input? (the real step; knife arrives at the contact height)
var W=require('./world.js');
function synth(colX){ var stk={}, slabs=[]; for(var k=0;k<10;k++)slabs.push({x:colX,y:-k*1.32,w:3.4,h:1.15,cut:false,stk:stk,col:0,inner:0,mesh:null,gline:null,ws:null});
  return {ff:true, ws:W.ctx.worldSet('mossy_canyon'), SW:9.2, floorY:-1e4, len:1e4, slabs:slabs, items:[], pads:[], crystals:[], thorns:[], wasps:[], planks:[], verbs:[], blocks:[], zones:[[1,9.6,0]], zoneMats:[], bands:[[1,0]], bandMats:[], wallX:1e9}; }
function trial(o){ var w=synth(0), G={mode:'ff', world:w, x:o.dx, y:0.575+2.1, vx:o.vx, vy:-19, ang:o.ang, w:o.w, t:0, score:0, combo:0, comboBest:0, slices:0, done:false, lastSide:1, freezeT:0, chips:0};
  W.use(G); var woods=0, sfx=W.ctx.SFX; W.ctx.SFX=new Proxy({},{get:function(t,k){ return function(){ if(k==='wood')woods++; }; }});
  try{ for(var n=0;n<200&&G.y>-14;n++)W.step(G,1,0); } finally { W.ctx.SFX=sfx; }
  return {cut:w.slabs.filter(function(s){return s.cut;}).length, woods:woods, failed:!!G.failed}; }
var rows=[];
[0,0.5,1,1.5,2,2.5].forEach(function(dx){ var line='dx '+dx.toFixed(1)+': ';
  [90,60,45,30,20,10].forEach(function(deg){ var ok=0, tot=0;
    [-1,1].forEach(function(sg){ [0,1,2].forEach(function(w){ [0,1.5,3].forEach(function(vx){ [-1,1].forEach(function(vs){
      var r=trial({dx:dx, ang:Math.PI/2+sg*(Math.PI/2-deg*Math.PI/180), w:w*vs, vx:vx*vs}); tot++; if(r.cut===10&&!r.woods)ok++; }); }); }); });
    line+=' '+deg+'deg '+ok+'/'+tot; });
  rows.push(line); });
console.log('full carve (10 of 10, no bonk) by offset dx and blade angle above horizontal (deg = how far below horizontal the blade points):\n'+rows.join('\n'));
