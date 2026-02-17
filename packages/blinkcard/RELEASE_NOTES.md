## v3000.0.0

### New fraud detection: BIN intelligence

BIN intelligence enhances payment risk assessment at the moment of card capture.
Real-time BIN lookup validates the PAN and returns detailed card information, including type, brand, category, issuing bank, and issuer country.
This additional fraud signal helps customers identify high-risk transactions early, before the transaction begins.

### Architectural shift: session-based API

The legacy `Recognizer` architecture is deprecated. BlinkCard v3000 moves to a session-based model, decoupling scanning logic from the UI lifecycle and enabling a headless integration for custom implementations.

### Epoch versioning scheme

We are moving to an Epoch-based versioning system: `(EPOCH * 1000 + MAJOR).MINOR.PATCH`. This new versioning makes it easier for customers to immediately identify the impact of an update and plan upgrades with confidence.

- **EPOCH**: Fundamental architectural rewrites.
- **MAJOR**: Breaking API changes.
- **MINOR**: New features, backward-compatible.
- **PATCH**: Bug fixes.

### Other improvements

- **i18n**: Expanded localization support to better serve a global user base: we added 33 new languages, bringing the total supported languages to 56, enabling a more convenient user experience across diverse regions.
- **a11y**: Enhanced accessibility capabilities, including support for screen readers.
- We introduced more granular event tracking throughout the SDK lifecycle, enabling customers to gain deeper insights into success rates and drop-off points during scanning sessions. These enhanced analytics help identify optimization opportunities and ensure an improved, more reliable user experience.
- Improved photocopy detection model, reducing FAR@FRR of 1% from 27.53% to 13.69%, significantly enhancing reliability.

### Highlights & integration improvements

- **Modular Packages**: The SDK is now split into specific domains to optimize bundle size:
  - `@microblink/blinkcard`: Core orchestration and the all-in-one package.
  - `@microblink/blinkcard-core`: WASM scanning engine.
  - `@microblink/blinkcard-ux-manager`: Prebuilt, customizable UI components, and ux manager.
  - `@microblink/camera-manager`: Hardware abstraction layer for camera streams, and for camera stream handling.
- **TypeScript**: Full rewrite utilizing modern TS features for better type inference and DX.

### Implementation example

The new API provides a streamlined initialization and execution path:

```ts
import { createBlinkCard } from "@microblink/blinkcard";
/**
 * This is the main component of the application.
 * It creates the BlinkCard instance. For additional configuration look at the
 * createBlinkCard function.
 *
 * @see https://github.com/microblink/web-sdks/blob/main/packages/blinkcard/docs/functions/createBlinkCard.md
 */
const blinkcard = await createBlinkCard({
  licenseKey: import.meta.env.VITE_LICENCE_KEY,
});
/**
 * This callback is called when the result is ready.
 * This is useful if you want to perform some actions when the result is ready.
 * For additional configuration look at the addOnResultCallback function.
 *
 * @see https://github.com/microblink/web-sdks/blob/main/packages/blinkcard/docs/type-aliases/BlinkCardComponent.md#addonresultcallback
 */
blinkcard.addOnResultCallback((result) => {
  console.log("Result:", result);
  void blinkcard.destroy();
```

### Migration notes

- **License keys**: Existing v2.x keys are compatible with v3000.
- **Documentation**: Detailed migration guide available in our [docs](https://blinkcard.docs.microblink.com/migration-v3000).
