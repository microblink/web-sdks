/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/**
 * @packageDocumentation
 * Camera selection and video display UI for Camera Manager.
 *
 * This entry requires `solid-js`, `@ark-ui/solid`, `solid-zustand`, and `@solid-primitives/keyed`.
 */

export * from "./ui/createCameraManagerUi";
export { cameraUiRefStore } from "./ui/zustandRefStore";
export type { CameraUiRefs } from "./ui/zustandRefStore";
export type { CameraUiLocalizationStrings, CameraUiLocaleRecord } from "./ui/LocalizationContext";
