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
- [ ] D1→D3. **Story-tree dominance / difficulty spread / human-error margin —
      DIRECTOR SESSION, not a patch.** I started building a suppression cap
      (story bleed limited to 80% of the gain term) and STOPPED: the full-
      Narrative-tree arms race is documented intentional design, and the cap
      would have broken the equilibrium the whole tune sits on. What today's
      pass DOES change: the mitigation is now visible (C1/C2), so "the number
      lied" becomes "I can watch the machine work" — and concede spam now has
      a price (D2). The remaining question is his to call, with options
      written up in BALANCE-SCALING.md §17: (1) cap story suppression so
      spikes always land something; (2) widen prebunk so the antibody scales
      with machine depth everywhere, not just flagship presses; (3) story
      upkeep — the machine costs influence per day to keep running. Each with
      predicted sim impact. Needs his playstyle notes on the four doors
      (standing OPEN CALL) before any of it lands.

## E. Feel / moments

- [x] E1. **Synergy discovery is a MOMENT.** SYNERGY DISCOVERED modal: pauses,
      gold card, combo name, the two nodes that made it, what it does, found
      count (N of 16 this run), CONTINUE. Queued through the same modal queue
      as doctrine so it cannot collide with an event card; never unpauses a
      paused sheet (runtime check proves both). Probe shot 06.
- [x] E2. **Wire scrolls slower.** 75px/s → 55px/s. check.js pins the constant.

## F. The Wire as a system (his big ask — design + corpus)

- [x] F1. **Reactive news engine spec drafted** → WIRE-ENGINE-SPEC.md. Thousands
      of stories; breaking-news tone + consequence-of-your-choices; driven by
      start country/bloc, tree mix, doctrine, recent actions, world state,
      escalating arcs on combinations. v1 needs NO new sim mechanics — it is
      a data schema over state the sim already exposes. HIS GREENLIGHT before
      the build.
- [ ] F2. **War heat as a strategy** (warmonger to distract) — design options in
      the spec, needs his greenlight on the shape.
- [ ] F3. **Corpus writing = Opus grunt work** → HANDOFF-OPUS-WIRE.md (schema,
      voice rules, batch plan). Blocked on F1 greenlight.

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
