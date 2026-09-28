[**@microblink/biometrics-ux-manager**](../../README.md)

***

[@microblink/biometrics-ux-manager](../../README.md) / [index](../README.md) / BiometricsFeedbackUiOptions

# Type Alias: BiometricsFeedbackUiOptions\<DialogKind\>

> **BiometricsFeedbackUiOptions**\<`DialogKind`\> = [`FeedbackUiOptions`](FeedbackUiOptions.md) & `object`

## Type Declaration

### errorDialogs?

> `optional` **errorDialogs?**: [`BiometricsErrorDialogs`](BiometricsErrorDialogs.md)\<`DialogKind`\>

Dialog copy for error dialog kinds added through the manager's `resolveErrorDialogKind` option.

### onClose?

> `optional` **onClose?**: () => `void`

#### Returns

`void`

## Type Parameters

### DialogKind

`DialogKind` *extends* `string` = `never`
