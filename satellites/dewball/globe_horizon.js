/* How far away can you SEE a globe landmark? Produces the visibility table in
   LANDMARKS.md. w7 is a planet of radius 12,877cm and its landmarks carry
   26,000-35,000cm — a third to nearly half way round it — and visibility tracks
   HEIGHT, not size.
   Run: NODE_PATH=/workspaces/lucid-winds/node_modules node globe_horizon.js
   ⭐ Use this before placing a w7 landmark: two of them more than ~26,000cm apart
      are never co-visible. */
/* How far away can you SEE a globe landmark? The wide shot of The Long Span comes
   back empty because the planet curves away first. That is a design number, not a
   probe bug: it says how far apart w7's landmarks can be before they stop being
   things you steer toward and become things you stumble on. */
var puppeteer=require('puppeteer'),path=require('path');
var url='file://'+path.resolve('/workspaces/lucid-winds/satellites/dewball','index.html')+'?dbtest=1';
(async function(){
  var b=await puppeteer.launch({headless:'new',protocolTimeout:240000,args:['--no-sandbox','--disable-setuid-sandbox','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist']});
  var p=await b.newPage(); await p.setViewport({width:1280,height:820});
  await p.goto(url,{waitUntil:'networkidle0'});
  await p.waitForFunction('window.DB_DEV && window.DB_DEV.frame',{timeout:8000});
  var out=await p.evaluate(function(){
    var D=window.DB_DEV; D.start('level',6);
    var i,j; for(i=0;i<40;i++) D.step(0.016);
    var st=D.state(), res=[], kinds=['lmSuspBridge','lmStadium','lmPalace','lmCathedral','lmObservatory'];
    for(j=0;j<kinds.length;j++){
      var a=null;
      for(i=0;i<st.objects.length;i++) if(st.objects[i].k===kinds[j]) a=st.objects[i];
      if(!a) continue;
      D.setD(Math.max(4,a.s*0.42));
      var lastSeen=0, firstGone=0;
      for(var off=a.s*1.5; off<a.s*30; off*=1.18){
        D.setPos(a.x-off*0.7071, a.z-off*0.7071);
        D.aimAt(a.x,a.z,0.30); D.camSettle();
        var f=D.frame(kinds[j]);
        if(f && f.h>0.001){ lastSeen=off; } else { firstGone=off; break; }
      }
      res.push({k:kinds[j], size:Math.round(a.s), lastSeen:Math.round(lastSeen),
                gone:Math.round(firstGone), inBallWidths:+(lastSeen/a.s).toFixed(1)});
    }
    var w=D.worlds()[5];
    return {bound:w.bound, R:Math.round(w.bound/Math.PI), circum:Math.round(2*Math.PI*w.bound/Math.PI), res:res};
  });
  console.log('w7 planet radius '+out.R+'cm, circumference '+out.circum+'cm');
  out.res.forEach(function(r){
    console.log('  '+r.k.padEnd(15)+' size '+String(r.size).padStart(5)+'cm  visible out to ~'+
      String(r.lastSeen).padStart(6)+'cm ('+r.inBallWidths+'x its own size)  gone by '+r.gone+'cm');
  });
  await b.close();
})().catch(function(e){console.error(e.message);process.exit(1);});
