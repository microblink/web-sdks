/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

export type BiometricsWorkerLifecycleErrorReason = "not-initialized" | "initializing" | "no-active-session" | "closed";

export class BiometricsWorkerLifecycleError extends Error {
  readonly reason: BiometricsWorkerLifecycleErrorReason;

  constructor(reason: BiometricsWorkerLifecycleErrorReason) {
    super(`Biometrics worker lifecycle error: ${reason}`);
    this.name = "BiometricsWorkerLifecycleError";
    this.reason = reason;
  }
}
