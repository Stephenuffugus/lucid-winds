/* Jumping Jimothy — Steam bridge (main process).
   Achievements go through here and nowhere else. steamworks.js is a native
   module, so it lives in the main process behind IPC; the renderer keeps
   contextIsolation on and never sees Node.

   Without a running Steam client (a reviewer double-clicking the exe, or this
   box), init throws. That is caught and the game runs exactly as before with
   `on:false`. Nothing in the game waits on Steam. */
'use strict';
const { ipcMain } = require('electron');
const APP_ID = 5043360;
let client = null, why = 'not started';

function start() {
  try {
    const sw = require('steamworks.js');
    client = sw.init(APP_ID);
    why = 'ok';
  } catch (e) {
    client = null; why = String(e && e.message || e).split('\n')[0].slice(0, 160);
  }
  ipcMain.handle('steam:status', () => ({ on: !!client, why }));
  ipcMain.handle('steam:unlock', (_e, api) => unlock(api));
  ipcMain.handle('steam:sync', (_e, apis) => (Array.isArray(apis) ? apis : []).map(unlock));
  return { on: !!client, why };
}

/* activate is idempotent on Valve's side, but isActivated first keeps the log
   quiet and skips the store round trip on a boot sync of two dozen names. */
function unlock(api) {
  if (!client || typeof api !== 'string' || !/^ACH_[A-Z0-9_]{1,60}$/.test(api)) return false;
  try {
    if (client.achievement.isActivated(api)) return true;
    const ok = client.achievement.activate(api);
    return !!ok;
  } catch (e) { return false; }
}

/* Steamworks needs its callbacks pumped for stats to persist; steamworks.js
   does that on its own timer once init succeeds. Nothing to do here. */
module.exports = { start, unlock, isOn: () => !!client, why: () => why };
