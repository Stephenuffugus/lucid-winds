/* MUSIC FIXTURE — a fake music drop in the exact shape of the real one, so the
   generator, module and gates can be built and proven before Stephen's zip lands.
     node scripts/music_fixture.mjs            writes /tmp/music-fixture/ and intake.json

   Shape mirrors what scripts/music_intake.mjs produces from a real drop:
   <root>/<game folder>/<songs>. The folder names are chosen to exercise EVERY
   branch of the folder-to-shelf resolver in HANDOFF-MUSIC.md section 6.6:
     exact display name · exact slug · FUZZY (single contains hit) · a shared dir
     · a deliberate UNMAPPED · the stream-hop SKIP · two family folders
   plus the junk a Mac zip carries (__MACOSX, .DS_Store), names with spaces and
   an apostrophe, one true title collision, one high-bitrate mp3 and one wav so
   the web tier's transcode branch has something to do.

   ⛔ The probe below MIRRORS scripts/music_intake.mjs on purpose rather than
   importing it: that script runs its zip-moving logic at import time and this
   build may not edit pre-existing files (HANDOFF-MUSIC LAW 9/10). The P2 gate
   asserts both outputs share one shape, so they cannot drift silently.
   ⛔ Never writes under /workspaces. Never touches docs/music-intake.json. */
import { mkdirSync, writeFileSync, rmSync, existsSync, readdirSync, statSync } from "fs";
import { execSync } from "child_process";
import { join, basename, extname } from "path";

const ROOT = "/tmp/music-fixture";
const TREE = join(ROOT, "Music For Games");
const sh = (c) => execSync(c, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

/* folder name -> [track file names]. See header for what each folder tests. */
const FOLDERS = {
  "Deepwell":                 ["01 Shaft Song.mp3", "Deep Water.mp3", "Deep  Water.mp3", "The Long Climb.mp3", "Echo Chamber.mp3"],   // exact display; "Deep Water" x2 = id collision; 5 tracks so rung 4 exists
  "greenhouse-pinball":       ["Blob Bounce.mp3", "Clay Bumper.wav"],                                            // exact SLUG (display is Blobworks); wav -> transcode
  "Flock":                    ["Warden's March.mp3", "Trap Line.mp3", "Wave Ten.mp3"],                          // FUZZY: single contains hit on "Flock the World" (NB "Siege" would be an exact SLUG hit)
  "Chameleon":                ["Color Shift.mp3"],                                                            // FUZZY hits two cards that share ONE dir -> one hit; merges into the 3D folder's shelf
  "Abduct a Chameleon 3D":    ["Beam Up.mp3", "Tractor Hum.mp3"],                                               // shares a dir with "Abduct a Chameleon"
  "Moonlight Sonatas":        ["Nocturne One.mp3", "Nocturne Two.mp3"],                                          // UNMAPPED on purpose
  "Jimothy":                  ["Crosswalk Redux.mp3"],                                                           // maps to stream-hop -> SKIPPED
  "Card Games":               ["Shuffle Up.mp3", "Dealer's Choice.mp3", "Last Trick.mp3"],                      // family: card
  "Board Games":              ["Corner Square.mp3", "Long Game.mp3"],                                            // family: board
  "Tarot Run":                ["Major Arcana.mp3", "Cups.mp3"],                                                 // a CARD game with its own shelf: unlocks both it and Card Room
};
const HIGH_BITRATE = "The Long Climb.mp3";   // 192k so the web tier must transcode it
/* after the tree is written: one NESTED subfolder inside a game folder, one byte-identical copy inside the same
   shelf, and one loose byte-identical copy at the export root (what a Drive export does). */
const AFTER = [
  ["copy", "Deepwell/01 Shaft Song.mp3", "Deepwell/Shaft Song copy.mp3"],
  ["copy", "Flock/Trap Line.mp3", "Weightless Copy.mp3"],
  ["nested", "Deepwell/Boss room/Zone Boss.mp3"],   // "Zone" so it sorts LAST on the shelf and leaves every index assertion in the module gate alone
];

rmSync(ROOT, { recursive: true, force: true });
mkdirSync(TREE, { recursive: true });
mkdirSync(join(TREE, "__MACOSX", "Deepwell"), { recursive: true });
writeFileSync(join(TREE, ".DS_Store"), "junk");
writeFileSync(join(TREE, "__MACOSX", "Deepwell", "._01 Shaft Song.mp3"), "junk");

let n = 0;
for (const [folder, files] of Object.entries(FOLDERS)) {
  const dir = join(TREE, folder); mkdirSync(dir, { recursive: true });
  for (const f of files) {
    const out = join(dir, f);
    const br = (f === HIGH_BITRATE) ? "192k" : "64k";
    const secs = (f === HIGH_BITRATE) ? 2 : 1;
    const codec = /\.wav$/i.test(f) ? "-c:a pcm_s16le" : `-c:a libmp3lame -b:a ${br}`;
    /* a DISTINCT tone per file (frequency from the running index), or every fixture file is byte-identical silence and
       the generator's content-hash dedupe rightly collapses each shelf to one track. The two deliberate copies below
       are the only identical pairs. */
    sh(`ffmpeg -v error -y -f lavfi -i "sine=frequency=${220 + 37 * n}:sample_rate=44100" -ac 2 -t ${secs} ${codec} "${out}"`);
    n++;
  }
}

for (const a of AFTER) {
  if (a[0] === "copy") { mkdirSync(join(TREE, a[2], ".."), { recursive: true }); sh(`cp "${join(TREE, a[1])}" "${join(TREE, a[2])}"`); n++; }
  else { mkdirSync(join(TREE, a[1], ".."), { recursive: true }); sh(`ffmpeg -v error -y -f lavfi -i "sine=frequency=${220 + 37 * n}:sample_rate=44100" -ac 2 -t 1 -c:a libmp3lame -b:a 64k "${join(TREE, a[1])}"`); n++; }
}

/* ---- probe: mirrors scripts/music_intake.mjs steps 2-3 ---------------------- */
const AUD = /\.(mp3|wav|flac|m4a|aac|ogg|opus|webm)$/i;
function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.name === "__MACOSX") continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (AUD.test(e.name)) out.push(p);
  }
  return out;
}
const rootDepth = ROOT.split("/").length;
const rows = [];
for (const f of walk(ROOT)) {
  const rel = f.split("/").slice(rootDepth);
  const game = rel.length > 1 ? rel[rel.length - 2] : "(loose)";
  const size = statSync(f).size;
  const info = sh(`ffprobe -v error -show_entries format=duration,bit_rate:stream=codec_name,channels,sample_rate -of default=nw=1 "${f}"`);
  const get = (k) => (info.match(new RegExp("^" + k + "=(.*)$", "m")) || [])[1] || "";
  const dur = parseFloat(get("duration")) || 0;
  rows.push({
    game, file: basename(f), ext: extname(f).slice(1).toLowerCase(),
    title: basename(f, extname(f)).replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim(),
    bytes: size, mb: +(size / 1048576).toFixed(1), seconds: Math.round(dur),
    kbps: Math.round((parseInt(get("bit_rate")) || 0) / 1000),
    codec: get("codec_name"), channels: +get("channels") || 0, rate: +get("sample_rate") || 0,
    path: f,   // extra vs intake: the web tier needs the source path. intake rows get it from workDir + game + file.
  });
}
const games = new Set(rows.map(r => r.game));
writeFileSync(join(ROOT, "intake.json"), JSON.stringify({ workDir: ROOT, games: games.size, tracks: rows.length, rows }, null, 1));

console.log("fixture: " + games.size + " folders, " + rows.length + " tracks (" + n + " written), junk dirs skipped: " + (rows.length === n ? "yes" : "NO"));
for (const g of [...games]) console.log("  " + String(rows.filter(r => r.game === g).length).padStart(2) + "  " + g);
console.log("wrote " + join(ROOT, "intake.json"));
