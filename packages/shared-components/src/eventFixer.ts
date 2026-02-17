/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { HTMLProps } from "@ark-ui/solid/factory";
import { JSX } from "solid-js/jsx-runtime";
import { Simplify } from "type-fest";

type ElementType = Simplify<keyof JSX.IntrinsicElements>;

/**
 * Fixes bad implementation of event handlers in Ark UI
 *
 * https://github.com/chakra-ui/ark/issues/3146#issuecomment-2556518786
 *
 * https://docs.solidjs.com/concepts/components/event-handlers#list-of-delegated-events
 */
export function eventFixer<E extends ElementType>(props: HTMLProps<E>) {
  const newObj: Record<string, unknown> = {};

  Object.entries(props).forEach(([key, value]) => {
    const lowerCaseKey = key.toLowerCase();
    let trimmedKey = lowerCaseKey;

    // it's an event handler
    if (lowerCaseKey.startsWith("on")) {
      trimmedKey = lowerCaseKey.slice(2);

      const newKey = `on:${trimmedKey}`;
      newObj[newKey] = value;

      // removed as it's safer to do an all events?

      // if it's a delegated event
      // if (DelegatedEvents.has(trimmedKey)) {
      //   const newKey = `on:${trimmedKey}`;
      //   newObj[newKey] = value;
      // } else {
      //   // if it's a non-delegated event
      //   newObj[trimmedKey] = value;
      // }
    } else {
      // if it's not an event handler
      newObj[trimmedKey] = value;
    }
  });

  return newObj;
}
