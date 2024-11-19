export function getTwoRandomNumbers(max: number) {
  const red = Math.floor(Math.random() * max) + 1;
  let blue;
  do {
    blue = Math.floor(Math.random() * max) + 1;
  } while (blue === red);
  return [red, blue] as const;
}
