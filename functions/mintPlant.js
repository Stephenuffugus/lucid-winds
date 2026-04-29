/**
 * Lucid Winds — Server-authoritative plant mint.
 *
 * Why this exists:
 *   With Pi NFT marketplace launching, a plant's resale value makes
 *   client-side hash forgery a real-money exploit. The mint gate must
 *   live on the server.
 *
 * Architecture:
 *   - Server validates the ledger + rate limits + generates the hash.
 *   - Server records an UNFORGEABLE mintLog entry per mint.
 *   - Client receives { plant: {hash, mintedAt, serverSigned} } and
 *     handles the local UI write (greenhouse + cloud sync) the same way
 *     it always has.
 *   - Future NFT marketplace listing flow cross-references plant against
 *     mintLog/{uid} — only plants WITH a matching log entry can list.
 *     Client can forge serverSigned:true in localStorage but cannot
 *     forge a mintLog row (that path is admin-write only).
 *
 * Client flow:
 *   const fn = httpsCallable(functions, 'mintPlant')
 *   const res = await fn({ source: 'manual' })
 *   // res.data.plant === { hash, mintedAt, serverSigned: true, mintSource }
 *
 * Errors:
 *   unauthenticated      — caller has no auth context
 *   resource-exhausted   — rate limit tripped
 *   failed-precondition  — insufficient balance
 *   internal             — Firestore write failed
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { getFirestore } from 'firebase-admin/firestore'
import { createHash, randomBytes } from 'crypto'

const MINT_COST = 30
const MIN_INTERVAL_MS = 60 * 1000
const DAILY_CAP = 30
const DAY_MS = 24 * 60 * 60 * 1000

export const mintPlant = onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth || !request.auth.uid) {
      throw new HttpsError('unauthenticated', 'Sign in required to mint a plant.')
    }
    const uid = request.auth.uid
    const source = (request.data && typeof request.data.source === 'string')
      ? request.data.source.slice(0, 32)
      : 'mint'

    const db = getFirestore()
    const vaultRef = db.collection('vaults').doc(uid)

    // Atomic transaction so concurrent mint requests can't double-spend.
    let mintedPlant = null
    let mintLogId = null
    try {
      const result = await db.runTransaction(async (tx) => {
        const snap = await tx.get(vaultRef)
        const vault = snap.exists ? (snap.data() || {}) : {}
        const ledger = vault.hashLedger || { earned: 0, spent: 0 }
        const balance = (ledger.earned || 0) - (ledger.spent || 0)

        if (balance < MINT_COST) {
          throw new HttpsError(
            'failed-precondition',
            `Need ${MINT_COST} Sunbeams; server has ${balance}.`,
          )
        }

        const now = Date.now()
        const lastMintAt = vault.lastMintAt || 0
        if (now - lastMintAt < MIN_INTERVAL_MS) {
          const waitS = Math.ceil((MIN_INTERVAL_MS - (now - lastMintAt)) / 1000)
          throw new HttpsError(
            'resource-exhausted',
            `Slow down — wait ${waitS}s before the next mint.`,
          )
        }

        const dailyMints = vault.dailyMints || { dayBucket: 0, count: 0 }
        const dayBucket = Math.floor(now / DAY_MS)
        const inSameDay = dailyMints.dayBucket === dayBucket
        if (inSameDay && dailyMints.count >= DAILY_CAP) {
          throw new HttpsError(
            'resource-exhausted',
            `Daily mint cap reached (${DAILY_CAP}). Resets in <24h.`,
          )
        }

        // Server-side hash. Inputs: uid + serverNow + crypto random + per-vault counter.
        const counter = (vault.mintCounter || 0) + 1
        const seed = `${uid}:${now}:${counter}:${randomBytes(16).toString('hex')}`
        const hash = createHash('sha256').update(seed).digest('hex')

        const plant = {
          hash,
          mintedAt: now,
          serverSigned: true,
          mintSource: source,
        }

        // Update server-canonical fields. Greenhouse is OWNED by the
        // client cloud-sync flow — we don't touch it here; the client
        // adds the plant to its local greenhouse using this returned
        // record and pushes via the existing _throttledSave path.
        const newLedger = {
          earned: ledger.earned || 0,
          spent: (ledger.spent || 0) + MINT_COST,
        }
        tx.set(
          vaultRef,
          {
            hashLedger: newLedger,
            lastMintAt: now,
            mintCounter: counter,
            dailyMints: {
              dayBucket,
              count: inSameDay ? dailyMints.count + 1 : 1,
            },
          },
          { merge: true },
        )

        // Unforgeable proof of mint. mintLog/{uid}/{plantHash} is
        // admin-write only via Firestore rules — clients can read their
        // own (to list NFTs) but cannot create entries. This is the
        // foundation for the future NFT-listing eligibility check.
        const logRef = db.collection('mintLog').doc(uid).collection('mints').doc(hash)
        tx.set(logRef, {
          uid,
          hash,
          mintedAt: now,
          source,
          serverNow: now,
          mintCounter: counter,
        })

        return { plant, logRef: logRef.path }
      })
      mintedPlant = result.plant
      mintLogId = result.logRef
    } catch (err) {
      if (err instanceof HttpsError) throw err
      logger.error('[mintPlant] uid=%s txn failed', uid, err)
      throw new HttpsError('internal', 'Mint failed; please retry.')
    }

    logger.info('[mintPlant] uid=%s hash=%s source=%s log=%s',
      uid, mintedPlant.hash, source, mintLogId)
    return { ok: true, plant: mintedPlant }
  },
)
