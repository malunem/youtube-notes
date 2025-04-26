/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import preloadScript from "inline:./scripts/preload";
import preloadLoader from "inline:./scripts/preload-patch";
import userScript from "inline:./scripts/userscript";
import { Component, Platform, WorkspaceWindow } from "obsidian";
import path from "@/lib/path";
import {
  evalInMainProcess,
  getFsPromise,
  getUserDataPath,
} from "@/lib/require";
import type YnPlugin from "@/yn-main";
import { buildPreloadLoader, channelId } from "./channel";
import { BILI_REQ_STORE, replaceEnv } from "./const";

const preloadLoaderCode = replaceEnv(preloadLoader);
const userScriptCode = replaceEnv(userScript);
const preloadScriptCode = replaceEnv(preloadScript).replace(
  "__USERSCRIPT__",
  JSON.stringify(userScriptCode),
);
const channel = channelId(BILI_REQ_STORE);

declare module "obsidian" {
  interface MetadataCache {
    on(name: "yn:preload-ready", callback: () => any, ctx?: any): EventRef;
    on(
      name: "yn:preload-error",
      callback: (err: unknown) => any,
      ctx?: any,
    ): EventRef;
    trigger(name: "yn:preload-ready"): void;
    trigger(name: "yn:preload-error", err: unknown): void;
  }
  interface Workspace {
    floatingSplit: {
      children: WorkspaceWindow[];
    };
  }
}

export class WebviewPreload extends Component {
  get app() {
    return this.plugin.app;
  }
  constructor(public plugin: YnPlugin) {
    super();
  }

  /**
   * null if load failed
   */
  ready: boolean | null = false;

  private onReady(): void {
    this.ready = true;
    this.app.metadataCache.trigger("yn:preload-ready");
  }
  private onError(err: unknown): void {
    console.error("Failed to load preload", err);
    this.ready = null;
    this.app.metadataCache.trigger("yn:preload-error", err);
  }

  untilReady(timeout = 5e3): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ready) return resolve();
      if (this.ready === null) return reject(new Error("Cannot load"));
      const onReady = () => {
        this.app.metadataCache.off("yn:preload-ready", onReady);
        this.app.metadataCache.off("yn:preload-error", onError);
        resolve();
      };
      const onError = (err: unknown) => {
        this.app.metadataCache.off("yn:preload-ready", onReady);
        this.app.metadataCache.off("yn:preload-error", onError);
        reject(err);
      };
      this.app.metadataCache.on("yn:preload-ready", onReady);
      this.app.metadataCache.on("yn:preload-error", onError);
      setTimeout(() => {
        onError(new Error("Timeout"));
      }, timeout);
    });
  }

  onload(): void {
    if (!Platform.isDesktopApp) {
      this.onReady();
      return;
    }
    const fs = getFsPromise()!;

    const userDataDir = getUserDataPath();
    const preloadLoaderPath = path.join(
      userDataDir,
      `yn-player-hack.${Date.now()}.js`,
    );
    const preloadScriptPath = path.join(
      userDataDir,
      `yn-preload.${Date.now()}.js`,
    );

    (async () => {
      await Promise.all([
        fs.writeFile(preloadLoaderPath, preloadLoaderCode, "utf-8"),
        fs.writeFile(preloadScriptPath, preloadScriptCode, "utf-8"),
      ]);
      // console.log(preloadLoaderPath, preloadScriptPath);
      this.register(() => {
        fs.rm(preloadScriptPath, { force: true, maxRetries: 5 }).catch((e) =>
          console.warn("Failed to remove preload script", preloadScriptPath, e),
        );
      });
      try {
        await evalInMainProcess(preloadLoaderPath);
        console.debug("preload patch loaded");
      } finally {
        await fs
          .rm(preloadLoaderPath, { force: true, maxRetries: 5 })
          .catch((e) =>
            console.warn("Failed to remove hack script", preloadLoaderPath, e),
          );
      }
      const { enable, disable } = buildPreloadLoader({
        ipcRenderer: require("electron").ipcRenderer,
        channel,
      });

      await enable(preloadScriptPath);
      this.app.workspace.onLayoutReady(() => {
        this.app.workspace.floatingSplit.children.forEach((workspaceWin) => {
          if (workspaceWin instanceof WorkspaceWindow) {
            this.enablePreload(preloadScriptPath, workspaceWin.win);
          }
        });
        this.registerEvent(
          this.app.workspace.on("window-open", async (_, win) => {
            await this.enablePreload(preloadScriptPath, win);
          }),
        );
      });

      this.register(disable);
      console.log("yn-player-hack loaded");
      this.onReady();
    })().catch((e) => this.onError(e));
  }

  async enablePreload(scriptPath: string, win: Window) {
    const { ipcRenderer } = (win as any).require("electron");
    const { enable } = buildPreloadLoader({ ipcRenderer, channel });
    await enable(scriptPath);
  }
}
