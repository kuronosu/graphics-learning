import detectFunctionCall from './utils/function_call';
import { Command } from './commands';
import { HistoryManager } from './utils/history';
import { clearCtx, drawPixels, getCartesianCanvasPoint, getColorIndicesForCoord } from './draw/common';
import { Drawer } from './draw/drawer';
import { ObservableValue } from './utils/observable';
import type { Point } from './types';

export class Controller {
  private _drawHistory: HistoryManager<Command<any>>;
  private _drawer: Drawer;
  private _redraw: boolean;
  private _isDrawing: ObservableValue<boolean>;
  public animateLastCommand = true; // TODO: check
  private _changeFromHistorySearch = false;

  constructor(context: CanvasRenderingContext2D) {
    this._redraw = true;
    this._drawHistory = new HistoryManager();
    this._drawer = new Drawer(context);
    this._isDrawing = new ObservableValue(false);

    this._drawHistory.observe(async (h) => {
      await this.draw();
    });
  }

  get redraw() {
    return this._redraw;
  }
  set redraw(redraw: boolean) {
    this._redraw = redraw;
  }

  get history() {
    return this._drawHistory;
  }

  get isDrawing() {
    return this._isDrawing;
  }

  private _addCommand<T extends object>(command: Command<T>) {
    this._drawHistory.add(command);
  }

  private async draw() {
    if (this._redraw && !this.isDrawing.value) {
      this._isDrawing.value = true;
      clearCtx(this._drawer.ctx);
      this._drawer.pen.reset();
      this._drawer.ctx.beginPath();
      this._drawer.xy({ x: 0, y: 0 });
      this._drawer.animationSpeed = 0;
      let idx = 0;
      // let lastPoint: Point | undefined;
      for (const command of this._drawHistory.past) {
        if (
          this.animateLastCommand &&
          !this._changeFromHistorySearch &&
          idx === this._drawHistory.past.length - 1
        ) {
          this._drawer.animationSpeed = 1000;
        }
        const points = await command.run();
        if (points) {
          drawPixels(points, this._drawer.ctx, this._drawer.pen.color);
          // lastPoint = {
          //   x: points[points.length - 1][0],
          //   y: points[points.length - 1][1],
          // };
        }
        idx++;
      }

      // if (lastPoint) {
      //   this._drawer.xy(getCartesianCanvasPoint(lastPoint.x, lastPoint.y, this._drawer.ctx));
      // }
      this._drawer.pen.draw(this._drawer.ctx);
      this._drawer.ctx.closePath();
      this._isDrawing.value = false;
      this._changeFromHistorySearch = false;
    }
  }

  get commandsArgCount() {
    return {
      arriba: [0, this.up],
      abajo: [0, this.down],
      limpiar: [0, this.clear],
      relleno: [0, this.fill],

      // angulo: [1, this.angle],
      rotar: [1, this.rotate],
      adelante: [1, this.forward],
      atras: [1, this.backward],
      cuadrado: [1, this.square],
      circulo: [1, this.circle],

      xy: [2, this.xy],

      color: [3, this.color],

      para: [4, this.each],

      poligono: [-1, this.polygon],
    };
  }

  private _validateCommandArgs(
    args: number[],
    fn: keyof typeof this.commandsArgCount,
  ) {
    if (this.commandsArgCount[fn][0] == -1) return true
    return args.length === this.commandsArgCount[fn][0];
  }

  parseCommand(command: string) {
    const cmd = detectFunctionCall(command);
    if (cmd === null) {
      throw new Error('Invalid command');
    }
    if (!Object.keys(this.commandsArgCount).includes(cmd.name)) {
      throw new Error('Invalid command');
    }
    if (
      !this._validateCommandArgs(
        cmd.args,
        cmd.name as keyof typeof this.commandsArgCount,
      )
    ) {
      throw new Error('Invalid command');
    }
    const [n, fn] =
      this.commandsArgCount[cmd.name as keyof typeof this.commandsArgCount];
    if (n === -1) {
      (fn as (v: number[]) => void)(cmd.args);
    } else if (n === 0) {
      (fn as () => void)();
    } else if (n === 1) {
      (fn as (v: number) => void)(cmd.args[0]);
    } else if (n === 2) {
      (fn as (v1: number, v2: number) => void)(cmd.args[0], cmd.args[1]);
    } else if (n === 3) {
      (fn as (v1: number, v2: number, v3: number) => void)(
        cmd.args[0],
        cmd.args[1],
        cmd.args[2],
      );
    } else if (n === 4) {
      (fn as (v1: number, v2: number, v3: number, v4: number) => void)(
        cmd.args[0],
        cmd.args[1],
        cmd.args[2],
        cmd.args[3],
      );
    }
  }

  // history
  undo = () => {
    this._changeFromHistorySearch = true;
    return this._drawHistory.undo();
  };

  redo = () => {
    this._changeFromHistorySearch = true;
    return this._drawHistory.redo();
  };

  // Commands

  up = () => {
    this._addCommand(new Command('arriba', this._drawer.up, {}));
  };

  down = () => {
    this._addCommand(new Command('abajo', this._drawer.down, {}));
  };

  clear = () => {
    this._drawHistory.clear();
  };

  xy = (x: number, y: number) => {
    this._addCommand(new Command('xy', this._drawer.xy, { x, y }));
  };

  forward = (distance: number) => {
    this._addCommand(
      new Command('adelante', this._drawer.forward, { distance }),
    );
  };

  backward = (distance: number) => {
    this._addCommand(new Command('atras', this._drawer.backward, { distance }));
  };

  angle = (angle: number) => {
    this._addCommand(new Command('angulo', this._drawer.angle, { angle }));
  };

  rotate = (angle: number) => {
    this._addCommand(new Command('rotar', this._drawer.rotate, { angle }));
  };

  color = (r: number, g: number, b: number) => {
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      throw new Error('Invalid color');
    }
    this._addCommand(new Command('color', this._drawer.color, { r, g, b }));
  };

  fill = () => {
    this._addCommand(new Command('relleno', this._drawer.fill, {}));
  };

  square = (size: number) => {
    this._addCommand(new Command('cuadrado', this._drawer.square, { size }));
  };

  polygon = (points: number[]) => {
    if (points.length % 2 !== 0) {
      throw new Error('Invalid polygon');
    }
    if (points.length < 2) {
      throw new Error('Invalid polygon');
    }
    this._addCommand(
      new Command('poligono', this._drawer.polygon, { points }),
    );
  };

  circle = (radius: number) => {
    this._addCommand(new Command('circulo', this._drawer.circle, { radius }));
  }

  each = (from: number, to: number, step: number, space: number) => {
    if (from < 0 || to < 0 || step < 0 || space < 0 || from > to) {
      throw new Error('Invalid para');
    }
    this._addCommand(new Command('para', this._drawer.each, { from, to, step, space }));
  }

  // End Commands
}
