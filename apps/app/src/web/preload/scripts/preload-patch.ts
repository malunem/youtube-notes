import { ipcMain } from "electron";
import type { WebContents } from "electron/main";
import { webContents } from "electron/main";
import type { PreloadEnableHandler } from "../channel";
import { channelId } from "../channel";
import { storeId } from "./store-id";
const channels = channelId(storeId);

type PreloadHandler = (
  event: { preventDefault: () => void; readonly defaultPrevented: boolean },
  webPreferences: Electron.WebPreferences,
  params: Record<string, string>,
) => void;

const modified = new WeakMap<WebContents, PreloadHandler>();

const handleEnable: PreloadEnableHandler = ({ sender: target }, script) => {
  const preloadHandler: PreloadHandler = (_evt, pref, params) => {
    if (params.preload !== channels.preload) return;
    pref.preload = script;
  };
  if (!modified.has(target)) {
    target.on("will-attach-webview", preloadHandler);
    modified.set(target, preloadHandler);
  }
};

ipcMain.handle(channels.enable, handleEnable);
ipcMain.handle(channels.disable, () => {
  for (const target of webContents.getAllWebContents()) {
    const handler = modified.get(target);
    if (!handler) continue;
    target.off("will-attach-webview", handler);
  }
  ipcMain.removeHandler(channels.enable);
  ipcMain.removeHandler(channels.disable);
});

