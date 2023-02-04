"""Main module for the application"""

import tkinter as tk
from utils.observable import ObservableValue
from utils.history import HistoryManager
from runner import Runner


class App:
    """Main class for the application"""

    def __init__(self, maximized=True, grid=True):
        self.root = tk.Tk()
        self.root.geometry('1080x700')
        self.show_grid = grid
        if maximized:
            self.root.state('zoomed')

        self.entry = tk.Entry()
        self.history_idx = 0
        self.error_msg = ObservableValue('')
        self.runner = Runner()
        self._setup()
        if self.show_grid:
            self.runner.run_fastest('grilla()', False)

        self.runner('linea(100, 100)')
        self.runner('linea(200, -200)')

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

        self.entry.bind('<Up>', func=self.on_history_up)
        self.entry.bind('<Down>', func=self.on_history_down)

        frame_left = tk.Frame(self.root, bg='red', width=200)
        frame_left.pack(side=tk.LEFT, fill=tk.Y)

        frame_center = tk.Frame(self.root, bg='blue')
        frame_center.pack(side=tk.LEFT, fill=tk.BOTH, expand=tk.YES)

        frame_right = tk.Frame(self.root, bg='green',  width=200)
        frame_right.pack(side=tk.LEFT, fill=tk.Y)
        frame_right.pack_propagate(False)
        history_text = tk.Text(frame_right, bg='white',
                               fg='black', wrap=tk.WORD,
                               state='disabled',
                               )
        history_text.tag_configure('h', justify='center', foreground="green")
        history_text.tag_configure('f', justify='center', foreground="red")
        history_text.pack(expand=tk.YES, fill=tk.BOTH)

        self.root.bind('<Control-z>',
                       func=lambda _: self.runner.undo())
        self.root.bind('<Control-y>',
                       func=lambda _: self.runner.redo())

        def _observe_history(manager: HistoryManager):
            self.history_idx = len(manager.history)
            history_text.config(state='normal')
            history_text.delete(1.0, tk.END)
            for command in manager.history:
                history_text.insert(tk.END, f'{command}\n', 'h')
            for command in manager.future:
                history_text.insert(tk.END, f'{command}\n', 'f')
            history_text.config(state='disabled')

        self.runner.manager.observe(_observe_history)
        # self.history.observe(print)

        canvas = tk.Canvas(frame_center, width=600, height=600)
        canvas.place(anchor="center", relx=.5, rely=.5)

        self.runner.set_canvas(canvas)

        self.root.bind('<F5>', func=lambda _: self.toggle_grid())

    def on_command(self, _: tk.Event):
        """Draws a board for the game
        """
        command = self.entry.get()
        err = self.runner(command)
        if err is None:
            self.error_msg.value = ''
            self.entry.delete(0, tk.END)
        else:
            self.error_msg.value = str(err)

    def _set_entry_from_history(self):
        try:
            cmd = self.runner.manager[self.history_idx]
            self.entry.delete(0, tk.END)
            self.entry.insert(0, cmd)
        except IndexError:
            pass

    def on_history_down(self, _: tk.Event):
        """Moves the history index down"""
        self.history_idx += 1
        if self.history_idx < 0 or self.history_idx >= len(self.runner.manager.history):
            if self.history_idx >= len(self.runner.manager.history):
                self.history_idx = len(self.runner.manager.history)
            self.entry.delete(0, tk.END)
            return
        self._set_entry_from_history()

    def on_history_up(self, _: tk.Event):
        """Moves the history index up"""
        if self.history_idx <= 0 or self.history_idx > len(self.runner.manager.history):
            return
        self.history_idx -= 1
        self._set_entry_from_history()

    def run(self):
        """Runs the application"""
        self.root.mainloop()

    def toggle_grid(self):
        """Toggles the grid"""
        if self.show_grid:
            self.runner.actions.clear()
        else:
            self.runner.run_fastest('grilla()', False)
        self.runner.run_fastest('xy(0, 0)', False)
        for cmd in self.runner.manager:
            self.runner.run_fastest(cmd, False)
        self.show_grid = not self.show_grid


if __name__ == "__main__":
    App(False).run()
