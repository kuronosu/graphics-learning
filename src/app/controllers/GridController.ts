import { SCALE } from "../constants";
import getElement from "../utils/getElement";

export default class GridController {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private hidden: boolean;

  constructor(selector: string, initialHidden: boolean = false) {
    this.canvas = getElement(selector);
    this.ctx = this.canvas.getContext("2d")!;
    this.hidden = initialHidden;
    this.setUpUi();
  }

  get isHidden() {
    return this.hidden;
  }

  private setUpUi() {
    this.draw();
    window.addEventListener("keydown", (e) => {
      if (e.key !== "g" || !e.ctrlKey) return;
      e.preventDefault();
      this.hidden = !this.hidden;
      this.draw();
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.hidden) return;
    const { width, height } = this.ctx.canvas;
    const x = width / 2;
    const y = height / 2;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.strokeStyle = "rgba(0,0,0,0.2)";
    this.ctx.lineWidth = 0.5;
    for (let i = x + SCALE; i < width; i += SCALE) {
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, height);
    }
    for (let i = x - SCALE; i > 0; i -= SCALE) {
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, height);
    }
    for (let i = y + SCALE; i < height; i += SCALE) {
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(width, i);
    }
    for (let i = y - SCALE; i > 0; i -= SCALE) {
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(width, i);
    }
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.beginPath();
    this.ctx.strokeStyle = "rgba(0,0,0,1)";
    this.ctx.lineWidth = 0.5;
    this.ctx.moveTo(0, y);
    this.ctx.lineTo(width, y);
    this.ctx.moveTo(x, 0);
    this.ctx.lineTo(x, height);
    this.ctx.stroke();
    this.ctx.restore();
    this.ctx.closePath();
  }
}
