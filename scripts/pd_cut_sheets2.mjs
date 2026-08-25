/* PUPPY DASH — second character drop (Aug 25): fox, bunny, raccoon, kitty.
   Same keying/component/row logic as pd_cut.mjs, but these sheets hold SEVERAL
   states per image, so a MAPPING table assigns each detected row to a state.
   One scale per ANIMAL (tallest pose across all its sheets, 76% of 512,
   contact y=488) so every state stays in proportion to the run.
   Modes:
     node scripts/pd_cut_sheets2.mjs inspect   -> row montages + counts, no output frames
     node scripts/pd_cut_sheets2.mjs cut       -> final frames + contact sheets
*/
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const MODE = process.argv[2] || "inspect";
const SRC = "/workspaces/lucid-winds/assets/pd-characters-staging/Characters ";
const STAGE = "/workspaces/lucid-winds/assets/pd-characters-staging/_rows";
const OUTROOT = "/workspaces/lucid-winds/satellites/puppy-dash";

/* sheet -> row index (1-based, top to bottom) -> state. null = drop the row.
   A row value can also be {state, take, skip, rest}: keep `take` frames from
   the front (or drop `skip` from the front), and route the remainder to
   `rest`. Filled in AFTER the inspect pass was LOOKED at:
   - fox/bunny/raccoon run cycles arrive as TWO rows of 4 (one 8 cycle);
   - kitty row 1 has baked dust so only row 2 runs;
   - raccoon2 row 3 is a 5 frame tumble (staged, unused for now);
   - bunny2 row 2 is an overhead twist that reads as a glitch at 58px (staged);
   - kitty row 4 frame 4 is a caught tumble that leads its sitting caughts. */
const MAPPING = {
  "fox1.png":     { animal: "fox",     rows: { 1: "run", 2: "run", 3: "land", 4: "jump" } },
  "fox2.png":     { animal: "fox",     rows: { 1: "slide", 2: "jump", 3: "caught" } },
  "bunny1.png":   { animal: "bunny",   rows: { 1: "run", 2: "run", 3: "jump", 4: "land" } },
  "bunny2.png":   { animal: "bunny",   rows: { 1: "slide", 2: null, 3: "caught" } },
  "raccoon1.png": { animal: "raccoon", rows: { 1: "run", 2: "run", 3: "land", 4: "jump" } },
  "raccoon2.png": { animal: "raccoon", rows: { 1: "slide", 2: "jump", 3: null, 4: { state: "caught", take: 3 } } },
  "kitty1&2.png": { animal: "kitten",  rows: { 1: null, 2: "run", 3: "jump", 4: { state: "slide", take: 3, rest: "caught" }, 5: { state: "caught", skip: 3 } } },
};

const br = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const p = await p_new();
async function p_new() { const pg = await br.newPage(); await pg.goto("about:blank"); return pg; }

/* identical keying + components + row clustering as pd_cut.mjs, returning
   poses tagged {row, col} */
async function cutSheet(file) {
  const b64 = fs.readFileSync(path.join(SRC, file)).toString("base64");
  return await p.evaluate(async (src) => {
    const img = new Image(); img.src = src;
    await new Promise(r => { img.onload = r; img.onerror = r; });
    const W = img.naturalWidth, H = img.naturalHeight;
    if (!W) return { err: "unreadable" };
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const cx = cv.getContext("2d", { willReadFrequently: true });
    cx.drawImage(img, 0, 0);
    const d = cx.getImageData(0, 0, W, H), px = d.data;
    const border = [];
    for (let x = 0; x < W; x += Math.max(1, W >> 6)) { border.push((0 * W + x) * 4, ((H - 1) * W + x) * 4); }
    for (let y = 0; y < H; y += Math.max(1, H >> 6)) { border.push((y * W + 0) * 4, (y * W + W - 1) * 4); }
    let br_ = 0, bg = 0, bb = 0;
    border.forEach(i => { br_ += px[i]; bg += px[i + 1]; bb += px[i + 2]; });
    br_ /= border.length; bg /= border.length; bb /= border.length;
    const isMagenta = br_ > 150 && bg < 110 && bb > 60 && (br_ - bg) > 90;
    const tol = isMagenta ? 120 : 38;
    const bgMask = new Uint8Array(W * H);
    for (let i = 0, j = 0; i < px.length; i += 4, j++) {
      const dr = px[i] - br_, dg = px[i + 1] - bg, db = px[i + 2] - bb;
      if (dr * dr + dg * dg + db * db < tol * tol) bgMask[j] = 1;
    }
    const outside = new Uint8Array(W * H);
    const q = [];
    for (let x = 0; x < W; x++) { q.push(x, (H - 1) * W + x); }
    for (let y = 0; y < H; y++) { q.push(y * W, y * W + W - 1); }
    while (q.length) {
      const i = q.pop();
      if (outside[i] || !bgMask[i]) continue;
      outside[i] = 1;
      const x = i % W, y = (i / W) | 0;
      if (x > 0) q.push(i - 1); if (x < W - 1) q.push(i + 1);
      if (y > 0) q.push(i - W); if (y < H - 1) q.push(i + W);
    }
    for (let j = 0; j < W * H; j++) if (outside[j]) px[j * 4 + 3] = 0;
    /* ⛔ enclosed magenta: the gap between an arm and the body never touches
       the border, so the flood spares it and a bright magenta hole ships
       inside the pose (seen on raccoon run frame 4). On a magenta-keyed sheet
       NOTHING in the art is magenta family, so kill it wherever it sits. */
    if (isMagenta) for (let j = 0; j < W * H; j++) {
      const i4 = j * 4;
      if (px[i4 + 3] !== 0 && px[i4] > 150 && px[i4 + 1] < 110 && px[i4 + 2] > 60 && (px[i4] - px[i4 + 1]) > 90) px[i4 + 3] = 0;
    }
    for (let j = 0; j < W * H; j++) {
      if (px[j * 4 + 3] === 0) continue;
      const x = j % W, y = (j / W) | 0;
      const nearBg = (x > 0 && px[(j - 1) * 4 + 3] === 0) || (x < W - 1 && px[(j + 1) * 4 + 3] === 0)
        || (y > 0 && px[(j - W) * 4 + 3] === 0) || (y < H - 1 && px[(j + W) * 4 + 3] === 0);
      if (nearBg && isMagenta) {
        const i4 = j * 4;
        if (px[i4] > 140 && px[i4 + 2] > 60 && px[i4 + 1] < 130) { const m = (px[i4] + px[i4 + 2]) >> 1; px[i4] = px[i4 + 1]; px[i4 + 2] = px[i4 + 1]; px[i4 + 1] = px[i4 + 1]; px[i4] = m * 0.3 + px[i4] * 0.7; }
      }
    }
    cx.putImageData(d, 0, 0);
    const seen = new Uint8Array(W * H), comps = [], lab = new Int32Array(W * H).fill(-1);
    for (let j = 0; j < W * H; j++) {
      if (seen[j] || px[j * 4 + 3] === 0) continue;
      const id = comps.length;
      let minx = W, miny = H, maxx = 0, maxy = 0, n = 0, nWhite = 0;
      const st = [j]; seen[j] = 1;
      while (st.length) {
        const i = st.pop(), x = i % W, y = (i / W) | 0; n++; lab[i] = id;
        const i4 = i * 4, r = px[i4], g = px[i4 + 1], b = px[i4 + 2];
        if (r > 190 && g > 190 && b > 190 && Math.max(r, g, b) - Math.min(r, g, b) < 42) nWhite++;
        if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y;
        const nb = [];
        if (x > 0) nb.push(i - 1); if (x < W - 1) nb.push(i + 1);
        if (y > 0) nb.push(i - W); if (y < H - 1) nb.push(i + W);
        if (x > 0 && y > 0) nb.push(i - W - 1); if (x < W - 1 && y > 0) nb.push(i - W + 1);
        if (x > 0 && y < H - 1) nb.push(i + W - 1); if (x < W - 1 && y < H - 1) nb.push(i + W + 1);
        for (const k of nb) { if (!seen[k] && px[k * 4 + 3] !== 0) { seen[k] = 1; st.push(k); } }
      }
      comps.push({ id, minx, miny, maxx, maxy, n, nWhite });
    }
    /* ⛔ The pd_cut.mjs white-text rule ate the WHITE BUNNY whole: a white
       animal is mostly near-white pixels too. A caption is mostly white AND
       small; a pose is a big component. Size-cap the text drop. */
    let textDropped = 0;
    const inked = comps.filter(c => {
      if (c.n >= 200 && c.n < W * H * 0.012 && c.nWhite / c.n > 0.70) { textDropped++; return false; }
      return true;
    });
    const big = inked.filter(c => c.n > W * H * 0.002);
    big.sort((a, b) => a.n - b.n);
    const merged = [];
    for (const c of big) {
      let hit = null;
      for (const m of merged) {
        const ox = Math.max(0, Math.min(c.maxx, m.maxx) - Math.max(c.minx, m.minx));
        const oy = Math.max(0, Math.min(c.maxy, m.maxy) - Math.max(c.miny, m.miny));
        if (ox > 0 && oy > 0) { hit = m; break; }
      }
      if (hit) {
        hit.minx = Math.min(hit.minx, c.minx); hit.maxx = Math.max(hit.maxx, c.maxx);
        hit.miny = Math.min(hit.miny, c.miny); hit.maxy = Math.max(hit.maxy, c.maxy);
        hit.ids.push(c.id);
      }
      else merged.push({ ...c, ids: [c.id] });
    }
    const hs = merged.map(c => c.maxy - c.miny + 1).sort((a, b) => a - b);
    const medH = hs[hs.length >> 1] || 1;
    merged.forEach(c => c.cy = (c.miny + c.maxy) / 2);
    merged.sort((a, b) => a.cy - b.cy);
    let row = 0, lastCy = -1e9;
    merged.forEach(c => { if (c.cy - lastCy > medH * 0.55) row++; c.row = row; lastCy = c.cy; });
    for (const r of new Set(merged.map(c => c.row))) {
      const rc = merged.filter(c => c.row === r).sort((a, b) => a.minx - b.minx);
      for (let i = rc.length - 1; i > 0; i--) {
        const a = rc[i - 1], b = rc[i];
        const gap = b.minx - a.maxx;
        if (gap < W * 0.03 && Math.min(a.n, b.n) < 0.25 * Math.max(a.n, b.n)) {
          a.minx = Math.min(a.minx, b.minx); a.maxx = Math.max(a.maxx, b.maxx);
          a.miny = Math.min(a.miny, b.miny); a.maxy = Math.max(a.maxy, b.maxy);
          a.n += b.n; a.ids.push(...b.ids); b.dead = 1; rc.splice(i, 1);
        }
      }
    }
    const alive = merged.filter(c => !c.dead);
    alive.sort((a, b) => a.row - b.row || a.minx - b.minx);
    const out = [];
    for (const m of alive) {
      const w = m.maxx - m.minx + 1, h = m.maxy - m.miny + 1;
      const c2 = document.createElement("canvas"); c2.width = w; c2.height = h;
      const g2 = c2.getContext("2d", { willReadFrequently: true });
      g2.drawImage(cv, m.minx, m.miny, w, h, 0, 0, w, h);
      const mine = new Set(m.ids);
      const cd = g2.getImageData(0, 0, w, h), cp = cd.data;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const k = (y * w + x) * 4;
        if (cp[k + 3] !== 0 && !mine.has(lab[(m.miny + y) * W + (m.minx + x)])) cp[k + 3] = 0;
      }
      g2.putImageData(cd, 0, 0);
      out.push({ png: c2.toDataURL("image/png"), w, h, row: m.row });
    }
    return { poses: out, keyed: isMagenta ? "magenta" : "border", bgRGB: [br_ | 0, bg | 0, bb | 0], textDropped };
  }, "data:image/png;base64," + b64);
}

const CONTACT = 488;
const perAnimal = {};   /* animal -> [{state, png, w, h, sheet, row, col}] */

for (const file of Object.keys(MAPPING)) {
  const got = await cutSheet(file);
  if (got.err) { console.log("!! " + file + ": " + got.err); continue; }
  const rows = {};
  got.poses.forEach(ps => { (rows[ps.row] = rows[ps.row] || []).push(ps); });
  console.log(file + ": key=" + got.keyed + " rgb=" + got.bgRGB.join(",")
    + "  rows: " + Object.keys(rows).map(r => r + ":" + rows[r].length).join(" ")
    + (got.textDropped ? "  dropped " + got.textDropped + " text comps" : ""));
  if (MODE === "inspect") {
    fs.mkdirSync(STAGE, { recursive: true });
    for (const r of Object.keys(rows)) {
      const srcs = rows[r].map(ps => ps.png);
      const url = await p.evaluate(async (srcs) => {
        const imgs = await Promise.all(srcs.map(s => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = s; })));
        const hMax = Math.max(...imgs.map(i => i.height));
        const cv = document.createElement("canvas");
        cv.width = imgs.reduce((a, i) => a + i.width + 16, 16); cv.height = hMax + 32;
        const cx = cv.getContext("2d");
        cx.fillStyle = "#2a5a2a"; cx.fillRect(0, 0, cv.width, cv.height);
        let x = 16; imgs.forEach(i => { cx.drawImage(i, x, 16 + (hMax - i.height)); x += i.width + 16; });
        return cv.toDataURL("image/png");
      }, srcs);
      fs.writeFileSync(path.join(STAGE, file.replace(/\.png$/, "").replace(/[^a-z0-9]/gi, "_") + "_row" + r + ".png"),
        Buffer.from(url.split(",")[1], "base64"));
    }
    continue;
  }
  const map = MAPPING[file];
  for (const r of Object.keys(rows)) {
    let spec = map.rows[r];
    if (!spec) continue;
    if (typeof spec === "string") spec = { state: spec };
    const list = rows[r];
    list.forEach((ps, i) => {
      let st = spec.state;
      if (spec.take != null && i >= spec.take) st = spec.rest || null;
      if (spec.skip != null && i < spec.skip) st = null;
      if (!st) return;
      (perAnimal[map.animal] = perAnimal[map.animal] || []).push({ ...ps, state: st });
    });
  }
}

if (MODE === "cut") {
  for (const animal of Object.keys(perAnimal)) {
    const poses = perAnimal[animal];
    /* idle rows are SIDE PROFILE shots kept only for the select card, and they
       stand taller than the gameplay rows; exclude them from the shared scale
       so the gameplay silhouette fills the rig the way the puppy does. */
    const gp = poses.filter(ps => ps.state !== "idle");
    const tall = Math.max(...gp.map(f => f.h));
    const scale = (512 * 0.76) / tall;
    const outDir = path.join(OUTROOT, "art", "characters", animal);
    fs.mkdirSync(outDir, { recursive: true });
    const states = {};
    poses.forEach(ps => { (states[ps.state] = states[ps.state] || []).push(ps); });
    const meta = { rig: { canvas: 512, contact: CONTACT, scale: +scale.toFixed(4) }, states: {} };
    for (const st of Object.keys(states)) {
      const list = states[st];
      let contentH = 0;
      for (let i = 0; i < list.length; i++) {
        const fr = list[i];
        const out = await p.evaluate(async (src, scale, CONTACT) => {
          const img = new Image(); img.src = src;
          await new Promise(r => { img.onload = r; });
          const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
          const cv = document.createElement("canvas"); cv.width = 512; cv.height = 512;
          const cx = cv.getContext("2d");
          cx.imageSmoothingQuality = "high";
          cx.drawImage(img, Math.round((512 - w) / 2), CONTACT - h, w, h);
          return { png: cv.toDataURL("image/png"), h };
        }, fr.png, scale, CONTACT);
        contentH = Math.max(contentH, out.h);
        fs.writeFileSync(path.join(outDir, st + "_" + String(i + 1).padStart(2, "0") + ".png"),
          Buffer.from(out.png.split(",")[1], "base64"));
      }
      meta.states[st] = { n: list.length, contentH };
      console.log("  " + animal + "/" + st + ": " + list.length + " frames, contentH " + contentH);
    }
    fs.writeFileSync(path.join(outDir, "meta.json"), JSON.stringify(meta, null, 2));
    /* contact sheet across every state at 140 + 58 + silhouette (the law) */
    const all = [];
    for (const st of Object.keys(states)) for (let i = 0; i < states[st].length; i++)
      all.push(path.join(outDir, st + "_" + String(i + 1).padStart(2, "0") + ".png"));
    const contact = await p.evaluate(async (srcs) => {
      const imgs = await Promise.all(srcs.map(s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; })));
      const sizes = [140, 58];
      const cv = document.createElement("canvas");
      cv.width = 40 + imgs.length * 150; cv.height = 40 + sizes.length * 160 + 60;
      const cx = cv.getContext("2d");
      cx.fillStyle = "#6fce5b"; cx.fillRect(0, 0, cv.width, cv.height);
      imgs.forEach((im, i) => {
        sizes.forEach((sz, r) => { cx.drawImage(im, 20 + i * 150 + (140 - sz) / 2, 20 + r * 160 + (140 - sz), sz, sz); });
        const c2 = document.createElement("canvas"); c2.width = 58; c2.height = 58;
        const x2 = c2.getContext("2d");
        x2.drawImage(im, 0, 0, 58, 58);
        x2.globalCompositeOperation = "source-in"; x2.fillStyle = "#000"; x2.fillRect(0, 0, 58, 58);
        cx.drawImage(c2, 20 + i * 150 + 41, 20 + sizes.length * 160);
      });
      return cv.toDataURL("image/png");
    }, all.map(n => "data:image/png;base64," + fs.readFileSync(n).toString("base64")));
    fs.writeFileSync(path.join(outDir, "_contact.png"), Buffer.from(contact.split(",")[1], "base64"));
    console.log("  " + animal + ": contact sheet written (LOOK AT IT)");
  }
}
await br.close();
console.log("DONE (" + MODE + ")");
