# PLAY CADENCE, NEXT LISTING, AND THE MUSIC LOCKER (Fable, Sep 21 2026)

Written in answer to Stephen's Sep 21 message (verbatim in section 9). This is a PLAN and a set of
recommendations. Nothing here is built. The build work is cut into packets in `OPUS-PACKETS-SEP21.md`.

Sources I actually read today are linked where a claim rests on them. Where I could not verify
something, the line says so.

---

## 1. THE HONEST READ ON "A GAME A DAY"

**Do not post daily. Not yet, and maybe never as separate apps.** Here is why, plainly.

**What Google's own Spam policy says** (read today,
https://support.google.com/googleplay/android-developer/answer/9899034):

> "Creating multiple apps with highly similar functionality, content, and user experience."

is a listed violation under Repetitive Content, and the same section tells developers with many small
apps to "consider creating a single app that aggregates all the content." It also bans "apps whose
primary purpose is to provide a webview of a website without permission." Our apps are TWAs of OUR OWN
site, so permission is not the problem. The pattern is the problem:

- The developer account is about three weeks old and has ONE live app.
- Every listing would be the same kind of package (a TWA of lucidwinds.com), from the same template,
  at the same price, arriving one a day. That is the exact shape the spam classifier exists to catch,
  whether or not each game is honestly different.
- Enforcement is on the ACCOUNT, it is permanent, and it follows associated accounts. The downside is
  losing the Play lane for life. The upside of daily over weekly is a few weeks of head start. That
  trade is not close.
- There is no published "apps per day" limit. Anyone who quotes one is guessing. The ramp below is MY
  judgment, not a Google rule.

**The ramp I recommend:**

| When | Rate | Condition to move up |
|---|---|---|
| Weeks 1 to 4 | one listing a week | zero policy emails, zero rejections |
| Weeks 5 to 8 | two a week | same, plus at least one listing with real ratings |
| After that | three a week at most | same |

Rules that hold at every rate:
1. Never submit a new app while another one sits rejected. Fix the rejected one first; repeat
   rejections are what turn into strikes.
2. Every listing is its own thing: own icon, own screenshots, own description, own privacy page, own
   package id, no shared arcade chrome inside it (the FTW music chip lesson, Sep 17), portal exit
   guarded (`inTWA`), offline cold launch proven. `scripts/twa_ready.mjs <slug>` is the gate.
3. **Classics go out as BUNDLES, not solo apps.** A lone solitaire or Shut the Box is the textbook
   "same experience as other apps already on Google Play". Google's own advice is to aggregate. The
   bundle names already exist in your own words from the music shelves: Card Table, Board Classics,
   Dice Porch, Word Garden, Logic Den, Maker Bench. Six bundles plus the originals is roughly 25 to 35
   listings that CONTAIN the hundred games. Safer, and a bundle at a dollar is a better buy than one
   card game at a dollar.
4. Originals (Tumble, Tiny World, Flock the World, Jimothy, Marrowdeep, Whistlestop, Lumen, Keepsies,
   Gerplunk, Conduit, Blockspace and the like) get their own listing. They are nobody else's game.

**The real bottleneck is you, not Google.** The Play Console blocks datacenter IPs, so every app
creation, content form, upload and paste is your hands, about one to two hours a listing even with a
perfect field sheet. Packet D (the package factory) exists to get that under an hour.

**The business honesty you asked for.** A paid app from an unknown studio with no outside traffic
usually sells very little. I have no numbers for yours and will not invent any. Flock the World has
been live since Sep 17; its Console numbers after two to four weeks are the calibration for this whole
plan, and they beat any forecast. What actually moves paid sales in a catalog like this:
- the developer page and "more from Sky Wolf Studio" cross-sell (free, allowed),
- bundles that look like value,
- a count of honest ratings (never incentivized; that is its own policy),
- ONE FREE app at the top of the funnel. Free apps get installs that paid apps never see. Section 5
  argues that the free app should be the music locker.

---

## 2. YOUR HOME ADDRESS ON THE STORE (do this first, it is privacy and it is a clock)

**What Google shows for an organization account** (read today,
https://support.google.com/googleplay/android-developer/answer/13628312): "your legal name, legal
address, developer email address, and developer phone number". ⚠ **Check which PHONE number is showing
too.** If it is your cell, swap it for a Google Voice or business line in the same sitting.

**The address must match your Dun and Bradstreet record**, so it cannot be changed in Google alone. The
order that works:

1. **Get a business street address.** Options: a virtual office or business mailbox with a real street
   address (about 10 to 30 dollars a month), a registered agent that allows business address use, or a
   coworking membership. Not a PO box. ⚠ I could not find a Google page that says virtual addresses
   are accepted or refused; many small developers use them. The proof Google asks for is a document
   showing the business at the address, not older than 90 days (utility bill, bank statement,
   government letter). **A Huntington business statement mailed to the new address does that job.**
2. **Change the LLC's address with the state** (your home is likely public there too; a registered
   agent fixes both at once).
3. **Update Dun and Bradstreet** to the new address. D&B then tells Google, and Google asks you to
   verify again (https://support.google.com/googleplay/android-developer/answer/13634888).
4. **Play Console → Developer account → About you → Update organization details → Go to Google
   Payments Center → change the address → save → upload the document if asked**
   (https://support.google.com/googleplay/android-developer/answer/16260648). Country, account type
   and the D-U-N-S number cannot change on an existing profile; an address can.
5. **Do not submit a new app while the account reads "no longer verified".** That is why this goes
   FIRST: Tumble needs about a week of art, songs and your review anyway, so the verification window
   costs nothing if it starts now.

Same sitting, same profile: **the LLC bank swap is still owed before about Oct 15** (Play AND Steam).

---

## 3. NEXT LISTING: TUMBLE. TINY WORLD KEEPS GROWING ON THE ARCADE.

**Tumble first**, because it is nearly packaged and Tiny World is, in your own words, not done.

Tumble already has: `store/tumble-play/` (Console sheet, listing copy, TWA manifest
`com.skywolfstudio.tumble`), a live privacy page, a proven offline cold launch, `twa_ready` reading
"ready to list", real music files supported behind the radio.

What stands between Tumble and the store, in order:
1. **You see all of it** → Packet A builds a tester-only "everything unlocked" switch (with a backup of
   your real save and a way back). Then your notes, then fixes.
2. **Your songs** → six radio stations. You pick; files go to the private music repo
   (`/music/v1/tumble/`), `look.url` on the six radio items, stamp bump. (⛔ audio never in git.)
3. **Your three calls** in the Console sheet: the NAME (plain "Tumble" collides), the PRICE (one price
   across stores), target age (13 and over keeps the Families policy out, same as FTW).
4. **Art**: feature graphic 1024x500 and store screenshots at minimum. The sock models are still
   capsules; your Midjourney flat lays → Meshy is the road. I would not hold the listing for all eight
   socks, but the screenshots are the whole sales pitch of a paid app, so the hero sock in the shots
   should be a real one.
5. **The workbench gate comes off** (a reviewer cannot pass a tester key), portal card moves out of In
   Development.

**Tiny World**: keep expanding in the open on the arcade. It is the right game to be generous with
(more animals, plants, everything in all directions), and content rows are ideal Opus work because the
fixture laws already exist (`rows-all-happen`, `since`, new scenes at the end). Two things to carry
into the brainstorm: ⛔ there are **12 tag slots left for ever**, so "a lot more animals" has to be
designed against that budget before anyone builds; and when it does go to Play, a game made for your
daughter either declares 13 and over like the others or takes on the Families policy. It also has the
most to lose from the data-loss problem (a child's world), so its listing should come AFTER the backup
in section 4 exists.

**The polish lane** (finished games pushed to the store while the two big ones cook): Packet C ranks
the candidates with evidence instead of my memory of them. My expectation going in: Jimothy belongs on
Play at the Steam price, and the first bundle should be whichever family the audit shows is cleanest
at phone width.

---

## 4. THE KEYSTONE: ONE OPTIONAL ACCOUNT FIXES THE DATA LOSS AND CARRIES THE MUSIC

Your Sep 19 note (unlocks wiped by clearing browser data) and today's music idea are the same piece of
engineering. Songs cannot be "theirs" if a cleared browser forgets them. So:

**"Keep my stuff" (working name), never required to play:**
- **Tier 0, automatic, no personal data:** the first time a player unlocks anything, the arcade makes
  a silent anonymous cloud copy (Firebase, a random id, nothing about the person) and shows a short
  **recovery code** once ("screenshot this"). Clearing the browser loses the login but the code brings
  everything back. This is the kid-safe tier.
- **Tier 1, one tap:** "Keep it forever" with Google sign-in or email. Survives everything, moves
  between phones.
- What it saves: the list from Packet B (every key a player would miss: music progress, game
  progress, Tiny World worlds, settings).
- What it costs us on Play, and it is manageable: any listed app that carries it must (a) update its
  **Data safety** form from "collects nothing" to the honest optional items, (b) offer **account
  deletion in the app and at a web URL** (Play's account deletion rule), and (c) `twa_ready`'s
  "no sign-in wall" check needs to learn the difference between a wall and an optional door.
  ⭐ Because a TWA updates from the web, the feature reaches every listed app with NO new upload. Only
  the Console forms are your hands.
- ⛔ Listings do NOT wait for this. Tumble can ship with local saves as FTW did.

⏰ Related clock: **Functions Node 20 is decommissioned Oct 30**. The backup will lean on Functions and
payments already live there. Packet E does the runtime upgrade.

---

## 5. HOW THE MUSIC TIES INTO EVERY GAME WE SELL

What exists already: 144 tracks live, per-game shelves, a ladder that unlocks songs by playing, one
shared player, the unlock card and the ♫ chip. What is missing is a HOME for the songs and a reason
for them to matter across games.

**The locker ("Sky Wolf Radio", working name).** One page, installable, account-aware:
- every song you have unlocked in any Sky Wolf game, in one real player (lock screen controls,
  background play),
- **a Download button on every unlocked song**: the MP3 goes onto their phone and is theirs. This is
  your "unlocked to their phones" idea, and it is squarely inside your rights (the Aug 27 research,
  `PUB-MUSIC-DISTRO.md`: shipping downloadable copies with the games is fine; it is the same thing a
  Steam Soundtrack does),
- locked shelves show "play <game> to unlock these" and link to that game's store page.

That last line is the snowball. Every dollar game becomes "a game plus N collectible songs", and the
locker sends every player to the NEXT game. The songs sell the games.

**Ways this makes money, ranked by how real they are:**
1. **Cross-sell** (above). No new policy surface. Works the day the locker exists.
2. **The locker as the ONE FREE Play app.** Free apps get the installs paid apps do not. It ships with
   the Originals shelf open so it stands on its own as a music app, and its locked shelves are the
   storefront for the whole paid catalog. Linking to your own Play listings is allowed.
3. **Soundtracks where stores sell them**: Steam Soundtrack for Jimothy (70 percent), itch.io as its
   own project. Already route 1 and 2 in the Aug research.
4. **A Supporter Pack** ("unlock the whole catalog now" as a thank you). Nothing is paywalled: every
   song stays earnable by playing. On the web it is a Stripe link. ⛔ Inside a Play app it can ONLY be
   a Play Billing purchase (read today, https://support.google.com/googleplay/android-developer/answer/9858738:
   Play-distributed apps "requiring or accepting payment for access to in-app features or services...
   must use Google Play's billing system"). A TWA can do Play Billing through the Digital Goods API;
   that is a later phase and needs the account first so the purchase follows the player. ⚠ The old
   policy carve-out for "songs playable in other players" is NOT in the current text; do not plan on it.
5. **"If people start using my songs"**: the locker counts plays per track (a bare counter, no person
   attached). That tells you WHICH songs earned a DistroKid release, instead of paying to distribute
   144 tracks that Spotify will not pay on below 1,000 streams each. Release the top ten by evidence.
6. **What stays closed**: charging creators to use the songs. The Aug research stands (you cannot
   license what raw generation does not let you own). Flip it: "free to use in your stream with
   credit" is marketing, and it is honest. ⛔ Never enrol the music in Content ID.

The honest size of it: the music will not be the income. It is the glue, the retention and the
cross-sell between a hundred small games, and that is worth more than its own sales.

---

## 6. THE ONE LIST (ranked; first block is what a store or a clock forces)

**Forced by a store, a clock, or your safety:**
1. Home address (and phone) off the Play listing → section 2. YOURS. Start now.
2. LLC bank swap on Play and Steam before about Oct 15. YOURS.
3. Functions Node 20 → 22 before Oct 30. OPUS (Packet E), your go for the deploy.

**Moves money forward, nothing blocks without it:**
4. Tumble: unlock-all switch (OPUS, Packet A) → your review → your songs → your three calls → art → list.
5. Save-key inventory (OPUS, Packet B), then the "Keep my stuff" build once you answer the question below.
6. Candidate audit (OPUS, Packet C) and the package factory (OPUS, Packet D) so a listing a week is cheap.
7. Tiny World expansion brainstorm (YOU + FABLE) → DESIGN-18 → OPUS builds.
8. The locker (after 5).

**Parked out loud, so you can stop holding it:** daily posting · Supporter Pack and Play Billing ·
DistroKid · the free locker app on Play · bundles (until Packet C says which family is cleanest) ·
Tiny World on Play.

---

## 7. THE ONE QUESTION

**Are you good with an OPTIONAL "Keep my stuff" account (silent anonymous backup plus a recovery code
for kids, one-tap Google or email for everyone else) as the way unlocks and songs are kept?**
Everything in sections 4 and 5 hangs on it. Packets A to E do not; they can start today.

---

## 8. WHAT I COULD NOT VERIFY

- Whether Google accepts a virtual office address for an organization account (no page says either way).
- Any numeric submission limit on Play (none is published).
- Whether D&B will flag a mailbox-type address; ask the mailbox provider if their addresses pass D&B.
- The Digital Goods API route for Play Billing inside a TWA is documented by Chrome; I have not built
  or tested it here.
- Flock the World's real sales. Only your Console knows.

---

## 9. HIS WORDS (Sep 21 2026, verbatim)

"we shoudl be posting another game on the google play store every day we can do so safely without risk
of flagging or stopping our account. everything we put out for a dollar can eventually start to
snowball and when i have a hundred games out, i should be makign some kind of money on the regular. im
assessing what the next best game to list should be and im leaning towards tumble or tiny world. i want
to have everything in tumble unlocked on my account to see how i ike it all and what needs improved, we
need songs picked out which i have and will do. were still brainstorming more expansions for tiny
world. i want a lot more animals, plants, and all kinds of things in all directions before we call it
done. we also have a lot of great games we should be considering a solid polish and push into the app
store for a dollar. how can we have our music interact with all the studio games we put up for sale?
itd be cool if they unlocked them to their phones or something and then i have a way to monetize it if
people start using my songs because they unlock them. theres a lot here and we have to work smart. also
my home address is on my google play store and that will need changed. theres a lot here. take your
time. we can play out heavy lifting work for opus to do whiole we do more planning"
