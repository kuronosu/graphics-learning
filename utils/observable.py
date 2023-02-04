"""_summary_
"""


class Observable:
    """Observable class for the observer pattern"""

    def __init__(self) -> None:
        self._observers = []

    def _call(self):
        for observer in self._observers:
            observer(self)

    def observe(self, observer):
        """Add an observer to the observable"""
        self._observers.append(observer)
        return self


class ObservableValue(Observable):
    """Observable value class for the observer pattern"""

    def __init__(self, initial_value) -> None:
        super().__init__()
        self._value = initial_value

    def _call(self):
        for observer in self._observers:
            observer(self._value)

    @property
    def value(self):
        """Get the value of the observable"""
        return self._value

    @value.setter
    def value(self, new_value):
        """Set the value of the observable"""
        self._value = new_value
        self._call()
