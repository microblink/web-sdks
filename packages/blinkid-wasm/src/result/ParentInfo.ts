/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { StringResult } from "./StringResult";

/** The information about the document owner's parents. */
export type ParentInfo = {
  /** The first name of one of the document owner's parents */
  firstName?: StringResult;
  /** The last name of one of the document owner's parents. */
  lastName?: StringResult;
};
