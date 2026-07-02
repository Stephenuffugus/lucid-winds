# LUCID WINDS — THE STEP BY STEP LAUNCH PLAN
# The one we run when Stephen says "let's get started."
# Started 2026-07-01. Voice rule everywhere: warm, human, dad angle where it fits, ZERO en/em dashes.
# Companion docs: PROMOTE_PLAYBOOK.md (strategy), MONETIZE_FIAT_PLAN.md (money), PAYMENT_GOLIVE.md (crypto).

## THE ONE LINE
Get Lucid Winds seen and played everywhere, starting with the free games portal
(lucidwinds.com/portal/), using near zero cash, then turn that reach into income.

## WHEN YOU SAY "LET'S GET STARTED"
We begin at Step 1 of the checklist at the bottom and go in order. You never have
to remember what is next. It is written here. We do one step, confirm it works,
then move to the next.

---

## THE BIG IDEA STEPHEN ADDED (2026-07-01, do not lose this)
Reach people in the real world, in the places they already gather, with a flyer and
a QR code that opens the free portal in one tap. Salt Fork Lodge in Ohio was the
spark: a big national park lodge full of older folks playing cards everywhere. The
front desk gave Stephen the email of their marketing lead. That got him thinking
about a whole channel we had not tapped:

Venues to seed with flyers + QR codes:
- Hotels and lodges (card players, families killing time, rainy day activity)
- Nursing homes and senior communities (keeping minds active and social)
- Libraries (kids and teens, STEM, safe screen time) [already in motion, see leads]
- Summer camps and youth programs (STEM, group play)
- Bars and cafes (game nights, trivia crowd, waiting for a table)

The angles that make people WANT to share it:
- For kids: STEM, focus, pattern solving, problem solving, healthy screen time
- For older folks: a fun way to keep the mind active and engaged, and social
- For everyone: cozy, calming, one of a kind art you get to keep, free, no signup

Plus: reward individuals who spread the word. Give real people a unique link and a
unique reward for getting others playing. Ambassadors, not ads.

---

## PHASE A: MAKE THE FUNNEL SOLID (so nothing we send leaks)
Everything we do points at the portal, so the portal has to work on the first tap
and every shared thing has to point at it.

- A1. Pre-flight the portal from a real phone, in the Instagram and TikTok in-app
  browsers. Confirm lucidwinds.com/portal/ loads fast with no LiteSpeed 403 bot
  page. If it 403s, that is a Hostinger panel toggle and it is the only thing that
  matters until fixed. (Stephen, 5 minutes.)
- A2. Get Grow Your Name live at lucidwinds.com/name/. Already built and tested,
  sitting safe on the branch growth/grow-your-name. Merge and deploy when ready.
  (Together, 5 minutes.)
- A3. Confirm the share-to-portal fix is live (already built: every shared plant
  and referral now points at /portal/ instead of the signup wall).
- A4. Add a QR code to /portal/ onto the plant share card and onto Grow Your Name.
  (Agent build, small, deferred one step because it needs a tiny QR encoder.)
- A5. Fix the satellite back-button bug (found 2026-07-01, reproduced on Sixfold AND
  Skitterlings). Symptom: playing a studio game in the portal, you hit the game's
  own X expecting its menu, land on a black screen, and a second X drops you to the
  portal. Cause: all the featured studio games (Sixfold, Skitterlings, Glyph Forge,
  Sweet Spot, Tarot Run, Letter Launch, Tomato Man, Brawl) are separate github
  projects loaded in a portal window. Their own back button, while embedded,
  navigates the game to a blank page instead of its menu. The second X is the
  portal's exit button (the one that actually works). The portal cannot fix a game
  it only borrows, so:
    - A5a. Fix the two studio games that DO live in this repo first, as the working
      reference: satellites/hues/ (Hue Match) and satellites/shell-shuffle/. In
      embed mode the in-game X should return to that game's own menu, and only an
      exit-from-menu closes to the portal. Verify before changing (audit first).
    - A5b. Write one copy-paste snippet + the portal's message protocol so Stephen
      drops it into each external studio project (sixfold, skitterlings, etc.) so
      their embedded back button returns to their menu or cleanly exits, never blank.
    - A5c. Portal polish: make the exit button clearly read "Exit game," and have
      studio games hide their own X while embedded so there is ONE obvious exit.
  Why it is in Phase A: a broken back button makes people quit on the first try, so
  it has to be smooth before we drive traffic here.

## PHASE B: THE PHYSICAL WORLD PUSH (Stephen's flyer idea)
- B1. Agent designs a small set of print ready flyers, one per venue type, each with
  a big friendly QR code to the portal and a short warm line. Half page and quarter
  page so they are cheap to print and easy to leave on a counter or a table.
- B2. Each flyer gets its OWN tracked link (for example /portal/?v=saltfork or a
  short code) so GA4 shows which venue actually sends players. No guessing.
- B3. Stephen prints a batch and leaves or mails them: the lodge, a local library, a
  senior center, a cafe, wherever he already goes. Start with five real places.
- B4. Read the numbers after two weeks. Double down on the venue type that worked.

## PHASE C: PARTNERSHIPS (turn a venue into a channel)
- C1. Salt Fork Lodge: agent drafts a warm, short email to their marketing lead
  (Stephen has the address, paste it in when ready). Frame it as a free, cozy,
  brain healthy activity for their guests, especially the card and puzzle crowd, and
  a co-branded QR they can put in rooms or the lobby. Offer a tracked code so if it
  ever drives paid upgrades, we can talk revenue share then. Do not lead with money.
  Stephen sends and owns the relationship.
- C2. Library follow-up: the two Akron-Summit youth-services women have not replied.
  Agent drafts one gentle, no-pressure second note (a single follow-up, then we let
  it rest). Stephen sends.
- C3. Build a simple, repeatable "partner kit": one email template, one flyer, one
  tracked QR, so the next hotel or library or senior center takes ten minutes, not a
  from-scratch effort each time.

## PHASE D: AMBASSADOR REWARDS (Stephen's "unique rewards for promoting" idea)
- D1. Design a simple ambassador program: a person (or a venue activities director)
  gets a unique link and code, and earns a real reward when people they bring in
  actually play or make an account. Rewards can be in-game (exclusive plants,
  currency, a special badge or title like Regional Gardener) so it costs us almost
  nothing.
- D2. Make it abuse resistant: reward on real plays or first plant, deduped per
  device, capped, so it cannot be farmed. (We already have a referral code system in
  the app to build on.)
- D3. Needs one economy ruling from Stephen on the exact reward, and a small build.
  Park the build until the flyer and partner channels show this is worth wiring.

## PHASE E: THE ONLINE REACH ENGINE (runs in the background the whole time)
- E1. Video: one recording every two weeks cut into about ten short clips, posted to
  Reels and Shorts first (and TikTok). Agent cuts and captions, Stephen records and
  posts. Hooks: the plant that draws itself, "comment a name and I will grow it,"
  the haiku, and the solo dad build story.
- E2. One "detonation": a warmed-up Show HN plus posts to the procedural-art
  communities, leading with the SHA-256 one of a kind story. Permanent backlinks,
  which is the real "seen everywhere" lever, and it is AI-backlash proof.
- E3. Pi community ambassadors in the strong regions (Philippines, Vietnam, Nigeria,
  Indonesia, Brazil). Frame as a beautiful free game in the Pi ecosystem.

## MONEY (runs alongside, see MONETIZE_FIAT_PLAN.md)
Fiat first: Ko-fi tips (dad story) and printed keepsake plant cards. Portal ad
rev-share on the free games is the real near-term engine. The built crypto rail is a
parallel afternoon flip. Never lead cozy marketing with crypto. Never say NFT.

---

## WHO DOES WHAT
- Stephen (only he can): record video, publish, all relationships (the lodge, the
  library, ambassadors), print and place flyers, run the payment go-live, and rule on
  rewards and pricing.
- Agent (prep only, never publishing): design flyers and QR links, draft every email
  and post and caption, cut video clips, research venues and creators, build the
  pages and the ambassador wiring, and report the numbers each week. No auto-posting,
  no auto-DM, no fake engagement. Those burn the goodwill that is the whole strategy.

## GUARDRAILS (protect Stephen)
- HEALTH CLAIMS: we can say "keeps the mind active and engaged," "a fun way to stay
  sharp," "good for focus and problem solving," "screen time that is actually good
  for you." We do NOT claim it prevents, treats, or reverses dementia or cognitive
  decline. Keep it honest and warm, never clinical or medical.
- Kids and libraries: always land them on the portal (no signup, no GPS, no crypto),
  never the account-walled root.
- Cloud sync must be fixed before any purchase that grants an in-game unlock.
- 90/10 in communities: nine genuine contributions per one promo.
- No en/em dashes in any copy, ever.

## OPEN LEADS (do not lose)
- Salt Fork Lodge (Salt Fork State Park, Ohio): Stephen has the marketing lead's
  email from the front desk. Paste it in and we draft the note. Long shot, worth it.
- Akron-Summit library youth-services contacts: reached out, no reply yet. One gentle
  follow-up pending.

---

## THE CHECKLIST (this is where "let's get started" begins)
Do these in order. One at a time.

1. [Stephen] Phone pre-flight of lucidwinds.com/portal/ in the IG and TikTok in-app
   browsers. Tell me pass or fail.
2. [Together] Merge the branch and deploy so Grow Your Name and the share fix go
   live. Verify /name/ works on your phone.
3. [Agent] Design the first flyer (lodge and card-player angle) with a tracked QR to
   the portal, print ready. Stephen reviews.
4. [Agent] Draft the Salt Fork Lodge marketing email and the library follow-up.
   Stephen sends both.
5. [Agent] Build the QR-on-share-card so every shared plant is scannable.
6. [Agent] Make flyers for the other venue types (senior center, library, cafe, camp)
   from the same template.
7. [Stephen] Print a batch and place them in five real places.
8. [Together] After two weeks, read the numbers, pick the winner, and design the
   ambassador reward around whatever channel is working.
9. [Background, ongoing] The video engine and the one HN detonation.

That is the whole path. We do not have to see the end from here. We just do Step 1.
