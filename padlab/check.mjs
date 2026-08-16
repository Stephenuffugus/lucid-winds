#!/usr/bin/env node
/* PadLab source gate.  node padlab/check.mjs
 *
 * There is no browser in this lane, so this proves only what source can prove.
 * That is still most of what has broken PadLab before: a second clock, a
 * control wired to an id that does not exist, drums leaking onto the effects
 * bus, and the two place version law.
 *
 * Every check here was watched failing on purpose before it was kept. A probe
 * that cannot fail is not evidence, so each one carries a selfTest that mutates
 * a copy of the source into the broken shape and asserts the check catches it.
 * Run with --selftest to see that happen; it also runs on every normal run, and
 * the gate exits 2 if a check has gone blind.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const HERE = dirname(fileURLToPath(import.meta.url));
const HTML = readFileSync(join(HERE, "index.html"), "utf8");
const SW = readFileSync(join(HERE, "sw.js"), "utf8");

/* ---------- helpers ---------- */

// the one script block, so JS checks never trip over markup or CSS
function scriptOf(html) {
  const m = html.match(/<script>\n([\s\S]*)<\/script>/);
  if (!m) throw new Error("no inline script block found");
  return m[1];
}
/* Comments explain the very bugs these checks hunt for, so a checker that reads
   them accuses the file of the thing it is warning about. Strip them first,
   keeping the line count so offsets still mean something. */
function stripComments(js) {
  let out = "", i = 0, n = js.length, mode = 0; // 0 code 1 line 2 block 3 str 4 tmpl 5 regex
  let q = "";
  while (i < n) {
    const c = js[i], d = js[i + 1];
    if (mode === 0) {
      if (c === "/" && d === "/") { mode = 1; i += 2; continue; }
      if (c === "/" && d === "*") { mode = 2; i += 2; continue; }
      if (c === '"' || c === "'") { mode = 3; q = c; out += c; i++; continue; }
      if (c === "`") { mode = 4; out += c; i++; continue; }
      out += c; i++; continue;
    }
    if (mode === 1) { if (c === "\n") { mode = 0; out += c; } i++; continue; }
    if (mode === 2) { if (c === "*" && d === "/") { mode = 0; i += 2; continue; } if (c === "\n") out += c; i++; continue; }
    if (mode === 3) { out += c; if (c === "\\") { out += d; i += 2; continue; } if (c === q) mode = 0; i++; continue; }
    if (mode === 4) { out += c; if (c === "\\") { out += d; i += 2; continue; } if (c === "`") mode = 0; i++; continue; }
  }
  return out;
}
function htmlComments(html) { return html.replace(/<!--[\s\S]*?-->/g, "").replace(/\/\*[\s\S]*?\*\//g, ""); }

const CHECKS = [];
function check(name, fn, selfTest) { CHECKS.push({ name, fn, selfTest }); }

/* ---------- 1. one clock ---------- */
/* PadLab's whole character is timing. The sequencer, the arpeggiator, the note
   repeat roll and now the marble plate all hang off one lookahead scheduler.
   A second timer that schedules audio is the bug this app cannot survive. */
check("one clock: schedulerTick is the only audio timer", (html) => {
  const js = stripComments(scriptOf(html));
  const intervals = [...js.matchAll(/setInterval\s*\(/g)];
  const timeouts = [...js.matchAll(/setTimeout\s*\(\s*schedulerTick/g)];
  const errs = [];
  if (timeouts.length !== 1) errs.push(`expected exactly one setTimeout(schedulerTick), found ${timeouts.length}`);
  // setInterval is allowed only where it drives text, never audio
  for (const m of intervals) {
    const body = js.slice(m.index, m.index + 400);
    if (/\b(drum|voiceFor|mbPlayHit|triggerPadAt|playSeqStep|arpTick|rollTick|marbleTick|start\s*\()/.test(body))
      errs.push("a setInterval schedules audio: " + body.slice(0, 70).replace(/\s+/g, " "));
  }
  // marbleTick must be called from inside schedulerTick and nowhere else
  const calls = [...js.matchAll(/\bmarbleTick\s*\(/g)];
  if (calls.length !== 2) errs.push(`marbleTick should be declared once and called once, found ${calls.length} occurrences`);
  const sched = js.slice(js.indexOf("function schedulerTick"), js.indexOf("function playSeqStep"));
  if (!/marbleTick\s*\(\s*grid\s*,\s*tPlay\s*,\s*six\s*\)/.test(sched))
    errs.push("marbleTick is not called from schedulerTick with (grid,tPlay,six)");
  // and it must be inside the playing branch, never free running
  if (!/isPlaying\s*&&\s*countinLeft===0\s*\)\s*marbleTick/.test(sched))
    errs.push("marbleTick is not gated on isPlaying && countinLeft===0");
  return errs;
}, (html) => html.replace("if(isPlaying && countinLeft===0) marbleTick(grid,tPlay,six);",
  "setInterval(()=>{ marbleTick(grid,ct(),0.1); },100);"));

/* ---------- 2. no rAF drives audio ---------- */
check("no rAF schedules sound", (html) => {
  const js = stripComments(scriptOf(html));
  const errs = [];
  for (const m of js.matchAll(/requestAnimationFrame\s*\(\s*([A-Za-z_$][\w$]*)\s*\)/g)) {
    const fn = m[1];
    // \b, or "function mbDraw" happily matches "function mbDrawPlates" first
    const decl = new RegExp("function\\s+" + fn + "\\s*\\(");
    const start = js.search(decl);
    if (start < 0) continue;
    const body = js.slice(start, start + 2600);
    if (/\b(mbPlayHit|triggerPadAt|voiceFor|playSeqStep)\s*\(/.test(body))
      errs.push(`rAF loop ${fn} triggers a voice; sound belongs to the scheduler`);
  }
  return errs;
}, (html) => html.replace("function mbDraw(){\n  mbRaf=requestAnimationFrame(mbDraw);",
  "function mbDraw(){\n  mbRaf=requestAnimationFrame(mbDraw); mbPlayHit(mbMarbles[0],ct());"));

/* ---------- 3. every id a control reaches for exists ---------- */
/* The single most common way to break a control here, and a syntax check will
   never see it. */
check("every getElementById target exists in the markup", (html) => {
  const defined = new Set();
  for (const m of html.matchAll(/\bid="([^"]+)"/g)) defined.add(m[1]);
  for (const m of html.matchAll(/\.id\s*=\s*["']([^"']+)["']/g)) defined.add(m[1]);
  // ids built at runtime from a loop index, e.g. fxrPtr0..7
  const dynamic = [/^fxrPtr\d$/, /^fxrVal\d$/];
  const errs = [];
  const js = stripComments(scriptOf(html));
  for (const m of js.matchAll(/getElementById\(\s*["']([^"']+)["']\s*\)/g)) {
    const id = m[1];
    if (defined.has(id) || dynamic.some((r) => r.test(id))) continue;
    errs.push(`getElementById("${id}") has no matching id in the markup`);
  }
  return errs;
}, (html) => html.replace('id="mb-showbeat"', 'id="mb-showbeat-renamed"'));

/* ---------- 4. bus routing ---------- */
/* 4.1 of the handoff: drums bypass the effects bus on purpose, so cranking the
   reverb never turns the beat to mush. The marble voices have to obey it too,
   including the snare's second gain layer, which once went to master. */
check("bus routing: marble drums to drumBus, pitched marbles to instrBus", (html) => {
  const js = stripComments(scriptOf(html));
  const errs = [];
  const start = js.indexOf("function mbPlayHit");
  if (start < 0) return ["mbPlayHit is gone"];
  const body = js.slice(start, js.indexOf("function mbAudition"));
  if (!/const drums=!mbPitched\(m\.type\);/.test(body)) errs.push("mbPlayHit no longer splits drums from pitched voices by mbPitched()");
  if (!/g\.connect\(drums\?drumBus:instrBus\)/.test(body)) errs.push("the marble output gain is not routed drums?drumBus:instrBus");
  for (const m of body.matchAll(/\.connect\((\w+)\)/g)) {
    const dest = m[1];
    if (dest === "master" || dest === "comp" || dest === "AC")
      errs.push(`a marble voice connects straight to ${dest}, bypassing the busses`);
  }
  // the drum busses in the studio graph must still be wired the documented way
  if (!/drumBus=AC\.createGain\(\);\s*drumBus\.connect\(master\)/.test(js)) errs.push("drumBus no longer connects to master");
  if (!/instrBus=AC\.createGain\(\);\s*instrBus\.connect\(toneFilter\)/.test(js)) errs.push("instrBus no longer feeds toneFilter");
  return errs;
}, (html) => html.replace("o.connect(g2); g2.connect(drumBus); o.start(t); o.stop(t+0.12);",
  "o.connect(g2); g2.connect(master); o.start(t); o.stop(t+0.12);"));

/* ---------- 5. marble pitch stays a scale degree ---------- */
/* Re-keying the studio has to re-key the plate. The moment a marble stores a
   fixed semitone that stops being true, and it is not the kind of thing you
   notice until a song is in the wrong key. */
check("marble pitch is a scale degree resolved at play time", (html) => {
  const js = stripComments(scriptOf(html));
  const errs = [];
  if (!/function mbMidiOf\(deg\)/.test(js)) errs.push("mbMidiOf is gone");
  if (!/allowedMidis\[j\]/.test(js)) errs.push("mbMidiOf no longer resolves through allowedMidis");
  const hit = js.slice(js.indexOf("function mbPlayHit"), js.indexOf("function mbAudition"));
  if (!/mbMidiOf\(m\.deg\)/.test(hit)) errs.push("mbPlayHit does not resolve the degree at play time");
  if (/\bm\.semi\b/.test(js)) errs.push("a marble is storing m.semi, which is a fixed note, not a degree");
  // changing key or scale has to rebuild the marble chips, or the note names lie
  const wire = js.slice(js.indexOf("function wire(){"), js.indexOf("function openPadSettings"));
  for (const sel of ["keyRoot", "scaleSel"]) {
    const line = wire.split("\n").find((l) => l.includes(`getElementById("${sel}").onchange`));
    if (!line || !/mbBuildChips\(\)/.test(line)) errs.push(`${sel} change does not rebuild the marble chips`);
  }
  return errs;
}, (html) => html.replace("const f=440*Math.pow(2,(mbMidiOf(m.deg)-69)/12);\n      const o=AC.createOscillator(); o.type=\"triangle\";",
  "const f=440*Math.pow(2,(m.semi+60-69)/12);\n      const o=AC.createOscillator(); o.type=\"triangle\";"));

/* ---------- 6. the state trio ---------- */
check("collect, apply and refresh all know about the marble tab", (html) => {
  const js = stripComments(scriptOf(html));
  const errs = [];
  const collect = js.slice(js.indexOf("function collectState"), js.indexOf("function applyStateVars"));
  const apply = js.slice(js.indexOf("function applyStateVars"), js.indexOf("async function saveProject"));
  // end on real code, not a comment marker: stripComments has already eaten those
  const refresh = js.slice(js.indexOf("function refreshAllUI"), js.indexOf("const MB_NOTES"));
  if (refresh.length < 200) return ["refreshAllUI could not be located"];
  if (!/marble:\s*\{/.test(collect)) errs.push("collectState does not write the marble key");
  if (!/showBeat:mbShowBeat/.test(collect)) errs.push("collectState does not save the Show my beat toggle");
  if (!/s\.marble/.test(apply)) errs.push("applyStateVars does not read the marble key");
  if (!/mbPlates=\[\{x0:0,y0:0/.test(apply)) errs.push("applyStateVars has no default plate for projects that predate the tab");
  if (!/mbBuildChips\(\)/.test(refresh) || !/mbRebuildGhosts\(\)/.test(refresh)) errs.push("refreshAllUI does not push marble state into the DOM");
  if (!/v:\s*4/.test(collect)) errs.push("the state version is not 4");
  return errs;
}, (html) => html.replace("    mbBuildChips(); mbRebuildGhosts(); mbCamDirty=true;", "    mbCamDirty=true;"));

/* ---------- 7. ghosts follow the beat they are a picture of ---------- */
check("Show my beat rebuilds on every edit that changes the pattern", (html) => {
  const js = stripComments(scriptOf(html));
  const errs = [];
  const seq = js.slice(js.indexOf("function renderSeq()"), js.indexOf("function highlightStep"));
  if (!/mbRebuildGhosts\(\)/.test(seq)) errs.push("renderSeq does not rebuild the ghosts");
  // the cell handler mutates tracks directly and never calls renderSeq
  const cell = seq.split("\n").find((l) => l.includes("p.tracks[r][s]=p.tracks[r][s]?0:1"));
  if (!cell || !/mbRebuildGhosts\(\)/.test(cell)) errs.push("toggling a step does not rebuild the ghosts, so Show my beat goes stale");
  const mute = seq.split("\n").find((l) => l.includes("p.mutes[r]=!p.mutes[r]"));
  if (!mute || !/mbRebuildGhosts\(\)/.test(mute)) errs.push("muting a track does not rebuild the ghosts");
  // ghosts must never sound: the sequencer is already playing them
  const tick = js.slice(js.indexOf("function marbleTick"), js.indexOf("/* ---- camera ----"));
  const ghostLoop = tick.slice(tick.indexOf("mbGhosts"));
  if (/mbPlayHit/.test(ghostLoop)) errs.push("a ghost marble sounds; the sequencer already plays that note");
  return errs;
}, (html) => html.replace("document.querySelectorAll(\".groove\").forEach(el=>el.classList.remove(\"playing\")); mbRebuildGhosts(); saveSoon(); });\n      cells.appendChild(c); }",
  "document.querySelectorAll(\".groove\").forEach(el=>el.classList.remove(\"playing\")); saveSoon(); });\n      cells.appendChild(c); }"));

/* ---------- 8. the two place version law ---------- */
check("SHELL_VERSION and the registration ?v= agree", (html, sw) => {
  const shell = sw.match(/SHELL_VERSION\s*=\s*"padlab-shell-v(\d+)"/);
  const reg = html.match(/register\("\.\/sw\.js\?v=(\d+)"\)/);
  if (!shell) return ["sw.js has no SHELL_VERSION"];
  if (!reg) return ["index.html does not register a versioned sw.js"];
  if (shell[1] !== reg[1]) return [`SHELL_VERSION is v${shell[1]} but the registration asks for ?v=${reg[1]}; this host edge pins the old worker and strands the player`];
  return [];
}, (html) => html.replace('sw.js?v=11', 'sw.js?v=9'));

/* ---------- 9. no dash characters in player facing copy ---------- */
check("no dash characters in copy", (html) => {
  const errs = [];
  const markup = htmlComments(html.slice(0, html.indexOf("<script>")));
  for (const line of markup.split("\n")) if (/[—–]/.test(line)) errs.push("markup: " + line.trim().slice(0, 90));
  const js = stripComments(scriptOf(html));
  for (const line of js.split("\n")) if (/[—–]/.test(line)) errs.push("script: " + line.trim().slice(0, 90));
  return errs;
}, (html) => html.replace(">Fat beats. Tap to play", ">Fat beats — tap to play"));

/* ---------- 10. reach: touch targets and the marble controls ---------- */
check("marble controls declare a 48px minimum", (html) => {
  const css = html.slice(html.indexOf("<style>"), html.indexOf("</style>"));
  const errs = [];
  const want = [[/\.mb-btn\{[^}]*min-height:48px/, ".mb-btn"], [/\.mb-chip\{[^}]*min-height:48px/, ".mb-chip"],
                [/#mb-zoom \.mb-btn\{[^}]*width:48px;height:48px/, "#mb-zoom .mb-btn"], [/\.tab\{[^}]*min-height:48px/, ".tab"],
                [/\.chip\{[^}]*min-height:48px/, ".chip"]];
  for (const [re, what] of want) if (!re.test(css.replace(/\s*\n\s*/g, ""))) errs.push(`${what} no longer declares a 48px minimum`);
  // every button inside the marble dock has to be wired to something
  const js = stripComments(scriptOf(html));
  const dock = html.slice(html.indexOf('<div id="mb-dock">'), html.indexOf("</section>", html.indexOf('<div id="mb-dock">')));
  for (const m of html.slice(html.indexOf('<section class="view" id="view-marble">'), html.indexOf("</main>")).matchAll(/<button[^>]*id="(mb-[^"]+)"/g)) {
    if (!new RegExp(`getElementById\\("${m[1]}"\\)\\s*\\.onclick|getElementById\\("${m[1]}"\\);[\\s\\S]{0,200}\\.onclick`).test(js))
      errs.push(`the ${m[1]} button is not wired to anything`);
  }
  if (!dock) errs.push("the marble dock is gone");
  return errs;
}, (html) => html.replace('<button class="mb-btn" id="mb-fit" aria-label="Fit the whole plate on screen">Fit</button>',
  '<button class="mb-btn" id="mb-orphan">Nothing</button>'));

/* ---------- 11. the plate cannot run away with the audio thread ---------- */
check("a full plate is capped", (html) => {
  const js = stripComments(scriptOf(html));
  const errs = [];
  if (!/MB_MAX_MARBLES\s*=\s*\d+/.test(js)) errs.push("there is no cap on how many marbles a plate holds");
  const tap = js.slice(js.indexOf("function mbTap"), js.indexOf('document.getElementById("mb-zin")'));
  if (!/mbMarbles\.length>=MB_MAX_MARBLES/.test(tap)) errs.push("mbTap does not check the cap before placing a marble");
  const tick = js.slice(js.indexOf("function marbleTick"), js.indexOf("/* ---- camera ----"));
  if (!/MB_MAX_HITS_PER_TICK/.test(tick)) errs.push("marbleTick has no per tick voice guard");
  return errs;
}, (html) => html.replace('if(mbMarbles.length>=MB_MAX_MARBLES){ toast("The plate is full. Take one off first"); return; }', ""));

/* ---------- 12. the canvas keeps up with the window ---------- */
check("the marble canvas resizes with the window", (html) => {
  const js = stripComments(scriptOf(html));
  const errs = [];
  const start = js.indexOf('window.addEventListener("resize"');
  if (start < 0) return ["there is no window resize handler at all"];
  const body = js.slice(start, start + 700);
  if (!/mbResize\(\)/.test(body)) errs.push("the resize handler does not resize the marble canvas, so a turned phone puts every tap on the wrong cell");
  if (!/view-marble/.test(body)) errs.push("the resize handler does not check the marble view is visible; a hidden canvas measures zero by zero");
  return errs;
}, (html) => html.replace("  const mv=document.getElementById(\"view-marble\");\n  if(mv && mv.classList.contains(\"on\")) mbResize(); });", " });"));

/* ---------- 13. every header control says what it is ---------- */
/* Found by looking, 2026-08-16: five glyphs in a row with no words. A child can
   only learn an unlabelled icon by pressing it and seeing what happens. */
check("every header control carries a visible label and an aria-label", (html) => {
  const head = html.slice(html.indexOf("<header>"), html.indexOf("</header>"));
  const errs = [];
  for (const m of head.matchAll(/<button[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/button>/g)) {
    const [, id, inner] = m;
    if (!/aria-label="[^"]{3,}"/.test(m[0])) errs.push(`the ${id} button has no aria-label`);
    if (!/<span class="hlab">[^<]{2,}<\/span>/.test(inner)) errs.push(`the ${id} button shows no visible label`);
  }
  const pill = head.match(/<div class="midi-pill"[\s\S]*?<\/div>/);
  if (!pill) errs.push("the MIDI pill is gone");
  else {
    if (!/aria-label="[^"]{3,}"/.test(pill[0])) errs.push("the MIDI pill has no aria-label");
    if (!/<span class="hlab">[^<]{2,}<\/span>/.test(pill[0])) errs.push("the MIDI pill shows no visible label when the device name is hidden");
    // a div with role=button but no key handler promises focus it cannot honour,
    // and a focused div eats the Space bar the document uses for play and stop
    if (/role="button"/.test(pill[0]) && !/keydown/.test(stripComments(scriptOf(html))))
      errs.push("the MIDI pill claims role=button with no keyboard handler behind it");
  }
  const css = html.slice(html.indexOf("<style>"), html.indexOf("</style>")).replace(/\s*\n\s*/g, "");
  if (!/\.hlab\{[^}]*font-size:8px/.test(css)) errs.push(".hlab has lost its type size");
  if (!/\.hbtn\{[^}]*width:48px/.test(css)) errs.push(".hbtn is no longer 48px wide");
  return errs;
}, (html) => html.replace('<span class="hlab">FX</span>', ""));

/* ---------- 14. the transport prints its longest line whole ---------- */
/* Found by looking, 2026-08-16: the subtitle read "pick a gro..." at 390px. The
   fix is only real if it holds for the LONGEST string the slot can ever show,
   not the one that happens to be there at boot. */
check("the beat name slot fits its longest string on a 360px phone", (html) => {
  const js = stripComments(scriptOf(html));
  const errs = [];
  // every string that can land in nbSub, from the markup and from every writer
  const strings = [];
  const dflt = html.match(/<div class="nb-sub" id="nbSub">([^<]*)<\/div>/);
  if (dflt) strings.push(dflt[1]);
  for (const line of js.split("\n")) {
    if (!line.includes('getElementById("nbSub").textContent')) continue;
    for (const m of line.matchAll(/"([^"]*)"/g)) {
      if (m[1] === "nbSub") continue;
      /* a literal that opens with a space is the tail of a concatenation, so it
         arrives with a number in front of it; tempo and bpm reach three digits */
      strings.push(/^ /.test(m[1]) ? "142" + m[1] : m[1]);
    }
    if (/padStart/.test(line)) strings.push("* REC 10:05");
  }
  if (strings.length < 4) errs.push(`only found ${strings.length} nbSub strings; the scan has drifted from the code`);

  /* Space Mono is a monospace at 0.6em advance, plus the .5px tracking the rule
     asks for. The slot is what the transport row has left at 390px after the
     furniture, using the narrow-width sizes from the media query. */
  const css = html.slice(html.indexOf("<style>"), html.indexOf("</style>")).replace(/\s*\n\s*/g, "");
  const narrow = css.slice(css.indexOf("@media (max-width:430px){ .meter"));
  const meterW = +(narrow.match(/\.meter\{width:(\d+)px/) || [, 46])[1];
  const tempoIn = +(narrow.match(/\.tempo-box input\{width:(\d+)px/) || [, 74])[1];
  const tempoPad = +(narrow.match(/\.tempo-box\{[^}]*padding:5px (\d+)px/) || [, 10])[1];
  const W = 360;   // Galaxy S8 and friends, narrower than the 390 this was shot at
  const slot = W - 26 /* transport padding */ - 36 /* four gaps */ - 104 /* play + rec */
             - meterW - (tempoIn + tempoPad * 2 + 2 /* borders */);
  const longest = strings.reduce((a, b) => (b.length > a.length ? b : a), "");
  const px = longest.length * (10 * 0.6 + 0.5);
  if (px > slot) errs.push(`"${longest}" needs about ${Math.round(px)}px and the slot is ${slot}px at ${W} wide, so it truncates`);
  return errs;
}, (html) => html.replace('.textContent=tempo+" BPM";',
  '.textContent=tempo+" BPM · tap keys or pads to jam";'));

/* ---------- 15. the plate keeps time, at every tempo ---------- */
/* The checks above read the source. This one RUNS it: the real schedulerTick,
   the real marbleTick and the real mbPeriod16 are lifted out of index.html and
   driven in a vm against a fake AudioContext clock, so the hit times are the
   app's own arithmetic and not a copy of it kept in this file. A copy would
   drift, and then it would agree with itself forever. */
function extractFn(js, name) {
  const at = js.search(new RegExp("function\\s+" + name + "\\s*\\("));
  if (at < 0) throw new Error("cannot find function " + name);
  let i = js.indexOf("{", at), depth = 0;
  for (let j = i; j < js.length; j++) {
    if (js[j] === "{") depth++;
    else if (js[j] === "}") { depth--; if (depth === 0) return js.slice(at, j + 1); }
  }
  throw new Error("unbalanced braces in " + name);
}
function runTiming(html) {
  const js = stripComments(scriptOf(html));
  const notes = js.match(/const MB_NOTES=\[[\s\S]*?\];/)[0];
  const src = [notes, "const MB_MAX_HITS_PER_TICK=999;", extractFn(js, "mbPeriod16"),
    extractFn(js, "marbleTick"), extractFn(js, "schedulerTick")].join("\n");

  const hits = [], steps = [];
  const sandbox = {
    now: 0, hits, steps,
    ct: () => sandbox.now,
    tempo: 120, swing: 0, isPlaying: true, countinLeft: 0, grid: 0, nextTime: 0,
    metroOn: false, songMode: false, songChain: [], songPos: -1, curSlot: 0,
    arpOn: false, rollOn: false, heldPads: { size: 0 }, uiQ: [], mbGhosts: [], mbMarbles: [],
    schedTimer: null, setTimeout: () => 0, clearTimeout: () => {},
    mbPlayHit: (m, t) => hits.push({ m, t }),
    playSeqStep: (s, t) => steps.push({ s, t }),
    drum: () => {}, arpTick: () => {}, rollTick: () => {}, songSlotUI: () => {}, highlightStep: () => {},
  };
  sandbox.globalThis = sandbox;
  const ctx = vm.createContext(sandbox);
  vm.runInContext(src, ctx);

  const errs = [];
  const SHELVES = [0, 1, 2, 3, 4];                       // 1/16 1/8 1/4 1/2 1bar
  for (const tempo of [50, 74, 90, 120, 140, 200]) {
    for (const swing of [0, 40]) {
      sandbox.tempo = tempo; sandbox.swing = swing;
      sandbox.grid = 0; sandbox.now = 0; sandbox.nextTime = 0.06;
      hits.length = 0; steps.length = 0;
      sandbox.mbMarbles = [
        { gx: 0, gy: 0, type: "bass", shelf: 2, deg: 0, phase: 0 },        // every beat
        { gx: 1, gy: 0, type: "snare", shelf: 3, deg: 0, phase: 0.5 },     // 2 and 4
        { gx: 2, gy: 0, type: "hat", shelf: 1, deg: 0, phase: 0.5 },       // off eighths
        { gx: 3, gy: 0, type: "melody", shelf: 4, deg: 0, phase: 0.25 },   // beat 2 of the bar
      ];
      // four bars of wall clock, fed to the scheduler the way the browser would
      const spb = 60 / tempo, six = spb / 4, bars = 4;
      for (let t = 0; t <= six * 16 * bars; t += 0.005) { sandbox.now = t; ctx.schedulerTick(); }

      const expect = [[4, 0], [8, 4], [2, 1], [16, 4]];   // [period in 16ths, offset in 16ths]
      const G = sandbox.grid;   // every sixteenth the scheduler actually reached
      for (let i = 0; i < 4; i++) {
        const mine = hits.filter((h) => h.m === sandbox.mbMarbles[i]);
        const [p16, off] = expect[i];
        // exactly one hit for every sixteenth in the run that matches the offset:
        // catches a dropped hit as well as a doubled one
        let want = 0;
        for (let g = 0; g < G; g++) if (g % p16 === off) want++;
        if (mine.length !== want)
          errs.push(`${tempo}bpm swing${swing}: marble ${i} hit ${mine.length} times over ${G} sixteenths, the grid calls for ${want}`);
        for (const h of mine) {
          // the step this hit claims to be on, and where the sequencer would put it
          const k = Math.round((h.t - 0.06) / six);
          const g = k;                                     // grid index at that sixteenth
          if (((g % p16) + p16) % p16 !== off)
            errs.push(`${tempo}bpm swing${swing}: marble ${i} sounded on sixteenth ${g}, which is not offset ${off} of ${p16}`);
          // swing: odd sixteenths are pushed late by swing% of a sixteenth, and a
          // marble must inherit exactly that, never its own idea of the beat
          const wantT = 0.06 + g * six + (g % 2 === 1 ? six * (swing / 100) : 0);
          if (Math.abs(h.t - wantT) > 1e-9)
            errs.push(`${tempo}bpm swing${swing}: marble ${i} sounded at ${h.t.toFixed(6)}, the grid says ${wantT.toFixed(6)}`);
        }
      }
      // and the plate has to agree with the sequencer, not merely with itself
      const beatSteps = steps.filter((s) => s.s % 4 === 0).map((s) => s.t);
      const beatMarbles = hits.filter((h) => h.m === sandbox.mbMarbles[0]).map((h) => h.t);
      for (const bt of beatMarbles) {
        if (!beatSteps.some((st) => Math.abs(st - bt) < 1e-9))
          errs.push(`${tempo}bpm swing${swing}: a quarter note marble landed at ${bt.toFixed(6)} with no sequencer step there`);
      }
    }
  }
  return errs;
}
check("the plate keeps time with the sequencer at every tempo", (html) => runTiming(html),
  // swing lives in tPlay: hand the marbles the raw grid time and they drift off the beat
  (html) => html.replace("if(isPlaying && countinLeft===0) marbleTick(grid,tPlay,six);",
    "if(isPlaying && countinLeft===0) marbleTick(grid,nextTime,six);"));

/* ---------- run ---------- */
const selfOnly = process.argv.includes("--selftest");
let failed = 0, blind = 0;
for (const c of CHECKS) {
  // does the check still have teeth?
  let caught = false;
  try {
    const broken = c.selfTest(HTML, SW);
    if (broken === HTML) throw new Error("the self test did not change anything");
    caught = c.fn(broken, SW).length > 0;
  } catch (e) { caught = false; console.log(`  self test for "${c.name}" threw: ${e.message}`); }
  if (!caught) { blind++; console.log(`BLIND  ${c.name}  (its self test did not trip it)`); continue; }

  if (selfOnly) { console.log(`teeth  ${c.name}`); continue; }
  const errs = c.fn(HTML, SW);
  if (errs.length) { failed++; console.log(`FAIL   ${c.name}`); for (const e of errs) console.log(`         ${e}`); }
  else console.log(`ok     ${c.name}`);
}
console.log("");
if (blind) { console.log(`${blind} check(s) went blind. Fix the check before trusting the run.`); process.exit(2); }
if (failed) { console.log(`${failed} check(s) failed.`); process.exit(1); }
console.log(`${CHECKS.length} checks pass, and each one was watched failing first.`);
