/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/** Represents the state of the data match. */
export type DataMatchState = "not-performed" | "failed" | "success";

/** Represents the type of the field used in data match. */
export type DataMatchFieldType =
  | "date-of-birth"
  | "date-of-expiry"
  | "document-number"
  | "document-additional-number"
  | "document-optional-additional-number"
  | "personal-id-number";

/** Represents the state of the data match per field. */
export type DataMatchFieldState = {
  /** Represents the type of the field used in data match. */
  fieldType: DataMatchFieldType;
  /** Represents the state of the data match on the specified field. */
  state: DataMatchState;
};

/** Represents the result of the data match algorithm. */
export type DataMatchResult = {
  /** Info on whether the data extracted from multiple sides matches */
  statePerField: DataMatchFieldState[];
  /** The overall state of the data match. */
  overallState: DataMatchState;
};
