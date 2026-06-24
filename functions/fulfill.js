/**
 * Lucid Winds — SHARED entitlement fulfillment.
 *
 * One fulfillment definition, two payment rails:
 *   - Pi rail   (piComplete.js)  → Pi Browser, paid in Pi
 *   - Web rail  (nowIpn.js)      → regular web/PWA, paid in any crypto (USD-priced via NOWPayments)
 *
 * BOTH rails call applyFulfillment(tx, db, uid, metadata) inside their own
 * Firestore transaction, AFTER reading their own idempotency-lock doc
 * (piTransactions/{paymentId} for Pi, webOrders/{orderId} for web) and
 * BEFORE stamping it 'completed'. This module owns the per-type vault writes
 * and the caps — nothing payment-processor-specific lives here, so the two
 * rails can never drift.
 *
 * Firestore transaction ordering: applyFulfillment does exactly one read
 * (the vault/meta doc the branch needs) then one write. The caller has
 * already read its lock doc, and stamps its lock doc AFTER this returns —
 * so the full transaction is read(lock), read(vault), write(vault),
 * write(lock): all reads precede all writes. Valid.
 *
 * Behavior-preserving note: this is the exact switch that lived inline in
 * piComplete.js's fulfill(). The only addition is optional metadata.qty
 * (default 1) for slot-type buys so web bundles ("+5 slots") can grant in
 * one shot. With qty omitted/1 the behavior is byte-for-byte the old Pi path.
 */

import { HttpsError } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { FieldValue } from 'firebase-admin/firestore'

export const SLOT_CAP_GREENHOUSE = 60
export const SLOT_CAP_NURSERY = 6
export const SLOT_CAP_NURSERY_CLIPPING = 5
export const SLOT_CAP_POUCH = 40
export const SEED_POUCH_TIERS = ['seed15', 'seed20']

/**
 * Web USD price catalog — SERVER SOURCE OF TRUTH (cents). The client may show
 * a price, but nowCreateInvoice ALWAYS recomputes from here; a tampered client
 * price is ignored. Cheap + bundle-shaped on purpose: tiny single-unit buys get
 * eaten by crypto network fees, so we sell in packs / keep prices low. Pi prices
 * stay where they are in each LW_Pi wrapper — this table is the web (USD) mirror.
 *
 * Pricing model per product (Stephen-approved 2026-06-24):
 *   - bundle  : sell a FIXED pack in one order (greenhouse: 10 slots / $2)
 *   - perSlot : escalating price keyed by the buyer's ACTUAL next slot, which
 *               nowCreateInvoice derives SERVER-SIDE from the vault count (so a
 *               client can't claim a cheaper early slot). nursery + clipping.
 *   - tiers   : tier-specific unlock price (seed pouch +5 tiers)
 *   - base    : flat single-unit price (item pouch, emergency)
 *
 *   greenhouse        10 slots / pack   $2.00   (bundle)
 *   nursery slot      +1 (slots 4/5/6)  $1 / $2 / $3   (perSlot)
 *   clipping slot     +1 (slots 3/4/5)  $1 / $2 / $3   (perSlot)
 *   seed pouch        +5 (seed15/20)    $3 / $4        (tiers)
 *   item pouch slot   +1                $1.00          (base)
 *   emergency pouch   24h               $3.00          (base)
 */
export const LW_WEB_PRICES = {
  slot:                  { bundle: 10, cents: 200 },
  nursery_slot:          { perSlot: { 4: 100, 5: 200, 6: 300 }, countField: 'lw_nursery_slots', base: 3, cap: 6 },
  nursery_clipping_slot: { perSlot: { 3: 100, 4: 200, 5: 300 }, countField: 'lw_nur_clipping_slots', base: 2, cap: 5 },
  seed_pouch_slot:       { tiers: { seed15: 300, seed20: 400 } },
  item_pouch_slot:       { base: 100, qtyMax: 15 },
  emergency_pouch:       { base: 300 },
}

// Human labels for invoice descriptions / order records.
export const LW_WEB_LABELS = {
  slot: 'Greenhouse Slots',
  nursery_slot: 'Nursery Slot',
  nursery_clipping_slot: 'Nursery Clipping Slot',
  item_pouch_slot: 'Item Pouch Slot',
  seed_pouch_slot: 'Seed Pouch +5',
  emergency_pouch: 'Emergency Pouch (24h)',
}

/**
 * Resolve the USD price (cents) for a web order, SERVER-SIDE.
 *
 * @param {string} type   product type
 * @param {object} opts   { tier?, slotIndex? } — slotIndex is the SERVER-derived
 *                        next slot number for perSlot products (caller reads the
 *                        vault and passes it; never trust a client-claimed slot).
 * @returns { cents, qty, tier, label } — qty is how many units to GRANT.
 * @throws HttpsError('invalid-argument'|'failed-precondition') on bad/maxed input.
 *
 * Hut early-opens are deliberately NOT web-sellable (Pi-only flavor) — absent
 * from LW_WEB_PRICES, so they throw here. Intended.
 */
export function resolveWebPrice(type, opts) {
  const o = opts || {}
  const spec = LW_WEB_PRICES[type]
  if (!spec) {
    throw new HttpsError('invalid-argument', `Product "${type}" is not available on the web rail.`)
  }
  const label = LW_WEB_LABELS[type] || type

  // Bundle: fixed pack, one price (e.g. greenhouse 10 slots / $2).
  if (spec.bundle) {
    return { cents: spec.cents, qty: spec.bundle, tier: null, label }
  }
  // Tiered: seed pouch +5 unlock tiers.
  if (spec.tiers) {
    const t = String(o.tier || '')
    if (!(t in spec.tiers)) {
      throw new HttpsError('invalid-argument', `Invalid tier "${t}" for ${type}.`)
    }
    return { cents: spec.tiers[t], qty: 1, tier: t, label }
  }
  // Per-slot escalating: price by the SERVER-derived next slot index.
  if (spec.perSlot) {
    const idx = Math.floor(Number(o.slotIndex))
    if (!(idx in spec.perSlot)) {
      throw new HttpsError('failed-precondition', `${label} is already at its maximum.`)
    }
    return { cents: spec.perSlot[idx], qty: 1, tier: null, slotIndex: idx, label }
  }
  // Flat single-unit.
  return { cents: spec.base, qty: 1, tier: null, label }
}

/**
 * Apply the in-game entitlement for one paid order, inside the caller's
 * Firestore transaction. Returns a `fulfillment` summary object (the same
 * shape piComplete has always recorded). Does NOT touch any lock doc — the
 * caller owns idempotency.
 *
 * @param {Transaction} tx        active Firestore transaction
 * @param {Firestore}   db        admin Firestore
 * @param {string}      uid       owner uid
 * @param {object}      metadata  { type, tier?, item?, qty? }
 */
export async function applyFulfillment(tx, db, uid, metadata) {
  const vaultRef = db.collection('vaults').doc(uid)
  const metaRef = vaultRef.collection('meta').doc('state')
  const type = metadata && metadata.type ? String(metadata.type) : ''
  const today = new Date().toISOString().split('T')[0]
  // qty for additive slot buys (default 1 → identical to the old Pi path)
  let qty = Math.floor(Number(metadata && metadata.qty) || 1)
  if (!(qty >= 1)) qty = 1

  const fulfillment = { type, applied: false }
  if (qty > 1) fulfillment.qty = qty

  if (type === 'slot') {
    // Greenhouse slot cap lives in meta/state.slots (the canonical sync field)
    const metaDoc = await tx.get(metaRef)
    const cur = Number((metaDoc.exists && metaDoc.data().slots) || 10)
    const next = Math.min(SLOT_CAP_GREENHOUSE, cur + qty)
    tx.set(metaRef, { slots: next }, { merge: true })
    fulfillment.applied = next > cur
    fulfillment.before = cur
    fulfillment.after = next
  } else if (type === 'nursery_slot') {
    const vaultDoc = await tx.get(vaultRef)
    const cur = Number((vaultDoc.exists && vaultDoc.data().lw_nursery_slots) || 3)
    const next = Math.min(SLOT_CAP_NURSERY, cur + qty)
    tx.set(vaultRef, { lw_nursery_slots: next }, { merge: true })
    fulfillment.applied = next > cur
    fulfillment.before = cur
    fulfillment.after = next
  } else if (type === 'item_pouch_slot') {
    const vaultDoc = await tx.get(vaultRef)
    const cur = Number((vaultDoc.exists && vaultDoc.data().lw_pouch_cap) || 25)
    const next = Math.min(SLOT_CAP_POUCH, cur + qty)
    tx.set(vaultRef, { lw_pouch_cap: next }, { merge: true })
    fulfillment.applied = next > cur
    fulfillment.before = cur
    fulfillment.after = next
  } else if (type === 'nursery_clipping_slot') {
    const vaultDoc = await tx.get(vaultRef)
    const cur = Number((vaultDoc.exists && vaultDoc.data().lw_nur_clipping_slots) || 2)
    const next = Math.min(SLOT_CAP_NURSERY_CLIPPING, cur + qty)
    tx.set(vaultRef, { lw_nur_clipping_slots: next }, { merge: true })
    fulfillment.applied = next > cur
    fulfillment.before = cur
    fulfillment.after = next
  } else if (type === 'seed_pouch_slot') {
    const tier = (metadata && metadata.tier) ? String(metadata.tier) : ''
    if (SEED_POUCH_TIERS.indexOf(tier) === -1) {
      logger.warn('[fulfill] seed_pouch_slot with invalid tier=%s uid=%s', tier, uid)
      fulfillment.applied = false
      fulfillment.note = `Invalid seed pouch tier: ${tier}`
    } else {
      const vaultDoc = await tx.get(vaultRef)
      const bp = (vaultDoc.exists && vaultDoc.data().backpack) || {}
      const unlocks = (bp.unlocks && typeof bp.unlocks === 'object') ? { ...bp.unlocks } : {}
      const wasSet = !!unlocks[tier]
      unlocks[tier] = true
      tx.set(vaultRef, { backpack: { ...bp, unlocks } }, { merge: true })
      fulfillment.applied = !wasSet
      fulfillment.tier = tier
      fulfillment.cap = (tier === 'seed20') ? 20 : 15
    }
  } else if (type === 'emergency_pouch') {
    tx.set(
      vaultRef,
      {
        emergency_pouch_today: today,
        emergency_pouch_expires: Date.now() + 24 * 60 * 60 * 1000,
      },
      { merge: true },
    )
    fulfillment.applied = true
    fulfillment.expiresInMs = 24 * 60 * 60 * 1000
  } else if (type === 'early_open_hut' || type === 'hut_early_open') {
    // Pi-only flavor product; kept here so piComplete stays whole. Not sold on web.
    const itemKey = (metadata && metadata.item) ? String(metadata.item) : 'unknown'
    const vaultDoc = await tx.get(vaultRef)
    const existing = (vaultDoc.exists && vaultDoc.data().lw_hut_early_opens) || {
      date: today,
      opened: {},
    }
    if (existing.date !== today) {
      existing.date = today
      existing.opened = {}
    }
    existing.opened = { ...(existing.opened || {}), [itemKey]: Date.now() }
    tx.set(vaultRef, { lw_hut_early_opens: existing }, { merge: true })
    fulfillment.applied = true
    fulfillment.itemKey = itemKey
  } else {
    logger.warn('[fulfill] Unknown fulfillment type=%s uid=%s', type, uid)
    fulfillment.applied = false
    fulfillment.note = 'Unknown metadata.type; no entitlement applied.'
  }

  return fulfillment
}

// Re-export FieldValue passthrough kept intentionally minimal; callers import
// FieldValue themselves where they stamp their own lock docs.
export { FieldValue }
