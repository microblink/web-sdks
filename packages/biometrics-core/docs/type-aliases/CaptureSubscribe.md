[**@microblink/biometrics-core**](../README.md)

***

[@microblink/biometrics-core](../README.md) / CaptureSubscribe

# Type Alias: CaptureSubscribe

> **CaptureSubscribe** = \{(`listener`): () => `void`; \<`T`\>(`selector`, `listener`, `options?`): () => `void`; \}

`BiometricsCaptureSession.subscribe`.

## Call Signature

> (`listener`): () => `void`

### Parameters

#### listener

(`state`, `prevState`) => `void`

### Returns

() => `void`

## Call Signature

> \<`T`\>(`selector`, `listener`, `options?`): () => `void`

### Type Parameters

#### T

`T`

### Parameters

#### selector

(`state`) => `T`

#### listener

(`selectedState`, `previousSelectedState`) => `void`

#### options?

##### equalityFn?

(`a`, `b`) => `boolean`

##### fireImmediately?

`boolean`

### Returns

() => `void`
