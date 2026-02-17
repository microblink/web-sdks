# BlinkCard Advanced Example

This example application demonstrates an advanced setup of the BlinkCard SDK, showcasing the integration of modular packages such as `@microblink/blinkcard-core`, `@microblink/blinkcard-ux-manager`, and `@microblink/camera-manager`.

## Functionality

The application performs the following actions:

1. **Initializes BlinkCard Core**: It loads the WebAssembly (WASM) resources and initializes the scanning engine using a license key.
2. **Creates a Scanning Session**: It starts a new scanning session with explicit scanning settings.
3. **Manages Camera Access**: It creates and controls a `CameraManager` instance for camera stream and frame capture.
4. **Manages UX Flow**: It creates a BlinkCard UX manager to orchestrate scanning behavior and callbacks.
5. **Renders Camera + Feedback UI**: It mounts camera UI and feedback UI, and demonstrates onboarding control.
6. **Handles Results**: It listens for result callbacks and displays a sanitized JSON result in the page.
7. **Shows Debug Overlay**: It includes a debug `DebugOverlay` component for frame-level state, scores, and card outline visualization.
8. **Cleans Up Resources**: It terminates core resources when UI is dismounted.

## Key Features Demonstrated

- **Modular Integration**: Uses low-level BlinkCard packages directly instead of the high-level `@microblink/blinkcard` wrapper.
- **Manual Lifecycle Control**: Explicit initialization, playback synchronization, frame capture start, and teardown.
- **Custom UI Placement**: Optional portal mode for rendering SDK UI outside of the root node.
- **Debug Instrumentation**: Visualizes feedback stabilizer scores and process state for development/debugging.
- **Result Post-Processing**: Removes image payloads before rendering result JSON for readability.

## How to Run

For detailed instructions on how to install dependencies and run this example, refer to the [main README file](./../README.md).
