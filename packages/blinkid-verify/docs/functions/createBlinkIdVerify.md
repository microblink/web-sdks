[**@microblink/blinkid-verify**](../README.md)

***

[@microblink/blinkid-verify](../README.md) / createBlinkIdVerify

# Function: createBlinkIdVerify()

> **createBlinkIdVerify**(`options`): `Promise`\<[`BlinkIdVerifyComponent`](../type-aliases/BlinkIdVerifyComponent.md)\>

Creates a BlinkIdVerify component with all necessary SDK instances and UI elements.

This function initializes the complete BlinkIdVerify scanning system including:
- BlinkIdVerify Core SDK for document processing
- Camera Manager for video capture and camera control
- UX Manager for coordinating scanning workflow
- Camera UI for video display and camera controls
- Feedback UI for scanning guidance and status

The function sets up the entire scanning pipeline and returns a component
object that provides access to all SDK instances and destruction capabilities.

## Parameters

### options

Configuration options for the BlinkIdVerify component

#### cameraManagerUiOptions?

`Partial`\<[`CameraManagerUiOptions`](../type-aliases/CameraManagerUiOptions.md)\>

Customization options for the camera manager UI.
Controls camera-related UI elements like the video feed container and camera selection.

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

The license key required to unlock and use the BlinkIdVerify SDK.
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

`Partial`\<\{ `barcodeAnomalyMatchLevel`: [`MatchLevel`](../type-aliases/MatchLevel.md); `dataMatchMatchLevel`: [`MatchLevel`](../type-aliases/MatchLevel.md); `imageQualitySettings`: [`ImageQualitySettings`](../type-aliases/ImageQualitySettings.md); `screenAnalysisMatchLevel`: [`MatchLevel`](../type-aliases/MatchLevel.md); `staticSecurityFeaturesMatchLevel`: [`MatchLevel`](../type-aliases/MatchLevel.md); `treatExpirationAsFraud`: `boolean`; `useCase`: [`UseCase`](../type-aliases/UseCase.md); \}\>

Specific settings for the scanning process. If no settings are provided,
defaults will be used.

#### targetNode?

`HTMLElement`

The HTML element where the BlinkIdVerify UI will be mounted.
If not provided, the UI will be mounted to the document body.

#### userId?

`string`

A unique identifier for the user/session.
Used for analytics and tracking purposes.

#### wasmVariant?

`"advanced"` \| `"advanced-threads"`

The WebAssembly module variant to use.
Different variants may offer different performance/size tradeoffs.

## Returns

`Promise`\<[`BlinkIdVerifyComponent`](../type-aliases/BlinkIdVerifyComponent.md)\>

Promise that resolves to a BlinkIdVerifyComponent with all SDK instances and UI elements

## Example

```typescript
const blinkIdVerify = await createBlinkIdVerify({
  licenseKey: "your-license-key",
  targetNode: document.getElementById("blinkid-verify-container"),
  feedbackUiOptions: {
    showOnboardingGuide: false
  }
});

// Add result callback
blinkIdVerify.addOnResultCallback((result) => {
  console.log("Scanning result:", result);
});

// Clean up when done
await blinkIdVerify.destroy();
```
