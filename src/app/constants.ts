import { BLACK } from "./utils/colors";
import ImmutablePen from "./utils/pen";

export const SCALE = 20;
export const PEN_SCALE = 15;
export const CLEAR_COMMAND = {
  args: [],
  command: "CLEAR",
  data: new ImageData(1, 1),
  pen: new ImmutablePen({ color: BLACK }),
};
