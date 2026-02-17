/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { DetailedFieldType } from "./DetailedFieldType";
import { DocumentFilter } from "./DocumentFilter";

/** Represents the document rules. */
export type DocumentRules = {
  /**
   * Specified fields will overrule our document class field rules if filter
   * conditions are met.
   */
  documentFilter?: DocumentFilter;

  /** Fields to overrule our class field rules. */
  fields: DetailedFieldType[];
};
