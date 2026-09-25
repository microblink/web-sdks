[**@microblink/biometrics-core**](../README.md)

***

[@microblink/biometrics-core](../README.md) / BiometricsError

# Class: BiometricsError

Base error class for all Biometrics errors.

## Extends

- `Error`

## Extended by

- [`LicenseError`](LicenseError.md)
- [`ConfigurationError`](ConfigurationError.md)
- [`SessionError`](SessionError.md)
- [`PermissionError`](PermissionError.md)

## Constructors

### Constructor

> **new BiometricsError**(`options`): `BiometricsError`

#### Parameters

##### options

[`BiometricsErrorOptions`](../type-aliases/BiometricsErrorOptions.md)

#### Returns

`BiometricsError`

#### Overrides

`Error.constructor`

## Properties

### cause?

> `readonly` `optional` **cause?**: `unknown`

#### Overrides

`Error.cause`

***

### code

> `readonly` **code**: [`BiometricsErrorCode`](../type-aliases/BiometricsErrorCode.md)

Machine-readable code that identifies the failure.

***

### component

> `readonly` **component**: [`BiometricsErrorComponent`](../type-aliases/BiometricsErrorComponent.md)

SDK component that produced the failure.

***

### isRetryable

> `readonly` **isRetryable**: `boolean`

Indicates whether retrying the operation may resolve the failure.

***

### stage

> `readonly` **stage**: [`BiometricsErrorStage`](../type-aliases/BiometricsErrorStage.md)

SDK lifecycle stage in which the failure occurred.
