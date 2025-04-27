import type { MsgCtrlRemote } from "@/lib/remote-player/interface";
import { MessageController } from "../../message";
import { GET_PORT_TIMEOUT, PORT_MESSAGE_ID_PLACEHOLDER } from "../const";

export default async function initPort() {
  const port = await new Promise<MessagePort>((resolve, reject) => {
    function onMessage({ data, ports }: MessageEvent<any>) {
    if (data !== PORT_MESSAGE_ID_PLACEHOLDER) return;
      resolve(ports[0]);
      window.removeEventListener("message", onMessage);
      window.clearTimeout(timeout);
    }
    window.addEventListener("message", onMessage);
    const timeout = setTimeout(() => {
      reject("failed to get port: timeout " + GET_PORT_TIMEOUT);
      window.removeEventListener("message", onMessage);
    }, GET_PORT_TIMEOUT);
  });
  const handler = new MessageController() as MsgCtrlRemote;
  handler.load(port);
  return handler;
}
