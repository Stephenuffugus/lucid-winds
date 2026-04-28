/**
 * Lucid Winds — Firebase Cloud Functions entry point.
 *
 * Exports:
 *   - piApprove        (v2 onCall) — Pi payment approval
 *   - piComplete       (v2 onCall) — Pi payment completion + entitlement grant
 *   - nftSignMint      (v2 onRequest) — Polygon mint voucher signer (legacy, kept)
 *
 * Deploy:        firebase deploy --only functions
 * Set secrets:   firebase functions:secrets:set PI_SERVER_KEY
 *                firebase functions:secrets:set NFT_SIGNER_KEY  (legacy)
 *                firebase functions:secrets:set NFT_CHAIN_ID    (legacy, e.g. "137")
 */

import { initializeApp } from 'firebase-admin/app'

initializeApp()

export { piApprove } from './piApprove.js'
export { piComplete } from './piComplete.js'
export { nftSignMint } from './nftSignMint.js'
