# BlinkID Verify Advanced Setup Example

This example application demonstrates an advanced setup of the BlinkID Verify SDK, showcasing the integration of various components such as `@microblink/blinkid-verify-core`, `@microblink/blinkid-verify-ux-manager`, and `@microblink/camera-manager`.

## Functionality

The application performs the following actions:

1.  **Initializes the BlinkID Verify Core**: It starts by loading the WebAssembly (WASM) module and initializing the scanning engine with a license key.

2.  **Creates a Scanning Session**: A new scanning session is created with specific settings.

3.  **Manages the Camera**: It utilizes the `CameraManager` to handle the camera stream.

4.  **Manages the User Experience**: The `BlinkIdVerifyUxManager` is used to orchestrate the user experience, managing the interaction between the camera and the scanning session.

5.  **Renders the UI**: The application creates and mounts the camera and feedback UI components to the DOM, rendered as a portal outside the root element. It provides an option to show or hide an onboarding guide for the user.

6.  **Handles Results**: Upon successful scanning, the application displays the captured front, back, and barcode frame images. It also includes an optional debug overlay that shows live feedback stabilizer scores as a bar chart, the current UX state key, and the processing status.

7.  **Cleanup**: When the UI is dismounted, the application terminates the BlinkID Verify Core instance to free up resources.

## Key Features Demonstrated

- **Modular Integration**: Shows how to import and use different modules of the BlinkID Verify SDK (`blinkid-verify-core`, `blinkid-verify-ux-manager`, `camera-manager`) independently.
- **Manual Control**: Demonstrates how to manually control the initialization, scanning process, and UI components.
- **Custom UI**: Provides an example of how to integrate the SDK's UI components into a custom application layout.
- **Event Handling**: Shows how to subscribe to events from the `CameraManager` and `BlinkIdVerifyUxManager` to create a responsive user experience.
- **Result Handling**: Illustrates how to receive and display scanning results, including captured document frame images.

## How to Run

For detailed instructions on how to install dependencies and run this example, please refer to the [main README file](./../README.md).
