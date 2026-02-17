/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked.
 *
 * @param func - The function to debounce.
 * @param wait - The number of milliseconds to delay.
 * @returns The new debounced function.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const debounced = function (
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = undefined;
      func.apply(context, args);
    }, wait);
  };

  debounced.cancel = () => {
    clearTimeout(timeout);
    timeout = undefined;
  };

  return debounced;
}
