# BlinkCard Simple Example

This example application provides a minimal demonstration of how to integrate and use the BlinkCard SDK in a web application. It showcases the simplest way to get started with card scanning.

## Functionality

The application performs the following actions:

1.  **Initializes BlinkCard**: It calls the `createBlinkCard` function, which handles the entire setup process, including loading the SDK, setting up the camera, and creating the UI.

2.  **Sets up a Result Callback**: It registers a callback function that will be invoked when a card is successfully scanned.

3.  **Logs the Result**: When the callback is triggered, it logs the scanning result to the console.

4.  **Cleans up Resources**: After logging the result, it calls the `destroy` method to release all resources used by the SDK.

## Key Features Demonstrated

- **High-Level API**: Shows the usage of the `createBlinkCard` high-level function, which simplifies the integration process by abstracting away the underlying complexities.
- **Minimal Configuration**: Demonstrates how to initialize the SDK with just a license key and minimal UI options.
- **Result Handling**: Provides a straightforward example of how to receive scanning results using a callback.
- **Resource Management**: Illustrates the importance of calling the `destroy` method to clean up resources after the scanning is complete.

## How to Run

For detailed instructions on how to install dependencies and run this example, please refer to the [main README file](./../README.md).
