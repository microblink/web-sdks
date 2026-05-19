/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * RedactionMode is used to define level of redaction performed on recognizer
 * result.
 */
export type RedactionMode =
  /** Redaction will not be performed. */
  | "none"
  /** DocumentImage is redacted with black boxes covering sensitive data. */
  | "image-only"
  /** Result fields containing sensitive data are removed from result. */
  | "result-fields-only"
  /** This mode is combination of ImageOnly and ResultFieldsOnly modes. */
  | "full-result";
