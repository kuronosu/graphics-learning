import { Color, Pixel } from "../..";
import { createPixelContainer } from "../utils";

export function line(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: Color,
  antialiased: boolean = true,
  th = 1
): Pixel[] {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  if (th > 1) {
    return plotLineWidth(x0, y0, x1, y1, th, color);
  }
  if (antialiased) {
    return plotLineAA(x0, y0, x1, y1, color);
  }
  return plotLine(x0, y0, x1, y1, color);
}

export function plotLine(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: Color
): Pixel[] {
  const { getPixels, setPixel } = createPixelContainer(color);
  let dx = Math.abs(x1 - x0),
    sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0),
    sy = y0 < y1 ? 1 : -1;
  let err = dx + dy,
    e2; // error value e_xy

  for (;;) {
    setPixel(x0, y0);
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
  return getPixels();
}

export function plotLineAA(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: Color
): Pixel[] {
  // draw a black (0) anti-aliased line on white (255) background
  let dx = Math.abs(x1 - x0),
    sx = x0 < x1 ? 1 : -1;
  let dy = Math.abs(y1 - y0),
    sy = y0 < y1 ? 1 : -1;
  let err = dx - dy,
    e2,
    x2; // error value e_xy
  let ed = dx + dy == 0 ? 1 : Math.sqrt(dx * dx + dy * dy);

  const { getPixels, setPixelAA } = createPixelContainer(color);

  for (;;) {
    // pixel loop
    setPixelAA(x0, y0, (255 * Math.abs(err - dx + dy)) / ed);
    e2 = err;
    x2 = x0;
    if (2 * e2 >= -dx) {
      // x step
      if (x0 == x1) break;
      if (e2 + dy < ed) setPixelAA(x0, y0 + sy, (e2 + dy) / ed);
      err -= dy;
      x0 += sx;
    }
    if (2 * e2 <= dy) {
      // y step
      if (y0 == y1) break;
      if (dx - e2 < ed) setPixelAA(x2 + sx, y0, (dx - e2) / ed);
      err += dx;
      y0 += sy;
    }
  }
  return getPixels();
}

function plotLineWidth(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  th: number,
  color: Color
): Pixel[] {
  // plot an anti-aliased line of width th pixel
  const { getPixels, setPixel, setPixelAA } = createPixelContainer(color);
  var dx = Math.abs(x1 - x0),
    sx = x0 < x1 ? 1 : -1;
  var dy = Math.abs(y1 - y0),
    sy = y0 < y1 ? 1 : -1;
  var err,
    e2 = Math.sqrt(dx * dx + dy * dy); // length

  if (th <= 1 || e2 == 0) return plotLineAA(x0, y0, x1, y1, color); // assert
  dx *= 255 / e2;
  dy *= 255 / e2;
  th = 255 * (th - 1); // scale values

  if (dx < dy) {
    // steep line
    x1 = Math.round((e2 + th / 2) / dy); // start offset
    err = x1 * dy - th / 2; // shift error value to offset width
    for (x0 -= x1 * sx; ; y0 += sy) {
      setPixelAA((x1 = x0), y0, err); // aliasing pre-pixel
      for (e2 = dy - err - th; e2 + dy < 255; e2 += dy)
        setPixel((x1 += sx), y0); // pixel on the line
      setPixelAA(x1 + sx, y0, e2); // aliasing post-pixel
      if (y0 == y1) break;
      err += dx; // y-step
      if (err > 255) {
        err -= dy;
        x0 += sx;
      } // x-step
    }
  } else {
    // flat line
    y1 = Math.round((e2 + th / 2) / dx); // start offset
    err = y1 * dx - th / 2; // shift error value to offset width
    for (y0 -= y1 * sy; ; x0 += sx) {
      setPixelAA(x0, (y1 = y0), err); // aliasing pre-pixel
      for (e2 = dx - err - th; e2 + dx < 255; e2 += dx)
        setPixel(x0, (y1 += sy)); // pixel on the line
      setPixelAA(x0, y1 + sy, e2); // aliasing post-pixel
      if (x0 == x1) break;
      err += dy; // x-step
      if (err > 255) {
        err -= dx;
        y0 += sy;
      } // y-step
    }
  }
  return getPixels();
}
