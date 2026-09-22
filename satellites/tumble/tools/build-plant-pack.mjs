// DESIGN-T2 4.1, the FREE pack: Plant Parent Support Group. Every player gets something to screenshot on
// day one. Ten socks, five common, three uncommon, two rare, spread across all eight silhouettes.
// Law 4: no brand, team, band, character or near miss in any name.
// ⛔ 23 Sep, from the hero sheet: four emblems were placed at v 0.42 to 0.45, which on a crew sock IS the heel
// (0.468) and on a baby or a slipper is just past it, so they wrapped round the bend. Every other pack puts a
// leg emblem at about 0.25 and a foot emblem at about 0.6 (tools/build-hero-packs.mjs AT), and so does this now.
import { writeFileSync } from 'fs';

// ⛔ 23 Sep: this helper passed w and h straight through, but the painter's box takes HALF extents and its `round`
// grows it, while every box below is written as a full size (the pot rim, 1.2 across, sits on a pot 1.04 wide).
// So every box here painted at twice its size: the watering can was a big blue square. Full sizes now.
const B = (w, h, o = {}) => ({ sdf: 'box', ...o, w: w / 2 - (o.round || 0), h: h / 2 - (o.round || 0) });
const C = (r, o = {}) => ({ sdf: 'circle', r, ...o });
const E = (a, b, o = {}) => ({ sdf: 'ellipse', a, b, ...o });
const S = (x1, y1, x2, y2, r, o = {}) => ({ sdf: 'seg', x1, y1, x2, y2, r, ...o });
const P = (pts, o = {}) => ({ sdf: 'poly', pts, ...o });
const M = (shape, scale, o = {}) => ({ sdf: 'motif', shape, scale, ...o });
const T = (text, h, o = {}) => ({ sdf: 'text', text, h, ...o });

const heroes = [];
let n = 0;
const add = (name, silhouette, rarity, flavor, colors, layers, extra = {}) => {
  n++;
  heroes.push({
    id: 'hero_plant_' + String(n).padStart(3, '0'),
    name, pack: 'plant-parents', silhouette, tile: 'proc', rarity, flavor,
    source: 'pack',
    spawnWeight: rarity === 'common' ? 1 : rarity === 'uncommon' ? 0.55 : 0.22,
    conditionAllowed: ['insideOut'],
    recipe: { colors, family: 'solid', ...extra, layers },
  });
};

// --- five common ---
add('One Leaf Left', 'crew', 'common', 'It is fine. It is going to be fine.',
  { body: '#e6ded0', accent: '#6f9a5a', accent2: '#8a6a4a', pot: '#c07a4a', soil: '#5a4230', stem: '#6f9a5a', leaf: '#8fbe6a', ink: '#3d4a33' },
  [{ type: 'emblem', at: [0.75, 0.25], size: 7.2, shapes: [
    P([-0.52, 0.28, 0.52, 0.28, 0.38, 0.92, -0.38, 0.92], { color: 'pot', edge: 'ink', edgeWidth: 0.07 }),
    B(1.2, 0.2, { round: 0.04, y: 0.2, color: 'pot', edge: 'ink', edgeWidth: 0.07 }),
    E(0.5, 0.1, { y: 0.14, color: 'soil' }),
    S(0, 0.14, 0.06, -0.5, 0.055, { color: 'stem' }),
    E(0.3, 0.16, { x: 0.3, y: -0.6, rot: -0.5, color: 'leaf', edge: 'ink', edgeWidth: 0.06 }),
  ] }]);

add('Watered Twice Today', 'ankle', 'common', 'Nobody told the other one.',
  { body: '#a8c8d8', accent: '#f2f6f8', accent2: '#4a6a7a', drop: '#5aa8d8', ink: '#2f4a58' },
  [{ type: 'motif', size: 2.1, from: 0.14, to: 0.86, cols: 3, shape: 'raindrop', color: 'drop', edge: 'ink', edgeWidth: 0.09 }]);

add('Mystery Seedling', 'baby', 'common', 'Something is coming up. Nobody planted anything.',
  { body: '#e4e8d4', accent: '#4f7a3a', accent2: '#8a6a4a', sprout: '#4f8a3a', soil: '#7a5c40', ink: '#2f4022' },
  [{ type: 'emblem', at: [0.75, 0.63], size: 5.6, shapes: [
    // the soil is a low band, not a pool: the sprout is the subject
    E(0.62, 0.13, { y: 0.66, color: 'soil', edge: 'ink', edgeWidth: 0.06 }),
    S(0, 0.62, -0.05, -0.42, 0.085, { color: 'sprout', edge: 'ink', edgeWidth: 0.06 }),
    E(0.36, 0.19, { x: -0.38, y: -0.3, rot: 0.6, color: 'sprout', edge: 'ink', edgeWidth: 0.07 }),
    E(0.36, 0.19, { x: 0.34, y: -0.58, rot: -0.6, color: 'sprout', edge: 'ink', edgeWidth: 0.07 }),
  ] }]);

add('Terracotta Everything', 'toe', 'common', 'They all match now. It was not cheap.',
  { body: '#f0e2d2', accent: '#c0714a', accent2: '#8a4a2a', pot: '#c86b3c', rim: '#a04e26', ink: '#4a2a14' },
  [{ type: 'motif', size: 3.9, from: 0.12, to: 0.88, cols: 2, shapes: [
    P([-0.62, -0.18, 0.62, -0.18, 0.44, 0.68, -0.44, 0.68], { color: 'pot', edge: 'ink', edgeWidth: 0.09 }),
    B(1.44, 0.3, { round: 0.05, y: -0.32, color: 'rim', edge: 'ink', edgeWidth: 0.09 }),
    S(-0.3, 0.06, 0.3, 0.06, 0.035, { color: 'rim' }),
  ] }]);

add('Bright Indirect Light', 'crew', 'common', 'The single most requested thing in this house.',
  { body: '#f4dc7c', accent: '#e8c04a', accent2: '#c09a2a', ray: '#b8740e', ink: '#5a3a06' },
  [{ type: 'motif', size: 2.3, from: 0.12, to: 0.88, cols: 2, shape: 'sun', color: 'ray', edge: 'ink', edgeWidth: 0.12 }]);

// --- three uncommon ---
add('Propagation Station', 'knee', 'uncommon', 'Six jars on a windowsill and a lot of hope.',
  { body: '#eef4f2', accent: '#4f7a3a', accent2: '#6a94a4', glass: '#9cc3cf', water: '#4f94b0', stem: '#3f6a2c', leaf: '#4f8a36', ink: '#274a44' },
  [{ type: 'motif', size: 3.8, from: 0.1, to: 0.9, cols: 2, shapes: [
    B(0.56, 0.72, { round: 0.1, y: 0.22, color: 'glass', edge: 'ink', edgeWidth: 0.08 }),
    B(0.52, 0.34, { round: 0.06, y: 0.42, color: 'water' }),
    S(0, 0.34, 0.05, -0.55, 0.05, { color: 'stem' }),
    E(0.26, 0.13, { x: 0.28, y: -0.62, rot: -0.5, color: 'leaf', edge: 'ink', edgeWidth: 0.07 }),
    E(0.24, 0.12, { x: -0.26, y: -0.4, rot: 0.5, color: 'leaf', edge: 'ink', edgeWidth: 0.07 }),
  ] }]);

add('Leaf Shine Wipe Day', 'dress', 'uncommon', 'Every leaf, one at a time, with a soft cloth.',
  { body: '#4a6a4a', accent: '#a8d08a', accent2: '#f2f6ee', leaf: '#8fbe6a', shine: '#e8f4d8', ink: '#2a4028' },
  [{ type: 'motif', size: 2.6, from: 0.1, to: 0.9, cols: 2, shapes: [
    M('leaf', 0.85, { color: 'leaf', edge: 'ink', edgeWidth: 0.09 }),
    S(-0.3, -0.18, 0.1, 0.14, 0.07, { color: 'shine' }),
    S(0.02, -0.38, 0.28, -0.16, 0.05, { color: 'shine' }),
  ] }]);

add('Definitely Not Overwatering', 'slipper', 'uncommon', 'The label says once a fortnight. The label is wrong.',
  { body: '#e8eef4', accent: '#3a6a96', accent2: '#23455f', can: '#3f7aa8', spout: '#2f5f86', drop: '#4aa0d8', ink: '#1a3448' },
  [{ type: 'emblem', at: [0.75, 0.6], size: 9, shapes: [
    // a dark can on a pale sock, and a handle that reads as a handle
    B(0.84, 0.72, { round: 0.14, x: -0.14, y: 0.14, color: 'can', edge: 'ink', edgeWidth: 0.07 }),
    P([0.26, -0.06, 0.9, -0.5, 1.0, -0.3, 0.32, 0.18], { color: 'spout', edge: 'ink', edgeWidth: 0.07 }),
    E(0.17, 0.1, { x: 0.95, y: -0.4, rot: -0.6, color: 'spout', edge: 'ink', edgeWidth: 0.07 }),
    S(-0.56, -0.2, -0.56, -0.5, 0.075, { color: 'spout', edge: 'ink', edgeWidth: 0.06 }),
    S(-0.56, -0.5, -0.16, -0.5, 0.075, { color: 'spout', edge: 'ink', edgeWidth: 0.06 }),
    C(0.1, { x: 0.94, y: 0.1, color: 'drop', edge: 'ink', edgeWidth: 0.06 }),
    C(0.08, { x: 0.76, y: 0.42, color: 'drop', edge: 'ink', edgeWidth: 0.06 }),
  ] }]);

// --- two rare ---
add('The One That Flowered', 'novelty', 'rare', 'Once, in the third year, and never again.',
  { body: '#3a3a52', accent: '#e8a0c0', accent2: '#f2d05a', petal: '#f0a8c8', heart: '#f2d05a', leaf: '#6f9a5a', ink: '#2a2a3c' },
  [{ type: 'motif', size: 2.8, from: 0.08, to: 0.92, cols: 2, shapes: [
    E(0.2, 0.42, { y: -0.34, color: 'petal', edge: 'ink', edgeWidth: 0.08 }),
    E(0.2, 0.42, { y: -0.34, rot: 1.05, color: 'petal', edge: 'ink', edgeWidth: 0.08 }),
    E(0.2, 0.42, { y: -0.34, rot: 2.1, color: 'petal', edge: 'ink', edgeWidth: 0.08 }),
    E(0.2, 0.42, { y: -0.34, rot: -1.05, color: 'petal', edge: 'ink', edgeWidth: 0.08 }),
    E(0.2, 0.42, { y: -0.34, rot: -2.1, color: 'petal', edge: 'ink', edgeWidth: 0.08 }),
    C(0.2, { color: 'heart', edge: 'ink', edgeWidth: 0.08 }),
    S(0, 0.2, 0.04, 0.9, 0.06, { color: 'leaf' }),
  ] }]);

add('Support Group Tuesday', 'crew', 'rare', 'Bring your worst one. Nobody is judging.',
  { body: '#bcd0ae', accent: '#5f8a4a', accent2: '#c07a4a', pot1: '#c07a4a', pot2: '#6f93b3', pot3: '#8674a8', leaf: '#3f6a30', dead: '#8a7050', ink: '#2d3a23' },
  [{ type: 'emblem', at: [0.75, 0.25], size: 8.4, shapes: [
    // three pots in a row: one thriving, one coping, one that everybody is being kind about
    P([-0.94, 0.18, -0.4, 0.18, -0.48, 0.74, -0.86, 0.74], { color: 'pot1', edge: 'ink', edgeWidth: 0.06 }),
    S(-0.67, 0.16, -0.67, -0.34, 0.045, { color: 'leaf' }),
    E(0.24, 0.12, { x: -0.42, y: -0.44, rot: -0.5, color: 'leaf', edge: 'ink', edgeWidth: 0.05 }),
    E(0.22, 0.11, { x: -0.9, y: -0.26, rot: 0.5, color: 'leaf', edge: 'ink', edgeWidth: 0.05 }),
    P([-0.27, 0.18, 0.27, 0.18, 0.19, 0.74, -0.19, 0.74], { color: 'pot2', edge: 'ink', edgeWidth: 0.06 }),
    S(0, 0.16, 0.03, -0.2, 0.045, { color: 'leaf' }),
    E(0.2, 0.1, { x: 0.24, y: -0.28, rot: -0.5, color: 'leaf', edge: 'ink', edgeWidth: 0.05 }),
    P([0.4, 0.18, 0.94, 0.18, 0.86, 0.74, 0.48, 0.74], { color: 'pot3', edge: 'ink', edgeWidth: 0.06 }),
    S(0.67, 0.16, 0.62, -0.12, 0.04, { color: 'dead' }),
    E(0.16, 0.07, { x: 0.78, y: -0.02, rot: 0.9, color: 'dead' }),
  ] }]);

const out = {
  pack: { id: 'plant-parents', name: 'Plant Parent Support Group', cost: 0, blurb: 'Ten socks for people whose windowsills have gone too far. Free, because everybody should have something to show on day one.' },
  heroes,
};
writeFileSync('/workspaces/lucid-winds/satellites/tumble/data/heroes/plant-parents.json', JSON.stringify(out, null, 1) + '\n');
console.log('wrote plant-parents.json:', heroes.length, 'socks');
const by = {};
for (const h of heroes) by[h.rarity] = (by[h.rarity] || 0) + 1;
console.log('rarity', by);
console.log('silhouettes', [...new Set(heroes.map((h) => h.silhouette))].join(', '));
