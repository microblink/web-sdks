/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type { EmscriptenModule, WasmBindings } from "@microblink/wasm-common";
import { BlinkIdScanningSession, BlinkIdSessionSettingsInput } from "./session";
import { RedactionSettings } from "./settings/RedactionSettings";
import { DocumentClassInfo } from "./result";

/**
 * The BlinkID Wasm module.
 *
 * @ignore
 */
export interface BlinkIdWasmModule extends BlinkIdBindings, EmscriptenModule {
  getDefaultRedactionSettings: (
    documentType: DocumentClassInfo,
  ) => RedactionSettings;
}

/**
 * The BlinkID bindings.
 *
 * @ignore
 */
export interface BlinkIdBindings extends WasmBindings<
  BlinkIdSessionSettingsInput,
  BlinkIdScanningSession
> {}
