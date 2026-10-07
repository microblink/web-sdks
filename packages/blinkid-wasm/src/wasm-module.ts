/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { EmscriptenModule, WasmBindings } from "@microblink/wasm-common";

import { DocumentClassInfo } from "./result";
import { BlinkIdScanningSession, BlinkIdSessionSettings, BlinkIdSessionSettingsInput } from "./session";
import { ScanningSettings } from "./settings";
import { RedactionSettings } from "./settings/RedactionSettings";
import { DocumentPhotoUseCase, DocumentVideoUseCase } from "./settings/ScanningUseCase";

/**
 * The BlinkID Wasm module.
 *
 * @ignore
 */
export interface BlinkIdWasmModule extends BlinkIdBindings, EmscriptenModule, MemFSModule {
  buildDocumentVideoSettings: (useCase: DocumentVideoUseCase) => BlinkIdSessionSettings;
  buildDocumentPhotoSettings: (useCase: DocumentPhotoUseCase) => BlinkIdSessionSettings;
  buildStandaloneBarcodeSettings: () => BlinkIdSessionSettings;
  buildVerifyCaptureSettings: () => BlinkIdSessionSettings;
  getDefaultRedactionSettings: (documentType: DocumentClassInfo) => RedactionSettings;
  getRecognizerVersion: () => string;
}

/**
 * The BlinkID bindings.
 *
 * @ignore
 */
export type BlinkIdBindings = WasmBindings<BlinkIdSessionSettingsInput, BlinkIdScanningSession>;

export interface MemFSModule {
  FS?: {
    mkdirTree?(path: string): void;
    writeFile?(path: string, data: Uint8Array): void;
    readdir?(path: string): string[];
    readFile?(path: string): Uint8Array;
    stat?(path: string): {
      size: number;
    };
  };
  FS_createPath?: (parent: string, path: string, canRead: boolean, canWrite: boolean) => void;
  FS_createDataFile?: (
    parent: string,
    name: string,
    data: Uint8Array,
    canRead: boolean,
    canWrite: boolean,
    canOwn?: boolean,
  ) => void;
  FS_unlink?: (path: string) => void;
}
