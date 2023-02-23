import { drawPixel, eqPixel, getCanvasCartesianPoint, interpolateColor, outOfBounds } from './common';
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
    // this._ctx.save();
    // this._ctx.strokeStyle = this._pen.hexColor;


    // this._pen.isDown && this._ctx.lineTo(newPos.x, newPos.y);
    // this._pen.move(x, y);
    // this._pen.sync(this._ctx);
    // this._ctx.stroke();
    // this._ctx.restore();
    const _x = Math.round(this._pen.position.x + distance * Math.cos(this._pen.angle)),
      _y = Math.round(this._pen.position.y + distance * Math.sin(this._pen.angle));
    let { x: x0, y: y0 } = getCanvasCartesianPoint(
      this._pen.position.x, this._pen.position.y, this._ctx);
    let { x: x1, y: y1 } = getCanvasCartesianPoint(_x, _y, this._ctx);


    // let dx = Math.abs(x1 - x0);
    // let dy = Math.abs(y1 - y0);
    // let sx = x0 < x1 ? 1 : -1;
    // let sy = y0 < y1 ? 1 : -1;
    // let err = dx - dy;

    // while (x0 !== x1 || y0 !== y1) {
    //   this._pen.isDown && drawPixel(x0, y0, this._ctx, this._pen.color);
    //   let e2 = err * 2;
    //   if (e2 > -dy) {
    //     err -= dy;
    //     x0 += sx;
    //   }
    //   if (e2 < dx) {
    //     err += dx;
    //     y0 += sy;
    //   }
    // }

    let steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
    if (steep) {
      [x0, y0] = [y0, x0];
      [x1, y1] = [y1, x1];
    }
    if (x0 > x1) {
      [x0, x1] = [x1, x0];
      [y0, y1] = [y1, y0];
    }
    let dx = x1 - x0;
    let dy = Math.abs(y1 - y0);
    let err = dx / 2;
    let ystep = y0 < y1 ? 1 : -1;
    let y = y0;
    for (let x = x0; x <= x1; x++) {
      if (steep) {
        this._pen.isDown && drawPixel(y, x, this._ctx, interpolateColor(this.pen.color, err / dx));
      } else {
        this._pen.isDown && drawPixel(x, y, this._ctx, interpolateColor(this.pen.color, err / dx));
      }
      err -= dy;
      if (err < 0) {
        y += ystep;
        err += dx;
      }
    }



    this._pen.move(_x, _y);
    this._pen.sync(this._ctx)
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
        // this._ctx.fillRect(x, y, 1, 1);
        drawPixel(x, y, this._ctx, this._pen.color);
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
      this._pen.position.y,
      this._ctx,
    );
    next.push([x, y]);
    const fillColor = this._ctx.getImageData(x, y, 1, 1).data;

    const fn = this.animationSpeed > 0 ?
      action.paint :
      async (x: number, y: number) => {
        // this._ctx.fillRect(x, y, 1, 1)
        drawPixel(x, y, this._ctx, this._pen.color);
      };

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

  square = async ({ size }: { size: number }) => {
    this._ctx.save();
    for (let _ = 0; _ < 4; _++) {
      this.forward({ distance: size });
      this.rotate({ angle: -90 });
    }
    this._ctx.restore();
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
