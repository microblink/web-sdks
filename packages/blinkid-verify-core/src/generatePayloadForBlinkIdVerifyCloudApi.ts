/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import {
  BlinkIdVerifyScanningResult,
  CaptureConditions,
  CapturedFrame,
  ImageQualityInterpretation,
  ManualReviewSensitivity,
  ManualReviewStrategy,
  MatchLevel,
  ScanningSettings,
  VerificationContext,
  VerificationPolicy,
} from "@microblink/blinkid-verify-wasm";

/**
 * Specifies the strictness level for a particular match check sent to the BlinkID Verify Cloud API.
 *
 * Higher levels apply stricter thresholds. Use `"Disabled"` to skip a check entirely.
 */
export type BlinkIdVerifyRequestMatchLevel =
  | "Disabled"
  | "Level1"
  | "Level2"
  | "Level3"
  | "Level4"
  | "Level5"
  | "Level6"
  | "Level7"
  | "Level8"
  | "Level9"
  | "Level10";

/**
 * Controls which parts of the verification result are anonymized in the API response.
 *
 * - `"ImageOnly"` — redacts only the document images.
 * - `"ResultFieldsOnly"` — redacts only the parsed data fields.
 * - `"FullResult"` — redacts both images and data fields.
 * - `"None"` — no anonymization is applied.
 */
export type BlinkIdVerifyRequestAnonymizationMode =
  | "ImageOnly"
  | "ResultFieldsOnly"
  | "FullResult"
  | "None";

/**
 * Specifies the strictness of the model when marking the quality of the image.
 * Includes a range of values that allow for more or less conservative
 * approach.
 *
 * - `"Ignore"`: Ensures that BlinkID Verify API returns a `Pass` or `Fail` verdict
 *   even if image quality is not good enough.
 * - `"Conservative"`: If image quality is not good enough, BlinkID Verify API will
 *   refuse to process the image and a `NotPerformed` verdict will be returned.
 *   When a `NotPerformed` verdict is returned, BlinkID Verify API will prompt the
 *   user to repeat the capture process. This is indicated by the `Retry` value
 *   under `RecommendedOutcome` in the response.
 * - `"HighAssurance"`: A `Fail` verdict can be returned even if image quality is
 *   not good enough, but occasionally a `Pass` verdict will not be returned if
 *   image quality is not satisfactory.
 * - `"HighConversion"`: A `Pass` verdict can be returned even if image quality
 *   is not good enough, but occasionally a `Fail` verdict will not be returned
 *   if image quality is not satisfactory.
 * - `"VeryHighConversion"`: A `Pass` verdict can be returned even if image
 *   quality is significantly unsatisfactory, but a `Fail` verdict will not be
 *   returned if image quality is really poor.
 */
export type BlinkIdVerifyRequestImageQualityInterpretation =
  | "Ignore"
  | "Conservative"
  | "HighAssurance"
  | "HighConversion"
  | "VeryHighConversion";

/**
 * Defines the strictness of checks performed by BlinkID Verify API as part of the
 * `UseCase` settings.
 *
 * - `"Permissive"`: Optimized for letting real users through. In cases of doubt
 *   or lower confidence, BlinkID Verify API will avoid failing the document.
 * - `"Standard"`: Default policy. It is more strict compared to `Permissive` but
 *   still optimized for accepting real users.
 * - `"Strict"`: Users with damaged documents, bad lighting conditions or lower
 *   image quality will probably be rejected. In cases of doubt or lower
 *   confidence, the document will more often be rejected.
 * - `"VeryStrict"`: Reasonable only for the most sensitive use cases.
 *   Significant user friction is added to stop as much fraud as possible.
 */
type BlinkIdVerifyRequestDocumentVerificationPolicy =
  | "Permissive"
  | "Standard"
  | "Strict"
  | "VeryStrict";

/**
 * Defines the manual review strategy used during document verification as part
 * of the `UseCase` settings.
 *
 * - `"Never"`: No documents will be sent for manual review.
 * - `"RejectedAndAccepted"`: Both rejected and accepted documents will be sent
 *   for manual review.
 * - `"RejectedOnly"`: Only rejected documents will be sent for manual review.
 * - `"AcceptedOnly"`: Only accepted documents will be sent for manual review.
 */
export type BlinkIdVerifyRequestManualReviewStrategy =
  | "Never"
  | "RejectedAndAccepted"
  | "RejectedOnly"
  | "AcceptedOnly";

/**
 * Defines the volume of documents that will be sent for manual review as part
 * of the `UseCase` settings. The outcome depends on the selected policy and
 * varies according to the overall verification `CertaintyLevel`.
 *
 * If manual review is not used, this setting is ignored.
 *
 * - `"Low"`: Only borderline cases are sent for manual review. <br/> Documents
 *   where certainty is `Low` alongside a `SuspiciousDataCheck` fail will be
 *   sent for manual review.
 * - `"Default"`: The manual review process is default.
 * - `"High"`: The manual review process is high.
 */
export type BlinkIdVerifyRequestManualReviewSensitivity =
  | "Low"
  | "Default"
  | "High";

/**
 * Defines the context under which document verification is performed as part of
 * the `UseCase` settings. It describes the setup and conditions in which
 * verification occurs.
 *
 * - `"Remote"`: Default policy. Document verification is performed in a remote
 *   setting where a user is scanning the document in their own space,
 *   unsupervised.
 * - `"InPerson"`: Document verification is performed in an in-person environment
 *   in which a trained employee is scanning the document. <br/> Document
 *   liveness checks are not performed when `InPerson` policy is set.
 */
export type BlinkIdVerifyRequestVerificationContext = "Remote" | "InPerson";

/**
 * Defines the conditions under which the document is captured as part of the
 * `UseCase` settings.
 *
 * - `"NoControl"`: Is the same as `"Basic"`, it will be removed in
 *   the future.
 * - `"Basic"`: Allows for processing of fully cropped documents. The integrator
 *   has no control over the capture process on the user's side and is limited
 *   by the lack of a robust SDK. It is not possible for a cropped document to
 *   get a `Pass` or `Accept` in the overall result. Liveness checks will not be
 *   performed if the document is fully cropped.
 * - `"Hybrid"`: Allows for processing of fully cropped documents. The integrator
 *   has no control over the capture process on the user's side and is limited
 *   by the lack of a robust SDK. It is possible for a cropped document to get a
 *   `Pass` or `Accept` in the overall result. Liveness checks will not be
 *   performed if the document is fully cropped.
 */
export type BlinkIdVerifyRequestCaptureConditions =
  | "NoControl"
  | "Basic"
  | "Hybrid";

/**
 * Represents a document image submitted to the BlinkID Verify API.
 */
type BlinkIdVerifyRequestDocumentVerificationImageSource = {
  /** Base64-encoded JPEG image data, or `null` if no image is available. */
  base64: string | null;
};

/**
 * The request payload sent to the BlinkID Verify API.
 *
 * Contains the captured document images, verification options, and use-case
 * configuration derived from the scanning result and session settings.
 */
type BlinkIdVerifyPayload = {
  /** The front-side image of the document. */
  imageFront?: BlinkIdVerifyRequestDocumentVerificationImageSource;
  /** The back-side image of the document. */
  imageBack?: BlinkIdVerifyRequestDocumentVerificationImageSource;
  /** The barcode image extracted from the document. */
  imageBarcode?: BlinkIdVerifyRequestDocumentVerificationImageSource;
  /** Verification options that control check strictness and returned data. */
  options?: {
    /** Whether an expired document should be treated as fraudulent. */
    treatExpirationAsFraud?: boolean;
    /** Controls which parts of the result are anonymized. */
    anonymizationMode?: BlinkIdVerifyRequestAnonymizationMode;
    /** How image quality issues affect the overall verification outcome. */
    imageQualityInterpretation?: BlinkIdVerifyRequestImageQualityInterpretation;
    /** Match level threshold for detecting that the document was displayed on a screen. */
    screenMatchLevel?: BlinkIdVerifyRequestMatchLevel;
    /** Match level threshold for detecting photocopy fraud. */
    photocopyMatchLevel?: BlinkIdVerifyRequestMatchLevel;
    /** Match level threshold for detecting barcode anomalies. */
    barcodeAnomalyMatchLevel?: BlinkIdVerifyRequestMatchLevel;
    /** Match level threshold for detecting photo forgery. */
    photoForgeryMatchLevel?: BlinkIdVerifyRequestMatchLevel;
    /** Match level threshold for verifying static security features. */
    staticSecurityFeaturesMatchLevel?: BlinkIdVerifyRequestMatchLevel;
    /** Match level threshold for data consistency checks across document fields. */
    dataMatchMatchLevel?: BlinkIdVerifyRequestMatchLevel;
    /** Match level threshold for the blur image quality check. */
    blurMatchLevel?: BlinkIdVerifyRequestMatchLevel;
    /** Match level threshold for the glare image quality check. */
    glareMatchLevel?: BlinkIdVerifyRequestMatchLevel;
    /** Match level threshold for the lighting image quality check. */
    lightingMatchLevel?: BlinkIdVerifyRequestMatchLevel;
    /** Match level threshold for the sharpness image quality check. */
    sharpnessMatchLevel?: BlinkIdVerifyRequestMatchLevel;
    /** Match level threshold for the hand occlusion image quality check. */
    handOcclusionMatchLevel?: BlinkIdVerifyRequestMatchLevel;
    /** Match level threshold for the DPI (dots per inch) image quality check. */
    dpiMatchLevel?: BlinkIdVerifyRequestMatchLevel;
    /** Match level threshold for the document tilt image quality check. */
    tiltMatchLevel?: BlinkIdVerifyRequestMatchLevel;
    /** Whether to include the face image in the API response. */
    returnFaceImage?: boolean;
    /** Whether to include the full document image in the API response. */
    returnFullDocumentImage?: boolean;
    /** Whether to include the signature image in the API response. */
    returnSignatureImage?: boolean;
    /** The image format used for returned images. */
    returnImageFormat?: "Jpg" | "Png" | "Qoi";
    /** Match level threshold for the generative AI–based fraud detection check. */
    generativeAiMatchLevel?: BlinkIdVerifyRequestMatchLevel;
  };
  /** Use-case configuration that tailors the verification policy to the deployment context. */
  useCase?: {
    /** The overall strictness policy applied during document verification. */
    documentVerificationPolicy?: BlinkIdVerifyRequestDocumentVerificationPolicy;
    /** The physical context in which the document is being verified. */
    verificationContext?: BlinkIdVerifyRequestVerificationContext;
    /** Which verification outcomes are escalated for manual human review. */
    manualReviewStrategy?: BlinkIdVerifyRequestManualReviewStrategy;
    /** The sensitivity threshold for triggering manual review. */
    manualReviewSensitivity?: BlinkIdVerifyRequestManualReviewSensitivity;
    /** The level of control over image capture conditions. */
    captureConditions?: BlinkIdVerifyRequestCaptureConditions;
  };
  /** The unique identifier of the capture session, used to correlate the request with SDK telemetry. */
  captureSessionId: string;
};

/**
 * The image format used when requesting document images in the API response.
 */
export type ReturnImageFormat = "Jpg" | "Png" | "Qoi";

/**
 * Caller-supplied options for the BlinkID Verify Cloud API request.
 *
 * These options are merged with settings derived from the scanning session to
 * produce the final {@link BlinkIdVerifyPayload}. Only the subset of options
 * that are relevant to the caller are exposed here.
 */
export type BlinkIdVerifyRequestOptions = {
  /** Controls which parts of the result are anonymized in the API response. */
  anonymizationMode?: BlinkIdVerifyRequestAnonymizationMode;
  /** Match level threshold for detecting photocopy fraud. */
  photocopyMatchLevel?: BlinkIdVerifyRequestMatchLevel;
  /** Match level threshold for detecting photo forgery. */
  photoForgeryMatchLevel?: BlinkIdVerifyRequestMatchLevel;
  /** Whether to include the face image in the API response. */
  returnFaceImage?: boolean;
  /** Whether to include the full document image in the API response. */
  returnFullDocumentImage?: boolean;
  /** Whether to include the signature image in the API response. */
  returnSignatureImage?: boolean;
  /** The image format used for returned images. */
  returnImageFormat?: ReturnImageFormat;
  /** Match level threshold for the generative AI–based fraud detection check. */
  generativeAiMatchLevel?: BlinkIdVerifyRequestMatchLevel;
};

/**
 * Builds the JSON payload for the BlinkID Verify Cloud API from a completed scanning result.
 *
 * Maps internal SDK enum values (kebab-case) to their API-facing PascalCase equivalents
 * and encodes captured document frames as base64 JPEG strings.
 *
 * @param result - The scanning result produced by the BlinkIdVerify SDK.
 * @param sessionId - The unique identifier of the capture session to include in the payload.
 * @param settings - The scanning settings used during the session, used to derive verification options.
 * @param options - Optional caller-supplied overrides for anonymization, image return, and match levels.
 * @returns The fully constructed payload ready to be submitted to the BlinkID Verify Cloud API.
 */
export function GeneratePayloadForBlinkidVerifyRequest(
  result: BlinkIdVerifyScanningResult,
  sessionId: string,
  settings: ScanningSettings,
  options?: BlinkIdVerifyRequestOptions,
): BlinkIdVerifyPayload {
  const payload: BlinkIdVerifyPayload = {
    imageFront: frameToBase64(result.frontFrame),
    imageBack: frameToBase64(result.backFrame),
    imageBarcode: frameToBase64(result.barcodeFrame),
    options: {
      treatExpirationAsFraud: settings.treatExpirationAsFraud,
      screenMatchLevel: mapMatchLevel(settings.screenAnalysisMatchLevel),
      photocopyMatchLevel: options?.photocopyMatchLevel,
      photoForgeryMatchLevel: options?.photoForgeryMatchLevel,
      staticSecurityFeaturesMatchLevel: mapMatchLevel(
        settings.staticSecurityFeaturesMatchLevel,
      ),
      barcodeAnomalyMatchLevel: mapMatchLevel(
        settings.barcodeAnomalyMatchLevel,
      ),
      dataMatchMatchLevel: mapMatchLevel(settings.dataMatchMatchLevel),
      blurMatchLevel: mapMatchLevel(
        settings.imageQualitySettings?.blurMatchLevel,
      ),
      glareMatchLevel: mapMatchLevel(
        settings.imageQualitySettings?.glareMatchLevel,
      ),
      lightingMatchLevel: mapMatchLevel(
        settings.imageQualitySettings?.lightingMatchLevel,
      ),
      sharpnessMatchLevel: mapMatchLevel(
        settings.imageQualitySettings?.sharpnessMatchLevel,
      ),
      handOcclusionMatchLevel: mapMatchLevel(
        settings.imageQualitySettings?.handOcclusionMatchLevel,
      ),
      dpiMatchLevel: mapMatchLevel(
        settings.imageQualitySettings?.dpiMatchLevel,
      ),
      tiltMatchLevel: mapMatchLevel(
        settings.imageQualitySettings?.tiltMatchLevel,
      ),
      imageQualityInterpretation: mapImageQualityInterpretation(
        settings.imageQualitySettings?.interpretation,
      ),
      anonymizationMode: options?.anonymizationMode,
      returnFaceImage: options?.returnFaceImage,
      returnFullDocumentImage: options?.returnFullDocumentImage,
      returnSignatureImage: options?.returnSignatureImage,
      returnImageFormat: options?.returnImageFormat,
      generativeAiMatchLevel: options?.generativeAiMatchLevel,
    },
    useCase: {
      documentVerificationPolicy: mapDocumentVerificationPolicy(
        settings.useCase?.verificationPolicy,
      ),
      verificationContext: mapVerificationContext(
        settings.useCase?.verificationContext,
      ),
      manualReviewStrategy: mapManualReviewStrategy(
        settings.useCase?.manualReviewStrategy,
      ),
      manualReviewSensitivity: mapManualReviewSensitivity(
        settings.useCase?.manualReviewSensitivity,
      ),
      captureConditions: mapCaptureConditions(
        settings.useCase?.captureConditions,
      ),
    },
    captureSessionId: sessionId,
  };

  return payload;
}

function mapManualReviewSensitivity(
  sensitivity: ManualReviewSensitivity | undefined,
): BlinkIdVerifyRequestManualReviewSensitivity | undefined {
  switch (sensitivity) {
    case "low":
      return "Low";
    case "default":
      return "Default";
    case "high":
      return "High";
    default:
      return undefined;
  }
}

function mapManualReviewStrategy(
  strategy: ManualReviewStrategy | undefined,
): BlinkIdVerifyRequestManualReviewStrategy | undefined {
  switch (strategy) {
    case "never":
      return "Never";
    case "rejected-and-accepted":
      return "RejectedAndAccepted";
    case "rejected-only":
      return "RejectedOnly";
    case "accepted-only":
      return "AcceptedOnly";
    default:
      return undefined;
  }
}

function mapDocumentVerificationPolicy(
  policy: VerificationPolicy | undefined,
): BlinkIdVerifyRequestDocumentVerificationPolicy | undefined {
  switch (policy) {
    case "permissive":
      return "Permissive";
    case "standard":
      return "Standard";
    case "strict":
      return "Strict";
    case "very-strict":
      return "VeryStrict";
    default:
      return undefined;
  }
}

function mapImageQualityInterpretation(
  interpretation: ImageQualityInterpretation | undefined,
): BlinkIdVerifyRequestImageQualityInterpretation | undefined {
  switch (interpretation) {
    case "ignore":
      return "Ignore";
    case "conservative":
      return "Conservative";
    case "high-assurance":
      return "HighAssurance";
    case "high-conversion":
      return "HighConversion";
    case "very-high-conversion":
      return "VeryHighConversion";
    default:
      return undefined;
  }
}

function mapVerificationContext(
  context: VerificationContext | undefined,
): BlinkIdVerifyRequestVerificationContext | undefined {
  switch (context) {
    case "in-person":
      return "InPerson";
    case "remote":
      return "Remote";
    default:
      return undefined;
  }
}

function mapCaptureConditions(
  conditions: CaptureConditions | undefined,
): BlinkIdVerifyRequestCaptureConditions | undefined {
  switch (conditions) {
    case "no-control":
      return "NoControl";
    case "basic":
      return "Basic";
    case "hybrid":
      return "Hybrid";
    default:
      return undefined;
  }
}

function mapMatchLevel(
  level: MatchLevel | undefined,
): BlinkIdVerifyRequestMatchLevel | undefined {
  switch (level) {
    case "disabled":
      return "Disabled";
    case "level-1":
      return "Level1";
    case "level-2":
      return "Level2";
    case "level-3":
      return "Level3";
    case "level-4":
      return "Level4";
    case "level-5":
      return "Level5";
    case "level-6":
      return "Level6";
    case "level-7":
      return "Level7";
    case "level-8":
      return "Level8";
    case "level-9":
      return "Level9";
    case "level-10":
      return "Level10";
    default:
      return undefined;
  }
}

function frameToBase64(
  frame: CapturedFrame | undefined,
): BlinkIdVerifyRequestDocumentVerificationImageSource | undefined {
  if (!frame?.jpegBytes) return undefined;
  return {
    base64: btoa(
      new Uint8Array(frame.jpegBytes).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        "",
      ),
    ),
  };
}
