/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { createBiometricsUi } from "@microblink/biometrics";

/**
 * Creates the guided face capture UI. The SDK loads its resources, opens the front camera, shows onboarding and capture
 * guidance, and handles help, retry, and close. See `BiometricsUiOptions` for additional configuration.
 */
const ui = await createBiometricsUi({
  licenseKey: import.meta.env.VITE_LICENCE_KEY,
  targetNode: document.getElementById("root") ?? undefined,
  onResult(result) {
    console.log("Result:", result);
    void ui.destroy();
  },
  onError(error) {
    console.error("Biometrics error:", error.code, error);
  },
});
