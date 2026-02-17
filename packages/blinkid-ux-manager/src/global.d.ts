/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

// augment global types
declare global {
  interface MediaTrackCapabilities {
    /**
     * A boolean value defining whether the fill light is continuously
     * connected, meaning it stays on as long as the track is active.
     */
    torch?: boolean;
    // TODO: check if this is always an array
    focusMode?: MediaTrackSettings["focusMode"][];
  }

  interface MediaTrackSettings {
    /**
     * A boolean value defining whether the fill light is continuously
     * connected, meaning it stays on as long as the track is active.
     */
    torch?: boolean;
    // TODO: check if this is always an array
    focusMode?: "none" | "manual" | "single-shot" | "continuous";
  }

  interface Window {
    // Hacks for injectable css code
    __blinkidUxManagerCssCode?: string;
  }
}

export {};
