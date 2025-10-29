import { ipcMain, Notification } from "electron";
import { APP_NAME, ICON_PATH } from "./config";
import { focusWindow, getMainWindow } from "./windowManager";

interface NotificationPayload {
	title?: string;
	options?: {
		body?: string;
		silent?: boolean;
		icon?: string;
		urgency?: "low" | "normal" | "critical";
	};
}

let registered = false;

type NormalizedOptions = NonNullable<NotificationPayload["options"]>;

function normalizePayload(payload: NotificationPayload = {}): Electron.NotificationConstructorOptions {
	const { title, options } = payload;
	const opts = (options ?? {}) as NormalizedOptions;

	const normalized: Electron.NotificationConstructorOptions = {
		title: typeof title === "string" && title.trim() ? title.trim() : APP_NAME,
		body: typeof opts.body === "string" ? opts.body : "",
		silent: Boolean(opts.silent),
		icon: typeof opts.icon === "string" && opts.icon.trim() ? opts.icon : ICON_PATH,
	};

	if (typeof opts.urgency === "string" && ["low", "normal", "critical"].includes(opts.urgency)) {
		normalized.urgency = opts.urgency;
	}

	return normalized;
}

export function showNativeNotification(payload: NotificationPayload): void {
	if (!Notification.isSupported()) return;

	const notification = new Notification(normalizePayload(payload));
	notification.on("click", () => focusWindow(getMainWindow()));
	notification.show();

	const win = getMainWindow();
	if (win && !win.isDestroyed() && !win.isFocused()) {
		win.flashFrame?.(true);
	}
}

export function registerNotificationBridge(): void {
	if (registered) return;
	registered = true;

	ipcMain.on("notify:show", (_event, payload: NotificationPayload) => {
		try {
			showNativeNotification(payload);
		} catch (err) {
			console.error("Failed to display notification", err);
		}
	});
}
