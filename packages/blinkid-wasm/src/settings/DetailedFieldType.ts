/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { AlphabetType } from "../utils";
import { FieldType } from "../result";

/** Represents the detailed field type. */
export type DetailedFieldType = {
  /** The field type. */
  fieldType: FieldType;
  /** The alphabet type. */
  alphabetType: AlphabetType;
};
