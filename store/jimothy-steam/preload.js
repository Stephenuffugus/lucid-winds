/* The only door between the game and Steam. The game calls window.__steam.unlock
   with an ACH_ name; everything else about Steam stays in the main process. */
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('__steam', {
  status: () => ipcRenderer.invoke('steam:status'),
  unlock: (api) => ipcRenderer.invoke('steam:unlock', String(api)),
  sync: (apis) => ipcRenderer.invoke('steam:sync', Array.isArray(apis) ? apis.map(String) : [])
});
