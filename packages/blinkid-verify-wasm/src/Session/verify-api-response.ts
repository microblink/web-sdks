/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/**
 * BlinkID Verify API v3 response types generated from scripts/verify-api/current.v3.cloud.verify.schema.json.
 *
 * Do not edit. Run `pnpm generate:verify-api-types` in `packages/blinkid-verify-wasm` to regenerate.
 */

export type VerifyApiV3ValidationErrorCode = VerifyApiV3ValidationErrorCodeEnum | VerifyApiOpenEnumValue;

export interface VerifyApiV3ValidationError {
  code: VerifyApiV3ValidationErrorCode;
  path: string;
  reason: string;
  relatedPaths?: string[];
}

export interface VerifyApiV3ValidationErrorResponse {
  message?: string;
  errors?: VerifyApiV3ValidationError[];
}

export interface VerifyApiV3ErrorResponse {
  message: string;
}

export interface VerifyApiV3WorkerErrorResponse {
  message: string;
  reason: string;
}

export type VerifyApiExtractionPipelineStageStatus =
  | VerifyApiExtractionPipelineStageStatusEnum
  | VerifyApiOpenEnumValue;

export interface VerifyApiExtractionPipelineStage {
  status: VerifyApiExtractionPipelineStageStatus;
}

export type VerifyApiVerificationPipelineStageStatus =
  | VerifyApiVerificationPipelineStageStatusEnum
  | VerifyApiOpenEnumValue;

export interface VerifyApiVerificationPipelineStage {
  status: VerifyApiVerificationPipelineStageStatus;
}

export interface VerifyApiPipeline {
  extraction: VerifyApiExtractionPipelineStage;
  verification: VerifyApiVerificationPipelineStage;
}

export interface VerifyApiResponseMessage {
  code: string;
  message: string;
}

export type VerifyApiVerdict = VerifyApiVerdictEnum | VerifyApiOpenEnumValue;

export type VerifyApiTieredMultiSideCheck = VerifyApiTieredCheck & {
  firstSide?: VerifyApiTieredCheck;
  secondSide?: VerifyApiTieredCheck;
};

export type VerifyApiDataMatchChecks = VerifyApiTieredCheck & {
  firstNameCheck?: VerifyApiCheck;
  lastNameCheck?: VerifyApiCheck;
  fullNameCheck?: VerifyApiCheck;
  additionalNameInformationCheck?: VerifyApiCheck;
  localizedNameCheck?: VerifyApiCheck;
  fathersNameCheck?: VerifyApiCheck;
  mothersNameCheck?: VerifyApiCheck;
  addressCheck?: VerifyApiCheck;
  additionalAddressInformationCheck?: VerifyApiCheck;
  additionalOptionalAddressInformationCheck?: VerifyApiCheck;
  placeOfBirthCheck?: VerifyApiCheck;
  nationalityCheck?: VerifyApiCheck;
  raceCheck?: VerifyApiCheck;
  religionCheck?: VerifyApiCheck;
  professionCheck?: VerifyApiCheck;
  maritalStatusCheck?: VerifyApiCheck;
  residentialStatusCheck?: VerifyApiCheck;
  employerCheck?: VerifyApiCheck;
  sexCheck?: VerifyApiCheck;
  dateOfBirthCheck?: VerifyApiCheck;
  dateOfIssueCheck?: VerifyApiCheck;
  dateOfExpiryCheck?: VerifyApiCheck;
  documentNumberCheck?: VerifyApiCheck;
  personalIdNumberCheck?: VerifyApiCheck;
  documentAdditionalNumberCheck?: VerifyApiCheck;
  documentOptionalAdditionalNumberCheck?: VerifyApiCheck;
  additionalPersonalIdNumberCheck?: VerifyApiCheck;
  issuingAuthorityCheck?: VerifyApiCheck;
};

export type VerifyApiBarcodeAuthenticityChecks = VerifyApiTieredCheck & {
  readCheck?: VerifyApiCheck;
  contentCheck?: VerifyApiCheck;
};

export type VerifyApiDocumentLivenessChecks = VerifyApiTieredCheck & {
  screenPresenceCheck?: VerifyApiTieredMultiSideCheck;
  photocopyCheck?: VerifyApiTieredMultiSideCheck;
};

export type VerifyApiVisualChecks = VerifyApiTieredCheck & {
  portraitForgeryCheck?: VerifyApiTieredCheck;
  securityFeaturesCheck?: VerifyApiCheck;
  generativeAiCheck?: VerifyApiTieredMultiSideCheck;
};

export type VerifyApiPassesAtOrBelowSensitivity = VerifyApiPassesAtOrBelowSensitivityEnum | VerifyApiOpenEnumValue;

export type VerifyApiTieredCheck = VerifyApiCheck & {
  passesAtOrBelowSensitivity: VerifyApiPassesAtOrBelowSensitivity;
};

export type VerifyApiMultiSideCheck = VerifyApiCheck & {
  firstSide?: VerifyApiCheck;
  secondSide?: VerifyApiCheck;
};

export type VerifyApiDateLogicChecks = VerifyApiCheck & {
  dateOfBirthBeforeDateOfIssueCheck?: VerifyApiCheck;
  dateOfBirthBeforeDateOfExpiryCheck?: VerifyApiCheck;
  dateOfIssueBeforeDateOfExpiryCheck?: VerifyApiCheck;
  dateOfBirthInPastCheck?: VerifyApiCheck;
  dateOfIssueInPastCheck?: VerifyApiCheck;
};

export type VerifyApiDataLogicChecks = VerifyApiCheck & {
  dateLogicCheck?: VerifyApiDateLogicChecks;
  documentNumberCheck?: VerifyApiCheck;
  personalIdNumberCheck?: VerifyApiCheck;
  documentDiscriminatorCheck?: VerifyApiCheck;
  customerIdNumberCheck?: VerifyApiCheck;
  inventoryControlNumberCheck?: VerifyApiCheck;
};

export type VerifyApiDataFormatChecks = VerifyApiCheck & {
  dateOfBirthCheck?: VerifyApiCheck;
  dateOfExpiryCheck?: VerifyApiCheck;
  dateOfIssueCheck?: VerifyApiCheck;
  documentNumberCheck?: VerifyApiCheck;
  documentAdditionalNumberCheck?: VerifyApiCheck;
  documentOptionalAdditionalNumberCheck?: VerifyApiCheck;
  personalIdNumberCheck?: VerifyApiCheck;
  additionalPersonalIdNumberCheck?: VerifyApiCheck;
  sexCheck?: VerifyApiCheck;
  nationalityCheck?: VerifyApiCheck;
  issuingAuthorityCheck?: VerifyApiCheck;
  maritalStatusCheck?: VerifyApiCheck;
  religionCheck?: VerifyApiCheck;
  classEffectiveDateCheck?: VerifyApiCheck;
  classExpiryDateCheck?: VerifyApiCheck;
};

export type VerifyApiMrzChecks = VerifyApiCheck & {
  parsedCheck?: VerifyApiCheck;
  checkDigitsCheck?: VerifyApiCheck;
};

export type VerifyApiGenericDataCheck = VerifyApiCheck & {
  genericNumberCheck?: VerifyApiCheck;
  genericStringCheck?: VerifyApiCheck;
};

export type VerifyApiDocumentValidityChecks = VerifyApiCheck & {
  expiredCheck?: VerifyApiCheck;
  discontinuedDocumentCheck?: VerifyApiCheck;
};

export type VerifyApiInjectionAttackChecks = VerifyApiCheck & {
  sdkPayloadIntegrityCheck?: VerifyApiCheck;
};

export type VerifyApiCheckResult = VerifyApiCheckResultEnum | VerifyApiOpenEnumValue;

export interface VerifyApiCheck {
  result: VerifyApiCheckResult;
}

export type VerifyApiExtractedDataChecks = VerifyApiCheck & {
  matchCheck?: VerifyApiDataMatchChecks;
  logicCheck?: VerifyApiDataLogicChecks;
  formatCheck?: VerifyApiDataFormatChecks;
  barcodeAuthenticityCheck?: VerifyApiBarcodeAuthenticityChecks;
  mrzCheck?: VerifyApiMrzChecks;
  genericDataCheck?: VerifyApiGenericDataCheck;
};

export interface VerifyApiDocumentChecks {
  extractedDataCheck?: VerifyApiExtractedDataChecks;
  documentLivenessCheck?: VerifyApiDocumentLivenessChecks;
  visualCheck?: VerifyApiVisualChecks;
  documentValidityCheck?: VerifyApiDocumentValidityChecks;
  injectionAttackCheck?: VerifyApiInjectionAttackChecks;
}

export interface VerifyApiVerificationResult {
  verdict: VerifyApiVerdict;
  failedChecks: string[];
  checks?: VerifyApiDocumentChecks;
}

export interface VerifyApiImageAssessment {
  imageQualityCheck?: VerifyApiCheck;
  croppedDocumentCheck?: VerifyApiMultiSideCheck;
  handPresenceCheck?: VerifyApiMultiSideCheck;
}

export type VerifyApiProcessingStatus = VerifyApiProcessingStatusEnum | VerifyApiOpenEnumValue;

export type VerifyApiVizResult = VerifyApiScanningDataResult & object;

export interface VerifyApiAlphabetString {
  latin?: string;
  arabic?: string;
  cyrillic?: string;
  greek?: string;
}

export interface VerifyApiDateResult {
  /** @format int32 */
  day?: number;
  /** @format int32 */
  month?: number;
  /** @format int32 */
  year?: number;
  filledByDomainKnowledge?: boolean;
  originalString?: VerifyApiAlphabetString;
  successfullyParsed?: boolean;
}

export interface VerifyApiDependentInfo {
  dateOfBirth?: VerifyApiDateResult;
  documentNumber?: VerifyApiAlphabetString;
  fullName?: VerifyApiAlphabetString;
  sex?: VerifyApiAlphabetString;
}

export interface VerifyApiVehicleClassInfo {
  effectiveDate?: VerifyApiDateResult;
  expiryDate?: VerifyApiDateResult;
  vehicleClass?: VerifyApiAlphabetString;
}

export interface VerifyApiDriverLicenceDetailedInfo {
  conditions?: VerifyApiAlphabetString;
  endorsements?: VerifyApiAlphabetString;
  restrictions?: VerifyApiAlphabetString;
  vehicleClass?: VerifyApiAlphabetString;
  vehicleClassesInfo?: VerifyApiVehicleClassInfo[];
}

export interface VerifyApiParentInfo {
  firstName?: VerifyApiAlphabetString;
  lastName?: VerifyApiAlphabetString;
  fullName?: VerifyApiAlphabetString;
}

export interface VerifyApiScanningDataResult {
  additionalAddressInformation?: VerifyApiAlphabetString;
  additionalNameInformation?: VerifyApiAlphabetString;
  additionalOptionalAddressInformation?: VerifyApiAlphabetString;
  additionalPersonalIdNumber?: VerifyApiAlphabetString;
  address?: VerifyApiAlphabetString;
  bloodType?: VerifyApiAlphabetString;
  cardAccessNumber?: VerifyApiAlphabetString;
  certificateNumber?: VerifyApiAlphabetString;
  countryCode?: VerifyApiAlphabetString;
  dateOfBirth?: VerifyApiDateResult;
  dateOfEntry?: VerifyApiDateResult;
  dateOfExpiry?: VerifyApiDateResult;
  dateOfExpiryPermanent?: boolean;
  dateOfIssue?: VerifyApiDateResult;
  dependentsInfo?: VerifyApiDependentInfo[];
  documentAdditionalNumber?: VerifyApiAlphabetString;
  documentNumber?: VerifyApiAlphabetString;
  documentOptionalAdditionalNumber?: VerifyApiAlphabetString;
  documentSubtype?: VerifyApiAlphabetString;
  driverLicenseDetailedInfo?: VerifyApiDriverLicenceDetailedInfo;
  effectiveDate?: VerifyApiDateResult;
  eligibilityCategory?: VerifyApiAlphabetString;
  employer?: VerifyApiAlphabetString;
  ethnicity?: VerifyApiAlphabetString;
  fathersName?: VerifyApiAlphabetString;
  firstName?: VerifyApiAlphabetString;
  fullName?: VerifyApiAlphabetString;
  husbandName?: VerifyApiAlphabetString;
  issuingAuthority?: VerifyApiAlphabetString;
  lastName?: VerifyApiAlphabetString;
  legalStatus?: VerifyApiAlphabetString;
  localityCode?: VerifyApiAlphabetString;
  localizedName?: VerifyApiAlphabetString;
  maidenName?: VerifyApiAlphabetString;
  manufacturingYear?: VerifyApiAlphabetString;
  maritalStatus?: VerifyApiAlphabetString;
  mothersName?: VerifyApiAlphabetString;
  municipalityCode?: VerifyApiAlphabetString;
  municipalityOfRegistration?: VerifyApiAlphabetString;
  nationalInsuranceNumber?: VerifyApiAlphabetString;
  nationality?: VerifyApiAlphabetString;
  parentsInfo?: VerifyApiParentInfo[];
  passportNumber?: VerifyApiAlphabetString;
  personalIdNumber?: VerifyApiAlphabetString;
  placeOfBirth?: VerifyApiAlphabetString;
  pollingStationCode?: VerifyApiAlphabetString;
  profession?: VerifyApiAlphabetString;
  race?: VerifyApiAlphabetString;
  registrationCenterCode?: VerifyApiAlphabetString;
  religion?: VerifyApiAlphabetString;
  remarks?: VerifyApiAlphabetString;
  residencePermitType?: VerifyApiAlphabetString;
  residentialStatus?: VerifyApiAlphabetString;
  sectionCode?: VerifyApiAlphabetString;
  sex?: VerifyApiAlphabetString;
  socialSecurityStatus?: VerifyApiAlphabetString;
  specificDocumentValidity?: VerifyApiAlphabetString;
  sponsor?: VerifyApiAlphabetString;
  stateCode?: VerifyApiAlphabetString;
  stateName?: VerifyApiAlphabetString;
  trafficParticipantNumber?: VerifyApiAlphabetString;
  vehicleNumber?: VerifyApiAlphabetString;
  vehicleOwner?: VerifyApiAlphabetString;
  vehicleType?: VerifyApiAlphabetString;
  visaType?: VerifyApiAlphabetString;
  workRestriction?: VerifyApiAlphabetString;
}

export interface VerifyApiSimpleDateResult {
  /** @format int32 */
  day?: number;
  /** @format int32 */
  month?: number;
  /** @format int32 */
  year?: number;
  filledByDomainKnowledge?: boolean;
  originalString?: string;
  successfullyParsed?: boolean;
}

export type VerifyApiMrtdDocumentType = VerifyApiMrtdDocumentTypeEnum | VerifyApiOpenEnumValue;

export interface VerifyApiMrzResult {
  dateOfBirth?: VerifyApiSimpleDateResult;
  dateOfExpiry?: VerifyApiSimpleDateResult;
  documentCode?: string;
  documentNumber?: string;
  documentType?: VerifyApiMrtdDocumentType;
  gender?: string;
  issuer?: string;
  issuerName?: string;
  nationality?: string;
  nationalityName?: string;
  opt1?: string;
  opt2?: string;
  primaryId?: string;
  rawMrzString?: string;
  sanitizedDocumentCode?: string;
  sanitizedDocumentNumber?: string;
  sanitizedIssuer?: string;
  sanitizedNationality?: string;
  sanitizedOpt1?: string;
  sanitizedOpt2?: string;
  secondaryId?: string;
  verified?: boolean;
}

export interface VerifyApiAddressDetailedInfo {
  city?: string;
  jurisdiction?: string;
  postalCode?: string;
  street?: string;
}

export interface VerifyApiBarcodeData {
  barcodeType?: string;
  uncertain?: boolean;
  rawData?: string;
  stringData?: string;
}

export interface VerifyApiBarcodeVehicleClassInfo {
  effectiveDate?: VerifyApiSimpleDateResult;
  expiryDate?: VerifyApiSimpleDateResult;
  vehicleClass?: string;
}

export interface VerifyApiBarcodeDriverLicenceDetailedInfo {
  conditions?: string;
  endorsements?: string;
  restrictions?: string;
  vehicleClass?: string;
  vehicleClassesInfo?: VerifyApiBarcodeVehicleClassInfo[];
}

export type VerifyApiBarcodeElementKey = VerifyApiBarcodeElementKeyEnum | VerifyApiOpenEnumValue;

export interface VerifyApiBarcodeExtendedElement {
  key: VerifyApiBarcodeElementKey;
  value: string;
}

export interface VerifyApiBarcodeResult {
  additionalNameInformation?: string;
  address?: string;
  addressDetailedInfo?: VerifyApiAddressDetailedInfo;
  barcodeData?: VerifyApiBarcodeData;
  dateOfBirth?: VerifyApiSimpleDateResult;
  dateOfExpiry?: VerifyApiSimpleDateResult;
  dateOfIssue?: VerifyApiSimpleDateResult;
  documentAdditionalNumber?: string;
  documentNumber?: string;
  driverLicenseDetailedInfo?: VerifyApiBarcodeDriverLicenceDetailedInfo;
  employer?: string;
  extendedElements?: VerifyApiBarcodeExtendedElement[];
  firstName?: string;
  fullName?: string;
  issuingAuthority?: string;
  lastName?: string;
  maritalStatus?: string;
  middleName?: string;
  nationality?: string;
  parsed?: boolean;
  personalIdNumber?: string;
  placeOfBirth?: string;
  profession?: string;
  race?: string;
  religion?: string;
  residentialStatus?: string;
  sex?: string;
}

export interface VerifyApiSingleSideScanningResult {
  viz?: VerifyApiVizResult;
  mrz?: VerifyApiMrzResult;
  barcode?: VerifyApiBarcodeResult;
}

export interface VerifyApiExtractionSubResults {
  firstSide?: VerifyApiSingleSideScanningResult;
  secondSide?: VerifyApiSingleSideScanningResult;
}

export type VerifyApiCountry = VerifyApiCountryEnum | VerifyApiOpenEnumValue;

export type VerifyApiRegion = VerifyApiRegionEnum | VerifyApiOpenEnumValue;

export type VerifyApiType = VerifyApiTypeEnum | VerifyApiOpenEnumValue;

export interface VerifyApiDocumentClassInfo {
  country?: VerifyApiCountry;
  countryName?: string;
  isoAlpha2CountryCode?: string;
  isoAlpha3CountryCode?: string;
  isoNumericCountryCode?: string;
  region?: VerifyApiRegion;
  type?: VerifyApiType;
}

export type VerifyApiExtractionDataResult = VerifyApiScanningDataResult & {
  subResults?: VerifyApiExtractionSubResults;
  documentClassInfo?: VerifyApiDocumentClassInfo;
};

export type VerifyApiImageAnalysisDetectionStatus = VerifyApiImageAnalysisDetectionStatusEnum | VerifyApiOpenEnumValue;

export type VerifyApiFieldType = VerifyApiFieldTypeEnum | VerifyApiOpenEnumValue;

export type VerifyApiImageExtractionType = VerifyApiImageExtractionTypeEnum | VerifyApiOpenEnumValue;

export interface VerifyApiAdditionalProcessingInfo {
  processingStatus?: VerifyApiProcessingStatus;
  realIdDetectionStatus?: VerifyApiImageAnalysisDetectionStatus;
  missingMandatoryFields?: VerifyApiFieldType[];
  invalidCharacterFields?: VerifyApiFieldType[];
  extraPresentFields?: VerifyApiFieldType[];
  imageExtractionFailures?: VerifyApiImageExtractionType[];
}

export interface VerifyApiExtractionAdditionalProcessingInfo {
  firstSide?: VerifyApiAdditionalProcessingInfo;
  secondSide?: VerifyApiAdditionalProcessingInfo;
}

export interface VerifyApiExtractionResult {
  processingStatus: VerifyApiProcessingStatus;
  result: VerifyApiExtractionDataResult;
  additionalProcessingInfo?: VerifyApiExtractionAdditionalProcessingInfo;
}

export interface VerifyApiExtractionImages {
  firstSideCropped?: string;
  secondSideCropped?: string;
  face?: string;
  signature?: string;
  barcode?: string;
}

export type VerifyApiDocumentVerificationPolicy = VerifyApiDocumentVerificationPolicyEnum | VerifyApiOpenEnumValue;

export type VerifyApiVerificationContext = VerifyApiVerificationContextEnum | VerifyApiOpenEnumValue;

export type VerifyApiReviewStrategy = VerifyApiReviewStrategyEnum | VerifyApiOpenEnumValue;

/** High-level verification use-case options. */
export interface VerifyApiVerificationUseCase {
  verificationPolicy?: VerifyApiDocumentVerificationPolicy;
  verificationContext?: VerifyApiVerificationContext;
  manualReviewStrategy?: VerifyApiReviewStrategy;
}

export type VerifyApiSensitivity = VerifyApiSensitivityEnum | VerifyApiOpenEnumValue;

export type VerifyApiImageQualityRetryPolicy = VerifyApiImageQualityRetryPolicyEnum | VerifyApiOpenEnumValue;

/** Per-check sensitivities and related verification toggles. */
export interface VerifyApiVerificationSettings {
  screenPresenceSensitivity?: VerifyApiSensitivity;
  photocopySensitivity?: VerifyApiSensitivity;
  barcodeAuthenticitySensitivity?: VerifyApiSensitivity;
  portraitForgerySensitivity?: VerifyApiSensitivity;
  dataMatchSensitivity?: VerifyApiSensitivity;
  generativeAiSensitivity?: VerifyApiSensitivity;
  imageQualityRetryPolicy?: VerifyApiImageQualityRetryPolicy;
  rejectExpiredDocuments?: boolean;
  cropAffectsVerdict?: boolean;
}

export interface VerifyApiVerificationConfigurationUsed {
  /** High-level verification use-case options. */
  useCase?: VerifyApiVerificationUseCase;
  /** Per-check sensitivities and related verification toggles. */
  settings?: VerifyApiVerificationSettings;
}

export type VerifyApiRedactionMode = VerifyApiRedactionModeEnum | VerifyApiOpenEnumValue;

export interface VerifyApiRedactionSettings {
  /** Controls redaction of extracted images and result fields. When omitted, FullResult is used. */
  globalMode?: VerifyApiRedactionMode;
}

export interface VerifyApiVerificationDocumentCaptureModuleSettings {
  faceImageExtractionEnabled?: boolean;
  documentImageReturnEnabled?: boolean;
}

export interface VerifyApiVizModuleSettings {
  signatureImageExtractionEnabled?: boolean;
}

export interface VerifyApiBarcodeModuleSettings {
  barcodeImageReturnEnabled?: boolean;
}

export interface VerifyApiVerificationExtractionConfigurationUsed {
  redactionSettings?: VerifyApiRedactionSettings;
  documentCaptureModuleSettings?: VerifyApiVerificationDocumentCaptureModuleSettings;
  vizModuleSettings?: VerifyApiVizModuleSettings;
  barcodeModuleSettings?: VerifyApiBarcodeModuleSettings;
}

/** Shared image-assessment settings for /api/v3/verify and /api/v3/extract. */
export interface VerifyApiImageAssessmentConfiguration {
  /**
   * Single sensitivity applied uniformly to all image-quality dimensions. On /api/v3/verify, verificationPolicy may
   * adjust the effective value.
   */
  imageQualitySensitivity?: VerifyApiSensitivity;
}

export interface VerifyApiConfigurationUsed {
  verification?: VerifyApiVerificationConfigurationUsed;
  extraction?: VerifyApiVerificationExtractionConfigurationUsed;
  /** Shared image-assessment settings for /api/v3/verify and /api/v3/extract. */
  imageAssessment?: VerifyApiImageAssessmentConfiguration;
}

export interface VerifyApiRuntimeInformation {
  /** @format date-time */
  startedOn: string;
  /** @format date-time */
  finishedOn: string;
  /** @format int64 */
  elapsedMs: number;
  blinkIdVersion: string;
  blinkIdVerifyVersion: string;
  blinkIdRecognizerVersion?: string;
  blinkIdVerifyRecognizerVersion?: string;
  recognitionPath?: string;
  dockerImageTag?: string;
  /** @format int32 */
  workerIndex?: number;
  apiImageTag?: string;
  workerImageTag?: string;
  gatewayImageTag?: string;
  identityImageTag?: string;
  traceId?: string;
  executionId: string;
  /** @format uuid */
  consentId?: string;
  /** @format int32 */
  cpus?: number;
  cpuType?: string;
  /** @format int32 */
  ram?: number;
  /** @format int32 */
  workerCount?: number;
  /** @format int32 */
  inflightLimit?: number;
  /** @format int32 */
  internalQueueSize?: number;
  /** @format date-time */
  licenseExpiry?: string;
  licenseId?: string;
}

export interface VerifyApiDocumentVerificationResponse {
  pipeline: VerifyApiPipeline;
  messages?: VerifyApiResponseMessage[];
  verification: VerifyApiVerificationResult;
  imageAssessment: VerifyApiImageAssessment;
  extraction: VerifyApiExtractionResult;
  images?: VerifyApiExtractionImages;
  configurationUsed: VerifyApiConfigurationUsed;
  runtime: VerifyApiRuntimeInformation;
}

/**
 * Known values are listed in the enum schema. Additional string values may be returned by future versions of the API
 * and should be treated as unknown rather than invalid.
 *
 * @format open-enum
 */
export type VerifyApiOpenEnumValue = string & Record<never, never>;

export type VerifyApiV3ValidationErrorCodeEnum =
  | "InvalidParameter"
  | "InvalidParameterValue"
  | "InvalidParameterCombination"
  | "DuplicateParameter"
  | "InvalidRequestFormat";

export type VerifyApiExtractionPipelineStageStatusEnum = "NotPerformed" | "Partial" | "Completed" | "Failed";

export type VerifyApiVerificationPipelineStageStatusEnum = "NotPerformed" | "Partial" | "Completed";

export type VerifyApiVerdictEnum = "Unverifiable" | "Reject" | "Accept" | "Retry" | "Review";

export type VerifyApiPassesAtOrBelowSensitivityEnum =
  | "Level1"
  | "Level2"
  | "Level3"
  | "Level4"
  | "Level5"
  | "Level6"
  | "Level7"
  | "Level8"
  | "Level9"
  | "Level10"
  | "NotApplicable"
  | "None"
  | "Disabled";

export type VerifyApiCheckResultEnum = "NotPerformed" | "Pass" | "Fail";

export type VerifyApiProcessingStatusEnum =
  | "Success"
  | "DetectionFailed"
  | "ImagePreprocessingFailed"
  | "StabilityTestFailed"
  | "ScanningWrongSide"
  | "FieldIdentificationFailed"
  | "MandatoryFieldMissing"
  | "InvalidCharactersFound"
  | "ImageReturnFailed"
  | "BarcodeRecognitionFailed"
  | "MrzParsingFailed"
  | "UnsupportedDocument"
  | "AwaitingOtherSide"
  | "NotScanned"
  | "BarcodeDetectionFailed"
  | "MrzDetectionFailed"
  | "InputImageNotFocused"
  | "Canceled";

export type VerifyApiMrtdDocumentTypeEnum =
  | "Unknown"
  | "IdentityCard"
  | "Passport"
  | "Visa"
  | "GreenCard"
  | "MysPassIMM13P"
  | "DriverLicense"
  | "InternalTravelDocument"
  | "BorderCrossingCard";

export type VerifyApiBarcodeElementKeyEnum =
  | "DocumentType"
  | "StandardVersionNumber"
  | "CustomerFamilyName"
  | "CustomerFirstName"
  | "CustomerFullName"
  | "DateOfBirth"
  | "Sex"
  | "EyeColor"
  | "AddressStreet"
  | "AddressCity"
  | "AddressJurisdictionCode"
  | "AddressPostalCode"
  | "FullAddress"
  | "Height"
  | "HeightIn"
  | "HeightCm"
  | "CustomerMiddleName"
  | "HairColor"
  | "NameSuffix"
  | "AKAFullName"
  | "AKAFamilyName"
  | "AKAGivenName"
  | "AKASuffixName"
  | "WeightRange"
  | "WeightPounds"
  | "WeightKilograms"
  | "CustomerIdNumber"
  | "FamilyNameTruncation"
  | "FirstNameTruncation"
  | "MiddleNameTruncation"
  | "PlaceOfBirth"
  | "AddressStreet2"
  | "RaceEthnicity"
  | "NamePrefix"
  | "CountryIdentification"
  | "ResidenceStreetAddress"
  | "ResidenceStreetAddress2"
  | "ResidenceCity"
  | "ResidenceJurisdictionCode"
  | "ResidencePostalCode"
  | "ResidenceFullAddress"
  | "Under18"
  | "Under19"
  | "Under21"
  | "SocialSecurityNumber"
  | "AKASocialSecurityNumber"
  | "AKAMiddleName"
  | "AKAPrefixName"
  | "OrganDonor"
  | "Veteran"
  | "AKADateOfBirth"
  | "IssuerIdentificationNumber"
  | "DocumentExpirationDate"
  | "JurisdictionVersionNumber"
  | "JurisdictionVehicleClass"
  | "JurisdictionRestrictionCodes"
  | "JurisdictionEndorsementCodes"
  | "JurisdictionRestrictionCodeDescription"
  | "DocumentIssueDate"
  | "FederalCommercialVehicleCodes"
  | "IssuingJurisdiction"
  | "StandardVehicleClassification"
  | "IssuingJurisdictionName"
  | "StandardEndorsementCode"
  | "StandardRestrictionCode"
  | "JurisdictionVehicleClassificationDescription"
  | "JurisdictionEndorsmentCodeDescription"
  | "InventoryControlNumber"
  | "CardRevisionDate"
  | "DocumentDiscriminator"
  | "LimitedDurationDocument"
  | "AuditInformation"
  | "ComplianceType"
  | "IssueTimestamp"
  | "PermitExpirationDate"
  | "PermitIdentifier"
  | "PermitIssueDate"
  | "NumberOfDuplicates"
  | "HAZMATExpirationDate"
  | "MedicalIndicator"
  | "NonResident"
  | "UniqueCustomerId"
  | "DataDiscriminator"
  | "DocumentExpirationMonth"
  | "DocumentNonexpiring"
  | "SecurityVersion"
  | "SubFieldDesignator";

export type VerifyApiCountryEnum =
  | "None"
  | "Albania"
  | "Algeria"
  | "Argentina"
  | "Australia"
  | "Austria"
  | "Azerbaijan"
  | "Bahrain"
  | "Bangladesh"
  | "Belgium"
  | "BosniaAndHerzegovina"
  | "Brunei"
  | "Bulgaria"
  | "Cambodia"
  | "Canada"
  | "Chile"
  | "Colombia"
  | "CostaRica"
  | "Croatia"
  | "Cyprus"
  | "Czechia"
  | "Denmark"
  | "DominicanRepublic"
  | "Egypt"
  | "Estonia"
  | "Finland"
  | "France"
  | "Georgia"
  | "Germany"
  | "Ghana"
  | "Greece"
  | "Guatemala"
  | "HongKong"
  | "Hungary"
  | "India"
  | "Indonesia"
  | "Ireland"
  | "Israel"
  | "Italy"
  | "Jordan"
  | "Kazakhstan"
  | "Kenya"
  | "Kosovo"
  | "Kuwait"
  | "Latvia"
  | "Lithuania"
  | "Malaysia"
  | "Maldives"
  | "Malta"
  | "Mauritius"
  | "Mexico"
  | "Morocco"
  | "Netherlands"
  | "NewZealand"
  | "Nigeria"
  | "Pakistan"
  | "Panama"
  | "Paraguay"
  | "Philippines"
  | "Poland"
  | "Portugal"
  | "PuertoRico"
  | "Qatar"
  | "Romania"
  | "Russia"
  | "SaudiArabia"
  | "Serbia"
  | "Singapore"
  | "Slovakia"
  | "Slovenia"
  | "SouthAfrica"
  | "Spain"
  | "Sweden"
  | "Switzerland"
  | "Taiwan"
  | "Thailand"
  | "Tunisia"
  | "Turkey"
  | "Uae"
  | "Uganda"
  | "Uk"
  | "Ukraine"
  | "Usa"
  | "Vietnam"
  | "Brazil"
  | "Norway"
  | "Oman"
  | "Ecuador"
  | "ElSalvador"
  | "SriLanka"
  | "Peru"
  | "Uruguay"
  | "Bahamas"
  | "Bermuda"
  | "Bolivia"
  | "China"
  | "EuropeanUnion"
  | "Haiti"
  | "Honduras"
  | "Iceland"
  | "Japan"
  | "Luxembourg"
  | "Montenegro"
  | "Nicaragua"
  | "SouthKorea"
  | "Venezuela"
  | "Afghanistan"
  | "AlandIslands"
  | "AmericanSamoa"
  | "Andorra"
  | "Angola"
  | "Anguilla"
  | "Antarctica"
  | "AntiguaAndBarbuda"
  | "Armenia"
  | "Aruba"
  | "BailiwickOfGuernsey"
  | "BailiwickOfJersey"
  | "Barbados"
  | "Belarus"
  | "Belize"
  | "Benin"
  | "Bhutan"
  | "BonaireSaintEustatiusAndSaba"
  | "Botswana"
  | "BouvetIsland"
  | "BritishIndianOceanTerritory"
  | "BurkinaFaso"
  | "Burundi"
  | "Cameroon"
  | "CapeVerde"
  | "CaribbeanNetherlands"
  | "CaymanIslands"
  | "CentralAfricanRepublic"
  | "Chad"
  | "ChristmasIsland"
  | "CocosIslands"
  | "Comoros"
  | "Congo"
  | "CookIslands"
  | "Cuba"
  | "Curacao"
  | "DemocraticRepublicOfTheCongo"
  | "Djibouti"
  | "Dominica"
  | "EastTimor"
  | "EquatorialGuinea"
  | "Eritrea"
  | "Ethiopia"
  | "FalklandIslands"
  | "FaroeIslands"
  | "FederatedStatesOfMicronesia"
  | "Fiji"
  | "FrenchGuiana"
  | "FrenchPolynesia"
  | "FrenchSouthernTerritories"
  | "Gabon"
  | "Gambia"
  | "Gibraltar"
  | "Greenland"
  | "Grenada"
  | "Guadeloupe"
  | "Guam"
  | "Guinea"
  | "GuineaBissau"
  | "Guyana"
  | "HeardIslandAndMcdonaldIslands"
  | "Iran"
  | "Iraq"
  | "IsleOfMan"
  | "IvoryCoast"
  | "Jamaica"
  | "Kiribati"
  | "Kyrgyzstan"
  | "Laos"
  | "Lebanon"
  | "Lesotho"
  | "Liberia"
  | "Libya"
  | "Liechtenstein"
  | "Macau"
  | "Madagascar"
  | "Malawi"
  | "Mali"
  | "MarshallIslands"
  | "Martinique"
  | "Mauritania"
  | "Mayotte"
  | "Moldova"
  | "Monaco"
  | "Mongolia"
  | "Montserrat"
  | "Mozambique"
  | "Myanmar"
  | "Namibia"
  | "Nauru"
  | "Nepal"
  | "NewCaledonia"
  | "Niger"
  | "Niue"
  | "NorfolkIsland"
  | "NorthernCyprus"
  | "NorthernMarianaIslands"
  | "NorthKorea"
  | "NorthMacedonia"
  | "Palau"
  | "Palestine"
  | "PapuaNewGuinea"
  | "Pitcairn"
  | "Reunion"
  | "Rwanda"
  | "SaintBarthelemy"
  | "SaintHelenaAscensionAndTristianDaCunha"
  | "SaintKittsAndNevis"
  | "SaintLucia"
  | "SaintMartin"
  | "SaintPierreAndMiquelon"
  | "SaintVincentAndTheGrenadines"
  | "Samoa"
  | "SanMarino"
  | "SaoTomeAndPrincipe"
  | "Senegal"
  | "Seychelles"
  | "SierraLeone"
  | "SintMaarten"
  | "SolomonIslands"
  | "Somalia"
  | "SouthGeorgiaAndTheSouthSandwichIslands"
  | "SouthSudan"
  | "Sudan"
  | "Suriname"
  | "SvalbardAndJanMayen"
  | "Eswatini"
  | "Syria"
  | "Tajikistan"
  | "Tanzania"
  | "Togo"
  | "Tokelau"
  | "Tonga"
  | "TrinidadAndTobago"
  | "Turkmenistan"
  | "TurksAndCaicosIslands"
  | "Tuvalu"
  | "UnitedStatesMinorOutlyingIslands"
  | "Uzbekistan"
  | "Vanuatu"
  | "VaticanCity"
  | "VirginIslandsBritish"
  | "VirginIslandsUs"
  | "WallisAndFutuna"
  | "WesternSahara"
  | "Yemen"
  | "Yugoslavia"
  | "Zambia"
  | "Zimbabwe"
  | "SchengenArea"
  | "SaintThomasAndPrince";

export type VerifyApiRegionEnum =
  | "None"
  | "Alabama"
  | "Alaska"
  | "Alberta"
  | "Arizona"
  | "Arkansas"
  | "AustralianCapitalTerritory"
  | "BritishColumbia"
  | "California"
  | "Colorado"
  | "Connecticut"
  | "Delaware"
  | "DistrictOfColumbia"
  | "Florida"
  | "Georgia"
  | "Hawaii"
  | "Idaho"
  | "Illinois"
  | "Indiana"
  | "Iowa"
  | "Kansas"
  | "Kentucky"
  | "Louisiana"
  | "Maine"
  | "Manitoba"
  | "Maryland"
  | "Massachusetts"
  | "Michigan"
  | "Minnesota"
  | "Mississippi"
  | "Missouri"
  | "Montana"
  | "Nebraska"
  | "Nevada"
  | "NewBrunswick"
  | "NewHampshire"
  | "NewJersey"
  | "NewMexico"
  | "NewSouthWales"
  | "NewYork"
  | "NorthernTerritory"
  | "NorthCarolina"
  | "NorthDakota"
  | "NovaScotia"
  | "Ohio"
  | "Oklahoma"
  | "Ontario"
  | "Oregon"
  | "Pennsylvania"
  | "Quebec"
  | "Queensland"
  | "RhodeIsland"
  | "Saskatchewan"
  | "SouthAustralia"
  | "SouthCarolina"
  | "SouthDakota"
  | "Tasmania"
  | "Tennessee"
  | "Texas"
  | "Utah"
  | "Vermont"
  | "Victoria"
  | "Virginia"
  | "Washington"
  | "WesternAustralia"
  | "WestVirginia"
  | "Wisconsin"
  | "Wyoming"
  | "Yukon"
  | "CiudadDeMexico"
  | "Jalisco"
  | "NewfoundlandAndLabrador"
  | "NuevoLeon"
  | "BajaCalifornia"
  | "Chihuahua"
  | "Guanajuato"
  | "Guerrero"
  | "Mexico"
  | "Michoacan"
  | "NewYorkCity"
  | "Tamaulipas"
  | "Veracruz"
  | "Chiapas"
  | "Coahuila"
  | "Durango"
  | "GuerreroCocula"
  | "GuerreroJuchitan"
  | "GuerreroTepecoacuilco"
  | "GuerreroTlacoapa"
  | "Gujarat"
  | "Hidalgo"
  | "Karnataka"
  | "Kerala"
  | "KhyberPakhtunkhwa"
  | "MadhyaPradesh"
  | "Maharashtra"
  | "Morelos"
  | "Nayarit"
  | "Oaxaca"
  | "Puebla"
  | "Punjab"
  | "Queretaro"
  | "SanLuisPotosi"
  | "Sinaloa"
  | "Sonora"
  | "Tabasco"
  | "TamilNadu"
  | "Yucatan"
  | "Zacatecas"
  | "Aguascalientes"
  | "BajaCaliforniaSur"
  | "Campeche"
  | "Colima"
  | "QuintanaRooBenitoJuarez"
  | "QuintanaRoo"
  | "QuintanaRooSolidaridad"
  | "Tlaxcala"
  | "QuintanaRooCozumel"
  | "SaoPaolo"
  | "RioDeJaneiro"
  | "RioGrandeDoSul"
  | "NorthwestTerritories"
  | "Nunavut"
  | "PrinceEdwardIsland"
  | "DistritoFederal"
  | "Maranhao"
  | "MatoGrosso"
  | "MinasGerais"
  | "Para"
  | "Parana"
  | "Pernambuco"
  | "SantaCatarina"
  | "AndhraPradesh"
  | "Ceara"
  | "Goias"
  | "GuerreroAcapulcoDeJuarez"
  | "Haryana"
  | "Sergipe"
  | "Alagoas"
  | "Bangsamoro"
  | "Telangana"
  | "Acre"
  | "EspiritoSanto"
  | "MatoGrossoDoSul"
  | "Paraiba"
  | "Piaui"
  | "RioGrandeDoNorte"
  | "Tocantins"
  | "Odisha"
  | "Uttarakhand"
  | "NorthernIreland";

export type VerifyApiTypeEnum =
  | "None"
  | "ConsularId"
  | "Dl"
  | "DlPublicServicesCard"
  | "EmploymentPass"
  | "FinCard"
  | "Id"
  | "MultipurposeId"
  | "MyKad"
  | "MyKid"
  | "MyPr"
  | "MyTentera"
  | "PanCard"
  | "ProfessionalId"
  | "PublicServicesCard"
  | "ResidencePermit"
  | "ResidentId"
  | "TemporaryResidencePermit"
  | "VoterId"
  | "WorkPermit"
  | "IKad"
  | "MilitaryId"
  | "MyKas"
  | "SocialSecurityCard"
  | "HealthInsuranceCard"
  | "Passport"
  | "SPass"
  | "AddressCard"
  | "AlienId"
  | "AlienPassport"
  | "GreenCard"
  | "MinorsId"
  | "PostalId"
  | "ProfessionalDl"
  | "TaxId"
  | "WeaponPermit"
  | "Visa"
  | "BorderCrossingCard"
  | "DriverCard"
  | "GlobalEntryCard"
  | "MyPolis"
  | "NexusCard"
  | "PassportCard"
  | "ProofOfAgeCard"
  | "RefugeeId"
  | "TribalId"
  | "VeteranId"
  | "CitizenshipCertificate"
  | "MyNumberCard"
  | "ConsularPassport"
  | "MinorsPassport"
  | "MinorsPublicServicesCard"
  | "DrivingPrivilegeCard"
  | "AsylumRequest"
  | "DriverQualificationCard"
  | "ProvisionalDl"
  | "RefugeePassport"
  | "SpecialId"
  | "UniformedServicesId"
  | "ImmigrantVisa"
  | "ConsularVoterId"
  | "TwicCard"
  | "ExitEntryPermit"
  | "MainlandTravelPermitTaiwan"
  | "NbiClearance"
  | "ProofOfRegistration"
  | "TemporaryProtectionPermit"
  | "AfghanCitizenCard"
  | "Eid"
  | "Pass"
  | "SisId"
  | "AsicCard"
  | "BidoonCard"
  | "InterimHealthInsuranceCard"
  | "NonVoterId"
  | "ReciprocalHealthInsuranceCard"
  | "VehicleRegistration"
  | "EsaadCard"
  | "RegistrationCertificate"
  | "MedicalMarijuanaId"
  | "NonCardTribalId"
  | "DiplomaticId"
  | "EmergencyPassport"
  | "TemporaryPassport"
  | "MetisFederationCard"
  | "AdrCertificate"
  | "NinCard"
  | "MysssCard"
  | "GendarmerieId"
  | "PoliceId"
  | "OriginCard"
  | "ByidCard"
  | "SpecifiedResidenceCard"
  | "GoldenCard"
  | "VehicleOwnershipCertificate";

export type VerifyApiImageAnalysisDetectionStatusEnum = "NotAvailable" | "NotDetected" | "Detected";

export type VerifyApiFieldTypeEnum =
  | "AdditionalAddressInformation"
  | "AdditionalNameInformation"
  | "AdditionalOptionalAddressInformation"
  | "AdditionalPersonalIdNumber"
  | "Address"
  | "BloodType"
  | "ClassEffectiveDate"
  | "ClassExpiryDate"
  | "Conditions"
  | "DateOfBirth"
  | "DateOfExpiry"
  | "DateOfIssue"
  | "DocumentAdditionalNumber"
  | "DocumentNumber"
  | "DocumentOptionalAdditionalNumber"
  | "Employer"
  | "Endorsements"
  | "FathersName"
  | "FirstName"
  | "FullName"
  | "IssuingAuthority"
  | "LastName"
  | "LicenceType"
  | "MaritalStatus"
  | "MothersName"
  | "Mrz"
  | "Nationality"
  | "PersonalIdNumber"
  | "PlaceOfBirth"
  | "Profession"
  | "Race"
  | "Religion"
  | "ResidentialStatus"
  | "Restrictions"
  | "Sex"
  | "Sponsor"
  | "VehicleClass"
  | "VisaType"
  | "CertificateNumber"
  | "CountryCode"
  | "DependentDateOfBirth"
  | "DependentDocumentNumber"
  | "DependentFullName"
  | "DependentSex"
  | "DocumentSubtype"
  | "EligibilityCategory"
  | "ManufacturingYear"
  | "NationalInsuranceNumber"
  | "Remarks"
  | "ResidencePermitType"
  | "SpecificDocumentValidity"
  | "VehicleOwner"
  | "VehicleType"
  | "LocalizedName"
  | "StateName"
  | "StateCode"
  | "SectionCode"
  | "RegistrationCenterCode"
  | "MaidenName"
  | "MunicipalityOfRegistration"
  | "LocalityCode"
  | "DateOfEntry"
  | "MunicipalityCode"
  | "PollingStationCode"
  | "EffectiveDate"
  | "ParentsLastName"
  | "WorkRestriction"
  | "ParentsFirstName"
  | "SocialSecurityStatus"
  | "LegalStatus"
  | "HusbandName"
  | "ParentFullName"
  | "Ethnicity"
  | "CardAccessNumber"
  | "VehicleNumber"
  | "PassportNumber"
  | "TrafficParticipantNumber";

export type VerifyApiImageExtractionTypeEnum = "Document" | "Face" | "Signature";

export type VerifyApiDocumentVerificationPolicyEnum = "HighConversion" | "Balanced" | "HighAssurance";

export type VerifyApiVerificationContextEnum = "Remote" | "InPerson";

export type VerifyApiReviewStrategyEnum = "Never" | "RejectedAndAccepted" | "RejectedOnly" | "AcceptedOnly";

export type VerifyApiSensitivityEnum =
  | "Level1"
  | "Level2"
  | "Level3"
  | "Level4"
  | "Level5"
  | "Level6"
  | "Level7"
  | "Level8"
  | "Level9"
  | "Level10"
  | "Disabled";

export type VerifyApiImageQualityRetryPolicyEnum =
  | "NeverRetryBadQuality"
  | "RetryBadQualityAlways"
  | "RetryBadQualityForAcceptances"
  | "RetryBadQualityForRejections";

export type VerifyApiRedactionModeEnum = "None" | "ImageOnly" | "ResultFieldsOnly" | "FullResult";
