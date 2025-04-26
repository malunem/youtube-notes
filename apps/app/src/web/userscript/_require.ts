/* eslint-disable @typescript-eslint/no-var-requires */
import type { PluginExports } from "@/lib/remote-player/lib/require";

/**
 * dummy function to make typescript happy
 */
export const requireYn = () => require("youtube-notes") as PluginExports;
