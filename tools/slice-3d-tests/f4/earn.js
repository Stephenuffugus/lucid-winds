// Part F4 (24 Oct, his call "prices need to be so much higher ... it needs to be balanced"): what a numbered Freefall dive
// pays a good player, per dive and per minute of play. The near human controller (e2/prove3 drive: planned holds with a
// thumb's timing blur) on the REAL build and step (e2/world.js), carving the Clean Slice line when there is one and aiming
// for the bullseye at the floor; the landing counted as the game counts it; Slivers by the game's own slivPayout rule.
// node earn.js [lvlFrom] [lvlTo] [seeds]
var fs=require('fs'), path=require('path');
/* prove3's drive with one change: with no line left to carve, it steers for the floor's bullseye (x 0), as a player does */
var src=fs.readFileSync(path.join(__dirname,'../e2/prove3.js'),'utf8'), n0=src.split('tx=T?T.x:G.x').length-1; if(n0!==1)throw new Error('prove3 floor target moved');
src=src.replace('tx=T?T.x:G.x','tx=T?T.x:0').replace("require('./world.js')","require('../e4/world.js')").replace("require('./ctl3.js')","require('../e2/ctl3.js')").replace("__dirname+'/cleanline.es5.js'","__dirname+'/../e2/cleanline.es5.js'");
fs.writeFileSync(path.join(__dirname,'prove3b.js'), src);
var W=require('../e4/world.js'), P=require('./prove3b.js'), vm=W.vm, ctx=W.ctx;
ctx.setInterval=function(){ return 0; }; ctx.clearInterval=function(){}; ctx.setTimeout=function(){ return 0; };   /* the landing's count up sound */
var a=process.argv.slice(2).map(Number), L0=a[0]||1, L1=a[1]||40, NS=a[2]||3;
var mk=W.SRC.match(/var SLIV_K=[0-9.]+;/); if(mk)vm.runInContext(mk[0], ctx);   /* F4: the payout's constant */
var m=W.SRC.match(/function slivPayout\(\)\{[\s\S]*?\n\}/); if(!m)throw new Error('slivPayout moved'); vm.runInContext(m[0], ctx);
function line(G){ ctx.__A=G.world; try{ return vm.runInContext('cleanLine(__A, 9.2, __A.floorY)', ctx); }catch(e){ return []; } }
var rows=[], band={};
for(var lvl=L0;lvl<=L1;lvl++) for(var s=1;s<=NS;s++){
  var G=W.dive(lvl,s), req=line(G);
  /* the floor's bullseye: steer the last stretch to x 0 (the controller otherwise lands where it falls) */
  var r=P.drive(G, req.concat([]), 4000+lvl*13+s);
  for(var n=0;n<400&&!G.counted;n++)W.step(G,1,0);
  ctx.G=G; var sl=vm.runInContext('slivPayout()', ctx);
  var t=G.t+5, b=Math.floor((lvl-1)/10);
  var K=+(process.env.SQK||0.5), nw=Math.max(G.failed?6:15, Math.round(Math.sqrt(G.score)*K)+((G.chips||0)===0&&!G.failed?30:0));   /* the proposed curve */
  band[b]=band[b]||{n:0, sl:0, t:0, sc:0, fail:0, mult:0, nw:0}; var B=band[b]; B.n++; B.sl+=sl; B.nw+=nw; B.t+=t; B.sc+=G.score; B.mult+=(G.mult||0); if(G.failed)B.fail++;
}
Object.keys(band).forEach(function(k){ var B=band[k]; console.log('levels '+(k*10+1)+'-'+(k*10+10)+': dives '+B.n+', fails '+B.fail+', score '+Math.round(B.sc/B.n)+', mult '+(B.mult/B.n).toFixed(1)+', slivers '+Math.round(B.sl/B.n)+' per dive, '+(B.t/B.n).toFixed(1)+' s, '+Math.round(B.sl/B.t*60)+' per minute; the sqrt curve: '+Math.round(B.nw/B.n)+' per dive, '+Math.round(B.nw/B.t*60)+' per minute'); });
