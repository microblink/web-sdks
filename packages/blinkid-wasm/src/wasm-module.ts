/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type { EmscriptenModule, WasmBindings } from "@microblink/wasm-common";
import { BlinkIdScanningSession, BlinkIdSessionSettings } from "./session";

/**
 * The BlinkID Wasm module.
 *
 * @ignore
 */
export interface BlinkIdWasmModule extends BlinkIdBindings, EmscriptenModule {}

/**
 * The BlinkID bindings.
 *
 * @ignore
 */
export interface BlinkIdBindings extends WasmBindings<
  BlinkIdSessionSettings,
  BlinkIdScanningSession
> {}
