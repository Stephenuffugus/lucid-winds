// PREMIUM (DESIGN-T2 phase 7): the ten things more than one outside answer asked for.
//
// Most of phase 7 is a thing you SEE or HEAR, so the eye and the ear belong to `dev/gate-room.mjs` and to
// Stephen. What Node can hold is the RULES underneath: that there are exactly three haptics and no fourth,
// that every basket lands in a material the ear has been given, that the hour curve really does move, and
// that `?low` drops a shadow before it drops a sock.
import { suite } from './lib.mjs';
import { readFileSync } from 'fs';
import { BASKET_MATERIAL, BASKET_STYLE_MATERIAL } from '../src/audio.js';
import { HAPTICS, isNightHour, NIGHT_FROM } from '../src/config.js';
import { doorSwing, DOOR_SWING_S } from '../src/mathx.js';

const { ok, done } = suite('premium');
const read = (f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const unlocks = JSON.parse(read('data/unlocks.json'));

// ---------- 7.1 the basket lands in its own material ----------
{
  const mats = Object.keys(BASKET_MATERIAL);
  ok(mats.length >= 4, `the ear knows ${mats.length} materials (${mats.join(', ')})`);
  const baskets = unlocks.items.filter((i) => i.cat === 'basket');
  ok(baskets.length >= 12, `${baskets.length} baskets in the shop`);
  const styles = [...new Set(baskets.map((b) => b.look.style))];
  const unmapped = styles.filter((st) => !BASKET_STYLE_MATERIAL[st]);
  ok(!unmapped.length, `every basket style lands in a named material${unmapped.length ? ': ' + unmapped : ` (${styles.join(', ')})`}`);
  const dangling = Object.entries(BASKET_STYLE_MATERIAL).filter(([, m]) => !BASKET_MATERIAL[m]);
  ok(!dangling.length, `and every material a style points at is one the ear has${dangling.length ? ': ' + dangling.map(([k, v]) => k + '=' + v) : ''}`);
  // wicker is the sound the game has always made: a player who never buys a basket hears no change
  const w = BASKET_MATERIAL.wicker;
  ok(w.body === 150 && w.bodyLen === 0.18 && w.bodyPeak === 0.28 && w.mid === 420 && w.taps === 3,
    'the wicker landing is unchanged, note for note, so the starting basket sounds as it always did');
  // and the materials are actually different from each other, not one sound with five names
  const sig = (m) => [m.body, m.bodyType, m.hiss, m.taps, m.ring ? m.ring.length : 0].join('/');
  const sigs = mats.map((k) => sig(BASKET_MATERIAL[k]));
  ok(new Set(sigs).size === mats.length, `the ${mats.length} materials are ${new Set(sigs).size} different sounds`);
  const ringing = mats.filter((k) => BASKET_MATERIAL[k].ring);
  ok(ringing.includes('wire') && ringing.includes('enamel') && !ringing.includes('cloth'),
    `metal rings after the ball stops and cloth does not (${ringing.join(', ')})`);
}

// ---------- 7.9 three haptics and no more ----------
{
  const keys = Object.keys(HAPTICS);
  ok(keys.length === 3, `three haptics and no more (${keys.join(', ')})`);
  ok(keys.includes('pickUp') && keys.includes('pair') && keys.includes('basket'), 'and they are the three the design names');
  ok(Object.values(HAPTICS).every((ms) => ms > 0 && ms <= 30), `each one is short (${Object.values(HAPTICS).join(', ')} ms)`);
  // the ONE read point: every caller in the game asks by NAME, so a number can never sneak back in
  const callers = [];
  for (const f of ['src/play.js', 'src/app.js', 'src/ui.js', 'src/screens.js', 'src/table.js']) {
    for (const m of read(f).matchAll(/haptic\(([^)]*)\)/g)) callers.push({ f, arg: m[1].trim() });
  }
  ok(callers.length >= 3, `${callers.length} places ask for a buzz`);
  const numeric = callers.filter((c) => /^[0-9]/.test(c.arg));
  ok(!numeric.length, `none of them asks for a number of milliseconds${numeric.length ? ': ' + numeric.map((c) => c.f + ' haptic(' + c.arg + ')') : ''}`);
  const unknown = callers.filter((c) => !/^'(\w+)'$/.test(c.arg) || !HAPTICS[c.arg.replace(/'/g, '')]);
  ok(!unknown.length, `and every one names one of the three${unknown.length ? ': ' + unknown.map((c) => c.f + ' ' + c.arg) : ''}`);
}

// ---------- 7.8 a Reunion is mostly silence ----------
{
  const a = read('src/audio.js');
  const rc = a.slice(a.indexOf("case 'reunion':"), a.indexOf("case 'match':"));
  const tones = [...rc.matchAll(/_tone\(/g)].length;
  ok(tones <= 2, `a Reunion is one note and its octave, not an arpeggio (${tones} tones)`);
  ok(/hush\(/.test(read('src/app.js')), 'and the radio is hushed when one happens');
  ok(/duckLevel = on === 'deep' \? 0\.08/.test(a), 'the deep duck really is nearly silence (0.08)');
  // the hush comes back up on its own: nothing in the game has to remember to undo it
  ok(/_hushT|setTimeout\(\(\) => \{ if \(this\.duckLevel/.test(a), 'and it lifts itself afterwards');
}

// ---------- 7.3 the room's light follows the real hour ----------
{
  const r = read('src/render.js');
  ok(/setHour\(hour\)/.test(r), 'the renderer takes an hour');
  ok(/_applyHour/.test(read('src/app.js')), 'and the app gives it one');
  // the curve itself: brightest in the afternoon, darkest in the small hours, and a lamp in the evening
  const day = (h) => Math.max(0, Math.cos(((h - 13) / 24) * Math.PI * 2) * 0.5 + 0.5);
  // ONE clock (config.js), the one the lamp AND the window ask. The design's words are "a warm lamp after
  // 8 pm", so quarter to eight is still day; until 23 Sep this test carried its own copy at half past seven
  // and the window used eight, and both were "right".
  const evening = isNightHour;
  ok(day(13) > 0.99 && day(1) < 0.01, `the day curve peaks at one in the afternoon and bottoms in the small hours (${day(13).toFixed(2)} against ${day(1).toFixed(2)})`);
  ok(day(9) > 0.4 && day(9) < 0.9 && day(17) > 0.4 && day(17) < 0.9, `morning and late afternoon sit between (${day(9).toFixed(2)}, ${day(17).toFixed(2)})`);
  ok(NIGHT_FROM === 20 && evening(20) && !evening(19.75) && evening(21) && evening(2) && !evening(12) && !evening(6), 'the lamp comes on at eight and not before, and is off at noon and from six in the morning');
  const rm = read('src/room.js');
  ok(/const evening = isNightHour\(h\)/.test(r) && !/h >= 19\.5/.test(r), 'the lamp asks the one clock');
  ok(/const night = isNightHour\(hour\)/.test(rm) && !/getHours\(\) >= 20/.test(rm), 'and so does the window');
  // and the whole range really moves: a "follows the hour" that moves by nothing is decoration
  const key = (h) => 0.85 + day(h) * 1.75;
  ok(key(13) / key(3) > 2.5, `the key light is more than twice as strong at noon as at three in the morning (${key(13).toFixed(2)} against ${key(3).toFixed(2)})`);
}

// ---------- 7.7 and 7.10 contact shadows, and what ?low drops first ----------
{
  const r = read('src/render.js');
  ok(/_contactShadows\(\)/.test(r) && /contact\(x, y, z, r\)/.test(r), 'there is a contact shadow pool and a way to ask for one');
  ok(/this\.contactOn = !opts\.lowShadows/.test(r), '?low turns them off');
  const t = read('src/table.js');
  ok(/R\.contact\(pose\.x, pose\.y, pose\.z/.test(t), 'and the table asks for one under what it draws');
  ok(/const SOCK_SHADOW = SILHOUETTES\.map/.test(t), "each silhouette's shadow is its own footprint, not a guess");
  // 7.10's rule, as a rule: shadows go before socks do. Nothing in ?low may drop a sock.
  const lowBits = [...r.matchAll(/lowShadows/g)].length;
  ok(lowBits >= 2, `?low reaches the shadow path (${lowBits} places)`);
  ok(!/lowShadows.*pools|pools.*lowShadows/.test(r), 'and it never touches the sock pools');
}

// ---------- 7.2 the first ten seconds ----------
{
  const a = read('src/app.js');
  ok(/firstTen\(\)/.test(a), 'there is a first ten seconds');
  // ⚠️ `/s\.seen\.firstTen/` alone passes with the GUARD deleted, because the line that WRITES the flag
  // still matches. The check has to be about the early return, which is the thing it claims.
  ok(/if \(s\.seen\.firstTen \|\|/.test(a), 'and it runs once per install, not once a launch: the flag is the first thing it checks');
  ok(/s\.seen\.firstTen = true;/.test(a), 'and it writes the flag so a second launch is quiet');
  ok(/reduceMotion \|\| g\.params\.has\('turbo'\)/.test(a), 'reduceMotion and the gates skip it entirely');
  ok(/addEventListener\('pointerdown', end, true\)/.test(a), 'and a tap anywhere ends it at once: nothing makes her wait');
  ok(/firstTen\(\)/.test(read('index.html')), 'the boot calls it');
  // it asks nothing: no sheet, no hint, no question inside it
  const body = a.slice(a.indexOf('firstTen() {'), a.indexOf('openDryer()'));
  ok(!/openSheet|howTo|hint\(/.test(body), 'and it opens no sheet and says nothing');
  // the door SWINGS open, on the clock (23 Sep: it snapped open in one frame, which reads as a cut, not a door)
  ok(/doorSwing\(t\)/.test(body) && !/setDryerDoor\(1\)/.test(body), 'the door swings open on a curve, never set straight to open');
  const v = []; for (let i = 0; i <= 40; i++) v.push(doorSwing((i / 40) * DOOR_SWING_S * 1.2));
  const rises = v.slice(0, 26).every((x, i) => i === 0 || x >= v[i - 1] - 1e-9);
  ok(doorSwing(0) === 0 && doorSwing(DOOR_SWING_S) === 1 && doorSwing(DOOR_SWING_S * 0.5) > 0.5 && doorSwing(DOOR_SWING_S * 0.5) < 0.98, `the swing starts shut, is most of the way by half time and ends open (${doorSwing(DOOR_SWING_S * 0.5).toFixed(2)} at half)`);
  ok(rises && Math.max(...v) < 1.03, `and it only moves one way before a settle of ${((Math.max(...v) - 1) * 100).toFixed(1)} percent, no bounce`);
  ok(DOOR_SWING_S >= 0.5 && DOOR_SWING_S <= 1.2, `a door's time, not a flick or a crawl (${DOOR_SWING_S} s)`);
}

// ---------- 7.4 menus are paper ----------
{
  const u = read('src/ui.js');
  ok(/case 'paper'|play\('paper'\)/.test(u) || /play\('paper'\)/.test(u), 'a sheet makes a paper sound when it opens');
  ok(/play\('paperOff'\)/.test(u), 'and another when it is laid back down');
  const au = read('src/audio.js');
  const pc = au.slice(au.indexOf("case 'paper':"), au.indexOf("case 'peg':"));
  ok(!/_tone\(/.test(pc), 'paper has no tone in it at all: everything else that opens has a note, a menu that is paper does not');
  ok(/\.sheet::before/.test(u), 'and the sheet has a paper edge rather than a slab edge');
}

// ---------- 7.5 the sock lifts, and a miss flops ----------
{
  const { clothLift } = await import('../src/mathx.js');
  ok(clothLift(0) === 0 && clothLift(1) === 1, 'the lift starts where it starts and ends where it ends');
  ok(clothLift(0.2) < 0.1, `the cloth GIVES first: a fifth of the way through it has moved ${(clothLift(0.2) * 100).toFixed(0)} percent`);
  ok(clothLift(0.6) > 0.7, `then it rises: three fifths through it is ${(clothLift(0.6) * 100).toFixed(0)} percent there`);
  // and it is monotonic, or the sock would stutter on the way up
  let mono = true;
  for (let t = 0; t < 1; t += 0.01) if (clothLift(t + 0.01) < clothLift(t)) mono = false;
  ok(mono, 'and it never goes backwards');
  ok(/clothLift\(L\.t\)/.test(read('src/play.js')), 'the held sock uses it');
  const au = read('src/audio.js');
  const fc = au.slice(au.indexOf("case 'flop':"), au.indexOf("case 'huh':") > au.indexOf("case 'flop':") ? au.indexOf("case 'huh':") : au.length);
  ok(/lowpass/.test(fc) && /330/.test(fc), 'a miss is a low dull flop, not a clatter');
  ok(/sfx\(sh\.felt \|\| inB \? 'land' : 'flop'/.test(read('src/play.js')), 'and a miss really gets it');
}

// ---------- 7.6 coins and finds have weight ----------
{
  const u = read('src/ui.js');
  // one hop, then the flight: a coin that bounced twice would read as plastic
  const cf = u.slice(u.indexOf('coinFly(kind, x, y'), u.indexOf('coinLine('));
  const hops = [...cf.matchAll(/translate\(0,-\d+px\)/g)].length;
  ok(hops === 2, `a coin hops ONCE and settles, it does not bounce (${hops} up frames, the second is the settle)`);
  const ff = u.slice(u.indexOf('findFly(id, name'), u.indexOf('findLine('));
  ok(/scale\(\.4\)/.test(ff) && /scale\(1\.02\)/.test(ff), 'a find comes up small and settles, with weight');
}

// ---------- 4.1's FREE PACK (the last thing the Play listing bar needs) ----------
{
  const heroFile = JSON.parse(read('data/hero-socks.json'));
  const pack = unlocks.items.find((i) => i.id === 'pack-plant-parents');
  ok(!!pack, 'the Plant Parent Support Group pack is in the shop');
  ok(pack && pack.start === true, 'and it is HERS from the first launch, not bought');
  ok(pack && !(pack.cost || {}).quarters, 'it costs no Quarters');
  const mine = heroFile.heroes.filter((h) => h.pack === 'plant-parents');
  ok(mine.length === 10, `ten socks in it (${mine.length})`);
  const by = {};
  for (const h of mine) by[h.rarity] = (by[h.rarity] || 0) + 1;
  ok(by.common === 5 && by.uncommon === 3 && by.rare === 2, `five common, three uncommon, two rare (${JSON.stringify(by)})`);
  const sils = new Set(mine.map((h) => h.silhouette));
  ok(sils.size === 8, `spread across all eight silhouettes (${sils.size})`);
  const names = new Set(mine.map((h) => h.name));
  ok(names.size === 10, 'ten different names');
  // the copy laws, on a pack every single player will see
  const longFlavor = mine.filter((h) => h.flavor.split(/\s+/).length > 12);
  ok(!longFlavor.length, `every flavor line is short${longFlavor.length ? ': ' + longFlavor.map((h) => h.name) : ''}`);
  const shouty = mine.filter((h) => /[!]/.test(h.name + h.flavor));
  ok(!shouty.length, 'nothing in it shouts');
  // ⛔ ownedPacks used to read save.unlocks directly, which never contains a `start` pack: the FREE pack
  // would have been the one pack nobody ever got. It reads owns() now.
  ok(/owns\(this\.save, i\)/.test(read('src/app.js')), 'and a pack she starts with is really owned (ownedPacks asks owns, not the unlock list)');
}

done();
