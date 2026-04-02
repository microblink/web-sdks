/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/** Represents the configurable settings for scanning a document. */
export type ScanningSettings = Partial<{
  /** Whether to treat expired documents as fraudulent. */
  treatExpirationAsFraud: boolean;

  /**
   * Threshold for detecting screen-displayed documents. Higher levels provide
   * stricter detection.
   */
  screenAnalysisMatchLevel: MatchLevel;
  /**
   * Threshold for verifying static security features. Higher levels require
   * more security features to be present.
   */
  staticSecurityFeaturesMatchLevel: MatchLevel;
  /**
   * Threshold for detecting anomalies in document barcodes. Higher levels
   * provide stricter detection.
   */
  barcodeAnomalyMatchLevel: MatchLevel;
  /**
   * Threshold for matching data between different parts of the document. Higher
   * levels require closer matches.
   */
  dataMatchMatchLevel: MatchLevel;

  /** Defines the settings for image quality. */
  imageQualitySettings: ImageQualitySettings;
  /** Defines the use case for the scanning process. */
  useCase: UseCase;
}>;

/**
 * Options for image quality settings. Stricter settings will provide better
 * quality images as the scan will not complete until they are met. If not
 * defined internal defaults will be used.
 */
export type ImageQualitySettings = Partial<{
  /**
   * Threshold for detecting blur on the document. Higher levels provide
   * stricter requirements.
   */
  blurMatchLevel: MatchLevel;
  /**
   * Threshold for detecting glare on the document. Higher levels provide
   * stricter requirements.
   */
  glareMatchLevel: MatchLevel;

  /**
   * Threshold for expected lighting level of a document on screen. Higher
   * levels provide stricter requirements.
   */
  lightingMatchLevel: MatchLevel;

  /**
   * Threshold for detecting the sharpness of the document. Higher levels
   * provide stricter requirements.
   */
  sharpnessMatchLevel: MatchLevel;

  /**
   * Threshold for detecting hand occlusion on the document. Higher levels
   * provide stricter requirements.
   */
  handOcclusionMatchLevel: MatchLevel;

  /**
   * Threshold for detecting the DPI of the document. Higher levels provide
   * stricter requirements.
   */
  dpiMatchLevel: MatchLevel;

  /**
   * Threshold for detecting the tilt of the document in screen. Higher levels
   * provide stricter requirements.
   */
  tiltMatchLevel: MatchLevel;

  /**
   * Specifies the strictness of the model when marking the quality of the
   * image. Includes a range of values that allow for more or less conservative
   * approach.
   */
  interpretation: ImageQualityInterpretation;
}>;

export type UseCase = Partial<{
  /**
   * The strictness policy that defines the rules and requirements for document
   * verification
   */
  verificationPolicy: VerificationPolicy;

  /** The strategy for handling manual reviews of documents, if required. */
  manualReviewStrategy: ManualReviewStrategy;
  /** The level of sensitivity applied to the manual review process */
  manualReviewSensitivity: ManualReviewSensitivity;
  /** The context of the verification, done either in-person or remote. */
  verificationContext: VerificationContext;
  /** The conditions under which the document is being captured. */
  captureConditions: CaptureConditions;
}>;

/**
 * Represents the level of strictness for a matching check during the document
 * verification process. This enum defines the different levels that can be
 * configured for various checks, such as photocopy or barcode anomaly
 * detection. Higher levels indicate stricter requirements, leading to fewer
 * false positives but potentially more false negatives.
 *
 * - `"disabled"`: The matching check is disabled, that check will not be
 *   performed.
 * - `"level-1" to "level-10"`: Increasing levels of strictness, from least to
 *   most strict.
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

/**
 * Specifies the strictness of the model when marking the quality of the image.
 * Includes a range of values that allow for more or less conservative
 * approach.
 *
 * - `"ignore"`: Ensures that BlinkID Verify returns a `Pass` or `Fail` verdict
 *   even if image quality is not good enough.
 * - `"conservative"`: If image quality is not good enough, BlinkID Verify will
 *   refuse to process the image and a `NotPerformed` verdict will be returned.
 *   When a `NotPerformed` verdict is returned, BlinkID Verify will prompt the
 *   user to repeat the capture process. This is indicated by the `Retry` value
 *   under `RecommendedOutcome` in the response.
 * - `"high-assurance"`: A `Fail` verdict can be returned even if image quality is
 *   not good enough, but occasionally a `Pass` verdict will not be returned if
 *   image quality is not satisfactory.
 * - `"high-conversion"`: A `Pass` verdict can be returned even if image quality
 *   is not good enough, but occasionally a `Fail` verdict will not be returned
 *   if image quality is not satisfactory.
 * - `"very-high-conversion"`: A `Pass` verdict can be returned even if image
 *   quality is significantly unsatisfactory, but a `Fail` verdict will not be
 *   returned if image quality is really poor.
 */
export type ImageQualityInterpretation =
  | "ignore"
  | "conservative"
  | "high-assurance"
  | "high-conversion"
  | "very-high-conversion";

/**
 * Defines the strictness of checks performed by BlinkID Verify as part of the
 * `UseCase` settings.
 *
 * - `"permissive"`: Optimized for letting real users through. In cases of doubt
 *   or lower confidence, BlinkID Verify will avoid failing the document.
 * - `"standard"`: Default policy. It is more strict compared to `Permissive` but
 *   still optimized for accepting real users.
 * - `"strict"`: Users with damaged documents, bad lighting conditions or lower
 *   image quality will probably be rejected. In cases of doubt or lower
 *   confidence, the document will more often be rejected.
 * - `"very-strict"`: Reasonable only for the most sensitive use cases.
 *   Significant user friction is added to stop as much fraud as possible.
 */
export type VerificationPolicy =
  | "permissive"
  | "standard"
  | "strict"
  | "very-strict";

/**
 * Defines the manual review strategy used during document verification as part
 * of the `UseCase` settings.
 *
 * - `"never"`: No documents will be sent for manual review.
 * - `"rejected-and-accepted"`: Both rejected and accepted documents will be sent
 *   for manual review.
 * - `"rejected-only"`: Only rejected documents will be sent for manual review.
 * - `"accepted-only"`: Only accepted documents will be sent for manual review.
 */
export type ManualReviewStrategy =
  | "never"
  | "rejected-and-accepted"
  | "rejected-only"
  | "accepted-only";

/**
 * Defines the volume of documents that will be sent for manual review as part
 * of the `UseCase` settings. The outcome depends on the selected policy and
 * varies according to the overall verification `CertaintyLevel`.
 *
 * If manual review is not used, this setting is ignored.
 *
 * - `"low"`: Only borderline cases are sent for manual review. <br/> Documents
 *   where certainty is `Low` alongside a `SuspiciousDataCheck` fail will be
 *   sent for manual review.
 * - `"default"`: The manual review process is default.
 * - `"high"`: The manual review process is high.
 */
export type ManualReviewSensitivity = "low" | "default" | "high";

/**
 * Defines the context under which document verification is performed as part of
 * the `UseCase` settings. It describes the setup and conditions in which
 * verification occurs.
 *
 * - `"remote"`: Default policy. Document verification is performed in a remote
 *   setting where a user is scanning the document in their own space,
 *   unsupervised.
 * - `"in-person"`: Document verification is performed in an in-person environment
 *   in which a trained employee is scanning the document. <br/> Document
 *   liveness checks are not performed when `InPerson` policy is set.
 */
export type VerificationContext = "remote" | "in-person";

/**
 * Defines the conditions under which the document is captured as part of the
 * `UseCase` settings.
 *
 * - `"no-control"`: _Deprecated_: Is the same as `"basic"`, it will be removed in
 *   the future.
 * - `"basic"`: Allows for processing of fully cropped documents. The integrator
 *   has no control over the capture process on the user's side and is limited
 *   by the lack of a robust SDK. It is not possible for a cropped document to
 *   get a `Pass` or `Accept` in the overall result. Liveness checks will not be
 *   performed if the document is fully cropped.
 * - `"hybrid"`: Allows for processing of fully cropped documents. The integrator
 *   has no control over the capture process on the user's side and is limited
 *   by the lack of a robust SDK. It is possible for a cropped document to get a
 *   `Pass` or `Accept` in the overall result. Liveness checks will not be
 *   performed if the document is fully cropped.
 */
export type CaptureConditions = "no-control" | "basic" | "hybrid";
