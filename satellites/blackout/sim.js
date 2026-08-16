#!/usr/bin/env node
/* BLACKOUT headless runner. Zero dependencies.
   Pulls the CONFIG / RNG / DATA / GEN / SIM layers straight out of index.html
   via the marker comments, so there is exactly one copy of the game logic.

     node sim.js --test            full assertion harness, nonzero exit on failure
     node sim.js --cases=10000     the section 4.8 verification sweep
     node sim.js --watch=12345     print one case in full for a human to read
     node sim.js --grep            the grep gates (Math.random, DOM, dashes)
     node sim.js --layout          touch targets and title fit, read out of the css
     node sim.js --dom             boot the page against a dom stub and play it
     node sim.js --tier=long --liar   sweep one rung of the ladder
     node sim.js --all             sweep all six modes and gate each one
*/

var fs = require("fs");
var path = require("path");

var HTML = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

function region(start, end, required) {
  var a = HTML.indexOf(start), b = HTML.indexOf(end);
  if (a < 0 || b < 0) {
    if (required) { console.error("marker missing: " + start); process.exit(2); }
    return "";
  }
  return HTML.slice(a + start.length, b);
}

var SIM_SRC = region("// ---- SIM_EXPORT_START ----", "// ---- SIM_EXPORT_END ----", true);
var TEST_SRC = region("// ---- TEST_EXPORT_START ----", "// ---- TEST_EXPORT_END ----", false);

var EXPORTS = ["CONFIG", "TIERS", "TIER_KEYS", "tierOf", "makeRNG", "seedFromString", "dailySeed", "SUSPECTS", "WEAPONS",
  "liarMask", "liarProved", "falseClueIds", "makeLie", "trueClueCandidates", "eliminatorFor", "eliminatorsFor", "clueKey",
  "liarReinforce", "targetedCandidates", "minimizeLiar", "chooseProof", "stateMask", "clueSource", "modeOf", "modeLabelOf",
  "GLYPH_W", "textWidth", "wrapText", "titleTier", "titleFits", "headerTitleBox", "allTitles", "TITLE_TIERS",
  "ROOMS", "TIMES", "TIME_HEAD", "ATTRS", "DESCS", "CLASSWORD", "EVENTS", "TPL",
  "TITLE_NOUNS", "TITLE_TIMEWORDS", "BRIEF", "TYPE_NAMES",
  "tupleIndex", "tupleFromIndex", "bitsFull", "bitsAnd", "bitsGet", "bitsCount",
  "bitsFirst", "bitsList", "WORDS",
  "cluePasses", "clueMask", "clueTrueOf", "clueText", "clueSubjects", "fillTpl", "nameList",
  "genWorld", "genCluePool", "solve", "solveMask", "minimize", "isMotiveOnly",
  "placeClues", "minActions", "caseTitle", "generateCase", "isPhysical",
  "newGame", "step", "actionsUsed", "pressUnlocked", "markKey", "candidateCountFromMarks",
  "excludedCells", "clueExcludedCells", "foundMask", "clueHalo", "starsFor",
  "findContradiction", "placedClueIds", "greedyAgent", "perfectAgent", "textSanity",
  "serializeState", "deserializeState",
  "SAVE_KEY", "saveDefaults", "saveMigrate", "saveParse", "saveMerge", "shareString"];

var factory = new Function(SIM_SRC + "\n;return {" +
  EXPORTS.map(function (n) { return n + ":" + n; }).join(",") + "};");
var G = factory();

/* ------------------------------------------------------------------ */
/* grep gates                                                          */
/* ------------------------------------------------------------------ */
/* Strip comments and lift out string literals, so an identifier hunt never
   trips over a word that lives inside prose. A murder mystery is allowed to
   contain a window in a wall. Learned the hard way, 2026-08-16. */
function scanJs(src) {
  var strings = [], code = [], i = 0, n = src.length, ch, q, s;
  while (i < n) {
    ch = src[i];
    if (ch === "/" && src[i + 1] === "/") { while (i < n && src[i] !== "\n") i++; continue; }
    if (ch === "/" && src[i + 1] === "*") {
      i += 2; while (i < n && !(src[i] === "*" && src[i + 1] === "/")) i++; i += 2; continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      q = ch; s = ++i;
      while (i < n) { if (src[i] === "\\") { i += 2; continue; } if (src[i] === q) break; i++; }
      strings.push(src.slice(s, i)); code.push(" "); i++; continue;
    }
    code.push(ch); i++;
  }
  return { strings: strings, code: code.join("") };
}

var DASHY = /[-‐-―−]/;
var WIDE_DASH = /[‐-―−]/;

function grepGates() {
  var fails = [], i;
  var sim = scanJs(SIM_SRC);
  if (/Math\s*\.\s*random/.test(sim.code)) fails.push("Math.random inside SIM_EXPORT markers");
  var dom = sim.code.match(/\b(document|window|canvas|performance|requestAnimationFrame)\b/g);
  if (dom) fails.push("DOM reference inside SIM: " + Array.from(new Set(dom)).join(", "));

  // player facing copy: no dash of any kind
  ["// ---- COPY_START ----|// ---- COPY_END ----|copy",
   "// ---- UICOPY_START ----|// ---- UICOPY_END ----|ui copy"].forEach(function (spec) {
    var parts = spec.split("|");
    var src = region(parts[0], parts[1], false);
    if (!src) return;
    scanJs(src).strings.forEach(function (s) {
      if (DASHY.test(s)) fails.push("dash in " + parts[2] + " string: " + s.slice(0, 60));
    });
  });

  // no en or em dash anywhere in a string literal in the whole file
  scanJs(HTML.slice(HTML.indexOf("<script>"))).strings.forEach(function (s) {
    if (WIDE_DASH.test(s)) fails.push("wide dash in string: " + s.slice(0, 60));
  });

  // static markup text nodes
  var bodyStart = HTML.indexOf("<body>"), bodyEnd = HTML.indexOf("</bo" + "dy>");
  var body = HTML.slice(bodyStart, bodyEnd);
  var scriptOpen = body.indexOf("<script>");
  var markup = scriptOpen >= 0 ? body.slice(0, scriptOpen) : body;
  var textNodes = markup.replace(/<[^>]*>/g, " ").trim();
  if (textNodes && (WIDE_DASH.test(textNodes) || /\s-\s/.test(textNodes))) {
    fails.push("dash in static markup text");
  }
  var closer = "</scr" + "ipt>";
  if (SIM_SRC.indexOf(closer) >= 0) fails.push("literal closing script tag inside SIM source");
  return fails;
}


/* ------------------------------------------------------------------ */
/* layout gates: touch targets read out of the stylesheet             */
/* ------------------------------------------------------------------ */
/* Not a browser. This is box model arithmetic, the same arithmetic the old
   build notes did by hand, except now it is executable and it fails when
   somebody shrinks a cell. The board cell used to render 48.2px wide, which is
   a fifth of a pixel of headroom over the repo law, so the rule here is 50. */
var CSS = HTML.slice(HTML.indexOf("<style>"), HTML.indexOf("</sty" + "le>"));
function cssRule(sel) {
  var i = CSS.indexOf(sel + "{");
  if (i < 0) return null;
  return CSS.slice(i + sel.length + 1, CSS.indexOf("}", i));
}
function cssPx(sel, prop) {
  var r = cssRule(sel);
  if (!r) return null;
  var m = r.match(new RegExp("(?:^|;)\\s*" + prop + "\\s*:\\s*([0-9.]+)px"));
  return m ? parseFloat(m[1]) : null;
}
var FLOOR = 48, HEADROOM = 50;
function layoutGates() {
  var fails = [], widths = [320, 360, 375, 390];
  var pad = (CSS.match(/--pad:\s*([0-9.]+)px/) || [])[1];
  pad = pad ? parseFloat(pad) : 10;
  var grid = cssRule(".grid") || "";
  var gm = grid.match(/grid-template-columns:\s*([0-9.]+)px\s+repeat\(6,\s*minmax\(([0-9.]+)px/);
  if (!gm) { fails.push("could not read the board grid template"); return fails; }
  var rowHead = parseFloat(gm[1]), cellMin = parseFloat(gm[2]);
  var cellH = cssPx(".cell", "height"), cellW = cssPx(".cell", "min-width");
  var fullBleed = /margin-left:\s*calc\(var\(--pad\)\s*\*\s*-1\)/.test(cssRule(".gridwrap") || "");
  if (cellH === null || cellW === null) fails.push("could not read the board cell box");
  if (cellH !== null && cellH < HEADROOM) fails.push("board cell height " + cellH + "px, wants " + HEADROOM);
  if (cellW !== null && cellW < HEADROOM) fails.push("board cell min width " + cellW + "px, wants " + HEADROOM);
  if (cellMin < HEADROOM) fails.push("board grid floor " + cellMin + "px, wants " + HEADROOM);
  widths.forEach(function (w) {
    var avail = w - 2 - (fullBleed ? 0 : 2 * pad);       // 1px border each side
    var rendered = Math.max(cellMin, (avail - rowHead) / 6);
    if (rendered < HEADROOM) {
      fails.push("board cell renders " + rendered.toFixed(1) + "px at " + w + "px wide");
    }
  });
  // every control that takes a tap
  [[".ghost", "min-height"], [".act", "min-height"], [".act", "min-width"],
   [".danger", "min-height"], [".bn button", "min-height"], [".tabs button", "min-height"],
   [".pick button", "min-height"], [".sw", "min-height"], [".sw", "min-width"],
   [".clue", "min-height"], [".wide", "min-height"], [".grid .rh", "height"]].forEach(function (spec) {
    var v = cssPx(spec[0], spec[1]);
    if (v === null) fails.push("no " + spec[1] + " on " + spec[0]);
    else if (v < FLOOR) fails.push(spec[0] + " " + spec[1] + " is " + v + "px, floor is " + FLOOR);
  });
  // the title must be allowed to wrap instead of truncating
  var ttl = cssRule(".hd .ttl") || "";
  if (/white-space:\s*nowrap/.test(ttl)) fails.push("the case title is still set to nowrap");
  if (/text-overflow:\s*ellipsis/.test(ttl)) fails.push("the case title still truncates with an ellipsis");
  // and the fit maths has to agree with the sizes the stylesheet actually ships
  G.TITLE_TIERS.forEach(function (t) {
    var sel = t.cls ? ".hd .ttl." + t.cls : ".hd .ttl";
    var size = cssPx(sel, "font-size");
    if (size === null) fails.push("no font size for title tier " + (t.cls || "base"));
    else if (Math.abs(size - t.size) > 0.01) fails.push("title tier " + (t.cls || "base") + " is " + size + "px in css and " + t.size + "px in sim");
  });
  return fails;
}

/* ------------------------------------------------------------------ */
/* the sweep                                                           */
/* ------------------------------------------------------------------ */
function sweep(n, baseSeed, quiet, opts) {
  opts = opts || {};
  var M = G.modeOf(opts.tier, opts.liar);
  var i, cs, rng = G.makeRNG(baseSeed >>> 0);
  var hist = {}, sizes = [], retries = 0, nulls = 0;
  var greedySolved = 0, perfectSolved = 0, greedyActions = 0;
  var reachMax = 0, reachSum = 0, motiveOnly = 0, textBad = 0, uniqueFail = 0;
  var poolSizes = [], noiseSum = 0, pressMin = 0, greedyRuns = 0, lieBad = 0;
  var t0 = Date.now();
  for (i = 0; i < n; i++) {
    var seed = (rng.int(0x7ffffffe) + 1) >>> 0;
    cs = G.generateCase(seed, { tier: opts.tier, liar: opts.liar });
    if (!cs) { nulls++; continue; }
    retries += cs.retries;

    // independent re verification: do not trust the generator's own claim.
    // v1 wants one tuple consistent with everything. A liar case wants one
    // tuple consistent with all BUT ONE clue and none consistent with all,
    // checked on the full pool and again on the minimal set alone.
    var ti = G.tupleIndex(cs.truth);
    var mn = cs.minimal.map(function (id) { return cs.pool[id]; });
    if (opts.liar) {
      if (!G.liarProved(cs.pool, cs.masks, ti)) uniqueFail++;
      if (!G.liarProved(mn, cs.masks, ti)) uniqueFail++;
      var fal = G.falseClueIds(cs.pool, cs.truth);
      if (fal.length !== 1 || fal[0] !== cs.lie.id) lieBad++;
      var src = G.clueSource(cs, cs.lie.id);
      if (!src || src.kind !== "said" || src.i !== cs.lie.speaker) lieBad++;
      if (cs.minimal.indexOf(cs.lie.id) < 0) lieBad++;
      if (G.bitsCount(G.solveMask(cs.pool, cs.masks)) !== 0) lieBad++;
    } else {
      var acc = G.solveMask(cs.pool, cs.masks);
      if (G.bitsCount(acc) !== 1 || G.bitsFirst(acc) !== ti) uniqueFail++;
      var accM = G.solveMask(mn, cs.masks);
      if (G.bitsCount(accM) !== 1 || G.bitsFirst(accM) !== ti) uniqueFail++;
    }

    sizes.push(cs.minimal.length);
    hist[cs.minimal.length] = (hist[cs.minimal.length] || 0) + 1;
    poolSizes.push(cs.pool.length);
    if (G.isMotiveOnly(mn)) motiveOnly++;
    reachSum += cs.minActions;
    if (cs.minActions > reachMax) reachMax = cs.minActions;
    pressMin += cs.place.pressMinimal.length;
    noiseSum += G.placedClueIds(cs).length - cs.minimal.length;
    if (G.textSanity(cs).length) textBad++;

    var g = G.greedyAgent(cs, rng);
    greedyRuns++;
    if (g.solved) greedySolved++;
    greedyActions += g.actionsUsed;
    if (G.perfectAgent(cs).solved) perfectSolved++;
  }
  var ok = sizes.length;
  sizes.sort(function (a, b) { return a - b; });
  var median = ok ? sizes[Math.floor(ok / 2)] : 0;
  var inBand = sizes.filter(function (s) { return s >= M.lo && s <= M.hi; }).length;
  var res = {
    mode: M, lieBad: lieBad,
    n: n, generated: ok, nulls: nulls, ms: Date.now() - t0,
    retryRate: ok ? retries / (retries + ok) : 1,
    retriesTotal: retries,
    uniqueRate: ok ? (ok - uniqueFail) / ok : 0,
    hist: hist, median: median,
    sizeMin: sizes[0], sizeMax: sizes[ok - 1],
    inBandRate: ok ? inBand / ok : 0,
    motiveOnly: motiveOnly, textBad: textBad,
    reachMax: reachMax, reachAvg: ok ? reachSum / ok : 0,
    greedyRate: greedyRuns ? greedySolved / greedyRuns : 0,
    greedyAvgActions: greedyRuns ? greedyActions / greedyRuns : 0,
    perfectRate: ok ? perfectSolved / ok : 0,
    poolAvg: ok ? poolSizes.reduce(function (a, b) { return a + b; }, 0) / ok : 0,
    noiseAvg: ok ? noiseSum / ok : 0,
    pressMinAvg: ok ? pressMin / ok : 0
  };
  if (!quiet) printSweep(res);
  return res;
}

function pct(x) { return (x * 100).toFixed(2) + "%"; }

function printSweep(r) {
  console.log("");
  console.log("BLACKOUT verification sweep, " + r.n + " cases, " + r.ms + " ms   [" +
    r.mode.key + (r.mode.liar ? " with a liar" : "") + ", " + r.mode.actions + " actions]");
  console.log("=".repeat(58));
  console.log("cases generated            " + r.generated + "   (unbuildable: " + r.nulls + ")");
  console.log("uniqueness pass rate       " + pct(r.uniqueRate) + "   gate 100%");
  console.log("regeneration retry rate    " + pct(r.retryRate) + "   gate under 15%");
  console.log("minimal set median         " + r.median + "   gate " + (r.mode.target - 1) + " to " + (r.mode.target + 1));
  console.log("minimal set range          " + r.sizeMin + " to " + r.sizeMax);
  console.log("minimal set inside " + r.mode.lo + " to " + r.mode.hi + "  " + pct(r.inBandRate) + "   gate 95% or better");
  console.log("motive only minimal sets   " + r.motiveOnly + "   gate 0");
  console.log("clue text contradictions   " + r.textBad + "   gate 0");
  console.log("worst reach cost           " + r.reachMax + " actions   gate " + r.mode.reach + " or less");
  console.log("average reach cost         " + r.reachAvg.toFixed(2) + " actions");
  console.log("greedy agent solve rate    " + pct(r.greedyRate) + "   gate above 90%");
  console.log("greedy agent avg actions   " + r.greedyAvgActions.toFixed(2) + " of " + r.mode.actions);
  if (r.mode.liar) console.log("lie placement faults       " + r.lieBad + "   gate 0");
  console.log("perfect agent solve rate   " + pct(r.perfectRate) + "   gate 100%");
  console.log("avg clue pool / placed noise " + r.poolAvg.toFixed(1) + " / " + r.noiseAvg.toFixed(1));
  console.log("avg minimal clues behind press " + r.pressMinAvg.toFixed(2));
  console.log("");
  console.log("minimal set size histogram");
  var keys = Object.keys(r.hist).map(Number).sort(function (a, b) { return a - b; });
  var top = Math.max.apply(null, keys.map(function (k) { return r.hist[k]; }));
  keys.forEach(function (k) {
    var n = r.hist[k];
    var bar = "#".repeat(Math.max(1, Math.round(n / top * 40)));
    console.log("  " + String(k).padStart(2) + "  " + String(n).padStart(6) + "  " + bar);
  });
  console.log("");
}

function gateSweep(r) {
  var fails = [];
  if (r.uniqueRate !== 1) fails.push("uniqueness " + pct(r.uniqueRate));
  if (r.lieBad !== 0) fails.push("lie placement faults " + r.lieBad);
  if (r.nulls !== 0) fails.push(r.nulls + " cases could not be built at all");
  if (r.retryRate >= 0.15) fails.push("retry rate " + pct(r.retryRate));
  if (r.median < r.mode.target - 1 || r.median > r.mode.target + 1) fails.push("minimal median " + r.median);
  if (r.inBandRate < 0.95) fails.push("minimal band " + pct(r.inBandRate));
  if (r.motiveOnly !== 0) fails.push("motive only minimal sets " + r.motiveOnly);
  if (r.textBad !== 0) fails.push("clue text contradictions " + r.textBad);
  if (r.reachMax > r.mode.reach) fails.push("reach " + r.reachMax);
  if (r.greedyRate <= 0.90) fails.push("greedy " + pct(r.greedyRate));
  if (r.perfectRate !== 1) fails.push("perfect " + pct(r.perfectRate));
  return fails;
}

/* ------------------------------------------------------------------ */
/* watch a single case                                                 */
/* ------------------------------------------------------------------ */
function watch(seed) {
  var cs = G.generateCase(seed >>> 0);
  if (!cs) { console.log("seed " + seed + " produced no case"); return; }
  var T = cs.truth;
  console.log("");
  console.log(cs.title.toUpperCase() + "   seed " + cs.seed);
  console.log("=".repeat(58));
  console.log("TRUTH   " + G.SUSPECTS[T.c].n + " / " + G.WEAPONS[T.w].n + " / " +
    G.ROOMS[T.r].n + " / " + G.TIMES[T.t]);
  console.log("retries " + cs.retries + "   pool " + cs.pool.length +
    "   minimal " + cs.minimal.length + "   reach " + cs.minActions + " actions");
  console.log("");
  console.log("WHO WAS WHERE                7pm   8pm   9pm  10pm  11pm  12am");
  for (var s = 0; s < 6; s++) {
    var row = "  " + G.SUSPECTS[s].n.padEnd(8) +
      (s === T.c ? "[killer]" : "        ") + "  ";
    for (var t = 0; t < 6; t++) row += G.ROOMS[cs.world.loc[s][t]].n.slice(0, 5).padEnd(6);
    console.log(row);
  }
  console.log("");
  console.log("WEAPONS");
  for (var w = 0; w < 6; w++) {
    console.log("  " + G.WEAPONS[w].n.padEnd(20) + G.WEAPONS[w].cls.padEnd(8) +
      "owner " + G.SUSPECTS[cs.world.owner[w]].n.padEnd(8) + "kept in the " + G.ROOMS[cs.world.start[w]].n);
  }
  console.log("");
  console.log("MOTIVE  " + cs.world.motive.map(function (m, i) { return G.SUSPECTS[i].n + ":" + m; }).join("  "));
  console.log("");
  var minSet = {};
  cs.minimal.forEach(function (id) { minSet[id] = 1; });
  console.log("CLUE POOL (" + cs.pool.length + ")   * = minimal sufficient set");
  cs.pool.forEach(function (cl) {
    var mask = cs.masks[cl.id];
    var cut = G.CONFIG.TUPLES - G.bitsCount(mask);
    console.log("  " + (minSet[cl.id] ? "*" : " ") + String(cl.id).padStart(3) + "  " +
      G.TYPE_NAMES[cl.ty].padEnd(11) + "cuts " + String(cut).padStart(4) + "  " + G.clueText(cl));
  });
  console.log("");
  console.log("PLACEMENT");
  for (var i = 0; i < 6; i++) {
    console.log("  search  " + G.ROOMS[i].n.padEnd(14) +
      cs.place.rooms[i].map(function (id) { return (minSet[id] ? "*" : "") + id; }).join(" "));
  }
  for (i = 0; i < 6; i++) {
    var iv = cs.place.ints[i], pr = cs.place.press[i];
    console.log("  talk to " + G.SUSPECTS[i].n.padEnd(14) +
      "interview " + (iv === null ? "none" : (minSet[iv] ? "*" : "") + iv) +
      "   press " + (pr === null ? "none" : (minSet[pr] ? "*" : "") + pr));
  }
  console.log("");
  var g = G.greedyAgent(cs, G.makeRNG(seed ^ 0x9e3779b9));
  var p = G.perfectAgent(cs);
  console.log("greedy agent  solved " + g.solved + " in " + g.actionsUsed + " actions");
  console.log("perfect agent solved " + p.solved + " in " + p.actionsUsed + " actions");
  console.log("");
}

/* ------------------------------------------------------------------ */
/* test harness                                                        */
/* ------------------------------------------------------------------ */
function runTests() {
  if (!TEST_SRC) { console.error("TEST_EXPORT markers not found in index.html"); process.exit(2); }
  var tf = new Function("SIM", TEST_SRC + "\n;return buildTests(SIM);");
  var TEST = tf(G);
  TEST.run();
  var rep = TEST.report();
  rep.failures.forEach(function (f) { console.log("FAIL  " + f.name + "   " + (f.detail || "")); });
  console.log("total assertions " + rep.total);
  console.log("PASSED " + rep.passed + " / FAILED " + rep.failed);
  return rep;
}

/* ------------------------------------------------------------------ */
var args = process.argv.slice(2);
function arg(name, dflt) {
  var hit = args.filter(function (a) { return a.indexOf("--" + name) === 0; })[0];
  if (!hit) return dflt;
  var eq = hit.indexOf("=");
  return eq < 0 ? true : hit.slice(eq + 1);
}

if (arg("watch", null) !== null && arg("watch", null) !== undefined && args.some(function (a) { return a.indexOf("--watch") === 0; })) {
  watch(parseInt(arg("watch", "1"), 10) || 1);
  process.exit(0);
}

function domGates() {
  try { return require("./domsmoke.js").run(); }
  catch (e) { return ["dom smoke could not run: " + e.message]; }
}

if (args.some(function (a) { return a === "--dom"; })) {
  var df = domGates();
  df.forEach(function (f) { console.log("DOM FAIL  " + f); });
  console.log(df.length ? "dom smoke FAILED" : "dom smoke PASSED");
  process.exit(df.length ? 1 : 0);
}

if (args.some(function (a) { return a === "--layout"; })) {
  var lf = layoutGates();
  lf.forEach(function (f) { console.log("LAYOUT FAIL  " + f); });
  console.log(lf.length ? "layout gates FAILED" : "layout gates PASSED");
  process.exit(lf.length ? 1 : 0);
}

if (args.some(function (a) { return a === "--grep"; })) {
  var gf = grepGates();
  gf.forEach(function (f) { console.log("GREP FAIL  " + f); });
  console.log(gf.length ? "grep gates FAILED" : "grep gates PASSED");
  process.exit(gf.length ? 1 : 0);
}

if (args.some(function (a) { return a === "--test"; })) {
  var gfails = grepGates().concat(layoutGates()).concat(domGates());
  gfails.forEach(function (f) { console.log("GATE FAIL  " + f); });
  var rep = runTests();
  process.exit((rep.failed || gfails.length) ? 1 : 0);
}

var n = parseInt(arg("cases", arg("runs", "1000")), 10) || 1000;
var seed = parseInt(arg("seed", "1"), 10) || 1;
var tierArg = arg("tier", null);
var liarArg = args.some(function (a) { return a === "--liar"; });

if (args.some(function (a) { return a === "--all"; })) {
  // every mode on the ladder, both honest and unreliable, gated the same way
  var allFails = 0;
  G.TIER_KEYS.forEach(function (t) {
    [false, true].forEach(function (L) {
      var rr = sweep(n, seed, false, { tier: t, liar: L });
      var ff = gateSweep(rr);
      ff.forEach(function (f) { console.log("GATE FAIL  " + f); });
      console.log(ff.length ? "GATES FAILED (" + ff.length + ") for " + t + (L ? " with a liar" : "")
        : "GATES PASSED for " + t + (L ? " with a liar" : ""));
      allFails += ff.length;
    });
  });
  console.log(allFails ? "LADDER SWEEP FAILED (" + allFails + ")" : "LADDER SWEEP PASSED");
  process.exit(allFails ? 1 : 0);
}

var r = sweep(n, seed, false, { tier: tierArg, liar: liarArg });
var fails = gateSweep(r);
fails.forEach(function (f) { console.log("GATE FAIL  " + f); });
console.log(fails.length ? "SWEEP GATES FAILED (" + fails.length + ")" : "SWEEP GATES PASSED");
process.exit(fails.length ? 1 : 0);
