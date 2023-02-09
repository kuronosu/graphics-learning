export default function times(n: number, fn: (i: number) => void) {
  for (let i = 0; i < n; i++) {
    fn(i);
  }
}
