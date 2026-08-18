/* WHAT IS ACTUALLY IN EACH CORNER OF A GAME, top of the stack downward.
   node scripts/_corner_probe.mjs [url]

   Written because the /arcade-exit.js chip was placed on top of Wild Wardens'
   own streak readout and three separate "fixes" failed, each from a different
   wrong guess about why. Dumping elementsFromPoint answered it in one run: the
   corner was genuinely free, the chip was just being placed BEFORE the app had
   painted anything. Measure the stack before changing placement logic. */
import p from "puppeteer";
const b = await p.launch({ headless: "new", args: ["--no-sandbox"] });
const pg = await b.newPage();
await pg.emulate({ viewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
  userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 9) Mobile" });
await pg.goto(process.argv[2] || "http://127.0.0.1:8777/satellites/wild-wardens/", { waitUntil: "domcontentloaded" });
await new Promise(r => setTimeout(r, 3500));
const out = await pg.evaluate(() => {
  const sel = 'button,a,[role="button"],input,select,canvas';
  const area = innerWidth * innerHeight;
  const spots = [["top-left", 34, 34], ["top-right", innerWidth - 34, 34], ["bottom-left", 34, innerHeight - 34]];
  return spots.map(([n, x, y]) => {
    const stack = document.elementsFromPoint(x, y);
    const lines = [];
    for (const el of stack.slice(0, 6)) {
      const r = el.getBoundingClientRect();
      lines.push(`    <${el.tagName.toLowerCase()} id=${el.id || "-"}> ${Math.round(r.width)}x${Math.round(r.height)}` +
        `${r.width * r.height >= area * 0.9 ? " FULLSCREEN" : ""} btn=${!!(el.closest && el.closest(sel))}` +
        ` text=${JSON.stringify((el.textContent || "").trim().slice(0, 14))}`);
    }
    return n + ":\n" + lines.join("\n");
  });
});
out.forEach(l => console.log("  " + l));
await b.close();
