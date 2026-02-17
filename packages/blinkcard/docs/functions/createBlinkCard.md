[**@microblink/blinkcard**](../README.md)

***

[@microblink/blinkcard](../README.md) / createBlinkCard

# Function: createBlinkCard()

> **createBlinkCard**(`options`): `Promise`\<[`BlinkCardComponent`](../type-aliases/BlinkCardComponent.md)\>

Creates a BlinkCard component with all necessary SDK instances and UI elements.

This function initializes the complete BlinkCard scanning system including:
- BlinkCard Core SDK for document processing
- Camera Manager for video capture and camera control
- UX Manager for coordinating scanning workflow
- Camera UI for video display and camera controls
- Feedback UI for scanning guidance and status

The function sets up the entire scanning pipeline and returns a component
object that provides access to all SDK instances and destruction capabilities.

## Parameters

### options

Configuration options for the BlinkCard component

#### cameraManagerUiOptions?

`Partial`\<[`CameraManagerUiOptions`](../type-aliases/CameraManagerUiOptions.md)\>

Customization options for the camera manager UI.
Controls camera-related UI elements like the video feed container and camera selection.

#### feedbackLocalization?

`Partial`\<`string` & `Record`\<`string`, `never`\> \| \{ `feedback_messages`: `string` & `Record`\<`string`, `never`\> \| \{ `blur_detected`: `string` & `Record`\<`string`, `never`\> \| `"Keep card and phone still"`; `blur_detected_desktop`: `string` & `Record`\<`string`, `never`\> \| `"Keep card and device still"`; `camera_angle_too_steep`: `string` & `Record`\<`string`, `never`\> \| `"Keep card parallel to phone"`; `camera_angle_too_steep_desktop`: `string` & `Record`\<`string`, `never`\> \| `"Keep card parallel with screen"`; `card_number_scanned`: `string` & `Record`\<`string`, `never`\> \| `"Success! Card number side scanned"`; `card_scanned`: `string` & `Record`\<`string`, `never`\> \| `"Success! Card scanned"`; `document_too_close_to_edge`: `string` & `Record`\<`string`, `never`\> \| `"Move farther"`; `flip_card`: `string` & `Record`\<`string`, `never`\> \| `"Flip the card over"`; `flip_to_back_side`: `string` & `Record`\<`string`, `never`\> \| `"Flip the card over"`; `move_closer`: `string` & `Record`\<`string`, `never`\> \| `"Move closer"`; `move_farther`: `string` & `Record`\<`string`, `never`\> \| `"Move farther"`; `occluded`: `string` & `Record`\<`string`, `never`\> \| `"Keep the card fully visible"`; `scan_the_back_side`: `string` & `Record`\<`string`, `never`\> \| `"Scan the other side of the card"`; `scan_the_front_side`: `string` & `Record`\<`string`, `never`\> \| `"Scan the card number"`; \}; `help_button`: `string` & `Record`\<`string`, `never`\> \| \{ `aria_label`: `string` & `Record`\<`string`, `never`\> \| `"Help"`; `tooltip`: `string` & `Record`\<`string`, `never`\> \| `"Need help?"`; \}; `help_modal`: `string` & `Record`\<`string`, `never`\> \| \{ `back_btn`: `string` & `Record`\<`string`, `never`\> \| `"Back"`; `blur`: `string` & `Record`\<`string`, `never`\> \| \{ `details`: ... & ... \| `"Try to keep the phone and card still while scanning. Moving either can blur the image and make data on the card unreadable."`; `details_desktop`: ... & ... \| `"Try to keep the device and card still while scanning. Moving either can blur the image and make data on the card unreadable."`; `title`: ... & ... \| `"Keep still while scanning"`; \}; `camera_lens`: `string` & `Record`\<`string`, `never`\> \| \{ `details`: ... & ... \| `"Check your camera lens for smudges or dust. A dirty lens causes the final image to blur, making the card details unreadable and preventing successful scan of the data."`; `title`: ... & ... \| `"Clean your camera lens"`; \}; `card_number`: `string` & `Record`\<`string`, `never`\> \| \{ `details`: ... & ... \| `"Card number is usually a 16-digit number, although it may have between 12 and 19 digits. It should be either printed or embossed in raised numbers across the card. It can be on the front or back of your card."`; `title`: ... & ... \| `"Where’s the card number?"`; \}; `done_btn`: `string` & `Record`\<`string`, `never`\> \| `"Done"`; `lighting`: `string` & `Record`\<`string`, `never`\> \| \{ `details`: ... & ... \| `"Avoid direct harsh light because it reflects from the card and can make parts of the card unreadable. If you can’t read data on the card, it won’t be visible to the camera either."`; `title`: ... & ... \| `"Watch out for harsh light"`; \}; `next_btn`: `string` & `Record`\<`string`, `never`\> \| `"Next"`; `occlusion`: `string` & `Record`\<`string`, `never`\> \| \{ `details`: ... & ... \| `"Make sure you aren’t covering parts of the card with a finger, including the bottom lines. Also, watch out for hologram reflections that go over the cards’ fields."`; `title`: ... & ... \| `"Keep all the fields visible"`; \}; \}; `onboarding_modal`: `string` & `Record`\<`string`, `never`\> \| \{ `btn`: `string` & `Record`\<`string`, `never`\> \| `"Start scanning"`; `details`: `string` & `Record`\<`string`, `never`\> \| `"Card number is usually a 16-digit number. It should be either printed or embossed in raised numbers across the card. Make sure that the card is well lit and all details are visible."`; `details_desktop`: `string` & `Record`\<`string`, `never`\> \| `"Card number is usually a 16-digit number. It should be either printed or embossed in raised numbers across the card. Make sure your camera lens is clean, the card is well lit, and all details are visible."`; `title`: `string` & `Record`\<`string`, `never`\> \| `"Scan the card number first"`; \}; `timeout_modal`: `string` & `Record`\<`string`, `never`\> \| \{ `cancel_btn`: `string` & `Record`\<`string`, `never`\> \| `"Cancel"`; `details`: `string` & `Record`\<`string`, `never`\> \| `"Unable to read the card. Please try again."`; `retry_btn`: `string` & `Record`\<`string`, `never`\> \| `"Retry"`; `title`: `string` & `Record`\<`string`, `never`\> \| `"Scan unsuccessful"`; \}; \}\>

Custom localization strings for the feedback UI.
Allows overriding default text messages shown during scanning.

#### feedbackUiOptions?

`Partial`\<[`FeedbackUiOptions`](../type-aliases/FeedbackUiOptions.md)\>

Customization options for the feedback UI.
Controls the appearance and behavior of scanning feedback elements.

#### initialMemory?

`number`

The initial memory allocation for the Wasm module, in megabytes.
Larger values may improve performance but increase memory usage.

#### licenseKey

`string`

The license key required to unlock and use the BlinkCard SDK.
This must be a valid license key obtained from Microblink.

#### microblinkProxyUrl?

`string`

The URL of the Microblink proxy server. This proxy handles requests to Microblink's Baltazar and Ping servers.

**Requirements:**
- Must be a valid HTTPS URL
- The proxy server must implement the expected Microblink API endpoints
- This feature is only available if explicitly permitted by your license

**Endpoints:**
- Ping: `{proxyUrl}/ping`
- Baltazar: `{proxyUrl}/api/v2/status/check`

**Example**

```ts
"https://your-proxy.example.com"
```

#### resourcesLocation?

`string`

The parent directory where the `/resources` directory is hosted.
Defaults to `window.location.href`, at the root of the current page.

#### scanningSettings?

`Partial`\<\{ `anonymizationSettings`: `Partial`\<`OverrideProperties`\<[`AnonymizationSettings`](../type-aliases/AnonymizationSettings.md), \{ `cardNumberAnonymizationSettings`: `Partial`\<[`CardNumberAnonymizationSettings`](../type-aliases/CardNumberAnonymizationSettings.md)\>; \}\>\>; `croppedImageSettings`: `Partial`\<[`CroppedImageSettings`](../type-aliases/CroppedImageSettings.md)\>; `extractionSettings`: `Partial`\<[`ExtractionSettings`](../type-aliases/ExtractionSettings.md)\>; `inputImageMargin`: `number`; `livenessSettings`: `Partial`\<[`LivenessSettings`](../type-aliases/LivenessSettings.md)\>; `skipImagesWithBlur`: `boolean`; `tiltDetectionLevel`: [`DetectionLevel`](../type-aliases/DetectionLevel.md); \}\>

#### targetNode?

`HTMLElement`

The HTML element where the BlinkCard UI will be mounted.
If not provided, the UI will be mounted to the document body.

#### userId?

`string`

A unique identifier for the user/session.
Used for analytics and tracking purposes.

#### wasmVariant?

`"basic"` \| `"advanced"` \| `"advanced-threads"`

The WebAssembly module variant to use.
Different variants may offer different performance/size tradeoffs.

## Returns

`Promise`\<[`BlinkCardComponent`](../type-aliases/BlinkCardComponent.md)\>

Promise that resolves to a BlinkCardComponent with all SDK instances and UI elements

## Example

```typescript
const blinkCard = await createBlinkCard({
  licenseKey: "your-license-key",
  targetNode: document.getElementById("blinkcard-container"),
  feedbackUiOptions: {
    showOnboardingGuide: false
  }
});

// Add result callback
blinkCard.addOnResultCallback((result) => {
  console.log("Scanning result:", result);
});

// Clean up when done
await blinkCard.destroy();
```
