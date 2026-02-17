/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { Country, DocumentType, Region } from "../result";

/** Represents the document filter. */
export type DocumentFilter = {
  /**
   * If set, only specified country will pass the filter criteria. Otherwise,
   * issuing country will not be taken into account.
   */
  country?: Country;

  /**
   * If set, only specified country will pass the filter criteria. Otherwise,
   * issuing region will not be taken into account.
   */
  region?: Region;

  /**
   * If set, only specified type will pass the filter criteria. Otherwise,
   * issuing type will not be taken into account.
   */
  type?: DocumentType;
};
