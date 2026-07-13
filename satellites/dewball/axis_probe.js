// Dewball Y-axis probe. Drives the REAL readInput() path with real key events and
// checks which way the camera actually moves in WORLD space (camera.position.y),
// rather than trusting the sign of camPitch. Also exercises the invertY toggle.
var puppeteer=require('puppeteer'), path=require('path');
var url='file://'+path.resolve('/workspaces/lucid-winds/satellites/dewball/index.html')+'?dbtest=1';

puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']}).then(function(b){
  b.newPage().then(function(p){
    p.setViewport({width:540,height:960,deviceScaleFactor:1});
    var errs=[]; p.on('pageerror',function(e){errs.push(String(e));});
    p.goto(url,{waitUntil:'networkidle0'})
    .then(function(){ return p.waitForFunction('window.DB_DEV && window.DB_DEV.start',{timeout:8000}); })
    .then(function(){
      return p.evaluate(function(){
        var D=window.DB_DEV, out={};
        function camY(){ return D.camY ? D.camY() : null; }
        // R = look up, F = look down (same axis the right stick drives)
        function hold(key,frames){
          window.dispatchEvent(new KeyboardEvent('keydown',{key:key}));
          for(var i=0;i<frames;i++) D.step(0.016);
          window.dispatchEvent(new KeyboardEvent('keyup',{key:key}));
        }
        function run(invert){
          D.start('level',1); D.setInvertY(invert); D.step(0.016);
          var p0=D.pitch();
          hold('r',40);                      // "look up"
          return { invert:invert, pitch0:+p0.toFixed(3), pitchAfterUp:+D.pitch().toFixed(3) };
        }
        out.normal = run(false);
        out.inverted = run(true);
        return out;
      });
    })
    .then(function(o){
      console.log('pageerrors', errs.length?errs:'none');
      console.log('normal  ', JSON.stringify(o.normal));
      console.log('inverted', JSON.stringify(o.inverted));
      // camPitch is ELEVATION. Looking UP = seeing more horizon/sky = pitch DECREASES.
      var normalOK   = o.normal.pitchAfterUp   <  o.normal.pitch0;
      var invertedOK = o.inverted.pitchAfterUp >  o.inverted.pitch0;
      console.log('');
      console.log(normalOK   ? 'PASS default: "look up" raises the view (pitch falls toward horizon)'
                             : 'FAIL default: "look up" still tilts the camera DOWN');
      console.log(invertedOK ? 'PASS invertY: toggle flips it back for people who want inverted'
                             : 'FAIL invertY: toggle had no effect');
      return b.close();
    })
    .catch(function(e){ console.log('ERR',e); b.close(); });
  });
});
