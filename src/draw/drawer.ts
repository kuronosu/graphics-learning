import { eqPixel, getCanvasCartesianPoint, outOfBounds } from './common';
import Pen from './pen';

async function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export class Drawer {
  private _pen: Pen;
  private _ctx: CanvasRenderingContext2D;
  private _calculatedFills: { [key: string]: boolean } = {};
  public animationSpeed = 0;

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

  up = async () => {
    this._pen.up();
  };

  down = async () => {
    this._pen.down();
  };

  xy = async ({ x, y }: { x: number; y: number }) => {
    this._pen.move(x, y);
    this._pen.sync(this._ctx);
  };

  forward = async ({ distance }: { distance: number }) => {
    this._ctx.save();
    this._ctx.strokeStyle = this._pen.hexColor;
    const x = this._pen.position.x + distance * Math.cos(this._pen.angle);
    const y = this._pen.position.y + distance * Math.sin(this._pen.angle);
    const newPos = getCanvasCartesianPoint(x, y, this._ctx);

    this._pen.isDown && this._ctx.lineTo(newPos.x, newPos.y);
    this._pen.move(x, y);
    this._pen.sync(this._ctx);
    this._ctx.stroke();
    this._ctx.restore();
  };

  backward = async ({ distance }: { distance: number }) => {
    this.forward({ distance: -distance });
  };

  angle = async ({ angle }: { angle: number }) => {
    this._pen.angle = angle;
  };

  rotate = async ({ angle }: { angle: number }) => {
    this._pen.rotate(angle);
  };

  color = async ({ r, g, b }: { r: number; g: number; b: number }) => {
    this._pen.color = { r, g, b };
    this._pen.sync(this._ctx);
  };

  fill = async () => {
    const action = {
      c: 0,
      paint: async (x: number, y: number) => {
        this._ctx.fillRect(x, y, 1, 1);
        action.c++;
        if (action.c > 1000) {
          await sleep(1);
          action.c = 0;
        }
      }
    }

    this._ctx.save();
    const painted: number[][] = []
    const visited: { [key: string]: boolean } = {};
    this._ctx.fillStyle = this._pen.hexColor;
    const next: number[][] = [];
    const { x, y } = getCanvasCartesianPoint(
      this._pen.position.x,
      this._pen.position.x,
      this._ctx,
    );
    next.push([x, y]);
    const fillColor = this._ctx.getImageData(x, y, 1, 1).data;

    const fn = this.animationSpeed > 0 ? action.paint : async (x: number, y: number) => this._ctx.fillRect(x, y, 1, 1);

    while (next.length > 0) {
      const [x, y] = next.shift()!;
      if (visited[`${x},${y}`] === true || outOfBounds(x, y, this._ctx)) {
        continue;
      }
      visited[`${x},${y}`] = true;
      const currentColor = this._ctx.getImageData(x, y, 1, 1).data;
      if (eqPixel(currentColor, fillColor, true)) {
        await fn(x, y)
        painted.push([x, y])
        next.push(...[
          [x + 1, y],
          [x, y + 1],
          [x - 1, y],
          [x, y - 1],
        ]);
      }
    }

    return painted;
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
