const { ipcMain, Notification } = require('electron');
const { APP_NAME, ICON_PATH } = require('./config');
const { focusWindow, getMainWindow } = require('./windowManager');

let registered = false;

function normalizePayload(payload = {}) {
  const { title, options = {} } = payload;
  const normalized = {
    title: typeof title === 'string' && title.trim() ? title.trim() : APP_NAME,
    body: typeof options.body === 'string' ? options.body : '',
    silent: Boolean(options.silent),
    icon: typeof options.icon === 'string' && options.icon.trim() ? options.icon : ICON_PATH
  };

  if (typeof options.urgency === 'string' && ['low', 'normal', 'critical'].includes(options.urgency)) {
    normalized.urgency = options.urgency;
  }

  return normalized;
}

function showNativeNotification(payload) {
  if (!Notification.isSupported()) return;

  const notification = new Notification(normalizePayload(payload));
  notification.on('click', () => focusWindow(getMainWindow()));
  notification.show();
}

function registerNotificationBridge() {
  if (registered) return;
  registered = true;

  ipcMain.on('notify:show', (_event, payload) => {
    try {
      showNativeNotification(payload);
    } catch (err) {
      console.error('Failed to display notification', err);
    }
  });
}

module.exports = {
  registerNotificationBridge,
  showNativeNotification
};
