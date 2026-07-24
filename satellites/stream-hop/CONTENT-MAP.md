# Jimothy — where every costume comes from
_Last updated: 2026-07-24. This file is the source of truth for the roster. If you change
who gives what, change it here in the same commit._

Forty four characters. **Five lanes, and each lane means one thing**, so a player can
always answer "how do I get that one?" without being told.

| lane | how you get it | can you buy it? |
|---|---|---|
| 🛒 **The bin & shop** | bottlecaps you grab on the road | yes — 40 random / 110 chosen |
| 💛 **Supporter Pack** | $3, one time | it is the pack, and it never grows |
| 📅 **The weekly** | show up seven days in a row | **NO. Never for sale.** |
| 🎟 **Codes** | posts, videos, friends of the studio | **NO. Never for sale.** |
| 🔎 **Secrets** | found out on the street | **NO. Never for sale.** |

---

## 📅 THE WEEKLY — five costumes, and the only way in is coming back
A costume every seven days in a row. Miss a day and the count restarts, but the costume
you were walking toward does not change, so a broken week costs time and never the prize.
⛔ These five are **not in the bin, not in Pick One Out, not in Today's Find, not in the
pack**. They are the reason to come back tomorrow, and that only works if they cannot be
bought.

| week | costume | shown in the shop as |
|---|---|---|
| 1 | Froggery Jimothy | Play 1 week |
| 2 | Dino Onesie Jimothy | Play 2 weeks |
| 3 | Cardboard Knight Jimothy | Play 3 weeks |
| 4 | Hazmat Jimothy | Play 4 weeks |
| 5 | Pirate Jimothy | Play 5 weeks |

Once all five are yours, day seven pays double bottlecaps until there are more.
**Adding a rung:** append the id to `REWARD_SKINS` and give it `via:'weekly'` in `CHARS`.
⛔ Append only — never insert in the middle, or somebody two days from a costume watches
it turn into a different one.

## 🎟 CODES — five costumes to hand out, plus one gift
Codes are the lane that brings people IN: post one, and the people who follow you can
unlock something the shop will never sell. Mint any code with
`node scripts/make-code.js WORD`, which prints the paste line and a link.

| code | unlocks | for |
|---|---|---|
| `SHINOTHY` | **Shinothy** | the friend who invented her. Shows as `???` to everyone else |
| `MOONWALK` | Astronaut Jimothy | shares its name with the soundtrack's first song |
| `PHONEHOME` | Little Green Jimothy | |
| `BOOGIE` | Disco Jimothy | |
| `BEEPBOOP` | Robot Jimothy | |
| `ABRACADABRA` | Wizard Jimothy | |
| `JIMOTHY` | 100 bottlecaps | safe to post anywhere |
| `TRASHPANDA` | 150 bottlecaps | |
| `NUGGET` | 60 caps + a free continue | |

**Every redemption pings Discord** (🎟 **BOOGIE** redeemed in **jimothy** → Disco
Jimothy) and lands in the `codeRedemptions` collection, never in `feedback`. That is what
makes per-channel codes worth doing: give TikTok one word, Reddit another, and the pings
tell you which platform actually converts. Fire and forget, so a costume never waits on a
network call.

A link works as well as typing: `https://lucidwinds.com/jimothy/?code=BOOGIE`.
⛔ The words are **not** in the game file (it is public) — only two hashes and a length.
⛔ A code cannot be locked to one person without a login, so a forwarded code is a code
everyone has. Fine for a promo, worth knowing for a gift.

## 🔎 SECRETS — found, never sold, never given
| costume | how |
|---|---|
| Ghost Jimothy | be out in the fog long enough |
| Rich Uncle Jimothy | earn 300 bottlecaps in your life |
| Sasquatch | find all eight landmarks |
| **Mothman** | clear a blackout level |
| **The Trash King** | clear level 25 |
| **Chicken Suit Jimothy** | cross 300 road lanes, ever (`PROG.roads`) |

## 🛒 THE BIN & SHOP — what bottlecaps buy
Twelve Seattle critters and the fourteen pack costumes. The bin is 40 caps for one you do
not own (never a duplicate), Pick One Out is 110 for a specific one, Today's Find is one
of them at a quarter off. Colours (13 materials) are sold here too.

## 💛 SUPPORTER PACK — $3, and it never grows
`PACK_COSTUMES`, fourteen ids: soggy, summer, nordic, barista, fishmonger, grad, labcoat,
deckhand, market, hardhat, scout, firstfrost, garage, shark. Plus every song.
⛔ Never add to this list. It was sold as those fourteen; everything painted since is
earned. Every line of copy quotes `packCount()` so the promise cannot drift.
