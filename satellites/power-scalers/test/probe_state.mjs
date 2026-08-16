/* Save/load probe. Every assertion here was watched FAIL against the code it
   was written for before the fix landed; a probe that cannot fail is not
   evidence. Run: node probe_state.mjs */
import { boot, makeStore, makeOC } from "./harness.mjs";

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log("  ok   " + name); }
  else { fail++; console.log("  FAIL " + name + (extra ? "  <- " + extra : "")); }
}
const KEY = "lucidwinds_arena_v2";
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function withSave(raw) {
  const ls = makeStore();
  if (raw !== undefined) ls.setItem(KEY, raw);
  const { T } = boot({ localStorage: ls });
  await T.loadState();
  return { T, ls };
}

console.log("A. fresh install");
{
  const { T } = await withSave(undefined);
  ok("starter augments granted", (T.state.ownedAugments || []).length === T.STARTER_AUGMENTS.length);
  ok("starter jewels granted", (T.state.ownedJewels || []).length === T.STARTER_JEWELS.length);
  ok("empty roster", T.state.roster.length === 0);
}

console.log("B. round trip");
{
  const { T, ls } = await withSave(undefined);
  T.state.glory = 411;
  T.state.roster.push(makeOC(T, { name: "Roundtrip" }));
  T.persist();
  await sleep(300);
  const { T: T2 } = await withSave(ls.getItem(KEY));
  ok("glory survives reload", T2.state.glory === 411, "got " + T2.state.glory);
  ok("roster survives reload", T2.state.roster.length === 1 && T2.state.roster[0].name === "Roundtrip");
}

console.log("C. corrupt saves must never cost more than the corrupt part");
{
  const { T } = await withSave("{not json at all");
  ok("garbage blob boots clean", T.state.roster.length === 0 && (T.state.ownedAugments || []).length > 0);
}
{
  const { T } = await withSave(JSON.stringify({ glory: 90, roster: "not an array" }));
  ok("wrong-typed roster boots clean", Array.isArray(T.state.roster) && T.state.roster.length === 0);
}
{
  // one rotten character in an otherwise good roster
  const { T: T0 } = await withSave(undefined);
  const good1 = makeOC(T0, { name: "Alpha" }), good2 = makeOC(T0, { name: "Beta" });
  const raw = JSON.stringify({ glory: 50, roster: [good1, null, good2] });
  const { T } = await withSave(raw);
  ok("one null character does not delete the whole roster", T.state.roster.length === 2,
     "roster length " + T.state.roster.length);
}
{
  const { T: T0 } = await withSave(undefined);
  const good = makeOC(T0, { name: "Alpha" });
  const broken = { id: "x", name: "Broken", race: "not_a_race", level: 4 }; // no baseStats, no powers
  const { T } = await withSave(JSON.stringify({ roster: [good, broken] }));
  ok("a character with no stats is repaired or dropped, never fatal", T.state.roster.length >= 1);
  let rendered = true;
  try { T.render(); } catch (e) { rendered = false; console.log("     render threw: " + e.message); }
  ok("roster renders with a damaged character present", rendered);
}

console.log("D. two open tabs must not clobber each other");
{
  const ls = makeStore();
  const A = boot({ localStorage: ls }).T;   // tab A
  await A.loadState();
  const B = boot({ localStorage: ls }).T;   // tab B, same storage
  await B.loadState();
  A.state.roster.push(makeOC(A, { name: "MadeInTabA" }));
  A.state.glory = 100;
  A.persist(); await sleep(300);
  B.state.glory = 40;
  B.persist(); await sleep(300);            // B writes its older snapshot
  const after = JSON.parse(ls.getItem(KEY));
  ok("a character created in tab A survives a write from tab B",
     (after.roster || []).some(o => o.name === "MadeInTabA"),
     "roster now " + JSON.stringify((after.roster || []).map(o => o.name)));
  ok("glory takes the higher of the two tabs rather than the last writer",
     after.glory === 100, "glory " + after.glory);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
