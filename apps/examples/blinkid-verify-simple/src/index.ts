/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { createBlinkIdVerify } from "@microblink/blinkid-verify";

/**
 * This is the main component of the application. It creates the BlinkID verify instance. For additional configuration
 * look at the createBlinkIdVerify function.
 */
const blinkIdVerify = await createBlinkIdVerify({
  licenseKey: import.meta.env.VITE_LICENCE_KEY,
  cameraManagerUiOptions: {
    showMirrorCameraButton: false,
  },
});

/**
 * Runs after capture. The SDK posts to this page's origin at `/api/v3/verify`. The dev server forwards that request
 * with `VERIFY_API_URL` and `VERIFY_API_KEY` from `.env.local`.
 */
blinkIdVerify.verifyOnScanningCompletion({
  onSuccess: (result) => {
    console.log("Verify result:", result);
    void blinkIdVerify.destroy();
  },
  onError: async (error, resolver) => {
    console.error("Verify failed:", error);
    const status = error.status;
    if (status !== undefined && status >= 500 && status < 600) {
      const retry = await resolver.verifyCaptureResult();
      if (retry.ok) {
        console.log("Verify result:", retry.result);
      } else {
        console.error("Verify retry failed:", retry.error);
      }
    }
    void blinkIdVerify.destroy();
  },
});
