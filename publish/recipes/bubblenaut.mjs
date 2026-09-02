/* Bubblenaut: Play opens the how to play card, Start drops you into room one. Then stand
   still. The critters walk into you and the run ends on #s-over, which is the same screen
   a player meets when they lose their last life. */
export const meta = { name: "Bubblenaut", hook: "gameOver", ends: "out of lives, #s-over" };

export async function play(page, h) {
  await h.tapSel("#b-play");          /* the label is "◯ Play", so match the id */
  await h.wait(700);
  if (await vis(page, "#how-back")) { await h.tapSel("#how-back"); await h.wait(900); }
  /* walk into the critters. The pads only move you while they are held, and falling off
     the bottom wraps you back in from the top, so standing still never ends anything.
     Never fire a bubble: an untrapped critter is the thing that takes the lives. */
  /* cross the room end to end rather than shuffling on the spot: the critters patrol
     platforms, so distance covered is contact made. Forty five passes was enough offline
     and not enough with the ad stack live, so this walks for as long as a real losing
     run takes. */
  /* ⛔ hold in SHORT presses and re-check between every one. A 1.6 s hold that begins on
     the left pad can end on the game over card's "Back" button, because the card opens
     under the finger: the run really did end, and the recipe dismissed the proof of it
     and walked back to the title screen. */
  for (let i = 0; i < 150; i++) {
    if (await vis(page, "#s-over")) return;
    /* the how to play card offers A and D as well as the pads, and keys are what this
       recipe uses: a touch RELEASE on the pad can land on the game over card the moment
       it opens, dismissing the screen the whole run exists to reach. Twice. */
    await h.holdKey((i % 4 < 2) ? "KeyD" : "KeyA", 700);
    if (i % 3 === 0) await h.press("KeyW");
    await h.wait(120);
  }
}

export async function isRoundOver(page) { return vis(page, "#s-over"); }

function vis(page, sel) {
  return page.evaluate((s) => { const e = document.querySelector(s); if (!e) return false;
    const r = e.getBoundingClientRect(), st = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && st.visibility !== "hidden" && st.display !== "none" && +st.opacity > 0.05; }, sel);
}
