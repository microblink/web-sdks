/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { createBlinkCard } from "@microblink/blinkcard";

/**
 * This is the main component of the application.
 * It creates the BlinkCard instance. For additional configuration look at the createBlinkCard function.
 *
 * @see https://github.com/microblink/web-sdks/blob/main/packages/blinkcard/docs/functions/createBlinkCard.md
 */
const blinkcard = await createBlinkCard({
  licenseKey: import.meta.env.VITE_LICENCE_KEY,
});

/**
 * This callback is called when the result is ready.
 * This is useful if you want to perform some actions when the result is ready.
 * For additional configuration look at the addOnResultCallback function.
 *
 * @see https://github.com/microblink/web-sdks/blob/main/packages/blinkcard/docs/type-aliases/BlinkCardComponent.md#addonresultcallback
 */
blinkcard.addOnResultCallback((result) => {
  console.log("Result:", result);
  void blinkcard.destroy();
});
