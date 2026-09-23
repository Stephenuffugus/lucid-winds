// THE OPEN SUITCASE'S LID IS SOLID (Stephen, 23 Sep 2026): "that lid should almost work as a backboard for you to help
// you keep things in. So if it bounces off the lid it could bounce back in the basket ... Right now the socks just
// bounce through the lid. It doesn't seem to have any body." His call: a look that IS an advantage, the one exception
// to the round basket law, and a reason to want the suitcase. Any other basket with a lid gets the same.
import { suite } from './lib.mjs';
import { initPhysics, Physics, basketLid } from '../src/physics.js';
import { BASKET, SUITCASE_LID } from '../src/config.js';

const { ok, done } = suite('lid');
await initPhysics();

// a ball lobbed a little long, so that it would sail over the back rim of an open basket
function lob(P) {
  const id = 1;
  // flat and quick: it clears the back rim of an open basket by about 3 cm (tuned by hand, five lobs tried, all cleared)
  P.addBall(id, { pos: { x: BASKET.x, y: 0.26, z: BASKET.z + 0.22 }, vel: { x: 0, y: 0.9, z: -2.0 } });
  let hiZ = Infinity, lowY = Infinity;
  for (let i = 0; i < 240; i++) {
    P.step();
    const p = P.pose(id);
    hiZ = Math.min(hiZ, p.z);
    lowY = Math.min(lowY, p.y);
  }
  const p = P.pose(id);
  return { inBasket: P.inBasket(p), back: hiZ, end: p, lowY };
}

ok(basketLid({ style: 'suitcase' }) && basketLid({ style: 'suitcase' }).angle === SUITCASE_LID.angle, 'the Open Suitcase has a lid, at the angle the room draws it');
ok(basketLid({ style: 'wicker' }) === null && basketLid(null) === null, 'no other basket has one');

const open = lob(new Physics());
ok(!open.inBasket && open.back < BASKET.z - BASKET.radius, `the control: the same lob sails over an open basket's back rim (came to rest at z ${open.end.z.toFixed(3)}, basket back at ${(BASKET.z - BASKET.radius).toFixed(3)})`);

const lidded = lob(new Physics({ basketLid: basketLid({ style: 'suitcase' }) }));
ok(lidded.inBasket, `with the suitcase, the lid knocks it back in (came to rest at z ${lidded.end.z.toFixed(3)}, in the basket: ${lidded.inBasket})`);
ok(lidded.back > BASKET.z - BASKET.radius - 0.08, `the ball never passes through the lid (nearest the wall: z ${lidded.back.toFixed(3)})`);

// the lid stands BEHIND the rim, never over the opening: a ball dropped straight into the basket still goes in
{
  const P = new Physics({ basketLid: basketLid({ style: 'suitcase' }) });
  P.addBall(2, { pos: { x: BASKET.x, y: BASKET.height + 0.2, z: BASKET.z }, vel: { x: 0, y: 0, z: 0 } });
  for (let i = 0; i < 240; i++) P.step();
  ok(P.inBasket(P.pose(2)), 'a ball dropped straight in still lands: the lid is behind the rim, not over the opening');
}

done();
