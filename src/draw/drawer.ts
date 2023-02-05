import { clearCtx, getCanvasCartesianPoint } from './common';
import { SelfObservable } from '../utils/observable';
import Pen from './pen';
import { HistoryManager } from '../utils/history';

type Command = {
  fn: Function;
  data: any;
};

export class Drawer extends SelfObservable<Drawer> {
  private _pen: Pen;
  private _redraw: boolean;
  private _ctx: CanvasRenderingContext2D;
  private _drawHistory: HistoryManager<Command>;

  constructor(context: CanvasRenderingContext2D) {
    super();
    this._redraw = true;
    this._pen = new Pen();
    this._ctx = context;
    this._drawHistory = new HistoryManager<Command>();

    this.observe((self) => self._draw());
    this._draw();
  }

  private _drawCoords() {
    const { width, height } = this._ctx.canvas;
    const x = width / 2;
    const y = height / 2;

    this._ctx.save();
    this._ctx.beginPath();

    this._ctx.strokeStyle = 'red';
    this._ctx.lineWidth = 1;
    this._ctx.moveTo(0, y);
    this._ctx.lineTo(width, y);
    this._ctx.moveTo(x, 0);
    this._ctx.lineTo(x, height);
    this._ctx.stroke();
    this._ctx.restore();
    this._ctx.closePath();
  }

  _draw() {
    if (this._redraw) {
      clearCtx(this._ctx);
      this._pen.reset();
      this._drawCoords();
      this._ctx.beginPath();
      this._xy({ x: 0, y: 0 });
      for (const command of this._drawHistory) {
        command.fn.call(this, command.data);
      }
      this._pen.draw(this._ctx);
      this._ctx.closePath();
    }
  }

  clear() {
    clearCtx(this._ctx);
    this._call();
  }

  private _runCommand(command: Command) {
    this._drawHistory.add(command);
    command.fn.call(this, command.data);
    this._call();
  }

  xy(x: number, y: number) {
    this._runCommand({ fn: this._xy, data: { x, y } });
  }

  forward(distance: number) {
    this._runCommand({ fn: this._forward, data: { distance } });
  }

  angle(angle: number) {
    this._runCommand({ fn: this._angle, data: { angle } });
  }

  left(angle: number) {
    this._runCommand({ fn: this._left, data: { angle } });
  }

  right(angle: number) {
    this._runCommand({ fn: this._left, data: { angle: -angle } });
  }

  private _xy({ x, y }: { x: number; y: number }) {
    this._pen.move(x, y);
    this._pen.sync(this._ctx);
  }

  private _forward({ distance }: { distance: number }) {
    const x = this._pen.position.x + distance * Math.cos(this._pen.angle);
    const y = this._pen.position.y + distance * Math.sin(this._pen.angle);
    const newPos = getCanvasCartesianPoint(x, y, this._ctx);

    this._ctx.lineTo(newPos.x, newPos.y);
    this._pen.move(x, y);
    this._pen.sync(this._ctx);
    this._pen.isDown && this._ctx.stroke();
  }

  private _angle({ angle }: { angle: number }) {
    this._pen.angle = angle;
  }

  private _left({ angle }: { angle: number }) {
    this._pen.rotate(angle);
  }

  // forward(distance)
  // right(angle)
  // left(angle)
  // goto(x,y)
  // clear()
  // penup()
  // pendown()
  // reset()
  // angle(angle)
  // degToRad(angle)
  // radToDeg(angle)
  // width(width)
  // shape(shape)
  // colour(r,g,b,a)
  // color(r,g,b,a)
  // write(msg)
  // n = random(low,high)
  // hideTurtle()
  // showTurtle()
  // redrawOnMove(bool)
  // draw()
  // repeat(n, action)
}
