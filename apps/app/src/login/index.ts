import type YnPlugin from "@/yn-main";
import { LoginModal } from "./modal";

export function initLogin(this: YnPlugin) {
  this.addCommand({
    id: "login",
    name: "Login website",
    callback: () => {
      new LoginModal(this.app).open();
    },
  });
}
