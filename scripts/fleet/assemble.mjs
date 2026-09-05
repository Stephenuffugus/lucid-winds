/* Stitch the parts into the repo documents. */
import { readFileSync, writeFileSync } from "fs";
const SP = "/tmp/claude-1000/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/scratchpad";
const REPO = "/workspaces/lucid-winds";
const R = f => readFileSync(SP + "/" + f, "utf8");
const stats = JSON.parse(R("stats.json"));

const n = stats.byVerdict;
const sat = stats.bySection.satellite, nat = stats.bySection.native;
const pct = (a, b) => Math.round((a / b) * 100);
const satN = Object.values(sat).reduce((a, b) => a + b, 0);
const natN = Object.values(nat).reduce((a, b) => a + b, 0);

const part2 = `---

# PART 2 — THE WHOLE FLEET, WORST FIRST

${stats.games} games. Ordered by grade, then by how much a pass would visibly gain.

**Where the fleet stands**

| | poor | plain | decent | strong |
|---|---|---|---|---|
| **all ${stats.games}** | ${n.poor || 0} | ${n.plain || 0} | ${n.decent || 0} | ${n.strong || 0} |
| satellites (${satN}) | ${sat.poor || 0} | ${sat.plain || 0} | ${sat.decent || 0} | ${sat.strong || 0} |
| natives (${natN}) | ${nat.poor || 0} | ${nat.plain || 0} | ${nat.decent || 0} | ${nat.strong || 0} |

- **${(n.poor || 0) + (n.plain || 0)} games (${pct((n.poor || 0) + (n.plain || 0), stats.games)}%)** are *poor* or *plain* — flat colour, system font, emoji or CSS shapes doing the work of art.
- **${n.strong || 0} games (${pct(n.strong || 0, stats.games)}%)** already carry themselves and want nothing but small polish.
- **${stats.totalArtAsks} art files** and **${stats.totalCssAsks} CSS jobs** are named across the fleet.
- **${stats.chipCollisions.length} games** have the injected music chip sitting on their own UI (Job 2).
  Counted conservatively — only where the auditor named what it covers.
- **${stats.emojiHeavySource} games** carry 20+ emoji in their source, and ${stats.emojiSomeSource} carry
  at least one. That is a *measured* count from the code, not a judgement; whether the emoji is
  standing in for art is a per-game call in Part 3 (Job 7).
- **${stats.looksBrokenCount} games** show something visibly wrong in the frame — clipped UI,
  overlapping text, art that failed to load. Every one of these claims went to a second reader
  whose only job was to **refute** it: **${stats.brokenConfirmed} were confirmed on that second
  look, ${stats.brokenRefuted} were refuted and demoted**${stats.brokenUnchecked ? `, and ${stats.brokenUnchecked} are marked "not yet second-checked" in Part 3` : ""}.
  Refuted claims are left in the per-game notes with the refutation, not silently deleted.

**"Empty"** is the share of the play frame taken by its single most common colour — a rough
measure of how much is actually on screen. High is not automatically bad (a deliberately minimal
game scores high), but it is a good place to look first.

${R("part-table.md")}`;

const master = [
  R("part-head.md"),
  R("part1.md").replace("__CHIPCOUNT__", String(stats.chipCollisions.length)),
  part2,
  `---

# PART 4 — THE ART, GROUPED INTO BATCHES

Same ${stats.totalArtAsks} assets as Part 3, regrouped by what the asset *is*, so one style setup
covers a whole batch. Fleet convention (from \`SATELLITE_ART_QUEUE.md\`): transparent PNG **or**
paint on flat magenta \`#FF00FF\` for chroma-key; paint big but keep under 1600px on the long side;
no baked-in text except a real wordmark; midnight-greenhouse palette — deep near-black grounds,
sage green, warm gold, cream, a touch of rose; cozy storybook, soft painterly, warm rim light,
big readable silhouettes, a little glow.

${R("part-batches.md")}`,
  R("part5.md"),
  `---

# PART 3 — THE PER-GAME WORKING LIST

Split by kind, because the fix pattern differs:

- **\`FLEET-ART-DETAIL-SATELLITES.md\`** — ${satN} games, each owning its own folder and CSS.
- **\`FLEET-ART-DETAIL-NATIVES.md\`** — ${natN} games sharing one shell; most of these are waiting
  on Job 1 before a per-game pass is even worth starting.

Both are also browsable, filterable and tickable in the published punch list.
`,
].join("\n");

writeFileSync(REPO + "/FLEET-ART-AUDIT-SEP04.md", master);
writeFileSync(REPO + "/FLEET-ART-DETAIL-SATELLITES.md",
  `# Fleet art detail — satellites (${satN} games)\n\nPer-game working list. Master doc, cross-cutting jobs and art batches: \`FLEET-ART-AUDIT-SEP04.md\`.\n` + R("part-detail-sat.md"));
writeFileSync(REPO + "/FLEET-ART-DETAIL-NATIVES.md",
  `# Fleet art detail — native /play/ games (${natN} games)\n\nPer-game working list. These all share \`play/shell.css\` + \`shared.css\`, so read **Job 1** in \`FLEET-ART-AUDIT-SEP04.md\` first — most of them cannot have a background at all until it lands.\n` + R("part-detail-nat.md"));
writeFileSync(REPO + "/FLEET-ART-FACTS-SEP04.md", R("verified-facts.md"));

console.log("wrote 4 docs:");
for (const f of ["FLEET-ART-AUDIT-SEP04.md", "FLEET-ART-DETAIL-SATELLITES.md", "FLEET-ART-DETAIL-NATIVES.md", "FLEET-ART-FACTS-SEP04.md"]) {
  const s = readFileSync(REPO + "/" + f, "utf8");
  console.log(" ", f.padEnd(34), Math.round(s.length / 1024) + "KB", s.split("\n").length + " lines");
}
