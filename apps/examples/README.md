# BlinkID, BlinkCard, and BlinkID Verify Example Applications

This directory contains example applications demonstrating the capabilities of the BlinkID, BlinkCard, and BlinkID Verify SDKs.

## Available Examples

### BlinkID

- [BlinkID Simple](./blinkid-simple/): A simple example of how to use the BlinkID SDK.
- [BlinkID Advanced Setup](./blinkid-advanced-setup/): Demonstrates advanced setup and customization of the BlinkID SDK.
- [BlinkID Custom UI](./blinkid-custom-ui/): Shows how to build an application-owned interface with the framework-independent Core entrypoints.
- [BlinkID OTA Setup](./blinkid-ota-setup/): Demonstrates how to configure over-the-air (OTA) document-support resource updates when initializing BlinkID.
- [BlinkID UI Overrides](./blinkid-ui-overrides/): Shows how to disable or replace selected parts of the provided UI while retaining the scanning interface.
- [BlinkID Photo Upload](./blinkid-photo-upload/): An example of how to use the BlinkID SDK with photo upload functionality.
- [BlinkID Core API](./blinkid-core-api/): Shows how to use the core API of the BlinkID SDK.
- [BlinkID Preload](./blinkid-preload/): Demonstrates how to preload the BlinkID SDK for faster initialization.

### BlinkCard

- [BlinkCard Simple](./blinkcard-simple/): A simple example of how to use the BlinkCard SDK.
- [BlinkCard Advanced Setup](./blinkcard-advanced-setup/): Demonstrates advanced setup and customization of the BlinkCard SDK.
- [BlinkCard Custom UI](./blinkcard-custom-ui/): Shows how to build an application-owned interface with the framework-independent Core entrypoints.

### Camera

- [Camera Manager](./camera-manager/): An example of how to use the camera manager.
- [Camera Manager Custom UI](./camera-manager-custom-ui/): Shows camera controls and frame capture with an application-owned interface.
- [Camera Selection](./camera-selection/): An example of how to use the camera selection feature.

### BlinkID Verify

- [BlinkID Verify Simple](./blinkid-verify-simple/): A simple example of how to use the BlinkID Verify SDK.
- [BlinkID Verify Advanced Setup](./blinkid-verify-advanced-setup/): Demonstrates advanced setup and customization of the BlinkID Verify SDK.
- [BlinkID Verify Custom UI](./blinkid-verify-custom-ui/): Shows how to build an application-owned interface with the framework-independent Core entrypoints.

## Getting Started

To run any of the example applications, follow these steps:

### 1. Install Dependencies

From the root of the monorepo, install the necessary dependencies using `pnpm`:

```bash
pnpm install
```

### 2. Build Monorepo Packages

Before running the example applications, you need to build the monorepo packages. From the root of the monorepo, run:

```bash
pnpm build:packages
```

### 3. Set up the License Key

BlinkID, BlinkCard, and BlinkID Verify example applications require a license key to run. You can obtain a free trial license key by registering on the [Microblink Developer Hub](https://developer.microblink.com/license/new).

After obtaining the license key, create a `.env.local` file in the root of the specific example application you want to run (e.g., `apps/examples/blinkid-simple/.env.local`) and add the following line:

```env
VITE_LICENCE_KEY=your-license-key
```

Replace `your-license-key` with the actual license key you obtained.

**Note:** The `camera-manager` and `camera-selection` examples do not require a license key.

### 4. Run an Example Application

Navigate to the directory of the example you want to run and start the development server.

For example, to run the `blinkid-simple` example:

```bash
cd apps/examples/blinkid-simple
pnpm dev
```

This will start a development server, and you can view the application in your browser at the address provided in the terminal.
