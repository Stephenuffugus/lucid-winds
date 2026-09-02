/* GATE P2 — the generator. Every branch of HANDOFF-MUSIC section 6.6 asserted BY
   NAME (LAW 4), id stability across a rename, the live interlock, the shape
   contract between the fixture probe and the real intake, and that the output
   parses. Exit 1 on any failure. Run:  node test/music/catalog.mjs */
import { readFileSync, existsSync } from "fs";
import { runInNewContext } from "vm";
import { catalog } from "../../scripts/catalog.mjs";

let pass = 0, fail = 0;
const t = (name, ok, detail) => { if (ok) { pass++; console.log("  ok    " + name); } else { fail++; console.log("  FAIL  " + name + (detail ? "   <- " + detail : "")); } };
const done = () => { console.log("\ncatalog gate: " + pass + " ok, " + fail + " failed"); process.exit(fail ? 1 : 0); };

const FIX = "/tmp/music-fixture/intake.json";
t("fixture intake exists (run scripts/music_fixture.mjs)", existsSync(FIX));
if (!existsSync(FIX)) done();

let generate;
try { ({ generate } = await import("../../scripts/music_manifest.mjs")); } catch (e) { t("generator importable", false, e.message); done(); }
t("generator exports generate()", typeof generate === "function");

const intake = JSON.parse(readFileSync(FIX, "utf8"));
const INTAKE_KEYS = ["game","file","ext","title","bytes","mb","seconds","kbps","codec","channels","rate"];  // from scripts/music_intake.mjs
t("shape contract: every fixture row carries every intake key", intake.rows.every(r => INTAKE_KEYS.every(k => k in r)));

const r1 = generate({ intake, existing: null, live: true });
const C = r1.catalog;
const shelf = (slug) => C.shelves.find(s => s.slug === slug);
const cat = catalog();
const known = new Set(cat.all.map(g => g.dir || g.id).filter(Boolean));

/* section 6.6, by name */
t("exact display name: Deepwell -> shelf deepwell", !!shelf("deepwell") && shelf("deepwell").kind === "game" && shelf("deepwell").name === "Deepwell");
t("exact slug: greenhouse-pinball -> shelf named Blobworks", !!shelf("greenhouse-pinball") && shelf("greenhouse-pinball").name === "Blobworks");
t("fuzzy single hit: Flock -> flock-the-world, named Flock the World", !!shelf("flock-the-world") && shelf("flock-the-world").name === "Flock the World");
t("fuzzy is logged as FUZZY", r1.log.some(l => /FUZZY/.test(l) && /Flock/.test(l)));
t("fuzzy hits on two cards sharing one dir count as ONE: Chameleon -> abduct-a-chameleon", r1.log.some(l => /FUZZY/.test(l) && /Chameleon  /.test(l)));
t("two folders to one shelf merge: abduct-a-chameleon has 3 tracks", shelf("abduct-a-chameleon") && shelf("abduct-a-chameleon").tracks.length === 3);
{ const syn = { rows: [{ game: "Bubblenauts", file: "a.mp3", ext: "mp3", title: "a", bytes: 1, mb: 0, seconds: 1, kbps: 64, codec: "mp3", channels: 2, rate: 44100 },
                        { game: "Word", file: "b.mp3", ext: "mp3", title: "b", bytes: 1, mb: 0, seconds: 1, kbps: 64, codec: "mp3", channels: 2, rate: 44100 }] };
  const rr = generate({ intake: syn, existing: null, live: true });
  t("reverse fuzzy: folder Bubblenauts contains the unique name Bubblenaut -> bubblenaut", !!rr.catalog.shelves.find(s => s.slug === "bubblenaut"));
  t("reverse fuzzy needs 5+ chars and uniqueness: folder Word is UNMAPPED, not guessed", rr.unmapped.some(u => u.folder === "Word")); }
{ const syn = { rows: [{ game: "Cosmi-cadets", file: "a.mp3", ext: "mp3", title: "a", bytes: 1, mb: 0, seconds: 1, kbps: 64, codec: "mp3", channels: 2, rate: 44100 },
                        { game: "Quick-fire", file: "b.mp3", ext: "mp3", title: "b", bytes: 1, mb: 0, seconds: 1, kbps: 64, codec: "mp3", channels: 2, rate: 44100 }] };
  const noAl = generate({ intake: syn, existing: null, live: true, aliases: {} });
  t("without an alias a typo folder is UNMAPPED (Cosmi-cadets)", noAl.unmapped.some(u => u.folder === "Cosmi-cadets"));
  const al = generate({ intake: syn, existing: null, live: true, aliases: { cosmicadets: "seed-flutter", quickfire: "action" } });
  t("an explicit alias maps a folder to a game (Cosmi-cadets -> seed-flutter)", !!al.catalog.shelves.find(s => s.slug === "seed-flutter") && al.log.some(l => /alias/.test(l)));
  t("an explicit alias maps a folder to a family (Quick-fire -> action)", !!al.catalog.shelves.find(s => s.kind === "family" && s.games.includes("tomato-man")));
  const bad = generate({ intake: syn, existing: null, live: true, aliases: { cosmicadets: "no-such-slug" } });
  t("an alias to a missing target is UNMAPPED and says why", bad.unmapped.some(u => u.folder === "Cosmi-cadets") && bad.log.some(l => /alias-target-missing/.test(l))); }
{ const syn = { rows: [{ game: "Lucid Winds ", file: "Midnight Greenhouse.mp3", ext: "mp3", title: "Midnight Greenhouse", bytes: 1, mb: 0, seconds: 1, kbps: 64, codec: "mp3", channels: 2, rate: 44100 }] };
  const og = generate({ intake: syn, existing: null, live: true, aliases: { lucidwinds: "originals" } });
  const o = og.catalog.shelves.find(s => s.slug === "originals");
  t("originals target: an app shelf, kind app, EMPTY games[] so no game can ever unlock it", !!o && o.kind === "app" && o.games.length === 0 && o.tracks.some(x => x.id === "m-originals-midnight-greenhouse" && x.file === "midnight-greenhouse.mp3"));
  t("originals is logged as ORIGINALS", og.log.some(l => /^ORIGINALS/.test(l))); }
t("shared dir: Abduct a Chameleon 3D -> one shelf abduct-a-chameleon", !!shelf("abduct-a-chameleon") && C.shelves.filter(s => s.slug === "abduct-a-chameleon").length === 1);
t("shared dir: games[] deduped to one slug", shelf("abduct-a-chameleon") && shelf("abduct-a-chameleon").games.length === 1);
t("unmapped: Moonlight Sonatas reported with its track count", r1.unmapped.some(u => u.folder === "Moonlight Sonatas" && u.tracks === 2));
t("unmapped: no shelf emitted for it", !C.shelves.some(s => /moonlight/i.test(s.name) || /moonlight/.test(s.slug)));
t("stream-hop: Jimothy folder SKIPPED, no shelf", !shelf("stream-hop") && r1.log.some(l => /SKIP/.test(l) && /Jimothy/.test(l)));
t("family: Card Games -> card-table, kind family, named Card Table (Stephen's name)", !!shelf("card-table") && shelf("card-table").kind === "family" && shelf("card-table").name === "Card Table");
const cardGames = cat.all.filter(g => g.cat === "card" && (g.dir || g.id)).map(g => g.dir || g.id);
t("family: card-table games[] = every catalog game with cat card (" + new Set(cardGames).size + ")", shelf("card-table") && shelf("card-table").games.length === new Set(cardGames).size && shelf("card-table").games.includes("tarot-run"));
t("family: Board Games -> board-classics", !!shelf("board-classics") && shelf("board-classics").kind === "family");
t("no shelf for a family with no folder (dice)", !shelf("dice-porch"));

/* nesting, duplicates, loose files (all need the files on disk; the fixture has them) */
t("nested: Deepwell/Boss room/Zone Boss -> deepwell shelf, subfolder kept as a note, sorted last", shelf("deepwell") && shelf("deepwell").tracks.some(x => x.id === "m-deepwell-zone-boss" && x.note === "Boss room") && shelf("deepwell").tracks[shelf("deepwell").tracks.length - 1].id === "m-deepwell-zone-boss");
t("nested: no shelf and no unmapped entry for the subfolder name", !C.shelves.some(s => /boss/i.test(s.name)) && !r1.unmapped.some(u => /boss/i.test(u.folder)));
t("nested is logged as NESTED", r1.log.some(l => /^NESTED/.test(l) && /Boss room/.test(l)));
t("dup: a byte-identical copy inside the same shelf is skipped (one shaft-song id)", shelf("deepwell") && shelf("deepwell").tracks.filter(x => /shaft-song/.test(x.id)).length === 1 && r1.log.some(l => /^DUP/.test(l) && /Shaft Song copy/.test(l)));
t("loose: a root-level file is UNMAPPED as (loose), not under the wrapper name, and reported as byte-identical to flock-the-world/Trap Line", r1.unmapped.some(u => u.folder === "(loose)" && u.dupOf && u.dupOf.some(d => /Weightless Copy/.test(d) && /flock-the-world/.test(d))) && !r1.unmapped.some(u => u.folder === "Music For Games"));
t("loose is logged as LOOSE", r1.log.some(l => /^LOOSE/.test(l) && /Weightless Copy/.test(l)));
/* ladder emitted */
t("catalog carries the ladder with defaults", C.ladder && C.ladder.secsPer === 120 && C.ladder.daysPer === 1 && C.ladder.sessionsBase === 2 && C.ladder.breadthPer === 1);
t("ladder override reaches the catalog; invalid values ignored", (() => { const c2 = generate({ intake, existing: null, live: true, ladder: { secsPer: 60, daysPer: -3, breadthPer: "x" } }).catalog.ladder; return c2.secsPer === 60 && c2.daysPer === 1 && c2.breadthPer === 1; })());

/* tracks, ids, files */
const dw = shelf("deepwell");
t("order prefix stripped from title: '01 Shaft Song' -> 'Shaft Song'", dw && dw.tracks[0].title === "Shaft Song");
{ const syn = { rows: [["Pong-arena", "Neon Rally.mp3"], ["Pong-arena", "Neon Rally (1).mp3"], ["Pong-arena", "Neon Rally (2).mp3"]].map(([g, f]) => ({ game: g, file: f, ext: "mp3", title: f.replace(/\.mp3$/, ""), bytes: 1, mb: 0, seconds: 1, kbps: 64, codec: "mp3", channels: 2, rate: 44100 })) };
  const a = generate({ intake: syn, existing: null, live: true }).catalog.shelves.find(s => s.slug === "pong");
  t("takes: 'Neon Rally (1)' -> 'Neon Rally, take 2', (2) -> take 3, the first keeps the plain name", a && a.tracks.map(x => x.title).join(" | ") === "Neon Rally | Neon Rally, take 2 | Neon Rally, take 3");
  const old = { shelves: [{ slug: "pong", tracks: [{ id: "m-pong-neon-rally-1", from: "Neon Rally (1).mp3" }] }] };
  const b2 = generate({ intake: syn, existing: old, live: true }).catalog.shelves.find(s => s.slug === "pong");
  t("takes: an id minted before the rename is kept (keyed by source file), only the title changes", b2 && b2.tracks.some(x => x.id === "m-pong-neon-rally-1" && x.title === "Neon Rally, take 2")); }
t("first track by file name is the 01 file", dw && dw.tracks[0].id === "m-deepwell-shaft-song");
t("collision: Deep Water twice -> -deep-water and -deep-water-2", dw && dw.tracks.some(x => x.id === "m-deepwell-deep-water") && dw.tracks.some(x => x.id === "m-deepwell-deep-water-2"));
t("web file derives from id, always .mp3 (wav -> clay-bumper.mp3)", shelf("greenhouse-pinball") && shelf("greenhouse-pinball").tracks.some(x => x.file === "clay-bumper.mp3"));
t("seconds carried from intake", dw && dw.tracks.every(x => typeof x.seconds === "number"));
t("apostrophe survives in title, not in id", shelf("flock-the-world") && shelf("flock-the-world").tracks.some(x => x.title === "Warden's March" && x.id === "m-flock-the-world-wardens-march"));
t("every games[] slug exists in catalog()", C.shelves.every(s => s.games.every(g => known.has(g))));
t("no dash in any shelf name or title (LAW 13)", C.shelves.every(s => !/[-–—]/.test(s.name) && s.tracks.every(x => !/[–—]/.test(x.title))));
t("base is /music/v1/", C.base === "/music/v1/");

/* the interlock */
t("live:true only via flag", C.live === true);
t("live:false by default", generate({ intake, existing: null }).catalog.live === false);

/* stability */
t("version is deterministic for the same input", generate({ intake, existing: null, live: true }).catalog.version === C.version);
const renamed = JSON.parse(JSON.stringify(intake));
renamed.rows.find(r => r.file === "Trap Line.mp3").title = "Trap Lines";
const r2 = generate({ intake: renamed, existing: C, live: true });
t("id stable across a title rename (keyed by shelf + source file)", r2.catalog.shelves.find(s => s.slug === "flock-the-world").tracks.some(x => x.id === "m-flock-the-world-trap-line" && x.title === "Trap Lines"));
t("version changes when content changes", r2.catalog.version !== C.version);
const dropped = JSON.parse(JSON.stringify(intake)); dropped.rows = dropped.rows.filter(r => r.file !== "Wave Ten.mp3");
t("a removed file leaves the catalog (ledger keeps it, module never deletes)", !generate({ intake: dropped, existing: C, live: true }).catalog.shelves.find(s => s.slug === "flock-the-world").tracks.some(x => x.id === "m-flock-the-world-wave-ten"));

/* the emitted source */
const win = {}; runInNewContext(r1.source, { window: win });
t("emitted source parses and defines window.LW_MUSIC_CATALOG", win.LW_MUSIC_CATALOG && win.LW_MUSIC_CATALOG.version === C.version);
t("emitted source is ES5 (no const/let/arrow)", !/\b(const|let)\b|=>/.test(r1.source));

done();
