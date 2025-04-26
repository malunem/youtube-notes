import type { PaneType, TFile } from "obsidian";
import type YnPlugin from "@/yn-main";

export interface LinkEvent {
  onExternalLinkClick(
    this: YnPlugin,
    url: string,
    newLeaf: false | PaneType,
    fallback: () => void,
  ): any;
  onInternalLinkClick(
    this: YnPlugin,
    linktext: string,
    sourcePath: string,
    newLeaf: false | PaneType | undefined,
    fallback: () => void,
  ): any;
}

export type MediaEmbedSource = "popover" | "view" | "embed";
export interface MediaEmbedRenderHandler {
  (
    type: "video" | "audio",
    el: HTMLElement,
    file: TFile,
    source: MediaEmbedSource,
    fallback: () => Promise<void>,
  ): Promise<void>;
}
