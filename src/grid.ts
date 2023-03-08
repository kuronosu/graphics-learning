
function draw(ctx: CanvasRenderingContext2D) {
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

export default function setupGrid(canvas: HTMLCanvasElement) {
  let isShowing = true
  const ctx = canvas.getContext('2d')!
  draw(ctx)

  window.addEventListener('keydown', (e) => {
    if (e.key === 'g') {
      if (isShowing) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      } else {
        draw(ctx)
      }
      isShowing = !isShowing
    }
  })
}
