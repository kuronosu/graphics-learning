import { Command, CommandResult } from "..";

export class CommandRegistry {
  private _commands: Map<string, { paramsCount: number; command: Command }> =
    new Map();

  get commands() {
    return this._commands;
  }

  register(name: string, paramsCount: number, command: Command) {
    this._commands.set(name, { paramsCount, command });
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
      throw new Error(`Invalid number of arguments for command ${command}`);
    }
    const result = await commandRegister.command(...args);
    return { command, args, result };
  }
}
