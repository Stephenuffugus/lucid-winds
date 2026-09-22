// Authors data/finds.json (DESIGN-T2 phase 2.1). This file is the SOURCE: the recipes are written here in
// readable coordinates and `rot2` bakes any rotation into the JSON, so never hand edit data/finds.json.
//   node tools/build-finds.mjs      then      node tools/find-sheet.mjs      and LOOK at dev/out/finds.png
//
// The thirty are GPT 1's list F5 (plans/tumble/exp1/all-ideas.json: src GPT-5.6-Sol, lane F, kind find), with
// law 4 (no brand or near miss: the lip balm was proposed by its trademark) and law 11 (copy) applied, and the
// five comforts the design ships. GPT's own five "would not ship" objects are kept as keepsakes with no power.
import { writeFileSync } from 'fs';

const TINT = {
  'coat-pocket-of-a-tall-man': { tile: '#e9ded0', rim: '#c6b6a3' },
  'a-child-was-definitely-here': { tile: '#f2e6cd', rim: '#d2bf9d' },
  'night-out-apparently': { tile: '#e7dfe6', rim: '#c2b8c4' },
  'useful-until-washed': { tile: '#e5e7de', rim: '#c1c4b6' },
  'things-nobody-throws-away': { tile: '#eadfc9', rim: '#c8b795' },
};

const sets = [
  { id: 'coat-pocket-of-a-tall-man', name: 'The Coat Pocket of a Tall Man', label: 'from one coat, one winter' },
  { id: 'a-child-was-definitely-here', name: 'A Child Was Definitely Here', label: 'found at knee height' },
  { id: 'night-out-apparently', name: 'Night Out, Apparently', label: 'the evidence, kept' },
  { id: 'useful-until-washed', name: 'Useful Until Washed', label: 'all of it still works' },
  { id: 'things-nobody-throws-away', name: 'Things Nobody Throws Away', label: 'no reason, no plans' },
];

// shorthand
const B = (w, h, o = {}) => ({ sdf: 'box', w, h, ...o });
const C = (r, o = {}) => ({ sdf: 'circle', r, ...o });
const E = (a, b, o = {}) => ({ sdf: 'ellipse', a, b, ...o });
const S = (x1, y1, x2, y2, r, o = {}) => ({ sdf: 'seg', x1, y1, x2, y2, r, ...o });
const R = (r, t, o = {}) => ({ sdf: 'ring', r, t, ...o });
const P = (pts, o = {}) => ({ sdf: 'poly', pts, ...o });
const T = (text, h, o = {}) => ({ sdf: 'text', text, h, ...o });
const M = (shape, scale, o = {}) => ({ sdf: 'motif', shape, scale, ...o });
// rotate a whole emblem: seg endpoints and offsets together, so a thing can lie on the slant
const rot2 = (shapes, a) => {
  const c = Math.cos(a), si = Math.sin(a);
  const rp = (x, y) => [x * c - y * si, x * si + y * c];
  return shapes.map((sh) => {
    const o = { ...sh };
    if (sh.x !== undefined || sh.y !== undefined) { const [x, y] = rp(sh.x || 0, sh.y || 0); o.x = +x.toFixed(4); o.y = +y.toFixed(4); }
    if (sh.x1 !== undefined) { const [x, y] = rp(sh.x1, sh.y1); o.x1 = +x.toFixed(4); o.y1 = +y.toFixed(4); }
    if (sh.x2 !== undefined) { const [x, y] = rp(sh.x2, sh.y2); o.x2 = +x.toFixed(4); o.y2 = +y.toFixed(4); }
    if (sh.pts) { const q = []; for (let i = 0; i + 1 < sh.pts.length; i += 2) { const [x, y] = rp(sh.pts[i], sh.pts[i + 1]); q.push(+x.toFixed(4), +y.toFixed(4)); } o.pts = q; }
    if (sh.sdf === 'box' || sh.sdf === 'ellipse' || sh.sdf === 'text' || sh.sdf === 'motif') o.rot = (sh.rot || 0) - a;
    return o;
  });
};

const items = [];
const add = (o) => items.push(o);

// ---------- The Coat Pocket of a Tall Man ----------
add({
  id: 'find-half-a-lip-balm', name: 'Half a Lip Balm', rarity: 'common', set: 'coat-pocket-of-a-tall-man',
  flavor: 'Survived the wash. Again.', fromLoad: 1, comesOut: 'flip', help: null,
  recipe: { colors: { tube: '#f7f5f0', ink: '#807868', balm: '#e3d2a8', band: '#c6bdac', dent: '#ddd7c9', shine: '#ffffff' }, layers: [{ type: 'emblem', shapes: [
    E(0.15, 0.13, { y: -0.52, color: 'balm', edge: 'ink', edgeWidth: 0.05 }),
    B(0.3, 0.14, { round: 0.03, y: -0.44, color: 'balm', edge: 'ink', edgeWidth: 0.05 }),
    B(0.3, 0.74, { round: 0.05, y: 0.06, color: 'tube', edge: 'ink', edgeWidth: 0.05 }),
    B(0.34, 0.16, { round: 0.04, y: 0.5, color: 'band', edge: 'ink', edgeWidth: 0.05 }),
    E(0.09, 0.16, { x: 0.11, y: 0.06, color: 'dent' }),
    S(-0.08, -0.16, -0.08, 0.26, 0.022, { color: 'shine' }),
  ] }] },
});
add({
  id: 'find-guitar-pick', name: 'The Guitar Pick', rarity: 'uncommon', set: 'coat-pocket-of-a-tall-man',
  flavor: 'Knows four chords and one very long story.', fromLoad: 3, comesOut: 'door', help: null,
  recipe: { colors: { pick: '#d2382f', ink: '#75201a', shine: '#ef8078' }, layers: [{ type: 'emblem', shapes: [
    P([-0.62, -0.26, -0.4, -0.56, 0, -0.66, 0.4, -0.56, 0.62, -0.26, 0, 0.66], { color: 'pick', edge: 'ink', edgeWidth: 0.07 }),
    C(0.17, { x: -0.5, y: -0.36, color: 'tile' }),
    S(-0.1, -0.34, 0.14, 0.0, 0.05, { color: 'shine' }),
  ] }] },
});
add({
  id: 'find-soft-receipt', name: 'Receipt Gone Soft', rarity: 'common', set: 'coat-pocket-of-a-tall-man',
  flavor: 'The total is now between us and the water.', fromLoad: 1, comesOut: 'pull', help: null,
  recipe: { colors: { paper: '#fbfaf6', ink: '#7e776a', bar: '#4e4c48', faint: '#a09a8c' }, layers: [{ type: 'emblem', shapes: [
    B(0.42, 1.06, { round: 0.02, y: -0.2, color: 'paper', edge: 'ink', edgeWidth: 0.05 }),
    E(0.26, 0.2, { x: 0.06, y: 0.5, rot: 0.3, color: 'paper', edge: 'ink', edgeWidth: 0.05 }),
    S(-0.15, -0.6, -0.15, -0.42, 0.026, { color: 'bar' }), S(-0.06, -0.6, -0.06, -0.42, 0.038, { color: 'bar' }),
    S(0.04, -0.6, 0.04, -0.42, 0.022, { color: 'bar' }), S(0.14, -0.6, 0.14, -0.42, 0.034, { color: 'bar' }),
    B(0.3, 0.035, { x: -0.02, y: -0.26, color: 'faint' }),
    B(0.24, 0.035, { x: -0.05, y: -0.14, color: 'faint' }),
    B(0.3, 0.035, { x: -0.02, y: -0.02, color: 'faint' }),
    B(0.18, 0.035, { x: -0.08, y: 0.1, color: 'faint' }),
    B(0.14, 0.05, { x: 0.09, y: 0.22, color: 'bar' }),
  ] }] },
});
add({
  id: 'find-coat-button', name: 'The Spare Coat Button', rarity: 'common', set: 'coat-pocket-of-a-tall-man',
  flavor: 'Was included for a reason nobody remembers.', fromLoad: 1, comesOut: 'flip', help: null,
  recipe: { colors: { shell: '#6b4526', ink: '#33200f', mottle: '#a56f38', hole: '#2a1a0e' }, layers: [{ type: 'emblem', shapes: [
    C(0.78, { color: 'shell', edge: 'ink', edgeWidth: 0.07 }),
    E(0.3, 0.2, { x: -0.24, y: -0.22, rot: 0.5, color: 'mottle' }),
    E(0.22, 0.14, { x: 0.28, y: 0.28, rot: -0.4, color: 'mottle' }),
    R(0.54, 0.035, { color: 'ink' }),
    C(0.1, { x: -0.2, y: -0.2, color: 'hole' }), C(0.1, { x: 0.2, y: -0.2, color: 'hole' }),
    C(0.1, { x: -0.2, y: 0.2, color: 'hole' }), C(0.1, { x: 0.2, y: 0.2, color: 'hole' }),
  ] }] },
});
add({
  id: 'find-coat-check-claim', name: 'Coat Check Claim 47', rarity: 'uncommon', set: 'coat-pocket-of-a-tall-man',
  flavor: 'The coat made it home. The number stayed.', fromLoad: 12, comesOut: 'pull', help: null,
  recipe: { colors: { card: '#f6efdd', ink: '#5d5341' }, layers: [{ type: 'emblem', shapes: [
    B(0.74, 0.5, { round: 0.03, color: 'card', edge: 'ink', edgeWidth: 0.05 }),
    T('47', 0.44, { y: 0.02, stroke: 0.07, color: 'ink' }),
    P([0.74, -0.5, 0.74, -0.2, 0.42, -0.5], { color: 'tile' }),
    C(0.08, { x: -0.6, y: 0, color: 'tile' }),
  ] }] },
});
add({
  id: 'find-pocket-screw', name: 'One Tiny Screw', rarity: 'rare', set: 'coat-pocket-of-a-tall-man',
  flavor: 'Definitely important to something. Probably not this.', fromLoad: 25, comesOut: 'clean', help: null,
  recipe: { colors: { steel: '#c8ccd2', ink: '#5f6469', slot: '#7c8288' }, layers: [{ type: 'emblem', shapes: [
    B(0.26, 0.62, { y: 0.28, color: 'steel', edge: 'ink', edgeWidth: 0.05 }),
    P([-0.13, 0.58, 0.13, 0.58, 0, 0.86], { color: 'steel', edge: 'ink', edgeWidth: 0.05 }),
    S(-0.13, 0.06, 0.13, 0.14, 0.022, { color: 'slot' }),
    S(-0.13, 0.26, 0.13, 0.34, 0.022, { color: 'slot' }),
    S(-0.13, 0.46, 0.13, 0.54, 0.022, { color: 'slot' }),
    C(0.4, { y: -0.36, color: 'steel', edge: 'ink', edgeWidth: 0.05 }),
    B(0.4, 0.09, { y: -0.36, color: 'slot' }),
    B(0.09, 0.4, { y: -0.36, color: 'slot' }),
  ] }] },
});

// ---------- A Child Was Definitely Here ----------
add({
  id: 'find-blue-marble', name: 'The Blue Marble', rarity: 'common', set: 'a-child-was-definitely-here',
  flavor: 'Was missing for eleven minutes and blamed everyone.', fromLoad: 1, comesOut: 'pull', help: null,
  recipe: { colors: { glass: '#cfe1f0', ink: '#6f8ca4', cobalt: '#2a5bbf', cobalt2: '#5f8fe0', shine: '#ffffff' }, layers: [{ type: 'emblem', shapes: [
    C(0.82, { color: 'glass', edge: 'ink', edgeWidth: 0.07 }),
    E(0.72, 0.26, { rot: 0.42, color: 'cobalt' }),
    E(0.5, 0.11, { rot: 0.42, color: 'cobalt2' }),
    E(0.22, 0.13, { x: -0.3, y: -0.38, rot: -0.5, color: 'shine' }),
    C(0.07, { x: 0.3, y: 0.4, color: 'shine' }),
  ] }] },
});
add({
  id: 'find-crayon-nub', name: 'Green Crayon Nub', rarity: 'common', set: 'a-child-was-definitely-here',
  flavor: 'Still has one drawing left in it.', fromLoad: 1, comesOut: 'pull', help: null,
  recipe: { colors: { wax: '#2f6f3a', worn: '#489a55', ink: '#1a4222', band: '#e7d9a8', crease: '#bfae78' }, layers: [{ type: 'emblem', shapes: [
    B(0.44, 0.72, { round: 0.05, y: 0.26, color: 'wax', edge: 'ink', edgeWidth: 0.05 }),
    P([-0.23, -0.12, 0.23, -0.12, 0.08, -0.72], { color: 'worn', edge: 'ink', edgeWidth: 0.05 }),
    B(0.48, 0.38, { y: 0.34, color: 'band', edge: 'ink', edgeWidth: 0.05 }),
    S(-0.18, 0.18, -0.14, 0.5, 0.02, { color: 'crease' }),
    S(0.02, 0.18, 0.06, 0.5, 0.02, { color: 'crease' }),
    S(0.18, 0.18, 0.14, 0.5, 0.02, { color: 'crease' }),
  ] }] },
});
add({
  id: 'find-toy-wheel', name: 'A Very Small Wheel', rarity: 'uncommon', set: 'a-child-was-definitely-here',
  flavor: 'Its vehicle has moved on without it.', fromLoad: 8, comesOut: 'door', help: null,
  recipe: { colors: { rubber: '#2c2c30', ink: '#101013', groove: '#4a4a52', hub: '#f0c020' }, layers: [{ type: 'emblem', shapes: [
    C(0.82, { color: 'rubber', edge: 'ink', edgeWidth: 0.05 }),
    R(0.64, 0.045, { color: 'groove' }),
    C(0.38, { color: 'hub', edge: 'ink', edgeWidth: 0.05 }),
    C(0.11, { color: 'ink' }),
    C(0.07, { x: 0, y: -0.24, color: 'ink' }),
    C(0.07, { x: 0.21, y: 0.12, color: 'ink' }),
    C(0.07, { x: -0.21, y: 0.12, color: 'ink' }),
  ] }] },
});
add({
  id: 'find-star-backing', name: 'Sticker Backing Star', rarity: 'common', set: 'a-child-was-definitely-here',
  flavor: 'The good part is on something else now.', fromLoad: 5, comesOut: 'pull', help: null,
  recipe: { colors: { paper: '#fcfbf7', ink: '#867e6c', ghosta: '#e79cbb', ghostb: '#8fc9a6', ghostc: '#9db4e0' }, layers: [{ type: 'emblem', shapes: [
    M('star', 0.92, { color: 'paper', edge: 'ink', edgeWidth: 0.1 }),
    C(0.2, { x: -0.16, y: -0.12, color: 'ghosta' }),
    C(0.17, { x: 0.2, y: 0.04, color: 'ghostb' }),
    C(0.14, { x: -0.02, y: 0.3, color: 'ghostc' }),
    C(0.09, { x: 0.02, y: -0.36, color: 'ghostb' }),
  ] }] },
});
add({
  id: 'find-acorn-cap', name: 'Acorn Cap Only', rarity: 'uncommon', set: 'a-child-was-definitely-here',
  flavor: 'The acorn had other plans.', fromLoad: 15, comesOut: 'flip', help: null,
  recipe: { colors: { cap: '#8a5a2c', ink: '#402711', stem: '#6d4520', tex: '#5f3a17', lip: '#c9a06a' }, layers: [{ type: 'emblem', shapes: [
    B(0.2, 0.32, { round: 0.06, y: -0.66, color: 'stem', edge: 'ink', edgeWidth: 0.05 }),
    E(0.7, 0.6, { y: 0.06, color: 'cap', edge: 'ink', edgeWidth: 0.06 }),
    B(1.8, 0.5, { y: 0.72, color: 'tile' }),
    S(-0.52, -0.12, -0.3, -0.24, 0.042, { color: 'tex' }), S(-0.2, -0.28, 0.02, -0.32, 0.042, { color: 'tex' }),
    S(0.12, -0.3, 0.34, -0.2, 0.042, { color: 'tex' }),
    S(-0.58, 0.14, -0.34, 0.06, 0.042, { color: 'tex' }), S(-0.22, 0.02, 0.02, 0.0, 0.042, { color: 'tex' }),
    S(0.14, 0.02, 0.38, 0.08, 0.042, { color: 'tex' }), S(0.5, 0.14, 0.58, 0.18, 0.042, { color: 'tex' }),
    S(-0.36, 0.38, -0.12, 0.32, 0.042, { color: 'tex' }), S(0.0, 0.32, 0.24, 0.38, 0.042, { color: 'tex' }),
    S(-0.5, 0.46, 0.5, 0.46, 0.05, { color: 'lip' }),
  ] }] },
});
add({
  id: 'find-googly-eye', name: 'Single Googly Eye', rarity: 'rare', set: 'a-child-was-definitely-here',
  flavor: 'Has been watching the spin cycle professionally.', fromLoad: 30, comesOut: 'door', help: null,
  recipe: { colors: { white: '#fbfbf8', ink: '#8f8c82', pupil: '#16161a', shadow: '#dbd7cc' }, layers: [{ type: 'emblem', shapes: [
    C(0.84, { color: 'white', edge: 'ink', edgeWidth: 0.06 }),
    R(0.7, 0.035, { color: 'shadow' }),
    C(0.32, { x: 0.14, y: 0.2, color: 'pupil' }),
    C(0.09, { x: 0.04, y: 0.1, color: 'white' }),
  ] }] },
});

// ---------- Night Out, Apparently ----------
add({
  id: 'find-ticket-stub', name: 'The Ticket Stub', rarity: 'common', set: 'night-out-apparently',
  flavor: 'The show was better than the parking.', fromLoad: 10, comesOut: 'pull', help: null,
  recipe: { colors: { card: '#e98a74', ink: '#8a4231' }, layers: [{ type: 'emblem', shapes: [
    B(0.84, 0.46, { round: 0.03, color: 'card', edge: 'ink', edgeWidth: 0.05 }),
    C(0.09, { x: -0.56, y: -0.14, color: 'tile' }), C(0.09, { x: -0.56, y: 0.14, color: 'tile' }),
    C(0.035, { x: 0.3, y: -0.2, color: 'tile' }), C(0.035, { x: 0.3, y: -0.07, color: 'tile' }),
    C(0.035, { x: 0.3, y: 0.06, color: 'tile' }), C(0.035, { x: 0.3, y: 0.19, color: 'tile' }),
    B(0.34, 0.055, { x: -0.1, y: -0.12, color: 'ink' }),
    B(0.26, 0.04, { x: -0.14, y: 0.02, color: 'ink' }),
    B(0.18, 0.04, { x: -0.18, y: 0.14, color: 'ink' }),
    B(0.1, 0.24, { x: 0.52, y: 0, color: 'ink' }),
  ] }] },
});
add({
  id: 'find-earring-back', name: 'One Earring Back', rarity: 'common', set: 'night-out-apparently',
  flavor: 'Its earring is doing fine somewhere else.', fromLoad: 12, comesOut: 'trap', help: null,
  recipe: { colors: { gold: '#dcae4a', gold2: '#f0cf78', ink: '#7e5a1c' }, layers: [{ type: 'emblem', shapes: [
    E(0.52, 0.34, { x: -0.42, y: 0.02, rot: 0.5, color: 'gold', edge: 'ink', edgeWidth: 0.06 }),
    E(0.52, 0.34, { x: 0.42, y: 0.02, rot: -0.5, color: 'gold', edge: 'ink', edgeWidth: 0.06 }),
    B(0.16, 0.56, { round: 0.07, color: 'gold2', edge: 'ink', edgeWidth: 0.06 }),
    C(0.055, { y: -0.14, color: 'ink' }),
    C(0.055, { y: 0.14, color: 'ink' }),
  ] }] },
});
add({
  id: 'find-paper-wristband', name: 'Paper Wristband', rarity: 'uncommon', set: 'night-out-apparently',
  flavor: 'Entry granted. Getting back in seems unlikely.', fromLoad: 20, comesOut: 'pull', help: null,
  recipe: { colors: { neon: '#f27a1a', ink: '#8a4208', tape: '#f7ab63' }, layers: [{ type: 'emblem', shapes: [
    B(1.34, 0.32, { round: 0.04, rot: -0.22, color: 'neon', edge: 'ink', edgeWidth: 0.05 }),
    P([-0.62, -0.02, -0.74, -0.2, -0.86, 0.02, -0.76, 0.2, -0.62, 0.26], { color: 'tile' }),
    B(0.06, 0.24, { rot: -0.22, x: -0.12, y: 0.03, color: 'ink' }),
    B(0.06, 0.24, { rot: -0.22, x: 0.06, y: -0.01, color: 'ink' }),
    B(0.2, 0.3, { rot: -0.22, x: 0.48, y: -0.11, color: 'tape' }),
  ] }] },
});
add({
  id: 'find-mint-wrapper', name: 'Emergency Mint Wrapper', rarity: 'common', set: 'night-out-apparently',
  flavor: 'The emergency passed. The wrapper persisted.', fromLoad: 8, comesOut: 'door', help: 'quietOpen',
  recipe: { colors: { foil: '#3f9e63', foil2: '#6ec18a', ink: '#1c5030', shine: '#bce8ca' }, layers: [{ type: 'emblem', shapes: [
    P([-0.4, -0.3, -0.88, -0.46, -0.88, 0.46, -0.4, 0.3], { color: 'foil2', edge: 'ink', edgeWidth: 0.05 }),
    P([0.4, -0.3, 0.88, -0.46, 0.88, 0.46, 0.4, 0.3], { color: 'foil2', edge: 'ink', edgeWidth: 0.05 }),
    E(0.46, 0.38, { color: 'foil', edge: 'ink', edgeWidth: 0.05 }),
    S(-0.72, -0.24, -0.5, 0.24, 0.022, { color: 'ink' }),
    S(0.72, -0.24, 0.5, 0.24, 0.022, { color: 'ink' }),
    S(-0.2, -0.2, 0.08, 0.16, 0.05, { color: 'shine' }),
  ] }] },
});
add({
  id: 'find-confetti-star', name: 'One Foil Star', rarity: 'uncommon', set: 'night-out-apparently',
  flavor: 'Stayed for cleanup. Nobody asked it to.', fromLoad: 35, comesOut: 'spotless', help: null,
  recipe: { colors: { gold: '#e3b93f', gold2: '#f7e09a', ink: '#8a6612' }, layers: [{ type: 'emblem', shapes: [
    M('star', 0.92, { color: 'gold', edge: 'ink', edgeWidth: 0.06 }),
    S(-0.02, -0.56, 0.06, 0.46, 0.035, { color: 'gold2' }),
    S(-0.34, -0.14, 0.3, 0.3, 0.025, { color: 'gold2' }),
  ] }] },
});
add({
  id: 'find-photo-strip', name: 'Photo Booth Strip, Mostly Gone', rarity: 'once', set: 'night-out-apparently',
  flavor: 'The water kept the part that mattered.', fromLoad: 100, comesOut: 'pull', help: null,
  recipe: { colors: { paper: '#efece4', ink: '#5e5a53', frame: '#7d776d', washed: '#b6b0a5', pale: '#d8d3c8', ghost: '#eae6dc', faint: '#c9c4b9' }, layers: [{ type: 'emblem', shapes: [
    B(0.46, 1.58, { round: 0.03, color: 'paper', edge: 'ink', edgeWidth: 0.05 }),
    B(0.34, 0.32, { y: -0.57, color: 'frame' }), B(0.34, 0.32, { y: -0.19, color: 'frame' }),
    B(0.34, 0.32, { y: 0.19, color: 'washed' }), B(0.34, 0.32, { y: 0.57, color: 'pale' }),
    E(0.11, 0.08, { x: -0.09, y: -0.46, rot: 0.3, color: 'ghost' }), E(0.11, 0.08, { x: 0.09, y: -0.46, rot: -0.3, color: 'ghost' }),
    C(0.066, { x: -0.085, y: -0.62, color: 'ghost' }), C(0.066, { x: 0.085, y: -0.6, color: 'ghost' }),
    E(0.11, 0.08, { x: -0.09, y: -0.08, rot: 0.3, color: 'ghost' }), E(0.11, 0.08, { x: 0.09, y: -0.08, rot: -0.3, color: 'ghost' }),
    C(0.066, { x: -0.07, y: -0.25, color: 'ghost' }), C(0.066, { x: 0.07, y: -0.23, color: 'ghost' }),
    C(0.06, { x: -0.06, y: 0.14, color: 'faint' }), C(0.06, { x: 0.06, y: 0.16, color: 'faint' }),
  ] }] },
});

// ---------- Useful Until Washed ----------
add({
  id: 'find-bobby-pin', name: 'The Bobby Pin', rarity: 'common', set: 'useful-until-washed',
  flavor: 'Has escaped every bathroom drawer it ever entered.', fromLoad: 1, comesOut: 'pull', help: 'sockClip',
  recipe: { colors: { metal: '#2a2a2f', ink: '#0d0d10', sheen: '#6c6c77' }, layers: [{ type: 'emblem', shapes: rot2([
    S(-0.1, -0.74, -0.16, 0.78, 0.055, { color: 'metal', edge: 'ink', edgeWidth: 0.04 }),
    S(-0.1, -0.74, 0.04, -0.8, 0.055, { color: 'metal', edge: 'ink', edgeWidth: 0.04 }),
    S(0.04, -0.8, 0.16, -0.76, 0.055, { color: 'metal', edge: 'ink', edgeWidth: 0.04 }),
    S(0.16, -0.76, 0.2, -0.46, 0.05, { color: 'metal', edge: 'ink', edgeWidth: 0.04 }),
    S(0.2, -0.46, 0.06, -0.2, 0.05, { color: 'metal', edge: 'ink', edgeWidth: 0.04 }),
    S(0.06, -0.2, 0.22, 0.06, 0.05, { color: 'metal', edge: 'ink', edgeWidth: 0.04 }),
    S(0.22, 0.06, 0.06, 0.32, 0.05, { color: 'metal', edge: 'ink', edgeWidth: 0.04 }),
    S(0.06, 0.32, 0.2, 0.56, 0.05, { color: 'metal', edge: 'ink', edgeWidth: 0.04 }),
    S(0.2, 0.56, 0.1, 0.78, 0.05, { color: 'metal', edge: 'ink', edgeWidth: 0.04 }),
    S(-0.12, -0.5, -0.16, 0.5, 0.016, { color: 'sheen' }),
  ], -0.38) }] },
});
add({
  id: 'find-safety-pin', name: 'Closed Safety Pin', rarity: 'common', set: 'useful-until-washed',
  flavor: 'Closed before washing. A professional.', fromLoad: 5, comesOut: 'trap', help: null,
  recipe: { colors: { nickel: '#c3c7cc', nickel2: '#dde1e5', ink: '#62666b' }, layers: [{ type: 'emblem', shapes: [
    R(0.2, 0.075, { x: -0.6, y: 0.06, color: 'nickel', edge: 'ink', edgeWidth: 0.05 }),
    B(1.2, 0.1, { round: 0.05, y: -0.24, rot: -0.09, color: 'nickel', edge: 'ink', edgeWidth: 0.05 }),
    B(1.0, 0.085, { round: 0.04, x: 0.02, y: 0.14, rot: -0.09, color: 'nickel', edge: 'ink', edgeWidth: 0.05 }),
    B(0.22, 0.3, { round: 0.07, x: 0.6, y: -0.13, color: 'nickel2', edge: 'ink', edgeWidth: 0.05 }),
  ] }] },
});
add({
  id: 'find-tape-bit', name: 'Eleven Inches of Tape Measure', rarity: 'uncommon', set: 'useful-until-washed',
  flavor: 'The remaining inches declined to participate.', fromLoad: 20, comesOut: 'flip', help: 'closerLook',
  recipe: { colors: { tape: '#e8c341', tape2: '#f6e08c', ink: '#6f5709' }, layers: [{ type: 'emblem', shapes: rot2([
    B(1.7, 0.34, { round: 0.02, color: 'tape', edge: 'ink', edgeWidth: 0.05 }),
    S(-0.6, -0.17, -0.6, 0.06, 0.024, { color: 'ink' }),
    S(-0.36, -0.17, -0.36, 0.0, 0.024, { color: 'ink' }),
    S(-0.12, -0.17, -0.12, 0.06, 0.024, { color: 'ink' }),
    S(0.12, -0.17, 0.12, 0.0, 0.024, { color: 'ink' }),
    S(0.36, -0.17, 0.36, 0.06, 0.024, { color: 'ink' }),
    S(0.6, -0.17, 0.6, 0.0, 0.024, { color: 'ink' }),
    S(-0.82, 0.1, 0.82, 0.1, 0.018, { color: 'tape2' }),
    E(0.2, 0.3, { x: 0.86, y: 0.1, rot: 0.5, color: 'tape', edge: 'ink', edgeWidth: 0.05 }),
  ], -0.34) }] },
});
add({
  id: 'find-hair-tie', name: 'The Hair Tie', rarity: 'common', set: 'useful-until-washed',
  flavor: 'Stretched past dignity, still technically employed.', fromLoad: 3, comesOut: 'pull', help: 'remembersLook',
  recipe: { colors: { elastic: '#242429', ink: '#0c0c0f', fuzz: '#4e4e57', sheen: '#5c5c66' }, layers: [{ type: 'emblem', shapes: [
    R(0.6, 0.2, { color: 'elastic', edge: 'ink', edgeWidth: 0.05 }),
    C(0.22, { x: 0.42, y: -0.42, color: 'fuzz' }),
    S(0.5, -0.56, 0.66, -0.68, 0.024, { color: 'fuzz' }),
    S(0.56, -0.44, 0.74, -0.46, 0.024, { color: 'fuzz' }),
    S(0.34, -0.58, 0.4, -0.74, 0.024, { color: 'fuzz' }),
    S(-0.5, -0.36, -0.2, -0.58, 0.03, { color: 'sheen' }),
  ] }] },
});
add({
  id: 'find-notepad-wad', name: 'Three Notes, Now One', rarity: 'uncommon', set: 'useful-until-washed',
  flavor: 'Whatever they said has become very concise.', fromLoad: 40, comesOut: 'trap', help: null,
  recipe: { colors: { paper: '#cfdced', ink: '#76899f', crease: '#a3b3c6' }, layers: [{ type: 'emblem', shapes: [
    P([-0.66, -0.12, -0.38, -0.64, 0.2, -0.72, 0.68, -0.22, 0.6, 0.38, 0.06, 0.72, -0.5, 0.5], { color: 'paper', edge: 'ink', edgeWidth: 0.06 }),
    S(-0.42, -0.4, 0.2, 0.3, 0.026, { color: 'crease' }),
    S(0.4, -0.42, -0.08, 0.54, 0.026, { color: 'crease' }),
    S(-0.5, 0.14, 0.5, 0.06, 0.026, { color: 'crease' }),
    S(-0.16, -0.32, 0.06, -0.34, 0.03, { color: 'ink' }),
    S(-0.1, 0.36, 0.16, 0.34, 0.03, { color: 'ink' }),
  ] }] },
});
add({
  id: 'find-spare-shoelace', name: 'The Spare Shoelace', rarity: 'rare', set: 'useful-until-washed',
  flavor: 'Never met the shoe it was promised.', fromLoad: 50, comesOut: 'pull', help: 'nearEdge',
  recipe: { colors: { lace: '#f0e6d2', ink: '#9c8e74', aglet: '#b09c78' }, layers: [{ type: 'emblem', shapes: [
    E(0.36, 0.26, { x: -0.38, y: -0.18, rot: -0.5, color: 'lace', edge: 'ink', edgeWidth: 0.06 }),
    E(0.36, 0.26, { x: 0.38, y: -0.18, rot: 0.5, color: 'lace', edge: 'ink', edgeWidth: 0.06 }),
    S(-0.04, 0.06, -0.34, 0.62, 0.09, { color: 'lace', edge: 'ink', edgeWidth: 0.06 }),
    S(0.04, 0.06, 0.36, 0.58, 0.09, { color: 'lace', edge: 'ink', edgeWidth: 0.06 }),
    C(0.18, { y: 0.02, color: 'lace', edge: 'ink', edgeWidth: 0.06 }),
    B(0.11, 0.16, { x: -0.36, y: 0.66, rot: 0.4, color: 'aglet' }),
    B(0.11, 0.16, { x: 0.38, y: 0.62, rot: -0.4, color: 'aglet' }),
  ] }] },
});

// ---------- Things Nobody Throws Away ----------
add({
  id: 'find-washer', name: 'The Washer', rarity: 'common', set: 'things-nobody-throws-away',
  flavor: 'Not the appliance. Somehow less useful.', fromLoad: 15, comesOut: 'door', help: null,
  recipe: { colors: { steel: '#c6cad0', ink: '#666b71', shade: '#9ba0a7', rust: '#a5703f' }, layers: [{ type: 'emblem', shapes: [
    R(0.6, 0.28, { color: 'steel', edge: 'ink', edgeWidth: 0.06 }),
    R(0.36, 0.035, { color: 'shade' }),
    S(-0.22, -0.66, 0.06, -0.78, 0.03, { color: 'shade' }),
    E(0.13, 0.08, { x: 0.52, y: 0.42, rot: -0.7, color: 'rust' }),
  ] }] },
});
add({
  id: 'find-bread-tag', name: 'Bread Tag, Blue', rarity: 'common', set: 'things-nobody-throws-away',
  flavor: 'No bread has claimed it in weeks.', fromLoad: 10, comesOut: 'pull', help: null,
  recipe: { colors: { blue: '#2f7fd0', ink: '#14477c', edge2: '#5aa1e6' }, layers: [{ type: 'emblem', shapes: [
    B(0.9, 0.78, { round: 0.16, color: 'blue', edge: 'ink', edgeWidth: 0.06 }),
    S(0, -0.48, 0, -0.2, 0.055, { color: 'tile' }),
    C(0.25, { y: 0.06, color: 'tile' }),
    P([-0.26, -0.18, -0.13, -0.08, -0.26, 0.0], { color: 'blue' }),
    P([0.26, -0.18, 0.13, -0.08, 0.26, 0.0], { color: 'blue' }),
    S(-0.3, 0.42, 0.3, 0.42, 0.024, { color: 'edge2' }),
    S(-0.34, -0.36, -0.2, -0.36, 0.024, { color: 'edge2' }),
  ] }] },
});
add({
  id: 'find-smooth-pebble', name: 'The Good Pebble', rarity: 'uncommon', set: 'things-nobody-throws-away',
  flavor: 'Picked for a reason. The reason remains solid.', fromLoad: 25, comesOut: 'clean', help: null,
  recipe: { colors: { stone: '#4a4a4f', ink: '#27272b', quartz: '#ded9cf', sheen: '#6d6d75' }, layers: [{ type: 'emblem', shapes: [
    E(0.84, 0.58, { rot: 0.18, color: 'stone', edge: 'ink', edgeWidth: 0.06 }),
    S(-0.46, 0.1, 0.5, -0.22, 0.09, { color: 'quartz' }),
    E(0.12, 0.055, { x: -0.22, y: 0.3, color: 'quartz' }),
    E(0.3, 0.09, { x: -0.12, y: -0.32, rot: 0.2, color: 'sheen' }),
  ] }] },
});
add({
  id: 'find-plastic-cap', name: 'Cap to Something', rarity: 'common', set: 'things-nobody-throws-away',
  flavor: 'Its bottle has entered witness protection.', fromLoad: 18, comesOut: 'pull', help: null,
  recipe: { colors: { orange: '#ea7a22', orange2: '#f8b071', orange3: '#fbcfa5', ink: '#8a4008', rib: '#c2620f' }, layers: [{ type: 'emblem', shapes: [
    B(0.84, 0.66, { round: 0.16, y: 0.14, color: 'orange', edge: 'ink', edgeWidth: 0.06 }),
    S(-0.32, -0.12, -0.32, 0.34, 0.03, { color: 'rib' }),
    S(-0.16, -0.14, -0.16, 0.36, 0.03, { color: 'rib' }),
    S(0, -0.16, 0, 0.36, 0.03, { color: 'rib' }),
    S(0.16, -0.14, 0.16, 0.36, 0.03, { color: 'rib' }),
    S(0.32, -0.12, 0.32, 0.34, 0.03, { color: 'rib' }),
    E(0.44, 0.17, { y: -0.2, color: 'orange2', edge: 'ink', edgeWidth: 0.06 }),
    E(0.24, 0.08, { y: -0.23, color: 'orange3' }),
  ] }] },
});
add({
  id: 'find-hotel-keycard', name: 'Room 214 Keycard', rarity: 'rare', set: 'things-nobody-throws-away',
  flavor: 'Checkout was at eleven. It missed the meeting.', fromLoad: 60, comesOut: 'spotless', help: null,
  recipe: { colors: { teal: '#2c7c7a', ink: '#123a39', cream: '#f2ead6', stripe: '#19504e' }, layers: [{ type: 'emblem', shapes: [
    B(0.9, 0.58, { round: 0.05, color: 'teal', edge: 'ink', edgeWidth: 0.05 }),
    B(0.9, 0.09, { y: -0.17, color: 'stripe' }),
    T('214', 0.28, { y: 0.11, stroke: 0.05, color: 'cream' }),
    P([0.45, -0.29, 0.45, -0.06, 0.22, -0.29], { color: 'tile' }),
  ] }] },
});
add({
  id: 'find-brass-key', name: 'The Brass Key to Nothing Here', rarity: 'once', set: 'things-nobody-throws-away',
  flavor: 'Has remained optimistic about this door.', fromLoad: 75, comesOut: 'door', help: null,
  needs: { stat: 'cleanLoads', gte: 3 },
  recipe: { colors: { brass: '#c99a3e', brass2: '#e5bd63', ink: '#6a4a10', thread: '#b0392f' }, layers: [{ type: 'emblem', shapes: [
    S(-0.58, -0.44, -0.2, -0.52, 0.03, { color: 'thread' }),
    R(0.3, 0.13, { x: -0.48, y: 0, color: 'brass', edge: 'ink', edgeWidth: 0.06 }),
    B(0.92, 0.16, { round: 0.04, x: 0.3, y: 0, color: 'brass', edge: 'ink', edgeWidth: 0.06 }),
    B(0.1, 0.2, { x: 0.36, y: 0.16, color: 'brass', edge: 'ink', edgeWidth: 0.06 }),
    B(0.1, 0.26, { x: 0.54, y: 0.19, color: 'brass', edge: 'ink', edgeWidth: 0.06 }),
    B(0.1, 0.2, { x: 0.7, y: 0.16, color: 'brass', edge: 'ink', edgeWidth: 0.06 }),
    B(0.09, 0.3, { x: -0.1, y: 0, color: 'brass2', edge: 'ink', edgeWidth: 0.06 }),
  ] }] },
});

// the five comforts that ship, and nothing else helps (DESIGN-T2 2.5). Each reduces MOTOR or VISIBILITY
// friction, Laundry Day only, a toggle on the Clothesline page, on by default (the law of a comfort).
const comforts = [
  { id: 'nearEdge', find: 'find-spare-shoelace', name: 'The table edge', effect: 'A missed ball stops at the near edge of the table instead of rolling to the floor.' },
  { id: 'sockClip', find: 'find-bobby-pin', name: 'The clip', effect: 'One sock can be parked on a clip at the table edge while you keep looking.' },
  { id: 'closerLook', find: 'find-tape-bit', name: 'A closer look', effect: 'The sock in your hand can be looked at a little bigger. It never marks the twin.' },
  { id: 'remembersLook', find: 'find-hair-tie', name: 'Kept as it was', effect: 'The room remembers your last ball style, basket, station and look.' },
  { id: 'quietOpen', find: 'find-mint-wrapper', name: 'A quiet open', effect: 'The slow drift into the room is skipped when you come back.' },
];

for (const it of items) {
  const t = TINT[it.set];
  it.recipe.colors = { tile: t.tile, rim: t.rim, ...it.recipe.colors };
}

const out = { version: 1, chance: { small: 0.12, regular: 0.22, heavy: 0.32, mountain: 0.45 }, sets, comforts, items };
writeFileSync(new URL('../data/finds.json', import.meta.url), JSON.stringify(out, null, 1) + '\n');
console.log('items', items.length, 'sets', sets.length, 'comforts', comforts.length);
const bySet = {};
for (const i of items) bySet[i.set] = (bySet[i.set] || 0) + 1;
console.log(bySet);
const byR = {};
for (const i of items) byR[i.rarity] = (byR[i.rarity] || 0) + 1;
console.log(byR);
