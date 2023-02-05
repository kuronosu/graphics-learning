export interface Observable<T> {
  _call(): void;
  observe(observer: (value: T) => void): void;
}

export abstract class BaseObservable<T> implements Observable<T> {
  _observers: ((value: T) => void)[] = [];

  abstract _call(): void;
  observe(observer: (value: T) => void) {
    this._observers.push(observer);
  }
}

export class SelfObservable<
  T extends SelfObservable<T>,
> extends BaseObservable<T> {
  _call(this: T) {
    this._observers.forEach((observer) => observer(this as T));
  }
}

export class ObservableValue<T> extends BaseObservable<T> {
  _value: T;

  constructor(initialValue: T) {
    super();
    this._value = initialValue;
  }

  _call() {
    this._observers.forEach((observer) => observer(this._value));
  }

  get value() {
    return this._value;
  }

  set value(newValue) {
    this._value = newValue;
    this._call();
  }
}
