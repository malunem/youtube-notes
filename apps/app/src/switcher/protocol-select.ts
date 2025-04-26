import { fileURLToPath } from "url";
import { FuzzySuggestModal } from "obsidian";
import noop from "@/lib/no-op";
import type YnPlugin from "@/yn-main";
interface FileProtocol {
  action: string;
  url: string;
  path: string;
}

export class FileProtocolModal extends FuzzySuggestModal<FileProtocol> {
  static choose(plugin: YnPlugin): Promise<FileProtocol | null> {
    return new Promise((resolve) => {
      const modal = new FileProtocolModal(plugin);
      modal.open();
      modal.resolve = resolve;
    });
  }

  constructor(public plugin: YnPlugin) {
    super(plugin.app);
  }

  getItems(): FileProtocol[] {
    return this.plugin.settings
      .getState()
      .getUrlMappingData()
      .filter(
        (d) => d.appId === this.app.appId && d.replace.startsWith("file://"),
      )
      .map((d) => ({
        action: d.protocol,
        path: fileURLToPath(d.replace),
        url: d.replace,
      }));
  }

  getItemText(item: FileProtocol): string {
    return `yn://${item.action}: ${item.path}`;
  }

  resolve: (item: FileProtocol | null) => void = noop;

  onChooseItem(item: FileProtocol): void {
    this.resolve(item);
  }
  onClose(): void {
    super.onClose();
    setTimeout(() => {
      this.resolve(null);
    }, 0);
  }
}
