[**@microblink/biometrics**](../README.md)

***

[@microblink/biometrics](../README.md) / BiometricsSdk

# Type Alias: BiometricsSdk

> **BiometricsSdk** = `object`

Initialized Biometrics capture SDK instance.

## Methods

### close()

> **close**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### reportPinglet()

> **reportPinglet**(`ping`): `Promise`\<`void`\>

Queues a pinglet to be sent with the SDK's next pinglet batch.

#### Parameters

##### ping

[`Ping`](Ping.md)

#### Returns

`Promise`\<`void`\>

***

### sendPinglets()

> **sendPinglets**(): `Promise`\<`void`\>

Sends all queued pinglets.

#### Returns

`Promise`\<`void`\>

***

### startSession()

> **startSession**(`config?`): [`BiometricsSession`](BiometricsSession.md)

Creates a face capture session.

#### Parameters

##### config?

[`BiometricsSessionConfig`](BiometricsSessionConfig.md)

#### Returns

[`BiometricsSession`](BiometricsSession.md)
