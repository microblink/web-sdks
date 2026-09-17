# BlinkCard custom UI example

This plain TypeScript application supplies its own scanning UI. It imports the UX Manager and Camera Manager from their `/core` entrypoints, so it does not need the optional UI peer dependencies.

The example starts loading Core and its SDK resources as soon as the page opens. After loading, **Start scanning** creates a new session on the existing Core instance. Completing or stopping a scan deletes only that session, allowing another session to start without downloading or initializing the SDK again. **Destroy SDK** demonstrates full teardown; **Load SDK** creates a fresh Core instance afterward.

`BlinkCardCustomUiExample` keeps one Core instance and Camera Manager for the SDK lifetime, while each scan owns a new scanning session, UX Manager, and subscriptions. Session cleanup uses one shared teardown operation to remove callbacks, mark camera interruption as user initiated, destroy the UX Manager, stop the camera stream, and delete the session. A run identifier prevents late asynchronous work from an obsolete scan from changing the current interface.

From the repository root, install dependencies with `pnpm install`. Copy `.env.example` to `.env.local` and replace the placeholder with a BlinkCard license key. Then run:

```sh
pnpm --filter @microblink/blinkcard-custom-ui-example dev
```

Use `build` for a production build and `typecheck` to check the TypeScript source.
