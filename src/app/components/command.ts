import type { CommandResult } from ".."
import type CommandRegistry from "../command/registry"
import li from "./li"

export function commandText(
  command: CommandResult,
  registry?: CommandRegistry,
  defaultSep: string | undefined | null = undefined
) {
  let sep = ","
  const registeredCommand = registry?.getCommand(command.command)
  if (registeredCommand !== undefined) {
    sep = registeredCommand.sep
  }
  if (defaultSep != null) {
    sep = defaultSep
  }
  return `${command.command}(${command.args.join(sep + " ")})`
}

export function commandItem(
  command: CommandResult,
  registry?: CommandRegistry,
  future?: boolean
) {
  return li({
    text: commandText(command, registry),
    classNames: ["ml-1", future ? "text-gray-400" : "text-gray-800"],
  })
}

export function headerItem(text: string) {
  return li({
    text,
    classNames: ["m-0", "text-gray-800"],
  })
}
