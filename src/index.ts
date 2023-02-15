import { Controller } from './controller';

function createLI(text: string, className?: string) {
  const $li = document.createElement('li');
  $li.innerText = text;
  if (className) {
    $li.classList.add(className);
  }
  return $li;
}

function grid(ctx: CanvasRenderingContext2D) {
  const { width, height } = ctx.canvas;
  const x = width / 2;
  const y = height / 2;

  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  for (let i = 0; i < width; i += 10) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
  }
  for (let i = 0; i < height; i += 10) {
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
  }
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.moveTo(x, 0);
  ctx.lineTo(x, height);
  ctx.stroke();
  ctx.restore();
  ctx.closePath();
}

function main() {
  const $commandEntry = document.getElementById(
    'command-entry',
  ) as HTMLInputElement;
  const $historyContainer = document.getElementById(
    'history-container',
  ) as HTMLOListElement;
  const $canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const $canvasGrid = document.getElementById('grid') as HTMLCanvasElement;
  grid($canvasGrid.getContext('2d')!);

  const drawer = new Controller(
    $canvas.getContext('2d', {
      willReadFrequently: true,
    })!,
  );

  drawer.history.observe((history) => {
    $historyContainer.innerHTML = '';
    $historyContainer.appendChild(createLI('Inicio'));
    for (const command of history.past) {
      $historyContainer.appendChild(createLI(command.toString()));
    }
    $historyContainer.appendChild(createLI('Fin'));
    for (const command of history.future) {
      $historyContainer.appendChild(createLI(command.toString(), 'future'));
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'z' && e.ctrlKey) {
      e.preventDefault();
      if (!$commandEntry.disabled) {
        drawer.undo();
      }
    } else if (e.key === 'y' && e.ctrlKey) {
      e.preventDefault();
      if (!$commandEntry.disabled) {
        drawer.redo();
      }
    } else if (e.key === 'g') {
      $canvasGrid.classList.toggle('hidden');
    }
  });

  drawer.isDrawing.observe((isDrawing) => {
    $commandEntry.disabled = isDrawing;
    if (!isDrawing) $commandEntry.focus();
  });

  $commandEntry.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      try {
        drawer.parseCommand($commandEntry.value);
        $commandEntry.value = '';
      } catch (err) {
        alert(err);
      }
    } else if (e.key === 'ArrowUp') {
      const cmd = drawer.history.search.backward();
      $commandEntry.value = cmd ? cmd.toString() : '';
    } else if (e.key === 'ArrowDown') {
      const cmd = drawer.history.search.forward();
      $commandEntry.value = cmd ? cmd.toString() : '';
    }
  });

  drawer.parseCommand('limpiar()');

  const example = `
  color(255, 0, 0)
  arriba()
  atras(70.711)
  abajo()
  rotar(45)
  adelante(100)
  rotar(-90)
  adelante(100)
  rotar(-90)
  adelante(150)
  rotar(-90)
  adelante(200)
  rotar(-90)
  adelante(100)
  rotar(-90)
  adelante(100)

  rotar(45)
  xy(0,0)
  color(0, 0, 0)
  `;
  //   const example = `
  // color(0, 0, 0)
  // xy(-299, 299)
  // adelante(598)
  // rotar(-90)
  // adelante(598)
  // rotar(-90)
  // adelante(598)
  // rotar(-90)
  // adelante(598)
  // rotar(-90)
  // xy(0, 0)
  // relleno()
  // color(255, 255, 255)
  // adelante(300)
  // `

  const commands = example.split('\n').filter((c) => c.trim() !== '');

  drawer.redraw = false;
  let i = commands.length;
  for (const command of commands) {
    if (i == 1) {
      drawer.redraw = true;
    }
    drawer.parseCommand(command);
    i--;
  }
}

main();
