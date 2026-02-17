/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Error thrown when server permission request fails
 */
export class ServerPermissionError extends Error {
  code = "SERVER_PERMISSION_ERROR";

  constructor(message: string) {
    super(message);
    this.name = "ServerPermissionError";
  }
}

/**
 * Error thrown when license unlock fails
 */
export class LicenseError extends Error {
  code = "LICENSE_ERROR";

  constructor(message: string) {
    super(message);
    this.name = "LicenseError";
  }
}
