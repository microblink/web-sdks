/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Gets the key associated with the highest numeric value in an object.
 * Throws an error if the object is empty.
 *
 * @template TObj - Type of the object, must be a record with string keys and number values.
 * @param obj - The object to search through.
 * @returns The key associated with the highest value.
 * @throws {Error} When the input object is empty.
 */
export function getKeyWithHighestValue<TObj extends Record<string, number>>(
  obj: TObj,
): keyof TObj {
  const keys = Object.keys(obj);

  if (keys.length === 0) {
    throw new Error("No members in object!");
  }
  // set default
  let maxKey = keys[0];
  let maxValue = -Infinity;

  for (const [key, value] of Object.entries(obj)) {
    if (value > maxValue) {
      maxValue = value;
      maxKey = key;
    }
  }

  return maxKey;
}
