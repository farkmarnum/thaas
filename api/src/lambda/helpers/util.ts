// Filter out null/undefined in a way that TS can infer:
export const notNullOrUndefined = <T>(x: T | undefined | null): x is T =>
  x != null;

export const noUndefinedValues = <T>(
  obj: Record<string, T | undefined>,
): Record<string, T> =>
  Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(obj).filter(([_k, v]) => v) as [string, T][],
  );
