import type { IpcRenderer } from "electron/renderer";

interface Channels {
  enable: string;
  disable: string;
  preload: string;
}

export function channelId(storeId: string): Channels {
  return {
    enable: `yn-enable-preload-${storeId}`,
    disable: `yn-disable-preload-${storeId}`,
    preload: `file:///yn-preload-${storeId}`,
  };
}

type PreloadEnableInvoke = (script: string) => Promise<void>;
export type PreloadEnableHandler = (
  evt: Electron.IpcMainInvokeEvent,
  ...args: Parameters<PreloadEnableInvoke>
) => any;

export function buildPreloadLoader(ctx: {
  ipcRenderer: IpcRenderer;
  channel: Channels;
}): { enable: PreloadEnableInvoke; disable: () => Promise<void> } {
  return {
    enable: (script) => {
      return ctx.ipcRenderer.invoke(ctx.channel.enable, script);
    },
    disable: () => {
      return ctx.ipcRenderer.invoke(ctx.channel.disable);
    },
  };
}
