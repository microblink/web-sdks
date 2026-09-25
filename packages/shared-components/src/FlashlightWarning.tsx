/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { Component, createEffect, createSignal, onCleanup, Show } from "solid-js";

export const FlashlightWarning: Component<{ enabled: boolean; visible: boolean; message: string }> = (props) => {
  const [showWarning, setShowWarning] = createSignal(false);
  let hideTimeout: ReturnType<typeof setTimeout> | undefined;

  createEffect((wasEnabled: boolean) => {
    const enabled = props.enabled;

    if (enabled && !wasEnabled) {
      clearTimeout(hideTimeout);
      setShowWarning(true);
      hideTimeout = setTimeout(() => setShowWarning(false), 5000);
    } else if (!enabled) {
      clearTimeout(hideTimeout);
      setShowWarning(false);
    }

    return enabled;
  }, false);

  onCleanup(() => clearTimeout(hideTimeout));

  return (
    <Show when={showWarning() && props.visible}>
      <div
        role="status"
        class="absolute bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[335px]
          rounded bg-[#3a3a3c] px-4 py-4 text-sm leading-5 whitespace-pre-line color-white"
      >
        {props.message}
      </div>
    </Show>
  );
};
