/* Run: NODE_PATH=/workspaces/lucid-winds/node_modules node edge_shots.js
   Shoots every world from its own rim looking OUT. See LANDMARKS.md "the worst
   angle, on purpose". ⛔ DB_DEV.worlds() returns `goal`, not `goalD`. */
/* THE WORST ANGLE, ON PURPOSE. Project rule. The specific failure this hunts is
   the one Stephen found in the chameleon build: a world that ends in void when
   you stand at its edge and look out. Park at the boundary, aim AWAY from the
   middle, keep the camera low, and shoot. */
var puppeteer=require('puppeteer'),path=require('path');
var url='file://'+path.resolve('/workspaces/lucid-winds/satellites/dewball','index.html')+'?dbtest=1';
(async function(){
  var b=await puppeteer.launch({headless:'new',protocolTimeout:240000,args:['--no-sandbox','--disable-setuid-sandbox','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist']});
  var p=await b.newPage(); await p.setViewport({width:1280,height:820});
  await p.goto(url,{waitUntil:'networkidle0'});
  await p.waitForFunction('window.DB_DEV && window.DB_DEV.frame',{timeout:8000});
  for (var lv=1; lv<=7; lv++){
    var info=await p.evaluate(function(n){
      var D=window.DB_DEV; D.start('level',n);
      var i; for(i=0;i<40;i++) D.step(0.016);
      var w=D.worlds()[n-1];
      /* stand at the rim, look straight out at whatever is beyond the world */
      var edge=w.bound*0.93;
      D.setD((w.goal||w.startD*4)*0.5);   /* zen has no goal */
      D.setPos(edge,0); D.step(0.002);
      D.setCam(Math.atan2(1,0), 0.22);       /* face +x, i.e. outward; lowest pitch */
      D.camSettle();
      return {id:w.id, nm:w.nm, bound:w.bound, globe:!!w.globe};
    }, lv);
    await new Promise(function(r){setTimeout(r,1800);});
    await p.evaluate(function(){ window.DB_DEV.render(); });
    await p.screenshot({path:'/tmp/edge-'+lv+'-'+info.id+'.png'});
    console.log('level '+lv+'  '+info.id+' ('+info.nm+')  bound '+info.bound+(info.globe?'  GLOBE':''));
  }
  await b.close();
})().catch(function(e){console.error(e.message);process.exit(1);});
