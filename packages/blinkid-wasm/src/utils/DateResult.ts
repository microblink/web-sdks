/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { StringResult } from "../result";

/**
 * Smart date result structure.
 *
 * @template S - The type of the string result.
 */
export type DateResult<S extends string | StringResult> = {
  /** Day in month [1-31] */
  day?: number;
  /** Month in year [1-12] */
  month?: number;
  /** Four digit year */
  year?: number;
  /** Original date time string */
  originalString?: S;
  /**
   * Indicates whether this Date object is filled by internal domain knowledge.
   * If it is, successfullyParsed flag is set to false and originalString is set
   * to empty.
   */
  filledByDomainKnowledge: boolean;
  /** Indicates whether this Date object is successfully parsed from string. */
  successfullyParsed?: boolean;
};
