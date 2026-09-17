/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import type { Mock } from "vitest";
import { vi } from "vitest";

type Promisable<T> = T | Promise<T>;

type SharedProcess<TProcessResult> = (image: ImageData) => Promisable<TProcessResult>;
type SharedGetSettings<TSettings> = () => Promisable<TSettings>;
type SharedGetResult<TResult> = () => Promisable<TResult>;
type SharedResolveCurrentStep = () => Promisable<void>;
type SharedGetScanningStatus<TScanningStatus> = () => Promisable<TScanningStatus>;

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
  overrides?: Partial<FakeScanningSession<TProcessResult, TSettings, TResult, TScanningStatus>>;
  extra?: TExtra;
};

export const createFakeScanningSession = <
  TProcessResult = unknown,
  TSettings = unknown,
  TResult = unknown,
  TScanningStatus = unknown,
  TExtra extends Record<string, unknown> = Record<string, never>,
>(
  options: CreateFakeScanningSessionOptions<TProcessResult, TSettings, TResult, TScanningStatus, TExtra> = {},
): FakeScanningSession<TProcessResult, TSettings, TResult, TScanningStatus> & TExtra => {
  const session: FakeScanningSession<TProcessResult, TSettings, TResult, TScanningStatus> = {
    process: vi.fn(() => Promise.resolve(options.processResult as TProcessResult)),
    getSettings: vi.fn(() => Promise.resolve(options.settings as TSettings)),
    getResolvedSessionSettings: vi.fn(() => Promise.resolve(options.resolvedSettings as TSettings)),
    showDemoOverlay: vi.fn(() => Promise.resolve(options.showDemoOverlay ?? false)),
    showProductionOverlay: vi.fn(() => Promise.resolve(options.showProductionOverlay ?? false)),
    getResult: vi.fn(() => Promise.resolve(options.result as TResult)),
    resolveCurrentStep: vi.fn(() => Promise.resolve()),
    getScanningStatus: vi.fn(() => Promise.resolve(options.scanningStatus as TScanningStatus)),
    ping: vi.fn(() => Promise.resolve()),
    sendPinglets: vi.fn(() => Promise.resolve()),
    reset: vi.fn(() => Promise.resolve()),
    delete: vi.fn(() => Promise.resolve()),
    deleteLater: vi.fn(),
    isAliasOf: vi.fn(() => false),
    isDeleted: vi.fn(() => Promise.resolve(options.isDeleted ?? false)),
  };

  return {
    ...session,
    ...options.overrides,
    ...(options.extra ?? ({} as TExtra)),
  };
};
