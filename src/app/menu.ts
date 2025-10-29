import { BrowserWindow, Menu, MenuItemConstructorOptions } from "electron";

export function createApplicationMenu(win: BrowserWindow): Menu {
	const template: MenuItemConstructorOptions[] = [
		{ label: "App", submenu: [{ role: "quit" }] },
		{
			label: "Edit",
			submenu: [
				{ role: "undo" },
				{ role: "redo" },
				{ type: "separator" },
				{ role: "cut" },
				{ role: "copy" },
				{ role: "paste" },
				{ role: "pasteAndMatchStyle" },
				{ role: "delete" },
				{ role: "selectAll" },
			],
		},
		{
			label: "View",
			submenu: [
				{ role: "reload" },
				{ role: "forceReload" },
				{ role: "toggleDevTools" },
				{ type: "separator" },
				{ role: "resetZoom" },
				{ role: "zoomIn" },
				{ role: "zoomOut" },
				{ type: "separator" },
				{ role: "togglefullscreen" },
			],
		},
		{
			label: "Navigate",
			submenu: [
				{
					label: "Back",
					accelerator: "Alt+Left",
					click: () => {
						if (win.webContents.canGoBack()) win.webContents.goBack();
					},
				},
				{
					label: "Forward",
					accelerator: "Alt+Right",
					click: () => {
						if (win.webContents.canGoForward()) win.webContents.goForward();
					},
				},
			],
		},
	];

	return Menu.buildFromTemplate(template);
}
