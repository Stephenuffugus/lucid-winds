/* GATE P3b — mutants. Break music-unlocks.js in twelve named ways and require
   test/music/unlocks.mjs to go RED for every one. A gate that stays green
   through a mutation is decoration (Conduit found twenty of those).
   Each mutation must actually APPLY (the anchor must be found) or the mutant
   is invalid and counts as a failure of THIS file, not a kill.
   Run:  node test/music/mutants.mjs         Exit 1 if any mutant survives. */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { execSync } from "child_process";

const SRC = readFileSync("music-unlocks.js", "utf8");
const DIR = "/tmp/music-mutants"; mkdirSync(DIR, { recursive: true });

const MUTANTS = [
  ["drop the double-load guard",            "if (window.SWSMusic) return;",                                   "/* guard removed */"],
  ["write the ledger wholesale (ignore other tabs)", "var ledger = readLedger(), have = {}",                   "var ledger = [], have = {}"],
  ["skip the src/title refresh from catalog", "out.push(hit ? { id: e.id, title: hit.t.title, artist: 'Stephen', src: srcOf(c, hit.s, hit.t), game: hit.s.name } : e);", "out.push(e);"],
  ["time path at > instead of >= (120s exactly must open track 2)", "if ((p.secs | 0) >= L.secsPer * i) return true;", "if ((p.secs | 0) > L.secsPer * i) return true;"],
  ["delete ledger entries not in the catalog", "out.push(hit ? { id: e.id, title: hit.t.title, artist: 'Stephen', src: srcOf(c, hit.s, hit.t), game: hit.s.name } : e);", "if (hit) out.push({ id: e.id, title: hit.t.title, artist: 'Stephen', src: srcOf(c, hit.s, hit.t), game: hit.s.name });"],
  ["use Date.now() as the day",              "function today() { var d = new Date(), m = d.getMonth() + 1, y = d.getDate(); return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (y < 10 ? '0' : '') + y; }", "function today() { return String(Date.now()); }"],
  ["run the tick on requestAnimationFrame",  "S.timer = window.setInterval(tick, TICK_MS);",                   "S.timer = window.requestAnimationFrame(tick);"],
  /* DOUBLE mutation, on purpose: every public entry point is wrapped by law, so removing only the inner
     guard is an equivalent mutant (nothing observable changes). Removing the inner guard AND the
     public rebuild() guard is what a real regression would look like. */
  ["throw when localStorage is missing (inner guard + public rebuild guard)", "function lsGet(k) { try { var v = window.localStorage.getItem(k); return v == null ? null : String(v); } catch (e) { return null; } }", "function lsGet(k) { var v = window.localStorage.getItem(k); return v == null ? null : String(v); }", "rebuild: function () { try { return rebuild(); } catch (e) { return []; } },", "rebuild: function () { return rebuild(); },"],
  ["create an <audio> element on boot",      "if (!catalog()) { log('no live catalog, idle'); return; }",       "if (!catalog()) { log('no live catalog, idle'); return; } new Audio();"],
  ["toast with pointer-events auto",         "st.pointerEvents = 'none';",                                      "st.pointerEvents = 'auto';"],
  ["ignore live:false",                      "return (c && c.live === true && c.shelves && c.shelves.length) ? c : null;", "return (c && c.shelves && c.shelves.length) ? c : null;"],
  ["keep ticking while hidden",              "var d = window.document; if (d && d.hidden) return;\n      S.loadSecs",  "var d = window.document;\n      S.loadSecs"],
  ["drop family breadth from the ladder",     "    if (shelf && shelf.kind === 'family' && breadthOf(shelf, all) >= 1 + L.breadthPer * i) return true;\n", "\n"],
  ["ignore catalog.ladder (hardcode defaults)", "function ladder() { var c = catalog(), L = (c && c.ladder) || {}, out = {}, k;", "function ladder() { var c = null, L = {}, out = {}, k;"],
  /* P11, the moment */
  ["card a mid round unlock (never interrupt play)", "      var fresh = rebuild(), i; for (i = 0; i < fresh.length; i++) { addPending(fresh[i]); toast(fresh[i].title); }\n    } catch (e) {}\n  }\n  function startTicks()", "      var fresh = rebuild(), i; if (fresh.length) showCard(fresh[0], 0);\n    } catch (e) {}\n  }\n  function startTicks()"],
  ["forget a mid round unlock (pending not stored)", "function addPending(e) { var l = readList(LS_PENDING), i;", "function addPending(e) { return; var l = readList(LS_PENDING), i;"],
  ["put the chip in the bottom right corner", "    var best = spots[0], bestScore = Infinity;\n    for (i = 0; i < spots.length; i++) { sc = footprint(spots[i]); if (sc === 0) return spots[i].css;", "    var best = spots[0], bestScore = Infinity; return 'right:10px;' + B;\n    for (i = 0; i < spots.length; i++) { sc = footprint(spots[i]); if (sc === 0) return spots[i].css;"],
  ["Listen now does not play the song", "for (i = 0; i < L.length; i++) if (L[i] && L[i].id === id) { api.play(i); return; }", "for (i = 0; i < L.length; i++) if (L[i] && L[i].id === id) { return; }"],
  ["card a song the player already dismissed", "for (i = 0; i < fresh.length; i++) if (!isRevealed(fresh[i].id)) list.push(fresh[i]);", "for (i = 0; i < fresh.length; i++) list.push(fresh[i]);"],
  /* P12, milestones */
  ["drop the milestone path from the ladder", "    if (L.milestonePer > 0 && (p.milestones | 0) >= L.milestonePer * i) return true;\n", "\n"],
  ["forget the milestone (never written to progress)", "if (n > (p.milestones | 0)) p.milestones = n;", "p.milestones = 0;"],
  ["a milestone never reveals (the card waits for the next boot)", "if (!revealPending(fresh)) { for (i = 0; i < fresh.length; i++) toast(fresh[i].title); }\n        return true;", "for (i = 0; i < fresh.length; i++) toast(fresh[i].title);\n        return true;"],
  ["never tell the page the card opened", "tellGame(true);", "/* silent */"],
];

let killed = 0, survived = 0, invalid = 0;
MUTANTS.forEach(([name, from, to, from2, to2], i) => {
  if (SRC.indexOf(from) < 0 || (from2 && SRC.indexOf(from2) < 0)) { invalid++; console.log("  INVALID  " + name + "   <- anchor not found; mutant does not apply"); return; }
  const file = DIR + "/mutant-" + (i + 1) + ".js";
  let mutated = SRC.replace(from, to); if (from2) mutated = mutated.replace(from2, to2);
  writeFileSync(file, mutated);
  let red = false, tail = "";
  try { execSync("node test/music/unlocks.mjs", { env: { ...process.env, MUSIC_MODULE: file }, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
  catch (e) { red = true; tail = String(e.stdout || "").split("\n").filter(l => /FAIL/.test(l)).slice(0, 2).map(l => l.trim()).join(" | "); }
  if (red) { killed++; console.log("  killed   " + name + "   <- " + tail); }
  else { survived++; console.log("  SURVIVED " + name + "   <- the gate stayed green; it does not test this"); }
});
console.log("\nmutants: " + killed + " killed, " + survived + " survived, " + invalid + " invalid, of " + MUTANTS.length);
process.exit(survived || invalid ? 1 : 0);
