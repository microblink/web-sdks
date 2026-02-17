/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/* @refresh reload */

import {
  CameraManager,
  createCameraManagerUi,
} from "@microblink/camera-manager";
import { Component } from "solid-js";

const PORTAL = true;

export const App: Component = () => {
  const initialize = async () => {
    const cameraManager = new CameraManager();
    await createCameraManagerUi(
      cameraManager,
      !PORTAL ? document.getElementById("root")! : undefined,
    );

    // Start the camera stream
    await cameraManager.startCameraStream({
      // There are multiple ways to select a camera:
      // preferredCamera: SomeCameraInstance -- these can be returned from cameraManager.getCameraDevices()
      // as a callback function:
      preferredCamera: (cameras) => {
        const preferredCamera = cameras.find((camera) =>
          camera.name.toLowerCase().includes("facetime"),
        );
        return preferredCamera;
      },
      // preferredFacing: ["back", "front"], // an array of preferred camera facing modes
      // preferredFacing: "back", // a single preferred camera facing mode
    });
  };

  return (
    <div>
      <button onClick={() => void initialize()}>Scan</button>
    </div>
  );
};
