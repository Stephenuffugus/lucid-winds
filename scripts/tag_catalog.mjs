#!/usr/bin/env node
/* AUTO TAG THE CATALOG — the foundation under every cohesion idea.
   `node scripts/tag_catalog.mjs`            writes portal/catalog-tags.json
   `node scripts/tag_catalog.mjs --report`   prints what it found and why
   `node scripts/tag_catalog.mjs --selftest` proves the detectors can be wrong

   WHY THIS EXISTS
   The portal knows one thing about each game: a category, from a list of ten.
   That is a filing cabinet, not something you can recommend with. "Action, 45
   games" tells a visitor nothing about whether it fits the four minutes they
   actually have. Six honest axes do.

   ⛔ THIS IS A FIRST PASS, NOT AN ORACLE. Every tag carries a confidence and
   the evidence that produced it, because a wrong tag is worse than no tag: a
   "two minutes" shelf holding a ten minute game teaches a player not to trust
   the shelf, which is the same failure as the eight games found on 2026-08-16
   whose own copy was untrue. Anything below `firm` is a suggestion for a human.

   The axes, and what a player is actually asking:
     length   how long am I committing to
     hands    can I do this one handed on a bus
     brain    do I want to think right now
     company  is somebody with me
     reading  am I about to be handed an essay
     restart  if I die, is it instant
*/
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";

const PORTAL = "portal/index.html";
const OUT = "portal/catalog-tags.json";

/* ---------- read the catalog out of the portal, the one source of truth ---- */
function catalog() {
  const s = readFileSync(PORTAL, "utf8");
  const out = [];
  for (const m of s.matchAll(/\{nm:"([^"]+)",(.*?)\},?\n/g)) {
    const body = m[2];
    const url = (body.match(/url:"([^"]*)"/) || [])[1] || "";
    const cat = (body.match(/cat:"([^"]*)"/) || [])[1] || "";
    const ds = (body.match(/ds:"([^"]*)"/) || [])[1] || "";
    const local = url.match(/^\/satellites\/([a-z0-9-]+)\//);
    out.push({ name: m[1], cat, ds, url,
      dir: local ? "satellites/" + local[1] : null,
      beta: /beta:true/.test(body), kind: "satellite" });
  }
  for (const m of s.matchAll(/^\s*\["([a-z0-9-]+)","([^"]+)","([a-z]+)","([^"]*)"\]/gm)) {
    /* ⛔ These were passed dir:null, so 80 of 183 games were tagged with no
       source at all and every source-derived axis defaulted. The native games
       DO have a file, at play/<id>.html, and many have a module in games/. */
    out.push({ name: m[2], cat: m[3], ds: m[4], url: "/play/" + m[1] + ".html",
      dir: null, file: "play/" + m[1] + ".html", mod: "games/" + m[1] + ".js",
      beta: false, kind: "native" });
  }
  return out;
}

/* ---------- the detectors ------------------------------------------------- */
/* Each returns {value, why, firm}. `firm` means the evidence is strong enough
   to ship without a human reading it. Everything else is a suggestion. */

const CAT_BRAIN = { action:"reflex", puzzle:"think", word:"think", math:"think",
  creative:"make", card:"chance", dice:"chance", board:"think", pattern:"think", party:"reflex" };

function detect(game, src, blurb) {
  const t = {};
  const has = re => re.test(src);
  const txt = (blurb + " " + (src ? src.slice(0, 200000) : "")).toLowerCase();

  /* LENGTH. A declared clock beats everything: a game that says 60 seconds is
     60 seconds. Endless runners are a run, not a sitting. Level campaigns and
     anything that saves progress are a sitting. */
  const clock = src && src.match(/\b(\d{2,3})\s*second|:(\d\d)\s*(?:left|remaining)|\b(60|90|120)s\b/i);
  if (/\b(30|45|60)\s*second|blitz|one minute|60s\b/i.test(txt)) {
    t.length = { value: "under 2 min", why: "declares a sub two minute clock", firm: true };
  } else if (/endless|survive as long|how far|high score|one more run/i.test(txt)) {
    t.length = { value: "2 to 10", why: "endless or score chase, a run not a sitting", firm: true };
  } else if (src && /localStorage[^\n]{0,60}(level|progress|campaign|world|chapter)/i.test(src)) {
    t.length = { value: "a sitting", why: "saves campaign progress", firm: true };
  } else if (clock) {
    t.length = { value: "2 to 10", why: "has a visible clock", firm: false };
  } else {
    t.length = { value: "2 to 10", why: "no signal, assumed the middle", firm: false };
  }

  /* HANDS. Keyboard-only is the one that really matters, because it makes a
     game unplayable on the device most people arrive on. */
  const kbOnly = src && /arrow keys|WASD|press space|use the keyboard/i.test(src)
              && !/touchstart|pointerdown|ontouchstart/i.test(src);
  if (kbOnly) t.hands = { value: "needs a keyboard", why: "keyboard prompts and no touch handlers", firm: true };
  else if (src && /(touchstart|pointerdown)/i.test(src) && /tap|swipe|one thumb|drag/i.test(txt))
    t.hands = { value: "one thumb", why: "touch handlers and tap or swipe language", firm: false };
  else t.hands = { value: "two hands", why: "no strong single touch signal", firm: false };

  /* BRAIN. ⛔ The first version matched make-words anywhere in the page and
     called 115 of 183 games "make" when only 24 are creative at all: "build a
     course of clay traps" is not a creative tool. The blurb only overrides the
     category when the game is ALREADY carded creative, and the category is the
     honest signal for everything else. */
  if (game.cat === "creative")
    t.brain = { value: "make", why: "carded creative", firm: true };
  else
    t.brain = { value: CAT_BRAIN[game.cat] || "think", why: "from its category, " + game.cat, firm: game.cat ? true : false };

  /* COMPANY. This one is worth being strict about: telling somebody a game is
     two player when it is not wastes a moment they set aside for someone else.
     ⛔ Do NOT match a bare "2p" — it appears inside hashes and colour codes. */
  if (game.cat === "party")
    t.company = { value: "same room", why: "carded as a party game", firm: true };
  else if (src && /two players|2 players|pass the phone|second player|player two/i.test(src))
    t.company = { value: "pass the phone", why: "names a second player in words", firm: true };
  else t.company = { value: "alone", why: "no second player language", firm: false };

  /* READING. Counts the words in the longest instruction block, because the
     question is not how much text exists, it is how much you face at once. */
  let worst = 0;
  if (src) {
    for (const m of src.matchAll(/<(p|li)[^>]*>([\s\S]{0,900}?)<\/\1>/g)) {
      const words = m[2].replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
      if (words > worst) worst = words;
    }
  }
  if (worst >= 45) t.reading = { value: "a lot", why: "a single block of " + worst + " words", firm: true };
  else if (worst >= 18) t.reading = { value: "a little", why: "longest block " + worst + " words", firm: true };
  else t.reading = { value: "none", why: "longest block " + worst + " words", firm: true };

  /* RESTART. Instant restart is what makes a hard game feel fair. */
  if (src && /(play again|try again|restart|retry)/i.test(src) && /instant|immediately|<200ms/i.test(src))
    t.restart = { value: "instant", why: "declares an instant retry", firm: false };
  else if (src && /localStorage[^\n]{0,60}(save|progress|level)/i.test(src))
    t.restart = { value: "saves progress", why: "persists progress", firm: true };
  else if (src && /(play again|try again|restart)/i.test(src))
    t.restart = { value: "a run", why: "offers a retry with no persisted progress", firm: false };
  else t.restart = { value: "a run", why: "no signal", firm: false };

  return t;
}

/* ---------- selftest: the detectors must be able to be wrong -------------- */
if (process.argv.includes("--selftest")) {
  const cases = [
    ["a 60 second game", { cat:"action" }, "<p>You have 60 seconds.</p>", "", "length", "under 2 min"],
    ["an endless runner", { cat:"action" }, "<p>Survive as long as you can.</p>", "", "length", "2 to 10"],
    ["keyboard only", { cat:"action" }, "<p>Use the arrow keys to steer.</p>", "", "hands", "needs a keyboard"],
    ["real two player", { cat:"puzzle" }, "<p>Two players, one keyboard.</p>", "", "company", "pass the phone"],
    ["a wall of text", { cat:"puzzle" }, "<p>" + "word ".repeat(60) + "</p>", "", "reading", "a lot"],
    ["no text at all", { cat:"action" }, "<p>Go.</p>", "", "reading", "none"]
  ];
  let bad = 0;
  for (const [nm, g, src, blurb, axis, want] of cases) {
    const got = detect(g, src, blurb)[axis].value;
    const ok = got === want;
    console.log((ok ? "  ok   " : "  FAIL ") + nm + " -> " + axis + " = " + got + (ok ? "" : "  wanted " + want));
    if (!ok) bad++;
  }
  /* A detector that says the same thing about everything is not a detector. */
  const a = detect({cat:"action"}, "<p>You have 60 seconds.</p>", "").length.value;
  const b = detect({cat:"action"}, "<p>Survive as long as you can.</p>", "").length.value;
  console.log((a !== b ? "  ok   " : "  FAIL ") + "length actually discriminates (" + a + " vs " + b + ")");
  if (a === b) bad++;
  /* ⛔ the bare "2p" trap: it appears in hashes and colour codes everywhere. */
  const c = detect({cat:"puzzle"}, "<div style='color:#a2p3ff'>x</div>", "").company.value;
  console.log((c === "alone" ? "  ok   " : "  FAIL ") + "a stray 2p in a colour code is not two player (" + c + ")");
  if (c !== "alone") bad++;
  console.log(bad ? "\nSELFTEST FAILED: " + bad : "\nSELFTEST PASSED: every detector can be wrong and discriminates");
  process.exit(bad ? 2 : 0);
}

/* ---------- run ----------------------------------------------------------- */
const games = catalog();
const rows = [];
for (const g of games) {
  let src = "";
  const paths = [ g.dir ? g.dir + "/index.html" : null, g.file, g.mod ].filter(Boolean);
  for (const pth of paths) {
    if (existsSync(pth)) { try { src += readFileSync(pth, "utf8"); } catch (e) {} }
  }
  rows.push({ name: g.name, url: g.url, cat: g.cat, kind: g.kind, beta: g.beta,
    sourced: !!src, tags: detect(g, src, g.ds) });
}

const firm = {}, total = {};
for (const r of rows) for (const k of Object.keys(r.tags)) {
  total[k] = (total[k] || 0) + 1;
  if (r.tags[k].firm) firm[k] = (firm[k] || 0) + 1;
}

if (process.argv.includes("--report")) {
  console.log("CATALOG TAGS  " + rows.length + " games, " + rows.filter(r => r.sourced).length + " with readable source\n");
  for (const k of Object.keys(total)) {
    const dist = {};
    rows.forEach(r => { const v = r.tags[k].value; dist[v] = (dist[v] || 0) + 1; });
    console.log(k.padEnd(9) + "firm on " + String(firm[k] || 0).padStart(3) + " of " + total[k] +
      "   " + Object.entries(dist).map(([v, n]) => v + " " + n).join(" · "));
  }
  console.log("\nSample:");
  for (const r of rows.slice(0, 6))
    console.log("  " + r.name.padEnd(20) + Object.entries(r.tags).map(([k, v]) => v.value).join(" · "));
} else {
  writeFileSync(OUT, JSON.stringify({ generated: "auto", note:
    "First pass from source. `firm:false` means a human should check it. Regenerate with scripts/tag_catalog.mjs.",
    games: rows }, null, 1));
  console.log("wrote " + OUT + "  " + rows.length + " games");
  for (const k of Object.keys(total)) console.log("  " + k.padEnd(9) + "firm on " + (firm[k] || 0) + " of " + total[k]);
}
