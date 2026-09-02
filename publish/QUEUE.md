# PUB1 QUEUE — the ten for GameDistribution and GameMonetize

> Built 2026-09-02 on branch `add-sproing-jumper`. Nothing here needs the Director.
> Every claim below carries the command that re-derives it and that command's last line.
> Companion to `PUBLISHING.md` (the status board) and `publish/REPLY-GD.md` / `REPLY-GM.md`.

## How the ten were chosen

Three passes, each one cheaper than the next one is wrong.

**Pass 1, the counter.** The candidate set comes from `scripts/catalog.mjs`, imported,
never regexed. Excluded up front: the 24 dev gated cards, the 12 vendored satellites,
Blooming Words and Hues (already built), Jimothy (step 4), and the three cards that are
not satellite folders at all (Lucid Winds itself, LOAF, Whack Box).

```
$ node scripts/catalog.mjs
A VISITOR CAN OPEN   161   <- the number for player-facing copy
$ node scripts/vendor_satellites.mjs --list | wc -l
12
```

**Pass 2, the mechanical screen.** `publish/tools/pick_screen.mjs` reads every remaining
game's folder and reports size, foreign hosts, Firebase, Leaflet, CDN fonts, the
absolute same-origin references a ZIP cannot carry, the round end function the builder
can hook, and any top level asset folder that no shipped file names.

```
$ node publish/tools/pick_screen.mjs
84 screened, 69 pass, 15 rejected
```

⛔ This screener has already been wrong twice, and both traps are now guarded in it:

- **"leaflet" as a substring** matched Mahjong, whose tile list describes a frond as
  "a tall spine of paired leaflets". A clean 7 MB game was thrown out for a word.
  Leaflet is now detected as a script or link src, or an `L.map(` call, never as text.
- **three.min.js carries `https://github.com/mrdoob/three.js` in its own banner.**
  Create a Critter, Slice 3D and Dewball were all disqualified for an "external call"
  that is a string inside a vendored file and is never fetched. Foreign hosts are now
  read from `src` / `href` / `url()` attributes only.

Both of those are the same lesson as the one written on top of `scripts/catalog.mjs`:
a check that silently matches the wrong thing does not error, it just returns a smaller
list, and a smaller list looks exactly like a correct one.

**Pass 3, boot every survivor and look at it.** `publish/tools/smoke_boot.mjs` opens each
game in headless Chrome at 375x667 with touch on, waits for it to settle, and records
console errors, failed requests, horizontal overflow, and every visible tap target
measured in **rendered** pixels. Then the screenshots go onto contact sheets and get
opened, because a green boot is not a look.

```
$ node publish/tools/smoke_boot.mjs $(all 67 clean slugs)
wrote .../smoke.json for 67 games
```

**All 67 booted with zero console errors, zero 404s and zero horizontal overflow.**
That is the fleet's own defect sweep paying off, and it is why the choice below is about
appeal and shape rather than about which games are broken.

### What looking at them changed

Three things no grep would have told me, all found by opening the contact sheets:

1. **Every game in the catalog now boots with a "CONGRATULATIONS, YOU UNLOCKED A SONG"
   card over the bottom third of the screen.** That is today's music unlock system
   (`/music-unlocks.js`, added to 105 satellites this afternoon). It is Sky Wolf economy
   furniture, its "Play it now" button streams from our own host, and `pub_build.py`
   was written in early August and does not know the file exists. Carried into step 2 as
   builder fix **BF1**.
2. **Pit Bike Rally answers a 375x667 phone with "ROTATE TO LANDSCAPE" and nothing else.**
   It is a good game and it fails the criterion as written. Rejected.
3. **The portal exit buttons are not hidden by the builder.** `pub_build.py` hides
   `[onclick*="SWS_EXIT"]` in CSS, but the fleet wires its exits in JavaScript
   (`el('exitBtn').onclick = ...`, `tap('b-exit', ...)`), so the CSS matches nothing.
   The button survives, still reading "Sky Wolf Studio Arcade", and now does nothing at
   all because SWS_EXIT was neutralised. A dead portal link is worse than no link.
   Carried into step 2 as builder fix **BF6**.

---

## THE TEN

Ranked. The ordering is by how quickly a GameDistribution or GameMonetize player
understands the game from a thumbnail, because that is what those catalogues sell on,
with size and hookability as tie breakers.

| # | Game | Folder | MB | Round end hook | Why it is on this list |
|---|---|---|---|---|---|
| 1 | Bloom Breaker | `bloom-breaker` | 0.23 | `gameOver` | Brick breaker is the most durable genre on both networks. 60 levels, 24 powerups and a boss, in a 44 KB ZIP. Boots straight to PLAY with no instruction wall. |
| 2 | Berry Vine | `berry-vine` | 5.94 | `showResults` | Bubble shooter, the other evergreen. The best title art in the catalogue and it needs no explanation in any language. |
| 3 | Petal Slice | `petal-slice` | 5.36 | `endRun` | Swipe to slice. Reads instantly at 200x120, which is the size that decides whether anyone clicks. |
| 4 | Dew Snip | `dew-snip` | 4.70 | `win` | Cut the rope with a dewdrop. A real level ladder and premium art. |
| 5 | Picnic Panic | `picnic-panic` | 0.17 | `endRun` | Galaga with a snapdragon. 26 KB, pure arcade, no economy anywhere in it. |
| 6 | Bubblenaut | `bubblenaut` | 0.26 | `gameOver` | Bubble Bobble across five worlds. The only platformer in the ten and it is 115 KB. |
| 7 | Stop the Light | `stop-the-light` | 0.29 | `endRun` | One tap, press your luck, three fireflies and the run is over. The most instantly understood game we own. |
| 8 | Nova Bloom | `nova-bloom` | 2.49 | `gameOver` | Twin stick starfield. Every enemy cleared plants a flower that charges the bomb. |
| 9 | Garden Guard | `garden-td` | 1.72 | `winLevel` + `loseLevel` | Tower defence. Nine towers, a wave ladder, and the only strategy shape in the ten. |
| 10 | Pong Arena | `pong` | 0.26 | `showResult` | Every pong that ever was, twelve career levels. An arcade classic costs a portal nothing to explain. |

Total shipped weight of the twenty ZIPs: **40.9 MB**, the largest 5.98 MB, the
smallest 26 KB. Every one is far under the 20 MB ceiling.

**Why these ten and not ten others.** The catalogue's strength is botanical puzzle games,
and a network catalogue full of ten quiet puzzlers converts badly. The ten above are ten
different genres: brick breaker, bubble shooter, slice, physics puzzle, shoot em up,
platformer, press your luck, twin stick, tower defence, pong. Each one is a shape a
player already knows, which is the only thing that survives a 200x120 thumbnail.

⭐ **And each one ENDS.** That turned out to be the criterion that did the real work.
Four games were picked in the first pass and thrown out in the second for the same
reason: a careless player cannot lose them. See "The four that could not be finished"
below, which is a finding about the games, not about the harness.

### The four that could not be finished, and what that means

These were on the first list and came off it in step 2, each after a recipe played them
headless with real pointer events and could not reach a round end. Every one of them is
a good game. That is the problem.

| Game | What happened | Command and its last line |
|---|---|---|
| **Seed Pot** | Ten minutes and 1,500 dropped seeds left the pot **emptier** than one minute had, because merging clears more room than careless dropping fills. Its round end needs the pile over the rim for 2.5 continuous seconds (`G.overTime>2.5`). | `node publish/tools/pub_verify.mjs publish/dist/seed-pot-gd.zip --offline` → `FAIL seed-pot-gd: 2 assertion(s)` after `real 10m18s` |
| **Hexa Hive** | Game over is a full comb (`if(!anyEmptyCell())`), but clearing a hive calls `advance()`, which does `G.level++; buildLevel()` and hands back an empty board. Four passes of the whole grid reached Hive 2 and score 1510 with the comb no fuller. | `node publish/tools/pub_verify.mjs publish/dist/hexa-hive-gd.zip --offline` → `FAIL hexa-hive-gd: 2 assertion(s)` |
| **Merge Blast** | Reached level 10 and 14,294 points on random taps. The board refills faster than mismatches accumulate. | `node publish/tools/pub_verify.mjs publish/dist/merge-blast-gd.zip --offline` → `FAIL merge-blast-gd: 2 assertion(s)` |
| **Inkbound** (`grubtrap`) | Passed once and failed three times. Shoving planters PENS the grubs by accident, so walking around the bed scores points instead of dying. `penned 1, grubs left 1, score 50, three lives intact.` | `node publish/tools/pub_verify.mjs publish/dist/grubtrap-gd.zip` → `FAIL grubtrap-gd: 2 assertion(s)` |

⚖️ **This is worth Stephen's attention, and it is not a testing problem.** The builder
puts the ad break on the round end, and both networks put it there too. A game whose
round end a normal player reaches once an hour serves one ad an hour. Four of our
strongest casual titles are built to be un-losable, which is lovely design and poor ad
placement. If they are ever wanted on a network, they need a second break somewhere a
player actually arrives at, a level clear or a milestone, not a game over.

### Alternates still ready to swap in

| Game | MB | Hook | Note |
|---|---|---|---|
| `hedgerow` | 5.21 | `gameOver` | Same shove genre as Inkbound and untested for the same risk. |
| `spore-drift` | 2.66 | `_sbCapEarn` | Ambient drift, no named round end. |
| `flatulence-fighter` | 0.15 | `gameOver` | A composure game, ends fast, and the joke is the sell. |
| `frost-watch` | 3.40 | `win` | Hooks a win only, so a losing player would see no break. |

---

## REJECTED, and why

`node publish/tools/pick_screen.mjs` rejects 15 of the 84 screened outright. The rest of
the 69 that pass are simply not in the top ten; the classes below are the ones with a
reason beyond ranking.

**Google Fonts from a CDN (6 games).** `budburst`, `petal-plunge`, `pollen-panic`,
`shell-shuffle`, `vine-runner`, `vinewinder`. Both networks host the ZIP on their own
origin, and a font fetched from `fonts.googleapis.com` is an external call at play time
that we do not control. Fixable later by stripping the link and shipping the fallback
stack, at the cost of the intended typeface. Not worth doing while 69 games need no fix
at all.

**Over 20 MB (7 games).** `chaff-wars` 38.7, `flock-the-world` 61.9, `greenhouse-pinball`
81.4, `nectar-drop` 89.3, `petalvex` 22.8, `seed-flutter` 24.3, `tonic-drop` 34.2.
⭐ Most of that weight is **not shipped art**: an `art-drop/` folder that no HTML, JS, CSS
or JSON file in the game ever names. Pruning it takes Tonic Drop to 2.4 MB, Petalvex to
2.0 MB and Seed Flutter to 13.3 MB, which puts three of the seven back in range. That
prune is builder fix **BF4** and it is what step 4 needs for Jimothy anyway.

**No round end anywhere to hook (3 games).** `bandits-box` is a fidget toy box and says so
("No ads, nothing to unlock"), `pitbike-rally` and `vine-runner` have neither a named
round end nor a capped earn site. An ad needs a moment; these have none.

**Landscape only (1 game).** `pitbike-rally` again, on looking at it. See above.

**Excluded before screening, by the task's own fence:** the 12 vendored satellites
(fixes belong upstream, never in `satellites/`), the 24 dev gated cards, Blooming Words
and Hues (built in August), and Jimothy (step 4).

**Passing but not picked, by shape rather than defect:** the creative tools with no round
at all (`doodle-pad`, `stop-motion`, `flipbook`, `silt`, `bandits-box`), the idle garden
(`first-sprout`), the board games whose round takes ten minutes (`garden-estates`,
`snakes-ladders`, `fence-off`, `mosaic-draft`), and the word games, which do not travel
across languages on an international network (`fox-basket`, `bloomzap`, `mini-crossword`,
`cipher-bloom`, `root-groups`).

---

## Honest notes on the ten

- **Bramblewick has five buttons at 44 px tall**, four short of the house 48 px rule
  (`sel 117x44`, four more at 90 to 126 wide). They are wide, so the hit area is large,
  and the fence for this task forbids editing anything under `satellites/`. Recorded,
  not fixed.
- **Picnic Panic's `<title>` reads "PICNIC PANIC · Garden Galaga · Lucid Winds Edition".**
  A Lucid Winds edition of a game on GameMonetize makes no sense. Builder fix **BF7**.
- **Garden Guard names Sunbeams 30 times in its source**, more than any other game in the
  ten. Most are comments, but its help text is the one most likely to still mention a
  currency the publisher build does not have. Checked on screen in step 2, not by grep.

---

## Step 2 — the twenty ZIPs, every one played to its round end

```
python3 scripts/pub_build.py satellites/<game> --target gd    (then --target gm)
node publish/tools/pub_verify.mjs publish/dist/<game>-<target>.zip
```

`pub_verify` unzips the ZIP, serves it **from its own bare root on its own port** with
nothing else on the origin, boots it in headless Chrome at 375x667 with touch on, runs
the game's recipe in `publish/recipes/<game>.mjs`, and asserts:

| | assertion |
|---|---|
| A | zero requests to lucidwinds.com or stephenuffugus.github.io |
| B | zero 404s or failed loads of the ZIP's own files |
| C | the network's SDK url and options block are in the shipped HTML, with a game id |
| D | `window.__pubAd` exists, is **not** called before the round ends, and **is** called at it |
| E | zero console errors and zero uncaught page errors |
| F | no portal exit on screen, no Lucid Winds copy, no music unlock card, no brand in the title |
| G | the recipe reached a round-over screen |
| H | no horizontal overflow at 375x667; every tap target measured in rendered pixels |

⛔ **The recipes are linted so they cannot cheat.** A recipe that reached the win screen
by calling the game's own `gameOver()` would satisfy assertion D while proving nothing,
because that is the function the ad is hooked to. `pub_verify` reads the recipe's source
and fails the ZIP if it calls a round-end function, uses `.click()`, or dispatches
events, and fails it again if the recipe never touches the screen at all.

### Result: 20 of 20 PASS

Run with the real network SDK live in the page, not stubbed.

| ZIP | size | hook | round end reached | `__pubAd` at the end | result |
|---|---|---|---|---|---|
| `bloom-breaker-gd.zip` | 44 KB | `gameOver` | yes | 1 | **PASS** |
| `bloom-breaker-gm.zip` | 44 KB | `gameOver` | yes | 1 | **PASS** |
| `berry-vine-gd.zip` | 5,977 KB | `showResults` | yes | 1 | **PASS** |
| `berry-vine-gm.zip` | 5,977 KB | `showResults` | yes | 1 | **PASS** |
| `petal-slice-gd.zip` | 5,394 KB | `endRun` | yes | 1 | **PASS** |
| `petal-slice-gm.zip` | 5,394 KB | `endRun` | yes | 1 | **PASS** |
| `dew-snip-gd.zip` | 4,697 KB | `win` | yes | 1 | **PASS** |
| `dew-snip-gm.zip` | 4,697 KB | `win` | yes | 1 | **PASS** |
| `picnic-panic-gd.zip` | 26 KB | `endRun` | yes | 1 | **PASS** |
| `picnic-panic-gm.zip` | 26 KB | `endRun` | yes | 1 | **PASS** |
| `bubblenaut-gd.zip` | 115 KB | `gameOver` | yes | 1 | **PASS** |
| `bubblenaut-gm.zip` | 115 KB | `gameOver` | yes | 1 | **PASS** |
| `stop-the-light-gd.zip` | 204 KB | `endRun` | yes | 1 | **PASS** |
| `stop-the-light-gm.zip` | 204 KB | `endRun` | yes | 1 | **PASS** |
| `nova-bloom-gd.zip` | 2,442 KB | `gameOver` | yes | 1 | **PASS** |
| `nova-bloom-gm.zip` | 2,443 KB | `gameOver` | yes | 1 | **PASS** |
| `garden-td-gd.zip` | 1,477 KB | `winLevel + loseLevel` | yes | 1 | **PASS** |
| `garden-td-gm.zip` | 1,477 KB | `winLevel + loseLevel` | yes | 1 | **PASS** |
| `pong-gd.zip` | 50 KB | `showResult` | yes | 1 | **PASS** |
| `pong-gm.zip` | 50 KB | `showResult` | yes | 1 | **PASS** |

```
$ for g in ...; do for t in gd gm; do node publish/tools/pub_verify.mjs publish/dist/$g-$t.zip; done; done
PASS pong-gm  50 KB  ad at round end: 1
```

Total: **40.9 MB** across twenty ZIPs. Screenshots of every boot and every round end are
in `publish/shots/`, one JSON of assertions beside each pair.

### Two warnings that are recorded and not fixed

- **`A 214x28` under 48 px, on all ten GameMonetize builds and none of the ten
  GameDistribution ones.** It is an anchor the GameMonetize SDK injects into the page
  itself. It is not ours and we cannot resize it.
- **Bramblewick's 44 px buttons** were noted in step 1 and Bramblewick is no longer in
  the ten, so the point is moot for this batch.

### What failed, and what changed in the BUILDER because of it

Every fix below is in `scripts/pub_build.py` and was re-run over every ZIP already built.
Not one ZIP was edited by hand.

| # | What the verifier found | What changed in the builder |
|---|---|---|
| BF1 | **`/music-unlocks.js` 404 in every ZIP, and a "CONGRATULATIONS, YOU UNLOCKED A SONG" card over the bottom third of every boot.** The file was added to 105 satellites on 2026-09-02; the builder's strip list was written in early August and names files one at a time. | After the named strips, drop **any** `<script src="/…">` or `<link href="/…">` whose file the copy does not contain. A rule that cannot be outrun by tomorrow's shell file. |
| BF2 | **Picnic Panic still fetched `/sunbeam-sdk.js`** and every game in the fleet still fetched `/feedback.js`, because they build those loaders at run time: `s.src = "/sunbeam-sdk.js?v=7"; document.head.appendChild(s)`. No tag regex can see that, and the `onerror` handler swallowed the failure so the game looked fine. | Any absolute `.js` path in a **string literal** that the ZIP does not carry is rewritten to `data:text/javascript,`. It still assigns, still fires `onload`, and never leaves the page. |
| BF3 | **The exit button survived in every build.** The old CSS hid `[onclick*="SWS_EXIT"]`; the fleet wires exits in JavaScript, so it matched almost nothing and shipped a live button reading "Sky Wolf Studio Arcade" that was also now dead. | Hide it four ways: the inline onclick, the id read out of the wiring (`el('exitBtn')`, `tap('b-exit')`, and Merge Blast's, which is wired two lines below where the element is fetched), the `.lw-exit` and `.swsback` classes, and `[data-go="exit"]`. Plus the aria labels, which are the one thing the fleet writes consistently. |
| BF4 | **The midroll hooked 5 satellites out of 84.** The old list held four names in one declaration style, and its fallback rewrote `window._sbCapEarn&&window._sbCapEarn(` call sites, an idiom the fleet almost never uses: it writes `if(window._sbCapEarn) granted=window._sbCapEarn(n,tag)`. | Fifteen names in four declaration styles, **ordered by outcome coverage** so a function that runs on a win *and* a loss beats one that only runs on a win. Berry Vine declares both `winGame` and `showResults`; the first version hooked the win. Failing all of them, hook the game's own `window._sbCapEarn=function(n,tag){` definition, which 80 of 84 satellites carry identically. |
| BF5 | **A win-only hook shows no ad to a player who loses,** and most players lose. Garden Guard has `winLevel` and nothing neutral. | When the chosen hook is win-only, hook the matching defeat function too (`loseLevel`, `loseGame`, `showLose`, …). Garden Guard now reports `winLevel`, plus the defeat function `loseLevel`. |
| BF6 | **"Sky Wolf Studio · a Lucid Winds satellite"** on Bloom Breaker's menu, and Picnic Panic's `<title>` read "PICNIC PANIC · Garden Galaga · Lucid Winds Edition". | Take our other product's name out of the title and out of the visible copy. Text nodes only: script and style bodies are cut out first, because `a > b && c < d` looks exactly like a text node to a regex. |
| BF7 | **"☀ +6 sunbeams" on Dew Snip's win screen** and "☀ no sunbeams this run" on Berry Vine's and Garden Guard's. `_sbCapEarn` is defined **inside each game**, not in the SDK we strip, and keeps its own cap in localStorage, so the publisher build still counted and printed the grant. The strings are built at run time, so no text pass can reach them. | A small observer in the injected head hides any leaf element whose text names the economy, whenever it appears. |
| BF8 | 7 games over 20 MB were carrying an `art-drop/` folder of raw generated sheets that nothing in the game names: 63 MB of Nectar Drop's 89, 32 MB of Tonic Drop's 34. | Prune top-level folders no shipped html, js, css or json file mentions, and print what went. This is also what step 4 needs for Jimothy. |
| BF9 | `sdk.showBanner !== 'undefined'` compares a function to the **string** "undefined" and is always true. It only ever worked because an outer `typeof` guard kept it away from a missing SDK. | A real `typeof … === 'function'` check, in both SDK adapters, so a partial SDK cannot throw inside a win screen. Also added `__pubAdCalls` and `__pubAdBreaks` counters, which is how assertion D is measured at all. |

Two fixes went into the **harness** rather than the builder, and both were the harness
lying rather than the build being wrong:

- The recipe lint counted a recipe's own `meta.hook: "_sbCapEarn"` as the recipe calling
  the game's code. It now reads the recipe's body, not its header.
- The verifier flagged the words "Dew Snip" as economy copy, because the game is named
  after the currency. The check now looks for "dew drops", never a bare "dew".

### Two things a recipe taught us about driving a real game

- **A touch that ENDS on a button activates it.** Bubblenaut's game over card opens under
  the thumb that is holding the movement pad, so a 1.6 second hold released onto "Back"
  and walked the harness politely back to the title screen. Twice, once per target. The
  recipe now drives Bubblenaut with the A and D keys the game already documents, because
  a key cannot mis-tap.
- **Green offline is not green online.** Bloom Breaker passed with the SDK blocked and
  failed with it live: the preroll delays the first frame, so the single early tap that
  launched the ball landed before there was a ball, and the table sat on LAUNCH for the
  whole run. Recipes now look for the affordance every pass instead of assuming a tap
  took. Every number in the table above is from a run with the real SDK in the page.



---

## Step 3 — the marketing sizes

```
node publish/tools/marketing.mjs bloom-breaker berry-vine petal-slice dew-snip \
  picnic-panic bubblenaut stop-the-light nova-bloom garden-td pong
pong            5 sizes from Pong Arena  (play frame: recipe, busiest of 14 frames (sd 15, frame 1000.png))
```

Fifty images in `publish/marketing/<game>/`: **512x384, 512x512, 200x120** mandatory and
**1280x720, 1280x550** optional, exactly the list in Sabina's intake mail of 2026-08-03.

Two sources and nothing else. The painted 480x480 card art from `portal-assets/thumbs/`,
and a real frame of the game being played, taken by running **the game's own verified
step 2 recipe** against the built ZIP and photographing it mid round. No debug overlay,
no price, no date: a capsule with a date on it is wrong the day after it ships.

**The mandatory tiles carry no title text.** GameDistribution prints the game's name
under the tile itself, and Poki's thumbnail guide is explicit: *"avoid text entirely, it
quickly becomes unreadable on smaller tiles"*. The two 1280 banners do carry the name,
the portal's own one line description and the studio signature, because a banner is where
a name is expected.

### The contact sheet, opened. Three things wrong, before fixing them

`publish/marketing/CONTACT-SHEET.png`, all fifty at once, opened and read.

1. **Bloom Breaker's phone panel was a black rectangle, and Nova Bloom's was nearly one.**
   The play frame was taken on a fixed nine second timer, and at nine seconds Bloom
   Breaker was still on its dark launch screen. A banner whose "gameplay" panel is an
   empty black box is worse than a banner with no panel at all.
2. **The 200x120 tiles were mostly blur.** The rule was to CONTAIN the square art over a
   blurred copy of itself so nothing was cropped. At 512x384 that is defensible. At
   200x120 the painting held the middle 120 px and the left and right thirds were blurred
   wings, which is most of the tile spent on nothing, at the one size where every pixel
   is the whole advertisement.
3. **Every banner broke its own name over two or three lines.** "Bloom / Breaker",
   "Stop / the / Light", "Garden / Guard". The copy column was pinched between a large
   art card and a large phone, so a 74 px title had about 300 px to live in, and the one
   line description under it ran eight lines deep and four words wide.

### And what fixing them turned up

4. **Stopping the timer early was not enough.** The next pass ran until the round ended,
   which put **GAME OVER** in Bloom Breaker's banner, **DEFEAT** in Pong Arena's and
   **THE GARDEN RESTS** in Nova Bloom's. Three of ten banners advertising the losing
   screen.
5. **Scoring the canvas was scoring the wrong surface.** The frame picker read the
   largest `<canvas>` and measured its pixel variance; several of these games draw on
   more than one canvas and the biggest by attribute is not the one with the game on it,
   so Stop the Light and Pong Arena both scored a flat 1 and kept their first frame.
   It now collects candidate frames across the round and picks the busiest with PIL,
   scoring the **screenshot**, which is the thing that actually goes in the banner
   (`publish/tools/pick_frame.py`).

All five are fixed in `publish/tools/marketing.mjs`, and the sheet was reopened after
each pass rather than trusted.

### Still imperfect, and said out loud

- **Two thumbs carry a wordmark baked into the art**, Bubblenaut along the bottom and
  Stop the Light across the top, and the 4:3 and 5:3 crops clip them. Letterboxing to
  avoid it is worse, per finding 2. The real fix is upstream and it is Stephen's: a text
  free variant of those two cards. Poki's guidance says thumbnails should carry no text
  at all, so it is worth doing for its own sake.
- **Bloom Breaker's play frame is still a dark table.** It is the busiest frame the round
  had; the game is simply dark until the bricks start breaking. Honest, not flattering.

---

## Step 4 — Jimothy on a diet

```
python3 publish/tools/jimothy_diet.py --budget-mb 57
source 400.7 MB
  dropped   171.6 MB  unreferenced folders
  dropped    18.0 MB  music, replaced by silence
  dropped   155.4 MB  alternate skins and rarer critters
dieted folder 55.6 MB
wrote /workspaces/lucid-winds/publish/dist/stream-hop-diet-gm.zip (55566 KB)
```

**`publish/dist/stream-hop-diet-{gd,gm}.zip`, 54.3 MB each.** From 400.7 MB, by three
rules a person can check.

### Exactly what was dropped

| Rule | What went | Bytes |
|---|---|---|
| Folders no shipped file names | `art-drop`, `art-drop2`, `art-drop3`, `art-drop4`, `art-drop6`, `art-sheets`, `music-drop`, `store-listing` | **171.6 MB** |
| Every music file | The seven soundtrack tracks and their loops, **replaced by a one second silent MP3 each**, not deleted | **18.0 MB** |
| Alternate skins beyond the default set | 39 of Jimothy's 45 characters: all 32 costume skins except Deckhand, and the 8 rarer Seattle critters | **155.4 MB** |

**Kept:** Jimothy himself, the four common Seattle critters (City Pigeon, Ballard Crow,
Seagull, Opossum) and Deckhand Jimothy. Six characters, chosen by rarity first and then
by size, filling a 57 MB budget. Raise `--budget-mb` and more critters come back; the
script prints exactly which and what they cost.

⛔ **The roster is filtered as well as the art.** Deleting `assets/skins/nordic/` and
leaving Nordic Jimothy in the `CHARS` array gives a Prize Bin full of broken images and a
console full of 404s, which is precisely what a publisher QA pass looks for. The script
brace matches the `CHARS` array out of `index.html`, drops the entries whose art is gone,
and writes it back. The array is read the way `scripts/catalog.mjs` reads the portal, by
matching brackets and skipping strings and comments, never by regex.

⭐ **The music is silenced, not deleted.** Jimothy's menu has a jukebox that lists seven
tracks and unlocks them as you play. Delete the files and every row is a 404 waiting for
the first curious reviewer. A real one second silent MP3 built with ffmpeg, written over
each track, keeps the jukebox honest, plays nothing, and costs 4 KB instead of 2.7 MB.

### It boots, and it plays a round

Same harness and same assertions as the other twenty:

```
node publish/tools/pub_verify.mjs publish/dist/stream-hop-diet-gd.zip
PASS stream-hop-diet-gd  55566 KB  ad at round end: 1
node publish/tools/pub_verify.mjs publish/dist/stream-hop-diet-gm.zip
PASS stream-hop-diet-gm  55566 KB  ad at round end: 1
```

Zero requests to our domains, zero own-file 404s, no console errors, the SDK verbatim,
and `window.__pubAd` called once at the run report. The end screen reads **"FLATTENED,
He did not see it coming, 6 ROWS CROSSED"**, which is the screen a player meets.
Screenshots in `publish/shots/stream-hop-diet-*`.

Warning recorded, not fixed: three buttons on that run report are 44 px tall
(`go-home 117x44`, `go-share 117x44`, `go-feedback 243x44`). They are the game's, and
`satellites/` is outside this task's fence.

### Three things the diet build found that the other ten had not

- **A JSON-LD block broke the build.** The builder syntax checks every inline script, and
  Jimothy is the first game in this batch with `type="application/ld+json"` in its head.
  JSON is not a program, so `node --check` failed a build that was perfectly fine. The
  checker now only reads blocks that are actually JavaScript, and the structured data
  block is stripped outright: it is a search engine description of the game **at our
  URL**, and the domain sweep had already left it with empty `url` and `image` fields.
- **A payment surface.** Jimothy's menu carries "Support the Studio", and behind it
  `#sup-buy`, `#sup-donate`, `#sup-d5`, `#sup-d10`, `#sup-d25`. A publisher build must
  not carry a checkout pointing at ours. The economy sweep now takes it, walking up from
  the label to the button that holds it so a control does not lose its text and stay.
- **A feedback form wired to our endpoint,** with "We would love to hear what you think"
  on the game over screen. The builder had always stripped OUR feedback fab; this one is
  built into the game. Anything with `feedback` in its id is now hidden.

The last of those changed the builder after the other twenty ZIPs were already verified,
so all twenty were rebuilt and re-verified against it rather than left one revision
behind.

---

## Where the ZIPs are, and why they are not in git

`*.zip` is in `.gitignore` with the note *"extract, wire, delete, never commit"*, and the
repository is already 3.7 GB. The twenty two ZIPs are **built artifacts**, and they are
rebuilt by one command each:

```
python3 scripts/pub_build.py satellites/<game> --target gd --game-id <THE REAL ID>
python3 publish/tools/jimothy_diet.py --budget-mb 57 --game-id <THE REAL ID>
```

⛔ **And they have to be rebuilt anyway.** A placeholder id loads the game fine and
serves no ads, so every ZIP in `publish/dist/` today is a proof that the pipeline works,
not a thing to upload. The moment a real game id exists, the rebuild takes under a
minute per game and the verifier proves it again.

What IS committed is everything that cannot be regenerated from a command: the builder,
the ten play recipes, the fifty marketing images, and the evidence, which is a boot
screenshot, a round-end screenshot and a JSON of every assertion for all twenty two
builds, in `publish/shots/`.
