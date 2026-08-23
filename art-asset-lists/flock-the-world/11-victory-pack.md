# FLOCK THE WORLD — Sheet 11: the Victory Pack (15 assets)

**Doc in 012Assets:** https://docs.google.com/document/d/1b_ZZGjcONwGHboNB0g7kEp0k5BXHSdz2EmQ8FNqczdo/edit

**For Stephen to hand to the artist.** House style is the Procurement Brochure:
night city under sodium light; the refusal ending stays the only daylight in the
game. All webp, existing conventions: backgrounds 820x461, tree icons 160x160,
ui icons 128x128, badges 160x160.

Why this sheet exists: the game now has FOUR endings (Total Coverage, The
Grateful World, Nothing Moves, Too Big To Ban), four skill tree capstones, and a
Paths to Victory panel. All ship today on placeholders (the three new endings
reuse the classic win backdrop; capstones render the emoji fallback; path rows
are colour coded but iconless). Every asset below is drop in: the filenames are
the wiring.

3. ASSET LIST · Procurement Brochure style, night city under sodium light, the refusal ending is the only daylight in the game
=====================================================================
All webp, matching existing conventions: bg 820x461, tree icons 160x160, ui icons 128x128, badges 160x160.

END SCREEN BACKDROPS (all three are wins, so all three are night; currently every win shares bg_end_win.webp, keyed at :2042)
1. art/bg/bg_end_glove.webp · 820x461 · Night boulevard, warm and immaculate, cafe crowds glowing under sodium light, every face turned pleasantly toward a small camera on a decorated pole, flower baskets hung on the mounting brackets, brochure gloss, no menace anywhere, which is the menace.
2. art/bg/bg_end_fist.webp · 820x461 · Empty night avenue in hard sodium light, armored vehicle parked at a checkpoint where a bus shelter used to be, every window dark, one traffic light cycling for nobody, long clean shadows, brochure composition.
3. art/bg/bg_end_econ.webp · 820x461 · Night skyline seen from a boardroom, one vendor logo repeated on every tower and substation and traffic gantry, sodium grid stretching to the horizon like circuitry, a signed contract in the window reflection, brochure sheen.

CAPSTONE NODE ICONS (tree convention, framed like the existing 160x160 node art; filenames MUST be the live node ids at :1093 to :1100, since NODE_ART requests art/tree/<node id>.webp, and none of the four capstones has art today)
4. art/tree/caps_dep.webp · 160x160 · The Lattice: a city grid whose camera poles grow new camera poles, lattice lines self extending past the frame edge, sodium rim light on black, engraved brochure emblem style.
5. art/tree/caps_cap.webp · 160x160 · Total Recall: an archive drawer shaped like an eye, pulled open and bottomless, files descending into the dark, sodium glow, engraved emblem style.
6. art/tree/caps_inf.webp · 160x160 · The Overton Dial: a broadcast dial with a hand resting on it, the needle sweeping every station at once, sodium on black, engraved emblem style.
7. art/tree/caps_war.webp · 160x160 · Clean Hands: a pair of immaculate white gloves folded over a receipt spike that holds no receipts, blood red rim light over sodium, engraved emblem style.

PATH ICONS (World tab strip rows + HUD nearest win line, ui convention, must read at 14px)
8. art/ui/path_classic.webp · 128x128 · Minimal glyph, globe with a single lens pupil, sodium on transparent, one weight, readable at 14px.
9. art/ui/path_glove.webp · 128x128 · Minimal glyph, open glove silhouette, green on transparent, one weight, readable at 14px.
10. art/ui/path_fist.webp · 128x128 · Minimal glyph, closed fist silhouette, red on transparent, one weight, readable at 14px.
11. art/ui/path_econ.webp · 128x128 · Minimal glyph, bar chart grown into city towers, teal on transparent, one weight, readable at 14px.

WIN SEALS (end screen kicker stamp beside the verdict, badge convention; the classic win can take one too for symmetry)
12. art/badge/seal_glove.webp · 160x160 · Circular corporate award seal, laurel of fiber optic cable around a glove, embossed gold on black, procurement award aesthetic.
13. art/badge/seal_fist.webp · 160x160 · Circular seal, laurel of razor wire around a gauntlet, embossed steel on black, procurement award aesthetic.
14. art/badge/seal_econ.webp · 160x160 · Circular seal, laurel of ticker tape around a vault door, embossed platinum on black, procurement award aesthetic.
15. art/badge/seal_coverage.webp · 160x160 · Circular seal, laurel of camera lenses around a wrapped globe, embossed sodium gold on black, procurement award aesthetic.

Wiring notes for the main session: finish() at :2000 keys the backdrop off why at :2042; the three new bg paths slot there. The seals slot beside #endKick and, like the end backgrounds, are referenced directly by why, so they need no manifest entry. The path icons enter UI_ART at :2904 and the capstone icons enter NODE_ART at :2934 (house rule in the comment block at :2895 to :2912: never probe for a file not in a manifest). No code assets are needed for the menu; it already meets the Plague Inc conventions (card art, three tiles, sticky CTA in landscape) and section 2 is polish only.


## Delivery
Drop the files into the named paths. The end backdrops and seals key off the
win reason in finish(); the capstone icons load by node id through NODE_ART;
the path icons enter UI_ART. Nothing else to wire.
