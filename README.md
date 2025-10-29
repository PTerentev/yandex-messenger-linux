# Yandex Messenger (Electron)

A minimal Electron app that opens https://messenger.360.yandex.ru and behaves like a single Chrome tab.

## Run in dev
```bash
cd yandex-messenger-electron
npm i
npm start
```

## Build AppImage (Linux)
```bash
npm run dist
```

The AppImage will be in the `dist/` folder. You can mark it executable and run:
```bash
chmod +x dist/Yandex\ Messenger-*.AppImage
./dist/Yandex\ Messenger-*.AppImage
```

## Notes
- Notifications, camera, and microphone permissions are auto-approved for *.yandex.ru and *.yandex.com only.
- External (non-Yandex) links open in your default browser.
- Use Alt+Left / Alt+Right to navigate back/forward; Ctrl+R to reload.
- Menu is hidden by default; press Alt to reveal it.
- No Node integration in the page for safety; contextIsolation is enabled.


## Tray & Notifications
- App minimizes to the system tray instead of exiting. Use the tray icon menu → Quit.
- Click the tray icon to toggle show/hide.
- Start hidden in tray: `npm start -- --start-in-tray`
- Notifications/mic/cam are auto-approved for yandex.ru/yandex.com domains.
- On some distros you may need `sudo apt install libappindicator3-1` to show the tray (AppIndicator).
