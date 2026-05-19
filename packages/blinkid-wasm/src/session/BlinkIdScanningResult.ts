/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import {
  DataMatchResult,
  DependentInfo,
  DocumentClassInfo,
  ScanningSide,
  SingleSideScanningResult,
  StringResult,
} from "../result";
import { DateResult, DriverLicenceDetailedInfo } from "../utils";

/** Represents the final complete result of the scanning process. */
export type BlinkIdScanningResult = {
  /** The document class information */
  documentClassInfo: DocumentClassInfo;

  /** Info on whether the data extracted from multiple sides matches */
  dataMatchResult: DataMatchResult | undefined;

  /** The additional address information of the document owner */
  additionalAddressInformation: StringResult | undefined;
  /** The additional name information of the document owner */
  additionalNameInformation: StringResult | undefined;
  /** Additional optional address information of the document owner */
  additionalOptionalAddressInformation: StringResult | undefined;
  /** The additional personal identification number */
  additionalPersonalIdNumber: StringResult | undefined;
  /** The address of the document owner */
  address: StringResult | undefined;
  /** The blood type of the document owner */
  bloodType: StringResult | undefined;
  /**
   * Numeric code used to establish secure electronic access to the embedded
   * contactless chip.
   */
  cardAccessNumber: StringResult | undefined;
  /** The certificate number of the document owner */
  certificateNumber: StringResult | undefined;
  /** The country code of the document owner */
  countryCode: StringResult | undefined;
  /** The date of birth of the document owner */
  dateOfBirth: DateResult<StringResult> | undefined;
  /** The date of entry of the document owner */
  dateOfEntry: DateResult<StringResult> | undefined;
  /** The date of expiry of the document */
  dateOfExpiry: DateResult<StringResult> | undefined;
  /** The date of issue of the document */
  dateOfIssue: DateResult<StringResult> | undefined;
  /** The dependents info */
  dependentsInfo: DependentInfo[] | undefined;
  /** The additional number of the document */
  documentAdditionalNumber: StringResult | undefined;
  /** The document number */
  documentNumber: StringResult | undefined;
  /** Additional optional number of the document */
  documentOptionalAdditionalNumber: StringResult | undefined;
  /** The document subtype transcription */
  documentSubtype: StringResult | undefined;
  /** The driver license detailed info */
  driverLicenseDetailedInfo:
    | DriverLicenceDetailedInfo<StringResult>
    | undefined;
  /** The effective date of the document */
  effectiveDate: DateResult<StringResult> | undefined;
  /** The eligibility category */
  eligibilityCategory: StringResult | undefined;
  /** The employer of the document owner */
  employer: StringResult | undefined;
  /** The father's name of the document owner */
  fathersName: StringResult | undefined;
  /** The first name of the document owner */
  firstName: StringResult | undefined;
  /** The full name of the document owner */
  fullName: StringResult | undefined;
  /** The husband name of the document owner */
  husbandName: StringResult | undefined;
  /** The issuing authority of the document */
  issuingAuthority: StringResult | undefined;
  /** The last name of the document owner */
  lastName: StringResult | undefined;
  /** The legal status of the document owner */
  legalStatus: StringResult | undefined;
  /** The locality code of the document owner */
  localityCode: StringResult | undefined;
  /** The maiden name of the document owner */
  maidenName: StringResult | undefined;
  /** The manufacturing year */
  manufacturingYear: StringResult | undefined;
  /** The marital status of the document owner */
  maritalStatus: StringResult | undefined;
  /** The mother's name of the document owner */
  mothersName: StringResult | undefined;
  /** The municipality code of the document owner */
  municipalityCode: StringResult | undefined;
  /** The municipality of registration of the document owner */
  municipalityOfRegistration: StringResult | undefined;
  /** The national insurance number of the document owner */
  nationalInsuranceNumber: StringResult | undefined;
  /** The nationality of the document owner */
  nationality: StringResult | undefined;
  /** The parents info */
  parentsInfo:
    | {
        firstName: StringResult | undefined;
        lastName: StringResult | undefined;
      }[]
    | undefined;
  /** The personal identification number */
  personalIdNumber: StringResult | undefined;
  /** The place of birth of the document owner */
  placeOfBirth: StringResult | undefined;
  /** The polling station code of the document owner */
  pollingStationCode: StringResult | undefined;
  /** The profession of the document owner */
  profession: StringResult | undefined;
  /** The race of the document owner */
  race: StringResult | undefined;
  /** The registration center code of the document owner */
  registrationCenterCode: StringResult | undefined;
  /** The religion of the document owner */
  religion: StringResult | undefined;
  /** The remarks on the residence permit */
  remarks: StringResult | undefined;
  /** The residence permit type */
  residencePermitType: StringResult | undefined;
  /** The residential status of the document owner */
  residentialStatus: StringResult | undefined;
  /** The section code of the document owner */
  sectionCode: StringResult | undefined;
  /** The sex of the document owner */
  sex: StringResult | undefined;
  /** The social security status of the document owner */
  socialSecurityStatus: StringResult | undefined;
  /** The specific document validity */
  specificDocumentValidity: StringResult | undefined;
  /** The sponsor of the document owner. */
  sponsor: StringResult | undefined;
  /** The state code of the document owner */
  stateCode: StringResult | undefined;
  /** The state of the document owner */
  stateName: StringResult | undefined;
  /** The vehicle owner */
  vehicleOwner: StringResult | undefined;
  /** The vehicle type */
  vehicleType: StringResult | undefined;
  /** The visa type of the document */
  visaType: StringResult | undefined;
  /** The work restriction of the document owner */
  workRestriction: StringResult | undefined;
  /** Determines if date of expiry is permanent */
  dateOfExpiryPermanent: boolean | undefined;
  /** The localized name of the document owner */
  localizedName: StringResult | undefined;

  /** Scanning sides matching input image indexes in `subResults`. */
  inputImagesScanningSide: ScanningSide[] | undefined;

  /** Scanning sides matching document image indexes in `subResults`. */
  documentImagesScanningSide: ScanningSide[] | undefined;

  /** Scanning side matching the returned face image. */
  faceImageScanningSide: ScanningSide | undefined;

  /** Scanning side matching the returned signature image. */
  signatureImageScanningSide: ScanningSide | undefined;

  /** Scanning side matching the returned barcode image. */
  barcodeImageScanningSide: ScanningSide | undefined;

  /** The results of scanning each side of the document */
  subResults: SingleSideScanningResult[];
};
