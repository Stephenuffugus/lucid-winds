// F4 review: what a BAD player earns. No input dives (the knife falls as it falls) and a one hold dive, levels 1..20, 3 seeds:
// score, chips, failed, and the live payout rule (slivPayout pulled from the page).
var W=require('../e4/world.js'), vm=W.vm, ctx=W.ctx;
ctx.setInterval=function(){ return 0; }; ctx.clearInterval=function(){}; ctx.setTimeout=function(){ return 0; };
var mk=W.SRC.match(/var SLIV_K=[0-9.]+;/); if(mk)vm.runInContext(mk[0], ctx);
var m=W.SRC.match(/function slivPayout\(\)\{[\s\S]*?\n\}/); vm.runInContext(m[0], ctx);
var tot={n:0, sl:0, t:0, sc:0, fail:0};
for(var lvl=1;lvl<=20;lvl++) for(var s=1;s<=3;s++){ var G=W.dive(lvl,s); for(var n=0;n<40000&&!G.done;n++)W.step(G,1,0); for(n=0;n<400&&!G.counted&&G.done&&!G.failed;n++)W.step(G,1,0);
  ctx.G=G; var sl=vm.runInContext('slivPayout()', ctx); tot.n++; tot.sl+=sl; tot.t+=G.t+5; tot.sc+=G.score; if(G.failed)tot.fail++; }
console.log('no input, levels 1-20 x3: fails', tot.fail, 'of', tot.n, 'score avg', Math.round(tot.sc/tot.n), 'slivers', Math.round(tot.sl/tot.n), 'per dive,', Math.round(tot.sl/tot.t*60), 'per minute');
