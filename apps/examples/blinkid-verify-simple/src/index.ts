/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import {
  BlinkIdVerifyScanningResult,
  createBlinkIdVerify,
} from "@microblink/blinkid-verify";

/**
 * This is the main component of the application.
 * It creates the BlinkID verify instance. For additional configuration look at the createBlinkIdVerify function.
 *
 */
const blinkIdVerify = await createBlinkIdVerify({
  licenseKey: import.meta.env.VITE_LICENCE_KEY,
  cameraManagerUiOptions: {
    showMirrorCameraButton: false,
  },
});

/**
 * This callback is called when the result is ready.
 * This is useful if you want to perform some actions when the result is ready.
 * For additional configuration look at the addOnResultCallback function.
 *
 */
blinkIdVerify.addOnResultCallback((result: BlinkIdVerifyScanningResult) => {
  console.log("Result:", result);
  void blinkIdVerify.destroy();
});
