/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { nanoid } from "nanoid";

/**
 * Gets the user id from local storage, or generates a new one.
 *
 * This is a workaround for the lack of a user id in the worker scope.
 *
 * @param storageKey - The localStorage key to use for persisting the user id.
 * @returns a unique user id
 */
export function getUserId(storageKey: string): string {
  // Users can block localStorage or other storage mechanisms
  const hasLocalStorage = testLocalStorage();

  if (!hasLocalStorage) {
    return nanoid();
  }

  const previousId = localStorage.getItem(storageKey);
  if (previousId) {
    return previousId;
  }

  const randomId = nanoid();
  localStorage.setItem(storageKey, randomId);
  return randomId;
}

/**
 * Tests if local storage is available in the browser
 */
export function testLocalStorage(): boolean {
  try {
    localStorage.setItem("test", "test");
    localStorage.removeItem("test");
    return true;
  } catch {
    return false;
  }
}
