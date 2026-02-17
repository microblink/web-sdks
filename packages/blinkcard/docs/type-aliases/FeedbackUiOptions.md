[**@microblink/blinkcard**](../README.md)

***

[@microblink/blinkcard](../README.md) / FeedbackUiOptions

# Type Alias: FeedbackUiOptions

> **FeedbackUiOptions** = `object`

The options for the createBlinkCardFeedbackUi function.

## Properties

### helpTooltipHideDelay?

> `optional` **helpTooltipHideDelay**: `number` \| `null`

Time in ms before the help tooltip is hidden. If null, tooltip won't be auto hidden.

#### Default Value

```ts
5000
```

***

### helpTooltipShowDelay?

> `optional` **helpTooltipShowDelay**: `number` \| `null`

Time in ms before the help tooltip is shown. If null, tooltip won't be auto shown.

#### Default Value

```ts
5000
```

***

### localizationStrings?

> `optional` **localizationStrings**: [`PartialLocalizationStrings`](PartialLocalizationStrings.md)

The localization strings.

***

### showHelpButton?

> `optional` **showHelpButton**: `boolean`

If set to `true`, the help button will be shown.

#### Default Value

```ts
true
```

***

### showOnboardingGuide?

> `optional` **showOnboardingGuide**: `boolean`

If set to `true`, the onboarding guide will be shown.

#### Default Value

```ts
true
```

***

### showTimeoutModal?

> `optional` **showTimeoutModal**: `boolean`

If set to `true`, the timeout modal will be shown.

#### Default Value

```ts
true
```
