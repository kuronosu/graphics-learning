import type { Command, CommandResult, IInmutablePen, Point } from ".."
import CommandRegistry from "../command/registry"
import { CLEAR_COMMAND, SCALE } from "../constants"
import { cartesianToCanvasPoint, toRadians } from "../utils"
import { BLACK } from "../utils/colors"
import Drawer from "../utils/drawer"
import getElement from "../utils/getElement"
import HistoryManager from "../utils/history"
import ImmutablePen from "../utils/pen"

export default class CanvasController {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private readonly _history: HistoryManager<CommandResult>
  private readonly _registry: CommandRegistry

  constructor(
    selector: string,
    options?: {
      registry?: CommandRegistry
      history?: HistoryManager<CommandResult>
    }
  ) {
    this._history = options?.history ?? new HistoryManager<CommandResult>()
    this._registry = options?.registry ?? new CommandRegistry()
    this.canvas = getElement(selector)
    this.ctx = this.canvas.getContext("2d")!
    this.registerCommands()
    this.setUpUi()
  }

  get context() {
    return this.ctx
  }

  get drawer() {
    return new Drawer(
      this._history.latest?.data ??
        this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    )
  }

  get pen() {
    return this._history.latest?.pen ?? new ImmutablePen({ color: BLACK })
  }

  private setUpUi() {
    this._history.observe((h) => {
      const cmd = h.latest
      if (cmd === CLEAR_COMMAND) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        h.clear()
      } else if (cmd != null) {
        this.ctx.putImageData(cmd.data, 0, 0)
      } else {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      }
    })
  }

  private registerCommands() {
    this._registry.register("limpiar", 0, () => CLEAR_COMMAND)
    this._registry.register("rellenar", 0, this.fill)
    this._registry.register("rotar", 1, this.rotate)
    this._registry.register("adelante", 1, this.forward)
    this._registry.register("atras", 1, this.backward)
    this._registry.register("circulo", 1, this.circle)
    this._registry.register("cuadrado", 1, this.square)
    this._registry.register("linea", 2, this.line)
    this._registry.register("xy", 2, this.xy)
    this._registry.register("color", 3, this.color)
    this._registry.register("para", 3, this.for, ";")
    this._registry.register("poligono", -1, this.polygon)

    // ["arriba", [0, this.penUp, null]],
    // ["abajo", [0, this.penDown, null]],
  }

  // Commands

  // 0 param commands
  fill: Command = () => {
    const drawer = this.drawer
    const pen = this.pen
    const { x, y } = cartesianToCanvasPoint(pen.x, pen.y, this.ctx, SCALE)
    drawer.fill(x, y, pen.color)
    return {
      args: [],
      command: "rellenar",
      data: drawer.data,
      pen,
    }
  }

  // 1 param commands
  rotate: Command = (angle: number) => {
    // Rotate the pen by the given angle (in degrees) clockwise (positive) or counterclockwise (negative)
    return {
      args: [angle],
      command: "rotar",
      data: this.drawer.data,
      pen: this.pen.rotate(toRadians(angle)),
    }
  }

  private _forward(d: number, pen: IInmutablePen, drawer: Drawer) {
    const xi = pen.x
    const yi = pen.y
    const xf = xi + d * Math.cos(pen.angle)
    const yf = yi - d * Math.sin(pen.angle)

    pen = pen.move(xf, yf)
    drawer.line(
      cartesianToCanvasPoint(xi, yi, this.ctx, SCALE),
      cartesianToCanvasPoint(pen.x, pen.y, this.ctx, SCALE),
      pen.color
    )

    return { drawer, pen }
  }

  forward: Command = (d: number) => {
    if (d <= 0) throw new Error(`El valor de d debe ser mayor a 0`)
    const { drawer, pen } = this._forward(d, this.pen, this.drawer)
    return {
      pen,
      args: [d],
      command: "adelante",
      data: drawer.data,
    }
  }

  backward: Command = (d: number) => {
    if (d <= 0) throw new Error(`El valor de d debe ser mayor a 0`)
    const { drawer, pen } = this._forward(-d, this.pen, this.drawer)
    return {
      pen,
      args: [d],
      command: "atras",
      data: drawer.data,
    }
  }

  circle: Command = (r: number) => {
    const drawer = this.drawer
    const pen = this.pen
    const { x, y } = cartesianToCanvasPoint(pen.x, pen.y, this.ctx, SCALE)
    drawer.circle(x, y, r * SCALE, pen.color)
    return {
      args: [r],
      command: "circulo",
      data: drawer.data,
      pen,
    }
  }

  square: Command = (l: number) => {
    let pen = this.pen
    let drawer = this.drawer
    for (let i = 0; i < 4; i++) {
      const { pen: p, drawer: d } = this._forward(l, pen, drawer)
      pen = p
      drawer = d
      pen = pen.rotate(toRadians(90))
    }
    return {
      args: [l],
      command: "cuadrado",
      data: drawer.data,
      pen,
    }
  }

  // 2 param commands
  xy: Command = (x: number, y: number) => {
    // Move the pen to the given coordinates
    const pen = this.pen.move(x, y)
    return {
      args: [x, y],
      command: "xy",
      data: this.drawer.data,
      pen,
    }
  }

  line: Command = (x: number, y: number) => {
    let pen = this.pen
    const drawer = this.drawer
    const xi = pen.x
    const yi = pen.y
    pen = pen.move(x, y)

    drawer.line(
      cartesianToCanvasPoint(xi, yi, this.ctx, SCALE),
      cartesianToCanvasPoint(pen.x, pen.y, this.ctx, SCALE),
      pen.color
    )

    return {
      args: [x, y],
      command: "linea",
      data: drawer.data,
      pen,
    }
  }

  // 3 param commands
  color: Command = (r: number, g: number, b: number) => {
    // Change the color of the pen
    return {
      args: [r, g, b],
      command: "color",
      data: this.drawer.data,
      pen: this.pen.clone({ color: { r, g, b, a: 255 } }),
    }
  }

  /**
   * Represents a drawing command that draws a series of connected lines between given points.
   * The lines are drawn with a specified space between them and a specified step length.
   *
   * @param from - The starting distance from the current pen position (in arbitrary units).
   * @param to - The ending distance from the current pen position (in arbitrary units).
   * @param space - The space between each line segment (in arbitrary units).
   *
   * @returns An object containing information about the executed drawing command.
   */
  for: Command = (from: number, to: number, space: number) => {
    if ((from < to && space <= 0) || (from > to && space >= 0)) {
      throw new Error("Se detectó un bucle infinito")
    }

    // Capture initial pen and drawer states
    let pen = this.pen
    let drawer = this.drawer

    // Calculate the final position based on pen angle and given distances
    const finalPosition = {
      x: Math.round(pen.x + to * Math.cos(pen.angle)),
      y: Math.round(pen.y - to * Math.sin(pen.angle)),
    }

    const point = (pen: IInmutablePen, drawer: Drawer) => {
      const p = cartesianToCanvasPoint(pen.x, pen.y, this.ctx, SCALE)
      drawer.pixel(p.x, p.y, pen.color)
      drawer.pixel(p.x + 1, p.y, pen.color)
      drawer.pixel(p.x - 1, p.y, pen.color)
      drawer.pixel(p.x, p.y + 1, pen.color)
      drawer.pixel(p.x, p.y - 1, pen.color)
      drawer.pixel(p.x + 1, p.y + 1, pen.color)
      drawer.pixel(p.x - 1, p.y - 1, pen.color)
      drawer.pixel(p.x + 1, p.y - 1, pen.color)
      drawer.pixel(p.x - 1, p.y + 1, pen.color)
    }

    // Define a function to move the pen forward without drawing
    const upForward = (pen: IInmutablePen, distance: number) => {
      return pen.move(
        pen.x + distance * Math.cos(pen.angle),
        pen.y - distance * Math.sin(pen.angle)
      )
    }

    // Move the pen to the starting distance if necessary
    if (from > 0) {
      pen = upForward(pen, from)
    }

    // Calculate the remaining distance to the final position
    let restDistance = Math.hypot(
      finalPosition.x - pen.x,
      finalPosition.y - pen.y
    )
    let prevDistance = restDistance

    // Loop to draw lines with specified step and space
    while (prevDistance >= restDistance) {
      point(pen, drawer)
      pen = pen.move(
        pen.x + space * Math.cos(pen.angle),
        pen.y - space * Math.sin(pen.angle)
      )
      prevDistance = restDistance
      restDistance = Math.hypot(
        finalPosition.x - pen.x,
        finalPosition.y - pen.y
      )
    }

    // Move the pen to the final position and return the command information
    pen = pen.move(finalPosition.x, finalPosition.y)
    return {
      args: [from, to, space],
      command: "para",
      data: drawer.data,
      pen,
    }
  }

  // n param commands

  polygon: Command = (...args: number[]) => {
    if (args.length < 4) {
      throw new Error("El polígono debe tener al menos 3 puntos")
    }
    if (args.length % 2 !== 0) {
      throw new Error("El polígono debe tener un número par de parámetros")
    }

    const points: Point[] = args.reduce<Point[]>(
      (acc, _, i) => (i % 2 ? acc : [...acc, { x: args[i], y: args[i + 1] }]),
      []
    )

    let pen = this.pen
    let drawer = this.drawer
    points.unshift({
      x: pen.x,
      y: pen.y,
    })
    points.push({
      x: pen.x,
      y: pen.y,
    })

    for (let i = 0; i < points.length - 1; i++) {
      drawer.line(
        cartesianToCanvasPoint(points[i].x, points[i].y, this.ctx, SCALE),
        cartesianToCanvasPoint(
          points[i + 1].x,
          points[i + 1].y,
          this.ctx,
          SCALE
        ),
        pen.color
      )
    }

    return { args, command: "poligono", data: drawer.data, pen }
  }
}
