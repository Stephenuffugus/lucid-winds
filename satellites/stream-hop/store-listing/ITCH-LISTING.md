# Jimothy — itch.io listing kit
_Everything to paste into a new itch.io project. Branded **Jimothy** by **Sky Wolf
Studios**, deliberately NOT "Lucid Winds" (there is already a Lucid Winds project on itch
by someone else — steer clear of it)._

---

## Project setup (the fields itch asks for, in order)

- **Title:** `Jimothy`
- **Project URL:** `jimothy` → `sky-wolf-studios.itch.io/jimothy`
  (make the account `sky-wolf-studios` if it does not exist yet — keeps the SWS branding)
- **Short tagline / "Short description":**
  `Jimothy the Jumping Nugget. Hop Seattle's roundest raccoon home to the feast.`
- **Classification:** Games
- **Kind of project:** for Tier 1 (link) → **"Downloadable" is wrong; use the
  external-link banner** — actually simplest is set it to **HTML** later; for the link-only
  page set **"This project is hosted elsewhere"** style by putting the Play button in the
  description. See "Two ways to publish" below.
- **Release status:** Released
- **Pricing:** **No payments — free.** Tick **"Yes, allow donations"** with a suggested
  amount of **$3** (see the money section at the bottom — this is the recommendation).
- **Genre:** Action → also tag as Arcade
- **Tags (itch lets you add ~10):**
  `arcade`, `endless-runner`, `frogger`, `crossy-road`, `casual`, `cute`, `animals`,
  `pixel-art` (it is not pixel art, but this is what people search), `singleplayer`, `mobile`
- **Community:** Comments on (free, easy engagement)
- **App store links:** leave blank for now (Play/Steam later)

---

## Cover image
- itch cover is shown at **630×500** (min 315×250). Use the ink-wash keyart.
  Source: `assets/jimothy-hero.png` (1254×1254 square) → crop/pad to 630×500.
  A ready file is generated at `store-listing/itch-cover-630x500.jpg`.

## Screenshots (upload 4–5, order matters — first is the thumbnail people scrub)
Fresh, current-build shots are in `store-listing/itch-shots/`:
1. `2-adventure.png` — a busy water crossing, Froggothy mid-hop (lead with gameplay)
2. `4-collection.png` — the costume wall (shows there is a lot to unlock)
3. `3-clear.png` — LEVEL CLEAR with stars
4. `5-rain.png` — Seattle rain on the water
5. `1-title.png` — the title / brand

## Feature banner (optional, itch shows it on some layouts)
`store-listing/feature-graphic-1024x500.jpg` already exists.

---

## Description (paste this into the itch rich-text editor)

> ### Jimothy the Jumping Nugget
>
> Meet Jimothy: Seattle's roundest, most beloved raccoon. Hop him across the rainy city
> — dodging traffic, riding dumpster lids and kayaks down the canal — home to the
> greatest dumpster feast in town.
>
> A hopper in the Frogger and Crossy Road tradition, built from a real Seattle
> neighbourhood up, with a raccoon who is genuinely trying his best.
>
> **What's in it**
> - 🦝 **44 characters to collect** — Jimothy in every costume (frog, shark, wizard,
>   astronaut, dinosaur…), the whole Seattle neighbourhood (crows, a coyote, an orca),
>   and secrets you have to find.
> - 🗺️ **A real campaign** across six Seattle neighbourhoods, plus Endless, a
>   daily seeded run everyone shares, a 60-second Rush, and a no-fail Zen mode.
> - 🎟️ **Costumes you earn, not buy** — one free costume for every seven days you show
>   up, and hidden codes tucked into posts and videos.
> - 🎵 An **original soundtrack** by the studio.
> - ☔ Weather that actually rolls in, feast trails, and a street sweeper on your tail.
>
> **Free. No ads. No energy bars.** Made by a one-person studio in the Pacific Northwest.
> A small optional Supporter Pack keeps the lights on, and never sells you an advantage —
> everything you can spend earns you a costume, never a leg up.
>
> 🎮 **Also plays on your phone** — add it to your home screen from the browser and it
> runs like an app, offline.

---

## Two ways to publish (matches the plan)

### Tier 1 — link page (fast, do this first)
Put a big button at the top of the description:
> ### ▶ [**Play Jimothy free in your browser**](https://lucidwinds.com/jimothy/)
Set the project **Kind** to whatever; leave no uploaded files; the page is a storefront
that sends players to the live game. You still get itch's browse traffic, an SEO backlink,
comments, and a devlog. Zero build work.

### Tier 2 — embedded playable (later)
Upload a self-contained zip so the game runs on the itch page itself. Build notes and the
one real risk (account sign-in inside itch's cross-origin iframe) live in
`store-listing/ITCH-BUILD.md`.

---

## 💵 Charge, or keep it free? — the recommendation

**Keep it free on itch, with donations on.** Reasoning:

- The game is **already free on the web** at lucidwinds.com/jimothy. A hard price on itch
  is pointless — anyone can play the same game free on your own site in one click. A
  price tag would just cost you players and reviews.
- itch's **"free / pay what you want"** is the exact match for how Jimothy already works:
  free to everyone, with an optional Supporter Pack for people who want to chip in. Set
  a **suggested donation of $3** so it mirrors the pack. itch handles the payment — no
  Stripe, no accounts, itch takes a small cut you set (default 10%, adjustable).
- **Save the paid model for Steam.** The roadmap's plan is right: Steam is where a
  one-time ~$2.99 price makes sense, because Steam players expect to pay and you get
  wishlists, the store algorithm, and a launch moment. itch is the free, low-friction
  audience-builder and wishlist funnel; Steam is the paid event.

**So:** free everywhere, optional support on the web (Supporter Pack) and on itch
(donations), paid only on Steam. One consistent story: _the game is always free; paying
is always a thank-you, never a gate._

⛔ Do not put the web Supporter Pack's card/crypto checkout inside an itch embed — itch
has its own payment rail and rules about external payment. If Tier 2 ships, hide the
in-game pack on the itch build (a one-line flag) and let itch's donate button do that job.
