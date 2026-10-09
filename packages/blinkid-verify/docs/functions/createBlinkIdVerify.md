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

The function sets up the entire scanning pipeline and returns a component object that provides access to all SDK
instances and destruction capabilities.

## Parameters

### options

Configuration options for the BlinkIdVerify component

#### cameraManagerUiOptions?

`Partial`\<[`CameraManagerUiOptions`](../type-aliases/CameraManagerUiOptions.md)\>

Customization options for the camera manager UI. Controls camera-related UI elements like the video feed
container and camera selection.

#### configuration?

`Partial`\<\{ `extraction`: [`VerificationExtractionConfiguration`](../type-aliases/VerificationExtractionConfiguration.md); `imageAssessment`: [`ImageAssessmentConfiguration`](../type-aliases/ImageAssessmentConfiguration.md); `verification`: [`VerificationConfiguration`](../type-aliases/VerificationConfiguration.md); \}\>

Verification, extraction, and image-assessment settings.

#### feedbackUiOptions?

`Partial`\<[`FeedbackUiOptions`](../type-aliases/FeedbackUiOptions.md)\>

Customization options for the feedback UI. Controls the appearance and behavior of scanning feedback elements.

#### initialMemory?

`number`

The initial memory allocation for the Wasm module, in megabytes. Larger values may improve performance but increase
memory usage.

#### licenseKey

`string`

The license key required to unlock and use the BlinkIdVerify SDK. This must be a valid license key obtained from
Microblink.

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
"https://your-proxy.example.com";
```

#### resourcesLocation?

`string`

The parent directory where the `/resources` directory is hosted. Defaults to `window.location.href`, at the root of
the current page.

#### targetNode?

`HTMLElement`

The HTML element where the BlinkIdVerify UI will be mounted. If not provided, the UI will be mounted to the
document body.

#### traceId?

`string`

Optional caller-supplied trace ID included in generated payloads.

#### uxManagerOptions?

`Partial`\<[`BlinkIdVerifyUxManagerOptions`](../type-aliases/BlinkIdVerifyUxManagerOptions.md)\>

Customization options for BlinkIdVerify UX manager behavior. Controls consent gating and other headless UX flow
details.

#### verifyApiBaseUrl?

`string`

Base URL for Verify API requests.

Omitted means the page origin. The SDK POSTs to `{resolved}/api/v3/verify` and sends no API key. The customer's
server adds Authorization.

#### wasmVariant?

`"simd"` \| `"simd-threads"` \| `"simd-relaxed"` \| `"simd-relaxed-threads"`

The WebAssembly module variant to use. Different variants may offer different performance/size tradeoffs.

## Returns

`Promise`\<[`BlinkIdVerifyComponent`](../type-aliases/BlinkIdVerifyComponent.md)\>

Promise that resolves to a [BlinkIdVerifyComponent](../type-aliases/BlinkIdVerifyComponent.md)

## Example

```typescript
  const blinkIdVerify = await createBlinkIdVerify({
    licenseKey: "your-license-key",
    targetNode: document.getElementById("blinkid-verify-container"),
    feedbackUiOptions: {
      showOnboardingGuide: false,
    },
  });

  blinkIdVerify.addOnCaptureCompletedCallback(async (resolver) => {
    const result = await resolver.getCaptureResult();
    console.log("Typed payload:", result.typedPayload);
  });

  blinkIdVerify.verifyOnScanningCompletion({
    onSuccess: (apiResult) => {
      console.log(apiResult);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Clean up when done
  await blinkIdVerify.destroy();
  ```;
