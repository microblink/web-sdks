/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Converts an unknown value to an error.
 *
 * @param thrown - The value to convert to an error.
 * @returns The error.
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

export function isIOS(): boolean {
  const userAgent = self.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}
