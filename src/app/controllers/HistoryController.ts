import type { CommandResult } from "..";
import { commandItem, headerItem } from "../components/command";
import CommandRegistry from "../command/registry";
import HistoryManager from "../utils/history";

export default class HistoryController {
  private container: HTMLOListElement;
  private _instance: HistoryManager<CommandResult>;
  private _registry: CommandRegistry;

  constructor(
    selector: string,
    options?: {
      registry?: CommandRegistry;
      history?: HistoryManager<CommandResult>;
    }
  ) {
    const $el = document.querySelector(selector);
    if ($el == null) throw new Error(`Elemento no encontrado: ${selector}`);
    if (!($el instanceof HTMLOListElement)) {
      console.warn(`Elemento encontrado no es una lista ordenada: ${selector}`);
    }
    this.container = document.querySelector(selector) as HTMLOListElement;
    this._instance = options?.history ?? new HistoryManager<CommandResult>();
    this._registry = options?.registry ?? new CommandRegistry();
    this.container.innerHTML = "";
    this.container.appendChild(headerItem("Inicio"));
    this.container.appendChild(headerItem("Fin"));
    this._instance.observe(() => {
      this.container.innerHTML = "";
      this.container.appendChild(headerItem("Inicio"));
      for (const command of this._instance.past) {
        this.container.appendChild(commandItem(command, this._registry));
      }
      this.container.appendChild(headerItem("Fin"));
      for (const command of this._instance.future) {
        this.container.appendChild(commandItem(command, this._registry, true));
      }
    });
  }

  get instance() {
    return this._instance;
  }
}
