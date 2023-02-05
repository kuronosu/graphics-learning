"""A module to manage the history of the user's input."""

from utils.observable import Observable


class HistoryManager(Observable):
    """A class to manage the history of the user's input."""

    def __init__(self) -> None:
        super().__init__()
        self._history = []
        self._future = []

    def __str__(self) -> str:
        return f"HistoryManager({self._history}, {self._future})"

    @property
    def history(self):
        """Get the history."""
        return list(self._history)

    @property
    def future(self):
        """Get the future."""
        return list(self._future)

    def add(self, item):
        """Add an item to the history."""
        self._history.append(item)
        self._future = []
        self._call()

    def undo(self):
        """Undo the last action."""
        if not self._history:
            return False
        self._future.insert(0, self._history.pop())
        self._call()
        return True

    def redo(self):
        """Redo the last action."""
        if not self._future:
            return False
        self._history.append(self._future.pop(0))
        self._call()
        return True

    def clear(self):
        """Clear the history."""
        self._history = []
        self._future = []
        self._call()

    def __iter__(self):
        return iter(self._history)

    def __getitem__(self, item):
        return self._history[item]
