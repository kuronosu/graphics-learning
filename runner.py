from movents import xy, rotate
from shapes import square, circle, triangle, line


def run(expr: str):
    try:
        eval(expr, {
            'cuadrado': square,
            'circulo': circle,
            'triangulo': triangle,
            'linea': line,
            'xy': xy,
            'rotar': rotate,
            }, {})
    except Exception as e:
        print(e)
