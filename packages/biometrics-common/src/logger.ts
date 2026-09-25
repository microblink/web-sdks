/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

export type LogLevel = "debug" | "warn" | "error" | "silent";

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  warn: 1,
  error: 2,
  silent: 3,
};

export type Logger = {
  debug: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

function shouldLog(configured: LogLevel, requested: LogLevel): boolean {
  if (configured === "silent") {
    return false;
  }

  return LOG_LEVEL_PRIORITY[configured] <= LOG_LEVEL_PRIORITY[requested];
}

export function createLogger(namespace: string, level: LogLevel = "warn"): Logger {
  const prefix = `[${namespace}]`;

  return {
    debug: (...args: unknown[]) => {
      if (shouldLog(level, "debug")) {
        console.debug(prefix, ...args);
      }
    },
    warn: (...args: unknown[]) => {
      if (shouldLog(level, "warn")) {
        console.warn(prefix, ...args);
      }
    },
    error: (...args: unknown[]) => {
      if (shouldLog(level, "error")) {
        console.error(prefix, ...args);
      }
    },
  };
}
