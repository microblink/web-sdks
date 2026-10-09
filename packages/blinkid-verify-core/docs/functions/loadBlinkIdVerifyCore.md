[**@microblink/blinkid-verify-core**](../README.md)

***

[@microblink/blinkid-verify-core](../README.md) / loadBlinkIdVerifyCore

# Function: loadBlinkIdVerifyCore()

> **loadBlinkIdVerifyCore**(`settings`, `progressCallback?`): `Promise`\<\{ `progressStatusCallback?`: `Promise`\<`undefined`\> \| `Remote`\<[`ProgressStatusCallback`](../type-aliases/ProgressStatusCallback.md)\>; `createScanningSession`: `Promise`\<`Remote`\<`Omit`\<[`BlinkIdVerifyScanningSession`](../type-aliases/BlinkIdVerifyScanningSession.md), `"process"` \| `"deleteLater"` \| `"isAliasOf"` \| `"clone"` \| `"setVerifyApiBaseUrl"`\> & `object` & `ProxyMarked`\>\>; `initBlinkIdVerify`: `Promise`\<`void`\>; `reportPinglet`: `Promise`\<`void`\>; `sendPinglets`: `Promise`\<`void`\>; `terminate`: `Promise`\<`void`\>; \}\>

Creates and initializes a BlinkIdVerify core instance.

Resolves `verifyApiBaseUrl` to an absolute URL on the main thread and passes that string to the worker.

## Parameters

### settings

Configuration for BlinkIdVerify initialization including license key and resources location

#### initialMemory?

`number`

The initial memory allocation for the Wasm module, in megabytes. Larger values may improve performance but increase
memory usage.

#### licenseKey

`string`

The license key required to unlock and use the BlinkIdVerify SDK. This must be a valid license key obtained from
Microblink.

#### microblinkProxyUrl?

`string`

The URL of the Microblink proxy server. This proxy handles requests to Microblink's Baltazar and Ping servers.

**Requirements:**

- Must be a valid HTTPS URL
- The proxy server must implement the expected Microblink API endpoints
- This feature is only available if explicitly permitted by your license

**Endpoints:**

- Ping: `{proxyUrl}/ping`
- Baltazar: `{proxyUrl}/api/v2/status/check`

**Example**

```ts
"https://your-proxy.example.com";
```

#### resourcesLocation?

`string`

The parent directory where the `/resources` directory is hosted. Defaults to `window.location.href`, at the root of
the current page.

#### verifyApiBaseUrl?

`string`

Base URL for Verify API requests.

Omitted means `window.location.origin`. Relative values resolve against the page URL. The SDK always POSTs to
`{resolved}/api/v3/verify`. The customer's server owns the real Verify host and the API key; the SDK sends no
Authorization header. This is not `microblinkProxyUrl` (that remains ping/Baltazar only).

#### wasmVariant?

`"simd"` \| `"simd-threads"` \| `"simd-relaxed"` \| `"simd-relaxed-threads"`

The WebAssembly module variant to use. Different variants may offer different performance/size tradeoffs.

### progressCallback?

[`ProgressStatusCallback`](../type-aliases/ProgressStatusCallback.md)

Optional callback for tracking resource download progress (WASM, data files)

## Returns

`Promise`\<\{ `progressStatusCallback?`: `Promise`\<`undefined`\> \| `Remote`\<[`ProgressStatusCallback`](../type-aliases/ProgressStatusCallback.md)\>; `createScanningSession`: `Promise`\<`Remote`\<`Omit`\<[`BlinkIdVerifyScanningSession`](../type-aliases/BlinkIdVerifyScanningSession.md), `"process"` \| `"deleteLater"` \| `"isAliasOf"` \| `"clone"` \| `"setVerifyApiBaseUrl"`\> & `object` & `ProxyMarked`\>\>; `initBlinkIdVerify`: `Promise`\<`void`\>; `reportPinglet`: `Promise`\<`void`\>; `sendPinglets`: `Promise`\<`void`\>; `terminate`: `Promise`\<`void`\>; \}\>

Promise that resolves with the initialized BlinkID Verify core

## Throws

Error if initialization fails
