/* PUB1 step 1: mechanically screen every openable satellite for publisher fitness.
   node publish/tools/pick_screen.mjs            table
   node publish/tools/pick_screen.mjs --json     machine readable

   ⛔ Never regexes the catalog: it imports scripts/catalog.mjs, the one counter.
   ⛔ Two traps this screener already fell into and now guards:
      - "leaflet" as a SUBSTRING matched mahjong's tile called a "leaflet", which
        would have thrown out a perfectly clean 7 MB game. Leaflet is detected as
        a script/link SRC or an `L.map(` call, never as a word.
      - three.min.js carries "https://github.com/..." inside the library's own
        banner. Three games were disqualified for an external call that is a
        string in a vendored file and is never fetched. Foreign hosts are read
        from tag attributes (src/href/url()), not from any text that looks like a URL. */
import { catalog } from "../../scripts/catalog.mjs";
import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const sh = (c) => { try { return execSync(c, {maxBuffer: 64*1024*1024, cwd: REPO}).toString(); } catch { return ""; } };

const vendored = sh("node scripts/vendor_satellites.mjs --list")
  .trim().split("\n").map(l => l.trim().split(/\s+/)[0]).filter(Boolean);
/* already shipped, or handled by its own step of PUB1 */
const DONE = ["blooming-words", "hues"], JIMOTHY = ["stream-hop"];
const EXCLUDE = new Set([...DONE, ...JIMOTHY, ...vendored]);

/* the round-end names the builder hooks, most specific first */
export const ROUND_END = ["completeLevel","levelComplete","endRound","roundOver","endRun",
  "endGame","gameOver","winLevel","showWin","winGame","showResults","showResult","onWin","finish","win"];
export function findHook(src) {
  for (const n of ROUND_END) {
    for (const pat of [`function\\s+${n}\\s*\\(`, `(?:var|let|const)\\s+${n}\\s*=\\s*function\\s*\\(`,
                       `(?:var|let|const)\\s+${n}\\s*=\\s*\\([^)]*\\)\\s*=>`, `\\b${n}\\s*:\\s*function\\s*\\(`]) {
      if (new RegExp(pat).test(src)) return n;
    }
  }
  return null;
}

const c = catalog(join(REPO, "portal/index.html"));
const rows = [];
for (const s of c.sats) {
  if (s.gated || !s.dir || EXCLUDE.has(s.dir)) continue;
  const dir = join(REPO, "satellites", s.dir);
  if (!existsSync(join(dir, "index.html"))) continue;
  const html = readFileSync(join(dir, "index.html"), "utf8");
  const bytes = +sh(`du -sb ${JSON.stringify(dir)}`).split("\t")[0] || 0;

  /* foreign hosts, read from ATTRIBUTES only (see the three.js trap above) */
  const attrs = sh(`grep -rhoE '(src|href)="https?://[^"]+"|url\\(https?://[^)]+\\)' ${JSON.stringify(dir)} --include=*.html --include=*.js --include=*.css 2>/dev/null | sort -u`)
    .trim().split("\n").filter(Boolean);
  const hosts = [...new Set(attrs.map(a => (a.match(/https?:\/\/([^/"')]+)/) || [])[1]).filter(Boolean))];
  const foreign = hosts.filter(h => !/lucidwinds\.com|stephenuffugus\.github\.io/.test(h));

  /* absolute same-origin refs the ZIP cannot carry (the builder must strip these) */
  const shellRefs = [...new Set((html.match(/(?:src|href)="\/[^"]*"/g) || []))];

  rows.push({
    name: s.name, dir: s.dir, cat: s.cat,
    mb: +(bytes / 1048576).toFixed(2),
    files: +sh(`find ${JSON.stringify(dir)} -type f | wc -l`).trim(),
    unrefDirs: unreferenced(dir),
    firebase: /firebase(?:\.initializeApp|-app|\/app)|firebasejs/.test(html),
    leaflet: /(?:src|href)="[^"]*leaflet|L\.map\s*\(/.test(html),
    cdnFont: hosts.some(h => /fonts\.(googleapis|gstatic)/.test(h)),
    foreign, shellRefs,
    hook: findHook(html),
    sbSites: (html.match(/window\._sbCapEarn\s*\(/g) || []).length
  });
}

/* top-level asset folders no shipped file names — dead weight in a ZIP */
function unreferenced(dir) {
  const tops = sh(`find ${JSON.stringify(dir)} -maxdepth 1 -mindepth 1 -type d -printf '%f\\n'`).trim().split("\n").filter(Boolean);
  const out = [];
  for (const t of tops) {
    const hits = sh(`grep -rl ${JSON.stringify(t + "/")} ${JSON.stringify(dir)} --include=*.html --include=*.js --include=*.css --include=*.json 2>/dev/null | wc -l`).trim();
    if (hits === "0") out.push({ dir: t, mb: +((+sh(`du -sb ${JSON.stringify(join(dir, t))}`).split("\t")[0] || 0) / 1048576).toFixed(2) });
  }
  return out;
}

const fails = r => [
  r.firebase && "firebase", r.leaflet && "leaflet", r.cdnFont && "cdn-font",
  r.foreign.length && ("external:" + r.foreign.join(",")), r.mb > 20 && "over-20MB",
  !r.hook && !r.sbSites && "no-round-end"
].filter(Boolean);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(rows.map(r => ({ ...r, fails: fails(r) })), null, 1));
} else {
  rows.sort((a, b) => a.mb - b.mb);
  for (const r of rows) {
    const f = fails(r);
    console.log([r.dir.padEnd(21), (r.mb + "MB").padStart(9), String(r.files).padStart(4) + "f",
      (r.hook ? "hook:" + r.hook : "hook:-").padEnd(18), ("sb:" + r.sbSites).padEnd(5),
      f.length ? "REJECT " + f.join(" ") : "PASS"].join(" "));
  }
  const pass = rows.filter(r => !fails(r).length);
  console.log(`\n${rows.length} screened, ${pass.length} pass, ${rows.length - pass.length} rejected`);
}
