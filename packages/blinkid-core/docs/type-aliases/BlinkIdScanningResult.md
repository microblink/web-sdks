[**@microblink/blinkid-core**](../README.md)

***

[@microblink/blinkid-core](../README.md) / BlinkIdScanningResult

# Type Alias: BlinkIdScanningResult

> **BlinkIdScanningResult** = `object`

Represents the final complete result of the scanning process.

## Properties

### additionalAddressInformation

> **additionalAddressInformation**: [`StringResult`](StringResult.md) \| `undefined`

The additional address information of the document owner

***

### additionalNameInformation

> **additionalNameInformation**: [`StringResult`](StringResult.md) \| `undefined`

The additional name information of the document owner

***

### additionalOptionalAddressInformation

> **additionalOptionalAddressInformation**: [`StringResult`](StringResult.md) \| `undefined`

Additional optional address information of the document owner

***

### additionalPersonalIdNumber

> **additionalPersonalIdNumber**: [`StringResult`](StringResult.md) \| `undefined`

The additional personal identification number

***

### address

> **address**: [`StringResult`](StringResult.md) \| `undefined`

The address of the document owner

***

### barcodeImageScanningSide

> **barcodeImageScanningSide**: [`ScanningSide`](ScanningSide.md) \| `undefined`

Scanning side matching the returned barcode image.

***

### bloodType

> **bloodType**: [`StringResult`](StringResult.md) \| `undefined`

The blood type of the document owner

***

### cardAccessNumber

> **cardAccessNumber**: [`StringResult`](StringResult.md) \| `undefined`

Numeric code used to establish secure electronic access to the embedded
contactless chip.

***

### certificateNumber

> **certificateNumber**: [`StringResult`](StringResult.md) \| `undefined`

The certificate number of the document owner

***

### countryCode

> **countryCode**: [`StringResult`](StringResult.md) \| `undefined`

The country code of the document owner

***

### dataMatchResult

> **dataMatchResult**: [`DataMatchResult`](DataMatchResult.md) \| `undefined`

Info on whether the data extracted from multiple sides matches

***

### dateOfBirth

> **dateOfBirth**: [`DateResult`](DateResult.md)\<[`StringResult`](StringResult.md)\> \| `undefined`

The date of birth of the document owner

***

### dateOfEntry

> **dateOfEntry**: [`DateResult`](DateResult.md)\<[`StringResult`](StringResult.md)\> \| `undefined`

The date of entry of the document owner

***

### dateOfExpiry

> **dateOfExpiry**: [`DateResult`](DateResult.md)\<[`StringResult`](StringResult.md)\> \| `undefined`

The date of expiry of the document

***

### dateOfExpiryPermanent

> **dateOfExpiryPermanent**: `boolean` \| `undefined`

Determines if date of expiry is permanent

***

### dateOfIssue

> **dateOfIssue**: [`DateResult`](DateResult.md)\<[`StringResult`](StringResult.md)\> \| `undefined`

The date of issue of the document

***

### dependentsInfo

> **dependentsInfo**: [`DependentInfo`](DependentInfo.md)[] \| `undefined`

The dependents info

***

### documentAdditionalNumber

> **documentAdditionalNumber**: [`StringResult`](StringResult.md) \| `undefined`

The additional number of the document

***

### documentClassInfo?

> `optional` **documentClassInfo**: [`DocumentClassInfo`](DocumentClassInfo.md)

The document class information.

Absent when the document could not be classified (for example, for
unsupported documents without any extracted class info).

***

### documentImagesScanningSide

> **documentImagesScanningSide**: [`ScanningSide`](ScanningSide.md)[] \| `undefined`

Scanning sides matching document image indexes in `subResults`.

***

### documentNumber

> **documentNumber**: [`StringResult`](StringResult.md) \| `undefined`

The document number

***

### documentOptionalAdditionalNumber

> **documentOptionalAdditionalNumber**: [`StringResult`](StringResult.md) \| `undefined`

Additional optional number of the document

***

### documentSubtype

> **documentSubtype**: [`StringResult`](StringResult.md) \| `undefined`

The document subtype transcription

***

### driverLicenseDetailedInfo

> **driverLicenseDetailedInfo**: [`DriverLicenceDetailedInfo`](DriverLicenceDetailedInfo.md)\<[`StringResult`](StringResult.md)\> \| `undefined`

The driver license detailed info

***

### effectiveDate

> **effectiveDate**: [`DateResult`](DateResult.md)\<[`StringResult`](StringResult.md)\> \| `undefined`

The effective date of the document

***

### eligibilityCategory

> **eligibilityCategory**: [`StringResult`](StringResult.md) \| `undefined`

The eligibility category

***

### employer

> **employer**: [`StringResult`](StringResult.md) \| `undefined`

The employer of the document owner

***

### ethnicity

> **ethnicity**: [`StringResult`](StringResult.md) \| `undefined`

The ethnicity of the document owner

***

### faceImageScanningSide

> **faceImageScanningSide**: [`ScanningSide`](ScanningSide.md) \| `undefined`

Scanning side matching the returned face image.

***

### fathersName

> **fathersName**: [`StringResult`](StringResult.md) \| `undefined`

The father's name of the document owner

***

### firstName

> **firstName**: [`StringResult`](StringResult.md) \| `undefined`

The first name of the document owner

***

### fullName

> **fullName**: [`StringResult`](StringResult.md) \| `undefined`

The full name of the document owner

***

### husbandName

> **husbandName**: [`StringResult`](StringResult.md) \| `undefined`

The husband name of the document owner

***

### inputImagesScanningSide

> **inputImagesScanningSide**: [`ScanningSide`](ScanningSide.md)[] \| `undefined`

Scanning sides matching input image indexes in `subResults`.

***

### issuingAuthority

> **issuingAuthority**: [`StringResult`](StringResult.md) \| `undefined`

The issuing authority of the document

***

### lastName

> **lastName**: [`StringResult`](StringResult.md) \| `undefined`

The last name of the document owner

***

### legalStatus

> **legalStatus**: [`StringResult`](StringResult.md) \| `undefined`

The legal status of the document owner

***

### localityCode

> **localityCode**: [`StringResult`](StringResult.md) \| `undefined`

The locality code of the document owner

***

### localizedName

> **localizedName**: [`StringResult`](StringResult.md) \| `undefined`

The localized name of the document owner

***

### maidenName

> **maidenName**: [`StringResult`](StringResult.md) \| `undefined`

The maiden name of the document owner

***

### manufacturingYear

> **manufacturingYear**: [`StringResult`](StringResult.md) \| `undefined`

The manufacturing year

***

### maritalStatus

> **maritalStatus**: [`StringResult`](StringResult.md) \| `undefined`

The marital status of the document owner

***

### mothersName

> **mothersName**: [`StringResult`](StringResult.md) \| `undefined`

The mother's name of the document owner

***

### municipalityCode

> **municipalityCode**: [`StringResult`](StringResult.md) \| `undefined`

The municipality code of the document owner

***

### municipalityOfRegistration

> **municipalityOfRegistration**: [`StringResult`](StringResult.md) \| `undefined`

The municipality of registration of the document owner

***

### nationalInsuranceNumber

> **nationalInsuranceNumber**: [`StringResult`](StringResult.md) \| `undefined`

The national insurance number of the document owner

***

### nationality

> **nationality**: [`StringResult`](StringResult.md) \| `undefined`

The nationality of the document owner

***

### parentsInfo

> **parentsInfo**: `object`[] \| `undefined`

The parents info

***

### personalIdNumber

> **personalIdNumber**: [`StringResult`](StringResult.md) \| `undefined`

The personal identification number

***

### placeOfBirth

> **placeOfBirth**: [`StringResult`](StringResult.md) \| `undefined`

The place of birth of the document owner

***

### pollingStationCode

> **pollingStationCode**: [`StringResult`](StringResult.md) \| `undefined`

The polling station code of the document owner

***

### profession

> **profession**: [`StringResult`](StringResult.md) \| `undefined`

The profession of the document owner

***

### race

> **race**: [`StringResult`](StringResult.md) \| `undefined`

The race of the document owner

***

### registrationCenterCode

> **registrationCenterCode**: [`StringResult`](StringResult.md) \| `undefined`

The registration center code of the document owner

***

### religion

> **religion**: [`StringResult`](StringResult.md) \| `undefined`

The religion of the document owner

***

### remarks

> **remarks**: [`StringResult`](StringResult.md) \| `undefined`

The remarks on the residence permit

***

### residencePermitType

> **residencePermitType**: [`StringResult`](StringResult.md) \| `undefined`

The residence permit type

***

### residentialStatus

> **residentialStatus**: [`StringResult`](StringResult.md) \| `undefined`

The residential status of the document owner

***

### sectionCode

> **sectionCode**: [`StringResult`](StringResult.md) \| `undefined`

The section code of the document owner

***

### sex

> **sex**: [`StringResult`](StringResult.md) \| `undefined`

The sex of the document owner

***

### signatureImageScanningSide

> **signatureImageScanningSide**: [`ScanningSide`](ScanningSide.md) \| `undefined`

Scanning side matching the returned signature image.

***

### socialSecurityStatus

> **socialSecurityStatus**: [`StringResult`](StringResult.md) \| `undefined`

The social security status of the document owner

***

### specificDocumentValidity

> **specificDocumentValidity**: [`StringResult`](StringResult.md) \| `undefined`

The specific document validity

***

### sponsor

> **sponsor**: [`StringResult`](StringResult.md) \| `undefined`

The sponsor of the document owner.

***

### stateCode

> **stateCode**: [`StringResult`](StringResult.md) \| `undefined`

The state code of the document owner

***

### stateName

> **stateName**: [`StringResult`](StringResult.md) \| `undefined`

The state of the document owner

***

### subResults

> **subResults**: [`SingleSideScanningResult`](SingleSideScanningResult.md)[]

The results of scanning each side of the document

***

### vehicleOwner

> **vehicleOwner**: [`StringResult`](StringResult.md) \| `undefined`

The vehicle owner

***

### vehicleType

> **vehicleType**: [`StringResult`](StringResult.md) \| `undefined`

The vehicle type

***

### visaType

> **visaType**: [`StringResult`](StringResult.md) \| `undefined`

The visa type of the document

***

### workRestriction

> **workRestriction**: [`StringResult`](StringResult.md) \| `undefined`

The work restriction of the document owner
