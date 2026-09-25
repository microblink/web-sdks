[**@microblink/biometrics-ux-manager**](../../README.md)

***

[@microblink/biometrics-ux-manager](../../README.md) / [index](../README.md) / BiometricsError

# Class: BiometricsError

Base error class for all Biometrics errors.

## Extends

- `Error`

## Constructors

### Constructor

> **new BiometricsError**(`options`): `BiometricsError`

#### Parameters

##### options

`BiometricsErrorOptions`

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
