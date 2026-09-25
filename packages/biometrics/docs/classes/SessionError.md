[**@microblink/biometrics**](../README.md)

***

[@microblink/biometrics](../README.md) / SessionError

# Class: SessionError

Error thrown when there is an issue with a capture session.

## Extends

- [`BiometricsError`](BiometricsError.md)

## Constructors

### Constructor

> **new SessionError**(`message`, `code`, `options?`): `SessionError`

#### Parameters

##### message

`string`

##### code

[`BiometricsErrorCode`](../type-aliases/BiometricsErrorCode.md)

##### options?

`BiometricsErrorContext` & `object`

#### Returns

`SessionError`

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
