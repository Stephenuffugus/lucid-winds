/* Static shell assertions for Power Scalers. These read index.html itself, so
   they catch the fleet defects that never show up in a logic test: the embed
   handshake, the exit affordance, dash characters in copy, the feedback fab's
   footprint, and touch targets. Every one was watched fail first. */
import fs from "node:fs";
import { boot, makeOC, GAME_PATH } from "./harness.mjs";

const html = fs.readFileSync(GAME_PATH, "utf8");
let pass = 0, fail = 0;
const ok = (n, c, x) => (c ? (pass++, console.log("  ok   " + n))
                           : (fail++, console.log("  FAIL " + n + (x ? "  <- " + x : ""))));

console.log("A. portal contract");
ok("framed detection does not rely on ?embed=1 alone",
   /SWS_FRAMED\s*=\s*\(?\s*window\.parent\s*!==\s*window/.test(html));
ok("ready is posted at parse time", /^\s*SWS_READY\(\);/m.test(html));
ok("ready is posted again on load", /addEventListener\(['"]load['"],\s*SWS_READY\)/.test(html));
ok("exit falls back to document.referrer", /document\.referrer\.indexOf\('\/portal'\)/.test(html));
ok("exit control is rendered unconditionally in the topbar",
   /data-act="exit"/.test(html) && !/window\.parent!==window\s*\?\s*`<button[^`]*data-act="exit"/.test(html));

console.log("B. house rules");
{
  // dash characters are banned in player-facing copy. Strip comments and CSS
  // first: a dash inside a code comment is not copy.
  const scripts = html.split(/<script[^>]*>/).slice(1).map(s => s.split("</script>")[0]).join("\n");
  const noBlock = scripts.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const bad = [];
  const re = /(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  let m;
  while ((m = re.exec(noBlock))) if (/[—–]|(?:\w \- \w)/.test(m[2])) bad.push(m[2].slice(0, 70));
  ok("no dash characters in player-facing strings", bad.length === 0, bad.join(" | "));
}
{
  // fixed-position elements must clear the feedback fab: x W-90..W-12, y H-174..H-96
  const toast = /\.toast-wrap\{[^}]*bottom:(\d+)px/.exec(html);
  ok("toasts clear the feedback fab footprint", toast && Number(toast[1]) >= 180,
     toast ? "bottom:" + toast[1] + "px" : "no rule found");
}
{
  const kill = /\.card \.kill\{[^}]*width:(\d+)px/.exec(html);
  const slop = /\.card \.kill::before\{[^}]*inset:-(\d+)px/.exec(html);
  const total = kill && slop ? Number(kill[1]) + Number(slop[1]) * 2 : 0;
  ok("delete control has a 48px tap target", total >= 48, "computed " + total + "px");
}
ok("every modal carries a close control", /data-act="forceCloseModal"/.test(html) &&
   /function openModal\([^)]*\)\{[^]*?modal-x/.test(html));
ok("modal close control is 48px", /\.modal-x\{[^}]*width:48px[^}]*height:48px/.test(html));

console.log("C. boots and renders every screen without throwing");
{
  const { T } = boot();
  const screens = ["screenHome", "screenBattle", "screenGauntlet", "screenTourney", "screenAlliances"];
  // empty roster
  for (const s of screens) {
    let threw = null;
    try { T[s](); } catch (e) { threw = e.message; }
    ok(s + " renders with an empty roster", !threw, threw);
  }
  // populated roster
  for (let i = 0; i < 4; i++) T.state.roster.push(makeOC(T, { name: "OC" + i, race: T.RACES[i].key }));
  T.state.sheetId = T.state.roster[0].id;
  for (const s of screens.concat(["screenSheet"])) {
    let threw = null;
    try { T[s](); } catch (e) { threw = e.message; }
    ok(s + " renders with a roster", !threw, threw);
  }
  for (const tab of ["overview", "web", "powers", "train", "ascend"]) {
    T.state.sheetTab = tab;
    let threw = null;
    try { T.screenSheet(); } catch (e) { threw = e.message; }
    ok("sheet tab " + tab + " renders", !threw, threw);
  }
}

console.log("D. economy sanity");
{
  const { T } = boot();
  const low = makeOC(T, { level: 1 }), high = makeOC(T, { level: 40 });
  ok("montage price grows with level", T.montageCostG(high) > T.montageCostG(low) * 3,
     `L1 ${T.montageCostG(low)} vs L40 ${T.montageCostG(high)}`);
  // a level must never cost less Glory than a single fight pays at that level
  const payAt40 = 30 + 40 * 3;
  ok("a bought level costs more than one arena win pays", T.montageCostG(high) > payAt40,
     `${T.montageCostG(high)} vs ${payAt40}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
