# READY TO FIRE — copy Stephen can post today

Everything below is drafted in your voice (warm, no long dashes, honest).
Edit freely. Each item says where it goes and what to attach.

---

## 1. Show HN post (news.ycombinator.com/submit)

**Title:**
Show HN: I spent 60 days building a 140k line botanical game where every plant is a one of one

**URL:** https://lucidwinds.com/name/

**First comment (post it yourself right after submitting):**

I'm a dad who wanted to build something cozy instead of another thing that
farms attention. Lucid Winds is a botanical game where you earn plants by
playing little pattern games, and every plant is generated deterministically
from a SHA-256 hash. Same hash, same plant, forever. Nobody else can ever
grow yours.

Some numbers, because HN likes numbers: about 140,000 lines of vanilla
ES5 JavaScript in what is mostly one HTML file. No frameworks. 67 mini
games. Every plant gets a procedural haiku from curated line banks. The
trait space works out to roughly 10^22 visible plant configurations.

The link is a tiny demo page: type your name and it hashes it into your
plant, art and haiku included. The full game and the free games portal
are linked from there.

I built this with Claude as my pair programmer over about 60 days of
evenings. Happy to answer anything about the hash-to-art pipeline, the
haiku engine, or what it's like shipping something this size solo.

**Timing note:** Tuesday to Thursday, 8 to 10am Eastern gets the best Show HN
traction. Reply to every comment in the first two hours.

---

## 2. itch.io listing (start with Blooming Words, it uploads clean)

itch.io wants an uploaded playable build, and Blooming Words is fully static
so it works perfectly as the beachhead. Zip the deployable files from the
Blooming_Words repo (index.html, manifest, assets) and upload as an HTML5
game, viewport 480 x 854, mobile friendly checked.

**Title:** Blooming Words

**Short description:**
Trace letters to spell words and grow an interlocking crossword garden.
142 hand grown gardens, a 9,612 word dictionary, and a pressed flower
journal for every bonus word you find.

**Body copy:**

A quiet word game in cyanotype blue. Trace five letters to plant words,
watch the crossword garden bloom on its own as crossings carry over, and
press any real word you find into your journal for bonus pollen.

No download, no account, no ads. Plays offline after first load.

Blooming Words is one bloom in the Sky Wolf Studios garden. The whole
fleet of 60 plus free games lives at https://lucidwinds.com/portal and the
flagship, Lucid Winds, grows you a plant no one else can ever own.

**Tags:** word-game, cozy, relaxing, browser, free, puzzle

---

## 3. Ten clip scripts (15 to 30 seconds, vertical, record on your phone)

Rule from the playbook: batch one recording session, cut ten clips, post
one every few days on Reels and Shorts. Boost nothing until one clip
proves itself. Every caption ends with the same line: **free at
lucidwinds.com** (the /name page is the hook link for clips 1 and 10).

1. **Your name is a plant.** Screen record /name. Type your kid's name,
   pause on the reveal, read the haiku out loud. Caption: I typed my
   daughter's name and the game grew this. It's hers forever.
2. **Nobody else can own this.** Open your rarest plant, flip the card
   slowly, zoom the DNA ledger. Caption: every plant is a one of one
   grown from a hash. Show the hash.
3. **I planted a real tree at a real park.** Wild tab, GPS map, drop a
   plant at a landmark people know. Caption: my plants live on a real
   map. Someone in your town might find this one.
4. **The bloom reveal.** Nursery seed on day 3, water it, full bloom
   cinematic. No talking, just the reveal and the sound.
5. **The haiku.** Card front, read the poem, then say: the game wrote
   this. For this plant. It will never write it again.
6. **67 games speedrun.** Two second cuts of a dozen wildly different
   games ending on the plant reveal. Caption: all of this is free and
   it all feeds one garden.
7. **The mythic pull.** React genuinely to a rare companion drop (a
   Beholder or Heron). Rarity numbers on screen.
8. **The printed card.** Print a plant card, hold it, scan the QR on
   camera, the portal opens. Caption: my plant lives on paper AND on a
   map. (This works now, the QR shipped today.)
9. **Grandma test.** Someone older playing a card game on a phone in a
   real setting, lodge or porch. Caption: built cozy on purpose. Keeps
   the mind busy in the good way.
10. **One garden after 30 days.** Slow pan of a full greenhouse. Caption:
    day one I had one plant. Type your name, that's day one.

---

## 4. Attribution cheat sheet (how we know what worked)

Every entry path is tagged. Watch these in GA4:
- `?drop=flyer` = printed flyers and venue QRs
- `?drop=qr` = QR scanned off a shared or printed plant card
- `?drop=share` = tapped a share link
- `?drop=name` = came through the /name page CTA
- `?ref=CODE` = referral codes

## 5. Only-you list (nothing here can be done from the codespace)

1. Print `marketing/flyer-portal-letter.png` (US letter, borderless if the
   printer allows) and leave a few at the Salt Fork lodge front desk.
   Paste the lodge marketing lead's email into a session and a warm
   partner note gets drafted the same hour.
2. Record clip 1 and clip 8, they're the two strongest and fastest.
3. Make the itch.io account and upload the Blooming Words zip.
4. Post the Show HN on a weekday morning when you can hang out in the
   comments for two hours.
5. Hostinger panel: turn off the LiteSpeed bot challenge so link
   previews and crawlers stop eating 403s. This quietly boosts every
   single share.
6. Ko-fi URL whenever you make one, and the tips button gets wired the
   same day.
