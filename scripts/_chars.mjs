/* Parse the CHARS array instead of regexing it. A regex gave 7 code + 6 weekly;
   a stricter one gave 6 + 5. When the same question gives different answers,
   stop answering it and use the engine. */
import { readFileSync } from "fs";
import { runInNewContext } from "vm";
const src = readFileSync("satellites/stream-hop/index.html", "utf8");
function grab(decl) {
  const i = src.indexOf(decl); if (i < 0) throw new Error("no " + decl);
  const start = src.indexOf("[", i);
  let d = 0, inStr = null, k = start;
  for (; k < src.length; k++) {
    const c = src[k], p = src[k - 1], n = src[k + 1];
    if (inStr) { if (c === inStr && p !== "\\") inStr = null; continue; }
    if (c === "/" && n === "*") { const e = src.indexOf("*/", k + 2); k = e < 0 ? src.length : e + 1; continue; }
    if (c === "/" && n === "/") { const e = src.indexOf("\n", k + 2); k = e < 0 ? src.length : e; continue; }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (c === "[") d++; else if (c === "]") { d--; if (!d) { k++; break; } }
  }
  return runInNewContext("(" + src.slice(start, k) + ")");
}
const CHARS = grab("var CHARS=") ;
const REWARD = grab("var REWARD_SKINS=");
const by = {};
for (const c of CHARS) { const k = c.via || (c.rar === "starter" ? "starter" : (c.secret ? "secret" : "shop")); (by[k] ||= []).push(c); }
console.log("TOTAL CHARACTERS:", CHARS.length);
for (const k of Object.keys(by).sort()) console.log(`  ${k.padEnd(8)} ${String(by[k].length).padStart(3)}  ${by[k].map(c => c.id).join(" ")}`);
console.log("\nREWARD_SKINS (the weekly ladder, in order):", REWARD.join(" "));
const weekly = (by.weekly || []).map(c => c.id);
console.log("weekly chars NOT on the ladder:", weekly.filter(i => !REWARD.includes(i)).join(" ") || "(none)");
console.log("ladder entries NOT marked via:weekly:", REWARD.filter(i => !weekly.includes(i)).join(" ") || "(none)");
