/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { beforeEach, describe, expect, test, vi } from "vitest";

const createBlinkIdFeedbackUi = vi.hoisted(() => vi.fn());
const mockLoadBlinkIdCore = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    createBlinkIdScanningSession: vi.fn().mockResolvedValue({}),
  }),
);
const mockCameraManagerState = vi.hoisted(() => ({
  playbackCallback: undefined as ((state: string) => void) | undefined,
  lastInstance: undefined as
    | {
        startFrameCapture: ReturnType<typeof vi.fn>;
      }
    | undefined,
}));

vi.mock("@microblink/blinkid-core", () => ({
  loadBlinkIdCore: mockLoadBlinkIdCore,
  BlinkIdSessionSettings: class {},
}));

vi.mock("@microblink/camera-manager", () => {
  class MockCameraManager {
    startFrameCapture = vi.fn().mockResolvedValue(undefined);
    startCameraStream = vi.fn().mockResolvedValue(undefined);
    subscribe = vi
      .fn()
      .mockImplementation((_selector, callback: (state: string) => void) => {
        mockCameraManagerState.playbackCallback = callback;
        return vi.fn();
      });

    constructor() {
      mockCameraManagerState.lastInstance = this;
    }
  }

  return {
    CameraManager: MockCameraManager,
    createCameraManagerUi: vi.fn().mockResolvedValue({
      dismount: vi.fn(),
    }),
    CameraManagerComponent: {},
    CameraManagerUiOptions: {},
  };
});

vi.mock("@microblink/blinkid-ux-manager", () => {
  class MockBlinkIdUxManager {
    addOnErrorCallback = vi.fn();
    addOnResultCallback = vi.fn();
    addOnDocumentFilteredCallback = vi.fn();
    addDocumentClassFilter = vi.fn();
  }

  return {
    BlinkIdUxManager: MockBlinkIdUxManager,
    createBlinkIdFeedbackUi,
    FeedbackUiOptions: {},
    LocalizationStrings: {},
  };
});

import { createBlinkId } from "./createBlinkIdUi";

describe("createBlinkId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCameraManagerState.playbackCallback = undefined;
    mockCameraManagerState.lastInstance = undefined;
  });

  test("forwards feedbackUiOptions and respects showOnboardingGuide", async () => {
    const feedbackUiOptions = { showOnboardingGuide: false };

    await createBlinkId({
      licenseKey: "test-license",
      feedbackUiOptions,
    });

    expect(mockCameraManagerState.playbackCallback).toBeTypeOf("function");

    mockCameraManagerState.playbackCallback?.("playback");

    expect(createBlinkIdFeedbackUi).toHaveBeenCalledTimes(1);
    expect(createBlinkIdFeedbackUi.mock.calls.at(0)?.at(2)).toBe(
      feedbackUiOptions,
    );
    expect(
      mockCameraManagerState.lastInstance?.startFrameCapture,
    ).toHaveBeenCalledTimes(1);
  });
});
