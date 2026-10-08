# HUES UI: the plan from Astra's review (Fable, 8 October 2026)

**Source, kept whole:** `docs/briefs/hues/reviews/HUES-UI-GPT-2026-10-08.md` (Astra, 33 directions D01 to D33, three cuts, three
references, zero art asked for). The brief it answered: `docs/briefs/ASTRA-HUES-UI-BRIEF.md`; the shots: `docs/briefs/hues/`.
**Status: PLAN. Nothing is built. Packet H1 needs no call from Stephen; H2 to H4 wait on the calls in section 4.**

## 1. Astra's corrections to the brief, checked against the code

| Astra said | The code says (`satellites/hues/index.html`) | Verdict |
|---|---|---|
| The 112 painted frames are already wired, not unused | `BORDERS` holds 113 image entries (112 under `borders/pack/`) plus 8 CSS frames; `renderShop` (line 1010) lists every one; play and share use `.bd-img` (line 180) | **Astra right, brief wrong.** The shop is a 60 row grid; the shots only showed its top. |
| The number top right in play is score, not coins | line 734: `scoreVal.textContent = G.score` | **Astra right, brief wrong.** |
| The three dots in Endless are lives, not a menu | `renderLives` (line 746) draws them, Endless only | **Astra right, brief wrong.** They do read as an ellipsis. |
| Three goals a day from a pool of seven | `MISSION_POOL` (667), `pickMissions` (677), seeded by the day | **Right.** |
| Grain, a red vignette and a brightness flash sit over the judged colors | `body::after` grain (49), `#vignette` (74, 329), `.frame.flash .swatch` animates `filter: brightness(1.4)` (156) | **Right, and it matters:** the target is brightened for half a second at round start while the clock runs. |
| A spacer after the controls makes the dead space | `.spacer{flex:1}` (184); pad is `clamp(88px,22vh,210px)` (185) | **Right.** |
| The review sheet waits 640 ms | line 804 `setTimeout(showBreakdown,640)` | **Right.** |
| The Daily coin line writes SVG markup as text | line 986 `resCoins.textContent = "+ 23 " + COIN_SVG + " (incl. ...)"` | **Right, A REAL BUG:** the first Daily clear of the day prints raw `<svg ...>` text where the coin icon should be. |
| Stage clear always says "+1 life" even when lives are full | line 799 caps at `CONFIG.lives`; line 817 prints `+1 life` unconditionally | **Right, a real fault.** |
| Versus has no hand off explanation | lines 992 to 995: a "Pass the phone" screen with "Player 1 done · hand to Player 2" and a "Player 2 start" button EXISTS at the end of Player 1's five rounds | **Half right.** The hand off screen is there; what is missing is telling the players the shape BEFORE round one. D28 shrinks to that. |
| Player copy has dashes | "Lock-in bonus" (812), "dead-on" (321), "pass & play" (302) | **Right.** House rule: no dashes; also write "and", not "&". |
| 40 px pulsing timer, clickable divs in the shop, inactive screens still focusable | not checked line by line | **Unverified.** Opus confirms in H1 before touching. |

Lesson for the next brief (written to memory): a claim about what is wired must come from the code, not the screenshot.

## 2. The sort: fault, taste, already known, disputed

**Faults (build without a call):** D01 unlock sheet on a fresh save · D02 arcade widgets over LOCK IT IN, NEXT ROUND and the goals card ·
D14 grain, vignette and the brightness flash over the two judged colors · D18 the verdict printed twice · D21 the pad peeking above the
review sheet · D24 the SVG as text bug and the "+1 life" lie (D29) · D29 lives drawn as an ellipsis · D32 dashes and the ampersand in
player copy · D27 the mission save read without validation (the audit flag) · D12's double lock check (verify, then fix if real).

**Taste with a fault underneath (needs ONE call, then build):** D08 to D13 and D16, the play screen geometry. The fault is real
(about 300 px of dead black above the button at 412 wide, the thumb's path crosses it, labels you cannot read). The call is where the
lock button lives (section 4, call 1).

**Taste (his calls):** D03 menu order and folding the difficulty into the Endless card · D04 the paired swatch motif replacing the seven
chips · D05 the rules rewritten around the two axes · D06 Daily status on the card · D07 the slim header · D15 frames outside the
comparison and a "simple frames during play" preference · D19 and D22 the result presentation · D20 the "biggest adjustment" hint ·
D23 a spoiler free share card by default · D25 and D26 the shop as a collection · D30 the color roles · D31 the type scale ·
D17 keyboard control (accessibility, low value on a phone: last) · D33 inert inactive screens.

**Already known before Astra:** D01, D02, D18, D21, the dead space, the faint labels, lives, "which way was I off".

**Disputed:** Astra's art decision (no pigment bench, no picker plate, keep the text wordmark, cut the brass default frame) contradicts
the 5 Sep art list in `satellites/hues/ART_ASSETS.md`. Astra's reasoning is sound (a neutral surround is what a color judgment needs) but
the art lane is Stephen's. Call 7.

## 3. The packets, in build order

Each packet is one Opus session on a quiet box. Every packet ends with pictures at the four fixtures (360x640, 360x740, 412x740,
412x915, fresh save) that the lead OPENS and reads before anything deploys. Laws in section 5, gates in section 6.

### H1. Faults (no call needed, start now). Directions D01, D02, D14, D18, D21, D24, D27, D29, D32, D12 check.
1. **D02 first:** one presentation state in Hues (`menu | rules | play | review | result | shop | share`). While `rules`, `play`,
   `review` or `share` is active, the shared music pill, the feedback ladybug and reward chrome are hidden. Feedback becomes a 48 px
   menu row. ⛔ `music-unlocks.js` is FLEET WIDE: if it has no visibility hook, add a narrow one that defaults to today's behavior for
   every other game, and boot one other game to prove nothing changed. No z-index wars.
2. **D01:** an unlock announcement fires only for an unlock EARNED in this session, after play, never on boot from stored entitlement.
   Music stays reachable from its menu row. Entitlement data untouched.
3. **D14:** scope the grain to decorative containers, drop `#vignette` from play, delete the `.flash` brightness animation. Judged
   fills are opaque sRGB with no filter, blend, opacity animation or overlay. Frame glow stops at the neutral mat (H2 adds the mat;
   here just stop the glow reaching the swatch).
4. **D18 + D21:** delete the verdict above the pad; `#breakdown` becomes an opaque surface covering pad, strip and button, one heading
   (Bullseye, Very close, Close, Keep tuning from `CONFIG.closeness`), the percentage as "45% color similarity" under it. Endless adds
   "Level survived" or "Life lost" from the real pass flag. Next round sits in the same bottom slot as LOCK IT IN.
5. **D24:** line 986 goes through `innerHTML` with the icon, or plain "23 coins". Capture the first Daily clear to prove it.
6. **D29:** "Lives 3 of 3" in words in the HUD status; "Life lost · 2 remaining" in the review; at a stage boundary the copy comes from
   the real before and after count ("Lives full" when capped). The dots may stay as decoration beside the words.
7. **D32:** player strings into one in-file copy object; "Locked before time ran out", "exact match", "pass and play", "70% of match
   points kept, no bonuses" on timeout. Never touch ids, keys, URLs or frame ids.
8. **D27:** validate `hm.missions` on read (date string, three known ids, numeric progress); a bad save falls back to today's fresh
   pick, never a broken menu.
9. **D12 check:** prove one lock per round under a rapid double tap and that a drag ending over the button does not submit. Fix if red.

### H2. The play screen (after call 1, and call 4 if the colors change). D08, D09, D10, D11, D12, D13, D16.
Astra's geometry table (review, "Play geometry to implement") is the starting spec: HUD 96 px, labeled wells 184x120 at 412 and
158x104 at 360 with a 6 px `#202024` mat, pad 5:3 (380x228 at 412, 328x197 at 360, floor 156 px), strip 48 px with a ringed 28 px
handle, LOCK IT IN 56 px directly under the strip with 12 px gaps, 30 px plus the safe inset below, extra height ABOVE the module.
Timer "7.7 s" at 24 px tabular mono in the HUD, a 4 px bar, no pulsing. Labels "Target" and "Your mix" at 13 px 600 `#b5b2aa`.
Gate: the strip to button gap is 12 px at all four fixtures, no scroll at normal text, every hit region ≥ 48 rendered px, and a
THUMB SHOT at 412 (draw the thumb; memory `feedback_thumb_units_and_thumb_shots`). Then the lead plays ten rounds on the Pixel.

### H3. Result and teaching (after H2). D19, D20, D22, D05, D06, D28.
D20 is the one new mechanic: after lock, try replacing the submitted H, S or V with the target's and rank by the existing ΔE; show
"Move up for more brightness", "Move the color strip toward violet" or "Several small adjustments remain" (only if ≥ 0.5 ΔE better;
hue advice suppressed below 0.05 saturation or value; hue direction from the strip's linear coordinate). D19 the points under the
verdict, details behind one 48 px disclosure. D22 the run ledger as a disclosure, newest first, 20 rows then "Load earlier rounds".
D05 the rules as three numbered gesture lines with a small axis diagram, scoring behind a row, the button named for the pending mode,
clock starts only when the game view is ready. D06 "5 rounds · Your first completed run counts" before, "Completed today · 2,140
points" after, Practice as a separate action. D28 a pre game card "Player 1 plays five rounds, then pass the phone" with "Player 1
ready"; keep the existing hand off screen; start Player 2's clock on "Player 2 ready".
Gates: synthetic fixtures for pure H, S, V errors, the hue seam, near black and near grey never recommend a change that raises ΔE;
5 round and 100 round ledgers keep the next action visible.

### H4. Menu, shop, system (after calls 2, 3, 5, 6, 7). D03, D04, D07, D23, D25, D26, D15, D30, D31, D33, D17 last.
The menu order and the folded difficulty (D03), the motif (D04), the slim header (D07), the spoiler free share with an "Include color
pairs" toggle (D23), shop previews on the neutral mat with real buttons and honest states (D25), the collection as Featured / All /
Owned with 12 cards a page (D26, L), frames outside the mat plus the "simple frames during play" preference (D15, L), the color roles
and type scale (D30, D31) applied once everything else has settled, inert inactive screens (D33), keyboard (D17) last if ever.

## 4. His calls (nothing in H2 to H4 starts before these)

1. **Where does LOCK IT IN live?** Astra: directly under the hue strip, the spare height goes above the module. Today: pinned to the
   bottom with the gap in between. My read: Astra, because the thumb's path becomes one short line.
2. **Share card spoiler free by default?** Today it posts all five target colors, which spoils the day's puzzle for anyone who sees
   it first. Astra: tiles and tier words by default, pairs behind a toggle. My read: yes.
3. **The seven chips become a paired swatch motif** (Target and Your mix, a fixed demo pair, an optional 600 ms demo on tap)? My read:
   yes, static by default.
4. **Hues' palette stays its own** (near black, chalk, one coral warning, one brass metal, hex in D30), not sage and gold? My read:
   yes; it is the one game whose content is color and the chrome must stay quiet.
5. **Frames outside the comparison + a "simple frames during play" preference** (D15)? Changes how owned frames look in play.
6. **The shop as a collection** (Featured, All with search, Owned, 12 a page)? Replaces the 60 row grid.
7. **The art list.** Astra: no new raster art this pass; defer the pigment bench, cut the picker plate, keep the text wordmark, drop
   the brass default frame. This contradicts the 5 Sep list. Your lane.
8. **Fold the Endless difficulty into the Endless card** (two taps to start Endless, Daily never shows the control)?

## 5. Laws for the builder (each one has cost a day before)
- One `index.html`, vanilla JavaScript, no framework, no build step. Offline must keep working (the worker caches the page).
- `CONFIG` is not touched: no retuning, no new prices, nothing sold. `dailySeed` is not touched: the Daily puzzle number and its five
  colors are shared with Listdle and with everyone who played today.
- Frame ids in `BORDERS` and the `hm.*` save keys never change; a save from before the build loads after it (write the fixture).
- `music-unlocks.js` and the feedback widget are shared by the fleet: a change there defaults to today's behavior everywhere else.
- Every target ≥ 48 px as RENDERED at 360 and 412; measure hit regions, not CSS.
- No dashes and no ampersand in anything a player reads. Numbers to the player in words where a sign would be ("70% kept").
- Shots at the four fixtures on a FRESH save and on a RETURNING save after every packet; the lead opens them and names three faults
  before deploy. A green gate is not a look.
- Commit fenced paths, never `-A`. The lead deploys; Opus does not push main.

## 6. Gates to write in `satellites/hues/dev/` (watched RED on a plant before they count)
- `shots.mjs <w> <h>`: menu fresh, rules, daily play, review, endless level 1 with a life lost, versus pre game and hand off, shop,
  share preview, Daily first clear result. Puppeteer from the repo's `node_modules`, the harness pattern in `satellites/tumble/tools/`.
- `gate-overlap.mjs`: in every state, the rects of the music pill, the ladybug and any reward sheet intersect none of pad, strip,
  primary button, or modal content, at 360 and 412. Plant: force the pill visible in play, must go red.
- `gate-fidelity.mjs`: sample the center pixel of both swatches for a fixed pair before the warning, during it, and after lock; equal
  within tolerance; also with each CSS frame equipped. Plant: re-enable the flash, must go red.
- `gate-copy.mjs`: walk the DOM text of every state plus share text and canvas strings; no hyphen, en dash, em dash, minus or `&`
  in player copy. Plant: put "Lock-in" back, must go red.
- `gate-touch.mjs`: every interactive element's rendered box ≥ 48x48 at 360x640. Plant: shrink one, must go red.
- `gate-save.mjs`: a v-before save and a corrupt `hm.missions` both load to a playable menu with progress kept where valid.

## 7. Start prompt for Opus (Stephen pastes after `/model`)
```
Read /workspaces/lucid-winds/plans/hues/HUES-UI-PLAN-OCT08.md top to bottom, then docs/briefs/hues/reviews/HUES-UI-GPT-2026-10-08.md.
Build PACKET H1 only, in the order written, in satellites/hues/index.html, obeying section 5. Write the gates in section 6 first and
watch each one fail on its plant before you fix anything. End with shots at 360x640, 360x740, 412x740 and 412x915 on a fresh save and
a returning save, saved under /tmp/hues-h1/, and a list of three faults you see in each. Do not push main. Do not start H2.
```
