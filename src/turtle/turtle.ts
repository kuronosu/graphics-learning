import { Color, Command, Pixel, Point } from "..";
import sleep from "../utils/sleep";
import { line } from "./draw";
import { circle } from "./draw/circle";
import {
  cartesianToCanvasPoint,
  cartesianToCanvasX,
  cartesianToCanvasY,
  drawPixel,
  drawPixels,
  eqPixel,
  outOfCanvas,
  rotatePoint,
  toRadians,
} from "./utils";

const checkBounds = (points: Pixel[], ctx: CanvasRenderingContext2D) =>
  points.reduce<Pixel[]>((acc, { x, y, color }) => {
    if (!outOfCanvas(x, y, ctx)) {
      acc.push({ x, y, color });
    }
    return acc;
  }, []);

export default class Turtle {
  scale = 10;
  private _x: number = 0; // in cartesian coordinates
  private _y: number = 0; // in cartesian coordinates
  private _width: number = 0;
  private _height: number = 0;
  private _angle: number = 0;
  private _penDown: boolean = true;
  private _color: Color = { r: 0, g: 0, b: 0, a: 255 };
  private _drawContext: CanvasRenderingContext2D;
  private _penContext: CanvasRenderingContext2D;
  private _figure: number[][] = [];
  private _anchor: Point = { x: 0, y: 0 };
  public animationEnabled = true;

  constructor(drawCanvas: HTMLCanvasElement, penCanvas: HTMLCanvasElement) {
    this._drawContext = drawCanvas.getContext("2d", {
      willReadFrequently: true,
    })!;
    this._penContext = penCanvas.getContext("2d") ?? this._drawContext;
    this._width = drawCanvas.width / 2 / this.scale;
    this._height = drawCanvas.height / 2 / this.scale;

    const delta = 0.5;
    const scalePen = 1.5;
    this._figure = [
      [0, 0],
      [1, -0.5],
      [0, -1],
      [0.3, -0.5],
      [0, 0],
    ]
      .map(([x, y]) => [x - delta, y + delta])
      .map(([x, y]) => [x * scalePen, y * scalePen]);
    this.draw();
  }

  get availableCommands(): Map<
    string,
    [number, Command, string | null | undefined]
  > {
    return new Map([
      ["arriba", [0, this.penUp, null]],
      ["abajo", [0, this.penDown, null]],
      ["relleno", [0, this.fill, null]],

      ["rotar", [1, this.rotate, null]],
      ["circulo", [1, this.circle, null]],
      ["adelante", [1, this.forward, null]],
      ["atras", [1, this.backward, null]],
      ["cuadrado", [1, this.square, null]],

      ["xy", [2, this.xy, null]],
      // ["linea", [2, this.line]],

      ["color", [3, this.setColor, null]],
      ["para", [3, this.each, ";"]],

      ["poligono", [-1, this.polygon, null]],
    ]);
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get angle() {
    return this._angle;
  }

  get isPenDown() {
    return this._penDown;
  }

  get position() {
    return { x: this._x, y: this._y };
  }

  get color() {
    return this._color;
  }

  get drawCanvas() {
    return this._drawContext.canvas;
  }

  get penCanvas() {
    return this._penContext.canvas;
  }

  get penColor(): Color {
    return this._penDown
      ? { r: 0, g: 80, b: 239, a: 255 } // rgb(0, 80, 239)
      : { r: 229, g: 20, b: 37, a: 255 }; // rgb(229, 20, 37)
  }

  set x(x: number) {
    if (x < -this._width || x > this._width) {
      throw new Error(
        `x debe estar entre ${-this._width} y ${this._width} es ${x}`
      );
    }
    this._x = x;
  }

  set y(y: number) {
    if (y < -this._height || y > this._height) {
      throw new Error(
        `y debe estar entre ${-this._height} y ${this._height} es ${y}`
      );
    }
    this._y = y;
  }

  set angle(angle: number) {
    this._angle = angle;
  }

  set isPenDown(penDown: boolean) {
    this._penDown = penDown;
  }

  set color(color: Color) {
    if (color.r < 0 || color.r > 255) {
      throw new Error(`r debe estar entre 0 y 255 es ${color.r}`);
    }
    if (color.g < 0 || color.g > 255) {
      throw new Error(`g debe estar entre 0 y 255 es ${color.g}`);
    }
    if (color.b < 0 || color.b > 255) {
      throw new Error(`b debe estar entre 0 y 255 es ${color.b}`);
    }
    if (color.a < 0 || color.a > 255) {
      throw new Error(`a debe estar entre 0 y 255 es ${color.a}`);
    }
    this._color = color;
  }

  set position({ x, y }: { x: number; y: number }) {
    this.x = x;
    this.y = y;
  }

  // Equivalnet on canvas methods

  _line = (x0: number, y0: number, x1: number, y1: number) => {
    return line(
      cartesianToCanvasX(x0 * this.scale, this._drawContext),
      cartesianToCanvasY(y0 * this.scale, this._drawContext),
      cartesianToCanvasX(x1 * this.scale, this._drawContext),
      cartesianToCanvasY(y1 * this.scale, this._drawContext),
      this._color,
      true,
      2
    );
  };

  // Draw methods

  draw = () => {
    // Clean
    this._penContext.clearRect(
      0,
      0,
      this._penContext.canvas.width,
      this._penContext.canvas.height
    );
    this._penContext.beginPath();

    // rotate arrow around anchor
    const rotatedFigure = this._figure.map(([x, y]) =>
      rotatePoint({ x, y }, this._anchor, toRadians(this._angle))
    );
    // translate arrow and convert to canvas coordinates
    const translatedFigure = rotatedFigure.map(({ x, y }) => [
      cartesianToCanvasX((x + this._x) * this.scale, this._drawContext),
      cartesianToCanvasY((y + this._y) * this.scale, this._drawContext),
    ]);
    // draw arrow
    this._penContext.moveTo(translatedFigure[0][0], translatedFigure[0][1]);
    translatedFigure.slice(1).forEach(([x, y]) => {
      this._penContext.lineTo(x, y);
    });

    // this._penContext.fillStyle = `rgba(${this._color.r},${this._color.g},${this._color.b},${this._color.a})`;
    // this._penContext.fill();
    const color = this.penColor;
    this._penContext.strokeStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
    this._penContext.stroke();
    this._penContext.fillStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
    this._penContext.fill();
    this._penContext.closePath();
  };

  line: Command = async (x: number, y: number) => {
    const initialPosition = structuredClone({ x: this.x, y: this.y });
    const points = checkBounds(
      this._line(this.x, this.y, x, y),
      this._drawContext
    );
    this.position = { x, y };
    if (this._penDown) {
      drawPixels(points, this._drawContext);
    }
    return {
      data: points,
      undo: () => (this.position = initialPosition),
      redo: () => (this.position = { x, y }),
    };
  };

  forward: Command = async (distance: number) => {
    return await this.line(
      this.x + distance * Math.cos(toRadians(this.angle)),
      this.y + distance * Math.sin(toRadians(this.angle))
    );
  };

  backward: Command = async (distance: number) => {
    return await this.line(
      this.x - distance * Math.cos(toRadians(this.angle)),
      this.y - distance * Math.sin(toRadians(this.angle))
    );
  };

  circle = async (radius: number) => {
    const points = checkBounds(
      circle(
        cartesianToCanvasX(this.x * this.scale, this._drawContext),
        cartesianToCanvasY(this.y * this.scale, this._drawContext),
        radius * this.scale,
        this._color,
        true
      ),
      this._drawContext
    );
    if (this._penDown) {
      drawPixels(points, this._drawContext);
    }
    return { data: points };
  };

  square = async (side: number) => {
    let prevVertex = { x: this.x, y: this.y };
    let currentVertex = {
      x: this.x + side * Math.cos(toRadians(this.angle)),
      y: this.y + side * Math.sin(toRadians(this.angle)),
    };
    const edges = new Array(4).fill(0).flatMap((_, i) => {
      const pixels = this._line(
        prevVertex.x,
        prevVertex.y,
        currentVertex.x,
        currentVertex.y
      );
      prevVertex = currentVertex;
      currentVertex = {
        x: prevVertex.x + side * Math.cos(toRadians(this.angle - 90 * (i + 1))),
        y: prevVertex.y + side * Math.sin(toRadians(this.angle - 90 * (i + 1))),
      };
      return pixels;
    });

    const points = checkBounds(edges, this._drawContext);
    if (this._penDown) {
      drawPixels(points, this._drawContext);
    }
    return { data: points };
  };

  // todo implement fill, polygon, for loop

  // each = async ({ from, to, step, space }: { from: number, to: number, step: number, space: number }) => {
  each: Command = async (
    from: number,
    to: number,
    space: number,
    step: number = 0.5
  ) => {
    if (space <= 0) {
      return this.forward(to);
    }

    const pixels: Pixel[] = [];
    const initialPosition = structuredClone(this.position);
    const finalPosition = {
      x: Math.round(this.x + (from + to) * Math.cos(toRadians(this.angle))),
      y: Math.round(this.y + (from + to) * Math.sin(toRadians(this.angle))),
    };

    const forward = async (distance: number) => {
      const xf = this.x + distance * Math.cos(toRadians(this.angle));
      const yf = this.y + distance * Math.sin(toRadians(this.angle));
      pixels.push(...this._line(this.x, this.y, xf, yf));
      this.position = { x: xf, y: yf };
    };

    const upForward = async (distance: number) => {
      this.position = {
        x: Math.round(this.x + distance * Math.cos(toRadians(this.angle))),
        y: Math.round(this.y + distance * Math.sin(toRadians(this.angle))),
      };
    };

    if (from > 0) {
      upForward(from);
    }

    let restDistance = Math.hypot(
      finalPosition.x - this.x,
      finalPosition.y - this.y
    );
    let prevDistance = restDistance;
    while (prevDistance >= restDistance) {
      if (step + space > restDistance) {
        await forward(step > restDistance ? restDistance : step);
        break;
      }
      await forward(step);
      upForward(space);
      prevDistance = restDistance;
      restDistance = Math.hypot(
        finalPosition.x - this.x,
        finalPosition.y - this.y
      );
    }
    this.position = { x: finalPosition.x, y: finalPosition.y };
    return {
      data: checkBounds(pixels, this._drawContext),
      undo: () => (this.position = initialPosition),
      redo: () => (this.position = finalPosition),
    };
  };

  fill: Command = async () => {
    const pixels: Pixel[] = [];
    const action = {
      c: 0,
      paint: async (x: number, y: number) => {
        // this._ctx.fillRect(x, y, 1, 1);
        drawPixel({ x, y, color: this.color }, this._drawContext);
        action.c++;
        if (action.c > 1000) {
          await sleep(1);
          action.c = 0;
        }
      },
    };

    const visited: { [key: string]: boolean } = {};
    // this._ctx.fillStyle = this._pen.hexColor;
    const next: number[][] = [];
    const { x, y } = cartesianToCanvasPoint(this.x, this.y, this._drawContext);
    next.push([x, y]);
    const fillColor = this._drawContext.getImageData(x, y, 1, 1).data;

    const fn = this.animationEnabled
      ? action.paint
      : async (_: number, __: number) => {};

    while (next.length > 0) {
      const [x, y] = next.shift()!;
      if (
        visited[`${x},${y}`] === true ||
        outOfCanvas(x, y, this._drawContext)
      ) {
        continue;
      }
      visited[`${x},${y}`] = true;
      const currentColor = this._drawContext.getImageData(x, y, 1, 1).data;
      // check if color is equal (alpha included)
      if (eqPixel(currentColor, fillColor, true)) {
        await fn(x, y);
        pixels.push({ x, y, color: this.color });
        next.push(
          ...[
            [x + 1, y],
            [x, y + 1],
            [x - 1, y],
            [x, y - 1],
          ]
        );
      }
    }
    return { data: pixels };
  };

  polygon: Command = async (...positions: number[]) => {
    if (positions.length < 4) {
      throw new Error("El polígono debe tener al menos 3 puntos");
    }
    if (positions.length % 2 !== 0) {
      throw new Error("Debes enviar un número par de parámetros");
    }

    const points: Point[] = positions.reduce<Point[]>(
      (acc, _, i) =>
        i % 2 ? acc : [...acc, { x: positions[i], y: positions[i + 1] }],
      []
    );
    points.unshift(this.position);
    points.push(this.position);
    const pixels: Pixel[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      pixels.push(
        ...this._line(
          points[i].x,
          points[i].y,
          points[i + 1].x,
          points[i + 1].y
        )
      );
    }

    return { data: checkBounds(pixels, this._drawContext) };
  };

  // Pen methods

  xy: Command = async (x: number, y: number) => {
    const prevPosition = structuredClone({ x: this.x, y: this.y });
    this.position = { x, y };
    return {
      data: [],
      undo: () => (this.position = prevPosition),
      redo: () => (this.position = { x, y }),
    };
  };

  rotate = async (angle: number) => {
    const prevAngle = structuredClone(this.angle);
    const newAngle = this.angle + angle;
    this.angle = newAngle;
    return {
      data: [],
      undo: () => (this.angle = prevAngle),
      redo: () => (this.angle = newAngle),
    };
  };

  penUp = async () => {
    const prevPenDown = structuredClone(this.isPenDown);
    this.isPenDown = false;
    return {
      data: [],
      undo: () => (this.isPenDown = prevPenDown),
      redo: () => (this.isPenDown = false),
    };
  };

  penDown = async () => {
    const prevPenDown = structuredClone(this.isPenDown);
    this.isPenDown = true;
    return {
      data: [],
      undo: () => (this.isPenDown = prevPenDown),
      redo: () => (this.isPenDown = true),
    };
  };

  setColor = async (r: number, g: number, b: number) => {
    const prevColor = structuredClone(this.color);
    this.color = { r, g, b, a: 255 };
    return {
      data: [],
      undo: () => (this.color = prevColor),
      redo: () => (this.color = { r, g, b, a: 255 }),
    };
  };
}
