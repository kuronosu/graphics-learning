import type { Color, Pixel, Point } from '../types'

const white: Color = { r: 255, g: 255, b: 255, a: 255 };

export default function drawLineWithAntiAliased(p1: Point, p2: Point, color: Color, wd: number = 2, useAA: boolean = false) {
  const pixels: Pixel[] = [];
  let x0 = p1.x;
  let y0 = p1.y;
  let x1 = p2.x;
  let y1 = p2.y;
  let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  let dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx - dy, e2, x2, y2; // error value e_xy
  let ed = dx + dy === 0 ? 1 : Math.sqrt(dx * dx + dy * dy);
  const _wd = wd;
  wd = (wd + 1) / 2
  while (1) { // pixel loop
    // setPixelColor(x0, y0, Math.max(0, 255 * (Math.abs(err - dx + dy) / ed - wd + 1)));
    // console.log(Math.max(0, 255 * (Math.abs(err - dx + dy) / ed - wd + 1)));
    pixels.push({ x: x0, y: y0, color });
    e2 = err;
    x2 = x0;
    if (2 * e2 >= -dx) { // x step
      for (e2 += dy, y2 = y0; e2 < ed * wd && (y1 !== y2 || dx > dy); e2 += dx) {
        // setPixelColor(x0, y2 += sy, Math.max(0, 255 * (Math.abs(e2) / ed - wd + 1)));
        y2 += sy
        // console.log(blendColors(color, white, getDistance({ x: _x0, y: _y0 }, { x: x0, y: y2 }) / _wd).a, Math.max(0, 255 * (Math.abs(e2) / ed - wd + 1)))
        pixels.push({
          x: x0, y: y2,
          color: useAA ? {
            r: color.r,//Math.max(0, color.r * (Math.abs(e2) / ed - wd + 1)),
            g: color.g,//Math.max(0, color.g * (Math.abs(e2) / ed - wd + 1)),
            b: color.b,//Math.max(0, color.b * (Math.abs(e2) / ed - wd + 1)),
            a: 255 - Math.round(Math.max(0, 255 * (Math.abs(e2) / ed - wd + 1))),
          } //blendColors(color, white, getDistance({ x: _x0, y: _y0 }, { x: x0, y: y2 }) / _wd)
            : color
        })
      }
      if (x0 === x1) break;
      e2 = err; err -= dy; x0 += sx;
    }
    if (2 * e2 <= dy) { // y step
      for (e2 = dx - e2; e2 < ed * wd && (x1 !== x2 || dx < dy); e2 += dy) {
        // setPixelColor(x2 += sx, y0, Math.max(0, 255 * (Math.abs(e2) / ed - wd + 1)));
        // console.log(Math.max(0, 255 * (Math.abs(e2) / ed - wd + 1)));
        x2 += sx
        pixels.push({
          x: x2, y: y0,
          color: useAA ? {
            r: color.r,//Math.max(0, color.r * (Math.abs(e2) / ed - wd + 1)),
            g: color.g,//Math.max(0, color.g * (Math.abs(e2) / ed - wd + 1)),
            b: color.b,//Math.max(0, color.b * (Math.abs(e2) / ed - wd + 1)),
            a: 255 - Math.round(Math.max(0, 255 * (Math.abs(e2) / ed - wd + 1))),
          } : color
        })
      }
      if (y0 === y1) break;
      err += dx; y0 += sy;
    }
  }

  return pixels;
}

function getDistance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Helper function to blend two colors
function blendColors(color1: Color, color2: Color, weight: number): Color {
  let alpha1: number = (color1.a ?? 255) / 255, alpha2: number = (color2.a ?? 255) / 255;
  const r = Math.round(color1.r * (1 - weight) * alpha1 + color2.r * weight * alpha2);
  const g = Math.round(color1.g * (1 - weight) * alpha1 + color2.g * weight * alpha2);
  const b = Math.round(color1.b * (1 - weight) * alpha1 + color2.b * weight * alpha2);
  const a = ((alpha1 + alpha2) / 2) * 255;
  return { r, g, b, a };
}

function translateLineParallel(P0: Point, P1: Point, d: number) {
  let v = { x: P1.x - P0.x, y: P1.y - P0.y };
  let normV = Math.sqrt(v.x * v.x + v.y * v.y);
  let u = { x: v.x / normV, y: v.y / normV };
  let w = { x: -u.y, y: u.x };
  let P0t = { x: P0.x + d * w.x, y: P0.y + d * w.y };
  let P1t = { x: P1.x + d * w.x, y: P1.y + d * w.y };
  return [P0t, P1t];
}
