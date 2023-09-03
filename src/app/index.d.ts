export type Point = { x: number; y: number };

export type Color = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export interface IDrawer {
  readonly data: ImageData;
  pixel(x: number, y: number, color: Color): void;
  getPixel(x: number, y: number): Color;
}

export interface IInmutablePen {
  readonly x: number;
  readonly y: number;
  readonly position: Point;
  readonly angle: number;
  readonly color: Color;
  clone(options?: {
    x?: number;
    y?: number;
    angle?: number;
    color?: Color;
  }): IInmutablePen;
  move(x: number, y: number): IInmutablePen;
  rotate(r: number): IInmutablePen;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

export type CommandResult = {
  data: ImageData;
  pen: IInmutablePen;
  command: string;
  args: number[];
};

export type ParsedCommand = {
  name: string;
  args: number[];
};

export type Command = (...args: number[]) => CommandResult;
