/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { afterEach, beforeEach, vi } from "vitest";

type Destroyable = {
  destroy: () => void;
};

/**
 * Registers per-test cleanup for destroyable resources and returns a tracker.
 *
 * Useful for integration tests that create long-lived instances (e.g. RAF loops)
 * and need deterministic teardown without repeating boilerplate in each suite.
 */
export const setupDestroyableTeardown = <T extends Destroyable>() => {
  const resources: T[] = [];

  beforeEach(() => {
    resources.length = 0;
  });

  afterEach(() => {
    for (const resource of resources) {
      resource.destroy();
    }
    resources.length = 0;

    try {
      vi.runOnlyPendingTimers();
    } catch {
      // Ignore when tests are running with real timers.
    }

    vi.useRealTimers();
  });

  return (resource: T) => {
    resources.push(resource);
    return resource;
  };
};
