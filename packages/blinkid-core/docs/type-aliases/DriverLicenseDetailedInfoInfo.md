[**@microblink/blinkid-core**](../README.md)

***

[@microblink/blinkid-core](../README.md) / DriverLicenseDetailedInfoInfo

# Type Alias: DriverLicenseDetailedInfoInfo\<S, D\>

> **DriverLicenseDetailedInfoInfo**\<`S`, `D`\> = `object`

## Type Parameters

### S

`S` *extends* [`StringCompleteness`](StringCompleteness.md) \| [`StringResultCompleteness`](StringResultCompleteness.md)

### D

`D` *extends* [`DateCompleteness`](DateCompleteness.md) \| [`DateResultCompleteness`](DateResultCompleteness.md)

## Properties

### conditions?

> `optional` **conditions**: `S`

***

### endorsements?

> `optional` **endorsements**: `S`

***

### restrictions?

> `optional` **restrictions**: `S`

***

### vehicleClass?

> `optional` **vehicleClass**: `S`

***

### vehicleClassesInfo?

> `optional` **vehicleClassesInfo**: [`VehicleClassInfoCompleteness`](VehicleClassInfoCompleteness.md)\<`S`, `D`\>[]
