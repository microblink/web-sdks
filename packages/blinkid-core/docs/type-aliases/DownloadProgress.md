[**@microblink/blinkid-core**](../README.md)

***

[@microblink/blinkid-core](../README.md) / DownloadProgress

# Type Alias: DownloadProgress

> **DownloadProgress** = `object`

Progress reported during a resource download.

## Properties

### contentLength

> **contentLength**: `number`

Expected total number of bytes. This value can change when authoritative response metadata becomes available.

***

### finished

> **finished**: `boolean`

Whether every resource represented by this snapshot has completed its required post-download processing.

***

### loaded

> **loaded**: `number`

Number of bytes downloaded for the resources represented by this snapshot.

This value can reset or decrease when a resource is retried.

***

### progress

> **progress**: `number`

Progress percentage reported by the producer.

Consumers should prefer this value over deriving a percentage from `loaded` and `contentLength`, because aggregate
producers can keep it monotonic while expected totals change.
