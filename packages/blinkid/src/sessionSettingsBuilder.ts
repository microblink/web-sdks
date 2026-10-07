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

  async buildDocumentPhotoSettings(useCase?: DocumentPhotoUseCase): Promise<NonNullSessionSettings> {
    const settings = await this.#core.buildDocumentPhotoSettings(useCase);
    return settings;
  }

  async buildDocumentVideoSettings(useCase?: DocumentVideoUseCase): Promise<NonNullSessionSettings> {
    const settings = await this.#core.buildDocumentVideoSettings(useCase);
    return settings;
  }

  async buildStandaloneBarcodeSettings(): Promise<NonNullSessionSettings> {
    const settings = await this.#core.buildStandaloneBarcodeSettings();
    return settings;
  }

  async buildVerifyCaptureSettings(): Promise<NonNullSessionSettings> {
    const settings = await this.#core.buildVerifyCaptureSettings();
    return settings;
  }
}
