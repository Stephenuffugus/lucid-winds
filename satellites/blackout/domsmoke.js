/* DOM smoke: boot the real page script against a stub document and play it.
   Not a browser (eight builders share two cores and the main loop owns browser
   work), but it is the difference between "the SIM is green" and "the page
   renders at all". A missing helper on a render path dies here, loudly. */
var fs = require("fs"), path = require("path"), vm = require("vm");
function makeDom() {
  var timers = [];
  function node(tag) {
    var n = {
      tag: tag, className: "", textContent: "", children: [], attrs: {}, style: {},
      onclick: null, _html: ""
    };
    n.appendChild = function (c) { n.children.push(c); c.parentNode = n; return c; };
    n.removeChild = function (c) {
      var i = n.children.indexOf(c); if (i >= 0) n.children.splice(i, 1); return c;
    };
    n.setAttribute = function (k, v) { n.attrs[k] = v; };
    n.getAttribute = function (k) { return n.attrs[k]; };
    n.addEventListener = function () {};
    Object.defineProperty(n, "firstChild", { get: function () { return n.children[0] || null; } });
    Object.defineProperty(n, "innerHTML", {
      get: function () { return n._html; },
      set: function (v) { n._html = String(v); n.children = []; }
    });
    return n;
  }
  var body = node("body"), app = node("div");
  app.attrs.id = "app";
  body.appendChild(app);
  var store = {};
  var doc = {
    readyState: "complete", hidden: false, referrer: "",
    documentElement: { clientWidth: 390, clientHeight: 844 },
    body: body,
    createElement: node,
    createTextNode: function (t) { var n = node("#text"); n.textContent = t; return n; },
    getElementById: function (id) {
      var hit = null;
      (function walk(n) {
        if (!n || hit) return;
        if (n.attrs && n.attrs.id === id) { hit = n; return; }
        if (n.id === id) { hit = n; return; }
        (n.children || []).forEach(walk);
      })(body);
      return hit;
    },
    addEventListener: function () {},
    removeEventListener: function () {}
  };
  var ctx = {
    document: doc, console: console, Math: Math, JSON: JSON, Date: Date, isFinite: isFinite,
    parseInt: parseInt, parseFloat: parseFloat, String: String, Number: Number, Object: Object,
    Array: Array, Uint32Array: Uint32Array, Uint8Array: Uint8Array, RegExp: RegExp, Error: Error,
    setTimeout: function (f, ms) { timers.push(f); return timers.length; },
    clearTimeout: function () {}, setInterval: function (f) { timers.push(f); return 1; },
    clearInterval: function () {},
    localStorage: {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
      setItem: function (k, v) { store[k] = String(v); },
      removeItem: function (k) { delete store[k]; }
    },
    location: { search: "", origin: "https://lucidwinds.com", pathname: "/blackout/", replace: function () {} },
    history: { length: 1, back: function () {} },
    navigator: { vibrate: function () { return true; } },
    matchMedia: function () { return { matches: false, addListener: function () {} }; },
    addEventListener: function () {}, removeEventListener: function () {},
    postMessage: function () {}
  };
  vm.createContext(ctx);
  ctx.window = ctx;
  ctx.self = ctx;
  ctx.parent = ctx;
  ctx.globalThis = ctx;
  return { ctx: ctx, doc: doc, body: body, app: app, timers: timers };
}
function walk(n, fn) { if (!n) return; fn(n); (n.children || []).forEach(function (c) { walk(c, fn); }); }
function textOf(n) {
  var s = n.textContent || "";
  (n.children || []).forEach(function (c) { s += " " + textOf(c); });
  return s.trim();
}
function findAll(root, pred) { var out = []; walk(root, function (n) { if (pred(n)) out.push(n); }); return out; }
function byText(root, txt) {
  return findAll(root, function (n) { return n.tag === "button" && textOf(n).indexOf(txt) >= 0; });
}
function run() {
  var HTML = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  var a = HTML.indexOf("<script>") + 8, b = HTML.lastIndexOf("</scr" + "ipt>");
  var src = HTML.slice(a, b);
  var d = makeDom(), fails = [];
  try { vm.runInContext(src, d.ctx, { filename: "blackout.html" }); }
  catch (e) { return ["boot threw: " + e.message]; }
  var rendered = textOf(d.app);
  if (!rendered) fails.push("the page rendered nothing");
  if (rendered.indexOf("Search") < 0) fails.push("no search control on the case screen");
  if (rendered.indexOf("actions left") < 0) fails.push("no action budget on screen");

  function click(list, label) {
    if (!list.length) { fails.push("no control found: " + label); return false; }
    try { list[0].onclick && list[0].onclick(); } catch (e) { fails.push("click " + label + " threw: " + e.message); return false; }
    return true;
  }
  // play a case: search everything, talk to everybody, press, mark, accuse
  for (var pass = 0; pass < 6; pass++) {
    var searches = byText(d.app, "Search").filter(function (n) { return n.className.indexOf("done") < 0; });
    if (!searches.length) break;
    click(searches, "search");
  }
  for (pass = 0; pass < 6; pass++) {
    var asks = byText(d.app, "Ask").filter(function (n) { return n.className.indexOf("done") < 0; });
    if (!asks.length) break;
    click(asks, "ask");
  }
  var presses = byText(d.app, "Press");
  if (presses.length) click(presses, "press");
  // the board
  click(byText(d.app, "Board"), "board tab");
  var cells = findAll(d.app, function (n) { return n.className.indexOf("cell") === 0; });
  if (cells.length !== 36) fails.push("board has " + cells.length + " cells, wants 36");
  for (var i = 0; i < 8 && i < cells.length; i++) {
    try { cells[i].onclick(); } catch (e) { fails.push("marking threw: " + e.message); break; }
  }
  var journal = findAll(d.app, function (n) { return n.className.indexOf("clue") === 0; });
  if (!journal.length) fails.push("the journal is empty after searching the whole house");
  try { journal[0].onclick(); } catch (e) { fails.push("clue halo threw: " + e.message); }
  // the file tab, the picker and every rung of the ladder
  click(byText(d.app, "File"), "file tab");
  if (textOf(d.app).indexOf("Vance") < 0) fails.push("the dossier does not list the household");
  click(byText(d.app, "New case"), "new case");
  var ovRoot = d.body;
  ["Quick case", "Long case", "Standard case"].forEach(function (name) {
    var hit = findAll(ovRoot, function (n) { return n.className.indexOf("pickrow") >= 0 && textOf(n).indexOf(name) >= 0; });
    if (!hit.length) fails.push("the picker is missing " + name);
    else try { hit[0].onclick(); } catch (e) { fails.push("picking " + name + " threw: " + e.message); }
  });
  var sw = findAll(ovRoot, function (n) { return n.className.indexOf("sw") === 0; });
  if (!sw.length) fails.push("no liar toggle in the picker");
  else try { sw[0].onclick(); } catch (e) { fails.push("liar toggle threw: " + e.message); }
  var open = byText(ovRoot, "Open the file");
  if (!click(open, "open the file")) fails.push("could not start a picked case");
  var t2 = textOf(d.app);
  if (t2.indexOf("LIAR") < 0 && t2.indexOf("lying") < 0) fails.push("a liar case does not say so anywhere on the case screen");
  // accuse, wrong on purpose, and read the reveal
  click(byText(d.app, "Accuse"), "accuse");
  var picks = findAll(d.body, function (n) { return n.tag === "button" && n.parentNode && n.parentNode.className === "pick"; });
  if (picks.length < 24) fails.push("the accusation picker has " + picks.length + " options, wants 24");
  [0, 6, 12, 18].forEach(function (i) { if (picks[i]) try { picks[i].onclick(); } catch (e) { fails.push("picking threw: " + e.message); } });
  var name = byText(d.body, "Name them");
  if (!name.length) fails.push("no confirm button on the accusation");
  else try { name[0].onclick(); } catch (e) { fails.push("accusing threw: " + e.message); }
  var reveal = textOf(d.body);
  if (reveal.indexOf("did it") < 0) fails.push("the reveal never names the culprit");
  // options
  click(byText(d.app, "Options"), "options");
  var opts = findAll(d.body, function (n) { return n.className.indexOf("sw") === 0; });
  if (opts.length < 5) fails.push("the options panel lost a toggle");
  opts.forEach(function (o, i) { if (i < 5) try { o.onclick(); } catch (e) { fails.push("toggle threw: " + e.message); } });
  // and the in page harness still builds
  if (!d.ctx.__TEST__ || typeof d.ctx.__TEST__.run !== "function") fails.push("window.__TEST__ did not survive boot");
  return fails;
}
module.exports = { run: run };
if (require.main === module) {
  var f = run();
  f.forEach(function (x) { console.log("DOM FAIL  " + x); });
  console.log(f.length ? "dom smoke FAILED" : "dom smoke PASSED");
  process.exit(f.length ? 1 : 0);
}
