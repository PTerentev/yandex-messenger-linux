import { app, BrowserWindow, session } from "electron";
import { ensureAutostart, shouldEnableAutostart } from "./app/autostart";
import { loadEnv } from "./app/env";
import { registerNotificationBridge } from "./app/notifications";
import { registerSessionGuards } from "./app/permissions";
import { createMainWindow, focusMainWindow, getMainWindow, setQuitting } from "./app/windowManager";

loadEnv();

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
	app.quit();
	try {
		process.exit(0);
	} catch {
		// ignore inability to exit synchronously
	}
} else {
	app.on("second-instance", () => {
		const win = getMainWindow();
		if (win) {
			focusMainWindow();
			return;
		}
		createWindowWithTray();
	});
}

function createWindowWithTray(): BrowserWindow {
	return createMainWindow({
		startInTray: process.argv.includes("--start-in-tray"),
		onQuit: () => {
			setQuitting(true);
			app.quit();
		},
	});
}

async function bootstrap(): Promise<void> {
	registerSessionGuards(session.defaultSession);
	registerNotificationBridge();

	createWindowWithTray();

	if (shouldEnableAutostart()) {
		try {
			await ensureAutostart(app);
		} catch (err) {
			console.error("Failed to configure autostart", err);
		}
	}

	app.on("activate", () => {
		const win = getMainWindow();
		if (!win) {
			createWindowWithTray();
			return;
		}
		focusMainWindow();
	});
}

app.whenReady()
	.then(bootstrap)
	.catch((err) => {
		console.error("Failed to initialize application", err);
		app.quit();
	});

app.on("before-quit", () => {
	setQuitting(true);
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		// Keep running in the tray until the user chooses Quit.
	}
});
