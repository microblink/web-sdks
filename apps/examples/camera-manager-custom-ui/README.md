# Camera Manager custom UI example

This plain TypeScript application uses Camera Manager with an interface supplied by the application. It imports `CameraManager` from `@microblink/camera-manager/core`, so it does not need the optional UI peer dependencies.

`CameraManagerCustomUiExample` owns one Camera Manager for the application lifetime. Stopping marks the interruption as user initiated and only stops the active stream, so camera selection can be reused when starting again. Leaving the page removes callbacks, releases the video element, and resets Camera Manager state. A run identifier prevents an obsolete asynchronous start from updating the current interface.

From the repository root, install dependencies with `pnpm install`. Then run:

```sh
pnpm --filter @microblink/camera-manager-custom-ui-example dev
```

Use `build` for a production build and `typecheck` to check the TypeScript source.
