export class Command<T extends object> {
  data: T;
  name: string;
  fn: (data: T) => void;

  constructor(name: string, fn: (data: T) => void, data: T) {
    this.fn = fn;
    this.name = name;
    this.data = data;
  }

  run() {
    this.fn(this.data);
  }

  toString() {
    return `${this.name}(${Object.values(this.data).join(', ')})`;
  }
}
