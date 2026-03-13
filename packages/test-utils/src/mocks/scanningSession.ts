/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { vi } from "vitest";

import type { EmbindObject } from "@microblink/wasm-common";

export const createScanningSessionMock = <T extends EmbindObject<{}>>(
  overrides: Partial<T> = {},
): T => {
  return {
    delete: vi.fn(),
    isDeleted: vi.fn(),
    deleteLater: vi.fn(),
    isAliasOf: vi.fn(),
    reset: vi.fn(),
    process: vi.fn(),
    getResult: vi.fn(),
    getSettings: vi.fn(),
    getSessionId: vi.fn(),
    getSessionNumber: vi.fn(),
    ...overrides,
  } as unknown as T;
};
