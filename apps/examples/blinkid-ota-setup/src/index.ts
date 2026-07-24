/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { createBlinkId } from "@microblink/blinkid";

/**
 * This is the main component of the application.
 * It creates the BlinkID instance. For additional configuration look at the createBlinkId function.
 *
 * @see https://github.com/microblink/web-sdks/blob/main/packages/blinkid/docs/functions/createBlinkId.md
 */
const blinkid = await createBlinkId({
  licenseKey: import.meta.env.VITE_LICENCE_KEY,
  otaResources: {
    // Setting strict to true will case the SDK to fail and throw an exception if the ota download fails, otherwise it will fallback to the bundled resources
    strict: true,

    // Setting checkForUpdates to true will cause the SDK to always ping the Ota service to see if there's a newer version, and if so download it
    checkForUpdates: true,

    // URL to the ota resource provider, leave blank to use Microblink's ota service, set to use a proxy or self hosted
    // otaResourcesProviderUrl: <YOUR_OTA_PROVIDER_URL>,
    otaResourceProviderUrl: undefined,

    // URL to the "bundled" ota resources, look at the public/custom-ota-resources folder to see the required structure,
    // these resources are always downloaded if checkForUpdates is false, or if checkForUpdates is true, we will check if these are already the latest
    // version, and use them instead of downloading from the Ota resource provider.
    // resourcesLocation: "custom-ota-resources",

    // Ota service request timeout in milliseconds
    timeoutMilis: 5000,
  },
});

blinkid.addOnResultCallback((result) => {
  console.log(result);
  void blinkid.destroy();
});
