/* Jumping Jimothy — Steam desktop shell.
   The game is a portrait phone game, so the window is portrait and the canvas
   letterboxes inside it rather than stretching. Everything loads from disk:
   a Steam build must never need our host to be up. */
const { app, BrowserWindow, shell, Menu, screen } = require('electron');
const path = require('path');
const steam = require('./steam');

/* Steam overlay (Shift+Tab) needs these two Chromium switches set before the app
   is ready. Harmless when Steam is not running. */
try { require('steamworks.js').electronEnableSteamOverlay(); } catch (e) {}
const TEST_BOOT = process.argv.includes('--test-boot');

const ASPECT = 640 / 1136;   // the game's portrait shape, one source of truth

function createWindow() {
  /* ⛔ FIT THE SCREEN IT ACTUALLY LANDS ON (2026-07-31). The window was a fixed
     640x1136, which is TALLER THAN A 1366x768 LAPTOP — the single most common
     cheap-laptop resolution on Steam's own hardware survey. The OS would shove
     it off-screen or crop it, and the player's first frame would be a window
     with its bottom missing. Size off the work area (which already excludes the
     taskbar) and keep the portrait shape. */
  const work = screen.getPrimaryDisplay().workAreaSize;
  const height = Math.max(640, Math.min(1136, work.height - 60));
  const width = Math.round(height * ASPECT);

  const win = new BrowserWindow({
    width,
    height,
    minWidth: 360,
    minHeight: 640,
    center: true,
    backgroundColor: '#0b0f0b',
    title: 'Jumping Jimothy',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  /* Dragging a corner keeps the phone shape instead of stranding the game in a
     letterboxed strip with 650px of black either side. Maximise and fullscreen
     still letterbox — that is unavoidable for a portrait game on a 16:9 screen,
     and the game centres itself cleanly when it happens. */
  try { win.setAspectRatio(ASPECT); } catch (e) {}

  Menu.setApplicationMenu(null);

  /* Fullscreen the way desktop players reach for it: F11 or Alt+Enter toggles,
     Escape leaves it (Escape inside a run is the game's own pause key, so it only
     acts here when the window is actually fullscreen and the game has not eaten
     it). With no application menu there is no default F11 binding at all. */
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    const alt = input.alt && input.key === 'Enter';
    if (input.key === 'F11' || alt) { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
  });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));

  /* --test-boot: prove the shell boots, the bridge is in the page and Steam
     failed soft (or not) — then quit. Run by test/electron_boot.mjs under xvfb. */
  if (TEST_BOOT) {
    win.webContents.on('did-finish-load', async () => {
      try {
        const r = await win.webContents.executeJavaScript(
          `(async()=>({ bridge: typeof window.__steam, status: await window.__steam.status(),
             unlockNoSteam: await window.__steam.unlock('ACH_FIRST'),
             title: document.title, splash: !!document.querySelector('#s-splash') }))()`);
        console.log('TEST_BOOT ' + JSON.stringify(r));
      } catch (e) { console.log('TEST_BOOT_ERROR ' + e.message); }
      setTimeout(() => app.quit(), 300);
    });
  }

  /* any outward link opens in the player's browser, never inside the game */
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) { e.preventDefault(); shell.openExternal(url); }
  });
}

app.whenReady().then(() => {
  const st = steam.start();
  console.log('steam: ' + (st.on ? 'on' : 'off (' + st.why + ')'));
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
