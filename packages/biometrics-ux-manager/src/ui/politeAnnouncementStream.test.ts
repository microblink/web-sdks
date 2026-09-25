/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createPoliteAnnouncementStream } from "./politeAnnouncementStream";

describe("createPoliteAnnouncementStream", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("emits the first announcement immediately", () => {
    const stream = createPoliteAnnouncementStream();

    expect(stream.text()).toBe("");

    stream.publish({ text: "Center your face", kind: "guidance" });

    expect(stream.text()).toBe("Center your face");
  });

  it("keeps the current announcement for 1,000 ms", () => {
    const stream = createPoliteAnnouncementStream();

    stream.publish({ text: "First", kind: "guidance" });
    stream.publish({ text: "Second", kind: "guidance" });

    vi.advanceTimersByTime(999);
    expect(stream.text()).toBe("First");

    vi.advanceTimersByTime(1);
    expect(stream.text()).toBe("Second");
  });

  it("emits immediately once the current dwell ends", () => {
    const stream = createPoliteAnnouncementStream();

    stream.publish({ text: "First", kind: "guidance" });
    vi.advanceTimersByTime(1_000);
    stream.publish({ text: "Second", kind: "guidance" });

    expect(stream.text()).toBe("Second");
  });

  it("retains only the latest pending guidance", () => {
    const stream = createPoliteAnnouncementStream();

    stream.publish({ text: "First", kind: "guidance" });
    stream.publish({ text: "Move closer", kind: "guidance" });
    stream.publish({ text: "Move farther away", kind: "guidance" });

    vi.advanceTimersByTime(1_000);
    expect(stream.text()).toBe("Move farther away");

    vi.advanceTimersByTime(1_000);
    expect(stream.text()).toBe("Move farther away");
  });

  it("drops pending guidance when a milestone arrives", () => {
    const stream = createPoliteAnnouncementStream();

    stream.publish({ text: "Center your face", kind: "guidance" });
    stream.publish({ text: "Move closer", kind: "guidance" });
    stream.publish({ text: "Processing", kind: "milestone" });

    vi.advanceTimersByTime(1_000);
    expect(stream.text()).toBe("Processing");

    vi.advanceTimersByTime(1_000);
    expect(stream.text()).toBe("Processing");
  });

  it("emits milestones in FIFO order before pending guidance", () => {
    const stream = createPoliteAnnouncementStream();

    stream.publish({ text: "Center your face", kind: "guidance" });
    stream.publish({ text: "Processing", kind: "milestone" });
    stream.publish({ text: "Complete", kind: "milestone" });
    stream.publish({ text: "Hold still", kind: "guidance" });

    vi.advanceTimersByTime(1_000);
    expect(stream.text()).toBe("Processing");

    vi.advanceTimersByTime(1_000);
    expect(stream.text()).toBe("Complete");

    vi.advanceTimersByTime(1_000);
    expect(stream.text()).toBe("Hold still");
  });

  it("preserves identical milestones when they are not adjacent", () => {
    const stream = createPoliteAnnouncementStream();

    stream.publish({ text: "Processing", kind: "milestone" });
    stream.publish({ text: "Complete", kind: "milestone" });
    stream.publish({ text: "Processing", kind: "milestone" });

    vi.advanceTimersByTime(1_000);
    expect(stream.text()).toBe("Complete");

    vi.advanceTimersByTime(1_000);
    expect(stream.text()).toBe("Processing");
  });

  it("suppresses duplicates at the effective output tail", () => {
    const stream = createPoliteAnnouncementStream();

    stream.publish({ text: "Center your face", kind: "guidance" });
    stream.publish({ text: "Processing", kind: "milestone" });
    stream.publish({ text: "Processing", kind: "milestone" });
    stream.publish({ text: "Hold still", kind: "guidance" });

    vi.advanceTimersByTime(1_000);
    expect(stream.text()).toBe("Processing");

    vi.advanceTimersByTime(1_000);
    expect(stream.text()).toBe("Hold still");
  });

  it("does not queue guidance identical to the final milestone", () => {
    const stream = createPoliteAnnouncementStream();

    stream.publish({ text: "Center your face", kind: "guidance" });
    stream.publish({ text: "Processing", kind: "milestone" });
    stream.publish({ text: "Processing", kind: "guidance" });

    vi.advanceTimersByTime(2_000);
    stream.publish({ text: "Complete", kind: "milestone" });

    expect(stream.text()).toBe("Complete");
  });

  it("clears pending guidance before deduplicating a milestone", () => {
    const stream = createPoliteAnnouncementStream();

    stream.publish({ text: "Processing", kind: "milestone" });
    stream.publish({ text: "Move closer", kind: "guidance" });
    stream.publish({ text: "Processing", kind: "milestone" });
    stream.publish({ text: "Hold still", kind: "guidance" });

    vi.advanceTimersByTime(1_000);
    expect(stream.text()).toBe("Hold still");
  });

  it("resets during dwell without a stale timer emission", () => {
    const stream = createPoliteAnnouncementStream();

    stream.publish({ text: "First", kind: "guidance" });
    stream.publish({ text: "Second", kind: "milestone" });
    stream.reset();

    expect(stream.text()).toBe("");

    vi.advanceTimersByTime(1_000);
    expect(stream.text()).toBe("");
  });

  it("emits immediately after reset", () => {
    const stream = createPoliteAnnouncementStream();

    stream.publish({ text: "First", kind: "guidance" });
    stream.reset();
    stream.publish({ text: "First", kind: "guidance" });

    expect(stream.text()).toBe("First");
  });

  it("disposes during dwell and ignores later publishes", () => {
    const stream = createPoliteAnnouncementStream();

    stream.publish({ text: "First", kind: "guidance" });
    stream.publish({ text: "Second", kind: "milestone" });
    stream.dispose();

    expect(stream.text()).toBe("");

    stream.publish({ text: "Third", kind: "guidance" });
    vi.advanceTimersByTime(2_000);

    expect(stream.text()).toBe("");
  });
});
