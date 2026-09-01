// CONDUIT creature close up.
//
// The creature is under a tile wide by design, so at any honest play zoom it is
// twenty or thirty pixels across and a full frame screenshot cannot tell you
// whether it reads as ferrofluid. This shoots the blob itself at high device
// scale, cropped to where it stands, so the identity can actually be judged.
//
//   node test/closeup.js <tag> [scene]
// scenes: idle · wired (a live run beside it) · squeeze (thin, in the vent)
//         swell (mid harvest) · hit (mid damage ripple)
const path = require("path");
const { open, driver, settle } = require("./drive");

const VW = 844, VH = 390;
const SHOTS = path.join(__dirname, "..", "docs", "shots");
const tag = process.argv[2] || "closeup";
const only = process.argv[3] || null;

const SCENES = {
  idle: async (page) => {},
  wired: async (page) => {
    await page.evaluate(() => {
      CONDUIT.beginDraft(9,16);
      for(let y=15;y>=5;y--) CONDUIT.draftStep(9,y);
      for(let x=10;x<=16;x++) CONDUIT.draftStep(x,5);
      CONDUIT.commitDraft();
      const b = CONDUIT.blobRef(); b.x = 10.5; b.y = 9.5;
    });
  },
  squeeze: async (page) => {
    await page.evaluate(() => {
      const b = CONDUIT.blobRef();
      CONDUIT.S.ledger.owned += 20 - b.mass; b.mass = 20;
      b.x = 18.5; b.y = 14.5;
    });
  },
  swell: async (page) => {
    await page.evaluate(() => {
      const b = CONDUIT.blobRef();
      CONDUIT.S.ledger.owned += 40 - b.mass; b.mass = 40;
      CONDUIT.S.bodies.push({ x:b.x, y:b.y, mass:30, decay:30 });
    });
    await settle(300);
  },
  hit: async (page) => {
    await page.evaluate(() => { CONDUIT.ledgerDamage(14); });
    await settle(60);
  },
};

(async () => {
  for (const [name, setup] of Object.entries(SCENES)) {
    if (only && only !== name) continue;
    const { browser, page } = await open(VW, VH);
    const d = driver(page, VW, VH);
    await d.start();
    await setup(page);
    await settle(900);
    // Crop tight to where the creature actually is, at 4x, so the rim and the
    // spikes can be judged rather than guessed at.
    const box = await page.evaluate(() => {
      const b = CONDUIT.blobRef(), p = CONDUIT.w2s(b.x, b.y);
      const fr = (CONDUIT.fx && CONDUIT.fx.r > 0) ? CONDUIT.fx.r : 0.42;
      const r = Math.max(30, fr * CONDUIT.cam.s * 3.4);
      return { x: p[0]-r, y: p[1]-r, width: r*2, height: r*2 };
    });
    box.width  = Math.round(Math.min(box.width,  VW - 2));
    box.height = Math.round(Math.min(box.height, VH - 2));
    box.x = Math.round(Math.max(0, Math.min(box.x, VW - box.width)));
    box.y = Math.round(Math.max(0, Math.min(box.y, VH - box.height)));
    if (!(box.width > 0 && box.height > 0)) throw new Error("bad crop " + JSON.stringify(box));
    await page.setViewport({ width: VW, height: VH, deviceScaleFactor: 4,
                             isMobile: true, hasTouch: true });
    await settle(500);
    await page.screenshot({ path: path.join(SHOTS, `${tag}-${name}.png`), clip: box });
    console.log(`  ${name.padEnd(8)} ${box.width}x${box.height} css px at 4x`);
    await browser.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
