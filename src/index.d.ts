export type Point = {
  x: number;
  y: number;
};

export type Color = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type Pixel = Point & {
  color: Color;
};

export type UndoCommand = () => void | Promise<void>;
export type RedoCommand = UndoCommand;

export type Command = (...args: number[]) => Promise<{
  data: Pixel[];
  undo?: UndoCommand;
}>;

export type CommandResult = {
  command: string;
  args: number[];
  result: {
    data: Pixel[];
    undo?: UndoCommand;
    redo?: RedoCommand;
  };
};
