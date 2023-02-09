import { getCanvasCartesianPoint } from './common';
import Pen from './pen';

export class Drawer {
  private _pen: Pen;
  private _ctx: CanvasRenderingContext2D;

  constructor(context: CanvasRenderingContext2D) {
    this._pen = new Pen();
    this._ctx = context;
  }

  get pen() {
    return this._pen;
  }

  get ctx() {
    return this._ctx;
  }

  grid() {
    const { width, height } = this._ctx.canvas;
    const x = width / 2;
    const y = height / 2;

    this._ctx.save();
    this._ctx.beginPath();
    this._ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    this._ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 10) {
      this._ctx.moveTo(i, 0);
      this._ctx.lineTo(i, height);
    }
    for (let i = 0; i < height; i += 10) {
      this._ctx.moveTo(0, i);
      this._ctx.lineTo(width, i);
    }
    this._ctx.moveTo(0, y);
    this._ctx.lineTo(width, y);
    this._ctx.moveTo(x, 0);
    this._ctx.lineTo(x, height);
    this._ctx.stroke();
    this._ctx.restore();
    this._ctx.closePath();
  }

  up = () => {
    this._pen.up();
  };

  down = () => {
    this._pen.down();
  };

  xy = ({ x, y }: { x: number; y: number }) => {
    this._pen.move(x, y);
    this._pen.sync(this._ctx);
  };

  forward = ({ distance }: { distance: number }) => {
    const x = this._pen.position.x + distance * Math.cos(this._pen.angle);
    const y = this._pen.position.y + distance * Math.sin(this._pen.angle);
    const newPos = getCanvasCartesianPoint(x, y, this._ctx);

    this._pen.isDown && this._ctx.lineTo(newPos.x, newPos.y);
    this._pen.move(x, y);
    this._pen.sync(this._ctx);
    this._ctx.stroke();
  };

  backward = ({ distance }: { distance: number }) => {
    this.forward({ distance: -distance });
  };

  angle = ({ angle }: { angle: number }) => {
    this._pen.angle = angle;
  };

  left = ({ angle }: { angle: number }) => {
    this._pen.rotate(angle);
  };

  right = ({ angle }: { angle: number }) => {
    this._pen.rotate(-angle);
  };

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
