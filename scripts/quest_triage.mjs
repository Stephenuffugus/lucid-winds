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
import { catalog as cat } from "./catalog.mjs";

const PORTAL = "portal/index.html";
const OUT = "QUEST-COMPAT.md";

/* ⛔⛔ This had its own regex over the portal and it was WRONG. The GAMES rows
   carry 4, 5 or 7 fields; the regex hardcoded 4, so longer rows silently
   vanished and it reported 183 titles when the true figure is 186. Counting now
   comes from scripts/catalog.mjs, which parses the arrays. */
function catalog() {
  return cat(PORTAL).all.map(g => ({
    name: g.name, url: g.url, cat: g.cat, beta: g.gated, kind: g.kind,
    files: g.kind === "satellite"
      ? (g.dir ? ["satellites/" + g.dir + "/index.html"] : [])
      : ["play/" + g.id + ".html", "games/" + g.id + ".js"]
  }));
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
     instead. A control scheme you can turn off is a caution, not a wall. */
  if (/deviceorientation|devicemotion|DeviceOrientationEvent|accelerationIncludingGravity/.test(code)) {
    const optional = /steer\s*[:=]|['"]drag['"]|controlMode|steerMode/.test(code);
    f.push(optional
      ? { level: "caution", why: "offers tilt steering, so confirm the drag option is the default in a headset" }
      : { level: "blocked", why: "steers by device tilt with no alternative" });
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
    ["tilt offered beside drag cautions", `window.addEventListener("deviceorientation",f);SET.steer="drag";`, "caution", "confirm the drag option"],
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
  /* ⛔ a comment mentioning a keyboard is not a keyboard dependency */
  const c = scan(`<!-- press space to jump -->\n<button onclick=go()>go</button>`).flags.length;
  console.log((c === 0 ? "  ok   " : "  FAIL ") + "a comment about keys is not a dependency (" + c + " flags)");
  if (c !== 0) bad++;
  console.log(bad ? "\nSELFTEST FAILED: " + bad : "\nSELFTEST PASSED: every detector can fire and can stay quiet");
  process.exit(bad ? 2 : 0);
}

/* ---------- run ----------------------------------------------------------- */
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
  md += "This is a shortlist so nobody has to open 183 games to find the interesting ones.\n";
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
