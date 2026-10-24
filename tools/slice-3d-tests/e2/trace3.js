// trace one dive under the controller: every chip (what hit it, where) and how it ended
var W=require('./world.js'), P=require('./prove3.js'), fs=require('fs');
if(W.SRC.indexOf('function cleanLine(')<0)W.vm.runInContext(fs.readFileSync(__dirname+'/cleanline.es5.js','utf8'), W.ctx);
var lvl=+process.argv[2], s=+process.argv[3], G=W.dive(lvl,s); W.ctx.__A=G.world; var req=W.vm.runInContext('cleanLine(__A, 9.2)', W.ctx);
console.log('line:', req.map(function(c){ return c.x.toFixed(1)+'@'+c.top.y.toFixed(0)+'..'+c.last.y.toFixed(0); }).join(' '), 'floor', G.world.floorY);
var ctx=W.ctx, hs=ctx.hitSting, bg=ctx.boomGourd, hc=ctx.hitCrystal, fp=ctx.ffPad, fw=ctx.ffWall;
ctx.hitSting=function(t,l){ console.log('  STING', l, 'at', G.x.toFixed(2), G.y.toFixed(1), 'thing', (t.x||t.cx).toFixed(2), t.y.toFixed(1)); return hs.apply(this, arguments); };
ctx.boomGourd=function(it){ console.log('  GOURD at', G.x.toFixed(2), G.y.toFixed(1), 'gourd', it.x.toFixed(2), it.y.toFixed(1)); return bg.apply(this, arguments); };
ctx.hitCrystal=function(c){ console.log('  CRYSTAL at', G.x.toFixed(2), G.y.toFixed(1)); return hc.apply(this, arguments); };
ctx.ffPad=function(pd){ console.log('  PAD at', G.x.toFixed(2), G.y.toFixed(1), 'pad', pd.x.toFixed(2), pd.y.toFixed(1), 'ang', (G.ang%6.283).toFixed(2)); return fp.apply(this, arguments); };
ctx.ffWall=function(x,y,d){ var r=fw.apply(this, arguments); console.log('  WALL', d, 'at', G.x.toFixed(2), G.y.toFixed(1), G.failed?'STUCK':'bounce'); return r; };
var r=P.drive(G, req, 1000+lvl*7+s); console.log(JSON.stringify({cut:r.cut, of:r.of, finished:r.finished, failed:!!G.failed, y:G.y.toFixed(1), done:G.done}));
