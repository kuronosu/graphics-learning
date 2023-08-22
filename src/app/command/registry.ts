import type { Command, CommandResult } from "..";
import { SelfObservable } from "../utils/observable";

export default class CommandRegistry extends SelfObservable<CommandRegistry> {
  private _commands: Map<
    string,
    { paramsCount: number; command: Command; sep: string }
  > = new Map();

  get commands() {
    return this._commands;
  }

  getCommand(name: string) {
    return this._commands.get(name);
  }

  register(
    name: string,
    paramsCount: number,
    command: Command,
    sep: string | null | undefined = ","
  ) {
    if (sep === null || sep === undefined) {
      sep = ",";
    }
    this._commands.set(name, { paramsCount, command, sep });
    this._call();
  }

  async execute(command: string, ...args: number[]): Promise<CommandResult> {
    const commandRegister = this._commands.get(command);
    if (!commandRegister) {
      throw new Error(`Command ${command} not found`);
    }
    if (
      commandRegister.paramsCount != -1 &&
      commandRegister.paramsCount !== args.length
    ) {
      throw new Error(
        `Numero de parametros incorrecto para el comando '${command}'`
      );
    }
    return commandRegister.command(...args);
  }
}
