# DUCTUS BUILD PLAN (8 Nov 2026, Fable)

**What it is.** Stephen's sprint of 8 Nov: draw three letters of an alphabet that does not exist and DUCTUS grows the rest
(A to Z, 0 to 9, punctuation) in the style of your hand, lets you write in it, ages it through centuries of cursive drift,
exports a real installable `.ttf`, and wraps it in three games (Decipher, a daily cryptogram shared by everyone; Pass and
play; Scribe). Single file, no network, no dependencies, 90 KB. His v3 drop (ductus-v3.zip + HANDOFF_2.md) is mirrored at
docs/briefs/ductus-HANDOFF-v3.md and inside the app folder.

**Where it lives.** The STUDIO, not the arcade: `apps/ductus/` in the SWS-apps repo (skywolfstudio.com, Firebase Hosting,
project sws-apps-9646d). Hub category Pen & Paper (new), tagged beta until his Pixel pass. Source split kept
(`src/engine.js` + `src/template.html`, `node apps/ductus/src/build.mjs` writes `index.html`). Tests `apps/ductus/test/`.

## STATE

| Step | State | Where | What |
|---|---|---|---|
| m1 | BUILT 8 Nov ~16:20 UTC | SWS-apps main 8785f7f | the studio shell (canonical, icons, manifest with a share target, worker on the Saccade pattern, the studio foot, build tag ductus-v1), house rules (no dashes, zoom allowed, 15 px copy, 44 px targets), art from its own engine (thumb 512, og card 1200x630, icons, icon.svg), hub.mjs palette + Pen & Paper category, engine test 20/20 and browser smoke 17/17 green |
| m1 line | WAITS | `! bash /home/codespace/ductus-drafts/deploy-ductus-m1.sh` | the first run stops and prints the one time Firebase sign in (`! npx --yes firebase-tools@14 login --no-localhost`), then run it again; it reads the live page back |
| m1 mirror | AFTER the line | lucid-winds | `node scripts/make-apps-page.mjs` (reads the live catalogue) and a line for portal/apps.html, so the arcade's apps page shows DUCTUS too |

## m2 candidates (his pick; the handoff's roadmap, reordered by payoff for a studio app)

1. **Share a hand by link** (S). The hand code in the URL fragment (`#hand=DUCTUS1|...`): a friend taps instead of pasting.
   Zero backend. The artifact viewer blocked fragments; the studio does not.
2. **Lineage** (M). Letters drift each time they are written; the writer picks which variant survives; a family tree of
   hand codes. The Age machinery is the mutation operator. Nobody else has a hand that lives.
3. **GM pack** (M). Three hands per campaign (common, priestly, thieves'), weathered paper export, a map label sheet.
   The tabletop table is the clearest paying audience.
4. **Classroom kit** (S). Print toggle for key on and key off worksheets, a spelling list in the class hand. The studio
   already has print rules.
5. **Scribe to words** (S). After 70 percent mastery, words, then timed sentences, a diploma card.
6. **Font polish** (M). Union the overlapping contours so font editors stop warning; kerning from glyph boxes; lowercase as
   0.72x variants.
7. **Daily leaderboard** (M). One Firebase collection of {date, score, hand}. Breaks the on device promise unless opt in;
   the hub's 'shared' apps already sign in, so it has a home, but it is a decision, not a default.
8. **Recognition** (L). The Chamfer scorer can read handwriting in your own script: write a note by hand, the app transcribes.

Recommendation for m2: 1 + 2 + 3. The link is an afternoon, Lineage is the thing no competitor has, the GM pack is the
first thing someone will pay for.

## Market and sell (plan, not done)

- **Free on the web** at skywolfstudio.com/ductus/, the studio promise (nothing leaves your device, no account, no ads, no
  subscription). The tip jar as the hub does it, if he wants it here.
- **Google Play at 0.99** as a Trusted Web Activity like Fretwork (`com.skywolfstudio.ductus`); the hub's Play tooling
  derives listings from studio skins, DUCTUS is its own look, so the package is hand built on the Fretwork path.
- **The hook is ten seconds of video**: three scribbles, the alphabet appears, a note in it, the font typing in Procreate.
  Shorts, Reels, TikTok. The Daily Decipher is the shareable loop (same puzzle for everyone, the brag card exists).
- **Communities**, each with its own self promotion rules read first (PUB-LISTINGS.md is the method): neography and
  conlang circles, tabletop game masters (handouts, map labels), teachers (cipher worksheets, the classroom kit), font
  and lettering people once the font polish lands.
- **Positioning**: the incumbents turn YOUR handwriting into a font and charge by the month; DUCTUS invents an alphabet
  that never existed from three marks, ages it, and plays with it. One line: "Draw three letters. Get a whole alphabet, a
  font and a cipher game." Tagline candidates: "Every hand grows its own alphabet." / "Three scribbles. A whole alphabet."
- **Astra art**: the thumb, card and icon are the engine's own render (placeholders in the app's look, the Saccade
  precedent). An Astra round when he wants it: the hub tile, a Play feature graphic, the og card.

## DECISIONS (his)

- The name (DUCTUS stays?), the category (Pen & Paper, new, or School), beta off after his Pixel pass.
- Free with the tip jar, or 0.99 on Play too; the GM pack as the first paid thing or everything free.
- The m2 pick from the list above (recommendation: link + Lineage + GM pack).
- Whether the daily leaderboard is wanted at all (it needs a sign in).
- Astra round for the art, now or after m2.
