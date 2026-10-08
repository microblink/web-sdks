/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/** Selects which document data must be present for a successful scan. */
export type DocumentScenario = "general" | "mrz-mandatory" | "mrz-only" | "barcode-only";

/** Tunes live video scanning for capture speed, result accuracy, or tolerance of lower-quality input. */
export type VideoQualityProfile = "balanced" | "high-speed" | "high-accuracy" | "permissive";

/** Describes the physical setup used for live video capture. */
export type VideoCaptureEnvironment = "hand-held" | "stationary";

/** Tunes photo scanning for result accuracy or tolerance of lower-quality input. */
export type PhotoQualityProfile = "balanced" | "high-accuracy" | "permissive";

/** Configures a live document scanning session. Omitted properties use Core Identity defaults. */
export type DocumentVideoUseCase = {
  /**
   * Selects which recognition modules run and what data must be present.
   *
   * @defaultValue `"general"`
   */
  scenario?: DocumentScenario;

  /**
   * Selects the trade-off between capture speed and result accuracy.
   *
   * @defaultValue `"balanced"`
   */
  quality?: VideoQualityProfile;

  /**
   * Selects the physical camera setup.
   *
   * @defaultValue `"hand-held"`
   */
  captureEnvironment?: VideoCaptureEnvironment;
};

/** Configures a document photo or gallery-image scanning session. Omitted properties use Core Identity defaults. */
export type DocumentPhotoUseCase = {
  /**
   * Selects which recognition modules run and what data must be present.
   *
   * @defaultValue `"general"`
   */
  scenario?: DocumentScenario;

  /**
   * Selects the trade-off between result accuracy and tolerance of lower-quality input.
   *
   * @defaultValue `"balanced"`
   */
  quality?: PhotoQualityProfile;
};
