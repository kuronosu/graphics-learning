import { Drawer } from './draw';

function main() {
  const $commandEntry = document.getElementById(
    'command-entry',
  ) as HTMLInputElement;
  const $historyContainer = document.getElementById(
    'history-container',
  ) as HTMLOListElement;
  const $canvas = document.getElementById('canvas') as HTMLCanvasElement;

  const drawer = new Drawer($canvas.getContext('2d')!);
  drawer.xy(-70.711, 0);
  drawer.left(45);
  drawer.forward(100);
  drawer.right(90);
  drawer.forward(100);
  drawer.right(90);
  drawer.forward(100);
  drawer.right(90);
  drawer.forward(100);
  drawer.angle(0);
  drawer.forward(70.711);
}

main();
