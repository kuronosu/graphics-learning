import { getCanvasCartesianPoint } from './common';
import Pen from './pen';

async function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export class Drawer {
  private _pen: Pen;
  private _ctx: CanvasRenderingContext2D;
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

  left = async ({ angle }: { angle: number }) => {
    this._pen.rotate(angle);
  };

  right = async ({ angle }: { angle: number }) => {
    this._pen.rotate(-angle);
  };

  color = async ({ r, g, b }: { r: number; g: number; b: number }) => {
    this._pen.color = { r, g, b };
    this._pen.sync(this._ctx);
  };

  fill = async () => {
    this._ctx.save();
    const toPaint: number[][] = []
    const visited: { [key: string]: boolean } = {};
    this._ctx.fillStyle = this._pen.hexColor;
    //Flooding fill
    const next: number[][] = [];
    const { x, y } = getCanvasCartesianPoint(
      this._pen.position.x,
      this._pen.position.x,
      this._ctx,
    );
    next.push([x, y]);

    while (next.length > 0) {
      const [x, y] = next.shift()!;
      if (visited[`${x},${y}`] === true) {
        continue;
      }
      visited[`${x},${y}`] = true;
      const pixel = this._ctx.getImageData(x, y, 1, 1).data;
      if (
        (pixel[0] === 255 && pixel[1] === 255 && pixel[2] === 255) ||
        (pixel[0] === 0 && pixel[1] === 0 && pixel[2] === 0 && pixel[3] === 0)
      ) {
        if (this.animationSpeed > 0) {
          toPaint.push([x, y])
        } else {
          this._ctx.fillRect(x, y, 1, 1);
        }
        next.push(...[[x + 1, y],
        [x, y + 1],
        [x - 1, y],
        [x, y - 1],
        ]);
      }
    }

    if (this.animationSpeed > 0) {
      let c = 0;
      const n = 1000 / this.animationSpeed;
      const batch = toPaint.length / n;
      for (const p of toPaint) {
        if (c>batch) {
          await sleep(this.animationSpeed);
          c = 0;
        }
        c++;
        this._ctx.fillRect(p[0], p[1], 1, 1);
      }
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
