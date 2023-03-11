import li from "../components/li";
import Turtle from "../turtle/turtle";
import { drawPixels } from "../turtle/utils";
import { commandItem, headerItem } from "./components";
import CommandsContext from "./context";
export * from "./registry";
export * from "./parser";

export function setupCommands(
  historyContainer: HTMLOListElement,
  commandEntry: HTMLInputElement,
  helpContainer: HTMLUListElement,
  turtle: Turtle
) {
  const context = new CommandsContext();
  context.registry.register("limpiar", 0, async () => ({ data: [] }));

  for (const [name, [arity, command]] of turtle.availableCommands) {
    context.registry.register(name, arity, command);
  }

  context.registry.commands.forEach(({ paramsCount }, name) => {
    if (paramsCount === -1) {
      helpContainer.appendChild(li({ text: `${name}(n1, n2, ...)` }));
      return;
    }
    helpContainer.appendChild(
      li({
        text: `${name}(${Array(paramsCount).fill("n").join(", ")})`,
      })
    );
  });

  const history = context.history;

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
      historyContainer.appendChild(commandItem(command));
      drawPixels(command.result.data, ctx);
    }
    turtle.draw();
    historyContainer.appendChild(headerItem("Fin"));
    for (const command of history.future) {
      historyContainer.appendChild(commandItem(command, true));
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
