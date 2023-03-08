import { Color, Pixel } from "../..";
import { createPixelContainer } from "../utils";

export function circle(
  cx: number,
  cy: number,
  radius: number,
  color: Color,
  antialiased: boolean = false
): Pixel[] {
  if (antialiased) {
    return plotCircleAA(cx, cy, radius, color);
  }
  return plotCircle(cx, cy, radius, color);
}

function plotCircle(xm: number, ym: number, r: number, color: Color): Pixel[] {
  const { getPixels, setPixel } = createPixelContainer(color);
  let x = -r,
    y = 0,
    err = 2 - 2 * r; // bottom left to top right
  do {
    setPixel(xm - x, ym + y); //   I. Quadrant +x +y
    setPixel(xm - y, ym - x); //  II. Quadrant -x +y
    setPixel(xm + x, ym - y); // III. Quadrant -x -y
    setPixel(xm + y, ym + x); //  IV. Quadrant +x -y
    r = err;
    if (r <= y) err += ++y * 2 + 1; // y step
    if (r > x || err > y) err += ++x * 2 + 1; // x step
  } while (x < 0);
  return getPixels();
}

export function plotCircleAA(
  xm: number,
  ym: number,
  r: number,
  color: Color
): Pixel[] {
  // draw a black anti-aliased circle on white background
  const { getPixels, setPixelAA } = createPixelContainer(color);
  var x = r,
    y = 0; // II. quadrant from bottom left to top right
  var i,
    x2,
    e2,
    err = 2 - 2 * r; // error of 1.step
  r = 1 - err;
  for (;;) {
    i = (255 * Math.abs(err + 2 * (x + y) - 2)) / r; // get blend value of pixel
    setPixelAA(xm + x, ym - y, i); //   I. Quadrant
    setPixelAA(xm + y, ym + x, i); //  II. Quadrant
    setPixelAA(xm - x, ym + y, i); // III. Quadrant
    setPixelAA(xm - y, ym - x, i); //  IV. Quadrant
    if (x == 0) break;
    e2 = err;
    x2 = x; // remember values
    if (err > y) {
      // x step
      i = (255 * (err + 2 * x - 1)) / r; // outward pixel
      if (i < 255) {
        setPixelAA(xm + x, ym - y + 1, i);
        setPixelAA(xm + y - 1, ym + x, i);
        setPixelAA(xm - x, ym + y - 1, i);
        setPixelAA(xm - y + 1, ym - x, i);
      }
      err -= --x * 2 - 1;
    }
    if (e2 <= x2--) {
      // y step
      i = (255 * (1 - 2 * y - e2)) / r; // inward pixel
      if (i < 255) {
        setPixelAA(xm + x2, ym - y, i);
        setPixelAA(xm + y, ym + x2, i);
        setPixelAA(xm - x2, ym + y, i);
        setPixelAA(xm - y, ym - x2, i);
      }
      err -= --y * 2 - 1;
    }
  }
  return getPixels();
}
