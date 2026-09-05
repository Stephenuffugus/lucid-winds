# HANDOFF — WINDUP (Music Box Punch Cards)

**Studio:** Lucid Winds / Sky Walk Studio
**Format:** Single-file vanilla HTML/CSS/JS PWA. No build steps. No libraries. Mobile-first, portrait.
**Deploy target:** lucidwinds.com/satellites/windup
**Session goal:** Punch strip editor + hand-crank playback with synthesized music box + gift-wrap share links + printable real-strip export.

---

## 1. Concept
A little brass-and-walnut music box on a velvet cloth. Feed it a paper strip, punch holes with your finger — each hole a note — then **turn the crank yourself** and hear your melody plink out, at exactly the speed your finger cranks. Wrap it as a gift: send a link, and the recipient sees a ribboned box that they unwrap and crank to hear your song for them.

**Tone:** heirloom miniature. The object should feel inherited.

## 2. Market research summary (Sep 2026)
- **musicboxmaniacs.com:** the community hub — full online editor, MIDI import, MP3/PDF export, melody library, hardware tie-ins. Serious, desktop-shaped, utilitarian.
- **Music Box Fun** (open-source web), **Music Box Composer** (mobile): same shape — piano-roll utilities for people who own physical Kikkerland-style boxes.
- **Kikkerland Make-Your-Own kits** sell steadily on charm alone; Vi Hart videos and YouTube rabbit holes prove the fascination.
- Authentic constraint from real mechanisms: a note can't re-trigger too soon (tine still vibrating / punch spacing) — adopting it makes compositions feel real *and* keeps beginners from mud.
- **Gap:** everything existing is a tool. Nobody has built the *experience* — crank-as-playback, box-as-beloved-object, gift-as-verb, kid-first. And nobody bridges both ways: we can still export a correctly-spaced printable strip for real boxes, capturing the utility crowd as a bonus.

**Positioning line:** "Punch a song. Crank it. Give it away."

## 3. Core loop
1. **Punch:** strip scrolls horizontally; 15 note rows (diatonic C major, two octaves — real 15-note box layout); tap to punch (satisfying *chnk* + paper confetti), tap again to unpunch. Playhead ghost-plinks notes as you place them. Too-close repeat = hole outlined red with a gentle "the tine is still singing" tooltip.
2. **Crank:** grab the handle and turn in circles — strip advances proportionally. Crank smooth and steady, or dramatically slow for the *creepy music box* effect every kid discovers in 10 seconds. Auto-play button exists but the crank is the point (haptic tick per crank revolution).
3. **Refine:** scrub anywhere, punch more. Strip lengthens as needed.
4. **Give:** name the song → choose wrapping (paper + ribbon) → share link. Recipient's view: wrapped box, pull the ribbon, lid opens, *they crank it themselves.* The gift is the interaction, not a file.

## 4. Musical scaffolding (so beginners sound good)
- 15-note diatonic = no wrong notes vertically (ASTERISM/SWELL philosophy).
- Grid quantized to 8ths; light swing toggle.
- **Starter strips:** Happy Birthday, Twinkle, a lullaby — pre-punched, editable (learn by vandalizing, the real kit tradition).
- **Seed melodies:** dice button punches a pleasant 4-bar seed (seeded generator: chord-tone skeleton + passing tones) to riff on.
- Chord ghost-rows: optional faint shading showing which rows harmonize with what you've punched nearby (subtle, off by default).

## 5. Sound (the make-or-break)
- Synthesized music-box tine: sine + 2 detuned partials with fast exponential decay + a soft mallet-click transient + long-decay high shimmer partial; slight per-note random detune (±3 cents) and level jitter = handmade imperfection. Lower notes decay longer (real tine behavior).
- Crank speed maps to tempo *and* to a faint mechanism bed: gear tick + spring creak, pitch/rate tracking crank velocity. Stop cranking mid-note = notes ring out naturally (decays continue) — exactly like the real thing.
- Small plate reverb (procedural IR, WARDIAN/SWELL pattern). Export audio via MediaRecorder (webm/m4a).

## 6. Presentation
- The box: warm walnut + brass, rendered big; strip feeds through visibly; tiny hammers/tines animate per note (watch your song get played). Velvet backdrop, soft lamp light.
- Punch view: cream paper, letterpress row labels, red margin line — the real strip aesthetic.
- Wrapping papers unlock gently with songs written (birthday, snowflake, stars — an ASTERISM-chart paper as a crossover wink).
- Strip PNG export (the visual punch card as an image) + **printable PDF at true 15/30-note dimensions** for real Kikkerland-class boxes (the bridge feature; correct spacing per published strip specs).

## 7. Share format
- Song = row/column punch list → few hundred bytes → base64url in link hash (zero backend, house pattern). Wrapping choice + dedication line ride along.
- Recipient needs nothing installed; link opens the PWA in gift mode.

## 8. Toolchain
- **Claude Code:** build. Tine synthesis + crank feel first.
- **ChatGPT Pro:** starter-strip arrangements (verify against 15-note diatonic range + collision rule), dedication-line suggestions.
- **Gemini Pro:** walnut/brass/velvet palette frames; wrapping paper pattern studies (encode as canvas patterns).
- **Grok basic:** name check (WINDUP), gift-season social angles (this app is a December rocket — plan the holiday post now).
- **Meshy premium:** the music box as a 3D hero render for icon/store/site — this app's object *is* its marketing image; spend the Meshy budget here.

## 9. Architecture & build order
- Canvas 2D for box + strip; pointer-circle detection for crank (angle delta accumulation); Web Audio scheduler slaved to crank position (schedule notes as strip crosses the read line).
1. Tine voice + test keyboard. **Feel-gate: one note must sound like a memory.**
2. Strip editor: punch/unpunch, scroll, playhead ghost notes, collision rule.
3. Crank: gesture → strip advance → note triggering + mechanism bed + ring-out.
4. Box render + animated tines + velvet scene.
5. Starter strips, seed dice, save shelf (localStorage).
6. Gift wrap flow + share links + recipient mode.
7. Audio export, strip PNG, printable PDF, PWA wrapper.

## 10. Stretch
- 30-note chromatic box unlock (the "grand" box) for power users.
- Duet strips (two colors of holes, two tine voices).
- Physical-box community bridge: import from common strip-editor formats.
- Music-box covers of the SWELL moods; Lullaby crossover with Twelve Realms audience.
- Penny's first strip shipped as a starter melody, credited.

## 11. Open questions
- Name: WINDUP vs TINKERBOX vs THE LITTLE CRANK. (WINDUP is clean; check collisions.)
- 15-note only in slice (recommend — constraint is the charm) or 30-note from day one?
- Gift links: include a "punched by [name]" signature line by default? (Recommend yes, editable.)
