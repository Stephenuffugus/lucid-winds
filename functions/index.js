/**
 * Lucid Winds — Firebase Cloud Functions entry point.
 *
 * Exports:
 *   - piApprove        (v2 onCall) — Pi payment approval
 *   - piComplete       (v2 onCall) — Pi payment completion + entitlement grant
 *   - mintPlant        (v2 onCall) — Server-authoritative plant mint (NFT-grade)
 *   - earnHashes       (v2 onCall) — Server-authoritative Sunbeam earn (NFT-grade)
 *   - claimPending     (v2 onCall) — Atomic claim of pendingRewards into hashLedger
 *
 * Deploy:        firebase deploy --only functions
 * Set secrets:   firebase functions:secrets:set PI_SERVER_KEY
 *
 * The Polygon nftSignMint export is parked until the dual-chain feature
 * is wired — re-enable by adding the export back AND setting NFT_SIGNER_KEY
 * + NFT_CHAIN_ID secrets.
 */

import { initializeApp } from 'firebase-admin/app'

initializeApp()

export { piApprove } from './piApprove.js'
export { piComplete } from './piComplete.js'
export { mintPlant } from './mintPlant.js'
export { earnHashes } from './earnHashes.js'
export { claimPending } from './claimPending.js'
