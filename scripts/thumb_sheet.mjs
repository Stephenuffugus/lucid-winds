/* Contact sheet of every portal thumb captioned with the CARD NAME it is sold
   under. A thumb still painting a retired name is visible instantly this way.
   node scripts/thumb_sheet.mjs <map.json> <out-prefix> [perSheet] [cols]      */
import puppeteer from "puppeteer"; import fs from "fs";
const [mapPath, outPrefix, perSheet = "30", cols = "6"] = process.argv.slice(2);
const rows = JSON.parse(fs.readFileSync(mapPath, "utf8"));
const PER = +perSheet, COLS = +cols, TW = 190, TH = 190;
const br = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
for (let s = 0; s * PER < rows.length; s++) {
  const chunk = rows.slice(s * PER, s * PER + PER);
  const cells = chunk.map(r => {
    const buf = fs.readFileSync("." + r.thumb);
    const mime = r.thumb.endsWith(".png") ? "image/png" : "image/jpeg";
    return `<figure><img src="data:${mime};base64,${buf.toString("base64")}"><figcaption>${r.nm}</figcaption></figure>`;
  }).join("");
  const nrows = Math.ceil(chunk.length / COLS);
  const html = `<style>body{margin:0;background:#111;font:700 13px system-ui;color:#ffd}
    .g{display:grid;grid-template-columns:repeat(${COLS},${TW}px);gap:8px;padding:8px}
    figure{margin:0}img{width:${TW}px;height:${TH}px;object-fit:cover;display:block;border:1px solid #555}
    figcaption{padding:3px 0;text-align:center}</style><div class="g">${cells}</div>`;
  const p = await br.newPage();
  await p.setViewport({ width: COLS * (TW + 8) + 12, height: nrows * (TH + 30) + 16 });
  await p.setContent(html, { waitUntil: "load" });
  await p.screenshot({ path: `${outPrefix}${s + 1}.png` });
  console.log(`${outPrefix}${s + 1}.png (${chunk.length})`);
  await p.close();
}
await br.close();
