/* Jumping Jimothy, the diet build.

   ⛔ Written as a state machine rather than a fixed sequence. Jimothy's menu is not a
   straight line: a daily reward card appears a beat after the splash, and a fixed
   sequence that taps GAMES while that card is still fading taps the card instead, misses
   Endless, and ends up on How to play watching nothing happen for ninety seconds.
   Each pass does whatever is actually on screen.

   Once the run starts the recipe never touches the hop pads. Jimothy's own How to play
   says it: "Don't dawdle. The street sweeper creeps up from behind." A raccoon who does
   not hop is caught, and #s-go is the run report he lands on. */
export const meta = { name: "Jumping Jimothy (diet)", hook: "gameOver", ends: "swept up, #s-go" };

export async function play(page, h) {
  for (let i = 0; i < 120; i++) {
    if (await vis(page, "#s-go")) return;
    if (await vis(page, "#splash-tap"))   { await h.tapSel("#splash-tap");   await h.wait(1800); continue; }
    if (await vis(page, "#reward-later")) { await h.tapSel("#reward-later"); await h.wait(700);  continue; }
    if (await vis(page, "#reward-claim")) { await h.tapSel("#reward-claim"); await h.wait(900);  continue; }
    if (await vis(page, "#how-back"))     { await h.tapSel("#how-back");     await h.wait(600);  continue; }
    if (await vis(page, "#intro-skip"))   { await h.tapSel("#intro-skip");   await h.wait(1000); continue; }
    if (await vis(page, "#b-endless"))    { await h.tapSel("#b-endless");    await h.wait(2000); continue; }
    if (await vis(page, "#b-games"))      { await h.tapSel("#b-games");      await h.wait(900);  continue; }
    /* in the run. Hop a dozen rows so the sweeper is actually behind him, then stop:
       the run does not start counting until the first hop, so standing still from the
       very first frame is not a losing run, it is a paused one. */
    if (i < 26) { await h.tap(187, 300); await h.wait(260); }
    else await h.wait(900);
  }
}

export async function isRoundOver(page) { return vis(page, "#s-go"); }

/* RENDERED, not necessarily on screen. Jimothy's How to play card is taller than the
   phone and its "Got it, let's hop" button sits at y 1028 on a 667 px screen. Deciding
   on "is it in the viewport" made the machine skip the only control that could dismiss
   the card; h.tapSel scrolls it into view before tapping, which is what a thumb does. */
function vis(page, sel) {
  return page.evaluate((s) => { const e = document.querySelector(s); if (!e) return false;
    const r = e.getBoundingClientRect(), st = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && st.visibility !== "hidden" && st.display !== "none" &&
      +st.opacity > 0.05; }, sel);
}
