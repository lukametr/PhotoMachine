const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const processPayment = require('./payment/payment');
const { exec } = require('child_process');

let mainWindow = null;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'renderer', 'renderer.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('start-payment', async () => {
  return await processPayment();
});

ipcMain.handle('start-dslrbooth', async () => {
  if (mainWindow) mainWindow.hide();
  const fetch = require('node-fetch');

  // Trigger new photobooth session via custom API
  try {
    const res = await fetch('http://localhost:1500/api/start?mode=print&password=ZDukRQr3trbdrP3L');
    const text = await res.text();
    console.log('API response:', text);
  } catch (e) {
    console.error('API error:', e);
    if (mainWindow) mainWindow.show();
    return false;
  }

  // OPTIONAL: Poll for session completion if API იძლევა ასეთ ინფორმაციას
  // თუ API-ს აქვს სესიის სტატუსის ან დასრულების endpoint, აქ დაამატე polling
  // მაგალითად:
  // for (let i = 0; i < 60; i++) {
  //   const res = await fetch('http://localhost:1500/api/status?password=ZDukRQr3trbdrP3L');
  //   const data = await res.json();
  //   if (data.status === 'idle') break;
  //   await new Promise(r => setTimeout(r, 2000));
  // }

  // თუ polling არ არის საჭირო, უბრალოდ დააბრუნე აპი მთავარ ეკრანზე მცირე დაყოვნების შემდეგ
  setTimeout(() => {
    if (mainWindow) mainWindow.show();
  }, 5000); // 5 წამი სესიისთვის (შეგიძლია შეცვალო საჭიროების მიხედვით)

  return true;
}); 