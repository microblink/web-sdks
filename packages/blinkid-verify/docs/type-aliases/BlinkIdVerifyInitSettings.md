[**@microblink/blinkid-verify**](../README.md)

***

[@microblink/blinkid-verify](../README.md) / BlinkIdVerifyInitSettings

# Type Alias: BlinkIdVerifyInitSettings

> **BlinkIdVerifyInitSettings** = `Simplify`\<`Omit`\<[`BlinkIdVerifyWorkerInitSettings`](BlinkIdVerifyWorkerInitSettings.md), `"userId"` \| `"verifyApi"` \| `"verifyApiBaseUrl"`\> & `object`\>

Configuration options for initializing the BlinkIdVerify core.

Ping `userId` is generated and persisted by the SDK. It is not part of the public initialization settings.
