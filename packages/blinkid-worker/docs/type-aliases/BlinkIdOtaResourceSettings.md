[**@microblink/blinkid-worker**](../README.md)

***

[@microblink/blinkid-worker](../README.md) / BlinkIdOtaResourceSettings

# Type Alias: BlinkIdOtaResourceSettings

> **BlinkIdOtaResourceSettings** = `object`

## Properties

### checkForUpdates?

> `optional` **checkForUpdates**: `boolean`

Check the OTA provider for newer resources during SDK initialization.

The hosted baseline resources are always loaded.

#### Default Value

`true`

***

### otaResourceProviderUrl?

> `optional` **otaResourceProviderUrl**: `string`

Base URL of the OTA resource provider service.

Use this when the SDK should ask an OTA API service for the current
resource download URLs.

#### Default Value

`"https://blinkid-ota.microblink.com"`

***

### resourcesLocation?

> `optional` **resourcesLocation**: `string`

Base URL where the baseline OTA resource files are hosted.

When omitted, the worker loads them from the SDK's
`resources/ota-resources` directory.

***

### strict?

> `optional` **strict**: `boolean`

Fail SDK initialization when OTA resolve or download fails.

#### Default Value

`false`

***

### timeoutMilis?

> `optional` **timeoutMilis**: `number`

#### Default

```ts
20_000
OTA resource download timeout.

If strict is
```

#### True

the SDK will throw TimeoutError DOMException on initialization if the download times out.
