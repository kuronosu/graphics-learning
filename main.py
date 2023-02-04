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

# def grid():
#     prevColor = tur.pencolor()
#     prevSpeed = tur.speed()
#     prevPos = tur.pos()
#     prevTracer = tur.tracer()
#     print(prevTracer)
#     tur.speed("fastest")
#     tur.color("lightgray")
#     tur.tracer(0)
#     xy(-250, 250)
#     for fn in [lambda y: (-250, y), lambda x: (x, 250)]:
#         for _ in range(-250, 251, 10):
#             xy(*fn(_))
#             if _ == 0:
#                 continue
#             tur.forward(500)
#         tur.right(90)

#     tur.color("gray")
#     tur.seth(0)
#     xy(-250, 0)
#     tur.forward(500)
#     tur.seth(90)
#     xy(0, -250)
#     tur.forward(500)
#     tur.seth(0)

#     xy(*prevPos)
#     tur.color(prevColor)
#     tur.speed(prevSpeed)
#     tur.tracer(prevTracer)
#     tur.update()

# if __name__ == "__main__":
#     tur.onkey(onKeyInput, "i")
#     grid()
#     tur.listen()
#     tur.mainloop()

import tkinter as tk
import turtle

from utils.observable import Observable


class App:
    """_summary_
    """

    def __init__(self, maximized=True):
        self.cur = None
        self.root = tk.Tk()
        self.root.geometry('1080x700')
        if maximized:
            self.root.state('zoomed')

        error = tk.Label(self.root, fg='red')
        error.pack(side=tk.BOTTOM, fill=tk.X, anchor=tk.CENTER)
        self.error_msg = Observable('')\
            .observe(lambda msg: error.config(text=msg))

        self.entry = tk.Entry(self.root,
                              borderwidth=8,
                              relief=tk.FLAT,
                              font=('Arial', 16, 'bold'),
                              justify=tk.CENTER)
        self.entry.pack(side=tk.BOTTOM, fill=tk.X)
        self.entry.focus_set()
        self.entry.bind('<Return>', func=self.callback)

        frame_left = tk.Frame(self.root, bg='red', width=200)
        frame_left.pack(side=tk.LEFT, fill=tk.Y)

        frame_center = tk.Frame(self.root, bg='blue')
        frame_center.pack(side=tk.LEFT, fill=tk.BOTH, expand=tk.YES)

        frame_right = tk.Frame(self.root, bg='green',  width=200)
        frame_right.pack(side=tk.LEFT, fill=tk.Y)

        self.canvas = tk.Canvas(frame_center, width=600, height=600)
        self.canvas.place(anchor="center", relx=.5, rely=.5)
        self.cur = turtle.RawTurtle(self.canvas)

    def callback(self, _: tk.Event):
        """Draws a board for the game
        """
        self.error_msg.value = self.entry.get()
        self.entry.delete(0, tk.END)

    def run(self):
        """_summary_
        """
        self.root.mainloop()


App(False).run()
