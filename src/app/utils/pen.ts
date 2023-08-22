import type { Color, IInmutablePen } from "..";
import { PEN_SCALE, SCALE } from "../constants";
import {
  cartesianToCanvasX,
  cartesianToCanvasY,
  rotatePoint,
} from "../utils";
import { checkColor } from "./colors";

export default class ImmutablePen implements IInmutablePen {
  private _x: number;
  private _y: number;
  private _angle: number;
  private _color: Color;
  private _figure: [number, number][];

  constructor({
    x = 0,
    y = 0,
    angle = 0,
    color,
  }: {
    x?: number;
    y?: number;
    angle?: number;
    color: Color;
  }) {
    this._x = x;
    this._y = y;
    this._angle = angle;
    this._color = checkColor(color);

    const delta = 0.5;
    this._figure = [
      [0, 0],
      [1, -0.5],
      [0, -1],
      [0.3, -0.5],
      [0, 0],
    ]
      .map(([x, y]) => [x - delta, y + delta])
      .map(([x, y]) => [x * PEN_SCALE, y * PEN_SCALE]);
  }

  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  get position() {
    return { x: this._x, y: this._y };
  }
  get angle() {
    return this._angle;
  }
  get color() {
    return this._color;
  }

  clone(options?: {
    x?: number;
    y?: number;
    angle?: number;
    color?: Color;
  }): ImmutablePen {
    return new ImmutablePen({
      x: options?.x ?? this.x,
      y: options?.y ?? this.y,
      angle: options?.angle ?? this.angle,
      color: options?.color ?? this.color,
    });
  }

  move(x: number, y: number) {
    return this.clone({ x, y });
  }

  rotate(r: number) {
    // Rotate angle in radians
    return this.clone({ angle: this.angle + r });
  }

  draw = (ctx: CanvasRenderingContext2D) => {
    // Clean
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.beginPath();

    // rotate arrow around anchor
    const rotatedFigure = this._figure.map(([x, y]) =>
      rotatePoint({ x, y }, { x: 0, y: 0 }, this._angle)
    );
    const pX = cartesianToCanvasX(this._x, ctx, SCALE);
    const py = cartesianToCanvasY(this._y, ctx, SCALE);

    // translate arrow and convert to canvas coordinates
    const translatedFigure = rotatedFigure.map(({ x, y }) => [pX + x, py + y]);

    // draw arrow
    ctx.moveTo(translatedFigure[0][0], translatedFigure[0][1]);
    translatedFigure.slice(1).forEach(([x, y]) => {
      ctx.lineTo(x, y);
    });

    // ctx.fillStyle = `rgba(${this._color.r},${this._color.g},${this._color.b},${this._color.a})`;
    // ctx.fill();
    const color = { r: 0, g: 80, b: 239, a: 255 };
    ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
    ctx.stroke();
    ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
    ctx.fill();
    ctx.closePath();
  };
}
