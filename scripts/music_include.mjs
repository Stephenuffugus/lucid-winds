/* MUSIC INCLUDE — the one line every non-vendored satellite gets, inserted by
   assertion, never by hand (HANDOFF-MUSIC P6, LAW 9, LAW 16).
     node scripts/music_include.mjs                 dry run: print the plan
     node scripts/music_include.mjs --apply --batch 15
     node scripts/music_include.mjs --check         every non-vendored satellite has exactly one include, every vendored has none

   Per file: exactly one </head> (case-insensitive) or SKIP; include absent or
   ALREADY; insert `<script src="/music-unlocks.js" defer></script>` on its own
   line immediately before </head>, matching that line's indentation; assert
   the file grew by exactly one line. Vendored satellites are read from
   scripts/vendor_satellites.mjs --list and never touched. */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { execSync } from "child_process";

const LINE = '<script src="/music-unlocks.js" defer></script>';
const vendored = new Set(execSync("node scripts/vendor_satellites.mjs --list", { encoding: "utf8" }).trim().split("\n").map(l => l.trim().split(/\s+/)[0]).filter(Boolean));
const slugs = readdirSync("satellites", { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort();

function inspect(slug) {
  const f = "satellites/" + slug + "/index.html";
  if (!existsSync(f)) return { slug, f, state: "NO-INDEX" };
  const src = readFileSync(f, "utf8");
  const heads = (src.match(/<\/head>/gi) || []).length;
  const has = (src.match(/<script src="\/music-unlocks\.js" defer><\/script>/g) || []).length;
  if (vendored.has(slug)) return { slug, f, state: has ? "VENDORED-BUT-HAS-INCLUDE" : "VENDORED", has };
  if (has === 1) return { slug, f, state: "ALREADY", has };
  if (has > 1) return { slug, f, state: "DUPLICATE", has };
  if (heads !== 1) return { slug, f, state: "SKIP-HEAD-COUNT-" + heads };
  return { slug, f, state: "PLAN", src };
}

const mode = process.argv.includes("--check") ? "check" : process.argv.includes("--apply") ? "apply" : "dry";
const batchArg = process.argv.indexOf("--batch"); const BATCH = batchArg > 0 ? +process.argv[batchArg + 1] : 15;
const rows = slugs.map(inspect);
const by = (st) => rows.filter(r => r.state === st || r.state.startsWith(st));

if (mode === "check") {
  const bad = rows.filter(r => !(r.state === "ALREADY" || r.state === "VENDORED"));
  for (const r of bad) console.log("  " + r.state.padEnd(28) + r.slug);
  console.log("check: " + by("ALREADY").length + " included, " + by("VENDORED").length + " vendored untouched, " + bad.length + " wrong, of " + rows.length);
  process.exit(bad.length ? 1 : 0);
}

const plan = by("PLAN");
console.log((mode === "dry" ? "plan" : "apply") + ": " + plan.length + " to insert, " + by("ALREADY").length + " already, " + by("VENDORED").length + " vendored (skipped), " + by("SKIP").length + " skipped for </head> count");
for (const r of rows.filter(r => r.state.startsWith("SKIP") || r.state === "DUPLICATE" || r.state === "NO-INDEX")) console.log("  ⚠ " + r.state + "  " + r.slug);
if (mode === "dry") { for (const r of plan.slice(0, BATCH)) console.log("  + " + r.slug); if (plan.length > BATCH) console.log("  … and " + (plan.length - BATCH) + " more after this batch"); process.exit(0); }

let done = 0;
for (const r of plan.slice(0, BATCH)) {
  const before = r.src.split("\n").length;
  const m = /^([ \t]*)<\/head>/im.exec(r.src);
  const indent = m ? m[1] : "";
  const out = r.src.replace(/<\/head>/i, indent + LINE + "\n" + indent + "</head>");
  const after = out.split("\n").length;
  if (after !== before + 1) { console.log("  ✗ " + r.slug + " line count " + before + " -> " + after + ", refusing"); continue; }
  if ((out.match(/<script src="\/music-unlocks\.js" defer><\/script>/g) || []).length !== 1) { console.log("  ✗ " + r.slug + " include count wrong after insert, refusing"); continue; }
  writeFileSync(r.f, out); done++;
  console.log("  + " + r.slug + "  (" + before + " -> " + after + " lines)");
}
console.log("applied " + done + " of " + Math.min(BATCH, plan.length) + " in this batch; " + (plan.length - done) + " remain");
