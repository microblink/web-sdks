/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import {
  Country,
  DocumentClassComponent,
  DocumentClassInfo,
  DocumentType,
  Region,
} from "@microblink/blinkid-core";

/**
 * Wraps a plain classification value into a document class component,
 * deriving `rawValue` in the document-knowledge-DB format (e.g.
 * "bosnia-and-herzegovina" -> "BOSNIA AND HERZEGOVINA").
 */
const toComponent = <TId extends string>(
  id: TId | undefined,
): DocumentClassComponent<TId> | undefined =>
  id === undefined
    ? undefined
    : { id, rawValue: id.toUpperCase().replaceAll("-", " ") };

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
    documentType: toComponent(type),
    country: toComponent(country),
    region: toComponent(region),
    countryName,
    isoNumericCountryCode,
    isoAlpha2CountryCode,
    isoAlpha3CountryCode,
  };
};
