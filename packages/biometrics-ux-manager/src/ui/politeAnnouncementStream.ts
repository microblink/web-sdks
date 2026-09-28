/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { createSignal, type Accessor } from "solid-js";

export type PoliteAnnouncement = {
  text: string;
  kind: "guidance" | "milestone";
};

type PoliteAnnouncementStream = {
  publish(announcement: PoliteAnnouncement): void;
  reset(): void;
  dispose(): void;
  text: Accessor<string>;
};

const ANNOUNCEMENT_DWELL_MS = 1_000;

export function createPoliteAnnouncementStream(): PoliteAnnouncementStream {
  const [text, setText] = createSignal("");

  let currentText = "";
  let pendingGuidance: PoliteAnnouncement | undefined;
  let milestoneQueue: PoliteAnnouncement[] = [];
  let dwellTimer: ReturnType<typeof setTimeout> | undefined;
  let isReady = true;
  let isDisposed = false;

  const clearDwellTimer = () => {
    if (dwellTimer === undefined) {
      return;
    }

    clearTimeout(dwellTimer);
    dwellTimer = undefined;
  };

  const effectiveTailText = () => pendingGuidance?.text ?? milestoneQueue.at(-1)?.text ?? currentText;

  const emit = (announcement: PoliteAnnouncement) => {
    currentText = announcement.text;
    setText(announcement.text);
    isReady = false;

    clearDwellTimer();
    dwellTimer = setTimeout(() => {
      dwellTimer = undefined;

      if (isDisposed) {
        return;
      }

      const milestone = milestoneQueue.shift();

      if (milestone !== undefined) {
        emit(milestone);

        return;
      }

      if (pendingGuidance !== undefined) {
        const guidance = pendingGuidance;
        pendingGuidance = undefined;
        emit(guidance);

        return;
      }

      isReady = true;
    }, ANNOUNCEMENT_DWELL_MS);
  };

  const reset = () => {
    clearDwellTimer();
    currentText = "";
    pendingGuidance = undefined;
    milestoneQueue = [];
    isReady = true;
    setText("");
  };

  return {
    text,
    publish(announcement) {
      if (isDisposed) {
        return;
      }

      if (announcement.kind === "milestone") {
        pendingGuidance = undefined;
      }

      if (announcement.text === effectiveTailText()) {
        return;
      }

      if (isReady) {
        emit(announcement);

        return;
      }

      if (announcement.kind === "milestone") {
        milestoneQueue.push(announcement);

        return;
      }

      pendingGuidance = announcement;
    },
    reset,
    dispose() {
      if (isDisposed) {
        return;
      }

      reset();
      isDisposed = true;
    },
  };
}
