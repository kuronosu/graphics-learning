export interface Observable<T> {
  _call(): void | Promise<void>;
  observe(observer: (value: T) => void | Promise<void>): void;
}

export abstract class BaseObservable<T> implements Observable<T> {
  _observers: ((value: T) => void | Promise<void>)[] = [];

  abstract _call(): void;
  observe(observer: (value: T) => void | Promise<void>) {
    this._observers.push(observer);
  }
}

export class SelfObservable<
  T extends SelfObservable<T>,
> extends BaseObservable<T> {
  async _call(this: T) {
    for (const observer of this._observers) {
      await observer(this);
    }
  }
}

export class ObservableValue<T> extends BaseObservable<T> {
  private _value: T;

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
