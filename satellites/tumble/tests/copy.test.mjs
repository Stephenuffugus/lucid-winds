// Copy and courtesy (DESIGN-T2 phase 0.4), and the studio copy laws over every shipped data file.
//
//   - the "Streak Wall Calendar" is the "Laundry Wall Calendar" (the game has no streak to lose, and the word
//     promises one). Its ITEM ID never changes: a save holds the id, not the name.
//   - remembering her last Load size and mood at the dryer door is not a reward, it is good manners, so
//     everybody gets it, and the Daily never overwrites either.
//   - no dashes and no exclamation points in anything a player reads (studio rule, law 11).
import { suite } from './lib.mjs';
import { readFileSync } from 'fs';
import { doorDefaults, rememberPick } from '../src/ui.js';

const { ok, done } = suite('copy');
const read = (f) => JSON.parse(readFileSync(new URL('../data/' + f, import.meta.url), 'utf8'));
const unlocks = read('unlocks.json');

// ---------- the calendar ----------
const cal = unlocks.items.find((i) => i.look && i.look.slot === 'calendar');
ok(!!cal && cal.name === 'Laundry Wall Calendar', `the wall calendar is called "${cal && cal.name}"`);
ok(!!cal && cal.id === 'decor-calendar-streak', `its id is untouched, so a save that owns it still owns it (${cal && cal.id})`);

// ---------- no player facing string promises a streak, takes a dash or shouts ----------
const SAY = new Set(['name', 'desc', 'flavor', 'label', 'title', 'text', 'who', 'body', 'lines', 'hint', 'note']);
const strings = [];
const walk = (o, path, file) => {
  if (Array.isArray(o)) return o.forEach((v, i) => walk(v, `${path}[${i}]`, file));
  if (o && typeof o === 'object') return Object.entries(o).forEach(([k, v]) => walk(v, `${path}.${k}`, file));
  if (typeof o !== 'string') return;
  const key = path.split('.').pop().replace(/\[\d+\]$/, '');
  if (SAY.has(key)) strings.push({ file, path, s: o });
};
for (const f of ['unlocks.json', 'clothesline.json', 'lore.json', 'hero-socks.json', 'finds.json']) walk(read(f), '', f);
ok(strings.length > 300, `${strings.length} player facing strings read from the shipped data`);

const hit = (re, where = () => true) => strings.filter((x) => where(x) && re.test(x.s)).map((x) => `${x.file}${x.path}: ${x.s.slice(0, 60)}`);
// Rush really does have a streak (DESIGN 4.2), so the Static peg's hint may say so. Nothing you BUY may: a thing
// on the wall that promises a streak promises something the cozy mode cannot lose, which is the point of the rename.
const streaky = hit(/streak/i, (x) => x.file === 'unlocks.json');
const dashed = hit(/[–—]|(?<=\w) - (?=\w)|\w--\w/);
const shouty = hit(/!/);
const some = (a) => (a.length ? ': ' + a.slice(0, 3).join(' | ') : '');
ok(streaky.length === 0, `nothing in the shop promises a streak (${streaky.length}${some(streaky)})`);
ok(dashed.length === 0, `no dashes in player copy (${dashed.length}${some(dashed)})`);
ok(shouty.length === 0, `no exclamation points in player copy (${shouty.length}${some(shouty)})`);

// ---------- the dryer door opens where she left it ----------
const ALL = ['small', 'regular', 'heavy', 'mountain'];
ok(doorDefaults({}, ['small']).size === 'small', 'a brand new player opens on Small, the only size she has');
ok(doorDefaults({ lastSize: 'heavy' }, ALL).size === 'heavy', 'her last size comes back');
ok(doorDefaults({ lastSize: 'mountain' }, ['small', 'regular']).size === 'regular', 'a size she has not unlocked falls back to her biggest');
ok(doorDefaults({}, []).size === 'small', 'with no sizes at all the door still offers Small, never undefined');
ok(doorDefaults({ lastMode: 'laundry' }, ALL, { rushOpen: true }).mode === 'laundry', 'Laundry Day stays Laundry Day');
ok(doorDefaults({ lastMode: 'rush', lastSub: 'balance' }, ALL, { rushOpen: true }).mode === 'rush', 'her last mood comes back: the Rush list opens on its own');
ok(doorDefaults({ lastMode: 'rush' }, ALL, { rushOpen: true }).sub === 'timed', 'Rush with no remembered variant opens on Timed');
ok(doorDefaults({ lastMode: 'rush', lastSub: 'balance' }, ALL, { rushOpen: true }).sub === 'balance', 'Basket Balance is remembered');
ok(doorDefaults({ lastMode: 'rush' }, ALL, { rushOpen: false }).mode === 'laundry', 'before Rush is open the door never opens on Rush');
ok(doorDefaults({ lastMode: 'rush', lastSub: 'daily' }, ALL, { rushOpen: true }).sub === 'timed', 'the Daily is never remembered as a mood (one try a day)');

// ---------- and what it writes down ----------
{
  const p = { lastSize: 'regular', lastMode: 'laundry', lastSub: 'timed' };
  rememberPick(p, { mode: 'rush', sub: 'balance', size: 'heavy' });
  ok(p.lastSize === 'heavy' && p.lastMode === 'rush' && p.lastSub === 'balance', 'starting a Load writes down her size and her mood');
  rememberPick(p, { mode: 'laundry', daily: true, size: 'regular' });
  ok(p.lastSize === 'heavy' && p.lastMode === 'rush', 'a Daily Laundry Day leaves her Heavy Rush alone');
  rememberPick(p, { mode: 'rush', sub: 'timed', daily: true, size: 'regular' });
  ok(p.lastSize === 'heavy' && p.lastSub === 'balance', 'a Daily Rush leaves it alone too');
  rememberPick(p, { mode: 'laundry', size: 'small' });
  ok(p.lastSize === 'small' && p.lastMode === 'laundry' && p.lastSub === 'balance', 'a real Load writes again, and the Rush variant is kept for next time');
}

done();
