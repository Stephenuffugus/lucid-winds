var puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
(async function(){
  var browser = await puppeteer.launch({headless:'new', args:['--no-sandbox','--allow-file-access-from-files','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
  var page = await browser.newPage();
  await page.setViewport({width:540, height:960});
  await page.goto('file:///workspaces/lucid-winds/satellites/slice-3d/index.html', {waitUntil:'networkidle2'});
  await new Promise(function(r){setTimeout(r,900)});
  await page.screenshot({path:process.env.SP+'/s3v35_title.png'});
  await browser.close();
})().catch(function(e){ console.error(e.message); process.exit(2); });
