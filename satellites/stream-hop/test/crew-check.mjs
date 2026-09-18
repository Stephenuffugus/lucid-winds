/* THE WHOLE CREW GATE (2026-09-18). "Find every critter" must be EARNABLE by a player who has no private code.
   The Barnacle (one man's code) and Shinothy (her inventor's code) stay visible but must never be required.
     node test/crew-check.mjs           the working tree
     node test/crew-check.mjs --plant   today's game with the achievement judged against the raw roster again: MUST FAIL */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { serve } from './serve.mjs';
const require = createRequire('/workspaces/lucid-winds/package.json'); const puppeteer = require('puppeteer');
const PLANT = process.argv.includes('--plant'), PORT = 8976, HERE = new URL('..', import.meta.url).pathname;
const src = readFileSync(HERE + 'index.html', 'utf8'), NEEDLE = "case 'crittersAll': return ownedCount()>=crewTotal();";
if (PLANT && !src.includes(NEEDLE)) { console.log('the plant cannot find the line to break'); process.exit(2); }
const PLANTED = PLANT ? src.replace(NEEDLE, "case 'crittersAll': return ownedCount()>=CHARS.length;") : null;
await serve(PORT, (p) => (PLANT && /stream-hop\/index\.html$/.test(p)) ? { body: PLANTED, headers: { 'Content-Type': 'text/html; charset=utf-8' } } : null);
let pass = 0, fail = 0; const ok = (c, m, d) => { c ? pass++ : fail++; console.log(`  ${c ? 'PASS' : 'FAIL'}  ${m}${d ? '  [' + d + ']' : ''}`); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const fresh = async () => { const ctx = await (browser.createBrowserContext ? browser.createBrowserContext() : browser.createIncognitoBrowserContext()); const pg = await ctx.newPage();
  await pg.goto(`http://127.0.0.1:${PORT}/satellites/stream-hop/index.html?shtest=1`, { waitUntil: 'load', timeout: 60000 }); await wait(2200); return pg; };   // a fresh CONTEXT: the game saves PROG on its way out
const PRIVATE = ['barnacle', 'shinothy'];
let pg = await fresh();
const roster = await pg.evaluate(() => SH_DEV.roster());
ok(roster.length >= 46 && PRIVATE.every((id) => roster.includes(id)), 'the roster still holds both private characters (they stay visible)', `${roster.length} characters`);
const publicIds = roster.filter((id) => !PRIVATE.includes(id));
ok((await pg.evaluate(() => SH_DEV.crewTotal())) === publicIds.length, 'a fresh player\'s total leaves the two private characters out', `${await pg.evaluate(() => SH_DEV.crewTotal())} of ${roster.length}`);
ok(!(await pg.evaluate(() => SH_DEV.achMet('crittersAll'))), 'a fresh player has NOT earned The Whole Crew');
await pg.evaluate((ids) => SH_DEV.own(ids.join(',')), publicIds.slice(0, -1));
ok(!(await pg.evaluate(() => SH_DEV.achMet('crittersAll'))), 'one findable character short: NOT earned');
await pg.evaluate((ids) => SH_DEV.own(ids.join(',')), publicIds);
ok(await pg.evaluate(() => SH_DEV.achMet('crittersAll')), 'EVERY findable character, no private code: The Whole Crew IS earned');
// the one man who holds The Barnacle: his total grows by one and he still has it
await pg.evaluate(() => SH_DEV.own('barnacle'));
ok((await pg.evaluate(() => SH_DEV.crewTotal())) === publicIds.length + 1 && await pg.evaluate(() => SH_DEV.achMet('crittersAll')), 'owning a private character adds it to YOUR total and never takes the achievement away');
// the Prize Bin header a player reads
await pg.evaluate(() => { SH_DEV.show('s-skins'); SH_DEV.renderBin(); }); await wait(900);
const header = await pg.evaluate(() => { const e = document.getElementById('bin-count'); return e ? e.textContent.trim().slice(0, 40) : ''; });
ok(new RegExp(`^${publicIds.length + 1} of ${publicIds.length + 1} found`).test(header), 'the Prize Bin header a player reads counts against the same total', header || 'EMPTY: the header did not render, which is a failure, not a pass');
await browser.close();
console.log(`\n${fail ? 'FAILED' : 'OK'}  ${pass} passed, ${fail} failed${PLANT ? '   (PLANT RUN: a failure here is the point)' : ''}`);
process.exit(fail ? 1 : 0);
