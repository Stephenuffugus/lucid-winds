/* FTW coach: reads a flight-recorder run log (the JSON from COPY RUN LOG,
   saved to a file) and lays out the evidence for the assessment:
   trajectory, decision cadence, and the red flags worth a human look.
   Usage: node scripts/ftw_coach.mjs <runlog.json>
   The verdict (winnable or not, what to change) stays a judgment call made
   ON this evidence plus counterfactual sims - this script never guesses. */
import fs from "fs";

const f = process.argv[2];
if (!f) { console.error("usage: node scripts/ftw_coach.mjs <runlog.json>"); process.exit(2); }
const d = JSON.parse(fs.readFileSync(f, "utf8"));
if (!d || !d.h || !Array.isArray(d.log)) { console.error("not a flight-recorder log"); process.exit(1); }

const log = d.log;
const snaps = log.filter(e => e.k === "snap");
const acts = log.filter(e => e.k === "act");
const nodes = log.filter(e => e.k === "node");
const evs = log.filter(e => e.k === "ev");
const unrest = log.filter(e => e.k === "unrest");
const end = log.find(e => e.k === "end");
const money = v => v >= 1e9 ? (v / 1e9).toFixed(2) + "B" : v >= 1e6 ? (v / 1e6).toFixed(1) + "M" : String(v);

console.log(`\n=== FTW RUN · ${d.h.mode}/${d.h.diff} from ${d.h.start}${d.h.co ? " · " + d.h.co : ""} ===`);
console.log(end ? `outcome: ${end.won ? "WIN" : "LOSS"} (${end.why}) day ${end.d}` : `no ending on tape (last day ${log.length ? log[log.length - 1].d : "?"})`);
console.log(`tape: ${log.length} entries · ${snaps.length} snapshots · ${nodes.length} nodes · ${acts.length} region actions · ${evs.length} event choices`);
if (log.some(e => e.k === "truncated")) console.log("⚠ tape TRUNCATED at the cap - late game is missing");

console.log("\n--- trajectory (every ~90 days) ---");
console.log("day    subj   patr   sus   org   markets  cash      inf   war  bubbles");
snaps.filter((s, i) => i % 3 === 0 || i === snaps.length - 1).forEach(s =>
  console.log(String(s.d).padEnd(7) + String(s.subj).padEnd(7) + String(s.ovr).padEnd(7)
    + String(s.sus).padEnd(6) + String(s.res).padEnd(6) + String(s.mkt).padEnd(9)
    + money(s.cash).padEnd(10) + String(s.inf).padEnd(6) + String(s.war).padEnd(5) + String(s.bub ?? "")));

console.log("\n--- the build, in order ---");
console.log(nodes.map(n => `${n.id}@d${n.d}`).join("  ") || "(no nodes bought)");

console.log("\n--- region action cadence ---");
const hist = {};
acts.forEach(a => { hist[a.a] = (hist[a.a] || 0) + 1; });
console.log(Object.entries(hist).map(([k, v]) => `${k} x${v}`).join(" · ") || "(none)");
const fatigued = acts.filter(a => a.a === "concede" && a.fat).length;
const theater = acts.filter(a => a.a === "concede" && a.again).length;
if (fatigued || theater) console.log(`concede quality: ${theater} repeats inside 10d (half value), ${fatigued} under capitulation fatigue (no goodwill)`);

console.log("\n--- event choices ---");
console.log(evs.map(e => `${e.id}:${e.o}@d${e.d}`).join("  ") || "(none reached him?)");

console.log("\n--- street history ---");
const up = unrest.filter(u => u.s === "uprising");
console.log(`${unrest.length} state changes · ${unrest.filter(u => u.s === "violent").length} riots · ${up.length} uprisings${up.length ? " (" + up.map(u => u.r + "@d" + u.d).join(", ") + ")" : ""}`);

console.log("\n--- red flags (evidence, not verdicts) ---");
const flags = [];
/* idle treasury: cash sitting while the loss meter climbed */
for (let i = 3; i < snaps.length; i++) {
  const a = snaps[i - 3], b = snaps[i];
  if (b.ovr - a.ovr > 8 && Math.min(a.cash, b.cash) > 500e6) {
    flags.push(`d${a.d}-d${b.d}: patriotism +${(b.ovr - a.ovr).toFixed(1)} while holding ${money(Math.min(a.cash, b.cash))}+ unspent`);
    i += 3;
  }
}
/* suspicion spikes with no blackout inside 40 days */
snaps.forEach((s, i) => {
  if (i && s.sus - snaps[i - 1].sus > 5) {
    const answered = acts.some(a => a.a === "blackout" && a.d >= snaps[i - 1].d && a.d <= s.d + 40);
    if (!answered) flags.push(`d${s.d}: suspicion spiked to ${s.sus} with no blackout answer inside 40d`);
  }
});
/* the last 300 days before a patriotism loss: was there a countermove */
if (end && !end.won && end.why !== "refusal") {
  const lateNodes = nodes.filter(n => n.d > end.d - 300).length;
  const lateDesk = log.filter(e => e.k === "desk" && e.d > end.d - 300).length;
  flags.push(`final 300 days: ${lateNodes} nodes + ${lateDesk} desk buys while patriotism closed it out`);
  const s70 = snaps.find(s => s.ovr >= 70);
  if (s70) flags.push(`patriotism crossed 70 at d${s70.d}; the run ended d${end.d} (${end.d - s70.d} days of runway after the warning zone)`);
}
/* influence starvation or hoarding */
const hiInf = snaps.filter(s => s.inf > 120).length;
if (hiInf > snaps.length / 3) flags.push(`influence sat above 120 in ${hiInf}/${snaps.length} snapshots - the tree wanted feeding`);
console.log(flags.length ? flags.map(x => "  - " + x).join("\n") : "  (none tripped)");
console.log("\nNext step for the coach: judge these against a counterfactual sim from the same mode/diff/start.\n");
