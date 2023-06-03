import turtle as tur

MULTIPLICADOR = 10


# limpiar() # not yet
# arriba() # not yet
# abajo() # not yet
# relleno() # not yet
# rotar(n) # done
# circulo(n) # done
# adelante(n) # done
# atras(n) # done
# cuadrado(n) # done
# xy(n, n) # done
# color(n, n, n) # done
# para(n; n; n) # not yet
# poligono(n, n, n, n) # done


def xy(x, y):
    tur.penup()
    tur.goto(x * MULTIPLICADOR, y * MULTIPLICADOR)
    tur.pendown()


def rotar(angulo):
    tur.left(angulo)


def circulo(radio):
    x = tur.xcor() / MULTIPLICADOR
    y = tur.ycor() / MULTIPLICADOR
    angle = tur.heading()
    tur.setheading(0)
    xy(x, y - radio)
    tur.circle(radio * MULTIPLICADOR)
    tur.setheading(angle)
    xy(x, y)


def adelante(distancia):
    tur.forward(distancia * MULTIPLICADOR)


def atras(distancia):
    tur.back(distancia * MULTIPLICADOR)


def cuadrado(lado):
    for _ in range(4):
        adelante(lado)
        tur.right(90)


def color(r, g, b):
    tur.color((r, g, b))


def poligono(*puntos):
    if len(puntos) < 4:
        raise Exception("El polígono debe tener al menos 3 puntos")

    if len(puntos) % 2 != 0:
        raise Exception("Debes enviar un número par de parámetros")

    x = tur.xcor()
    y = tur.ycor()
    for i in range(0, len(puntos), 2):
        tur.goto(puntos[i] * MULTIPLICADOR, puntos[i + 1] * MULTIPLICADOR)
    tur.goto(x, y)


if __name__ == "__main__":
    # Configuracion inicial de turtle
    tur.degrees()
    tur.colormode(255)
    tur.setup(600, 600)
    tur.width(3)
    # Esto es para evitar la animacion
    tur.speed("fast")
    # tur.tracer(0, 0)

    xy(-10, 10)
    adelante(10)
    rotar(-90)
    adelante(10)
    rotar(-90)
    adelante(10)
    rotar(-90)
    adelante(10)
    rotar(-90)
    xy(0, 0)
    color(255, 0, 0)
    circulo(25.5)
    color(0, 0, 255)
    rotar(45)
    cuadrado(10)
    rotar(180)
    # para(5; 20; 1)
    xy(-2, 2)
    color(0, 255, 0)
    poligono(5, 2, -4, -3)
    color(25, 229, 230)
    # relleno()

    # tur.update()
    tur.done()
