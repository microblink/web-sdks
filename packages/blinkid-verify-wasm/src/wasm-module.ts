/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type { WasmBindings, WasmModule } from "@microblink/wasm-common";
import type { BlinkIdVerifySessionSettings } from "./Session/session-settings";
import type { BlinkIdVerifyScanningSession } from "./Session/blink-id-verify-scanning-session";

/**
 * The BlinkIdVerify Wasm module.
 *
 * @ignore
 */
export interface BlinkIdVerifyWasmModule extends WasmModule<
  BlinkIdVerifySessionSettings | undefined,
  BlinkIdVerifyScanningSession
> {}

/**
 * The BlinkIdVerify bindings.
 *
 * @ignore
 */
export interface BlinkIdVerifyBindings extends WasmBindings<
  BlinkIdVerifySessionSettings,
  BlinkIdVerifyScanningSession
> {}
