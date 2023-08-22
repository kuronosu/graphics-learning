import type { Color, IDrawer, Point } from "..";

function ipart(x: number) {
  return Math.floor(x);
}

function round(x: number) {
  return ipart(x + 0.5);
}

function fpart(x: number) {
  return x - ipart(x);
}

function rfpart(x: number) {
  return 1 - fpart(x);
}

function alphaBlend(bg: Color, fg: Color) {
  // let a = bg.a + fg.a * (1 - bg.a);
  // return {
  //   r: (bg.r * bg.a + fg.r * fg.a * (1 - bg.a)) / a,
  //   g: (bg.g * bg.a + fg.g * fg.a * (1 - bg.a)) / a,
  //   b: (bg.b * bg.a + fg.b * fg.a * (1 - bg.a)) / a,
  //   a: a,
  // };
  const r: Color = { ...fg };
  const bga = bg.a / 255;
  const fga = fg.a / 255;
  const ra = 1 - (1 - fga) * (1 - bga);
  if (ra < 1.0e-6) return r; // Fully transparent -- R,G,B not important
  r.r = (fg.r * fga) / ra + (bg.r * bga * (1 - fga)) / ra;
  r.g = (fg.g * fga) / ra + (bg.g * bga * (1 - fga)) / ra;
  r.b = (fg.b * fga) / ra + (bg.b * bga * (1 - fga)) / ra;
  r.a = ra * 255;
  return r;
}

export default class Drawer implements IDrawer {
  /**
   * Class responsible for drawing geometric primitives, does not modify the original ImageData
   */
  private _data: ImageData;
  private readonly thickness: boolean;

  constructor(data: ImageData, thickness = true) {
    this._data = new ImageData(
      new Uint8ClampedArray(data.data),
      data.width,
      data.height
    );
    this.thickness = thickness;
  }

  get data() {
    return this._data;
  }

  pixel(x: number, y: number, color: Color): void {
    const n = (y * this._data.width + x) * 4;
    this._data.data[n] = color.r;
    this._data.data[n + 1] = color.g;
    this._data.data[n + 2] = color.b;
    this._data.data[n + 3] = color.a;
  }

  getPixel(x: number, y: number): Color {
    const n = (y * this._data.width + x) * 4;
    return {
      r: this._data.data[n],
      g: this._data.data[n + 1],
      b: this._data.data[n + 2],
      a: this._data.data[n + 3],
    };
  }

  line(
    p1: Point,
    p2: Point,
    color: Color,
    antialiased: boolean = true
    // th = 1
  ) {
    let x0 = Math.round(p1.x);
    let y0 = Math.round(p1.y);
    let x1 = Math.round(p2.x);
    let y1 = Math.round(p2.y);
    if (antialiased) {
      this._lineAA(x0, y0, x1, y1, color);
      return;
    }
    return this._line(x0, y0, x1, y1, color);
  }

  private _line(x0: number, y0: number, x1: number, y1: number, color: Color) {
    // Bresenham's line algorithm
    let dx = Math.abs(x1 - x0),
      sx = x0 < x1 ? 1 : -1;
    let dy = -Math.abs(y1 - y0),
      sy = y0 < y1 ? 1 : -1;
    let err = dx + dy,
      e2; // error value e_xy

    for (;;) {
      this.pixel(x0, y0, color);
      if (x0 == x1 && y0 == y1) break;
      e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x0 += sx;
      } // x step
      if (e2 <= dx) {
        err += dx;
        y0 += sy;
      } // y step
    }
  }

  _lineAA(x0: number, y0: number, x1: number, y1: number, color: Color) {
    // Implementation of Xiaolin Wu's line algorithm
    const _plot = (x: number, y: number, c: number) => {
      // c is the brightness of the pixel between 0 and 1
      const colour = { ...color, a: ipart(c * 255) };
      this.pixel(x, y, alphaBlend(this.getPixel(x, y), colour));
      if (this.thickness) {
        this.pixel(x + 1, y, alphaBlend(this.getPixel(x + 1, y), colour));
        this.pixel(x - 1, y, alphaBlend(this.getPixel(x - 1, y), colour));
        this.pixel(x, y + 1, alphaBlend(this.getPixel(x, y + 1), colour));
        this.pixel(x, y - 1, alphaBlend(this.getPixel(x, y - 1), colour));
      }
      // this.pixel(x + 1, y + 1, alphaBlend(this.getPixel(x + 1, y + 1), colour));
      // this.pixel(x + 1, y - 1, alphaBlend(this.getPixel(x + 1, y - 1), colour));
      // this.pixel(x - 1, y + 1, alphaBlend(this.getPixel(x - 1, y + 1), colour));
      // this.pixel(x - 1, y - 1, alphaBlend(this.getPixel(x - 1, y - 1), colour));
    };
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
    let dy = y1 - y0;
    let gradient = dx === 0 ? 1 : dy / dx;

    let xend = round(x0);
    let yend = y0 + gradient * (xend - x0);
    let xgap = rfpart(x0 + 0.5);
    let xpxl1 = xend;
    let ypxl1 = ipart(yend);

    if (steep) {
      _plot(ypxl1, xpxl1, rfpart(yend) * xgap);
      _plot(ypxl1 + 1, xpxl1, fpart(yend) * xgap);
    } else {
      _plot(xpxl1, ypxl1, rfpart(yend) * xgap);
      _plot(xpxl1, ypxl1 + 1, fpart(yend) * xgap);
    }

    let intery = yend + gradient;

    xend = round(x1);
    yend = y1 + gradient * (xend - x1);
    xgap = fpart(x1 + 0.5);
    let xpxl2 = xend;
    let ypxl2 = ipart(yend);

    if (steep) {
      _plot(ypxl2, xpxl2, rfpart(yend) * xgap);
      _plot(ypxl2 + 1, xpxl2, fpart(yend) * xgap);
    } else {
      _plot(xpxl2, ypxl2, rfpart(yend) * xgap);
      _plot(xpxl2, ypxl2 + 1, fpart(yend) * xgap);
    }

    for (let x = xpxl1 + 1; x < xpxl2; x++) {
      if (steep) {
        _plot(ipart(intery), x, rfpart(intery));
        _plot(ipart(intery) + 1, x, fpart(intery));
      } else {
        _plot(x, ipart(intery), rfpart(intery));
        _plot(x, ipart(intery) + 1, fpart(intery));
      }
      intery += gradient;
    }
  }

  circle(xm: number, ym: number, r: number, color: Color, antialiased = true) {
    if (antialiased) {
      return this._circleAA(xm, ym, r, color);
    }
    return this._circle(xm, ym, r, color);
  }

  private _circle(xm: number, ym: number, r: number, color: Color) {
    // Bresenham's circle algorithm
    let x = -r,
      y = 0,
      err = 2 - 2 * r; // bottom left to top right
    do {
      this.pixel(xm - x, ym + y, color); //   I. Quadrant +x +y
      this.pixel(xm - y, ym - x, color); //  II. Quadrant -x +y
      this.pixel(xm + x, ym - y, color); // III. Quadrant -x -y
      this.pixel(xm + y, ym + x, color); //  IV. Quadrant +x -y
      r = err;
      if (r <= y) err += ++y * 2 + 1; // y step
      if (r > x || err > y) err += ++x * 2 + 1; // x step
    } while (x < 0);
  }

  private _circleAA(xm: number, ym: number, r: number, color: Color) {
    // Implementation of Xiaolin Wu's circle algorithm
    const _plot = (x: number, y: number, c: number) => {
      const colour = { ...color, a: ipart(255 - c) };
      this.pixel(x, y, alphaBlend(this.getPixel(x, y), colour));
      if (this.thickness) {
        this.pixel(x + 1, y, alphaBlend(this.getPixel(x + 1, y), colour));
        this.pixel(x - 1, y, alphaBlend(this.getPixel(x - 1, y), colour));
        this.pixel(x, y + 1, alphaBlend(this.getPixel(x, y + 1), colour));
        this.pixel(x, y - 1, alphaBlend(this.getPixel(x, y - 1), colour));
      }
    };

    let x = r,
      y = 0; // II. quadrant from bottom left to top right
    let i,
      x2,
      e2,
      err = 2 - 2 * r; // error of 1.step
    r = 1 - err;
    for (;;) {
      i = (255 * Math.abs(err + 2 * (x + y) - 2)) / r; // get blend value of pixel
      // let _color = { ...color, a: (1 - i / 255) * 255 };
      _plot(xm + x, ym - y, i); //   I. Quadrant
      _plot(xm + y, ym + x, i); //  II. Quadrant
      _plot(xm - x, ym + y, i); // III. Quadrant
      _plot(xm - y, ym - x, i); //  IV. Quadrant

      if (x == 0) break;
      e2 = err;
      x2 = x; // remember values
      if (err > y) {
        // x step
        i = (255 * (err + 2 * x - 1)) / r; // outward pixel
        // let _color = { ...color, a: (1 - i / 255) * 255 };
        if (i < 255) {
          _plot(xm + x, ym - y + 1, i);
          _plot(xm + y - 1, ym + x, i);
          _plot(xm - x, ym + y - 1, i);
          _plot(xm - y + 1, ym - x, i);
        }
        err -= --x * 2 - 1;
      }
      if (e2 <= x2--) {
        // y step
        i = (255 * (1 - 2 * y - e2)) / r; // inward pixel
        // let _color = { ...color, a: (1 - i / 255) * 255 };
        if (i < 255) {
          _plot(xm + x2, ym - y, i);
          _plot(xm + y, ym + x2, i);
          _plot(xm - x2, ym + y, i);
          _plot(xm - y, ym - x2, i);
        }
        err -= --y * 2 - 1;
      }
    }
  }

  // floodFill(x: number, y: number, color: Color) {
  //   const targetColor = this.getPixel(x, y);
  //   if (
  //     targetColor.r === color.r &&
  //     targetColor.g === color.g &&
  //     targetColor.b === color.b
  //   ) {
  //     return;
  //   }
  //   const stack: Point[] = [];
  //   stack.push({ x, y });
  //   while (stack.length > 0) {
  //     stack.pop();
  //     let x1 = x;
  //     let y1 = y;
  //   }
  // }

  fill(x: number, y: number, fillColor: Color): void {
    const compare = (bg: Color, fg: Color) => {
      return bg.r === fg.r && bg.g === fg.g && bg.b === fg.b && bg.a === fg.a;
    };
    const targetColor = this.getPixel(x, y);
    if (compare(targetColor, fillColor)) return;
    const stack: [number, number][] = [];
    stack.push([x, y]);
    let n = 0;
    let m = 0;
    while (stack.length > 0) {
      n++;
      const [x, y] = stack.pop()!;
      if (x < 0 || x >= this._data.width) continue;
      if (y < 0 || y >= this._data.height) continue;
      if (!compare(this.getPixel(x, y), targetColor)) continue;
      m++;
      this.pixel(x, y, fillColor);
      stack.push([x + 1, y]);
      stack.push([x - 1, y]);
      stack.push([x, y + 1]);
      stack.push([x, y - 1]);
    }
  }
}
