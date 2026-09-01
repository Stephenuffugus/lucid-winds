# CONDUIT — design addendum 1: the prowl layer

**Why this document exists.** The original spec described a superb planning
layer and, on re-reading, almost no *sneaking* layer. It says "you do not
carry weapons" and moves straight to wiring. It never answers the most
basic question a Splinter Cell player asks in the first ten seconds:
**what can I do with my own body, right now, without opening a menu?**

Before this addendum the answer was: move, and squeeze, and force a door.
Everything else happened in Flow mode. That is why prowl felt empty and
why the devices read as inert boxes.

This addendum fixes that. It is now part of the spec.

---

## 1. The rule that keeps both layers alive

**Direct verbs handle one isolated problem. Wiring handles a watched one.**

Every direct verb must be cheap, immediate, and *only viable when nobody
is looking*. The moment a target has a witness, a second patrol, or an
open sightline, the direct verb becomes suicide and the wire becomes the
answer. If a direct verb ever solves a guarded problem, it has broken the
game and its numbers are wrong.

This is the same shape as Splinter Cell: you *can* grab a lone guard, and
you would never try it in a lit room with two more watching.

---

## 2. The verbs

### Smother (built) — the takedown
Flow over an unaware enemy and hold. Two seconds, immobile, fully visible
the whole time.

- Requires **mass ≥ 40**. A thin body cannot smother anything, so going
  thin to sneak means giving up your ability to kill by hand.
- Costs **8 mass**. Yields the body's full harvest, so it nets positive —
  the cost is the *risk window*, not the economics.
- Only on an **unaware** target (not hunting you, spot progress < 0.5).
- Once it lands, **the target cannot escape**. Its senses stop. The danger
  is entirely the two seconds you spend held in place in front of everyone
  else on the site.
- Brutes are immune. Too much of them.

### Tap (built) — the whistle
A knock at your own position. Costs 2 mass, 7-tile radius, 3s cooldown.
Pulls any non-hunting patrol to **you**, which is the point and the risk:
you have to already be somewhere they cannot see. This is the free-hand
version of the speaker, weaker and always available.

### Drink a light (built) — shooting out the bulb
Lights burn pools of exposed floor into otherwise shadowed rooms. Flow
onto one and drink it for 3 mass: the pool becomes shadow permanently, so
every future route and approach through it is cheaper and safer. Makes a
small noise. This is the fluid's version of the classic dark-making verb,
and it interacts directly with the conduit exposure system — you are not
just hiding yourself, you are downgrading a whole tile group from
"exposed" to "shadowed" for wiring purposes too.

### Bodies are evidence (built)
A guard who walks within 1.6 tiles of an unharvested corpse with line of
sight escalates the site straight to **Alarm**. Harvesting is now also
*disposal*, which is exactly the tension Splinter Cell gets from body
dragging: the kill is not finished until the body is gone. Bodies still
decay in 30s, so waiting is an option — a nervous one.

### Still to build (M2–M3, in priority order)

1. **Drag a body** — move a corpse to shadow before it is found. Slow,
   loud, and it keeps your hands full. The single highest-value addition.
2. **Peek** — extend a tendril around a corner for 1 mass/sec held; see
   without exposing the body. The lean/mirror verb.
3. **Cling** — flow up a wall onto a ceiling or ledge. Halves your spot
   profile, costs nothing, but you cannot lay wire from up there. Enables
   the drop takedown.
4. **Pool** — hold still with no input for 1.5s and flatten. Spot time
   doubles, movement is halved until you break it. The "hide in shadow"
   verb, made physical.
5. **Drag a battery cart** — already in the spec, still unbuilt. Moves the
   *source* instead of extending the wire.

---

## 3. Device legibility (the "SPK box does nothing" problem)

Two real faults, both now fixed:

1. **The speaker was unreachable and out of range.** It sat 18 tiles from
   the only enemy who could hear it, behind a force door, with a lure
   radius of 13. It could never do anything. It is now at (14,11) inside
   the trap room with a 12-tile radius, so it can pull the sentry onto the
   plate. That makes the full three-device chain real: *sprinkler wets →
   speaker pulls him in → plate kills*.
2. **Nothing told you what a box was.** Devices now print their power
   requirement on the map when unpowered, and tapping any device or source
   in Flow opens a card: what it needs, what it does, and why it is not on.

**Rule for every future device:** if a player cannot learn what it does by
tapping it, it does not ship.

---

## 4. Source capacity is now a shared budget

Previously each device checked the source capacity independently, so one
socket could run unlimited devices. A source's capacity is now a budget
shared across everything it feeds. The socket (30) runs the sprinkler (20)
**and** the speaker (10) — exactly, with nothing spare — or one of them
plus something else. The generator (100) is the only thing that can run
the plate (40).

This turns "which source" into a real decision instead of a formality.

---

## 5. What this does to the ship gate

The gate question is unchanged but now has a second half:

> Is route → trigger → harvest → reclaim fun with rectangles?
> **And is the minute between those moments fun?**

If prowl still feels empty with smother, tap, drink and corpse-evidence in
place, the problem is the movement itself, not the verb list — and the fix
is in feel (M2), not more verbs.
