/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/**
 * The source of the input image.
 *
 * - `photo`: A single image will be provided to the sdk for analysis per side of document. This feature is currently not
 *   supported.
 * - `video`: A consecutive stream of images will be provided to the sdk.
 */
export type InputImageSource = "photo" | "video";

/** Native verification checks configured for the scanning session. */
export type VerificationSettings = Partial<{
  screenPresenceSensitivity: MatchLevel;
  photocopySensitivity: MatchLevel;
  barcodeAuthenticitySensitivity: MatchLevel;
  portraitForgerySensitivity: MatchLevel;
  dataMatchSensitivity: MatchLevel;
  generativeAiSensitivity: MatchLevel;
  imageQualityRetryPolicy: ImageQualityRetryPolicy;
  rejectExpiredDocuments: boolean;
  cropAffectsVerdict: boolean;
}>;

/** Verification configuration shared with the BlinkID Verify API. */
export type VerificationConfiguration = Partial<{
  useCase: UseCase;
  settings: VerificationSettings;
}>;

/** Redaction settings applied to captured images and extracted result fields. */
export type RedactionSettings = Partial<{
  globalMode: RedactionMode;
}>;

/** Settings controlling document and face image extraction. */
export type DocumentCaptureModuleSettings = Partial<{
  faceImageExtractionEnabled: boolean;
  documentImageReturnEnabled: boolean;
}>;

/** Settings controlling extraction from the visual inspection zone. */
export type VizModuleSettings = Partial<{
  signatureImageExtractionEnabled: boolean;
}>;

/** Settings controlling barcode image extraction. */
export type BarcodeModuleSettings = Partial<{
  barcodeImageReturnEnabled: boolean;
}>;

/** Extraction configuration shared with the BlinkID Verify API. */
export type VerificationExtractionConfiguration = Partial<{
  redactionSettings: RedactionSettings;
  documentCaptureModuleSettings: DocumentCaptureModuleSettings;
  vizModuleSettings: VizModuleSettings;
  barcodeModuleSettings: BarcodeModuleSettings;
}>;

/** Image-assessment configuration shared with the BlinkID Verify API. */
export type ImageAssessmentConfiguration = Partial<{
  imageQualitySensitivity: MatchLevel;
}>;

/** Native BlinkID Verify configuration. */
export type DocumentVerificationConfiguration = Partial<{
  verification: VerificationConfiguration;
  extraction: VerificationExtractionConfiguration;
  imageAssessment: ImageAssessmentConfiguration;
}>;

/** Settings configuring the whole session */
export type BlinkIdVerifySessionSettings = Partial<{
  /** Defines the source of the input image. */
  inputImageSource: InputImageSource;

  /** Verification, extraction, and image-assessment settings. */
  configuration: DocumentVerificationConfiguration;

  /** Optional caller-supplied trace ID included in generated payloads. */
  traceId: string;
}>;

/**
 * Represents the level of strictness for a matching check.
 *
 * Maps native `Sensitivity`. Higher levels provide stricter detection. `"disabled"` turns the check off.
 */
export type MatchLevel =
  | "disabled"
  | "level-1"
  | "level-2"
  | "level-3"
  | "level-4"
  | "level-5"
  | "level-6"
  | "level-7"
  | "level-8"
  | "level-9"
  | "level-10";

/** Defines how scanning reacts when the captured image quality is insufficient. */
export type ImageQualityRetryPolicy =
  | "never-retry-bad-quality"
  | "retry-bad-quality-always"
  | "retry-bad-quality-for-acceptances"
  | "retry-bad-quality-for-rejections";

/** Defines how sensitive data is redacted. */
export type RedactionMode = "none" | "image-only" | "result-fields-only" | "full-result";

/** Defines the verification policy and context for a scan. */
export type UseCase = Partial<{
  verificationPolicy: VerificationPolicy;
  manualReviewStrategy: ManualReviewStrategy;
  verificationContext: VerificationContext;
}>;

/** Defines the strictness policy used for document verification. */
export type VerificationPolicy = "high-conversion" | "balanced" | "high-assurance";

/** Defines which outcomes should be sent for manual review. */
export type ManualReviewStrategy = "never" | "rejected-and-accepted" | "rejected-only" | "accepted-only";

/** Defines whether verification is performed remotely or in person. */
export type VerificationContext = "remote" | "in-person";
