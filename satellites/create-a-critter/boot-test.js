#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════
   Boot the app's main script in a stub DOM and prove the wiring finished.

   Why this exists: every listener in this app is registered by one long
   top level pass. A single throw part way through (a null element, a
   renamed helper) kills EVERY listener after it, silently, and the app
   still looks fine until a kid taps the button that never got wired.
   This app has already lost a feature that way.

   It is not a browser: there is no layout, no canvas raster, no WebGL.
   It proves the boot pass runs to the end and that named controls got a
   listener. node boot-test.js [--selftest]
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
var fs=require('fs'), path=require('path'), vm=require('vm');
var FILE=path.join(__dirname,'index.html');

/* controls that must be live once boot finishes. If a throw lands mid pass
   the ones after it go missing, which is the whole point of the list. */
var MUST_BE_WIRED=['btnDraw','btnNursery','btnHow','howOk','btnLife','drawBack','drawClear',
  'drawDice','palSwap','toolUndo','toolRedo','zoomIn','zoomOut','toolErase','toolFill',
  'toolRainbow','toolSize','wizNext','actFeed','actPlay','actDance','actPet','actWalk',
  'actGuide','actDress','actFace','actRedraw','actStitch','actTuck','actRoom','actPhoto',
  'actPrint','actSound','actHome','stitchDone','stitchCancel','markDone','markCancel',
  'nBack','nDraw','nParade','nDate','paradeExit','berryQuit','berryAgain','berryDone',
  'gmBerry','gmToss','gmCancel','freeGo','freeCancel','fullGo','fullLater','visFeed',
  'visAdopt','visLater','eggHatch','rmToggle','rmRedraw','rmCancel','bedSkip','bedImg',
  'pmCard','pmColor','pmCancel','guideOk','critName','visitorBadge','btnExit',
  'oopsOk','saveFailOk','saveFailGo','stitchImg','markImg'];

function boot(src){
  var htmlIds={}, m, re=/\bid="([^"]+)"/g;
  while((m=re.exec(src))) htmlIds[m[1]]=1;
  function countAttr(a){ return (src.match(new RegExp('<[^>]*\\s'+a+'[=\\s>]','g'))||[]).length; }

  var wired={}, listeners=0;
  function El(id){
    this.id=id||''; this.style={ cssText:'', setProperty:function(){} };
    this.classList={ _s:{}, add:function(c){this._s[c]=1;}, remove:function(){}, toggle:function(){}, contains:function(c){return !!this._s[c];} };
    this.children=[]; this.childElementCount=0; this.textContent=''; this.innerHTML=''; this.value='';
    this.clientWidth=360; this.clientHeight=360; this.width=0; this.height=0;
  }
  El.prototype.addEventListener=function(){ listeners++; if(this.id) wired[this.id]=(wired[this.id]||0)+1; };
  El.prototype.removeEventListener=function(){};
  El.prototype.appendChild=function(c){ this.children.push(c); this.childElementCount=this.children.length; return c; };
  El.prototype.removeChild=function(){}; El.prototype.remove=function(){};
  El.prototype.setAttribute=function(){}; El.prototype.getAttribute=function(){ return null; };
  El.prototype.getBoundingClientRect=function(){ return {left:0,top:0,width:360,height:360}; };
  El.prototype.querySelector=function(){ return null; };
  El.prototype.querySelectorAll=function(){ return []; };
  El.prototype.setPointerCapture=function(){};
  El.prototype.getContext=function(){ return ctx2d(); };
  El.prototype.toDataURL=function(){ return 'data:image/png;base64,'; };
  El.prototype.focus=function(){};

  function ctx2d(){
    var c={};
    ['save','restore','translate','rotate','scale','beginPath','closePath','moveTo','lineTo',
     'arc','ellipse','rect','fillRect','clearRect','fill','stroke','clip','quadraticCurveTo',
     'bezierCurveTo','drawImage','setLineDash','putImageData','createLinearGradient','measureText',
     'fillText','strokeText'].forEach(function(k){ c[k]=function(){}; });
    c.getImageData=function(x,y,w,h){ w=w||1; h=h||1; return { width:w, height:h, data:new Uint8ClampedArray(w*h*4).fill(255) }; };
    return c;
  }

  var elements={};
  function get(id){
    if(!htmlIds[id]) return null;                 /* exactly like a browser */
    if(!elements[id]) elements[id]=new El(id);
    return elements[id];
  }
  var doc={
    getElementById:get,
    createElement:function(t){ var e=new El(''); e.tagName=(t||'div').toUpperCase(); return e; },
    querySelector:function(sel){ var mm=/^\[data-group="([^"]+)"\]$/.exec(sel); return mm?new El(''):null; },
    querySelectorAll:function(sel){
      var mm=/^\[(data-[a-z]+)\]$/.exec(sel), n=0;
      if(mm) n=countAttr(mm[1]);
      else if(sel==='.screen') n=(src.match(/class="screen/g)||[]).length;
      else if(sel==='.swatch') n=12;
      else if(/\[data-group\],?/.test(sel)) n=countAttr('data-group');
      var out=[]; for(var i=0;i<n;i++) out.push(new El(''));
      out.forEach=Array.prototype.forEach; return out;
    },
    addEventListener:function(){ listeners++; },
    body:new El('body'), head:new El('head'), documentElement:new El('html'), hidden:false
  };
  var store={};
  var win={
    document:doc, innerWidth:375, innerHeight:667, devicePixelRatio:2,
    localStorage:{ getItem:function(k){ return k in store?store[k]:null; },
                   setItem:function(k,v){ store[k]=String(v); },
                   removeItem:function(k){ delete store[k]; } },
    addEventListener:function(){ listeners++; }, removeEventListener:function(){},
    setTimeout:function(){ return 0; }, clearTimeout:function(){},
    setInterval:function(){ return 0; }, clearInterval:function(){},
    requestAnimationFrame:function(){ return 0; },
    performance:{ now:function(){ return 0; } },
    navigator:{ userAgent:'boot-test', share:undefined },
    location:{ pathname:'/satellites/create-a-critter/', search:'', href:'x', replace:function(){} },
    history:{ length:1, back:function(){} },
    fetch:function(){ return { then:function(){ return this; }, catch:function(){ return this; } }; },
    Image:function(){ var e=new El(''); return e; },
    matchMedia:function(){ return { matches:false, addListener:function(){} }; },
    print:function(){}, prompt:function(){ return null; }, alert:function(){},
    parent:null, SWS_FRAMED:false, SWS_EMBED:false,
    _sbCapEarn:function(){}, SWS_EXIT:function(){}
  };
  win.window=win; win.self=win; win.parent=win; win.top=win;
  win.localStorage.length=0;

  var sandbox=vm.createContext(win);
  /* the main IIFE is the last and biggest script block */
  var blocks=[], re2=/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g, mm;
  while((mm=re2.exec(src))) if(mm[1].trim()) blocks.push(mm[1]);
  var main=blocks[blocks.length-1];
  /* test only hook: hand the closure's own functions out so the new data
     safety code and the generator can be exercised for real, in node */
  main=main.replace(/\n\}\)\(\);\s*$/,'\nwindow.__t={ gen:genVisitorCanvas, saveNest:saveNest, lsMax:lsMax,'
    +' getNest:function(){return NEST;}, setNest:function(v){NEST=v;} };\n})();\n');
  var err=null;
  try{ vm.runInContext(main,sandbox,{filename:'main',timeout:20000}); }
  catch(e){ err=e; }
  return { err:err, wired:wired, listeners:listeners, t:win.__t, store:store };
}

/* the parts of this app that can lose a kid's work, run for real */
function logicChecks(r){
  var bad=[], t=r.t;
  if(!t){ return ['test hook missing, the IIFE tail must have changed shape']; }

  /* 1. two tabs must not clobber each other */
  r.store['cac_nursery']=JSON.stringify([{id:'a',name:'A'},{id:'b',name:'B from the other tab'}]);
  t.setNest([{id:'a',name:'A edited here'}]);
  t.saveNest();
  var after=JSON.parse(r.store['cac_nursery']);
  if(after.length!==2) bad.push('saveNest lost a record: expected 2, got '+after.length);
  if(!after.some(function(x){ return x.id==='b'; })) bad.push('saveNest dropped the other tab\'s critter');
  if(!after.some(function(x){ return x.name==='A edited here'; })) bad.push('saveNest ignored this tab\'s edit');

  /* 2. a removal still has to work */
  t.setNest(t.getNest().filter(function(x){ return x.id!=='b'; }));
  t.saveNest(['b']);
  after=JSON.parse(r.store['cac_nursery']);
  if(after.length!==1||after[0].id!=='a') bad.push('saveNest could not remove a freed critter');

  /* 3. bests only ever go up */
  r.store['cac_berry_best']='9';
  if(t.lsMax('cac_berry_best',4)!==9||r.store['cac_berry_best']!=='9') bad.push('lsMax lowered a best score');
  if(t.lsMax('cac_berry_best',12)!==12||r.store['cac_berry_best']!=='12') bad.push('lsMax refused a new best');

  /* 4. the generator: 300 seeds, none may throw and all must be buildable */
  var noLimbs=0, noFace=0;
  for(var i=0;i<300;i++){
    var g;
    try{ g=t.gen((i*2654435761)>>>0); }
    catch(e){ bad.push('generator threw on seed '+i+': '+e.message); break; }
    if(!g||!g.cv) { bad.push('generator returned nothing on seed '+i); break; }
    if(!g.limbs.length) noLimbs++;
    if(g.feats.length<3) noFace++;
    if(g.limbs.length>6) bad.push('generator made '+g.limbs.length+' limbs on seed '+i+', the rig keeps only 6');
    g.limbs.forEach(function(L){
      if(['leg','wing','tail','ear'].indexOf(L.type)<0) bad.push('generator made an unknown limb type '+L.type);
      if(!(L.ax>=0&&L.ax<=1&&L.ay>=0&&L.ay<=1)) bad.push('generator limb attachment is off the paper on seed '+i);
    });
  }
  if(noLimbs) bad.push(noLimbs+' of 300 rolls had no limbs at all');
  if(noFace) bad.push(noFace+' of 300 rolls had no face');
  return bad;
}

function report(src,quiet){
  var r=boot(src), bad=[], logic=[];
  if(r.err) bad.push('boot threw: '+r.err.message);
  MUST_BE_WIRED.forEach(function(id){ if(!r.wired[id]) bad.push('no listener on #'+id+' after boot'); });
  if(!bad.length){ try{ logic=logicChecks(r); }catch(e){ logic=['logic checks threw: '+e.message]; } }
  if(!quiet){
    if(!bad.length) console.log('green boot pass completed, '+r.listeners+' listeners registered, all '+MUST_BE_WIRED.length+' named controls wired');
    else { console.log('RED   boot pass'); bad.slice(0,10).forEach(function(b){ console.log('        '+b); });
      if(bad.length>10) console.log('        ...and '+(bad.length-10)+' more'); }
    if(!bad.length){
      if(!logic.length) console.log('green nursery merge, best scores and 300 generator rolls');
      else { console.log('RED   nursery merge / best scores / generator');
        logic.slice(0,10).forEach(function(b){ console.log('        '+b); }); }
    }
  }
  return bad.length+logic.length;
}

var src=fs.readFileSync(FILE,'utf8');
var fails=0;
if(process.argv.indexOf('--selftest')>=0){
  console.log('--- watching the boot check fail on purpose ---');
  /* a throw half way through the boot pass: every listener after it vanishes */
  var broken=src.replace("$('toolUndo').addEventListener","$('toolUndoTYPO').addEventListener");
  if(broken===src){ console.log('SELFTEST BROKEN: mutation changed nothing'); fails++; }
  else if(!report(broken,true)) { console.log('SELFTEST FAILED: boot check stayed green with a mid pass throw'); fails++; }
  else console.log('watched red  a throw mid boot loses every later listener');
  console.log('');
}
console.log('--- booting index.html in a stub DOM ---');
fails+=report(src)?1:0;
process.exit(fails?1:0);
