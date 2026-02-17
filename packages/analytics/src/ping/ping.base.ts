/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { SchemaName } from "./Ping";

type Semver =
  | `${number}.${number}.${number}`
  | `${number}.${number}.${number}-${string}`;

/** Generated base structure for a ping event. */
export interface PingBase<
  TSchemaName extends SchemaName,
  TSchemaVersion extends Semver = "1.0.0",
  TData extends object = {},
  TSessionNumber extends number = number,
> {
  schemaName: TSchemaName;
  schemaVersion: TSchemaVersion;
  data: TData;
  sessionNumber?: TSessionNumber;
}
