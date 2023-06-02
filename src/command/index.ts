import li from "../components/li";
import Turtle from "../turtle/turtle";
import { drawPixels } from "../turtle/utils";
import { commandText } from "../utils/commands";
import { downloadData } from "../utils/files";
import { commandItem, headerItem } from "./components";
import CommandsContext from "./context";
export * from "./parser";
export * from "./registry";

export function setupCommands(
  historyContainer: HTMLOListElement,
  commandEntry: HTMLInputElement,
  helpContainer: HTMLUListElement,
  downloadBtn: HTMLButtonElement,
  turtle: Turtle
) {
  const context = new CommandsContext();
  context.registry.register("limpiar", 0, async () => ({ data: [] }));
  // context.registry.registerSeparator("para", ";");

  for (const [name, [arity, command, sep]] of turtle.availableCommands) {
    context.registry.register(name, arity, command, sep);
  }

  context.registry.commands.forEach(({ paramsCount, sep }, name) => {
    if (paramsCount === -1) {
      helpContainer.appendChild(li({ text: `${name}(n1${sep} n2${sep} ...)` }));
      return;
    }
    helpContainer.appendChild(
      li({
        text: `${name}(${Array(paramsCount).fill("n").join(`${sep} `)})`,
      })
    );
  });

  const history = context.history;

  downloadBtn.addEventListener("click", () => {
    const content = history.past
      .map((it) => commandText(it, context.registry))
      .join("\n\t");
    downloadData(`Inicio\n\t${content}\nFin`, "program.txt");
  });

  commandEntry.value = "";
  historyContainer.innerHTML = "";
  historyContainer.appendChild(headerItem("Inicio"));
  historyContainer.appendChild(headerItem("Fin"));

  history.observe(() => {
    const ctx = turtle.drawCanvas.getContext("2d")!;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (history.past.at(-1)?.command === "limpiar") {
      history.clear();
      turtle.position = { x: 0, y: 0 };
      turtle.angle = 0;
      turtle.draw();
      return;
    }

    historyContainer.innerHTML = "";
    historyContainer.appendChild(headerItem("Inicio"));
    for (const command of history.past) {
      historyContainer.appendChild(commandItem(command, context.registry));
      drawPixels(command.result.data, ctx);
    }
    turtle.draw();
    historyContainer.appendChild(headerItem("Fin"));
    for (const command of history.future) {
      historyContainer.appendChild(
        commandItem(command, context.registry, true)
      );
    }
  });

  context.isRunning.observe((isRunning) => {
    commandEntry.disabled = isRunning;
    if (!isRunning) {
      commandEntry.focus();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (
      (e.key === "z" || e.key === "y") &&
      e.ctrlKey &&
      !context.isRunning.value
    ) {
      e.preventDefault();
      if (e.key === "z") {
        history.undo();
      } else {
        history.redo();
      }
    }
  });

  commandEntry.addEventListener("keydown", (e) => {
    if (context.isRunning.value) {
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const command = commandEntry.value;
      context
        .parseAndRun(command)
        .then(() => (commandEntry.value = ""))
        .catch((e) => {
          alert(e.message);
          context.isRunning.value = false;
        });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = history.search.backward();
      if (prev) {
        commandEntry.value = `${prev.command}(${prev.args.join(", ")})`;
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = history.search.forward();
      commandEntry.value = next
        ? `${next.command}(${next.args.join(", ")})`
        : "";
    }
  });
  return context;
}
