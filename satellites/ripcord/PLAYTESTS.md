# Ripcord playtests (the Director's own words, dated)

## 2026-09-02, Stephen, first notes (before playing the 3D battle toggle)

> "ripcord gives me no idea of what any of the different pieces are doing. we need a stats
> section that's open and as you flip through the pieces you can see how it will affect your
> stats. the music menu on people games needs to be movable and minimizable too. i see that i
> can see the pieces in the menu in 3D but can i watch them duel in 3D, that's the next step to
> doing it in VR. this might end up being our third game listed if we do it right."

Three asks:
1. **A stats panel that stays open while you flip through pieces**, showing the delta each
   piece makes to your build (attack, defence, speed, whatever the round machine reads) BEFORE
   you commit it. Today the piece card shows the piece, not what it does to you.
2. **The music chip (the fleet one) must be movable and minimisable** on the games where it
   sits over play. Fleet wide fix, not Ripcord only: /music-unlocks.js.
3. **Watch the duel in 3D.** This EXISTS behind Settings (the gear) → "3D battle (beta)"; he
   has not found it. Surface it: a "Watch in 3D" button on the battle screen itself, not a
   settings toggle. VR is the step after (docs/VR-PILOT.md).

Stakes: he sees Ripcord as a possible third store listing.

### Answered the same night (Fable, 2026-09-02, build on branch)

- **Stats while flipping.** Every part chip now carries the two biggest changes it would make
  (▲smash ▼spin), computed from the real build, and the stats panel is bigger and colour coded.
- **Weights that look tappable.** The dial is 224 px instead of 158, every empty hole is a solid
  ring with a + in it, and a line under the dial says what tapping does (chip, slug, brick, off).
- **Skipping back to the start.** Every pick rebuilt every rail, which reset their scroll. Rails
  and the sheet keep their place across a pick now.
- **Could not scroll Tuning or Looks.** Not the sheet: the fleet music card sat over the bottom
  third and ate the gesture. The card is now a floating panel: drag by the handle, tap the
  triangle or swipe down to fold it to a pill, folds itself after twelve idle seconds. Fleet wide.
- **Combos.** Sixteen rigs already existed; the panel only listed ones you had made. It is a rig
  book now: every rig with its recipe and state. Adding one is one entry in src/rigs.js.
- **Watch in 3D.** A 3D button on the launch dock, same switch as Settings.
- Not done: the rig book only opens at rung 4 (teaching gate, untouched); the boss test reports
  The Post as beatable by defence 78 percent of the time, which predates this pass.

## 2026-09-03, Stephen, brainstorm after the workshop pass

> "ripcord also needs another layer to shooting your top. i'm kind of sick of the release at
> the right time mechanic but we may need something like that. it's getting better. i'm not
> seeing any of the zoom in zoom out for the battles. it's really fast as they start and stop.
> we want it to really draw in the players and animate for them. i could create more worlds
> that the matches could be taking place in to add a lot more depth."

What the code does today (read, not guessed):
- **Launch.** The wind IS the launch: laps, direction and messiness set the spin and the wobble,
  then the top drops. There is no release timing. Open design: a second layer at the moment of
  launch that is not a timing bar. Candidates to put in front of him: an aim (where on the dish
  it lands, so rail vs centre is a choice), a lean (which side the wobble is loaded to at the
  drop), or a hold (how long you let the string bind before letting go, trading power for a
  wild start). Nothing built.
- **Camera.** 2D has `camEvent`: `camDrop()` is a 1.12x push held 0.25s, `camPunch` a short hit
  zoom. That is a blink, which is why he sees nothing. 3D `placeCamera(z)` accepts a zoom factor
  and is only ever called with 1. Next: a real camera language in both views. Slow push in over
  the drop (about a second), dolly toward the first contact, pull out on a ringout, hold on the
  loser, a beat before the card. Reduced motion keeps today's cut.
- **Worlds.** The dish is one arena (art in docs/ARENA art). He wants more arenas the matches
  happen in. The 3D view already loads GLB parts (docs/FORGE3D.md), so a per-arena environment
  is a model plus a lighting preset. An ART_ASSETS style list for arenas is the next art ask.

## 2026-09-03, Stephen, on the launch layer (aim, lean, hold)

> "oh i like these and the ability to change creates a unique power wheel potential in
> combination with all the counter weighting, balancing, and other stats it could be really
> involved. i'm liking it more and more. we just need a way to show how your choices are
> going to affect your stats. maybe some things you have to learn."

Direction, as understood:
- Not one launch layer but a **launch style you pick**: Aim (where you land), Lean (which way
  you wobble from the start), Hold (power against control, no timing bar). Three ways to send
  the same top, chosen before the wind, and a real part of the build alongside weights and
  tuning. A power wheel, in his words.
- **Every choice shows its effect before you commit.** The stats panel must react live to the
  launch style the way the part chips now show deltas: pick Hold and see spin up, guard down;
  pick Aim and see travel; pick Lean and see the wobble needle turn.
- **And some of it stays hidden, to be learned.** Not everything is printed: a few
  interactions (a lean into a wide blade, a hold on a light top) are found by playing, the
  way the non obvious rigs are.
Build plan when picked up: launch style as a fourth workshop choice (Core, Weights, Tuning,
Launch), the three styles as data with their stat hooks, the wind screen carrying the one
extra gesture each needs, the stats panel live to it, rigs allowed to read it.
