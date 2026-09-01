// CONDUIT headless harness — reconstructed 2026-09-01 (the phone zip shipped
// smoke.js but not this file). Extracts the game script from ../index.html and
// runs it in a vm context with no DOM; the game skips its boot path when
// `document` is undefined and exports globalThis.CONDUIT as the test surface.
const fs = require("fs");
const vm = require("vm");
const path = require("path");

function load(){
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const m = html.match(/<script>([\s\S]*)<\/script>/);
  if(!m) throw new Error("no script block found in index.html");
  const ctx = { console, Math, performance: { now: () => Date.now() } };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(m[1], ctx, { filename: "index.html" });
  if(!ctx.CONDUIT) throw new Error("CONDUIT test surface not exported — never remove it");
  return ctx.CONDUIT;
}
module.exports = { load };
