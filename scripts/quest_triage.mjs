#!/usr/bin/env node
/* QUEST COMPATIBILITY TRIAGE — milestone M1 of the VR handoff.
     node scripts/quest_triage.mjs            writes QUEST-COMPAT.md
     node scripts/quest_triage.mjs --report   prints the table
     node scripts/quest_triage.mjs --selftest proves each detector can be wrong

   WHAT THIS IS AND IS NOT
   The Quest browser is Chromium, so our PWAs load in it today as flat panels.
   The question is not "does it load", it is "can somebody actually PLAY it with
   a controller pointer, standing in a headset, with no keyboard and no
   multi-touch". This reads every game's source for the things that make that
   impossible and sorts them.

   ⛔ THIS IS A SHORTLIST, NOT A VERDICT. Nothing here has been run on a
   headset. A game marked ok can still feel wrong in VR for reasons no static
   read can see: text too small at panel distance, a play area that needs a
   flick of the wrist, motion that induces discomfort. Stephen has a Quest 2;
   this exists so he does not have to open 183 games to find the interesting
   ones, and every call it makes should be checked against the device.

   The blockers, in the order they actually matter on a headset:
     keyboard   the Quest has no keyboard. A keyboard-only game is unplayable.
     multitouch there is one pointer. Pinch, two finger, and gestures are out.
     motion     tilt and shake controls have no analogue in a headset.
     hover      a controller ray does hover, so this is a caution, not a block.
     tiny       pointer precision is worse than a mouse and much worse than a
                thumb. Small targets that pass on a phone can miss in VR.
*/
import { readFileSync, writeFileSync, existsSync } from "fs";
/* ⛔⛔ catalog.mjs runs ITS OWN selftest at module-evaluation time on any
   process whose argv carries --selftest, and then process.exit(0)s. A STATIC
   import of it here meant `node scripts/quest_triage.mjs --selftest` printed
   the CATALOG's six checks, exited 0, and never reached this file's twelve
   detector cases at all. The gate the VR handoff names has therefore never
   run, on any day, since it was written: it was a green light wired to a
   different lamp. Fixed 2026-09-03 by importing catalog.mjs LAZILY (dynamic
   import is not hoisted), so the selftest block below is reached first and
   both selftests are runnable. */
let cat = null;

const PORTAL = "portal/index.html";
const OUT = "QUEST-COMPAT.md";

/* ⛔⛔ This had its own regex over the portal and it was WRONG. The GAMES rows
   carry 4, 5 or 7 fields; the regex hardcoded 4, so longer rows silently
   vanished and it reported 183 titles when the true figure is 186. Counting now
   comes from scripts/catalog.mjs, which parses the arrays. */
function catalog() {
  return cat(PORTAL).all.map(g => ({
    name: g.name, url: g.url, cat: g.cat, beta: g.gated, kind: g.kind,
    files: sourceFiles(g)
  }));
}

/* Which files in THIS repo are a catalog row's source. Returns [] when the
   source genuinely lives on another origin, which is what makes a row read
   "unknown".

   Four shapes of url appear in the FEATURED array:
     /satellites/<dir>/          a vendored satellite            (105 rows)
     /<page>.html, /<d>/<p>.html a page in this repo's own tree  (LOAF, Whack Box)
     https://lucidwinds.com/...  the app's OWN origin, so also this repo
     https://<other host>/...    genuinely somebody else's origin (Pom Pond)
   Only the last one is unknown. Before 2026-09-03 the middle two were reported
   as unknown as well, which published a false claim about a file in the repo
   root and left three rows untriaged. */
const OWN_ORIGINS = ["https://lucidwinds.com", "http://lucidwinds.com", "https://www.lucidwinds.com"];

function sourceFiles(g) {
  if (g.kind !== "satellite") return ["play/" + g.id + ".html", "games/" + g.id + ".js"];
  if (g.dir) return ["satellites/" + g.dir + "/index.html"];

  let u = String(g.url || "");
  for (const o of OWN_ORIGINS) if (u.startsWith(o)) { u = u.slice(o.length) || "/"; break; }
  if (/^[a-z]+:\/\//i.test(u)) return [];              /* somebody else's origin */
  u = u.split("#")[0].split("?")[0];                    /* ?v=20260808b is a cache buster, not a path */
  if (!u.startsWith("/")) return [];
  let page = u === "/" || u.endsWith("/") ? u.slice(1) + "index.html" : u.slice(1);
  if (!page) page = "index.html";
  if (!existsSync(page)) return [];

  /* A LAUNCHER PAGE IS NOT THE GAME. party/host.html is 7KB of shell that pulls
     its logic from party/shell/*.js; reading the launcher alone would call
     Whack Box clean without having read a line of it. So follow the relative
     <script src> the page declares, one level, files that exist only. This
     branch is reached by root relative rows ONLY, so no satellite or native
     verdict can move because of it. */
  const files = [page];
  const dir = page.includes("/") ? page.slice(0, page.lastIndexOf("/") + 1) : "";
  let src = "";
  try { src = readFileSync(page, "utf8"); } catch (e) { return files; }
  for (const m of src.matchAll(/<script[^>]*\ssrc\s*=\s*["']([^"']+)["']/gi)) {
    let r = m[1].split("#")[0].split("?")[0];
    if (/^[a-z]+:\/\//i.test(r) || r.startsWith("//")) continue;   /* a CDN is not our source */
    const f = r.startsWith("/") ? r.slice(1) : dir + r;
    if (existsSync(f) && !files.includes(f)) files.push(f);
  }
  return files;
}

/* ---------- detectors. Each returns null or {level, why}. ----------------- */
function scan(src) {
  const f = [];
  const code = src.replace(/<!--[\s\S]*?-->/g, " ");

  /* KEYBOARD ONLY. Listens for keys and never for a pointer or touch. This is
     the one true blocker: there is no keyboard in a headset. */
  const keys = /addEventListener\(\s*['"]key(down|up|press)/.test(code) || /onkey(down|up)/.test(code);
  const pointer = /(pointerdown|touchstart|mousedown|onclick|addEventListener\(\s*['"]click)/.test(code);
  if (keys && !pointer) f.push({ level: "blocked", why: "keyboard listeners and no pointer or touch path" });

  /* MULTI TOUCH. A controller ray is one pointer, so two finger input has no
     analogue. But you cannot tell that from the presence of the words.
     ⛔ THE FIRST VERSION OF THIS CALLED 19 GAMES BLOCKED AND EVERY ONE WAS
     WRONG. 15 of them matched `gesturestart` + preventDefault, which SUPPRESSES
     pinch zoom rather than requiring it, so acting on the report would have
     deleted a protection and made those games worse on a headset. What matters
     is what the branch DOES, not that the branch exists.

     Three shapes, and only one of them is even worth mentioning:
       suppression   the body only prevents, or pauses. Nothing to do.
       zoom or orbit real, but almost never required to play, and the Quest
                     thumbstick emits `wheel`, so a game with a wheel handler
                     already has the same control. Caution at most.
       required      no single pointer path exists at all. That is a blocker,
                     and so far nothing in this catalog is one. */
  const pinch = [...code.matchAll(/touches\s*\.\s*length\s*(?:>=?|===?)\s*2\s*\)?\s*\{([\s\S]{0,160})/g)]
    .map(m => m[1])
    .filter(body => !/^\s*(e\.)?preventDefault\(\)\s*;?\s*(if\s*\([^)]*\)\s*\w+\(\)\s*;?)?\s*\}/.test(body));
  if (pinch.length) {
    const wheel = /addEventListener\(\s*['"]wheel/.test(code);
    const singleTouch = /touches\s*\.\s*length\s*===?\s*1|touches\[0\]|pointerdown/.test(code);
    if (!singleTouch)
      f.push({ level: "blocked", why: "two finger input with no single pointer path" });
    else if (!wheel)
      f.push({ level: "caution", why: "pinch to zoom has no controller equivalent and there is no wheel handler to stand in" });
  }

  /* MOTION. Tilt and shake have no analogue in a headset. But the house
     pattern offers tilt as ONE steering option beside drag, and Sproing was
     called blocked when its own settings key already lets you pick drag
     instead. A control scheme you can turn off is a caution, not a wall.

     ⛔⛔ AND MOST TILT IN THIS CATALOG IS NOT A CONTROL AT ALL. On 2026-09-03
     this detector called Lucid Winds and LOAF blocked; Lucid Winds turns a
     compass needle with it (index.html:53839) and LOAF moves the shine on a
     card (loaf.html:4775) beside a pointermove handler that writes the same
     two CSS variables. Same lesson as the 19 pinch false positives: ask what
     the handler DOES, not whether it exists. Three shapes:
       cosmetic   every tilt handler only writes style, a CSS variable, a
                  transform or a label. It is a readout. Nothing to replace.
       optional   tilt is one steering option beside drag. Caution.
       control    tilt moves the game and nothing else does. Blocked. */
  if (/deviceorientation|devicemotion|DeviceOrientationEvent|accelerationIncludingGravity/.test(code)) {
    /* the body of every tilt handler, bounded the way the pinch detector bounds
       its window, so a 7MB file cannot turn this into a whole file read */
    const bodies = [...code.matchAll(
      /addEventListener\(\s*['"](?:deviceorientation(?:absolute)?|devicemotion)['"]\s*,\s*(?:function\s*\([^)]*\)|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>)?\s*\{([\s\S]{0,600})/g)]
      .map(m => m[1]);
    /* Writes that change how a thing LOOKS, and nothing else. */
    const cosmeticOnly = bodies.length > 0 && bodies.every(b => {
      const writes = b.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ")
        .split(/[;\n]/).map(t => t.trim()).filter(Boolean)
        .filter(t => /=[^=]|\+\+|--|\bsetProperty\b|\bsetAttribute\b/.test(t))
        .filter(t => !/^(var|let|const)\s/.test(t))          /* a local of its own is not a game write */
        .filter(t => !/^(if|return|else|for|while|try|catch)\b/.test(t));
      return writes.length > 0 && writes.every(t =>
        /\.style\b|setProperty\s*\(\s*['"]--|\.textContent|\.innerText|\.innerHTML|\.className|classList|setAttribute\s*\(\s*['"](?:style|class|transform)/.test(t));
    });
    const optional = /steer\s*[:=]|['"]drag['"]|controlMode|steerMode/.test(code);
    /* ⛔ AND BLOCKED NEEDS THE SAME BAR THE OTHER TWO DETECTORS ALREADY USE.
       Lucid Winds' tilt turns a compass needle through TWO named functions
       (_onDevOrient -> _updateCompass -> style.transform), which no bounded
       static read is going to prove cosmetic, and it was called blocked for it
       on the first run that could read the file. The keyboard detector blocks
       on `keys && !pointer` and the pinch detector blocks on `!singleTouch`:
       both reserve blocked for "there is no other way in". Tilt now does too.
       A game with a live pointer path is at worst a caution, because a wrong
       blocked is the expensive error here (19 of them in August) and a caution
       costs one look on the device, which is what this file is for. */
    const pointerPath = /(pointerdown|pointermove|touchstart|mousedown|onclick|addEventListener\(\s*['"]click)/.test(code);
    if (cosmeticOnly) { /* a readout, not a control. Nothing to replace. */ }
    else if (!pointerPath)
      f.push({ level: "blocked", why: "steers by device tilt with no alternative" });
    else f.push(optional
      ? { level: "caution", why: "offers tilt steering, so confirm the drag option is the default in a headset" }
      : { level: "caution", why: "reads device tilt, so confirm on the device that tilt is not required to play" });
  }

  /* HOVER. A controller ray DOES hover, so this is a caution: it usually works
     and it is worth an eye, because hover on a ray is fiddly to hold steady. */
  if (/:hover[^{]*\{[^}]*(display\s*:\s*(block|flex)|visibility\s*:\s*visible|opacity\s*:\s*1)/.test(code))
    f.push({ level: "caution", why: "reveals UI on hover, which is fiddly to hold with a ray" });

  /* SMALL TARGETS. Declared, not rendered, so it is a hint rather than a
     measurement. A scaled stage makes this worse and we cannot see that here. */
  const smalls = [...code.matchAll(/(?:min-)?(?:width|height)\s*:\s*(\d{1,2})px/g)]
    .map(m => +m[1]).filter(n => n >= 12 && n < 32).length;
  if (smalls >= 12) f.push({ level: "caution", why: smalls + " declared sizes under 32px, small for a ray" });

  /* GOOD SIGNS ------------------------------------------------------------- */
  const good = [];
  if (/navigator\.xr|immersive-vr|renderer\.xr|XRSession/.test(code)) good.push("already speaks WebXR");
  if (/three(\.min)?\.js|THREE\./.test(code)) good.push("already 3D with Three.js");
  if (/PositionalAudio|createPanner|PannerNode/.test(code)) good.push("already has spatial audio");
  return { flags: f, good };
}

/* ---------- selftest ------------------------------------------------------ */
if (process.argv.includes("--selftest")) {
  const T = [
    ["keyboard only blocks", `addEventListener('keydown',f)`, "blocked", "keyboard"],
    ["keyboard plus pointer is fine", `addEventListener('keydown',f);addEventListener('pointerdown',g)`, null, "keyboard"],
    /* ⛔ These four are the regression guard for the 19 false positives. */
    ["pinch SUPPRESSION is not a defect",
      `document.addEventListener('gesturestart',function(e){e.preventDefault();});`, null, ""],
    ["a two finger branch that only prevents is suppression",
      `gc.addEventListener('touchstart',function(e){if(e.touches.length>=2){e.preventDefault();if(x)pauseRun();}});e.touches[0]`, null, ""],
    ["real pinch with a wheel handler is covered by the thumbstick",
      `addEventListener('wheel',z);t.addEventListener('touchstart',function(e){if(e.touches.length===2){orbit.pinch=d(e);}});e.touches[0]`, null, ""],
    ["real pinch with no wheel fallback cautions",
      `if(e.touches.length===2){pinchStart={d:dist(e),zoom:zoom};dragging=false;} else {t=e.touches[0];}`, "caution", "pinch"],
    ["two finger only, no single pointer path, blocks",
      `if(e.touches.length===2){zoom=dist(e);spin(e);}`, "blocked", "single pointer"],
    ["tilt with no alternative blocks", `window.addEventListener("deviceorientation",f)`, "blocked", "no alternative"],
    /* the Aug 16 regression guard, kept, with the pointer path Sproing really
       has (satellites/sproing/index.html: `steer:'drag'` is its default and
       INP.tiltAxis is read only when steer !== 'drag'). Without a pointer path
       in the fixture the row would block, which is correct now and was never
       what this case was about. */
    ["tilt offered beside drag cautions",
      `addEventListener('pointerdown',g);window.addEventListener("deviceorientation",f);SET.steer="drag";`, "caution", "confirm the drag option"],
    /* ⛔⛔ THE SECOND WAVE OF FALSE POSITIVES, 2026-09-03. Fixing the resolver
       made three readable rows readable and instantly called two of them
       BLOCKED for tilt: Lucid Winds, whose tilt turns a compass NEEDLE
       (index.html:53839, and `_updateCompass(0)` runs first so the compass
       works with no sensor at all), and LOAF, whose tilt moves the SHINE on a
       card (loaf.html:4775) beside a `pointermove` handler that sets the same
       two CSS variables (loaf.html:4765). Neither game steers anything. The
       detector was asking whether a tilt listener EXISTS; the pinch detector
       learned in August to ask what the branch DOES, and this is the same
       lesson arriving at the same file a second time. A cosmetic readout needs
       no controller equivalent because it is not a control. */
    ["a tilt handler that only writes a CSS variable is decoration, not a control",
      `window.addEventListener('deviceorientation', e => { card.style.setProperty('--mx', e.gamma + '%'); });`, null, ""],
    ["a tilt handler that only writes a transform is decoration",
      `window.addEventListener("deviceorientation",function(e){ img.style.transform='rotate('+e.alpha+'deg)'; });`, null, ""],
    ["a tilt handler that only writes text is decoration",
      `window.addEventListener("deviceorientation",function(e){ el.textContent = cardinals[e.alpha/45|0]; });`, null, ""],
    ["a tilt handler that moves the player and has no pointer path at all still blocks",
      `window.addEventListener("deviceorientation",function(e){ player.vx += e.gamma*0.1; player.x+=player.vx; });`, "blocked", "no alternative"],
    ["tilt beside a live pointer path is a caution, not a wall",
      `addEventListener('pointerdown',aim);window.addEventListener("deviceorientation",function(e){ player.vx += e.gamma*0.1; });`, "caution", "not required to play"],
    ["hover cautions", `.tip:hover{display:block}`, "caution", "hover"],
    ["a plain page is clean", `<p>hello</p><button onclick="go()">go</button>`, null, ""]
  ];
  let bad = 0;
  for (const [nm, src, want, needle] of T) {
    const r = scan(src).flags;
    const hit = needle ? r.find(x => x.why.includes(needle)) : r[0];
    const got = hit ? hit.level : null;
    const ok = got === want;
    console.log((ok ? "  ok   " : "  FAIL ") + nm + " -> " + got + (ok ? "" : "  wanted " + want));
    if (!ok) bad++;
  }
  /* ---- the RESOLVER, which decides "unknown" ------------------------------
     ⛔⛔ Until 2026-09-03 the resolver only knew `/satellites/<dir>/`, so three
     rows whose source sits in this repo were published as "source not readable
     from this repo (external repos)": Lucid Winds (index.html), LOAF
     (loaf.html) and Whack Box (party/host.html). An unknown is a row nobody
     triaged, so a wrong unknown hides real blockers, and the document said the
     opposite of the truth about a file in the repo root. These cases fail
     against the old resolver. */
  for (const [nm, row, want] of [
    ["the app's own absolute origin resolves to the repo root page",
      { kind: "satellite", url: "https://lucidwinds.com/?from=portal", dir: null }, "index.html"],
    ["a root relative page resolves to the repo file",
      { kind: "satellite", url: "/loaf.html", dir: null }, "loaf.html"],
    ["a query string does not hide the page",
      { kind: "satellite", url: "/party/host.html?v=20260808b", dir: null }, "party/host.html"],
    ["a foreign origin stays unreadable",
      { kind: "satellite", url: "https://stephenuffugus.github.io/Tomato-Man/", dir: null }, null],
    ["a satellite with a dir is unchanged",
      { kind: "satellite", url: "/satellites/conduit/", dir: "conduit" }, "satellites/conduit/index.html"],
    ["a native row is unchanged",
      { kind: "native", url: "/play/sudoku.html", id: "sudoku" }, "play/sudoku.html"]
  ]) {
    const got = sourceFiles(row);
    const ok = want === null ? got.length === 0 : got.includes(want);
    console.log((ok ? "  ok   " : "  FAIL ") + nm + " -> [" + got.join(", ") + "]" +
      (ok ? "" : "  wanted " + want));
    if (!ok) bad++;
  }
  /* A launcher page is not the game. party/host.html is 7KB of shell that pulls
     its logic from party/shell/*.js, so reading the launcher alone would call
     Whack Box clean without having read a line of Whack Box. */
  {
    const got = sourceFiles({ kind: "satellite", url: "/party/host.html?v=20260808b", dir: null });
    const ok = got.some(f => /^party\/shell\//.test(f));
    console.log((ok ? "  ok   " : "  FAIL ") + "a launcher page pulls in the local scripts it declares -> " +
      got.length + " files");
    if (!ok) bad++;
  }

  /* ⛔ a comment mentioning a keyboard is not a keyboard dependency */
  const c = scan(`<!-- press space to jump -->\n<button onclick=go()>go</button>`).flags.length;
  console.log((c === 0 ? "  ok   " : "  FAIL ") + "a comment about keys is not a dependency (" + c + " flags)");
  if (c !== 0) bad++;
  console.log(bad ? "\nSELFTEST FAILED: " + bad : "\nSELFTEST PASSED: every detector can fire and can stay quiet");
  process.exit(bad ? 2 : 0);
}

/* ---------- run ----------------------------------------------------------- */
cat = (await import("./catalog.mjs")).catalog;
const rows = [];
for (const g of catalog()) {
  let src = "";
  for (const p of g.files) if (existsSync(p)) { try { src += readFileSync(p, "utf8"); } catch (e) {} }
  if (!src) { rows.push({ ...g, verdict: "unknown", flags: [], good: [], sourced: false }); continue; }
  const { flags, good } = scan(src);
  const verdict = flags.some(f => f.level === "blocked") ? "blocked"
                : flags.length ? "caution" : "ok";
  rows.push({ ...g, verdict, flags, good, sourced: true });
}

const by = v => rows.filter(r => r.verdict === v);
const cands = rows.filter(r => r.good.length && r.verdict !== "blocked")
                  .sort((a, b) => b.good.length - a.good.length);

if (process.argv.includes("--report")) {
  console.log("QUEST TRIAGE  " + rows.length + " titles\n");
  console.log("  ok       " + by("ok").length + "   nothing found that stops a controller pointer");
  console.log("  caution  " + by("caution").length + "   playable, worth an eye on a headset");
  console.log("  blocked  " + by("blocked").length + "   needs a keyboard, two fingers, or tilt");
  console.log("  unknown  " + by("unknown").length + "   source not readable from here (external repos)\n");
  console.log("BLOCKED:");
  for (const r of by("blocked")) console.log("   " + r.name.padEnd(24) + r.flags.filter(f=>f.level==="blocked")[0].why);
  console.log("\nVR UPGRADE CANDIDATES (already 3D or spatial):");
  for (const r of cands) console.log("   " + r.name.padEnd(24) + r.good.join(" · "));
} else {
  let md = "# QUEST COMPATIBILITY — " + rows.length + " titles triaged\n\n";
  md += "Generated by `scripts/quest_triage.mjs`. **Nothing here has been run on a headset.**\n";
  /* was the literal "183", which was wrong on the day it was written (186) and
     wronger now (187). A generated document should not hardcode its own size. */
  md += "This is a shortlist so nobody has to open " + rows.length + " games to find the interesting ones.\n";
  md += "Every call should be checked against the Quest 2 before it is believed.\n\n";
  md += "| verdict | count | meaning |\n|---|---|---|\n";
  md += "| ok | " + by("ok").length + " | nothing found that stops a controller pointer |\n";
  md += "| caution | " + by("caution").length + " | playable, worth an eye on the device |\n";
  md += "| blocked | " + by("blocked").length + " | needs a keyboard, two fingers, or device tilt |\n";
  md += "| unknown | " + by("unknown").length + " | source not readable from this repo (external repos) |\n\n";
  md += "## VR upgrade candidates\n\nGames that already carry the thing a VR version would need.\n\n";
  for (const r of cands) md += "- **" + r.name + "** — " + r.good.join(", ") + "\n";
  md += "\n## Blocked\n\n";
  for (const r of by("blocked")) md += "- **" + r.name + "** — " + r.flags.filter(f=>f.level==="blocked").map(f=>f.why).join("; ") + "\n";
  md += "\n## Caution\n\n";
  for (const r of by("caution")) md += "- **" + r.name + "** — " + r.flags.map(f=>f.why).join("; ") + "\n";
  md += "\n## Everything else reads clean\n\n";
  md += by("ok").map(r => r.name).join(" · ") + "\n";
  writeFileSync(OUT, md);
  console.log("wrote " + OUT + "  ok " + by("ok").length + " · caution " + by("caution").length +
    " · blocked " + by("blocked").length + " · unknown " + by("unknown").length);
}
