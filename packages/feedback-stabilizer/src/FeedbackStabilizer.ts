/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { getKeyWithHighestValue } from "./utils";

/**
 * Represents a UI state configuration with timing and weight parameters.
 * Used to define how different UI states should behave in the stabilization process.
 *
 * @typeParam K - The specific key type for this UI state
 */
export type UiState<K extends string = string> = {
  /** Unique identifier for the UI state */
  key: K;

  /** Minimum duration (in milliseconds) this state should be displayed */
  minDuration: number;

  /**
   * If true, the event will be emitted once the previous event is done.
   * It bypasses the averaging process and is handled separately.
   */
  singleEmit?: boolean;

  /**
   * Initial weight for this state when it enters the stabilization queue.
   * Higher values give the state more influence in the averaging process.
   */
  initialWeight?: number;
};

/**
 * Represents a UI state event in the stabilization queue.
 * These events are processed to determine which UI state should be displayed.
 *
 * @typeParam K - The key type for this event, matching a UI state key
 */
export type UiStateEvent<K extends string = string> = {
  /** Identifier matching a UI state key */
  key: K;

  /** High-resolution timestamp when the event occurred */
  timeStamp: DOMHighResTimeStamp;

  /** Current weight of this event in the stabilization process */
  currentWeight: number;

  /**
   * If true, this event will be emitted once the previous event completes.
   * It bypasses the normal stabilization process.
   */
  singleEmit?: boolean;
};

/**
 * Maps state keys to their corresponding UI state configurations.
 */
export type UiStateMap = {
  [K in string]: UiState<K>;
};

/** Helper type to extract string keys from a state map */
type StateKey<T extends UiStateMap> = keyof T & string;

/**
 * FeedbackStabilizer provides UI state management with temporal smoothing.
 *
 * It helps prevent UI "flickering" by:
 * - Maintaining a time-windowed history of UI state changes
 * - Applying weighted averaging to determine the most appropriate state
 * - Supporting immediate state changes through single-emit events
 * - Enforcing minimum display durations for states
 *
 * @typeParam SdkSpecificStateMap - Type extending UiStateMap for SDK-specific states
 */
export class FeedbackStabilizer<SdkSpecificStateMap extends UiStateMap> {
  /** The initial key. */
  private initialKey: StateKey<SdkSpecificStateMap>;
  /** The UI state map. */
  private uiStateMap: SdkSpecificStateMap;
  /** Time window (in ms) for considering UI state events. */
  private timeWindow = 3000;
  /** Rate at which event weights decay over time */
  private decayRate = 0.95;
  /** Queue of regular UI state events within the time window */
  private eventQueue: UiStateEvent<StateKey<SdkSpecificStateMap>>[] = [];
  /** Special queue for single-emit events that bypass normal stabilization */
  private singleEventQueue: UiStateEvent<StateKey<SdkSpecificStateMap>>[] = [];
  /** Currently displayed state key */
  private currentKey: StateKey<SdkSpecificStateMap>;
  /** Timestamp when current state started displaying */
  private currentStateStartTime = performance.now();
  /** Accumulated scores for each state in current calculation */
  private summedScores: Record<string, number> = {};
  /** History of scores for each state */
  private scoreBoard: Record<string, number[]> = {};

  /**
   * Gets the currently active UI state configuration.
   *
   * @returns The currently active UI state configuration.
   */
  get currentState() {
    return this.uiStateMap[this.currentKey];
  }

  /**
   * Gets a copy of the current event queue for debugging.
   *
   * @returns A copy of the current event queue.
   */
  getEventQueue() {
    return structuredClone(this.eventQueue);
  }

  /**
   * Gets a copy of the single event queue for debugging.
   *
   * @returns A copy of the current event queue.
   */
  getSingleEventQueue() {
    return structuredClone(this.singleEventQueue);
  }

  /**
   * Gets the current summed scores for each state.
   *
   * @returns The current summed scores for each state.
   */
  getScores() {
    return structuredClone(this.summedScores);
  }

  /**
   * Gets the score history for each state.
   *
   * @returns The score history for each state.
   */
  getScoreBoard() {
    return structuredClone(this.scoreBoard);
  }

  /**
   * Updates the time window used for state stabilization
   *
   * @param timeWindow - New time window in milliseconds
   */
  setTimeWindow(timeWindow: number) {
    this.timeWindow = timeWindow;
  }

  /**
   * Creates a new FeedbackStabilizer instance.
   *
   * @param uiStateMap - Map of all possible UI states and their configurations
   * @param initialKey - Key of the initial UI state to display
   * @param timeWindow - Optional custom time window (in ms) for state averaging
   * @param decayRate - Optional custom decay rate for event weights
   */
  constructor(
    uiStateMap: SdkSpecificStateMap,
    initialKey: StateKey<SdkSpecificStateMap>,
    timeWindow?: number,
    decayRate?: number,
  ) {
    this.uiStateMap = uiStateMap;
    this.initialKey = initialKey;
    this.currentKey = initialKey;

    if (timeWindow) {
      this.timeWindow = timeWindow;
    }
    if (decayRate) {
      this.decayRate = decayRate;
    }
  }

  /**
   * Resets the stabilizer to its initial state.
   *
   * @param currentKey - resets the stabilizer with a different key
   * than the one it was initialized with. Does not mutate `this.initialKey`
   */
  reset(currentKey?: StateKey<SdkSpecificStateMap>) {
    const key = currentKey ?? this.initialKey;
    this.eventQueue = [];
    this.singleEventQueue = [];
    this.summedScores = {};
    this.scoreBoard = {};
    this.currentKey = key;
    this.currentStateStartTime = performance.now();
  }

  /**
   * Restarts the minimum-duration timer for the current state.
   * Useful when a state should be timed from an external lifecycle point
   * (e.g. actual capture start) instead of construction/reset time.
   */
  restartCurrentStateTimer() {
    this.currentStateStartTime = performance.now();
  }

  /**
   * Checks if enough time has passed to show a new UI state
   *
   * @returns true if the current state's minimum duration has elapsed
   */
  canShowNewUiState = () => {
    return (
      performance.now() - this.currentStateStartTime >=
      this.currentState.minDuration
    );
  };

  /**
   * Retrieves the remaining time for the current state to satisfy its minimum duration.
   * @returns Remaining time in milliseconds.
   */
  getRemainingDuration() {
    const elapsedTime = performance.now() - this.currentStateStartTime;
    return Math.max(this.currentState.minDuration - elapsedTime, 0);
  }

  /**
   * Creates a UI state event and enqueues it for later processing.
   *
   * Regular states go to `eventQueue` and take part in weighted stabilization.
   * States marked with `singleEmit` go to `singleEventQueue` and are emitted
   * once the current state satisfies its minimum duration.
   *
   * @param incomingUiStateKey - Key of the incoming UI state event.
   */
  private enqueueEvent(incomingUiStateKey: StateKey<SdkSpecificStateMap>) {
    const now = performance.now();

    const initialWeight = this.uiStateMap[incomingUiStateKey].initialWeight;

    // create new event
    const uiStateEvent: UiStateEvent<StateKey<SdkSpecificStateMap>> = {
      key: incomingUiStateKey,
      timeStamp: now,
      currentWeight: initialWeight ?? 1,
      singleEmit: this.uiStateMap[incomingUiStateKey].singleEmit,
    };

    // add events to their respective queues
    // single emitted events are placed in a different queue and emitted once the previous event is done
    if (uiStateEvent.singleEmit) {
      const isDuplicateSingleEmit =
        this.currentKey === uiStateEvent.key ||
        this.singleEventQueue.some((event) => event.key === uiStateEvent.key);
      if (isDuplicateSingleEmit) {
        console.warn(
          `${uiStateEvent.key} added multiple times to the FeedbackStabilizer single event queue. Should not happen.`,
        );
        return;
      }

      this.singleEventQueue.push(uiStateEvent);
    } else {
      this.eventQueue.push(uiStateEvent);
    }
  }

  /**
   * Enqueues a new UI state event to be considered on the next `tick()`.
   *
   * @param incomingUiStateKey - Key of the new UI state event
   */
  ingest(incomingUiStateKey: StateKey<SdkSpecificStateMap>): void {
    this.enqueueEvent(incomingUiStateKey);
  }

  /**
   * Advances stabilizer time and returns the state that should be displayed.
   *
   * This method:
   * 1. Handles single-emit events that bypass normal stabilization
   * 2. Maintains a time-windowed queue of regular events
   * 3. Applies temporal averaging with decay to determine the winning state
   *
   * @returns The UI state that should be displayed.
   */
  tick(): SdkSpecificStateMap[StateKey<SdkSpecificStateMap>] {
    const now = performance.now();

    // if the singleEventQueue has events, prioritize those
    if (this.singleEventQueue.length > 0 && this.canShowNewUiState()) {
      const singleEvent = this.singleEventQueue.shift();

      if (!singleEvent) {
        throw new Error("singleEventQueue is empty, should not happen.");
      }

      // clear the queue of regular events
      this.eventQueue = [];
      // early exit, no need to calculate the state
      this.currentKey = singleEvent.key;
      this.currentStateStartTime = now;
      return this.uiStateMap[singleEvent.key];
    }

    // set up the scoreboard for current stack iteration
    this.scoreBoard = {};

    // Compact in place and score in one pass to avoid mutating while iterating.
    let writeIdx = 0;
    for (let readIdx = 0; readIdx < this.eventQueue.length; readIdx++) {
      const eventInQueue = this.eventQueue[readIdx];
      if (!eventInQueue) {
        continue;
      }

      // skip events outside of time window
      if (now - eventInQueue.timeStamp > this.timeWindow) {
        continue;
      }

      // keep in queue
      this.eventQueue[writeIdx] = eventInQueue;
      writeIdx++;

      const relativeTime = eventInQueue.timeStamp / now;

      // Decay weight based on time, not only index.
      eventInQueue.currentWeight *= this.decayRate * relativeTime;

      // prefill board
      if (!this.scoreBoard[eventInQueue.key]) {
        this.scoreBoard[eventInQueue.key] = [];
      }

      // push the score on the current track
      this.scoreBoard[eventInQueue.key]!.push(eventInQueue.currentWeight); // we know it's not empty
    }

    // remove dropped events from queue tail
    this.eventQueue.length = writeIdx;

    // Return same state if under minimum duration
    if (!this.canShowNewUiState()) {
      return this.uiStateMap[this.currentKey];
    }

    // We use this record to sum individual tracks
    this.summedScores = {};

    // score board is full, pick a winning state
    for (const trackKey in this.scoreBoard) {
      const track = this.scoreBoard[trackKey];

      if (!track) {
        throw new Error("no track - SHOULD NOT HAPPEN");
      }

      if (!this.scoreBoard[trackKey]) {
        throw new Error("no score board for key");
      }

      const relativeAmount = track.length / this.eventQueue.length;

      const summedTrackScores = this.scoreBoard[trackKey].reduce(
        (partialSum, a) => partialSum + a,
        0,
      );

      this.summedScores[trackKey] = summedTrackScores * relativeAmount;
    }

    // defensive fallback
    if (Object.keys(this.summedScores).length === 0) {
      return this.uiStateMap[this.currentKey];
    }

    const winningKey = getKeyWithHighestValue(
      this.summedScores,
    ) as StateKey<SdkSpecificStateMap>;

    const winningState = this.uiStateMap[winningKey];

    // start tracking time if it's a different state
    if (winningState.key !== this.currentKey) {
      this.currentKey = winningKey;
      this.currentStateStartTime = now;
    }

    return winningState as SdkSpecificStateMap[StateKey<SdkSpecificStateMap>];
  }

  /**
   * Processes a new UI state event and determines the state to display.
   *
   * This method:
   * 1. Handles single-emit events that bypass normal stabilization
   * 2. Maintains a time-windowed queue of regular events
   * 3. Applies temporal averaging with decay to determine the winning state
   *
   * @param incomingUiStateKey - Key of the new UI state event
   * @returns The UI state that should be displayed.
   */
  getNewUiState(
    incomingUiStateKey: StateKey<SdkSpecificStateMap>,
  ): SdkSpecificStateMap[StateKey<SdkSpecificStateMap>] {
    this.ingest(incomingUiStateKey);
    return this.tick();
  }
}
