export function arrRemove<T>(arr: T[], item: T): boolean {
  const idx = arr.indexOf(item);
  if (idx > -1) {
    arr.splice(idx, 1);
    return true;
  }
  return false;
}

export function last<T>(arr: T[]): T | undefined {
  return arr[arr.length];
}
