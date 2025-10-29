import path from "path";
import type { BrowserWindowConstructorOptions } from "electron";

const BUILD_ROOT = path.resolve(__dirname, "..");
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

export const START_URL = "https://messenger.360.yandex.ru";
export const APP_NAME = "Yandex Messenger";
export const DEFAULT_BROWSER = "firefox";
export const UA_CHROME_VERSION = "Chrome/141.0.7390.124";

export const ICON_PATH = path.join(PROJECT_ROOT, "icons", "icon.png");
export const PRELOAD_PATH = path.join(BUILD_ROOT, "preload.js");

export type AllowedPermission =
	| "notifications"
	| "media"
	| "camera"
	| "microphone"
	| "display-capture"
	| "clipboard-read"
	| "clipboard-sanitized-write";

export const ALLOWED_PERMISSIONS: ReadonlySet<AllowedPermission> = Object.freeze(
	new Set<AllowedPermission>([
		"notifications",
		"media",
		"camera",
		"microphone",
		"display-capture",
		"clipboard-read",
		"clipboard-sanitized-write",
	]),
);

export const WINDOW_CONFIG: Readonly<BrowserWindowConstructorOptions> = Object.freeze({
	width: 1200,
	height: 800,
	minWidth: 900,
	minHeight: 600,
	autoHideMenuBar: true,
	show: true,
	title: APP_NAME,
	icon: ICON_PATH,
	webPreferences: {
		preload: PRELOAD_PATH,
		contextIsolation: true,
		nodeIntegration: false,
		sandbox: false,
	},
});

export const ROOT_DIR = PROJECT_ROOT;
