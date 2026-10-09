[**@microblink/blinkid-verify**](../README.md)

***

[@microblink/blinkid-verify](../README.md) / BlinkIdVerifyConsentDeclinedError

# Class: BlinkIdVerifyConsentDeclinedError

Thrown when `createBlinkIdVerify` is used with `RequireConsent` and the user declines the consent modal.

The camera UI is dismounted and the SDK is terminated before this error is thrown.

## Extends

- `Error`

## Constructors

### Constructor

> **new BlinkIdVerifyConsentDeclinedError**(): `BlinkIdVerifyConsentDeclinedError`

#### Returns

`BlinkIdVerifyConsentDeclinedError`

#### Overrides

`Error.constructor`
