import puppeteer from "puppeteer";
const SHOTS = "/tmp/claude-1000/-workspaces-lucid-winds/8920c4cb-388b-4ccf-bab1-3c245821805c/scratchpad";
const b = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
let pass = 0, fail = 0;
const t = (n, ok, d) => { console.log((ok ? "  ✅ " : "  ❌ ") + n + (d ? " — " + d : "")); ok ? pass++ : fail++; };

for (const [name, url] of [["padlab", "http://127.0.0.1:8933/padlab/"], ["loaf", "http://127.0.0.1:8933/loaf.html"]]) {
  const ctx = await b.createBrowserContext();          // fresh profile, no sws_dev_ok
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", e => errs.push(e.message));
  await p.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });
  await p.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise(r => setTimeout(r, 600));
  const gate = await p.$("#sws-devgate");
  t(`${name}: gate mounts on a fresh device`, !!gate);
  if (name === "padlab") await p.screenshot({ path: `${SHOTS}/gate-padlab.png` });

  // wrong key rejected
  await p.type("#sws-devkey", "opensesame");
  await p.click("#sws-devgo");
  await new Promise(r => setTimeout(r, 300));
  t(`${name}: wrong key stays locked`, !!(await p.$("#sws-devgate")));

  // right key unlocks (case-insensitive per gate: it lowercases input)
  await p.type("#sws-devkey", "Wolfden");
  await p.click("#sws-devgo");
  await new Promise(r => setTimeout(r, 400));
  t(`${name}: wolfden unlocks`, !(await p.$("#sws-devgate")));
  const flag = await p.evaluate(() => localStorage.getItem("sws_dev_ok"));
  t(`${name}: sws_dev_ok persisted`, flag === "1");

  // reload: no gate the second time
  await p.reload({ waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 500));
  t(`${name}: no gate after unlock`, !(await p.$("#sws-devgate")));
  t(`${name}: zero page errors`, errs.length === 0, errs.slice(0, 3).join("; "));
  if (name === "loaf") await p.screenshot({ path: `${SHOTS}/loaf-after-gate.png` });
  await ctx.close();
}
await b.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
