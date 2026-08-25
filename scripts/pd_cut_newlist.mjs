/* PUPPY DASH — "New list" drop (Aug 25 late): bank frames for the four new
   animals, the TALL wall remake, and the painted wordmark.
   ⛔ Bank frames MUST use each animal's SAVED rig scale (meta.json) — the
   Aug 25 frames already shipped on that scale, and recomputing from the
   tallest pose would shift every frame already live. */
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const SRC = "/workspaces/lucid-winds/assets/pd-newlist-staging/New list";
const PD = "/workspaces/lucid-winds/satellites/puppy-dash";
const FILES = {
  wordmark: "file_000000002ec081f7ae078e4a0699a873.png",
  wall: "file_00000000a86881f7a62267e8c97f372c.png",
  bank: "file_00000000bba081f791290626924181fa.png",
};
const BANK_ROWS = ["fox", "bunny", "raccoon", "kitten"];   /* top to bottom, LOOKED at */
const CONTACT = 488;

const br = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const p = await br.newPage();
await p.goto("about:blank");
function save(file, dataUrl) {
  const b = Buffer.from(dataUrl.split(",")[1], "base64");
  fs.writeFileSync(file, b);
  console.log("wrote", file.replace(PD + "/", ""), (b.length / 1024).toFixed(0) + "KB");
}

/* magenta sheet -> masked component crops tagged by row (same pipeline the
   character sheets went through: loose magenta family key, flood from border,
   enclosed-magenta kill, component labels, row clustering) */
async function cutMagenta(file) {
  const b64 = fs.readFileSync(path.join(SRC, file)).toString("base64");
  return await p.evaluate(async (b64) => {
    const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
    const W = img.width, H = img.height;
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, W, H), px = d.data;
    const magF = i => px[i] > 150 && px[i + 1] < 110 && px[i + 2] > 60 && (px[i] - px[i + 1]) > 90;
    const bgMask = new Uint8Array(W * H);
    for (let j = 0; j < W * H; j++) if (magF(j * 4)) bgMask[j] = 1;
    const outside = new Uint8Array(W * H); const q = [];
    for (let xx = 0; xx < W; xx++) { q.push(xx, (H - 1) * W + xx); }
    for (let yy = 0; yy < H; yy++) { q.push(yy * W, yy * W + W - 1); }
    while (q.length) {
      const i = q.pop();
      if (outside[i] || !bgMask[i]) continue;
      outside[i] = 1;
      const xx = i % W, yy = (i / W) | 0;
      if (xx > 0) q.push(i - 1); if (xx < W - 1) q.push(i + 1);
      if (yy > 0) q.push(i - W); if (yy < H - 1) q.push(i + W);
    }
    for (let j = 0; j < W * H; j++) if (outside[j] || magF(j * 4)) px[j * 4 + 3] = 0;
    for (let j = 0; j < W * H; j++) {
      if (px[j * 4 + 3] === 0) continue;
      const xx = j % W, yy = (j / W) | 0;
      const near = (xx > 0 && px[(j - 1) * 4 + 3] === 0) || (xx < W - 1 && px[(j + 1) * 4 + 3] === 0)
        || (yy > 0 && px[(j - W) * 4 + 3] === 0) || (yy < H - 1 && px[(j + W) * 4 + 3] === 0);
      if (near) { const i4 = j * 4; if (px[i4] - px[i4 + 1] > 90 && px[i4 + 2] - px[i4 + 1] > 40 && px[i4 + 1] < 90) px[i4 + 3] = 0; }
    }
    x.putImageData(d, 0, 0);
    const seen = new Uint8Array(W * H), comps = [], lab = new Int32Array(W * H).fill(-1);
    for (let j = 0; j < W * H; j++) {
      if (seen[j] || px[j * 4 + 3] === 0) continue;
      const id = comps.length;
      let minx = W, miny = H, maxx = 0, maxy = 0, n = 0;
      const st = [j]; seen[j] = 1;
      while (st.length) {
        const i = st.pop(), xx = i % W, yy = (i / W) | 0; n++; lab[i] = id;
        if (xx < minx) minx = xx; if (xx > maxx) maxx = xx; if (yy < miny) miny = yy; if (yy > maxy) maxy = yy;
        const nb = [];
        if (xx > 0) nb.push(i - 1); if (xx < W - 1) nb.push(i + 1);
        if (yy > 0) nb.push(i - W); if (yy < H - 1) nb.push(i + W);
        if (xx > 0 && yy > 0) nb.push(i - W - 1); if (xx < W - 1 && yy > 0) nb.push(i - W + 1);
        if (xx > 0 && yy < H - 1) nb.push(i + W - 1); if (xx < W - 1 && yy < H - 1) nb.push(i + W + 1);
        for (const k of nb) { if (!seen[k] && px[k * 4 + 3] !== 0) { seen[k] = 1; st.push(k); } }
      }
      comps.push({ id, minx, miny, maxx, maxy, n });
    }
    const big = comps.filter(cc => cc.n > W * H * 0.002);
    const hs = big.map(cc => cc.maxy - cc.miny + 1).sort((a, b) => a - b);
    const medH = hs[hs.length >> 1] || 1;
    big.forEach(cc => cc.cy = (cc.miny + cc.maxy) / 2);
    big.sort((a, b) => a.cy - b.cy);
    let row = 0, lastCy = -1e9;
    big.forEach(cc => { if (cc.cy - lastCy > medH * 0.55) row++; cc.row = row; lastCy = cc.cy; });
    big.sort((a, b) => a.row - b.row || a.minx - b.minx);
    const out = [];
    for (const m of big) {
      const w = m.maxx - m.minx + 1, h = m.maxy - m.miny + 1;
      const c2 = document.createElement("canvas"); c2.width = w; c2.height = h;
      const g2 = c2.getContext("2d", { willReadFrequently: true });
      g2.drawImage(c, m.minx, m.miny, w, h, 0, 0, w, h);
      const cd = g2.getImageData(0, 0, w, h), cp = cd.data;
      for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
        const k = (yy * w + xx) * 4;
        if (cp[k + 3] !== 0 && lab[(m.miny + yy) * W + (m.minx + xx)] !== m.id) cp[k + 3] = 0;
      }
      g2.putImageData(cd, 0, 0);
      out.push({ png: c2.toDataURL("image/png"), w, h, row: m.row });
    }
    return out;
  }, b64);
}

/* ---- 1. bank frames on each animal's saved scale ---- */
{
  const poses = await cutMagenta(FILES.bank);
  const rows = {};
  poses.forEach(ps => { (rows[ps.row] = rows[ps.row] || []).push(ps); });
  console.log("bank sheet rows:", Object.keys(rows).map(r => r + ":" + rows[r].length).join(" "));
  for (const r of Object.keys(rows)) {
    const animal = BANK_ROWS[r - 1];
    if (!animal) { console.log("  row " + r + " unmapped, skipped"); continue; }
    const metaPath = path.join(PD, "art", "characters", animal, "meta.json");
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    /* ⛔ NOT meta.rig.scale: this sheet is a different generation BATCH, and
       the kitten came back drawn twice the size (saved scale put its content
       at 657px on a 512 canvas — clipped). Cross-batch, the only honest
       anchor is the animal's own run height: a bank is a lean of the run,
       drawn to ~1.08x of it. */
    const rawTall = Math.max(...rows[r].map(fr => fr.h));
    const scale = (meta.states.run.contentH * 1.08) / rawTall;
    let contentH = 0;
    for (let i = 0; i < rows[r].length; i++) {
      const fr = rows[r][i];
      const out = await p.evaluate(async (src, scale, CONTACT) => {
        const img = new Image(); img.src = src;
        await new Promise(res => { img.onload = res; });
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const cv = document.createElement("canvas"); cv.width = 512; cv.height = 512;
        const cx = cv.getContext("2d"); cx.imageSmoothingQuality = "high";
        cx.drawImage(img, Math.round((512 - w) / 2), CONTACT - h, w, h);
        return { png: cv.toDataURL("image/png"), h };
      }, fr.png, scale, CONTACT);
      contentH = Math.max(contentH, out.h);
      save(path.join(PD, "art", "characters", animal, "bank_" + String(i + 1).padStart(2, "0") + ".png"), out.png);
    }
    meta.states.bank = { n: rows[r].length, contentH };
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
    console.log("  " + animal + "/bank: " + rows[r].length + " frames at saved scale " + scale + ", contentH " + contentH);
  }
}

/* ---- 2. the wall (single component) -> art/obstacles/wall.png ---- */
{
  const poses = await cutMagenta(FILES.wall);
  poses.sort((a, b) => b.w * b.h - a.w * a.h);
  const wall = poses[0];
  console.log("wall: " + poses.length + " component(s), took " + wall.w + "x" + wall.h);
  /* onto the RIG canvas (512, contact y=488) like every other obstacle
     sprite, so drawObSprite's refH math holds. Content height 464 -> the
     engine renders it via OB_SPR.wall {h, refH:464}. */
  const url = await p.evaluate(async (src) => {
    const img = new Image(); img.src = src; await new Promise(r => { img.onload = r; });
    const h = 464, w = Math.round(img.width * (h / img.height));
    const c = document.createElement("canvas"); c.width = 512; c.height = 512;
    const x = c.getContext("2d"); x.imageSmoothingQuality = "high";
    x.drawImage(img, Math.round((512 - w) / 2), 488 - h, w, h);
    return c.toDataURL("image/png");
  }, wall.png);
  save(path.join(PD, "art", "obstacles", "wall.png"), url);
}

/* ---- 3. wordmark: near-white background keyed off, tight ---- */
{
  const b64 = fs.readFileSync(path.join(SRC, FILES.wordmark)).toString("base64");
  const url = await p.evaluate(async (b64) => {
    const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
    const W = img.width, H = img.height;
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, W, H), px = d.data;
    let br_ = 0, bg = 0, bb = 0, n = 0;
    for (let xx = 0; xx < W; xx += 8) { for (const yy of [0, H - 1]) { const i = (yy * W + xx) * 4; br_ += px[i]; bg += px[i + 1]; bb += px[i + 2]; n++; } }
    br_ /= n; bg /= n; bb /= n;
    /* tight tolerance: the white sticker outline is part of the design; only
       the flat background may go. Flood only (no global key). */
    const tol = 8;
    const bgm = new Uint8Array(W * H);
    for (let i = 0, j = 0; i < px.length; i += 4, j++) {
      const dr = px[i] - br_, dg = px[i + 1] - bg, db = px[i + 2] - bb;
      if (dr * dr + dg * dg + db * db < tol * tol) bgm[j] = 1;
    }
    const outside = new Uint8Array(W * H); const q = [];
    for (let xx = 0; xx < W; xx++) { q.push(xx, (H - 1) * W + xx); }
    for (let yy = 0; yy < H; yy++) { q.push(yy * W, yy * W + W - 1); }
    while (q.length) {
      const i = q.pop();
      if (outside[i] || !bgm[i]) continue;
      outside[i] = 1;
      const xx = i % W, yy = (i / W) | 0;
      if (xx > 0) q.push(i - 1); if (xx < W - 1) q.push(i + 1);
      if (yy > 0) q.push(i - W); if (yy < H - 1) q.push(i + W);
    }
    let minx = W, maxx = 0, miny = H, maxy = 0;
    for (let j = 0; j < W * H; j++) {
      if (outside[j]) { px[j * 4 + 3] = 0; continue; }
      const xx = j % W, yy = (j / W) | 0;
      if (xx < minx) minx = xx; if (xx > maxx) maxx = xx;
      if (yy < miny) miny = yy; if (yy > maxy) maxy = yy;
    }
    x.putImageData(d, 0, 0);
    /* crop + downscale to 1000w (renders ~320 CSS px) */
    const w2 = maxx - minx + 1, h2 = maxy - miny + 1;
    const w3 = Math.min(1000, w2), h3 = Math.round(h2 * (w3 / w2));
    const c2 = document.createElement("canvas"); c2.width = w3; c2.height = h3;
    const g2 = c2.getContext("2d"); g2.imageSmoothingQuality = "high";
    g2.drawImage(c, minx, miny, w2, h2, 0, 0, w3, h3);
    return c2.toDataURL("image/webp", 0.9);
  }, b64);
  fs.mkdirSync(path.join(PD, "art", "ui"), { recursive: true });
  save(path.join(PD, "art", "ui", "wordmark.webp"), url);
}
await br.close();
console.log("DONE");
