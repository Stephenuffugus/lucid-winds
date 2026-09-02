/* RUN EVERY MUSIC GATE, in order, stopping at the first red.
     node test/music/run.mjs
   Rebuilds the fixture and its catalog first so every gate sees the same
   input. Needs the static server on 127.0.0.1:8777 (see HANDOFF-MUSIC P0). */
import { execSync } from "child_process";
const steps = [
  ["fixture",   "node scripts/music_fixture.mjs"],
  ["fixture catalog", "node scripts/music_manifest.mjs --intake /tmp/music-fixture/intake.json --out /tmp/music-fixture/music-catalog.js --unmapped /tmp/music-fixture/unmapped.md --live"],
  ["catalog",   "node test/music/catalog.mjs"],
  ["unlocks",   "node test/music/unlocks.mjs"],
  ["mutants",   "node test/music/mutants.mjs"],
  ["sw",        "node test/music/sw.mjs"],
  ["no_shrink", "node test/music/no_shrink.mjs"],
  ["include --check", "node scripts/music_include.mjs --check"],
  ["inject",    "node test/music/inject.mjs"],
  ["ui",        "node test/music/ui.mjs"],
];
const t0 = Date.now(); let n = 0;
for (const [name, cmd] of steps) {
  const s = Date.now(); let out = "", ok = true;
  try { out = execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 600000 }); }
  catch (e) { ok = false; out = String(e.stdout || "") + String(e.stderr || ""); }
  const last = out.split("\n").map(l => l.replace(/\s+$/, "")).filter(l => l && !/^\s*ok\s/.test(l)).slice(-2).join("\n      ");
  console.log((ok ? "  ✓ " : "  ✗ ") + name.padEnd(18) + ((Date.now() - s) / 1000).toFixed(1).padStart(6) + "s   " + last);
  if (!ok) { console.log("\nrun: STOPPED at " + name + " after " + n + " green"); process.exit(1); }
  n++;
}
console.log("\nrun: all " + n + " steps green in " + ((Date.now() - t0) / 1000).toFixed(0) + "s");
