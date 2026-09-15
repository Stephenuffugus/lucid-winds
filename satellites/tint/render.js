/* TINT's workshop, drawn (plans/tint/HANDOFF-TINT.md 3.2, 3.3 and sections 6 and 7): the vats with their recipes, the pour and the
 * cloth. Canvas only; nothing here knows a rule, main.js hands in the dye, the parts and how far the pour has gone.
 *
 * Every swatch is filled with exactly the colour colour.js mixes, a flat fill, never dithered or blended by the canvas, so the art
 * gate can read the mixed hex off the pixels (T7 is measured on what the child sees). The recipe is drawn two ways (T9):
 * continuous, as two bands of liquid in the vat in proportion; discretized, as jugs to count. The pour (the handoff's step 2):
 * two streams meet in the vat, the colour resolves over 400 ms from streaks to one colour, then the cloth below takes it from its
 * bottom edge up.
 */
import { mixLinear, WHITE } from './colour.js?v=20260916g';

export const RESOLVE_MS = 400, CLOTH_MS = 500, STREAM_MS = 300;
const INK = '#2b2a26', VAT = '#6b5a48', VAT_RIM = '#8a7560', BENCH = '#cdbca3', JUG = '#9b8a76';

/* the canvas at its CSS size in device pixels; returns the context and its CSS size */
export function fit(canvas) {
  const W = canvas.clientWidth, H = canvas.clientHeight, dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
  if (canvas.width !== W * dpr || canvas.height !== H * dpr) { canvas.width = W * dpr; canvas.height = H * dpr; }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  return { ctx, W, H };
}

/* where the vat, the cloth and the jugs stand in a canvas of W by H */
export function layout(W, H) {
  const vat = { x: Math.round(W * 0.18), y: Math.round(H * 0.18), w: Math.round(W * 0.64), h: Math.round(H * 0.42) };
  const cloth = { x: Math.round(W * 0.26), y: Math.round(H * 0.68), w: Math.round(W * 0.48), h: Math.round(H * 0.26) };
  return { vat, cloth };
}

function drawBench(ctx, W, H) {
  ctx.fillStyle = BENCH;
  ctx.fillRect(0, 0, W, H);
}

function drawVatShell(ctx, v) {
  ctx.fillStyle = VAT;
  ctx.fillRect(v.x - 6, v.y, 6, v.h + 6);
  ctx.fillRect(v.x + v.w, v.y, 6, v.h + 6);
  ctx.fillRect(v.x - 6, v.y + v.h, v.w + 12, 6);
  ctx.fillStyle = VAT_RIM;
  ctx.fillRect(v.x - 10, v.y - 4, v.w + 20, 5);
}

/* the recipe before the pour: continuous as two bands in proportion (dye below, white above), discretized as jugs to count */
export function drawRecipe(ctx, W, H, { dye, dyeParts, whiteParts, representation }) {
  drawBench(ctx, W, H);
  const { vat, cloth } = layout(W, H);
  drawVatShell(ctx, vat);
  if (representation === 'discretized') {
    const total = dyeParts + whiteParts, per = Math.max(1, Math.min(6, Math.ceil(total / 2)));
    const size = Math.max(8, Math.floor(Math.min(vat.w / per, vat.h / 2) * 0.7));
    const jug = (i, colour) => {
      const col = i % per, row = Math.floor(i / per), x = vat.x + Math.round((vat.w - per * size * 1.3) / 2 + col * size * 1.3), y = vat.y + vat.h - Math.round((row + 1) * size * 1.3);
      ctx.fillStyle = JUG; ctx.fillRect(x - 2, y - 2, size + 4, size + 4);
      ctx.fillStyle = colour; ctx.fillRect(x, y, size, size);
    };
    let i = 0;
    /* half jugs (5 : 2.5) draw as a half filled jug */
    for (let k = 0; k < Math.ceil(dyeParts); k++, i++) jug(i, k + 1 > dyeParts ? mixLinear(dye, 1, 1).hex : dye);
    for (let k = 0; k < Math.ceil(whiteParts); k++, i++) jug(i, WHITE);
  } else {
    const share = dyeParts / (dyeParts + whiteParts), inner = vat.h - 8, dyeH = Math.round(inner * share);
    ctx.fillStyle = dye; ctx.fillRect(vat.x, vat.y + vat.h - dyeH, vat.w, dyeH);
    ctx.fillStyle = WHITE; ctx.fillRect(vat.x, vat.y + 8, vat.w, inner - dyeH);
  }
  ctx.fillStyle = '#e9e1d2'; ctx.fillRect(cloth.x, cloth.y, cloth.w, cloth.h);
  ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(cloth.x + 0.5, cloth.y + 0.5, cloth.w - 1, cloth.h - 1);
}

/* the pour at time t in ms: streams (0 to STREAM_MS), streaks resolving to one colour (to STREAM_MS + RESOLVE_MS), the cloth taking
   the colour from its bottom edge (to the end); returns the mixed colour and whether the pour is over */
export function drawPour(ctx, W, H, { dye, dyeParts, whiteParts }, t) {
  drawBench(ctx, W, H);
  const { vat, cloth } = layout(W, H), mixed = mixLinear(dye, dyeParts, whiteParts).hex;
  drawVatShell(ctx, vat);
  const share = dyeParts / (dyeParts + whiteParts);
  if (t < STREAM_MS) {
    const p = Math.max(0, t) / STREAM_MS, fill = Math.round((vat.h - 8) * p);
    ctx.fillStyle = dye; ctx.fillRect(vat.x + Math.round(vat.w * 0.3), 0, 8, vat.y + vat.h - fill);
    ctx.fillStyle = WHITE; ctx.fillRect(vat.x + Math.round(vat.w * 0.65), 0, 8, vat.y + vat.h - fill);
    const stripe = 10;
    for (let y = vat.y + vat.h - fill, k = 0; y < vat.y + vat.h; y += stripe, k++) {
      ctx.fillStyle = k % 2 ? WHITE : dye;
      ctx.fillRect(vat.x, y, vat.w, Math.min(stripe, vat.y + vat.h - y));
    }
  } else if (t < STREAM_MS + RESOLVE_MS) {
    /* streaks thinning into the mixed colour: the share of streaked rows falls to none */
    const p = (t - STREAM_MS) / RESOLVE_MS, stripe = 10;
    for (let y = vat.y + 8, k = 0; y < vat.y + vat.h; y += stripe, k++) {
      const streaky = ((k * 7919) % 100) / 100 >= p;
      ctx.fillStyle = streaky ? (k % 2 ? (share > 0.5 ? mixed : WHITE) : dye) : mixed;
      ctx.fillRect(vat.x, y, vat.w, Math.min(stripe, vat.y + vat.h - y));
    }
  } else {
    ctx.fillStyle = mixed; ctx.fillRect(vat.x, vat.y + 8, vat.w, vat.h - 8);
  }
  const tc = t - STREAM_MS - RESOLVE_MS;
  ctx.fillStyle = '#e9e1d2'; ctx.fillRect(cloth.x, cloth.y, cloth.w, cloth.h);
  if (tc > 0) {
    const h = Math.min(cloth.h, Math.round(cloth.h * tc / CLOTH_MS));
    ctx.fillStyle = mixed; ctx.fillRect(cloth.x, cloth.y + cloth.h - h, cloth.w, h);
  }
  ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(cloth.x + 0.5, cloth.y + 0.5, cloth.w - 1, cloth.h - 1);
  return { mixed, done: tc >= CLOTH_MS };
}

/* the pour's end without motion (less motion): the vat and the cloth in the mixed colour at once */
export function drawPoured(ctx, W, H, recipe) {
  return drawPour(ctx, W, H, recipe, STREAM_MS + RESOLVE_MS + CLOTH_MS);
}

/* the centre of the cloth in CSS pixels, where a gate reads the mixed colour */
export function clothCentre(W, H) {
  const { cloth } = layout(W, H);
  return [cloth.x + Math.floor(cloth.w / 2), cloth.y + Math.floor(cloth.h / 2)];
}
