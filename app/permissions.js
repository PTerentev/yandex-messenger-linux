const { ALLOWED_PERMISSIONS } = require('./config');

function allowsMedia(details) {
  const types = (details && details.mediaTypes) || [];
  return types.every((type) => type === 'audio' || type === 'video');
}

function registerSessionGuards(sess) {
  sess.setPermissionCheckHandler((_wc, permission, _origin, details) => {
    if (permission === 'media') return allowsMedia(details);
    return ALLOWED_PERMISSIONS.has(permission);
  });

  sess.setPermissionRequestHandler((_wc, permission, callback, details) => {
    if (permission === 'media') return callback(allowsMedia(details));
    callback(ALLOWED_PERMISSIONS.has(permission));
  });

  if (typeof sess.setDevicePermissionHandler === 'function') {
    sess.setDevicePermissionHandler((details) => {
      if (details.deviceType === 'media') return allowsMedia(details);
      return false;
    });
  }
}

module.exports = {
  registerSessionGuards
};
