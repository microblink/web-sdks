[**@microblink/blinkid**](../README.md)

***

[@microblink/blinkid](../README.md) / BlinkIdTimeoutConfiguration

# Type Alias: BlinkIdTimeoutConfiguration

> **BlinkIdTimeoutConfiguration** = `object`

Copyright (c) 2026 Microblink Ltd. All rights reserved.

## Properties

### inactivityTimeoutMs

> **inactivityTimeoutMs**: `number` \| `null`

Maximum allowed inactivity window in milliseconds. The inactivity timer is
reset whenever the stabilized BlinkID UI state changes. Set to `null` to
disable the inactivity timeout.

***

### partiallySupportedBarcodeResolveTimeoutMs

> **partiallySupportedBarcodeResolveTimeoutMs**: `number` \| `null`

Active-capture delay before resolving a barcode step once BlinkID reports a
barcode whose parsing is not supported. Set to `null` to disable automatic
resolution for partially supported barcodes.

***

### scanStepTimeoutMs

> **scanStepTimeoutMs**: `number` \| `null`

Maximum allowed capture duration for a single BlinkID scan step in
milliseconds. Set to `null` to disable the scan-step timeout.
