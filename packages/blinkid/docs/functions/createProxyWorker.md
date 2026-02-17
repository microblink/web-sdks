[**@microblink/blinkid**](../README.md)

***

[@microblink/blinkid](../README.md) / createProxyWorker

# Function: createProxyWorker()

> **createProxyWorker**\<`T`\>(`resourcesLocation`, `workerScriptName`): `Promise`\<`Remote`\<`T`\>\>

Creates a Comlink-proxied Web Worker (generic) with automatic ImageData buffer transfer.

This function wraps the worker proxy to automatically transfer ImageData buffers when calling
`session.process()`, eliminating ~8MB copy per frame during scanning.

The wrapper intercepts `createScanningSession` and wraps the returned session to auto-transfer
ImageData buffers when `process()` is called. This pattern is common across all Microblink SDKs.

## Type Parameters

### T

`T` *extends* `BaseSdkWorkerProxy`

## Parameters

### resourcesLocation

`string`

Where the "resources" directory is placed.

### workerScriptName

`string`

The worker script filename.

## Returns

`Promise`\<`Remote`\<`T`\>\>

A promise that resolves with a Comlink-proxied instance of the Web Worker.
