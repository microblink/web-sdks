[**@microblink/blinkid-verify-ux-manager**](../../README.md)

***

[@microblink/blinkid-verify-ux-manager](../../README.md) / [index](../README.md) / createBlinkIdVerifyUxManager

# Function: createBlinkIdVerifyUxManager()

## Call Signature

> **createBlinkIdVerifyUxManager**(`cameraManager`, `scanningSession`, `options`): `Promise`\<[`BlinkIdVerifyConsentGate`](../classes/BlinkIdVerifyConsentGate.md)\>

Creates a BlinkID Verify UX manager, or a consent gate when scanning must wait for consent.

### Parameters

#### cameraManager

`CameraManager`

The camera manager.

#### scanningSession

`RemoteScanningSession`

The scanning session.

#### options

`ManagerOptionsWithRequireConsent`

UX manager options. `RequireConsent` returns a [BlinkIdVerifyConsentGate](../classes/BlinkIdVerifyConsentGate.md). Call
  `consentUiResponse` before using the manager. Omitting `consentUxConfig`, `NoConsentUI`, and
  `ProvideExternalConsent` return a [BlinkIdVerifyUxManager](../interfaces/BlinkIdVerifyUxManager.md) directly. `ProvideExternalConsent` stores its
  consent object before the frame callback is registered.

### Returns

`Promise`\<[`BlinkIdVerifyConsentGate`](../classes/BlinkIdVerifyConsentGate.md)\>

The UX manager, or a consent gate when `consentMode` is `RequireConsent`.

## Call Signature

> **createBlinkIdVerifyUxManager**(`cameraManager`, `scanningSession`, `options?`): `Promise`\<[`BlinkIdVerifyUxManager`](../interfaces/BlinkIdVerifyUxManager.md)\>

Creates a BlinkID Verify UX manager, or a consent gate when scanning must wait for consent.

### Parameters

#### cameraManager

`CameraManager`

The camera manager.

#### scanningSession

`RemoteScanningSession`

The scanning session.

#### options?

`ManagerOptionsWithoutRequireConsent`

UX manager options. `RequireConsent` returns a [BlinkIdVerifyConsentGate](../classes/BlinkIdVerifyConsentGate.md). Call
  `consentUiResponse` before using the manager. Omitting `consentUxConfig`, `NoConsentUI`, and
  `ProvideExternalConsent` return a [BlinkIdVerifyUxManager](../interfaces/BlinkIdVerifyUxManager.md) directly. `ProvideExternalConsent` stores its
  consent object before the frame callback is registered.

### Returns

`Promise`\<[`BlinkIdVerifyUxManager`](../interfaces/BlinkIdVerifyUxManager.md)\>

The UX manager, or a consent gate when `consentMode` is `RequireConsent`.

## Call Signature

> **createBlinkIdVerifyUxManager**(`cameraManager`, `scanningSession`, `options?`): `Promise`\<[`BlinkIdVerifyUxManager`](../interfaces/BlinkIdVerifyUxManager.md) \| [`BlinkIdVerifyConsentGate`](../classes/BlinkIdVerifyConsentGate.md)\>

Creates a BlinkID Verify UX manager, or a consent gate when scanning must wait for consent.

### Parameters

#### cameraManager

`CameraManager`

The camera manager.

#### scanningSession

`RemoteScanningSession`

The scanning session.

#### options?

`Partial`\<[`BlinkIdVerifyUxManagerOptions`](../type-aliases/BlinkIdVerifyUxManagerOptions.md)\>

UX manager options. `RequireConsent` returns a [BlinkIdVerifyConsentGate](../classes/BlinkIdVerifyConsentGate.md). Call
  `consentUiResponse` before using the manager. Omitting `consentUxConfig`, `NoConsentUI`, and
  `ProvideExternalConsent` return a [BlinkIdVerifyUxManager](../interfaces/BlinkIdVerifyUxManager.md) directly. `ProvideExternalConsent` stores its
  consent object before the frame callback is registered.

### Returns

`Promise`\<[`BlinkIdVerifyUxManager`](../interfaces/BlinkIdVerifyUxManager.md) \| [`BlinkIdVerifyConsentGate`](../classes/BlinkIdVerifyConsentGate.md)\>

The UX manager, or a consent gate when `consentMode` is `RequireConsent`.
