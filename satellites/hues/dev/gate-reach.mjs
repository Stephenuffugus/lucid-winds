/* GATE (20 Oct 2026, Stephen on iPhone: "the slider being too close to the edge and too close to the lock it in button").
   On the play screen, at iPhone Safari sizes and the two gate sizes:
     • the pad and the strip start at least 32px in from each side (Safari takes a drag that starts at the edge as a back swipe)
     • at least 24px of clear space between the strip's tap zone (12px below the strip) and LOCK IT IN
     • LOCK IT IN is fully on screen with at least 30px below it (the iPhone home indicator band)
   Red on the old build: HUES_REV=<sha before 20 Oct> node satellites/hues/dev/gate-reach.mjs
   Run: node satellites/hues/dev/gate-reach.mjs */
import { launch, open, close, reporter, startMode, sleep } from './harness.mjs';

const R = reporter('gate-reach');
const browser = await launch();
for (const [w, h] of [[375, 548], [390, 664], [430, 740], [360, 640], [412, 915]]) {
  const page = await open(browser, { w, h });
  await startMode(page, 'daily'); await sleep(300);
  const m = await page.evaluate(() => {
    const r = (s) => document.querySelector(s).getBoundingClientRect();
    const pad = r('#pad'), st = r('#strip'), lk = r('#lockBtn');
    return { side: Math.round(Math.min(pad.left, innerWidth - pad.right, st.left, innerWidth - st.right)),
      clear: Math.round(lk.top - (st.bottom + 12)), below: Math.round(innerHeight - lk.bottom) };
  });
  R.t(w + 'x' + h + ': pad and strip at least 32px from each side', m.side >= 32, m.side + 'px');
  R.t(w + 'x' + h + ': at least 24px clear above LOCK IT IN', m.clear >= 24, m.clear + 'px');
  R.t(w + 'x' + h + ': LOCK IT IN on screen with 30px below it', m.below >= 30, m.below + 'px');
  await close(page);
}
await browser.close();
R.done();
