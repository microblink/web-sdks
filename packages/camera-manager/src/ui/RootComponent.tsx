/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/* @refresh reload */

import { Component } from "solid-js";
import { Dynamic } from "solid-js/web";

import { useCameraUiStore } from "./CameraUiStoreContext";
import { CaptureScreen, CaptureScreenPortalled } from "./CaptureScreen";

/** The root component. */
const RootComponent: Component = () => {
  const { mountTarget } = useCameraUiStore();

  return (
    <>
      <Dynamic component={mountTarget.parentNode === document.body ? CaptureScreenPortalled : CaptureScreen} />
    </>
  );
};

export { RootComponent };
