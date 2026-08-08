# WHACK BOX (working name, Stephen renames)
# Party games program source of truth. Compiled 2026-08-07 from the three-designer pitch panel and the Engine 3 multiplayer spec (assets/03-multiplayer-games.md).

---

## WHAT WHACK BOX IS

Whack Box is the Sky Wolf Studios party games program: one shared screen on the couch TV, everyone's phone as a controller, a 4-character room code, zero install for guests. It fills the gap between Jackbox at 30 dollars and the free web knockoffs that are shovelware. Every title in the program is cozy, general audience, and mints sunbeams for every participant, not just the winner.

"Whack Box" is a working name. Every game title below is a working name. Stephen names things.

---

## ARCHITECTURE IN BRIEF

- One host screen (any browser: TV, laptop, tablet) shows the room code and shared game state. Phones join at a short URL with the 4-char code and a name. No app install, no account for guests.
- Room codes are 4 characters from an unambiguous alphabet, with a TTL so codes recycle.
- Firebase Realtime Database carries live game state (latency, cheap high-frequency writes, presence and onDisconnect primitives). Firestore holds durable data only: sunbeam ledger, profiles, daily results.
- The host is authoritative for game flow. RTDB is only the transport.
- Rejoin after a locked phone or a dead tab is mandatory. This happens every single session.
- Host drop is handled gracefully. A dropped host mid-round must not destroy the party.
- Everything routes through the server, so it works on hotel wifi with client isolation.
- Sunbeam minting is server-authoritative via Cloud Function. Clients never write balances. On game completion the server mints for EVERY participant. This is a social product and losers who get nothing do not come back.
- Guests use anonymous auth, upgradeable to a real account without losing progress.

---

## THE SHELL IS THE PRODUCT

We build the room shell exactly once: create and join, presence, rejoin tokens, the phase machine, host-authoritative timers, host-drop recovery, and the completion mint call. Every game after that is a module that plugs into the shell and never touches Firebase directly.

This is the whole economics of the program. Jackbox ships party packs because their shell amortizes across titles. Ours does the same. The first title pays for the rails, and every title after it is mostly content and two render layers (one for the host screen, one for the phone). PARTY_GAME_BRIEF.md is the build document for a single module against the finished shell.

Designer B's panel insight survives the kills and is worth restating here: our authored databases (haiku banks, the card engine, the trait system) can act as generators for party content. That insight is why Twin Lanterns, Moongraft, and every card-engine reuse below rank as high as they do. What could not survive was routing that insight through typed player text on the shared screen, which this studio cannot ship.

---

## THE CATALOGUE (judged, scored /50 on originality, party energy, content feasibility, build feasibility, cozy fit)

### 1. TWIN LANTERNS (44/50)
- **Hook:** Two lanterns, one path. You and a partner each see half the puzzle and neither of you can solve it alone.
- **Loop:** Asymmetric co-op. Each player sees half the information on their own phone and the pair must converge on one shared answer through constrained communication. A persistent streak belongs to the PAIR, not the player, which creates gentle social obligation that a personal streak never does.
- **Players:** 2. It is the only 2-player title in the program and that is the point.
- **Content:** Fully procedural, seeded by date, hand-authored difficulty curve. No content bank to write.
- **Jackbox distance:** No Jackbox analog exists at all. The rare concept that is both the safest build and the most original, and it deliberately battle-tests pairing, presence, and rejoin.

### 2. MOONGRAFT (42/50)
- **Hook:** The room grows one impossible plant together, blind, and everybody keeps the card.
- **Loop:** Blind exquisite corpse. Each player draws one layer of a shared plant on their phone (pot, stem, leaves, bloom, companion) without seeing the other layers. The reveal composites all layers on the host screen into one plant, the haiku engine writes its poem, and the card engine mints a one-of-one keepsake for everyone in the room. No voting, no scores, no losers. The artifact IS the retention hook.
- **Players:** 3 to 8.
- **Content:** Player drawing plus existing haiku and card engines. Drawing is player content, but family-couch scope with no permanence in front of strangers makes it acceptable. Small authored bank of layer briefs.
- **Jackbox distance:** Nearest is Drawful, but there is no guessing, no voting, and no winner. Collaborative artifact-making is a lane Jackbox does not occupy.

### 3. MOTHLIGHT (40/50)
- **Hook:** Everyone's answer is visible the moment it lands, and everyone can change their mind until the timer dies. The crowd is the puzzle.
- **Loop:** A true or false fact appears on the host screen. Each player's moth flies to a lantern the instant they answer, name attached, in front of the whole room, and they can flit to the other lantern any time before the lock. Being right pays. Being right when the visible crowd was wrong pays more. Watching your friends stampede after one confident wrong person is the show.
- **Players:** 3 to 8.
- **Content:** 600 auditable true or false facts, sourced, generated and audited through a documented pipeline. Tap-only and latency-proof.
- **Jackbox distance:** Lie Swatter is private simultaneous answers with a reveal. Public, changeable, crowd-visible answering is real structural distance, and it is the best mass-play spectacle on the panel.

### 4. FIREFLY FUTURES (38/50)
- **Hook:** Answer about yourself, then bet on the room.
- **Loop:** Players answer quick personal prompts, then a betting market opens on what the room's aggregate answers turned out to be. The data is generated by the actual people on the couch, which beats a static survey database every time it is played.
- **Players:** 3 to 8.
- **Content:** Tiny authored bank, about 300 prompts. FLAG, standing decision: the "spicy or slightly dangerous" prompt tier must be cut, or it ships toggled off and hard-audited. We are general audience and that is not negotiable.
- **Jackbox distance:** Guesspionage runs on a static pre-collected survey DB. Room-generated data plus a market is a different machine wearing a familiar coat.

### 5. SAME SOIL (36/50)
- **Hook:** How well do you actually know the person next to you?
- **Loop:** One player is the subject and self-reports a preference between two illustrated things. Everyone else predicts. The subject's own answer is the only authority, so nobody can be told they are wrong about who they are, which is what protects kids and keeps it gentle. Works at 2 players, which nothing else in the prediction genre does.
- **Players:** 2 to 8.
- **Content:** Trivial code. The real cost is roughly 720 small illustrations (360 pairs). The illustration pipeline starts in parallel from day one.
- **Jackbox distance:** Know-your-people prediction is a crowded genre and this is its gentlest member. The self-report authority twist and illustrated pairs instead of typed text are the differences.

### 6. FIRST FROST (35/50)
- **Hook:** The eliminated do not leave. They become the weather.
- **Loop:** Trivia elimination where knocked-out players join the Frost and receive a console of powers to bend the rules against the living: chill a category, fog an answer, force a gamble. Dead players as the rules engine is a genuine invention. The living fight the questions and the ghosts at once.
- **Players:** 4 to 8.
- **Content:** The biggest bank in the program, trivia plus the Frost power set.
- **Jackbox distance:** Highest knockoff-review risk of the keepers because it wears Trivia Murder Party's silhouette. Standing rule: it ships only if the Frost console is the headline and the trivia is the backdrop, never the reverse.

### 7. HOODWINK THE OWL (34/50)
- **Hook:** Fool the machine, not your friends.
- **Loop:** Players create against a prompt while an adversarial live classifier (the HUNCH model) tries to read them. You score by making the machine wrong while the humans get it right. An in-loop live classifier is genuinely novel.
- **Players:** 3 to 8.
- **Content:** Prompt tiers that must be calibrated against the real model, which is unpriced R&D. Typed human guesses are auto-matched by the game and NEVER displayed anywhere.
- **Jackbox distance:** Nothing in Jackbox has a live adversarial model in the loop. But this is prototype-gated, not greenlit: it stands entirely on HUNCH actually performing.

### 8. LIFTING FOG (31/50)
- **Hook:** Four clues, worth less each time the fog lifts. Buzz early and be brave, or wait and be sure.
- **Loop:** Progressive-clue quiz. Each question carries 4 ordered clues from cryptic to obvious, with point values dropping as clues reveal. Buzzing early is the thrill, misdirects in the early clues are the craft.
- **Players:** 3 to 8.
- **Content:** 400 questions times 4 ordered clues plus misdirect craft. The heaviest, least model-generatable bank submitted.
- **Jackbox distance:** Generic progressive-clue quiz with no single owner, so no C&D risk, and also no novelty. Kept only if the authoring pipeline proves itself on Mothlight first.

### Killed (recorded so nobody re-pitches them)
- **The Night Herbarium:** best-written pitch on the panel, dead on arrival. Player free text on the shared screen AND pressed permanently onto a minted card breaks the house no-free-text rule twice, the second time forever. The reverse-Turing idea deserves a tap-only rebirth someday. This build does not.
- **Burr in the Hem:** the entire game is player prose typeset large on the shared screen, and "camouflage a weird word" is a structural invitation to innuendo. Kill.
- **The Seventh Syllable:** charming and on-brand, and still a typed player line performed with ceremony on the big screen. House rule kill. The pick-a-line salvage is a different, weaker game. Do not confuse the two.
- **Mole in the Moonlight, Wisp Hollow, Designer A #5-7, Designer B #6-7:** not killed on merit. The submissions arrived truncated and cannot be scored. Resubmit if the designers want them judged.

### Adult-content flags
Firefly Futures spicy tier (keeper, conditional, see above). Burr in the Hem and Night Herbarium were killed partly because player text is uncontrollable regardless of prompt tone. Nothing in Designer C's visible slate carries any flag.

---

## BUILD STATUS (updated 2026-08-08)

| title | slug | state |
|---|---|---|
| Twin Lanterns | (satellite) | v0.1 live, dev gated, separate from the party shell |
| Mothlight | `mothlight` | BUILT, driven to podium. Fact bank 240 to **659**. |
| Firefly Futures | `firefly` | BUILT 2026-08-08, driven to podium. **284** prompts. Spicy tier CUT. |
| Lifting Fog | `liftingfog` | BUILT 2026-08-08, driven to podium. **76** four clue questions. |
| First Frost | `firstfrost` | BUILT 2026-08-08, driven to podium. **189** questions. Frost console, 3 powers. |
| Same Soil | | not started. Art bound, roughly 720 illustrations, so the art pipeline is the critical path and it should not start until that pipeline does. |
| Moongraft | | not started. Needs the phone drawing canvas. |
| Hoodwink the Owl | | not started, prototype gated on HUNCH. |

The shell now serves the whole catalogue rather than one title:
- `catalogue.js` is the single list. Adding a title is one entry plus a
  `games/<slug>/` folder.
- `host.html` opens on a TV picker. `?game=<slug>` still deep links for tests.
- The host announces its slug on join and on every phase, so `play.html` loads
  the right phone module. It used to hardcode Mothlight, which meant no second
  title could ever have worked on a phone.
- Per title minimum player counts come from the catalogue.
- `PartyShell.backToPicker()` carries the room code, so switching games between
  rounds does not make everybody retype anything.

⛔ **Fixed the same day, and it was load bearing:** the transport kept ONE
player identity per browser in localStorage. Practice mode is explicitly "every
player joins from a tab in this same browser", so three practice phones all
reported the same id and registered as a single player. The identity is now per
TAB (marker in sessionStorage so a reload still rejoins as the same person, id
in localStorage keyed by that marker).

`party/test/drive.js <slug> [players]` drives any module start to podium with
real phones in real tabs, taps at each control's centre with a real mouse,
reloads a phone mid game to prove rejoin, screenshots every phase, and fails on
any console error or any control under 48 rendered pixels.

⚖ STILL BLOCKED ON STEPHEN: cloud rooms. Everything above runs on the local
BroadcastChannel transport, which means one browser only. Real phones need the
five minute console switch on in PARTY_CLOUD_SETUP.md.

---

## BUILD ORDER (cheapest-proves-the-shell first)

1. **Twin Lanterns daily duo.** Procedural content, exactly 2 phones, and it proves join, rejoin, presence, and pairing before any party format exists. The spec's own ruling: build the co-op daily FIRST so the netcode is battle-tested before the big swing.
2. **Mothlight.** First mass tap-only title. Proves host-screen swarm rendering, 8-player scale, and the fact-bank authoring pipeline that later titles depend on.
3. **Firefly Futures.** Reuses Mothlight's tap shell nearly verbatim with a 300-prompt bank. The fastest possible second party SKU.
4. **Same Soil.** Trivial logic, art-bound. The illustration pipeline (roughly 720 images) starts in parallel from day one so art is never the critical path.
5. **Moongraft.** Adds the phone canvas and layer compositing on rails that are proven by then. The keepsake pipeline is mostly existing card and haiku code.
6. **First Frost.** Dual phone consoles (living and Frost) plus the biggest bank. Built once elimination UX and bank tooling exist.
7. **Lifting Fog.** Bank-gated. Go or no-go after auditing 40 staged questions from the pipeline.
8. **Hoodwink the Owl.** Classifier spike first. Killed silently if HUNCH accuracy tiers do not materialize.

---

## HOW DAILY DUO RELATES

The co-op daily puzzle from assets/03-multiplayer-games.md (Skin B) and Twin Lanterns are the same design. It ships FIRST and it ships as a standalone daily product: two players, asymmetric information, once a day, 3 to 6 minutes, async by default so both players never need to be online at once, per-pair streaks, a spoiler-free shareable glyph card, sunbeams on completion.

It is in this document because it is also the proving ground for every rail the party shell needs: anonymous auth, pairing, presence, rejoin, RTDB transport, and the server-side mint. Once the daily product is stable, a live party mode of Twin Lanterns (pairs racing in one room) becomes a cheap module on the shared shell. Standalone daily first, party mode later. Do not invert that order.

---

## EXPLICITLY NOT DECIDED

- **Names.** Whack Box and every game title in this document are working names. Stephen renames all of them.
- **The first party game pick.** The build order above is the engineering recommendation. The actual first-title call is the Director's, between the top 2 by score: Twin Lanterns and Moongraft. Nothing gets built as "first" until Stephen picks.
- Firefly Futures spicy tier fate (cut vs toggle-off) is a Director call before that title enters build.
- Sunbeam amounts per session for party titles. Server-side, priced by Stephen against the 30-per-day-per-game fleet policy when the first title reaches the mint step.
