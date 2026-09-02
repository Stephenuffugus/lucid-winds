// CONDUIT headless harness — reconstructed 2026-09-01 (the phone zip shipped
// smoke.js but not this file). Extracts the game script from ../index.html and
// runs it in a vm context with no DOM; the game skips its boot path when
// `document` is undefined and exports globalThis.CONDUIT as the test surface.
const fs = require("fs");
const vm = require("vm");
const path = require("path");

function load(){
  // CONDUIT_HTML lets test/mutants.js point the suite at a mutated scratch copy
  // without ever writing to the real game file.
  const src = process.env.CONDUIT_HTML || path.join(__dirname, "..", "index.html");
  const html = fs.readFileSync(src, "utf8");
  // FIRST inline block only (non-greedy): the carding pass appended a second inline
  // <script> after the game (exit + feedback boot), and a greedy match swallowed the
  // </script><script> between them, so the whole suite died on a SyntaxError.
  const m = html.match(/<script>([\s\S]*?)<\/script>/);
  if(!m) throw new Error("no script block found in index.html");
  const ctx = { console, Math, performance: { now: () => Date.now() } };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(m[1], ctx, { filename: "index.html" });
  if(!ctx.CONDUIT) throw new Error("CONDUIT test surface not exported — never remove it");
  return ctx.CONDUIT;
}
module.exports = { load };
