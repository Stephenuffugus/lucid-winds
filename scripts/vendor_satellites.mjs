#!/usr/bin/env node
/* VENDOR THE OFF-ORIGIN SATELLITES — one command, repeatable, drift-detecting.
   ------------------------------------------------------------------------
   node scripts/vendor_satellites.mjs --list
   node scripts/vendor_satellites.mjs --vendor [slug...]
   node scripts/vendor_satellites.mjs --check  [slug...]
   node scripts/vendor_satellites.mjs --selftest

   WHY THIS EXISTS
   13 portal cards pointed at stephenuffugus.github.io / vercel.app. A Horizon
   Store app is a TWA: a url outside `scope` opens in a browser overlay, which in
   a headset means the player is ejected from the app. They also cannot be cached
   by the arcade's own service worker and they depend on GitHub Pages staying up.

   THE DRIFT RULE (this is the whole point of the file)
   On 2026-07-29 a hand-vendored copy of Abduct a Chameleon 3D was DELETED again
   with the note "one copy again, no drift". That was the right instinct about a
   hand copy. So this is not a hand copy:

     * the upstream repo stays the source of truth — edit there, re-vendor here
     * the copy is byte-identical; every needed change goes UPSTREAM first
     * VENDORED.json records the exact commit and a sha256 per file
     * --check re-extracts upstream and prints three separate answers:
         BEHIND   upstream moved, re-vendor
         EDITED   somebody edited the vendored copy — that is drift, fix upstream
         CLEAN    identical

   ⛔ NEVER hand-edit satellites/<slug>/ for a vendored game. --check will catch
   you, and the next --vendor will silently overwrite the edit.

   WHAT PAGES ACTUALLY SERVES (checked per repo with `gh api .../pages`)
   10 of 11 github.io repos are build_type=legacy: the branch tree IS the site,
   so `git archive <ref>` is an exact mirror. Tally is build_type=workflow (Vite),
   so it is built and `dist/` is vendored. Two do not serve their default branch:
   Tarot_Run serves `setup/project-structure` and BarBrawl serves `deploy`.
   Getting that wrong vendors a site nobody is looking at.                       */

import { execFileSync } from "child_process";
import { createHash } from "crypto";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(new URL("..", import.meta.url).pathname);
const SRC_DIR = "/workspaces";                 /* sibling clones live here, never /tmp */
const SATS = path.join(ROOT, "satellites");

/* ── the manifest ────────────────────────────────────────────────────────────
   `ref` is the branch GitHub Pages SERVES, not the default branch.
   `build` is null for legacy Pages (tree is the site) or a builder name.
   `drop` removes paths that are never requested by the running game. Keep this
   list SHORT and provable — anything dropped is a file the live site had.      */
export const MANIFEST = [
  { slug:"tomato-man",         repo:"Tomato_Man",         ref:"main", card:"Tomato Man" },
  { slug:"abduct-a-chameleon", repo:"abduct_a_chameleon", ref:"main", card:"Abduct a Chameleon",
    also:["Abduct a Chameleon 3D"], drop:["test/","docs/","server/","tools/","releases/"],
    needsExit:["index.html","abduct-3d.html"] },
  { slug:"glyph-forge",        repo:"glyph_forge",        ref:"main", card:"Glyph Forge" },
  /* inherited-engine.html is a 6.8 MB dev archive of the pre-split engine. The
     running game never requests it; the only reference anywhere is a line in
     the repo's own scripts/smoke.js, which is a build tool and is not vendored.
     Shipping it made Litter Bug by far the heaviest satellite in the arcade for
     a file no player can reach. */
  { slug:"litter-bug",         repo:"Litter_Bug",         ref:"main", card:"Litter Bug",
    drop:["inherited-engine.html"] },
  { slug:"sweet-spot",         repo:"Sweet-Spot",         ref:"main", card:"Sweet Spot" },
  { slug:"tarot-run",          repo:"Tarot_Run",          ref:"setup/project-structure", card:"Tarot Run" },
  { slug:"sixfold",            repo:"sixfold",            ref:"main", card:"Sixfold", drop:["tests/","tools/"] },
  { slug:"letter-launch",      repo:"letter_launch",      ref:"main", card:"Letter Launch", drop:["tools/"] },
  { slug:"skitterlings",       repo:"skitterlings",       ref:"main", card:"Skitterlings" },
  /* Expo exports its web build with an ABSOLUTE base url baked into the bundle
     (`/BarBrawl/`, its GitHub Pages path). At any other path the entry chunk
     404s and the app never boots — a white screen, not a degraded one. The base
     cannot be relative-ised upstream without breaking the github.io copy, so it
     is rewritten here, every vendor, and recorded in VENDORED.json. */
  { slug:"wild-wardens",       repo:"BarBrawl",           ref:"deploy", card:"Wild Wardens",
    needsExit:["index.html"], /* ⛔ BOTH forms. The bundle carries `baseUrl":"/BarBrawl"` with NO trailing
       slash, and that is the one string the router matches routes against, so
       rewriting only the slashed form fixed every asset and still left every
       route unmatched: a 200, no console errors, and a "Page could not be
       found" screen. Slashed first, bare second. */
    rewrite:[["/BarBrawl/", "/satellites/wild-wardens/"], ["/BarBrawl", "/satellites/wild-wardens"]] },
  { slug:"tally",              repo:"Tally",              ref:"main", card:"Tally", build:"vite-dist" },
  /* HUNCH's three endpoints are Vercel serverless functions, so api/ is dropped
     and the page calls Vercel across origins. That is safe for a TWA: only the
     XHR leaves the origin, never a navigation, so nobody gets ejected. All three
     functions already send Access-Control-Allow-Origin: *, verified against the
     live deployment, and upstream now resolves its API base by hostname. */
  { slug:"hunch",              repo:"Hunch",              ref:"main", card:"HUNCH",
    drop:["api/","scripts/"], needsExit:["index.html","hunch.html"] },
];

const ALWAYS_DROP = [".git/", ".github/", ".gitignore", ".env.example"];

/* ── helpers ─────────────────────────────────────────────────────────────── */
/* stdio:"inherit" makes execFileSync return null, so trim() must not assume a string. */
const sh = (cmd, args, opts = {}) => {
  const out = execFileSync(cmd, args, { encoding: "utf8", maxBuffer: 1 << 28, ...opts });
  return out === null || out === undefined ? "" : String(out).trim();
};

const sha = buf => createHash("sha256").update(buf).digest("hex").slice(0, 16);

/* ⛔ Resolve the REMOTE ref, never whatever the local clone happens to be sitting
   on. The chameleon clone was parked on a `salvage` branch one commit behind
   live, so `git archive main` would have vendored a build nobody is serving. */
function resolveRef(repo, ref) {
  for (const cand of [`origin/${ref}`, ref]) {
    try { sh("git", ["-C", repo, "rev-parse", "--verify", "--quiet", cand + "^{commit}"]); return cand; }
    catch (e) { /* try the next one */ }
  }
  throw new Error(`neither origin/${ref} nor ${ref} exists in ${repo}`);
}

function repoPath(entry) {
  const p = path.join(SRC_DIR, entry.repo);
  if (!fs.existsSync(path.join(p, ".git")))
    throw new Error(`no clone at ${p} — run: gh repo clone Stephenuffugus/${entry.repo} ${p}`);
  return p;
}

function dropped(rel, entry) {
  const list = ALWAYS_DROP.concat(entry.drop || []);
  return list.some(d => (d.endsWith("/") ? rel.startsWith(d) : rel === d));
}

/* Extract exactly what the live site serves, into a fresh temp tree. */
function extract(entry, dest) {
  const repo = repoPath(entry);
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });

  if (entry.build === "vite-dist") {
    /* build_type=workflow: the repo tree is NOT the site, `dist/` is. */
    sh("git", ["-C", repo, "checkout", "-q", resolveRef(repo, entry.ref), "--", "."]);
    if (!fs.existsSync(path.join(repo, "node_modules")))
      sh("npm", ["ci", "--no-audit", "--no-fund"], { cwd: repo, stdio: "inherit" });
    sh("npm", ["run", "build"], { cwd: repo, stdio: "inherit" });
    sh("cp", ["-r", path.join(repo, "dist") + "/.", dest]);
  } else {
    const ref = resolveRef(repo, entry.ref);
    sh("bash", ["-c",
      `git -C ${JSON.stringify(repo)} archive ${JSON.stringify(ref)} | tar -x -C ${JSON.stringify(dest)}`]);
  }

  for (const rel of walk(dest))
    if (dropped(rel, entry)) fs.rmSync(path.join(dest, rel), { force: true });
  prune(dest);
  return { commit: sh("git", ["-C", repo, "rev-parse", resolveRef(repo, entry.ref)]) };
}

function walk(dir, base = dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, base, out);
    else out.push(path.relative(base, full));
  }
  return out;
}

function prune(dir) {                       /* drop directories left empty by --drop */
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const full = path.join(dir, e.name);
    prune(full);
    if (fs.readdirSync(full).length === 0) fs.rmdirSync(full);
  }
}

function fingerprint(dir) {
  const map = {};
  for (const rel of walk(dir).sort()) map[rel] = sha(fs.readFileSync(path.join(dir, rel)));
  return map;
}

/* ── commands ────────────────────────────────────────────────────────────── */
function doVendor(entries) {
  for (const entry of entries) {
    const tmp = path.join("/tmp", `vendor-${entry.slug}-${process.pid}`);
    const { commit } = extract(entry, tmp);
    const files = fingerprint(tmp);
    const dest = path.join(SATS, entry.slug);

    /* Preserve anything the arcade owns rather than upstream (audit notes). */
    const keep = ["AUDIT-NOTES.md"];
    const saved = {};
    for (const k of keep) {
      const p = path.join(dest, k);
      if (fs.existsSync(p)) saved[k] = fs.readFileSync(p);
    }

    fs.rmSync(dest, { recursive: true, force: true });
    fs.mkdirSync(dest, { recursive: true });
    sh("cp", ["-r", tmp + "/.", dest]);
    for (const [k, v] of Object.entries(saved)) fs.writeFileSync(path.join(dest, k), v);
    fs.rmSync(tmp, { recursive: true, force: true });

    /* Absolute base paths baked into a build at its OLD url. Text only, and
       counted, so a rewrite that silently matches nothing shows up as 0.      */
    const rewrites = [];
    for (const [from, to] of entry.rewrite || []) {
      let hits = 0;
      for (const rel of walk(dest)) {
        const fp = path.join(dest, rel);
        if (!/\.(html|js|mjs|css|json|webmanifest|htaccess)$/i.test(rel) && !rel.endsWith(".htaccess")) continue;
        const before = fs.readFileSync(fp, "utf8");
        if (!before.includes(from)) continue;
        const after = before.split(from).join(to);
        fs.writeFileSync(fp, after);
        hits += before.split(from).length - 1;
        files[rel] = sha(Buffer.from(after));
      }
      rewrites.push({ from, to, hits });
      console.log(`  rewrote ${hits}x  ${from} -> ${to}` + (hits ? "" : "   ⚠ MATCHED NOTHING"));
    }

    /* The fleet's standard exit, for games that ship none of their own. It is a
       runtime injector: it adds nothing if the page already defines SWS_EXIT or
       already links to /portal, so it cannot double up. Recorded in VENDORED.json
       because it IS a difference from upstream and must not look like drift.    */
    const injected = [];
    for (const rel of entry.needsExit || []) {
      const p = path.join(dest, rel);
      if (!fs.existsSync(p)) { console.log(`  ! needsExit: no ${rel} in ${entry.slug}`); continue; }
      let html = fs.readFileSync(p, "utf8");
      if (html.includes("/arcade-exit.js")) continue;
      const tag = '\n<!-- vendored into the arcade: gives this page a way back. See scripts/vendor_satellites.mjs -->\n<script src="/arcade-exit.js" defer></script>\n';
      html = html.includes("</body>") ? html.replace(/<\/body>(?![\s\S]*<\/body>)/, tag + "</body>") : html + tag;
      fs.writeFileSync(p, html);
      injected.push(rel);
    }
    if (injected.length) for (const rel of injected) files[rel] = sha(fs.readFileSync(path.join(dest, rel)));

    const bytes = Object.keys(files).reduce((n, f) => n + fs.statSync(path.join(dest, f)).size, 0);
    fs.writeFileSync(path.join(dest, "VENDORED.json"), JSON.stringify({
      _readme: "Generated by scripts/vendor_satellites.mjs. Do not hand-edit this folder — edit the upstream repo and re-vendor.",
      repo: `Stephenuffugus/${entry.repo}`, ref: entry.ref, commit,
      build: entry.build || "none (github pages legacy: the branch tree is the site)",
      dropped: (entry.drop || []).concat(ALWAYS_DROP),
      injectedArcadeExit: injected,
      rewrittenPaths: rewrites,
      fileCount: Object.keys(files).length, bytes, files,
    }, null, 2) + "\n");

    console.log(`vendored ${entry.slug.padEnd(20)} ${Object.keys(files).length} files  ${(bytes/1048576).toFixed(1)}MB  @${commit.slice(0,8)}`);
  }
}

function doCheck(entries) {
  let bad = 0;
  for (const entry of entries) {
    const dest = path.join(SATS, entry.slug);
    const recPath = path.join(dest, "VENDORED.json");
    if (!fs.existsSync(recPath)) { console.log(`MISSING  ${entry.slug}  not vendored yet`); bad++; continue; }
    const rec = JSON.parse(fs.readFileSync(recPath, "utf8"));

    /* EDITED: the folder on disk no longer matches what was vendored. */
    const now = fingerprint(dest);
    delete now["VENDORED.json"]; delete now["AUDIT-NOTES.md"];
    const edited = [];
    for (const f of new Set([...Object.keys(rec.files), ...Object.keys(now)]))
      if (rec.files[f] !== now[f]) edited.push(f);

    /* BEHIND: upstream has moved past the commit we vendored. */
    let behind = null;
    try { const rp = repoPath(entry); behind = sh("git", ["-C", rp, "rev-parse", resolveRef(rp, entry.ref)]) !== rec.commit; }
    catch (e) { behind = "unknown (" + e.message.split("\n")[0] + ")"; }

    const state = edited.length ? "EDITED " : behind === true ? "BEHIND " : behind === false ? "CLEAN  " : "NOREPO ";
    if (state !== "CLEAN  ") bad++;
    console.log(`${state}  ${entry.slug.padEnd(20)} ${rec.commit.slice(0,8)}` +
      (edited.length ? `  ${edited.length} edited: ${edited.slice(0,4).join(", ")}${edited.length>4?" …":""}` : ""));
  }
  return bad;
}

/* ── selftest: prove --check can actually go red ─────────────────────────── */
function selftest() {
  const tmp = path.join("/tmp", `vendor-selftest-${process.pid}`);
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(path.join(tmp, "sub"), { recursive: true });
  fs.writeFileSync(path.join(tmp, "a.txt"), "one");
  fs.writeFileSync(path.join(tmp, "sub", "b.txt"), "two");
  const before = fingerprint(tmp);
  let pass = 0, fail = 0;
  const t = (name, ok) => (ok ? (pass++, console.log("  ok   " + name)) : (fail++, console.log("  FAIL " + name)));

  t("fingerprint sees nested files", Object.keys(before).length === 2 && "sub/b.txt" in before);
  fs.writeFileSync(path.join(tmp, "a.txt"), "one!");
  t("an edited byte changes the fingerprint", fingerprint(tmp)["a.txt"] !== before["a.txt"]);
  fs.writeFileSync(path.join(tmp, "a.txt"), "one");
  t("restoring the byte restores the fingerprint", fingerprint(tmp)["a.txt"] === before["a.txt"]);
  fs.writeFileSync(path.join(tmp, "sub", "c.txt"), "three");
  t("a NEW file is detected too", Object.keys(fingerprint(tmp)).length === 3);
  fs.rmSync(path.join(tmp, "sub", "b.txt"));
  t("a DELETED file is detected too", !("sub/b.txt" in fingerprint(tmp)));

  const e = { drop: ["test/", "docs/"] };
  t("drop matches a directory prefix", dropped("test/x/y.png", e) && dropped("docs/a.md", e));
  t("drop does NOT match a lookalike", !dropped("testament.js", e) && !dropped("src/docs.js", e));
  t("always-drop covers .github", dropped(".github/workflows/x.yml", {}));
  t("always-drop leaves the game alone", !dropped("index.html", {}) && !dropped("assets/a.png", {}));

  const slugs = MANIFEST.map(m => m.slug);
  t("manifest slugs are unique", new Set(slugs).size === slugs.length);
  t("manifest covers 12 repos / 13 cards",
    MANIFEST.length === 12 && MANIFEST.reduce((n,m)=>n+1+(m.also?m.also.length:0),0) === 13);

  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`\nselftest: ${pass} ok, ${fail} failed`);
  return fail;
}

/* ── main ────────────────────────────────────────────────────────────────── */
const argv = process.argv.slice(2);
const cmd = argv.find(a => a.startsWith("--")) || "--list";
const want = argv.filter(a => !a.startsWith("--"));
const entries = want.length ? MANIFEST.filter(m => want.includes(m.slug)) : MANIFEST;
if (want.length && entries.length !== want.length)
  { console.error("unknown slug. known:", MANIFEST.map(m=>m.slug).join(" ")); process.exit(2); }

if (cmd === "--selftest") process.exit(selftest() ? 1 : 0);
if (cmd === "--vendor")   { doVendor(entries); process.exit(0); }
if (cmd === "--check")    process.exit(doCheck(entries) ? 1 : 0);
console.log(MANIFEST.map(m =>
  `${m.slug.padEnd(20)} ${("Stephenuffugus/"+m.repo).padEnd(34)} ${m.ref.padEnd(26)} ${m.build||"legacy"}`).join("\n"));
