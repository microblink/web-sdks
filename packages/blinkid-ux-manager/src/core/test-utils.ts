/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import {
  Country,
  DocumentClassInfo,
  DocumentType,
  Region,
} from "@microblink/blinkid-core";

export const createDocumentClassInfo = ({
  type = undefined,
  country = undefined,
  region = undefined,
  countryName = "",
  isoNumericCountryCode = "",
  isoAlpha2CountryCode = "",
  isoAlpha3CountryCode = "",
}: {
  type?: DocumentType | undefined;
  country?: Country | undefined;
  region?: Region | undefined;
  countryName?: string;
  isoNumericCountryCode?: string;
  isoAlpha2CountryCode?: string;
  isoAlpha3CountryCode?: string;
}): DocumentClassInfo => {
  return {
    type,
    country,
    region,
    countryName,
    isoNumericCountryCode,
    isoAlpha2CountryCode,
    isoAlpha3CountryCode,
  };
};
