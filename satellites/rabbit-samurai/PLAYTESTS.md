# Rabbit Ronin playtests (the Director's own words, dated)

## 2026-09-02, Stephen

> "i also really want to add the dash attack to rabbit ronin too."

What exists today: an AIR DASH as movement only. `dashUnlocked()` (line 246) gates it on six
clears; the input at line 673 sets `G.dashT=0.16`, `G.vx=facing*560`, plays `sfx('dash')`
and a burst. It moves the rabbit; it does not hit anything.

The ask: a dash ATTACK. Open design questions for him, to answer before it is built:
1. Is the dash itself the attack (anything the rabbit passes through during `dashT` takes the
   hit), or a separate move (dash, then a slash at the end of it)?
2. Does it stay gated on six clears, or is it there from the first run?
3. Does a dash that connects refund the dash (chain kills), or is it one per airtime as now?

Then a tuning brief with the rest of the new-game notes.

### Built (Fable, 2026-09-03): the dash attack

A **DASH** button beside JUMP (keys K, X or F), once the first six dojos are cleared. The
dash is the blade: for 0.18 s the ronin slices whatever it passes through, on the ground or
in the air, from a run or straight off the vine. JUMP in the air still dashes, as taught.
Cooldown 1.4 s, drawn as a gold arc filling round the button. **The criteria that waives
it is a kill:** a dash that connects cools instantly, so a line of enemies is a chain, and
every chained kill scores base times the chain (x2, x3 shows over the button). Slicing a
lob mid dash cuts the cooldown to half a second. A dash kill freezes the frame for a beat
and shakes the screen; the dash leaves a trail of ghosts and two slash lines. Help screen
has a row for it. Proven headless: ground dash fires with cooldown, dash into a hedgehog
kills it, cools the dash and starts the chain.

The three questions answered by the build: the dash itself is the hit; still gated on six
clears; a connecting dash refunds itself. Change any of these in doDash / dashKill.

## 2026-09-05, Stephen (dojo 6, on his phone, outside)

> "Rabbit Ronin needs the screen scooted up just a little so the buttons aren't blocking the
> screen. Right now my thumbs have to block the rabbit because of where the buttons are. I think
> we need a story too. Right now you finish a level and it just cuts straight to the next level
> which makes it feel kind of cold and keeps the player unattached from the character and the
> game. [...] I just finished level 6 and unlocked the dash attack but it just cut to level 7 and
> I magically had a dash attack for no reason. Maybe he's trying to find his sword the first few
> levels and you get it then and it should have a small animation and story telling about how he
> got it. We can make the graphics better too and the levels should get more intricate as you go.
> I'm just starting to see the birds. It's getting pretty fun but has a long ways to go to being a
> truly engaging game."

### Built the same day (Fable), all live
- The world is drawn 110 px higher (`VSHIFT`), floor extended under it; feet sit about 80 px above
  the pad tops at 412x915. Touch zones untouched.
- The story between the dojos: `STORY.md` (four acts, 24 beats), cards with fades, a world card per
  world, the sword found after dojo 6 with an animated scene (the sword IS the dash), the sheath at
  the end, a Comfort toggle, a "tap DASH" pill until the first dash. 17 headless checks with real
  taps. ⛔ A CSS transform on an SVG group replaces its positioning attribute.
- Per-world structures (crate stacks, tunnel roofs, stair ledges and stumps, terraces and gusts)
  on 14 of 24 dojos, every hog, cage, pad, cannon and carrot on whatever the ground is at its
  column. `scripts/rs_solver.mjs` 24 of 24. ⛔ The six tile swings are tuned to a full four tile
  run-up from flat ground; anything closer to a swing lip, a launch pad aimed at a pit, or a hog
  or toad two tiles past a landing lip lands the solver in the spikes. Longer islands between pits
  broke Peaks 6 with no structures at all. The solver's bot now hops walls.
- Graphics, procedural: per-world skies, a third parallax layer, tile variety from a per-tile hash,
  tufts, snow and pebbles, undersides on roofs and ledges, a vignette; a hero scene on the title;
  the dojo map tinted per world. Painted layers still drop in over all of it (`ASSETS.md`).

### Still owed from these notes
- More shapes on the ten dojos with no room under the run-up rule: shapes inside the pit rhythm
  (over the pits, above the ground) or a swing retune. See the bottom of `STORY.md`.
- Painted skies, skylines and tiles per world, the one upgrade the code cannot do.
