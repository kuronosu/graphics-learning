# import turtle as tur
# from movents import xy
# from runner import run


# def onKeyInput():
#     exp = tur.textinput("Shape Selection", "Enter a shape:")
#     if exp:
#         run(exp)
#     tur.listen()

# def onCircle(radius):
#     tur.circle(radius)
#     tur.listen()

import tkinter as tk
from turtle import RawTurtle
from utils.observable import Observable
from utils.history import HistoryManager
from runner import Runner


# if __name__ == "__main__":
#     tur.onkey(onKeyInput, "i")
#     grid()
#     tur.listen()
#     tur.mainloop()


class App:
    """_summary_
    """

    def __init__(self, maximized=True):
        self.root = tk.Tk()
        self.root.geometry('1080x700')
        if maximized:
            self.root.state('zoomed')

        self.history = HistoryManager()

        self.entry = tk.Entry()
        self.error_msg = Observable('')
        self.runner = Runner(self._setup())
        self.runner.run_fastest('grilla()')

    def _setup(self):
        error = tk.Label(self.root, fg='red')
        error.pack(side=tk.BOTTOM, fill=tk.X, anchor=tk.CENTER)
        self.error_msg.observe(lambda msg: error.config(text=msg))

        self.entry = tk.Entry(self.root,
                              borderwidth=8,
                              relief=tk.FLAT,
                              font=('Arial', 16, 'bold'),
                              justify=tk.CENTER)
        self.entry.pack(side=tk.BOTTOM, fill=tk.X)
        self.entry.focus_set()
        self.entry.bind('<Return>', func=self.on_command)

        frame_left = tk.Frame(self.root, bg='red', width=200)
        frame_left.pack(side=tk.LEFT, fill=tk.Y)

        frame_center = tk.Frame(self.root, bg='blue')
        frame_center.pack(side=tk.LEFT, fill=tk.BOTH, expand=tk.YES)

        frame_right = tk.Frame(self.root, bg='green',  width=200)
        frame_right.pack(side=tk.LEFT, fill=tk.Y)

        canvas = tk.Canvas(frame_center, width=600, height=600)
        canvas.place(anchor="center", relx=.5, rely=.5)

        return canvas

    def on_command(self, _: tk.Event):
        """Draws a board for the game
        """
        command = self.entry.get()
        err = self.runner(command)
        if err is None:
            self.error_msg.value = ''
            self.entry.delete(0, tk.END)
            self.history.add(command)
            print(self.history)
        else:
            self.error_msg.value = str(err)

    def run(self):
        """_summary_
        """
        self.root.mainloop()


App(False).run()
