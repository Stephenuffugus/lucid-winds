#!/usr/bin/env node
/* The wind the EYE is shown (Director call 66, item 2), in a real browser at 375x667, Blustery.
 *
 *   node test/wind.mjs
 *
 * What it asserts, each watched to fail (the ledger is in HANDOFF-UPDRAFT SESSION STATE):
 *   1. the grass lean at every sampled moment EQUALS the eye's function of the
 *      live wind at that moment (base, envelope, gust), and it varies over a
 *      Blustery minute, so the grass is the gust and not a decoration
 *   2. the windsock's bearing follows the wind's direction: the pure sockDir
 *      points right for a veer to the right, left for left, hangs with no wind,
 *      lifts with it, and the sock on the field is that function of the model's
 *      veer and the same lean the grass has
 *   3. the grass and the windsock actually paint (a differential off the canvas),
 *      and the sock's pole stands clear of the music chip's corner
 *
 * UPDRAFT_DEV.place puts the kite aloft once, as test/layout.mjs does; nothing
 * else here writes to the sim.
 */
import { serve, open, reporter, tap, waitFrames, untilSim } from './harness.mjs';

const { base, close } = await serve();
const { browser, page, errors } = await open(base, { width: 375, height: 667 });
const { fails, say } = reporter();
const dev = (fn, ...a) => page.evaluate(fn, ...a);

await dev(() => localStorage.setItem('lw_updraft_v1', JSON.stringify({ v: 1, journal: { bestAlt: 0, longest: 0, tricks: {}, hours: 0, flights: 0 }, kite: 'diamond', mood: 'blustery' })));
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(() => window.UPDRAFT_DEV && window.UPDRAFT_DEV.screen() === 'title', { timeout: 20000 });
await tap(page, '#btnPlay');
await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'play', { timeout: 20000 });
await waitFrames(page, 3);
await dev(() => window.UPDRAFT_DEV.place({ L: 30, el: 0.8, az: 0, launched: true }));
await waitFrames(page, 2);

/* 1. the lean is the function, sampled every half second of SIM time for twelve seconds */
const samples = [];
let t0 = await dev(() => window.UPDRAFT_DEV.state().t);
for (let i = 0; i < 24; i++) {
  await untilSim(page, t0 + 0.5 * (i + 1), 30000);
  samples.push(await dev(() => window.UPDRAFT_DEV.field()));
}
const expect = f => 0.12 + 0.88 * Math.max(0, Math.min(1, f.base * f.env * (1 + f.gust) / 12));
const off = samples.filter(f => Math.abs(f.bend - expect(f)) > 1e-6);
say(samples.length === 24 && off.length === 0, 'the grass lean at every one of ' + samples.length + ' moments is the eye\'s function of the wind at that moment' + (off.length ? ' (' + off.length + ' off, first bend ' + off[0].bend + ' wanted ' + expect(off[0]) + ')' : ''));
const bends = samples.map(f => f.bend), spread = Math.max(...bends) - Math.min(...bends);
say(spread >= 0.15, 'and it moves over a Blustery quarter minute: lean ' + Math.min(...bends).toFixed(2) + ' to ' + Math.max(...bends).toFixed(2));
const ordered = samples.every((f, i) => i === 0 || (f.mag >= samples[i - 1].mag) === (f.bend >= samples[i - 1].bend) || Math.abs(f.bend - samples[i - 1].bend) < 1e-9);
say(ordered, 'a stronger wind is a lower grass at every step, never the other way');
say(samples.some(f => f.env !== 1), 'the envelope is alive in the model (env ' + samples[samples.length - 1].env.toFixed(3) + ' at ' + samples[samples.length - 1].t.toFixed(1) + ' s)');

/* 2. the windsock */
const sd = await dev(() => ({ r: window.UPDRAFT_DEV.sockDir(0.35, 0.8), l: window.UPDRAFT_DEV.sockDir(-0.35, 0.8), calm: window.UPDRAFT_DEV.sockDir(0, 0), full: window.UPDRAFT_DEV.sockDir(0, 1) }));
say(sd.r.dx > 0.3 && sd.l.dx < -0.3, 'the windsock points right for a veer to the right and left for left (dx ' + sd.r.dx.toFixed(2) + ' and ' + sd.l.dx.toFixed(2) + ')');
say(sd.calm.dy > 0.95, 'and hangs straight down with no wind (dy ' + sd.calm.dy.toFixed(2) + ')');
say(sd.full.dy < sd.calm.dy - 0.5, 'and lifts with the wind (dy ' + sd.full.dy.toFixed(2) + ' at a full lean)');
const live = samples[samples.length - 1];
const fromModel = await dev((v, b) => window.UPDRAFT_DEV.sockDir(v, b), live.veer, live.bend);
say(Math.abs(live.sock.dx - fromModel.dx) < 1e-9 && Math.abs(live.sock.dy - fromModel.dy) < 1e-9,
  'the sock on the field is that function of the model\'s veer (' + (live.veer * 180 / Math.PI).toFixed(1) + ' degrees) and the grass\'s own lean');
say(Math.sign(live.sock.dx) === Math.sign(Math.sin(live.veer)) || Math.abs(live.veer) < 0.01, 'and it points the way the wind veers');

/* 3. they paint, and the pole is clear of the music chip's corner */
const ink = await dev(() => window.UPDRAFT_DEV.fieldInk());
say(!!ink && ink.grass >= 400, 'the grass paints (' + (ink ? ink.grass : 0) + ' pixels lean in the frame)');
say(!!ink && ink.sock >= 60, 'and so does the windsock (' + (ink ? ink.sock : 0) + ' pixels)');
say(!!ink && ink.sockPole.x - 12 > 120 && ink.sockPole.x + 40 < ink.W && ink.sockPole.top > 0, 'the sock stands right of the reel, clear of the bottom left 120 by 120 (pole at x ' + (ink ? ink.sockPole.x : '?') + ')');

say(errors.length === 0, 'nothing on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close();
close();
console.log('');
if (fails.length) { console.log(fails.length + ' WIND FAILURE(S)'); process.exit(1); }
console.log('WIND OK');
