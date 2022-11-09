export type Dictionary<T> = Record<string, T>;

export function isNumber(i: unknown): i is number {
  return typeof i === "number";
}

export function isBoolean(i: unknown): i is boolean {
  return typeof i === "boolean";
}

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};
