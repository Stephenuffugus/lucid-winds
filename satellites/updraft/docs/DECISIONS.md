# Updraft, decisions taken without asking (newest last)

**PAYOUT_RATE 10, REEL_RATE 2.5 with a separate REEL_BOOST 6, not the plan's REEL 6 / PAYOUT 4.**
With 6 m/s of line coming in, the plan's own launch rhythm (hold 0.6 s, release 0.6 s) nets line IN and the kite can never leave the 8 m layer; a 6 s hold at 40 m reeled the kite into the hand before a figure 8 could finish. The tug's airspeed boost stays 6 m/s; the line itself comes in at 2.5 m/s.

**The reel boost applies only while the line is actually moving (L above LINE_MIN).**
A kite reeled to the hand hovered at the zenith forever under a continuous hold; with the line fully in there is nothing to pull it through the air, so it stalls and drops back, which is the plan's assertion.

**Line pays out only while the kite pulls (tension above PAYOUT_PULL 0.5 N).**
A stalled, falling kite that kept paying out line rose in altitude in the descend test; a slack line does not leave the reel.

**Apparent mass 0.4 kg added to the kite's mass; velocity damping 0.5 rho A CD_motion (v + 2).**
At 0.12 kg the plan's forces gave 350 m/s2 and the kite reached the zenith in a quarter second. The air moving with a 0.5 m2 sail is about 0.3 kg; the damping floor stops a slow pendulum on 120 m of line.

**Own speed only subtracts from airspeed, at DIVE_LOSS 0.35, never adds.**
The plan's Va = W_eff + reel minus v_along fed back on a climb (a climbing kite gained airspeed, gained lift, climbed faster: 130 N) and death spiralled on any sink.

**STALL_V 1.6, not 2.2; EL_MAX 1.0, not 1.45; WINDOW_FLOOR 0.**
With the window as cos(el) and STALL_V 2.2 a Fresh Diamond parked at exactly its stall angle and luffed forever. A Diamond's window top is about 57 degrees; at 1.0 rad it still pulls in Fresh, so the release pays out and the launch rhythm walks up.

**The tail's righting torque goes as sin(angle); a nose straight down stays down until the thumb says otherwise.**
Proportional relaxation was fastest when the nose was fully down, so no dive could develop; a kite pointing at the grass under tension dives, which is the game.

**Tail constraints are follow the leader from the pinned end, twice, not two half and half passes.**
The plan's assertion is one percent on every segment after every step; the symmetric pass left a sixteen segment chain a few percent off under a crack.

**The stall suite's watched failure is STALL_V=0, not the plan's STALL_LIFT=1.**
At 1.5 m/s of airspeed the lift is 0.7 N whatever the factor, so zeroing the factor changes nothing measurable; the stall's teeth are the flag itself (STALL_SINK and STALL_FALL hang off it).

**A Stall Save needs the thumb: the hold must be on at the catch, and the stall must begin above the turbulent layer.**
A Fresh kite luffing at the top catches itself; that is not a trick.

**Mabel stands downwind and to the right at (22, 26) m, crown 9 m up, radius 7 m.**
A kite on a line cannot reach a tree upwind of the player; the design's "upwind" is kept in the words, the geometry puts her where a kite can be snagged.

**Diamond maxTension 60 N (Delta 80, Box 90, Sled 50, Dragon 45).**
The plan names the field and not the number. 60 sits above the Fresh peak at any window angle (asserted) and below a Blustery gust peak under a hold.

**The camera is angular: azimuth is screen x, elevation is screen y, distance is the kite's size.**
A perspective from the hand puts a kite beside the player off the screen; the plan's field with the grass at the bottom is exactly what an angular view of a kite gives.

**tools/shots.mjs and tools/thumb.mjs use UPDRAFT_DEV.place to put the kite aloft. test/*.mjs never do.**
A camera may take that liberty; a gate may not.

**Real Wind is the fourth card on the MOOD screen, not a Settings toggle.**
There is no Settings screen tonight (sound, motion and haptics sit on the title and pause screens), and the mood screen is where a player chooses the wind; the card is the toggle, the waiting state, the honesty line and today's numbers in one place. It defaults off and nothing is fetched until it is tapped; the boot only marks the toggle and reads the hour cache on the next flight or the next visit to the card.

**Real Wind picks the mood whose RULES apply by band: under 4 m/s Gentle, under 6.7 m/s Fresh, else Blustery.**
The base magnitude is the real number; the snap rule reads the mood (3.3, Blustery only), so a 16 mph day can snap and a 9 mph day cannot. Under 3 mph the honesty line flies Gentle's 2.7 m/s and never the real number.

**A failed feed is asked again no sooner than ten minutes on.**
Without the floor every new flight re-asked a dead feed (the gate counted three calls in a minute). The card says the feed failed and the picked mood flies.

**A date a player reads is spoken, and a friend's invitation is a line, not a toast.**
The Daily Wind toast and the journal row both printed the raw ISO day, so a player read
"the wind of 2026-09-06", which is unreadable and carries two dashes into player copy that
the studio's copy law forbids. `DAILY.day()` speaks it ("6 September", the year only when
it is not this one) and `DAILY.day(d, 1)` shortens it for the journal's narrow left column,
which now carries the height alone and leaves the stamps to the list below it. The
invitation moved out of the toast entirely: floating, it covered the title art at 26 percent,
the wordmark and TO THE FIELD at 46, and the sound row at the foot, so it is now a quoted
line in the title's own column, above the button it explains. `test/daily.mjs` used to pin
the literal string with the ISO date in it, which made the gate the bug's protector; it
holds the law instead now, that the day is named in words and no dash of any kind appears.

**D-A6 (2026-09-07, Opus) — the kite, the reel and the crown, all four thin list items in one
frame.** Shot at 412 by 915 with sixty seven metres of line out, opened, and every one of them
was exactly as the thin list described.
- **The kite was a mark with a stub tail.** The screen size floor was three hundredths of the
  width, twelve pixels on a 412 phone, and the sail was two flat triangles. The floor is four
  and a half hundredths now, which is thirty seven pixels of kite and still well under the near
  cap so distance still shrinks it, and the sail is four panels split by the spine and the spar
  with the windward pair lit, the spars drawn on the cloth and a bridle in front of it. The tail
  now scales by the same amount the kite was floored by, because a floored kite trailing an
  unfloored ribbon is where the stub came from.
- **The reel read as a gold coin,** and it was one: two flat ellipses and a scratched ring. It
  is a spool seen end on now, two rims with a shadowed core between them, the line lying in
  coils across it, a handle nub off the near rim.
- **Mabel's crown was six flat circles** in two greens, alternating. A canopy has a light
  direction: the mass is one dark silhouette, the edge is broken by leaf lumps so the outline is
  not eight clean arcs, and the upper left of each lobe is lit because the sun is low and left
  in this sky. ⛔ The first pass at the lit leaves drew them at a ninth of the crown's radius and
  they read as measles, which is worse than the flat circles they were meant to fix; they are a
  sixteenth now and half transparent.
- **And a fourth thing the shot showed that was not on any list:** the hint, "Hold to pull the
  string", is the first thing a new player is ever told and it sits ON THE GRASS. Dark ink with
  a soft cream glow reads on a pale sky and turns to mud on dark green, and at 412 by 915 it
  could not be read at all. It stands on paper now, the same paper as the height and the mood
  chip, which is the lesson the altitude readout learned on Sep 06.

**D-A6b (2026-09-07, Opus) — the kite is gated by counting pixels, not by reading its size.** A
size number can be right while the drawing is a mark, which is exactly what was wrong here.
`UPDRAFT_DEV.kiteInk()` reads the canvas around the kite and counts the sail's reds and the
cloth's pales; the gate asks for a share of the screen at sixty seven metres of line, and putting
the old floor back turns it red at all three sizes (170 against 225 wanted, 124 against 164, 216
against 272). The hint's paper is asserted from its computed background, red when the paper is
taken away.

**A master and a ceiling, neither of which changes the sound today.** 2026-09-07. Every
voice connected straight to `ctx.destination` in the loudest game of the twelve (rms 0.1033 against
a fleet median near 0.05), so there was no level to move and nothing at all between a new voice and
the speaker (Director call 43). `AUDIO_MASTER` is 1.0, a deliberate no op.
**The ceiling is a waveshaper, not a compressor, and that was measured rather than assumed.** A
`DynamicsCompressor` at threshold minus three with the attack at zero still let a voice four times
too loud out at a peak of 1.08, because it has no lookahead and the loudest thing in this sky is a
transient. The waveshaper is the identity below 0.5 and bends to an asymptote at 0.95, so it is
EXACTLY transparent for everything the game plays today (loudest peak 0.379) and holds a four times
master at 0.862. Its slope at the origin is exactly one: Windup shipped a ceiling whose slope there
was 1.649, a 4.3 dB boost wearing the word ceiling. `oversample` is 'none' because Windup's ran at
2x and the reconstruction filter rang 37 percent past the curve's own bound.
⛔ **And the first measurement said the ceiling did nothing, because the ceiling was not there.**
The ear gate's offline shim had no `createWaveShaper`, so `ensure` took its else branch and the
render measured a graph with no ceiling in it. A shim missing a node does not fail: it measures a
different graph and calls it the game. There is an assertion for that now too.

**Every kite card carries its kite's shape.** 2026-09-07. Five cards reading
Diamond, Delta, Box, Sled and Dragon with nothing on them are five words, and a child picking a
kite is picking a SHAPE. `KITE_SHAPE` gives each one an outline in unit space with its spars and
its tail, and each entry says what the shape IS so a painter has something to argue with: a swept
delta with a deep keel, a two celled box, a sled that is a sheet of cloth with two spars and no
frame across it, a dragon whose tail is most of the kite. A locked kite shows its shape too,
because you are meant to want it.
**The gate is what is ON the canvas**, not that a canvas exists: every mark has ink, and no two
kites hash to the same picture. It goes red both ways, on no mark at all and on every kite drawn as
the diamond.
⛔ **`.card` IS A COLUMN**, so a canvas appended to it stacked on top of the name, every card grew
by forty pixels and **the fifth kite fell off the bottom of the screen**. Found by opening the shot,
not by any gate, and there is an assertion for it now: all five cards and BACK are on the screen.
⛔ **AND IN THE AIR ALL FIVE STILL FLY AS ONE DIAMOND.** `drawKite` draws a single shape whatever
you picked, so the Box and the Dragon fly as a Diamond with different numbers behind them. That is
the same fault the cards had, one screen further in, on the screen the game is actually played on.
Director call 53, and it is NOT built.

**D-2026-09-08 (Fable's builder, call 66 item 2) The lull and squall envelope is 0.7 to 1.3 in every mood, and
in Fresh that can shudder without a snap.** Measured in the sim before it was built: at the squall's 1.3 with
the fixed gust peak 0.4 and a full hold, the Fresh Diamond reaches tN 0.80 (0.58 at 1.0, 0.69 at 1.15), above
STRAIN_AT 0.75, so the whine, the red border and the buzz fire in a mood that by rule 3.3 cannot snap. Left
as built because the numbers are the brief's. Stephen's call: the shudder Blustery only, or ENV_MAX lower for
Fresh, or leave it as "on gusty days it fights you". At the lull's 0.7 a Fresh launch still passes 12 m in
3.1 s and a Blustery hold under the gust peak does not snap.

**The veer is a direction off the player's nose, never a compass.** The field always faces the wind at the
start of a flight; Real Wind's compass degrees stay a word in the HUD line. A seeded offset up to 10 degrees
plus a swing up to 15, both inside VEER_MAX_DEG 25, under four degrees a minute.
