#!/usr/bin/env node
/* Run every audit check in the fleet, one at a time, and report honestly.
   Serialized: parallel node suites on two cores make results disagree. */
import { readdirSync, existsSync } from "fs";
import { spawnSync } from "child_process";

const CAND = ["check.mjs","audit.mjs","audit-check.mjs","audit_check.mjs","check.js",
              "test/check.mjs","test/harness.mjs","test/logic.mjs","sim.js"];
const rows = [];
const dirs = readdirSync("satellites").filter(d => existsSync("satellites/"+d+"/index.html"));
for (const d of dirs) {
  const f = CAND.map(c => "satellites/"+d+"/"+c).find(p => existsSync(p));
  if (!f) continue;
  const args = f.endsWith("sim.js") ? [f, "--test"] : [f];
  const r = spawnSync("node", args, { encoding: "utf8", timeout: 180000 });
  const out = ((r.stdout||"")+(r.stderr||""));
  const m = out.match(/PASSED\s+(\d+)\s*\/\s*FAILED\s+(\d+)/i)
        || out.match(/(\d+)\s+passed,\s+(\d+)\s+failed/i)
        || out.match(/(\d+)\s+ok,\s+(\d+)\s+red/i);
  rows.push({ game:d, file:f.split("/").slice(2).join("/"),
    pass: m?+m[1]:null, fail: m?+m[2]:null, code: r.status,
    note: m?"":out.trim().split("\n").pop()?.slice(0,44) });
}
rows.sort((a,b)=> (a.code===0?1:0)-(b.code===0?1:0) || (b.pass||0)-(a.pass||0));
let green=0, red=0, tot=0;
console.log("FLEET VERIFICATION  " + rows.length + " games with a check\n");
for (const r of rows) {
  const ok = r.code === 0 && (r.fail === null || r.fail === 0);
  if (ok) green++; else red++;
  if (r.pass) tot += r.pass;
  console.log((ok?"  ok  ":" RED  ") + r.game.padEnd(22) +
    (r.pass!==null ? (r.pass+" passed, "+r.fail+" failed").padEnd(24) : "unparsed".padEnd(24)) +
    "exit "+r.code + (r.note?"  "+r.note:""));
}
console.log("\n" + green + " green, " + red + " red, " + tot + " assertions total across the fleet");
process.exit(red?1:0);
