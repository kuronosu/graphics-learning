import { SelfObservable } from "./observable";

export class HistoryManager<T> extends SelfObservable<HistoryManager<T>> {
  private _history: T[] = [];
  private _future: T[] = [];
  private _searchIdx: number = 0;
  onUndo?: (item: T) => void;
  onRedo?: (item: T) => void;

  constructor(onUndo?: (item: T) => void, onRedo?: (item: T) => void) {
    super();
    this.onUndo = onUndo;
    this.onRedo = onRedo;
  }

  get past() {
    return this._history.slice();
  }

  get future() {
    return this._future.slice();
  }

  set past(past: T[]) {
    this._history = past;
    this._call();
  }

  toString() {
    return `HistoryManager(${this._history}, ${this._future})`;
  }

  add(item: T) {
    this._history.push(item);
    this._future = [];
    this._call();
  }

  undo() {
    this._searchIdx = 0;
    if (this._history.length === 0) {
      return undefined;
    }
    const last = this._history.pop()!;
    this._future.unshift(last);
    this.onUndo?.(last);
    this._call();
    return last;
  }

  redo() {
    this._searchIdx = 0;
    if (this._future.length === 0) {
      return undefined;
    }
    const next = this._future.shift()!;
    this._history.push(next);
    this.onRedo?.(next);
    this._call();
    return next;
  }

  clear() {
    this._history = [];
    this._future = [];
    this._call();
  }

  get(idx: number) {
    return this._history[idx];
  }

  [Symbol.iterator]() {
    return this._history[Symbol.iterator]();
  }

  get search() {
    return {
      backward: () => {
        if (this._searchIdx < this.past.length) {
          this._searchIdx++;
          return this.past[this.past.length - this._searchIdx];
        }
        return undefined;
      },
      forward: () => {
        if (this._searchIdx > 0) {
          this._searchIdx--;
          return this.past[this.past.length - this._searchIdx];
        }
        return undefined;
      },
    };
  }
}
