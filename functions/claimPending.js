/**
 * Sky Wolf Studio — Sunbeam pending → vault claim.
 *
 * Why this exists:
 *   External constellation games (Sweet Spot, Glyph Forge, etc.) earn
 *   sunbeams anonymously into a local bucket while the player is signed
 *   out. When the player signs in (or signs up), the SDK calls this
 *   function to reconcile the local bucket into the player's server
 *   ledger. Because anonymous accrual is fundamentally low-trust, the
 *   server caps how much it will accept and silently discards excess.
 *
 *   The two cap constants are PRIVATE and intentionally not echoed in
 *   error messages or response payloads — only `credited` and
 *   `discarded` totals are returned. The portal/SDK should NEVER expose
 *   the caps to player-facing UI.
 *
 *   Plant minting stays on the existing `mintPlant` Cloud Function and
 *   is unchanged.
 *
 * Client call:
 *   const fn = httpsCallable(functions, 'claimPending')
 *   await fn({ pending: 42, anonId: 'anon-uuid', gameId: 'glyphforge' })
 *
 * Inputs:
 *   pending  — integer; the local bucket amount the SDK has accumulated.
 *              Validated 0..200_000 to bound runaway clients.
 *   anonId   — opaque string the SDK generated on first earn. Used for
 *              fraud-pattern analysis (repeated anonId across uids, etc.).
 *              Truncated to 64 chars; treated as untrusted.
 *   gameId   — short label of the calling game. Truncated to 32 chars.
 *
 * Output:
 *   {
 *     ok: true,
 *     credited: <int>,    // sunbeams actually added to hashLedger
 *     discarded: <int>,   // sunbeams refused by caps
 *     balance: <int>,     // new vault balance (earned - spent)
 *     earned: <int>,      // new vault lifetime earned
 *     anonId: <string>,
 *     gameId: <string>
 *   }
 *
 * Errors:
 *   unauthenticated      — caller has no auth context
 *   invalid-argument     — pending missing / non-integer / negative
 *   resource-exhausted   — claim cooldown
 *   internal             — Firestore transaction failed
 *
 * Telemetry:
 *   Every successful claim logs uid, anonId, gameId, pending, credited,
 *   discarded. The log is the input to future fraud heuristics (same
 *   anonId across multiple uids, abnormal claim sizes, etc.).
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

// ─── PRIVATE CAPS — DO NOT ECHO IN RESPONSES OR ERRORS ──────────────────
//
// CLAIM_CAP — the maximum a single claim() call can credit. A player who
// accumulates more than this in one anon session will see the excess
// silently discarded. Calibrated to "one play session feels worth it"
// without underwriting hours of unauthenticated grinding.
//
// PENDING_DAILY_CAP — the maximum sunbeams a single uid can take in via
// the claim path over a rolling 24h window. The vast majority of the
// player's daily sunbeams should come from the signed-in earnHashes path
// (300/min, 5000/day there). The claim path is for the moment of
// reconciliation, not as a primary earning channel.
//
// Both are tunable here; bump as the studio learns its players.
const CLAIM_CAP = 100
const PENDING_DAILY_CAP = 50
const COOLDOWN_MS = 2 * 1000
const DAY_MS = 24 * 60 * 60 * 1000
const MAX_INPUT_PENDING = 200_000   // sanity ceiling on declared input

export const claimPending = onCall(
  { region: 'us-central1' },
  async (request) => {
    // 1. Auth
    if (!request.auth || !request.auth.uid) {
      throw new HttpsError('unauthenticated', 'Sign in required.')
    }
    const uid = request.auth.uid

    // 2. Input validation
    const data = request.data || {}
    const pending = Number(data.pending)
    if (!Number.isInteger(pending) || pending < 0) {
      throw new HttpsError('invalid-argument', 'pending must be a non-negative integer.')
    }
    if (pending > MAX_INPUT_PENDING) {
      // Don't reveal the threshold — just refuse silently-ish.
      throw new HttpsError('invalid-argument', 'pending exceeds bounds.')
    }
    const anonId = (typeof data.anonId === 'string' ? data.anonId : '').slice(0, 64)
    const gameId = (typeof data.gameId === 'string' ? data.gameId : 'unknown').slice(0, 32)

    if (pending === 0) {
      const db0 = getFirestore()
      const snap = await db0.collection('vaults').doc(uid).get()
      const v = snap.exists ? (snap.data() || {}) : {}
      const ledger = v.hashLedger || { earned: 0, spent: 0 }
      return {
        ok: true,
        credited: 0,
        discarded: 0,
        balance: (ledger.earned || 0) - (ledger.spent || 0),
        earned: ledger.earned || 0,
        anonId, gameId,
      }
    }

    const db = getFirestore()
    const vaultRef = db.collection('vaults').doc(uid)

    let result = null
    try {
      result = await db.runTransaction(async (tx) => {
        const snap = await tx.get(vaultRef)
        const vault = snap.exists ? (snap.data() || {}) : {}
        const now = Date.now()

        // 3. Cooldown
        const lastClaimAt = vault.lastClaimAt || 0
        if (now - lastClaimAt < COOLDOWN_MS) {
          throw new HttpsError('resource-exhausted', 'Slow down — try again in a moment.')
        }

        // 4. Daily-cap accounting (rolling 24h window per uid)
        const dayBucket = Math.floor(now / DAY_MS)
        const cd = vault.claimRateDay || { bucket: 0, total: 0 }
        const dayTotal = (cd.bucket === dayBucket) ? cd.total : 0
        const dailyHeadroom = Math.max(0, PENDING_DAILY_CAP - dayTotal)

        // 5. Per-call cap, plus daily-cap intersection
        const allowedThisCall = Math.min(pending, CLAIM_CAP, dailyHeadroom)
        const credited = Math.max(0, allowedThisCall)
        const discarded = Math.max(0, pending - credited)

        // 6. Ledger write
        const ledger = vault.hashLedger || { earned: 0, spent: 0 }
        const newEarned = (ledger.earned || 0) + credited
        const balance = newEarned - (ledger.spent || 0)

        tx.set(
          vaultRef,
          {
            hashLedger: { earned: newEarned, spent: ledger.spent || 0 },
            claimRateDay: { bucket: dayBucket, total: dayTotal + credited },
            lastClaimAt: now,
            lastClaimCredited: credited,
            lastClaimDiscarded: discarded,
            lastClaimAnonId: anonId,
            lastClaimGameId: gameId,
          },
          { merge: true },
        )

        return { credited, discarded, newEarned, balance }
      })
    } catch (err) {
      if (err instanceof HttpsError) throw err
      logger.error('[claimPending] uid=%s txn failed', uid, err)
      throw new HttpsError('internal', 'Claim failed; please retry.')
    }

    // 7. Telemetry (input to fraud heuristics)
    logger.info(
      '[claimPending] uid=%s anonId=%s gameId=%s pending=%d credited=%d discarded=%d',
      uid, anonId, gameId, pending, result.credited, result.discarded,
    )

    return {
      ok: true,
      credited: result.credited,
      discarded: result.discarded,
      balance: result.balance,
      earned: result.newEarned,
      anonId,
      gameId,
    }
  },
)
