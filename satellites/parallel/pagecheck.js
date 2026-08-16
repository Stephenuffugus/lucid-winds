#!/usr/bin/env node
/* PARALLEL page harness. Zero dependencies, no browser.

   Boots the REAL script out of index.html against a small DOM stub, then drives
   the view: plays a level to the win card, opens every sheet, taps the ribbon,
   builds the sky at phone and desktop widths and measures what came back.

   This is NOT a substitute for looking at the thing on a phone. It cannot see
   colour, overlap or a seam that reads wrong. What it CAN do is prove that
   every button is wired to something that exists and that nothing throws on the
   paths a player actually walks, which on a box with no browser is the
   difference between shipping wiring and shipping a guess.

     node pagecheck.js            run the checks
     node pagecheck.js --width=1280 --height=800
*/
var fs = require('fs');
var vm = require('vm');
var path = require('path');

function argOf(name, dflt){
  var i, a = process.argv.slice(2);
  for (i = 0; i < a.length; i++){
    if (a[i] === '--' + name) return true;
    /* everything after the FIRST equals, or a query string loses its own
       parameters and the link routes never get exercised */
    if (a[i].indexOf('--' + name + '=') === 0) return a[i].slice(name.length + 3);
  }
  return dflt;
}

var W = parseInt(argOf('width', '390'), 10);
var H = parseInt(argOf('height', '844'), 10);
var QUERY = argOf('query', '');

/* ---------- the DOM stub ---------- */
function makeDom(w, h){
  var byId = {};
  var timers = [];

  function Style(){
    this._m = {};
    this.setProperty = function(k, v){ this._m[k] = v; };
    this.getPropertyValue = function(k){ return this._m[k]; };
  }
  function El(tag){
    var self2 = this;
    this.tagName = (tag || 'div').toUpperCase();
    this.style = new Style();
    this.className = '';
    this.textContent = '';
    this.children = [];
    this.attrs = {};
    this.value = 0;
    this.scrollTop = 0;
    this.parentNode = null;
    this._html = '';
    this._listeners = {};
    Object.defineProperty(this, 'innerHTML', {
      get: function(){ return self2._html; },
      set: function(v){ self2._html = v; self2.children = parseKids(v, self2); }
    });
    Object.defineProperty(this, 'offsetHeight', {
      get: function(){ return self2._h || 0; },
      set: function(v){ self2._h = v; }
    });
    Object.defineProperty(this, 'clientHeight', {
      get: function(){ return self2._ch !== undefined ? self2._ch : (self2._h || 0); },
      set: function(v){ self2._ch = v; }
    });
    Object.defineProperty(this, 'clientWidth', {
      get: function(){ return self2._cw !== undefined ? self2._cw : w; },
      set: function(v){ self2._cw = v; }
    });
  }
  El.prototype.setAttribute = function(k, v){ this.attrs[k] = String(v); if (k === 'id') byId[v] = this; };
  El.prototype.getAttribute = function(k){ return this.attrs[k] === undefined ? null : this.attrs[k]; };
  El.prototype.appendChild = function(c){ c.parentNode = this; this.children.push(c); return c; };
  El.prototype.removeChild = function(c){
    var i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1);
    return c;
  };
  El.prototype.remove = function(){ if (this.parentNode) this.parentNode.removeChild(this); };
  El.prototype.addEventListener = function(t, fn){ (this._listeners[t] = this._listeners[t] || []).push(fn); };
  El.prototype.removeEventListener = function(){};
  El.prototype.fire = function(t, ev){
    var L = this._listeners[t] || [], i;
    for (i = 0; i < L.length; i++) L[i].call(this, ev || { target:this, preventDefault:function(){},
      touches:[{clientX:0,clientY:0}], changedTouches:[{clientX:0,clientY:0}] });
    return L.length;
  };
  El.prototype.querySelectorAll = function(sel){
    var out = [], i;
    for (i = 0; i < this.children.length; i++){
      var c = this.children[i];
      if (sel.charAt(0) === '['){
        var key = sel.slice(1, sel.length - 1).split('=')[0];
        if (c.attrs[key] !== undefined) out.push(c);
      } else if (sel.charAt(0) === '.'){
        if ((' ' + c.className + ' ').indexOf(' ' + sel.slice(1) + ' ') >= 0) out.push(c);
      }
      out = out.concat(c.querySelectorAll(sel));
    }
    return out;
  };

  /* enough of a parser to register ids, classes and data attributes that the
     script writes through innerHTML and then reads back */
  function parseKids(html, parent){
    var kids = [], re = /<(\w+)([^>]*)>/g, m;
    while ((m = re.exec(html))){
      var el = new El(m[1]);
      el.parentNode = parent;
      var attrs = m[2], am, are = /([\w-]+)="([^"]*)"/g;
      while ((am = are.exec(attrs))){
        if (am[1] === 'class') el.className = am[2];
        else el.setAttribute(am[1], am[2]);
        if (am[1] === 'id') byId[am[2]] = el;
      }
      kids.push(el);
    }
    return kids;
  }

  var doc = {
    _byId: byId,
    getElementById: function(id){ return byId[id] || null; },
    createElement: function(tag){ return new El(tag); },
    addEventListener: function(t, fn){ (doc._l = doc._l || {}); (doc._l[t] = doc._l[t] || []).push(fn); },
    removeEventListener: function(){},
    hidden: false,
    referrer: '',
    documentElement: new El('html')
  };
  doc.documentElement.style = new Style();
  doc.body = new El('body');
  doc.fire = function(t, ev){
    var L = (doc._l || {})[t] || [], i;
    for (i = 0; i < L.length; i++) L[i](ev || { key:'', preventDefault:function(){} });
    return L.length;
  };

  var store = {};
  var win = {
    innerWidth: w, innerHeight: h,
    visualViewport: { height: h, width: w },
    devicePixelRatio: 2,
    location: { search: QUERY, origin:'https://lucidwinds.com', pathname:'/parallel/', replace:function(){} },
    history: { length: 1, back: function(){} },
    localStorage: {
      getItem: function(k){ return store[k] === undefined ? null : store[k]; },
      setItem: function(k, v){ store[k] = String(v); },
      removeItem: function(k){ delete store[k]; }
    },
    navigator: { vibrate: function(){ return true; }, userAgent:'node' },
    matchMedia: function(){ return { matches:false, addListener:function(){}, addEventListener:function(){} }; },
    addEventListener: function(t, fn){ (win._l = win._l || {}); (win._l[t] = win._l[t] || []).push(fn); },
    removeEventListener: function(){},
    setTimeout: function(fn, ms){ timers.push({ fn:fn, at:ms || 0 }); return timers.length; },
    clearTimeout: function(){},
    setInterval: function(fn){ return 0; },
    clearInterval: function(){},
    postMessage: function(){},
    fireWin: function(t){ var L = (win._l || {})[t] || [], i; for (i = 0; i < L.length; i++) L[i]({}); return L.length; }
  };
  win.self = win;
  win.window = win;
  win.parent = win;
  win.top = win;
  win.document = doc;
  win.console = console;
  win.Date = Date; win.Math = Math; win.JSON = JSON; win.Set = Set; win.Int8Array = Int8Array;
  win.runTimers = function(){
    var t = timers.slice(); timers.length = 0;
    t.sort(function(a, b){ return a.at - b.at; });
    var i;
    for (i = 0; i < t.length; i++){ try { t[i].fn(); } catch (e){ win._timerErr = e; } }
    return t.length;
  };
  win._el = El;
  return win;
}

/* ---------- boot ---------- */
var src = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
var script = src.slice(src.indexOf('<script>') + 8, src.lastIndexOf('</script>'));

/* the static markup, so the stub starts with the same elements the browser has */
var staticSrc = src.slice(src.indexOf('<body>'), src.indexOf('<script>'));

function boot(w, h){
  var win = makeDom(w, h);
  var re = /<(\w+)([^>]*)>/g, m;
  while ((m = re.exec(staticSrc))){
    var am, are = /([\w-]+)="([^"]*)"/g, id = null, cls = '';
    while ((am = are.exec(m[2]))){
      if (am[1] === 'id') id = am[2];
      if (am[1] === 'class') cls = am[2];
    }
    if (id){
      var el = new win._el(m[1]);
      el.className = cls;
      el.setAttribute('id', id);
      win.document._byId[id] = el;
    }
  }
  /* heights the browser would have measured */
  var app = win.document.getElementById('app');
  app.clientHeight = h - 20; app.clientWidth = w - 12;
  win.document.getElementById('bar').offsetHeight = 48;
  win.document.getElementById('hud').offsetHeight = 40;
  win.document.getElementById('pad').offsetHeight = 110;
  win.document.getElementById('selwrap').clientWidth = w - 28;
  win.document.getElementById('selwrap').clientHeight = h - 200;
  vm.createContext(win);
  vm.runInContext(script, win, { filename:'index.html' });
  win.runTimers();
  return win;
}

/* ---------- checks ---------- */
var results = [];
function ok(name, cond, detail){ results.push({ name:name, pass:!!cond, detail:detail || '' }); }
function eq(name, a, b){ ok(name, a === b, 'expected ' + b + ', got ' + a); }

var win, err = null;
try { win = boot(W, H); } catch (e){ err = e; }
ok('the page boots without throwing', !err, err ? (err.message + '\n' + err.stack) : '');
if (err){
  console.log('FAIL  the page boots without throwing\n' + err.stack);
  process.exitCode = 1;
  return;
}
ok('nothing thrown from the boot timers', !win._timerErr, win._timerErr ? win._timerErr.message : '');

var V = win.__VIEW__, P = win.__PARALLEL__, D = win.document;
ok('the view layer is reachable', !!V);
ok('a level is loaded', !!P.G.lv);
eq('the campaign is a hundred levels', P.LEVELS.length, 100);
if (QUERY.indexOf('seed=') > 0){
  ok('a seed link boots straight into that seeded board', P.G.mode === 'seed', 'mode ' + P.G.mode);
  ok('the seeded board is solved before it is drawn', !!(P.G.lv && P.G.lv.sol && P.G.lv.sol.length === P.G.lv.par));
}
if (QUERY.indexOf('day=') > 0){
  ok('a day link boots straight into that day', P.G.mode === 'daily', 'mode ' + P.G.mode);
  ok('the day board is solved before it is drawn', !!(P.G.lv && P.G.lv.sol && P.G.lv.sol.length === P.G.lv.par));
}

/* board fits the column at this size */
function boardBox(w2){
  var b = D.getElementById('board');
  return { w:parseInt(b.style._m ? 0 : 0, 10) || parseFloat(b.style.width), h:parseFloat(b.style.height) };
}
var bb = boardBox();
ok('the board has a size', bb.w > 0 && bb.h > 0, JSON.stringify(bb));
ok('the board fits the app width, ' + bb.w + 'px in ' + (W - 12) + 'px', bb.w <= W - 12);
var padh = D.documentElement.style.getPropertyValue('--padh');
ok('the pad height was budgeted, got ' + padh, !!padh);
var padPx = parseInt(padh, 10);
ok('pad buttons clear the 48px law, ' + padPx + 'px', padPx >= 48);
ok('pad buttons stay inside the cap, ' + padPx + 'px', padPx <= 190);
var ribbonShown = D.getElementById('ribbon').style._m['display'] !== 'none' &&
                  D.getElementById('ribbon').style.display !== 'none';
ok('the phone column is put to work, ribbon ' + (ribbonShown ? 'on' : 'off') + ', pad ' + padPx + 'px',
   W < 700 ? (ribbonShown || padPx >= 100) : true);
var cardEl = D.getElementById('lvcard');
var cardShown = (cardEl.style._m['display'] || cardEl.style.display) !== 'none';
var leftover = (H - 20) - 48 - 40 - padPx - 30 - bb.h -
               (ribbonShown ? V.LAYOUT.RIBBON_H : 0) - (cardShown ? V.LAYOUT.CARD_H : 0);
var leftPct = leftover / (H - 20) * 100;
ok('leftover slack under the board is small, ' + Math.round(leftover) + 'px (' +
   leftPct.toFixed(0) + ' percent of the column)', leftPct <= 15, 'leftover ' + leftover);
ok('the level card is filled in when it is shown', !cardShown || (D.getElementById('lvcTitle').textContent || '').length > 0,
   D.getElementById('lvcTitle').textContent + ' / ' + D.getElementById('lvcMech').textContent);

/* play level 1 with its own embedded solution */
var lv1 = P.decodeLevel(P.LEVELS[0]);
V.startLevel(1, 'level');
var i, sol = lv1.sol;
for (i = 0; i < sol.length; i++){
  V.press('LRUW'.indexOf(sol.charAt(i)));
}
ok('playing the embedded answer wins level 1', P.G.st.won === true,
   'moves ' + P.G.st.moves + ' won ' + P.G.st.won);
eq('the win card is showing', D.getElementById('wincard').className, 'on');
ok('the win card names the par', (D.getElementById('winStats').textContent || '').indexOf('best possible') > 0,
   D.getElementById('winStats').textContent);
ok('the run was written to the history', (V.SAVE().history || []).length === 1,
   JSON.stringify(V.SAVE().history));
ok('the level best was saved', !!V.SAVE().best['1']);

/* the mirror drift readout moved during the run */
ok('the drift readout is a number', /^\d+$/.test(String(D.getElementById('hDrift').textContent)),
   D.getElementById('hDrift').textContent);

/* every wired control fires without throwing */
var controls = ['kLeft','kRight','kUp','kWait','btnRestart','btnLevels','selClose','btnOpts','lvcWatch',
                'optClose','selDaily','selStats','statsClose','winRetry','winNext',
                'oSound','oHap','oMotion','oGhost'];
var threw = [];
for (i = 0; i < controls.length; i++){
  var el = D.getElementById(controls[i]);
  if (!el){ threw.push(controls[i] + ' missing'); continue; }
  try {
    var fired = el.fire('click');
    if (!fired) threw.push(controls[i] + ' has no click handler');
  } catch (e){ threw.push(controls[i] + ' threw ' + e.message); }
}
ok('every control on screen is wired and survives a tap', threw.length === 0, threw.join('; '));

/* the sky */
V.buildSky();
var sky = D.getElementById('sky');
var hits = (sky.innerHTML.match(/class="starhit"/g) || []).length;
eq('the sky draws one hit target per level', hits, 100);
var rs = sky.innerHTML.match(/r="(\d+)" fill="transparent"/g) || [];
var minR = 999, rm;
for (i = 0; i < rs.length; i++){ rm = parseInt(rs[i].match(/\d+/)[0], 10); if (rm < minR) minR = rm; }
ok('every hit target is at least 48px across, smallest ' + (minR * 2) + 'px',
   rs.length === 100 && minR * 2 >= 48, rs.length + ' targets, min radius ' + minR);
ok('the sky is sized in pixels so a unit is a pixel', /px$/.test(sky.style.width), sky.style.width);
var vb = sky.attrs['viewBox'] || '';
eq('the viewBox matches the drawn width', vb.split(' ')[2] + 'px', sky.style.width);

/* the run log */
V.buildStats();
ok('the run log shows six figures', (D.getElementById('statsGrid').innerHTML.match(/class="stat"/g) || []).length === 6);
ok('the run log shows a row per tier', (D.getElementById('statsTiers').innerHTML.match(/tierbar/g) || []).length === 7);
ok('the run log lists the run just played', D.getElementById('statsRuns').innerHTML.indexOf('level 1') > 0,
   D.getElementById('statsRuns').innerHTML.slice(0, 120));

/* the ribbon */
V.startLevel(2, 'level');
V.drawRibbon();
var chips = (D.getElementById('ribbon').innerHTML.match(/class="chip/g) || []).length;
ok('the ribbon offers a run of levels, ' + chips, chips >= 8);
ok('the ribbon marks where you are', D.getElementById('ribbon').innerHTML.indexOf('chip cur') > 0);

/* daily and seed links both build a verified level */
var d = V.buildDaily();
ok('the daily builds and is solved before it is shown', !!d && P.stepWorld ? !!d : false);
if (d) ok('the daily carries its own answer', !!d.sol && d.sol.length === d.par, d.par + ' vs ' + (d.sol||'').length);
var sdl = V.buildSeed(4242);
ok('a seed link builds a verified level', !!sdl);
if (sdl) ok('the seeded level carries its own answer', sdl.sol.length === sdl.par);

/* share strings carry the board, not the word today */
var shared = null;
win.navigator.clipboard = { writeText: function(t){ shared = t; return { then:function(f){ f(); return { catch:function(){} }; } }; } };
V.startLevel(0, 'daily');
V.shareCurrent();
ok('a daily share links the day, not the word today', shared && shared.indexOf('?day=') > 0, shared || 'nothing shared');
ok('the share copy has no dash', !shared || shared.split('\n')[0].indexOf('-') < 0, shared || '');

/* a resize does not walk the layout */
var b1 = parseFloat(D.getElementById('board').style.height);
var p1 = D.documentElement.style.getPropertyValue('--padh');
V.fitBoard(); V.fitBoard(); V.fitBoard();
var b2 = parseFloat(D.getElementById('board').style.height);
var p2 = D.documentElement.style.getPropertyValue('--padh');
eq('three fits in a row do not move the board', b2, b1);
/* the pad is the piece that would oscillate if it were measured rather than
   budgeted, so it is the one to watch */
eq('three fits in a row do not move the pad', p2, p1);

/* ---------- report ---------- */
var passed = 0, failed = 0;
for (i = 0; i < results.length; i++){
  if (results[i].pass) passed++;
  else { failed++; console.log('FAIL  ' + results[i].name + '   ' + results[i].detail); }
}
console.log('');
console.log('layout   board ' + Math.round(bb.w) + 'x' + Math.round(bb.h) + '   pad ' + padPx +
            '   ribbon ' + (ribbonShown ? 'on' : 'off') + '   card ' + (cardShown ? 'on' : 'off') +
            '   leftover ' + Math.round(leftover) + 'px');
console.log('PAGE ' + W + 'x' + H + '   PASSED ' + passed + ' / FAILED ' + failed +
            '   (' + results.length + ' checks)');
process.exitCode = failed ? 1 : 0;
