# BlinkID Photo Upload Example

This example demonstrates how to implement document scanning using BlinkID SDK with a photo upload approach. Instead of using the camera directly, this example allows users to upload images of documents for processing.

## Features

- Front side document scanning
- Automatic detection of two-sided documents
- Support for barcode scanning when required
- Real-time processing status feedback
- Image thumbnails preview
- Detailed processing results for each scan
- Complete scanning result display
- Session management and cleanup
- Restart functionality
- Upfront BlinkID (WASM) and scanning session initialization before uploads are allowed
- Initialization retry when startup fails

## Implementation Details

### Core Components

- Uses `@microblink/blinkid-core` for document scanning
- Built with SolidJS for reactive UI
- Implements proper resource cleanup (object URLs, scanning sessions, and worker termination on unmount)

### Scanning Flow

1. **Startup**
   - On mount, the example loads BlinkID (`loadBlinkIdCore`) and creates a photo scanning session (`inputImageSource: "photo"`).
   - File inputs stay disabled until the session is ready. A loading state distinguishes initialization from per-image processing.
   - If initialization fails, an error is shown and the user can retry without reloading the page.

2. **Front Side Upload**
   - User uploads front side image
   - System processes the image and determines next steps
   - Shows processing status and thumbnail

3. **Back Side Upload** (if required)
   - Automatically shown if document requires back side
   - Only enabled after successful front side scan
   - Shows processing status and thumbnail

4. **Barcode Upload** (if required)
   - Shown if barcode recognition fails on previous steps
   - Allows specific upload for barcode processing
   - Shows processing status and thumbnail

### Error Handling

- Comprehensive error handling for:
  - BlinkID / scanning session initialization failures (with retry)
  - File selection errors
  - Processing failures
  - Session management issues
  - Resource cleanup
- Clear error messages displayed to users
- Automatic cleanup of failed uploads

### State Management

- Tracks scanning progress for each step
- Manages document side requirements
- Handles session readiness (including after a completed scan, until **Restart** creates a new session)
- Maintains processing results
- Manages image preview URLs

## How to Run

For detailed instructions on how to install dependencies and run this example, please refer to the [main README file](./../README.md).
