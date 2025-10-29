const { app, Menu, Tray, nativeImage } = require('electron');
const { APP_NAME, ICON_PATH } = require('./config');

let tray = null;

function createTray(win, onQuit) {
  if (tray) tray.destroy();

  const image = nativeImage.createFromPath(ICON_PATH);
  tray = new Tray(image);
  tray.setToolTip(APP_NAME);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show/Hide',
      click: () => {
        if (win.isVisible()) win.hide();
        else win.show();
      }
    },
    { label: 'Reload', click: () => win.reload() },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        if (typeof onQuit === 'function') onQuit();
        else app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (win.isVisible()) win.hide();
    else win.show();
  });

  return tray;
}

module.exports = {
  createTray
};
