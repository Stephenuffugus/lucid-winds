// THE DRYER'S LOOK DRIVES THE MACHINE (DESIGN-T2 6.1): "body colour, trim, door ring, strip, metalness, roughness,
// a decal. The five old dryers become data and look as they did. Then eight FINISHES (8 to 14 Quarters): Woodgrain
// 1978 · Porcelain Farmhouse · Copper Top · Sea Glass Blue · Corner Laundromat Round Door · Heat Pump Cube ·
// Galvanised Utility · The One With the Radio (the station plays through it, low)."
//
// Before 6.1 a dryer was a colour table and two material numbers inside render.setDryerLook, keyed by model name, and
// what a dryer DID was keyed by the same names in app.js. This holds the five old ones to the exact numbers that code
// produced (written out below, not read from the new code), and the eight new ones to the design's list and prices,
// to a real look each (no two dryers twins) and to doing nothing but look different.
import { readFileSync } from 'fs';
import { suite } from './lib.mjs';
import { dryerLook, dryerLoads, DECALS, BODY_MAPS } from '../src/dryerlook.js';
import { deltaE } from '../engine/color.js';

const { ok, done } = suite('dryers');
const items = JSON.parse(readFileSync(new URL('../data/unlocks.json', import.meta.url), 'utf8')).items;
const dryers = items.filter((i) => i.cat === 'dryer');
const hex = (n) => '#' + n.toString(16).padStart(6, '0');
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

// ---------- the five old dryers look exactly as the old code drew them ----------
// render.js setDryerLook before 6.1, written out by hand: body colour, metalness, roughness, the ring's glow, strip
const OLD = {
  standard: { body: 0xb0d6c4, metal: 0, rough: 0.32, glow: 0x000000, glowK: 0, strip: 0xf1ead8, loads: 'regular' },
  avocado: { body: 0xa3ad5a, metal: 0, rough: 0.32, glow: 0x000000, glowK: 0, strip: 0x6b5a3a, loads: 'regular' },
  industrial: { body: 0xc9ccce, metal: 0.75, rough: 0.35, glow: 0x000000, glowK: 0, strip: 0xf1ead8, loads: 'bigger' },
  clothesline: { body: 0xe7d2b4, metal: 0, rough: 0.32, glow: 0x000000, glowK: 0, strip: 0xf1ead8, loads: 'oneAtATime' },
  portal: { body: 0x3a3f5c, metal: 0.4, rough: 0.32, glow: 0x5fd3ff, glowK: 1.6, strip: 0x20233a, loads: 'portal' },
};
// and the parts it never changed: the chrome of the ring, the top slab in the body's own enamel, no decal, no map
const CHROME = { ring: 0xdedbd2, ringMetal: 1, ringRough: 0.22, ringTube: 0.024 };
{
  const bad = [];
  for (const [model, o] of Object.entries(OLD)) {
    const it = dryers.find((d) => d.look && d.look.model === model);
    if (!it) { bad.push(`${model}: not in the shop`); continue; }
    const L = dryerLook(it.look);
    const want = { body: hex(o.body), bodyMetal: o.metal, bodyRough: o.rough, ringGlow: hex(o.glow), ringGlowK: o.glowK, strip: hex(o.strip), trim: hex(o.body), trimMetal: o.metal, trimRough: o.rough, ring: hex(CHROME.ring), ringMetal: CHROME.ringMetal, ringRough: CHROME.ringRough, ringTube: CHROME.ringTube, bodyMap: null, decal: null, radio: false };
    for (const [k, v] of Object.entries(want)) if (L[k] !== v) bad.push(`${model}.${k}: ${L[k]} (was ${v})`);
    if (dryerLoads(it.look) !== o.loads) bad.push(`${model} loads ${dryerLoads(it.look)} (was ${o.loads})`);
    // and the DATA says it: a look is not allowed to lean on the old model table any more
    for (const k of ['body', 'strip']) if (!it.look[k]) bad.push(`${model}: its look does not carry ${k}`);
  }
  ok(!bad.length, `the five old dryers are data now and resolve to exactly what the old code drew${bad.length ? ': ' + bad.join('; ') : ''}`);
  // a look with ONLY a model name (anything older, or a save pointing at a look the shop no longer carries) still draws
  const legacy = Object.keys(OLD).every((m) => dryerLook({ model: m }).body === hex(OLD[m].body) && dryerLoads({ model: m }) === OLD[m].loads);
  ok(legacy && dryerLook(null).body === hex(OLD.standard.body) && dryerLoads(null) === 'regular', 'a bare model name, or no look at all, still draws and behaves as it did');
}

// ---------- the eight finishes ----------
const FINISHES = ['Woodgrain 1978', 'Porcelain Farmhouse', 'Copper Top', 'Sea Glass Blue', 'Corner Laundromat Round Door', 'Heat Pump Cube', 'Galvanised Utility', 'The One With the Radio'];
const fin = dryers.filter((d) => d.look && d.look.finish);
{
  ok(fin.length === 8 && FINISHES.every((n) => fin.some((d) => d.name === n)), `the eight finishes, by the design's names (${fin.map((d) => d.name).join(', ')})`);
  ok(fin.every((d) => d.cost && d.cost.quarters >= 8 && d.cost.quarters <= 14 && !d.start), `each costs 8 to 14 Quarters (${fin.map((d) => d.cost && d.cost.quarters).join(', ')})`);
  // a finish is a LOOK: it tumbles a Regular Load like the standard machine, so no finish is secretly a better dryer
  ok(fin.every((d) => dryerLoads(d.look) === 'regular'), 'every finish tumbles a Regular Load: a finish changes how the machine looks, never what it does');
  const radio = fin.filter((d) => dryerLook(d.look).radio);
  ok(radio.length === 1 && radio[0].name === 'The One With the Radio', 'one finish, and only one, plays the station through it');
  ok(fin.every((d) => /^[A-Z]/.test(d.desc) && d.desc.length <= 140 && !/[-–—]/.test(d.name + d.desc)), 'each has a short description in the shop voice, no dashes');
  const decals = fin.map((d) => dryerLook(d.look).decal).filter(Boolean);
  ok(decals.every((x) => DECALS.includes(x.kind)) && decals.length >= 4, `the decals are ones the renderer draws (${decals.map((x) => x.kind).join(', ')})`);
  const maps = fin.map((d) => dryerLook(d.look).bodyMap).filter(Boolean);
  ok(maps.every((m) => BODY_MAPS.includes(m)) && maps.includes('woodgrain') && maps.includes('galvanised'), `Woodgrain and Galvanised have a body texture, not a flat colour (${maps.join(', ')})`);
  const nums = fin.every((d) => { const L = dryerLook(d.look); return [L.bodyMetal, L.bodyRough, L.trimMetal, L.trimRough, L.ringMetal, L.ringRough].every((v) => v >= 0 && v <= 1) && L.ringTube >= 0.018 && L.ringTube <= 0.04; });
  ok(nums, 'every material number is in range, and the door ring stays a ring');
  ok(fin.every((d) => d.look.color === dryerLook(d.look).body && d.look.color2), 'the shop swatch shows each finish in its own two colours');
}

// ---------- no two dryers in the shop look like twins ----------
// Two are twins when EVERY visible part is within dE 10 of the other's and they share a texture and a decal. The one
// part a finish may share (the chrome ring) is not enough to tell two apart from across the room.
{
  const parts = (d) => { const L = dryerLook(d.look); return { L, cols: [L.body, L.trim, L.strip, L.ring].map(rgb) }; };
  const twins = [];
  for (let i = 0; i < dryers.length; i++) for (let j = i + 1; j < dryers.length; j++) {
    const a = parts(dryers[i]), b = parts(dryers[j]);
    const near = a.cols.every((c, k) => deltaE(c, b.cols[k]) < 10);
    const sameKit = a.L.bodyMap === b.L.bodyMap && (a.L.decal && a.L.decal.kind) === (b.L.decal && b.L.decal.kind) && Math.abs(a.L.bodyMetal - b.L.bodyMetal) < 0.3;
    if (near && sameKit) twins.push(`${dryers[i].name} and ${dryers[j].name}`);
  }
  ok(!twins.length, `no two of the ${dryers.length} dryers look like twins${twins.length ? ': ' + twins.join(', ') : ''}`);
  // and the body alone: the one colour you see from the table, at least dE 8 from every other plain body
  const plain = dryers.filter((d) => !dryerLook(d.look).bodyMap);
  const close = [];
  for (let i = 0; i < plain.length; i++) for (let j = i + 1; j < plain.length; j++) {
    const a = dryerLook(plain[i].look), b = dryerLook(plain[j].look);
    if (deltaE(rgb(a.body), rgb(b.body)) < 8 && Math.abs(a.bodyMetal - b.bodyMetal) < 0.3 && Math.abs(a.bodyRough - b.bodyRough) < 0.25) close.push(`${plain[i].name} ~ ${plain[j].name}`);
  }
  ok(!close.length, `every plain body is its own colour or its own material${close.length ? ': ' + close.join(', ') : ''}`);
}

done();
