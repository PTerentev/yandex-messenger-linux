import { desktopCapturer } from "electron";
import type {
	FilesystemPermissionRequest,
	MediaAccessPermissionRequest,
	OpenExternalPermissionRequest,
	PermissionCheckHandlerHandlerDetails,
	PermissionRequest,
	Session,
	WebContents,
} from "electron";
import { ALLOWED_PERMISSIONS, type AllowedPermission } from "./config";

type PermissionRequestDetails =
	| PermissionRequest
	| FilesystemPermissionRequest
	| MediaAccessPermissionRequest
	| OpenExternalPermissionRequest;

function isYandexOrigin(raw = ""): boolean {
	try {
		const { hostname, protocol } = new URL(raw);
		if (protocol !== "https:") return false;
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

function allowsMedia(details?: PermissionCheckHandlerHandlerDetails | PermissionRequestDetails): boolean {
	if (!details) return true;

	if ("mediaTypes" in details && Array.isArray(details.mediaTypes)) {
		return details.mediaTypes.every((type) => type === "audio" || type === "video");
	}

	if ("mediaType" in details && details.mediaType) {
		return details.mediaType === "audio" || details.mediaType === "video";
	}

	return true;
}

export function registerSessionGuards(sess: Session): void {
	sess.setPermissionCheckHandler((_wc: WebContents | null, permission, origin, details) => {
		if (!isYandexOrigin(origin)) return false;
		if (permission === "media") {
			return allowsMedia(details);
		}
		return ALLOWED_PERMISSIONS.has(permission as AllowedPermission);
	});

	sess.setPermissionRequestHandler((wc, permission, callback, details) => {
		const origin =
			details.requestingUrl ||
			("securityOrigin" in details ? details.securityOrigin : "") ||
			(typeof wc.getURL === "function" ? wc.getURL() : "");

		if (!isYandexOrigin(origin)) return callback(false);
		if (permission === "media") return callback(allowsMedia(details));
		return callback(ALLOWED_PERMISSIONS.has(permission as AllowedPermission));
	});

	if (typeof sess.setDevicePermissionHandler === "function") {
		sess.setDevicePermissionHandler(() => false);
	}

	if (typeof sess.setDisplayMediaRequestHandler === "function") {
		sess.setDisplayMediaRequestHandler((request, callback) => {
			if (!isYandexOrigin(request.securityOrigin)) {
				callback({});
				return;
			}

			desktopCapturer
				.getSources({ types: ["screen", "window"] })
				.then((sources) => {
					const videoSource = sources.find((source) => source.id.startsWith("screen:")) || sources[0];
					if (videoSource) {
						callback({ video: videoSource });
					} else {
						callback({});
					}
				})
				.catch((err) => {
					console.error("Failed to enumerate display media sources", err);
					callback({});
				});
		});
	}
}
