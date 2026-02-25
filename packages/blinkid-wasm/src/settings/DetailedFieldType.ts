/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { FieldType } from "../result";
import { AlphabetType } from "../utils";

/** Represents the detailed field type. */
export type DetailedFieldType = {
  /** The field type. */
  fieldType: FieldType;
  /** The alphabet type. */
  alphabetType: AlphabetType;
};
