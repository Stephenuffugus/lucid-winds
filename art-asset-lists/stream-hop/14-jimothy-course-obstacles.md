# JIMOTHY — Sheet 14: obstacles and set pieces for the 50 level course

Written 25 July 2026 against `COURSE-PLAN.md`. Everything here exists to make a
**designed set piece** possible that the current art cannot express. Nothing on this
list is decoration for its own sake.

## What we already have, so nobody paints it twice

- **26 road obstacles** banded by speed: EARLY (can, goose, rat, pigeons, bot, ducks) ·
  MID (scooter, skater, cyclist, dog, raccoon, leashdog, walker, salmon) ·
  LATE (sedan, taxi, van, espresso cart) · BIG (food truck, trolleybus)
- **13 water pads**: log, pallet, dumpster, lifering, crate, kayak, paddleboard, ring,
  duckboat, dock, salmonback, otterback, barge ferry
- **2 rails**: lightrail, monorail
- **6 zones**: Waterfront, Pike Market, Fremont, Capitol Hill, Interbay, Ballard Locks
- Sweeper wilt, steam vents, wave, 3 planters, 8 landmark eggs, fries and treasure

That is a good roster. The gaps below are specific.

---

## THE PROBLEM THIS ART SOLVES

**Every zone draws from the same obstacle pool.** Pike Market and Interbay are the same
traffic on a different coloured road. Six neighbourhoods currently look different and
*play* identical, and with levels cycling zones every 36 the repetition shows badly across
50 levels. Zone specific traffic is the single biggest win on this page: you should know
where you are by what is driving past you.

**The late and big bands are thin.** Four LATE vehicles and two BIG ones carry every level
past 25. That is the exact stretch the course plan is trying to make interesting.

**Hard patterns have no way to be fair.** A five row gauntlet is cruel without a telegraph.
Real Frogger design warns you: a signal changes, a light flashes, a horn sounds. We have
nothing that says "something is coming".

---

## PRIORITY 1 — ZONE TRAFFIC (6 sheets, one per neighbourhood)

Six sheets of **nine obstacles each**, 3 x 3, magenta #FF00FF, white divider lines, same
side on view and same ground line as the existing vehicles so they drop straight into the
lanes. Give each a rough width in the notes so I can set the hitbox honestly.

**14A — The Waterfront**
harbour tour boat on a trailer · luggage cart · seagull mob (low flying, wide) · ferry
foot passenger crowd · fish crate dolly · pedicab · Great Wheel maintenance cart ·
cruise ship shuttle bus · a stack of crab pots

**14B — Pike Market**
flying salmon mid air (wide, fast, funny) · flower bucket trolley · produce hand truck ·
busker with a guitar case · cheese wheel cart · newspaper stand on wheels · a tourist
family in a clump · fishmonger with a tray · the pig statue on a dolly

**14C — Fremont**
art car · rocket parts on a flatbed · dog walker with five dogs (very wide) · unicyclist ·
solstice parade float · Lenin statue on a low loader · a moving truck · a couch being
carried by two people · a swarm of scooters

**14D — Capitol Hill**
e bike courier · drag queen in heels crossing · coffee delivery trike · nightclub crowd ·
cat on a leash · record crate hand truck · a very long bendy bus · rideshare car with the
light on · a person carrying a houseplant taller than they are

**14E — Interbay**
forklift · shipping container on a truck (very wide, slow, heavy) · freight pallet stack ·
crane counterweight · hard hat crew walking · fuel bowser · a train of baggage trolleys ·
a low loader with a boat on it · loose oil drums rolling

**14F — Ballard Locks**
small sailboat on a trailer · sea lion (slow, wide, funny) · lock gate crew · kayak rack
truck · fish ladder inspector · a rowing eight being carried by eight people (extremely
wide, the single funniest hazard in the game) · marine crane · buoy on a cart ·
a heron taking off

## PRIORITY 2 — TELEGRAPH AND SIGNALS (1 sheet, 9 cells)

This is what makes a hard pattern **fair** instead of cheap, and we have none of it.

- crossing signal, red hand lit
- crossing signal, green walk lit (a second state, so it can change)
- railway crossing lights flashing, arm down
- railway crossing arm up
- amber warning beacon on a pole
- a horn or klaxon burst, drawn as a shape not an emoji
- speed limit sign that reads as "this lane is fast"
- a lane arrow decal for the road surface, one way
- a lane arrow decal, opposing

The two signal states matter most. A pattern that flips a signal a beat before the traffic
comes turns a gauntlet from unfair into readable, and it costs nothing to wire.

## PRIORITY 3 — WATER SET PIECES (1 sheet, 9 cells)

The hard end of the water game has no vocabulary. Everything is the same pad in a
different hat.

- a **narrow fast pad** that visibly reads as risky (a floating plank, thin)
- a **sinking pad** mid sink, so the sink state can be drawn before it is gone
- a boat wake or wash, drawn as a hazard band
- ferry terminal gangway, for the start and end of a crossing
- a mooring buoy, a tiny pad
- a log boom chain, two logs joined so they move as one unit
- a whirlpool or eddy, a moving hazard that lives IN the water
- a lock gate, closed, for Ballard
- a lock gate, open

## PRIORITY 4 — RAIL AND FREIGHT (1 sheet, 6 to 9 cells)

`railyard` and `tram-and-traffic` are two of the best set pieces in the plan and there are
exactly two rail sprites.

- freight locomotive, front
- freight wagon, tileable middle
- freight wagon, tail
- a level crossing surface for the road texture
- rail signal, stop
- rail signal, clear
- (optional) a handcar, for a slow rail lane at low tiers

Tileable middle wagons are the point: a freight train can be any length, and a very long
one crossing a level is a genuine set piece.

## PRIORITY 5 — LANE SURFACES (1 sheet, 6 cells, tileable)

Right now a boulevard and an expressway are the same grey. Surfaces let a lane announce
what it is before you step on it.

- painted centre line, double yellow, tileable
- lane dashes, tileable
- tram tracks set into the road, tileable
- cobbles, for Pike Market, tileable
- dock boards, tileable
- a painted crosswalk, tileable

## OPTIONAL — TWO MORE ZONES

Zones cycle every 36 levels, so by level 40 the player is on their second lap of the same
six. Two more would push the first repeat past level 48. Only worth it if the rest lands.

- **Georgetown** — industrial, murals, dive bars, planes overhead from Boeing Field
- **Alki Beach** — sand, volleyball, beach cruisers, the skyline across the water

---

## FORMAT (same as every sheet so far)

- 3 x 3, magenta #FF00FF background, white divider lines between cells
- Side on, same camera and same ground line as the existing vehicles
- One sheet per file, named for its section (14A, 14B and so on)
- Anything meant to tile must tile cleanly left to right
- Note a rough width for each item, in "about as wide as a sedan" terms is fine

## GENERATE ORDER

1. **14B Pike Market** and **14E Interbay** first. They are the two most different from
   each other, so they prove the zone traffic idea works before you paint four more.
2. Telegraph and signals. Small sheet, unlocks fair difficulty everywhere.
3. Water set pieces.
4. The remaining four zone sheets.
5. Rail and freight.
6. Lane surfaces.
7. The two extra zones, only if you want the campaign to run past level 48 without
   repeating scenery.

⛔ Nothing here gets painted until the course plan itself is approved. If the pattern
system changes shape, half this list changes with it.
