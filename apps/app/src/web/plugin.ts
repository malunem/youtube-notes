import BilibiliPlugin from "inline:./userscript/bilibili";
import VimeoPlugin from "inline:./userscript/vimeo";
// import YouTubePlugin from "inline:./userscript/youtube";
import YouTubePluginNoAd from "inline:./userscript/youtube-no-ad";
import type { MediaHost } from "../info/supported";



export const plugins = {
  bilibili: BilibiliPlugin,
  youtube: YouTubePluginNoAd,
  vimeo: VimeoPlugin,
  coursera: undefined,
  generic: undefined,
} satisfies Record<MediaHost, string | undefined>;
