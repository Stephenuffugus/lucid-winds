# Jimothy — where every costume comes from
_Last updated: 2026-09-18 (Mikothy Jackson, the 46th). This file is the source of truth for the roster. If you change
who gives what, change it here in the same commit._

Forty six characters. **Five lanes, and each lane means one thing**, so a player can
always answer "how do I get that one?" without being told.

| lane | how you get it | can you buy it? |
|---|---|---|
| 🛒 **The bin & shop** | bottlecaps you grab on the road | yes — 40 random / 110 chosen |
| 💛 **Supporter Pack** | $3, one time | it is the pack, and it never grows |
| 📅 **The weekly** | show up seven days in a row | **NO. Never for sale.** |
| 🎟 **Codes** | posts, videos, friends of the studio | **NO. Never for sale.** |
| 🔎 **Secrets** | found out on the street | **NO. Never for sale.** |

---

## 🎮 THE STEAM VERSION: how every character is got (written 2026-09-18, from the code, game v9.4)
A paid player never waits for a calendar and never has to hunt for a code. Nothing on Steam costs money.

| group | who | how, on Steam |
|---|---|---|
| Jimothy | the original | yours from the start |
| The 14 pack costumes | Soggy, Hot Jimothy Summer, Nordic, Barista, Fishmonger, Dr. Jimothy, Jimothy MD, Deckhand, Market Day, Hard Hat, Scoutmaster, First Frost, Garage Band, Sharkothy | **yours from the start.** The Steam build grants the Supporter Pack outright (`vendor.sh`) |
| The 12 critters | Pigeon, Crow, Seagull, Opossum, Skunk, Banana Slug, River Otter, Heron, Coyote, Harbor Seal, Salmon, Orca | bottlecaps from playing: the Prize Bin is 40 caps for a random one (the price climbs 25 a pull to a 400 ceiling, never a duplicate), or pick one: common 110, rare 220, epic 400 |
| The campaign ladder (on the web these are the weekly and the code costumes) | Froggothy 10, Dinothy 20, Cardboard Knight 30, Hazmat 40, Pirate 50, Astronaut 60, Little Green 70, Disco 80, Robot 90, Wizothy 100 | **clear that campaign level** (`STORE_UNLOCKS`). The web codes still work for anyone who has one |
| Secrets, found by playing | Ghost Jimothy | stay out in the fog for 25 seconds in one run |
| | Rich Uncle Jimothy | earn 300 bottlecaps in your life |
| | Sasquatch | find all eight landmarks |
| | Mothman | clear a blackout level (the specials cycle every tenth level: railyard, storm, sound, blackout, so the first is level 40) |
| | The Trash King | clear level 25 |
| | Chicken Suit Jimothy | cross 300 road lanes, ever |
| | Mikothy Jackson | hop BACKWARDS 50 times, ever |
| Private, code only, ON PURPOSE | The Barnacle | one man's code. Visible in the code row, never earnable. It does NOT count toward "The Whole Crew" or any total (`crewTotal()`) |
| | Shinothy | her inventor's code. Shows as `???`. Does not count either |

So on Steam exactly TWO characters need a code, both private by design, and neither is ever required for anything.
Codes are a web marketing lane; on Steam they are a bonus door, never the only door.

## 📅 THE WEEKLY — five costumes, and the only way in is coming back
A costume every seven days in a row. Miss a day and the count restarts, but the costume
you were walking toward does not change, so a broken week costs time and never the prize.
⛔ These five are **not in the bin, not in Pick One Out, not in Today's Find, not in the
pack**. They are the reason to come back tomorrow, and that only works if they cannot be
bought.

| week | costume | shown in the shop as |
|---|---|---|
| 1 | Froggothy | Play 1 week |
| 2 | Dinothy | Play 2 weeks |
| 3 | Cardboard Knight Jimothy | Play 3 weeks |
| 4 | Hazmat Jimothy | Play 4 weeks |
| 5 | Pirate Jimothy | Play 5 weeks |

Once all five are yours, day seven pays double bottlecaps until there are more.
**Adding a rung:** append the id to `REWARD_SKINS` and give it `via:'weekly'` in `CHARS`.
⛔ Append only — never insert in the middle, or somebody two days from a costume watches
it turn into a different one.

## 🎟 CODES — six costumes to hand out, plus one gift
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
| `ABRACADABRA` | Wizothy | |
| `THEBARNACLE69` | **The Barnacle** (`legend`) | ⛔ Stephen is handing this to ONE man and nobody else. Do not post it, do not put it in a code round-up, do not hand it to a directory. The whole bit is that the costume sits visible in the code row and almost nobody can open it. |
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
| **Mikothy Jackson** | hop BACKWARDS 50 times, ever (`PROG.backHops`, `MOONWALK_HOPS`). The skin that moonwalks: `moonwalk:1` makes him slide opposite to the way he faces on every sideways hop. Same on web and Steam, no code, no calendar |

## 🛒 THE BIN & SHOP — what bottlecaps buy
Twelve Seattle critters and the fourteen pack costumes. The bin is 40 caps for one you do
not own (never a duplicate), Pick One Out is 110 for a specific one, Today's Find is one
of them at a quarter off.

⛔ **Colours (the 13 material finishes) were RETIRED 2026-07-24.** Stephen: they looked
like a hue slider dragged over his paintings and cluttered the collection. They were built
when 29 characters was the whole wardrobe and it needed multiplying; with 45 characters the problem is gone. The code is dormant behind `FIN_ON`, not deleted, and
anyone who bought one was refunded.

## 💛 SUPPORTER PACK — $3, and it never grows
`PACK_COSTUMES`, fourteen ids: soggy, summer, nordic, barista, fishmonger, grad, labcoat,
deckhand, market, hardhat, scout, firstfrost, garage, shark. Plus every song.
⛔ Never add to this list. It was sold as those fourteen; everything painted since is
earned. Every line of copy quotes `packCount()` so the promise cannot drift.
