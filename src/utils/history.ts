import { SelfObservable } from './observable';

export class HistoryManager<T> extends SelfObservable<HistoryManager<T>> {
  private _history: T[];
  private _future: T[];

  constructor() {
    super();
    this._history = [];
    this._future = [];
  }

  get history() {
    return this._history.slice();
  }

  get future() {
    return this._future.slice();
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
    if (this._history.length === 0) {
      return false;
    }
    this._future.unshift(this._history.pop()!);
    this._call();
    return true;
  }

  redo() {
    if (this._future.length === 0) {
      return false;
    }
    this._history.push(this._future.shift()!);
    this._call();
    return true;
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
}
