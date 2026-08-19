/* THE ONE PLACE THAT KNOWS HOW BIG THE CATALOG IS.
     import { catalog } from "./catalog.mjs"
     node scripts/catalog.mjs          prints the counts

   ⛔⛔ WHY THIS EXISTS. Four separate scripts each had their own regex for
   reading the portal's catalog, and every one of them was wrong, differently.
   They reported 64, 66 and 67 native games and 183 and 187 totals, all from the
   same file on the same day. The cause is one line:

       native field-counts seen: 4, 5, 7

   The GAMES array does not have a fixed shape. Rows carry 4, 5 or 7 fields, and
   every regex written for it hardcoded `["a","b","c","d"]`, so the closing `]`
   failed to match on the longer rows and they vanished silently. A regex that
   misses rows does not error; it just returns a smaller number, and a smaller
   number looks exactly like a correct one.

   ⭐ THE RULE: never regex a data structure you can parse. The arrays are plain
   JavaScript literals, so bracket-match them out of the file and let the engine
   read them. Then the field count cannot matter, because nothing is assuming it.

   TRUE NUMBERS as of 2026-08-16: 119 satellite cards + 67 native = 186 carded,
   of which 22 are dev gated and 2 are marked "soon", so 162 are openable.
*/
import { readFileSync } from "fs";
import { runInNewContext } from "vm";

const PORTAL = "portal/index.html";

/* Pull an array literal out of the source by matching brackets, skipping over
   anything inside a string so a `]` in a description cannot end it early. */
/* ⛔ COMMENTS MUST BE SKIPPED TOO, not just strings. On 2026-08-18 a comment
   inside the FEATURED array was edited so it contained ONE apostrophe
   ("the arcade's"), and because this walker only knew about strings it treated
   that apostrophe as the start of a string literal and swallowed the rest of the
   file. The whole catalog then failed to parse, from a comment. Same lesson as
   the dash checker that scanned JavaScript: strip comments before analysing
   source. */
function grabArray(src, decl) {
  const i = src.indexOf(decl);
  if (i < 0) throw new Error("catalog: could not find `" + decl + "` in " + PORTAL);
  const start = src.indexOf("[", i);
  let depth = 0, inStr = null, k = start;
  for (; k < src.length; k++) {
    const c = src[k], prev = src[k - 1], next = src[k + 1];
    if (inStr) { if (c === inStr && prev !== "\\") inStr = null; continue; }
    if (c === "/" && next === "*") { const e = src.indexOf("*/", k + 2); k = e < 0 ? src.length : e + 1; continue; }
    if (c === "/" && next === "/") { const e = src.indexOf("\n", k + 2); k = e < 0 ? src.length : e; continue; }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (c === "[") depth++;
    else if (c === "]") { depth--; if (depth === 0) { k++; break; } }
  }
  if (depth !== 0) throw new Error("catalog: unbalanced brackets after `" + decl + "`");
  return runInNewContext("(" + src.slice(start, k) + ")");
}

export function catalog(file = PORTAL) {
  const src = readFileSync(file, "utf8");
  const featured = grabArray(src, "var FEATURED =");   /* satellite cards, objects */
  const games = grabArray(src, "var GAMES =");         /* native /play/, arrays of 4-7 fields */

  const sats = featured.map(g => ({
    name: g.nm, url: g.url || "", cat: g.cat || "", kind: "satellite",
    gated: !!g.beta,
    dir: (String(g.url || "").match(/^\/satellites\/([a-z0-9-]+)\//) || [])[1] || null
  }));
  /* ⛔ index 4 is the "soon" flag on the longer rows. Read it by index, never by
     assuming the row ended at index 3. */
  const nat = games.map(g => ({
    name: g[1], url: "/play/" + g[0] + ".html", cat: g[2], kind: "native",
    gated: g[4] === "soon", id: g[0]
  }));

  const all = sats.concat(nat);
  return {
    all, sats, nat,
    total: all.length,
    gated: all.filter(g => g.gated).length,
    /* the only number that belongs in player-facing copy */
    open: all.filter(g => !g.gated).length
  };
}

if (import.meta.url === "file://" + process.argv[1] && !process.argv.includes("--selftest")) {
  const c = catalog();
  console.log("satellite cards      " + c.sats.length);
  console.log("native /play/ games  " + c.nat.length);
  console.log("TOTAL CARDED         " + c.total);
  console.log("  dev gated or soon  " + c.gated);
  console.log("A VISITOR CAN OPEN   " + c.open + "   <- the number for player-facing copy");
}

/* ---- selftest: `node scripts/catalog.mjs --selftest` ---------------------- */
if (process.argv.includes("--selftest")) {
  let pass = 0, fail = 0;
  const t = (n, ok) => ok ? (pass++, console.log("  ok   " + n)) : (fail++, console.log("  FAIL " + n));
  const { writeFileSync, mkdtempSync } = await import("fs");
  const { tmpdir } = await import("os");
  const { join } = await import("path");
  const dir = mkdtempSync(join(tmpdir(), "catalog-selftest-"));
  const write = (name, body) => { const f = join(dir, name); writeFileSync(f, body); return f; };

  const base = (extra) => `var FEATURED = [\n${extra}\n  {nm:"A", url:"/satellites/a/"},\n  {nm:"B", url:"/satellites/b/", beta:true}\n];\nvar GAMES = [\n  ["x","X","🎲","p"],\n  ["y","Y","🎲","p","soon"],\n  ["z","Z","🎲","p",null,1,2]\n];\n`;

  let c = catalog(write("plain.html", base("")));
  t("reads both arrays", c.sats.length === 2 && c.nat.length === 3);
  /* ⛔ the 2026-08-18 break: ONE apostrophe inside a block comment */
  c = catalog(write("apos.html", base("  /* the arcade's own note, one apostrophe */")));
  t("a lone apostrophe in a BLOCK comment does not eat the file", c.sats.length === 2);
  c = catalog(write("line.html", base("  // don't let a line comment do it either")));
  t("a lone apostrophe in a LINE comment does not eat the file", c.sats.length === 2);
  c = catalog(write("brack.html", base("  /* a stray ] and [ in a comment */")));
  t("brackets inside a comment do not move the depth", c.sats.length === 2);
  c = catalog(write("str.html", `var FEATURED = [\n  {nm:"A ] bracket", url:"/satellites/a/"}\n];\nvar GAMES = [];\n`));
  t("a bracket inside a STRING still does not end the array", c.sats.length === 1);
  /* the original reason this file exists: rows of 4, 5 and 7 fields */
  t("counts native rows of 4, 5 and 7 fields alike", catalog(write("f.html", base(""))).nat.length === 3);

  console.log(`\nselftest: ${pass} ok, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
