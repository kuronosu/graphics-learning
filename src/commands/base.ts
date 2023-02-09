export class Command<T extends object> {
  data: T;
  name: string;
  fn: (data: T) => Promise<void>;

  constructor(name: string, fn: (data: T) => Promise<void>, data: T) {
    this.fn = fn;
    this.name = name;
    this.data = data;
  }

  async run() {
    return await this.fn(this.data);
  }

  toString() {
    return `${this.name}(${Object.values(this.data).join(', ')})`;
  }
}
