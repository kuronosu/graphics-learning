"""A module to manage the history of the user's input."""


class HistoryManager:
    """A class to manage the history of the user's input."""

    def __init__(self) -> None:
        self._history = []
        self._future = []

    def __str__(self) -> str:
        return f"HistoryManager({self._history}, {self._future})"

    def add(self, item):
        """Add an item to the history."""
        self._history.append(item)
        self._future = []

    def undo(self):
        """Undo the last action."""
        if not self._history:
            return
        self._future.append(self._history.pop())

    def redo(self):
        """Redo the last action."""
        if not self._future:
            return
        self._history.append(self._future.pop())

    def clear(self):
        """Clear the history."""
        self._history = []
        self._future = []

    def __iter__(self):
        return iter(self._history)
