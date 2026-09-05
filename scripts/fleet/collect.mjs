/* Gather every per-game audit into one file.
   Primary source: the workflow journals (authoritative - they hold the exact schema-validated
   object each agent returned). Secondary: audit-out/*.json written by the agents themselves.
   Merged by slug, journal wins, and disagreements are reported rather than silently resolved. */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

const SP = "/tmp/claude-1000/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/scratchpad";
const WFDIR = "/home/codespace/.claude/projects/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/subagents/workflows";

const bySlug = new Map();
const sources = { journal: 0, disk: 0 };

/* 1. journals */
if (existsSync(WFDIR)) {
  for (const d of readdirSync(WFDIR)) {
    const j = join(WFDIR, d, "journal.jsonl");
    if (!existsSync(j)) continue;
    for (const line of readFileSync(j, "utf8").trim().split("\n")) {
      if (!line) continue;
      let ev; try { ev = JSON.parse(line); } catch { continue; }
      const games = ev?.result?.games;
      if (!Array.isArray(games)) continue;
      for (const g of games) if (g && g.slug) { bySlug.set(g.slug, { ...g, _src: "journal:" + d }); sources.journal++; }
    }
  }
}
/* 2. disk batches (fill gaps only) */
const OUT = join(SP, "audit-out");
if (existsSync(OUT)) {
  for (const f of readdirSync(OUT).filter(f => f.endsWith(".json"))) {
    let o; try { o = JSON.parse(readFileSync(join(OUT, f), "utf8")); } catch { continue; }
    for (const g of (o.games || [])) if (g && g.slug && !bySlug.has(g.slug)) { bySlug.set(g.slug, { ...g, _src: "disk:" + f }); sources.disk++; }
  }
}

/* 2b. the adversarial verify pass: a "looks broken" claim only survives if a second
   reader, whose job was to refute it, could not. Refuted claims are demoted, not deleted. */
const verdicts = new Map();
if (existsSync(WFDIR)) {
  for (const d of readdirSync(WFDIR)) {
    const j = join(WFDIR, d, "journal.jsonl");
    if (!existsSync(j)) continue;
    for (const line of readFileSync(j, "utf8").trim().split("\n")) {
      if (!line) continue;
      let ev; try { ev = JSON.parse(line); } catch { continue; }
      const r = ev?.result;
      if (r && r.slug && typeof r.still_broken === "boolean") verdicts.set(r.slug, r);
    }
  }
}
let confirmed = 0, refuted = 0, unchecked = 0;
for (const [slug, g] of bySlug) {
  if (!g.looks_broken) continue;
  const v = verdicts.get(slug);
  if (!v) { g.broken_check = "not yet second-checked"; unchecked++; continue; }
  if (v.still_broken) { g.broken_check = "confirmed on a second look"; g.broken_severity = v.severity; g.broken_why = v.why; confirmed++; }
  else { g.looks_broken = false; g.broken_check = "REFUTED on a second look: " + (v.why || ""); refuted++; }
}

/* 3. join with the measured data */
const input = JSON.parse(readFileSync(join(SP, "audit-input.json"), "utf8"));
const inBySlug = Object.fromEntries(input.map(r => [r.slug, r]));
const flat = existsSync(join(SP, "flatness.json"))
  ? Object.fromEntries(JSON.parse(readFileSync(join(SP, "flatness.json"), "utf8")).map(r => [r.slug, r])) : {};
const created = {};
if (existsSync(join(SP, "created.txt"))) {
  for (const l of readFileSync(join(SP, "created.txt"), "utf8").trim().split("\n")) {
    const [d, k] = l.split(" ");
    if (!k) continue;
    const [kind, name] = k.split(":");
    created[kind === "sat" ? name : "play-" + name] = d;
  }
}

const rows = [];
for (const [slug, g] of bySlug) {
  const rec = inBySlug[slug] || {};
  rows.push({
    ...g,
    name: rec.name || slug, kind: rec.kind, cat: rec.cat, gated: rec.gated, url: rec.url,
    sourceFile: rec.sourceFile, reached: rec.capture?.reached,
    created: created[slug] || null,
    fill: flat[slug]?.fill ?? null, hues: flat[slug]?.hues ?? null, edges: flat[slug]?.edges ?? null,
    assetFiles: rec.code?.assetFiles ?? null, assetKB: rec.code?.assetKB ?? null,
    emojiTotal: rec.code?.emojiTotal ?? null,
  });
}
rows.sort((a, b) => (b.impact - a.impact) || String(a.slug).localeCompare(String(b.slug)));
writeFileSync(join(SP, "audit-merged.json"), JSON.stringify(rows, null, 1));

const expected = new Set(input.map(r => r.slug));
const missing = [...expected].filter(s => !bySlug.has(s));
const counts = rows.reduce((a, r) => (a[r.verdict] = (a[r.verdict] || 0) + 1, a), {});
console.log("merged games:", rows.length, "| from journal:", sources.journal, "| from disk only:", sources.disk);
console.log("verdicts:", JSON.stringify(counts));
console.log("looks_broken (surviving):", rows.filter(r => r.looks_broken).length, "| confirmed:", confirmed, "| refuted:", refuted, "| unchecked:", unchecked);
console.log("music chip collisions:", rows.filter(r => r.music_chip_collision && !/^none$/i.test(r.music_chip_collision)).length);
console.log("total graphics asks:", rows.reduce((a, r) => a + (r.graphics_wants?.length || 0), 0));
console.log("total css asks:", rows.reduce((a, r) => a + (r.css_wants?.length || 0), 0));
console.log("MISSING (" + missing.length + "):", missing.join(", ") || "none");
