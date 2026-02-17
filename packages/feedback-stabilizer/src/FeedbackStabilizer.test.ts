/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import fakeTimer from "@sinonjs/fake-timers";
import { beforeEach, describe, expect, test } from "vitest";
import { FeedbackStabilizer, UiStateMap } from "./index";

const clock = fakeTimer.install({
  shouldAdvanceTime: true,
  advanceTimeDelta: 1,
});
const DEFAULT_TICK = 500;

const uiStateMap = {
  A: {
    key: "A",
    minDuration: 1000,
  },
  B: {
    key: "B",
    minDuration: 1000,
  },
  C: {
    key: "C",
    minDuration: 1000,
  },
  X: {
    key: "X",
    minDuration: 2000,
    singleEmit: true,
  },
} satisfies UiStateMap;

type strictKeyof<T> = keyof T extends infer K
  ? K extends number
    ? `${K}`
    : K
  : never;

let stabilizer: FeedbackStabilizer<typeof uiStateMap>;

beforeEach(() => {
  // initial event has delay, prevent starting at 0
  clock.reset();
  clock.tick(1000);
  stabilizer = new FeedbackStabilizer(uiStateMap, "A");
});

const getStateWithClockTick = (
  key: strictKeyof<typeof uiStateMap>,
  timeSkip?: number | string,
) => {
  clock.tick(timeSkip ?? DEFAULT_TICK);
  return stabilizer.getNewUiState(key);
};

/**
 * Feeds events with a 500ms delay between each event by default
 */
const feedEvents = (
  keys: strictKeyof<typeof uiStateMap>[],
  timeSkip?: number | string,
) => {
  if (keys.length === 0) {
    clock.tick(timeSkip ?? DEFAULT_TICK);
  }
  for (const key of keys) {
    getStateWithClockTick(key, timeSkip);
  }
};

test("clock tick precisely increments performance.now", () => {
  clock.reset();
  const start = performance.now();
  clock.tick(1000);
  const end = performance.now();
  expect(end - start).toEqual(1000);
});

test("EventQueue is filled correctly", () => {
  feedEvents(["B", "C", "C", "C", "B"]);

  const eventQueue = stabilizer.getEventQueue();
  expect(eventQueue).toHaveLength(6);
});

test("feedEvents can be broken up", () => {
  feedEvents(["B", "C", "C"]);
  feedEvents(["C", "B"]);

  const eventQueue = stabilizer.getEventQueue();
  expect(eventQueue).toHaveLength(6);
});

test("EventQueue discards events outside the time window", () => {
  const nLastEvents = 3;
  const events: strictKeyof<typeof uiStateMap>[] = ["B", "C", "C", "C", "B"];

  stabilizer.setTimeWindow(nLastEvents * DEFAULT_TICK - 20); // 3 * 500 - 20 = 1480ms
  // remaining events should be last 3 members of the array
  const remainingEvents = events.slice(-1 * nLastEvents); // ["C", "C", "B"]
  feedEvents(events);
  feedEvents([]);

  const eventQueue = stabilizer.getEventQueue();
  // get keys from eventqueue
  const keys = eventQueue.map((event) => event.key);
  expect(keys).toEqual(remainingEvents);
});

test("keep last event if queue is empty", () => {
  stabilizer.setTimeWindow(100);
  feedEvents(["B", "C", "C", "C", "A"], 200);
  expect(stabilizer.currentState.key).toEqual("A");
});

describe("Scoring", () => {
  test("FeedbackStabilizer fills scoreboard correctly", () => {
    feedEvents(["B", "C", "C", "C", "B"]);

    const scoreBoard = stabilizer.getScoreBoard();
    expect(Object.keys(scoreBoard)).toEqual(["A", "B", "C"]);
    expect(scoreBoard.A).toHaveLength(1);
    expect(scoreBoard.B).toHaveLength(2);
    expect(scoreBoard.C).toHaveLength(3);
  });

  test("FeedbackStabilizer fills summedScores correctly", () => {
    feedEvents(["B", "C", "C", "C", "B"]);

    const summedScores = stabilizer.getScores();
    expect(Object.keys(summedScores)).toEqual(["A", "B", "C"]);
  });

  test("highest value event is chosen correctly", () => {
    feedEvents(["B", "C", "C", "C", "B"]);

    expect(stabilizer.currentState.key).toEqual("C");
  });
});

describe("Minimum duration", () => {
  test("Minimum duration is respected", () => {
    // A is the initial state
    feedEvents(["B", "C", "C", "C", "B"], 100); // shorten the time between events
    expect(stabilizer.getEventQueue().map((event) => event.key)).toEqual([
      "A",
      "B",
      "C",
      "C",
      "C",
      "B",
    ]); // nothing is discarded
    expect(stabilizer.currentState.key).toEqual("A");
    clock.tick(1000);
    expect(stabilizer.canShowNewUiState()).toBe(true);
    stabilizer.getNewUiState("B");
    expect(stabilizer.canShowNewUiState()).toBe(false);
    expect(stabilizer.currentState.key).toEqual("B");
  });

  test("Chooses best event after minimum duration ended", () => {
    feedEvents(["B", "C", "C", "C", "C", "C", "C", "C", "B"], 20);
    expect(stabilizer.currentState.key).toEqual("A");
    expect(stabilizer.canShowNewUiState()).toBe(false);
    clock.tick(1000);
    expect(stabilizer.canShowNewUiState()).toBe(true);
    stabilizer.getNewUiState("B");
    expect(stabilizer.canShowNewUiState()).toBe(false);
    expect(stabilizer.currentState.key).toEqual("C");
  });
});

describe("Single-emitted events", () => {
  test("single emitted event is not in main queue", () => {
    feedEvents(["B", "X", "C", "C", "B"]);

    const eventQueue = stabilizer.getEventQueue();
    expect(eventQueue).not.toContainEqual({ key: "X" });
  });

  test("single emitted emits after time window", () => {
    feedEvents(["B", "C", "C", "C", "X", "C", "C", "C", "B"], 20);
    expect(stabilizer.currentState.key).toEqual("A");
    clock.tick(1000);
    stabilizer.getNewUiState("B");
    expect(stabilizer.currentState.key).toEqual("X");
  });

  // This test is wrong. X shouldn't be able to override any
  // other event that has been emitted in the last time window
  // test("single emitted event duration is respected", () => {
  //   feedEvents(["B", "X", "C", "C", "B"], 20);
  //   expect(stabilizer.currentState.key).toEqual("X");
  //   clock.tick(1000);
  //   stabilizer.getNewUiState("B");
  //   expect(stabilizer.currentState.key).toEqual("X");
  //   clock.tick(2000); // minimum duration of X is 2000ms
  //   feedEvents(["B", "C", "C", "B"], 20);
  //   expect(stabilizer.currentState.key).toEqual("B");
  // });
});
