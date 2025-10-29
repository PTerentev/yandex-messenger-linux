# Project Structure

```
.
├── app/                 # Main-process modules (config, tray, permissions, notifications)
│   ├── browser.js
│   ├── config.js
│   ├── menu.js
│   ├── notifications.js
│   ├── permissions.js
│   ├── tray.js
│   └── windowManager.js
├── dist/                # Build artifacts (ignored in Git)
├── icons/               # Application icons packaged with the app
├── node_modules/        # Dependencies (ignored in Git)
├── preload.js           # Renderer preload script
├── main.js              # Electron entry point wiring the modules above
├── package.json
├── package-lock.json
├── README.md
└── docs/PROJECT_STRUCTURE.md
```

Update this document if you add new top-level folders so Git contributors can keep the repository organised.
