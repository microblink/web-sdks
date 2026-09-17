/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { WasmBindings, WasmModule } from "@microblink/wasm-common";

import type { BlinkIdVerifyScanningSession } from "./Session/blink-id-verify-scanning-session";
import type { BlinkIdVerifySessionSettings } from "./Session/session-settings";

/**
 * The BlinkIdVerify Wasm module.
 *
 * @ignore
 */
export type BlinkIdVerifyWasmModule = WasmModule<
  BlinkIdVerifySessionSettings | undefined,
  BlinkIdVerifyScanningSession
>;

/**
 * The BlinkIdVerify bindings.
 *
 * @ignore
 */
export type BlinkIdVerifyBindings = WasmBindings<BlinkIdVerifySessionSettings, BlinkIdVerifyScanningSession>;
