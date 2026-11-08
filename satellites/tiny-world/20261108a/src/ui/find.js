// Find the one she named (design 19 A6, Astra B4, the locator). A tap on the name on a creature's card (the paper doll's title
// row, ui/doll.js) brings the camera to it, and one heart beats over it when the camera gets there. While her finger is still
// down on the name and it is off the screen, one arrow at the edge of the field points the way to it; on the screen, no arrow.
//
// It is the VIEW's doing, like the hello a saved world says (ui/welcome.js): no command, no effect record, no field, so the world
// does not move and a save does not change. DOM free, so a fixture asks it exactly what the page does (main.js keeps the state
// in ui.find and moves the camera with it; render.js draws the heart; the camera is camera.js's, which reads nothing of the page).
// F is ui.json's `locator` (its numbers: the glide, the heart, the arrow, the card's clearance). Fixture a-tap-on-her-name-finds-her;
// the page itself, real taps, dev/look-a6.mjs.
import { ent, HELD } from '../sim/ents.js';
import { struct } from '../sim/world.js';

// A card that shows a name is a button: her named ones, and a pet or a person born with a name. A card that says only what the
// one on it is ("Sheep") has no name on it to tap, and a touch there goes through to the field, as all of the card did before.
export const canFind = (w, e) => e >= 0 && !!w.E.name[e];

// The state the page keeps for one find (main.js ui.find). h: whose; x, y, e: where it is (findPlace); down: her finger is on the
// name; glide, t, x0, y0: the camera on its way (from where, since when); ax, ay: where the camera is going; t0: when it got
// there (the heart's start, 0 before).
export const newFind = (h) => ({ h, x: 0, y: 0, e: -1, down: false, glide: false, t: 0, x0: 0, y0: 0, ax: 0, ay: 0, t0: 0 });

// Where the one with handle h is, written into s (world px, where its feet are). Out of doors: where it stands (e, its slot: the
// heart is drawn over its head). Indoors, the place it went in, which is where it is: the house it went into (e -1, the heart
// over the house) or the UFO carrying it (e, the UFO's slot). Its errand fields are not asked: a visit never sends anyone
// indoors (a person goes in to shelter, ai/decide.js), and the point of an old errand can be across the map. False when it is
// gone, or in her hand (where her finger is).
export function findPlace(w, h, s) {
  const e = ent(w, h), E = w.E;
  if (e < 0 || E.dead[e]) return false;
  const inside = E.inside[e];
  if (inside === HELD) return false;
  if (inside > 0) {
    const home = struct(w, inside);
    if (home) { s.x = home.tx * w.T + 4; s.y = home.ty * w.T + 6; s.e = -1; return true; }
  } else if (inside < 0) {
    const u = ent(w, -inside);
    if (u >= 0) { s.x = E.x[u]; s.y = E.y[u]; s.e = u; return true; }
  }
  s.x = E.x[e]; s.y = E.y[e]; s.e = inside ? -1 : e;
  return true;
}

// Where the camera goes for a place: the place in the middle of the field (its body, 4 px over its feet, as the follow-cam aims),
// held on the world the way camera.js holds every view, so a place by the world's edge is shown as near the middle as the edge
// lets it. Never under her card when the camera can help it (`card`: her card on the field, {x0, y0, x1, y1} in canvas device px,
// from its row of buttons to the field's foot; null when none). Three tries, and the first the camera can hold on the world with
// the place's feet clear of the card wins: the middle; above the card (feet F.clear CSS px over its top, never more than a
// quarter of the field up); in the middle of the field to the right of the card (by the world's bottom edge the camera cannot go
// down far enough for the second). None (the world's corner under the card): the last. Looked at, 3 Oct: on a 375 x 667 phone
// the card's pencil stands on the middle of the field, and the one she found stood under it.
function aim(s, cam, F, card) {
  const x = cam.x, y = cam.y, z = cam.zoom, feet = 4 * z, clear = F.clear * cam.dpr;
  for (let k = 0; k < (card ? 3 : 1); k++) {
    const px = k === 2 ? (card.x1 + cam.cw) / 2 : cam.cw / 2, py = k === 1 ? Math.max(cam.ch / 4, card.y0 - clear - feet) : cam.ch / 2;
    cam.x = s.x - (px - cam.cw / 2) / z; cam.y = s.y - 4 - (py - cam.ch / 2) / z; cam.clampView();
    const sx = cam.cw / 2 + (s.x - cam.x) * z, sy = cam.ch / 2 + (s.y - 4 - cam.y) * z; // where it stands on the screen then
    if (!card || !(sx >= card.x0 && sx <= card.x1 && sy + feet > card.y0)) break;
  }
  s.ax = cam.x; s.ay = cam.y;
  cam.x = x; cam.y = y;
}

// Go: the camera glides from where it is to the place over F.glideMs, eased in and out, following the place if it moves. Already
// there (the view would not move by a pixel): the heart at once.
export function goFind(s, cam, F, now, card = null) {
  aim(s, cam, F, card);
  s.x0 = cam.x; s.y0 = cam.y; s.t = now; s.t0 = 0;
  s.glide = Math.hypot(s.ax - cam.x, s.ay - cam.y) * cam.zoom >= cam.dpr; // (a CSS px of difference)
  if (!s.glide) s.t0 = now;
}

// One frame of the glide. True on the frame the camera gets there, which is when the heart begins.
export function stepFind(s, cam, F, now, card = null) {
  if (!s.glide) return false;
  aim(s, cam, F, card);
  const u = Math.min(1, Math.max(0, (now - s.t) / F.glideMs)), k = u * u * (3 - 2 * u);
  cam.x = s.x0 + (s.ax - s.x0) * k; cam.y = s.y0 + (s.ay - s.y0) * k; cam.update();
  if (u < 1) return false;
  s.glide = false; s.t0 = now;
  return true;
}

// The heart, `age` ms after the camera got there, written into out: its size as a part of the game's heart (it swells once over
// F.beatMs, by F.swell, and settles), how solid it is (it holds, then goes, the way the welcome's heart goes) and how far it has
// risen (px). False once it is over: one heart, one beat.
export function heartAt(age, F, out) {
  if (!(age >= 0 && age < F.heartMs)) return false;
  const t = age / F.heartMs;
  out.size = 1 + (age < F.beatMs ? F.swell * Math.sin((Math.PI * age) / F.beatMs) : 0);
  out.alpha = Math.max(0, 1 - t * t);
  out.rise = Math.round(t * 4);
  return true;
}

// While her finger is down on the name: where the one arrow goes, written into out, or false when the point (x, y) is on the
// screen (no arrow). Canvas device px: where the line from the middle of the field to the point crosses the field's edge, `inset`
// device px in (half the arrow and a gap: all of it shows), and which of eight ways it points: 0 east, 1 south east, 2 south ...
// 7 north east. Never on her card or under it (`card`, as aim's, to the field's foot: her finger is on its name and her hand is
// under it): an arrow that would be goes to the nearest place just past the card on an edge toward the one she named (above or
// below the card on the side edge toward it; left or right of it on the top or bottom edge toward it, but not across the middle of
// the field from it), still pointing the way. Looked at, 3 Oct: on a 375 phone it lay on the name, under her finger; slid down, it
// lay under her hand; slid along the bottom, it stood on the far side of the field from the sheep it pointed at.
export function edgeArrow(cam, x, y, inset, out, card = null) {
  const sx = cam.ox + x * cam.zoom, sy = cam.oy + y * cam.zoom;
  if (sx >= 0 && sx < cam.cw && sy >= 0 && sy < cam.ch) return false;
  const cx = cam.cw / 2, cy = cam.ch / 2, dx = sx - cx, dy = sy - cy;
  const f = Math.min(dx ? Math.max(1, cx - inset) / Math.abs(dx) : Infinity, dy ? Math.max(1, cy - inset) / Math.abs(dy) : Infinity);
  out.x = cx + dx * f; out.y = cy + dy * f;
  out.dir = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8;
  const onCard = (ax, ay) => ax + inset > card.x0 && ax - inset < card.x1 && ay + inset > card.y0 && ay - inset < card.y1;
  if (card && onCard(out.x, out.y)) {
    const ex = dx < 0 ? inset : cam.cw - inset, ey = dy < 0 ? inset : cam.ch - inset; // the side edge and the top or bottom edge toward it
    const inside = (ax, ay) => ax >= inset - 0.5 && ax <= cam.cw - inset + 0.5 && ay >= inset - 0.5 && ay <= cam.ch - inset + 0.5 && !onCard(ax, ay);
    let bx = 0, by = 0, best = Infinity;
    const take = (ax, ay, ok) => { const d = Math.hypot(ax - out.x, ay - out.y); if (ok && inside(ax, ay) && d < best) { best = d; bx = ax; by = ay; } };
    const along = (ax) => Math.abs(dx) < cam.cw * 0.1 || (ax - cx) * dx > 0; // (along the top or bottom: not across the middle from it)
    take(ex, card.y0 - inset, true); take(ex, card.y1 + inset, true);
    take(card.x0 - inset, ey, along(card.x0 - inset)); take(card.x1 + inset, ey, along(card.x1 + inset));
    if (best < Infinity) { out.x = bx; out.y = by; }
  }
  return true;
}
