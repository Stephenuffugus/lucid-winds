// THE SEARCHABLE DRAWER (DESIGN-T2 4.3): at 103 hero socks and a hundred ordinary ones, she finds a pack or the
// things she found lately with one tap. The rules live in src/drawerlist.js; the page is dev/shots-heroes.mjs.
import { suite } from './lib.mjs';
import { readFileSync } from 'fs';
import { drawerList, drawerPacks, packMissing, LATELY } from '../src/drawerlist.js';
import { seedFrom, decode } from '../engine/sockgen.js';

const { ok, done } = suite('drawer');
const cat = JSON.parse(readFileSync(new URL('../data/hero-socks.json', import.meta.url), 'utf8'));
const heroById = (id) => cat.heroes.find((h) => h.id === id) || null;

// a Drawer that has everything: every hero, then sixty ordinary designs, found one after another
let t = 1000;
const drawer = [
  ...cat.heroes.map((h) => ({ heroId: h.id, foundAt: t++, count: 1, odd: false })),
  ...Array.from({ length: 60 }, (_, i) => ({ sockSeed: seedFrom('drawer-' + i), foundAt: t++, count: 1, odd: i % 9 === 0 })),
];
const F = (o) => ({ show: 'all', sil: 'all', family: 'all', pack: 'all', ...o });

{
  const all = drawerList(drawer, F({}), heroById);
  ok(all.length === drawer.length && all[0].foundAt > all[all.length - 1].foundAt, `All is everything, newest first (${all.length})`);
  const lately = drawerList(drawer, F({ show: 'lately' }), heroById);
  ok(lately.length === LATELY && lately.every((d) => d.foundAt >= t - LATELY), `Found lately is the last ${LATELY} she folded away (${lately.length})`);
}
{
  const heroes = drawerList(drawer, F({ show: 'hero' }), heroById);
  ok(heroes.length === cat.heroes.length, `Heroes is every hero (${heroes.length})`);
  const found = drawerList(drawer, F({ show: 'hero', pack: 'found-1998' }), heroById);
  ok(found.length === 10 && found.every((d) => heroById(d.heroId).pack === 'found-1998'), `one tap on a pack shows that pack and only it (${found.length})`);
  const crew = drawerList(drawer, F({ show: 'hero', pack: 'found-1998', sil: '1' }), heroById);
  ok(crew.length >= 1 && crew.every((d) => heroById(d.heroId).silhouette === 'crew'), `and the shape row still narrows it (${crew.length} crew)`);
  // a pack chosen under Heroes must not quietly hide the rest of the Drawer when she goes back to All
  ok(drawerList(drawer, F({ show: 'all', pack: 'found-1998' }), heroById).length === drawer.length, 'a pack left chosen never hides anything outside Heroes');
  // and the pattern row is not shown under Heroes, so a pattern left chosen cannot empty it
  ok(drawerList(drawer, F({ show: 'hero', family: 'stripe' }), heroById).length === cat.heroes.length, 'a pattern left chosen does not empty Heroes');
}
{
  const fam = decode(drawer[drawer.length - 1].sockSeed).family;
  const byFam = drawerList(drawer, F({ family: fam }), heroById);
  ok(byFam.length >= 1 && byFam.every((d) => !d.heroId && decode(d.sockSeed).family === fam), `a pattern still narrows the ordinary socks (${byFam.length} ${fam})`);
  ok(drawerList(drawer, F({ show: 'odd' }), heroById).every((d) => d.odd), 'Missing a mate is only the odd ones');
}
{
  const packs = drawerPacks(drawer, heroById, cat.packs);
  ok(packs.length === cat.packs.length && packs.every((p) => p.n >= 1), `a chip for every pack she has socks from (${packs.length})`);
  ok(packs.map((p) => p.id).join() === cat.packs.map((p) => p.id).join(), 'in catalogue order, the free pack first');
  const few = drawerPacks(drawer.filter((d) => !d.heroId || heroById(d.heroId).pack === 'cursed'), heroById, cat.packs);
  ok(few.length === 1 && few[0].id === 'cursed' && few[0].n === 10, 'and none for a pack she has found nothing from');
  // a chip can say how many the pack holds, and the ones still to find are known by name
  const withTotal = drawerPacks(drawer, heroById, cat.packs, cat.heroes);
  ok(withTotal.every((p) => p.total === 10 || (p.id === 'impossible' && p.total === 0)), `each pack says it holds ten (${withTotal.map((p) => p.total).join(' ')})`);
  const some = drawer.filter((d) => !d.heroId || heroById(d.heroId).pack !== 'cursed' || ['hero_cursed_001', 'hero_cursed_002', 'hero_cursed_003'].includes(d.heroId));
  const miss = packMissing(some, cat.heroes, 'cursed');
  ok(miss.length === 7 && miss.every((h) => h.pack === 'cursed' && !['hero_cursed_001', 'hero_cursed_002', 'hero_cursed_003'].includes(h.id)), `with three Cursed socks found, seven are still to find (${miss.length})`);
  ok(packMissing(drawer, cat.heroes, 'cursed').length === 0, 'with all ten found, none');
}

done();
