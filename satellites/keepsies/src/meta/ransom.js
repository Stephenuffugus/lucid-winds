/**
 * The 24 hour buy back window, which is the other half of losing.
 *
 * DESIGN 12: "lose a rare+ → 24h buy-back window: R400 / E1500 / G5000☀. Paid →
 * winner gets the sunbeams. Unpaid → winner keeps marble. One offer, no
 * negotiation UI." DESIGN 18 puts the offer card immediately after the loss
 * ceremony, with the countdown starting there.
 *
 * ⛔ THE DEADLINE IS A TIMESTAMP IN THE SAVE, NEVER A TIMER. A 24 hour window has
 * to survive the tab being closed for 23 of them, the phone being off, and the
 * game being opened on a second tab. Nothing here schedules anything; every read
 * asks the clock what time it is and compares.
 *
 * ⛔ AN OFFER IS ONLY EVER CREATED FOR A MARBLE THAT REALLY LEFT. It is written
 * in the same `SAVE.update` that the settle already removed the marble in, so a
 * marble is in an inventory, in a pot, or under an open ransom, and never in two
 * of them and never in none. `test/ransom.mjs` kills a process holding an open
 * offer to prove it.
 *
 * ⛔ EXPIRY HAPPENS EXACTLY ONCE AND IT IS NOT A DELETION. A lapsed offer is
 * marked `lapsed` and kept, because "the winner kept it" is a fact about your
 * collection that a player should be able to read later, and because an offer
 * that vanishes silently is indistinguishable from a bug that ate a marble.
 *
 * ⛔ COMMONS AND UNCOMMONS ARE NOT RANSOMED. DESIGN says rare+ and means it: the
 * clay pool exists so anybody can play for keeps without risking anything they
 * care about, and putting a price on a clay marble would make the free tier feel
 * like a trap. `priceFor` returns 0 for them and `offerFor` skips them.
 */
import * as SAVE from './save.js?v=20260904b';

/** What a tier costs to buy back, or 0 when its tier is not ransomed at all. */
export function priceFor(tier, tuning) {
  const table = tuning.economy.ransom;
  return table[tier] || 0;
}

/**
 * Open offers on the marbles that just left, one per marble, rare and above.
 * Called from the settle, with the marbles the settle reported as lost.
 *
 * @param {{uid:string,id:string,tier:string,name:string}[]} lost
 * @param {string} opponent
 * @param {object} tuning
 * @param {number} now
 * @returns {{uid:string,name:string,tier:string,price:number,expires:number}[]}
 */
export function offerFor(lost, opponent, tuning, now) {
  const hours = tuning.economy.ransom.windowHours;
  const made = [];
  const rows = [];
  for (const m of lost) {
    const price = priceFor(m.tier, tuning);
    if (!price) continue;                                  // commons and uncommons walk
    rows.push({
      uid: m.uid, id: m.id, name: m.name, tier: m.tier,
      price: price, from: opponent, at: now,
      expires: now + hours * 3600 * 1000, lapsed: false
    });
  }
  if (!rows.length) return made;
  SAVE.update((s) => {
    s.ransoms = s.ransoms || [];
    const held = new Set(s.ransoms.map(r => r.uid));
    for (const r of rows) {
      if (held.has(r.uid)) continue;                       // one offer, no negotiation
      s.ransoms.push(r);
      made.push(r);
    }
  });
  return made;
}

/**
 * Mark everything past its deadline, exactly once.
 * @returns {object[]} the offers that lapsed on THIS call, so a caller can say so
 */
export function expire(now) {
  const gone = [];
  SAVE.update((s) => {
    for (const r of (s.ransoms || [])) {
      if (r.lapsed || r.paid) continue;
      if (now < r.expires) continue;
      r.lapsed = true;
      gone.push(r);
    }
  });
  return gone;
}

/** The offers a player can still act on, newest first, with time left attached. */
export function openOffers(now) {
  expire(now);
  const s = SAVE.load();
  return (s.ransoms || [])
    .filter(r => !r.lapsed && !r.paid)
    .map(r => Object.assign({}, r, { msLeft: Math.max(0, r.expires - now) }))
    .sort((a, b) => a.expires - b.expires);
}

/** Everything that ever happened, for a screen that wants to show the history. */
export function history() {
  return (SAVE.load().ransoms || []).slice();
}

/**
 * Buy one back. The wallet is spent and the marble returns in ONE write, so a
 * crash between them cannot take the sunbeams and leave the marble behind.
 *
 * @param {string} uid
 * @param {number} now
 * @returns {{ok:boolean, reason:string, marble:object|null, paid:number}}
 */
export function pay(uid, now) {
  let out = { ok: false, reason: 'That offer is not open any more.', marble: null, paid: 0 };
  expire(now);
  SAVE.update((s) => {
    const r = (s.ransoms || []).find(x => x.uid === uid);
    if (!r) { out.reason = 'There is no offer on that marble.'; return; }
    if (r.paid) { out.reason = 'You already bought that one back.'; return; }
    if (r.lapsed || now >= r.expires) { out.reason = r.from + ' kept it. The window closed.'; return; }
    if (s.wallet.sunbeams < r.price) {
      out.reason = 'That is ' + r.price + ' sunbeams and you have ' + s.wallet.sunbeams + '.';
      return;
    }
    // ⛔ one write: the spend, the marble and the offer all move together
    s.wallet.sunbeams -= r.price;
    s.stats.spent = (s.stats.spent || 0) + r.price;
    s.stats.ransomed = (s.stats.ransomed || 0) + 1;
    s.inventory.push({
      id: r.id, uid: r.uid, acquired: now, source: 'ransom',
      wonFrom: r.from, cosmeticSeed: 0.5
    });
    r.paid = now;
    out = { ok: true, reason: '', marble: { id: r.id, uid: r.uid, name: r.name, tier: r.tier }, paid: r.price };
  });
  return out;
}

/**
 * The first thing the game does on boot, after the pot recovery. Lapses anything
 * that ran out while the game was closed, which is where most of them will lapse.
 */
export function sweepOnBoot(now) {
  return { lapsed: expire(now).length };
}

/** How long is left, in the words a card should use. */
export function timeLeftWords(ms) {
  if (ms <= 0) return 'closed';
  /* ⛔ ROUND UP, NOT DOWN. Flooring meant an offer opened one second ago said
     "23 hours left" on the card that opened it, which reads as a countdown that
     starts by losing an hour, which reads as a bug. A window with 23 hours and 59
     minutes in it has 24 hours in it as far as a sentence is concerned. */
  const h = Math.ceil(ms / 3600000);
  if (h > 1) return h + ' hours left';
  const m = Math.max(1, Math.ceil(ms / 60000));
  if (m > 60) return 'an hour left';
  return m + (m === 1 ? ' minute left' : ' minutes left');
}
