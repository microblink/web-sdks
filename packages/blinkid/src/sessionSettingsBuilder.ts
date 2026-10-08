/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import {
  BlinkIdCore,
  DocumentPhotoUseCase,
  DocumentVideoUseCase,
  NonNullSessionSettings,
} from "@microblink/blinkid-core";

export class SessionSettingsBuilder {
  #core: BlinkIdCore;

  constructor(core: BlinkIdCore) {
    this.#core = core;
  }

  buildDocumentPhotoSettings(useCase?: DocumentPhotoUseCase): Promise<NonNullSessionSettings> {
    return this.#core.buildDocumentPhotoSettings(useCase);
  }

  buildDocumentVideoSettings(useCase?: DocumentVideoUseCase): Promise<NonNullSessionSettings> {
    return this.#core.buildDocumentVideoSettings(useCase);
  }

  buildStandaloneBarcodeSettings(): Promise<NonNullSessionSettings> {
    return this.#core.buildStandaloneBarcodeSettings();
  }

  buildVerifyCaptureSettings(): Promise<NonNullSessionSettings> {
    return this.#core.buildVerifyCaptureSettings();
  }
}
