import { CommandResult } from "..";
import { HistoryManager } from "../utils/history";
import { ObservableValue } from "../utils/observable";
import detectFunctionCall from "./parser";
import { CommandRegistry } from "./registry";

export default class CommandsContext {
  private _registry: CommandRegistry = new CommandRegistry();
  private _history: HistoryManager<CommandResult> = new HistoryManager(
    (item) => item.result.undo?.(),
    (item) => item.result.redo?.()
  );
  readonly isRunning: ObservableValue<boolean> = new ObservableValue(false);

  get registry() {
    return this._registry;
  }

  get history() {
    return this._history;
  }

  async run(command: string, ...args: number[]) {
    if (this.isRunning.value) {
      throw new Error("Ya hay un comando en ejecución");
    }
    this.isRunning.value = true;
    const result = await this._registry.execute(command, ...args);
    this.isRunning.value = false;
    return result;
  }

  async runAndAddToHistory(command: string, ...args: number[]) {
    const result = await this.run(command, ...args);
    this._history.add(result);
    return result;
  }

  parse(command: string) {
    const cmd = detectFunctionCall(command);
    if (cmd === null) {
      throw new Error("Comando no reconocido");
    }
    return cmd;
  }

  async parseAndRun(command: string) {
    const cmd = this.parse(command);
    return await this.runAndAddToHistory(cmd.name, ...cmd.args);
  }
}
