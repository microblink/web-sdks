/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import type { Mock } from "vitest";
import { vi } from "vitest";

type Promisable<T> = T | Promise<T>;

type SharedProcess<TProcessResult> = (
  image: ImageData,
) => Promisable<TProcessResult>;
type SharedGetSettings<TSettings> = () => Promisable<TSettings>;
type SharedGetResult<TResult> = () => Promisable<TResult>;
type SharedResolveCurrentStep = () => Promisable<void>;
type SharedGetScanningStatus<TScanningStatus> =
  () => Promisable<TScanningStatus>;

export type FakeScanningSession<
  TProcessResult = unknown,
  TSettings = unknown,
  TResult = unknown,
  TScanningStatus = unknown,
> = {
  process: Mock<SharedProcess<TProcessResult>>;
  getSettings: Mock<SharedGetSettings<TSettings>>;
  getResolvedSessionSettings: Mock<SharedGetSettings<TSettings>>;
  showDemoOverlay: Mock<() => Promisable<boolean>>;
  showProductionOverlay: Mock<() => Promisable<boolean>>;
  getResult: Mock<SharedGetResult<TResult>>;
  resolveCurrentStep: Mock<SharedResolveCurrentStep>;
  getScanningStatus: Mock<SharedGetScanningStatus<TScanningStatus>>;
  ping: Mock<(ping: unknown) => Promisable<void>>;
  sendPinglets: Mock<() => Promisable<void>>;
  reset: Mock<() => Promisable<void>>;
  delete: Mock<() => Promisable<void>>;
  deleteLater: Mock<() => void>;
  isAliasOf: Mock<(otherSession: unknown) => boolean>;
  isDeleted: Mock<() => Promisable<boolean>>;
};

export type CreateFakeScanningSessionOptions<
  TProcessResult = unknown,
  TSettings = unknown,
  TResult = unknown,
  TScanningStatus = unknown,
  TExtra extends Record<string, unknown> = Record<string, never>,
> = {
  processResult?: TProcessResult;
  settings?: TSettings;
  resolvedSettings?: TSettings;
  result?: TResult;
  scanningStatus?: TScanningStatus;
  showDemoOverlay?: boolean;
  showProductionOverlay?: boolean;
  isDeleted?: boolean;
  overrides?: Partial<
    FakeScanningSession<TProcessResult, TSettings, TResult, TScanningStatus>
  >;
  extra?: TExtra;
};

export const createFakeScanningSession = <
  TProcessResult = unknown,
  TSettings = unknown,
  TResult = unknown,
  TScanningStatus = unknown,
  TExtra extends Record<string, unknown> = Record<string, never>,
>(
  options: CreateFakeScanningSessionOptions<
    TProcessResult,
    TSettings,
    TResult,
    TScanningStatus,
    TExtra
  > = {},
): FakeScanningSession<TProcessResult, TSettings, TResult, TScanningStatus> &
  TExtra => {
  const session: FakeScanningSession<
    TProcessResult,
    TSettings,
    TResult,
    TScanningStatus
  > = {
    process: vi.fn(async () => options.processResult as TProcessResult),
    getSettings: vi.fn(async () => options.settings as TSettings),
    getResolvedSessionSettings: vi.fn(
      async () => options.resolvedSettings as TSettings,
    ),
    showDemoOverlay: vi.fn(async () => options.showDemoOverlay ?? false),
    showProductionOverlay: vi.fn(
      async () => options.showProductionOverlay ?? false,
    ),
    getResult: vi.fn(async () => options.result as TResult),
    resolveCurrentStep: vi.fn(async () => undefined),
    getScanningStatus: vi.fn(
      async () => options.scanningStatus as TScanningStatus,
    ),
    ping: vi.fn(async () => undefined),
    sendPinglets: vi.fn(async () => undefined),
    reset: vi.fn(async () => undefined),
    delete: vi.fn(async () => undefined),
    deleteLater: vi.fn(),
    isAliasOf: vi.fn(() => false),
    isDeleted: vi.fn(async () => options.isDeleted ?? false),
  };

  return {
    ...session,
    ...options.overrides,
    ...(options.extra ?? ({} as TExtra)),
  };
};
