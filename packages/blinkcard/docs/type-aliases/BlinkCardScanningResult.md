[**@microblink/blinkcard**](../README.md)

***

[@microblink/blinkcard](../README.md) / BlinkCardScanningResult

# Type Alias: BlinkCardScanningResult

> **BlinkCardScanningResult** = `object`

Result of scanning a card.

## Properties

### cardAccounts

> **cardAccounts**: [`CardAccountResult`](CardAccountResult.md)[]

A list of payment card accounts found on the card.

Each result in the list represents a distinct payment account, containing
details like the card number, CVV, and expiry date.

***

### cardholderName

> **cardholderName**: `string` \| `undefined`

***

### firstSideResult

> **firstSideResult**: [`SingleSideScanningResult`](SingleSideScanningResult.md) \| `undefined`

***

### iban

> **iban**: `string` \| `undefined`

***

### issuingNetwork

> **issuingNetwork**: `string`

***

### overallCardLivenessResult

> **overallCardLivenessResult**: [`CheckResult`](CheckResult.md)

The overall liveness check result for the card.

This result aggregates the outcomes of various liveness checks performed on
the card to determine its authenticity. Set to `Pass` if all individual
checks have passed; set to `Fail` if any individual check has failed.

***

### secondSideResult

> **secondSideResult**: [`SingleSideScanningResult`](SingleSideScanningResult.md) \| `undefined`
