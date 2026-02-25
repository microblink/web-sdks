/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { DocumentRotation } from "@microblink/blinkid-core";
import { match } from "ts-pattern";
import { BlinkIdUiStateKey } from "./blinkid-ui-state";
import { DocumentPagination } from "./ui-state-utils";

export type ChainedUiStateProps = {
  previousUiStateKey: BlinkIdUiStateKey;
  paginationType: DocumentPagination;
  rotation?: DocumentRotation;
};

/**
 * Handles chaining of UI states based on the current state, pagination type, and rotation.
 * @param chainedUiStateProps The properties including current UI state key, pagination type, and optional rotation.
 * @returns The next chained UI state key, or undefined if there is no chained state.
 */

export function getChainedUiStateKey(
  chainedUiStateProps: ChainedUiStateProps,
): BlinkIdUiStateKey | undefined {
  const chainedUiState = match<
    ChainedUiStateProps,
    // we return undefined if there is no chained state
    BlinkIdUiStateKey | undefined
  >(chainedUiStateProps)
    // success => transition
    .with(
      {
        previousUiStateKey: "PAGE_CAPTURED",
        paginationType: "other",
      },
      () => "FLIP_CARD",
    )
    .with(
      {
        previousUiStateKey: "PAGE_CAPTURED",
        paginationType: "passport-with-barcode",
      },
      () => "MOVE_LAST_PAGE",
    )
    .with(
      {
        previousUiStateKey: "PAGE_CAPTURED",
        paginationType: "passport-no-barcode",
        rotation: "zero",
      },
      () => "MOVE_TOP",
    )
    .with(
      {
        previousUiStateKey: "PAGE_CAPTURED",
        paginationType: "passport-no-barcode",
        rotation: "upside-down",
      },
      () => {
        // TODO: should be "bottom", but not implemented yet
        return "MOVE_TOP";
      },
    )
    .with(
      {
        previousUiStateKey: "PAGE_CAPTURED",
        paginationType: "passport-no-barcode",
        rotation: "clockwise-90",
      },
      () => "MOVE_RIGHT",
    )
    .with(
      {
        previousUiStateKey: "PAGE_CAPTURED",
        paginationType: "passport-no-barcode",
        rotation: "counter-clockwise-90",
      },
      () => "MOVE_LEFT",
    )
    // transition => intro
    .with(
      {
        previousUiStateKey: "FLIP_CARD",
        paginationType: "other",
      },
      () => "INTRO_BACK_PAGE",
    )
    .with(
      {
        previousUiStateKey: "MOVE_LAST_PAGE",
        paginationType: "passport-with-barcode",
      },
      () => "INTRO_LAST_PAGE",
    )
    .with(
      {
        previousUiStateKey: "MOVE_TOP",
        paginationType: "passport-no-barcode",
      },
      () => "INTRO_TOP_PAGE",
    )
    .with(
      {
        previousUiStateKey: "MOVE_RIGHT",
        paginationType: "passport-no-barcode",
      },
      () => "INTRO_RIGHT_PAGE",
    )
    .with(
      {
        previousUiStateKey: "MOVE_LEFT",
        paginationType: "passport-no-barcode",
      },
      () => "INTRO_LEFT_PAGE",
    )
    // fallback
    .otherwise(() => {
      return undefined;
    });

  return chainedUiState;
}
