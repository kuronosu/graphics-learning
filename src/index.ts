import { Controller } from './controller';
import times from './utils/times';

function createLI(text: string, className?: string) {
  const $li = document.createElement('li');
  $li.innerText = text;
  if (className) {
    $li.classList.add(className);
  }
  return $li;
}

function main() {
  const $commandEntry = document.getElementById(
    'command-entry',
  ) as HTMLInputElement;
  const $historyContainer = document.getElementById(
    'history-container',
  ) as HTMLOListElement;
  const $canvas = document.getElementById('canvas') as HTMLCanvasElement;

  const drawer = new Controller($canvas.getContext('2d')!);

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
      drawer.history.undo();
    } else if (e.key === 'y' && e.ctrlKey) {
      e.preventDefault();
      drawer.history.redo();
    } else if (e.key === 'g') {
      drawer.toogleGrid();
    }
  });

  $commandEntry.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (drawer.run($commandEntry.value) == null) {
        $commandEntry.value = '';
      }
    } else if (e.key === 'ArrowUp') {
      const cmd = drawer.history.search.backward();
      $commandEntry.value = cmd ? cmd.toString() : '';
    } else if (e.key === 'ArrowDown') {
      const cmd = drawer.history.search.forward();
      $commandEntry.value = cmd ? cmd.toString() : '';
    }
  });

  drawer.run('clear()');

  drawer.run('up()');
  drawer.run('backward(70.711)');
  drawer.run('down()');
  drawer.run('left(45)');
  times(5, (i) => {
    drawer.run('forward(100)');
    i !== 4 && drawer.run('right(90)');
  });
  drawer.run('angle(0)');
  drawer.run('xy(0,0)');
}

main();
