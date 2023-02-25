import type { Color } from "src/types";

export const clearCtx = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

export function toDegrees(radians: number) {
  return (radians * 180) / Math.PI;
}

export function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function rotatePoint(
  x: number,
  y: number,
  angle: number,
  cx: number,
  cy: number,
) {
  const s = Math.sin(angle);
  const c = Math.cos(angle);
  x -= cx;
  y -= cy;
  const xnew = x * c - y * s;
  const ynew = x * s + y * c;
  x = xnew + cx;
  y = ynew + cy;
  return { x, y };
}

export const getCanvasCartesianPoint = function (
  x: number,
  y: number,
  ctx: CanvasRenderingContext2D,
  rotate?: { x: number; y: number; angle: number },
) {
  const { width, height } = ctx.canvas;
  if (rotate) {
    const rotated = rotatePoint(x, y, rotate.angle, rotate.x, rotate.y);
    x = rotated.x;
    y = rotated.y;
  }
  const cartesianX = width / 2 + x;
  const cartesianY = height / 2 - y;
  return { x: cartesianX, y: cartesianY };
};

export const eqPixel = function (
  p1: Uint8ClampedArray,
  p2: Uint8ClampedArray,
  alpha = false,
) {
  return p1[0] == p2[0] && p1[1] == p2[1] && p1[2] == p2[2] && (!alpha || p1[3] == p2[3]);
}

export const outOfBounds = function (
  x: number,
  y: number,
  ctx: CanvasRenderingContext2D,
) {
  const { width, height } = ctx.canvas;
  return x < 0 || x > width || y < 0 || y > height;
}

export const getColorIndicesForCoord = (x: number, y: number, width: number) => {
  const red = y * (width * 4) + x * 4;
  return [red, red + 1, red + 2, red + 3];
};

export const drawPixels = function (
  pixels: number[][],
  ctx: CanvasRenderingContext2D,
  color?: Color,
) {
  const { width, height } = ctx.canvas;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < pixels.length; i++) {
    const [x, y] = pixels[i];
    const [r, g, b, a] = getColorIndicesForCoord(x, y, width);
    data[r] = color?.r ?? 0;
    data[g] = color?.g ?? 0;
    data[b] = color?.b ?? 0;
    data[a] = color?.a ?? 255;
    // drawPixel(x, y, ctx, color);
  }
  ctx.putImageData(imgData, 0, 0);
}

export const drawPixel = function (
  x: number,
  y: number,
  ctx: CanvasRenderingContext2D,
  color?: Color,
) {
  const imgData = ctx.createImageData(1, 1);
  const data = imgData.data;
  data[0] = color?.r ?? 0;
  data[1] = color?.g ?? 0;
  data[2] = color?.b ?? 0;
  data[3] = color?.a ?? 255;
  ctx.putImageData(imgData, x, y);
}

export function interpolateColor(color: Color, alpha: number): Color {
  let r = Math.round((1 - alpha) * color.r + alpha * 255);
  let g = Math.round((1 - alpha) * color.g + alpha * 255);
  let b = Math.round((1 - alpha) * color.b + alpha * 255);
  let a = Math.round((1 - alpha) * (color.a ?? 255) + alpha * 255);
  return { r, g, b, a };
}
