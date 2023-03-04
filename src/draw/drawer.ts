import type { Point } from 'src/types';
import { drawPixel, drawPixels, eqPixel, getCanvasCartesianPoint, interpolateColor, outOfBounds } from './common';
import drawLineWithAntiAliased from './line';
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

  line = async (x1: number, y1: number, x2: number, y2: number) => {
    this.xy({ x: x2, y: y2 });
    return drawLineWithAntiAliased({ x: x1, y: y1 }, { x: x2, y: y2 }, this._pen.color).map((point) => {
      const { x, y } = getCanvasCartesianPoint(point.x, point.y, this._ctx);
      if (outOfBounds(x, y, this._ctx)) {
        return;
      }
      return [x, y];
    }).filter((point) => point) as number[][];
  };

  forward = async ({ distance }: { distance: number }): Promise<number[][] | void> => {
    const _x = Math.round(this._pen.position.x + distance * Math.cos(this._pen.angle)),
      _y = Math.round(this._pen.position.y + distance * Math.sin(this._pen.angle));
    const points = await this.line(this._pen.position.x, this._pen.position.y, _x, _y);
    drawPixels(points,
      this.ctx,
      this.pen.color);
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
    const points: number[][] = [];
    this._ctx.save();
    for (let _ = 0; _ < 4; _++) {
      // points.push(...(
      await this.forward({ distance: size })
      // ));
      this.rotate({ angle: -90 });
    }
    this._ctx.restore();
    drawPixels(points,
      this.ctx,
      this.pen.color);
    // if (points.length > 0) {
    //   return points
    // }
  };

  polygon = async ({ points }: { points: number[] }) => {
    const painted: number[][] = [];
    const _points: Point[] = [];
    for (let i = 0; i < points.length; i += 2) {
      _points.push({ x: points[i], y: points[i + 1] });
    }
    _points.unshift(this._pen.position);
    this._ctx.save();
    for (let i = 0; i < _points.length; i++) {
      const point = _points[i];
      const next = _points[(i + 1) % _points.length];
      painted.push(...(await this.line(point.x, point.y, next.x, next.y)));
    }
    this._ctx.restore();
    drawPixels(_points.map(it => [it.x, it.y]),
      this.ctx,
      this.pen.color);
    // return painted;
  }

  circle = async ({ radius }: { radius: number }) => {
    const { x: xm, y: ym } = this._pen.position;
    this._ctx.save();
    const points: number[][] = [];
    const _add = (x: number, y: number) => {
      const { x: px, y: py } = getCanvasCartesianPoint(x, y, this._ctx)
      if (!outOfBounds(px, py, this._ctx)) {
        points.push([px, py]);
      }
    }

    let x = radius, y = 0;            /* II. quadrant from bottom left to top right */
    let i, x2, e2, err = 2 - 2 * radius;                             /* error of 1.step */
    radius = 1 - err;
    for (; ;) {
      i = 255 * Math.abs(err + 2 * (x + y) - 2) / radius;          /* get blend value of pixel */
      _add(xm + x, ym - y); // i   /*   I. Quadrant */
      _add(xm + y, ym + x); // i   /*  II. Quadrant */
      _add(xm - x, ym + y); // i   /* III. Quadrant */
      _add(xm - y, ym - x); // i   /*  IV. Quadrant */
      if (x == 0) break;
      e2 = err; x2 = x;                                    /* remember values */
      if (err > y) {                                                /* x step */
        i = 255 * (err + 2 * x - 1) / radius;                              /* outward pixel */
        if (i < 255) {
          _add(xm + x, ym - y + 1); // i
          _add(xm + y - 1, ym + x); // i
          _add(xm - x, ym + y - 1); // i
          _add(xm - y + 1, ym - x); // i
        }
        err -= --x * 2 - 1;
      }
      if (e2 <= x2--) {                                             /* y step */
        i = 255 * (1 - 2 * y - e2) / radius;                                /* inward pixel */
        if (i < 255) {
          _add(xm + x2, ym - y); // i
          _add(xm + y, ym + x2); // i
          _add(xm - x2, ym + y); // i
          _add(xm - y, ym - x2); // i
        }
        err -= --y * 2 - 1;
      }
    }
    this._ctx.restore();
    drawPixels(points, this.ctx, this.pen.color);
    // return points;
  };

  each = async ({ from, to, step, space }: { from: number, to: number, step: number, space?: number }) => {
    // const painted: number[][] = [];
    const _space = space || 10;
    this._ctx.save();

    const xf = Math.round(this._pen.position.x + to * Math.cos(this._pen.angle)),
      yf = Math.round(this._pen.position.y + to * Math.sin(this._pen.angle));
    if (from !== 0) {
      this.xy({
        x: Math.round(this._pen.position.x + from * Math.cos(this._pen.angle)),
        y: Math.round(this._pen.position.y + from * Math.sin(this._pen.angle))
      });
    }
    let restDistance = Math.hypot(xf - this._pen.position.x, yf - this._pen.position.y);
    let prevDistance = restDistance;
    while (prevDistance >= restDistance) {
      if (step + _space > restDistance) {
        await this.forward({ distance: step > restDistance ? restDistance : step });
        break;
      }
      await this.forward({ distance: step });
      this.xy({
        x: Math.round(this._pen.position.x + _space * Math.cos(this._pen.angle)),
        y: Math.round(this._pen.position.y + _space * Math.sin(this._pen.angle))
      });
      prevDistance = restDistance;
      restDistance = Math.hypot(xf - this._pen.position.x, yf - this._pen.position.y);
    }
    this.xy({ x: xf, y: yf });
    this._ctx.restore();
    // return painted;
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
