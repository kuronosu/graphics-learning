import { CommandResult } from "..";
import li from "../components/li";
import { commandText } from "../utils/commands";
import { CommandRegistry } from "./registry";

export function commandItem(
  command: CommandResult,
  registry?: CommandRegistry,
  future?: boolean
) {
  return li({
    text: commandText(command, registry),
    classNames: ["ml-1", future ? "text-gray-400" : "text-gray-800"],
  });
}

export function headerItem(text: string) {
  return li({
    text,
    classNames: ["m-0", "text-gray-800"],
  });
}
