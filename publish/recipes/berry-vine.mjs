/* Berry Vine: Vine Journey, then let the vine crawl. This is a Zuma, the chain advances
   on its own, so a player who stops firing loses, and #s-go is where the round reports
   either way. Fire a few shots on the way so the round is played, not just watched. */
export const meta = { name: "Berry Vine", hook: "showResults", ends: "vine reaches home, #s-go" };
export async function play(page, h) {
  await h.tapSel("#b-journey");
  await h.wait(900);
  await h.tapText(/^1$/);      /* the journey opens on a level grid, take the first bed */
  await h.wait(1600);
  /* Bed 1 opens with only eleven berries in the chain, so the honest fast finish is to
     clear it rather than to sit and let it crawl home. Fan the shots across the vine. */
  const XS = [80, 130, 180, 230, 280, 330, 150, 260];
  const YS = [180, 260, 340, 300, 220];
  for (let i = 0; i < 120; i++) {
    if (i % 3 === 0 && await vis(page, "#s-go")) return;
    await h.tap(XS[i % XS.length], YS[i % YS.length]);
    await h.wait(320);
  }
}
export async function isRoundOver(page) { return vis(page, "#s-go"); }
function vis(page, sel) {
  return page.evaluate((s) => { const e = document.querySelector(s); if (!e) return false;
    const r = e.getBoundingClientRect(), st = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && st.visibility !== "hidden" && st.display !== "none" && +st.opacity > 0.05; }, sel);
}
