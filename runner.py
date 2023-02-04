"""This module contains the run function that executes the code."""

from tkinter import Canvas
from turtle import RawTurtle
from typing import Any
from shapes import Actions

# allowed_functions = ['sin', 'cos', 'tan', 'exp', 'log']


def safe_eval(expr: str, allowed_functions: dict[str, Any]):
    """Evaluate the expression and raise an error if it contains any forbidden function."""
    for func in allowed_functions.keys():
        if func in expr:
            break
    else:
        raise ValueError("La expresión no contiene ninguna función permitida")
    return eval(expr, {}, allowed_functions)  # pylint: disable=eval-used


class Runner:
    """A class to run shapes."""

    def __init__(self, canvas: Canvas) -> None:
        self.actions = Actions(RawTurtle(canvas))

    def __call__(self, expr: str):
        return self.run(expr)

    def run_fastest(self, expr: str):
        """Run the code in the expression as fast as possible."""
        def _run():
            self.run(expr)

        return self.actions.do_fastest(_run)

    def run(self, expr: str):
        """Run the code in the expression."""
        try:
            # pylint: disable=eval-used
            safe_eval(expr, self.actions.registered)
            return None
        except Exception as err:  # pylint: disable=broad-except
            return err
