/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { Country } from "./Country";
import { DocumentType } from "./DocumentType";
import { Region } from "./Region";

/**
 * A single document classification component.
 *
 * `id` is present when the classification maps to a value known at build time.
 * `rawValue` always carries the raw classification token from the document
 * knowledge database, including OTA-delivered classes unknown at build time.
 */
export type DocumentClassComponent<TId extends string> = {
  /** Strongly-typed identifier, when known at build time. */
  id?: TId;

  /** Raw classification value (document knowledge database format). */
  rawValue: string;
};

/** The document country classification. */
export type DocumentClassCountry = DocumentClassComponent<Country>;

/** The document region classification. */
export type DocumentClassRegion = DocumentClassComponent<Region>;

/** The document type classification. */
export type DocumentClassDocumentType = DocumentClassComponent<DocumentType>;

/** Represents the document class information. */
export type DocumentClassInfo = {
  /** The document country. */
  country: DocumentClassCountry | undefined;

  /** The document region. */
  region: DocumentClassRegion | undefined;

  /** The type of the scanned document. */
  documentType: DocumentClassDocumentType | undefined;

  /** The name of the country that issued the scanned document. */
  countryName?: string;

  /** The ISO numeric code of the country that issued the scanned document. */
  isoNumericCountryCode?: string;

  /** The 2-letter ISO code of the country that issued the scanned document. */
  isoAlpha2CountryCode?: string;

  /** The 3-letter ISO code of the country that issued the scanned document. */
  isoAlpha3CountryCode?: string;
};
