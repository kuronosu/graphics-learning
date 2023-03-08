import { CommandResult } from "..";
import li from "../components/li";

export function commandItem(command: CommandResult, future?: boolean) {
  return li({
    text: `${command.command}(${command.args.join(", ")})`,
    classNames: ["ml-1", future ? "text-gray-400" : "text-gray-800"],
  });
}

export function headerItem(text: string) {
  return li({
    text,
    classNames: ["m-0", "text-gray-800"],
  });
}
