import { Point } from ".";

export function toDegrees(radians: number) {
  return (radians * 180) / Math.PI;
}

export function convertTo360(angle: number) {
  // Ajustar el ángulo para que esté dentro del rango de 0 a 360 grados
  angle %= 360;
  // Si el ángulo es negativo, agregar 360 para obtener un valor positivo equivalente
  if (angle < 0) {
    angle += 360;
  }

  return angle;
}

export function toRadians(degrees: number) {
  // console.log("degrees 1", degrees);
  degrees = convertTo360(degrees);
  // console.log("degrees 2", degrees);

  return (degrees * Math.PI) / 180;
}

export function rotatePoint(p: Point, c: Point, angle: number): Point {
  let { x, y } = p;
  const { x: cx, y: cy } = c;
  1;
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  x -= cx;
  y -= cy;
  const xnew = x * cos - y * sin;
  const ynew = x * sin + y * cos;
  x = xnew + cx;
  y = ynew + cy;
  return { x, y };
}

export const cartesianToCanvasX = function (
  x: number,
  ctx: CanvasRenderingContext2D,
  scale: number = 1
) {
  const { width } = ctx.canvas;
  return x * scale + width / 2;
};

export const cartesianToCanvasY = function (
  y: number,
  ctx: CanvasRenderingContext2D,
  scale: number = 1
) {
  const { height } = ctx.canvas;
  return height / 2 - y * scale;
};

export const cartesianToCanvasPoint = function (
  x: number,
  y: number,
  ctx: CanvasRenderingContext2D,
  scale: number = 1
) {
  return {
    x: cartesianToCanvasX(x, ctx, scale),
    y: cartesianToCanvasY(y, ctx, scale),
  };
};

export const canvasToCartesianX = function (
  x: number,
  ctx: CanvasRenderingContext2D,
  scale: number = 1
) {
  const { width } = ctx.canvas;
  return (x + width / 2) / scale;
};

export const canvasToCartesianY = function (
  y: number,
  ctx: CanvasRenderingContext2D,
  scale: number = 1
) {
  const { height } = ctx.canvas;
  return (height / 2 - y) / scale;
};

export const canvasToCartesianPoint = function (
  x: number,
  y: number,
  ctx: CanvasRenderingContext2D
) {
  return {
    x: canvasToCartesianX(x, ctx),
    y: canvasToCartesianY(y, ctx),
  };
};

export const outOfCanvas = function (
  x: number,
  y: number,
  ctx: CanvasRenderingContext2D
) {
  const { width, height } = ctx.canvas;
  return x < 0 || x > width || y < 0 || y > height;
};

export const getColorIndicesForCoord = (
  x: number,
  y: number,
  width: number
) => {
  const red = y * (width * 4) + x * 4;
  return [red, red + 1, red + 2, red + 3];
};

// export const getPixel = function (
//   x: number,
//   y: number,
//   ctx: CanvasRenderingContext2D
// ): Pixel {
//   const { width } = ctx.canvas;
//   const { data } = ctx.getImageData(0, 0, width, width);
//   const [r, g, b, a] = getColorIndicesForCoord(x, y, width);
//   return {
//     x,
//     y,
//     color: {
//       r: data[r],
//       g: data[g],
//       b: data[b],
//       a: data[a],
//     },
//   };
// };

// export const drawPixel = function (
//   pixel: Pixel,
//   ctx: CanvasRenderingContext2D
// ) {
//   const imgData = ctx.createImageData(1, 1);
//   const data = imgData.data;
//   const { x, y, color } = pixel;
//   data[0] = color.r;
//   data[1] = color.g;
//   data[2] = color.b;
//   data[3] = color.a;
//   ctx.putImageData(imgData, x, y);
// };

// export const drawPixels = function (
//   pixels: Pixel[],
//   ctx: CanvasRenderingContext2D
// ) {
//   const { width, height } = ctx.canvas;
//   const imgData = ctx.getImageData(0, 0, width, height);
//   const data = imgData.data;
//   pixels.forEach((pixel) => {
//     const { x, y, color } = pixel;
//     const [r, g, b, a] = getColorIndicesForCoord(x, y, width);
//     data[r] = color.r;
//     data[g] = color.g;
//     data[b] = color.b;
//     data[a] = color.a;
//   });
//   ctx.putImageData(imgData, 0, 0);
// };

// export const createPixelContainer = function (color: Color) {
//   const pixels: Pixel[] = [];
//   const setPixel = (x: number, y: number) => {
//     pixels.push({ x, y, color });
//   };
//   const setPixelAA = (x: number, y: number, a: number) => {
//     a = 1 - a / 255;
//     a *= 255;
//     // a = Math.round(color.a + a / 2);
//     pixels.push({ x, y, color: { ...color, a } });
//   };
//   const getPixels = function () {
//     return pixels;
//   };
//   return { getPixels, setPixel, setPixelAA };
// };

export const eqPixel = function (
  p1: Uint8ClampedArray,
  p2: Uint8ClampedArray,
  alpha = false
) {
  return (
    p1[0] == p2[0] &&
    p1[1] == p2[1] &&
    p1[2] == p2[2] &&
    (!alpha || p1[3] == p2[3])
  );
};
