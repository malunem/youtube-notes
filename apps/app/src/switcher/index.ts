import type YnPlugin from "@/yn-main";
import { MediaSwitcherModal } from "./modal";
import { registerProtocol } from "./protocol";

export function initSwitcher(plugin: YnPlugin) {
  function openSwitcher() {
    new MediaSwitcherModal(plugin).open();
  }
  plugin.addCommand({
    id: "open-media-switcher",
    name: "Open media",
    icon: "play",
    callback: openSwitcher,
  });
  plugin.addRibbonIcon("play", "Open media", openSwitcher);
  registerProtocol(plugin);
}
