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
 * Pricing model per product (Stephen-approved 2026-07-03 — "$1 for 10
 * greenhouse slots, $2 per nursery slot, $1 per 5 backpack slots, $5 half /
 * $10 full bundle with a unique bonus"):
 *   - bundle  : sell a FIXED pack in one order (greenhouse: 10 slots / $1)
 *   - perSlot : price keyed by the buyer's ACTUAL next slot, which
 *               nowCreateInvoice derives SERVER-SIDE from the vault count (so a
 *               client can't claim a cheaper early slot). nursery + clipping.
 *   - tiers   : tier-specific unlock price (seed pouch +5 tiers)
 *   - base    : flat single-unit price (emergency, bloom bundles)
 *
 *   greenhouse        10 slots / pack   $1.00   (bundle)
 *   nursery slot      +1 (slots 4/5/6)  $2 flat        (perSlot)
 *   clipping slot     +1 (slots 3/4/5)  $1 / $2 / $3   (perSlot)
 *   seed pouch        +5 (seed15/20)    $1 / $1        (tiers)
 *   item pouch        +5 slots / pack   $1.00          (bundle)
 *   emergency pouch   24h               $3.00          (base)
 *   half bloom        bundle            $5.00          (base; +20 GH, +1 nursery,
 *                                                       +1 clipping, seed15, +5 pouch)
 *   full bloom        bundle            $10.00 — or $5.00 to COMPLETE if the
 *                                       buyer already owns half bloom (server-
 *                                       derived). Maxes every purchasable slot
 *                                       + grants the one-time Founder's Bloom.
 */
export const LW_WEB_PRICES = {
  slot:                  { bundle: 10, cents: 100 },
  nursery_slot:          { perSlot: { 4: 200, 5: 200, 6: 200 }, countField: 'lw_nursery_slots', base: 3, cap: 6 },
  nursery_clipping_slot: { perSlot: { 3: 100, 4: 200, 5: 300 }, countField: 'lw_nur_clipping_slots', base: 2, cap: 5 },
  seed_pouch_slot:       { tiers: { seed15: 100, seed20: 100 } },
  item_pouch_slot:       { bundle: 5, cents: 100 },
  emergency_pouch:       { base: 300 },
  supporter_pack:        { base: 300 },
  half_bloom:            { base: 500 },
  full_bloom:            { base: 1000, completeCents: 500 },
}

/**
 * Pi-rail prices, in PI (not cents). The web rail is USD; Pi is its own
 * currency, so it needs its own table. This closes the hole where piApprove
 * approved ANY amount for ANY product (a 0.001-Pi payment carrying
 * {type:'full_bloom'} granted the bundle — see piApprove validation).
 *
 * ⛔ These are FLOORS that kill the exploit, not final prices. Stephen sets the
 * real numbers before the Pi build ships. The three tiered maps are read from
 * the live client's own Pi price display; the flats are conservative
 * placeholders. `min` marks a variable-amount product (a tip): floor only,
 * never an exact price.
 *
 * Validation uses the CHEAPEST price for a type as the hard floor, so a payment
 * can never be approved for less than the least a product ever costs, even if
 * the client omits the slot/tier hint. (Per-tier precision — charging the exact
 * tier price — is a follow-up that needs server-side slot derivation.)
 */
export const PI_PRICES = {
  slot:                  { flat: 1 },
  item_pouch_slot:       { flat: 1 },
  emergency_pouch:       { flat: 10 },
  supporter_pack:        { flat: 30 },
  half_bloom:            { flat: 50 },
  full_bloom:            { flat: 100 },
  early_open_hut:        { flat: 5 },
  hut_early_open:        { flat: 5 },
  nursery_slot:          { perSlot: { 4: 5,  5: 10, 6: 20 } },
  nursery_clipping_slot: { perSlot: { 3: 3,  4: 5,  5: 8  } },
  seed_pouch_slot:       { tiers:   { seed15: 10, seed20: 20 } },
  tip:                   { min: 0.1 },
}

/**
 * The hard floor (in Pi) below which a payment for `type` must be rejected.
 * Returns null for an unknown type (caller rejects those outright).
 */
export function piFloor(type) {
  const spec = PI_PRICES[type]
  if (!spec) return null
  if (spec.flat != null) return spec.flat
  if (spec.min != null) return spec.min
  if (spec.perSlot) return Math.min(...Object.values(spec.perSlot))
  if (spec.tiers) return Math.min(...Object.values(spec.tiers))
  return null
}

// Human labels for invoice descriptions / order records.
export const LW_WEB_LABELS = {
  slot: 'Greenhouse Slots',
  nursery_slot: 'Nursery Slot',
  nursery_clipping_slot: 'Nursery Clipping Slot',
  item_pouch_slot: 'Item Pouch +5',
  seed_pouch_slot: 'Seed Pouch +5',
  emergency_pouch: 'Emergency Pouch (24h)',
  supporter_pack: 'Studio Supporter Pack',
  half_bloom: 'Half Bloom Upgrade',
  full_bloom: 'Full Bloom Upgrade',
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
  // Full bloom completes at half price when the buyer already owns half bloom.
  // opts.halfOwned is SERVER-derived by nowCreateInvoice from the vault doc.
  if (type === 'full_bloom' && o.halfOwned) {
    return { cents: spec.completeCents, qty: 1, tier: null, label: label + ' (complete)' }
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
  } else if (type === 'supporter_pack') {
    // Studio-wide cosmetic supporter flag. Satellite games (Jimothy, Hedgerow,
    // Grubtrap) read vaults/{uid}.sw_supporter and unlock their premium
    // cosmetics — skins and soundtrack songs only, never gameplay power.
    const vaultDoc = await tx.get(vaultRef)
    const was = !!(vaultDoc.exists && vaultDoc.data().sw_supporter)
    tx.set(vaultRef, { sw_supporter: true, sw_supporter_at: Date.now() }, { merge: true })
    fulfillment.applied = !was
  } else if (type === 'half_bloom' || type === 'full_bloom') {
    // Bloom bundle upgrades. Both Firestore reads happen before either write
    // (transaction ordering requirement). Grants never regress an existing
    // count, and re-delivery of the same webhook is harmless (idempotent
    // values, and the caller's lock doc already blocks true double-fulfill).
    const full = type === 'full_bloom'
    const metaDoc = await tx.get(metaRef)
    const vaultDoc = await tx.get(vaultRef)
    const vd = (vaultDoc.exists && vaultDoc.data()) || {}
    const curSlots = Number((metaDoc.exists && metaDoc.data().slots) || 10)
    const curNur = Number(vd.lw_nursery_slots || 3)
    const curClip = Number(vd.lw_nur_clipping_slots || 2)
    const curPouch = Number(vd.lw_pouch_cap || 25)
    const bp = (vd.backpack && typeof vd.backpack === 'object') ? vd.backpack : {}
    const unlocks = (bp.unlocks && typeof bp.unlocks === 'object') ? { ...bp.unlocks } : {}
    const nextSlots = full ? SLOT_CAP_GREENHOUSE : Math.min(SLOT_CAP_GREENHOUSE, curSlots + 20)
    const nextNur = full ? SLOT_CAP_NURSERY : Math.min(SLOT_CAP_NURSERY, curNur + 1)
    const nextClip = full ? SLOT_CAP_NURSERY_CLIPPING : Math.min(SLOT_CAP_NURSERY_CLIPPING, curClip + 1)
    const nextPouch = full ? SLOT_CAP_POUCH : Math.min(SLOT_CAP_POUCH, curPouch + 5)
    unlocks.seed15 = true
    if (full) unlocks.seed20 = true
    const vaultWrite = {
      lw_nursery_slots: Math.max(curNur, nextNur),
      lw_nur_clipping_slots: Math.max(curClip, nextClip),
      lw_pouch_cap: Math.max(curPouch, nextPouch),
      backpack: { ...bp, unlocks },
      lw_half_bloom: true,
    }
    if (full) {
      vaultWrite.lw_full_bloom = true
      // One-time purchase bonus: the client mints a unique Founder's Bloom
      // when it sees 'pending', then stamps 'granted'. Never re-arm.
      if (vd.lw_founder_gift !== 'granted') vaultWrite.lw_founder_gift = 'pending'
    }
    tx.set(metaRef, { slots: Math.max(curSlots, nextSlots) }, { merge: true })
    tx.set(vaultRef, vaultWrite, { merge: true })
    fulfillment.applied = true
    fulfillment.slotsBefore = curSlots
    fulfillment.slotsAfter = Math.max(curSlots, nextSlots)
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
