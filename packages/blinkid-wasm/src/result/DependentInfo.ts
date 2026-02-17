/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { StringResult } from "./StringResult";
import { DateResult } from "../utils";

/** The additional information on the document owner's dependents. */
export type DependentInfo = {
  /** The date of birth of the dependent */
  dateOfBirth?: DateResult<StringResult>;

  /** The sex or gender of the dependent */
  sex?: StringResult;

  /** The document number of the dependent */
  documentNumber?: StringResult;

  /** The full name of the dependent */
  fullName?: StringResult;
};
