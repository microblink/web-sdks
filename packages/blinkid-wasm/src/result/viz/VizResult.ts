/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { DateResult, DriverLicenceDetailedInfo } from "../../utils";
import { DependentInfo } from "../DependentInfo";
import { StringResult } from "../StringResult";

/** VizResult contains data extracted from the Visual Inspection Zone. */
export type VizResult = {
  /** The additional address information of the document owner */
  additionalAddressInformation: StringResult | null;
  /** The additional name information of the document owner */
  additionalNameInformation: StringResult | null;
  /** Additional optional address information of the document owner */
  additionalOptionalAddressInformation: StringResult | null;
  /** The additional personal identification number */
  additionalPersonalIdNumber: StringResult | null;
  /** The address of the document owner */
  address: StringResult | null;
  /** The blood type of the document owner */
  bloodType: StringResult | null;
  /** The date of birth of the document owner */
  dateOfBirth: DateResult<StringResult> | null;
  /** The date of expiry of the document */
  dateOfExpiry: DateResult<StringResult> | null;
  /** The date of issue of the document */
  dateOfIssue: DateResult<StringResult> | null;
  /** The additional number of the document */
  documentAdditionalNumber: StringResult | null;
  /** The document number */
  documentNumber: StringResult | null;
  /** Additional optional number of the document */
  documentOptionalAdditionalNumber: StringResult | null;
  /** The driver license detailed info */
  driverLicenseDetailedInfo: DriverLicenceDetailedInfo<StringResult> | null;
  /** The employer of the document owner */
  employer: StringResult | null;
  /** The father's name of the document owner */
  fathersName: StringResult | null;
  /** The first name of the document owner */
  firstName: StringResult | null;
  /** The full name of the document owner */
  fullName: StringResult | null;
  /** The issuing authority of the document */
  issuingAuthority: StringResult | null;
  /** The last name of the document owner */
  lastName: StringResult | null;
  /** The marital status of the document owner */
  maritalStatus: StringResult | null;
  /** The mother's name of the document owner */
  mothersName: StringResult | null;
  /** The nationality of the document owner */
  nationality: StringResult | null;
  /** The personal identification number */
  personalIdNumber: StringResult | null;
  /** The place of birth of the document owner */
  placeOfBirth: StringResult | null;
  /** The profession of the document owner */
  profession: StringResult | null;
  /** The race of the document owner */
  race: StringResult | null;
  /** The religion of the document owner */
  religion: StringResult | null;
  /** The residential status of the document owner */
  residentialStatus: StringResult | null;
  /** The sex of the document owner */
  sex: StringResult | null;
  /** The sponsor of the document owner */
  sponsor: StringResult | null;
  /** The visa type of the document */
  visaType: StringResult | null;
  /** The card access number of the document owner */
  cardAccessNumber: StringResult | null;
  /** The certificate number of the document owner */
  certificateNumber: StringResult | null;
  /** The country code of the document owner */
  countryCode: StringResult | null;
  /** The date of entry of the document owner */
  dateOfEntry: DateResult<StringResult> | null;
  /** The dependents info */
  dependentsInfo: DependentInfo[] | null;
  /** The transcription of the document subtype */
  documentSubtype: StringResult | null;
  /** The effective date of the document */
  effectiveDate: DateResult<StringResult> | null;
  /** The eligibility category */
  eligibilityCategory: StringResult | null;
  /** The ethnicity of the document owner */
  ethnicity: StringResult | null;
  /** The husband's name of the document owner */
  husbandName: StringResult | null;
  /** The legal status of the document owner */
  legalStatus: StringResult | null;
  /** The locality code of the document owner */
  localityCode: StringResult | null;
  /** The maiden name of the document owner */
  maidenName: StringResult | null;
  /** The manufacturing year */
  manufacturingYear: StringResult | null;
  /** The municipality code of the document owner */
  municipalityCode: StringResult | null;
  /** The municipality of registration of the document owner */
  municipalityOfRegistration: StringResult | null;
  /** The national insurance number of the document owner */
  nationalInsuranceNumber: StringResult | null;
  /** The parents info */
  parentsInfo:
    | {
        firstName: StringResult | null;
        lastName: StringResult | null;
        fullName: StringResult | null;
      }[]
    | null;
  /** The polling station code of the document owner */
  pollingStationCode: StringResult | null;
  /** The registration center code of the document owner */
  registrationCenterCode: StringResult | null;
  /** The remarks on the residence permit */
  remarks: StringResult | null;
  /** The residence permit type */
  residencePermitType: StringResult | null;
  /** The section code of the document owner */
  sectionCode: StringResult | null;
  /** The social security status of the document owner */
  socialSecurityStatus: StringResult | null;
  /** The specific document validity */
  specificDocumentValidity: StringResult | null;
  /** The state code of the document owner */
  stateCode: StringResult | null;
  /** The state of the document owner */
  stateName: StringResult | null;
  /** The vehicle owner */
  vehicleOwner: StringResult | null;
  /** The vehicle type */
  vehicleType: StringResult | null;
  /** The work restriction of the document owner */
  workRestriction: StringResult | null;
  /** Determines if date of expiry is permanent */
  dateOfExpiryPermanent: boolean;
  /** The localized name of the document owner */
  localizedName: StringResult | null;
};
