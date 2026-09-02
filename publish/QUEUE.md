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
| 1 | Bloom Breaker | `bloom-breaker` | 0.23 | `gameOver` | Brick breaker is the single most durable genre on both networks. 60 levels, 24 powerups and a boss, in 235 KB. Boots straight to PLAY with no instruction wall. |
| 2 | Berry Vine | `berry-vine` | 5.94 | `winGame` | Bubble shooter, the other evergreen. The title art is the best in the catalogue and needs no explanation in five languages. |
| 3 | Seed Pot | `seed-pot` | 10.65 | `endRun` | Drop and merge, the genre that is actually trending right now. One finger, endless, obvious in one frame. |
| 4 | Petal Slice | `petal-slice` | 5.36 | `endRun` | Swipe to slice. Reads instantly at 200x120, which is the size that decides whether anyone clicks. |
| 5 | Dew Snip | `dew-snip` | 4.70 | `win` | Cut the rope with a dewdrop. Physics puzzle with a real level ladder, and the art is premium. |
| 6 | Burr Blast | `burr-blast` | 9.96 | `winLevel` | Physics slingshot into rickety forts. Proven genre, satisfying failure, four earn moments already marked in the source. |
| 7 | Bramblewick | `bramblewick` | 4.87 | `endRun` | A survivors run. The hottest genre of the last two years and we have one, at 5 MB. |
| 8 | Picnic Panic | `picnic-panic` | 0.17 | `endRun` | Galaga with a snapdragon. 174 KB, pure arcade, no economy anywhere in it. |
| 9 | Hexa Hive | `hexa-hive` | 0.11 | `gameOver` | Colour drop and match, endless, 112 KB. The lightest thing on the list and the fastest to load on a bad connection. |
| 10 | Garden Guard | `garden-td` | 1.72 | `winLevel` | Tower defence. Nine towers, a wave ladder, and it is the only strategy shape in the ten. |

Total unbuilt weight of the ten: **43.7 MB** across 10 folders, every one under the
20 MB ZIP ceiling before the builder strips anything.

**Why these ten and not ten others.** The catalogue's strength is botanical puzzle games,
and a network catalogue full of ten quiet puzzlers converts badly. The ten above are
eight different genres: brick breaker, bubble shooter, merge, slice, physics puzzle,
physics slingshot, survivors, shoot em up, match drop, tower defence. Each one is a shape
a player already knows, which is the only thing that survives a 200x120 thumbnail. Each
one also ends: none of them is an idle game, a sandbox, or a tool.

### Alternates, ranked, ready to swap in

Held back only because the ten above cover their genre or beat them on art. Any of these
is a build away if a network rejects one of the ten.

| # | Game | MB | Hook | Note |
|---|---|---|---|---|
| 11 | `merge-blast` | 0.12 | `endRun` | 2048 by tapping. Loses to Seed Pot on art, wins on size. |
| 12 | `bubblenaut` | 0.26 | `gameOver` | Bubble Bobble across five worlds. |
| 13 | `nova-bloom` | 2.49 | `gameOver` | Twin stick. Loses to Picnic Panic only because Picnic Panic is 15x smaller. |
| 14 | `grubtrap` | 4.64 | `gameOver` | Sokoban shove puzzle with the best title screen of the four. |

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

## Step 2 — the twenty ZIPs

Filled in as each build is verified. See the builder-fix log at the bottom.

