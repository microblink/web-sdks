/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { createRoot, JSX, Owner } from "solid-js";
import { insert, MountableElement } from "solid-js/web";

/**
 * A custom render function that allows you to specify the owner of the rendered component.
 * This is useful when you want to render a component into a different owner than the current one.
 *
 * Discussion: https://discord.com/channels/722131463138705510/1346100647824724008
 *
 * @param code The JSX code to render
 * @param element the element to render the code into
 * @param owner the SolidJS owner
 */
export const renderWithOwner = (
  code: () => JSX.Element,
  element: MountableElement,
  owner: Owner | null,
) => {
  return createRoot((dispose) => {
    insert(element, code(), element.firstChild ? null : undefined);

    return () => {
      dispose();
      // textContent is readonly on Document
      if (!(element instanceof Document)) {
        element.textContent = "";
      }
    };
  }, owner);
};
