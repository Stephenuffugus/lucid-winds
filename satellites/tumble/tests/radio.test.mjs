// PHASE 8, THE RADIO (DESIGN-T2): "eight stations are MOODS NAMED AS PLACES (Kitchen After Midnight · Rain in a Parked
// Car · Library Basement at Closing · Late Train Home · Diner Booth at 5 A.M. · Greenhouse With the Hose On · Someone
// Vacuuming Upstairs · The Shop Before Opening). The FILES are Stephen's own songs (look.url)."
//
// His eight Tumble songs are live at /music/v1/tumble/ (the private music repo; audio never enters this one). Each
// station plays one of them, and each has a generated bed of its own for when the file cannot play (offline, a
// refused autoplay): a station with no bed would be SILENT then, because Station only knows the kinds it is taught.
import { readFileSync } from 'fs';
import { suite } from './lib.mjs';
import { STATION_BEDS } from '../src/audio.js';

const { ok, done } = suite('radio');
const unlocks = JSON.parse(readFileSync(new URL('../data/unlocks.json', import.meta.url)));
const radios = unlocks.items.filter((i) => i.cat === 'radio');
const PLACES = ['Kitchen After Midnight', 'Rain in a Parked Car', 'Library Basement at Closing', 'Late Train Home', 'Diner Booth at 5 A.M.', 'Greenhouse With the Hose On', 'Someone Vacuuming Upstairs', 'The Shop Before Opening'];
const SONGS = ['fold-it-up', 'gayageum-janggu', 'hard-gayageum-janggu', 'modular-jazz-hub', 'nightmarish-lo-fi', 'quite-the-throwdown', 'the-suspicious-menu', 'whos-sock-is-this'];
const BUILD1 = { 'radio-lofi': 'lofi', 'radio-rain': 'rain', 'radio-jazz': 'jazz', 'radio-tv': 'tv', 'radio-hold': 'hold', 'radio-resonarc': 'resonarc' };

// a no break space keeps "5 A.M." on one line on a 360 phone; it is still a space
const byName = new Map(radios.map((r) => [r.name.replace(/\u00a0/g, ' '), r]));
const eight = PLACES.map((n) => byName.get(n)).filter(Boolean);
ok(eight.length === 8, `the eight places are stations in the shop${eight.length < 8 ? ': missing ' + PLACES.filter((n) => !byName.has(n)).join(', ') : ''}`);
{
  const bad = eight.filter((r) => !(r.cost && r.cost.lint >= 150 && r.cost.lint <= 400 && Object.keys(r.cost).length === 1) || r.start);
  ok(eight.length === 8 && !bad.length, `each is bought with Lint alone${bad.length ? ': ' + bad.map((r) => r.name).join(', ') : ''}`);
}
{
  // each plays one of his songs, a different one each, from the music folder the site serves
  const bad = [], used = new Set();
  for (const r of eight) {
    const m = /^\/music\/v1\/tumble\/([a-z0-9-]+)\.mp3$/.exec(r.look.url || '');
    if (!m || !SONGS.includes(m[1])) { bad.push(`${r.name}: ${r.look.url}`); continue; }
    if (used.has(m[1])) bad.push(`${m[1]} twice`);
    used.add(m[1]);
    if (!r.look.song) bad.push(`${r.name} does not name its song`);
  }
  ok(eight.length === 8 && !bad.length && used.size === 8, `each station plays one of his eight songs, each song once (${[...used].length})${bad.length ? ': ' + bad.join('; ') : ''}`);
}
{
  // a bed of its own for when the file cannot play, and a station key of its own
  const keys = eight.map((r) => r.look.station);
  const noBed = eight.filter((r) => !STATION_BEDS.includes(r.look.station));
  const clash = keys.filter((k, i) => keys.indexOf(k) !== i || Object.values(BUILD1).includes(k));
  ok(eight.length === 8 && !noBed.length && !clash.length, `each station has a generated bed of its own for when the file cannot play${noBed.length ? ': NONE for ' + noBed.map((r) => r.name).join(', ') : ''}${clash.length ? ': shared keys ' + clash.join(', ') : ''}`);
}
{
  // Build 1's six are the stations they were: the same keys, no file, a bed each
  const bad = Object.entries(BUILD1).filter(([id, k]) => { const r = radios.find((x) => x.id === id); return !r || r.look.station !== k || r.look.url || !STATION_BEDS.includes(k); });
  ok(!bad.length, `Build 1's six stations are unchanged${bad.length ? ': ' + bad.map(([id]) => id).join(', ') : ''}`);
}

done();
