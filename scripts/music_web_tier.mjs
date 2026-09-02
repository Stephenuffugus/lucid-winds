/* MUSIC WEB TIER — the folder Stephen uploads to the host.
     node scripts/music_web_tier.mjs --intake <intake.json> --catalog <music-catalog.js> --to /tmp/music-web

   For every track in the catalog: find its source in the intake, transcode to
   128k mp3 if the source is over 160k or not mp3, else copy; write it as
   <to>/music/v1/<shelf>/<file> (the exact path the catalog's src points at);
   then SHA256SUMS.txt beside them. Idempotent: an output newer than its source
   is skipped. Never writes under /workspaces (HANDOFF-MUSIC section 7.3). */
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, copyFileSync, readdirSync, rmSync } from "fs";
import { execSync } from "child_process";
import { join, basename, dirname } from "path";
import { createHash } from "crypto";
import { readExisting, shelfSlugFor } from "./music_manifest.mjs";

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const INTAKE = arg("--intake", "docs/music-intake.json"), CATALOG = arg("--catalog", "music-catalog.js"), TO = arg("--to", "/tmp/music-web");
if (TO.startsWith("/workspaces")) { console.error("refusing to write the web tier under /workspaces"); process.exit(1); }
const sh = (c) => execSync(c, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

const intake = JSON.parse(readFileSync(INTAKE, "utf8"));
const cat = readExisting(CATALOG);
if (!cat) { console.error("could not read a catalog from " + CATALOG); process.exit(1); }

/* folder -> shelf slug, once */
const folderShelf = {}; for (const r of intake.rows) if (!(r.game in folderShelf)) folderShelf[r.game] = shelfSlugFor(r.game);

/* locate a source file on disk: fixture rows carry `path`; real intake rows are found under workDir as <game>/<file> */
function walk(dir, out = []) { for (const e of readdirSync(dir, { withFileTypes: true })) { if (e.name.startsWith(".") || e.name === "__MACOSX") continue; const p = join(dir, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; }
let disk = null;
function sourceFor(row) {
  if (row.path && existsSync(row.path)) return row.path;
  if (!disk) disk = walk(intake.workDir);
  const hits = disk.filter(p => basename(p) === row.file && basename(dirname(p)) === row.game);
  if (hits.length !== 1) throw new Error("expected exactly one source for " + row.game + "/" + row.file + ", found " + hits.length);
  return hits[0];
}

let made = 0, copied = 0, skipped = 0, bytes = 0; const sums = [];
for (const shelf of cat.shelves) {
  const outDir = join(TO, "music", "v1", shelf.slug); mkdirSync(outDir, { recursive: true });
  for (const t of shelf.tracks) {
    const rows = intake.rows.filter(r => r.file === t.from && folderShelf[r.game] === shelf.slug);
    if (rows.length !== 1) throw new Error("expected exactly one intake row for " + shelf.slug + "/" + t.from + ", found " + rows.length);
    const src = sourceFor(rows[0]), out = join(outDir, t.file);
    const fresh = existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs;
    if (fresh) skipped++;
    else if (rows[0].ext === "mp3" && rows[0].kbps <= 160) { copyFileSync(src, out); copied++; }
    else { sh(`ffmpeg -v error -y -i "${src}" -vn -c:a libmp3lame -b:a 128k -ar 44100 -metadata title="${t.title.replace(/"/g, "")}" -metadata artist="Stephen" "${out}"`); made++; }
    const size = statSync(out).size; bytes += size;
    sums.push(createHash("sha256").update(readFileSync(out)).digest("hex") + "  " + shelf.slug + "/" + t.file);
  }
}
/* PRUNE: the output mirrors the catalog exactly. Anything under music/v1 that the catalog does not name is removed,
   so a stale run (a fixture into the same folder, a renamed shelf, a dropped track) can never ride up in the upload. */
const want = new Set(sums.map(l => l.split("  ")[1]));
let pruned = 0;
const V1 = join(TO, "music", "v1");
for (const d of readdirSync(V1, { withFileTypes: true })) {
  if (!d.isDirectory()) { if (d.name !== "SHA256SUMS.txt") { rmSync(join(V1, d.name)); pruned++; } continue; }
  for (const f of readdirSync(join(V1, d.name))) if (!want.has(d.name + "/" + f)) { rmSync(join(V1, d.name, f)); pruned++; }
  if (!readdirSync(join(V1, d.name)).length) { rmSync(join(V1, d.name), { recursive: true }); pruned++; }
}
writeFileSync(join(TO, "music", "v1", "SHA256SUMS.txt"), sums.join("\n") + "\n");
console.log("web tier at " + join(TO, "music", "v1") + ": " + sums.length + " files, " + (bytes / 1048576).toFixed(1) + " MB   (transcoded " + made + ", copied " + copied + ", skipped " + skipped + ", pruned " + pruned + " stale)");
