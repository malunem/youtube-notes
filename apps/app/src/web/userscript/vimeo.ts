// hugely inspired by https://greasyfork.org/zh-CN/scripts/4870-maximize-video

const css = `
body:not(.yn-show-controls) .vp-player-ui-overlays {
  opacity: 0 !important;
}
`;

/* eslint-disable @typescript-eslint/naming-convention */
import { requireYn } from "./_require";

const { waitForSelector, MediaPlugin } = requireYn();

export default class VimeoPlugin extends MediaPlugin {
  findMedia(): Promise<HTMLMediaElement> {
    return waitForSelector<HTMLMediaElement>(
      "#main [data-player] .vp-video video",
    );
  }

  getStyle() {
    const base = super.getStyle();
    return base + "\n" + css;
  }
  // async onload(): Promise<void> {
  //   await super.onload();
  // }
}
