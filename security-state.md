# Lucid Winds — Security State (Pre-Submission)
Last updated: 2026-04-28

This is the honest accounting of what's protected server-side vs. what
trusts the client. Read this before promising any economy guarantees.

---

## ✅ Protected server-side (Firestore rules + Cloud Functions)

### Pi entitlements — CANNOT be cheated
The `piApprove` + `piComplete` Cloud Functions write via the admin SDK.
Client cannot grant these without a real Pi server-validated payment.

- Greenhouse slot expansion (cap 60)
- Nursery slot expansion (cap 6)
- Nursery clipping slot (cap 5)
- Item pouch expansion (cap 40)
- Seed pouch expansion (cap 20)
- Emergency pouch (24h grant)
- Hut early-open (per-item)

### Field caps via Firestore rules
- `vaults/{uid}.lw_pouch_cap` ≤ 40
- `vaults/{uid}.lw_nursery_slots` ≤ 6
- `vaults/{uid}.lw_nur_clipping_slots` ≤ 5
- `vaults/{uid}/meta/state.slots` ≤ 100
- `vaults/{uid}/hashWallet/state.balance` ≤ 10,000,000
- `vaults/{uid}/hashWallet/state.totalEarned` ≤ 50,000,000
- `vaults/{uid}/feralPouch/state.collectedToday` ≤ 100
- `vaults/{uid}/feralPouch/state.maxDaily` ≤ 20

### Other rule protections
- `meta/accountCounter` — strict +1 increment only
- `wildDrops/{id}` — post-create field immutability (ownerUid, hash, lat, lng, zone, grade, wildBorn frozen)
- `friendCodes/{code}` — one-time create, no delete
- `feralSeeds/{id}` — server-only create, atomic claim only
- `leaderboards/*` — read-only for clients
- `piTransactions/{id}` — server-only write
- `events/*` — server-only write
- `marketplace listings` — sellerUid validation, status state machine

---

## ⚠ Trust-the-client (post-launch hardening)

### Counters / progression — client-authored
- LW_ACH counters (achievements/quests/milestones) — client increments
- Game completion → Sunbeam grant — client calls `_e('game_win')`
- Mystery box pity timer — client tracks
- Wild drop count — client tracks `_drops`
- Streak — client tracks
- Class / tree / hunt progress — client tracks

A determined attacker with browser dev tools can grant themselves
achievements, fake game wins, etc. The Firestore caps above stop
absurd values (10M Sunbeams, 100 ferals/day) but allow realistic-looking
fakery within those bounds.

### What an attacker CAN cheat (within bounds)
- Sunbeam balance up to 10M (~333k legit plants worth)
- Daily feral count up to 100 (legit max ~7)
- Achievement unlocks (no Sunbeam cap on achievement rewards individually)
- Streak length

### What an attacker CANNOT cheat
- Pi entitlements (Cloud Function gated)
- Greenhouse / Nursery / Item pouch / Seed pouch slot caps
- Other players' vaults (read-blocked)
- wildDrops grade tampering after create

---

## 🛣 Post-launch hardening roadmap

1. **Move game-win Sunbeam grants to Cloud Function** — biggest single fix
2. **Velocity check on hashWallet writes** — flag deltas > N per hour
3. **Cloud-Function-gated mystery box opens** — pity timer authoritative
4. **Wild harvest validation** — GPS + EA check via Cloud Function
5. **Daily cap on counter writes** — catch counter spam attacks
6. **Server-side achievement unlock** — verify check function on backend

None of these are ship-blockers. The caps + Cloud Functions cover the
catastrophic cases (a player cannot mint infinite Pi-paid items, cannot
DoS another player's vault, cannot grant themselves 999999999 Sunbeams).

---

## Rules deployment

Rules are in `firestore-rules-7.txt`. Deploy via:
1. Firebase Console → focus-grove-fffa8 → Firestore → Rules
2. Paste the file contents
3. Click Publish

Rules NOT auto-deployed by code pushes.
