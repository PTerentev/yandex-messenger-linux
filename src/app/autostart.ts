import fs from "fs/promises";
import os from "os";
import path from "path";
import type { App } from "electron";
import { APP_NAME } from "./config";
import { ENVIRONMENTS, getEnvironment } from "./env";

const DESKTOP_FILE_NAME = "yandex-messenger.electron.desktop";

function getAutostartDir(): string {
	return path.join(os.homedir(), ".config", "autostart");
}

export function getDesktopFilePath(): string {
	return path.join(getAutostartDir(), DESKTOP_FILE_NAME);
}

function resolveExecPath(): string {
	const appImage = process.env.APPIMAGE;
	if (appImage && appImage.trim().length > 0) {
		return appImage;
	}
	return process.execPath;
}

function buildDesktopContent(app: App, execPath: string): string {
	const name = typeof app.getName === "function" ? app.getName() : APP_NAME;
	const lines = [
		"[Desktop Entry]",
		"Type=Application",
		"Version=1.0",
		`Name=${name}`,
		"Comment=Start on login",
		`Exec="${execPath}" --start-in-tray`,
		"Icon=yandex-messenger",
		"Terminal=false",
		"X-GNOME-Autostart-enabled=true",
		"Categories=Network;",
	];
	return lines.join("\n");
}

export async function isAutostartEnabled(): Promise<boolean> {
	try {
		await fs.access(getDesktopFilePath());
		return true;
	} catch {
		return false;
	}
}

export async function ensureAutostart(app: App): Promise<boolean> {
	const autostartDir = getAutostartDir();
	const desktopPath = getDesktopFilePath();

	await fs.mkdir(autostartDir, { recursive: true });

	const desired = buildDesktopContent(app, resolveExecPath());
	let current: string | null = null;
	try {
		current = await fs.readFile(desktopPath, "utf8");
	} catch {
		// ignore missing file
	}

	if (current !== desired) {
		await fs.writeFile(desktopPath, desired, { encoding: "utf8" });
	}

	return true;
}

export function shouldEnableAutostart(): boolean {
	return getEnvironment() === ENVIRONMENTS.PRODUCTION;
}
