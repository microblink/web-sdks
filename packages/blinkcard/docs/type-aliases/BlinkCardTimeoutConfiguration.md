[**@microblink/blinkcard**](../README.md)

***

[@microblink/blinkcard](../README.md) / BlinkCardTimeoutConfiguration

# Type Alias: BlinkCardTimeoutConfiguration

> **BlinkCardTimeoutConfiguration** = `object`

Copyright (c) 2026 Microblink Ltd. All rights reserved.

## Properties

### inactivityTimeoutMs

> **inactivityTimeoutMs**: `number` \| `null`

Maximum allowed inactivity window in milliseconds. The inactivity timer is reset whenever the stabilized BlinkCard
UI state changes. Set to `null` to disable the inactivity timeout.

***

### scanStepTimeoutMs

> **scanStepTimeoutMs**: `number` \| `null`

Maximum allowed capture duration for a single BlinkCard scan step in milliseconds. Set to `null` to disable the
scan-step timeout.
