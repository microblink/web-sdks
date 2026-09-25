/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

export type * from "./BiometricsWorker";
export { BiometricsWorkerLoadError } from "./BiometricsWorker";
export type * from "./BiometricsWorkerApi";

import { expose } from "comlink";

import { BiometricsWorkerApi } from "./BiometricsWorkerApi";

expose(new BiometricsWorkerApi());
