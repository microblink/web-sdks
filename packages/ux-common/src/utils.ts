/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Calculates the average of an array of numbers.
 *
 * @param arr - The array of numbers.
 * @returns The average of the array.
 */
export function getAverage(arr: number[]) {
  return arr.reduce((p, c) => p + c, 0) / arr.length;
}

/**
 * Converts an unknown value to an Error object.
 *
 * @param thrown - The value to convert.
 * @returns The Error object.
 */
export const asError = (thrown: unknown): Error => {
  if (thrown instanceof Error) return thrown;
  try {
    return new Error(JSON.stringify(thrown));
  } catch {
    // fallback in case there's an error stringifying.
    // for example, due to circular references.
    return new Error(String(thrown));
  }
};

/**
 * Sleeps for a given number of milliseconds.
 *
 * @param ms - The number of milliseconds to sleep.
 * @returns A promise that resolves after the given number of milliseconds.
 */
export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safely invokes every callback in `callbacks` with `data`, catching and
 * logging any individual callback errors so one bad handler cannot prevent
 * the rest from running.
 *
 * @param callbacks - The set of callbacks to invoke.
 * @param data - The argument forwarded to each callback.
 * @param name - A human-readable label used in the error log (e.g. `"onResult"`).
 */
export function invokeCallbacks<T>(
  callbacks: Set<(data: T) => void>,
  data: T,
  name: string,
): void {
  for (const callback of callbacks) {
    try {
      callback(data);
    } catch (e) {
      console.error(`Error in ${name} callback`, e);
    }
  }
}
