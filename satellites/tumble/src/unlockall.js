// The tester switch: ?unlockall=1 opens everything on this device, ?unlockall=restore puts the real save back.
// It answers only on a device that already passed the workbench door (localStorage sws_dev_ok === '1', set by
// /dev-gate.js and the portal's Test Lab), so a player who types the parameter gets nothing, and the Play app's
// start URL is fixed, so it cannot be reached there at all. &tier=0..9 also sets the difficulty to look at.
// Pure over its arguments so Node can test it (tests/unlockall.test.mjs).
import { grantEverything } from './economy.js';

export const BACKUP_KEY = 'tumble-save-backup-unlockall';

// storage: { getItem, setItem }. Returns { did: 'none' | 'unlocked' | 'restored', data? }.
// 'restored' hands back the saved data; the caller replaces the store with it and only then removes the backup.
export function runUnlockAll({ params, storage, save, ctx, now }) {
  const want = params.get('unlockall');
  if (!want) return { did: 'none' };
  let tester = false;
  try { tester = storage.getItem('sws_dev_ok') === '1'; } catch (e) { tester = false; }
  if (!tester) return { did: 'none' };

  if (want === 'restore') {
    let data = null;
    try { data = JSON.parse(storage.getItem(BACKUP_KEY) || 'null'); } catch (e) { data = null; }
    return data && typeof data === 'object' ? { did: 'restored', data } : { did: 'none' };
  }

  // never grant without a backup, and never overwrite the first one: it is his real save
  try {
    if (!storage.getItem(BACKUP_KEY)) storage.setItem(BACKUP_KEY, JSON.stringify(save));
    if (!storage.getItem(BACKUP_KEY)) return { did: 'none' };
  } catch (e) { return { did: 'none' }; }

  const tier = /^\d$/.test(params.get('tier') || '') ? Number(params.get('tier')) : undefined;
  grantEverything(save, ctx, { now, tier });
  return { did: 'unlocked' };
}
