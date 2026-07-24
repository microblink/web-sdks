/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { AlphabetType } from "../utils/AlphabetType";
import { BarcodeElementKey } from "./barcode";
import { BarcodeType } from "./barcode/BarcodeData";

/*
 * An extraction status.
 */
export type ExtractionStatus = "not-extracted" | "failed" | "extracted";

/*
 * An attribute for an extraction.
 */
export type ExtractionAttribute = "optional" | "mandatory" | "blacklisted";

/*
 * A failure reason for an extraction.
 */
export type ExtractionFailureReason =
  | "character-validation"
  | "detection"
  | "parsing"
  | "decoding";

/*
 * A completeness structure for a String structure.
 */
export type StringCompleteness = {
  status: ExtractionStatus;
  attribute: ExtractionAttribute;
  failureReason?: ExtractionFailureReason;
};

/*
 * A completeness structure for a StringResult structure.
 */
export type StringResultCompleteness = {
  [key in AlphabetType]?: StringCompleteness;
};

/*
 * A completeness structure for a Date structure.
 */
export type DateCompleteness = {
  parsed: boolean;
  originalString: StringCompleteness;
};

/*
 * A completeness structure for a DateResult structure.
 */
export type DateResultCompleteness = {
  parsed: boolean;
  originalString: StringResultCompleteness;
};

/*
 * A completeness structure for a VehicleClassInfo structure.
 */
export type VehicleClassInfoCompleteness<
  S extends StringCompleteness | StringResultCompleteness,
  D extends DateCompleteness | DateResultCompleteness,
> = {
  vehicleClass?: S;
  licenceType?: S;
  effectiveDate?: D;
  expiryDate?: D;
};

/*
 * A completeness structure for a DriverLicenseDetailedInfo structure.
 */
export type DriverLicenseDetailedInfoInfo<
  S extends StringCompleteness | StringResultCompleteness,
  D extends DateCompleteness | DateResultCompleteness,
> = {
  restrictions?: S;
  endorsements?: S;
  vehicleClass?: S;
  conditions?: S;
  vehicleClassesInfo?: VehicleClassInfoCompleteness<S, D>[];
};

/*
 * A completeness structure for a BarcodeDriverLicenseDetailedInfo structure.
 */
export type BarcodeDriverLicenseDetailedInfoCompleteness =
  DriverLicenseDetailedInfoInfo<StringCompleteness, DateCompleteness>;

/*
 * A completeness structure for a DriverLicenseDetailedInfo structure.
 */
export type DriverLicenseDetailedInfoCompleteness =
  DriverLicenseDetailedInfoInfo<
    StringResultCompleteness,
    DateResultCompleteness
  >;

/*
 * A completeness structure for a DependentInfo structure.
 */
export type DependentInfoCompleteness = {
  dateOfBirth?: DateResultCompleteness;
  sex?: StringResultCompleteness;
  documentNumber?: StringResultCompleteness;
  fullName?: StringResultCompleteness;
};

/*
 * A completeness structure for a DependentsInfo structure.
 */
export type DependentsInfoCompleteness = {
  dependentsInfo?: DependentInfoCompleteness[];
};

/*
 * A completeness structure for a ParentInfo structure.
 */
export type ParentInfoCompleteness = {
  firstName?: StringResultCompleteness;
  lastName?: StringResultCompleteness;
};

/*
 * A completeness structure for a ParentsInfo structure.
 */
export type ParentsInfoCompleteness = {
  parentsInfo?: ParentInfoCompleteness[];
};

/*
 * A completeness structure for an AddressDetailedInfo structure.
 */
export type AddressDetailedInfoCompleteness = {
  street?: StringCompleteness;
  postalCode?: StringCompleteness;
  city?: StringCompleteness;
  jurisdiction?: StringCompleteness;
};

/*
 * A completeness structure for a Viz fields.
 */
export type VizFieldsCompleteness = {
  additionalAddressInformation?: StringResultCompleteness;
  additionalNameInformation?: StringResultCompleteness;
  additionalOptionalAddressInformation?: StringResultCompleteness;
  additionalPersonalIdNumber?: StringResultCompleteness;
  address?: StringResultCompleteness;
  bloodType?: StringResultCompleteness;
  dateOfBirth?: DateResultCompleteness;
  dateOfExpiry?: DateResultCompleteness;
  dateOfIssue?: DateResultCompleteness;
  documentAdditionalNumber?: StringResultCompleteness;
  documentNumber?: StringResultCompleteness;
  documentOptionalAdditionalNumber?: StringResultCompleteness;
  driverLicenseDetailedInfo?: DriverLicenseDetailedInfoCompleteness;
  employer?: StringResultCompleteness;
  fathersName?: StringResultCompleteness;
  firstName?: StringResultCompleteness;
  fullName?: StringResultCompleteness;
  issuingAuthority?: StringResultCompleteness;
  lastName?: StringResultCompleteness;
  maritalStatus?: StringResultCompleteness;
  mothersName?: StringResultCompleteness;
  nationality?: StringResultCompleteness;
  personalIdNumber?: StringResultCompleteness;
  placeOfBirth?: StringResultCompleteness;
  profession?: StringResultCompleteness;
  race?: StringResultCompleteness;
  religion?: StringResultCompleteness;
  residentialStatus?: StringResultCompleteness;
  sex?: StringResultCompleteness;
  sponsor?: StringResultCompleteness;
  visaType?: StringResultCompleteness;
  cardAccessNumber?: StringResultCompleteness;
  certificateNumber?: StringResultCompleteness;
  countryCode?: StringResultCompleteness;
  dateOfEntry?: DateResultCompleteness;
  dependentsInfo?: DependentsInfoCompleteness;
  documentSubtype?: StringResultCompleteness;
  effectiveDate?: DateResultCompleteness;
  eligibilityCategory?: StringResultCompleteness;
  ethnicity?: StringResultCompleteness;
  husbandName?: StringResultCompleteness;
  legalStatus?: StringResultCompleteness;
  localityCode?: StringResultCompleteness;
  maidenName?: StringResultCompleteness;
  manufacturingYear?: StringResultCompleteness;
  municipalityCode?: StringResultCompleteness;
  municipalityOfRegistration?: StringResultCompleteness;
  nationalInsuranceNumber?: StringResultCompleteness;
  parentsInfo?: ParentsInfoCompleteness;
  pollingStationCode?: StringResultCompleteness;
  registrationCenterCode?: StringResultCompleteness;
  remarks?: StringResultCompleteness;
  residencePermitType?: StringResultCompleteness;
  sectionCode?: StringResultCompleteness;
  socialSecurityStatus?: StringResultCompleteness;
  specificDocumentValidity?: StringResultCompleteness;
  stateCode?: StringResultCompleteness;
  stateName?: StringResultCompleteness;
  vehicleOwner?: StringResultCompleteness;
  vehicleType?: StringResultCompleteness;
  workRestriction?: StringResultCompleteness;
  localizedName?: StringResultCompleteness;
};

/*
 * A completeness structure for a Mrz fields.
 */
export type MrzFieldsCompleteness = {
  rawMRZString: StringCompleteness;
  documentNumber: StringCompleteness;
  documentCode: StringCompleteness;
  issuer: StringCompleteness;
  opt1: StringCompleteness;
  opt2: StringCompleteness;
  gender: StringCompleteness;
  nationality: StringCompleteness;
  primaryId: StringCompleteness;
  secondaryId: StringCompleteness;
  issuerName: StringCompleteness;
  nationalityName: StringCompleteness;
  dateOfBirth: DateResultCompleteness;
  dateOfExpiry: DateResultCompleteness;
};

/*
 * A completeness structure for a Barcode fields.
 */
export type BarcodeFieldsCompleteness = {
  firstName?: StringCompleteness;
  middleName?: StringCompleteness;
  lastName?: StringCompleteness;
  fullName?: StringCompleteness;
  additionalNameInformation?: StringCompleteness;

  address?: StringCompleteness;
  placeOfBirth?: StringCompleteness;
  nationality?: StringCompleteness;

  race?: StringCompleteness;
  religion?: StringCompleteness;
  profession?: StringCompleteness;
  maritalStatus?: StringCompleteness;
  residentialStatus?: StringCompleteness;
  employer?: StringCompleteness;
  sex?: StringCompleteness;

  dateOfBirth?: DateCompleteness;
  dateOfIssue?: DateCompleteness;
  dateOfExpiry?: DateCompleteness;

  documentNumber?: StringCompleteness;
  personalIdNumber?: StringCompleteness;
  documentAdditionalNumber?: StringCompleteness;
  issuingAuthority?: StringCompleteness;

  addressDetailedInfo?: AddressDetailedInfoCompleteness;
  driverLicenseDetailedInfo?: BarcodeDriverLicenseDetailedInfoCompleteness;
  extendedElements?: BarcodeElementKey[];
};

/*
 * A completeness structure for an image structure.
 */
export type ImageCompleteness = {
  status: ExtractionStatus;
  attribute: ExtractionAttribute;
  failureReason?: ExtractionFailureReason;
};

/*
 * A completeness structure for a Viz result structure.
 */
export type VizCompleteness = {
  attribute: ExtractionAttribute;
  fields?: VizFieldsCompleteness;
};

/*
 * A completeness structure for a Mrz result structure.
 */
export type MrzCompleteness = {
  status: ExtractionStatus;
  attribute: ExtractionAttribute;
  failureReason?: ExtractionFailureReason;
  fields?: MrzFieldsCompleteness;
  verified: boolean;
};

/*
 * A completeness structure for a barcode result structure.
 */
export type BarcodeCompleteness = {
  status: ExtractionStatus;
  attribute: ExtractionAttribute;
  failureReason?: ExtractionFailureReason;
  fields?: BarcodeFieldsCompleteness;
  parsed: boolean;
  parsingSupported: boolean;
  barcodeType?: BarcodeType;
};

/**
 * Represents the completeness of the extraction process for a scanned document.
 *
 * This structure tracks the status of the scanning process and indicates
 * whether specific components of the document, such as the specific fields from
 * the VIZ, MRZ, and barcode, have been successfully extracted.
 */
export type ResultCompleteness = {
  /** Rich per-module completeness for VIZ side results. */
  viz: (VizCompleteness | null)[] | undefined;

  /** Rich completeness for MRZ extraction. */
  mrz: MrzCompleteness | undefined;

  /** Rich completeness for barcode extraction. */
  barcode: BarcodeCompleteness | undefined;

  /** Rich completeness for face image extraction. */
  faceImage: ImageCompleteness | undefined;

  /** Rich completeness for signature image extraction. */
  signatureImage: ImageCompleteness | undefined;

  /** Rich completeness for barcode image extraction. */
  barcodeImage: ImageCompleteness | undefined;

  /** Rich completeness for document image extraction. */
  documentImages: ImageCompleteness[] | undefined;
};
