/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { LoadError } from "./result.js";

/**
 * Extracts a {@link LoadError} from whatever was thrown by `createBiometricsWasmSession` inside the WASM module.
 *
 * The native side throws a JS `Error` whose `message` is a JSON string of shape `{ "kind": "loadError", "code":
 * <LoadError> }`. This helper tolerates non-matching throws and returns `LoadError.Unknown` in that case.
 */
export function parseLoadErrorFromThrown(thrown: unknown): LoadError {
  const message = thrown instanceof Error ? thrown.message : typeof thrown === "string" ? thrown : "";

  try {
    const parsed = JSON.parse(message) as {
      kind?: unknown;
      code?: unknown;
    };

    if (parsed.kind === "loadError" && typeof parsed.code === "number") {
      return isKnownLoadError(parsed.code) ? parsed.code : LoadError.Unknown;
    }
  } catch {
    // fall through to Unknown
  }

  return LoadError.Unknown;
}

function isKnownLoadError(code: number): code is LoadError {
  const knownLoadErrors: readonly number[] = [
    LoadError.InvalidSettings,
    LoadError.MissingResources,
    LoadError.InvalidLicense,
    LoadError.Unknown,
    LoadError.InvalidResources,
    LoadError.MemoryReserveFailed,
  ];

  return knownLoadErrors.includes(code);
}
