/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { afterEach, describe, expect, test } from "vitest";
import { render } from "solid-js/web";
import { type Component } from "solid-js";
import { blinkCardUiStateMap } from "../core/blinkcard-ui-state";

import en from "./locales/en";

import {
  LocalizationProvider,
  PartialLocalizationStrings,
} from "./LocalizationContext";
import { UiFeedbackOverlay } from "./UiFeedbackOverlay";

const TestFeedbackUi: Component<{
  localization?: PartialLocalizationStrings;
}> = (props) => (
  <LocalizationProvider userStrings={props.localization}>
    <UiFeedbackOverlay
      uiState={blinkCardUiStateMap.INTRO_FRONT}
      isDesktop={false}
    />
    <UiFeedbackOverlay
      uiState={blinkCardUiStateMap.CARD_FRAMING_CAMERA_TOO_FAR}
      isDesktop={false}
    />
  </LocalizationProvider>
);

describe("LocalizationProvider", () => {
  let cleanup: (() => void) | undefined;

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
    document.body.replaceChildren();
  });

  test("preserves default nested feedback messages when one string is overridden", () => {
    cleanup = render(
      () => (
        <TestFeedbackUi
          localization={{
            feedback_messages: {
              scan_the_front_side: "Custom front side instruction",
            },
          }}
        />
      ),
      document.body,
    );

    expect(document.body.textContent).toContain(
      "Custom front side instruction",
    );
    expect(document.body.textContent).toContain(
      en.feedback_messages.move_closer,
    );
  });

  test("preserves default nested feedback messages when nothing is overridden", () => {
    cleanup = render(() => <TestFeedbackUi localization={{}} />, document.body);

    expect(document.body.textContent).toContain(
      en.feedback_messages.move_closer,
    );
  });

  test("preserves default nested feedback messages when undefined is provided", () => {
    cleanup = render(() => <TestFeedbackUi />, document.body);

    expect(document.body.textContent).toContain(
      en.feedback_messages.move_closer,
    );
  });
});
