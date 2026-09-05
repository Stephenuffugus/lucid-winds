you seem to be encountering a lot of errors perhaps we should stop and rest. m,ake sure to commit, save, and push everythng # Engine 3 — Multiplayer Games (Lucid Winds)

The only two items in this batch that belong to the game studio. Both mint sunbeams. Both are legitimately Lucid Winds titles; the other seven products in the portfolio are not.

| Skin | Working name | Shape |
|---|---|---|
| A | Room-code party game | one shared screen + phones as controllers |
| B | Co-op daily puzzle | two players, asymmetric information, once a day |

Build order: **B → A.** B is far smaller, proves the pairing/sync layer, and has the better viral loop. A is a bigger swing that benefits from B's netcode being already battle-tested.

---

## Shared infrastructure

- Firebase Realtime Database (not Firestore) for live game state — lower latency, cheaper for high-frequency small writes, and the presence/`onDisconnect` primitives are exactly what room-based play needs.
- Firestore for durable stuff: sunbeam ledger, player profile, daily puzzle results.
- Sunbeam minting stays **server-authoritative via Cloud Function**, consistent with the existing economy. Clients never write balances. Do not weaken this for convenience.
- Anonymous auth for players; upgradeable to a real account without losing progress.
- Room codes: 4 chars, unambiguous alphabet, TTL so codes recycle.

---

## Skin B — Co-op daily puzzle (build first)

### Why this one
The Wordle-like space is saturated with solo-and-share and head-to-head. **Cooperative daily is nearly empty.** And the viral loop is structural rather than bolted on: the game is literally unplayable alone, so recruiting one other person is a game mechanic, not a growth hack.

### Core mechanic
You and one partner each see **half the information** and must converge on the same answer. Neither can solve it alone. Communication is constrained — that's the game.

Directions worth prototyping (pick one, don't build three):
- **Split grid:** each player sees alternating cells of a shared logic grid; you must deduce the full picture by describing what you see.
- **Clue trade:** each holds three clues; you may pass exactly one per round, so choosing *which* clue is the puzzle.
- **Convergence:** both must submit the same word from a shared associative prompt, with only limited hints exchangeable.

Constraint to protect: a session should run **3–6 minutes.** Daily habit products die when they get long.

### Async is mandatory
Requiring both players online simultaneously kills daily retention. Design for turn-based async first, with a live mode as a bonus when both happen to be present. Partner gets a nudge; play resumes whenever.

### Retention
- Streaks are per-**pair**, not per-player. This is the whole thing. A shared streak creates gentle social obligation and is far stickier than a personal one.
- Shareable result card — spoiler-free glyph grid, in the Wordle tradition.
- Sunbeams on completion; small bonus for streak milestones.
- Pair with more than one person; each pairing has its own streak.

### Open question
Is the puzzle content generated procedurally (infinite, cheap, risks feeling samey) or authored (better, but somebody writes 365 a year)? Recommend: procedural generator with a hand-authored curve, seeded by date so both players get an identical puzzle. Same approach as the existing hash-to-content work.

---

## Skin A — Room-code party game

### Why this one
Jackbox is $30 and the free web knockoffs are shovelware. The gap is real. Local, in-person, one screen, everyone's phone as a controller.

### Architecture
- **Host screen:** any browser — TV, laptop, tablet. Displays the room code and shared game state.
- **Controllers:** phones join at a short URL, enter the 4-char code, type a name. No app install, no account.
- Host is authoritative for game flow; RTDB is the transport. Handle host disconnect gracefully — a dropped host mid-round should not destroy the party.
- 3–8 players. Below 3 most party formats collapse; above 8 turn order drags.

### Content
Ship **one excellent mode**, not four mediocre ones. A drawing or prompt-answer format is the safest opener since both are proven and scale to any group.

Note: HUNCH already covers drawing-and-guessing. Consider whether this is the multiplayer home for that mechanic rather than a wholly separate title — that would be a significant scope reduction and reuses existing prompt content.

### Hard requirements
- **Zero install for guests.** The moment someone has to download something, the party moment is over.
- Rejoin after a phone locks or a browser tab dies. This *will* happen every session.
- Readable from ten feet away on the host screen. Test at actual couch distance, not at your desk.
- Works on a hotel wifi network with client isolation — meaning: everything routes through the server, no assumption of local peer discovery.

### Sunbeams
Mint on game completion for every participant, not just the winner. This is a social product; punishing the losers with nothing is bad for repeat play.
