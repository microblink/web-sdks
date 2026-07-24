/**
 * Copyright (c) Microblink. All rights reserved.
 *
 * ANY UNAUTHORIZED USE OR SALE, DUPLICATION, OR DISTRIBUTION
 * OF THIS PROGRAM OR ANY OF ITS PARTS, IN SOURCE OR BINARY FORMS,
 * WITH OR WITHOUT MODIFICATION, WITH THE PURPOSE OF ACQUIRING
 * UNLAWFUL MATERIAL OR ANY OTHER BENEFIT IS PROHIBITED!
 * THIS PROGRAM IS PROTECTED BY COPYRIGHT LAWS AND YOU MAY NOT
 * REVERSE ENGINEER, DECOMPILE, OR DISASSEMBLE IT.
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
