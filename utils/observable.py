"""_summary_
"""


class Observable:
    """_summary_
    """

    def __init__(self, initial_value) -> None:
        self._value = initial_value
        self._observers = []

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

    def observe(self, observer):
        """Add an observer to the observable"""
        self._observers.append(observer)
        return self
