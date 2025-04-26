import { TFile } from "obsidian";
import type YnPlugin from "@/yn-main";
import { registerControlCommands } from "./command/media";
import { registerNoteCommands } from "./command/note";

export function handleMediaNote(this: YnPlugin) {
  this.registerEvent(
    this.app.workspace.on("file-menu", (menu, file, _source, _leaf) => {
      if (!(file instanceof TFile)) return;
      const mediaInfo = this.mediaNote.findMedia(file);
      if (!mediaInfo) return;
      menu.addItem((item) =>
        item
          .setSection("view")
          .setIcon("play")
          .setTitle("Open linked media")
          .onClick(() =>
            this.leafOpener.openMedia(mediaInfo, undefined, { fromUser: true }),
          ),
      );
    }),
  );
  registerNoteCommands(this);
  registerControlCommands(this);
}
