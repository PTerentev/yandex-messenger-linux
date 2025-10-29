const { contextBridge, ipcRenderer } = require('electron');

(function patchNotifications() {
  const NativeNotification = window.Notification;

  // Always report permission as granted
  Object.defineProperty(window.Notification, 'permission', { get: () => 'granted' });
  window.Notification.requestPermission = async () => 'granted';

  // Proxy constructor
  function ProxyNotification(title, options = {}) {
    try {
      // forward to main to show a native notification and update tray/badges
      ipcRenderer.send('notify:show', { title, options });

      // optionally still create real renderer-side notification (for in-page behavior)
      return new NativeNotification(title, options);
    } catch {
      return new NativeNotification(title, options);
    }
  }
  ProxyNotification.prototype = NativeNotification.prototype;
  ProxyNotification.permission = 'granted';
  ProxyNotification.requestPermission = window.Notification.requestPermission;

  // Replace global Notification
  window.Notification = ProxyNotification;
})();