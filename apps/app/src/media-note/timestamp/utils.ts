import { Notice } from "obsidian";
import type { App, Editor } from "obsidian";
import { isFileMediaInfo } from "@/info/media-info";
import type { MediaInfo } from "@/info/media-info";
import { insertBeforeCursor, insertToCursor } from "@/lib/cursor";
import { formatDuration, toTempFragString } from "@/lib/hash/format";
import type { TempFragment } from "@/lib/hash/temporal-frag";
import type { YnSettings } from "@/settings/def";

export function insertTimestamp(
  { timestamp, screenshot }: { timestamp: string; screenshot?: string },
  {
    template,
    editor,
    insertBefore: _insertBefore, // not used atm
  }: { template: string; editor: Editor; insertBefore?: boolean },
) {
  console.debug("insert timestamp", { timestamp, screenshot, template });
  let toInsert = template.replace("{{TIMESTAMP}}", timestamp);
  if (screenshot) {
    toInsert = toInsert.replace("{{SCREENSHOT}}", screenshot);
  }
  console.debug("content to insert", toInsert);

  try {
    // Set cursor to end of note when editor is ready
      // const editor = playerComponent?.plugin?.app?.workspace?.activeEditor?.editor
    const lineCount = editor?.lineCount()
    console.log({editor, lineCount})

    editor.setCursor(editor.lineCount(), 0);
    insertToCursor(toInsert + "\n", editor);
  } catch (error) {
    new Notice("Failed to insert timestamp, see console for details");
    console.error("Failed to insert timestamp", error);
  }
}

/**
 * @param time in seconds
 */
export function timestampGenerator(
  time: number,
  mediaInfo: MediaInfo,
  {
    app: { fileManager },
    settings: { timestampOffset },
    duration = +Infinity,
  }: { app: App; settings: YnSettings; duration?: number },
): (newNotePath: string) => string {
  time += timestampOffset;
  if (time < 0) time = 0;
  else if (time > duration) time = duration;

  const timeInDuration = formatDuration(time);
  const frag =
    time > 0 ? ({ start: time, end: -1 } satisfies TempFragment) : undefined;
  const hash = frag ? `#${toTempFragString(frag)!}` : "";

  if (isFileMediaInfo(mediaInfo)) {
    const { file } = mediaInfo;
    return (newNotePath: string) =>
      fileManager
        .generateMarkdownLink(file, newNotePath, hash, timeInDuration)
        .replace(/^!/, "");
  } else {
    const sourceUrl = mediaInfo.print(frag);
    return () => `[${timeInDuration}](${sourceUrl}${hash})`;
  }
}
