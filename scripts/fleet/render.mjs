/* Emit the ranked table and the per-game working list from audit-merged.json. */
import { readFileSync, writeFileSync } from "fs";
const SP = "/tmp/claude-1000/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/scratchpad";
const rows = JSON.parse(readFileSync(SP + "/audit-merged.json", "utf8"))
  .filter(r => r.slug !== "play-pompond");   /* external app; its local URL 404s by design */

const VORDER = { poor: 0, plain: 1, decent: 2, strong: 3 };
const disp = r => r.name || r.slug;
const kindOf = r => r.kind === "native" ? "native" : "satellite";
const esc = s => String(s == null ? "" : s).replace(/\|/g, "\\|").replace(/\n+/g, " ").trim();

/* ── ranked table ── */
const ranked = [...rows].sort((a, b) =>
  (VORDER[a.verdict] - VORDER[b.verdict]) || (b.impact - a.impact) ||
  ((b.fill ?? 0) - (a.fill ?? 0)) || disp(a).localeCompare(disp(b)));

let t = "| # | Game | Where | Age | Look | Impact | Effort | Empty | The one thing it needs |\n";
t += "|---|---|---|---|---|---|---|---|---|\n";
ranked.forEach((r, i) => {
  const empty = r.fill == null ? "-" : Math.round(r.fill * 100) + "%";
  const need = r.graphics_wants?.[0]?.asset
    ? `${esc(r.graphics_wants[0].asset)} - ${esc(r.graphics_wants[0].why).slice(0, 80)}`
    : esc(r.css_wants?.[0] || r.background_want || "").slice(0, 90);
  t += `| ${i + 1} | **${esc(disp(r))}** | ${kindOf(r)} | ${r.created || "-"} | ${r.verdict} | ${r.impact} | ${r.effort} | ${empty} | ${need} |\n`;
});
writeFileSync(SP + "/part-table.md", t);

/* ── per-game detail, split by kind: the fix patterns differ ── */
const groups = [["poor", "POOR — looks unfinished or accidental"],
                ["plain", "PLAIN — flat colour, system font, emoji doing the work of art"],
                ["decent", "DECENT — deliberate but thin"],
                ["strong", "STRONG — already carries itself"]];

function detailFor(list) {
  let d = "";
  for (const [v, label] of groups) {
    const g = list.filter(r => r.verdict === v);
    if (!g.length) continue;
    d += `\n---\n\n## ${label}  (${g.length})\n`;
    for (const r of g) {
      d += `\n### ${disp(r)}\n`;
      d += `\`${r.slug}\` · ${kindOf(r)} · ${r.cat || "-"} · first committed ${r.created || "unknown"}`;
      if (r.gated) d += " · **workbench-gated**";
      d += ` · impact ${r.impact}/5 · effort ${r.effort}\n`;
      d += `\`${r.sourceFile || ""}\`\n\n`;
      d += `**Now:** ${esc(r.looks_now)}\n\n`;
      if (r.three_wrong?.length) {
        d += `**Wrong with it:**\n`;
        r.three_wrong.forEach(w => { d += `- ${String(w).trim()}\n`; });
        d += "\n";
      }
      d += `**Background now:** ${esc(r.background_now)}\n\n`;
      d += `**Background wanted:** ${esc(r.background_want)}\n\n`;
      if (r.graphics_wants?.length) {
        d += `**Art to paint:**\n\n| file | spec | replaces |\n|---|---|---|\n`;
        r.graphics_wants.forEach(a => { d += `| \`${esc(a.asset)}\` | ${esc(a.spec)} | ${esc(a.why)} |\n`; });
        d += "\n";
      }
      if (r.css_wants?.length) {
        d += `**CSS to do:**\n`;
        r.css_wants.forEach(c => { d += `- ${String(c).trim()}\n`; });
        d += "\n";
      }
      const bits = [];
      if (r.emoji_as_art && !/^none/i.test(r.emoji_as_art)) bits.push(`**Emoji as art:** ${esc(r.emoji_as_art)}`);
      if (r.readability && !/^ok\b/i.test(r.readability)) bits.push(`**Readability:** ${esc(r.readability)}`);
      if (r.music_chip_collision && !/^(none|no\b)/i.test(r.music_chip_collision)) bits.push(`**Music chip:** ${esc(r.music_chip_collision)}`);
      if (r.looks_broken) bits.push(`**Looks broken** (${esc(r.broken_check || "unchecked")}${r.broken_severity ? ", severity " + esc(r.broken_severity) : ""})**:** ${esc(r.broken_evidence)}`);
      else if (r.broken_check && /^REFUTED/.test(r.broken_check)) bits.push(`**A "looks broken" claim here was refuted on a second look.** ${esc(r.broken_check.replace(/^REFUTED on a second look: /, "")).slice(0, 400)}`);
      if (bits.length) d += bits.join("\n\n") + "\n";
    }
  }
  return d;
}
writeFileSync(SP + "/part-detail-sat.md", detailFor(ranked.filter(r => r.kind === "satellite")));
writeFileSync(SP + "/part-detail-nat.md", detailFor(ranked.filter(r => r.kind === "native")));
const d = detailFor(ranked);

/* ── stats for the narrative ── */
const stat = {
  games: rows.length,
  byVerdict: rows.reduce((a, r) => (a[r.verdict] = (a[r.verdict] || 0) + 1, a), {}),
  bySection: {
    satellite: rows.filter(r => r.kind === "satellite").reduce((a, r) => (a[r.verdict] = (a[r.verdict] || 0) + 1, a), {}),
    native: rows.filter(r => r.kind === "native").reduce((a, r) => (a[r.verdict] = (a[r.verdict] || 0) + 1, a), {}),
  },
  /* These fields are free prose, not booleans, so a prefix test over-counts badly
     (a naive filter said 126 of 126 games had a readability fault). Count only what
     can be counted honestly: a conservative keyword test for the chip, and the
     MEASURED emoji count from the source rather than the auditor's wording. */
  chipCollisions: rows.filter(r => {
    const t = (r.music_chip_collision || "").trim();
    if (!t || /^(none|no\b|not\b|n\/a)/i.test(t)) return false;
    return /\b(cover|covering|covers|overlap|obscur|on top of|clip|occlud|lands on|hides|sits over|destroy)/i.test(t);
  }).map(r => disp(r)),
  emojiHeavySource: rows.filter(r => (r.emojiTotal || 0) >= 20).length,
  emojiSomeSource: rows.filter(r => (r.emojiTotal || 0) > 0).length,
  looksBrokenCount: rows.filter(r => r.looks_broken).length,
  brokenConfirmed: rows.filter(r => r.looks_broken && /confirmed/i.test(r.broken_check || "")).length,
  brokenRefuted: rows.filter(r => !r.looks_broken && /^REFUTED/.test(r.broken_check || "")).length,
  brokenUnchecked: rows.filter(r => r.looks_broken && /not yet/i.test(r.broken_check || "")).length,
  looksBroken: rows.filter(r => r.looks_broken).map(r => disp(r)),
  totalArtAsks: rows.reduce((a, r) => a + (r.graphics_wants?.length || 0), 0),
  totalCssAsks: rows.reduce((a, r) => a + (r.css_wants?.length || 0), 0),
  impact5: rows.filter(r => r.impact >= 5).map(r => disp(r)),
};
writeFileSync(SP + "/stats.json", JSON.stringify(stat, null, 1));
console.log(JSON.stringify(stat, null, 1).slice(0, 1800));
console.log("\ntable rows:", ranked.length, "| detail bytes:", d.length);
