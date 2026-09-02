/* Garden Guard: PLAY, take the gentlest pace, open bed one, then plant nothing. The
   pests walk the path and the leaves run out, which is #scr-lose. The builder hooks the
   defeat as well as the win for exactly this reason: a tower defence player loses far
   more rounds than they win, and the break has to land on both. */
export const meta = { name: "Garden Guard", hook: "winLevel + loseLevel", ends: "leaves gone, #scr-lose" };

export async function play(page, h) {
  await h.tapSel("#btnPlay");
  await h.wait(900);
  await h.tapText(/Sprout . Easy|Sprout/i);
  await h.wait(1000);
  await h.tapText(/^1$/);                 /* first bed on the level grid */
  await h.wait(1400);
  for (let i = 0; i < 90; i++) {
    if (await vis(page, "#scr-lose") || await vis(page, "#scr-win")) return;
    /* call the wave in early and then leave the bed undefended */
    if (await vis(page, "#btnWave")) await h.tapSel("#btnWave");
    await h.wait(800);
  }
}

export async function isRoundOver(page) {
  return (await vis(page, "#scr-lose")) || (await vis(page, "#scr-win"));
}

function vis(page, sel) {
  return page.evaluate((s) => { const e = document.querySelector(s); if (!e) return false;
    const r = e.getBoundingClientRect(), st = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && st.visibility !== "hidden" && st.display !== "none" && +st.opacity > 0.05; }, sel);
}
