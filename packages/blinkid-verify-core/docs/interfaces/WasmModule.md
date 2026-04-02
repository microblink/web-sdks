[**@microblink/blinkid-verify-core**](../README.md)

***

[@microblink/blinkid-verify-core](../README.md) / WasmModule

# Interface: WasmModule\<TSessionSettings, TScanningSession\>

## Extends

- [`WasmBindings`](WasmBindings.md)\<`TSessionSettings`, `TScanningSession`\>

## Type Parameters

### TSessionSettings

`TSessionSettings`

### TScanningSession

`TScanningSession`

## Properties

### arePingRequestsInProgress()

> **arePingRequestsInProgress**: () => `boolean`

#### Returns

`boolean`

#### Inherited from

[`WasmBindings`](WasmBindings.md).[`arePingRequestsInProgress`](WasmBindings.md#arepingrequestsinprogress)

***

### arguments

> **arguments**: `string`[]

#### Inherited from

`EmscriptenModule.arguments`

***

### createScanningSession()

> **createScanningSession**: (`sessionSettings`, `userId`) => `TScanningSession`

#### Parameters

##### sessionSettings

`TSessionSettings`

##### userId

`string`

#### Returns

`TScanningSession`

#### Inherited from

[`WasmBindings`](WasmBindings.md).[`createScanningSession`](WasmBindings.md#createscanningsession)

***

### environment

> **environment**: `EnvironmentType`

#### Inherited from

`EmscriptenModule.environment`

***

### FAST\_MEMORY

> **FAST\_MEMORY**: `number`

#### Inherited from

`EmscriptenModule.FAST_MEMORY`

***

### FHEAP

> **FHEAP**: `Float64Array`

#### Inherited from

`EmscriptenModule.FHEAP`

***

### filePackagePrefixURL

> **filePackagePrefixURL**: `string`

#### Inherited from

`EmscriptenModule.filePackagePrefixURL`

***

### getActiveLicenseTokenInfo()

> **getActiveLicenseTokenInfo**: () => [`LicenseUnlockResult`](../type-aliases/LicenseUnlockResult.md)

#### Returns

[`LicenseUnlockResult`](../type-aliases/LicenseUnlockResult.md)

#### Inherited from

[`WasmBindings`](WasmBindings.md).[`getActiveLicenseTokenInfo`](WasmBindings.md#getactivelicensetokeninfo)

***

### HEAP

> **HEAP**: `Int32Array`

#### Inherited from

`EmscriptenModule.HEAP`

***

### HEAP16

> **HEAP16**: `Int16Array`

#### Inherited from

`EmscriptenModule.HEAP16`

***

### HEAP32

> **HEAP32**: `Int32Array`

#### Inherited from

`EmscriptenModule.HEAP32`

***

### HEAP64

> **HEAP64**: `BigInt64Array`

#### Inherited from

`EmscriptenModule.HEAP64`

***

### HEAP8

> **HEAP8**: `Int8Array`

#### Inherited from

`EmscriptenModule.HEAP8`

***

### HEAPF32

> **HEAPF32**: `Float32Array`

#### Inherited from

`EmscriptenModule.HEAPF32`

***

### HEAPF64

> **HEAPF64**: `Float64Array`

#### Inherited from

`EmscriptenModule.HEAPF64`

***

### HEAPU16

> **HEAPU16**: `Uint16Array`

#### Inherited from

`EmscriptenModule.HEAPU16`

***

### HEAPU32

> **HEAPU32**: `Uint32Array`

#### Inherited from

`EmscriptenModule.HEAPU32`

***

### HEAPU64

> **HEAPU64**: `BigUint64Array`

#### Inherited from

`EmscriptenModule.HEAPU64`

***

### HEAPU8

> **HEAPU8**: `Uint8Array`

#### Inherited from

`EmscriptenModule.HEAPU8`

***

### IHEAP

> **IHEAP**: `Int32Array`

#### Inherited from

`EmscriptenModule.IHEAP`

***

### initializeSdk()

> **initializeSdk**: (`userId`) => `void`

#### Parameters

##### userId

`string`

#### Returns

`void`

#### Inherited from

[`WasmBindings`](WasmBindings.md).[`initializeSdk`](WasmBindings.md#initializesdk)

***

### initializeWithLicenseKey()

> **initializeWithLicenseKey**: (`licenceKey`, `userId`, `allowHelloMessage`) => [`LicenseUnlockResult`](../type-aliases/LicenseUnlockResult.md)

#### Parameters

##### licenceKey

`string`

##### userId

`string`

##### allowHelloMessage

`boolean`

#### Returns

[`LicenseUnlockResult`](../type-aliases/LicenseUnlockResult.md)

#### Inherited from

[`WasmBindings`](WasmBindings.md).[`initializeWithLicenseKey`](WasmBindings.md#initializewithlicensekey)

***

### isPingEnabled()

> **isPingEnabled**: () => `boolean`

#### Returns

`boolean`

#### Inherited from

[`WasmBindings`](WasmBindings.md).[`isPingEnabled`](WasmBindings.md#ispingenabled)

***

### logReadFiles

> **logReadFiles**: `boolean`

#### Inherited from

`EmscriptenModule.logReadFiles`

***

### mainScriptUrlOrBlob?

> `optional` **mainScriptUrlOrBlob**: `string`

#### Inherited from

`EmscriptenModule.mainScriptUrlOrBlob`

***

### noExitRuntime

> **noExitRuntime**: `boolean`

#### Inherited from

`EmscriptenModule.noExitRuntime`

***

### noInitialRun

> **noInitialRun**: `boolean`

#### Inherited from

`EmscriptenModule.noInitialRun`

***

### onAbort()

> **onAbort**: (`what`) => `void`

#### Parameters

##### what

`any`

#### Returns

`void`

#### Inherited from

`EmscriptenModule.onAbort`

***

### onRuntimeInitialized()

> **onRuntimeInitialized**: () => `void`

#### Returns

`void`

#### Inherited from

`EmscriptenModule.onRuntimeInitialized`

***

### postRun

> **postRun**: () => `void`[]

#### Returns

`void`

#### Inherited from

`EmscriptenModule.postRun`

***

### preInit

> **preInit**: () => `void`[]

#### Returns

`void`

#### Inherited from

`EmscriptenModule.preInit`

***

### preinitializedWebGLContext

> **preinitializedWebGLContext**: `WebGLRenderingContext`

#### Inherited from

`EmscriptenModule.preinitializedWebGLContext`

***

### preloadedAudios

> **preloadedAudios**: `any`

#### Inherited from

`EmscriptenModule.preloadedAudios`

***

### preloadedImages

> **preloadedImages**: `any`

#### Inherited from

`EmscriptenModule.preloadedImages`

***

### preRun

> **preRun**: () => `void`[]

#### Returns

`void`

#### Inherited from

`EmscriptenModule.preRun`

***

### queuePinglet()

> **queuePinglet**: (`data`, `schemaName`, `schemaVersion`, `sessionNumber`) => `void`

#### Parameters

##### data

`string`

##### schemaName

`string`

##### schemaVersion

`string`

##### sessionNumber

`number`

#### Returns

`void`

#### Inherited from

[`WasmBindings`](WasmBindings.md).[`queuePinglet`](WasmBindings.md#queuepinglet)

***

### sendPinglets()

> **sendPinglets**: () => `void`

#### Returns

`void`

#### Inherited from

[`WasmBindings`](WasmBindings.md).[`sendPinglets`](WasmBindings.md#sendpinglets)

***

### setPingProxyUrl()

> **setPingProxyUrl**: (`url`) => `void`

#### Parameters

##### url

`string`

#### Returns

`void`

#### Inherited from

[`WasmBindings`](WasmBindings.md).[`setPingProxyUrl`](WasmBindings.md#setpingproxyurl)

***

### setStatus()

> **setStatus**: (`text`) => `void`

#### Parameters

##### text

`string`

#### Returns

`void`

#### Inherited from

`EmscriptenModule.setStatus`

***

### submitServerPermission()

> **submitServerPermission**: (`serverPermission`) => `undefined` \| `Readonly`\<\{ `error`: [`ServerPermissionErrorReason`](../type-aliases/ServerPermissionErrorReason.md); `lease`: `number`; `networkErrorDescription?`: `string`; \}\>

#### Parameters

##### serverPermission

`string`

#### Returns

`undefined` \| `Readonly`\<\{ `error`: [`ServerPermissionErrorReason`](../type-aliases/ServerPermissionErrorReason.md); `lease`: `number`; `networkErrorDescription?`: `string`; \}\>

#### Inherited from

[`WasmBindings`](WasmBindings.md).[`submitServerPermission`](WasmBindings.md#submitserverpermission)

***

### terminateSdk()

> **terminateSdk**: () => `void`

#### Returns

`void`

#### Inherited from

[`WasmBindings`](WasmBindings.md).[`terminateSdk`](WasmBindings.md#terminatesdk)

***

### TOTAL\_MEMORY

> **TOTAL\_MEMORY**: `number`

#### Inherited from

`EmscriptenModule.TOTAL_MEMORY`

***

### TOTAL\_STACK

> **TOTAL\_STACK**: `number`

#### Inherited from

`EmscriptenModule.TOTAL_STACK`

***

### wasmBinary

> **wasmBinary**: `ArrayBuffer`

#### Inherited from

`EmscriptenModule.wasmBinary`

***

### wasmMemory

> **wasmMemory**: `Memory`

Allows you to provide your own WebAssembly.Memory to use as the memory. The
properties used to initialize the memory should match the compiler options.
For example, if you set INITIAL_MEMORY to 8MB without memory growth, then
the wasmMemory you provide (if any) should have both the 'initial' and
'maximum' set to 128 (due to WASM page sizes being 64KB).

#### Inherited from

`EmscriptenModule.wasmMemory`

## Methods

### \_free()

> **\_free**(`ptr`): `void`

#### Parameters

##### ptr

`number`

#### Returns

`void`

#### Inherited from

`EmscriptenModule._free`

***

### \_malloc()

> **\_malloc**(`size`): `number`

#### Parameters

##### size

`number`

#### Returns

`number`

#### Inherited from

`EmscriptenModule._malloc`

***

### addOnExit()

> **addOnExit**(`cb`): `void`

#### Parameters

##### cb

() => `any`

#### Returns

`void`

#### Inherited from

`EmscriptenModule.addOnExit`

***

### addOnInit()

> **addOnInit**(`cb`): `void`

#### Parameters

##### cb

() => `any`

#### Returns

`void`

#### Inherited from

`EmscriptenModule.addOnInit`

***

### addOnPostRun()

> **addOnPostRun**(`cb`): `void`

#### Parameters

##### cb

() => `any`

#### Returns

`void`

#### Inherited from

`EmscriptenModule.addOnPostRun`

***

### addOnPreMain()

> **addOnPreMain**(`cb`): `void`

#### Parameters

##### cb

() => `any`

#### Returns

`void`

#### Inherited from

`EmscriptenModule.addOnPreMain`

***

### addOnPreRun()

> **addOnPreRun**(`cb`): `void`

#### Parameters

##### cb

() => `any`

#### Returns

`void`

#### Inherited from

`EmscriptenModule.addOnPreRun`

***

### destroy()

> **destroy**(`object`): `void`

#### Parameters

##### object

`object`

#### Returns

`void`

#### Inherited from

`EmscriptenModule.destroy`

***

### getPreloadedPackage()

> **getPreloadedPackage**(`remotePackageName`, `remotePackageSize`): `ArrayBuffer`

#### Parameters

##### remotePackageName

`string`

##### remotePackageSize

`number`

#### Returns

`ArrayBuffer`

#### Inherited from

`EmscriptenModule.getPreloadedPackage`

***

### instantiateWasm()

> **instantiateWasm**(`imports`, `successCallback`): `undefined` \| `Exports`

#### Parameters

##### imports

`WebAssembly.Imports`

##### successCallback

(`module`) => `void`

#### Returns

`undefined` \| `Exports`

#### Inherited from

`EmscriptenModule.instantiateWasm`

***

### locateFile()

> **locateFile**(`url`, `scriptDirectory`): `string`

#### Parameters

##### url

`string`

##### scriptDirectory

`string`

#### Returns

`string`

#### Inherited from

`EmscriptenModule.locateFile`

***

### onCustomMessage()

> **onCustomMessage**(`event`): `void`

#### Parameters

##### event

`MessageEvent`

#### Returns

`void`

#### Inherited from

`EmscriptenModule.onCustomMessage`

***

### print()

> **print**(`str`): `void`

#### Parameters

##### str

`string`

#### Returns

`void`

#### Inherited from

`EmscriptenModule.print`

***

### printErr()

> **printErr**(`str`): `void`

#### Parameters

##### str

`string`

#### Returns

`void`

#### Inherited from

`EmscriptenModule.printErr`
