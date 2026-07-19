var puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
(async function(){
  var b = await puppeteer.launch({headless:'new', args:['--no-sandbox','--allow-file-access-from-files','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
  var page = await b.newPage();
  var errors=[]; page.on('pageerror', function(e){ if(!/ServiceWorker/.test(e.message)) errors.push(e.message); });
  await page.goto('file:///workspaces/lucid-winds/satellites/slice-3d/index.html?dev=1', {waitUntil:'networkidle2'});
  await new Promise(function(r){setTimeout(r,900)});
  var out = await page.evaluate(function(){
    var F=window._S3forge, S=window._S3, r={};
    // apply every skin (must not error, knife must exist)
    var keys=['classic','cleaver','paintbrush','katana','crystal','gold','cosmicedge','wallbreaker','starforge','wolffang'];
    r.applied=[]; var appliedOk=true;
    for(var i=0;i<keys.length;i++){ try{ F.apply(keys[i]); r.applied.push(keys[i]); }catch(e){ appliedOk=false; r.applyErr=keys[i]+':'+e.message; break; } }
    F.apply('classic');
    // buy flow: give slivers, buy cleaver via forgeTap
    F.setSliv(2000);
    var before=F.owned().length;
    F.forgeTap('cleaver');
    r.buy={ownedCleaver:F.owned().indexOf('cleaver')>=0, equipped:F.equip()==='cleaver', slivLeft:F.sliv(), grew:F.owned().length>before};
    // cannot buy premium
    F.forgeTap('starforge');
    r.premiumBlocked=F.owned().indexOf('starforge')<0;
    // not enough slivers
    F.setSliv(10);
    F.forgeTap('gold');
    r.tooPoor=F.owned().indexOf('gold')<0;
    // forge renders (grid populated)
    document.getElementById('b-forge').click();
    r.gridCards=document.getElementById('forge-grid').children.length;
    r.appliedAll=appliedOk;
    return r;
  });
  console.log(JSON.stringify(out,null,1));
  var ok = out.appliedAll && out.applied.length===10
    && out.buy.ownedCleaver && out.buy.equipped && out.buy.slivLeft===1850 && out.buy.grew
    && out.premiumBlocked && out.tooPoor && out.gridCards===10;
  console.log(ok?'FORGE OK':'FAIL','· errors:',errors.length?errors.join(' | '):'none');
  await b.close();
  process.exit(ok&&!errors.length?0:1);
})().catch(function(e){ console.error('ERR',e.message); process.exit(2); });
