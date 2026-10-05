// Dump the LIVE arcade catalog (origin/main's portal) as JSON: every card with all its fields.
import { readFileSync, writeFileSync } from "fs";
import { runInNewContext } from "vm";
import { execFileSync } from "child_process";
const src = execFileSync("git", ["show", "origin/main:portal/index.html"], { cwd: "/workspaces/lucid-winds", encoding: "utf8", maxBuffer: 1 << 28 });
writeFileSync(process.argv[2] + "/portal-main.html", src);
const { catalog } = await import("/workspaces/lucid-winds/scripts/catalog.mjs");
const c = catalog(process.argv[2] + "/portal-main.html");
// raw rows too, for every field the catalog object drops
function grab(decl) { const i = src.indexOf(decl), s = src.indexOf("[", i); let d = 0, q = null, k = s;
  for (; k < src.length; k++) { const ch = src[k], nx = src[k + 1];
    if (q) { if (ch === "\\") { k++; continue; } if (ch === q) q = null; continue; }
    if (ch === "/" && nx === "/") { k = src.indexOf("\n", k); continue; } if (ch === "/" && nx === "*") { k = src.indexOf("*/", k) + 1; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { q = ch; continue; } if (ch === "[") d++; else if (ch === "]") { d--; if (!d) break; } }
  return runInNewContext("(" + src.slice(s, k + 1) + ")"); }
const featured = grab("var FEATURED ="), games = grab("var GAMES =");
writeFileSync(process.argv[2] + "/catalog.json", JSON.stringify({ counts: { sat: c.sats.length, nat: c.nat.length, total: c.total, gated: c.gated, open: c.open }, featured, games }, null, 1));
console.log("satellite cards", featured.length, "| native rows", games.length, "| gated", c.gated, "| open", c.open);
console.log("featured keys:", [...new Set(featured.flatMap(o => Object.keys(o)))].join(","));
console.log("native row lengths:", [...new Set(games.map(g => g.length))].join(","));
console.log("sample featured:", JSON.stringify(featured[0]).slice(0, 400));
console.log("sample native:", JSON.stringify(games[0]).slice(0, 300), JSON.stringify(games.find(g => g.length >= 6)).slice(0, 300));
