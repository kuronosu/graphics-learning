import CommandRegistry from "./command/registry.ts";
import GridController from "./controllers/GridController.ts";
import PenController from "./controllers/PenController.ts";
import {
  CanvasController,
  CommandsController,
  HistoryController,
} from "./controllers/index.ts";
import type { CommandResult } from "./index";
import "./style.css";
import HistoryManager from "./utils/history.ts";

(() => {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="panels">
    <div class="left">
      <h3>Comandos</h3>
      <ul id="help"></ul>
      <div id="status"></div>
    </div>
    <div>
      <canvas id="grid" width="600" height="600"></canvas>
      <canvas id="canvas" width="600" height="600"></canvas>
      <canvas id="pointer" width="600" height="600"></canvas>
    </div>
    <div>
      <ol id="history"></ol>
      <button>Descargar</button>
    </div>
  </div>
  <div class="controls">
    <input type="text" id="entry" autocomplete="off" />
  </div>
  `;

  const history = new HistoryManager<CommandResult>();
  const registry = new CommandRegistry();

  new HistoryController("#history", { history, registry });
  new CanvasController("#canvas", { history, registry });
  new PenController("#pointer", "#status", history);
  new GridController("#grid");
  const cc = new CommandsController("#entry", "#help", { history, registry });

  cc.runScript(
    `
    xy(-5,5)
    adelante(5)
    rotar(90)
    adelante(5)
    rotar(90)
    adelante(5)
    rotar(90)
    adelante(5)
    rotar(90)
    xy(0,0)
    color(255,0,0)
    circulo(12.75)
    color(0,0,255)
    rotar(-45)
    cuadrado(5)
    rotar(-180)
    para(2.5; 10; 0.5)
    xy(-1, 1)
    color(0, 255, 0)
    poligono(2.5, 1, -2, -1.5)
    color(25,229,230)
    rotar(-50)
    linea(0,-9)
    xy(5,0.5)
    color(255, 255, 0)
    rellenar()
    xy(-6,5)
    color(215, 224, 206)
    rellenar()
    `
  ).catch(alert);
})();
