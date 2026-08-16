/* Dewball headless harness — runs the REAL index.html game code in plain node.
 *
 * WHY THIS EXISTS (2026-08-16 audit)
 * Every instrument in this folder drove the game through puppeteer. Chromium on
 * this box costs ~1.5 cores and ~400MB, so the audit tools were effectively
 * un-runnable whenever anything else was working, and `variety_audit.js` — the
 * one that measures Stephen's actual complaint — had not been re-run once since
 * the landmark tier shipped. A number nobody can afford to recompute is a number
 * that quietly stops being true.
 *
 * The game's world build is pure arithmetic. Three.js r147 runs fine under node
 * (it only needs a DOM for WebGLRenderer and CanvasTexture), so the whole scatter,
 * composer, structures, scenes, gates, movers and landmark layers can be built and
 * measured with no browser at all. This file supplies the smallest DOM that makes
 * that true and hands back `window.DB_DEV`.
 *
 * ⛔ WHAT THIS CANNOT DO. There is no GL context, so nothing here renders, and
 *    DB_DEV.frame / DB_DEV.occl / DB_DEV.render are meaningless under it. Those
 *    are picture tools and they still need a real browser. This harness answers
 *    "what is in the world and how big is it", never "what does it look like".
 *
 * ⭐ DETERMINISM. Scatter runs off mulberry32(world.seed), untouched by the DOM.
 *    The page's own ?dbtest=1 path also seeds Math.random; we do the same with
 *    the same mulberry32 so decorative Math.random() calls (ground paint, sky
 *    stars, some mover jitter) cannot drift the stream between runs.
 *
 * Use:  var H = require('./node_harness.js');
 *       var D = H.boot({ seed: 12345 });      // -> DB_DEV
 *       D.start('level', 3); D.state();
 */
var fs = require('fs'), path = require('path'), vm = require('vm');

function mulberry32(a){ return function(){ a|=0; a=(a+0x6D2B79F5)|0;
  var t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t;
  return ((t^(t>>>14))>>>0)/4294967296; }; }

/* ---- 2D canvas: every call a no-op, every read a plausible value ---------- */
function ctx2d(){
  var c = { canvas:null, fillStyle:'#000', strokeStyle:'#000', lineWidth:1, globalAlpha:1,
            font:'10px sans-serif', textAlign:'left', textBaseline:'alphabetic',
            lineCap:'butt', lineJoin:'miter', globalCompositeOperation:'source-over',
            shadowBlur:0, shadowColor:'#000', filter:'none' };
  var noop = function(){};
  var names = ['fillRect','clearRect','strokeRect','beginPath','closePath','moveTo','lineTo',
    'arc','arcTo','ellipse','rect','fill','stroke','save','restore','translate','rotate',
    'scale','setTransform','transform','clip','drawImage','fillText','strokeText',
    'quadraticCurveTo','bezierCurveTo','setLineDash','putImageData'];
  for (var i=0;i<names.length;i++) c[names[i]] = noop;
  c.createRadialGradient = c.createLinearGradient = function(){ return { addColorStop: noop }; };
  c.createPattern = function(){ return null; };
  c.measureText = function(s){ return { width: (s?String(s).length:0)*6 }; };
  c.getImageData = function(x,y,w,h){ return { data:new Uint8ClampedArray(Math.max(1,w*h*4)), width:w, height:h }; };
  return c;
}

/* ---- the smallest DOM the game boots against ------------------------------ */
function makeDom(){
  var listeners = {};
  function classList(el){
    var set = {};
    return {
      add:function(){ for(var i=0;i<arguments.length;i++) set[arguments[i]]=1; el._sync(set); },
      remove:function(){ for(var i=0;i<arguments.length;i++) delete set[arguments[i]]; el._sync(set); },
      toggle:function(n,f){ if(f===undefined) f=!set[n]; if(f) set[n]=1; else delete set[n]; el._sync(set); return !!f; },
      contains:function(n){ return !!set[n]; },
      _set:set
    };
  }
  function El(tag){
    this.tagName = String(tag||'div').toUpperCase();
    this.style = {}; this.dataset = {}; this.children = []; this.childNodes = this.children;
    this.parentNode = null; this.textContent = ''; this.innerHTML = '';
    this.value = ''; this.checked = false; this.width = 300; this.height = 150;
    this.id = ''; this.className = '';
    this.offsetWidth = 375; this.offsetHeight = 667;
    this.clientWidth = 375; this.clientHeight = 667;
    this.classList = classList(this);
    this._ctx = null;
  }
  El.prototype._sync = function(set){ this.className = Object.keys(set).join(' '); };
  El.prototype.appendChild = function(c){ if(c){ c.parentNode=this; this.children.push(c); } return c; };
  El.prototype.insertBefore = function(c){ return this.appendChild(c); };
  El.prototype.removeChild = function(c){ var i=this.children.indexOf(c); if(i>=0) this.children.splice(i,1); return c; };
  El.prototype.remove = function(){ if(this.parentNode) this.parentNode.removeChild(this); };
  El.prototype.addEventListener = function(){};
  El.prototype.removeEventListener = function(){};
  El.prototype.dispatchEvent = function(){ return true; };
  El.prototype.setAttribute = function(k,v){ this[k]=v; };
  El.prototype.getAttribute = function(k){ return this[k]===undefined?null:this[k]; };
  El.prototype.removeAttribute = function(k){ delete this[k]; };
  El.prototype.querySelector = function(){ return null; };
  El.prototype.querySelectorAll = function(){ return []; };
  El.prototype.getBoundingClientRect = function(){ return { x:0,y:0,left:0,top:0,right:375,bottom:667,width:375,height:667 }; };
  El.prototype.focus = function(){}; El.prototype.blur = function(){};
  El.prototype.getContext = function(kind){
    if (kind !== '2d') return null;                 /* no GL, on purpose */
    if (!this._ctx){ this._ctx = ctx2d(); this._ctx.canvas = this; }
    return this._ctx;
  };
  El.prototype.toDataURL = function(){ return 'data:image/png;base64,'; };
  El.prototype.requestFullscreen = function(){ return Promise.resolve(); };
  El.prototype.play = function(){ return Promise.resolve(); };
  El.prototype.pause = function(){};
  El.prototype.load = function(){};
  El.prototype.cloneNode = function(){ return new El(this.tagName); };
  Object.defineProperty(El.prototype, 'firstChild', { get:function(){ return this.children[0]||null; } });
  Object.defineProperty(El.prototype, 'lastChild',  { get:function(){ return this.children[this.children.length-1]||null; } });

  var byId = {};
  var doc = {
    _El: El,
    documentElement: new El('html'),
    body: new El('body'),
    head: new El('head'),
    hidden: false,
    fullscreenElement: null,
    webkitFullscreenElement: null,
    createElement: function(t){ return new El(t); },
    createElementNS: function(ns,t){ return new El(t); },
    createTextNode: function(t){ var e=new El('#text'); e.textContent=t; return e; },
    /* every id the game asks for exists; unknown ids must not be null or the
       whole boot dies on one typo in an element name we do not care about */
    getElementById: function(id){ if(!byId[id]){ byId[id]=new El('div'); byId[id].id=id; } return byId[id]; },
    querySelector: function(){ return null; },
    querySelectorAll: function(){ return []; },
    addEventListener: function(t,f){ (listeners[t]=listeners[t]||[]).push(f); },
    removeEventListener: function(){},
    dispatchEvent: function(){ return true; },
    exitFullscreen: function(){ return Promise.resolve(); },
    webkitExitFullscreen: function(){},
    _byId: byId,
    _listeners: listeners
  };
  return doc;
}

/* Boot the game. opts: { seed, url }  ->  window.DB_DEV */
function boot(opts){
  opts = opts || {};
  var seed = opts.seed || 12345;
  var html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  /* pull the main game script (the one that follows the three.min.js include) */
  var mark = html.indexOf('<script src="three.min.js"></script>');
  if (mark < 0) throw new Error('harness: three.min.js include not found — index.html restructured');
  var s0 = html.indexOf('<script>', mark); s0 = html.indexOf('>', s0) + 1;
  var s1 = html.indexOf('<\/script>', s0);
  if (s0 < 0 || s1 < 0) throw new Error('harness: main script block not found');
  var game = html.slice(s0, s1);

  var doc = makeDom();
  var rnd = mulberry32(seed);
  var sandbox = {
    console: console, Math: Math, Date: Date, JSON: JSON, parseInt: parseInt, parseFloat: parseFloat,
    isNaN: isNaN, isFinite: isFinite, Object: Object, Array: Array, String: String, Number: Number,
    Boolean: Boolean, Function: Function, RegExp: RegExp, Error: Error, TypeError: TypeError,
    Promise: Promise, Symbol: Symbol, Map: Map, Set: Set, WeakMap: WeakMap, encodeURIComponent: encodeURIComponent,
    decodeURIComponent: decodeURIComponent, Uint8Array: Uint8Array, Uint8ClampedArray: Uint8ClampedArray,
    Uint16Array: Uint16Array, Uint32Array: Uint32Array, Int32Array: Int32Array,
    Float32Array: Float32Array, Float64Array: Float64Array, ArrayBuffer: ArrayBuffer, DataView: DataView,
    setTimeout: setTimeout, clearTimeout: clearTimeout, setInterval: setInterval, clearInterval: clearInterval,
    performance: { now: function(){ return Date.now(); } },
    requestAnimationFrame: function(){ return 0; },      /* ⛔ never actually schedules: TEST mode does not call it */
    cancelAnimationFrame: function(){},
    document: doc,
    navigator: { userAgent:'node-harness', maxTouchPoints:0, vibrate:function(){}, share:undefined,
                 language:'en', platform:'linux', serviceWorker:{ register:function(){ return Promise.resolve(); } } },
    location: { href:'file:///dewball/index.html?dbtest=1&dbseed='+seed, search:'?dbtest=1&dbseed='+seed,
                hash:'', pathname:'/dewball/index.html', origin:'file://', protocol:'file:', reload:function(){} },
    localStorage: (function(){ var m={}; return {
        getItem:function(k){ return (k in m)?m[k]:null; },
        setItem:function(k,v){ m[k]=String(v); },
        removeItem:function(k){ delete m[k]; },
        clear:function(){ m={}; },
        key:function(i){ return Object.keys(m)[i]||null; },
        get length(){ return Object.keys(m).length; },
        _dump:function(){ return m; } }; })(),
    innerWidth: 1280, innerHeight: 820, devicePixelRatio: 1,
    screen: { width:1280, height:820, availWidth:1280, availHeight:820,
              orientation:{ type:'landscape-primary', lock:function(){ return Promise.reject(); }, unlock:function(){} } },
    matchMedia: function(){ return { matches:false, addListener:function(){}, removeListener:function(){},
                                     addEventListener:function(){}, removeEventListener:function(){} }; },
    addEventListener: function(){}, removeEventListener: function(){}, dispatchEvent: function(){ return true; },
    getComputedStyle: function(){ return { getPropertyValue:function(){ return ''; } }; },
    Image: function(){ return doc.createElement('img'); },
    URL: { createObjectURL:function(){ return 'blob:x'; }, revokeObjectURL:function(){} },
    fetch: function(){ return Promise.reject(new Error('no network in harness')); },
    AudioContext: undefined, webkitAudioContext: undefined,   /* game guards on these */
    Sunbeam: undefined,
    alert: function(){}, confirm: function(){ return false; }, prompt: function(){ return null; }
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.top = sandbox;
  doc.defaultView = sandbox;

  var ctx = vm.createContext(sandbox);

  /* three.min.js first — UMD with no module/exports here, so it lands on globalThis */
  vm.runInContext(fs.readFileSync(path.join(__dirname,'three.min.js'),'utf8'),
                  ctx, { filename:'three.min.js' });
  if (!sandbox.THREE) throw new Error('harness: THREE did not attach');

  /* the one class that genuinely needs a GPU */
  sandbox.THREE.WebGLRenderer = function(){
    this.domElement = doc.createElement('canvas');
    this.setPixelRatio = function(){}; this.setSize = function(){};
    this.setClearColor = function(){}; this.render = function(){};
    this.dispose = function(){}; this.getPixelRatio = function(){ return 1; };
    this.info = { render:{ calls:0, triangles:0 }, memory:{ geometries:0, textures:0 } };
    this.shadowMap = { enabled:false }; this.outputEncoding = 0;
    this.capabilities = { isWebGL2:true, getMaxAnisotropy:function(){ return 1; } };
  };

  /* the page seeds Math.random under ?dbtest=1; do the same so decorative
     Math.random() calls cannot drift the stream between runs */
  sandbox.Math = Object.create(Math);
  sandbox.Math.random = rnd;

  var errs = [];
  sandbox.__harnessErr = function(e){ errs.push(String(e)); };
  vm.runInContext(game, ctx, { filename:'dewball-main.js' });

  if (!sandbox.DB_DEV) throw new Error('harness: DB_DEV missing — is ?dbtest=1 in location.search?');
  sandbox.DB_DEV._errs = errs;
  sandbox.DB_DEV._win = sandbox;
  return sandbox.DB_DEV;
}

module.exports = { boot: boot, mulberry32: mulberry32 };
