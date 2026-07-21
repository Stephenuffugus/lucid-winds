# JIMOTHY — Seattle Expansion Asset List (things to dodge, pads, backgrounds, skins, critters)

> The detailed, prompt-ready asset list Stephen asked for. Grounded in **who Jimothy really is**
> (Jimothy Johnson, the round Ballard raccoon with short spine syndrome who went viral July 14 2026,
> "Hot Jimothy Summer," 10M+ views), authentic Seattle/Ballard scenery, and what makes Crossy-Road /
> Frogger hoppers fun + sticky. Each numbered **SHEET** is one Midjourney prompt pack. Counts are called
> out so you know exactly how much to make.

## THE RULES (same as the rest of the pack)
- **Sprites:** magenta **#FF00FF** knockout background, ONE clear subject per cell, no text/logos/watermarks
  on sprite cells, soft baked contact shadow OK. Cut with `scripts/cut_jimothy.py`.
- **Backgrounds:** full-bleed painted scenes (NOT knockouts), portrait or seamless strips as noted.
- **Style — "Rainy Seattle Nocturne" (match the pack we already shipped):** detailed hand-painted ink /
  gouache illustration, chonky and characterful, warm gold rim-light from streetlamps and neon, wet-street
  reflections, perpetual light drizzle, deep teal-black shadows. Kid-friendly and affectionate, never
  menacing — Jimothy is a gentle folk hero, so keep the whole world warm even when it's dark and rainy.
- **Jimothy's canonical look** (keep consistent everywhere): **round/spherical torso, NO visible neck, head
  perched HIGH above the shoulders, long skinny limbs, stubby tail** — fans say he looks "scrunched like an
  accordion." Lean into round + tall-headed.
- Under ~150KB per cut cell; path-version files (`?v=LW_VERSION`).

## WHAT WE ALREADY HAVE (so you don't remake it)
- **Dodge:** rat, Canada goose, rolling coffee can, tumbling trash bags. **Pads:** dumpster-lid, pallet, log,
  box-raft ferry. **Coin:** golden bottlecap. **Power-ups:** coffee(dash), umbrella(shield), snacks(magnet).
- **Hero:** 20 Jimothy poses (hop cycle + dash/shield/magnet/dizzy/splash/cheer + unused run/sit/eat/scared).
- **Backgrounds:** 5 neighborhood color palettes + subtle lane textures + 6 perspective scenes (intro/menu).
- **The expansion below roughly TRIPLES the dodge variety and adds the collection meta that drives retention.**

---

# PRIORITY 1 — MORE THINGS TO DODGE (the #1 ask)

## SHEET 10 — Street Vehicles (7 cells) 🚗 road-lane hazards
One sheet, grid **4×2** (7 used + 1 spare), each a **side-profile vehicle** that crosses a road lane
left/right (we flip by direction). Seattle-specific so every one gets a knowing laugh.
1. `veh-metro-bus` — a King County **Metro trolleybus**, articulated (two segments), overhead trolley-pole
   wires, night-route lit windows. The big slow unavoidable blocker.
2. `veh-delivery-van` — a blue **Amazon-style delivery van** (Seattle is Amazon's town), back door ajar.
3. `veh-taxi` — a rideshare/**taxi with a lit roof sign**, wet reflections.
4. `veh-food-truck` — a **food truck** with a serving window + menu awning (teriyaki/coffee).
5. `veh-escooter` — a **Lime-style e-scooter** with a wobbling rider (erratic, fast, small).
6. `veh-bike-messenger` — a **spandex cyclist / bike messenger** leaning low, bell.
7. `veh-skateboarder` — a **skateboarder** in a beanie, mid-push.
   (spare cell: a police cruiser or a classic sedan for speed variety.)

## SHEET 11 — Seattle Animal Hazards (6 cells) 🐦 living dodgeables
Grid **3×2**, each a critter that crosses or strikes. Movement personality noted for wiring.
1. `anm-crow` — a glossy **crow** mid-dive (Seattle crows are famously aggressive + remember faces);
   telegraphed shadow → diagonal swoop. Aerial hazard.
2. `anm-dog` — an **off-leash dog** straining on a stretchy leash (the leash is a moving tripwire); callback
   to Jimothy drinking from a dog's water bowl.
3. `anm-rival-raccoon` — a **normal long-bodied "trash panda"** (lean, low, long) charging a lane — the visual
   gag against round Jimothy ("in a world full of trash pandas, be a Jimothy").
4. `anm-otter` — a **river otter** sprinting low + slippery (water-lane darter).
5. `anm-pigeon-flock` — a **scatter of city pigeons** that bursts up (a low, wide, brief flurry).
6. `anm-heron` — a **great blue heron**, statue-still then stabbing (telegraphed edge hazard on canal lanes).
   Elegant, very PNW.

## SHEET 12 — Rainy-Street Hazards (6 cells) 🌧️ environmental, atmosphere-heavy
Grid **3×2**. These sell the wet nocturne mood and add rhythm without new vehicles.
1. `haz-puddle-splash` — a wide **puddle wave** kicked up by a passing car (knockback, not death).
2. `haz-steam-vent` — a **street/sewer steam burst** erupting on a timer (time your hop).
3. `haz-coffee-slick` — a **tipped espresso cart + spreading latte slick** (slippery lane; Seattle coffee).
4. `haz-recycle-bin` — a **rolling recycling bin** tumbling across a lane.
5. `haz-construction` — a **construction cone + jackhammer/forklift** cluster ("city of cranes," eternal
   Seattle construction). (We also already have a lone `obs-cone`.)
6. `haz-produce-spill` — a **Pike Place produce avalanche** (rolling apples/oranges from a tipped stall).

## SHEET 13 — The Rail Lane (2 cells) 🚆 the "train" hazard
The classic Crossy-Road/Frogger train, localized. Grid **2×1**, each a **long, fast, instant-kill** crosser
telegraphed by warning lights + a rising hum. Use sparingly between safe rows.
1. `rail-link` — a **Link light-rail / Sounder train** car (repeats to any length in engine).
2. `rail-monorail` — the **Seattle Monorail** (elevated, retro-futuristic) for a marquee set-piece lane.

---

# PRIORITY 2 — RIDEABLE PADS (grow the 4 we have to ~10)

## SHEET 14 — Water Pads & Living Pads (8 cells) 🛶
Grid **4×2**. Vary width + how tippy so lanes read differently. Two are **diving pads** (Frogger turtle
trick — they carry you but SUBMERGE on a timer; linger and Jimothy drops in the drink).
1. `pad-kayak` — a **Lake Union kayak** (narrow, tippy, precise — raises difficulty).
2. `pad-paddleboard` — a **SUP paddleboard** (flat, medium, slow).
3. `pad-innertube` — a **round inner-tube / pool floatie** ("Hot Jimothy Summer," matches his round body — a
   bouncy small pad).
4. `pad-ferry` — a **Washington State Ferry** deck section (big green-and-white, **multi-tile wide + slow** —
   the iconic Puget Sound crossing; carries him far).
5. `pad-duckboat` — a **Ride-the-Ducks amphibious tour boat** (goofy, wide, safe; beloved retired Seattle icon).
6. `pad-marina-dock` — a **floating marina dock / finger pier** with cleats + coiled rope (sturdy medium).
7. `pad-salmon` *(diving pad)* — a big **leaping salmon** he rides downstream; surfaces on a rhythm. Ties the
   whole "Salmon Run / dumpster feast" throughline together.
8. `pad-otter` *(diving pad)* — a **dozing river otter / sea-lion raft** he rides briefly before it dives.

---

# PRIORITY 3 — POWER-UPS (grow 3 → ~8)

## SHEET 15 — Power-ups (6 new pickups + 6 HUD glyph discs) ☕ grid 6×2
Row 1 = **board pickups** (chunky glowing tokens, like the coffee/umbrella/snacks we have). Row 2 = the same
6 as **simple HUD disc glyphs** (bold, readable at 30px).
1. `pw-salmon-feast` — a **caught salmon** = one-time **REVIVE / extra life** (the "dumpster feast" payoff; the
   best-feeling rescue). Gold glow.
2. `pw-rain-boots` — **galoshes / rain boots** = brief **puddle & shallow-water walk** immunity. Blue glow.
3. `pw-espresso` — a **double-espresso shot** = a **longer, jittery dash** (stronger cousin of coffee). Amber glow.
4. `pw-hi-vis` — a **reflective hi-vis vest** = cars **slow down for you** a few seconds. Yellow-green glow.
5. `pw-crossing-signal` — a **walk-signal / crossing button** = **freezes traffic ~3s**. White glow.
6. `pw-neon-glow` — a **streetlamp / neon halo** = **lights up hazards further ahead** (huge in the dark
   nocturne; helps you read the level). Warm glow.
   ⚠️ We looked at a **Slim Jim** dash (the brand literally joined his comments, and "Jim" is in Jimothy) —
   great gag but it's a real trademark, so **hold on brand tie-ins until we clear usage.** Left it off this sheet.

---

# PRIORITY 4 — BACKGROUNDS (are we missing some? yes — one signature backdrop per neighborhood)

Right now gameplay is procedural palettes + subtle lane textures with **no scene backdrop**. Add **6 full-bleed
nocturne backdrops**, one per level, layered behind the lanes (distant, low-contrast so the gameplay pops).
Rain streaks, streetlight halos, neon-in-puddle reflections on every one.

## SHEET 16 — Neighborhood Parallax Backdrops (6 scenes, portrait 1080×1920, JPG, NOT knockouts)
1. `bg-waterfront` — **Seattle Great Wheel** lit + color-cycling on Pier 57, container cranes, ferries on
   Elliott Bay, sea-lions on the pilings.
2. `bg-pike-market` — the red neon **"Public Market Center" clock sign**, tiered produce stalls, ice + salmon
   on display (sets up the fish-toss), a peek of the Gum Wall.
3. `bg-fremont` — the **Fremont Troll** clutching its real VW Beetle under the Aurora Bridge, the **53ft Rocket**
   + "De Libertas Quirkas," Gas Works silhouettes, houseboats.
4. `bg-capitol-hill` — the **Pike/Pine neon nightlife strip**, murals, string lights, rainbow crosswalk — the
   most saturated, colorful level.
5. `bg-interbay` — the **Balmer rail yard** under orange sodium lights, signal masts, containers, Magnolia
   Bridge overhead, Space Needle + Mount Rainier faint on the fog horizon. The grittiest.
6. `bg-ballard-locks` *(finale flavor)* — the **Ballard Locks + salmon fish-ladder**, moored Nordic fishing
   fleet, crab pots, gulls on pilings. This is Jimothy's real home + the "greatest dumpster feast" payoff.

---

# PRIORITY 5 — JIMOTHY SKINS + THE CHARACTER COLLECTION (the retention meta)

The single biggest thing that makes hoppers sticky is **collecting characters** (Crossy Road shipped hundreds;
Disney Crossy Road 400+). This is a "collect them all" wall that outlasts any run. We start small and grow forever.

## SHEET 17 — Jimothy Costume Skins (8) 🦝 the fan-favorite unlocks
Each is Jimothy in his canonical round shape wearing a costume. **For each skin I need his 4-frame hop cycle
(idle / crouch / leap / land)** so it drops into the hero system — so this is really 8 mini-sheets of 4, OR
start with just the **idle+leap** two-frame version per skin if that's faster. 2-3 of these can also swap the
world palette when equipped (cheap visual-variety multiplier).
1. `skin-hot-summer` — **"Hot Jimothy Summer"** shades + a tiny floatie ring.
2. `skin-soggy` — **Soggy Jimothy**, drenched + a dripping newspaper hat.
3. `skin-ballard-nordic` — **Nordic-sweater Jimothy**, fair-isle sweater + beanie (Ballard heritage).
4. `skin-barista` — **Barista Jimothy**, apron + to-go cup (passively buffs coffee-dash).
5. `skin-fishmonger` — **Fishmonger Jimothy**, rubber apron + salmon in mouth (Pike Place).
6. `skin-rich-uncle` — **Rich Uncle Jimothy**, tiny monocle + top hat (premium "Support the Studio").
7. `skin-dr-jimothy` — **Dr. Jimothy** grad cap + tiny diploma (UW gave him an honorary doctorate; brief
   invincibility flavor).
8. `skin-ghost` — **Ghost Jimothy**, translucent glow (secret/spooky unlock).

## SHEET 18 (+ growing) — Seattle Critter Roster — First Wave (12) 🐾 collectible playable characters
These REPLACE Jimothy as the hopper you play (same hop cycle). Target **50-70 eventually across 5 rarity tiers**
(Common / Rare / Epic / Secret / Support-the-Studio); this is the first batch. Each needs the **4-frame hop
cycle** (or 2-frame idle+leap to start). Give each neighborhood a signature unlock.
Wave 1: `char-crow`, `char-seagull`, `char-river-otter`, `char-harbor-seal`, `char-salmon`, `char-banana-slug`,
`char-opossum`, `char-skunk`, `char-coyote`, `char-heron`, `char-city-pigeon`, `char-orca` (water-only, fun).
Later waves (spec on request): PNW-legend **secret** characters (Sasquatch, the Fremont Troll, a Rainier
mountain goat), culture NPCs (Pike Place fishmonger, ferry captain, flannel grunge busker), and more.

---

# PRIORITY 6 — POLISH: easter-eggs, collectibles, signs (nice-to-have)

## SHEET 19 — Landmark Easter-Egg Props (8, sprite knockouts, background decor)
`egg-rachel-pig` (Pike Place brass pig — touch = bottlecap jackpot), `egg-fremont-dog` (the costumed
"Waiting for the Interurban" dog, rotating outfits), `egg-lenin` (Fremont Lenin statue with ironic lights),
`egg-gumwall-chunk`, `egg-space-needle-charm`, `egg-ferry-token`, `egg-rainier-tallboy-tab`,
`egg-orca-charm`. The last four double as a rare **"trash treasure" collectible set** (a 2nd collection axis
for completionists; feeds secret-character unlocks).

## SHEET 20 — Readable Signs & Slogans (scenery text is OK here) 🪧
Painted scenery signs Jimothy hops past (text allowed since these ARE signs, not sprite watermarks):
**"Hot Jimothy Summer," "In Jimothy We Trust," "Protect Him At All Costs," "In a world full of trash pandas,
be a Jimothy," "Keep Seattle Weird," "silly little guy,"** plus Ballard/"NW Market St"/"Public Market"/brewery
signage. Small horizontal sign props + a couple of mural panels.

---

# DESIGN NOTES (not art — but this is where the retention is, worth knowing)
The genre research was clear that the art above only pays off if a few systems exist to chase it. We already
have most of the bones:
- **Anti-idle predator ✅ (we have it):** the dive-bombing seagull already ends a run if you dawdle — this is
  the genre-defining "Crossy Road eagle." Sheet 11's crow can be its meaner escalation.
- **Endless "go further" loop ✅ (we have Endless):** the proven day-2 retention driver; the new critters +
  coins feed it.
- **Daily challenge ✅ (we have Daily):** a fixed-seed run + leaderboard is the "Pecking Order" hook.
- **The gap = the COLLECTION meta.** To make the 50-70 critters matter we'd wire a "Prize Bin" unlock (earn
  bottlecaps → pulls), secret-character triggers, and 2-3 skins that swap the world palette. That's the build
  that turns a fun toy into a daily habit — flag if you want me to design + build it.
- **Pad/hazard duality** (the diving salmon/otter pads) adds depth to water lanes cheaply.

# HEADS-UP (two things worth knowing)
1. **There's already a fan-made Jimothy game** floating around (Axios noted it). We're not first, so leaning
   into the authentic Ballard lore + the polish we've built is how we stand out.
2. **Brand tie-ins (Slim Jim, Amazon, Lime, etc.):** using them as *background flavor / caricature* is normal
   parody, but I kept **branded power-ups off the shippable list** until we decide how careful to be. Your call.

# SUGGESTED ORDER TO MAKE THEM
1. Sheet 10 (street vehicles) + Sheet 11 (animals) + Sheet 12 (rainy hazards) — the "more to dodge" you asked
   for, biggest gameplay impact, drops into the existing obstacle system fastest.
2. Sheet 14 (pads) + Sheet 15 (power-ups) — deepen the crossings + the toolkit.
3. Sheet 16 (6 backdrops) — the visual leap; makes each neighborhood unmistakable.
4. Sheet 17 (skins) + Sheet 18 (critters) — the collection meta; make as many as you enjoy, forever.
5. Sheets 13 / 19 / 20 — rail, easter-eggs, signs — polish.

Ping me the moment any sheet lands and I'll cut + wire it (same border-flood pipeline). Tell me the exact
counts/renames you settle on and I'll match the game hooks to them.
