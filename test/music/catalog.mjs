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
t("shared dir: Abduct a Chameleon 3D -> one shelf abduct-a-chameleon", !!shelf("abduct-a-chameleon") && C.shelves.filter(s => s.slug === "abduct-a-chameleon").length === 1);
t("shared dir: games[] deduped to one slug", shelf("abduct-a-chameleon") && shelf("abduct-a-chameleon").games.length === 1);
t("unmapped: Moonlight Sonatas reported with its track count", r1.unmapped.some(u => u.folder === "Moonlight Sonatas" && u.tracks === 2));
t("unmapped: no shelf emitted for it", !C.shelves.some(s => /moonlight/i.test(s.name) || /moonlight/.test(s.slug)));
t("stream-hop: Jimothy folder SKIPPED, no shelf", !shelf("stream-hop") && r1.log.some(l => /SKIP/.test(l) && /Jimothy/.test(l)));
t("family: Card Games -> card-room, kind family, named Card Room", !!shelf("card-room") && shelf("card-room").kind === "family" && shelf("card-room").name === "Card Room");
const cardGames = cat.all.filter(g => g.cat === "card" && (g.dir || g.id)).map(g => g.dir || g.id);
t("family: card-room games[] = every catalog game with cat card (" + new Set(cardGames).size + ")", shelf("card-room") && shelf("card-room").games.length === new Set(cardGames).size && shelf("card-room").games.includes("tarot-run"));
t("family: Board Games -> table-games", !!shelf("table-games") && shelf("table-games").kind === "family");
t("no shelf for a family with no folder (dice)", !shelf("dice-table"));

/* tracks, ids, files */
const dw = shelf("deepwell");
t("order prefix stripped from title: '01 Shaft Song' -> 'Shaft Song'", dw && dw.tracks[0].title === "Shaft Song");
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
