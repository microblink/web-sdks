/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

export type TimeoutDuration = number | null;

export type ProgressTimerStatus = "disabled" | "idle" | "running" | "paused";

export type ProgressTimerState = {
  /** Configured timeout duration in milliseconds. */
  configuredMs: TimeoutDuration;
  /** Remaining timeout duration in milliseconds. */
  remainingMs: TimeoutDuration;
  /** Whether this timer is idle, actively counting down, or paused. */
  status: ProgressTimerStatus;
};

type TimerKey<TConfiguration> = Extract<keyof TConfiguration, string>;

type TimeoutConfigurationShape<TConfiguration> = {
  [TKey in keyof TConfiguration]: TimeoutDuration;
};

type TimeoutCallbackName<TKey> = TKey extends string
  ? TKey extends `${infer TName}Ms`
    ? `on${Capitalize<TName>}`
    : never
  : never;

type TimeoutCallbacks<TConfiguration> = {
  [TKey in TimerKey<TConfiguration> as TimeoutCallbackName<TKey>]: () => void;
};

type TimeoutTimerState = {
  remainingMs: TimeoutDuration;
  startedAt?: number;
  timeoutId?: number;
  status: Exclude<ProgressTimerStatus, "disabled">;
};

type TimeoutHandlerOptions<TConfiguration extends TimeoutConfigurationShape<TConfiguration>> = {
  defaults: TConfiguration;
  configuration?: Partial<TConfiguration>;
  onTimeout: TimeoutCallbacks<TConfiguration>;
};

type TimerStates<TConfiguration> = Record<TimerKey<TConfiguration>, TimeoutTimerState>;

/** Manages independently configurable UX timeouts and their pause/resume state. */
export class UxTimeoutHandler<TConfiguration extends TimeoutConfigurationShape<TConfiguration>> {
  #configuration: TConfiguration;
  readonly #onTimeout: TimeoutCallbacks<TConfiguration>;
  readonly #timerStates: TimerStates<TConfiguration>;

  constructor(options: TimeoutHandlerOptions<TConfiguration>) {
    this.#validateConfiguration(options.configuration);
    this.#configuration = this.#mergeConfiguration(options.defaults, options.configuration);
    this.#onTimeout = options.onTimeout;
    this.#timerStates = this.#createTimerStates();
  }

  /** Returns a copy of the active timeout configuration. */
  getConfiguration(): TConfiguration {
    return { ...this.#configuration };
  }

  /** Merges timeout configuration updates and resets all timers. */
  setConfiguration(configuration: Partial<TConfiguration>): void {
    this.#validateConfiguration(configuration);
    this.#configuration = this.#mergeConfiguration(this.#configuration, configuration);
    this.resetAll();
  }

  /** Returns the configured duration, live remaining duration, and status for a timer. */
  getTimerState(key: TimerKey<TConfiguration>): ProgressTimerState {
    const configuredMs = this.#configuration[key];
    const timerState = this.#timerStates[key];
    const remainingMs = this.#getRemainingMs(timerState);

    return {
      configuredMs,
      remainingMs: remainingMs === null ? null : Math.ceil(remainingMs),
      status: configuredMs === null ? "disabled" : timerState.status,
    };
  }

  /** Starts a timer from its configured duration. */
  start(key: TimerKey<TConfiguration>): void {
    this.reset(key);

    const timerState = this.#timerStates[key];
    if (timerState.remainingMs === null) {
      return;
    }

    this.#schedule(key, timerState);
  }

  /** Pauses a running timer and preserves its remaining duration. */
  pause(key: TimerKey<TConfiguration>): void {
    const timerState = this.#timerStates[key];
    if (timerState.status !== "running") {
      return;
    }

    timerState.remainingMs = this.#getRemainingMs(timerState);
    this.#clearTimeout(timerState);
    timerState.status = "paused";
  }

  /** Resumes a paused timer from its remaining duration. */
  resume(key: TimerKey<TConfiguration>): void {
    const timerState = this.#timerStates[key];
    if (timerState.status !== "paused" || timerState.remainingMs === null) {
      return;
    }

    this.#schedule(key, timerState);
  }

  /** Clears a timer and restores it to its configured duration. */
  reset(key: TimerKey<TConfiguration>): void {
    const timerState = this.#timerStates[key];
    this.#clearTimeout(timerState);
    timerState.remainingMs = this.#configuration[key];
    timerState.status = "idle";
  }

  /** Resets every configured timer. */
  resetAll(): void {
    for (const key of this.#getConfigurationKeys()) {
      this.reset(key);
    }
  }

  /** Immediately invokes a timer's timeout callback. */
  trigger(key: TimerKey<TConfiguration>): void {
    const timerState = this.#timerStates[key];
    this.#clearTimeout(timerState);
    timerState.remainingMs = this.#configuration[key] === null ? null : 0;
    timerState.status = "idle";
    this.#invokeTimeout(key);
  }

  #mergeConfiguration(base: TConfiguration, configuration?: Partial<TConfiguration>): TConfiguration {
    if (!configuration) {
      return { ...base };
    }

    return Object.fromEntries(
      this.#getKeys(base).map((key) => [key, configuration[key] === undefined ? base[key] : configuration[key]]),
    ) as unknown as TConfiguration;
  }

  #validateConfiguration(configuration?: Partial<TConfiguration>): void {
    if (!configuration) {
      return;
    }

    for (const [key, duration] of Object.entries(configuration)) {
      if (duration === undefined || duration === null) {
        continue;
      }

      if (typeof duration !== "number" || !Number.isFinite(duration) || duration <= 0) {
        throw new Error(`${key} must be greater than 0`);
      }
    }
  }

  #getKeys(configuration: TConfiguration): TimerKey<TConfiguration>[] {
    return Object.keys(configuration) as TimerKey<TConfiguration>[];
  }

  #getConfigurationKeys(): TimerKey<TConfiguration>[] {
    return this.#getKeys(this.#configuration);
  }

  #createTimerStates(): TimerStates<TConfiguration> {
    const timerStates = {} as TimerStates<TConfiguration>;

    for (const key of this.#getConfigurationKeys()) {
      timerStates[key] = {
        remainingMs: this.#configuration[key],
        status: "idle",
      };
    }

    return timerStates;
  }

  #getRemainingMs(timerState: TimeoutTimerState): TimeoutDuration {
    if (timerState.remainingMs === null) {
      return null;
    }

    if (timerState.status !== "running" || timerState.startedAt === undefined) {
      return Math.max(timerState.remainingMs, 0);
    }

    return Math.max(timerState.remainingMs - (performance.now() - timerState.startedAt), 0);
  }

  #schedule(key: TimerKey<TConfiguration>, timerState: TimeoutTimerState): void {
    timerState.startedAt = performance.now();
    timerState.status = "running";
    timerState.timeoutId = window.setTimeout(() => {
      timerState.timeoutId = undefined;
      timerState.startedAt = undefined;
      timerState.remainingMs = 0;
      timerState.status = "idle";
      this.#invokeTimeout(key);
    }, timerState.remainingMs ?? 0);
  }

  #clearTimeout(timerState: TimeoutTimerState): void {
    if (timerState.timeoutId !== undefined) {
      window.clearTimeout(timerState.timeoutId);
      timerState.timeoutId = undefined;
    }

    timerState.startedAt = undefined;
  }

  #invokeTimeout(key: TimerKey<TConfiguration>): void {
    const timeoutName = key.endsWith("Ms") ? key.slice(0, -2) : key;
    const callbackName = `on${timeoutName.charAt(0).toUpperCase()}${timeoutName.slice(1)}` as TimeoutCallbackName<
      TimerKey<TConfiguration>
    >;

    const callbacks = this.#onTimeout as unknown as Record<string, () => void>;
    callbacks[callbackName]();
  }
}
