/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { EmbindObject } from "@microblink/wasm-common";
import { vi } from "vitest";

export const createScanningSessionMock = <T extends EmbindObject<Record<string, unknown>>>(
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
