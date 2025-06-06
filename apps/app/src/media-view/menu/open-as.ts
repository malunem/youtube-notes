/* eslint-disable @typescript-eslint/naming-convention */
import type { MenuItem, Menu } from "obsidian";
import type { MediaURL } from "@/info/media-url";
import type { RemoteMediaViewType } from "@/media-view/view-type";
import type YnPlugin from "@/yn-main";

const mediaTypeDisplay: Record<
  RemoteMediaViewType,
  { label: string; icon: string }
> = {
  "yn-embed": { label: "iframe", icon: "code" },
  "yn-url-audio": { label: "regular audio", icon: "headphones" },
  "yn-url-video": { label: "regular video", icon: "film" },
  "yn-webpage": { label: "webpage", icon: "globe" },
};

function setLabel(
  item: MenuItem,
  viewType: RemoteMediaViewType,
  noPrefix = false,
) {
  const label = mediaTypeDisplay[viewType].label;
  return item
    .setTitle(noPrefix ? label : `Open as ${label}`)
    .setIcon(mediaTypeDisplay[viewType].icon);
}

export function openAsMenu(
  menu: Menu,
  {
    mode,
    plugin,
    targetViewTypes,
    open = true,
    url,
  }: {
    url: MediaURL;
    mode: "always" | "once";
    open?: boolean;
    plugin: YnPlugin;
    targetViewTypes: RemoteMediaViewType[];
  },
) {
  const { protocol, hostname, pathname, host, port } = url;
  if (targetViewTypes.length === 0) return;

  if (mode === "once") {
    targetViewTypes.forEach((viewType) => {
      if (!open) {
        throw new Error(
          "openAsMenu: cannot set 'open' to false in 'open once' mode",
        );
      }
      menu.addItem((item) =>
        setLabel(item, viewType)
          .setSection("yn-link")
          .onClick(async () => {
            await plugin.leafOpener.openMedia(url, undefined, {
              viewType,
              fromUser: true,
            });
          }),
      );
    });
  }

  if (mode === "always") {
    menu.addItem((item) => {
      const matchUrl = item
        .setTitle("Always open this url as")
        .setIcon("external-link")
        .setSection("yn-link")
        .setSubmenu();
      targetViewTypes.forEach((viewType) => {
        matchUrl.addItem((item) =>
          setLabel(item, viewType, true)
            .setSection("yn-link")
            .onClick(async () => {
              plugin.urlViewType.setPreferred(
                { protocol, hostname, pathname, port },
                viewType,
              );
              if (!open) return;
              await plugin.leafOpener.openMedia(url, undefined, {
                viewType,
                fromUser: true,
              });
            }),
        );
      });
    });
    if (hostname)
      menu.addItem((item) => {
        const matchHostname = item
          .setTitle(`Always open ${host} as`)
          .setIcon("external-link")
          .setSection("yn-link")
          .setSubmenu();
        targetViewTypes.forEach((viewType) => {
          matchHostname.addItem((item) =>
            setLabel(item, viewType, true)
              .setSection("yn-link")
              .onClick(async () => {
                plugin.urlViewType.setPreferred(
                  { protocol, hostname, port },
                  viewType,
                );
                if (!open) return;
                await plugin.leafOpener.openMedia(url, undefined, {
                  viewType,
                  fromUser: true,
                });
              }),
          );
        });
      });
  }
}
