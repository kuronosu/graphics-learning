import detectFunctionCall from './utils/function_call';
import { Command } from './commands';
import { HistoryManager } from './utils/history';
import { clearCtx } from './draw/common';
import { Drawer } from './draw/drawer';
import { ObservableValue } from './utils/observable';

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
      for (const command of this._drawHistory.past) {
        if (
          this.animateLastCommand &&
          !this._changeFromHistorySearch &&
          idx === this._drawHistory.past.length - 1
        ) {
          console.log('setting animation speed to 0.1');
          this._drawer.animationSpeed = 10;
        }
        await command.run();
        idx++;
      }
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

      izquierda: [1, this.left],
      angulo: [1, this.angle],
      derecha: [1, this.right],
      adelante: [1, this.forward],
      atras: [1, this.backward],

      xy: [2, this.xy],

      color: [3, this.color],
    };
  }

  private _validateCommandArgs(
    args: number[],
    fn: keyof typeof this.commandsArgCount,
  ) {
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
    if (n === 0) {
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

  left = (angle: number) => {
    this._addCommand(new Command('izquierda', this._drawer.left, { angle }));
  };

  right = (angle: number) => {
    this._addCommand(new Command('derecha', this._drawer.right, { angle }));
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

  // End Commands
}
