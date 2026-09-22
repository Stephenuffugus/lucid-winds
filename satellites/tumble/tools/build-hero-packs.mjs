// DESIGN-T2 4.1: the five paid hero packs (the free one, Plant Parent Support Group, is tools/build-plant-pack.mjs).
// Names, flavor lines and designs come from the outside answers (GPT 1 wrote Pet Hair, Found in 1998 and Local
// Creature Report; GPT 2 wrote Office Kitchen Evidence and Cottage Chore Club), changed where they had to be:
//   · every pack spans all eight silhouettes (each answer left one or two out)
//   · law 10, no near misses: the tall pale figure between the trees is a STUMP that moved, and the good stapler
//     is grey (a red one is somebody's film prop)
//   · law 11, no dashes: "Three Toed Mud Print"
//   · a body colour moved where the emblem would have vanished into its own sock (a wooden rain barrel on blue,
//     a white snowbank on dusk, a cardboard box on something that is not cardboard)
// Every emblem sits where every other pack's does: the middle of the leg, or the top of the foot on a sock with no
// leg to speak of. The painter draws an emblem on BOTH faces by itself (u 0.25 and 0.75: the `u` in `at` is
// ignored unless the layer says `once`), so a sock shows its picture whichever way up it lands in the heap.
// Ten a pack: five common, three uncommon, two rare.   node tools/build-hero-packs.mjs
import { writeFileSync } from 'fs';
import { CUFFS } from '../engine/sockgen.js';

// ⛔ the painter's box takes HALF extents and its `round` grows it outward; this helper takes the FULL width and
// height a person means, so a box drawn 1.3 wide is 1.3 wide
const B = (w, h, o = {}) => ({ sdf: 'box', ...o, w: w / 2 - (o.round || 0), h: h / 2 - (o.round || 0) });
const C = (r, o = {}) => ({ sdf: 'circle', r, ...o });
const E = (a, b, o = {}) => ({ sdf: 'ellipse', a, b, ...o });
const S = (x1, y1, x2, y2, r, o = {}) => ({ sdf: 'seg', x1, y1, x2, y2, r, ...o });
const P = (pts, o = {}) => ({ sdf: 'poly', pts, ...o });
const M = (shape, scale, o = {}) => ({ sdf: 'motif', shape, scale, ...o });
// a ring, `width` thick, hollow: what is behind it shows through the middle
const R = (r, col, width, o = {}) => ({ sdf: 'ring', r, t: width / 2, color: col, ...o });
// a line through several points, as joined segments
const line = (pts, r, o = {}) => { const out = []; for (let i = 0; i + 3 < pts.length; i += 2) out.push(S(pts[i], pts[i + 1], pts[i + 2], pts[i + 3], r, o)); return out; };

// where an emblem goes on each silhouette (v along the tile): the middle of the leg, or the top of the foot when
// there is no leg. SIZE is the emblem's width in cm, one coordinate unit being half of it: about a face's width
// (half the circumference: crew 8.6, knee 9, dress 7, toe 9, ankle 8.2, slipper 11.8, baby 7.3), so a shape
// drawn out to +-0.9 fills the front of the sock.
const AT = { crew: 0.25, novelty: 0.25, knee: 0.3, dress: 0.27, toe: 0.22, ankle: 0.6, slipper: 0.6, baby: 0.63 };
const SIZE = { crew: 8, novelty: 8, knee: 10, dress: 7.4, toe: 8, ankle: 7.6, slipper: 10, baby: 5.6 };
// ⛔ the painter turns a shape about the EMBLEM's origin before it moves it (engine/sockgen.js shapeSDF), so a
// turned shape written at (x, y) would land somewhere else. This places its centre where it is written.
const placed = (shapes) => shapes.map((sh) => {
  if (!sh.rot) return sh;
  const c = Math.cos(sh.rot), s = Math.sin(sh.rot), x = sh.x || 0, y = sh.y || 0;
  return { ...sh, x: +(x * c + y * s).toFixed(4), y: +(-x * s + y * c).toFixed(4) };
});
const front = (sil, shapes0, o = {}) => {
  const shapes = placed(shapes0);
  const v = o.v !== undefined ? o.v : AT[sil], size = o.size || SIZE[sil];
  return [{ type: 'emblem', at: [0.75, v], size, shapes }];
};
const cuff = (name) => { const i = CUFFS.indexOf(name); if (i < 0) throw new Error('no cuff ' + name); return i; };

const PACKS = [];
let cur = null, n = 0;
const pack = (id, prefix, name, blurb) => { cur = { pack: { id, name, cost: 10, blurb }, heroes: [], prefix, file: id }; PACKS.push(cur); n = 0; };
const add = (name, silhouette, rarity, flavor, colors, look, layers) => {
  n++;
  cur.heroes.push({
    id: `hero_${cur.prefix}_${String(n).padStart(3, '0')}`,
    name, pack: cur.pack.id, silhouette, tile: 'proc', rarity, flavor,
    source: 'pack',
    spawnWeight: rarity === 'common' ? 1 : rarity === 'uncommon' ? 0.55 : 0.22,
    conditionAllowed: ['insideOut'],
    recipe: { colors, family: look.family || 'solid', ...(look.rhythm !== undefined ? { rhythm: look.rhythm } : {}), heelToe: look.heelToe !== undefined ? look.heelToe : 0, cuff: cuff(look.cuff || 'plain rib'), ...(look.motif ? { motif: look.motif } : {}), layers },
  });
};

// ======================================================================================================
pack('office-kitchen-evidence', 'office', 'Office Kitchen Evidence', 'Ten socks from the break room nobody owns and everybody has opinions about.');

add('Mug in the Sink Since Monday', 'crew', 'common', 'Nobody recognizes it. Everybody recognizes it.',
  { body: '#d7e1df', accent: '#6f9ca3', accent2: '#3f4d52', mug: '#6f9ca3', rim: '#4d7c84', sink: '#aeb7ba', ink: '#34424a' },
  { cuff: 'contrast rib', heelToe: 1 },
  front('crew', [
    E(0.98, 0.44, { y: 0.5, color: 'sink', edge: 'ink', edgeWidth: 0.06 }),
    R(0.3, 'mug', 0.14, { x: 0.5, y: -0.06 }),
    B(0.9, 1.04, { round: 0.12, x: -0.08, y: -0.08, color: 'mug', edge: 'ink', edgeWidth: 0.07 }),
    E(0.42, 0.09, { x: -0.08, y: -0.56, color: 'rim' }),
  ]));

add('Reply All at 4:58', 'ankle', 'common', 'Could have been tomorrow.',
  { body: '#edf0e9', accent: '#c9d2d8', accent2: '#45505a', paper: '#fbfaf5', red: '#c85b55', ink: '#45505a' },
  { family: 'stripe', rhythm: 1, cuff: 'plain rib' },
  front('ankle', [
    B(1.3, 0.86, { round: 0.06, y: 0.12, color: 'paper', edge: 'ink', edgeWidth: 0.07 }),
    ...line([-0.62, -0.28, 0, 0.18, 0.62, -0.28], 0.055, { color: 'ink' }),
    P([0.62, -0.98, 0.98, -0.56, 0.74, -0.56, 0.74, -0.18, 0.5, -0.18, 0.5, -0.56, 0.26, -0.56], { color: 'red', edge: 'ink', edgeWidth: 0.05 }),
  ]));

add("Someone's Yogurt, Ancient", 'slipper', 'common', 'The date has become a suggestion.',
  { body: '#d5e7d2', accent: '#bfd8bb', accent2: '#899b7a', cup: '#f6f3ea', lid: '#899b7a', mold: '#8c8a80', ink: '#556150' },
  { family: 'polka', rhythm: 1, cuff: 'dotted band' },
  front('slipper', [
    P([-0.56, -0.4, 0.56, -0.4, 0.42, 0.72, -0.42, 0.72], { color: 'cup', edge: 'ink', edgeWidth: 0.06 }),
    B(1.28, 0.2, { round: 0.06, y: -0.5, color: 'lid', edge: 'ink', edgeWidth: 0.06 }),
    C(0.13, { x: 0.12, y: 0.12, color: 'mold' }),
    C(0.06, { x: -0.16, y: 0.3, color: 'mold' }),
  ]));

add('The Good Stapler', 'dress', 'common', 'Lives in a drawer for its own protection.',
  { body: '#4e5663', accent: '#9aa1a8', accent2: '#2b3038', metal: '#c7cbcd', metal2: '#9ea4a8', ink: '#22262d' },
  { family: 'heelToe', heelToe: 3, cuff: 'wide band' },
  front('dress', [
    B(1.84, 0.36, { round: 0.12, y: 0.46, color: 'metal2', edge: 'ink', edgeWidth: 0.07 }),
    P([-0.92, 0.06, -0.8, -0.3, 0.7, -0.52, 0.92, -0.3, 0.92, 0.14, -0.92, 0.26], { color: 'metal', edge: 'ink', edgeWidth: 0.07 }),
    S(-0.6, -0.12, 0.6, -0.3, 0.035, { color: 'metal2' }),
    C(0.17, { x: 0.7, y: 0.22, color: 'ink' }),
    C(0.07, { x: 0.7, y: 0.22, color: 'metal' }),
  ]));

add('Conference Room Pretzels', 'baby', 'common', 'The bowl outlived the meeting.',
  { body: '#e8d3a8', accent: '#c9a56d', accent2: '#7b4f35', pretzel: '#8a5634', salt: '#fbf3e0' },
  { cuff: 'twin stripe' },
  front('baby', [
    R(0.36, 'pretzel', 0.2, { x: -0.36, y: -0.16 }),
    R(0.36, 'pretzel', 0.2, { x: 0.36, y: -0.16 }),
    S(-0.62, 0.36, 0.3, -0.34, 0.11, { color: 'pretzel' }),
    S(0.62, 0.36, -0.3, -0.34, 0.11, { color: 'pretzel' }),
    S(-0.62, 0.36, 0.62, 0.36, 0.11, { color: 'pretzel' }),
    C(0.06, { x: -0.52, y: -0.38, color: 'salt' }), C(0.06, { x: -0.18, y: -0.3, color: 'salt' }), C(0.06, { x: 0.22, y: -0.36, color: 'salt' }),
    C(0.06, { x: 0.52, y: -0.3, color: 'salt' }), C(0.06, { x: -0.2, y: 0.36, color: 'salt' }), C(0.06, { x: 0.3, y: 0.36, color: 'salt' }),
  ]));

add('Printer Says Paper Jam', 'knee', 'uncommon', 'There is no paper jam.',
  { body: '#c9ced1', accent: '#b4bbbf', accent2: '#7d858b', paper: '#fbf9f2', printer: '#7d858b', warn: '#e0a63c', ink: '#30353b' },
  { family: 'stripe', rhythm: 2, cuff: 'checker band' },
  front('knee', [
    B(1.04, 0.8, { y: -0.52, color: 'paper', edge: 'ink', edgeWidth: 0.05 }),
    S(-0.3, -0.62, 0.3, -0.62, 0.03, { color: 'printer' }), S(-0.3, -0.46, 0.2, -0.46, 0.03, { color: 'printer' }),
    B(1.8, 0.86, { round: 0.14, y: 0.16, color: 'printer', edge: 'ink', edgeWidth: 0.07 }),
    B(1.2, 0.1, { y: -0.18, color: 'ink' }),
    P([0.5, 0.18, 0.96, 0.98, 0.04, 0.98], { color: 'warn', edge: 'ink', edgeWidth: 0.05 }),
    S(0.5, 0.46, 0.5, 0.72, 0.06, { color: 'ink' }),
    C(0.06, { x: 0.5, y: 0.86, color: 'ink' }),
  ]));

add('Fridge Note in All Caps', 'novelty', 'uncommon', 'It is about the milk.',
  { body: '#e3e8e6', accent: '#cdd4d2', accent2: '#30343a', note: '#f2d860', ink: '#30343a', tape: '#dccaa0' },
  { cuff: 'contrast rib', heelToe: 2 },
  front('novelty', [
    B(1.3, 1.3, { round: 0.03, rot: -0.06, color: 'note', edge: 'ink', edgeWidth: 0.04 }),
    S(-0.44, -0.36, 0.44, -0.38, 0.075, { color: 'ink' }), S(-0.44, -0.12, 0.36, -0.14, 0.075, { color: 'ink' }),
    S(-0.44, 0.12, 0.44, 0.1, 0.075, { color: 'ink' }), S(-0.44, 0.36, 0.2, 0.34, 0.075, { color: 'ink' }),
    B(0.46, 0.16, { x: -0.5, y: -0.66, rot: -0.5, color: 'tape' }),
    B(0.46, 0.16, { x: 0.5, y: -0.66, rot: 0.5, color: 'tape' }),
  ]));

add('Desk Snack Emergency', 'toe', 'uncommon', 'Three almonds would have fixed everything.',
  { body: '#8e5f4a', accent: '#a47358', accent2: '#e7c469', bag: '#e0c060', crumb: '#f4e6c6', ink: '#4a2f22' },
  { family: 'gradient', cuff: 'triple stripe' },
  front('toe', [
    P([-0.62, -0.62, -0.42, -0.74, -0.2, -0.6, 0, -0.74, 0.2, -0.6, 0.42, -0.74, 0.62, -0.62, 0.52, 0.62, -0.52, 0.62], { color: 'bag', edge: 'ink', edgeWidth: 0.06 }),
    S(-0.3, -0.2, 0.3, -0.24, 0.05, { color: 'ink' }),
    C(0.1, { x: 0.78, y: 0.5, color: 'crumb' }), C(0.08, { x: 0.9, y: 0.74, color: 'crumb' }), C(0.07, { x: 0.68, y: 0.82, color: 'crumb' }),
  ]));

add('Calendar Invite: Mysterious', 'dress', 'rare', 'Accepted by twelve people. Understood by none.',
  { body: '#5d7693', accent: '#6a83a0', accent2: '#4d6481', white: '#f6f2e8', green: '#5f9a6c', red: '#c85f5c', ink: '#2c3a4c' },
  { family: 'plaid', rhythm: 1, cuff: 'wide band' },
  front('dress', [
    B(1.3, 1.2, { round: 0.08, y: 0.08, color: 'white', edge: 'ink', edgeWidth: 0.06 }),
    B(1.3, 0.3, { y: -0.4, color: 'red' }),
    C(0.08, { x: -0.36, y: -0.56, color: 'ink' }), C(0.08, { x: 0.36, y: -0.56, color: 'ink' }),
    ...line([-0.46, 0.14, -0.28, 0.34, 0.02, -0.04], 0.07, { color: 'green' }),
    ...line([0.2, -0.02, 0.28, -0.14, 0.44, -0.16, 0.54, -0.06, 0.46, 0.08, 0.4, 0.2], 0.06, { color: 'red' }),
    C(0.06, { x: 0.4, y: 0.38, color: 'red' }),
  ]));

add('The Refrigerator Lunch Heist', 'knee', 'rare', 'The container was clearly labeled.',
  { body: '#5b3440', accent: '#683c49', accent2: '#2e1a20', box: '#dccdab', lid: '#b6a37a', label: '#f7f2e8', red: '#d8574f', ink: '#2e1a20' },
  { cuff: 'checker band', heelToe: 1 },
  front('knee', [
    B(1.76, 1.06, { round: 0.14, y: 0.3, color: 'box', edge: 'ink', edgeWidth: 0.07 }),
    B(1.86, 0.28, { round: 0.1, y: -0.28, color: 'lid', edge: 'ink', edgeWidth: 0.06 }),
    B(1.04, 0.5, { y: 0.34, color: 'label', edge: 'ink', edgeWidth: 0.04 }),
    S(-0.36, 0.24, 0.36, 0.24, 0.045, { color: 'ink' }), S(-0.36, 0.44, 0.16, 0.44, 0.045, { color: 'ink' }),
    E(0.36, 0.22, { x: -0.3, y: -0.72, color: 'red', edge: 'ink', edgeWidth: 0.05 }),
    E(0.36, 0.22, { x: 0.3, y: -0.72, color: 'red', edge: 'ink', edgeWidth: 0.05 }),
    C(0.08, { x: -0.3, y: -0.72, color: 'ink' }), C(0.08, { x: 0.3, y: -0.72, color: 'ink' }),
  ]));

// ======================================================================================================
pack('cottage-chore-club', 'cottage', 'Cottage Chore Club', 'Ten small domestic victories, and a broom with one good corner.');

add('Sheets on the Line', 'knee', 'common', 'Smells like wind and one clothespin.',
  { body: '#9dbfcb', accent: '#90b4c1', accent2: '#5d5a52', sheet: '#fcf9f1', pin: '#9a6a36', line: '#4f4c45', ink: '#4a6670' },
  { family: 'stripe', rhythm: 0, cuff: 'plain rib' },
  front('knee', [
    ...line([-1, -0.8, -0.3, -0.7, 0.4, -0.7, 1, -0.8], 0.045, { color: 'line' }),
    B(0.86, 1.46, { x: -0.48, y: 0.02, rot: 0.04, color: 'sheet', edge: 'ink', edgeWidth: 0.05 }),
    B(0.86, 1.2, { x: 0.46, y: -0.1, rot: -0.05, color: 'sheet', edge: 'ink', edgeWidth: 0.05 }),
    B(0.12, 0.28, { x: -0.82, y: -0.76, color: 'pin' }), B(0.12, 0.28, { x: -0.12, y: -0.7, color: 'pin' }), B(0.12, 0.28, { x: 0.84, y: -0.76, color: 'pin' }),
  ]));

add('Jam Jar Lid', 'ankle', 'common', 'Sticky around the edge, spiritually.',
  { body: '#c24f55', accent: '#a9434a', accent2: '#8b4051', jar: '#f1e4cf', fruit: '#8b3048', lid: '#f7efe4', check: '#d65c62', ink: '#5c2330' },
  { family: 'polka', rhythm: 2, cuff: 'scalloped' },
  front('ankle', [
    B(1.0, 0.94, { round: 0.18, y: 0.26, color: 'jar', edge: 'ink', edgeWidth: 0.06 }),
    C(0.12, { x: -0.22, y: 0.3, color: 'fruit' }), C(0.1, { x: 0.18, y: 0.42, color: 'fruit' }), C(0.09, { x: 0.12, y: 0.12, color: 'fruit' }),
    E(0.72, 0.28, { y: -0.36, color: 'lid', edge: 'ink', edgeWidth: 0.06 }),
    B(0.22, 0.14, { x: -0.36, y: -0.36, color: 'check' }), B(0.22, 0.14, { x: 0, y: -0.36, color: 'check' }), B(0.22, 0.14, { x: 0.36, y: -0.36, color: 'check' }),
  ]));

add('Mended Elbow Energy', 'crew', 'common', 'The patch is stronger than the original plan.',
  { body: '#8b806e', accent: '#7c7262', accent2: '#6d6454', patch: '#c98e62', thread: '#f1e6cf', ink: '#4d4336' },
  { family: 'plaid', rhythm: 1, cuff: 'contrast rib' },
  front('crew', [
    B(1.3, 1.06, { round: 0.2, rot: 0.08, color: 'patch', edge: 'ink', edgeWidth: 0.05 }),
    ...[-0.46, -0.16, 0.14, 0.44].map((x) => S(x, -0.62, x + 0.1, -0.44, 0.04, { color: 'thread' })),
    ...[-0.44, -0.14, 0.16, 0.46].map((x) => S(x, 0.46, x + 0.1, 0.64, 0.04, { color: 'thread' })),
    ...[-0.24, 0.12].map((y) => S(-0.72, y, -0.54, y + 0.1, 0.04, { color: 'thread' })),
    ...[-0.2, 0.16].map((y) => S(0.56, y, 0.74, y + 0.1, 0.04, { color: 'thread' })),
  ]));

add('Bread Cooling by the Window', 'slipper', 'common', 'Touching it early remains under consideration.',
  { body: '#e2c28c', accent: '#d9b278', accent2: '#b87846', loaf: '#b87846', crust: '#8a5430', steam: '#fbf6ec', ink: '#6e4222' },
  { family: 'gradient', cuff: 'wide band' },
  front('slipper', [
    E(0.92, 0.52, { y: 0.2, color: 'loaf', edge: 'ink', edgeWidth: 0.06 }),
    B(1.9, 0.3, { y: 0.62, color: 'body' }),
    S(-0.5, 0.0, -0.3, 0.3, 0.05, { color: 'crust' }), S(-0.1, -0.08, 0.1, 0.3, 0.05, { color: 'crust' }), S(0.3, 0.0, 0.5, 0.3, 0.05, { color: 'crust' }),
    ...line([-0.26, -0.44, -0.36, -0.6, -0.22, -0.78, -0.3, -0.94], 0.045, { color: 'steam' }),
    ...line([0.2, -0.44, 0.1, -0.6, 0.24, -0.78, 0.16, -0.94], 0.045, { color: 'steam' }),
  ]));

add('Herb Bundle Upside Down', 'dress', 'common', 'Drying with excellent posture.',
  { body: '#d6c294', accent: '#c9b482', accent2: '#8a6f45', leaf: '#6f8f4a', twine: '#a57a48', stem: '#3c4b33', ink: '#33412b' },
  { cuff: 'twin stripe', heelToe: 1 },
  front('dress', [
    ...line([-0.95, -0.92, 0, -0.8, 0.95, -0.92], 0.05, { color: 'twine' }),
    S(-0.3, -0.72, -0.5, 0.3, 0.05, { color: 'stem' }), S(0, -0.72, 0, 0.5, 0.05, { color: 'stem' }), S(0.3, -0.72, 0.5, 0.3, 0.05, { color: 'stem' }),
    B(0.7, 0.2, { y: -0.72, color: 'twine', edge: 'ink', edgeWidth: 0.04 }),
    M('leaf', 0.44, { x: -0.5, y: 0.46, rot: 3.3, color: 'leaf', edge: 'ink', edgeWidth: 0.07 }),
    M('leaf', 0.5, { x: 0, y: 0.66, rot: 3.14, color: 'leaf', edge: 'ink', edgeWidth: 0.07 }),
    M('leaf', 0.44, { x: 0.5, y: 0.46, rot: 2.98, color: 'leaf', edge: 'ink', edgeWidth: 0.07 }),
    M('leaf', 0.32, { x: -0.3, y: -0.1, rot: 2.6, color: 'leaf', edge: 'ink', edgeWidth: 0.07 }),
    M('leaf', 0.32, { x: 0.3, y: -0.04, rot: 3.7, color: 'leaf', edge: 'ink', edgeWidth: 0.07 }),
  ]));

add('Mushroom Basket, No Guarantees', 'crew', 'uncommon', 'Identifications remain a group project.',
  { body: '#c9b692', accent: '#b7a17f', accent2: '#8e6847', basket: '#8e6847', weave: '#6f4f33', cap: '#c86f55', cap2: '#e8b35c', stem: '#f3ead6', ink: '#4f3a28' },
  { cuff: 'checker band', heelToe: 2 },
  front('crew', [
    M('mushroom', 0.34, { x: -0.44, y: -0.3, color: 'cap', edge: 'ink', edgeWidth: 0.1 }),
    M('mushroom', 0.4, { x: 0.02, y: -0.44, color: 'cap2', edge: 'ink', edgeWidth: 0.1 }),
    M('mushroom', 0.32, { x: 0.46, y: -0.28, color: 'cap', edge: 'ink', edgeWidth: 0.1 }),
    P([-0.92, -0.06, 0.92, -0.06, 0.66, 0.74, -0.66, 0.74], { color: 'basket', edge: 'ink', edgeWidth: 0.06 }),
    S(-0.8, 0.2, 0.8, 0.2, 0.035, { color: 'weave' }), S(-0.72, 0.46, 0.72, 0.46, 0.035, { color: 'weave' }),
    S(-0.3, -0.06, -0.24, 0.72, 0.035, { color: 'weave' }), S(0.3, -0.06, 0.24, 0.72, 0.035, { color: 'weave' }),
  ]));

add('Rain Barrel Full', 'baby', 'uncommon', 'We asked for rain. It overachieved.',
  { body: '#8fb0bd', accent: '#7c9eab', accent2: '#465e66', barrel: '#8a6346', band: '#3f3a36', water: '#bfe0e8', ink: '#2f2a26' },
  { family: 'stripe', rhythm: 1, cuff: 'wide band' },
  front('baby', [
    B(1.1, 1.3, { round: 0.2, y: 0.08, color: 'barrel', edge: 'ink', edgeWidth: 0.06 }),
    S(-0.52, -0.3, 0.52, -0.3, 0.06, { color: 'band' }), S(-0.55, 0.12, 0.55, 0.12, 0.06, { color: 'band' }), S(-0.52, 0.52, 0.52, 0.52, 0.06, { color: 'band' }),
    E(0.5, 0.13, { y: -0.56, color: 'water', edge: 'ink', edgeWidth: 0.05 }),
  ]));

add('The Good Mending Scissors', 'toe', 'uncommon', 'Not for paper. This remains important.',
  { body: '#7e5c68', accent: '#8e6a77', accent2: '#e0b060', steel: '#d6d5ce', thread: '#e8b95c', ink: '#3a2c31' },
  { family: 'heelToe', heelToe: 3, cuff: 'dotted band' },
  front('toe', [
    S(-0.28, 0.2, 0.34, -0.9, 0.08, { color: 'steel', edge: 'ink', edgeWidth: 0.03 }),
    S(0.28, 0.2, -0.34, -0.9, 0.08, { color: 'steel', edge: 'ink', edgeWidth: 0.03 }),
    R(0.24, 'steel', 0.1, { x: -0.36, y: 0.46 }),
    R(0.24, 'steel', 0.1, { x: 0.36, y: 0.46 }),
    C(0.05, { y: 0.04, color: 'ink' }),
    ...line([0.62, 0.1, 0.84, -0.02, 0.9, 0.2, 0.72, 0.3, 0.7, 0.12], 0.035, { color: 'thread' }),
  ]));

add('Porch Broom With One Good Corner', 'novelty', 'rare', 'The other corner retired last spring.',
  { body: '#9a7254', accent: '#8a6448', accent2: '#65705f', straw: '#dcb96e', straw2: '#b9964e', handle: '#65705f', band: '#a0483a', ink: '#4a3626' },
  { family: 'stripe', rhythm: 3, cuff: 'scalloped' },
  front('novelty', [
    S(-0.3, -0.98, 0.0, 0.0, 0.1, { color: 'handle', edge: 'ink', edgeWidth: 0.03 }),
    P([-0.3, -0.04, 0.34, -0.1, 0.92, 0.9, 0.34, 0.98, -0.06, 0.92, -0.8, 0.66], { color: 'straw', edge: 'ink', edgeWidth: 0.05 }),
    S(-0.3, 0.3, 0.5, 0.22, 0.04, { color: 'straw2' }), S(-0.5, 0.56, 0.7, 0.5, 0.04, { color: 'straw2' }),
    B(0.72, 0.16, { x: 0.02, y: 0.02, rot: -0.08, color: 'band' }),
  ]));

add('The Lantern Walk Home', 'knee', 'rare', 'The path knows you by now.',
  { body: '#293b42', accent: '#324851', accent2: '#1d2b30', glow: '#4e5a48', glow2: '#8a7d4c', lamp: '#f0c45e', frame: '#1a2226', path: '#a8977a', ink: '#141c20' },
  { family: 'gradient', cuff: 'triple stripe' },
  front('knee', [
    C(0.8, { y: -0.3, color: 'glow' }),
    C(0.56, { y: -0.3, color: 'glow2' }),
    R(0.18, 'frame', 0.07, { y: -0.92 }),
    B(0.74, 0.92, { round: 0.12, y: -0.3, color: 'lamp', edge: 'frame', edgeWidth: 0.09 }),
    S(0, -0.74, 0, 0.14, 0.04, { color: 'frame' }),
    ...line([-0.1, 0.4, 0.6, 0.6, -0.4, 0.8, 0.3, 0.98], 0.13, { color: 'path' }),
  ]));

// ======================================================================================================
pack('pet-hair-fiber', 'pet', 'Pet Hair Counts as Fiber', 'Ten socks the household pets contributed to without being asked.');

add('Orange Cat at 3 A.M.', 'crew', 'common', 'Has a meeting in the hallway. Attendance required.',
  { body: '#f1d09a', accent: '#e8c087', accent2: '#273043', night: '#273043', cat: '#e07830', eye: '#f7dc4e', ink: '#171c28' },
  { cuff: 'contrast rib', heelToe: 2 },
  front('crew', [
    B(1.1, 1.6, { round: 0.5, y: 0.02, color: 'night' }),
    E(0.36, 0.5, { y: 0.36, color: 'cat' }),
    M('cat', 0.42, { y: -0.3, color: 'cat' }),
    C(0.08, { x: -0.15, y: -0.3, color: 'eye' }), C(0.08, { x: 0.15, y: -0.3, color: 'eye' }),
    ...line([0.3, 0.7, 0.52, 0.56, 0.5, 0.3], 0.07, { color: 'cat' }),
  ]));

add('Dog Waiting by the Door', 'ankle', 'common', 'Heard a car. Could be yours. Probably yours.',
  { body: '#e0d1ba', accent: '#d9c7ad', accent2: '#6b8f71', door: '#6b8f71', knob: '#e8c46a', dog: '#7a5238', collar: '#d0474a', ink: '#3e2a1d' },
  { family: 'heelToe', heelToe: 3, cuff: 'plain rib' },
  front('ankle', [
    B(0.72, 1.6, { round: 0.1, x: 0.5, y: -0.1, color: 'door', edge: 'ink', edgeWidth: 0.05 }),
    C(0.07, { x: 0.3, y: 0.0, color: 'knob' }),
    E(0.38, 0.46, { x: -0.36, y: 0.4, color: 'dog' }),
    C(0.3, { x: -0.3, y: -0.2, color: 'dog' }),
    E(0.12, 0.24, { x: -0.56, y: -0.14, rot: 0.3, color: 'ink' }),
    E(0.12, 0.09, { x: -0.02, y: -0.12, color: 'dog' }),
    C(0.05, { x: 0.08, y: -0.14, color: 'ink' }),
    C(0.045, { x: -0.22, y: -0.28, color: 'ink' }),
    S(-0.54, 0.06, -0.1, 0.08, 0.06, { color: 'collar' }),
    S(-0.72, 0.7, -0.96, 0.54, 0.07, { color: 'dog' }),
  ]));

add('Fur on Fresh Laundry', 'baby', 'common', 'Arrived before the folding was finished.',
  { body: '#22252a', accent: '#2b2f35', accent2: '#b7a58e', fur: '#f3e7d2', fur2: '#b7a58e' },
  { cuff: 'plain rib' },
  [{ type: 'motif', size: 2.0, from: 0.1, to: 0.96, cols: 2, shapes: [
    S(-0.55, -0.42, -0.08, -0.2, 0.065, { color: 'fur' }),
    S(0.18, 0.08, 0.66, 0.0, 0.06, { color: 'fur2' }),
    S(-0.32, 0.5, 0.08, 0.7, 0.06, { color: 'fur' }),
  ] }]);

add('Rabbit With One Forbidden Cord', 'crew', 'common', 'Was told no. Heard maybe.',
  { body: '#e2b3a8', accent: '#d6a398', accent2: '#252525', rabbit: '#fdfbf7', cord: '#252525', warn: '#b8322a', ink: '#7a5a52' },
  { cuff: 'twin stripe' },
  front('crew', [
    ...line([0.4, 0.9, 0.62, 0.52, 0.94, 0.66, 0.84, 0.28], 0.06, { color: 'cord' }),
    E(0.12, 0.42, { x: -0.3, y: -0.58, rot: -0.2, color: 'rabbit', edge: 'ink', edgeWidth: 0.05 }),
    E(0.12, 0.42, { x: 0.02, y: -0.6, rot: 0.2, color: 'rabbit', edge: 'ink', edgeWidth: 0.05 }),
    E(0.5, 0.38, { x: -0.08, y: 0.42, color: 'rabbit', edge: 'ink', edgeWidth: 0.05 }),
    C(0.32, { x: -0.14, y: -0.06, color: 'rabbit', edge: 'ink', edgeWidth: 0.05 }),
    C(0.05, { x: -0.24, y: -0.1, color: 'ink' }),
    S(0.84, -0.62, 0.84, -0.36, 0.05, { color: 'warn' }), C(0.05, { x: 0.84, y: -0.22, color: 'warn' }),
  ]));

add('Aquarium Gravel Collector', 'toe', 'common', 'Carries three pebbles home every single time.',
  { body: '#5ca3a8', accent: '#4f9297', accent2: '#e8f7f6', fish: '#f3a44a', gravel: '#756b5a', gravel2: '#9a8e75', bubble: '#e8f7f6', ink: '#2c4f52' },
  { family: 'gradient', cuff: 'contrast rib' },
  front('toe', [
    M('fish', 0.5, { y: -0.2, color: 'fish', edge: 'ink', edgeWidth: 0.08 }),
    C(0.05, { x: -0.28, y: -0.28, color: 'ink' }),
    C(0.22, { x: -0.4, y: 0.62, color: 'gravel' }), C(0.2, { x: 0.02, y: 0.66, color: 'gravel2' }), C(0.22, { x: 0.42, y: 0.62, color: 'gravel' }),
    R(0.09, 'bubble', 0.04, { x: 0.5, y: -0.62 }), R(0.07, 'bubble', 0.04, { x: 0.66, y: -0.86 }), R(0.06, 'bubble', 0.04, { x: 0.44, y: -0.94 }),
  ]));

add('The Paw on Your Face', 'slipper', 'uncommon', 'Personal space was reviewed and declined.',
  { body: '#efe5d5', accent: '#e3d6c2', accent2: '#7f6b5f', paw: '#7f6b5f', toe: '#e2a0a0', ink: '#4e4038' },
  { cuff: 'wide band', heelToe: 2 },
  front('slipper', [
    M('paw', 0.86, { color: 'paw' }),
    E(0.3, 0.2, { y: -0.28, color: 'toe' }),
    C(0.1, { x: 0.55, y: 0.1, color: 'toe' }), C(0.1, { x: 0.22, y: 0.43, color: 'toe' }),
    C(0.1, { x: -0.22, y: 0.43, color: 'toe' }), C(0.1, { x: -0.55, y: 0.1, color: 'toe' }),
  ], { size: 10 }));

add('Cat in the Empty Box', 'novelty', 'uncommon', 'The box became occupied before it became empty.',
  { body: '#4f6a7a', accent: '#5b7888', accent2: '#3f5866', box: '#c28a52', flap: '#d9a468', cat: '#2b282e', eye: '#f0d04e', ink: '#3a2716' },
  { family: 'plaid', rhythm: 1, cuff: 'checker band' },
  front('novelty', [
    M('cat', 0.44, { y: -0.3, color: 'cat' }),
    C(0.08, { x: -0.16, y: -0.26, color: 'eye' }), C(0.08, { x: 0.16, y: -0.26, color: 'eye' }),
    B(1.36, 0.9, { y: 0.44, color: 'box', edge: 'ink', edgeWidth: 0.06 }),
    P([-0.68, 0.0, -0.98, -0.4, -0.6, -0.34, -0.3, 0.0], { color: 'flap', edge: 'ink', edgeWidth: 0.05 }),
    P([0.68, 0.0, 0.98, -0.4, 0.6, -0.34, 0.3, 0.0], { color: 'flap', edge: 'ink', edgeWidth: 0.05 }),
  ]));

add('Bird Watching You Back', 'dress', 'uncommon', 'Has logged you in a very small notebook.',
  { body: '#bfd6c2', accent: '#aac8ae', accent2: '#795b42', bird: '#385b53', eye: '#f7d35e', branch: '#795b42', ink: '#1d2b27' },
  { cuff: 'twin stripe', heelToe: 2 },
  front('dress', [
    S(-0.98, 0.66, 0.98, 0.54, 0.09, { color: 'branch' }),
    S(0.5, 0.58, 0.8, 0.84, 0.05, { color: 'branch' }),
    M('bird', 0.92, { y: 0.0, color: 'bird' }),
    C(0.22, { x: -0.42, y: -0.26, color: 'eye', edge: 'ink', edgeWidth: 0.05 }),
    C(0.09, { x: -0.42, y: -0.26, color: 'ink' }),
  ]));

add('The Good Blanket Spot', 'slipper', 'rare', 'Warm. Indented. Currently unavailable.',
  { body: '#7d657f', accent: '#6f5872', accent2: '#cdb4d6', blanket: '#dcc8e3', fold: '#b79fc2', pet: '#3f2c38', ink: '#3a2833' },
  { family: 'chevron', rhythm: 1, cuff: 'scalloped' },
  front('slipper', [
    E(0.98, 0.46, { y: 0.44, color: 'blanket', edge: 'ink', edgeWidth: 0.05 }),
    ...line([-0.9, 0.56, -0.5, 0.46, -0.1, 0.56, 0.3, 0.46, 0.7, 0.56], 0.035, { color: 'fold' }),
    E(0.62, 0.34, { x: 0.12, y: 0.06, color: 'pet' }),
    C(0.28, { x: -0.5, y: -0.06, color: 'pet' }),
    P([-0.74, -0.18, -0.7, -0.52, -0.52, -0.28], { color: 'pet' }), P([-0.46, -0.3, -0.3, -0.54, -0.28, -0.2], { color: 'pet' }),
    S(-0.62, -0.04, -0.52, -0.02, 0.025, { color: 'blanket' }), S(-0.42, -0.02, -0.32, -0.04, 0.025, { color: 'blanket' }),
    ...line([0.72, 0.1, 0.62, 0.36, 0.2, 0.42, -0.24, 0.3], 0.07, { color: 'pet' }),
  ]));

add('One White Hair', 'knee', 'rare', 'There is always exactly one.',
  { body: '#15171b', accent: '#1d2025', accent2: '#fffdf8', hair: '#fffdf8' },
  { cuff: 'plain rib' },
  [{ type: 'emblem', at: [0.75, 0.34], size: 30, shapes: line([0.02, -0.9, 0.12, -0.5, 0.06, -0.1, -0.08, 0.3, -0.04, 0.62, 0.1, 0.86], 0.012, { color: 'hair' }) }]);

// ======================================================================================================
pack('found-1998', 'y1998', 'Found in 1998', 'Ten socks from the era of translucent plastic and very confident carpet.');

add('Translucent Phone Cord', 'knee', 'common', 'Reached every room and tangled in all of them.',
  { body: '#b3ddd8', accent: '#a0d1cb', accent2: '#3e6f7c', cord: '#2f7894', phone: '#eefaf8', ink: '#245463' },
  { family: 'stripe', rhythm: 0, cuff: 'contrast rib' },
  front('knee', [
    ...[-0.46, -0.24, -0.02, 0.2, 0.42, 0.64, 0.86].map((y, i) => R(0.2, 'cord', 0.08, { x: i % 2 ? 0.1 : -0.1, y })),
    B(0.56, 0.5, { round: 0.18, x: -0.46, y: -0.74, color: 'phone', edge: 'ink', edgeWidth: 0.06 }),
    B(0.56, 0.5, { round: 0.18, x: 0.46, y: -0.74, color: 'phone', edge: 'ink', edgeWidth: 0.06 }),
    B(1.3, 0.22, { round: 0.1, y: -0.9, color: 'phone', edge: 'ink', edgeWidth: 0.06 }),
  ]));

add('Mix Disc, Untitled', 'crew', 'common', 'Track seven was the entire reason.',
  { body: '#d6cce6', accent: '#c6badb', accent2: '#3d4147', disc: '#e3eaf2', rainbow: '#e0a05a', rainbow2: '#9ac6a0', marker: '#34383e', hole: '#d6cce6', ink: '#55506a' },
  { cuff: 'twin stripe', heelToe: 1 },
  front('crew', [
    C(0.92, { color: 'disc', edge: 'ink', edgeWidth: 0.05 }),
    P([0, 0, 0.66, -0.64, 0.86, -0.3], { color: 'rainbow' }),
    P([0, 0, 0.86, -0.3, 0.92, 0.02], { color: 'rainbow2' }),
    R(0.24, 'ink', 0.05),
    C(0.1, { color: 'hole' }),
    ...line([-0.66, 0.36, -0.52, 0.28, -0.4, 0.42, -0.26, 0.3, -0.1, 0.44], 0.04, { color: 'marker' }),
    S(-0.6, 0.6, 0.1, 0.62, 0.035, { color: 'marker' }),
  ]));

add('Glow Stars on the Ceiling', 'dress', 'common', 'Three are still up there somehow.',
  { body: '#28324e', accent: '#2f3a58', accent2: '#c9e85b', star: '#c9e85b', star2: '#e8f7a8' },
  { cuff: 'plain rib' },
  [{ type: 'motif', size: 2.2, from: 0.1, to: 0.94, cols: 2, shapes: [M('star', 0.5, { color: 'star' }), M('star', 0.22, { x: 0.8, y: 0.7, color: 'star' })] },
   { type: 'emblem', at: [0.75, 0.13], size: 3.4, shapes: [M('star', 0.6, { x: -0.6, color: 'star2' }), M('star', 0.5, { x: 0.6, y: 0.2, color: 'star2' }), M('star', 0.4, { y: -0.3, color: 'star2' })] }]);

add('Gel Pen Constellation', 'ankle', 'common', 'The notebook margin was the main assignment.',
  { body: '#42365f', accent: '#4b3e6b', accent2: '#d9dbe2', pink: '#f37fb1', aqua: '#6fd6d4', silver: '#d9dbe2' },
  { family: 'polka', rhythm: 0, cuff: 'dotted band' },
  front('ankle', [
    ...line([-0.8, 0.4, -0.3, -0.2, 0.2, 0.1, 0.62, -0.5], 0.03, { color: 'silver' }),
    S(0.2, 0.1, 0.5, 0.6, 0.03, { color: 'silver' }),
    C(0.14, { x: -0.8, y: 0.4, color: 'pink' }), C(0.14, { x: -0.3, y: -0.2, color: 'aqua' }), C(0.16, { x: 0.2, y: 0.1, color: 'pink' }),
    C(0.13, { x: 0.62, y: -0.5, color: 'aqua' }), C(0.12, { x: 0.5, y: 0.6, color: 'aqua' }),
  ]));

add('Roller Rink Carpet', 'toe', 'common', 'Designed to hide everything except joy.',
  { body: '#25213f', accent: '#2d2850', accent2: '#e8d650', cyan: '#45c8d2', magenta: '#e0629f', yellow: '#eed85a' },
  { cuff: 'checker band' },
  [{ type: 'motif', size: 2.6, from: 0.1, to: 0.96, cols: 3, shapes: [
    ...line([-0.7, -0.4, -0.4, -0.7, -0.1, -0.4, 0.2, -0.7], 0.08, { color: 'cyan' }),
    P([0.3, 0.1, 0.8, 0.3, 0.4, 0.62], { color: 'magenta' }),
    C(0.16, { x: -0.4, y: 0.4, color: 'yellow' }),
  ] }]);

add('Inflatable Chair Static', 'slipper', 'uncommon', 'Sat once. Stood up carrying the room.',
  { body: '#cbe4f1', accent: '#b9d9ea', accent2: '#3f6f8a', chair: '#3f88b8', chair2: '#6aa9d0', static: '#e8a820', ink: '#1d4763' },
  { cuff: 'wide band', heelToe: 3 },
  front('slipper', [
    E(0.5, 0.56, { y: -0.3, color: 'chair2', edge: 'ink', edgeWidth: 0.06 }),
    E(0.3, 0.52, { x: -0.62, y: 0.2, color: 'chair', edge: 'ink', edgeWidth: 0.06 }),
    E(0.3, 0.52, { x: 0.62, y: 0.2, color: 'chair', edge: 'ink', edgeWidth: 0.06 }),
    E(0.62, 0.3, { y: 0.42, color: 'chair', edge: 'ink', edgeWidth: 0.06 }),
    ...line([-0.98, -0.7, -0.84, -0.84, -0.74, -0.66, -0.6, -0.82], 0.035, { color: 'static' }),
    ...line([0.6, -0.82, 0.74, -0.66, 0.84, -0.84, 0.98, -0.7], 0.035, { color: 'static' }),
  ]));

add('Cassette Rewound With Pencil', 'knee', 'uncommon', 'The pencil knew its assignment.',
  { body: '#d8c8ad', accent: '#cbb99c', accent2: '#8d7a5c', tape: '#3f3f44', label: '#f4e8c6', reel: '#d8c8ad', pencil: '#e2b24f', lead: '#2b2b2b', eraser: '#e38f95', ink: '#1d1d21' },
  { family: 'plaid', rhythm: 0, cuff: 'triple stripe' },
  front('knee', [
    B(1.9, 1.2, { round: 0.12, color: 'tape', edge: 'ink', edgeWidth: 0.06 }),
    B(1.56, 0.42, { y: -0.24, color: 'label' }),
    S(-0.6, -0.3, 0.3, -0.3, 0.035, { color: 'tape' }),
    R(0.21, 'label', 0.08, { x: -0.46, y: 0.24 }), R(0.21, 'label', 0.08, { x: 0.46, y: 0.24 }),
    S(-0.96, 0.96, 0.46, -0.12, 0.09, { color: 'pencil', edge: 'ink', edgeWidth: 0.02 }),
    S(0.46, -0.12, 0.6, -0.24, 0.05, { color: 'lead' }),
    S(-0.96, 0.96, -1.06, 1.04, 0.09, { color: 'eraser' }),
  ]));

add('Computer Room Carpet', 'dress', 'uncommon', 'Every chair wheel knew this exact blue.',
  { body: '#2f4e73', accent: '#36587f', accent2: '#d3a45d', speck: '#b8d4e8', grid: '#e8b85a' },
  { cuff: 'plain rib' },
  [{ type: 'motif', size: 2.4, from: 0.1, to: 0.96, cols: 3, shapes: [
    C(0.11, { x: -0.5, y: -0.3, color: 'speck' }), C(0.09, { x: 0.3, y: -0.6, color: 'speck' }), C(0.11, { x: 0.5, y: 0.4, color: 'speck' }), C(0.08, { x: -0.2, y: 0.5, color: 'speck' }),
    B(0.5, 0.5, { x: 0.06, y: 0.02, color: 'body', edge: 'grid', edgeWidth: 0.1 }),
  ] }]);

add('Vending Machine Ring', 'baby', 'rare', 'Cost fifty cents and ruled the afternoon.',
  { body: '#f2c8d5', accent: '#e8b6c6', accent2: '#8c63a6', ring: '#8c63a6', gem: '#4fc7c6', shine: '#ffffff', ink: '#4c2f5f' },
  { cuff: 'scalloped' },
  front('baby', [
    R(0.5, 'ring', 0.2, { y: 0.28 }),
    M('diamond', 0.5, { y: -0.4, color: 'gem', edge: 'ink', edgeWidth: 0.08 }),
    S(-0.1, -0.62, 0.06, -0.46, 0.04, { color: 'shine' }),
  ]));

add('Channel Three Snow', 'novelty', 'rare', 'The console is on. The television disagrees.',
  { body: '#30343a', accent: '#3b4047', accent2: '#d8d9d7', snow: '#d8d9d7', snow2: '#8f9499', scan: '#6b737a' },
  { cuff: 'wide band' },
  [{ type: 'motif', size: 1.6, from: 0.1, to: 0.97, cols: 5, shapes: [
    B(0.3, 0.2, { x: -0.5, y: -0.5, color: 'snow' }), B(0.2, 0.2, { x: 0.3, y: -0.3, color: 'snow2' }), B(0.34, 0.16, { x: -0.1, y: 0.2, color: 'snow' }),
    B(0.16, 0.24, { x: 0.6, y: 0.5, color: 'snow2' }), B(0.24, 0.14, { x: -0.6, y: 0.6, color: 'snow2' }), B(0.14, 0.14, { x: 0.1, y: -0.8, color: 'snow' }),
  ] },
  { type: 'band', from: 0.3, to: 0.315, color: 'scan' }, { type: 'band', from: 0.5, to: 0.515, color: 'scan' }, { type: 'band', from: 0.7, to: 0.715, color: 'scan' }]);

// ======================================================================================================
pack('local-creature-report', 'creature', 'Local Creature Report', "Ten sightings near roads, water, corn and somebody's porch light.");

add('Porch Camera Blur', 'crew', 'common', 'Moved too fast to become evidence.',
  { body: '#4f5d67', accent: '#56656f', accent2: '#98a3a8', blur: '#cfd6d3', eye: '#ecce60', stamp: '#a6b0b4', frame: '#d7dddb' },
  { family: 'gradient', cuff: 'plain rib' },
  front('crew', [
    ...line([-0.95, -0.55, -0.95, -0.85, -0.65, -0.85], 0.035, { color: 'frame' }), ...line([0.65, -0.85, 0.95, -0.85, 0.95, -0.55], 0.035, { color: 'frame' }),
    ...line([-0.95, 0.55, -0.95, 0.85, -0.65, 0.85], 0.035, { color: 'frame' }), ...line([0.65, 0.85, 0.95, 0.85, 0.95, 0.55], 0.035, { color: 'frame' }),
    E(0.62, 0.22, { x: 0.08, color: 'blur' }),
    S(-0.8, -0.1, -0.6, -0.1, 0.03, { color: 'blur' }), S(-0.86, 0.08, -0.62, 0.08, 0.03, { color: 'blur' }),
    C(0.07, { x: 0.36, y: -0.04, color: 'eye' }), C(0.07, { x: 0.54, y: -0.04, color: 'eye' }),
    B(0.08, 0.12, { x: 0.3, y: 0.62, color: 'stamp' }), B(0.08, 0.12, { x: 0.44, y: 0.62, color: 'stamp' }), B(0.08, 0.12, { x: 0.62, y: 0.62, color: 'stamp' }), B(0.08, 0.12, { x: 0.76, y: 0.62, color: 'stamp' }),
  ]));

add('Tall Thing by the Treeline', 'knee', 'common', 'Was a stump until it changed locations.',
  { body: '#7f917c', accent: '#74866f', accent2: '#26372e', tree: '#26372e', thing: '#cbbd98', knot: '#7a6a4c', eye: '#1d241f' },
  { cuff: 'contrast rib', heelToe: 1 },
  front('knee', [
    P([-1.0, 0.95, -0.76, -0.2, -0.52, 0.95], { color: 'tree' }), P([-0.7, 0.95, -0.46, -0.5, -0.22, 0.95], { color: 'tree' }),
    P([0.22, 0.95, 0.5, -0.56, 0.78, 0.95], { color: 'tree' }), P([0.58, 0.95, 0.82, -0.14, 1.0, 0.95], { color: 'tree' }),
    P([-0.22, 0.95, -0.22, -0.7, -0.08, -0.9, 0.02, -0.72, 0.12, -0.94, 0.22, -0.68, 0.22, 0.95], { color: 'thing', edge: 'tree', edgeWidth: 0.05 }),
    E(0.07, 0.12, { x: 0.04, y: 0.36, color: 'knot' }),
    C(0.05, { x: -0.08, y: -0.4, color: 'eye' }), C(0.05, { x: 0.08, y: -0.4, color: 'eye' }),
  ]));

add('Lake Neck at Dusk', 'dress', 'common', 'Could be a log. The log has posture.',
  { body: '#456d78', accent: '#4f7884', accent2: '#263e46', sun: '#e3a15c', water: '#7aa7b2', neck: '#1f343b' },
  { family: 'stripe', rhythm: 1, cuff: 'twin stripe' },
  front('dress', [
    C(0.62, { x: 0.36, y: 0.2, color: 'sun' }),
    B(2.2, 0.9, { y: 0.66, color: 'body' }),
    S(-0.95, 0.24, 0.95, 0.24, 0.045, { color: 'water' }), S(-0.8, 0.5, 0.8, 0.5, 0.045, { color: 'water' }), S(-0.6, 0.76, 0.6, 0.76, 0.045, { color: 'water' }),
    ...line([-0.36, 0.24, -0.36, -0.36, -0.22, -0.74, 0.06, -0.82], 0.14, { color: 'neck' }),
    E(0.24, 0.13, { x: 0.12, y: -0.8, color: 'neck' }),
  ]));

add('Moth at the Streetlight', 'ankle', 'common', 'Much larger in memory.',
  { body: '#2e3344', accent: '#363c50', accent2: '#e8cb73', lamp: '#f0d27a', glow: '#5d5a52', moth: '#d8caa4', moth2: '#b8a67c', ink: '#4a4232' },
  { cuff: 'dotted band' },
  front('ankle', [
    C(0.5, { x: 0.46, y: -0.46, color: 'glow' }),
    C(0.26, { x: 0.46, y: -0.46, color: 'lamp' }),
    P([-0.2, 0.2, -0.9, -0.4, -0.86, 0.2], { color: 'moth', edge: 'ink', edgeWidth: 0.04 }),
    P([-0.2, 0.2, 0.5, -0.1, 0.44, 0.4], { color: 'moth', edge: 'ink', edgeWidth: 0.04 }),
    P([-0.2, 0.26, -0.74, 0.44, -0.46, 0.7], { color: 'moth2', edge: 'ink', edgeWidth: 0.04 }),
    P([-0.2, 0.26, 0.3, 0.52, 0.0, 0.72], { color: 'moth2', edge: 'ink', edgeWidth: 0.04 }),
    E(0.08, 0.22, { x: -0.2, y: 0.3, rot: 0.3, color: 'ink' }),
  ]));

add('Three Toed Mud Print', 'slipper', 'common', 'The fourth toe declined comment.',
  { body: '#9a866c', accent: '#8a765e', accent2: '#5f4f3e', mud: '#4c3d2e', ink: '#35291f' },
  { family: 'heelToe', heelToe: 1, cuff: 'wide band' },
  front('slipper', [
    E(0.36, 0.42, { y: 0.42, color: 'mud' }),
    E(0.13, 0.36, { x: -0.36, y: -0.28, rot: 0.35, color: 'mud' }),
    E(0.14, 0.42, { y: -0.4, color: 'mud' }),
    E(0.13, 0.36, { x: 0.36, y: -0.28, rot: -0.35, color: 'mud' }),
  ], { size: 10 }));

add('Cornfield Eyes', 'toe', 'uncommon', 'The corn is not known for eye contact.',
  { body: '#c2a94e', accent: '#b39a42', accent2: '#7e8a3e', corn: '#6a7a30', gap: '#3a3a22', eye: '#f6de5e', pupil: '#1f1f1f' },
  { family: 'fairIsle', rhythm: 1, cuff: 'checker band' },
  front('toe', [
    E(0.44, 0.24, { y: 0.0, color: 'gap' }),
    ...[-0.72, -0.44, 0.44, 0.72].map((x) => S(x, -0.95, x, 0.95, 0.07, { color: 'corn' })),
    S(-0.72, -0.2, -0.95, -0.5, 0.05, { color: 'corn' }), S(0.72, 0.1, 0.95, -0.2, 0.05, { color: 'corn' }),
    S(-0.44, 0.4, -0.2, 0.2, 0.05, { color: 'corn' }), S(0.44, -0.5, 0.2, -0.3, 0.05, { color: 'corn' }),
    C(0.13, { x: -0.16, y: 0.0, color: 'eye' }), C(0.13, { x: 0.16, y: 0.0, color: 'eye' }),
    C(0.05, { x: -0.14, y: 0.02, color: 'pupil' }), C(0.05, { x: 0.18, y: 0.02, color: 'pupil' }),
  ]));

add('Winged Shape Over the Bridge', 'dress', 'uncommon', 'Traffic slowed. Nobody discussed why.',
  { body: '#4c3a58', accent: '#574364', accent2: '#8a7e70', moon: '#ddd6c4', wing: '#1a1420', bridge: '#a2968a', light: '#eec060' },
  { family: 'chevron', rhythm: 0, cuff: 'triple stripe' },
  front('dress', [
    C(0.56, { y: -0.36, color: 'moon' }),
    P([0, -0.2, -0.95, -0.66, -0.7, -0.3, -0.9, -0.12, -0.3, -0.08, 0, 0.06, 0.3, -0.08, 0.9, -0.12, 0.7, -0.3, 0.95, -0.66], { color: 'wing' }),
    C(0.06, { x: -0.06, y: -0.26, color: 'light' }), C(0.06, { x: 0.06, y: -0.26, color: 'light' }),
    S(-1.0, 0.6, 1.0, 0.6, 0.06, { color: 'bridge' }),
    ...line([-1.0, 0.6, -0.5, 0.36, 0, 0.3, 0.5, 0.36, 1.0, 0.6], 0.04, { color: 'bridge' }),
    C(0.07, { x: -0.6, y: 0.48, color: 'light' }), C(0.07, { x: 0.6, y: 0.48, color: 'light' }),
  ]));

add('Antlers Behind the Shed', 'knee', 'uncommon', 'Only the antlers stayed for the photograph.',
  { body: '#6d735f', accent: '#646a57', accent2: '#8a6048', shed: '#8a6048', roof: '#4f372b', door: '#5e4232', antler: '#e2d9bf', ink: '#3b2a20' },
  { family: 'plaid', rhythm: 2, cuff: 'contrast rib' },
  front('knee', [
    ...line([-0.12, 0.0, -0.36, -0.5, -0.78, -0.9], 0.08, { color: 'antler' }), S(-0.36, -0.5, -0.82, -0.44, 0.065, { color: 'antler' }), S(-0.56, -0.7, -0.4, -0.98, 0.065, { color: 'antler' }),
    ...line([0.12, 0.0, 0.36, -0.5, 0.78, -0.9], 0.08, { color: 'antler' }), S(0.36, -0.5, 0.82, -0.44, 0.065, { color: 'antler' }), S(0.56, -0.7, 0.4, -0.98, 0.065, { color: 'antler' }),
    P([-0.98, 0.02, 0, -0.44, 0.98, 0.02], { color: 'roof', edge: 'ink', edgeWidth: 0.05 }),
    B(1.7, 0.96, { y: 0.5, color: 'shed', edge: 'ink', edgeWidth: 0.06 }),
    B(0.46, 0.7, { y: 0.63, color: 'door' }),
  ]));

add('Something in the Culvert', 'novelty', 'rare', 'Politely waited for the headlights to pass.',
  { body: '#566247', accent: '#5f6c50', accent2: '#858b88', pipe: '#a4a8a0', dark: '#16181a', eye: '#f0cc5e', water: '#7fa4b0' },
  { cuff: 'wide band', heelToe: 1 },
  front('novelty', [
    C(0.86, { color: 'pipe' }),
    C(0.66, { color: 'dark' }),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => { const a = (k / 8) * Math.PI * 2; return S(Math.cos(a) * 0.68, Math.sin(a) * 0.68, Math.cos(a) * 0.84, Math.sin(a) * 0.84, 0.025, { color: 'dark' }); }),
    C(0.08, { x: -0.16, y: -0.06, color: 'eye' }), C(0.08, { x: 0.16, y: -0.06, color: 'eye' }),
    B(1.3, 0.14, { y: 0.54, color: 'water' }),
  ]));

add('Snowbank That Blinked', 'baby', 'rare', 'The second blink felt unnecessarily personal.',
  { body: '#8ea7b8', accent: '#9bb3c3', accent2: '#e7ece9', snow: '#f8faf9', shadow: '#b5c4cc', eye: '#2f3433' },
  { cuff: 'scalloped' },
  front('baby', [
    E(0.9, 0.5, { y: 0.34, color: 'snow', edge: 'shadow', edgeWidth: 0.06 }),
    E(0.56, 0.44, { x: -0.2, y: 0.0, color: 'snow', edge: 'shadow', edgeWidth: 0.06 }),
    E(0.44, 0.36, { x: 0.36, y: 0.08, color: 'snow', edge: 'shadow', edgeWidth: 0.06 }),
    E(0.1, 0.045, { x: -0.22, y: -0.04, color: 'eye' }),
    E(0.1, 0.045, { x: 0.06, y: -0.04, color: 'eye' }),
  ]));

// ======================================================================================================
for (const P2 of PACKS) {
  writeFileSync(new URL(`../data/heroes/${P2.file}.json`, import.meta.url), JSON.stringify({ pack: P2.pack, heroes: P2.heroes }, null, 1) + '\n');
  const by = {};
  for (const h of P2.heroes) by[h.rarity] = (by[h.rarity] || 0) + 1;
  console.log(P2.pack.id, P2.heroes.length, 'socks', JSON.stringify(by), 'silhouettes', new Set(P2.heroes.map((h) => h.silhouette)).size);
}
