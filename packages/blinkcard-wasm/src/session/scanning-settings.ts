/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Represents the configurable settings for scanning a card.
 *
 * This structure defines various parameters and policies related to the
 * scanning process, including image quality handling, data extraction,
 * anonymization, and liveness detection, along with options for frame
 * processing and image extraction.
 */
export type ScanningSettings = {
  /**
   * Indicates whether to reject frames if blur is detected on the card image.
   *
   * When `true` (default), frames with detected blur are skipped to ensure only
   * high-quality images are processed. When `false`, blurred frames are still
   * processed, and the blur status is reported in the
   * `BlinkCardProcessResult`.
   */
  skipImagesWithBlur: boolean;

  /**
   * The level of allowed detected tilt of the card in the image.
   *
   * Defines the severity of allowed detected tilt of the card in the image, as
   * defined in `DetectionLevel`. Values range from `Off` (detection turned off)
   * to higher levels of allowed tilt.
   */
  tiltDetectionLevel: DetectionLevel;

  /**
   * Defines the minimum required margin (in percentage) between the edge of the
   * input image and the card.
   *
   * Default value is 0.02f (also recommended value). The setting is applicable
   * only when using images from Video source
   */
  inputImageMargin: number;

  /**
   * Controls which fields and images should be extracted from the card.
   *
   * Disabling extraction of unused fields can improve recognition performance
   * or reduce memory usage.
   */
  extractionSettings: ExtractionSettings;

  /**
   * Configures the image cropping settings during scanning process.
   *
   * Allows customization of cropped image handling, such as dotsPerInch,
   * extensionFactor, and whether images should be returned for the entire
   * card.
   */
  croppedImageSettings: CroppedImageSettings;

  /**
   * Represents the configurable settings for liveness detection.
   *
   * This structure defines various parameters and policies related to the
   * liveness detection process, including checks for hand presence and screen
   * analysis.
   */
  livenessSettings: LivenessSettings;

  /**
   * Represents the configurable settings for data anonymization.
   *
   * This structure defines various parameters and policies related to the
   * anonymization of sensitive data extracted from the payment cards.
   */
  anonymizationSettings: AnonymizationSettings;
};

/**
 * Represents the different levels of detection sensitivity.
 *
 * This type is used to configure detection thresholds and enable or disable
 * detection functionality. The levels range from turning detection off
 * completely to setting various levels of sensitivity (Low, Mid, High).
 */
export type DetectionLevel = "off" | "low" | "mid" | "high";

/**
 * Controls which fields and images should be extracted from the payment card.
 *
 * Disabling extraction of unused fields can improve recognition performance or
 * reduce memory usage.
 */
export type ExtractionSettings = {
  /** Whether to extract the IBAN (International Bank Account Number). */
  extractIban: boolean;

  /** Whether to extract the card expiry date. */
  extractExpiryDate: boolean;

  /** Whether to extract the cardholder name. */
  extractCardholderName: boolean;

  /**
   * Whether to extract the CVV (Card Verification Value) security code.
   *
   * Usually found on the back of the card. Required for secure transactions.
   */
  extractCvv: boolean;

  /**
   * Indicates whether card numbers that fail checksum validation should be
   * accepted.
   *
   * Card numbers are validated using the Luhn algorithm. A value of `false`
   * (default) means only card numbers that pass the checksum validation will be
   * accepted. A value of `true` means card numbers that fail checksum
   * validation will still be accepted. - This may be useful for testing
   * purposes or when processing damaged/worn cards. - The `cardNumberValid`
   * field in the result will still indicate whether the checksum passed.
   */
  extractInvalidCardNumber: boolean;
};

/* Represents the image cropping settings. */
export type CroppedImageSettings = {
  /* The DPI value for the cropped image. */
  dotsPerInch: number;
  /* The extension factor for the cropped card image. */
  extensionFactor: number;
  /**
   * Indicates whether the cropped card image should be returned.
   *
   * Provides the complete card image for record keeping or further processing.
   * Disable to reduce memory usage if image is not needed.
   */
  returnCardImage: boolean;
};

/**
 * Configuration settings for liveness detection during card scanning.
 *
 * This structure defines various parameters that control the behavior of
 * liveness detection, including thresholds for hand detection, screen and
 * photocopy analysis, and options to skip processing certain frames based on
 * liveness criteria.
 */
export type LivenessSettings = {
  /**
   * Minimum hand-to-card size ratio for valid hand detection.
   *
   * This controls how large a hand must appear in the frame relative to the
   * card to be considered valid. Lower values detect smaller/more distant
   * hands. Hand scale is calculated as a ratio between area of hand mask and
   * card mask.
   */
  handToCardSizeRatio: number;

  /**
   * Minimum overlap threshold between detected hand and card regions.
   *
   * This parameter is used to adjust heuristics that eliminate cases when the
   * hand is present in the input but it is not holding the card.
   * `handCardOverlapThreshold` is the minimal ratio of hand pixels inside the
   * frame surrounding the card and area of that frame. Only pixels inside that
   * frame are used to ignore false-positive hand segmentations inside the
   * card.
   */
  handCardOverlapThreshold: number;

  /**
   * Enables or disables the check for card held in hand.
   *
   * When `true`, the liveness detection will include a check to verify that the
   * card is being held in hand.
   */
  enableCardHeldInHandCheck: boolean;

  /**
   * Sensitivity level for detecting frames where the card is displayed on a
   * screen.
   *
   * Higher levels provide better security by being more strict in detecting
   * screen-displayed cards, but may increase false positives.
   */
  screenCheckStrictnessLevel: StrictnessLevel;

  /**
   * Sensitivity level for detecting frames where the presented card is a
   * photocopy.
   *
   * Higher levels provide better security by being more strict in detecting
   * photocopied cards, but may increase false positives.
   */
  photocopyCheckStrictnessLevel: StrictnessLevel;
};

/**
 * Defines the strictness level used by various models to control detection
 * sensitivity.
 *
 * Higher levels apply stricter validation criteria, improving security and
 * reducing false accepts (FAR), but may increase false rejects (FRR).
 *
 * Levels are ordered by increasing strictness:
 *
 * - `Disabled` turns the check off.
 * - The first active level has the lowest FRR and highest FAR.
 * - The last level has the highest FRR and lowest FAR.
 */
export type StrictnessLevel =
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
 * AnonymizationMode is used to define level of anonymization performed on
 * recognizer result.
 */
export type AnonymizationMode =
  // Anonymization will not be performed.
  | "none"
  // DocumentImage is anonymized with black boxes
  // covering sensitive data.
  | "image-only"
  // Result fields containing sensitive data are removed from result.
  | "result-fields-only"
  // This mode is combination of ImageOnly and ResultFieldsOnly modes.
  | "full-result";

/** Holds the settings which control card number anonymization. */
export type CardNumberAnonymizationSettings = {
  /** Defines the mode of card number anonymization. */
  mode: AnonymizationMode;

  /**
   * Defines how many digits at the beginning of the card number remain visible
   * after anonymization.
   */
  prefixDigitsVisible: number;

  /**
   * Defines how many digits at the end of the card number remain visible after
   * anonymization.
   */
  suffixDigitsVisible: number;
};

/** Holds the settings which control the anonymization of returned data. */
export type AnonymizationSettings = {
  /** Defines the parameters of card number anonymization. */
  cardNumberAnonymizationSettings: CardNumberAnonymizationSettings;

  /** Defines the mode of card number prefix anonymization. */
  cardNumberPrefixAnonymizationMode: AnonymizationMode;

  /** Defines the mode of CVV anonymization. */
  cvvAnonymizationMode: AnonymizationMode;

  /** Defines the mode of IBAN anonymization. */
  ibanAnonymizationMode: AnonymizationMode;

  /** Defines the mode of cardholder name anonymization. */
  cardholderNameAnonymizationMode: AnonymizationMode;
};
