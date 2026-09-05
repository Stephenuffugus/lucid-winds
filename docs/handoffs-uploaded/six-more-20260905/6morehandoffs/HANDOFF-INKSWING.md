# HANDOFF — INKSWING (Pendulum Painter)

**Studio:** Lucid Winds / Sky Walk Studio
**Format:** Single-file vanilla HTML/CSS/JS PWA. No build steps. No libraries. Mobile-first, portrait.
**Deploy target:** lucidwinds.com/satellites/inkswing
**Session goal:** Grab-and-release pendulum drawing with real damped physics, ink layering, sand mode, ratio sonification, poster export, share-a-swing links.

---

## 1. Concept
A brass pendulum hangs over a sheet of cream paper. **Grab the bob and throw it** — the arc of your fling becomes the swing, and a pen beneath it begins to draw: loops tightening into rosettes, figure-eights collapsing inward as the pendulum slowly loses its breath. Release again in a second ink and the curves interleave. What comes out is a harmonograph drawing — the Victorian parlor machine, the science-museum sand pendulum — except *you* threw it, and no two throws are alike.

And because pendulum frequency ratios are musical intervals, your drawing has a chord: a 2:3 rig hums a perfect fifth while it draws. You can hear whether a piece will be beautiful.

**Tone:** Victorian instrument-maker's desk meets meditation app. Watching it draw is the entire show.

## 2. Market research summary (Sep 2026)
- Physics is fully documented and tiny: x(t)=Σ A·sin(ωt+φ)·e^(−dt) per axis; damping is what turns Lissajous figures into the inward-spiraling harmonograph look; commensurate frequency ratios (2:1, 3:2) → closed regular figures, near-ratios → slowly precessing knots (the gorgeous ones).
- Existing digital versions = **slider tools**: GitHub harmonograph generators, coding-tutorial demos (amplitude/frequency/phase/decay panels). Functional, zero soul, no mobile toy.
- Physical world: sand pendulums are beloved science-class/museum staples (whole teacher-video ecosystems); real harmonographs peaked in the 1890s as parlor wonders — strong "rediscovered antique" story.
- **Gaps we take:** (1) gesture as physics — fling the bob, don't type the numbers; (2) layering as composition; (3) sonified ratios (found nowhere); (4) keepsake export + share-a-swing.

**Positioning line:** "Throw the pendulum. Keep the drawing."

## 3. Core loop
1. **Rig view:** pendulum bob over paper. Grab it, pull, release — release velocity + position = amplitudes and phases (your literal gesture becomes the math; wilder throws = wilder art).
2. **It draws.** 30–90 seconds of real damped motion; line weight breathes with speed (fast = thin, slow settling = thick pooling ink). You can stop it, or let it spiral to its center dot.
3. **Layer:** choose a new ink, throw again on the same sheet. 2–4 layers interleave (phase-offset moiré magic). Undo removes last layer.
4. **Keep or clear:** save to the folio, export poster, or tear off the sheet (satisfying rip) and go again.
5. **Rig upgrades** change the geometry (see §5), each unlocked by simply finishing drawings.

## 4. Physics & rendering
- Two damped oscillators per pendulum axis + optional paper-pendulum (moving canvas under fixed pen — the classic lateral harmonograph); closed-form position, so rendering is fast-forwardable (impatient mode: "let it finish" button completes the drawing in 2s with a time-lapse whoosh).
- Damping per rig (brass = long, sand = short); tiny frequency detune from throw force (real pendulums' amplitude-dependent period — makes hard throws precess more; physical truth = aesthetic reward).
- Ink rendering: stroke segments with width = f(speed), slight wet-edge darkening at slow points, subtle paper grain show-through. This is a *materials* app — the ink must look like ink.
- **Sand mode:** the drawing head pours a thinning sand line instead (bright grains on dark felt); finished sand drawings can be **tilted to erase** (DeviceOrientation, grains slide off) — the museum-exhibit fantasy, and the most screen-recordable interaction in the app.
- Deterministic from throw params + seed (house law) → **share-a-swing links:** a drawing is just its throw list (a few dozen bytes); recipients watch it redraw live.

## 5. Rigs (progression = geometry, not power)
1. **Single lateral** (starter): one pendulum + fixed pen — ellipses, spirals.
2. **Crossed pair:** pen on one, paper on the other — true harmonograph knots.
3. **Rotary gimbal:** circular motion component — rosettes and mandalas.
4. **Double-link** (chaotic): double pendulum arm — controlled chaos, never repeats, expert toy.
- Per-rig dials kept physical and few: pendulum length (slider = frequency; labeled with its musical note), damping (felt vs brass bob), ink set. **No raw number entry anywhere** — lengths and bobs, like a real machine.

## 6. Sonification (the signature layer)
- Each pendulum axis hums a soft sine at (scaled) its frequency; a 3:2 length setting literally sounds a fifth, 2:1 an octave, near-miss ratios beat and shimmer exactly as the drawing precesses. Tuning the rig = tuning a chord; consonance predicts symmetry. (Quiet, optional, on by default at low volume.)
- Draw-time audio: paper whisper tracking pen speed, sand hiss in sand mode, the rip. All synthesized (SWELL/WINDUP recipes reuse).

## 7. Folio, posters, sharing
- Folio: saved sheets with rig/ratio/date stamps; name your favorites.
- Poster export (house pattern, print-res PNG): *Plate* (ink on cream, brass caption "Fig. 12 — thrown by Stephen, 3:2, two inks"), *Dark* (sand on black felt), *Bare* (art only). lucidwinds.com credit line.
- Share-a-swing links (watch it redraw) + a **Daily Ratio** (seeded rig setting; everyone throws on the same instrument; share results — house daily pattern).

## 8. Toolchain
- **Claude Code:** build. Oscillator math + ink rendering first.
- **Gemini Pro:** ink/paper/brass material studies; poster layout refs.
- **ChatGPT Pro:** ratio→figure preset table review (which length pairs make teachable "wow" defaults); caption copy grammar.
- **Grok basic:** name check (INKSWING), launch thread ("Victorian screensaver machine" angle).
- **Meshy premium:** the brass rig as a 3D hero render — like WINDUP, the machine is the marketing image; spend here.

## 9. Architecture & build order
- Canvas 2D; drawing accumulates on an offscreen sheet layer (never re-render whole history); UI/rig layer above; closed-form sampling at adaptive step (dense when fast). localStorage folio (sheets as throw-lists, tiny; raster cache optional); PWA inline.
1. Oscillators + grab/fling mapping + line render. **Feel-gate: one thrown ellipse decaying into a spiral must be hypnotic, or tune ink/damping until it is.**
2. Layering + inks + tear-off + folio.
3. Rigs 2–3 + length/damping controls with note labels.
4. Sonification + draw-time audio.
5. Sand mode + tilt-to-erase.
6. Poster export + share links + Daily Ratio + PWA wrapper. (Rig 4 chaotic = stretch within session if time.)

## 10. Stretch
- Ink physics upgrades (bleed on slow points, metallic inks).
- Wall-clock mode: an ambient auto-thrower making one slow drawing per hour (WARDIAN idle-companion energy).
- Spirograph-adjacent gear rig (distinct math, same materials) as a sibling unlock.
- Classroom one-pager: harmonic motion + ratios + intervals in one demo (fifth education-door title; the sonified ratio IS the lesson).
- ASTERISM crossover poster paper; WINDUP crossover — punch a strip of your drawing's chord.

## 11. Open questions
- Name: INKSWING vs LULL vs FIG. 12 (the caption as a name — weird, memorable). 
- Sonification default-on at low volume (recommend) or opt-in?
- Sand tilt-to-erase: also erase ink sheets (as "wash")? (Recommend: no — ink is permanent, sand is ephemeral; the material contrast is the point.)
