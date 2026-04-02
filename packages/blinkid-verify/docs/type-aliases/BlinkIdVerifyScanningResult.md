[**@microblink/blinkid-verify**](../README.md)

***

[@microblink/blinkid-verify](../README.md) / BlinkIdVerifyScanningResult

# Type Alias: BlinkIdVerifyScanningResult

> **BlinkIdVerifyScanningResult** = `EmbindObject`\<\{ `backFrame`: [`CapturedFrame`](../interfaces/CapturedFrame.md) \| `undefined`; `barcodeFrame`: [`CapturedFrame`](../interfaces/CapturedFrame.md) \| `undefined`; `frontFrame`: [`CapturedFrame`](../interfaces/CapturedFrame.md) \| `undefined`; \}\>

Represents the final result of scanning both sides of the document. It
potentially contains the captured frames for the front, back, and barcode.
