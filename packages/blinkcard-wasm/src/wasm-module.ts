/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type { WasmBindings, WasmModule } from "@microblink/wasm-common";
import {
  BlinkCardScanningSession,
  BlinkCardSessionSettingsInput,
} from "./session";

/**
 * The BlinkCard Wasm module.
 *
 * @ignore
 */
export interface BlinkCardWasmModule extends WasmModule<
  BlinkCardSessionSettingsInput,
  BlinkCardScanningSession
> {}

/**
 * The BlinkCard bindings.
 *
 * @ignore
 */
export interface BlinkCardBindings extends WasmBindings<
  BlinkCardSessionSettingsInput,
  BlinkCardScanningSession
> {}
