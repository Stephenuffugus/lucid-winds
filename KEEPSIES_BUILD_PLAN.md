# KEEPSIES BUILD PLAN (4 Nov 2026) — Fable with Stephen, from Astra's pack v1: the lot and the people, then the obstacles

Keepsies lives at `satellites/keepsies/` (DESIGN.md in docs/ is Stephen's ruled design, 48 KB; HANDOFF.md the in
folder state; `/HANDOFF-KEEPSIES.md` the long build plan). Three.js and Rapier, ES modules, no build step, dev gated
at lucidwinds.com/satellites/keepsies/. K1 (Ringer end to end on a phone, the Knuckle) and K2 (catalog, collection,
economy, pouches, the keepsies loop, ceremonies as screens) are built; K3 (Arena, ladder, bosses) is designed and
blocked on a Director call. The code has not moved since 5 Sep (branch tree 9ed84fc6; main's tree 142f4a46).
Stephen, 4 Nov: "keepsies is a pretty big build i also articulated that i want a ton of assets. i have a cool idea
too that some levels could have obstacles and players could even take turns or each place their obstacles on the
field and maybe even move them. this would turn it into a completely unique game and it will be very important that
the controls are impeccable."
Astra's pack v1 (36 MB, 286 files): `/workspaces/keepsies-astra-v1/pack/` (NOT in git; vault release
`keepsies-astra-pack-v1-20261104`, sha256 cfbfcb4f...). Its docs are copied to `docs/briefs/keepsies/astra-v1/`
(ASSESSMENT, STYLE-GUIDE, NOTES, README, GAMEPLAY_RECOMMENDATIONS, anchors.json, manifest.json, the catalog, the
Meshy handoff). Read ASSESSMENT.md and STYLE-GUIDE.md once, NOTES.md's "Practical composition", and anchors.json
before placing any plate: every window, mouth, slot centre and band is in there. What came: identity (wordmarks
Keepsies and Pocket Legends, icons, store art), the ring (dirt albedo, chalk ring, cross, lag line, ground shadow,
a dusk lot panorama), the people (five bosses in two states at 320, 160 and 96, Dusty's tin scene, the heirloom
cloth, twenty rung opponents on one atlas), four grail references for Meshy, the economy's objects (three pouches
closed and open, the clay bowl, chores board, level up, pot cloth, showcase shelves of 6 and 12, the envelope), 49
icons, the HUD (reticle settling and settled, aim line, snap trail, minimap frame, chips, pips, house rule chips,
voice bubble, technique toast, result card, five tier frames with marks, calibration dots), arena boards and damage
decals, the marble and match share cards, six store frames, AND an expansion bank: 240 original marble designs in 24
families (226 procedural recipes, 14 sculpt references). The bank is a later milestone (DECISIONS), not this build.

## STATE (the builder updates this block; one line per step)

| Step | State | Commit | Note |
|---|---|---|---|
| 0 | DONE |  | docs read (HANDOFF, ASSESSMENT, STYLE-GUIDE, NOTES' Practical composition, anchors.json); server on 8777; /home/codespace/kp-drafts made; fast check green (18 s; ai_budget and ringer_ai skipped by design); before set = docs/shots as committed plus /home/codespace/astra-drafts/keepsies-contact.jpg; main's keepsies tree 142f4a46c2d9b090bf703e7e2a45217015636e2c, the branch's 9ed84fc637e736f30eda5aed4ceab2a185ecf8d8 (they differ only in docs/DECISIONS.md, which never ships) |
| 1 | DONE | a453be621 | THE UNDEFINED was the lay chip reading a rule with no value: every chip value has its word (Seven, Ten, Thirteen foot; The cross, The X, The ring, The bunch) and the lay starts at cross (the rules' own default); the camera keeps the eye and the near plane's lower edge 4 mm over the dirt at any distance and look point (every frame, so after a zoom, a view change and a result), and a tester's under camera dies with its screen (the set's k1-under now asks for 25 degrees under and is held at the floor); no field line reaches the voice once a match is over, an empty voice hides its plate; the filter strip centres the lit filter after a tap. Fast check green. Shot k1-setup: TEN FOOT and THE CROSS; wrong: the stake strip opens mid tile at the left edge, Against theirs sits hard left under a centred column, no portrait beside Against (step 4). Box: /workspaces/lucid-winds/node_modules was missing, now a gitignored symlink to /workspaces/sws-tools/node_modules so the browser tools resolve puppeteer |
| 2 | DONE | c15649e3c | tools/astra_in.mjs (re-runnable) puts 72 files in assets/ (env 692 KB: dirt, chalk ring, cross, lag line, ground shadow, panorama; ui 940 KB: the ten boss states at 160 and 96, tin scene, heirloom cloth, the rung sheet, six pouches at 320, the economy plates and the HUD as Astra's SVG; sharing: the two cards; store: the six frames, never loaded and kept out of the deploy, law 7), the ONE sprite assets/ui/icons.svg (49 icons i-<name> in their own viewBox, currentColor, plus i-wordmark_keepsies and i-wordmark_pocket_legends with the plate dropped), fetched once at boot (render/art.js loadIcons, ic(name)); Astra's three icons over icon-192, icon-512, icon-maskable-512 (manifest names kept); the arcade thumb from keepsies.jpg; no og:image in index.html, so no social card; every art URL through art() and its one ART_V token, which the stamp bumps. Fast check green (the stamp gate included). No shot (plan) |
| 3 | DONE | 004c116e2 | Astra's dirt on every tier (60 cm tile, toned, roughness constant, no normal map); her chalk ring, cross marker (cross and X lays) and lag line as decals lit by the lamp (a basic chalk glowed in shadow), toned to cream; the chalk now follows the match's ring size (the drawn ring was always ten foot, so the seven foot onboarding games were played in a circle not theirs); the one light: a warm lamp at the north west 35 degrees up, the only shadow caster, fixed in the world (the player's first view looks to -z, so the lamp is upper left there and the contact shadows lean away from it); her panorama as the far sky (equirect, horizon at her fence's foot, lamp at the key's bearing); and because the brace camera's frame tops out 16 degrees under the horizon, a skyline band behind the names, turned by the camera's bearing, ending just above the far arc, cut round the spyglass, gone in the lean, top down and on the low tier. ?quality= lets the shot tools draw the phone's tier (KP_QUALITY; this 2 core box detects low). Fast check green; contact sheet opened (65 distinct, the inspect lights untouched). Shot k1-brace at high: the lamp and skyline over the far arc, the near arc, the shooter in its reticle, the scope clear; wrong: the skyline strip is thin (about 45 px), the near arc is a broad cloudy smear beside the crisp far one, the fogged far dirt darkens just under the band |
| 4 | DONE | dab414a75 | TAKE SOME is Dusty's scene: the tin plate (rows 60 to 540) with the three live renders rolling in inside the mouth ellipse (anchors.json), the same canvases then lying on Astra's cloth at her three resting places (a quarter apart, her 62 px radius, her ground shadow under each), reduced motion straight to the cloth; 'Your first rare is kept safe in the case.' under the heading; Dusty's ring face as a medallion beside Against (it adds no height: the render gate clicks Play at 375 by 667), the kept it face on his ransom card, the 96 px face as the HUD's name chip; render/portraits.js keys the five bosses by the design's ids and Astra's twenty rung opponents (her four rungs plus the boss, DECISIONS 6), drawn nowhere yet; every plate's URL made in one place from data-art. Fast check green. Shot k2-tin: Dusty and the empty tin above, the three on the cloth below, Pick one first in view; wrong: the renders are small at her radius, the three places leave the cloth's sides bare, the ground shadow is lost on the dark cloth |
| 5 | DONE | 603a46174 | Astra's plates as style sheet variables made once through art(): the reticle in her two states (settling, then settled with its tick; the box sized so her ring stands where the drawn one did), the player chips in her chip frame with her pips (her chip's baked dots kept out of the nine slices) and Dusty's 96 px face, the house rule plates on and off with their icons, the voice bubble, the technique toast, the result card and the scope frame as nine slices, the calibration's four dot states; every collection card wears its tier's frame and mark with the word under the name (never colour alone), the render set inside the frame; the inspect header shows the mark and the word in the tier's colour; icons beside the words on Play, Your marbles, the arcade exit, Back, Home, Rematch, Resume, Pause, Top down and Side on, The snap, Zoom (a label and its icon never take the touch, the render gate asks elementFromPoint). Not done: the aim line keeps its drawn gradient (her arrow is a fixed 400 px drawing that cannot follow a variable aim without editing her file), the snap trail has no moment in the game yet, and the game has no Settings, Sound or Haptics controls to put icons on. Found and fixed: every tool's local server served svg as an unknown type, so no svg plate ever drew in a shot or gate (svg, webp and jpg added). Fast check green. Shot k2-collection: the frames with marks (diamond, leaves, circle) and words, Back with its arrow, the filter strip; wrong: the renders are smaller inside the frames, the names still cover the spheres' lower third, Uncommon is cut at the strip's edge (it scrolls) |
| 6 | DONE | cfd7410a1 | pouches are Astra's closed plates with price, odds and the pity owed printed before a buy; a buy writes the price, pity, the drawn marble (or its dust) and its first provenance event in ONE save transaction before anything shows, then the open pouch with the live render clipped inside its mouth (anchors.json), at once, nothing moving; the case (DESIGN 17): Astra's six well shelf in the collection with the live render at each well, and the tin's heirloom (every player's first rare) goes in it, so the tin's line is now true, and a showcased marble is never offered or escrowed as a stake; the pot cloth under the ante, the level up plate on the result line, the envelope on every buy back offer; the save is v2 (bumped first): provenance, append only by event id { eid, uid, kind owned won lost reclaimed showcased, at, opp, match, why }, the v1 migration gives each held marble ONE owned event and invents nothing; won and lost are written only after the pot's result transaction, reclaimed by the buy back; inspect shows the latest line (Won off Dusty Coyle, Returned) and the list under it; the save gate gained four checks. Not done: no screen names the clay pool or lists chores yet, so the clay bowl and the chores board wait for those screens. Fast check and the save gate green. Shots k2-pouches and k2-pouch-open (new, shot last in the set): the three pouches with their terms, the reveal with Cat's Eye Beet in the standard pouch's mouth; wrong: the cards were a narrow column (a width cap lifted after the shot), the drawn marble is small in the mouth, the reveal's line repeats the name |
| 7 | TODO | | |
| 8 | TODO | | |
| 9 | TODO | | |
| 10 | TODO | | |
| 11 | TODO | | |

## THE LAWS (Stephen's standing orders; they override anything in Astra's docs)

1. Code directly in the one session. No Workflow, no lanes, no subagents, no review agents, no mutant runs.
2. THE TESTING LAW. Per step: `node satellites/keepsies/tools/check.js --fast` (minutes; it skips the sample sensitive
   gates and says so). The full `node satellites/keepsies/tools/check.js` ONCE at the end of m1 (step 8) and once at
   the end of m2 (step 11), detached (`setsid nohup`, it takes about four minutes and must not share the box with a
   browser). A visual step: ONE shot of THAT screen (`node tools/shots.mjs` from the game folder writes the whole set
   to docs/shots; commit only the changed ones; or `node tools/frontdoor.mjs <outdir> first` for a played screen),
   then OPEN it and write three things wrong in one line. After ANY change near the marbles' material or light:
   `node tools/contact_sheet.mjs` and OPEN it (the law in HANDOFF.md: it found thirty two plain spheres once). One
   browser at a time. Never re-run a green to confirm it.
3. Never push main. Never run a deploy. Commit and push `add-sproing-jumper` after EVERY step; the box can stop.
   The deploy is one script at the end (step 8) for Stephen's `!` line.
4. Nothing in `src/core/` calls a transcendental (use core/dmath.js); nothing in the sim reads art, the camera or the
   clock; the harness scenarios and replay hashes stay byte identical in m1. The marbles are never painted: the 65
   stay shader recipes, the four grails are Meshy sculpts in Stephen's own lane (paid; the plan never runs a Meshy
   job), The First Marble is the nested sphere recipe.
5. Never change a saved shape without a version: `meta/save.js` gains keys only (the provenance events, the cosmetic
   seed), every existing UID, id, unlock and threshold survives, the record `v` bumps before any schema change.
   `node tools/stamp.mjs --bump 2026110Xa` before a deploy (every `?v=` and version.json; a module imported under
   two queries is two modules).
6. The copy law: spare and wry, one line of lore each, no exclamation marks, no dashes of any kind in anything a
   player reads; 48 px targets with labels; tier, stake eligibility and damage never by colour alone (Astra's tier
   frames carry a mark and a word).
7. Art loads from `satellites/keepsies/assets/` (env/, ui/, models/) or as one inline sprite for the icons; nothing
   over 1600 px a side except assets/store/; textures 1024 at most; the first visit loads the ring, the icons and
   Dusty only (Astra's budget: under 1.5 MB on first visit, 8 MB is the whole game); store art, the 1024 Meshy
   references, contact sheets and docs never ship. Masters stay in `/workspaces/keepsies-astra-v1`.
8. Notes: one line per step in STATE and one line in START-HERE.md; HANDOFF.md's "Where we are" paragraph updated
   at the end of each milestone. No essays, no QUESTIONS file.
9. Scope is this plan. m1 is steps 1 to 8. m2 (the statues, steps 9 to 11) starts only if the box has three hours
   left after the three games' first milestones, else it is the next night's order. Nothing from the expansion bank,
   nothing from the Arena, nothing from the DECISIONS list.
10. The box has a hard 12 hour life from boot: read it, `date -u -d @$(awk '/btime/{print $2}' /proc/stat)`, add
    12 h, and stop 40 minutes before with START-HERE written, whatever step you are on.

## MILESTONE m1: THE LOT AND THE PEOPLE (steps 0 to 8)

**Step 0. Prep (15 min).** Read the docs named above. `pgrep -f "http.server 8777" || (cd /workspaces/lucid-winds &&
python3 -m http.server 8777 >/dev/null 2>&1 &)`. `mkdir -p /home/codespace/kp-drafts`. Run the fast check (green
today). The before set is `satellites/keepsies/docs/shots/` as committed (plus the 4 Nov contact sheet
`/home/codespace/astra-drafts/keepsies-contact.jpg`). Note in STATE main's keepsies tree hash
(`git rev-parse origin/main:satellites/keepsies`, 142f4a46 at writing) and the branch's.

**Step 1. The defects first (S; Astra's order 1).** The match setup's ring size chip prints "THE UNDEFINED" (the
label map in src/main.js near lines 804 to 823, "tap to change"): map every ring size and house rule to its word.
The camera goes under the floor (k1-under, src/render/scene.js, minElevationDeg near line 199): clamp the orbit so
the ground plane is never seen from below, in every state, including after a zoom and a result transition. The
result card can show a stale fumble line from the field (k1-ceremony): clear the voice on the transition. The
collection's filter row runs past the screen edge (k2-collection): it scrolls, with the active tab in view. Gate:
fast check; ONE shot: `k1-setup` from the shots set; look.

**Step 2. The assets in and the identity (S).** Make `satellites/keepsies/assets/`: `env/` (dirt_albedo.webp,
chalk_ring.png, cross_marker.png, lag_line.png, ground_shadow.png, lot_panorama.webp), `ui/` (the ten boss states as
160 and 96 webp, dusty_tin_scene, heirloom_cloth, the rung opponents atlas, the six pouch states at 320 webp,
clay_bowl, chores_board, level_up, pot_cloth, the two showcase plates, the envelope, minimap_frame, house_rule chips,
pips, player_chip, result_card, the tier frames, voice_bubble, technique_toast, calibration dots, aim_line,
snap_trail, the reticles as SVG), `sharing/` (marble_card.png, match_card.png), `store/` (the six frames; exempt from
the size rule, not loaded). The 49 icons become ONE sprite file `assets/ui/icons.svg` (symbols `i-<name>`, each file's
own viewBox, currentColor) fetched once at boot and injected, with a helper `ic(name)`; the two wordmarks as symbols
in it. Identity: icon_192, icon_512, icon_maskable_512 over the three icons beside index.html (manifest.json keeps
its names; `?v=` bumps with the stamp); the arcade thumb `portal-assets/thumbs/keepsies.jpg` from Astra's
keepsies.jpg (480x480); if index.html carries an og:image, the social card. The first frame, feature graphic and
promo master are store kit: leave them in the pack. Every path in code through one `ART_V` query. Gate: fast check
(the check's asset rule is the stamp gate: every new URL carries `?v=`), no shot.

**Step 3. The lot (M; Astra's order 2, the thing that makes screenshots).** The ground plane gets the dirt albedo
tiled (roughness a constant, no normal map), the one light from the style guide (a warm lamp at the ring's north
west, 35 degrees up, projected upper left in the default view; the only shadow caster; the environment and the key
rotate together and never with the camera), the chalk ring decal projected flat where the thin arc was, the cross
marker and the lag line as decals, the ground shadow sprite under every marble that has no contact shadow, and the
lot panorama as a far skydome (an equirect, 1600x800) so a horizon with its lamp is in the top of the frame at the
default elevation. The marbles stay the brightest thing (tone the plate down before touching the marble material).
Quality tiers: the panorama and decals drop first on the low tier. Gate: fast check; `node tools/contact_sheet.mjs`
and look (the light changed); ONE shot: `k1-brace`; look for the horizon, the chalk and the shooter in one frame.

**Step 4. The people and the tin (M; Astra's order 4).** The TAKE SOME screen becomes Dusty's scene: the tin plate
(900x600) with the three live heirloom renders clipped inside the mouth ellipse from anchors.json while they roll in,
then the cloth plate with the three resting places and the live renders on them, the line "Your first rare is kept
safe in the case" under the heading (true today: the first rare auto showcases). Match setup shows the opponent's
portrait (ring state) beside "Against"; the kept it state on DUSTY COYLE KEPT IT; the 96 px state wherever a name
is a chip. The other four bosses and the twenty rung opponents are registered in a portrait map keyed by the design's
ids and drawn nowhere yet (the ladder is K3). Gate: fast check; ONE shot: `k2-tin`; look.

**Step 5. The HUD and the tiers (S/M).** The reticle's two states as Astra's SVG (settling, settled), the aim line and
the snap trail, the minimap frame, the player chips with their pips, the house rule chips on and off, the voice
bubble plate, the technique toast plate, the result card frame, the calibration's dots in four states, and the five
tier frames with their marks on every collection card and inspect header (tier by frame, mark and word). Icons on
buttons through `ic()` beside their text (48 px, labels stay): Play, Your marbles, Back, Home, Rematch, Pause, Top
down, Side on, The snap, Zoom, the house rules, Settings, Sound, Haptics. Gate: fast check; ONE shot:
`k2-collection`; look.

**Step 6. The economy's objects, the ceremonies, provenance (M; Astra's orders 5 and 8).** Pouches as objects: each
tier's closed plate on the pouch screen with its price, its odds and the pity progress printed before a buy; the buy
writes wallet, pity and the drawn marble in one save transaction before any animation; then the open plate with the
live render clipped to the mouth, an instant reveal, reduced motion honoured. The clay bowl where the clay pool is
named; the pot cloth under the stakes in the ante ceremony; the level up plate; the chores board where chores are
listed; the showcase as the shelf plate (6 or 12 slots) with the live renders at the slot centres; the envelope for
a ransom offer. Provenance: each owned marble carries an append only event list in the save (event id, UID, kind:
owned, won, lost, reclaimed, showcased; timestamp; opponent id; match id; reason), written only after the match
result transaction; inspect shows the latest event as a line ("Won off Dusty Coyle") and the list below it; a
reclaimed marble shows Returned. Gate: fast check and the save gate; ONE shot: `k2-pouches`; look.

**Step 7. The share card (S/M; Astra's ship first number 3).** On inspect, Share: a 1080x1080 canvas from
marble_card.png (window 90,90,900,630; bands from anchors.json) with the live inspect render, name, lore, tier mark and
word, and the provenance line, handed to `navigator.share` with a file after the tap, else downloaded; no profile ids.
The match card 1080x1920 from the result screen (two windows, the pot band). Gate: fast check; ONE shot: the composed
card PNG itself, opened; look.

**Step 8. The walk, the stamp, the deploy script, STOP (m1).** The full check once, detached. `node tools/shots.mjs`
and `node tools/frontdoor.mjs /home/codespace/kp-drafts/front first` (real pointer events through the four minutes);
open every image; one line per screen under STATE. `node tools/stamp.mjs --bump 20261105a`. Commit and push. Write
`/home/codespace/kp-drafts/deploy-keepsies-m1.sh` from the template `/home/codespace/studio-drafts/deploy-studio-m1.sh`:
it builds a commit on top of origin/main from git objects carrying ONLY the served set of `satellites/keepsies/`
(everything under it except docs/, sim/, test/, tools/) and `portal-assets/thumbs/keepsies.jpg`; it base checks
main's `satellites/keepsies` tree hash against step 0's and STOPS if it moved; `DRY=1` stops before the push. Run it
with `DRY=1` once. Put the line in START-HERE for Stephen: `! bash /home/codespace/kp-drafts/deploy-keepsies-m1.sh`.

## MILESTONE m2: THE STATUES, STEPHEN'S IDEA (steps 9 to 11; only with three hours left, else the next order)

**Step 9. The statues and the placement input (M).** Stephen: "a small statue that may have different shapes." A
Ringer house rule, STATUES, off by default, beside KEEPS, SLIPS, BOMBING and POISON. Four statue shapes, each a small
stone figure about 60 mm tall (three marbles high, small against a ten foot ring) as a static Rapier collider built
by code in the lot's palette (no art yet; the real figures are a Meshy lane, DECISIONS 1 and 2): the Column (tall and
narrow, a glancing hit deflects), the Loaf (wide and low, it blocks), the Arch (a marble can be shot under it), the
Orb on a plinth (round, a hit scatters). Each has one readable silhouette from the playing view and a chalk footprint
on the dirt. Before the lag, a placement phase: the players alternate placing two statues each (the AI places by a
seeded rule), anywhere on the dirt inside the ring but never within one foot of the cross or of the ring's edge. The input is the
whole point: a finger drags the statue from a tray at the bottom (48 px tiles, one per shape), the statue follows the
finger on the dirt with a chalk shadow showing the legal footprint (red word "Not here" when illegal, never colour alone),
snaps to a half foot grid, and lands where the finger lifts; a Confirm button and an Undo (both 48 px) sit in the
tray; nothing is placed by a tap alone. Deterministic: the statue list (shape, position, owner) is part of the match
setup record and the harness replays it. Gate: fast check with a new harness scenario `ringer_statues` (a match with
four statues completes, the shooter never passes through the Loaf, a marble passes under the Arch); ONE shot: the
placement phase; look.

**Step 10. Moving a statue (S/M).** During the match, a player may spend their turn moving ONE of their own statues
up to two feet (the same drag, the same legality, Confirm or Undo) instead of shooting; the AI does it when a statue
blocks its best shot. A moved statue may not touch a marble. Gate: fast check and the scenario
extended; ONE shot: a move in progress; look.

**Step 11. The feel gate, the stamp, STOP (m2).** `node tools/frontdoor.mjs /home/codespace/kp-drafts/front-obstacles
more` extended with a placement and a move by real pointer events (drag, lift, confirm) asserting the statue landed
where the finger lifted and the snap still works after; open its shots. The full check once, detached. Stamp
`20261105b`. Commit and push. A second deploy script `deploy-keepsies-m2.sh` on the same template (it carries m1 and
m2). START-HERE gets both lines in order; Stephen runs the latest. Then stop.

## DECISIONS for Stephen (not built overnight; Fable raises them in the morning)

1. **The statues.** Built as four code shapes (Column, Loaf, Arch, Orb); two each; one move per turn instead of a
   shot. The real figures are sculpts: Astra's fourteen expansion references (boba buddy, moss boss, tiny tyrant,
   void loaf and the rest) are small statue shapes already and could be the set, standing on the dirt instead of
   inside glass; a Meshy lane, his. His list of shapes may differ; the placement input stays.
2. **The grails' sculpts.** Astra's four references are ready for Meshy (and fourteen expansion figures). Meshy is
   paid and his: `satellites/ripcord/tools/forge3d/meshyfit.py` resumes by task id. Nothing was generated.
3. **The expansion bank** (240 designs, wave 1 = 30 procedural in three families plus three sculpts): its own
   milestone, with a catalog module, renderer dispatch for seven families, save migration and a stamp card track.
4. **The name.** Keepsies stays (Astra agrees); Pocket Legends' wordmark exists if he wants a store name.
5. **Boss ransom.** The design says bosses never ransom; the tutorial Dusty does. Astra: label the tutorial offer as
   practice. Not changed overnight.
6. **The ladder's shape.** Twenty portraits exist; the design wants five rungs per league (25). Astra proposes four
   rungs plus the boss. K3 is blocked anyway; his call when it unblocks.
7. **The Arena's damage units and the six versus seven conditions** (Astra's contradictions list): the Director call
   that blocks K3, now with Astra's numbers beside it.
