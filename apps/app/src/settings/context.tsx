import { createContext, useContext } from "react";
import { useStore, type StoreApi } from "zustand";
import type YnPlugin from "@/yn-main";
import type { YnSettings } from "./def";

export const SettingContext = createContext<{
  settings: StoreApi<YnSettings>;
  plugin: YnPlugin;
}>(null as any);

export function useSettings<U>(selector: (state: YnSettings) => U): U {
  const { settings } = useContext(SettingContext);
  // eslint-disable-next-line import/no-deprecated -- don't use equalityFn here
  return useStore(settings, selector);
}

export function useAppId() {
  return useContext(SettingContext).plugin.app.appId;
}
