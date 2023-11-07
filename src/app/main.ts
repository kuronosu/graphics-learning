import CommandRegistry from "./command/registry.ts";
import DownloadController from "./controllers/DownloadController.ts";
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
    <div class="panel">
      <h3>Comandos</h3>
      <ul id="help">
        <li class="category"><span>Movimiento</span></li>
        <li><span>rotar(r)</span></li>
        <li><span>adelante(d)</span></li>
        <li><span>atras(d)</span></li>
        <li><span>xy(x, y)</span></li>

        <li class="category"><span>Primitivas</span></li>
        <li><span>linea(x, y)</span></li>
        <li><span>circulo(r)</span></li>
        <li><span>cuadrado(d)</span></li>
        <li><span>poligono(x1, y1, x2, y2, ...)</span></li>

        <li class="category"><span>Utilidades</span></li>
        <li><span>limpiar()</span></li>
        <li><span>rellenar()</span></li>
        <li><span>color(r, g, b)</span></li>

        <li class="category"><span>Control de Flujo</span></li>
        <li><span>para(inicio; fin; pasos)</span></li>

        <li class="category"><span>Atajos</span></li>
        <li><span>ctrl+z Deshacer</span></li>
        <li><span>ctrl+y Rehacer</span></li>
        <li><span>ctrl+g Cuadrícula</span></li>
      </ul>
      <div id="status"></div>
    </div>
    <div>
      <canvas id="grid" width="600" height="600"></canvas>
      <canvas id="canvas" width="600" height="600"></canvas>
      <canvas id="pointer" width="600" height="600"></canvas>
    </div>
    <div class="panel">
      <h3>Código</h3>
      <ol id="history"></ol>
      <div class="btns">
        <button id="upload">Abrir</button>
        <button id="download">Guardar</button>
        <button id="downloadPython">Exportar Python</button>
      </div>
    </div>
  </div>
  <div class="controls">
    <input placeholder="Ingresa un comando" type="text" id="entry" autocomplete="off" />
  </div>
  `;

  const history = new HistoryManager<CommandResult>();
  const registry = new CommandRegistry();

  new HistoryController("#history", { history, registry });
  new CanvasController("#canvas", { history, registry });
  new PenController("#pointer", "#status", history);
  new GridController("#grid");
  const cc = new CommandsController("#entry", { history, registry });
  new DownloadController(
    {
      upload: "#upload",
      download: "#download",
      downloadPython: "#downloadPython",
    },
    cc
  );

  // cc.runScript(
  //   `
  //   xy(-5,5)
  //   adelante(5)
  //   rotar(90)
  //   adelante(5)
  //   rotar(90)
  //   adelante(5)
  //   rotar(90)
  //   adelante(5)
  //   rotar(90)
  //   xy(0,0)
  //   color(255,0,0)
  //   circulo(12.75)
  //   color(0,0,255)
  //   rotar(-45)
  //   cuadrado(5)
  //   rotar(-180)
  //   para(2.5; 10; 0.5)
  //   xy(-1, 1)
  //   color(0, 255, 0)
  //   poligono(2.5, 1, -2, -1.5)
  //   color(25,229,230)
  //   rotar(-50)
  //   linea(0,-9)
  //   xy(5,0.5)
  //   color(255, 255, 0)
  //   rellenar()
  //   xy(-6,5)
  //   color(215, 224, 206)
  //   rellenar()
  //   `
  // ).catch(alert);
})();
