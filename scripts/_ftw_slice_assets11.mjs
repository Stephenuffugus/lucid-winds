/* Slice Stephen's Assets11 drop (2026-08-25) for Flock the World.
   Three jobs, all staged into art-drop/Assets11-cut/ for review before any
   file is promoted into art/:
   1. Two 3x2 cast sheets on magenta -> 12 portrait cells -> 200x200 webp
      (grid DETECTED off the magenta profile, never assumed).
   2. One UI sheet on magenta -> connected components -> alpha PNGs.
   3. Five widescreen plates -> 820w webp (event art, matches art/bg sizing).
*/
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const SRC = "/workspaces/lucid-winds/assets/ftw-assets11-staging/Assets11";
const OUT = "/workspaces/lucid-winds/satellites/flock-the-world/art-drop/Assets11-cut";
for (const d of ["cast", "ui", "plates"]) fs.mkdirSync(path.join(OUT, d), { recursive: true });

const CAST_SHEETS = {
  a: "file_00000000054c81f7b62cdb33199feb6e.png",
  b: "file_00000000d0f081f7a4becebd713efb55.png",
};
const UI_SHEET = "file_00000000347881f78016218aa088284f.png";
const PLATES = {
  fd_newsroom: "file_00000000504081f7ae8387f58cc1a3a7.png",
  fd_meeting: "file_00000000c03c81f7852c3cd8bada2393.png",
  fd_wall: "file_00000000d14881f79c3034c4dbc538fe.png",
  fd_armsfair: "file_00000000e91881f7a45501e0f59e14a6.png",
  fd_armsfair2: "file_00000000f23881f78fe93d762dffa0c5.png",
};

const br = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const p = await br.newPage();

async function load(file) {
  const b64 = fs.readFileSync(path.join(SRC, file)).toString("base64");
  return b64;
}
function save(dir, name, dataUrl) {
  const b = Buffer.from(dataUrl.split(",")[1], "base64");
  fs.writeFileSync(path.join(OUT, dir, name), b);
  console.log("  wrote", dir + "/" + name, (b.length / 1024).toFixed(0) + "KB");
}

/* ---- 1. cast sheets ---- */
for (const [key, file] of Object.entries(CAST_SHEETS)) {
  const b64 = await load(file);
  const res = await p.evaluate(async (b64) => {
    const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
    const W = img.width, H = img.height;
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const x = c.getContext("2d"); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, W, H).data;
    const mag = i => d[i] > 150 && d[i + 2] > 150 && d[i] - d[i + 1] > 60 && d[i + 2] - d[i + 1] > 60;
    const colMag = [], rowMag = [];
    for (let xx = 0; xx < W; xx++) { let m = 0; for (let y = 0; y < H; y += 4) if (mag((y * W + xx) * 4)) m++; colMag.push(m / (H / 4)); }
    for (let y = 0; y < H; y++) { let m = 0; for (let xx = 0; xx < W; xx += 4) if (mag((y * W + xx) * 4)) m++; rowMag.push(m / (W / 4)); }
    const spans = prof => { const out = []; let s = null;
      for (let i = 0; i < prof.length; i++) { const solid = prof[i] < 0.5;
        if (solid && s == null) s = i; if ((!solid || i === prof.length - 1) && s != null) { if (i - s > 60) out.push([s, i]); s = null; } }
      return out; };
    const cs = spans(colMag), rs = spans(rowMag);
    const out = [];
    for (let r = 0; r < rs.length; r++) for (let cc = 0; cc < cs.length; cc++) {
      const [x0, x1] = cs[cc], [y0, y1] = rs[r];
      const w = x1 - x0, h = y1 - y0;
      /* square centre crop, inset 1.5% per edge to shave magenta fringe, then 200x200 */
      const side = Math.min(w, h) * 0.97;
      const sx = x0 + (w - side) / 2, sy = y0 + (h - side) / 2;
      const c2 = document.createElement("canvas"); c2.width = 200; c2.height = 200;
      const x2 = c2.getContext("2d");
      x2.imageSmoothingQuality = "high";
      x2.drawImage(img, sx, sy, side, side, 0, 0, 200, 200);
      out.push({ r, c: cc, url: c2.toDataURL("image/webp", 0.92) });
    }
    return { rows: rs.length, cols: cs.length, cells: out };
  }, b64);
  console.log("cast sheet", key, "grid", res.rows + "x" + res.cols);
  for (const cell of res.cells) save("cast", key + (cell.r * res.cols + cell.c + 1) + ".webp", cell.url);
}

/* ---- 2. UI sheet: connected components, magenta knocked to alpha ---- */
{
  const b64 = await load(UI_SHEET);
  const res = await p.evaluate(async (b64) => {
    const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
    const W = img.width, H = img.height;
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const x = c.getContext("2d"); x.drawImage(img, 0, 0);
    const id = x.getImageData(0, 0, W, H); const d = id.data;
    const mag = i => d[i] > 150 && d[i + 2] > 150 && d[i] - d[i + 1] > 60 && d[i + 2] - d[i + 1] > 60;
    /* label connected non-magenta components (4-neighbour flood, iterative) */
    const lab = new Int32Array(W * H).fill(-1);
    const comps = [];
    for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) {
      const pi = yy * W + xx;
      if (lab[pi] >= 0 || mag(pi * 4)) continue;
      const cid = comps.length;
      const comp = { x0: xx, y0: yy, x1: xx, y1: yy, n: 0 };
      const stack = [pi]; lab[pi] = cid;
      while (stack.length) {
        const q = stack.pop(); const qy = (q / W) | 0, qx = q % W;
        comp.n++;
        if (qx < comp.x0) comp.x0 = qx; if (qx > comp.x1) comp.x1 = qx;
        if (qy < comp.y0) comp.y0 = qy; if (qy > comp.y1) comp.y1 = qy;
        const nb = [q - 1, q + 1, q - W, q + W];
        for (const b of nb) {
          if (b < 0 || b >= W * H) continue;
          const by = (b / W) | 0, bx = b % W;
          if (Math.abs(bx - qx) + Math.abs(by - qy) !== 1) continue;
          if (lab[b] >= 0 || mag(b * 4)) continue;
          lab[b] = cid; stack.push(b);
        }
      }
      comps.push(comp);
    }
    const big = comps.map((c2, i) => ({ ...c2, id: i })).filter(c2 => c2.n > 4000);
    /* merge components whose bboxes overlap or sit within 12px (an icon's
       detached glow ring must ship with its icon) */
    let merged = true;
    while (merged) {
      merged = false;
      for (let i = 0; i < big.length && !merged; i++) for (let j = i + 1; j < big.length && !merged; j++) {
        const a = big[i], b = big[j];
        if (a.x0 < b.x1 + 12 && b.x0 < a.x1 + 12 && a.y0 < b.y1 + 12 && b.y0 < a.y1 + 12) {
          a.x0 = Math.min(a.x0, b.x0); a.y0 = Math.min(a.y0, b.y0);
          a.x1 = Math.max(a.x1, b.x1); a.y1 = Math.max(a.y1, b.y1); a.n += b.n;
          big.splice(j, 1); merged = true;
        }
      }
    }
    big.sort((a, b) => (a.y0 - b.y0) || (a.x0 - b.x0));
    /* knock magenta to alpha across the whole image once */
    for (let pi = 0; pi < W * H; pi++) {
      const i4 = pi * 4;
      if (mag(i4)) d[i4 + 3] = 0;
      /* halo scrub: pink-leaning edge pixels */
      else if (d[i4] - d[i4 + 1] > 90 && d[i4 + 2] - d[i4 + 1] > 40 && d[i4 + 1] < 80) d[i4 + 3] = 0;
    }
    x.putImageData(id, 0, 0);
    const out = [];
    for (const comp of big) {
      const pad = 6;
      const cx0 = Math.max(0, comp.x0 - pad), cy0 = Math.max(0, comp.y0 - pad);
      const cw = Math.min(W, comp.x1 + pad) - cx0, ch = Math.min(H, comp.y1 + pad) - cy0;
      const c2 = document.createElement("canvas"); c2.width = cw; c2.height = ch;
      c2.getContext("2d").drawImage(c, cx0, cy0, cw, ch, 0, 0, cw, ch);
      out.push({ x: cx0, y: cy0, w: cw, h: ch, url: c2.toDataURL("image/png") });
    }
    return out;
  }, b64);
  console.log("ui sheet components:", res.length);
  /* name by reading order; the sheet layout is known from looking at it */
  const NAMES = ["icon_pop_ledger", "icon_region_pop", "icon_notif_queue", "icon_sound",
    "wire_bar", "toast_panel", "modal_panel"];
  res.forEach((comp, i) => {
    const nm = NAMES[i] || ("ui_extra_" + i);
    console.log("  comp", nm, comp.w + "x" + comp.h, "at", comp.x + "," + comp.y);
    save("ui", nm + ".png", comp.url);
  });
}

/* ---- 3. plates -> 820w webp ---- */
for (const [name, file] of Object.entries(PLATES)) {
  const b64 = await load(file);
  const url = await p.evaluate(async (b64) => {
    const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
    const w = 820, h = Math.round(img.height * (820 / img.width));
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d"); x.imageSmoothingQuality = "high";
    x.drawImage(img, 0, 0, w, h);
    return c.toDataURL("image/webp", 0.85);
  }, b64);
  save("plates", name + ".webp", url);
}

await br.close();
console.log("DONE");
