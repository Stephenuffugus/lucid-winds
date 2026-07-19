var puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
(async function(){
  var browser = await puppeteer.launch({headless:'new', args:['--no-sandbox','--allow-file-access-from-files','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
  var page = await browser.newPage();
  await page.setViewport({width:540, height:960});
  await page.goto('file:///workspaces/lucid-winds/satellites/slice-3d/index.html?dev=1', {waitUntil:'networkidle2'});
  await new Promise(function(r){setTimeout(r,500)});
  // SHOT 1: mid-shaft falling among shelves
  await page.evaluate(function(){
    var S=window._S3; S.newFF(2); S.freeze();
    var W=S.world();
    for(var i=0;i<190;i++){
      var G=S.state(); if(G.done)break;
      if(G.grounded)S.tap(G.x>=0?1:-1);
      else if(i%42===0)S.tap(G.x>0?-1:1);
      S.stepN(1,16);
    }
    S.stepN(1,16);
  });
  await new Promise(function(r){setTimeout(r,300)});
  await page.screenshot({path:process.env.SP+'/s3v40_ff_shaft.png'});
  // SHOT 2: floor finale with stuck knife
  await page.evaluate(function(){
    window._S3skiprender=true;
    var S=window._S3; S.newFF(1); S.freeze();
    var W=S.world(), steps=0, minY=99, stallFor=0, coast=0;
    while(steps<9000){
      var G=S.state(); if(G.done)break;
      if(G.y<minY-0.5){minY=G.y;stallFor=0;}else stallFor++;
      if(stallFor>150){coast=80;stallFor=0;}
      if(coast>0)coast--;
      else if(G.grounded){ S.tap((Math.abs(G.x)>W.SW-4.5)?(G.x>0?-1:1):(G.x>=0?1:-1)); }
      else if(steps%42===0)S.tap(G.x>1.5?-1:(G.x<-1.5?1:1));
      S.stepN(1,16); steps++;
    }
    window._S3skiprender=false;
    for(var j=0;j<120;j++)S.stepN(1,16);
  });
  await new Promise(function(r){setTimeout(r,300)});
  await page.screenshot({path:process.env.SP+'/s3v40_ff_floor.png'});
  console.log('ff shots done');
  await browser.close();
})().catch(function(e){ console.error(e.message); process.exit(2); });
