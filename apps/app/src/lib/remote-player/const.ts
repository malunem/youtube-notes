export const GET_PORT_TIMEOUT = 5e3;

export const PORT_READY_EVENT = "yn-port-ready";
export const PORT_MESSAGE_ID_PLACEHOLDER = "__YN_PORT_MESSAGE__";

declare module "obsidian" {
  interface App {
    appId: string;
  }
}

export const getPartition = (id: string) => `persist:yn-player-${id}`;
