import { app, BrowserWindow, Menu } from "electron";
import { START_URL, WINDOW_CONFIG, UA_CHROME_VERSION } from "./config";
import { isYandexUrl, openExternalSafe } from "./browser";
import { createApplicationMenu } from "./menu";
import { createTray } from "./tray";

let mainWindow: BrowserWindow | null = null;
let quitting = false;

function mutateUserAgent(win: BrowserWindow): void {
	const original = win.webContents.getUserAgent();
	const ua = original
		.replace(/Electron\/[0-9.]+\s?/g, "")
		.replace(/Chrome\/[0-9.]+\s?/g, `${UA_CHROME_VERSION} `)
		.trim();
	win.webContents.setUserAgent(ua);
}

function focusWindow(win: BrowserWindow | null): void {
	if (!win || win.isDestroyed()) return;
	if (!win.isVisible()) win.show();
	if (win.isMinimized()) win.restore();
	win.focus();
	if (typeof win.flashFrame === "function") {
		win.flashFrame(false);
	}
}

interface CreateMainWindowOptions {
	startInTray?: boolean;
	onQuit?: () => void;
}

export function createMainWindow({ startInTray = false, onQuit }: CreateMainWindowOptions = {}): BrowserWindow {
	const win = new BrowserWindow({
		...WINDOW_CONFIG,
		show: false,
	});

	mutateUserAgent(win);

	win.webContents.setWindowOpenHandler(({ url }) => {
		if (isYandexUrl(url)) return { action: "allow" };
		openExternalSafe(url);
		return { action: "deny" };
	});

	win.webContents.on("will-navigate", (event, targetUrl) => {
		if (!isYandexUrl(targetUrl)) {
			event.preventDefault();
			openExternalSafe(targetUrl);
		}
	});

	win.loadURL(START_URL).catch((err) => {
		console.error("Failed to load start URL", err);
	});

	win.once("ready-to-show", () => {
		if (!startInTray) win.show();
	});

	win.on("focus", () => {
		if (typeof win.flashFrame === "function") {
			win.flashFrame(false);
		}
	});

	win.webContents.on("dom-ready", () => {
		win.webContents
			.executeJavaScript(
				"try{if(window.Notification&&window.Notification.permission!=='granted'&&window.Notification.requestPermission){window.Notification.requestPermission().catch(()=>{});}}catch{}",
			)
			.catch(() => {});
	});

	win.on("close", (event) => {
		if (!quitting) {
			event.preventDefault();
			win.hide();
		}
	});

	win.on("closed", () => {
		if (mainWindow === win) {
			mainWindow = null;
		}
	});

	const menu = createApplicationMenu(win);
	Menu.setApplicationMenu(menu);

	const handleQuit =
		typeof onQuit === "function"
			? onQuit
			: () => {
					setQuitting(true);
					app.quit();
			  };

	createTray(win, handleQuit);

	mainWindow = win;
	return win;
}

export function getMainWindow(): BrowserWindow | null {
	return mainWindow;
}

export function focusMainWindow(): void {
	focusWindow(mainWindow);
}

export function setQuitting(value: boolean): void {
	quitting = Boolean(value);
}

export function isQuitting(): boolean {
	return quitting;
}

export { focusWindow };
