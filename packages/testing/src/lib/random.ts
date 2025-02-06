

export function randomInt() {
  const value = Math.random().toString(10).substring(2, 15);

  return parseInt(value, 10);
}
