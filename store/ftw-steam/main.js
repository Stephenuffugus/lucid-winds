/* Flock the World — Steam desktop shell.
   The game is landscape-first but fully responsive, so the window is a
   comfortable 16:9-ish landscape fitted to the screen it lands on, with no
   aspect lock (the game reflows itself). Everything loads from disk: a Steam
   build must never need our host to be up. */
const { app, BrowserWindow, shell, Menu, screen } = require('electron');
const path = require('path');

function createWindow() {
  /* fit the screen it actually lands on (the Jimothy 1366x768 lesson):
     size off the work area, never a fixed frame taller than a cheap laptop */
  const work = screen.getPrimaryDisplay().workAreaSize;
  const width  = Math.max(960, Math.min(1440, work.width  - 80));
  const height = Math.max(560, Math.min(900,  work.height - 80));

  const win = new BrowserWindow({
    width,
    height,
    minWidth: 800,
    minHeight: 480,
    center: true,
    backgroundColor: '#05070b',
    title: 'Flock the World',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false
    }
  });

  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, 'app', 'index.html'));

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
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
