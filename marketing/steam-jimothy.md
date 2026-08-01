# Jumping Jimothy — Steam store kit

⛔⛔ **THIS FILE IS NO LONGER THE STORE COPY.**
The paste ready, field by field fill lives in
**`store/jimothy-steam/STORE_PAGE_FILL.md`** (written 2026-08-01) and that is the
only place to edit it. Two copies of store copy is how a page ships with a
sentence nobody meant to send.

This file survives as the short marketing summary and because
`capsules/preflight.js` reads it.

---

## What changed on 2026-08-01, and why

The old draft here had four things wrong with it that a review round or a refund
would have found. All four are fixed in `STORE_PAGE_FILL.md`; recorded here so
nobody reintroduces them.

1. **"Hop lane by lane through a hand built city."** The art is generated, so
   "hand built" is exactly the claim this audience punishes hardest. And the
   levels are not hand authored either: they are deterministically generated from
   a per level seed. Two false claims in seven words. The honest replacement is
   better copy anyway: *every Adventure level is a fixed course, so a level you
   keep failing is a level you can learn.*
2. **"rooftops"** appeared in the short description. There is no rooftop content
   in the game. The six backdrops are the Waterfront, Pike Market, Fremont,
   Capitol Hill, Interbay and Ballard Locks.
3. **"45 costumes to pull from the Prize Bin."** 45 is the whole cast. Only 12
   are in the bin. 14 are the costume pack, 5 are earned weekly, 6 are secrets,
   the rest are code unlocks.
4. **"(course v2; adjust count if shipped different)"** was a note to ourselves
   sitting inside copy marked paste ready. Verified against `DECADES` and
   `DEC_LEN`: ten chapters of ten levels.

---

## The one paragraph version

Jumping Jimothy is a rainy city hopper about a very round Seattle raccoon.
100 fixed levels across ten chapters, five ways to play (Adventure, Daily,
Endless, Rush, Zen), 45 critters and costumes to unlock, nine power ups, eight
hidden Seattle landmarks, 26 badges and seven original songs. The Steam build has
no account, no internet and nothing else to buy: the costume pack that is sold
elsewhere is granted at install.

- **App:** 5043360 · **depot:** 5043361
- **Price:** $2.99 USD, ratified by Stephen 2026-07-31, with a 10 percent seven
  day launch discount
  (⛔ a launch discount must be configured BEFORE release; it cannot be added later)
- **Target release:** Tue Sep 1 2026. The binding deadline is the store page
  submission, not the fee clock. See PART 0 of `STORE_PAGE_FILL.md`.
- **Content survey answers:** `store/jimothy-steam/CONTENT_RATING.md`
- **Submission mechanics and build:** `store/jimothy-steam/STEAM_SUBMIT.md`
- **Assets:** `store/jimothy-steam/capsules/out/` (⛔ upload the 462x174 / 920x430
  / 1232x706 / 748x896 files, not the legacy half size ones)

## AI disclosure (required Valve form, honest text)

The artwork in this game was pre generated with AI tools, then cut, curated,
corrected and animated by the developer before it shipped. The game does not
generate any content with AI while you play.

⛔ Never describe this art as painted or drawn by a person anywhere on the store
page. It is generated and then curated, which the disclosure above states
honestly; claiming otherwise is the one lie this audience punishes hardest.

## Do not ship

- Third party trademarks. The web page's `<meta keywords>` still carries two of
  them for search engines; `vendor.sh` strips them from the Steam build and
  `preflight.js` warns every run. They must never appear in a Steam tag, title or
  description.
- Stripe, crypto or donate surfaces. `STORE_BUILD` darkens all of them and grants
  the pack instead.
- A platform you have not built and tested. Windows only.
