# Rabbit Ronin, the story between the dojos

**Stephen, Sep 05 2026, after finishing dojo 6 on his phone:** "Right now you finish a level and
it just cuts straight to the next level which makes it feel kind of cold and keeps the player
unattached from the character and the game. If we had a story that it would show in between
levels. Simple story that progresses. Fade in and out while telling the story, providing some
downtime in between levels, allowing players to breathe, take in the quest, and develop more
attachment. I just finished level 6 and unlocked the dash attack but it just cut to level 7 and
I magically had a dash attack for no reason. Maybe he's trying to find his sword the first few
levels and you get it then and it should have a small animation and story telling about how he
got it."

This file is the story and the spec. **Built Sep 05 (Fable), same day:** `#s-story` card, `#fade`
sheet, `storyCards()` / `runStory()` / `showCard()`, the sword SVG scene, `SET.story` toggle,
`PROG.story` seen flags, `PROG.sword`, `PROG.dashUsed` and the "tap DASH" prompt. Proof:
`RB_DEV.story` hooks under `?rstest=1`, 17 checks with real taps (fresh player, the sixth clear,
replays, old saves, toggle off, reduced motion). Voice: spare, wry, one or two lines, the register the game's copy
already uses. No dashes, no exclamation marks.

## The spine

A masterless rabbit. The dojo burned, the crows took his master's sword, and all he has is a
dagger on a vine. Four worlds, four acts: he tracks the sword through **The Crate Yards** (dojos
1 to 6), carries it underground through **The Burrows** (7 to 12), learns it in **The Grove**
(13 to 18), and takes the sheath back from the crows in **The Peaks** (19 to 24). The mole who
pops up at the end of every dojo (`drawMole`) is his informant. The caged mice are the people
nobody was fighting for.

**The DASH is the sword.** It unlocks after dojo 6 today (`dashUnlocked()` = six clears). That is
now the moment he finds the sword: a story card, a short animation of the draw, and the first
dojo of The Burrows opens with the DASH button and a one time prompt. Before dojo 7 the button
does not exist.

## The cards

A card shows AFTER a dojo is cleared and BEFORE the next one starts. World intros show before the
first dojo of a world (1, 7, 13, 19). The sword scene shows after dojo 6. The ending shows after
dojo 24 and before the results screen. A card is shown once per dojo per save (`PROG.story[li]`);
replaying a cleared dojo skips it. Comfort screen gets a "Story cards" toggle, default on.

### World 1, The Crate Yards (intro before dojo 1)
The dojo burned on a Tuesday. The crows took the sword. The mole says it went east, through the
yards. You have a dagger, a vine, and no master to tell you no.

1. The crates are stacked to hide something. Start with the ones that rattle.
2. The mole says the crows sold it. To whom, he did not say, and he was paid not to.
3. Three mice in cages. Nobody caged them for a reason. Let them out anyway.
4. A hedgehog with a receipt. The sword passed through here. So did a lot of carrots.
5. The last yard before the fence. The mole is nervous, which means you are close.
6. **The sword.** Under the sixth crate, wrapped in a rice sack: the sword. Your master's. The
   crows kept the sheath.
   *(animation, then:)* Draw it and you lunge. Everything the blade passes through is cut. A kill
   sharpens it. That is the DASH.

### World 2, The Burrows (intro before dojo 7)
The trail goes underground. The crows do not like the dark, which is why the mice dug here first.

7. First time with the sword in your hand. It is heavier than you remember. So are you.
8. The mole has a cousin down here. The cousin has a grudge. The grudge has a map.
9. Crows at the tunnel mouths. They can see in the dark after all. Somebody told them.
10. A cage with a note: WE KNOW WHERE YOU ARE. The mice inside want out either way.
11. The tunnels tilt upward. The mole says the grove is next, and to mind the spitters.
12. You cut a crow out of the air for the first time. It felt like something. Write that down later.

### World 3, The Grove (intro before dojo 13)
Green, and loud with birds. The ones that spit are new. Do not stand still to admire the leaves.

13. The mole is late. The mole is never late. Keep moving.
14. An old training post, scarred where a blade once practised. Someone was taught here. Not you.
15. The mice in this grove know your name. Word travels when you keep opening cages.
16. The mole turns up with a bandage and no story. Whatever it was, it is behind you now.
17. The crows nest in the peaks. The grove is where they come down to feed. Cut the feeding short.
18. The last tree before the rock. From here you climb, and the sword gets no lighter.

### World 4, The Peaks (intro before dojo 19)
Thin air, hard rock, and every crow that ever stole anything. The sheath is up there. So is
whoever paid for it.

19. The wind takes your ears. The vine is the only thing on this mountain that holds.
20. A cage hung over the drop. Whoever hung it wanted you to reach for it. Reach anyway.
21. The mole, out of breath, says the buyer is a crow with a title. Titles are for the ground.
22. Cannons on the ledges. Somebody armed birds. Somebody is going to regret the expense.
23. The sheath, nailed to a post like a trophy. Take it back. The nail can stay.
24. **Ending.** The sword goes back in its sheath. The mice go wherever mice go. The mole asks what
    a ronin does now. You show him the vine. Same as before. Just sharper.

## The build (for JOB D)

- Hook: `levelClear()` sets `G.phase='clear'` with `G.clearT=2.0`; when that runs out the code
  calls `advanceLevel()`, which calls `startLevel(G.li+1,false)` straight away. Put the card
  between them: `advanceLevel()` becomes "fade to black, show the card for dojo li+1 (and the
  world intro first if li+1 is 6, 12 or 18), then startLevel on tap or after 4 s, then fade in".
  The first run's dojo 1 card and world 1 intro show from `startRun()` the same way.
- The card is a DOM screen (`#s-story`) over the stage, not canvas: the world's sky colours from
  `SKY[theme]` as its ground, the dojo number and name in the game's HUD face, the line in the
  cream serif at 18 to 20 px, "Tap to continue" at the bottom, 48 px tall tap target = the whole
  card. Fade 400 ms out, 400 ms in; `prefers-reduced-motion` cuts the fades to 0.
- The sword scene after dojo 6: the ronin sprite (`drawBunny` path) centre stage, the crate opens
  (two frames), the blade rises with a gold arc (`dashKill`'s slash lines already draw an arc),
  hold, then the DASH line. 3 to 4 s, skippable. Then dojo 7 starts with `BDASH` drawn and a
  floating "tap DASH" over it until the first dash.
- `PROG.story` is an object of seen flags, saved by `save()`; `PROG.sword` flips at the scene and
  `dashUnlocked()` reads it (so a save from before today that already has six clears sees the
  scene once at its next clear instead of never).
- Comfort screen: "Story cards" toggle (`PROG.storyOff`), same `.settingline` pattern as the rest.
- Prove it the way the dash was proven: headless, real pointer events, a clear on dojo 6 shows
  the sword scene and dojo 7 has the button; a replay of dojo 3 shows no card; the toggle off
  shows no card; reduced motion shows no fade. Shoot the card at 412x915 and look at it.

## Also from the same playtest, not this job's scope
- "We can make the graphics better too." **Procedural pass built Sep 05:** each world has a sky
  (stars, a crescent and cloud bands on the Peaks; a moon with a halo and the canopy hanging in from the
  top in the Grove; a rock ceiling with a lit edge and swaying roots in the Burrows; a warm haze and a
  low moon in the Yards), a third distant parallax layer, tiles that vary from their own hash (crate
  stamps, moss, cracks, root fibres), grass tufts, snow and pebbles on the ground line, dark undersides
  on roofs and ledges, and a soft vignette. The painted layer hook is still live (`bgLayer`, 1080x640
  per world, far and near), see `ASSETS.md`; painted art drops in over all of this.
- "The levels should get more intricate as you go." `genLevel` ramps pits, platforms and enemies
  by `diff = stage + world`; the shapes themselves stay the same four. New shapes per world (a
  crate maze, a burrow with a ceiling, grove canopies you swing under, peak ledges with wind) are a
  design pass after the story lands.
- "I'm just starting to see the birds." Crows start in world 2 (`WORLD_DEFS`); that is by design.
