// The tester switch: everything open on this device, and the real save put back afterwards.
// It answers only on a device that already passed the workbench door (localStorage sws_dev_ok === '1', set by
// /dev-gate.js and the portal's Test Lab), so a player gets nothing, and the Play app never shows it.
// TWO WAYS IN, the same code behind both:
//   1. Settings > Tester > "Open everything" / "Put my save back" (added Sep 21 2026: a link is a fragile way to
//      hand something to a phone. lucidwinds.com and www.lucidwinds.com are two origins with two saves, and the first
//      visit after a deploy runs the old cached modules, so the link "did nothing" for Stephen twice.)
//   2. ?unlockall=1 and ?unlockall=restore, with &tier=0..9 to pick the difficulty to look at.
// Pure over its arguments so Node can test it (tests/unlockall.test.mjs).
import { grantEverything } from './economy.js';

export const BACKUP_KEY = 'tumble-save-backup-unlockall';

export function isTester(storage) {
  try { return storage.getItem('sws_dev_ok') === '1'; } catch (e) { return false; }
}

export function hasBackup(storage) {
  try { return !!storage.getItem(BACKUP_KEY); } catch (e) { return false; }
}

// Everything open. Never without a backup, and never over the first backup: that one is his real save.
// Returns true when the save was changed.
export function unlockNow({ storage, save, ctx, now, tier }) {
  if (!isTester(storage)) return false;
  try {
    if (!storage.getItem(BACKUP_KEY)) storage.setItem(BACKUP_KEY, JSON.stringify(save));
    if (!storage.getItem(BACKUP_KEY)) return false;
  } catch (e) { return false; }
  grantEverything(save, ctx, { now, tier });
  return true;
}

// The saved data, or null. The caller replaces the store with it and only then removes the backup.
export function backupData(storage) {
  if (!isTester(storage)) return null;
  let data = null;
  try { data = JSON.parse(storage.getItem(BACKUP_KEY) || 'null'); } catch (e) { data = null; }
  return data && typeof data === 'object' ? data : null;
}

// storage: { getItem, setItem }. Returns { did: 'none' | 'unlocked' | 'restored', data? }.
export function runUnlockAll({ params, storage, save, ctx, now }) {
  const want = params.get('unlockall');
  if (!want || !isTester(storage)) return { did: 'none' };
  if (want === 'restore') {
    const data = backupData(storage);
    return data ? { did: 'restored', data } : { did: 'none' };
  }
  const tier = /^\d$/.test(params.get('tier') || '') ? Number(params.get('tier')) : undefined;
  return unlockNow({ storage, save, ctx, now, tier }) ? { did: 'unlocked' } : { did: 'none' };
}
