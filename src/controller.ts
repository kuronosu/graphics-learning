import detectFunctionCall from './utils/function_call';
import { Command } from './commands';
import { HistoryManager } from './utils/history';
import { clearCtx } from './draw/common';
import { Drawer } from './draw/drawer';

type validCommands =
  | 'xy'
  | 'forward'
  | 'angle'
  | 'left'
  | 'right'
  | 'clear'
  | 'backward'
  | 'up'
  | 'down';
type CeroArgCommand = 'clear' | 'up' | 'down';
type OneArgCommand = 'forward' | 'angle' | 'left' | 'right' | 'backward';
type TwoArgCommand = 'xy';

export class Controller {
  private _drawHistory: HistoryManager<Command<any>>;
  private _drawer: Drawer;
  private _redraw: boolean;
  private _showGrid: boolean;

  constructor(context: CanvasRenderingContext2D) {
    this._redraw = true;
    this._drawHistory = new HistoryManager();
    this._drawer = new Drawer(context);
    this._showGrid = true;

    this._drawHistory.observe((h) => this.draw());
  }

  get history() {
    return this._drawHistory;
  }

  private _addCommand<T extends object>(command: Command<T>) {
    this._drawHistory.add(command);
  }

  private draw() {
    if (this._redraw) {
      clearCtx(this._drawer.ctx);
      this._drawer.pen.reset();
      if (this._showGrid) {
        this._drawer.grid();
      }
      this._drawer.ctx.beginPath();
      this._drawer.xy({ x: 0, y: 0 });
      for (const command of this._drawHistory.past) {
        command.run();
      }
      this._drawer.pen.draw(this._drawer.ctx);
      this._drawer.ctx.closePath();
    }
  }

  toogleGrid() {
    this._showGrid = !this._showGrid;
    this._redraw = true;
    this.draw();
  }

  private _validateCommandArgs(args: number[], fn: validCommands) {
    return args.length === this._commands[fn];
  }

  run(command: string): Error | null {
    const cmd = detectFunctionCall(command);
    if (cmd === null) {
      return new Error('Invalid command');
    }
    if (!Object.keys(this._commands).includes(cmd.name)) {
      return new Error('Invalid command');
    }
    if (!this._validateCommandArgs(cmd.args, cmd.name as validCommands)) {
      return new Error('Invalid command');
    }
    if (this._commands[cmd.name as validCommands] === 0) {
      this[cmd.name as CeroArgCommand]();
    } else if (this._commands[cmd.name as validCommands] === 1) {
      this[cmd.name as OneArgCommand](cmd.args[0]);
    } else if (this._commands[cmd.name as validCommands] === 2) {
      this[cmd.name as TwoArgCommand](cmd.args[0], cmd.args[1]);
    }
    return null;
  }

  // Commands
  private _commands: {
    [key in validCommands]: number;
  } = {
    clear: 0,
    up: 0,
    down: 0,
    left: 1,
    angle: 1,
    right: 1,
    forward: 1,
    backward: 1,
    xy: 2,
  };

  up() {
    this._addCommand(new Command('up', this._drawer.up, {}));
  }

  down() {
    this._addCommand(new Command('down', this._drawer.down, {}));
  }

  clear() {
    this._drawHistory.clear();
  }

  xy(x: number, y: number) {
    this._addCommand(new Command('xy', this._drawer.xy, { x, y }));
  }

  forward(distance: number) {
    this._addCommand(
      new Command('forward', this._drawer.forward, { distance }),
    );
  }
  backward(distance: number) {
    this._addCommand(
      new Command('backward', this._drawer.backward, { distance }),
    );
  }

  angle(angle: number) {
    this._addCommand(new Command('angle', this._drawer.angle, { angle }));
  }

  left(angle: number) {
    this._addCommand(new Command('left', this._drawer.left, { angle }));
  }

  right(angle: number) {
    this._addCommand(new Command('right', this._drawer.right, { angle }));
  }
}
