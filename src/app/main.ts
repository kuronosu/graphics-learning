import CommandRegistry from "./command/registry.ts"
import DownloadController from "./controllers/DownloadController.ts"
import GridController from "./controllers/GridController.ts"
import PenController from "./controllers/PenController.ts"
import {
  CanvasController,
  CommandsController,
  HistoryController,
} from "./controllers/index.ts"
import type { CommandResult } from "./index"
import "./style.css"
import HistoryManager from "./utils/history.ts"
;(() => {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="panels">
    <div class="panel">
      <h3>Comandos</h3>
      <ul id="help">
        <li class="category"><span>Movimiento</span></li>
        <div>
          <li><span>rotar(r)</span></li>
          <li><span>adelante(d)</span></li>
          <li><span>atras(d)</span></li>
          <li><span>xy(x, y)</span></li>
        </div>

        <li class="category"><span>Primitivas</span></li>
        <div>
          <li><span>linea(x, y)</span></li>
          <li><span>circulo(r)</span></li>
          <li><span>cuadrado(d)</span></li>
          <li><span>poligono(x1, y1, x2, y2, ...)</span></li>
        </div>

        <li class="category"><span>Utilidades</span></li>
        <div>
          <li><span>limpiar()</span></li>
          <li><span>rellenar()</span></li>
          <li><span>color(r, g, b)</span></li>
        </div>

        <li class="category"><span>Control de Flujo</span></li>
        <div>
          <li><span>para(inicio; fin; pasos)</span></li>
        </div>

        <li class="category"><span>Atajos</span></li>
        <div>
          <li><span>ctrl+z Deshacer</span></li>
          <li><span>ctrl+y Rehacer</span></li>
          <li><span>ctrl+g Cuadrícula</span></li>
        </div>
      </ul>
      <div class="mt-auto flex">
        <div id="status"></div>
        <a class="manual" href="/manual" target="_blank">
        <svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 24 24" fill="none">
<path d="M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM3.00683 12C3.00683 16.9668 7.03321 20.9932 12 20.9932C16.9668 20.9932 20.9932 16.9668 20.9932 12C20.9932 7.03321 16.9668 3.00683 12 3.00683C7.03321 3.00683 3.00683 7.03321 3.00683 12Z" fill="#0F0F0F"/>
<path d="M13.5 18C13.5 18.8284 12.8284 19.5 12 19.5C11.1716 19.5 10.5 18.8284 10.5 18C10.5 17.1716 11.1716 16.5 12 16.5C12.8284 16.5 13.5 17.1716 13.5 18Z" fill="#0F0F0F"/>
<path d="M11 12V14C11 14 11 15 12 15C13 15 13 14 13 14V12C13 12 13.4792 11.8629 13.6629 11.7883C13.6629 11.7883 13.9969 11.6691 14.2307 11.4896C14.4646 11.3102 14.6761 11.097 14.8654 10.8503C15.0658 10.6035 15.2217 10.3175 15.333 9.99221C15.4443 9.66693 15.5 9.4038 15.5 9C15.5 8.32701 15.3497 7.63675 15.0491 7.132C14.7596 6.61604 14.3476 6.21786 13.8132 5.93745C13.2788 5.64582 12.6553 5.5 11.9427 5.5C11.4974 5.5 11.1021 5.55608 10.757 5.66825C10.4118 5.7692 10.1057 5.9094 9.83844 6.08887C9.58236 6.25712 9.36525 6.4478 9.18711 6.66091C9.02011 6.86281 8.8865 7.0591 8.78629 7.24978C8.68609 7.44046 8.61929 7.6087 8.58589 7.75452C8.51908 7.96763 8.49125 8.14149 8.50238 8.27609C8.52465 8.41069 8.59145 8.52285 8.70279 8.61258C8.81413 8.70231 8.9867 8.79765 9.22051 8.8986C9.46546 8.97712 9.65473 9.00516 9.78834 8.98273C9.93308 8.96029 10.05 8.89299 10.1391 8.78083C10.1391 8.78083 10.6138 8.10569 10.7474 7.97109C10.8922 7.82528 11.0703 7.71312 11.2819 7.6346C11.4934 7.54487 11.7328 7.5 12 7.5C12.579 7.5 13.0076 7.64021 13.286 7.92062C13.5754 8.18982 13.6629 8.41629 13.6629 8.93225C13.6629 9.27996 13.6017 9.56038 13.4792 9.77349C13.3567 9.9866 13.1953 10.1605 12.9949 10.2951C12.9949 10.2951 12.7227 10.3991 12.5 10.5C12.2885 10.5897 11.9001 10.7381 11.6997 10.8503C11.5104 10.9512 11.4043 11.0573 11.2819 11.2144C11.1594 11.3714 11 11.7308 11 12Z" fill="#0F0F0F"/>
</svg>
        Manual
        </a>
      </div>
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
  `

  document.querySelectorAll<HTMLLIElement>(".category").forEach((el) => {
    el.addEventListener("click", () => {
      el.nextElementSibling?.classList.toggle("hidden")
    })
  })

  const history = new HistoryManager<CommandResult>()
  const registry = new CommandRegistry()

  new HistoryController("#history", { history, registry })
  new CanvasController("#canvas", { history, registry })
  new PenController("#pointer", "#status", history)
  new GridController("#grid")
  const cc = new CommandsController("#entry", { history, registry })
  new DownloadController(
    {
      upload: "#upload",
      download: "#download",
      downloadPython: "#downloadPython",
    },
    cc
  )

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
})()
