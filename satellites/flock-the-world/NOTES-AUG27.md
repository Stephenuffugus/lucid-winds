# FTW + publishing — Stephen's notes, Aug 27 (Contractor/Incumbent runs, hardest diff LOSS at patriotism 100)

Source: long phone-note batch. Run context: "Platform dismantled · The Contractor ·
Incumbent · Subjugation 71.4% · Patriotism 100.0% · 2501 days · Synergies found 7".
Earlier easy runs felt auto-win via story tree; hardest-diff run LOST to patriotism
while conceding everywhere.

Checklist in his order. `[x]` only with evidence (check.js green + live grep or
probe shot, house rules). Evidence for this pass: check.js 308→332 all green
(new "Aug 27 notes" group), seeded sim table byte-identical to the Aug-25
reference on the Startup canary + both guard losses, probe shots 01-11 in
portal-assets/review/ftw-aug27/ (all LOOKED at; shot 08 caught a portrait date
truncation which was then fixed and re-proven in shot 09 with a programmatic
truncation assert).

## A. Trust audit (his "I feel like you left notes unfixed" — he's right to ask)

- [x] A1. **NOTES-AUG25 item 12 (same briefing every mode)** — VERIFIED BUILT, ledger
      never flipped. GUIDE_CRISIS + GUIDE_DEEP exist, startGuide picks per mode,
      and `ftw_guide_done` persists across sessions on finish OR skip (endGuide)
      so the briefing fires once per account ever. LEDGER-DEBT: crossed off in
      NOTES-AUG25.md today with line evidence. The miss: built during the Aug 25
      kink hunts, reported in HANDOFF as done, checkbox never flipped and never
      told to him plainly. Owned in the session report.
- [x] A2. **NOTES-AUG25 item 13 (tips toggle + persist seen)** — VERIFIED BUILT,
      ledger never flipped. Menu checkbox wired to K_TIPS, tipsOff() gates field
      notes and the guide, seen() persists. Same LEDGER-DEBT, same owning.
- [x] A3. **Bubble sounds** — he retracted in the same note ("I was wrong — the most
      recent one did"). bubble_leak.mp3 wired Aug 25 (ledger item 6). No action.

## B. Bugs (this batch)

- [x] B1. **Map flickers black late game, exactly when a country starts flashing.**
      ROOT CAUSE: paintHud — when the HUD height changes (the REFUSAL strip
      churning as regions cross into riot/uprising), `gv.layout()` ran, and
      layout resets `canvas.width`, which CLEARS the canvas, with NO redraw
      until the next tick (up to 800ms at 1x). Late game the strip churns
      constantly → repeated blackouts. FIXED both ways: layout only touches the
      canvas backing store when the size actually changed, and the HUD
      re-anchor now repaints in the same frame. check.js: "layout() guards the
      canvas backing store" + "re-anchors AND repaints". ⚠ needs his phone to
      confirm the symptom is gone (codespace cannot reproduce his late-game state).
- [x] B2. **Greenland uprising not findable in the World tab.** Greenland renders
      huge but belongs to Western Europe; the World tab spoke only region names.
      FIXED three ways: region cards list their map-dominant member countries
      (per-polygon bbox prominence, so Greenland LEADS Western Europe — France's
      Atlantic bbox out-boxed it until prominence switched to polygon sums);
      a TROUBLE ribbon atop the World tab names every rioting/uprising region
      with its biggest country in brackets, tap scrolls to the glowing card;
      the map popover already said "Country · Region". Probe shots 02/03;
      runtime check proves Greenland leads its region faces.
- [x] B3. **Enter market looks disabled even when affordable.** Enabled .buy now
      glows (bright sodium text, warm gradient, box-shadow the disabled state
      never gets); a short one says "short on cash · need $X more" right on the
      button. Probe shots 10/11 + computed-style asserts (lit=glow+enabled,
      broke=dead+why).

## C. Visibility of win-condition stats (clean-UI constraint)

- [x] C1. **Suspicion visible at all times.** 4th HUD stat (Date · Capital ·
      Influence · Suspicion): live avgSus, colour-graded (dim, gold at 10+,
      red at 16+), tap opens the World tab like Capital does. Landscape row
      holds (shot 01); portrait initially truncated the Date (shot 08 — caught
      by LOOKING), fixed with a late-CSS no-shrink rule and re-proven with a
      scrollWidth assert (shot 09). The live probe even caught the loop working:
      suspicion spiked to 12.0 in one shot and had visibly ground down to 4.8
      by the next.
- [x] C2. **Aftermath receipts explain mitigation.** He saw "+10 suspicion" then
      found the world number at 1.9 and concluded the number lied. It didn't:
      the story machine's ~0.2/day bleed erases a spike in seconds of 3x play,
      invisibly. The receipt now adds "Your narrative machine grinds ~X
      suspicion off every day. This spike is already fading: watch the HUD
      number fall." Same treatment for patriotism relief (dec bleed note + the
      pinned-at-floor note event receipts lacked). susBleed() mirrors tick's
      suppression term with a check.js drift tripwire (the term must appear
      twice, identically). Probe shot 07.
- [x] C3. **War heat legible.** World-tab stat now shows its live effects under
      the number (fear +N · unrest +N · patriotism +N/day) with a plain-words
      tooltip; the pill already shows WAR% when hot. Full "warmonger as a
      strategy" design → F2 (director call).

## D. Balance (single-variable, sim-verified, canaries must stay green)

- [x] D2. **Concede spam across regions.** Per-region 10d pricing (Aug 25) holds,
      but he conceded EVERYWHERE forever. NEW: capitulation fatigue — more than
      3 banked concessions in any rolling 45 days = the movement smells
      weakness: each further one banks NO goodwill and +1.5 Organized in every
      other active region, with a wire line, an owning toast, AND a warning at
      arm time before the spend (shot 05). Window persists across reloads
      (concLog in save/load, validated). Legend updated. Bots' single-region
      12/17d cadence stays under the threshold: Startup canary byte-identical
      (WIN d1124 ovr 32.1), all guards hold, check.js 5 new fatigue checks.
- [x] D1. **§17 option 2 LANDED (Stephen's pick, Aug 27 evening): prebunk
      widened, two-tier.** Flagship presses (media>=0.7) keep the exact
      shipped behavior at machine depth 4-6; half-free presses (media>=0.5:
      +Southern Africa, +South America) breed the antibody once the machine
      runs DEEP (depth 7+); odds accelerate past depth 7 (2.5%→ up to 5%).
      METERED HONESTLY: the first cut (wide tier at depth 4) flipped the
      Startup canary to a LOSS at subj 90.7 — the balanced bot's own moderate
      story usage bred world antibodies — so the depth tier is the metered
      shape. With it, the ENTIRE sim reference table is byte-identical (the
      story-stack BOT's win day is unchanged too: its econ walk is pinned by
      the Aug-25 streak floor either way; the new pressure lands on the HUMAN
      deep-story lane, as suspicion that sticks and organizing that spreads
      in six regions instead of four). If the tree still reads solved after
      he plays this, next step is §17 option 3 (story upkeep), with him at
      the table. 3 new checks pin the two-tier contract.
- [ ] D3. **Difficulty spread / human-error margin / four doors** — still a
      director session; needs his playstyle notes on the doors (standing
      OPEN CALL).

## E. Feel / moments

- [x] E1. **Synergy discovery is a MOMENT.** SYNERGY DISCOVERED modal: pauses,
      gold card, combo name, the two nodes that made it, what it does, found
      count (N of 16 this run), CONTINUE. Queued through the same modal queue
      as doctrine so it cannot collide with an event card; never unpauses a
      paused sheet (runtime check proves both). Probe shot 06.
- [x] E2. **Wire scrolls slower.** 75px/s → 55px/s. check.js pins the constant.

## F. The Wire as a system (GREENLIT Aug 27 — "I totally green light the build and engine")

- [x] F1. **Wire engine v1 SHIPPED.** wire-corpus.js (60-entry seed, every
      condition key + slot + an escalating school arc exercised), declarative
      condition compiler (wireWhen), weighted pick with cooldowns/once/arc
      gaps, slot filling off the hottest region's map face, state persisted
      (wireCd pruned / wireOnce / wireArc validated on load). scripts/
      wire_lint.js holds every batch to the schema (node ids from the LIVE
      game, dash law, real-name denylist, ovrTxt rule — its first run caught
      a real violation, "oversight board", in my own seed). ⛔ SEEDED-STREAM
      LAW learned the hard way: the first tick hook moved the ambient
      cadence and consumed corpus dice, which re-rolled the seeded streams
      and "flipped" the 3-seed canary — the engine now consumes ZERO
      randomness when no corpus is loaded and the legacy %23 ambient beat is
      untouched in headless runs, so every seeded table stays byte-identical.
      Live-probed: 60 entries load on the real page, dep_pilot_1 matched a
      pilot-owning run and landed in the actual ticker, no braces, no errors
      (shot 12). checks 334→347.
- [ ] F2. **War heat as a strategy** (warmonger to distract) — design options in
      the spec, needs his greenlight on the shape.
- [ ] F3. **Corpus batches = Opus grunt work** → HANDOFF-OPUS-WIRE.md now
      UNBLOCKED (engine + lint shipped; batches go to wire-batches/, gated by
      `node scripts/wire_lint.js`).
- [x] F4. **Synergy art pipeline ready** (his ask: artist makes plates matching
      the aesthetic). SYN_ART registry + .synart plate slot wired into the
      discovery modal (contained on a dark mat, hidden on short-landscape like
      .evart); plates land in art/synergy/<id>.webp, one registry flip each.
      Artist brief SENT to 012Assets: "FLOCK THE WORLD — Sheet 12: Synergy
      Plates (16) + Achievement Badges (proposed)" — all 16 combos with paint
      directions, capstone-pipeline format (magenta, color-key cut), plus 16
      PROPOSED achievements awaiting his yes/no (no achievement system built
      yet — his call).

## G. Publishing / revenue (repo-level) — see HANDOFF-OPUS-PUBLISH.md

- [ ] G1. **Jimothy on Pi Network** — demo + unlock-for-Pi model. Research +
      runbook in the Opus handoff (existing lanes: PI_DEPLOY.md, ?pi=1
      compliance rule).
- [ ] G2. **FTW on Pi Network after Jimothy.**
- [ ] G3. **Soundtrack distribution (DistroKid/Spotify).** ⚠ resolve Suno plan
      tier rights + AI-disclosure policies BEFORE submitting anywhere —
      flagged in the handoff, decision his.
- [ ] G4. **SEO pass on portal + game pages** — audit task in the handoff.
- [ ] G5. **Listing/marketing sweep** (Reddit/forums/directories, each with its
      self-promo rules) — target list + copy drafts in the handoff; he posts.
- [ ] G6. **Google Play** — FTW TWA gates were already 10/10 green; remaining
      steps are Stephen-side (CROSSCHECK-PLAY-AUG22.md §5).

## Standing context

- Nothing in this pass is device-tested. B1 (flicker) especially needs his
  phone: the root cause is proven and gated, the symptom needs his eyes.
- Deploy = `git push origin add-sproing-jumper:main`; live-verify the
  versioned URL with a fresh marker, never a bare 200. sw.js SHELL_VERSION
  and the registration ?v= bumped in lockstep to 20260827a.
- Fable budget is the constraint this week: Fable does surgery, Opus handoffs
  take corpus/research grunt work.

## H. Evening 2 — his Vendor run + the loss screen (Aug 27 late)

Run report: "Platform dismantled · Contractor · Vendor · Subj 56.4% ·
Patriotism 100.0% · 1296 days · 5 synergies." Second straight patriotism loss
(Incumbent, then Vendor), this time with ZERO uprisings.

- [x] H1. **Loss screen: the better world, not the vendor's lobby.** The
      "Platform dismantled" ending showed bg_end_coalition (the company's own
      glory lobby, Capitol out the window) and the image scrolled away with
      the text. Root causes: wrong picture for the ending where the WORLD
      wins, and the --shot backdrop is absolute inside the scrolling section.
      BUILT: both loss endings now play a cross-fading slideshow of his two
      happy-people pictures (the refusal bird-box street, then the daylight
      boulevard families) FIXED to the viewport, slow drift, diagonal scrim
      (text column dark, world bright), while the epilogue writes itself out
      over it. Wins keep their single doors; vendor lobby image retired from
      the loss path (check-pinned). Probe caught two real bugs before ship:
      the z-order (removing --shot dropped the child lift; verdict rendered
      UNDER the scrim) and a dusk-dark first scrim. Shots 13-16 (landscape
      A/B, scrolled, portrait), timer torn down on Run it back, checks 350.
      ⚠ NOTE FOR HIM: only TWO happy-people images exist (refusal street +
      the glove-win boulevard — the boulevard has drones and camera poles in
      frame since it was painted as the Grateful World's weaponized
      sunshine). If he wants a third, clean "free world" image, one more
      plate from his artist drops straight in (imgs array, one line).
- [ ] H2. **Flicker fix still unverified on device** — his run had no
      uprisings, so the refusal-strip churn that caused it never fired. Needs
      a run that riots, or the dev panel.
- [ ] H3. **Balance data point for D3**: two straight patriotism losses
      (Incumbent then Vendor) playing varied strategies, zero uprisings. The
      loss meter may now be the dominant pressure for human play above easy.
      Logged for the director tuning sitting; not tuned solo.

## I. Evening 3 — the flight recorder (his coach-tape ask)

- [x] I1. **FLIGHT RECORDER BUILT + LIVE.** Every run records itself: nodes,
      region actions (with concede quality), event choices, doctrine, desk/
      acquisition/lobbying, market entries, synergies, street escalations,
      and a 30-day state snapshot (subj/patriotism/suspicion/organized/cash/
      influence/markets/war/floor/bubbles caught). End screen grows a COPY
      RUN LOG FOR THE COACH button, visible ONLY with the fleet dev flag
      (sws_dev_ok) so players never see it; mid-run export via
      FTW_FLIGHT.copy() in the console. Local only, capped 4000 entries with
      a truncation marker, survives reloads with its run, resets on a new
      run. ⛔ zero randomness + never throws (it runs inside tick) — module
      span check-pinned against Math.random; full sim table byte-identical.
      scripts/ftw_coach.mjs turns a pasted log into the evidence sheet
      (trajectory, build order, cadence, red flags: idle treasury under a
      climbing loss meter, unanswered suspicion spikes, the 70→100 runway,
      influence hoarding); verdict = me + counterfactual sims. Workflow doc:
      FLIGHT-RECORDER.md. End-to-end probe: played real moves headless,
      exported, coach script read it clean; button proven hidden without
      the flag (⛔ probe lesson: localStorage is origin-shared across pages,
      and a flagless page cannot even boot headless past dev-gate — the
      gate test lives in-page). Checks 350→358.
- [ ] I2. **His songs**: more main-theme variations incoming — the playlist
      system takes them as drop-ins (theme_menu_2.mp3, theme_menu_3.mp3 +
      one MUSIC_HAVE line each, per SFX-GUIDE.md; same for any bed). Still
      owed from Aug 24: bed_tension.
- [ ] I3. **His assets**: Sheet 12 synergy plates in progress — each lands as
      art/synergy/<id>.webp + one SYN_ART registry flip.
