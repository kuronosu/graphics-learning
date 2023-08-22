import type { CommandResult, IInmutablePen } from "..";
import { convertTo360, toDegrees } from "../utils";
import { BLACK } from "../utils/colors";
import getElement from "../utils/getElement";
import HistoryManager from "../utils/history";
import ImmutablePen from "../utils/pen";

export default class PenController {
  private canvas: HTMLCanvasElement;
  private statusContainer: HTMLDivElement;
  private ctx: CanvasRenderingContext2D;
  private readonly _history: HistoryManager<CommandResult>;

  constructor(
    canvasSelector: string,
    statusSelector: string,
    history?: HistoryManager<CommandResult>
  ) {
    this.canvas = getElement(canvasSelector);
    this.statusContainer = getElement(statusSelector);
    this._history = history ?? new HistoryManager<CommandResult>();
    this.ctx = this.canvas.getContext("2d")!;
    this.setUpUi();
  }

  get history() {
    return this._history;
  }

  get pen() {
    return this._history.latest?.pen ?? new ImmutablePen({ color: BLACK });
  }

  private renderStatus(pen: IInmutablePen) {
    this.statusContainer.innerHTML = `
    <div>
      <span>X: ${pen.position.x.toFixed(2)}</span></br>
      <span>Y: ${pen.position.y.toFixed(2)}</span>
    </div>
    <div>
      <span>Color:</span>
      <span style="background-color: rgba(${pen.color.r},${pen.color.g},${
      pen.color.b
    },${pen.color.a / 255})">&nbsp;&nbsp;&nbsp;&nbsp;</span>
    </div>
    <div>
      <span>Ángulo:</span>
      <span>${convertTo360(toDegrees(pen.angle)).toFixed(2)}&deg;</span>
    </div>
    `;
  }

  private setUpUi() {
    const pen = this.pen;
    pen.draw(this.ctx);
    this.renderStatus(pen);

    this._history.observe(() => {
      const pen = this.pen;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      pen.draw(this.ctx);
      this.renderStatus(pen);
    });
  }
}
