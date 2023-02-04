"""A module to draw shapes."""

from turtle import RawTurtle


class Actions:
    """A class to draw shapes."""

    def __init__(self, tur: RawTurtle) -> None:
        self.tur = tur

        self.registered = {
            'cuadrado': self.square,
            'circulo': self.circle,
            # 'triangulo': self.shapes.triangle,
            'linea': self.line,
            'xy': self.move_to_xy,
            'rotar': self.rotate,
            'grilla': self.grid,
        }

    def line(self, x_pos: int, y_pos: int):
        """Draw a line from the current position to the given position."""
        self.tur.goto(x_pos, y_pos)

    def square(self, length):
        """Draw a square with the given side length."""
        for _ in range(4):
            self.tur.forward(length)
            self.tur.right(90)

    def circle(self, radius):
        """Draw a circle with the given radius."""
        prev_pos = self.tur.pos()
        self.move_to_xy(self.tur.xcor(), self.tur.ycor()-radius)
        self.tur.circle(radius)
        self.move_to_xy(*prev_pos)

    def move_to_xy(self, x_pos: float, y_pos: float):
        """Move the turtle to the given position."""
        self.tur.penup()
        self.tur.goto(x_pos, y_pos)
        self.tur.pendown()

    def rotate(self, angle: float):
        """Rotate the turtle the given angle."""
        self.tur.left(angle)

    # def triangle(self, l):
    #     for _ in range(3):
    #         tur.forward(l)
    #         tur.left(120)
    def do_fastest(self, func, *args, **kwargs):
        """Execute the given function with the fastest speed."""

        prev_color = self.tur.pencolor()
        prev_speed = self.tur.speed()
        prev_pos = self.tur.pos()
        prev_tracer = self.tur._tracer() # type: ignore pylint: disable=protected-access
        self.tur.speed("fastest")
        self.tur.color("lightgray")
        self.tur._tracer(0) # type: ignore pylint: disable=protected-access

        res = func(*args, **kwargs)

        self.move_to_xy(*prev_pos)
        self.tur.color(prev_color)
        self.tur.speed(prev_speed)
        self.tur._tracer(prev_tracer) # type: ignore pylint: disable=protected-access
        # tur.update()
        return res

    def grid(self):
        """Draw a grid."""

        self.move_to_xy(-250, 250)
        for func in [lambda y: (-250, y), lambda x: (x, 250)]:
            for _ in range(-250, 251, 10):
                self.move_to_xy(*func(_))
                if _ == 0:
                    continue
                self.tur.forward(500)
            self.tur.right(90)

        self.tur.color("gray")
        self.tur.seth(0)
        self.move_to_xy(-250, 0)
        self.tur.forward(500)
        self.tur.seth(90)
        self.move_to_xy(0, -250)
        self.tur.forward(500)
        self.tur.seth(0)
