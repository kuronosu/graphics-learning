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

  const cartesianX = x + width / 2;
  const cartesianY = height / 2 - y;

  return { x: cartesianX, y: cartesianY };
};
