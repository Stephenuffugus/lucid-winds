/* What did a change actually COST? Produces the draw-call/triangle table in
   LANDMARKS.md. Stage two builds and inject an identical hook into each:
     mkdir -p /tmp/perfA /tmp/perfB
     git show <OLD>:satellites/dewball/index.html > /tmp/perfA/index.html
     cp index.html /tmp/perfB/ ; cp three.min.js /tmp/perfA/ /tmp/perfB/
     # then in each, replace 'render:function(){' with:
     #   perf:function(){var q=renderer.info.render;return{calls:q.calls,
     #   tris:q.triangles,children:scene.children.length};},render:function(){
     NODE_PATH=... node perf_ab.js A   and   ... perf_ab.js B
   ⛔ TRUST THE COUNTS, NOT THE CLOCK. Under software rendering on a 2-core box
      the ms/frame moved in BOTH directions across a 1% geometry change. The noise
      floor is far above anything you are trying to measure. */
/* What did today's geometry actually cost? Same probe, same worlds, two builds:
   bc5ecf41 (yesterday's HEAD) vs today. Software rendering, so treat ms/frame as
   an upper bound on a phone's GPU — but DRAW CALLS and TRIANGLES are exact. */
var puppeteer=require('puppeteer'),path=require('path');
var BUILD=process.argv[2];
var url='file://'+path.resolve('/tmp/perf'+BUILD,'index.html')+'?dbtest=1';
(async function(){
  var b=await puppeteer.launch({headless:'new',protocolTimeout:900000,args:['--no-sandbox','--disable-setuid-sandbox','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist']});
  var p=await b.newPage(); await p.setViewport({width:1280,height:820});
  await p.goto(url,{waitUntil:'networkidle0'});
  await p.waitForFunction('window.DB_DEV && window.DB_DEV.perf',{timeout:8000});
  var out=[];
  for(var lv=1; lv<=7; lv++){
    var r=await p.evaluate(function(n){
      var D=window.DB_DEV; D.start('level',n);
      var i; for(i=0;i<60;i++) D.step(0.016);
      D.render(); var pf=D.perf();
      var t0=performance.now();
      for(i=0;i<20;i++){ D.step(0.016); D.render(); }
      var ms=(performance.now()-t0)/20;
      return {id:D.worlds()[n-1].id, calls:pf.calls, tris:pf.tris, children:pf.children, ms:+ms.toFixed(2)};
    }, lv);
    out.push(r);
  }
  console.log(BUILD+' '+JSON.stringify(out));
  await b.close();
})().catch(function(e){console.error('FAILED '+e.message);process.exit(1);});
