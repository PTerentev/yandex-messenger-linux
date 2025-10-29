import { spawn } from "child_process";
import { DEFAULT_BROWSER } from "./config";

const CHROMIUM_LIKE_REGEX = /chrome|chromium|brave|edge/i;

export function resolveBrowserBinary(): string {
	return process.env.YAM_BROWSER?.trim() || DEFAULT_BROWSER;
}

export function openExternalSafe(rawUrl: string): void {
	let target = rawUrl;

	try {
		target = new URL(rawUrl).toString();
	} catch {
		// ignore malformed URLs – fall back to the raw string
	}

	const browser = resolveBrowserBinary();
	const tabFlag = CHROMIUM_LIKE_REGEX.test(browser) ? "--new-tab" : "-new-tab";

	try {
		const child = spawn(browser, [tabFlag, target], {
			stdio: "ignore",
			detached: true,
		});
		child.unref();
	} catch (err) {
		console.error("Failed to open external URL", target, err);
	}
}

export function isYandexUrl(rawUrl: string): boolean {
	try {
		const { hostname } = new URL(rawUrl);
		return (
			hostname === "yandex.ru" ||
			hostname === "yandex.com" ||
			hostname.endsWith(".yandex.ru") ||
			hostname.endsWith(".yandex.com")
		);
	} catch {
		return false;
	}
}
