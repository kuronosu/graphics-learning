import type { CommandResult, ParsedCommand } from "..";
import detectFunctionCall from "../command/parser";
import CommandRegistry from "../command/registry";

import getElement from "../utils/getElement";
import HistoryManager from "../utils/history";
import { ObservableValue } from "../utils/observable";
import sleep from "../utils/sleep";

export default class CommandsController {
  private _history: HistoryManager<CommandResult>;
  private _registry: CommandRegistry;
  private readonly _input: HTMLInputElement;
  readonly isRunning = new ObservableValue(false);

  constructor(
    inputSelector: string,
    options?: {
      registry?: CommandRegistry;
      history?: HistoryManager<CommandResult>;
    }
  ) {
    this._input = getElement(inputSelector);

    this._history = options?.history ?? new HistoryManager<CommandResult>();
    this._registry = options?.registry ?? new CommandRegistry();
    this.setUpUI();
  }

  get history() {
    return this._history;
  }

  get registry() {
    return this._registry;
  }

  private setUpUI() {
    this.setUpInputs();

    document.addEventListener("keydown", (e) => {
      if (
        (e.key === "z" || e.key === "y") &&
        e.ctrlKey &&
        !this.isRunning.value
      ) {
        e.preventDefault();
        if (e.key === "z") {
          this.history.undo();
        } else {
          this.history.redo();
        }
      }
    });
  }

  private setUpInputs() {
    this.isRunning.observe((isRunning) => {
      this._input.disabled = isRunning;
      if (!isRunning) {
        this._input.focus();
      }
    });

    this._input.addEventListener("keydown", (e) => {
      if (this.isRunning.value) {
        return;
      }
      if (e.key === "Enter") {
        const command = this._input.value;
        this.parseAndRun(command)
          .then(() => {
            this._input.value = "";
          })
          .catch((e) => {
            alert(e.message);
          })
          .finally(() => {
            this.isRunning.value = false;
          });
      } else if (e.key === "ArrowUp") {
        const prev = this.history.search.backward();
        if (prev) {
          this._input.value = `${prev.command}(${prev.args.join(
            this.registry.getCommand(prev.command)?.sep ?? ", "
          )})`;
        }
      } else if (e.key === "ArrowDown") {
        const next = this.history.search.forward();
        this._input.value = next
          ? `${next.command}(${next.args.join(
              this.registry.getCommand(next.command)?.sep ?? ", "
            )})`
          : "";
      }
    });
  }

  async run(command: ParsedCommand) {
    if (this.isRunning.value) {
      throw new Error("Ya hay un comando en ejecución");
    }
    this.isRunning.value = true;
    const result = await this._registry.execute(command.name, ...command.args);
    this.isRunning.value = false;
    return result;
  }

  async runAndAddToHistory(command: ParsedCommand) {
    const result = await this.run(command);
    this._history.add(result);
    return result;
  }

  parse(command: string) {
    let sep = ",";
    this._registry.commands.forEach(({ sep: s }, name) => {
      if (command.trim().startsWith(name)) sep = s;
    });

    const cmd = detectFunctionCall(command, sep);
    if (cmd === null) {
      throw new Error("Comando no reconocido");
    }
    return cmd;
  }

  async parseAndRun(command: string, addToHistory: boolean = true) {
    const cmd = this.parse(command);
    if (addToHistory) {
      return await this.runAndAddToHistory(cmd);
    }
    return await this.run(cmd);
  }

  async runScript(script: string, timeout: number = 50) {
    this.history.clear();
    await sleep(100);
    const commands = script
      .split("\n")
      .map((it) => it.trim())
      .filter((it) => it.length > 0)
      .filter((it) => !it.startsWith("//"));
    for (const command of commands) {
      await this.parseAndRun(command);
      if (timeout > 0) {
        await sleep(timeout);
      }
    }
  }
}
