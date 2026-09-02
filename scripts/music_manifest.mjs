/* MUSIC MANIFEST GENERATOR — intake JSON -> music-catalog.js
     node scripts/music_manifest.mjs                       real: docs/music-intake.json -> music-catalog.js (live:false)
     node scripts/music_manifest.mjs --intake <json> --out <file> [--existing <file>] [--unmapped <md>] [--live]

   The catalog is GENERATED, never hand written (HANDOFF-MUSIC section 6.4).
   Folder names resolve against the catalog and REFUSE rather than guess
   (section 6.6); unmapped folders go to a report for Stephen. Ids are stable
   forever: a track already in the existing catalog keeps its id, keyed by
   (shelf, source file name), so a title change never orphans a player's unlock.
   Family shelves are the catalog's own `cat` field, via music-families.json. */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { createHash } from "crypto";
import { runInNewContext } from "vm";
import { fileURLToPath } from "url";
import { basename, dirname, join } from "path";
import { catalog } from "./catalog.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const FAMILIES_PATH = join(HERE, "..", "music-families.json");
const ALIASES_PATH  = join(HERE, "..", "music-folder-aliases.json");
const LADDER_PATH   = join(HERE, "..", "music-ladder.json");
export const LADDER_DEFAULTS = { secsPer: 120, daysPer: 1, sessionsBase: 2, breadthPer: 1 };

const norm    = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const slugify = (s) => String(s || "").toLowerCase().replace(/['’"“”]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");   // "Warden's March" -> wardens-march
const cleanTitle = (t) => String(t || "").replace(/^\d{1,2}[ ._-]+/, "").replace(/\s+/g, " ").trim();   // "01 Shaft Song" -> "Shaft Song"

/* ---- source files on disk, OPTIONAL. The intake JSON cannot see two things the generator needs: that a file sits in a
   SUBFOLDER of a game folder (Pit bike rally/Menu and shop song/…), and that two files are byte-identical (Drive
   exports duplicate loose files at the root). When the files are on disk, the generator reads the real path and
   hashes the content; when they are not (regenerating elsewhere), it falls back to the JSON alone. ---- */
const AUD = /\.(mp3|wav|flac|m4a|aac|ogg|opus|webm)$/i;
function walk(dir, out = []) { for (const e of readdirSync(dir, { withFileTypes: true })) { if (e.name.startsWith(".") || e.name === "__MACOSX") continue; const p = join(dir, e.name); if (e.isDirectory()) walk(p, out); else if (AUD.test(e.name)) out.push(p); } return out; }
let diskCache = null;
export function sourceFor(row, workDir) {
  if (row.path && existsSync(row.path)) return row.path;
  if (!workDir || !existsSync(workDir)) return null;
  if (!diskCache || diskCache.dir !== workDir) diskCache = { dir: workDir, files: walk(workDir) };
  const hits = diskCache.files.filter(p => basename(p) === row.file && basename(dirname(p)) === row.game);
  return hits.length === 1 ? hits[0] : null;
}
/* the folder that names the shelf is the first one under the drop's root wrapper; deeper folders are a note */
function placeOnDisk(src, workDir, wrapper) {
  const rel = src.slice(workDir.length).replace(/^\/+/, "").split("/");
  if (wrapper && rel[0] === wrapper) rel.shift();
  if (rel.length < 2) return { game: "(loose)", note: "" };
  return { game: rel[0], note: rel.slice(1, -1).join(" / ") };
}

/* every ladder that reaches the catalog goes through this, whether it came from the file or from a caller */
export function sanitizeLadder(raw) {
  const out = { ...LADDER_DEFAULTS };
  if (raw && typeof raw === "object") for (const k of Object.keys(LADDER_DEFAULTS)) if (typeof raw[k] === "number" && isFinite(raw[k]) && raw[k] >= 0) out[k] = raw[k];
  return out;
}
export function loadLadder(path = LADDER_PATH) {
  if (!existsSync(path)) return sanitizeLadder(null);
  return sanitizeLadder(JSON.parse(readFileSync(path, "utf8")));
}

export function loadAliases(path = ALIASES_PATH) {
  if (!existsSync(path)) return {};
  const raw = JSON.parse(readFileSync(path, "utf8")), out = {};
  for (const k of Object.keys(raw)) if (k[0] !== "_") out[norm(k)] = raw[k];
  return out;
}

export function loadFamilies(path = FAMILIES_PATH) {
  const raw = JSON.parse(readFileSync(path, "utf8"));
  const out = {}; for (const k of Object.keys(raw)) if (k[0] !== "_") out[k] = raw[k];
  return out;
}

/* Resolve one folder name. Returns {kind:'game', card} | {kind:'family', key} | {kind:'none'} plus how.
   Exported so scripts/music_web_tier.mjs can map a track back to its source folder the same way. */
export function resolve(folder, cards, families, aliases = {}) {
  const nf = norm(folder);
  if (aliases[nf]) {                                        // an explicit, human-confirmed override wins
    const to = aliases[nf];
    if (families[to]) return { kind: "family", key: to, how: "alias" };
    const c = cards.find(c => c.key === to); if (c) return { kind: "game", card: c, how: "alias" };
    return { kind: "none", how: "alias-target-missing:" + to };
  }
  for (const c of cards) if (nf === norm(c.name) || nf === norm(c.dir) || nf === norm(c.id)) return { kind: "game", card: c, how: nf === norm(c.name) ? "exact" : "slug" };
  for (const key of Object.keys(families)) if (families[key].aliases.some(a => norm(a) === nf) || norm(families[key].name) === nf) return { kind: "family", key, how: "family" };
  if (nf.length >= 5) {
    const hits = cards.filter(c => norm(c.name).includes(nf));
    const keys = [...new Set(hits.map(h => h.key))];          // two cards on one dir (the Chameleons) are ONE hit
    if (keys.length === 1) return { kind: "game", card: hits[0], how: "FUZZY" };
    /* the reverse: the FOLDER contains a unique game name ("Bubblenauts" holds "Bubblenaut"). Same length floor, same uniqueness. */
    const rev = cards.filter(c => norm(c.name).length >= 5 && nf.includes(norm(c.name)));
    const rkeys = [...new Set(rev.map(h => h.key))];
    if (rkeys.length === 1) return { kind: "game", card: rev[0], how: "FUZZY" };
  }
  return { kind: "none" };
}

export function generate({ intake, existing = null, live = false, families = loadFamilies(), cat = catalog(), aliases = loadAliases(), ladder = loadLadder() }) {
  const log = [], unmapped = [];
  const cards = cat.all.filter(g => g.dir || g.id).map(g => ({ name: g.name, dir: g.dir, id: g.id, cat: g.cat, key: g.dir || g.id }));

  /* previous ids, keyed by shelf slug then source file name */
  const prev = {};
  if (existing && existing.shelves) for (const s of existing.shelves) { prev[s.slug] = {}; for (const t of s.tracks) prev[s.slug][t.from] = t.id; }

  /* see the files on disk if we can: real placement (nesting) and content hash (duplicates) */
  const rows = intake.rows.map(r => ({ ...r }));
  const srcs = rows.map(r => sourceFor(r, intake.workDir));
  let wrapper = null;
  if (intake.workDir && srcs.every(Boolean)) {                              // a single top-level folder holding everything is the export's wrapper
    const tops = new Set(srcs.map(p => p.slice(intake.workDir.length).replace(/^\/+/, "").split("/")[0]));
    if (tops.size === 1) wrapper = [...tops][0];
  }
  rows.forEach((r, i) => {
    if (!srcs[i]) return;
    r.sha = createHash("sha256").update(readFileSync(srcs[i])).digest("hex");
    if (!intake.workDir) return;
    const at = placeOnDisk(srcs[i], intake.workDir, wrapper);
    if (at.game !== r.game) { log.push((at.game === "(loose)" ? "LOOSE     " : "NESTED    ") + r.game + "/" + r.file + "  -> " + at.game + (at.note ? "  (note: " + at.note + ")" : "")); r.game = at.game; }
    if (at.note) r.note = at.note;
  });
  /* group by folder, folders in sorted order for determinism */
  const byFolder = {};
  for (const r of rows) (byFolder[r.game] ||= []).push(r);

  const shelves = {};   // slug -> shelf
  for (const folder of Object.keys(byFolder).sort()) {
    const rows = byFolder[folder];
    const res = resolve(folder, cards, families, aliases);
    if (res.kind === "none") { unmapped.push({ folder, tracks: rows.length, files: rows.map(r => ({ file: r.file, sha: r.sha })) }); log.push("UNMAPPED  " + folder + "  (" + rows.length + " tracks)" + (res.how ? "  " + res.how : "")); continue; }
    let slug, name, kind, games;
    if (res.kind === "game") {
      if (res.card.key === "stream-hop") { log.push("SKIP      " + folder + "  -> stream-hop: Jimothy keeps its own bridge"); continue; }
      slug = res.card.key; name = res.card.name; kind = "game"; games = [res.card.key];
      log.push("MAP       " + folder + "  -> " + slug + "  (" + res.how + ")");
    } else {
      const fam = families[res.key];
      slug = slugify(fam.name); name = fam.name; kind = "family";
      games = [...new Set(cards.filter(c => c.cat === res.key).map(c => c.key))].sort();
      log.push("FAMILY    " + folder + "  -> " + slug + "  (" + games.length + " games)");
    }
    const shelf = shelves[slug] ||= { slug, name, kind, games: [], tracks: [], _rows: [] };
    for (const g of games) if (!shelf.games.includes(g)) shelf.games.push(g);
    shelf._rows.push(...rows);
  }

  /* tracks: file-name order; reused ids first, then new ids allocated around them */
  for (const shelf of Object.values(shelves)) {
    const seenSha = new Map();
    const rows = shelf._rows.sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : 0)).filter(r => {
      if (!r.sha) return true;
      if (seenSha.has(r.sha)) { log.push("DUP       " + r.game + "/" + r.file + "  ==  " + seenSha.get(r.sha) + "  (skipped)"); return false; }
      seenSha.set(r.sha, r.game + "/" + r.file); return true;
    });
    const used = new Set(), pre = "m-" + shelf.slug + "-";
    const ids = rows.map(r => { const id = prev[shelf.slug] && prev[shelf.slug][r.file]; if (id) used.add(id); return id || null; });
    rows.forEach((r, i) => {
      if (ids[i]) return;
      const base = pre + (slugify(cleanTitle(r.title)) || "track");
      let id = base, n = 2; while (used.has(id)) id = base + "-" + (n++);
      used.add(id); ids[i] = id;
    });
    shelf.tracks = rows.map((r, i) => ({ id: ids[i], title: cleanTitle(r.title), file: ids[i].slice(pre.length) + ".mp3", seconds: r.seconds | 0, from: r.file, ...(r.note ? { note: r.note } : {}) }));
    shelf._sha = seenSha;
    delete shelf._rows;
  }

  const shelved = new Map(); for (const sh of Object.values(shelves)) { for (const [sha, where] of sh._sha) shelved.set(sha, sh.slug + ": " + where); delete sh._sha; }
  for (const u of unmapped) { u.dupOf = u.files.filter(f => f.sha && shelved.has(f.sha)).map(f => f.file + " == " + shelved.get(f.sha)); delete u.files; if (u.dupOf.length) log.push("          " + u.folder + ": " + u.dupOf.join("; ")); }
  const list = Object.values(shelves).sort((a, b) => (a.slug < b.slug ? -1 : 1));
  const version = createHash("sha256").update(JSON.stringify(list)).digest("hex").slice(0, 12);
  const out = { version, base: "/music/v1/", live: !!live, ladder: sanitizeLadder(ladder), shelves: list };
  const source = "/* GENERATED by scripts/music_manifest.mjs from the music intake. NEVER hand edit.\n" +
                 "   live:false means the module does nothing; Fable flips it after scripts/music_verify.mjs\n" +
                 "   passes against the host (HANDOFF-MUSIC section 6.4, 7). */\n" +
                 "window.LW_MUSIC_CATALOG = " + JSON.stringify(out, null, 1) + ";\n";
  return { catalog: out, source, unmapped, log };
}

/* shelf slug a folder lands on, or null. Used by the web tier to disambiguate same-named files in two folders. */
export function shelfSlugFor(folder, families = loadFamilies(), cat = catalog(), aliases = loadAliases()) {
  const cards = cat.all.filter(g => g.dir || g.id).map(g => ({ name: g.name, dir: g.dir, id: g.id, cat: g.cat, key: g.dir || g.id }));
  const r = resolve(folder, cards, families, aliases);
  if (r.kind === "game") return r.card.key === "stream-hop" ? null : r.card.key;
  if (r.kind === "family") return slugify(families[r.key].name);
  return null;
}

export function readExisting(path) {
  if (!existsSync(path)) return null;
  try { const w = {}; runInNewContext(readFileSync(path, "utf8"), { window: w }); return w.LW_MUSIC_CATALOG || null; } catch { return null; }
}

/* ---- CLI ------------------------------------------------------------------ */
if (process.argv[1] && import.meta.url === "file://" + process.argv[1]) {
  const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
  const intakePath = arg("--intake", "docs/music-intake.json");
  const outPath    = arg("--out", "music-catalog.js");
  const existPath  = arg("--existing", outPath);
  const unmapPath  = arg("--unmapped", "docs/music-unmapped.md");
  const live       = process.argv.includes("--live");
  if (!existsSync(intakePath)) { console.error("no intake at " + intakePath + ". Run scripts/music_intake.mjs (or music_fixture.mjs) first."); process.exit(1); }
  const r = generate({ intake: JSON.parse(readFileSync(intakePath, "utf8")), existing: readExisting(existPath), live });
  writeFileSync(outPath, r.source);
  writeFileSync(unmapPath, "# Unmapped music folders\n\nThese folder names did not match any game or family, so NO shelf was made for them.\nRename the folder to the game's exact arcade name (or a family name like `Card Games`) and re-run.\n\n| Folder | Tracks |\n|---|---|\n" + r.unmapped.map(u => "| " + u.folder + " | " + u.tracks + (u.dupOf && u.dupOf.length ? " (byte-identical to " + u.dupOf.join("; ") + ")" : "") + " |").join("\n") + "\n");
  for (const l of r.log) console.log(l);
  console.log("\nshelves: " + r.catalog.shelves.length + "  tracks: " + r.catalog.shelves.reduce((a, s) => a + s.tracks.length, 0) + "  unmapped: " + r.unmapped.length + "  version: " + r.catalog.version + "  live: " + r.catalog.live);
  if (live) console.log("⚠️  live:true written. Only do this after music_verify.mjs is green against the host.");
  console.log("wrote " + outPath + "  and  " + unmapPath);
}
