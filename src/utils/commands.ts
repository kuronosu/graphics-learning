import { CommandResult } from "..";
import { CommandRegistry } from "../command";

export function commandText(
  command: CommandResult,
  registry?: CommandRegistry
) {
  let sep = ",";
  const registeredCommand = registry?.getCommand(command.command);
  if (registeredCommand !== undefined) {
    sep = registeredCommand.sep;
  }
  return `${command.command}(${command.args.join(sep + " ")})`;
}
