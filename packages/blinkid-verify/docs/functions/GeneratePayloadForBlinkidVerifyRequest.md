[**@microblink/blinkid-verify**](../README.md)

***

[@microblink/blinkid-verify](../README.md) / GeneratePayloadForBlinkidVerifyRequest

# Function: GeneratePayloadForBlinkidVerifyRequest()

> **GeneratePayloadForBlinkidVerifyRequest**(`result`, `sessionId`, `settings`, `options?`): `BlinkIdVerifyPayload`

Builds the JSON payload for the BlinkID Verify Cloud API from a completed scanning result.

Maps internal SDK enum values (kebab-case) to their API-facing PascalCase equivalents
and encodes captured document frames as base64 JPEG strings.

## Parameters

### result

[`BlinkIdVerifyScanningResult`](../type-aliases/BlinkIdVerifyScanningResult.md)

The scanning result produced by the BlinkIdVerify SDK.

### sessionId

`string`

The unique identifier of the capture session to include in the payload.

### settings

[`ScanningSettings`](../type-aliases/ScanningSettings.md)

The scanning settings used during the session, used to derive verification options.

### options?

[`BlinkIdVerifyRequestOptions`](../type-aliases/BlinkIdVerifyRequestOptions.md)

Optional caller-supplied overrides for anonymization, image return, and match levels.

## Returns

`BlinkIdVerifyPayload`

The fully constructed payload ready to be submitted to the BlinkID Verify Cloud API.
