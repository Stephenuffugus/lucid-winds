/* Picnic Panic: pick Classic Garden, then hold the snapdragon still under the swarm.
   Galaga has always ended the same way, and #mOver is where the run report lands. */
export const meta = { name: "Picnic Panic", hook: "endRun", ends: "lives gone, #mOver" };
export async function play(page, h) {
  await h.tapText(/CLASSIC GARDEN/i);
  await h.wait(1500);
  for (let i = 0; i < 60; i++) {
    if (await vis(page, "#mOver")) return;
    /* fire, but never dodge: the dives do the rest */
    if (await vis(page, "#btnF")) await h.tapSel("#btnF");
    await h.wait(700);
  }
}
export async function isRoundOver(page) { return vis(page, "#mOver"); }
function vis(page, sel) {
  return page.evaluate((s) => { const e = document.querySelector(s); if (!e) return false;
    const r = e.getBoundingClientRect(), st = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && st.visibility !== "hidden" && st.display !== "none" && +st.opacity > 0.05; }, sel);
}
