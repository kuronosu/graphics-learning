import math
import turtle as tur

MULTIPLICADOR = 20

# Cannot be implemented
# rellenar
# Make no sense implement
# limpiar


def xy(x, y):
    tur.penup()
    tur.goto(x * MULTIPLICADOR, y * MULTIPLICADOR)
    tur.pendown()


def linea(x, y):
    tur.goto(x * MULTIPLICADOR, y * MULTIPLICADOR)


def rotar(angulo):
    tur.right(angulo)


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


def para(inicio, fin, paso):
    if (inicio < fin and paso <= 0) or (inicio > fin and paso >= 0):
        raise Exception("Se detectó un bucle infinito")
    angle = math.radians(-tur.heading())
    finalPosition = (
        (tur.pos()[0] + fin * math.cos(angle)) * MULTIPLICADOR,
        (tur.pos()[1] - fin * math.sin(angle)) * MULTIPLICADOR,
    )
    tur.penup()
    tur.forward(inicio * MULTIPLICADOR)
    restDistance = math.hypot(
        (finalPosition[0] - tur.pos()[0]) * MULTIPLICADOR,
        (finalPosition[1] - tur.pos()[1]) * MULTIPLICADOR,
    )
    prevDistance = restDistance
    while prevDistance >= restDistance:
        tur.dot(4, *map(int, tur.pencolor()))
        tur.goto(
            tur.pos()[0] + paso * math.cos(angle) * MULTIPLICADOR,
            tur.pos()[1] - paso * math.sin(angle) * MULTIPLICADOR,
        )
        prevDistance = restDistance
        restDistance = math.hypot(
            (finalPosition[0] - tur.pos()[0]) * MULTIPLICADOR,
            (finalPosition[1] - tur.pos()[1]) * MULTIPLICADOR,
        )
    tur.pendown()


def rellenar():
    print("No se puede implementar de igual forma en turtle")


if __name__ == "__main__":
    # Configuracion inicial de turtle
    tur.color((0, 0, 0))
    tur.degrees()
    tur.colormode(255)
    tur.setup(30 * MULTIPLICADOR, 30 * MULTIPLICADOR)
    tur.pensize(3)
    tur.speed("fastest")

    # Dibujar

    xy(-5, 5)
    adelante(5)
    rotar(90)
    adelante(5)
    rotar(90)
    adelante(5)
    rotar(90)
    adelante(5)
    rotar(90)
    xy(0, 0)
    color(255, 0, 0)
    circulo(12.75)
    color(0, 0, 255)
    rotar(-45)
    cuadrado(5)
    rotar(-180)
    para(2.5, 10, 0.5)
    xy(-1, 1)
    color(0, 255, 0)
    poligono(2.5, 1, -2, -1.5)
    color(25, 229, 230)
    rotar(-50)
    linea(0, -9)
    xy(5, 0.5)
    color(255, 255, 0)
    xy(-6, 5)
    color(215, 224, 206)

    tur.mainloop()
