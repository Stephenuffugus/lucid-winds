// The REAL game in a node vm, minus the pictures: buildFreefall (with ffSegments, every piece builder and the verbs) and
// stepWorld are pulled out of satellites/slice-3d/index.html as they are, and every drawing, sound and DOM call is a stub
// that answers anything. So a dive is the very dive the game builds (same rng draws) and a step is the very step it takes.
// Use: var W=require('./world.js'); var g=W.dive(lvl, salt); W.step(g, n, hold); see the exports.
var fs=require('fs'), vm=require('vm');
var SRC=fs.readFileSync(process.env.SRCF||'/workspaces/lucid-winds/satellites/slice-3d/index.html','utf8');
function grab(name){ var i=SRC.indexOf('function '+name+'('); if(i<0)throw new Error('no '+name);
  var j=SRC.indexOf('{',i), d=0, k=j; for(;k<SRC.length;k++){ var c=SRC[k]; if(c==='{')d++; else if(c==='}'){ d--; if(d===0)break; } } return SRC.slice(i,k+1); }
function grabVar(name){ var i=SRC.indexOf('var '+name+'='); if(i<0)throw new Error('no var '+name);
  var j=SRC.indexOf('=',i)+1, d=0, k=j, s=false; for(;k<SRC.length;k++){ var c=SRC[k]; if(c==='['||c==='{'||c==='(')d++; else if(c===']'||c==='}'||c===')')d--; else if(c===';'&&d===0)break; } return SRC.slice(i,k+1); }
// a stub that answers everything: any property, any call, any new, numbers as 0
function stubObj(){ var o=function(){ return P; }; var P=new Proxy(o,{ get:function(t,k){ if(k==='position'||k==='scale'||k==='rotation')return {set:function(){},x:0,y:0,z:0,copy:function(){}}; if(k===Symbol.toPrimitive)return function(){ return 0; }; if(k==='then')return undefined; return P; }, set:function(){ return true; }, construct:function(){ return P; }, apply:function(){ return P; } }); return P; }
var S=stubObj();
function wsStub(id){ return new Proxy({id:id, props:{}}, {get:function(t,k){ return (k in t)?t[k]:S; }}); }
var ctx={ Math:Math, console:console, Object:Object, JSON:JSON, Array:Array, isFinite:isFinite, parseInt:parseInt,
  THREE:S, scene:S, document:S, window:{}, performance:{now:function(){ return 0; }},
  addMesh:function(m){ return m; }, disposeMesh:function(){}, clearWorld:function(){}, setFog:function(){}, ffTop:function(){}, ffDecor:function(){},
  depthRing:function(){}, backPlane:function(){ return S; }, textPlate:function(){ return S; }, boxUV:function(){}, slabUV:function(){},
  propCentred:function(){ return S; }, propSprite:function(){ return S; }, propReady:function(){ return false; }, jellyMat:function(){ return S; },
  worldSet:wsStub, warmWorld:function(){}, artLoaded:function(){ return false; }, artJson:function(){}, artTex:function(){}, artUp:function(){},
  fxPre:function(){}, fxBurst:function(){}, fxHold:function(){}, looseMesh:function(){}, crustTex:function(){ return S; }, crackTex:function(){ return S; },
  makeFruitMesh:function(){ return S; }, spawnSparks:function(){}, spawnChunk:function(){}, spawnHalf:function(){}, spawnHalfArt:function(){},
  popup:function(){}, fatalMark:function(){}, $:function(){ return S; }, SFX:new Proxy({},{get:function(){ return function(){}; }}),
  FRUITART:{halfMat:null, half:{}}, ART:{j:null, tex:{}}, SET:{rm:false, rp:false}, PROG:{}, PULSES:[], CRK:[], FXB:[],
  G:null, running:false, finishLevel:function(){ ctx.__finished=true; }, endlessTick:function(){}, ripBanner:function(){},
  G_FFSALT:0, G_ENDLESS:false, VERBS_OFF:false, HZ:null, SLB:null, BW:null, MESHSINK:null, ECHL:[], VMAT:null
};
vm.createContext(ctx);
// constants and data as the game has them
['GRAV','TAPVY','RUNVX','TAPW','KR'].forEach(function(n){ var m=SRC.match(new RegExp('var [^;]*\\b'+n+'=([0-9.\\-]+)')); if(m)ctx[n]=+m[1]; });
vm.runInContext('var GRAV_FF=21, FF_TERM=19, FF_STEER=30, FF_SPIN=17, FF_MAXW=7.5, KSCALE=0.55, KLEN=5.70*0.55, KHH=1.3*0.55, KR=1.5;', ctx);
var chk=SRC.match(/var GRAV_FF=21, FF_TERM=19, FF_STEER=30, FF_SPIN=17, FF_MAXW=7\.5;/); if(!chk)throw new Error('Freefall constants moved');
['WORLD_IDS','FF_WORLDS','VERB_OF','VERB_HOST','VERB_FX','FX_USE','FRUIT','GOURD','GOLDF','PINATA','WOOD','WOOD_D','LEAF','CAP','CRYSTAL','ECH_LISTS'].forEach(function(n){ try{ vm.runInContext(grabVar(n), ctx); }catch(e){ if(!/no var/.test(e.message))throw e; } });
vm.runInContext('var ENDLESS_BAND=300, ECH_H=100, LANTERN_DELAY=0.12, DEEP_TIDE_GRAV=GRAV_FF, STEP=1/120;', ctx);
['mulberry32','buildFreefall','ffSegments','fruitAt','crystal','thornAt','waspAt','plankAt','boomAt','swingFruit','branchOver',
 'chimeAt','lanternLineAt','iceAt','loafAt','ropeY','vmats','verbLog','verbCut','verbAward','cutTube','cutRope','cutLoaf','iceStage','verbStep','verbTick',
 'stepWorld','kReachX','ffGrav','ffWall','ffPad','sliceSlab','sliceFruit','ffBonk','boomGourd','hitCrystal','hitSting'].forEach(function(n){
  try{ vm.runInContext(grab(n), ctx); }catch(e){ if(/^no /.test(e.message))console.error('missing', n); else throw e; } });
// Part E2 (Clean Slice): the game's own rule is pulled when it exists, so this harness runs on v6.5 and on the E2 build alike
ctx.clBand=function(sl){ sl.band={}; }; ctx.findPop=function(){}; ctx.CLGOLD=null;
// Part E4 (bosses): the chamber's own code, pulled when it exists
if(SRC.indexOf('function bossChamber(')>=0){ ['BOSS_H','BOSS_LANES','BOSS_NAME','BOSS_COL'].forEach(function(n){ vm.runInContext(grabVar(n), ctx); });
  vm.runInContext('var BOSS_ON=true, BOSS_R=2.3, BOSS_LOBS=3, _crackTex=null;', ctx);
  var m=SRC.match(/var BOSS_LANES=\[[^\]]*\], BOSS_R=([0-9.]+), BOSS_LOBS=(\d+);/); if(!m||m[1]!=='2.3'||m[2]!=='3')throw new Error('boss constants moved');
  ['bossCrack','bossChamber','bossCell','bossNetDrop','bossStep','bossDraw'].forEach(function(n){ vm.runInContext(grab(n), ctx); });
  /* Part F3 (24 Oct): the forgiving lob and the graded pay, pulled when they exist */
  var mF=SRC.match(/var BOSS_PTS=\d+, LOB_SPIN=[0-9.]+;/); if(mF){ vm.runInContext(mF[0], ctx); ['lobOn','lobSpin','lobAim'].forEach(function(n){ vm.runInContext(grab(n), ctx); }); } }
if(SRC.indexOf('function cleanLine(')>=0){ ['CL_CARVE','CL_START'].forEach(function(n){ vm.runInContext(grabVar(n), ctx); });
  ['clNeed','clHit','clClear','clParts','cleanLine'].forEach(function(n){ vm.runInContext(grab(n), ctx); }); }
function dive(lvl, salt){
  ctx.G_FFSALT=salt>>>0; ctx.G_ENDLESS=false; ctx.__finished=false;
  var W=vm.runInContext('buildFreefall('+lvl+')', ctx);
  var G={ mode:'ff', endless:false, lvl:lvl, world:W, x:0, y:4, vx:0, vy:0, ang:0, w:0, grounded:false, score:0, combo:0, comboBest:0,
    slices:0, taps:0, depth:0, done:false, doneT:0, counted:false, mult:0, stuckY:0, shake:0, holdT:0, holding:false, t:0, lastSide:1, freezeT:0 };
  ctx.G=G; return G;
}
function use(G){ ctx.G=G; }
function step(G, n, hold){ ctx.G=G; for(var i=0;i<(n||1);i++){ if(hold){ G.holding=true; G.hold=hold; G.lastSide=hold; } else { G.holding=false; G.hold=0; }
  ctx.stepWorld(1/120); if(ctx.__finished)break; } return G; }
module.exports={ ctx:ctx, vm:vm, SRC:SRC, grab:grab, dive:dive, step:step, use:use };
if(require.main===module){
  var g=dive(1, 77), W=g.world; console.log('L1 salt 77: floorY', W.floorY, 'slabs', W.slabs.length, 'items', W.items.length, 'pads', W.pads.length, 'crystals', W.crystals.length, 'thorns', W.thorns.length, 'wasps', W.wasps.length, 'planks', W.planks.length, 'verbs', W.verbs.length);
  var t0=Date.now(), n=0; while(!g.done&&n<20000){ step(g,1,0); n++; } console.log('no input dive: steps', n, 'done', g.done, 'failed', !!g.failed, 'y', g.y.toFixed(1), 'slices', g.slices, 'chips', g.chips||0, (Date.now()-t0)+'ms');
}
