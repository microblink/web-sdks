/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Deep-clones JSON-serializable values across supported browser baselines.
 */
export function deepClone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}
