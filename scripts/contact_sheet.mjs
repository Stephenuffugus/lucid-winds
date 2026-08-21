/* Tile PNG crops into labelled contact sheets so a human can actually LOOK at
   many frames without opening them one at a time.
   node scripts/contact_sheet.mjs <dir-of-pngs> <out-prefix> [perSheet] [cols]  */
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
const [dir, outPrefix, perSheet = "24", cols = "6"] = process.argv.slice(2);
const files = fs.readdirSync(dir).filter(f => f.endsWith(".png")).sort();
const PER = +perSheet, COLS = +cols, TW = +(process.env.TW||180), TH = +(process.env.TH||260);
const br = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
for (let s = 0; s * PER < files.length; s++) {
  const chunk = files.slice(s * PER, s * PER + PER);
  const cells = chunk.map(f => {
    const b64 = fs.readFileSync(path.join(dir, f)).toString("base64");
    return `<figure><img src="data:image/png;base64,${b64}"><figcaption>${f.replace(/\.png$/, "")}</figcaption></figure>`;
  }).join("");
  const rows = Math.ceil(chunk.length / COLS);
  const html = `<style>body{margin:0;background:#111;font:600 13px system-ui;color:#eee}
    .g{display:grid;grid-template-columns:repeat(${COLS},${TW}px);gap:10px;padding:10px}
    figure{margin:0}img{width:${TW}px;height:${TH}px;display:block;border:1px solid #444}
    figcaption{padding:3px 0;text-align:center}</style><div class="g">${cells}</div>`;
  const p = await br.newPage();
  await p.setViewport({ width: COLS * (TW + 10) + 14, height: rows * (TH + 32) + 20 });
  await p.setContent(html, { waitUntil: "load" });
  await p.screenshot({ path: `${outPrefix}${s + 1}.png` });
  console.log(`${outPrefix}${s + 1}.png  (${chunk.length} tiles)`);
  await p.close();
}
await br.close();
