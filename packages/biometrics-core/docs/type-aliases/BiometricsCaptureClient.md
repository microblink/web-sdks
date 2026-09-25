[**@microblink/biometrics-core**](../README.md)

***

[@microblink/biometrics-core](../README.md) / BiometricsCaptureClient

# Type Alias: BiometricsCaptureClient

> **BiometricsCaptureClient** = `object`

Runtime capture client returned by `createBiometricsCapture`.

## Methods

### close()

> **close**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### ping()

> **ping**(`pinglet`): `Promise`\<`void`\>

#### Parameters

##### pinglet

`Ping`

#### Returns

`Promise`\<`void`\>

***

### sendPinglets()

> **sendPinglets**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### startSession()

> **startSession**(`settings?`): `Promise`\<[`BiometricsCaptureSession`](BiometricsCaptureSession.md)\>

#### Parameters

##### settings?

[`FaceAnalysisSessionSettings`](FaceAnalysisSessionSettings.md)

#### Returns

`Promise`\<[`BiometricsCaptureSession`](BiometricsCaptureSession.md)\>
