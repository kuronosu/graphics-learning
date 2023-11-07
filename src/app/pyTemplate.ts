const codeTemplate = `import math
import turtle as tur

MULTIPLICADOR = 20

def xy(x, y):
\ttur.penup()
\ttur.goto(x * MULTIPLICADOR, y * MULTIPLICADOR)
\ttur.pendown()


def linea(x, y):
\ttur.goto(x * MULTIPLICADOR, y * MULTIPLICADOR)


def rotar(angulo):
\ttur.right(angulo)


def circulo(radio):
\tx = tur.xcor() / MULTIPLICADOR
\ty = tur.ycor() / MULTIPLICADOR
\tangle = tur.heading()
\ttur.setheading(0)
\txy(x, y - radio)
\ttur.circle(radio * MULTIPLICADOR)
\ttur.setheading(angle)
\txy(x, y)


def adelante(distancia):
\ttur.forward(distancia * MULTIPLICADOR)


def atras(distancia):
\ttur.back(distancia * MULTIPLICADOR)


def cuadrado(lado):
\tfor _ in range(4):
\t\tadelante(lado)
\t\ttur.right(90)


def color(r, g, b):
\ttur.color((r, g, b))


def poligono(*puntos):
\tif len(puntos) < 4:
\t\traise Exception("El polígono debe tener al menos 3 puntos")
\tif len(puntos) % 2 != 0:
\t\traise Exception("Debes enviar un número par de parámetros")
\tx = tur.xcor()
\ty = tur.ycor()
\tfor i in range(0, len(puntos), 2):
\t\ttur.goto(puntos[i] * MULTIPLICADOR, puntos[i + 1] * MULTIPLICADOR)
\ttur.goto(x, y)


def para(inicio, fin, paso):
\tif (inicio < fin and paso <= 0) or (inicio > fin and paso >= 0):
\t\traise Exception("Se detectó un bucle infinito")
\tangle = math.radians(-tur.heading())
\tfinalPosition = (
\t\t(tur.pos()[0] + fin * math.cos(angle)) * MULTIPLICADOR,
\t\t(tur.pos()[1] - fin * math.sin(angle)) * MULTIPLICADOR,
\t)


\ttur.penup()
\ttur.forward(inicio * MULTIPLICADOR)
\trestDistance = math.hypot(
\t\t(finalPosition[0] - tur.pos()[0]) * MULTIPLICADOR,
\t\t(finalPosition[1] - tur.pos()[1]) * MULTIPLICADOR,
\t)
\tprevDistance = restDistance
\twhile prevDistance >= restDistance:
\t\ttur.dot(4, *map(int, tur.pencolor()))
\t\ttur.goto(
\t\t\ttur.pos()[0] + paso * math.cos(angle) * MULTIPLICADOR,
\t\t\ttur.pos()[1] - paso * math.sin(angle) * MULTIPLICADOR,
\t\t)
\t\tprevDistance = restDistance
\t\trestDistance = math.hypot(
\t\t\t(finalPosition[0] - tur.pos()[0]) * MULTIPLICADOR,
\t\t\t(finalPosition[1] - tur.pos()[1]) * MULTIPLICADOR,
\t\t)
\ttur.pendown()


def rellenar():
\tprint("No se puede implementar de igual forma en turtle")


if __name__ == "__main__":
\t# Configuracion inicial de turtle
\ttur.color((0, 0, 0))
\ttur.degrees()
\ttur.colormode(255)
\ttur.setup(30 * MULTIPLICADOR, 30 * MULTIPLICADOR)
\ttur.pensize(3)
\ttur.speed("fastest")

\t# Dibujar
\t{code}

\ttur.mainloop()
`

export function getPythonCode(code: string[]) {
  return codeTemplate.replace("{code}", code.join("\n\t"))
}
