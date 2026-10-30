/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

const AFFECTED_SAFARI_MAJOR = 27;

/**
 * Safari 27 and iPadOS 27 can paint a black preview for the video element whose frames are sampled, while a second
 * element attached to the same `MediaStream` still shows the camera image.
 *
 * iPadOS desktop mode reports a Macintosh user agent, so a desktop Safari 27 token is treated the same way.
 *
 * @param userAgent - The `navigator.userAgent` string to test.
 * @returns True when the built-in camera UI should show an unsampled companion preview.
 */
export function needsCompanionCameraPreview(userAgent: string): boolean {
  const osMajor = majorVersion(userAgent, /(?:CPU (?:iPhone )?OS|CPU OS|iPhone OS) (\d+)[_.\s]/);

  if (osMajor !== undefined && /iPad|iPhone|iPod/.test(userAgent)) {
    return osMajor >= AFFECTED_SAFARI_MAJOR;
  }

  const isSafari =
    /Safari\//.test(userAgent) &&
    !/Chrome\/|Chromium\/|CriOS\/|FxiOS\/|Edg\/|EdgiOS\/|OPR\/|SamsungBrowser\//.test(userAgent);

  if (!isSafari) {
    return false;
  }

  const safariMajor = majorVersion(userAgent, /Version\/(\d+)/);

  return safariMajor !== undefined && safariMajor >= AFFECTED_SAFARI_MAJOR;
}

/**
 * Mirrors `capture`'s camera stream onto `preview` without sampling `preview`.
 *
 * The companion stays hidden until it actually starts playback, so a failed `play()` cannot cover a visible preview.
 *
 * @param capture - The element Camera Manager samples for recognition.
 * @param preview - The element shown to the user.
 * @returns Removes the stream binding.
 */
export function bindCompanionCameraPreview(capture: HTMLVideoElement, preview: HTMLVideoElement): () => void {
  const accessor = findSrcObjectAccessor(capture);

  if (!accessor) {
    throw new Error("HTMLVideoElement.srcObject is unavailable");
  }

  const { owner } = accessor;

  preview.muted = true;
  preview.defaultMuted = true;
  preview.playsInline = true;
  preview.autoplay = true;
  preview.controls = false;
  preview.setAttribute("playsinline", "");
  preview.setAttribute("muted", "");
  preview.style.pointerEvents = "none";
  preview.style.opacity = "0";

  const showPreview = () => {
    preview.style.opacity = "1";
  };

  const syncPreview = (stream: MediaProvider | null) => {
    preview.srcObject = stream;

    if (!stream) {
      preview.style.opacity = "0";
      preview.pause();
      return;
    }

    void preview.play().catch(() => {
      // Playback is retried from the capture element's `play` event. The preview stays hidden until then.
    });
  };

  Object.defineProperty(capture, "srcObject", {
    configurable: true,
    enumerable: accessor.descriptor.enumerable ?? true,
    get() {
      return Reflect.get(owner, "srcObject", this) as MediaProvider | null;
    },
    set(stream: MediaProvider | null) {
      Reflect.set(owner, "srcObject", stream, this);
      syncPreview(stream);
    },
  });

  const replayPreview = () => {
    if (preview.srcObject !== capture.srcObject) {
      preview.srcObject = capture.srcObject;
    }

    if (!capture.srcObject) {
      return;
    }

    void preview.play().catch(() => {
      // The capture element is already playing. Keep the recognition path even if the companion cannot start.
    });
  };

  capture.addEventListener("play", replayPreview);
  preview.addEventListener("playing", showPreview);

  return () => {
    capture.removeEventListener("play", replayPreview);
    preview.removeEventListener("playing", showPreview);
    Reflect.deleteProperty(capture, "srcObject");
    preview.pause();
    preview.srcObject = null;
    preview.style.opacity = "0";
  };
}

/**
 * Reads the first integer captured by `pattern`.
 *
 * @param userAgent - The user agent string.
 * @param pattern - A pattern with one numeric group.
 * @returns The major version, when present.
 */
function majorVersion(userAgent: string, pattern: RegExp): number | undefined {
  const match = pattern.exec(userAgent);

  if (!match) {
    return undefined;
  }

  const version = Number(match[1]);

  return Number.isFinite(version) ? version : undefined;
}

/**
 * Finds the prototype that owns `srcObject`.
 *
 * @param video - The video element whose setter should be wrapped.
 * @returns The owning prototype and its accessor, when the browser exposes one.
 */
function findSrcObjectAccessor(video: HTMLVideoElement): { owner: object; descriptor: PropertyDescriptor } | undefined {
  let prototype = Object.getPrototypeOf(video) as object | null;

  while (prototype) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, "srcObject");

    if (descriptor?.get && descriptor.set) {
      return { owner: prototype, descriptor };
    }

    prototype = Object.getPrototypeOf(prototype) as object | null;
  }

  return undefined;
}
