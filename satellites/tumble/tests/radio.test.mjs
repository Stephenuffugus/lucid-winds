// THE RADIO IS A MUSIC PLAYER (Stephen, 23 Sep 2026): his eight songs, titled as he titled them ("remove the
// underscores so they look like song titles"), the generated stations gone ("the audio you made should be removed"),
// each song switched in or out of the loop, the loop playing every song whole, one after another. The rules live in
// src/radio.js (pure); dev/gate-radio.mjs holds the page and the player.
import { readFileSync } from 'fs';
import { suite } from './lib.mjs';
import { songs, loopOf, nextSong, currentSong, toggle, retireStations } from '../src/radio.js';
import { freshSave } from '../src/save.js';

const { ok, done } = suite('radio');
const unlocks = JSON.parse(readFileSync(new URL('../data/unlocks.json', import.meta.url)));
const radios = unlocks.items.filter((i) => i.cat === 'radio');
// 24 Sep: retitled by him ("Below are the names that I want to use for the songs"), his list top to bottom against the catalogue
const TITLES = ['Sock It to Me', 'Perfect Pair', 'Sole Mates', 'Spin Cycle', 'Hamper Jam', 'Toe to Toe', 'Heel Yeah', 'Double Trouble'];
const SONGS = ['fold-it-up', 'gayageum-janggu', 'hard-gayageum-janggu', 'modular-jazz-hub', 'nightmarish-lo-fi', 'quite-the-throwdown', 'the-suspicious-menu', 'whos-sock-is-this'];

// 1. the radio is his eight songs and nothing else
ok(radios.length === 8 && songs(unlocks.items).length === 8, `the radio holds eight songs and no generated station (${radios.length} radio items, ${songs(unlocks.items).length} with a file)`);
{
  const names = radios.map((r) => r.name);
  const bad = TITLES.filter((t) => !names.includes(t));
  ok(!bad.length, `each is titled as he titled it${bad.length ? ': missing ' + bad.join(', ') : ''}`);
  ok(!names.some((n) => /_/.test(n)), 'no title carries an underscore');
  ok(radios.every((r) => r.look.song === r.name), 'the song a card names is its title');
}
{
  // THE SONG LADDER (24 Sep): the first is free from the start; the rest cost Quarters ("you spend quarters on your songs"),
  // one of them a single Quarter ("really cheap like one quarter ... so they can be like ooh cool"), none Lint
  ok(radios[0].start === true && Object.keys(radios[0].cost || {}).length === 0, `the first song is hers from the start (${radios[0].name})`);
  const rest = radios.slice(1);
  const bad = rest.filter((r) => r.start || !(r.cost && Number.isInteger(r.cost.quarters) && r.cost.quarters >= 1 && r.cost.quarters <= 4 && Object.keys(r.cost).length === 1));
  ok(!bad.length, `the other seven cost one to four Quarters, Quarters alone${bad.length ? ': ' + bad.map((r) => r.name).join(', ') : ''}`);
  ok(rest.some((r) => r.cost.quarters === 1), 'at least one song costs a single Quarter');
}
{
  const bad = [], used = new Set();
  for (const r of radios) {
    const m = /^\/music\/v1\/tumble\/([a-z0-9-]+)\.mp3$/.exec(r.look.url || '');
    if (!m || !SONGS.includes(m[1])) { bad.push(`${r.name}: ${r.look.url}`); continue; }
    if (used.has(m[1])) bad.push(`${m[1]} twice`);
    used.add(m[1]);
  }
  ok(!bad.length && used.size === 8, `each plays one of his eight files, each file once${bad.length ? ': ' + bad.join('; ') : ''}`);
}

// 2. the generated stations are retired, with their price on the list, and the code that made them is gone
{
  const retired = unlocks.retired || [];
  const SIX = ['radio-lofi', 'radio-rain', 'radio-jazz', 'radio-tv', 'radio-hold', 'radio-resonarc'];
  ok(SIX.every((id) => retired.some((r) => r.id === id && r.refund && r.refund.lint === 200)), `the six generated stations are on the retired list at 200 Lint each (${retired.length})`);
  ok(!unlocks.items.some((i) => SIX.includes(i.id)), 'and none of them is in the shop');
  const audio = readFileSync(new URL('../src/audio.js', import.meta.url), 'utf8');
  ok(!/class Station\b/.test(audio) && !/PLACE_BEDS|STATION_BEDS/.test(audio), 'the generated station player and its beds are out of src/audio.js');
}

// 3. a save that owned generated stations gets its Lint back once, and the radio never points at one
{
  const s = freshSave();
  s.unlocks.push('radio-lofi', 'radio-jazz', 'radio-kitchen', 'decor-rug-medallion');
  s.equipped.radio = 'radio-jazz';
  s.economy.lint = 50;
  const r = retireStations(s, unlocks);
  ok(r.refunded.length === 2 && r.lint === 400 && s.economy.lint === 450, `two owned stations refund 400 Lint (${s.economy.lint})`);
  ok(!s.unlocks.includes('radio-lofi') && !s.unlocks.includes('radio-jazz') && s.unlocks.includes('radio-kitchen') && s.unlocks.includes('decor-rug-medallion'), 'they leave the save and nothing else does');
  ok(s.equipped.radio === null, 'a radio that was on a retired station is off');
  const again = retireStations(s, unlocks);
  ok(again.refunded.length === 0 && s.economy.lint === 450, 'a second load refunds nothing');
}

// 4. the loop: owned songs in catalogue order, minus the ones switched off; it wraps; one song repeats
{
  const s = freshSave();
  const ids = songs(unlocks.items).map((i) => i.id);
  // 24 Sep: the first song is everybody's from the start, so a fresh loop is that one song, and the radio is on it
  ok(JSON.stringify(loopOf(unlocks.items, s)) === JSON.stringify([ids[0]]) && nextSong(unlocks.items, s, null) === ids[0] && currentSong(unlocks.items, s) === ids[0], 'a fresh save has the first song in the loop and the radio on it');
  { const e = freshSave(); e.radioOff = [ids[0]]; e.equipped.radio = null; ok(loopOf(unlocks.items, e).length === 0 && nextSong(unlocks.items, e, null) === null && currentSong(unlocks.items, e) === null, 'with every owned song switched off the radio has nothing to play'); }
  s.unlocks.push(ids[2], ids[5]);
  ok(JSON.stringify(loopOf(unlocks.items, s)) === JSON.stringify([ids[0], ids[2], ids[5]]), 'three owned songs make a loop of three, in catalogue order');
  ok(nextSong(unlocks.items, s, ids[0]) === ids[2] && nextSong(unlocks.items, s, ids[2]) === ids[5] && nextSong(unlocks.items, s, ids[5]) === ids[0], 'the loop goes one to the next and wraps');
  ok(nextSong(unlocks.items, s, 'radio-nothing') === ids[0], 'after a song not in the loop, the first plays');
  toggle(unlocks.items, s, ids[2], false);
  ok(JSON.stringify(loopOf(unlocks.items, s)) === JSON.stringify([ids[0], ids[5]]) && JSON.stringify(s.radioOff) === JSON.stringify([ids[2]]), 'a song switched off leaves the loop and is remembered');
  ok(nextSong(unlocks.items, s, ids[0]) === ids[5], 'and is skipped');
  toggle(unlocks.items, s, ids[5], false);
  ok(nextSong(unlocks.items, s, ids[0]) === ids[0], 'one song in the loop repeats');
}

// 5. switching: on starts the radio when it was off; off moves to the next, or falls silent
{
  const s = freshSave();
  const ids = songs(unlocks.items).map((i) => i.id);
  ok(s.equipped.radio === ids[0], 'a fresh radio is on, on the first song (24 Sep)');
  // from here the case is a radio she switched off, with the first song out of the loop
  s.radioOff = [ids[0]]; s.equipped.radio = null;
  s.unlocks.push(ids[1], ids[3]);
  ok(s.equipped.radio === null, 'a radio she switched off is off');
  ok(toggle(unlocks.items, s, ids[3], true) === ids[3] && s.equipped.radio === ids[3], 'switching a song on when the radio is off starts it');
  ok(toggle(unlocks.items, s, ids[1], true) === ids[3], 'switching another on while one plays waits its turn');
  ok(toggle(unlocks.items, s, ids[3], false) === ids[1] && s.equipped.radio === ids[1], 'switching off the one playing moves to the next');
  ok(toggle(unlocks.items, s, ids[1], false) === null && s.equipped.radio === null, 'switching off the last one turns the radio off');
  ok(currentSong(unlocks.items, s) === null, 'and nothing should be playing');
}

done();
