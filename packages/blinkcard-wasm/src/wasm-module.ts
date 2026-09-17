/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { WasmBindings, WasmModule } from "@microblink/wasm-common";

import { BlinkCardScanningSession, BlinkCardSessionSettingsInput } from "./session";

/**
 * The BlinkCard Wasm module.
 *
 * @ignore
 */
export type BlinkCardWasmModule = WasmModule<BlinkCardSessionSettingsInput, BlinkCardScanningSession>;

/**
 * The BlinkCard bindings.
 *
 * @ignore
 */
export type BlinkCardBindings = WasmBindings<BlinkCardSessionSettingsInput, BlinkCardScanningSession>;
