import turtle as tur
from movents import xy
from runner import run


def onKeyInput():
    exp = tur.textinput("Shape Selection", "Enter a shape:")
    if exp:
        run(exp)
    tur.listen()  

def onCircle(radius):
    tur.circle(radius)
    tur.listen()

def grid():
    prevColor = tur.pencolor()
    prevSpeed = tur.speed()
    prevPos = tur.pos()
    prevTracer = tur.tracer()
    print(prevTracer)
    tur.speed("fastest")
    tur.color("lightgray")
    tur.tracer(0)
    xy(-250, 250)
    for fn in [lambda y: (-250, y), lambda x: (x, 250)]:
        for _ in range(-250, 251, 10):
            xy(*fn(_))
            if _ == 0:
                continue
            tur.forward(500)
        tur.right(90)
    
    tur.color("gray")
    tur.seth(0)
    xy(-250, 0)
    tur.forward(500)
    tur.seth(90)
    xy(0, -250)
    tur.forward(500)
    tur.seth(0)
    
    xy(*prevPos)
    tur.color(prevColor)
    tur.speed(prevSpeed)
    tur.tracer(prevTracer)
    tur.update()

if __name__ == "__main__":
    tur.onkey(onKeyInput, "i")
    grid()
    tur.listen()
    tur.mainloop()
