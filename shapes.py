import turtle as tur
from math import sqrt, cosh, acos, degrees, radians

from movents import xy

def line(x, y):
    tur.goto(x, y)

def square(x):
    for _ in range(4):
        tur.forward(x)
        tur.right(90)

def circle(radius):
    prevPos = tur.pos()
    xy(tur.xcor(), tur.ycor()-radius)
    tur.circle(radius)
    xy(*prevPos)

def triangle(l):
    for _ in range(3):
        tur.forward(l)
        tur.left(120)
