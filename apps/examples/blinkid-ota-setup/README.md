# BlinkID OTA Setup Example

This example application demonstrates how to configure over-the-air (OTA) document-support resource updates when initializing BlinkID with `createBlinkId`. OTA lets Microblink add or update supported document resources without requiring a new SDK release or application package update.

## Functionality

The application performs the following actions:

1.  **Initializes BlinkID with OTA settings**: It calls `createBlinkId` with an `otaResources` configuration that controls how the SDK loads baseline OTA files and checks for newer resources from an OTA provider.

2.  **Configures OTA behavior**: The example sets:
    - `strict: true` — fail initialization if the OTA download fails (instead of falling back to the hosted baseline)
    - `checkForUpdates: true` — always query the OTA provider for a newer compatible version
    - `otaResourceProviderUrl: undefined` — use Microblink's default OTA service (`https://blinkid-ota.microblink.com`); set a URL to use a proxy or self-hosted provider
    - `resourcesLocation: "custom-ota-resources"` — load the hosted/bundled OTA baseline from that path (see `public/custom-ota-resources` for the expected layout)
    - `timeoutMilis: 5000` — OTA service request timeout in milliseconds

3.  **Sets up a Result Callback**: It registers a callback that runs when a document is successfully scanned and logs the result to the console.

4.  **Cleans up Resources**: After logging the result, it calls `destroy` to release SDK resources.

## Key Features Demonstrated

- **OTA resource bootstrap**: Shows how to pass `otaResources` to `createBlinkId` to customize document-support resource loading at init time.
- **Strict vs fallback behavior**: Demonstrates failing hard on OTA errors (`strict: true`) instead of silently using the hosted baseline.
- **Update checks**: Illustrates enabling provider checks with `checkForUpdates`, and notes that `checkForUpdates: false` skips the provider and uses only the hosted baseline.
- **Custom baseline location**: Points `resourcesLocation` at custom OTA baseline files instead of the default SDK path.
- **Provider / proxy override**: Leaves `otaResourceProviderUrl` unset for Microblink's service, with guidance for pointing it at a proxy or self-hosted endpoint that implements the versions API.
- **High-level API**: Still uses the simple `createBlinkId` flow for scanning, result handling, and cleanup.

## How to Run

For detailed instructions on how to install dependencies and run this example, please refer to the [main README file](./../README.md).
