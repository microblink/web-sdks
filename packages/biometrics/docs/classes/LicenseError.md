[**@microblink/biometrics**](../README.md)

***

[@microblink/biometrics](../README.md) / LicenseError

# Class: LicenseError

Error thrown when there is an issue with the SDK license.

## Extends

- [`BiometricsError`](BiometricsError.md)

## Constructors

### Constructor

> **new LicenseError**(`message`, `code?`, `context?`): `LicenseError`

#### Parameters

##### message

`string`

##### code?

[`BiometricsErrorCode`](../type-aliases/BiometricsErrorCode.md)

##### context?

`BiometricsErrorContext`

#### Returns

`LicenseError`

#### Overrides

[`BiometricsError`](BiometricsError.md).[`constructor`](BiometricsError.md#constructor)

## Properties

### cause?

> `readonly` `optional` **cause?**: `unknown`

#### Inherited from

[`BiometricsError`](BiometricsError.md).[`cause`](BiometricsError.md#cause)

***

### code

> `readonly` **code**: [`BiometricsErrorCode`](../type-aliases/BiometricsErrorCode.md)

Machine-readable code that identifies the failure.

#### Inherited from

[`BiometricsError`](BiometricsError.md).[`code`](BiometricsError.md#code)

***

### component

> `readonly` **component**: [`BiometricsErrorComponent`](../type-aliases/BiometricsErrorComponent.md)

SDK component that produced the failure.

#### Inherited from

[`BiometricsError`](BiometricsError.md).[`component`](BiometricsError.md#component)

***

### isRetryable

> `readonly` **isRetryable**: `boolean`

Indicates whether retrying the operation may resolve the failure.

#### Inherited from

[`BiometricsError`](BiometricsError.md).[`isRetryable`](BiometricsError.md#isretryable)

***

### stage

> `readonly` **stage**: [`BiometricsErrorStage`](../type-aliases/BiometricsErrorStage.md)

SDK lifecycle stage in which the failure occurred.

#### Inherited from

[`BiometricsError`](BiometricsError.md).[`stage`](BiometricsError.md#stage)
