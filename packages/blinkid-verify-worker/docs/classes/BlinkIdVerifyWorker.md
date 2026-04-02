[**@microblink/blinkid-verify-worker**](../README.md)

***

[@microblink/blinkid-verify-worker](../README.md) / BlinkIdVerifyWorker

# Class: BlinkIdVerifyWorker

The BlinkID Verify worker.

## Constructors

### Constructor

> **new BlinkIdVerifyWorker**(): `BlinkIdVerifyWorker`

#### Returns

`BlinkIdVerifyWorker`

## Properties

### progressStatusCallback?

> `optional` **progressStatusCallback**: [`ProgressStatusCallback`](../type-aliases/ProgressStatusCallback.md)

The progress status callback.

## Methods

### \[finalizer\]()

> **\[finalizer\]**(): `void`

This method is called when the worker is terminated.

#### Returns

`void`

***

### createScanningSession()

> **createScanningSession**(`sessionSettings?`): `Omit`\<`BlinkIdVerifyScanningSession`, `"process"` \| `"deleteLater"` \| `"isAliasOf"` \| `"clone"`\> & `object` & `ProxyMarked`

This method creates a BlinkIdVerify scanning session.

#### Parameters

##### sessionSettings?

`Partial`\<\{ `inputImageSource`: `InputImageSource`; `scanningSettings`: `ScanningSettings`; \}\>

The options for the session.

#### Returns

The session.

***

### initBlinkIdVerify()

> **initBlinkIdVerify**(`settings`, `progressCallback?`): `Promise`\<`void`\>

This method initializes everything.

#### Parameters

##### settings

[`BlinkIdVerifyWorkerInitSettings`](../type-aliases/BlinkIdVerifyWorkerInitSettings.md)

##### progressCallback?

[`ProgressStatusCallback`](../type-aliases/ProgressStatusCallback.md)

#### Returns

`Promise`\<`void`\>

***

### reportPinglet()

> **reportPinglet**(`__namedParameters`): `void`

#### Parameters

##### \_\_namedParameters

`Ping`

#### Returns

`void`

***

### sendPinglets()

> **sendPinglets**(): `void`

#### Returns

`void`

***

### terminate()

> **terminate**(): `Promise`\<`void`\>

Terminates the workers and the Wasm runtime.

#### Returns

`Promise`\<`void`\>
