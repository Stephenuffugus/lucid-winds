/* PUPPY DASH — world + pickups intake (Aug 25 "More assets" drop).
   Six generations -> game-ready files:
     sky   (opaque)        -> art/environment/sky.jpg
     road  (opaque tile)   -> art/environment/road.jpg
     treeline (cream bg)   -> art/environment/treeline.png  (alpha band)
     fence    (cream bg)   -> art/environment/fence.png     (alpha band)
     props    (magenta)    -> art/environment/props/{tree,bench,flowers}.png
     pickups  (magenta)    -> art/pickups/{bone,bone_gold,magnet,jetpack}.png
*/
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const SRC = "/workspaces/lucid-winds/assets/pd-more-staging/More assets";
const ENV = "/workspaces/lucid-winds/satellites/puppy-dash/art/environment";
const PICK = "/workspaces/lucid-winds/satellites/puppy-dash/art/pickups";
fs.mkdirSync(path.join(ENV, "props"), { recursive: true });
fs.mkdirSync(PICK, { recursive: true });

const FILES = {
  treeline: "file_00000000b4fc81f78ead1d752ce8310c.png",
  pickups: "file_000000002e8c81f7b2b9adafcb495cf2.png",
  sky: "file_0000000059a081f7b8c05e2b24eda831.png",
  fence: "file_000000001a7c81f7806b7721a2dfa59b.png",
  props: "file_00000000a77881f7848628c134bbac81.png",
  road: "file_00000000184c81f7936f201d4fd8d8d2.png",
};

const br = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const p = await br.newPage();
await p.goto("about:blank");

function save(file, dataUrl) {
  const b = Buffer.from(dataUrl.split(",")[1], "base64");
  fs.writeFileSync(file, b);
  console.log("wrote", file.replace(/^.*puppy-dash\//, ""), (b.length / 1024).toFixed(0) + "KB");
}
async function loadIn(file) { return fs.readFileSync(path.join(SRC, file)).toString("base64"); }

/* ---- opaque conversions: sky (scaled to 1200w) + road (tile scaled to 512) */
for (const [name, w] of [["sky", 1200], ["road", 512]]) {
  const b64 = await loadIn(FILES[name]);
  const url = await p.evaluate(async (b64, w) => {
    const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
    const h = Math.round(img.height * (w / img.width));
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d"); x.imageSmoothingQuality = "high";
    x.drawImage(img, 0, 0, w, h);
    return c.toDataURL("image/jpeg", 0.85);
  }, b64, w);
  save(path.join(ENV, name + ".jpg"), url);
}

/* ---- cream-background bands: key the border colour, crop to content ---- */
for (const name of ["treeline", "fence"]) {
  const b64 = await loadIn(FILES[name]);
  const url = await p.evaluate(async (b64) => {
    const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
    const W = img.width, H = img.height;
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const x = c.getContext("2d"); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, W, H), px = d.data;
    /* border average = the cream */
    let br_ = 0, bg = 0, bb = 0, n = 0;
    for (let xx = 0; xx < W; xx += 8) { for (const yy of [0, H - 1]) { const i = (yy * W + xx) * 4; br_ += px[i]; bg += px[i + 1]; bb += px[i + 2]; n++; } }
    br_ /= n; bg /= n; bb /= n;
    const tol = 26;   /* cream keys tight: the art is saturated and outlined */
    const bgm = new Uint8Array(W * H);
    for (let i = 0, j = 0; i < px.length; i += 4, j++) {
      const dr = px[i] - br_, dg = px[i + 1] - bg, db = px[i + 2] - bb;
      if (dr * dr + dg * dg + db * db < tol * tol) bgm[j] = 1;
    }
    /* flood from border so cream INSIDE the art (fence pickets!) survives */
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
    const w2 = maxx - minx + 1, h2 = maxy - miny + 1;
    const c2 = document.createElement("canvas"); c2.width = w2; c2.height = h2;
    c2.getContext("2d").drawImage(c, minx, miny, w2, h2, 0, 0, w2, h2);
    return c2.toDataURL("image/webp", 0.9);
  }, b64);
  save(path.join(ENV, name + ".webp"), url);
}

/* ---- magenta component sheets: pickups (2x2) + props (3 across) ---- */
async function comps(b64, padF, noMerge) {
  return await p.evaluate(async (b64, padF, noMerge) => {
    const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
    const W = img.width, H = img.height;
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const x = c.getContext("2d"); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, W, H), px = d.data;
    const mag = i => px[i] > 150 && px[i + 1] < 110 && px[i + 2] > 60 && (px[i] - px[i + 1]) > 90;
    for (let j = 0; j < W * H; j++) if (mag(j * 4)) px[j * 4 + 3] = 0;
    /* halo scrub on edge pixels */
    for (let j = 0; j < W * H; j++) {
      if (px[j * 4 + 3] === 0) continue;
      const xx = j % W, yy = (j / W) | 0;
      const near = (xx > 0 && px[(j - 1) * 4 + 3] === 0) || (xx < W - 1 && px[(j + 1) * 4 + 3] === 0)
        || (yy > 0 && px[(j - W) * 4 + 3] === 0) || (yy < H - 1 && px[(j + W) * 4 + 3] === 0);
      if (near) { const i4 = j * 4; if (px[i4] - px[i4 + 1] > 90 && px[i4 + 2] - px[i4 + 1] > 40 && px[i4 + 1] < 90) px[i4 + 3] = 0; }
    }
    x.putImageData(d, 0, 0);
    /* connected components (labelled, so crops can be masked to their own) */
    const seen = new Uint8Array(W * H), out = [], lab = new Int32Array(W * H).fill(-1);
    let nextId = 0;
    for (let j = 0; j < W * H; j++) {
      if (seen[j] || px[j * 4 + 3] === 0) continue;
      const myId = nextId++;
      let minx = W, miny = H, maxx = 0, maxy = 0, cnt = 0;
      const st = [j]; seen[j] = 1;
      while (st.length) {
        const i = st.pop(), xx = i % W, yy = (i / W) | 0; cnt++; lab[i] = myId;
        if (xx < minx) minx = xx; if (xx > maxx) maxx = xx; if (yy < miny) miny = yy; if (yy > maxy) maxy = yy;
        const nb = [];
        if (xx > 0) nb.push(i - 1); if (xx < W - 1) nb.push(i + 1);
        if (yy > 0) nb.push(i - W); if (yy < H - 1) nb.push(i + W);
        if (xx > 0 && yy > 0) nb.push(i - W - 1); if (xx < W - 1 && yy > 0) nb.push(i - W + 1);
        if (xx > 0 && yy < H - 1) nb.push(i + W - 1); if (xx < W - 1 && yy < H - 1) nb.push(i + W + 1);
        for (const k of nb) { if (!seen[k] && px[k * 4 + 3] !== 0) { seen[k] = 1; st.push(k); } }
      }
      if (cnt > W * H * 0.001) out.push({ minx, miny, maxx, maxy, cnt, ids: [myId] });
    }
    /* merge near boxes (sparkles belong to the golden bone; bolts to magnet).
       noMerge: outlined single-piece art whose bboxes overlap (tree canopy
       over the bench) must NOT fuse — keep raw components. */
    let merged = !noMerge;
    while (merged) {
      merged = false;
      for (let i = 0; i < out.length && !merged; i++) for (let jj = i + 1; jj < out.length && !merged; jj++) {
        const a = out[i], b = out[jj], pad = Math.round(W * padF);
        if (a.minx < b.maxx + pad && b.minx < a.maxx + pad && a.miny < b.maxy + pad && b.miny < a.maxy + pad) {
          a.minx = Math.min(a.minx, b.minx); a.miny = Math.min(a.miny, b.miny);
          a.maxx = Math.max(a.maxx, b.maxx); a.maxy = Math.max(a.maxy, b.maxy); a.cnt += b.cnt;
          a.ids.push(...b.ids);
          out.splice(jj, 1); merged = true;
        }
      }
    }
    out.sort((a, b) => ((a.miny / (H / 3)) | 0) - ((b.miny / (H / 3)) | 0) || a.minx - b.minx);
    return out.map(m => {
      const w2 = m.maxx - m.minx + 1, h2 = m.maxy - m.miny + 1;
      const c2 = document.createElement("canvas"); c2.width = w2; c2.height = h2;
      const g2 = c2.getContext("2d");
      g2.drawImage(c, m.minx, m.miny, w2, h2, 0, 0, w2, h2);
      /* mask to this crop's own component(s): the tree bbox otherwise ships
         the corner of the bench that overlaps it */
      const mine = new Set(m.ids);
      const cd = g2.getImageData(0, 0, w2, h2), cp = cd.data;
      for (let yy = 0; yy < h2; yy++) for (let xx = 0; xx < w2; xx++) {
        const k = (yy * w2 + xx) * 4;
        if (cp[k + 3] !== 0 && !mine.has(lab[(m.miny + yy) * W + (m.minx + xx)])) cp[k + 3] = 0;
      }
      g2.putImageData(cd, 0, 0);
      return { url: c2.toDataURL("image/webp", 0.9), w: w2, h: h2 };
    });
  }, b64, padF, noMerge);
}

{
  const got = await comps(await loadIn(FILES.pickups), 0.04);
  console.log("pickups components:", got.length, got.map(g => g.w + "x" + g.h).join(" "));
  const names = ["bone", "bone_gold", "magnet", "jetpack"];
  got.forEach((g, i) => { if (names[i]) save(path.join(PICK, names[i] + ".webp"), g.url); });
}
{
  const got = await comps(await loadIn(FILES.props), 0, true);
  console.log("props components:", got.length, got.map(g => g.w + "x" + g.h).join(" "));
  const names = ["tree", "bench", "flowers"];
  got.forEach((g, i) => { if (names[i]) save(path.join(ENV, "props", names[i] + ".webp"), g.url); });
}
await br.close();
console.log("DONE");
