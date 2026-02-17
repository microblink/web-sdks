/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Copyright (c) Microblink. All rights reserved.
 *
 * AUTO-GENERATED FILE!!! DO NOT MODIFY!!!
 *
 * ANY UNAUTHORIZED USE OR SALE, DUPLICATION, OR DISTRIBUTION
 * OF THIS PROGRAM OR ANY OF ITS PARTS, IN SOURCE OR BINARY FORMS,
 * WITH OR WITHOUT MODIFICATION, WITH THE PURPOSE OF ACQUIRING
 * UNLAWFUL MATERIAL OR ANY OTHER BENEFIT IS PROHIBITED!
 * THIS PROGRAM IS PROTECTED BY COPYRIGHT LAWS AND YOU MAY NOT
 * REVERSE ENGINEER, DECOMPILE, OR DISASSEMBLE IT.
 */

import type { PingBase } from "./ping.base";

export type PingBrowserDeviceInfoData = {
  userAgentData?: UserAgentData;
  userAgent: string;
  threads: number;
  memory?: number;
  gpu?: Gpu;
  screen: Screen;
  browserStorageSupport: BrowserStorageSupport;
  derivedDeviceInfo: DerivedDeviceInfo;
};
type UserAgentData = {
  brands?: BrandsItem[];
  mobile?: boolean;
  platform?: string;
  architecture?: string;
  bitness?: string;
  formFactors?: FormFactorsItem[];
  model?: string;
  platformVersion?: string;
  fullVersionList?: FullVersionListItem[];
  wow64?: boolean;
};
type Gpu = {
  renderer: string;
  shadingLanguageVersion: string;
  vendor: string;
  version: string;
};
type Screen = {
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  physicalScreenWidth: number;
  physicalScreenHeight: number;
  maxTouchPoints: number;
};
type BrowserStorageSupport = {
  cookieEnabled: boolean;
  localStorageEnabled: boolean;
};
type DerivedDeviceInfo = {
  model: string;
  formFactors: FormFactorsItem[];
  platform: string;
  browser: Browser;
};
type BrandsItem = {
  brand: string;
  version: string;
};
type FullVersionListItem = {
  brand: string;
  version: string;
};
type Browser = {
  brand: string;
  version: string;
};
type FormFactorsItem =
  | "Desktop"
  | "Automotive"
  | "Mobile"
  | "Tablet"
  | "XR"
  | "EInk"
  | "Watch";

/**
 * Ping type for ping.browser.device.info
 */
export type PingBrowserDeviceInfo = PingBase<
  "ping.browser.device.info",
  "1.0.0",
  PingBrowserDeviceInfoData
>;
