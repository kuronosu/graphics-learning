import { getCanvasCartesianPoint, toRadians } from './common';

const _shapes = Object.freeze({
  triangle: [
    [0, 5],
    [0, -5],
    [15, 0],
  ],
  square: [
    [10, -10],
    [10, 10],
    [-10, 10],
    [-10, -10],
  ],
});

const _DEFAULT_SHAPE: keyof typeof _shapes = 'triangle';

export default class Pen {
  private _angle: number;
  private _isDown: boolean;
  private _isVisible: boolean;
  private _position: { x: number; y: number };
  shape: keyof typeof _shapes;

  constructor() {
    this._angle = 0;
    this._isDown = true;
    this._isVisible = true;
    this._position = { x: 0, y: 0 };
    this.shape = _DEFAULT_SHAPE;
  }

  get angle() {
    return this._angle;
  }

  set angle(angle: number) {
    this._angle = toRadians(angle);
  }

  get isDown() {
    return this._isDown;
  }

  get isVisible() {
    return this._isVisible;
  }

  get position() {
    return this._position;
  }

  up() {
    this._isDown = false;
  }

  down() {
    this._isDown = true;
  }

  move(x: number, y: number) {
    this._position = { x, y };
  }

  show() {
    this._isVisible = true;
  }

  hide() {
    this._isVisible = false;
  }

  reset() {
    this._angle = 0;
    this._isDown = true;
    this._isVisible = true;
    this._position = { x: 0, y: 0 };
    this.shape = _DEFAULT_SHAPE;
  }

  rotate(angle: number) {
    this._angle += toRadians(angle);
  }

  get rotation() {
    return {
      angle: this.angle,
      x: this.position.x,
      y: this.position.y,
    };
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this._isVisible) {
      ctx.beginPath();
      ctx.save();
      const shape =
        _shapes[
          _shapes.hasOwnProperty(this.shape) ? this.shape : _DEFAULT_SHAPE
        ];

      const { x: cx, y: cy } = getCanvasCartesianPoint(
        this.position.x + shape[0][0],
        this.position.y + shape[0][1],
        ctx,
        this.rotation,
      );

      if (shape.length > 0) ctx.moveTo(cx, cy);
      for (const [_cx, _cy] of shape.slice(1)) {
        const { x: cx, y: cy } = getCanvasCartesianPoint(
          this.position.x + _cx,
          this.position.y + _cy,
          ctx,
          this.rotation,
        );
        ctx.lineTo(cx, cy);
      }

      ctx.fillStyle = 'green';
      ctx.fill();
      this.sync(ctx);
      ctx.restore();
      ctx.closePath();
    }
  }

  sync(ctx: CanvasRenderingContext2D) {
    const { x, y } = getCanvasCartesianPoint(
      this._position.x,
      this._position.y,
      ctx,
      this.rotation,
    );
    ctx.moveTo(x, y);
  }
}
