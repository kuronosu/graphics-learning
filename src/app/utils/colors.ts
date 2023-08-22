import type { Color } from "..";

class ColorArray extends Array<Color> {
  getRandom() {
    return this[Math.floor(Math.random() * this.length)];
  }
}

export const BLACK: Color = { r: 0, g: 0, b: 0, a: 255 };
export const RED: Color = { r: 255, g: 0, b: 0, a: 255 };
export const BLUE: Color = { r: 0, g: 0, b: 255, a: 255 };
export const GREEN: Color = { r: 0, g: 255, b: 0, a: 255 };

export const PREDEFINED_COLORS = new ColorArray(RED, GREEN, BLUE);

export function checkColor(color: Color) {
  if (color.r < 0 || color.r > 255) {
    throw new Error(`El valor de rojo debe estar entre 0 y 255`);
  }
  if (color.g < 0 || color.g > 255) {
    throw new Error(`El valor de verde debe estar entre 0 y 255`);
  }
  if (color.b < 0 || color.b > 255) {
    throw new Error(`El valor de azul debe estar entre 0 y 255`);
  }
  if (color.a < 0 || color.a > 255) {
    throw new Error(`El valor de alpha debe estar entre 0 y 255`);
  }
  return color;
}
