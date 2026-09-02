/* Stop the Light: a run is exactly three fireflies, so the round ends whether the taps
   land in the gold band or not. Tap to stop the light, bank whatever it was worth, and
   the summary card comes up on #s-sum. */
export const meta = { name: "Stop the Light", hook: "endRun", ends: "three fireflies, #s-sum" };

export async function play(page, h) {
  await h.tapSel("#b-play");
  await h.wait(1000);
  /* first run shows the rules card, and nothing moves until the firefly is released */
  if (await vis(page, "#how-go")) { await h.tapSel("#how-go"); await h.wait(1200); }
  for (let i = 0; i < 60; i++) {
    if (await vis(page, "#s-sum")) return;
    /* bank the spark when the choice is offered, otherwise stop the next firefly */
    if (await vis(page, "#ch-bank")) { await h.tapSel("#ch-bank"); await h.wait(800); continue; }
    await h.tap(187, 330);
    await h.wait(700);
  }
}

export async function isRoundOver(page) { return vis(page, "#s-sum"); }

function vis(page, sel) {
  return page.evaluate((s) => { const e = document.querySelector(s); if (!e) return false;
    const r = e.getBoundingClientRect(), st = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && st.visibility !== "hidden" && st.display !== "none" && +st.opacity > 0.05; }, sel);
}
