# BlinkID Verify custom UI example

This plain TypeScript application supplies its own capture UI. It imports the UX Manager and Camera Manager from their `/core` entrypoints, so it does not need the optional UI peer dependencies.

The example starts loading Core and its SDK resources as soon as the page opens. After loading, **Start scanning** creates a new capture session on the existing Core instance. Completing or stopping a capture deletes only that session, allowing another session to start without downloading or initializing the SDK again. **Destroy SDK** demonstrates full teardown; **Load SDK** creates a fresh Core instance afterward.

`BlinkIdVerifyCustomUiExample` keeps one Core instance and Camera Manager for the SDK lifetime, while each capture owns a new scanning session, UX Manager, and subscriptions. Session cleanup uses one shared teardown operation to remove callbacks, mark camera interruption as user initiated, destroy the UX Manager, stop the camera stream, and delete the session. A run identifier prevents late asynchronous work from an obsolete capture from changing the current interface. Captured result images remain visible after successful cleanup and are revoked before the next run.

From the repository root, install dependencies with `pnpm install`. Copy `.env.example` to `.env.local` and replace the placeholder with a BlinkID Verify license key. Then run:

```sh
pnpm --filter @microblink/blinkid-verify-custom-ui-example dev
```

Use `build` for a production build and `typecheck` to check the TypeScript source.
