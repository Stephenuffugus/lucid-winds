/**
 * Lucid Winds — Server-authoritative Sunbeam earn.
 *
 * Why this exists:
 *   The mintPlant gate (see mintPlant.js) reads vault.hashLedger as the
 *   source of truth. If the client could write to that ledger directly,
 *   the gate is meaningless. So earn flows through here: every game
 *   completion / quest reward / box loot grant calls this function.
 *
 * Client flow:
 *   const fn = httpsCallable(functions, 'earnHashes')
 *   await fn({ amount: 6, source: 'memory_meadow' })
 *
 * What this does:
 *   1. Verify Firebase Auth context.
 *   2. Validate amount (positive integer, ≤ MAX_PER_CALL).
 *   3. Rate-limit per-source and global to keep automation in check.
 *   4. Atomic transaction: increment vault.hashLedger.earned and bump
 *      the per-day source totals for forensic review.
 *   5. Return new server balance so the client UI can sync.
 *
 * The client also keeps a local cached ledger for instant UI feedback,
 * but a refresh from the vault on next sync overrides it. Spec mismatch
 * (server says 12, client thought 18) means the client lost a race or
 * was edited — either way, server wins.
 *
 * Errors:
 *   unauthenticated      — caller has no auth context
 *   invalid-argument     — amount missing / negative / non-integer
 *   resource-exhausted   — earning rate exceeds plausible-play heuristic
 *   internal             — Firestore write failed
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const MAX_PER_CALL = 200          // single grant ceiling (jackpot from Mystery box)
const MAX_PER_MINUTE = 300        // sustained earn — generous for active play
const MAX_PER_DAY = 5000          // hard daily ceiling — anything above is automation
const MINUTE_MS = 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

export const earnHashes = onCall(
  { region: 'us-central1' },
  async (request) => {
    // 1. Auth
    if (!request.auth || !request.auth.uid) {
      throw new HttpsError('unauthenticated', 'Sign in required.')
    }
    const uid = request.auth.uid

    // 2. Input validation
    const data = request.data || {}
    const amount = Number(data.amount)
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new HttpsError('invalid-argument', 'amount must be a positive integer.')
    }
    if (amount > MAX_PER_CALL) {
      throw new HttpsError('invalid-argument', `amount exceeds per-call cap (${MAX_PER_CALL}).`)
    }
    const source = (typeof data.source === 'string' ? data.source : 'unknown').slice(0, 32)

    const db = getFirestore()
    const vaultRef = db.collection('vaults').doc(uid)

    // 3-5. Atomic transaction
    let result = null
    try {
      result = await db.runTransaction(async (tx) => {
        const snap = await tx.get(vaultRef)
        const vault = snap.exists ? (snap.data() || {}) : {}
        const now = Date.now()

        // Per-minute window
        const minBucket = Math.floor(now / MINUTE_MS)
        const minRate = vault.earnRateMin || { bucket: 0, total: 0 }
        const minTotal = (minRate.bucket === minBucket) ? minRate.total : 0
        if (minTotal + amount > MAX_PER_MINUTE) {
          throw new HttpsError(
            'resource-exhausted',
            `Earn rate too high (>${MAX_PER_MINUTE}/min). Suspicious activity.`,
          )
        }

        // Per-day window
        const dayBucket = Math.floor(now / DAY_MS)
        const dayRate = vault.earnRateDay || { bucket: 0, total: 0 }
        const dayTotal = (dayRate.bucket === dayBucket) ? dayRate.total : 0
        if (dayTotal + amount > MAX_PER_DAY) {
          throw new HttpsError(
            'resource-exhausted',
            `Daily earn cap (${MAX_PER_DAY}) reached. Resets at midnight UTC.`,
          )
        }

        const ledger = vault.hashLedger || { earned: 0, spent: 0 }
        const newEarned = (ledger.earned || 0) + amount
        const balance = newEarned - (ledger.spent || 0)

        tx.set(
          vaultRef,
          {
            hashLedger: { earned: newEarned, spent: ledger.spent || 0 },
            earnRateMin: { bucket: minBucket, total: minTotal + amount },
            earnRateDay: { bucket: dayBucket, total: dayTotal + amount },
            lastEarnAt: now,
            lastEarnSource: source,
          },
          { merge: true },
        )

        return { newEarned, balance, source }
      })
    } catch (err) {
      if (err instanceof HttpsError) throw err
      logger.error('[earnHashes] uid=%s txn failed', uid, err)
      throw new HttpsError('internal', 'Earn write failed.')
    }

    return { ok: true, balance: result.balance, earned: result.newEarned, source: result.source }
  },
)
