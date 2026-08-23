# FLOCK THE WORLD — Launch Audit Results

Date: 2026-08-23
Scope: `FTW-game.html`, `FTW-check.js`, and the supplied audit brief.
Target: paid Google Play release, landscape phone play around 915×412.

## Executive result

The existing game passed all 114 supplied checks, and the supplied mutation self-test passed all 116 checks. The audit found several gaps not covered by those gates. A repaired copy is included as `FTW-game-audited.html`, plus `FTW-check-audited.js` with additional regression checks. The repaired build passes all 114 original checks and all 133 normal checks in the expanded suite; with the original two mutation self-tests enabled it passes 135 total.

The single highest-severity problem was a player-name HTML injection path in population milestone headlines. It was reachable with a vendor name under the existing 24-character limit. That path is fixed in the audited build.

## Bugs found and fixed

### P0 / launch blocker: vendor-name markup injection through population milestones

**What happened:** Most vendor-name output correctly used the game's HTML escaping helper, but the population milestone strings interpolated `s.co` directly. Those strings enter the news queue and are later written into `innerHTML` by the scrolling wire and Feed. A name such as `<svg/onload=alert(1)>` could therefore become markup when a milestone fired.

**Fix:** All population milestone vendor-name interpolation now goes through `escH(s.co)`. Added a regression check that tests every population milestone against markup-bearing player input.

### P1: save/reload could erase live bubbles, including leak consequences

**What happened:** `saveRun()` did not serialize `bubbles` or `nextBubble`. Reloading could remove cash/influence collectibles, but more importantly it could remove a live leak bubble before expiration and therefore dodge its oversight penalty.

**Fix:** Active bubbles and the next-spawn day are serialized and defensively restored.

### P1: pending choice events could be dodged by reloading

**What happened:** A choice event existed only as an open modal. The save did not remember which event was pending. Reloading during an event resumed the run without that decision.

**Fix:** The active event id is persisted. A resumed game reopens that event until the player actually chooses an option.

### P1: touch targets below the project's 48 px floor

**What happened:** The original gate checked only zoom, speed, and bottom navigation buttons. The region popover close control and action controls were explicitly 34 px, and several other interactive controls had no 48 px minimum.

**Fix:** 48 px minimums were added to region actions/close, general action and buy buttons, modal options, menu controls, difficulty controls, the rotate-hint close button, guide skip, and the population-line control. Guide Skip is now a real button rather than a clickable `div`.

### P1: the prominent Watched odometer looked clickable but did nothing

**What happened:** `#ledline` had `role="button"`, `tabindex="0"`, pointer styling, and an accessibility label saying it opens the population ledger, but no click or keyboard handler existed.

**Fix:** Tap/click and Enter/Space now open the Ledger.

### P2: backing out of the leave modal could unpause a paused game

**What happened:** The Back action restored speed with `prev || 1`. If the player entered the leave modal while paused (`prev === 0`), Back changed the game to 1×.

**Fix:** Back restores `prev` exactly.

### P2: resume lost peak-organized and short population history

**What happened:** The end screen reports “Organized at peak,” but `popPeakOrg` was not saved. The short `popHist` used for population-rate display was also lost.

**Fix:** Both values are serialized and restored.

### P2: resume briefly reset important HUD/World aggregates

**What happened:** `subj`, `avgSus`, `avgMil`, `avgRes`, and unread count were not saved. A resumed state therefore initially contained new-game defaults until the next simulation tick recomputed them.

**Fix:** These aggregates are persisted and defensively restored, so the resumed screen is accurate immediately.

### P2: Patriotism/oversight could finish above 100%

**What happened:** Oversight was clamped earlier in `tick()`, but leak expiration and event/world effects could add more afterward. The finish condition then ran on the unclamped value, allowing end-state values above 100%.

**Fix:** Oversight is clamped again after late tick mutations and before end-condition checks.

### P2: hidden map animation continued on the end screen

**What happened:** `drawFx()` continuously rescheduled itself. `finish()` switched screens but did not stop that requestAnimationFrame loop.

**Fix:** `finish()` now cancels and clears the RAF.

### P2 / pre-audio integration: muting destroyed ambient-bed state

**What happened:** Muting called `sfxBed(id,false)`, which deleted the registered bed. Unmuting therefore had no remembered ambient bed to resume. This is invisible today because the project intentionally has no audio files yet, but it would surface as soon as audio lands.

**Fix:** Muting pauses existing bed audio without deleting desired bed state; unmuting resumes registered beds.

## Existing gate weakness fixed

The original “48 px floor” section only asserts `.zb`, `.sp`, and `.nb`. The expanded checker now covers the high-value controls uncovered by this audit and adds regressions for the security, resume, pause, RAF, and sound-state fixes.

## Balance / simulation observations

The existing test harness already proves that a balanced bot can reach a real ending and that doing nothing cannot win. Additional source/logic review did not reveal a trivial one-button win path. The game has meaningful pressure from upkeep, node inflation, market-entry scaling, resistance, and the Patriotism meter.

This audit did not use balance opinions as launch blockers. Final difficulty/pacing still deserves human play sessions because a headless bot cannot judge whether the middle of a 10–40 minute run feels repetitive or whether information arrives at a comfortable pace.

## Landscape and art integration

Landscape is correctly treated as the intended mobile layout in the source, including a dedicated `orientation: landscape` / short-height CSS branch. The added 48 px population target increases HUD height, so the final integrated-art build should be visually checked at roughly 915×412 on a real phone before release.

The shipping HTML currently contains no PNG/JPG/WebP image references. That is expected from the brief, but it means the newly generated art still has to be integrated rather than merely copied beside the game.

Recommended mapping for the art handoff:

- Wordmark and menu backdrop: menu.
- Deployment, Watchlist, Narrative, Crisis icons: skill-tree nodes.
- Five landscape tree backdrops: behind the respective tree/synergy sheets at low opacity.
- Synergy badges: discovered synergy ledger entries.
- Mode, difficulty, and doctrine cards: menu and doctrine modal.
- Cast portraits: event modals by `who` id.
- Resistance icons: countermeasure/feed/World presentation.
- End backdrops: win, refusal, coalition end states.
- UI kit: replace/selectively supplement current inline SVG and state/action glyphs.
- Play icon and feature graphic: store/package assets rather than in-game UI.

Do not generate another large batch of art until these assets are cut in and viewed at actual game size. The integration pass will expose any genuinely missing illustration much more reliably than the art spec alone.

## Known items intentionally not counted as new defects

Per the supplied audit brief: audio files are not delivered yet; art is not integrated yet; manifest/service worker are not present yet; “In the streets” population semantics are pending; unentered regions can already contain organized people; ambient wire repetition is known; `#ctip` and `#shToast` are known dead elements.

## Validation

Original files:

- `FTW_FILE=FTW-game.html node FTW-check.js` → all 114 checks passed.
- `FTW_SELFTEST=1` → all 116 checks passed.

Audited files:

- `FTW_FILE=FTW-game-audited.html node FTW-check.js` → all 114 original checks passed.
- `FTW_FILE=FTW-game-audited.html node FTW-check-audited.js` → all 133 checks passed.
- Expanded suite with the original self-test enabled → all 135 checks passed.

## Remaining release checks that need a real browser/device

The execution environment used for this audit could run the real game logic and source-level checks but could not complete a true interactive browser/device rendering pass. Before Play submission, manually verify the integrated build on at least one Android phone in landscape for: safe-area/notch edges, 48 px physical targets, keyboard/focus behavior, map dragging while popovers are open, notification overlap, modal scrolling, the taller Watched control, image cropping, and memory/frame-rate behavior with the final art loaded.
