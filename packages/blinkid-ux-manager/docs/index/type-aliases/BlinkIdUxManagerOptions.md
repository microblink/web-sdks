[**@microblink/blinkid-ux-manager**](../../README.md)

***

[@microblink/blinkid-ux-manager](../../README.md) / [index](../README.md) / BlinkIdUxManagerOptions

# Type Alias: BlinkIdUxManagerOptions

> **BlinkIdUxManagerOptions** = `object`

Options for the BlinkIdUxManager.

## Properties

### enablePassportOnlyExtractionMode?

> `optional` **enablePassportOnlyExtractionMode?**: `boolean`

Enables passport only extraction mode with a custom ui suited for scanning passports.

***

### initialUiStateKey?

> `optional` **initialUiStateKey?**: [`BlinkIdUiStateKey`](BlinkIdUiStateKey.md)

Initial UI state key used by the manager/stabilizer reset flow. Defaults to `INTRO_FRONT_PAGE`.

***

### timeoutConfiguration?

> `optional` **timeoutConfiguration?**: `Partial`\<[`BlinkIdTimeoutConfiguration`](BlinkIdTimeoutConfiguration.md)\>

Configures BlinkID scanning timeout behavior.
