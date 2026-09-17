/**
 * Copyright (c) Microblink. All rights reserved.
 *
 * AUTO-GENERATED FILE!!! DO NOT MODIFY!!!
 *
 * ANY UNAUTHORIZED USE OR SALE, DUPLICATION, OR DISTRIBUTION OF THIS PROGRAM OR ANY OF ITS PARTS, IN SOURCE OR BINARY
 * FORMS, WITH OR WITHOUT MODIFICATION, WITH THE PURPOSE OF ACQUIRING UNLAWFUL MATERIAL OR ANY OTHER BENEFIT IS
 * PROHIBITED! THIS PROGRAM IS PROTECTED BY COPYRIGHT LAWS AND YOU MAY NOT REVERSE ENGINEER, DECOMPILE, OR DISASSEMBLE
 * IT.
 */

import type { PingBase } from "./ping.base";

export type PingUploadData = {
  sessionId: string;
  eventType: EventType;
  durationMs?: number;
  payloadBytes?: number;
  errorCategory?: string;
  retryCount?: number;
};
type EventType = "Initialized" | "Completed" | "Failed" | "RetryInitialized" | "Cancelled";

/** Ping type for ping.sdk.upload */
export type PingUpload = PingBase<"ping.sdk.upload", "1.0.0", PingUploadData>;
