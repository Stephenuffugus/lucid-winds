#!/usr/bin/env node
/* BLACKOUT headless runner. Zero dependencies.
   Pulls the CONFIG / RNG / DATA / GEN / SIM layers straight out of index.html
   via the marker comments, so there is exactly one copy of the game logic.

     node sim.js --test            full assertion harness, nonzero exit on failure
     node sim.js --cases=10000     the section 4.8 verification sweep
     node sim.js --watch=12345     print one case in full for a human to read
     node sim.js --grep            the grep gates (Math.random, DOM, dashes)
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

var EXPORTS = ["CONFIG", "makeRNG", "seedFromString", "dailySeed", "SUSPECTS", "WEAPONS",
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
function grepGates() {
  var fails = [];
  if (/Math\.random/.test(SIM_SRC)) fails.push("Math.random inside SIM_EXPORT markers");
  var dom = SIM_SRC.match(/\b(document|window|canvas|performance|requestAnimationFrame)\b/g);
  if (dom) fails.push("DOM reference inside SIM: " + Array.from(new Set(dom)).join(", "));
  if (/[‐-―]/.test(HTML)) fails.push("en or em dash somewhere in index.html");
  var copy = region("// ---- COPY_START ----", "// ---- COPY_END ----", true);
  var strings = copy.match(/"(?:[^"\\]|\\.)*"/g) || [];
  strings.forEach(function (s) { if (s.indexOf("-") >= 0) fails.push("dash in copy string " + s); });
  var uiStrings = (region("// ---- UICOPY_START ----", "// ---- UICOPY_END ----", false)
    .match(/"(?:[^"\\]|\\.)*"/g) || []);
  uiStrings.forEach(function (s) { if (s.indexOf("-") >= 0) fails.push("dash in ui copy string " + s); });
  var bodyStart = HTML.indexOf("<body>"), bodyEnd = HTML.indexOf("</bo" + "dy>");
  var body = HTML.slice(bodyStart, bodyEnd);
  var scriptOpen = body.indexOf("<script>");
  var markup = scriptOpen >= 0 ? body.slice(0, scriptOpen) : body;
  var textNodes = markup.replace(/<[^>]*>/g, " ");
  if (/[‐-―]|(\s-\s)/.test(textNodes)) fails.push("dash in static markup text");
  var closer = "</scr" + "ipt>";
  if (SIM_SRC.indexOf(closer) >= 0) fails.push("literal closing script tag inside SIM source");
  return fails;
}

/* ------------------------------------------------------------------ */
/* the sweep                                                           */
/* ------------------------------------------------------------------ */
function sweep(n, baseSeed, quiet) {
  var i, cs, rng = G.makeRNG(baseSeed >>> 0);
  var hist = {}, sizes = [], retries = 0, nulls = 0;
  var greedySolved = 0, perfectSolved = 0, greedyActions = 0;
  var reachMax = 0, reachSum = 0, motiveOnly = 0, textBad = 0, uniqueFail = 0;
  var poolSizes = [], noiseSum = 0, pressMin = 0, greedyRuns = 0;
  var t0 = Date.now();
  for (i = 0; i < n; i++) {
    var seed = (rng.int(0x7ffffffe) + 1) >>> 0;
    cs = G.generateCase(seed);
    if (!cs) { nulls++; continue; }
    retries += cs.retries;

    // independent re verification: do not trust the generator's own claim
    var acc = G.solveMask(cs.pool, cs.masks);
    if (G.bitsCount(acc) !== 1 || G.bitsFirst(acc) !== G.tupleIndex(cs.truth)) uniqueFail++;
    var mn = cs.minimal.map(function (id) { return cs.pool[id]; });
    var accM = G.solveMask(mn, cs.masks);
    if (G.bitsCount(accM) !== 1 || G.bitsFirst(accM) !== G.tupleIndex(cs.truth)) uniqueFail++;

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
  var inBand = sizes.filter(function (s) { return s >= G.CONFIG.MIN_SET_LO && s <= G.CONFIG.MIN_SET_HI; }).length;
  var res = {
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
  console.log("BLACKOUT verification sweep, " + r.n + " cases, " + r.ms + " ms");
  console.log("=".repeat(58));
  console.log("cases generated            " + r.generated + "   (unbuildable: " + r.nulls + ")");
  console.log("uniqueness pass rate       " + pct(r.uniqueRate) + "   gate 100%");
  console.log("regeneration retry rate    " + pct(r.retryRate) + "   gate under 15%");
  console.log("minimal set median         " + r.median + "   gate 10 to 12");
  console.log("minimal set range          " + r.sizeMin + " to " + r.sizeMax);
  console.log("minimal set inside 8 to 14 " + pct(r.inBandRate) + "   gate 95% or better");
  console.log("motive only minimal sets   " + r.motiveOnly + "   gate 0");
  console.log("clue text contradictions   " + r.textBad + "   gate 0");
  console.log("worst reach cost           " + r.reachMax + " actions   gate " + G.CONFIG.REACH_BOUND + " or less");
  console.log("average reach cost         " + r.reachAvg.toFixed(2) + " actions");
  console.log("greedy agent solve rate    " + pct(r.greedyRate) + "   gate above 90%");
  console.log("greedy agent avg actions   " + r.greedyAvgActions.toFixed(2) + " of " + G.CONFIG.ACTIONS);
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
  if (r.nulls !== 0) fails.push(r.nulls + " cases could not be built at all");
  if (r.retryRate >= 0.15) fails.push("retry rate " + pct(r.retryRate));
  if (r.median < 10 || r.median > 12) fails.push("minimal median " + r.median);
  if (r.inBandRate < 0.95) fails.push("minimal band " + pct(r.inBandRate));
  if (r.motiveOnly !== 0) fails.push("motive only minimal sets " + r.motiveOnly);
  if (r.textBad !== 0) fails.push("clue text contradictions " + r.textBad);
  if (r.reachMax > G.CONFIG.REACH_BOUND) fails.push("reach " + r.reachMax);
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

if (args.some(function (a) { return a === "--grep"; })) {
  var gf = grepGates();
  gf.forEach(function (f) { console.log("GREP FAIL  " + f); });
  console.log(gf.length ? "grep gates FAILED" : "grep gates PASSED");
  process.exit(gf.length ? 1 : 0);
}

if (args.some(function (a) { return a === "--test"; })) {
  var gfails = grepGates();
  gfails.forEach(function (f) { console.log("GREP FAIL  " + f); });
  var rep = runTests();
  process.exit((rep.failed || gfails.length) ? 1 : 0);
}

var n = parseInt(arg("cases", arg("runs", "1000")), 10) || 1000;
var seed = parseInt(arg("seed", "1"), 10) || 1;
var r = sweep(n, seed, false);
var fails = gateSweep(r);
fails.forEach(function (f) { console.log("GATE FAIL  " + f); });
console.log(fails.length ? "SWEEP GATES FAILED (" + fails.length + ")" : "SWEEP GATES PASSED");
process.exit(fails.length ? 1 : 0);
