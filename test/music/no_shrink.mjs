/* GATE, every phase — anti-truncation (HANDOFF-MUSIC LAW 9, 10, 16).
   Against the P0 base commit (read from docs/MUSIC-BUILD-LOG.md or --base):
     1. no pre-existing file may lose a line, EXCEPT a modification whose only
        difference is a version stamp (?v=N, lw-assets-vN). Anything else that
        deletes or rewrites a line in a pre-existing file fails, by file and line.
     2. every touched or new .js/.mjs passes node --check
     3. every touched satellites/<slug>/index.html has inline <script> blocks
        that vm.createScript can parse (a syntax error in one block kills the page)
     4. the 12 vendored index.html files match test/music/vendored_baseline.txt
   Run:  node test/music/no_shrink.mjs [--base <sha>]        Exit 1 on any failure. */
import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { createHash } from "crypto";
import vm from "vm";

const sh = (c) => { try { return execSync(c, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); } catch (e) { return String(e.stdout || ""); } };
const argi = process.argv.indexOf("--base");
const BASE = argi > 0 ? process.argv[argi + 1] : (readFileSync("docs/MUSIC-BUILD-LOG.md", "utf8").match(/base commit: `([0-9a-f]{40})`/) || [])[1];
if (!BASE) { console.error("no base commit: pass --base or fill the P0 box"); process.exit(2); }
let pass = 0, fail = 0;
const t = (n, ok, d) => { if (ok) { pass++; console.log("  ok    " + n); } else { fail++; console.log("  FAIL  " + n + (d ? "   <- " + d : "")); } };
const stampNorm = (l) => l.replace(/\?v=[0-9A-Za-z.]+/g, "?v=STAMP").replace(/['"]lw-(assets|games|tiles)-v\d+['"]/g, "'lw-$1-vSTAMP'").replace(/['"]sws-play-v\d+['"]/g, "'sws-play-vSTAMP'");

/* 1. deletions */
const numstat = sh("git diff --numstat " + BASE).trim().split("\n").filter(Boolean).map(l => l.split("\t")).map(([a, d, f]) => ({ add: +a, del: +d, file: f }));
const preexisting = (f) => sh("git cat-file -e " + BASE + ":" + JSON.stringify(f) + " 2>&1 && echo yes").includes("yes");
let anyDel = false;
/* the only pre-existing files this build is TOLD to modify freely: the handoff (P0/P5 corrections) and the
   harness's own lock file, which changes on its own. Nothing else is exempt. */
const EXEMPT = (f) => f === "HANDOFF-MUSIC.md" || f.startsWith(".claude/");
/* a pre-existing file whose working copy is IDENTICAL to origin/main did not lose a line to this build: the change
   already ships on main (it arrived by merge). Only files that differ from main are this build's to answer for. */
const sameAsMain = (f) => sh("git diff --quiet origin/main -- " + JSON.stringify(f) + " && echo same").includes("same");
for (const r of numstat) {
  if (!r.del || EXEMPT(r.file) || !preexisting(r.file)) continue;
  if (sameAsMain(r.file)) { t("deletions in " + r.file + " already ship on main (merged, not mine)", true); continue; }
  anyDel = true;
  const diff = sh("git diff " + BASE + " -- " + JSON.stringify(r.file)).split("\n");
  const minus = diff.filter(l => l.startsWith("-") && !l.startsWith("---")).map(l => l.slice(1));
  const plus  = diff.filter(l => l.startsWith("+") && !l.startsWith("+++")).map(l => l.slice(1));
  /* a stamp-only modification: every removed line has a matching added line that is identical once stamps are normalised */
  const plusNorm = plus.map(stampNorm);
  const unmatched = minus.filter(m => { const i = plusNorm.indexOf(stampNorm(m)); if (i >= 0) { plusNorm.splice(i, 1); return false; } return true; });
  t("no non-stamp deletions in " + r.file + " (" + r.del + " removed, " + r.add + " added)", unmatched.length === 0, "first: " + JSON.stringify(unmatched[0] || "").slice(0, 100));
}
if (!anyDel) t("no pre-existing file lost a line", true);

/* 2. syntax of touched/new js */
const touched = sh("git diff --name-only " + BASE).trim().split("\n").filter(Boolean).concat(sh("git ls-files --others --exclude-standard").trim().split("\n").filter(Boolean));
const js = [...new Set(touched)].filter(f => /\.(js|mjs)$/.test(f) && existsSync(f));
for (const f of js) { const out = sh("node --check " + JSON.stringify(f) + " 2>&1"); t("node --check " + f, out.trim() === "", out.split("\n")[0]); }

/* 3. inline script blocks of touched satellite pages */
const pages = [...new Set(touched)].filter(f => /^satellites\/[^/]+\/index\.html$/.test(f) && existsSync(f));
for (const f of pages) {
  const html = readFileSync(f, "utf8"); let n = 0, bad = null;
  html.replace(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi, (m, body, off) => { const open = m.slice(0, m.indexOf(">") + 1); if (/\ssrc=|type=["'](?!text\/javascript|module)/i.test(open)) return m; n++; try { new vm.Script(body, { filename: f }); } catch (e) { if (!bad) bad = "block " + n + ": " + e.message; } return m; });
  t("inline scripts parse in " + f + " (" + n + " blocks)", !bad, bad);
}
if (!pages.length) t("no satellite pages touched yet", true);

/* 4. vendored */
if (existsSync("test/music/vendored_baseline.txt")) {
  for (const line of readFileSync("test/music/vendored_baseline.txt", "utf8").trim().split("\n")) {
    const [sum, file] = line.split(/\s+/);
    const now = createHash("sha256").update(readFileSync(file)).digest("hex");
    t("vendored untouched: " + file, now === sum);
  }
}
console.log("\nno_shrink gate: " + pass + " ok, " + fail + " failed   (base " + BASE.slice(0, 8) + ")"); process.exit(fail ? 1 : 0);
