/**
 * The wallet and the clay pool.
 *
 * ⛔ DATE LIVES HERE AND NOWHERE ELSE. The daily reset is LOCAL midnight, and
 * `Date` may be read inside `meta/` only. `core/` has to produce the same answer
 * on a phone in Auckland, a phone in Lisbon and a Cloud Function in us-central1,
 * so a clock is exactly the kind of thing it may not have.
 *
 * ⛔ TWO CURRENCIES WITH ONE NAME IS A TRAP, and the plan says so at 4.6. This
 * wallet is the GAME's, four to six hundred a day of honest play, spent on
 * pouches and slots and a showcase upgrade. The fleet's `window._sbCapEarn` is a
 * different number on a different scale, thirty a day across every satellite,
 * and it is called at match end and never converts either way. They are wired in
 * two different places on purpose. OPEN #9 is what the player sees this one
 * called, and until Stephen answers it the UI says Sunbeams per the design.
 *
 * Every write goes through `meta/save.js`, which merges rather than overwrites,
 * so a second tab cannot spend your marbles out from under you.
 */
import * as SAVE from './save.js?v=20260904c';

/** Local midnight as a day number. The only clock reading in the game. */
export function today(now) {
  const d = now ? new Date(now) : new Date();
  return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);
}

/**
 * @param {object} tuning
 * @param {{now?: () => number}} [deps] an injected clock, for the gate
 */
export function createEconomy(tuning, deps) {
  const T = tuning.economy;
  const clock = (deps && deps.now) || (() => Date.now());
  const listeners = [];
  const fire = (what) => { for (const fn of listeners) { try { fn(what); } catch (e) { } } };

  /* ------------------------------------------------------------- the wallet */

  const api = {
    onChange(fn) {
      listeners.push(fn);
      return () => { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); };
    },

    balance() { return SAVE.load().wallet.sunbeams; },

    /** Earn, with a reason. Dust is an earn reason, not a second currency. */
    earn(n, reason) {
      const amount = Math.max(0, Math.round(n));
      if (!amount) return 0;
      SAVE.update((s) => {
        s.wallet.sunbeams += amount;
        s.stats.earned = (s.stats.earned || 0) + amount;
      });
      fire({ kind: 'earn', amount, reason });
      return amount;
    },

    /** Spend, with a reason. False when there is not enough, and NOTHING moves. */
    spend(n, reason) {
      const amount = Math.max(0, Math.round(n));
      if (amount === 0) return true;
      let ok = false;
      SAVE.update((s) => {
        if (s.wallet.sunbeams < amount) return;
        s.wallet.sunbeams -= amount;
        s.stats.spent = (s.stats.spent || 0) + amount;
        ok = true;
      });
      if (ok) fire({ kind: 'spend', amount, reason });
      return ok;
    },

    /** What a duplicate is worth. Dust IS sunbeams, with a reason of its own. */
    dustFor(tier) { return T.dust[tier] || 0; },

    /* ---------------------------------------------------------- the clay pool */

    /**
     * Ten clay commons that come back to ten every day, so anybody can always
     * play for keeps without risking anything they care about (DESIGN 12.2).
     *
     * ⛔ It regenerates to FULL on a new day, not by one per day and not by one
     * per call. A player who was away a week comes back to ten, not to seventeen
     * and not to three; and calling this twice in a second must not hand out
     * twenty. The gate steps the clock forward a week, backward, and across
     * midnight twice in a row to prove all three.
     */
    clayPool() {
      const day = today(clock());
      let pool = null;
      SAVE.update((s) => {
        if (s.clayPool.lastRegen !== day) {
          s.clayPool.count = T.clayPoolSize;
          s.clayPool.lastRegen = day;
        }
        if (s.clayPool.count > T.clayPoolSize) s.clayPool.count = T.clayPoolSize;
        if (s.clayPool.count < 0) s.clayPool.count = 0;
        pool = { count: s.clayPool.count, lastRegen: s.clayPool.lastRegen, max: T.clayPoolSize };
      });
      return pool;
    },

    /** Take one clay marble out to stake it. False when the pool is empty. */
    takeClay(n) {
      const want = Math.max(1, Math.round(n || 1));
      api.clayPool();
      let ok = false;
      SAVE.update((s) => {
        if (s.clayPool.count < want) return;
        s.clayPool.count -= want;
        ok = true;
      });
      if (ok) fire({ kind: 'clay', amount: -want });
      return ok;
    },

    /* --------------------------------------------------------- the day's pay */

    /**
     * The faucets of DESIGN 17. Every one of them names its reason, because the
     * ledger a player can see is the only honest answer to "where did that go".
     */
    payForMatch(result) {
      const day = today(clock());
      let total = 0;
      const paid = [];
      const save = SAVE.load();
      if (result.won && save.stats.lastWinDay !== day) {
        total += T.firstWinOfDay;
        paid.push({ reason: 'first win of the day', amount: T.firstWinOfDay });
        SAVE.update((s) => { s.stats.lastWinDay = day; });
      }
      // completion pays by performance, between the two ends of the band
      const share = Math.max(0, Math.min(1, (result.pocketed || 0) / Math.max(1, result.toWin || 7)));
      const completion = Math.round(T.matchCompletionMin
        + (T.matchCompletionMax - T.matchCompletionMin) * share);
      total += completion;
      paid.push({ reason: 'match completed', amount: completion });

      for (const t of (result.newTechniques || [])) {
        total += T.techniqueFirstEarn;
        paid.push({ reason: 'first ' + t, amount: T.techniqueFirstEarn });
      }
      if (total) api.earn(total, 'match');
      return { total, paid };
    },

    /** The streak, counted in days played and paid at three, five and seven. */
    touchStreak() {
      const day = today(clock());
      let out = null;
      SAVE.update((s) => {
        const last = s.streak.last || 0;
        if (last === day) { out = { days: s.streak.days, paid: 0, alreadyToday: true }; return; }
        s.streak.days = (day - last === 1) ? (s.streak.days || 0) + 1 : 1;
        s.streak.last = day;
        out = { days: s.streak.days, paid: 0, alreadyToday: false };
      });
      if (out.alreadyToday) return out;
      const pay = T.streak[String(out.days)];
      if (pay) { api.earn(pay, 'streak of ' + out.days + ' days'); out.paid = pay; }
      return out;
    },

    /** Everything a wallet screen needs, in one read. */
    snapshot() {
      const s = SAVE.load();
      return {
        sunbeams: s.wallet.sunbeams,
        clay: api.clayPool(),
        streak: s.streak.days || 0,
        earned: s.stats.earned || 0,
        spent: s.stats.spent || 0
      };
    }
  };
  return api;
}
