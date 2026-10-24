// The code look (art.json or stages.webp not in: ?noart=1, offline, three misses): the reveal fades in the boss's sprite,
// which has no map, so its material colour (white) shows as a 6.4 u square. bossDraw is the page's own code.
var S=require('./sim.js'), ctx=S.ctx, W=S.W;
var g=W.dive(5,77), b=g.world.boss;
var mat={opacity:0, map:null, color:'0xffffff (SpriteMaterial default in bossChamber)'}, code={visible:true};
b.sp={material:mat, scale:{set:function(){}}}; b.code=code; b.grp={parent:{remove:function(){ removed=true; }}, position:{set:function(){}}}; var removed=false;
console.log('art in?', !!b.tex, ' sprite map', mat.map);
b.hits=3; b.cleared=true; b.revealT=0;
var t=0, seen=[]; for(var i=0;i<150;i++){ ctx.G=g; ctx.bossDraw(1/60); t+=1/60; if(i%12===0||(mat.opacity>0&&seen.length<3)) seen.push('t '+t.toFixed(2)+' s: sphere '+(code.visible?'shown':'hidden')+', white sprite opacity '+mat.opacity.toFixed(2)+', map '+mat.map); }
console.log(seen.join('\n')); console.log('group removed', removed);
