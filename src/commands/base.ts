export class Command<T extends object> {
  data: T;
  name: string;
  fn: (data: T) => Promise<void | number[][]>;
  private _result: void | number[][] = undefined;

  constructor(name: string, fn: (data: T) => Promise<void | number[][]>, data: T) {
    this.fn = fn;
    this.name = name;
    this.data = data;
  }

  // private _

  async run() {
    if (!this._result) {
      this._result = await this.fn(this.data);
    }
    return this._result;
  }

  toString() {
    return `${this.name}(${Object.values(this.data).join(', ')})`;
  }
}
