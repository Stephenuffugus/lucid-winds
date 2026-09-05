/* Group every art ask into batches you can generate in one sitting.
   Buckets are decided by what the asset IS, so one style setup covers a whole batch. */
import { readFileSync, writeFileSync } from "fs";
const SP = "/tmp/claude-1000/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/scratchpad";
const rows = JSON.parse(readFileSync(SP + "/audit-merged.json", "utf8")).filter(r => r.slug !== "play-pompond");

const BUCKETS = [
  ["Backgrounds & backdrops", /\b(bg|backdrop|background|scene|sky|field|table|felt|floor|room|arena|lane|court|board-bg|plate)\b/i],
  ["Title marks & logos", /\b(logo|title|wordmark|titlemark|title-mark|splash|banner|nameplate)\b/i],
  ["Creatures, characters & sprites", /\b(sprite|creature|critter|hero|character|body|bug|animal|pest|boss|enemy|player|mascot|bird|fish|cat|dog)\b/i],
  ["Props, pieces & tiles", /\b(tile|piece|token|card|dice|die|stone|pot|seed|leaf|petal|gem|orb|block|brick|prop|item|shelf|plank|suit|crown|board|swatch|frame|watch|fit|outfit|costume|peg|cup|bowl|jar|key|coin|ring|book|page|sheet)\b/i],
  ["Icons, chips & HUD", /\b(icon|chip|badge|pip|hud|button|btn|cursor|marker|glyph|emblem|crest)\b/i],
  ["Textures, FX & overlays", /\b(texture|pattern|noise|grain|dust|veil|scrim|vignette|glow|spark|particle|fx|trail|swoosh|shadow|haze|letterbox|mist|fog|blur|light|beam|ray)\b/i],
];

const buckets = new Map(BUCKETS.map(([n]) => [n, []]));
buckets.set("Everything else", []);

for (const r of rows) {
  for (const a of (r.graphics_wants || [])) {
    const hay = `${a.asset} ${a.spec}`;
    const hit = BUCKETS.find(([, re]) => re.test(hay));
    buckets.get(hit ? hit[0] : "Everything else").push({ game: r.name || r.slug, slug: r.slug, ...a });
  }
}

let md = "";
for (const [name, items] of buckets) {
  if (!items.length) continue;
  items.sort((a, b) => a.game.localeCompare(b.game));
  md += `\n## ${name}  (${items.length} assets across ${new Set(items.map(i => i.slug)).size} games)\n\n`;
  md += "| game | file | spec |\n|---|---|---|\n";
  for (const i of items) {
    const esc = s => String(s || "").replace(/\|/g, "\\|").replace(/\n+/g, " ").trim();
    md += `| ${esc(i.game)} | \`${esc(i.asset)}\` | ${esc(i.spec)} |\n`;
  }
}
writeFileSync(SP + "/part-batches.md", md);
const counts = [...buckets].map(([n, i]) => `${n}: ${i.length}`).filter(s => !/: 0$/.test(s));
console.log(counts.join("\n"));
console.log("TOTAL assets:", rows.reduce((a, r) => a + (r.graphics_wants?.length || 0), 0));
