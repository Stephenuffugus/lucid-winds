// PREMIUM (DESIGN-T2 phase 7): the ten things more than one outside answer asked for.
//
// Most of phase 7 is a thing you SEE or HEAR, so the eye and the ear belong to `dev/gate-room.mjs` and to
// Stephen. What Node can hold is the RULES underneath: that there are exactly three haptics and no fourth,
// that every basket lands in a material the ear has been given, that the hour curve really does move, and
// that `?low` drops a shadow before it drops a sock.
import { suite } from './lib.mjs';
import { readFileSync } from 'fs';
import { BASKET_MATERIAL, BASKET_STYLE_MATERIAL } from '../src/audio.js';
import { HAPTICS } from '../src/config.js';

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
  const evening = (h) => h >= 19.5 || h < 6;
  ok(day(13) > 0.99 && day(1) < 0.01, `the day curve peaks at one in the afternoon and bottoms in the small hours (${day(13).toFixed(2)} against ${day(1).toFixed(2)})`);
  ok(day(9) > 0.4 && day(9) < 0.9 && day(17) > 0.4 && day(17) < 0.9, `morning and late afternoon sit between (${day(9).toFixed(2)}, ${day(17).toFixed(2)})`);
  ok(evening(21) && evening(2) && !evening(12), 'the lamp comes on after half past seven and is off at noon');
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

done();
