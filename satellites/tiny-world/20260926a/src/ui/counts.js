// Test 1's counters (design 14 §7 T14). Seven numbers, per device, in localStorage: how long it took this child
// to do each of the seven things the test wants to know about, in seconds from the first time the game was opened.
// NOTHING ELSE IS KEPT. No identifier, no world, no text the child typed, no times of day: only "how many seconds
// in did this first happen", plus which day of use it was. A counter is latched once and never written again, so
// nothing here grows and nothing here can be used to follow anybody.
// They are read on the device itself: open the game with ?counts and a card shows them. There is no upload.
const KEY = 'tw_counts';
export const COUNTS = ['firstOpen', 'placed', 'poked', 'lifted', 'reaction', 'scrapbook', 'safe', 'dayTwo'];

export function createCounts({ store = safeStorage(), now = () => Date.now() } = {}) {
  let c = read(store);
  if (!c.firstOpen) { c.firstOpen = now(); c.days = 1; write(store, c); }
  else {
    // Day two: opened on a later calendar day than the first time. Only the count of days is kept, never a date.
    const first = new Date(c.firstOpen), today = new Date(now());
    const sameDay = first.getFullYear() === today.getFullYear() && first.getMonth() === today.getMonth() && first.getDate() === today.getDate();
    if (!sameDay && !c.dayTwo) { c.dayTwo = Math.round((now() - c.firstOpen) / 1000); c.days = (c.days || 1) + 1; write(store, c); }
  }
  // Latch one counter, in seconds since this device first opened the game. Latched counters are never rewritten.
  function mark(name) {
    if (!COUNTS.includes(name) || c[name] || name === 'firstOpen') return;
    c[name] = Math.max(0, Math.round((now() - c.firstOpen) / 1000));
    write(store, c);
  }
  return {
    mark,
    // What a command the child gave is worth counting as.
    command(cmd) {
      if (cmd.t === 'place' || cmd.t === 'build') mark('placed');
      else if (cmd.t === 'lift' || cmd.t === 'liftItem') mark('lifted');
      else if (cmd.t === 'setting' && cmd.key === 'safe') mark('safe');
    },
    records(records) { for (const r of records) if (r.kind === 'reaction') { mark('reaction'); return; } },
    get all() { return { ...c }; },
    // The card the device shows for ?counts: one line per counter, in plain words, and nothing else.
    lines(str) {
      return COUNTS.filter((k) => k !== 'firstOpen').map((k) => `${str('counts.' + k)}: ${c[k] ? c[k] + ' s' : str('counts.never')}`)
        .concat(`${str('counts.days')}: ${c.days || 1}`);
    },
  };
}
function read(store) {
  try { const raw = store.getItem(KEY); const o = raw ? JSON.parse(raw) : {}; return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; }
}
function write(store, c) { try { store.setItem(KEY, JSON.stringify(c)); } catch (e) { /* no storage: the counters are this session's only */ } }
function safeStorage() {
  try { return window.localStorage; } catch (e) { return { getItem: () => null, setItem: () => {} }; }
}
