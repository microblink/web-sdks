[**@microblink/blinkid**](../README.md)

***

[@microblink/blinkid](../README.md) / RedactionSettings

# Type Alias: RedactionSettings

> **RedactionSettings** = `object`

## Properties

### documentNumberRedactionSettings?

> `optional` **documentNumberRedactionSettings**: [`DocumentNumberRedactionSettings`](DocumentNumberRedactionSettings.md)

Document number redaction settings.

#### Default

```ts
undefined
```

***

### fields

> **fields**: [`FieldType`](FieldType.md)[]

Fields to be redacted.

Using this member to redact MRZ is deprecated. Use `redactMrz` instead.

#### Default

```ts
[ ]
```

***

### mode

> **mode**: [`RedactionMode`](RedactionMode.md)

***

### redactBarcode

> **redactBarcode**: `boolean`

If true, the whole Barcode result will be redacted.

This will redact the barcode result data and remove the 'barcodeImage' from
the subresults.

This setting uses the `mode` member to determine what will be redacted
(e.g., full result, barcode image only, etc.).

#### Default

```ts
false
```

***

### redactMrz

> **redactMrz**: `boolean`

If true, the whole MRZ will be redacted.

This is the recommended way to redact MRZ (replacing the use of `fields`).
This setting uses the `mode` member to determine what will be redacted
(e.g., full result, image only, etc.).

#### Default

```ts
false
```
