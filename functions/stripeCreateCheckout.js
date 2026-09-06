/**
 * stripeCreateCheckout — card checkout (Stripe hosted) for BOTH:
 *   1. the $3 Studio Supporter Pack + donations (the original Jimothy path,
 *      byte-compatible with what already shipped), and
 *   2. every Lucid Winds web product in LW_WEB_PRICES (slots, pouches,
 *      blooms) — added 2026-08-20 (Stephen: "I'm good with Stripe now...
 *      expanded greenhouse and backpacks"). Pass { type, tier } exactly like
 *      nowCreateInvoice and the card rail sells the SAME catalog at the SAME
 *      server-derived price, fulfilled by the SAME applyFulfillment through
 *      stripeWebhook (which was already metadata-generic).
 *
 * Mirrors nowCreateInvoice: auth required, server-priced, writes a webOrders
 * doc the client watches, returns a hosted checkout URL. The vault-derived
 * validation block below is deliberately a copy of nowCreateInvoice's — the
 * proven crypto rail stays untouched; if you change one, change both.
 * Talks to Stripe with plain fetch (form-encoded) — no SDK dependency.
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions'
import { resolveWebPrice, LW_WEB_PRICES, LW_WEB_LABELS } from './fulfill.js'

export const stripeCreateCheckout = onCall(
  { region: 'us-central1', secrets: ['STRIPE_SECRET_KEY'] },
  async (request) => {
    if (!request.auth || !request.auth.uid) {
      throw new HttpsError('unauthenticated', 'Sign in to buy.')
    }
    const uid = request.auth.uid
    const db = getFirestore()

    // ── Lucid Winds product path (slots / pouches / blooms) ──────────────
    const reqType = request.data && request.data.type ? String(request.data.type) : ''
    if (reqType && reqType !== 'supporter_pack' && reqType !== 'donation' && LW_WEB_PRICES[reqType]) {
      const tier = request.data.tier ? String(request.data.tier) : null

      // per-slot escalation is priced by the buyer's ACTUAL next slot,
      // read from the vault — never from a client-claimed number
      const spec = LW_WEB_PRICES[reqType]
      let slotIndex = null
      if (spec && spec.perSlot) {
        const vaultDoc = await db.collection('vaults').doc(uid).get()
        const cur = Number((vaultDoc.exists && vaultDoc.data()[spec.countField]) || spec.base)
        slotIndex = cur + 1
      }
      let halfOwned = false
      if (reqType === 'half_bloom' || reqType === 'full_bloom') {
        const vaultDoc = await db.collection('vaults').doc(uid).get()
        const vd = (vaultDoc.exists && vaultDoc.data()) || {}
        if (vd.lw_full_bloom) throw new HttpsError('failed-precondition', 'You already own the Full Bloom upgrade.')
        if (reqType === 'half_bloom' && vd.lw_half_bloom) throw new HttpsError('failed-precondition', 'You already own the Half Bloom upgrade.')
        halfOwned = !!vd.lw_half_bloom
      }

      const priced = resolveWebPrice(reqType, { tier, slotIndex, halfOwned })
      const usd = (priced.cents / 100).toFixed(2)

      const key = process.env.STRIPE_SECRET_KEY
      if (!key) {
        logger.error('[stripeCreateCheckout] STRIPE_SECRET_KEY not set')
        throw new HttpsError('failed-precondition', 'Card payments are not configured yet.')
      }

      const orderRef = db.collection('webOrders').doc()
      const orderId = orderRef.id
      const metadata = { type: priced.type || reqType }
      if (priced.tier) metadata.tier = priced.tier
      if (priced.qty && priced.qty > 1) metadata.qty = priced.qty

      await orderRef.set({
        uid,
        type: metadata.type,
        metadata,
        usdCents: priced.cents,
        usd,
        gateway: 'stripe',
        status: 'created',
        createdAt: FieldValue.serverTimestamp(),
      })

      const label = (LW_WEB_LABELS && LW_WEB_LABELS[metadata.type]) || 'Lucid Winds upgrade'
      const form = new URLSearchParams()
      form.set('mode', 'payment')
      form.set('client_reference_id', orderId)
      form.set('line_items[0][quantity]', '1')
      form.set('line_items[0][price_data][currency]', 'usd')
      form.set('line_items[0][price_data][unit_amount]', String(priced.cents))
      form.set('line_items[0][price_data][product_data][name]', label)
      form.set('line_items[0][price_data][product_data][description]',
        'Unlocks in your Lucid Winds greenhouse automatically after payment.')
      form.set('metadata[orderId]', orderId)
      form.set('metadata[uid]', uid)
      form.set('metadata[type]', metadata.type)
      form.set('success_url', 'https://lucidwinds.com/?paid=1')
      form.set('cancel_url', 'https://lucidwinds.com/?paycancel=1')

      const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      })
      const sess = await resp.json()
      if (!resp.ok || !sess.url) {
        logger.error('[stripeCreateCheckout] LW session create failed: %j', sess.error || sess)
        await orderRef.set(
          { status: 'failed', error: (sess.error && sess.error.message) || 'session create failed' },
          { merge: true },
        )
        throw new HttpsError('internal', 'Could not start card checkout.')
      }
      await orderRef.set({ status: 'invoiced', sessionId: sess.id }, { merge: true })
      logger.info('[stripeCreateCheckout] product=%s order=%s uid=%s session=%s', metadata.type, orderId, uid, sess.id)
      return { ok: true, orderId, url: sess.url, invoiceUrl: sess.url, usd }
    }

    // ── original Jimothy path: supporter pack + donations (unchanged) ────
    const kind = (request.data && request.data.kind) === 'donation' ? 'donation' : 'supporter_pack'
    // gift tiers are a server-side whitelist — the client never names its own price
    const DONATION_TIERS = [500, 1000, 2500]
    let donationCents = 500
    if (kind === 'donation') {
      const c = Math.floor(Number(request.data && request.data.cents))
      if (DONATION_TIERS.indexOf(c) !== -1) donationCents = c
    }

    if (kind === 'supporter_pack') {
      const vaultDoc = await db.collection('vaults').doc(uid).get()
      if (vaultDoc.exists && vaultDoc.data().sw_supporter) {
        throw new HttpsError('failed-precondition', 'You are already a supporter. Thank you!')
      }
    }

    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      logger.error('[stripeCreateCheckout] STRIPE_SECRET_KEY not set')
      throw new HttpsError('failed-precondition', 'Card payments are not configured yet.')
    }

    const orderRef = db.collection('webOrders').doc()
    const orderId = orderRef.id
    const metadata = { type: kind }
    await orderRef.set({
      uid,
      type: kind,
      metadata,
      usdCents: kind === 'donation' ? donationCents : 300,
      usd: kind === 'donation' ? (donationCents / 100).toFixed(2) : '3.00',
      gateway: 'stripe',
      status: 'created',
      createdAt: FieldValue.serverTimestamp(),
    })

    const form = new URLSearchParams()
    form.set('mode', 'payment')
    form.set('client_reference_id', orderId)
    form.set('line_items[0][quantity]', '1')
    form.set('line_items[0][price_data][currency]', 'usd')
    if (kind === 'donation') {
      // preset gift tiers (custom_unit_amount needs a saved Price + extra key perms;
      // fixed inline amounts ride the already-working path). $3+ also grants the
      // Supporter Pack in the webhook.
      form.set('line_items[0][price_data][unit_amount]', String(donationCents))
      form.set('line_items[0][price_data][product_data][name]', 'Gift to Sky Wolf Studio')
      form.set('line_items[0][price_data][product_data][description]',
        'A direct thank-you to the one-person studio behind Jimothy. Gifts of $3 or more also unlock the Supporter Pack.')
      form.set('submit_type', 'donate')
    } else {
      form.set('line_items[0][price_data][unit_amount]', '300')
      form.set('line_items[0][price_data][product_data][name]', 'Studio Supporter Pack')
      form.set('line_items[0][price_data][product_data][description]',
        'Every Jimothy costume and the full original soundtrack, on every device you sign into.')
    }
    form.set('metadata[orderId]', orderId)
    form.set('metadata[uid]', uid)
    form.set('metadata[type]', kind)
    form.set('success_url', 'https://lucidwinds.com/satellites/stream-hop/?paid=1')
    form.set('cancel_url', 'https://lucidwinds.com/satellites/stream-hop/?paycancel=1')

    const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    })
    const sess = await resp.json()
    if (!resp.ok || !sess.url) {
      logger.error('[stripeCreateCheckout] session create failed: %j', sess.error || sess)
      await orderRef.set(
        { status: 'failed', error: (sess.error && sess.error.message) || 'session create failed' },
        { merge: true },
      )
      throw new HttpsError('internal', 'Could not start card checkout.')
    }

    await orderRef.set({ status: 'invoiced', sessionId: sess.id }, { merge: true })
    logger.info('[stripeCreateCheckout] kind=%s order=%s uid=%s session=%s', kind, orderId, uid, sess.id)
    return { ok: true, orderId, url: sess.url, usd: kind === 'donation' ? null : '3.00' }
  },
)
