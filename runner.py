"""This module contains the run function that executes the code."""

from tkinter import Canvas
from turtle import RawTurtle
from typing import Any, Optional
from shapes import Actions
from utils.history import HistoryManager


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

    def __init__(self, canvas: Optional[Canvas] = None) -> None:
        self.actions = Actions(
            RawTurtle(canvas if canvas else Canvas(), shape="turtle"))
        self.manager = HistoryManager()

    def set_canvas(self, canvas: Canvas):
        """Set the canvas to draw on."""
        self.actions = Actions(RawTurtle(canvas, shape="turtle"))

    def __call__(self, expr: str):
        return self.run(expr)

    def run_fastest(self, expr: str, add_to_history: bool = True):
        """Run the code in the expression as fast as possible."""
        def _run():
            self.run(expr, add_to_history)

        return self.actions.do_fastest(_run)

    def run(self, expr: str, add_to_history: bool = True):
        """Run the code in the expression."""
        try:
            safe_eval(expr, self.actions.registered)
            if add_to_history:
                self.manager.add(expr)
            return None
        except Exception as err:  # pylint: disable=broad-except
            return err

    def undo(self):
        """Undo the last action."""
        if self.manager.undo():
            self._redraw()

    def redo(self):
        """Redo the last action."""
        if self.manager.redo():
            self._redraw()

    def _redraw(self):
        """Called when the history changes."""
        self.actions.clear()
        self.run_fastest('grilla()', False)
        self.run_fastest('xy(0, 0)', False)
        for cmd in self.manager.history:
            self.run_fastest(cmd, False)
